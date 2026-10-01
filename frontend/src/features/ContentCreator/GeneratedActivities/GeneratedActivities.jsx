import { useState } from "react";
import { X, Save, Send, CheckCircle2 } from "lucide-react";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";

import ActivityHeader from "./components/ActivityHeader.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import GenerationDetails from "./components/GenerationDetails.jsx";
import AIAssistant from "./components/AIAssistant.jsx";

import {
    activityData,
    questions as initialQuestions
} from "./data/GeneratedActivitiesData.js";

import "./GeneratedActivities.css";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

function GeneratedActivities() {
    const [questions, setQuestions] =
        useState(initialQuestions);

    const [selectedAnswers, setSelectedAnswers] =
        useState({});

    const [showRemaining, setShowRemaining] =
        useState(false);

    const [isRegenerating, setIsRegenerating] =
        useState(false);

    const [message, setMessage] = useState("");

    const [editingQuestion, setEditingQuestion] =
        useState(null);

    const [publishOpen, setPublishOpen] =
        useState(false);

    const [selectedLesson, setSelectedLesson] =
        useState("Photosynthesis: Light Reactions");

    const [published, setPublished] =
        useState(false);

    const visibleQuestions = showRemaining
        ? questions
        : questions.slice(0, 3);

    const showMessage = (text) => {
        setMessage(text);

        window.setTimeout(() => {
            setMessage("");
        }, 2500);
    };

    const handleAnswerSelect = (
        questionId,
        optionId
    ) => {
        setSelectedAnswers((previous) => ({
            ...previous,
            [questionId]: optionId
        }));
    };

    const handleDelete = (questionId) => {
        setQuestions((previous) =>
            previous.filter(
                (question) =>
                    question.id !== questionId
            )
        );

        showMessage("Question deleted.");
    };

    const handleEdit = (questionId) => {
        const question = questions.find(
            (item) => item.id === questionId
        );

        if (!question) {
            return;
        }

        setEditingQuestion({
            ...question,
            options: question.options.map(
                (option) => ({
                    ...option
                })
            )
        });
    };

    const handleEditQuestionChange = (
        field,
        value
    ) => {
        setEditingQuestion((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const handleEditOptionChange = (
        optionId,
        value
    ) => {
        setEditingQuestion((previous) => ({
            ...previous,
            options: previous.options.map(
                (option) =>
                    option.id === optionId
                        ? {
                            ...option,
                            text: value
                        }
                        : option
            )
        }));
    };

    const handleEditCorrectAnswer = (
        optionId
    ) => {
        setEditingQuestion((previous) => ({
            ...previous,
            options: previous.options.map(
                (option) => ({
                    ...option,
                    correct:
                        option.id === optionId
                })
            )
        }));
    };

    const handleSaveQuestion = () => {
        if (!editingQuestion) {
            return;
        }

        setQuestions((previous) =>
            previous.map((question) =>
                question.id ===
                editingQuestion.id
                    ? editingQuestion
                    : question
            )
        );

        setEditingQuestion(null);

        showMessage(
            "Question changes saved successfully."
        );
    };

    const handleRegenerate = () => {
        setIsRegenerating(true);

        window.setTimeout(() => {
            setIsRegenerating(false);

            showMessage(
                "Activity regenerated successfully."
            );
        }, 1000);
    };

    const handleSaveTemplate = () => {
        showMessage(
            "Activity saved as a template."
        );
    };

    const handlePublish = () => {
        setPublishOpen(true);
        setPublished(false);
    };

    const handleConfirmPublish = () => {
        setPublished(true);

        window.setTimeout(() => {
            setPublishOpen(false);
            setPublished(false);

            showMessage(
                `Activity published to ${selectedLesson}.`
            );
        }, 1200);
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="generated-activities-page">

                <ActivityHeader
                    activity={activityData}
                    onRegenerate={handleRegenerate}
                    onSaveTemplate={handleSaveTemplate}
                    onPublish={handlePublish}
                    isRegenerating={isRegenerating}
                />

                {message && (
                    <div className="generated-activity-toast">
                        {message}
                    </div>
                )}

                <div className="generated-activities-layout">

                    <main className="generated-question-column">

                        {visibleQuestions.map(
                            (question) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    selectedAnswer={
                                        selectedAnswers[
                                            question.id
                                            ]
                                    }
                                    onAnswerSelect={
                                        handleAnswerSelect
                                    }
                                    onEdit={
                                        handleEdit
                                    }
                                    onDelete={
                                        handleDelete
                                    }
                                />
                            )
                        )}

                        {questions.length > 3 && (
                            <button
                                type="button"
                                className="remaining-questions-button"
                                onClick={() =>
                                    setShowRemaining(
                                        (value) =>
                                            !value
                                    )
                                }
                            >
                                <span>
                                    {showRemaining
                                        ? "Hide Remaining Questions"
                                        : `View Remaining ${questions.length - 3} Questions`}
                                </span>

                                <span>
                                    {showRemaining
                                        ? "⌃"
                                        : "⌄"}
                                </span>
                            </button>
                        )}

                    </main>

                    <aside className="generated-details-column">

                        <GenerationDetails />

                        <AIAssistant />

                    </aside>

                </div>

            </div>

            {editingQuestion && (
                <EditQuestionModal
                    question={editingQuestion}
                    onClose={() =>
                        setEditingQuestion(null)
                    }
                    onChange={
                        handleEditQuestionChange
                    }
                    onOptionChange={
                        handleEditOptionChange
                    }
                    onCorrectChange={
                        handleEditCorrectAnswer
                    }
                    onSave={
                        handleSaveQuestion
                    }
                />
            )}

            {publishOpen && (
                <PublishModal
                    lesson={selectedLesson}
                    setLesson={setSelectedLesson}
                    published={published}
                    onClose={() =>
                        setPublishOpen(false)
                    }
                    onPublish={
                        handleConfirmPublish
                    }
                />
            )}

        </BackofficeLayout>
    );
}

function EditQuestionModal({
                               question,
                               onClose,
                               onChange,
                               onOptionChange,
                               onCorrectChange,
                               onSave
                           }) {
    return (
        <div
            className="generated-modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="generated-modal edit-question-modal">

                <div className="generated-modal-header">

                    <div>
                        <span>
                            EDIT QUESTION
                        </span>

                        <h2>
                            {question.number}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={15} />
                    </button>

                </div>

                <div className="generated-modal-body">

                    <label>
                        QUESTION
                    </label>

                    <textarea
                        value={question.question}
                        onChange={(event) =>
                            onChange(
                                "question",
                                event.target.value
                            )
                        }
                    />

                    <label>
                        ANSWER OPTIONS
                    </label>

                    <div className="edit-options">

                        {question.options.map(
                            (option) => (
                                <div
                                    className={`edit-option ${
                                        option.correct
                                            ? "correct"
                                            : ""
                                    }`}
                                    key={option.id}
                                >
                                    <button
                                        type="button"
                                        className="correct-answer-button"
                                        onClick={() =>
                                            onCorrectChange(
                                                option.id
                                            )
                                        }
                                        title="Set correct answer"
                                    >
                                        {option.id}
                                    </button>

                                    <input
                                        type="text"
                                        value={
                                            option.text
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            onOptionChange(
                                                option.id,
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />

                                    {option.correct && (
                                        <CheckCircle2
                                            size={13}
                                        />
                                    )}
                                </div>
                            )
                        )}

                    </div>

                    <p className="edit-question-hint">
                        Click an option letter to mark
                        the correct answer.
                    </p>

                </div>

                <div className="generated-modal-footer">

                    <button
                        type="button"
                        className="generated-modal-cancel"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="generated-modal-save"
                        onClick={onSave}
                    >
                        <Save size={11} />
                        Save Changes
                    </button>

                </div>

            </div>
        </div>
    );
}

function PublishModal({
                          lesson,
                          setLesson,
                          published,
                          onClose,
                          onPublish
                      }) {
    return (
        <div className="generated-modal-overlay">

            <div className="generated-modal publish-modal">

                {published ? (
                    <div className="publish-success">

                        <div className="publish-success-icon">
                            <CheckCircle2 size={24} />
                        </div>

                        <h2>
                            Published Successfully
                        </h2>

                        <p>
                            The activity has been
                            added to the selected lesson.
                        </p>

                    </div>
                ) : (
                    <>
                        <div className="generated-modal-header">

                            <div>
                                <span>
                                    PUBLISH ACTIVITY
                                </span>

                                <h2>
                                    Publish to Lesson
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                            >
                                <X size={15} />
                            </button>

                        </div>

                        <div className="generated-modal-body">

                            <div className="publish-info">
                                <div className="publish-info-icon">
                                    <Send size={13} />
                                </div>

                                <div>
                                    <strong>
                                        {activityData.title}
                                    </strong>

                                    <span>
                                        5 questions ·
                                        Multiple Choice
                                    </span>
                                </div>
                            </div>

                            <label>
                                SELECT LESSON
                            </label>

                            <select
                                value={lesson}
                                onChange={(event) =>
                                    setLesson(
                                        event.target.value
                                    )
                                }
                            >
                                <option>
                                    Photosynthesis:
                                    Light Reactions
                                </option>

                                <option>
                                    Photosynthesis:
                                    Calvin Cycle
                                </option>

                                <option>
                                    Plant Biology:
                                    Energy Transfer
                                </option>

                                <option>
                                    Biology:
                                    Cellular Processes
                                </option>
                            </select>

                            <div className="publish-warning">
                                This activity will become
                                visible to students after
                                publishing.
                            </div>

                        </div>

                        <div className="generated-modal-footer">

                            <button
                                type="button"
                                className="generated-modal-cancel"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="generated-modal-save"
                                onClick={onPublish}
                            >
                                <Send size={11} />
                                Publish Activity
                            </button>

                        </div>
                    </>
                )}

            </div>

        </div>
    );
}

export default GeneratedActivities;