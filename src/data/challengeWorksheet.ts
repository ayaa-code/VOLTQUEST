export type WorksheetData = { visited: boolean; fields: Record<string, string> }
export type Finding = { field: string; kind: 'error' | 'review'; text: string }
export type AIReview = {
  summary: string
  coverage: string[]
  strengths: string[]
  findings: {
    field: string
    kind: string
    explanation: string
    suggestion: string
    topicId: number
  }[]
  limitations: string
}
export type WorksheetRecord = {
  data: WorksheetData
  snapshot: string
  savedAt: string
  completedAt?: string
  reviewed?: string
  history: { snapshot: string; data: WorksheetData; savedAt: string }[]
  feedback: { snapshot: string; at: string; result: AIReview }[]
}
export type Field = {
  id: string
  label: string
  numeric?: boolean
  optional?: boolean
}
export type WorksheetSection = {
  title: string
  instruction: string
  rows: { title: string; fields: Field[]; derived?: string }[]
  analysis: Field[]
}
const n = (id: string, label: string): Field => ({ id, label, numeric: true })
const t = (id: string, label: string): Field => ({ id, label })
export const worksheetSections: WorksheetSection[] = [
  {
    title: 'A — Rangkaian terbuka dan tertutup',
    instruction:
      'Gunakan baterai, sakelar, dan lampu yang sama. Ukur besar arus dengan amperemeter seri; catat keadaan lampu.',
    rows: ['Terbuka', 'Tertutup'].map((title, i) => ({
      title,
      fields: [
        t(`a${i}lamp`, 'Keadaan lampu'),
        n(`a${i}i`, 'Arus terukur (A)'),
        t(`a${i}note`, 'Catatan pengamatan'),
      ],
    })),
    analysis: [
      t('aAnalysis1', 'Apa perbedaan keadaan lampu pada kedua kondisi?'),
      t('aAnalysis2', 'Bagaimana jalur tertutup memengaruhi arus?'),
    ],
  },
  {
    title: 'B — Hubungan tegangan dan arus',
    instruction:
      'Gunakan resistor ohmik dan susunan yang sama. Ubah tegangan sumber tiga kali; ukur tegangan pada resistor secara paralel dan arus melaluinya secara seri.',
    rows: [
      {
        title: 'Pengaturan tetap',
        fields: [
          n('bR', 'Nilai resistor (Ω)'),
          t('bSetup', 'Susunan dan pengaturan alat'),
        ],
      },
      ...[0, 1, 2].map((i) => ({
        title: `Pengukuran ${i + 1}`,
        fields: [
          n(`b${i}v`, 'Tegangan resistor (V)'),
          n(`b${i}i`, 'Arus resistor (A)'),
          t(`b${i}note`, 'Catatan pengamatan'),
        ],
        derived: `b${i}r`,
      })),
    ],
    analysis: [
      t('bAnalysis1', 'Bagaimana arus berubah ketika tegangan berubah?'),
      t('bAnalysis2', 'Apakah rasio V/I konsisten? Gunakan bukti tabel.'),
      t('bAnalysis3', 'Hubungkan pengamatan dengan Hukum Ohm.'),
    ],
  },
  {
    title: 'C — Seri dan paralel',
    instruction:
      'Gunakan dua beban. Catat jenis dan nilai nominal keduanya untuk setiap susunan, lalu lepas satu beban dan amati beban lain. Nilai tegangan adalah besar beda potensial.',
    rows: ['Seri', 'Paralel'].map((title, i) => ({
      title,
      fields: [
        t(`c${i}loads`, 'Jenis dan nilai nominal beban 1 dan 2'),
        n(`c${i}v`, 'Tegangan sumber (V)'),
        n(`c${i}i`, 'Arus total (A)'),
        n(`c${i}v1`, 'Tegangan beban 1 (V)'),
        n(`c${i}v2`, 'Tegangan beban 2 (V)'),
        t(`c${i}disconnect`, 'Keadaan beban lain saat satu beban dilepas'),
        t(`c${i}note`, 'Catatan pengamatan'),
      ],
    })),
    analysis: [
      t('cAnalysis1', 'Bandingkan pembagian tegangan seri dan paralel.'),
      t('cAnalysis2', 'Jelaskan dampak satu beban terputus.'),
      t(
        'cAnalysis3',
        'Susunan mana sesuai untuk lampu beberapa ruangan? Mengapa?',
      ),
    ],
  },
  {
    title: 'D — Percabangan dan daya',
    instruction:
      'Gunakan satu titik cabang: satu arus masuk dan dua arus keluar. Catat besar arus nonnegatif sesuai orientasi tersebut. Ukur V dan I pada beban yang sama untuk daya.',
    rows: [
      {
        title: 'Percabangan',
        fields: [
          n('dIn', 'Arus masuk (A)'),
          n('d1', 'Arus cabang 1 (A)'),
          n('d2', 'Arus cabang 2 (A)'),
          t('dNote', 'Catatan pengamatan'),
        ],
        derived: 'branch',
      },
      {
        title: 'Daya beban',
        fields: [
          t('dLoad', 'Nama beban'),
          n('dV', 'Tegangan beban (V)'),
          n('dI', 'Arus beban (A)'),
          t('dExplain', 'Penjelasan hasil daya'),
        ],
        derived: 'power',
      },
    ],
    analysis: [
      t('dAnalysis1', 'Bagaimana arus masuk dibandingkan jumlah arus cabang?'),
      t('dAnalysis2', 'Jelaskan kesesuaian dengan Hukum I Kirchhoff.'),
      t('dAnalysis3', 'Jelaskan hubungan tegangan, arus, dan daya beban.'),
    ],
  },
  {
    title: 'Kesimpulan dan bukti',
    instruction:
      'Simpulkan hanya konsep yang benar-benar kamu eksplorasi. Kegiatan ini tidak menguji resistivitas atau sifat non-ohmik.',
    rows: [],
    analysis: [
      t('conclusion', 'Kesimpulan utama'),
      t('evidence', 'Bukti pengamatan pendukung'),
      { ...t('curiosity', 'Hal yang masih ingin dipelajari'), optional: true },
    ],
  },
]
export const worksheetFields = worksheetSections.flatMap((s) => [
  ...s.rows.flatMap((r) => r.fields),
  ...s.analysis,
])
export const emptyWorksheet = (): WorksheetData => ({
  visited: false,
  fields: {},
})
export const snapshotOf = (data: WorksheetData) =>
  JSON.stringify({
    visited: data.visited,
    fields: Object.fromEntries(
      worksheetFields.map((f) => [f.id, data.fields[f.id] ?? '']),
    ),
  })
