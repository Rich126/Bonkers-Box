const assert=require('node:assert/strict'),C=require('../core.js'),E=require('../event.js');
function tick(s,seconds){for(let t=0;t<Math.ceil(seconds*20);t++)C.step(s,{},.05);}
function approach(s,m){C.close(s);s.player.x=m.x;s.player.y=m.y+44;assert(!C.collides(s,s.player.x,s.player.y));assert(C.open(s,m.id));}
function action(s,m,id){assert(C.startAction(s,m.id,id),id+' unavailable');tick(s,C.actions[id].seconds+.1);}
function repair(s,m){if(['jam','fuse','brownout'].includes(m.fault))action(s,m,'powerOff');if(!['brownout'].includes(m.fault))action(s,m,C.faults[m.fault].fix);if(!m.powered)action(s,m,'powerOn');assert(m.resolved);assert(!m.fixed,'Must prove the fix');action(s,m,'test');assert(m.fixed);}
assert.equal(E.endsAt-E.startsAt,14*86400000);assert(!E.isOpen(E.startsAt-1));assert(E.isOpen(E.startsAt));assert(E.isOpen(E.endsAt-1));assert(!E.isOpen(E.endsAt));
for(let seed=0;seed<150;seed++){
 const s=C.create(seed),ids=s.stations.map(m=>m.fault);assert.equal(new Set(ids).size,6);for(const id of ['home','plc','brownout'])assert(ids.includes(id));for(const m of s.stations)assert(m.allowed.includes(m.fault));assert.deepEqual(ids,C.create(seed).stations.map(m=>m.fault));
 // Every service point is reachable through collision-tested, four-way movement.
 if(seed===0){const seen=new Set(),q=[[396,456]];for(let at=0;at<q.length;at++){const [x,y]=q[at],key=x+','+y;if(seen.has(key))continue;seen.add(key);for(const [dx,dy]of [[4,0],[-4,0],[0,4],[0,-4]]){const nx=x+dx,ny=y+dy;if(!seen.has(nx+','+ny)&&!C.collides(s,nx,ny))q.push([nx,ny]);}}for(const m of s.stations)assert(seen.has(m.x+','+(m.y+44)),m.name+' unreachable');}
 assert(C.report(s).every(r=>r.cause===null));for(const m of s.stations){approach(s,m);action(s,m,'panel');repair(s,m);}assert.equal(s.status,'won');assert(s.score>9000);const score=s.score;assert(!C.startAction(s,s.stations[0].id,'test'));tick(s,20);assert.equal(s.score,score);
}
let s=C.create('interlocks'),m=s.stations.find(m=>m.fault==='home');approach(s,m);assert(!C.canAction(s,m.id,'jam'));assert(!C.canAction(s,m.id,'fuse'));action(s,m,'reset');assert(!m.resolved);assert.equal(m.mistakes,1);assert(s.remaining<480-12);assert(!C.report(s).find(r=>r.id===m.id).cause);assert(C.startAction(s,m.id,'home'));assert(!C.close(s));const clock=s.clock;C.pause(s);tick(s,10);assert.equal(s.clock,clock);C.pause(s,false);tick(s,6.1);assert(m.resolved);assert(!m.fixed);action(s,m,'test');assert(m.fixed);
s=C.create('checks');m=s.stations[0];approach(s,m);action(s,m,'powerOff');action(s,m,'panel');assert(m.notes.panel.includes('dark'));action(s,m,'powerOn');const before=s.clock;assert(C.startAction(s,m.id,'panel'));assert.equal(s.clock,before);assert(!m.notes.panel.includes('dark'));assert.equal(m.checks.length,1);C.close(s);s.player.x=396;s.player.y=456;assert(!C.open(s,m.id));assert(!C.startAction(s,m.id,'reset'));
s=C.create('timeout');tick(s,481);assert.equal(s.status,'lost');assert(C.report(s).every(r=>r.cause));
// Link reset and a power cycle are both reasonable remedies for a link timeout.
for(const mode of ['link','cycle']){s=C.create('link-'+mode);m=s.stations[2];m.fault='link';approach(s,m);if(mode==='link')action(s,m,'link');else{action(s,m,'powerOff');action(s,m,'powerOn');}action(s,m,'test');assert(m.fixed);}
console.log('PASS: 150 seeded shifts, collision reachability, all faults, repair interlocks, hidden clues, penalties, pause, timeout, scoring and 14-day boundaries.');
