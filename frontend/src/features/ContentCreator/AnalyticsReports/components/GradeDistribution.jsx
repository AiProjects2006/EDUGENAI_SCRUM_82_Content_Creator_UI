import { analyticsChartData } from "../data/AnalyticsReportsData.js";

function GradeDistribution({ grade = "All Grades", range = "Last 30 Days" }) {
    const gradeData =
        analyticsChartData[grade] ||
        analyticsChartData["All Grades"];

    const rangeData =
        gradeData[range] ||
        gradeData["Last 30 Days"];

    const distribution =
        rangeData.grades || [];

    const labels = ["A", "B", "C", "D", "E"];

    const max =
        Math.max(...distribution, 1);

    return (
        <section className="analytics-panel grade-distribution-panel">

            <div className="analytics-panel-header">
                <h2>
                    Grade Distribution
                </h2>
            </div>

            <div className="grade-chart">

                <div className="grade-area">

                    <div className="grade-curve">

                        {distribution.map(
                            (value, index) => (
                                <div
                                    key={
                                        labels[index] ||
                                        index
                                    }
                                    className="grade-point"
                                    style={{
                                        height: `${
                                            (value / max) *
                                            75
                                        }%`
                                    }}
                                >
                                    <span />
                                </div>
                            )
                        )}

                    </div>

                    <div className="grade-axis">

                        {distribution.map(
                            (_, index) => (
                                <span
                                    key={
                                        labels[index] ||
                                        index
                                    }
                                >
                                    {labels[index] ||
                                        index + 1}
                                </span>
                            )
                        )}

                    </div>

                </div>

            </div>

            <p className="grade-description">
                The distribution indicates a healthy
                performance spread, with most learners
                achieving proficient or above-level scores.
            </p>

        </section>
    );
}

export default GradeDistribution;