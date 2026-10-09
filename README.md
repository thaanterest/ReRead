# 📚 ReRead — แพลตฟอร์มแลกเปลี่ยนหนังสือมือสอง (Book Exchange Platform)

> **ReRead** เป็นเว็บแอปพลิเคชันสำหรับชุมชนคนรักการอ่าน ที่ต้องการส่งต่อหนังสือที่อ่านจบแล้ว และค้นพบหนังสือเล่มใหม่ผ่านการแลกเปลี่ยนกับเพื่อนนักอ่าน  
> ออกแบบภายใต้แนวคิด **"ร้านหนังสืออิสระยุคใหม่ (Modern Independent Bookstore)"** เน้นประสบการณ์ใช้งานที่เรียบง่าย สบายตา และมีประสิทธิภาพสูง

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Container-Docker_Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

---

## 💡 ReRead คืออะไร?

ReRead ถูกพัฒนาขึ้นเพื่อแก้ปัญหาหนังสือที่ถูกวางทิ้งไว้บนชั้นหลังอ่านจบ โดยเปลี่ยนให้หนังสือเหล่านั้นกลับมามีคุณค่าใหม่อีกครั้งผ่านการแลกเปลี่ยนระหว่างผู้ใช้ ผู้ใช้งานสามารถนำหนังสือของตนเองมาลงรายการ และสามารถค้นหาหนังสือที่ตนเองสนใจ หรือโพสต์ประกาศตามหาหนังสือในบอร์ดคำขอได้

---

## ✨ ฟีเจอร์หลักของระบบ (Key Features)

### 1. 🔍 ระบบค้นหาและสำรวจหนังสือ (Smart Search & Discovery)
- **Trigram Similarity Search:** ค้นหาชื่อหนังสือและชื่อผู้แต่งได้อย่างรวดเร็ว รองรับการค้นหาข้อความบางส่วน (`ILIKE %...%`) ทั้งภาษาไทยและภาษาอังกฤษ ด้วยส่วนขยาย `pg_trgm` และ GIN Index บน PostgreSQL
- **ตัวกรองอัจฉริยะ (Filters):** คัดกรองหนังสือตามหมวดหมู่แท็ก (Fiction, Non-Fiction, Classic ฯลฯ), สภาพหนังสือ (New, Like New, Good, Fair, Poor) และสถานะความพร้อม (Available, Pending, Swapped)
- **ค้นหาหนังสือสำหรับแลก (`/browse`):** หน้ารวมหนังสือที่เปิดรับแลกเปลี่ยนโดยเฉพาะ แสดงป้ายประเภทและข้อมูลผู้ส่งต่อ

### 2. 🛍️ ตลาดหนังสือมือสองสำหรับขาย (`/marketplace`)
- **แยกหน้าเฉพาะสำหรับขาย:** แยกจากหน้าค้นหาแลกเปลี่ยนอย่างเด็ดขาดเพื่อความสะดวกในการซื้อ
- **ตัวกรองงบประมาณ (Price Filter):** Quick Chips คัดกรองราคาด่วน (≤ ฿150, ≤ ฿250, ≤ ฿350, ≤ ฿500) และช่องระบุงบสูงสุดตามต้องการ
- **การจัดเรียงราคา:** เรียงตามราคาต่ำไปสูง (฿ → ฿฿฿), ราคาสูงไปต่ำ หรือรายการมาใหม่ล่าสุด
- **โมดอลสั่งซื้อหนังสือ (Checkout Modal):** คำนวณราคาสินค้า ค่าจัดส่งมาตรฐาน กรอกที่อยู่จัดส่ง และเลือกช่องทางชำระเงิน พร้อมบันทึกลงฐานข้อมูลจริง

