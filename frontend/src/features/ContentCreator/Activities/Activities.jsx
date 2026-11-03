import BackofficeLayout from "../../../components/layout/BackofficeLayout.jsx";
import { useState, useEffect } from "react";

import SourceMaterials from "./components/SourceMaterials.jsx";
import ActivityConfiguration from "./components/ActivityConfiguration.jsx";
import ActivityPreview from "./components/ActivityPreview.jsx";

import {
    courses,
    defaultGeneratorSettings
} from "./data/ActivityData.js";

import "./Activities.css";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

import { getActivities } from "../../../services/activityApi";
import { createActivity } from "../../../services/activityApi";

function Activities() {
    const [selectedCourseId, setSelectedCourseId] = useState(
        courses[0].id
    );

    const [selectedLesson, setSelectedLesson] = useState(
        courses[0].lessons[0]
    );

    const [settings, setSettings] = useState(
        defaultGeneratorSettings
    );

    const [files, setFiles] = useState([]);

    const [questions, setQuestions] = useState([]);

    const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
    );

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateActivity = () => {
        setIsGenerating(true);

        setTimeout(() => {
            if (settings.activityType === "fill-blanks") {
                setQuestions([
                    {
                        id: Date.now(),
                        question: "The capital of France is _____.",
                        fillBlanks: [
                            {
                                correctAnswer: "Paris"
                            }
                        ]
                    }
                ]);
            } else if (settings.activityType === "mcq") {
                setQuestions([
                    {
                        id: Date.now(),
                        question: "What is the main concept discussed in this lesson?",
                        options: [
                            { id: 1, text: "Concept A", correct: true },
                            { id: 2, text: "Concept B", correct: false },
                            { id: 3, text: "Concept C", correct: false },
                            { id: 4, text: "Concept D", correct: false }
                        ]
                    }
                ]);
            } else {
                setQuestions([]);
                alert("Question generation is not available for this activity type yet.");
            }

            setIsGenerating(false);
        }, 1200);
    };

    const handleCourseChange = (event) => {
        const courseId = event.target.value;

        const course = courses.find(
            (item) => item.id === courseId
        );

        setSelectedCourseId(courseId);
        setSelectedLesson(course?.lessons?.[0] || "");
    };

    const handleLessonChange = (event) => {
        setSelectedLesson(event.target.value);
    };

    const handleSettingChange = (field, value) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const handleFilesChange = (newFiles) => {
        setFiles(newFiles);
    };

    const createQuestion = (activityType = "mcq") => {
        const baseQuestion = {
            id: Date.now(),
            question: ""
        };

        if (activityType === "fill-blanks") {
            return {
                ...baseQuestion,
                fillBlanks: [
                    {
                        correctAnswer: ""
                    }
                ]
            };
        }

        if (activityType === "true-false") {
            return {
                ...baseQuestion,
                options: [
                    { id: 1, text: "True", correct: true },
                    { id: 2, text: "False", correct: false }
                ]
            };
        }

        if (["essay", "short-answer", "problem-solving", "application-based"].includes(activityType)) {
            return {
                ...baseQuestion,
                essay: {
                    minWordCount: activityType === "short-answer" ? 10 : 100,
                    maxWordCount: activityType === "short-answer" ? 100 : 500,
                    gradingRubric: ""
                }
            };
        }

        if (activityType === "matching") {
            return {
                ...baseQuestion,
                matchingPairs: [
                    {
                        id: 1,
                        leftItem: "",
                        rightItem: ""
                    },
                    {
                        id: 2,
                        leftItem: "",
                        rightItem: ""
                    }
                ]
            };
        }

        if (activityType === "sorting") {
            return {
                ...baseQuestion,
                sortingItems: [
                    {
                        id: 1,
                        itemText: "",
                        correctOrder: 1
                    },
                    {
                        id: 2,
                        itemText: "",
                        correctOrder: 2
                    }
                ]
            };
        }

        if (activityType === "drag-drop") {
            return {
                ...baseQuestion,
                dragItems: [
                    { id: 1, itemText: "", imageUrl: null },
                    { id: 2, itemText: "", imageUrl: null }
                ],
                dropZones: [
                    { id: 1, zoneLabel: "" },
                    { id: 2, zoneLabel: "" }
                ],
                dragMappings: [
                    { dragItemIndex: 1, dropZoneIndex: 1 },
                    { dragItemIndex: 2, dropZoneIndex: 2 }
                ]
            };
        }

        if (activityType === "poll") {
            return {
                ...baseQuestion,
                options: [
                    { id: 1, text: "", correct: false },
                    { id: 2, text: "", correct: false }
                ]
            };
        }

        if (activityType === "hotspot") {
            return {
                ...baseQuestion,
                imageUrl: "",
                hotspotRegions: [
                    {
                        id: 1,
                        xCoordinate: 0,
                        yCoordinate: 0,
                        width: 100,
                        height: 100
                    }
                ]
            };
        }

        return {
            ...baseQuestion,
            options: [
                { id: 1, text: "", correct: true },
                { id: 2, text: "", correct: false },
                { id: 3, text: "", correct: false },
                { id: 4, text: "", correct: false }
            ]
        };
    };

    const handleAddQuestion = () => {
        if (!["mcq", "fill-blanks", "true-false", "quiz", "essay", "matching", "sorting", "drag-drop", "poll", "short-answer", "hotspot", "problem-solving", "application-based", "timed-quiz", "challenge-quiz"].includes(settings.activityType)) {
            alert("This activity type is not supported yet.");
            return;
        }

        setQuestions((current) => [
            ...current,
            createQuestion(settings.activityType)
        ]);
    };

    const handleUpdateQuestion = (
        questionId,
        field,
        value
    ) => {
        setQuestions((current) =>
            current.map((question) =>
                question.id === questionId
                    ? {
                        ...question,
                        [field]: value
                    }
                    : question
            )
        );
    };

    const handleUpdateOption = (
        questionId,
        optionId,
        value
    ) => {
        setQuestions((current) =>
            current.map((question) => {
                if (question.id !== questionId) {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.map(
                        (option) =>
                            option.id === optionId
                                ? {
                                    ...option,
                                    text: value
                                }
                                : option
                    )
                };
            })
        );
    };

    const handleSetCorrectAnswer = (
        questionId,
        optionId
    ) => {
        setQuestions((current) =>
            current.map((question) => {
                if (question.id !== questionId) {
                    return question;
                }

                return {
                    ...question,
                    options: question.options.map(
                        (option) => ({
                            ...option,
                            correct:
                                option.id === optionId
                        })
                    )
                };
            })
        );
    };

    const handleDeleteQuestion = (questionId) => {
        setQuestions((current) =>
            current.filter(
                (question) =>
                    question.id !== questionId
            )
        );
    };

    const mapQuestionsForApi = (questions, activityType) => {
        return questions.map((question, index) => ({
            questionText: question.question,
            instructions: null,
            imageUrl: activityType === "hotspot"
                ? (question.imageUrl?.trim() || null)
                : null,
            points: 1,
            displayOrder: index + 1,

            options: ["mcq", "true-false", "quiz", "poll", "timed-quiz", "challenge-quiz"].includes(activityType)
                ? (question.options || []).map((option, optionIndex) => ({
                    optionText: option.text,
                    correct: option.correct,
                    displayOrder: optionIndex + 1
                }))
                : [],

            fillBlanks:
                activityType === "fill-blanks"
                    ? (question.fillBlanks || []).map((blank, blankIndex) => ({
                        correctAnswer: blank.correctAnswer,
                        blankIndex: blankIndex
                    }))
                    : [],

            matchingPairs: activityType === "matching"
                ? (question.matchingPairs || []).map((pair, index) => ({
                    leftItem: pair.leftItem,
                    rightItem: pair.rightItem,
                    displayOrder: index + 1
                }))
                : [],

            sortingItems: activityType === "sorting"
                ? (question.sortingItems || []).map((item, index) => ({
                    itemText: item.itemText,
                    correctOrder: index + 1
                }))
                : [],

            dragItems: activityType === "drag-drop"
                ? (question.dragItems || []).map((item) => ({
                    itemText: item.itemText,
                    imageUrl: item.imageUrl || null
                }))
                : [],

            dropZones: activityType === "drag-drop"
                ? (question.dropZones || []).map((zone) => ({
                    zoneLabel: zone.zoneLabel
                }))
                : [],

            dragMappings: activityType === "drag-drop"
                ? (question.dragMappings || []).map((mapping) => ({
                    dragItemIndex: mapping.dragItemIndex,
                    dropZoneIndex: mapping.dropZoneIndex
                }))
                : [],

            hotspotRegions: activityType === "hotspot"
                ? (question.hotspotRegions || []).map((region) => ({
                    xCoordinate: region.xCoordinate,
                    yCoordinate: region.yCoordinate,
                    width: region.width,
                    height: region.height
                }))
                : [],

            essay: ["essay", "short-answer", "problem-solving", "application-based"]
                .includes(activityType)
                ? {
                    minWordCount: question.essay?.minWordCount ?? null,
                    maxWordCount: question.essay?.maxWordCount ?? null,
                    gradingRubric: question.essay?.gradingRubric ?? null
                }
                : null,
        }));
    };

    const activityTypeMap = {
        mcq: "MCQ",
        "fill-blanks": "FILL_BLANK",
        "true-false": "TRUE_FALSE",
        quiz: "QUIZ",
        essay: "ESSAY",
        matching: "MATCHING",
        sorting: "SORTING",
        "drag-drop": "DRAG_DROP",
        poll: "POLL",
        "short-answer": "SHORT_ANSWER",
        hotspot: "HOTSPOT",
        "problem-solving": "PROBLEM_SOLVING",
        "application-based": "APPLICATION_BASED",
        "timed-quiz": "TIMED_QUIZ",
        "challenge-quiz": "CHALLENGE_QUIZ",
    };
    const handleSaveActivity = async () => {
        try {
            if (questions.length === 0) {
                alert("Please add at least one question.");
                return;
            }

            if (!settings.title?.trim()) {
                alert("Please enter an activity title.");
                return;
            }

            const moduleId = Number(settings.moduleId);

            if (!Number.isSafeInteger(moduleId) || moduleId <= 0) {
                alert("Please enter a valid numeric Module ID.");
                return;
            }

            const displayOrder = Number(settings.displayOrder);

            if (
                !Number.isSafeInteger(displayOrder) ||
                displayOrder <= 0
            ) {
                alert("Please enter a valid Display Order.");
                return;
            }

            if (!activityTypeMap[settings.activityType]) {
                alert(
                    "This activity type is not supported yet. Please select MCQs or Fill in Blanks."
                );
                return;
            }

            if (settings.activityType === "fill-blanks") {
                const hasInvalidQuestion = questions.some(
                    (question) =>
                        !question.question?.trim() ||
                        !question.fillBlanks?.[0]?.correctAnswer?.trim()
                );

                if (hasInvalidQuestion) {
                    alert(
                        "Please enter a question and correct answer for every Fill in Blanks question."
                    );
                    return;
                }
            }

            if (settings.activityType === "true-false") {
                const hasInvalidQuestion = questions.some((question) => {
                    const options = question.options || [];

                    return (
                        !question.question?.trim() ||
                        options.length !== 2 ||
                        options[0]?.text !== "True" ||
                        options[1]?.text !== "False" ||
                        options.filter((option) => option.correct).length !== 1
                    );
                });

                console.log("TRUE_FALSE questions:", questions);

                if (hasInvalidQuestion) {
                    alert(
                        "Please enter a question and select one correct answer for every True / False question."
                    );
                    return;
                }
            }

            const payload = {
                moduleId: moduleId,
                gradeLevel: settings.gradeLevel || "GRADE_3",
                displayOrder: displayOrder,
                title: settings.title?.trim(),
                description: settings.description || "",
                activityType: activityTypeMap[settings.activityType] || "MCQ",
                difficulty: settings.difficulty.toUpperCase(),
                timeLimitMinutes:
                    settings.activityType === "timed-quiz"
                        ? Number(settings.timeLimitMinutes) || 10
                        : settings.timeLimitMinutes || null,
                questions: mapQuestionsForApi(questions, settings.activityType)
            };

            console.log("Sending activity:", payload);

            const response = await createActivity(payload);

            console.log("Activity saved successfully:", response.data);
            alert("Activity saved successfully!");

        } catch (error) {
            console.error(
                "Failed to save activity:",
                error.response?.data || error.message
            );

            alert("Failed to save activity. Check console.");
        }
    };

    return (
        <BackofficeLayout
            sidebar={<CreatorSidebar />}
        >
            <div className="activity-generator-page">

                <header className="activity-generator-header">
                    <div>
                        <div className="activity-generator-breadcrumb">
                            ACTIVITIES / CREATE
                        </div>

                        <h1>
                            Activity Generator
                        </h1>

                        <p>
                            Create and organize activities
                            manually for your courses.
                        </p>
                    </div>
                </header>

                <div className="activity-generator-layout">

                    <aside className="activity-generator-controls">

                        <SourceMaterials
                            courses={courses}
                            selectedCourseId={
                                selectedCourseId
                            }
                            selectedLesson={
                                selectedLesson
                            }
                            onCourseChange={
                                handleCourseChange
                            }
                            onLessonChange={
                                handleLessonChange
                            }
                            files={files}
                            onFilesChange={
                                handleFilesChange
                            }
                        />

                        <ActivityConfiguration
                            settings={settings}
                            onSettingChange={handleSettingChange}
                            onGenerate={handleGenerateActivity}
                        />

                    </aside>

                    <main className="activity-generator-preview">

                        <ActivityPreview
                            course={
                                selectedCourse?.name
                            }
                            lesson={selectedLesson}
                            settings={settings}
                            questions={questions}
                            onAddQuestion={
                                handleAddQuestion
                            }
                            onUpdateQuestion={
                                handleUpdateQuestion
                            }
                            onUpdateOption={
                                handleUpdateOption
                            }
                            onSetCorrectAnswer={
                                handleSetCorrectAnswer
                            }
                            onDeleteQuestion={
                                handleDeleteQuestion
                            }
                            onSaveActivity={
                                handleSaveActivity
                            }
                        />

                    </main>

                </div>

            </div>
        </BackofficeLayout>
    );
}

export default Activities;