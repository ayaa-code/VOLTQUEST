# Tahap 4 — Alur eksperimen terpandu

Implementasi dan pemeriksaan teknis: 20 Oktober 2026. Ini catatan implementasi aplikasi, bukan hasil penelitian siswa atau bukti peningkatan hasil belajar.

## Sebelum dan sesudah

Sebelumnya, briefing, tiga langkah lab, dan satu soal refleksi tampil dalam satu halaman. Pilihan jawaban berada di memori komponen dan hilang setelah refresh atau kembali ke dashboard. Penyimpanan hanya mencakup profil, misi selesai, dan pembukaan tautan lab.

Sekarang kelima misi memiliki alur **masalah sekolah → prediksi → eksperimen → pengamatan → refleksi**. Briefing serta target tetap menjadi pengantar. Panel hanya menampilkan satu langkah kegiatan agar instruksi dan isian tidak menumpuk.

| Langkah    | Kemampuan aktual                                                                                       | Batas                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Prediksi   | Pilihan singkat, “Belum yakin”, alasan opsional; respons awal dicatat saat pertama melanjutkan.        | Tidak dinilai benar/salah atau diberi XP. Tidak ada penilaian tulisan. |
| Eksperimen | Pertanyaan, komponen, tindakan, variabel yang diubah/dipertahankan, serta hasil yang perlu dicatat.    | Kegiatan dilakukan di laboratorium eksternal; tidak dibaca aplikasi.   |
| Pengamatan | Isian manual sesuai misi dan perbandingan tertulis dengan prediksi. Validasi kelengkapan serta format. | Tidak mencocokkan hasil ideal atau menyimpulkan miskonsepsi.           |
| Refleksi   | Ringkasan prediksi/catatan, soal dan feedback asli, alasan opsional tersimpan.                         | Hanya pilihan ganda dinilai terhadap kunci; tulisan tidak dinilai.     |

## Navigasi dan kejujuran urutan

Indikator langkah berupa empat tombol dengan `aria-current="step"`. Siswa perlu memilih prediksi, termasuk “Belum yakin”, sebelum berpindah ke langkah lain. Sesudah itu, semua langkah dapat dikunjungi kembali. Mengunjungi langkah tidak menandainya sebagai kegiatan selesai.

Perpindahan memindahkan fokus keyboard ke judul panel. Tombol kembali tersedia pada eksperimen, pengamatan, refleksi, serta dashboard. Isian tersimpan langsung pada perubahan. Membuka kembali kartu misi melanjutkan langkah draf terakhir. Hash URL `#misi-1` hingga `#misi-5` mempertahankan misi saat refresh; ini memakai `replaceState`, bukan riwayat router bertingkat.

Prediksi awal dan alasannya disalin ketika siswa pertama meninggalkan langkah prediksi. Perubahan berikutnya hanya mengubah prediksi sekarang. Ringkasan menampilkan respons awal dan pembaruan bila berbeda. Ini bukan rekaman waktu eksperimen; aplikasi tidak mengetahui kapan siswa benar-benar mencoba di PhET.

Siswa boleh langsung membuka refleksi melalui indikator setelah memilih prediksi, atau memilih **Lanjut tanpa pengamatan** dari formulir. Ringkasan menampilkan **Belum mencatat pengamatan**. Isian parsial tetap draf dan tidak ditampilkan sebagai catatan lengkap. Tidak ada data contoh yang diisi otomatis. Status catatan lengkap hanya berarti isian memenuhi validasi formulir, bukan eksperimen telah dilakukan atau hasilnya benar.

## Panduan dan isian kelima misi

