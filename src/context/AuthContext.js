import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuthStatus = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error("Token verification failed:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // CORRECTED LOGIN FUNCTION
    const login = async (emailOrUsernameValue, passwordValue) => { // Renamed parameters for clarity
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                // Change 'username' key to 'emailOrUsername'
                emailOrUsername: emailOrUsernameValue, // <--- CORRECTED LINE!
                password: passwordValue
            });
            localStorage.setItem('token', response.data.token);

            // Backend's AuthController sends userId, username, email directly in response.data map
            setUser({
                userId: response.data.userId,
                username: response.data.username,
                email: response.data.email
            });
            navigate('/dashboard');
            return true; // Indicate success to Login.js
        } catch (error) {
            console.error("Login failed:", error.response?.data?.error || error.message);
            // Don't throw here if Login.js handles it with `if (success)`
            return false; // Indicate failure to Login.js
        }
    };

    // Note: The signup function in AuthContext.js currently seems unused by Login.js,
    // as Login.js directly calls wishlistApi.signup.
    // If you intend to use this signup function, its signature might need adjustment
    // to accept an object from Login.js (e.g., `async (userData) => {...}`)
    // const signup = async (username, password) => {
    //     try {
    //         await axios.post(`${API_BASE_URL}/auth/signup`, { username, password });
    //         navigate('/login');
    //     } catch (error) {
    //         console.error("Signup failed:", error.response?.data?.message || error.message);
    //         throw error;
    //     }
    // };
    const signup = async (userData) => { // Adjusted for consistency if you plan to use this
        try {
            await axios.post(`${API_BASE_URL}/auth/signup`, userData); // Expects { username, email, passwordHash }
            // Consider logging in automatically or navigating to login page
            // navigate('/login'); // If you want to force login after signup
            return true;
        } catch (error) {
            console.error("Signup failed:", error.response?.data?.error || error.message);
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
        signup // Ensure signup is exposed if used
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
