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
