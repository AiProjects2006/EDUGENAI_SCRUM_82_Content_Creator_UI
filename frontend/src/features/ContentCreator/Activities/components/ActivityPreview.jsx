import {
    Plus,
    Trash2,
    CheckCircle2,
    Save,
    GripVertical,
    Sparkles
} from "lucide-react";
import { activityTypes } from "../data/ActivityData.js";

function ActivityPreview({
    course,
    lesson,
    settings,
    questions,
    isSaving,
    statusMessage,
    onGenerate,
    onAddQuestion,
    onUpdateQuestion,
    onUpdateOption,
    onSetCorrectAnswer,
    onDeleteQuestion,
    onSaveActivity
}) {
    const typeLabel =
        activityTypes.find((t) => t.id === settings.activityType)?.label ||
        settings.activityType;

    return (
        <div className="activity-editor">
            <div className="activity-editor-header">
                <div>
                    <span className="activity-editor-label">
                        MULTI-AGENT ACTIVITY PREVIEW
                    </span>
                    <h2>{typeLabel}</h2>
                    <p>
                        {course || "Select Course"} · {lesson || "Select Module"}
                    </p>
                </div>

                <div className="activity-editor-actions">
                    <button
                        type="button"
                        className="activity-add-question"
                        onClick={onAddQuestion}
                    >
                        <Plus size={14} />
                        Add Question
                    </button>

                    <button
                        type="button"
                        className="activity-save-button"
                        onClick={onSaveActivity}
                        disabled={!questions.length || isSaving}
                        style={
                            questions.length
                                ? {
                                      background: "#72008c",
                                      color: "#ffffff",
                                      borderColor: "#72008c"
                                  }
                                : undefined
                        }
                    >
                        <Save size={14} />
                        {isSaving ? "Publishing..." : "Publish to Module"}
                    </button>
                </div>
            </div>

            {statusMessage && (
                <div
                    style={{
                        marginBottom: "18px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "#ecfdf5",
                        border: "1px solid #6ee7b7",
                        color: "#065f46",
                        fontSize: "12px",
                        fontWeight: 600
                    }}
                >
                    {statusMessage}
                </div>
            )}

            <div className="activity-editor-meta">
                <div>
                    <span>QUESTION TYPE</span>
                    <strong>{typeLabel}</strong>
                </div>

                <div>
                    <span>DIFFICULTY</span>
                    <strong>{settings.difficulty}</strong>
                </div>

                <div>
                    <span>QUESTIONS</span>
                    <strong>{questions.length}</strong>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="activity-empty-editor">
                    <div className="activity-empty-icon">
                        <Sparkles size={25} />
                    </div>

                    <h3>Generate or build questions for {lesson || "this module"}</h3>

                    <p>
                        Select a Question Type on the left and click{" "}
                        <strong>Generate with Multi-Agent AI</strong> to create curriculum-aligned
                        questions for <strong>{course}</strong> ({lesson}), then click{" "}
                        <strong>Publish to Module</strong> so students see it inside their Course & Module!
                    </p>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                        <button type="button" onClick={onGenerate}>
                            <Sparkles size={14} />
                            Generate with Multi-Agent AI
                        </button>
                        <button
                            type="button"
                            onClick={onAddQuestion}
                            style={{ background: "#ffffff", color: "#72008c" }}
                        >
                            <Plus size={14} />
                            Add Manually
                        </button>
                    </div>
                </div>
            ) : (
                <div className="activity-question-list">
                    {questions.map((question, questionIndex) => {
                        const hasOptions = Array.isArray(question.options) && question.options.length > 0;
                        const hasMatching = Array.isArray(question.leftItems) && question.leftItems.length > 0;
                        const hasSorting = Array.isArray(question.items) && question.items.length > 0;
                        const hasOrder = Array.isArray(question.itemsToOrder) && question.itemsToOrder.length > 0;
                        const hasRegions = Array.isArray(question.regions) && question.regions.length > 0;

                        return (
                            <article className="activity-question-card" key={question.id}>
                                <div className="activity-question-header">
                                    <div className="activity-question-number">
                                        <GripVertical size={13} />
                                        Question {questionIndex + 1} ({question.activityType || settings.activityType})
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onDeleteQuestion(question.id)}
                                        aria-label="Delete question"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="activity-question-body">
                                    {question.scenario && (
                                        <div style={{ marginBottom: "14px" }}>
                                            <label style={{ display: "block", marginBottom: "6px", color: "#75677a", fontSize: "10px", fontWeight: 700 }}>
                                                SCENARIO
                                            </label>
                                            <textarea
                                                style={{ width: "100%", minHeight: "68px", padding: "10px", border: "1px solid #e5d9e8", borderRadius: "6px", fontFamily: "inherit", fontSize: "12px" }}
                                                value={question.scenario}
                                                onChange={(e) => onUpdateQuestion(question.id, "scenario", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {question.passage && (
                                        <div style={{ marginBottom: "14px" }}>
                                            <label style={{ display: "block", marginBottom: "6px", color: "#75677a", fontSize: "10px", fontWeight: 700 }}>
                                                READING PASSAGE
                                            </label>
                                            <textarea
                                                style={{ width: "100%", minHeight: "76px", padding: "10px", border: "1px solid #e5d9e8", borderRadius: "6px", fontFamily: "inherit", fontSize: "12px" }}
                                                value={question.passage}
                                                onChange={(e) => onUpdateQuestion(question.id, "passage", e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <label>QUESTION PROMPT</label>
                                    <textarea
                                        value={question.question}
                                        onChange={(event) =>
                                            onUpdateQuestion(question.id, "question", event.target.value)
                                        }
                                        placeholder="Write your question here..."
                                    />

                                    {/* Choice-based Options (MCQ, True/False, Poll, Timed Quiz, Application) */}
                                    {hasOptions && (
                                        <>
                                            <div className="activity-options-heading">
                                                <span>ANSWER OPTIONS</span>
                                                <small>Click letter to mark correct option</small>
                                            </div>

                                            <div className="activity-options">
                                                {question.options.map((option, optionIndex) => (
                                                    <div
                                                        className={`activity-option ${option.correct ? "correct" : ""}`}
                                                        key={option.id}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="activity-correct-button"
                                                            onClick={() => onSetCorrectAnswer(question.id, option.id)}
                                                            title="Mark as correct answer"
                                                        >
                                                            {option.correct ? (
                                                                <CheckCircle2 size={16} />
                                                            ) : (
                                                                String.fromCharCode(65 + optionIndex)
                                                            )}
                                                        </button>

                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(event) =>
                                                                onUpdateOption(question.id, option.id, event.target.value)
                                                            }
                                                            placeholder={`Option ${optionIndex + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Open-Ended / Fill Blank / Short Answer / Problem Solving / Essay Expected Answer */}
                                    {!hasOptions && !hasMatching && !hasSorting && !hasOrder && !hasRegions && (
                                        <div style={{ marginTop: "16px" }}>
                                            <label style={{ display: "block", marginBottom: "6px", color: "#75677a", fontSize: "10px", fontWeight: 700 }}>
                                                EXPECTED / CORRECT ANSWER
                                            </label>
                                            <input
                                                type="text"
                                                style={{ width: "100%", height: "40px", padding: "0 12px", border: "1px solid #e5d9e8", borderRadius: "6px", fontFamily: "inherit", fontSize: "12px", boxSizing: "border-box" }}
                                                value={question.correctAnswer || question.expectedAnswer || ""}
                                                onChange={(e) => {
                                                    onUpdateQuestion(question.id, "correctAnswer", e.target.value);
                                                    onUpdateQuestion(question.id, "expectedAnswer", e.target.value);
                                                }}
                                                placeholder="Enter expected answer..."
                                            />
                                        </div>
                                    )}

                                    {/* Matching Pairs Summary */}
                                    {hasMatching && (
                                        <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", background: "#faf5fc", border: "1px solid #ead7ef" }}>
                                            <strong style={{ fontSize: "11px", color: "#72008c" }}>MATCHING PAIRS</strong>
                                            <ul style={{ margin: "8px 0 0", paddingLeft: "18px", fontSize: "12px" }}>
                                                {question.leftItems.map((l) => {
                                                    const rId = question.matchingAnswers?.[l.id];
                                                    const rObj = (question.rightItems || []).find((r) => String(r.id) === String(rId));
                                                    return (
                                                        <li key={l.id} style={{ marginBottom: "4px" }}>
                                                            <strong>{l.text}</strong> → {rObj?.text || rId}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Category Sorting Summary */}
                                    {hasSorting && (
                                        <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", background: "#faf5fc", border: "1px solid #ead7ef" }}>
                                            <strong style={{ fontSize: "11px", color: "#72008c" }}>
                                                CATEGORIES: {(question.categories || []).join(" | ")}
                                            </strong>
                                            <ul style={{ margin: "8px 0 0", paddingLeft: "18px", fontSize: "12px" }}>
                                                {question.items.map((it, idx) => (
                                                    <li key={idx}>
                                                        {it.name} → <em>{it.category}</em>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Drag & Drop Sequence Summary */}
                                    {hasOrder && (
                                        <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", background: "#faf5fc", border: "1px solid #ead7ef" }}>
                                            <strong style={{ fontSize: "11px", color: "#72008c" }}>CORRECT SEQUENCE</strong>
                                            <ol style={{ margin: "8px 0 0", paddingLeft: "18px", fontSize: "12px" }}>
                                                {question.itemsToOrder.map((step, idx) => (
                                                    <li key={idx}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {/* Hotspot Diagram Summary */}
                                    {hasRegions && (
                                        <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", background: "#faf5fc", border: "1px solid #ead7ef" }}>
                                            <strong style={{ fontSize: "11px", color: "#72008c" }}>
                                                HOTSPOT REGIONS ({question.imageDescription || "Diagram"})
                                            </strong>
                                            <ul style={{ margin: "8px 0 0", paddingLeft: "18px", fontSize: "12px" }}>
                                                {question.regions.map((r, idx) => (
                                                    <li key={idx}>
                                                        {r.label} ({r.x}%, {r.y}%){" "}
                                                        {r.isCorrect ? <strong style={{ color: "#15803d" }}>✓ Target</strong> : ""}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ActivityPreview;
