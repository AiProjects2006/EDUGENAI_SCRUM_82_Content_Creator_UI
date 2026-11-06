const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const COURSE_SERVICE_URL = import.meta.env.VITE_COURSE_SERVICE_URL || 'http://localhost:8082';
const STORAGE_KEY = 'modules';

const INITIAL_DEFAULT_MODULES = [];

const isJwtToken = (tok) => {
  return typeof tok === 'string' && tok.split('.').length === 3;
};

// Helper for cross-tab / cross-window sync
const broadcastChange = (type, payload) => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('edugenai_channel');
      channel.postMessage({ type, payload });
      channel.close();
    }
  } catch (_) {}
};

/**
 * Deduplicate modules by moduleId AND (courseId + title) so no module appears more than once.
 */
export const deduplicateModules = (modules = []) => {
  if (!Array.isArray(modules)) return [];
  const seenIds = new Set();
  const seenCourseTitle = new Set();
  const result = [];

  for (const m of modules) {
    if (!m) continue;
    const mId = Number(m.moduleId || m.id);
    const cId = Number(m.courseId || 0);
    const title = (m.title || m.name || '').trim();
    const titleKey = `${cId}_${title.toLowerCase()}`;

    if (mId && seenIds.has(String(mId))) continue;
    if (title && seenCourseTitle.has(titleKey)) continue;

    if (mId) seenIds.add(String(mId));
    if (title) seenCourseTitle.add(titleKey);

    result.push({
      ...m,
      moduleId: mId || Date.now(),
      id: mId || Date.now(),
      courseId: cId,
      title: title || `Module ${mId || 1}`,
      description: m.description || '',
      createdAt: m.createdAt || new Date().toISOString()
    });
  }

  return result;
};

export const getStoredModules = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return deduplicateModules(parsed);
      }
    }
  } catch (e) {
    console.error('Failed reading modules from localStorage:', e);
  }
  return [];
};

export const saveStoredModules = (modules) => {
  try {
    const deduped = deduplicateModules(modules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    broadcastChange('MODULES_UPDATED', deduped);
  } catch (e) {
    console.error('Failed saving modules to localStorage:', e);
  }
};

const request = async (path, options = {}) => {
  const rawToken = localStorage.getItem('access_token') || localStorage.getItem('token');
  const token = isJwtToken(rawToken) ? rawToken : null;
  const isMutation = options.method && options.method.toUpperCase() !== 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(isMutation && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // 1. Try Gateway
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
      ...options,
      headers
    });

    if (res.status === 401 && headers.Authorization) {
      const retryHeaders = { ...headers };
      delete retryHeaders.Authorization;
      res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
        ...options,
        headers: retryHeaders
      });
    }

    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
    if (isMutation && res.status < 500) {
      const errJson = await res.json().catch(() => null);
      throw new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
    }
  } catch (err) {
    if (isMutation && !err.message?.includes('Failed to fetch') && !err.message?.includes('NetworkError')) {
      throw err;
    }
  }

  // 2. Try Direct Course Service (port 8082)
  try {
    let res = await fetch(`${COURSE_SERVICE_URL}/api/v1${path}`, {
      ...options,
      headers
    });

    if (res.status === 401 && headers.Authorization) {
      const retryHeaders = { ...headers };
      delete retryHeaders.Authorization;
      res = await fetch(`${COURSE_SERVICE_URL}/api/v1${path}`, {
        ...options,
        headers: retryHeaders
      });
    }

    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (_) {}

  throw new Error(`Request to ${path} could not reach service`);
};

// Fetch all modules
export const fetchAllModules = async () => {
  let apiModules = [];
  try {
    const modules = await request('/modules');
    if (Array.isArray(modules) && modules.length > 0) {
      apiModules = modules.map(m => ({
        moduleId: Number(m.moduleId || m.id),
        id: Number(m.moduleId || m.id),
        courseId: Number(m.courseId),
        title: m.title || m.name,
        description: m.description || '',
        createdAt: m.createdAt || new Date().toISOString()
      }));
    }
  } catch (err) {
    console.warn('Using cached modules:', err.message);
  }

  const stored = getStoredModules();
  // Merge API modules with stored local modules and deduplicate without re-broadcasting on read
  const merged = deduplicateModules([...stored, ...apiModules]);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
};

