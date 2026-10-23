import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement as HTMLElement | null
    dialog?.showModal()
    return () => {
      dialog?.close()
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]',
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled') &&
            element.getClientRects().length > 0 &&
            window.getComputedStyle(element).visibility !== 'hidden',
        )
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault()
          last.focus()
        } else if (
          !event.shiftKey &&
          document.activeElement === last &&
          first
        ) {
          event.preventDefault()
          first.focus()
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dialog-heading">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" aria-label="Tutup" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
