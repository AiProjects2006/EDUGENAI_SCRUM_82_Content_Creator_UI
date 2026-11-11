export const fallbackCourses = [
    {
        id: "1",
        courseId: 1,
        name: "Environmental Studies",
        subject: "Environmental Studies",
        modules: [
            { id: 1, moduleId: 1, title: "Plants Around Us" },
            { id: 2, moduleId: 2, title: "Water & Weather" }
        ]
    },
    {
        id: "2",
        courseId: 2,
        name: "Primary Mathematics",
        subject: "Mathematics",
        modules: [
            { id: 3, moduleId: 3, title: "Numbers & Shapes" },
            { id: 4, moduleId: 4, title: "Addition & Multiplication" }
        ]
    }
];

export const activityTypes = [
    { id: "MCQ", label: "Multiple Choice (MCQ)", icon: "circle" },
    { id: "TRUE_FALSE", label: "True / False", icon: "check" },
    { id: "FILL_BLANK", label: "Fill in Blanks", icon: "lines" },
    { id: "MATCHING", label: "Match Following", icon: "link" },
    { id: "SORTING", label: "Category Sorting", icon: "cards" },
    { id: "DRAG_DROP", label: "Drag & Drop Order", icon: "list" },
    { id: "SHORT_ANSWER", label: "Short Answer", icon: "edit" },
    { id: "ESSAY", label: "Structured Essay", icon: "book" },
    { id: "HOTSPOT", label: "Hotspot Diagram", icon: "target" },
    { id: "PROBLEM_SOLVING", label: "Problem Solving", icon: "calc" },
    { id: "APPLICATION_BASED", label: "Application Scenario", icon: "bulb" },
    { id: "TIMED_QUIZ", label: "Timed Quiz", icon: "timer" },
    { id: "POLL", label: "Classroom Poll", icon: "chart" },
    { id: "CHALLENGE_QUIZ", label: "Challenge Quiz", icon: "trophy" }
];

export const difficultyLevels = [
    "Easy",
    "Medium",
    "Hard"
];

export const defaultGeneratorSettings = {
    activityType: "MCQ",
    difficulty: "Medium",
    questionCount: 5
};

export const courses = fallbackCourses;
