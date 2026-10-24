export const MISSIONS_DATA = [
  {
    id: 1,
    title: 'Misi 1 dari 3',
    subtitle: 'Misi 1: Arus Listrik',
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
        'Akumulator diisi arus 2,5 A selama 2 jam. Berapa muatan listrik yang mengalir?',
      options: [
        {
          key: 'A',
          text: '1.800 C',
        },
        {
          key: 'B',
          text: '18.000 C',
        },
        {
          key: 'C',
          text: '5.000 C',
        },
        {
          key: 'D',
          text: '9.000 C',
        },
        { key: 'E', text: '36.000 C' },
      ],
      correctKey: 'B',
      correctFeedback: 'Benar! Q = It = 2,5 × 7.200 = 18.000 C.',
      wrongFeedback: 'Ubah 2 jam menjadi 7.200 sekon, kemudian gunakan Q = It.',
    },
  },
  {
    id: 2,
    title: 'Misi 2 dari 3',
    subtitle: 'Misi 2: Ohmik dan Non-ohmik',
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
        'Data V dan I: (2 V; 0,10 A), (4 V; 0,20 A), (6 V; 0,30 A), (8 V; 0,40 A). Tentukan jenis komponen dan hambatannya.',
      options: [
        { key: 'A', text: 'Non-ohmik, 20 Ω' },
        { key: 'B', text: 'Ohmik, 2 Ω' },
        { key: 'C', text: 'Non-ohmik, 40 Ω' },
        { key: 'D', text: 'Ohmik, 20 Ω' },
        { key: 'E', text: 'Ohmik, 40 Ω' },
      ],
      correctKey: 'D',
      correctFeedback:
        'Benar! Semua pengukuran memiliki V/I = 20 Ω, sehingga komponen ohmik.',
      wrongFeedback:
        'Hitung V/I pada setiap pasangan. Nilai tetap berarti komponen ohmik.',
    },
  },
  {
    id: 3,
    title: 'Misi 3 dari 3',
    subtitle: 'Misi 3: Hambatan Jenis · Pemindai',
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
        'Kawat A dan B dari bahan sama. Panjang B dua kali A, diameter B setengah A. Jika hambatan A = 10 Ω, berapa hambatan B?',
      options: [
        { key: 'A', text: '5 Ω' },
        { key: 'B', text: '20 Ω' },
        { key: 'C', text: '40 Ω' },
        { key: 'D', text: '80 Ω' },
        { key: 'E', text: '160 Ω' },
      ],
      correctKey: 'D',
      correctFeedback:
        'Benar! Luas B seperempat A. R B = 2 ÷ (1/4) × 10 = 80 Ω.',
      wrongFeedback:
        'Gunakan R = ρL/A. Luas penampang mengikuti kuadrat diameter.',
    },
  },
]
