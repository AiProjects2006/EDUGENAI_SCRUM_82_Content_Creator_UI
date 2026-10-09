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

                                    <div className="activity-options-heading">
                                        <span>
                                            ANSWER OPTIONS
                                        </span>

                                        <small>
                                            Select the correct answer
                                        </small>
                                    </div>

                                    <div className="activity-options">

                                        {question.options.map(
                                            (
                                                option,
                                                optionIndex
                                            ) => (
                                                <div
                                                    className={`activity-option ${
                                                        option.correct
                                                            ? "correct"
                                                            : ""
                                                    }`}
                                                    key={
                                                        option.id
                                                    }
                                                >

                                                    <button
                                                        type="button"
                                                        className="activity-correct-button"
                                                        onClick={() =>
                                                            onSetCorrectAnswer(
                                                                question.id,
                                                                option.id
                                                            )
                                                        }
                                                        title="Mark as correct answer"
                                                    >
                                                        {option.correct ? (
                                                            <CheckCircle2
                                                                size={16}
                                                            />
                                                        ) : (
                                                            String.fromCharCode(
                                                                65 +
                                                                optionIndex
                                                            )
                                                        )}
                                                    </button>

                                                    <input
                                                        type="text"
                                                        value={
                                                            option.text
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            onUpdateOption(
                                                                question.id,
                                                                option.id,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder={`Answer option ${
                                                            optionIndex +
                                                            1
                                                        }`}
                                                    />

                                                </div>
                                            )
                                        )}

                                    </div>

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