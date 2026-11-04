import { useState, useEffect, useCallback, useRef } from "react";
import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";

import CourseHeader from "./components/CourseHeader";
import CourseTabs from "./components/CourseTabs";
import CourseTable from "./components/CourseTable";
import BottomCards from "./components/BottomCards";

import { fetchCoursesFromBackoffice, deleteCourseInBackoffice, deduplicateCourses, getStoredLocalCourses } from "../../../services/backofficeService";

import "./CourseManagement.css";

function CourseManagement() {

    const [activeTab, setActiveTab] = useState("All Courses");
    const [courses, setCourses] = useState(() => deduplicateCourses(getStoredLocalCourses()));
    const isLoadingRef = useRef(false);

    const loadCourses = useCallback(async (networkFetch = true) => {
        if (!networkFetch) {
            const local = getStoredLocalCourses();
            if (Array.isArray(local)) {
                setCourses(deduplicateCourses(local));
            }
            return;
        }

        if (isLoadingRef.current) return;
        isLoadingRef.current = true;
        try {
            const data = await fetchCoursesFromBackoffice();
            if (Array.isArray(data)) {
                setCourses(deduplicateCourses(data));
            }
        } catch (e) {
            console.error("Failed loading courses:", e);
        } finally {
            isLoadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        loadCourses(true);

        const handleLocalSync = () => loadCourses(false);
        const handleRemoteSync = () => loadCourses(true);

        window.addEventListener("focus", handleLocalSync);
        window.addEventListener("storage", handleLocalSync);
        window.addEventListener("coursesUpdated", handleLocalSync);

        let channel = null;
        try {
            if (typeof BroadcastChannel !== "undefined") {
                channel = new BroadcastChannel("edugenai_channel");
                channel.onmessage = (e) => {
                    if (e.data?.type === 'COURSES_UPDATED') {
                        handleLocalSync();
                    }
                };
            }
        } catch (_) {}

        const interval = setInterval(() => {
            loadCourses(true);
        }, 10000);

        return () => {
            window.removeEventListener("focus", handleLocalSync);
            window.removeEventListener("storage", handleLocalSync);
            window.removeEventListener("coursesUpdated", handleLocalSync);
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