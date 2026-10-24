import type { IncomingMessage, ServerResponse } from 'node:http'
import { enabled, processAI } from '../server/ai.ts'
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  const send = (status: number, body: unknown) => {
    res.statusCode = status
    res.end(JSON.stringify(body))
  }
  if (req.method === 'GET')
    return send(200, {
      enabled: enabled(process.env),
      ...(enabled(process.env)
        ? { siteKey: process.env.TURNSTILE_SITE_KEY }
        : {}),
    })
  if (req.method !== 'POST')
    return send(405, { error: 'Metode tidak diizinkan.' })
  if (!enabled(process.env))
    return send(503, { error: 'Asisten AI belum diaktifkan.' })
  if (!req.headers['content-type']?.startsWith('application/json'))
    return send(415, { error: 'Gunakan JSON.' })
  if (Number(req.headers['content-length'] ?? 0) > 85000)
    return send(413, { error: 'Permintaan terlalu besar.' })
  let body = req.body
  try {
    if (body === undefined) {
      let raw = ''
      let size = 0
      for await (const chunk of req) {
        size += Buffer.byteLength(chunk)
        if (size > 85000)
          return send(413, { error: 'Permintaan terlalu besar.' })
        raw += chunk.toString()
      }
      body = JSON.parse(raw)
    } else if (typeof body === 'string') body = JSON.parse(body)
    if (Buffer.byteLength(JSON.stringify(body)) > 85000)
      return send(413, { error: 'Permintaan terlalu besar.' })
  } catch {
    return send(400, { error: 'JSON tidak valid.' })
  }
  // Only Vercel's trusted proxy header is used; browser profile IDs are never identities.
  const ip = String(req.headers['x-vercel-forwarded-for'] ?? 'unknown')
    .split(',')[0]
    .trim()
  const result = await processAI(body, req.headers.origin, ip, process.env)
  if (result.status === 429) res.setHeader('Retry-After', '3600')
  return send(result.status, result.body)
}
