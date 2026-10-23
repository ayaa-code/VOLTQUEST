# Audit keterbacaan dan kenyamanan UI VoltQuest

Tanggal: 20 Oktober 2026. Cakupan: **tahap 3**. Perubahan mencakup tipografi, warna, kontrol, tata letak responsif, dan siklus fokus dialog. Identitas pastel, lima misi, alur utama, soal/kunci, XP, badge, dan penyimpanan lokal dipertahankan. Hasil di bawah adalah pemeriksaan teknis dan visual, belum hasil penelitian siswa.

## 1. Metode, bukti, dan batas pemeriksaan

- Audit kode mencakup [CSS dasar](../src/index.css), [CSS aplikasi](../src/App.css), [aplikasi](../src/App.tsx), [halaman misi](../src/components/MissionView.tsx), [komponen UI](../src/components/LearningUI.tsx), [dialog](../src/components/Dialog.tsx), serta [pengujian yang tersedia](../tests/voltquest.spec.ts). Arah produk mengikuti [dokumen tahap 2](product-differentiation.md).
- Browser audit: Chrome terpasang, headless, context terpisah untuk setiap lebar. Data demo: **Nara**, serta **Penjelajah Dengan Nama Panjang Sekali**. Context pengujian dibuat dari awal dan ditutup sesudahnya; tidak membuka profil browser pribadi atau menghapus progres pengguna.
- Lebar audit: **320, 390, 768, 1024, dan 1440 CSS px**, masing-masing tinggi viewport 900 px. Ini pemeriksaan viewport Chrome, bukan pengujian perangkat fisik. Pengujian aplikasi terpisah juga memakai konfigurasi emulasi iPhone.
- Skrip [audit UI](../scripts/audit-ui.mjs) mencatat computed style, ukuran kontrol, warna, placeholder, overflow, dan interaksi untuk 18 kondisi pada setiap lebar: **90 sampel keadaan** sebelum dan sesudah. Sampel berulang bukan 90 peserta atau 90 halaman berbeda.
- Snapshot CSS asli disimpan sebelum implementasi. Pengukuran awal disempurnakan menggunakan CSS asli dalam context terpisah sebelum perubahan komponen dialog. Mode `before` kini menolak menimpa bukti awal. Gunakan `after` untuk pengukuran ulang; snapshot awal bukan rekaman seluruh sumber aplikasi yang dapat membekukan perubahan JavaScript berikutnya.
- Bukti awal: [pengukuran JSON](../artifacts/ui-readability/before/measurements.json), [CSS aplikasi asli](../artifacts/ui-readability/before/App.css), dan [CSS dasar asli](../artifacts/ui-readability/before/index.css).
- Bukti akhir: [pengukuran JSON](../artifacts/ui-readability/after/measurements.json). Rasio pada tabel dibulatkan untuk pelaporan; perbandingan ambang di skrip menggunakan nilai penuh.

Rasio dihitung dari luminans relatif sRGB: kanal dikonversi ke linear, lalu `L = 0.2126R + 0.7152G + 0.0722B`; rasio `(L_terang + 0.05) / (L_gelap + 0.05)`. Warna teks, background transparan, dan opacity kelompok dikompositkan dari elemen melalui leluhur ke latar. Ini pengukuran warna CSS, bukan perkiraan dari piksel screenshot atau hasil anti-aliasing font.

