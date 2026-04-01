const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

type RequestOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
};

async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return null;
}

async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, headers = {}, isFormData = false } = options;
  let accessToken = localStorage.getItem('access_token');

  const fullUrl = `${API_URL}/${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...headers,
    },
  };

  if (accessToken) {
    (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  if (body) {
    if (isFormData) {
      fetchOptions.body = body;
    } else {
      (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }
  }

  let response = await fetch(fullUrl, fetchOptions);

  // Handle Token Expired
  if (response.status === 401 && accessToken) {
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(fullUrl, fetchOptions);
    } else {
      window.dispatchEvent(new Event('logout'));
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, ...errorData };
  }

  // Handle 204 No Content (e.g., DELETE)
  if (response.status === 204) return null;

  return response.json();
}

// Helper to extract results from DRF paginated or plain array responses
function extractResults(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export const api = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any, isFormData = false) =>
    apiRequest(endpoint, { method: 'POST', body, isFormData }),
  patch: (endpoint: string, body: any, isFormData = false) =>
    apiRequest(endpoint, { method: 'PATCH', body, isFormData }),
  put: (endpoint: string, body: any, isFormData = false) =>
    apiRequest(endpoint, { method: 'PUT', body, isFormData }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),

  // ── Profiles ──────────────────────────────
  profiles: {
    getByUsername: async (username: string) => {
      const data = await apiRequest(`profiles/?username=${username}`);
      const profiles = extractResults(data);
      return profiles.length > 0 ? profiles[0] : null;
    },
    list: async (params?: { role?: string; discipline?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.set('role', params.role);
      if (params?.discipline) searchParams.set('discipline', params.discipline);
      const query = searchParams.toString();
      const data = await apiRequest(`profiles/${query ? `?${query}` : ''}`);
      return extractResults(data);
    },
    get: (id: number) => apiRequest(`profiles/${id}/`),
    update: (id: number, body: any, isFormData = false) =>
      apiRequest(`profiles/${id}/`, { method: 'PATCH', body, isFormData }),
    me: () => apiRequest('profiles/me/'),
    search: async (q: string) => {
      const data = await apiRequest(`profiles/search/?q=${encodeURIComponent(q)}`);
      return extractResults(data);
    },
    changePassword: (body: { current_password: string; new_password: string }) =>
      apiRequest('profiles/change_password/', { method: 'POST', body }),
    deleteAccount: (body: { password: string }) =>
      apiRequest('profiles/delete_account/', { method: 'POST', body }),
  },

  // ── Work Samples ──────────────────────────
  workSamples: {
    list: async (profileId?: number) => {
      const query = profileId ? `?profile_id=${profileId}` : '';
      const data = await apiRequest(`work-samples/${query}`);
      return extractResults(data);
    },
    create: (body: any, isFormData = false) =>
      apiRequest('work-samples/', { method: 'POST', body, isFormData }),
    update: (id: number, body: any, isFormData = false) =>
      apiRequest(`work-samples/${id}/`, { method: 'PATCH', body, isFormData }),
    delete: (id: number) =>
      apiRequest(`work-samples/${id}/`, { method: 'DELETE' }),
  },

  // ── Gigs ──────────────────────────────────
  gigs: {
    list: async (params?: { status?: string; discipline?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.discipline) searchParams.set('discipline', params.discipline);
      const query = searchParams.toString();
      const data = await apiRequest(`gigs/${query ? `?${query}` : ''}`);
      return extractResults(data);
    },
    get: (id: number) => apiRequest(`gigs/${id}/`),
    create: (body: any) =>
      apiRequest('gigs/', { method: 'POST', body }),
    update: (id: number, body: any) =>
      apiRequest(`gigs/${id}/`, { method: 'PATCH', body }),
    delete: (id: number) =>
      apiRequest(`gigs/${id}/`, { method: 'DELETE' }),
  },

  // ── Gig Applications ─────────────────────
  gigApplications: {
    list: async (gigId?: number) => {
      const query = gigId ? `?gig_id=${gigId}` : '';
      const data = await apiRequest(`gig-applications/${query}`);
      return extractResults(data);
    },
    create: (body: any) =>
      apiRequest('gig-applications/', { method: 'POST', body }),
    update: (id: number, body: any) =>
      apiRequest(`gig-applications/${id}/`, { method: 'PATCH', body }),
  },

  // ── Messages ──────────────────────────────
  messages: {
    list: async (partnerId?: number) => {
      const query = partnerId ? `?partner_id=${partnerId}` : '';
      const data = await apiRequest(`messages/${query}`);
      return extractResults(data);
    },
    send: (body: { receiver: number; content: string }) =>
      apiRequest('messages/', { method: 'POST', body }),
    markRead: (id: number) =>
      apiRequest(`messages/${id}/mark_read/`, { method: 'PATCH' }),
    markReadBulk: (partnerId: number) =>
      apiRequest('messages/mark_read_bulk/', { method: 'POST', body: { partner_id: partnerId } }),
    unreadCount: () =>
      apiRequest('messages/unread_count/'),
  },

  // ── Notifications ─────────────────────────
  notifications: {
    list: async () => {
      const data = await apiRequest('notifications/');
      return extractResults(data);
    },
    unreadCount: () => apiRequest('notifications/unread_count/'),
    markAllRead: () => apiRequest('notifications/mark_all_read/', { method: 'POST' }),
    markRead: (id: number) =>
      apiRequest(`notifications/${id}/`, { method: 'PATCH', body: { read: true } }),
  },

  // ── Analytics ─────────────────────────────
  analytics: {
    list: async () => {
      const data = await apiRequest('analytics/');
      return extractResults(data);
    },
    track: (body: { profile: number; event_type: string; metadata?: any }) =>
      apiRequest('analytics/', { method: 'POST', body }),
  },

  // ── Bookmarks ─────────────────────────────
  bookmarks: {
    list: async () => {
      const data = await apiRequest('bookmarks/');
      return extractResults(data);
    },
    create: (studentProfileId: number) =>
      apiRequest('bookmarks/', { method: 'POST', body: { student_profile: studentProfileId } }),
    delete: (id: number) =>
      apiRequest(`bookmarks/${id}/`, { method: 'DELETE' }),
  },

  // ── Subscriptions ─────────────────────────
  subscriptions: {
    get: async () => {
      const data = await apiRequest('subscriptions/');
      const subs = extractResults(data);
      return subs.length > 0 ? subs[0] : null;
    },
  },

  // ── Auth ───────────────────────────────────
  auth: {
    login: async (credentials: any) => {
      const data = await apiRequest('auth/login/', { method: 'POST', body: credentials });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      return data;
    },
    register: (data: any) => apiRequest('auth/register/', { method: 'POST', body: data }),
    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('logout'));
    },
    me: () => apiRequest('profiles/me/'),
  }
};
