import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('ไม่พบรหัสยืนยันตัวตนจาก Google กรุณาลองใหม่อีกครั้ง');
      return;
    }
    setError('');
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/');
    } catch (err: any) {
      let msg = 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err?.message && typeof err.message === 'string') {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('เข้าสู่ระบบด้วย Google ล้มเหลวหรือถูกยกเลิก');
  };

  // Standard Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอก username และรหัสผ่านให้ครบถ้วน');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      let msg = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err?.message && typeof err.message === 'string') {
        msg = err.message;
      }
      if (msg === '[object Object]' || !msg) {
        msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-main font-sans text-text-main">
      {/* Image Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bg-secondary p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 relative z-10 w-fit">
          <img src="/ReRead_icon.png" alt="ReRead" className="w-6 h-6 object-contain" />
          <span className="font-heading font-semibold text-2xl tracking-wide">ReRead</span>
        </Link>

        <div className="relative z-10 max-w-md mt-auto">
          <h2 className="font-heading text-4xl leading-tight mb-4 text-white font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            ยินดีต้อนรับกลับสู่<br />มุมโปรดของคุณ
          </h2>
          <p className="text-white/90 text-lg leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            เรื่องราวใหม่ๆ และผู้คนที่รักหนังสือเหมือนคุณกำลังรออยู่
          </p>
        </div>

        {/* Cover Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/14104037/pexels-photo-14104037.jpeg"
            alt="ร้านหนังสือ"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <Link to="/" className="flex items-center gap-2">
              <img src="/ReRead_icon.png" alt="ReRead" className="w-6 h-6 object-contain" />
              <span className="font-heading font-semibold text-2xl tracking-wide">ReRead</span>
            </Link>
          </div>

          <h1 className="font-heading text-3xl font-medium mb-2">เข้าสู่ระบบ</h1>
          <p className="text-text-main/70 mb-8">
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <Link to="/signup" className="text-accent hover:underline underline-offset-4 font-medium">
              สมัครสมาชิกที่นี่
            </Link>
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 text-warning text-sm font-medium bg-warning/10 px-3.5 py-2.5 rounded-lg border border-warning/20 flex items-start gap-2">
              <span className="text-base leading-none mt-0.5 flex-shrink-0">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Primary Action: Google Login */}
          <div className="p-6 bg-white/60 border border-border-main rounded-xl shadow-xs flex flex-col items-center">
            <div className="text-center mb-5">
              <p className="text-base font-medium text-text-main">
                เข้าสู่ระบบสะดวกรวดเร็วด้วย Google
              </p>
              <p className="text-xs text-text-main/60 mt-1">
                คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบ หรือเปิดใช้งานบัญชี ReRead อัตโนมัติ
              </p>
            </div>

            {isGoogleLoading ? (
              <div className="flex items-center gap-2.5 py-3 text-sm text-text-main/80 font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                <span>กำลังยืนยันตัวตนกับเซิร์ฟเวอร์...</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="signin_with"
                  width="100%"
                />

              </div>
            )}
          </div>

          {/* Toggle Button for Manual Form */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="inline-flex items-center gap-1.5 text-xs text-text-main/60 hover:text-accent font-medium transition-colors cursor-pointer"
            >
              <span>{showManualForm ? 'ซ่อนฟอร์มชื่อผู้ใช้ / รหัสผ่าน' : 'หรือเข้าสู่ระบบด้วยชื่อผู้ใช้ / รหัสผ่าน'}</span>
              {showManualForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Manual Form */}
          {showManualForm && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 pt-6 border-t border-border-main/60 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="ชื่อผู้ใช้ของคุณ"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">รหัสผ่าน</label>
                  <Link to="#" className="text-xs text-text-main/60 hover:text-text-main transition-colors">
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-bg-main py-2.5 rounded-md font-medium text-base hover:bg-accent/90 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  'เข้าสู่ระบบด้วยรหัสผ่าน'
                )}
              </button>
            </form>
          )}

          <Link to="/" className="flex items-center justify-center gap-2 mt-8 text-sm text-text-main/60 hover:text-text-main transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" /> กลับสู่หน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}
