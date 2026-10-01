import "./AttentionTable.css";
import { attentionCourses } from "../../data/creatorDashboardData";
import { AlertTriangle, Eye, SquarePen, BookOpen } from "lucide-react";

function AttentionTable() {

    return (

        <section className="attention-table">

            <div className="attention-header">

                <div>

                    <h2>Courses Needing Attention</h2>

                    <p>
                        Review courses that require your action.
                    </p>

                </div>

                <AlertTriangle
                    size={24}
                    className="attention-icon"
                />

            </div>

            <table>

                <thead>

                <tr>

                    <th>Course</th>

                    <th>Issue</th>

                    <th>Priority</th>

                    <th>Actions</th>

                </tr>

                </thead>

                <tbody>

                    {attentionCourses.map((course) => (

                        <tr key={course.id}>

                            <td>

                                <div className="course-cell">

                                    <div className="course-avatar">

                                        <BookOpen size={18} />

                                    </div>

                                    <span>{course.course}</span>

                                </div>

                            </td>

                            <td>

                                <span className="issue-badge">

                                    {course.issue}

                                </span>

                            </td>

                            <td>

                                <span className={`priority ${course.priority.toLowerCase()}`}>

                                    {course.priority}

                                </span>

                            </td>

                            <td>

                                <div className="table-actions">

                                    <button className="icon-btn view-btn">

                                        <Eye size={18} />

                                    </button>

                                    <button className="icon-btn edit-btn">

                                        <SquarePen size={18} />

                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </section>

    );

}

export default AttentionTable;