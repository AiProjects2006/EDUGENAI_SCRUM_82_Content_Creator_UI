import BackofficeLayout from "../../../components/layout/BackofficeLayout.jsx";
import { useState } from "react";

import SourceMaterials from "./components/SourceMaterials.jsx";
import ActivityConfiguration from "./components/ActivityConfiguration.jsx";
import ActivityPreview from "./components/ActivityPreview.jsx";

import {
    courses,
    defaultGeneratorSettings
} from "./data/ActivityGeneratorData.js";

import "./ActivityGenerator.css";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

function ActivityGenerator() {
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
            setQuestions([
                {
                    id: Date.now(),
                    question: "What is the main concept discussed in this lesson?",
                    options: [
                        {
                            id: 1,
                            text: "Concept A",
                            correct: true
                        },
                        {
                            id: 2,
                            text: "Concept B",
                            correct: false
                        },
                        {
                            id: 3,
                            text: "Concept C",
                            correct: false
                        },
                        {
                            id: 4,
                            text: "Concept D",
                            correct: false
                        }
                    ]
                }
            ]);

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

    const createQuestion = () => {
        return {
            id: Date.now(),
            question: "",
            options: [
                {
                    id: 1,
                    text: "",
                    correct: true
                },
                {
                    id: 2,
                    text: "",
                    correct: false
                },
                {
                    id: 3,
                    text: "",
                    correct: false
                },
                {
                    id: 4,
                    text: "",
                    correct: false
                }
            ]
        };
    };

    const handleAddQuestion = () => {
        setQuestions((current) => [
            ...current,
            createQuestion()
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

    const handleSaveActivity = () => {
        const activity = {
            course: selectedCourse?.name,
            lesson: selectedLesson,
            activityType: settings.activityType,
            difficulty: settings.difficulty,
            questions,
            files
        };

        console.log("Activity saved:", activity);

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

export default ActivityGenerator;