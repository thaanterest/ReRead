# ReRead Database Benchmark Suite

ชุดสคริปต์สำหรับทดสอบประสิทธิภาพและทำ Benchmark ตาราง `books` (1,000,000 แถว) และ `book_requests` (200,000 แถว) บน PostgreSQL 16 โดยแยกฐานข้อมูลเฉพาะชื่อ `reread_bench` ไม่แตะต้อง `reread_db` (ฐาน dev)

---

## โครงสร้างไฟล์ในโฟลเดอร์ `bench/`

- **`seed_bulk.sql`**: สคริปต์ SQL สร้างข้อมูลจำลองขนาดใหญ่แบบ reproducible (`setseed(0.42)`):
  - Users: 10,000 บัญชี
  - Books: 1,000,000 เล่ม (ชื่อ/ผู้แต่ง ผสมภาษาไทย ~30% และอังกฤษ ~70%, สถานะ Available ~70%, Pending ~20%, Swapped ~10%)
  - Book Requests: 200,000 รายการ
- **`queries.sql`**: รวมคำสั่ง SQL ที่ compile มาจาก SQLAlchemy CRUD จริงในแอปพลิเคชัน พร้อม `EXPLAIN (ANALYZE, BUFFERS)`
- **`benchmark_runner.py`**: สคริปต์ Python (`asyncpg`) ทำหน้าที่:
  - เรียก `pg_stat_reset()` ก่อนรัน
  - บันทึกขนาดตารางและ index ก่อน/หลัง
  - รันแต่ละ Query ซ้ำ 3 ครั้ง และคำนวณค่ามัธยฐาน (Median execution time)
  - สกัดชนิด Scan (Scan Node Types) และ Buffer IO
  - ตรวจสอบ `idx_scan` จาก `pg_stat_user_indexes`
  - บันทึกผลลัพธ์เป็นไฟล์ JSON
- **`run.sh`**: สคริปต์ Bash รัน benchmark จบในคำสั่งเดียว
- **`results_before.json`**: ผลการวัดประสิทธิภาพก่อนทำ Indexing (baseline)
- **`results_after.json`**: ผลการวัดประสิทธิภาพหลังทำ Indexing

---

## วิธีเตรียมฐานข้อมูลทดสอบ (รันครั้งแรก)

```bash
# 1. สร้างฐานข้อมูล reread_bench (รันผ่าน psql ใน db container)
docker compose exec db psql -U reread -d postgres -c "CREATE DATABASE reread_bench;"

# 2. ทำ migration ถึง head บน reread_bench
docker compose exec -e DATABASE_URL="postgresql+asyncpg://reread:reread_secret@db:5432/reread_bench" api alembic upgrade head

# 3. Seed ข้อมูล 1 ล้านแถวเข้า reread_bench
docker compose cp bench/seed_bulk.sql db:/tmp/seed_bulk.sql
docker compose exec db psql -U reread -d reread_bench -f /tmp/seed_bulk.sql
```

---

## วิธีรันวัดผลซ้ำด้วยคำสั่งเดียว (Single-command Reproduction)

### ตัวเลือกที่ 1: ผ่าน Bash (`run.sh`)
```bash
# รัน benchmark และเซฟผลเป็น bench/results_after.json
bash bench/run.sh after
```

### ตัวเลือกที่ 2: ผ่าน PowerShell (Windows Native)
```powershell
docker compose cp bench api:/bench
docker compose exec -T -e DATABASE_URL="postgresql://reread:reread_secret@db:5432/reread_bench" api python /bench/benchmark_runner.py "postgresql://reread:reread_secret@db:5432/reread_bench" "after" "/bench/results_after.json"
docker compose cp "api:/bench/results_after.json" "bench/results_after.json"
```

ผลลัพธ์จะแสดงสรุปเวลาและชนิด scan บนหน้าจอ พร้อมอัปเดตไฟล์ `bench/results_after.json` โดยอัตโนมัติ
