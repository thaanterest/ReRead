export type BookCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
export type BookStatus = 'Available' | 'Pending' | 'Swapped';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  condition: BookCondition;
  description: string;
  owner: {
    name: string;
    avatarUrl: string;
    id?: string;
  };
  tags: string[];
  status: BookStatus;
  approvalStatus?: 'pending' | 'approved' | 'hidden';
  createdAt?: string;
  category?: string;
  price?: number | null;
  listing_type?: string;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Secret History',
    author: 'Donna Tartt',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    condition: 'Good',
    description: 'Under the influence of their charismatic classics professor, a group of clever, eccentric misfits at an elite New England college discover a way of thinking and living that is a world away from the humdrum existence of their contemporaries.',
    owner: { name: 'วรรณา ก.', avatarUrl: '/avatar-wanna.png' },
    tags: ['Fiction', 'Dark Academia', 'Mystery'],
    status: 'Available'
  },
  {
    id: '2',
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    condition: 'Like New',
    description: 'Toru, a quiet and preternaturally serious young college student in Tokyo, is devoted to Naoko, a beautiful and introspective young woman, but their mutual passion is marked by the tragic death of their best friend years before.',
    owner: { name: 'ภูมิ ส.', avatarUrl: '/avatar-poom.png' },
    tags: ['Fiction', 'Japanese Literature', 'Romance'],
    status: 'Available'
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    coverUrl: 'https://storage.naiin.com/system/application/bookstore/resource/product/202605/704414/6000129948_front_XXL.jpg?v=1778236567',
    condition: 'Fair',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    owner: { name: 'มินต์', avatarUrl: '/avatar-mint.png' },
    tags: ['Sci-Fi', 'Classic', 'Out of Print'],
    status: 'Pending'
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop',
    condition: 'New',
    description: 'Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work "her own darling child".',
    owner: { name: 'ดาว ร.', avatarUrl: '/avatar-dao.png' },
    tags: ['Classic', 'Romance'],
    status: 'Available'
  }
];
