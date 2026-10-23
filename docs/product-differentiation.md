# Pembeda produk VoltQuest

Tanggal audit: 20 Oktober 2026. Cakupan: tahap **Perjelas Pembeda VoltQuest**. Dokumen ini mencatat kondisi kode setelah penyelarasan pesan aplikasi, keputusan desain, dan rancangan pengembangan berikutnya. Pembuatan dokumen ini tidak mengimplementasikan fitur adaptif atau melaksanakan penelitian pengguna.

**Pembaruan tahap 4 — 20 Oktober 2026:** alur empat langkah, prediksi, pengamatan manual, alasan refleksi, dan draf per profil/misi sudah diimplementasikan. Matriks aktual diselaraskan; konfirmasi kesulitan dan latihan adaptif tetap belum diimplementasikan. Bukti teknis ada pada [dokumentasi alur eksperimen](guided-experiment-flow.md).

**Riwayat revisi 3 — peninjauan lanjutan tahap 2:** keputusan relevan dari revisi 1–2 dipertahankan. Rancangan diperjelas pada batas interpretasi alasan siswa, penggunaan konfirmasi terstruktur, dan tindak lanjut ketika jawaban serta alasan tidak konsisten. Kode aplikasi dan pesan siswa tidak diubah dalam revisi ini. Riwayat revisi tersedia di bagian 15.

**Pembaruan tahap 6 (20 Oktober 2026):** tersedia 10 latihan mandiri dengan pilihan fokus, feedback, dan riwayat lokal terpisah. Audit kode tidak menemukan implementasi konfirmasi tahap 5. Rekomendasi khusus berdasarkan konfirmasi tetap belum aktif. Lihat [aturan, bank soal, penyimpanan, dan bukti teknis](practice-recommendations.md).

**Status terkini setelah integrasi tahap 5:** tersedia lima pertanyaan konfirmasi dan 25 aturan respons yang mencakup seluruh 15 pilihan salah. Bantuan mengikuti respons aktual dan menawarkan latihan dengan referensi percobaan/revisi yang divalidasi ulang. Pilihan latihan mandiri tetap tersedia; tidak ada diagnosis kemampuan atau penilaian tulisan bebas. [Rincian aturan dan bukti](concept-feedback.md). Pembaruan tahap 4/6 di atas merupakan riwayat kondisi pada waktu pengerjaannya.

## 1. Status bukti dan sumber audit

Gunakan tiga penanda berikut ketika mengutip dokumen ini dalam poster atau presentasi:

- **Fakta terverifikasi:** dapat ditelusuri ke kode, dokumen, atau hasil pemeriksaan yang tersedia.
- **Hipotesis:** dugaan kebutuhan atau manfaat yang harus diperiksa bersama siswa/guru. Belum merupakan temuan penelitian.
- **Usulan desain:** pengalaman yang dipilih untuk dikembangkan dan diuji. Belum menjadi kemampuan aplikasi kecuali dinyatakan tersedia.

Sumber audit internal:

| Sumber                                                                                     | Fakta yang diperiksa                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Data misi](../src/data/missions.ts)                                                       | Lima topik, cerita sekolah, target, langkah eksperimen, satu soal per misi, kunci, satu petunjuk salah dan satu penjelasan benar per misi.                                                                                |
| [Halaman misi](../src/components/MissionView.tsx)                                          | Pemeriksaan jawaban, tautan lab, feedback, dan kelanjutan misi. Semua pilihan salah pada misi yang sama menerima petunjuk yang sama.                                                                                      |
| [Aplikasi](../src/App.tsx)                                                                 | Onboarding, dashboard, pencarian/filter, modal badge/progres/profil, serta pemilihan misi berikutnya.                                                                                                                     |
| [Penyimpanan progres](../src/hooks/useProgress.ts)                                         | Data lokal: nama, ID misi selesai, ID misi yang tautan labnya pernah dibuka. Skema progres tetap. Draf prediksi, observasi, dan alasan memakai kunci terpisah melalui `useExperimentDraft`; pola kesalahan tidak direkam. |
| [Komponen UI](../src/components/LearningUI.tsx) dan [dialog](../src/components/Dialog.tsx) | Kartu misi, progress bar, logo, dan dialog dengan pengelolaan fokus.                                                                                                                                                      |
| [Pengujian otomatis](../tests/voltquest.spec.ts)                                           | Cakupan teknis alur misi, penyimpanan, profil, XP, pencarian, tata letak dan dialog. Pengujian bukan penelitian siswa atau pengukuran hasil belajar.                                                                      |
| [README](../README.md)                                                                     | Cara menjalankan, batas penyimpanan lokal, atribusi PhET, dan batas demo.                                                                                                                                                 |

Panduan DIMAS-TI 2026 yang ditelaah berasal dari `C:/Users/Aliya Dewi Rahmawati/Downloads/Buku Panduan DIMAS-TI 2026.pdf`, bagian UI/UX, halaman tercetak 11–14. Panduan menempatkan riset, perancangan, pengujian, kebaruan, dan manfaat akademis sebagai bagian penting karya. Tema menyebut integrasi sistem cerdas. Rancangan berbasis aturan di bawah merupakan pilihan desain tim, bukan bukti bahwa produk sudah memenuhi seluruh interpretasi tema atau memperoleh persetujuan panitia.

Belum tersedia wawancara, observasi siswa/guru, kajian pesaing sistematis, validasi ahli materi, atau evaluasi dampak akademis dalam pekerjaan ini. Pada penyusunan revisi 1 belum terdapat dokumen pembeda produk; revisi 2 dan 3 menggunakan dokumen yang sudah ada sebagai acuan. Perubahan dicatat di bagian 15.

## 2. Pengguna utama dan masalah yang dipilih

**Segmen pengguna utama — keputusan lingkup:** siswa SMA/MA Fase F yang sedang mempelajari listrik dinamis dan menggunakan browser, terutama melalui HP, untuk mengikuti eksperimen virtual mandiri atau tugas sekolah. Guru berperan sebagai narasumber dan penelaah materi; dashboard guru tidak masuk lingkup produk saat ini.

Situasi penggunaan yang diprioritaskan: siswa mengikuti satu misi melalui HP dan berpindah antara panduan VoltQuest dan simulasi PhET. Pengetahuan awal yang diasumsikan adalah mengenali besaran tegangan, arus, dan hambatan; asumsi ini perlu diperiksa dalam riset, bukan dijadikan syarat terkunci pada aplikasi. Produk tidak diarahkan menjadi LMS umum atau pengganti seluruh kegiatan pembelajaran guru.

**Masalah utama — hipotesis yang perlu diuji:** saat berpindah dari soal kelas ke simulasi terbuka, sebagian siswa mungkin belum mengetahui apa yang harus diubah, diamati, dan dijelaskan. Mereka dapat memilih jawaban atau memakai rumus tanpa menghubungkan perubahan rangkaian, hasil pengukuran, dan alasan konsepnya.

Rumusan kebutuhan: ketika mencoba rangkaian virtual, siswa membutuhkan tujuan eksperimen yang jelas, kesempatan membandingkan perkiraan dengan pengamatan, dan bantuan yang relevan ketika penjelasannya belum sesuai konsep.

**Rumusan masalah inti:** bagaimana membantu siswa menghubungkan perubahan yang mereka lakukan pada rangkaian dengan hasil pengukuran dan alasan konsepnya saat berpindah antara panduan dan simulasi?

**Pernyataan kebutuhan dari sudut pandang siswa — hipotesis desain:** “Saat mencoba rangkaian, aku ingin tahu apa yang perlu diubah dan dibandingkan agar bisa menjelaskan hasilnya serta menentukan bagian yang perlu kulatih.” Ini adalah rumusan tim, bukan kutipan peserta penelitian.

Rumusan ini belum menyatakan seberapa sering masalah terjadi atau bahwa semua siswa mengalaminya. Kedalaman materi dan kesesuaian dengan pembelajaran Fase F perlu ditelaah bersama guru fisika.

