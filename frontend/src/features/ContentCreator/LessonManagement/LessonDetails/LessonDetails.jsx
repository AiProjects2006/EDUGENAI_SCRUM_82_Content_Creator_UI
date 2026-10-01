import {
    ArrowLeft,
    BookOpen,
    FileText,
    Pencil
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { getLessons } from "../data/lessonData.js";

import BackofficeLayout from "../../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../../components/layout/Sidebar/CreatorSidebar";

import "./LessonDetails.css";

function LessonDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const lessons = getLessons();

    const lesson = lessons.find(
        (item) => item.id === Number(id)
    );

    if (!lesson) {
        return (
            <BackofficeLayout sidebar={<CreatorSidebar />}>

                <div className="lesson-not-found">

                    <h1>Lesson Not Found</h1>

                    <button
                        onClick={() => navigate("/lesson-management")}
                    >
                        Back to Lesson Management
                    </button>

                </div>

            </BackofficeLayout>
        );
    }

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="lesson-details-page">

                <button
                    className="back-lesson-btn"
                    onClick={() => navigate("/lesson-management")}
                >
                    <ArrowLeft size={17} />
                    Back to Lesson Management
                </button>

                <div className="lesson-details-header">

                    <div>

                        <span className="lesson-details-label">
                            LESSON DETAILS
                        </span>

                        <h1>{lesson.title}</h1>

                        <p>
                            {lesson.description}
                        </p>

                    </div>

                    <button
                        className="edit-details-btn"
                        onClick={() =>
                            navigate(`/edit-lesson/${lesson.id}`)
                        }
                    >
                        <Pencil size={15} />
                        Edit Lesson
                    </button>

                </div>

                <div className="lesson-details-grid">

                    <div className="lesson-detail-card">

                        <div className="detail-card-title">
                            <BookOpen size={17} />
                            Lesson Information
                        </div>

                        <div className="detail-row">
                            <span>Subject</span>
                            <strong>{lesson.subject}</strong>
                        </div>

                        <div className="detail-row">
                            <span>Grade</span>
                            <strong>{lesson.grade}</strong>
                        </div>

                        <div className="detail-row">
                            <span>Topic / Chapter</span>
                            <strong>{lesson.topic}</strong>
                        </div>

                        <div className="detail-row">
                            <span>Last Updated</span>
                            <strong>{lesson.updated}</strong>
                        </div>

                    </div>

                    <div className="lesson-detail-card">

                        <div className="detail-card-title">
                            <FileText size={17} />
                            Lesson Status
                        </div>

                        <div className="status-detail">

                            <span
                                className={`lesson-status-large ${
                                    lesson.status === "PUBLISHED"
                                        ? "published"
                                        : "draft"
                                }`}
                            >
                                {lesson.status}
                            </span>

                        </div>

                        <div className="compliance-detail">

                            <div className="compliance-heading">
                                <span>Curriculum Compliance</span>
                                <strong>{lesson.compliance}%</strong>
                            </div>

                            <div className="compliance-progress">
                                <span
                                    style={{
                                        width: `${lesson.compliance}%`
                                    }}
                                />
                            </div>

                        </div>

                    </div>

                </div>

                <div className="lesson-description-card">

                    <div className="detail-card-title">
                        <FileText size={17} />
                        Lesson Description
                    </div>

                    <p>
                        {lesson.description}
                    </p>

                </div>

            </div>

        </BackofficeLayout>
    );
}

export default LessonDetails;