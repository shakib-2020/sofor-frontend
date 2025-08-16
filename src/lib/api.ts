import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BETTER_SERVER!;

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
      // Only redirect to sign-in if we're not in an auth sync process
      // and not on the auth pages already
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/sign-in') || currentPath.includes('/signup');
      const isCreateUserCall = error.config?.url?.includes('/user/create-if-not-exists');
      
      if (!isAuthPage && !isCreateUserCall) {
        // Handle unauthorized access - redirect to sign in
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const paymentAPI = {
  createBookingWithPayment: (data: any) => 
    apiClient.post('/api/payment/booking-with-payment', data),
    
  executeBkashPayment: (paymentID: string) => 
    apiClient.post('/api/payment/bkash/execute', { paymentID }),
    
  queryPaymentStatus: (paymentID: string) => 
    apiClient.get(`/api/payment/status/${paymentID}`),
    
  getUserPayments: (userId: string, page = 1, limit = 10) => 
    apiClient.get(`/api/payment/user/${userId}?page=${page}&limit=${limit}`),
};

export const bookingAPI = {
  getAllBookings: (params?: any) => 
    apiClient.get('/api/booking', { params }),
    
  getBookingById: (id: number) => 
    apiClient.get(`/api/booking/${id}`),
    
  updateBookingStatus: (id: number, status: string) => 
    apiClient.put(`/api/booking/${id}/status`, { status }),
    
  getUserBookings: (userId: string, page = 1, limit = 10) => 
    apiClient.get(`/api/booking/user/${userId}?page=${page}&limit=${limit}`),
    
  cancelBooking: (id: number, reason?: string) => 
    apiClient.put(`/api/booking/${id}/cancel`, { reason }),
};

export const userAPI = {
  createIfNotExists: () => apiClient.post('/api/user/create-if-not-exists'),
  getCurrentUser: () => apiClient.get('/api/user/me')
};
