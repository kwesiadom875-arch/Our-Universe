import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                user: action.payload.user,
                inviteCode: action.payload.inviteCode || null,
                partnerName: action.payload.partnerName || null
            };
        case 'AUTH_ERROR':
        case 'LOGIN_FAIL':
        case 'LOGOUT':
        case 'REGISTER_FAIL':
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                user: null,
                error: action.payload || null,
                inviteCode: null,
                partnerName: null
            };
        case 'USER_LOADED':
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const initialState = {
        token: localStorage.getItem('token'),
        isAuthenticated: null,
        loading: true,
        user: null,
        error: null,
        inviteCode: null,
        partnerName: null
    };

    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load User
    const loadUser = async () => {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
        }

        try {
            const res = await axios.get('http://localhost:5000/api/auth/user');
            dispatch({
                type: 'USER_LOADED',
                payload: res.data
            });
        } catch (err) {
            dispatch({ type: 'AUTH_ERROR' });
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // Register User (Create Universe - Flow 1)
    const register = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData, config);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });

            setAuthToken(res.data.token);
            await loadUser();

            return { success: true, inviteCode: res.data.inviteCode };
        } catch (err) {
            dispatch({
                type: 'REGISTER_FAIL',
                payload: err.response?.data?.msg || 'Registration failed'
            });
            return { success: false, error: err.response?.data?.msg || 'Registration failed' };
        }
    };

    // Register with Invite Code (Join Universe - Flow 2)
    const registerWithCode = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register-with-code', formData, config);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });

            setAuthToken(res.data.token);
            await loadUser();

            return { success: true, partnerName: res.data.partnerName };
        } catch (err) {
            dispatch({
                type: 'REGISTER_FAIL',
                payload: err.response?.data?.msg || 'Registration failed'
            });
            return { success: false, error: err.response?.data?.msg || 'Registration failed' };
        }
    };

    // Google Sign-In
    const googleLogin = async (credential, inviteCode = null) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/google', { credential, inviteCode }, config);

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: res.data
            });

            setAuthToken(res.data.token);
            await loadUser();

            return { success: true, inviteCode: res.data.inviteCode, partnerName: res.data.partnerName };
        } catch (err) {
            dispatch({
                type: 'REGISTER_FAIL',
                payload: err.response?.data?.msg || 'Google authentication failed'
            });
            return { success: false, error: err.response?.data?.msg || 'Google authentication failed' };
        }
    };

    // Login User
    const login = async (formData) => {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData, config);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: res.data
            });

            setAuthToken(res.data.token);
            await loadUser();

            return { success: true };
        } catch (err) {
            dispatch({
                type: 'LOGIN_FAIL',
                payload: err.response?.data?.msg || 'Login failed'
            });
            return { success: false, error: err.response?.data?.msg || 'Login failed' };
        }
    };

    // Logout
    const logout = () => dispatch({ type: 'LOGOUT' });

    // Clear Error
    const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

    return (
        <AuthContext.Provider
            value={{
                token: state.token,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                user: state.user,
                error: state.error,
                inviteCode: state.inviteCode,
                partnerName: state.partnerName,
                register,
                registerWithCode,
                googleLogin,
                login,
                logout,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Start Helper Function
const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};
// End Helper Function

export default AuthContext;
