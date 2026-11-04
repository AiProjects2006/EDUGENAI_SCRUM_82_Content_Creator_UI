import {
    ArrowLeft,
    BookOpen,
    Pencil,
    Users,
    CheckCircle,
    GraduationCap,
    FileText,
    Plus,
    Edit,
    Trash2,
    Presentation,
    ChevronDown,
    ChevronUp,
    Sparkles,
    FolderKanban,
    ExternalLink
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import BackofficeLayout from "../../../../components/layout/BackofficeLayout";
import CreatorSidebar from "../../../../components/layout/Sidebar/CreatorSidebar";

import { getCourses } from "../data/courseData";
import { fetchCourseModules, createModuleAPI, deleteModuleAPI, updateModuleAPI, deduplicateModules } from "../../../../services/moduleService";
import { createSlideAPI, getStoredSlides, deleteSlideAPI } from "../../../../services/slideService";
import { fetchCourseByIdFromBackoffice } from "../../../../services/backofficeService";

import "./CourseDetails.css";

function CourseDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const courses = getCourses();
    const [modules, setModules] = useState([]);
    const [slides, setSlides] = useState([]);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
    const [editingModule, setEditingModule] = useState(null);
    const [loading, setLoading] = useState(false);

    // Slide creation inline state
    const [expandedModuleId, setExpandedModuleId] = useState(null);
    const [showSlideForm, setShowSlideForm] = useState(false);
    const [targetModuleForSlide, setTargetModuleForSlide] = useState(null);
    const [slideForm, setSlideForm] = useState({
        title: '',
        content: '',
        fact: '',
        icon: 'twemoji:light-bulb'
    });

    const [course, setCourse] = useState(() => {
        return courses.find(
            (item) => String(item.id) === String(id) || String(item.courseId) === String(id)
        ) || null;
    });

    useEffect(() => {
        let active = true;
        fetchCourseByIdFromBackoffice(id)
            .then(res => {
                if (active && res) {
                    setCourse(res);
                }
            })
            .catch(() => {});
        return () => { active = false; };
    }, [id]);

    useEffect(() => {
        if (course) {
            loadModules();
        }
    }, [course]);

    const loadModules = async () => {
        try {
            const data = await fetchCourseModules(course.id);
            setModules(deduplicateModules(Array.isArray(data) ? data : []));
            setSlides(getStoredSlides());
        } catch (e) {
            console.error('Failed loading modules:', e);
        }
    };

    const handleAddModule = async () => {
        if (loading) return;
        if (!moduleForm.title.trim()) {
            alert('Please enter module title');
            return;
        }

        setLoading(true);
        try {
            const courseTitle = course.name || course.title || '';
            const savedModule = await createModuleAPI(moduleForm.title, moduleForm.description, course.id, courseTitle);
            setModules(prev => {
                const exists = prev.some(
                    m => Number(m.moduleId || m.id) === Number(savedModule.moduleId || savedModule.id) ||
                        (m.title || m.name || '').trim().toLowerCase() === savedModule.title.trim().toLowerCase()
                );
                const updated = exists
                    ? prev.map(m =>
                        Number(m.moduleId || m.id) === Number(savedModule.moduleId || savedModule.id) ||
                        (m.title || m.name || '').trim().toLowerCase() === savedModule.title.trim().toLowerCase()
                            ? savedModule
                            : m
                    )
                    : [...prev, savedModule];
                return deduplicateModules(updated);
            });
            setModuleForm({ title: '', description: '' });
            setShowModuleForm(false);
            alert('Module saved successfully!');
        } catch (e) {
            alert('Failed to save module: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateModule = async () => {
        if (loading) return;
        if (!moduleForm.title.trim() || !editingModule) {
            alert('Please enter module title');
            return;
        }

        setLoading(true);
        try {
            const updated = await updateModuleAPI(editingModule.moduleId, moduleForm.title, moduleForm.description);
            setModules(prev => deduplicateModules(prev.map(m => m.moduleId === editingModule.moduleId ? updated : m)));
            setModuleForm({ title: '', description: '' });
            setEditingModule(null);
            setShowModuleForm(false);
            alert('Module updated successfully!');
        } catch (e) {
            alert('Failed to update module: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return;

        setLoading(true);
        try {
            await deleteModuleAPI(moduleId);
            setModules(modules.filter(m => m.moduleId !== moduleId));
            alert('Module deleted successfully!');
        } catch (e) {
            alert('Failed to delete module: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditModule = (module) => {
        setEditingModule(module);
        setModuleForm({ title: module.title, description: module.description || '' });
        setShowModuleForm(true);
    };

    const handleCloseForm = () => {
        setShowModuleForm(false);
        setEditingModule(null);
        setModuleForm({ title: '', description: '' });
    };

    const handleOpenAddSlide = (moduleId) => {
        setTargetModuleForSlide(moduleId);
        setSlideForm({ title: '', content: '', fact: '', icon: 'twemoji:light-bulb' });
        setShowSlideForm(true);
    };

    const handleSaveSlide = async (e) => {
        e.preventDefault();
        if (!slideForm.title.trim()) {
            alert('Please enter slide title');
            return;
        }

        setLoading(true);
        try {
            const targetMod = modules.find(m => Number(m.moduleId || m.id) === Number(targetModuleForSlide));
            await createSlideAPI({
                moduleId: targetModuleForSlide,
                moduleTitle: targetMod?.title || '',
                courseId: course.id || course.courseId,
                courseTitle: course.name || course.title || '',
                title: slideForm.title,
                content: slideForm.content,
                fact: slideForm.fact,
                icon: slideForm.icon
            });
            setSlides(getStoredSlides());
            setShowSlideForm(false);
            setExpandedModuleId(targetModuleForSlide);
            alert('Slide created successfully!');
        } catch (err) {
            alert('Failed to create slide: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlide = async (slideId) => {
        if (!window.confirm('Are you sure you want to delete this slide?')) return;
        setLoading(true);
        try {
            await deleteSlideAPI(slideId);
            setSlides(getStoredSlides());
            alert('Slide deleted!');
        } catch (err) {
            alert('Failed to delete slide: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!course) {
        return (
            <BackofficeLayout sidebar={<CreatorSidebar />}>

                <div className="course-not-found">

                    <h1>Course Not Found</h1>

                    <p>
                        The course you are looking for does not exist.
                    </p>

                    <button
                        onClick={() => navigate("/course-management")}
                    >
                        Back to Course Management
                    </button>

                </div>

            </BackofficeLayout>
        );
    }

    return (
        <BackofficeLayout sidebar={<CreatorSidebar />}>

            <div className="course-details-page">

                {/* Back Button */}

                <button
                    className="back-course-btn"
                    onClick={() => navigate("/course-management")}
                >
                    <ArrowLeft size={17} />
                    Back to Course Management
                </button>


                {/* Header */}

                <div className="course-details-header">

                    <div className="course-details-heading">

                        <span className="course-details-label">
                            COURSE DETAILS
                        </span>

                        <h1>
                            {course.name}
                        </h1>

                        <p>
                            {course.description ||
                                "No course description has been added yet."}
                        </p>

                    </div>

                    <button
                        className="edit-course-details-btn"
                        onClick={() =>
                            navigate(`/edit-course/${course.id}`)
                        }
                    >
                        <Pencil size={16} />
                        Edit Course
                    </button>

                </div>


                {/* Course Information */}

                <div className="course-details-grid">

                    <div className="course-detail-card">

                        <div className="course-detail-card-title">
                            <BookOpen size={18} />
                            Course Information
                        </div>

                        <div className="course-detail-row">
                            <span>Course Name</span>
                            <strong>{course.name}</strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Subject</span>
                            <strong>{course.subject}</strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Grade Level</span>
                            <strong>
                                {course.gradeLevel || "Not specified"}
                            </strong>
                        </div>

                        <div className="course-detail-row">
                            <span>Author</span>
                            <strong>{course.author}</strong>
                        </div>

                    </div>


                    {/* Course Status */}

                    <div className="course-detail-card">

                        <div className="course-detail-card-title">
                            <CheckCircle size={18} />
                            Course Status
                        </div>

                        <div className="course-status-container">

                            <span
                                className={`course-status-large ${course.status.toLowerCase()}`}
                            >
                                {course.status}
                            </span>

                        </div>

                        <div className="course-stat-list">

                            <div className="course-stat-item">

                                <Users size={18} />

                                <div>
                                    <span>Enrollments</span>
                                    <strong>
                                        {course.enrollments}
                                    </strong>
                                </div>

                            </div>

                            <div className="course-stat-item">

                                <GraduationCap size={18} />

                                <div>
                                    <span>Completion</span>
                                    <strong>
                                        {course.completion}
                                    </strong>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* Description */}

                <div className="course-description-card">

                    <div className="course-detail-card-title">
                        <FileText size={18} />
                        Course Description
                    </div>

                    <p>
                        {course.description ||
                            "No course description has been added yet."}
                    </p>

                </div>


                {/* Learning Objectives */}

                <div className="course-description-card">

                    <div className="course-detail-card-title">
                        <GraduationCap size={18} />
                        Learning Objectives
                    </div>

                    <p>
                        {course.objectives ||
                            "No learning objectives have been added yet."}
                    </p>

                </div>


                {/* Google Drive Course Content */}
                {course.contentPdfUrl && (
                    <div className="course-description-card" style={{ border: '1px solid #D8B4FE', background: '#FAF5FF' }}>
                        <div className="course-detail-card-title" style={{ color: '#6B21A8' }}>
                            <FolderKanban size={18} />
                            Google Drive Course Content
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={20} color="#7200A8" />
                                <div>
                                    <strong style={{ display: 'block', fontSize: '14px', color: '#1F2937' }}>
                                        {course.contentPdfName || 'Course Content Material'}
                                    </strong>
                                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                                        Educational Content / {course.subject} / {course.gradeLevel || course.grade}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={course.contentPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="drive-view-btn"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#7200A8', color: '#FFFFFF', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
                            >
                                <ExternalLink size={15} />
                                View on Google Drive
                            </a>
                        </div>
                    </div>
                )}

                {/* Modules Section */}

                <div className="course-modules-section">

                    <div className="modules-section-header">
                        <div className="section-title">
                            <BookOpen size={18} />
                            Course Modules & Slides
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className="add-module-btn"
                                style={{ background: '#f5f3ff', color: '#6D28D9', border: '1px solid #d8b4fe' }}
                                onClick={() => navigate('/module-management')}
                            >
                                <Presentation size={15} />
                                Open Module Dashboard
                            </button>
                            <button 
                                className="add-module-btn"
                                onClick={() => setShowModuleForm(true)}
                                disabled={loading}
                            >
                                <Plus size={16} />
                                Add Module
                            </button>
                        </div>
                    </div>

                    {/* Module Form Modal */}
                    {showModuleForm && (
                        <div className="module-form-overlay">
                            <div className="module-form-modal">
                                <div className="modal-header">
                                    <h3>{editingModule ? 'Edit Module' : 'Create New Module'}</h3>
                                    <button className="close-btn" onClick={handleCloseForm}>✕</button>
                                </div>

                                <div className="form-group">
                                    <label>Module Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter module title"
                                        value={moduleForm.title}
                                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Enter module description (optional)"
                                        rows={3}
                                        value={moduleForm.description}
                                        onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button 
                                        className="btn-cancel"
                                        onClick={handleCloseForm}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn-submit"
                                        onClick={editingModule ? handleUpdateModule : handleAddModule}
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : (editingModule ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Slide Form Modal */}
                    {showSlideForm && (
                        <div className="module-form-overlay">
                            <div className="module-form-modal">
                                <div className="modal-header">
                                    <h3>Add Slide to Module</h3>
                                    <button className="close-btn" onClick={() => setShowSlideForm(false)}>✕</button>
                                </div>

                                <form onSubmit={handleSaveSlide}>
                                    <div className="form-group">
                                        <label>Slide Title *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Key Concept or Chapter Overview"
                                            value={slideForm.title}
                                            onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Content / Notes *</label>
                                        <textarea
                                            placeholder="Enter educational explanation for students..."
                                            rows={3}
                                            value={slideForm.content}
                                            onChange={(e) => setSlideForm({ ...slideForm, content: e.target.value })}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Fun Fact / Bubbles Mascot Note</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Did you know that...?"
                                            value={slideForm.fact}
                                            onChange={(e) => setSlideForm({ ...slideForm, fact: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button 
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => setShowSlideForm(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="btn-submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Add Slide'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modules List */}
                    {modules.length === 0 ? (
                        <div className="empty-modules">
                            <BookOpen size={32} />
                            <p>No modules created yet</p>
                            <button 
                                className="add-module-btn"
                                onClick={() => setShowModuleForm(true)}
                                disabled={loading}
                            >
                                <Plus size={16} />
                                Create First Module
                            </button>
                        </div>
                    ) : (
                        <div className="modules-list">
                            {modules.map(module => {
                                const modSlides = slides.filter(s => Number(s.moduleId) === Number(module.moduleId));
                                const isExpanded = expandedModuleId === module.moduleId;

                                return (
                                    <div key={module.moduleId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div className="module-item">
                                            <div className="module-info">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <h4>{module.title}</h4>
                                                    <span style={{ fontSize: '11px', background: '#ede9fe', color: '#5b21b6', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                                        {modSlides.length} {modSlides.length === 1 ? 'Slide' : 'Slides'}
                                                    </span>
                                                </div>
                                                {module.description && <p>{module.description}</p>}
                                            </div>

                                            <div className="module-item-actions">
                                                <button
                                                    type="button"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f5f3ff', border: '1px solid #d8b4fe', color: '#6D28D9', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                    onClick={() => handleOpenAddSlide(module.moduleId)}
                                                    title="Add Slide to this module"
                                                >
                                                    <Plus size={13} /> Add Slide
                                                </button>

                                                <button
                                                    type="button"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#faf5ff', border: '1px solid #eadcf3', color: '#5b21b6', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                    onClick={() => setExpandedModuleId(isExpanded ? null : module.moduleId)}
                                                    title="Toggle slides"
                                                >
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>

                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEditModule(module)}
                                                    title="Edit Module"
                                                    disabled={loading}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteModule(module.moduleId)}
                                                    title="Delete Module"
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Inline Slides Drawer */}
                                        {isExpanded && (
                                            <div style={{ background: '#faf8fd', border: '1px solid #eadcf3', borderRadius: '10px', padding: '14px 18px', marginLeft: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#43135f' }}>
                                                        Module Slides ({modSlides.length})
                                                    </span>
                                                    <button
                                                        type="button"
                                                        style={{ background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                                                        onClick={() => handleOpenAddSlide(module.moduleId)}
                                                    >
                                                        + Add Slide
                                                    </button>
                                                </div>

                                                {modSlides.length === 0 ? (
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#8b7892' }}>No slides in this module yet.</p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {modSlides.map((slide, sIdx) => (
                                                            <div key={slide.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #eadcf3', borderRadius: '8px', padding: '8px 12px' }}>
                                                                <div>
                                                                    <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#2d1a3d' }}>
                                                                        Slide {sIdx + 1}: {slide.title}
                                                                    </div>
                                                                    <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
                                                                        {slide.content?.substring(0, 70)}...
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}
                                                                    onClick={() => handleDeleteSlide(slide.id)}
                                                                    title="Delete Slide"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>

            </div>

        </BackofficeLayout>
    );
}

export default CourseDetails;