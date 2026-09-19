import {
    Plus,
    Pencil,
    Eye,
    ChevronDown,
    Clock3,
    BookOpen,
    Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";
import { getLessons, saveLessons } from "./data/lessonData.js";
import "./LessonManagement.css";

function LessonManagement() {

    const navigate = useNavigate();

    const [lessons, setLessons] = useState(() => getLessons());
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");

    const filteredLessons =
        selectedSubject === "All Subjects"
            ? lessons
            : lessons.filter(
                (lesson) => lesson.subject === selectedSubject
            );

    const handleDeleteLesson = (lesson) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${lesson.title}"?`
        );

        if (!confirmed) {
            return;
        }

        const updatedLessons = lessons.filter(
            (item) => item.id !== lesson.id
        );

        saveLessons(updatedLessons);
        setLessons(updatedLessons);
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="lesson-management-page">

                <div className="lesson-page-header">

                    <div>
                        <h1>Lesson Management</h1>

                        <p>
                            Review and organize instructional materials for
                            Science, Mathematics, and ICT (Grades 3-9).
                            Ensure all modules align with current academic
                            standards.
                        </p>
                    </div>

                    <button
                        className="create-lesson-btn"
                        onClick={() => navigate("/create-lesson")}
                    >
                        <Plus size={16} />
                        Create New Lesson
                    </button>

                </div>

                <div className="lesson-card-grid">

                    {lessons.map((lesson) => (

                        <div className="lesson-card" key={lesson.id}>

                            <div className="lesson-card-image">

                                <div className="lesson-card-placeholder">
                                    <BookOpen size={28} />
                                </div>

                                <span className="lesson-card-tag">
                                    {lesson.subject}
                                </span>

                            </div>

                            <div className="lesson-card-content">

                                <div className="lesson-card-title-row">

                                    <h3>{lesson.title}</h3>

                                </div>

                                <p>
                                    {lesson.description || "No description available."}
                                </p>

                                <div className="lesson-card-meta">

                                    <span>
                                        <Clock3 size={11} />
                                            {lesson.updated || "Just now"}
                                    </span>

                                    <button
                                        className="continue-lesson-btn"
                                        onClick={() =>
                                            navigate(`/lesson/${lesson.id}`)
                                        }
                                    >
                                        Continue →
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

                {/* Curriculum Analytics */}
                <section className="curriculum-section">

                    <div className="curriculum-header">

                        <div className="curriculum-title">
                            <BookOpen size={14} />
                            <span>Curriculum Analytics & Status</span>
                        </div>

                        <div className="filter-area">

                            <span>FILTER BY:</span>

                            <div className="subject-filter">

                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="All Subjects">
                                        ALL SUBJECTS
                                    </option>

                                    <option value="Science">
                                        SCIENCE
                                    </option>

                                    <option value="Math">
                                        MATH
                                    </option>

                                    <option value="ICT">
                                        ICT
                                    </option>
                                </select>

                                <ChevronDown size={12} />

                            </div>

                        </div>

                    </div>

                    <div className="lesson-table-wrapper">

                        <table className="lesson-table">

                            <thead>
                            <tr>
                                <th>LESSON TITLE</th>
                                <th>SUBJECT</th>
                                <th>GRADE</th>
                                <th>COMPLIANCE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                            </thead>

                            <tbody>

                            {filteredLessons.map((lesson) => (

                                <tr key={lesson.id}>

                                    <td>
                                        {lesson.title}
                                    </td>

                                    <td>
                                            <span className="subject-name">
                                                {lesson.subject}
                                            </span>
                                    </td>

                                    <td>
                                        {lesson.grade}
                                    </td>

                                    <td>

                                        <div className="compliance-cell">

                                            <div className="compliance-bar">
                                                    <span
                                                        style={{
                                                            width: `${lesson.compliance}%`
                                                        }}
                                                    />
                                            </div>

                                            <small>
                                                {lesson.compliance}%
                                            </small>

                                        </div>

                                    </td>

                                    <td>
                                            <span
                                                className={`lesson-status ${
                                                    lesson.status === "PUBLISHED"
                                                        ? "published"
                                                        : "draft"
                                                }`}
                                            >
                                                {lesson.status}
                                            </span>
                                    </td>

                                    <td>

                                        <div className="action-buttons">

                                            <button
                                                className="action-btn edit-btn"
                                                title="Edit lesson"
                                                onClick={() => navigate(`/edit-lesson/${lesson.id}`)}
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                className="action-btn view-btn"
                                                title="View lesson"
                                                onClick={() => navigate(`/lesson/${lesson.id}`)}
                                            >
                                                <Eye size={18} />
                                            </button>

                                            <button
                                                className="action-btn delete-btn"
                                                title="Delete lesson"
                                                onClick={() => handleDeleteLesson(lesson)}
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                        </div>




                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>

                    <div className="analytics-footer">
                        View AI Curriculum Compliance →
                    </div>

                </section>

            </div>

        </BackofficeLayout>
    );
}

export default LessonManagement;