(function(){
  'use strict';
  const PREF_KEY='spencer_live_music_enabled_v1';
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  let ctx=null,master=null,filter=null,timer=null,nextAt=0,step=0;
  let enabled=true,hostActive=false,ducked=false,mode='lobby',finishedFanfarePlayed=false;
  try{enabled=localStorage.getItem(PREF_KEY)!=='off';}catch(_){}

  const MODES={
    lobby:{bpm:92,lead:[0,4,7,11,7,4,2,7,0,4,7,9,7,4,2,-1],bass:[0,0,5,5,9,9,7,7],root:60},
    quiz:{bpm:122,lead:[0,4,7,12,7,4,9,7,2,5,9,12,9,5,4,2],bass:[0,0,5,5,9,9,7,7],root:60},
    creative:{bpm:106,lead:[0,7,4,9,7,2,5,11,0,4,9,7,5,2,4,7],bass:[0,5,9,7,0,5,7,9],root:62},
    result:{bpm:112,lead:[0,4,7,12,11,7,9,12,4,7,11,14,12,9,7,4],bass:[0,5,9,7,0,5,7,9],root:60},
    finished:{bpm:96,lead:[0,4,7,12,7,4,0,7],bass:[0,5,9,7],root:60}
  };

  function midi(n){return 440*Math.pow(2,(n-69)/12);}
  function ensure(){
    if(!AudioCtx)return false;
    if(ctx)return true;
    ctx=new AudioCtx();
    master=ctx.createGain();master.gain.value=0.0001;
    filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=3400;filter.Q.value=.35;
    filter.connect(master);master.connect(ctx.destination);
    return true;
  }
  function targetGain(){return !enabled||!hostActive?0.0001:(ducked?0.009:0.032);}
  function fade(seconds=.45){if(!master||!ctx)return;const now=ctx.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(targetGain(),now,Math.max(.03,seconds/4));}
  function tone(freq,start,duration,wave,gain){
    if(!ctx||!filter||!enabled||!hostActive)return;
    const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,start);
    g.gain.setValueAtTime(0.0001,start);g.gain.exponentialRampToValueAtTime(gain,start+.018);g.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    osc.connect(g);g.connect(filter);osc.start(start);osc.stop(start+duration+.03);
  }
  function tickAt(t){
    const c=MODES[mode]||MODES.lobby,lead=c.lead[step%c.lead.length],bass=c.bass[Math.floor(step/2)%c.bass.length];
    tone(midi(c.root+lead),t,.16,'square',.024);
    if(step%2===0)tone(midi(c.root-24+bass),t,.30,'triangle',.035);
    if(mode==='quiz'&&step%4===2)tone(midi(c.root+19),t,.055,'square',.008);
    if(mode==='creative'&&step%8===6)tone(midi(c.root+16),t,.09,'square',.010);
    step++;
  }
  function pump(){
    if(!ctx||!enabled||!hostActive)return;
    const c=MODES[mode]||MODES.lobby,secondsPerStep=(60/c.bpm)/2;
    if(!nextAt||nextAt<ctx.currentTime-.2)nextAt=ctx.currentTime+.05;
    while(nextAt<ctx.currentTime+.55){tickAt(nextAt);nextAt+=secondsPerStep;}
  }
  function startScheduler(){if(timer)return;timer=setInterval(pump,120);pump();}
  function stopScheduler(){if(timer){clearInterval(timer);timer=null;}nextAt=0;step=0;}
  async function awaken(){
    if(!ensure())return false;
    try{if(ctx.state==='suspended')await ctx.resume();}catch(_){}
    startScheduler();fade(.35);return true;
  }
  function playFanfare(){
    if(!ctx||!enabled||!hostActive)return;const now=ctx.currentTime+.04,notes=[60,64,67,72,76,79,84];
    notes.forEach((n,i)=>tone(midi(n),now+i*.105,.22,i<4?'square':'triangle',i===notes.length-1?.045:.028));
    tone(midi(48),now,.65,'triangle',.04);tone(midi(55),now+.42,.72,'triangle',.04);
  }
  async function setHostActive(active){hostActive=Boolean(active);if(hostActive&&enabled)await awaken();else{fade(.28);setTimeout(()=>{if(!hostActive)stopScheduler();},500);}}
  async function setEnabled(value){enabled=Boolean(value);try{localStorage.setItem(PREF_KEY,enabled?'on':'off');}catch(_){}if(enabled&&hostActive)await awaken();else{fade(.2);if(!enabled)setTimeout(stopScheduler,400);}return enabled;}
  function isEnabled(){return enabled;}
  function setMode(next){next=MODES[next]?next:'lobby';if(next!==mode){mode=next;finishedFanfarePlayed=false;fade(.55);}if(mode==='finished'&&!finishedFanfarePlayed&&hostActive&&enabled){finishedFanfarePlayed=true;if(ctx&&ctx.state==='running')playFanfare();else awaken().then(playFanfare);}}
  function duck(on){ducked=Boolean(on);fade(on?.12:.5);}

  document.addEventListener('pointerdown',()=>{if(hostActive&&enabled)awaken();},true);
  document.addEventListener('play',e=>{if(e.target&&e.target.tagName==='AUDIO')duck(true);},true);
  document.addEventListener('pause',e=>{if(e.target&&e.target.tagName==='AUDIO')duck(false);},true);
  document.addEventListener('ended',e=>{if(e.target&&e.target.tagName==='AUDIO')duck(false);},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)fade(.12);else if(hostActive&&enabled)awaken();});

  window.SpencerMusic={setHostActive,setEnabled,isEnabled,setMode,duck,awaken};
})();
