import { useState, useEffect } from 'react';
import { PlusCircle, Search, Loader2, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGetRequests, apiCreateRequest, apiDeleteRequest, type BookRequestData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RequestsPage() {
  const [requests, setRequests] = useState<BookRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterMine, setFilterMine] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthAlertOpen, setIsAuthAlertOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  // User checking for delete button (assuming token exists means logged in, but better to check ownership)
  const token = localStorage.getItem('token');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Simple way to get user ID if we have a /me endpoint, or just relying on api to return 403.
    // For now we'll fetch /me to get the ID if logged in.
    if (token) {
      fetch('http://localhost:8000/api/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setCurrentUserId(data.data.id);
        })
        .catch(() => {});
    }
  }, [token]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetRequests({ page, limit: 10, search: searchQuery, mine: filterMine });
      if (res.success && res.data) {
        setRequests(res.data.requests);
        setTotalPages(res.data.total_pages);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRequests();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [page, searchQuery, filterMine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author) return;

    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนตั้งกระทู้');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiCreateRequest(form);
      if (res.success) {
        setIsModalOpen(false);
        setForm({ title: '', author: '', description: '' });
        setPage(1);
        fetchRequests();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกระทู้นี้?')) return;
    
    try {
      await apiDeleteRequest(id);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'ลบไม่สำเร็จ');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-heading font-medium mb-4">บอร์ดตามหาหนังสือ</h1>
          <p className="text-text-main/70 text-lg">ประกาศตามหาหนังสือที่อยากอ่าน หรือเสนอหนังสือที่คุณมีให้กับคนที่กำลังตามหา</p>
        </div>
        
        <button 
          onClick={() => {
            if (isAuthenticated) {
              setIsModalOpen(true);
            } else {
              setIsAuthAlertOpen(true);
            }
          }}
          className="w-full sm:w-auto flex-shrink-0 bg-accent text-bg-main px-5 py-3 sm:px-6 sm:py-4 rounded-md font-medium text-base sm:text-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-5 h-5" /> ตั้งกระทู้ตามหาหนังสือ
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar / Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="relative mb-4 md:mb-6">
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหนังสือ..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-bg-secondary border border-border-main rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-text-main/50" />
          </div>
          
          <div className="flex flex-row md:flex-col gap-2">
            <button 
              onClick={() => { setFilterMine(false); setPage(1); }}
              className={`flex-1 md:flex-none text-center md:text-left text-sm font-medium px-4 py-2 rounded-md transition-colors ${!filterMine ? 'text-accent bg-accent/10 border border-accent/20' : 'text-text-main/70 hover:bg-bg-secondary border border-border-main/50 md:border-transparent'}`}
            >
              กระทู้ทั้งหมด
            </button>
            <button 
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthAlertOpen(true);
                  return;
                }
                setFilterMine(true); setPage(1); 
              }}
              className={`flex-1 md:flex-none text-center md:text-left text-sm font-medium px-4 py-2 rounded-md transition-colors ${filterMine ? 'text-accent bg-accent/10 border border-accent/20' : 'text-text-main/70 hover:bg-bg-secondary border border-border-main/50 md:border-transparent'}`}
            >
              กระทู้ของฉัน
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
          ) : error ? (
            <div className="text-center text-warning py-10">{error}</div>
          ) : requests.length === 0 ? (
            <div className="text-center text-text-main/60 py-20">ไม่มีกระทู้ที่ค้นหา</div>
          ) : (
            requests.map(req => (
              <div key={req.id} className="bg-bg-main border border-border-main rounded-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent/50 transition-colors group relative">
                
                <div className="flex flex-col gap-1 pr-8">
                  <h3 className="font-heading text-lg font-medium group-hover:text-accent transition-colors">{req.title}</h3>
                  <p className="text-sm text-text-main/70">ผู้แต่ง: {req.author}</p>
                  {req.description && <p className="text-sm text-text-main/60 mt-1 italic">"{req.description}"</p>}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-text-main/50">
                    {req.owner.avatar_url && (
                       <img src={req.owner.avatar_url} className="w-4 h-4 rounded-full" alt="avatar" />
                    )}
                    <span className="font-medium text-text-main/70">{req.owner.name}</span>
                    <span>•</span>
                    <span>{formatDate(req.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t border-border-main sm:border-t-0 pt-3 sm:pt-0">
                  <span className={`text-xs px-2.5 py-1 rounded-sm font-medium ${
                    req.offers > 0 ? 'bg-bg-secondary text-text-main' : 'bg-warning/10 text-warning'
                  }`}>
                    {req.offers > 0 ? `มีผู้เสนอแล้ว ${req.offers} เล่ม` : 'ยังไม่มีผู้เสนอ'}
                  </span>
                  
                  <button className="text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    เสนอหนังสือ &rarr;
                  </button>
                </div>
                
                {currentUserId === req.owner_id && (
                  <button 
                    onClick={(e) => handleDelete(req.id, e)}
                    className="absolute top-4 right-4 text-text-main/30 hover:text-warning transition-colors p-1"
                    title="ลบกระทู้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button 
                  key={p} 
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 flex items-center justify-center rounded-md border ${p === page ? 'border-accent bg-accent text-bg-main' : 'border-border-main hover:bg-bg-secondary text-text-main'} transition-colors`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-bg-main border border-border-main rounded-md w-full max-w-lg p-6 relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-main/50 hover:text-text-main transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-heading font-medium mb-6">ตั้งกระทู้ตามหาหนังสือ</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">ชื่อหนังสือ *</label>
                <input 
                  type="text" 
                  required
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full bg-bg-secondary border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">ผู้แต่ง *</label>
                <input 
                  type="text" 
                  required
                  value={form.author}
                  onChange={e => setForm({...form, author: e.target.value})}
                  className="w-full bg-bg-secondary border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                <textarea 
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="เช่น พิมพ์ครั้งที่เท่าไหร่, สภาพที่ต้องการ..."
                  className="w-full bg-bg-secondary border border-border-main rounded-md px-4 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-accent text-bg-main py-3 rounded-md font-medium text-lg hover:bg-accent/90 transition-colors mt-4 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                โพสต์ตามหา
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Alert Modal */}
      {isAuthAlertOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-main w-full max-w-sm rounded-lg shadow-xl p-8 text-center relative animate-fade-in-up">
            <button 
              onClick={() => setIsAuthAlertOpen(false)}
              className="absolute top-4 right-4 text-text-main/50 hover:text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-heading font-medium mb-2">ต้องเข้าสู่ระบบ</h3>
            <p className="text-text-main/70 mb-8 leading-relaxed">
              กรุณาเข้าสู่ระบบหรือสมัครสมาชิกก่อนตั้งกระทู้ตามหาหนังสือ เพื่อให้ผู้ใช้ท่านอื่นสามารถติดต่อคุณได้
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/login"
                className="w-full py-3 bg-accent text-bg-main rounded-md font-medium hover:bg-accent/90 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link 
                to="/signup"
                className="w-full py-3 border border-border-main text-text-main rounded-md font-medium hover:bg-bg-secondary transition-colors"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
