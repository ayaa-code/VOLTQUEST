# Challenge dan layanan AI

Challenge aktif adalah satu LKPD A–D. Data lama `challenges` dan `challengeDrafts` tidak dihapus atau digunakan untuk menyelesaikan LKPD baru. Hasil sumatif lama tetap dapat dibuka. Progres aktif terdiri dari 14 unit.

Isian mentah disimpan per profil dalam `voltquest.dynamic-electricity.v1`, dengan properti opsional `worksheet`. Identitas snapshot menggunakan serialisasi kanonis semua field, bukan hash keamanan. Riwayat revisi dan feedback dibatasi masing-masing lima versi. Penyimpanan gagal tidak memperbarui progres. Perhitungan lokal tidak membuktikan siswa menjalankan percobaan atau bahwa analisisnya benar.

## Mengaktifkan AI di Vercel

Saat ini AI dinonaktifkan. Isi variabel server pada `.env.example` di proyek `voltquest`, workspace `ayaas-projects-028704c4`. Jangan memakai prefix `VITE_`. Pilih model OpenAI yang mendukung Responses API dan structured outputs. Konfigurasikan Turnstile dengan hostname domain produksi, Upstash Redis, salt acak, batas permintaan per IP/jam, permintaan global/hari, dan reservasi token global/hari. Aktifkan `VOLTQUEST_AI_ENABLED=true` hanya setelah semua layanan dan batas biaya ditinjau. Tidak ada akun layanan atau pembelian kredit yang dibuat otomatis.

Endpoint `/api/ai` mengembalikan status konfigurasi melalui GET; POST memvalidasi skema, origin, persetujuan, token Turnstile (hostname/action), dan kuota Redis atomik sebelum memanggil SDK OpenAI. Gagalnya Redis/verifikasi menutup akses AI. Kuota mereservasi batas atas konservatif token input + output sebelum panggilan; permintaan gagal tetap memakai kuota. Tetapkan juga batas pengeluaran pada akun penyedia: batas token bukan tarif rupiah. Penghitung IP memakai hash bersalt dan header proxy Vercel, bukan profileId lokal. CORS bukan autentikasi; akun lokal tetap bukan identitas server.

Model hanya menerima materi, pertanyaan/riwayat terbatas, dan LKPD yang dipilih. Bank soal dan kunci tidak diimpor backend. Model tidak diberi alat untuk mengubah progres. Output divalidasi dan dirender sebagai teks. Angka koreksi AI dalam review ditolak; hitungan resmi berasal dari kode. Chat tetap bersifat pendamping dan dapat keliru. Permintaan memakai `store:false`; ini bukan janji tanpa retensi penyedia.

## Validasi

`npm run build`, `npm run lint`, `node --experimental-strip-types --test server/ai.test.ts`, dan Playwright. Pengujian AI memakai dependencies/respons tiruan, tidak memanggil AI berbayar atau Redis/Turnstile produksi. Lakukan smoke test terkontrol dengan layanan asli setelah konfigurasi untuk memverifikasi model, pembatasan bersama, dan quota lintas instance sebelum mengumumkan AI aktif.

Dokumentasi implementasi: [Structured outputs OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs), [validasi Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Redis EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval).
