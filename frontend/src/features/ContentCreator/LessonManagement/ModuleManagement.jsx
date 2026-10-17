import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Search,
  Layers,
  FileText,
  UploadCloud,
  Eye,
  CheckCircle,
  Sparkles,
  Presentation,
  X
} from 'lucide-react';
import BackofficeLayout from '../../../components/layout/BackofficeLayout';
import CreatorSidebar from '../../../components/layout/Sidebar/CreatorSidebar';
import { fetchCoursesFromBackoffice } from '../../../services/backofficeService';
import {
  fetchAllModules,
  createModuleAPI,
  updateModuleAPI,
  deleteModuleAPI,
  deduplicateModules
} from '../../../services/moduleService';
import {
  fetchSlidesByModule,
  createSlideAPI,
  updateSlideAPI,
  deleteSlideAPI,
  getStoredSlides
} from '../../../services/slideService';
import './ModuleManagement.css';

const AVAILABLE_ICONS = [
  { id: 'twemoji:triangular-ruler', label: 'Math / Geometry', emoji: '📐' },
  { id: 'twemoji:light-bulb', label: 'Concept / Idea', emoji: '💡' },
  { id: 'twemoji:tropical-fish', label: 'Science / Nature', emoji: '🐠' },
  { id: 'twemoji:laptop', label: 'Technology / ICT', emoji: '💻' },
  { id: 'twemoji:open-book', label: 'Reading / Notes', emoji: '📖' },
  { id: 'twemoji:star', label: 'Key Highlight', emoji: '⭐' },
  { id: 'twemoji:sparkles', label: 'Fun Fact', emoji: '✨' },
  { id: 'twemoji:stop-button', label: 'Square / Shape', emoji: '⏹️' },
  { id: 'twemoji:hollow-red-circle', label: 'Circle', emoji: '⭕' }
];

