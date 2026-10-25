import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  experiments,
  parseMeasurement,
  observationErrors,
  observationTables,
} from '../data/experiments'
import type { Draft } from '../hooks/useExperimentDraft'

export function ObservationForm({
  missionId,
  draft,
  update,
  onBack,
  onContinue,
}: {
  missionId: number
  draft: Draft
  update: (patch: Partial<Draft>) => void
  onBack: () => void
  onContinue: () => void
}) {
  const config = experiments[missionId]
  const [errors, setErrors] = useState<Record<string, string>>({})
  const form = useRef<HTMLFormElement>(null)
  function submit(event: FormEvent) {
    event.preventDefault()
    const next = observationErrors(missionId, draft.observations)
    if (!draft.comparison.trim()) next.comparison = 'Isi perbandingan dengan prediksimu sebelum melanjutkan.'
    setErrors(next)
    if (Object.keys(next).length) {
      form.current
        ?.querySelector<HTMLElement>(Object.keys(next)[0] === 'comparison' ? '#comparison' : `#observation-${Object.keys(next)[0]}`)
        ?.focus()
    } else onContinue()
  }
  const number = (key: string) =>
    parseMeasurement(draft.observations[key] ?? '')
  const duration = number('duration')
  const layout = observationTables[missionId]
  const fields = config.groups.flatMap((group) => group.fields)
  const control = (id: string, showLabel = false) => {
    const field = fields.find((field) => field.id === id)!
    return (
      <div className="guided-field" key={field.id}>
        <label
          className={showLabel ? undefined : 'visually-hidden'}
          htmlFor={`observation-${field.id}`}
        >
          {field.label}
        </label>
        {field.choices ? (
          <select
            id={`observation-${field.id}`}
            required
            value={draft.observations[field.id] ?? ''}
            aria-invalid={!!errors[field.id]}
            aria-describedby={
              errors[field.id] ? `error-${field.id}` : undefined
            }
            onChange={(event) =>
              update({
                observations: {
                  ...draft.observations,
                  [field.id]: event.target.value,
                },
                observationStatus: 'draft',
              })
            }
          >
            <option value="">Pilih hasil pengamatan</option>
            {field.choices.map((choice) => (
              <option key={choice}>{choice}</option>
            ))}
          </select>
        ) : (
          <input
            id={`observation-${field.id}`}
            inputMode="decimal"
            type="text"
            required
            maxLength={30}
            placeholder="Belum diisi"
            value={draft.observations[field.id] ?? ''}
            aria-invalid={!!errors[field.id]}
            aria-describedby={
              errors[field.id] ? `error-${field.id}` : 'measurement-help'
            }
            onChange={(event) =>
              update({
                observations: {
                  ...draft.observations,
                  [field.id]: event.target.value,
                },
                observationStatus: 'draft',
              })
            }
          />
        )}
        {errors[field.id] && (
          <p className="field-error" id={`error-${field.id}`}>
            {errors[field.id]}
          </p>
        )}
      </div>
    )
  }
  return (
    <form className="observation-form" ref={form} onSubmit={submit} noValidate>
      <h2 tabIndex={-1} id="step-heading">
        Catat yang kamu amati
      </h2>
      <p>
        Isi dari pengamatanmu sendiri. Hasil yang berbeda dari perkiraan tetap
        boleh dicatat. Kolom kosong bukan angka nol.
      </p>
      <p className="guided-help">
        Semua hasil pengamatan wajib diisi sebelum refleksi. Isian disimpan
        sebagai draf saat kamu mengubahnya.
      </p>
      {layout.shared.map((id) => control(id, true))}
      {missionId === 4 && (
        <p className="guided-help">
          Durasi adalah asumsi penggunaan yang kamu pilih, bukan pembacaan waktu
          dari PhET.
        </p>
      )}
      <p className="table-scroll-help">
        Pada layar kecil, geser tabel ke samping untuk melihat semua kolom.
      </p>
      <div
        className="observation-table-scroll"
        role="region"
        aria-label="Tabel pengamatan, dapat digeser"
        tabIndex={0}
      >
        <table className="observation-table">
          <caption>{layout.caption}</caption>
          <thead>
            <tr>
              {layout.columns.map((column) => (
                <th scope="col" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {layout.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.fields.map((id) => (
                  <td key={id}>{control(id)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(missionId === 3 || missionId === 4) && (
        <p className="guided-help" id="measurement-help">
          Gunakan besar nilai tanpa tanda minus: volt (V), ampere (A), ohm (Ω),
          atau detik sesuai label. Contoh format desimal: 0,5 atau 0.5.
          Konversikan mA ke A sebelum mencatat.
        </p>
      )}
      {missionId === 4 && (
        <aside
          className="calculation-summary"
          aria-label="Perhitungan dari catatan"
        >
          <strong>Dihitung dari data yang kamu masukkan</strong>
          <p>
            P = V × I (watt); E = P × t (joule). V dan I diasumsikan konstan.
          </p>
          {['A', 'B'].map((name) => {
            const v = number(`v${name}`),
              i = number(`i${name}`)
            const power = v !== null && i !== null ? v * i : null
            const energy =
              power !== null && duration !== null ? power * duration : null
            const format = (value: number | null) =>
              value === null || !Number.isFinite(value)
                ? 'Belum dapat dihitung'
                : value.toLocaleString('id-ID', { maximumSignificantDigits: 8 })
            return (
              <p key={name}>
                Beban {name}: P = {format(power)}
                {power !== null && Number.isFinite(power) ? ' W' : ''}; E ={' '}
                {format(energy)}
                {energy !== null && Number.isFinite(energy) ? ' J' : ''}.
              </p>
            )
          })}
        </aside>
      )}
      <div className="guided-field">
        <label htmlFor="comparison">
          Apa yang berbeda dari prediksimu? <span>(wajib diisi)</span>
        </label>
        <textarea
          id="comparison"
          required
          aria-invalid={!!errors.comparison}
          aria-describedby={errors.comparison ? 'error-comparison' : undefined}
          rows={3}
          maxLength={800}
          value={draft.comparison}
          onChange={(event) => update({ comparison: event.target.value })}
        />
        {errors.comparison && <p className="field-error" id="error-comparison">{errors.comparison}</p>}
      </div>
      <p className="guided-help">
        Catatan dan alasan tidak dinilai otomatis. Menyimpan catatan tidak
        memverifikasi aktivitas di PhET.
      </p>
      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Kembali ke eksperimen
        </button>
        <button className="primary-button" type="submit">
          Simpan pengamatan dan lanjut
        </button>
      </div>
    </form>
  )
}
