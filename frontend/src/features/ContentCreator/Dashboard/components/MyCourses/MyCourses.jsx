import "./MyCourses.css";

import CourseCard from "../CourseCard/CourseCard.jsx";

function MyCourses({ courses, onEdit, onView }) {

    return (

        <section className="my-courses">

            <div className="section-header">

                <h2>My Courses</h2>

                <a href="#">View All Courses →</a>

            </div>

            <div className="courses-grid">

                {courses.map(course => (

                    <CourseCard
                        key={course.id}
                        course={course}
                        onEdit={onEdit}
                        onView={onView}
                    />

                ))}

            </div>

        </section>

    );

}

export default MyCourses;