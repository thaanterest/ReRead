import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/40 backdrop-blur-[2px] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-bg-main border border-border-main rounded-md shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 my-8`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border-main bg-bg-secondary/40">
          <div>
            <h3 className="font-heading font-medium text-lg text-text-main">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-text-main/60 font-sans mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="p-1 text-text-main/50 hover:text-text-main rounded hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 font-sans text-sm text-text-main/80 max-h-[calc(85vh-130px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-main bg-bg-secondary/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
