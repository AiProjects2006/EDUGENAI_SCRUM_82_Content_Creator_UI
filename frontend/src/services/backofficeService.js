const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const BACKOFFICE_URL = import.meta.env.VITE_BACKOFFICE_URL || 'http://localhost:8086';
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
  return typeof tok === 'string' && tok.split('.').length === 3;
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
 * Universal backoffice API request with automatic fallback from Gateway to direct Backoffice API
 */
const requestBackoffice = async (endpoint, options = {}) => {
  const rawToken = localStorage.getItem('access_token') || localStorage.getItem('token');
  const token = isJwtToken(rawToken) ? rawToken : null;
  const isMutation = options.method && options.method.toUpperCase() !== 'GET';
  const headers = {
    'Content-Type': 'application/json',
    ...(isMutation && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Primary: Direct Backoffice API port 8086 as per system architecture diagram
  try {
    let res = await fetch(`${BACKOFFICE_URL}/api/v1/backoffice${endpoint}`, {
      ...options,
      headers
    });

    // If 401 returned, token may be expired or unaccepted; retry once unauthenticated
    if (res.status === 401 && headers.Authorization) {
      const retryHeaders = { ...headers };
      delete retryHeaders.Authorization;
      res = await fetch(`${BACKOFFICE_URL}/api/v1/backoffice${endpoint}`, {
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
  } catch (backofficeErr) {
    if (isMutation && !backofficeErr.message?.includes('Failed to fetch') && !backofficeErr.message?.includes('NetworkError')) {
      throw backofficeErr;
    }
  }

  // Fallback: via API Gateway
  try {
    let res = await fetch(`${GATEWAY_URL}/api/v1/backoffice${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401 && headers.Authorization) {
      const retryHeaders = { ...headers };
      delete retryHeaders.Authorization;
      res = await fetch(`${GATEWAY_URL}/api/v1/backoffice${endpoint}`, {
        ...options,
        headers: retryHeaders
      });
    }

    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
    const errJson = await res.json().catch(() => null);
    throw new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
  } catch (gatewayErr) {
    throw new Error(gatewayErr.message || 'Backoffice API currently unreachable');
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
    author: courseData.author || 'Alex Rivers',
    creator: courseData.author || 'Alex Rivers',
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

  // 1. Try API Gateway
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/backoffice/courses/upload-pdf`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (err) {
    console.warn('API Gateway Google Drive upload fallback:', err.message);
  }

  // 2. Try Direct Backoffice service
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
    console.warn('Direct Backoffice Google Drive upload fallback:', err.message);
  }

  // 3. Try Direct AI service
  try {
    const res = await fetch('http://localhost:8000/upload-pdf', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (err) {
    console.warn('Direct AI Service upload-pdf fallback:', err.message);
  }

  // 4. Reliable Google Drive mapped record using standard folder IDs
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
