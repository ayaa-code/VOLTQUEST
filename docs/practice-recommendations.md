# Tahap 6 — Latihan penguatan dan tindak lanjut belajar

Tanggal implementasi dan verifikasi: 20 Oktober 2026.

**Status terkini setelah integrasi tahap 5:** latihan mandiri tetap tersedia dan tawaran berdasarkan konfirmasi kini aktif. Lima pertanyaan serta 25 aturan respons menyediakan alasan yang merujuk jawaban aktual, dengan pemeriksaan percobaan/revisi terbaru. Lihat [dokumentasi konfirmasi](concept-feedback.md). Kondisi awal tanpa konfirmasi dan 32 hasil pengujian di bawah merupakan riwayat pengerjaan tahap 6, bukan kondisi fitur saat ini. Catatan ini membedakan hasil implementasi dari rencana personalisasi dan bukan penelitian pendidikan.

## Riwayat audit awal tahap 6 (sebelum tahap 5)

| Area          | Kondisi yang ditemukan                                                                                                                                                      | Keputusan tahap 6                                                            |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Refleksi misi | Lima soal, kunci indeks, petunjuk tetap per misi, penjelasan setelah benar.                                                                                                 | Dipertahankan tanpa perubahan soal atau feedback.                            |
| Tahap 5       | Tidak ditemukan kode/dokumen implementasi konfirmasi terstruktur, identitas respons konfirmasi, atau mesin feedback per indikasi. Bagian 8 dokumen pembeda masih rancangan. | Tidak membuat aturan khusus dari satu jawaban salah atau dari tulisan bebas. |
| Data jawaban  | Pilihan refleksi dan tulisan tersimpan pada draf eksperimen; bukan jawaban atas pertanyaan konfirmasi.                                                                      | Tidak dipakai sebagai pemicu rekomendasi.                                    |
| Progres       | `voltquest.v1`: profil, misi selesai, kunjungan tautan lab. XP dihitung dari misi selesai.                                                                                  | Tidak diubah; latihan tidak memberi XP/badge.                                |
| Draf          | `voltquest.experiments.v1`: empat langkah, prediksi awal/perubahan, pengamatan, alasan, pilihan refleksi.                                                                   | Tidak diubah atau direset.                                                   |
| Navigasi      | Dashboard, empat langkah misi, hash misi, dialog profil/badge/progres.                                                                                                      | Tambahkan akses latihan opsional di dashboard dan akhir refleksi.            |

Pemeriksaan mencakup README, dokumen pembeda, alur eksperimen, audit keterbacaan, komponen aplikasi, formulir pengamatan, data misi/eksperimen, kedua hook lama, CSS, serta pengujian. Tidak ada dependensi baru, backend, database, atau API AI.

## Pengalaman yang tersedia

1. Buka **Buka latihan mandiri** di dashboard atau **Pilih latihan penguatan** di akhir refleksi, tanpa wajib menjawab soal misi dengan benar terlebih dahulu.
2. Pilih satu dari lima fokus. Semua fokus dan latihan dapat diakses tanpa prasyarat XP atau penyelesaian misi.
3. Kerjakan soal pertama. Tombol **Coba latihan lain** membuka soal kedua pada fokus yang sama dan berputar kembali ke soal pertama.
4. Kirim jawaban untuk mendapat petunjuk bila belum sesuai kunci atau penjelasan bila sesuai kunci. Penjelasan lengkap tidak ditampilkan sebelum jawaban sesuai kunci.
5. Ubah pilihan untuk mencoba lagi, pilih **Ulangi latihan ini**, ganti fokus, kembali ke refleksi/dashboard, atau lanjutkan misi.

Pemilihan, aturan penyaringan, dan UI terpisah pada `src/data/practice.ts`, `src/data/practiceSelection.ts`, dan `src/components/PracticeHub.tsx`. Pemilihan menggunakan ID konsep/soal/pilihan yang stabil, bukan pencocokan teks atau posisi array. Huruf A–D hanya label tampilan.

Mengganti fokus tidak menghapus riwayat. Latihan yang sedang terbuka dipulihkan ketika halaman latihan dibuka lagi. Kembali ke refleksi memulihkan draf, tetapi feedback sementara misi mengikuti perilaku tahap 4: perlu dikirim lagi bila ingin melihat feedback. Membuka latihan bukan penyelesaian misi.

