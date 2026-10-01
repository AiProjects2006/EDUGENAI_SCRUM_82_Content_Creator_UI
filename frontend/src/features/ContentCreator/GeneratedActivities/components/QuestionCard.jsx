import {
    Pencil,
    Trash2,
    Check
} from "lucide-react";

function QuestionCard({
                          question,
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

                <div className="generated-options">

                    {question.options.map(
                        (option) => {
                            const selected =
                                selectedAnswer ===
                                option.id;

                            return (
                                <button
                                    type="button"
                                    key={option.id}
                                    className={`generated-option ${
                                        selected
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        onAnswerSelect(
                                            question.id,
                                            option.id
                                        )
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
                        }
                    )}

                </div>

            </div>

        </section>
    );
}

export default QuestionCard;