import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wishlistApi from '../api/wishlistApi';

const Login = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister) {
            try {
                await wishlistApi.signup({ username, email: emailOrUsername, passwordHash: password });
                alert('Registration successful! Please login.');
                setIsRegister(false); // Switch to login form
                setEmailOrUsername('');
                setPassword('');
                setUsername('');
            } catch (err) {
                setError(err.response?.data?.error || 'Registration failed. Please try again.');
            }
        } else {
            const success = await login(emailOrUsername, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Login failed. Invalid credentials.');
            }
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                {isRegister && (
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                )}
                <div style={styles.formGroup}>
                    <label style={styles.label}>{isRegister ? 'Email:' : 'Email or Username:'}</label>
                    <input
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={styles.input}
                    />
                </div>
                {error && <p style={styles.error}>{error}</p>}
                <button type="submit" style={styles.button}>
                    {isRegister ? 'Register' : 'Login'}
                </button>
            </form>
            <p style={styles.toggleText}>
                {isRegister ? (
                    <>Already have an account? <span onClick={() => setIsRegister(false)} style={styles.toggleLink}>Login here</span></>
                ) : (
                    <>Don't have an account? <span onClick={() => setIsRegister(true)} style={styles.toggleLink}>Register here</span></>
                )}
            </p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px',
        boxSizing: 'border-box',
    },
    heading: {
        color: '#333',
        marginBottom: '20px',
    },
    form: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#555',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
        textAlign: 'center',
    },
    toggleText: {
        marginTop: '20px',
        color: '#666',
    },
    toggleLink: {
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'underline',
    }
};

export default Login;
