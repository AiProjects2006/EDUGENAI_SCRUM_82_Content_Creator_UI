import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateCourse.css";
import {
    createCourseInBackoffice,
    updateCourseInBackoffice,
    updateCourseStatusInBackoffice,
    fetchCourseByIdFromBackoffice,
    fetchSubjectsFromBackoffice
} from "../../../../services/backofficeService";
import { Archive } from "lucide-react";

function CreateCourse() {

    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [availableSubjects, setAvailableSubjects] = useState([
        { subjectId: 1, name: "Science" },
        { subjectId: 2, name: "Mathematics" },
        { subjectId: 3, name: "ICT" },
        { subjectId: 4, name: "English" }
    ]);

    const [courseToEdit, setCourseToEdit] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        gradeLevel: "",
        subject: "",
        description: "",
        objectives: "",
        primaryGrade: "",
        prerequisites: "",
        thumbnail: null
    });

    useEffect(() => {
        let active = true;

        fetchSubjectsFromBackoffice()
            .then(subs => {
                if (active && Array.isArray(subs) && subs.length > 0) {
                    setAvailableSubjects(subs);
                }
            })
            .catch(() => {});

        if (isEditMode) {
            fetchCourseByIdFromBackoffice(id)
                .then(course => {
                    if (active && course) {
                        setCourseToEdit(course);
                        setFormData({
                            title: course.title || course.name || "",
                            gradeLevel: course.gradeLevel || course.grade || "",
                            subject: course.subject || "",
                            description: course.description || "",
                            objectives: course.objectives || "",
                            primaryGrade: course.primaryGrade || "",
                            prerequisites: course.prerequisites || "",
                            thumbnail: course.thumbnail || course.thumbnailUrl || null
                        });
                    }
                })
                .catch(() => {});
        }

        return () => { active = false; };
    }, [id, isEditMode]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

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

        setIsSubmitting(true);
        try {
            const thumbnailStr = formData.thumbnail
                ? (typeof formData.thumbnail === "string" ? formData.thumbnail : formData.thumbnail.name)
                : null;

            const payload = {
                title: formData.title.trim(),
                name: formData.title.trim(),
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                grade: formData.gradeLevel,
                description: formData.description,
                objectives: formData.objectives,
                primaryGrade: formData.primaryGrade,
                prerequisites: formData.prerequisites,
                thumbnail: thumbnailStr,
                thumbnailUrl: thumbnailStr,
                author: "Alex Rivers",
                creator: "Alex Rivers",
                status: "Published"
            };

            if (isEditMode) {
                await updateCourseInBackoffice(id, payload);
                alert("Course published successfully!");
            } else {
                await createCourseInBackoffice(payload);
                alert("Course created and published successfully!");
            }

            navigate("/course-management");
        } catch (err) {
            console.error("Failed to publish course:", err);
            alert("Failed to publish course. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (isSubmitting) return;

        if (!formData.title.trim()) {
            alert("Please enter a course title before saving.");
            return;
        }

        setIsSubmitting(true);
        try {
            const thumbnailStr = formData.thumbnail
                ? (typeof formData.thumbnail === "string" ? formData.thumbnail : formData.thumbnail.name)
                : null;

            const payload = {
                title: formData.title.trim(),
                name: formData.title.trim(),
                gradeLevel: formData.gradeLevel || "",
                grade: formData.gradeLevel || "",
                subject: formData.subject || "",
                description: formData.description || "",
                objectives: formData.objectives || "",
                primaryGrade: formData.primaryGrade || "",
                prerequisites: formData.prerequisites || "",
                thumbnail: thumbnailStr,
                thumbnailUrl: thumbnailStr,
                author: "Alex Rivers",
                creator: "Alex Rivers",
                status: "Draft"
            };

            if (isEditMode) {
                await updateCourseInBackoffice(id, payload);
                alert("Course saved as draft!");
            } else {
                await createCourseInBackoffice(payload);
                alert("Course saved as draft!");
            }

            navigate("/course-management");
        } catch (err) {
            console.error("Failed to save draft:", err);
            alert("Failed to save draft. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchive = async () => {
        if (!isEditMode) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to archive this course?"
        );

        if (!confirmed) {
            return;
        }

        await updateCourseStatusInBackoffice(id, "Archived");
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
                            {availableSubjects.map((sub) => (
                                <option key={sub.subjectId || sub.name} value={sub.name}>
                                    {sub.name}
                                </option>
                            ))}
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
                        disabled={isSubmitting}
                    >
                        Save Draft
                    </button>

                    <button
                        type="submit"
                        className="publish-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Publishing..."
                            : isEditMode && courseToEdit?.status === "Draft"
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