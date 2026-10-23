import { useState, useEffect } from 'react';
import { ArrowRight, BookMarked, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { MOCK_BOOKS } from '../data/mockBooks';
import { apiGetBooks } from '../services/api';

export default function LandingPage() {
  const [featuredBooks, setFeaturedBooks] = useState<any[]>(MOCK_BOOKS.slice(0, 4));

  useEffect(() => {
    apiGetBooks({ page: 1, limit: 4 })
      .then(res => {
        if (res.success && res.data?.books?.length) {
          setFeaturedBooks(res.data.books);
        }
      })
      .catch(() => {
        // keep fallback mock books
      });
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 py-12 sm:py-16 md:py-32 grid md:grid-cols-12 gap-8 lg:gap-20 items-center">
        <div className="md:col-span-6 lg:col-span-5 flex flex-col items-start gap-6 sm:gap-9">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl leading-[1.2] font-heading font-medium">
            เรื่องราวดีๆ มีไว้ให้ <span className="italic text-accent">แบ่งปัน</span> ไม่ใช่แค่เก็บบนชั้น
          </h1>

          <div className="text-base sm:text-lg text-text-main/80 leading-relaxed font-sans">
            ร่วมเป็นส่วนหนึ่งกับนักอ่านกว่า <span className="font-semibold text-text-main">12,000 คน</span> ในคอมมูนิตี้ร้านหนังสืออิสระของเรา
            เราได้ช่วยส่งต่อหนังสือที่รักไปแล้วกว่า <span className="font-semibold text-text-main">45,000 เล่ม</span> ตั้งแต่เริ่มก่อตั้ง
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3 sm:gap-4">
            <Link to="/browse" className="bg-accent text-bg-main px-6 py-3.5 rounded-md font-medium text-base hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
              ค้นหาหนังสือแลก <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/marketplace" className="border border-border-main bg-bg-main text-text-main px-6 py-3.5 rounded-md font-medium text-base hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2">
              หนังสือมือสอง <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="md:col-span-6 lg:col-span-7 relative h-[280px] sm:h-[420px] lg:h-[600px] w-full mt-4 md:mt-0">
          {/* Editorial Style Image Composition */}
          <div className="absolute top-0 right-0 w-4/5 h-4/5 border border-border-main rounded-md overflow-hidden z-10">
            <img
              src="https://images.pexels.com/photos/4466329/pexels-photo-4466329.jpeg"
              alt="หนังสือบนโต๊ะ"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute bottom-0 left-0 w-3/5 h-3/5 border border-border-main rounded-md overflow-hidden z-20 shadow-xl shadow-text-main/5">
            <img
              src="https://images.pexels.com/photos/6632420/pexels-photo-6632420.jpeg"
              alt="คนกำลังอ่านหนังสือ"
              className="object-cover w-full h-full"
            />
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-border-main rounded-full z-0 opacity-50 border-dashed hidden md:block" />
        </div>
      </section>

      <div className="w-full h-px bg-border-main max-w-7xl mx-auto" />

      {/* Recommended Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-heading mb-4 font-medium">หนังสือมาใหม่จากชั้น</h2>
            <p className="text-text-main/70 text-lg leading-relaxed">
              ค้นพบหนังสือที่เพิ่งถูกเพิ่มเข้ามาใหม่โดยคอมมูนิตี้ของเรา มีตั้งแต่ปกแข็งสภาพกริบไปจนถึงปกอ่อนที่เต็มไปด้วยร่องรอยการอ่าน
            </p>
          </div>
          <Link to="/browse" className="text-accent font-medium hover:underline underline-offset-4 flex items-center gap-2 pb-1">
            ดูหนังสือทั้งหมด <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {featuredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bg-secondary w-full py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl font-heading mb-16 text-center font-medium">วิธีการแลกเปลี่ยน</h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="w-16 h-16 rounded-full border border-border-main bg-bg-main flex items-center justify-center text-accent mb-2">
                <BookMarked className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-medium">1. ลงรายการหนังสือ</h3>
              <p className="text-text-main/70 leading-relaxed">
                เพิ่มหนังสือที่คุณอ่านจบแล้ว พร้อมระบุสภาพหนังสืออย่างซื่อตรงเหมือนบรรณารักษ์ตัวจริง
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center">
              <div className="w-16 h-16 rounded-full border border-border-main bg-bg-main flex items-center justify-center text-accent mb-2">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-medium">2. หาคู่หนังสือที่ถูกใจ</h3>
              <p className="text-text-main/70 leading-relaxed">
                เลือกดูหนังสือในชั้นของเรา เมื่อเจอเล่มที่ถูกใจก็ส่งคำขอแลกเปลี่ยนไปได้เลย
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center text-center">
              <div className="w-16 h-16 rounded-full border border-border-main bg-bg-main flex items-center justify-center text-accent mb-2">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-medium">3. แลกเปลี่ยนและอ่าน</h3>
              <p className="text-text-main/70 leading-relaxed">
                เมื่ออีกฝ่ายตอบรับ ก็ทำการแลกเปลี่ยนผ่านทางไปรษณีย์หรือนัดรับ แล้วเริ่มอ่านเล่มใหม่ได้ทันที
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Search({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
