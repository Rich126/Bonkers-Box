const assert=require('node:assert/strict'),L=require('../leaderboard.js');
async function run(assert,L){
 const record=(name='Rich',ms=23456,track='whiltonmill')=>({player_name:name,track_id:track,ruleset:L.RULESET,lap_ms:ms,lap_number:2,mode:'solo'});
 const memory=()=>{const m=new Map([['speedway_existing_times','preserve me']]);return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),m};};
 assert.equal(L.normaliseName('  Rich   126 '),'Rich 126');assert.throws(()=>L.normaliseName(' '));assert.throws(()=>L.normaliseName('a'.repeat(25)));assert.equal(L.normaliseName('🏁 Racer'),'🏁 Racer');
 assert(L.isStandard({slide:1.5,grip:.7,punish:2.6,fast:272},false));assert(!L.isStandard({slide:1.5,grip:.95,punish:2.6,fast:272},false));assert(!L.isStandard({slide:1.5,grip:.7,punish:2.6,fast:272},true));
 assert.deepEqual(L.fastestLap([24.1236,21.9876,22]),{lap_ms:21988,lap_number:2});assert.equal(L.fastestLap([NaN,0,Infinity]),null);assert.throws(()=>L.validate(record('Rich',-1)));assert.throws(()=>L.validate(record('Rich',12345,'speedway')));
 const storage=memory(),requests=[],statuses=[];let fail=true;
 const config={SUPABASE_URL:'https://example.invalid',SUPABASE_ANON_KEY:'public-test-key'};
 const mock=async(url,opts)=>{requests.push({url,opts});return fail?{ok:false,status:404}:{ok:true,status:200,json:async()=>url.includes('/rpc/')?null:[{player_name:'Rich',lap_ms:23456}]};};
 let c=L.create({config,storage,fetch:mock,onStatus:s=>statuses.push(s)});
 await c.sync();c.enqueue(record());c.enqueue(record('rich',25000));assert.equal(c.pending().length,1);assert(!await c.sync());assert.equal(c.pending().length,1);assert(statuses.some(s=>s.text.includes('one-time')));
 c=L.create({config,storage,fetch:mock});assert.equal(c.pending().length,1);c.enqueue(record('RICH',22000));assert.equal(c.pending()[0].lap_ms,22000);c.enqueue(record('Sam',21000));fail=false;assert(await c.sync());assert.equal(c.pending().length,0);const writes=requests.filter(r=>r.opts.method==='POST');assert(writes.every(r=>r.url.endsWith('/rpc/rallycross_submit_lap')));assert.equal(JSON.parse(writes.at(-2).opts.body).p_lap_ms,22000);
 await c.load('brandsrx');assert(requests.at(-1).url.includes('track_id=eq.brandsrx'));assert(!requests.some(r=>r.url.includes('speedway')));assert.equal(storage.getItem('speedway_existing_times'),'preserve me');
 let unblock;const waiting=new Promise(r=>unblock=r),sent=[];const d=L.create({config,storage:memory(),fetch:async(url,opts)=>{sent.push(JSON.parse(opts.body).p_lap_ms);if(sent.length===1)await waiting;return {ok:true,status:204};}});d.enqueue(record('Rich',25000));const first=d.sync(),second=d.sync();assert.equal(first,second);d.enqueue(record('Rich',20000));unblock();await first;assert.deepEqual(sent,[25000,20000]);assert.equal(d.pending().length,0);
 return 'PASS: names, standard handling, fastest split, offline queue/reload/retry, concurrent personal bests, track filtering and Speedway isolation';
}

run(assert,L).then(console.log).catch(e=>{console.error(e);process.exitCode=1;});


// Recent history retains slower laps independently from the best-only upload queue.
{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},config={};
 let client=L.create({config,storage,fetch:async()=>{throw Error('Offline');}});
 const lap=ms=>({player_name:'Rich',track_id:'whiltonmill',ruleset:L.RULESET,lap_ms:ms,lap_number:1,mode:'solo'});
 client.recordLap(lap(22000));client.recordLap(lap(25000));assert.equal(client.history('whiltonmill').length,2);assert.equal(client.pending().length,1);assert.equal(client.pending()[0].lap_ms,22000);
 client=L.create({config,storage,fetch:async()=>{throw Error('Offline');}});assert.equal(client.history().length,2,'Every recent lap survives reload');assert.equal(client.pending()[0].lap_ms,22000);
 console.log('PASS: slower completed laps retained in separate persistent lap history');
}
