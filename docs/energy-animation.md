# Energi Menemukan Jalurnya

> Riwayat versi pertama. Atas revisi pengguna, versi berjalan kini memakai rangkaian sebagai latar dengan sakelar membuka–menutup, tanpa fase sinusoidal/titik menyebar. Lihat [dokumentasi dan bukti terbaru](energy-background.md). Bukti versi pertama di bawah tetap dipertahankan sebagai arsip.

Implementasi lokal pada 23 Oktober 2026. Animasi orisinal ini menempatkan rasa ingin tahu sebagai perjalanan dari titik yang tersebar menuju jalur dan rangkaian yang tersambung. Komposisi, koordinat, gambar komponen, serta kode dibuat untuk VoltQuest. Tidak menggunakan kode atau aset website referensi.

## Integrasi dan tampilan

`src/components/EnergyCircuitAnimation.tsx` menggantikan pemanggilan ilustrasi onboarding di `src/App.tsx`. CSS komponen berada di `src/components/EnergyCircuitAnimation.css`. Dashboard tetap memakai `CircuitArt` semula.

Ilustrasi menggunakan 44 titik dengan posisi awal deterministik, jalur ungu, aksen mint/coral, baterai, sakelar berengsel, serta lampu kuning lembut. Warna utama dan kontrol mengikuti token proyek; warna dekoratif lokal melanjutkan palet pastel ilustrasi yang sudah ada. SVG dibatasi lebarnya hingga 340px dengan rasio 400:270. Ruang kontrol selalu tersedia, termasuk saat reduced motion, sehingga perubahan preferensi tidak menggeser konten.

Form dan tombol masuk langsung tersedia. Ilustrasi tidak menerima pointer dan berada dalam area terpisah dari judul, form, dan tombol. Tidak ada loading atau syarat menunggu siklus selesai.

## Siklus 12,8 detik

| Waktu | Perubahan |
| --- | --- |
| 0–1,6 detik | Titik tersebar bergerak perlahan dalam area ilustrasi. |
| 1,6–3,4 detik | Titik berkumpul menjadi jalur melengkung. Garis baru muncul menjelang titik tersusun, agar tidak membentuk jalinan acak. |
| 3,4–4,1 detik | Jalur melengkung bertahan. |
| 4,1–6 detik | Jalur berubah menjadi kabel rangkaian. Simbol komponen muncul mulai 5,2 detik hingga 6,2 detik. |
| 6,2–6,9 detik | Sakelar bergerak menutup. |
| 7–7,7 detik | Cahaya lampu dan pulsa dekoratif muncul perlahan setelah sakelar tertutup. |
| 7,7–10 detik | Rangkaian tersambung bertahan dengan lampu menyala. |
| 10–10,7 detik | Cahaya meredup. |
| 10,8–11,3 detik | Sakelar membuka setelah cahaya padam. |
| 11,3–12,8 detik | Komponen menghilang, titik menyebar, lalu siklus berulang tanpa lompatan posisi. |

Ini ilustrasi identitas, bukan simulasi fisika. Titik dan pulsa tidak diberi label elektron, arus terukur, atau kecepatan perambatan. Tidak ada nilai tegangan, arus, atau energi rekaan. Baterai terlihat sebagai sumber dalam rangkaian; cahaya hanya muncul setelah sakelar tertutup. Pengamatan dan simulasi pembelajaran tetap dilakukan melalui alur misi dan PhET.

## Teknologi, aksesibilitas, dan lifecycle

SVG dipilih karena simbol tetap tajam pada berbagai ukuran, bentuk kabel mudah ditransformasikan, dan tidak membutuhkan library baru. Posisi titik dirender sebagai tiga path menurut warna; React tidak memperbarui state setiap frame. Ukuran tidak memerlukan ResizeObserver atau pengaturan devicePixelRatio karena SVG memakai viewBox responsif.

Satu `requestAnimationFrame` per instance menghitung gerak dari waktu, bukan jumlah frame. Posisi target diukur sekali per setup efek, bukan di setiap frame. ID radial gradient berasal dari `useId`, sehingga beberapa instance tidak berbagi ID. Cleanup membatalkan frame, memutus IntersectionObserver, dan melepas listener. StrictMode tetap menghasilkan paling banyak satu frame tertunda pada pengujian.

- **Jeda animasi / Putar animasi:** tombol di luar SVG `aria-hidden`, dengan fokus terlihat, dukungan Enter/Space, dan tinggi sentuh 44px. Jeda mempertahankan posisi saat ini; preferensi ini hanya berlaku selama komponen terpasang, tanpa menambah localStorage.
- **Reduced motion:** diperiksa sejak mount dan mengikuti perubahan langsung. Menampilkan rangkaian statis tertutup yang menyala lembut pada fase 8,5 detik, tanpa loop. Kontrol diganti catatan “Ilustrasi statis · gerak dikurangi”; tidak ada autoplay saat preferensi aktif.
- **Halaman tersembunyi:** listener `visibilitychange` menghentikan loop. Timestamp sebelumnya dibuang saat berhenti sehingga kembali ke tab melanjutkan waktu animasi tanpa mengejar waktu yang hilang.
- **Di luar viewport:** IntersectionObserver menghentikan loop. Gerak dilanjutkan saat area ilustrasi terlihat kembali.
- **Masuk dashboard:** komponen unmount dan seluruh pekerjaan animasi dibersihkan.

