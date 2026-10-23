export const practiceConcepts = [
  {
    id: 'components',
    missionId: 1,
    title: 'Komponen dan jalur tertutup',
    description: 'Bedakan fungsi sumber, kabel, dan sambungan rangkaian.',
  },
  {
    id: 'paths',
    missionId: 2,
    title: 'Jalur seri dan paralel',
    description: 'Telusuri jalur arus dan perubahan pada cabang.',
  },
  {
    id: 'ohm',
    missionId: 3,
    title: 'Hubungan V, I, dan R',
    description: 'Gunakan hubungan besaran pada resistor ohmik.',
  },
  {
    id: 'energy',
    missionId: 4,
    title: 'Daya, durasi, dan energi',
    description: 'Hitung dan bandingkan energi dengan satuan yang jelas.',
  },
  {
    id: 'switches',
    missionId: 5,
    title: 'Kendali penerangan sekolah',
    description: 'Bedakan kendali satu ruang dan kendali seluruh rangkaian.',
  },
] as const
export type ConceptId = (typeof practiceConcepts)[number]['id']
export type PracticeExercise = {
  id: string
  conceptId: ConceptId
  title: string
  question: string
  assumption: string
  options: { id: string; text: string }[]
  correctId: string
  hint: string
  explanation: string
}
export const practiceExercises: PracticeExercise[] = [
  {
    id: 'components-source',
    conceptId: 'components',
    title: 'Bantu tim pojok baca',
    question:
      'Tim membawa baterai dan kabel untuk menyalakan lampu. Pernyataan mana menjelaskan fungsi keduanya?',
    assumption: 'Model rangkaian DC sederhana dengan baterai yang berfungsi.',
    options: [
      {
        id: 'battery-source',
        text: 'Baterai menyediakan beda potensial; kabel menghubungkan komponen.',
      },
      {
        id: 'wire-source',
        text: 'Kabel menyediakan beda potensial; baterai hanya menghubungkan komponen.',
      },
      {
        id: 'both-switches',
        text: 'Keduanya hanya berfungsi sebagai sakelar.',
      },
      {
        id: 'lamp-source',
        text: 'Lampu menyediakan beda potensial bagi baterai dan kabel.',
      },
    ],
    correctId: 'battery-source',
    hint: 'Bedakan penyedia energi rangkaian dari penghantar yang menghubungkan komponen.',
    explanation:
      'Baterai menyediakan beda potensial. Kabel menghubungkan komponen sebagai penghantar. Lampu mengubah energi listrik menjadi cahaya dan panas; lampu tetap memerlukan sumber dan jalur tertutup.',
  },
  {
    id: 'components-gap',
    conceptId: 'components',
    title: 'Cari sambungan yang hilang',
    question:
      'Baterai, lampu, dan sakelar sudah terhubung, tetapi kabel kembali ke baterai terlepas. Sakelar ditutup. Apa yang terjadi pada lampu?',
    assumption:
      'Tidak ada jalur lain atau sumber energi lain; komponen tidak rusak.',
    options: [
      { id: 'brighter', text: 'Lampu lebih terang karena kabel berkurang.' },
      {
        id: 'off',
        text: 'Lampu tetap padam karena jalur rangkaian belum tertutup.',
      },
      {
        id: 'switch-source',
        text: 'Lampu menyala karena sakelar menggantikan baterai.',
      },
      {
        id: 'battery-alone',
        text: 'Lampu selalu menyala selama ada baterai di dekatnya.',
      },
    ],
    correctId: 'off',
    hint: 'Telusuri lintasan dari satu terminal baterai melalui lampu hingga kembali ke terminal lainnya.',
    explanation:
      'Kabel yang terlepas membuat jalur terbuka. Menutup sakelar saja belum menutup seluruh lintasan, sehingga tidak ada arus yang terus mengalir melalui lampu pada model ini.',
  },
  {
    id: 'paths-series-break',
    conceptId: 'paths',
    title: 'Satu jalur di koridor',
    question:
      'Tiga lampu disusun seri. Ketika satu lampu dilepas sehingga jalurnya terbuka, bagaimana keadaan dua lampu lainnya?',
    assumption: 'Satu rangkaian seri tanpa jalur pintas atau cabang lain.',
    options: [
      {
        id: 'both-on',
        text: 'Keduanya tetap menyala karena memiliki jalur sendiri.',
      },
      { id: 'one-on', text: 'Hanya lampu yang paling dekat baterai menyala.' },
      {
        id: 'both-off',
        text: 'Keduanya padam karena satu-satunya jalur arus terputus.',
      },
      {
        id: 'both-brighter',
        text: 'Keduanya lebih terang karena satu lampu berkurang.',
      },
    ],
    correctId: 'both-off',
    hint: 'Periksa apakah masih ada lintasan tertutup setelah satu bagian jalur seri dilepas.',
    explanation:
      'Pada rangkaian seri hanya ada satu jalur. Pelepasan lampu yang membuka jalur memutus lintasan tertutup bagi seluruh lampu, termasuk dua lampu yang masih terpasang.',
  },
  {
    id: 'paths-extra-branch',
    conceptId: 'paths',
    title: 'Tambahkan cabang percobaan',
    question:
      'Satu resistor terhubung ke sumber. Resistor identik kedua ditambahkan secara paralel. Bagaimana arus total dari sumber dan arus pada resistor pertama berubah?',
    assumption:
      'Sumber tegangan ideal dan konstan, resistor ohmik tetap, serta kabel ideal. Bandingkan keadaan tunak.',
    options: [
      {
        id: 'total-up-original-same',
        text: 'Arus total bertambah; arus pada resistor pertama tetap.',
      },
      {
        id: 'both-half',
        text: 'Arus total dan arus pada resistor pertama menjadi setengah.',
      },
      {
        id: 'both-same',
        text: 'Arus total dan arus pada resistor pertama tetap.',
      },
      { id: 'original-zero', text: 'Arus pada resistor pertama menjadi nol.' },
    ],
    correctId: 'total-up-original-same',
    hint: 'Periksa tegangan pada cabang pertama, lalu jumlahkan arus semua cabang untuk mendapatkan arus total.',
    explanation:
      'Tegangan pada resistor pertama tetap sama, sehingga arusnya tetap menurut I = V/R. Cabang kedua membawa arus tambahan. Arus total adalah jumlah arus kedua cabang dan menjadi dua kali semula pada asumsi ini.',
  },
  {
    id: 'ohm-find-resistance',
    conceptId: 'ohm',
    title: 'Pilih resistor proyek',
    question:
      'Beda potensial pada resistor adalah 9 V dan arus yang melewatinya 3 A. Berapa hambatannya?',
    assumption:
      'Gunakan besar nilai tegangan dan arus pada resistor ohmik yang sama.',
    options: [
      { id: '27-ohm', text: '27 Ω' },
      { id: '6-ohm', text: '6 Ω' },
      { id: '12-ohm', text: '12 Ω' },
      { id: '3-ohm', text: '3 Ω' },
    ],
    correctId: '3-ohm',
    hint: 'Susun ulang V = I × R sehingga R berdiri sendiri. Periksa satuan V/A.',
    explanation:
      'R = V/I = 9 V ÷ 3 A = 3 Ω. Tegangan dibagi arus, bukan dikalikan atau dikurangkan. Satuan volt per ampere sama dengan ohm.',
  },
  {
    id: 'ohm-fixed-resistor',
    conceptId: 'ohm',
    title: 'Tegangan berubah, resistor tetap',
    question:
      'Resistor 8 Ω mendapat tegangan 4 V, lalu tegangannya dinaikkan menjadi 12 V. Berapa arus pada kondisi kedua?',
    assumption:
      'Resistor tetap ohmik 8 Ω pada kedua kondisi; yang dimaksud tegangan adalah tegangan pada resistor.',
    options: [
      { id: '0.5-a', text: '0,5 A' },
      { id: '1.5-a', text: '1,5 A' },
      { id: '8-a', text: '8 A' },
      { id: '96-a', text: '96 A' },
    ],
    correctId: '1.5-a',
    hint: 'Gunakan tegangan kondisi kedua dan hambatan yang tetap pada hubungan I = V/R.',
    explanation:
      'I kedua = 12 V ÷ 8 Ω = 1,5 A. Arus awal 4 V ÷ 8 Ω = 0,5 A. Ketika tegangan menjadi tiga kali pada R tetap, arus juga menjadi tiga kali.',
  },
  {
    id: 'energy-joules',
    conceptId: 'energy',
    title: 'Energi satu menit',
    question:
      'Beban mendapat tegangan 12 V dan arus 0,5 A selama 60 detik. Berapa energi listrik yang digunakan?',
    assumption:
      'Tegangan dan arus konstan selama 60 detik. Nyatakan energi dalam joule.',
    options: [
      { id: '6-j', text: '6 J' },
      { id: '30-j', text: '30 J' },
      { id: '360-j', text: '360 J' },
      { id: '720-j', text: '720 J' },
    ],
    correctId: '360-j',
    hint: 'Hitung daya dari P = V × I, kemudian gunakan durasi dalam detik pada E = P × t.',
    explanation:
      'P = 12 V × 0,5 A = 6 W. E = 6 W × 60 s = 360 J. Angka 6 menyatakan daya dalam watt, bukan energi selama satu menit.',
  },
  {
    id: 'energy-duration',
    conceptId: 'energy',
    title: 'Bandingkan jadwal penggunaan',
    question:
      'Perangkat A berdaya 10 W dipakai 2 jam. Perangkat B berdaya 20 W dipakai 0,5 jam. Pernyataan mana sesuai energi pemakaiannya?',
    assumption:
      'Daya konstan selama pemakaian. Bandingkan konsumsi energi saja, bukan efisiensi atau kesetaraan fungsi perangkat.',
    options: [
      {
        id: 'b-10-wh',
        text: 'B memakai lebih sedikit: 10 Wh, sedangkan A 20 Wh.',
      },
      {
        id: 'a-10-wh',
        text: 'A memakai lebih sedikit: 10 Wh, sedangkan B 20 Wh.',
      },
      { id: 'both-20-wh', text: 'Keduanya memakai 20 Wh.' },
      {
        id: 'power-only',
        text: 'B pasti memakai lebih banyak karena dayanya lebih besar.',
      },
    ],
    correctId: 'b-10-wh',
    hint: 'Waktu pemakaian berbeda. Kalikan daya tiap perangkat dengan durasinya sendiri dalam jam.',
    explanation:
      'E A = 10 W × 2 h = 20 Wh. E B = 20 W × 0,5 h = 10 Wh. B menggunakan lebih sedikit energi pada jadwal ini meskipun dayanya lebih besar. Daya dan durasi perlu dilihat bersama.',
  },
  {
    id: 'switches-one-room',
    conceptId: 'switches',
    title: 'Ruang kosong setelah kelas',
    question:
      'Tiga ruang diwakili tiga cabang paralel, masing-masing dengan lampu dan sakelar seri pada cabangnya. Semua lampu menyala. Jika hanya sakelar ruang 2 dibuka, lampu mana yang padam?',
    assumption:
      'Sumber ideal tetap tersambung dan tidak ada sambungan silang antar-cabang.',
    options: [
      { id: 'all-off', text: 'Lampu seluruh ruang.' },
      { id: 'room-1-only', text: 'Hanya lampu ruang 1.' },
      { id: 'none-off', text: 'Tidak ada lampu yang padam.' },
      { id: 'room-2-only', text: 'Hanya lampu ruang 2.' },
    ],
    correctId: 'room-2-only',
    hint: 'Telusuri cabang yang diputus sakelar ruang 2. Periksa apakah jalur ruang lain ikut terbuka.',
    explanation:
      'Sakelar ruang 2 hanya membuka jalur cabang 2. Cabang 1 dan 3 tetap tertutup sehingga kedua lampu itu tetap menyala. Besarnya energi yang dihemat tetap bergantung pada daya dan lama lampu ruang 2 dimatikan.',
  },
  {
    id: 'switches-main-control',
    conceptId: 'switches',
    title: 'Kendali utama model sekolah',
    question:
      'Pada model tiga cabang paralel, siswa ingin menambahkan satu sakelar yang dapat memutus semua lampu sekaligus. Di mana sakelar utama dipasang?',
    assumption:
      'Model rangkaian ideal dengan satu sumber dan satu jalur bersama sebelum percabangan. Ini latihan model, bukan petunjuk instalasi listrik nyata.',
    options: [
      { id: 'branch-1', text: 'Seri dengan lampu pada cabang ruang 1 saja.' },
      {
        id: 'shared-path',
        text: 'Pada jalur bersama dari sumber sebelum percabangan.',
      },
      { id: 'branch-2', text: 'Seri dengan lampu pada cabang ruang 2 saja.' },
      {
        id: 'disconnected',
        text: 'Terpisah tanpa terhubung dengan rangkaian.',
      },
    ],
    correctId: 'shared-path',
    hint: 'Cari bagian lintasan yang dilalui arus menuju semua cabang.',
    explanation:
      'Membuka sakelar pada jalur bersama memutus hubungan sumber ke seluruh cabang. Sakelar pada satu cabang hanya mengendalikan cabang itu. Kendali utama dan kendali tiap ruang mempunyai fungsi yang berbeda.',
  },
]

export function findPractice(id: unknown) {
  return typeof id === 'string'
    ? practiceExercises.find((exercise) => exercise.id === id)
    : undefined
}