| ID  | Hipotesis kebutuhan/manfaat                                                                                  | Bukti yang perlu dikumpulkan                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| H1  | Tujuan dan pertanyaan pengamatan membantu siswa menentukan tindakan di simulasi.                             | Tindakan siswa saat menerima tugas, kebingungan yang muncul, dan penjelasan mereka tentang apa yang sedang diuji. |
| H2  | Prediksi sebelum eksperimen dan pengamatan sesudahnya membantu siswa menjelaskan hubungan V, I, dan R.       | Perbandingan prediksi, catatan hasil, serta alasan siswa pada soal transfer.                                      |
| H3  | Petunjuk berdasarkan pilihan dan pertanyaan konfirmasi lebih relevan daripada petunjuk umum satu misi.       | Respons siswa terhadap kedua bentuk petunjuk, kebutuhan bantuan, dan perubahan penjelasan setelah latihan.        |
| H4  | Masalah penerangan sekolah membantu siswa menghubungkan konsep rangkaian dengan keputusan penggunaan energi. | Alasan pemilihan rancangan dan kemampuan menjelaskan konsekuensi sakelar atau cabang yang terputus.               |
| H5  | Siswa dapat kembali dari tab PhET ke langkah VoltQuest yang tepat melalui HP.                                | Keberhasilan berpindah tab, titik kehilangan konteks, serta kebutuhan mengulang membaca panduan.                  |

## 3. Positioning dan value proposition

**Positioning tujuan:** VoltQuest adalah pendamping eksperimen listrik dinamis bagi siswa SMA/MA Fase F yang menghubungkan prediksi, pengamatan di PhET, dan penjelasan konsep melalui misi sekolah serta tindak lanjut berbasis indikasi kesulitan.

**Value proposition tujuan:** membantu siswa mengetahui apa yang perlu dicoba, apa yang perlu diamati, dan apa yang perlu dilatih berikutnya ketika mempelajari rangkaian listrik dalam konteks sekolah.

**Pernyataan yang sesuai versi berjalan:** VoltQuest mendampingi eksperimen listrik dinamis melalui masalah sekolah, prediksi tersimpan, panduan PhET, pengamatan manual, refleksi beralasan, dan petunjuk tetap per misi.

Kata _mendampingi_ menggambarkan struktur panduan yang tersedia. Prediksi tercatat dan pengamatan manual sudah tersedia sejak tahap 4. Konfirmasi pilihan dan tawaran latihan berdasarkan aturan kini tersedia pada tahap 5. Penilaian alasan bebas, validasi diagnosis, dan bukti efektivitas belum tersedia. Kebaruan kombinasi ini terhadap produk lain belum dibuktikan melalui kajian pembanding.

**Pembeda inti yang dituju, dalam satu kalimat:** satu alur eksperimen yang menghubungkan prediksi, pengamatan, dan alasan jawaban dengan pilihan latihan berikutnya melalui konfirmasi kesulitan.

Pemilihan fokus ini berangkat dari H1–H5: panduan memberi arah tindakan, observasi memberi bahan penjelasan, dan konfirmasi mencegah satu jawaban salah langsung dijadikan label kemampuan. Ini alasan desain yang dapat ditelusuri, belum temuan tentang efektivitasnya.

Pesan singkat untuk demo versi berjalan: “Pilih masalah sekolah, ikuti panduan eksperimen di PhET, lalu gunakan pengamatanmu untuk menjawab refleksi.” Jika menjelaskan arah produk, tambahkan secara terpisah bahwa konfirmasi serta tawaran latihan kini tersedia, tetapi validitas aturan dan manfaat belajarnya belum diteliti. Prediksi serta catatan sudah dapat diperagakan. Jangan menyampaikan mekanisme tujuan sebagai fitur yang sedang didemonstrasikan.

## 4. Tiga pilar pembeda yang diusulkan

| Pilar                              | Kesulitan yang ditangani — hipotesis                                               | Pengalaman tujuan dan alasan                                                                                                               | Dukungan aktual                                                                                                                | Kekurangan                                                                                                     | Bukti pengguna yang dibutuhkan                                                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Eksperimen dengan arah**         | Siswa belum tahu variabel yang diubah dan hasil yang dibandingkan.                 | Prediksi → panduan tindakan → pengamatan → penjelasan. Setiap langkah diarahkan untuk menghubungkan tindakan dan konsep.                   | Empat langkah per misi, panduan variabel, prediksi awal/perubahan, observasi manual, ringkasan, dan alasan refleksi tersimpan. | Pembandingan dilakukan siswa; belum ada evaluasi isi catatan atau validasi dampak belajar.                     | Apakah siswa dapat menjalankan langkah dan menjelaskan hubungan yang diamati tanpa diarahkan penguji?                   |
| **Kesalahan menjadi arah latihan** | Siswa menerima status salah tanpa mengetahui bagian penalaran yang perlu ditinjau. | Pilihan salah memicu pertanyaan konfirmasi, petunjuk relevan, dan soal penguatan. Aturan terbuka memudahkan penelaahan alasan rekomendasi. | Petunjuk umum asli, lima konfirmasi alasan, 25 aturan respons, dan latihan manual atau tawaran berdasarkan respons.            | Aturan belum ditelaah guru atau diuji bersama siswa; tidak ada riwayat diagnosis atau penilaian tulisan bebas. | Apakah petunjuk dipahami? Apakah penjelasan siswa pada soal baru membaik? Apakah aturan salah menafsirkan alasan siswa? |
| **Keputusan energi sekolah**       | Konsep rangkaian terasa terpisah dari situasi penggunaan.                          | Siswa memilih rancangan penerangan dan menjelaskan pengendalian ruang serta konsekuensi energi dengan asumsi yang jelas.                   | Cerita perpustakaan, koridor, robotika, daya, dan sekolah; misi final memandu tiga cabang paralel.                             | Final belum menyediakan pilihan rancangan, kendali sakelar, atau perbandingan konsumsi energi di VoltQuest.    | Apakah konteks dipahami dan siswa dapat menjelaskan alasan rancangan, bukan sekadar memilih label paralel?              |

Pilar pertama memberi dasar eksperimen, pilar kedua memberi arah latihan setelah refleksi, dan pilar ketiga menyediakan konteks penerapan. Ketiganya membentuk pembeda yang dituju; XP dan badge mendukung pencatatan penyelesaian.

| Pilar                          | Hipotesis dan keputusan yang mendasari | Bukti yang akan mendukung arah desain                                                                                   | Kondisi yang mengharuskan revisi                                                                                         |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Eksperimen dengan arah         | H1, H2, H5; D2 dan D3.                 | Siswa dapat menyebutkan variabel, menjalankan perbandingan, dan menghubungkan hasil dengan prediksi dalam uji formatif. | Panduan tetap membingungkan, perpindahan tab menghilangkan konteks, atau isian tidak digunakan untuk menjelaskan temuan. |
| Kesalahan menjadi arah latihan | H3; D4, D5, D6.                        | Penjelasan siswa mendukung interpretasi aturan; siswa memahami petunjuk dan dapat menjelaskan soal penguatan.           | Konfirmasi sering tidak mendukung indikasi awal atau petunjuk hanya membantu menebak kunci.                              |
| Keputusan energi sekolah       | H4; D7.                                | Siswa dapat menjelaskan kendali cabang dan menghubungkan daya serta waktu dengan konsumsi energi.                       | Siswa menganggap paralel selalu lebih hemat atau hanya mengulang label tanpa menelusuri jalur arus.                      |

Tabel ini menghubungkan arah produk dengan bukti yang perlu dicari. Tidak ada hasil uji yang telah diisikan. Komponen seperti login nama, pencarian, XP, dan badge mendukung pemakaian serta pencatatan, tetapi tidak cukup untuk membuktikan kebaruan mekanisme pembelajaran.

## 5. Pembagian peran siswa, VoltQuest, dan PhET

PhET Interactive Simulations, University of Colorado Boulder, adalah pembuat laboratorium eksternal. VoltQuest menautkan [Circuit Construction Kit: DC](https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html) di tab baru. Tidak ada integrasi API, pembacaan rangkaian, atau pengiriman hasil eksperimen otomatis antara kedua aplikasi dalam kode saat ini.

| Aktivitas                     | Yang dilakukan siswa                                                   | Yang disediakan VoltQuest                                                                   | Yang disediakan PhET                                                               |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Memulai misi                  | Membaca situasi dan menentukan pertanyaan yang akan dipelajari.        | Cerita, target, panduan tindakan, dan formulir prediksi tersimpan.                          | Laboratorium eksternal yang dapat dibuka dari tautan.                              |
| Menjalankan eksperimen        | Menyusun rangkaian, mengubah variabel, serta membaca hasil pengukuran. | Langkah eksperimen tertulis; tidak mengamati tindakan siswa.                                | Interaksi rangkaian dan alat ukur di lingkungan simulasinya.                       |
| Membandingkan hasil           | Menghubungkan tindakan, pengukuran, dan perkiraan.                     | Formulir pengamatan, perbandingan tertulis, dan ringkasan prediksi/catatan tersimpan.       | Tampilan hasil simulasi yang diamati siswa; tidak otomatis menjadi data VoltQuest. |
| Merefleksikan konsep          | Kembali ke VoltQuest dan memilih jawaban.                              | Soal, petunjuk umum, penjelasan benar, dan kesempatan mencoba lagi.                         | Tidak digunakan oleh VoltQuest untuk menilai jawaban.                              |
| Menentukan latihan berikutnya | Meninjau penjelasan dan memilih kelanjutan.                            | Tombol lanjut, latihan manual, dan tawaran berdasarkan respons konfirmasi yang tervalidasi. | Tidak dikendalikan oleh aturan VoltQuest.                                          |

