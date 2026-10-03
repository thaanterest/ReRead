# รายงานผลการปรับปรุง Database Indexing สำหรับ ReRead Backend
**ระบบ:** FastAPI + PostgreSQL 16  
**สภาพแวดล้อมทดสอบ:** ฐานข้อมูล `reread_bench` (แยกจากฐานข้อมูล dev `reread_db`)  
**ปริมาณข้อมูลทดสอบ:** Users 10,000 บัญชี, Books 1,000,000 เล่ม, Book Requests 200,000 รายการ  
**วันที่ทดสอบ:** 3 ตุลาคม 2026  

---

## 1. บทนำและภาพรวม (Executive Summary)

ระบบ ReRead มีการเติบโตของข้อมูลอย่างรวดเร็ว โดยตารางหลักสองตารางคือ `books` และ `book_requests` ต้องรองรับการค้นหา (Text Search), การกรองตามสถานะ (Status Filtering), การเปิดดูรายการตามลำดับเวลาล่าสุด (Timeline Listing), และการจัดการความสัมพันธ์กับผู้ใช้ (Owner / Cascade Deletion)

จากการตรวจสอบก่อนการทำ Indexing พบว่าตาราง `books` มีเพียง B-Tree Index เดิม 3 ตัว (`ix_books_title`, `ix_books_author`, `ix_books_owner_id`) ซึ่ง**ไม่สามารถช่วยเร่งความเร็วการค้นหาข้อความแบบ `ILIKE '%...%'` ได้เลย** ส่งผลให้การค้นหาทุกคำต้องทำ Full Table Sequential Scan ผ่านข้อมูล 1,000,000 แถว ใช้เวลาเฉลี่ยสูงถึง **250 - 400 มิลลิวินาทีต่อ Query** ขณะที่ตาราง `book_requests` ไม่มี Index ใดๆ เลยนอกจาก Primary Key

การดำเนินงานครั้งนี้ได้ทำการ:
1. ติดตั้งส่วนขยาย **`pg_trgm`** และสร้าง **GIN Trigram Index** สำหรับคอลัมน์ `title` และ `author`
2. สร้าง **Composite Index (B-Tree)** เพื่อรองรับการคัดกรองและการจัดเรียงตามลำดับเวลา `created_at DESC`
3. ลบ B-Tree Index เดิมที่ซ้ำซ้อนและไร้ประสิทธิภาพออก
4. แก้ไขบั๊ก Pydantic Validation Error ใน `BookRequestOwner` schema (`from_attributes=True`)

**ผลลัพธ์หลักที่ได้รับ:**
- การเปิดดูหน้าแรกของ `/books?status=Available` เร็วขึ้น **954 เท่า** (จาก 190.81 ms เหลือเพียง **0.20 ms**)
- การเปิดดูหนังสือโดยไม่กรอง `/books` เร็วขึ้น **1,762 เท่า** (จาก 246.80 ms เหลือเพียง **0.14 ms**)
- การค้นหาหนังสือภาษาอังกฤษคำทั่วไป เร็วขึ้น **684 เท่า** (จาก 342.33 ms เหลือเพียง **0.50 ms**)
- การค้นหาหนังสือภาษาไทย (ความยาว $\ge 3$ ตัวอักษร) เร็วขึ้น **178 เท่า** (จาก 402.58 ms เหลือเพียง **2.25 ms**)
- การลบผู้ใช้ที่มีข้อมูลผูกพัน (Cascade Deletion) เร็วขึ้น **6.5 เท่า** (จาก 17.52 ms เหลือเพียง **2.70 ms**)
- ต้นทุนการเขียนข้อมูล (INSERT 200,000 แถว) เพิ่มขึ้นเพียง **~20%** ซึ่งอยู่ในเกณฑ์ที่คุ้มค่าอย่างยิ่ง

---

## 2. ตารางเปรียบเทียบผลการวัดประสิทธิภาพ (Benchmark Results)

ข้อมูลทุกรายการมาจากการรันจริง 3 ครั้งต่อ Query บนฐานข้อมูล `reread_bench` โดยเก็บค่ามัธยฐาน (Median) และตรวจสอบแผนการทำงานของคิวรีด้วย `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)`:

