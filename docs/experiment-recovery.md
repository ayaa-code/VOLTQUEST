# Discovery Lab: recovery and guide order

Verified 25 October 2026 against the actual embedded public URL:
https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html

The public simulation presents Intro and Lab. Intro describes building circuits and measuring voltage/current; Lab describes additional components and advanced options. Its PhET menu lists Website, Report a Problem, Check for Updates, Screenshot, Full Screen, and About; no save/load circuit entry was present. Recommended screens are stored per mission: Intro for components and series/parallel; Lab for Ohm, power/energy, and the school circuit. Students select the tab manually.

The official PhET-iO developer guide documents JSON simulation states and engine state/screenshot APIs, requiring PhET-iO development credentials/license. Those are not presumed available in this public iframe or this project:
https://phet-io.colorado.edu/devguide/

No supported public state-restoration integration was verified. VoltQuest therefore does not claim to restore circuit arrangements after browser refresh. No private APIs, cross-origin DOM access, paid services, or cloud databases were added.

## Implemented

- LocalStorage drafts are written synchronously on each change, merged with the latest other profile/mission records. Restored drafts report saved status; storage errors retain the in-memory input and offer retry. Invalid/unsupported stores are not overwritten.
- A timestamp in the existing per-mission draft identifies the last activity. The dashboard's resume action reads only the current profile and applies shared mission access checks. Opening the app still starts at the dashboard. Invalid saved steps fall back to required inputs through existing validation.
- DOM order is guide → one persistent simulation → observation controls/table. The same iframe stays mounted across the mission's steps, including temporary hidden states; leaving the mission removes it. Network changes do not reload it. Explicit reload requires confirmation and does not affect VoltQuest answers.
- Manual screenshot evidence is stored as a Blob in IndexedDB by profile and mission. File type, decoded image, 6 MB size and 24 MP resolution limits are checked. Preview, replace/delete, failed-write retry and object-URL cleanup are included. Screenshots do not reconstruct the circuit and are not learning prerequisites.
- Simulation loading failure remains cross-origin-limited: iframe load events cannot prove successful execution. The manual retry action is always available after opening, with a delayed connection notice. Offline PhET operation is not promised.
- No answer submission, XP reward or wrong-attempt increment occurs during recovery. Existing content, grading, account and progression rules remain unchanged.

Browser storage is device/origin-specific and can be cleared by the user/browser. This is not account cloud sync. A refresh can still restart the PhET circuit itself; saved notes and screenshots provide recovery of the student's recorded work.
