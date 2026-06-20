/**
 * deploy-rules.mjs
 * Deploys firestore.rules using the Firebase REST API + service account JWT.
 * Run: node scripts/deploy-rules.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSign, createPrivateKey } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ── Load env ──────────────────────────────────────────────────────────────────
const envRaw = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const PROJECT_ID   = env['FIREBASE_PROJECT_ID'];
const CLIENT_EMAIL = env['FIREBASE_CLIENT_EMAIL'];
// Strip surrounding quotes if the key was stored with them, then unescape newlines
const rawKey = (env['FIREBASE_PRIVATE_KEY'] || '').replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
const PRIVATE_KEY  = createPrivateKey({ key: rawKey, format: 'pem' });

if (!PROJECT_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.error('❌  Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local');
  process.exit(1);
}

// ── Mint a short-lived Google OAuth2 access token via JWT ─────────────────────
function base64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function mintJwt() {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const sig = base64url(sign.sign(PRIVATE_KEY));
  return `${header}.${payload}.${sig}`;
}

async function getAccessToken() {
  const jwt = mintJwt();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error('❌  Failed to get access token:', data);
    process.exit(1);
  }
  return data.access_token;
}

// ── Deploy rules ──────────────────────────────────────────────────────────────
async function deployRules() {
  console.log(`🔐  Minting service-account access token for ${CLIENT_EMAIL}…`);
  const token = await getAccessToken();
  console.log('✅  Token acquired.');

  const rulesSource = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');

  // Step 1: Create a new ruleset
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          files: [{ name: 'firestore.rules', content: rulesSource }],
        },
      }),
    }
  );

  const ruleset = await createRes.json();
  if (!ruleset.name) {
    console.error('❌  Failed to create ruleset:', JSON.stringify(ruleset, null, 2));
    process.exit(1);
  }
  console.log(`📋  Ruleset created: ${ruleset.name}`);

  // Step 2: Release the ruleset to the Firestore service
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        release: {
          name: `projects/${PROJECT_ID}/releases/cloud.firestore`,
          rulesetName: ruleset.name,
        },
      }),
    }
  );

  const release = await releaseRes.json();
  if (release.name) {
    console.log(`🚀  Rules deployed successfully! Release: ${release.name}`);
    await deployIndex(token);
  } else {
    console.error('❌  Failed to release ruleset:', JSON.stringify(release, null, 2));
    process.exit(1);
  }
}

// ── Deploy Composite Index ────────────────────────────────────────────────────
async function deployIndex(token) {
  console.log('\n📐  Ensuring composite index (uid ASC + loggedAt DESC) on activities…');

  // Check for existing indexes first
  const listRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/activities/indexes`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const list = await listRes.json();
  const existing = (list.indexes || []).find(idx => {
    const fields = idx.fields || [];
    return (
      fields.length === 2 &&
      fields.some(f => f.fieldPath === 'uid'      && f.order === 'ASCENDING') &&
      fields.some(f => f.fieldPath === 'loggedAt' && f.order === 'DESCENDING')
    );
  });

  if (existing) {
    console.log(`✅  Index already exists (state: ${existing.state}). Nothing to do.`);
    return;
  }

  const createRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/activities/indexes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queryScope: 'COLLECTION',
        fields: [
          { fieldPath: 'uid',      order: 'ASCENDING' },
          { fieldPath: 'loggedAt', order: 'DESCENDING' },
        ],
      }),
    }
  );

  const op = await createRes.json();
  if (op.name) {
    console.log(`🔨  Index creation started: ${op.name}`);
    console.log('   (Firestore will build it in the background — usually takes 1-2 minutes)');
  } else {
    console.error('❌  Failed to create index:', JSON.stringify(op, null, 2));
  }
}

deployRules().catch(err => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