| Misi                       | Perbandingan dan kontrol                                                                                                                    | Isian manual                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1 — Komponen Rangkaian     | Buka/tutup sakelar pada baterai, lampu, dan kabel yang sama.                                                                                | Keadaan lampu pada kedua posisi; boleh “Belum dapat menentukan”.                  |
| 2 — Seri dan Paralel       | Dua lampu dan baterai yang sama; uji pelepasan satu lampu pada susunan seri lalu paralel.                                                   | Keadaan lampu lain sebelum/sesudah pelepasan pada masing-masing susunan.          |
| 3 — Hukum Ohm              | Dua tegangan sumber yang dipilih siswa; resistor ohmik dan susunan tetap. Ukur V pada resistor serta I yang melewatinya.                    | Hambatan tetap (Ω), tegangan (V) serta arus (A) kondisi A dan B.                  |
| 4 — Daya Listrik           | Dua beban resistif diuji bergantian pada sumber yang sama. Durasi penggunaan sama dan eksplisit; V/I diasumsikan konstan selama durasi itu. | V/I beban A dan B serta durasi dalam detik. P = V × I dalam W; E = P × t dalam J. |
| 5 — Sekolah Tangguh Energi | Tiga cabang paralel, lampu dan sakelar masing-masing. Tutup kembali semua sakelar sebelum menguji cabang berikutnya.                        | Ruang yang keadaan lampunya berubah saat masing-masing sakelar dibuka.            |

Semua misi menyediakan “Apa yang berbeda dari prediksimu?” sebagai tulisan opsional. Hasil yang tidak sesuai perkiraan tetap boleh dicatat. Misi 5 masih panduan untuk PhET dan formulir, bukan perancang penerangan interaktif di VoltQuest. Paralel memberi kendali cabang; penghematan energi perlu asumsi daya dan waktu, bukan susunan semata. Perbandingan energi misi 4 tidak membuktikan efisiensi atau kesetaraan fungsi penerangan.

Kolom angka menyimpan **teks mentah**, sehingga kosong tidak diubah menjadi nol. Angka nol sah untuk V, I, dan durasi; hambatan harus lebih dari nol. Titik atau koma desimal diterima, misalnya `0,5`. Satuan ditetapkan pada label; mA harus dikonversi ke A oleh siswa. Format bertanda minus, eksponen, satuan yang diketik ke kolom angka, pemisah ribuan, serta beberapa pemisah desimal tidak diterima. Ini validasi format/besar besaran, bukan pemeriksaan kebenaran fisika. Nilai dua tegangan yang sama tidak ditolak sebagai laporan pengamatan, meskipun panduan meminta dua kondisi berbeda.

Misi 4 menghitung P/E hanya jika input yang diperlukan valid; nol ditampilkan sebagai nol dan kolom kosong menampilkan “Belum dapat dihitung”. Labelnya **Dihitung dari data yang kamu masukkan**. Durasi merupakan asumsi penggunaan siswa, bukan waktu yang dibaca dari simulasi. Soal refleksi memiliki data sendiri; angka dalam soal tidak mengganti catatan eksperimen.

## PhET dan penilaian

URL yang sudah dipakai proyek dipertahankan. Tautan membuka tab baru dengan `target="_blank"` dan `rel="noopener noreferrer"`. Siswa diminta kembali ke VoltQuest untuk mencatat. Indikator hanya berbunyi **Tautan laboratorium sudah dibuka.** Tidak menyatakan pemuatan berhasil, eksperimen selesai, atau hasil terverifikasi.

Laboratorium adalah [Circuit Construction Kit: DC oleh PhET Interactive Simulations, University of Colorado Boulder](https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc). Panduan memakai komponen rangkaian dan alat ukur; tidak menjanjikan preset atau rentang pengaturan tertentu. Tidak ada API atau pembacaan kegiatan otomatis. Pengujian tab meniru respons eksternal dan tidak menguji operasi laboratorium atau jaringan PhET sebenarnya.

