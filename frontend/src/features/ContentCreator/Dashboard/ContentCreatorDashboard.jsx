import "./ContentCreatorDashboard.css";
import BackofficeLayout from "../../../components/layout/BackofficeLayout.jsx";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";
import CreatorStats from "./components/CreatorStats/CreatorStats.jsx";
import CreatorAnalytics from "./components/CreatorAnalytics/CreatorAnalytics";
import EngagementInsights from "./components/EngagementInsights/EngagementInsights.jsx";
import MyCourses from "./components/MyCourses/MyCourses";
import RecentActivities from "./components/RecentActivities/RecentActivities";
import AttentionTable from "./components/AttentionTable/AttentionTable";
import AIQuickActions from "./components/AIQuickActions/AIQuickActions";
import { Plus, BookOpen, Clock, Users, Award } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import CreateCourseModal from "./components/CreateCourseModal/CreateCourseModal";
import CourseDetailsModal from "./components/CourseDetailsModal/CourseDetailsModal.jsx";
import { useNavigate } from "react-router-dom";
import {
    fetchCoursesFromBackoffice,
    createCourseInBackoffice,
    updateCourseInBackoffice,
    deduplicateCourses
} from "../../../services/backofficeService";

const formatDashboardCourse = (c) => ({
    id: c.id,
    title: c.title || c.name || "Untitled Course",
    category: c.subject || "General",
    grade: c.grade || c.gradeLevel || "Grade 3-5",
    description: c.description || "",
    image: c.thumbnailUrl || c.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    students: c.enrollments !== undefined ? c.enrollments : 0,
    lessons: c.lessons || 10,
    progress: parseInt(c.completion || "75") || 75,
    status: c.status || "Published"
});

function ContentCreatorDashboard() {

    const [showCourseModal, setShowCourseModal] = useState(false);
    const [rawCourses, setRawCourses] = useState([]);
    const [editingCourse, setEditingCourse] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    const loadCourses = useCallback(async () => {
        try {
            const data = await fetchCoursesFromBackoffice();
            if (Array.isArray(data)) {
                setRawCourses(data);
            }
        } catch (e) {
            console.error("Failed loading courses for creator dashboard:", e);
        }
    }, []);

    useEffect(() => {
        loadCourses();
        window.addEventListener("focus", loadCourses);
        const interval = setInterval(loadCourses, 15000);
        return () => {
            window.removeEventListener("focus", loadCourses);
            clearInterval(interval);
        };
    }, [loadCourses]);

    const uniqueCourses = deduplicateCourses(rawCourses);
    const courses = uniqueCourses.map(formatDashboardCourse);

    const totalCourses = uniqueCourses.length;
    const publishedCourses = uniqueCourses.filter(
        c => (c.status || "").toLowerCase() === "published" || (c.status || "").toLowerCase() === "approved"
    ).length;
    const draftCourses = uniqueCourses.filter(
        c => (c.status || "").toLowerCase() === "draft" || (c.status || "").toLowerCase() === "pending"
    ).length;
    const totalStudents = uniqueCourses.reduce(
        (sum, c) => sum + (Number(c.enrollments) || 0), 0
    );

    const stats = [
        {
            title: "Total Courses",
            value: totalCourses > 0 ? String(totalCourses) : "0",
            icon: BookOpen
        },
        {
            title: "Active Courses",
            value: String(publishedCourses),
            icon: Award
        },
        {
            title: "Draft Courses",
            value: String(draftCourses),
            icon: Clock
        },
        {
            title: "Total Students",
            value: totalStudents > 0 ? totalStudents.toLocaleString() : "4,550",
            icon: Users
        }
    ];

    const handleUpdateCourse = async (updatedCourse) => {
        await updateCourseInBackoffice(updatedCourse.id, {
            title: updatedCourse.title,
            name: updatedCourse.title,
            subject: updatedCourse.category,
            gradeLevel: updatedCourse.grade,
            description: updatedCourse.description
        });
        await loadCourses();
        setEditingCourse(null);
        setShowCourseModal(false);
    };

    const handleAddCourse = async (course) => {
        await createCourseInBackoffice({
            title: course.title,
            name: course.title,
            subject: course.category || "Science",
            gradeLevel: course.grade || "Grade 3-5",
            description: course.description || "",
            status: "Draft"
        });
        await loadCourses();
        setShowCourseModal(false);
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="creator-page">

                <div className="creator-header">

                    <div>
                        <h1 className="creator-title">
                            Content Creator Dashboard
                        </h1>

                        <p className="creator-subtitle">
                            Create engaging educational content across all grades and subjects.
                        </p>
                    </div>

                    <button
                        className="create-course-btn"
                        onClick={() => navigate("/create-course")}
                    >
                        <Plus size={20}/>
                        Create New Course
                    </button>

                </div>

                <div className="welcome-content">
                    <h2>
                        Welcome Back, Alex! 👋
                    </h2>

                    <p>
                        Your creativity is inspiring learners every day.
                        {totalCourses > 0 && ` You currently have ${totalCourses} courses in the curriculum.`}
                    </p>
                </div>

                <div className="creator-stats">
                    {stats.map((stat) => (
                        <CreatorStats
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                        />
                    ))}
                </div>

                <div className="analytics-section">
                    <CreatorAnalytics />
                    <EngagementInsights />
                </div>

                <MyCourses
                    courses={courses}
                    onEdit={(course) => {
                        setEditingCourse(course);
                        setShowCourseModal(true);
                    }}
                    onView={setSelectedCourse}
                />

                <RecentActivities />

                <AIQuickActions />

                <AttentionTable />

            </div>

            {showCourseModal && (
                <CreateCourseModal
                    editingCourse={editingCourse}
                    onClose={() => {
                        setShowCourseModal(false);
                        setEditingCourse(null);
                    }}
                    onSave={editingCourse
                        ? handleUpdateCourse
                        : handleAddCourse
                    }
                />
            )}

            {selectedCourse && (
                <CourseDetailsModal
                    course={selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                />
            )}

        </BackofficeLayout>
    );
}

export default ContentCreatorDashboard;