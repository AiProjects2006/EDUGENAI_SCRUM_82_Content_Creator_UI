import {
    Settings2,
    CircleHelp,
    AlignLeft,
    Layers3,
    PenLine,
    ChevronRight,
    ListChecks,
    CheckCheck,
    ArrowDownUp,
    MousePointer2,
    ChartColumn,
    TextCursorInput,
    ScanSearch,
    BrainCircuit,
    BriefcaseBusiness,
    Timer,
    Trophy
} from "lucide-react";

import {
    activityTypes,
    difficultyLevels
} from "../data/ActivityData.js";

const icons = {
    circle: CircleHelp,
    lines: AlignLeft,
    cards: Layers3,
    edit: PenLine,
    quiz: ListChecks,
    trueFalse: CheckCheck,
    sorting: ArrowDownUp,
    dragDrop: MousePointer2,
    poll: ChartColumn,
    shortAnswer: TextCursorInput,
    hotspot: ScanSearch,
    problemSolving: BrainCircuit,
    applicationBased: BriefcaseBusiness,
    timedQuiz: Timer,
    challengeQuiz: Trophy,
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
                <label
                    className="activity-config-label"
                    htmlFor="activity-title"
                >
                    ACTIVITY TITLE
                </label>

                <input
                    id="activity-title"
                    type="text"
                    value={settings.title || ""}
                    onChange={(event) =>
                        onSettingChange("title", event.target.value)
                    }
                    placeholder="Enter activity title"
                    maxLength={150}
                    required
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginTop: "8px",
                        boxSizing: "border-box"
                    }}
                />
            </div>

            <div className="activity-config-group">
                <label
                    className="activity-config-label"
                    htmlFor="activity-module-id"
                >
                    MODULE ID
                </label>

                <input
                    id="activity-module-id"
                    type="number"
                    min="1"
                    step="1"
                    value={settings.moduleId ?? ""}
                    onChange={(event) =>
                        onSettingChange("moduleId", event.target.value)
                    }
                    placeholder="Enter module ID"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginTop: "8px",
                        boxSizing: "border-box"
                    }}
                />
            </div>

            <div className="activity-config-group">
                <label
                    className="activity-config-label"
                    htmlFor="activity-display-order"
                >
                    DISPLAY ORDER
                </label>

                <input
                    id="activity-display-order"
                    type="number"
                    min="1"
                    step="1"
                    value={settings.displayOrder ?? ""}
                    onChange={(event) =>
                        onSettingChange("displayOrder", event.target.value)
                    }
                    placeholder="Enter display order"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        marginTop: "8px",
                        boxSizing: "border-box"
                    }}
                />
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

                {settings.activityType === "timed-quiz" && (
                    <div style={{ marginTop: "16px" }}>
                        <label
                            htmlFor="quiz-time-limit"
                            style={{ display: "block", marginBottom: "8px" }}
                        >
                            Time Limit (Minutes)
                        </label>

                        <input
                            id="quiz-time-limit"
                            type="number"
                            min="1"
                            value={settings.timeLimitMinutes ?? 10}
                            onChange={(event) =>
                                onSettingChange("timeLimitMinutes", Number(event.target.value))
                            }
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "1px solid #e5cfee",
                                borderRadius: "8px",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>
                )}

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