(function(){
  'use strict';

  // Small self-contained QR encoder for Spencer Live join URLs.
  // Uses QR Version 5, error correction level L, byte mode (up to 106 UTF-8 bytes).
  const VERSION=5,SIZE=37,DATA_CODEWORDS=108,ECC_CODEWORDS=26;
  const GF_EXP=new Uint8Array(512),GF_LOG=new Uint8Array(256);
  let x=1;
  for(let i=0;i<255;i++){GF_EXP[i]=x;GF_LOG[x]=i;x<<=1;if(x&0x100)x^=0x11d;}
  for(let i=255;i<512;i++)GF_EXP[i]=GF_EXP[i-255];

  function mul(a,b){return a===0||b===0?0:GF_EXP[GF_LOG[a]+GF_LOG[b]];}
  function generator(degree){
    let poly=[1];
    for(let i=0;i<degree;i++){
      const next=new Array(poly.length+1).fill(0),root=GF_EXP[i];
      for(let j=0;j<poly.length;j++){next[j]^=poly[j];next[j+1]^=mul(poly[j],root);}
      poly=next;
    }
    return poly;
  }
  const RS_GENERATOR=generator(ECC_CODEWORDS);

  function ecc(data){
    const out=new Array(ECC_CODEWORDS).fill(0);
    for(const value of data){
      const factor=value^out[0];
      out.shift();out.push(0);
      for(let i=0;i<ECC_CODEWORDS;i++)out[i]^=mul(RS_GENERATOR[i+1],factor);
    }
    return out;
  }

  function pushBits(bits,value,length){for(let i=length-1;i>=0;i--)bits.push((value>>>i)&1);}
  function encodeData(text){
    const bytes=Array.from(new TextEncoder().encode(text));
    if(bytes.length>106)throw new Error('Join URL is too long for the bundled QR code.');
    const bits=[];pushBits(bits,0x4,4);pushBits(bits,bytes.length,8);bytes.forEach(b=>pushBits(bits,b,8));
    const capacity=DATA_CODEWORDS*8;for(let i=0;i<Math.min(4,capacity-bits.length);i++)bits.push(0);while(bits.length%8)bits.push(0);
    const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|(bits[i+j]||0);data.push(b);}
    for(let pad=0;data.length<DATA_CODEWORDS;pad++)data.push(pad%2===0?0xec:0x11);
    return data.concat(ecc(data));
  }

  function blank(){return {m:Array.from({length:SIZE},()=>Array(SIZE).fill(false)),f:Array.from({length:SIZE},()=>Array(SIZE).fill(false))};}
  function setFunction(q,x,y,dark){if(x>=0&&y>=0&&x<SIZE&&y<SIZE){q.m[y][x]=Boolean(dark);q.f[y][x]=true;}}
  function finder(q,cx,cy){for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const dist=Math.max(Math.abs(dx),Math.abs(dy));setFunction(q,cx+dx,cy+dy,dist!==2&&dist!==4);}}
  function alignment(q,cx,cy){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)setFunction(q,cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);}
  function formatBits(mask){
    const data=(1<<3)|mask; // ECC L = binary 01
    let rem=data<<10;
    for(let i=14;i>=10;i--)if((rem>>>i)&1)rem^=0x537<<(i-10);
    return ((data<<10)|(rem&0x3ff))^0x5412;
  }
  function drawFormat(q,mask){
    const bits=formatBits(mask),bit=i=>((bits>>>i)&1)!==0;
    for(let i=0;i<=5;i++)setFunction(q,8,i,bit(i));
    setFunction(q,8,7,bit(6));setFunction(q,8,8,bit(7));setFunction(q,7,8,bit(8));
    for(let i=9;i<15;i++)setFunction(q,14-i,8,bit(i));
    for(let i=0;i<8;i++)setFunction(q,SIZE-1-i,8,bit(i));
    for(let i=8;i<15;i++)setFunction(q,8,SIZE-15+i,bit(i));
    setFunction(q,8,SIZE-8,true);
  }
  function drawFunctions(q){
    finder(q,3,3);finder(q,SIZE-4,3);finder(q,3,SIZE-4);
    alignment(q,30,30);
    for(let i=0;i<SIZE;i++){
      if(!q.f[6][i])setFunction(q,i,6,i%2===0);
      if(!q.f[i][6])setFunction(q,6,i,i%2===0);
    }
    drawFormat(q,0); // reserves format modules before data placement
  }
  function mask0(x,y){return (x+y)%2===0;}
  function drawCodewords(q,codewords){
    const bits=[];codewords.forEach(b=>pushBits(bits,b,8));let index=0,up=true;
    for(let right=SIZE-1;right>=1;right-=2){
      if(right===6)right--;
      for(let vert=0;vert<SIZE;vert++){
        const y=up?SIZE-1-vert:vert;
        for(let j=0;j<2;j++){
          const x=right-j;if(q.f[y][x])continue;
          const raw=index<bits.length?bits[index]:0;q.m[y][x]=Boolean(raw)^mask0(x,y);index++;
        }
      }
      up=!up;
    }
    drawFormat(q,0);
  }
  function matrix(text){const q=blank();drawFunctions(q);drawCodewords(q,encodeData(text));return q.m;}
  function toSvg(text){
    const m=matrix(text),quiet=4,total=SIZE+quiet*2;let path='';
    for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(m[y][x])path+='M'+(x+quiet)+' '+(y+quiet)+'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+total+' '+total+'" role="img" aria-label="Spencer Live join QR code" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="'+path+'" fill="#100729"/></svg>';
  }
  function render(target,text){target.innerHTML=toSvg(text);const svg=target.querySelector('svg');if(svg){svg.style.width='100%';svg.style.height='100%';svg.style.display='block';}}

  window.SpencerQR={toSvg,render,version:VERSION};
})();
