import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ArrowRight, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านของผู้ดูแลระบบให้ครบถ้วน');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const success = await loginAdmin(email, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('อีเมลหรือรหัสผ่านแอดมินไม่ถูกต้อง (ลองตรวจสอบ Hint ด้านล่าง)');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@reread.com');
    setPassword('admin1234');
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-bg-main font-sans">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-text-main/60 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าร้านหนังสือ ReRead</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/15 text-accent border border-accent/30 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-medium text-text-main mb-2">
              เข้าสู่ระบบผู้ดูแล
            </h1>
            <p className="text-text-main/60 text-sm">
              สำหรับตรวจสอบรายการหนังสือ ผู้ใช้งาน และระบบการแลกเปลี่ยนส่วนกลาง
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-md text-warning text-xs font-medium leading-relaxed">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-main/80">
                อีเมลผู้ดูแลระบบ (Admin Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@reread.com"
                autoComplete="email"
                className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-main/80">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-bg-secondary/40 border border-border-main rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-accent text-bg-main py-3 rounded-md font-medium text-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบแอดมิน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Testing Hint */}
          <div className="mt-8 p-4 border border-dashed border-border-main rounded-md bg-bg-secondary/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-text-main/70 uppercase tracking-wider">
                บัญชีทดสอบสำหรับส่งงานอาจารย์
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
              >
                <KeyRound className="w-3 h-3" />
                <span>กรอกอัตโนมัติ</span>
              </button>
            </div>
            <p className="text-xs text-text-main/60 font-mono bg-bg-main p-2 rounded border border-border-main">
              อีเมล: <span className="text-text-main font-semibold">admin@reread.com</span>
              <br />
              รหัสผ่าน: <span className="text-text-main font-semibold">admin1234</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-text-main/40 text-center">
          &copy; {new Date().getFullYear()} ReRead Admin Management System
        </div>
      </div>

      {/* Decorative Image Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#231d19] p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10 flex items-center gap-2">
          <img src="/ReRead_icon.png" alt="ReRead" className="w-8 h-8 object-contain" />
          <span className="font-heading font-semibold text-2xl tracking-wide text-white">
            ReRead Admin
          </span>
        </div>

        <div className="relative z-10 max-w-md mt-auto">
          <h2
            className="font-heading text-4xl leading-tight mb-4 text-white font-medium"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
          >
            แผงควบคุมส่วนกลาง
            <br />
            ชุมชนแลกเปลี่ยนหนังสือ
          </h2>
          <p
            className="text-white/90 text-base leading-relaxed"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
          >
            ดูแลความเรียบร้อย ตรวจสอบข้อร้องเรียน และส่งเสริมการส่งต่อหนังสืออันทรงคุณค่าในสังคม
          </p>
        </div>

        {/* Cover Image Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="บรรยากาศห้องสมุดร้านหนังสือ ReRead Admin"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.pexels.com/photos/14104037/pexels-photo-14104037.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-[#2B2420]/70 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1512]/90 via-[#2B2420]/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}
