const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * A helper function for making API requests.
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} options - The options for the fetch call (e.g., method, headers, body).
 * @returns {Promise<any>} - The JSON response from the API.
 */
async function apiRequest(endpoint, { headers: customHeaders, ...options } = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...customHeaders,
        },
        ...options,
    });
    console.log('API Response:', response);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Catch if the error response is not JSON
        const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }

    // For 204 No Content responses
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const registerUser = (userData) => {
    return apiRequest('/api/chat/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

export const loginUser = (credentials) => {
    console.log('Logging in with credentials:', credentials);
    return apiRequest('/api/token/', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

export const getRooms = (accessToken) => {
    return apiRequest('/api/chat/rooms/', { headers: { 'Authorization': `Bearer ${accessToken}` } });
};

export const createRoom = (roomData, accessToken) => {
    console.log('Creating room with data:', roomData, 'and token:', accessToken);
    return apiRequest('/api/chat/rooms/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(roomData),
    });
};

export const getMessages = (roomSlug, accessToken) => {
    return apiRequest(`/api/chat/rooms/${roomSlug}/messages/`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
};

export const postMessage = (roomSlug, content, accessToken) => {
    return apiRequest(`/api/chat/rooms/${roomSlug}/messages/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ content }),
    });
};
