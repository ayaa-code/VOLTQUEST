import { PDFDocument, rgb, type PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { MissionReport } from './missionReport'
import { experiments } from './experiments'

export async function createReportPdf(
  report: MissionReport,
  fontBytes: ArrayBuffer,
  image?: Blob,
) {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const font = await pdf.embedFont(fontBytes, { subset: true })
  const supported = new Set(font.getCharacterSet())
  const clean = (value: string) =>
    Array.from(value)
      .map((c) => (c === '\n' || supported.has(c.codePointAt(0)!) ? c : '?'))
      .join('')
      .replace(/[\r\t]/g, ' ')
  const width = 595.28,
    height = 841.89,
    margin = 48,
    line = 17
  let page = pdf.addPage([width, height]),
    y = height - margin
  const ink = rgb(0.08, 0.2, 0.26),
    muted = rgb(0.3, 0.37, 0.42)
  function newPage() {
    page = pdf.addPage([width, height])
    y = height - margin
  }
  function wrap(text: string, size: number, font: PDFFont) {
    const lines: string[] = []
    let current = ''
    for (const paragraph of clean(text).split('\n')) {
      for (const word of paragraph.split(/\s+/)) {
        const candidate = current ? `${current} ${word}` : word
        if (font.widthOfTextAtSize(candidate, size) <= width - 2 * margin) {
          current = candidate
          continue
        }
        if (current) lines.push(current)
        current = ''
        for (const char of word) {
          if (
            font.widthOfTextAtSize(current + char, size) >
            width - 2 * margin
          ) {
            lines.push(current)
            current = ''
          }
          current += char
        }
      }
      if (current) lines.push(current)
      current = ''
    }
    return lines
  }
  function text(value: string, size = 10.5, heading = false) {
    const lines = wrap(value, size, font)
    const needed = lines.length * (heading ? 22 : line) + (heading ? 6 : 9)
    if (needed <= height - 2 * margin - 25 && y - needed < margin + 25)
      newPage()
    if (heading && y < margin + 65) newPage()
    for (const content of lines) {
      if (y < margin + 25) newPage()
      page.drawText(content, {
        x: margin,
        y,
        size,
        font,
        color: heading ? ink : muted,
      })
      y -= heading ? 22 : line
    }
    y -= heading ? 6 : 9
  }
  text('VoltQuest | Laporan Eksperimen', 19, true)
  text(
    `MISSION ${String(report.number).padStart(2, '0')} - ${report.title}`,
    13,
    true,
  )
  text(
    `Nama: ${report.name}\nDikirim: ${new Date(report.submittedAt).toLocaleString('id-ID')}\nPengiriman awal: ${new Date(report.createdAt).toLocaleString('id-ID')}\nStatus: ${report.status}`,
  )
  const input = report.input,
    initial = input.initialPrediction
  text('Prediksi dan alasan', 13, true)
  text(
    `Prediksi awal: ${initial?.choice === 'Prediksi lain' ? initial.text : initial?.choice || (input.prediction === 'Prediksi lain' ? input.predictionText : input.prediction)}\nAlasan awal: ${initial?.reason || input.predictionReason}`,
  )
  text(
    `Prediksi yang dikirim: ${input.prediction === 'Prediksi lain' ? input.predictionText : input.prediction}\nAlasan: ${input.predictionReason}`,
  )
  text('Data pengamatan', 13, true)
  for (const group of experiments[report.missionId].groups) {
    text(group.title, 11, true)
    for (const field of group.fields)
      text(`${field.label}: ${input.observations[field.id] ?? 'Belum diisi'}`)
  }
  text(`Perbandingan dengan prediksi: ${input.comparison}`)
  if (image) {
    const bytes = await image.arrayBuffer()
    const embedded =
      image.type === 'image/jpeg'
        ? await pdf.embedJpg(bytes)
        : await pdf.embedPng(bytes)
    const scale = Math.min(
        (width - 2 * margin) / embedded.width,
        310 / embedded.height,
      ),
      w = embedded.width * scale,
      h = embedded.height * scale
    if (y - h < margin + 65) newPage()
    text('Bukti rangkaian', 13, true)
    page.drawImage(embedded, {
      x: (width - w) / 2,
      y: y - h,
      width: w,
      height: h,
    })
    y -= h + 20
    text(
      'Screenshot siswa; susunan kabel pada gambar belum diverifikasi otomatis.',
      9,
    )
  } else {
    text('Bukti rangkaian', 13, true)
    text(
      'Tidak ada screenshot yang disertakan. Ketiadaan gambar tidak otomatis berarti percobaan salah.',
    )
  }
  text('Refleksi', 13, true)
  text(
    `${report.question}\nPilihan yang dikirim: ${input.answer === null ? 'Belum diisi' : String.fromCharCode(65 + input.answer)} - ${report.answerText}\nHasil pilihan: ${report.choiceCorrect ? 'tepat' : 'perlu revisi'}\nPenjelasan siswa: ${input.reflectionReason}`,
  )
  text('Pembahasan dan arahan perbaikan', 13, true)
  for (const finding of report.findings)
    text(`[${finding.kind}] ${finding.text}\nSaran: ${finding.suggestion}`)
  text('Pembahasan AI', 13, true)
  if (report.ai) {
    for (const item of report.ai.strengths) text(`Yang sudah sesuai: ${item}`)
    for (const item of report.ai.findings)
      text(`Temuan: ${item.explanation}\nSaran: ${item.suggestion}`)
    text(report.ai.limitations)
  } else
    text(
      'Pembahasan AI belum tersedia. Hasil di atas adalah pemeriksaan lokal atas catatan siswa, bukan pengamatan langsung atas kegiatan PhET atau penilaian makna penjelasan.',
    )
  text(
    'Belajar berikutnya: tinjau materi yang terkait dengan temuan, periksa kembali alat ukur dan satuan, lalu revisi laporan berdasarkan bukti. Tidak ada skor persentase penguasaan yang dibuat otomatis.',
  )
  const pages = pdf.getPages()
  pages.forEach((p, i) => {
    p.drawLine({
      start: { x: margin, y: 38 },
      end: { x: width - margin, y: 38 },
      thickness: 0.5,
      color: rgb(0.7, 0.8, 0.83),
    })
    p.drawText(`VoltQuest | ${i + 1} / ${pages.length}`, {
      x: margin,
      y: 23,
      size: 9,
      font,
      color: muted,
    })
  })
  return pdf.save()
}
