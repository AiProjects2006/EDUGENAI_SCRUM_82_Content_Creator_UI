import {
    Settings2,
    CircleHelp,
    CheckSquare,
    AlignLeft,
    Link2,
    Layers3,
    ListOrdered,
    PenLine,
    BookOpen,
    Crosshair,
    Calculator,
    Lightbulb,
    Timer,
    BarChart3,
    Trophy,
    Sparkles,
    ChevronRight
} from "lucide-react";

import {
    activityTypes,
    difficultyLevels
} from "../data/ActivityData.js";

const icons = {
    circle: CircleHelp,
    check: CheckSquare,
    lines: AlignLeft,
    link: Link2,
    cards: Layers3,
    list: ListOrdered,
    edit: PenLine,
    book: BookOpen,
    target: Crosshair,
    calc: Calculator,
    bulb: Lightbulb,
    timer: Timer,
    chart: BarChart3,
    trophy: Trophy
};

function ActivityConfiguration({
    settings,
    onSettingChange,
    onGenerate,
    isGenerating
}) {
    const difficultyIndex = Math.max(
        0,
        difficultyLevels.indexOf(settings.difficulty)
    );

    return (
        <section className="activity-configuration-card">
            <div className="activity-section-heading">
                <div className="activity-section-heading-title">
                    <Settings2 size={15} />
                    <span>Question Type & AI Config</span>
                </div>
                <ChevronRight size={13} />
            </div>

            <div className="activity-config-group">
                <span className="activity-config-label">
                    QUESTION / ACTIVITY TYPE
                </span>

                <div className="activity-types">
                    {activityTypes.map((type) => {
                        const Icon = icons[type.icon] || CircleHelp;
                        const active = settings.activityType === type.id;

                        return (
                            <button
                                type="button"
                                key={type.id}
                                className={`activity-type ${active ? "active" : ""}`}
                                onClick={() => onSettingChange("activityType", type.id)}
                            >
                                <Icon size={16} />
                                <span style={{ textAlign: "center", lineHeight: 1.25 }}>
                                    {type.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="activity-slider-group" style={{ marginBottom: "18px" }}>
                <div className="activity-slider-heading">
                    <span>DIFFICULTY LEVEL</span>
                    <strong>{settings.difficulty.toUpperCase()}</strong>
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
                            difficultyLevels[Number(event.target.value)]
                        )
                    }
                />
            </div>

            <div className="activity-slider-group" style={{ marginBottom: "20px" }}>
                <div className="activity-slider-heading">
                    <span>NUMBER OF QUESTIONS</span>
                    <strong>{settings.questionCount || 5}</strong>
                </div>

                <input
                    type="range"
                    min="3"
                    max="10"
                    step="1"
                    value={settings.questionCount || 5}
                    onChange={(event) =>
                        onSettingChange("questionCount", Number(event.target.value))
                    }
                />
            </div>

            <button
                type="button"
                onClick={onGenerate}
                disabled={isGenerating}
                style={{
                    width: "100%",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    border: "none",
                    borderRadius: "7px",
                    background: isGenerating ? "#9b6aa8" : "#72008c",
                    color: "#ffffff",
                    fontFamily: "inherit",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isGenerating ? "wait" : "pointer",
                    boxShadow: "0 4px 12px rgba(114, 0, 140, 0.25)"
                }}
            >
                <Sparkles size={15} />
                {isGenerating
                    ? "Generating Multi-Agent Questions..."
                    : "Generate with Multi-Agent AI"}
            </button>
        </section>
    );
}

export default ActivityConfiguration;
