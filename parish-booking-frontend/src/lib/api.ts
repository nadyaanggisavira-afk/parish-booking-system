const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type BookingStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'umat' | 'admin';
export type FeedbackType = 'suggestion' | 'violation_report';
export type FeedbackStatus = 'new' | 'read' | 'in_progress' | 'done';
export type SuggestionCategory =
  | 'fasilitas_ruangan'
  | 'prosedur_booking'
  | 'kegiatan_paroki'
  | 'lainnya';

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  noWhatsapp: string;
  lingkungan: string;
  role: UserRole;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  room?: Room;
  pemohonId: string;
  pemohon?: { nama: string; lingkungan: string };
  requesterName: string;
  requesterContact: string;
  timPelayanan: string | null;
  purpose: string;
  peminjamanBerkala: boolean;
  suratPermohonanUrl: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  adminNote: string | null;
  createdAt: string;
}

export interface Feedback {
  id: string;
  type: FeedbackType;
  category: SuggestionCategory | null;
  roomId: string | null;
  room?: { name: string } | null;
  reporterName: string | null;
  email: string | null;
  sender?: { nama: string; email: string } | null;
  message: string;
  status: FeedbackStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export interface RoomAvailability {
  room: Room;
  date: string;
  bookings: { id: string; startTime: string; endTime: string; purpose: string }[];
}

export interface DashboardSummary {
  bookingsThisWeek: number;
  pendingCount: number;
  activeRooms: number;
  newReports: number;
  pending: Booking[];
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
export function storeSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      // Let the browser set multipart boundaries for FormData.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new ApiError(res.status, msg ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const api = {
  // Auth
  register: (data: {
    nama: string;
    email: string;
    noWhatsapp: string;
    lingkungan: string;
    password: string;
  }) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Rooms
  listRooms: () => request<Room[]>('/rooms'),
  listAllRooms: () => request<Room[]>('/rooms?includeInactive=true'),
  roomAvailability: (roomId: string, date?: string) =>
    request<RoomAvailability>(`/rooms/${roomId}/availability${date ? `?date=${date}` : ''}`),
  createRoom: (data: { name: string; capacity: number; facilities: string }) =>
    request<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id: string, data: Partial<{ name: string; capacity: number; facilities: string; isActive: boolean }>) =>
    request<Room>(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Bookings (umat)
  createBooking: (form: FormData) =>
    request<Booking>('/bookings', { method: 'POST', body: form }),
  myBookings: () => request<Booking[]>('/bookings/mine'),

  // Bookings (admin)
  listBookings: (params?: { status?: BookingStatus }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return request<Booking[]>(`/bookings${qs}`);
  },
  approveBooking: (id: string, adminNote?: string) =>
    request<Booking>(`/bookings/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ adminNote }) }),
  rejectBooking: (id: string, adminNote?: string) =>
    request<Booking>(`/bookings/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ adminNote }) }),

  // Dashboard
  dashboard: () => request<DashboardSummary>('/admin/dashboard'),

  // Feedback (umat)
  submitFeedback: (data: {
    type: FeedbackType;
    category?: SuggestionCategory;
    roomId?: string;
    email?: string;
    reporterName?: string;
    message: string;
  }) => request<Feedback>('/feedback', { method: 'POST', body: JSON.stringify(data) }),

  // Feedback (admin)
  listFeedback: (params?: { type?: FeedbackType; status?: FeedbackStatus }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Feedback[]>(`/feedback${qs ? `?${qs}` : ''}`);
  },
  advanceFeedbackStatus: (id: string, status: FeedbackStatus) =>
    request<Feedback>(`/feedback/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  replyFeedback: (id: string, message: string) =>
    request<Feedback>(`/feedback/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),

  // Display
  todaysSchedule: () => request<Booking[]>('/schedule/today'),

  // Web Push
  pushPublicKey: () => request<{ publicKey: string | null }>('/push/public-key'),
  pushSubscribe: (sub: PushSubscriptionJSON) =>
    request<unknown>('/push/subscribe', { method: 'POST', body: JSON.stringify(sub) }),
  pushUnsubscribe: (endpoint: string) =>
    request<unknown>('/push/subscribe', { method: 'DELETE', body: JSON.stringify({ endpoint }) }),
};

export { ApiError, API_BASE };
