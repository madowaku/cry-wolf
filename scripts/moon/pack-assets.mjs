// Deterministic runtime conversion only: alpha retained, atlas cells extracted, no painted pixels retouched.
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(process.env.CW_SHARP_PATH || 'sharp');
const output = 'public/moon/assets';
await mkdir(output, { recursive: true });
const raw = 'assets/illustrations/moon/';
const manifest = { version: 9, date: '2026-10-12', provider: 'Codex built-in Imagegen', processing: 'Sharp: atlas-cell extraction and WebP resizing only; alpha preserved; no horizontal flips', assets: [] };
const hash = b => createHash('sha256').update(b).digest('hex');
async function record(id, source, pipeline, transparent) {
  const sourceBytes = await readFile(source);
  const target = `${output}/${id}.webp`;
  await pipeline.webp({ quality: 88, alphaQuality: 100 }).toFile(target);
  const meta = await sharp(target).metadata();
  if (transparent && !meta.hasAlpha) throw new Error(`Missing alpha: ${id}`);
  manifest.assets.push({ id, path: `assets/${id}.webp`, source, sourceSha256: hash(sourceBytes), sha256: hash(await readFile(target)), width: meta.width, height: meta.height, alpha: !!meta.hasAlpha });
}
for (const [file, id, size, transparent] of [
  ['environment-village-tower', 'village', 1440, false], ['environment-forest-spring', 'forest', 1440, false],
  ['environment-village-dawn', 'dawn', 1440, false],
  ['pip-child-v3', 'pip', 620, true], ['mayor-human-v2', 'mayor', 620, true],
  ['alarm-bell', 'bell-prop', 420, true], ['wolf-tracks', 'tracks', 360, true], ['moon-disc', 'moon', 512, true],
  ['moon-charm', 'charm', 480, true]
]) {
  const source = `${raw}${file}.png`;
  await record(id, source, sharp(source).resize({ width: size, withoutEnlargement: true }), transparent);
}
for (const [source, prefix, names] of [
  ['public/storybook/assets/bell-flat-expressions.png', 'bell', ['smile', 'think', 'shy', 'serious']],
  ['public/storybook/assets/luna-assertive-expressions.png', 'luna', ['smirk', 'challenge', 'guarded', 'wait']],
  [`${raw}bell-emotions.png`, 'bell', ['surprise', 'apology', 'relief', 'courage']],
  [`${raw}bell-reactions.png`, 'bell', ['worried', 'flustered', 'thinking', 'concern']],
  [`${raw}luna-emotions.png`, 'luna', ['surprise', 'worried', 'relief', 'laugh']],
  [`${raw}luna-pride.png`, 'luna', ['proud', 'tease', 'mischief', 'angry']],
  [`${raw}luna-heart.png`, 'luna', ['serious', 'sad', 'lonely', 'softened']]
]) {
  const { width, height } = await sharp(source).metadata();
  const w = Math.floor(width / 2), h = Math.floor(height / 2);
  for (let i = 0; i < names.length; i++) {
    await record(`${prefix}-${names[i]}`, source,
      sharp(source).extract({ left: (i % 2) * w, top: Math.floor(i / 2) * h, width: w, height: h }).resize({ height: 700, withoutEnlargement: true }), true);
  }
}
await writeFile('public/moon/asset-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Packed ${manifest.assets.length} assets; manifest contains source and runtime SHA-256.`);
