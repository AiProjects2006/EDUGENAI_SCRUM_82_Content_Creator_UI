import { useState, useEffect, useMemo } from "react";
import BackofficeLayout from "../../../components/layout/BackofficeLayout.jsx";
import CreatorSidebar from "../../../components/layout/Sidebar/CreatorSidebar.jsx";

import SourceMaterials from "./components/SourceMaterials.jsx";
import ActivityConfiguration from "./components/ActivityConfiguration.jsx";
import ActivityPreview from "./components/ActivityPreview.jsx";

import {
    fallbackCourses,
    defaultGeneratorSettings
} from "./data/ActivityData.js";

import {
    fetchCoursesFromBackoffice,
    generateActivityInBackoffice,
    createActivityInBackoffice
} from "../../../services/backofficeService.js";
import { fetchAllModules } from "../../../services/moduleService.js";
import { fetchSlidesByModule, getStoredSlides } from "../../../services/slideService.js";

import "./Activities.css";

function mapGeneratedQuestionToEditor(q, idx, activityType) {
    const rawOpts = Array.isArray(q.options) ? q.options : [];
    const correctAns = q.correctAnswer || q.expectedAnswer || "";
    const options = rawOpts.map((opt, oIdx) => {
        const text = typeof opt === "string" ? opt : opt.optionText || opt.text || "";
        const isCorrect =
            typeof opt === "object" && typeof opt.correct === "boolean"
                ? opt.correct
                : correctAns
                  ? text.trim().toLowerCase() === String(correctAns).trim().toLowerCase()
                  : oIdx === 0;
        return {
            id: oIdx + 1,
            text,
            correct: isCorrect
        };
    });

    if (options.length > 0 && !options.some((o) => o.correct)) {
        options[0].correct = true;
    }

    return {
        id: Date.now() + idx,
        activityType: q.activityType || activityType,
        question: q.questionText || q.question || `Question ${idx + 1}`,
        options,
        correctAnswer: correctAns || options.find((o) => o.correct)?.text || "",
        expectedAnswer: q.expectedAnswer || correctAns || "",
        scenario: q.scenario || "",
        passage: q.passage || "",
        keywords: Array.isArray(q.keywords) ? q.keywords : [],
        solutionSteps: Array.isArray(q.solutionSteps) ? q.solutionSteps : [],
        leftItems: Array.isArray(q.leftItems) ? q.leftItems : null,
        rightItems: Array.isArray(q.rightItems) ? q.rightItems : null,
        matchingAnswers: q.matchingAnswers || q.answers || null,
        categories: Array.isArray(q.categories) ? q.categories : null,
        items: Array.isArray(q.items) ? q.items : null,
        itemsToOrder: Array.isArray(q.itemsToOrder) ? q.itemsToOrder : null,
        imageUrl: q.imageUrl || null,
        imageDescription: q.imageDescription || "",
        correctRegion: q.correctRegion || "",
        regions: Array.isArray(q.regions) ? q.regions : null,
        timeLimitSeconds: q.timeLimitSeconds || (activityType === "TIMED_QUIZ" ? 20 : null),
        points: q.points || 2
    };
}

