import {
    Plus,
    Trash2,
    CheckCircle2,
    Save,
    GripVertical
} from "lucide-react";

function ActivityPreview({
                             course,
                             lesson,
                             settings,
                             questions,
                             onAddQuestion,
                             onUpdateQuestion,
                             onUpdateOption,
                             onSetCorrectAnswer,
                             onDeleteQuestion,
                             onSaveActivity
                         }) {
    return (
        <div className="activity-editor">

            <div className="activity-editor-header">

                <div>
                    <span className="activity-editor-label">
                        ACTIVITY
                    </span>

                    <h2>
                        {settings.activityType === "mcq"
                            ? "Multiple Choice Questions"
                            : settings.activityType}
                    </h2>

                    <p>
                        {course} · {lesson}
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
                        disabled={!questions.length}
                    >
                        <Save size={14} />
                        Save Activity
                    </button>

                </div>

            </div>

            <div className="activity-editor-meta">

                <div>
                    <span>TYPE</span>
                    <strong>
                        {settings.activityType.toUpperCase()}
                    </strong>
                </div>

                <div>
                    <span>DIFFICULTY</span>
                    <strong>
                        {settings.difficulty}
                    </strong>
                </div>

                <div>
                    <span>QUESTIONS</span>
                    <strong>
                        {questions.length}
                    </strong>
                </div>

            </div>

            {questions.length === 0 ? (
                <div className="activity-empty-editor">

                    <div className="activity-empty-icon">
                        <Plus size={25} />
                    </div>

                    <h3>
                        Start building your activity
                    </h3>

                    <p>
                        Add your first question manually.
                        You can edit the question, answers,
                        and correct answer at any time.
                    </p>

                    <button
                        type="button"
                        onClick={onAddQuestion}
                    >
                        <Plus size={14} />
                        Add First Question
                    </button>

                </div>
            ) : (
                <div className="activity-question-list">

                    {questions.map(
                        (question, questionIndex) => (
                            <article
                                className="activity-question-card"
                                key={question.id}
                            >

                                <div className="activity-question-header">

                                    <div className="activity-question-number">
                                        <GripVertical size={13} />
                                        Question{" "}
                                        {questionIndex + 1}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDeleteQuestion(
                                                question.id
                                            )
                                        }
                                        aria-label="Delete question"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                </div>

                                <div className="activity-question-body">

                                    <label>
                                        QUESTION
                                    </label>

                                    <textarea
                                        value={
                                            question.question
                                        }
                                        onChange={(event) =>
                                            onUpdateQuestion(
                                                question.id,
                                                "question",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Write your question here..."
                                    />

                                    {["mcq", "true-false", "quiz", "poll", "timed-quiz", "challenge-quiz"].includes(settings.activityType) ? (
                                        <>
                                            <div className="activity-options-heading">
                                                <span>ANSWER OPTIONS</span>
                                                <small>Select the correct answer</small>
                                            </div>

                                            <div className="activity-options">
                                                {(question.options || []).map((option, optionIndex) => (
                                                    <div
                                                        className={`activity-option ${
                                                            option.correct ? "correct" : ""
                                                        }`}
                                                        key={option.id}
                                                    >
                                                        {settings.activityType === "poll" ? (
                                                            <span className="activity-correct-button">
                                                                {String.fromCharCode(65 + optionIndex)}
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="activity-correct-button"
                                                                onClick={() =>
                                                                    onSetCorrectAnswer(question.id, option.id)
                                                                }
                                                                title="Mark as correct answer"
                                                            >
                                                                {option.correct ? (
                                                                    <CheckCircle2 size={16} />
                                                                ) : (
                                                                    String.fromCharCode(65 + optionIndex)
                                                                )}
                                                            </button>
                                                        )}

                                                        <input
                                                            type="text"
                                                            value={option.text}
                                                            onChange={(event) =>
                                                                onUpdateOption(
                                                                    question.id,
                                                                    option.id,
                                                                    event.target.value
                                                                )
                                                            }
                                                            placeholder={`Answer option ${optionIndex + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : settings.activityType === "fill-blanks" ? (
                                        <div className="activity-options">
                                            <label>CORRECT ANSWER</label>

                                            <input
                                                type="text"
                                                value={question.fillBlanks?.[0]?.correctAnswer || ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(
                                                        question.id,
                                                        "fillBlanks",
                                                        [{ correctAnswer: event.target.value }]
                                                    )
                                                }
                                                placeholder="Enter the correct answer"
                                            />
                                        </div>
                                    ) : ["essay", "short-answer", "problem-solving", "application-based"].includes(settings.activityType) ? (
                                        <div className="activity-options">

                                            <label>MINIMUM WORD COUNT</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={question.essay?.minWordCount ?? ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(question.id, "essay", {
                                                        ...question.essay,
                                                        minWordCount: event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value)
                                                    })
                                                }
                                                placeholder="Minimum words"
                                            />

                                            <label>MAXIMUM WORD COUNT</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={question.essay?.maxWordCount ?? ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(question.id, "essay", {
                                                        ...question.essay,
                                                        maxWordCount: event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value)
                                                    })
                                                }
                                                placeholder="Maximum words"
                                            />

                                            <label>GRADING RUBRIC</label>
                                            <textarea
                                                maxLength={1000}
                                                value={question.essay?.gradingRubric ?? ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(question.id, "essay", {
                                                        ...question.essay,
                                                        gradingRubric: event.target.value
                                                    })
                                                }
                                                placeholder="Enter grading criteria..."
                                            />

                                        </div>
                                    ) : settings.activityType === "essay" ? (
                                        <div className="activity-options">

                                            <label>MINIMUM WORD COUNT</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={question.essay?.minWordCount ?? ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(question.id, "essay", {
                                                        ...question.essay,
                                                        minWordCount: event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value)
                                                    })
                                                }
                                                placeholder="Minimum words"
                                            />

                                            <label>MAXIMUM WORD COUNT</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={question.essay?.maxWordCount ?? ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(question.id, "essay", {
                                                        ...question.essay,
                                                        maxWordCount: event.target.value === ""
                                                            ? null
                                                            : Number(event.target.value)
                                                    })
                                                }
                                                placeholder="Maximum words"
                                            />

                                            <label>GRADING RUBRIC</label>
                                            <textarea
                                                maxLength={1000}
                                                value={question.essay?.gradingRubric ?? ""}
                                                onChange={(event) =>
                                                    onUpdateQuestion(question.id, "essay", {
                                                        ...question.essay,
                                                        gradingRubric: event.target.value
                                                    })
                                                }
                                                placeholder="Enter grading criteria..."
                                            />

                                        </div>
                                    ) : settings.activityType === "matching" ? (
                                        <div className="activity-options">
                                            <label>MATCHING PAIRS</label>

                                            {(question.matchingPairs || []).map((pair, pairIndex) => (
                                                <div
                                                    key={pair.id}
                                                    style={{
                                                        display: "flex",
                                                        gap: "12px",
                                                        marginBottom: "12px"
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={pair.leftItem}
                                                        placeholder={`Left Item ${pairIndex + 1}`}
                                                        onChange={(event) => {
                                                            const updatedPairs = question.matchingPairs.map((item) =>
                                                                item.id === pair.id
                                                                    ? { ...item, leftItem: event.target.value }
                                                                    : item
                                                            );

                                                            onUpdateQuestion(
                                                                question.id,
                                                                "matchingPairs",
                                                                updatedPairs
                                                            );
                                                        }}
                                                    />

                                                    <input
                                                        type="text"
                                                        value={pair.rightItem}
                                                        placeholder={`Right Item ${pairIndex + 1}`}
                                                        onChange={(event) => {
                                                            const updatedPairs = question.matchingPairs.map((item) =>
                                                                item.id === pair.id
                                                                    ? { ...item, rightItem: event.target.value }
                                                                    : item
                                                            );

                                                            onUpdateQuestion(
                                                                question.id,
                                                                "matchingPairs",
                                                                updatedPairs
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : settings.activityType === "sorting" ? (
                                        <div className="activity-options">
                                            <label>SORTING ITEMS</label>

                                            {(question.sortingItems || []).map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        display: "flex",
                                                        gap: "12px",
                                                        marginBottom: "12px",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={item.itemText}
                                                        placeholder={`Item ${index + 1}`}
                                                        onChange={(event) => {
                                                            const updatedItems = question.sortingItems.map(
                                                                (currentItem) =>
                                                                    currentItem.id === item.id
                                                                        ? {
                                                                            ...currentItem,
                                                                            itemText: event.target.value
                                                                        }
                                                                        : currentItem
                                                            );

                                                            onUpdateQuestion(
                                                                question.id,
                                                                "sortingItems",
                                                                updatedItems
                                                            );
                                                        }}
                                                    />

                                                    <span>Correct Order: {item.correctOrder}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : settings.activityType === "drag-drop" ? (
                                        <div className="activity-options">
                                            <label>DRAG ITEMS & DROP ZONES</label>

                                            {(question.dragItems || []).map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    style={{
                                                        display: "flex",
                                                        gap: "12px",
                                                        marginBottom: "12px",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        value={item.itemText}
                                                        placeholder={`Drag Item ${index + 1}`}
                                                        onChange={(event) => {
                                                            const updatedItems = question.dragItems.map(
                                                                (currentItem, itemIndex) =>
                                                                    itemIndex === index
                                                                        ? { ...currentItem, itemText: event.target.value }
                                                                        : currentItem
                                                            );

                                                            onUpdateQuestion(question.id, "dragItems", updatedItems);
                                                        }}
                                                    />

                                                    <span>→</span>

                                                    <input
                                                        type="text"
                                                        value={question.dropZones?.[index]?.zoneLabel ?? ""}
                                                        placeholder={`Drop Zone ${index + 1}`}
                                                        onChange={(event) => {
                                                            const updatedZones = question.dropZones.map(
                                                                (zone, zoneIndex) =>
                                                                    zoneIndex === index
                                                                        ? { ...zone, zoneLabel: event.target.value }
                                                                        : zone
                                                            );

                                                            onUpdateQuestion(question.id, "dropZones", updatedZones);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : settings.activityType === "hotspot" ? (
                                        <div className="activity-options">
                                            <label>IMAGE URL</label>

                                            <input
                                                type="text"
                                                value={question.imageUrl || ""}
                                                placeholder="Enter image URL"
                                                onChange={(event) =>
                                                    onUpdateQuestion(
                                                        question.id,
                                                        "imageUrl",
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <label>HOTSPOT REGION</label>

                                            {(question.hotspotRegions || []).map((region, index) => (
                                                <div key={region.id}>
                                                    {[
                                                        ["xCoordinate", "X Coordinate"],
                                                        ["yCoordinate", "Y Coordinate"],
                                                        ["width", "Width"],
                                                        ["height", "Height"]
                                                    ].map(([field, label]) => (
                                                        <div
                                                            key={field}
                                                            style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "140px minmax(0, 1fr)",
                                                                alignItems: "center",
                                                                gap: "16px",
                                                                marginBottom: "14px",
                                                                maxWidth: "520px"
                                                            }}
                                                        >
                                                            <label>{label}</label>

                                                            <input
                                                                type="number"
                                                                min={
                                                                    field === "width" || field === "height"
                                                                        ? 1
                                                                        : 0
                                                                }
                                                                step="1"
                                                                value={region[field] ?? ""}
                                                                style={{
                                                                    width: "100%",
                                                                    padding: "10px 12px",
                                                                    border: "1px solid #e5cfee",
                                                                    borderRadius: "6px",
                                                                    boxSizing: "border-box"
                                                                }}
                                                                onChange={(event) => {
                                                                    const updatedRegions =
                                                                        question.hotspotRegions.map(
                                                                            (item, itemIndex) =>
                                                                                itemIndex === index
                                                                                    ? {
                                                                                        ...item,
                                                                                        [field]:
                                                                                            event.target.value === ""
                                                                                                ? null
                                                                                                : Number(event.target.value)
                                                                                    }
                                                                                    : item
                                                                        );

                                                                    onUpdateQuestion(
                                                                        question.id,
                                                                        "hotspotRegions",
                                                                        updatedRegions
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                </div>

                            </article>
                        )
                    )}

                </div>
            )}

        </div>
    );
}

export default ActivityPreview;