import {
    Pencil,
    Trash2,
    Check
} from "lucide-react";

function QuestionCard({
                          question,
                          activityType,
                          selectedAnswer,
                          onAnswerSelect,
                          onEdit,
                          onDelete
                      }) {
    return (
        <section className="generated-question-card">

            <div className="generated-question-header">

                <span>
                    {question.number}
                </span>

                <div className="generated-question-actions">

                    <button
                        type="button"
                        onClick={() =>
                            onEdit(question.id)
                        }
                        aria-label="Edit question"
                    >
                        <Pencil size={9} />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onDelete(question.id)
                        }
                        aria-label="Delete question"
                    >
                        <Trash2 size={9} />
                    </button>

                </div>

            </div>

            <div className="generated-question-body">

                <p className="generated-question-text">
                    {question.question}
                </p>

                {activityType === "FILL_BLANK" ? (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginTop: "14px"
                        }}
                    >
                        <strong style={{ fontSize: "13px" }}>
                            Correct Answer:
                        </strong>

                        {(question.fillBlanks || []).map((blank, index) => (
                            <span
                                key={blank.blankIndex ?? index}
                                style={{
                                    backgroundColor: "#f0fdf4",
                                    color: "#166534",
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontWeight: 600
                                }}
                            >
                                {blank.correctAnswer}
                            </span>
                        ))}
                    </div>
                ) : ["ESSAY", "SHORT_ANSWER", "PROBLEM_SOLVING", "APPLICATION_BASED"].includes(activityType) ? (
                    <div
                        style={{
                            marginTop: "16px",
                            padding: "16px",
                            backgroundColor: "#faf5fc",
                            border: "1px solid #ead6f2",
                            borderRadius: "8px",
                            display: "grid",
                            gap: "12px"
                        }}
                    >
                        {[
                            [
                                "Minimum Word Count",
                                question.essay?.minWordCount ?? "Not specified"
                            ],
                            [
                                "Maximum Word Count",
                                question.essay?.maxWordCount ?? "Not specified"
                            ],
                            [
                                "Grading Rubric",
                                question.essay?.gradingRubric || "Not specified"
                            ]
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "170px minmax(0, 1fr)",
                                    gap: "14px",
                                    alignItems: "start",
                                    fontSize: "13px"
                                }}
                            >
                                <strong style={{ color: "#37144d" }}>
                                    {label}
                                </strong>

                                <span
                                    style={{
                                        color: "#5c496b",
                                        overflowWrap: "anywhere"
                                    }}
                                >
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : activityType === "MATCHING" ? (
                    <div style={{ marginTop: "14px" }}>
                        <strong>MATCHING PAIRS</strong>

                        {(question.matchingPairs || []).map((pair, index) => (
                            <div
                                key={pair.id}
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    marginTop: "10px",
                                    alignItems: "center"
                                }}
                            >
                                <span>{index + 1}.</span>

                                <span style={{ flex: 1 }}>
                    {pair.leftItem}
                </span>

                                <span>→</span>

                                <span style={{ flex: 1 }}>
                    {pair.rightItem}
                </span>
                            </div>
                        ))}
                    </div>
                ) : activityType === "SORTING" ? (
                    <div style={{ marginTop: "14px" }}>
                        <strong>CORRECT SORTING ORDER</strong>

                        {(question.sortingItems || []).map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    marginTop: "10px"
                                }}
                            >
                <span style={{ fontWeight: 600 }}>
                    {item.correctOrder}.
                </span>

                                <span>{item.itemText}</span>
                            </div>
                        ))}
                    </div>
                ) : activityType === "DRAG_DROP" ? (
                    <div style={{ marginTop: "14px" }}>
                        <strong>DRAG ITEMS & DROP ZONES</strong>

                        {(question.dragMappings || []).map((mapping, index) => {
                            const dragItem =
                                question.dragItems?.[mapping.dragItemIndex - 1];

                            const dropZone =
                                question.dropZones?.[mapping.dropZoneIndex - 1];

                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        marginTop: "12px"
                                    }}
                                >
                    <span style={{ flex: 1 }}>
                        {dragItem?.itemText || "Unknown Item"}
                    </span>

                                    <span>→</span>

                                    <span style={{ flex: 1 }}>
                        {dropZone?.zoneLabel || "Unknown Zone"}
                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : activityType === "HOTSPOT" ? (
                    <div style={{ marginTop: "14px" }}>
                        <strong>HOTSPOT DETAILS</strong>

                        {question.imageUrl && (
                            <p style={{ marginTop: "10px" }}>
                                <strong>Image URL: </strong>
                                {question.imageUrl}
                            </p>
                        )}

                        {(question.hotspotRegions || []).map((region, index) => (
                            <div
                                key={region.id ?? index}
                                style={{
                                    marginTop: "12px",
                                    padding: "12px",
                                    border: "1px solid #e5cfee",
                                    borderRadius: "6px"
                                }}
                            >
                                <strong>Region {index + 1}</strong>

                                <p>X Coordinate: {region.xCoordinate}</p>
                                <p>Y Coordinate: {region.yCoordinate}</p>
                                <p>Width: {region.width}</p>
                                <p>Height: {region.height}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="generated-options">
                        {(question.options || []).map((option) => {
                            const selected = selectedAnswer === option.id;

                            return (
                                <button
                                    type="button"
                                    key={option.id}
                                    className={`generated-option ${
                                        selected ? "selected" : ""
                                    }`}
                                    disabled={activityType === "POLL"}
                                    onClick={() =>
                                        onAnswerSelect(question.id, option.id)
                                    }
                                >
                    <span className="generated-option-letter">
                        {option.id}
                    </span>

                                    <span className="generated-option-text">
                        {option.text}
                    </span>

                                    {selected && (
                                        <span className="generated-option-check">
                            <Check size={8} />
                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

            </div>

        </section>
    );
}

export default QuestionCard;