export function numberOf(value: string | undefined): number | null {
  if (!value?.trim() || !/^\d+(?:[.,]\d+)?$/.test(value.trim())) return null
  const result = Number(value.trim().replace(',', '.'))
  return Number.isFinite(result) ? result : null
}
export const tolerance = { absolute: 0.02, relative: 0.05 }
export const closeEnough = (a: number, b: number) =>
  Math.abs(a - b) <=
  tolerance.absolute + tolerance.relative * Math.max(Math.abs(a), Math.abs(b))
export function inspectWorksheet(data: WorksheetData) {
  const findings: Finding[] = []
  const computed: Record<string, number | null> = {}
  const value = (id: string) => numberOf(data.fields[id])
  for (const field of worksheetFields) {
    const raw = data.fields[field.id]?.trim() ?? ''
    if (!raw && !field.optional)
      findings.push({
        field: field.id,
        kind: 'error',
        text: 'Isian wajib belum lengkap; informasi belum cukup.',
      })
    else if (field.numeric && raw && value(field.id) === null)
      findings.push({
        field: field.id,
        kind: 'error',
        text: 'Gunakan angka nonnegatif tanpa satuan, dengan koma atau titik desimal.',
      })
    else if (raw.length > 1200)
      findings.push({
        field: field.id,
        kind: 'error',
        text: 'Batasi isian hingga 1.200 karakter.',
      })
  }
  for (let i = 0; i < 3; i++) {
    const v = value(`b${i}v`),
      current = value(`b${i}i`)
    const r = v !== null && current !== null && current > 0 ? v / current : null
    computed[`b${i}r`] = r !== null && Number.isFinite(r) ? r : null
    if (r !== null && !Number.isFinite(r))
      findings.push({
        field: `b${i}i`,
        kind: 'error',
        text: 'Hasil pembagian tidak finite; periksa besaran tegangan dan arus.',
      })
    if (current === 0)
      findings.push({
        field: `b${i}i`,
        kind: 'error',
        text: 'Rasio V/I tidak dapat dihitung saat arus nol. Ukur resistor pada tegangan dan arus bukan nol.',
      })
    if (r !== null && value('bR') !== null && !closeEnough(r, value('bR')!))
      findings.push({
        field: `b${i}i`,
        kind: 'review',
        text: 'Rasio V/I berbeda dari resistor yang dicatat; periksa pengaturan dan resolusi alat.',
      })
  }
  const calculate = (
    ids: string[],
    fn: (values: number[]) => number,
  ): number | null => {
    const values = ids.map(value)
    if (values.some((v) => v === null)) return null
    const result = fn(values as number[])
    return Number.isFinite(result) ? result : null
  }
  computed.branch = calculate(['d1', 'd2'], (v) => v[0] + v[1])
  computed.difference = calculate(
    ['dIn', 'd1', 'd2'],
    (v) => v[0] - v[1] - v[2],
  )
  computed.power = calculate(['dV', 'dI'], (v) => v[0] * v[1])
  for (const [key, result] of Object.entries(computed))
    if (
      result === null &&
      (key === 'power' || key === 'branch' || key === 'difference') &&
      !findings.some((f) => f.kind === 'error')
    )
      findings.push({
        field: 'dV',
        kind: 'error',
        text: 'Hasil hitung tidak finite; periksa besaran pengukuran.',
      })
  const review = (field: string, text: string) =>
    findings.push({ field, kind: 'review', text })
  if (
    computed.branch !== null &&
    value('dIn') !== null &&
    !closeEnough(computed.branch, value('dIn')!)
  )
    review(
      'dIn',
      'Jumlah arus cabang berbeda dari arus masuk. Periksa titik cabang, orientasi, dan pembulatan.',
    )
  if (value('a0i') !== null && !closeEnough(value('a0i')!, 0))
    review(
      'a0i',
      'Arus rangkaian terbuka idealnya nol; periksa apakah jalur benar-benar terputus.',
    )
  for (let i = 0; i < 2; i++) {
    const source = value(`c${i}v`),
      v1 = value(`c${i}v1`),
      v2 = value(`c${i}v2`)
    if (
      source !== null &&
      v1 !== null &&
      v2 !== null &&
      (i === 0
        ? !closeEnough(source, v1 + v2)
        : !closeEnough(source, v1) || !closeEnough(source, v2))
    )
      review(
        `c${i}v1`,
        'Tegangan belum konsisten dengan model ideal dua beban; tinjau sambungan dan posisi voltmeter.',
      )
  }
  return {
    findings,
    computed,
    valid: !findings.some((f) => f.kind === 'error'),
  }
}
export const displayNumber = (value: number | null | undefined) =>
  value == null
    ? 'Tidak dapat dihitung'
    : new Intl.NumberFormat('id-ID', { maximumSignificantDigits: 7 }).format(
        value,
      )
