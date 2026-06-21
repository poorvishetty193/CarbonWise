const fs = require('fs');
const path = require('path');

const testDir = 'D:/CarbonWise/hooks/__tests__';
const files = fs.readdirSync(testDir).map(f => path.join(testDir, f));

files.forEach(file => {
  if (!file.endsWith('.test.ts') && !file.endsWith('.test.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Replace jest. with vi.
  if (content.includes('jest.')) {
    content = content.replace(/jest\./g, 'vi.');
    changed = true;
  }

  // Add vi import if not present
  if (content.includes('vi.') && !content.includes('import { vi }')) {
    content = "import { vi } from 'vitest';\n" + content;
    changed = true;
  }

  // Add firebase mocks if not present
  if (!content.includes("vi.mock('@/lib/firebase/client'") && !content.includes("vi.mock('../../lib/firebase/client'")) {
    content = "vi.mock('../../lib/firebase/client', () => ({ auth: {}, db: {} }));\n" + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed test file:', file);
  }
});
