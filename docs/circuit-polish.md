# Perbaikan mode ringan dan label rangkaian

23 Oktober 2026. Nama komponen sebelumnya mengambang di atas model dan dapat menutupi baterai atau lampu. SVG ringan juga memakai sudut pandang berbeda dari Three.js.

Perubahan:

- `CircuitFallback.tsx` menggambar ulang alas, baterai silinder, dudukan saklar, resistor bergelang, socket, dan lampu dengan gradient ringan. Koordinat komponen diproyeksikan memakai arah kamera yang sama dengan versi WebGL, tanpa mengimpor Three.js. Warna navy dan lavender tetap tersedia sesuai halaman.
- `CircuitAnimation.tsx` menempatkan “Baterai · Saklar · Resistor · Lampu” dalam satu baris keterangan di bagian bawah area ilustrasi. Tidak ada kotak nama di atas komponen.
- `CircuitAnimation.css` menyisihkan 26px dari area canvas/SVG untuk keterangan setinggi 24px. Kontrol berada setelah keterangan. Canvas juga dibatasi max-width/max-height agar resize tidak membuat overflow sementara sebelum ResizeObserver memperbarui renderer.
- `circuitScene.ts` tidak lagi memproyeksikan posisi label atau mengubah style label; logika arus dan saklar 3D tetap.
- `LoginPage.css` merapikan jarak kontrol pada layar kecil sehingga tidak bertumpuk dengan baris keterangan.

Saklar SVG tetap bisa diklik dan kontrol keyboard, pause, reduced motion, context loss, dan fallback perangkat terbatas tetap tersedia. Interaksi ilustrasi tidak mengubah progres belajar atau data pengamatan.

## Bukti dan pengujian

Audit Chrome memeriksa dua halaman × dua mode × empat lebar (320, 390, 768, 1440), total 16 kombinasi. Tidak ada overlap keterangan dengan gambar, overflow horizontal, atau pageerror. Screenshot menggunakan reduced motion dan font sistem agar hasil stabil.

- [Dashboard ringan](../artifacts/circuit-polish/dashboard-svg-1440.png)
- [Dashboard 3D](../artifacts/circuit-polish/dashboard-3d-1440.png)
- [Login ringan pada ponsel](../artifacts/circuit-polish/login-svg-390.png)
- [Hasil audit](../artifacts/circuit-polish/audit.json)

Playwright memeriksa area keterangan terpisah dari gambar serta kontrol, lebar tiap label, saklar, ukuran laptop tanpa scroll, reduced motion, fallback, dan cleanup pada login/dashboard. Lebar pengujian mencakup 320, 390, 768, 1024, 1440, 1920. Pengujian memakai Chromium desktop/emulasi iPhone; perangkat fisik, Safari, dan Firefox belum diuji.

Hasil akhir: **26/26 pengujian lulus**, build dan lint lulus. Satu masalah overflow sementara saat resize canvas ditemukan pada run awal dan diperbaiki dengan batas ukuran canvas sebelum run akhir.

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run test:e2e -- tests/circuit-polish.spec.ts tests/energy-animation.spec.ts tests/dashboard-circuit.spec.ts tests/responsive-layout.spec.ts --workers=2
node scripts/audit-circuit-polish.mjs
```
