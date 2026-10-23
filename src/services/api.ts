/**
 * API service — centralized HTTP client for calling the backend.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://reread-jang.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function translateApiErrorMessage(msg: string): string {
  const clean = String(msg).replace(/^Value error,\s*/i, '').trim();

  // Password rules
  if (/Password must be at least 8 characters/i.test(clean) || /String should have at least 8 characters/i.test(clean)) {
    return 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
  }
  if (/Password must contain at least one uppercase letter/i.test(clean)) {
    return 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว';
  }
  if (/Password must contain at least one digit/i.test(clean)) {
    return 'รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว';
  }
  if (/Password must contain at least one special character/i.test(clean)) {
    return 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว (เช่น !@#$%^&* หรือ _-)';
  }

  // Username rules
  if (/Username must be 3-50 characters/i.test(clean) || /contain only letters, digits, or underscores/i.test(clean)) {
    return 'Username ต้องมีความยาว 3-50 ตัวอักษร และใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น';
  }
  if (/This username is already taken/i.test(clean)) {
    return 'Username นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น';
  }

  // Email rules
  if (/This email is already registered/i.test(clean)) {
    return 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ';
  }
  if (/value is not a valid email address/i.test(clean) || /valid email/i.test(clean)) {
    return 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  // Auth rules
  if (/Incorrect username or password/i.test(clean)) {
    return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
  }
  if (/User is inactive/i.test(clean)) {
    return 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
  }
  if (/Not authenticated/i.test(clean) || /Could not validate credentials/i.test(clean)) {
    return 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง';
  }
  if (/Invalid Google token/i.test(clean) || /Failed to authenticate with Google/i.test(clean)) {
    return 'การยืนยันตัวตนด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
  }


  // General field errors
  if (/Field required/i.test(clean)) {
    return 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง';
  }

  return clean;
}

function extractErrorMessage(status: number, body: any): string {
  if (!body) return `เกิดข้อผิดพลาด (${status})`;

  // Case 1: FastAPI 422 validation errors array
  if (Array.isArray(body.detail)) {
    const errorStrings = body.detail
      .map((item: any) => {
        if (typeof item === 'string') return translateApiErrorMessage(item);
        if (item && typeof item === 'object') {
          const raw = item.msg || item.message || '';
          if (raw) return translateApiErrorMessage(raw);
        }
        return '';
      })
      .filter(Boolean);

    if (errorStrings.length > 0) {
      return Array.from(new Set(errorStrings)).join(' และ ');
    }
  }

  // Case 2: detail is a string
  if (typeof body.detail === 'string') {
    return translateApiErrorMessage(body.detail);
  }

  // Case 3: detail is an object
  if (body.detail && typeof body.detail === 'object') {
    const raw = body.detail.msg || body.detail.message;
    if (typeof raw === 'string') {
      return translateApiErrorMessage(raw);
    }
  }

  // Case 4: message is a string
  if (typeof body.message === 'string') {
    return translateApiErrorMessage(body.message);
  }

  // Fallbacks by status code
  if (status === 409) return 'ข้อมูลนี้ถูกใช้งานแล้วในระบบ (Username หรืออีเมลซ้ำ)';
  if (status === 422) return 'ข้อมูลที่กรอกไม่ตรงตามเงื่อนไขที่กำหนด กรุณาตรวจสอบอีกครั้ง';
  if (status === 401) return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
  if (status === 403) return 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
  if (status === 404) return 'ไม่พบข้อมูลที่ต้องการ';
  if (status >= 500) return 'ระบบเซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง';

  return `เกิดข้อผิดพลาด (${status})`;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle HTTP errors that come with { detail: ... } from FastAPI
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = extractErrorMessage(res.status, body);
    throw new ApiError(res.status, message);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface TokenData {
  access_token: string;
  token_type: string;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function apiRegister(data: {
  username: string;
  email: string;
  password: string;
  display_name: string;
}) {
  return request<UserData>('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiLogin(username: string, password: string) {
  return request<TokenData>('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function apiGoogleLogin(credential: string) {
  return request<TokenData>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, id_token: credential }),
  });
}

export async function apiLogout() {

  return request<null>('/logout', { method: 'POST' });
}

export async function apiGetMe() {
  return request<UserData>('/me');
}

export async function apiChangePassword(oldPassword: string, newPassword: string) {
  return request<null>('/change-password', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

export async function apiCheckUsername(name: string) {
  return request<{ username: string; available: boolean }>(`/check-username/${name}`);
}

export async function apiUpdateUser(userId: string, data: { display_name?: string; avatar_url?: string }) {
  return request<UserData>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

export interface BookData {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  condition: string;
  description: string | null;
  tags: string[];
  status: string;
  listing_type?: string; // 'sell', 'exchange', 'both'
  price?: number | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner: UserData | null;
}

export interface PaginatedBooksData {
  books: BookData[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export async function apiGetBooks(params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  listing_type?: string;
  min_price?: number;
  max_price?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  if (params?.listing_type && params.listing_type !== 'all') query.append('listing_type', params.listing_type);
  if (params?.min_price !== undefined) query.append('min_price', params.min_price.toString());
  if (params?.max_price !== undefined) query.append('max_price', params.max_price.toString());

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedBooksData>(`/books${queryString}`);
}

export async function apiGetMyBooks() {
  return request<BookData[]>('/books/me');
}

export async function apiGetBook(id: string) {
  return request<BookData>(`/books/${id}`);
}

export async function apiCreateBook(data: Partial<BookData>) {
  return request<BookData>('/books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiUpdateBook(id: string, data: Partial<BookData>) {
  return request<BookData>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteBook(id: string) {
  return request<null>(`/books/${id}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Orders & Marketplace
// ---------------------------------------------------------------------------

export interface OrderBookSummary {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  condition: string;
  price: number | null;
}

export interface OrderUserSummary {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface OrderData {
  id: string;
  order_number: string;
  book_id: string;
  buyer_id: string;
  seller_id: string;
  order_type: string;
  book_price: number;
  shipping_fee: number;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  payment_method: string;
  slip_url: string | null;
  courier: string | null;
  tracking_no: string | null;
  shipping_photo_url: string | null;
  shipping_note: string | null;
  status: string; // 'pending', 'paid', 'shipped', 'completed', 'cancelled'
  note: string | null;
  created_at: string;
  updated_at: string;
  book: OrderBookSummary | null;
  buyer: OrderUserSummary | null;
  seller: OrderUserSummary | null;
}

export async function apiCreateOrder(data: {
  book_id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  payment_method?: string;
  slip_url?: string;
  note?: string;
}) {
  return request<OrderData>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetMyOrders() {
  return request<OrderData[]>('/orders/my-orders');
}

export async function apiGetMySales() {
  return request<OrderData[]>('/orders/my-sales');
}

export async function apiGetOrder(id: string) {
  return request<OrderData>(`/orders/${id}`);
}

export async function apiUpdateOrderShipping(
  id: string,
  data: {
    courier: string;
    tracking_no: string;
    shipping_photo_url?: string;
    shipping_note?: string;
  }
) {
  return request<OrderData>(`/orders/${id}/shipping`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function apiConfirmOrderDelivery(id: string) {
  return request<OrderData>(`/orders/${id}/confirm-delivery`, {
    method: 'PATCH',
  });
}

export async function apiCancelOrder(id: string) {
  return request<OrderData>(`/orders/${id}/cancel`, {
    method: 'PATCH',
  });
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export interface BookRequestData {
  id: string;
  title: string;
  author: string;
  description: string;
  owner_id: string;
  created_at: string;
  offers: number;
  owner: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export async function apiGetRequests(params?: {
  page?: number;
  limit?: number;
  search?: string;
  mine?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.search) query.append('search', params.search);
  if (params?.mine) query.append('mine', 'true');

  return request<{ requests: BookRequestData[]; total: number; page: number; limit: number; total_pages: number }>(`/requests?${query.toString()}`);
}

export async function apiCreateRequest(data: {
  title: string;
  author: string;
  description?: string;
}) {
  return request<BookRequestData>('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiDeleteRequest(id: string) {
  return request<null>(`/requests/${id}`, {
    method: 'DELETE',
  });
}

export { ApiError };
