import { practiceConcepts, practiceExercises } from './practice'
import type { ConceptId } from './practice'

// Manual focus selection stays independent of confirmation-based recommendations.
// Confirmation evidence is separately validated by feedbackStorage.resolveRecommendation.
export function getPracticePlan(conceptId: ConceptId) {
  const concept = practiceConcepts.find((entry) => entry.id === conceptId)!
  return {
    source: 'student-choice' as const,
    reason: `Kamu memilih fokus ${concept.title}.`,
    exercises: practiceExercises.filter(
      (exercise) => exercise.conceptId === conceptId,
    ),
  }
}
