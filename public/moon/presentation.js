/* Presentation only: no changes to rules, revision, events, or bookmarks. */
(function(root){
  'use strict';
  function musicRole(state,home){
    if(home||state.stage==='intro')return 'opening';
    if(['epilogue','finish'].includes(state.phase)||(state.stage==='night7'&&state.phase==='result'))return 'ending';
    return 'gameplay';
  }
  function hasReveal(state,step){
    return step===0&&(state.phase==='result'||(state.stage==='night2'&&state.phase==='story'&&state.beat===2));
  }
  function isPromiseCover(state,home){
    return !home && state.phase==='finish' && state.ending==='HONEST';
  }
  function visual(state,home,step){
    if(home)return {kind:'cover'};
    if(isPromiseCover(state,home))return {kind:'promise-cover'};
    if(state.phase==='result')return {kind:step===0?'reaction':'explanation',code:state.result.code};
    if(state.phase==='choice1')return {kind:'decision',location:'inside'};
    if(state.phase==='report5')return {kind:'report',location:CWModel.location5(state)};
    if(state.stage!=='night2')return {kind:'scene'};
    if(state.phase==='story'&&state.beat===2)return {kind:step===0?'howl':'tracks',near:false};
    if(state.phase==='explore2')return {kind:'distance',near:state.ticks===1};
    if(state.phase==='report2')return {kind:'report',location:state.flags.held2?'outside':'inside'};
    if(state.phase==='observe'){
      const id=state.observation.id;
      return {kind:id.startsWith('track')?'tracks':id.startsWith('listen')?'listen':'signal',near:id.endsWith('near'),location:state.observation.crossed?'inside':'outside',held:id==='signal-near'};
    }
    return {kind:'scene'};
  }
  function paw(x,y,rabbit=false){
    return `<g transform="translate(${x} ${y}) rotate(-15)" fill="#19283f"><ellipse cy="12" rx="10" ry="8"/><ellipse cx="-10" cy="-3" rx="4" ry="${rabbit?10:5}"/><ellipse cy="-8" rx="4" ry="${rabbit?10:5}"/>${rabbit?'':'<ellipse cx="10" cy="-3" rx="4" ry="5"/>'}</g>`;
  }
  function diagram(view){
    const tracks=view.kind==='tracks',signal=view.kind==='signal',listen=['howl','listen'].includes(view.kind);
    const cue=view.location==='inside'?195:view.near?334:456;
    const label=view.location==='inside'?'最後の刻、見張り道の内側へ':view.held?'返事が届いた。境界の外で待っている':view.near?'近い木陰の気配':'遠い森の気配';
    return `<div class="clue-illustration" data-distance="${view.near?'near':'far'}" data-location="${view.location || 'unknown'}"><svg viewBox="0 0 520 400" aria-hidden="true"><path d="M0 0h520v400H0z" fill="#19283f"/><path d="M405 286l33-103 33 103M452 286l28-86 28 86" fill="#344959"/><path d="M0 302h260v98H0z" fill="#f4ead9"/><path d="M260 302h260v98H260z" fill="#b8bec8"/><path d="M260 278v122" stroke="#19283f" stroke-width="4" stroke-dasharray="9 9"/>${!tracks?'<path d="M111 226l243-57v203z" fill="#c8954f" opacity=".25"/><g stroke="#c8954f" stroke-width="5"><path d="M87 205v-17a20 20 0 0 1 40 0v17M76 205h62l-8 94H84z" fill="#19283f"/><path class="lantern-window" d="M88 214h37l-5 74H93z" fill="#f4ead9"/><path d="M74 302h66"/></g>':''}${tracks?paw(105,343,true)+paw(152,359,true):''}${['howl','distance'].includes(view.kind)?'':paw(cue,338)}${tracks?paw(cue+26,370):''}${listen?`<g class="sound-rings" fill="none" stroke="#f4ead9" stroke-width="3"><path d="M${cue-21} 166q-23 30 0 60M${cue-42} 154q-39 42 0 84"/></g>`:''}${view.held?'<circle class="signal-answer" cx="334" cy="220" r="7" fill="#f4ead9"/>':''}</svg><p class="clue-label">${label}</p>${!tracks?'<span class="light-range">灯りが届くのは、近い木陰まで</span>':''}<span class="clue-stone">白い境界石</span><div class="clue-sides"><span>村側・見張り道</span><span>森側・境界の外</span></div></div>`;
  }
  function resultChanges(state){
    return ['trust','bond','insight'].map(key=>({key,before:state.result.before[key],after:state.result.after[key],delta:state.result.after[key]-state.result.before[key]}));
  }
  root.CWPresentation={musicRole,hasReveal,visual,diagram,resultChanges,isPromiseCover};
})(typeof window!=='undefined'?window:globalThis);