Perbandingan yang dapat dipakai adalah **alur penggunaan**: membuka simulasi lalu merencanakan eksperimen sendiri dibanding mengikuti rangkaian misi VoltQuest yang diusulkan. Perbandingan ini belum diuji. Jangan menyimpulkan PhET tidak menyediakan materi, aktivitas pengajaran, atau dukungan belajar lainnya.

## 6. Alur pengalaman dan matriks fitur aktual–rencana

Alur tujuan: **masalah sekolah → prediksi → eksperimen PhET → catatan pengamatan → refleksi konsep → petunjuk sesuai indikasi kesulitan → latihan penguatan atau misi berikutnya**.

Cabang setelah refleksi: **jawaban dan alasan → pertanyaan konfirmasi → petunjuk yang sesuai → latihan penguatan**. Jika respons belum cukup jelas, tawarkan petunjuk umum dan pilihan “belum yakin”. Konfirmasi mendahului petunjuk khusus; jawaban benar awal tetap dapat diikuti pertanyaan alasan. Cabang konfirmasi kini tersedia melalui tahap 5: siswa memilih alasan, menerima bantuan, dan dapat membuka satu latihan yang ditawarkan. Latihan manual tahap 6 tetap tersedia dari refleksi/dashboard. Semua jalur opsional dan tidak menjadi diagnosis.

| Langkah/fitur                 | Status saat audit     | Bukti atau batas aktual                                                                                                             | Pekerjaan berikutnya                                                                                  |
| ----------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Masalah sekolah dan target    | Tersedia              | Lima cerita dan target pada data misi.                                                                                              | Validasi relevansi konteks bersama siswa/guru.                                                        |
| Prediksi siswa                | Tersedia              | Pilihan termasuk “Belum yakin”, alasan opsional, respons awal dan perubahan disimpan.                                               | Uji kejelasan dan beban pengisian bersama siswa.                                                      |
| Eksperimen PhET               | Tersedia sebagian     | Panduan pertanyaan, komponen, tindakan, variabel, dan hasil yang dicatat pada lima misi. Tautan eksternal hanya menandai pembukaan. | Uji penggunaan laboratorium eksternal bersama siswa; tidak ada pembacaan otomatis.                    |
| Catatan pengamatan            | Tersedia              | Isian manual tiap misi, satuan eksplisit, koma/titik desimal, perbandingan tertulis, dan perhitungan P/E dari input pada misi 4.    | Telaah materi dan kegunaan isian. Tidak memverifikasi pelaksanaan eksperimen.                         |
| Refleksi konsep               | Tersedia              | Soal asli, ringkasan, tulisan opsional, dan konfirmasi terstruktur setelah pengiriman.                                              | Telaah materi dan uji formatif; tulisan bebas tetap tidak dinilai.                                    |
| Petunjuk kesulitan            | Tersedia dengan batas | Petunjuk umum asli ditambah 25 aturan bantuan sesuai respons konfirmasi pada lima misi.                                             | Aturan tidak membuktikan diagnosis; perlu penelaahan dan pengujian siswa/guru.                        |
| Latihan penguatan             | Tersedia              | 10 latihan, pilihan manual, serta tawaran berdasarkan konfirmasi dengan konteks tervalidasi.                                        | Uji relevansi dan kejelasan alasan; tidak mengukur penguasaan.                                        |
| Misi berikutnya               | Tersedia              | Tombol lanjut berdasarkan urutan; hero memilih misi pertama yang belum selesai. Semua misi dapat dipilih dari dashboard.            | Uji apakah urutan dan pilihan bebas dipahami. Ini belum rekomendasi berdasarkan kesulitan.            |
| XP, badge, progres lokal      | Tersedia              | 100 XP sekali per misi; maksimum 500 XP. Data tersimpan di `voltquest.v1`.                                                          | Bedakan penyelesaian dari kebutuhan latihan; perubahan skema kelak harus mempertahankan progres lama. |
| Misi final penerangan         | Tersedia sebagian     | Panduan tiga cabang paralel dan satu refleksi.                                                                                      | Rancangan keputusan serta perhitungan energi; tampilkan asumsi beban dan durasi.                      |
| Riset dan validasi pendidikan | Belum tersedia        | Pengujian otomatis memeriksa aplikasi, bukan siswa.                                                                                 | Penelaahan materi, uji formatif, dan evaluasi terpisah bila hendak mengklaim dampak belajar.          |

### Batas bukti interaksi dan penyimpanan saat ini

| Peristiwa                             | Yang benar-benar diketahui dari kode                                                                                                 | Yang belum dapat disimpulkan                                                  | Konsekuensi bagi rancangan                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Membuka tautan lab                    | `visit(mission.id)` menyimpan ID misi dalam `visited`.                                                                               | Simulasi berhasil dimuat, siswa melakukan eksperimen, atau hasilnya benar.    | Gunakan istilah “tautan sudah dibuka”, bukan “eksperimen selesai”. Tidak ada waktu kunjungan atau identitas percobaan. |
| Berpindah ke tab PhET lalu kembali    | Isian dan langkah disimpan langsung pada perubahan, sebelum tautan dibuka.                                                           | Keberhasilan memuat atau melakukan kegiatan di PhET.                          | Draf dipulihkan bila penyimpanan berhasil; kegagalan penyimpanan diberi pemberitahuan.                                 |
| Refresh atau keluar dari halaman misi | Progres lama tetap di `voltquest.v1`; draf per profil/misi di `voltquest.experiments.v1`. Hash URL mempertahankan misi saat refresh. | Riwayat percobaan lengkap atau kebenaran penalaran.                           | Feedback sementara tidak dipulihkan atau diberi XP otomatis; pengiriman ulang tetap tanpa duplikasi XP.                |
| Jawaban sesuai kunci                  | Misi ditambahkan ke `completed` satu kali; XP dihitung dari jumlah misi selesai.                                                     | Siswa pernah mengerjakan lab, memberikan alasan benar, atau menguasai konsep. | Pisahkan penyelesaian dari kebutuhan latihan; refleksi saat ini tidak dikunci oleh kunjungan lab.                      |
| Mengulangi misi                       | Misi yang telah selesai tetap selesai; pengulangan tidak menambah XP.                                                                | Retensi pemahaman atau perbaikan penalaran.                                   | Rancangan latihan perlu bukti jawaban/alasan tersendiri, tanpa menghapus capaian penyelesaian.                         |

### Batas konsep pada penerapan energi sekolah

Paralel dipilih untuk memberi tiap ruang jalur dan kendali sakelar sendiri. Paralel tidak dengan sendirinya berarti lebih hemat energi. Dalam rancangan final kelak, pengurangan energi harus dihitung dari perubahan daya beban dan/atau lama pemakaian dengan `E = P × t`, sambil mempertahankan kebutuhan penerangan yang dijelaskan.

Contoh hitungan ideal untuk rancangan aktivitas, bukan hasil simulasi atau penghematan terukur: tiga ruang masing-masing memakai satu lampu 10 W selama 2 jam mengonsumsi total 60 Wh. Jika satu ruang kosong dimatikan selama seluruh 2 jam dan dua ruang lain tetap dipakai, total menjadi 40 Wh; selisihnya 20 Wh. Asumsinya daya tiap lampu konstan, tidak ada beban lain, dan pemadaman ruang kosong tidak mengurangi layanan dua ruang terpakai. Jangan menganggap dua susunan seri/paralel otomatis sebanding terang dan fungsinya.

## 7. Contoh pengalaman tujuan: misi Hukum Ohm

**Status bagian ini:** contoh angka ideal tetap bahan penelaahan, bukan isian siswa otomatis. Prediksi dan pengamatan manual sudah tersedia pada tahap 4; konfirmasi serta tawaran latihan pada sebagian butir 7-9 kini aktif melalui tahap 5. Alur penilaian alasan bebas dan kelanjutan otomatis berdasarkan penalaran pada contoh tetap rancangan. Lihat docs/concept-feedback.md untuk batas implementasi aktual.

