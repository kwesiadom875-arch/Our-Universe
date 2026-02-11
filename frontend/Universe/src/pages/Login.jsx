import { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import '../styles/auth.css';

const Login = () => {
    const authContext = useContext(AuthContext);
    const { login, googleLogin } = authContext;
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const onChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError('');
    };

    const onSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const result = await login({ email, password });
        if (result.success) {
            navigate('/');
        } else {
            setFormError(result.error);
        }
        setIsSubmitting(false);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSubmitting(true);
        setFormError('');

        const result = await googleLogin(credentialResponse.credential);
        if (result.success) {
            navigate('/');
        } else {
            setFormError(result.error);
        }
        setIsSubmitting(false);
    };

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
                    <h2>Welcome Back!</h2>
                    <p className="sub-text">Enter your details to access your shared world.</p>

                    {/* Error Display */}
                    {formError && (
                        <div className="auth-error" role="alert" aria-live="polite">
                            {formError}
                        </div>
                    )}

                    <form onSubmit={onSubmit}>
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
                            <label className="field-label" htmlFor="password">Access Key</label>
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
                        </div>

                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Signing in...' : 'Sign In to Universe →'}
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
                            text="signin_with"
                            shape="rectangular"
                        />
                    </div>

                    {/* Footer */}
                    <div className="auth-footer">
                        New to Our Universe? <Link to="/register">Create an account</Link>
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

export default Login;
