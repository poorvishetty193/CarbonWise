const fs = require('fs');

const files = [
  'D:/CarbonWise/hooks/__tests__/useCarbonPulse.test.ts',
  'D:/CarbonWise/hooks/__tests__/useLeaderboardRealtime.test.ts',
  'D:/CarbonWise/hooks/__tests__/useStreamingInsights.test.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/vi\.Mock/g, 'any');
  content = content.replace(/vi\.SpyInstance/g, 'any');
  fs.writeFileSync(file, content);
}
