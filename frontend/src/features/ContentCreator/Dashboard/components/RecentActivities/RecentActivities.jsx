import "./RecentActivities.css";
import { recentActivities } from "../../data/creatorDashboardData";
import { Search, Filter, CircleCheck, Clock3, FileClock, Eye, SquarePen } from "lucide-react";

function RecentActivities() {

    return (

        <section className="recent-activities">

            <div className="activities-header">

                <div>

                    <h2>Recent AI Generated Activities</h2>

                    <p>Your latest AI-generated educational activities</p>

                </div>

                <div className="activities-tools">

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search activities..."
                        />

                    </div>

                    <button className="filter-btn">

                        <Filter size={18} />

                        Filter

                    </button>

                </div>

            </div>

            <table className="activities-table">

                <thead>

                <tr>

                    <th>Activity</th>

                    <th>Course</th>

                    <th>Questions</th>

                    <th>Date</th>

                    <th>Status</th>

                    <th>Actions</th>

                </tr>

                </thead>

                <tbody>

                {recentActivities.map((activity) => (

                    <tr key={activity.id}>

                        <td>{activity.title}</td>
                        <td>{activity.type}</td>
                        <td>{activity.questions}</td>
                        <td>{activity.generated}</td>

                        <td>

                            <span className={`status ${activity.status.toLowerCase()}`}>

                                {activity.status === "Published" && (
                                    <CircleCheck size={16} />
                                )}

                                {activity.status === "Draft" && (
                                    <Clock3 size={16} />
                                )}

                                {activity.status === "Review" && (
                                    <FileClock size={16} />
                                )}

                                {activity.status}

                            </span>

                        </td>

                        <td>

                            <div className="action-buttons">

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

export default RecentActivities;