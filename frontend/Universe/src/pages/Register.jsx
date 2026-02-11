import { useState, useContext, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, User, Mail, Lock, Eye, EyeOff, Copy, Check, Sparkles, Star, Heart, Rocket, Send, MessageCircle } from 'lucide-react';
import API_BASE_URL from '../config/api';
import '../styles/auth.css';

const Register = () => {
    const authContext = useContext(AuthContext);
    const { register, registerWithCode, googleLogin, error, clearError } = authContext;
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('create');
    const [showPassword, setShowPassword] = useState(false);
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedInviteCode, setGeneratedInviteCode] = useState('');
    const [codeCopied, setCodeCopied] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        inviteCode: ''
    });

    const { username, email, password, confirmPassword, inviteCode } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError('');
    };

    // Password strength calculator
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { level: 1, label: 'WEAK', color: '#ef4444' };
        if (score <= 2) return { level: 2, label: 'FAIR', color: '#f59e0b' };
        if (score <= 3) return { level: 3, label: 'GOOD', color: '#3b82f6' };
        return { level: 4, label: 'STRONG', color: '#22c55e' };
    };

    const strength = getPasswordStrength(password);

    // Profile picture handling
    const handleProfileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setProfilePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async () => {
        if (!profileFile) return null;
        const formData = new FormData();
        formData.append('image', profileFile);
        try {
            const res = await fetch(`${API_BASE_URL}/api/upload/profile-picture`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            return data.url;
        } catch (err) {
            console.error('Profile upload failed:', err);
            return null;
        }
    };

    // Create Universe submit
    const onCreateSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        const profilePicture = await uploadProfilePicture();
        const result = await register({ username, email, password, profilePicture });

        if (result.success) {
            setGeneratedInviteCode(result.inviteCode);
            setShowSuccess(true);
        } else {
            setFormError(result.error);
        }
        setIsSubmitting(false);
    };

    // Join Universe submit
    const onJoinSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
        }
        if (!inviteCode.trim()) {
            setFormError('Please enter an invite code');
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        const profilePicture = await uploadProfilePicture();
        const result = await registerWithCode({ username, email, password, profilePicture, inviteCode });

        if (result.success) {
            navigate('/');
        } else {
            setFormError(result.error);
        }
        setIsSubmitting(false);
    };

    // Google Sign-In callback
    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSubmitting(true);
        setFormError('');

        const code = activeTab === 'join' ? inviteCode : null;
        const result = await googleLogin(credentialResponse.credential, code);

        if (result.success) {
            if (result.inviteCode) {
                setGeneratedInviteCode(result.inviteCode);
                setShowSuccess(true);
            } else {
                navigate('/');
            }
        } else {
            setFormError(result.error);
        }
        setIsSubmitting(false);
    };

    // Copy invite code
    const copyInviteCode = () => {
        navigator.clipboard.writeText(generatedInviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    // Countdown for auto-redirect
    const [countdown, setCountdown] = useState(null);

    const startCountdown = () => {
        setCountdown(5);
    };

    // Countdown effect
    if (countdown !== null && countdown > 0) {
        setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    if (countdown === 0) {
        navigate('/');
    }

    // Share via WhatsApp
    const shareWhatsApp = () => {
        const message = `Join my universe on Our Universe! Use this secret code: ${generatedInviteCode}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Share via Email
    const shareEmail = () => {
        const subject = 'Join My Universe! 🌟';
        const body = `Hey! I've created our shared universe on Our Universe.\n\nUse this secret access code to join: ${generatedInviteCode}\n\nGo to the app and click "Join Universe" to get started!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    // Success screen after creating universe
    if (showSuccess) {
        return (
            <div className="auth-wrapper">
                <div className="auth-bg-decor">
                    <div className="decor-shape decor-shape-1"></div>
                    <div className="decor-shape decor-shape-2"></div>
                    <div className="decor-shape decor-shape-3"></div>
                </div>

                {/* Floating decorative elements */}
                <div className="floating-decor floating-envelope-1">
                    <Send size={28} />
                </div>
                <div className="floating-decor floating-envelope-2">
                    <Mail size={22} />
                </div>
                <div className="floating-decor floating-rocket">
                    <Rocket size={36} />
                </div>
                <div className="floating-decor floating-star-1">
                    <Sparkles size={14} />
                </div>
                <div className="floating-decor floating-star-2">
                    <Star size={10} />
                </div>

                <div className="auth-page-container success-page">
                    {/* Sparkle icon */}
                    <div className="success-top-icon">
                        <Sparkles size={28} />
                    </div>

                    <h1 className="success-heading">Your Universe is ready!</h1>
                    <p className="success-subtitle">
                        Send this secret code to your partner to bring them<br />
                        home and start your journey together.
                    </p>

                    {/* Code Display Card */}
                    <div className="success-code-card">
                        <span className="success-code-label">SECRET ACCESS CODE</span>
                        <div className="success-code-box" onClick={copyInviteCode}>
                            <span className="success-code-value">{generatedInviteCode}</span>
                            {codeCopied && <span className="copied-toast">Copied!</span>}
                        </div>
                        <div className="success-heart-icon">
                            <Heart size={22} fill="white" />
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="success-share-buttons">
                        <button className="share-btn share-whatsapp" onClick={shareWhatsApp}>
                            <MessageCircle size={18} />
                            Share via WhatsApp
                        </button>
                        <button className="share-btn share-email" onClick={shareEmail}>
                            <Mail size={18} />
                            Email Invite
                        </button>
                    </div>

                    {/* Skip Link */}
                    <button
                        className="success-skip"
                        onClick={() => {
                            if (countdown === null) {
                                startCountdown();
                            } else {
                                navigate('/');
                            }
                        }}
                    >
                        {countdown === null ? "I'LL DO THIS LATER" : ''}
                    </button>

                    {/* Countdown Banner */}
                    {countdown !== null && countdown > 0 && (
                        <div className="countdown-banner">
                            <Rocket size={14} />
                            <span>Preparing for launch in {countdown}...</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            {/* Decorative background shapes */}
            <div className="auth-bg-decor">
                <div className="decor-shape decor-shape-1"></div>
                <div className="decor-shape decor-shape-2"></div>
                <div className="decor-shape decor-shape-3"></div>
            </div>

            <div className="auth-page-container">
                {/* Brand Header */}
                <div className="auth-brand">
                    <div className="brand-icon"><Sparkles size={24} /></div>
                    <h1>Our Universe</h1>
                    <p className="brand-tagline">Map your connection, star by star.</p>
                </div>

                {/* Main Card */}
                <div className="auth-card">
                    {/* Flow Toggle */}
                    <div className="flow-toggle">
                        <button
                            className={`flow-toggle-btn ${activeTab === 'create' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('create'); setFormError(''); }}
                        >
                            Create Universe
                        </button>
                        <button
                            className={`flow-toggle-btn ${activeTab === 'join' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('join'); setFormError(''); }}
                        >
                            Join Universe
                        </button>
                    </div>

                    {/* Profile Picture */}
                    <div className="profile-picture-picker" onClick={handleProfileClick}>
                        {profilePreview ? (
                            <img src={profilePreview} alt="Profile" className="profile-preview-img" />
                        ) : (
                            <div className="profile-placeholder">
                                <User size={40} strokeWidth={1.5} />
                            </div>
                        )}
                        <div className="camera-badge">
                            <Camera size={14} />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <p className="profile-label">PROFILE IDENTITY</p>

                    {/* Error Display */}
                    {formError && (
                        <div className="auth-error" role="alert" aria-live="polite">
                            {formError}
                        </div>
                    )}

                    {/* Join Universe: Invite Code Input */}
                    {activeTab === 'join' && (
                        <div className="invite-code-section">
                            <div className="form-group">
                                <label className="field-label" htmlFor="inviteCode">Universe Code</label>
                                <div className="input-with-icon">
                                    <span className="input-icon"><Star size={16} /></span>
                                    <input
                                        id="inviteCode"
                                        type="text"
                                        name="inviteCode"
                                        value={inviteCode}
                                        onChange={onChange}
                                        placeholder="Enter your partner's invite code"
                                        required
                                        className="invite-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={activeTab === 'create' ? onCreateSubmit : onJoinSubmit}>
                        {/* Username */}
                        <div className="form-group">
                            <label className="field-label" htmlFor="username">Stellar Name</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><User size={16} /></span>
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={onChange}
                                    placeholder="e.g. MoonTraveler"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="field-label" htmlFor="email">Universal Email</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><Mail size={16} /></span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={onChange}
                                    placeholder="you@galaxy.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <div className="field-label-row">
                                <label className="field-label" htmlFor="password">Access Key</label>
                                {password && (
                                    <span className="strength-label" style={{ color: strength.color }}>
                                        {strength.label}
                                    </span>
                                )}
                            </div>
                            <div className="input-with-icon">
                                <span className="input-icon"><Lock size={16} /></span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="••••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {password && (
                                <div className="password-strength-bar">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`strength-segment ${i <= strength.level ? 'active' : ''}`}
                                            style={i <= strength.level ? { backgroundColor: strength.color } : {}}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="field-label" htmlFor="confirmPassword">Confirm Access Key</label>
                            <div className="input-with-icon">
                                <span className="input-icon"><Lock size={16} /></span>
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={onChange}
                                    placeholder="••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Invite code info message (Create flow) */}
                        {activeTab === 'create' && (
                            <div className="invite-info-banner">
                                <Sparkles size={16} />
                                <span>Your Universe Invite Code will be generated after creation for your partner to join.</span>
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : (
                                activeTab === 'create' ? 'Create My Universe →' : 'Join Universe →'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider">
                        <span>OR CONNECT VIA</span>
                    </div>

                    {/* Google Sign-In */}
                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setFormError('Google Sign-In failed')}
                            theme="outline"
                            size="large"
                            width="100%"
                            text="signup_with"
                            shape="rectangular"
                        />
                    </div>

                    {/* Footer */}
                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Beam me in</Link>
                    </div>
                </div>

                {/* Bottom links */}
                <div className="auth-bottom-links">
                    <a href="#">PRIVACY NEBULA</a>
                    <a href="#">TERMS OF ORBIT</a>
                    <a href="#">SUPPORT</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
