import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

interface Media {
  paused: boolean; volume: number; currentTime: number; loop: boolean;
  preload: string; play: () => Promise<void>; pause: () => void;
}
interface Controller {
  setPhase: (phase: string) => void; setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void; setSuspended: (hidden: boolean) => void;
  refresh: () => void; dispose: () => void;
  get: () => { target: string; status: string; volume: number; loaded: string[] };
}
const source = readFileSync('public/storybook/index.html', 'utf8').match(/<script id="storybook-audio">([\s\S]*?)<\/script>/)![1];
const { createMusicController, musicForPhase } = runInNewContext(`${source}\n({createMusicController,musicForPhase})`) as {
  createMusicController: (options: Record<string, unknown>) => Controller;
  musicForPhase: (phase: string) => string;
};
function harness(options: { missing?: boolean; error?: string; delayed?: boolean } = {}) {
  let time = 0, id = 0;
  const frames = new Map<number, () => void>();
  const media = new Map<string, Media>();
  const pending: (() => void)[] = [];
  const controller = createMusicController({
    sourceFor: (key: string) => options.missing ? '' : key,
    createAudio: (key: string) => {
      const node: Media = {
        paused: true, volume: 0, currentTime: 0, loop: false, preload: '',
        play() {
          node.paused = false;
          if (options.error) return Promise.reject({ name: options.error });
          if (options.delayed) return new Promise<void>(resolve => pending.push(resolve));
          return Promise.resolve();
        },
        pause() { node.paused = true; },
      };
      media.set(key, node); return node;
    },
    now: () => time,
    raf: (callback: () => void) => { frames.set(++id, callback); return id; },
    caf: (frame: number) => frames.delete(frame),
  });
  return {
    controller, media, pending,
    tick(ms = 500) { time += ms; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()); },
  };
}
// Promise assimilation crosses the VM realm; wait through the event loop, not a fixed microtask count.
const settle = () => new Promise<void>(resolve => setImmediate(resolve));

describe('storybook music player behavior', () => {
  it.each([
    ['title', 'opening'], ['intro', 'opening'], ['night', 'gameplay'],
    ['report', 'gameplay'], ['result', 'ending'],
  ])('%s uses the selected %s music', (phase, target) => expect(musicForPhase(phase)).toBe(target));

  it('starts silent and creates no media until the player enables sound', () => {
    const h = harness(); h.controller.setPhase('night'); h.tick();
    expect(h.media.size).toBe(0); expect(h.controller.get().status).toBe('muted');
    h.controller.setMuted(false); h.tick();
    expect(h.media.get('gameplay')?.volume).toBeCloseTo(.22);
    expect(h.media.get('gameplay')?.loop).toBe(true);
  });

  it('preserves playback time through pages, volume edits, and mute/unmute', () => {
    const h = harness(); h.controller.setMuted(false); h.tick();
    const node = h.media.get('opening')!; node.currentTime = 17;
    h.controller.setPhase('intro'); h.controller.setVolume(.35); h.tick();
    h.controller.setMuted(true); expect(node.paused).toBe(true);
    h.controller.setMuted(false); h.tick();
    expect(h.media.size).toBe(1); expect(node.currentTime).toBe(17);
    expect(node.volume).toBeCloseTo(.35);
  });

  it('crossfades, stops the previous role, and restarts it on a new playthrough', () => {
    const h = harness(); h.controller.setMuted(false); h.tick();
    h.media.get('opening')!.currentTime = 31;
    h.controller.setPhase('night'); h.tick(225);
    expect(h.media.get('opening')!.volume).toBeCloseTo(.11);
    expect(h.media.get('gameplay')!.volume).toBeCloseTo(.11);
    h.tick(225);
    expect(h.media.get('opening')!.paused).toBe(true);
    expect(h.media.get('opening')!.currentTime).toBe(0);
    h.controller.setPhase('result'); h.tick();
    h.controller.setPhase('title'); h.tick();
    expect([...h.media.values()].filter(node => !node.paused)).toHaveLength(1);
    expect(h.media.get('opening')!.paused).toBe(false);
  });

  it('keeps only the latest song after rapid scene transitions', async () => {
    const h = harness({ delayed: true }); h.controller.setMuted(false);
    h.controller.setPhase('night'); h.controller.setPhase('result'); h.tick();
    h.pending.forEach(resolve => resolve()); await settle();
    expect(h.controller.get().status).toBe('playing');
    expect([...h.media.values()].filter(node => !node.paused)).toHaveLength(1);
    expect(h.media.get('ending')!.paused).toBe(false);
  });

  it('mutes immediately even if an earlier play request completes later', async () => {
    const h = harness({ delayed: true }); h.controller.setMuted(false); h.tick(200);
    h.controller.setMuted(true); h.pending.forEach(resolve => resolve()); await settle(); h.tick();
    expect(h.media.get('opening')!.paused).toBe(true);
    expect(h.media.get('opening')!.volume).toBe(0);
    expect(h.controller.get().status).toBe('muted');
  });

  it('pauses offscreen and resumes the same position on return', () => {
    const h = harness(); h.controller.setMuted(false); h.tick();
    const node = h.media.get('opening')!; node.currentTime = 12;
    h.controller.setSuspended(true); expect(h.controller.get().status).toBe('paused');
    expect(node.paused).toBe(true); h.controller.setSuspended(false); h.tick();
    expect(node.currentTime).toBe(12); expect(node.paused).toBe(false);
  });

  it('missing music leaves the game silent and recoverable', () => {
    const options = { missing: true }; const h = harness(options);
    h.controller.setMuted(false); expect(h.controller.get().status).toBe('missing');
    expect(h.media.size).toBe(0); options.missing = false;
    h.controller.refresh(); h.tick(); expect(h.media.get('opening')!.paused).toBe(false);
  });

  it.each([['NotAllowedError', 'blocked'], ['NotSupportedError', 'error']])('handles %s without unhandled rejection', async (error, status) => {
    const h = harness({ error }); h.controller.setMuted(false); await settle(); h.tick();
    expect(h.controller.get().status).toBe(status);
    expect(h.media.get('opening')!.paused).toBe(true);
    expect(h.media.get('opening')!.volume).toBe(0);
  });

  it('bounds volume and rejects invalid values', () => {
    const h = harness(); h.controller.setMuted(false);
    h.controller.setVolume(2); h.tick(); expect(h.media.get('opening')!.volume).toBe(1);
    h.controller.setVolume(-1); h.tick(); expect(h.media.get('opening')!.volume).toBe(0);
    h.controller.setVolume(Number.NaN); expect(h.controller.get().volume).toBe(0);
  });

  it('disposal prevents pending requests from restoring playback', async () => {
    const h = harness({ delayed: true }); h.controller.setMuted(false);
    h.controller.dispose(); h.pending.forEach(resolve => resolve()); await settle(); h.tick();
    h.controller.refresh(); expect(h.controller.get().loaded).toHaveLength(0);
    expect(h.media.get('opening')!.paused).toBe(true);
  });
});
