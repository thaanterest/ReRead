-- Seed bulk data for ReRead benchmark (10,000 users, 1,000,000 books, 200,000 requests)
-- Set reproducible seed
SELECT setseed(0.42);

BEGIN;

-- Truncate existing data in benchmark database
TRUNCATE TABLE book_requests, books, users CASCADE;

-- 1. Insert 10,000 Users
-- Deterministic UUIDs: 00000000-0000-0000-0000-000000000001 to 00000000-0000-0000-0000-000000002710
INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, created_at, updated_at)
SELECT
    ('00000000-0000-0000-0000-' || LPAD(to_hex(i), 12, '0'))::uuid AS id,
    'user_' || i AS username,
    'user_' || i || '@bench.reread.com' AS email,
    '$2b$12$dummyhashforbenchmarkpurposesonlycannotloginXXXXXXXXXXXXXX' AS password_hash,
    CASE 
        WHEN i % 3 = 0 THEN (ARRAY['วรรณา ก.', 'ภูมิ ส.', 'มินต์', 'ดาว ร.', 'นานา ท.', 'สมชาย ม.', 'วีรพร น.', 'กัญญา ว.', 'ศิริพร ภ.', 'ปรีชา ช.'])[(i % 10) + 1] || ' (User ' || i || ')'
        ELSE (ARRAY['Alice Smith', 'Bob Jones', 'Charlie Brown', 'David Miller', 'Emma Watson', 'Frank White', 'Grace Hopper', 'Henry Ford', 'Ivy Chen', 'Jack Ryan'])[(i % 10) + 1] || ' ' || i
    END AS display_name,
    CASE WHEN i % 2 = 0 THEN 'https://images.unsplash.com/avatar-' || (i % 50) || '.jpg' ELSE NULL END AS avatar_url,
    NOW() - ((random() * 730)::text || ' days')::interval AS created_at,
    NOW() AS updated_at
FROM generate_series(1, 10000) AS i;

COMMIT;

-- 2. Insert 1,000,000 Books
-- First 6,000 books go to User 1 (00000000-0000-0000-0000-000000000001) to test heavy /books/me
-- Next 5,500 books go to User 2 (00000000-0000-0000-0000-000000000002)
-- Remaining 988,500 books distributed among users 3..10000
BEGIN;

INSERT INTO books (id, title, author, cover_url, condition, description, owner_id, tags, status, created_at, updated_at)
SELECT
    gen_random_uuid() AS id,
    -- Title: ~30% Thai, ~70% English
    CASE 
        WHEN is_thai THEN
            (ARRAY[
                'ประวัติย่อของ', 'คิดเป็น อยู่เป็น', 'ฟ้าใส', 'โลกของ', 'เดอะซีเคร็ต', 'ไส้เดือนตาบอดใน', 
                'เกิดเป็น', 'บันทึกของ', 'วิถีแห่ง', 'พลังแห่ง', 'ศิลปะการ', 'ความสุขของ', 'เรื่องเล่าจาก', 'เงาแห่ง'
            ])[1 + floor(random() * 14)] || ' ' ||
            (ARRAY[
                'มนุษยชาติ', 'กาลเวลา', 'เขาวงกต', 'ความรัก', 'ดวงดาว', 'จิตใต้สำนึก', 'ปัญญา', 
                'จักรวาล', 'หัวใจ', 'ความเงียบ', 'สายลม', 'บทกวี', 'นักเดินทาง', 'ความหวัง'
            ])[1 + floor(random() * 14)] || ' เล่ม ' || (1 + (i % 20))
        ELSE
            (ARRAY[
                'The Secret', 'Norwegian', 'The Great', 'To Kill a', 'Brave New', 'Thinking Fast and', 
                'The Little', 'Kafka on the', 'The Catcher in the', 'The Power of', 'A Brief History of', 
                'One Hundred Years of', 'The Art of', 'The Midnight', 'Rich Dad Poor', 'The Name of the', 
                'The Kite', 'The Subtle Art of', 'Beyond the', 'Echoes of the'
            ])[1 + floor(random() * 20)] || ' ' ||
            (ARRAY[
                'History', 'Wood', 'Gatsby', 'Mockingbird', 'World', 'Slow', 'Prince', 'Shore', 'Rye', 
                'Now', 'Time', 'Solitude', 'War', 'Library', 'Dad', 'Wind', 'Runner', 'Mind', 'Empire', 'Silence'
            ])[1 + floor(random() * 20)] || ' Vol. ' || (1 + (i % 50))
    END AS title,
    -- Author
    CASE
        WHEN is_thai THEN
            (ARRAY[
                'ว.วชิรเมธี', 'ชลนิล', 'วีรพร นิติประภา', 'คำสิงห์ ศรีนอก', 'หมอผจญภัย', 
                'จิติเรนทร์', 'นิธิ เอียวศรีวงศ์', 'เสกสรรค์ ประเสริฐกุล', 'วินทร์ เลียววาริณ', 'อนุสรณ์ ติปยานนท์'
            ])[1 + floor(random() * 10)]
        ELSE
            (ARRAY[
                'Haruki Murakami', 'George Orwell', 'Donna Tartt', 'Jane Austen', 'Frank Herbert', 
                'Daniel Kahneman', 'J.K. Rowling', 'Stephen Hawking', 'Ray Bradbury', 'Yuval Noah Harari', 
                'Robert Kiyosaki', 'Matt Haig', 'Mary Shelley', 'Cormac McCarthy', 'Mark Manson'
            ])[1 + floor(random() * 15)]
    END AS author,
    'https://images.unsplash.com/book-cover-' || (1 + (i % 200)) || '.jpg' AS cover_url,
    (ARRAY['New', 'Like New', 'Good', 'Fair', 'Poor'])[1 + floor(random() * 5)] AS condition,
    'Detailed description and summary for book #' || i || '. Ideal for reading, learning and book exchange.' AS description,
    -- Owner distribution
    CASE
        WHEN i <= 6000 THEN ('00000000-0000-0000-0000-000000000001')::uuid
        WHEN i <= 11500 THEN ('00000000-0000-0000-0000-000000000002')::uuid
        ELSE ('00000000-0000-0000-0000-' || LPAD(to_hex(3 + floor(random() * 9998)::int), 12, '0'))::uuid
    END AS owner_id,
    ARRAY['Fiction', 'Classic', 'Literature'] AS tags,
    -- Status distribution: Available ~70%, Pending ~20%, Swapped ~10%
    CASE 
        WHEN status_rand < 0.70 THEN 'Available'
        WHEN status_rand < 0.90 THEN 'Pending'
        ELSE 'Swapped'
    END AS status,
    -- Distributed over 2 years (730 days)
    NOW() - ((random() * 730)::text || ' days')::interval - ((random() * 86400)::text || ' seconds')::interval AS created_at,
    NOW() AS updated_at
