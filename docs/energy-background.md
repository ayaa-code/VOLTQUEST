# Latar rangkaian VoltQuest

> Arsip revisi latar. Pengguna kemudian memilih susunan tengah logo → judul → animasi → login dengan gerak lebih terlihat. Versi berjalan dijelaskan di [energy-centered.md](energy-centered.md).

Revisi 23 Oktober 2026 berdasarkan arahan pengguna: rangkaian menjadi latar onboarding, dengan baterai dan lampu selalu terlihat serta sakelar membuka–menutup. Seluruh perhitungan titik tersebar, bentuk sinusoidal, dan transformasi menuju rangkaian telah dihapus. Komposisi dan simbol merupakan karya lokal VoltQuest, tanpa mengambil kode atau aset situs referensi.

## Tampilan

`EnergyCircuitAnimation` dipasang langsung di dalam `.onboarding`, di luar kartu login. SVG menjadi lapisan absolut dengan warna pastel beropasitas rendah. Pada desktop, rangkaian besar sedikit dimiringkan di latar sebelah kiri dan kartu masuk di sebelah kanan. Pada layar di bawah 1000px, rangkaian berada di latar bagian atas dan kartu tetap di tengah. Tidak ada bingkai ilustrasi tersendiri. Kartu putih menjaga teks dan form tetap jelas.

Struktur rangkaian tetap sepanjang siklus **10 detik**:

| Waktu | Perilaku |
| --- | --- |
| 0–1,8 detik | Sakelar terbuka, lampu padam. |
| 1,8–2,6 detik | Sakelar bergerak menutup. |
| 2,7–3,4 detik | Lampu menyala lembut setelah kontak tertutup. |
| 3,4–6,6 detik | Lampu menyala dan aksen cahaya bergerak perlahan pada kabel. |
| 6,6–7,3 detik | Cahaya meredup hingga padam. |
| 7,4–8,2 detik | Sakelar membuka. |
| 8,2–10 detik | Rangkaian terbuka bertahan, lalu siklus berulang. |

Ilustrasi tetap dekoratif; tidak menyatakan nilai listrik atau pergerakan elektron yang terukur. Dashboard menggunakan ilustrasi sebelumnya. Misi, soal, XP, draf, profil, dan skema penyimpanan tidak diubah.

## Aksesibilitas dan lifecycle

Kontrol jeda/putar berada di pojok atas halaman dengan tinggi 44px, fokus terlihat, dan dukungan keyboard. SVG memakai `aria-hidden` serta `pointer-events: none`. Reduced motion, termasuk perubahan ketika halaman terbuka, menampilkan rangkaian statis tertutup tanpa loop animasi. Loop berhenti saat tab tersembunyi, SVG keluar viewport, atau komponen unmount setelah masuk. Cleanup serta ID gradient unik dipertahankan dari versi pertama.

## Pemeriksaan revisi

- Build dan lint lulus.
- **14 pengujian lulus**: pengujian animasi dan regresi perjalanan pengguna, masing-masing pada Chromium desktop serta emulasi iPhone 13. Mencakup jeda keyboard, reduced motion, listener/loop cleanup, visibility, scroll keluar viewport, form nama, lima misi, penyimpanan profil, XP tanpa duplikasi, pencarian, serta dialog.
- Onboarding dan form diperiksa pada lebar **320, 390, 768, 1024, dan 1440px**. Pemeriksaan menilai overflow, akses teks di atas lapisan latar, serta ukuran kontrol.
- Audit merekam fase terbuka, tertutup/menyala, membuka, reduced motion, dan form pada kelima lebar. Timeline memeriksa bahwa cahaya tidak muncul ketika kontak sakelar terbuka.
- Pengujian animasi dan audit memakai font fallback proyek dengan permintaan Google Fonts dinonaktifkan pada konteks uji. Hasil tanpa error aplikasi tidak mencakup keberhasilan jaringan font eksternal.

| Bukti terbaru | Tautan |
| --- | --- |
| Desktop: sakelar terbuka | [Screenshot](../artifacts/energy-background/open-1440.png) |
| Desktop: lampu menyala | [Screenshot](../artifacts/energy-background/closed-1440.png) |
| Ponsel: lampu menyala | [Screenshot](../artifacts/energy-background/closed-390.png) |
| Ponsel: form nama | [Screenshot](../artifacts/energy-background/name-form-390.png) |
| Reduced motion | [Screenshot](../artifacts/energy-background/reduced-motion-1440.png) |
| Siklus gerakan | [Rekaman WebM](../artifacts/energy-background/one-cycle-desktop.webm) |
| Hasil audit | [JSON](../artifacts/energy-background/measurements.json) |

Bukti versi pertama tetap berada di `artifacts/energy-animation/`; seluruh bukti revisi ini terpisah di `artifacts/energy-background/`.

Perintah pengulangan:

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
npx.cmd playwright test tests/energy-animation.spec.ts tests/voltquest.spec.ts --workers=2
$env:PLAYWRIGHT_BROWSERS_PATH=Join-Path $PWD 'tmp/playwright-media'
node scripts/audit-energy-animation.mjs
```

Belum diuji di ponsel fisik atau Safari/Firefox. Visibility diuji dengan event/properti pada halaman uji; scroll keluar viewport memakai scroll browser nyata. Rekaman dan interval frame dari komputer audit bukan jaminan performa pada semua perangkat. Suite lengkap 56 pengujian merupakan hasil versi sebelumnya; revisi ini menjalankan ulang 14 pengujian yang relevan.
