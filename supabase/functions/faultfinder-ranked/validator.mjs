import * as rules from './factory-core.js';
const C=globalThis.FaultFinder||rules.default;
export function validName(value){return typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/g,' ').slice(0,18):'';}
export function replay(challenge,events){
 if(!challenge||challenge.ruleset!==C.RULESET||typeof challenge.seed!=='string'||challenge.seed.length>100)throw Error('Invalid challenge');
 if(!Array.isArray(events)||events.length<2||events.length>512)throw Error('Incomplete replay');
 const s=C.create(challenge.seed);let last=-1,freeAt=0,finishedAt=null,point={...s.player};
 for(const e of events){
  if(!e||!Number.isInteger(e.t)||e.t<0||e.t<last||e.t>480000||s.status!=='playing')throw Error('Invalid replay timing');last=e.t;
  while(s.clock*1000<e.t-.001&&s.status==='playing')C.step(s,{},Math.min(.1,(e.t-s.clock*1000)/1000));
  if(e.a==='finish'){if(s.status!=='won'||e!==events.at(-1)||e.t-s.clock*1000>101)throw Error('Incomplete repair sequence');finishedAt=e.t;continue;}
  if(s.status!=='playing'||s.job)throw Error('Overlapping service actions');
  if(e.a==='open'){
   const m=s.stations.find(m=>m.id===e.cell);if(!m||s.consoleOpen)throw Error('Invalid console sequence');
   // Allow the full 43px interaction radius at each endpoint. Walking time cannot
   // overlap service actions. This bounds travel speed without trusting coordinates.
   const dest={x:m.x,y:m.y+44},minimum=Math.max(0,Math.hypot(dest.x-point.x,dest.y-point.y)-86)/C.SPEED*1000;
   if(e.t-freeAt+2<minimum)throw Error('Invalid travel timing');
   Object.assign(s.player,dest);if(!C.open(s,m.id))throw Error('Invalid console');point=dest;
  }else if(e.a==='close'){
   if(!s.consoleOpen||!C.close(s))throw Error('Invalid console close');freeAt=e.t;
  }else if(!C.startAction(s,e.cell,e.a))throw Error('Invalid service event');
 }
 if(s.status!=='won'||events.at(-1).a!=='finish'||!s.stations.every(m=>m.fixed&&C.passComplete(m)))throw Error('Incomplete repair sequence');
 // The winning frame may land just after the final action completes. Keep its
 // validated timestamp so the device and online boards show exactly the same time.
 const mistakes=s.stations.reduce((n,m)=>n+m.mistakes,0),elapsed=finishedAt+mistakes*8000;
 if(elapsed>480000)throw Error('Invalid finish timing');
 return {elapsed_ms:elapsed,active_ms:finishedAt,mistakes,cells_fixed:6};
}
