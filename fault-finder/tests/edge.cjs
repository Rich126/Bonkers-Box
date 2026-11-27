const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('node:crypto'),C=require('../core.js'),E=require('../event.js');
(async()=>{const {replay,validName}=await import(path.resolve(__dirname,'../../supabase/functions/faultfinder-ranked/validator.mjs'));let handler,now=E.startsAt+3600000,challenge,tokenHash,submitted;
 const env={SUPABASE_URL:'https://database.invalid',SUPABASE_SECRET_KEYS:'{"default":"server-only-test-key"}',SUPABASE_PUBLISHABLE_KEYS:'{"default":"sb_publishable_test"}'};
 const Deno={env:{get:name=>env[name]},serve:fn=>{handler=fn;}},Clock=class extends Date{static now(){return now;}};
 const db=async(url,options)=>{assert.equal(options.headers.apikey,'server-only-test-key');const data=options.body?JSON.parse(options.body):null;let value;
  if(url.includes('rpc/faultfinder_begin')){challenge={ruleset:C.RULESET,seed:data.p_seed};tokenHash=data.p_token_hash;value={id:'44444444-4444-4444-8444-444444444444',challenge};}
  else if(url.includes('faultfinder_attempts?'))value=url.includes(tokenHash)?[{id:'44444444-4444-4444-8444-444444444444',challenge,expires_at:new Date(now+7200000).toISOString()}]:[];
  else if(url.includes('rpc/faultfinder_finish')){submitted=data;value={id:data.p_id,elapsed_ms:data.p_elapsed_ms,mistakes:data.p_mistakes};}
  else throw Error('Unexpected database request');return new Response(JSON.stringify(value),{status:200});};
 let source=stripTypeScriptTypes(fs.readFileSync(path.resolve(__dirname,'../../supabase/functions/faultfinder-ranked/index.ts'),'utf8')).replace(/^import .*;\n/gm,'');new Function('Deno','fetch','crypto','replay','validName','startsAt','endsAt','Date',source)(Deno,db,webcrypto,replay,validName,E.startsAt,E.endsAt,Clock);
 async function call(body,key='sb_publishable_test',origin='https://spencergames.co.uk'){return handler(new Request('https://edge.invalid',{method:'POST',headers:{apikey:key,Origin:origin},body:JSON.stringify(body)}));}
 assert.equal((await call({},'wrong')).status,401);assert.equal((await call({},'sb_publishable_test','https://evil.invalid')).status,403);assert.equal((await call({action:'start',name:' ',device:webcrypto.randomUUID()})).status,400);
 const response=await call({action:'start',name:'Rich126',device:webcrypto.randomUUID()});assert.equal(response.status,200);const session=await response.json();assert.equal(session.token.length,64);
 const s=C.create(challenge.seed),tick=seconds=>{for(let i=0;i<Math.ceil(seconds*20);i++)C.step(s,{},.05);},act=(m,a)=>{assert(C.startAction(s,m.id,a));tick(C.actions[a].seconds+.1);},remedy=(m,r)=>{if(r==='cycle'){act(m,'powerOff');act(m,'powerOn');}else{if(C.actions[r].off)act(m,'powerOff');act(m,r);if(!m.powered)act(m,'powerOn');}};
 for(const m of s.stations){C.close(s);tick(10);s.player.x=m.x;s.player.y=m.y+44;assert(C.open(s,m.id));act(m,'panel');for(const r of C.remedies(m))if(!m.attempted.includes(r))remedy(m,r);remedy(m,C.faults[m.fault].fix);act(m,'test');}
 const payload={action:'finish',id:session.id,token:session.token,events:s.trace};assert.equal((await call({...payload,elapsed_ms:1})).status,409);assert.equal((await call({...payload,token:'c'.repeat(64)})).status,409);assert.equal((await call({...payload,events:s.trace.slice(0,-1)})).status,409);
 const finish=await call(payload);assert.equal(finish.status,200);const result=await finish.json();assert.equal(result.checked,true);assert.equal(result.elapsed_ms,C.elapsedMs(s));assert.equal(submitted.p_active_ms,Math.round(s.clock*1000));assert.equal(submitted.p_mistakes,0);
 now=E.endsAt+1;assert.equal((await call({action:'start',name:'Rich126',device:webcrypto.randomUUID()})).status,409);
 console.log('PASS: Edge handler origin/API key gates, named challenge/token, derived completion time, refused client scores, bad token, incomplete replay and expired event.');
})().catch(e=>{console.error(e);process.exitCode=1;});
