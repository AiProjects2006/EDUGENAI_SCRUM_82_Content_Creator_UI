import "./CreateCourseModal.css";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

function CreateCourseModal({ onClose, onSave, editingCourse }) {

    const [course, setCourse] = useState({
        id: "",
        title: "",
        category: "",
        grade: "",
        description: "",
        image: null
    });

    useEffect(() => {

        if (editingCourse) {

            setCourse({
                id: editingCourse.id,
                title: editingCourse.title,
                category: editingCourse.category,
                grade: editingCourse.grade,
                description: editingCourse.description || "",
                image: editingCourse.image
            });

        }

    }, [editingCourse]);

    const handleChange = (e) => {

        setCourse({
            ...course,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        onSave(course);

    };

    return (

        <div className="modal-overlay">

            <div className="course-modal">

                <div className="modal-header">

                    <h2>
                        {editingCourse ? "Edit Course" : "Create New Course"}
                    </h2>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        <X size={20}/>
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Course Title</label>

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

                        <label>Category</label>

                        <select
                            name="category"
                            value={course.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            <option>Science</option>
                            <option>Mathematics</option>
                            <option>ICT</option>
                        </select>

                    </div>

                    <div className="form-group">

                        <label>Grade</label>

                        <select
                            name="grade"
                            value={course.grade}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Grade</option>
                            <option>Grade 1</option>
                            <option>Grade 2</option>
                            <option>Grade 3</option>
                            <option>Grade 4</option>
                            <option>Grade 5</option>
                            <option>Grade 6</option>
                            <option>Grade 7</option>
                            <option>Grade 8</option>
                            <option>Grade 9</option>
                        </select>

                    </div>

                    <div className="form-group">

                        <label>Course Image</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setCourse({
                                    ...course,
                                    image: e.target.files[0]
                                })
                            }
                        />

                        {course.image && (

                            <div className="image-preview">

                                <img
                                    src={
                                        course.image instanceof File
                                            ? URL.createObjectURL(course.image)
                                            : course.image
                                    }
                                    alt="Preview"
                                />

                            </div>

                        )}

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
                        >
                            {editingCourse ? "Update Course" : "Create Course"}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default CreateCourseModal;