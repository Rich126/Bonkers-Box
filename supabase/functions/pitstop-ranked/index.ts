import { replay, validName } from './validator.mjs';
const URL=Deno.env.get('SUPABASE_URL')||'';
function mapEnv(name:string){try{return JSON.parse(Deno.env.get(name)||'{}');}catch{return {};}}
const secretValues=mapEnv('SUPABASE_SECRET_KEYS');
const ADMIN=secretValues.default||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const published=Object.values(mapEnv('SUPABASE_PUBLISHABLE_KEYS')).map((v:any)=>String(v).startsWith('sb_')?String(v):Deno.env.get(String(v))).filter(Boolean);
const KEYS=new Set([...published,Deno.env.get('SUPABASE_ANON_KEY')].filter(Boolean));
const origins=new Set(['https://spencergames.co.uk','https://www.spencergames.co.uk','https://rich126.github.io']);
const cors={'Access-Control-Allow-Headers':'apikey, content-type, authorization','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};
const hex=(bytes:Uint8Array)=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
const hash=async(s:string)=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
async function db(path:string,method='GET',body?:unknown){const headers:Record<string,string>={apikey:ADMIN,'Content-Type':'application/json'};if(ADMIN.startsWith('eyJ'))headers.Authorization='Bearer '+ADMIN;const r=await fetch(URL+'/rest/v1/'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.message||'Run service unavailable');return data;}
async function body(req:Request){if(!req.body)throw Error('Missing request');const reader=req.body.getReader();const chunks:Uint8Array[]=[];let total=0;while(true){const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>65536){await reader.cancel();throw Error('Replay too large');}chunks.push(part.value);}const all=new Uint8Array(total);let at=0;for(const c of chunks){all.set(c,at);at+=c.length;}return JSON.parse(new TextDecoder().decode(all));}
Deno.serve(async(req:Request)=>{const origin=req.headers.get('Origin')||'';const headers:Record<string,string>={...cors,'Content-Type':'application/json','Cache-Control':'no-store'};if(origins.has(origin))headers['Access-Control-Allow-Origin']=origin;const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
 if(origin&&!origins.has(origin))return reply({error:'Origin not allowed'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'POST required'},405);
 if(!KEYS.has(req.headers.get('apikey')||''))return reply({error:'Invalid API key'},401);
 try{const data=await body(req);
  if(data.action==='start'){
   const name=validName(data.name);if(name.length<2||typeof data.device!=='string'||!/^[a-f0-9-]{32,64}$/i.test(data.device))return reply({error:'Enter a valid crew name'},400);
   const order=[0,1,2,3];for(let i=3;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[order[i],order[j]]=[order[j],order[i]];}
   const token=hex(crypto.getRandomValues(new Uint8Array(32)));const result=await db('rpc/pitstop_ranked_begin','POST',{p_name:name,p_device_hash:await hash(data.device),p_token_hash:await hash(token),p_order:order,p_arrival_ms:2000+crypto.getRandomValues(new Uint32Array(1))[0]%3001});
   return reply({...result,token});
  }
  if(data.action==='finish'){
   if(['raw_ms','total_ms','early_count'].some(key=>Object.prototype.hasOwnProperty.call(data,key)))return reply({error:'Client scores are not accepted',code:'tampered'},409);
   if(typeof data.id!=='string'||!/^[a-f0-9-]{36}$/i.test(data.id)||typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token))return reply({error:'Invalid run token'},400);
   const tokenHash=await hash(data.token);const rows=await db('pitstop_ranked_attempts?select=id,challenge,expires_at&id=eq.'+data.id+'&token_hash=eq.'+tokenHash+'&limit=1');
   if(!rows.length||Date.parse(rows[0].expires_at)<Date.now())return reply({error:'Run expired. Start a new stop.'},409);
   const score=replay(rows[0].challenge,data.events);const result=await db('rpc/pitstop_ranked_finish','POST',{p_id:data.id,p_token_hash:tokenHash,p_trace_hash:await hash(JSON.stringify(data.events)),p_raw_ms:score.raw_ms,p_early_count:score.early_count,p_duration_ms:score.duration_ms});
   return reply({id:result.id,raw_ms:result.raw_ms,early_count:result.early_count,total_ms:result.total_ms,ruleset:result.ruleset,checked:true});
  }
  return reply({error:'Unknown action'},400);
 }catch(e){const message=e instanceof Error?e.message:'Run service unavailable';const retry=/wait before/i.test(message);const invalid=/replay|sequence|event|release|timing|expired|already used|no longer|wheel|challenge|press|large|request/i.test(message);return reply({error:retry?'Please wait a moment before another checked run.':invalid?'This run could not be checked. Start a new stop.':'Run service unavailable. Try again.'},retry?429:invalid?409:503);}
});
