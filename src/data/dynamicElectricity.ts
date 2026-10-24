export type Topic = {
  id: number
  title: string
  objective: string
  lesson: string
  summary: string
  challenge: string
  observationPrompt: string
  reflectionPrompt: string
  question: string
  answer: number
  unit: string
  reminder: string
  explanation: string
}

// Questions, answers, and explanations below are transcribed/adapted from
// “Asesmen Formatif dan Sumatif - Listrik Dinamis V2”.
export const dynamicTopics: Topic[] = [
  {
    id: 1,
    title: 'Arus Listrik',
    objective: 'Menjelaskan arus listrik, muatan, dan arah arus konvensional.',
    lesson:
      'Arus listrik menyatakan banyaknya muatan yang melewati suatu penampang tiap satuan waktu. Satuan arus adalah ampere (A), sedangkan muatan dinyatakan dalam coulomb (C).',
    summary:
      'Gunakan Q = I × t. Pada logam, elektron bergerak berlawanan arah dengan arus konvensional.',
    challenge:
      'Susun baterai, kabel, lampu, dan saklar. Bandingkan keadaan lampu saat saklar terbuka dan tertutup.',
    observationPrompt:
      'Tuliskan keadaan lampu saat saklar terbuka dan saat saklar tertutup.',
    reflectionPrompt:
      'Apa hubungan jalur tertutup dengan arus yang dapat mengalir?',
    question:
      'Sebuah akumulator diisi ulang dengan arus konstan 2,5 A selama 2 jam. Tentukan total muatan listrik yang mengalir dalam coulomb.',
    answer: 18000,
    unit: 'C',
    reminder: 'Ubah 2 jam menjadi 7.200 s, lalu gunakan Q = I × t.',
    explanation: 'Q = 2,5 A × 7.200 s = 18.000 C.',
  },
  {
    id: 2,
    title: 'Hambatan Ohmik dan Non-Ohmik',
    objective: 'Membedakan hubungan V-I ohmik dan non-ohmik.',
    lesson:
      'Komponen ohmik memiliki hambatan tetap pada suhu konstan, sehingga grafik V terhadap I linear. Pada komponen non-ohmik, hambatan dapat berubah saat suhu atau tegangan berubah.',
    summary:
      'Untuk komponen ohmik, R = V ÷ I tetap. Lampu pijar merupakan contoh perilaku non-ohmik.',
    challenge:
      'Gunakan resistor dan ubah tegangan sumber pada dua kondisi. Catat pasangan tegangan dan arus.',
    observationPrompt: 'Catat dua pasangan V dan I pada resistor yang sama.',
    reflectionPrompt: 'Apakah nilai V ÷ I pada kedua kondisi sama? Jelaskan.',
    question:
      'Data sebuah komponen menunjukkan V = 2, 4, 6, 8 volt dan I = 0,10; 0,20; 0,30; 0,40 ampere. Tentukan hambatannya.',
    answer: 20,
    unit: 'Ω',
    reminder:
      'Pilih satu pasangan data dan gunakan R = V ÷ I. Periksa apakah hasilnya tetap.',
    explanation:
      '2 ÷ 0,10 = 20 Ω dan rasio pasangan lain juga 20 Ω, sehingga komponen bersifat ohmik.',
  },
  {
    id: 3,
    title: 'Hambatan Jenis',
    objective:
      'Menentukan hambatan dari hambatan jenis, panjang, dan luas penampang.',
    lesson:
      'Hambatan kawat bergantung pada bahan, panjang, dan luas penampang. Bahan dengan hambatan jenis kecil lebih mudah menghantarkan arus.',
    summary:
      'Gunakan R = ρL/A. Kawat lebih panjang menaikkan R; penampang lebih besar menurunkan R.',
    challenge:
      'Bandingkan pengaruh panjang kawat atau komponen resistif terhadap besar arus pada sumber yang sama.',
    observationPrompt:
      'Catat perubahan arus ketika nilai hambatan atau panjang kawat model diubah.',
    reflectionPrompt:
      'Mengapa kabel transmisi memakai bahan dengan hambatan jenis rendah dan penampang besar?',
    question:
      'Kawat tembaga panjang 100 m dan luas penampang 2 × 10⁻⁶ m² memiliki hambatan jenis 1,7 × 10⁻⁸ Ω·m. Tentukan hambatannya.',
    answer: 0.85,
    unit: 'Ω',
    reminder: 'Masukkan ρ, L, dan A dalam satuan SI pada R = ρL/A.',
    explanation: 'R = (1,7 × 10⁻⁸ × 100) ÷ (2 × 10⁻⁶) = 0,85 Ω.',
  },
  {
    id: 4,
    title: 'Rangkaian Listrik Seri dan Paralel',
    objective:
      'Menganalisis hambatan pengganti dan karakter rangkaian seri-paralel.',
    lesson:
      'Pada seri, arus sama pada setiap komponen dan hambatan dijumlahkan. Pada paralel, tegangan cabang sama dan hambatan pengganti lebih kecil daripada cabang terkecil.',
    summary:
      'Rseri = R1 + R2. Untuk dua resistor paralel, Rp = R1R2/(R1 + R2).',
    challenge:
      'Susun dua lampu seri lalu paralel. Lepas satu lampu pada tiap susunan dan amati lampu lain.',
    observationPrompt:
      'Catat keadaan lampu lain sebelum dan sesudah satu lampu dilepas pada seri serta paralel.',
    reflectionPrompt:
      'Mengapa satu lampu putus memadamkan semua lampu seri tetapi tidak selalu paralel?',
    question:
      'R1 = 6 Ω dan R2 = 12 Ω dipasang paralel, lalu hasilnya diseri dengan R3 = 4 Ω. Tentukan hambatan total.',
    answer: 8,
    unit: 'Ω',
    reminder:
      'Hitung gabungan paralel R1 dan R2 terlebih dahulu, lalu tambahkan R3.',
    explanation: 'Rp = (6 × 12) ÷ (6 + 12) = 4 Ω. Rtotal = 4 Ω + 4 Ω = 8 Ω.',
  },
  {
    id: 5,
    title: 'Rangkaian Majemuk serta Hukum Kirchhoff',
    objective: 'Menerapkan Hukum Kirchhoff pada simpul dan loop.',
    lesson:
      'Hukum I Kirchhoff menyatakan jumlah arus masuk ke simpul sama dengan jumlah arus keluar. Hukum II Kirchhoff dipakai untuk menganalisis perubahan potensial pada loop tertutup.',
    summary:
      'Di simpul: ΣI masuk = ΣI keluar. Pastikan arah arus yang dipilih konsisten.',
    challenge:
      'Bangun beberapa cabang paralel dengan saklar berbeda dan amati cabang yang berubah ketika satu saklar dibuka.',
    observationPrompt:
      'Catat cabang atau ruang yang berubah pada tiap saklar yang dibuka.',
    reflectionPrompt:
      'Bagaimana percabangan membantu memisahkan kendali setiap beban?',
    question:
      'Di sebuah simpul, I1 = 3 A dan I2 = 5 A masuk. I3 = 2 A dan I4 = 1,5 A keluar. Tentukan I5 yang keluar.',
    answer: 4.5,
    unit: 'A',
    reminder:
      'Jumlahkan arus masuk, lalu kurangi dengan arus keluar yang sudah diketahui.',
    explanation:
      '3 + 5 = 2 + 1,5 + I5, sehingga I5 = 4,5 A keluar dari simpul.',
  },
  {
    id: 6,
    title: 'Daya Listrik',
    objective: 'Menghitung daya dan mengaitkannya dengan energi penggunaan.',
    lesson:
      'Daya menyatakan laju penggunaan energi listrik. Untuk beban resistif, daya dapat dihitung dengan P = VI atau P = I²R.',
    summary:
      'Energi pemakaian diperoleh dari E = P × t. Perhatikan satuan waktu dan daya.',
    challenge:
      'Ukur tegangan serta arus dua beban. Bandingkan daya dan energi untuk durasi penggunaan yang sama.',
    observationPrompt:
      'Catat V dan I dua beban, lalu tuliskan durasi penggunaan yang sama.',
    reflectionPrompt:
      'Beban mana memakai energi lebih besar untuk durasi yang sama? Jelaskan dari nilai dayanya.',
    question:
      'Elemen pemanas nikrom memiliki hambatan 20 Ω dan dialiri arus 4 A. Tentukan daya listrik yang diserap.',
    answer: 320,
    unit: 'W',
    reminder:
      'Gunakan P = I²R, lalu kuadratkan arus sebelum dikalikan hambatan.',
    explanation: 'P = 4² × 20 = 16 × 20 = 320 W.',
  },
]

