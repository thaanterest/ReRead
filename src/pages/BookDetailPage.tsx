import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookMarked, MessageCircle, MapPin, Share2, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import { apiGetBook, type BookData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth() || {};
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await apiGetBook(id);
        if (res.success && res.data) {
          setBook(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'ไม่พบหนังสือเล่มนี้');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 text-center">
        <p className="text-warning text-xl mb-4">{error || 'ไม่พบหนังสือเล่มนี้'}</p>
        <Link to="/browse" className="text-accent hover:underline">← กลับไปหน้าค้นหา</Link>
      </div>
    );
  }

  const coverImage = book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600';
  const ownerName = book.owner?.display_name || 'ไม่ทราบ';
  const ownerAvatar = book.owner?.avatar_url || '';

  const conditionTH = {
    'New': 'มือหนึ่ง/ใหม่',
    'Like New': 'เหมือนใหม่',
    'Good': 'สภาพดี',
    'Fair': 'พอใช้',
    'Poor': 'เก่า/มีตำหนิ'
  }[book.condition] || book.condition;

  const isOwner = user?.id === book.owner_id;
  const canBuy = (book.listing_type === 'sell' || book.listing_type === 'both' || (book.price !== null && book.price !== undefined)) && book.price;
  const canSwap = book.listing_type === 'exchange' || book.listing_type === 'both' || !book.listing_type;

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      
      {/* Back navigation */}
      <Link to="/browse" className="inline-flex items-center gap-2 text-text-main/60 hover:text-text-main transition-colors mb-8 font-medium">
        <ArrowLeft className="w-4 h-4" /> กลับไปหน้าค้นหา
      </Link>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        
        {/* Left: Image Gallery */}
        <div className="w-full md:w-5/12 lg:w-1/2 flex gap-4">
          {/* Vertical Thumbnails */}
          <div className="hidden sm:flex flex-col gap-4 w-20">
            <div className="w-full aspect-[3/4] border-2 border-accent rounded-md overflow-hidden opacity-100 cursor-pointer">
              <img src={coverImage} className="w-full h-full object-cover" alt="Thumbnail 1" />
            </div>
            <div className="w-full aspect-[3/4] border border-border-main rounded-md overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
              <img src={coverImage} className="w-full h-full object-cover grayscale" alt="Thumbnail 2" />
            </div>
          </div>
          
          {/* Main Image */}
          <div className="flex-1 relative aspect-[3/4] border border-border-main rounded-md overflow-hidden bg-bg-secondary">
            <img src={coverImage} className="w-full h-full object-cover" alt={book.title} />
            
            {/* Signature Condition Badge */}
            <div className="absolute top-6 right-6 bg-bg-main border border-border-main border-dashed px-4 py-2 flex flex-col items-center shadow-sm transform rotate-2">
              <span className="text-[10px] tracking-widest text-text-main/60 uppercase font-sans mb-1">สภาพประเมิน</span>
              <span className="font-heading text-lg font-medium text-text-main">{conditionTH}</span>
            </div>

            {/* Price Badge on photo if available */}
            {book.price !== null && book.price !== undefined && (
              <div className="absolute bottom-6 left-6 bg-accent text-bg-main px-4 py-1.5 rounded font-heading text-xl font-medium shadow-md">
                ฿{book.price.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col">
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {book.tags.map(tag => (
              <span key={tag} className={`text-xs px-2.5 py-1 rounded-sm font-medium ${tag === 'Out of Print' ? 'bg-warning text-bg-main' : 'bg-bg-secondary text-text-main border border-border-main'}`}>
                {tag === 'Out of Print' ? 'หายาก / เลิกพิมพ์' : tag}
              </span>
            ))}
            {book.listing_type && (
              <span className="text-xs px-2.5 py-1 rounded-sm bg-accent/15 text-accent font-medium border border-accent/20">
                {book.listing_type === 'sell' ? 'สำหรับขาย' : book.listing_type === 'exchange' ? 'สำหรับแลกเปลี่ยน' : 'ขายหรือแลกเปลี่ยน'}
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-heading font-medium mb-1 text-text-main">{book.title}</h1>
          <p className="text-lg text-text-main/70 mb-4">โดย {book.author}</p>

          {/* Prominent Price Box */}
          {book.price !== null && book.price !== undefined && (
            <div className="flex items-baseline gap-3 p-4 bg-bg-secondary/50 rounded-md border border-border-main mb-6">
              <span className="text-xs uppercase tracking-wider text-text-main/60">ราคาขายส่งต่อ</span>
              <span className="font-heading text-3xl font-medium text-accent">
                ฿{book.price.toLocaleString()}
              </span>
              <span className="text-xs text-text-main/50">+ ค่าจัดส่งมาตรฐาน ฿40</span>
            </div>
          )}
          
          {/* Owner Profile (Embedded) */}
          <div className="flex items-center justify-between p-4 bg-bg-secondary border border-border-main rounded-md mb-6">
            <div className="flex items-center gap-4">
              {ownerAvatar ? (
                <img src={ownerAvatar} alt={ownerName} className="w-12 h-12 rounded-full object-cover border border-border-main" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-heading text-lg">
                  {ownerName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-text-main">เจ้าของ: {ownerName}</p>
                <div className="flex items-center gap-1 text-sm text-text-main/60 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> กรุงเทพมหานคร
                </div>
              </div>
            </div>
            <Link to="/chat" className="p-2 text-text-main/60 hover:text-accent transition-colors" title="ส่งข้อความถามรายละเอียด">
              <MessageCircle className="w-5 h-5" />
            </Link>
          </div>

          <div className="prose prose-stone mb-8 text-text-main/80 leading-relaxed text-sm">
            <p className="whitespace-pre-line">{book.description}</p>
            <p className="mt-3 text-xs text-text-main/60 italic">
              <strong>คำแนะนำ:</strong> ตรวจสอบสภาพและรายละเอียดกับผู้ขายก่อนสั่งซื้อ เพื่อความเข้าใจที่ตรงกัน
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            {isOwner ? (
              <div className="p-4 border border-border-main rounded-md bg-bg-secondary/30 text-center text-text-main/70 text-sm">
                คุณคือเจ้าของหนังสือเล่มนี้ สามารถจัดการได้ที่หน้า <Link to="/my-books" className="text-accent underline font-medium">หนังสือของฉัน</Link>
              </div>
            ) : book.status === 'Available' ? (
              <>
                {canBuy && (
                  <button
                    onClick={handleBuyClick}
                    className="w-full bg-accent text-bg-main py-3.5 rounded-md font-medium text-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-5 h-5" /> สั่งซื้อหนังสือเล่มนี้ (฿{book.price?.toLocaleString()})
                  </button>
                )}
                
                {canSwap && (
                  <button
                    className={`w-full py-3 rounded-md font-medium text-base transition-colors flex items-center justify-center gap-2 ${
                      canBuy
                        ? 'border border-border-main text-text-main hover:bg-bg-secondary'
                        : 'bg-accent text-bg-main hover:bg-accent/90'
                    }`}
                  >
                    <BookMarked className="w-5 h-5" /> เสนอแลกเปลี่ยนหนังสือเล่มนี้
                  </button>
                )}
              </>
            ) : (
              <button disabled className="w-full bg-warning/80 text-bg-main py-3.5 rounded-md font-medium text-base cursor-not-allowed flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {book.status === 'Sold' ? 'หนังสือเล่มนี้ถูกขายแล้ว' : book.status === 'Swapped' ? 'หนังสือเล่มนี้แลกเปลี่ยนสำเร็จแล้ว' : 'มีผู้สั่งซื้อหรือขอแลกแล้ว (รอดำเนินการ)'}
              </button>
            )}
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('คัดลอกลิงก์หนังสือแล้ว!');
              }}
              className="w-full bg-transparent border border-border-main text-text-main py-3 rounded-md font-medium hover:bg-bg-secondary transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" /> แชร์หนังสือน่าสนใจ
            </button>
          </div>

        </div>
      </div>
      
      {/* Checkout Modal */}
      {book && (
        <CheckoutModal
          book={book}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setBook(prev => prev ? { ...prev, status: 'Pending' } : null);
          }}
        />
      )}
    </div>
  );
}