1. **Situasi:** tim robotika sekolah menguji sebuah resistor. Mereka ingin mengetahui hubungan tegangan dan arus sebelum memilih komponen rangkaian. Gunakan resistor ohmik tetap 6 Ω dan abaikan hambatan kabel/sumber dalam contoh ideal ini.
2. **Prediksi:** “Jika tegangan dinaikkan dari 6 V menjadi 12 V dan hambatan tetap 6 Ω, apa yang terjadi pada arus? Jelaskan perkiraanmu.” Prediksi dicatat sebelum nilai harapan ditampilkan pada produk kelak.
3. **Eksperimen:** di PhET, susun sumber, resistor, dan kabel menjadi rangkaian tertutup. Tetapkan resistor 6 Ω. Ukur arus seri pada tegangan sumber 6 V dan 12 V; ukur beda potensial pada resistor dengan voltmeter yang dipasang paralel. Pertahankan resistor dan susunan yang sama. Ikuti rentang pengaturan alat yang tersedia; jika pengaturan berbeda, guru perlu menyesuaikan pasangan nilai dan kunci aktivitas.
4. **Pengamatan:** siswa mencatat tegangan terukur pada resistor, arus terukur, nilai hambatan yang ditetapkan, serta perubahan yang diamati. Jangan mengisi hasil siswa secara otomatis dengan nilai harapan.

Variabel bebas: beda potensial pada resistor. Variabel terikat: arus yang melewati resistor. Variabel yang dijaga tetap: hambatan ohmik 6 Ω, susunan rangkaian, dan asumsi kondisi komponen. Data yang kini dapat dicatat siswa pada tahap 4: kondisi A/B, V terukur dalam volt, I terukur dalam ampere, satu kalimat pengamatan, dan perbandingan dengan prediksi. Bentuk minimum tabel adalah dua baris pengamatan; contoh nilai harapan di bawah hanya untuk penelaahan materi.

| Kondisi contoh ideal | Tegangan pada resistor | Hambatan tetap | Arus harapan dari I = V/R |
| -------------------- | ---------------------- | -------------- | ------------------------- |
| A                    | 6 V                    | 6 Ω            | 1 A                       |
| B                    | 12 V                   | 6 Ω            | 2 A                       |

5. **Refleksi:** “Dengan V = 12 V pada resistor dan I = 2 A, berapa hambatannya? Tuliskan hubungan yang kamu gunakan.” Bandingkan penjelasan dengan pengamatan: tegangan dua kali lipat pada R tetap menghasilkan arus dua kali lipat pada model ini.
6. **Contoh respons hipotetis:** siswa memilih 24 Ω. Jawaban itu cocok dengan hasil 12 × 2, tetapi bisa juga berasal dari tebakan atau kekeliruan hitung.
7. **Konfirmasi yang diusulkan:** “Untuk mencari R dari V = I × R, hubungan mana yang kamu gunakan?” Jika siswa memilih R = V × I, tampilkan petunjuk menyusun ulang persamaan. Jika memilih R = V/I, minta periksa pembagian dan satuannya. Jika belum yakin, tampilkan contoh sederhana lalu beri kesempatan mencoba.
8. **Bantuan singkat:** “Agar R berdiri sendiri, bagi kedua ruas V = I × R dengan I. Cocokkan hasilnya dengan nilai resistor yang kamu pertahankan saat eksperimen.” Jawaban akhir 6 Ω diberikan dalam penjelasan setelah refleksi, bukan sebagai isian pengamatan siswa.
9. **Latihan penguatan:** “Jika V = 9 V dan I = 3 A pada resistor ohmik, berapa R?” Hasil harapan 3 Ω, dengan alasan R = V/I. Jika alasan dan hasil sesuai, tawarkan misi Daya Listrik; jika belum, tawarkan latihan menyusun ulang persamaan. Soal 9 V dan 3 A kini tersedia sebagai latihan mandiri tahap 6. Tahap 5 kini dapat menawarkan soal tersebut dari pilihan konfirmasi yang relevan; tulisan alasan bebas tetap tidak dinilai.

Penguasaan konsep tidak disimpulkan dari satu jawaban benar. Soal transfer dan penjelasan siswa menyediakan bukti tambahan untuk ditelaah, bukan jaminan diagnosis.

## 8. Rancangan penanganan miskonsepsi berbasis aturan

**Konteks historis:** bagian ini merekam rancangan tahap 2. Pernyataan belum menjadi kode di dalamnya merujuk kondisi saat rancangan disusun. Implementasi tahap 5 sekarang mencakup pilihan konfirmasi, bantuan respons, dan tawaran latihan; bukan seluruh usulan penilaian penalaran. Matriks fitur bagian 6 dan [audit implementasi](concept-feedback.md) menunjukkan kondisi aktual.

### Prinsip keputusan

Aturan dirancang eksplisit dan dapat ditelaah guru. Tidak ada machine learning, layanan AI, atau diagnosis otomatis dalam aplikasi saat ini. Rancangan ini bukan bukti validitas diagnosis.

Urutan keputusan yang diusulkan:

1. Simpan pilihan dan alasan jika diberikan siswa sebagai respons belajar, bukan label kemampuan permanen.
2. Pilihan salah memunculkan **indikasi kesulitan sementara**. Jangan menyatakan “kamu memiliki miskonsepsi X”.
3. Ajukan pertanyaan konfirmasi. Alasan yang tidak sesuai dugaan mengarah ke petunjuk umum atau permintaan penjelasan tambahan.
4. Bila konfirmasi mendukung pola, berikan petunjuk sesuai konsep dan satu latihan penguatan. Sediakan pilihan “belum yakin”.
5. Tinjau kembali melalui alasan dan soal transfer; tawarkan kelanjutan. Jawaban benar awal tetap dapat diikuti pertanyaan alasan tanpa menganggap konsep telah dikuasai.

### Pemetaan lengkap pilihan salah untuk kelima topik

Seluruh **15 pilihan salah** dalam data saat audit dipetakan di bawah. ID berawalan `draft-` adalah identitas rancangan; belum menjadi field atau aturan aplikasi. Kutipan pilihan adalah snapshot untuk penelaahan, bukan kunci pencocokan implementasi. Semua interpretasi adalah hipotesis yang perlu dikonfirmasi. Untuk respons ambigu, petunjuk umum dan pemeriksaan alasan lebih tepat daripada memaksakan label miskonsepsi.

