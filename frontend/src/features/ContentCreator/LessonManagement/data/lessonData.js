const STORAGE_KEY = "lessons";

const defaultLessons = [
    {
        id: 1,
        courseId: 1,
        title: "Introduction to Photosynthesis",
        subject: "Science",
        grade: "08",
        compliance: 82,
        status: "PUBLISHED",
        topic: "Photosynthesis",
        description:
            "Understanding how plants convert light energy into chemical energy.",
        updated: "2 days ago"
    },
    {
        id: 2,
        courseId: 2,
        title: "Digital Citizenship & Safety",
        subject: "ICT",
        grade: "08",
        compliance: 76,
        status: "DRAFT",
        topic: "Digital Citizenship",
        description:
            "Learning responsible and safe practices when using digital technology.",
        updated: "3 days ago"
    },
    {
        id: 3,
        courseId: 3,
        title: "Fractions & Decimals",
        subject: "Math",
        grade: "08",
        compliance: 64,
        status: "PUBLISHED",
        topic: "Fractions",
        description:
            "Understanding fractions, decimals and their relationships.",
        updated: "4 days ago"
    }
];

export function getLessons() {
    const storedLessons = localStorage.getItem(STORAGE_KEY);

    if (!storedLessons) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultLessons)
        );

        return defaultLessons;
    }

    return JSON.parse(storedLessons);
}

export function saveLessons(lessons) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(lessons)
    );
}