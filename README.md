# VoltQuest

[Buka aplikasi](https://voltquest-jet.vercel.app/) · [Deployment](docs/deployment.md) · [Paket kesiapan lomba](docs/competition-readiness/README.md)

Pendamping pembelajaran Listrik Dinamis untuk Fisika Fase F. Fokus: mengubah prediksi menjadi penjelasan yang didukung bukti eksperimen. React, TypeScript, Vite dan Three.js; endpoint server menangani pemeriksaan asesmen dan layanan AI opsional.

## Alur sekarang

Materi 1–3 → Discovery Lab: Komponen Rangkaian dan Hukum Ohm → Formatif 1 (Piko) → Materi 4–6 → Formatif 2 (Energy Control Room) → Sumatif.

Misi Seri–Paralel, Daya, dan Listrik Sekolah adalah penguatan setelah materi terkait, mengikuti urutan misi. Aturan bersama: src/data/learningAccess.ts. Pencapaian sah versi lama tetap dapat ditinjau melalui jalur kompatibilitas.

- Enam materi: bacaan, ringkasan, suara perangkat, video YouTube dan referensi.
- Dua game formatif, masing-masing tiga soal. Skor game terpisah dari XP.
- Discovery Lab: prediksi dan alasan, pengamatan, perbandingan, refleksi, screenshot dan laporan PDF.
- Empat kesalahan memungkinkan lanjut dengan status perlu penguatan; bukan jawaban benar.
- Progres tersedia pada desktop dan ponsel.
- Login lokal admin/admin membuka tahap tanpa menyelesaikannya. Identitas demo:admin, bukan nama tampilan siswa; bukan administrator server.

## Menjalankan dan menguji

Node 24. Jalankan npm ci lalu npm run dev. PowerShell dapat memakai npm.cmd.

- npm run lint
- npm run build
- npm run test:server
- npm run test:current

Pasang browser dengan npx playwright install chromium atau gunakan PLAYWRIGHT_CHANNEL=chrome. Chrome pada lokasi standar Windows terdeteksi otomatis. Server tes:127.0.0.1:5173. Profil tes terisolasi dari data siswa.

test:e2e juga berisi skenario historis yang mengacu alur lama. test:current mencakup regresi alur sekarang; cakupan dan keterbatasan dicatat dalam paket kesiapan lomba. Jangan mengembalikan alur lama hanya untuk memenuhi tes historis.

## Data dan batas

Akun adalah prototipe lokal. Progres per profil di localStorage; gambar di IndexedDB. Tidak ada sinkronisasi perangkat/origin. Menghapus data situs dapat menghapus progres. Skema penyimpanan tidak dikenal/rusak tidak boleh ditimpa.

Draf pulih saat refresh; susunan iframe PhET tidak otomatis tersimpan. Siswa memasukkan angka sendiri. Screenshot belum diperiksa otomatis.

Pemeriksaan lokal membedakan kunci pilihan, konsistensi angka, kelengkapan dan indikasi penjelasan belum memadai. Tulisan bebas tidak otomatis dinyatakan benar. AI memerlukan konfigurasi, persetujuan dan batas server. Pada pemeriksaan25 Oktober 2026, endpoint produksi melaporkan AI nonaktif.

PhET/video bergantung jaringan eksternal. Audio bergantung browser/perangkat; tes mesin suara tiruan tidak membuktikan kualitas pelafalan nyata.

## Dokumentasi

docs/competition-readiness adalah ringkasan audit terkini. Dokumen tahap terdahulu di docs merupakan riwayat dan dapat memuat alur yang telah berubah. Bukti teknis tidak menggantikan wawancara atau uji siswa/guru.
