import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // Ensure useCallback is imported
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Define API_BASE_URL outside the component, or ensure it's globally accessible
// as it's a constant, it won't change, so React won't complain if it's not in deps
// IF it's declared INSIDE AuthProvider, then it needs useCallback.
// Let's assume it's defined globally or imported, as per your previous discussion.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Added loading state for auth check
    const navigate = useNavigate();

    // Memoize the checkAuthStatus function if it's used in useEffect
    const checkAuthStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Verify token with backend
                const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data); // Assuming response.data is the user object
            } catch (error) {
                console.error("Token verification failed:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false); // Set loading to false after check
    }, [API_BASE_URL]); // <--- Add API_BASE_URL here because checkAuthStatus uses it.
                         // It's a constant, so this effectively means it only runs once.

    // This is likely the useEffect at line 32 that Netlify is complaining about
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]); // <--- dependency should be checkAuthStatus (which is memoized)

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user); // Assuming user data is returned
            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw error; // Re-throw to be caught by login form
        }
    };

    const signup = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, { username, password });
            // Optionally auto-login after signup, or navigate to login page
            // localStorage.setItem('token', response.data.token);
            // setUser(response.data.user);
            navigate('/login'); // Navigate to login after successful signup
        } catch (error) {
            console.error("Signup failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        loading, // Provide loading state
        login,
        logout,
        signup
    };

    // Only render children when auth check is complete
    if (loading) {
        return <div>Loading authentication...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
