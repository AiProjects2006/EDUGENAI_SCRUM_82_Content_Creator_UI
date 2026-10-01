import {
    Settings2,
    CircleHelp,
    AlignLeft,
    Layers3,
    PenLine,
    ChevronRight
} from "lucide-react";

import {
    activityTypes,
    difficultyLevels
} from "../data/ActivityGeneratorData.js";

const icons = {
    circle: CircleHelp,
    lines: AlignLeft,
    cards: Layers3,
    edit: PenLine
};

function ActivityConfiguration({
                                   settings,
                                   onSettingChange
                               }) {
    const difficultyIndex =
        difficultyLevels.indexOf(
            settings.difficulty
        );

    return (
        <section className="activity-configuration-card">

            <div className="activity-section-heading">

                <div className="activity-section-heading-title">
                    <Settings2 size={15} />

                    <span>
                        Configuration
                    </span>
                </div>

                <ChevronRight size={13} />

            </div>

            <div className="activity-config-group">

                <span className="activity-config-label">
                    ACTIVITY TYPE
                </span>

                <div className="activity-types">

                    {activityTypes.map((type) => {
                        const Icon = icons[type.icon];

                        const active =
                            settings.activityType ===
                            type.id;

                        return (
                            <button
                                type="button"
                                key={type.id}
                                className={`activity-type ${
                                    active
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    onSettingChange(
                                        "activityType",
                                        type.id
                                    )
                                }
                            >
                                <Icon size={16} />

                                <span>
                                    {type.label}
                                </span>
                            </button>
                        );
                    })}

                </div>

            </div>

            <div className="activity-slider-group">

                <div className="activity-slider-heading">
                    <span>
                        DIFFICULTY LEVEL
                    </span>

                    <strong>
                        {settings.difficulty.toUpperCase()}
                    </strong>
                </div>

                <input
                    type="range"
                    min="0"
                    max="2"
                    step="1"
                    value={difficultyIndex}
                    onChange={(event) =>
                        onSettingChange(
                            "difficulty",
                            difficultyLevels[
                                Number(
                                    event.target.value
                                )
                                ]
                        )
                    }
                />

            </div>

        </section>
    );
}

export default ActivityConfiguration;