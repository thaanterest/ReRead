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
- **การจัดเรียงลำดับเวลา (Timeline Sorting):** แสดงรายการหนังสือล่าสุดได้อย่างรวดเร็วด้วย Composite Index

### 2. 📖 ระบบจัดการหนังสือ (Book Listing & Management)
- **ลงรายการหนังสือใหม่ (`/add-book`):** กรอกข้อมูลชื่อเรื่อง ผู้แต่ง สภาพหนังสือ เรื่องย่อ และแท็กหมวดหมู่
- **ชั้นหนังสือของฉัน (`/my-books`):** ตรวจสอบรายการหนังสือทั้งหมดที่ตนเองเป็นเจ้าของ พร้อมสถานะความพร้อมในการแลกเปลี่ยน
- **หน้ารายละเอียดหนังสือ (`/book/:id`):** แสดงข้อมูลหนังสือ รูปเล่ม รายละเอียดสภาพ และข้อมูลผู้ส่งต่อ

### 3. 📢 บอร์ดตามหาหนังสือ (Book Requests Board)
- **ประกาศตามหาหนังสือ (`/requests`):** สำหรับผู้ที่กำลังตามหาหนังสือเล่มที่ต้องการอ่าน สามารถโพสต์ข้อความขอแลกหรือตามหาได้
- **รองรับการค้นหาคำขอ:** ค้นหาคำขอหนังสือที่ผู้อื่นต้องการ และดูรายการคำขอของตนเอง

### 4. 🔐 ระบบสมาชิกและความปลอดภัย (Authentication & Security)
- **JWT Authentication:** ระบบสมัครสมาชิกและเข้าสู่ระบบที่ปลอดภัย ส่ง Token เพื่อยืนยันตัวตน
- **Password Security:** เข้ารหัสผ่านอย่างปลอดภัยด้วย `bcrypt`
- **การจัดการโปรไฟล์ (`/settings`, `/profile`):** ตรวจสอบและแก้ไขข้อมูลส่วนตัว เช่น ชื่อที่แสดง (Display Name)

