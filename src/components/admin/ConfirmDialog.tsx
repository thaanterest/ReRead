import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'danger',
  requireReason = false,
  reasonPlaceholder = 'ระบุเหตุผลในการดำเนินการ (จำเป็น)...',
  onConfirm,
  onClose,
  isLoading = false,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  // Handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('กรุณาระบุเหตุผลก่อนดำเนินการ');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  const confirmBtnStyle =
    variant === 'danger'
      ? 'bg-warning text-bg-main hover:bg-warning/90'
      : variant === 'warning'
      ? 'bg-warning text-bg-main hover:bg-warning/90'
      : 'bg-accent text-bg-main hover:bg-accent/90';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-bg-main border border-border-main rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-bg-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-warning/15 text-warning flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 id="confirm-dialog-title" className="font-heading font-medium text-lg text-text-main">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="ปิดกล่องข้อความ"
            className="p-1 text-text-main/50 hover:text-text-main rounded hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 font-sans text-sm text-text-main/80">
          <p className="leading-relaxed">{message}</p>

          {requireReason && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-main/70">
                เหตุผลประกอบการดำเนินการ <span className="text-warning">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                rows={3}
                placeholder={reasonPlaceholder}
                className="w-full text-sm p-3 bg-bg-secondary/40 border border-border-main rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
              />
              {error && <span className="text-xs text-warning">{error}</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-main bg-bg-secondary/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-border-main text-text-main/80 rounded-md text-sm font-medium hover:bg-bg-secondary transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${confirmBtnStyle}`}
          >
            {isLoading ? 'กำลังดำเนินการ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
