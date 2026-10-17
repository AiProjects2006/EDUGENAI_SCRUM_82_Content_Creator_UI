import { Eye, Pencil, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CourseTable({ activeTab, courses = [], onDeleteCourse }) {

    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const filteredCourses = (courses || [])
        .filter((course) =>
            (course.name || course.title || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .filter((course) => {
            const status = (course.status || "").toLowerCase();

            if (activeTab === "All Courses") return true;

            if (activeTab === "Published")
                return status === "published" || status === "approved";

            if (activeTab === "Drafts")
                return status === "draft" || status === "pending";

            if (activeTab === "Archived")
                return status === "archived";

            return true;
        });

    const handleDelete = (course) => {
        if (onDeleteCourse) {
            onDeleteCourse(course);
        }
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

                            <td>{course.name || course.title}</td>

                            <td>{course.subject}</td>

                            <td>{course.author || course.creator}</td>

                            <td>{course.enrollments !== undefined ? course.enrollments : 0}</td>

                            <td>{course.completion || "0%"}</td>

                            <td>
                                <span
                                    className={`status ${(course.status || "draft").toLowerCase()}`}
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