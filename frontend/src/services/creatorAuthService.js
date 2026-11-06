/**
 * creatorAuthService.js
 * Keycloak OIDC Authentication & EduGenAI User Service Integration for Content Creators
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8090';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'ai-learning-platform';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'edugenai-frontend';
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const USER_SERVICE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

/**
 * Safely parse a base64 encoded JWT payload
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

/**
 * Authenticate Content Creator via Keycloak Direct Access Grant or User Service backend
 */
export async function loginCreator({ usernameOrEmail, password }) {
  if (!usernameOrEmail || !password) {
    throw new Error('Please enter both your email/username and password.');
  }

  const cleanUser = usernameOrEmail.trim();
  let tokenData = null;
  let decodedToken = null;

  // 1. Direct Grant to Keycloak OIDC endpoint (:8090)
  try {
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', KEYCLOAK_CLIENT_ID);
    params.append('username', cleanUser);
    params.append('password', password);
    params.append('scope', 'openid profile email');

    const kcResp = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (kcResp.ok) {
      tokenData = await kcResp.json();
      decodedToken = parseJwtPayload(tokenData.access_token);
    } else {
      const errBody = await kcResp.json().catch(() => ({}));
      if (errBody.error === 'invalid_grant') {
        throw new Error('Invalid username/email or password.');
      }
    }
  } catch (kcErr) {
    if (kcErr.message.includes('Invalid username/email')) {
      throw kcErr;
    }
    console.warn('Keycloak direct grant unreachable from browser, falling back to User Service:', kcErr.message);
  }

  // 2. If Keycloak Direct Grant succeeded, verify CONTENT_CREATOR role
  if (tokenData && tokenData.access_token) {
    const roles = decodedToken?.realm_access?.roles || [];
    const isCreator = roles.includes('CONTENT_CREATOR');
    const isStudent = roles.includes('STUDENT');
    const isAdmin = roles.includes('ADMIN');

    if (!isCreator && (isStudent || isAdmin)) {
      const roleName = isStudent ? 'Student' : 'Administrator';
      throw new Error(`This account has the ${roleName} role. Please sign in through the ${roleName} portal.`);
    }

    const creatorUser = {
      username: decodedToken?.preferred_username || cleanUser,
      email: decodedToken?.email || (cleanUser.includes('@') ? cleanUser : `${cleanUser}@creator.edugenai.local`),
      fullName: decodedToken?.name || decodedToken?.preferred_username || cleanUser,
      role: 'CONTENT_CREATOR'
    };

    localStorage.setItem('access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }
    localStorage.setItem('user_role', 'CONTENT_CREATOR');
    localStorage.setItem('current_user', JSON.stringify(creatorUser));

    // Async sync with MySQL in background
    syncSessionWithBackend(tokenData.access_token, tokenData.refresh_token).catch(() => {});

    return {
      success: true,
      token: tokenData.access_token,
      user: creatorUser,
      provider: 'keycloak'
    };
  }

  // 3. Fallback: Authenticate via User Service (:8081) directly or API Gateway (:8087)
  const endpoints = [
    'http://localhost:8081/api/users/login',
    'http://localhost:8081/api/auth/login',
    `${USER_SERVICE_URL.replace(/\/api\/?$/, '')}/api/users/login`,
    `${GATEWAY_URL}/api/users/login`
  ];

  let lastError = null;
  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: cleanUser,
          password: password,
          expectedRole: 'CONTENT_CREATOR'
        })
      });

      if (resp.ok) {
        const body = await resp.json();
        const profile = body.user || {
          username: cleanUser,
          email: cleanUser.includes('@') ? cleanUser : `${cleanUser}@creator.edugenai.com`,
          fullName: cleanUser.split('@')[0],
          role: 'CONTENT_CREATOR'
        };

        const token = body.accessToken || `session_${Date.now()}`;
        localStorage.setItem('access_token', token);
        if (body.refreshToken) {
          localStorage.setItem('refresh_token', body.refreshToken);
        }
        localStorage.setItem('user_role', 'CONTENT_CREATOR');
        localStorage.setItem('current_user', JSON.stringify(profile));

        return {
          success: true,
          token: token,
          user: profile,
          provider: body.authProvider || 'user-service'
        };
      } else {
        const contentType = resp.headers.get('content-type') || '';
        const errText = await resp.text().catch(() => '');

        // If intermediate proxy returns 404 or HTML, continue to next fallback
        if (resp.status === 404 || contentType.includes('text/html') || errText.includes('<html>')) {
          console.warn(`Endpoint ${url} returned ${resp.status} (HTML/404), trying next fallback...`);
          lastError = new Error('Invalid email or password.');
          continue;
        }

        let errMsg = 'Invalid email or password.';
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.message || parsed.error || errMsg;
        } catch (_) {
          if (errText && !errText.includes('<html>')) errMsg = errText;
        }
        lastError = new Error(errMsg);
        break;
      }
    } catch (netErr) {
      lastError = netErr;
    }
  }

  throw lastError || new Error('Invalid email or password. Please verify your credentials.');
}

