import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { ApiError, apiCheckUsername } from '../services/api';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const { register, loginWithGoogle } = useAuth();
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
      let msg = 'สมัครสมาชิกด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
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
    setError('สมัครสมาชิกด้วย Google ล้มเหลวหรือถูกยกเลิก');
  };

  // Check username availability with debounce
  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    if (value.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const res = await apiCheckUsername(value);
      setUsernameStatus(res.data?.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('idle');
    }
  };

  // Real-time password requirement indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !displayName || !email || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง');
      return;
    }

    if (username.length < 3 || username.length > 50 || !/^[A-Za-z0-9_]+$/.test(username)) {
      setError('Username ต้องมีความยาว 3-50 ตัวอักษร และใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Username นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง (เช่น user@example.com)');
      return;
    }

    const missingRules: string[] = [];
    if (!hasMinLength) missingRules.push('ความยาวอย่างน้อย 8 ตัวอักษร');
    if (!hasUppercase) missingRules.push('ตัวพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว');
    if (!hasNumber) missingRules.push('ตัวเลข (0-9) อย่างน้อย 1 ตัว');
    if (!hasSpecialChar) missingRules.push('อักขระพิเศษอย่างน้อย 1 ตัว (เช่น !@#$%^&* หรือ _-)');

    if (missingRules.length > 0) {
      setError(`รหัสผ่านยังไม่ตรงตามเงื่อนไข: ขาด ${missingRules.join(', ')}`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
        display_name: displayName,
      });
      navigate('/');
    } catch (err: any) {
      let msg = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      if (err instanceof ApiError) {
        msg = err.message;
      } else if (err?.message && typeof err.message === 'string') {
        msg = err.message;
      }
      if (msg === '[object Object]' || !msg) {
        msg = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบเงื่อนไขรหัสผ่านและข้อมูลที่กรอก';
      }
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-main font-sans text-text-main">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-12">
            <Link to="/" className="flex items-center gap-2">
              <img src="/ReRead_icon.png" alt="ReRead" className="w-6 h-6 object-contain" />
              <span className="font-heading font-semibold text-2xl tracking-wide">ReRead</span>
            </Link>
          </div>

          <h1 className="font-heading text-3xl font-medium mb-2">สมัครสมาชิก</h1>
          <p className="text-text-main/70 mb-8">
            มีบัญชีผู้ใช้แล้วใช่ไหม?{' '}
            <Link to="/login" className="text-accent hover:underline underline-offset-4 font-medium">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 text-warning text-sm font-medium bg-warning/10 px-3.5 py-2.5 rounded-lg border border-warning/20 flex items-start gap-2">
              <span className="text-base leading-none mt-0.5 flex-shrink-0">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Primary Action: Google Sign-Up */}
          <div className="p-6 bg-white/60 border border-border-main rounded-xl shadow-xs flex flex-col items-center">
            <div className="text-center mb-5">
              <p className="text-base font-medium text-text-main">
                สมัครสมาชิกสะดวกรวดเร็วด้วย Google
              </p>
              <p className="text-xs text-text-main/60 mt-1">
                คลิกปุ่มด้านล่างเพื่อสร้างบัญชี ReRead และเข้าสู่ระบบทันทีในคลิกเดียว
              </p>
            </div>

            {isGoogleLoading ? (
              <div className="flex items-center gap-2.5 py-3 text-sm text-text-main/80 font-medium">
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
                <span>กำลังสร้างบัญชีและเชื่อมต่อระบบ...</span>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="signup_with"
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
              <span>{showManualForm ? 'ซ่อนฟอร์มสมัครสมาชิกทั่วไป' : 'หรือสมัครด้วยข้อมูลส่วนตัว (Username / รหัสผ่าน)'}</span>
              {showManualForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Manual Form */}
          {showManualForm && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 pt-6 border-t border-border-main/60 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className="w-full bg-bg-main border border-border-main rounded-md px-4 py-2.5 pr-10 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                    placeholder="ตัวอักษร ตัวเลข และ _ (3-50 ตัว)"
                    disabled={isSubmitting}
                  />
                  {usernameStatus === 'available' && (
                    <Check className="w-4 h-4 text-accent absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                  {usernameStatus === 'taken' && (
                    <X className="w-4 h-4 text-warning absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-warning text-xs">Username นี้ถูกใช้แล้ว</p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-accent text-xs">Username นี้ใช้ได้!</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">ชื่อ-นามสกุล / นามปากกา</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="ชื่อที่ใช้ในคอมมูนิตี้"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-main border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="hello@example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-bg-main border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
                  placeholder="อย่างน้อย 8 ตัว มีตัวพิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ"
                  disabled={isSubmitting}
                />

                {/* Password Requirements Checklist */}
                <div className="bg-bg-secondary/40 p-2.5 rounded-md border border-border-main/50 space-y-1">
                  <p className="text-xs font-medium text-text-main/70 mb-1">เงื่อนไขความปลอดภัยของรหัสผ่าน:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-accent font-medium' : 'text-text-main/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasMinLength ? 'bg-accent' : 'bg-text-main/30'}`} />
                      <span>อย่างน้อย 8 ตัวอักษร</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase ? 'text-accent font-medium' : 'text-text-main/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasUppercase ? 'bg-accent' : 'bg-text-main/30'}`} />
                      <span>มีตัวพิมพ์ใหญ่ (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-accent font-medium' : 'text-text-main/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasNumber ? 'bg-accent' : 'bg-text-main/30'}`} />
                      <span>มีตัวเลข (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors ${hasSpecialChar ? 'text-accent font-medium' : 'text-text-main/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${hasSpecialChar ? 'bg-accent' : 'bg-text-main/30'}`} />
                      <span>มีอักขระพิเศษ (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-bg-main py-2.5 rounded-md font-medium text-base hover:bg-accent/90 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    กำลังสร้างบัญชี...
                  </>
                ) : (
                  'สร้างบัญชีใหม่'
                )}
              </button>
            </form>
          )}

          <Link to="/" className="flex items-center justify-center gap-2 mt-8 text-sm text-text-main/60 hover:text-text-main transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" /> กลับสู่หน้าแรก
          </Link>
        </div>
      </div>

      {/* Image Side (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bg-secondary p-12 flex-col justify-between order-1 lg:order-2">
        <div className="flex justify-end w-full">
          <Link to="/" className="flex items-center gap-2 relative z-10 w-fit">
            <img src="/ReRead_icon.png" alt="ReRead" className="w-10 h-10 object-contain" />
            <span className="font-heading font-semibold text-2xl tracking-wide">ReRead</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md mt-auto ml-auto text-right">
          <h2 className="font-heading text-4xl leading-tight mb-4 text-white font-medium" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            เริ่มต้นแชร์หนังสือ<br />เล่มโปรดกับเรา
          </h2>
          <p className="text-white/90 text-lg leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            มาร่วมสร้างพื้นที่เล็กๆ ให้หนังสือเดินทางไปสู่มือนักอ่านคนต่อไป
          </p>
        </div>

        {/* Cover Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/6283222/pexels-photo-6283222.jpeg"
            alt="ชั้นหนังสือ"
            className="w-full h-full object-cover opacity-60 mix-blend-multiply"
          />
        </div>
      </div>
    </div>
  );
}
