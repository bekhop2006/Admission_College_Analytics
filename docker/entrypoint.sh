#!/bin/sh
set -eu

DATA_DIR="/app/data"
DB_PATH="${DATABASE_PATH:-/data/rnmc.db}"

NCT_URL="${NCT_URL:-https://testcenter.kz/wp-content/uploads/2025/01/1-%D0%9C%D0%B8%D0%BD%D0%B8%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%B1%D0%B0%D0%BB%D0%BB%D1%8B-%D0%95%D0%9D%D0%A2-%D0%BD%D0%B0-%D0%9A%D0%BE%D0%BD%D0%BA%D1%83%D1%80%D1%81-2024-16.07.2024-1.xlsx}"
GOP_URL="${GOP_URL:-https://testcenter.kz/wp-content/uploads/2025/01/2-%D0%A1%D0%BE%D0%BE%D1%82%D0%B2%D0%B5%D1%82%D1%81%D1%82%D0%B2%D0%B8%D0%B5-%D0%BA%D0%BE%D0%BC%D0%B1%D0%B8%D0%BD%D0%B0%D1%86%D0%B8%D0%B9-%D0%BF%D1%80%D0%BE%D1%84%D0%B8%D0%BB%D1%8C%D0%BD%D1%8B%D1%85-%D0%BF%D1%80%D0%B5%D0%B4%D0%BC%D0%B5%D1%82%D0%BE%D0%B2-2024-%D1%80%D1%83%D1%81.xlsx}"

mkdir -p "$(dirname "$DB_PATH")"

# Return 0 when the file looks like a real xlsx (zip) archive.
is_xlsx() {
  file_path="$1"
  [ -f "$file_path" ] && [ "$(head -c 2 "$file_path" | od -An -tx1 | tr -d ' ')" = "504b" ]
}

# Download official NCT Excel files when missing or corrupted.
download_if_missing() {
  url="$1"
  target="$2"

  if is_xlsx "$target"; then
    echo "OK: $(basename "$target")"
    return 0
  fi

  if [ -f "$target" ]; then
    echo "Replacing invalid file: $(basename "$target")"
    rm -f "$target"
  fi

  echo "Downloading $(basename "$target")..."
  curl -fsSL "$url" -o "$target"

  if ! is_xlsx "$target"; then
    echo "ERROR: $(basename "$target") is not a valid xlsx (check NCT_URL / GOP_URL)" >&2
    exit 1
  fi

  echo "Downloaded $(basename "$target")"
}

download_if_missing "$NCT_URL" "$DATA_DIR/nct-thresholds.xlsx"
download_if_missing "$GOP_URL" "$DATA_DIR/gop-subjects.xlsx"

if [ ! -f "$DB_PATH" ]; then
  echo "Database not found — importing NCT data (may take 2-5 minutes)..."
  DATABASE_PATH="$DB_PATH" node dist/scripts/import-nct.js
  echo "Import finished."
else
  echo "Using existing database at $DB_PATH"
fi

export DATABASE_PATH="$DB_PATH"
exec "$@"
