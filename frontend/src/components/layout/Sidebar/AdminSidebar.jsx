import { NavLink } from "react-router-dom";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    BookOpen,
    ClipboardList,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react";

import profile from "../../../assets/profile.jpg";
import "./Sidebar.css";

const navigationItems = [
    {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard
    },
    {
        label: "User Management",
        path: "/users",
        icon: Users
    },
    {
        label: "Course Management",
        path: "/courses",
        icon: BookOpen
    },
    {
        label: "Activities",
        path: "/activities",
        icon: ClipboardList
    },
    {
        label: "Progress Tracking",
        path: "/progress",
        icon: BarChart3
    },
    {
        label: "Settings",
        path: "/settings",
        icon: Settings
    }
];

function Sidebar() {

    return (
        <aside className="sidebar">

            <div className="sidebar-top">

                <div className="logo">

                    <div className="logo-icon">
                        <GraduationCap size={26} />
                    </div>

                    <div className="logo-text">
                        <h2>EduGen AI</h2>
                        <p>ADMIN PORTAL</p>
                    </div>

                </div>

                <ul>

                    {navigationItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <li key={item.path}>

                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        isActive ? "active" : ""
                                    }
                                >

                                    <Icon size={20} />

                                    <span>{item.label}</span>

                                </NavLink>

                            </li>
                        );

                    })}

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
                            <h4>H.W Randi</h4>
                            <p>Administrator</p>
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

export default Sidebar;