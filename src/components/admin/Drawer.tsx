import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-lg',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-text-main/40 backdrop-blur-[2px] flex justify-end"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        className={`relative w-full ${width} bg-bg-main border-l border-border-main shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border-main bg-bg-secondary/30">
          <div>
            <h2 className="font-heading text-xl font-medium text-text-main leading-snug">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-text-main/60 font-sans mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="ปิดแผงข้อมูล"
            className="p-1.5 text-text-main/50 hover:text-text-main rounded-md hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 font-sans">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-border-main bg-bg-secondary/20 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
