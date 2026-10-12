/* Pure seven-night rules. Nights 1–3 retain v0.7.1 behavior. No DOM, storage or random source. */
(function (root) {
  'use strict';
  const counts = Object.freeze({ intro: 4, night1: 3, night2: 3, night3: 3, night4: 2, night5: 2, night6: 3, night7: 3 });
  const fresh = () => ({ version: 9, revision: 0, stage: 'intro', phase: 'title', beat: 0,
    trust: 3, bond: 0, insight: 0, honesty: 0, ending: null, ticks: 0, notes: [], history: [], events: [], observation: null, result: null,
    flags: { n1: null, held2: false, n2: null, village3: false, forest3: false, talk3: false, agreement3: false, n3: null } });
  const copy = s => JSON.parse(JSON.stringify(s));
  const clamp = (n, max) => Math.max(0, Math.min(max, n));
  const canCall = s => s.bond >= 4 && s.trust >= 2 && s.honesty >= 1;
  const roadReady = s => !!(s.flags.survey6 && s.flags.village6 && s.flags.forest6);
  const location5 = s => s.flags.answer5 === 'away' ? 'absent' : s.flags.crossed5 ? 'inside' : 'outside';
  const endingFor = (s, action) => action === 'call7' ? 'HONEST' : s.trust === 0 ? 'BAD_LIAR' : s.bond >= 4 ? 'SECRET_MEETING' : 'GOOD_DOG';
  function legal(s) {
    if (s.phase === 'title') return ['start'];
    if (['story', 'observe', 'result', 'interlude', 'answer', 'epilogue'].includes(s.phase)) return ['next'];
    if (s.phase === 'choice1') return ['ring1', 'hide1'];
    if (s.phase === 'explore2') return ['track2', 'listen2', 'signal2'];
    if (s.phase === 'report2') return ['ring2', 'silent2'];
    if (s.phase === 'explore3') return [!s.flags.village3 && 'village3', !s.flags.forest3 && 'forest3', !s.flags.talk3 && 'speak3', !s.flags.agreement3 && 'signal3'].filter(Boolean);
    if (s.phase === 'report3') return [s.flags.village3 && s.flags.forest3 && s.flags.agreement3 && 'proposal3', 'facts3', 'false3', 'secret3'].filter(Boolean);
    if (s.phase === 'choice4') return ['ring4', 'pocket4', 'thank4'];
    if (s.phase === 'evening5') return ['want5', 'away5', 'decide5'];
    if (s.phase === 'explore5') return ['track5', 'listen5', 'signal5'];
    if (s.phase === 'report5') return ['ring5', 'silent5'];
    if (s.phase === 'explore6') return [!s.flags.survey6 && 'survey6', !s.flags.village6 && 'village6', !s.flags.forest6 && 'forest6', !s.flags.heart6 && 'heart6', 'wait6'].filter(Boolean);
    if (s.phase === 'report6') return [roadReady(s) && 'plan6', 'facts6', 'hush6'].filter(Boolean);
    if (s.phase === 'choice7') return ['ring7', 'silent7', canCall(s) && 'call7'].filter(Boolean);
    return [];
  }
  function enter(s, stage) {
    s.stage = stage; s.beat = 0; s.phase = 'story'; s.result = null; s.observation = null;
    s.ticks = ['night2', 'night5'].includes(stage) ? 2 : ['night3', 'night6'].includes(stage) ? 3 : 0;
    if (stage === 'night3') {
      const key = s.flags.n1 === 'ring' ? 'village3' : 'forest3';
      s.flags[key] = true;
      s.notes.push({ stage, id: key === 'village3' ? 'inherited-map' : 'inherited-spring' });
    }
    if (stage === 'night4') Object.assign(s.flags, { n4: null, answer5: null, held5: false, crossed5: false, n5: null, survey6: false, village6: false, forest6: false, heart6: false, n6: null, road: false, n7: null });
    if (stage === 'night6' && s.flags.n3 === 'proposal') {
      s.flags.survey6 = true; s.notes.push({ stage, id: 'inherited-route6' });
    }
  }
  function adjust(s, delta) {
    for (const key of ['trust', 'bond', 'insight']) s[key] = clamp(s[key] + (delta[key] || 0), key === 'insight' ? 3 : 5);
    s.honesty += delta.honesty || 0;
  }
  function result(s, code, delta) {
    const before = { trust: s.trust, bond: s.bond, insight: s.insight };
    adjust(s, delta);
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
        else s.phase = ({ night1: 'choice1', night2: 'explore2', night3: 'explore3', night4: 'choice4', night5: 'evening5', night6: 'explore6', night7: 'choice7' })[s.stage];
      } else if (s.phase === 'observe') s.phase = (s.ticks > 0 ? 'explore' : 'report') + s.stage.slice(-1);
      else if (s.phase === 'interlude') enter(s, 'night4');
      else if (s.phase === 'answer') s.phase = 'explore5';
      else if (s.phase === 'epilogue') { if (s.beat < 2) s.beat++; else s.phase = 'finish'; }
      else if (s.phase === 'result') {
        if (s.stage === 'night3') s.phase = 'interlude';
        else if (s.stage === 'night7') { s.phase = 'epilogue'; s.beat = 0; s.result = null; }
        else enter(s, 'night' + (Number(s.stage.slice(-1)) + 1));
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
    } else if (s.phase === 'choice4') {
      const code = action.slice(0, -1); s.flags.n4 = code;
      result(s, code, { ring: { trust: -1, bond: -1 }, pocket: {}, thank: { bond: 2, honesty: 1, insight: 1 } }[code]);
    } else if (s.phase === 'evening5') {
      s.flags.answer5 = action.slice(0, -1);
      adjust(s, { want: { bond: 2, honesty: 1 }, away: { bond: -1 }, decide: {} }[s.flags.answer5]);
      s.notes.push({ stage: s.stage, id: 'answer5-' + s.flags.answer5 });
      s.phase = 'answer';
    } else if (s.phase === 'explore5') {
      s.ticks--;
      if (action === 'signal5' && s.flags.answer5 !== 'away') s.flags.held5 = true;
      if (s.ticks === 0 && s.flags.answer5 === 'decide' && !s.flags.held5) s.flags.crossed5 = true;
      const place = location5(s);
      const id = action === 'signal5' ? (place === 'absent' ? 'signal5-empty' : 'signal5-held') : action === 'track5' ? 'track5-' + place : 'listen5-' + place;
      s.observation = { stage: s.stage, id };
      s.notes.push(s.observation); s.phase = 'observe';
    } else if (s.phase === 'report5') {
      const place = location5(s), ring = action === 'ring5';
      const code = place === 'inside' ? (ring ? 'duty5' : 'miss5') : ring ? 'false5' : place === 'absent' ? 'quiet5' : 'promise5';
      s.flags.n5 = code;
      result(s, code, { duty5: { trust: 1, bond: -1 }, miss5: { trust: -1, bond: 1 }, false5: { trust: -1 }, quiet5: {}, promise5: { bond: 1, insight: s.flags.held5 ? 1 : 0 } }[code]);
    } else if (s.phase === 'explore6') {
      s.ticks--;
      if (action !== 'wait6') s.flags[action] = true;
      if (action === 'heart6') adjust(s, { bond: 1, honesty: 1 });
      s.observation = { stage: s.stage, id: action }; s.notes.push(s.observation); s.phase = 'observe';
    } else if (s.phase === 'report6') {
      const code = action.slice(0, -1); s.flags.n6 = code; s.flags.road = action === 'plan6';
      result(s, code, { plan: { trust: 1, bond: 1 }, facts: { trust: 1 }, hush: {} }[code]);
    } else if (s.phase === 'choice7') {
      const code = action.slice(0, -1); s.flags.n7 = code;
      result(s, code, { ring: { trust: -1, bond: -1 }, silent: { bond: 1 }, call: { bond: 1, honesty: 1 } }[code]);
      s.ending = endingFor(s, action);
    }
    s.revision++; s.events.push(action); return s;
  }
  function serialize(s) { return JSON.stringify({ version: 9, events: s.events }); }
  function restore(raw) {
    try {
      const value = JSON.parse(raw);
      if (![8, 9].includes(value?.version) || !Array.isArray(value.events) || value.events.length > (value.version === 8 ? 100 : 240)) return null;
      let s = fresh();
      for (const event of value.events) {
        if (typeof event !== 'string') return null;
        if (value.version === 8 && s.phase === 'interlude') return null;
        const next = transition(s, event); if (next === s) return null; s = next;
      }
      return s.phase === 'title' ? null : s;
    } catch { return null; }
  }
  root.CWModel = Object.freeze({ fresh, transition, legal, serialize, restore, counts, canCall, roadReady, location5, endingFor,
    moon: stage => ({ intro: .5, night1: .5, night2: .59, night3: .68, night4: .77, night5: .86, night6: .95, night7: 1 })[stage] || .5 });
})(globalThis);
