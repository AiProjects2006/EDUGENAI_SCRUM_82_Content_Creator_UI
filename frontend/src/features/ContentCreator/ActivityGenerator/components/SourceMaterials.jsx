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
                             selectedLesson,
                             onCourseChange,
                             onLessonChange,
                             files,
                             onFilesChange
                         }) {
    const fileInputRef = useRef(null);

    const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
    );

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(
            event.target.files || []
        );

        if (!selectedFiles.length) {
            return;
        }

        onFilesChange([
            ...files,
            ...selectedFiles
        ]);

        event.target.value = "";
    };

    const removeFile = (index) => {
        onFilesChange(
            files.filter(
                (_, fileIndex) => fileIndex !== index
            )
        );
    };

    return (
        <section className="activity-source-card">

            <div className="activity-section-heading">

                <div className="activity-section-heading-title">
                    <FolderOpen size={16} />

                    <span>
                        Source Materials
                    </span>
                </div>

            </div>

            <div className="activity-field">

                <label htmlFor="activity-course">
                    SELECT COURSE
                </label>

                <div className="activity-select-wrapper">

                    <select
                        id="activity-course"
                        value={selectedCourseId}
                        onChange={onCourseChange}
                    >
                        {courses.map((course) => (
                            <option
                                key={course.id}
                                value={course.id}
                            >
                                {course.name}
                            </option>
                        ))}
                    </select>

                    <ChevronDown size={13} />

                </div>

            </div>

            <div className="activity-field">

                <label htmlFor="activity-lesson">
                    SELECT LESSON
                </label>

                <div className="activity-select-wrapper">

                    <select
                        id="activity-lesson"
                        value={selectedLesson}
                        onChange={onLessonChange}
                    >
                        {selectedCourse?.lessons.map(
                            (lesson) => (
                                <option
                                    key={lesson}
                                    value={lesson}
                                >
                                    {lesson}
                                </option>
                            )
                        )}
                    </select>

                    <ChevronDown size={13} />

                </div>

            </div>

            <div className="activity-field">

                <label>
                    SUPPLEMENTARY FILES (OPTIONAL)
                </label>

                <button
                    type="button"
                    className="activity-upload-area"
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                >

                    <span className="activity-upload-icon">
                        <Upload size={14} />
                    </span>

                    <span className="activity-upload-text">
                        Drag and drop PDF, DOCX, or PPTX
                        <br />
                        here
                    </span>

                    <span className="activity-upload-link">
                        or browse files
                    </span>

                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
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

                            <span title={file.name}>
                                {file.name}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    removeFile(index)
                                }
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