| ลำดับ | Query / Endpoint | ก่อนทำ Index (ms) | ชนิด Scan ก่อนทำ | หลังทำ Index (ms) | ชนิด Scan หลังทำ | ผลความเร็ว (Speedup) |
|---|---|---|---|---|---|---|
| **Q1a** | `GET /books?status=Available` (หน้า 1, Limit 20) | 190.81 | Gather Merge, Sort, Hash Join, Seq Scan | **0.20** | Nested Loop, Index Scan (`ix_books_status_created_at`) | **เร็วขึ้น 954.0x** |
| **Q1b** | `GET /books` count(*) status=Available | 58.82 | Aggregate, Gather, Seq Scan | **58.29** | Aggregate, Gather, Seq Scan | เท่าเดิม (1.0x) |
| **Q2** | `GET /books` หน้าลึก (Page 5000, Offset 99980) | 314.88 | Limit, Gather Merge, External Sort (Disk), Seq Scan | **282.27** | Limit, Nested Loop, Index Scan (`ix_books_status_created_at`) | **เร็วขึ้น 1.1x** |
| **Q3a** | `GET /books?search=History` (คำอังกฤษพบบ่อย) | 342.33 | Gather Merge, Sort, Hash Join, Seq Scan | **0.50** | Nested Loop, Index Scan (`ix_books_created_at`) + Filter | **เร็วขึ้น 684.7x** |
| **Q3b** | `GET /books?search=Echoes of the Solitude` (คำอังกฤษพบน้อย) | 387.03 | Gather Merge, Sort, Hash Join, Seq Scan | **18.59** | Nested Loop, Index Scan (`ix_books_created_at`) + Filter | **เร็วขึ้น 20.8x** |
| **Q3c** | `GET /books?search=มนุษยชาติ` (คำไทย $\ge 3$ ตัวอักษร) | 402.58 | Gather Merge, Sort, Hash Join, Seq Scan | **2.25** | Nested Loop, Index Scan (`ix_books_created_at`) + Filter | **เร็วขึ้น 178.9x** |
| **Q3d** | `GET /books?search=To` (คำสั้น 1–2 ตัวอักษร) | 327.03 | Gather Merge, Sort, Hash Join, Seq Scan | **0.42** | Nested Loop, Index Scan (`ix_books_created_at`) + Filter | **เร็วขึ้น 778.6x** |
| **Q4a** | `GET /books?status=Available&search=History` | 263.96 | Gather Merge, Sort, Hash Join, Seq Scan | **0.50** | Nested Loop, Index Scan (`ix_books_status_created_at`) | **เร็วขึ้น 527.9x** |
| **Q4b** | `GET /books?status=Available&search=มนุษยชาติ` | 293.78 | Gather Merge, Sort, Hash Join, Seq Scan | **2.01** | Nested Loop, Index Scan (`ix_books_status_created_at`) | **เร็วขึ้น 146.2x** |
| **Q5a** | `GET /books` ไม่กรอง (หน้า 1, Limit 20) | 246.80 | Gather Merge, Sort, Hash Join, Seq Scan | **0.14** | Nested Loop, Index Scan (`ix_books_created_at`) | **เร็วขึ้น 1,762.9x** |
| **Q5b** | `GET /books` count(*) ไม่กรอง | 62.49 | Aggregate, Gather, Index Only Scan (`books_pkey`) | **73.35** | Aggregate, Gather, Index Only Scan (`books_pkey`) | 0.9x |
| **Q6** | `GET /books/me` (เจ้าของมี 6,000 เล่ม) | 5.77 | Bitmap Heap Scan (`ix_books_owner_id`), Sort | **6.27** | Bitmap Heap Scan (`ix_books_owner_id_created_at`), Sort | ใกล้เคียงเดิม (~6 ms) |
| **Q7a** | `GET /requests` ไม่กรอง (หน้า 1, Limit 20) | 58.91 | Gather Merge, Sort, Hash Join, Seq Scan | **0.12** | Nested Loop, Index Scan (`ix_book_requests_created_at`) | **เร็วขึ้น 490.9x** |
| **Q7b** | `GET /requests?search=History` (หน้า 1) | 74.02 | Gather Merge, Sort, Seq Scan | **0.61** | Nested Loop, Index Scan (`ix_book_requests_created_at`) | **เร็วขึ้น 121.3x** |
| **Q7c** | `GET /requests?mine=true` (User 1) | 17.02 | Sort, Gather, Seq Scan | **0.04** | Nested Loop, Index Scan (`ix_book_requests_owner_id_created_at`) | **เร็วขึ้น 425.5x** |
| **Q8** | `DELETE user` (FK Cascade books & requests) | 17.52 | Index Scan (`users_pkey`) | **2.70** | Index Scan (`users_pkey`), Cascade using FK index | **เร็วขึ้น 6.5x** |
| **Q9** | `INSERT 200,000 แถว` (ต้นทุนการเขียน) | 3,290.12 | Subquery Scan, Function Scan | **3,953.51** | Subquery Scan, Function Scan | **เพิ่มขึ้น 20.1%** |
| **Q10** | `GET /users` (หน้า 1, Limit 20) | 0.01 | Limit, Seq Scan | **0.02** | Limit, Seq Scan | เท่าเดิม (<0.1 ms) |