export const summativeQuestions = [
  {
    id: 'wire',
    question:
      'Dua kawat tembaga X dan Y memiliki panjang L, r serta 2L, 2r pada tegangan sama. Pernyataan yang benar adalah…',
    options: [
      'Hambatan kawat Y dua kali lebih besar dari kawat X.',
      'Kuat arus pada kawat Y dua kali lebih besar dari kawat X.',
      'Daya listrik kawat X dua kali lebih besar dari kawat Y.',
      'Hambatan jenis kawat Y dua kali lebih besar dari kawat X.',
      'Kedua kawat menghasilkan kalor sama besar.',
    ],
    answer: 1,
    reminder:
      'Gunakan R = ρL/A. Jari-jari kawat Y dua kali sehingga luas penampangnya empat kali.',
    explanation: 'RY = 0,5 RX. Pada tegangan sama, IY = V/(0,5R) = 2 IX.',
  },
  {
    id: 'loop',
    question:
      'Pada rangkaian dua loop dengan E1 = 18 V, E2 = 12 V, R1 = 3 Ω, R2 = 6 Ω, dan R3 = 6 Ω, arus pada R3 adalah…',
    options: ['1,0 A', '1,5 A', '2,0 A', '2,5 A', '3,0 A'],
    answer: 2,
    reminder:
      'Menurut pembahasan dokumen, persamaan simpul menghasilkan VA = 12 V; gunakan I = V/R pada R3.',
    explanation: 'I3 = 12 V ÷ 6 Ω = 2,0 A.',
  },
  {
    id: 'safety',
    question:
      'Microwave 1100 W, teko 880 W, dan air fryer 1320 W dipasang pada stopkontak 220 V dengan MCB 10 A. Pernyataan yang benar adalah…',
    options: [
      'MCB tidak akan memutus arus.',
      'Arus total 15 A sehingga MCB trip demi keamanan.',
      'Semua alat lebih aman jika diseri.',
      'Hambatan total membuat arus turun di bawah 10 A.',
      'Tegangan tiap alat menjadi 73,3 V dan aman.',
    ],
    answer: 1,
    reminder:
      'Jumlahkan daya, lalu gunakan I = Ptotal/V dan bandingkan dengan kapasitas MCB.',
    explanation:
      'Ptotal = 3.300 W dan I = 3.300/220 = 15 A, lebih besar dari MCB 10 A.',
  },
] as const

export const summativeEssays = [
  'Bandingkan tiga lampu 40 W/220 V yang dipasang paralel dan seri pada sumber 220 V. Hitung daya total serta evaluasi pilihan untuk penerangan kantor dan kondisi saat satu lampu rusak.',
  'Rancang uraian solusi untuk dua baterai 12 V yang menyuplai motor 24 V dan lampu indikator 12 V. Evaluasi risiko korsleting serta peran sekering.',
]
