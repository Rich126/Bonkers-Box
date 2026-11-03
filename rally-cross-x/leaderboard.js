/* Rally Cross X only: independent tables and storage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RXLeaderboard=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const RULESET='rx-0.6.9-standard',QUEUE_KEY='spencer_rx_leaderboard_pending_v1';
const TRACKS=['brandsrx','daytonarx','tsukuba','daytonaoval','dirtbowl','snowpark','figure8','glacieroval','gravelrun','coastalgp','whiltonmill'];
function normaliseName(value){const name=String(value||'').normalize('NFC').trim().replace(/\s+/g,' ');if([...name].length<2||[...name].length>24||/[\u0000-\u001f\u007f]/.test(name))throw Error('Enter a driver name with 2–24 characters.');return name;}
function isStandard(tune,changed){return !changed&&!!tune&&Object.entries({slide:1.5,grip:.7,punish:2.6,fast:272}).every(([k,v])=>Math.abs(tune[k]-v)<1e-8);}
function fastestLap(splits){let best=null;for(let i=0;i<(splits||[]).length;i++){const ms=Math.round(splits[i]*1000);if(Number.isFinite(ms)&&ms>=1000&&ms<=900000&&(!best||ms<best.lap_ms))best={lap_ms:ms,lap_number:i+1};}return best;}
function validate(record){const r={player_name:normaliseName(record.player_name),track_id:record.track_id,ruleset:record.ruleset,lap_ms:record.lap_ms,lap_number:record.lap_number,mode:record.mode,app_version:'0.6.9'};if(!TRACKS.includes(r.track_id)||r.ruleset!==RULESET||!['solo','ai','local'].includes(r.mode)||!Number.isInteger(r.lap_ms)||r.lap_ms<1000||r.lap_ms>900000||!Number.isInteger(r.lap_number)||r.lap_number<1||r.lap_number>10)throw Error('Invalid Rally Cross lap.');return r;}
function create({config,storage,fetch:request,onStatus=()=>{}}){
 let pending=[],syncing=null;
 try{pending=JSON.parse(storage.getItem(QUEUE_KEY)||'[]').map(validate).slice(-80);}catch(_){pending=[];}
 const key=r=>r.track_id+'|'+r.ruleset+'|'+r.player_name.toLowerCase();
 function status(kind,text){onStatus({kind,text,pending:pending.length});}
 function persist(){try{storage.setItem(QUEUE_KEY,JSON.stringify(pending));}catch(_){status('warning','This browser cannot save pending laps. Keep the page open and retry.');}}
 function enqueue(record){const r=validate(record),old=pending.find(x=>key(x)===key(r));if(old&&old.lap_ms<=r.lap_ms)return;pending=pending.filter(x=>key(x)!==key(r));pending.push(r);persist();status('pending','Fastest lap saved on this device; waiting to upload.');}
 async function api(path,options={}){if(!config?.SUPABASE_URL||!config?.SUPABASE_ANON_KEY)throw Error('Online leaderboard is not configured. Your pending laps stay on this device.');const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);try{const response=await request(config.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+path,{...options,signal:abort.signal,headers:{apikey:config.SUPABASE_ANON_KEY,'Content-Type':'application/json',...options.headers}});if(!response.ok){if(response.status===404)throw Error('Online leaderboard needs its one-time Rally Cross database setup. Your pending laps are kept.');throw Error('Leaderboard unavailable. Your pending laps are kept; tap Retry upload.');}return response.status===204?null:await response.json();}finally{clearTimeout(timer);}}
 function sync(){if(syncing)return syncing;if(!pending.length)return Promise.resolve(true);syncing=(async()=>{try{while(pending.length){const r=pending[0];await api('rpc/rallycross_submit_lap',{method:'POST',body:JSON.stringify({p_player_name:r.player_name,p_track_id:r.track_id,p_ruleset:r.ruleset,p_lap_ms:r.lap_ms,p_lap_number:r.lap_number,p_mode:r.mode,p_app_version:r.app_version})});pending=pending.filter(x=>x!==r);persist();}status('saved','Leaderboard up to date. Only each driver’s fastest lap is kept.');return true;}catch(e){status('error',e.name==='AbortError'?'Upload timed out. Your lap is kept; tap Retry upload.':e.message);return false;}finally{syncing=null;}})();return syncing;}
 async function load(track){if(!TRACKS.includes(track))throw Error('Unknown circuit.');return api('rallycross_lap_records?select=player_name,lap_ms,lap_number,mode,updated_at&track_id=eq.'+encodeURIComponent(track)+'&ruleset=eq.'+RULESET+'&order=lap_ms.asc,updated_at.asc,player_name.asc&limit=50');}
 return {enqueue,sync,load,pending:()=>pending.map(r=>({...r}))};
}
return {RULESET,TRACKS,QUEUE_KEY,normaliseName,isStandard,fastestLap,validate,create};
});
