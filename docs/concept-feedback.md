# Tahap 5 — Konfirmasi alasan, feedback, dan rekomendasi latihan

Implementasi dan pemeriksaan teknis: 20 Oktober 2026, sesudah implementasi latihan mandiri tahap 6. Ini catatan kemampuan aplikasi, bukan hasil penelitian siswa atau bukti validitas diagnosis.

## Audit awal dan hasil implementasi

Sebelum pekerjaan ini, lima soal refleksi menggunakan kunci indeks dan petunjuk salah tetap per misi. Draf menyimpan pilihan serta tulisan, tetapi tidak ada pertanyaan konfirmasi. Sepuluh latihan tersedia melalui pemilihan fokus manual; tidak ada bukti terstruktur untuk memberi saran khusus.

Sekarang **lima pertanyaan konfirmasi, 25 pilihan/aturan respons, dan pemetaan seluruh 15 pilihan salah** tersedia. Petunjuk umum asli tetap tampil segera setelah jawaban salah. Konfirmasi ditambahkan sebagai bantuan opsional. Jawaban benar tetap memberi 100 XP sekali tanpa perlu konfirmasi. Latihan tetap tidak memberi XP/badge.

Kode dipisahkan menjadi data pertanyaan pada `confirmations.ts`, aturan pada `feedbackRules.ts`, validasi penyimpanan dan referensi pada `feedbackStorage.ts`, hook `useConceptFeedback`, dan UI `ConceptConfirmation`. Bank latihan asli tahap 6 digunakan kembali tanpa menambah atau mengubah soal latihan.

## Alur aktual

1. Kirim jawaban refleksi. Soal, pilihan, kunci, hint, explanation, dan mekanisme hadiah asli tetap.
2. Bila pemetaan cocok dengan soal aktual, bagian **Ingin memeriksa alasanmu?** muncul. Siswa boleh melanjutkan, mencoba jawaban refleksi lagi, atau memilih latihan mandiri tanpa menjawabnya.
3. Pilih satu alasan, termasuk **Belum yakin**, lalu klik **Lihat bantuan dari alasan**. Memilih opsi saja belum dianggap konfirmasi yang dikirim.
4. Bantuan menjelaskan hubungan yang dipilih siswa. Tidak menyimpulkan penyebab dari angka jawaban awal saja, tidak memberi label kemampuan, dan tidak menganalisis tulisan bebas.
5. Tombol **Coba latihan yang ditawarkan** membuka satu latihan relevan dengan alasan yang menyebut pilihan konfirmasi aktual. Siswa dapat mengganti fokus, mencoba soal lain, kembali ke refleksi, atau melanjutkan misi.

Konfirmasi setelah jawaban benar bersifat opsional. Jika alasan sejalan, bantuan menyatakan keselarasan respons tersebut, bukan penguasaan konsep. Jika alasannya berbeda, bantuan membahas pilihan alasan aktual tanpa mencabut XP atau mengubah jawaban misi yang sudah selesai.

## Identitas dan pengamanan pemetaan

`RULE_VERSION = 1`. Setiap misi memiliki ID pertanyaan dan empat ID jawaban misi stabil. Lima opsi konfirmasi memiliki ID stabil. ID aturan berbentuk `confirmationId/responseId`. ID latihan berasal dari bank tahap 6.

Indeks soal lama dijembatani melalui snapshot eksplisit: ID/label jawaban, teks pertanyaan, jumlah/urutan pilihan, serta ID kunci yang diharapkan. `getConfirmation` memeriksa kecocokan semuanya sebelum menjalankan aturan khusus. Jika pertanyaan, pilihan/urutannya, atau kunci berubah, fungsi mengembalikan null; feedback umum serta latihan manual tetap tersedia. Pemutakhiran materi kelak harus disertai penelaahan snapshot dan versi aturan. Teks bukan satu-satunya identitas; setelah validasi snapshot, pemrosesan memakai ID.

## Pemetaan seluruh 15 pilihan salah

Kolom respons pendukung menunjukkan respons yang _selaras dengan dugaan sementara_ dari pilihan awal, bukan diagnosis pasti. Respons konsep merupakan contoh yang tidak mendukung dugaan tersebut. Respons lain tetap ditangani sesuai pilihan aktual, termasuk bila pilihan salah awal dan respons menunjukkan hubungan keliru yang berbeda.

