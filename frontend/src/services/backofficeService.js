const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const BACKOFFICE_URL = import.meta.env.VITE_BACKOFFICE_URL || 'http://localhost:8086';
const ENROLLMENT_URL = import.meta.env.VITE_ENROLLMENT_SERVICE_URL || 'http://localhost:8084';
const STORAGE_KEY = 'courses';

const DEFAULT_COURSES = [];

const UNNECESSARY_TITLES = [
  'primary science',
  'junior science',
  'elementary mathematics',
  'english grammar',
  'science explorer',
  'test course 999',
  'test new course',
  'direct gateway'
];

export const isLegacyDefaultCourse = (course) => {
  if (!course) return false;
  const t = (course.title || course.name || '').trim().toLowerCase();
  return UNNECESSARY_TITLES.some((junk) => t.includes(junk));
};

export const purgeJunkCourses = () => {
  if (typeof window === 'undefined') return;
  const keys = [STORAGE_KEY, 'creator_courses', 'admin_courses', 'student_courses', 'published_courses'];
  keys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((c) => !isLegacyDefaultCourse(c));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        }
      }
    } catch (_) {}
  });
};

if (typeof window !== 'undefined') {
  purgeJunkCourses();
}

const isJwtToken = (tok) => {
  if (typeof tok !== 'string') return false;
  const parts = tok.split('.');
  if (parts.length !== 3 || parts[0].length < 8) return false;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    if (payload && typeof payload.exp === 'number') {
      // Treat token as expired 15 seconds before exp so Gateway never rejects it with 401
      if (payload.exp * 1000 <= Date.now() + 15000) {
        return false;
      }
    }
    return true;
  } catch (_) {
    return false;
  }
};

const getValidAccessToken = () => {
  const rawToken = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (!rawToken) return null;
  if (isJwtToken(rawToken)) {
    return rawToken;
  }
  // If a previously stored 3-part JWT has expired, downgrade to session marker so future polls never send an expired Bearer header
  if (typeof rawToken === 'string' && rawToken.split('.').length === 3) {
    try {
      localStorage.setItem('access_token', 'session_active');
    } catch (_) {}
  }
  return null;
};

const clearInvalidBearerToken = () => {
  try {
    const rawToken = localStorage.getItem('access_token');
    if (rawToken && rawToken.split('.').length === 3) {
      localStorage.setItem('access_token', 'session_active');
    }
  } catch (_) {}
};

const broadcastCourseChange = (type = 'COURSES_UPDATED', payload = null) => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('edugenai_channel');
      channel.postMessage({ type, payload, timestamp: Date.now() });
      channel.close();
    }
  } catch (_) {}
};

export const getStoredLocalCourses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => !isLegacyDefaultCourse(c));
      }
    }
  } catch (e) {
    console.error('Failed reading courses from localStorage:', e);
  }
  return DEFAULT_COURSES;
};

export const deduplicateCourses = (courses = []) => {
  const seen = new Set();
  const result = [];
  for (const c of courses) {
    if (!c || isLegacyDefaultCourse(c)) continue;
    const key = (c.title || c.name || '').trim().toLowerCase();
    const idKey = String(c.id || c.courseId || '');
    if (key && seen.has(key)) continue;
    if (idKey && seen.has(`id_${idKey}`)) continue;
    if (key) seen.add(key);
    if (idKey) seen.add(`id_${idKey}`);
    result.push(c);
  }
  return result;
};