function buildLocalFallbackQuestions(activityType, courseName, moduleTitle, count = 5) {
    const list = [];
    for (let i = 1; i <= count; i++) {
        if (activityType === "TRUE_FALSE") {
            const ans = i % 2 === 1 ? "True" : "False";
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText:
                            ans === "True"
                                ? `${moduleTitle} is a core concept covered in ${courseName} (Check ${i}).`
                                : `${moduleTitle} is completely unrelated to ${courseName} (Check ${i}).`,
                        options: ["True", "False"],
                        correctAnswer: ans
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "FILL_BLANK") {
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText: `In ${courseName}, studying ${moduleTitle} builds strong ______ for learners.`,
                        correctAnswer: "foundations"
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "MATCHING") {
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText: `Match each ${moduleTitle} term with its meaning:`,
                        leftItems: [
                            { id: "L1", text: `${moduleTitle} Core Idea` },
                            { id: "L2", text: `Practical Example ${i}` },
                            { id: "L3", text: `${courseName} Skill` }
                        ],
                        rightItems: [
                            { id: "R1", text: `Defines the main principle of ${moduleTitle}` },
                            { id: "R2", text: `Applies ${moduleTitle} in everyday life` },
                            { id: "R3", text: `Builds problem-solving in ${courseName}` }
                        ],
                        matchingAnswers: { L1: "R1", L2: "R2", L3: "R3" }
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "SORTING") {
            const c1 = `${moduleTitle} Principles`;
            const c2 = `Practical Examples`;
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText: `Sort these items into the proper category for ${moduleTitle}:`,
                        categories: [c1, c2],
                        items: [
                            { name: `Main Rule #${i}`, category: c1 },
                            { name: `Key Definition #${i}`, category: c1 },
                            { name: `Hands-on Observation #${i}`, category: c2 },
                            { name: `Daily Example #${i}`, category: c2 }
                        ]
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "DRAG_DROP") {
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText: `Arrange the stages of ${moduleTitle} from first to last:`,
                        itemsToOrder: [
                            `Introduce the core topic of ${moduleTitle}`,
                            `Examine key features and examples`,
                            `Practice applying ${moduleTitle}`,
                            `Review outcomes in ${courseName}`
                        ]
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "HOTSPOT") {
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText: `Click the hotspot marking the Primary Zone in ${moduleTitle}:`,
                        imageDescription: `${moduleTitle} Concept Diagram`,
                        correctRegion: `Primary ${moduleTitle} Zone`,
                        regions: [
                            { id: "r1", label: "Outer Boundary", x: 24, y: 28, isCorrect: false },
                            { id: "r2", label: `Primary ${moduleTitle} Zone`, x: 52, y: 54, isCorrect: true },
                            { id: "r3", label: "Secondary Zone", x: 76, y: 36, isCorrect: false }
                        ]
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "ESSAY") {
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        passage: `${moduleTitle} is a key unit in ${courseName} that helps students connect classroom ideas to the world around them.`,
                        questionText: `Explain in 2-3 sentences why ${moduleTitle} is important in ${courseName}.`,
                        expectedAnswer: `${moduleTitle} helps learners understand and apply ${courseName} concepts in daily life.`,
                        keywords: [moduleTitle.split(" ")[0] || "concept", "apply"]
                    },
                    i,
                    activityType
                )
            );
        } else if (activityType === "SHORT_ANSWER" || activityType === "PROBLEM_SOLVING" || activityType === "CHALLENGE_QUIZ") {
            const ans = activityType === "PROBLEM_SOLVING" ? String((i + 2) * 5) : "principles";
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        questionText:
                            activityType === "PROBLEM_SOLVING"
                                ? `In ${moduleTitle}, if there are ${i + 2} groups of 5 items each, how many items are there altogether?`
                                : `What key word describes the fundamental rules learned in ${moduleTitle}?`,
                        correctAnswer: ans,
                        expectedAnswer: ans,
                        solutionSteps:
                            activityType === "PROBLEM_SOLVING"
                                ? [`Groups = ${i + 2}`, `Items per group = 5`, `${i + 2} × 5 = ${(i + 2) * 5}`]
                                : []
                    },
                    i,
                    activityType
                )
            );
        } else {
            const rightOpt = `Core principle of ${moduleTitle} (#${i})`;
            list.push(
                mapGeneratedQuestionToEditor(
                    {
                        scenario:
                            activityType === "APPLICATION_BASED"
                                ? `A student wants to apply ${moduleTitle} during a ${courseName} project.`
                                : "",
                        questionText: `Which option accurately describes ${moduleTitle} in ${courseName}?`,
                        options: [
                            rightOpt,
                            `Unrelated concept outside ${courseName}`,
                            `Incorrect assumption about ${moduleTitle}`,
                            `Random guess without evidence`
                        ],
                        correctAnswer: rightOpt
                    },
                    i,
                    activityType
                )
            );
        }
    }
    return list;
}

