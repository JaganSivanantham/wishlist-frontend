import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wishlistApi from '../api/wishlistApi';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [wishlists, setWishlists] = useState([]);
    const [newWishlistTitle, setNewWishlistTitle] = useState('');
    const [newWishlistDescription, setNewWishlistDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchWishlists();
    }, [user, navigate]);

    const fetchWishlists = async () => {
        try {
            const response = await wishlistApi.getWishlists();
            setWishlists(response.data);
        } catch (err) {
            console.error('Failed to fetch wishlists:', err);
            setError('Failed to load wishlists.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWishlist = async (e) => {
        e.preventDefault();
        setError('');
        if (!newWishlistTitle.trim()) {
            setError('Wishlist title cannot be empty.');
            return;
        }
        try {
            await wishlistApi.createWishlist({ title: newWishlistTitle, description: newWishlistDescription });
            setNewWishlistTitle('');
            setNewWishlistDescription('');
            fetchWishlists(); // Refresh list
        } catch (err) {
            console.error('Error creating wishlist:', err);
            setError('Failed to create wishlist.');
        }
    };

    const handleDeleteWishlist = async (id) => {
        setError('');
        if (window.confirm('Are you sure you want to delete this wishlist?')) {
            try {
                await wishlistApi.deleteWishlist(id);
                fetchWishlists(); // Refresh list
            } catch (err) {
                console.error('Error deleting wishlist:', err);
                setError('Failed to delete wishlist. You might not be the owner.');
            }
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading wishlists...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Welcome, {user?.username || user?.email}!</h1>
                <button onClick={logout} style={styles.logoutButton}>Logout</button>
            </div>

            <div style={styles.createFormContainer}>
                <h2 style={styles.subHeading}>Create New Wishlist</h2>
                <form onSubmit={handleCreateWishlist} style={styles.form}>
                    <div style={styles.formGroup}>
                        <input
                            type="text"
                            placeholder="Wishlist Title"
                            value={newWishlistTitle}
                            onChange={(e) => setNewWishlistTitle(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <textarea
                            placeholder="Wishlist Description (optional)"
                            value={newWishlistDescription}
                            onChange={(e) => setNewWishlistDescription(e.target.value)}
                            rows="3"
                            style={styles.textarea}
                        ></textarea>
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button type="submit" style={styles.button}>Create Wishlist</button>
                </form>
            </div>

            <h2 style={styles.subHeading}>Your Wishlists</h2>
            {wishlists.length === 0 ? (
                <p style={styles.noWishlists}>No wishlists found. Create one!</p>
            ) : (
                <div style={styles.wishlistGrid}>
                    {wishlists.map((wishlist) => (
                        <div key={wishlist.id} style={styles.wishlistCard}>
                            <h3 style={styles.wishlistTitle}>{wishlist.title}</h3>
                            <p style={styles.wishlistDescription}>{wishlist.description}</p>
                            <p style={styles.wishlistOwner}>Owner: {wishlist.ownerUsername}</p>
                            <div style={styles.cardActions}>
                                <button onClick={() =>{console.log("Navigating to:", `/wishlist/${wishlist.id}`); navigate(`/wishlist/${wishlist.id}`)}} style={styles.viewButton}>View Details</button>
                                {wishlist.ownerId === user.id && ( // Only owner can delete
                                    <button onClick={() => handleDeleteWishlist(wishlist.id)} style={styles.deleteButton}>Delete</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '15px',
    },
    title: {
        color: '#333',
    },
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    createFormContainer: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px',
    },
    subHeading: {
        color: '#333',
        marginBottom: '20px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        marginBottom: '5px',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box',
        resize: 'vertical',
    },
    button: {
        padding: '12px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        alignSelf: 'flex-end',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
        textAlign: 'center',
    },
    noWishlists: {
        textAlign: 'center',
        color: '#666',
        marginTop: '20px',
    },
    wishlistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    wishlistCard: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    wishlistTitle: {
        color: '#007bff',
        marginBottom: '10px',
    },
    wishlistDescription: {
        color: '#555',
        fontSize: '0.9em',
        marginBottom: '15px',
        flexGrow: 1,
    },
    wishlistOwner: {
        fontSize: '0.8em',
        color: '#777',
        marginBottom: '10px',
    },
    cardActions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '10px',
        gap: '10px',
    },
    viewButton: {
        padding: '8px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
        flexGrow: 1,
    },
    deleteButton: {
        padding: '8px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
    },
};

export default Dashboard;