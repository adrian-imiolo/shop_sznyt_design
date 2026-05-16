---
description: Run the full pre-deploy gauntlet — lint, typecheck, build (frontend + backend). Fails loudly on any issue.
---

Run all pre-deploy checks for sznytdesign. I want a clean green across everything before pushing to main.

Execute in this order — stop on the first failure, don't run later steps:

1. **Frontend lint**: `npm run lint`
2. **Frontend typecheck**: `npx tsc -b --noEmit`
3. **Frontend build**: `npm run build`
4. **Backend dependencies**: `cd backend && npm install --dry-run` (confirms package.json is sane)
5. **Backend startup smoke test**: verify `backend/index.js` parses without syntax errors — `node --check backend/index.js` if it's plain JS, or `npx tsx --check backend/index.js`

If any step fails:
- Show the exact error output
- Identify the file and line
- Propose a fix (don't apply it unless I ask)

If everything passes, output: "✅ All deploy checks green. Safe to push."

Keep output concise — don't narrate every step, just run them and report the result.