| ID rancangan / konsep                                      | Pilihan salah yang ada                 | Indikasi sementara                                                                                                                         | Pertanyaan konfirmasi                                                                                      | Petunjuk setelah konfirmasi                                                                                         | Tindak lanjut yang diusulkan                                                                           |
| ---------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `draft-komponen-kabel` / sumber beda potensial             | “Kabel”                                | Mungkin menyamakan penghantar dengan penyedia beda potensial.                                                                              | “Apakah kabel menyediakan energi rangkaian atau menghubungkan komponen? Apa peran baterai?”                | Bedakan sumber beda potensial dan penghantar.                                                                       | Cocokkan baterai dan kabel dengan fungsi masing-masing, lalu jelaskan kebutuhan sumber.                |
| `draft-komponen-lampu` / sumber dan beban                  | “Lampu”                                | Mungkin menganggap komponen yang tampak menyala sebagai sumber energi rangkaian.                                                           | “Dari mana lampu memperoleh energi dan menjadi bentuk energi apa?”                                         | Lampu mengubah energi listrik; sumber menyediakan beda potensial.                                                   | Jelaskan peran lampu dan baterai pada rangkaian tertutup.                                              |
| `draft-komponen-sakelar` / kendali jalur                   | “Sakelar”                              | Mungkin menyamakan pemicu nyala dengan sumber beda potensial.                                                                              | “Jika sakelar ditutup tetapi baterai dilepas, apakah lampu akan menyala? Mengapa?”                         | Sakelar membuka atau menutup jalur; fungsi itu berbeda dari menyediakan beda potensial.                             | Bandingkan rangkaian dengan sumber dan tanpa sumber, sambil mempertahankan posisi sakelar.             |
| `draft-jalur-seri` / jalur arus                            | “Seri”                                 | Mungkin belum membedakan satu jalur dari cabang alternatif.                                                                                | “Ketika satu lampu seri dilepas, adakah jalur tertutup bagi lampu lain? Tunjukkan.”                        | Telusuri lintasan kembali ke sumber setelah lampu dilepas.                                                          | Bandingkan seri dan paralel dengan satu lampu putus, kemudian jelaskan jalurnya.                       |
| `draft-jalur-terbuka` / syarat aliran arus                 | “Terbuka”                              | Mungkin mencampur status sakelar/rangkaian dengan jenis susunan. Pilihan saja tidak cukup.                                                 | “Yang terbuka itu satu cabang atau jalur seluruh rangkaian? Cabang mana masih tertutup?”                   | Arus memerlukan jalur tertutup; satu cabang yang terputus berbeda dari semua jalur yang terputus.                   | Tandai jalur tertutup pada diagram. Revisi distraktor agar batas cabangnya jelas.                      |
| `draft-jalur-tanpa-sumber` / sumber energi                 | “Tanpa sumber tegangan”                | Alasan belum diketahui; bisa terkait fungsi sumber, salah baca, atau tebakan.                                                              | “Apa yang menggerakkan arus ketika sumber tegangan tidak ada?”                                             | Pastikan sumber dan jalur tertutup tersedia sebelum membandingkan jenis susunan.                                    | Tinjau peran sumber pada misi Komponen Rangkaian, lalu kembali menelusuri cabang.                      |
| `draft-ohm-kali` / penyusunan persamaan                    | “24 Ω”                                 | Nilai cocok dengan 12 × 2, tetapi prosesnya belum diketahui.                                                                               | “Dari V = I × R, hubungan apa yang kamu gunakan untuk mencari R?”                                          | Jika memilih perkalian, bagi kedua ruas dengan I. Jika memilih V/I, periksa pembagian dan satuan.                   | Soal 9 V dan 3 A dengan alasan; hasil harapan 3 Ω.                                                     |
| `draft-ohm-kurang` / operasi dan satuan                    | “10 Ω”                                 | Nilai cocok dengan 12 − 2; perlu penjelasan siswa.                                                                                         | “Bagaimana memperoleh 10? Apakah volt dan ampere dapat langsung dikurangkan menjadi ohm?”                  | Mulai dari hubungan besaran dan satuan V/A.                                                                         | Susun ulang V = I × R, lalu hitung soal baru dengan satuan.                                            |
| `draft-ohm-tambah` / operasi dan satuan                    | “14 Ω”                                 | Nilai cocok dengan 12 + 2; belum membuktikan bahwa siswa menjumlahkan.                                                                     | “Bagaimana memperoleh 14? Persamaan apa yang mendukung operasi itu?”                                       | Gunakan R = V/I dan periksa bahwa V/A menyatakan ohm.                                                               | Bedakan operasi sesuai persamaan dari penjumlahan angka pada soal.                                     |
| `draft-energi-daya-besar` / P, t, dan E                    | “Perangkat berdaya lebih besar”        | Mungkin mengaitkan daya besar dengan hemat atau mengabaikan durasi.                                                                        | “Jika 10 W dan 20 W sama-sama dipakai satu jam, berapa energi masing-masing?”                              | Gunakan E = P × t untuk durasi sama; pemilihan perangkat tetap mempertimbangkan fungsi.                             | Hitung 10 Wh dan 20 Wh, lalu bandingkan contoh dengan durasi berbeda.                                  |
| `draft-energi-selalu-sama` / perbandingan energi           | “Semua perangkat selalu sama”          | Mungkin mengabaikan nilai daya; bisa juga salah memahami kondisi soal.                                                                     | “Untuk waktu yang sama, apakah perubahan P pada E = P × t mengubah E? Jelaskan.”                           | Bedakan waktu yang sama dari daya yang sama.                                                                        | Bandingkan dua nilai P dengan t tetap dan jelaskan hasilnya.                                           |
| `draft-energi-kabel` / kecukupan informasi                 | “Perangkat dengan kabel lebih panjang” | Informasi pilihan tidak cukup untuk menyimpulkan konsumsi perangkat. Jangan menetapkan keyakinan tentang hambatan kabel dari pilihan saja. | “Data daya dan waktu apa yang dipakai untuk menyimpulkan energi perangkat ini?”                            | Bandingkan P dan t yang diberikan. Jika membahas kabel, diperlukan informasi rangkaian lain dan kesetaraan layanan. | Gunakan soal berdaya/durasi eksplisit; revisi opsi kabel yang ambigu.                                  |
| `draft-sekolah-seri-utama` / kendali tiap ruang            | “Rangkaian seri dengan satu sakelar”   | Mungkin menganggap satu kontrol utama cukup untuk kendali mandiri.                                                                         | “Jika sakelar itu dibuka untuk satu ruang, apa yang terjadi pada lampu ruang lain?”                        | Pada satu jalur seri, pemutusan jalur memengaruhi seluruh lampu di jalur itu.                                       | Bandingkan diagram sakelar utama dan sakelar tiap cabang.                                              |
| `draft-sekolah-paralel-tanpa-sakelar` / cabang dan kontrol | “Rangkaian paralel tanpa sakelar”      | Mungkin menganggap cabang terpisah sudah memberi kendali on/off.                                                                           | “Bagaimana mematikan satu ruang melalui sakelar tanpa melepas lampu/kabel dan tanpa mematikan ruang lain?” | Setiap cabang memerlukan sakelar yang hanya memutus jalur ruang tersebut.                                           | Telusuri satu sakelar dibuka pada tiga cabang paralel dan jelaskan ruang yang terpengaruh.             |
| `draft-sekolah-satu-cabang-seri` / independensi jalur      | “Semua lampu dalam satu cabang seri”   | Mungkin belum membedakan beberapa lampu dalam satu jalur dari beberapa cabang mandiri. Pilihan mirip distraktor seri sebelumnya.           | “Berapa jalur independen yang tersedia? Apa yang terjadi jika satu lampu pada jalur itu dilepas?”          | Jumlah lampu tidak sama dengan jumlah jalur independen; telusuri lintasannya.                                       | Ganti distraktor yang berulang dengan diagram kontrol dua cabang sekaligus, kemudian uji alasan siswa. |

Untuk jawaban benar, tampilkan penjelasan dan ajakan menyebutkan alasan. Pada rancangan berikutnya, jawaban benar tanpa alasan tetap tidak cukup untuk menetapkan penguasaan konsep; tidak perlu memaksakan label kesulitan atau mengulang hadiah XP. Status saat ini tetap “jawaban sesuai kunci”.

Aturan fallback yang diusulkan: konfirmasi tidak mendukung dugaan awal atau siswa memilih “belum yakin” → berikan contoh netral/petunjuk umum → tawarkan mencoba lagi. Tindak lanjut yang menyarankan misi sebelumnya harus disebut tawaran latihan, bukan perubahan otomatis urutan atau penghapusan misi selesai. Mekanisme pilihan konfirmasi, bantuan, dan tawaran latihan kini diimplementasikan secara terbatas pada tahap 5. Lihat matriks aktual dalam docs/concept-feedback.md; rancangan penelaahan alasan bebas tetap belum tersedia.

### Audit pilihan jawaban dan usulan perbaikan distraktor

Data soal belum diubah pada tahap ini. Sebelum menerapkan aturan, revisi dan validasi item berikut bersama guru:

| Misi | Kecukupan pilihan saat ini                                                                                                            | Perbaikan yang diusulkan                                                                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01   | Nama komponen dapat membedakan jawaban benar, tetapi belum menangkap alasan fungsi.                                                   | Tambahkan pilihan alasan atau konfirmasi fungsi setelah pemilihan komponen. Jangan menamai miskonsepsi berdasarkan nama yang dipilih saja.                                                                                                  |
| 02   | “Terbuka” dan “tanpa sumber tegangan” tidak setara sebagai alternatif jenis susunan.                                                  | Gunakan diagram berlabel A–D: seri, paralel, dua lampu satu cabang dengan sakelar, dan susunan yang satu lampunya tidak terhubung. Minta siswa menunjukkan jalur tertutup. Pastikan hanya satu diagram memenuhi kondisi soal.               |
| 03   | 24, 10, dan 14 cocok dengan operasi angka yang berbeda; semuanya masih dapat dipilih lewat tebakan.                                   | Pertahankan kunci 6 Ω, lalu tambahkan pertanyaan hubungan yang dipakai. Bedakan operasi keliru dari kesalahan aritmetika dengan konfirmasi.                                                                                                 |
| 04   | “Kabel lebih panjang” tidak cukup untuk menyimpulkan konsumsi energi perangkat tanpa besaran lain; opsi tidak menjelaskan alasan.     | Gunakan perangkat dengan daya dan durasi eksplisit, misalnya 10 W dan 20 W selama satu jam. Tanyakan energi dan alasannya; perbandingan ini belum mengukur kesetaraan fungsi/efisiensi cahaya.                                              |
| 05   | “Seri dengan satu sakelar” dan “semua lampu dalam satu cabang seri” mirip. Soal kontrol mandiri belum menunjukkan penempatan sakelar. | Gunakan empat diagram dengan penempatan sakelar berbeda: sakelar utama, sakelar tiap cabang, cabang tanpa sakelar, dan sakelar yang memutus dua cabang sekaligus. Jelaskan bahwa kendali dilakukan melalui sakelar, bukan melepas komponen. |

