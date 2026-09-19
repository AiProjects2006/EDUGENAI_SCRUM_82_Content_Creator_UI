import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateCourse.css";
import {getCourses, saveCourses} from "../../CourseManagement/data/courseData";
import { Archive } from "lucide-react";

function CreateCourse() {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const courses = getCourses();

    const courseToEdit = courses.find(
        (course) => course.id === Number(id)
    );

    const [formData, setFormData] = useState(() => ({
        title: courseToEdit?.name || "",
        gradeLevel: courseToEdit?.gradeLevel || "",
        subject: courseToEdit?.subject || "",
        description: courseToEdit?.description || "",
        objectives: courseToEdit?.objectives || "",
        primaryGrade: courseToEdit?.primaryGrade || "",
        prerequisites: courseToEdit?.prerequisites || "",
        thumbnail: null
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            thumbnail: e.target.files[0]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Please enter a course title.");
            return;
        }

        if (!formData.gradeLevel) {
            alert("Please select a grade level.");
            return;
        }

        if (!formData.subject) {
            alert("Please select a subject.");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter a course description.");
            return;
        }

        const currentCourses = getCourses();

        if (isEditMode) {

            const updatedCourses = currentCourses.map((course) =>
                course.id === Number(id)
                    ? {
                        ...course,
                        name: formData.title,
                        subject: formData.subject,
                        gradeLevel: formData.gradeLevel,
                        description: formData.description,
                        objectives: formData.objectives,
                        primaryGrade: formData.primaryGrade,
                        prerequisites: formData.prerequisites,
                        thumbnail: formData.thumbnail
                            ? formData.thumbnail.name
                            : course.thumbnail,

                        status: "Published"
                    }
                    : course
            );

            saveCourses(updatedCourses);

            alert("Course published successfully!");
        } else {

            const newCourse = {
                id: Date.now(),
                name: formData.title,
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                description: formData.description,
                objectives: formData.objectives,
                primaryGrade: formData.primaryGrade,
                prerequisites: formData.prerequisites,
                thumbnail: formData.thumbnail
                    ? formData.thumbnail.name
                    : null,
                author: "Alex Rivers",
                enrollments: 0,
                completion: "0%",
                status: "Published"
            };

            saveCourses([
                ...currentCourses,
                newCourse
            ]);

            alert("Course published successfully!");
        }

        navigate("/course-management");
    };

    const handleSaveDraft = () => {

        if (!formData.title.trim()) {
            alert("Please enter a course title before saving.");
            return;
        }

        const currentCourses = getCourses();

        if (isEditMode) {

            const updatedCourses = currentCourses.map((course) =>
                course.id === Number(id)
                    ? {
                        ...course,
                        name: formData.title,
                        gradeLevel: formData.gradeLevel,
                        subject: formData.subject,
                        description: formData.description,
                        objectives: formData.objectives,
                        primaryGrade: formData.primaryGrade,
                        prerequisites: formData.prerequisites,
                        thumbnail: formData.thumbnail
                            ? formData.thumbnail.name
                            : course.thumbnail,
                        status: "Draft"
                    }
                    : course
            );

            saveCourses(updatedCourses);

            alert("Course saved as draft!");

        } else {

            const newDraft = {
                id: Date.now(),
                name: formData.title,
                gradeLevel: formData.gradeLevel || "",
                subject: formData.subject || "",
                description: formData.description || "",
                objectives: formData.objectives || "",
                primaryGrade: formData.primaryGrade || "",
                prerequisites: formData.prerequisites || "",
                thumbnail: formData.thumbnail
                    ? formData.thumbnail.name
                    : null,
                author: "Alex Rivers",
                enrollments: 0,
                completion: "0%",
                status: "Draft"
            };

            saveCourses([
                ...currentCourses,
                newDraft
            ]);

            alert("Course saved as draft!");
        }

        navigate("/course-management");
    };

    const handleArchive = () => {
        if (!isEditMode) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to archive this course?"
        );

        if (!confirmed) {
            return;
        }

        const currentCourses = getCourses();

        const updatedCourses = currentCourses.map((course) =>
            course.id === Number(id)
                ? {
                    ...course,
                    status: "Archived"
                }
                : course
        );

        saveCourses(updatedCourses);

        alert("Course archived successfully!");

        navigate("/course-management");
    };

    return (
        <div className="create-course-page">

            <div className="create-course-header">

                <h1>
                    {isEditMode ? "Edit Course" : "Create New Course"}
                </h1>

                <p>
                    {isEditMode
                        ? "Update the course details below."
                        : "Fill in the details below to design your high-performance educational module."
                    }
                </p>

            </div>

            <form
                className="create-course-form"
                onSubmit={handleSubmit}
            >

                {/* Course Title */}

                <div className="form-group full-width">

                    <label>Course Title</label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Advanced Astrophysics"
                    />

                </div>


                {/* Grade + Subject */}

                <div className="form-row">

                    <div className="form-group">

                        <label>Grade Level</label>

                        <select
                            name="gradeLevel"
                            value={formData.gradeLevel}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select grade level
                            </option>

                            <option value="Grade 1-2">
                                Grade 1-2
                            </option>

                            <option value="Grade 3-5">
                                Grade 3-5
                            </option>

                            <option value="Grade 6-8">
                                Grade 6-9
                            </option>


                        </select>

                    </div>


                    <div className="form-group">

                        <label>Subject</label>

                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select subject
                            </option>

                            <option value="Science">
                                Science
                            </option>

                            <option value="Mathematics">
                                Mathematics
                            </option>

                            <option value="ICT">
                                ICT
                            </option>

                        </select>

                    </div>

                </div>


                {/* Description */}

                <div className="form-group full-width">

                    <label>Description</label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the course objectives..."
                    />

                </div>


                {/* Learning Objectives */}

                <div className="form-group full-width">

                    <label>Learning Objectives</label>

                    <textarea
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                        placeholder="List the key takeaways for the course..."
                    />

                </div>


                {/* Primary Grade + Prerequisites */}

                <div className="form-row">

                    <div className="form-group">

                        <label>Primary Grade Level</label>

                        <select
                            name="primaryGrade"
                            value={formData.primaryGrade}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select primary grade
                            </option>

                            <option value="Beginner">
                                Beginner (Grades 3-4)
                            </option>

                            <option value="Intermediate">
                                Intermediate (Grades 5-6)
                            </option>

                            <option value="Advanced">
                                Advanced (Grades 7-8)
                            </option>

                        </select>

                    </div>


                    <div className="form-group">

                        <label>Prerequisites</label>

                        <input
                            type="text"
                            name="prerequisites"
                            value={formData.prerequisites}
                            onChange={handleChange}
                            placeholder="e.g. Basic Algebra, Reading Level 4"
                        />

                    </div>

                </div>


                {/* Thumbnail */}

                <div className="form-group full-width">

                    <label>Thumbnail Upload</label>

                    <label className="upload-area">

                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleFileChange}
                        />

                        <div className="upload-content">

                            <div className="upload-icon">
                                ↑
                            </div>

                            <p>
                                Click to upload or drag and drop
                            </p>

                            <span>
                                PNG, JPG up to 10MB
                            </span>

                        </div>

                    </label>

                    {formData.thumbnail && (
                        <div className="thumbnail-preview">

                            <img
                                src={
                                    typeof formData.thumbnail === "string"
                                        ? formData.thumbnail
                                        : URL.createObjectURL(formData.thumbnail)
                                }
                                alt="Course thumbnail preview"
                            />

                            <div className="thumbnail-info">
                                <span>{formData.thumbnail.name || "Course Thumbnail"}</span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            thumbnail: null
                                        }))
                                    }
                                >
                                    Remove
                                </button>
                            </div>

                        </div>
                    )}

                </div>


                {/* Actions */}

                <div className="form-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate("/course-management")}
                    >
                        Cancel
                    </button>

                    {isEditMode && (
                        <button
                            type="button"
                            className="archive-btn"
                            onClick={handleArchive}
                        >
                            <Archive size={16} />
                            Archive Course
                        </button>
                    )}

                    <button
                        type="button"
                        className="draft-btn"
                        onClick={handleSaveDraft}
                    >
                        Save Draft
                    </button>

                    <button
                        type="submit"
                        className="publish-btn"
                    >
                        {isEditMode && courseToEdit?.status === "Draft"
                            ? "Publish Course"
                            : isEditMode
                                ? "Update Course"
                                : "Publish Course"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default CreateCourse;