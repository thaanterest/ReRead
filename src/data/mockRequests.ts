import type { AdminRequest } from '../types/admin';

export const MOCK_ADMIN_REQUESTS: AdminRequest[] = [
  {
    id: 'req-1',
    bookTitle: 'หนึ่งร้อยปีแห่งความโดดเดี่ยว (One Hundred Years of Solitude)',
    author: 'Gabriel García Márquez',
    requestedBy: {
      id: 'u-mint',
      name: 'มินต์',
      avatarUrl: '/avatar-mint.png',
    },
    createdAt: '2026-10-02 10:15',
    offerCount: 3,
    status: 'has_offers',
    description: 'ตามหาฉบับแปลไทย สภาพดีหรือพอใช้ มีหนังสือไซไฟหรือวรรณกรรมพร้อมแลกหลายเล่มค่ะ',
  },
  {
    id: 'req-2',
    bookTitle: 'เจ้าชายน้อย (Le Petit Prince)',
    author: 'Antoine de Saint-Exupéry',
    requestedBy: {
      id: 'u-wanna',
      name: 'วรรณา ก.',
      avatarUrl: '/avatar-wanna.png',
    },
    createdAt: '2026-10-05 16:40',
    offerCount: 0,
    status: 'active',
    description: 'ตามหาปกแข็ง ฉบับพิมพ์พิเศษ สำหรับสะสม ยินดีนำ The Secret History มาแลกค่ะ',
  },
  {
    id: 'req-3',
    bookTitle: 'Kafka on the Shore (คัฟกา ริมชายหาด)',
    author: 'Haruki Murakami',
    requestedBy: {
      id: 'u-dao',
      name: 'ดาว ร.',
      avatarUrl: '/avatar-dao.png',
    },
    createdAt: '2026-09-29 11:20',
    offerCount: 2,
    status: 'fulfilled',
    description: 'ตามหาสำนวนแปลของคุณนพดล สภาพดี ได้รับแลกเปลี่ยนเรียบร้อยแล้วค่ะ',
  },
  {
    id: 'req-4',
    bookTitle: 'Crypto Scam Secrets 101 [โพสต์ไม่เหมาะสม/ชักชวนลงทุน]',
    author: 'Anonymous',
    requestedBy: {
      id: 'u-kawin',
      name: 'กวินทร์ วัฒนชัย',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    },
    createdAt: '2026-10-07 08:30',
    offerCount: 0,
    status: 'hidden',
    description: 'โพสต์สแปม ชักชวนร่วมกลุ่มลงทุนที่ไม่เกี่ยวข้องกับหนังสือ ถูกแอดมินซ่อนแล้ว',
  },
  {
    id: 'req-5',
    bookTitle: 'Cosmos',
    author: 'Carl Sagan',
    requestedBy: {
      id: 'u-pakorn',
      name: 'ปกรณ์ เลิศพาณิชย์',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    },
    createdAt: '2026-10-08 14:00',
    offerCount: 1,
    status: 'has_offers',
    description: 'อยากได้ฉบับภาษาไทย ปกแข็ง มีภาพประกอบสี สภาพสะสม พร้อมแลกกับหนังสือดาราศาสตร์เล่มอื่นครับ',
  },
];
