import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, X, ChevronDown, Loader2 } from 'lucide-react';
import { apiCreateBook } from '../services/api';

const CATEGORIES = ['วรรณกรรม', 'นิยายแปล', 'จิตวิทยา/พัฒนาตนเอง', 'ประวัติศาสตร์', 'แฟนตาซี/ไซไฟ', 'นิยายสืบสวน', 'การ์ตูน/มังงะ', 'อื่นๆ'];

export default function AddBookPage() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    condition: '',
    category: '',
    description: '',
    listingType: 'both', // 'sell', 'exchange', 'both'
    price: '',
    isRare: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.condition) return;
    if ((form.listingType === 'sell' || form.listingType === 'both') && (!form.price || parseFloat(form.price) <= 0)) {
      alert('กรุณากรอกราคาขายให้ถูกต้อง');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const tags = [];
      if (form.category) tags.push(form.category);
      if (form.isRare) tags.push('หายาก / เลิกพิมพ์แล้ว');
      
      const priceVal = form.listingType !== 'exchange' && form.price ? parseFloat(form.price) : undefined;

      const res = await apiCreateBook({
        title: form.title,
        author: form.author,
        condition: form.condition,
        description: form.description,
        tags: tags,
        listing_type: form.listingType,
        price: priceVal,
        cover_url: previewUrl || undefined,
      });
      
      if (res.success) {
        setSubmitted(true);
        setTimeout(() => navigate('/my-books'), 2000);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการลงรายการหนังสือ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-6 md:px-12 py-32 text-center">
        <div className="text-5xl mb-6">📚</div>
        <h2 className="font-heading text-3xl font-medium mb-4">ลงรายการสำเร็จ!</h2>
        <p className="text-text-main/70">หนังสือของคุณถูกเพิ่มเข้าชั้นแล้ว กำลังพาคุณไปที่หน้าหนังสือของฉัน…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-medium mb-3">ลงรายการหนังสือ</h1>
        <p className="text-text-main/70">กรอกรายละเอียดหนังสือที่คุณต้องการส่งต่อ เพื่อให้นักอ่านคนต่อไปได้พบกับมัน</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">

        {/* Image Upload */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium uppercase tracking-widest text-text-main/60">รูปปกหนังสือ</label>
          <div className="flex gap-4 items-start">
            <label className="relative w-36 aspect-[3/4] border-2 border-dashed border-border-main rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-bg-secondary transition-colors flex-shrink-0 overflow-hidden">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 bg-bg-main rounded-full p-1 border border-border-main">
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-text-main/30 mb-2" />
                  <span className="text-xs text-text-main/50 text-center px-2">คลิกเพื่ออัปโหลด</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            <p className="text-sm text-text-main/60 leading-relaxed pt-2">
              รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB<br/>
              แนะนำให้ถ่ายรูปปกหนังสือให้เห็นชัดเจน เพื่อให้ผู้สนใจแลกเปลี่ยนตัดสินใจได้ง่ายขึ้น
            </p>
          </div>
        </div>

        {/* Book Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">ชื่อหนังสือ <span className="text-warning">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full bg-bg-main border border-border-main rounded-md px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder="เช่น The Secret History" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">ชื่อผู้แต่ง <span className="text-warning">*</span></label>
            <input name="author" value={form.author} onChange={handleChange} required
              className="w-full bg-bg-main border border-border-main rounded-md px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder="เช่น Donna Tartt" />
          </div>
        </div>

        {/* Listing Type & Price */}
        <div className="p-5 rounded-md border border-border-main bg-bg-secondary/40 flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium block mb-2">
              รูปแบบการส่งต่อ <span className="text-warning">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { value: 'both', label: 'ขายหรือแลกเปลี่ยน', desc: 'เปิดรับทั้งคนซื้อและคนเสนอแลก' },
                { value: 'sell', label: 'ขายอย่างเดียว', desc: 'ตั้งราคาขายหนังสือเล่มนี้' },
                { value: 'exchange', label: 'แลกเปลี่ยนอย่างเดียว', desc: 'ส่งต่อเพื่อแลกหนังสือเล่มอื่น' },
              ].map(item => (
                <label
                  key={item.value}
                  className={`flex flex-col p-3 rounded-md border cursor-pointer transition-all ${
                    form.listingType === item.value
                      ? 'border-accent bg-bg-main shadow-sm'
                      : 'border-border-main/60 bg-bg-main/50 hover:bg-bg-main'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="listingType"
                      value={item.value}
                      checked={form.listingType === item.value}
                      onChange={handleChange}
                      className="accent-accent"
                    />
                    <span className="font-heading text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-[11px] text-text-main/60 leading-tight pl-5">{item.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {form.listingType !== 'exchange' && (
            <div className="flex flex-col gap-2 pt-3 border-t border-border-main/60">
              <label className="text-sm font-medium">
                ราคาขาย (บาท) <span className="text-warning">*</span>
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3.5 top-2.5 text-text-main/50 font-medium">฿</span>
                <input
                  type="number"
                  name="price"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  required={form.listingType !== 'exchange'}
                  className="w-full bg-bg-main border border-border-main rounded-md pl-8 pr-4 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-heading text-lg"
                  placeholder="เช่น 180"
                />
              </div>
              <p className="text-xs text-text-main/60">
                ราคานี้ไม่รวมค่าจัดส่งมาตรฐาน 40 บาท (ผู้ซื้อจะเป็นผู้รับผิดชอบค่าจัดส่ง)
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Condition */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">สภาพหนังสือ <span className="text-warning">*</span></label>
            <div className="flex flex-col gap-2">
              {[
                { value: 'New', label: 'มือหนึ่ง/ใหม่', desc: 'ยังไม่ผ่านการใช้งาน' },
                { value: 'Like New', label: 'เหมือนใหม่', desc: 'อ่านน้อยครั้ง ไม่มีรอย' },
                { value: 'Good', label: 'สภาพดี', desc: 'มีรอยพับเล็กน้อย' },
                { value: 'Fair', label: 'พอใช้', desc: 'มีรอยใช้งานพอสมควร' },
                { value: 'Poor', label: 'เก่า/มีตำหนิ', desc: 'มีรอยขีดเขียน/ฉีกขาด' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${form.condition === opt.value ? 'border-accent bg-accent/5' : 'border-border-main hover:bg-bg-secondary'}`}>
                  <input type="radio" name="condition" value={opt.value} checked={form.condition === opt.value} onChange={handleChange} className="accent-accent" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-text-main/60">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">หมวดหมู่</label>
              <div className="relative">
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full appearance-none bg-bg-main border border-border-main rounded-md px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all">
                  <option value="">เลือกหมวดหมู่</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-text-main/50 pointer-events-none" />
              </div>
            </div>

            {/* Rare checkbox */}
            <label className="flex items-start gap-3 p-4 border border-border-main rounded-md cursor-pointer hover:bg-bg-secondary transition-colors">
              <input type="checkbox" checked={form.isRare} onChange={e => setForm(p => ({ ...p, isRare: e.target.checked }))} className="mt-0.5 accent-warning" />
              <div>
                <p className="text-sm font-medium">หายาก / เลิกพิมพ์แล้ว</p>
                <p className="text-xs text-text-main/60">หนังสือที่หาซื้อยากในปัจจุบัน จะแสดงป้าย "หายาก" บนการ์ด</p>
              </div>
            </label>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">บันทึกจากเจ้าของ</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                className="w-full bg-bg-main border border-border-main rounded-md px-4 py-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
                placeholder="เล่าสภาพจริงๆ ของหนังสือให้ผู้สนใจได้รู้ เช่น มีรอยไฮไลท์หรือเปล่า ปกโค้งมั้ย ฯลฯ" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border-main">
          <button type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 bg-accent text-bg-main px-10 py-3 rounded-md font-medium text-lg hover:bg-accent/90 transition-colors disabled:opacity-70">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            ลงรายการหนังสือ
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="text-text-main/60 hover:text-text-main transition-colors font-medium">
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
