(() => {
  'use strict';
  const core = window.Switchyard;
  const canvas = document.querySelector('canvas');
  const surface = document.querySelector('main');
  const controls = document.getElementById('controls');
  const live = document.getElementById('live');
  const ctx = canvas.getContext('2d', {alpha:false});
  const params = new URLSearchParams(location.search);
  const art = document.body.dataset.slice==='early' ? {} : {font:'Instrument Serif, Georgia', uiFont:'Instrument Sans, Arial'};
  const sound = {};
  let soundReady = false;
  const game = core.create({
    limit:document.body.dataset.slice === 'early' ? 3 : undefined,
    storage:{
      get:() => localStorage.getItem('switchyard-after-dark'),
      set:(value) => localStorage.setItem('switchyard-after-dark',value)
    },
    cue(id){
      if (id==='pause'||id==='mute') {
        Object.values(sound).forEach(el=>el.pause());
        return;
      }
      if ((id==='enable'||id==='resume') && (soundReady||id==='enable') && !game.state.muted) {
        if(sound.ambience) {
          soundReady=true;
          sound.ambience.play().catch(()=>{soundReady=false;});
        }
        return;
      }
      if (sound[id]) {
        sound[id].currentTime=0;
        sound[id].play().catch(()=>{});
      }
    }
  });
  const painter = window.SwitchyardPaint.painter(ctx, art);
  if (document.body.dataset.slice !== 'early') {
    const backdrop = new Image();
    backdrop.src = './assets/yard.jpg';
    backdrop.onload = () => {art.backdrop=backdrop;};
    for (const [id,gain] of Object.entries({ambience:.18,switch:.46,dispatch:.36,deliver:.47,miss:.39})) {
      sound[id]=new Audio('./assets/'+id+'.mp3');
      sound[id].preload='auto';
      sound[id].volume=gain;
      sound[id].loop=id==='ambience';
    }
  }
  const buttons = new Map();
  let fit, dpr, lastLive, priorDialog, priorPhase;
  function resize() {
    const {width,height} = surface.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    fit = core.fit(width,height);
    canvas.width = Math.round(width*dpr);
    canvas.height = Math.round(height*dpr);
    canvas.style.width=width+'px';
    canvas.style.height=height+'px';
  }
  function syncButtons(items) {
    const ids = new Set(items.map(item=>item.id));
    for (const [id,button] of buttons) {
      if (!ids.has(id)) {button.remove();buttons.delete(id);}
    }
    for (const item of items) {
      let button=buttons.get(item.id);
      if (!button) {
        button=document.createElement('button');
        button.type='button';
        button.dataset.control=item.id;
        button.addEventListener('click', () => {
          if (!soundReady && sound.ambience && !game.state.muted) {
            soundReady=true;
            sound.ambience.play().catch(()=>{soundReady=false;});
          }
          game.action(item.id,performance.now());
        });
        buttons.set(item.id,button);
        controls.append(button);
      }
      if (button.getAttribute('aria-label')!==item.label) button.setAttribute('aria-label',item.label);
      const style=[fit.x+item.x*fit.scale,fit.y+item.y*fit.scale,item.w*fit.scale,item.h*fit.scale].map(n=>Math.round(n*100)/100);
      if (button.dataset.box!==style.join(',')) {
        Object.assign(button.style,{left:style[0]+'px',top:style[1]+'px',width:style[2]+'px',height:style[3]+'px'});
        button.dataset.box=style.join(',');
      }
    }
    const s=game.state;
    if (priorDialog !== s.dialog || priorPhase !== s.phase) {
      if (s.dialog) buttons.get('close')?.focus({preventScroll:true});
      else if (s.phase==='won') buttons.get('next')?.focus({preventScroll:true});
      else if (s.phase==='lost') buttons.get('retry')?.focus({preventScroll:true});
      priorDialog=s.dialog;priorPhase=s.phase;
    }
  }
  function announce() {
    const s=game.state, path=game.projection();
    const wanted=s.job.carts[s.index]?.[1];
    let message='Job '+(s.level+1)+', '+s.job.name+'. ';
    if (s.phase==='planning') message += 'Cart '+(s.index+1)+' of '+s.job.carts.length+' needs '+core.DEPOTS[wanted].name+'. Preview ends at '+core.DEPOTS[path.destination].name+'.';
    if (s.phase==='moving') message += 'Cart rolling.';
    if (s.phase==='won') message += 'Job complete. '+s.result.stars+' stars.';
    if (s.phase==='lost') message += 'Wrong depot. Retry job.';
    if (message!==lastLive) {live.textContent=message;lastLive=message;}
  }
  function render(now) {
    game.step(now);
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle='#09141c';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.setTransform(dpr*fit.scale,0,0,dpr*fit.scale,dpr*fit.x,dpr*fit.y);
    syncButtons(painter.draw(game,now));
    announce();
    requestAnimationFrame(render);
  }
  if (params.get('qa')==='1') window.__AF_TEST__={
    getSnapshot() {
      const s=game.state;
      const projected=s.phase==='planning' ? game.projection() : s.motion?.path;
      return JSON.parse(JSON.stringify({
        scene:'switchyard',phase:s.phase,job:s.level,index:s.index,points:s.points,throws:s.throws,
        earnedStamp:s.earnedStamp,received:s.received,result:s.result,best:s.best,dialog:s.dialog,paused:s.paused,
        queue:s.job.carts,projected,
        assets:{backdrop:!!art.backdrop,ambience:sound.ambience?.readyState || 0,muted:s.muted,
          playing:Object.keys(sound).filter(id=>!sound[id].paused),
          decoded:Object.keys(sound).filter(id=>sound[id].readyState>=2)},
        ui:Array.from(buttons.values(), el=>({id:el.dataset.control,label:el.getAttribute('aria-label'),box:el.dataset.box})),
        fit
      }));
    }
  };
  addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>game.pause(document.hidden,performance.now()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&game.state.dialog)game.action('close',performance.now());});
  resize();
  requestAnimationFrame(render);
})();
