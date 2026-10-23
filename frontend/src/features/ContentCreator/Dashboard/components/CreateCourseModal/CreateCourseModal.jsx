import "./CreateCourseModal.css";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

function CreateCourseModal({ onClose, onSave, editingCourse }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [course, setCourse] = useState({
        id: "",
        title: "",
        category: "Mathematics",
        grade: "Grade 3",
        description: ""
    });

    useEffect(() => {
        if (editingCourse) {
            setCourse({
                id: editingCourse.id,
                title: editingCourse.title || editingCourse.name || "",
                category: editingCourse.category || editingCourse.subject || "Mathematics",
                grade: editingCourse.grade || editingCourse.gradeLevel || "Grade 3",
                description: editingCourse.description || ""
            });
        }
    }, [editingCourse]);

    const handleChange = (e) => {
        setCourse({
            ...course,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSave(course);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="course-modal">
                <div className="modal-header">
                    <h2>
                        {editingCourse ? "Edit Course" : "Create New Course"}
                    </h2>
                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Course Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={course.title}
                            onChange={handleChange}
                            placeholder="Enter course title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Subject / Category *</label>
                        <select
                            name="category"
                            value={course.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="Mathematics">Mathematics</option>
                            <option value="Environmental Studies">Environmental Studies</option>
                            <option value="ICT">ICT</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Grade *</label>
                        <select
                            name="grade"
                            value={course.grade}
                            onChange={handleChange}
                            required
                        >
                            <option value="Grade 3">Grade 3</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Grade 5">Grade 5</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            value={course.description}
                            onChange={handleChange}
                            placeholder="Course description..."
                        />
                    </div>

                    <div className="modal-buttons">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Saving..."
                                : editingCourse ? "Update Course" : "Create Course"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCourseModal;