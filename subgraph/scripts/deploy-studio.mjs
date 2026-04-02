import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(currentDir, '..', '..');

for (const envPath of [resolve(workspaceRoot, '.env'), resolve(workspaceRoot, '.env.local')]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const studioSlug = process.env.SUBGRAPH_STUDIO_SLUG;
const deployKey = process.env.SUBGRAPH_DEPLOY_KEY;
const versionLabel = process.env.SUBGRAPH_VERSION_LABEL || '0.1.0';

if (!studioSlug) {
  console.error('[subgraph] Missing SUBGRAPH_STUDIO_SLUG.');
  process.exit(1);
}

if (!deployKey) {
  console.error('[subgraph] Missing SUBGRAPH_DEPLOY_KEY.');
  process.exit(1);
}

const result = spawnSync(
  'npx',
  [
    'graph',
    'deploy',
    studioSlug,
    '--node',
    'https://api.studio.thegraph.com/deploy/',
    '--deploy-key',
    deployKey,
    '--version-label',
    versionLabel,
  ],
  {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`[subgraph] Studio deploy submitted for ${studioSlug} (${versionLabel}).`);