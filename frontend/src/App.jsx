//frontend/src/App.jsx
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Personal from './pages/Personal';
import Settings from './pages/Settings';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no sidebar */}
        <Route path="/" element={<AuthScreen />} />

        {/* Protected routes - with sidebar via RootLayout */}
        <Route
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/personal" element={<Personal />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;