### 3. 📦 แผงควบคุมคำสั่งซื้อและติดตามพัสดุ (`/dashboard`)
- **ติดตามสถานะการซื้อขาย:** แยกแท็บ "รายการที่ฉันซื้อ" และ "รายการที่ฉันขาย" อย่างชัดเจน
- **Stepper ติดตามพัสดุ 3 ขั้นตอน:** รอดำเนินการจัดส่ง → จัดส่งแล้ว (ผู้ขายกรอกขนส่งและเลขพัสดุ Tracking Number) → สำเร็จ (ผู้ซื้อกดยืนยันรับหนังสือ)
- **เชื่อมต่อ Orders API จริง:** ซิงค์สถานะและข้อมูลจัดส่งผ่านฐานข้อมูล PostgreSQL

### 4. 💬 ระบบห้องสนทนาเพื่อการแลกเปลี่ยน (`/chat`)
- **Context-aware Chat:** ผูกบทสนทนากับเล่มหนังสือที่สนใจแลกเปลี่ยนอย่างชัดเจน
- **กล่องข้อความโต้ตอบได้:** แสดงรายการคู่สนทนา พร้อมป้ายจำนวนข้อความที่ยังไม่ได้อ่าน (Unread Count)
- **ส่งข้อความโต้ตอบทันที:** พิมพ์และกดส่งข้อความได้ลื่นไหล พร้อมระบบ Auto-scroll เลื่อนลงล่างอัตโนมัติ

### 5. 📖 ระบบจัดการหนังสือ (Book Listing & Management)
- **ลงรายการหนังสือใหม่ (`/add-book`):** รองรับทั้งเลือกลงเพื่อ "แลกเปลี่ยนอย่างเดียว", "ขายอย่างเดียว (ระบุราคา)", หรือ "ทำได้ทั้งสองอย่าง"
- **ชั้นหนังสือของฉัน (`/my-books`):** จัดการหนังสือที่ตนเองเป็นเจ้าของ ดูสถานะความพร้อม และสถิติหนังสือที่ขายแล้ว
- **หน้ารายละเอียดหนังสือ (`/book/:id`):** ข้อมูลสภาพ เรื่องย่อ รูปถ่าย พร้อมปุ่มสั่งซื้อและปุ่มยื่นข้อเสนอขอแลก

### 6. 📢 บอร์ดตามหาหนังสือ (Book Requests Board)
- **ประกาศตามหาหนังสือ (`/requests`):** โพสต์ข้อความตามหาหนังสือหายากหรือเล่มที่ต้องการอ่าน
- **จัดการคำขอ:** ค้นหาคำขอของผู้อื่น และลบคำขอของตนเองได้

### 7. 🛡️ แผงควบคุมส่วนกลางสำหรับผู้ดูแลระบบ (Admin Panel 8 หน้า)
- เข้าสู่ระบบแอดมินแยกต่างหากที่ `/admin/login` พร้อมลิงก์ตรงใน Terminal ตอนรัน `npm run dev`
- มีระบบ Role Guard และ Layout หลังบ้านระดับมืออาชีพ ครอบคลุม:
  * แดชบอร์ดสถิติรวมและกราฟแนวโน้ม (`/admin`)
  * จัดการและระงับผู้ใช้งาน (`/admin/users`)
  * ตรวจสอบและอนุมัติหนังสือ (`/admin/books`)
  * ตรวจสอบการแลกเปลี่ยนและติดตามพัสดุ (`/admin/swaps`)
  * จัดการกระทู้บอร์ดตามหา (`/admin/requests`)
  * ศูนย์รับและจัดการข้อร้องเรียนพร้อมหลักฐาน (`/admin/reports`)
  * จัดการหมวดหมู่หนังสือ (`/admin/categories`)

### 8. 🔐 ระบบสมาชิกและความปลอดภัย (Authentication & Security)
- **JWT Authentication:** ตรวจสอบสิทธิ์ด้วย Token และเข้ารหัสผ่านด้วย `bcrypt`
- **Real-time Password Validation:** กล่อง Checklist 4 เงื่อนไขความปลอดภัย (ความยาว 8+, ตัวพิมพ์ใหญ่ A-Z, ตัวเลข 0-9, อักขระพิเศษ) อัปเดตสถานะสีเขียวทันทีขณะพิมพ์
- **Localized Error Handling:** ถอดรหัสและแปลข้อผิดพลาดจาก Backend เป็นภาษาไทยชัดเจน ป้องกันปัญหา `[object Object]`

