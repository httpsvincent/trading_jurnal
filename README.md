# Trading Journal API

Aplikasi web sederhana untuk mencatat riwayat trade (pair, arah, lot, entry, exit).
Dibuat untuk UTS COMP6991031 Cloud Services (LA75), BINUS Bandung.

## Alasan Projek
[2-3 kalimat: kamu mencatat trade secara manual dan ingin tool sederhana berbasis container]

## Arsitektur
Browser/curl -> app (FastAPI, port 8000) -> db (PostgreSQL 16.4, volume pgdata)
Semua container berada di network `appnet`. Adminer (port 8080) ada di profile `tools`.

## Cara Menjalankan
git clone https://github.com/httpsvincent/trading_jurnal.git
cd trading_jurnal
cp .env.example .env
docker compose up -d --build

Buka http://localhost:8000/docs. Untuk Adminer: docker compose --profile tools up -d

## Endpoint
- GET /health -> 200
- GET /trades -> 200
- POST /trades -> 201 (422 jika side bukan buy/sell)

## Screenshot
[tempel screenshot docker compose ps, uji endpoint, persistensi]

## Tautan
- Artikel: [link]
- Video: [link]

## Sumber
FastAPI, Uvicorn, psycopg2, image resmi python dan postgres dari Docker Hub.

## AI Usage Declaration
- Alat: Claude (Anthropic)
- Bagian yang dibantu: ide projek, debugging error Git dan Docker
- Contoh prompt: "Bantu aku debugging error ini with no mistakes".

