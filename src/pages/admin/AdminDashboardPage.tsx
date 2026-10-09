import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Repeat,
  AlertTriangle,
  ArrowRight,
  Clock,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';

// Mock monthly swap data for SVG chart
const MONTHLY_SWAPS = [
  { month: 'พ.ค.', count: 145 },
  { month: 'มิ.ย.', count: 182 },
  { month: 'ก.ค.', count: 210 },
  { month: 'ส.ค.', count: 245 },
  { month: 'ก.ย.', count: 290 },
  { month: 'ต.ค.', count: 328 },
];

// Mock category breakdown
const CATEGORY_DISTRIBUTION = [
  { name: 'นิยาย / วรรณกรรม', percent: 38, count: 1220, color: '#7A8B6F' },
  { name: 'จิตวิทยา / พัฒนาตนเอง', percent: 24, count: 770, color: '#A3B19B' },
  { name: 'ไซไฟ / แฟนตาซี', percent: 18, count: 578, color: '#C97B4A' },
  { name: 'สารคดี / ความรู้', percent: 12, count: 385, color: '#DDB69E' },
  { name: 'อื่นๆ', percent: 8, count: 257, color: '#DDD3C3' },
];

// Mock recent activities (8-10 rows)
const RECENT_ACTIVITIES = [
  {
    id: 'act-1',
    type: 'report',
    title: 'มีข้อร้องเรียนใหม่: ธนา ชัยสิทธิ์ แจ้ง "ไม่ส่งของ"',
    time: '10 นาทีที่แล้ว',
    link: '/admin/reports',
    status: 'new',
  },
  {
    id: 'act-2',
    type: 'swap',
    title: 'รายการแลกเปลี่ยน SWP-2026-001 เปลี่ยนเป็น "กำลังจัดส่ง"',
    time: '35 นาทีที่แล้ว',
    link: '/admin/swaps',
    status: 'shipping',
  },
  {
    id: 'act-3',
    type: 'book',
    title: 'วรรณา ก. ลงหนังสือใหม่ "The Secret History"',
    time: '1 ชั่วโมงที่แล้ว',
    link: '/admin/books',
    status: 'approved',
  },
  {
    id: 'act-4',
    type: 'user',
    title: 'สมาชิกใหม่ "ปกรณ์ เลิศพาณิชย์" สมัครเข้าสู่ระบบ',
    time: '2 ชั่วโมงที่แล้ว',
    link: '/admin/users',
    status: 'active',
  },
  {
    id: 'act-5',
    type: 'swap',
    title: 'รายการแลกเปลี่ยน SWP-2026-002 สำเร็จเรียบร้อย',
    time: '4 ชั่วโมงที่แล้ว',
    link: '/admin/swaps',
    status: 'completed',
  },
  {
    id: 'act-6',
    type: 'book',
    title: 'รายการหนังสือ "Dune" ได้รับการอนุมัติขึ้นระบบ',
    time: '6 ชั่วโมงที่แล้ว',
    link: '/admin/books',
    status: 'approved',
  },
  {
    id: 'act-7',
    type: 'user',
    title: 'ระงับบัญชีผู้ใช้ "กวินทร์ วัฒนชัย" ชั่วคราว',
    time: '1 วันที่แล้ว',
    link: '/admin/users',
    status: 'suspended',
  },
  {
    id: 'act-8',
    type: 'report',
    title: 'ปิดเรื่องร้องเรียน: โพสต์สแปมในบอร์ดตามหาหนังสือ',
    time: '1 วันที่แล้ว',
    link: '/admin/reports',
    status: 'resolved',
  },
];

