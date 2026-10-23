# PhET di dalam misi dan tabel pengamatan

Implementasi 23 Oktober 2026. Siswa dapat menjalankan PhET dan mengisi hasil pengamatan di halaman VoltQuest yang sama. Tombol **Mulai simulasi di sini** memuat Circuit Construction Kit: DC melalui iframe resmi. Pada desktop dengan ruang cukup, simulasi di kiri dan panduan/tabel di kanan; pada layar kecil susunannya bertumpuk. Layar penuh dan tautan tab baru tersedia sebagai alternatif.

## Alur siswa

1. Pilih misi dan tulis prediksi.
2. Baca komponen, variabel, dan langkah percobaan. Klik **Mulai simulasi di sini** untuk menjalankan PhET.
3. Klik **Lanjut ke pengamatan** untuk membuka tabel. Iframe tetap terpasang sehingga susunan yang sedang dikerjakan tidak hilang ketika berpindah antara panduan dan tabel.
4. Baca hasil pada simulasi, isi seluruh sel yang diminta, lalu klik **Simpan pengamatan dan lanjut**.
5. Gunakan ringkasan catatan untuk menjawab refleksi dan melanjutkan misi.

| Misi | Bentuk tabel | Isian bersama |
| --- | --- | --- |
| 1. Komponen rangkaian | Sakelar terbuka/tertutup → keadaan lampu | Tidak ada |
| 2. Seri/paralel | Susunan seri/paralel → lampu lain sebelum dan setelah pelepasan | Tidak ada |
| 3. Hukum Ohm | Kondisi A/B → tegangan (V), arus (A) | Hambatan resistor tetap (Ω) |
| 4. Daya listrik | Beban A/B → tegangan (V), arus (A) | Durasi yang dipilih (detik), bukan pembacaan waktu PhET |
| 5. Kendali ruang | Sakelar ruang 1/2/3 dibuka → ruang yang berubah | Tidak ada |

Misi 4 tetap menghitung P = V × I serta E = P × t dari masukan siswa, dengan asumsi V dan I konstan. Angka kosong tidak menjadi nol. Nol, koma/titik desimal diterima sesuai format; hambatan harus lebih dari nol. Hasil yang berbeda dari teori atau perkiraan tetap boleh dicatat. Pilihan “Belum dapat menentukan” tetap merupakan pengamatan kualitatif yang valid. Validasi mengecek kelengkapan/format, bukan kebenaran hasil fisika.

## Pengamatan wajib dan kompatibilitas

Tombol **Lanjut tanpa pengamatan** dihapus. Langkah Refleksi tidak dapat dipilih sampai seluruh data valid dan siswa menyimpannya. Pembatasan juga berlaku saat memulihkan draf yang langsung menunjuk langkah 4. Mengosongkan/mengedit tabel menjadikannya draf kembali dan meminta penyimpanan ulang sebelum refleksi.

Field ID serta skema `voltquest.experiments.v1` tetap sama. Data lama dengan status `skipped`, hasil parsial, jawaban refleksi, atau alasan tertulis tidak dihapus. Bila draf lama menunjuk refleksi tanpa pengamatan lengkap, UI menampilkan tabel; data mentah tidak ditulis ulang hanya karena halaman dibuka. XP/badge yang sudah didapat tetap dipertahankan. Tidak ada perubahan soal/kunci, aturan konfirmasi, bank latihan, atau skema progres.

`useProgress.ts`, `useExperimentDraft.ts`, dan `missions.ts` memiliki hash yang sama sebelum dan sesudah perubahan ini. Profil tetap lokal per browser/origin; tidak menyinkronkan data ke guru atau perangkat lain. Kegagalan localStorage/versi draf tidak dikenal tetap mengikuti pemberitahuan lama.

## Batas integrasi PhET

