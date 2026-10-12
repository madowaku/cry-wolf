/* Pure, deterministic v0.7.1-derived three-night rules. No DOM, storage or random source. */
(function (root) {
  'use strict';
  const counts = Object.freeze({ intro: 4, night1: 3, night2: 3, night3: 3 });
  const fresh = () => ({ version: 8, revision: 0, stage: 'intro', phase: 'title', beat: 0,
    trust: 3, bond: 0, insight: 0, ticks: 0, notes: [], history: [], events: [], observation: null, result: null,
    flags: { n1: null, held2: false, n2: null, village3: false, forest3: false, talk3: false, agreement3: false, n3: null } });
  const copy = s => JSON.parse(JSON.stringify(s));
  const clamp = (n, max) => Math.max(0, Math.min(max, n));
  function legal(s) {
    if (s.phase === 'title') return ['start'];
    if (['story', 'observe', 'result'].includes(s.phase)) return ['next'];
    if (s.phase === 'choice1') return ['ring1', 'hide1'];
    if (s.phase === 'explore2') return ['track2', 'listen2', 'signal2'];
    if (s.phase === 'report2') return ['ring2', 'silent2'];
    if (s.phase === 'explore3') return [!s.flags.village3 && 'village3', !s.flags.forest3 && 'forest3', !s.flags.talk3 && 'speak3', !s.flags.agreement3 && 'signal3'].filter(Boolean);
    if (s.phase === 'report3') return [s.flags.village3 && s.flags.forest3 && s.flags.agreement3 && 'proposal3', 'facts3', 'false3', 'secret3'].filter(Boolean);
    return [];
  }
  function enter(s, stage) {
    s.stage = stage; s.beat = 0; s.phase = 'story'; s.result = null; s.observation = null;
    s.ticks = stage === 'night2' ? 2 : stage === 'night3' ? 3 : 0;
    if (stage === 'night3') {
      const key = s.flags.n1 === 'ring' ? 'village3' : 'forest3';
      s.flags[key] = true;
      s.notes.push({ stage, id: key === 'village3' ? 'inherited-map' : 'inherited-spring' });
    }
  }
  function result(s, code, delta) {
    const before = { trust: s.trust, bond: s.bond, insight: s.insight };
    for (const key of ['trust', 'bond', 'insight']) s[key] = clamp(s[key] + (delta[key] || 0), key === 'insight' ? 3 : 5);
    const after = { trust: s.trust, bond: s.bond, insight: s.insight };
    s.result = { code, before, after }; s.history.push({ stage: s.stage, code, before, after }); s.phase = 'result';
  }
  function transition(state, action, expectedRevision = state.revision) {
    if (expectedRevision !== state.revision || !legal(state).includes(action)) return state;
    const s = copy(state);
    if (action === 'start') enter(s, 'intro');
    else if (action === 'next') {
      if (s.phase === 'story') {
        if (s.beat + 1 < counts[s.stage]) s.beat++;
        else if (s.stage === 'intro') enter(s, 'night1');
        else s.phase = s.stage === 'night1' ? 'choice1' : s.stage === 'night2' ? 'explore2' : 'explore3';
      } else if (s.phase === 'observe') s.phase = (s.ticks > 0 ? 'explore' : 'report') + s.stage.slice(-1);
      else if (s.phase === 'result') {
        if (s.stage === 'night3') s.phase = 'finish';
        else enter(s, s.stage === 'night1' ? 'night2' : 'night3');
      }
    } else if (s.phase === 'choice1') {
      s.flags.n1 = action === 'ring1' ? 'ring' : 'hide';
      result(s, s.flags.n1, action === 'ring1' ? { trust: 1 } : { trust: -1, bond: 1 });
    } else if (s.phase === 'explore2') {
      const time = s.ticks--;
      const id = action.replace('2', '') + (time === 2 ? '-far' : '-near');
      if (id === 'signal-near') s.flags.held2 = true;
      s.observation = { stage: s.stage, id, crossed: s.ticks === 0 && !s.flags.held2 };
      s.notes.push(s.observation); s.phase = 'observe';
    } else if (s.phase === 'report2') {
      const code = s.flags.held2 ? (action === 'silent2' ? 'best' : 'false') : (action === 'ring2' ? 'duty' : 'miss');
      s.flags.n2 = code;
      result(s, code, { best: { bond: 1, insight: 1 }, false: { trust: -2 }, duty: { trust: 1 }, miss: { trust: -1, bond: 1 } }[code]);
    } else if (s.phase === 'explore3') {
      s.ticks--;
      let id = action;
      if (action === 'village3' || action === 'forest3') s.flags[action] = true;
      else if (action === 'speak3') s.flags.talk3 = true;
      else if (s.flags.held2 && s.flags.village3 && s.flags.forest3) { s.flags.agreement3 = true; id = 'agreement'; }
      else id = s.flags.held2 ? 'missing-evidence' : 'missing-signal';
      s.observation = { stage: s.stage, id }; s.notes.push(s.observation); s.phase = 'observe';
    } else if (s.phase === 'report3') {
      const code = action.replace('3', ''); s.flags.n3 = code;
      result(s, code, { proposal: { trust: 1, bond: 2, insight: 1 }, facts: { trust: 1, bond: s.flags.village3 && s.flags.forest3 ? 1 : 0 }, false: { trust: -2, bond: -1 }, secret: {} }[code]);
    }
    s.revision++; s.events.push(action); return s;
  }
  function serialize(s) { return JSON.stringify({ version: 8, events: s.events }); }
  function restore(raw) {
    try {
      const value = JSON.parse(raw);
      if (value?.version !== 8 || !Array.isArray(value.events) || value.events.length > 100) return null;
      let s = fresh();
      for (const event of value.events) {
        if (typeof event !== 'string') return null;
        const next = transition(s, event); if (next === s) return null; s = next;
      }
      return s.phase === 'title' ? null : s;
    } catch { return null; }
  }
  root.CWModel = Object.freeze({ fresh, transition, legal, serialize, restore, counts,
    moon: stage => ({ intro: .5, night1: .5, night2: .59, night3: .68 })[stage] || .5 });
})(globalThis);
