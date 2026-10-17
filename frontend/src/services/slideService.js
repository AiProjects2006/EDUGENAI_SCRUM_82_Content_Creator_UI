const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8087';
const RESOURCE_SERVICE_URL = import.meta.env.VITE_RESOURCE_SERVICE_URL || 'http://localhost:8085';
const STORAGE_KEY = 'learning_resources';

// Default initial slides for demonstration
const DEFAULT_SLIDES = [
  {
    id: 101,
    moduleId: 1,
    courseId: 1,
    title: 'What is a Triangle?',
    content: 'A triangle is a polygon with three edges and three vertices. It is one of the basic shapes in geometry. The sum of angles in any planar triangle is always 180 degrees.',
    fact: 'Did you know the starfish is shaped like 5 triangles put together?',
    icon: 'twemoji:triangular-ruler',
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    moduleId: 1,
    courseId: 1,
    title: 'What is a Square?',
    content: 'A square is a regular quadrilateral, which means that it has four equal sides and four equal angles of 90 degrees each.',
    fact: 'A chessboard is made of 64 smaller squares!',
    icon: 'twemoji:stop-button',
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 103,
    moduleId: 1,
    courseId: 1,
    title: 'What is a Circle?',
    content: 'A circle is a shape consisting of all points in a plane that are at a given distance from a given point, the center.',
    fact: 'Bubbles are perfect spheres, which look like circles from any angle!',
    icon: 'twemoji:hollow-red-circle',
    sortOrder: 3,
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
 * Deduplicate slides by id and (moduleId + title)
 */
export const deduplicateSlides = (slides = []) => {
  if (!Array.isArray(slides)) return [];
  const seenIds = new Set();
  const seenModuleTitle = new Set();
  const result = [];

  for (const s of slides) {
    if (!s) continue;
    const sId = s.id || s.resourceId;
    const mId = Number(s.moduleId || 0);
    const title = (s.title || '').trim();
    const key = `${mId}_${title.toLowerCase()}`;

    if (sId && seenIds.has(String(sId))) continue;
    if (title && seenModuleTitle.has(key)) continue;

    if (sId) seenIds.add(String(sId));
    if (title) seenModuleTitle.add(key);

    result.push({
      ...s,
      id: sId || Date.now(),
      moduleId: mId,
      courseId: s.courseId ? Number(s.courseId) : null,
      title: title || 'Learning Slide',
      content: s.content || s.description || '',
      fact: s.fact || s.description || 'Remember this key concept!',
      icon: s.icon || 'twemoji:light-bulb',
      file: s.file || (s.fileUrl ? { name: s.title, url: s.fileUrl } : null),
      sortOrder: s.sortOrder || 1,
      createdAt: s.createdAt || new Date().toISOString()
    });
  }
  return result;
};

export const getStoredSlides = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return deduplicateSlides(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed reading slides from localStorage:', e);
  }
  // Initialize default demo slides if none exist
  const defaults = deduplicateSlides(DEFAULT_SLIDES);
  saveStoredSlides(defaults);
  return defaults;
};

export const saveStoredSlides = (slides) => {
  try {
    const deduped = deduplicateSlides(slides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    localStorage.setItem('slides', JSON.stringify(deduped));
    broadcastChange('SLIDES_UPDATED', deduped);
  } catch (e) {
    console.error('Failed saving slides to localStorage:', e);
  }
};

/**
 * Make API request with dual fallback: Gateway -> Direct Resource Service -> LocalStorage
 */
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
    const res = await fetch(`${GATEWAY_URL}/api${path}`, {
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
      const httpError = new Error((errJson && errJson.message) || `Request failed with status ${res.status}`);
      httpError.status = res.status;
      throw httpError;
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

  // 2. Try Direct Resource Service (port 8085)
  try {
    const res = await fetch(`${RESOURCE_SERVICE_URL}/api${path}`, {
      ...options,
      headers
    });
    if (res.ok) {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    }
  } catch (_) {}

  throw new Error(`Resource request to ${path} could not reach service`);
};

/**
 * Fetch slides for a specific module
 */
export const fetchSlidesByModule = async (moduleId) => {
  if (!moduleId) return [];
  const targetId = Number(moduleId);

  try {
    const data = await request(`/resources/module/${targetId}`);
    if (Array.isArray(data) && data.length > 0) {
      const normalized = data.map((item, index) => ({
        id: item.resourceId || item.id,
        moduleId: Number(item.moduleId) || targetId,
        title: item.title,
        content: item.content || item.description || '',
        fact: item.description || 'Review this key concept to master the lesson!',
        icon: item.icon || 'twemoji:blue-book',
        file: item.fileUrl ? { name: item.title, url: item.fileUrl } : null,
        sortOrder: item.sortOrder || index + 1,
        createdAt: item.createdAt || new Date().toISOString()
      }));
      // Merge with local storage cache
      const stored = getStoredSlides();
      const nonModuleSlides = stored.filter(s => Number(s.moduleId) !== targetId);
      saveStoredSlides([...nonModuleSlides, ...normalized]);
      return normalized;
    }
  } catch (err) {
    console.warn(`Using cached slides for module ${moduleId}:`, err.message);
  }

  const stored = getStoredSlides();
  return stored
    .filter(s => Number(s.moduleId) === targetId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
};

/**
 * Create a new slide for a module
 */
export const createSlideAPI = async (slideData) => {
  const { moduleId, courseId, title, content, fact, icon, file, sortOrder } = slideData;
  const targetModuleId = Number(moduleId);
  const cleanTitle = title.trim();

  // If a slide with the exact title already exists in this module, update it instead of creating duplicate
  const currentSlides = getStoredSlides();
  const existing = currentSlides.find(
    s => Number(s.moduleId) === targetModuleId && (s.title || '').trim().toLowerCase() === cleanTitle.toLowerCase()
  );

  if (existing) {
    return updateSlideAPI(existing.id, {
      moduleId: targetModuleId,
      courseId: Number(courseId) || existing.courseId,
      title: cleanTitle,
      content,
      fact,
      icon,
      file,
      sortOrder
    });
  }

  const newSlideId = Date.now();
  const localSlide = {
    id: newSlideId,
    moduleId: targetModuleId,
    courseId: Number(courseId) || null,
    title: cleanTitle,
    content: content ? content.trim() : ' ',
    fact: fact ? fact.trim() : 'Remember this important concept!',
    icon: icon || 'twemoji:light-bulb',
    file: file || null,
    sortOrder: sortOrder || 1,
    createdAt: new Date().toISOString()
  };

  try {
    const payload = {
      moduleId: targetModuleId,
      title: localSlide.title,
      description: localSlide.fact,
      resourceType: 'NOTE',
      content: localSlide.content,
      fileUrl: file?.url || '',
      mimeType: file?.type || 'application/json',
      sortOrder: localSlide.sortOrder
    };

    const created = await request('/resources', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (created && (created.resourceId || created.id)) {
      localSlide.id = Number(created.resourceId || created.id);
    }
  } catch (err) {
    console.warn('API creation failed, persisting slide locally:', err.message);
  }

  // Persist and broadcast
  const stored = getStoredSlides();
  stored.push(localSlide);
  saveStoredSlides(stored);

  return localSlide;
};

/**
 * Update a slide with valid Learning Resource Service requirements
 */
export const updateSlideAPI = async (slideId, updatedFields) => {
  const targetId = Number(slideId);
  const stored = getStoredSlides();
  const existing = stored.find(s => Number(s.id) === targetId);
  const targetModuleId = Number(updatedFields.moduleId || existing?.moduleId || 1);

  const cleanTitle = (updatedFields.title || existing?.title || '').trim();
  const cleanContent = (updatedFields.content !== undefined ? updatedFields.content : (existing?.content || ' ')).trim() || ' ';
  const cleanFact = (updatedFields.fact !== undefined ? updatedFields.fact : (existing?.fact || '')).trim();
  const cleanIcon = updatedFields.icon || existing?.icon || 'twemoji:light-bulb';
  const cleanFile = updatedFields.file !== undefined ? updatedFields.file : (existing?.file || null);
  const sortOrder = updatedFields.sortOrder || existing?.sortOrder || 1;

  let resolvedId = targetId;
  const body = {
    moduleId: targetModuleId,
    title: cleanTitle,
    description: cleanFact || 'Remember this key concept!',
    resourceType: 'NOTE',
    content: cleanContent,
    fileUrl: cleanFile?.url || '',
    mimeType: cleanFile?.type || 'application/json',
    sortOrder: sortOrder
  };

  try {
    const updated = await request(`/resources/${targetId}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    if (updated && (updated.resourceId || updated.id)) {
      resolvedId = Number(updated.resourceId || updated.id);
    }
  } catch (err) {
    if (err.status === 404) {
      // Slide only exists locally (earlier save never reached the backend), so create it there
      try {
        const created = await request('/resources', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        if (created && (created.resourceId || created.id)) {
          resolvedId = Number(created.resourceId || created.id);
        }
      } catch (createErr) {
        console.warn('API create during update failed, updating locally:', createErr.message);
      }
    } else {
      console.warn('API update failed, updating locally:', err.message);
    }
  }

  const updatedSlide = {
    ...(existing || {}),
    id: resolvedId,
    moduleId: targetModuleId,
    title: cleanTitle,
    content: cleanContent,
    fact: cleanFact,
    icon: cleanIcon,
    file: cleanFile,
    sortOrder: sortOrder,
    updatedAt: new Date().toISOString()
  };

  const index = stored.findIndex(s => Number(s.id) === targetId);
  if (index !== -1) {
    stored[index] = updatedSlide;
  } else {
    stored.push(updatedSlide);
  }
  saveStoredSlides(stored);
  
  // Broadcast update so student UI refreshes immediately
  broadcastChange('SLIDES_UPDATED', stored);
  
  return updatedSlide;
};

/**
 * Delete a slide
 */
export const deleteSlideAPI = async (slideId) => {
  const targetId = Number(slideId);
  try {
    await request(`/resources/${targetId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('API delete failed, removing locally:', err.message);
  }

  const stored = getStoredSlides();
  const filtered = stored.filter(s => Number(s.id) !== targetId);
  saveStoredSlides(filtered);
  return true;
};

/**
 * Get slide counts mapped by moduleId
 */
export const getSlideCounts = () => {
  const stored = getStoredSlides();
  const counts = {};
  for (const s of stored) {
    const mId = Number(s.moduleId);
    counts[mId] = (counts[mId] || 0) + 1;
  }
  return counts;
};
