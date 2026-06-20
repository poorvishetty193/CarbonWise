/**
 * check-indexes.mjs – lists all composite indexes on the activities collection
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSign, createPrivateKey } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const envRaw = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const PROJECT_ID   = env['FIREBASE_PROJECT_ID'];
const CLIENT_EMAIL = env['FIREBASE_CLIENT_EMAIL'];
const rawKey = (env['FIREBASE_PRIVATE_KEY'] || '').replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
const PRIVATE_KEY  = createPrivateKey({ key: rawKey, format: 'pem' });

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function mintJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  }));
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  return `${header}.${payload}.${base64url(sign.sign(PRIVATE_KEY))}`;
}

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: mintJwt() }),
});
const { access_token } = await tokenRes.json();

const res = await fetch(
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/activities/indexes`,
  { headers: { Authorization: `Bearer ${access_token}` } }
);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
