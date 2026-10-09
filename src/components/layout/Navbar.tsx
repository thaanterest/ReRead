import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, BookPlus, LayoutDashboard, User, Heart, LogOut, BookMarked, MessageCircle, LogIn, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, role } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-accent font-semibold' : 'hover:text-accent transition-colors';

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <nav className="w-full border-b border-border-main bg-bg-main py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/ReRead_icon.png" alt="ReRead" className="w-10 h-10 object-contain" />
          <span className="font-heading font-semibold text-2xl tracking-wide">ReRead</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/browse" className={isActive('/browse')}>ค้นหาหนังสือ</Link>
          <Link to="/marketplace" className={isActive('/marketplace')}>หนังสือมือสอง</Link>
          <Link to="/requests" className={isActive('/requests')}>บอร์ดตามหา</Link>
          {!isAuthenticated && (
            <Link to="/about" className={isActive('/about')}>เกี่ยวกับเรา</Link>
          )}
          {isAuthenticated && (
            <>
              <Link to="/add-book" className={`flex items-center gap-1.5 ${isActive('/add-book')}`}>
                <BookPlus className="w-4 h-4" />
                ลงรายการหนังสือ
              </Link>
              <Link to="/chat" className={`flex items-center gap-1.5 ${isActive('/chat')}`}>
                <MessageCircle className="w-4 h-4" />
                ข้อความ
                <span className="bg-warning text-bg-main text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">2</span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-bg-secondary rounded-full transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-border-main rounded-md hover:bg-bg-secondary transition-colors text-sm font-medium"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="w-7 h-7 rounded-full object-cover bg-bg-secondary" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                  {user.display_name.charAt(0)}
                </div>
              )}
              <span className="hidden md:inline">{user.display_name}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-60 bg-bg-main border border-border-main rounded-md shadow-lg overflow-hidden z-50"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="px-4 py-3 border-b border-border-main bg-bg-secondary flex items-center gap-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full bg-bg-main" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                      {user.display_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{user.display_name}</p>
                    <p className="text-xs text-text-main/60">{user.email}</p>
                  </div>
                </div>

                <div className="py-1">
                  <Link to="/profile" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                    <User className="w-4 h-4 text-text-main/60" /> โปรไฟล์ของฉัน
                  </Link>
                  <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-text-main/60" /> แผงควบคุมการแลกเปลี่ยน
                  </Link>
                  <Link to="/my-books" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                    <BookMarked className="w-4 h-4 text-text-main/60" /> หนังสือของฉัน
                  </Link>
                  <Link to="/wishlist" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                    <Heart className="w-4 h-4 text-text-main/60" /> รายการที่บันทึกไว้
                  </Link>
                  <Link to="/chat" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                    <MessageCircle className="w-4 h-4 text-text-main/60" /> ข้อความ
                    <span className="ml-auto bg-warning text-bg-main text-[10px] font-bold px-1.5 py-0.5 rounded-full">2</span>
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                    <Settings className="w-4 h-4 text-text-main/60" /> ตั้งค่าบัญชี
                  </Link>
                </div>

                {role === 'admin' && (
                  <div className="py-1 border-t border-border-main bg-accent/5">
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-accent" />
                      <span>แผงควบคุมแอดมิน (Admin)</span>
                    </Link>
                  </div>
                )}

                <div className="py-1 border-t border-border-main">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-warning hover:bg-warning/10 transition-colors">
                    <LogOut className="w-4 h-4" /> ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 border border-border-main rounded-md text-sm font-medium hover:bg-bg-secondary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">เข้าสู่ระบบ</span>
            </Link>
            <Link
              to="/signup"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-bg-main rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
