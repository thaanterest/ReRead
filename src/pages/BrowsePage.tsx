import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, Repeat, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { apiGetBooks, type BookData } from '../services/api';

// Map condition EN -> TH for display
const CONDITION_MAP: Record<string, string> = {
  'New': 'มือหนึ่ง/ใหม่',
  'Like New': 'เหมือนใหม่',
  'Good': 'สภาพดี',
  'Fair': 'พอใช้',
  'Poor': 'เก่า/มีตำหนิ',
};

// Map category tags to Thai labels for the sidebar
const CATEGORY_TAG_MAP: Record<string, string[]> = {
  'นิยาย / วรรณกรรม': ['Fiction', 'Classic', 'Literary', 'Thai Novel', 'Thai Literature'],
  'จิตวิทยา / พัฒนาตนเอง': ['Self-Help', 'Psychology'],
  'ไซไฟ / แฟนตาซี': ['Sci-Fi', 'Fantasy', 'Dystopian'],
  'สารคดี / ความรู้': ['Non-Fiction', 'History', 'Science', 'Physics', 'Finance', 'Education', 'Strategy'],
  'ปรัชญา / จิตวิญญาณ': ['Philosophy', 'Spirituality'],
  'รักโรแมนซ์': ['Romance'],
};

const ITEMS_PER_PAGE = 12;

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allBooks, setAllBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [showAvailable, setShowAvailable] = useState(false);
  const [showRare, setShowRare] = useState(false);

  // Fetch ALL books once
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiGetBooks({ page: 1, limit: 100 });
        if (res.success && res.data) {
          setAllBooks(res.data.books);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // Toggle helpers
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
    setPage(1);
  };

  // Client-side filtering: STRICTLY for books available for EXCHANGE
  const filteredBooks = useMemo(() => {
    // 1. Filter only books that accept exchange
    let result = allBooks.filter(
      b => b.listing_type === 'exchange' || b.listing_type === 'both' || !b.listing_type
    );

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      const matchTags = selectedCategories.flatMap(cat => CATEGORY_TAG_MAP[cat] || []);
      result = result.filter(b =>
        b.tags.some(tag => matchTags.includes(tag))
      );
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      result = result.filter(b => selectedConditions.includes(b.condition));
    }

    // Status filters
    if (showAvailable && !showRare) {
      result = result.filter(b => b.status === 'Available');
    } else if (showRare && !showAvailable) {
      result = result.filter(b => b.tags.includes('Out of Print'));
    } else if (showAvailable && showRare) {
      result = result.filter(b => b.status === 'Available' || b.tags.includes('Out of Print'));
    }

    return result;
  }, [allBooks, searchQuery, selectedCategories, selectedConditions, showAvailable, showRare]);

  // Pagination on filtered results
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [searchQuery]);

  const activeFilterCount =
    selectedCategories.length +
    selectedConditions.length +
    (showAvailable ? 1 : 0) +
    (showRare ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      
      {/* Header Banner */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-main">
        <div>
          <div className="flex items-center gap-2 text-accent text-sm font-medium mb-2">
            <Repeat className="w-4 h-4" /> แลกเปลี่ยนหนังสือ (Book Exchange)
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-medium mb-3">ค้นหาหนังสือ</h1>
          <p className="text-text-main/70 text-lg">
            ส่งต่อหนังสือที่อ่านจบแล้ว และค้นพบหนังสือเล่มใหม่ผ่านการแลกเปลี่ยนกับเพื่อนนักอ่าน
          </p>
        </div>

        {/* Switch link to marketplace */}
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border-main text-sm font-medium text-text-main/80 hover:text-accent hover:border-accent transition-colors bg-bg-secondary/40 flex-shrink-0"
        >
          <ShoppingBag className="w-4 h-4 text-accent" /> ไปที่หน้าหนังสือมือสอง (สำหรับซื้อ) →
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-28 flex flex-col gap-8">
            
            {/* Search */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-secondary border border-border-main rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-sm"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-text-main/50" />
            </div>

            <div className="flex items-center justify-between border-b border-border-main pb-2">
              <div className="flex items-center gap-2 font-heading text-lg font-medium">
                <SlidersHorizontal className="w-5 h-5" /> ตัวกรอง
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedConditions([]);
                    setShowAvailable(false);
                    setShowRare(false);
                  }}
                  className="text-xs text-accent hover:underline"
                >
                  ล้างทั้งหมด ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Filter Group: Categories */}
            <div className="flex flex-col gap-3">
              <h3 className="font-medium text-sm text-text-main/80 uppercase tracking-widest">หมวดหมู่</h3>
              <div className="flex flex-col gap-2.5">
                {Object.keys(CATEGORY_TAG_MAP).map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded-sm border-border-main text-accent focus:ring-accent accent-accent"
                    />
                    <span className="text-sm text-text-main/80 group-hover:text-text-main transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Condition */}
            <div className="flex flex-col gap-3">
              <h3 className="font-medium text-sm text-text-main/80 uppercase tracking-widest">สภาพหนังสือ</h3>
              <div className="flex flex-col gap-2.5">
                {Object.entries(CONDITION_MAP).map(([eng, th]) => (
                  <label key={eng} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedConditions.includes(eng)}
                      onChange={() => toggleCondition(eng)}
                      className="w-4 h-4 rounded-sm border-border-main text-accent focus:ring-accent accent-accent"
                    />
                    <span className="text-sm text-text-main/80 group-hover:text-text-main transition-colors">{th}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter Group: Status */}
            <div className="flex flex-col gap-3">
              <h3 className="font-medium text-sm text-text-main/80 uppercase tracking-widest">สถานะ</h3>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showAvailable}
                    onChange={() => { setShowAvailable(!showAvailable); setPage(1); }}
                    className="w-4 h-4 rounded-sm border-border-main text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-sm text-text-main/80 group-hover:text-text-main transition-colors">พร้อมแลก (Available)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showRare}
                    onChange={() => { setShowRare(!showRare); setPage(1); }}
                    className="w-4 h-4 rounded-sm border-border-main text-accent focus:ring-accent accent-accent"
                  />
                  <span className="text-sm text-text-main/80 group-hover:text-text-main transition-colors">หายาก (Rare / Out of Print)</span>
                </label>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-main">
            <p className="text-text-main/60 text-sm font-medium">
              พบหนังสือพร้อมแลก <span className="text-text-main font-semibold">{filteredBooks.length}</span> เล่ม
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-warning font-medium">{error}</div>
          ) : paginatedBooks.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border-main rounded-lg bg-bg-secondary/30">
              <p className="text-text-main/60 text-lg mb-2">ไม่พบหนังสือพร้อมแลกที่ตรงกับเงื่อนไข</p>
              <p className="text-text-main/40 text-sm mb-4">ลองปรับลดตัวกรองหรือค้นหาด้วยคำอื่น</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                  setSelectedConditions([]);
                  setShowAvailable(false);
                  setShowRare(false);
                }}
                className="text-accent text-sm underline font-medium"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {paginatedBooks.map((book) => (
                <BookCard key={book.id} book={book as any} mode="exchange" />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-border-main">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border-main rounded-md text-sm font-medium disabled:opacity-30 hover:bg-bg-secondary transition-colors"
              >
                ก่อนหน้า
              </button>
              
              <div className="flex items-center gap-1 px-4 text-sm">
                <span>หน้า</span>
                <span className="font-semibold text-accent">{page}</span>
                <span>จาก</span>
                <span>{totalPages}</span>
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border-main rounded-md text-sm font-medium disabled:opacity-30 hover:bg-bg-secondary transition-colors"
              >
                ถัดไป
              </button>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