| ID jawaban misi / pilihan salah           | ID konfirmasi            | Respons pendukung    | Contoh respons konsep yang tidak mendukung dugaan | Latihan untuk respons pendukung |
| ----------------------------------------- | ------------------------ | -------------------- | ------------------------------------------------- | ------------------------------- |
| `component-wire` / Kabel                  | `confirm-component-role` | `wire-source`        | `battery-source`                                  | `components-source`             |
| `component-lamp` / Lampu                  | `confirm-component-role` | `lamp-source`        | `battery-source`                                  | `components-source`             |
| `component-switch` / Sakelar              | `confirm-component-role` | `switch-source`      | `battery-source`                                  | `components-gap`                |
| `paths-series` / Seri                     | `confirm-current-paths`  | `single-path-enough` | `independent-path`                                | `paths-series-break`            |
| `paths-open` / Terbuka                    | `confirm-current-paths`  | `all-open`           | `independent-path`                                | `components-gap`                |
| `paths-no-source` / Tanpa sumber tegangan | `confirm-current-paths`  | `no-source-needed`   | `independent-path`                                | `components-source`             |
| `ohm-24` / 24 Ω                           | `confirm-ohm-relation`   | `multiply`           | `divide`                                          | `ohm-find-resistance`           |
| `ohm-10` / 10 Ω                           | `confirm-ohm-relation`   | `subtract`           | `divide`                                          | `ohm-find-resistance`           |
| `ohm-14` / 14 Ω                           | `confirm-ohm-relation`   | `add`                | `divide`                                          | `ohm-find-resistance`           |
| `energy-high-power` / Daya lebih besar    | `confirm-power-time`     | `power-reversed`     | `power-times-time`                                | `energy-joules`                 |
| `energy-equal` / Semua selalu sama        | `confirm-power-time`     | `ignore-power`       | `power-times-time`                                | `energy-joules`                 |
| `energy-long-cable` / Kabel lebih panjang | `confirm-power-time`     | `cable-only`         | `power-times-time`                                | `energy-duration`               |
| `rooms-series-main` / Seri, satu sakelar  | `confirm-room-control`   | `series-independent` | `branch-switch`                                   | `paths-series-break`            |
| `rooms-no-switch` / Paralel tanpa sakelar | `confirm-room-control`   | `branches-alone`     | `branch-switch`                                   | `switches-one-room`             |
| `rooms-single-series` / Satu cabang seri  | `confirm-room-control`   | `series-independent` | `branch-switch`                                   | `paths-series-break`            |

## Pertanyaan, respons, feedback, dan latihan

Teks pilihan lengkap serta feedback aktual terdapat pada [data konfirmasi](../src/data/confirmations.ts). Ringkasan 25 aturan aktif:

| Konfirmasi / pertanyaan                                           | Respons              | Arah feedback aktual                                                                           | ID latihan              |
| ----------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| `confirm-component-role`: alasan menentukan sumber beda potensial | `battery-source`     | Bedakan sumber/penghantar/beban/sakelar, cocokkan lagi pilihan soal.                           | `components-source`     |
| Sama                                                              | `wire-source`        | Kabel penghantar; baterai sumber beda potensial.                                               | `components-source`     |
| Sama                                                              | `lamp-source`        | Cahaya merupakan perubahan energi pada beban, bukan fungsi sumber.                             | `components-source`     |
| Sama                                                              | `switch-source`      | Pengendali jalur tidak menggantikan sumber; periksa kelengkapan lintasan.                      | `components-gap`        |
| Sama                                                              | `unsure`             | Jelaskan peran keempat komponen secara netral.                                                 | `components-source`     |
| `confirm-current-paths`: alasan lampu lain tetap menyala          | `independent-path`   | Cocokkan jalur tertutup cabang mandiri dengan jenis susunan.                                   | `paths-series-break`    |
| Sama                                                              | `single-path-enough` | Jalur seri yang terbuka tidak lagi menyediakan lintasan tertutup.                              | `paths-series-break`    |
| Sama                                                              | `all-open`           | Bedakan satu cabang terbuka dan semua lintasan terbuka.                                        | `components-gap`        |
| Sama                                                              | `no-source-needed`   | Lampu tetap memerlukan sumber dan jalur tertutup.                                              | `components-source`     |
| Sama                                                              | `unsure`             | Telusuri jalur dari sumber melalui lampu dan kembali ke sumber.                                | `paths-series-break`    |
| `confirm-ohm-relation`: hubungan mencari R                        | `divide`             | Hubungan sudah sesuai; periksa 12 ÷ 2, V/A, dan pilihan yang dikirim.                          | `ohm-find-resistance`   |
| Sama                                                              | `multiply`           | Bagi kedua ruas dengan I; V × I menyatakan daya.                                               | `ohm-find-resistance`   |
| Sama                                                              | `subtract`           | Volt dan ampere tidak langsung dikurangkan menjadi ohm.                                        | `ohm-find-resistance`   |
| Sama                                                              | `add`                | Gunakan hubungan persamaan, bukan penjumlahan angka.                                           | `ohm-find-resistance`   |
| Sama                                                              | `unsure`             | Mulai dari V = I × R dan bagi dengan I bukan nol.                                              | `ohm-find-resistance`   |
| `confirm-power-time`: energi pada waktu sama                      | `power-times-time`   | Periksa arah perbandingan P dan E serta pilihan refleksi.                                      | `energy-joules`         |
| Sama                                                              | `power-reversed`     | Pada t tetap, P lebih besar menghasilkan E lebih besar.                                        | `energy-joules`         |
| Sama                                                              | `ignore-power`       | Waktu sama tidak berarti energi sama jika P berbeda.                                           | `energy-joules`         |
| Sama                                                              | `cable-only`         | Panjang kabel saja tidak cukup; pakai P dan t eksplisit. Latihan bukan perhitungan rugi kabel. | `energy-duration`       |
| Sama                                                              | `unsure`             | Jelaskan E = P × t, detik untuk J dan jam untuk Wh.                                            | `energy-joules`         |
| `confirm-room-control`: mematikan satu ruang                      | `branch-switch`      | Cocokkan sakelar cabang mandiri dengan pilihan rancangan.                                      | `switches-one-room`     |
| Sama                                                              | `series-independent` | Satu jalur seri tidak memberi kendali mandiri.                                                 | `paths-series-break`    |
| Sama                                                              | `branches-alone`     | Cabang terpisah perlu sakelar cabang untuk kendali melalui sakelar.                            | `switches-one-room`     |
| Sama                                                              | `main-only`          | Bedakan sakelar utama pada jalur bersama dan sakelar cabang.                                   | `switches-main-control` |
| Sama                                                              | `unsure`             | Telusuri cabang dan sakelar yang hanya memutus ruang itu.                                      | `switches-one-room`     |

Aturan memilih latihan berdasarkan hubungan pada respons, bukan sekadar kesamaan nomor misi. Karena itu beberapa respons misi 2/5 menawarkan latihan komponen atau seri. Bank lama dipakai sebagai latihan konsep umum. Keterbatasan cakupan disebut dalam feedback bila relevan, seperti latihan energi yang tidak membahas rugi kabel.

Klasifikasi internal adalah `supported`, `not-supported`, `uncertain`, atau `consistent`. Klasifikasi tidak disimpan sebagai label siswa dan tidak dipakai sebagai skor. Contoh penting: jawaban 24 Ω diikuti konfirmasi R = V ÷ I menghasilkan bantuan memeriksa pembagian/satuan, bukan tuduhan memakai perkalian. Jika konfirmasi R = V + I dipilih, bantuan membahas penjumlahan meskipun jawaban awalnya 24 Ω.

## Relevansi dan rekomendasi yang dapat ditelusuri

ID percobaan refleksi dibuat dengan UUID **hanya ketika jawaban dikirim**. Memilih jawaban, merender komponen, refresh, atau membuka latihan tidak membuat percobaan baru. Setiap pemilihan/perubahan dan pengiriman konfirmasi memperbarui ID revisi sehingga referensi sebelumnya tidak lagi cocok.

Mengubah pilihan refleksi membatalkan percobaan aktif beserta konfirmasi, termasuk bila siswa mengubah kembali ke pilihan awal tanpa mengirim. Saat jawaban baru dikirim, percobaan baru dimulai tanpa mewarisi alasan lama. Memilih alasan baru segera menghilangkan bantuan/rekomendasi lama sampai **Lihat bantuan dari alasan** ditekan. Mengubah tulisan bebas tidak memengaruhi aturan.

Referensi latihan memuat profil, misi, percobaan, revisi, pertanyaan, respons, aturan, latihan, dan versi. `resolveRecommendation` memeriksa ulang semuanya terhadap data konfirmasi terbaru serta jawaban pada draf eksperimen tersimpan. Data hilang, tidak cocok, rusak, atau versi tak dikenal menghasilkan fallback tanpa alasan rekomendasi khusus.