function ModuleManagement() {
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [slides, setSlides] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);

  // Module Modal state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // Slide Modal state
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState(null);
  const [slideTargetModuleId, setSlideTargetModuleId] = useState(null);
  const [slideForm, setSlideForm] = useState({
    title: '',
    content: '',
    fact: '',
    icon: 'twemoji:light-bulb',
    file: null
  });

  // Slide Preview Modal state
  const [previewSlide, setPreviewSlide] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [coursesData, modulesData] = await Promise.all([
        fetchCoursesFromBackoffice().catch(() => []),
        fetchAllModules().catch(() => [])
      ]);

      if (Array.isArray(coursesData) && coursesData.length > 0) {
        setCourses(coursesData);
        setSelectedCourse(String(coursesData[0].id));
      }

      const safeModules = deduplicateModules(Array.isArray(modulesData) ? modulesData : []);
      setModules(safeModules);

      // Auto-expand the first module
      if (safeModules.length > 0) {
        setExpandedModules({ [safeModules[0].moduleId]: true });
      }

      // Load all stored slides
      setSlides(getStoredSlides());
    } catch (err) {
      console.error('Failed loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSlides = () => {
    setSlides(getStoredSlides());
  };

  // Filter modules for selected course and search query
  const filteredModules = useMemo(() => {
    if (!selectedCourse) return [];
    return modules.filter((m) => {
      const matchCourse = Number(m.courseId) === Number(selectedCourse);
      const matchQuery =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCourse && matchQuery;
    });
  }, [modules, selectedCourse, searchQuery]);

  // Slides mapped by moduleId
  const slidesByModule = useMemo(() => {
    const map = {};
    for (const s of slides) {
      const mId = Number(s.moduleId);
      if (!map[mId]) map[mId] = [];
      map[mId].push(s);
    }
    return map;
  }, [slides]);

  const totalCourseSlides = useMemo(() => {
    return filteredModules.reduce((acc, m) => {
      const count = slidesByModule[Number(m.moduleId)]?.length || 0;
      return acc + count;
    }, 0);
  }, [filteredModules, slidesByModule]);

  const selectedCourseObj = courses.find((c) => String(c.id) === String(selectedCourse));

  // Toggle module expansion
  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Module CRUD handlers
  const handleOpenCreateModule = () => {
    setEditingModuleId(null);
    setModuleForm({ title: '', description: '' });
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (module) => {
    setEditingModuleId(module.moduleId);
    setModuleForm({ title: module.title, description: module.description || '' });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!moduleForm.title.trim() || !selectedCourse) {
      alert('Please enter a module title and select a course.');
      return;
    }

    setLoading(true);
    try {
      if (editingModuleId) {
        const updated = await updateModuleAPI(
          editingModuleId,
          moduleForm.title,
          moduleForm.description
        );
        setModules((prev) =>
          deduplicateModules(prev.map((m) => (m.moduleId === editingModuleId ? updated : m)))
        );
        alert('Module updated successfully!');
      } else {
        const savedModule = await createModuleAPI(
          moduleForm.title,
          moduleForm.description,
          selectedCourse
        );
        setModules((prev) => {
          const exists = prev.some(
            (m) =>
              Number(m.moduleId || m.id) === Number(savedModule.moduleId || savedModule.id) ||
              (Number(m.courseId) === Number(selectedCourse) &&
                (m.title || m.name || '').trim().toLowerCase() === savedModule.title.trim().toLowerCase())
          );
          const updated = exists
            ? prev.map((m) =>
                Number(m.moduleId || m.id) === Number(savedModule.moduleId || savedModule.id) ||
                (Number(m.courseId) === Number(selectedCourse) &&
                  (m.title || m.name || '').trim().toLowerCase() === savedModule.title.trim().toLowerCase())
                  ? savedModule
                  : m
              )
            : [...prev, savedModule];
          return deduplicateModules(updated);
        });
        // Expand the module
        setExpandedModules((prev) => ({ ...prev, [savedModule.moduleId || savedModule.id]: true }));
        alert('Module saved successfully!');
      }
      setShowModuleModal(false);
      setModuleForm({ title: '', description: '' });
      setEditingModuleId(null);
    } catch (err) {
      alert('Error saving module: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module and its associated slides?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteModuleAPI(moduleId);
      setModules((prev) => prev.filter((m) => m.moduleId !== moduleId));
      alert('Module deleted successfully!');
    } catch (err) {
      alert('Error deleting module: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Slide CRUD handlers
  const handleOpenAddSlide = (moduleId) => {
    setEditingSlideId(null);
    setSlideTargetModuleId(moduleId);
    setSlideForm({
      title: '',
      content: '',
      fact: '',
      icon: 'twemoji:light-bulb',
      file: null
    });
    setShowSlideModal(true);
  };

  const handleOpenEditSlide = (slide) => {
    setEditingSlideId(slide.id);
    setSlideTargetModuleId(slide.moduleId);
    setSlideForm({
      title: slide.title,
      content: slide.content || '',
      fact: slide.fact || '',
      icon: slide.icon || 'twemoji:light-bulb',
      file: slide.file || null
    });
    setShowSlideModal(true);
  };

  const handleSlideFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.');
      return;
    }

    // Create a local blob URL for preview/download
    const fileUrl = URL.createObjectURL(file);
    setSlideForm((prev) => ({
      ...prev,
      file: {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type,
        url: fileUrl
      }
    }));
  };

  const handleSaveSlide = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!slideForm.title.trim()) {
      alert('Please enter a slide title.');
      return;
    }

    setLoading(true);
    try {
      if (editingSlideId) {
        await updateSlideAPI(editingSlideId, {
          moduleId: slideTargetModuleId,
          title: slideForm.title,
          content: slideForm.content,
          fact: slideForm.fact,
          icon: slideForm.icon,
          file: slideForm.file
        });
        alert('Slide updated successfully!');
      } else {
        await createSlideAPI({
          moduleId: slideTargetModuleId,
          courseId: selectedCourse,
          title: slideForm.title,
          content: slideForm.content,
          fact: slideForm.fact,
          icon: slideForm.icon,
          file: slideForm.file,
          sortOrder: (slidesByModule[slideTargetModuleId]?.length || 0) + 1
        });
        // Make sure module is expanded so new slide is visible
        setExpandedModules((prev) => ({ ...prev, [slideTargetModuleId]: true }));
        alert('Slide added to module successfully!');
      }
      refreshSlides();
      setShowSlideModal(false);
    } catch (err) {
      alert('Error saving slide: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    setLoading(true);
    try {
      await deleteSlideAPI(slideId);
      refreshSlides();
      alert('Slide removed successfully!');
    } catch (err) {
      alert('Error deleting slide: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEmojiForIcon = (iconName) => {
    const found = AVAILABLE_ICONS.find((i) => i.id === iconName);
    return found ? found.emoji : '📖';
  };

  return (
    <BackofficeLayout sidebar={<CreatorSidebar />}>
      <div className="module-management-page">
        {/* Page Header */}
        <div className="module-page-header">
          <div className="module-page-header-text">
            <h1>Module & Slide Management</h1>
            <p>
              Design structured course modules and create interactive slides for students
              (Grades 3-9). Added slides and materials will immediately appear in the
              Student Portal course view.
            </p>
          </div>

          <div className="module-header-actions">
            <button
              className="btn-primary-purple"
              onClick={handleOpenCreateModule}
              disabled={!selectedCourse || loading}
            >
              <Plus size={18} />
              Create New Module
            </button>
          </div>
        </div>

        {/* Control & Filter Bar */}
        <div className="module-control-bar">
          <div className="module-control-left">
            <div className="course-select-wrapper">
              <span className="course-select-label">Course:</span>
              <div className="course-select-box">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={courses.length === 0}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title || c.name} ({c.status || 'Active'})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="course-select-icon" />
              </div>
            </div>

            <div className="search-module-input">
              <Search size={15} className="search-module-icon" />
              <input
                type="text"
                placeholder="Search modules or slides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="module-control-stats">
            <div className="stat-chip">
              <Layers size={14} />
              <span>{filteredModules.length} Modules</span>
            </div>
            <div className="stat-chip slides-chip">
              <Presentation size={14} />
              <span>{totalCourseSlides} Slides</span>
            </div>
          </div>
        </div>

        {/* Main Content: Modules List */}
        {selectedCourse && filteredModules.length > 0 && (
          <div className="modules-list-container">
            {filteredModules.map((module, index) => {
              const moduleSlides = slidesByModule[Number(module.moduleId)] || [];
              const isExpanded = !!expandedModules[module.moduleId];

              return (
                <div key={module.moduleId} className="module-main-card">
                  {/* Module Header Row */}
                  <div className="module-card-header">
                    <div className="module-card-left">
                      <div className="module-badge-icon">
                        <BookOpen size={22} />
                      </div>

                      <div className="module-info-wrap">
                        <div className="module-tag-row">
                          <span className="module-index-badge">
                            MODULE {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="module-slides-count-badge">
                            <Presentation size={12} />
                            {moduleSlides.length} {moduleSlides.length === 1 ? 'Slide' : 'Slides'}
                          </span>
                        </div>

                        <h3 className="module-title-text">{module.title}</h3>

                        {module.description && (
                          <p className="module-desc-text">{module.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="module-card-actions">
                      <button
                        className="btn-add-slide-small"
                        onClick={() => handleOpenAddSlide(module.moduleId)}
                        title="Add interactive slide to this module"
                      >
                        <Plus size={14} />
                        Add Slide
                      </button>

                      <button
                        className="icon-action-btn"
                        onClick={() => handleOpenEditModule(module)}
                        title="Edit Module Details"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="icon-action-btn delete"
                        onClick={() => handleDeleteModule(module.moduleId)}
                        title="Delete Module"
                      >
                        <Trash2 size={15} />
                      </button>

                      <button
                        className="btn-toggle-slides"
                        onClick={() => toggleModuleExpand(module.moduleId)}
                      >
                        {isExpanded ? (
                          <>
                            Hide Slides <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            View Slides <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Module Slides Drawer (Accordion) */}
                  {isExpanded && (
                    <div className="module-slides-drawer">
                      <div className="drawer-header">
                        <span className="drawer-title">
                          <Presentation size={16} />
                          Interactive Learning Slides ({moduleSlides.length})
                        </span>
                        <button
                          className="btn-add-slide-small"
                          onClick={() => handleOpenAddSlide(module.moduleId)}
                        >
                          <Plus size={13} /> Add Slide
                        </button>
                      </div>

                      {moduleSlides.length === 0 ? (
                        <div className="empty-slides-box">
                          <Presentation size={36} color="#d8b4fe" />
                          <p>
                            No slides added to this module yet. Students will see an empty
                            module state until slides or learning materials are added.
                          </p>
                          <button
                            className="btn-primary-purple"
                            style={{ margin: '0 auto', fontSize: '13px', padding: '8px 16px' }}
                            onClick={() => handleOpenAddSlide(module.moduleId)}
                          >
                            <Plus size={14} /> Create First Slide
                          </button>
                        </div>
                      ) : (
                        <div className="slides-grid">
                          {moduleSlides.map((slide, sIdx) => (
                            <div key={slide.id} className="slide-item-card">
                              <div>
                                <div className="slide-item-top">
                                  <span className="slide-badge">Slide {sIdx + 1}</span>
                                  <span className="slide-icon-preview">
                                    {getEmojiForIcon(slide.icon)}
                                  </span>
                                </div>

                                <h4 className="slide-item-title">{slide.title}</h4>
                                <p className="slide-item-content">{slide.content}</p>

                                {slide.fact && (
                                  <div className="slide-mascot-pill">
                                    <Sparkles size={14} style={{ flexShrink: 0 }} />
                                    <span>
                                      <strong>Fact:</strong> {slide.fact}
                                    </span>
                                  </div>
                                )}

                                {slide.file && (
                                  <div className="slide-file-chip">
                                    <FileText size={13} />
                                    <span>{slide.file.name}</span>
                                  </div>
                                )}
                              </div>

                              <div className="slide-item-footer">
                                <button
                                  className="slide-btn-small slide-btn-preview"
                                  onClick={() => setPreviewSlide(slide)}
                                  title="Preview how students view this slide"
                                >
                                  <Eye size={12} /> Preview
                                </button>

                                <div className="slide-footer-actions">
                                  <button
                                    className="slide-btn-small slide-btn-edit"
                                    onClick={() => handleOpenEditSlide(slide)}
                                    title="Edit Slide"
                                  >
                                    <Pencil size={12} /> Edit
                                  </button>
                                  <button
                                    className="slide-btn-small slide-btn-delete"
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    title="Delete Slide"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
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

        {/* Empty state: No modules found */}
        {selectedCourse && filteredModules.length === 0 && (
          <div className="empty-page-state">
            <div className="empty-icon-wrap">
              <BookOpen size={32} />
            </div>
            <h3>No Modules in this Course</h3>
            <p>
              {selectedCourseObj
                ? `Course "${selectedCourseObj.title || selectedCourseObj.name}" has no modules yet.`
                : 'Create your first module to begin structuring lessons and slides.'}
            </p>
            <button
              className="btn-primary-purple"
              style={{ margin: '0 auto' }}
              onClick={handleOpenCreateModule}
            >
              <Plus size={16} /> Create First Module
            </button>
          </div>
        )}

        {/* Empty state: No course selected */}
        {!selectedCourse && (
          <div className="empty-page-state">
            <div className="empty-icon-wrap">
              <Layers size={32} />
            </div>
            <h3>Please Select a Course</h3>
            <p>Select a course from the dropdown above to view, create, and organize its modules.</p>
          </div>
        )}

        {/* MODAL 1: Create / Edit Module */}
        {showModuleModal && (
          <div className="module-modal-overlay" onClick={() => setShowModuleModal(false)}>
            <div className="module-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h2>{editingModuleId ? 'Edit Module Details' : 'Create New Course Module'}</h2>
                <button className="modal-close-btn" onClick={() => setShowModuleModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveModule}>
                <div className="form-field-group">
                  <label>Course</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Module Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Points, Lines, and Angles"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what students will learn in this module..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowModuleModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-purple" disabled={loading}>
                    {loading ? 'Saving...' : editingModuleId ? 'Save Changes' : 'Create Module'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Add / Edit Slide */}
        {showSlideModal && (
          <div className="module-modal-overlay" onClick={() => setShowSlideModal(false)}>
            <div className="module-modal-content wide" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h2>
                  {editingSlideId ? 'Edit Learning Slide' : 'Add New Slide to Module'}
                </h2>
                <button className="modal-close-btn" onClick={() => setShowSlideModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSlide}>
                <div className="form-field-group">
                  <label>Slide Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. What is a Triangle?"
                    value={slideForm.title}
                    onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Concept / Educational Explanation *</label>
                  <textarea
                    rows={4}
                    placeholder="Explain the key concept clearly for students with examples..."
                    value={slideForm.content}
                    onChange={(e) => setSlideForm({ ...slideForm, content: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Fun Fact / Bubbles Mascot Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Did you know the starfish is shaped like 5 triangles put together?"
                    value={slideForm.fact}
                    onChange={(e) => setSlideForm({ ...slideForm, fact: e.target.value })}
                  />
                </div>

                <div className="form-field-group">
                  <label>Slide Icon</label>
                  <div className="icon-pills-row">
                    {AVAILABLE_ICONS.map((icon) => (
                      <button
                        key={icon.id}
                        type="button"
                        className={`icon-pill-btn ${slideForm.icon === icon.id ? 'active' : ''}`}
                        onClick={() => setSlideForm({ ...slideForm, icon: icon.id })}
                      >
                        <span>{icon.emoji}</span>
                        <span>{icon.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content / Presentation File Upload */}
                <div className="form-field-group">
                  <label>Attachment / Presentation File (Optional)</label>
                  <label htmlFor="slide-file-input" className="slide-upload-dropzone">
                    <input
                      id="slide-file-input"
                      type="file"
                      accept=".pdf,.pptx,.ppt,.mp4,.png,.jpg"
                      hidden
                      onChange={handleSlideFileChange}
                    />
                    <div className="slide-upload-icon-circle">
                      <UploadCloud size={20} />
                    </div>
                    <p className="dropzone-main-text">Click to browse or drop slide file</p>
                    <p className="dropzone-sub-text">Support for PDF, PPTX, MP4 up to 50MB</p>
                  </label>

                  {slideForm.file && (
                    <div className="attached-file-row">
                      <div className="attached-file-info">
                        <FileText size={16} />
                        <span>{slideForm.file.name}</span>
                        <span style={{ color: '#8b7892', fontSize: '11px' }}>
                          ({slideForm.file.size})
                        </span>
                      </div>
                      <button
                        type="button"
                        className="modal-close-btn"
                        style={{ width: '24px', height: '24px' }}
                        onClick={() => setSlideForm((prev) => ({ ...prev, file: null }))}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowSlideModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-purple" disabled={loading}>
                    {loading ? 'Saving...' : editingSlideId ? 'Update Slide' : 'Add Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Interactive Student Slide Preview */}
        {previewSlide && (
          <div className="module-modal-overlay" onClick={() => setPreviewSlide(null)}>
            <div className="module-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h2>Student View Preview</h2>
                <button className="modal-close-btn" onClick={() => setPreviewSlide(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className="preview-slide-container">
                <div className="preview-badge-row">
                  <span className="preview-student-tag">STUDENT SLIDE</span>
                  <span style={{ fontSize: '26px' }}>{getEmojiForIcon(previewSlide.icon)}</span>
                </div>

                <h3 className="preview-slide-title">{previewSlide.title}</h3>
                <div className="preview-slide-content">{previewSlide.content}</div>

                {previewSlide.fact && (
                  <div className="preview-mascot-speech">
                    <span className="preview-mascot-avatar">🐙</span>
                    <div>
                      <strong>Bubbles says:</strong> {previewSlide.fact}
                    </div>
                  </div>
                )}

                {previewSlide.file && (
                  <div className="attached-file-row" style={{ marginTop: '12px' }}>
                    <div className="attached-file-info">
                      <FileText size={16} />
                      <span>{previewSlide.file.name}</span>
                    </div>
                    {previewSlide.file.url && (
                      <a
                        href={previewSlide.file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="slide-btn-small slide-btn-preview"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-primary-purple"
                  onClick={() => setPreviewSlide(null)}
                >
                  Done Previewing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}

export default ModuleManagement;
