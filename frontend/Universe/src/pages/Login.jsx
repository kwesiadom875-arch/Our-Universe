import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

const Login = () => {
    const authContext = useContext(AuthContext);
    const { login } = authContext;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        await login({ email, password });
        navigate('/');
    };

    return (
        <div className="auth-wrapper">
            {/* Decorative Background Elements */}
            <div className="floating-heart" style={{ top: '10%', left: '15%', fontSize: '2rem' }}>♥</div>
            <div className="floating-heart" style={{ top: '70%', left: '8%', fontSize: '1.5rem', animationDelay: '1s' }}>★</div>
            <div className="floating-heart" style={{ top: '20%', right: '10%', fontSize: '2rem', animationDelay: '2s' }}>✨</div>

            <div className="auth-container">
                {/* Left Side - Hero */}
                <div className="auth-hero">
                    <div className="hero-tag">
                        <span>♥</span> CONNECTING HEARTS SINCE 2024
                    </div>
                    <h1>Welcome to <br /><span>Our Universe</span></h1>
                    <p>
                        Your shared space for memories, daily notes, and keeping the spark alive, no matter the distance.
                    </p>

                    <div className="social-proof">
                        <div className="avatars">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User 1" />
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="User 2" />
                        </div>
                        <span>Your personal digital home</span>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="lock-icon-container">
                            <i className="fas fa-lock">🔓</i>
                        </div>

                        <h2>Welcome Back!</h2>
                        <p className="sub-text">Enter your details to access your shared world.</p>

                        <form onSubmit={onSubmit}>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={onChange}
                                        placeholder="Email Address"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="input-with-icon">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={onChange}
                                        placeholder="Password"
                                        required
                                    />
                                </div>
                                <div className="forgot-password">
                                    <a href="#">Forgot?</a>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary">
                                Sign In to Universe →
                            </button>
                        </form>

                        <div className="divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-login">
                            <button className="btn-social">Google</button>
                            <button className="btn-social">Apple</button>
                        </div>

                        <div className="auth-footer">
                            New to Our Universe? <Link to="/register">Create an account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
