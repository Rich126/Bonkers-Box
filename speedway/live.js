(function(){
'use strict';
const $=id=>document.getElementById(id);
const cfg=window.SPENCER_LIVE_CONFIG||{};
const configured=Boolean(window.supabase&&cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY);
const db=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}):null;
const panels=['choice','hostSetup','joinSetup','lobby','race','results'];
const COLORS=['#ef4444','#38bdf8','#facc15','#a78bfa'];
const HELMETS=['🔴','🔵','🟡','🟣'];
const COLOUR_NAMES=['Red','Blue','Yellow','Purple'];
const HOST_NAME_KEY='spencerSpeedwayHostNameV1',RIDER_NAME_KEY='spencerSpeedwayLiveNameV1',RIDER_COLOUR_KEY='spencerSpeedwaySoloColourV1';
const TRACK_N=520,TRACK_HALF=91;
let trackPts=[],room=null,riders=[],role=null,myId=null,channel=null;
let selectedColour=null,takenColours=new Set();
let bike=null,lapTimes=[],offTrackEvents=0,leftHeld=false,rightHeld=false,running=false,raf=0,lastTs=0,startTs=0,lapStartTs=0,lastPush=0,lastRaceNumber=0,finishing=false;
const canvas=$('track'),ctx=canvas.getContext('2d');
let sessionEpoch=0,pollTimer=0,refreshTimer=0,countdownTimer=0,hostRaf=0;
let armedKey='',startedKey='',roomStateKey='',syncEpoch=null,startBusy=false,resetBusy=false,finishBusy=false,stateWrite=null,pendingFinish=null;
function acceptRoom(data){
 if(room&&data.id===room.id){
  const incoming=Number(data.race_number||1),current=Number(room.race_number||1);
  const order={lobby:0,countdown:1,racing:2,finished:3,closed:4};
  if(incoming<current||(incoming===current&&order[data.status]<order[room.status]))return false;
 }
 room=data;return true;
}
function raceKey(){return room?[room.id,room.race_number,room.start_at].join(':'):'';}
function stopRaceTimers(){clearTimeout(countdownTimer);countdownTimer=0;armedKey=startedKey='';running=false;cancelAnimationFrame(raf);cancelAnimationFrame(hostRaf);hostViewRunning=false;press('left',false);press('right',false);}
function checkWrite(result){if(result.error)throw result.error;return result.data;}


function show(id){panels.forEach(x=>$(x).classList.toggle('hidden',x!==id));}
function cleanCode(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}
function cleanName(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,24);}
function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}
function formatMs(ms){if(ms===null||ms===undefined||!Number.isFinite(Number(ms)))return '—';return (Number(ms)/1000).toFixed(3)+'s';}
function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function msg(target,text,bad=true){target.innerHTML=text?'<div class="status '+(bad?'warn':'good')+'">'+escapeHtml(text)+'</div>':'';}
function setService(text,good=true){$('serviceStatus').textContent=text;$('serviceStatus').className='status '+(good?'good':'warn');}
function version(){return window.SPENCER_GAMES_VERSION||'v4.17';}
function renderColourChoices(){const box=$('liveColours');box.innerHTML='';COLORS.forEach((colour,index)=>{const button=document.createElement('button'),taken=takenColours.has(index);button.type='button';button.className='colourChoice'+(selectedColour===index?' selected':'')+(taken?' taken':'');button.style.setProperty('--bike-colour',colour);button.setAttribute('aria-label',COLOUR_NAMES[index]+' bike'+(taken?' — already taken':''));button.setAttribute('aria-pressed',selectedColour===index?'true':'false');button.disabled=taken;button.onclick=()=>{selectedColour=index;try{localStorage.setItem(RIDER_COLOUR_KEY,String(index));}catch(_){}renderColourChoices();msg($('joinMessage'),'');};box.appendChild(button);});}

