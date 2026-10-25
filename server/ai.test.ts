import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enabled, processAI, requiredConfig, type Dependencies } from './ai.ts'
const env = Object.fromEntries(requiredConfig.map((key) => [key, 'configured']))
Object.assign(env, {
  VOLTQUEST_AI_ENABLED: 'true',
  VOLTQUEST_ALLOWED_ORIGIN: 'https://voltquest-jet.vercel.app',
  VOLTQUEST_AI_IP_HOURLY: '5',
  VOLTQUEST_AI_DAILY_REQUESTS: '20',
  VOLTQUEST_AI_DAILY_TOKENS: '100000',
})
const body = {
  task: 'chat',
  consent: true,
  token: 'verified',
  topicId: 1,
  question: 'Mengapa arus mengalir?',
  history: [],
}
const dependencies: Dependencies = {
  verify: async () => true,
  reserve: async () => true,
  generate: async () => ({
    answer: 'Mari tinjau jalur tertutup dan beda potensial.',
    relatedTopicIds: [1],
  }),
}

test('mission review keeps consent, proof, schema and numerical-feedback gates', async () => {
  const input = {
    task: 'mission-review',
    consent: true,
    token: 'verified',
    missionId: 1,
    snapshot: {
      prediction: 'Prediksi lain',
      predictionText: 'Lampu berubah',
      predictionReason: 'Saya mengamati sakelar',
      initialPrediction: null,
      observations: { open: 'Padam', closed: 'Menyala' },
      comparison: 'Keadaan berubah',
      answer: 1,
      reflectionReason: 'Saya membandingkan dua keadaan lampu.',
    },
  }
  const deps: Dependencies = {
    ...dependencies,
    generate: async () => ({
      strengths: ['Catatan dua kondisi tersedia.'],
      findings: [
        {
          explanation: 'Hubungan bukti perlu diperjelas.',
          suggestion: 'Rujuk keadaan sebelum dan sesudah perubahan.',
          topicId: 1,
        },
      ],
      limitations:
        'Hanya meninjau catatan tertulis, bukan aktivitas atau gambar PhET.',
    }),
  }
  assert.equal(
    (await processAI(input, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, deps))
      .status,
    200,
  )
  assert.equal(
    (
      await processAI(
        { ...input, consent: false },
        env.VOLTQUEST_ALLOWED_ORIGIN,
        'ip',
        env,
        deps,
      )
    ).status,
    400,
  )
  assert.equal(
    (
      await processAI(input, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...deps,
        verify: async () => false,
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await processAI(input, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...deps,
        reserve: async () => false,
      })
    ).status,
    429,
  )
  assert.equal(
    (
      await processAI(input, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...deps,
        generate: async () => ({
          strengths: ['Jawabannya 42'],
          findings: [],
          limitations: 'Tidak diamati.',
        }),
      })
    ).status,
    502,
  )
})
test('configuration fails closed', async () => {
  assert.equal(enabled({}), false)
  assert.equal(
    (
      await processAI(
        body,
        env.VOLTQUEST_ALLOWED_ORIGIN,
        'ip',
        {},
        dependencies,
      )
    ).status,
    503,
  )
})
test('origin, consent, schema, challenge proof and shared quota gate provider calls', async () => {
  assert.equal(
    (await processAI(body, 'https://attacker.test', 'ip', env, dependencies))
      .status,
    403,
  )
  assert.equal(
    (
      await processAI(
        { ...body, consent: false },
        env.VOLTQUEST_ALLOWED_ORIGIN,
        'ip',
        env,
        dependencies,
      )
    ).status,
    400,
  )
  assert.equal(
    (
      await processAI(body, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...dependencies,
        verify: async () => false,
      })
    ).status,
    403,
  )
  assert.equal(
    (
      await processAI(body, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...dependencies,
        reserve: async () => false,
        generate: async () => {
          throw Error('must not call')
        },
      })
    ).status,
    429,
  )
})
test('valid output, invalid output and unavailable provider are distinguished', async () => {
  assert.equal(
    (
      await processAI(
        body,
        env.VOLTQUEST_ALLOWED_ORIGIN,
        'ip',
        env,
        dependencies,
      )
    ).status,
    200,
  )
  assert.equal(
    (
      await processAI(body, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...dependencies,
        generate: async () => ({ answer: 'bad', secret: 'bad' }),
      })
    ).status,
    502,
  )
  assert.equal(
    (
      await processAI(body, env.VOLTQUEST_ALLOWED_ORIGIN, 'ip', env, {
        ...dependencies,
        generate: async () => {
          throw Error('secret must not be exposed')
        },
      })
    ).status,
    503,
  )
})
