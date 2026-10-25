import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { gradeAssessment } from './server/assessment.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-assessment',
      configureServer(server) {
        server.middlewares.use('/api/assessment', (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end()
            return
          }
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
            if (body.length > 4096) req.destroy()
          })
          req.on('end', () => {
            try {
              const result = gradeAssessment(JSON.parse(body))
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Cache-Control', 'no-store')
              res.statusCode = result.valid ? 200 : 400
              res.end(JSON.stringify(result))
            } catch {
              res.statusCode = 400
              res.end('{}')
            }
          })
        })
      },
    },
  ],
})
