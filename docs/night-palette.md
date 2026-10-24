# Palet Listrik Dinamis

Palet VoltQuest mengikuti ilustrasi referensi pengguna `LISTRIK DINAMIS.png`.
Komposisi malam diterapkan lewat warna, tanpa mengubah susunan halaman atau
alur pembelajaran.

| Warna referensi    | HEX       | Peran                                                      |
| ------------------ | --------- | ---------------------------------------------------------- |
| Langit navy        | `#051145` | Latar aplikasi, login, navigasi, dan ikon tab              |
| Biru pepohonan     | `#354E69` | Pembatas, aksen permukaan, papan rangkaian                 |
| Cahaya lampu       | `#FBE983` | Tombol utama, fokus keyboard, identitas, informasi penting |
| Genangan biru muda | `#A0C9E9` | Tautan, label rangkaian, informasi pendukung, kabel        |
| Awan               | `#B4B8C8` | Teks pendukung dan status terkunci                         |
| Daun terang        | `#5FAB3D` | Baterai dan saklar 3D, aksen progres                       |
| Semak              | `#44842F` | Saklar ON dan batas status sukses                          |
| Bayangan semak     | `#1E6022` | Aksen hijau yang lebih gelap                               |
| Bulan              | `#9A8754` | Detail logam dan batas pemberitahuan                       |
| Putih              | `#FFFFFF` | Teks utama                                                 |

Warna permukaan biru gelap serta hijau teks yang lebih terang merupakan turunan
untuk memastikan tulisan nyaman dibaca. Kesalahan memakai merah muda terang
sebagai warna semantik tambahan agar berbeda dari informasi dan keberhasilan.
Status juga tetap memiliki teks dan ikon, sehingga maknanya tidak bergantung
pada warna saja.

Token warna ada di `src/index.css`. Lapisan warna lintas komponen berada di
`src/night-theme.css`, yang dimuat setelah gaya tata letak. Warna model Three.js
ada di `src/components/circuitScene.ts`. Formulir memakai skema warna gelap.
Simulasi PhET di iframe mempertahankan tampilan milik penyedia simulasi.

Login memakai gambar referensi `LISTRIK DINAMIS.png` sebagai background `cover`,
dengan lapisan navy transparan untuk menjaga keterbacaan. Gambar disertakan
dalam hasil build Vite, sehingga tidak bergantung pada halaman atau koneksi
GitHub ketika login dibuka. Pada layar potret, posisi gambar diarahkan ke
lampu jalan sebelah kiri agar ilustrasi tetap terlihat. Formulir dan animasi
rangkaian tetap berada di depan latar gambar.

Perubahan warna tidak mengubah skema penyimpanan, isi materi, kunci jawaban,
akun, XP, badge, urutan belajar, atau penghitungan progres.
