import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { experiments, parseMeasurement } from '../data/experiments'
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
  onContinue: (skipped: boolean) => void
}) {
  const config = experiments[missionId]
  const [errors, setErrors] = useState<Record<string, string>>({})
  const form = useRef<HTMLFormElement>(null)
  function submit(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    for (const field of config.groups.flatMap((group) => group.fields)) {
      const raw = draft.observations[field.id] ?? ''
      const number = parseMeasurement(raw)
      if (
        field.choices
          ? !field.choices.includes(raw)
          : number === null || (field.positive && number <= 0)
      ) {
        next[field.id] = field.choices
          ? 'Pilih hasil yang kamu amati, termasuk bila belum dapat menentukan.'
          : `Isi angka ${field.positive ? 'lebih dari nol' : 'nol atau positif'} dalam satuan pada label. Desimal boleh memakai koma atau titik.`
      }
    }
    setErrors(next)
    if (Object.keys(next).length) {
      form.current
        ?.querySelector<HTMLElement>(`#observation-${Object.keys(next)[0]}`)
        ?.focus()
    } else onContinue(false)
  }
  const number = (key: string) =>
    parseMeasurement(draft.observations[key] ?? '')
  const duration = number('duration')
  return (
    <form ref={form} onSubmit={submit} noValidate>
      <h2 tabIndex={-1} id="step-heading">
        Catat yang kamu amati
      </h2>
      <p>
        Isi dari pengamatanmu sendiri. Hasil yang berbeda dari perkiraan tetap
        boleh dicatat. Kolom kosong bukan angka nol.
      </p>
      {config.groups.map((group) => (
        <fieldset className="observation-group" key={group.title}>
          <legend>{group.title}</legend>
          <div className="observation-fields">
            {group.fields.map((field) => (
              <div className="guided-field" key={field.id}>
                <label htmlFor={`observation-${field.id}`}>{field.label}</label>
                {field.choices ? (
                  <select
                    id={`observation-${field.id}`}
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
                    maxLength={30}
                    placeholder="Belum diisi"
                    value={draft.observations[field.id] ?? ''}
                    aria-invalid={!!errors[field.id]}
                    aria-describedby={
                      errors[field.id]
                        ? `error-${field.id}`
                        : 'measurement-help'
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
            ))}
          </div>
        </fieldset>
      ))}
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
          Apa yang berbeda dari prediksimu? <span>(opsional)</span>
        </label>
        <textarea
          id="comparison"
          rows={3}
          maxLength={800}
          value={draft.comparison}
          onChange={(event) => update({ comparison: event.target.value })}
        />
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
      <button
        className="skip-observation secondary-button"
        type="button"
        onClick={() => onContinue(true)}
      >
        Lanjut tanpa pengamatan
      </button>
      <p className="guided-help">
        Pilihan ini menampilkan status “Belum mencatat pengamatan” dan
        mempertahankan isian sementara.
      </p>
    </form>
  )
}