function makeTrack(){trackPts=[];const cx=450,cy=323,halfStraight=195,r=135,straightLen=halfStraight*2,arcLen=Math.PI*r,total=straightLen*2+arcLen*2;for(let i=0;i<TRACK_N;i++){const d=i/TRACK_N*total;let x,y,a;if(d<straightLen){x=cx-halfStraight+d;y=cy+r;a=0}else if(d<straightLen+arcLen){const q=(d-straightLen)/r,ang=Math.PI/2-q;x=cx+halfStraight+r*Math.cos(ang);y=cy+r*Math.sin(ang);a=ang-Math.PI/2}else if(d<straightLen+arcLen+straightLen){const q2=d-straightLen-arcLen;x=cx+halfStraight-q2;y=cy-r;a=Math.PI}else{const q3=(d-straightLen-arcLen-straightLen)/r,ang2=-Math.PI/2-q3;x=cx-halfStraight+r*Math.cos(ang2);y=cy+r*Math.sin(ang2);a=ang2-Math.PI/2}trackPts.push({x,y,a});}}
function nearest(x,y){let best=1e9,idx=0;for(let i=0;i<trackPts.length;i++){const p=trackPts[i],dx=x-p.x,dy=y-p.y,d=dx*dx+dy*dy;if(d<best){best=d;idx=i}}return{idx,dist:Math.sqrt(best),p:trackPts[idx]};}
function angleDiff(a,b){return((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;}
makeTrack();

function drawStadium(){ctx.clearRect(0,0,900,650);ctx.fillStyle='#123527';ctx.fillRect(0,0,900,650);ctx.fillStyle='#071521';ctx.fillRect(0,0,900,58);ctx.fillRect(0,592,900,58);ctx.fillStyle='#ff6b1a';ctx.fillRect(0,55,900,3);ctx.fillRect(0,592,900,3);for(let i=0;i<34;i++){ctx.fillStyle=i%3===0?'#d7e0e7':i%3===1?'#e85b20':'#476984';ctx.fillRect(12+i*27,17+(i%2)*13,9,9);ctx.fillRect(12+i*27,612-(i%2)*13,9,9)}const path=new Path2D();path.moveTo(trackPts[0].x,trackPts[0].y);for(let j=1;j<trackPts.length;j++)path.lineTo(trackPts[j].x,trackPts[j].y);path.closePath();ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#dce4e9';ctx.lineWidth=224;ctx.stroke(path);ctx.strokeStyle='#4d2e20';ctx.lineWidth=216;ctx.stroke(path);ctx.strokeStyle='#9d6038';ctx.lineWidth=190;ctx.stroke(path);ctx.strokeStyle='rgba(53,28,18,.42)';ctx.lineWidth=5;ctx.setLineDash([19,25]);ctx.stroke(path);ctx.setLineDash([]);ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.84)';ctx.font='1000 31px sans-serif';ctx.fillText('SPENCER',450,304);ctx.fillStyle='#ff6b1a';ctx.font='1000 22px sans-serif';ctx.fillText('SPEEDWAY LIVE',450,331);ctx.fillStyle='rgba(220,228,233,.58)';ctx.font='800 11px sans-serif';ctx.fillText('SIMULTANEOUS ONLINE HEAT',450,351);const s=trackPts[0],nx=-Math.sin(s.a),ny=Math.cos(s.a);ctx.strokeStyle='#fff';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(s.x+nx*TRACK_HALF,s.y+ny*TRACK_HALF);ctx.lineTo(s.x-nx*TRACK_HALF,s.y-ny*TRACK_HALF);ctx.stroke();}
function drawBikeState(state,rider,label){if(!state)return;const h=Number(state.heading)||0,bias=((Number(rider.color_index)||0)-1.5)*7,x=Number(state.x)-Math.sin(h)*bias,y=Number(state.y)+Math.cos(h)*bias;ctx.save();ctx.translate(x,y);ctx.rotate(h);const steer=Number(state.steer)||0,va=Number(state.vel_angle)||h,lean=Math.max(-.55,Math.min(.55,steer*.42+angleDiff(va,h)*.7));ctx.rotate(lean*.22);ctx.shadowBlur=13;ctx.shadowColor=COLORS[rider.color_index]||'#fff';ctx.fillStyle='#151515';ctx.fillRect(-21,-7,42,14);ctx.fillStyle=COLORS[rider.color_index]||'#fff';ctx.fillRect(-9,-11,21,22);ctx.fillStyle='#d9d9d9';ctx.fillRect(-24,-4,8,8);ctx.fillRect(17,-4,8,8);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(1,-1,5.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(label){ctx.rotate(-h);ctx.font='900 17px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(5,18,30,.88)';ctx.beginPath();ctx.arc(0,-27,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(HELMETS[rider.color_index]||'🏍️',0,-27)}ctx.restore();}
function stateForRider(r){if(r.id===myId&&bike)return bike;return{x:r.x,y:r.y,heading:r.heading,vel_angle:r.vel_angle,speed:r.speed,steer:r.steer,progress_steps:r.progress_steps,lap:r.lap};}
function renderTrack(){drawStadium();const sorted=riders.slice().sort((a,b)=>Number(a.color_index)-Number(b.color_index));sorted.forEach(r=>drawBikeState(stateForRider(r),r,true));}

function renderRiders(){const box=$('riders');box.innerHTML='';if(!riders.length){box.innerHTML='<div class="note">Waiting for riders…</div>';return;}riders.slice().sort((a,b)=>a.color_index-b.color_index).forEach(r=>{const d=document.createElement('div');d.className='rider';d.innerHTML='<span class="dot" style="background:'+COLORS[r.color_index]+'"></span><div><b>'+escapeHtml(r.name)+(r.id===myId?' · YOU':'')+'</b><small>'+(r.finished?'Finished '+formatMs(r.finish_ms):'Ready in gate '+(r.color_index+1))+'</small></div>';box.appendChild(d);});}
function standingsOrder(){return riders.slice().sort((a,b)=>{if(a.finished&&b.finished)return Number(a.finish_ms)-Number(b.finish_ms);if(a.finished!==b.finished)return a.finished?-1:1;return Number(b.progress_steps)-Number(a.progress_steps);});}
function renderStandings(targetId){const box=$(targetId);box.innerHTML='';const order=standingsOrder();order.forEach((r,i)=>{const d=document.createElement('div');d.className='standing';const status=r.finished?formatMs(r.finish_ms):room&&room.status==='finished'?'DNF':('Lap '+Math.min((Number(r.lap)||0)+1,room?room.lap_count:3));d.innerHTML='<div class="place">'+(i+1)+'.</div><div><b><span style="color:'+COLORS[r.color_index]+'">'+(HELMETS[r.color_index]||'🏍️')+'</span> '+escapeHtml(r.name)+'</b><div class="note">Best '+formatMs(r.best_lap_ms)+'</div></div><div class="time">'+status+'</div>';box.appendChild(d);});if(role==='rider'&&myId){const pos=order.findIndex(r=>r.id===myId);$('positionHud').textContent=pos>=0?(pos+1)+' / '+order.length:'—';}}
function renderRoomQr(value){const box=$('roomQr');if(!box)return;box.innerHTML='';try{if(window.SpencerQR){window.SpencerQR.render(box,value);return;}}catch(e){console.error(e);}box.innerHTML='<div class="qrFallback">QR unavailable<br><small>Use code '+escapeHtml(room?room.code:'----')+'</small></div>';}
function renderLobby(){if(!room)return;$('roomCode').textContent=room.code;const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('v','4.19-speedway-2');url.searchParams.set('join',room.code);const joinUrl=url.toString();$('joinLink').textContent=joinUrl;$('qrRoomCode').textContent=room.code;const showQr=role==='host';$('qrJoin').classList.toggle('hidden',!showQr);if(showQr)renderRoomQr(joinUrl);renderRiders();$('hostLobbyTools').classList.toggle('hidden',role!=='host');$('startRace').disabled=role!=='host'||riders.length<2||riders.length>4||room.status!=='lobby';$('lobbyStatus').textContent=room.status==='lobby'?(riders.length<2?'Waiting for at least 2 riders…':riders.length+' riders ready · '+room.lap_count+' laps'):room.status.toUpperCase();show('lobby');}
function renderRace(){renderTrack();renderStandings('liveStandings');$('controls').classList.toggle('hidden',role!=='rider'||!running);$('hostRaceTools').classList.toggle('hidden',role!=='host');$('raceAgain').classList.toggle('hidden',!room||room.status!=='finished');if(role==='host')$('lapHud').textContent=room?room.lap_count+' laps':'—';show('race');}
function renderResults(){renderStandings('finalStandings');$('resultHostTools').classList.toggle('hidden',role!=='host');show('results');loadAllTimeBoard();}

async function loadAllTimeBoard(){const box=$('allTimeBoard');if(!box||!db){if(box)box.innerHTML='<div class="note">Online records unavailable.</div>';return;}const {data,error}=await db.from('speedway_fastest_laps').select('player_name,best_lap_ms,created_at').order('best_lap_ms',{ascending:true}).limit(100);if(error){box.innerHTML='<div class="note">Online records are unavailable. The host needs to check the online service.</div>';return;}const seen=new Set(),rows=[];(data||[]).forEach(r=>{const k=String(r.player_name).trim().toLowerCase();if(k&&!seen.has(k)){seen.add(k);rows.push(r);}});box.innerHTML='';rows.slice(0,10).forEach((r,i)=>{const d=document.createElement('div');d.className='boardRow';d.innerHTML='<span class="rank">'+(i+1)+'.</span><span class="name">'+escapeHtml(r.player_name)+'</span><span class="score">'+formatMs(r.best_lap_ms)+'</span>';box.appendChild(d);});if(!rows.length)box.innerHTML='<div class="note">No completed laps yet.</div>';}

async function loadRoom(){
 if(!room||!db)return false;const id=room.id,epoch=sessionEpoch;
 const {data,error}=await db.from('speedway_rooms').select('*').eq('id',id).maybeSingle();
 if(epoch!==sessionEpoch||!room||room.id!==id)return false;
 if(error)throw error;if(!data){await leaveLocal();return false;}acceptRoom(data);return true;
}
async function loadRiders(){
 if(!room||!db)return;const id=room.id,epoch=sessionEpoch;
 const {data,error}=await db.from('speedway_riders').select('*').eq('room_id',id).order('joined_at');
 if(epoch!==sessionEpoch||!room||room.id!==id)return;
 if(error)throw error;riders=data||[];
}
async function syncRoom(epoch=sessionEpoch){
 if(!room||epoch!==sessionEpoch||syncEpoch===epoch)return;syncEpoch=epoch;
 try{if(await loadRoom()){await handleRoomState();if(role==='host')await checkFinished();}}
 catch(e){if(epoch===sessionEpoch)setService('Room connection interrupted — retrying…',false);console.error(e);}
 finally{if(syncEpoch===epoch)syncEpoch=null;}
}
function refreshRidersSoon(epoch){
 if(refreshTimer)return;
 refreshTimer=setTimeout(async()=>{refreshTimer=0;if(epoch!==sessionEpoch||!room)return;
  try{await loadRiders();if(epoch!==sessionEpoch||!room)return;
   if(room.status==='lobby')renderLobby();else if(room.status==='finished')renderStandings('finalStandings');else{renderRace();if(role==='host')await checkFinished();}
  }catch(e){setService('Rider updates interrupted — retrying…',false);console.error(e);}
 },100);
}
async function subscribe(){
 const epoch=++sessionEpoch,id=room.id;clearInterval(pollTimer);clearTimeout(refreshTimer);refreshTimer=0;roomStateKey='';
 if(channel)await db.removeChannel(channel);
 if(epoch!==sessionEpoch||!room||room.id!==id)return;
 channel=db.channel('speedway-'+id)
 .on('postgres_changes',{event:'*',schema:'public',table:'speedway_rooms',filter:'id=eq.'+id},async payload=>{
  if(epoch!==sessionEpoch||!room||room.id!==id)return;
  if(payload.eventType==='DELETE'){await leaveLocal();return;}
  // Re-read authoritative state; delayed socket events must not restore an old heat.
  await syncRoom(epoch);
 })
 .on('postgres_changes',{event:'*',schema:'public',table:'speedway_riders',filter:'room_id=eq.'+id},()=>refreshRidersSoon(epoch))
 .subscribe(status=>{if(epoch!==sessionEpoch)return;setService(status==='SUBSCRIBED'?'Online · live updates connected':'Live updates interrupted · refreshing room',status==='SUBSCRIBED');});
 // Realtime is an optimization, not the only way a room can advance.
 pollTimer=setInterval(()=>syncRoom(epoch),1000);
 await syncRoom(epoch);
}
async function handleRoomState(){
 if(!room)return;const epoch=sessionEpoch,id=room.id;
 const key=[room.id,room.race_number,room.start_at,room.status].join(':');const changed=roomStateKey!==key;roomStateKey=key;
 if(room.status==='closed'){await leaveLocal();return;}
 await loadRiders();if(epoch!==sessionEpoch||!room||room.id!==id)return;
 if(room.status==='lobby'){
  if(changed){stopRaceTimers();finishing=false;pendingFinish=null;$('retryFinish').classList.add('hidden');resetLocalBike();}
  renderLobby();return;
 }
 if(room.status==='countdown'||room.status==='racing'){armRace();return;}
 if(room.status==='finished'){
  if(changed){stopRaceTimers();renderResults();}else renderStandings('finalStandings');
 }
}

async function createRoom(){msg($('hostMessage'),'');if(!db){msg($('hostMessage'),'Supabase is not configured.');return;}const host=cleanName($('hostName').value),laps=Number($('hostLaps').value)||3;if(!host){msg($('hostMessage'),'Enter the host name before creating a room.');$('hostName').focus();return;}try{localStorage.setItem(HOST_NAME_KEY,host);}catch(_){}$('createRoom').disabled=true;try{for(let i=0;i<8;i++){const code=randomCode();const {data,error}=await db.from('speedway_rooms').insert({code,host_name:host,lap_count:laps,status:'lobby'}).select('*').single();if(!error){room=data;role='host';myId=null;await loadRiders();await subscribe();return;}if(error.code!=='23505')throw error;}throw new Error('Could not create a unique room code.');}catch(e){msg($('hostMessage'),String(e.message||e).includes('speedway_rooms')?'Online rooms are unavailable. The host needs to check the online service.':String(e.message||e));}finally{$('createRoom').disabled=false;}}
async function joinRoom(){msg($('joinMessage'),'');if(!db){msg($('joinMessage'),'Supabase is not configured.');return;}const code=cleanCode($('joinCode').value),name=cleanName($('riderName').value);if(code.length!==4){msg($('joinMessage'),'Enter the four-character room code.');$('joinCode').focus();return;}if(!name){msg($('joinMessage'),'Enter your rider name.');$('riderName').focus();return;}if(selectedColour===null){msg($('joinMessage'),'Choose your bike colour.');return;}$('joinRoom').disabled=true;try{const {data:r,error}=await db.from('speedway_rooms').select('*').eq('code',code).eq('status','lobby').maybeSingle();if(error)throw error;if(!r)throw new Error('Room not found or no longer open.');room=r;const {data:existing,error:existingError}=await db.from('speedway_riders').select('color_index').eq('room_id',room.id);if(existingError)throw existingError;takenColours=new Set((existing||[]).map(x=>Number(x.color_index)));renderColourChoices();if(takenColours.has(selectedColour))throw new Error('That bike colour has just been taken. Pick another colour.');try{localStorage.setItem(RIDER_NAME_KEY,name);localStorage.setItem(RIDER_COLOUR_KEY,String(selectedColour));}catch(_){}const s=trackPts[0];const {data:joined,error:joinError}=await db.from('speedway_riders').insert({room_id:room.id,name,color_index:selectedColour,x:s.x,y:s.y}).select('*').single();if(joinError)throw joinError;role='rider';myId=joined.id;await loadRiders();await subscribe();}catch(e){const t=String(e.message||e);msg($('joinMessage'),/SPEEDWAY_ROOM_FULL/i.test(t)?'That heat already has four riders.':/SPEEDWAY_ROOM_NOT_OPEN/i.test(t)?'The tapes have already gone up for that room.':/speedway_rooms|speedway_riders/i.test(t)?'Online rooms are unavailable. The host needs to check the online service.':t);}finally{$('joinRoom').disabled=false;}}

function resetLocalBike(){if(role!=='rider')return;const s=trackPts[0];bike={x:s.x,y:s.y,heading:0,vel_angle:0,speed:0,steer:0,nearestIdx:0,progress_steps:0,lap:0,lastIdx:0,off:false,farOffTime:0,finished:false};lapTimes=[];offTrackEvents=0;leftHeld=rightHeld=false;$('bestHud').textContent='—';$('timeHud').textContent='0.000';$('positionHud').textContent='—';$('lapHud').textContent=room?'1 / '+room.lap_count:'—';}
async function resetRoomForHeat(){
 if(role!=='host'||!room||resetBusy||room.status!=='finished')return;const epoch=sessionEpoch,id=room.id,raceNumber=room.race_number;resetBusy=true;
 try{const s=trackPts[0];checkWrite(await db.from('speedway_riders').update({x:s.x,y:s.y,heading:0,vel_angle:0,speed:0,steer:0,progress_steps:0,lap:0,finished:false,finish_ms:null,best_lap_ms:null,updated_at:new Date().toISOString()}).eq('room_id',id));if(epoch!==sessionEpoch||!room||room.id!==id)return;
  const data=checkWrite(await db.from('speedway_rooms').update({status:'lobby',start_at:null,race_number:Number(raceNumber||1)+1,updated_at:new Date().toISOString()}).eq('id',id).select('*').single());if(epoch!==sessionEpoch||!room||room.id!==id)return;room=data;await handleRoomState();
 }catch(e){setService('Could not prepare the next heat. Please try again.',false);console.error(e);}finally{resetBusy=false;}
}
async function startRace(){
 if(role!=='host'||!room||startBusy||room.status!=='lobby')return;const epoch=sessionEpoch,id=room.id;startBusy=true;$('startRace').disabled=true;
 try{await loadRiders();if(epoch!==sessionEpoch||!room||room.id!==id)return;if(riders.length<2||riders.length>4)throw Error('A heat needs 2–4 riders.');
  const s=trackPts[0];checkWrite(await db.from('speedway_riders').update({x:s.x,y:s.y,heading:0,vel_angle:0,speed:0,steer:0,progress_steps:0,lap:0,finished:false,finish_ms:null,best_lap_ms:null,updated_at:new Date().toISOString()}).eq('room_id',id));if(epoch!==sessionEpoch||!room||room.id!==id)return;
  const startAt=new Date(Date.now()+4200).toISOString();
  const data=checkWrite(await db.from('speedway_rooms').update({status:'countdown',start_at:startAt,updated_at:new Date().toISOString()}).eq('id',id).eq('status','lobby').select('*').single());if(epoch!==sessionEpoch||!room||room.id!==id)return;room=data;await handleRoomState();
 }catch(e){setService('Could not start the heat. Please try again.',false);msg($('lobbyStatus'),String(e.message||e));console.error(e);}finally{startBusy=false;if(room&&room.status==='lobby')renderLobby();}
}
function armRace(){
 if(!room||!['countdown','racing'].includes(room.status))return;
 const key=raceKey(),epoch=sessionEpoch,startAt=Date.parse(room.start_at);
 if(!Number.isFinite(startAt)){setService('The heat has no valid start time. Ask the host to retry.',false);return;}
 renderRace();if(armedKey===key)return;
 clearTimeout(countdownTimer);armedKey=key;
 if(role==='rider'&&lastRaceNumber!==Number(room.race_number||1))resetLocalBike();lastRaceNumber=Number(room.race_number||1);
 const tick=async()=>{
  if(epoch!==sessionEpoch||!room||raceKey()!==key||!['countdown','racing'].includes(room.status))return;
  const left=startAt-Date.now();
  if(left>0){$('callout').textContent=String(Math.min(3,Math.ceil(left/1000)));$('raceMsg').textContent='Tapes ready…';countdownTimer=setTimeout(tick,100);return;}
  if(startedKey===key)return;startedKey=key;
  $('callout').textContent='GO!';setTimeout(()=>{if(raceKey()===key&&$('callout').textContent==='GO!')$('callout').textContent='';},500);
  if(role==='rider'&&!running&&!pendingFinish)beginLocalRace(startAt);
  if(role==='host'){
   hostLoop();
   if(room.status==='countdown')try{
    // Supabase builders are lazy: await the write so it is actually sent.
    const data=checkWrite(await db.from('speedway_rooms').update({status:'racing',updated_at:new Date().toISOString()}).eq('id',room.id).eq('race_number',room.race_number).eq('status','countdown').select('*').maybeSingle());
    if(data&&epoch===sessionEpoch&&raceKey()===key)room=data;
   }catch(e){armedKey=startedKey='';setService('Could not confirm the start — retrying…',false);console.error(e);}
  }
 };tick();
}
function beginLocalRace(scheduledStart=Date.parse(room.start_at)){
 if(!bike)resetLocalBike();running=true;finishing=false;pendingFinish=null;
 lastTs=performance.now();startTs=lastTs-Math.max(0,Date.now()-scheduledStart);lapStartTs=startTs;
 $('controls').classList.remove('hidden');$('raceMsg').textContent='GO — auto throttle!';raf=requestAnimationFrame(loop);
}

function updateProgress(nr,now){const N=trackPts.length,idx=nr.idx,last=bike.lastIdx,forward=(idx-last+N)%N,back=(last-idx+N)%N;if(nr.dist<126){if(forward>0&&forward<28){bike.progress_steps+=forward;bike.lastIdx=idx}else if(back<8){bike.lastIdx=idx}}const newLap=Math.floor(bike.progress_steps/N);if(newLap>bike.lap){bike.lap=newLap;const lt=now-lapStartTs;lapStartTs=now;lapTimes.push(lt);if(newLap<room.lap_count){$('callout').textContent='LAP '+(newLap+1);setTimeout(()=>{if(running)$('callout').textContent='';},500);$('raceMsg').textContent='Lap '+newLap+' · '+formatMs(lt);}else finishLocal(now);}}
function physics(dt,now){const steer=(leftHeld?-1:0)+(rightHeld?1:0);bike.steer+=(steer-bike.steer)*Math.min(1,dt*10);const nr=nearest(bike.x,bike.y),onShale=nr.dist<=TRACK_HALF,veryOff=nr.dist>128;let target=onShale?286:veryOff?103:158;if(Math.abs(bike.steer)>.75)target-=10;bike.speed+=(target-bike.speed)*Math.min(1,dt*(onShale?1.55:3.2));const steerRate=2.08*(.45+.55*Math.min(1,bike.speed/210));bike.heading+=bike.steer*steerRate*dt;const grip=onShale?1.72:2.5,vd=angleDiff(bike.vel_angle,bike.heading);bike.vel_angle+=vd*Math.min(1,grip*dt);bike.x+=Math.cos(bike.vel_angle)*bike.speed*dt;bike.y+=Math.sin(bike.vel_angle)*bike.speed*dt;if(!onShale&&!bike.off){bike.off=true;offTrackEvents++;}if(onShale&&bike.off)bike.off=false;if(veryOff){bike.farOffTime+=dt;if(bike.farOffTime>.45){bike.x+=(nr.p.x-bike.x)*Math.min(1,dt*2.6);bike.y+=(nr.p.y-bike.y)*Math.min(1,dt*2.6);bike.speed*=.985}}else bike.farOffTime=0;updateProgress(nr,now);}
async function pushState(force=false){
 if(!db||!room||!myId||!bike||(!running&&!force)||stateWrite)return;
 const now=Date.now();if(!force&&now-lastPush<100)return;lastPush=now;
 const id=myId,epoch=sessionEpoch,key=raceKey();
 const payload={x:bike.x,y:bike.y,heading:bike.heading,vel_angle:bike.vel_angle,speed:bike.speed,steer:bike.steer,progress_steps:bike.progress_steps,lap:bike.lap,best_lap_ms:lapTimes.length?Math.round(Math.min(...lapTimes)):null,updated_at:new Date().toISOString()};
 const write=(async()=>{checkWrite(await db.from('speedway_riders').update(payload).eq('id',id));})();stateWrite=write;
 try{await write;}catch(e){if(epoch===sessionEpoch&&raceKey()===key)setService('Your connection is interrupted — keep riding; retrying updates.',false);console.error(e);}
 finally{if(stateWrite===write)stateWrite=null;}
}

function loop(ts){if(!running)return;const dt=Math.min(.032,(ts-lastTs)/1000);lastTs=ts;physics(dt,ts);if(!running)return;const elapsed=ts-startTs;$('timeHud').textContent=(elapsed/1000).toFixed(3);$('lapHud').textContent=Math.min(room.lap_count,bike.lap+1)+' / '+room.lap_count;$('bestHud').textContent=lapTimes.length?formatMs(Math.min(...lapTimes)):'—';const mine=riders.find(r=>r.id===myId);if(mine){mine.x=bike.x;mine.y=bike.y;mine.heading=bike.heading;mine.vel_angle=bike.vel_angle;mine.speed=bike.speed;mine.steer=bike.steer;mine.progress_steps=bike.progress_steps;mine.lap=bike.lap;mine.best_lap_ms=lapTimes.length?Math.round(Math.min(...lapTimes)):null;}renderRace();pushState(false);raf=requestAnimationFrame(loop);}
async function finishLocal(now){
 if(finishing||(!running&&!pendingFinish))return;
 if(!pendingFinish){
  const total=Math.round(now-startTs),best=Math.round(Math.min(...lapTimes));
  pendingFinish={key:raceKey(),epoch:sessionEpoch,roomId:room.id,riderId:myId,raceNumber:room.race_number,total,best,lapCount:room.lap_count,lapTimes:lapTimes.map(Math.round),offTrackEvents,name:(riders.find(r=>r.id===myId)||{}).name||'Rider',riderSaved:false};
 }
 const finish=pendingFinish;finishing=true;running=false;cancelAnimationFrame(raf);leftHeld=rightHeld=false;
 $('controls').classList.add('hidden');$('callout').textContent='🏁 FINISH!';$('raceMsg').textContent='Saving finish…';
 try{
  if(stateWrite)try{await stateWrite;}catch(_){}
  if(finish.epoch!==sessionEpoch||raceKey()!==finish.key)return;
  if(!finish.riderSaved){checkWrite(await db.from('speedway_riders').update({x:bike.x,y:bike.y,heading:bike.heading,vel_angle:bike.vel_angle,speed:bike.speed,steer:bike.steer,progress_steps:bike.progress_steps,lap:finish.lapCount,finished:true,finish_ms:finish.total,best_lap_ms:finish.best,updated_at:new Date().toISOString()}).eq('id',finish.riderId));finish.riderSaved=true;bike.finished=true;}
  const saved=await db.from('speedway_results').insert({room_id:finish.roomId,rider_id:finish.riderId,race_number:finish.raceNumber,player_name:finish.name,mode:'live',lap_count:finish.lapCount,total_ms:finish.total,best_lap_ms:finish.best,lap_times_ms:finish.lapTimes,off_track_events:finish.offTrackEvents,app_version:version()});
  if(saved.error&&saved.error.code!=='23505')throw saved.error;
  if(finish.epoch!==sessionEpoch||raceKey()!==finish.key)return;
  pendingFinish=null;$('retryFinish').classList.add('hidden');$('raceMsg').textContent='Heat complete · '+formatMs(finish.total);
  await syncRoom();
 }catch(e){setService('Your finish could not be saved. Tap Retry saving finish.',false);$('retryFinish').classList.remove('hidden');console.error(e);}
 finally{finishing=false;}
}
let hostViewRunning=false;
function hostLoop(){
 if(role!=='host'||!room||!['countdown','racing'].includes(room.status)||hostViewRunning)return;
 hostViewRunning=true;const epoch=sessionEpoch;
 const tick=()=>{if(epoch!==sessionEpoch||role!=='host'||!room||!['countdown','racing'].includes(room.status)){hostViewRunning=false;return;}
  $('timeHud').textContent=Math.max(0,(Date.now()-Date.parse(room.start_at))/1000).toFixed(3);renderRace();hostRaf=requestAnimationFrame(tick);
 };hostRaf=requestAnimationFrame(tick);
}
async function checkFinished(){
 if(role!=='host'||!room||!['countdown','racing'].includes(room.status)||!riders.length||!riders.every(r=>r.finished)||finishBusy)return;
 const epoch=sessionEpoch,id=room.id;finishBusy=true;try{const data=checkWrite(await db.from('speedway_rooms').update({status:'finished',updated_at:new Date().toISOString()}).eq('id',id).eq('race_number',room.race_number).select('*').single());if(epoch!==sessionEpoch||!room||room.id!==id)return;room=data;await handleRoomState();}
 catch(e){setService('Could not confirm the result — retrying…',false);console.error(e);}finally{finishBusy=false;}
}
async function endRace(){if(role!=='host'||!room||finishBusy)return;const epoch=sessionEpoch,id=room.id;finishBusy=true;
 try{const data=checkWrite(await db.from('speedway_rooms').update({status:'finished',updated_at:new Date().toISOString()}).eq('id',id).select('*').single());if(epoch!==sessionEpoch||!room||room.id!==id)return;room=data;await handleRoomState();}
 catch(e){setService('Could not end the heat. Please try again.',false);console.error(e);}finally{finishBusy=false;}
}
async function closeRoom(){
 const epoch=sessionEpoch;
 if(role==='host'&&room&&db)try{checkWrite(await db.from('speedway_rooms').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',room.id));}catch(e){setService('Could not close the room. Please try again.',false);console.error(e);return;}
 if(epoch===sessionEpoch)await leaveLocal();
}
async function leave(){
 const epoch=sessionEpoch;
 if(role==='rider'&&myId&&db)try{checkWrite(await db.from('speedway_riders').delete().eq('id',myId));}catch(e){setService('Could not leave the room. Please try again.',false);console.error(e);return;}
 if(epoch===sessionEpoch)await leaveLocal();
}
async function leaveLocal(){
 ++sessionEpoch;clearInterval(pollTimer);clearTimeout(refreshTimer);pollTimer=refreshTimer=0;stopRaceTimers();
 const oldChannel=channel;channel=null;room=null;riders=[];role=null;myId=null;bike=null;pendingFinish=null;finishing=false;lastRaceNumber=0;stateWrite=null;roomStateKey='';$('retryFinish').classList.add('hidden');show('choice');
 if(oldChannel&&db)try{await db.removeChannel(oldChannel);}catch(_){}
}

function press(which,on){if(which==='left'){leftHeld=on;$('leftBtn').classList.toggle('active',on)}else{rightHeld=on;$('rightBtn').classList.toggle('active',on)}}
function bind(btn,which){
 const down=e=>{if(e.cancelable)e.preventDefault();if(e.pointerId!==undefined&&btn.setPointerCapture)try{btn.setPointerCapture(e.pointerId);}catch(_){}press(which,true);};
 const up=e=>{if(e.cancelable)e.preventDefault();press(which,false);};
 if(window.PointerEvent){btn.addEventListener('pointerdown',down,{passive:false});btn.addEventListener('pointerup',up,{passive:false});btn.addEventListener('pointercancel',up,{passive:false});btn.addEventListener('lostpointercapture',up);}
 else{btn.addEventListener('touchstart',down,{passive:false});btn.addEventListener('touchend',up,{passive:false});btn.addEventListener('touchcancel',up,{passive:false});}
 btn.addEventListener('contextmenu',e=>e.preventDefault());
}

bind($('leftBtn'),'left');bind($('rightBtn'),'right');
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();press('left',true)}if(e.key==='ArrowRight'){e.preventDefault();press('right',true)}});window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft')press('left',false);if(e.key==='ArrowRight')press('right',false)});

$('retryFinish').onclick=()=>finishLocal(performance.now());
window.addEventListener('blur',()=>{press('left',false);press('right',false);});
$('chooseHost').onclick=()=>show('hostSetup');$('chooseJoin').onclick=()=>show('joinSetup');document.querySelectorAll('.backChoice').forEach(b=>b.onclick=()=>show('choice'));
$('joinCode').addEventListener('input',e=>e.target.value=cleanCode(e.target.value));$('createRoom').onclick=createRoom;$('joinRoom').onclick=joinRoom;$('startRace').onclick=startRace;$('endRace').onclick=endRace;$('raceAgain').onclick=resetRoomForHeat;$('resultRaceAgain').onclick=resetRoomForHeat;$('closeRoom').onclick=closeRoom;$('resultClose').onclick=closeRoom;$('leaveRoom').onclick=leave;$('resultLeave').onclick=leave;
document.addEventListener('visibilitychange',()=>{if(document.hidden){press('left',false);press('right',false);}else syncRoom();});

try{const savedHost=localStorage.getItem(HOST_NAME_KEY),savedRider=localStorage.getItem(RIDER_NAME_KEY),savedColour=localStorage.getItem(RIDER_COLOUR_KEY);if(savedHost)$('hostName').value=cleanName(savedHost);if(savedRider)$('riderName').value=cleanName(savedRider);if(savedColour!==null&&Number(savedColour)>=0&&Number(savedColour)<COLORS.length)selectedColour=Number(savedColour);}catch(_){}renderColourChoices();
renderTrack();loadAllTimeBoard();
if(!configured)setService('Supabase not configured',false);else setService('Online service ready',true);
const params=new URLSearchParams(location.search),join=params.get('join'),mode=params.get('mode'),prefillName=params.get('name');if(prefillName)$('riderName').value=cleanName(prefillName);if(join){$('joinCode').value=cleanCode(join);show('joinSetup');}else if(mode==='host')show('hostSetup');else if(mode==='join')show('joinSetup');
})();

