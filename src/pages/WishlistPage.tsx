import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Trash2, Loader2 } from 'lucide-react';
import { apiGetBooks, type BookData } from '../services/api';

export default function WishlistPage() {
  const [savedBooks, setSavedBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load first 2-3 available books as saved items demonstration from live database
    apiGetBooks({ page: 1, limit: 3 })
      .then(res => {
        if (res.success && res.data?.books?.length) {
          setSavedBooks(res.data.books);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id: string) => {
    setSavedBooks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-medium mb-3">รายการที่บันทึกไว้</h1>
        <p className="text-text-main/70">หนังสือที่คุณกดใจไว้ เพื่อติดตามหรือส่งคำขอแลกเปลี่ยนทีหลัง</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : savedBooks.length === 0 ? (
        <div className="text-center py-24 text-text-main/50">
          <BookMarked className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>ยังไม่มีหนังสือที่บันทึกไว้</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {savedBooks.map(book => (
            <div key={book.id} className="flex items-center gap-4 sm:gap-6 p-4 border border-border-main rounded-md hover:bg-bg-secondary/50 transition-colors">
              <img 
                src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300'} 
                alt={book.title} 
                className="w-14 sm:w-16 h-20 object-cover rounded border border-border-main flex-shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base sm:text-lg font-medium truncate">{book.title}</h3>
                <p className="text-xs sm:text-sm text-text-main/70 truncate">{book.author}</p>
                <p className="text-xs text-text-main/50 mt-1 truncate">
                  เจ้าของ: {book.owner?.display_name || 'เพื่อนนักอ่าน'}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <Link to={`/book/${book.id}`}
                  className="bg-accent text-bg-main px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-accent/90 transition-colors">
                  ดูรายละเอียด
                </Link>
                <button 
                  onClick={() => handleRemove(book.id)}
                  className="p-2 text-text-main/40 hover:text-warning transition-colors"
                  title="ลบออกจากรายการที่บันทึก"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
