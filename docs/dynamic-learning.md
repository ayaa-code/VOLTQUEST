# Jalur belajar dan media Listrik Dinamis

Urutan utama: enam pasangan **materi → tes formatif**, lalu enam **Challenge PhET** berurutan, kemudian **asesmen sumatif**. Formatif 1–5 menawarkan materi berikutnya. Formatif 6 kembali ke dashboard; akses Challenge melalui kartu PhET Challenge. Halaman materi/formatif tidak mempunyai tombol menuju Challenge.

## Materi lengkap

`src/data/lessons.ts` memuat naskah pengguna yang diedit untuk ejaan, konsistensi satuan, arah elektron pada rangkaian luar DC, kondisi berlaku rumus, serta perbedaan rasio V/I dengan gradien lokal pada komponen non-ohmik. ID 1–6 tetap sama dengan versi lama. `dynamicElectricity.ts` tetap memuat soal, kunci, ringkasan revisi, dan panduan Challenge asli.

1. Arus Listrik
2. Hambatan Ohmik dan Non-Ohmik
3. Hambatan Jenis
4. Rangkaian Listrik Seri dan Paralel
5. Rangkaian Majemuk serta Hukum Kirchhoff
6. Daya Listrik

## Audio

`useLessonSpeech` memakai Web Speech API: klik untuk mulai, jeda, lanjutkan, hentikan, dan kecepatan 0,8×/1×/1,2×. Kecepatan diubah sebelum pembacaan dimulai. Seluruh judul, subjudul, paragraf, serta pelafalan rumus dibagi menjadi potongan maksimal sekitar 180 karakter. Daftar suara dimuat ulang pada `voiceschanged`; suara `id`/`id-ID` diutamakan. Kualitas suara dan fungsi jeda mengikuti dukungan perangkat; tanpa suara Indonesia, browser dapat memakai suara bawaan dan tampilan menjelaskan keterbatasan tersebut. Tanpa API, teks serta video tetap tersedia.

Pembacaan dibatalkan saat membuka video, mengganti materi/halaman, keluar dari halaman browser, atau komponen dibongkar. Callback lama dibatalkan melalui penanda sesi agar tidak memulai potongan baru setelah pembatalan. Mulai audio menutup video aktif. Audio adalah suara sintesis perangkat, bukan rekaman manusia. Penyelesaian audio/video tidak memberikan progres.

## Video

Kotak 16:9 tidak mengunduh iframe atau API YouTube sebelum diklik. Klik membuat iframe `youtube-nocookie.com` resmi; autoplay hanya diminta sebagai akibat klik pengguna. IFrame Player API dipakai untuk menghentikan audio saat video bermain dan menampilkan kegagalan pemutar. Jika API gagal dimuat dalam 12 detik, tersedia penjelasan dan tautan cadangan. Pemutar serta iframe dibersihkan ketika komponen ditutup. Tautan resmi YouTube selalu tersedia; tidak ada pengunduhan/ekstraksi video.

Pemeriksaan jaringan pada 24 Oktober 2026:

| Submateri                    | ID video    | Metadata oEmbed            | Pemutar asli di Chrome |
| ---------------------------- | ----------- | -------------------------- | ---------------------- |
| Arus Listrik                 | qYoF_02J_R4 | Tersedia; Tutor Dig        | Media berhasil dimuat  |
| Hambatan Ohmik dan Non-Ohmik | Mb96Zp-DxEU | Tersedia; bisolpin         | Media berhasil dimuat  |
| Hambatan Jenis               | 2oV9ZwM4SRU | HTTP 401                   | Video unavailable      |
| Seri dan Paralel             | dLalv-D_HM8 | Tersedia; Bimbel Excellent | Media berhasil dimuat  |
| Kirchhoff                    | fENcVMe9kLw | Tersedia; Ardi Satriawan   | Media berhasil dimuat  |
| Daya Listrik                 | UOVTsD_CUK0 | Tersedia; Tutor Dig        | Media berhasil dimuat  |

