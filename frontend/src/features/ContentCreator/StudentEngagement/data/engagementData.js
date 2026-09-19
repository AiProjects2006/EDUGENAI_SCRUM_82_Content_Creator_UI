const STORAGE_KEY = "studentEngagement";

const defaultEngagement = [
    {
        id: 1,
        studentName: "Student 01",
        course: "Primary Mathematics",
        timeSpent: 4.2,
        completion: 88,
        lastActive: "Today",
        daysAgo: 0
    },
    {
        id: 2,
        studentName: "Student 02",
        course: "Primary Science",
        timeSpent: 3.6,
        completion: 76,
        lastActive: "Today",
        daysAgo: 2
    },
    {
        id: 3,
        studentName: "Student 03",
        course: "ICT Fundamentals",
        timeSpent: 5.1,
        completion: 92,
        lastActive: "Yesterday",
        daysAgo: 10
    },
    {
        id: 4,
        studentName: "Student 04",
        course: "English Grammar",
        timeSpent: 2.8,
        completion: 64,
        lastActive: "35 days ago",
        daysAgo: 35
    }
];

const lessonEngagement = [
    {
        id: 1,
        title: "Quantum Physics Basics",
        subject: "Grade 8 Science",
        percentage: 92
    },
    {
        id: 2,
        title: "Python Variables & Loops",
        subject: "Grade 8 ICT",
        percentage: 89
    },
    {
        id: 3,
        title: "Geometry: Pi in Nature",
        subject: "Grade 7 Math",
        percentage: 82
    },
    {
        id: 4,
        title: "Photosynthesis Lab",
        subject: "Grade 6 Science",
        percentage: 75
    }
];

const dailyEngagement = [
    { date: "2026-08-01", value: 35 },
    { date: "2026-08-02", value: 48 },
    { date: "2026-08-03", value: 42 },
    { date: "2026-08-04", value: 60 },
    { date: "2026-08-05", value: 52 },
    { date: "2026-08-06", value: 68 },
    { date: "2026-08-07", value: 55 },
    { date: "2026-08-08", value: 72 },
    { date: "2026-08-09", value: 64 },
    { date: "2026-08-10", value: 78 },
    { date: "2026-08-11", value: 70 },
    { date: "2026-08-12", value: 82 },
    { date: "2026-08-13", value: 74 }
];

const subjectEngagement = [
    {
        subject: "Science",
        percentage: 45,
        hours: 7.3
    },
    {
        subject: "Math",
        percentage: 30,
        hours: 4.8
    },
    {
        subject: "ICT",
        percentage: 25,
        hours: 4.1
    }
];

export function getEngagement() {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultEngagement)
        );

        return defaultEngagement;
    }

    return JSON.parse(storedData);
}

export function saveEngagement(engagement) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(engagement)
    );
}

export { lessonEngagement, dailyEngagement, subjectEngagement };