# Authoring the replacement worksheet

The dashboard Challenge action opens the experiment page directly. Existing prerequisite checks remain in place for students; admin demo may open it immediately.

`src/data/worksheetTemplate.ts` enables a temporary heading-only template for sections A–D and the conclusion/evidence section. There are no student questions, tables or answer fields in these placeholder sections. The original field schema and renderer remain in source for reference when the author's replacement content is ready. No stored student answers are deleted or reset.

PhET, draft saving, archived notes, revision history and material chat remain available. Worksheet AI review and completion are disabled while the template is empty; completing an empty worksheet must never unlock summative. Previously completed profiles retain their completion. Before turning template mode off, replace the schema, validation, review contract and related tests to match the author's new questions and tables.
