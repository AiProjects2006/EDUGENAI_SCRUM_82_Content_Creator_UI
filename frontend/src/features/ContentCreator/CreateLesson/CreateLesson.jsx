import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessons, saveLessons } from "../LessonManagement/data/lessonData.js";
import {
    BookOpen,
    UploadCloud,
    FileText,
    CheckCircle,
    Trash2,
    Save
} from "lucide-react";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";

import "./CreateLesson.css";

function CreateLesson() {

    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const lessons = getLessons();

    const selectedLesson = isEditMode
        ? lessons.find((lesson) => lesson.id === Number(id))
        : null;

    const [formData, setFormData] = useState(() => ({
        lessonTitle: selectedLesson?.title || "",
        topic: selectedLesson?.topic || "",
        subject: selectedLesson?.subject || "",
        gradeLevel: selectedLesson?.grade || "",
        description: selectedLesson?.description || ""
    }));

    const [file, setFile] = useState(
        () => selectedLesson?.file || null
    );

    if (isEditMode && !selectedLesson) {
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) {
            return;
        }

        const maxSize = 50 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            alert("File size must be 50MB or less.");
            e.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.lessonTitle.trim()) {
            alert("Please enter a lesson title.");
            return;
        }

        if (!formData.subject) {
            alert("Please select a subject.");
            return;
        }

        if (!formData.gradeLevel) {
            alert("Please select a grade level.");
            return;
        }

        const existingLessons = getLessons();

        if (isEditMode && selectedLesson) {
            const updatedLessons = existingLessons.map((lesson) =>
                lesson.id === Number(id)
                    ? {
                        ...lesson,
                        title: formData.lessonTitle,
                        topic: formData.topic,
                        subject: formData.subject,
                        grade: formData.gradeLevel,
                        description: formData.description,
                        updated: "Just now",
                        file: file
                            ? {
                                name: file.name,
                                size: file.size,
                                type: file.type
                            }
                            : lesson.file || null
                    }
                    : lesson
            );

            saveLessons(updatedLessons);

            alert("Lesson updated successfully!");

            navigate("/lesson-management");
            return;
        }

        const newLesson = {
            id: Date.now(),
            title: formData.lessonTitle,
            topic: formData.topic,
            subject: formData.subject,
            grade: formData.gradeLevel,
            description: formData.description,
            compliance: 0,
            status: "PUBLISHED",
            updated: "Just now",
            file: file
                ? {
                    name: file.name,
                    size: file.size,
                    type: file.type
                }
                : null
        };

        saveLessons([
            ...existingLessons,
            newLesson
        ]);

        alert("Lesson saved successfully!");

        navigate("/lesson-management");
    };

    const handleSaveDraft = () => {
        if (!formData.lessonTitle.trim()) {
            alert("Please enter a lesson title.");
            return;
        }

        const existingLessons = getLessons();

        const draftLesson = {
            id: Date.now(),
            title: formData.lessonTitle,
            subject: formData.topic || "General",
            grade: "08",
            compliance: 0,
            status: "DRAFT",
            topic: formData.topic,
            description: formData.description,
            updated: "Just now"
        };

        saveLessons([
            ...existingLessons,
            draftLesson
        ]);

        alert("Lesson saved as draft!");

        navigate("/lesson-management");
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="create-lesson-page">

                <div className="create-lesson-card">

                    <div className="lesson-heading">
                        <h1>
                            {isEditMode ? "Edit Lesson" : "Create New Lesson"}
                        </h1>
                        <p>
                            Create and upload lesson content for your students.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <section className="lesson-section">

                            <div className="section-title">
                                <BookOpen size={14} />
                                <span>Lesson Information</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lessonTitle">
                                    Lesson Title
                                </label>

                                <input
                                    id="lessonTitle"
                                    name="lessonTitle"
                                    type="text"
                                    placeholder="e.g. Introduction to Quadratic Equations"
                                    value={formData.lessonTitle}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="topic">
                                    Topic / Chapter
                                </label>

                                <input
                                    id="topic"
                                    name="topic"
                                    type="text"
                                    placeholder="e.g. Chapter 4: Algebraic Functions"
                                    value={formData.topic}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="subject">
                                    Subject
                                </label>

                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Subject</option>
                                    <option value="Science">Science</option>
                                    <option value="Math">Math</option>
                                    <option value="ICT">ICT</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="gradeLevel">
                                    Grade Level
                                </label>

                                <select
                                    id="gradeLevel"
                                    name="gradeLevel"
                                    value={formData.gradeLevel}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Grade</option>
                                    <option value="03">Grade 3</option>
                                    <option value="04">Grade 4</option>
                                    <option value="05">Grade 5</option>
                                    <option value="06">Grade 6</option>
                                    <option value="07">Grade 7</option>
                                    <option value="08">Grade 8</option>
                                    <option value="09">Grade 9</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">
                                    Lesson Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="Outline the key learning objectives and summary of this lesson..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                        </section>

                        <section className="lesson-section">

                            <div className="section-title">
                                <UploadCloud size={14} />
                                <span>Content Upload</span>
                            </div>

                            <div className="upload-area">

                                <input
                                    id="lesson-file"
                                    type="file"
                                    accept=".pdf,.mp4,.ppt,.pptx"
                                    hidden
                                    onChange={handleFileChange}
                                />

                                <div className="upload-icon">
                                    <FileText size={18} />
                                </div>

                                <p className="upload-main-text">
                                    Drag & drop files here
                                </p>

                                <p className="upload-sub-text">
                                    Support for PDF, MP4, PPTX up to 50MB
                                </p>

                                <label
                                    htmlFor="lesson-file"
                                    className="browse-btn"
                                >
                                    Browse Files
                                </label>

                            </div>

                            {file && (
                                <div className="uploaded-file">

                                    <div className="file-left">

                                        <div className="file-icon">
                                            <FileText size={17} />
                                        </div>

                                        <div className="file-info">
                                            <strong>
                                                {file.name}
                                            </strong>

                                            <span>
                                                {(file.size / 1024 / 1024).toFixed(1)}
                                                {" "}MB
                                            </span>
                                        </div>

                                    </div>

                                    <div className="file-actions">

                                        <span className="ready">
                                            <CheckCircle size={13} />
                                            Ready
                                        </span>

                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="delete-file"
                                        >
                                            <Trash2 size={15} />
                                        </button>

                                    </div>

                                </div>
                            )}

                        </section>

                        <div className="lesson-actions">

                            <button
                                type="submit"
                                className="save-lesson-btn"
                            >
                                <Save size={14} />
                                {isEditMode ? "Update Lesson" : "Save Lesson"}
                            </button>

                            <div className="secondary-actions">

                                <button
                                    type="button"
                                    className="save-draft-btn"
                                    onClick={handleSaveDraft}
                                >
                                    Save as Draft
                                </button>

                                <button
                                    type="button"
                                    className="cancel-lesson-btn"
                                    onClick={() => navigate("/lesson-management")}
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>

                    </form>

                </div>

            </div>

        </BackofficeLayout>
    );
}

export default CreateLesson;