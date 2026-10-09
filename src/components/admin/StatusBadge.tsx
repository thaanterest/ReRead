
export type StatusVariant =
  | 'active'
  | 'suspended'
  | 'pending'
  | 'approved'
  | 'hidden'
  | 'shipping'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'new'
  | 'investigating'
  | 'resolved'
  | 'dismissed'
  | 'has_offers'
  | 'fulfilled';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  // User statuses
  active: {
    label: 'ปกติ',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
  suspended: {
    label: 'ถูกระงับ',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning',
  },

  // Book approval statuses
  approved: {
    label: 'เผยแพร่แล้ว',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
  pending: {
    label: 'รอตรวจสอบ',
    bg: 'bg-warning/15',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning',
  },
  hidden: {
    label: 'ถูกซ่อน',
    bg: 'bg-text-main/10',
    text: 'text-text-main/70',
    border: 'border-border-main',
    dot: 'bg-text-main/40',
  },

  // Swap statuses
  shipping: {
    label: 'กำลังจัดส่ง',
    bg: 'bg-accent/15',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
  completed: {
    label: 'สำเร็จ',
    bg: 'bg-accent/20',
    text: 'text-accent',
    border: 'border-accent/40',
    dot: 'bg-accent',
  },
  cancelled: {
    label: 'ยกเลิก',
    bg: 'bg-text-main/10',
    text: 'text-text-main/60',
    border: 'border-border-main',
    dot: 'bg-text-main/40',
  },
  disputed: {
    label: 'มีข้อพิพาท',
    bg: 'bg-warning/15',
    text: 'text-warning',
    border: 'border-warning/40',
    dot: 'bg-warning',
  },

  // Report statuses
  new: {
    label: 'ใหม่',
    bg: 'bg-warning/20',
    text: 'text-warning',
    border: 'border-warning/40',
    dot: 'bg-warning animate-pulse',
  },
  investigating: {
    label: 'กำลังตรวจสอบ',
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning',
  },
  resolved: {
    label: 'ปิดเรื่อง/แก้ไขแล้ว',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
  dismissed: {
    label: 'ยกเลิกคำร้อง',
    bg: 'bg-text-main/5',
    text: 'text-text-main/60',
    border: 'border-border-main',
    dot: 'bg-text-main/30',
  },

  // Request statuses
  has_offers: {
    label: 'มีผู้เสนอแล้ว',
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
  fulfilled: {
    label: 'ได้รับแล้ว',
    bg: 'bg-accent/15',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent',
  },
};

export default function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-bg-secondary',
    text: 'text-text-main',
    border: 'border-border-main',
    dot: 'bg-text-main/40',
  };

  const displayLabel = label || config.label;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-sans font-medium rounded-sm border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayLabel}</span>
    </span>
  );
}
