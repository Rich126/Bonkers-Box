/* Original Supercross prototype. Guided arcade dynamics, not recovered game code. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SupercrossCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),G=600;
function path(points){let total=0;const pts=points.map((p,i)=>{if(i)total+=Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y);return {...p,s:total}});return {pts,total};}
function smoothLoop(points){const out=[];for(let i=0;i<points.length;i++){const a=points[(i-1+points.length)%points.length],b=points[i],c=points[(i+1)%points.length],d=points[(i+2)%points.length];for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t;out.push({x:.5*(2*b[0]+(-a[0]+c[0])*t+(2*a[0]-5*b[0]+4*c[0]-d[0])*t2+(-a[0]+3*b[0]-3*c[0]+d[0])*t3),y:.5*(2*b[1]+(-a[1]+c[1])*t+(2*a[1]-5*b[1]+4*c[1]-d[1])*t2+(-a[1]+3*b[1]-3*c[1]+d[1])*t3)});}}out.push({...out[0]});return path(out);}
function sample(route,s){s=((s%route.total)+route.total)%route.total;let lo=0,hi=route.pts.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(route.pts[mid].s<=s)lo=mid;else hi=mid;}const a=route.pts[lo],b=route.pts[lo+1],t=clamp((s-a.s)/Math.max(.00001,b.s-a.s),0,1);return {x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),input:mix(a.input||300,b.input||300,t)};}
function heading(route,s){const a=sample(route,s-10),b=sample(route,s+10);return Math.atan2(b.y-a.y,b.x-a.x);}
function bend(route,s){return wrap(heading(route,s+18)-heading(route,s-18))/36;}
function project(route,p,near=null,reach=80){let best=Infinity,out=null;for(let i=0;i<route.pts.length-1;i++){const a=route.pts[i],b=route.pts[i+1];if(near!==null){const mid=(a.s+b.s)/2,ds=wrapDistance(mid-near,route.total);if(Math.abs(ds)>reach+Math.hypot(b.x-a.x,b.y-a.y))continue;}const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/Math.max(.000001,dx*dx+dy*dy),0,1),x=a.x+dx*t,y=a.y+dy*t,d=(p.x-x)**2+(p.y-y)**2;if(d<best){best=d;const h=Math.atan2(dy,dx);out={s:mix(a.s,b.s,t),x,y,distance:Math.sqrt(d),offset:-(p.x-x)*Math.sin(h)+(p.y-y)*Math.cos(h),heading:h};}}return out||project(route,p);}
function wrapDistance(s,total){return ((s+total/2)%total+total)%total-total/2;}
const venues=[
 {id:'stadium',name:'Stadium Flow',points:[[200,610],[700,610],[1050,600],[1120,510],[1060,420],[700,420],[280,420],[190,330],[230,230],[600,230],[1000,230],[1100,150],[1040,75],[600,75],[190,75],[70,160],[70,400],[70,560]],width:64,
 zones:[{type:'rhythm',start:.015,end:.085,count:3,height:15.5},{type:'berm',start:.16,end:.23},{type:'whoops',start:.26,end:.35,count:9,height:3.5},{type:'rut',start:.39,end:.47},{type:'jump',start:.51,end:.62,height:24},{type:'berm',start:.64,end:.71},{type:'rhythm',start:.74,end:.80,count:2,height:16},{type:'rut',start:.88,end:.96}]},
 {id:'technical',name:'Arena Technical',points:[[180,610],[700,610],[1080,600],[1130,510],[1070,430],[820,435],[620,400],[400,435],[240,420],[170,330],[240,250],[440,250],[620,210],[820,250],[1040,240],[1110,140],[1030,70],[560,70],[170,85],[60,165],[60,420],[60,560]],width:60,
 zones:[{type:'jump',start:.025,end:.15,height:23},{type:'berm',start:.17,end:.24},{type:'rhythm',start:.27,end:.34,count:4,height:12},{type:'rut',start:.44,end:.51},{type:'whoops',start:.54,end:.64,count:11,height:4},{type:'berm',start:.66,end:.73},{type:'jump',start:.76,end:.85,height:15},{type:'rut',start:.88,end:.97}]}
];
function makeTrack(index=0){const venue=venues[index]||venues[0],route=smoothLoop(venue.points);const zones=venue.zones.map((z,i)=>({...z,id:i,start:z.start*route.total,end:z.end*route.total}));return {...route,...venue,zones};}
function features(track,s){s=((s%track.total)+track.total)%track.total;return track.zones.filter(z=>s>=z.start&&s<=z.end);}
function jumpCells(track){const out=[];for(const z of track.zones)if(z.type==='jump'||z.type==='rhythm'){const n=z.count||1,len=(z.end-z.start)/n;for(let i=0;i<n;i++)out.push({id:z.id+'-'+i,zone:z,type:z.type,start:z.start+i*len,lip:z.start+(i+.27)*len,land:z.start+(i+(z.type==='jump'?.50:.62))*len,end:z.start+(i+1)*len,height:z.height});}return out;}
function terrain(track,s){s=((s%track.total)+track.total)%track.total;let height=0,slope=0,curve=0,type='dirt';
 for(const cell of track.jumps){if(s<cell.start||s>cell.end)continue;const h=cell.height;if(s<=cell.lip){const l=cell.lip-cell.start,u=(s-cell.start)/l;height=h*u*u;slope=2*h*u/l;curve=2*h/(l*l);}else if(s>=cell.land){const l=cell.end-cell.land,u=(cell.end-s)/l;height=h*u*u;slope=-2*h*u/l;curve=2*h/(l*l);}type=cell.type;}
 for(const z of features(track,s))if(z.type==='whoops'){const period=(z.end-z.start)/z.count,w=2*Math.PI/period,u=s-z.start;height=z.height*(1-Math.cos(w*u))*.5;slope=z.height*w*Math.sin(w*u)*.5;curve=z.height*w*w*Math.cos(w*u)*.5;type='whoops';}
 return {height,slope,curve,type};}
function prepareTrack(index=0){const t=makeTrack(index);t.jumps=jumpCells(t);return t;}
function makePlan(raw){if(raw.length<12)throw Error('Draw a complete lap first.');let pts=raw.slice(0,-1).map(p=>({...p}));for(let pass=0;pass<2;pass++)pts=pts.map((p,i)=>{let x=0,y=0,v=0;for(let j=-2;j<=2;j++){const q=pts[(i+j+pts.length)%pts.length];x+=q.x;y+=q.y;v+=q.input||300;}return {x:x/5,y:y/5,input:v/5}});pts.push({...pts[0]});return path(pts);}
function targetSpeed(input){return clamp(65+input*.38,95,320);}
function createBike(plan,index=0){const p=sample(plan,0),h=heading(plan,0);return {index,x:p.x,y:p.y,s:0,trackS:0,speed:0,acceleration:0,angle:h,travel:h,lean:0,z:0,vz:0,pitch:0,pitchRate:0,grounded:true,lastLip:null,airFrom:null,recovery:0,time:0,lap:0,finished:false,finishTime:null,event:'Clean line',eventTimer:0,stats:{airtime:0,rough:0,cased:0,overjump:0,cleanLandings:0,rutCrossings:0,whoopHits:0,links:0,bestLink:1,offroad:0,maxHeight:0},lastWhoop:null};}
function announce(b,text){b.event=text;b.eventTimer=1.2;}
function crossed(a,b,mark,total){return Math.floor((a-mark)/total)<Math.floor((b-mark)/total);}
function step(b,plan,track,dt,laps=3,control=null){if(b.finished)return;dt=clamp(dt,0,.02);if(!dt)return;b.time+=dt;b.eventTimer=Math.max(0,b.eventTimer-dt);b.recovery=Math.max(0,b.recovery-dt);
 const ground=project(track,b,b.trackS,130),worldS=ground.s,local=features(track,worldS),curve=bend(plan,b.s),roadCurve=bend(track,worldS),onRoad=ground.distance<track.width*.5;
 const berm=local.some(z=>z.type==='berm')&&ground.offset*(-Math.sign(roadCurve||1))>4&&ground.distance<track.width*.5;
 const rut=local.some(z=>z.type==='rut')&&onRoad;const rutOffset=ground.offset>=0?12:-12,rutDistance=Math.abs(ground.offset-rutOffset),aligned=Math.abs(wrap(b.travel-ground.heading));const locked=!!(rut&&rutDistance<7&&aligned<.3);
 const rutCrossing=!!(rut&&rutDistance<7&&aligned>.4&&b.grounded);if(rutCrossing&&!b.wasRutCrossing){b.stats.rutCrossings++;b.recovery=Math.max(b.recovery,.25);announce(b,'Crossing a rut — tyres deflected');}b.wasRutCrossing=rutCrossing;
 const lateralGrip=(onRoad?460:180)*(berm?1.45:1)*(locked?1.12:1)*(rutCrossing?.7:1),load=b.speed*b.speed*Math.abs(curve)/lateralGrip;
 let target=control?(control.brake?0:clamp(control.throttle||0,0,1)*320):targetSpeed(sample(plan,b.s).input);
 if(!control)for(const ahead of [25,50,85])target=Math.min(target,Math.sqrt(targetSpeed(sample(plan,b.s+ahead).input)**2+2*230*ahead));
 if(!onRoad){target=Math.min(target,90);b.stats.offroad+=dt;if(b.eventTimer<=0)announce(b,'Runoff — soft dirt costs speed');}
 if(b.grounded&&load>1.1){if(b.eventTimer<=0)announce(b,berm?'Berm overloaded — brake earlier':'Front pushing wide — reduce entry speed');}
 if(b.recovery>0)target*=.72;
 const braking=control?(control.brake?300:(control.throttle||0)<.05?70:230):260;
 if(b.grounded){let wanted=clamp((target-b.speed)*3,-braking,170);if(wanted>0)wanted*=clamp(1-Math.max(0,load-.7)*.6,.05,1);b.acceleration+=clamp(wanted-b.acceleration,-900*dt,900*dt);b.speed=Math.max(0,b.speed+b.acceleration*dt);}else{b.acceleration*=Math.exp(-8*dt);b.speed=Math.max(0,b.speed-2*dt);}
 const tangent=heading(plan,b.s),aim=sample(plan,b.s+clamp(b.speed*.28,30,80));let desired=Math.atan2(aim.y-b.y,aim.x-b.x);
 if(locked)desired=ground.heading+clamp((rutOffset-ground.offset)*.012,-.12,.12);
 const turnRate=(b.grounded?lateralGrip/Math.max(40,b.speed):0);b.travel=wrap(b.travel+clamp(wrap(desired-b.travel),-turnRate*dt,turnRate*dt));
 b.angle=wrap(b.angle+wrap(b.travel-b.angle)*(1-Math.exp(-9*dt)));const leanTarget=b.grounded?clamp(Math.atan2(b.speed*b.speed*curve,600)-(berm?Math.sign(curve)*.16:0),-.85,.85):b.lean*.99;b.lean+=(leanTarget-b.lean)*(1-Math.exp(-8*dt));
 b.movementSpeed=b.speed;
 b.x+=Math.cos(b.travel)*b.speed*dt;b.y+=Math.sin(b.travel)*b.speed*dt;
 const along=project(plan,b,b.s,100),delta=wrapDistance(along.s-(b.s%plan.total),plan.total);b.s+=clamp(delta,0,Math.max(12,b.speed*dt*3));
 const nextGround=project(track,b,worldS,130),nextS=nextGround.s,advance=wrapDistance(nextS-worldS,track.total),unwrapped=worldS+Math.max(0,advance);const terrainNow=nextGround.distance<track.width*.55?terrain(track,nextS):{height:0,slope:0,curve:0,type:'runoff'};
 if(b.grounded){
  for(const cell of track.jumps)if(onRoad&&crossed(worldS,unwrapped,cell.lip,track.total)&&b.lastLip!==cell.id){b.lastLip=cell.id;b.grounded=false;b.z=cell.height+.1;b.vz=2*cell.height/(cell.lip-cell.start)*b.speed*(cell.type==='jump'?.95:.78);b.airFrom={...cell,lapS:unwrapped-cell.lip};b.pitch=Math.atan2(b.vz,b.speed)*.6;announce(b,cell.type==='rhythm'?'Rhythm takeoff — link the next landing':'Takeoff — speed sets your range');break;}
  if(b.grounded&&terrainNow.type==='whoops'&&600+b.speed*b.speed*terrainNow.curve<0){b.grounded=false;b.vz=terrainNow.slope*b.speed;b.z=terrainNow.height+.05;b.airFrom=null;if(b.eventTimer<=0)announce(b,'Skimming the whoops');}
  if(b.grounded){b.z=terrainNow.height;b.vz=terrainNow.slope*b.speed;const pitchTarget=Math.atan(terrainNow.slope);b.pitch+=(pitchTarget-b.pitch)*(1-Math.exp(-12*dt));
   if(terrainNow.type==='whoops'&&b.speed<155){const zone=track.zones.find(z=>z.type==='whoops'&&nextS>=z.start&&nextS<=z.end);const hit=zone?Math.floor(b.s/plan.total)+':'+zone.id+':'+Math.floor((nextS-zone.start)/(zone.end-zone.start)*zone.count):null;if(hit!==b.lastWhoop){b.stats.whoopHits++;b.lastWhoop=hit;b.speed*=.97;if(b.eventTimer<=0)announce(b,'Whoops impacts — losing drive');}}
  }
 }else{
  b.stats.airtime+=dt;b.vz-=G*dt;b.z+=b.vz*dt;b.stats.maxHeight=Math.max(b.stats.maxHeight,b.z);
  const pitchTarget=control?(control.brake?-.42:(clamp(control.throttle||0,0,1)-.45)*.6):clamp((target-b.speed)*.001,-.18,.12)-.08;b.pitchRate+=(18*wrap(pitchTarget-b.pitch)-7*b.pitchRate)*dt;b.pitch+=b.pitchRate*dt;
  if(b.z<=terrainNow.height&&b.vz<terrainNow.slope*b.speed){
   const impact=Math.abs(b.vz-terrainNow.slope*b.speed),pitchError=Math.abs(wrap(b.pitch-Math.atan(terrainNow.slope)));
   const from=b.airFrom,landingS=from?from.lip+wrapDistance(nextS-from.lip,track.total):0;let loss=0;
   const candidates=from?(from.type==='rhythm'?track.jumps.filter(c=>c.zone.id===from.zone.id&&c.start>=from.start):[from]):[];
   const landing=candidates.find(c=>landingS>=c.land-4&&landingS<=c.end+5);
   const frontFace=from&&landing&&landingS<landing.land+4&&b.z<terrainNow.height-2;
   if(from&&(!landing&&landingS<=candidates.at(-1).end+5||frontFace)){b.stats.cased++;loss=.20;announce(b,'Short landing / case — drive interrupted');}
   else if(from&&!landing){b.stats.overjump++;loss=.14;announce(b,'Overjump — flat landing costs drive');}
   else if(impact>190||pitchError>.55){b.stats.rough++;loss=.16;announce(b,'Hard landing — suspension recovering');}
   else{b.stats.cleanLandings++;const linked=landing?candidates.indexOf(landing)+1:1;if(linked>1){b.stats.links++;b.stats.bestLink=Math.max(b.stats.bestLink,linked);announce(b,`Linked ${linked} jumps — clean downslope`);}else if(from)announce(b,'Clean downslope — drive preserved');}
   if(loss){b.speed*=1-loss;b.recovery=Math.max(b.recovery,.65);}
   b.z=terrainNow.height;b.vz=terrainNow.slope*b.speed;b.grounded=true;b.airFrom=null;b.pitchRate*=.3;
  }
 }
 b.lastLip=b.grounded&&b.airFrom===null?null:b.lastLip;
 b.trackS=nextS;b.lap=Math.min(laps,Math.floor(b.s/plan.total));b.berm=berm;b.rut=locked;b.load=load;b.surface=terrainNow.type;
 if(b.eventTimer<=0)b.event=!b.grounded?'Airborne — hold the line':locked?'In the rut — tracking cleanly':berm?'Berm support — outside line holds speed':'Clean line — building speed';
 if(b.s>=plan.total*laps){b.finished=true;b.finishTime=b.time;announce(b,'Finish');}
 return b;
}
return {clamp,mix,wrap,path,sample,heading,bend,project,wrapDistance,venues,prepareTrack,features,terrain,makePlan,targetSpeed,createBike,step,G};
});