Rencana representasi aturan untuk pengembangan berikutnya: `missionId`, `optionId` stabil, `indicationId`, pertanyaan konfirmasi, pemetaan respons konfirmasi, petunjuk, serta ID latihan. Jangan memakai teks pilihan atau posisi array sebagai satu-satunya identitas aturan. Tinjau kebutuhan penyimpanan lokal dan migrasi profil sebelum menambah data. Tidak ada skema atau mesin aturan baru yang dibuat dalam tahap ini.

### Batas interpretasi alasan dan kontrak keputusan yang diusulkan

**Status: rancangan untuk penelaahan, belum menjadi kode atau instrumen yang tervalidasi.** Mekanisme berbasis aturan memerlukan respons konfirmasi terstruktur dengan pilihan yang jelas. Alasan tertulis bebas dapat diminta sebagai bahan refleksi atau penelaahan guru, tetapi tidak otomatis dipahami atau dinilai oleh rancangan ini. Jangan menambahkan pencocokan kata kunci lalu mengklaimnya sebagai pemahaman penalaran siswa.

| Masukan yang diusulkan                                       | Penggunaan yang diizinkan dalam rancangan                                          | Batas interpretasi                                                                                                              |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ID soal/versi dan ID pilihan jawaban                         | Menentukan kunci dan pertanyaan konfirmasi yang terkait dengan soal tersebut.      | Posisi pilihan atau teks yang berubah tidak boleh mengubah arti aturan secara diam-diam.                                        |
| ID pertanyaan dan pilihan konfirmasi, termasuk “belum yakin” | Memilih petunjuk yang dapat ditelusuri ke alasan terstruktur yang dipilih.         | Pilihan konfirmasi masih dapat ditebak dan tidak menjadi diagnosis pasti.                                                       |
| Penjelasan tertulis bebas                                    | Disimpan sebagai draf refleksi per profil dan misi pada tahap 4.                   | Belum ada layanan atau metode untuk menilai isi tulisan secara otomatis. Penyimpanan mencakup tulisan, tetapi tidak menilainya. |
| Nilai pengamatan yang diisi siswa, beserta satuan            | Membandingkan kelengkapan dan konsistensi dengan asumsi aktivitas yang ditetapkan. | Nilai adalah laporan siswa; kecocokan dengan nilai ideal tidak membuktikan eksperimen PhET telah dilakukan.                     |
| Status misi selesai dan XP lama                              | Mempertahankan catatan penyelesaian yang sudah diperoleh.                          | Status lama bukan bukti penalaran untuk percobaan baru dan tidak boleh dihapus saat menawarkan latihan tambahan.                |

Contoh keputusan operasional pada soal Hukum Ohm, V = 12 V dan I = 2 A:

| Respons hipotetis                            | Respons konfirmasi terstruktur                            | Bantuan yang diusulkan                                                                                           | Yang tidak disimpulkan                                                                           |
| -------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Memilih 24 Ω                                 | Memilih hubungan R = V × I.                               | Petunjuk menyusun ulang V = I × R, kemudian latihan 9 V dan 3 A.                                                 | Tidak menetapkan label kemampuan permanen atau menyatakan satu miskonsepsi pasti.                |
| Memilih 24 Ω                                 | Memilih hubungan R = V/I.                                 | Minta memeriksa hasil pembagian 12/2 dan satuan, bukan langsung mengulang penjelasan perkalian.                  | Tidak menganggap hubungan rumusnya pasti salah hanya karena hasil akhir salah.                   |
| Memilih 10 Ω atau 14 Ω                       | Memilih “belum yakin”.                                    | Contoh netral tentang hubungan V, I, R, lalu kesempatan mencoba lagi.                                            | Tidak menyimpulkan siswa melakukan pengurangan atau penjumlahan tanpa alasan yang mendukung.     |
| Memilih 6 Ω                                  | Memilih hubungan R = V × I.                               | Tunjukkan bahwa hubungan yang dipilih tidak konsisten dengan hasil; tawarkan peninjauan persamaan dan soal baru. | Tidak menyebut siswa sudah menguasai konsep atau menghapus XP penyelesaian yang telah diberikan. |
| Memilih jawaban apa pun                      | Tidak mengisi konfirmasi atau memberi tulisan bebas saja. | Jangan mengeluarkan keputusan khusus berbasis tulisan; tawarkan petunjuk umum atau pilihan konfirmasi.           | Tidak menganggap alasan yang belum terbaca sebagai bukti kesulitan tertentu.                     |
| Mengisi pengamatan berbeda dari contoh ideal | Pengaturan rangkaian atau satuan belum jelas.             | Minta memeriksa nilai R, letak alat ukur, sumber tegangan, dan satuan sebelum membandingkan hasil.               | Tidak menyatakan siswa pasti salah konsep atau pasti tidak melakukan eksperimen.                 |

Konfirmasi tersebut merupakan jalur bantuan yang perlu diuji, bukan gerbang yang sudah berlaku pada aplikasi. Evaluasi berikutnya perlu memeriksa apakah siswa memahami pilihan konfirmasi dan apakah bantuan sesuai dengan penjelasan mereka. Bukti tersebut menentukan apakah aturan dipertahankan, diperbaiki, atau diganti dengan petunjuk umum.

## 9. Alasan keputusan desain

| ID  | Keputusan                                                                 | Alasan                                                                                                                   | Risiko/hal yang harus divalidasi                                                                            |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| D1  | Pertahankan satu segmen dan lima topik listrik dinamis.                   | Membatasi beban navigasi dan membuat hubungan antarmisi dapat ditelaah.                                                  | Kebutuhan serta kedalaman konsep masih perlu dikonfirmasi guru/siswa.                                       |
| D2  | Tempatkan VoltQuest sebagai pendamping PhET.                              | Struktur tugas dan refleksi menjadi kontribusi yang dapat ditunjukkan dari kode. Atribusi menjaga pembagian peran jelas. | Pindah tab dapat memutus konteks; uji pada HP nyata.                                                        |
| D3  | Jadikan prediksi–observasi–penjelasan sebagai alur tujuan.                | Menjadikan hubungan tindakan, hasil, dan konsep sebagai fokus pengalaman.                                                | Tambahan langkah dapat membebani siswa; uji apakah tiap isian berguna.                                      |
| D4  | Rancang aturan yang dapat dijelaskan sebelum mempertimbangkan layanan AI. | Pemetaan alasan dan petunjuk dapat diperiksa guru, sesuai lingkup lokal, dan mudah ditelusuri.                           | Aturan terbatas serta distraktor ambigu dapat salah membaca kesulitan. Belum ada bukti kecocokan diagnosis. |
| D5  | Gunakan pertanyaan konfirmasi sebelum petunjuk khusus.                    | Satu pilihan tidak menjelaskan apakah siswa menebak, salah hitung, atau salah memahami konsep.                           | Konfirmasi harus singkat dan tidak mengarahkan siswa sekadar menebak kunci.                                 |
| D6  | Pisahkan penghargaan penyelesaian dari penguasaan konsep.                 | Status selesai berasal dari satu jawaban benar; XP tidak mencatat penalaran atau transfer.                               | Pesan kemajuan harus tetap memotivasi tanpa menjanjikan hasil belajar.                                      |
| D7  | Pertahankan konteks penerangan sekolah untuk penerapan.                   | Menyediakan alasan penggunaan rangkaian dan sakelar yang berkaitan dengan ruang sekolah.                                 | Konteks belum divalidasi; konsumsi energi harus memakai asumsi daya/durasi yang eksplisit.                  |
| D8  | Selaraskan copy sekarang, tunda implementasi fitur adaptif.               | Klaim aplikasi perlu sesuai kemampuan yang berjalan; tahap ini mematangkan rancangan sebelum memperluas fitur.           | Jangan memasukkan rancangan masa depan sebagai fitur tersedia dalam poster/demo.                            |

## 10. Penyelarasan pesan aplikasi pada tahap ini

