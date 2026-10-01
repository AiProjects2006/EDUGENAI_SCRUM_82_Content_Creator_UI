import { Eye, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { getCourses, saveCourses } from "../data/courseData";
import { useNavigate } from "react-router-dom";

function CourseTable({ activeTab }) {

    const [search, setSearch] = useState("");
    const [courses, setCourses] = useState(() => getCourses());

    const navigate = useNavigate();

    const filteredCourses = courses
        .filter((course) =>
            course.name
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .filter((course) => {

            if (activeTab === "All Courses") return true;

            if (activeTab === "Published")
                return course.status === "Published";

            if (activeTab === "Drafts")
                return course.status === "Draft";

            if (activeTab === "Archived")
                return course.status === "Archived";

            return true;
        });

    const handleDelete = (course) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${course.name}"?`
        );

        if (!confirmed) {
            return;
        }

        const updatedCourses = courses.filter(
            (item) => item.id !== course.id
        );

        saveCourses(updatedCourses);

        setCourses(updatedCourses);

        alert("Course deleted successfully!");
    };

    return (
        <div className="course-table-card">

            <div className="table-header">

                <h3>Curriculum Manager</h3>

                <div className="search-box">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

            </div>

            <table className="course-table">

                <thead>
                <tr>
                    <th>Course Name</th>
                    <th>Subject</th>
                    <th>Author</th>
                    <th>Enrollments</th>
                    <th>Completion</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>

                <tbody>

                {filteredCourses.length > 0 ? (

                    filteredCourses.map((course) => (

                        <tr key={course.id}>

                            <td>{course.name}</td>

                            <td>{course.subject}</td>

                            <td>{course.author}</td>

                            <td>{course.enrollments}</td>

                            <td>{course.completion}</td>

                            <td>
                                    <span
                                        className={`status ${course.status.toLowerCase()}`}
                                    >
                                        {course.status}
                                    </span>
                            </td>

                            <td>

                                <div className="action-buttons">

                                    {/* VIEW */}
                                    <button
                                        className="action-btn view-btn"
                                        title="View course"
                                        onClick={() =>
                                            navigate(`/course/${course.id}`)
                                        }
                                    >
                                        <Eye size={16} />
                                    </button>

                                    {/* EDIT */}
                                    <button
                                        className="action-btn edit-btn"
                                        title="Edit course"
                                        onClick={() =>
                                            navigate(`/edit-course/${course.id}`)
                                        }
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    {/* DELETE */}
                                    <button
                                        className="action-btn delete-btn"
                                        title="Delete course"
                                        onClick={() =>
                                            handleDelete(course)
                                        }
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))

                ) : (

                    <tr>

                        <td colSpan="7">

                            <div className="empty-state">

                                <h3>No Courses Found</h3>

                                <p>
                                    Create your first course to get started.
                                </p>

                            </div>

                        </td>

                    </tr>

                )}

                </tbody>

            </table>

            <div className="pagination">

                <button className="pagination-nav">
                    Previous
                </button>

                <div className="pages">

                    <button className="active-page">
                        1
                    </button>

                    <button>
                        2
                    </button>

                    <button>
                        3
                    </button>

                    <span>...</span>

                    <button>
                        9
                    </button>

                </div>

                <button className="pagination-nav">
                    Next
                </button>

            </div>

        </div>
    );
}

export default CourseTable;