# Trading Journal API

Aplikasi web sederhana untuk mencatat riwayat trade (pair, arah, lot, entry, exit).
Dibuat untuk UTS COMP6991031 Cloud Services (LA75), BINUS Bandung.

## Alasan Projek
## Alasan Projek

Saya sendiri trading gold (XAUUSD) dengan lot kecil di MetaTrader. Selama ini
analisis dan hasil trade saya tersebar di catatan dan tangkapan layar, sehingga
sulit ditinjau ulang: saya tidak tahu pasti berapa win rate saya atau apakah
poin saya naik atau turun dari waktu ke waktu. Masalah itu yang ingin saya
selesaikan dengan Trading Journal API, sebuah aplikasi sederhana untuk mencatat
pair, arah, lot, harga entry dan exit, lalu menampilkan riwayat, win rate, total
poin, dan grafik kurva poin kumulatif.

Selain karena kebutuhan pribadi, projek ini dipilih untuk berlatih fondasi
cloud-native yang dinilai di mata kuliah Cloud Services: membangun aplikasi
multi-tier (frontend, backend FastAPI, dan database PostgreSQL) yang berjalan
identik di mesin mana pun dengan Docker dan Docker Compose. Ini sejalan dengan
karier yang saya tuju sebagai Backend Engineer atau Cloud/DevOps Engineer.

Aplikasi sengaja dibuat sederhana supaya fokus tetap pada containerization:
multi-stage build, healthcheck dengan `depends_on: service_healthy`, named volume
untuk persistensi data, konfigurasi lewat `.env`, dan profile Compose.
Data yang disimpan hanya data dummy trade (pair, lot, harga) tanpa data pribadi.

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


## Tautan
- Artikel: [link]
- Video: [link]

## Sumber
FastAPI, Uvicorn, psycopg2, image resmi python dan postgres dari Docker Hub.

## AI Usage Declaration
- Alat: Claude (Anthropic)
- Bagian yang dibantu: ide projek, debugging error Git dan Docker
- Contoh prompt: "Bantu aku debugging error ini with no mistakes".

