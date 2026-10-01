import { useState } from "react";
import {
    CalendarDays,
    Download,
    AlertTriangle
} from "lucide-react";

import { getEngagement, lessonEngagement, dailyEngagement, subjectEngagement } from "./data/engagementData";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar";

import "./StudentEngagement.css";

function StudentEngagement() {

    const [dateRange, setDateRange] = useState("Last 30 Days");

    const engagementData = getEngagement();

    const rangeDays = {
        "Last 7 Days": 7,
        "Last 30 Days": 30,
        "Last 90 Days": 90
    };

    const chartPointCount = {
        "Last 7 Days": 7,
        "Last 30 Days": 20,
        "Last 90 Days": 20
    };

    const visibleChartData = dailyEngagement
        .slice(0, chartPointCount[dateRange]);

    const filteredEngagement = engagementData.filter(
        (student) =>
            student.daysAgo <= rangeDays[dateRange]
    );

    const totalStudents = filteredEngagement.length;

    const averageTime =
        totalStudents > 0
            ? engagementData.reduce(
            (total, student) => total + student.timeSpent,
            0
        ) / totalStudents
            : 0;

    const averageCompletion =
        filteredEngagement.length > 0
            ? filteredEngagement.reduce(
            (total, student) => total + Number(student.completion),
            0
        ) / filteredEngagement.length
            : 0;

    const currentAverageTime = averageTime;

    const previousRangeDays = rangeDays[dateRange];

    const previousEngagement = engagementData.filter(
        (student) =>
            student.daysAgo > previousRangeDays &&
            student.daysAgo <= previousRangeDays * 2
    );

    const previousAverageTime =
        previousEngagement.length > 0
            ? previousEngagement.reduce(
            (total, student) =>
                total + Number(student.timeSpent),
            0
        ) / previousEngagement.length
            : 0;

    const engagementGrowth =
        previousAverageTime > 0
            ? ((currentAverageTime - previousAverageTime) /
            previousAverageTime) * 100
            : 0;

    const highEngagementStudents = [...filteredEngagement]
        .sort((a, b) => b.completion - a.completion)
        .slice(0, 3);

    const retentionRisks = filteredEngagement
        .filter((student) => Number(student.daysAgo) >= 3)
        .sort((a, b) => Number(b.daysAgo) - Number(a.daysAgo));

    const handleExport = () => {
        const report = {
            dateRange,
            summary: {
                weeklyEngagement: `${averageTime.toFixed(1)} hours`,
                completionRate: `${Math.round(averageCompletion)}%`,
                activeStudents: totalStudents,
                engagementGrowth: "+12%"
            },
            students: filteredEngagement.map((student) => ({
                name: student.studentName,
                course: student.course,
                timeSpent: `${student.timeSpent} hours/week`,
                completion: `${student.completion}%`,
                lastActive: student.lastActive,
                daysIdle: student.daysAgo
            })),
            retentionRisk: retentionRisks.map((student) => ({
                name: student.studentName,
                course: student.course,
                daysIdle: student.daysAgo
            }))
        };

        const file = new Blob(
            [JSON.stringify(report, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(file);

        const link = document.createElement("a");

        link.href = url;

        link.download = `student-engagement-${dateRange
            .toLowerCase()
            .replaceAll(" ", "-")}.json`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const handleAlertGuardians = () => {
        if (retentionRisks.length === 0) {
            alert("There are no students currently at retention risk.");
            return;
        }

        const names = retentionRisks
            .map((student) => student.studentName)
            .join(", ");

        alert(
            `Guardian alerts sent for: ${names}`
        );
    };

    const science = subjectEngagement.find(
        (item) => item.subject === "Science"
    )?.percentage || 0;

    const math = subjectEngagement.find(
        (item) => item.subject === "Math"
    )?.percentage || 0;

    const ict = subjectEngagement.find(
        (item) => item.subject === "ICT"
    )?.percentage || 0;

    const mathEnd = science + math;
    const ictEnd = mathEnd + ict;

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="student-engagement-page">

                <div className="engagement-header">

                    <div>
                        <h1>Student Engagement</h1>

                        <p>
                            Real-time interaction tracking for Middle School curriculum.
                        </p>
                    </div>

                    <div className="engagement-header-actions">

                        <select
                            className="date-btn"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="Last 7 Days">
                                Last 7 Days
                            </option>

                            <option value="Last 30 Days">
                                Last 30 Days
                            </option>

                            <option value="Last 90 Days">
                                Last 90 Days
                            </option>
                        </select>

                        <button
                            className="export-btn"
                            onClick={handleExport}
                        >
                            <Download size={14} />
                            EXPORT
                        </button>

                    </div>

                </div>

                <div className="engagement-summary">

                    <div className="engagement-card">

                        <span>WEEKLY ENGAGEMENT</span>

                        <div className="engagement-value">
                            {averageTime.toFixed(1)}
                            <small> hours</small>
                        </div>

                        <p>per student</p>

                    </div>

                    <div className="engagement-card">

                        <span>COMPLETION RATE</span>

                        <div className="engagement-value">
                            {Math.round(averageCompletion)}%
                        </div>

                        <div className="mini-progress">
                            <span
                                style={{
                                    width: `${averageCompletion}%`
                                }}
                            />
                        </div>

                    </div>

                    <div className="engagement-card">

                        <span>ACTIVE STUDENTS</span>

                        <div className="engagement-value">
                            {totalStudents.toLocaleString()}
                        </div>

                        <p>students in selected period</p>


                    </div>

                    <div className="engagement-card">

                        <span>ENGAGEMENT GROWTH</span>

                        <div className="engagement-value growth">
                            {engagementGrowth >= 0 ? "+" : ""}
                            {Math.round(engagementGrowth)}%
                        </div>

                        <p>vs. previous month</p>

                    </div>

                </div>

                <div className="engagement-panel daily-engagement">

                    <div className="panel-heading">

                        <h3>Daily Active Engagement</h3>

                        <div className="chart-legend">

                            <span>
                                <i className="legend-dot science" />
                                Science
                            </span>

                            <span>
                                <i className="legend-dot math" />
                                Math
                            </span>

                            <span>
                                <i className="legend-dot ict" />
                                ICT
                            </span>

                        </div>

                    </div>

                    <div className="line-chart">

                        <div className="chart-grid">
                            <span />
                            <span />
                            <span />
                            <span />
                            <span />
                        </div>

                        <svg
                            viewBox="0 0 900 260"
                            preserveAspectRatio="none"
                        >

                            <polyline
                                points={visibleChartData
                                    .map(
                                        (item, index) =>
                                            `${index * 47},${240 - item.value * 2}`
                                    )
                                    .join(" ")}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                            />

                        </svg>

                        <div className="chart-dates">
                            <span>Oct 01</span>
                            <span>Oct 08</span>
                            <span>Oct 15</span>
                            <span>Oct 22</span>
                            <span>Oct 30</span>
                        </div>

                    </div>

                </div>

                <div className="engagement-middle">

                    <div className="engagement-panel subject-panel">

                        <div className="panel-heading">
                            <h3>Time Spent per Subject</h3>
                        </div>

                        <div className="subject-content">

                            <div className="donut-chart">

                                <div
                                    className="donut-ring"
                                    style={{
                                        background: `conic-gradient(
                                            #6d28d9 0% ${science}%,
                                            #c026d3 ${science}% ${mathEnd}%,
                                            #7e22ce ${mathEnd}% ${ictEnd}%
                                        )`
                                    }}
                                />

                                <div className="donut-center">
                                    <strong>{ictEnd}%</strong>
                                    <span>Total time</span>
                                </div>

                            </div>

                            <div className="subject-legend">

                                {subjectEngagement.map((item) => (

                                    <div key={item.subject}>
                                        <i />

                                        <span>
                                            {item.subject.toUpperCase()} ({item.percentage}%)
                                        </span>

                                        <small>
                                            {item.hours} hrs/week
                                        </small>
                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>

                    <div className="engagement-panel lessons-panel">

                        <div className="panel-heading">
                            <h3>Most Engaging Lessons</h3>
                        </div>

                        <div className="lesson-engagement-list">

                            {lessonEngagement.map((lesson) => (

                                <div
                                    className="lesson-engagement"
                                    key={lesson.title}
                                >

                                    <div className="lesson-engagement-top">

                                        <div>
                                            <strong>{lesson.title}</strong>
                                            <span>{lesson.subject}</span>
                                        </div>

                                        <b>{lesson.percentage}%</b>

                                    </div>

                                    <div className="lesson-progress">
                                        <span
                                            style={{
                                                width: `${lesson.percentage}%`
                                            }}
                                        />
                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

                <div className="engagement-bottom">

                    <div className="engagement-panel students-panel">

                        <div className="panel-heading">
                            <h3>High Engagement Students</h3>
                        </div>

                        <table className="engagement-students-table">

                            <thead>

                            <tr>
                                <th>STUDENT</th>
                                <th>COURSE</th>
                                <th>AVG. TIME</th>
                                <th>COMPLETION</th>
                            </tr>

                            </thead>

                            <tbody>

                            {highEngagementStudents.map((student, index) => (

                                <tr key={student.id}>

                                    <td>

                                        <div className="student-name">

                                                <span className={`student-avatar avatar-${index}`}>
                                                    {student.studentName.charAt(0)}
                                                </span>

                                            {student.studentName}

                                        </div>

                                    </td>

                                    <td>{student.course}</td>

                                    <td>{student.timeSpent.toFixed(1)} hrs/wk</td>

                                    <td>
                                            <span className="completion-pill">
                                                {student.completion}%
                                            </span>
                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>


                    <div className="engagement-panel retention-panel">

                        <div className="retention-heading">

                            <AlertTriangle size={15} />

                            <h3>Retention Risk</h3>

                        </div>

                        <p>
                            Students with 3+ days of inactivity.
                        </p>

                        <div className="risk-list">

                            {retentionRisks.length > 0 ? (

                                retentionRisks.map((student) => (

                                    <div
                                        className="risk-item"
                                        key={student.id}
                                    >

                                        <div>
                                            <strong>{student.studentName}</strong>
                                            <span>{student.course}</span>
                                        </div>

                                        <b>
                                            {student.daysAgo} Days Idle
                                        </b>

                                    </div>

                                ))

                            ) : (

                                <div className="no-risk-message">
                                    No students currently at retention risk.
                                </div>

                            )}

                        </div>

                        <button
                            className="alert-guardians-btn"
                            onClick={handleAlertGuardians}
                        >
                            ALERT GUARDIANS
                        </button>

                    </div>

                </div>

            </div>

        </BackofficeLayout>
    );
}

export default StudentEngagement;