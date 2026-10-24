# Tema Siang VoltQuest

Background bersumber dari `BG LISTRIK DINAMIS.png`, unggahan pengguna pada commit
`d2935354d8a3f0cccc708542fe28d4d403c7f3c7`. Gambar dibundel Vite sebagai aset lokal.
Lapisan tetap `body::before` mempertahankan proporsi gambar pada halaman panjang,
dengan lapisan putih 16% dan tanpa lapisan gelap. Kartu materi dan formulir putih
memisahkan teks dari detail ilustrasi.

Token ada di `src/index.css`. Lapisan warna bersama `src/theme.css` menggantikan
`src/night-theme.css`, tanpa menambahkan tema baru di atas tema malam.

| Peran                         | Warna                                      |
| ----------------------------- | ------------------------------------------ |
| Langit dan informasi          | `#71C8F8`, `#A1DAF9`, `#D0EBFB`, `#E3F2FF` |
| Kartu                         | `#FFFFFF`                                  |
| Bukit, rumput, detail progres | `#B5D665`, `#93C94D`, `#4E9E3B`            |
| Teks utama                    | `#163449`                                  |
| Teks pendukung                | `#40566A`, `#526879`                       |
| Tombol utama dan sukses       | `#2E6A35`                                  |
| Fokus keyboard dan tautan     | `#145B7D`                                  |

Warna teks gelap adalah turunan agar kontras terbaca. Kuning terbatas pada lampu
serta informasi energi. Feedback kesalahan tetap memakai teks, ikon, dan warna
merah yang berbeda dari sukses.

Login memiliki satu kartu terpusat. Tidak ada kanvas, observer animasi, atau
pemuatan scene Three.js saat login dibuka. Semua fitur autentikasi lokal tetap
ada. Tombol akun demo, rincian akun demo, tautan profil lama, dan catatan mode
demo telah dihapus dari kartu login; data yang sudah tersimpan tetap dipertahankan.
Tautan kode kelas berada di dalam kartu. Pada layar yang
pendek, halaman dapat digulir sehingga validasi tidak memotong isian atau tombol.

Banner dashboard berisi sambutan ilmuwan muda, satu kalimat pendukung, serta
satu rangkaian 3D. Tidak ada tombol belajar, teks tahap saat ini, instruksi
saklar, atau tombol jeda di banner. Informasi dan tombol langkah berikutnya ada
pada kartu progres di bawah tiga kartu utama. Saklar ON/OFF tetap mendukung klik
dan keyboard. Partikel berhenti saat OFF. Reduced motion menampilkan scene statis.
Animasi berhenti saat tersembunyi atau keluar layar dan resource dilepas saat
komponen ditutup. WebGL yang tidak tersedia tidak mengunci materi atau asesmen.

Penyimpanan profil, akun, XP, badge, draf, serta urutan belajar tidak dimigrasi
atau direset oleh perubahan tema ini.

## Validasi

Build dan lint berhasil. Sebanyak 38 pengujian terkait pada desktop dan ponsel
lolos: autentikasi lokal, pemulihan akun, data rusak/gagal disimpan, urutan enam
materi–kuis, isolasi profil, reduced motion, keluar layar, visibilitas dokumen,
pembersihan observer/listener/animation frame, dan WebGL tidak tersedia.

Screenshot login dan dashboard ditinjau pada lebar 1440, 1024, 768, 390, dan
320 piksel. Tidak ada overflow horizontal; login memiliki nol canvas, dashboard
satu canvas, dan tombol pause tidak ada. Pasangan warna teks normal yang
diperiksa memiliki rasio kontras 5,09:1 hingga 12,95:1. Pemeriksaan ini tidak
mengklaim sertifikasi aksesibilitas menyeluruh.