---

## 3. รายละเอียดการวิเคราะห์และพฤติกรรมของ Query Planner

### 3.1 การทำงานของ `BitmapOr` กับ GIN Index
ในคำสั่งค้นหาจริงของ API มีการค้นหาแบบ OR ข้ามฟิลด์ `title` และ `author`:
```sql
WHERE books.title ILIKE '%keyword%' OR books.author ILIKE '%keyword%'
```
เมื่อไม่มีการจำกัด `LIMIT` (เช่นใน Query คำนวณ `SELECT count(books.id)` ที่ทำงานคู่กับทุกการค้นหาแบบแบ่งหน้า):
- **ผลการตรวจ Plan:** PostgreSQL Optimizer สลับมาใช้ `BitmapOr` อย่างสมบูรณ์:
  ```
  ->  Bitmap Heap Scan on books
        Recheck Cond: (title ILIKE '%Solitude%' OR author ILIKE '%Solitude%')
        ->  BitmapOr
              ->  Bitmap Index Scan on ix_books_title_trgm
              ->  Bitmap Index Scan on ix_books_author_trgm
  ```
  ทำให้การนับจำนวนแถวที่ตรงกับคำค้นลดเวลาลงจากเดิมที่ต้อง Seq Scan ทั้ง 1 ล้านแถว (340–400 ms) เหลือเพียง **88–117 ms**

### 3.2 ความสัมพันธ์ระหว่าง B-Tree `created_at DESC` และ GIN ใน Query ที่มี `LIMIT 20`
ในหน้าแรกของผลการค้นหา (`LIMIT 20 OFFSET 0 ORDER BY created_at DESC`) PostgreSQL Planner จะเลือกแผนที่ประหยัดต้นทุนที่สุด:
- หากคำค้นมีข้อมูลตรงกันจำนวนพอสมควรในตาราง Optimizer จะเลือกใช้ `Index Scan using ix_books_created_at` (หรือ `ix_books_status_created_at`) เพื่อดึงข้อมูลที่เรียงตามเวลาอยู่แล้ว แล้วทำการ Filter ข้อความสดทันที ซึ่งใช้เวลาเพียง **0.4 – 2.2 ms** เท่านั้น โดยไม่ต้องเข้าสู่ขั้นตอน Sort เลย
- หากเป็นคำค้นหายาก หรือเป็น Query คำนวณผลรวมนับ `count(*)` Optimizer จะสลับมาใช้ GIN Trigram Index ร่วมกับ `BitmapOr` อัตโนมัติ

---

## 4. รายละเอียด Index: เหตุผล, ขนาดตาราง, และสถิติการใช้งาน

### 4.1 ตารางเปรียบเทียบขนาดตารางและ Index (Table & Index Sizes)

