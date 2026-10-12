// Generated from the verified storybook controller by scripts/moon/sync-storybook-audio.mjs.
(function(root){"use strict";

const MUSIC_TRACKS={
  opening:{title:'the fairy tale',author:'のる',role:'オープニング',page:'https://opentracks.com/bgm/detail/19133'},
  gameplay:{title:'Storyteller',author:'のる',role:'プレイ中',page:'https://opentracks.com/bgm/detail/21959'},
  ending:{title:'月夜',author:'チョコミント',role:'エンディング',page:'https://opentracks.com/bgm/detail/6987'}
};
const musicForPhase=phase=>phase==='title'||phase==='intro'?'opening':phase==='result'?'ending':'gameplay';
function createMusicController({createAudio,sourceFor,now,raf,caf,onChange=()=>{}}){
  const nodes=new Map();
  let target='opening',muted=true,suspended=false,volume=.22,status='muted',frame=0,generation=0,disposed=false;
  const notify=()=>onChange({target,muted,suspended,volume,status});
  function stopFade(){if(frame)caf(frame);frame=0;}
  function pauseAll(){stopFade();for(const audio of nodes.values()){audio.volume=0;audio.pause();}}
  function synchronize(){
    if(disposed)return;
    const token=++generation;
    stopFade();
    if(muted||suspended){pauseAll();status=muted?'muted':'paused';notify();return;}
    let src;
    try{src=sourceFor(target);}catch{pauseAll();status='error';notify();return;}
    if(!src){pauseAll();status='missing';notify();return;}
    let selected=nodes.get(target);
    if(!selected){try{selected=createAudio(src);selected.loop=true;selected.preload='auto';selected.volume=0;nodes.set(target,selected);}catch{pauseAll();status='error';notify();return;}}
    status=selected.paused?'loading':'playing';notify();
    if(selected.paused){
      try{Promise.resolve(selected.play()).then(()=>{
        if(disposed||muted||suspended||selected!==nodes.get(target)){selected.pause();return;}
        if(token===generation){status='playing';notify();}
      }).catch(error=>{if(!disposed&&token===generation){pauseAll();status=error?.name==='NotAllowedError'?'blocked':'error';notify();}});}
      catch(error){pauseAll();status=error?.name==='NotAllowedError'?'blocked':'error';notify();return;}
    }
    const started=now(),starts=new Map([...nodes].map(([key,audio])=>[key,audio.volume]));
    function fade(){
      if(disposed||token!==generation)return;
      const progress=Math.min(1,(now()-started)/450);
      for(const [key,audio] of nodes){const end=key===target?volume:0;audio.volume=starts.get(key)+(end-starts.get(key))*progress;}
      if(progress<1)frame=raf(fade);
      else{frame=0;for(const [key,audio] of nodes)if(key!==target){audio.pause();audio.currentTime=0;}}
    }
    frame=raf(fade);
  }
  return {
    setPhase(phase){const next=musicForPhase(phase);if(next!==target){target=next;synchronize();}},
    setMuted(value){muted=Boolean(value);synchronize();},
    setVolume(value){const n=Number(value);if(!Number.isFinite(n))return;volume=Math.max(0,Math.min(1,n));synchronize();},
    setSuspended(value){suspended=Boolean(value);synchronize();},
    refresh:synchronize,
    get(){return {target,muted,suspended,volume,status,loaded:[...nodes.keys()]};},
    dispose(){disposed=true;generation++;pauseAll();nodes.clear();}
  };
}

root.CWAudio={tracks:MUSIC_TRACKS,createController:createMusicController};
})(window);
