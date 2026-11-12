(()=>{
"use strict";
const POLISH = true;
const MEDIA = true;
const WIDTH = 390;
const HEIGHT = 844;
const REST = -.09;
const CARRY = .026;
const COLORS = {
  mint: ['Sea glass', '#5cad90', '#147b70'],
  amber: ['Honey', '#e9a346', '#b05b27'],
  indigo: ['Midnight', '#7282c0', '#343c83'],
  coral: ['Persimmon', '#e88563', '#b44a3e'],
  moss: ['Juniper', '#84a552', '#4c713e']
};
const ORDERS = [
  { name:'Mint Cup', shape:'cup', recipe:[['mint', .37]], speed:.47 },
  { name:'Dusk Tumbler', shape:'tumbler', recipe:[['amber', .66], ['indigo', .31]], speed:.52 },
  { name:'Orchard Vase', shape:'vase', recipe:[['coral', .74], ['moss', .46], ['mint', .19]], speed:.58 },
  { name:'Blue Hour Bowl', shape:'bowl', recipe:[['indigo', .44]], speed:.58 },
  { name:'Sunset Cup', shape:'cup', recipe:[['moss', .71], ['coral', .24]], speed:.60 },
  { name:'Market Vase', shape:'vase', recipe:[['amber', .82], ['mint', .54], ['indigo', .34]], speed:.65 }
];
const HOLD = { x:22, y:720, w:346, h:73 };
const MUTE = { x:316, y:37, w:52, h:48 };
const NEXT = { x:175, y:716, w:193, h:65 };
const REWORK = { x:22, y:716, w:141, h:65 };
const RESUME = { x:22, y:716, w:346, h:65 };
const SAFE_STORAGE = 'kiln-and-color.v1';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const within = (p, r) => p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h;
function colorAt(layers, height) {
  for (let i=layers.length-1; i>=0; i--) {
    if (height < layers[i][1]) return layers[i][0];
  }
  return null;
}
function grade(layers, target) {
  let matches = 0, painted = 0;
  for (let i=0; i<160; i++) {
    const height = (i+.5)/160;
    const actual=colorAt(layers,height), expected=colorAt(target,height);
    if (actual || expected) {
      painted++;
      if (actual===expected) matches++;
    }
  }
  return Math.round(100 * matches / Math.max(1,painted));
}
function swatches(order) {
  const width = Math.min(161, (346-(order.recipe.length-1)*8)/order.recipe.length);
  return order.recipe.map(([color], i) => ({ color, x:22+i*(width+8), y:623, w:width, h:52 }));
}

class Studio {
  constructor(platform) {
    this.platform=platform;
    const save = platform.read(SAFE_STORAGE) || {};
    this.best = Array.isArray(save.best) ? save.best.slice(0,2) : [0,0];
    this.muted = !!save.muted;
    this.shelf = save.shelf === 1 ? 1 : 0;
    this.fired = Array.isArray(save.fired) ? save.fired.slice(0,3).filter(Number.isFinite) : [];
    this.firedLayers=Array.isArray(save.firedLayers)?save.firedLayers.slice(0,3):[];
    this.resetPiece();
    if (this.fired.length === 3) this.phase='shelf';
  }
  get order() { return ORDERS[this.shelf*3+Math.min(this.fired.length,2)]; }
  get target() { return this.order.recipe.find(([color]) => color===this.color)[1]; }
  save() {
    this.platform.write(SAFE_STORAGE,{ best:this.best, muted:this.muted, shelf:this.shelf, fired:this.fired, firedLayers:this.firedLayers });
  }
  resetPiece() {
    this.layers=[];
    this.phase='ready';
    this.color=this.order.recipe[0][0];
    this.downAt=0;
    this.liftAt=0;
    this.lastDepth=null;
    this.lastDelta=null;
  }
  sound(key) { if (!this.muted) this.platform.sound(key); }
  depth(now) {
    if (this.phase==='holding') return clamp(REST+(now-this.downAt)*this.order.speed/1000,REST,.99);
    if (this.phase==='lifting') {
      const t=clamp((now-this.liftAt)/540,0,1);
      return this.lastDepth + (REST-this.lastDepth)*t*t*(3-2*t);
    }
    return REST;
  }
  tick(now) {
    if (this.phase==='holding' && !this.contact && this.depth(now)>0) {
      this.contact=true;
      this.sound('dip');
    }
    if (this.phase==='lifting' && now-this.liftAt>=540) {
      if (this.layers.length >= this.order.recipe.length) {
        this.phase='result';
        this.sound('chime');
      } else {
        const remaining=this.order.recipe.find(([color])=> !this.layers.some(([used])=>used===color));
        this.color=remaining[0];
        this.phase='ready';
      }
    }
  }
  press(p, now) {
    if (within(p,MUTE)) {
      this.muted=!this.muted;
      this.platform.silence(this.muted);
      this.save();
      return false;
    }
    if (this.phase==='ready') {
      const choice=swatches(this.order).find(item=>within(p,item));
      if (choice && !this.layers.some(([used])=>used===choice.color)) {
        this.color=choice.color;
        this.sound('click');
      }
      if (within(p,HOLD)) return this.startDip(now);
    } else if (this.phase==='result') {
      if (within(p,REWORK)) { this.resetPiece(); this.sound('click'); }
      if (within(p,NEXT) && this.phase==='result') this.fire();
    } else if (this.phase==='shelf' && within(p,RESUME)) {
      this.shelf=1-this.shelf;
      this.fired=[];
      this.firedLayers=[];
      this.resetPiece();
      this.save();
    }
    return false;
  }
  startDip(now) {
    if (this.phase!=='ready') return false;
    this.phase='holding';
    this.downAt=now;
    this.contact=false;
    return true;
  }
  release(now) {
    if (this.phase!=='holding') return;
    const value=clamp(this.depth(now)+CARRY,0,1);
    this.layers.push([this.color,value]);
    this.lastDepth=value;
    this.lastDelta=value-this.target;
    this.liftAt=now;
    this.phase='lifting';
    this.sound('lift');
  }
  cancel() {
    if (this.phase==='holding') this.phase='ready';
  }
  fire() {
    this.firedLayers.push(this.layers.map(layer=>[...layer]));
    this.fired.push(grade(this.layers,this.order.recipe));
    this.sound('fire');
    if (this.fired.length===3) {
      const average=Math.round(this.fired.reduce((sum,v)=>sum+v,0)/3);
      this.best[this.shelf]=Math.max(this.best[this.shelf]||0,average);
      this.phase='shelf';
    } else this.resetPiece();
    this.save();
  }
  snapshot(now) {
    return {
      scene:'studio', phase:this.phase, shelf:this.shelf, commission:this.order.name, fired:[...this.fired],
      color:this.color, target:this.target, speed:this.order.speed, painted:this.layers.map(layer=>[...layer]),
      grade:grade(this.layers,this.order.recipe), depth:this.depth(now), best:[...this.best],
      lastDepth:this.lastDepth, lastDelta:this.lastDelta, muted:this.muted,
      ui: [{id:'mute',...MUTE}, ...(this.phase==='result' ? [{id:'fire',...NEXT},{id:'rework',...REWORK}]
        : this.phase==='shelf' ? [{id:'nextShelf',...RESUME}] : [{id:'dip',...HOLD}, ...swatches(this.order).map(s=>({id:s.color,...s}))])]
    };
  }
}

const INK='#22362b';
const MUTED='#596b54';
const PAPER='#f5ebd6';
const LIGHT='#fff6e1';
const DARK='#224d3e';
const SHAPES={
  cup:[-.69,-.70,-.53,-.43],
  tumbler:[-.64,-.58,-.48,-.44],
  vase:[-.34,-.42,-.82,-.41],
  bowl:[-.91,-.90,-.63,-.31]
};
function rounded(ctx,x,y,w,h,r) {
  const k=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+k,y); ctx.lineTo(x+w-k,y); ctx.quadraticCurveTo(x+w,y,x+w,y+k);
  ctx.lineTo(x+w,y+h-k); ctx.quadraticCurveTo(x+w,y+h,x+w-k,y+h);
  ctx.lineTo(x+k,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-k);
  ctx.lineTo(x,y+k); ctx.quadraticCurveTo(x,y,x+k,y); ctx.closePath();
}
function box(ctx,x,y,w,h,r,color,stroke) {
  rounded(ctx,x,y,w,h,r);
  ctx.fillStyle=color; ctx.fill();
  if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); }
}
function label(ctx,text,x,y,size=16,color=INK,weight=600,align='left',face='sans-serif') {
  ctx.fillStyle=color; ctx.font=weight+' '+size+'px '+face;
  ctx.textAlign=align; ctx.textBaseline='alphabetic'; ctx.fillText(text,x,y);
}
function line(ctx,x0,y0,x1,y1,color,width=1) {
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1);
  ctx.strokeStyle=color; ctx.lineWidth=width; ctx.stroke();
}
function oval(ctx,x,y,rx,ry,color) {
  ctx.save(); ctx.translate(x,y); ctx.scale(rx,ry);
  ctx.beginPath(); ctx.arc(0,0,1,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); ctx.restore();
}
function contour(ctx,x,y,w,h,shape) {
  const [lip, shoulder, hip, foot]=SHAPES[shape];
  ctx.beginPath(); ctx.moveTo(x+lip*w,y);
  ctx.bezierCurveTo(x+shoulder*w,y+h*.25,x+hip*w,y+h*.75,x+foot*w,y+h);
  ctx.quadraticCurveTo(x,y+h*1.04,x-foot*w,y+h);
  ctx.bezierCurveTo(x-hip*w,y+h*.75,x-shoulder*w,y+h*.25,x-lip*w,y);
  ctx.closePath();
}
function vessel(ctx,x,y,w,h,shape,layers,polish) {
  const lip=-SHAPES[shape][0]*w;
  if (shape==='cup' && polish) {
    ctx.beginPath();
    ctx.moveTo(x+w*.56,y+h*.25);
    ctx.bezierCurveTo(x+w*1.25,y+h*.14,x+w*1.2,y+h*.61,x+w*.5,y+h*.68);
    ctx.strokeStyle='#79543d'; ctx.lineWidth=Math.max(2,w*.137); ctx.stroke();
    ctx.strokeStyle='#d1a47b'; ctx.lineWidth=Math.max(1.5,w*.088); ctx.stroke();
  }
  ctx.save(); contour(ctx,x,y,w,h,shape); ctx.clip();
  ctx.fillStyle=polish ? horizontal(ctx,x-w,x+w,'#9b6c4e','#f1cda0','#b5835d') : '#e4b88e';
  ctx.fillRect(x-w,y-1,w*2,h+6);
  for (const [color,d] of layers) {
    const [_,light,dark]=COLORS[color];
    ctx.fillStyle=polish ? horizontal(ctx,x-w,x+w,dark,light,dark) : light;
    ctx.fillRect(x-w,y+h*(1-d),w*2,h*d+5);
    if (polish) line(ctx,x-w,y+h*(1-d)+1,x+w,y+h*(1-d)+1,'rgba(255,252,221,.36)',2);
  }
  if (polish) {
    ctx.fillStyle='rgba(255,247,211,.25)';
    ctx.fillRect(x-w*.42,y+8,w*.09,h);
    for (let j=0;j<45;j++) {
      const px=x-w+((j*31)%101)*w/50, py=y+((j*43)%97)*h/97;
      oval(ctx,px,py,Math.max(.4,w*.01),Math.max(.4,w*.008),j%4?'rgba(66,45,26,.12)':'rgba(255,248,221,.49)');
    }
    for (let j=1;j<10;j++) line(ctx,x-w,y+h*j/10,x+w,y+h*j/10,'rgba(53,46,29,.08)');
  }
  ctx.restore();
  contour(ctx,x,y,w,h,shape); ctx.strokeStyle='#784f38'; ctx.lineWidth=polish?1.4:1; ctx.stroke();
  oval(ctx,x,y,lip,h*.048,'#b7815e');
  oval(ctx,x,y,lip*.91,h*.029,'#543d32');
}
function horizontal(ctx,x0,x1,left,center,right) {
  const g=ctx.createLinearGradient(x0,0,x1,0);
  g.addColorStop(0,left); g.addColorStop(.44,center); g.addColorStop(1,right);
  return g;
}
function button(ctx,r,text,style='primary') {
  const primary=style==='primary' || style==='active';
  box(ctx,r.x,r.y+4,r.w,r.h,16,primary?'#172f26':'#d2c7af');
  box(ctx,r.x,r.y,r.w,r.h,16,style==='active'?'#307054':primary?DARK:'#eee3ca',primary?'#59826c':'#c8bfa4');
  label(ctx,text,r.x+r.w/2,r.y+r.h/2+7,primary?20:17,primary?LIGHT:INK,700,'center');
}
function dash(ctx,x,y,len,color) {
  for (let i=0;i<len;i+=9) line(ctx,x+i,y,x+Math.min(i+5,len),y,color,2);
}
function title(ctx,game) {
  label(ctx,'CERAMICS STUDIO',23,36,11,MUTED,700);
  label(ctx,'Kiln & Color',21,79,39,INK,700,'left','Georgia, serif');
  box(ctx,MUTE.x,MUTE.y,MUTE.w,MUTE.h,14,'#e8e0c7','#d2c6a8');
  const x=game.muted?338:336;
  line(ctx,x-5,61,x+3,61,INK,3);
  line(ctx,x+3,61,x+10,55,INK,2); line(ctx,x+3,61,x+10,67,INK,2);
  line(ctx,x+10,55,x+10,67,INK,2);
  if (game.muted) { line(ctx,332,71,352,51,'#9f4c36',2); }
  else { line(ctx,351,55,355,59,INK,1.5); line(ctx,355,59,355,63,INK,1.5); line(ctx,355,63,351,67,INK,1.5); }
}
function commission(ctx,game,polish) {
  const order=game.order;
  box(ctx,22,106,346,104,17,LIGHT,'#d5c7a8');
  label(ctx,'COMMISSION '+(game.fired.length+1)+' / 3',37,131,11,MUTED,700);
  label(ctx,order.name,36,158,23,INK,700,'left','Georgia, serif');
  const recipe = order.recipe.length===1 ? 'One glaze dip' : order.recipe.length+' glaze layers';
  label(ctx,recipe,37,184,13,MUTED);
  vessel(ctx,308,125,36,61,order.shape,order.recipe,polish);
}
function studioBackdrop(ctx) {
  const glow=ctx.createLinearGradient(0,237,0,586);
  glow.addColorStop(0,'#e9d2a8'); glow.addColorStop(.73,'#c9af84'); glow.addColorStop(1,'#aa8158');
  rounded(ctx,22,231,346,355,20); ctx.fillStyle=glow;ctx.fill();
  ctx.save(); rounded(ctx,23,232,344,353,19); ctx.clip();
  box(ctx,45,276,86,132,37,'#a98a5c');
  box(ctx,49,280,78,122,34,'#f3deb1');
  oval(ctx,87,313,21,21,'#f8e7b4');
  line(ctx,88,283,88,402,'#b29666',3);
  line(ctx,50,342,125,342,'#b29666',3);
  box(ctx,41,399,94,8,3,'#9e8158');
  box(ctx,273,317,74,6,2,'#93734d');
  vessel(ctx,289,290,13,26,'vase',[['moss',.63]],false);
  vessel(ctx,321,294,15,22,'bowl',[['coral',.42]],false);
  box(ctx,269,365,78,6,2,'#93734d');
  vessel(ctx,309,335,17,29,'vase',[['amber',.48]],false);
  for (let i=0;i<8;i++) line(ctx,40+i*45,425,40+i*45,558,'rgba(121,88,49,.19)');
  for (let j=0;j<4;j++) line(ctx,23,425+j*35,367,425+j*35,'rgba(121,88,49,.22)');
  box(ctx,23,549,344,37,1,horizontal(ctx,23,367,'#936746','#c69a65','#9a6d47'));
  line(ctx,23,550,367,550,'#e4bc82',2);
  for(let i=0;i<5;i++) line(ctx,26+i*11,567+i*3,367-i*13,567+i*3,'rgba(87,53,33,.26)');
  ctx.restore();
}
function depthMeter(ctx,game,d) {
  const x=345,y=344,h=111;
  const current=clamp(d+CARRY,0,1);
  const near=Math.abs(current-game.target)<.063;
  box(ctx,x-3,y,6,h,3,'#8b7552');
  if (current>0) box(ctx,x-3,y+h*(1-current),6,h*current,3,near?'#fff6ce':'#488061');
  const t=y+h*(1-game.target);
  line(ctx,x-8,t,x+8,t,near?'#fff6ce':'#274433',2.7);
  oval(ctx,x,y+h*(1-current),near?6:3.5,near?6:3.5,near?'#f8efc8':'#254d3c');
}
function workshop(ctx,game,now,polish) {
  const y=231, vatY=475, h=157, d=game.depth(now), bottom=vatY+d*h, top=bottom-h;
  const [_,light,dark]=COLORS[game.color];
  box(ctx,22,y,346,355,20,polish?'#e6d5b4':'#ede2c7','#c9ba97');
  if (polish) {
    studioBackdrop(ctx);
  }
  label(ctx,'GLAZE BATH',38,259,10,MUTED,700);
  line(ctx,195,268,195,top+8,'#71624a',2);
  box(ctx,163,top-13,64,15,5,polish?'#a6814f':'#ad9467','#786044');
  oval(ctx,195,vatY+23,133,28,'#997d5d');
  oval(ctx,195,vatY,129,26,dark);
  oval(ctx,195,vatY-2,116,20,light);
  const holding=game.phase==='holding';
  const lifting=game.phase==='lifting';
  const applied=holding && d>0 ? [...game.layers,[game.color,d]] : game.layers;
  ctx.save();
  ctx.beginPath(); ctx.rect(24,232,342,vatY-232+1);ctx.clip();
  vessel(ctx,195,top,89,h,game.order.shape,applied,polish);
  ctx.restore();
  ctx.save();
  ctx.beginPath();ctx.rect(43,vatY,304,110);ctx.clip();
  box(ctx,66,vatY,258,83,22,polish?horizontal(ctx,66,324,'#363a2c','#706753','#393e31'):'#68634c');
  oval(ctx,195,vatY,128,25,light);
  line(ctx,80,vatY+1,310,vatY+1,'rgba(255,255,226,.75)',2);
  if (polish) {
    for(let i=0;i<4;i++) {
      const phase=(now/1000+i*.25)%1;
      if (holding || lifting) {
        ctx.globalAlpha=(1-phase)*.6;
        oval(ctx,195,vatY+3,24+phase*81,2+phase*10,'rgba(255,245,209,.42)');
        ctx.globalAlpha=1;
      }
    }
  }
  if (polish) {
    box(ctx,99,512,192,32,11,'#4b503f','#807358');
    label(ctx,COLORS[game.color][0],195,532,14,LIGHT,700,'center');
  }
  ctx.restore();
  const guideY=bottom-h*(game.target-CARRY);
  if (!lifting) {
    if (polish) depthMeter(ctx,game,d);
    const near=holding && Math.abs(d+CARRY-game.target)<.065;
    const guideColor=near?'#ffffff':'#fff4ce';
    if (guideY<vatY+12) {
      dash(ctx,102,guideY,184,'#35493c');
      dash(ctx,103,guideY-1,182,guideColor);
      label(ctx,near?'ON GUIDE':'GUIDE',331,guideY+4,10,near?DARK:INK,800,'right');
    }
  }
  if (holding && Math.abs(d+CARRY-game.target)<.065) {
    box(ctx,108,270,174,33,13,'#2b6a50');
    label(ctx,'Release now',195,292,16,LIGHT,800,'center');
  }
  if (lifting) {
    const since=now-game.liftAt;
    const p=clamp(since/540,0,1);
    for(let i=0;i<6;i++) oval(ctx,156+i*15,vatY-Math.sin(p*Math.PI)*(12+i*4),2,3,light);
  }
}
function controls(ctx,game) {
  const stage=game.fired.length;
  label(ctx,'DIP '+Math.min(game.layers.length+1,game.order.recipe.length)+' OF '+game.order.recipe.length,23,611,11,MUTED,800);
  for (const swatch of swatches(game.order)) {
    const used=game.layers.some(([color])=>color===swatch.color);
    const selected=swatch.color===game.color && !used;
    const [name,light,dark]=COLORS[swatch.color];
    box(ctx,swatch.x,swatch.y,swatch.w,swatch.h,12,used?'#ddd3ba':selected?'#fff5de':'#e9e0c8',selected?dark:'#c6b99b');
    oval(ctx,swatch.x+17,swatch.y+(used?19:25),7,7,used?'#8a8f71':light);
    label(ctx,name,swatch.x+29,swatch.y+(used?23:31),12,INK,700);
    if (used) label(ctx,'Used',swatch.x+29,swatch.y+39,10,MUTED,700);
  }
  let hint=stage===0?'Release when the glaze meets the guide.':'Deep dip first. The next glaze paints over it.';
  if (game.layers.length>0) hint='This dip coats over the earlier glaze.';
  if (game.phase==='lifting') hint='Lifting your piece…';
  label(ctx,hint,195,701,13,INK,600,'center');
  button(ctx,HOLD,game.phase==='holding'?'Release to lift':game.phase==='lifting'?'Lifting…':'Hold to dip',game.phase==='holding'?'active':'primary');
}
function resultHint(game) {
  if (game.layers.some(([color],i)=>color!==game.order.recipe[i][0])) {
    return 'Deep glazes go first. A later dip can cover them.';
  }
  const deltas=game.layers.map(([color,depth],i)=>({color,delta:depth-game.order.recipe[i][1]}));
  const biggest=deltas.reduce((a,b)=>Math.abs(a.delta)>=Math.abs(b.delta)?a:b);
  if (game.layers.length===1) return biggest.delta<0
    ? 'A little shallow. Hold longer to deepen the band.'
    : 'A little deep. Release earlier to shorten the band.';
  return COLORS[biggest.color][0]+(biggest.delta<0?' is shallow. Hold a bit longer.':' is deep. Release a bit earlier.');
}
function results(ctx,game,polish) {
  const order=game.order;
  const accuracy=grade(game.layers,order.recipe);
  const title=accuracy>=94?'Beautiful match':accuracy>=81?'Nicely thrown':'Room to refine';
  label(ctx,title,195,284,32,INK,700,'center','Georgia, serif');
  label(ctx,accuracy+'% color match',195,317,18,MUTED,700,'center');
  box(ctx,22,345,346,250,20,LIGHT,'#d5c7a8');
  vessel(ctx,112,394,62,134,order.shape,game.layers,polish);
  vessel(ctx,276,394,62,134,order.shape,order.recipe,polish);
  label(ctx,'YOUR PIECE',112,564,11,INK,800,'center');
  label(ctx,'COMMISSION',276,564,11,INK,800,'center');
  const note=accuracy>=94?'The glaze edges line up.':resultHint(game);
  label(ctx,note,195,657,13,MUTED,700,'center');
  button(ctx,REWORK,'Rework','secondary');
  button(ctx,NEXT,game.fired.length===2?'Fire & see shelf':'Fire & keep');
}
function shelf(ctx,game,polish) {
  const average=Math.round(game.fired.reduce((sum,v)=>sum+v,0)/3);
  label(ctx,'Shelf complete',195,211,37,INK,700,'center','Georgia, serif');
  label(ctx,average+'% studio grade',195,249,18,MUTED,700,'center');
  box(ctx,22,289,346,278,20,LIGHT,'#d5c7a8');
  for(let i=0;i<3;i++) {
    const item=ORDERS[game.shelf*3+i], x=81+i*114;
    vessel(ctx,x,361,46,113,item.shape,game.firedLayers[i]||item.recipe,polish);
    label(ctx,game.fired[i]+'%',x,517,17,INK,700,'center');
  }
  label(ctx,'Best for this shelf  '+game.best[game.shelf]+'%',195,629,16,INK,700,'center');
  label(ctx,game.shelf===0?'New vessels and tighter timing await.':'Return to the first three commissions.',195,660,14,MUTED,600,'center');
  button(ctx,RESUME,game.shelf===0?'Open remix shelf':'Return to original shelf');
}
function draw(ctx,game,now,polish) {
  const parchment=ctx.createLinearGradient(0,0,0,HEIGHT);
  parchment.addColorStop(0,'#fff1d6'); parchment.addColorStop(.68,PAPER); parchment.addColorStop(1,'#eadbbe');
  ctx.fillStyle=polish?parchment:PAPER;ctx.fillRect(0,0,WIDTH,HEIGHT);
  title(ctx,game);
  if (game.phase==='shelf') shelf(ctx,game,polish);
  else {
    commission(ctx,game,polish);
    if (game.phase==='result') results(ctx,game,polish);
    else { workshop(ctx,game,now,polish); controls(ctx,game); }
  }
  const count=game.fired.length;
  for(let i=0;i<3;i++) oval(ctx,183+i*12,820,3,3,i<count?DARK:i===count?'#a27b47':'#c6b99b');
}