| ตาราง / Index | ขนาดก่อนทำ | ขนาดหลังทำ | หมายเหตุ |
|---|---|---|---|
| **ตาราง `books`** | 353 MB | 484 MB | รวม dead tuples ชั่วคราวจากการทดสอบ DML |
| `books_pkey` | 37 MB | 66 MB | Primary Key บน `id` (UUID) |
| `ix_books_title` | 10 MB | **ถูกลบออก** | B-Tree เดิม ไม่รองรับ `ILIKE '%...%'` (idx_scan = 0) |
| `ix_books_author` | 6.5 MB | **ถูกลบออก** | B-Tree เดิม ไม่รองรับ `ILIKE '%...%'` (idx_scan = 0) |
| `ix_books_owner_id` | 8.2 MB | **ถูกแทนที่** | ถูกแทนที่ด้วย composite index ที่มี `created_at` |
| `ix_books_status_created_at` *(สร้างใหม่)* | - | **40 MB** | รองรับการกรองสถานะ พร้อมเรียงเวลา |
| `ix_books_owner_id_created_at` *(สร้างใหม่)* | - | **43 MB** | รองรับ `/books/me` และ FK CASCADE |
| `ix_books_created_at` *(สร้างใหม่)* | - | **25 MB** | รองรับ `/books` ไม่กรอง และ Fast Timeline Search |
| `ix_books_title_trgm` *(สร้างใหม่)* | - | **79 MB** | GIN Trigram สำหรับค้นหาชื่อหนังสือ |
| `ix_books_author_trgm` *(สร้างใหม่)* | - | **45 MB** | GIN Trigram สำหรับค้นหาชื่อผู้แต่ง |
| **รวม Index ทั้งหมดของ books** | **61 MB** | **298 MB** | เพิ่มขึ้น ~237 MB เพื่อแลกกับความเร็ว 170x - 1,760x |
| **ตาราง `book_requests`** | 43 MB | 43 MB | 200,000 แถว |
| `book_requests_pkey` | 8.3 MB | 8.3 MB | Primary Key บน `id` |
| `ix_book_requests_created_at` *(สร้างใหม่)* | - | **4.4 MB** | รองรับการเรียกดูคำขอล่าสุด |
| `ix_book_requests_owner_id_created_at` *(สร้างใหม่)*| - | **8.0 MB** | รองรับ `/requests?mine=true` และ CASCADE |
| `ix_book_requests_title_trgm` *(สร้างใหม่)* | - | **11 MB** | GIN Trigram ค้นหาคำขอตามชื่อ |
| `ix_book_requests_author_trgm` *(สร้างใหม่)* | - | **6.1 MB** | GIN Trigram ค้นหาคำขอตามผู้แต่ง |
| **รวม Index ทั้งหมดของ book_requests** | **8.3 MB** | **37.8 MB** | เพิ่มขึ้น ~29.5 MB |

### 4.2 สถิติการใช้งาน Index (`pg_stat_user_indexes`) และการลบ Index เดิม
ก่อนการทำ Indexing เราได้รัน `pg_stat_reset()` และทดสอบ Query Suite ทั้งหมด พบว่า:
- `ix_books_title` มี `idx_scan = 0`
- `ix_books_author` มี `idx_scan = 0`
ยืนยันอย่างชัดเจนว่า B-Tree Index เดิมของทั้ง 2 คอลัมน์ไม่ได้ถูกใช้งานเลยเนื่องจากคำค้นในแอปพลิเคชันเป็น `%term%` (Leading Wildcard) จึงได้ดำเนินการลบออกตามเงื่อนไขที่กำหนด

หลังการทำ Indexing สถิติ `idx_scan` ยืนยันการใช้งานจริง:
- `ix_books_status_created_at`: ถูกใช้ในทุก Query ที่ระบุ `status=Available`
- `ix_books_owner_id_created_at`: ถูกใช้ใน `/books/me` และช่วยลดเวลา Foreign Key Cascade
- `ix_books_created_at`: ถูกใช้ใน `/books` ไม่กรอง และการ Search ในหน้าแรก
- `ix_books_title_trgm` และ `ix_books_author_trgm`: ถูกใช้ผ่าน `BitmapOr` เมื่อทำ `count(*)` การค้นหา
- `ix_book_requests_created_at` และ `ix_book_requests_owner_id_created_at`: ถูกใช้งานครอบคลุมทั้งหน้าทั่วไปและ `mine=true`

---

