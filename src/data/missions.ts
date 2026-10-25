import { BatteryFull, Lightbulb, Zap, PlugZap, School } from 'lucide-react'

export const PHET_URL =
  'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html'
export const missions = [
  {
    id: 1,
    title: 'Komponen Rangkaian',
    theme: 'lavender',
    icon: BatteryFull,
    subtitle: 'Kenali awal sebuah energi',
    badge: 'Perintis Rangkaian',
    story:
      'Lampu pojok baca di perpustakaan belum menyala. Tim sekolah membutuhkan bantuanmu untuk mengenali komponen dan menyusun rangkaian tertutup pertamanya.',
    target:
      'Mengenali sumber tegangan, penghantar, beban, dan sakelar pada rangkaian listrik.',
    steps: [
      'Temukan baterai, kabel, lampu, dan sakelar.',
      'Hubungkan semuanya menjadi rangkaian tertutup.',
      'Buka dan tutup sakelar. Amati perubahan pada lampu.',
    ],
    question: 'Komponen yang menjadi sumber beda potensial adalah ...',
    options: ['Kabel', 'Baterai', 'Lampu', 'Sakelar'],
    hint: 'Sumber beda potensial menyediakan energi untuk menggerakkan muatan. Kabel hanya menghubungkan komponen.',
  },
  {
    id: 2,
    title: 'Seri dan Paralel',
    theme: 'mint',
    icon: Lightbulb,
    subtitle: 'Satu jalur atau banyak jalan?',
    badge: 'Arsitek Jalur',
    story:
      'Satu lampu koridor sekolah putus, tetapi seluruh koridor ikut gelap. Bisakah kamu merancang susunan agar lampu lain tetap menyala?',
    target:
      'Membandingkan jalur arus dan perilaku lampu pada rangkaian seri dan paralel.',
    steps: [
      'Susun dua lampu secara seri, lalu lepaskan satu lampu.',
      'Susun kembali kedua lampu dalam cabang paralel.',
      'Lepaskan satu lampu dan bandingkan hasilnya.',
    ],
    question:
      'Agar lampu lain tetap menyala saat satu lampu putus, gunakan rangkaian ...',
    options: ['Seri', 'Terbuka', 'Paralel', 'Tanpa sumber tegangan'],
    hint: 'Coba pikirkan susunan dengan lebih dari satu jalur arus. Apa yang terjadi jika hanya satu cabang terputus?',
  },
  {
    id: 3,
    title: 'Hukum Ohm',
    theme: 'yellow',
    icon: Zap,
    subtitle: 'Temukan hubungan V, I, dan R',
    badge: 'Penjelajah Ohm',
    story:
      'Tim robotika membutuhkan hambatan yang tepat untuk rangkaian proyek sekolah. Gunakan tegangan dan arus yang terukur untuk menentukan nilainya.',
    target:
      'Menggunakan Hukum Ohm, V = I × R, untuk menghitung hambatan listrik.',
    steps: [
      'Susun baterai dan resistor dalam rangkaian tertutup.',
      'Gunakan amperemeter untuk mengamati arus.',
      'Ubah tegangan atau hambatan dan amati hubungan V = I × R.',
    ],
    question: 'Jika V = 12 V dan I = 2 A, nilai hambatan adalah ...',
    options: ['24 Ω', '10 Ω', '14 Ω', '6 Ω'],
    hint: 'Gunakan R = V ÷ I. Bagi nilai tegangan dengan kuat arus, lalu periksa satuannya.',
  },
  {
    id: 4,
    title: 'Daya Listrik',
    theme: 'coral',
    icon: PlugZap,
    subtitle: 'Energi bijak, sekolah hebat',
    badge: 'Sahabat Energi',
    story:
      'Sekolah ingin mengurangi konsumsi energi. Kamu diminta membandingkan dua perangkat dengan daya berbeda yang digunakan selama waktu yang sama.',
    target:
      'Menghubungkan daya dan waktu dengan energi listrik melalui E = P × t.',
    steps: [
      'Buat rangkaian dengan sumber tegangan dan beban.',
      'Amati tegangan dan arus, lalu hitung daya dengan P = V × I.',
      'Bandingkan energi dua perangkat selama waktu yang sama dengan E = P × t.',
    ],
    question:
      'Untuk waktu penggunaan yang sama, perangkat mana lebih hemat energi?',
    options: [
      'Perangkat berdaya lebih besar',
      'Semua perangkat selalu sama',
      'Perangkat berdaya lebih kecil',
      'Perangkat dengan kabel lebih panjang',
    ],
    hint: 'Energi = daya × waktu. Ketika waktunya sama, bagaimana perubahan daya memengaruhi energi?',
  },
  {
    id: 5,
    title: 'Sekolah Tangguh Energi',
    theme: 'blue',
    icon: School,
    subtitle: 'Satukan ilmu, bawa perubahan',
    badge: 'Pahlawan Sekolah',
    story:
      'Saatnya merancang penerangan sekolah tangguh energi! Setiap ruang perlu mengendalikan lampunya sendiri agar ruang kosong tidak terus memakai energi.',
    target:
      'Merancang rangkaian penerangan dengan cabang dan sakelar yang dapat dikendalikan mandiri.',
    steps: [
      'Buat tiga cabang paralel untuk mewakili tiga ruang.',
      'Pasang lampu dan sakelar pada setiap cabang.',
      'Uji apakah satu ruang dapat dimatikan tanpa memengaruhi ruang lain.',
    ],
    question:
      'Rancangan mana membuat tiap ruang dapat menyalakan lampu secara mandiri?',
    options: [
      'Rangkaian seri dengan satu sakelar',
      'Rangkaian paralel dengan sakelar tiap ruang',
      'Rangkaian paralel tanpa sakelar',
      'Semua lampu dalam satu cabang seri',
    ],
    hint: 'Setiap ruang memerlukan jalur arus sendiri dan alat pemutus arus yang mengendalikan ruang itu saja.',
  },
]
export type Mission = (typeof missions)[number]
