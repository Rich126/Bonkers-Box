(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const cfg=window.SPENCER_LIVE_CONFIG||{};
  const configured=Boolean(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase);
  const db=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  const avatars=['🦊','🐙','🦁','🐸','🦄','🐼','🐯','🦖','🐵','🐧','🐨','🦈'];
  let selectedAvatar=avatars[0], roomId=null, roomCode=null, role=null, playerId=null, channel=null;

  function show(name){['choice','host','join','lobby'].forEach(x=>$('screen-'+x).classList.toggle('hidden',x!==name));}
  function msg(target,text,type='error'){target.innerHTML=text?'<div class="'+type+'">'+escapeHtml(text)+'</div>':'';}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function cleanName(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,24);}
  function cleanCode(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}
  function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}

  const status=$('service-status');
  if(configured){status.textContent='Online multiplayer service connected.';status.className='status good';}
  else{status.textContent='Spencer Live is not connected to its multiplayer service.';status.className='status warn';}

  const avatarBox=$('avatars');
  avatars.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='avatar'+(i===0?' selected':'');b.textContent=a;b.setAttribute('aria-label','Choose '+a+' avatar');b.addEventListener('click',()=>{selectedAvatar=a;avatarBox.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});avatarBox.appendChild(b);});

  $('choose-host').addEventListener('click',()=>show('host'));
  $('choose-join').addEventListener('click',()=>show('join'));
  document.querySelectorAll('.back-choice').forEach(b=>b.addEventListener('click',()=>show('choice')));
  $('join-code').addEventListener('input',e=>{e.target.value=cleanCode(e.target.value);});

  async function createRoom(){
    msg($('host-message'),'');
    if(!configured){msg($('host-message'),'Multiplayer service is not configured.');return;}
    const hostName=cleanName($('host-name').value)||'Host';
    $('create-room').disabled=true;
    try{
      let room=null, code=null;
      for(let attempt=0;attempt<8;attempt++){
        code=randomCode();
        const {data,error}=await db.from('rooms').insert({code,status:'lobby'}).select('id,code').single();
        if(!error){room=data;break;}
        if(error.code!=='23505') throw error;
      }
      if(!room) throw new Error('Could not create a unique room code. Please try again.');
      roomId=room.id; roomCode=room.code; role='host';
      const {data:host,error:hostError}=await db.from('players').insert({room_id:roomId,name:hostName,avatar:'⭐',score:0}).select('id').single();
      if(hostError){await db.from('rooms').delete().eq('id',roomId);throw hostError;}
      playerId=host.id;
      sessionStorage.setItem('spencer_live_room',JSON.stringify({roomId,roomCode,role,playerId}));
      await openLobby();
    }catch(e){msg($('host-message'),e.message||'Could not create room.');}
    finally{$('create-room').disabled=false;}
  }

  async function joinRoom(){
    msg($('join-message'),'');
    if(!configured){msg($('join-message'),'Multiplayer service is not configured.');return;}
    const code=cleanCode($('join-code').value), name=cleanName($('player-name').value);
    if(code.length!==4){msg($('join-message'),'Enter the 4-character room code.');return;}
    if(!name){msg($('join-message'),'Enter your name.');return;}
    $('join-room').disabled=true;
    try{
      const {data:room,error:roomError}=await db.from('rooms').select('id,code,status').eq('code',code).eq('status','lobby').maybeSingle();
      if(roomError) throw roomError;
      if(!room) throw new Error('Room not found or is no longer open.');
      const {data:player,error:playerError}=await db.from('players').insert({room_id:room.id,name,avatar:selectedAvatar,score:0}).select('id').single();
      if(playerError) throw playerError;
      roomId=room.id; roomCode=room.code; playerId=player.id; role='player';
      sessionStorage.setItem('spencer_live_room',JSON.stringify({roomId,roomCode,role,playerId}));
      await openLobby();
    }catch(e){msg($('join-message'),e.message||'Could not join room.');}
    finally{$('join-room').disabled=false;}
  }

  async function loadPlayers(){
    if(!db||!roomId)return;
    const {data,error}=await db.from('players').select('id,name,avatar,joined_at').eq('room_id',roomId).order('joined_at',{ascending:true});
    if(error){console.error(error);return;}
    const box=$('players'); $('player-count').textContent=data.length;
    box.innerHTML='';
    if(!data.length){box.innerHTML='<div class="empty">Waiting for players…</div>';return;}
    data.forEach(p=>{const d=document.createElement('div');d.className='player';d.innerHTML='<span class="face">'+escapeHtml(p.avatar||'🙂')+'</span><span class="name">'+escapeHtml(p.name)+'</span>';box.appendChild(d);});
  }

  async function openLobby(){
    $('room-code-display').textContent=roomCode;
    const url=new URL(window.location.href);url.search='';url.searchParams.set('join',roomCode);
    $('join-url').textContent=url.toString();
    $('lobby-title').textContent=role==='host'?'Your Spencer Live Lobby':'You’re in!';
    $('start-game').style.display=role==='host'?'block':'none';
    show('lobby');
    await loadPlayers();
    if(channel)await db.removeChannel(channel);
    channel=db.channel('spencer-room-'+roomId)
      .on('postgres_changes',{event:'*',schema:'public',table:'players',filter:'room_id=eq.'+roomId},()=>loadPlayers())
      .subscribe();
  }

  async function leave(){
    if(channel&&db)await db.removeChannel(channel);
    channel=null;
    // Phase 1 deliberately leaves the database row in place because delete access is not yet enabled.
    roomId=roomCode=role=playerId=null;
    sessionStorage.removeItem('spencer_live_room');
    show('choice');
  }

  $('create-room').addEventListener('click',createRoom);
  $('join-room').addEventListener('click',joinRoom);
  $('leave-lobby').addEventListener('click',leave);

  const params=new URLSearchParams(location.search), join=params.get('join'), mode=params.get('mode');
  if(join){$('join-code').value=cleanCode(join);show('join');}
  else if(mode==='host')show('host');
  else if(mode==='join')show('join');
})();
