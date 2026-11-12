(function (root, factory) {
  if (typeof module === 'object') module.exports = factory(require('./core.js'));
  else root.SwitchyardPaint = factory(root.Switchyard);
})(globalThis, function (core) {
  'use strict';
  const {WIDTH,HEIGHT,DEPOTS,BRANCH,ROWS,COLS} = core;
  const C = {
    ink:'#0b151b', panel:'#13232b', deep:'#101d24', rule:'#32464c', line:'#50656a',
    ivory:'#f4e9ce', sub:'#acb9b5', mute:'#839799', gold:'#f0ba78', green:'#99dcbe', danger:'#f3958a',
  };
  const railX = [76,195,314];
  const railY = [258,350,442,534,626];
  const START = 184;
  function painter(ctx, art = {}) {
    const controls = [];
    let font = art.font || 'Georgia';
    const uiFont = () => art.uiFont || 'Arial';
    const rounded = (x,y,w,h,r) => {
      const radius = Math.max(0, Math.min(w/2,h/2,r));
      ctx.beginPath(); ctx.moveTo(x+radius,y);
      ctx.arcTo(x+w,y,x+w,y+h,radius); ctx.arcTo(x+w,y+h,x,y+h,radius);
      ctx.arcTo(x,y+h,x,y,radius); ctx.arcTo(x,y,x+w,y,radius); ctx.closePath();
    };
    function box(x,y,w,h,r,color,stroke) {
      rounded(x,y,w,h,r);
      if (color) { ctx.fillStyle=color; ctx.fill(); }
      if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); }
    }
    function dot(x,y,r,color,stroke,weight=1) {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      if (color) { ctx.fillStyle=color; ctx.fill(); }
      if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=weight; ctx.stroke(); }
    }
    function line(x1,y1,x2,y2,weight,color) {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
      ctx.strokeStyle=color; ctx.lineWidth=weight; ctx.stroke();
    }
    function text(str,x,y,size,color=C.ivory,opts={}) {
      ctx.font = (opts.bold ? '700 ' : '') + size + 'px ' + (opts.serif ? font : uiFont());
      ctx.fillStyle=color; ctx.textAlign=opts.align || 'left'; ctx.textBaseline='middle';
      ctx.fillText(str,x,y,opts.max || WIDTH);
    }
    function symbol(kind,x,y,r,color) {
      if (kind === 'sun') {
        dot(x,y,r*.47,color);
        for (let i=0;i<8;i++) {
          const a=i*Math.PI/4;
          line(x+Math.cos(a)*r*.66,y+Math.sin(a)*r*.66,x+Math.cos(a)*r,y+Math.sin(a)*r,r*.15,color);
        }
        return;
      }
      const n = kind === 'star' ? 10 : 4;
      ctx.beginPath();
      for (let i=0;i<n;i++) {
        const a=i*Math.PI*2/n-Math.PI/2;
        const q=(n===10 && i%2) ? r*.44:r;
        if (i===0) ctx.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);
        else ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);
      }
      ctx.closePath(); ctx.fillStyle=color; ctx.fill();
    }
    function button(id,label,x,y,w,h,kind='sub',short=label) {
      const main=kind==='main';
      const disabled=kind==='disabled';
      const material=ctx.createLinearGradient(0,y,0,y+h);
      if(main) {
        material.addColorStop(0,'#ffe0a5');material.addColorStop(.45,'#efb972');material.addColorStop(1,'#ca8b50');
      } else {
        material.addColorStop(0,disabled?'#13252b':'#23383d');material.addColorStop(1,C.deep);
      }
      box(x,y,w,h,10,material,main?'#f8dba5':C.rule);
      if (main) {
        line(x+13,y+2,x+w-13,y+2,1,'#ffedbd');
        for (const dx of [12,w-12]) dot(x+dx,y+h/2,1.8,'#74492c','#ffdf9c');
      }
      text(short,x+w/2,y+h/2+1,kind==='quiet'?11:15,main?C.ink:disabled?C.mute:C.ivory,{bold:true,align:'center',max:w-26});
      if (!disabled) controls.push({id,label,x,y,w,h});
    }
    function curve(x1,y1,x2,y2,t) {
      const s=t*t*(3-2*t);
      return [x1+(x2-x1)*s,y1+(y2-y1)*t];
    }
    function track(x1,y1,x2,y2,color,weight) {
      ctx.beginPath(); ctx.moveTo(x1,y1);
      ctx.bezierCurveTo(x1,y1+(y2-y1)/3,x2,y2-(y2-y1)/3,x2,y2);
      ctx.strokeStyle=color; ctx.lineWidth=weight; ctx.lineCap='round'; ctx.stroke();
    }
    function routeTrack(path,color,now) {
      const points = [[railX[path.start],START],...path.steps.map(s=>[railX[s.col],railY[s.row]]),[railX[path.destination],railY[4]]];
      for (let i=0;i<points.length-1;i++) {
        const [x,y]=points[i], [nx,ny]=points[i+1];
        track(x,y,nx,ny,'rgba(7,17,21,.75)',8);
        track(x,y,nx,ny,color+'70',2);
        for (let j=0;j<10;j++) {
          const t=(j+(now%420)/420)/10;
          const [px,py]=curve(x,y,nx,ny,t);
          dot(px,py,j%2?1.35:2.1,color);
        }
      }
      return points;
    }
    function lantern(x,y,depot,now,small=false) {
      if (small) { symbol(depot.shape,x,y,8,depot.color); return; }
      const halo=ctx.createRadialGradient(x,y,0,x,y,29);
      halo.addColorStop(0,depot.color+'70'); halo.addColorStop(1,depot.color+'00');
      dot(x,y,29,halo);
      const glass=ctx.createLinearGradient(x-11,y-12,x+11,y+12);
      glass.addColorStop(0,depot.color);glass.addColorStop(.2,depot.dark);glass.addColorStop(1,'#101c24');
      box(x-16,y-17,32,35,6,'#171d22','#ad845c');
      box(x-11,y-12,22,25,4,glass,depot.color+'a0');
      symbol(depot.shape,x,y,8.5,depot.color);
      for(const side of [-1,1]) {
        for(const dy of [-9,10]) box(x+side*16-2,y+dy-3,4,7,1,'#141f24','#4d4a3f');
        dot(x+side*12,y-14,1,'#eac899');
      }
      line(x-9,y+14,x+9,y+14,1,'#b99a74');
      if (now!==undefined) dot(x,y+21,2+Math.sin(now/145)*.45,depot.color);
    }
    function environment(now) {
      const bg=ctx.createLinearGradient(0,0,390,844);
      bg.addColorStop(0,'#152633'); bg.addColorStop(.56,'#111f27'); bg.addColorStop(1,'#0c141a');
      ctx.fillStyle=bg;ctx.fillRect(0,0,WIDTH,HEIGHT);
      if (art.backdrop && art.backdrop.width) {
        ctx.save();ctx.globalAlpha=.85;
        const ratio=Math.max(WIDTH/art.backdrop.width,HEIGHT/art.backdrop.height);
        const w=art.backdrop.width*ratio,h=art.backdrop.height*ratio;
        ctx.drawImage(art.backdrop,(WIDTH-w)/2,(HEIGHT-h)/2,w,h);
        ctx.restore();
        const shade=ctx.createLinearGradient(0,0,0,HEIGHT);
        shade.addColorStop(0,'#071018a5');shade.addColorStop(.19,'#08141b18');
        shade.addColorStop(.74,'#0a141a18');shade.addColorStop(1,'#080d14ae');
        ctx.fillStyle=shade;ctx.fillRect(0,0,WIDTH,HEIGHT);
      }
      for (let i=0;i<25;i++) {
        const x=(i*149+17)%390,y=(i*47+17)%650;
        const a=Math.round(15+11*Math.sin(now/750+i)).toString(16).padStart(2,'0');
        dot(x,y,i%4===0?1.2:.65,'#e3b17b'+a);
      }
      line(22,121,368,121,1,C.rule);
    }
    function switchboard(game,now) {
      const s=game.state;
      const moving=s.phase==='moving';
      const cart=s.job.carts[Math.min(s.index,s.job.carts.length-1)];
      const depot=DEPOTS[cart[1]];
      const path=moving ? s.motion.path : game.projection();
      const hint=s.level===0 && s.throws===0 && s.phase==='planning';
      const board=ctx.createLinearGradient(0,164,0,679);
      board.addColorStop(0,'#193036de');board.addColorStop(1,'#0d1b22e8');
            box(18,168,354,507,17,'#060e16b3','#9f795047');
      box(19,167,352,503,17,board,'#b8976d62');
      box(25,173,340,491,12,null,'#a4876538');
      for(const x of [29,361]) for(const y of [178,660]) {
        dot(x,y,2.3,'#7f7057','#dfbc776a');line(x-1,y+1,x+1,y-1,.7,C.ink);
      }
      for (let i=0;i<23;i++) {
        for (let j=0;j<13;j++) {
          dot(31+j*27,183+i*21,0.55,'#96b5aa22');
        }
      }
      for (let row=0;row<ROWS;row++) {
        for(let col=0;col<COLS;col++) {
          const x=railX[col], y=railY[row];
          for (let dir=0;dir<2;dir++) {
            const next=BRANCH[col][dir], nx=railX[next], ny=railY[row+1];
            const active=dir===s.points[row*3+col];
            track(x,y,nx,ny,'#0b181c',10);
            for(let t=.23;t<.83;t+=.13) {
              const [px,py]=curve(x,y,nx,ny,t);
              line(px-5,py,px+5,py,2,active?'#665f4c':'#46504a');
            }
            track(x-2,y,nx-2,ny,active?'#748481':'#425652',1.6);
            track(x+2,y,nx+2,ny,active?'#6a7f7e':'#3b4f50',1.6);
          }
        }
      }
      const routeVisible=path && (s.phase==='planning' || moving);
      const nodes=routeVisible ? routeTrack(path,depot.color,now) : null;
      if (s.job.stamp && !s.earnedStamp) {
        const [row,col,dir]=s.job.stamp;
        const next=BRANCH[col][dir];
        const [x,y]=curve(railX[col],railY[row],railX[next],railY[row+1],.33);
        const selected=routeVisible&&path.marked;
        if (selected) dot(x,y,15,'#edb96d37');
        dot(x,y,9,'#182025',C.gold,1.3);
        symbol('star',x,y,6,C.gold);
      }
      for(let row=0;row<ROWS;row++) {
        for(let col=0;col<COLS;col++) {
          const i=row*3+col, x=railX[col],y=railY[row],dir=s.points[i];
          const onPath=routeVisible && path.steps.some(step=>step.i===i);
          const high=hint && i===1;
          if (high || (s.lastFlip===i && now-s.flipTime<330)) {
            dot(x,y,27+Math.sin(now/160)*2,high?'#e7bd8040':'#e7bd802c',high?C.gold:null);
          }
          const brass=ctx.createLinearGradient(x,y-20,x,y+20);
          brass.addColorStop(0,onPath?'#526459':'#304c52');brass.addColorStop(1,'#13242a');
          dot(x,y+3,21,'#09151a');
          dot(x,y,20,brass,onPath?depot.color:'#687674',high?2:1);
          dot(x,y,15,'#111e24a0','#ad9f7374');
          dot(x-15,y+4,1.2,'#b3a483');dot(x+15,y+4,1.2,'#b3a483');
          const next=BRANCH[col][dir];
          const dx=next===col?0:Math.sign(next-col)*10;
          line(x,y-8,x,y-1,3,C.mute);
          line(x,y-1,x+dx,y+9,4,onPath?depot.color:C.ivory);
          dot(x,y-1,3,onPath?depot.color:C.ivory);
          if (s.phase==='planning' && !s.dialog) controls.push({
            id:'switch-'+i, label:'Switch '+(row+1)+', '+['left','middle','right'][col]+', points '+(dx===0?'straight':dx<0?'left':'right'),
            x:x-24,y:y-24,w:48,h:48
          });
        }
      }
      for (let i=0;i<COLS;i++) {
        const d=DEPOTS[i], x=railX[i], isTarget=i===cart[1];
        box(x-44,railY[4]-10,88,40,8,isTarget?d.dark:C.deep,isTarget?d.color:C.rule);
        symbol(d.shape,x-28,railY[4]+10,7,d.color);
        text(d.name,x-16,railY[4]+10,11,isTarget?C.ivory:C.sub,{bold:true,max:57});
      }
      if (moving && nodes) {
        const age=s.motion.age;
        const index=Math.min(4,Math.max(0,Math.floor((age-200)/210)+1));
        const t=index===0?Math.min(age/200,1):Math.min(1,(age-200-(index-1)*210)/210);
        const [x,y]=curve(...nodes[index],...nodes[index+1],t);
        lantern(x,y,depot,now);
      } else if (s.phase==='planning') {
        lantern(railX[cart[0]],START+8,depot,now);
      }
    }
    function briefing(s, path) {
      const current=s.job.carts[Math.min(s.index,s.job.carts.length-1)];
      const target=DEPOTS[current[1]];
      box(18,687,354,59,11,C.panel,C.rule);
      if (s.phase==='moving') {
        text('Cart rolling to '+DEPOTS[path.destination].name,32,706,14,C.ivory,{bold:true});
        text('Passed switches flip automatically.',32,728,12,C.sub);
      } else if (s.phase==='lost') {
        text('Cart arrived at '+DEPOTS[s.result.got].name,32,706,14,C.danger,{bold:true});
        text('It needed '+DEPOTS[s.result.wanted].name+'.',32,728,12,C.sub);
      } else if (s.phase==='won') {
        text('All carts delivered',32,706,14,C.green,{bold:true});
        text('Continue or replay this job.',32,728,12,C.sub);
      } else if (s.level===0 && s.throws===0) {
        text('Deliver the cart to '+target.name,32,706,14,C.ivory,{bold:true});
        text('Tap the glowing switch to change the route.',32,728,12,C.sub);
      } else if (path && path.destination===current[1]) {
        text(target.name+' route lined up',32,706,14,target.color,{bold:true});
        const hint=s.level===0?'Tap Dispatch to send the cart.'
          :path.marked&&!s.earnedStamp?'This route collects the brass stamp.'
          :s.level===2&&s.index===0?'The gold star marks a bonus branch.'
          :s.level===1&&s.index===1?'The first cart flipped this route into place.'
          :'Dispatch when you’re ready.';
        text(hint,32,728,12,C.sub);
      } else if (path) {
        text('Route goes to '+DEPOTS[path.destination].name,32,706,14,C.ivory,{bold:true});
        text(s.level===1?'Each cart flips the switches behind it.':'Tap a switch to reach '+target.name+'.',32,728,12,C.sub);
      }
    }
    function overlay() {
      ctx.fillStyle='rgba(5,12,16,.79)';ctx.fillRect(0,0,WIDTH,HEIGHT);
      controls.length=0;
    }
    function result(game) {
      const s=game.state, won=s.phase==='won', r=s.result;
      overlay();
      box(23,250,344,325,16,C.panel,won?C.gold:C.danger);
      text(won?'JOB COMPLETE':'MISROUTED',195,281,12,won?C.gold:C.danger,{align:'center',bold:true});
      text(won?s.job.name:'Wrong depot',195,324,34,C.ivory,{align:'center',serif:true,max:311});
      if (won) {
        for(let i=0;i<3;i++) symbol('star',151+i*44,380,16,i<r.stars?C.gold:C.rule);
        text(r.throws+' switch '+(r.throws===1?'throw':'throws')+'  ·  Par '+r.par,195,424,14,C.sub,{align:'center'});
        if (s.job.stamp) text(r.throws>r.par?'Stay within par to earn more stars.':s.earnedStamp?'Brass stamp collected':'Brass stamp available on replay',195,447,12,C.sub,{align:'center'});
        button('next',s.level+1<game.levels.length?'Next job':'Job board',41,477,308,45,'main');
        button('retry','Try again',41,532,308,31,'quiet');
      } else {
        text('The cart reached '+DEPOTS[r.got].name+'.',195,383,16,C.sub,{align:'center'});
        text('It needed the '+DEPOTS[r.wanted].name+' depot.',195,410,16,C.ivory,{align:'center'});
        button('retry','Retry job',41,477,308,47,'main');
        button('jobs','Job board',41,533,308,30,'quiet');
      }
    }
    function dialog(game) {
      const s=game.state;
      overlay();
      box(23,201,344,430,17,C.panel,C.rule);
      text(s.dialog==='help'?'Working the yard':'Night shift jobs',43,240,30,C.ivory,{serif:true});
      if(s.dialog==='help') {
        const copy=[
          ['1','Throw a switch','Tap the round points to change direction.'],
          ['2','Follow the dotted route','Match the cart’s symbol to its depot.'],
          ['3','Dispatch the cart','It flips every switch it passes.'],
          ['4','Earn more stars','You can go over par and still finish.','At par, a brass stamp can earn the third star.'],
        ];
        copy.forEach(([n,head,body,extra],i)=>{
          const y=293+i*65;
          dot(58,y,14,C.deep,C.rule);text(n,58,y,12,C.gold,{align:'center',bold:true});
          text(head,83,y-4,15,C.ivory,{bold:true});text(body,83,y+16,12,C.sub,{max:263});
          if(extra) text(extra,83,y+33,12,C.sub,{max:263});
        });
      } else {
        game.levels.forEach((job,i)=>{
          const col=i%2, row=Math.floor(i/2);
          const x=41+col*155,y=276+row*64,unlocked=i===0 || s.best[i-1]>0;
          const name=(i+1)+'. '+job.name;
          button('job-'+i,name,x,y,150,54,unlocked?'sub':'disabled',name);
          if(s.best[i]) for(let j=0;j<s.best[i];j++) symbol('star',x+64+j*11,y+43,4.2,C.gold);
        });
      }
      button('close','Back to yard',41,572,308,43,'main');
    }
    function draw(game, now) {
      controls.length=0;
      const s=game.state;
      const path=s.phase==='moving'?s.motion.path:game.projection();
      environment(now);
      text('Switchyard',22,51,53,C.ivory,{serif:true,max:237});
      text('A F T E R   D A R K',24,82,11,C.gold,{bold:true});
      button('sound',s.muted?'Unmute sound':'Mute sound',267,30,49,33,'quiet',s.muted?'OFF':'SFX');
      if (s.phase!=='moving') button('help','Help',321,30,47,33,'quiet','?');
      text('JOB '+String(s.level+1).padStart(2,'0')+'  /  '+s.job.name,24,104,13,C.sub,{bold:true,max:254});
      if(s.phase!=='moving') button('jobs','Job board',301,84,67,29,'quiet','JOBS');
      text('QUEUE',24,144,10,C.mute,{bold:true});
      s.job.carts.forEach((cart,i)=>{
        const x=87+i*39,d=DEPOTS[cart[1]],active=s.index===i;
        box(x-15,131,32,26,7,active?d.dark:C.deep,active?d.color:C.rule);
        if (i<s.index) text('✓',x+1,145,13,C.green,{align:'center',bold:true});
        else lantern(x+1,144,d,now,true);
      });
      text(s.throws+' '+(s.throws===1?'THROW':'THROWS')+'  ·  PAR '+s.job.par,367,144,11,s.throws>s.job.par?C.danger:C.sub,{align:'right',bold:true});
      switchboard(game,now);
      briefing(s,path);
      button('reset','Restart job',18,760,80,54,s.phase==='moving'?'disabled':'sub','Reset');
      button('dispatch','Dispatch',108,760,264,54,s.phase==='planning'?'main':'disabled',s.phase==='moving'?'Rolling…':'Dispatch');

      if (s.phase==='won' || s.phase==='lost') result(game);
      if (s.dialog) dialog(game);
      return controls;
    }
    return {draw, setFont(value){font=value;}};
  }
  return {painter};
});
