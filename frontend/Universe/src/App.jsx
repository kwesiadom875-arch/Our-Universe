import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Calendar = lazy(() => import('./pages/Calendar'));
const MovieMatcher = lazy(() => import('./pages/MovieMatcher'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const BookLibrary = lazy(() => import('./pages/BookLibrary'));
const Scents = lazy(() => import('./pages/Scents'));
const ScentDetails = lazy(() => import('./pages/ScentDetails'));
const Scrapbook = lazy(() => import('./pages/Scrapbook'));
const Profile = lazy(() => import('./pages/Profile'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
  </div>
);

// Main App Component
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/timetable"
                    element={
                      <PrivateRoute>
                        <Timetable />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <PrivateRoute>
                        <Calendar />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/movies"
                    element={
                      <PrivateRoute>
                        <MovieMatcher />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/library"
                    element={
                      <PrivateRoute>
                        <BookLibrary />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/medialibrary"
                    element={
                      <PrivateRoute>
                        <MediaLibrary />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/scents"
                    element={
                      <PrivateRoute>
                        <Scents />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/scents/:id"
                    element={
                      <PrivateRoute>
                        <ScentDetails />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/scrapbook"
                    element={
                      <PrivateRoute>
                        <Scrapbook />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