HTTP 200 pada halaman embed dan keberhasilan oEmbed **tidak menjamin video dapat diputar** pada semua wilayah, akun, dan perangkat. Semua halaman embed merespons 200; pemeriksaan media asli menunjukkan satu video tidak tersedia. Status pemutaran ditangani melalui error resmi IFrame API dan tautan cadangan. Video Hambatan Jenis memerlukan pemeriksaan pemilik atau tautan pengganti. Keterangan pemeriksaan bertanggal ditampilkan di materi tersebut. Tautan pengguna dipertahankan dan tidak diganti diam-diam.

Pengujian pemutar asli dilakukan dengan Chrome headless dan izin jaringan: lima video mencapai HTMLMediaElement.readyState ≥ 2 pada iframe resmi; video Hambatan Jenis menampilkan “Video unavailable”. Percobaan awal di sandbox menolak akses jaringan, lalu diulang dengan izin jaringan. Tes regresi memakai pemutar tiruan agar lifecycle dan respons error dapat diuji tanpa ketergantungan jaringan eksternal. Tidak ada klaim bahwa video akan tersedia selamanya atau dapat diputar di semua perangkat.

## Prasyarat dan data

`learningAccess.ts` menjadi sumber aturan bersama bagi dashboard, katalog, panel, serta mutasi penyelesaian pada hook. Challenge pertama perlu enam materi dan enam formatif; selanjutnya perlu Challenge sebelumnya. Sumatif perlu seluruh tahapan. Tahap yang sudah selesai pada profil lama tetap dapat ditinjau meskipun prasyarat baru belum tercatat. Tidak ada progres otomatis yang ditambahkan untuk melengkapi data lama.

Penyimpanan tetap `voltquest.dynamic-electricity.v1`, versi 1, per profil. Properti opsional `draft` pada percobaan formatif menyimpan jawaban yang belum dikirim. Pengeditan draf tidak menaikkan attempts atau memberi kelulusan; submit menghapus draf dan mencatat jawaban/percobaan. Akun, XP, profil lain, pengamatan Challenge, dan hasil sumatif lama tetap dipertahankan. Penguncian lokal adalah alur UX, bukan keamanan server terhadap manipulasi localStorage.

Challenge tetap meminta pengamatan dan refleksi manual. Soal numerik formatif mempertahankan kunci dan toleransi yang ada. Dua uraian sumatif disimpan untuk ditinjau dengan rubrik, tanpa penilaian otomatis.

## E-book dan sumber

Belum ada PDF/EPUB e-book relevan di proyek. Tombol unduh nonaktif dengan status “E-book belum tersedia”; tidak dibuat berkas atau tautan palsu. Pemilik perlu menyediakan berkas sebelum unduhan dapat diaktifkan. Bagian sumber tampil di bawah katalog materi dan di akhir materi keenam.

Referensi yang ditinjau dan ditautkan di aplikasi:

- OpenStax, _University Physics Volume 2_, 9.3 Resistivity and Resistance: https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance
- OpenStax, 9.4 Ohm’s Law: https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law
- OpenStax, 9.5 Electrical Energy and Power: https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power
- OpenStax, 10.3 Kirchhoff’s Rules: https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules
- Spesifikasi pemutar: https://developers.google.com/youtube/iframe_api_reference

## Verifikasi

Tes `lesson-media` memeriksa keenam naskah, pemetaan video, loading setelah klik, lima lebar viewport, kontrol sintesis suara dengan engine tiruan yang deterministik, suara Indonesia yang tiba belakangan, pembacaan rumus, error embed, pembatalan dan browser tanpa speech. Ini tidak membuktikan kualitas suara fisik atau izin YouTube sebenarnya. `dynamic-learning`, `challenge-prerequisites`, dan `mission-path-cards` memeriksa kelulusan/revisi, draf, aturan berurutan, sumatif, serta preservasi profil lama. Build dan lint juga wajib lulus sebelum push.