Target proyek mengikuti rasio teks biasa 4.5:1 dan teks besar 3:1 dalam [penjelasan W3C tentang kontras teks](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Ukuran besar pada skrip adalah minimal 24 px, atau sekitar 18.667 px dengan bobot setidaknya 700. Status dekoratif dan disabled dicatat terpisah. Batas kontrol/fokus penting diperiksa terhadap target 3:1 sesuai [penjelasan W3C tentang kontras nonteks](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Target sentuh proyek 44 × 44 CSS px selaras dengan [Target Size (Enhanced) W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html). Ini target desain yang dipilih, bukan pernyataan bahwa 44 px adalah syarat semua kontrol pada tingkat AA. Tautan inline di paragraf Tentang VoltQuest dicatat sebagai pengecualian area sentuh; tautannya tetap memiliki garis bawah dan fokus keyboard.

## 2. Temuan awal dan perbaikan

| Temuan awal                                                                       | Lokasi/keadaan                                                               | Perbaikan dan alasan                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instruksi lab 11 px; cerita 12 px; pilihan jawaban mobile 12 px.                  | Halaman misi, termasuk aturan breakpoint.                                    | Teks tugas utama 16 px dengan line-height 1.65. Ruang kartu menyesuaikan isi.                                                                                                           |
| Target belajar 11 px dan berwarna pucat pada lavender.                            | `.learning-target p`.                                                        | Teks 16 px dengan warna sekunder gelap agar sasaran aktivitas tetap mudah dibaca.                                                                                                       |
| Status misi 8 px pada mobile; metadata badge 7 px.                                | `.mission-status`, `.badge-item small`.                                      | Keterangan pendek 12 px; teks pendukung 14 px. Badge yang belum diraih tetap memiliki keterangan yang dapat dibaca.                                                                     |
| Beberapa media query menurunkan ukuran dan memaksa nowrap.                        | Hero, footer, kartu, dan heading mobile.                                     | CSS dikonsolidasikan menjadi aturan per peran dan breakpoint layout. Ukuran pendukung tidak diturunkan di mobile.                                                                       |
| Avatar 37 × 37 px; penutup dialog 36 × 36 px; filter setinggi sekitar 27 px.      | Header, dialog, dan dashboard.                                               | Area kontrol utama minimal 44 px; ikon boleh tetap lebih kecil.                                                                                                                         |
| Kontras beberapa teks berada di bawah target proyek.                              | Petunjuk salah/benar, target, placeholder, status, dan teks badge.           | Latar pastel dipertahankan, warna informasi digelapkan; opacity teks yang memperlemah keterbacaan dihapus.                                                                              |
| Pembesaran teks menimbulkan scroll horizontal dan hero terpotong pada 320/390 px. | Dashboard dengan teks diperbesar.                                            | Grid dengan `minmax(0,1fr)`, wrapping, header fleksibel, dan hero tanpa tumpang tindih.                                                                                                 |
| Tab dari kontrol terakhir tidak langsung kembali ke kontrol pertama dialog.       | Pemeriksaan batas fokus dialog; `document.activeElement` keluar dari dialog. | Penjagaan Tab/Shift+Tab ditambahkan. Escape, dialog native, dan pengembalian fokus tetap berlaku. Temuan probe ini bukan klaim pelanggaran menyeluruh terhadap perilaku browser native. |

## 3. Sistem tipografi

Root memakai `font-size: 100%`; pada context browser audit, ukuran default adalah 16 px. Token menggunakan rem agar mengikuti pengaturan dasar browser. Peran teks ditentukan sekali dan dipakai pada mobile maupun desktop.

| Peran/contoh         | Sebelum pada 390 px   | Sesudah pada 390 px    | Token/keputusan                                          |
| -------------------- | --------------------- | ---------------------- | -------------------------------------------------------- |
| Cerita misi          | 12 px                 | 16 px                  | `--font-body: 1rem`; line-height 1.65.                   |
| Target belajar       | 11 px                 | 16 px                  | Teks penting termasuk peran body.                        |
| Langkah eksperimen   | 11 px                 | 16 px                  | Nomor daftar tetap terlihat dan berjarak.                |
| Pertanyaan refleksi  | 14 px                 | 16 px                  | Bobot 650; lebar mengikuti kartu.                        |
| Pilihan jawaban      | 12 px                 | 16 px                  | Area label minimum 60 px tinggi, dapat membungkus.       |
| Feedback salah/benar | 11 px                 | 16 px                  | Penjelasan body; status memiliki teks, bukan warna saja. |
| Teks pendukung       | Banyak contoh 9–11 px | 14 px                  | `--font-secondary: 0.875rem`.                            |
| Status misi          | 8 px                  | 12 px                  | `--font-caption: 0.75rem`.                               |
| Metadata badge       | 7 px                  | 12 px                  | Tidak memakai opacity untuk melemahkan teks.             |
| Tombol onboarding    | 13 px                 | 16 px                  | Font body, tinggi minimum 48 px.                         |
| Input nama           | 16 px mobile          | 16 px pada semua lebar | Menjaga ukuran input konsisten.                          |

Judul utama memakai rentang sekitar 26–36 px sesuai peran dan breakpoint. Logo merupakan identitas visual dengan ukuran tersendiri. Simbol dekoratif seperti bintang dan titik bukan informasi pembelajaran dan tidak dijadikan dasar kelulusan teks. Pemeriksaan akhir tidak menemukan teks nondekoratif di bawah 12 px pada sampel yang dicatat.

## 4. Warna dan rasio kontras

Contoh berikut berasal dari computed style pada viewport 390 px. Untuk status misi, opacity lama ikut diperhitungkan. Rasio adalah teks terhadap latar, bukan ukuran peningkatan hasil belajar.

| Elemen                 | Warna/latar sebelum                 | Rasio sebelum | Warna/latar sesudah   | Rasio sesudah |
| ---------------------- | ----------------------------------- | ------------: | --------------------- | ------------: |
| Cerita dan langkah lab | `#8e8198` / `#ffffff`               |        3.66:1 | `#665c74` / `#ffffff` |        6.27:1 |
| Target belajar         | `#9b8aa8` / `#f6f2fb`               |        2.88:1 | `#665c74` / `#f6f2fb` |        5.68:1 |
| Pilihan jawaban biasa  | `#8a7b97` / `#ffffff`               |        3.92:1 | `#665c74` / `#ffffff` |        6.27:1 |
| Feedback salah         | `#b1955e` / `#fff6e6`               |        2.67:1 | `#76541d` / `#fff6e6` |        6.41:1 |
| Feedback benar         | `#6c9378` / `#edf6ee`               |        3.13:1 | `#326746` / `#edf6ee` |        6.01:1 |
| Status lavender        | `#9171bb`, opacity 0.85 / `#eee7fa` |        2.68:1 | `#715094` / `#eee7fa` |        5.32:1 |
| Status mint            | `#5d9a8d`, opacity 0.85 / `#e4f2ef` |        2.36:1 | `#326d5f` / `#e4f2ef` |        5.23:1 |
| Status kuning          | `#b59343`, opacity 0.85 / `#fbf1d9` |        2.20:1 | `#78591d` / `#fbf1d9` |        5.76:1 |
| Status coral           | `#c3867b`, opacity 0.85 / `#fbe9e5` |        2.18:1 | `#8e4f45` / `#fbe9e5` |        5.33:1 |
| Status biru            | `#7a90bb`, opacity 0.85 / `#e7edf9` |        2.30:1 | `#4d6190` / `#e7edf9` |        5.21:1 |
| Tombol utama normal    | `#ffffff` / `#7e62bd`               |        4.81:1 | `#ffffff` / `#7050aa` |        6.15:1 |
| Tombol utama hover     | `#ffffff` / `#6e52ad`               |        6.05:1 | `#ffffff` / `#5f3b96` |        8.23:1 |

Keadaan tambahan yang diperiksa:

- Placeholder akhir: rasio minimum sekitar **5.40:1** pada sampel yang dicatat; sebelumnya minimum sekitar 2.48:1.
- Teks tombol disabled akhir: `#655c70` pada `#e8e2ef`, sekitar **4.99:1**. Kontrol tetap disabled secara native; pengecualian standar untuk komponen nonaktif tidak dipakai untuk membenarkan teks yang sulit dibaca.
- Batas input `#8b7a9f` terhadap putih: **3.90:1**.
- Outline fokus `#644096` terhadap putih: **7.73:1**, dan terhadap lavender hero `#eee8fa`: **6.47:1**. Ketebalan outline 3 px dengan offset.
- Border pilihan terpilih `#7050aa` terhadap `#f1e9fb`: **5.21:1**. Pilihan juga memakai radio native, huruf pilihan, dan ikon centang.
- Isi progress bar `#8260b3` terhadap track `#eee7f5`: **4.07:1**; jumlah misi tetap tersedia sebagai teks.

Background image/gradient tidak disimpulkan otomatis oleh skrip. Teks luar kartu onboarding diperiksa tambahan memakai batas warna konservatif: komponen kanal tergelap dari latar `#eee8fb`, `#e5f0fa`, dan `#f8f7fc`, ditambah titik `#b8aec8` dengan alpha `64/255`, menghasilkan latar batas sekitar RGB(217.71, 217.44, 237.45). Teks `#665c74` terhadap batas ini sekitar **4.53:1**. Ini batas analitis untuk palet tersebut, bukan pembacaan piksel setiap titik gradient. Teks di kartu putih menggunakan latar opaque sehingga tidak bergantung pada gradient luar.

Pemeriksaan otomatis akhir melaporkan nol kegagalan rasio pada teks yang dapat diukur, nol placeholder di bawah target, dan nol target kontrol utama di bawah 44 px. Angka ini hanya berlaku pada sampel, model warna, dan pengecualian yang dijelaskan; bukan sertifikasi seluruh WCAG.

## 5. Kontrol, keyboard, dan dialog

| Kontrol         | Sebelum                          | Sesudah                   | Pemeriksaan                                                                                            |
| --------------- | -------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Avatar profil   | 37 × 37 px                       | 44 × 44 px                | Semua lebar audit.                                                                                     |
| Tutup dialog    | 36 × 36 px                       | 44 × 44 px                | Dapat diklik setelah dialog Tentang digulir ke bawah.                                                  |
| Filter misi     | Tinggi sekitar 27 px             | Minimal 44 px             | Label dapat membungkus; status aktif memiliki border, bobot teks, serta `aria-pressed` yang sudah ada. |
| Hapus pencarian | Ikon dengan area kecil           | 44 × 44 px                | Muncul ketika input berisi teks.                                                                       |
| Tombol kembali  | Tinggi sekitar 34 px             | Minimal 44 px             | Fokus terlihat dan label tetap tersedia.                                                               |
| Navigasi mobile | Tinggi 42 px                     | Minimal 52 px             | Empat kolom; teks 12 px; konten footer dapat digulir hingga bebas dari navigasi.                       |
| Pilihan jawaban | Tinggi sekitar 51 px, teks 12 px | Minimal 60 px, teks 16 px | Space memilih; panah berpindah pilihan; outline terlihat pada label.                                   |

Perbaikan dialog terbatas pada penjagaan batas Tab/Shift+Tab dan CSS heading sticky. Tidak menambahkan peran ARIA pengganti elemen native. Escape masih menutup dialog, dan fokus kembali ke pemicu. Dua assertion batas fokus ditambahkan ke pengujian dialog yang sudah ada karena perilaku ini belum tercakup sebelumnya.

Pada seluruh lima lebar, probe akhir mencatat pemilihan radio melalui keyboard, fokus berputar maju/mundur di dalam dialog, pemulihan fokus, tombol footer bebas dari navigasi, serta tombol tutup tetap di dalam area dialog setelah pengguliran. Pemeriksaan ini tidak menggantikan evaluasi pembaca layar atau keyboard pada semua browser.

## 6. Layout, keadaan UI, dan pembesaran teks

Keadaan yang dicatat: onboarding normal/hover/fokus, kode kelas beserta pemberitahuan, form nama, dashboard nama pendek, pencarian aktif, filter kosong, misi, jawaban terpilih/fokus, feedback salah, feedback benar, badge, progres, profil, Tentang VoltQuest, dashboard nama panjang, serta dashboard dengan pembesaran teks.

| Lebar   | Grid misi                           | Hasil sampel layout akhir                                       | Interaksi keyboard/dialog | Pembesaran teks dashboard      |
| ------- | ----------------------------------- | --------------------------------------------------------------- | ------------------------- | ------------------------------ |
| 320 px  | Dua kolom; final melebar dua kolom  | Tidak ada scroll horizontal atau teks terpotong yang terdeteksi | Lolos probe               | 200% tanpa overflow terdeteksi |
| 390 px  | Dua kolom; final melebar dua kolom  | Tidak ada scroll horizontal atau teks terpotong yang terdeteksi | Lolos probe               | 200% tanpa overflow terdeteksi |
| 768 px  | Tiga kolom; final melebar dua kolom | Tidak ada scroll horizontal atau teks terpotong yang terdeteksi | Lolos probe               | 200% tanpa overflow terdeteksi |
| 1024 px | Tiga kolom; final melebar dua kolom | Tidak ada scroll horizontal atau teks terpotong yang terdeteksi | Lolos probe               | 200% tanpa overflow terdeteksi |
| 1440 px | Lima kolom                          | Tidak ada scroll horizontal atau teks terpotong yang terdeteksi | Lolos probe               | 200% tanpa overflow terdeteksi |

Keputusan layout: pada mobile, ilustrasi hero ditempatkan setelah teks agar tidak bertumpuk; tablet memakai tiga kolom; desktop lebar tetap lima kartu. Tinggi kartu minimum tidak membatasi pertambahan isi. Header dapat membungkus, nama panjang dapat dipatahkan, badge mobile memakai dua kolom, dan dialog memiliki tinggi maksimum dengan scroll. Padding akhir halaman menyediakan ruang navigasi bawah dan safe-area.

**Metode 200%:** pada context audit, computed font-size setiap elemen non-SVG dibaca lalu diatur menjadi dua kali nilai tersebut; viewport tetap sama. Ini simulasi pembesaran teks melalui CSS pada dashboard, bukan browser zoom 200%, bukan perubahan viewport, dan bukan pengujian pembesaran seluruh halaman aplikasi. Zoom browser nyata serta pengaturan teks OS belum diperiksa. Sebelum perbaikan, probe yang sama mendeteksi overflow/teks hero terpotong pada 320 dan 390 px; sesudahnya tidak terdeteksi pada lima lebar.

Pemeriksaan visual dilakukan pada screenshot onboarding, dashboard mobile/desktop, halaman misi, dan dialog Tentang sesudah perubahan. Temuan visual: teks memiliki hierarki lebih jelas, ilustrasi terpisah dari teks mobile, dan pilihan jawaban tidak terpotong. Ini penilaian visual pengembang; kenyamanan siswa masih hipotesis untuk uji pengguna.

## 7. Bukti screenshot

Screenshot penuh direkam pada lebar 390 dan 1440 px untuk 18 keadaan: 36 PNG awal dan 36 PNG akhir, ditambah dua screenshot viewport dialog akhir setelah digulir. Nama serta profil demo konsisten pada keadaan yang dibandingkan.

| Tampilan                 | Sebelum                                                            | Sesudah                                                           |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Onboarding mobile        | [390 px](../artifacts/ui-readability/before/390-onboarding.png)    | [390 px](../artifacts/ui-readability/after/390-onboarding.png)    |
| Dashboard mobile         | [390 px](../artifacts/ui-readability/before/390-dashboard.png)     | [390 px](../artifacts/ui-readability/after/390-dashboard.png)     |
| Dashboard desktop        | [1440 px](../artifacts/ui-readability/before/1440-dashboard.png)   | [1440 px](../artifacts/ui-readability/after/1440-dashboard.png)   |
| Detail misi mobile       | [390 px](../artifacts/ui-readability/before/390-mission.png)       | [390 px](../artifacts/ui-readability/after/390-mission.png)       |
| Badge mobile             | [390 px](../artifacts/ui-readability/before/390-badges-dialog.png) | [390 px](../artifacts/ui-readability/after/390-badges-dialog.png) |
| Tentang VoltQuest mobile | [390 px](../artifacts/ui-readability/before/390-about-dialog.png)  | [390 px](../artifacts/ui-readability/after/390-about-dialog.png)  |

Tambahan: [dialog setelah digulir, viewport 390 px](../artifacts/ui-readability/after/390-about-dialog-scrolled-viewport.png). Pada screenshot full-page, elemen fixed/backdrop ditempatkan berdasarkan posisi viewport ketika gambar direkam; letaknya pada gambar panjang tidak mewakili satu viewport ponsel sekaligus.

## 8. Validasi dan perubahan file

| Pemeriksaan                                                | Hasil akhir                                                                                                                                           |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run build`                                        | Berhasil, termasuk TypeScript dan build produksi Vite.                                                                                                |
| `npm.cmd run lint`                                         | Berhasil tanpa peringatan.                                                                                                                            |
| `$env:PLAYWRIGHT_CHANNEL = 'chrome'; npm.cmd run test:e2e` | Enam pengujian desktop/mobile lolos, termasuk assertion baru siklus Tab/Shift+Tab.                                                                    |
| `node scripts/audit-ui.mjs after`                          | Berhasil; 90 sampel, tidak ada kegagalan otomatis pada rasio teks terukur, placeholder, target sentuh, overflow, clipping teks, atau probe interaksi. |

Rerun audit memerlukan dev server aktif di `http://127.0.0.1:5173/` dan Chrome terpasang, atau channel browser lain yang tersedia melalui `PLAYWRIGHT_CHANNEL`. Setiap run membuat context pengujian baru. Mode `after` memperbarui bukti akhir; mode `before` menolak menimpa bukti awal yang sudah ada.

File produk yang diubah: `src/index.css`, `src/App.css`, dan `src/components/Dialog.tsx`. File pendukung: `tests/voltquest.spec.ts`, `scripts/audit-ui.mjs`, dokumen audit ini, serta tautannya di README. Tidak ada dependensi baru. Tidak ada perubahan data misi, jawaban, mekanisme hadiah, skema localStorage, login demo, URL PhET, atau konfigurasi Vite.

## 9. Keterbatasan dan tindak lanjut

- Belum diuji pada Android/iPhone fisik, Safari, pembaca layar, forced colors, atau preferensi teks OS. Safe-area menggunakan CSS environment variable, tetapi inset perangkat nyata belum diverifikasi.
- Pemeriksaan warna berbasis model komposit CSS pada latar solid. Gradient luar diperiksa dengan batas konservatif terpisah; ilustrasi dekoratif dan seluruh kombinasi piksel tidak diaudit sebagai informasi pembelajaran.
- Sampel misi interaksi utama memakai Misi 01. Pengujian end-to-end menuntaskan kelima misi, tetapi audit warna/UI rinci belum mencakup setiap kemungkinan string, perangkat, bahasa, dan konfigurasi browser.
- Pembesaran 200% terbatas pada dashboard dengan metode yang dijelaskan. Jangan menyebutnya lulus seluruh kriteria resize/reflow atau kepatuhan WCAG penuh.
- Label pendek 12 px dipertahankan untuk metadata; perlu ditanyakan kepada siswa apakah ukuran tersebut masih nyaman pada HP mereka. Memperbesar hero dan teks menambah panjang halaman mobile; tradeoff ini juga perlu diuji.
- Perbaikan teknis tidak membuktikan peningkatan pemahaman fisika, kepuasan siswa, atau keunggulan lomba. Langkah berikutnya adalah uji keterbacaan dan penyelesaian tugas bersama pengguna sasaran, kemudian iterasi berdasarkan temuan nyata.