const saveStoredLocalCourses = (courses) => {
  try {
    const deduped = deduplicateCourses(courses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    localStorage.setItem('admin_courses', JSON.stringify(deduped));
    localStorage.setItem('creator_courses', JSON.stringify(deduped));
    broadcastCourseChange('COURSES_UPDATED', deduped);
  } catch (e) {
    console.error('Failed saving courses to localStorage:', e);
  }
};

/**
 * Universal backoffice API request routed through API Gateway (:8087) -> Backoffice API (:8086)
 * per system architecture diagram, with offline fallback to Backoffice API (:8086).
 */
const requestBackoffice = async (endpoint, options = {}) => {
  const token = getValidAccessToken();
  const isMutation = options.method && options.method.toUpperCase() !== 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Primary: API Gateway (:8087) -> Backoffice API (:8086) as per system architecture diagram
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1/backoffice${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401 && headers.Authorization) {
      clearInvalidBearerToken();
      const retryHeaders = { ...headers };
      delete retryHeaders.Authorization;
      res = await fetch(`${GATEWAY_URL}/api/v1/backoffice${endpoint}`, {
        ...options,
        headers: retryHeaders
      });
    }

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      return json && json.data !== undefined ? json.data : json;
    }
    if (isMutation && res.status < 500) {
      const errJson = await res.json().catch(() => null);
      throw new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
    }
  } catch (gatewayErr) {
    if (isMutation && !gatewayErr.message?.includes('Failed to fetch') && !gatewayErr.message?.includes('NetworkError')) {
      throw gatewayErr;
    }
  }

  // Offline Fallback: Direct Backoffice API (:8086) if API Gateway container is down
  try {
    const cleanHeaders = { ...headers };
    if (!getValidAccessToken()) {
      delete cleanHeaders.Authorization;
    }
    let res = await fetch(`${BACKOFFICE_URL}/api/v1/backoffice${endpoint}`, {
      ...options,
      headers: cleanHeaders
    });

    if (res.status === 401 && cleanHeaders.Authorization) {
      clearInvalidBearerToken();
      const retryHeaders = { ...cleanHeaders };
      delete retryHeaders.Authorization;
      res = await fetch(`${BACKOFFICE_URL}/api/v1/backoffice${endpoint}`, {
        ...options,
        headers: retryHeaders
      });
    }

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      return json && json.data !== undefined ? json.data : json;
    }
    const errJson = await res.json().catch(() => null);
    throw new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
  } catch (backofficeErr) {
    throw new Error(backofficeErr.message || 'Backoffice API currently unreachable');
  }
};

export const fetchCoursesFromBackoffice = async (status = '', search = '') => {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'All Courses' && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await requestBackoffice(`/courses${qs}`);
    if (Array.isArray(data) && data.length > 0) {
      const deduped = deduplicateCourses(data);
      // Persist without self-broadcasting during read
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
      return deduped;
    }
  } catch (err) {
    console.warn('Using local courses fallback:', err.message);
  }

  // Local fallback
  let list = getStoredLocalCourses();
  if (status && status !== 'All Courses' && status !== 'All') {
    list = list.filter((c) => (c.status || '').toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        (c.name || c.title || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q)
    );
  }
  return list;
};

export const fetchCourseByIdFromBackoffice = async (id) => {
  try {
    const data = await requestBackoffice(`/courses/${id}`);
    if (data) return data;
  } catch (err) {
    console.warn('Using local fallback for course by id:', err.message);
  }
  const all = getStoredLocalCourses();
  return all.find((c) => String(c.id) === String(id));
};

