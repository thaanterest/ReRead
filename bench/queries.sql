-- ReRead Benchmark Query Suite (SQLAlchemy-compiled queries against reread_bench)

-- 1. GET /books status=Available page 1 & count
-- 1a. Items page 1
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.status = 'Available' ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 1b. Count
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(books.id) AS count_1 
FROM books 
WHERE books.status = 'Available';

-- 2. GET /books deep pagination (page 5000)
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.status = 'Available' ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 99980;

-- 3. GET /books?search=
-- 3a. English Common ('History')
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.title ILIKE '%History%' OR books.author ILIKE '%History%' ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 3b. English Rare ('Echoes of the Solitude')
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.title ILIKE '%Echoes of the Solitude%' OR books.author ILIKE '%Echoes of the Solitude%' ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 3c. Thai (>=3 chars: 'มนุษยชาติ')
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.title ILIKE '%มนุษยชาติ%' OR books.author ILIKE '%มนุษยชาติ%' ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 3d. Short (1-2 chars: 'To')
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.title ILIKE '%To%' OR books.author ILIKE '%To%' ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 4. GET /books?status=Available&search=...
-- 4a. Common ('History')
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.status = 'Available' AND (books.title ILIKE '%History%' OR books.author ILIKE '%History%') ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 4b. Thai ('มนุษยชาติ')
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.status = 'Available' AND (books.title ILIKE '%มนุษยชาติ%' OR books.author ILIKE '%มนุษยชาติ%') ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 5. GET /books no filter
-- 5a. Items
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id ORDER BY books.created_at DESC 
LIMIT 20 OFFSET 0;

-- 5b. Count
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(books.id) AS count_1 
FROM books;

-- 6. GET /books/me (User 1 with 6,000 books)
EXPLAIN (ANALYZE, BUFFERS)
SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
WHERE books.owner_id = '00000000-0000-0000-0000-000000000001' ORDER BY books.created_at DESC;

-- 7. GET /requests
-- 7a. No filter
EXPLAIN (ANALYZE, BUFFERS)
SELECT book_requests.id, book_requests.title, book_requests.author, book_requests.description, book_requests.owner_id, book_requests.created_at, book_requests.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM book_requests LEFT OUTER JOIN users AS users_1 ON users_1.id = book_requests.owner_id ORDER BY book_requests.created_at DESC 
LIMIT 20 OFFSET 0;

-- 7b. Search ('History')
EXPLAIN (ANALYZE, BUFFERS)
SELECT book_requests.id, book_requests.title, book_requests.author, book_requests.description, book_requests.owner_id, book_requests.created_at, book_requests.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM book_requests LEFT OUTER JOIN users AS users_1 ON users_1.id = book_requests.owner_id 
WHERE book_requests.title ILIKE '%History%' OR book_requests.author ILIKE '%History%' ORDER BY book_requests.created_at DESC 
LIMIT 20 OFFSET 0;

-- 7c. Mine (User 1)
EXPLAIN (ANALYZE, BUFFERS)
SELECT book_requests.id, book_requests.title, book_requests.author, book_requests.description, book_requests.owner_id, book_requests.created_at, book_requests.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
FROM book_requests LEFT OUTER JOIN users AS users_1 ON users_1.id = book_requests.owner_id 
WHERE book_requests.owner_id = '00000000-0000-0000-0000-000000000001' ORDER BY book_requests.created_at DESC 
LIMIT 20 OFFSET 0;

-- 8. DELETE user 1 in transaction (FK cascade)
BEGIN;
EXPLAIN (ANALYZE, BUFFERS)
DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';
ROLLBACK;

-- 9. INSERT 200,000 rows in transaction (Insert cost)
BEGIN;
EXPLAIN (ANALYZE, BUFFERS)
INSERT INTO books (id, title, author, cover_url, condition, description, owner_id, tags, status, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'Bench Insert Book ' || i,
    'Bench Author ' || (i % 100),
    'https://example.com/cover.jpg',
    'Good',
    'Insert benchmark test row',
    '00000000-0000-0000-0000-000000000003'::uuid,
    ARRAY['Benchmark'],
    'Available',
    NOW(),
    NOW()
FROM generate_series(1, 200000) AS i;
ROLLBACK;

-- 10. GET /users page 1
EXPLAIN (ANALYZE, BUFFERS)
SELECT users.id, users.username, users.email, users.password_hash, users.display_name, users.avatar_url, users.created_at, users.updated_at 
FROM users 
LIMIT 20 OFFSET 0;
