import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { BookPlus, Loader2 } from 'lucide-react';
import { apiGetMyBooks, apiDeleteBook, type BookData } from '../services/api';

export default function MyBooksPage() {
  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    setLoading(true);
    try {
      const res = await apiGetMyBooks();
      if (res.success && res.data) {
        setBooks(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเล่มนี้?')) {
      try {
        await apiDeleteBook(id);
        fetchMyBooks();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบหนังสือ');
      }
    }
  };

  const total = books.length;
  const available = books.filter(b => b.status === 'Available').length;
  const pending = books.filter(b => b.status === 'Pending').length;
  const sold = books.filter(b => b.status === 'Sold').length;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-heading font-medium mb-3">หนังสือของฉัน</h1>
          <p className="text-text-main/70">หนังสือทั้งหมดที่คุณลงรายการไว้บนชั้น ReRead</p>
        </div>
        <Link to="/add-book"
          className="flex-shrink-0 flex items-center gap-2 bg-accent text-bg-main px-6 py-3 rounded-md font-medium hover:bg-accent/90 transition-colors">
          <BookPlus className="w-5 h-5" /> เพิ่มหนังสือ
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 p-6 bg-bg-secondary rounded-md border border-border-main">
        <div className="text-center">
          <p className="text-3xl font-heading font-medium">{total}</p>
          <p className="text-sm text-text-main/60 mt-1">หนังสือทั้งหมด</p>
        </div>
        <div className="text-center border-l sm:border-x border-border-main">
          <p className="text-3xl font-heading font-medium text-accent">{available}</p>
          <p className="text-sm text-text-main/60 mt-1">พร้อมส่งต่อ</p>
        </div>
        <div className="text-center border-t sm:border-t-0 border-border-main pt-3 sm:pt-0">
          <p className="text-3xl font-heading font-medium text-warning">{pending}</p>
          <p className="text-sm text-text-main/60 mt-1">รอดำเนินการ</p>
        </div>
        <div className="text-center border-t sm:border-t-0 border-l border-border-main pt-3 sm:pt-0">
          <p className="text-3xl font-heading font-medium text-text-main/70">{sold}</p>
          <p className="text-sm text-text-main/60 mt-1">ขายแล้ว</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center text-text-main/60 py-20">คุณยังไม่มีหนังสือบนชั้นวาง</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {books.map(book => (
            <div key={book.id} className="flex flex-col gap-2">
              <BookCard book={book as any} />
              <div className="flex gap-2">
                <button className="flex-1 text-xs border border-border-main py-1.5 rounded hover:bg-bg-secondary transition-colors">แก้ไข</button>
                <button 
                  onClick={() => handleDelete(book.id)}
                  className="flex-1 text-xs border border-warning/40 text-warning py-1.5 rounded hover:bg-warning/5 transition-colors"
                >ลบ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
