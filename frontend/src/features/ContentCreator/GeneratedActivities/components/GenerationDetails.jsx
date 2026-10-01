import {
    Sparkles,
    ChevronRight
} from "lucide-react";

import {
    activityData,
    curriculumAlignment
} from "../data/GeneratedActivitiesData.js";

function GenerationDetails() {
    return (
        <section className="generation-details-card">

            <div className="details-card-title">
                <Sparkles size={10} />
                Generation Details
            </div>

            <div className="details-section">

                <span className="details-label">
                    MODEL USED
                </span>

                <strong>
                    {activityData.model}
                </strong>

            </div>

            <div className="details-section">

                <span className="details-label">
                    GENERATION SOURCE
                </span>

                <div className="generation-source">
                    <span className="source-stars">
                        ●●●●
                    </span>

                    <span>
                        {activityData.source}
                    </span>
                </div>

            </div>

            <div className="details-section">

                <span className="details-label">
                    CURRICULUM ALIGNMENT
                </span>

                <div className="alignment-list">

                    {curriculumAlignment.map(
                        (item) => (
                            <div
                                className="alignment-item"
                                key={item}
                            >
                                <span>
                                    ✓
                                </span>

                                <span>
                                    {item}
                                </span>
                            </div>
                        )
                    )}

                </div>

            </div>

            <button
                type="button"
                className="adjust-prompt-button"
            >
                Adjust Generation Prompt
                <ChevronRight size={10} />
            </button>

        </section>
    );
}

export default GenerationDetails;