## 5. ผลการทดสอบค้นหาภาษาไทยกับ `pg_trgm`

### 5.1 การตั้งค่า Locale ของฐานข้อมูล
จากการตรวจสอบพารามิเตอร์ฐานข้อมูลจริง:
```sql
SELECT datname, datcollate, datctype FROM pg_database WHERE datname = 'reread_bench';
```
- `datcollate`: **`en_US.utf8`**
- `datctype`: **`en_US.utf8`**

### 5.2 พฤติกรรมและผลการทดสอบจริง
1. **การสร้าง Trigram บนข้อความภาษาไทย:**  
   คำสั่ง `SELECT show_trgm('มนุษยชาติ');` สามารถสร้าง Trigram รหัส Hex ได้ปกติบนฐานข้อมูล UTF-8
2. **ความเร็วที่วัดได้:**  
   Query ค้นหาคำภาษาไทยความยาวตั้งแต่ 3 ตัวอักษรขึ้นไป เช่น `'มนุษยชาติ'` ทำเวลาได้ **2.25 ms** (จากเดิม 402.58 ms เร็วขึ้น **178.9 เท่า**) และ Query นับจำนวน `count(*)` ใช้เวลา **88.8 ms** ผ่าน GIN Index
3. **ข้อจำกัดทางสัณฐานวิทยาของภาษาไทย (Thai Linguistic Challenges):**
   - **ไม่มีช่องว่างคั่นคำ (No Word Boundary):** ภาษาไทยเขียนติดกันเป็นประโยค เช่น "ประวัติย่อของมนุษยชาติ" ทำให้ Trigram แตกคำข้ามรอยต่อของคำที่ไม่ควรเป็นคำเดียวกัน
   - **สระและวรรณยุกต์ซ้อน (Combining Diacritics):** ตัวอักษรอย่าง สระอุ, สระอิ, ไม้เอก นับเป็น 1 Code Point ใน UTF-8 เมื่อถูกแบ่งเป็น Trigram ละ 3 ตัวอักษร อาจทำให้พยัญชนะกับสระถูกตัดทอนแยกจากกัน
   - **คำค้น 1–2 ตัวอักษร (เช่น "ใจ", "ฟ้า", "หมอ"):** ไม่สามารถสร้าง Trigram ได้เลย (Trigram ต้องการอักขระอย่างน้อย 3 ตัว)

---

## 6. ข้อจำกัดทางเทคนิคที่ยังคงมีอยู่ (Remaining Limitations)

1. **การคำนวณ `count(*)`:**  
   แม้จะมี Index ครบถ้วน แต่คำสั่ง `SELECT count(books.id) WHERE status = 'Available'` ยังคงต้องใช้เวลาประมาณ **58 ms** เนื่องจากสถาปัตยกรรม MVCC ของ PostgreSQL บังคับให้ต้องตรวจสอบ Visibility ของทุก tuple
2. **การเปิดหน้าลึกด้วย `OFFSET` (Deep Pagination):**  
   ใน Query `Q2` (หน้า 5000, `OFFSET 99980`) เวลาที่ใช้ลดลงเล็กน้อยเป็น **282.27 ms** เนื่องจาก B-Tree แม้จะช่วยเรื่อง Sort แต่ Engine ยังคงต้องเดินอ่าน Tuple ใน Index ข้ามไปเป็นจำนวน 100,000 แถว
3. **คำค้นหาที่มีความยาว 1–2 ตัวอักษร:**  
   เมื่อค้นหาด้วยคำสั้น เช่น `'To'` หรือ `'ใจ'` หากเป็นคำสั่ง `count(*)` หรือคำสั่งที่ไม่มี `LIMIT` ตัว `pg_trgm` จะไม่สามารถสร้าง Trigram ออกมาจับคู่กับ Index ได้ ส่งผลให้ PostgreSQL ต้อง Fallback กลับไปทำ **Parallel Seq Scan** บนตารางจริง

---

## 7. ข้อเสนอแนะเชิงสถาปัตยกรรมในอนาคต (ไม่ได้ลงมือทำในงานนี้)

ข้อเสนอแนะเหล่านี้เป็นแนวทางปรับปรุงในระดับ Application / System Architecture ซึ่งไม่ได้ดำเนินการแก้ไขโค้ดตามกฎ allowlist ของโปรเจกต์:

