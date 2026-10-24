export const MISSIONS_DATA = [
  {
    id: 1,
    title: 'Misi 1 dari 3',
    subtitle: 'Misi 1: Arah Elektron',
    instruction:
      'Bantu Piko mengumpulkan 3 elektron biru kecil di jalur kabel menuju gerbang soal!',
    targetCount: 3,
    itemType: 'electron', // bola biru lucu
    accuTargetAfter: 33,
    platforms: [
      { x: 0, y: 460, w: 900, h: 60, type: 'board' },
      { x: 160, y: 365, w: 150, h: 24, type: 'resistor' },
      { x: 380, y: 295, w: 150, h: 24, type: 'wire' },
      { x: 600, y: 365, w: 140, h: 24, type: 'resistor' },
    ],
    items: [
      { id: 'm1-1', x: 235, y: 325 },
      { id: 'm1-2', x: 455, y: 255 },
      { id: 'm1-3', x: 670, y: 325 },
    ],
    puddles: [{ x: 330, y: 448, w: 65, h: 14 }],
    gateX: 805,
    question: {
      prompt:
        'Dalam kawat logam, arah aliran elektron dan arah arus konvensional yang benar adalah …',
      options: [
        {
          key: 'A',
          text: 'Elektron dari positif ke negatif, arus dari negatif ke positif.',
        },
        {
          key: 'B',
          text: 'Elektron dari negatif ke positif, arus dari positif ke negatif.',
        },
        {
          key: 'C',
          text: 'Elektron dari positif ke negatif, arus dari positif ke negatif.',
        },
        {
          key: 'D',
          text: 'Elektron dari negatif ke positif, arus dari negatif ke positif.',
        },
        { key: 'E', text: 'Elektron bergerak acak, arus tidak memiliki arah.' },
      ],
      correctKey: 'B',
      correctFeedback:
        'Hebat! Elektron bergerak dari negatif ke positif, sedangkan arus konvensional dari positif ke negatif.',
      wrongFeedback:
        'Belum tepat! Ingat ya, elektron bermuatan negatif sehingga tertarik ke kutub positif.',
    },
  },
  {
    id: 2,
    title: 'Misi 2 dari 3',
    subtitle: 'Misi 2: Isi Accu',
    instruction:
      'Kumpulkan 3 energy cell hijau untuk mengisi accu dan lompati genangan listrik kecil!',
    targetCount: 3,
    itemType: 'cell', // energy cell hijau
    accuTargetAfter: 66,
    platforms: [
      { x: 0, y: 460, w: 900, h: 60, type: 'board' },
      { x: 150, y: 360, w: 145, h: 24, type: 'wire' },
      { x: 375, y: 280, w: 155, h: 24, type: 'resistor' },
      { x: 610, y: 350, w: 145, h: 24, type: 'wire' },
    ],
    items: [
      { id: 'm2-1', x: 222, y: 318 },
      { id: 'm2-2', x: 452, y: 238 },
      { id: 'm2-3', x: 682, y: 308 },
    ],
    puddles: [
      { x: 305, y: 448, w: 68, h: 14 },
      { x: 535, y: 448, w: 68, h: 14 },
    ],
    gateX: 805,
    question: {
      prompt:
        'Sebuah accu diisi ulang dengan arus konstan 2,5 A selama 2 jam. Total muatan listrik yang mengalir adalah …',
      options: [
        { key: 'A', text: '1.800 C' },
        { key: 'B', text: '5.000 C' },
        { key: 'C', text: '9.000 C' },
        { key: 'D', text: '18.000 C' },
        { key: 'E', text: '36.000 C' },
      ],
      correctKey: 'D',
      correctFeedback: 'Benar! Q = I × t = 2,5 × 7.200 = 18.000 C.',
      wrongFeedback:
        'Coba hitung lagi! Ubah waktu 2 jam menjadi detik terlebih dahulu (2 × 3.600 detik).',
    },
  },
  {
    id: 3,
    title: 'Misi 3 dari 3',
    subtitle: 'Misi 3: Pemindai Elektron',
    instruction:
      'Arahkan Piko menuju kaca pembesar pemindai listrik, lalu masuk ke gerbang akhir!',
    targetCount: 1,
    itemType: 'scanner', // kaca pembesar listrik lucu
    accuTargetAfter: 100,
    platforms: [
      { x: 0, y: 460, w: 900, h: 60, type: 'board' },
      { x: 165, y: 365, w: 150, h: 24, type: 'resistor' },
      { x: 390, y: 295, w: 180, h: 24, type: 'wire' },
      { x: 630, y: 365, w: 130, h: 24, type: 'resistor' },
    ],
    items: [{ id: 'm3-1', x: 480, y: 245 }],
    puddles: [
      { x: 335, y: 448, w: 65, h: 14 },
      { x: 575, y: 448, w: 55, h: 14 },
    ],
    gateX: 805,
    question: {
      prompt:
        'Sebuah kawat dialiri arus 0,8 A selama 10 s. Jika muatan satu elektron adalah 1,6 × 10^-19 C, jumlah elektron yang melintasi penampang kawat adalah …',
      options: [
        { key: 'A', text: '4 × 10^18 elektron' },
        { key: 'B', text: '5 × 10^18 elektron' },
        { key: 'C', text: '4 × 10^19 elektron' },
        { key: 'D', text: '5 × 10^19 elektron' },
        { key: 'E', text: '8 × 10^19 elektron' },
      ],
      correctKey: 'D',
      correctFeedback:
        'Benar! Q = It = 8 C, sehingga jumlah elektronnya 5 × 10^19.',
      wrongFeedback:
        'Hampir benar! Cari muatan Q = I × t dulu, kemudian bagi Q dengan muatan elektron e.',
    },
  },
]
