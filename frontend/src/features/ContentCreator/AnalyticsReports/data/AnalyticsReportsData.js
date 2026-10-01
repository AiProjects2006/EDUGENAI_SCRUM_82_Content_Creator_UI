export const analyticsOverview = [
    {
        id: 1,
        label: "AVERAGE SCORE",
        value: "84.2%",
        icon: "score"
    },
    {
        id: 2,
        label: "COURSE COMPLETION",
        value: "76.8%",
        icon: "completion"
    },
    {
        id: 3,
        label: "ACTIVE STUDENTS",
        value: "1,204",
        icon: "students"
    },
    {
        id: 4,
        label: "TOTAL LEARNING",
        value: "42,500",
        suffix: "MIN",
        icon: "time"
    }
];

export const curriculumModules = [
    {
        id: 1,
        module: "S1.2: Quantum Apps (Gr 9)",
        score: 92,
        action: "On Track",
        status: "success"
    },
    {
        id: 2,
        module: "M2.4: Fraction Multiplication (Gr 4)",
        score: 58,
        action: "Review Content",
        status: "warning"
    },
    {
        id: 3,
        module: "I3.1: Python Loops (Gr 7)",
        score: 89,
        action: "On Track",
        status: "success"
    },
    {
        id: 4,
        module: "S3.2: Chemical Equilibrium (Gr 9)",
        score: 71,
        action: "Monitor",
        status: "neutral"
    }
];

export const analyticsByGrade = {
    "All Grades": {
        averageScore: "84.2%",
        completion: "76.8%",
        students: "1,204",
        learningMinutes: "42,500"
    },

    "Grade 4": {
        averageScore: "81.4%",
        completion: "72.6%",
        students: "318",
        learningMinutes: "10,820"
    },

    "Grade 7": {
        averageScore: "85.7%",
        completion: "78.9%",
        students: "426",
        learningMinutes: "15,640"
    },

    "Grade 9": {
        averageScore: "87.3%",
        completion: "80.4%",
        students: "460",
        learningMinutes: "16,040"
    }
};

export const analyticsByRange = {
    "Last 7 Days": {
        averageScore: "83.6%",
        completion: "74.2%",
        students: "1,108",
        learningMinutes: "9,820"
    },

    "Last 30 Days": {
        averageScore: "84.2%",
        completion: "76.8%",
        students: "1,204",
        learningMinutes: "42,500"
    },

    "Last 90 Days": {
        averageScore: "82.9%",
        completion: "75.1%",
        students: "1,356",
        learningMinutes: "118,740"
    },

    "This Year": {
        averageScore: "81.8%",
        completion: "73.9%",
        students: "1,482",
        learningMinutes: "384,200"
    }
};

export const analyticsChartData = {
    "All Grades": {
        "Last 30 Days": {
            subjects: [
                { subject: "Science", mastered: 72, target: 84 },
                { subject: "Mathematics", mastered: 65, target: 83 },
                { subject: "ICT Studio", mastered: 78, target: 82 }
            ],

            grades: [18, 32, 29, 14, 7],

            learningMinutes: [
                1180, 1320, 1450, 1280, 1510,
                1640, 1720, 1580, 1810, 1760,
                1900, 1850
            ]
        },

        "Last 7 Days": {
            subjects: [
                { subject: "Science", mastered: 68, target: 84 },
                { subject: "Mathematics", mastered: 62, target: 83 },
                { subject: "ICT Studio", mastered: 74, target: 82 }
            ],

            grades: [16, 30, 31, 16, 7],

            learningMinutes: [
                1180, 1320, 1450, 1280,
                1510, 1640, 1720
            ]
        },

        "Last 90 Days": {
            subjects: [
                { subject: "Science", mastered: 75, target: 84 },
                { subject: "Mathematics", mastered: 69, target: 83 },
                { subject: "ICT Studio", mastered: 80, target: 82 }
            ],

            grades: [20, 34, 28, 12, 6],

            learningMinutes: [
                920, 1080, 1180, 1260, 1390,
                1450, 1510, 1600, 1680, 1750,
                1820, 1910
            ]
        },

        "This Year": {
            subjects: [
                { subject: "Science", mastered: 78, target: 84 },
                { subject: "Mathematics", mastered: 71, target: 83 },
                { subject: "ICT Studio", mastered: 82, target: 84 }
            ],

            grades: [22, 36, 27, 10, 5],

            learningMinutes: [
                980, 1120, 1260, 1390,
                1480, 1560, 1690, 1780,
                1860, 1940, 2050, 2180
            ]
        }
    }
};

export const curriculumByFilter = {
    "All Grades": {
        "Last 30 Days": curriculumModules,

        "Last 7 Days": [
            {
                id: 1,
                module: "S1.2: Quantum Apps (Gr 9)",
                score: 89,
                action: "On Track",
                status: "success"
            },
            {
                id: 2,
                module: "M2.4: Fraction Multiplication (Gr 4)",
                score: 54,
                action: "Review Content",
                status: "warning"
            },
            {
                id: 3,
                module: "I3.1: Python Loops (Gr 7)",
                score: 86,
                action: "On Track",
                status: "success"
            },
            {
                id: 4,
                module: "S3.2: Chemical Equilibrium (Gr 9)",
                score: 68,
                action: "Monitor",
                status: "neutral"
            }
        ],

        "Last 90 Days": [
            {
                id: 1,
                module: "S1.2: Quantum Apps (Gr 9)",
                score: 94,
                action: "On Track",
                status: "success"
            },
            {
                id: 2,
                module: "M2.4: Fraction Multiplication (Gr 4)",
                score: 63,
                action: "Review Content",
                status: "warning"
            },
            {
                id: 3,
                module: "I3.1: Python Loops (Gr 7)",
                score: 91,
                action: "On Track",
                status: "success"
            },
            {
                id: 4,
                module: "S3.2: Chemical Equilibrium (Gr 9)",
                score: 75,
                action: "Monitor",
                status: "neutral"
            }
        ],

        "This Year": [
            {
                id: 1,
                module: "S1.2: Quantum Apps (Gr 9)",
                score: 96,
                action: "On Track",
                status: "success"
            },
            {
                id: 2,
                module: "M2.4: Fraction Multiplication (Gr 4)",
                score: 67,
                action: "Review Content",
                status: "warning"
            },
            {
                id: 3,
                module: "I3.1: Python Loops (Gr 7)",
                score: 93,
                action: "On Track",
                status: "success"
            },
            {
                id: 4,
                module: "S3.2: Chemical Equilibrium (Gr 9)",
                score: 79,
                action: "Monitor",
                status: "neutral"
            }
        ]
    }
};