### 5. ⚡ สถาปัตยกรรมฐานข้อมูลประสิทธิภาพสูง (Database Optimization & Indexing)
- ออกแบบ Index ครอบคลุมทั้ง **Composite B-Tree Indexes** และ **GIN Trigram Indexes** รองรับการสืบค้นบนข้อมูลขนาด **1,000,000+ แถว** ได้ในระดับมิลลิวินาที
- มีชุดทดสอบ Benchmark อัตโนมัติในโฟลเดอร์ [`bench/`](bench/) พร้อมเอกสารวิเคราะห์อย่างละเอียดใน [`docs/INDEXING_REPORT.md`](docs/INDEXING_REPORT.md)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### 🎨 Frontend
- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) (Custom Theme ธีมร้านหนังสืออิสระ)
- **Routing:** [React Router 7](https://reactrouter.com/)
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
│  (Port 5173 via Vite)  │    (JWT Bearer Auth / CORS)  │ (Port 8000 via Uvicorn)│
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

# ดำเนินการ Migrate โครงสร้างฐานข้อมูลล่าสุด
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
| **Frontend Website** | [http://localhost:5173](http://localhost:5173) | หน้าเว็บหลักของ ReRead |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | ฐานข้อมูลและ REST API Endpoints |
| **API Documentation (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | เอกสารคู่มือทดสอบ API แบบ Interactive |
| **Alternative Docs (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | เอกสาร API รูปแบบ ReDoc |

---

## 🗺️ แผนผังหน้าเว็บไซต์ (Site Map & Navigation)

| เส้นทาง (Path) | หน้าเว็บ | การเชื่อมต่อข้อมูล |
|---|---|---|
| `/` | หน้าแรก (Landing Page) | ข้อมูลแนะนำและภาพรวมแพลตฟอร์ม |
| `/browse` | หน้ารวมและค้นหาหนังสือ | เชื่อมต่อ API ค้นหา กรองหมวดหมู่ และแบ่งหน้า |
| `/book/:id` | หน้ารายละเอียดหนังสือ | ดึงข้อมูลหนังสือจริงจากฐานข้อมูลตาม ID |
| `/requests` | บอร์ดตามหาหนังสือ | เชื่อมต่อ API รายการคำขอหนังสือ (`/api/requests`) |
| `/login`, `/signup` | หน้าเข้าสู่ระบบ / สมัครสมาชิก | เชื่อมต่อระบบ Auth รับ JWT Token |
| `/my-books` | รายการหนังสือของฉัน | แสดงหนังสือที่บัญชีปัจจุบันเป็นเจ้าของ |
| `/add-book` | เพิ่มรายการหนังสือใหม่ | ส่งข้อมูลเข้าสู่ระบบผ่าน API |
| `/settings` | ตั้งค่าบัญชีผู้ใช้ | แก้ไขข้อมูลชื่อที่แสดงและรายละเอียดบัญชี |
| `/about` | เกี่ยวกับโครงการ | ข้อมูลและวิสัยทัศน์ของแพลตฟอร์ม ReRead |
| `/dashboard` | แผงควบคุมการแลกเปลี่ยน | ส่วนจำลองสถานะการส่งต่อหนังสือ (Mock) |
| `/chat` | ห้องสนทนาเพื่อการแลกเปลี่ยน | ส่วนจำลองการติดต่อสื่อสารระหว่างผู้ใช้ (Mock) |

---

## 📂 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
ReRead/
├── backend/
│   ├── alembic/              # ไฟล์ประวัติ Database Migration
│   ├── app/
│   │   ├── core/             # การตั้งค่าความปลอดภัย, JWT, Config
│   │   ├── crud/             # ตรรกะจัดการฐานข้อมูล (Query / Create / Update)
│   │   ├── db/               # การเชื่อมต่อ Database Session
│   │   ├── models/           # SQLAlchemy ORM Models (User, Book, BookRequest)
│   │   ├── routers/          # FastAPI Route Handlers (auth, books, requests, users)
│   │   └── schemas/          # Pydantic Schemas สำหรับ Validation ข้อมูล
│   ├── Dockerfile
│   └── requirements.txt
├── src/                      # โค้ดส่วน Frontend (React + Vite)
│   ├── components/           # UI Components ที่นำกลับมาใช้ซ้ำได้
│   ├── contexts/             # Global Contexts (เช่น AuthContext)
│   ├── pages/                # หน้าเว็บต่างๆ ตาม Routing
│   ├── services/             # ฟังก์ชันเชื่อมต่อกับ Backend API (Axios / Fetch)
│   └── types/                # TypeScript Interfaces & Types
├── bench/                    # ชุดเครื่องมือทดสอบประสิทธิภาพฐานข้อมูล 1.2M แถว
│   ├── seed_bulk.sql         # สคริปต์สุ่มสร้างข้อมูลจำลองขนาดใหญ่
│   ├── benchmark_runner.py   # ตัววัดผลและสกัดแผนการคิวรี (EXPLAIN BUFFERS)
│   └── README.md             # คู่มือการรัน Benchmark
├── docs/
│   └── INDEXING_REPORT.md    # รายงานผลการทำ Database Indexing และการปรับปรุงความเร็ว
├── docker-compose.yml        # นิยาม Service: db (PostgreSQL 16) + api (FastAPI)
├── .env.example              # ตัวอย่างการตั้งค่า Environment Variables
└── README.md
```

---

## 👩‍💻 ผู้พัฒนาโครงการ (Developers)

- **นางสาวอภิสรา คล้ายบุรี** (รหัสนิสิต 67160383)
- **นางสาวเอมิกา อยู่พันธ์** (รหัสนิสิต 67160244)

*สาขาวิทยาการสารสนเทศ คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา*  
*รายวิชา: 89033167 Web Application Development*