Latihan yang sudah memiliki sumber kedaluwarsa tetap dapat dikerjakan sebagai latihan umum. Alasan lama diganti dengan pesan netral; tidak diubah menjadi klaim pilihan fokus siswa. Memilih fokus atau soal lain secara manual menghapus sumber rekomendasi dan menggunakan alasan pilihan siswa. Referensi lama tidak diperbarui diam-diam menjadi rekomendasi baru.

Perubahan konfirmasi/draf dari tab lain memicu pemeriksaan ulang tampilan melalui event `storage`. Tidak ada sinkronisasi jawaban lengkap atau resolusi konflik untuk seluruh data aplikasi; penulisan terakhir tetap berlaku. Setiap pengiriman refleksi juga menyimpan pilihan yang benar-benar dikirim. Referensi tetap harus diperiksa ulang saat membuka latihan, bukan mempercayai salinan alasan yang tersimpan.

## Penyimpanan dan kompatibilitas

Kunci baru **`voltquest.feedback.v1`**, skema versi 1:

```text
version: 1
profiles:
  student:nama:
    ID misi:
      id: UUID percobaan refleksi terakhir
      revision: UUID revisi
      missionId
      answerId
      confirmationId
      draftResponseId: pilihan alasan sementara atau null
      responseId: pilihan alasan yang dikirim atau null
      valid: apakah konteks masih aktif
      ruleVersion: 1
```

Data menyimpan satu percobaan terakhir per profil/misi, bukan log aktivitas lengkap. Tidak ada label kemampuan, tulisan bebas tambahan, durasi tab, atau data kegiatan PhET. Feedback dan alasan latihan dihitung dari data aturan saat ini, bukan disimpan sebagai teks sumber kebenaran.

`voltquest.practice.v1` tetap versi 1 dengan tambahan **opsional** `source` pada profil latihan. Data lama tanpa field tersebut dibaca sebagai pilihan mandiri. Field berisi referensi terstruktur di atas; null berarti jalur manual. Rekaman latihan, jawaban pertama/terakhir, dan jumlah pengiriman dipertahankan. Membuka rekomendasi tidak mengirim jawaban atau menambah jumlah percobaan latihan.

Skema `voltquest.v1` dan `voltquest.experiments.v1` tidak berubah. Hash SHA-256 bank soal misi serta kedua hook lama tetap sama dengan sebelum tahap 5. Tidak ada reset progres atau migrasi destruktif. XP tetap maksimum 500, 100 sekali per misi; konfirmasi dan latihan tidak memberi hadiah tambahan.

Pembacaan memvalidasi bentuk, ID, versi aturan, kecocokan pertanyaan, dan respons sementara/terkirim. JSON rusak memunculkan pemberitahuan dan memungkinkan percobaan baru pada pengiriman berikutnya. Versi root tidak didukung tidak ditimpa. Kegagalan tulis menampilkan **Konfirmasi belum tersimpan di browser**, tanpa klaim tersimpan. Data memori dapat hilang saat misi dilepas, logout, atau refresh. Jika dependensi tersimpan tidak cukup untuk memvalidasi sumber, latihan manual tetap tersedia.

## Verifikasi dan bukti

