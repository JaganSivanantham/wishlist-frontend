import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WishlistDetail from './pages/WishlistDetail';

// A simple PrivateRoute component
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading application...</div>; // Or a spinner
    }

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/wishlist/:id"
                        element={
                            <PrivateRoute>
                                <WishlistDetail />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;