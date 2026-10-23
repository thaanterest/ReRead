import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User, Lock, LogOut, Camera, Save, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiUpdateUser, apiChangePassword } from '../services/api';

type ActiveTab = 'profile' | 'security';

// Predefined avatar choices (Dicebear API - generates unique avatars from seeds)
const AVATAR_PRESETS = [
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Mia&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Kira&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Leo&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Nina&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Tom&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Sara&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/thumbs/svg?seed=Max&backgroundColor=ffdfbf',
];

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile tab states
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security tab states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSavingPwd, setIsSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Populate form once user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        setProfileMsg({ type: 'error', text: 'ขนาดไฟล์ภาพต้องไม่เกิน 4MB ค่ะ' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          setProfileMsg({ type: 'success', text: 'เลือกรูปภาพเรียบร้อยแล้ว อย่าลืมกด "บันทึกการเปลี่ยนแปลง" นะคะ' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await apiUpdateUser(user!.id, {
        display_name: displayName.trim(),
        avatar_url: avatarUrl || undefined,
      });
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้วค่ะ!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน' });
      return;
    }
    if (newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }
    setIsSavingPwd(true);
    try {
      await apiChangePassword(oldPassword, newPassword);
      setPwdMsg({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จแล้วค่ะ!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.message || 'รหัสผ่านเดิมไม่ถูกต้อง' });
    } finally {
      setIsSavingPwd(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentAvatar = avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username}`;

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'ข้อมูลส่วนตัว', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'ความปลอดภัย', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
      {/* Hidden native file input for gallery / files */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      <div className="mb-6 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-medium mb-2">ตั้งค่าบัญชี</h1>
        <p className="text-sm sm:text-base text-text-main/60">จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชีคุณ</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">

        {/* Left Sidebar: Tabs + Avatar Preview */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4 md:gap-6">
          {/* Avatar Preview & Click to Change */}
          <div className="flex flex-col items-center p-6 bg-bg-secondary border border-border-main rounded-md gap-3">
            <div 
              onClick={triggerFileSelect}
              className="relative cursor-pointer group"
              title="กดเพื่อเลือกรูปภาพจากแกลลอรี่ / ไฟล์ในเครื่อง"
            >
              <img
                src={currentAvatar}
                alt={user?.display_name}
                className="w-24 h-24 rounded-full object-cover border-2 border-border-main bg-bg-main group-hover:opacity-90 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.username}`;
                }}
              />
              <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-accent rounded-full flex items-center justify-center border-2 border-bg-secondary group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5 text-bg-main" />
              </div>
            </div>
            
            <button
              type="button"
              onClick={triggerFileSelect}
              className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" /> เปลี่ยนรูปโปรไฟล์ (แกลลอรี่)
            </button>

            <div className="text-center">
              <p className="font-heading font-medium text-text-main">{user?.display_name}</p>
              <p className="text-xs text-text-main/50 mt-0.5">@{user?.username}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 sm:gap-3 px-4 py-2.5 sm:py-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent/10 text-accent font-semibold border border-accent/20 md:border-transparent'
                    : 'text-text-main/70 hover:bg-bg-secondary hover:text-text-main border border-border-main/50 md:border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-left text-warning/80 hover:bg-warning/10 hover:text-warning transition-colors mt-2"
            >
              <LogOut className="w-4 h-4" />
              ออกจากระบบ
            </button>
          </nav>
        </aside>

        {/* Right Panel: Tab Content */}
        <div className="flex-1">

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="bg-bg-main border border-border-main rounded-md p-5 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-heading font-medium mb-6">ข้อมูลส่วนตัว</h2>

              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                {/* Display Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">ชื่อที่แสดง (Display Name)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                    className="w-full bg-bg-secondary border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm sm:text-base"
                    placeholder="ชื่อที่จะแสดงให้ผู้อื่นเห็น"
                  />
                </div>

                {/* Username (Read-only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-main/60">Username (ไม่สามารถเปลี่ยนได้)</label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    readOnly
                    className="w-full bg-bg-secondary/50 border border-border-main rounded-md px-4 py-2.5 text-text-main/50 cursor-not-allowed text-sm"
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-main/60">อีเมล (ไม่สามารถเปลี่ยนได้)</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    readOnly
                    className="w-full bg-bg-secondary/50 border border-border-main rounded-md px-4 py-2.5 text-text-main/50 cursor-not-allowed text-sm"
                  />
                </div>

                {/* Avatar Selection: Upload from Device or Pick Preset */}
                <div className="flex flex-col gap-3 pt-2 border-t border-border-main/60">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">รูปภาพโปรไฟล์</label>
                    <button
                      type="button"
                      onClick={triggerFileSelect}
                      className="text-xs text-accent font-medium hover:underline flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" /> อัปโหลดจากแกลลอรี่ / อุปกรณ์
                    </button>
                  </div>

                  {/* Avatar Presets */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-text-main/60">หรือเลือกจาก Avatar สำเร็จรูป:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                      {AVATAR_PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(preset)}
                          className={`aspect-square rounded-full overflow-hidden border-2 transition-all ${
                            avatarUrl === preset
                              ? 'border-accent scale-110 shadow-md shadow-accent/30 ring-2 ring-accent/20'
                              : 'border-border-main hover:border-accent/50 hover:scale-105'
                          }`}
                        >
                          <img src={preset} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback message */}
                {profileMsg && (
                  <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-md ${
                    profileMsg.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-warning/10 text-warning'
                  }`}>
                    {profileMsg.type === 'success'
                      ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    }
                    {profileMsg.text}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 bg-accent text-bg-main px-8 py-2.5 rounded-md font-medium hover:bg-accent/90 transition-colors disabled:opacity-70"
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <div className="bg-bg-main border border-border-main rounded-md p-6 md:p-8">
              <h2 className="text-2xl font-heading font-medium mb-2">เปลี่ยนรหัสผ่าน</h2>
              <p className="text-text-main/60 text-sm mb-6">เพื่อความปลอดภัย กรุณาใช้รหัสผ่านที่คาดเดาได้ยากและไม่ซ้ำกับที่ใช้ในเว็บไซต์อื่น</p>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
                {/* Old Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      required
                      className="w-full bg-bg-secondary border border-border-main rounded-md px-4 py-2.5 pr-10 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                    <button type="button" onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-3 text-text-main/40 hover:text-text-main transition-colors">
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full bg-bg-secondary border border-border-main rounded-md px-4 py-2.5 pr-10 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-3 text-text-main/40 hover:text-text-main transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {newPassword && (
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          newPassword.length >= i * 3
                            ? i <= 1 ? 'bg-warning' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-green-400' : 'bg-green-500'
                            : 'bg-border-main'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full bg-bg-secondary border rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 transition-all ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-warning focus:border-warning focus:ring-warning'
                        : 'border-border-main focus:border-accent focus:ring-accent'
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-warning">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </div>

                {/* Feedback message */}
                {pwdMsg && (
                  <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-md ${
                    pwdMsg.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-warning/10 text-warning'
                  }`}>
                    {pwdMsg.type === 'success'
                      ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    }
                    {pwdMsg.text}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPwd}
                    className="flex items-center gap-2 bg-accent text-bg-main px-8 py-2.5 rounded-md font-medium hover:bg-accent/90 transition-colors disabled:opacity-70"
                  >
                    {isSavingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    เปลี่ยนรหัสผ่าน
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