### 9. ⚡ สถาปัตยกรรมฐานข้อมูลประสิทธิภาพสูง (Database Optimization & Indexing)
- ออกแบบ Index ครอบคลุมทั้ง **Composite B-Tree Indexes** และ **GIN Trigram Indexes** รองรับการสืบค้นบนข้อมูลขนาด **1,000,000+ แถว** ได้ในระดับมิลลิวินาที
- มีชุดทดสอบ Benchmark อัตโนมัติในโฟลเดอร์ [`bench/`](bench/) พร้อมเอกสารวิเคราะห์อย่างละเอียดใน [`docs/INDEXING_REPORT.md`](docs/INDEXING_REPORT.md)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### 🎨 Frontend
- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/) (พอร์ต 5176 พร้อม Admin URL Banner)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) (Custom Theme ธีมร้านหนังสืออิสระ `#FAF6F0`, `#2B2420`, `#7A8B6F`, `#C97B4A`)
- **Routing:** [React Router 7](https://reactrouter.com/) (Lazy Loading ในส่วนแอดมิน)
- **Icons:** [Lucide React](https://lucide.dev/)

### ⚙️ Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
- **ORM:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Async Engine ด้วย `asyncpg`)
- **Schema & Validation:** [Pydantic v2](https://docs.pydantic.dev/)
- **Database Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
- **Security:** `python-jose` (JWT) + `passlib[bcrypt]`

### 🗄️ Database & Infrastructure
- **Database:** [PostgreSQL 16](https://www.postgresql.org/) (พร้อมเปิดใช้งานส่วนขยาย `pg_trgm`)
- **Containerization:** [Docker & Docker Compose](https://www.docker.com/)

---

## 🏗️ สถาปัตยกรรมของระบบ (Architecture)

ระบบปัจจุบันพัฒนาในรูปแบบ **Modular Monolith** ที่แยกการทำงานระหว่าง Frontend และ REST API Backend ผ่าน Docker Containers:

```
┌────────────────────────┐         HTTP / JSON          ┌────────────────────────┐
│     React Frontend     │ ◄──────────────────────────► │     FastAPI Backend    │
│  (Port 5176 via Vite)  │    (JWT Bearer Auth / CORS)  │ (Port 8000 via Uvicorn)│
└────────────────────────┘                              └───────────┬────────────┘
                                                                    │
                                                      SQLAlchemy 2.0│ (asyncpg)
                                                                    ▼
                                                        ┌────────────────────────┐
                                                        │     PostgreSQL 16      │
                                                        │  - pg_trgm (GIN Index) │
                                                        │  - Composite B-Tree    │
                                                        │ (Port 5432 via Docker) │
                                                        └────────────────────────┘
```

> สามารถดูแผนผังการออกแบบสถาปัตยกรรมเพิ่มเติมได้ที่ [`docs/microservices-architecture.svg`](docs/microservices-architecture.svg) และ [`docs/tech-stack-diagram.svg`](docs/tech-stack-diagram.svg)

---

## 🚀 วิธีการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 📋 สิ่งที่ต้องติดตั้งก่อน (Prerequisites)
1. [Git](https://git-scm.com/)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (เปิดใช้งานและพร้อมรัน Container)
3. [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป สำหรับรัน Frontend)

---

### 📥 ขั้นตอนการรันโปรเจกต์

#### 1. Clone Repository และเตรียม Environment Variables
```bash
git clone https://github.com/aphi0405/ReRead.git
cd ReRead

# สำหรับ Linux/macOS:
cp .env.example .env

# สำหรับ Windows PowerShell:
Copy-Item .env.example .env
```

#### 2. รัน Backend และ Database (ผ่าน Docker)
```bash
# สั่งสตาร์ทคอนเทนเนอร์ในโหมด Background
docker compose up --build -d

# ดำเนินการ Migrate โครงสร้างฐานข้อมูลล่าสุด (รวมตารางคำสั่งซื้อและฟิลด์ขายหนังสือ)
docker compose exec api alembic upgrade head
```

*(ทางเลือก) หากต้องการใส่ชุดข้อมูลหนังสือตัวอย่าง 48 เล่มและบัญชีผู้ใช้จำลอง:*
```bash
docker compose exec api python -m app.seed_books
```

#### 3. รัน Frontend (React + Vite)
เปิด Terminal อีกหน้าต่างหนึ่ง แล้วสั่งรัน:
```bash
# ติดตั้ง dependencies
npm install

# รัน Development Server
npm run dev
```

---

## 🌐 URLs สำหรับเข้าใช้งาน

| ส่วนงาน | URL | คำอธิบาย |
|---|---|---|
| **Frontend Website** | [http://localhost:5176](http://localhost:5176) | หน้าเว็บหลักของ ReRead (กำหนดพอร์ต 5176) |
| **Admin Portal** | [http://localhost:5176/admin/login](http://localhost:5176/admin/login) | หน้าเข้าสู่ระบบสำหรับแอดมิน (ขึ้นใน Terminal ตอนรัน `npm run dev`) |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | ฐานข้อมูลและ REST API Endpoints |
| **API Documentation (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | เอกสารคู่มือทดสอบ API แบบ Interactive |
| **Alternative Docs (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | เอกสาร API รูปแบบ ReDoc |

---

## 🗺️ แผนผังหน้าเว็บไซต์ทั้งหมด (Site Map: 21 หน้า)

### 👤 ส่วนผู้ใช้งานทั่วไป (User Pages: 13 หน้า)

| เส้นทาง (Path) | หน้าเว็บ | การเชื่อมต่อข้อมูล |
|---|---|---|
| `/` | หน้าแรก (Landing Page) | ข้อมูลแนะนำและภาพรวมแพลตฟอร์ม |
| `/browse` | ค้นหาหนังสือ (สำหรับแลก) | หน้ารวมหนังสือสำหรับแลกเปลี่ยนโดยเฉพาะ กรองหมวดหมู่/สภาพ/ความพร้อม |
| `/marketplace` | หนังสือมือสอง (สำหรับซื้อ) | หน้ารวมหนังสือมือสองสำหรับขายโดยเฉพาะ กรองงบประมาณราคา/เรียงราคาต่ำ-สูง |
| `/book/:id` | หน้ารายละเอียดหนังสือ | ดึงข้อมูลหนังสือจริง มีปุ่มสั่งซื้อ (Buy Now) และเสนอแลกเปลี่ยน |
| `/requests` | บอร์ดตามหาหนังสือ | เชื่อมต่อ API รายการคำขอหนังสือ (`/api/requests`) |
| `/login`, `/signup` | หน้าเข้าสู่ระบบ / สมัครสมาชิก | เชื่อมต่อระบบ Auth รับ JWT Token พร้อม Checklist รหัสผ่าน |
| `/my-books` | รายการหนังสือของฉัน | แสดงหนังสือที่บัญชีปัจจุบันเป็นเจ้าของ พร้อมสถิติขายแล้ว |
| `/add-book` | เพิ่มรายการหนังสือใหม่ | ส่งข้อมูลเข้าสู่ระบบผ่าน API เลือกว่าจะขาย (ระบุราคา) หรือแลกเปลี่ยน |
| `/settings` | ตั้งค่าบัญชีผู้ใช้ | แก้ไขข้อมูลชื่อที่แสดงและรายละเอียดบัญชี |
| `/about` | เกี่ยวกับโครงการ | ข้อมูลและวิสัยทัศน์ของแพลตฟอร์ม ReRead |
| `/dashboard` | แผงควบคุมการซื้อขาย & แลกเปลี่ยน | เชื่อมต่อ Orders API จริง ติดตามพัสดุ ผู้ขายกรอกเลข Tracking ผู้ซื้อกดยืนยันรับของ |
| `/chat` | ห้องสนทนาเพื่อการแลกเปลี่ยน | ระบบห้องสนทนาพร้อม Context หนังสือโต้ตอบได้สมบูรณ์ (Interactive UI) |
| `/profile` | โปรไฟล์ผู้ใช้ | ข้อมูลโปรไฟล์ สถิติการส่งต่อหนังสือ และประวัติ |

### 🛡️ ส่วนผู้ดูแลระบบ (Admin Panel: 8 หน้า)

ระบบจัดการหลังบ้านสำหรับผู้ดูแลระบบ (แยกเลย์เอาต์เฉพาะ มี Sidebar/Topbar แยกชัดเจน ไม่ปะปนกับฝั่งผู้ใช้):
* **บัญชีทดสอบเข้าสู่ระบบ (Mock Admin):** `admin@reread.com` / `admin1234` (มีปุ่มกรอกอัตโนมัติบนหน้าจอ)
* **การป้องกันสิทธิ์ (Role-based Guard):** เข้าหน้า `/admin/*` โดยยังไม่ล็อกอิน จะถูกส่งไปยังหน้า `/admin/login` อัตโนมัติ และคงสถานะหลังรีเฟรชผ่าน `sessionStorage`
* **การโหลดแบบแบ่งส่วน (Lazy Loading):** ใช้ `React.lazy` + `<Suspense>` แยก Bundle ของหน้าแอดมินออกจากฝั่งผู้ใช้ เพื่อประสิทธิภาพสูงสุด

| เส้นทาง (Path) | หน้าจอแอดมิน | รายละเอียดการทำงาน |
|---|---|---|
| `/admin/login` | เข้าสู่ระบบผู้ดูแลระบบ | หน้าล็อกอินเฉพาะแอดมิน แยกตัวจากหน้าล็อกอินผู้ใช้ พร้อมภาพพื้นหลังบรรยากาศร้านหนังสือ |
| `/admin` | แดชบอร์ดภาพรวม (Dashboard) | สถิติ 4 ตัวชี้วัด, กราฟแลกเปลี่ยน 6 เดือน (SVG), กิจกรรมล่าสุด, กล่องงานด่วน |
| `/admin/users` | จัดการผู้ใช้งาน (Users) | ตรวจสอบรายชื่อ, ค้นหา/กรอง, ดูประวัติใน Drawer, ระงับ/ปลดระงับ, ปรับแต้มสะสม |
| `/admin/books` | จัดการหนังสือ (Books) | สลับมุมมองตาราง/การ์ด, อนุมัติหนังสือรอตรวจสอบ, ซ่อน/แสดง, ลบหนังสือ |
| `/admin/swaps` | จัดการการแลกเปลี่ยน (Swaps) | ตรวจสอบ Stepper 4 ขั้นตอน, กรองตามขนส่ง, ดูหลักฐานพัสดุและลิงก์ Tracking, จัดการข้อพิพาท |
| `/admin/requests` | จัดการบอร์ดตามหา (Requests) | ตรวจสอบกระทู้ตามหาหนังสือ, ซ่อนหรือลบกระทู้ที่ไม่เหมาะสม |
| `/admin/reports` | ข้อร้องเรียนและรายงาน (Reports) | ตรวจสอบปัญหา, ดูหลักฐานภาพถ่าย, บันทึกโน้ตภายใน, ปุ่มลัดระงับผู้ใช้/ซ่อนหนังสือ |
| `/admin/categories` | จัดการหมวดหมู่ (Categories) | เพิ่ม/แก้ไข/ลบหมวดหมู่หนังสือ (ล็อกไม่ให้ลบหมวดหมู่ที่มีหนังสืออยู่) |

---

## 📂 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
ReRead/
├── backend/
│   ├── alembic/              # ไฟล์ประวัติ Database Migration (รวม 5 versions)
│   ├── app/
│   │   ├── core/             # การตั้งค่าความปลอดภัย, JWT, Config
│   │   ├── crud/             # ตรรกะจัดการฐานข้อมูล (Books, Requests, Users, Orders)
│   │   ├── db/               # การเชื่อมต่อ Database Session
│   │   ├── models/           # SQLAlchemy ORM Models (User, Book, BookRequest, Order)
│   │   ├── routers/          # FastAPI Route Handlers (auth, books, requests, users, orders)
│   │   ├── schemas/          # Pydantic Schemas สำหรับ Validation ข้อมูล
│   │   └── seed_books.py     # สคริปต์ใส่ข้อมูลหนังสือตัวอย่าง
│   ├── tests/                # ชุดการทดสอบ Pytest
│   ├── Dockerfile
│   └── requirements.txt
├── src/                      # โค้ดส่วน Frontend (React 19 + TypeScript + Vite)
│   ├── components/           # UI Components ที่นำกลับมาใช้ซ้ำได้
│   │   ├── admin/            # คอมโพเนนต์เฉพาะแอดมิน (Sidebar, Topbar, StatCard, DataTable, ConfirmDialog ฯลฯ)
│   │   ├── guards/           # AdminRoute สำหรับป้องกันสิทธิ์ผู้ดูแลระบบ
│   │   ├── layout/           # Navbar, Footer, RootLayout ฝั่งผู้ใช้
│   │   ├── BookCard.tsx      # การ์ดหนังสือพร้อม Signature Tag & ป้ายราคา
│   │   └── CheckoutModal.tsx # โมดอลสั่งซื้อหนังสือมือสองพร้อมคำนวณค่าจัดส่ง
│   ├── contexts/             # AuthContext (รองรับ role: user | admin พร้อม sessionStorage)
│   ├── data/                 # ชุดข้อมูล Mock (mockBooks, mockSwaps, mockUsers, mockReports ฯลฯ)
│   ├── pages/                # หน้าเว็บทั้งหมด 21 หน้า
│   │   ├── admin/            # หน้าเว็บแอดมินทั้ง 8 หน้า (Lazy Loaded)
│   │   ├── BrowsePage.tsx    # หน้าค้นหาหนังสือแลกเปลี่ยน
│   │   ├── MarketplacePage.tsx # หน้าตลาดซื้อหนังสือมือสอง
│   │   ├── ChatPage.tsx      # หน้าระบบสนทนาแลกเปลี่ยน
│   │   ├── DashboardPage.tsx # แผงควบคุมติดตามคำสั่งซื้อและการจัดส่ง
│   │   └── ...
│   ├── services/             # API Client (ดักจับและแปล Error ภาษาไทย)
│   └── types/                # TypeScript Interfaces & Types
├── bench/                    # ชุดเครื่องมือทดสอบประสิทธิภาพฐานข้อมูล 1.2M แถว
│   ├── seed_bulk.sql         # สคริปต์สุ่มสร้างข้อมูลจำลองขนาดใหญ่
│   ├── benchmark_runner.py   # ตัววัดผลและสกัดแผนการคิวรี (EXPLAIN BUFFERS)
│   └── README.md             # คู่มือการรัน Benchmark
├── docs/
│   ├── INDEXING_REPORT.md    # รายงานผลการทำ Database Indexing และการปรับปรุงความเร็ว
│   ├── microservices-architecture.svg
│   └── tech-stack-diagram.svg
├── docker-compose.yml        # นิยาม Service: db (PostgreSQL 16) + api (FastAPI)
├── vite.config.ts            # การตั้งค่า Vite (พอร์ต 5176 พร้อม Admin URL Banner)
├── .env.example              # ตัวอย่างการตั้งค่า Environment Variables
├── project_summary.md        # สรุปภาพรวมและรายละเอียดทางเทคนิคของโปรเจกต์
└── README.md
```

---

## 👩‍💻 ผู้พัฒนาโครงการ (Developers)

- **นางสาวอภิสรา คล้ายบุรี** (รหัสนิสิต 67160383)
- **นางสาวเอมิกา อยู่พันธ์** (รหัสนิสิต 67160244)

*สาขาวิทยาการสารสนเทศ คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา*  
*รายวิชา: 89033167 Web Application Development*