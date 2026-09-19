const STORAGE_KEY = "courses";

const defaultCourses = [
    {
        id: 1,
        name: "Primary Mathematics",
        subject: "Mathematics",
        author: "Alex Rivers",
        enrollments: 1250,
        completion: "82%",
        status: "Published",
    },
    {
        id: 2,
        name: "Primary Science",
        subject: "Science",
        author: "Alex Rivers",
        enrollments: 980,
        completion: "75%",
        status: "Draft",
    },
    {
        id: 3,
        name: "ICT Fundamentals",
        subject: "ICT",
        author: "Alex Rivers",
        enrollments: 780,
        completion: "68%",
        status: "Archived",
    },
    {
        id: 4,
        name: "English Grammar",
        subject: "English",
        author: "Alex Rivers",
        enrollments: 1540,
        completion: "91%",
        status: "Published",
    }
];

const storedCourses = localStorage.getItem(STORAGE_KEY);

const courses = storedCourses
    ? JSON.parse(storedCourses)
    : defaultCourses;

if (!storedCourses) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultCourses)
    );
}

export default courses;

export function getCourses() {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored
        ? JSON.parse(stored)
        : defaultCourses;
}

export function saveCourses(updatedCourses) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedCourses)
    );
}