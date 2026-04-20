import axios from 'axios';

// Route browser API traffic through Next.js so auth cookies stay same-origin.
export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000, // 30 seconds timeout
  withCredentials: true, // Enable cookies for all requests globally
});

// Request interceptor to ensure cookies are sent (Better Auth uses cookies)
apiClient.interceptors.request.use(
  (config) => {
    // Better Auth uses cookies, so make sure credentials are included
    config.withCredentials = true;

    // Add additional headers for better cookie handling
    config.headers.set('X-Requested-With', 'XMLHttpRequest');
    config.headers.set('Cache-Control', 'no-cache');

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
      const isAuthPage =
        currentPath.includes('/sign-in') || currentPath.includes('/signup');
      if (!isAuthPage) {
        // Handle unauthorized access - redirect to sign in
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const paymentAPI = {
  createBookingWithPayment: (data: Record<string, unknown>) =>
    apiClient.post('/api/payment/booking-with-payment', data),

  executeBkashPayment: (paymentID: string) =>
    apiClient.post('/api/payment/bkash/execute', { paymentID }),

  queryPaymentStatus: (paymentID: string) =>
    apiClient.get(`/api/payment/status/${paymentID}`),

  getUserPayments: (userId: string, page = 1, limit = 10) =>
    apiClient.get(`/api/payment/user/${userId}?page=${page}&limit=${limit}`),
};

export const bookingAPI = {
  getAllBookings: (params?: Record<string, unknown>) =>
    apiClient.get('/api/booking', { params }),

  getBookingById: (id: number) => apiClient.get(`/api/booking/${id}`),

  updateBookingStatus: (id: number, status: string) =>
    apiClient.put(`/api/booking/${id}/status`, { status }),

  getUserBookings: (userId: string, page = 1, limit = 10) =>
    apiClient.get(`/api/booking/user/${userId}?page=${page}&limit=${limit}`),

  cancelBooking: (id: number, reason?: string) =>
    apiClient.put(`/api/booking/${id}/cancel`, { reason }),
};

export const userAPI = {
  getCurrentUser: () => apiClient.get('/api/user/me'),
};
