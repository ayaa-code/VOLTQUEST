# Jalur Belajar Listrik Dinamis

Dashboard VoltQuest memakai satu jalur belajar berurutan untuk setiap profil
siswa: **materi → challenge analisis PhET → kuis formatif** untuk setiap sub
materi, lalu asesmen sumatif.

## Urutan materi

1. Arus Listrik
2. Hambatan Ohmik dan Non Ohmik
3. Hambatan Jenis
4. Rangkaian Listrik
5. Rangkaian Majemuk
6. Daya Listrik

Materi berikutnya hanya terbuka setelah materi sebelumnya ditandai telah
dipelajari. Challenge dibuka oleh materi pada submateri yang sama. Kuis
formatif dibuka setelah materinya dipelajari dan kuis formatif sebelumnya
selesai. Sumatif terbuka setelah enam kuis formatif selesai.

## Data dan penilaian

Progres disimpan per profil pada `voltquest.dynamic-electricity.v1` di
`localStorage`. Data ini terpisah dari progres misi dan XP lama, sehingga
profil, akun lokal, XP, dan misi yang sudah ada tidak diubah.

Jawaban numerik formatif diperiksa terhadap kunci dengan toleransi kecil untuk
penulisan desimal. Saat belum tepat, siswa mendapat tombol revisi dan pengingat
materi di bawah soal. Challenge tidak membaca hasil PhET secara otomatis:
siswa harus membuka simulasi dan menuliskan pengamatan serta refleksi sendiri.

Dua soal uraian pada sumatif disimpan untuk ditinjau dengan rubrik oleh guru
atau siswa. Aplikasi tidak memberi nilai otomatis untuk uraian tersebut.

Soal hitungan formatif, pilihan ganda sumatif, dan tema uraian diringkas dari
`Asesmen Formatif dan Sumatif - Listrik Dinamis V2.docx`.