## Matriks aturan yang aktif

Aturan jalur manual pada tabel berikut dipicu **pilihan fokus siswa**. Jalur tambahan dari tahap 5 hanya aktif setelah respons konfirmasi dikirim, dengan sumber terstruktur yang divalidasi terhadap profil, misi, percobaan, revisi, aturan, dan draf jawaban. Ini bukan diagnosis, rekomendasi berdasarkan kesalahan, atau analisis penalaran.

| Respons pemicu aktual                                                         | Aturan                                                           | Latihan yang ditawarkan                       | Alasan yang ditampilkan                                                             |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Pilih `components`                                                            | Saring dua latihan konsep `components`; buka yang pertama.       | `components-source`, `components-gap`         | Kamu memilih fokus Komponen dan jalur tertutup.                                     |
| Pilih `paths`                                                                 | Saring dua latihan konsep `paths`; buka yang pertama.            | `paths-series-break`, `paths-extra-branch`    | Kamu memilih fokus Jalur seri dan paralel.                                          |
| Pilih `ohm`                                                                   | Saring dua latihan konsep `ohm`; buka yang pertama.              | `ohm-find-resistance`, `ohm-fixed-resistor`   | Kamu memilih fokus Hubungan V, I, dan R.                                            |
| Pilih `energy`                                                                | Saring dua latihan konsep `energy`; buka yang pertama.           | `energy-joules`, `energy-duration`            | Kamu memilih fokus Daya, durasi, dan energi.                                        |
| Pilih `switches`                                                              | Saring dua latihan konsep `switches`; buka yang pertama.         | `switches-one-room`, `switches-main-control`  | Kamu memilih fokus Kendali penerangan sekolah.                                      |
| Belum memilih fokus atau ID aktif tersimpan tidak dikenal                     | Tampilkan lima pilihan; jangan menebak fokus.                    | Tidak ada soal otomatis sampai siswa memilih. | Pilih fokus latihanmu.                                                              |
| Ada jawaban misi, tulisan alasan, XP, kunjungan PhET, atau catatan pengamatan | Bukan input `getPracticePlan`; tidak mengubah fokus atau alasan. | Tetap berdasarkan pilihan siswa.              | Tidak ada alasan personalisasi yang direkayasa.                                     |
| Respons konfirmasi tahap 5                                                    | Kini tersedia; resolveRecommendation memeriksa sumber terbaru.   | Satu latihan relevan dari bank yang sama.     | Alasan menyebut pilihan konfirmasi aktual; sumber kedaluwarsa diganti pesan netral. |

Setiap kali soal dibuka, alasan diturunkan dari konsep soal aktif. Tidak ada salinan rekomendasi lama yang tetap ditampilkan setelah fokus berubah. Integrasi tahap 5 kini memakai respons konfirmasi terbaru dengan ID stabil dan referensi percobaan/revisi; pilihan refleksi indeks bukan pengganti konfirmasi.

## Bank latihan dan telaah materi

Terdapat **10 latihan**, masing-masing dua pada lima fokus. Setiap entri mempunyai ID, ID konsep, judul, soal, asumsi, pilihan ber-ID, kunci, petunjuk, dan penjelasan.

| ID latihan              | Penerapan konsep                                | Kunci dan asumsi untuk penelaahan                                                                       |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `components-source`     | Bedakan fungsi baterai dan kabel.               | Baterai menyediakan beda potensial; kabel penghantar. Sumber berfungsi.                                 |
| `components-gap`        | Sakelar tertutup tetapi kabel kembali terlepas. | Lampu tetap padam: lintasan belum tertutup; tidak ada jalur lain.                                       |
| `paths-series-break`    | Satu dari tiga lampu seri dilepas.              | Dua lampu lain padam pada satu jalur tanpa bypass.                                                      |
| `paths-extra-branch`    | Tambahkan resistor identik secara paralel.      | Arus total bertambah, arus cabang awal tetap, dengan sumber ideal bertegangan tetap dan resistor ohmik. |
| `ohm-find-resistance`   | Hitung R dari 9 V dan 3 A.                      | R = 9/3 = 3 Ω; I bukan nol.                                                                             |
| `ohm-fixed-resistor`    | R tetap 8 Ω; V naik dari 4 V ke 12 V.           | Arus kedua 12/8 = 1,5 A; arus awal 0,5 A.                                                               |
| `energy-joules`         | V = 12 V, I = 0,5 A selama 60 detik.            | P = 6 W; E = 360 J. V/I konstan.                                                                        |
| `energy-duration`       | A: 10 W selama 2 jam; B: 20 W selama 0,5 jam.   | A = 20 Wh, B = 10 Wh. Bandingkan konsumsi; tidak menyimpulkan efisiensi/fungsi setara.                  |
| `switches-one-room`     | Buka sakelar cabang ruang 2.                    | Hanya lampu ruang 2 padam; cabang lain tetap tersambung pada sumber ideal.                              |
| `switches-main-control` | Kendali semua cabang sekaligus pada model.      | Sakelar pada jalur bersama sebelum percabangan; bukan petunjuk instalasi listrik nyata.                 |

