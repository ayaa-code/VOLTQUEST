# Login listrik dinamis — 23 Oktober 2026

Revisi ini menggantikan onboarding tengah sesuai lampiran terbaru. Desktop memakai kolom visual sekitar 57% dan kolom login 43%; hingga lebar 850px, visual berada di atas kartu login. Warna navy #102C46, toska #12B99A, cyan, ivory, dan kuning hangat mengikuti permintaan. Grid tipis menjadi latar meja praktikum. Tidak ada sinusoidal atau pola PCB.

## Cara mencoba

1. Buka halaman awal; jika sesi belajar masih aktif, pilih profil → Keluar dari profil.
2. Klik saklar pada ilustrasi, atau kontrol **Saklar ON/OFF** yang juga dapat dioperasikan dengan keyboard.
3. Klik **Coba dengan akun demo**, lalu **Masuk**. Email `siswa@voltquest.demo`, kata sandi `VoltQuest123`.
4. Untuk akun sendiri, pilih **Daftar**, isi nama/email/kata sandi khusus demo, lalu simpan kode pemulihan yang muncul. Akun ini hanya tersedia pada browser dan origin yang sama.
5. **Lupa kata sandi?** meminta email, kode pemulihan, dan kata sandi baru. Tidak ada email yang dikirim. Akun demo bawaan memakai kredensial tetap di atas.
6. Profil sebelum revisi ini tetap dibuka melalui **Buka profil lama tanpa email**, dengan nama yang sama. Pendaftaran akun email membuat profil terpisah; tidak menggabungkan atau menghapus progres lama.

## Rangkaian dan performa

`LoginCircuit.tsx` memuat `circuitScene.ts` melalui dynamic import. Three.js membuat geometri langsung: baterai dengan polaritas, saklar tembaga, resistor bergelang, lampu, dan empat ruas kabel seri. Tidak ada model, tekstur, kontrol kamera, atau post-processing dari CDN. Partikel melambangkan arah arus konvensional dari terminal positif melalui komponen lalu kembali ke negatif; kecepatannya ilustratif, bukan hasil pengukuran fisika. Arus baru tampak setelah kontak saklar menutup, lalu lampu berpendar. OFF menghentikan partikel dan meredupkan lampu.

