import "./CourseDetailsModal.css";
import { X, Users, BookOpen, Star, BarChart3 } from "lucide-react";

function CourseDetailsModal({ course, onClose }) {

    return (
        <div className="modal-overlay">

            <div className="details-modal">

                <div className="details-header">

                    <h2>Course Details</h2>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        <X size={20}/>
                    </button>

                </div>

                <img
                    src={course.image}
                    alt={course.title}
                    className="details-image"
                />

                <h2 className="course-title">
                    {course.title}
                </h2>

                <div className="course-tags">

                    <span>{course.category}</span>

                    <span>{course.grade}</span>

                </div>

                <div className="course-description">

                    <h3>Description</h3>

                    <p>
                        {course.description || "No description available."}
                    </p>

                </div>

                <div className="course-stats">

                    <div className="stat-box">

                        <Users size={22}/>

                        <span>{course.students}</span>

                        <small>Students</small>

                    </div>

                    <div className="stat-box">

                        <BookOpen size={22}/>

                        <span>{course.lessons}</span>

                        <small>Lessons</small>

                    </div>

                    <div className="stat-box">

                        <BarChart3 size={22}/>

                        <span>{course.progress}%</span>

                        <small>Course Progress</small>

                    </div>

                    <div className="stat-box">

                        <Star size={22} fill="gold" color="gold"/>

                        <span>{course.rating}</span>

                        <small>Rating</small>

                    </div>

                </div>

                <button
                    className="close-modal-btn"
                    onClick={onClose}
                >
                    Close
                </button>

            </div>

        </div>
    );

}

export default CourseDetailsModal;