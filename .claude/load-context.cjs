const fs = require('fs');
const path = require('path');

try {
  const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const content = fs.readFileSync(path.join(dir, 'CONTEXT.md'), 'utf8');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: content,
    },
  }));
} catch {
  process.stdout.write('{}');
}