Soal tidak hanya mengulang jawaban misi: ada lintasan kabel terputus meskipun sakelar tertutup, penambahan cabang, perubahan tegangan pada R tetap, perbandingan energi dengan durasi berbeda, serta perbedaan sakelar utama dan cabang. Besaran yang dipakai untuk pembagian arus tidak nol. Joule memakai detik dan Wh memakai jam. Cabang paralel tidak otomatis lebih hemat energi.

Petunjuk salah hanya membimbing cara memeriksa hubungan konsep; tidak memberikan label kemampuan. Penjelasan benar menjabarkan hasil dan asumsi. Kesulitan atau manfaat item belum divalidasi bersama guru/siswa. Pemeriksaan hitungan dan keunikan opsi/kunci merupakan verifikasi teknis, bukan validasi instrumen pendidikan.

## Makna ringkasan dan hadiah

- **Latihan pernah dikirim:** jumlah ID soal berbeda dengan minimal satu pengiriman sah. Membuka soal atau memilih opsi belum dihitung.
- **Jawaban terakhir sesuai kunci:** jumlah soal yang pilihan terakhir dikirimnya sesuai kunci. Memilih opsi baru tanpa mengirim tidak mengubah hasil terakhir.
- **Pengiriman soal:** jumlah pengiriman pada soal tersebut. Tombol kirim dinonaktifkan setelah pengiriman sampai siswa mengubah pilihan atau memulai ulang; refresh tidak menambah jumlahnya.
- **Jawaban pertama:** hasil pilihan pertama yang pernah dikirim, dipertahankan meskipun jawaban berikutnya berubah.

Mengulang soal menambah pengiriman ketika siswa mengirim lagi, tetapi tidak menambah jumlah soal unik. Tidak ada persentase penguasaan, ranking, atau label “menguasai konsep”. Latihan tidak menambah XP/badge. Misi tetap memberi 100 XP sekali, maksimum 500 XP, dengan progres lama utuh.

## Penyimpanan dan navigasi

Kunci baru: **`voltquest.practice.v1`**, skema versi 1. Hook `usePractice` memakai `profileId` aktif yang sama dengan `useProgress`. Nama yang sama setelah normalisasi lama memakai profil sama; nama berbeda terpisah. Ini profil demo tanpa autentikasi.

```text
version: 1
profiles:
  student:nama:
    activeId: ID latihan atau null
    records:
      ID latihan:
        selectedId: ID opsi saat ini atau null
        submitted: apakah pilihan saat ini sudah dikirim
        lastSubmittedId: ID pilihan terakhir yang dikirim atau null
        firstSubmittedId: ID pilihan pertama yang dikirim atau null
        submissions: jumlah pengiriman sah
```

ID konsep diperoleh dari bank soal, tidak diduplikasi ke penyimpanan. Tidak ada data konfirmasi, analisis tulisan, waktu kunjungan, atau rekaman aktivitas PhET.

Pilihan, navigasi soal/fokus, pengiriman, dan pengulangan ditulis langsung saat berinteraksi. Membuka soal tidak menambah pengiriman. Sebelum menulis, hook membaca ulang root terbaru dan menggabungkan hanya rekaman yang berubah agar data profil/soal lain tidak ditimpa snapshot lama. Perubahan bersamaan pada soal yang sama belum mempunyai resolusi konflik; penulisan terakhir berlaku, dan tab tidak tersinkron langsung.

