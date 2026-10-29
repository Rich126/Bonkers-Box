const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/live.js','utf8');
class Server{
 constructor(realtime=true){this.realtime=realtime;this.clock=0;this.seq=0;this.tables={speedway_rooms:[],speedway_riders:[],speedway_results:[],speedway_fastest_laps:[]};this.channels=[];this.timers=new Map();this.frames=new Map();this.calls=[];this.failure=null;this.hold=null;}
 client(name){const server=this;return {from:t=>new Query(server,t,name),channel(id){const c={id,name,handlers:[],on(type,filter,cb){this.handlers.push({filter,cb});return this},subscribe(cb){server.channels.push(this);cb(server.realtime?'SUBSCRIBED':'CHANNEL_ERROR');return this}};return c},async removeChannel(c){server.channels=server.channels.filter(x=>x!==c)}};}
 emit(table,eventType,row){if(!this.realtime)return;for(const c of this.channels)for(const h of c.handlers){if(h.filter.table!==table)continue;const [key,value]=h.filter.filter.split('=eq.');if(row[key]!==value)continue;Promise.resolve().then(()=>h.cb({eventType,new:structuredClone(row),old:structuredClone(row)}));}}
 async settle(){for(let i=0;i<70;i++)await Promise.resolve();}
 async advance(ms){this.clock+=ms;for(const [id,t] of [...this.timers])if(t.due<=this.clock){if(t.interval)t.due=this.clock+t.interval;else this.timers.delete(id);t.fn();}await this.settle();}
}
class Query{
 constructor(server,table,name){Object.assign(this,{server,table,name,op:'select',filters:[],singleMode:false});}
 select(){return this}eq(k,v){this.filters.push([k,v]);return this}order(){return this}limit(){return this}maybeSingle(){this.singleMode=true;return this}single(){this.singleMode=true;return this}
 insert(payload){this.op='insert';this.payload=payload;return this}update(payload){this.op='update';this.payload=payload;return this}delete(){this.op='delete';return this}
 then(resolve,reject){if(!this.promise)this.promise=Promise.resolve().then(()=>this.execute());return this.promise.then(resolve,reject)}
 async execute(){const s=this.server;s.calls.push({table:this.table,op:this.op,name:this.name,payload:this.payload});
 if(s.failure&&s.failure.table===this.table&&s.failure.op===this.op){s.failure=null;return {data:null,error:{code:'NETWORK',message:'simulated failure'}}}
 const rows=s.tables[this.table];if(!rows)return {data:null,error:{message:'missing table'}};
 const matches=r=>this.filters.every(([k,v])=>r[k]===v);let data;
 if(this.op==='select')data=rows.filter(matches).map(r=>structuredClone(r));
 if(this.op==='insert'){
  const payload=structuredClone(this.payload);if(this.table==='speedway_rooms'&&rows.some(r=>r.code===payload.code))return {data:null,error:{code:'23505'}};
  if(this.table==='speedway_results'&&rows.some(r=>r.room_id===payload.room_id&&r.rider_id===payload.rider_id&&r.race_number===payload.race_number))return {data:null,error:{code:'23505'}};
  const defaults=this.table==='speedway_rooms'?{race_number:1,start_at:null}:this.table==='speedway_riders'?{finished:false,lap:0,progress_steps:0,finish_ms:null,best_lap_ms:null,heading:0,vel_angle:0,speed:0,steer:0}:{};
  const row={id:'id'+(++s.seq),...defaults,...payload};rows.push(row);data=[structuredClone(row)];s.emit(this.table,'INSERT',row);
 }
 if(this.op==='update'){data=[];for(const row of rows.filter(matches)){Object.assign(row,structuredClone(this.payload));data.push(structuredClone(row));s.emit(this.table,'UPDATE',row);}}
 if(this.op==='delete'){data=[];for(const row of rows.filter(matches)){rows.splice(rows.indexOf(row),1);data.push(row);s.emit(this.table,'DELETE',row);}}
 const result={data:this.singleMode?(data[0]||null):data,error:null};
 if(s.hold&&s.hold.table===this.table&&this.op==='select'){const hold=s.hold;s.hold=null;return new Promise(resolve=>hold.release=()=>resolve(result));}
 return result;
 }
}
function createClient(server,name){
 const els=new Map(),events=new Map(),canvas=new Proxy({},{get:()=>()=>{}});
 function el(id){if(els.has(id))return els.get(id);const classes=new Set(['hidden']);const e={id,value:'',textContent:'',innerHTML:'',disabled:false,style:{setProperty(){}},classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,on){if(on===undefined)on=!classes.has(x);on?classes.add(x):classes.delete(x)}},appendChild(){},addEventListener(k,fn){events.set(id+':'+k,fn)},setAttribute(){},setPointerCapture(){},getContext:()=>canvas,focus(){}};els.set(id,e);return e;}
 const context={console:{error(){}},document:{getElementById:el,createElement:el,querySelectorAll:()=>[],addEventListener(k,fn){events.set('document:'+k,fn)},hidden:false},window:{supabase:{createClient:()=>server.client(name)},SPENCER_LIVE_CONFIG:{SUPABASE_URL:'https://example.invalid',SUPABASE_ANON_KEY:'test'},PointerEvent:function(){},addEventListener(k,fn){events.set('window:'+k,fn)}},localStorage:{getItem:()=>null,setItem(){}},location:{href:'https://example.invalid/speedway/live.html',search:''},URL,URLSearchParams,Path2D:class{moveTo(){}lineTo(){}closePath(){}},Date:class extends Date{constructor(...args){super(...(args.length?args:[1700000000000+server.clock]))}static now(){return 1700000000000+server.clock}},performance:{now:()=>server.clock},setTimeout(fn,ms){const id=++server.seq;server.timers.set(id,{fn,due:server.clock+ms,name});return id},clearTimeout:id=>server.timers.delete(id),setInterval(fn,ms){const id=++server.seq;server.timers.set(id,{fn,due:server.clock+ms,interval:ms,name});return id},clearInterval:id=>server.timers.delete(id),requestAnimationFrame(fn){const id=++server.seq;server.frames.set(id,{fn,name});return id},cancelAnimationFrame:id=>server.frames.delete(id)};
 vm.createContext(context);
 const hook=`globalThis.test={create:async(name)=>{$('hostName').value=name;$('hostLaps').value='3';await createRoom()},join:async(code,name,colour)=>{$('joinCode').value=code;$('riderName').value=name;selectedColour=colour;await joinRoom()},start:startRace,arm:armRace,sync:syncRoom,reset:resetRoomForHeat,leave:leave,close:closeRoom,finish:async()=>{lapTimes=[2000,2000,2000];startTs=performance.now()-6000;bike.lap=3;bike.progress_steps=TRACK_N*3;await finishLocal(performance.now())},retry:()=>finishLocal(performance.now()),state:()=>({room:room&&JSON.parse(JSON.stringify(room)),riders:JSON.parse(JSON.stringify(riders)),role,myId,running,bike:bike&&JSON.parse(JSON.stringify(bike)),startTs,armedKey,startedKey,pending:!!pendingFinish}),late:loadRoom,accept:acceptRoom,press};`;
 vm.runInContext(source.replace("renderTrack();loadAllTimeBoard();",hook+"renderTrack();loadAllTimeBoard();"),context);
 return {api:context.test,el,events,context};
}
async function scenario(realtime){const server=new Server(realtime),host=createClient(server,'host'),a=createClient(server,'a'),b=createClient(server,'b');await server.settle();await host.api.create('Host');const code=host.api.state().room.code;await a.api.join(code,'Alice',0);await b.api.join(code,'Bob',1);await server.advance(1200);assert.equal(host.api.state().riders.length,2);
 server.failure={table:'speedway_riders',op:'update'};await host.api.start();assert.equal(host.api.state().room.status,'lobby','Failed reset must not start heat');assert.equal(host.el('startRace').disabled,false);
 await host.api.start();await server.settle();await server.advance(1200);const startKey=a.api.state().armedKey;for(let i=0;i<5;i++)a.api.arm();assert.equal(a.api.state().armedKey,startKey);
 await server.advance(5000);await server.advance(1100);assert.equal(server.tables.speedway_rooms[0].status,'racing','Lazy host status write must execute');assert(a.api.state().running);assert(b.api.state().running);assert.equal([...server.frames.values()].filter(f=>f.name==='a').length,1,'Exactly one rider loop');const originalStart=a.api.state().startTs;const old={...a.api.state().room,status:'lobby'};assert.equal(a.api.accept(old),false,'Delayed lobby response cannot rewind an active heat');await a.api.sync();a.api.arm();assert.equal(a.api.state().startTs,originalStart,'Reconnect must not restart timer');
 assert.equal(originalStart,Date.parse(server.tables.speedway_rooms[0].start_at)-1700000000000,'Late rider uses scheduled epoch, not local arrival time');
 a.events.get('leftBtn:pointerdown')({cancelable:true,preventDefault(){},pointerId:1});assert(a.el('leftBtn').classList.contains('active'));a.events.get('leftBtn:lostpointercapture')({});assert(!a.el('leftBtn').classList.contains('active'));
 server.failure={table:'speedway_riders',op:'update'};await a.api.finish();assert(a.api.state().pending);assert(!server.tables.speedway_riders.find(r=>r.name==='Alice').finished);server.failure={table:'speedway_results',op:'insert'};await a.api.retry();assert(a.api.state().pending);assert(!a.el('retryFinish').classList.contains('hidden'));await a.api.retry();assert(!a.api.state().pending);await b.api.finish();await server.advance(200);await server.advance(1200);assert.equal(server.tables.speedway_rooms[0].status,'finished');assert.equal(server.tables.speedway_results.length,2);await server.advance(1200);assert(!a.el('results').classList.contains('hidden'));assert(!b.el('results').classList.contains('hidden'));
 await host.api.reset();await server.advance(1200);assert.equal(a.api.state().room.race_number,2);assert.equal(a.api.state().bike.progress_steps,0);assert(!a.api.state().running);
 await host.api.start();await server.advance(1200);await server.advance(5000);await server.advance(1200);assert(a.api.state().running);await a.api.finish();await b.api.leave();await server.advance(200);await server.advance(1200);assert.equal(server.tables.speedway_rooms[0].status,'finished','Departing rider cannot block completed heat');
 await host.api.close();await server.advance(1200);assert.equal(a.api.state().room,null);assert.equal(server.frames.size,0);assert.equal(server.timers.size,0,'Leave closes timers');console.log('PASS:',realtime?'Realtime':'Polling fallback','host + 2 riders, failed start, shared countdown, one loop, controls, finish retry, results, rematch, leave/close');}
async function stale(){const s=new Server(),h=createClient(s,'host');await s.settle();await h.api.create('Host');const hold={table:'speedway_rooms'};s.hold=hold;const pending=h.api.late();await s.settle();await h.api.leave();hold.release();await pending;assert.equal(h.api.state().room,null);assert.equal(s.timers.size,0);console.log('PASS: late room response cannot restore a left session');}
(async()=>{await scenario(true);await scenario(false);await stale();})().catch(e=>{console.error(e);process.exitCode=1});