1. **เปลี่ยนจากการแบ่งหน้าแบบ OFFSET มาใช้ Keyset / Cursor-based Pagination:**  
   แทนที่จะใช้ `OFFSET 99980` ให้ใช้เงื่อนไข `WHERE created_at < :last_seen_created_at ORDER BY created_at DESC LIMIT 20` ซึ่งจะทำให้หน้า 5,000 ทำงานได้เร็วเทียบเท่าหน้าแรก (< 1 ms)
2. **เลิกคำนวณ `count(*)` ทุกครั้งที่มี Request:**  
   ใช้เทคนิค Estimate Row Count ผ่าน `pg_class.reltuples` หรือทำ Caching ตารางสรุปจำนวน เช่น Redis หรือ Materialized View สำหรับตัวเลข `total` ใน pagination
3. **กำหนด Minimum Search Length ใน API Schema:**  
   เพิ่ม validation ใน FastAPI (`Query(..., min_length=3)`) สำหรับพารามิเตอร์ `search` เพื่อป้องกันไม่ให้ผู้ใช้ส่งคำค้น 1–2 ตัวอักษรที่ทำให้ฐานข้อมูลต้องรัน Full Table Scan
4. **นำระบบ Full-Text Search เฉพาะทางสำหรับภาษาไทยมาใช้:**  
   ในระยะยาวสำหรับคำค้นภาษาไทย แนะนำพิจารณาใช้เครื่องมือค้นหาที่มี Dictionary-based Word Segmentation เช่น **Meilisearch**, **Elasticsearch** หรือ PostgreSQL Extension เช่น **`pg_jieba`** หรือโมดูลตัดคำ ICU ภาษาไทย

---

## 8. การแก้ไขบั๊กในระบบและข้อตรวจรับ

1. **การแก้ไข Pydantic Schema บั๊ก 500 (`backend/app/schemas/book_request.py`):**
   - ได้เพิ่ม `from_attributes=True` ใน `model_config` ของคลาส `BookRequestOwner` พร้อมคง `populate_by_name=True` ไว้อย่างถูกต้อง
   - ทดสอบเรียก API บน `reread_bench` ทั้ง `GET /api/requests` (HTTP 200) และ `POST /api/requests` (HTTP 201) ตอบกลับสมบูรณ์โดยไม่มี Error 500
   - **รายงานรูปแบบ JSON ของ Owner:** ผลการ Serialize ออกมาใน JSON มี Key เป็น **`"display_name"`** (ตรงตาม alias ของโมเดล)
2. **การตรวจสอบ Migration Drift:**
   - คำสั่ง `alembic check` รายงาน `No new upgrade operations detected.` แสดงว่า Models และ Database Migration ตรงกัน 100%
3. **การทดสอบความสมบูรณ์ของ Migration:**
   - ทดสอบคำสั่ง `upgrade head` $\rightarrow$ `downgrade -1` $\rightarrow$ `upgrade head` บน `reread_bench` ผ่านราบรื่นทั้งหมด
4. **ความปลอดภัยของฐานข้อมูล Development (`reread_db`):**
   - ยืนยันว่าฐานข้อมูล `reread_db` ไม่ถูกแก้ไข ดัดแปลง หรือ seed ข้อมูลใดๆ ทั้งสิ้น ข้อมูลคงเดิมครบถ้วน 100%

---

## 9. คำแนะนำสำหรับผู้ดูแลระบบในการนำขึ้นฐานข้อมูล Production / Development

เมื่อผู้ดูแลระบบตรวจสอบรายงานและโค้ดเรียบร้อยแล้ว สามารถนำการเปลี่ยนแปลง Migration ขึ้นฐานข้อมูลหลัก `reread_db` ได้ด้วยคำสั่งเดียว:

```bash
docker compose exec api alembic upgrade head
```
*(คำสั่งข้างต้นจะทำการสร้าง extension `pg_trgm`, สร้าง index ชุดใหม่ทั้ง 9 ตัว และลบ index เดิมที่ไม่ใช้งานออกโดยอัตโนมัติ)*
