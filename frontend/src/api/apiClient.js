const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Base fetch wrapper to handle JSON and Authorization
export const fetchApi = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Allow overriding Content-Type (e.g. for multipart/form-data where it needs to be deleted)
  if (options.headers && options.headers['Content-Type'] === null) {
    delete headers['Content-Type'];
  }

  // If body is FormData, remove Content-Type so browser auto-sets multipart/form-data with boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle generic errors
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  // Some endpoints might return empty responses (like 204)
  if (response.status === 204) return null;

  return await response.json();
};
