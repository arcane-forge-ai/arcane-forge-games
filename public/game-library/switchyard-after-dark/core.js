(function (root, factory) {
  if (typeof module === 'object') module.exports = factory();
  else root.Switchyard = factory();
})(globalThis, function () {
  'use strict';
  const WIDTH = 390, HEIGHT = 844, ROWS = 4, COLS = 3;
  const DEPOTS = [
    {name:'Amber', color:'#ffc16e', dark:'#824629', shape:'sun'},
    {name:'Jade', color:'#8be5c7', dark:'#276856', shape:'diamond'},
    {name:'Violet', color:'#c7b6fb', dark:'#574683', shape:'star'},
  ];
  // Edge columns are anchored by the outer rails. The middle points fan out.
  const BRANCH = [[0,1],[0,2],[1,2]];
  const jobs = [
    {name:'First light', points:'000001001001', carts:[[1,2]], par:1,
      hint:'Tap the glowing switch to route the cart to Violet.'},
    {name:'The return line', points:'000001001001', carts:[[1,2],[1,0]], par:1,
      hint:'Each cart flips the switches it passes. Plan for both carts.'},
    {name:'Night freight', points:'011000000110', carts:[[1,2],[2,0],[1,1]], par:5,
      stamp:[1,1,1], hint:'The brass stamp is a bonus. Can you take it and still make every delivery?'},
    {name:'The east spur', points:'010000001000', carts:[[0,1],[1,2],[2,0]], par:5,
      stamp:[2,2,0], hint:'Carts can enter from different tracks. Watch the queue.'},
    {name:'Cross current', points:'101101100101', carts:[[0,2],[0,0],[1,1]], par:4,
      stamp:[2,2,1], hint:'The preview follows the cart at the front of the queue.'},
    {name:'Mountain mail', points:'101001001111', carts:[[2,0],[1,0],[1,1],[0,2]], par:5,
      stamp:[1,0,1], hint:'The cheapest route now can leave a bad route for the next cart.'},
    {name:'Quiet junction', points:'101010111111', carts:[[0,0],[1,0],[0,1],[1,2]], par:6,
      stamp:[2,2,1], hint:'Try leaving the points where the next cart will need them.'},
    {name:'Last lantern', points:'110011110111', carts:[[0,1],[2,0],[1,2],[0,0]], par:5,
      stamp:[2,1,1], hint:'One last queue before the valley goes dark.'},
  ];

  function route(points, start, stamp) {
    const steps = [];
    let col = start;
    let marked = false;
    for (let row = 0; row < ROWS; row++) {
      const i = row * COLS + col;
      const dir = points[i];
      const next = BRANCH[col][dir];
      if (stamp && stamp[0] === row && stamp[1] === col && stamp[2] === dir) marked = true;
      steps.push({row,col,i,dir,next});
      col = next;
    }
    return {start, steps, destination:col, marked};
  }

  function fit(width, height) {
    const scale = Math.min(width / WIDTH, height / HEIGHT);
    return {scale, x:(width - WIDTH * scale) / 2, y:(height - HEIGHT * scale) / 2};
  }

  function create(options = {}) {
    const levels = jobs.slice(0, options.limit || jobs.length);
    const storage = options.storage || {get(){}, set(){}};
    const cue = options.cue || (() => {});
    let save;
    try { save = JSON.parse(storage.get() || '{}'); } catch (_) { save = {}; }
    if (!save || typeof save !== 'object') save = {};
    const best = Array.from({length:levels.length}, (_,i) =>
      Math.min(3, Math.max(0, Number(save.best && save.best[i]) || 0)));
    const state = {level:0, muted:!!save.muted, best, dialog:null, paused:false};
    const persist = () => {
      try { storage.set(JSON.stringify({best:state.best, muted:state.muted})); } catch (_) {}
    };
    function open(level) {
      const job = levels[level];
      Object.assign(state, {
        level, job, points:Array.from(job.points, Number), index:0, throws:0, earnedStamp:false,
        phase:'planning', motion:null, result:null, dialog:null, lastFlip:-1, flipTime:-1,
        received:[], settledAt:-1,
      });
    }
    function projection() {
      const cart = state.job.carts[state.index];
      return cart && route(state.points, cart[0], state.job.stamp);
    }
    function action(id, now) {
      if (state.paused) return;
      if (id === 'sound') {
        state.muted = !state.muted;
        persist();
        cue(state.muted ? 'mute' : 'enable');
        return;
      }
      if (id === 'close') { state.dialog = null; return; }
      if (state.dialog) {
        if (id.startsWith('job-')) {
          const level = Number(id.slice(4));
          if (Number.isInteger(level) && levels[level] && (level === 0 || state.best[level-1])) open(level);
        }
        return;
      }
      if (state.phase === 'moving') return;
      if (id === 'help' || id === 'jobs') { state.dialog = id; return; }
      if (id === 'retry' || id === 'reset') { open(state.level); return; }
      if (id === 'next' && state.phase === 'won') {
        if (state.level + 1 < levels.length) open(state.level + 1);
        else state.dialog = 'jobs';
        return;
      }
      if (state.phase !== 'planning') return;
      if (id.startsWith('switch-')) {
        const index = Number(id.slice(7));
        if (Number.isInteger(index) && index >= 0 && index < state.points.length) {
          state.points[index] ^= 1;
          state.lastFlip = index;
          state.flipTime = now;
          state.throws++;
          if (!state.muted) cue('switch');
        }
      } else if (id === 'dispatch') {
        state.motion = {path:projection(), start:now, age:0, flipped:0};
        state.phase = 'moving';
        if (!state.muted) cue('dispatch');
      }
    }
    function step(now) {
      if (state.paused || state.phase !== 'moving') return;
      const m = state.motion;
      m.age = Math.max(0, now - m.start);
      while (m.flipped < ROWS && m.age >= 200 + 210 * m.flipped) {
        const point = m.path.steps[m.flipped++].i;
        state.points[point] ^= 1;
        state.lastFlip = point;
        state.flipTime = now;
      }
      if (m.age < 1240) return;
      const got = m.path.destination;
      const wanted = state.job.carts[state.index][1];
      if (got !== wanted) {
        state.phase = 'lost';
        state.result = {got, wanted};
        if (!state.muted) cue('miss');
        return;
      }
      state.received.push(got);
      state.settledAt = now;
      state.earnedStamp ||= m.path.marked;
      state.index++;
      if (!state.muted) cue('deliver');
      if (state.index < state.job.carts.length) {
        state.phase = 'planning';
        state.motion = null;
        return;
      }
      const {par,stamp} = state.job;
      const withinPar = state.throws <= par;
      const gold = withinPar && (stamp ? (state.earnedStamp || state.throws <= par - 2) : true);
      const stars = 1 + Number(withinPar) + Number(gold);
      state.best[state.level] = Math.max(stars, state.best[state.level]);
      state.result = {stars, throws:state.throws, par};
      state.phase = 'won';
      persist();
    }
    let pauseTime = 0;
    function pause(hidden, now) {
      if (hidden === state.paused) return;
      state.paused = hidden;
      if (hidden) pauseTime = now;
      else if (state.phase === 'moving') state.motion.start += now - pauseTime;
      cue(hidden ? 'pause' : 'resume');
    }
    open(0);
    return {state, levels, action, projection, step, pause};
  }
  return {WIDTH, HEIGHT, ROWS, COLS, DEPOTS, BRANCH, jobs, route, fit, create};
});