function startRuntime(platform, polish) {
  const studio = new Studio(platform);
  const ctx=platform.canvas.getContext('2d');
  let scale=1, dx=0, dy=0, density=1, size, token=null, paused=false;
  function resize() {
    size=platform.size();
    const area=size.area || {left:0,top:0,width:size.width,height:size.height};
    density=Math.min(size.density||1,2.5);
    scale=Math.min(area.width/WIDTH,area.height/HEIGHT,1.15);
    dx=area.left+(area.width-WIDTH*scale)/2;
    dy=area.top+(area.height-HEIGHT*scale)/2;
    platform.canvas.width=Math.round(size.width*density);
    platform.canvas.height=Math.round(size.height*density);
  }
  resize();
  platform.onResize(resize);
  const mapped=(x,y)=>({x:(x-dx)/scale,y:(y-dy)/scale});
  platform.input({
    down(x,y,id) {
      if (token!==null || paused) return;
      if (studio.press(mapped(x,y),platform.now())) token=id;
    },
    up(id) {
      if (token!==id) return;
      token=null;
      studio.release(platform.now());
    },
    cancel(id) {
      if (id!==undefined && token!==id) return;
      token=null;
      studio.cancel();
    },
    keyboard(start) {
      if (start) studio.startDip(platform.now());
      else studio.release(platform.now());
    }
  });
  platform.lifecycle(isHidden=>{
    paused=isHidden;
    if (paused) {
      token=null;
      studio.cancel();
      platform.silence(true);
    } else {
      platform.silence(studio.muted);
      resize();
    }
  });
  function frame() {
    if (!paused) {
      const now=platform.now();
      studio.tick(now);
      ctx.setTransform(density,0,0,density,0,0);
      ctx.fillStyle='#e3d7bc';ctx.fillRect(0,0,size.width,size.height);
      ctx.setTransform(density*scale,0,0,density*scale,density*dx,density*dy);
      draw(ctx,studio,now,polish);
    }
    platform.frame(frame);
  }
  platform.frame(frame);
  return {
    snapshot() {
      return { ...studio.snapshot(platform.now()), viewport:{scale,dx,dy,width:size.width,height:size.height} };
    }
  };
}