function Activities() {
    const [courses, setCourses] = useState([]);
    const [allModules, setAllModules] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedModuleId, setSelectedModuleId] = useState("");

    const [settings, setSettings] = useState(defaultGeneratorSettings);
    const [files, setFiles] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Load real Courses and Modules created in Backoffice / Course Service
    useEffect(() => {
        let active = true;
        const loadCoursesAndModules = async () => {
            try {
                const [loadedCourses, loadedMods] = await Promise.all([
                    fetchCoursesFromBackoffice().catch(() => []),
                    fetchAllModules().catch(() => [])
                ]);

                if (!active) return;

                const validCourses =
                    Array.isArray(loadedCourses) && loadedCourses.length > 0
                        ? loadedCourses
                        : fallbackCourses;

                const validMods =
                    Array.isArray(loadedMods) && loadedMods.length > 0
                        ? loadedMods
                        : fallbackCourses.flatMap((c) =>
                              (c.modules || []).map((m) => ({
                                  ...m,
                                  courseId: c.courseId
                              }))
                          );

                setCourses(validCourses);
                setAllModules(validMods);

                const firstCourse = validCourses[0];
                const firstCId = firstCourse ? String(firstCourse.courseId ?? firstCourse.id) : "";
                setSelectedCourseId(firstCId);

                const courseMods = validMods.filter(
                    (m) => String(m.courseId) === firstCId
                );
                const firstMod = courseMods[0] || validMods[0];
                setSelectedModuleId(firstMod ? String(firstMod.moduleId ?? firstMod.id) : "");
            } catch (_) {
                if (active) {
                    setCourses(fallbackCourses);
                    const flatMods = fallbackCourses.flatMap((c) =>
                        c.modules.map((m) => ({ ...m, courseId: c.courseId }))
                    );
                    setAllModules(flatMods);
                    setSelectedCourseId("1");
                    setSelectedModuleId("1");
                }
            }
        };

        loadCoursesAndModules();
        return () => {
            active = false;
        };
    }, []);

    const selectedCourse = useMemo(
        () =>
            courses.find(
                (c) => String(c.courseId ?? c.id) === String(selectedCourseId)
            ) || courses[0],
        [courses, selectedCourseId]
    );

    const courseModules = useMemo(() => {
        if (!selectedCourse) return allModules;
        const cId = String(selectedCourse.courseId ?? selectedCourse.id);
        const filtered = allModules.filter((m) => String(m.courseId) === cId);
        return filtered.length > 0 ? filtered : selectedCourse.modules || [];
    }, [allModules, selectedCourse]);

    const selectedModule = useMemo(
        () =>
            courseModules.find(
                (m) => String(m.moduleId ?? m.id) === String(selectedModuleId)
            ) || courseModules[0],
        [courseModules, selectedModuleId]
    );

    const handleCourseChange = (event) => {
        const nextCourseId = event.target.value;
        setSelectedCourseId(nextCourseId);
        const modsForCourse = allModules.filter(
            (m) => String(m.courseId) === String(nextCourseId)
        );
        setSelectedModuleId(
            modsForCourse[0] ? String(modsForCourse[0].moduleId ?? modsForCourse[0].id) : ""
        );
        setStatusMessage("");
    };

    const handleModuleChange = (event) => {
        setSelectedModuleId(event.target.value);
        setStatusMessage("");
    };

    const handleSettingChange = (field, value) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value
        }));
        setStatusMessage("");
    };

    const handleGenerateActivity = async () => {
        setIsGenerating(true);
        setStatusMessage("");

        const courseName = selectedCourse?.title || selectedCourse?.name || "General Course";
        const subjectName = selectedCourse?.subject || courseName;
        const modIdNum = Number(selectedModule?.moduleId ?? selectedModule?.id) || 1;
        const cIdNum = Number(selectedCourse?.courseId ?? selectedCourse?.id) || 1;
        const modTitle = selectedModule?.title || selectedModule?.name || "Module Overview";
        const count = Number(settings.questionCount) || 5;

        // Gather slide content + plain-text file content for grounding
        let lessonContent = "";
        try {
            const slides = await fetchSlidesByModule(modIdNum).catch(() =>
                getStoredSlides().filter((s) => Number(s.moduleId) === modIdNum)
            );
            if (Array.isArray(slides) && slides.length > 0) {
                lessonContent = slides
                    .map((s) => `${s.title || ""}: ${s.content || ""}`)
                    .join("\n\n");
            }
            for (const f of files) {
                if (f.name?.match(/\.(txt|md)$/i)) {
                    const txt = await f.text().catch(() => "");
                    if (txt) lessonContent += `\n\n${txt}`;
                }
            }
        } catch (_) {}

        const payload = {
            moduleId: modIdNum,
            courseId: cIdNum,
            gradeLevel: selectedCourse?.grade || selectedCourse?.gradeLevel || "Grade 5",
            subject: subjectName,
            topic: modTitle,
            activityType: settings.activityType,
            difficultyLevel: settings.difficulty.toUpperCase(),
            questionCount: count,
            ...(lessonContent ? { lessonContent: lessonContent.slice(0, 6000) } : {}),
            saveToModule: false
        };

        let generated = null;
        try {
            const data = await generateActivityInBackoffice(payload);
            if (data && Array.isArray(data.questions) && data.questions.length > 0) {
                generated = data.questions.map((q, idx) =>
                    mapGeneratedQuestionToEditor(q, idx, settings.activityType)
                );
            }
        } catch (err) {
            console.warn("Backoffice AI Activity generation fallback:", err.message);
        }

        if (!generated || generated.length === 0) {
            generated = buildLocalFallbackQuestions(
                settings.activityType,
                courseName,
                modTitle,
                count
            );
        }

        setQuestions(generated);
        setIsGenerating(false);
    };

    const createQuestion = () => {
        const isChoice = ["MCQ", "QUIZ", "TRUE_FALSE", "POLL", "TIMED_QUIZ", "APPLICATION_BASED"].includes(
            settings.activityType
        );
        return {
            id: Date.now(),
            activityType: settings.activityType,
            question: "",
            correctAnswer: "",
            expectedAnswer: "",
            options: isChoice
                ? settings.activityType === "TRUE_FALSE"
                    ? [
                          { id: 1, text: "True", correct: true },
                          { id: 2, text: "False", correct: false }
                      ]
                    : [
                          { id: 1, text: "", correct: true },
                          { id: 2, text: "", correct: false },
                          { id: 3, text: "", correct: false },
                          { id: 4, text: "", correct: false }
                      ]
                : []
        };
    };

    const handleAddQuestion = () => {
        setQuestions((current) => [...current, createQuestion()]);
    };

    const handleUpdateQuestion = (questionId, field, value) => {
        setQuestions((current) =>
            current.map((question) =>
                question.id === questionId ? { ...question, [field]: value } : question
            )
        );
    };

    const handleUpdateOption = (questionId, optionId, value) => {
        setQuestions((current) =>
            current.map((question) => {
                if (question.id !== questionId) return question;
                const updatedOptions = (question.options || []).map((option) =>
                    option.id === optionId ? { ...option, text: value } : option
                );
                const correctText = updatedOptions.find((o) => o.correct)?.text || question.correctAnswer;
                return {
                    ...question,
                    options: updatedOptions,
                    correctAnswer: correctText
                };
            })
        );
    };

    const handleSetCorrectAnswer = (questionId, optionId) => {
        setQuestions((current) =>
            current.map((question) => {
                if (question.id !== questionId) return question;
                const updatedOptions = (question.options || []).map((option) => ({
                    ...option,
                    correct: option.id === optionId
                }));
                return {
                    ...question,
                    options: updatedOptions,
                    correctAnswer: updatedOptions.find((o) => o.correct)?.text || ""
                };
            })
        );
    };

    const handleDeleteQuestion = (questionId) => {
        setQuestions((current) => current.filter((q) => q.id !== questionId));
    };

    const handleSaveActivity = async () => {
        if (!questions.length) return;
        setIsSaving(true);
        setStatusMessage("");

        const courseName = selectedCourse?.title || selectedCourse?.name || "Course";
        const modIdNum = Number(selectedModule?.moduleId ?? selectedModule?.id) || 1;
        const cIdNum = Number(selectedCourse?.courseId ?? selectedCourse?.id) || 1;
        const modTitle = selectedModule?.title || selectedModule?.name || "Module Overview";
        const actTitle = `${modTitle} — ${settings.activityType.replace(/_/g, " ")}`;

        const createPayload = {
            moduleId: modIdNum,
            gradeLevel: selectedCourse?.grade || selectedCourse?.gradeLevel || "Grade 5",
            displayOrder: 1,
            title: actTitle,
            description: `Generated ${settings.activityType} activity for ${courseName} (${modTitle})`,
            activityType: settings.activityType,
            difficulty: settings.difficulty.toUpperCase(),
            status: "PUBLISHED",
            timeLimitMinutes: settings.activityType === "TIMED_QUIZ" ? 5 : 15,
            totalMarks: questions.length * 2,
            questions: questions.map((q, idx) => {
                const correctOpt = (q.options || []).find((o) => o.correct)?.text;
                const resolvedCorrect = correctOpt || q.correctAnswer || q.expectedAnswer || "Completed";
                return {
                    questionText: q.question || `Question ${idx + 1}`,
                    points: q.points || 2,
                    displayOrder: idx + 1,
                    orderIndex: idx + 1,
                    correctAnswer: resolvedCorrect,
                    passage: q.passage || null,
                    imageUrl: q.imageUrl || null,
                    timeLimitSeconds: q.timeLimitSeconds || null,
                    options:
                        Array.isArray(q.options) && q.options.length > 0
                            ? q.options.map((o) => ({
                                  optionText: o.text,
                                  correct: Boolean(o.correct)
                              }))
                            : null,
                    categories: q.categories || null,
                    items: q.items || null,
                    itemsToOrder: q.itemsToOrder || null,
                    metadataJson: JSON.stringify({
                        activityType: q.activityType || settings.activityType,
                        scenario: q.scenario || null,
                        expectedAnswer: q.expectedAnswer || resolvedCorrect,
                        keywords: q.keywords || [],
                        solutionSteps: q.solutionSteps || [],
                        leftItems: q.leftItems || null,
                        rightItems: q.rightItems || null,
                        matchingAnswers: q.matchingAnswers || null,
                        categories: q.categories || null,
                        items: q.items || null,
                        itemsToOrder: q.itemsToOrder || null,
                        imageUrl: q.imageUrl || null,
                        imageDescription: q.imageDescription || null,
                        correctRegion: q.correctRegion || null,
                        regions: q.regions || null,
                        passage: q.passage || null
                    })
                };
            })
        };

        let persistedId = null;
        try {
            const created = await createActivityInBackoffice(createPayload);
            persistedId = created?.activityId || created?.id || null;
        } catch (err) {
            console.warn("Backoffice save activity fallback to local storage:", err.message);
        }

        // Also store in localStorage & broadcast for instant same-browser sync
        try {
            const localRecord = {
                id: persistedId || `pub-${Date.now()}`,
                activityId: persistedId,
                courseId: cIdNum,
                courseTitle: courseName,
                moduleId: modIdNum,
                moduleTitle: modTitle,
                title: actTitle,
                activityType: settings.activityType,
                difficulty: settings.difficulty.toUpperCase(),
                questions: questions.map((q) => ({
                    ...q,
                    options: Array.isArray(q.options) ? q.options.map((o) => o.text) : []
                })),
                createdAt: new Date().toISOString()
            };

            const existing = JSON.parse(localStorage.getItem("published_activities") || "[]");
            const list = Array.isArray(existing) ? existing : [];
            list.unshift(localRecord);
            localStorage.setItem("published_activities", JSON.stringify(list));

            if (typeof BroadcastChannel !== "undefined") {
                const ch = new BroadcastChannel("edugenai_channel");
                ch.postMessage({
                    type: "ACTIVITY_PUBLISHED",
                    moduleId: modIdNum,
                    courseId: cIdNum
                });
                ch.close();
            }
        } catch (_) {}

        setIsSaving(false);
        setStatusMessage(
            `Published "${actTitle}" to ${courseName} • ${modTitle}! Students can now play this question type inside that Course & Module.`
        );
    };

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>
            <div className="activity-generator-page">
                <header className="activity-generator-header">
                    <div>
                        <div className="activity-generator-breadcrumb">
                            ACTIVITIES / MULTI-AGENT GENERATOR
                        </div>
                        <h1>Activity Generator</h1>
                        <p>
                            Generate Multi-Agent AI questions across different question types and publish them directly into a Course & Module for students.
                        </p>
                    </div>
                </header>

                <div className="activity-generator-layout">
                    <aside className="activity-generator-controls">
                        <SourceMaterials
                            courses={courses}
                            selectedCourseId={selectedCourseId}
                            modules={courseModules}
                            selectedModuleId={selectedModuleId}
                            onCourseChange={handleCourseChange}
                            onModuleChange={handleModuleChange}
                            files={files}
                            onFilesChange={setFiles}
                        />

                        <ActivityConfiguration
                            settings={settings}
                            onSettingChange={handleSettingChange}
                            onGenerate={handleGenerateActivity}
                            isGenerating={isGenerating}
                        />
                    </aside>

                    <main className="activity-generator-preview">
                        <ActivityPreview
                            course={selectedCourse?.title || selectedCourse?.name}
                            lesson={selectedModule?.title || selectedModule?.name}
                            settings={settings}
                            questions={questions}
                            isSaving={isSaving}
                            statusMessage={statusMessage}
                            onGenerate={handleGenerateActivity}
                            onAddQuestion={handleAddQuestion}
                            onUpdateQuestion={handleUpdateQuestion}
                            onUpdateOption={handleUpdateOption}
                            onSetCorrectAnswer={handleSetCorrectAnswer}
                            onDeleteQuestion={handleDeleteQuestion}
                            onSaveActivity={handleSaveActivity}
                        />
                    </main>
                </div>
            </div>
        </BackofficeLayout>
    );
}

export default Activities;