Hash `#latihan` memulihkan halaman latihan dari dashboard. `#latihan-misi-1` hingga `#latihan-misi-5` menyimpan konteks kembali ke misi asal. Latihan aktif diambil dari penyimpanan profil. Hash menggunakan `replaceState`, mengikuti navigasi misi lama; tidak membuat riwayat router bertingkat. Pilihan fokus manual tetap terbuka ketika profil belum punya latihan aktif, termasuk saat masuk dari refleksi yang jawabannya salah.

JSON rusak memunculkan pemberitahuan dan memungkinkan data latihan baru pada interaksi berikutnya, tanpa menyentuh penyimpanan misi/eksperimen. Bentuk data, ID soal/opsi, jumlah pengiriman, dan flag kirim divalidasi. ID tidak dikenal dibuang. Data pengiriman yang tidak konsisten tidak menghasilkan percobaan atau feedback benar otomatis. Versi skema tidak dikenal dipertahankan tanpa penulisan; latihan hanya berjalan di memori halaman itu.

Jika penulisan gagal, aplikasi menampilkan **Latihan belum tersimpan di browser**, tanpa klaim tersimpan. Data memori tetap dapat dipakai selama halaman latihan terpasang, tetapi dapat hilang setelah kembali ke dashboard, logout, berpindah ke misi, atau refresh. Tidak ada tombol reset atau migrasi yang menghapus progres. Tidak ada penyimpanan lintas perangkat/origin; menghapus data situs menghapus riwayat lokal.

## Hasil verifikasi

