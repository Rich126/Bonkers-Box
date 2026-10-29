// Run with: node rally-cross-x/tests/handling.cjs
// Headless logic tests: exercises production physics with minimal UI stubs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const game=source.match(/<script>([\s\S]*?)<\/script>/)[1];
const bootstrap="\nconst els=new Map();\nfunction el(id){if(els.has(id))return els.get(id);const e={id,style:{},dataset:{},value:({mode:'solo',localCount:'2',laps:'1',difficulty:'medium',tuneSlide:'1.5',tuneGrip:'.7',tunePunish:'2.6',tuneFast:'272'})[id]||'',hidden:false,innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(type,fn){this[type]=fn},appendChild(){},append(){},remove(){},querySelector(s){return el(id+s)},querySelectorAll(){return []},setAttribute(){},getContext(){return {}},getBoundingClientRect(){return {width:1200,height:720,left:0,top:0,right:1200}}};els.set(id,e);return e}\nconst document={getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:el,body:el('body')};\nconst window={addEventListener(){},scrollTo(){}},localStorage={getItem:()=>null,setItem(){}},requestAnimationFrame=()=>{},matchMedia=()=>({matches:false}),innerWidth=1024,performance={now:()=>0},navigator={userAgent:''},setTimeout=()=>{};\n";
const hook="\nglobalThisPlaceholder.api={\nlayouts:layouts.map(l=>l.id),\nrun(index,profile,dt=.02){\n chosen=index;ui.mode.value='solo';ui.laps.value='1';enterDrawing();\n const guide=s=>point(((s%track.total)+track.total)%track.total);\n draw=Array.from({length:601},(_,i)=>{const s=track.total*i/600;let v=500;if(profile==='brake'){let bend=0;for(const ahead of [0,30,60,90,120])bend=Math.max(bend,Math.abs(curveAt(guide,s+ahead,track.total)));v=bend>.005?150:bend>.0025?260:500;}return {...guide(s),v}});\n drawDistance=measurePath(draw);invalidDistance=0;finishPossible=true;sealLap();beginRace();\n const samples=[];for(let i=0;i<900/dt&&phase==='racing';i++){update(dt,startAt+1);if(i%10===0)samples.push({s:racer.s,x:racer.x,y:racer.y,slip:racer.slip,offset:racer.offset});}\n return {track:track.id,profile,time:racer.finishedAt,offroad:currentRun.offroad,braking:currentRun.brakingSeconds,peakSlip:currentRun.peakSlip,loss:currentRun.loss,peakOffset:Math.max(...samples.map(p=>Math.abs(p.offset))),samples};\n}\n};\n\nglobalThisPlaceholder.api.local=function(n,laps=3){\n ui.mode.value='local';ui.localCount.value=n;ui.laps.value=String(laps);enterDrawing();\n for(let player=0;player<n;player++){for(let lap=0;lap<laps;lap++){\n draw=Array.from({length:401},(_,i)=>({...point(track.total*i/400),v:player%2?500:150}));\n drawDistance=measurePath(draw);invalidDistance=0;finishPossible=true;if(!sealLap())throw Error('seal failed');}\n if(player<n-1){if(phase!=='handoff')throw Error('no handoff');els.get('button').click();}\n }\n beginRace();for(let i=0;i<45000&&phase==='racing';i++)update(.02,startAt+1);\n if(phase!=='finished'||localCars.length!==n||localCars.some(e=>!Number.isFinite(e.car.finishedAt)||e.car.lapSplits.length!==laps))throw Error('local race failed');\n phase='planned';beginRace();if(localCars.some(e=>e.car.s!==0||e.car.finishedAt!==null))throw Error('replay reset');\n return n;\n};\nglobalThisPlaceholder.api.ai=function(){\n ui.mode.value='ai';ui.laps.value='1';enterDrawing();\n draw=Array.from({length:401},(_,i)=>({...point(track.total*i/400),v:260}));drawDistance=measurePath(draw);invalidDistance=0;finishPossible=true;sealLap();beginRace();\n for(let i=0;i<45000&&phase==='racing';i++)update(.02,startAt+1);\n if(phase!=='finished'||aiCars.length!==5||!Number.isFinite(racer.finishedAt)||aiCars.some(a=>!Number.isFinite(a.x)||!Number.isFinite(a.y)))throw Error('AI failed');\n};\nglobalThisPlaceholder.api.displace=function(){\n ui.mode.value='solo';ui.laps.value='1';enterDrawing();\n draw=Array.from({length:401},(_,i)=>({...point(track.total*i/400),v:260}));drawDistance=measurePath(draw);invalidDistance=0;finishPossible=true;sealLap();beginRace();\n racer.x+=100;racer.y+=100;const before={x:racer.x,y:racer.y};update(.02,startAt+1);\n return dist(before,racer);\n};\n";
const marker='refreshTuning();renderHistory();\nbuildTrackTabs();';
assert(game.includes(marker),'Cannot locate game bootstrap');
const holder={};
new Function('globalThisPlaceholder',bootstrap+game.replace(marker,hook+marker))(holder);
const api=holder.api;

const rows=[];
for(let index=0;index<api.layouts.length;index++){
 for(const profile of ['fast','brake']){
  const {samples,...row}=api.run(index,profile);
  assert(Number.isFinite(row.time)&&row.time>0, row.track+' failed to finish');
  assert(samples.every(p=>[p.s,p.x,p.y,p.slip,p.offset].every(Number.isFinite)), 'Non-finite motion');
  rows.push(row);
 }
}
for(const track of ['tsukuba','whiltonmill']){
 const fast=rows.find(r=>r.track===track&&r.profile==='fast'),brake=rows.find(r=>r.track===track&&r.profile==='brake');
 assert(brake.time<fast.time, track+': deliberate braking should beat FAST everywhere');
 assert(brake.peakSlip<fast.peakSlip, track+': braking should reduce peak slip');
}
assert(rows.find(r=>r.track==='daytonaoval'&&r.profile==='fast').time<rows.find(r=>r.track==='daytonaoval'&&r.profile==='brake').time, 'FAST should reward the open oval');
const times=[.01,.02,1/30,.05].map(dt=>api.run(10,'brake',dt).time);
assert((Math.max(...times)-Math.min(...times))/Math.min(...times)<.02,'Frame-step sensitivity exceeds 2%');
const repeated=api.run(10,'brake').time;assert(Math.abs(repeated-api.run(10,'brake').time)<1e-9,'Replay must be deterministic');
assert(api.displace()<8,'A displaced car must move by velocity rather than snap back onto its route');
api.local(2);api.local(8);api.ai();
console.log('PASS: 22 full laps, braking tradeoffs, finite motion, 10–50 ms steps, deterministic replay, no snapping, 2/8-player matches and AI.');
console.log('track,profile,time_seconds,offroad_seconds,braking_seconds,peak_slip_radians,peak_route_offset');
for(const r of rows)console.log([r.track,r.profile,r.time.toFixed(2),r.offroad.toFixed(2),r.braking.toFixed(2),r.peakSlip.toFixed(3),r.peakOffset.toFixed(2)].join(','));
