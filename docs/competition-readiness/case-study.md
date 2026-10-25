# Studi kasus UI/UX — draf berbasis bukti

## Konteks

VoltQuest adalah prototipe pembelajaran listrik dinamis Fase F untuk DIMAS-TI 2026. Pemilik menginginkan penggunaan ponsel yang nyaman serta eksperimen dan revisi. Permintaan/screenshot merupakan masukan pemilik, belum riset siswa.

Hipotesis: siswa memerlukan jembatan prediksi–bukti–penjelasan, petunjuk yang tidak membocorkan jawaban, serta pemulihan pekerjaan.

## Alur dan keputusan

Materi 1–3 → dua misi dasar Discovery Lab → Piko → Materi 4–6 → Energy Control Room → Sumatif; tiga misi lain penguatan. Demo membuka akses tanpa menyelesaikan.

Panduan sebelum simulator memperjelas variabel; prediksi dan alasan dipisahkan; pengamatan menyesuaikan ponsel; laporan membedakan angka, pilihan, tulisan, gambar. Draf lokal dipertahankan dengan batas pemulihan PhET yang jujur.

Riwayat dokumen/commit terdahulu tersedia. Jangan menggambarkan seluruh riwayat sebagai proses Design Thinking yang telah diteliti.

## Sebelum–sesudah audit ini

| Masalah                                                  | Perubahan                                               | Bukti/alasan                         |
| -------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------ |
| Skema progres rusak/tidak dikenal berisiko tertimpa      | Blokir tulis, pertahankan data mentah                   | Regresi penyimpanan/reload           |
| Snapshot lama dapat menimpa profil yang ditulis tab lain | Baca data terkini sebelum mutasi, migrasi tetap berlaku | Regresi dua tab/data lama            |
| “saya tidak tahu” luput dari pemeriksa                   | Kenali variasi ketidakpahaman sederhana                 | Tes batas dengan penjelasan bermakna |
| Dua tegangan sama dianggap cukup jika V=IR cocok         | Catatan perlunya tegangan berbeda                       | Pemeriksaan rancangan percobaan      |
| Salinan gambar laporan tertinggal saat simpan gagal      | Hapus hanya salinan baru yang belum dipakai             | Tinjauan jalur gagal                 |
| README/deployment salah alur/workspace                   | Dokumen disesuaikan dengan implementasi                 | Perbandingan kode/konfigurasi        |
| Cerita Ohm tidak selaras variabel                        | Tegangan diubah, resistor tetap                         | Keselarasan cerita dan eksperimen    |

## Evaluasi

Hasil aktual ada pada status/audit. Screenshot adalah evaluasi pengembang. Tes suara/video memakai layanan tiruan; belum membuktikan pelafalan asli, jaringan sekolah, atau performa ponsel fisik.

## Riset pengguna — menunggu

Isi setelah tersedia: peserta/metode/tanggal, keberhasilan/bantuan, kutipan anonim, telaah guru, perubahan dari temuan, uji ulang. Jangan mengganti dengan hasil Playwright.

## Risiko

Data tidak sinkron, clear data/perangkat hilang berisiko. State PhET tidak pulih otomatis. AI produksi belum aktif saat audit. Pemeriksaan teks lokal terbatas, laporan bukan nilai akhir guru. Bundel 3D/PDF besar namun dimuat terpisah; kecepatan jaringan sekolah belum diukur.
