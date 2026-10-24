# Two formative checkpoints

Learning order: materials 1–3 → Piko checkpoint 1 → materials 4–6 → Energy Control Room checkpoint 2 → PhET worksheet → summative.

The existing `voltquest.dynamic-electricity.v1` storage retains all legacy quiz and game records. New answers use optional per-profile `checkpoints` records, with solved mission IDs, submitted answers, attempts and explicit completion. Partial legacy Piko answers do not count toward the new questions. A legacy group of three completed quizzes grants its corresponding checkpoint through the shared access function; partial groups do not. Completed worksheets and submitted summative assessments stay accessible.

Piko remains a keyboard/touch platformer with one question each for charge, ohmic classification and resistivity geometry. Energy Control Room has three keyboard-accessible forms with circuit diagrams, current direction selection and household energy calculation. Answer validation is deterministic and never depends on AI. Completion writes must succeed before the next stage unlocks. Neither game changes XP.

Regression coverage: `tests/checkpoints.spec.ts` covers prerequisite gates, legacy completion, numeric formats, actual Piko traversal, wrong-answer revision, reload persistence and the energy room at five viewport widths. Screenshots are generated under ignored `tmp/checkpoint-*.png`.