PhET adalah karya **PhET Interactive Simulations, University of Colorado Boulder**. Penyematan mengikuti [dokumentasi resmi PhET](https://github.com/phetsims/phet-info/blob/main/doc/phet-development-overview.md#embedding-a-simulation-in-your-website). URL simulasi sebelumnya dipertahankan. Atribusi/link PhET tetap terlihat; tidak ada kode/aset simulasi disalin ke repository VoltQuest.

- Siswa mencatat sendiri hasil alat ukur; iframe tidak mengirim nilai pengamatan atau aktivitas ke VoltQuest.
- Iframe dipertahankan selama perpindahan Eksperimen ↔ Pengamatan. Refresh, kembali ke prediksi/refleksi/dashboard, atau keluar dari misi dapat mengulang simulasi. Isian tabel yang tersimpan tetap pulih.
- Status pernah dibuka berarti siswa meminta membuka laboratorium, bukan bukti simulasi berhasil dimuat atau percobaan selesai.
- Jika pemuatan lama, tampilkan bantuan koneksi dan tautan tab baru. Isi tabel tetap bisa diedit. `iframe.onload` tidak dianggap bukti aktivitas atau hasil percobaan.
- Layar penuh menggunakan API browser dengan kontrol keluar. Bila tidak tersedia/ditolak, tampilkan pesan dan alternatif tab baru.

## Aksesibilitas dan layout

Tabel menggunakan caption, header kolom/baris, label lengkap pada setiap input, pesan kesalahan terkait `aria-describedby`, serta fokus ke isian pertama yang belum valid. Label sel mencakup konteks, misalnya “Tegangan A (V)”. Region tabel dapat difokuskan dengan keyboard dan digeser tanpa memperlebar seluruh halaman. Ukuran input/kontrol sekurang-kurangnya 44px. Kolom pertama tidak dipotong per suku kata. Semua isian awal kosong, tanpa data contoh yang terlihat seperti hasil siswa.

Iframe memiliki judul aksesibel dan dimuat atas tindakan pengguna agar halaman/pengujian tidak otomatis memuat simulasi yang besar. Timeout dibersihkan ketika pemuatan selesai/unmount; listener layar penuh dibersihkan saat keluar. Tidak ada library/dependensi baru.

## Hasil verifikasi

- Build dan lint lulus.
- **64 pengujian lulus** pada Chromium desktop serta emulasi iPhone 13. Delapan pengujian baru memeriksa iframe tetap sama dan state percobaan terjaga saat berpindah panduan/tabel, kelengkapan wajib, draf lama, refresh, pembatalan akses refleksi setelah edit, hasil tidak ideal yang tetap diterima, pemuatan lambat, layar penuh/tidak didukung, dan lima ukuran layar.
- Suite lama diperbarui agar menyelesaikan pengamatan sebelum menguji refleksi. Fixture konfirmasi memakai pengamatan lengkap; pengujian terpisah tetap memastikan draf legacy yang dilewati tidak dapat membuka refleksi. Data contoh pengujian hanya berada dalam pengujian, tidak dimasukkan ke aplikasi.
- Pengujian integrasi memakai respons PhET tiruan agar deterministik. Screenshot `controlled-frame-*` secara jelas memuat simulasi uji, bukan PhET asli.
- Audit terpisah memuat URL **PhET asli** tanpa mock. Respons HTTP 200 dan tidak ada header X-Frame-Options/CSP yang melarang penyematan pada pemeriksaan ini. Layar awal simulasi berhasil dimuat; bukti dan hasil interaksi keyboard tersedia di JSON/screenshot audit.
- Lebar 320, 390, 768, 1024, dan 1440px tidak memperlihatkan overflow halaman. Tabel tetap dibatasi region tersendiri; pada layar sempit sebagian kolom perlu digeser.
- Audit tidak menemukan error aplikasi atau kegagalan permintaan jaringan. Permintaan font Google milik aplikasi dinonaktifkan pada konteks audit agar memakai font fallback.

| Bukti | Lokasi |
| --- | --- |
| PhET asli dan panduan | [Desktop](../artifacts/embedded-lab/real-phet-guide-1440.png) |
| PhET asli dan tabel | [Desktop](../artifacts/embedded-lab/real-phet-table-1440.png), [ponsel](../artifacts/embedded-lab/real-phet-table-390.png) |
| Tabel misi 1 | [Screenshot](../artifacts/embedded-lab/m1-empty-table-1440.png) |
| Tabel misi 2 | [Screenshot](../artifacts/embedded-lab/m2-empty-table-1440.png) |
| Tabel misi 4 | [Screenshot](../artifacts/embedded-lab/m4-empty-table-1440.png) |
| Tabel misi 5 | [Screenshot](../artifacts/embedded-lab/m5-empty-table-1440.png) |
| Audit jaringan dan ukuran layar | [JSON](../artifacts/embedded-lab/audit.json) |

Bukti regresi tersimpan di `artifacts/embedded-lab/regression/`, terpisah dari bukti tahap terdahulu. Ini audit teknis, bukan hasil eksperimen siswa, validasi pedagogis, atau pengujian akurasi fisika PhET. Belum diuji di Safari/Firefox, ponsel fisik, jaringan sekolah, atau pembaca layar nyata.

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:VOLTQUEST_ARTIFACT_ROOT='artifacts/embedded-lab/regression'
npm.cmd run test:e2e -- --workers=2
node scripts/audit-embedded-lab.mjs
```

File utama: `PhetLab.tsx` (penyematan/lifecycle), `ObservationForm.tsx` (tabel), `experiments.ts` (pemetaan dan validasi), `MissionView.tsx` (workbench dan akses refleksi), dan `App.css`. Dokumentasi serta pengujian diselaraskan dengan perilaku baru.
