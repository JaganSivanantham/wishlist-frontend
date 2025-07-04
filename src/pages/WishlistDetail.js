import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import { useCallback } from 'react'; // Removed duplicate import, already imported above
import wishlistApi from '../api/wishlistApi';

const WishlistDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductImageUrl, setNewProductImageUrl] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [editingProduct, setEditingProduct] = useState(null); // Product being edited
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');

    // Wrap fetchWishlist in useCallback.
    // Its dependencies are 'id' (from useParams), and state setters (which are stable).
    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        try {
            const response = await wishlistApi.getWishlistById(id);
            setWishlist(response.data);
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
            setError(err.response?.data?.message || 'Failed to load wishlist. You might not have access or it might not exist.');
        } finally {
            setLoading(false);
        }
    }, [id, setLoading, setWishlist, setError]); // Dependencies for useCallback: 'id' and state setters

    // useEffect hook to fetch wishlist data when relevant dependencies change
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [id, user, navigate, fetchWishlist]); // <--- fetchWishlist is now correctly added here

    const handleAddOrUpdateProduct = async (e) => {
        e.preventDefault();
        setError('');
        if (!newProductName || !newProductImageUrl || !newProductPrice) {
            setError('All product fields are required.');
            return;
        }
        if (isNaN(newProductPrice) || parseFloat(newProductPrice) <= 0) {
            setError('Price must be a positive number.');
            return;
        }

        const productData = {
            name: newProductName,
            imageUrl: newProductImageUrl,
            price: parseFloat(newProductPrice),
        };

        try {
            let response;
            if (editingProduct) {
                response = await wishlistApi.updateProduct(id, editingProduct.id, productData);
                setEditingProduct(null); // Clear editing state
            } else {
                response = await wishlistApi.addProduct(id, productData);
            }
            setWishlist(response.data); // Update wishlist with new product
            setNewProductName('');
            setNewProductImageUrl('');
            setNewProductPrice('');
            setShowAddProductForm(false);
        } catch (err) {
            console.error('Error adding/updating product:', err);
            setError('Failed to add/update product.');
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setNewProductName(product.name);
        setNewProductImageUrl(product.imageUrl);
        setNewProductPrice(product.price.toString());
        setShowAddProductForm(true);
    };

    const handleRemoveProduct = async (productId) => {
        setError('');
        if (window.confirm('Are you sure you want to remove this product?')) {
            try {
                const response = await wishlistApi.removeProduct(id, productId);
                setWishlist(response.data); // Update wishlist after removal
            } catch (err) {
                console.error('Error removing product:', err);
                setError('Failed to remove product.');
            }
        }
    };

    const handleInviteUser = async (e) => {
        e.preventDefault();
        setInviteMessage('');
        setError('');
        if (!inviteEmail.trim()) {
            setInviteMessage('Please enter an email to invite.');
            return;
        }
        try {
            const response = await wishlistApi.inviteUserToWishlist(id, inviteEmail);
            setInviteMessage(response.data.message);
            setInviteEmail('');
            // Optionally refetch wishlist to show updated collaborators if backend returns it
            fetchWishlist();
        } catch (err) {
            setInviteMessage(err.response?.data?.message || 'Failed to send invite.');
            setError('Invitation failed.');
        }
    };

    if (loading) {
        return <div style={styles.loading}>Loading wishlist details...</div>;
    }

    if (error) {
        return <div style={styles.errorMessage}>{error}</div>;
    }

    if (!wishlist) {
        return <div style={styles.errorMessage}>Wishlist not found.</div>;
    }

    const isOwner = user && wishlist.ownerId === user.id;

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/dashboard')} style={styles.backButton}>&larr; Back to Dashboard</button>
            <h1 style={styles.title}>{wishlist.title}</h1>
            <p style={styles.description}>{wishlist.description}</p>
            <p style={styles.owner}>Created by: {wishlist.ownerUsername}</p>
            <p style={styles.collaborators}>Collaborators: {wishlist.collaboratorIds.length > 0 ? wishlist.collaboratorIds.join(', ') : 'None'}</p>

            {isOwner && (
                <div style={styles.inviteContainer}>
                    <h3 style={styles.subHeading}>Invite User to Wishlist</h3>
                    <form onSubmit={handleInviteUser} style={styles.inviteForm}>
                        <input
                            type="email"
                            placeholder="Enter email to invite"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            style={styles.inviteInput}
                            required
                        />
                        <button type="submit" style={styles.inviteButton}>Invite</button>
                    </form>
                    {inviteMessage && <p style={styles.inviteMessage}>{inviteMessage}</p>}
                </div>
            )}

            <h2 style={styles.subHeading}>Products</h2>
            <button onClick={() => { setShowAddProductForm(!showAddProductForm); setEditingProduct(null); }} style={styles.toggleFormButton}>
                {showAddProductForm ? 'Hide Form' : 'Add New Product'}
            </button>

            {showAddProductForm && (
                <div style={styles.formContainer}>
                    <h3 style={styles.formTitle}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <form onSubmit={handleAddOrUpdateProduct} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product Name:</label>
                            <input
                                type="text"
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Image URL:</label>
                            <input
                                type="text"
                                value={newProductImageUrl}
                                onChange={(e) => setNewProductImageUrl(e.target.value)}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Price:</label>
                            <input
                                type="number"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                                step="0.01"
                                required
                                style={styles.input}
                            />
                        </div>
                        {error && <p style={styles.error}>{error}</p>}
                        <button type="submit" style={styles.submitButton}>
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        {editingProduct && (
                            <button type="button" onClick={() => {
                                setEditingProduct(null);
                                setShowAddProductForm(false);
                                setNewProductName('');
                                setNewProductImageUrl('');
                                setNewProductPrice('');
                            }} style={styles.cancelEditButton}>
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>
            )}

            {wishlist.products.length === 0 ? (
                <p style={styles.noProducts}>No products in this wishlist yet. Add some!</p>
            ) : (
                <div style={styles.productGrid}>
                    {wishlist.products.map((product) => (
                        <div key={product.id} style={styles.productCard}>
                            <img src={product.imageUrl} alt={product.name} style={styles.productImage} />
                            <h3 style={styles.productName}>{product.name}</h3>
                            <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
                            <p style={styles.productAddedBy}>Added by: {product.addedByUsername}</p>
                            <p style={styles.productTimestamp}>Added on: {new Date(product.createdAt).toLocaleDateString()}</p>
                            {product.createdAt !== product.lastEditedAt && (
                                <p style={styles.productTimestamp}>Last edited: {new Date(product.lastEditedAt).toLocaleDateString()}</p>
                            )}
                            <div style={styles.productActions}>
                                <button onClick={() => handleEditClick(product)} style={styles.editButton}>Edit</button>
                                <button onClick={() => handleRemoveProduct(product.id)} style={styles.removeButton}>Remove</button>
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
    backButton: {
        padding: '10px 15px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    title: {
        color: '#333',
        marginBottom: '10px',
    },
    description: {
        color: '#555',
        marginBottom: '10px',
    },
    owner: {
        fontSize: '0.9em',
        color: '#777',
        marginBottom: '5px',
    },
    collaborators: {
        fontSize: '0.9em',
        color: '#777',
        marginBottom: '20px',
    },
    subHeading: {
        color: '#333',
        marginTop: '30px',
        marginBottom: '20px',
        borderBottom: '1px solid #ccc',
        paddingBottom: '10px',
    },
    loading: {
        textAlign: 'center',
        fontSize: '1.2em',
        marginTop: '50px',
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
        fontSize: '1.1em',
        marginTop: '50px',
    },
    noProducts: {
        textAlign: 'center',
        color: '#666',
        marginTop: '20px',
    },
    toggleFormButton: {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px',
    },
    formTitle: {
        color: '#333',
        marginBottom: '15px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    formGroup: {
        marginBottom: '5px',
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
    submitButton: {
        padding: '12px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    cancelEditButton: {
        padding: '12px 20px',
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '10px',
    },
    error: {
        color: 'red',
        marginBottom: '10px',
        textAlign: 'center',
    },
    productGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    productCard: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    productImage: {
        width: '100%',
        maxHeight: '180px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '10px',
    },
    productName: {
        color: '#333',
        marginBottom: '5px',
    },
    productPrice: {
        color: '#007bff',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    productAddedBy: {
        fontSize: '0.8em',
        color: '#666',
        marginBottom: '5px',
    },
    productTimestamp: {
        fontSize: '0.7em',
        color: '#888',
        marginBottom: '10px',
    },
    productActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '10px',
    },
    editButton: {
        padding: '8px 12px',
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85em',
    },
    removeButton: {
        padding: '8px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85em',
    },
    inviteContainer: {
        backgroundColor: '#e9f7ef', // Light green background to stand out
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #28a745', // Green border
        marginTop: '20px',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)', // Subtle shadow
    },
    inviteForm: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '15px',
        flexWrap: 'wrap', // Added for better mobile responsiveness
    },
    inviteInput: {
        padding: '10px', // Slightly more padding
        border: '1px solid #ccc',
        borderRadius: '4px',
        flexGrow: 1,
        maxWidth: '300px',
    },
    inviteButton: {
        padding: '10px 20px', // More padding
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    inviteMessage: {
        marginTop: '10px',
        color: '#28a745',
        fontWeight: 'bold',
    }

};
export default WishlistDetail;
