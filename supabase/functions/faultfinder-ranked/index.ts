import { replay, validName } from './validator.mjs';
import { startsAt, endsAt } from './window.mjs';
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
   if(Date.now()<startsAt||Date.now()>=endsAt)return reply({error:'Event closed'},409);
   const name=validName(data.name);if(name.length<2||typeof data.device!=='string'||!/^[a-f0-9-]{32,64}$/i.test(data.device))return reply({error:'Enter an engineer name'},400);
   const token=hex(crypto.getRandomValues(new Uint8Array(32))),seed=hex(crypto.getRandomValues(new Uint8Array(16)));
   const result=await db('rpc/faultfinder_begin','POST',{p_name:name,p_device_hash:await hash(data.device),p_token_hash:await hash(token),p_seed:seed});
   return reply({...result,token});
  }
  if(data.action==='finish'){
   if(['elapsed_ms','active_ms','score','cells_fixed'].some(key=>Object.prototype.hasOwnProperty.call(data,key)))return reply({error:'Client times are not accepted'},409);
   if(typeof data.id!=='string'||!/^[a-f0-9-]{36}$/i.test(data.id)||typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token))return reply({error:'Invalid run token'},400);
   const tokenHash=await hash(data.token),rows=await db('faultfinder_attempts?select=id,challenge,expires_at&id=eq.'+data.id+'&token_hash=eq.'+tokenHash+'&limit=1');
   if(!rows.length||Date.parse(rows[0].expires_at)<Date.now())return reply({error:'Run expired'},409);
   const result=replay(rows[0].challenge,data.events);
   const saved=await db('rpc/faultfinder_finish','POST',{p_id:data.id,p_token_hash:tokenHash,p_trace_hash:await hash(JSON.stringify(data.events)),p_elapsed_ms:result.elapsed_ms,p_active_ms:result.active_ms,p_mistakes:result.mistakes});
   return reply({id:saved.id,elapsed_ms:saved.elapsed_ms,mistakes:saved.mistakes,checked:true});
  }
  return reply({error:'Unknown action'},400);
 }catch(e){const message=e instanceof Error?e.message:'Records unavailable';const retry=/wait before/i.test(message),invalid=/replay|sequence|event|timing|expired|already used|challenge|service|console|travel|large|request/i.test(message);return reply({error:retry?'Wait before another run':invalid?'This shift could not be checked':'Records unavailable'},retry?429:invalid?409:503);}
});
