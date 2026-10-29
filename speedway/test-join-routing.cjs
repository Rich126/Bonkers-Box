const fs=require('node:fs'),assert=require('node:assert/strict');const app=fs.readFileSync(__dirname+'/../live/app.js','utf8');
const lookup=app.slice(app.indexOf('async function lookupJoinRoom(){'),app.indexOf('async function assertPhase3Ready(){'));
const join=app.slice(app.indexOf('async function joinRoom(){'),app.indexOf('function friendlyError(e)'));
function harness(){const els=new Map(),queries=[];let oldResolve=null;
const $=id=>{if(!els.has(id))els.set(id,{value:'',innerHTML:'',disabled:false,classList:{add(){},toggle(){}}});return els.get(id)};
$('join-code').value='ABCD';$('player-name').value='Alice';
const db={from(table){let code='';const query={select(){return this},eq(k,v){if(k==='code')code=v;return this},maybeSingle(){queries.push({table,code});if(table==='rooms')return Promise.resolve({error:{message:'Quiz service unavailable'},data:null});if(code==='OLD1')return new Promise(resolve=>oldResolve=resolve);return Promise.resolve({data:{id:code,code,status:'lobby',lap_count:3},error:null})}};return query}};
const window={location:{href:''}};
const api=new Function('$','db','window',`let configured=true,joinLookupRevision=0,joinIsSpeedway=false,joinRoomSettings=null,joinLookupTimer=null;const cleanCode=v=>v,cleanName=v=>v;const msg=(e,t)=>e.innerHTML=t;const console={error(){}};${lookup}${join};return {lookup:lookupJoinRoom,join:joinRoom,isSpeedway:()=>joinIsSpeedway};`)($,db,window);
return {api,$,queries,window,release(){oldResolve({data:{id:'old',status:'lobby',lap_count:10},error:null})}};}
(async()=>{const h=harness();await h.api.join();assert(h.window.location.href.includes('join=ABCD'));assert(!h.$('join-room').disabled);assert(h.api.isSpeedway());console.log('PASS: immediate Join discovers Speedway even if quiz room lookup fails');
const stale=harness();stale.$('join-code').value='OLD1';const older=stale.api.lookup();await Promise.resolve();await Promise.resolve();stale.$('join-code').value='NEW2';await stale.api.lookup();const current=stale.$('join-room-info').innerHTML;stale.release();await older;assert.equal(stale.$('join-room-info').innerHTML,current);console.log('PASS: stale room-code lookup cannot replace the current result');})().catch(e=>{console.error(e);process.exitCode=1});
