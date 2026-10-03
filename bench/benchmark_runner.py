#!/usr/bin/env python3
"""
Benchmark runner for ReRead (FastAPI + PostgreSQL 16)
Uses asyncpg to execute EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 3 times per query,
calculates median execution time, extracts scan types, checks index usage stats,
and outputs JSON benchmark results.
"""

import sys
import os
import json
import asyncio
import statistics
import asyncpg

QUERIES = [
    {
        "id": "Q1a_books_available_p1",
        "name": "GET /books status=Available (page 1)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.status = 'Available' ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q1b_books_available_count",
        "name": "GET /books count(*) status=Available",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT count(books.id) AS count_1 
        FROM books 
        WHERE books.status = 'Available';
        """,
        "is_dml": False,
    },
    {
        "id": "Q2_books_deep_page",
        "name": "GET /books status=Available (page 5000, offset 99980)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.status = 'Available' ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 99980;
        """,
        "is_dml": False,
    },
    {
        "id": "Q3a_books_search_en_common",
        "name": "GET /books search='History' (Common EN)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.title ILIKE '%History%' OR books.author ILIKE '%History%' ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q3b_books_search_en_rare",
        "name": "GET /books search='Echoes of the Solitude' (Rare EN)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.title ILIKE '%Echoes of the Solitude%' OR books.author ILIKE '%Echoes of the Solitude%' ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q3c_books_search_thai",
        "name": "GET /books search='มนุษยชาติ' (Thai >=3 chars)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.title ILIKE '%มนุษยชาติ%' OR books.author ILIKE '%มนุษยชาติ%' ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q3d_books_search_short",
        "name": "GET /books search='To' (Short 1-2 chars)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.title ILIKE '%To%' OR books.author ILIKE '%To%' ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q4a_books_status_and_search_en",
        "name": "GET /books status=Available & search='History'",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.status = 'Available' AND (books.title ILIKE '%History%' OR books.author ILIKE '%History%') ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q4b_books_status_and_search_thai",
        "name": "GET /books status=Available & search='มนุษยชาติ'",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.status = 'Available' AND (books.title ILIKE '%มนุษยชาติ%' OR books.author ILIKE '%มนุษยชาติ%') ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q5a_books_no_filter",
        "name": "GET /books no filter (page 1)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id ORDER BY books.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q5b_books_count_no_filter",
        "name": "GET /books count(*) no filter",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT count(books.id) AS count_1 
        FROM books;
        """,
        "is_dml": False,
    },
    {
        "id": "Q6_books_by_owner",
        "name": "GET /books/me (User 1, 6000 books)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT books.id, books.title, books.author, books.cover_url, books.condition, books.description, books.owner_id, books.tags, books.status, books.created_at, books.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM books LEFT OUTER JOIN users AS users_1 ON users_1.id = books.owner_id 
        WHERE books.owner_id = '00000000-0000-0000-0000-000000000001' ORDER BY books.created_at DESC;
        """,
        "is_dml": False,
    },
    {
        "id": "Q7a_requests_no_filter",
        "name": "GET /requests no filter (page 1)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT book_requests.id, book_requests.title, book_requests.author, book_requests.description, book_requests.owner_id, book_requests.created_at, book_requests.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM book_requests LEFT OUTER JOIN users AS users_1 ON users_1.id = book_requests.owner_id ORDER BY book_requests.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q7b_requests_search",
        "name": "GET /requests search='History'",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT book_requests.id, book_requests.title, book_requests.author, book_requests.description, book_requests.owner_id, book_requests.created_at, book_requests.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM book_requests LEFT OUTER JOIN users AS users_1 ON users_1.id = book_requests.owner_id 
        WHERE book_requests.title ILIKE '%History%' OR book_requests.author ILIKE '%History%' ORDER BY book_requests.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q7c_requests_mine",
        "name": "GET /requests mine=true (User 1)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT book_requests.id, book_requests.title, book_requests.author, book_requests.description, book_requests.owner_id, book_requests.created_at, book_requests.updated_at, users_1.id AS id_1, users_1.username, users_1.email, users_1.password_hash, users_1.display_name, users_1.avatar_url, users_1.created_at AS created_at_1, users_1.updated_at AS updated_at_1 
        FROM book_requests LEFT OUTER JOIN users AS users_1 ON users_1.id = book_requests.owner_id 
        WHERE book_requests.owner_id = '00000000-0000-0000-0000-000000000001' ORDER BY book_requests.created_at DESC 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    },
    {
        "id": "Q8_delete_user_cascade",
        "name": "DELETE user 1 (FK cascade in transaction)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';
        """,
        "is_dml": True,
    },
    {
        "id": "Q9_insert_200k_books",
        "name": "INSERT 200,000 books (in transaction)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
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
        """,
        "is_dml": True,
    },
    {
        "id": "Q10_users_p1",
        "name": "GET /users (page 1)",
        "sql": """
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT users.id, users.username, users.email, users.password_hash, users.display_name, users.avatar_url, users.created_at, users.updated_at 
        FROM users 
        LIMIT 20 OFFSET 0;
        """,
        "is_dml": False,
    }
]

