import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-border-main bg-bg-secondary py-12 px-6 md:px-12 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src="/ReRead_icon.png" alt="ReRead" className="w-10 h-10 object-contain" />
            <span className="font-heading font-semibold text-2xl">ReRead</span>
          </Link>
          <p className="text-sm text-text-main/70 leading-relaxed">
            แพลตฟอร์มร้านหนังสืออิสระ สำหรับแบ่งปันและแลกเปลี่ยนเรื่องราวสุดโปรดของคุณ
          </p>
        </div>

        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <h4 className="font-heading font-medium mb-2 text-lg">สำรวจ</h4>
            <Link to="/browse" className="text-sm hover:text-accent transition-colors">ค้นหาหนังสือ (แลก)</Link>
            <Link to="/marketplace" className="text-sm hover:text-accent transition-colors">หนังสือมือสอง (ขาย)</Link>
            <Link to="/requests" className="text-sm hover:text-accent transition-colors">บอร์ดตามหาหนังสือ</Link>
            <Link to="/about" className="text-sm hover:text-accent transition-colors">เกี่ยวกับเรา</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-heading font-medium mb-2 text-lg">บัญชีผู้ใช้</h4>
            <Link to="/login" className="text-sm hover:text-accent transition-colors">เข้าสู่ระบบ</Link>
            <Link to="/signup" className="text-sm hover:text-accent transition-colors">สมัครสมาชิก</Link>
            <Link to="/dashboard" className="text-sm hover:text-accent transition-colors">แผงควบคุมของฉัน</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-border-main text-xs text-text-main/50 flex justify-between">
        <p>&copy; {new Date().getFullYear()} ReRead. สงวนลิขสิทธิ์</p>
        <div className="flex gap-4">
          <Link to="#" className="hover:text-text-main">นโยบายความเป็นส่วนตัว</Link>
          <Link to="#" className="hover:text-text-main">ข้อตกลงการใช้งาน</Link>
        </div>
      </div>
    </footer>
  );
}
