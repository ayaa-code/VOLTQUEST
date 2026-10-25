# Learning journey and progress navigation

The shared journey now uses materials 1–3 → required PhET missions 1 (Components) and 3 (Ohm) → Piko checkpoint → materials 4–6 → Energy Control Room checkpoint → summative. PhET mission 2 is reinforcement after material 4, while missions 4 and 5 open after material 6. This placement was explicitly chosen to avoid assessing concepts before the corresponding materials. Mission text and the existing prediction, simulation, observation and reflection components are retained. Heading-only LKPD stays ungraded.

Desktop and mobile Progres render the same DynamicLearning progress component and store. The percentage counts 11 required journey units (six materials, two PhET missions, two checkpoints, one summative); the mission summary also lists all five missions, including optional reinforcement.

`questions` is an additive optional field in the existing per-profile local store. Each stable `phet:n`, `piko:n`, or `energy:n` record contains wrong count, status, last submitted answer and timestamp. Four valid wrong submissions permit an explicit reinforcement action; it never marks an answer correct or grants XP. Duplicate identical submissions within 900 ms are ignored. Browser controls also block concurrent submissions. Invalid submissions, unavailable grading and obstacle collisions do not count. Previously correct answers never regress; supported answers can later become correct.

Existing completed legacy missions are imported by their original IDs without deleting old records or inventing mistakes. Existing completed formative groups and submitted summative assessments retain access. Student and demo identities remain isolated.

Active question grading is handled by `/api/assessment`. Key arrays and numerical expected answers are in server/assessment.ts, not the active question data. Wrong/invalid responses contain no answer explanation. No provider or AI key is needed for deterministic grading. Vite has a development-only equivalent middleware. Material AI and worksheet protections are unchanged; no active quiz answer keys are supplied to AI.

Tests: journey-update.spec.ts covers navigation widths, student flow, per-question threshold, reload and feedback content; server/assessment.test.ts covers valid/invalid grading and omission of wrong-answer explanations. Local storage remains a local prototype data boundary, not tamper-resistant authentication or certification.