Perintah:

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:e2e
npx.cmd playwright test tests/concept-feedback.spec.ts tests/guided-flow.spec.ts tests/voltquest.spec.ts
node scripts/audit-ui.mjs concept
```

Hasil:

- Build TypeScript/Vite dan lint lolos.
- **48 pengujian E2E lolos** pada suite lengkap: 32 pemeriksaan lama dan 16 pemeriksaan tahap 5 pada proyek desktop/mobile. Setelah penambahan pemeriksaan perubahan lintas tab serta penyimpanan pilihan saat pengiriman, **32 pemeriksaan terdampak lolos pada pengulangan terarah**.
- Pengujian aturan mencakup 15 pilihan salah, seluruh 100 kombinasi jawaban misi dan opsi konfirmasi, 25 ID aturan, referensi latihan, dan fallback saat pertanyaan/opsi/kunci tidak cocok.
- Pengujian interaksi mencakup respons pendukung/tidak mendukung/Belum yakin, perubahan pilihan lalu kembali tanpa mengirim, alasan baru, pemulihan setelah refresh/kembali dari latihan, manual mengganti sumber, dua profil, data rusak, versi tak dikenal, gagal simpan, serta perubahan sumber dari tab lain.
- Pengujian hadiah menuntaskan lima misi tanpa mewajibkan konfirmasi, memeriksa 500 XP dan lima badge, serta memastikan pengulangan tidak menggandakan XP. Riwayat latihan sebelumnya tetap sama ketika rekomendasi dibuka; percobaan tidak bertambah akibat refresh atau membuka soal.
- Kelima misi diperiksa melalui keyboard dan pada lebar **320, 390, 768, 1024, 1440px** tanpa overflow horizontal.
- Audit UI mengukur **225 keadaan/ukuran** tanpa temuan pada kontras teks/placeholder yang dicakup, target kontrol di bawah 44px, pemotongan teks, overflow horizontal, atau probe interaksi. Pembesaran teks 200% hanya mencakup dashboard.

Data mentah: [measurements.json](../artifacts/concept-feedback/readability/measurements.json). Pemeriksaan menggunakan Chrome terpasang dan context baru, termasuk emulasi iPhone melalui Chromium; tidak mengakses progres pribadi. Pemeriksaan ini bukan pengujian Safari/perangkat fisik, pembaca layar, sertifikasi aksesibilitas penuh, penelitian siswa, atau validasi psikometrik.

## Screenshot

Semua gambar memakai profil dan jawaban pengujian. Bukti tahap sebelumnya dipertahankan; keluaran regresi tahap 4/6 kini diarahkan ke subfolder tahap 5.

| Keadaan                            | Mobile                                                                                | Desktop                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Konfirmasi komponen                | [320px](../artifacts/concept-feedback/m1-confirmation-320.png)                        | [1440px](../artifacts/concept-feedback/m1-confirmation-1440.png)                        |
| Konfirmasi jalur arus              | [320px](../artifacts/concept-feedback/m2-confirmation-320.png)                        | [1440px](../artifacts/concept-feedback/m2-confirmation-1440.png)                        |
| Konfirmasi Hukum Ohm               | [320px](../artifacts/concept-feedback/m3-confirmation-320.png)                        | [1440px](../artifacts/concept-feedback/m3-confirmation-1440.png)                        |
| Konfirmasi energi                  | [320px](../artifacts/concept-feedback/m4-confirmation-320.png)                        | [1440px](../artifacts/concept-feedback/m4-confirmation-1440.png)                        |
| Konfirmasi kendali ruang           | [320px](../artifacts/concept-feedback/m5-confirmation-320.png)                        | [1440px](../artifacts/concept-feedback/m5-confirmation-1440.png)                        |
| Respons tidak mendukung dugaan     | [390px](../artifacts/concept-feedback/readability/390-confirmation-not-supported.png) | [1440px](../artifacts/concept-feedback/readability/1440-confirmation-not-supported.png) |
| Belum yakin                        | [390px](../artifacts/concept-feedback/readability/390-confirmation-unsure.png)        | [1440px](../artifacts/concept-feedback/readability/1440-confirmation-unsure.png)        |
| Sumber latihan dari konfirmasi Ohm | [390px](../artifacts/concept-feedback/readability/390-confirmation-m3-practice.png)   | [1440px](../artifacts/concept-feedback/readability/1440-confirmation-m3-practice.png)   |

## File dan keterbatasan

File baru: `src/data/confirmations.ts`, `src/data/feedbackRules.ts`, `src/data/feedbackStorage.ts`, `src/hooks/useConceptFeedback.ts`, `src/components/ConceptConfirmation.tsx`, `tests/concept-feedback.spec.ts`, dokumen ini, dan folder bukti `artifacts/concept-feedback/`.

File diperbarui: `src/App.tsx`, `src/App.css`, `src/components/MissionView.tsx`, `src/components/PracticeHub.tsx`, `src/hooks/usePractice.ts`, komentar `src/data/practiceSelection.ts`, skrip audit, lokasi screenshot pada dua suite lama, README, matriks pembeda, dan dokumentasi latihan. Tidak ada perubahan soal asli, bank sepuluh latihan, hook progres/draf lama, dependensi, atau konfigurasi Vite.

Konfirmasi merupakan respons pilihan siswa yang masih dapat ditebak atau tidak menggambarkan alasan sebenarnya. Aturan belum ditelaah bersama guru atau diuji bersama siswa; tidak ada klaim diagnosis atau peningkatan hasil belajar. Langkah berikutnya ialah telaah materi/aturan dan uji formatif, termasuk beban membaca konfirmasi di HP. Perancang penerangan interaktif tetap pekerjaan tahap 7.