## Verifikasi

Build dan lint berhasil. Suite lengkap menghasilkan **56 pengujian lulus**, terdiri dari 28 skenario pada Chromium desktop dan emulasi iPhone 13. Delapan di antaranya khusus animasi (empat skenario pada dua konfigurasi):

1. Jeda/putar dengan keyboard, fokus terlihat, form dapat diisi saat animasi berjalan, satu loop dalam StrictMode, serta nol frame/observer/listener tersisa setelah masuk dashboard.
2. Reduced motion saat awal dan ketika berubah: ilustrasi statis serta tidak ada callback animasi berjalan.
3. Penghentian pada perubahan visibility dan saat ilustrasi keluar viewport; loop dapat dilanjutkan.
4. Onboarding dan form nama pada lebar 320, 390, 768, 1024, dan 1440px: tidak ada overflow horizontal, ilustrasi tidak menimpa teks, dan ukuran kontrol memenuhi 44px.

Suite regresi juga memeriksa misi, XP tanpa duplikasi, profil, draf, latihan, serta konfirmasi/rekomendasi. Soal/kunci, penyimpanan progres, dan penyimpanan draf memiliki hash yang sama sebelum dan sesudah perubahan. Tidak ada perubahan pada aturan belajar atau skema penyimpanan.

Audit visual otomatis mencatat 15 kombinasi fase/lebar, ditambah screenshot reduced motion dan form nama pada lima lebar. Tidak ditemukan overflow, tumpang tindih dengan teks, atau kontrol di bawah 44px. Pemantauan satu siklus mencatat kelima fase dan **nol frame lampu bercahaya ketika sakelar belum tertutup**. Detail interval frame dari sesi rekaman tersedia di [measurements.json](../artifacts/energy-animation/measurements.json); angka tersebut hanya pengamatan Chromium di komputer audit, bukan jaminan performa perangkat lain.

Audit animasi dan pengujian lifecycle menonaktifkan permintaan Google Fonts eksternal dengan respons CSS kosong untuk menghindari ketergantungan jaringan. Pemeriksaan ini menggunakan font fallback proyek dan tidak menemukan error console/aplikasi. Kemampuan unduh font eksternal bukan bagian dari hasil tersebut.

Perintah pengulangan, dengan server lokal berjalan:

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:VOLTQUEST_ARTIFACT_ROOT='artifacts/energy-animation/regression'
npm.cmd run test:e2e -- --workers=2

# Encoder Playwright disimpan lokal di tmp; tidak menjadi dependensi aplikasi.
$env:PLAYWRIGHT_BROWSERS_PATH=Join-Path $PWD 'tmp/playwright-media'
# Jika encoder belum tersedia: npx.cmd playwright install ffmpeg
node scripts/audit-energy-animation.mjs
```

Variabel `VOLTQUEST_ARTIFACT_ROOT` ditambahkan pada tiga pengujian yang menyimpan screenshot agar verifikasi baru tidak menimpa bukti tahap terdahulu. Default pengujian tetap sama. Bukti regresi pekerjaan ini berada di `artifacts/energy-animation/regression/`.

## Bukti visual

| Fase | Ponsel 390px | Desktop 1440px |
| --- | --- | --- |
| Titik tersebar | [Screenshot](../artifacts/energy-animation/scattered-390.png) | [Screenshot](../artifacts/energy-animation/scattered-1440.png) |
| Jalur melengkung | [Screenshot](../artifacts/energy-animation/curved-390.png) | [Screenshot](../artifacts/energy-animation/curved-1440.png) |
| Rangkaian tertutup dan lampu menyala | [Screenshot](../artifacts/energy-animation/closed-390.png) | [Screenshot](../artifacts/energy-animation/closed-1440.png) |
| Reduced motion | [Screenshot](../artifacts/energy-animation/reduced-motion-390.png) | [Screenshot](../artifacts/energy-animation/reduced-motion-1440.png) |
| Form nama | [Screenshot](../artifacts/energy-animation/name-form-390.png) | [Screenshot](../artifacts/energy-animation/name-form-1440.png) |

[Rekaman satu siklus desktop (WebM)](../artifacts/energy-animation/one-cycle-desktop.webm) menampilkan animasi yang berjalan tanpa interaksi jeda. Screenshot tambahan 320, 768, dan 1024px tersedia pada folder yang sama. Screenshot awal sebelum perubahan disimpan sebagai `before-desktop.png`. Screenshot membuktikan komposisi per fase, bukan kelancaran geraknya.

## Batas pemeriksaan

Belum diuji pada ponsel fisik, Safari/Firefox, pembaca layar nyata, perangkat hemat daya, atau dengan siswa/guru. Visibility diuji melalui perubahan properti `document.hidden` dan event pada halaman uji; perilaku saat aplikasi browser benar-benar masuk latar belakang pada perangkat fisik belum diuji. Keluar viewport diuji dengan scroll nyata. Tidak ada klaim “60 FPS”, penghematan baterai, hasil belajar, atau keunggulan lomba berdasarkan audit ini.

## File pekerjaan

- Baru: komponen TSX/CSS, `tests/energy-animation.spec.ts`, `scripts/audit-energy-animation.mjs`, dokumentasi ini, serta folder bukti.
- Diubah: `src/App.tsx` untuk satu lokasi integrasi; tiga file pengujian lama untuk root screenshot opsional; README untuk tautan dokumentasi.
