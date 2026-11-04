import { useEffect, useState } from "react";
import { X, Save, Send, CheckCircle2 } from "lucide-react";

import BackofficeLayout from "../../../components/layout/BackofficeLayout";

import ActivityHeader from "./components/ActivityHeader.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import GenerationDetails from "./components/GenerationDetails.jsx";
import AIAssistant from "./components/AIAssistant.jsx";

import "./GeneratedActivities.css";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

import {
    getActivities,
    getActivityById,
    updateActivity,
    deleteActivity
} from "../../../services/activityApi";

function GeneratedActivities() {
    const [isSavingQuestion, setIsSavingQuestion] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const mapApiQuestionsToUI = (apiQuestions = []) => {
        return [...apiQuestions]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((question, index) => ({
                id: question.questionId,
                number: `Question ${index + 1}`,
                question: question.questionText,
                points: question.points,
                displayOrder: question.displayOrder,
                imageUrl: question.imageUrl || "",

                hotspotRegions: (question.hotspotRegions || []).map((region, index) => ({
                    id: region.regionId ?? index + 1,
                    xCoordinate: region.xCoordinate,
                    yCoordinate: region.yCoordinate,
                    width: region.width,
                    height: region.height
                })),

                options: [...(question.options || [])]
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((option, optionIndex) => ({
                        id: optionIndex + 1,
                        apiOptionId: option.optionId,
                        text: option.optionText,
                        correct: option.correct
                    })),

                fillBlanks: [...(question.fillBlanks || [])]
                    .sort((a, b) => a.blankIndex - b.blankIndex)
                    .map((blank) => ({
                        blankIndex: blank.blankIndex,
                        correctAnswer: blank.correctAnswer
                    })),

                matchingPairs: [...(question.matchingPairs || [])]
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((pair, index) => ({
                        id: pair.pairId ?? index + 1,
                        leftItem: pair.leftItem,
                        rightItem: pair.rightItem,
                        displayOrder: pair.displayOrder
                    })),

                sortingItems: [...(question.sortingItems || [])]
                    .sort((a, b) => a.correctOrder - b.correctOrder)
                    .map((item, index) => ({
                        id: item.itemId ?? index + 1,
                        itemText: item.itemText,
                        correctOrder: item.correctOrder
                    })),

                dragItems: (question.dragItems || []).map((item, index) => ({
                    id: item.itemId ?? index + 1,
                    itemText: item.itemText,
                    imageUrl: item.imageUrl
                })),

                dropZones: (question.dropZones || []).map((zone, index) => ({
                    id: zone.zoneId ?? index + 1,
                    zoneLabel: zone.zoneLabel
                })),

                dragMappings: (question.dragMappings || []).map((mapping) => ({
                    dragItemIndex:
                        (question.dragItems || []).findIndex(
                            (item) => item.itemId === mapping.dragItemId
                        ) + 1,

                    dropZoneIndex:
                        (question.dropZones || []).findIndex(
                            (zone) => zone.zoneId === mapping.dropZoneId
                        ) + 1
                })),

                essay: question.essay
                    ? {
                        minWordCount: question.essay.minWordCount,
                        maxWordCount: question.essay.maxWordCount,
                        gradingRubric: question.essay.gradingRubric
                    }
                    : null
            }));
    };

    const [questions, setQuestions] = useState([]);

    const [selectedAnswers, setSelectedAnswers] =
        useState({});

    const [showRemaining, setShowRemaining] =
        useState(false);

    const [isRegenerating, setIsRegenerating] =
        useState(false);

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] = useState("success");

    const [editingQuestion, setEditingQuestion] =
        useState(null);

    const [publishOpen, setPublishOpen] =
        useState(false);

    const [selectedLesson, setSelectedLesson] =
        useState("Photosynthesis: Light Reactions");

    const [published, setPublished] =
        useState(false);

    const [currentActivity, setCurrentActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [activities, setActivities] = useState([]);
    const [selectedActivityId, setSelectedActivityId] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [difficultyFilter, setDifficultyFilter] = useState("ALL");

    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(true);
                setLoadError("");

                const listResponse = await getActivities();

                const activityList = Array.isArray(listResponse.data)
                    ? [...listResponse.data].sort(
                        (a, b) => b.activityId - a.activityId
                    )
                    : [];

                setActivities(activityList);

                if (activityList.length === 0) {
                    setSelectedActivityId("");
                    setCurrentActivity(null);
                    setQuestions([]);
                    setLoadError("No activities found.");
                    return;
                }

                const firstActivityId = activityList[0].activityId;

                const detailResponse = await getActivityById(firstActivityId);
                const activity = detailResponse.data;

                setSelectedActivityId(String(firstActivityId));
                setCurrentActivity(activity);
                setQuestions(mapApiQuestionsToUI(activity.questions));

            } catch (error) {
                console.error("Failed to load activities:", error);

                setActivities([]);
                setSelectedActivityId("");
                setCurrentActivity(null);
                setQuestions([]);

                if (!error.response) {
                    setLoadError(
                        "Unable to connect to the server. Please try again later."
                    );
                } else {
                    setLoadError(
                        "Failed to load activities. Please try again later."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, []);

    const handleActivityChange = async (event) => {
        const activityId = event.target.value;

        setSelectedActivityId(activityId);

        if (!activityId) return;

        try {
            setLoading(true);
            setLoadError("");

            const response = await getActivityById(activityId);
            const activity = response.data;

            setCurrentActivity(activity);
            setQuestions(mapApiQuestionsToUI(activity.questions));
            setSelectedAnswers({});
            setShowRemaining(false);
        } catch (error) {
            console.error("Failed to load selected activity:", error);
            setLoadError("Failed to load selected activity.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterName, value) => {
        const nextStatus =
            filterName === "status" ? value : statusFilter;

        const nextType =
            filterName === "type" ? value : typeFilter;

        const nextDifficulty =
            filterName === "difficulty" ? value : difficultyFilter;

        if (filterName === "status") setStatusFilter(value);
        if (filterName === "type") setTypeFilter(value);
        if (filterName === "difficulty") setDifficultyFilter(value);

        const matchingActivities = activities.filter((activity) => {
            return (
                (nextStatus === "ALL" ||
                    activity.status?.toUpperCase() === nextStatus) &&
                (nextType === "ALL" ||
                    activity.activityType?.toUpperCase() === nextType) &&
                (nextDifficulty === "ALL" ||
                    activity.difficulty?.toUpperCase() === nextDifficulty)
            );
        });

        const selectedStillMatches = matchingActivities.some(
            (activity) =>
                String(activity.activityId) === String(selectedActivityId)
        );

        if (selectedStillMatches) return;

        if (matchingActivities.length === 0) {
            setSelectedActivityId("");
            setCurrentActivity(null);
            setQuestions([]);
            setSelectedAnswers({});
            setShowRemaining(false);
            return;
        }

        handleActivityChange({
            target: {
                value: String(matchingActivities[0].activityId)
            }
        });
    };

    const visibleQuestions = showRemaining
        ? questions
        : questions.slice(0, 3);

    const filteredActivities = activities.filter((activity) => {
        const matchesStatus =
            statusFilter === "ALL" ||
            activity.status?.toUpperCase() === statusFilter;

        const matchesType =
            typeFilter === "ALL" ||
            activity.activityType?.toUpperCase() === typeFilter;

        const matchesDifficulty =
            difficultyFilter === "ALL" ||
            activity.difficulty?.toUpperCase() === difficultyFilter;

        return matchesStatus && matchesType && matchesDifficulty;
    });

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);

        window.setTimeout(() => {
            setMessage("");
        }, 3000);
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

    const handleDelete = async (questionId, confirmed = false) => {
        if (isDeleting || !currentActivity) return;

        if (confirmed !== true) {
            setDeleteConfirmation({
                type: "question",
                questionId,
                activityId: currentActivity.activityId
            });
            return;
        }

        const remainingQuestions = questions.filter(
            (question) => question.id !== questionId
        );

        if (remainingQuestions.length === 0) {
            showMessage(
                "An activity must contain at least one question.",
                "warning"
            );
            return false;
        }

        const mappedQuestions = remainingQuestions.map(
            (question, index) => ({
                questionText: question.question,
                instructions: null,
                imageUrl: question.imageUrl || null,
                points: question.points || 1,
                displayOrder: index + 1,

                options: (question.options || []).map(
                    (option, optionIndex) => ({
                        optionText: option.text,
                        correct: option.correct,
                        displayOrder: optionIndex + 1
                    })
                ),

                fillBlanks: (question.fillBlanks || []).map(
                    (blank, blankIndex) => ({
                        correctAnswer: blank.correctAnswer,
                        blankIndex: blankIndex
                    })
                ),

                matchingPairs: (question.matchingPairs || []).map((pair, index) => ({
                    leftItem: pair.leftItem,
                    rightItem: pair.rightItem,
                    displayOrder: index + 1
                })),

                sortingItems: (question.sortingItems || []).map((item, index) => ({
                    itemText: item.itemText,
                    correctOrder: index + 1
                })),

                dragItems: (question.dragItems || []).map((item) => ({
                    itemText: item.itemText,
                    imageUrl: item.imageUrl || null
                })),

                dropZones: (question.dropZones || []).map((zone) => ({
                    zoneLabel: zone.zoneLabel
                })),

                dragMappings: (question.dragMappings || []).map((mapping) => ({
                    dragItemIndex: mapping.dragItemIndex,
                    dropZoneIndex: mapping.dropZoneIndex
                })),

                hotspotRegions: (question.hotspotRegions || []).map((region) => ({
                    xCoordinate: region.xCoordinate,
                    yCoordinate: region.yCoordinate,
                    width: region.width,
                    height: region.height
                })),

                essay: question.essay
                    ? {
                        minWordCount: question.essay.minWordCount,
                        maxWordCount: question.essay.maxWordCount,
                        gradingRubric: question.essay.gradingRubric
                    }
                    : null
            })
        );

        const payload = {
            moduleId: currentActivity.moduleId,
            gradeLevel: currentActivity.gradeLevel,
            displayOrder: currentActivity.displayOrder,
            title: currentActivity.title,
            description: currentActivity.description,
            activityType: currentActivity.activityType,
            difficulty: currentActivity.difficulty,
            timeLimitMinutes: currentActivity.timeLimitMinutes,
            status: currentActivity.status,
            questions: mappedQuestions
        };

        setIsDeleting(true);

        try {
            await updateActivity(
                currentActivity.activityId,
                payload
            );

            const response = await getActivityById(
                currentActivity.activityId
            );

            setCurrentActivity(response.data);
            setQuestions(
                mapApiQuestionsToUI(response.data.questions)
            );

            showMessage("Question deleted successfully!");
            return true;

        } catch (error) {
            console.error(
                "Failed to delete question:",
                error.response?.data || error.message
            );

            showMessage("Failed to delete question.", "error");
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteActivity = async (confirmed = false) => {
        if (!currentActivity) return;

        const activityId = currentActivity.activityId;

        if (confirmed !== true) {
            setDeleteConfirmation({
                type: "activity",
                activityId,
                title: currentActivity.title
            });
            return;
        }

        let activityDeleted = false;

        try {
            setIsDeleting(true);

            await deleteActivity(activityId);

            activityDeleted = true;

            const listResponse = await getActivities();

            const updatedActivities = Array.isArray(listResponse.data)
                ? [...listResponse.data].sort(
                    (a, b) => b.activityId - a.activityId
                )
                : [];

            setActivities(updatedActivities);

            if (updatedActivities.length > 0) {
                const nextActivityId = updatedActivities[0].activityId;

                const detailResponse = await getActivityById(nextActivityId);

                setSelectedActivityId(String(nextActivityId));
                setCurrentActivity(detailResponse.data);
                setQuestions(
                    mapApiQuestionsToUI(detailResponse.data.questions)
                );
            } else {
                setSelectedActivityId("");
                setCurrentActivity(null);
                setQuestions([]);
            }

            showMessage("Activity deleted successfully!");
            return true;

        } catch (error) {
            console.error(
                "Failed to delete activity:",
                error.response?.data || error.message
            );

            setLoadError("Failed to refresh activities after delete. Please reload.");
            showMessage(
                "Delete or refresh failed. Please check the activity list.",
                "error"
            );
            return activityDeleted;

        } finally {
            setIsDeleting(false);
        }
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

    const handleSaveQuestion = async () => {
        if (isSavingQuestion || !editingQuestion || !currentActivity) return;

        const updatedQuestions = questions.map((question) =>
            question.id === editingQuestion.id
                ? editingQuestion
                : question
        );

        const mappedQuestions = updatedQuestions.map((question, index) => ({
            questionText: question.question,
            instructions: null,
            imageUrl: question.imageUrl || null,
            points: question.points || 1,
            displayOrder: index + 1,

            options: (question.options || []).map((option, optionIndex) => ({
                optionText: option.text,
                correct: option.correct,
                displayOrder: optionIndex + 1
            })),

            fillBlanks: (question.fillBlanks || []).map((blank, blankIndex) => ({
                correctAnswer: blank.correctAnswer,
                blankIndex: blankIndex
            })),

            matchingPairs: (question.matchingPairs || []).map((pair, index) => ({
                leftItem: pair.leftItem,
                rightItem: pair.rightItem,
                displayOrder: index + 1
            })),

            sortingItems: (question.sortingItems || []).map((item, index) => ({
                itemText: item.itemText,
                correctOrder: index + 1
            })),

            dragItems: (question.dragItems || []).map((item) => ({
                itemText: item.itemText,
                imageUrl: item.imageUrl || null
            })),

            dropZones: (question.dropZones || []).map((zone) => ({
                zoneLabel: zone.zoneLabel
            })),

            dragMappings: (question.dragMappings || []).map((mapping) => ({
                dragItemIndex: mapping.dragItemIndex,
                dropZoneIndex: mapping.dropZoneIndex
            })),

            hotspotRegions: (question.hotspotRegions || []).map((region) => ({
                xCoordinate: region.xCoordinate,
                yCoordinate: region.yCoordinate,
                width: region.width,
                height: region.height
            })),

            essay: question.essay
                ? {
                    minWordCount: question.essay.minWordCount,
                    maxWordCount: question.essay.maxWordCount,
                    gradingRubric: question.essay.gradingRubric
                }
                : null
        }));

        const payload = {
            moduleId: currentActivity.moduleId,
            gradeLevel: currentActivity.gradeLevel,
            displayOrder: currentActivity.displayOrder,
            title: currentActivity.title,
            description: currentActivity.description,
            activityType: currentActivity.activityType,
            difficulty: currentActivity.difficulty,
            timeLimitMinutes: currentActivity.timeLimitMinutes,
            status: currentActivity.status,
            questions: mappedQuestions
        };

        setIsSavingQuestion(true);

        try {
            const response = await updateActivity(
                currentActivity.activityId,
                payload
            );

            const savedActivity = response.data;

            const detailResponse = await getActivityById(
                currentActivity.activityId
            );

            setCurrentActivity(detailResponse.data);
            setQuestions(
                mapApiQuestionsToUI(detailResponse.data.questions)
            );

            setEditingQuestion(null);
            showMessage("Question updated successfully!");

        } catch (error) {
            console.error(
                "Failed to update question:",
                error.response?.data || error.message
            );

            showMessage("Failed to update question.", "error");
        } finally {
            setIsSavingQuestion(false);
        }
    };

    const handleRegenerate = () => {
        showMessage(
            "Regenerate is not connected to the API yet.",
            "warning"
        );
    };

    const handleSaveTemplate = () => {
        showMessage(
            "Save as Template is not available yet.",
            "warning"
        );
    };

    const handlePublish = () => {
        setPublishOpen(true);
        setPublished(false);
    };

    const handleConfirmPublish = async () => {
        if (!currentActivity) {
            showMessage("No activity selected.", "warning");
            return;
        }

        const payload = {
            moduleId: currentActivity.moduleId,
            gradeLevel: currentActivity.gradeLevel,
            displayOrder: currentActivity.displayOrder,
            title: currentActivity.title,
            description: currentActivity.description,
            activityType: currentActivity.activityType,
            difficulty: currentActivity.difficulty,
            timeLimitMinutes: currentActivity.timeLimitMinutes,
            status: "PUBLISHED",

            questions: currentActivity.questions.map((question, index) => ({
                questionText: question.questionText,
                instructions: question.instructions,
                imageUrl: question.imageUrl,
                points: question.points,
                displayOrder: index + 1,

                options: (question.options || []).map((option, optionIndex) => ({
                    optionText: option.optionText,
                    correct: option.correct,
                    displayOrder: optionIndex + 1
                })),

                fillBlanks: question.fillBlanks || [],
                matchingPairs: question.matchingPairs || [],
                sortingItems: question.sortingItems || [],
                dragItems: question.dragItems || [],
                dropZones: question.dropZones || [],
                dragMappings: (question.dragMappings || []).map((mapping) => ({
                    dragItemIndex:
                        (question.dragItems || []).findIndex(
                            (item) => item.itemId === mapping.dragItemId
                        ) + 1,

                    dropZoneIndex:
                        (question.dropZones || []).findIndex(
                            (zone) => zone.zoneId === mapping.dropZoneId
                        ) + 1
                })),
                hotspotRegions: question.hotspotRegions || [],
                essay: question.essay || null
            }))
        };

        try {
            await updateActivity(currentActivity.activityId, payload);

            const response = await getActivityById(currentActivity.activityId);

            setCurrentActivity(response.data);
            setQuestions(mapApiQuestionsToUI(response.data.questions));

            setActivities((previous) =>
                previous.map((activity) =>
                    String(activity.activityId) === String(response.data.activityId)
                        ? { ...activity, status: "PUBLISHED" }
                        : activity
                )
            );

            if (statusFilter === "DRAFT") {
                setStatusFilter("ALL");
            }

            setPublishOpen(false);
            showMessage("Activity published successfully!");

        } catch (error) {
            console.error(
                "Failed to publish activity:",
                error.response?.data || error.message
            );

            showMessage("Failed to publish activity.", "error");
        }
    };

    const hasMatchingSelection =
        currentActivity !== null &&
        String(currentActivity.activityId) === String(selectedActivityId) &&
        filteredActivities.some(
            (activity) =>
                String(activity.activityId) === String(selectedActivityId)
        );

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="generated-activities-page">

                <div className="activity-filters">

                    <div className="activity-filter-field">
                        <label htmlFor="status-filter">Status</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>

                    <div className="activity-filter-field">
                        <label htmlFor="type-filter">Activity Type</label>
                        <select
                            id="type-filter"
                            value={typeFilter}
                            onChange={(e) => handleFilterChange("type", e.target.value)}
                        >
                            <option value="ALL">All Types</option>

                            {[...new Set(
                                activities.map((a) => a.activityType).filter(Boolean)
                            )].sort().map((type) => (
                                <option key={type} value={type.toUpperCase()}>
                                    {type.replaceAll("_", " ")}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="activity-filter-field">
                        <label htmlFor="difficulty-filter">Difficulty</label>
                        <select
                            id="difficulty-filter"
                            value={difficultyFilter}
                            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                        >
                            <option value="ALL">All Difficulties</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </div>

                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label
                        htmlFor="saved-activity-select"
                        style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: 600
                        }}
                    >
                        Select Saved Activity
                    </label>

                    <select
                        id="saved-activity-select"
                        className="saved-activity-select"
                        value={selectedActivityId}
                        onChange={handleActivityChange}
                        disabled={loading || filteredActivities.length === 0}
                    >
                        {filteredActivities.length === 0 ? (
                            <option value="">
                                {loading
                                    ? "Loading activities..."
                                    : activities.length === 0
                                        ? "No activities available"
                                        : "No activities match the selected filters"}
                            </option>
                        ) : (
                            filteredActivities.map((activity) => (
                                <option
                                    key={activity.activityId}
                                    value={String(activity.activityId)}
                                >
                                    {activity.title} (ID: {activity.activityId})
                                </option>
                            ))
                        )}
                    </select>
                </div>


                {hasMatchingSelection && currentActivity && (
                    <div className="delete-activity-container">
                        <button
                            type="button"
                            className="delete-activity-button"
                            onClick={handleDeleteActivity}
                            disabled={loading}
                        >
                            Delete Activity
                        </button>
                    </div>
                )}

                {hasMatchingSelection && currentActivity && (
                    <ActivityHeader
                        activity={currentActivity}
                        onRegenerate={handleRegenerate}
                        onSaveTemplate={handleSaveTemplate}
                        onPublish={handlePublish}
                        isRegenerating={isRegenerating}
                    />
                )}

                {message && (
                    <div
                        className={`generated-activity-toast toast-${messageType}`}
                        role={messageType === "error" ? "alert" : "status"}
                    >
                        <span className="toast-icon">
                            {messageType === "success" ? "✓" : "!"}
                        </span>

                        <div className="toast-content">
                            <strong>
                                {messageType === "error"
                                    ? "Error"
                                    : messageType === "warning"
                                        ? "Warning"
                                        : "Success"}
                            </strong>

                            <span>{message}</span>
                        </div>

                        <button
                            type="button"
                            className="toast-close"
                            onClick={() => setMessage("")}
                            aria-label="Close notification"
                        >
                            ×
                        </button>
                    </div>
                )}

                {!loading && !hasMatchingSelection && (
                    <div className="no-activities-message">
                        {loadError
                            ? loadError
                            : activities.length === 0
                                ? "No activities found. Please create an activity first."
                                : "No activities match the selected filters."}
                    </div>
                )}

                {hasMatchingSelection && currentActivity && (
                    <div className="generated-activities-layout">

                        <main className="generated-question-column">

                            {visibleQuestions.map((question) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    activityType={currentActivity.activityType}
                                    selectedAnswer={selectedAnswers[question.id]}
                                    onAnswerSelect={handleAnswerSelect}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}

                            {questions.length > 3 && (
                                <button
                                    type="button"
                                    className="remaining-questions-button"
                                    onClick={() =>
                                        setShowRemaining((value) => !value)
                                    }
                                >
                                    <span>
                                        {showRemaining
                                            ? "Hide Remaining Questions"
                                            : `View Remaining ${questions.length - 3} Questions`}
                                    </span>

                                    <span>
                                        {showRemaining ? "⌃" : "⌄"}
                                    </span>
                                </button>
                            )}

                        </main>

                        <aside className="generated-details-column">
                            <GenerationDetails activity={currentActivity} />
                            <AIAssistant />
                        </aside>

                    </div>
                )}
            </div>

            {loading && (
                <p>Loading activity from database...</p>
            )}

            {hasMatchingSelection && currentActivity && (
                <p>
                    Loaded from database: {currentActivity.title}
                    {" "}(ID: {currentActivity.activityId})
                </p>
            )}

            {editingQuestion && (
                <EditQuestionModal
                    question={editingQuestion}
                    activityType={currentActivity?.activityType}
                    onClose={() => setEditingQuestion(null)}
                    onChange={handleEditQuestionChange}
                    onOptionChange={handleEditOptionChange}
                    onCorrectChange={handleEditCorrectAnswer}
                    onSave={handleSaveQuestion}
                    isSaving={isSavingQuestion}
                />
            )}

            {publishOpen && (
                <PublishModal
                    activity={currentActivity}
                    lesson={selectedLesson}
                    setLesson={setSelectedLesson}
                    published={published}
                    onClose={() => setPublishOpen(false)}
                    onPublish={handleConfirmPublish}
                />
            )}

            {deleteConfirmation && (
                <div className="generated-modal-overlay">
                    <div
                        className="delete-confirmation-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-confirmation-title"
                    >
                        <div className="delete-confirmation-icon">
                            !
                        </div>

                        <h3 id="delete-confirmation-title">
                            {deleteConfirmation.type === "question"
                                ? "Delete Question?"
                                : "Delete Activity?"}
                        </h3>

                        <p>
                            {deleteConfirmation.type === "question"
                                ? "Are you sure you want to delete this question?"
                                : `Are you sure you want to permanently delete "${deleteConfirmation.title}"?`}
                        </p>

                        <p className="delete-confirmation-warning">
                            This action cannot be undone.
                        </p>

                        <div className="delete-confirmation-actions">
                            <button
                                type="button"
                                className="delete-confirmation-cancel"
                                onClick={() => setDeleteConfirmation(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirmation-confirm"
                                disabled={isDeleting}
                                onClick={async () => {
                                    const pending = deleteConfirmation;

                                    if (
                                        currentActivity?.activityId !== pending.activityId
                                    ) {
                                        setDeleteConfirmation(null);
                                        showMessage(
                                            "The selected activity has changed. Please try again.",
                                            "error"
                                        );
                                        return;
                                    }

                                    if (pending.type === "question") {
                                        const success = await handleDelete(
                                            pending.questionId,
                                            true
                                        );

                                        if (success) {
                                            setDeleteConfirmation(null);
                                        }
                                    } else {
                                        const success = await handleDeleteActivity(true);

                                        if (success) {
                                            setDeleteConfirmation(null);
                                        }
                                    }
                                }}
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : deleteConfirmation.type === "question"
                                        ? "Delete Question"
                                        : "Delete Activity"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </BackofficeLayout>
    );
}

function EditQuestionModal({
                               question,
                               activityType,
                               onClose,
                               onChange,
                               onOptionChange,
                               onCorrectChange,
                               onSave,
                               isSaving = false
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

                    {activityType === "FILL_BLANK" ? (
                        <>
                            <label htmlFor="edit-fill-blank-answer">
                                CORRECT ANSWER
                            </label>

                            <input
                                id="edit-fill-blank-answer"
                                type="text"
                                value={question.fillBlanks?.[0]?.correctAnswer || ""}
                                onChange={(event) =>
                                    onChange("fillBlanks", [
                                        {
                                            blankIndex: 0,
                                            correctAnswer: event.target.value
                                        }
                                    ])
                                }
                                placeholder="Enter the correct answer"
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    boxSizing: "border-box"
                                }}
                            />
                        </>
                    ) : ["ESSAY", "SHORT_ANSWER", "PROBLEM_SOLVING", "APPLICATION_BASED"].includes(activityType) ? (
                        <>
                            <label>MINIMUM WORD COUNT</label>
                            <input
                                type="number"
                                min="1"
                                value={question.essay?.minWordCount ?? ""}
                                onChange={(event) =>
                                    onChange("essay", {
                                        ...question.essay,
                                        minWordCount: event.target.value === ""
                                            ? null
                                            : Number(event.target.value)
                                    })
                                }
                            />

                            <label>MAXIMUM WORD COUNT</label>
                            <input
                                type="number"
                                min="1"
                                value={question.essay?.maxWordCount ?? ""}
                                onChange={(event) =>
                                    onChange("essay", {
                                        ...question.essay,
                                        maxWordCount: event.target.value === ""
                                            ? null
                                            : Number(event.target.value)
                                    })
                                }
                            />

                            <label>GRADING RUBRIC</label>
                            <textarea
                                maxLength={1000}
                                value={question.essay?.gradingRubric ?? ""}
                                onChange={(event) =>
                                    onChange("essay", {
                                        ...question.essay,
                                        gradingRubric: event.target.value
                                    })
                                }
                            />
                        </>
                    ) : activityType === "MATCHING" ? (
                        <>
                            <label>MATCHING PAIRS</label>

                            {(question.matchingPairs || []).map((pair, index) => (

                                <div
                                    key={pair.id}
                                    className="matching-pair-row"
                                >

                                <input
                                        type="text"
                                        value={pair.leftItem}
                                        placeholder={`Left Item ${index + 1}`}
                                        onChange={(event) => {
                                            const updatedPairs = question.matchingPairs.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? { ...item, leftItem: event.target.value }
                                                        : item
                                            );

                                            onChange("matchingPairs", updatedPairs);
                                        }}
                                    />

                                    <input
                                        type="text"
                                        value={pair.rightItem}
                                        placeholder={`Right Item ${index + 1}`}
                                        onChange={(event) => {
                                            const updatedPairs = question.matchingPairs.map(
                                                (item, itemIndex) =>
                                                    itemIndex === index
                                                        ? { ...item, rightItem: event.target.value }
                                                        : item
                                            );

                                            onChange("matchingPairs", updatedPairs);
                                        }}
                                    />
                                </div>
                            ))}
                        </>
                    ) : activityType === "SORTING" ? (
                        <>
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
                                                (currentItem, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                            ...currentItem,
                                                            itemText: event.target.value
                                                        }
                                                        : currentItem
                                            );

                                            onChange("sortingItems", updatedItems);
                                        }}
                                    />

                                    <span>Correct Order: {item.correctOrder}</span>
                                </div>
                            ))}
                        </>
                    ) : activityType === "DRAG_DROP" ? (
                        <>
                            <label>DRAG ITEMS & DROP ZONES</label>

                            {(question.dragItems || []).map((item, index) => (

                                <div
                                    key={item.id}
                                    className="drag-drop-edit-row"
                                >

                                <input
                                        type="text"
                                        value={item.itemText}
                                        placeholder={`Drag Item ${index + 1}`}
                                        onChange={(event) => {
                                            const updatedItems = question.dragItems.map(
                                                (currentItem, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                            ...currentItem,
                                                            itemText: event.target.value
                                                        }
                                                        : currentItem
                                            );

                                            onChange("dragItems", updatedItems);
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
                                                        ? {
                                                            ...zone,
                                                            zoneLabel: event.target.value
                                                        }
                                                        : zone
                                            );

                                            onChange("dropZones", updatedZones);
                                        }}
                                    />
                                </div>
                            ))}
                        </>
                    ) : activityType === "HOTSPOT" ? (
                        <>
                            <label>IMAGE URL</label>
                            <input
                                type="text"
                                value={question.imageUrl || ""}
                                placeholder="Enter image URL"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #e5cfee",
                                    borderRadius: "6px",
                                    boxSizing: "border-box",
                                    marginTop: "8px",
                                    marginBottom: "20px"
                                }}
                                onChange={(event) =>
                                    onChange("imageUrl", event.target.value)
                                }
                            />

                            <label>HOTSPOT REGION</label>

                            {(question.hotspotRegions || []).map((region, index) => (
                                <div key={region.id ?? index}>
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
                                                gridTemplateColumns: "140px 1fr",
                                                alignItems: "center",
                                                gap: "16px",
                                                marginBottom: "14px"
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
                                                    boxSizing: "border-box",
                                                    fontSize: "13px"
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

                                                    onChange("hotspotRegions", updatedRegions);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <label>ANSWER OPTIONS</label>

                            <div className="edit-options">
                                {(question.options || []).map((option) => (
                                    <div
                                        className={`edit-option ${
                                            option.correct ? "correct" : ""
                                        }`}
                                        key={option.id}
                                    >
                                        <button
                                            type="button"
                                            className="correct-answer-button"
                                            disabled={activityType === "POLL"}
                                            onClick={() => onCorrectChange(option.id)}
                                            title={
                                                activityType === "POLL"
                                                    ? "Polls do not have correct answers"
                                                    : "Set correct answer"
                                            }
                                        >
                                            {option.id}
                                        </button>

                                        <input
                                            type="text"
                                            value={option.text}
                                            onChange={(event) =>
                                                onOptionChange(
                                                    option.id,
                                                    event.target.value
                                                )
                                            }
                                        />

                                        {option.correct && (
                                            <CheckCircle2 size={13} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <p className="edit-question-hint">
                                Click an option letter to mark the correct answer.
                            </p>
                        </>
                    )}

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
                        disabled={isSaving}
                    >
                        <Save size={11} />
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>

                </div>

            </div>
        </div>
    );
}

function PublishModal({
                          activity,
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
                            The activity has been published successfully.
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
                                    Publish Activity
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
                                        {activity?.title || "Untitled Activity"}
                                    </strong>

                                    <span>
                                        {activity?.questions?.length || 0}{" "}
                                        {activity?.questions?.length === 1 ? "question" : "questions"} ·{" "}
                                        {activity?.activityType || "Activity"}
                                    </span>
                                </div>
                            </div>

                            <div className="publish-warning">
                                This activity will be marked as published.
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