import { useState, useEffect, useCallback } from "react";
import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";

import CourseHeader from "./components/CourseHeader";
import CourseTabs from "./components/CourseTabs";
import CourseTable from "./components/CourseTable";
import BottomCards from "./components/BottomCards";

import { fetchCoursesFromBackoffice, deleteCourseInBackoffice, deduplicateCourses } from "../../../services/backofficeService";

import "./CourseManagement.css";

function CourseManagement() {

    const [activeTab, setActiveTab] = useState("All Courses");
    const [courses, setCourses] = useState([]);

    const loadCourses = useCallback(async () => {
        try {
            const data = await fetchCoursesFromBackoffice();
            if (Array.isArray(data)) {
                setCourses(deduplicateCourses(data));
            }
        } catch (e) {
            console.error("Failed loading courses:", e);
        }
    }, []);

    useEffect(() => {
        loadCourses();
        window.addEventListener("focus", loadCourses);
        window.addEventListener("storage", loadCourses);
        window.addEventListener("coursesUpdated", loadCourses);

        let channel = null;
        try {
            if (typeof BroadcastChannel !== "undefined") {
                channel = new BroadcastChannel("edugenai_channel");
                channel.onmessage = () => {
                    loadCourses();
                };
            }
        } catch (_) {}

        const interval = setInterval(loadCourses, 4000);
        return () => {
            window.removeEventListener("focus", loadCourses);
            window.removeEventListener("storage", loadCourses);
            window.removeEventListener("coursesUpdated", loadCourses);
            if (channel) channel.close();
            clearInterval(interval);
        };
    }, [loadCourses]);

    const handleDeleteCourse = async (course) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${course.name || course.title}"?`
        );

        if (!confirmed) {
            return;
        }

        await deleteCourseInBackoffice(course.id);
        setCourses(prev => prev.filter(item => item.id !== course.id));
        alert("Course deleted successfully!");
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <CourseHeader />

            <CourseTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                courses={courses}
            />

            <CourseTable
                activeTab={activeTab}
                courses={courses}
                onDeleteCourse={handleDeleteCourse}
            />

            <BottomCards />

        </BackofficeLayout>
    );
}

export default CourseManagement;