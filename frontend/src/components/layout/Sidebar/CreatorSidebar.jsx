import { NavLink } from "react-router-dom";
import {
    GraduationCap,
    LayoutDashboard,
    FileText,
    BookOpen,
    BookCheck,
    Bot,
    BarChart3,
    Sparkles,
    Users,
    Settings,
    LogOut,
    FolderOpen
} from "lucide-react";

import profile from "../../../assets/profile.jpg";
import "./Sidebar.css";

function CreatorSidebar() {
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

                        <NavLink to="/content-creation">
                            <FileText size={20} />
                            <span>Content Creation</span>
                        </NavLink>

                        <ul className="submenu">

                            <li>
                                <NavLink to="/create-course">
                                    <BookOpen size={16} />
                                    <span>Course</span>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/create-lesson">
                                    <BookCheck size={16} />
                                    <span>Lesson</span>
                                </NavLink>
                            </li>

                        </ul>

                    </li>

                    <li>
                        <NavLink to="/course-management">
                            <FolderOpen size={20} />
                            <span>Course Management</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/lesson-management">
                            <BookOpen size={20} />
                            <span>Lesson Management</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/ai-activity-generator">
                            <Bot size={20} />
                            <span>AI Activity Generator</span>
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
                            <h4>Alex Rivers</h4>
                            <p>Content Creator</p>
                        </div>
                    </div>

                    <button className="logout-btn">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default CreatorSidebar;