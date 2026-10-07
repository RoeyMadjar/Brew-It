# Brew It — instructions for Claude

Read `md-files/HANDOFF.md` at the start of every session. It is the source
of truth for project state, architecture and decisions.

## Workflow
1. Explain the plan in simple language, then wait for my approval.
2. Small, focused changes. No unrelated refactors, features or libraries.
3. After changes: run `npm run lint` and `npm run build` and say you did not
   test in a browser. Give manual test steps only when the change needs
   them: none or a few for small changes, more for big ones.
4. Never commit. I test and commit (one commit per feature).

## How to answer
- Be brief and focused. Start with the answer or plan: no intro, no
  restating my request, no closing summary.
- Plans: numbered steps, one line each, naming the files that change.
- Explain a React/JS idea only when it's new in this project, in 1–3
  sentences, including why. Don't re-explain what was already covered.
- Separate "how it works" from "design choice" when both matter.
- No big code blocks; show only the lines that matter.
- Never drop important information: risks, trade-offs, edge cases and
  decisions I need to make each get one clear line.
- After changes: files changed (one line each), lint/build result, and
  test steps (if needed) as a short checklist.

## Docs
- Update HANDOFF.md only when I ask.
- Don't edit this file unless I ask.
