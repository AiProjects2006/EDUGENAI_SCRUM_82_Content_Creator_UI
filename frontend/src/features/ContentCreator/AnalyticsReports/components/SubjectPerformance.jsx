import { analyticsChartData } from "../data/AnalyticsReportsData.js";

function SubjectPerformance({ grade, range }) {
    const gradeData =
        analyticsChartData[grade] ||
        analyticsChartData["All Grades"];

    const rangeData =
        gradeData[range] ||
        gradeData["Last 30 Days"];

    const subjectData =
        rangeData.subjects;

    return (
        <section className="analytics-panel subject-performance-panel">

            <div className="analytics-panel-header">
                <h2>
                    Subject Performance Comparison
                </h2>

                <button type="button">
                    View Details
                </button>
            </div>

            <div className="subject-chart">

                <div className="subject-y-axis">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                </div>

                <div className="subject-chart-area">

                    <div className="subject-grid-lines">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="subject-bars">

                        {subjectData.map(
                            (item) => (
                                <div
                                    className="subject-group"
                                    key={item.subject}
                                >
                                    <div className="subject-bars-wrap">

                                        <div
                                            className="subject-bar mastered"
                                            style={{
                                                height: `${item.mastered}%`
                                            }}
                                        />

                                        <div
                                            className="subject-bar target"
                                            style={{
                                                height: `${item.target}%`
                                            }}
                                        />

                                    </div>

                                    <span>
                                        {item.subject}
                                    </span>
                                </div>
                            )
                        )}

                    </div>

                </div>

            </div>

            <div className="subject-legend">

                <span>
                    <i className="legend-mastered" />
                    Mastered
                </span>

                <span>
                    <i className="legend-target" />
                    Target
                </span>

            </div>

        </section>
    );
}

export default SubjectPerformance;