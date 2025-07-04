import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Define API_BASE_URL outside the component, as it's a constant.
// It should not be in the useCallback's dependency array if it's truly constant.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Memoize the checkAuthStatus function.
    // API_BASE_URL is a constant, so it's not a dependency.
    // setLoading and setUser are React guarantees stable, so they don't need to be explicitly listed either.
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
        setLoading(false);
    }, []); // <--- Removed API_BASE_URL from dependencies

    // This useEffect will run once when the component mounts
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]); // `checkAuthStatus` is stable due to `useCallback`

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            navigate('/dashboard');
        } catch (error) {
            console.error("Login failed:", error.response?.data?.message || error.message);
            throw error;
        }
    };

    const signup = async (username, password) => {
        try {
            // Option A: Removed 'response' assignment as it's not used
            await axios.post(`${API_BASE_URL}/auth/signup`, { username, password });
            navigate('/login');
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
        loading,
        login,
        logout,
        signup
    };

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
