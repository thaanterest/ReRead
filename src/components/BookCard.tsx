import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface BookOwner {
  name?: string;
  avatarUrl?: string;
  display_name?: string;
  avatar_url?: string | null;
}

interface BookCardData {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  cover_url?: string | null;
  condition: string;
  tags: string[];
  status: string;
  listing_type?: string;
  price?: number | null;
  owner: BookOwner;
}

interface BookCardProps {
  book: BookCardData;
  mode?: 'all' | 'exchange' | 'marketplace';
}

export default function BookCard({ book, mode = 'all' }: BookCardProps) {
  const isRare = book.tags.includes('Out of Print');
  const coverImage = book.coverUrl || book.cover_url || '';
  const ownerName = book.owner?.name || book.owner?.display_name || 'ไม่ทราบ';
  const ownerAvatar = book.owner?.avatarUrl || book.owner?.avatar_url || '';

  // แปลงสภาพหนังสือเป็นภาษาไทยสำหรับแสดงผล
  const conditionTH = {
    'New': 'มือหนึ่ง/ใหม่',
    'Like New': 'เหมือนใหม่',
    'Good': 'สภาพดี',
    'Fair': 'พอใช้',
    'Poor': 'เก่า/มีตำหนิ'
  }[book.condition] || book.condition;

  const isSold = book.status === 'Sold';
  const isPending = book.status === 'Pending';
  const isSwapped = book.status === 'Swapped';

  const showPrice = mode !== 'exchange' && book.price !== undefined && book.price !== null;

  return (
    <Link to={`/book/${book.id}`} className="group flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-border-main bg-bg-secondary">
        <img 
          src={coverImage} 
          alt={book.title} 
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale opacity-70' : ''}`}
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600'; }}
        />
        
        {/* Signature Element: Condition Badge */}
        <div className="absolute top-3 right-3 bg-bg-main border border-border-main border-dashed px-2.5 py-1.5 flex flex-col items-center shadow-sm z-10">
          <span className="text-[10px] tracking-widest text-text-main/60 uppercase font-sans mb-0.5 leading-none">สภาพ</span>
          <span className="font-heading text-xs sm:text-sm font-medium text-text-main leading-tight">{conditionTH}</span>
        </div>

        {/* Price Badge at top-left (shown only when book has price and not in exchange-only mode) */}
        {showPrice && (
          <div className="absolute top-3 left-3 bg-accent text-bg-main font-heading font-medium text-xs sm:text-sm px-2.5 py-1 rounded-sm shadow-sm z-10">
            ฿{book.price!.toLocaleString()}
          </div>
        )}

        {/* Status / Rare Badge at bottom-left */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 z-10">
          {isRare && (
            <div className="bg-warning text-bg-main text-xs px-2 py-1 font-medium rounded-sm">
              หายาก / เลิกพิมพ์
            </div>
          )}
          {isSold && (
            <div className="bg-text-main/80 text-bg-main text-xs px-2 py-1 font-medium rounded-sm">
              ขายแล้ว
            </div>
          )}
          {isSwapped && (
            <div className="bg-text-main/80 text-bg-main text-xs px-2 py-1 font-medium rounded-sm">
              แลกเปลี่ยนแล้ว
            </div>
          )}
          {isPending && !isRare && !isSold && !isSwapped && (
            <div className="bg-warning/90 text-bg-main text-xs px-2 py-1 font-medium rounded-sm">
              รอจัดส่ง / ดำเนินการ
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-lg font-medium leading-snug group-hover:text-accent transition-colors line-clamp-1">
            {book.title}
          </h3>
          {showPrice && (
            <span className="font-heading font-medium text-accent text-base flex-shrink-0">
              ฿{book.price!.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-text-main/70 text-sm">{book.author}</p>
        
        <div className="mt-2 flex items-center justify-between text-xs text-text-main/60">
          <div className="flex items-center gap-2">
            {ownerAvatar && (
              <img src={ownerAvatar} alt={ownerName} className="w-5 h-5 rounded-full object-cover" />
            )}
            <span>{ownerName}</span>
          </div>
          <span className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1 text-accent font-medium">
            ดูรายละเอียด <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
