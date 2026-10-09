import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, Upload, AlertCircle, Loader2, QrCode } from 'lucide-react';
import { apiCreateOrder, type BookData, type OrderData } from '../services/api';

interface CheckoutModalProps {
  book: BookData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (order: OrderData) => void;
}

export default function CheckoutModal({ book, isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const navigate = useNavigate();
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<OrderData | null>(null);

  if (!isOpen) return null;

  const bookPrice = book.price || 0;
  const shippingFee = 40;
  const totalAmount = bookPrice + shippingFee;

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFileName(file.name);
      const url = URL.createObjectURL(file);
      setSlipUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      setError('กรุณากรอกข้อมูลการจัดส่งให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await apiCreateOrder({
        book_id: book.id,
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        slip_url: slipUrl || undefined,
        note: note || undefined,
      });

      if (res.success && res.data) {
        setCompletedOrder(res.data);
        if (onSuccess) onSuccess(res.data);
      } else {
        setError(res.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-bg-main border border-border-main rounded-lg shadow-xl my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-main bg-bg-secondary/40">
          <div>
            <h2 className="font-heading text-xl font-medium text-text-main">
              {completedOrder ? 'สั่งซื้อสำเร็จ' : 'สั่งซื้อหนังสือมือสอง'}
            </h2>
            <p className="text-xs text-text-main/60">ระบบซื้อขายตรงระหว่างเพื่อนนักอ่าน (C2C Marketplace)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-main/50 hover:text-text-main transition-colors rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedOrder ? (
          /* Success Screen */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-heading text-2xl font-medium mb-2">คำสั่งซื้อได้รับการบันทึกแล้ว!</h3>
            <p className="text-text-main/70 max-w-md mb-6 text-sm">
              รหัสคำสั่งซื้อของคุณคือ <span className="font-semibold text-accent">{completedOrder.order_number}</span> ผู้ขายจะได้รับการแจ้งเตือนและเตรียมจัดส่งพัสดุให้คุณ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="flex-1 bg-accent text-bg-main py-2.5 px-4 rounded-md font-medium text-sm hover:bg-accent/90 transition-colors"
              >
                ดูสถานะในแผงควบคุม
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-border-main text-text-main py-2.5 px-4 rounded-md font-medium text-sm hover:bg-bg-secondary transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          /* Order Form */
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-md text-warning text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Book Info Summary Card */}
            <div className="flex gap-4 p-4 border border-border-main rounded-md bg-bg-secondary/30 items-center">
              <img
                src={book.cover_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600'}
                alt={book.title}
                className="w-16 aspect-[3/4] object-cover rounded border border-border-main flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-medium text-text-main truncate">{book.title}</h4>
                <p className="text-xs text-text-main/60 mb-2">โดย {book.author}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2 py-0.5 border border-border-main rounded text-text-main/70">
                    สภาพ: {book.condition}
                  </span>
                  <span className="text-text-main/60">
                    ผู้ขาย: {book.owner?.display_name || 'เพื่อนนักอ่าน'}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs text-text-main/60 block">ราคาเล่มนี้</span>
                <span className="font-heading text-lg font-medium text-accent">
                  ฿{bookPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Shipping Address Form */}
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-base font-medium text-text-main border-b border-border-main pb-2">
                1. ข้อมูลการจัดส่งพัสดุ
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-main">
                    ชื่อ-นามสกุล ผู้รับ <span className="text-warning">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full bg-bg-main border border-border-main rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-main">
                    เบอร์โทรศัพท์ <span className="text-warning">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    placeholder="เช่น 0812345678"
                    className="w-full bg-bg-main border border-border-main rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-main">
                  ที่อยู่จัดส่งพัสดุ <span className="text-warning">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="บ้านเลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
                  className="w-full bg-bg-main border border-border-main rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-main">
                  หมายเหตุถึงผู้ขาย (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ฝากห่อบับเบิ้ลหนาๆ ให้ด้วยนะคะ"
                  className="w-full bg-bg-main border border-border-main rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Payment & PromptPay */}
            <div className="flex flex-col gap-4">
              <h3 className="font-heading text-base font-medium text-text-main border-b border-border-main pb-2">
                2. การชำระเงิน (PromptPay)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                
                {/* PromptPay QR Box */}
                <div className="p-4 border border-border-main rounded-md bg-bg-secondary/40 flex flex-col items-center text-center">
                  <div className="w-36 h-36 bg-white border border-border-main rounded-md p-2 flex flex-col items-center justify-center shadow-sm mb-3">
                    <QrCode className="w-24 h-24 text-stone-800 mb-1" />
                    <span className="text-[10px] font-sans text-stone-500 font-semibold tracking-wider">
                      PROMPTPAY QR
                    </span>
                  </div>
                  <p className="text-xs text-text-main/70 font-medium">สแกนจ่ายผ่านแอปธนาคารทุกแห่ง</p>
                  <p className="text-xs text-text-main/50 mt-0.5">
                    พร้อมเพย์ผู้ขาย: {book.owner?.display_name || 'ผู้ขาย ReRead'}
                  </p>
                </div>

                {/* Upload Slip & Price Breakdown */}
                <div className="flex flex-col gap-4">
                  {/* Price Calculation Box */}
                  <div className="p-3 bg-bg-secondary/50 rounded-md border border-border-main/60 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between text-text-main/70">
                      <span>ค่าหนังสือ:</span>
                      <span>฿{bookPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-text-main/70">
                      <span>ค่าจัดส่งมาตรฐาน:</span>
                      <span>฿{shippingFee}</span>
                    </div>
                    <div className="flex justify-between font-heading font-medium text-sm text-text-main pt-1.5 border-t border-border-main">
                      <span>ยอดชำระทั้งหมด:</span>
                      <span className="text-accent text-base font-semibold">฿{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Slip Upload */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-text-main">
                      แนบสลิปหลักฐานการโอน
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-border-main rounded-md cursor-pointer hover:border-accent hover:bg-bg-secondary/60 transition-colors">
                      <Upload className="w-4 h-4 text-text-main/60" />
                      <span className="text-xs text-text-main/70 truncate flex-1">
                        {slipFileName || 'เลือกรูปภาพสลิปโอนเงิน...'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSlipChange}
                      />
                    </label>
                    {slipUrl && (
                      <div className="relative mt-1 w-20 aspect-[3/4] rounded border border-border-main overflow-hidden">
                        <img src={slipUrl} alt="Slip Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setSlipUrl(null); setSlipFileName(''); }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-main mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-md border border-border-main text-sm font-medium text-text-main/70 hover:text-text-main hover:bg-bg-secondary transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-accent text-bg-main px-6 py-2.5 rounded-md text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-70 shadow-sm"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                ยืนยันการสั่งซื้อ (฿{totalAmount.toLocaleString()})
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
