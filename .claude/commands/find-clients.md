---
description: Find and score NADA ESTUDIOS SMB leads (e.g. /find-clients restaurants Escazú 30)
argument-hint: [vertical] [zone] [count]
---

Use the `nada-client-finder` agent to build a lead list for NADA ESTUDIOS.

Request: $ARGUMENTS

If the request is empty, default to restaurants in Escazú, Santa Ana and
Curridabat, 25 qualified leads. When the agent finishes, show me its summary
and the path to the CSV it wrote.

If the summary includes an Apollo enrichment shortlist, ask me whether to
enrich it. State the exact number of credits first, and spend nothing until
I approve (approval given once covers the whole shortlist). If I approve, enrich those companies and people with Apollo and
fill `email`, `whatsapp_or_phone` and `decision_maker` in the same CSV.

Rewrite the CSV with Python's `csv` module only, loading every row first.
Never open the file for writing until the new rows have been built and checked.
