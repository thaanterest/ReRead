import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ChevronDown, BookPlus, LayoutDashboard, User, Heart, 
  LogOut, BookMarked, MessageCircle, LogIn, Settings, Shield, 
  Menu, X, BookOpen, Tag, Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, role } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-accent font-semibold' : 'hover:text-accent transition-colors';

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="w-full border-b border-border-main bg-bg-main py-3.5 px-4 sm:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 -ml-1 text-text-main md:hidden hover:bg-bg-secondary rounded-md transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
            <img src="/ReRead_icon.png" alt="ReRead" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="font-heading font-semibold text-xl sm:text-2xl tracking-wide">ReRead</span>
          </Link>

          {/* Desktop Navigation */}
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

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            to="/browse" 
            className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-main"
            title="ค้นหา"
          >
            <Search className="w-5 h-5" />
          </Link>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 border border-border-main rounded-md hover:bg-bg-secondary transition-colors text-sm font-medium"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name} className="w-7 h-7 rounded-full object-cover bg-bg-secondary" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                    {user.display_name.charAt(0)}
                  </div>
                )}
                <span className="hidden md:inline max-w-[120px] truncate">{user.display_name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform hidden sm:inline ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-bg-main border border-border-main rounded-md shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-border-main bg-bg-secondary flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className="w-10 h-10 rounded-full bg-bg-main object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                        {user.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{user.display_name}</p>
                      <p className="text-xs text-text-main/60 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link to="/profile" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                      <User className="w-4 h-4 text-text-main/60" /> โปรไฟล์ของฉัน
                    </Link>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg-secondary transition-colors">
                      <LayoutDashboard className="w-4 h-4 text-text-main/60" /> แผงควบคุมคำสั่งซื้อ/ขาย
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
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-border-main rounded-md text-sm font-medium hover:bg-bg-secondary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </Link>
              <Link
                to="/signup"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-bg-main rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer / Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-bg-main border-r border-border-main h-full flex flex-col z-50 shadow-2xl overflow-y-auto">
            <div className="p-4 border-b border-border-main flex items-center justify-between bg-bg-secondary/40">
              <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                <img src="/ReRead_icon.png" alt="ReRead" className="w-8 h-8 object-contain" />
                <span className="font-heading font-semibold text-xl">ReRead</span>
              </Link>
              <button 
                onClick={closeMobileMenu}
                className="p-1.5 text-text-main/60 hover:text-text-main rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-1 flex-1 font-medium text-base">
              <Link
                to="/browse"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/browse')}`}
              >
                <BookOpen className="w-5 h-5 text-accent" /> ค้นหาหนังสือแลก
              </Link>
              <Link
                to="/marketplace"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/marketplace')}`}
              >
                <Tag className="w-5 h-5 text-accent" /> หนังสือมือสอง (ซื้อ-ขาย)
              </Link>
              <Link
                to="/requests"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/requests')}`}
              >
                <Users className="w-5 h-5 text-accent" /> บอร์ดตามหาหนังสือ
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="my-2 border-t border-border-main/60" />
                  <Link
                    to="/add-book"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md bg-accent/10 text-accent font-semibold`}
                  >
                    <BookPlus className="w-5 h-5" /> ลงรายการหนังสือ
                  </Link>
                  <Link
                    to="/chat"
                    onClick={closeMobileMenu}
                    className={`flex items-center justify-between px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/chat')}`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-text-main/70" /> กล่องข้อความ
                    </div>
                    <span className="bg-warning text-bg-main text-xs font-bold px-2 py-0.5 rounded-full">2</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/dashboard')}`}
                  >
                    <LayoutDashboard className="w-5 h-5 text-text-main/70" /> แผงควบคุมคำสั่งซื้อ/ขาย
                  </Link>
                  <Link
                    to="/my-books"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/my-books')}`}
                  >
                    <BookMarked className="w-5 h-5 text-text-main/70" /> หนังสือของฉัน
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/wishlist')}`}
                  >
                    <Heart className="w-5 h-5 text-text-main/70" /> รายการที่บันทึกไว้
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/about"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md hover:bg-bg-secondary transition-colors ${isActive('/about')}`}
                  >
                    เกี่ยวกับเรา
                  </Link>
                  <div className="mt-auto pt-6 flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="w-full text-center py-2.5 border border-border-main rounded-md text-sm font-medium hover:bg-bg-secondary transition-colors"
                    >
                      เข้าสู่ระบบ
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMobileMenu}
                      className="w-full text-center py-2.5 bg-accent text-bg-main rounded-md text-sm font-medium hover:bg-accent/90 transition-colors"
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                </>
              )}
            </div>

            {isAuthenticated && (
              <div className="p-4 border-t border-border-main bg-bg-secondary/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-warning hover:bg-warning/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