const canvas=document.querySelector('#studio');
const screen=document.querySelector('#screen');
const params=new URLSearchParams(location.search);
const tracks=['click','dip','lift','chime','fire'];
const buffers=new Map();
const audioReport={ready:[],played:[],errors:[]};
const activeAudio=new Set();
const AudioEngine=window.AudioContext || window.webkitAudioContext;
const audioContext=MEDIA && AudioEngine ? new AudioEngine() : null;
let muted=false;
if (audioContext) {
  const gain=audioContext.createGain();
  gain.gain.value=.55;
  gain.connect(audioContext.destination);
  for (const key of tracks) {
    fetch('./assets/'+key+'.mp3').then(response=>{
      if (!response.ok) throw Error('HTTP '+response.status);
      return response.arrayBuffer();
    }).then(bytes=>audioContext.decodeAudioData(bytes)).then(buffer=>{
      buffers.set(key,buffer);
      audioReport.ready.push(key);
    }).catch(error=>audioReport.errors.push(key+': '+error.message));
  }
  audioReport.gain=gain;
}
function unlock() {
  if (audioContext?.state==='suspended') void audioContext.resume().catch(()=>{});
}
const runtime=startRuntime({
  canvas,
  size:()=>({width:screen.clientWidth,height:screen.clientHeight,density:window.devicePixelRatio}),
  onResize:fn=>new ResizeObserver(fn).observe(screen),
  now:()=>performance.now(),
  frame:fn=>requestAnimationFrame(fn),
  read:key=>{ try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  write:(key,value)=>{ try { localStorage.setItem(key,JSON.stringify(value)); } catch {} },
  sound(key) {
    const buffer=buffers.get(key);
    if (muted || !buffer || audioContext.state!=='running') return;
    const source=audioContext.createBufferSource();
    source.buffer=buffer;
    source.connect(audioReport.gain);
    activeAudio.add(source);
    source.onended=()=>activeAudio.delete(source);
    source.start();
    audioReport.played.push(key);
    if (audioReport.played.length>40) audioReport.played.shift();
  },
  silence(value) {
    muted=value;
    if (muted) for(const source of activeAudio) source.stop();
  },
  input(fn) {
    canvas.addEventListener('pointerdown', e=>{
      if (!e.isPrimary || (e.pointerType==='mouse' && e.button!==0)) return;
      e.preventDefault();
      unlock();
      const box=canvas.getBoundingClientRect();
      canvas.setPointerCapture(e.pointerId);
      fn.down(e.clientX-box.left,e.clientY-box.top,e.pointerId);
    });
    canvas.addEventListener('pointerup', e=>fn.up(e.pointerId));
    canvas.addEventListener('pointercancel', e=>fn.cancel(e.pointerId));
    canvas.addEventListener('lostpointercapture', e=>fn.cancel(e.pointerId));
    window.addEventListener('blur',()=>fn.cancel());
    window.addEventListener('keydown',e=>{ if (e.code==='Space') { e.preventDefault(); unlock(); if (!e.repeat) fn.keyboard(true); } });
    window.addEventListener('keyup',e=>{ if(e.code==='Space') { e.preventDefault(); fn.keyboard(false); } });
  },
  lifecycle(fn) { document.addEventListener('visibilitychange',()=>fn(document.hidden)); }
}, POLISH);
if (params.get('qa')==='1') window.__AF_TEST__={getSnapshot:()=>({
  ...runtime.snapshot(),
  activeScene:'studio',
  activeScenes:['studio'],
  audio:{ready:[...audioReport.ready],played:[...audioReport.played],errors:[...audioReport.errors]}
})};

})();
