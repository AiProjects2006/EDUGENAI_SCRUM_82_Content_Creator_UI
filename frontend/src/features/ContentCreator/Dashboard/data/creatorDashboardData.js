import {
    BookOpen,
    FileText,
    Sparkles,
    Users
} from "lucide-react";

export const creatorStats = [

    {
        title: "Total Courses",
        value: 12,
        icon: BookOpen
    },

    {
        title: "Total Lessons",
        value: 84,
        icon: FileText
    },

    {
        title: "AI Activities",
        value: 215,
        icon: Sparkles
    },

    {
        title: "Active Students",
        value: 1420,
        icon: Users
    }

];

export const performanceData = [
    { month: "Jan", views: 180 },
    { month: "Feb", views: 220 },
    { month: "Mar", views: 260 },
    { month: "Apr", views: 240 },
    { month: "May", views: 310 },
    { month: "Jun", views: 380 },
    { month: "Jul", views: 420 },
];

export const myCourses = [
    {
        id: 1,
        title: "Junior Science",
        category: "Science",
        grade: "Grade 6",
        image: "/images/science.jpg",
        students: 125,
        lessons: 24,
        rating: 4.8,
        progress: 82
    },
    {
        id: 2,
        title: "Elementary Math",
        category: "Mathematics",
        grade: "Grade 8",
        image: "/images/math.jpg",
        students: 98,
        lessons: 18,
        rating: 4.9,
        progress: 67
    },
    {
        id: 3,
        title: "ICT Basics",
        category: "Technology",
        grade: "Grade 9",
        image: "/images/ict.jpg",
        students: 210,
        lessons: 30,
        rating: 4.7,
        progress: 91
    }
];

export const recentActivities = [
    {
        id: 1,
        title: "Solar System Quiz",
        type: "MCQ",
        questions: 10,
        generated: "2026-07-28",
        status: "Published"
    },
    {
        id: 2,
        title: "Human Body Flashcards",
        type: "Flashcards",
        questions: 20,
        generated: "2026-07-27",
        status: "Draft"
    },
    {
        id: 3,
        title: "Fractions Matching",
        type: "Matching",
        questions: 15,
        generated: "2026-07-26",
        status: "Published"
    },
    {
        id: 4,
        title: "Plant Cells",
        type: "Short Answer",
        questions: 8,
        generated: "2026-07-25",
        status: "Review"
    }
];

export const attentionCourses = [
    {
        id: 1,
        course: "Junior Science",
        issue: "Low Completion",
        priority: "High",
        action: "Review"
    },
    {
        id: 2,
        course: "Elementary Math",
        issue: "No Activity",
        priority: "Medium",
        action: "Update"
    },
    {
        id: 3,
        course: "ICT Basics",
        issue: "Pending Publish",
        priority: "Low",
        action: "Publish"
    }
];