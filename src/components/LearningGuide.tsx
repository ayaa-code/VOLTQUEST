import { BookOpen, Target } from 'lucide-react'
export function LearningGuide() {
  return (
    <div className="learning-guide">
      <div className="guide-subject">
        <BookOpen size={22} aria-hidden="true" />
        <div>
          <span>Mata Pelajaran · Fisika</span>
          <h3>Listrik Dinamis</h3>
        </div>
      </div>
      <section className="guide-outcome">
        <h3>
          <Target size={18} aria-hidden="true" /> Capaian Pembelajaran (CP)
        </h3>
        <p>Mengevaluasi rangkaian listrik.</p>
      </section>
      <section>
        <h3>Tujuan Pembelajaran (TP)</h3>
        <ol>
          <li>
            Murid mampu menyebutkan besaran dasar listrik dinamis (arus,
            tegangan, hambatan, dan daya) beserta satuannya.
          </li>
          <li>
            Murid mampu menentukan hambatan total, arus, dan tegangan pada
            rangkaian seri dan paralel resistor dengan menggunakan Hukum Ohm.
          </li>
          <li>
            Murid mampu menganalisis hubungan antara arus, tegangan, hambatan,
            dan daya pada rangkaian seri, paralel, dan majemuk menggunakan Hukum
            Ohm dan Hukum Kirchhoff.
          </li>
          <li>
            Murid mampu mengevaluasi berbagai rangkaian listrik dinamis
            berdasarkan efisiensi, keamanan, dan kesesuaian dengan kebutuhan
            sehari-hari.
          </li>
        </ol>
      </section>
      <p className="guide-route">
        <strong>Alur belajar</strong>
        <br />
        Materi 1–3 → Formatif 1 → Materi 4–6 → Formatif 2 → Challenge PhET →
        Sumatif.
      </p>
    </div>
  )
}
