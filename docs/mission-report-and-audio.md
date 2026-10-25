# Mission reports, uploads and narration

## Changes

- Narration primes available voices on mount without autoplay, prefers a local Indonesian voice when available, queues speech in the click handler without waiting for a voice event, and no longer cancels an empty engine on start. “Menyiapkan audio…” lasts until the actual `onstart` callback. Rate options are 0.8, 1, 1.5 and 2; restart is limited to the current short chunk, not the whole manuscript. A startup watchdog and existing cancellation guards remain.
- Uploads inspect PNG/JPEG/WebP signatures rather than trusting gallery MIME metadata. `createImageBitmap` has an HTML image-decoder fallback; content, size and decoded dimensions are validated. Evidence remains profile/mission-scoped in IndexedDB.
- Mobile observation tables stack each record and label without duplicate controls, horizontal scrolling, or altered values. Noninteractive headings retain programmatic focus without a button-like outline. Interactive keyboard focus styling remains intact.
- Reflections have a separate choice check before the written explanation. Correct choice checks alone do not complete the mission or award XP. Final report submission completes/supports the mission; unchanged checked wrong choices are not counted again. Four valid wrong checks still allow support.
- Immutable report snapshots contain the full prediction/observations/reflection plus a separate evidence Blob snapshot. Editing fields/evidence marks the saved report stale. PDF export uses only the saved report and screenshot, not the draft being edited. It includes local consistency checks, honest AI availability, Unicode Noto Sans (SIL OFL), page numbers and image pagination. The PDF engine is loaded only on download.
- Duplicate Piko wrong-answer panels are consolidated without revealing the key. Welcome emoji and the shared footer match the requested copy.

## AI activation limitation

Production `/api/ai` reports `enabled: false`. No OpenAI/Redis/Turnstile credentials were found in the local environment; `.env.local` has only a Vercel OIDC token, not an AI provider key. A read-only `vercel project inspect voltquest --scope ayaas-projects-028704c4` returned “The specified scope does not exist” for the CLI account currently available. No different workspace was used and no credentials were printed.

Activation requires authorized access to the existing Vercel project and the production variables listed in `.env.example`: OpenAI key/model, Redis shared quota credentials, Turnstile keys, allowed origin, explicit daily/hourly caps, rate salt, and the enable flag. Enter secrets in Vercel Settings → Environment Variables, never in chat or frontend code. No billing/subscription was created or changed. Do not enable until the full protection configuration is present and a real end-to-end request succeeds.

A strict `mission-review` contract and per-mission context now share the existing consent, origin, Turnstile proof, atomic Redis quota, provider timeout, and output validation. It sends text/data only, not image contents or profile identity. Numerical feedback is calculated locally; generated prose cannot add numeric corrections. Schema/security tests use a stub provider and are not evidence that production AI is active. The UI and PDF explicitly disclose when semantic/image review is unavailable.

## Validation limits

Browser checks use Chrome on Windows and Playwright mobile emulation, not a physical Android handset. The upload test uses a real screenshot captured from the public PhET application plus empty-MIME and missing-bitmap-decoder cases. Narration tests measure click-to-queue using a mocked speech engine and exercise start/error/pause/resume callbacks; they do not measure audible startup latency or pronunciation on physical devices. Device voice startup and network voices can still vary.

Generated multi-page PDFs are reopened and text-checked for Ω, ρ, Σ, saved-snapshot content and embedded image count, then rendered through Poppler for visual inspection. No teacher-facing PDF is fabricated from unsent answers or from another profile.

References: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/start_event and https://pdf-lib.js.org/docs/api/classes/pdfdocument.
