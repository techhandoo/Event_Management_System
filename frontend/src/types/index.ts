// ─── User ──────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE';
  isActive: boolean;
  createdAt: string;
}

// ─── Auth ──────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// ─── Event ─────────────────────────────────────────────
export interface Event {
  id: number;
  organizerId: number;
  organizerName: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCapacity: number;
  priceCents: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  category: string;
  imageUrl: string;
  createdAt: string;
}

// ─── Booking ───────────────────────────────────────────
export interface Booking {
  id: number;
  userId: number;
  eventId: number;
  eventTitle: string;
  eventVenue: string;
  quantity: number;
  totalCents: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  bookedAt: string;
}

// ─── Notification ──────────────────────────────────────
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── API Response ──────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ─── Paginated Response ────────────────────────────────
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ─── Analytics ─────────────────────────────────────────
export interface Analytics {
  totalUsers: number;
  totalOrganizers: number;
  totalAttendees: number;
  totalEvents: number;
  publishedEvents: number;
  totalBookings: number;
  totalRevenueCents: number;
}

// ─── Password Reset ────────────────────────────────────
export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  email: string;
}
