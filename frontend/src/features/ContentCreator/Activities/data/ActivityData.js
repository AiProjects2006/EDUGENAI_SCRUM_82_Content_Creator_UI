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
        id: "flashcards",
        label: "Flashcards",
        icon: "cards"
    },
    {
        id: "revision",
        label: "Revision",
        icon: "edit"
    }
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