import { isLegacyDefaultCourse, deduplicateCourses } from "../../../../services/backofficeService";

const STORAGE_KEY = "courses";
const defaultCourses = [];

export function getCourses() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return deduplicateCourses(parsed.filter(c => !isLegacyDefaultCourse(c)));
            }
        }
    } catch (_) {}
    return defaultCourses;
}

export function saveCourses(updatedCourses) {
    try {
        const deduped = deduplicateCourses(updatedCourses);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
        localStorage.setItem("admin_courses", JSON.stringify(deduped));
        localStorage.setItem("creator_courses", JSON.stringify(deduped));
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new CustomEvent("coursesUpdated", { detail: deduped }));
        }
    } catch (_) {}
}

const courses = getCourses();
export default courses;