Soal, pilihan, kunci, `mission.hint`, dan `mission.explanation` pada `src/data/missions.ts` dipertahankan. Seluruh jawaban salah pada misi yang sama tetap memperoleh petunjuk yang sama. Jawaban sesuai kunci memberi 100 XP sekali dan satu badge per misi, maksimum 500 XP. Draf, pembukaan tautan, prediksi, dan tulisan tidak memberi XP. Pengulangan tidak menggandakan XP. Penyelesaian tidak membuktikan penguasaan konsep.

## Penyimpanan dan kompatibilitas

`voltquest.v1` tetap menyimpan bentuk lama `{active, profiles}` dengan nama, `completed`, dan `visited`. Hook progres hanya mengekspor identitas aktif tambahan ke komponen; skema lama tidak diubah atau direset.

Penyimpanan baru terpisah di `voltquest.experiments.v1`:

```text
version: 1
profiles:
  student:nama:
    "1" hingga "5":
      step: 0..3
      prediction, predictionReason
      initialPrediction: {choice, reason} atau null
      observations: {idIsian: teksMentah}
      comparison
      observationStatus: draft | recorded | skipped
      reflectionReason
      answer: 0..3 atau null
```

Identitas memakai kunci aktif dari `useProgress`, dengan aturan nama lama: spasi dirapikan dan kapitalisasi tidak dibedakan. Dua nama berbeda memiliki draf terpisah. Ini profil demo lokal tanpa autentikasi; nama sama memakai profil sama. Perubahan ditulis sinkron pada setiap input/navigasi, termasuk sebelum membuka tab PhET. Penulisan membaca ulang penyimpanan terbaru agar draf misi/profil lain tidak tertimpa snapshot lama. Edit bersamaan pada misi yang sama belum memiliki resolusi konflik; penulisan terakhir berlaku.

Data dibaca dengan validasi bentuk, ID misi, langkah, opsi, panjang teks, dan status. Catatan berstatus lengkap dengan isian rusak diturunkan menjadi draf. JSON rusak memunculkan pemberitahuan dan memungkinkan draf baru pada perubahan berikutnya, tanpa menyentuh progres lama. Versi yang tidak dikenal **tidak ditimpa**; kegiatan masih dapat dilakukan di memori halaman misi dengan pemberitahuan. Tidak ada tombol reset.

Jika tulis gagal, aplikasi tidak menampilkan “Draf tersimpan”. Perubahan masih ada selama komponen misi terbuka, tetapi dapat hilang saat refresh, pindah misi, atau kembali ke dashboard. Feedback benar/salah dan penanda hadiah sesi tidak disimpan; pilihan serta alasan dipulihkan tanpa penilaian atau pemberian XP otomatis. Pengguna perlu mengirim jawaban lagi untuk memperoleh feedback.

Draf bergantung pada browser dan origin yang sama, termasuk port. Menghapus data situs menghapus draf/progres. Tidak ada sinkronisasi perangkat atau penyimpanan server.

## Bukti verifikasi