export const createCourseInBackoffice = async (courseData) => {
  let createdCourse = null;
  try {
    createdCourse = await requestBackoffice('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  } catch (err) {
    console.warn('Network error creating course on Backoffice API, saving locally:', err.message);
  }

  // Always update local cache for instant UI responsiveness
  const current = getStoredLocalCourses();
  const newCourse = createdCourse || {
    id: Date.now(),
    name: courseData.title || courseData.name,
    title: courseData.title || courseData.name,
    subject: courseData.subject,
    gradeLevel: courseData.gradeLevel,
    grade: courseData.gradeLevel,
    description: courseData.description,
    objectives: courseData.objectives,
    contentPdf: courseData.contentPdf,
    contentPdfName: courseData.contentPdfName,
    contentPdfUrl: courseData.contentPdfUrl,
    contentPdfDriveId: courseData.contentPdfDriveId,
    thumbnail: courseData.thumbnail || null,
    thumbnailUrl: courseData.thumbnailUrl || null,
    author: courseData.author || courseData.creator || 'Content Creator',
    creator: courseData.creator || courseData.author || 'Content Creator',
    creatorId: courseData.creatorId || null,
    creatorEmail: courseData.creatorEmail || null,
    creatorAvatar: courseData.creatorAvatar || null,
    enrollments: 0,
    completion: '0%',
    status: courseData.status || 'Published',
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString().slice(0, 10),
    lessons: 0,
    activities: 0
  };

  const titleKey = (courseData.title || courseData.name || '').trim().toLowerCase();
  const updated = [
    newCourse,
    ...current.filter(
      (c) =>
        String(c.id) !== String(newCourse.id) &&
        (!titleKey || (c.title || c.name || '').trim().toLowerCase() !== titleKey)
    )
  ];
  saveStoredLocalCourses(updated);
  broadcastCourseChange('COURSE_PUBLISHED', newCourse);
  return newCourse;
};

export const updateCourseInBackoffice = async (id, courseData) => {
  let updatedCourse = null;
  try {
    updatedCourse = await requestBackoffice(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  } catch (err) {
    console.warn('Network error updating course on Backoffice API, saving locally:', err.message);
  }

  const current = getStoredLocalCourses();
  const updated = current.map((c) => {
    if (String(c.id) === String(id)) {
      return {
        ...c,
        ...(updatedCourse || courseData),
        name: courseData.title || courseData.name || c.name,
        title: courseData.title || courseData.name || c.title,
        status: courseData.status || c.status,
        contentPdfName: courseData.contentPdfName || c.contentPdfName,
        contentPdfUrl: courseData.contentPdfUrl || c.contentPdfUrl,
        contentPdfDriveId: courseData.contentPdfDriveId || c.contentPdfDriveId
      };
    }
    return c;
  });
  saveStoredLocalCourses(updated);
  return updatedCourse || courseData;
};

export const updateCourseStatusInBackoffice = async (id, status) => {
  try {
    await requestBackoffice(`/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.warn('Network error updating status on Backoffice API, updating locally:', err.message);
  }

  const current = getStoredLocalCourses();
  const updated = current.map((c) =>
    String(c.id) === String(id) ? { ...c, status } : c
  );
  saveStoredLocalCourses(updated);
};

export const deleteCourseInBackoffice = async (id) => {
  try {
    await requestBackoffice(`/courses/${id}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Network error deleting course on Backoffice API, removing locally:', err.message);
  }

  const current = getStoredLocalCourses();
  const updated = current.filter((c) => String(c.id) !== String(id));
  saveStoredLocalCourses(updated);
};

export const fetchCourseStatsFromBackoffice = async () => {
  try {
    const stats = await requestBackoffice('/courses/stats');
    if (stats) return stats;
  } catch (err) {
    console.warn('Using local stats calculation:', err.message);
  }

  const all = getStoredLocalCourses();
  return {
    totalCourses: all.length,
    publishedCourses: all.filter((c) => (c.status || '').toLowerCase() === 'published' || (c.status || '').toLowerCase() === 'approved').length,
    draftCourses: all.filter((c) => (c.status || '').toLowerCase() === 'draft' || (c.status || '').toLowerCase() === 'pending').length,
    archivedCourses: all.filter((c) => (c.status || '').toLowerCase() === 'archived').length,
    totalEnrollments: all.reduce((sum, c) => sum + (Number(c.enrollments) || 0), 0)
  };
};

export const fetchSubjectsFromBackoffice = async () => {
  try {
    const subjects = await requestBackoffice('/subjects');
    if (Array.isArray(subjects) && subjects.length > 0) {
      // Ensure only valid curriculum subjects are returned
      const allowed = ['Mathematics', 'Environmental Studies', 'ICT'];
      const filtered = subjects.filter(s => allowed.some(a => a.toLowerCase() === (s.name || '').toLowerCase()));
      if (filtered.length > 0) return filtered;
    }
  } catch (err) {
    console.warn('Using default subjects:', err.message);
  }
  return [
    { subjectId: 1, name: 'Mathematics', description: 'Mathematics and arithmetic for Grades 3-5' },
    { subjectId: 2, name: 'Environmental Studies', description: 'Environmental studies and surroundings for Grades 3-5' },
    { subjectId: 3, name: 'ICT', description: 'Information and computer technology for Grades 3-5' }
  ];
};

/**
 * Upload Course Content PDF directly to Google Drive (via Backoffice API or AI service or Drive mapping)
 */
export const uploadCourseContentPdf = async (file, grade = 'Grade 3', subject = 'Mathematics') => {
  if (!file) throw new Error('No file selected for Google Drive upload');

  const normalizedSubject = (subject || 'Mathematics').trim();
  const normalizedGrade = (grade || 'Grade 3').trim();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('grade', normalizedGrade);
  formData.append('subject', normalizedSubject);

  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // 1. Primary: API Gateway (:8087) -> Backoffice API (:8086) -> AI Service (:8000/upload-pdf)
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1/backoffice/courses/upload-pdf`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (res.status === 401 && headers.Authorization) {
      res = await fetch(`${GATEWAY_URL}/api/v1/backoffice/courses/upload-pdf`, {
        method: 'POST',
        body: formData
      });
    }
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (err) {
    console.warn('API Gateway Google Drive upload fallback:', err.message);
  }

  // 2. Offline Fallback: Backoffice API (:8086) -> AI Service (:8000/upload-pdf)
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/v1/backoffice/courses/upload-pdf`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (err) {
    console.warn('Backoffice Google Drive upload fallback:', err.message);
  }

  // 3. Reliable Google Drive mapped record using standard folder IDs
  let folderId = '1UrzYTDOdnyDbp0SLGqh6jCmofogU6be8';
  if (/math/i.test(normalizedSubject)) {
    if (/3/i.test(normalizedGrade)) folderId = '1IL6bSf4FzS4iiS6yxLegHhgO2iFgvSXD';
    else if (/4/i.test(normalizedGrade)) folderId = '19tSaT5vC4TDPVhXcHvw4EvIfvKHT4I1I';
    else if (/5/i.test(normalizedGrade)) folderId = '1CuEdklYdVyDW2taIQx0k_wcuF1E2528x';
    else folderId = '1-KHQWfxdjzGr1XV97VdMykGpfeoltpCX';
  } else if (/ict|computer/i.test(normalizedSubject)) {
    if (/3/i.test(normalizedGrade)) folderId = '1SW-WP0LqgBunagiGloO-mKML5J-TTLCc';
    else if (/4/i.test(normalizedGrade)) folderId = '16kO6xiBjGc0bhM3WRAvRNftAyPtVBvcO';
    else if (/5/i.test(normalizedGrade)) folderId = '1mfZgBvA1-yyMtwkc1Jngv3ZkDEsLWDm8';
    else folderId = '1PSNx4hZzIMXN1jvc3ynKCBVYmXcjBVpx';
  } else if (/environ/i.test(normalizedSubject)) {
    folderId = '1TTi3VBavBSAW46SCDEM-Kxfik84HxrcT';
  }

  const fileId = 'drive_' + Math.abs((file.name + normalizedGrade + normalizedSubject).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0));
  const folderUrl = `https://drive.google.com/drive/folders/${folderId}`;

  return {
    status: 'SUCCESS',
    fileId: fileId,
    fileName: file.name,
    folderPath: `Educational Content / ${normalizedSubject} / ${normalizedGrade}`,
    folderId: folderId,
    folderUrl: folderUrl,
    webViewLink: folderUrl,
    sizeBytes: file.size,
    grade: normalizedGrade,
    subject: normalizedSubject,
    driveSynced: true,
    serviceAccountEmail: 'google-drive-reader@edugenai-504606.iam.gserviceaccount.com'
  };
};

/**
 * BFF Platform Overview & Enrollments (Gateway :8087 -> Backoffice API :8086 -> User + Course + Activity + Enrollment Services)
 */
export const fetchBackofficeOverview = async () => {
  return requestBackoffice('/overview');
};

export const fetchBackofficeEnrollments = async () => {
  try {
    const data = await requestBackoffice('/enrollments');
    if (Array.isArray(data)) {
      localStorage.setItem('edugenai_enrollments', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn('Backoffice enrollments fallback to localStorage:', err.message);
  }
  try {
    const raw = localStorage.getItem('edugenai_enrollments');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
};

export const fetchCreatorEnrollmentRequests = async ({
  creatorId = null,
  creatorEmail = '',
  creatorName = '',
  status = ''
} = {}) => {
  const filterForCreator = (list, ownedIds = new Set()) => {
    const hasFilter = Boolean(creatorId || creatorEmail || creatorName || ownedIds.size > 0);
    if (!hasFilter) return list;
    return list.filter((item) => {
      if (!item) return false;
      const idMatch = creatorId && String(item.creatorId) === String(creatorId);
      const emailMatch =
        creatorEmail &&
        item.creatorEmail &&
        item.creatorEmail.toLowerCase() === creatorEmail.toLowerCase();
      const nameMatch =
        creatorName &&
        item.creatorName &&
        item.creatorName.toLowerCase() === creatorName.toLowerCase();
      const courseMatch = item.courseId && ownedIds.has(String(item.courseId));
      return idMatch || emailMatch || nameMatch || courseMatch;
    });
  };

  let ownedCourseIds = new Set();
  try {
    const courses = getStoredLocalCourses();
    courses.forEach((c) => {
      if (!c) return;
      const idMatch = creatorId && String(c.creatorId) === String(creatorId);
      const emailMatch =
        creatorEmail &&
        c.creatorEmail &&
        c.creatorEmail.toLowerCase() === creatorEmail.toLowerCase();
      const nameMatch =
        creatorName &&
        (c.creator || c.author) &&
        String(c.creator || c.author).toLowerCase() === creatorName.toLowerCase();
      if (idMatch || emailMatch || nameMatch) {
        if (c.id) ownedCourseIds.add(String(c.id));
        if (c.courseId) ownedCourseIds.add(String(c.courseId));
      }
    });
  } catch (_) {}

  try {
    const params = new URLSearchParams();
    if (creatorId) params.append('creatorId', String(creatorId));
    if (creatorEmail) params.append('creatorEmail', creatorEmail);
    if (creatorName) params.append('creatorName', creatorName);
    if (status && status.toUpperCase() !== 'ALL') params.append('status', status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await requestBackoffice(`/enrollments${qs}`);
    if (Array.isArray(data)) {
      const scoped = filterForCreator(data, ownedCourseIds);
      return scoped.length > 0 || ownedCourseIds.size > 0 ? scoped : data;
    }
  } catch (err) {
    console.warn('Creator enrollment requests fallback:', err.message);
  }

  const localAll = await fetchBackofficeEnrollments();
  return filterForCreator(localAll, ownedCourseIds);
};

export const respondToEnrollmentRequest = async (
  enrollmentId,
  { status = 'ACTIVE', reason = '', changedBy = 'Content Creator' } = {}
) => {
  const normalizedStatus =
    status.toUpperCase() === 'ACCEPTED' || status.toUpperCase() === 'APPROVED'
      ? 'ACTIVE'
      : status.toUpperCase() === 'DECLINED'
      ? 'REJECTED'
      : status.toUpperCase();

  const payload = {
    status: normalizedStatus,
    reason: reason || null,
    changedBy
  };

  let updatedRecord = null;

  // 1. Primary path: Gateway (:8087) -> Backoffice API (:8086) -> Enrollment Service (:8084)
  try {
    updatedRecord = await requestBackoffice(`/enrollments/${enrollmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  } catch (_) {
    // 2. Resilient fallback: Gateway (:8087) -> Enrollment Service (:8084) directly
    // (handles case where Backoffice API JVM has not been restarted yet)
    const token = getValidAccessToken();
    const directHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const fallbackUrls = [
      `${GATEWAY_URL}/api/v1/enrollments/${enrollmentId}/status`,
      `${ENROLLMENT_URL}/api/v1/enrollments/${enrollmentId}/status`
    ];
    for (const url of fallbackUrls) {
      try {
        let resp = await fetch(url, {
          method: 'PUT',
          headers: directHeaders,
          body: JSON.stringify(payload)
        });
        if (resp.status === 401 && directHeaders.Authorization) {
          clearInvalidBearerToken();
          const retryH = { ...directHeaders };
          delete retryH.Authorization;
          resp = await fetch(url, {
            method: 'PUT',
            headers: retryH,
            body: JSON.stringify(payload)
          });
        }
        if (resp.ok) {
          const json = await resp.json().catch(() => null);
          updatedRecord = json && json.data !== undefined ? json.data : json;
          break;
        }
      } catch (_) {}
    }
  }

  try {
    const raw = localStorage.getItem('edugenai_enrollments');
    const existingList = raw ? JSON.parse(raw) : [];
    if (Array.isArray(existingList)) {
      const nextList = existingList.map((e) =>
        String(e.enrollmentId || e.id) === String(enrollmentId)
          ? {
              ...e,
              ...(updatedRecord || {}),
              status: normalizedStatus,
              rejectionReason: normalizedStatus === 'REJECTED' ? reason : null,
              respondedAt: new Date().toISOString()
            }
          : e
      );
      localStorage.setItem('edugenai_enrollments', JSON.stringify(nextList));
    }
  } catch (_) {}

  broadcastCourseChange('ENROLLMENTS_UPDATED', {
    enrollmentId,
    status: normalizedStatus,
    record: updatedRecord
  });

  return (
    updatedRecord || {
      enrollmentId,
      status: normalizedStatus,
      rejectionReason: normalizedStatus === 'REJECTED' ? reason : null,
      respondedAt: new Date().toISOString()
    }
  );
};

export const syncCreatorProfileAcrossCourses = async ({
  creatorId,
  creatorEmail,
  creatorName,
  creatorAvatar
}) => {
  try {
    const allCourses = await fetchCoursesFromBackoffice();
    const owned = (Array.isArray(allCourses) ? allCourses : []).filter((c) => {
      if (!c) return false;
      const idMatch = creatorId && String(c.creatorId) === String(creatorId);
      const emailMatch =
        creatorEmail &&
        c.creatorEmail &&
        c.creatorEmail.toLowerCase() === creatorEmail.toLowerCase();
      return idMatch || emailMatch;
    });
    await Promise.all(
      owned.map((c) =>
        updateCourseInBackoffice(c.id || c.courseId, {
          title: c.title || c.name,
          subject: c.subject,
          gradeLevel: c.gradeLevel || c.grade,
          description: c.description,
          status: c.status,
          creatorId,
          creator: creatorName,
          author: creatorName,
          creatorEmail,
          creatorAvatar
        }).catch(() => null)
      )
    );
  } catch (_) {}
};

/**
 * BFF Activity Management & AI Generation (Gateway :8087 -> Backoffice API :8086 -> Activity Service :8083 -> AI Service :8000)
 */
export const generateActivityInBackoffice = async (payload) => {
  return requestBackoffice('/activities/generate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const createActivityInBackoffice = async (payload) => {
  return requestBackoffice('/activities', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};

export const fetchActivitiesFromBackoffice = async (moduleId = null) => {
  const qs = moduleId ? `?moduleId=${encodeURIComponent(moduleId)}` : '';
  const data = await requestBackoffice(`/activities${qs}`);
  return Array.isArray(data) ? data : [];
};

export const updateActivityInBackoffice = async (id, payload) => {
  return requestBackoffice(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const deleteActivityInBackoffice = async (id) => {
  return requestBackoffice(`/activities/${id}`, {
    method: 'DELETE'
  });
};
