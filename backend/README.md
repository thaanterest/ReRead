# ReRead Backend API

REST API สำหรับเว็บแลกเปลี่ยนและซื้อขายหนังสือมือสอง **ReRead** — สร้างด้วย FastAPI + PostgreSQL 16

> **สถานะระบบปัจจุบัน:**  
> - **Auth & Users:** ใช้งานได้จริงบน PostgreSQL 16 พร้อมระบบเข้ารหัสรหัสผ่าน bcrypt และ JWT Bearer Token
> - **Books:** รองรับระบบค้นหา Full-text & Trigram, คัดกรองตามหมวดหมู่/สภาพ และรองรับฟิลด์สำหรับซื้อขาย (`price`, `listing_type`, `seller_id`)
> - **Book Requests:** บอร์ดตามหาหนังสือ เชื่อมโยงกับผู้ใช้และค้นหาคำขอได้
> - **Orders & Tracking:** ระบบสั่งซื้อหนังสือมือสอง ติดตามสถานะพัสดุ (Pending → Shipped → Completed) พร้อมบันทึกเลข Tracking
> - ดูสรุปภาพรวมทั้งโปรเจกต์ที่ [README หลัก](../README.md)

## Tech Stack

- **FastAPI** — Web framework (Python 3.11)
- **SQLAlchemy 2.0** (async) — ORM ผ่าน `asyncpg`
- **Alembic** — Database migrations (PostgreSQL)
- **PostgreSQL 16** — Database พร้อมส่วนขยาย `pg_trgm` (Docker container)
- **JWT** (`python-jose`) — Authentication & Token management
- **Pydantic v2** — Data validation & serialization
- **Pytest** — Automated testing

## Quick Start

### 1. Copy environment file

```bash
cp .env.example .env
# สำหรับ production ควรเปลี่ยน JWT_SECRET เป็นค่าสุ่มความยาว 32+ ตัวอักษร
```

### 2. Run with Docker Compose

```bash
# จาก root ของ repo (ที่มี docker-compose.yml)
docker compose up --build -d
```

ระบบจะ:
- สร้าง PostgreSQL container (`db`) พอร์ต 5432 พร้อม persistent volume
- สร้าง FastAPI container (`api`) ที่พอร์ต 8000 พร้อมระบบ Hot-reload

### 3. Run database migration

```bash
# รัน migration ไปยัง revision ล่าสุด (รวม orders และ selling fields)
docker compose exec api alembic upgrade head
```

### 4. Open Swagger UI & Docs