Pemeriksaan memakai Chrome terpasang melalui Playwright dengan context baru, tanpa profil pribadi pengguna. Perintah:

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:e2e
node scripts/audit-ui.mjs guided
```

Hasil teknis:

- Build TypeScript/Vite dan lint lolos.
- 16 pengujian E2E lolos pada desktop dan emulasi iPhone melalui Chromium. Mencakup alur lima misi, feedback, 500 XP tanpa duplikasi, badge, profil terpisah, draf setelah refresh/dashboard, perubahan prediksi awal, keyboard, kompatibilitas progres lama, JSON rusak, versi tidak dikenal, kegagalan tulis, jalur tanpa pengamatan, angka nol/kosong, koma desimal, serta perhitungan daya/energi.
- Seluruh empat langkah pada lima misi diperiksa pada lebar **320, 390, 768, 1024, dan 1440px** tanpa overflow horizontal.
- Audit tambahan mencatat **170 keadaan/ukuran**: tidak ditemukan kegagalan kontras teks yang diukur, target kontrol di bawah 44px, placeholder berkontras rendah, pemotongan teks oleh kontainer, atau overflow horizontal. Navigasi radio dan siklus/pemulihan fokus dialog lolos pada lima lebar. Pemeriksaan pembesaran teks 200% mencakup dashboard.

Data mentah: [measurements.json](../artifacts/guided-experiment/readability/measurements.json). Metode serta batas audit otomatis mengikuti [audit tahap 3](ui-readability-audit.md); ini bukan sertifikasi aksesibilitas lengkap. Browser Safari/Firefox, pembaca layar, dan siswa/guru belum diuji. Ukuran desktop/mobile merupakan emulasi, bukan pengujian perangkat fisik.

## Screenshot

Catatan tahap 6: screenshot E2E pada folder `artifacts/guided-experiment/` sempat diperbarui oleh pengujian regresi versi tahap 6, sehingga refleksi kini juga menampilkan akses latihan. Gambar tersebut bukan bukti bahwa fitur latihan sudah tersedia saat tahap 4. Hasil ukur 170 keadaan tetap catatan audit tahap 4. Keluaran screenshot regresi berikutnya dipisahkan ke `artifacts/practice-recommendations/regression-guided/`; lihat [catatan tahap 6](practice-recommendations.md).

Screenshot menggunakan profil uji dan keadaan awal/skip, bukan data eksperimen siswa sebenarnya. Bukti tahap 3 tetap dipertahankan. Contoh tahap 4:

| Tampilan                  | 320px                                                     | 1440px                                                      |
| ------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| Prediksi misi 1           | [Mobile](../artifacts/guided-experiment/m1-step1-320.png) | [Desktop](../artifacts/guided-experiment/m1-step1-1440.png) |
| Panduan eksperimen misi 1 | [Mobile](../artifacts/guided-experiment/m1-step2-320.png) | [Desktop](../artifacts/guided-experiment/m1-step2-1440.png) |
| Pengamatan misi 1         | [Mobile](../artifacts/guided-experiment/m1-step3-320.png) | [Desktop](../artifacts/guided-experiment/m1-step3-1440.png) |
| Refleksi tanpa catatan    | [Mobile](../artifacts/guided-experiment/m1-step4-320.png) | [Desktop](../artifacts/guided-experiment/m1-step4-1440.png) |
| Pengamatan Hukum Ohm      | [Mobile](../artifacts/guided-experiment/m3-step3-320.png) | [Desktop](../artifacts/guided-experiment/m3-step3-1440.png) |
| Pengamatan daya/energi    | [Mobile](../artifacts/guided-experiment/m4-step3-320.png) | [Desktop](../artifacts/guided-experiment/m4-step3-1440.png) |
| Pengamatan tiga ruang     | [Mobile](../artifacts/guided-experiment/m5-step3-320.png) | [Desktop](../artifacts/guided-experiment/m5-step3-1440.png) |

## File dan pekerjaan berikutnya

File baru: `src/data/experiments.ts`, `src/hooks/useExperimentDraft.ts`, `src/components/ObservationForm.tsx`, `tests/guided-flow.spec.ts`, dokumen ini, serta screenshot dan hasil ukur pada `artifacts/guided-experiment/`.

File diperbarui: `src/components/MissionView.tsx`, `src/App.tsx`, `src/App.css`, `src/hooks/useProgress.ts`, `tests/voltquest.spec.ts`, `scripts/audit-ui.mjs`, `README.md`, dan `docs/product-differentiation.md`. Dependensi, skema progres lama, data soal, dan mekanisme hadiah tetap.

Tahap 5 berikutnya perlu menelaah konfirmasi kesulitan, petunjuk berdasarkan respons terstruktur, dan latihan penguatan. Penilaian alasan bebas serta klaim diagnosis belum tersedia. Perancang penerangan interaktif tetap pekerjaan tahap 7. Uji formatif dengan siswa/guru dan telaah materi diperlukan sebelum menyatakan manfaat akademis atau efektivitas UX.
