import { useState } from 'react';
import {
  LayoutGrid,
  List,
  CheckCircle2,
  EyeOff,
  Eye,
  Trash2,
} from 'lucide-react';
import DataTable, { type Column } from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Drawer from '../../components/admin/Drawer';
import type { AdminBook, BookApprovalStatus } from '../../types/admin';

// Condition map
const CONDITION_TH: Record<string, string> = {
  New: 'มือหนึ่ง/ใหม่',
  'Like New': 'เหมือนใหม่',
  Good: 'สภาพดี',
  Fair: 'พอใช้',
  Poor: 'เก่า/มีตำหนิ',
};

const INITIAL_ADMIN_BOOKS: AdminBook[] = [
  {
    id: 'b-1',
    title: 'The Secret History',
    author: 'Donna Tartt',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop',
    condition: 'Good',
    description: 'นวนิยายแนว Dark Academia ยอดนิยม สภาพดี ไม่มีรอยขีดเขียน สันปกคม',
    owner: { id: 'u-wanna', name: 'วรรณา ก.', avatarUrl: '/avatar-wanna.png' },
    category: 'นิยาย / วรรณกรรม',
    tags: ['Fiction', 'Dark Academia', 'Mystery'],
    isRare: false,
    status: 'Available',
    approvalStatus: 'approved',
    price: 250,
    listingType: 'both',
    createdAt: '2026-10-04 10:20',
  },
  {
    id: 'b-2',
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    condition: 'Like New',
    description: 'ด้วยรัก ความตาย และความทรงจำ สภาพกริบเหมือนเพิ่งซื้อจากร้าน',
    owner: { id: 'u-poom', name: 'ภูมิ ส.', avatarUrl: '/avatar-poom.png' },
    category: 'นิยาย / วรรณกรรม',
    tags: ['Fiction', 'Japanese Literature', 'Romance'],
    isRare: false,
    status: 'Available',
    approvalStatus: 'approved',
    price: 190,
    listingType: 'both',
    createdAt: '2026-10-03 14:15',
  },
  {
    id: 'b-3',
    title: 'Dune (ดูน)',
    author: 'Frank Herbert',
    coverUrl: 'https://storage.naiin.com/system/application/bookstore/resource/product/202605/704414/6000129948_front_XXL.jpg?v=1778236567',
    condition: 'Fair',
    description: 'มหากาพย์ไซไฟระดับตำนาน ฉบับพิมพ์ครั้งแรก หายากมาก สภาพผ่านการอ่าน',
    owner: { id: 'u-mint', name: 'มินต์', avatarUrl: '/avatar-mint.png' },
    category: 'ไซไฟ / แฟนตาซี',
    tags: ['Sci-Fi', 'Classic', 'Out of Print'],
    isRare: true,
    status: 'Pending',
    approvalStatus: 'approved',
    price: 380,
    listingType: 'exchange',
    createdAt: '2026-10-02 09:30',
  },
  {
    id: 'b-4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop',
    condition: 'New',
    description: 'ฉบับภาษาอังกฤษ ปกแข็งพิมพ์ทอง มือหนึ่งในซีลพลาสติก',
    owner: { id: 'u-dao', name: 'ดาว ร.', avatarUrl: '/avatar-dao.png' },
    category: 'นิยาย / วรรณกรรม',
    tags: ['Classic', 'Romance'],
    isRare: false,
    status: 'Available',
    approvalStatus: 'approved',
    price: 450,
    listingType: 'sell',
    createdAt: '2026-10-01 16:45',
  },
  {
    id: 'b-5',
    title: 'Sapiens: ประวัติย่อมนุษยชาติ',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop',
    condition: 'Good',
    description: 'ฉบับแปลไทย สภาพดี มีรอยดินสอเล็กน้อย 2 หน้า รอการตรวจสอบรายการลง',
    owner: { id: 'u-thana', name: 'ธนา ชัยสิทธิ์', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200' },
    category: 'สารคดี / ความรู้',
    tags: ['Non-Fiction', 'History'],
    isRare: false,
    status: 'Available',
    approvalStatus: 'pending',
    price: 280,
    listingType: 'both',
    createdAt: '2026-10-08 11:10',
  },
  {
    id: 'b-6',
    title: 'Atomic Habits เพราะชีวิตดีได้กว่าที่เป็น',
    author: 'James Clear',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    condition: 'Like New',
    description: 'หนังสือพัฒนาตนเองยอดฮิต เพิ่งอ่านจบ สภาพ 99% รออนุมัติเข้าระบบ',
    owner: { id: 'u-nicha', name: 'ณิชา ภัทรวรินทร์', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200' },
    category: 'จิตวิทยา / พัฒนาตนเอง',
    tags: ['Self-Help', 'Psychology'],
    isRare: false,
    status: 'Available',
    approvalStatus: 'pending',
    price: 180,
    listingType: 'both',
    createdAt: '2026-10-08 15:40',
  },
  {
    id: 'b-7',
    title: 'รวมเทคนิคแทงหวย รวยข้ามคืน [เนื้อหาผิดกฎ]',
    author: 'ผู้ไม่ประสงค์ออกนาม',
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=600&auto=format&fit=crop',
    condition: 'Poor',
    description: 'หนังสือชวนเชื่อการพนัน ถูกแอดมินตรวจพบและระงับการแสดงผล',
    owner: { id: 'u-kawin', name: 'กวินทร์ วัฒนชัย', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
    category: 'อื่นๆ',
    tags: ['Spam'],
    isRare: false,
    status: 'Available',
    approvalStatus: 'hidden',
    price: null,
    listingType: 'exchange',
    createdAt: '2026-10-07 09:00',
  },
];

export default function AdminBooksPage() {
  const [books, setBooks] = useState<AdminBook[]>(INITIAL_ADMIN_BOOKS);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [tabFilter, setTabFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');

  // Drawer
  const [selectedBook, setSelectedBook] = useState<AdminBook | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirm delete dialog
  const [bookToDelete, setBookToDelete] = useState<AdminBook | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered list
  const filteredBooks = books.filter((b) => {
    if (tabFilter === 'all') return true;
    return b.approvalStatus === tabFilter;
  });

  // Action: Approve
  const handleApprove = (b: AdminBook) => {
    setBooks((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, approvalStatus: 'approved' } : item))
    );
    if (selectedBook?.id === b.id) {
      setSelectedBook({ ...selectedBook, approvalStatus: 'approved' });
    }
    showToast(`อนุมัติหนังสือ "${b.title}" ขึ้นระบบเรียบร้อยแล้ว`);
  };

  // Action: Toggle Hide/Show
  const handleToggleHide = (b: AdminBook) => {
    const nextStatus: BookApprovalStatus = b.approvalStatus === 'hidden' ? 'approved' : 'hidden';
    setBooks((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, approvalStatus: nextStatus } : item))
    );
    if (selectedBook?.id === b.id) {
      setSelectedBook({ ...selectedBook, approvalStatus: nextStatus });
    }
    showToast(
      nextStatus === 'hidden'
        ? `ซ่อนหนังสือ "${b.title}" จากหน้าร้านแล้ว`
        : `นำหนังสือ "${b.title}" กลับมาแสดงผลแล้ว`
    );
  };

  // Action: Delete
  const handleConfirmDelete = (reason?: string) => {
    if (!bookToDelete) return;
    setBooks((prev) => prev.filter((item) => item.id !== bookToDelete.id));
    if (selectedBook?.id === bookToDelete.id) {
      setIsDrawerOpen(false);
      setSelectedBook(null);
    }
    showToast(`ลบหนังสือ "${bookToDelete.title}" เรียบร้อยแล้ว (${reason || 'ไม่มีเหตุผลระบุ'})`);
    setIsDeleteOpen(false);
    setBookToDelete(null);
  };

  const handleOpenDetail = (b: AdminBook) => {
    setSelectedBook(b);
    setIsDrawerOpen(true);
  };

  // Columns for DataTable
  const columns: Column<AdminBook>[] = [
    {
      key: 'title',
      header: 'หนังสือ / ผู้แต่ง',
      sortable: true,
      render: (b) => (
        <div className="flex items-center gap-3">
          <img
            src={b.coverUrl}
            alt={b.title}
            className="w-10 h-14 object-cover rounded border border-border-main bg-bg-secondary flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200';
            }}
          />
          <div className="min-w-0">
            <h4
              className="font-medium text-text-main hover:text-accent cursor-pointer truncate leading-snug"
              onClick={() => handleOpenDetail(b)}
            >
              {b.title}
            </h4>
            <p className="text-xs text-text-main/60 truncate">{b.author}</p>
            {b.isRare && (
              <span className="inline-block mt-0.5 text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.2 rounded border border-warning/20">
                หายาก / เลิกพิมพ์
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      header: 'เจ้าของ',
      render: (b) => (
        <div className="flex items-center gap-2 text-xs">
          <img
            src={b.owner.avatarUrl}
            alt={b.owner.name}
            className="w-5 h-5 rounded-full object-cover bg-bg-secondary"
          />
          <span className="text-text-main/80 truncate">{b.owner.name}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'หมวดหมู่',
      sortable: true,
      render: (b) => <span className="text-xs text-text-main/70">{b.category}</span>,
    },
    {
      key: 'condition',
      header: 'สภาพ',
      sortable: true,
      render: (b) => (
        <span className="text-xs font-medium text-text-main px-2 py-0.5 rounded border border-border-main bg-bg-secondary/40">
          {CONDITION_TH[b.condition] || b.condition}
        </span>
      ),
    },
    {
      key: 'approvalStatus',
      header: 'สถานะการอนุมัติ',
      sortable: true,
      render: (b) => <StatusBadge status={b.approvalStatus} />,
    },
    {
      key: 'actions',
      header: 'การจัดการ',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenDetail(b)}
            className="px-2.5 py-1 text-xs border border-border-main rounded hover:bg-bg-secondary transition-colors text-text-main/80"
          >
            ดูข้อมูล
          </button>

          {b.approvalStatus === 'pending' && (
            <button
              onClick={() => handleApprove(b)}
              title="อนุมัติขึ้นระบบ"
              className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleToggleHide(b)}
            title={b.approvalStatus === 'hidden' ? 'แสดงรายการ' : 'ซ่อนรายการ'}
            className="p-1 text-text-main/60 hover:text-text-main hover:bg-bg-secondary rounded transition-colors"
          >
            {b.approvalStatus === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setBookToDelete(b);
              setIsDeleteOpen(true);
            }}
            title="ลบรายการหนังสือ"
            className="p-1 text-warning hover:bg-warning/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-text-main text-bg-main px-4 py-3 rounded-md shadow-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-medium text-text-main">
            จัดการรายการหนังสือ ({books.length})
          </h2>
          <p className="text-xs text-text-main/60 mt-0.5">
            ตรวจสอบความถูกต้องของรายการ อนุมัติหนังสือใหม่ และดูแลคุณภาพของชุมชน
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-border-main rounded-md p-0.5 bg-bg-secondary/40">
            <button
              onClick={() => setViewMode('table')}
              aria-label="มุมมองตาราง"
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-bg-main text-text-main shadow-xs' : 'text-text-main/50 hover:text-text-main'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="มุมมองการ์ด"
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-bg-main text-text-main shadow-xs' : 'text-text-main/50 hover:text-text-main'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-main pb-2 overflow-x-auto text-xs font-sans">
        <button
          onClick={() => setTabFilter('all')}
          className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
            tabFilter === 'all'
              ? 'bg-accent text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          ทั้งหมด ({books.length})
        </button>
        <button
          onClick={() => setTabFilter('pending')}
          className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            tabFilter === 'pending'
              ? 'bg-warning text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          <span>รออนุมัติ ({books.filter(b => b.approvalStatus === 'pending').length})</span>
          {books.filter(b => b.approvalStatus === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setTabFilter('approved')}
          className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
            tabFilter === 'approved'
              ? 'bg-accent text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          เผยแพร่แล้ว ({books.filter(b => b.approvalStatus === 'approved').length})
        </button>
        <button
          onClick={() => setTabFilter('hidden')}
          className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
            tabFilter === 'hidden'
              ? 'bg-text-main text-bg-main font-semibold'
              : 'text-text-main/70 hover:bg-bg-secondary'
          }`}
        >
          ถูกซ่อน ({books.filter(b => b.approvalStatus === 'hidden').length})
        </button>
      </div>

      {/* View Mode: Table */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredBooks}
          keyExtractor={(b) => b.id}
          searchPlaceholder="ค้นหาชื่อหนังสือ, ผู้แต่ง, หมวดหมู่..."
          itemsPerPage={10}
        />
      ) : (
        /* View Mode: Grid Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full py-16 text-center text-text-main/50 bg-bg-main border border-dashed border-border-main rounded-md">
              ไม่พบหนังสือในหมวดนี้
            </div>
          ) : (
            filteredBooks.map((b) => (
              <div
                key={b.id}
                className="bg-bg-main border border-border-main rounded-md overflow-hidden flex flex-col justify-between group hover:border-accent transition-all shadow-xs"
              >
                {/* Book Cover Container with Library Badge */}
                <div className="relative aspect-[3/4] bg-bg-secondary overflow-hidden">
                  <img
                    src={b.coverUrl}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400';
                    }}
                  />

                  {/* Library Ticket Style Condition Badge */}
                  <div className="absolute top-3 right-3 bg-bg-main border border-border-main border-dashed px-2.5 py-1 flex flex-col items-center shadow-xs">
                    <span className="text-[9px] tracking-widest text-text-main/60 uppercase font-sans leading-none mb-0.5">
                      สภาพ
                    </span>
                    <span className="font-heading text-xs font-medium text-text-main leading-tight">
                      {CONDITION_TH[b.condition] || b.condition}
                    </span>
                  </div>

                  {/* Approval Status Badge at top-left */}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={b.approvalStatus} size="sm" />
                  </div>

                  {b.isRare && (
                    <div className="absolute bottom-3 left-3 bg-warning text-bg-main text-[10px] font-medium px-2 py-0.5 rounded-sm">
                      หายาก / เลิกพิมพ์
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <h4 className="font-heading text-base font-medium text-text-main line-clamp-1 group-hover:text-accent transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-text-main/60 line-clamp-1">{b.author}</p>
                    <p className="text-[11px] text-text-main/40 mt-1">{b.category}</p>
                  </div>

                  {/* Actions in Card */}
                  <div className="pt-3 border-t border-border-main flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-text-main/60">
                      <img
                        src={b.owner.avatarUrl}
                        alt={b.owner.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="truncate max-w-[80px]">{b.owner.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {b.approvalStatus === 'pending' && (
                        <button
                          onClick={() => handleApprove(b)}
                          className="px-2 py-1 bg-accent text-bg-main rounded text-[11px] font-medium hover:bg-accent/90"
                        >
                          อนุมัติ
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenDetail(b)}
                        className="px-2 py-1 border border-border-main rounded text-[11px] hover:bg-bg-secondary"
                      >
                        ดูข้อมูล
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Book Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedBook?.title || 'รายละเอียดหนังสือ'}
        subtitle={`ผู้แต่ง: ${selectedBook?.author}`}
        footer={
          selectedBook && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => {
                  setBookToDelete(selectedBook);
                  setIsDeleteOpen(true);
                }}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-warning/40 text-warning hover:bg-warning/10 transition-colors"
              >
                ลบรายการ
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleHide(selectedBook)}
                  className="px-3 py-1.5 border border-border-main rounded-md text-xs font-medium hover:bg-bg-secondary transition-colors"
                >
                  {selectedBook.approvalStatus === 'hidden' ? 'ยกเลิกการซ่อน' : 'ซ่อนหนังสือ'}
                </button>
                {selectedBook.approvalStatus === 'pending' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedBook);
                    }}
                    className="px-4 py-1.5 bg-accent text-bg-main rounded-md text-xs font-medium hover:bg-accent/90 transition-colors"
                  >
                    อนุมัติขึ้นระบบ
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedBook && (
          <div className="flex flex-col gap-6 text-sm">
            {/* Book Preview */}
            <div className="flex gap-4 p-4 rounded-md bg-bg-secondary/30 border border-border-main">
              <img
                src={selectedBook.coverUrl}
                alt={selectedBook.title}
                className="w-24 h-32 object-cover rounded border border-border-main shadow-xs"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={selectedBook.approvalStatus} size="sm" />
                    {selectedBook.isRare && (
                      <span className="text-[10px] bg-warning/15 text-warning px-1.5 py-0.5 rounded border border-warning/30 font-medium">
                        หายาก
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading font-medium text-lg text-text-main leading-snug">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-text-main/60">{selectedBook.author}</p>
                </div>

                <div className="text-xs text-text-main/70">
                  <span className="font-medium">หมวดหมู่:</span> {selectedBook.category}
                </div>
              </div>
            </div>

            {/* Library Ticket Condition Card */}
            <div className="p-4 border border-dashed border-border-main bg-bg-main rounded-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-sans text-text-main/60 tracking-wider">
                  ระดับสภาพหนังสือ (Condition Stamp)
                </span>
                <p className="font-heading text-lg font-medium text-text-main mt-0.5">
                  {CONDITION_TH[selectedBook.condition] || selectedBook.condition}
                </p>
              </div>
              <div className="text-right text-xs text-text-main/60">
                <span>ลงเมื่อ: {selectedBook.createdAt}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-1.5">
                เรื่องย่อ / รายละเอียดสภาพ
              </h4>
              <p className="p-3 bg-bg-secondary/20 rounded-md border border-border-main/60 text-xs text-text-main/80 leading-relaxed">
                {selectedBook.description}
              </p>
            </div>

            {/* Owner info */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                ข้อมูลผู้ลงรายการ
              </h4>
              <div className="p-3 rounded-md border border-border-main bg-bg-main flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedBook.owner.avatarUrl}
                    alt={selectedBook.owner.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-medium text-text-main">{selectedBook.owner.name}</p>
                    <p className="text-[11px] text-text-main/50">รหัสผู้ใช้: {selectedBook.owner.id}</p>
                  </div>
                </div>
                <span className="text-xs text-accent hover:underline cursor-pointer">
                  ดูประวัติผู้ใช้ →
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-2">
                แท็กที่เกี่ยวข้อง
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedBook.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-sm border border-border-main bg-bg-secondary/30 text-text-main/70"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setBookToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`ยืนยันการลบหนังสือ "${bookToDelete?.title}"`}
        message="การลบหนังสือจะนำรายการนี้ออกจากฐานข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้ กรุณาระบุเหตุผลในการลบเพื่อบันทึกประวัติการทำงานของแอดมิน"
        confirmText="ลบหนังสือถาวร"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="เช่น ข้อมูลหลอกลวง, ละเมิดลิขสิทธิ์, หนังสือชำรุดเสียหายเกินไป..."
      />
    </div>
  );
}
