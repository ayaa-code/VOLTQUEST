export type ConfirmationOption = {
  id: string
  label: string
  feedback: string
  exerciseId: string
}
export type ConfirmationConfig = {
  missionId: number
  id: string
  missionQuestion: string
  answers: { id: string; label: string; indication?: string }[]
  correctAnswerId: string
  question: string
  conceptResponseId: string
  options: ConfirmationOption[]
}
export const RULE_VERSION = 1
export const confirmations: ConfirmationConfig[] = [
  {
    missionId: 1,
    id: 'confirm-component-role',
    missionQuestion: 'Komponen yang menjadi sumber beda potensial adalah ...',
    answers: [
      { id: 'component-wire', label: 'Kabel', indication: 'wire-source' },
      { id: 'component-battery', label: 'Baterai' },
      { id: 'component-lamp', label: 'Lampu', indication: 'lamp-source' },
      { id: 'component-switch', label: 'Sakelar', indication: 'switch-source' },
    ],
    correctAnswerId: 'component-battery',
    question:
      'Alasan mana yang kamu gunakan untuk menentukan sumber beda potensial?',
    conceptResponseId: 'battery-source',
    options: [
      {
        id: 'battery-source',
        label:
          'Baterai menyediakan beda potensial; kabel penghantar, lampu beban, dan sakelar mengendalikan jalur.',
        feedback:
          'Kamu membedakan sumber, penghantar, beban, dan sakelar. Cocokkan kembali fungsi penyedia beda potensial dengan pilihan pada soal; jawaban refleksi dan alasan ini belum tentu konsisten.',
        exerciseId: 'components-source',
      },
      {
        id: 'wire-source',
        label:
          'Kabel menyediakan beda potensial karena menghubungkan komponen.',
        feedback:
          'Kamu memilih kabel sebagai penyedia beda potensial. Kabel berfungsi sebagai penghantar; sumber seperti baterai menyediakan beda potensial. Periksa perbedaan fungsi sumber dan penghantar.',
        exerciseId: 'components-source',
      },
      {
        id: 'lamp-source',
        label: 'Lampu menyediakan beda potensial karena menghasilkan cahaya.',
        feedback:
          'Kamu menghubungkan cahaya dengan fungsi sumber. Lampu mengubah energi listrik menjadi cahaya dan panas; pada rangkaian ini baterai menyediakan beda potensial.',
        exerciseId: 'components-source',
      },
      {
        id: 'switch-source',
        label:
          'Sakelar menyediakan beda potensial karena dapat menyalakan lampu.',
        feedback:
          'Kamu memilih sakelar karena mengendalikan nyala. Sakelar membuka atau menutup jalur, tetapi tidak menggantikan sumber. Periksa apakah lintasan lengkap dan sumber tersedia.',
        exerciseId: 'components-gap',
      },
      {
        id: 'unsure',
        label: 'Belum yakin',
        feedback:
          'Mulai dengan membedakan peran komponen: sumber menyediakan beda potensial, kabel menghubungkan, beban mengubah energi, dan sakelar mengendalikan jalur. Coba satu situasi sederhana.',
        exerciseId: 'components-source',
      },
    ],
  },
  {
    missionId: 2,
    id: 'confirm-current-paths',
    missionQuestion:
      'Agar lampu lain tetap menyala saat satu lampu putus, gunakan rangkaian ...',
    answers: [
      { id: 'paths-series', label: 'Seri', indication: 'single-path-enough' },
      { id: 'paths-open', label: 'Terbuka', indication: 'all-open' },
      { id: 'paths-parallel', label: 'Paralel' },
      {
        id: 'paths-no-source',
        label: 'Tanpa sumber tegangan',
        indication: 'no-source-needed',
      },
    ],
    correctAnswerId: 'paths-parallel',
    question: 'Menurutmu, apa yang membuat lampu lain dapat tetap menyala?',
    conceptResponseId: 'independent-path',
    options: [
      {
        id: 'independent-path',
        label:
          'Lampu lain masih memiliki jalur tertutup ke sumber pada cabangnya sendiri.',
        feedback:
          'Kamu memilih jalur tertutup pada cabang mandiri. Telusuri cabang yang tersisa lalu cocokkan susunannya dengan jawaban refleksi. Periksa lintasan yang tetap tertutup setelah satu lampu dilepas.',
        exerciseId: 'paths-series-break',
      },
      {
        id: 'single-path-enough',
        label:
          'Satu jalur seri tetap dapat mengalirkan arus walaupun salah satu lampu dilepas dan jalurnya terbuka.',
        feedback:
          'Kamu memilih satu jalur seri yang sudah terbuka. Pada seri tanpa jalur pintas, pelepasan lampu memutus lintasan tertutup bagi lampu lain. Bandingkan dengan cabang yang masih terhubung ke sumber.',
        exerciseId: 'paths-series-break',
      },
      {
        id: 'all-open',
        label: 'Semua jalur boleh terbuka agar lampu lain tetap menyala.',
        feedback:
          'Kamu memilih semua jalur terbuka. Lampu memerlukan lintasan tertutup dan sumber; terbukanya satu cabang berbeda dari terbukanya semua jalur. Latihan berikut membahas lintasan yang terputus secara umum.',
        exerciseId: 'components-gap',
      },
      {
        id: 'no-source-needed',
        label:
          'Lampu tidak memerlukan sumber tegangan setelah satu lampu dilepas.',
        feedback:
          'Kamu memilih keadaan tanpa sumber. Lampu lain tetap memerlukan sumber serta jalur tertutup. Tinjau fungsi sumber terlebih dahulu sebelum membandingkan susunan.',
        exerciseId: 'components-source',
      },
      {
        id: 'unsure',
        label: 'Belum yakin',
        feedback:
          'Telusuri satu lintasan dari sumber, melalui lampu yang tersisa, dan kembali ke sumber. Periksa apakah pelepasan satu lampu memutus lintasan itu.',
        exerciseId: 'paths-series-break',
      },
    ],
  },
  {
    missionId: 3,
    id: 'confirm-ohm-relation',
    missionQuestion: 'Jika V = 12 V dan I = 2 A, nilai hambatan adalah ...',
    answers: [
      { id: 'ohm-24', label: '24 Ω', indication: 'multiply' },
      { id: 'ohm-10', label: '10 Ω', indication: 'subtract' },
      { id: 'ohm-14', label: '14 Ω', indication: 'add' },
      { id: 'ohm-6', label: '6 Ω' },
    ],
    correctAnswerId: 'ohm-6',
    question:
      'Dari V = I × R, hubungan mana yang kamu gunakan untuk mencari R?',
    conceptResponseId: 'divide',
    options: [
      {
        id: 'divide',
        label: 'R = V ÷ I',
        feedback:
          'Kamu memilih hubungan R = V ÷ I. Hubungan ini sesuai untuk mencari hambatan. Periksa kembali pembagian 12 ÷ 2, satuan V/A, dan pilihan yang kamu kirim.',
        exerciseId: 'ohm-find-resistance',
      },
      {
        id: 'multiply',
        label: 'R = V × I',
        feedback:
          'Kamu memilih hubungan R = V × I. Untuk mencari R dari V = I × R, bagi kedua ruas dengan I sehingga R = V ÷ I. Perkalian V dan I menyatakan daya, bukan hambatan.',
        exerciseId: 'ohm-find-resistance',
      },
      {
        id: 'subtract',
        label: 'R = V − I',
        feedback:
          'Kamu memilih pengurangan V dan I. Volt dan ampere tidak dapat langsung dikurangkan menjadi ohm. Susun ulang V = I × R, lalu gunakan satuan V/A.',
        exerciseId: 'ohm-find-resistance',
      },
      {
        id: 'add',
        label: 'R = V + I',
        feedback:
          'Kamu memilih penjumlahan V dan I. Menjumlahkan angka tidak membentuk hubungan hambatan; gunakan persamaan V = I × R dan satuan V/A.',
        exerciseId: 'ohm-find-resistance',
      },
      {
        id: 'unsure',
        label: 'Belum yakin',
        feedback:
          'Mulai dari V = I × R. Untuk membuat R berdiri sendiri, bagi kedua ruas dengan I yang bukan nol. Coba perhitungan baru dengan satuan yang jelas.',
        exerciseId: 'ohm-find-resistance',
      },
    ],
  },
  {
    missionId: 4,
    id: 'confirm-power-time',
    missionQuestion:
      'Untuk waktu penggunaan yang sama, perangkat mana lebih hemat energi?',
    answers: [
      {
        id: 'energy-high-power',
        label: 'Perangkat berdaya lebih besar',
        indication: 'power-reversed',
      },
      {
        id: 'energy-equal',
        label: 'Semua perangkat selalu sama',
        indication: 'ignore-power',
      },
      { id: 'energy-low-power', label: 'Perangkat berdaya lebih kecil' },
      {
        id: 'energy-long-cable',
        label: 'Perangkat dengan kabel lebih panjang',
        indication: 'cable-only',
      },
    ],
    correctAnswerId: 'energy-low-power',
    question:
      'Bagaimana kamu membandingkan energi ketika waktu penggunaan sama?',
    conceptResponseId: 'power-times-time',
    options: [
      {
        id: 'power-times-time',
        label: 'Gunakan E = P × t; ketika t sama, bandingkan nilai P.',
        feedback:
          'Kamu memilih hubungan E = P × t dengan waktu sama. Periksa kembali arah perbandingan daya dan energi pada pilihan refleksi. Alasan ini menggunakan daya dan waktu bersama.',
        exerciseId: 'energy-joules',
      },
      {
        id: 'power-reversed',
        label:
          'Daya lebih besar selalu berarti energi lebih sedikit pada waktu yang sama.',
        feedback:
          'Kamu memilih daya lebih besar sebagai energi lebih sedikit. Pada E = P × t dengan t sama, energi bertambah ketika daya bertambah. Bandingkan dengan durasi eksplisit; pemilihan perangkat juga perlu mempertimbangkan fungsinya.',
        exerciseId: 'energy-joules',
      },
      {
        id: 'ignore-power',
        label: 'Waktu sama membuat energi selalu sama, berapa pun dayanya.',
        feedback:
          'Kamu memilih waktu sama sebagai satu-satunya penentu. Energi bergantung pada daya dan waktu: E = P × t. Waktu sama tidak membuat energi sama jika daya berbeda.',
        exerciseId: 'energy-joules',
      },
      {
        id: 'cable-only',
        label:
          'Panjang kabel saja cukup untuk menentukan perangkat yang paling sedikit memakai energi.',
        feedback:
          'Kamu memilih panjang kabel sebagai dasar perbandingan. Informasi itu saja belum cukup untuk menentukan energi perangkat. Gunakan daya dan durasi yang jelas. Latihan berikut melatih perbandingan P dan t, bukan menghitung rugi kabel.',
        exerciseId: 'energy-duration',
      },
      {
        id: 'unsure',
        label: 'Belum yakin',
        feedback:
          'Gunakan E = P × t dengan satuan yang konsisten. Detik bersama watt menghasilkan joule; jam bersama watt menghasilkan Wh. Mulai dari satu perhitungan energi.',
        exerciseId: 'energy-joules',
      },
    ],
  },
  {
    missionId: 5,
    id: 'confirm-room-control',
    missionQuestion:
      'Rancangan mana membuat tiap ruang dapat menyalakan lampu secara mandiri?',
    answers: [
      {
        id: 'rooms-series-main',
        label: 'Rangkaian seri dengan satu sakelar',
        indication: 'series-independent',
      },
      {
        id: 'rooms-branch-switch',
        label: 'Rangkaian paralel dengan sakelar tiap ruang',
      },
      {
        id: 'rooms-no-switch',
        label: 'Rangkaian paralel tanpa sakelar',
        indication: 'branches-alone',
      },
      {
        id: 'rooms-single-series',
        label: 'Semua lampu dalam satu cabang seri',
        indication: 'series-independent',
      },
    ],
    correctAnswerId: 'rooms-branch-switch',
    question:
      'Apa yang diperlukan agar satu ruang dapat dimatikan tanpa mematikan ruang lain?',
    conceptResponseId: 'branch-switch',
    options: [
      {
        id: 'branch-switch',
        label:
          'Cabang paralel dengan sakelar yang hanya memutus jalur ruang tersebut.',
        feedback:
          'Kamu memilih sakelar pada cabang mandiri. Cocokkan kembali penempatan sakelar dan jenis susunan dengan jawaban refleksi. Periksa kendali ruang melalui cabang dan sakelarnya.',
        exerciseId: 'switches-one-room',
      },
      {
        id: 'series-independent',
        label:
          'Semua lampu pada satu jalur seri sudah memberi kendali mandiri.',
        feedback:
          'Kamu memilih satu jalur seri sebagai kendali mandiri. Membuka jalur seri memengaruhi seluruh lampu di jalur itu. Periksa perbedaan jalur bersama dan cabang mandiri.',
        exerciseId: 'paths-series-break',
      },
      {
        id: 'branches-alone',
        label:
          'Cabang paralel tanpa sakelar sudah cukup untuk mengendalikan nyala tiap ruang melalui sakelar.',
        feedback:
          'Kamu memilih cabang tanpa sakelar. Cabang menyediakan lintasan terpisah, tetapi kendali melalui sakelar memerlukan sakelar pada cabang yang ingin diputus. Tidak perlu melepas lampu atau kabel untuk kendali itu.',
        exerciseId: 'switches-one-room',
      },
      {
        id: 'main-only',
        label:
          'Satu sakelar utama pada jalur bersama dapat mematikan hanya ruang yang dipilih.',
        feedback:
          'Kamu memilih sakelar utama sebagai kendali satu ruang. Sakelar di jalur bersama mengendalikan semua cabang; sakelar cabang mengendalikan ruang pada cabang itu saja. Bandingkan fungsi kedua posisi.',
        exerciseId: 'switches-main-control',
      },
      {
        id: 'unsure',
        label: 'Belum yakin',
        feedback:
          'Telusuri satu cabang ruang dan letakkan sakelar seri dengan lampunya pada cabang tersebut. Periksa apakah membuka sakelar itu juga memutus jalur ruang lain.',
        exerciseId: 'switches-one-room',
      },
    ],
  },
]
