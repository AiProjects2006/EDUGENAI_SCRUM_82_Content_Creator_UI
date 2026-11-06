import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Award,
  BookOpen,
  Briefcase,
  Globe,
  FileText,
  Clock
} from 'lucide-react';
import { useCreatorAuth } from '../../../context/CreatorAuthContext';
import './CreatorAuth.css';

const STUDENT_PORTAL_URL = import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173';
const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5174';

export default function CreatorRegister() {
  const navigate = useNavigate();
  const { register, loading } = useCreatorAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    // Professional educator details
    qualifications: '',
    experienceYears: '3',
    preferredSubjects: 'Mathematics, Science',
    skills: 'Curriculum Design, Video Production, Interactive Quizzes',
    portfolioUrl: '',
    bio: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('Please provide your full first and last name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.qualifications.trim()) {
      setErrorMessage('Please state your highest qualification or degree.');
      return;
    }

    if (!formData.preferredSubjects.trim()) {
      setErrorMessage('Please specify your preferred teaching subjects.');
      return;
    }

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim() || formData.email.split('@')[0],
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        contactNumber: formData.contactNumber.trim() || '0770000000',
        qualifications: formData.qualifications.trim(),
        experienceYears: formData.experienceYears,
        preferredSubjects: formData.preferredSubjects.trim(),
        skills: formData.skills.trim(),
        portfolioUrl: formData.portfolioUrl.trim(),
        bio: formData.bio.trim()
      });

      if (result.isPendingApproval || result.accountStatus === 'PENDING_VERIFICATION') {
        setSubmittedApplication({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          username: formData.username || formData.email.split('@')[0],
          qualifications: formData.qualifications,
          experienceYears: formData.experienceYears,
          subjects: formData.preferredSubjects,
          date: new Date().toLocaleDateString()
        });
      } else {
        setSuccessMessage(result.message || 'Registration successful! Redirecting to Creator Studio...');
        setTimeout(() => {
          navigate('/creator-dashboard');
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    }
  };

  // Render Submitted Confirmation Screen
  if (submittedApplication) {
    return (
      <div className="creator-auth-page">
        <div className="creator-auth-container register-wide">
          <div className="submitted-card">
            <div className="submitted-icon-wrapper">
              <CheckCircle2 size={38} />
            </div>

            <div className="creator-brand-badge">
              <Sparkles size={14} /> Application Submitted
            </div>

            <h1 className="submitted-title">Application Under Review</h1>
            <p className="submitted-desc">
              Thank you for applying to become an EduGenAI Content Creator. Your professional educator profile has been submitted to the platform administrators for verification.
            </p>

            <div className="application-summary-box">
              <h5>Applicant Summary</h5>
              <div className="summary-row">
                <span>Educator Name:</span>
                <strong>{submittedApplication.name}</strong>
              </div>
              <div className="summary-row">
                <span>Account Email:</span>
                <strong>{submittedApplication.email}</strong>
              </div>
              <div className="summary-row">
                <span>Highest Qualification:</span>
                <strong>{submittedApplication.qualifications}</strong>
              </div>
              <div className="summary-row">
                <span>Teaching Experience:</span>
                <strong>{submittedApplication.experienceYears} Years</strong>
              </div>
              <div className="summary-row">
                <span>Preferred Subjects:</span>
                <strong>{submittedApplication.subjects}</strong>
              </div>
              <div className="summary-row">
                <span>Date Submitted:</span>
                <strong>{submittedApplication.date}</strong>
              </div>
            </div>

            {/* Verification Timeline */}
            <div className="review-timeline">
              <div className="timeline-item">
                <div className="timeline-dot done">✓</div>
                <div className="timeline-content">
                  <h4>1. Application Received</h4>
                  <p>Credentials and professional background received by EduGenAI platform.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot current">2</div>
                <div className="timeline-content">
                  <h4>2. Administrator Verification (In Progress)</h4>
                  <p>Our curriculum administrators verify your qualifications and pedagogical background.</p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot upcoming">3</div>
                <div className="timeline-content">
                  <h4>3. Account Activation</h4>
                  <p>Upon approval, your Keycloak identity is activated and you can sign in to Creator Studio.</p>
                </div>
              </div>
            </div>

            <div className="form-step-actions" style={{ justifyContent: 'center', gap: '16px' }}>
              <Link to="/login" className="btn-creator-primary" style={{ textDecoration: 'none', width: 'auto', padding: '12px 28px' }}>
                Go to Creator Sign In
              </Link>
              <a href={STUDENT_PORTAL_URL} className="btn-creator-secondary" style={{ textDecoration: 'none' }}>
                Visit Learning Portal
              </a>
            </div>
          </div>
        </div>

        <div className="creator-security-badge">
          <ShieldCheck size={16} />
          <span>EduGenAI Administrator Moderated Verification System</span>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-auth-page">
      <div className="creator-auth-container register-wide">
        {/* Brand Header */}
        <div className="creator-brand-header">
          <div className="creator-logo-icon">
            <GraduationCap size={28} />
          </div>
          <div className="creator-brand-badge">
            <Sparkles size={14} /> Educator Onboarding
          </div>
          <h1 className="creator-title">Apply as Content Creator</h1>
          <p className="creator-subtitle">
            Submit your educator qualifications to create courses, design interactive lessons, and mentor students.
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="register-stepper">
          <div
            className={`stepper-step ${currentStep === 1 ? 'active' : 'completed'}`}
            onClick={() => setCurrentStep(1)}
          >
            <span>1</span> Account Details
          </div>
          <div className="stepper-divider" />
          <div
            className={`stepper-step ${currentStep === 2 ? 'active' : ''}`}
            onClick={() => {
              if (formData.firstName && formData.email && formData.password) {
                setCurrentStep(2);
              }
            }}
          >
            <span>2</span> Qualifications & Skills
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="creator-auth-alert error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="creator-auth-alert success" style={{ marginBottom: '20px' }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Account Credentials */}
        {currentStep === 1 && (
          <form className="creator-form" onSubmit={handleNextStep}>
            <div className="form-grid-2">
              <div className="input-field-group">
                <label className="input-label" htmlFor="firstName">
                  First Name *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <User size={18} />
                  </span>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="creator-input"
                    placeholder="e.g. Alex"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label className="input-label" htmlFor="lastName">
                  Last Name *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <User size={18} />
                  </span>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="creator-input"
                    placeholder="e.g. Rivers"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-field-group">
                <label className="input-label" htmlFor="username">
                  Preferred Username
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <User size={18} />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="creator-input"
                    placeholder="alex_rivers"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label className="input-label" htmlFor="email">
                  Email Address *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="creator-input"
                    placeholder="alex.rivers@edugenai.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="contactNumber">
                Contact Phone Number
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Phone size={18} />
                </span>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  className="creator-input"
                  placeholder="0771234567"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-field-group">
                <label className="input-label" htmlFor="password">
                  Password *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="creator-input"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-field-group">
                <label className="input-label" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Lock size={18} />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="creator-input"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-creator-primary"
            >
              Continue to Qualifications <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* STEP 2: Professional Qualifications & Skills */}
        {currentStep === 2 && (
          <form className="creator-form" onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="input-field-group">
                <label className="input-label" htmlFor="qualifications">
                  Highest Qualification / Degree *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Award size={18} />
                  </span>
                  <input
                    id="qualifications"
                    name="qualifications"
                    type="text"
                    className="creator-input"
                    placeholder="e.g. BSc in Mathematics & Education"
                    value={formData.qualifications}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="input-field-group">
                <label className="input-label" htmlFor="experienceYears">
                  Years of Experience *
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left">
                    <Briefcase size={18} />
                  </span>
                  <select
                    id="experienceYears"
                    name="experienceYears"
                    className="creator-input"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                    <option value="3">3 Years</option>
                    <option value="5">4-5 Years</option>
                    <option value="8">6-9 Years</option>
                    <option value="10">10+ Years</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="preferredSubjects">
                Subject Areas / Disciplines *
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <BookOpen size={18} />
                </span>
                <input
                  id="preferredSubjects"
                  name="preferredSubjects"
                  type="text"
                  className="creator-input"
                  placeholder="e.g. Mathematics, Physics, Computer Science"
                  value={formData.preferredSubjects}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="skills">
                Key Skills & Specializations
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Sparkles size={18} />
                </span>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  className="creator-input"
                  placeholder="e.g. STEM Pedagogy, Video Lectures, Interactive Quizzes"
                  value={formData.skills}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="portfolioUrl">
                Portfolio / LinkedIn / Sample Lesson URL
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Globe size={18} />
                </span>
                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  className="creator-input"
                  placeholder="https://linkedin.com/in/educator or YouTube / Google Drive"
                  value={formData.portfolioUrl}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label className="input-label" htmlFor="bio">
                Educator Bio / Statement of Purpose
              </label>
              <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="creator-input"
                  style={{ minHeight: '80px', padding: '12px 14px', resize: 'vertical' }}
                  placeholder="Briefly describe your teaching philosophy and why you want to publish courses on EduGenAI..."
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-step-actions">
              <button
                type="button"
                className="btn-creator-secondary"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
              >
                <ArrowLeft size={16} /> Back to Details
              </button>

              <button
                type="submit"
                className="btn-creator-primary"
                style={{ width: 'auto', minWidth: '220px' }}
                disabled={loading}
              >
                {loading ? (
                  'Submitting Application...'
                ) : (
                  <>
                    Submit Application <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer & Navigation */}
        <div className="creator-auth-footer">
          <p className="switch-auth-mode">
            Already registered?{' '}
            <Link to="/login" className="creator-link">
              Sign In here
            </Link>
          </p>

          <div className="portal-navigation-divider">
            <span>Or switch portal</span>
          </div>

          <div className="portal-switch-links">
            <a href={`${STUDENT_PORTAL_URL}`} className="portal-switch-pill">
              🎓 Student Portal
            </a>
            <a href={`${ADMIN_PORTAL_URL}/login`} className="portal-switch-pill">
              🛡️ Admin Console
            </a>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="creator-security-badge">
        <ShieldCheck size={16} />
        <span>Content Creators are verified and approved by EduGenAI Administrators</span>
      </div>
    </div>
  );
}
