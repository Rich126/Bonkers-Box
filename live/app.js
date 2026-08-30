(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const cfg=window.SPENCER_LIVE_CONFIG||{};
  const quiz=window.SPENCER_LIVE_QUIZ||{questions:[]};
  const configured=Boolean(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase);
  const db=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;

  const avatars=['🦊','🐙','🦁','🐸','🦄','🐼','🐯','🦖','🐵','🐧','🐨','🦈'];
  const ages=[['standard','Standard'],['5-7','5–7'],['8-11','8–11'],['12-15','12–15'],['16+','16+']];
  const teams=[['Red','🔴 Red'],['Blue','🔵 Blue'],['Green','🟢 Green'],['Yellow','🟡 Yellow']];
  let selectedAvatar=avatars[0], selectedAge='standard', selectedTeam='Red', selectedMode='individual';
  let roomId=null, roomCode=null, role=null, playerId=null, channel=null;
  let currentRoom=null, currentPlayers=[], currentAnswers=[];
  let joinRoomSettings=null, timerHandle=null, autoRevealBusy=false, joinLookupTimer=null;

  const screens=['choice','host','join','lobby','game','leaderboard','finished'];
  function show(name){screens.forEach(x=>$('screen-'+x).classList.toggle('hidden',x!==name));}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function cleanName(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,24);}
  function cleanCode(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}
  function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}
  function msg(target,text,type='error'){target.innerHTML=text?'<div class="'+type+'">'+escapeHtml(text)+'</div>':'';}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function settingsOf(room=currentRoom){const s=(room&&room.settings)||{};return {gameMode:s.gameMode==='teams'?'teams':'individual',adaptive:s.adaptive!==false,questionSeconds:clamp(Number(s.questionSeconds)||30,10,120)};}
  function gs(){return (currentRoom&&currentRoom.game_state)||{};}
  function isJunior(age){return age==='5-7'||age==='8-11';}
  function questionAt(i){return quiz.questions[Number(i)]||null;}
  function questionVariant(q,player){const s=settingsOf();return s.adaptive&&player&&isJunior(player.age_band)?'junior':'standard';}
  function myPlayer(){return currentPlayers.find(p=>p.id===playerId)||null;}
  function saveSession(){sessionStorage.setItem('spencer_live_room',JSON.stringify({roomId,roomCode,role,playerId}));}
  function clearSession(){sessionStorage.removeItem('spencer_live_room');}

  const serviceStatus=$('service-status');
  if(configured){serviceStatus.textContent='Online multiplayer connected. Phase 2 family quiz engine ready.';serviceStatus.className='status good';}
  else{serviceStatus.textContent='Spencer Live is not connected to its multiplayer service.';serviceStatus.className='status warn';}

  function buildChoiceButtons(){
    const avatarBox=$('avatars');
    avatars.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='avatar'+(i===0?' selected':'');b.textContent=a;b.setAttribute('aria-label','Choose '+a+' avatar');b.addEventListener('click',()=>{selectedAvatar=a;avatarBox.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});avatarBox.appendChild(b);});
    const ageBox=$('age-grid');
    ages.forEach(([value,label])=>{const b=document.createElement('button');b.type='button';b.className='age-btn'+(value==='standard'?' selected':'');b.textContent=label;b.addEventListener('click',()=>{selectedAge=value;ageBox.querySelectorAll('.age-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});ageBox.appendChild(b);});
    const teamBox=$('team-grid');
    teams.forEach(([value,label],i)=>{const b=document.createElement('button');b.type='button';b.className='team-btn'+(i===0?' selected':'');b.textContent=label;b.addEventListener('click',()=>{selectedTeam=value;teamBox.querySelectorAll('.team-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});teamBox.appendChild(b);});
    document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{selectedMode=b.dataset.mode;document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('selected',x===b));}));
  }
  buildChoiceButtons();

  $('choose-host').addEventListener('click',()=>show('host'));
  $('choose-join').addEventListener('click',()=>show('join'));
  document.querySelectorAll('.back-choice').forEach(b=>b.addEventListener('click',()=>show('choice')));
  $('join-code').addEventListener('input',e=>{e.target.value=cleanCode(e.target.value);clearTimeout(joinLookupTimer);joinLookupTimer=setTimeout(lookupJoinRoom,250);});

  async function lookupJoinRoom(){
    joinRoomSettings=null;$('team-row').classList.add('hidden');$('join-room-info').innerHTML='';
    if(!configured)return;
    const code=cleanCode($('join-code').value);if(code.length!==4)return;
    const {data,error}=await db.from('rooms').select('id,code,status,settings').eq('code',code).maybeSingle();
    if(error){console.error(error);return;}
    if(!data||data.status!=='lobby'){$('join-room-info').innerHTML='<div class="error">Room not found or no longer open.</div>';return;}
    const s=settingsOf(data);joinRoomSettings=s;
    $('join-room-info').innerHTML='<div class="room-info">Room found • '+(s.gameMode==='teams'?'Teams':'Individuals')+(s.adaptive?' • Family Adaptive':'')+'</div>';
    $('team-row').classList.toggle('hidden',s.gameMode!=='teams');
  }

  async function createRoom(){
    msg($('host-message'),'');if(!configured){msg($('host-message'),'Multiplayer service is not configured.');return;}
    const hostName=cleanName($('host-name').value)||'Host';
    const settings={gameMode:selectedMode,adaptive:$('adaptive').checked,questionSeconds:Number($('question-seconds').value)||30};
    $('create-room').disabled=true;
    try{
      let room=null;
      for(let attempt=0;attempt<8;attempt++){
        const code=randomCode();
        const {data,error}=await db.from('rooms').insert({code,status:'lobby',host_name:hostName,settings,game_state:{}}).select('*').single();
        if(!error){room=data;break;}
        if(error.code==='42703')throw new Error('Supabase needs the Phase 2 database upgrade. Run supabase/phase2.sql first.');
        if(error.code!=='23505')throw error;
      }
      if(!room)throw new Error('Could not create a unique room code. Please try again.');
      roomId=room.id;roomCode=room.code;role='host';playerId=null;currentRoom=room;saveSession();await subscribeRoom();await openExperience();
    }catch(e){msg($('host-message'),friendlyError(e));}
    finally{$('create-room').disabled=false;}
  }

  async function joinRoom(){
    msg($('join-message'),'');if(!configured){msg($('join-message'),'Multiplayer service is not configured.');return;}
    const code=cleanCode($('join-code').value),name=cleanName($('player-name').value);
    if(code.length!==4){msg($('join-message'),'Enter the 4-character room code.');return;}
    if(!name){msg($('join-message'),'Enter your name.');return;}
    $('join-room').disabled=true;
    try{
      const {data:room,error:roomError}=await db.from('rooms').select('*').eq('code',code).eq('status','lobby').maybeSingle();
      if(roomError)throw roomError;if(!room)throw new Error('Room not found or is no longer open.');
      const s=settingsOf(room);
      const {count,error:countError}=await db.from('players').select('*',{count:'exact',head:true}).eq('room_id',room.id);if(countError)throw countError;
      if((count||0)>=20)throw new Error('ROOM_FULL');
      const row={room_id:room.id,name,avatar:selectedAvatar,score:0,age_band:selectedAge,team:s.gameMode==='teams'?selectedTeam:null};
      const {data:player,error:playerError}=await db.from('players').insert(row).select('id').single();if(playerError)throw playerError;
      roomId=room.id;roomCode=room.code;playerId=player.id;role='player';currentRoom=room;saveSession();await subscribeRoom();await openExperience();
    }catch(e){msg($('join-message'),friendlyError(e));}
    finally{$('join-room').disabled=false;}
  }

  function friendlyError(e){const t=String((e&&e.message)||e||'');if(t.includes('ROOM_FULL'))return 'This room already has 20 players.';if(t.includes('ROOM_NOT_OPEN'))return 'That room has already started.';return t||'Something went wrong.';}

  async function loadRoom(){
    if(!db||!roomId)return false;
    const {data,error}=await db.from('rooms').select('*').eq('id',roomId).maybeSingle();if(error){console.error(error);return false;}
    if(!data||data.status==='closed'){await roomClosed();return false;}currentRoom=data;roomCode=data.code;return true;
  }
  async function loadPlayers(){
    if(!db||!roomId)return;
    const {data,error}=await db.from('players').select('id,name,avatar,score,age_band,team,joined_at').eq('room_id',roomId).order('joined_at',{ascending:true});if(error){console.error(error);return;}currentPlayers=data||[];
    if(role==='player'&&!currentPlayers.some(p=>p.id===playerId)){clearSession();return;}
    renderPlayers();renderHostAnswerCount();
  }
  async function loadAnswers(){
    if(!db||!roomId)return;const q=Number(gs().questionIndex);if(!Number.isFinite(q)){currentAnswers=[];return;}
    const {data,error}=await db.from('answers').select('*').eq('room_id',roomId).eq('question_index',q);if(error){console.error(error);return;}currentAnswers=data||[];renderHostAnswerCount();renderGame();
  }

  async function subscribeRoom(){
    if(channel&&db)await db.removeChannel(channel);
    channel=db.channel('spencer-live-'+roomId)
      .on('postgres_changes',{event:'*',schema:'public',table:'rooms',filter:'id=eq.'+roomId},async()=>{if(await loadRoom())await openExperience();})
      .on('postgres_changes',{event:'*',schema:'public',table:'players',filter:'room_id=eq.'+roomId},async()=>{await loadPlayers();if(currentRoom&&currentRoom.status!=='lobby')renderCurrentView();})
      .on('postgres_changes',{event:'*',schema:'public',table:'answers',filter:'room_id=eq.'+roomId},async()=>{await loadAnswers();})
      .subscribe();
  }

  async function openExperience(){
    if(!currentRoom&&!(await loadRoom()))return;await loadPlayers();
    if(currentRoom.status==='lobby'){currentAnswers=[];openLobby();return;}
    await loadAnswers();renderCurrentView();
  }

  function openLobby(){
    stopTimer();$('room-code-display').textContent=roomCode||'----';const url=new URL(window.location.href);url.search='';url.searchParams.set('join',roomCode||'');$('join-url').textContent=url.toString();
    $('lobby-title').textContent=role==='host'?'Your Spencer Live Lobby':'You’re in!';$('start-game').classList.toggle('hidden',role!=='host');$('start-game').disabled=role!=='host'||currentPlayers.length<1;
    const s=settingsOf();$('settings-summary').innerHTML='<span class="chip">'+(s.gameMode==='teams'?'👨‍👩‍👧‍👦 Teams':'👤 Individuals')+'</span><span class="chip">'+(s.adaptive?'🧒 Family Adaptive':'🧠 Same questions')+'</span><span class="chip">⏱ '+s.questionSeconds+' sec</span><span class="chip">✅ 800 + up to 200 speed</span>';
    $('lobby-note').textContent=role==='host'?'The host screen does not count toward the 20-player limit. Join separately from a phone if you want to play too.':'Waiting for the host to start the game…';show('lobby');renderPlayers();
  }

  function renderPlayers(){
    $('player-count').textContent=currentPlayers.length;const box=$('players');box.innerHTML='';
    if(!currentPlayers.length){box.innerHTML='<div class="empty">Waiting for players…</div>';return;}
    currentPlayers.forEach(p=>{const d=document.createElement('div');d.className='player';const meta=[p.age_band];if(p.team)meta.push(p.team+' team');d.innerHTML='<span class="face">'+escapeHtml(p.avatar||'🙂')+'</span><span><span class="name">'+escapeHtml(p.name)+'</span><small>'+escapeHtml(meta.join(' • '))+'</small></span>';box.appendChild(d);});
    if(role==='host')$('start-game').disabled=currentPlayers.length<1||currentPlayers.length>20;
  }

  async function startGame(){
    if(role!=='host'||!currentRoom||currentPlayers.length<1)return;$('start-game').disabled=true;
    try{await db.from('answers').delete().eq('room_id',roomId);await db.from('players').update({score:0}).eq('room_id',roomId);const state=newQuestionState(0);const {error}=await db.from('rooms').update({status:'playing',game_state:state,updated_at:new Date().toISOString()}).eq('id',roomId);if(error)throw error;}
    catch(e){serviceStatus.textContent=friendlyError(e);serviceStatus.className='status warn';$('start-game').disabled=false;}
  }
  function newQuestionState(index){return {phase:'question',questionIndex:index,startedAt:new Date().toISOString(),paused:false,pausedStartedAt:null,pauseMs:0};}

  function renderCurrentView(){
    if(!currentRoom)return;const state=gs();
    if(currentRoom.status==='finished'||state.phase==='finished'){renderFinished();return;}
    if(state.phase==='leaderboard'){renderLeaderboard();return;}
    renderGame();
  }

  function renderGame(){
    if(!currentRoom||currentRoom.status==='lobby')return;const state=gs(),q=questionAt(state.questionIndex);if(!q)return;
    show('game');$('round-category').textContent=q.category.toUpperCase();$('round-title').textContent='Question '+(Number(state.questionIndex)+1)+' of '+quiz.questions.length;$('round-progress').style.width=((Number(state.questionIndex)+1)/quiz.questions.length*100)+'%';
    const s=settingsOf();const host=role==='host';const player=myPlayer();const variant=host?'standard':questionVariant(q,player);const v=q[variant];
    $('host-adaptive-view').classList.toggle('hidden',!(host&&s.adaptive));
    if(host&&s.adaptive){$('host-adaptive-view').innerHTML='<div class="mini-q"><b>Junior • ages 5–11</b><span>'+escapeHtml(q.junior.question)+'</span></div><div class="mini-q"><b>Standard • ages 12+</b><span>'+escapeHtml(q.standard.question)+'</span></div>';$('question-level').textContent='Family Adaptive • players answer on their phones';$('question-text').textContent='Check your phones!';}
    else{$('host-adaptive-view').innerHTML='';$('question-level').textContent=host?'Everyone gets the same question':(variant==='junior'?'Junior question':'Standard question');$('question-text').textContent=v.question;}
    renderAnswers(host&&s.adaptive?null:v,state,host);renderAnswerStatus(v,state,host);renderHostAnswerCount();
    $('host-tools').classList.toggle('hidden',!host||state.phase!=='question');$('reveal-tools').classList.toggle('hidden',!host||state.phase!=='reveal');$('pause-game').textContent=state.paused?'▶ Resume':'⏸ Pause';startTimer();
  }

  function renderAnswers(v,state,host){
    const box=$('answers');box.innerHTML='';if(!v){box.classList.add('hidden');return;}box.classList.remove('hidden');
    const mine=currentAnswers.find(a=>a.player_id===playerId);const revealed=state.phase==='reveal';
    v.answers.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.className='answer '+['a','b','c','d'][i];b.textContent=label;
      if(mine&&mine.answer_index===i)b.classList.add('selected');if(revealed&&i===v.correct)b.classList.add('correct');if(revealed&&mine&&mine.answer_index===i&&!mine.is_correct)b.classList.add('wrong');
      b.disabled=host||role!=='player'||Boolean(mine)||state.phase!=='question'||state.paused||remainingMs()<=0;b.addEventListener('click',()=>submitAnswer(i));box.appendChild(b);});
  }

  function renderAnswerStatus(v,state,host){
    const target=$('answer-status');target.innerHTML='';if(host)return;
    const mine=currentAnswers.find(a=>a.player_id===playerId);
    if(state.paused){target.innerHTML='<div class="waiting">⏸ Game paused by the host.</div>';return;}
    if(state.phase==='question'){
      if(mine)target.innerHTML='<div class="waiting">Answer locked in! '+mine.points+' points if the scoring stands. Waiting for everyone else…</div>';
      else if(remainingMs()<=0)target.innerHTML='<div class="waiting">Time’s up! Waiting for the reveal…</div>';
      return;
    }
    if(state.phase==='reveal'){
      if(!mine){target.innerHTML='<div class="result-banner bad">Time’s up — no answer this round.</div>';return;}
      target.innerHTML='<div class="result-banner '+(mine.is_correct?'good':'bad')+'">'+(mine.is_correct?'✅ Correct! +'+mine.points+' points':'❌ Not this time — 0 points')+'</div>';
    }
  }

  async function submitAnswer(index){
    if(role!=='player'||!currentRoom)return;const state=gs();if(state.phase!=='question'||state.paused||remainingMs()<=0)return;const p=myPlayer(),q=questionAt(state.questionIndex);if(!p||!q)return;const variant=questionVariant(q,p),v=q[variant],isCorrect=index===v.correct;
    const duration=settingsOf().questionSeconds*1000;const response=clamp(Math.round(effectiveElapsedMs()),0,duration);const speed=isCorrect?Math.round(200*(1-response/duration)):0;const points=isCorrect?800+clamp(speed,0,200):0;
    const row={room_id:roomId,player_id:playerId,question_index:Number(state.questionIndex),variant,answer_index:index,is_correct:isCorrect,response_ms:response,points};
    const {error}=await db.from('answers').insert(row);if(error){if(error.code!=='23505')console.error(error);return;}
    const newScore=(Number(p.score)||0)+points;await db.from('players').update({score:newScore}).eq('id',playerId);await loadAnswers();
  }

  function effectiveElapsedMs(){const state=gs();if(!state.startedAt)return 0;const start=new Date(state.startedAt).getTime();let end=Date.now();let pauses=Number(state.pauseMs)||0;if(state.paused&&state.pausedStartedAt)end=new Date(state.pausedStartedAt).getTime();return Math.max(0,end-start-pauses);}
  function remainingMs(){return Math.max(0,settingsOf().questionSeconds*1000-effectiveElapsedMs());}
  function startTimer(){
    stopTimer();const update=()=>{const state=gs(),ms=remainingMs();$('timer').textContent=state.paused?'⏸':String(Math.ceil(ms/1000));if(role==='player'&&state.phase==='question')renderAnswers(questionAt(state.questionIndex)[questionVariant(questionAt(state.questionIndex),myPlayer())],state,false);if(role==='host'&&state.phase==='question'&&!state.paused&&ms<=0&&!autoRevealBusy){autoRevealBusy=true;revealRound().finally(()=>{autoRevealBusy=false;});}};update();timerHandle=setInterval(update,500);
  }
  function stopTimer(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;}}

  function renderHostAnswerCount(){
    const el=$('host-answer-count');if(!el)return;el.classList.toggle('hidden',role!=='host');if(role==='host')el.textContent='Answers: '+currentAnswers.length+' / '+currentPlayers.length;
  }

  async function updateGameState(next,status){if(role!=='host'||!currentRoom)return;const payload={game_state:next,updated_at:new Date().toISOString()};if(status)payload.status=status;const {error}=await db.from('rooms').update(payload).eq('id',roomId);if(error)throw error;}
  async function togglePause(){const state={...gs()};if(state.phase!=='question')return;if(!state.paused){state.paused=true;state.pausedStartedAt=new Date().toISOString();}else{const pausedAt=new Date(state.pausedStartedAt).getTime();state.pauseMs=(Number(state.pauseMs)||0)+Math.max(0,Date.now()-pausedAt);state.paused=false;state.pausedStartedAt=null;}await updateGameState(state);}
  async function revealRound(){const state={...gs()};if(state.phase!=='question')return;state.phase='reveal';if(state.paused&&state.pausedStartedAt){state.pauseMs=(Number(state.pauseMs)||0)+Math.max(0,Date.now()-new Date(state.pausedStartedAt).getTime());state.paused=false;state.pausedStartedAt=null;}await updateGameState(state);}
  async function showLeaderboard(){await updateGameState({...gs(),phase:'leaderboard'});}
  async function nextQuestion(){const next=Number(gs().questionIndex)+1;if(next>=quiz.questions.length){await finishGame();return;}currentAnswers=[];await updateGameState(newQuestionState(next));}
  async function skipQuestion(){await nextQuestion();}
  async function finishGame(){await updateGameState({...gs(),phase:'finished'},'finished');}

  function getLeaderboardRows(){
    const s=settingsOf();if(s.gameMode!=='teams')return currentPlayers.slice().sort((a,b)=>(b.score||0)-(a.score||0)).map(p=>({name:(p.avatar||'🙂')+' '+p.name,score:Number(p.score)||0}));
    const groups={};currentPlayers.forEach(p=>{const key=p.team||'No team';if(!groups[key])groups[key]=[];groups[key].push(Number(p.score)||0);});
    return Object.entries(groups).map(([name,scores])=>({name:name+' Team',score:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length),members:scores.length})).sort((a,b)=>b.score-a.score);
  }
  function fillLeaderboard(target){const rows=getLeaderboardRows(),box=$(target);box.innerHTML='';if(!rows.length){box.innerHTML='<div class="empty">No scores yet.</div>';return;}rows.forEach((r,i)=>{const d=document.createElement('div');d.className='leader-row';d.innerHTML='<span class="rank">'+(i+1)+'</span><span class="who">'+escapeHtml(r.name)+(r.members?' <small>('+r.members+')</small>':'')+'</span><span class="pts">'+r.score+' pts</span>';box.appendChild(d);});}
  function renderLeaderboard(){stopTimer();show('leaderboard');$('leaderboard-title').textContent='🏆 Leaderboard • Round '+(Number(gs().questionIndex)+1);fillLeaderboard('leaderboard');$('next-question').classList.toggle('hidden',role!=='host');$('player-wait-next').classList.toggle('hidden',role==='host');}
  function renderFinished(){stopTimer();show('finished');fillLeaderboard('final-leaderboard');$('play-again').classList.toggle('hidden',role!=='host');}
  async function playAgain(){if(role!=='host')return;await db.from('answers').delete().eq('room_id',roomId);await db.from('players').update({score:0}).eq('room_id',roomId);await updateGameState({},'lobby');}

  async function leave(){
    stopTimer();if(channel&&db)await db.removeChannel(channel);channel=null;
    if(db&&roomId){try{if(role==='player'&&playerId)await db.from('players').delete().eq('id',playerId);else if(role==='host')await db.from('rooms').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',roomId);}catch(e){console.error(e);}}
    roomId=roomCode=role=playerId=null;currentRoom=null;currentPlayers=[];currentAnswers=[];clearSession();show('choice');
  }
  async function roomClosed(){stopTimer();if(channel&&db)await db.removeChannel(channel);channel=null;clearSession();roomId=roomCode=role=playerId=null;currentRoom=null;currentPlayers=[];currentAnswers=[];serviceStatus.textContent='That Spencer Live room has closed.';serviceStatus.className='status warn';show('choice');}

  $('create-room').addEventListener('click',createRoom);$('join-room').addEventListener('click',joinRoom);$('leave-lobby').addEventListener('click',leave);$('start-game').addEventListener('click',startGame);
  $('pause-game').addEventListener('click',togglePause);$('reveal-now').addEventListener('click',revealRound);$('skip-question').addEventListener('click',skipQuestion);$('end-game').addEventListener('click',finishGame);$('show-leaderboard').addEventListener('click',showLeaderboard);$('next-question-direct').addEventListener('click',nextQuestion);$('next-question').addEventListener('click',nextQuestion);$('play-again').addEventListener('click',playAgain);$('finish-leave').addEventListener('click',leave);

  async function restore(){
    if(!configured)return false;let saved=null;try{saved=JSON.parse(sessionStorage.getItem('spencer_live_room')||'null');}catch(_){saved=null;}if(!saved||!saved.roomId||!saved.role)return false;
    roomId=saved.roomId;roomCode=saved.roomCode;role=saved.role;playerId=saved.playerId||null;
    if(!(await loadRoom()))return false;await loadPlayers();if(role==='player'&&!currentPlayers.some(p=>p.id===playerId)){clearSession();return false;}await subscribeRoom();await openExperience();return true;
  }

  const params=new URLSearchParams(location.search),join=params.get('join'),mode=params.get('mode');
  restore().then(restored=>{if(restored)return;if(join){$('join-code').value=cleanCode(join);show('join');lookupJoinRoom();}else if(mode==='host')show('host');else if(mode==='join')show('join');else show('choice');});
})();