/**
 * Register a new Content Creator in User Service DB and Keycloak
 */
export async function registerCreator({
  firstName,
  lastName,
  username,
  email,
  password,
  contactNumber,
  skills,
  qualifications,
  experienceYears,
  preferredSubjects,
  portfolioUrl,
  bio
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username?.trim() || cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

  const payload = {
    firstName: firstName?.trim() || 'Content',
    lastName: lastName?.trim() || 'Creator',
    username: cleanUsername,
    email: cleanEmail,
    password: password,
    contactNumber: contactNumber || '0770000000',
    role: 'CONTENT_CREATOR',
    skills: skills || '',
    qualifications: qualifications || '',
    experienceYears: experienceYears ? parseInt(experienceYears, 10) : null,
    preferredSubjects: preferredSubjects || '',
    portfolioUrl: portfolioUrl || '',
    bio: bio || ''
  };

  const endpoints = [
    'http://localhost:8081/api/users/register',
    'http://localhost:8081/api/auth/register',
    `${USER_SERVICE_URL.replace(/\/api\/?$/, '')}/api/users/register`,
    `${GATEWAY_URL}/api/users/register`
  ];

  let lastError = null;
  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (resp.ok) {
        const body = await resp.json().catch(() => ({}));

        const creatorProfile = body.user || {
          username: cleanUsername,
          email: cleanEmail,
          fullName: `${payload.firstName} ${payload.lastName}`.trim(),
          role: 'CONTENT_CREATOR',
          accountStatus: body.accountStatus || 'PENDING_VERIFICATION'
        };

        const isPending = body.accountStatus === 'PENDING_VERIFICATION' || !body.accessToken;

        if (body.accessToken && !isPending) {
          localStorage.setItem('access_token', body.accessToken);
          if (body.refreshToken) {
            localStorage.setItem('refresh_token', body.refreshToken);
          }
          localStorage.setItem('user_role', 'CONTENT_CREATOR');
          localStorage.setItem('current_user', JSON.stringify(creatorProfile));
        }

        return {
          success: true,
          isPendingApproval: isPending,
          accountStatus: body.accountStatus || 'PENDING_VERIFICATION',
          message: body.message || (isPending
            ? 'Content Creator application submitted successfully. Your account is pending administrator approval.'
            : 'Creator registration successful!'),
          user: creatorProfile,
          token: body.accessToken
        };
      } else {
        const contentType = resp.headers.get('content-type') || '';
        const errText = await resp.text().catch(() => '');

        // If intermediate proxy returns 404 or HTML, continue to next fallback
        if (resp.status === 404 || contentType.includes('text/html') || errText.includes('<html>')) {
          console.warn(`Endpoint ${url} returned ${resp.status} (HTML/404), trying next fallback...`);
          lastError = new Error('Registration endpoint not found on proxy.');
          continue;
        }

        let errMsg = 'Registration failed.';
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.message || parsed.error || errMsg;
        } catch (_) {
          if (errText && !errText.includes('<html>')) errMsg = errText;
        }
        lastError = new Error(errMsg);
        break;
      }
    } catch (netErr) {
      lastError = netErr;
    }
  }

  throw lastError || new Error('Unable to connect to registration service. Please verify the backend is running.');
}

/**
 * Sync Keycloak session with backend User DB
 */
async function syncSessionWithBackend(accessToken, refreshToken) {
  const syncUrls = [
    'http://localhost:8081/api/users/keycloak-sync',
    'http://localhost:8081/api/auth/keycloak-sync',
    `${USER_SERVICE_URL.replace(/\/api\/?$/, '')}/api/users/keycloak-sync`,
    `${GATEWAY_URL}/api/users/keycloak-sync`
  ];
  for (const url of syncUrls) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken, expectedRole: 'CONTENT_CREATOR' })
      });
      if (resp.ok) return;
    } catch (_) {}
  }
}

/**
 * Log out Content Creator from Keycloak and local storage
 */
export async function logoutCreator() {
  const refreshToken = localStorage.getItem('refresh_token');

  if (refreshToken) {
    try {
      const logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;
      const params = new URLSearchParams();
      params.append('client_id', KEYCLOAK_CLIENT_ID);
      params.append('refresh_token', refreshToken);

      await fetch(logoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
    } catch (e) {
      console.debug('Background Keycloak logout note:', e.message);
    }
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('current_user');
  sessionStorage.clear();
}

/**
 * Check if a Content Creator is authenticated
 */
export function isCreatorAuthenticated() {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');
  if (!token) return false;
  return role === 'CONTENT_CREATOR' || role === 'ADMIN';
}

/**
 * Retrieve current logged-in creator user object
 */
export function getCurrentCreatorUser() {
  try {
    const raw = localStorage.getItem('current_user');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

/**
 * Return authorization headers for calling backend microservices
 */
export function getCreatorAuthHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default {
  loginCreator,
  registerCreator,
  logoutCreator,
  isCreatorAuthenticated,
  getCurrentCreatorUser,
  getCreatorAuthHeaders,
  parseJwtPayload
};
