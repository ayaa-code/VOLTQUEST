export type LessonBlock = {
  kind: 'paragraph' | 'heading' | 'formula'
  text: string
  spoken?: string
}
export type Lesson = {
  title: string
  videoId: string
  videoNotice?: string
  blocks: LessonBlock[]
}
const p = (text: string): LessonBlock => ({ kind: 'paragraph', text })
const h = (text: string): LessonBlock => ({ kind: 'heading', text })
const f = (text: string, spoken: string): LessonBlock => ({
  kind: 'formula',
  text,
  spoken,
})

// Full user-provided manuscript, edited for spelling, units, and physical accuracy.
// IDs match the existing learning records; no stored progress is renamed.
export const lessons: Record<number, Lesson> = {
  1: {
    title: 'Arus Listrik',
    videoId: 'qYoF_02J_R4',
    blocks: [
      p(
        'Arus listrik adalah laju perpindahan muatan listrik melalui suatu penampang penghantar. Pada kawat logam, muatan yang bergerak terutama adalah elektron bebas. Agar arus dapat mengalir terus-menerus, diperlukan rangkaian tertutup dan beda potensial dari sumber, misalnya baterai atau aki.',
      ),
      p(
        'Pada rangkaian luar sumber DC, elektron bergerak dari kutub negatif menuju kutub positif. Namun, arah arus konvensional didefinisikan berlawanan dengan gerak elektron, yaitu dari kutub positif menuju kutub negatif. Kedua arah ini perlu dibedakan saat membaca atau menganalisis rangkaian.',
      ),
      p(
        'Bayangkan kawat sebagai jalan dan elektron sebagai kendaraan. Ketika baterai memberikan beda potensial, medan listrik di dalam kawat memberikan gaya pada elektron bebas sehingga timbul gerak terarah. Gerak acak elektron yang terjadi karena suhu saja tidak cukup disebut arus listrik; yang penting adalah adanya perpindahan bersih muatan ke satu arah. Rangkaian juga harus tertutup. Jika sakelar terbuka, jalur penghantar terputus sehingga arus tunak tidak dapat mengalir.',
      ),
      h('Rangkaian terbuka dan rangkaian tertutup'),
      p(
        'Rangkaian tertutup memiliki jalur lengkap dari sumber listrik, melalui komponen, lalu kembali ke sumber. Dalam keadaan ini lampu dapat menyala karena ada lintasan bagi muatan untuk bergerak. Rangkaian terbuka memiliki bagian yang terputus, misalnya sakelar dalam posisi mati atau kabel yang lepas. Tidak ada arus tunak yang mengalir pada rangkaian terbuka. Saat melakukan percobaan dengan baterai, jangan langsung menghubungkan kedua kutub baterai hanya dengan kabel karena hubungan singkat dapat membuat kabel atau baterai panas.',
      ),
      h('Sumber arus searah'),
      p(
        'Sumber arus searah atau DC memberikan arah arus yang tetap pada rangkaian. Contohnya adalah elemen Volta, baterai kering, baterai litium-ion, dan akumulator atau aki. Baterai dan elemen Volta mengubah energi kimia menjadi energi listrik. Elemen primer umumnya tidak dirancang untuk diisi ulang, sedangkan elemen sekunder seperti aki dan baterai litium-ion dapat diisi ulang. Sel surya dan dinamo DC juga dapat menjadi sumber arus searah melalui perubahan bentuk energi lain menjadi energi listrik.',
      ),
      p(
        'Baterai buah merupakan contoh sederhana sel elektrokimia. Dua logam berbeda yang ditancapkan pada buah atau larutan elektrolit dapat menimbulkan beda potensial. Buah tidak menghasilkan listrik secara ajaib; reaksi kimia dan pasangan elektroda menyediakan kondisi yang mendorong perpindahan muatan pada rangkaian luar.',
      ),
      h('Kuat arus dan muatan listrik'),
      f('I = Q / t', 'I sama dengan Q dibagi t.'),
      p(
        'I adalah kuat arus dalam ampere (A), Q adalah muatan dalam coulomb (C), dan t adalah waktu dalam sekon (s). Satu ampere berarti satu coulomb muatan melewati penampang penghantar setiap sekon. Rumus ini menyatakan arus rata-rata selama selang waktu tersebut.',
      ),
      f(
        'Q = ne; e = 1,6 × 10⁻¹⁹ C',
        'Q sama dengan n dikali e. Besar muatan elementer e adalah satu koma enam kali sepuluh pangkat negatif sembilan belas coulomb.',
      ),
      p(
        'Jika yang dicari jumlah elektron, gunakan besar muatan Q = ne, dengan n menyatakan jumlah elektron. Muatan setiap elektron bertanda negatif, sedangkan e pada rumus ini adalah besarnya muatan elementer.',
      ),
      p(
        'Saat mengerjakan soal, selalu ubah waktu ke sekon sebelum memakai rumus karena satuan dasar ampere adalah coulomb per sekon. Hubungan I = Q/t dapat diubah menjadi Q = It untuk mencari muatan, atau t = Q/I untuk mencari waktu. Besar arus menunjukkan banyaknya muatan yang lewat setiap detik, bukan seberapa cepat elektron bergerak sepanjang kawat.',
      ),
    ],
  },
  2: {
    title: 'Hambatan Ohmik dan Non-Ohmik',
    videoId: 'Mb96Zp-DxEU',
    blocks: [
      p(
        'Hambatan listrik adalah ukuran sejauh mana suatu komponen menghambat aliran arus. Satuan hambatan adalah ohm (Ω). Resistor, kawat, dan filamen lampu memiliki hambatan. Pada banyak rangkaian, resistor dipasang untuk membatasi arus agar komponen seperti LED tidak rusak.',
      ),
      h('Hukum Ohm'),
      p(
        'Hukum Ohm menyatakan hubungan antara tegangan, arus, dan hambatan pada komponen ohmik yang nilai hambatannya tetap selama kondisi fisiknya tetap.',
      ),
      f('V = IR', 'V sama dengan I dikali R.'),
      p(
        'V adalah tegangan dalam volt (V), I adalah arus dalam ampere (A), dan R adalah hambatan dalam ohm (Ω). Tegangan atau beda potensial menyatakan perubahan energi potensial listrik per satuan muatan. Arus menunjukkan banyaknya muatan yang mengalir setiap detik, sedangkan hambatan menunjukkan seberapa kuat komponen menahan aliran tersebut. Untuk nilai hambatan yang tetap, menaikkan tegangan akan menaikkan arus secara sebanding.',
      ),
      h('Komponen ohmik dan non-ohmik'),
      p(
        'Komponen ohmik memiliki grafik tegangan terhadap arus berupa garis lurus melalui titik asal. Artinya, perbandingan V/I tetap selama kondisi fisiknya tetap. Resistor biasa sering diperlakukan sebagai komponen ohmik dalam rentang kerjanya.',
      ),
      p(
        'Komponen non-ohmik tidak memiliki grafik V–I linear karena hubungannya dipengaruhi kondisi kerja. Lampu filamen termasuk non-ohmik sebab suhu filamen naik saat arus bertambah sehingga hambatannya berubah. LED dan dioda juga menunjukkan hubungan V–I yang tidak linear; arus terutama mengalir saat dipasang pada arah panjar maju. Termistor adalah komponen yang hambatannya dipengaruhi suhu.',
      ),
      h('Membaca grafik dan mengukur rangkaian'),
      p(
        'Pada grafik V terhadap I yang linear melalui titik asal, gradien grafik menyatakan hambatan R. Grafik yang semakin curam berarti hambatannya semakin besar. Jika grafik melengkung, rasio V/I dapat berubah dari satu titik kerja ke titik lainnya. Kemiringan lokal ΔV/ΔI menyatakan hambatan diferensial dan tidak selalu sama dengan rasio V/I. Karena itu, satu nilai hambatan tetap tidak dapat dipakai untuk seluruh daerah pengukuran komponen non-ohmik.',
      ),
      p(
        'Dalam praktiknya, LED membutuhkan resistor seri atau pengatur arus yang sesuai agar tidak mendapat arus berlebih. Dalam percobaan, amperemeter dipasang seri agar arus yang melewati alat sama dengan arus rangkaian. Voltmeter dipasang paralel pada komponen agar mengukur beda potensial di kedua ujung komponen.',
      ),
    ],
  },
  3: {
    title: 'Hambatan Jenis',
    videoId: '2oV9ZwM4SRU',
    videoNotice:
      'Pada pemeriksaan 24 Oktober 2026, video dari tautan ini tidak tersedia di YouTube. Kamu tetap dapat mempelajari materi tertulis dan mendengarkan audionya. Tautan asli tetap tersedia jika pemilik mengaktifkan videonya kembali.',
    blocks: [
      p(
        'Hambatan sebuah kawat tidak hanya ditentukan oleh panjang kawat. Jenis bahan dan ukuran kawat juga berpengaruh. Besaran yang menggambarkan karakter kelistrikan suatu bahan disebut hambatan jenis atau resistivitas, dilambangkan dengan ρ dan bersatuan Ω·m.',
      ),
      h('Hubungan bahan, panjang, dan luas penampang'),
      f('R = ρL / A', 'R sama dengan rho dikali L dibagi A.'),
      p(
        'R adalah hambatan kawat dalam ohm, ρ adalah resistivitas dalam ohm meter, L adalah panjang kawat dalam meter, dan A adalah luas penampang kawat dalam meter persegi. Hubungan ini berlaku untuk penghantar homogen dengan luas penampang seragam pada kondisi yang ditentukan.',
      ),
      p(
        'Kawat yang lebih panjang memiliki hambatan lebih besar. Kawat yang lebih tebal memiliki luas penampang lebih besar sehingga hambatannya lebih kecil. Bahan dengan resistivitas kecil, seperti tembaga, lebih baik digunakan sebagai penghantar daripada bahan dengan resistivitas besar.',
      ),
      f('A = πr²', 'A sama dengan pi dikali r kuadrat.'),
      p(
        'Luas penampang kawat berbentuk lingkaran dapat dihitung dengan A = πr², dengan r adalah jari-jari kawat. Karena luas bergantung pada kuadrat jari-jari, perubahan kecil pada diameter kawat dapat memberikan perubahan hambatan yang cukup besar. Itulah sebabnya kabel berdiameter besar dipilih untuk membawa arus besar: hambatannya lebih kecil sehingga energi yang hilang sebagai panas lebih sedikit pada arus yang sama.',
      ),
      h('Konduktor, isolator, dan elektrolit'),
      p(
        'Konduktor adalah bahan yang mudah menghantarkan arus, misalnya tembaga, aluminium, dan perak. Pada logam, pembawa muatannya adalah elektron bebas. Isolator seperti plastik, karet, dan kaca memiliki hambatan sangat besar sehingga sering digunakan sebagai pelapis kabel demi keselamatan.',
      ),
      p(
        'Tidak hanya padatan, larutan juga dapat menghantarkan listrik. Larutan garam dapat menghantarkan listrik karena mengandung ion yang dapat bergerak, sedangkan larutan gula pada kondisi biasa tidak menghasilkan ion bebas dalam jumlah cukup sehingga tidak menghantarkan seperti larutan garam.',
      ),
      p(
        'Pemilihan bahan selalu bergantung pada fungsi. Kabel penghantar membutuhkan bahan dengan resistivitas kecil. Sebaliknya, elemen pemanas dan sekring menggunakan bahan tertentu yang memiliki karakter hambatan sesuai tujuan kerjanya. Pada semua aplikasi, keselamatan dan batas arus harus diperhatikan.',
      ),
      h('Pengaruh suhu'),
      p(
        'Suhu juga dapat memengaruhi hambatan. Pada konduktor logam, kenaikan suhu umumnya menaikkan hambatan. Untuk rentang suhu terbatas, hubungan pendekatannya dapat dinyatakan sebagai berikut.',
      ),
      f(
        'R = R₀(1 + αΔT)',
        'R sama dengan R nol dikali, buka kurung, satu ditambah alfa dikali delta T, tutup kurung.',
      ),
      p(
        'R₀ adalah hambatan pada suhu acuan, α adalah koefisien suhu hambatan, dan ΔT adalah perubahan suhu. Pada beberapa semikonduktor, kecenderungannya dapat berlawanan: hambatan menurun ketika suhu naik.',
      ),
      p(
        'Konsep ini menjelaskan mengapa kabel penghantar listrik memakai bahan dan diameter tertentu, sedangkan sekring menggunakan kawat yang dirancang meleleh dan memutus rangkaian ketika arus berlebihan. Pemilihan bahan dan ukuran kawat berkaitan dengan efisiensi serta keamanan.',
      ),
    ],
  },
  4: {
    title: 'Rangkaian Listrik Seri dan Paralel',
    videoId: 'dLalv-D_HM8',
    blocks: [
      h('Rangkaian seri'),
      p(
        'Pada rangkaian seri, komponen disusun dalam satu jalur tanpa percabangan. Karena hanya ada satu jalur, arus yang melalui setiap resistor sama. Tegangan sumber terbagi pada setiap resistor. Jika satu komponen putus, seluruh rangkaian terputus.',
      ),
      f(
        'Iₜ = I₁ = I₂ = …; Rₛ = R₁ + R₂ + R₃ + …',
        'Arus total sama dengan I satu, sama dengan I dua, dan seterusnya. Hambatan pengganti seri sama dengan R satu ditambah R dua ditambah R tiga dan seterusnya.',
      ),
      p(
        'Hambatan pengganti seri dari dua atau lebih resistor dengan hambatan positif selalu lebih besar daripada setiap hambatan penyusunnya. Setelah R seri ditemukan, gunakan I = V total/R seri untuk mencari arus rangkaian. Tegangan pada masing-masing resistor kemudian dapat dicari dengan V = IR. Resistor yang nilainya lebih besar akan mendapat penurunan tegangan lebih besar apabila arusnya sama.',
      ),
      h('Rangkaian paralel'),
      p(
        'Pada rangkaian paralel, komponen disusun pada cabang-cabang berbeda. Tegangan pada setiap cabang sama dengan tegangan di kedua titik percabangan, sedangkan arus total terbagi ke cabang-cabang. Untuk cabang yang dipasang langsung pada sumber ideal, tegangan cabang sama dengan tegangan sumber. Jika satu cabang terputus, cabang lain masih dapat bekerja. Karena itu, instalasi lampu rumah umumnya menggunakan susunan paralel.',
      ),
      f(
        'Vₜ = V₁ = V₂ = …; 1/Rₚ = 1/R₁ + 1/R₂ + 1/R₃ + …',
        'Tegangan total sama dengan V satu, sama dengan V dua, dan seterusnya. Satu dibagi hambatan pengganti paralel sama dengan satu dibagi R satu ditambah satu dibagi R dua ditambah satu dibagi R tiga dan seterusnya.',
      ),
      p(
        'Hambatan pengganti paralel dari dua atau lebih resistor dengan hambatan positif selalu lebih kecil daripada hambatan cabang yang paling kecil. Saat membandingkan terang lampu sejenis, perhatikan besar tegangan dan daya yang diterima tiap lampu, bukan hanya posisi lampu dalam gambar rangkaian.',
      ),
      h('Sumber tegangan seri dan paralel'),
      p(
        'Baterai juga dapat disusun seri atau paralel. Pada susunan seri searah, kutub positif satu baterai dihubungkan ke kutub negatif baterai berikutnya sehingga tegangan total bertambah. Susunan ini dipakai ketika alat memerlukan tegangan lebih besar.',
      ),
      p(
        'Pada susunan paralel, kutub positif dihubungkan dengan positif dan kutub negatif dihubungkan dengan negatif. Untuk baterai identik, tegangan total idealnya tetap seperti satu baterai, tetapi kapasitas muatan dalam ampere-jam dapat lebih besar. Dalam penggunaan nyata, baterai yang diparalelkan harus kompatibel, memiliki tegangan dan kondisi pengisian yang sesuai, serta menggunakan perlindungan yang tepat.',
      ),
    ],
  },
  5: {
    title: 'Rangkaian Majemuk serta Hukum Kirchhoff',
    videoId: 'fENcVMe9kLw',
    blocks: [
      p(
        'Rangkaian majemuk adalah rangkaian yang memadukan susunan seri dan paralel, atau memiliki lebih dari satu sumber tegangan dan percabangan. Untuk menganalisisnya secara sistematis, gunakan Hukum Kirchhoff.',
      ),
      h('Hukum I Kirchhoff'),
      p(
        'Pada sebuah titik percabangan, jumlah arus yang masuk sama dengan jumlah arus yang keluar. Prinsip ini sesuai dengan kekekalan muatan untuk keadaan tunak.',
      ),
      f(
        'Σ I masuk = Σ I keluar',
        'Jumlah seluruh arus masuk sama dengan jumlah seluruh arus keluar.',
      ),
      p(
        'Misalnya arus 3 A masuk ke suatu titik, lalu keluar melalui dua cabang sebesar 1 A dan I₂. Maka 3 = 1 + I₂ sehingga I₂ = 2 A. Pilih satu titik cabang dan tulis semua arus yang menuju atau meninggalkan titik itu. Jangan mencampur arus dari titik cabang yang berbeda dalam satu persamaan.',
      ),
      h('Hukum II Kirchhoff'),
      p(
        'Jika sebuah lintasan tertutup atau loop ditelusuri kembali ke titik awal, jumlah aljabar perubahan potensialnya sama dengan nol. Dalam model rangkaian DC ini, hukum tersebut merupakan penerapan kekekalan energi pada rangkaian.',
      ),
      f(
        'Σ ε − Σ IR = 0',
        'Jumlah aljabar gaya gerak listrik dikurangi jumlah aljabar penurunan tegangan pada resistor sama dengan nol.',
      ),
      p(
        'ε menyatakan gaya gerak listrik sumber dalam volt. Tanda setiap suku ditentukan oleh arah penelusuran loop dan arah arus yang diasumsikan.',
      ),
      h('Langkah analisis dan aturan tanda'),
      p(
        'Langkah menyelesaikan rangkaian majemuk: tentukan arah arus sementara pada tiap cabang; tentukan loop; tulis persamaan Hukum II Kirchhoff untuk setiap loop dengan tanda yang konsisten; gunakan Hukum I Kirchhoff pada titik percabangan; lalu selesaikan persamaan. Jika nilai arus hasil perhitungan negatif, arah arus sebenarnya berlawanan dengan arah asumsi awal. Nilai negatif bukan berarti perhitungannya gagal.',
      ),
      p(
        'Saat menelusuri loop, tanda sumber tegangan positif jika lintasan melewati sumber dari kutub negatif menuju positif, karena potensial bertambah. Jika lintasan melewati resistor searah arus asumsi, potensial berkurang sebesar IR. Jika arah lintasan berlawanan dengan arus asumsi, tandanya menjadi positif. Yang paling penting adalah memakai satu aturan tanda secara konsisten dari awal sampai akhir.',
      ),
    ],
  },
  6: {
    title: 'Daya Listrik',
    videoId: 'UOVTsD_CUK0',
    blocks: [
      p(
        'Daya listrik menunjukkan seberapa cepat energi listrik digunakan atau diubah oleh suatu alat. Satuan daya adalah watt (W). Label 10 W pada lampu berarti lampu tersebut menggunakan atau mengubah energi sebesar 10 joule setiap sekon pada kondisi kerja nominalnya.',
      ),
      h('Daya dan energi'),
      f('P = VI', 'P sama dengan V dikali I.'),
      p(
        'P adalah daya dalam watt, V adalah tegangan dalam volt, dan I adalah arus dalam ampere. Hubungan ini digunakan di sini untuk rangkaian DC. Daya tidak sama dengan energi. Daya adalah laju pemakaian energi, sedangkan energi adalah total pemakaian selama selang waktu tertentu. Dua alat dapat menggunakan daya berbeda; alat berdaya lebih besar memakai energi lebih cepat jika digunakan selama waktu yang sama.',
      ),
      f(
        'P = I²R = V²/R',
        'P sama dengan I kuadrat dikali R, atau V kuadrat dibagi R.',
      ),
      p(
        'Dengan menggabungkan hubungan tegangan dan arus pada resistor, daya juga dapat ditulis sebagai P = I²R atau P = V²/R. Pilih bentuk rumus berdasarkan besaran yang diketahui dan gunakan hambatan yang sesuai dengan kondisi kerja.',
      ),
      f('E = P × t', 'Energi E sama dengan daya P dikali waktu t.'),
      p(
        'Pada alat rumah tangga, penggunaan energi biasanya dinyatakan dalam kilowatt-jam atau kilowatt-hour (kWh), bukan watt. Untuk daya konstan, energi listrik dapat dihitung dengan E = P × t; gunakan P dalam kilowatt dan t dalam jam agar hasilnya kWh.',
      ),
      h('Contoh singkat'),
      p(
        'Lampu 10 W yang bekerja pada tegangan 5 V memiliki arus I = P/V = 2 A.',
      ),
      p(
        'Alat berdaya 500 W digunakan selama 2 jam. Energinya = 0,5 kW × 2 jam = 1 kWh.',
      ),
      p(
        'Pemakaian daya yang besar dan waktu penggunaan yang lama akan menaikkan konsumsi energi. Pemilihan alat yang sesuai, penggunaan kabel yang aman, dan mematikan perangkat yang tidak diperlukan adalah bagian dari penggunaan listrik yang bertanggung jawab.',
      ),
      h('Energi listrik dan tagihan rumah tangga'),
      p(
        'Energi listrik yang dipakai alat dihitung dari daya dikali waktu. Jika daya dinyatakan dalam watt dan waktu dalam sekon, energinya dapat dinyatakan dalam joule. Untuk pemakaian rumah tangga, satuan yang lebih praktis adalah kWh. Contohnya, lampu 20 W digunakan 10 jam setiap hari selama 30 hari. Energi yang dipakai adalah 0,02 kW × 10 jam × 30 = 6 kWh. Besar biaya listrik bergantung pada energi total dalam kWh dan tarif yang berlaku.',
      ),
      h('Mengapa transmisi memakai tegangan tinggi'),
      p(
        'Untuk menyalurkan daya yang sama, tegangan yang lebih tinggi memungkinkan arus yang diperlukan lebih kecil. Pada model sederhana hubungan ini dinyatakan oleh P = VI. Arus yang lebih kecil membantu mengurangi daya yang berubah menjadi panas pada kabel, yaitu P rugi = I²R. Karena itu, energi listrik ditransmisikan pada tegangan tinggi lalu diturunkan kembali dengan transformator sebelum digunakan konsumen.',
      ),
      p(
        'Bahasan transformator dan arus bolak-balik dipelajari lebih lanjut pada topik lain; bagian ini menekankan hubungan daya, arus, dan rugi energi pada penghantar. Untuk analisis AC yang lebih lengkap, faktor daya juga perlu diperhitungkan.',
      ),
    ],
  },
}

export const lessonReferences = [
  {
    title: '9.3 Resistivity and Resistance',
    url: 'https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance',
  },
  {
    title: '9.4 Ohm’s Law',
    url: 'https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law',
  },
  {
    title: '9.5 Electrical Energy and Power',
    url: 'https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power',
  },
  {
    title: '10.3 Kirchhoff’s Rules',
    url: 'https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules',
  },
]