export default function AdminDashboardPage() {
  const maxSwapCount = Math.max(...MONTHLY_SWAPS.map((m) => m.count));

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="ผู้ใช้ทั้งหมด"
          value="1,482"
          change="+8.4% จากเดือนก่อน"
          trend="up"
          icon={Users}
          subtitle="ใช้งานปกติ 1,475 คน"
        />
        <StatCard
          title="หนังสือที่ลงไว้"
          value="3,210"
          change="+14.2% จากเดือนก่อน"
          trend="up"
          icon={BookOpen}
          subtitle="รอตรวจสอบ 3 เล่ม"
        />
        <StatCard
          title="กำลังแลกเปลี่ยน"
          value="48"
          trend="neutral"
          icon={Repeat}
          subtitle="จัดส่งแล้ว 32 รายการ"
          badgeText="กำลังจัดส่ง"
        />
        <StatCard
          title="รายงานรอตรวจสอบ"
          value="2"
          trend="down"
          icon={AlertTriangle}
          subtitle="ต้องตรวจสอบด่วน"
          badgeText="ด่วน 2 เรื่อง"
        />
      </div>

      {/* 2. Action Needed Banner */}
      <div className="bg-bg-secondary/40 border border-border-main rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-warning/15 text-warning flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading font-medium text-base text-text-main">
              มี 3 งานที่ต้องการการตรวจสอบจากแอดมิน
            </h2>
            <p className="text-xs text-text-main/70 font-sans mt-0.5">
              รายงานข้อร้องเรียนใหม่ 2 เรื่อง และหนังสือที่สมาชิกลงใหม่รอการอนุมัติ 1 เล่ม
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/reports"
            className="px-3.5 py-1.5 bg-warning text-bg-main rounded-md text-xs font-medium hover:bg-warning/90 transition-colors inline-flex items-center gap-1.5"
          >
            <span>ดูข้อร้องเรียน (2)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/admin/books"
            className="px-3.5 py-1.5 border border-border-main bg-bg-main text-text-main rounded-md text-xs font-medium hover:border-accent hover:text-accent transition-colors"
          >
            ตรวจหนังสือรออนุมัติ
          </Link>
        </div>
      </div>

      {/* 3. Charts Row (Lightweight SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Swaps Bar Chart */}
        <div className="lg:col-span-2 bg-bg-main border border-border-main rounded-md p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-medium text-lg text-text-main">
                จำนวนการแลกเปลี่ยนรายเดือน
              </h3>
              <p className="text-xs text-text-main/60">
                สถิติการแลกเปลี่ยนหนังสือสำเร็จ 6 เดือนล่าสุด
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-accent/15 text-accent border border-accent/30 font-sans">
              ยอดรวม 1,395 ครั้ง
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 pb-2 px-2 border-b border-border-main/70">
            {MONTHLY_SWAPS.map((item) => {
              const heightPercent = Math.round((item.count / maxSwapCount) * 100);
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip value */}
                  <span className="text-[11px] font-medium text-text-main/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-bg-secondary rounded-t-sm group-hover:bg-accent transition-all duration-300 relative flex items-end overflow-hidden"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="w-full bg-accent/80 group-hover:bg-accent h-full transition-colors" />
                  </div>
                  {/* Month Label */}
                  <span className="text-xs text-text-main/60 font-sans mt-1">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-text-main/50 font-sans">
            <span>อัตราเติบโตเฉลี่ย +17.5% ต่อเดือน</span>
            <span>อัปเดตล่าสุดวันนี้</span>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-bg-main border border-border-main rounded-md p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-heading font-medium text-lg text-text-main">
              สัดส่วนหนังสือตามหมวดหมู่
            </h3>
            <p className="text-xs text-text-main/60">
              การกระจายตัวของหนังสือ 3,210 เล่ม
            </p>
          </div>

          <div className="flex flex-col gap-3.5 my-auto py-2">
            {CATEGORY_DISTRIBUTION.map((cat) => (
              <div key={cat.name} className="flex flex-col gap-1.5 font-sans">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-main/80 font-medium truncate">{cat.name}</span>
                  <span className="text-text-main/60 font-semibold">{cat.percent}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border-main/60 flex items-center justify-between text-xs text-text-main/50">
            <span>หมวดหมู่อันดับ 1: นิยาย / วรรณกรรม</span>
            <Link to="/admin/categories" className="text-accent hover:underline">
              จัดการ →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Activities Table */}
      <div className="bg-bg-main border border-border-main rounded-md overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border-main flex items-center justify-between bg-bg-secondary/20">
          <div>
            <h3 className="font-heading font-medium text-lg text-text-main">
              กิจกรรมล่าสุดในระบบ
            </h3>
            <p className="text-xs text-text-main/60 font-sans">
              บันทึกการกระทำของผู้ใช้และการเปลี่ยนแปลงสถานะรายการต่างๆ
            </p>
          </div>
          <span className="text-xs text-text-main/50 font-sans flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            เรียลไทม์
          </span>
        </div>

        <div className="divide-y divide-border-main/60 font-sans">
          {RECENT_ACTIVITIES.map((act) => (
            <div
              key={act.id}
              className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-main/70 flex-shrink-0">
                  {act.type === 'report' && <AlertTriangle className="w-4 h-4 text-warning" />}
                  {act.type === 'swap' && <Repeat className="w-4 h-4 text-accent" />}
                  {act.type === 'book' && <BookOpen className="w-4 h-4 text-accent" />}
                  {act.type === 'user' && <UserPlus className="w-4 h-4 text-text-main/60" />}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-main truncate">
                    {act.title}
                  </p>
                  <p className="text-xs text-text-main/50 flex items-center gap-2 mt-0.5">
                    <span>{act.time}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={act.status} size="sm" />
                <Link
                  to={act.link}
                  className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                >
                  <span className="hidden sm:inline">ดูรายละเอียด</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
