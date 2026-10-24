# Local presentation profile

Sign in with username `admin` and password `admin`. Authentication maps this reserved credential pair to `demo:admin`; a student display name never grants this identity. This is a public local presentation profile, not server administration.

The shared `learningAccess` function accepts the current profile identity. Demo bypasses stage prerequisites only; material completion, mission answers, worksheet checks, summative answers and XP are not fabricated. Game mission sequencing and worksheet completion validation remain enforced. The AI endpoint and its protection are unchanged.

New demo progress is stored under its own key in the existing per-profile learning store. Legacy accounts and student progress are retained. Logout clears the active profile using the existing flow; reauthentication resumes the same demo progress. Login has no published credential hint or shortcut button.

Tests: `tests/admin-demo.spec.ts` exercises wrong passwords, all-stage access from empty progress, wrong-answer feedback, isolated persistence, student gates after logout and re-login. Existing registration, recovery, normal login and checkpoint tests remain regression coverage.
