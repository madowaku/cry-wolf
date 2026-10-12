import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const html = await readFile(resolve(root, 'public/storybook/index.html'), 'utf8');
const source = html.match(/<script id="storybook-audio">([\s\S]*?)<\/script>/)?.[1];
if (!source) throw new Error('The verified storybook audio controller is missing.');
await mkdir(resolve(root, 'public/moon/assets/audio'), { recursive: true });
await writeFile(resolve(root, 'public/moon/audio.js'), '// Generated from the verified storybook controller by scripts/moon/sync-storybook-audio.mjs.\n(function(root){"use strict";\n' + source + '\nroot.CWAudio={tracks:MUSIC_TRACKS,createController:createMusicController};\n})(window);\n');
await copyFile(resolve(root, 'public/storybook/assets/audio/music-pack.js'), resolve(root, 'public/moon/assets/audio/music-pack.js'));
await copyFile(resolve(root, 'public/storybook/music-manifest.json'), resolve(root, 'public/moon/music-manifest.json'));
console.log('Moon: copied the verified player and 3 converted music tracks.');
