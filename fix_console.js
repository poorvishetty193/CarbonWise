const fs = require('fs');

const files = [
  'D:/CarbonWise/hooks/useActivityLog.ts',
  'D:/CarbonWise/hooks/useCarbonPulse.ts',
  'D:/CarbonWise/hooks/useLeaderboard.ts',
  'D:/CarbonWise/hooks/useLeaderboardRealtime.ts',
  'D:/CarbonWise/hooks/useUserStreak.ts',
  'D:/CarbonWise/lib/logout.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Add import if not present
  if (!content.includes('toErrorMessage')) {
    content = `import { toErrorMessage } from '../lib/errors';\n` + content;
    changed = true;
  }

  // Replace console.error(err) -> console.error(toErrorMessage(err))
  // Replace console.error("...", error) -> console.error("...", toErrorMessage(error))
  const regex = /console\.error\(([^,]+),\s*(err|error)\)/g;
  if (regex.test(content)) {
    content = content.replace(regex, 'console.error($1, toErrorMessage($2))');
    changed = true;
  }
  
  const regex2 = /console\.error\((err|error)\)/g;
  if (regex2.test(content)) {
    content = content.replace(regex2, 'console.error(toErrorMessage($1))');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
