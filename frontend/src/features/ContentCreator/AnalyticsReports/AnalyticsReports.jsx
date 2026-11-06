import { useState } from "react";
import { CalendarDays, Upload } from "lucide-react";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";

import AnalyticsOverview from "./components/AnalyticsOverview.jsx";
import SubjectPerformance from "./components/SubjectPerformance.jsx";
import GradeDistribution from "./components/GradeDistribution.jsx";
import CurriculumEffectiveness from "./components/CurriculumEffectiveness.jsx";
import CustomReport from "./components/CustomReport.jsx";
import LearningMinutes from "./components/LearningMinutes.jsx";

import { analyticsByGrade, analyticsByRange } from "./data/AnalyticsReportsData.js";

import "./AnalyticsReports.css";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

function AnalyticsReports() {
    const [grade, setGrade] =
        useState("All Grades");

    const [range, setRange] =
        useState("Last 30 Days");

    const [published, setPublished] =
        useState(false);

    const handlePublish = () => {
        setPublished(true);

        window.setTimeout(() => {
            setPublished(false);
        }, 2500);
    };

    const selectedGradeData =
        analyticsByGrade[grade];

    const selectedRangeData =
        analyticsByRange[range];

    const analyticsData = {
        averageScore:
            grade === "All Grades"
                ? selectedRangeData.averageScore
                : selectedGradeData.averageScore,

        completion:
            grade === "All Grades"
                ? selectedRangeData.completion
                : selectedGradeData.completion,

        students:
            grade === "All Grades"
                ? selectedRangeData.students
                : selectedGradeData.students,

        learningMinutes:
            grade === "All Grades"
                ? selectedRangeData.learningMinutes
                : selectedGradeData.learningMinutes
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="analytics-reports-page">

                <header className="analytics-page-header">

                    <div>
                        <h1>
                            Analytics &amp; Reports
                        </h1>

                        <p>
                            Monitor student performance,
                            curriculum effectiveness,
                            and engagement
                        </p>
                    </div>

                    <div className="analytics-page-actions">

                        <div className="analytics-select-wrap">

                            <select
                                value={grade}
                                onChange={(event) =>
                                    setGrade(
                                        event.target.value
                                    )
                                }
                            >
                                <option>
                                    All Grades
                                </option>

                                <option>
                                    Grade 4
                                </option>

                                <option>
                                    Grade 7
                                </option>

                                <option>
                                    Grade 9
                                </option>
                            </select>

                        </div>

                        <div className="analytics-select-wrap">

                            <CalendarDays size={10} />

                            <select
                                value={range}
                                onChange={(event) =>
                                    setRange(
                                        event.target.value
                                    )
                                }
                            >
                                <option>
                                    Last 30 Days
                                </option>

                                <option>
                                    Last 7 Days
                                </option>

                                <option>
                                    Last 90 Days
                                </option>

                                <option>
                                    This Year
                                </option>
                            </select>

                        </div>

                        <button
                            type="button"
                            className="analytics-publish-button"
                            onClick={handlePublish}
                        >
                            <Upload size={10} />
                            Publish
                        </button>

                    </div>

                </header>

                {published && (
                    <div className="analytics-publish-message">
                        Report published successfully.
                    </div>
                )}

                <AnalyticsOverview data={analyticsData} />

                <div className="analytics-chart-row">

                    <SubjectPerformance
                        grade={grade}
                        range={range}
                    />

                    <GradeDistribution
                        grade={grade}
                        range={range}
                    />

                </div>

                <div className="analytics-bottom-row">

                    <CurriculumEffectiveness
                        grade={grade}
                        range={range}
                    />

                    <CustomReport
                        grade={grade}
                        range={range}
                    />

                </div>

                <LearningMinutes
                    grade={grade}
                    range={range}
                />

            </div>

        </BackofficeLayout>
    );
}

export default AnalyticsReports;