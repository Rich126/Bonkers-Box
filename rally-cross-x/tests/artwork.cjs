const fs=require('fs');
const bootstrap="\nconst els=new Map();\nfunction el(id){if(els.has(id))return els.get(id);const e={id,style:{},dataset:{},value:({mode:'solo',localCount:'2',laps:'1',difficulty:'medium',tuneSlide:'1.5',tuneGrip:'.7',tunePunish:'2.6',tuneFast:'272'})[id]||'',hidden:false,innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(type,fn){this[type]=fn},appendChild(){},append(){},replaceChildren(){},remove(){},querySelector(s){return el(id+s)},querySelectorAll(){return []},setAttribute(){},getContext(){return {}},getBoundingClientRect(){return {width:1200,height:720,left:0,top:0,right:1200}}};els.set(id,e);return e}\nconst document={getElementById:el,querySelector:el,querySelectorAll:()=>[],createElement:el,body:el('body')};\nconst window={addEventListener(){},scrollTo(){}},localStorage={getItem:()=>null,setItem(){}},requestAnimationFrame=()=>{},matchMedia=()=>({matches:false}),innerWidth=1024,performance={now:()=>0},navigator={userAgent:''},setTimeout=()=>{};\n";
const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const game=source.match(/<script>([\s\S]*?)<\/script>/)[1];
const holder={api:require('../leaderboard.js')};const hook="globalThisPlaceholder.render=()=>layouts.map(l=>{const t=makeTrack(l);return {id:l.id,race:trackArtwork(t,'race'),preview:trackArtwork(t,'preview')}});globalThisPlaceholder.camera=(x,y,speed,dt=1/60)=>{phase='racing';cameraMode='broadcast';racer={x,y,speed};updateCamera(dt);return {...camera}};";
new Function('globalThisPlaceholder',bootstrap+'window.RXLeaderboard=globalThisPlaceholder.api;\n'+game.replace('renderHistory();\nbuildTrackTabs();',hook+'renderHistory();\nbuildTrackTabs();'))(holder);
let allIds=new Set();for(const r of holder.render()){
 for(const scope of ['race','preview']){const markup=r[scope],ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const id of ids){assert(!allIds.has(id),'SVG IDs must be unique across preview, race and tracks: '+id);allIds.add(id)}for(const m of markup.matchAll(/(?:url\(#([^)]+)\)|href="#([^"]+)")/g))assert(ids.includes(m[1]||m[2]),'Every reference resolves in its own SVG');}
 if(process.argv[3])fs.writeFileSync(path.join(process.argv[3],r.id+'.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">'+r.race+'</svg>');
}
for(let i=0;i<1000;i++){const c=holder.camera(i%2?0:1200,i%3?0:720,i%320);assert(c.scale<=1);assert(Math.abs(c.tx)<=50*(1-c.scale)+.001,'Horizontal circuit bounds');assert(Math.abs(c.ty)<=50*(1-c.scale)+.001,'Vertical circuit bounds');}
console.log('PASS: 11 tracks, unique preview/race SVG definitions, local references, camera keeps full circuit visible');

