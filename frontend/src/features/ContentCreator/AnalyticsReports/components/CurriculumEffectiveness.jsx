import React from "react";
import { curriculumByFilter } from "../data/AnalyticsReportsData.js";

function CurriculumEffectiveness({ grade = "All Grades", range = "Last 30 Days" }) {

    const gradeData =
        curriculumByFilter[grade] ||
        curriculumByFilter["All Grades"];

    const modules =
        gradeData[range] ||
        gradeData["Last 30 Days"];

    return (
        <section className="analytics-panel curriculum-panel">

            <div className="analytics-panel-header">

                <div>
                    <h2>
                        Curriculum Effectiveness
                    </h2>

                    <p>
                        Module performance and recommended actions
                    </p>
                </div>

                <span className="analytics-filter-label">
                    {grade} · {range}
                </span>

            </div>

            <div className="curriculum-table">

                <div className="curriculum-table-header">
                    <span>MODULE</span>
                    <span>SCORE</span>
                    <span>ACTION</span>
                </div>

                {modules.map((item) => (

                    <div
                        className="curriculum-table-row"
                        key={item.id}
                    >

                        <span className="curriculum-module-name">
                            {item.module}
                        </span>

                        <span className="curriculum-score">
                            {item.score}%
                        </span>

                        <span
                            className={`curriculum-status ${item.status}`}
                        >
                            {item.action}
                        </span>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default CurriculumEffectiveness;