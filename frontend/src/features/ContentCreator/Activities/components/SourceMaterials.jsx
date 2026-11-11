import { useRef } from "react";
import {
    FolderOpen,
    Upload,
    FileText,
    X,
    ChevronDown
} from "lucide-react";

function SourceMaterials({
    courses,
    selectedCourseId,
    modules,
    selectedModuleId,
    onCourseChange,
    onModuleChange,
    files,
    onFilesChange
}) {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (!selectedFiles.length) return;
        onFilesChange([...files, ...selectedFiles]);
        event.target.value = "";
    };

    const removeFile = (index) => {
        onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
    };

    return (
        <section className="activity-source-card">
            <div className="activity-section-heading">
                <div className="activity-section-heading-title">
                    <FolderOpen size={16} />
                    <span>Course & Module Target</span>
                </div>
            </div>

            <div className="activity-field">
                <label htmlFor="activity-course">SELECT COURSE</label>
                <div className="activity-select-wrapper">
                    <select
                        id="activity-course"
                        value={String(selectedCourseId || "")}
                        onChange={onCourseChange}
                    >
                        {courses.length === 0 ? (
                            <option value="">No courses available</option>
                        ) : (
                            courses.map((course) => {
                                const cId = String(course.courseId ?? course.id);
                                return (
                                    <option key={cId} value={cId}>
                                        {course.title || course.name}
                                    </option>
                                );
                            })
                        )}
                    </select>
                    <ChevronDown size={13} />
                </div>
            </div>

            <div className="activity-field">
                <label htmlFor="activity-lesson">SELECT MODULE</label>
                <div className="activity-select-wrapper">
                    <select
                        id="activity-lesson"
                        value={String(selectedModuleId || "")}
                        onChange={onModuleChange}
                    >
                        {(!modules || modules.length === 0) ? (
                            <option value="">No modules in this course yet</option>
                        ) : (
                            modules.map((mod) => {
                                const mId = String(mod.moduleId ?? mod.id);
                                return (
                                    <option key={mId} value={mId}>
                                        {mod.title || mod.name}
                                    </option>
                                );
                            })
                        )}
                    </select>
                    <ChevronDown size={13} />
                </div>
            </div>

            <div className="activity-field">
                <label>SUPPLEMENTARY NOTES / FILES (OPTIONAL)</label>
                <button
                    type="button"
                    className="activity-upload-area"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <span className="activity-upload-icon">
                        <Upload size={14} />
                    </span>
                    <span className="activity-upload-text">
                        Attach TXT, PDF, DOCX, or PPTX
                        <br />
                        reference material
                    </span>
                    <span className="activity-upload-link">
                        or browse files
                    </span>
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx,.ppt,.pptx"
                    multiple
                    hidden
                    onChange={handleFileChange}
                />
            </div>

            {files.length > 0 && (
                <div className="activity-file-list">
                    {files.map((file, index) => (
                        <div
                            className="activity-file-item"
                            key={`${file.name}-${index}`}
                        >
                            <FileText size={13} />
                            <span title={file.name}>{file.name}</span>
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                aria-label={`Remove ${file.name}`}
                            >
                                <X size={11} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default SourceMaterials;