Terdapat 20 partikel dan 20 titik jejak, geometri sederhana, pixel ratio dibatasi 1,5, serta satu RAF saat animasi aktif. Pause, halaman tersembunyi, dan keluar viewport menghentikan loop. Reduced motion merender keadaan statis, dengan saklar tetap berfungsi. Semua geometri/material/renderer, observer, dan listener dibersihkan saat unmount, termasuk StrictMode. Pengelolaan resource mengikuti [dokumentasi Three.js](https://threejs.org/manual/pages/how-to-dispose-of-objects.html).

SVG tersedia sejak render pertama dan tetap dapat diklik. Versi ringan dipakai ketika WebGL gagal, context hilang, modul gagal dimuat, Save-Data aktif, memori terlapor ≤2GB atau CPU logis ≤2. Jika frame buruk >70ms bertahan sekitar 55 hitungan, scene juga turun ke SVG. Ini heuristik, bukan jaminan performa semua ponsel. Tombol berikon lapisan di samping Jeda menyediakan **Gunakan tampilan ringan** pada desktop maupun ponsel. Animasi CSS fallback berhenti saat pause, reduced motion, di luar viewport, atau tab tersembunyi.

Loading mempercepat arus jika saklar menyala. Keberhasilan menghubungkan rangkaian dan memperkuat cahaya sebelum membuka dashboard. Tombol submit terkunci selama transisi dan menolak pengiriman ganda. Timer dibersihkan saat unmount.

## Akun dan kompatibilitas data

`data/localAuth.ts` merupakan batas adapter untuk backend mendatang. Prototipe lokal ini bukan autentikasi produksi: pemilik perangkat dapat memodifikasi localStorage. Tidak ada verifikasi email, sesi server, sinkronisasi lintas perangkat, atau pengiriman email. Jangan menggunakan kata sandi akun asli.

| Data                            | Perilaku                                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `voltquest.accounts.v1`         | Versi 1; email dinormalisasi huruf kecil, nama, salt unik, hash PBKDF2-SHA256 100.000 iterasi untuk kata sandi dan kode pemulihan. Tidak menyimpan teks kata sandi/kode. |
| `voltquest.remembered-email.v1` | Checkbox **Ingat saya** hanya mengingat email; artinya dijelaskan di form. Tidak menyimpan kata sandi.                                                                   |
| `voltquest.v1`                  | Skema progres tetap. Profil email memakai ID `account:<email>`; profil nama lama tetap `student:<nama>`.                                                                 |
| Draf, konfirmasi, latihan       | Mengikuti ID profil yang sama seperti sebelumnya. Tidak ada migrasi atau penghapusan data belajar.                                                                       |

Seperti versi sebelumnya, profil aktif dan progres tetap pulih saat refresh/reopen sampai pengguna keluar. “Ingat saya” tidak mengubah durasi sesi. Akun lokal gagal disimpan → tampil error, tidak mengklaim berhasil. Akun demo dan profil nama tetap bisa dipakai dalam memori saat penyimpanan ditolak; banner penyimpanan lama tetap berlaku. Data akun tak terbaca dipertahankan.

## Verifikasi

Build dan lint lulus. Run regresi awal menghasilkan 68/70 lulus; dua kegagalan berasal dari selector status dialog yang kini ambigu dengan live region login. Selector diperbaiki agar mengacu ke dialog yang diperiksa. Run lanjutan login/animasi/perjalanan lengkap menghasilkan 24/24 lulus, termasuk empat kasus baru untuk klik objek 3D, context loss, dan perangkat terbatas. Run terakhir login/lab menghasilkan 16/16 lulus, termasuk dua kasus tambahan penyimpanan akun rusak. Total 76 kasus dalam suite akhir telah tercakup, melalui run lengkap awal dan run ulang terarah; tidak ada kegagalan yang masih terbuka.

Pengujian Playwright menjalankan Chromium desktop dan emulasi iPhone 13: validasi, fokus error, tampil/sembunyi sandi, kredensial salah, transisi, email yang diingat, pendaftaran, duplikat, pemulihan salah/benar, kegagalan storage, profil lama, saklar keyboard, pause, reduced motion, visibility, offscreen, cleanup, dan fallback tanpa WebGL. Suite pembelajaran juga dijalankan agar pengamatan wajib, refleksi, latihan, dan XP tetap benar.

Audit visual menggunakan Chrome terpasang dengan WebGL nyata dan font sistem (Google Fonts dinonaktifkan untuk menghilangkan ketergantungan jaringan). Lebar 320, 390, 768, 1024, 1440, 1920 serta landscape 844×390 tidak melampaui lebar halaman. Halaman dapat digulir vertikal untuk keyboard virtual dan viewport pendek. Pemeriksaan ini belum mencakup perangkat Android/iOS fisik, Safari, Firefox, atau pembaca layar nyata.

- [Desktop](../artifacts/login-3d/login-1440.png)
- [Ponsel](../artifacts/login-3d/login-390.png)
- [Saklar OFF](../artifacts/login-3d/switch-off.png)
- [Fallback SVG](../artifacts/login-3d/fallback-svg.png)
- [Data audit](../artifacts/login-3d/audit.json)

```powershell
npm.cmd run build
npm.cmd run lint
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:VOLTQUEST_ARTIFACT_ROOT='artifacts/login-3d/regression'
npm.cmd run test:e2e -- --workers=2
node scripts/audit-login-3d.mjs
```

Bundle Three.js dipisah dari aplikasi utama dan hanya dimuat pada login: sekitar 554KB minified / 139KB gzip pada build awal revisi. Vite memberi peringatan ukuran chunk >500KB; ini chunk lazy, bukan kegagalan build. Aset tidak memuat identitas/kata sandi pengguna.
