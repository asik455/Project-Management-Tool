// Enhanced authFetch utility with better error handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const getFullUrl = (url) => {
  return url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const authFetch = {
  get: async (url) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Please log in.');
      throw new Error('Authentication required. Please log in again.');
    }
    
    try {
      const fullUrl = getFullUrl(url);
      console.log('Making GET request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token might be expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/signin';
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  post: async (url, data) => {
    const token = localStorage.getItem('token');
    console.log('Auth token from localStorage:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.error('No authentication token found. Please log in.');
      throw new Error('Authentication required. Please log in again.');
    }
    
    try {
      const fullUrl = getFullUrl(url);
      console.log('Making POST request to:', fullUrl);
      console.log('Request data:', data);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        console.log('401 Unauthorized - Removing token and redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/signin';
        throw new Error('Session expired. Please log in again.');
      }
      
      if (response.status === 403) {
        console.log('403 Forbidden - Checking error details');
        const errorText = await response.text();
        console.log('Raw 403 response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.log('Parsed error data:', errorData);
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.message || 'You do not have permission to perform this action.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body:`, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  put: async (url, data) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const fullUrl = getFullUrl(url);
      console.log('Making PUT request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
        throw new Error('Session expired. Please log in again.');
      }
      
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'You do not have permission to perform this action.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  delete: async (url) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const fullUrl = getFullUrl(url);
      console.log('Making DELETE request to:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/signin';
        throw new Error('Session expired. Please log in again.');
      }
      
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'You do not have permission to perform this action.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
};

export default authFetch;