| Area                     | Pesan setelah perbaikan                                                                                              | Alasan                                                                          |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Onboarding               | Eksperimen PhET dan refleksi singkat.                                                                                | Menjelaskan aktivitas yang benar-benar tersedia.                                |
| Dashboard                | “Amati rangkaian, jelaskan temuanmu.”                                                                                | Mengarahkan perhatian pada hubungan pengamatan dan konsep.                      |
| Briefing dan lab         | Masalah sekolah; “Coba. Amati. Jelaskan.”                                                                            | Membuat fungsi cerita dan panduan lebih jelas.                                  |
| Refleksi                 | Menghubungkan pengamatan dengan konsep.                                                                              | Memberi tujuan pada pertanyaan setelah eksperimen.                              |
| Pengulangan soal/progres | Ajakan menjelaskan alasan; progres menunjukkan langkah yang ditempuh.                                                | Menghapus pesan penguasaan konsep yang sebelumnya mengikuti satu jawaban benar. |
| Tentang VoltQuest        | Peran pendamping, petunjuk tetap per misi, makna XP, penyimpanan demo, atribusi, dan batas pembacaan aktivitas PhET. | Menyelaraskan ekspektasi tanpa menjanjikan adaptasi yang belum tersedia.        |

Perubahan terbatas pada dokumentasi dan teks. Layout, navigasi, data soal, kunci, XP, serta skema `voltquest.v1` dipertahankan. Eksperimen tetap dikerjakan siswa di PhET. Teks tujuan belajar adalah sasaran aktivitas, bukan sertifikasi bahwa sasaran telah dicapai.

## 11. Rencana validasi singkat

**Status: rencana, belum dilaksanakan.** Usulan awal: 5 siswa dari segmen sasaran dan 1 guru fisika untuk uji formatif skala kecil. Jumlah ini bukan sampel representatif dan tidak cukup untuk menyimpulkan dampak populasi.

1. **Wawancara kebutuhan:** minta siswa menceritakan pengalaman belajar V, I, R dan menggunakan simulasi; minta guru menjelaskan kesulitan yang diamati. Jangan mengenalkan solusi terlebih dahulu. Catat kutipan dengan izin dan tandai temuan nyata terpisah dari H1–H5.
2. **Penelaahan guru:** periksa target, asumsi resistor ohmik, satuan, pertanyaan, distraktor, konfirmasi, dan petunjuk. Catat koreksi yang diminta; jangan menganggap persetujuan materi sebagai bukti efektivitas UX.
3. **Uji alur saat ini:** siswa memilih misi, membaca panduan, membuka PhET, kembali, menjawab, mencoba ulang, dan menemukan progres. Amati tanpa mengarahkan langkah. Catat kebutuhan bantuan, kehilangan konteks, kesalahan navigasi, dan komentar tentang keterbacaan.
4. **Uji rancangan tujuan:** setelah tersedia prototipe, periksa alur prediksi–observasi–refleksi serta petunjuk berbasis konfirmasi. Sebelum itu, rancangan hanya dapat dibahas sebagai skenario; jangan melaporkan keberhasilan fitur yang belum dibuat.
5. **Iterasi:** susun masalah menurut hambatan penyelesaian tugas, ubah desain, lalu uji kembali bagian yang berubah. Simpan pasangan bukti sebelum–sesudah serta alasan perubahan.

| Pertanyaan evaluasi                                           | Cara mencatat                                                                                                    | Batas interpretasi                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Apakah siswa tahu tindakan dan pengamatan yang diminta?       | Catat tugas berhasil mandiri, berhasil dengan bantuan, atau belum berhasil; tampilkan jumlah dan jumlah peserta. | Belum merupakan bukti peningkatan nilai fisika.                                          |
| Apakah siswa dapat kembali dari tab PhET?                     | Catat waktu, bantuan, langkah salah, perangkat, dan konteks jaringan.                                            | Hasil browser emulasi tidak menggantikan observasi HP nyata.                             |
| Apakah petunjuk sesuai alasan kesalahan?                      | Simpan respons, konfirmasi, petunjuk yang muncul, dan penjelasan siswa setelahnya.                               | Respons tunggal tidak menjadi label miskonsepsi permanen.                                |
| Apakah siswa dapat menerapkan hubungan konsep pada soal baru? | Telaah alasan soal transfer dengan rubrik guru.                                                                  | Perubahan singkat pada sampel kecil belum membuktikan dampak kausal atau jangka panjang. |

Kriteria formatif usulan yang ditetapkan sebelum uji: minimal 4 dari 5 siswa dapat menyelesaikan alur buka lab–kembali–refleksi tanpa bantuan penguji, dan semua hambatan yang menyebabkan tugas terhenti ditangani sebelum demo. Angka ini adalah target desain internal, bukan hasil, standar lomba, atau pembuktian statistik. Rencana evaluasi dampak belajar memerlukan desain penelitian terpisah.

## 12. Batasan klaim dan tindak lanjut

| Dapat disampaikan tentang versi berjalan                                                                                                                                                               | Masih berupa tujuan/rancangan                                                                                                                                                | Memerlukan bukti tambahan                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Lima misi dengan empat langkah, prediksi, panduan variabel PhET, catatan manual, alasan refleksi, petunjuk tetap, XP, badge, progres dan draf lokal, serta 10 latihan mandiri dengan riwayat terpisah. | Perancang penerangan interaktif; penilaian alasan bebas tidak tersedia. Konfirmasi, bantuan terstruktur, dan tawaran latihan sudah aktif dengan batas yang didokumentasikan. | Kebutuhan siswa, kesesuaian materi, efektivitas UX, manfaat akademis, serta kebaruan terhadap produk lain. |
| PhET merupakan laboratorium eksternal; VoltQuest menyediakan panduan dan refleksi.                                                                                                                     | Misi final dengan pemilihan rancangan dan perbandingan energi.                                                                                                               | Klaim peningkatan pemahaman memerlukan evaluasi belajar yang sesuai.                                       |
| Aplikasi memberi status selesai ketika jawaban sesuai kunci.                                                                                                                                           | Pengarahan belajar yang mempertimbangkan alasan dan indikasi kesulitan.                                                                                                      | Penguasaan konsep tidak disimpulkan dari XP, badge, atau satu jawaban.                                     |

Jangan menggunakan klaim “pertama”, “satu-satunya”, “paling efektif”, “AI yang mendiagnosis siswa”, “memantau eksperimen PhET”, atau “terbukti meningkatkan hasil belajar” berdasarkan pekerjaan tahap ini. Penyebutan rancangan adaptif dalam poster harus diberi status rencana. Sumber eksternal, aset, dan kontribusi tim perlu dicantumkan secara jujur; kepatuhan keseluruhan karya mengikuti ketentuan panitia.

Tiga pekerjaan berikutnya:

1. **Validasi kebutuhan dan materi:** wawancara siswa/guru serta penelaahan skenario Hukum Ohm dan distraktor; hasilnya menentukan revisi rancangan.
2. **Lanjutkan alur Hukum Ohm:** prediksi dan observasi manual sudah tersedia; berikutnya telaah konfirmasi dan latihan penguatan berbasis aturan; pertahankan progres lokal lama dan tampilkan alasan tindak lanjut.
3. **Uji alur tersebut pada HP nyata:** iterasikan hambatan terbesar, dokumentasikan temuan dan perubahan untuk bahan poster/video, lalu putuskan perluasan ke empat misi lain.

## 13. Kriteria selesai tahap perumusan pembeda

- [x] Segmen, masalah utama, positioning, dan value proposition dirumuskan; asumsi ditandai.
- [x] Tiga pilar dihubungkan dengan pengalaman, alasan, dukungan aktual, dan kebutuhan bukti.
- [x] Pembagian peran VoltQuest, siswa, dan PhET dijelaskan.
- [x] Alur tujuan dan matriks aktual–rencana tersedia.
- [x] Contoh lengkap Hukum Ohm menggunakan konsep dan satuan yang konsisten.
- [x] Pemetaan awal kelima topik, konfirmasi, tindak lanjut, dan audit distraktor tersedia.
- [x] Pesan aplikasi dan README diselaraskan dengan kemampuan berjalan.
- [x] Rencana riset dan batas klaim dicatat tanpa hasil penelitian rekaan.

Checklist ini menunjukkan penyelesaian **perumusan dan dokumentasi pembeda**. Validasi kebutuhan, implementasi adaptasi, dan pengujian pengguna tetap pekerjaan berikutnya; checklist tidak menyatakan produk telah terbukti unik, efektif, atau siap juara.

## 14. Riwayat verifikasi

### Revisi 1 — dokumentasi awal dan penyelarasan copy

Verifikasi pada 20 Oktober 2026 setelah perubahan dokumentasi dan copy pada revisi 1:

