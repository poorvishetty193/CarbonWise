const fs = require('fs');
const files = [
  'd:/CarbonWise/lib/firebase/client.ts',
  'd:/CarbonWise/lib/analytics.ts',
  'd:/CarbonWise/components/layout/Shell.tsx',
  'd:/CarbonWise/components/insights/InsightsClient.tsx',
  'd:/CarbonWise/app/api/login/route.ts',
  'd:/CarbonWise/app/api/analytics/route.ts',
  'd:/CarbonWise/app/api/carbon-score/route.ts',
  'd:/CarbonWise/app/actions/user.ts',
  'd:/CarbonWise/app/actions/activity.ts',
  'd:/CarbonWise/app/(dashboard)/layout.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (content.includes('catch (error: unknown)')) {
    if (!content.includes('toErrorMessage')) {
      // Find the last import line
      const lines = content.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) lastImportIdx = i;
      }
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, "import { toErrorMessage } from '@/lib/errors';");
        content = lines.join('\n');
      }
    }

    content = content.replace(/catch\s*\(\s*error:\s*unknown\s*\)\s*\{([\s\S]*?)console\.error\(\s*(['"`].*?['"`])\s*,\s*error\s*\);/g, 
      'catch (error: unknown) {$1console.error($2, toErrorMessage(error));');

    content = content.replace(/catch\s*\(\s*error:\s*unknown\s*\)\s*\{([\s\S]*?)console\.error\(\s*error\s*\);/g, 
      'catch (error: unknown) {$1console.error(toErrorMessage(error));');

    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Modified ' + file);
    }
  }
});
