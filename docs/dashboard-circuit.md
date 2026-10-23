# Rangkaian 3D pada dashboard

> Pembaruan berikutnya merapikan SVG ringan serta memindahkan label ke area keterangan di bawah gambar. Lihat [hasil terbaru](circuit-polish.md); screenshot pada dokumen ini merekam integrasi awal dashboard.

Revisi 23 Oktober 2026 menempatkan rangkaian interaktif dari login di sisi kanan banner “Amati rangkaian, jelaskan temuanmu.” Pada ponsel, teks dan tombol misi tetap lebih dahulu, lalu rangkaian dan kontrol ringkas di bawahnya. Ilustrasi statis dan stiker sebelumnya digantikan oleh komponen interaktif tanpa menambahkan panel gelap di dalam banner pastel.

## Implementasi

- `CircuitAnimation.tsx` menjadi komponen bersama. Varian `login` menerima fase proses masuk; varian `dashboard` menggunakan fase idle sendiri. Saklar serta pause masing-masing merupakan state lokal ilustrasi, tidak terhubung ke XP atau data belajar.
- `LoginCircuit.tsx` menjadi adapter kecil untuk login. Kode renderer, fallback, observer, kontrol dan lifecycle tidak diduplikasi.
- `circuitScene.ts` menerima varian untuk material alas, kabel, dudukan, dan partikel. Dashboard memakai alas lavender, kabel ungu, partikel toska gelap yang terbaca pada latar terang, baterai mint, serta lampu hangat.
- `CircuitFallback.tsx` menerima varian yang sama; SVG tetap interaktif lewat klik saklar dan tombol keyboard.
- `CircuitAnimation.css` memuat gaya bersama dan varian dashboard. Override responsif login di `LoginPage.css` dibatasi pada halaman login sehingga tidak mengecilkan atau menyembunyikan kontrol dashboard.
- `App.tsx` memasang `<CircuitAnimation variant="dashboard" />` pada area hero. Judul, penjelasan, tombol mulai/lanjutkan, dan keterangan PhET dipertahankan. Tidak ada perubahan skema penyimpanan.

## Perilaku

Saklar awal ON: partikel mengikuti jalur seri dan lampu menyala. OFF menghentikan arus; ON menutup kontak sebelum menyalakan lampu. Klik model dan kontrol keyboard sama-sama didukung. Jeda/putar, reduced motion, penghentian ketika tab tersembunyi atau keluar viewport, fallback perangkat terbatas/context loss, serta pembersihan renderer/material/geometri tetap memakai mekanisme bersama.

Keterangan dashboard: “Coba saklarnya. Apa yang terjadi pada lampu?” Ilustrasi memakai arah arus konvensional dan kecepatan visual ilustratif. Percobaan dan hasil pengamatan tetap berasal dari kegiatan siswa di PhET. Mengubah saklar tidak mengisi pengamatan, memberi XP, atau menyelesaikan misi.

## Bukti

Audit dengan Chrome/WebGL nyata memeriksa lebar 320, 390, 768, 1024, 1440 dan 1920px. Seluruhnya tidak memiliki overflow horizontal, menampilkan satu canvas, serta tidak menghasilkan pageerror. Font sistem dan reduced motion dipakai agar screenshot stabil. Ponsel kecil masih memakai scroll vertikal alami, sesuai perubahan responsif sebelumnya.

- [Dashboard desktop](../artifacts/dashboard-circuit/dashboard-1440.png)
- [Dashboard ponsel](../artifacts/dashboard-circuit/dashboard-390.png)
- [Dashboard 320px](../artifacts/dashboard-circuit/dashboard-320.png)
- [Saklar OFF](../artifacts/dashboard-circuit/switch-off.png)
- [Fallback SVG pastel](../artifacts/dashboard-circuit/fallback.png)
- [Pengukuran audit](../artifacts/dashboard-circuit/audit.json)

Pengujian mencakup klik model 3D, switch keyboard, pause, reduced motion, SVG/context loss, layout di enam lebar, dan tidak berubahnya data progres/pengamatan karena interaksi ilustrasi. Lifecycle login → dashboard → misi → dashboard berulang → logout memeriksa satu RAF/canvas aktif dan resource dibersihkan di halaman misi. Tombol lanjutkan membuka misi berikutnya. Regresi login tanpa scroll pada viewport laptop juga diperiksa.

Pengujian Chromium desktop/emulasi iPhone bukan uji perangkat fisik, Safari/Firefox, atau evaluasi bersama siswa. Peringatan build Three.js chunk >500KB tetap ada seperti sebelumnya; renderer dimuat melalui dynamic import dan tidak memerlukan model/tekstur eksternal.

Hasil akhir: build dan lint lulus, serta **88/88 pengujian Playwright lulus** dalam satu run regresi lengkap. Masalah awal pemisahan selector SVG telah diperbaiki sebelum run akhir; bukti screenshot historis tetap dipertahankan.

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:VOLTQUEST_ARTIFACT_ROOT='artifacts/dashboard-circuit/regression'
npm.cmd run test:e2e -- --workers=2
node scripts/audit-dashboard-circuit.mjs
```
