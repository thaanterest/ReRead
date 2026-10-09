import type { ElementType } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Repeat,
  HelpCircle,
  AlertTriangle,
  Layers,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: ElementType;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'ภาพรวมระบบ', path: '/admin', icon: LayoutDashboard },
  { name: 'จัดการผู้ใช้', path: '/admin/users', icon: Users },
  { name: 'จัดการหนังสือ', path: '/admin/books', icon: BookOpen },
  { name: 'การแลกเปลี่ยน', path: '/admin/swaps', icon: Repeat },
  { name: 'บอร์ดตามหา', path: '/admin/requests', icon: HelpCircle },
  { name: 'ข้อร้องเรียน', path: '/admin/reports', icon: AlertTriangle, badge: 2 },
  { name: 'หมวดหมู่หนังสือ', path: '/admin/categories', icon: Layers },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-bg-main border-r border-border-main">
      {/* Brand Header */}
      <div className="p-6 border-b border-border-main flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <img src="/ReRead_icon.png" alt="ReRead Logo" className="w-9 h-9 object-contain" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-semibold text-xl tracking-wide text-text-main">
                ReRead
              </span>
              <span className="text-[10px] uppercase font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-text-main/50 font-sans">ระบบจัดการส่วนกลาง</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          aria-label="ปิดเมนู"
          className="lg:hidden p-1.5 text-text-main/50 hover:text-text-main rounded hover:bg-bg-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 font-sans">
        <div className="text-[11px] font-semibold tracking-widest text-text-main/40 uppercase px-3 py-2">
          เมนูหลัก
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent text-bg-main shadow-sm font-semibold'
                    : 'text-text-main/80 hover:bg-bg-secondary hover:text-text-main'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning text-bg-main">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Exit Links */}
      <div className="p-4 border-t border-border-main bg-bg-secondary/30 flex flex-col gap-1.5 font-sans">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-text-main/70 hover:text-accent hover:bg-bg-secondary transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>ไปหน้าเว็บสำหรับผู้ใช้ (หน้าหลัก)</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-warning hover:bg-warning/10 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>ออกจากระบบแอดมิน</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile / Tablet Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-text-main/40 backdrop-blur-[2px] transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
