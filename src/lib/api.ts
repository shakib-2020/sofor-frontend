import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to ensure cookies are sent (Better Auth uses cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Better Auth uses cookies, so make sure credentials are included
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to sign in
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const paymentAPI = {
  createBookingWithPayment: (data: any) => 
    apiClient.post('/payment/booking-with-payment', data),
    
  executeBkashPayment: (paymentID: string) => 
    apiClient.post('/payment/bkash/execute', { paymentID }),
    
  queryPaymentStatus: (paymentID: string) => 
    apiClient.get(`/payment/status/${paymentID}`),
    
  getUserPayments: (userId: string, page = 1, limit = 10) => 
    apiClient.get(`/payment/user/${userId}?page=${page}&limit=${limit}`),
};

export const bookingAPI = {
  getAllBookings: (params?: any) => 
    apiClient.get('/booking', { params }),
    
  getBookingById: (id: number) => 
    apiClient.get(`/booking/${id}`),
    
  updateBookingStatus: (id: number, status: string) => 
    apiClient.put(`/booking/${id}/status`, { status }),
    
  getUserBookings: (userId: string, page = 1, limit = 10) => 
    apiClient.get(`/booking/user/${userId}?page=${page}&limit=${limit}`),
    
  cancelBooking: (id: number, reason?: string) => 
    apiClient.put(`/booking/${id}/cancel`, { reason }),
};

export const userAPI = {
  createIfNotExists: () => apiClient.post('/user/create-if-not-exists'),
  getCurrentUser: () => apiClient.get('/user/me')
};
