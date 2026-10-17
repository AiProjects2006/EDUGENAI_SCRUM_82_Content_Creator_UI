const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const BACKOFFICE_URL = import.meta.env.VITE_BACKOFFICE_URL || 'http://localhost:8086';
const STORAGE_KEY = 'courses';

const DEFAULT_COURSES = [
  {
    id: 1,
    name: 'Primary Mathematics',
    title: 'Primary Mathematics',
    subject: 'Mathematics',
    author: 'Alex Rivers',
    creator: 'Alex Rivers',
    enrollments: 1250,
    completion: '82%',
    status: 'Published',
    gradeLevel: 'Grade 3-5',
    grade: 'Grade 3-5',
    description: 'Fundamental mathematics principles, basic arithmetic, and problem solving.'
  },
  {
    id: 2,
    name: 'Primary Science',
    title: 'Primary Science',
    subject: 'Science',
    author: 'Alex Rivers',
    creator: 'Alex Rivers',
    enrollments: 980,
    completion: '75%',
    status: 'Draft',
    gradeLevel: 'Grade 6-8',
    grade: 'Grade 6-8',
    description: 'Learn basic science concepts, living things, and the environment.'
  },
  {
    id: 3,
    name: 'ICT Fundamentals',
    title: 'ICT Fundamentals',
    subject: 'ICT',
    author: 'Alex Rivers',
    creator: 'Alex Rivers',
    enrollments: 780,
    completion: '68%',
    status: 'Archived',
    gradeLevel: 'Grade 6-8',
    grade: 'Grade 6-8',
    description: 'Understand computer fundamentals, basic programming, and digital skills.'
  },
  {
    id: 4,
    name: 'English Grammar',
    title: 'English Grammar',
    subject: 'English',
    author: 'Alex Rivers',
    creator: 'Alex Rivers',
    enrollments: 1540,
    completion: '91%',
    status: 'Published',
    gradeLevel: 'Grade 6-8',
    grade: 'Grade 6-8',
    description: 'Develop English grammar skills through sentence formation and reading.'
  }
];

const getStoredLocalCourses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading courses from localStorage:', e);
  }
  return DEFAULT_COURSES;
};

export const deduplicateCourses = (courses = []) => {
  const seen = new Set();
  const result = [];
  for (const c of courses) {
    if (!c) continue;
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
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed saving courses to localStorage:', e);
  }
};

/**
 * Universal backoffice API request with automatic fallback from Gateway to direct Backoffice API
 */
const requestBackoffice = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const isMutation = options.method && options.method.toUpperCase() !== 'GET';

  // Primary: via API Gateway according to architecture
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1/backoffice${endpoint}`, {
      ...options,
      headers
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
    // If mutation was accepted or rejected with business error, do not retry on secondary
    if (isMutation && res.status < 500) {
      const errJson = await res.json().catch(() => null);
      throw new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
    }
  } catch (gatewayErr) {
    if (isMutation && !gatewayErr.message?.includes('Failed to fetch') && !gatewayErr.message?.includes('NetworkError')) {
      throw gatewayErr;
    }
  }

  // Secondary: Direct Backoffice API port 8086
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/v1/backoffice${endpoint}`, {
      ...options,
      headers
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
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
      saveStoredLocalCourses(deduped);
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
    primaryGrade: courseData.primaryGrade,
    prerequisites: courseData.prerequisites,
    thumbnail: courseData.thumbnail,
    thumbnailUrl: courseData.thumbnailUrl,
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
        status: courseData.status || c.status
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
    if (Array.isArray(subjects) && subjects.length > 0) return subjects;
  } catch (err) {
    console.warn('Using default subjects:', err.message);
  }
  return [
    { subjectId: 1, name: 'Mathematics', description: 'Mathematics and logic' },
    { subjectId: 2, name: 'Science', description: 'Natural sciences' },
    { subjectId: 3, name: 'ICT', description: 'Information and computer technology' },
    { subjectId: 4, name: 'English', description: 'English language and grammar' }
  ];
};
