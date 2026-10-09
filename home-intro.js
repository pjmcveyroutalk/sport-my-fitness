/* Blender-rendered artwork and original, evaluated Blender F-curves.
   The approved responsive text, lettering finish and buttons remain live. */
(() => {
 'use strict';
 const root=document.documentElement;
 if(!window.matchMedia) return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const nav=performance.getEntriesByType('navigation')[0];
 if(reduce.matches || nav?.type==='back_forward' ||
    (location.hash && location.hash!=='#top')) return;

 async function initialize(){
  const main=document.querySelector('.smf-home-page');
  const stage=main?.querySelector('.yoshi-stage');
  const photo=stage?.querySelector('.yoshi-hero');
  if(!photo || document.hidden || reduce.matches) return;
  // #top follows the desktop header: native anchor scrolling is legitimate.
  const header=document.querySelector('.site-header');
  if(scrollY>(header?.offsetHeight || 0)+24) return;

  let finished=false,playing=false,timeline,handle,timer,gl,program,texture,buffer;
  let initialScroll=scrollY,lastTime=-1,lastProgress=performance.now();
  const canvas=document.createElement('canvas');
  canvas.className='smf-blender-art';canvas.width=1586;canvas.height=992;
  canvas.setAttribute('aria-hidden','true');
  const video=document.createElement('video');
  video.className='smf-blender-source';video.muted=true;
  video.defaultMuted=true;video.playsInline=true;video.preload='auto';
  video.setAttribute('muted','');video.setAttribute('playsinline','');
  video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  const saved=new Map();
  const bindings=[
   ['04-location','.hero-eyebrow'],
   ['05-it-all','.hero h1>span:nth-child(1)'],
   ['06-takes','.hero h1>span:nth-child(2)'],
   ['07-work','.hero h1>span:nth-child(3)'],
   ['08-supporting-copy','.hero-subline,.hero-description'],
   ['09-train-button','.hero-button'],
   ['10-explore-button','.hero-actions>.text-link'],
   ['11-motto-band','.mission-strip'],
   ['12-training-section','.training-section>.wrap']
  ].map(([name,selector])=>[name,[...main.querySelectorAll(selector)]]);
  function set(el,key,value){
   if(!saved.has(el)) saved.set(el,new Map());
   const values=saved.get(el);
   if(!values.has(key)) values.set(key,[el.style.getPropertyValue(key),el.style.getPropertyPriority(key)]);
   el.style.setProperty(key,value);
  }
  const actions=['pointerdown','keydown','wheel','touchstart','pagehide','hashchange','resize'];
  function finish(){
   if(finished) return;
   finished=true;root.classList.remove('smf-blender-playing');
   clearTimeout(timer);
   if(video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(handle);
   cancelAnimationFrame(handle);
   video.pause();video.removeAttribute('src');video.load();
   canvas.remove();video.remove();
   saved.forEach((props,el)=>props.forEach(([value,priority],key)=>{
    if(value) el.style.setProperty(key,value,priority);else el.style.removeProperty(key);
   }));
   actions.forEach(type=>window.removeEventListener(type,finish,true));
   window.removeEventListener('scroll',scrolled);
   document.removeEventListener('visibilitychange',visibility);
   reduce.removeEventListener?.('change',motionChanged);
   if(gl){
    if(texture) gl.deleteTexture(texture);
    if(buffer) gl.deleteBuffer(buffer);
    if(program) gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
   }
  }
  function scrolled(){if(playing && Math.abs(scrollY-initialScroll)>4) finish();}
  function visibility(){if(document.hidden) finish();}
  function motionChanged(e){if(e.matches) finish();}
  actions.forEach(type=>window.addEventListener(type,finish,{capture:true,passive:true}));
  window.addEventListener('scroll',scrolled,{passive:true});
  document.addEventListener('visibilitychange',visibility);
  reduce.addEventListener?.('change',motionChanged);
  video.addEventListener('error',finish,{once:true});
  video.addEventListener('ended',finish,{once:true});
  canvas.addEventListener('webglcontextlost',finish,{once:true});
  timer=setTimeout(finish,6000);

  try{
   gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,powerPreference:'low-power'});
   if(!gl){finish();return;}
   const compile=(type,source)=>{
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw Error('Video shader unavailable');
    return shader;
   };
   const vs=compile(gl.VERTEX_SHADER,'attribute vec2 p; attribute vec2 uv; varying vec2 v; void main(){v=uv;gl_Position=vec4(p,0.,1.);}');
   const fs=compile(gl.FRAGMENT_SHADER,'precision mediump float; uniform sampler2D frame; varying vec2 v; void main(){vec3 c=texture2D(frame,vec2(v.x,.5+.5*v.y)).rgb;float a=texture2D(frame,vec2(v.x,.5*v.y)).r;gl_FragColor=vec4(c*a,a);}');
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error('Video compositor unavailable');
   gl.useProgram(program);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]),gl.STATIC_DRAW);
   for(const [name,offset] of [['p',0],['uv',8]]){
    const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,16,offset);
   }
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   gl.uniform1i(gl.getUniformLocation(program,'frame'),0);
   gl.viewport(0,0,canvas.width,canvas.height);
   stage.append(video);
   const ready=new Promise((resolve,reject)=>{
    video.addEventListener('loadeddata',resolve,{once:true});
    video.addEventListener('error',reject,{once:true});
   });
   video.src='assets/smf-home-blender-motion.mp4';video.load();
   const data=fetch('assets/smf-home-blender-timeline.json').then(r=>{
    if(!r.ok) throw Error('Blender timeline unavailable');return r.json();
   });
   [timeline]=await Promise.all([data,ready,document.fonts?.ready || Promise.resolve()]);
   if(finished || reduce.matches || document.hidden) {finish();return;}
   if(timeline.frames!==114 || timeline.fps!==30) throw Error('Unexpected Blender timeline');
   initialScroll=scrollY;
   function paint(time){
    const position=Math.min(113,Math.max(0,time*30));
    const a=Math.floor(position),b=Math.min(a+1,113),mix=position-a;
    const size=Math.min(main.clientWidth/1536,1800/1536);
    bindings.forEach(([name,elements])=>{
     const from=timeline.layers[name][a],to=timeline.layers[name][b];
     const k=from.map((n,i)=>n+(to[i]-n)*mix);
     elements.forEach(el=>{
      // Individual properties preserve the approved stretched italic transform.
      set(el,'translate',(k[0]*size)+'px '+(k[1]*size)+'px');
      set(el,'scale',String(k[2]));set(el,'opacity',String(k[3]));
     });
    });
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   }
   paint(0);stage.append(canvas);set(photo,'visibility','hidden');
   root.classList.add('smf-blender-playing');
   await video.play();
   if(finished) return;
   playing=true;clearTimeout(timer);
   function tick(){
    if(finished) return;
    try{
     paint(video.currentTime);
     if(video.currentTime!==lastTime){lastTime=video.currentTime;lastProgress=performance.now();}
     if(performance.now()-lastProgress>2000){finish();return;}
     if(video.ended){finish();return;}
     handle=video.requestVideoFrameCallback ? video.requestVideoFrameCallback(tick) : requestAnimationFrame(tick);
    }catch{finish();}
   }
   const watchdog=()=>{
    if(finished)return;
    if(performance.now()-lastProgress>2500)finish();else timer=setTimeout(watchdog,1000);
   };
   timer=setTimeout(watchdog,1000);tick();
  }catch{finish();}
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initialize,{once:true});
 else initialize();
})();
