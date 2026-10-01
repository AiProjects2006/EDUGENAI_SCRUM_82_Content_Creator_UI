import { useState } from "react";
import { analyticsChartData } from "../data/AnalyticsReportsData.js";

function LearningMinutes({ grade = "All Grades", range = "Last 30 Days" }) {
    const [activeRange, setActiveRange] = useState("30D");

    const gradeData =
        analyticsChartData[grade] ||
        analyticsChartData["All Grades"];

    const rangeData =
        gradeData[range] ||
        gradeData["Last 30 Days"];

    const sourceData = rangeData.learningMinutes || [];

    const ranges = {
        "7D": 7,
        "30D": 30,
        "90D": 90
    };

    const count = ranges[activeRange];

    const values = Array.from(
        { length: count },
        (_, index) => {
            if (sourceData.length === 0) {
                return 0;
            }

            return sourceData[index % sourceData.length];
        }
    );

    const maxValue = Math.max(...values, 1);

    return (
        <section className="analytics-panel learning-minutes-panel">

            <div className="analytics-panel-header">

                <div>
                    <h2>
                        Active Learning Minutes
                    </h2>

                    <p>
                        Daily learning activity across students
                    </p>
                </div>

                <div className="learning-range-buttons">

                    {Object.keys(ranges).map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={
                                activeRange === item
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveRange(item)
                            }
                        >
                            {item}
                        </button>
                    ))}

                </div>

            </div>

            <div className="learning-minutes-chart">

                <div className="learning-y-axis">
                    <span>{maxValue}</span>
                    <span>{Math.round(maxValue / 2)}</span>
                    <span>0</span>
                </div>

                <div className="learning-chart-area">

                    <div className="learning-grid-line top" />
                    <div className="learning-grid-line middle" />
                    <div className="learning-grid-line bottom" />

                    <div className="learning-bars">

                        {values.map((value, index) => (
                            <div
                                className="learning-bar-column"
                                key={`${activeRange}-${index}`}
                            >
                                <div
                                    className="learning-bar"
                                    style={{
                                        height: `${
                                            (value / maxValue) * 100
                                        }%`
                                    }}
                                    title={`${value} minutes`}
                                />
                            </div>
                        ))}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default LearningMinutes;