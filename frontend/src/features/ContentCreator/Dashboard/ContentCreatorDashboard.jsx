import "./ContentCreatorDashboard.css";
import BackofficeLayout from "../../../components/layout/BackofficeLayout.jsx";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";
import CreatorStats from "./components/CreatorStats/CreatorStats.jsx";
import { creatorStats } from "./data/creatorDashboardData.js";
import CreatorAnalytics from "./components/CreatorAnalytics/CreatorAnalytics";
import EngagementInsights from "./components/EngagementInsights/EngagementInsights.jsx";
import MyCourses from "./components/MyCourses/MyCourses";
import RecentActivities from "./components/RecentActivities/RecentActivities";
import AttentionTable from "./components/AttentionTable/AttentionTable";
import AIQuickActions from "./components/AIQuickActions/AIQuickActions";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateCourseModal from "./components/CreateCourseModal/CreateCourseModal";
import { myCourses } from "./data/creatorDashboardData";
import CourseDetailsModal from "./components/CourseDetailsModal/CourseDetailsModal.jsx";
import { useNavigate } from "react-router-dom";

function ContentCreatorDashboard() {

    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courses, setCourses] = useState(myCourses);
    const [editingCourse, setEditingCourse] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    const handleUpdateCourse = (updatedCourse) => {

        setCourses(prev =>
            prev.map(course => {

                if (course.id !== updatedCourse.id) {
                    return course;
                }

                return {
                    ...course,
                    ...updatedCourse,

                    image: updatedCourse.image
                        ? (
                            updatedCourse.image instanceof File
                                ? URL.createObjectURL(updatedCourse.image)
                                : updatedCourse.image
                        )
                        : course.image
                };

            })
        );

        setEditingCourse(null);

        setShowCourseModal(false);

    };

    const handleAddCourse = (course) => {

        const newCourse = {
            id: Date.now(),
            title: course.title,
            category: course.category,
            grade: course.grade,
            description:course.description,
            image: course.image
                ? URL.createObjectURL(course.image)
                : "https://placehold.co/600x400?text=Course",
            rating: 0,
            students: 0,
            lessons: 0,
            progress: 0,
            status: "Draft"
        };

        setCourses(prev => [...prev, newCourse]);

        setShowCourseModal(false);

    };

    return (
        <BackofficeLayout

            sidebar={<CreatorSidebar />}
            >

            <div className="creator-page">

                <div className="creator-header">

                    <div>

                        <h1 className="creator-title">
                            Content Creator Dashboard
                        </h1>

                        <p className="creator-subtitle">
                            Create engaging educational content powered by AI.
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
                        Engagement is up by <strong>15%</strong> compared to last month.
                    </p>

                </div>

                <div className="creator-stats">

                    {creatorStats.map((stat) => (

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