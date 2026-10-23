# Perbaikan rangkaian 3D dan label komponen

23 Oktober 2026. Nama komponen sebelumnya mengambang di atas model dan dapat menutupi baterai atau lampu. Rangkaian kini hanya memakai Three.js; mode SVG telah dihapus.

Perubahan:

- `CircuitAnimation.tsx` hanya membuat renderer 3D. Saat WebGL tidak tersedia, aplikasi menampilkan pesan dukungan perangkat tanpa mengganti ilustrasi ke SVG.
- `circuitScene.ts` memproyeksikan titik jangkar baterai, saklar, resistor, dan lampu ke area HTML setiap kali ukuran canvas berubah.
- `CircuitAnimation.css` memakai kotak label kecil yang mengikuti titik jangkar tersebut. Posisi dan ukuran disesuaikan pada layar kecil agar tidak menutupi komponen atau kontrol.
- Canvas memakai seluruh area ilustrasi dan dibatasi max-width/max-height agar resize tidak membuat overflow sementara sebelum ResizeObserver memperbarui renderer.

Klik saklar pada model dan kontrol keyboard, pause, reduced motion, serta pembersihan resource tetap tersedia. Interaksi ilustrasi tidak mengubah progres belajar atau data pengamatan.

## Bukti dan pengujian

Audit Chrome memeriksa dua halaman pada empat lebar (320, 390, 768, 1440). Audit memeriksa label tetap berada di area ilustrasi, berada sebelum kontrol, tidak menyebabkan overflow horizontal, dan tidak menghasilkan pageerror. Screenshot menggunakan reduced motion dan font sistem agar hasil stabil.

- [Dashboard 3D](../artifacts/circuit-polish/dashboard-3d-1440.png)
- [Login 3D pada ponsel](../artifacts/circuit-polish/login-3d-390.png)
- [Hasil audit](../artifacts/circuit-polish/audit.json)

Playwright memeriksa posisi empat label, saklar, ukuran laptop tanpa scroll, reduced motion, pesan WebGL tidak tersedia, dan cleanup pada login/dashboard. Lebar pengujian mencakup 320, 390, 768, 1024, 1440, 1920. Pengujian memakai Chromium desktop/emulasi iPhone; perangkat fisik, Safari, dan Firefox belum diuji.

Hasil akhir: **26/26 pengujian lulus**, build dan lint lulus. Satu masalah overflow sementara saat resize canvas ditemukan pada run awal dan diperbaiki dengan batas ukuran canvas sebelum run akhir.

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run test:e2e -- tests/circuit-polish.spec.ts tests/energy-animation.spec.ts tests/dashboard-circuit.spec.ts tests/responsive-layout.spec.ts --workers=2
node scripts/audit-circuit-polish.mjs
```
