import { NavLink, useNavigate } from "react-router-dom";
import {
    GraduationCap,
    LayoutDashboard,
    FileText,
    BookOpen,
    Bot,
    BarChart3,
    Sparkles,
    Users,
    Settings,
    LogOut,
    FolderOpen
} from "lucide-react";
import { useCreatorAuth } from "../../../context/CreatorAuthContext";
import profile from "../../../assets/profile.jpg";
import "./Sidebar.css";

function CreatorSidebar() {
    const navigate = useNavigate();
    const { user, logout } = useCreatorAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login");
        }
    };

    const displayName = user?.fullName || user?.username || "Alex Rivers";
    const displayRole = user?.role === "CONTENT_CREATOR" ? "Content Creator" : (user?.role || "Content Creator");

    return (
        <aside className="sidebar">
            <div className="sidebar-top">

                <div className="logo">
                    <div className="logo-icon">
                        <GraduationCap size={26} />
                    </div>

                    <div className="logo-text">
                        <h2>EduGen AI</h2>
                        <p>CREATOR PORTAL</p>
                    </div>
                </div>

                <ul>
                    <li>
                        <NavLink to="/creator-dashboard">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>

                    <li className="menu-with-submenu">
                        <NavLink to="/create-course">
                            <FileText size={20} />
                            <span>Course Creation</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/course-management">
                            <FolderOpen size={20} />
                            <span>Course Management</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/module-management">
                            <BookOpen size={20} />
                            <span>Module Management</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/activities">
                            <Bot size={20} />
                            <span>Activities</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/generated-activities">
                            <Sparkles size={20} />
                            <span>Generated Activities</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/students-engagement">
                            <Users size={20} />
                            <span>Students Engagement</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/analytics">
                            <BarChart3 size={20} />
                            <span>Analytics & Reports</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/creator-settings">
                            <Settings size={20} />
                            <span>Settings</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            <div className="sidebar-bottom">
                <div className="sidebar-footer">
                    <div className="profile">
                        <img
                            src={profile}
                            alt="Profile"
                            className="profile-image"
                        />

                        <div>
                            <h4>{displayName}</h4>
                            <p>{displayRole}</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Sign Out of Creator Portal"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default CreatorSidebar;
