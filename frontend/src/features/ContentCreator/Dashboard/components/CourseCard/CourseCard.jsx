import "./CourseCard.css";
import { Users, BookOpen, Star, SquarePen, ArrowRight } from "lucide-react";

function CourseCard({ course, onEdit, onView }) {

    return (

        <div className="course-card">

            <div className="course-image-wrapper">

                <img
                    src={course.image}
                    alt={course.title}
                    className="course-image"
                />

                <div className="grade-badge">
                    {course.grade}
                </div>

            </div>

            <div className="course-content">

                <div className="course-top">

                    <span className="course-category">
                        {course.category}
                    </span>

                    <div className="course-rating">

                        <Star size={15} fill="gold" color="gold" />

                        {course.rating > 0 ? course.rating : "New"}

                    </div>

                </div>

                <h3>{course.title}</h3>

                <div className="course-info">

                    <span>

                        <Users size={16} />

                        {course.students} Students

                    </span>

                    <span>

                        <BookOpen size={16} />

                        {course.lessons} Lessons

                    </span>

                </div>

                <div className="progress">

                    <div className="progress-header">

                        <span>Course Progress</span>

                        <strong>{course.progress}%</strong>

                    </div>

                    <div className="progress-bar">

                        <div
                            className="progress-fill"
                            style={{
                                width: `${course.progress}%`
                            }}
                        />

                    </div>

                </div>

                <div className="course-buttons">

                    <button onClick={() => onEdit(course)}>

                        <SquarePen size={17}/>

                        Edit

                    </button>

                    <button
                        className="details-btn"
                        onClick={() => onView(course)}
                    >

                        Details

                        <ArrowRight size={17} />

                    </button>

                </div>

            </div>

        </div>

    );

}

export default CourseCard;