# Onboarding tengah dengan animasi rangkaian

Revisi 23 Oktober 2026 mengikuti susunan pengguna: **logo VoltQuest → Mulai petualanganmu✦ → animasi → login**. Kartu kembali di tengah pada desktop maupun ponsel. Keterangan singkat produk tetap berada di bawah judul. Kontrol jeda ada tepat di bawah ilustrasi, sebelum tombol masuk. Animasi tidak menghalangi form dan tidak perlu ditunggu.

Gerak dibuat lebih terlihat daripada versi latar sebelumnya. Siklus 10 detik mencakup:

- Kabel tergambar bertahap selama 0,2–1,7 detik, dengan baterai masuk dari kiri dan lampu naik ke posisinya selama 1,5 detik awal.
- Seluruh rangkaian mengambang pelan hingga 7 unit SVG, lalu kembali. Bentuk kabel tetap rangkaian; tidak ada sinusoidal atau sebaran partikel.
- Sakelar menutup pada 1,8–2,6 detik. Cahaya baru muncul mulai 2,7 detik; aksen mint bergerak sepanjang kabel tertutup dan halo lampu membesar–mengecil perlahan.
- Cahaya padam sebelum sakelar membuka pada 7,4–8,2 detik. Rangkaian memudar pada detik 9–10, lalu terbentuk kembali. Transisi awal/akhir sama-sama transparan untuk menghindari lompatan visual.

SVG memakai satu requestAnimationFrame tanpa state React per frame. Jeda membekukan seluruh gerak, termasuk pembentukan kabel dan halo. Reduced motion menampilkan fase statis pada detik 4, tanpa loop. Visibility, keluar viewport, dan cleanup setelah login tetap ditangani. Ilustrasi dekoratif tidak mengklaim simulasi arus/elektron atau kecepatan fisik tertentu.

Perubahan utama berada di `src/App.tsx`, `src/App.css`, serta `src/components/EnergyCircuitAnimation.tsx` dan CSS-nya. Tidak ada perubahan soal, XP, profil, data belajar, atau dashboard. Pengujian layout diperbarui agar memeriksa urutan vertikal yang diminta pada lima lebar layar.

Bukti revisi tersimpan terpisah di `artifacts/energy-centered/`:

- [Desktop](../artifacts/energy-centered/closed-1440.png) dan [ponsel](../artifacts/energy-centered/closed-390.png).
- [Form nama](../artifacts/energy-centered/name-form-390.png) dan [reduced motion](../artifacts/energy-centered/reduced-motion-1440.png).
- [Rekaman gerak](../artifacts/energy-centered/one-cycle-desktop.webm) dan [hasil audit](../artifacts/energy-centered/measurements.json).

Build dan lint lulus. Pemeriksaan animasi serta perjalanan pengguna dijalankan di Chromium desktop/emulasi iPhone 13. Audit memeriksa 320, 390, 768, 1024, dan 1440px, ukuran kontrol 44px, overflow, keterbacaan di atas lapisan dekoratif, dan lampu hanya bercahaya saat kontak tertutup. Audit animasi menggunakan font fallback dengan permintaan Google Fonts dinonaktifkan pada konteks pengujian. Perangkat fisik, Safari/Firefox, dan aksesibilitas dengan pembaca layar nyata belum diuji.

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npx.cmd playwright test tests/energy-animation.spec.ts tests/voltquest.spec.ts --workers=2
$env:PLAYWRIGHT_BROWSERS_PATH=Join-Path $PWD 'tmp/playwright-media'
node scripts/audit-energy-animation.mjs
```