Perintah yang dijalankan:

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:e2e
node scripts/audit-ui.mjs practice
```

Hasil:

- Build TypeScript/Vite dan lint lolos.
- **32 pengujian E2E lolos**, terdiri dari 16 pemeriksaan yang sudah ada dan 16 pemeriksaan tahap 6 pada proyek desktop/mobile. Seluruh 10 latihan diuji pengiriman dan penjelasannya.
- Cakupan baru: pemilihan manual dan alasan aktual, ID/kunci/satuan, feedback salah/benar, percobaan pertama/pengulangan, pilihan dan feedback setelah refresh, kembali dari dashboard, profil berbeda, konteks kembali ke refleksi dan misi berikutnya, JSON rusak, bentuk rekaman salah, versi tidak dikenal, kegagalan tulis, dan keyboard.
- Pengujian dengan progres lama 500 XP serta draf refleksi memastikan kedua nilai penyimpanan lama tetap identik sebelum/sesudah latihan. Suite lama tetap menguji penyelesaian lima misi, badge, dan batas XP tanpa duplikasi.
- Pemeriksaan layout latihan pada **320, 390, 768, 1024, dan 1440px** lolos tanpa overflow horizontal atau kontrol utama lebih kecil dari 44px. Fokus, soal, dan feedback benar diperiksa pada lima lebar; seluruh 10 soal dijalankan.
- Audit UI tambahan mencatat **145 keadaan/ukuran**, termasuk tujuh keadaan latihan pada lima lebar, dashboard, misi, dialog, feedback, dan pembesaran teks 200% pada dashboard. Tidak ditemukan kegagalan kontras teks terukur, placeholder, ukuran kontrol, pemotongan teks, overflow horizontal, atau pemeriksaan interaksi yang dicakup skrip.

Data audit: [measurements.json](../artifacts/practice-recommendations/readability/measurements.json). Metode mengikuti [audit keterbacaan](ui-readability-audit.md); bukan sertifikasi aksesibilitas penuh. Pembesaran teks 200% pada audit ini hanya dashboard. Chrome desktop dan emulasi iPhone melalui Chromium bukan pengujian Safari/perangkat fisik; pembaca layar belum diuji. Pengujian tab PhET tetap memakai stub, tanpa memeriksa simulasi eksternal.

Seluruh pemeriksaan menggunakan context browser pengujian baru tanpa data pribadi pengguna. Terminal sandbox Windows sempat gagal membuat proses dengan kode 1909; pemeriksaan lanjutan memakai eksekusi di luar sandbox yang disetujui otomatis. Ini kendala lingkungan, bukan kegagalan aplikasi.

## Screenshot dan bukti

Screenshot memakai profil pengujian dan jawaban uji. Contoh:

| Keadaan              | Mobile                                                                                     | Desktop                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Pilihan fokus        | [320px](../artifacts/practice-recommendations/focus-320.png)                               | [1440px](../artifacts/practice-recommendations/focus-1440.png)                               |
| Soal sebelum dikirim | [320px](../artifacts/practice-recommendations/question-320.png)                            | [1440px](../artifacts/practice-recommendations/question-1440.png)                            |
| Feedback benar       | [320px](../artifacts/practice-recommendations/correct-feedback-320.png)                    | [1440px](../artifacts/practice-recommendations/correct-feedback-1440.png)                    |
| Feedback salah       | [390px](../artifacts/practice-recommendations/readability/390-practice-wrong-feedback.png) | [1440px](../artifacts/practice-recommendations/readability/1440-practice-wrong-feedback.png) |
| Mengulang latihan    | [390px](../artifacts/practice-recommendations/readability/390-practice-repeat.png)         | [1440px](../artifacts/practice-recommendations/readability/1440-practice-repeat.png)         |

Folder `readability/` berisi screenshot tambahan dan data mentah. Bukti pengukuran tahap 3/4 tidak ditimpa oleh mode audit `practice`. Pada eksekusi penuh awal tahap 6, suite lama masih menulis ulang screenshot E2E di `artifacts/guided-experiment/`; gambar tersebut kini menunjukkan regresi versi tahap 6, termasuk akses latihan di refleksi. Hasil ukur tahap 4 tetap bukti pemeriksaan sebelumnya. Lokasi keluaran pengujian regresi selanjutnya dialihkan ke `artifacts/practice-recommendations/regression-guided/` agar pembaruan tidak terus bercampur dengan folder tahap 4.

## File yang berubah dan pekerjaan berikutnya

File baru: `src/data/practice.ts`, `src/data/practiceSelection.ts`, `src/hooks/usePractice.ts`, `src/components/PracticeHub.tsx`, `tests/practice.spec.ts`, dokumen ini, dan `artifacts/practice-recommendations/`.

File diperbarui: `src/App.tsx`, `src/App.css`, `src/components/MissionView.tsx`, `scripts/audit-ui.mjs`, `tests/guided-flow.spec.ts` untuk lokasi screenshot regresi, README, matriks dokumen pembeda, serta catatan screenshot pada dokumen tahap 4. Tidak ada perubahan bank soal misi, hook progres, hook draf eksperimen, dependensi, atau konfigurasi Vite.

Riwayat rencana sebelum integrasi: prasyarat berikutnya saat itu ialah implementasi konfirmasi terstruktur tahap 5 dengan identitas stabil, penelaahan aturan bersama guru, serta pengaitan respons relevan terbaru dengan saran latihan yang dapat dijelaskan. Pada audit awal jalur itu belum aktif; integrasi tahap 5 di bagian berikut sekarang telah mengaktifkannya. Perancang penerangan interaktif tetap pekerjaan tahap 7. Uji formatif dengan siswa/guru belum dilakukan; tidak ada klaim peningkatan hasil belajar atau diagnosis pemahaman.

## Integrasi tahap 5 yang sudah aktif

Konfirmasi dan tawaran latihan kini tersedia. Jawaban misi saja tidak memilih latihan: respons alasan terstruktur harus benar-benar dikirim. Semua aturan dan batas interpretasinya ada pada [concept-feedback.md](concept-feedback.md).

Skema latihan tetap versi 1 dengan field source opsional pada profil. Rekaman lama tanpa source dianggap jalur manual. Source memuat profileId, missionId, attemptId, revision, confirmationId, responseId, ruleId, exerciseId, dan ruleVersion. Jumlah pengiriman serta jawaban pertama/terakhir tidak direset ketika tawaran dibuka. Mengganti fokus atau soal secara manual menghapus source.

Sumber divalidasi ulang terhadap voltquest.feedback.v1 dan jawaban di voltquest.experiments.v1. Jika respons berubah, hilang, rusak, atau tak didukung, alasan khusus lama tidak digunakan; latihan tetap tersedia sebagai latihan umum. Event storage memicu pemeriksaan ulang ketika sumber berubah di tab lain. Tidak ada sinkronisasi seluruh riwayat atau resolusi konflik edit bersamaan.

Bukti pengujian dan screenshot tahap 6 di atas tetap historis. Hasil terbaru tersimpan pada artifacts/concept-feedback/; pengujian regresi kini menggunakan subfolder regression-practice/ dan regression-guided/ di dalamnya sehingga bukti sebelumnya tidak ditimpa.
