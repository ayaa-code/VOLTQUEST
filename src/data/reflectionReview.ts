export type ReflectionReview = {
  source: 'local'
  at: number
  answer: number
  reason: string
  observations: string
  comparison: string
  choiceCorrect: boolean
  explanation: 'needs-revision' | 'unassessed'
}
// This detects missing evidence only; it never certifies semantic correctness.
export function explanationNeedsRevision(value: string) {
  const text = value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
  return (
    !text ||
    /^(ga|gak|nggak|tidak|g)\s*(tau|tahu|paham|mengerti)(\s.*)?$/.test(text) ||
    /^(gatau|gaktau|idk|tidaktahu|asdf\w*|qwerty\w*|bla\s*bla\w*|entahlah|ok|ya|tidak|test|tes)$/.test(
      text,
    ) ||
    !/[aiueo]/.test(text)
  )
}
