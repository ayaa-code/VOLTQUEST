# Layout mengikuti viewport — 23 Oktober 2026

Login sebelumnya memakai ilustrasi hingga 340px, jarak besar, serta padding kartu hingga 40px berdasarkan lebar saja. Pada laptop pendek, gabungan tinggi konten melebihi area browser dan form memerlukan scroll.

Login kini memakai tinggi viewport dinamis (`dvh`) untuk padding, headline, dan area rangkaian. Pada layar lebar dengan tinggi ≤900px, jarak form dipadatkan dan ikon dekoratif kartu disembunyikan. Pada tinggi ≤700px, jarak kembali disesuaikan; metadata Fase F yang sudah ada di logo tidak diulang di footer. Form tetap memakai ukuran teks input 16px dan kontrol setidaknya 44px. Tidak memakai zoom/transform scale, fixed height, body overflow hidden, atau pendeteksian merek perangkat.

Tablet dan ponsel tetap satu kolom. Komposisi ringkas menempatkan form lebih dekat ke bagian atas. Halaman dapat bertambah tinggi ketika keyboard terbuka, teks diperbesar, detail akun dibuka, atau pesan validasi muncul. Akun, opsi demo, dan akses profil lama tetap bisa dijangkau. Layar ponsel kecil dan landscape masih dapat memerlukan scroll vertikal; memaksa seluruh konten masuk akan mengorbankan ukuran teks dan area sentuh.

Dashboard memakai jarak dan padding banner yang fluid. Pada layar lebar dengan tinggi ≤800px, header, greeting, dan hero dipadatkan sehingga tombol mulai misi lebih cepat terlihat. Daftar misi dan konten pembelajaran tetap menggunakan scroll halaman alami. Ini perubahan layout; ilustrasi dashboard masih ilustrasi yang sebelumnya, sedangkan rangkaian 3D login tetap berfungsi.

## Bukti pengukuran

Audit Chrome dengan font sistem dan reduced motion:

| Viewport browser  | Tinggi halaman login awal | Hasil                                                    |
| ----------------- | ------------------------- | -------------------------------------------------------- |
| 1920×900          | 900px                     | Muat tanpa scroll vertikal                               |
| 1536×730          | 730px                     | Muat tanpa scroll vertikal                               |
| 1440×800          | 800px                     | Muat tanpa scroll vertikal                               |
| 1366×650          | 650px                     | Muat tanpa scroll vertikal                               |
| 1280×620          | 620px                     | Muat tanpa scroll vertikal                               |
| 1024×600          | 600px                     | Muat tanpa scroll vertikal                               |
| 900×720           | 720px                     | Muat tanpa scroll vertikal                               |
| 768×1024          | 1024px                    | Muat tanpa scroll vertikal                               |
| 390×844           | 926px                     | Tombol Masuk di sekitar y=651px; scroll untuk opsi bawah |
| 360×800           | 919px                     | Tombol Masuk di sekitar y=644px; scroll untuk opsi bawah |
| 320×568 / 844×390 | 849px / 832px             | Scroll alami; seluruh kontrol dapat dijangkau            |

Seluruh ukuran audit login dan dashboard tidak melampaui lebar layar. Tidak ada pageerror. Tombol mulai misi dashboard terlihat pada 1366×650 dan 1024×600. Hasil dipengaruhi font, pengaturan teks, zoom browser, dan konten; bukan janji tanpa scroll untuk semua kemungkinan.

- [Login laptop](../artifacts/responsive-layout/login-1366x650.png)
- [Login ponsel](../artifacts/responsive-layout/login-390x844.png)
- [Dashboard laptop](../artifacts/responsive-layout/dashboard-1366x650.png)
- [Pengukuran lengkap](../artifacts/responsive-layout/audit.json)

Playwright mencakup perubahan ukuran tanpa reload, viewport laptop tanpa scroll, layar pendek termasuk tinggi 400px sebagai pendekatan ruang keyboard, teks 200%, validasi, dan akses tombol dashboard. Pengujian login, animasi, dan perjalanan belajar terkait juga dijalankan ulang. Chromium desktop dan emulasi iPhone diuji; keyboard/perangkat fisik serta Safari/Firefox belum diverifikasi.

Hasil: 32/32 pengujian lulus; build dan lint lulus.

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
npm.cmd run test:e2e -- tests/responsive-layout.spec.ts tests/login.spec.ts tests/energy-animation.spec.ts tests/voltquest.spec.ts --workers=2
node scripts/audit-responsive-layout.mjs
```
