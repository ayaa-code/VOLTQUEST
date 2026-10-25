# Discovery Lab refresh

- Mission IDs remain 1, 3, 2, 4, 5; presentation numbers follow that order. Completion/support of the preceding mission and relevant materials are both required. Demo identity and historical completion access remain supported.
- Removed only the separate worksheet UI, leaving its storage and schema intact. The existing experiment workflow remains inside each mission.
- Six lesson summaries cover key concepts as bullet points; the resistivity video is now dLDgOag5qcc. The other lesson media are unchanged.
- Experiment drafts include a separate free prediction, first-prediction snapshot, and local reflection review per profile/mission. Historical “Belum yakin” remains readable but is not a valid active prediction.
- Choice grading remains server-side. Local review flags clearly insufficient explanations, never certifies semantic correctness or measures understanding as a percentage. Correct choices with insufficient explanations receive support status and no new XP. Written revisions of an unchanged wrong choice do not increment the choice error count.
- Production `/api/ai` returned `enabled: false` during verification on 25 October 2026. The new review explicitly identifies itself as local and says semantic assessment is unavailable. No paid provider or new external AI request was enabled. A future semantic-review integration must use the existing server consent, rate-limit, and output validation protections; the current chat/worksheet API is not silently repurposed.
- Changing answer, explanation, observation, or comparison marks the saved review stale. The local review does not read the PhET simulation state.
- Footer: VoltQuest • Belajar • Eksperimen • Nyalakan Ide.
