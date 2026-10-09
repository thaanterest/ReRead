export type AdminRole = 'user' | 'admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  location: string;
  joinedDate: string;
  points: number;
  rating: number;
  successfulSwaps: number;
  status: 'active' | 'suspended';
  role: AdminRole;
  bio?: string;
}

export type BookCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
export type BookApprovalStatus = 'pending' | 'approved' | 'hidden';

export interface AdminBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  condition: BookCondition;
  description: string;
  owner: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  category: string;
  tags: string[];
  isRare: boolean;
  status: 'Available' | 'Pending' | 'Swapped';
  approvalStatus: BookApprovalStatus;
  price?: number | null;
  listingType: 'exchange' | 'sell' | 'both';
  createdAt: string;
}

export type CourierName = 'Flash Express' | 'Kerry Express' | 'J&T Express' | 'Thailand Post';
export type SwapStatus = 'pending' | 'accepted' | 'shipping' | 'completed' | 'cancelled' | 'disputed';

export interface SwapTimelineItem {
  title: string;
  time: string;
  done: boolean;
}

export interface AdminSwap {
  id: string;
  code: string;
  book1: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    ownerName: string;
  };
  book2: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    ownerName: string;
  };
  user1: {
    name: string;
    avatarUrl: string;
    email: string;
  };
  user2: {
    name: string;
    avatarUrl: string;
    email: string;
  };
  step: 1 | 2 | 3 | 4; // 1: ส่งคำขอ, 2: ตอบรับ, 3: กำลังจัดส่ง, 4: ได้รับหนังสือ
  status: SwapStatus;
  courier: CourierName;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  shippingProofUrl?: string;
  notes?: string;
  disputeReason?: string;
  timeline: SwapTimelineItem[];
}

export type RequestStatus = 'active' | 'has_offers' | 'hidden' | 'fulfilled';

export interface AdminRequest {
  id: string;
  bookTitle: string;
  author: string;
  requestedBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  createdAt: string;
  offerCount: number;
  status: RequestStatus;
  description: string;
}

export type ReportType = 'หนังสือไม่ตรงปก' | 'ผู้ใช้ไม่เหมาะสม' | 'ไม่ส่งของ' | 'สแปม/ข้อมูลเท็จ' | 'อื่นๆ';
export type ReportStatus = 'new' | 'investigating' | 'resolved' | 'dismissed';

export interface AdminReport {
  id: string;
  type: ReportType;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser?: {
    id: string;
    name: string;
    email: string;
  };
  reportedBook?: {
    id: string;
    title: string;
  };
  createdAt: string;
  status: ReportStatus;
  description: string;
  evidenceUrl?: string;
  internalNote?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  bookCount: number;
  tags: string[];
}

export interface AdminActivityLog {
  id: string;
  type: 'user_register' | 'book_listed' | 'swap_success' | 'report_filed' | 'book_approved';
  message: string;
  timestamp: string;
  targetLink?: string;
}
