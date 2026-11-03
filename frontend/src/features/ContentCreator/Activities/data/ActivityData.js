export const courses = [
    {
        id: "quantum-mechanics",
        name: "Introduction to Quantum Mechanics",
        lessons: [
            "Schrödinger's Wave Equation",
            "Quantum Superposition",
            "Wave-Particle Duality",
            "Heisenberg Uncertainty Principle"
        ]
    },
    {
        id: "advanced-mathematics",
        name: "Advanced Mathematics",
        lessons: [
            "Differential Equations",
            "Linear Algebra",
            "Complex Numbers",
            "Fourier Analysis"
        ]
    },
    {
        id: "physics",
        name: "Physics Fundamentals",
        lessons: [
            "Newton's Laws",
            "Energy and Momentum",
            "Electricity and Magnetism",
            "Thermodynamics"
        ]
    }
];

export const activityTypes = [
    {
        id: "mcq",
        label: "MCQs",
        icon: "circle"
    },
    {
        id: "fill-blanks",
        label: "Fill in Blanks",
        icon: "lines"
    },
    {
        id: "true-false",
        label: "True / False",
        icon: "trueFalse"
    },
    {
        id: "quiz",
        label: "Quiz",
        icon: "quiz"
    },
    {
        id: "essay",
        label: "Essay",
        icon: "edit"
    },
    {
        id: "matching",
        label: "Matching",
        icon: "cards"
    },
    {
        id: "sorting",
        label: "Sorting",
        icon: "sorting"
    },
    {
        id: "drag-drop",
        label: "Drag & Drop",
        icon: "dragDrop"
    },
    {
        id: "poll",
        label: "Poll",
        icon: "poll"
    },
    {
        id: "short-answer",
        label: "Short Answer",
        icon: "shortAnswer"
    },
    {
        id: "hotspot",
        label: "Hotspot",
        icon: "hotspot"
    },
    {
        id: "problem-solving",
        label: "Problem Solving",
        icon: "problemSolving"
    },
    {
        id: "application-based",
        label: "Application Based",
        icon: "applicationBased"
    },
    {
        id: "timed-quiz",
        label: "Timed Quiz",
        icon: "timedQuiz"
    },
    {
        id: "challenge-quiz",
        label: "Challenge Quiz",
        icon: "challengeQuiz"
    },
];

export const difficultyLevels = [
    "Easy",
    "Medium",
    "Hard"
];

export const defaultGeneratorSettings = {
    activityType: "mcq",
    difficulty: "Medium"
};