def extract_node_types(plan_node):
    types = [plan_node.get("Node Type")]
    if "Index Name" in plan_node:
        types[-1] += f" ({plan_node['Index Name']})"
    for child in plan_node.get("Plans", []):
        types.extend(extract_node_types(child))
    return types

async def run(db_url: str, label: str, output_file: str):
    # Sanitize URL for asyncpg (remove +asyncpg if present)
    clean_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    print(f"Connecting to benchmark DB: {label}...")
    conn = await asyncpg.connect(clean_url)

    try:
        # 1. Reset stats
        await conn.execute("SELECT pg_stat_reset();")
        print("pg_stat_reset() completed.")

        # 2. Measure sizes
        table_rows = await conn.fetch("""
            SELECT 
                c.relname AS table_name,
                pg_relation_size(c.oid) AS table_bytes,
                pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
                pg_indexes_size(c.oid) AS indexes_bytes,
                pg_size_pretty(pg_indexes_size(c.oid)) AS indexes_size,
                pg_total_relation_size(c.oid) AS total_bytes,
                pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relkind = 'r'
            ORDER BY pg_total_relation_size(c.oid) DESC;
        """)

        index_rows_init = await conn.fetch("""
            SELECT 
                schemaname,
                relname AS table_name,
                indexrelname AS index_name,
                pg_relation_size(indexrelid) AS index_bytes,
                pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            ORDER BY relname, indexrelname;
        """)

        results = {
            "label": label,
            "table_sizes": [dict(r) for r in table_rows],
            "index_sizes_initial": [dict(r) for r in index_rows_init],
            "queries": []
        }

        # 3. Run queries
        print("\nExecuting queries (3 iterations each, calculating median)...")
        for q in QUERIES:
            q_id = q["id"]
            q_name = q["name"]
            sql = q["sql"].strip()
            is_dml = q["is_dml"]

            print(f"  Testing {q_id}: {q_name}...", end="", flush=True)
            times = []
            plans = []

            for run_idx in range(3):
                try:
                    if is_dml:
                        tr = conn.transaction()
                        await tr.start()
                        try:
                            val = await conn.fetchval(sql)
                        finally:
                            await tr.rollback()
                    else:
                        val = await conn.fetchval(sql)

                    plan_json = json.loads(val)[0]
                    exec_time = plan_json.get("Execution Time", 0.0)
                    times.append(exec_time)
                    plans.append(plan_json)
                except Exception as e:
                    print(f"\n    Run {run_idx+1} failed: {e}")
                    times.append(-1.0)
                    plans.append({"error": str(e)})

            valid_times = [t for t in times if t >= 0]
            if valid_times:
                med_time = statistics.median(valid_times)
                closest_idx = min(range(len(valid_times)), key=lambda i: abs(valid_times[i] - med_time))
                rep_plan = plans[closest_idx]
                plan_root = rep_plan.get("Plan", {})
                nodes = extract_node_types(plan_root)
                # Deduplicate while preserving order
                seen = set()
                dedup_nodes = [x for x in nodes if not (x in seen or seen.add(x))]
                scan_summary = ", ".join(dedup_nodes[:5])
            else:
                med_time = -1.0
                scan_summary = "FAILED"
                rep_plan = {}

            print(f" -> Median: {med_time:.2f} ms | Scans: {scan_summary}")
            results["queries"].append({
                "id": q_id,
                "name": q_name,
                "runs_ms": times,
                "median_ms": round(med_time, 2),
                "scan_summary": scan_summary,
                "representative_plan": rep_plan
            })

        # 4. Check final index stats
        index_rows_final = await conn.fetch("""
            SELECT 
                schemaname,
                relname AS table_name,
                indexrelname AS index_name,
                pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            ORDER BY relname, indexrelname;
        """)
        results["index_stats_final"] = [dict(r) for r in index_rows_final]

        # Ensure directory exists
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print(f"\nSaved results to {output_file}")
        print("\n--- Index Usage Stats (idx_scan after benchmark) ---")
        for stat in index_rows_final:
            print(f"  {stat['table_name']}.{stat['index_name']}: idx_scan = {stat['idx_scan']}")

    finally:
        await conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python benchmark_runner.py <db_url> <label> <output_json>")
        sys.exit(1)
    asyncio.run(run(sys.argv[1], sys.argv[2], sys.argv[3]))
