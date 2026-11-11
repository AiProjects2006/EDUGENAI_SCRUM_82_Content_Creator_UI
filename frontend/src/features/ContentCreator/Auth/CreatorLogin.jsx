import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useCreatorAuth } from '../../../context/CreatorAuthContext';
import './CreatorAuth.css';

const STUDENT_PORTAL_URL = import.meta.env.VITE_STUDENT_PORTAL_URL || 'http://localhost:5173';
const ADMIN_PORTAL_URL = import.meta.env.VITE_ADMIN_PORTAL_URL || 'http://localhost:5174';

export default function CreatorLogin() {
  const navigate = useNavigate();
  const { login, loading } = useCreatorAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectSuggestion, setRedirectSuggestion] = useState(null);

  const handleQuickFill = () => {
    setUsernameOrEmail('creator');
    setPassword('Creator@123');
    setErrorMessage('');
    setRedirectSuggestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setRedirectSuggestion(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both your email/username and password.');
      return;
    }

    try {
      await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password
      });
      navigate('/creator-dashboard');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);

      if (msg.toLowerCase().includes('student')) {
        setRedirectSuggestion({
          role: 'Student',
          url: `${STUDENT_PORTAL_URL}/login`
        });
      } else if (msg.toLowerCase().includes('administrator') || msg.toLowerCase().includes('admin')) {
        setRedirectSuggestion({
          role: 'Administrator',
          url: `${ADMIN_PORTAL_URL}/login`
        });
      }
    }
  };

  return (
    <div className="creator-auth-page">
      <div className="creator-auth-container">
        {/* Brand Header */}
        <div className="creator-brand-header">
          <div className="creator-logo-icon">
            <GraduationCap size={28} />
          </div>
          <div className="creator-brand-badge">
            <Sparkles size={14} /> Creator Studio
          </div>
          <h1 className="creator-title">Welcome Back</h1>
          <p className="creator-subtitle">
            Sign in to design courses, manage learning modules, and generate AI activities.
          </p>
        </div>

        {/* Demo Quickfill Bar */}
        <div className="demo-quickfill-bar" style={{ marginBottom: '20px' }}>
          <span>Demo Account: <strong>creator</strong> / <strong>Creator@123</strong></span>
          <button type="button" className="btn-quickfill" onClick={handleQuickFill}>
            Quick Fill
          </button>
        </div>

        {/* Error / Pending Notice Alert */}
        {errorMessage && (
          <div
            className={`creator-auth-alert ${errorMessage.toLowerCase().includes('pending') ? 'warning' : 'error'}`}
            style={{ marginBottom: '20px' }}
          >
            {errorMessage.toLowerCase().includes('pending') ? (
              <Clock size={20} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
            ) : (
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <span>{errorMessage}</span>
              {redirectSuggestion && (
                <div className="role-redirect-box">
                  <a
                    href={redirectSuggestion.url}
                    className="btn-role-redirect"
                  >
                    Go to {redirectSuggestion.role} Portal <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="creator-form" onSubmit={handleSubmit}>
          <div className="input-field-group">
            <label className="input-label" htmlFor="usernameOrEmail">
              Username or Email
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <User size={18} />
              </span>
              <input
                id="usernameOrEmail"
                type="text"
                className="creator-input"
                placeholder="creator or creator@edugenai.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="input-field-group">
            <label className="input-label" htmlFor="creatorPassword">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                id="creatorPassword"
                type={showPassword ? 'text' : 'password'}
                className="creator-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-creator-primary"
            disabled={loading}
          >
            {loading ? (
              'Authenticating with Keycloak...'
            ) : (
              <>
                Sign In to Creator Studio <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer & Navigation */}
        <div className="creator-auth-footer">
          <p className="switch-auth-mode">
            Don't have a creator account?{' '}
            <Link to="/register" className="creator-link">
              Register as Content Creator
            </Link>
          </p>

          <div className="portal-navigation-divider">
            <span>Or switch to another portal</span>
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

      {/* Keycloak Security Badge */}
      <div className="creator-security-badge">
        <ShieldCheck size={16} />
        <span>Protected by Keycloak OIDC Authentication & EduGenAI User Service</span>
      </div>
    </div>
  );
}

