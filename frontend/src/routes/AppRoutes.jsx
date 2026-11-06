import { Routes, Route, Navigate } from "react-router-dom";
import { useCreatorAuth } from "../context/CreatorAuthContext";

import CreatorLogin from "../features/ContentCreator/Auth/CreatorLogin";
import CreatorRegister from "../features/ContentCreator/Auth/CreatorRegister";

import CreateCourse from "../features/ContentCreator/Courses/CreateCourse/CreateCourse";
import ContentCreatorDashboard from "../features/ContentCreator/Dashboard/ContentCreatorDashboard";
import BackofficeLayout from "../components/layout/BackofficeLayout";
import CreatorSidebar from "../components/layout/Sidebar/CreatorSidebar";
import ContentCreation from "../features/ContentCreator/ContentCreation/ContentCreation";
import CreateLesson from "../features/ContentCreator/CreateLesson/CreateLesson";
import CourseManagement from "../features/ContentCreator/CourseManagement/CourseManagement";
import CourseDetails from "../features/ContentCreator/CourseManagement/CourseDetails/CourseDetails";
import ModuleManagement from "../features/ContentCreator/LessonManagement/ModuleManagement";
import LessonDetails from "../features/ContentCreator/LessonManagement/LessonDetails/LessonDetails";
import StudentEngagement from "../features/ContentCreator/StudentEngagement/StudentEngagement";
import Activities from "../features/ContentCreator/Activities/Activities.jsx";
import GeneratedActivities from "../features/ContentCreator/GeneratedActivities/GeneratedActivities.jsx";
import AnalyticsReports from "../features/ContentCreator/AnalyticsReports/AnalyticsReports.jsx";
import Settings from "../features/ContentCreator/Settings/Settings.jsx";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useCreatorAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<CreatorLogin />} />
            <Route path="/register" element={<CreatorRegister />} />

            {/* Protected Creator Workspace Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <ContentCreatorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/creator-dashboard"
                element={
                    <ProtectedRoute>
                        <ContentCreatorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/content-creation"
                element={
                    <ProtectedRoute>
                        <ContentCreation />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/course-management"
                element={
                    <ProtectedRoute>
                        <CourseManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/create-course"
                element={
                    <ProtectedRoute>
                        <BackofficeLayout sidebar={<CreatorSidebar />}>
                            <CreateCourse />
                        </BackofficeLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/edit-course/:id"
                element={
                    <ProtectedRoute>
                        <BackofficeLayout sidebar={<CreatorSidebar />}>
                            <CreateCourse />
                        </BackofficeLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/course/:id"
                element={
                    <ProtectedRoute>
                        <CourseDetails />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/module-management"
                element={
                    <ProtectedRoute>
                        <ModuleManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/create-lesson"
                element={
                    <ProtectedRoute>
                        <CreateLesson />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/edit-lesson/:id"
                element={
                    <ProtectedRoute>
                        <CreateLesson />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/lesson/:id"
                element={
                    <ProtectedRoute>
                        <LessonDetails />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/students-engagement"
                element={
                    <ProtectedRoute>
                        <StudentEngagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/activities"
                element={
                    <ProtectedRoute>
                        <Activities />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/generated-activities"
                element={
                    <ProtectedRoute>
                        <GeneratedActivities />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <AnalyticsReports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/creator-settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
