import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Calendar from './pages/Calendar';
import MovieMatcher from './pages/MovieMatcher';
import BookLibrary from './pages/BookLibrary';
import Scrapbook from './pages/Scrapbook';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id_here';

// Main App Component
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="App">
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
                path="/scrapbook"
                element={
                  <PrivateRoute>
                    <Scrapbook />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

