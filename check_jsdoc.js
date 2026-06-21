const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDirs = ['components', 'hooks', 'lib'];
const missingDocs = [];

targetDirs.forEach(dir => {
  const fullPath = path.join('D:\\CarbonWise', dir);
  if (!fs.existsSync(fullPath)) return;
  walkDir(fullPath, (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/^export (const|function|class) /) || line.match(/^export default (function|class)/)) {
        // Check if there is a doc comment right above
        let hasDoc = false;
        let j = i - 1;
        while (j >= 0 && lines[j].trim() === '') j--;
        if (j >= 0 && lines[j].trim() === '*/') {
          hasDoc = true;
        }
        if (!hasDoc) {
          missingDocs.push(`${filePath}:${i + 1} - ${line.trim()}`);
        } else {
          // Check if it has @returns and @throws
          let k = j;
          while (k >= 0 && !lines[k].includes('/**')) k--;
          const docBlock = lines.slice(k, j + 1).join('\n');
          let missingTags = [];
          if (!docBlock.includes('@returns')) missingTags.push('@returns');
          if (!docBlock.includes('@throws')) missingTags.push('@throws');
          if (line.includes('Props') || line.includes('uid')) {
            if (!docBlock.includes('@param')) missingTags.push('@param');
          }
          if (missingTags.length > 0) {
            missingDocs.push(`${filePath}:${i + 1} - ${line.trim()} (Missing: ${missingTags.join(', ')})`);
          }
        }
      }
    }
  });
});

console.log(missingDocs.join('\n'));
