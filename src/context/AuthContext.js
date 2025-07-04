import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, username, email }
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:65091/api';

    useEffect(() => {
        const validateToken = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data); // Set user data if token is valid
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header
                } catch (error) {
                    console.error('Token validation failed:', error);
                    logout(); // Clear invalid token
                }
            }
            setLoading(false);
        };
        validateToken();
    }, [token]);

    const login = async (emailOrUsername, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                emailOrUsername,
                password
            });
            const { token, userId, username, email } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser({ id: userId, username, email });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set default header
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization']; // Remove default header
    };

    const authValue = {
        user,
        token,
        loading,
        login,
        logout,
        API_BASE_URL
    };

    return (
        <AuthContext.Provider value={authValue}>
            {!loading && children} {/* Render children only after loading/validation */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};