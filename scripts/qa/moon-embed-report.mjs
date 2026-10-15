import { readFileSync, writeFileSync } from 'node:fs';

const folder = 'output/playwright/moon-embed';
const names = ['before', 'after', 'edges', 'routes', 'production', 'audio'];
const reports = Object.fromEntries(names.map(name => {
  const line = readFileSync(`${folder}/${name}.log`, 'utf8').split(/\r?\n/).find(line => line.startsWith('{'));
  if (!line) throw new Error(`Missing result in ${name}.log`);
  const report = JSON.parse(line);
  if (report.failures.length || report.errors.length) throw new Error(`${name} has failed checks: ${JSON.stringify(report.failures)}`);
  const { details, ...summary } = report;
  return [name, summary];
}));
const comparison = reports.after.scenes.map(after => {
  const before = reports.before.scenes.find(scene => scene.width === after.width && scene.name === after.name);
  return { width:after.width, height:after.height, scene:after.name, beforeDocumentHeight:before.documentHeight, afterDocumentHeight:after.documentHeight, beforeImageHeight:before.stage.height, afterImageHeight:after.stage.height };
});
writeFileSync('docs/moon/itch-embed-qa.json', JSON.stringify({
  date:'2026-10-15', branch:'codex/moon-v092-finishing', baseline:'34a7f628092a75d0222c429469594b49b6f04877',
  method:'Chromium with a desktop host and a fixed-size iframe; real wheel, keyboard, clicks and canonical model bookmarks. All four endings also played through existing browser QA.',
  recommendedItchEmbed:{width:960,height:640},
  commands:{unit:'npm test -- --reporter=dot',unitPassed:239,typecheck:'npm run typecheck',typecheckPassed:true,build:'npm run build',buildPassed:true},
  comparison, reports,
  limitations:['itch.io account settings and live hosted iframe were not changed or tested.','Physical Android/iOS, Safari/Firefox and human comfort/fun are not verified.']
}, null, 2) + '\n');

const scenes = {title:'表紙',prologue:'序章',result:'結果の理由と数値','long-scene':'長文・三夜の振り返り','multiple-choices':'第六夜・5つの選択肢',epilogue:'TRUE ENDの後日談','true-end':'TRUE END・満月の表紙'};
const data = JSON.stringify({comparison,scenes});
writeFileSync(`${folder}/comparison.html`, `<!doctype html>
<html lang="ja"><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRY WOLF! itch.io iframe 比較</title>
<style>body{margin:0;padding:24px;background:#19283f;color:#f4ead9;font:16px/1.8 system-ui,sans-serif}header{max-width:1200px;margin:auto}h1{font:32px Georgia,serif}select,button{font:inherit;padding:8px;min-height:44px}label{display:inline-block;margin:8px 16px 8px 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{min-width:0;margin:16px 0}img{max-width:100%;height:auto;display:block;background:#101d30}a{color:#e6c38d}figcaption{margin-bottom:8px}#metrics{font-size:14px} @media(max-width:700px){.pair{grid-template-columns:1fr}body{padding:16px}}</style>
<header><h1>CRY WOLF! — 固定iframeの比較</h1><p>PC向けのitch.io設定は <b>960 × 640</b>。430px幅の埋め込みでは縦積みを使います。<a href="preview.html">固定iframeで遊ぶ</a></p><label>サイズ <select id="size">${[[960,640],[900,600],[430,800],[390,844],[360,800]].map(([w,h])=>`<option value="${w}">${w} × ${h}</option>`).join('')}</select></label><label>場面 <select id="scene">${Object.entries(scenes).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label><input type="checkbox" id="bottom"> 修正後の末尾・操作位置を見る</label><p id="metrics"></p></header>
<main class="pair"><figure><figcaption>修正前 · <a id="before-link">原寸画像</a></figcaption><img id="before" alt="修正前の固定iframe"></figure><figure><figcaption>修正後 · <a id="after-link">原寸画像</a></figcaption><img id="after" alt="修正後の固定iframe"></figure></main>
<script>const data=${data};const size=document.getElementById('size'),scene=document.getElementById('scene'),bottom=document.getElementById('bottom');function show(){const item=data.comparison.find(x=>x.width===Number(size.value)&&x.scene===scene.value);for(const mode of ['before','after']){const src=mode+'-'+item.scene+(mode==='after'&&bottom.checked?'-bottom':'')+'-'+item.width+'x'+item.height+'.png';document.getElementById(mode).src=src;document.getElementById(mode+'-link').href=src;}document.getElementById('metrics').textContent='iframe '+item.width+' × '+item.height+' / 文書の高さ '+item.beforeDocumentHeight+' → '+item.afterDocumentHeight+'px / 絵の高さ '+Math.round(item.beforeImageHeight)+' → '+Math.round(item.afterImageHeight)+'px。本文は18px以上。スクロールと実操作を確認済み。';}for(const el of [size,scene,bottom])el.addEventListener('change',show);show();</script></html>`);
console.log(JSON.stringify({report:'docs/moon/itch-embed-qa.json',comparison:`${folder}/comparison.html`,checks:Object.fromEntries(names.map(name=>[name,`${reports[name].passed}/${reports[name].checks}`]))}));
writeFileSync(`${folder}/preview.html`, `<!doctype html><html lang="ja"><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CRY WOLF! 固定iframeプレビュー</title><style>body{margin:24px;background:#26252b;color:#f4ead9;font:16px system-ui,sans-serif}select{font:inherit;min-height:44px;margin-bottom:16px}iframe{display:block;border:0}a{color:#e6c38d}</style><label>iframeサイズ <select id="size">${[[960,640],[900,600],[430,800],[390,844],[360,800]].map(([w,h])=>`<option value="${w},${h}">${w} × ${h}</option>`).join('')}</select></label> <a href="comparison.html">比較を見る</a><iframe title="CRY WOLF! 固定iframe" src="/moon/index.html" width="960" height="640"></iframe><script>document.querySelector('select').onchange=e=>{const [w,h]=e.target.value.split(',');const frame=document.querySelector('iframe');frame.width=w;frame.height=h;};</script></html>`);
