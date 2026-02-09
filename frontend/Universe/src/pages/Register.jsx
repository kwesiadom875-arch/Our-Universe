import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

const Register = () => {
    const authContext = useContext(AuthContext);
    const { register } = authContext;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const { username, email, password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match');
        } else {
            await register({ username, email, password });
            navigate('/');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="floating-heart" style={{ top: '15%', left: '10%', fontSize: '2rem' }}>♥</div>
            <div className="floating-heart" style={{ top: '80%', right: '15%', fontSize: '1.5rem', animationDelay: '1.5s' }}>✨</div>

            <div className="auth-container">
                {/* Left Side - Hero */}
                <div className="auth-hero">
                    <div className="hero-tag">
                        <span>♥</span> START YOUR JOURNEY
                    </div>
                    <h1>Create Your <br /><span>Shared World</span></h1>
                    <p>
                        Build a digital sanctuary for your relationship. Share notes, plans, and memories in one place.
                    </p>

                    <div className="social-proof">
                        <span>Join other couples building their universe</span>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="lock-icon-container">
                            <i>✎</i>
                        </div>

                        <h2>Create Account</h2>
                        <p className="sub-text">Begin your shared adventure today.</p>

                        <form onSubmit={onSubmit}>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <span className="input-icon">👤</span>
                                    <input
                                        type="text"
                                        name="username"
                                        value={username}
                                        onChange={onChange}
                                        placeholder="Username"
                                        required
                                    />
                                </div>
                            </div>

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
                            </div>

                            <div className="form-group">
                                <div className="input-with-icon">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={onChange}
                                        placeholder="Confirm Password"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary">
                                Create Universe →
                            </button>
                        </form>

                        <div className="auth-footer">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
