import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const sourceDir=resolve(root,'BGM');
const outputDir=resolve(root,'output/media/music');
const destination=resolve(root,'public/storybook/assets/audio/music-pack.js');
const tracks=[
  {key:'opening',name:'the fairy tale',author:'のる',id:'19133',pattern:/fairy[ _-]?tale|19133/i},
  {key:'gameplay',name:'Storyteller',author:'のる',id:'21959',pattern:/storyteller|21959/i},
  {key:'ending',name:'月夜',author:'チョコミント',id:'6987',pattern:/月夜|6987/},
];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const fail=message=>{console.error(message);process.exit(1);};
const files=[];
for(const directory of [sourceDir,resolve(sourceDir,'source')]){
  for(const file of await readdir(directory))files.push({name:file,path:resolve(directory,file)});
}
const inputs=tracks.map(track=>{
  const candidates=files.filter(({name})=>/\.(mp3|wav|ogg|m4a)$/i.test(name)&&(name===track.key+'.mp3'||track.pattern.test(name)));
  if(candidates.length>1)fail(track.name+' の候補が複数あります。保存名を整理してください。');
  return {...track,file:candidates[0]?.name,path:candidates[0]?.path};
});
const missing=inputs.filter(t=>!t.file);
if(missing.length)fail('原音の入手待ち: '+missing.map(t=>t.name).join(' / ')+'\n保存先: '+sourceDir+'\nBGM/README.md の公式ページから手動で入手してください。現在の音楽パックは変更していません。');
for(const cmd of ['ffmpeg','ffprobe'])if(spawnSync(cmd,['-version'],{stdio:'ignore'}).status!==0)fail(cmd+' が見つかりません。');
await mkdir(outputDir,{recursive:true});
const pack={version:1,encoding:'xor-base64-v1',tracks:{}};
const receipt={date:new Date().toISOString(),license:'https://opentracks.com/help/articles/license/',terms:'https://opentracks.com/help/articles/terms/',tracks:[]};
for(const track of inputs){
  const input=track.path,encoded=resolve(outputDir,track.key+'.m4a');
  const probe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type','-of','json',input],{encoding:'utf8'});
  if(probe.status!==0)fail('読み込めない音源: '+track.file);
  const info=JSON.parse(probe.stdout),duration=Number(info.format?.duration);
  if(!info.streams?.some(s=>s.codec_type==='audio')||!Number.isFinite(duration)||duration<=0)fail('有効な音声ではありません: '+track.file);
  const encode=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',input,'-vn','-map_metadata','-1','-c:a','aac','-b:a','128k','-ar','44100','-ac','2','-movflags','+faststart',encoded],{encoding:'utf8'});
  if(encode.status!==0)fail('変換に失敗: '+track.file+'\n'+encode.stderr);
  const bytes=await readFile(encoded),scrambled=Buffer.from(bytes);
  // Container obfuscation keeps public output out of ordinary audio-file form. Not DRM.
  for(let i=0;i<scrambled.length;i++)scrambled[i]^=0x6d;
  pack.tracks[track.key]={mime:'audio/mp4',data:scrambled.toString('base64')};
  receipt.tracks.push({key:track.key,title:track.name,author:track.author,source:relative(root,input).replaceAll('\\','/'),sourceSha256:hash(await readFile(input)),convertedSha256:hash(bytes),duration,convertedBytes:bytes.length,page:'https://opentracks.com/bgm/detail/'+track.id});
}
const script='// Game-owned converted audio container. Raw MP3 sources are not distributed.\nwindow.CRYWOLF_MUSIC_PACK = '+JSON.stringify(pack)+';\nwindow.dispatchEvent(new Event("crywolf-music-ready"));\n';
await writeFile(destination+'.tmp',script);
await rename(destination+'.tmp',destination);
await writeFile(resolve(root,'docs/storybook-music-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
const manifest={schema:'cry-wolf-music-v1',license:receipt.license,terms:receipt.terms,container:{path:'assets/audio/music-pack.js',sha256:hash(Buffer.from(script)),encoding:pack.encoding,codec:'AAC',bitrate:128000,sampleRate:44100,channels:2},tracks:receipt.tracks,scope:'Game BGM integration and provenance record; not DRM or license certification'};
await writeFile(resolve(root,'public/storybook/music-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('3曲を取り込みました: '+destination+'\n原音は元の保存先に保持。ゲームを再読み込みしてください。');
