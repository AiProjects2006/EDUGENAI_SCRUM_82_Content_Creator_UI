import { Routes, Route } from "react-router-dom";

import CreateCourse from "../features/ContentCreator/Courses/CreateCourse/CreateCourse";
import ContentCreatorDashboard from "../features/ContentCreator/Dashboard/ContentCreatorDashboard";
import BackofficeLayout from "../components/layout/BackofficeLayout";
import CreatorSidebar from "../components/layout/Sidebar/CreatorSidebar";
import ContentCreation from "../features/ContentCreator/ContentCreation/ContentCreation";
import CreateLesson from "../features/ContentCreator/CreateLesson/CreateLesson";
import CourseManagement from "../features/ContentCreator/CourseManagement/CourseManagement";
import CourseDetails from "../features/ContentCreator/CourseManagement/CourseDetails/CourseDetails";
import LessonManagement from "../features/ContentCreator/LessonManagement/LessonManagement";
import LessonDetails from "../features/ContentCreator/LessonManagement/LessonDetails/LessonDetails";
import StudentEngagement from "../features/ContentCreator/StudentEngagement/StudentEngagement";
function AppRoutes() {
    return (
        <Routes>

            <Route path="/" element={<ContentCreatorDashboard />}/>

            <Route path="/creator-dashboard" element={<ContentCreatorDashboard />}/>

            <Route path="/content-creation" element={<ContentCreation />}/>

            <Route path="/course-management" element={<CourseManagement />}/>

            <Route path="/create-course" element={<BackofficeLayout sidebar={<CreatorSidebar />}><CreateCourse /></BackofficeLayout>}/>

            <Route path="/edit-course/:id" element={<BackofficeLayout sidebar={<CreatorSidebar />}><CreateCourse /></BackofficeLayout>}/>

            <Route path="/course/:id" element={<CourseDetails />}/>

            <Route path="/create-lesson" element={<CreateLesson />}/>

            <Route path="/lesson-management" element={<LessonManagement />}/>

            <Route path="/edit-lesson/:id" element={<CreateLesson />}/>

            <Route path="/lesson/:id" element={<LessonDetails />}/>

            <Route path="/students-engagement" element={<StudentEngagement />}/>

        </Routes>
    );
}

export default AppRoutes;