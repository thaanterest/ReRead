import type { AdminReport } from '../types/admin';

export const MOCK_ADMIN_REPORTS: AdminReport[] = [
  {
    id: 'rep-1',
    type: 'ไม่ส่งของ',
    reporter: {
      id: 'u-thana',
      name: 'ธนา ชัยสิทธิ์',
      email: 'thana.ch@gmail.com',
    },
    reportedUser: {
      id: 'u-kawin',
      name: 'กวินทร์ วัฒนชัย',
      email: 'kawin.w@gmail.com',
    },
    reportedBook: {
      id: '6',
      title: '1984',
    },
    createdAt: '2026-10-06 18:15',
    status: 'investigating',
    description: 'ตกลงแลกหนังสือกันในรายการ SWP-2026-003 ผมส่งของให้แล้วตั้งแต่วันที่ 02 ต.ค. แต่อีกฝ่ายไม่ส่งของและไม่อ่านแชทเกิน 5 วันแล้วครับ',
    evidenceUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400',
    internalNote: 'ระงับบัญชีกวินทร์ชั่วคราวแล้ว และกำลังติดตามผู้ใช้ผ่านอีเมลเพื่อขอคำชี้แจง',
  },
  {
    id: 'rep-2',
    type: 'หนังสือไม่ตรงปก',
    reporter: {
      id: 'u-nicha',
      name: 'ณิชา ภัทรวรินทร์',
      email: 'nicha.p@outlook.com',
    },
    reportedUser: {
      id: 'u-poom',
      name: 'ภูมิ ส.',
      email: 'poom.s@yahoo.com',
    },
    reportedBook: {
      id: '2',
      title: 'Norwegian Wood',
    },
    createdAt: '2026-10-07 11:20',
    status: 'new',
    description: 'ระบุในรายการว่า "สภาพเหมือนใหม่" แต่หนังสือที่ได้รับมีรอยไฮไลท์สีเหลืองประมาณ 10 หน้า และสันปกมีรอยยับชัดเจนค่ะ',
    evidenceUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400',
    internalNote: 'รอตรวจสอบภาพถ่ายเพิ่มเติมจากผู้รายงาน',
  },
  {
    id: 'rep-3',
    type: 'สแปม/ข้อมูลเท็จ',
    reporter: {
      id: 'u-mint',
      name: 'มินต์',
      email: 'mint@reread.com',
    },
    reportedUser: {
      id: 'u-kawin',
      name: 'กวินทร์ วัฒนชัย',
      email: 'kawin.w@gmail.com',
    },
    createdAt: '2026-10-07 09:10',
    status: 'resolved',
    description: 'มีผู้ใช้โพสต์กระทู้ตามหาหนังสือที่มีข้อความโฆษณาชวนเชื่อการลงทุนและแนบลิงก์กลุ่มที่ไม่เกี่ยวข้องกับหนังสือค่ะ',
    internalNote: 'แอดมินดำเนินการซ่อนกระทู้และตักเตือนผู้ใช้เรียบร้อยแล้ว',
  },
  {
    id: 'rep-4',
    type: 'ผู้ใช้ไม่เหมาะสม',
    reporter: {
      id: 'u-dao',
      name: 'ดาว ร.',
      email: 'dao.r@hotmail.com',
    },
    reportedUser: {
      id: 'u-unknown',
      name: 'ผู้ใช้ไม่ระบุชื่อ',
      email: 'spammer99@tempmail.com',
    },
    createdAt: '2026-10-08 15:30',
    status: 'dismissed',
    description: 'ส่งข้อความทักทายซ้ำๆ หลายครั้ง แต่ไม่มีเจตนาคุกคาม',
    internalNote: 'ตรวจสอบแล้วไม่พบข้อความผิดกฎชุมชน ได้แนะนำให้ผู้ใช้บล็อกการสนทนา',
  },
];
