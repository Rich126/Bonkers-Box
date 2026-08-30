(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const cfg=window.SPENCER_LIVE_CONFIG||{};
  const quiz=window.SPENCER_LIVE_QUIZ||{questions:[]};
  const creative=window.SPENCER_LIVE_CREATIVE||{rounds:[]};
  const configured=Boolean(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase);
  const db=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  const MEDIA_BUCKET='spencer-live-media';

  const avatars=['🦊','🐙','🦁','🐸','🦄','🐼','🐯','🦖','🐵','🐧','🐨','🦈'];
  const ages=[['standard','Standard'],['5-7','5–7'],['8-11','8–11'],['12-15','12–15'],['16+','16+']];
  const teams=[['Red','🔴 Red'],['Blue','🔵 Blue'],['Green','🟢 Green'],['Yellow','🟡 Yellow']];
  let selectedAvatar=avatars[0], selectedAge='standard', selectedTeam='Red', selectedMode='individual', selectedGame='quiz';
  let roomId=null, roomCode=null, role=null, playerId=null, channel=null;
  let currentRoom=null, currentPlayers=[], currentAnswers=[], currentSubmissions=[], currentVotes=[];
  let joinRoomSettings=null, timerHandle=null, creativeTimerHandle=null, autoRevealBusy=false, joinLookupTimer=null;
  let mediaStream=null, mediaRecorder=null, mediaChunks=[], recordingStopTimer=null;
  let pendingMediaBlob=null, pendingMediaMime='', pendingMediaUrl='', captureRoundKey='';
  const mediaUrlCache=new Map();
  let renderSerial=0;

  const screens=['choice','host','join','lobby','game','creative-capture','creative-vote','creative-result','leaderboard','finished'];
  function show(name){screens.forEach(x=>{const el=$('screen-'+x);if(el)el.classList.toggle('hidden',x!==name);});}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function cleanName(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,24);}
  function cleanCode(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}
  function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}
  function msg(target,text,type='error'){target.innerHTML=text?'<div class="'+type+'">'+escapeHtml(text)+'</div>':'';}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function settingsOf(room=currentRoom){const s=(room&&room.settings)||{};return {gameMode:s.gameMode==='teams'?'teams':'individual',adaptive:s.adaptive!==false,questionSeconds:clamp(Number(s.questionSeconds)||30,10,120),gameKey:s.gameKey==='creative'?'creative':'quiz'};}
  function gs(){return (currentRoom&&currentRoom.game_state)||{};}
  function isJunior(age){return age==='5-7'||age==='8-11';}
  function questionAt(i){return quiz.questions[Number(i)]||null;}
  function creativeAt(i){return creative.rounds[Number(i)]||null;}
  function questionVariant(q,player){const s=settingsOf();return s.adaptive&&player&&isJunior(player.age_band)?'junior':'standard';}
  function myPlayer(){return currentPlayers.find(p=>p.id===playerId)||null;}
  function saveSession(){sessionStorage.setItem('spencer_live_room',JSON.stringify({roomId,roomCode,role,playerId}));}
  function clearSession(){sessionStorage.removeItem('spencer_live_room');}
  function gameName(key=settingsOf().gameKey){return key==='creative'?'Creative Party':'Family Quick Quiz';}
  function isCreativeState(state=gs()){return String(state.phase||'').startsWith('creative_');}

  const serviceStatus=$('service-status');
  if(configured){serviceStatus.textContent='Online multiplayer connected. Phase 3 creative rounds ready.';serviceStatus.className='status good';}
  else{serviceStatus.textContent='Spencer Live is not connected to its multiplayer service.';serviceStatus.className='status warn';}

  function buildChoiceButtons(){
    const avatarBox=$('avatars');
    avatars.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='avatar'+(i===0?' selected':'');b.textContent=a;b.setAttribute('aria-label','Choose '+a+' avatar');b.addEventListener('click',()=>{selectedAvatar=a;avatarBox.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});avatarBox.appendChild(b);});
    const ageBox=$('age-grid');
    ages.forEach(([value,label])=>{const b=document.createElement('button');b.type='button';b.className='age-btn'+(value==='standard'?' selected':'');b.textContent=label;b.addEventListener('click',()=>{selectedAge=value;ageBox.querySelectorAll('.age-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});ageBox.appendChild(b);});
    const teamBox=$('team-grid');
    teams.forEach(([value,label],i)=>{const b=document.createElement('button');b.type='button';b.className='team-btn'+(i===0?' selected':'');b.textContent=label;b.addEventListener('click',()=>{selectedTeam=value;teamBox.querySelectorAll('.team-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});teamBox.appendChild(b);});
    document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{selectedMode=b.dataset.mode;document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('selected',x===b));}));
    document.querySelectorAll('.game-btn').forEach(b=>b.addEventListener('click',()=>{selectedGame=b.dataset.game==='creative'?'creative':'quiz';document.querySelectorAll('.game-btn').forEach(x=>x.classList.toggle('selected',x===b));}));
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
    $('join-room-info').innerHTML='<div class="room-info">Room found • '+escapeHtml(gameName(s.gameKey))+' • '+(s.gameMode==='teams'?'Teams':'Individuals')+(s.gameKey==='quiz'&&s.adaptive?' • Family Adaptive':'')+'</div>';
    $('team-row').classList.toggle('hidden',s.gameMode!=='teams');
  }

  async function assertPhase3Ready(){
    const {error}=await db.from('creative_submissions').select('id',{head:true,count:'exact'}).limit(1);
    if(error)throw new Error('Supabase needs the Phase 3 upgrade. Run supabase/phase3.sql first.');
  }

  async function createRoom(){
    msg($('host-message'),'');if(!configured){msg($('host-message'),'Multiplayer service is not configured.');return;}
    const hostName=cleanName($('host-name').value)||'Host';
    const settings={gameMode:selectedMode,adaptive:$('adaptive').checked,questionSeconds:Number($('question-seconds').value)||30,gameKey:selectedGame};
    $('create-room').disabled=true;
    try{
      if(selectedGame==='creative')await assertPhase3Ready();
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
      const s=settingsOf(room);if(s.gameKey==='creative')await assertPhase3Ready();
      const {count,error:countError}=await db.from('players').select('*',{count:'exact',head:true}).eq('room_id',room.id);if(countError)throw countError;
      if((count||0)>=20)throw new Error('ROOM_FULL');
      const row={room_id:room.id,name,avatar:selectedAvatar,score:0,age_band:selectedAge,team:s.gameMode==='teams'?selectedTeam:null};
      const {data:player,error:playerError}=await db.from('players').insert(row).select('id').single();if(playerError)throw playerError;
      roomId=room.id;roomCode=room.code;playerId=player.id;role='player';currentRoom=room;saveSession();await subscribeRoom();await openExperience();
    }catch(e){msg($('join-message'),friendlyError(e));}
    finally{$('join-room').disabled=false;}
  }

  function friendlyError(e){const t=String((e&&e.message)||e||'');if(t.includes('ROOM_FULL'))return 'This room already has 20 players.';if(t.includes('ROOM_NOT_OPEN'))return 'That room has already started.';if(t.includes('SELF_VOTE'))return 'You cannot vote for your own submission.';if(t.includes('INVALID_VOTE'))return 'That vote is not valid for this round.';if(t.includes('creative_submissions')||t.includes('Phase 3'))return 'Supabase needs the Phase 3 upgrade. Run supabase/phase3.sql first.';return t||'Something went wrong.';}

  async function loadRoom(){
    if(!db||!roomId)return false;
    const {data,error}=await db.from('rooms').select('*').eq('id',roomId).maybeSingle();if(error){console.error(error);return false;}
    if(!data||data.status==='closed'){await roomClosed();return false;}currentRoom=data;roomCode=data.code;return true;
  }
  async function loadPlayers(){
    if(!db||!roomId)return;
    const {data,error}=await db.from('players').select('id,name,avatar,score,age_band,team,joined_at').eq('room_id',roomId).order('joined_at',{ascending:true});if(error){console.error(error);return;}currentPlayers=data||[];
    if(role==='player'&&!currentPlayers.some(p=>p.id===playerId)){clearSession();return;}
    renderPlayers();renderHostAnswerCount();renderCreativeCounts();
  }
  async function loadAnswers(){
    if(!db||!roomId)return;const q=Number(gs().questionIndex);if(!Number.isFinite(q)){currentAnswers=[];return;}
    const {data,error}=await db.from('answers').select('*').eq('room_id',roomId).eq('question_index',q);if(error){console.error(error);return;}currentAnswers=data||[];renderHostAnswerCount();if(settingsOf().gameKey==='quiz')renderGame();
  }
  async function loadCreativeData(){
    if(!db||!roomId)return;const r=Number(gs().creativeIndex);if(!Number.isFinite(r)){currentSubmissions=[];currentVotes=[];return;}
    const [{data:subs,error:subErr},{data:votes,error:voteErr}]=await Promise.all([
      db.from('creative_submissions').select('*').eq('room_id',roomId).eq('round_index',r).order('submitted_at',{ascending:true}),
      db.from('creative_votes').select('*').eq('room_id',roomId).eq('round_index',r)
    ]);
    if(subErr){console.error(subErr);return;}if(voteErr){console.error(voteErr);return;}
    currentSubmissions=subs||[];currentVotes=votes||[];renderCreativeCounts();if(settingsOf().gameKey==='creative')renderCurrentView();
  }

  async function subscribeRoom(){
    if(channel&&db)await db.removeChannel(channel);
    channel=db.channel('spencer-live-'+roomId)
      .on('postgres_changes',{event:'*',schema:'public',table:'rooms',filter:'id=eq.'+roomId},async()=>{if(await loadRoom())await openExperience();})
      .on('postgres_changes',{event:'*',schema:'public',table:'players',filter:'room_id=eq.'+roomId},async()=>{await loadPlayers();if(currentRoom&&currentRoom.status!=='lobby')renderCurrentView();})
      .on('postgres_changes',{event:'*',schema:'public',table:'answers',filter:'room_id=eq.'+roomId},async()=>{if(settingsOf().gameKey==='quiz')await loadAnswers();})
      .on('postgres_changes',{event:'*',schema:'public',table:'creative_submissions',filter:'room_id=eq.'+roomId},async()=>{if(settingsOf().gameKey==='creative')await loadCreativeData();})
      .on('postgres_changes',{event:'*',schema:'public',table:'creative_votes',filter:'room_id=eq.'+roomId},async()=>{if(settingsOf().gameKey==='creative')await loadCreativeData();})
      .subscribe();
  }

  async function openExperience(){
    if(!currentRoom&&!(await loadRoom()))return;await loadPlayers();
    if(currentRoom.status==='lobby'){currentAnswers=[];currentSubmissions=[];currentVotes=[];openLobby();return;}
    if(settingsOf().gameKey==='creative')await loadCreativeData();else await loadAnswers();renderCurrentView();
  }

  function openLobby(){
    stopTimers();stopAllMedia();$('room-code-display').textContent=roomCode||'----';const url=new URL(window.location.href);url.search='';url.searchParams.set('join',roomCode||'');$('join-url').textContent=url.toString();
    $('lobby-title').textContent=role==='host'?'Your Spencer Live Lobby':'You’re in!';$('start-game').classList.toggle('hidden',role!=='host');$('start-game').disabled=role!=='host'||currentPlayers.length<1;
    const s=settingsOf();$('start-game').textContent='Start '+gameName(s.gameKey);
    const chips=['<span class="chip">'+(s.gameMode==='teams'?'👨‍👩‍👧‍👦 Teams':'👤 Individuals')+'</span>','<span class="chip">🎮 '+escapeHtml(gameName(s.gameKey))+'</span>'];
    if(s.gameKey==='quiz'){chips.push('<span class="chip">'+(s.adaptive?'🧒 Family Adaptive':'🧠 Same questions')+'</span>','<span class="chip">⏱ '+s.questionSeconds+' sec</span>','<span class="chip">✅ 800 + up to 200 speed</span>');}
    else chips.push('<span class="chip">📸 Camera</span>','<span class="chip">🎙️ Microphone</span>','<span class="chip">🗳️ Anonymous voting</span>');
    $('settings-summary').innerHTML=chips.join('');
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
    try{
      await db.from('answers').delete().eq('room_id',roomId);await db.from('players').update({score:0}).eq('room_id',roomId);
      let state;
      if(settingsOf().gameKey==='creative'){
        await assertPhase3Ready();await cleanupCreativeMedia(true);state=newCreativeCaptureState(0);
      }else state=newQuestionState(0);
      const {error}=await db.from('rooms').update({status:'playing',game_state:state,updated_at:new Date().toISOString()}).eq('id',roomId);if(error)throw error;
    }catch(e){serviceStatus.textContent=friendlyError(e);serviceStatus.className='status warn';$('start-game').disabled=false;}
  }
  function newQuestionState(index){return {phase:'question',questionIndex:index,startedAt:new Date().toISOString(),paused:false,pausedStartedAt:null,pauseMs:0};}
  function newCreativeCaptureState(index){const r=creativeAt(index);return {phase:'creative_capture',creativeIndex:index,kind:r?r.kind:'picture',startedAt:new Date().toISOString(),voteStage:null,heatIndex:0,heatGroups:[],finalists:[],candidateIds:[],stageKey:null,lastWinners:[],stageVoteCounts:{},scored:false};}

  function renderCurrentView(){
    if(!currentRoom)return;const state=gs();
    if(currentRoom.status==='finished'||state.phase==='finished'){renderFinished();return;}
    if(state.phase==='leaderboard'){renderLeaderboard();return;}
    if(settingsOf().gameKey==='creative'||isCreativeState(state)){renderCreativeView();return;}
    renderGame();
  }

  // ---------------- Quiz engine (Phase 2) ----------------
  function renderGame(){
    if(!currentRoom||currentRoom.status==='lobby')return;const state=gs(),q=questionAt(state.questionIndex);if(!q)return;
    show('game');$('round-category').textContent=q.category.toUpperCase();$('round-title').textContent='Question '+(Number(state.questionIndex)+1)+' of '+quiz.questions.length;$('round-progress').style.width=((Number(state.questionIndex)+1)/quiz.questions.length*100)+'%';
    const s=settingsOf();const host=role==='host';const player=myPlayer();const variant=host?'standard':questionVariant(q,player);const v=q[variant];
    $('host-adaptive-view').classList.toggle('hidden',!(host&&s.adaptive));
    if(host&&s.adaptive){$('host-adaptive-view').innerHTML='<div class="mini-q"><b>Junior • ages 5–11</b><span>'+escapeHtml(q.junior.question)+'</span></div><div class="mini-q"><b>Standard • ages 12+</b><span>'+escapeHtml(q.standard.question)+'</span></div>';$('question-level').textContent='Family Adaptive • players answer on their phones';$('question-text').textContent='Check your phones!';}
    else{$('host-adaptive-view').innerHTML='';$('question-level').textContent=host?'Everyone gets the same question':(variant==='junior'?'Junior question':'Standard question');$('question-text').textContent=v.question;}
    renderAnswers(host&&s.adaptive?null:v,state,host);renderAnswerStatus(v,state,host);renderHostAnswerCount();
    $('host-tools').classList.toggle('hidden',!host||state.phase!=='question');$('reveal-tools').classList.toggle('hidden',!host||state.phase!=='reveal');$('pause-game').textContent=state.paused?'▶ Resume':'⏸ Pause';startQuizTimer();
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
  function startQuizTimer(){
    stopTimers();const update=()=>{const state=gs(),ms=remainingMs();$('timer').textContent=state.paused?'⏸':String(Math.ceil(ms/1000));if(role==='player'&&state.phase==='question'){const q=questionAt(state.questionIndex);if(q)renderAnswers(q[questionVariant(q,myPlayer())],state,false);}if(role==='host'&&state.phase==='question'&&!state.paused&&ms<=0&&!autoRevealBusy){autoRevealBusy=true;revealRound().finally(()=>{autoRevealBusy=false;});}};update();timerHandle=setInterval(update,500);
  }
  function renderHostAnswerCount(){const el=$('host-answer-count');if(!el)return;el.classList.toggle('hidden',role!=='host');if(role==='host')el.textContent='Answers: '+currentAnswers.length+' / '+currentPlayers.length;}
  async function togglePause(){const state={...gs()};if(state.phase!=='question')return;if(!state.paused){state.paused=true;state.pausedStartedAt=new Date().toISOString();}else{const pausedAt=new Date(state.pausedStartedAt).getTime();state.pauseMs=(Number(state.pauseMs)||0)+Math.max(0,Date.now()-pausedAt);state.paused=false;state.pausedStartedAt=null;}await updateGameState(state);}
  async function revealRound(){const state={...gs()};if(state.phase!=='question')return;state.phase='reveal';if(state.paused&&state.pausedStartedAt){state.pauseMs=(Number(state.pauseMs)||0)+Math.max(0,Date.now()-new Date(state.pausedStartedAt).getTime());state.paused=false;state.pausedStartedAt=null;}await updateGameState(state);}

  // ---------------- Creative rounds (Phase 3) ----------------
  function renderCreativeView(){
    const phase=gs().phase;if(phase==='creative_capture')renderCreativeCapture();else if(phase==='creative_vote')renderCreativeVote();else if(phase==='creative_result')renderCreativeResult();else renderCreativeCapture();
  }

  function creativeRoundKey(){const s=gs(),r=creativeAt(s.creativeIndex);return [roomId,s.creativeIndex,r&&r.kind].join(':');}
  function renderCreativeCounts(){
    if(!$('creative-host-count'))return;const s=gs();if(s.phase==='creative_capture')$('creative-host-count').textContent='Submissions: '+currentSubmissions.length+' / '+currentPlayers.length;
    if(s.phase==='creative_vote'){$('vote-progress-text').textContent=currentStageVotes().length+'/'+currentPlayers.length;}
  }

  function renderCreativeCapture(){
    const state=gs(),round=creativeAt(state.creativeIndex);if(!round)return;stopQuizOnly();show('creative-capture');
    $('creative-kind').textContent=(round.kind==='picture'?'📸 PICTURE':'🎙️ SOUND');$('creative-round-title').textContent=round.title+' • Round '+(Number(state.creativeIndex)+1)+' of '+creative.rounds.length;$('creative-progress').style.width=((Number(state.creativeIndex)+1)/creative.rounds.length*100)+'%';$('creative-prompt').textContent=round.prompt;
    startCreativeTimer(round);
    const host=role==='host';$('creative-host-capture').classList.toggle('hidden',!host);$('creative-player-capture').classList.toggle('hidden',host);
    if(host){
      renderCreativeCounts();const box=$('creative-submitted-names');box.innerHTML='';const submitted=new Set(currentSubmissions.map(s=>s.player_id));currentPlayers.forEach(p=>{const d=document.createElement('div');d.className='player';d.innerHTML='<span class="face">'+escapeHtml(p.avatar||'🙂')+'</span><span><span class="name">'+escapeHtml(p.name)+'</span><small>'+(submitted.has(p.id)?'✅ Submitted':'⏳ Creating…')+'</small></span>';box.appendChild(d);});
      $('creative-start-voting').disabled=currentSubmissions.length<1;$('creative-start-voting').textContent=currentSubmissions.length===1?'Reveal Only Entry':'Start Voting';
      return;
    }
    const mine=currentSubmissions.find(s=>s.player_id===playerId);
    if(mine){stopAllMedia();$('picture-capture').classList.add('hidden');$('sound-capture').classList.add('hidden');$('creative-player-status').innerHTML='<div class="submission-badge">✅ Submitted! Waiting for everyone else.</div>';return;}
    $('creative-player-status').innerHTML='';const key=creativeRoundKey();if(captureRoundKey!==key){resetCaptureUI();captureRoundKey=key;}
    $('picture-capture').classList.toggle('hidden',round.kind!=='picture');$('sound-capture').classList.toggle('hidden',round.kind!=='sound');
  }

  function startCreativeTimer(round){
    if(creativeTimerHandle){clearInterval(creativeTimerHandle);creativeTimerHandle=null;}const update=()=>{const start=new Date(gs().startedAt||Date.now()).getTime(),secs=Math.max(0,Math.ceil((Number(round.captureSeconds||60)*1000-(Date.now()-start))/1000));$('creative-timer').textContent=String(secs);};update();creativeTimerHandle=setInterval(update,500);
  }

  function resetCaptureUI(){
    stopAllMedia();if(pendingMediaUrl){URL.revokeObjectURL(pendingMediaUrl);pendingMediaUrl='';}pendingMediaBlob=null;pendingMediaMime='';
    $('camera-video').classList.add('hidden');$('photo-preview').classList.add('hidden');$('start-camera').classList.remove('hidden');$('photo-actions').classList.add('hidden');$('photo-ready-actions').classList.add('hidden');
    $('record-sound').classList.remove('hidden');$('record-sound').classList.remove('recording');$('stop-sound').classList.add('hidden');$('sound-preview').classList.add('hidden');$('sound-preview').removeAttribute('src');$('sound-ready-actions').classList.add('hidden');$('sound-status').textContent='Tap record when you are ready.';
  }

  async function openCamera(){
    msg($('creative-player-status'),'');if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg($('creative-player-status'),'This browser cannot access the camera. Try a current version of Safari, Chrome or Edge.');return;}
    try{stopAllMedia();mediaStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280}},audio:false});$('camera-video').srcObject=mediaStream;$('camera-video').classList.remove('hidden');$('start-camera').classList.add('hidden');$('photo-actions').classList.remove('hidden');}
    catch(e){msg($('creative-player-status'),'Camera permission was not available. Allow camera access in your browser and try again.');}
  }
  function cancelCamera(){stopAllMedia();$('camera-video').classList.add('hidden');$('start-camera').classList.remove('hidden');$('photo-actions').classList.add('hidden');}
  function takePhoto(){
    const video=$('camera-video');if(!video.videoWidth)return;const maxW=1280,scale=Math.min(1,maxW/video.videoWidth),w=Math.round(video.videoWidth*scale),h=Math.round(video.videoHeight*scale);const canvas=$('camera-canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(video,0,0,w,h);
    canvas.toBlob(blob=>{if(!blob)return;pendingMediaBlob=blob;pendingMediaMime='image/jpeg';if(pendingMediaUrl)URL.revokeObjectURL(pendingMediaUrl);pendingMediaUrl=URL.createObjectURL(blob);$('photo-preview').src=pendingMediaUrl;$('photo-preview').classList.remove('hidden');$('camera-video').classList.add('hidden');$('photo-actions').classList.add('hidden');$('photo-ready-actions').classList.remove('hidden');stopAllMedia();},'image/jpeg',0.82);
  }
  async function retakePhoto(){if(pendingMediaUrl)URL.revokeObjectURL(pendingMediaUrl);pendingMediaUrl='';pendingMediaBlob=null;$('photo-preview').classList.add('hidden');$('photo-ready-actions').classList.add('hidden');await openCamera();}

  function supportedAudioMime(){if(!window.MediaRecorder)return '';const choices=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg'];return choices.find(x=>MediaRecorder.isTypeSupported(x))||'';}
  async function startSoundRecording(){
    msg($('creative-player-status'),'');if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){msg($('creative-player-status'),'This browser cannot record audio. Try a current version of Safari, Chrome or Edge.');return;}
    try{
      stopAllMedia();mediaStream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});const requested=supportedAudioMime();mediaRecorder=requested?new MediaRecorder(mediaStream,{mimeType:requested}):new MediaRecorder(mediaStream);mediaChunks=[];
      mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size)mediaChunks.push(e.data);};mediaRecorder.onstop=()=>{const base=(mediaRecorder&&mediaRecorder.mimeType?mediaRecorder.mimeType:requested||'audio/webm').split(';')[0];pendingMediaMime=base;pendingMediaBlob=new Blob(mediaChunks,{type:base});if(pendingMediaUrl)URL.revokeObjectURL(pendingMediaUrl);pendingMediaUrl=URL.createObjectURL(pendingMediaBlob);$('sound-preview').src=pendingMediaUrl;$('sound-preview').classList.remove('hidden');$('sound-ready-actions').classList.remove('hidden');$('record-sound').classList.remove('recording');$('record-sound').classList.add('hidden');$('stop-sound').classList.add('hidden');$('sound-status').textContent='Listen back, then submit or record again.';stopTracks();};
      mediaRecorder.start();$('record-sound').classList.add('recording');$('record-sound').textContent='●';$('stop-sound').classList.remove('hidden');$('sound-status').textContent='Recording… maximum 10 seconds';recordingStopTimer=setTimeout(stopSoundRecording,10000);
    }catch(e){msg($('creative-player-status'),'Microphone permission was not available. Allow microphone access in your browser and try again.');}
  }
  function stopSoundRecording(){clearTimeout(recordingStopTimer);recordingStopTimer=null;if(mediaRecorder&&mediaRecorder.state==='recording')mediaRecorder.stop();}
  function redoSound(){if(pendingMediaUrl)URL.revokeObjectURL(pendingMediaUrl);pendingMediaUrl='';pendingMediaBlob=null;$('sound-preview').classList.add('hidden');$('sound-ready-actions').classList.add('hidden');$('record-sound').classList.remove('hidden');$('record-sound').textContent='REC';$('sound-status').textContent='Tap record when you are ready.';}

  function extensionForMime(mime){if(mime==='image/jpeg')return'jpg';if(mime==='image/png')return'png';if(mime==='audio/mp4')return'mp4';if(mime==='audio/ogg')return'ogg';if(mime==='audio/mpeg')return'mp3';return'webm';}
  async function uploadCreativeBlob(blob,mime){
    if(role!=='player'||!blob)return;const state=gs(),round=creativeAt(state.creativeIndex);if(!round||state.phase!=='creative_capture')return;const btn=round.kind==='picture'?$('submit-photo'):$('submit-sound');btn.disabled=true;msg($('creative-player-status'),'Uploading your masterpiece…','success');
    const unique=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);const path=roomId+'/'+state.creativeIndex+'/'+playerId+'-'+unique+'.'+extensionForMime(mime);
    try{
      const {error:uploadError}=await db.storage.from(MEDIA_BUCKET).upload(path,blob,{contentType:mime,upsert:false,cacheControl:'3600'});if(uploadError)throw uploadError;
      const {error:rowError}=await db.from('creative_submissions').insert({room_id:roomId,player_id:playerId,round_index:Number(state.creativeIndex),kind:round.kind,storage_path:path,mime_type:mime});
      if(rowError){await db.storage.from(MEDIA_BUCKET).remove([path]);throw rowError;}
      msg($('creative-player-status'),'Submitted!','success');stopAllMedia();await loadCreativeData();
    }catch(e){msg($('creative-player-status'),friendlyError(e));btn.disabled=false;}
  }

  function buildHeatGroups(subs){const count=Math.ceil(subs.length/5),groups=Array.from({length:count},()=>[]);subs.forEach((s,i)=>groups[i%count].push(s.id));return groups;}
  async function startCreativeVoting(){
    if(role!=='host')return;await loadCreativeData();const state=gs();if(state.phase!=='creative_capture'||!currentSubmissions.length)return;$('creative-start-voting').disabled=true;
    try{
      if(currentSubmissions.length===1){const only=currentSubmissions[0];await awardCreativeRound([only.id],{});await updateGameState({...state,phase:'creative_result',voteStage:'final',candidateIds:[only.id],lastWinners:[only.id],stageVoteCounts:{[only.id]:0},scored:true,autoWin:true});return;}
      const groups=buildHeatGroups(currentSubmissions);if(groups.length===1)await updateGameState({...state,phase:'creative_vote',voteStage:'final',heatGroups:groups,heatIndex:0,finalists:[],candidateIds:groups[0],stageKey:'final',lastWinners:[],stageVoteCounts:{}});
      else await updateGameState({...state,phase:'creative_vote',voteStage:'heat',heatGroups:groups,heatIndex:0,finalists:[],candidateIds:groups[0],stageKey:'heat-0',lastWinners:[],stageVoteCounts:{}});
    }finally{$('creative-start-voting').disabled=false;}
  }

  function currentStageVotes(){const key=gs().stageKey;return currentVotes.filter(v=>v.stage_key===key);}
  function submissionById(id){return currentSubmissions.find(s=>s.id===id)||null;}
  async function signedMediaUrl(sub){if(!sub)return'';if(mediaUrlCache.has(sub.storage_path))return mediaUrlCache.get(sub.storage_path);const {data,error}=await db.storage.from(MEDIA_BUCKET).createSignedUrl(sub.storage_path,3600);if(error){console.error(error);return'';}const url=data&&data.signedUrl||'';if(url)mediaUrlCache.set(sub.storage_path,url);return url;}
  function mediaCardShell(label){const d=document.createElement('div');d.className='media-card';d.innerHTML='<div class="media-label">'+escapeHtml(label)+'</div><div class="media-body"><div class="waiting">Loading submission…</div></div>';return d;}
  async function fillMediaBody(card,sub,opts={}){const body=card.querySelector('.media-body'),url=await signedMediaUrl(sub);body.innerHTML='';if(!url){body.innerHTML='<div class="error">Media unavailable.</div>';return;}if(sub.kind==='picture'){const img=document.createElement('img');img.src=url;img.alt='Anonymous picture submission';body.appendChild(img);}else{const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=url;body.appendChild(audio);}if(opts.name){const n=document.createElement('div');n.className='media-name';n.textContent=opts.name;body.appendChild(n);}if(Number.isFinite(opts.votes)){const v=document.createElement('div');v.className='vote-count';v.textContent=opts.votes+' vote'+(opts.votes===1?'':'s');body.appendChild(v);}}

  async function renderCreativeVote(){
    const token=++renderSerial,state=gs(),round=creativeAt(state.creativeIndex);if(!round)return;stopTimers();stopAllMedia();show('creative-vote');$('vote-stage-pill').textContent=state.voteStage==='heat'?'🔥 HEAT '+(Number(state.heatIndex)+1)+'/'+(state.heatGroups||[]).length:'🏆 GRAND FINAL';$('vote-title').textContent=state.voteStage==='heat'?'Vote for the heat winner':'Vote for the overall winner';$('vote-prompt').textContent=round.prompt;renderCreativeCounts();
    const candidates=(state.candidateIds||[]).map(submissionById).filter(Boolean),box=$('vote-media-grid');box.innerHTML='';const labels='ABCDEFGHIJKLMNOPQRSTUVWXYZ';const mineVote=currentStageVotes().find(v=>v.voter_player_id===playerId);candidates.forEach((sub,i)=>{const card=mediaCardShell(labels[i]||String(i+1));box.appendChild(card);fillMediaBody(card,sub);if(role==='player'){const b=document.createElement('button');b.type='button';b.className='vote-btn'+(mineVote&&mineVote.submission_id===sub.id?' selected':'');const own=sub.player_id===playerId;b.textContent=own?'Your entry':(mineVote?'Vote locked':'Vote '+(labels[i]||i+1));b.disabled=own||Boolean(mineVote);b.addEventListener('click',()=>castCreativeVote(sub.id));card.appendChild(b);}});
    if(token!==renderSerial)return;$('vote-host-tools').classList.toggle('hidden',role!=='host');$('reveal-creative-vote').disabled=role!=='host'||candidates.length<1;
    if(role==='player')$('vote-player-status').innerHTML=mineVote?'<div class="submission-badge">🗳️ Vote locked in. Waiting for the reveal.</div>':'<div class="waiting">Choose your favourite. Your own entry is disabled.</div>';else $('vote-player-status').innerHTML='';
  }

  async function castCreativeVote(submissionId){
    if(role!=='player')return;const state=gs(),sub=submissionById(submissionId);if(!sub||sub.player_id===playerId||state.phase!=='creative_vote')return;
    const row={room_id:roomId,voter_player_id:playerId,round_index:Number(state.creativeIndex),stage_key:String(state.stageKey),submission_id:submissionId};const {error}=await db.from('creative_votes').insert(row);if(error){msg($('vote-player-status'),friendlyError(error));return;}await loadCreativeData();
  }

  function tallyStage(candidateIds){const counts={};candidateIds.forEach(id=>counts[id]=0);currentStageVotes().forEach(v=>{if(Object.prototype.hasOwnProperty.call(counts,v.submission_id))counts[v.submission_id]++;});return counts;}
  function topIdsFromCounts(counts){const entries=Object.entries(counts);if(!entries.length)return[];const max=Math.max(...entries.map(([,n])=>n));return entries.filter(([,n])=>n===max).map(([id])=>id);}
  async function revealCreativeVote(){
    if(role!=='host')return;const b=$('reveal-creative-vote');b.disabled=true;const state=gs(),candidateIds=(state.candidateIds||[]).filter(id=>submissionById(id)),counts=tallyStage(candidateIds),winners=topIdsFromCounts(counts);
    if(state.voteStage==='final')await awardCreativeRound(winners,counts);
    const finalists=state.voteStage==='heat'?Array.from(new Set([...(state.finalists||[]),...winners])):(state.finalists||[]);
    await updateGameState({...state,phase:'creative_result',lastWinners:winners,finalists,stageVoteCounts:counts,scored:state.voteStage==='final'});b.disabled=false;
  }

  async function awardCreativeRound(winnerIds,counts){
    const state=gs(),entries=Object.entries(counts||{}),top=entries.length?Math.max(...entries.map(([,n])=>n)):0;let secondIds=[];
    if(entries.length){const lower=entries.map(([,n])=>n).filter(n=>n<top);if(lower.length){const second=Math.max(...lower);secondIds=entries.filter(([,n])=>n===second).map(([id])=>id);}}
    const winnerSet=new Set(winnerIds),secondSet=new Set(secondIds);for(const sub of currentSubmissions){let points=100,reason='Participation';if(winnerSet.has(sub.id)){points+=1000;reason='Winner + participation';}else if(secondSet.has(sub.id)){points+=500;reason='Second place + participation';}
      const {error}=await db.from('creative_awards').insert({room_id:roomId,player_id:sub.player_id,round_index:Number(state.creativeIndex),points,reason});if(error&&error.code!=='23505')console.error(error);
    }await loadPlayers();
  }

  async function renderCreativeResult(){
    const token=++renderSerial,state=gs(),round=creativeAt(state.creativeIndex);if(!round)return;stopTimers();stopAllMedia();show('creative-result');$('result-prompt').textContent=round.prompt;const heat=state.voteStage==='heat',winners=new Set(state.lastWinners||[]),counts=state.stageVoteCounts||{};$('creative-result-heading').innerHTML=heat?'🔥 <span>Heat Result</span>':'🏆 <span>Round Result</span>';
    const candidateIds=(state.candidateIds||[]),box=$('result-media-grid');box.innerHTML='';const labels='ABCDEFGHIJKLMNOPQRSTUVWXYZ';candidateIds.forEach((id,i)=>{const sub=submissionById(id);if(!sub)return;const card=mediaCardShell(labels[i]||String(i+1));if(winners.has(id))card.classList.add('creative-winner');box.appendChild(card);const p=currentPlayers.find(x=>x.id===sub.player_id);fillMediaBody(card,sub,{name:(winners.has(id)?'🏆 ':'')+(p?(p.avatar||'🙂')+' '+p.name:'Player'),votes:Number(counts[id]||0)});});
    if(token!==renderSerial)return;const host=role==='host';$('creative-result-host-tools').classList.toggle('hidden',!host);$('creative-result-player-wait').classList.toggle('hidden',host);
    if(host){if(heat){const next=Number(state.heatIndex)+1,more=next<(state.heatGroups||[]).length;$('creative-result-next').textContent=more?'Next Heat':'Grand Final';}else $('creative-result-next').textContent='Show Leaderboard';}
  }

  async function continueCreativeResult(){
    if(role!=='host')return;const state=gs();if(state.voteStage==='heat'){
      const next=Number(state.heatIndex)+1,groups=state.heatGroups||[];if(next<groups.length){await updateGameState({...state,phase:'creative_vote',heatIndex:next,candidateIds:groups[next],stageKey:'heat-'+next,lastWinners:[],stageVoteCounts:{}});return;}
      const finalists=Array.from(new Set(state.finalists||[]));if(finalists.length===1){const only=finalists[0];await awardCreativeRound([only],{});await updateGameState({...state,phase:'creative_result',voteStage:'final',candidateIds:finalists,stageKey:'final',lastWinners:finalists,stageVoteCounts:{[only]:0},scored:true,autoWin:true});return;}
      await updateGameState({...state,phase:'creative_vote',voteStage:'final',candidateIds:finalists,stageKey:'final',lastWinners:[],stageVoteCounts:{}});return;
    }await showLeaderboard();
  }

  async function nextCreativeRound(){const next=Number(gs().creativeIndex)+1;if(next>=creative.rounds.length){await finishGame();return;}currentSubmissions=[];currentVotes=[];captureRoundKey='';resetCaptureUI();await updateGameState(newCreativeCaptureState(next));}
  async function skipCreativeRound(){if(role!=='host')return;await nextCreativeRound();}

  // ---------------- Shared host / scoring / lifecycle ----------------
  async function updateGameState(next,status){if(role!=='host'||!currentRoom)return;const payload={game_state:next,updated_at:new Date().toISOString()};if(status)payload.status=status;const {error}=await db.from('rooms').update(payload).eq('id',roomId);if(error)throw error;}
  async function showLeaderboard(){await updateGameState({...gs(),phase:'leaderboard'});}
  async function nextQuestion(){if(settingsOf().gameKey==='creative')return nextCreativeRound();const next=Number(gs().questionIndex)+1;if(next>=quiz.questions.length){await finishGame();return;}currentAnswers=[];await updateGameState(newQuestionState(next));}
  async function skipQuestion(){await nextQuestion();}
  async function finishGame(){if(role!=='host')return;try{if(settingsOf().gameKey==='creative')await cleanupCreativeMedia(true);}catch(e){console.error(e);}await updateGameState({...gs(),phase:'finished'},'finished');}

  function getLeaderboardRows(){
    const s=settingsOf();if(s.gameMode!=='teams')return currentPlayers.slice().sort((a,b)=>(b.score||0)-(a.score||0)).map(p=>({name:(p.avatar||'🙂')+' '+p.name,score:Number(p.score)||0}));
    const groups={};currentPlayers.forEach(p=>{const key=p.team||'No team';if(!groups[key])groups[key]=[];groups[key].push(Number(p.score)||0);});
    return Object.entries(groups).map(([name,scores])=>({name:name+' Team',score:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length),members:scores.length})).sort((a,b)=>b.score-a.score);
  }
  function fillLeaderboard(target){const rows=getLeaderboardRows(),box=$(target);box.innerHTML='';if(!rows.length){box.innerHTML='<div class="empty">No scores yet.</div>';return;}rows.forEach((r,i)=>{const d=document.createElement('div');d.className='leader-row';d.innerHTML='<span class="rank">'+(i+1)+'</span><span class="who">'+escapeHtml(r.name)+(r.members?' <small>('+r.members+')</small>':'')+'</span><span class="pts">'+r.score+' pts</span>';box.appendChild(d);});}
  function renderLeaderboard(){stopTimers();stopAllMedia();show('leaderboard');const s=settingsOf();$('leaderboard-title').textContent=s.gameKey==='creative'?'🏆 Leaderboard • Creative Round '+(Number(gs().creativeIndex)+1):'🏆 Leaderboard • Round '+(Number(gs().questionIndex)+1);fillLeaderboard('leaderboard');$('next-question').classList.toggle('hidden',role!=='host');$('next-question').textContent=s.gameKey==='creative'?'Next Round':'Next Question';$('player-wait-next').classList.toggle('hidden',role==='host');}
  function renderFinished(){stopTimers();stopAllMedia();show('finished');fillLeaderboard('final-leaderboard');$('play-again').classList.toggle('hidden',role!=='host');}
  async function playAgain(){if(role!=='host')return;await db.from('answers').delete().eq('room_id',roomId);if(settingsOf().gameKey==='creative')await cleanupCreativeMedia(true);await db.from('players').update({score:0}).eq('room_id',roomId);await updateGameState({},'lobby');}

  async function cleanupCreativeMedia(clearRows=true){
    if(!db||!roomId)return;let subs=currentSubmissions;if(clearRows){const {data}=await db.from('creative_submissions').select('storage_path').eq('room_id',roomId);subs=data||[];}const paths=Array.from(new Set((subs||[]).map(s=>s.storage_path).filter(Boolean)));if(paths.length){for(let i=0;i<paths.length;i+=100)await db.storage.from(MEDIA_BUCKET).remove(paths.slice(i,i+100));}
    if(clearRows){await db.from('creative_votes').delete().eq('room_id',roomId);await db.from('creative_awards').delete().eq('room_id',roomId);await db.from('creative_submissions').delete().eq('room_id',roomId);currentSubmissions=[];currentVotes=[];mediaUrlCache.clear();}
  }
  async function cleanupPlayerMedia(pid){if(!db||!roomId||!pid)return;const {data}=await db.from('creative_submissions').select('storage_path').eq('room_id',roomId).eq('player_id',pid);const paths=(data||[]).map(x=>x.storage_path).filter(Boolean);if(paths.length)await db.storage.from(MEDIA_BUCKET).remove(paths);}

  function stopTracks(){if(mediaStream){mediaStream.getTracks().forEach(t=>t.stop());mediaStream=null;}$('camera-video').srcObject=null;}
  function stopAllMedia(){clearTimeout(recordingStopTimer);recordingStopTimer=null;if(mediaRecorder&&mediaRecorder.state==='recording'){try{mediaRecorder.stop();}catch(_){}}mediaRecorder=null;stopTracks();}
  function stopQuizOnly(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;}}
  function stopTimers(){if(timerHandle){clearInterval(timerHandle);timerHandle=null;}if(creativeTimerHandle){clearInterval(creativeTimerHandle);creativeTimerHandle=null;}}

  async function leave(){
    stopTimers();stopAllMedia();if(channel&&db)await db.removeChannel(channel);channel=null;
    if(db&&roomId){try{if(role==='player'&&playerId){await cleanupPlayerMedia(playerId);await db.from('players').delete().eq('id',playerId);}else if(role==='host'){if(settingsOf().gameKey==='creative')await cleanupCreativeMedia(true);await db.from('rooms').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',roomId);}}catch(e){console.error(e);}}
    roomId=roomCode=role=playerId=null;currentRoom=null;currentPlayers=[];currentAnswers=[];currentSubmissions=[];currentVotes=[];clearSession();show('choice');
  }
  async function roomClosed(){stopTimers();stopAllMedia();if(channel&&db)await db.removeChannel(channel);channel=null;clearSession();roomId=roomCode=role=playerId=null;currentRoom=null;currentPlayers=[];currentAnswers=[];currentSubmissions=[];currentVotes=[];serviceStatus.textContent='That Spencer Live room has closed.';serviceStatus.className='status warn';show('choice');}

  // Base controls
  $('create-room').addEventListener('click',createRoom);$('join-room').addEventListener('click',joinRoom);$('leave-lobby').addEventListener('click',leave);$('start-game').addEventListener('click',startGame);
  $('pause-game').addEventListener('click',togglePause);$('reveal-now').addEventListener('click',revealRound);$('skip-question').addEventListener('click',skipQuestion);$('end-game').addEventListener('click',finishGame);$('show-leaderboard').addEventListener('click',showLeaderboard);$('next-question-direct').addEventListener('click',nextQuestion);$('next-question').addEventListener('click',nextQuestion);$('play-again').addEventListener('click',playAgain);$('finish-leave').addEventListener('click',leave);
  // Creative capture controls
  $('start-camera').addEventListener('click',openCamera);$('cancel-camera').addEventListener('click',cancelCamera);$('take-photo').addEventListener('click',takePhoto);$('retake-photo').addEventListener('click',retakePhoto);$('submit-photo').addEventListener('click',()=>uploadCreativeBlob(pendingMediaBlob,pendingMediaMime||'image/jpeg'));
  $('record-sound').addEventListener('click',startSoundRecording);$('stop-sound').addEventListener('click',stopSoundRecording);$('redo-sound').addEventListener('click',redoSound);$('submit-sound').addEventListener('click',()=>uploadCreativeBlob(pendingMediaBlob,pendingMediaMime||'audio/webm'));
  $('creative-start-voting').addEventListener('click',startCreativeVoting);$('creative-skip-round').addEventListener('click',skipCreativeRound);$('creative-end-game').addEventListener('click',finishGame);$('reveal-creative-vote').addEventListener('click',revealCreativeVote);$('creative-vote-end-game').addEventListener('click',finishGame);$('creative-result-next').addEventListener('click',continueCreativeResult);$('creative-result-end').addEventListener('click',finishGame);

  async function restore(){
    if(!configured)return false;let saved=null;try{saved=JSON.parse(sessionStorage.getItem('spencer_live_room')||'null');}catch(_){saved=null;}if(!saved||!saved.roomId||!saved.role)return false;
    roomId=saved.roomId;roomCode=saved.roomCode;role=saved.role;playerId=saved.playerId||null;
    if(!(await loadRoom()))return false;await loadPlayers();if(role==='player'&&!currentPlayers.some(p=>p.id===playerId)){clearSession();return false;}await subscribeRoom();await openExperience();return true;
  }

  const params=new URLSearchParams(location.search),join=params.get('join'),mode=params.get('mode');
  restore().then(restored=>{if(restored)return;if(join){$('join-code').value=cleanCode(join);show('join');lookupJoinRoom();}else if(mode==='host')show('host');else if(mode==='join')show('join');else show('choice');});
})();
