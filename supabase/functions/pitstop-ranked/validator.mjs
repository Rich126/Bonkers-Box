import * as rules from './pit-core.js';
const C=globalThis.PitStop||rules.default;
export function replay(challenge,events){
 if(!challenge||challenge.ruleset!==C.RULESET||!Number.isInteger(challenge.arrival_ms)||challenge.arrival_ms<2000||challenge.arrival_ms>5000)throw Error('Invalid run challenge');
 if(!Array.isArray(events)||events.length<2||events.length>2048)throw Error('Incomplete run replay');
 const state=C.create(0,challenge.arrival_ms,challenge.order);let last=-1,pressed=false;
 for(let index=0;index<events.length;index++){
  const e=events[index];if(!e||!Number.isFinite(e.t)||e.t<0||e.t<last||e.t>185000||!['jack','wheel','up','go'].includes(e.a))throw Error('Invalid replay event');
  if(state.phase==='finished')throw Error('Events after release');last=e.t;
  if(e.a==='jack'||e.a==='wheel'){if(pressed)throw Error('Repeated press without release');pressed=true;if(e.a==='jack')C.jackPress(state,e.t);else{if(!Number.isInteger(e.i)||e.i<0||e.i>3)throw Error('Invalid wheel');C.wheelDown(state,e.i,e.t);}}
  else if(e.a==='up'){if(!pressed)throw Error('Release without a press');pressed=false;C.releaseHold(state,e.t);}
  else C.go(state,e.t);
 }
 if(state.phase!=='finished'||events.at(-1).a!=='go'||!C.valid(state.result))throw Error('The service sequence was not completed');
 return {...state.result,duration_ms:challenge.arrival_ms+state.result.raw_ms};
}
export function validName(value){return typeof value==='string'&&value.length<=100?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/g,' ').slice(0,24):'';}
