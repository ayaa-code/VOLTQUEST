import { z } from 'zod'
import { worksheetFields } from './challengeWorksheet.ts'
const text = z.string().min(1).max(1800)
const topic = z.number().int().min(1).max(6)
export const reviewSchema = z
  .object({
    summary: text,
    coverage: z.array(z.enum(['A', 'B', 'C', 'D', 'Kesimpulan'])).length(5),
    strengths: z.array(text).max(8),
    findings: z
      .array(
        z
          .object({
            field: z.enum(
              worksheetFields.map((f) => f.id) as [string, ...string[]],
            ),
            kind: z.enum([
              'konsistensi data',
              'konsep',
              'analisis',
              'kesimpulan',
              'informasi kurang',
            ]),
            explanation: text,
            suggestion: text,
            topicId: topic,
          })
          .strict(),
      )
      .max(16),
    limitations: text,
  })
  .strict()
export const chatOutputSchema = z
  .object({
    answer: z.string().min(1).max(6000),
    relatedTopicIds: z.array(topic).max(6),
  })
  .strict()
const fields = z
  .object(
    Object.fromEntries(
      worksheetFields.map((f) => [f.id, z.string().max(1200).optional()]),
    ),
  )
  .strict()
export const worksheetDataSchema = z
  .object({ visited: z.boolean(), fields })
  .strict()
const common = { consent: z.literal(true), token: z.string().min(1).max(2048) }
export const aiInputSchema = z.discriminatedUnion('task', [
  z
    .object({ ...common, task: z.literal('review'), data: worksheetDataSchema })
    .strict(),
  z
    .object({
      ...common,
      task: z.literal('chat'),
      topicId: topic,
      question: z.string().trim().min(1).max(1500),
      history: z
        .array(
          z
            .object({
              role: z.enum(['user', 'assistant']),
              text: z.string().max(6000),
            })
            .strict(),
        )
        .max(6),
      data: worksheetDataSchema.optional(),
    })
    .strict(),
])
