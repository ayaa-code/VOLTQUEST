# VoltQuest

[Buka VoltQuest](https://voltquest.vercel.app) · [Repository GitHub](https://github.com/ayaa-code/VOLTQUEST) · [Panduan deployment](docs/deployment.md)

Demo pendamping pembelajaran listrik dinamis untuk Fisika Fase F SMA / MA, bertema **Sekolah Tangguh Energi**. Dashboard utama menyediakan enam pasangan materi → kuis formatif, kemudian asesmen sumatif. Challenge analisis PhET tersedia sebagai penguatan setelah materi selesai. Rangkaian 3D interaktif tetap hadir pada banner pembelajaran. Dibangun dengan React, TypeScript, Vite, CSS, dan ikon Lucide. Tanpa backend atau database.

## Jalur belajar Listrik Dinamis

Tampilan memakai palet siang dan background `BG LISTRIK DINAMIS.png`: biru
langit, putih, dan hijau. Login terpusat tanpa animasi; rangkaian 3D hanya hadir
di banner dashboard. [Panduan tema terbaru](docs/day-theme.md).

Materi selesai menawarkan kuis formatif untuk submateri yang sama. Kuis yang selesai membuka materi berikutnya; challenge tidak menjadi prasyarat kuis. Challenge meminta siswa membuka simulasi PhET dan menulis pengamatan serta refleksi mereka sendiri; VoltQuest tidak mengklaim membaca aktivitas di PhET. Jawaban angka formatif memberi kesempatan revisi dan pengingat konsep ketika belum tepat. Sumatif terdiri dari pilihan ganda yang dapat diperiksa serta uraian yang disimpan untuk ditinjau dengan rubrik, tanpa nilai uraian otomatis.

Progres jalur baru tersimpan per profil dalam penyimpanan lokal yang terpisah dari XP, akun, misi, dan data yang sudah ada. Lihat [panduan jalur belajar](docs/dynamic-learning.md).

## Laboratorium dan tabel pengamatan

PhET dapat dijalankan di dalam misi, dengan tombol layar penuh serta alternatif tab baru. Lima tabel menyesuaikan percobaan tiap misi. Refleksi baru terbuka setelah hasil diisi lengkap dan disimpan. Draf lama dipertahankan; data yang dahulu dilewati perlu dilengkapi sebelum mengulang refleksi. [Panduan dan bukti integrasi](docs/embedded-lab.md).

## Arah produk dan batas versi saat ini

Pembeda yang dituju adalah pendampingan dari prediksi, pengamatan, dan penjelasan konsep hingga tindak lanjut sesuai indikasi kesulitan siswa. Rancangan dan alasannya tersedia dalam [dokumentasi pembeda produk](docs/product-differentiation.md).

| Pilar pembeda                  | Dukungan versi berjalan                                                                                                  | Tujuan pengembangan                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Eksperimen dengan arah         | Prediksi, panduan variabel, pengamatan manual, alasan dan draf tersimpan.                                                | Penelaahan materi dan uji penggunaan bersama siswa/guru.                                |
| Kesalahan menjadi arah latihan | Petunjuk umum asli, lima konfirmasi alasan, bantuan dari respons terstruktur, dan tawaran latihan yang dapat ditelusuri. | Telaah materi/aturan dan uji formatif bersama siswa serta guru.                         |
| Keputusan energi sekolah       | Cerita dan panduan penerangan dengan cabang serta sakelar.                                                               | Pilihan rancangan interaktif dan perbandingan energi berdasarkan daya/waktu yang jelas. |

Dokumentasi pembeda yang diperbarui pada integrasi tahap 5 dan 6 mempertahankan pemetaan seluruh 15 pilihan salah aktual, batas data yang benar-benar disimpan, dan bukti pengguna yang masih perlu dicari. Rancangan kini memperjelas bahwa bantuan khusus menggunakan konfirmasi terstruktur; tulisan alasan bebas belum dapat dinilai otomatis. Lihat [positioning](docs/product-differentiation.md#3-positioning-dan-value-proposition), [matriks fitur](docs/product-differentiation.md#6-alur-pengalaman-dan-matriks-fitur-aktualrencana), [rancangan aturan](docs/product-differentiation.md#8-rancangan-penanganan-miskonsepsi-berbasis-aturan), serta [riwayat perubahan](docs/product-differentiation.md#15-ringkasan-perubahan-antarversi).

Prediksi, pengamatan manual, dan alasan refleksi sudah tersedia. Integrasi tahap 5 menambahkan lima pertanyaan konfirmasi dengan 25 aturan respons dan pemetaan seluruh 15 pilihan salah ke bantuan lanjutan. Petunjuk umum misi tetap; bantuan khusus mengikuti pilihan konfirmasi, bukan diagnosis dari satu jawaban. Tawaran latihan terhubung ke bank 10 soal tahap 6 dengan alasan yang merujuk respons aktual. Misi final belum menjadi perancang penerangan interaktif. Tidak ada penilaian tulisan bebas, diagnosis kemampuan, atau bukti peningkatan hasil belajar.

Klik lab hanya menandai bahwa tautan pernah dibuka. Draf per profil/misi pulih setelah refresh dan kembali dari dashboard jika penyimpanan browser berhasil. Feedback sementara tidak disimpan. Cabang paralel mendukung kendali ruang secara mandiri; penghematan energi bergantung pada daya dan durasi penggunaan, bukan jenis susunan saja.

## Konfirmasi alasan dan bantuan - tahap 5

Setelah mengirim jawaban refleksi, siswa boleh memilih alasan terstruktur, termasuk "Belum yakin", lalu menekan **Lihat bantuan dari alasan**. Bantuan mengikuti alasan aktual dan menawarkan satu latihan relevan. Siswa tetap dapat mencoba soal refleksi lagi atau melanjutkan tanpa konfirmasi. Jawaban benar tetap memberi XP tanpa syarat konfirmasi.

Data terpisah di `voltquest.feedback.v1`, versi 1, per profil/misi. Referensi rekomendasi memuat profil, percobaan, revisi, pertanyaan, respons, aturan, serta latihan. Mengubah jawaban membatalkan konteks lama; refresh atau membuka latihan tidak menciptakan percobaan baru. Tulisan bebas dan kegiatan PhET tidak dianalisis. Lihat [matriks aturan, kompatibilitas, pengujian, dan bukti tahap 5](docs/concept-feedback.md).

## Latihan mandiri — tahap 6

Klik **Buka latihan mandiri** di dashboard atau **Pilih latihan penguatan** di akhir refleksi. Pilih salah satu dari lima fokus: komponen/jalur tertutup, seri/paralel, V–I–R, daya/durasi/energi, atau kendali penerangan. Setiap fokus memiliki dua latihan dengan petunjuk untuk jawaban salah dan penjelasan setelah jawaban sesuai kunci. Siswa dapat mengganti fokus, mencoba soal lain, mengulang, kembali ke refleksi, atau melanjutkan misi.

Jalur mandiri tetap berdasarkan pilihan siswa: misalnya, "Kamu memilih fokus Hubungan V, I, dan R." Jalur tawaran dari konfirmasi tahap 5 menggunakan respons yang benar-benar dikirim dan konteks terbaru. Mengganti fokus menghapus sumber rekomendasi. Sumber yang tidak lagi cocok ditampilkan sebagai latihan umum tanpa alasan khusus lama. Latihan tidak menambah XP/badge. Ringkasan menghitung soal unik yang dikirim dan jawaban terakhir sesuai kunci, bukan penguasaan konsep.

Data latihan memakai `voltquest.practice.v1`, skema versi 1, per identitas profil yang sama. Latihan aktif, pilihan, status pengiriman, pilihan pertama/terakhir yang dikirim, dan jumlah pengiriman dipulihkan setelah refresh. Refresh serta membuka soal tidak menambah percobaan. Penyimpanan tidak mengubah `voltquest.v1` atau `voltquest.experiments.v1`. Versi tidak dikenal dipertahankan dan kegagalan tulis ditampilkan tanpa klaim tersimpan. Perubahan yang belum tersimpan hanya bertahan selama halaman latihan terbuka. Field source opsional menyimpan referensi rekomendasi; data latihan lama tanpa source tetap dianggap pilihan mandiri.

Lihat [audit, aturan pemilihan, bank soal, penyimpanan, pengujian, dan screenshot tahap 6](docs/practice-recommendations.md). Dengan dev server aktif, jalankan `node scripts/audit-ui.mjs practice` untuk menyimpan audit UI terbaru ke `artifacts/practice-recommendations/readability/`.

## Menjalankan aplikasi

Banner dashboard menyambut “Selamat datang, Ilmuwan Muda! ⚡” dengan rangkaian 3D bertema siang dan kontrol saklar ON/OFF. Tombol pause serta keterangan saklar dihapus. Reduced motion, penghentian saat keluar layar, dan pembersihan renderer tetap tersedia. Interaksi ilustrasi tidak mengubah XP atau data pengamatan. Informasi langkah berikutnya ada pada kartu progres.

Login dan dashboard menyesuaikan lebar serta tinggi viewport. Kartu login berada di tengah ketika ruang mencukupi. Pada layar pendek, teks besar, validasi, dan keyboard terbuka, konten tetap dapat digulir tanpa memotong kontrol.

Login hanya memuat kartu autentikasi di atas background ilustrasi. Modul Three.js tidak dimuat sampai dashboard dibuka. Akun demo, pendaftaran lokal, pemulihan dengan kode, ingat email, serta profil nama lama tetap tersedia. Bila WebGL tidak tersedia, dashboard menjelaskan keterbatasan visualisasi dan jalur belajar tetap dapat digunakan.

```sh
npm install
npm run dev
```

Di PowerShell dengan kebijakan skrip terbatas, gunakan `npm.cmd` sebagai pengganti `npm`. Vite menampilkan alamat dan port yang aktif di terminal.

```sh
npm run build
npm run lint
npm run preview
```

## Audit keterbacaan UI

Tahap 3 memperbesar teks pembelajaran, memperkuat kontras, memperluas area sentuh, dan memperbaiki siklus fokus dialog. Hasil pengukuran, batas pemeriksaan, dan screenshot sebelum–sesudah tersedia di [audit keterbacaan dan kenyamanan UI](docs/ui-readability-audit.md).

Dengan dev server aktif di `http://127.0.0.1:5173/`, jalankan `node scripts/audit-ui.mjs concept` untuk audit integrasi tahap 5/6. Hasil terbaru ada di `artifacts/concept-feedback/readability/`; bukti pengukuran sebelumnya tetap pada folder tahap 3/4/6. Audit ini bukan penelitian siswa atau sertifikasi aksesibilitas penuh.

## Alur demo

1. Pilih **Daftar** untuk membuat akun lokal dan simpan kode pemulihan. Setelah itu, masuk menggunakan email dan kata sandi. Gunakan akun serta browser yang sama untuk melanjutkan progres tersimpan.
2. Cari atau pilih salah satu dari lima kartu misi.
3. Baca briefing dan target. Pilih prediksi, termasuk “Belum yakin”; alasan opsional.
4. Ikuti panduan di langkah Eksperimen dan klik **Mulai simulasi di sini**. PhET tampil di halaman misi. Lanjutkan ke Pengamatan untuk mengisi tabel sambil mempertahankan simulasi yang sedang berjalan. Lengkapi seluruh hasil lalu klik **Simpan pengamatan dan lanjut** untuk membuka Refleksi. Hasil tidak dinilai terhadap nilai ideal; alasan tertulis tetap opsional.
5. Jawaban salah menampilkan petunjuk dan dapat dicoba lagi. Jawaban benar memberikan **100 XP sekali per misi** dan sebuah badge.
6. Buka **Badge saya**, detail progres, atau lanjutkan ke misi berikutnya.

Kelima misi tersedia sejak awal agar mudah didemonstrasikan. Misi final menggabungkan konsep penerangan sekolah dengan cabang paralel dan sakelar mandiri. Total maksimum: **500 XP dan 5 badge**.

## Penyimpanan lokal

Profil, misi selesai, dan riwayat membuka tautan lab disimpan di `localStorage` dengan kunci `voltquest.v1`. Refresh tidak menghapus progres. Nama yang sama (tanpa membedakan kapitalisasi) melanjutkan profil pada browser dan origin yang sama; nama lain memiliki progres terpisah.

Draf memakai kunci terpisah `voltquest.experiments.v1`, versi 1, per identitas profil yang sama dan ID misi. Isian disimpan langsung saat berubah. Prediksi awal dicatat ketika pertama melanjutkan; perubahan tidak menimpanya. Draf menyimpan langkah, prediksi/alasan, catatan, status pencatatan, pilihan refleksi, dan alasannya. Hash `#misi-1` hingga `#misi-5` menjaga misi saat refresh. Versi draf tidak dikenal tidak ditimpa; kegagalan tulis diberi pemberitahuan tanpa klaim tersimpan. Tidak ada reset progres. Lihat [dokumentasi tahap 4](docs/guided-experiment-flow.md).

Login email adalah prototipe lokal, bukan autentikasi server. Akun email memakai identitas terpisah dari profil nama lama. Kata sandi lokal disimpan sebagai hash; kode pemulihan diberikan saat pendaftaran. Checkbox Ingat saya hanya menyimpan email. Lihat [batas penyimpanan dan sesi](docs/login-3d.md). Progres tidak tersinkron ke perangkat, browser, atau origin lain. Menghapus data situs akan menghapus progres. Jika browser menolak penyimpanan, aplikasi menampilkan pemberitahuan dan tetap bisa dipakai dalam sesi itu. Kode kelas guru hanya menampilkan penjelasan mode demo dan tidak menghubungkan siswa ke kelas nyata.

## Laboratorium pendukung

Simulasi adalah karya **PhET Interactive Simulations, University of Colorado Boulder**, bukan fitur yang dikembangkan oleh VoltQuest. Simulasi ditampilkan melalui iframe. Tautan berikut tetap tersedia sebagai alternatif tab baru:

https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html

Simulasi eksternal membutuhkan koneksi internet. Font Google memiliki fallback font sistem bila koneksi tidak tersedia. VoltQuest tidak merekam aktivitas atau hasil eksperimen di PhET; indikator kunjungan hanya menandai bahwa siswa meminta membuka laboratorium. Rangkaian PhET tidak disimpan bersama draf VoltQuest.

## Struktur

```text
src/
  App.tsx                       Alur aplikasi, dashboard, dan modal
  App.css                       Tata letak responsif dan gaya komponen
  index.css                     Tipografi dan dasar tampilan
  components/
    CircuitArt.tsx              Ilustrasi rangkaian SVG
    Dialog.tsx                  Dialog native dengan pengelolaan fokus
    LearningUI.tsx              Logo, kartu misi, dan progress bar
    MissionView.tsx             Alur empat langkah dan ringkasan
    PracticeHub.tsx             Pilihan fokus, latihan dan riwayat
    ObservationForm.tsx         Isian manual, validasi format dan P/E
  data/practice.ts              Bank 10 latihan dengan ID stabil
  data/practiceSelection.ts     Pemilihan berdasarkan fokus siswa
  hooks/usePractice.ts          Penyimpanan latihan terpisah versi 1
  data/experiments.ts           Panduan, prediksi, isian dan parser desimal
  hooks/useExperimentDraft.ts   Penyimpanan draf versi 1, terpisah dari progres
  data/missions.ts              Materi, soal, feedback, badge, tautan PhET
  hooks/useProgress.ts          Validasi dan penyimpanan progres lokal
tests/*.spec.ts                Pengujian alur, draf, profil, kegagalan simpan dan UI
docs/product-differentiation.md Audit, pembeda, alasan desain, dan rencana validasi
```

## Pengujian

```sh
npx playwright install chromium
npm run test:e2e
```

Alternatif memakai Chrome yang telah terpasang, dengan profil pengujian terpisah (PowerShell):

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:e2e
```

Pengujian berjalan pada ukuran desktop dan iPhone dengan Chromium: alur lima misi, feedback salah/benar, pembukaan tab PhET, badge, XP tanpa duplikasi, pencarian/filter, refresh, profil terpisah, pemulihan data rusak, dan dialog melalui keyboard. Tata letak juga diperiksa pada lebar 320, 390, 768, 1024, dan 1440 piksel. Pengujian tab PhET memakai respons simulasi tiruan; pengujian otomatis tersebut tidak membuktikan akurasi fisika PhET. Screenshot alur tahap 4 disimpan di `artifacts/guided-experiment/`; screenshot umum di `test-results/`. Pengujian tambahan mencakup pemulihan draf, isolasi profil, data lama/rusak, versi tidak dikenal, kegagalan tulis, koma desimal, nol/kosong, perhitungan energi, dan kewajiban melengkapi tabel sebelum refleksi. Pengujian iframe menggunakan simulasi tiruan untuk menguji integrasi secara stabil; audit terpisah juga memuat PhET asli. Lihat [rincian, hasil terbaru, dan screenshot laboratorium dalam halaman](docs/embedded-lab.md).

Verifikasi tahap 6: 32 pengujian E2E lolos, termasuk seluruh 10 latihan, pemulihan jawaban/feedback, percobaan pertama dan pengulangan, isolasi profil, penyimpanan rusak/tidak dikenal/gagal, serta perlindungan XP dan draf lama. Audit UI tahap 6 mencakup 145 keadaan/ukuran pada lima lebar layar; bukti dan batas pemeriksaan ada di docs/practice-recommendations.md.

Verifikasi integrasi tahap 5: build/lint lolos, suite lengkap 48 pemeriksaan E2E lolos, pengulangan terarah pada 32 pemeriksaan terdampak juga lolos. Audit UI mencakup 225 keadaan/ukuran pada lima lebar layar. Detail batas pemeriksaan dan riwayat eksekusi ada pada docs/concept-feedback.md.
