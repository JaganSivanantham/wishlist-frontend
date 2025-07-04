import axios from 'axios';

const API_BASE_URL = 'http://localhost:65091/api'; // Or from AuthContext if you prefer

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const wishlistApi = {
    // Auth is handled in AuthContext, but you could put signup here too
    signup: (userData) => axios.post(`${API_BASE_URL}/auth/signup`, userData),

    // Wishlists
    getWishlists: () => axios.get(`${API_BASE_URL}/wishlists`, { headers: getAuthHeaders() }),
    getWishlistById: (id) => axios.get(`${API_BASE_URL}/wishlists/${id}`, { headers: getAuthHeaders() }),
    createWishlist: (wishlistData) => axios.post(`${API_BASE_URL}/wishlists`, wishlistData, { headers: getAuthHeaders() }),
    updateWishlist: (id, wishlistData) => axios.put(`${API_BASE_URL}/wishlists/${id}`, wishlistData, { headers: getAuthHeaders() }),
    deleteWishlist: (id) => axios.delete(`${API_BASE_URL}/wishlists/${id}`, { headers: getAuthHeaders() }),
    inviteUserToWishlist: (wishlistId, email) => axios.post(`${API_BASE_URL}/wishlists/${wishlistId}/invite`, { email }, { headers: getAuthHeaders() }),

    // Products
    addProduct: (wishlistId, productData) => axios.post(`${API_BASE_URL}/wishlists/${wishlistId}/products`, productData, { headers: getAuthHeaders() }),
    updateProduct: (wishlistId, productId, productData) => axios.put(`${API_BASE_URL}/wishlists/${wishlistId}/products/${productId}`, productData, { headers: getAuthHeaders() }),
    removeProduct: (wishlistId, productId) => axios.delete(`${API_BASE_URL}/wishlists/${wishlistId}/products/${productId}`, { headers: getAuthHeaders() }),
};

export default wishlistApi;