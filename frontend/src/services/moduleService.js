const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const COURSE_SERVICE_URL = import.meta.env.VITE_COURSE_SERVICE_URL || 'http://localhost:8082';
const STORAGE_KEY = 'modules';

const INITIAL_DEFAULT_MODULES = [
  {
    moduleId: 1,
    courseId: 1,
    title: 'Points, Lines, and Angles',
    description: 'Fundamental building blocks of geometry, coordinates, and acute/obtuse angles.',
    createdAt: new Date().toISOString()
  },
  {
    moduleId: 2,
    courseId: 1,
    title: 'Triangles and the Pythagorean Theorem',
    description: 'Exploring triangle classifications, perimeter, area, and right-triangle formulas.',
    createdAt: new Date().toISOString()
  },
  {
    moduleId: 3,
    courseId: 1,
    title: 'Polygons and Quadrilaterals',
    description: 'Understanding multi-sided 2D polygons, interior angles, and regular quadrilaterals.',
    createdAt: new Date().toISOString()
  },
  {
    moduleId: 4,
    courseId: 2,
    title: 'Introduction to Cell Biology',
    description: 'Plant and animal cell structure, microscopic organelles, and cellular functions.',
    createdAt: new Date().toISOString()
  },
  {
    moduleId: 5,
    courseId: 2,
    title: 'Photosynthesis & Plant Energy',
    description: 'How chloroplasts convert sunlight, water, and CO2 into chemical glucose energy.',
    createdAt: new Date().toISOString()
  }
];

// Helper for cross-tab / cross-window sync
const broadcastChange = (type, payload) => {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(type.toLowerCase(), { detail: payload }));
    }
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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateModules(parsed);
      }
    }
  } catch (e) {
    console.error('Failed reading modules from localStorage:', e);
  }
  const defaults = deduplicateModules(INITIAL_DEFAULT_MODULES);
  saveStoredModules(defaults);
  return defaults;
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
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const isMutation = options.method && options.method.toUpperCase() !== 'GET';

  // 1. Try Gateway
  try {
    const res = await fetch(`${GATEWAY_URL}/api/v1${path}`, {
      ...options,
      headers
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
    // If mutation failed with client/business error on Gateway, do not duplicate request
    if (isMutation && res.status < 500) {
      const errJson = await res.json().catch(() => null);
      throw new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
    }
    // For GET requests, allow fallback on 403/401 (auth errors)
    if (!isMutation && (res.status === 403 || res.status === 401)) {
      console.warn(`Gateway returned ${res.status}, trying direct service...`);
    } else if (!res.ok) {
      console.warn(`Gateway returned ${res.status}, trying direct service...`);
    }
  } catch (err) {
    if (isMutation && !err.message?.includes('Failed to fetch') && !err.message?.includes('NetworkError')) {
      throw err;
    }
  }

  // 2. Try Direct Course Service (port 8082)
  try {
    const res = await fetch(`${COURSE_SERVICE_URL}/api/v1${path}`, {
      ...options,
      headers
    });
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
  // Merge API modules with stored local modules and deduplicate
  const merged = deduplicateModules([...stored, ...apiModules]);
  saveStoredModules(merged);
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
export const createModuleAPI = async (title, description, courseId) => {
  const cId = Number(courseId);
  const cleanTitle = title.trim();
  const cleanDesc = description ? description.trim() : '';

  // Check if a module with the same title already exists for this course
  // "it is enough update once" - update existing module instead of creating duplicate
  const currentModules = getStoredModules();
  const existing = currentModules.find(
    m => Number(m.courseId) === cId && (m.title || m.name || '').trim().toLowerCase() === cleanTitle.toLowerCase()
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
