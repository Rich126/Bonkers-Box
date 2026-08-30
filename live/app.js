(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const cfg=window.SPENCER_LIVE_CONFIG||{};
  const quiz=window.SPENCER_LIVE_QUIZ||{questions:[],topics:[]};
  const creative=window.SPENCER_LIVE_CREATIVE||{rounds:[],mixRounds:[]};
  const questionById=new Map((quiz.questions||[]).map(q=>[String(q.id),q]));
  // Built-in Spencer Mix creative pack. Keeping a local fallback here means Mix still
  // works if a browser/CDN briefly serves an older creative.js during deployment.
  const BUILTIN_MIX_CREATIVE=[
    {id:'mix-pic-superhero',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of your best SUPERHERO POSE!',captureSeconds:60},
    {id:'mix-sound-animal',kind:'sound',title:'Sound Challenge',prompt:'Make the funniest ANIMAL NOISE you can!',captureSeconds:45},
    {id:'mix-pic-shocked',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of you looking COMPLETELY SHOCKED!',captureSeconds:60},
    {id:'mix-sound-robot',kind:'sound',title:'Sound Challenge',prompt:'Do your best ROBOT VOICE saying: Spencer Games!',captureSeconds:45},
    {id:'mix-pic-villain',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of your most dramatic VILLAIN FACE!',captureSeconds:60},
    {id:'mix-sound-dinosaur',kind:'sound',title:'Sound Challenge',prompt:'Make your best DINOSAUR ROAR!',captureSeconds:45},
    {id:'mix-pic-slowmo',kind:'picture',title:'Picture Challenge',prompt:'Freeze in a pose that looks like you are running in SLOW MOTION!',captureSeconds:60},
    {id:'mix-sound-commentator',kind:'sound',title:'Sound Challenge',prompt:'Give a 10-second SPORTS COMMENTARY for the most ridiculous race ever!',captureSeconds:45},
    {id:'mix-pic-statue',kind:'picture',title:'Picture Challenge',prompt:'Become the strangest HUMAN STATUE you can!',captureSeconds:60},
    {id:'mix-sound-alien',kind:'sound',title:'Sound Challenge',prompt:'What would an ALIEN sound like ordering a pizza?',captureSeconds:45},
    {id:'mix-pic-tiny',kind:'picture',title:'Picture Challenge',prompt:'Pose like you have just seen something TINY but TERRIFYING!',captureSeconds:60},
    {id:'mix-sound-movie',kind:'sound',title:'Sound Challenge',prompt:'Make a dramatic MOVIE TRAILER voice for your breakfast!',captureSeconds:45},
    {id:'mix-pic-racing',kind:'picture',title:'Picture Challenge',prompt:'Take a picture like you are celebrating a huge MOTOR RACING WIN!',captureSeconds:60},
    {id:'mix-sound-weather',kind:'sound',title:'Sound Challenge',prompt:'Give a WEATHER REPORT for a completely bonkers planet!',captureSeconds:45},
    {id:'mix-pic-invisible',kind:'picture',title:'Picture Challenge',prompt:'Pose like you are wrestling an INVISIBLE MONSTER!',captureSeconds:60},
    {id:'mix-sound-laugh',kind:'sound',title:'Sound Challenge',prompt:'Do your most ridiculous EVIL LAUGH!',captureSeconds:45},
    {id:'mix-pic-moon',kind:'picture',title:'Picture Challenge',prompt:'Pose like you have just landed on THE MOON!',captureSeconds:60},
    {id:'mix-sound-game-show',kind:'sound',title:'Sound Challenge',prompt:'Be a GAME SHOW HOST announcing the silliest prize imaginable!',captureSeconds:45},
    {id:'mix-pic-fashion',kind:'picture',title:'Picture Challenge',prompt:'Strike your most outrageous FASHION MODEL pose!',captureSeconds:60},
    {id:'mix-sound-monster',kind:'sound',title:'Sound Challenge',prompt:'Make the sound of a tiny MONSTER trying to be scary!',captureSeconds:45},
    {id:'mix-pic-sneaky',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of your best SNEAKING pose!',captureSeconds:60},
    {id:'mix-sound-space',kind:'sound',title:'Sound Challenge',prompt:'Make the sound of a SPACESHIP taking off using only your voice!',captureSeconds:45},
    {id:'mix-pic-celebrity',kind:'picture',title:'Picture Challenge',prompt:'Pose like you have just arrived on a huge RED CARPET!',captureSeconds:60},
    {id:'mix-sound-slow',kind:'sound',title:'Sound Challenge',prompt:'Say “I cannot believe that happened!” in the funniest SLOW-MOTION voice!',captureSeconds:45}
  ];
  const suppliedMixCreative=Array.isArray(creative.mixRounds)?creative.mixRounds:[];
  const mixCreativeRounds=Array.from(new Map([...suppliedMixCreative,...BUILTIN_MIX_CREATIVE].filter(r=>r&&r.id).map(r=>[String(r.id),r])).values());
  const mixCreativeById=new Map(mixCreativeRounds.map(r=>[String(r.id),r]));
  const RECENT_QUESTIONS_KEY='spencer_live_recent_questions_v2';
  const RECENT_CREATIVE_KEY='spencer_live_recent_creative_v1';
  const configured=Boolean(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase);
  const db=configured?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  const MEDIA_BUCKET='spencer-live-media';

  const avatars=['🦊','🐙','🦁','🐸','🦄','🐼','🐯','🦖','🐵','🐧','🐨','🦈'];
  const ages=[['standard','Standard'],['5-7','5–7'],['8-11','8–11'],['12-15','12–15'],['16+','16+']];
  const teams=[['Red','🔴 Red'],['Blue','🔵 Blue'],['Green','🟢 Green'],['Yellow','🟡 Yellow']];
  let selectedAvatar=avatars[0], selectedAge='standard', selectedTeam='Red', selectedMode='individual', selectedGame='quiz';
  let roomId=null, roomCode=null, role=null, playerId=null, channel=null;
  let pollingHandle=null,pollBusy=false,realtimeState='idle';
  const POLL_MS=3000,REQUEST_TIMEOUT_MS=8000;
  let currentRoom=null, currentPlayers=[], currentAnswers=[], currentSubmissions=[], currentVotes=[];
  let joinRoomSettings=null, timerHandle=null, creativeTimerHandle=null, autoRevealBusy=false, joinLookupTimer=null;
  let mediaStream=null, mediaRecorder=null, mediaChunks=[], recordingStopTimer=null;
  let pendingMediaBlob=null, pendingMediaMime='', pendingMediaUrl='', captureRoundKey='';
  let renderedQrValue='';
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
  function quizTopics(){const source=Array.isArray(quiz.topics)&&quiz.topics.length?quiz.topics:[...new Set((quiz.questions||[]).map(q=>q.category))];return source.filter(Boolean);}
  function settingsOf(room=currentRoom){
    const s=(room&&room.settings)||{},availableTopics=quizTopics();
    const topics=Array.isArray(s.topics)&&s.topics.length?s.topics.filter(t=>availableTopics.includes(t)):availableTopics.slice();
    const order=Array.isArray(s.questionOrder)?s.questionOrder.map(String).filter(id=>questionById.has(id)):[];
    const mixOrder=Array.isArray(s.mixOrder)?s.mixOrder.map(String).filter(token=>{const [kind,id]=token.split(':');return (kind==='q'&&questionById.has(id))||(kind==='c'&&mixCreativeById.has(id));}):[];
    const gameKey=s.gameKey==='creative'?'creative':s.gameKey==='mix'?'mix':'quiz';
    const requested=clamp(Number(s.questionCount)||Number(s.roundCount)||5,1,Math.max(1,quiz.questions.length));
    const roundCount=gameKey==='mix'?(mixOrder.length||clamp(Number(s.roundCount)||10,1,20)):gameKey==='creative'?creative.rounds.length:(order.length?Math.min(requested,order.length):requested);
    return {gameMode:s.gameMode==='teams'?'teams':'individual',adaptive:s.adaptive!==false,questionSeconds:clamp(Number(s.questionSeconds)||30,10,120),gameKey,questionCount:order.length?Math.min(requested,order.length):requested,roundCount,topics,questionOrder:order,mixOrder};
  }
  function gs(){return (currentRoom&&currentRoom.game_state)||{};}
  function isJunior(age){return age==='5-7'||age==='8-11';}
  function quizTotal(){const s=settingsOf();return s.questionOrder.length||Math.min(s.questionCount,quiz.questions.length);}
  function mixTotal(){const s=settingsOf();return s.mixOrder.length||s.roundCount||0;}
  function questionAt(i){const index=Number(i),s=settingsOf();const id=s.questionOrder[index];return (id&&questionById.get(id))||quiz.questions[index]||null;}
  function questionForState(state=gs()){if(settingsOf().gameKey==='mix'&&state.questionId)return questionById.get(String(state.questionId))||null;return questionAt(state.questionIndex);}
  function creativeAt(i){return creative.rounds[Number(i)]||null;}
  function creativeRoundForState(state=gs()){if(settingsOf().gameKey==='mix'&&state.creativeId)return mixCreativeById.get(String(state.creativeId))||null;return creativeAt(state.creativeIndex);}
  function questionVariant(q,player){const s=settingsOf();return s.adaptive&&player&&isJunior(player.age_band)?'junior':'standard';}
  function myPlayer(){return currentPlayers.find(p=>p.id===playerId)||null;}
  function saveSession(){sessionStorage.setItem('spencer_live_room',JSON.stringify({roomId,roomCode,role,playerId}));}
  function clearSession(){sessionStorage.removeItem('spencer_live_room');}
  function gameName(key=settingsOf().gameKey){return key==='creative'?'Creative Party':key==='mix'?'Spencer Mix':'Family Mega Quiz';}
  function isCreativeState(state=gs()){return String(state.phase||'').startsWith('creative_');}
  function isCreativeRoundState(state=gs()){return isCreativeState(state)||state.roundType==='creative';}

  const serviceStatus=$('service-status');
  if(configured){serviceStatus.textContent='Online multiplayer connected. Phase 3 creative rounds ready.';serviceStatus.className='status good';}
  else{serviceStatus.textContent='Spencer Live is not connected to its multiplayer service.';serviceStatus.className='status warn';}

  function setDiagnostic(id,text,state='warn'){const el=$(id);if(!el)return;el.textContent=text;el.className='diag-value '+state;}
  function errorKind(error){const text=String((error&&error.message)||error||'').toLowerCase();if(/abort|timeout|timed out/.test(text))return'timeout';if(/failed to fetch|networkerror|load failed|network request failed/.test(text))return'network';return'error';}
  async function fetchWithTimeout(url,options={},timeout=REQUEST_TIMEOUT_MS){const controller=window.AbortController?new AbortController():null;const timer=setTimeout(()=>{if(controller)controller.abort();},timeout);try{return await fetch(url,{...options,signal:controller?controller.signal:undefined,cache:'no-store'});}finally{clearTimeout(timer);}}
  async function runDiagnostics(){
    setDiagnostic('diag-site','Reachable','good');setDiagnostic('diag-rest','Checking…','warn');
    if(!$('diag-note'))return;
    if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){setDiagnostic('diag-rest','Not configured','bad');$('diag-note').textContent='The multiplayer service configuration is missing.';return;}
    try{const response=await fetchWithTimeout(cfg.SUPABASE_URL+'/rest/v1/rooms?select=id&limit=1',{headers:{apikey:cfg.SUPABASE_ANON_KEY,Authorization:'Bearer '+cfg.SUPABASE_ANON_KEY}});if(!response.ok)throw new Error('REST HTTP '+response.status);setDiagnostic('diag-rest','Reachable','good');$('diag-note').textContent=realtimeState==='subscribed'?'REST and Realtime are connected.':'Supabase REST is reachable. Realtime will be tested when a room is opened.';}
    catch(e){const kind=errorKind(e);setDiagnostic('diag-rest',kind==='timeout'?'Timed out':kind==='network'?'Network blocked':'Error','bad');$('diag-note').textContent=kind==='timeout'?'Supabase did not respond within 8 seconds. The Wi-Fi may be slow or filtering traffic.':kind==='network'?'This device can open Spencer Games but cannot reach Supabase. Check Wi-Fi filtering, parental controls or DNS.':'Supabase responded with an error: '+String((e&&e.message)||e);}
  }
  $('run-diagnostics').addEventListener('click',runDiagnostics);
  runDiagnostics();

  function shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function recentQuestionIds(){try{const raw=JSON.parse(localStorage.getItem(RECENT_QUESTIONS_KEY)||'[]');return Array.isArray(raw)?raw.map(String).filter(id=>questionById.has(id)):[];}catch(_){return[];}}
  function rememberQuestionIds(ids){try{const incoming=(ids||[]).map(String),old=recentQuestionIds().filter(id=>!incoming.includes(id));localStorage.setItem(RECENT_QUESTIONS_KEY,JSON.stringify([...incoming,...old].slice(0,quiz.questions.length)));}catch(_){}}
  function recentCreativeIds(){try{const raw=JSON.parse(localStorage.getItem(RECENT_CREATIVE_KEY)||'[]');return Array.isArray(raw)?raw.map(String).filter(id=>mixCreativeById.has(id)):[];}catch(_){return[];}}
  function rememberCreativeIds(ids){try{const incoming=(ids||[]).map(String),old=recentCreativeIds().filter(id=>!incoming.includes(id));localStorage.setItem(RECENT_CREATIVE_KEY,JSON.stringify([...incoming,...old].slice(0,mixCreativeRounds.length)));}catch(_){}}
  function selectedTopicNames(){return Array.from(document.querySelectorAll('#topic-grid input[type=checkbox]:checked')).map(x=>x.value).filter(Boolean);}
  function buildQuestionOrder(topics,count){
    const wanted=(topics||[]).filter(t=>quizTopics().includes(t)),recentList=recentQuestionIds(),recent=new Set(recentList),recentRank=new Map(recentList.map((id,i)=>[id,i])),chosen=[],chosenSet=new Set();
    const topicOrder=shuffle(wanted);
    const groups=topicOrder.map(topic=>{const all=shuffle(quiz.questions.filter(q=>q.category===topic)),oldestFirst=all.filter(q=>recent.has(String(q.id))).sort((a,b)=>(recentRank.get(String(b.id))??0)-(recentRank.get(String(a.id))??0));return {topic,fresh:all.filter(q=>!recent.has(String(q.id))),recent:oldestFirst};});
    function takeFrom(key){let moved=true;while(chosen.length<count&&moved){moved=false;for(const g of groups){while(g[key].length&&chosenSet.has(String(g[key][0].id)))g[key].shift();if(g[key].length&&chosen.length<count){const q=g[key].shift();chosen.push(String(q.id));chosenSet.add(String(q.id));moved=true;}}}}
    takeFrom('fresh');takeFrom('recent');
    return chosen.slice(0,count);
  }
  function mixCounts(total){const creativeCount=Math.max(1,Math.round(total/3));return {creativeCount,quizCount:Math.max(1,total-creativeCount)};}
  function chooseMixCreative(count){
    const recentList=recentCreativeIds(),recent=new Set(recentList),rank=new Map(recentList.map((id,i)=>[id,i]));
    const fresh=shuffle(mixCreativeRounds.filter(r=>!recent.has(String(r.id)))),old=shuffle(mixCreativeRounds.filter(r=>recent.has(String(r.id)))).sort((a,b)=>(rank.get(String(b.id))??0)-(rank.get(String(a.id))??0));
    const pool=[...fresh,...old],picked=[];let lastKind='';
    while(picked.length<count&&pool.length){let idx=pool.findIndex(r=>r.kind!==lastKind);if(idx<0)idx=0;const [round]=pool.splice(idx,1);picked.push(round);lastKind=round.kind;}
    return picked.map(r=>String(r.id));
  }
  function buildMixOrder(topics,total){
    const counts=mixCounts(total),questionIds=buildQuestionOrder(topics,counts.quizCount),creativeIds=chooseMixCreative(counts.creativeCount);if(questionIds.length<counts.quizCount||creativeIds.length<counts.creativeCount)return[];
    const creativePositions=new Set();for(let i=1;i<=counts.creativeCount;i++){let pos=Math.floor(i*total/(counts.creativeCount+1));pos=clamp(pos,1,total-2);while(creativePositions.has(pos)&&pos<total-1)pos++;creativePositions.add(pos);}
    const result=[];let qi=0,ci=0;for(let i=0;i<total;i++){if(creativePositions.has(i)&&ci<creativeIds.length)result.push('c:'+creativeIds[ci++]);else if(qi<questionIds.length)result.push('q:'+questionIds[qi++]);else result.push('c:'+creativeIds[ci++]);}return result;
  }
  function updateGameLengthNote(){
    if(!$('game-length-note')||!$('game-length'))return;const count=clamp(Number($('game-length').value)||10,1,20),options=Array.from($('game-length').options);
    options.forEach(o=>{const n=Number(o.value),prefix=n===5?'Quick':n===10?'Standard':n===15?'Long':'Epic';o.textContent=selectedGame==='quiz'?prefix+' • '+n+' questions':prefix+' • '+n+' rounds';});
    if(selectedGame==='mix'){const c=mixCounts(count);$('game-length-note').textContent=count+' rounds • '+c.quizCount+' quiz + '+c.creativeCount+' creative challenges.';}else $('game-length-note').textContent=count+' questions will be chosen for this room.';
  }
  function syncGameSetupVisibility(){const usesQuiz=selectedGame==='quiz'||selectedGame==='mix';$('quiz-settings').classList.toggle('hidden',!usesQuiz);$('creative-privacy').classList.toggle('hidden',selectedGame==='quiz');if(selectedGame==='mix')$('creative-privacy').textContent='🔒 Spencer Mix creative photos and audio are stored privately and cleaned up when the host ends the game.';else $('creative-privacy').textContent='🔒 Creative photos and audio are stored privately and are cleaned up when the host ends the game.';updateGameLengthNote();}
  function buildTopicButtons(){const box=$('topic-grid');box.innerHTML='';quizTopics().forEach((topic,i)=>{const label=document.createElement('label');label.className='topic-option';const input=document.createElement('input');input.type='checkbox';input.value=topic;input.checked=true;input.id='topic-'+i;const span=document.createElement('span');span.textContent=topic;label.append(input,span);box.appendChild(label);});}

  function buildChoiceButtons(){
    const avatarBox=$('avatars');
    avatars.forEach((a,i)=>{const b=document.createElement('button');b.type='button';b.className='avatar'+(i===0?' selected':'');b.textContent=a;b.setAttribute('aria-label','Choose '+a+' avatar');b.addEventListener('click',()=>{selectedAvatar=a;avatarBox.querySelectorAll('.avatar').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});avatarBox.appendChild(b);});
    const ageBox=$('age-grid');
    ages.forEach(([value,label])=>{const b=document.createElement('button');b.type='button';b.className='age-btn'+(value==='standard'?' selected':'');b.textContent=label;b.addEventListener('click',()=>{selectedAge=value;ageBox.querySelectorAll('.age-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});ageBox.appendChild(b);});
    const teamBox=$('team-grid');
    teams.forEach(([value,label],i)=>{const b=document.createElement('button');b.type='button';b.className='team-btn'+(i===0?' selected':'');b.textContent=label;b.addEventListener('click',()=>{selectedTeam=value;teamBox.querySelectorAll('.team-btn').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');});teamBox.appendChild(b);});
    document.querySelectorAll('.mode-btn').forEach(b=>b.addEventListener('click',()=>{selectedMode=b.dataset.mode;document.querySelectorAll('.mode-btn').forEach(x=>x.classList.toggle('selected',x===b));}));
    document.querySelectorAll('.game-btn').forEach(b=>b.addEventListener('click',()=>{selectedGame=b.dataset.game==='creative'?'creative':b.dataset.game==='mix'?'mix':'quiz';document.querySelectorAll('.game-btn').forEach(x=>x.classList.toggle('selected',x===b));syncGameSetupVisibility();}));
  }
  buildChoiceButtons();
  buildTopicButtons();syncGameSetupVisibility();updateGameLengthNote();
  $('game-length').addEventListener('change',updateGameLengthNote);
  $('topics-all').addEventListener('click',()=>document.querySelectorAll('#topic-grid input[type=checkbox]').forEach(x=>x.checked=true));
  $('topics-none').addEventListener('click',()=>document.querySelectorAll('#topic-grid input[type=checkbox]').forEach(x=>x.checked=false));

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
    const detail=s.gameKey==='quiz'?' • '+s.questionCount+' questions'+(s.adaptive?' • Family Adaptive':''):s.gameKey==='mix'?' • '+s.roundCount+' mixed rounds'+(s.adaptive?' • Family Adaptive':''):'';
    $('join-room-info').innerHTML='<div class="room-info">Room found • '+escapeHtml(gameName(s.gameKey))+' • '+(s.gameMode==='teams'?'Teams':'Individuals')+detail+'</div>';
    $('team-row').classList.toggle('hidden',s.gameMode!=='teams');
  }

  async function assertPhase3Ready(){
    const {error}=await db.from('creative_submissions').select('id',{head:true,count:'exact'}).limit(1);
    if(error)throw new Error('Supabase needs the Phase 3 upgrade. Run supabase/phase3.sql first.');
  }

  async function createRoom(){
    msg($('host-message'),'');if(!configured){msg($('host-message'),'Multiplayer service is not configured.');return;}
    const hostName=cleanName($('host-name').value)||'Host';
    const usesQuiz=selectedGame==='quiz'||selectedGame==='mix',topics=usesQuiz?selectedTopicNames():[],length=usesQuiz?clamp(Number($('game-length').value)||10,1,20):0;
    if(usesQuiz&&!topics.length){msg($('host-message'),'Choose at least one question topic.');return;}
    const questionOrder=selectedGame==='quiz'?buildQuestionOrder(topics,length):[];
    const mixOrder=selectedGame==='mix'?buildMixOrder(topics,length):[];
    if(selectedGame==='quiz'&&questionOrder.length<length){msg($('host-message'),'There are not enough questions for that combination yet. Choose another topic or a shorter game.');return;}
    if(selectedGame==='mix'&&mixOrder.length<length){msg($('host-message'),'Spencer Mix could not build this round set. Refresh once and try again. If it continues, the creative challenge pack has not loaded correctly.');return;}
    const settings={gameMode:selectedMode,adaptive:$('adaptive').checked,questionSeconds:Number($('question-seconds').value)||30,gameKey:selectedGame};
    if(selectedGame==='quiz'){settings.questionCount=length;settings.topics=topics;settings.questionOrder=questionOrder;}
    if(selectedGame==='mix'){settings.roundCount=length;settings.topics=topics;settings.mixOrder=mixOrder;settings.questionOrder=mixOrder.filter(x=>x.startsWith('q:')).map(x=>x.slice(2));settings.questionCount=settings.questionOrder.length;}
    $('create-room').disabled=true;
    try{
      if(selectedGame==='creative'||selectedGame==='mix')await assertPhase3Ready();
      let room=null;
      for(let attempt=0;attempt<8;attempt++){
        const code=randomCode();
        const {data,error}=await db.from('rooms').insert({code,status:'lobby',host_name:hostName,settings,game_state:{}}).select('*').single();
        if(!error){room=data;break;}
        if(error.code==='42703')throw new Error('Supabase needs the Phase 2 database upgrade. Run supabase/phase2.sql first.');
        if(error.code!=='23505')throw error;
      }
      if(!room)throw new Error('Could not create a unique room code. Please try again.');
      roomId=room.id;roomCode=room.code;role='host';playerId=null;currentRoom=room;if(selectedGame==='quiz')rememberQuestionIds(questionOrder);if(selectedGame==='mix'){rememberQuestionIds(settings.questionOrder);rememberCreativeIds(mixOrder.filter(x=>x.startsWith('c:')).map(x=>x.slice(2)));}saveSession();await subscribeRoom();await openExperience();
    }catch(e){msg($('host-message'),friendlyError(e));}
    finally{$('create-room').disabled=false;}
  }

  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function isFetchFailure(error){return /failed to fetch|networkerror|load failed/i.test(String((error&&error.message)||error||''));}
  async function retryRead(run,attempts=3){
    let last=null;
    for(let i=0;i<attempts;i++){
      const result=await run();last=result;
      if(!result||!result.error||!isFetchFailure(result.error))return result;
      if(i<attempts-1)await wait(250*(i+1));
    }
    return last;
  }

  async function joinRoom(){
    msg($('join-message'),'');if(!configured){msg($('join-message'),'Multiplayer service is not configured.');return;}
    const code=cleanCode($('join-code').value),name=cleanName($('player-name').value);
    if(code.length!==4){msg($('join-message'),'Enter the 4-character room code.');return;}
    if(!name){msg($('join-message'),'Enter your name.');return;}
    $('join-room').disabled=true;
    try{
      // Keep joining deliberately lightweight. Creative/media readiness is checked by the host,
      // not by every phone that joins the room.
      const roomResult=await retryRead(()=>db.from('rooms').select('*').eq('code',code).eq('status','lobby').maybeSingle());
      const {data:room,error:roomError}=roomResult||{};
      if(roomError)throw roomError;if(!room)throw new Error('Room not found or is no longer open.');
      const s=settingsOf(room);
      const countResult=await retryRead(()=>db.from('players').select('id',{count:'exact',head:true}).eq('room_id',room.id));
      const {count,error:countError}=countResult||{};if(countError)throw countError;
      if((count||0)>=20)throw new Error('ROOM_FULL');

      // Use a client-generated UUID so a lost mobile response can be retried safely without
      // accidentally creating the same player twice.
      const joinId=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():null;
      const row={room_id:room.id,name,avatar:selectedAvatar,score:0,age_band:selectedAge,team:s.gameMode==='teams'?selectedTeam:null};
      if(joinId)row.id=joinId;
      let player=null,lastInsertError=null;
      for(let attempt=0;attempt<2&&!player;attempt++){
        const {data,error}=await db.from('players').insert(row).select('id').single();
        if(!error){player=data;break;}
        lastInsertError=error;
        if(!isFetchFailure(error)||!joinId)break;
        await wait(350);
        // The insert may have reached Supabase even if the response was lost. Check by the UUID.
        const check=await retryRead(()=>db.from('players').select('id').eq('id',joinId).eq('room_id',room.id).maybeSingle(),2);
        if(check&&check.data){player=check.data;break;}
      }
      if(!player)throw lastInsertError||new Error('Could not join the room. Please try again.');
      roomId=room.id;roomCode=room.code;playerId=player.id;role='player';currentRoom=room;saveSession();await subscribeRoom();await openExperience();
    }catch(e){msg($('join-message'),friendlyError(e));}
    finally{$('join-room').disabled=false;}
  }

  function friendlyError(e){const t=String((e&&e.message)||e||'');if(t.includes('ROOM_FULL'))return 'This room already has 20 players.';if(t.includes('ROOM_NOT_OPEN'))return 'That room has already started.';if(t.includes('SELF_VOTE'))return 'You cannot vote for your own submission.';if(t.includes('INVALID_VOTE'))return 'That vote is not valid for this round.';if(t.includes('creative_submissions')||t.includes('Phase 3'))return 'Supabase needs the Phase 3 upgrade. Run supabase/phase3.sql first.';const kind=errorKind(e);if(kind==='timeout')return 'Spencer Live took too long to respond. Check connection diagnostics and try again.';if(kind==='network')return 'This device cannot currently reach Spencer Live data. Check connection diagnostics and try again.';return t||'Something went wrong.';}

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
    const {data,error}=await db.from('answers').select('*').eq('room_id',roomId).eq('question_index',q);if(error){console.error(error);return;}currentAnswers=data||[];renderHostAnswerCount();if((settingsOf().gameKey==='quiz'||settingsOf().gameKey==='mix')&&!isCreativeRoundState(gs()))renderGame();
  }
  async function loadCreativeData(){
    if(!db||!roomId)return;const r=Number(gs().creativeIndex);if(!Number.isFinite(r)){currentSubmissions=[];currentVotes=[];return;}
    const [{data:subs,error:subErr},{data:votes,error:voteErr}]=await Promise.all([
      db.from('creative_submissions').select('*').eq('room_id',roomId).eq('round_index',r).order('submitted_at',{ascending:true}),
      db.from('creative_votes').select('*').eq('room_id',roomId).eq('round_index',r)
    ]);
    if(subErr){console.error(subErr);return;}if(voteErr){console.error(voteErr);return;}
    currentSubmissions=subs||[];currentVotes=votes||[];renderCreativeCounts();if((settingsOf().gameKey==='creative'||settingsOf().gameKey==='mix')&&isCreativeRoundState(gs()))renderCurrentView();
  }

  async function pollRoom(){
    if(pollBusy||!roomId||!db)return;pollBusy=true;
    try{if(!(await loadRoom()))return;await loadPlayers();if(currentRoom.status!=='lobby'){if(isCreativeRoundState(gs()))await loadCreativeData();else await loadAnswers();renderCurrentView();}else openLobby();setDiagnostic('diag-updates','Polling active','good');}
    catch(e){console.error(e);setDiagnostic('diag-updates',errorKind(e)==='timeout'?'Polling timed out':'Polling retrying','bad');}
    finally{pollBusy=false;}
  }
  function startPolling(reason){if(pollingHandle||!roomId)return;setDiagnostic('diag-updates','Polling every 3 sec','good');if(reason)$('diag-note').textContent=reason+' Lobby and game updates will continue by polling.';pollRoom();pollingHandle=setInterval(pollRoom,POLL_MS);}
  function stopPolling(){if(pollingHandle){clearInterval(pollingHandle);pollingHandle=null;}pollBusy=false;}
  async function subscribeRoom(){
    stopPolling();
    if(channel&&db)await db.removeChannel(channel);
    channel=db.channel('spencer-live-'+roomId)
      .on('postgres_changes',{event:'*',schema:'public',table:'rooms',filter:'id=eq.'+roomId},async()=>{if(await loadRoom())await openExperience();})
      .on('postgres_changes',{event:'*',schema:'public',table:'players',filter:'room_id=eq.'+roomId},async()=>{await loadPlayers();if(currentRoom&&currentRoom.status!=='lobby')renderCurrentView();})
      .on('postgres_changes',{event:'*',schema:'public',table:'answers',filter:'room_id=eq.'+roomId},async()=>{if(settingsOf().gameKey==='quiz'||settingsOf().gameKey==='mix')await loadAnswers();})
      .on('postgres_changes',{event:'*',schema:'public',table:'creative_submissions',filter:'room_id=eq.'+roomId},async()=>{if(settingsOf().gameKey==='creative'||settingsOf().gameKey==='mix')await loadCreativeData();})
      .on('postgres_changes',{event:'*',schema:'public',table:'creative_votes',filter:'room_id=eq.'+roomId},async()=>{if(settingsOf().gameKey==='creative'||settingsOf().gameKey==='mix')await loadCreativeData();})
      .subscribe(status=>{realtimeState=status==='SUBSCRIBED'?'subscribed':String(status||'').toLowerCase();if(status==='SUBSCRIBED'){setDiagnostic('diag-realtime','Connected','good');setDiagnostic('diag-updates','Realtime','good');stopPolling();$('diag-note').textContent='REST and Realtime are connected.';}else if(status==='TIMED_OUT'){setDiagnostic('diag-realtime','Timed out','bad');startPolling('Realtime timed out.');}else if(status==='CHANNEL_ERROR'){setDiagnostic('diag-realtime','Connection error','bad');startPolling('Realtime could not connect.');}else if(status==='CLOSED'){setDiagnostic('diag-realtime','Disconnected','bad');startPolling('Realtime disconnected.');}else{setDiagnostic('diag-realtime','Connecting…','warn');}});
    setTimeout(()=>{if(roomId&&realtimeState!=='subscribed'){setDiagnostic('diag-realtime','Unavailable','bad');startPolling('Realtime did not establish promptly.');}},7000);
  }

  async function openExperience(){
    if(!currentRoom&&!(await loadRoom()))return;await loadPlayers();
    if(currentRoom.status==='lobby'){currentAnswers=[];currentSubmissions=[];currentVotes=[];openLobby();return;}
    if(isCreativeRoundState(gs()))await loadCreativeData();else await loadAnswers();renderCurrentView();
  }

  function renderRoomQr(value){const box=$('room-qr');if(!box)return;if(renderedQrValue===value&&box.childNodes.length)return;renderedQrValue=value;box.innerHTML='';try{if(window.SpencerQR){window.SpencerQR.render(box,value);return;}}catch(e){console.error(e);}box.innerHTML='<div class="room-qr-fallback">QR unavailable<br><small>Use code '+escapeHtml(roomCode||'----')+'</small></div>';}

  function openLobby(){
    stopTimers();stopAllMedia();$('room-code-display').textContent=roomCode||'----';const url=new URL(window.location.href);url.search='';url.hash='';url.searchParams.set('join',roomCode||'');const joinUrl=url.toString();$('join-url').textContent=joinUrl;$('qr-room-code').textContent=roomCode||'----';
    const showQr=role==='host';$('qr-join').classList.toggle('hidden',!showQr);if(showQr)renderRoomQr(joinUrl);
    $('lobby-title').textContent=role==='host'?'Your Spencer Live Lobby':'You’re in!';$('start-game').classList.toggle('hidden',role!=='host');$('start-game').disabled=role!=='host'||currentPlayers.length<1;
    const s=settingsOf();$('start-game').textContent='Start '+gameName(s.gameKey);
    const chips=['<span class="chip">'+(s.gameMode==='teams'?'👨‍👩‍👧‍👦 Teams':'👤 Individuals')+'</span>','<span class="chip">🎮 '+escapeHtml(gameName(s.gameKey))+'</span>'];
    if(s.gameKey==='quiz'){chips.push('<span class="chip">🧩 '+s.questionCount+' questions</span>','<span class="chip">'+(s.adaptive?'🧒 Family Adaptive':'🧠 Same questions')+'</span>','<span class="chip">⏱ '+s.questionSeconds+' sec</span>','<span class="chip">📚 '+escapeHtml(s.topics.length===quizTopics().length?'All topics':s.topics.join(' • '))+'</span>','<span class="chip">✅ 800 + up to 200 speed</span>');}
    else if(s.gameKey==='mix'){const q=s.mixOrder.filter(x=>x.startsWith('q:')).length,c=s.mixOrder.filter(x=>x.startsWith('c:')).length;chips.push('<span class="chip">🎲 '+s.roundCount+' rounds</span>','<span class="chip">🧠 '+q+' quiz</span>','<span class="chip">📸🎙️ '+c+' creative</span>','<span class="chip">'+(s.adaptive?'🧒 Family Adaptive':'🧠 Same questions')+'</span>','<span class="chip">📚 '+escapeHtml(s.topics.length===quizTopics().length?'All topics':s.topics.join(' • '))+'</span>');}
    else chips.push('<span class="chip">📸 Camera</span>','<span class="chip">🎙️ Microphone</span>','<span class="chip">🗳️ Anonymous voting</span>');
    $('settings-summary').innerHTML=chips.join('');
    $('lobby-note').textContent=role==='host'?'Scan the QR code or enter the room code. The host screen does not count toward the 20-player limit.':'Waiting for the host to start the game…';show('lobby');renderPlayers();
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
      let state;const key=settingsOf().gameKey;
      if(key==='creative'){
        await assertPhase3Ready();await cleanupCreativeMedia(true);state=newCreativeCaptureState(0);
      }else if(key==='mix'){
        await assertPhase3Ready();await cleanupCreativeMedia(true);state=newMixedState(0);
      }else state=newQuestionState(0);
      const {error}=await db.from('rooms').update({status:'playing',game_state:state,updated_at:new Date().toISOString()}).eq('id',roomId);if(error)throw error;
    }catch(e){serviceStatus.textContent=friendlyError(e);serviceStatus.className='status warn';$('start-game').disabled=false;}
  }
  function newQuestionState(index,extra={}){return {phase:'question',questionIndex:index,startedAt:new Date().toISOString(),paused:false,pausedStartedAt:null,pauseMs:0,...extra};}
  function newCreativeCaptureState(index,extra={}){const r=extra.creativeId?mixCreativeById.get(String(extra.creativeId)):creativeAt(index);return {phase:'creative_capture',creativeIndex:index,kind:r?r.kind:'picture',startedAt:new Date().toISOString(),voteStage:null,heatIndex:0,heatGroups:[],finalists:[],candidateIds:[],stageKey:null,lastWinners:[],stageVoteCounts:{},scored:false,...extra};}
  function newMixedState(index){const token=settingsOf().mixOrder[index];if(!token)return null;const [kind,id]=String(token).split(':');if(kind==='c'){const creativeIndex=mixCreativeRounds.findIndex(r=>String(r.id)===id);return newCreativeCaptureState(creativeIndex,{mixIndex:index,roundType:'creative',creativeId:id});}return newQuestionState(index,{mixIndex:index,roundType:'quiz',questionId:id});}

  function renderCurrentView(){
    if(!currentRoom)return;const state=gs();
    if(currentRoom.status==='finished'||state.phase==='finished'){renderFinished();return;}
    if(state.phase==='leaderboard'){renderLeaderboard();return;}
    if(settingsOf().gameKey==='creative'||isCreativeState(state)){renderCreativeView();return;}
    renderGame();
  }

  // ---------------- Quiz engine (Phase 2) ----------------
  function renderGame(){
    if(!currentRoom||currentRoom.status==='lobby')return;const state=gs(),q=questionForState(state);if(!q)return;
    const mixed=settingsOf().gameKey==='mix',current=mixed?Number(state.mixIndex):Number(state.questionIndex),total=mixed?mixTotal():quizTotal();show('game');$('round-category').textContent=(mixed?'🎲 QUIZ • ':'')+q.category.toUpperCase();$('round-title').textContent=mixed?'Round '+(current+1)+' of '+total+' • Quiz':'Question '+(current+1)+' of '+total;$('round-progress').style.width=((current+1)/total*100)+'%';
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
    if(role!=='player'||!currentRoom)return;const state=gs();if(state.phase!=='question'||state.paused||remainingMs()<=0)return;const p=myPlayer(),q=questionForState(state);if(!p||!q)return;const variant=questionVariant(q,p),v=q[variant],isCorrect=index===v.correct;
    const duration=settingsOf().questionSeconds*1000;const response=clamp(Math.round(effectiveElapsedMs()),0,duration);const speed=isCorrect?Math.round(200*(1-response/duration)):0;const points=isCorrect?800+clamp(speed,0,200):0;
    const row={room_id:roomId,player_id:playerId,question_index:Number(state.questionIndex),variant,answer_index:index,is_correct:isCorrect,response_ms:response,points};
    const {error}=await db.from('answers').insert(row);if(error){if(error.code!=='23505')console.error(error);return;}
    const newScore=(Number(p.score)||0)+points;await db.from('players').update({score:newScore}).eq('id',playerId);await loadAnswers();
  }

  function effectiveElapsedMs(){const state=gs();if(!state.startedAt)return 0;const start=new Date(state.startedAt).getTime();let end=Date.now();let pauses=Number(state.pauseMs)||0;if(state.paused&&state.pausedStartedAt)end=new Date(state.pausedStartedAt).getTime();return Math.max(0,end-start-pauses);}
  function remainingMs(){return Math.max(0,settingsOf().questionSeconds*1000-effectiveElapsedMs());}
  function startQuizTimer(){
    stopTimers();const update=()=>{const state=gs(),ms=remainingMs();$('timer').textContent=state.paused?'⏸':String(Math.ceil(ms/1000));if(role==='player'&&state.phase==='question'){const q=questionForState(state);if(q)renderAnswers(q[questionVariant(q,myPlayer())],state,false);}if(role==='host'&&state.phase==='question'&&!state.paused&&ms<=0&&!autoRevealBusy){autoRevealBusy=true;revealRound().finally(()=>{autoRevealBusy=false;});}};update();timerHandle=setInterval(update,500);
  }
  function renderHostAnswerCount(){const el=$('host-answer-count');if(!el)return;el.classList.toggle('hidden',role!=='host');if(role==='host')el.textContent='Answers: '+currentAnswers.length+' / '+currentPlayers.length;}
  async function togglePause(){const state={...gs()};if(state.phase!=='question')return;if(!state.paused){state.paused=true;state.pausedStartedAt=new Date().toISOString();}else{const pausedAt=new Date(state.pausedStartedAt).getTime();state.pauseMs=(Number(state.pauseMs)||0)+Math.max(0,Date.now()-pausedAt);state.paused=false;state.pausedStartedAt=null;}await updateGameState(state);}
  async function revealRound(){const state={...gs()};if(state.phase!=='question')return;state.phase='reveal';if(state.paused&&state.pausedStartedAt){state.pauseMs=(Number(state.pauseMs)||0)+Math.max(0,Date.now()-new Date(state.pausedStartedAt).getTime());state.paused=false;state.pausedStartedAt=null;}await updateGameState(state);}

  // ---------------- Creative rounds (Phase 3) ----------------
  function renderCreativeView(){
    const phase=gs().phase;if(phase==='creative_capture')renderCreativeCapture();else if(phase==='creative_vote')renderCreativeVote();else if(phase==='creative_result')renderCreativeResult();else renderCreativeCapture();
  }

  function creativeRoundKey(){const s=gs(),r=creativeRoundForState(s);return [roomId,s.mixIndex??s.creativeIndex,s.creativeId||s.creativeIndex,r&&r.kind].join(':');}
  function renderCreativeCounts(){
    if(!$('creative-host-count'))return;const s=gs();if(s.phase==='creative_capture')$('creative-host-count').textContent='Submissions: '+currentSubmissions.length+' / '+currentPlayers.length;
    if(s.phase==='creative_vote'){$('vote-progress-text').textContent=currentStageVotes().length+'/'+currentPlayers.length;}
  }

  function renderCreativeCapture(){
    const state=gs(),round=creativeRoundForState(state);if(!round)return;stopQuizOnly();show('creative-capture');
    const mixed=settingsOf().gameKey==='mix',current=mixed?Number(state.mixIndex):Number(state.creativeIndex),total=mixed?mixTotal():creative.rounds.length;$('creative-kind').textContent=(round.kind==='picture'?'📸 PICTURE':'🎙️ SOUND')+(mixed?' • MIX':'');$('creative-round-title').textContent=round.title+' • Round '+(current+1)+' of '+total;$('creative-progress').style.width=((current+1)/total*100)+'%';$('creative-prompt').textContent=round.prompt;
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
    if(role!=='player'||!blob)return;const state=gs(),round=creativeRoundForState(state);if(!round||state.phase!=='creative_capture')return;const btn=round.kind==='picture'?$('submit-photo'):$('submit-sound');btn.disabled=true;msg($('creative-player-status'),'Uploading your masterpiece…','success');
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
    const token=++renderSerial,state=gs(),round=creativeRoundForState(state);if(!round)return;stopTimers();stopAllMedia();show('creative-vote');$('vote-stage-pill').textContent=state.voteStage==='heat'?'🔥 HEAT '+(Number(state.heatIndex)+1)+'/'+(state.heatGroups||[]).length:'🏆 GRAND FINAL';$('vote-title').textContent=state.voteStage==='heat'?'Vote for the heat winner':'Vote for the overall winner';$('vote-prompt').textContent=round.prompt;renderCreativeCounts();
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
    const token=++renderSerial,state=gs(),round=creativeRoundForState(state);if(!round)return;stopTimers();stopAllMedia();show('creative-result');$('result-prompt').textContent=round.prompt;const heat=state.voteStage==='heat',winners=new Set(state.lastWinners||[]),counts=state.stageVoteCounts||{};$('creative-result-heading').innerHTML=heat?'🔥 <span>Heat Result</span>':'🏆 <span>Round Result</span>';
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

  async function advanceMixedRound(){const next=Number(gs().mixIndex)+1;if(next>=mixTotal()){await finishGame();return;}currentAnswers=[];currentSubmissions=[];currentVotes=[];captureRoundKey='';resetCaptureUI();const state=newMixedState(next);if(!state){await finishGame();return;}await updateGameState(state);}
  async function nextCreativeRound(){if(settingsOf().gameKey==='mix')return advanceMixedRound();const next=Number(gs().creativeIndex)+1;if(next>=creative.rounds.length){await finishGame();return;}currentSubmissions=[];currentVotes=[];captureRoundKey='';resetCaptureUI();await updateGameState(newCreativeCaptureState(next));}
  async function skipCreativeRound(){if(role!=='host')return;await nextCreativeRound();}

  // ---------------- Shared host / scoring / lifecycle ----------------
  async function updateGameState(next,status){if(role!=='host'||!currentRoom)return;const payload={game_state:next,updated_at:new Date().toISOString()};if(status)payload.status=status;const {error}=await db.from('rooms').update(payload).eq('id',roomId);if(error)throw error;}
  async function showLeaderboard(){await updateGameState({...gs(),phase:'leaderboard'});}
  async function nextQuestion(){const key=settingsOf().gameKey;if(key==='creative')return nextCreativeRound();if(key==='mix')return advanceMixedRound();const next=Number(gs().questionIndex)+1;if(next>=quizTotal()){await finishGame();return;}currentAnswers=[];await updateGameState(newQuestionState(next));}
  async function skipQuestion(){await nextQuestion();}
  async function finishGame(){if(role!=='host')return;try{if(settingsOf().gameKey==='creative'||settingsOf().gameKey==='mix')await cleanupCreativeMedia(true);}catch(e){console.error(e);}await updateGameState({...gs(),phase:'finished'},'finished');}

  function getLeaderboardRows(){
    const s=settingsOf();if(s.gameMode!=='teams')return currentPlayers.slice().sort((a,b)=>(b.score||0)-(a.score||0)).map(p=>({name:(p.avatar||'🙂')+' '+p.name,score:Number(p.score)||0}));
    const groups={};currentPlayers.forEach(p=>{const key=p.team||'No team';if(!groups[key])groups[key]=[];groups[key].push(Number(p.score)||0);});
    return Object.entries(groups).map(([name,scores])=>({name:name+' Team',score:Math.round(scores.reduce((a,b)=>a+b,0)/scores.length),members:scores.length})).sort((a,b)=>b.score-a.score);
  }
  function fillLeaderboard(target){const rows=getLeaderboardRows(),box=$(target);box.innerHTML='';if(!rows.length){box.innerHTML='<div class="empty">No scores yet.</div>';return;}rows.forEach((r,i)=>{const d=document.createElement('div');d.className='leader-row';d.innerHTML='<span class="rank">'+(i+1)+'</span><span class="who">'+escapeHtml(r.name)+(r.members?' <small>('+r.members+')</small>':'')+'</span><span class="pts">'+r.score+' pts</span>';box.appendChild(d);});}
  function renderLeaderboard(){stopTimers();stopAllMedia();show('leaderboard');const s=settingsOf(),state=gs();$('leaderboard-title').textContent=s.gameKey==='creative'?'🏆 Leaderboard • Creative Round '+(Number(state.creativeIndex)+1):s.gameKey==='mix'?'🏆 Leaderboard • Round '+(Number(state.mixIndex)+1)+' of '+mixTotal():'🏆 Leaderboard • Round '+(Number(state.questionIndex)+1);fillLeaderboard('leaderboard');$('next-question').classList.toggle('hidden',role!=='host');$('next-question').textContent=s.gameKey==='quiz'?'Next Question':'Next Round';$('player-wait-next').classList.toggle('hidden',role==='host');}
  function renderFinished(){stopTimers();stopAllMedia();show('finished');fillLeaderboard('final-leaderboard');$('play-again').classList.toggle('hidden',role!=='host');}
  async function playAgain(){
    if(role!=='host')return;await db.from('answers').delete().eq('room_id',roomId);const s=settingsOf();if(s.gameKey==='creative'||s.gameKey==='mix')await cleanupCreativeMedia(true);await db.from('players').update({score:0}).eq('room_id',roomId);
    if(s.gameKey==='quiz'){const order=buildQuestionOrder(s.topics,s.questionCount),nextSettings={...(currentRoom.settings||{}),questionOrder:order};const {error}=await db.from('rooms').update({settings:nextSettings,game_state:{},status:'lobby',updated_at:new Date().toISOString()}).eq('id',roomId);if(error)throw error;rememberQuestionIds(order);currentRoom={...currentRoom,settings:nextSettings,game_state:{},status:'lobby'};await openExperience();return;}
    if(s.gameKey==='mix'){const order=buildMixOrder(s.topics,s.roundCount),questionIds=order.filter(x=>x.startsWith('q:')).map(x=>x.slice(2)),creativeIds=order.filter(x=>x.startsWith('c:')).map(x=>x.slice(2)),nextSettings={...(currentRoom.settings||{}),mixOrder:order,questionOrder:questionIds,questionCount:questionIds.length};const {error}=await db.from('rooms').update({settings:nextSettings,game_state:{},status:'lobby',updated_at:new Date().toISOString()}).eq('id',roomId);if(error)throw error;rememberQuestionIds(questionIds);rememberCreativeIds(creativeIds);currentRoom={...currentRoom,settings:nextSettings,game_state:{},status:'lobby'};await openExperience();return;}
    await updateGameState({},'lobby');
  }

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
    stopTimers();stopPolling();stopAllMedia();if(channel&&db)await db.removeChannel(channel);channel=null;
    if(db&&roomId){try{if(role==='player'&&playerId){await cleanupPlayerMedia(playerId);await db.from('players').delete().eq('id',playerId);}else if(role==='host'){if(settingsOf().gameKey==='creative'||settingsOf().gameKey==='mix')await cleanupCreativeMedia(true);await db.from('rooms').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',roomId);}}catch(e){console.error(e);}}
    roomId=roomCode=role=playerId=null;currentRoom=null;currentPlayers=[];currentAnswers=[];currentSubmissions=[];currentVotes=[];clearSession();show('choice');
  }
  async function roomClosed(){stopTimers();stopPolling();stopAllMedia();if(channel&&db)await db.removeChannel(channel);channel=null;clearSession();roomId=roomCode=role=playerId=null;currentRoom=null;currentPlayers=[];currentAnswers=[];currentSubmissions=[];currentVotes=[];serviceStatus.textContent='That Spencer Live room has closed.';serviceStatus.className='status warn';show('choice');}

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
