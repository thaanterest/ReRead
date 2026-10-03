#!/usr/bin/env bash
set -e

LABEL="${1:-before}"
OUTPUT_NAME="results_${LABEL}.json"

if [ -f "/.dockerenv" ] || [ -d "/app/app" ]; then
    # Running inside api container
    DB_URL="${DATABASE_URL:-postgresql://reread:reread_secret@db:5432/reread_bench}"
    python /bench/benchmark_runner.py "${DB_URL}" "${LABEL}" "/bench/${OUTPUT_NAME}"
else
    # Running from host
    echo "Syncing bench/ to api container..."
    docker compose cp bench api:/bench
    echo "Executing benchmark in api container (${LABEL})..."
    docker compose exec -T -e DATABASE_URL="postgresql://reread:reread_secret@db:5432/reread_bench" api python /bench/benchmark_runner.py "postgresql://reread:reread_secret@db:5432/reread_bench" "${LABEL}" "/bench/${OUTPUT_NAME}"
    echo "Copying results back to host..."
    docker compose cp "api:/bench/${OUTPUT_NAME}" "bench/${OUTPUT_NAME}"
    echo "Done! Results saved to bench/${OUTPUT_NAME}"
fi
