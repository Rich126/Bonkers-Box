/* Deterministic pit crew rules; all times are monotonic milliseconds. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PitStop=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const HOLD_MS=450,PENALTY_MS=3000,RULESET='pitstop-v1';
function create(now,wait){return {phase:'waiting',greenAt:now+Math.max(2000,Math.min(5000,wait)),startedAt:null,lastNow:now,wheels:[0,0,0,0],hold:null,earlyCount:0,result:null};}
function tick(s,now){if(now<s.lastNow)return;s.lastNow=now;if(s.phase==='waiting'&&now>=s.greenAt){s.phase='working';s.startedAt=s.greenAt;}if(s.phase==='working'&&s.hold&&now-s.hold.at>=HOLD_MS){const i=s.hold.wheel;s.wheels[i]++;s.hold=null;}}
function penalty(s){s.earlyCount=Math.min(100,s.earlyCount+1);return 'penalty';}
function wheelDown(s,i,now){tick(s,now);if(!Number.isInteger(i)||i<0||i>3||s.phase==='finished'||s.phase==='cancelled')return;if(s.phase==='waiting')return penalty(s);if(s.hold||s.wheels[i]===3)return;if(s.wheels[i]===1){s.wheels[i]=2;return 'swapped';}s.hold={wheel:i,at:now};return 'holding';}
function releaseHold(s,now){tick(s,now);s.hold=null;}
function go(s,now){tick(s,now);if(s.phase==='finished'||s.phase==='cancelled')return;if(s.phase==='waiting'||s.wheels.some(x=>x!==3))return penalty(s);const raw=Math.max(0,Math.round(now-s.startedAt));s.phase='finished';s.hold=null;s.result={raw_ms:raw,early_count:s.earlyCount,total_ms:raw+s.earlyCount*PENALTY_MS,ruleset:RULESET};return 'finished';}
function cancel(s){if(s&&s.phase!=='finished'){s.phase='cancelled';s.hold=null;}}
function valid(r){return !!r&&r.ruleset===RULESET&&Number.isInteger(r.raw_ms)&&r.raw_ms>=HOLD_MS*8&&r.raw_ms<=180000&&Number.isInteger(r.early_count)&&r.early_count>=0&&r.early_count<=100&&r.total_ms===r.raw_ms+r.early_count*PENALTY_MS;}
return {HOLD_MS,PENALTY_MS,RULESET,create,tick,wheelDown,releaseHold,go,cancel,valid};});