// Fetch modules for a specific course
export const fetchCourseModules = async (courseId) => {
  const cId = Number(courseId);
  try {
    const all = await fetchAllModules();
    return cId ? all.filter(m => Number(m.courseId) === cId) : all;
  } catch (err) {
    console.warn('Failed fetching course modules:', err.message);
    const cached = getStoredModules();
    return cId ? cached.filter(m => Number(m.courseId) === cId) : cached;
  }
};

// Create a new module (or update once if matching module title exists for this course)
export const createModuleAPI = async (title, description, courseId, courseTitle = '') => {
  const cId = Number(courseId);
  const cleanTitle = title.trim();
  const cleanDesc = description ? description.trim() : '';

  // Check if a module with the same title already exists for this course
  const currentModules = getStoredModules();
  const existing = currentModules.find(
    m => ((cId && Number(m.courseId) === cId) || (courseTitle && m.courseTitle && m.courseTitle.trim().toLowerCase() === courseTitle.trim().toLowerCase())) &&
         (m.title || m.name || '').trim().toLowerCase() === cleanTitle.toLowerCase()
  );

  if (existing) {
    return updateModuleAPI(existing.moduleId || existing.id, cleanTitle, cleanDesc);
  }

  const localModule = {
    moduleId: Date.now(),
    id: Date.now(),
    title: cleanTitle,
    description: cleanDesc,
    courseId: cId,
    courseTitle: courseTitle || '',
    createdAt: new Date().toISOString()
  };

  try {
    const created = await request('/modules', {
      method: 'POST',
      body: JSON.stringify({
        title: localModule.title,
        description: localModule.description,
        courseId: cId
      })
    });
    if (created && (created.moduleId || created.id)) {
      const serverId = Number(created.moduleId || created.id);
      localModule.moduleId = serverId;
      localModule.id = serverId;
    }
  } catch (err) {
    console.warn('Failed creating module via API, saved locally:', err.message);
  }

  const modules = getStoredModules();
  const updated = deduplicateModules([localModule, ...modules]);
  saveStoredModules(updated);

  return localModule;
};

// Update a module
export const updateModuleAPI = async (moduleId, title, description) => {
  const mId = Number(moduleId);
  const cleanTitle = title.trim();
  const cleanDesc = description ? description.trim() : '';

  try {
    await request(`/modules/${mId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: cleanTitle,
        description: cleanDesc
      })
    });
  } catch (err) {
    console.warn('Failed updating module via API, updating locally:', err.message);
  }

  const modules = getStoredModules();
  const idx = modules.findIndex(m => Number(m.moduleId || m.id) === mId);
  if (idx !== -1) {
    modules[idx] = {
      ...modules[idx],
      title: cleanTitle,
      description: cleanDesc,
      updatedAt: new Date().toISOString()
    };
    saveStoredModules(modules);
    return modules[idx];
  }

  // If not found by ID, look by title
  const titleIdx = modules.findIndex(
    m => (m.title || m.name || '').trim().toLowerCase() === cleanTitle.toLowerCase()
  );
  if (titleIdx !== -1) {
    modules[titleIdx] = {
      ...modules[titleIdx],
      title: cleanTitle,
      description: cleanDesc,
      updatedAt: new Date().toISOString()
    };
    saveStoredModules(modules);
    return modules[titleIdx];
  }

  throw new Error('Module not found to update');
};

// Delete a module
export const deleteModuleAPI = async (moduleId) => {
  const mId = Number(moduleId);
  try {
    await request(`/modules/${mId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Failed deleting module via API, removing locally:', err.message);
  }

  const modules = getStoredModules();
  const filtered = modules.filter(m => Number(m.moduleId || m.id) !== mId);
  saveStoredModules(filtered);
  return true;
};
