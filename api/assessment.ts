import { gradeAssessment } from '../server/assessment.ts'
export default function handler(
  req: {
    method?: string
    headers: Record<string, string | string[] | undefined>
    body: unknown
  },
  res: {
    status: (n: number) => { json: (v: unknown) => void }
    setHeader: (k: string, v: string) => void
  },
) {
  res.setHeader('Cache-Control', 'no-store')
  const origin = req.headers.origin,
    host = req.headers.host
  if (origin && origin !== `https://${host}` && origin !== `http://${host}`)
    return res.status(403).json({ error: 'Origin rejected' })
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'POST required' })
  try {
    if (JSON.stringify(req.body).length > 4096)
      return res.status(413).json({ error: 'Too large' })
    const result = gradeAssessment(
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body,
    )
    return res.status(result.valid ? 200 : 400).json(result)
  } catch {
    return res.status(400).json({ valid: false, correct: false })
  }
}