- `npm.cmd run build`: berhasil, termasuk pemeriksaan TypeScript dan build Vite.
- `npm.cmd run lint`: berhasil tanpa peringatan.
- `$env:PLAYWRIGHT_CHANNEL = 'chrome'; npm.cmd run test:e2e`: 6 pengujian yang sudah ada berhasil pada konfigurasi desktop dan mobile. Assertion pesan pengulangan soal diperbarui agar sesuai copy baru; tidak ada pengujian baru yang ditambahkan.
- Screenshot onboarding dan dashboard mobile, serta halaman misi desktop diperiksa untuk penempatan teks. Pengujian tata letak yang sudah ada memeriksa lebar 320, 390, 768, 1024, dan 1440 piksel.

Pemeriksaan teknis menggunakan Chrome dengan emulasi perangkat untuk konfigurasi mobile. Ini tidak membuktikan kompatibilitas seluruh perangkat, efektivitas pembelajaran, atau keberhasilan penggunaan oleh siswa. Pengujian pembukaan PhET memakai respons eksternal tiruan; isi dan ketersediaan laboratorium PhET tidak diuji.

File yang dibuat: `docs/product-differentiation.md`. File yang diperbarui: `src/App.tsx`, `src/components/MissionView.tsx`, `README.md`, `index.html`, serta satu assertion copy pada `tests/voltquest.spec.ts`. Tidak ada perubahan pada data soal, penyimpanan profil, konfigurasi Vite, dependensi, atau stylesheet.

### Revisi 2 — audit dan penajaman dokumentasi

Audit ulang membandingkan dokumen dengan `src/App.tsx`, `src/components/MissionView.tsx`, `src/data/missions.ts`, `src/hooks/useProgress.ts`, dan cakupan pengujian yang tersedia. Pesan onboarding, dashboard, briefing, feedback, progres, Tentang VoltQuest, dan README tetap sesuai kemampuan aktual. Tidak ada perubahan kode, copy siswa, atau perilaku aplikasi dalam revisi 2. Hasil build/lint dan enam pengujian di atas merupakan catatan revisi 1, bukan pengujian baru untuk revisi 2.

Hasil pemeriksaan revisi 2:

- Format `README.md` dan dokumen ini diperiksa menggunakan Prettier.
- Pembacaan data misi aktual mengonfirmasi terdapat 15 pilihan salah; seluruhnya tercantum sebagai kutipan pilihan dalam tabel pemetaan.
- Sebanyak 13 tautan lokal/anchor pada kedua dokumen diperiksa dan valid. Tautan eksternal tidak diuji pada revisi ini.
- Penjelasan siklus state, kunjungan lab, dan penyimpanan berasal dari audit kode. Tidak ada klaim pengujian baru pada perangkat siswa.
- Build, lint, dan pengujian aplikasi tidak diulang karena revisi ini hanya mengubah dokumentasi. Tidak ada pengujian baru yang dibuat.

### Revisi 3 — batas interpretasi dan konsistensi keputusan

Audit ulang memeriksa posisi fitur pada `src/App.tsx`, penggunaan satu `mission.hint` untuk semua jawaban salah di `src/components/MissionView.tsx`, pilihan serta kunci pada `src/data/missions.ts`, dan data yang disimpan oleh `src/hooks/useProgress.ts`. Struktur tiga pilar, atribusi, pesan aplikasi, serta status fitur pada dokumen tetap sesuai kode. Perubahan revisi 3 dibatasi pada dokumen ini dan README.

Hasil pemeriksaan revisi 3: format kedua dokumen lolos Prettier; seluruh 15 pilihan salah cocok dengan data misi; 15 ID rancangan unik; 13 tautan lokal/anchor valid. Perbandingan SHA-256 sebelum dan sesudah menunjukkan tidak ada perubahan pada 10 file implementasi, pengujian, dan konfigurasi yang dicatat dalam audit. Hasil build/lint dan pengujian aplikasi pada revisi 1 tetap merupakan riwayat; tidak dijalankan ulang untuk perubahan dokumentasi revisi 3. Tidak ada klaim riset pengguna, validasi aturan, atau implementasi adaptif baru.

## 15. Ringkasan perubahan antarversi

| Revisi              | Perubahan penting                                                                                                                                               | Alasan                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1 — 20 Oktober 2026 | Dokumen awal: tiga pilar, pembagian peran PhET, alur tujuan, contoh Hukum Ohm, pemetaan awal, dan rencana validasi; teks aplikasi diselaraskan.                 | Memisahkan kontribusi produk, fitur berjalan, dan rencana pengembangan.                                                       |
| 2 — 20 Oktober 2026 | Masalah inti dan situasi penggunaan dipertegas; tiap pilar dihubungkan dengan hipotesis, keputusan, bukti yang dicari, dan kondisi revisi.                      | Agar pembeda dapat dijelaskan dan diperiksa melalui pengalaman siswa.                                                         |
| 2 — 20 Oktober 2026 | Pemetaan diperluas menjadi 15 pilihan salah aktual dengan ID rancangan, pertanyaan konfirmasi, petunjuk, dan tindak lanjut; fallback respons ambigu diperjelas. | Agar rancangan cukup spesifik untuk ditelaah sebelum implementasi, tanpa menganggap jawaban salah sebagai diagnosis.          |
| 2 — 20 Oktober 2026 | Variabel eksperimen, kebutuhan data pengamatan, batas state/penyimpanan, dan makna indikator kunjungan lab diperjelas.                                          | Agar klaim demo serta kebutuhan pengembangan sesuai bukti yang tersedia.                                                      |
| 2 — 20 Oktober 2026 | Hubungan cabang paralel, kendali sakelar, daya, waktu, dan energi diperjelas dengan contoh hitungan ideal.                                                      | Mencegah klaim bahwa paralel dengan sendirinya menghasilkan penghematan energi.                                               |
| 2 — 20 Oktober 2026 | README diringkas menjadi panduan pembeda saat ini dan tujuan, serta menautkan bagian utama dokumen. Riwayat pemeriksaan dibedakan per revisi.                   | Memudahkan pemakaian dokumen tanpa menyamakan perumusan, implementasi, dan pembuktian manfaat.                                |
| 3 — 20 Oktober 2026 | Batas penilaian tulisan bebas, masukan konfirmasi terstruktur, dan contoh keputusan pada jawaban/alasan yang tidak konsisten ditambahkan.                       | Agar implementasi berikutnya tidak mengklaim memahami alasan bebas atau menyimpulkan penguasaan konsep dari hasil akhir saja. |
| 3 — 20 Oktober 2026 | Konsistensi kode, dokumentasi, dan pesan produk diperiksa ulang; riwayat pemeriksaan dipisahkan dari pengujian revisi sebelumnya.                               | Menjaga klaim serta lingkup tahap 2 tetap dapat ditelusuri.                                                                   |
| 4 — 20 Oktober 2026 | Tahap 4 mengimplementasikan empat langkah, draf per profil/misi, catatan manual dan alasan refleksi. Matriks aktual diperbarui.                                 | Memungkinkan kelanjutan draf tanpa mengubah progres lama atau mengklaim pembacaan PhET/adaptasi.                              |

File yang diperbarui pada revisi 2: `docs/product-differentiation.md` dan `README.md`. Tidak ada file produk atau pengujian baru yang dibuat. Tiga pekerjaan berikutnya pada bagian 12 tetap berlaku; revisi ini tidak melaksanakan riset, membangun fitur adaptif, atau menjalankan tahap lain secara penuh.

File yang diperbarui pada revisi 3 juga terbatas pada `docs/product-differentiation.md` dan `README.md`. Kriteria selesai bagian 13 berlaku untuk perumusan pembeda; implementasi dan pembuktian manfaat tetap mengikuti tiga pekerjaan berikutnya pada bagian 12.

Pembaruan tahap 6 (20 Oktober 2026): menambahkan bank 10 latihan, pilihan fokus manual, feedback, dan penyimpanan latihan terpisah. Matriks aktual diperbarui; riwayat revisi 1-4 di atas tetap merupakan catatan pekerjaan sebelumnya. Hasil verifikasi tahap 6: build/lint lolos, 32 pengujian E2E lolos, dan audit 145 keadaan/ukuran tanpa temuan pada pemeriksaan yang dicakup. Rincian dan keterbatasan tersedia pada [dokumentasi latihan](practice-recommendations.md).

Pembaruan tahap 5 setelah tahap 6 (20 Oktober 2026): lima konfirmasi, 25 aturan respons, pemetaan 15 pilihan salah, penyimpanan terpisah, dan sumber latihan tervalidasi telah aktif. Bukti lama tetap historis; dokumentasi terbaru ada pada [audit konfirmasi dan feedback](concept-feedback.md). Belum ada validasi aturan bersama guru/siswa atau klaim peningkatan hasil belajar.
