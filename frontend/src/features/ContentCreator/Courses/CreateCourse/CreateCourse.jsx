import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateCourse.css";
import {
    createCourseInBackoffice,
    updateCourseInBackoffice,
    updateCourseStatusInBackoffice,
    fetchCourseByIdFromBackoffice,
    fetchSubjectsFromBackoffice,
    uploadCourseContentPdf
} from "../../../../services/backofficeService";
import {
    Archive,
    UploadCloud,
    FileText,
    ExternalLink,
    CheckCircle2,
    Trash2,
    FolderKanban,
    Loader2
} from "lucide-react";

const ALLOWED_SUBJECTS = [
    { subjectId: 1, name: "Mathematics" },
    { subjectId: 2, name: "Environmental Studies" },
    { subjectId: 3, name: "ICT" }
];

const ALLOWED_GRADES = ["Grade 3", "Grade 4", "Grade 5"];

function CreateCourse() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [availableSubjects, setAvailableSubjects] = useState(ALLOWED_SUBJECTS);
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields (strictly title, gradeLevel, subject, description, objectives + drive content)
    const [formData, setFormData] = useState({
        title: "",
        gradeLevel: "Grade 3",
        subject: "Mathematics",
        description: "",
        objectives: ""
    });

    // Google Drive upload states
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [isUploadingDrive, setIsUploadingDrive] = useState(false);
    const [driveResult, setDriveResult] = useState(null); // { fileName, folderPath, folderUrl, webViewLink, fileId, driveSynced }
    const [driveError, setDriveError] = useState("");

    useEffect(() => {
        let active = true;

        fetchSubjectsFromBackoffice()
            .then(subs => {
                if (active && Array.isArray(subs) && subs.length > 0) {
                    const valid = subs.filter(s =>
                        ALLOWED_SUBJECTS.some(a => a.name.toLowerCase() === (s.name || "").toLowerCase())
                    );
                    if (valid.length > 0) setAvailableSubjects(valid);
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
                            gradeLevel: course.gradeLevel || course.grade || "Grade 3",
                            subject: course.subject || "Mathematics",
                            description: course.description || "",
                            objectives: course.objectives || ""
                        });

                        if (course.contentPdfUrl || course.contentPdfName) {
                            setDriveResult({
                                fileName: course.contentPdfName || "Course_Content.pdf",
                                folderPath: `Educational Content / ${course.subject || "Mathematics"} / ${course.gradeLevel || course.grade || "Grade 3"}`,
                                folderUrl: course.contentPdfUrl,
                                webViewLink: course.contentPdfUrl,
                                fileId: course.contentPdfDriveId || "existing_drive_link",
                                driveSynced: true
                            });
                        }
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch course for edit:", err);
                });
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

    // Google Drive file upload handler
    const handleDriveFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedPdf(file);
        setDriveError("");
        setIsUploadingDrive(true);

        try {
            const uploadRes = await uploadCourseContentPdf(
                file,
                formData.gradeLevel || "Grade 3",
                formData.subject || "Mathematics"
            );
            setDriveResult(uploadRes);
        } catch (err) {
            console.error("Google Drive upload failed:", err);
            setDriveError(err.message || "Failed to upload to Google Drive");
        } finally {
            setIsUploadingDrive(false);
        }
    };

    const handleRemoveDriveFile = () => {
        setSelectedPdf(null);
        setDriveResult(null);
        setDriveError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!formData.title.trim()) {
            alert("Please enter a course title.");
            return;
        }

        if (!formData.gradeLevel) {
            alert("Please select a grade level (Grade 3, Grade 4, or Grade 5).");
            return;
        }

        if (!formData.subject) {
            alert("Please select a subject (ICT, Mathematics, or Environmental Studies).");
            return;
        }

        if (!formData.description.trim()) {
            alert("Please enter a course description.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: formData.title.trim(),
                name: formData.title.trim(),
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                grade: formData.gradeLevel,
                description: formData.description,
                objectives: formData.objectives,
                contentPdfName: driveResult?.fileName || (selectedPdf ? selectedPdf.name : null),
                contentPdfUrl: driveResult?.webViewLink || driveResult?.folderUrl || null,
                contentPdfDriveId: driveResult?.fileId || null,
                author: "Alex Rivers",
                creator: "Alex Rivers",
                status: "Published"
            };

            if (isEditMode) {
                await updateCourseInBackoffice(id, payload);
                alert("Course published and updated successfully!");
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
            const payload = {
                title: formData.title.trim(),
                name: formData.title.trim(),
                gradeLevel: formData.gradeLevel || "Grade 3",
                grade: formData.gradeLevel || "Grade 3",
                subject: formData.subject || "Mathematics",
                description: formData.description || "",
                objectives: formData.objectives || "",
                contentPdfName: driveResult?.fileName || (selectedPdf ? selectedPdf.name : null),
                contentPdfUrl: driveResult?.webViewLink || driveResult?.folderUrl || null,
                contentPdfDriveId: driveResult?.fileId || null,
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
        if (!isEditMode) return;

        const confirmed = window.confirm("Are you sure you want to archive this course?");
        if (!confirmed) return;

        await updateCourseStatusInBackoffice(id, "Archived");
        alert("Course archived successfully!");
        navigate("/course-management");
    };

    return (
        <div className="create-course-page">
            <div className="create-course-header">
                <h1>{isEditMode ? "Edit Course" : "Create New Course"}</h1>
                <p>
                    {isEditMode
                        ? "Update the course curriculum, learning objectives, and Google Drive materials below."
                        : "Configure course details and sync learning materials directly to Google Drive."}
                </p>
            </div>

            <form className="create-course-form" onSubmit={handleSubmit}>
                {/* Course Title */}
                <div className="form-group full-width">
                    <label>Course Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Grade 4 Environmental Studies: Living Things"
                        required
                    />
                </div>

                {/* Grade + Subject (Restricted to Grade 3, 4, 5 and Mathematics, Environmental Studies, ICT) */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Grade Level *</label>
                        <select
                            name="gradeLevel"
                            value={formData.gradeLevel}
                            onChange={handleChange}
                            required
                        >
                            {ALLOWED_GRADES.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Subject *</label>
                        <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        >
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
                    <label>Course Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Provide an overview of the curriculum and themes covered..."
                        required
                    />
                </div>

                {/* Learning Objectives */}
                <div className="form-group full-width">
                    <label>Learning Objectives</label>
                    <textarea
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                        placeholder="e.g. Understand ecosystems, master division, write simple algorithms..."
                    />
                </div>

                {/* Google Drive Course Content Upload Section */}
                <div className="form-group full-width google-drive-section">
                    <div className="google-drive-header">
                        <div className="drive-badge">
                            <FolderKanban size={16} />
                            <span>Google Drive Integration</span>
                        </div>
                        <span className="drive-folder-target">
                            Target Folder: <strong>Educational Content / {formData.subject || "Mathematics"} / {formData.gradeLevel || "Grade 3"}</strong>
                        </span>
                    </div>

                    {!driveResult && !isUploadingDrive ? (
                        <label className="drive-upload-dropzone">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={handleDriveFileSelect}
                            />
                            <div className="drive-upload-box">
                                <div className="drive-upload-icon-circle">
                                    <UploadCloud size={28} />
                                </div>
                                <div className="drive-upload-text">
                                    <h4>Upload Course Content PDF / Material</h4>
                                    <p>Select lesson material or syllabus to sync directly to Google Drive</p>
                                    <span className="drive-supported-formats">PDF, PPTX, DOCX (Up to 50MB)</span>
                                </div>
                            </div>
                        </label>
                    ) : isUploadingDrive ? (
                        <div className="drive-uploading-card">
                            <Loader2 className="spinner" size={24} />
                            <div className="drive-uploading-info">
                                <p>Uploading to Google Drive & Syncing Folder...</p>
                                <span>{selectedPdf?.name} ({((selectedPdf?.size || 0) / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                        </div>
                    ) : (
                        <div className="drive-uploaded-card">
                            <div className="drive-file-icon">
                                <FileText size={24} color="#7200A8" />
                            </div>
                            <div className="drive-file-details">
                                <div className="drive-file-name-row">
                                    <span className="drive-file-name">{driveResult.fileName}</span>
                                    <span className="drive-synced-pill">
                                        <CheckCircle2 size={13} />
                                        Synced to Google Drive
                                    </span>
                                </div>
                                <span className="drive-path-text">{driveResult.folderPath}</span>
                            </div>
                            <div className="drive-file-actions">
                                {driveResult.folderUrl && (
                                    <a
                                        href={driveResult.folderUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="drive-view-btn"
                                    >
                                        <ExternalLink size={14} />
                                        Open in Drive
                                    </a>
                                )}
                                <button
                                    type="button"
                                    className="drive-remove-btn"
                                    onClick={handleRemoveDriveFile}
                                    title="Remove and replace file"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {driveError && (
                        <p className="drive-error-msg">{driveError}</p>
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
                        disabled={isSubmitting || isUploadingDrive}
                    >
                        Save Draft
                    </button>

                    <button
                        type="submit"
                        className="publish-btn"
                        disabled={isSubmitting || isUploadingDrive}
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