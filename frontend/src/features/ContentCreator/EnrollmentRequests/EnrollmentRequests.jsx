import { useState, useEffect, useCallback, useMemo } from "react";
import {
    UserCheck,
    UserX,
    Clock,
    Users,
    Search,
    RefreshCw,
    Eye,
    CheckCircle2,
    XCircle,
    BookOpen,
    GraduationCap,
    Mail,
    MessageSquare,
    Calendar,
    X
} from "lucide-react";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";
import { useCreatorAuth } from "../../../context/CreatorAuthContext";
import {
    fetchCreatorEnrollmentRequests,
    fetchBackofficeEnrollments,
    fetchCoursesFromBackoffice,
    respondToEnrollmentRequest
} from "../../../services/backofficeService";

import "./EnrollmentRequests.css";

function getInitials(name = "") {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ST";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateTime(value) {
    if (!value) return "Just now";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function normalizeStatusLabel(status) {
    const st = String(status || "PENDING").toUpperCase();
    if (st === "ACTIVE" || st === "COMPLETED" || st === "ACCEPTED") return "ACCEPTED";
    if (st === "REJECTED" || st === "DECLINED" || st === "DROPPED") return "DECLINED";
    return "PENDING";
}

function EnrollmentRequests() {
    const { user } = useCreatorAuth();

    const creatorFullName =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        user?.username ||
        "Content Creator";

    const [requests, setRequests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");
    const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [processingId, setProcessingId] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [declineReason, setDeclineReason] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        window.setTimeout(() => {
            setToastMessage("");
        }, 3500);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [courseList, creatorEnrollments, allEnrollments] = await Promise.all([
                fetchCoursesFromBackoffice().catch(() => []),
                fetchCreatorEnrollmentRequests({
                    creatorId: user?.id,
                    creatorEmail: user?.email,
                    creatorName: creatorFullName
                }).catch(() => []),
                fetchBackofficeEnrollments().catch(() => [])
            ]);

            const safeCourses = Array.isArray(courseList) ? courseList : [];
            setCourses(safeCourses);

            const courseMap = new Map();
            safeCourses.forEach((c) => {
                if (c?.courseId) courseMap.set(String(c.courseId), c);
                if (c?.id) courseMap.set(String(c.id), c);
            });

            // Scope to creator's courses if creator has owned courses, otherwise include courses visible in workspace
            const ownedCourseIds = new Set(
                safeCourses
                    .filter((c) => {
                        const idMatch = user?.id && String(c.creatorId) === String(user.id);
                        const emailMatch =
                            user?.email &&
                            c.creatorEmail &&
                            c.creatorEmail.toLowerCase() === user.email.toLowerCase();
                        const nameMatch =
                            creatorFullName &&
                            c.creator &&
                            c.creator.toLowerCase() === creatorFullName.toLowerCase();
                        return idMatch || emailMatch || nameMatch;
                    })
                    .flatMap((c) => [String(c.id), String(c.courseId)].filter(Boolean))
            );

            const sourceList =
                Array.isArray(creatorEnrollments) && creatorEnrollments.length > 0
                    ? creatorEnrollments
                    : Array.isArray(allEnrollments)
                    ? allEnrollments.filter((e) => {
                          if (ownedCourseIds.size === 0) return true;
                          return ownedCourseIds.has(String(e.courseId));
                      })
                    : [];

            const enriched = sourceList.map((item, idx) => {
                const matchedCourse = courseMap.get(String(item.courseId));
                return {
                    ...item,
                    enrollmentId: item.enrollmentId || item.id || idx + 1,
                    studentName:
                        item.studentName ||
                        (item.userId ? `Student #${item.userId}` : "Student Learner"),
                    studentEmail: item.studentEmail || "student@edugenai.edu",
                    studentGrade:
                        item.studentGrade ||
                        matchedCourse?.gradeLevel ||
                        matchedCourse?.grade ||
                        item.gradeLevel ||
                        "Grade 4",
                    studentAvatar: item.studentAvatar || null,
                    courseTitle:
                        item.courseTitle ||
                        matchedCourse?.title ||
                        matchedCourse?.name ||
                        `Course #${item.courseId || 1}`,
                    subjectName:
                        item.subjectName || matchedCourse?.subject || "Curriculum",
                    gradeLevel:
                        item.gradeLevel ||
                        matchedCourse?.gradeLevel ||
                        matchedCourse?.grade ||
                        "Grade 3-5",
                    requestMessage:
                        item.requestMessage ||
                        "Interested in enrolling in this course to explore lessons and activities.",
                    normalizedStatus: normalizeStatusLabel(item.status)
                };
            });

            setRequests(enriched);
        } finally {
            setLoading(false);
        }
    }, [user?.id, user?.email, creatorFullName]);

    useEffect(() => {
        loadData();
        let channel = null;
        try {
            if (typeof BroadcastChannel !== "undefined") {
                channel = new BroadcastChannel("edugenai_channel");
                channel.onmessage = (evt) => {
                    if (
                        evt?.data?.type === "ENROLLMENTS_UPDATED" ||
                        evt?.data?.type === "ENROLLMENT_REQUESTED"
                    ) {
                        loadData();
                    }
                };
            }
        } catch (_) {}
        return () => {
            if (channel) channel.close();
        };
    }, [loadData]);

    const handleDecision = async (reqItem, targetStatus, customReason = "") => {
        const id = reqItem.enrollmentId;
        if (!id || processingId) return;

        setProcessingId(id);
        try {
            await respondToEnrollmentRequest(id, {
                status: targetStatus,
                reason: customReason,
                changedBy: creatorFullName
            });

            const nextNorm = normalizeStatusLabel(targetStatus);
            setRequests((prev) =>
                prev.map((r) =>
                    String(r.enrollmentId) === String(id)
                        ? {
                              ...r,
                              status: targetStatus,
                              normalizedStatus: nextNorm,
                              rejectionReason:
                                  targetStatus === "REJECTED" ? customReason : null,
                              respondedAt: new Date().toISOString()
                          }
                        : r
                )
            );

            if (detailItem && String(detailItem.enrollmentId) === String(id)) {
                setDetailItem((prev) =>
                    prev
                        ? {
                              ...prev,
                              status: targetStatus,
                              normalizedStatus: nextNorm,
                              rejectionReason:
                                  targetStatus === "REJECTED" ? customReason : null,
                              respondedAt: new Date().toISOString()
                          }
                        : null
                );
            }

            setDeclineReason("");
            showToast(
                targetStatus === "ACTIVE"
                    ? `Accepted ${reqItem.studentName}'s enrollment into "${reqItem.courseTitle}".`
                    : `Declined ${reqItem.studentName}'s request for "${reqItem.courseTitle}".`
            );
        } finally {
            setProcessingId(null);
        }
    };

    const stats = useMemo(() => {
        const total = requests.length;
        const pending = requests.filter((r) => r.normalizedStatus === "PENDING").length;
        const accepted = requests.filter((r) => r.normalizedStatus === "ACCEPTED").length;
        const declined = requests.filter((r) => r.normalizedStatus === "DECLINED").length;
        return { total, pending, accepted, declined };
    }, [requests]);

    const filteredRequests = useMemo(() => {
        return requests.filter((r) => {
            if (activeTab !== "ALL" && r.normalizedStatus !== activeTab) {
                return false;
            }
            if (
                selectedCourseFilter !== "ALL" &&
                String(r.courseId) !== String(selectedCourseFilter) &&
                r.courseTitle !== selectedCourseFilter
            ) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const hay = [
                    r.studentName,
                    r.studentEmail,
                    r.studentGrade,
                    r.courseTitle,
                    r.subjectName,
                    r.requestMessage
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q);
            }
            return true;
        });
    }, [requests, activeTab, selectedCourseFilter, searchQuery]);

    const courseOptions = useMemo(() => {
        const map = new Map();
        courses.forEach((c) => {
            const key = String(c.courseId || c.id);
            if (key) map.set(key, c.title || c.name || `Course #${key}`);
        });
        requests.forEach((r) => {
            const key = String(r.courseId || r.courseTitle);
            if (key && !map.has(key)) map.set(key, r.courseTitle);
        });
        return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
    }, [courses, requests]);

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>
            <div className="enrollment-requests-page">
                {/* Header */}
                <div className="enrollment-mgmt-header">
                    <div>
                        <h1>Course Enrollment Requests</h1>
                        <p>
                            Review student enrollment requests for your courses and approve access to lessons and activities.
                        </p>
                    </div>

                    <div className="enrollment-header-actions">
                        <button
                            type="button"
                            className="btn-refresh-enrollments"
                            onClick={loadData}
                            disabled={loading}
                        >
                            <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {toastMessage && (
                    <div className="enrollment-toast-banner">
                        <CheckCircle2 size={18} />
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* KPI Stat Cards */}
                <div className="enrollment-stats-grid">
                    <div className="enrollment-stat-card">
                        <div className="enrollment-stat-info">
                            <p>Total Requests</p>
                            <h2>{stats.total}</h2>
                        </div>
                        <div className="enrollment-stat-icon purple">
                            <Users size={22} />
                        </div>
                    </div>

                    <div className={`enrollment-stat-card ${stats.pending > 0 ? "highlight-pending" : ""}`}>
                        <div className="enrollment-stat-info">
                            <p>Pending Approval</p>
                            <h2>{stats.pending}</h2>
                        </div>
                        <div className="enrollment-stat-icon amber">
                            <Clock size={22} />
                        </div>
                    </div>

                    <div className="enrollment-stat-card">
                        <div className="enrollment-stat-info">
                            <p>Accepted Students</p>
                            <h2>{stats.accepted}</h2>
                        </div>
                        <div className="enrollment-stat-icon emerald">
                            <UserCheck size={22} />
                        </div>
                    </div>

                    <div className="enrollment-stat-card">
                        <div className="enrollment-stat-info">
                            <p>Declined Requests</p>
                            <h2>{stats.declined}</h2>
                        </div>
                        <div className="enrollment-stat-icon rose">
                            <UserX size={22} />
                        </div>
                    </div>
                </div>

                {/* Filters & Tabs */}
                <div className="enrollment-controls-bar">
                    <div className="enrollment-tabs">
                        <button
                            type="button"
                            className={`enrollment-tab ${activeTab === "ALL" ? "active" : ""}`}
                            onClick={() => setActiveTab("ALL")}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            type="button"
                            className={`enrollment-tab ${activeTab === "PENDING" ? "active" : ""}`}
                            onClick={() => setActiveTab("PENDING")}
                        >
                            Pending ({stats.pending})
                        </button>
                        <button
                            type="button"
                            className={`enrollment-tab ${activeTab === "ACCEPTED" ? "active" : ""}`}
                            onClick={() => setActiveTab("ACCEPTED")}
                        >
                            Accepted ({stats.accepted})
                        </button>
                        <button
                            type="button"
                            className={`enrollment-tab ${activeTab === "DECLINED" ? "active" : ""}`}
                            onClick={() => setActiveTab("DECLINED")}
                        >
                            Declined ({stats.declined})
                        </button>
                    </div>

                    <div className="enrollment-search-filters">
                        <select
                            className="enrollment-course-select"
                            value={selectedCourseFilter}
                            onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        >
                            <option value="ALL">All Courses</option>
                            {courseOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>

                        <div className="enrollment-search-box">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search student, grade, or course..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Card */}
                <div className="enrollment-table-card">
                    {loading && requests.length === 0 ? (
                        <div className="enrollment-empty-state">
                            <p>Loading student enrollment requests...</p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="enrollment-empty-state">
                            <UserCheck size={42} className="empty-state-icon" />
                            <h3>No Enrollment Requests Found</h3>
                            <p>
                                {activeTab === "PENDING"
                                    ? "You're all caught up! New student enrollment requests will appear here automatically."
                                    : "When students click 'Enroll Now' on your courses in the Student Portal, their requests and details will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div className="enrollment-table-wrapper">
                            <table className="enrollment-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Grade</th>
                                        <th>Requested Course</th>
                                        <th>Request Details / Note</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((req) => {
                                        const isBusy = processingId === req.enrollmentId;
                                        return (
                                            <tr key={req.enrollmentId}>
                                                <td>
                                                    <div className="student-cell">
                                                        <div className="student-avatar-circle">
                                                            {req.studentAvatar ? (
                                                                <img
                                                                    src={req.studentAvatar}
                                                                    alt={req.studentName}
                                                                />
                                                            ) : (
                                                                <span>{getInitials(req.studentName)}</span>
                                                            )}
                                                        </div>
                                                        <div className="student-meta">
                                                            <strong>{req.studentName}</strong>
                                                            <span>{req.studentEmail}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="grade-pill-badge">
                                                        {req.studentGrade}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="course-cell">
                                                        <strong>{req.courseTitle}</strong>
                                                        <span>{req.subjectName}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <p className="request-note-snippet" title={req.requestMessage}>
                                                        {req.requestMessage}
                                                    </p>
                                                </td>

                                                <td className="date-cell">
                                                    {formatDateTime(req.createDate || req.enrollmentDate)}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`enrollment-status-pill ${req.normalizedStatus.toLowerCase()}`}
                                                    >
                                                        {req.normalizedStatus === "PENDING"
                                                            ? "Pending"
                                                            : req.normalizedStatus === "ACCEPTED"
                                                            ? "Accepted"
                                                            : "Declined"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="enrollment-row-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-row-view"
                                                            onClick={() => {
                                                                setDetailItem(req);
                                                                setDeclineReason(req.rejectionReason || "");
                                                            }}
                                                            title="View Student Request Details"
                                                        >
                                                            <Eye size={15} />
                                                            <span>Details</span>
                                                        </button>

                                                        {req.normalizedStatus === "PENDING" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn-row-accept"
                                                                    disabled={isBusy}
                                                                    onClick={() => handleDecision(req, "ACTIVE")}
                                                                >
                                                                    <CheckCircle2 size={15} />
                                                                    <span>Accept</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn-row-decline"
                                                                    disabled={isBusy}
                                                                    onClick={() => handleDecision(req, "REJECTED")}
                                                                >
                                                                    <XCircle size={15} />
                                                                    <span>Decline</span>
                                                                </button>
                                                            </>
                                                        )}

                                                        {req.normalizedStatus === "DECLINED" && (
                                                            <button
                                                                type="button"
                                                                className="btn-row-accept"
                                                                disabled={isBusy}
                                                                onClick={() => handleDecision(req, "ACTIVE")}
                                                            >
                                                                <CheckCircle2 size={15} />
                                                                <span>Approve</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Student Enrollment Request Detail Modal */}
                {detailItem && (
                    <div
                        className="enrollment-modal-overlay"
                        onClick={() => setDetailItem(null)}
                    >
                        <div
                            className="enrollment-detail-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="enrollment-modal-header">
                                <div>
                                    <h2>Enrollment Request Details</h2>
                                    <p>Review student details and approve course access</p>
                                </div>
                                <button
                                    type="button"
                                    className="enrollment-modal-close"
                                    onClick={() => setDetailItem(null)}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="enrollment-modal-body">
                                <div className="modal-student-banner">
                                    <div className="student-avatar-circle large">
                                        {detailItem.studentAvatar ? (
                                            <img
                                                src={detailItem.studentAvatar}
                                                alt={detailItem.studentName}
                                            />
                                        ) : (
                                            <span>{getInitials(detailItem.studentName)}</span>
                                        )}
                                    </div>
                                    <div className="modal-student-summary">
                                        <h3>{detailItem.studentName}</h3>
                                        <div className="modal-student-tags">
                                            <span>
                                                <Mail size={13} /> {detailItem.studentEmail}
                                            </span>
                                            <span>
                                                <GraduationCap size={13} /> {detailItem.studentGrade}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`enrollment-status-pill ${detailItem.normalizedStatus.toLowerCase()}`}
                                    >
                                        {detailItem.normalizedStatus === "PENDING"
                                            ? "Pending Approval"
                                            : detailItem.normalizedStatus === "ACCEPTED"
                                            ? "Accepted"
                                            : "Declined"}
                                    </span>
                                </div>

                                <div className="modal-detail-grid">
                                    <div className="modal-detail-box">
                                        <span className="detail-label">
                                            <BookOpen size={14} /> Requested Course
                                        </span>
                                        <strong>{detailItem.courseTitle}</strong>
                                        <small>
                                            {detailItem.subjectName} • {detailItem.gradeLevel}
                                        </small>
                                    </div>

                                    <div className="modal-detail-box">
                                        <span className="detail-label">
                                            <Calendar size={14} /> Submitted On
                                        </span>
                                        <strong>
                                            {formatDateTime(
                                                detailItem.createDate || detailItem.enrollmentDate
                                            )}
                                        </strong>
                                        <small>Student ID #{detailItem.userId || "—"}</small>
                                    </div>
                                </div>

                                <div className="modal-message-card">
                                    <span className="detail-label">
                                        <MessageSquare size={14} /> Student Request Message
                                    </span>
                                    <p>{detailItem.requestMessage}</p>
                                </div>

                                {detailItem.normalizedStatus !== "ACCEPTED" && (
                                    <div className="modal-reason-field">
                                        <label>
                                            Optional Note / Reason (if declining)
                                            <input
                                                type="text"
                                                placeholder="e.g. Please complete Grade 3 prerequisite module first"
                                                value={declineReason}
                                                onChange={(e) => setDeclineReason(e.target.value)}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="enrollment-modal-footer">
                                <button
                                    type="button"
                                    className="btn-modal-secondary"
                                    onClick={() => setDetailItem(null)}
                                >
                                    Close
                                </button>

                                {detailItem.normalizedStatus !== "DECLINED" && (
                                    <button
                                        type="button"
                                        className="btn-modal-decline"
                                        disabled={processingId === detailItem.enrollmentId}
                                        onClick={() =>
                                            handleDecision(detailItem, "REJECTED", declineReason)
                                        }
                                    >
                                        <XCircle size={16} />
                                        <span>Decline Request</span>
                                    </button>
                                )}

                                {detailItem.normalizedStatus !== "ACCEPTED" && (
                                    <button
                                        type="button"
                                        className="btn-modal-accept"
                                        disabled={processingId === detailItem.enrollmentId}
                                        onClick={() => handleDecision(detailItem, "ACTIVE")}
                                    >
                                        <CheckCircle2 size={16} />
                                        <span>Accept Enrollment</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BackofficeLayout>
    );
}

export default EnrollmentRequests;

