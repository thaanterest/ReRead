import type { BookCondition, BookStatus } from './mockBooks';

export const AVATARS = {
  mint: '/avatar-mint.png',
  wanna: '/avatar-wanna.png',
  poom: '/avatar-poom.png',
  dao: '/avatar-dao.png',
};

export const MOCK_BOOKS_TH = [
  {
    id: '1',
    title: 'The Secret History',
    author: 'Donna Tartt',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    condition: 'Good' as BookCondition,
    description: 'นวนิยายสืบสวนที่ว่าด้วยกลุ่มนักศึกษาที่หมกมุ่นอยู่กับอุดมคติของกรีกโบราณจนนำไปสู่โศกนาฏกรรม',
    owner: { name: 'วรรณา ก.', avatarUrl: AVATARS.wanna },
    tags: ['Fiction', 'Dark Academia', 'Mystery'],
    status: 'Available' as BookStatus,
  },
  {
    id: '2',
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    condition: 'Like New' as BookCondition,
    description: 'เรื่องราวของโทรุ วาตานาเบะ กับความรักและการสูญเสียในช่วงวัยหนุ่ม ณ กรุงโตเกียว',
    owner: { name: 'ภูมิ ส.', avatarUrl: AVATARS.poom },
    tags: ['Fiction', 'Japanese Literature', 'Romance'],
    status: 'Available' as BookStatus,
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
    condition: 'Fair' as BookCondition,
    description: 'มหากาพย์วิทยาศาสตร์บนดาวเคราะห์ทะเลทราย Arrakis ที่ซ่อนทรัพยากรล้ำค่าที่สุดในจักรวาล',
    owner: { name: 'มินต์', avatarUrl: AVATARS.mint },
    tags: ['Sci-Fi', 'Classic', 'Out of Print'],
    status: 'Pending' as BookStatus,
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop',
    condition: 'New' as BookCondition,
    description: 'นวนิยายคลาสสิกของเจน ออสเตน ว่าด้วยความรักและความเข้าใจผิดระหว่างเอลิซาเบธ เบนเน็ตต์ กับดาร์ซี',
    owner: { name: 'ดาว ร.', avatarUrl: AVATARS.dao },
    tags: ['Classic', 'Romance'],
    status: 'Available' as BookStatus,
  },
];
