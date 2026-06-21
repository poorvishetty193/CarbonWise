const fs = require('fs');

let content = fs.readFileSync('D:/CarbonWise/lib/constants.ts', 'utf-8');

// Regex to remove the blocks
content = content.replace(/\/\*\*[\s\S]*?export const API_ENDPOINTS = \{[\s\S]*?\} as const;/g, '');
content = content.replace(/\/\*\*[\s\S]*?export const ANALYTICS_EVENTS = \{[\s\S]*?\} as const;/g, '');

// Clean up multiple empty lines
content = content.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync('D:/CarbonWise/lib/constants.ts', content);
