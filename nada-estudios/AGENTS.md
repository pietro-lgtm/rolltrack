# NADA Estudios — agent rules

## This is NOT the Next.js you know
Next.js 16 has breaking changes — APIs, conventions, and file structure may differ
from your training data. Read the relevant guide in `node_modules/next/dist/docs/`
before writing any code. Notably: route params and searchParams are **Promises**
(`await params`), and dynamic APIs (`cookies()`, `headers()`) are async.

## Ground rules for build agents
- Read `BUILD_BRIEF.md` in this directory first. It is the source of truth for
  brand, architecture, content model, and your scope.
- **Never edit** these shared files (owned by the orchestrator):
  `src/app/layout.tsx`, `src/app/globals.css`, `src/config/site.ts`,
  `src/lib/store.ts`, `src/lib/auth.ts`, `src/lib/content.ts`,
  `src/data/services.ts`, `src/components/site/*`, `package.json`, `next.config.ts`.
  Import from them freely.
- **Never run** `npm install` or add dependencies. Everything you need is installed.
- Stay inside the routes/files assigned to you in your prompt.
- Spanish is the site language (voseo costarricense: "querés", "tenés"). Keep copy
  tight and confident — no filler.
- Design: follow the tokens/utilities in `globals.css`. Black ink on white paper,
  mono labels, hard 2px borders, yellow accent. No gradients, no rounded-xl cards,
  no glassmorphism, no purple. When in doubt, look at how existing pages do it.
- Verify your work compiles: run `npx tsc --noEmit` scoped mentally to your files —
  or at least re-read your code for Next 16 correctness. Do NOT run `npm run build`
  (it fights other agents working in parallel).
