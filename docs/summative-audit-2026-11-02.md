# Audit dan perbaikan sumatif — 2 November 2026

## Perubahan yang diterapkan

- Tiga pilihan ganda dan dua uraian dapat dikirim lengkap meskipun ada jawaban salah. Isian kosong/spasi ditolak dengan pesan per soal dan fokus ke isian pertama yang belum lengkap. Syarat tersembunyi 20 karakter dihapus; batas 6.000 karakter ditampilkan.
- Draf pilihan dan uraian disimpan per profil pada setiap perubahan. Uraian memiliki ID stabil `lamps` dan `batteries`; array lama tetap dibaca, termasuk array kosong atau slot yang hilang. Penyelesaian lama tetap dihormati.
- Pengiriman memeriksa penyimpanan draf, meminta pemeriksaan server, lalu menyimpan snapshot jawaban dan hasil. Penyimpanan gagal tidak menghasilkan tanda berhasil. Permintaan ganda dan respons setelah meninggalkan halaman dicegah.
- Revisi menyembunyikan hasil yang tidak lagi sesuai draf; hingga lima pengiriman sebelumnya disimpan bersama jawaban dan feedback. Feedback AI melekat pada versi pengiriman, bukan teks yang sedang berubah.
- Pilihan ganda diperiksa pada server. Hasil salah memberikan satu panel petunjuk dan tombol kembali ke materi; hasil benar menampilkan penjelasan. Tidak ada umpan balik salah sebelum siswa mengirim.
- Dua uraian mendapat catatan berbeda menurut rubrik kasus. Angka daya yang dapat dikenali dengan label/satuan dibandingkan dengan model nominal tetap pada server. Pemeriksaan aturan tidak menyatakan makna jawaban pasti benar atau memberi nilai uraian. Metode yang tidak dikenali tetap dapat dikirim dan ditinjau guru/AI.
- Opsi AI `summative-review` ditambahkan melalui kontrak ketat, persetujuan, Turnstile, origin dan kuota bersama. Output harus mencakup kedua ID tepat sekali. Angka baru yang tidak diverifikasi ditolak. Kegagalan AI tidak menghapus pengiriman atau catatan berbasis aturan.
- Sumatif dimuat saat dibuka agar modul antarmuka tidak menambah beban awal dashboard.

## Kesesuaian sumber asesmen

Diperiksa terhadap berkas pemilik: **Asesmen Formatif dan Sumatif - Listrik Dinamis V2.docx**, bagian sumatif dan pembahasan. Kunci pilihan ganda tetap B, C, B.

Diagram dua loop ditambahkan sesuai persamaan simpul sumber: `(VA − 18)/3 + VA/6 + (VA − 12)/6 = 0`. Kedua sumber positif di atas, jalur bawah bersama, R3 di cabang tengah. Petunjuk tidak lagi memberikan potensial simpul beserta hasil antara.

Soal lampu menjelaskan asumsi hambatan nominal tetap dan kerusakan sebagai rangkaian terbuka. Daya listrik dibedakan dari tingkat pencahayaan. Soal baterai menerima rancangan yang dijelaskan secara sah; catatan mengingatkan ketidakseimbangan pengosongan bila mengambil suplai dari sebagian sumber. Rubrik asli menjadi acuan, bukan alasan menyatakan semua tulisan memenuhi rubrik.

## Status tahap yang diperiksa

| Tahap | Hasil / batas |
| --- | --- |
| Login/profil | Regresi admin, siswa, identitas demo, logout dan pemisahan profil termasuk suite aktif. |
| Learning Path | Enam materi, kontrol suara/kecepatan, lazy video dan PDF termasuk suite aktif. Perubahan PDF yang sudah ada dipertahankan. |
| Discovery Lab | Prasyarat, prediksi bebas, pengamatan, revisi, unggah, snapshot laporan dan pemulihan termasuk suite aktif. |
| Formatif | Fixture tiga tes historis diperbarui agar memenuhi dua misi wajib; kelanjutan Energy Control Room diarahkan ke sumatif sesuai alur sekarang. |
| Sumatif | Pengiriman, validasi, draf, data lama, feedback, versi jawaban, kegagalan dan tampilan mendapat regresi baru. |
| Progres | `submitted` berarti pengiriman berhasil tersimpan, bukan nilai penguasaan atau nilai akhir guru. Tidak ada tambahan XP dari sumatif. |
| AI produksi | GET `/api/ai` pada 2 November 2026: HTTP 200, `enabled:false`. Integrasi esai telah ditulis; pembahasan AI nyata belum dapat digunakan tanpa konfigurasi server pemilik. |
| Layanan luar | Metadata keenam video YouTube dan URL PhET merespons HTTP 200. Ini bukan bukti semua video dapat diputar pada setiap perangkat/jaringan. |
| Suara/perangkat | Kontrol diuji dengan mesin suara tiruan; pelafalan dan jeda suara pada perangkat fisik masih memerlukan pemeriksaan langsung. |
| Penyimpanan | LocalStorage/IndexedDB per profil dan origin. Tidak ada sinkronisasi lintas perangkat; clear site data dapat menghapus pekerjaan. Susunan internal iframe PhET belum dipulihkan otomatis. |
| Penelitian pengguna | Pengujian teknis ini bukan riset siswa/guru atau bukti peningkatan hasil belajar. |

## Verifikasi dan bukti

Build dan lint lulus. Suite aktif `npm run test:current -- --workers=2` menyelesaikan **92 tes browser, semuanya lulus** (desktop dan emulasi ponsel, sekitar 6,6 menit). Ini mencakup 18 kasus sumatif dan regresi login, materi/media, dua game, Discovery Lab, bukti/PDF, progres serta penyimpanan. Setelah penyempurnaan status notasi alternatif, **12 tes server dan 18 tes browser sumatif lulus kembali**, bersama build dan lint. Pengujian ulang 18 kasus tersebut adalah bagian dari cakupan 92 kasus, bukan tambahan kasus unik.

Screenshot formulir pada lebar 1440, 1024, 768, 390, 320 px dan hasil desktop/ponsel dibuat oleh `tests/summative.spec.ts`, tersimpan di `tmp/summative-evidence/`. Semua memakai profil uji.

Tes AI menggunakan respons layanan tiruan. Permintaan provider asli tidak diklaim lulus. Nilai uraian serta nilai akhir belum ditentukan otomatis; guru tetap meninjau kualitas argumen.

## Publikasi

Tujuan tetap: `ayaa-code/VOLTQUEST`, workspace `ayaas-projects-028704c4`, proyek `voltquest`, domain `https://voltquest-jet.vercel.app/`.

Akun GitHub yang diperiksa: `ayaa-code`; SHA awal lokal dan remote sama. Status Vercel commit awal mengarah ke workspace/proyek yang benar. CLI Vercel tersimpan tidak memiliki akses ke scope tersebut, sehingga publikasi dilakukan melalui integrasi otomatis repository yang sudah ada, tanpa mengganti proyek atau workspace.
