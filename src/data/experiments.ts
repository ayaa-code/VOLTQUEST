export type ObservationField = {
  id: string
  label: string
  choices?: string[]
  positive?: boolean
}
export type Experiment = {
  prediction: string
  choices: string[]
  components: string
  changed: string
  controlled: string
  actions: string[]
  observe: string
  groups: { title: string; fields: ObservationField[] }[]
}
const lamp = ['Menyala', 'Padam', 'Redup', 'Belum dapat menentukan']
const numeric = (
  id: string,
  label: string,
  positive = false,
): ObservationField => ({ id, label, positive })
export const experiments: Record<number, Experiment> = {
  1: {
    prediction: 'Apa yang terjadi pada lampu saat sakelar dibuka lalu ditutup?',
    choices: [
      'Keadaan lampu berubah',
      'Keadaan lampu tetap sama',
      'Belum yakin',
    ],
    components: 'Baterai, kabel, satu lampu, dan satu sakelar.',
    changed: 'Posisi sakelar: terbuka dan tertutup.',
    controlled: 'Baterai, lampu, dan sambungan kabel yang sama.',
    actions: [
      'Hubungkan baterai, lampu, dan sakelar dengan kabel.',
      'Buka sakelar, catat keadaan lampu. Tutup sakelar dan catat kembali.',
    ],
    observe: 'Keadaan lampu pada kedua posisi sakelar.',
    groups: [
      {
        title: 'Dua posisi sakelar',
        fields: [
          { id: 'open', label: 'Lampu saat sakelar terbuka', choices: lamp },
          { id: 'closed', label: 'Lampu saat sakelar tertutup', choices: lamp },
        ],
      },
    ],
  },
  2: {
    prediction:
      'Jika satu dari dua lampu dilepas, apakah lampu lainnya tetap menyala?',
    choices: [
      'Pada kedua susunan',
      'Hanya pada seri',
      'Hanya pada paralel',
      'Pada keduanya padam',
      'Belum yakin',
    ],
    components: 'Baterai, kabel, dan dua lampu sejenis.',
    changed:
      'Susunan seri/paralel dan pelepasan satu lampu pada setiap susunan.',
    controlled:
      'Baterai serta kedua lampu yang sama; periksa sambungan sebelum tiap uji.',
    actions: [
      'Susun dua lampu seri. Catat keadaan lampu kedua sebelum dan sesudah lampu pertama dilepas.',
      'Pasang kembali kedua lampu sebagai dua cabang paralel. Ulangi pelepasan satu lampu dan pencatatan.',
    ],
    observe: 'Keadaan lampu yang tidak dilepas pada masing-masing susunan.',
    groups: ['Seri', 'Paralel'].map((name, index) => ({
      title: name,
      fields: [
        {
          id: `before${index}`,
          label: `Lampu lain sebelum pelepasan (${name})`,
          choices: lamp,
        },
        {
          id: `after${index}`,
          label: `Lampu lain setelah pelepasan (${name})`,
          choices: lamp,
        },
      ],
    })),
  },
  3: {
    prediction:
      'Saat tegangan dinaikkan dengan resistor ohmik yang sama, bagaimana arus berubah?',
    choices: ['Arus bertambah', 'Arus berkurang', 'Arus tetap', 'Belum yakin'],
    components: 'Baterai, kabel, resistor ohmik, voltmeter, dan amperemeter.',
    changed: 'Tegangan sumber: pilih dua nilai berbeda yang tersedia.',
    controlled:
      'Nilai resistor, susunan, dan sambungan; gunakan resistor, bukan lampu.',
    actions: [
      'Buat satu rangkaian tertutup dengan resistor. Catat hambatan yang dipilih.',
      'Ukur beda potensial pada kedua ujung resistor dan arus yang melewatinya untuk kondisi A.',
      'Ubah hanya tegangan sumber. Ulangi pengukuran untuk kondisi B. Gunakan besar nilai V dan I.',
    ],
    observe:
      'Dua pasangan tegangan pada resistor (V) dan arus (A), dengan hambatan tetap (Ω).',
    groups: [
      {
        title: 'Hambatan tetap',
        fields: [numeric('r', 'Hambatan resistor (Ω)', true)],
      },
      ...['A', 'B'].map((name) => ({
        title: `Kondisi ${name}`,
        fields: [
          numeric(`v${name}`, `Tegangan ${name} (V)`),
          numeric(`i${name}`, `Arus ${name} (A)`),
        ],
      })),
    ],
  },
  4: {
    prediction:
      'Untuk durasi yang sama, bagaimana energi dua beban dengan daya berbeda dibandingkan?',
    choices: [
      'Beban berdaya lebih besar memakai energi lebih besar',
      'Beban berdaya lebih kecil memakai energi lebih besar',
      'Energinya selalu sama',
      'Belum yakin',
    ],
    components:
      'Baterai, kabel, dua beban resistif untuk diuji bergantian, voltmeter, dan amperemeter.',
    changed: 'Beban A dan B yang diuji bergantian pada sumber yang sama.',
    controlled:
      'Tegangan sumber dan durasi penggunaan yang dipilih; anggap V dan I konstan selama durasi itu.',
    actions: [
      'Pasang beban A, ukur besar tegangan pada beban dan arusnya.',
      'Ganti dengan beban B. Ukur kembali V dan I pada sumber yang sama.',
      'Pilih durasi yang sama dalam detik. Hitung P = V × I dan E = P × t untuk setiap beban. Durasi ini asumsi penggunaan, bukan waktu yang dibaca dari PhET.',
    ],
    observe:
      'V dan I tiap beban. Energi dalam joule; perbandingan ini bukan penilaian efisiensi atau kesetaraan penerangan.',
    groups: [
      ...['A', 'B'].map((name) => ({
        title: `Beban ${name}`,
        fields: [
          numeric(`v${name}`, `Tegangan ${name} (V)`),
          numeric(`i${name}`, `Arus ${name} (A)`),
        ],
      })),
      {
        title: 'Durasi penggunaan yang sama',
        fields: [numeric('duration', 'Durasi (detik)')],
      },
    ],
  },
  5: {
    prediction:
      'Saat satu sakelar ruang dibuka, ruang mana yang lampunya terpengaruh?',
    choices: [
      'Hanya ruang pada cabang itu',
      'Semua ruang',
      'Tidak ada ruang',
      'Belum yakin',
    ],
    components: 'Baterai, kabel, tiga lampu, dan tiga sakelar.',
    changed: 'Buka satu sakelar cabang pada setiap uji.',
    controlled:
      'Tiga cabang paralel pada sumber yang sama; tutup kembali semua sakelar sebelum uji berikutnya.',
    actions: [
      'Susun tiga cabang paralel. Setiap cabang berisi lampu dan sakelar untuk ruang 1, 2, atau 3.',
      'Mulai dengan semua sakelar tertutup. Buka sakelar ruang 1 dan amati ketiga lampu.',
      'Tutup kembali semua sakelar. Ulangi untuk ruang 2 lalu ruang 3. Catat ruang yang berubah pada setiap uji.',
    ],
    observe:
      'Ruang yang keadaan lampunya berubah. Kendali mandiri tidak otomatis membuktikan penghematan energi.',
    groups: [1, 2, 3].map((room) => ({
      title: `Sakelar ruang ${room} dibuka`,
      fields: [
        {
          id: `room${room}`,
          label: `Ruang yang berubah pada uji ${room}`,
          choices: [
            'Hanya ruang 1',
            'Hanya ruang 2',
            'Hanya ruang 3',
            'Ruang 1 dan 2',
            'Ruang 1 dan 3',
            'Ruang 2 dan 3',
            'Semua ruang',
            'Tidak ada',
            'Belum dapat menentukan',
          ],
        },
      ],
    })),
  },
}

// Decimal commas and points are accepted, but no implicit unit conversion or empty-to-zero coercion.
export function parseMeasurement(raw: string): number | null {
  if (!/^\d+(?:[.,]\d+)?$/.test(raw.trim())) return null
  const value = Number(raw.trim().replace(',', '.'))
  return Number.isFinite(value) ? value : null
}
