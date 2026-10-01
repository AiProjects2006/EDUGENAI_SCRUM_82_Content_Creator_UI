import {
    ArrowLeft,
    BookOpen,
    Pencil,
    Users,
    CheckCircle,
    GraduationCap,
    FileText
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import BackofficeLayout from "../../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../../components/layout/Sidebar/CreatorSidebar";

import { getCourses } from "../data/courseData";

import "./CourseDetails.css";

function CourseDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const courses = getCourses();

    const course = courses.find(
        (item) => item.id === Number(id)
    );

    if (!course) {
        return (
            <BackofficeLayout sidebar={<CreatorSidebar />}>

                <div className="course-not-found">

                    <h1>Course Not Found</h1>

                    <p>
                        The course you are looking for does not exist.
                    </p>

                    <button
                        onClick={() => navigate("/course-management")}
                    >
                        Back to Course Management
                    </button>

                </div>

            </BackofficeLayout>
        );
    }

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="course-details-page">

                {/* Back Button */}

                <button
                    className="back-course-btn"
                    onClick={() => navigate("/course-management")}
                >
                    <ArrowLeft size={17} />
                    Back to Course Management
                </button>


                {/* Header */}

                <div className="course-details-header">

                    <div className="course-details-heading">

                        <span className="course-details-label">
                            COURSE DETAILS
                        </span>

                        <h1>
                            {course.name}
                        </h1>

                        <p>
                            {course.description ||
                                "No course description has been added yet."}
                        </p>

                    </div>

                    <button
                        className="edit-course-details-btn"
                        onClick={() =>
                            navigate(`/edit-course/${course.id}`)
                        }
                    >
                        <Pencil size={16} />
                        Edit Course
                    </button>

                </div>


                {/* Course Information */}

                <div className="course-details-grid">

                    <div className="course-detail-card">

                        <div className="course-detail-card-title">
                            <BookOpen size={18} />
                            Course Information
                        </div>

                        <div className="course-detail-row">
                            <span>Course Name</span>
                            <strong>{course.name}</strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Subject</span>
                            <strong>{course.subject}</strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Grade Level</span>
                            <strong>
                                {course.gradeLevel || "Not specified"}
                            </strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Primary Grade</span>
                            <strong>
                                {course.primaryGrade || "Not specified"}
                            </strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Author</span>
                            <strong>{course.author}</strong>
                        </div>

                    </div>


                    {/* Course Status */}

                    <div className="course-detail-card">

                        <div className="course-detail-card-title">
                            <CheckCircle size={18} />
                            Course Status
                        </div>

                        <div className="course-status-container">

                            <span
                                className={`course-status-large ${course.status.toLowerCase()}`}
                            >
                                {course.status}
                            </span>

                        </div>

                        <div className="course-stat-list">

                            <div className="course-stat-item">

                                <Users size={18} />

                                <div>
                                    <span>Enrollments</span>
                                    <strong>
                                        {course.enrollments}
                                    </strong>
                                </div>

                            </div>

                            <div className="course-stat-item">

                                <GraduationCap size={18} />

                                <div>
                                    <span>Completion</span>
                                    <strong>
                                        {course.completion}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Description */}

                <div className="course-description-card">

                    <div className="course-detail-card-title">
                        <FileText size={18} />
                        Course Description
                    </div>

                    <p>
                        {course.description ||
                            "No course description has been added yet."}
                    </p>

                </div>


                {/* Learning Objectives */}

                <div className="course-description-card">

                    <div className="course-detail-card-title">
                        <GraduationCap size={18} />
                        Learning Objectives
                    </div>

                    <p>
                        {course.objectives ||
                            "No learning objectives have been added yet."}
                    </p>

                </div>


                {/* Prerequisites */}

                <div className="course-description-card">

                    <div className="course-detail-card-title">
                        <BookOpen size={18} />
                        Prerequisites
                    </div>

                    <p>
                        {course.prerequisites ||
                            "No prerequisites have been added yet."}
                    </p>

                </div>

            </div>

        </BackofficeLayout>
    );
}

export default CourseDetails;