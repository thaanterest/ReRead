import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, ExternalLink, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminTopbarProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'ภาพรวมระบบ', subtitle: 'สรุปสถานะการใช้งานและสถิติสำคัญของ ReRead' },
  '/admin/users': { title: 'จัดการผู้ใช้', subtitle: 'ตรวจสอบรายชื่อผู้ใช้งาน สถานะบัญชี และแต้มสะสม' },
  '/admin/books': { title: 'จัดการหนังสือ', subtitle: 'ตรวจสอบและอนุมัติรายการหนังสือที่สมาชิกลงไว้' },
  '/admin/swaps': { title: 'การแลกเปลี่ยน', subtitle: 'ติดตามสถานะการแลกเปลี่ยน พัสดุ และข้อพิพาท' },
  '/admin/requests': { title: 'บอร์ดตามหาหนังสือ', subtitle: 'ดูแลกระทู้ตามหาหนังสือและป้องกันเนื้อหาไม่เหมาะสม' },
  '/admin/reports': { title: 'รายงานและข้อร้องเรียน', subtitle: 'จัดการข้อร้องเรียนจากผู้ใช้และตรวจสอบหลักฐาน' },
  '/admin/categories': { title: 'หมวดหมู่หนังสือ', subtitle: 'จัดการหมวดหมู่และแท็กสำหรับระบบค้นหา' },
};

export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutAdmin } = useAuth();

  const currentMeta = PAGE_TITLES[location.pathname] || {
    title: 'ผู้ดูแลระบบ',
    subtitle: 'ระบบจัดการหลังบ้าน ReRead',
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 border-b border-border-main bg-bg-main/90 backdrop-blur-sm sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="เปิดเมนูนำทาง"
          className="lg:hidden p-2 text-text-main/70 hover:text-text-main rounded-md hover:bg-bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="font-heading font-medium text-lg sm:text-xl text-text-main leading-tight">
            {currentMeta.title}
          </h1>
          <p className="hidden sm:block text-[11px] text-text-main/50 font-sans leading-none mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick link & Admin Profile */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-main rounded-md text-xs font-sans font-medium text-text-main/70 hover:text-accent hover:border-accent transition-colors bg-bg-secondary/40"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>หน้าเว็บผู้ใช้</span>
        </Link>

        {/* Admin pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-border-main/60">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-semibold text-xs flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left font-sans">
            <p className="text-xs font-medium text-text-main leading-tight">
              {user?.display_name || 'ผู้ดูแลระบบ'}
            </p>
            <p className="text-[10px] text-accent font-medium leading-tight">
              Super Admin
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="ออกจากระบบแอดมิน"
            aria-label="ออกจากระบบ"
            className="p-1.5 text-text-main/50 hover:text-warning rounded hover:bg-warning/10 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
