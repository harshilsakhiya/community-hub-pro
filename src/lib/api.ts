// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set auth token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove auth token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  verifyOTP: (data: { phone: string; otp: string }) =>
    apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiRequest<{ success: boolean; data: { token: string; user: User } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  sendLoginOTP: (data: { phone: string }) =>
    apiRequest('/auth/send-login-otp', { method: 'POST', body: JSON.stringify(data) }),

  verifyLoginOTP: (data: { phone: string; otp: string }) =>
    apiRequest<{ success: boolean; data: { token: string; user: User } }>(
      '/auth/verify-login-otp',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  getMe: () => apiRequest<{ success: boolean; data: User }>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiRequest<{ success: boolean; data: DashboardStats }>('/dashboard/stats'),

  getCollectionChart: (months = 6) =>
    apiRequest(`/dashboard/collection-chart?months=${months}`),

  getRecentActivity: () => apiRequest('/dashboard/recent-activity'),
};

// Bills API
export const billsAPI = {
  getAll: (params?: { page?: number; status?: string; month?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: Bill[]; pagination: Pagination }>(
      `/bills${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) => apiRequest<{ success: boolean; data: Bill }>(`/bills/${id}`),

  generate: (data: { billingMonth: string; dueDate: string }) =>
    apiRequest('/bills/generate', { method: 'POST', body: JSON.stringify(data) }),

  markPaid: (id: string, data: { paymentMethod: string; transactionId?: string }) =>
    apiRequest(`/bills/${id}/mark-paid`, { method: 'POST', body: JSON.stringify(data) }),

  getSummary: () => apiRequest('/bills/summary'),
};

// Complaints API
export const complaintsAPI = {
  getAll: (params?: { page?: number; status?: string; category?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: Complaint[]; pagination: Pagination }>(
      `/complaints${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) => apiRequest<{ success: boolean; data: Complaint }>(`/complaints/${id}`),

  create: (data: { title: string; description: string; category: string; priority?: string }) =>
    apiRequest('/complaints', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: string, data: { status: string; resolutionNotes?: string }) =>
    apiRequest(`/complaints/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  addComment: (id: string, data: { comment: string }) =>
    apiRequest(`/complaints/${id}/comments`, { method: 'POST', body: JSON.stringify(data) }),

  getStats: () => apiRequest('/complaints/stats'),
};

// Visitors API
export const visitorsAPI = {
  getAll: (params?: { page?: number; date?: string; status?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: Visitor[]; pagination: Pagination }>(
      `/visitors${queryString ? `?${queryString}` : ''}`
    );
  },

  create: (data: {
    name: string;
    phone: string;
    purpose: string;
    visitorType?: string;
    flat?: string;
    vehicleNumber?: string;
  }) => apiRequest('/visitors', { method: 'POST', body: JSON.stringify(data) }),

  verifyOTP: (otp: string) =>
    apiRequest('/visitors/verify-otp', { method: 'POST', body: JSON.stringify({ otp }) }),

  verifyQR: (qrCode: string) =>
    apiRequest('/visitors/verify-qr', { method: 'POST', body: JSON.stringify({ qrCode }) }),

  checkIn: (id: string) => apiRequest(`/visitors/${id}/checkin`, { method: 'POST' }),

  checkOut: (id: string) => apiRequest(`/visitors/${id}/checkout`, { method: 'POST' }),

  getStats: () => apiRequest('/visitors/stats'),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (params?: { page?: number; type?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: Vehicle[]; pagination: Pagination }>(
      `/vehicles${queryString ? `?${queryString}` : ''}`
    );
  },

  create: (data: {
    vehicleNumber: string;
    vehicleType: string;
    make?: string;
    model?: string;
    color?: string;
  }) => apiRequest('/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  checkByNumber: (vehicleNumber: string) =>
    apiRequest<{ success: boolean; data: Vehicle; isRegistered: boolean }>(
      `/vehicles/check/${vehicleNumber}`
    ),

  delete: (id: string) => apiRequest(`/vehicles/${id}`, { method: 'DELETE' }),

  getStats: () => apiRequest('/vehicles/stats'),
};

// Notices API
export const noticesAPI = {
  getAll: (params?: { page?: number; category?: string; pinned?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: Notice[]; pagination: Pagination }>(
      `/notices${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) => apiRequest<{ success: boolean; data: Notice }>(`/notices/${id}`),

  create: (data: {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    expiryDate?: string;
  }) => apiRequest('/notices', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Notice>) =>
    apiRequest(`/notices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => apiRequest(`/notices/${id}`, { method: 'DELETE' }),

  togglePin: (id: string) => apiRequest(`/notices/${id}/toggle-pin`, { method: 'POST' }),
};

// Flats API
export const flatsAPI = {
  getAll: (params?: { page?: number; block?: string; occupied?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: Flat[]; pagination: Pagination }>(
      `/flats${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) => apiRequest<{ success: boolean; data: Flat }>(`/flats/${id}`),

  assignResident: (id: string, data: { userId: string; occupancyType: string }) =>
    apiRequest(`/flats/${id}/assign-resident`, { method: 'POST', body: JSON.stringify(data) }),
};

// Residents API
export const residentsAPI = {
  getAll: (params?: { page?: number; search?: string; role?: string }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<{ success: boolean; data: User[]; pagination: Pagination }>(
      `/residents${queryString ? `?${queryString}` : ''}`
    );
  },

  getById: (id: string) => apiRequest<{ success: boolean; data: User }>(`/residents/${id}`),

  updateRole: (id: string, role: string) =>
    apiRequest(`/residents/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
};

// Payments API
export const paymentsAPI = {
  createRazorpayOrder: (billId: string) =>
    apiRequest('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ billId }),
    }),

  verifyRazorpayPayment: (data: {
    orderId: string;
    paymentId: string;
    signature: string;
    billId: string;
  }) => apiRequest('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(data) }),

  createStripeIntent: (billId: string) =>
    apiRequest('/payments/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ billId }),
    }),

  getHistory: (params?: { page?: number }) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/payments/history${queryString ? `?${queryString}` : ''}`);
  },
};

// Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'society_admin' | 'resident' | 'gatekeeper' | 'committee_member';
  avatar?: string;
  society?: { _id: string; name: string };
  flat?: { _id: string; flatNumber: string; block: string };
}

export interface DashboardStats {
  role: string;
  admin?: {
    totalFlats: number;
    occupiedFlats: number;
    vacantFlats: number;
    totalResidents: number;
    pendingBills: number;
    overdueBills: number;
    monthlyCollection: number;
    openComplaints: number;
    todayVisitors: number;
  };
  gatekeeper?: {
    todayCheckins: number;
    currentlyInside: number;
    pendingVisitors: number;
    totalVehicles: number;
  };
  resident?: {
    pendingBills: number;
    totalPendingAmount: number;
    openComplaints: number;
    registeredVehicles: number;
  };
}

export interface Bill {
  _id: string;
  invoiceNumber: string;
  billingMonth: string;
  amount: number;
  lateFee: number;
  totalAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  flat: { _id: string; flatNumber: string; block: string };
}

export interface Complaint {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  flat: { _id: string; flatNumber: string; block: string };
  submittedBy: { firstName: string; lastName: string };
}

export interface Visitor {
  _id: string;
  name: string;
  phone: string;
  purpose: string;
  visitorType: string;
  otp: string;
  qrCode: string;
  checkInTime?: string;
  checkOutTime?: string;
  flat: { _id: string; flatNumber: string; block: string };
}

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleType: string;
  make?: string;
  model?: string;
  parkingSlot?: string;
  flat: { _id: string; flatNumber: string; block: string };
  owner: { firstName: string; lastName: string };
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  createdBy: { firstName: string; lastName: string };
}

export interface Flat {
  _id: string;
  block: string;
  floor: number;
  flatNumber: string;
  flatType: string;
  areaSqft: number;
  isOccupied: boolean;
  occupancyType: 'owner' | 'tenant' | 'vacant';
  owner?: { firstName: string; lastName: string };
  currentResident?: { firstName: string; lastName: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages?: number;
}
