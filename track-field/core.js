/* Original Spencer Games athletics simulation. Metres, seconds, fixed-step friendly. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Thingimagig=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const events={sprint:{id:'sprint',name:'100m Sprint',unit:'s',attempts:1,board:100},jump:{id:'jump',name:'Long Jump',unit:'m',attempts:3,board:28},javelin:{id:'javelin',name:'Javelin',unit:'m',attempts:3,board:36}};
function create(id){if(!events[id])throw Error('Unknown event');return {event:id,x:0,speed:0,time:0,lastTap:-100,lastFoot:null,steps:0,combo:0,aim:false,aimTime:0,angle:18,phase:'run',height:0,vx:0,vy:0,flight:null,result:null,message:'Find a left–right rhythm',penalty:0,falseStart:false};}
function tap(s,foot){if(s.phase!=='run'||!['left','right'].includes(foot)||s.time-s.lastTap<.055)return false;const alternate=foot!==s.lastFoot;const gap=s.time-s.lastTap;s.lastFoot=foot;s.lastTap=s.time;s.steps++;if(!alternate){s.speed=Math.max(0,s.speed-.22);s.combo=0;s.message='Alternate feet — same foot breaks your stride';return false;}s.combo=gap<.65?s.combo+1:1;s.speed=clamp(s.speed+1.18+(s.combo>5?.12:0),0,11.6);s.message=s.speed>9?'Flying! Keep that rhythm':s.combo>3?'Good rhythm — keep alternating':'Left, right, left, right';return true;}
function hold(s){if(s.phase!=='run'||s.event==='sprint'||s.aim)return;s.aim=true;s.aimTime=0;s.angle=18;s.message='Keep running. Release before the white line.';}
function cancelAim(s){s.aim=false;s.aimTime=0;s.angle=18;}
function finish(s,value,foul=false,reason=''){s.phase='done';s.result={value:foul?null:value,foul,reason};s.message=reason;}
function release(s){if(!s.aim||s.phase!=='run')return false;s.aim=false;const board=events[s.event].board;if(s.x>board){finish(s,null,true,s.event==='jump'?'FOUL · over the takeoff board':'FOUL · crossed the throw line');return false;}if(s.speed<2){finish(s,null,true,'No mark · build more run-up speed');return false;}const a=s.angle*Math.PI/180;
 if(s.event==='jump'){const speed=s.speed*.78;s.phase='flight';s.height=.9;s.vx=speed*Math.cos(a);s.vy=speed*Math.sin(a)+.3;s.message='Reach for the sand!';}
 else{const speed=s.speed*2.05+6;s.phase='flight';s.flight={x:s.x,y:1.9,vx:speed*Math.cos(a),vy:speed*Math.sin(a)};s.message='It’s away!';}return true;}
function step(s,dt){if(s.phase==='done')return;dt=clamp(dt,0,.02);const before=s.time;s.time+=dt;
 if(s.phase==='run'){const old=s.x;s.speed=Math.max(0,s.speed-(s.time-s.lastTap>.35?2.8:1.0)*dt);s.x+=s.speed*dt;if(s.aim){s.aimTime+=dt;s.angle=18+clamp(s.aimTime/.8,0,1)*47;}
  if(s.event==='sprint'&&s.x>=100){finish(s,before+dt*(100-old)/Math.max(.000001,s.x-old)+s.penalty,false,'FINISH!');return;}
  if(s.event!=='sprint'&&s.x>events[s.event].board+.1){finish(s,null,true,s.event==='jump'?'FOUL · missed the takeoff board':'FOUL · crossed the throw line');return;}
  if(s.time>35){finish(s,null,true,'No mark · attempt timed out');return;}
 }else if(s.event==='jump'){const oldH=s.height,oldX=s.x;s.vy-=9.81*dt;s.height+=s.vy*dt;s.x+=s.vx*dt;if(s.height<=0){const land=oldX+(s.x-oldX)*oldH/Math.max(.00001,oldH-s.height);s.x=land;s.height=0;const mark=land-events.jump.board;finish(s,Math.max(0,mark),mark<=0,mark<=0?'No mark · takeoff was too early':'Measured from the white takeoff board');}}
 else{const f=s.flight,oldH=f.y,oldX=f.x;f.vx*=Math.exp(-.055*dt);f.vy-=9.81*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y<=0){f.x=oldX+(f.x-oldX)*oldH/Math.max(.00001,oldH-f.y);f.y=0;const mark=f.x-events.javelin.board;finish(s,Math.max(0,mark),mark<=0,mark<=0?'No mark · release was too early':'Measured from the white throw line');}}
}
function best(id,attempts){const marks=attempts.filter(r=>r&&Number.isFinite(r.value)&&!r.foul).map(r=>r.value);return marks.length?(id==='sprint'?Math.min(...marks):Math.max(...marks)):null;}
function rank(id,marks){return marks.map((value,player)=>({player,value})).sort((a,b)=>a.value===null?b.value===null?a.player-b.player:1:b.value===null?-1:id==='sprint'?a.value-b.value:b.value-a.value).map((r,i,all)=>({...r,rank:r.value===null?null:1+all.filter(a=>a.value!==null&&(id==='sprint'?a.value<r.value-.000001:a.value>r.value+.000001)).length}));}
function standings(ids,players,results){const points=[10,8,6,5,4,3,2,1],rows=players.map((name,player)=>({player,name,points:0,gold:0,silver:0,bronze:0}));for(const id of ids){const ordered=rank(id,rows.map(r=>best(id,results[id]?.[r.player]||[])));for(const entry of ordered){if(entry.rank===null)continue;const row=rows[entry.player];row.points+=points[entry.rank-1]||1;if(entry.rank===1)row.gold++;if(entry.rank===2)row.silver++;if(entry.rank===3)row.bronze++;}}return rows.sort((a,b)=>b.points-a.points||b.gold-a.gold||b.silver-a.silver||b.bronze-a.bronze||a.player-b.player);}
return {events,create,tap,hold,cancelAim,release,step,best,rank,standings,clamp};
});
