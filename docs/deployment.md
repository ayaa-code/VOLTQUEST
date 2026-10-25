# Deployment VoltQuest

## Tujuan tetap

- Repository: [ayaa-code/VOLTQUEST](https://github.com/ayaa-code/VOLTQUEST)
- Workspace: ayaas-projects-028704c4
- Proyek: voltquest
- Domain: [voltquest-jet.vercel.app](https://voltquest-jet.vercel.app/)
- [Dashboard proyek yang benar](https://vercel.com/ayaas-projects-028704c4/voltquest)

Petunjuk ini menggantikan dokumentasi lama yang menunjuk workspace/domain berbeda. Jangan membuat proyek baru atau menautkan ulang ke workspace lain untuk mengatasi timeout.

## Publikasi

1. Lint, build, server tests dan browser tests yang relevan.
2. Tinjau diff, tanpa rahasia/data siswa.
3. Commit dan push ke main.
4. Periksa integrasi Vercel untuk SHA yang sama.
5. Verifikasi domain, asset versi terbaru, login dan alur utama.

Vite menghasilkan dist; Vercel juga menjalankan /api/assessment dan /api/ai. Detail di vercel.json; Node 24 diperlukan.

## AI

Nama variabel tersedia dalam .env.example. Kredensial model, Redis, Turnstile, origin dan rate salt hanya melalui pengaturan server. Jangan memasukkan rahasia ke frontend/Git/percakapan. Flag aktif belum membuktikan permintaan AI berhasil; uji dengan persetujuan dan perlindungan yang berlaku. Admin demo tidak melewati perlindungan tersebut.

## Akses

Ready tidak membuktikan semua jaringan dapat mengakses domain. Catat HTTP jaringan pengujian terpisah. Jangan mengubah DNS pengguna diam-diam. Data localhost dan produksi terpisah; deployment tidak menyinkronkan progres. Jangan menghapus data situs saat troubleshooting.

Hasil publikasi terbaru: [status audit](competition-readiness/README.md).