เปิดเบราว์เซอร์ไปที่:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health check**: [http://localhost:8000/health](http://localhost:8000/health)

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | สมัครสมาชิก (ตรวจสอบความปลอดภัยรหัสผ่าน) |
| POST | `/api/auth/login` | ❌ | เข้าสู่ระบบ → JWT token |
| POST | `/api/auth/logout` | ✅ | ออกจากระบบ (Stateless token revocation) |
| POST | `/api/auth/change-password` | ✅ | เปลี่ยนรหัสผ่าน |

### User Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/me` | ✅ | ดึงข้อมูลโปรไฟล์ของตนเอง |
| GET | `/api/users` | ❌ | รายชื่อผู้ใช้งาน (Pagination) |
| GET | `/api/users/{id}` | ❌ | ดึงข้อมูลผู้ใช้ตาม ID |
| PUT | `/api/users/{id}` | ✅ | แก้ไขโปรไฟล์ (เฉพาะเจ้าของบัญชี) |
| DELETE | `/api/users/{id}` | ✅ | ลบบัญชี (เฉพาะเจ้าของบัญชี) |
| GET | `/api/users/check-username/{name}` | ❌ | ตรวจสอบว่าชื่อผู้ใช้ว่างหรือไม่ |

### Books

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/books` | ❌ | ดูรายการหนังสือ (Search, Filter, Pagination, Trigram) |
| GET | `/api/books/me` | ✅ | ดูรายการหนังสือที่ฉันเป็นเจ้าของ |
| GET | `/api/books/{id}` | ❌ | ดูรายละเอียดหนังสือเล่มที่ระบุ |
| POST | `/api/books` | ✅ | เพิ่มหนังสือใหม่ (ระบุ แลก/ขาย/ทั้งสองอย่าง พร้อมราคา) |
| PUT | `/api/books/{id}` | ✅ | แก้ไขข้อมูลหนังสือ (เฉพาะเจ้าของ) |
| DELETE | `/api/books/{id}` | ✅ | ลบหนังสือ (เฉพาะเจ้าของ) |

### Book Requests (บอร์ดตามหาหนังสือ)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/requests` | ❌/✅ | ดูบอร์ดตามหาหนังสือ (`mine=true` เพื่อดูเฉพาะของฉัน) |
| POST | `/api/requests` | ✅ | สร้างคำขอตามหาหนังสือเล่มใหม่ |
| DELETE | `/api/requests/{id}` | ✅ | ลบคำขอตามหาหนังสือ (เฉพาะเจ้าของ) |

### Orders & Tracking (การซื้อขายและติดตามพัสดุ)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | ✅ | สั่งซื้อหนังสือมือสอง (คำนวณราคา + บันทึกที่อยู่จัดส่ง) |
| GET | `/api/orders/my-purchases` | ✅ | รายการคำสั่งซื้อที่ฉันสั่งซื้อ (ฝั่งผู้ซื้อ) |
| GET | `/api/orders/my-sales` | ✅ | รายการคำสั่งซื้อที่ฉันเป็นผู้ขาย (ฝั่งผู้ขาย) |
| GET | `/api/orders/{id}` | ✅ | ดูรายละเอียดคำสั่งซื้อ ข้อมูลจัดส่ง และสถานะ |
| PUT | `/api/orders/{id}/shipping` | ✅ | ผู้ขายบันทึกชื่อบริษัทขนส่งและเลขพัสดุ (Tracking No.) |
| PUT | `/api/orders/{id}/confirm-received` | ✅ | ผู้ซื้อกดยืนยันว่าได้รับหนังสือแล้ว (เปลี่ยนสถานะเป็น Completed) |

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration scripts (รวม selling & orders table)
│   └── env.py
├── app/
│   ├── core/             # Config, security (bcrypt/JWT), dependencies
│   ├── crud/             # Database queries & business logic (book, request, user, order)
│   ├── db/               # Engine & async session handling
│   ├── models/           # SQLAlchemy models (User, Book, BookRequest, Order)
│   ├── routers/          # FastAPI routers (auth, users, books, book_requests, orders)
│   ├── schemas/          # Pydantic validation schemas
│   ├── seed_books.py     # ข้อมูลตัวอย่างหนังสือ 48 เล่ม
│   └── main.py           # FastAPI entrypoint & middleware setup
├── tests/                # Pytest suites
├── Dockerfile
├── alembic.ini
└── requirements.txt
```

## Seed ข้อมูลตัวอย่าง

```bash
docker compose exec api python -m app.seed_books
```

## Testing

```bash
# รันชุดการทดสอบใน container
docker compose exec api pytest tests/ -v
```

## แผนการพัฒนาต่อยอด (Future Roadmap)

- **ระบบแชทแบบ Real-time (Chat WebSocket API):** ปัจจุบันฝั่งหน้าเว็บ `/chat` เป็น Interactive UI พร้อมจำลองคู่สนทนาและ Context หนังสือ แผนการพัฒนาถัดไปคือการสร้าง WebSocket Endpoint (`/ws/chat/{conversation_id}`) ร่วมกับตารางข้อความใน PostgreSQL
- **ระบบชำระเงิน (Payment Gateway):** เชื่อมต่อ PromptPay QR Code หรือบัตรเครดิต
- **ระบบแจ้งเตือน (Notifications):** การแจ้งเตือนเมื่อมีผู้สั่งซื้อหรือมีผู้ขอแลกหนังสือ

## Stopping Containers

```bash
docker compose down          # หยุด containers ชั่วคราว
docker compose down -v       # หยุดพร้อมลบ volume ข้อมูลใน Database
```