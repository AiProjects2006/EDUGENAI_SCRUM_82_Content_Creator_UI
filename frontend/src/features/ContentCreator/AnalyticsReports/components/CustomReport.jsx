import { useState } from "react";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import { analyticsByGrade, analyticsByRange } from "../data/AnalyticsReportsData.js";

function CustomReport({
                          grade = "All Grades",
                          range = "Last 30 Days"
                      }) {
    const [reportType, setReportType] =
        useState("Performance Summary");

    const [metrics, setMetrics] = useState({
        scores: true,
        completion: true,
        engagement: false
    });

    const [generated, setGenerated] = useState(false);

    const handleMetricChange = (name) => {
        setMetrics((prev) => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const getAnalyticsData = () => {
        const gradeData =
            analyticsByGrade[grade] ||
            analyticsByGrade["All Grades"];

        const rangeData =
            analyticsByRange[range] ||
            analyticsByRange["Last 30 Days"];

        return {
            averageScore:
                grade !== "All Grades"
                    ? gradeData.averageScore
                    : rangeData.averageScore,

            completion:
                grade !== "All Grades"
                    ? gradeData.completion
                    : rangeData.completion,

            students:
                grade !== "All Grades"
                    ? gradeData.students
                    : rangeData.students,

            learningMinutes:
                grade !== "All Grades"
                    ? gradeData.learningMinutes
                    : rangeData.learningMinutes
        };
    };

    const handleGenerateReport = () => {
        const data = getAnalyticsData();

        const pdf = new jsPDF();

        pdf.setTextColor(40, 40, 40);

        // Header
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("EduGenAI", 20, 25);

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        pdf.text("Analytics Report", 20, 35);

        pdf.line(20, 42, 190, 42);

        // Filters
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Report Type", 20, 55);

        pdf.setFont("helvetica", "normal");
        pdf.text(reportType, 65, 55);

        pdf.setFont("helvetica", "bold");
        pdf.text("Grade", 20, 64);

        pdf.setFont("helvetica", "normal");
        pdf.text(grade, 65, 64);

        pdf.setFont("helvetica", "bold");
        pdf.text("Date Range", 20, 73);

        pdf.setFont("helvetica", "normal");
        pdf.text(range, 65, 73);

        // Overview
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Analytics Overview", 20, 90);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        let currentY = 102;

        if (metrics.scores) {
            pdf.text(
                `Average Score: ${data.averageScore}`,
                25,
                currentY
            );

            currentY += 10;
        }

        if (metrics.completion) {
            pdf.text(
                `Course Completion: ${data.completion}`,
                25,
                currentY
            );

            currentY += 10;
        }

        if (metrics.engagement) {
            pdf.text(
                `Active Students: ${data.students}`,
                25,
                currentY
            );

            currentY += 10;
        }

        pdf.text(
            `Total Learning: ${data.learningMinutes} MIN`,
            25,
            currentY
        );

        currentY += 20;

        // Current selection summary
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Report Summary", 20, currentY);

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            `Analytics for ${grade} covering ${range}.`,
            25,
            currentY + 12
        );

        pdf.text(
            "The report reflects the currently selected dashboard filters.",
            25,
            currentY + 20
        );

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);

        pdf.text(
            "EduGenAI Analytics & Reports",
            20,
            285
        );

        pdf.text(
            `Generated ${new Date().toLocaleDateString()}`,
            135,
            285
        );

        pdf.save(
            `edugenai-${grade.replace(/\s+/g, "-").toLowerCase()}-analytics.pdf`
        );

        setGenerated(true);

        window.setTimeout(() => {
            setGenerated(false);
        }, 2500);
    };

    return (
        <section className="analytics-panel custom-report-panel">

            <div className="custom-report-title">
                <FileText size={14} />

                <h2>
                    Custom Report
                </h2>
            </div>

            <p className="custom-report-description">
                Generate a customized analytics report
                using the metrics you need.
            </p>

            <label>
                REPORT TYPE
            </label>

            <select
                value={reportType}
                onChange={(event) =>
                    setReportType(event.target.value)
                }
            >
                <option>Performance Summary</option>
                <option>Student Engagement</option>
                <option>Curriculum Analysis</option>
                <option>Complete Analytics</option>
            </select>

            <div className="custom-report-options">

                <label className="report-option">
                    <input
                        type="checkbox"
                        checked={metrics.scores}
                        onChange={() =>
                            handleMetricChange("scores")
                        }
                    />
                    Scores
                </label>

                <label className="report-option">
                    <input
                        type="checkbox"
                        checked={metrics.completion}
                        onChange={() =>
                            handleMetricChange("completion")
                        }
                    />
                    Completion
                </label>

                <label className="report-option">
                    <input
                        type="checkbox"
                        checked={metrics.engagement}
                        onChange={() =>
                            handleMetricChange("engagement")
                        }
                    />
                    Engagement
                </label>

            </div>

            <button
                type="button"
                className="compile-report-button"
                onClick={handleGenerateReport}
            >
                <Download size={10} />

                {generated
                    ? "Report Generated"
                    : "Generate Report"}
            </button>

        </section>
    );
}

export default CustomReport;