FROM (
    SELECT 
        i,
        (random() < 0.30) AS is_thai,
        random() AS status_rand
    FROM generate_series(1, 1000000) AS i
) s;

COMMIT;

-- 3. Insert 200,000 Book Requests
-- User 1 has 250 requests for testing /requests?mine=true
BEGIN;

INSERT INTO book_requests (id, title, author, description, owner_id, created_at, updated_at)
SELECT
    gen_random_uuid() AS id,
    -- Title: ~30% Thai, ~70% English
    CASE 
        WHEN is_thai THEN
            (ARRAY[
                'ต้องการหนังสือ', 'ตามหา', 'อยากอ่าน', 'ขอแลก', 'รับแลกหนังสือ'
            ])[1 + floor(random() * 5)] || ' ' ||
            (ARRAY[
                'ประวัติย่อของมนุษยชาติ', 'คิดเป็น อยู่เป็น เย็นเป็นสุข', 'ฟ้าใสใจชื่น', 'โลกของโซฟี', 
                'เดอะซีเคร็ต', 'ไส้เดือนตาบอดในเขาวงกต', 'เกิดเป็นหมอ', 'กาลเวลาและความทรงจำ'
            ])[1 + floor(random() * 8)]
        ELSE
            (ARRAY[
                'Looking for', 'Seeking copy of', 'Want to read', 'Requesting', 'In search of'
            ])[1 + floor(random() * 5)] || ' ' ||
            (ARRAY[
                'The Secret History', 'Norwegian Wood', 'Dune', 'Pride and Prejudice', '1984', 
                'Atomic Habits', 'The Great Gatsby', 'Thinking Fast and Slow', 'Brave New World', 'The Hobbit'
            ])[1 + floor(random() * 10)]
    END AS title,
    -- Author
    CASE
        WHEN is_thai THEN
            (ARRAY[
                'ว.วชิรเมธี', 'ชลนิล', 'วีรพร นิติประภา', 'คำสิงห์ ศรีนอก', 'หมอผจญภัย', 'นิธิ เอียวศรีวงศ์'
            ])[1 + floor(random() * 6)]
        ELSE
            (ARRAY[
                'Haruki Murakami', 'George Orwell', 'Donna Tartt', 'Jane Austen', 'Frank Herbert', 
                'Daniel Kahneman', 'J.K. Rowling', 'Stephen Hawking', 'Ray Bradbury', 'Yuval Noah Harari'
            ])[1 + floor(random() * 10)]
    END AS author,
    'Looking for a good condition copy to exchange or read. Please offer!' AS description,
    -- Owner distribution
    CASE
        WHEN i <= 250 THEN ('00000000-0000-0000-0000-000000000001')::uuid
        ELSE ('00000000-0000-0000-0000-' || LPAD(to_hex(1 + floor(random() * 10000)::int), 12, '0'))::uuid
    END AS owner_id,
    NOW() - ((random() * 730)::text || ' days')::interval - ((random() * 86400)::text || ' seconds')::interval AS created_at,
    NOW() AS updated_at
FROM (
    SELECT 
        i,
        (random() < 0.30) AS is_thai
    FROM generate_series(1, 200000) AS i
) s;

COMMIT;

-- Analyze all tables so planner statistics are completely up-to-date
ANALYZE users;
ANALYZE books;
ANALYZE book_requests;
