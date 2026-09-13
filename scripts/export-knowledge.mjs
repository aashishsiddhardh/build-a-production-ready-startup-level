// Generates backend/app/data/knowledge.json from the frontend TypeScript data,
// so the reference FastAPI backend stays in lock-step with the client KB.
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();

const result = await build({
  stdin: {
    contents: `
      export { HERBS } from './src/data/herbs.ts';
      export { CONCERNS } from './src/data/conditions.ts';
      export { DOSHA_META } from './src/data/doshas.ts';
      export { LIFESTYLE_LIBRARY, UNIVERSAL_GUIDANCE } from './src/data/lifestyle.ts';
    `,
    resolveDir: cwd,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  alias: { '@': path.resolve(cwd, 'src') },
});

const code = result.outputFiles[0].text;
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
const mod = await import(dataUrl);

const payload = {
  herbs: mod.HERBS,
  concerns: mod.CONCERNS,
  doshaMeta: mod.DOSHA_META,
  lifestyle: mod.LIFESTYLE_LIBRARY,
  universalGuidance: mod.UNIVERSAL_GUIDANCE,
};

const outDir = path.join(cwd, 'backend', 'app', 'data');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'knowledge.json'), JSON.stringify(payload, null, 2));
console.log(
  `Wrote knowledge.json: ${payload.herbs.length} herbs, ${payload.concerns.length} concerns.`,
);
