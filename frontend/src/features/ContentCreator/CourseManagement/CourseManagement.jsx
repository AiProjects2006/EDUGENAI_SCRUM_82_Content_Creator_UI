import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";

import CourseHeader from "./components/CourseHeader";
import CourseTabs from "./components/CourseTabs";
import CourseTable from "./components/CourseTable";
import BottomCards from "./components/BottomCards";

import { getCourses } from "./data/courseData";

import { useState } from "react";

import "./CourseManagement.css";


function CourseManagement() {

    const [activeTab, setActiveTab] = useState("All Courses");
    const [courses] = useState(() => getCourses());

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
            />

            <BottomCards />

        </BackofficeLayout>

    );
}

export default CourseManagement;