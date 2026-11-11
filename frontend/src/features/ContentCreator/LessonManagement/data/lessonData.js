const STORAGE_KEY = "lessons";

const defaultLessons = [];

export function getLessons() {
    const storedLessons = localStorage.getItem(STORAGE_KEY);

    if (!storedLessons) {
        return defaultLessons;
    }

    try {
        const parsed = JSON.parse(storedLessons);
        return Array.isArray(parsed) ? parsed : defaultLessons;
    } catch (_) {
        return defaultLessons;
    }
}

export function saveLessons(lessons) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lessons)
    );
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
    }
}