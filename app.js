import {updatePageMetadata} from '/page-metadata.js?v=39';
// Route modules are requested only when their pages are opened.
function lazyMount(loader,mount){let alive=true,dispose=()=>{};loader().then(module=>{if(alive)dispose=mount(module);}).catch(error=>{if(alive){main.innerHTML='<section class="inside"><div class="page-intro"><h1>Не удалось загрузить страницу</h1><p>Обновите страницу, чтобы повторить загрузку.</p></div></section>';console.error(error);}});return()=>{alive=false;dispose();};}
const projects = [
 {id:'bonch',title:'Bonch events',description:'Разработка концепций мероприятий, планирование подготовки,\nкоординация команды и визуальное сопровождение'},
 {id:'eva',title:'Eva Catering polygraphy & soc.media',description:'Разработка полиграфии и визуальных материалов\nдля социальных сетей кейтеринговой компании'},
 {id:'museum',title:'МСИА branding',description:'Разработка бренд-платформы и визуальной концепции\nмерча для Музея советских игровых автоматов'},
 {id:'rap',title:'The Cult R.A.P. identity & exhibition',description:'Разработка концепции AI-артистов, музыкального и визуального\nконтента, айдентики и выставочного пространства'},
 {id:'amkal',title:'Амкал home & guest kit',description:'Разработка концепции футбольной формы, создание\nвизуальной кампании с использованием AI-графики'}
];
// Keep short Russian function words attached to the following word at every width.
for(const project of projects) project.description=project.description.replace(/(^|[\s])([А-Яа-яЁё]{1,3})[ \n]+(?=\S)/g,(match,before,word)=>/^(?:а|и|в|во|к|ко|с|со|у|о|об|от|до|по|на|за|из|без|для|над|под|при|не|но|или)$/i.test(word)?before+word+'\u00a0':match);
const $=s=>document.querySelector(s), main=$('#main');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const mod=(n,m)=>((n%m)+m)%m, lerp=(a,b,t)=>a+(b-a)*t;
const asset=id=>`/assets/${id}.webp`;
let cleanup=()=>{},navigationToken=0;
function program(gl,vs,fs){
 const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
}
class GalleryRenderer{
 constructor(canvas,images){
  this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!this.gl)throw Error('WebGL unavailable');const gl=this.gl;
  this.p=program(gl,`attribute vec2 a;uniform vec2 viewport,size,center,tilt;varying vec2 uv;void main(){uv=a;vec2 q=(a-.5)*size;float z=0.;float x=q.x*cos(tilt.y)+z*sin(tilt.y);z=-q.x*sin(tilt.y)+z*cos(tilt.y);float y=q.y*cos(tilt.x)-z*sin(tilt.x);z=q.y*sin(tilt.x)+z*cos(tilt.x);float s=1100./(1100.-z);vec2 p=center+vec2(x,y)*s;gl_Position=vec4(p.x/viewport.x*2.-1.,1.-p.y/viewport.y*2.,0.,1.);}`,
  `precision highp float;varying vec2 uv;uniform sampler2D tex;uniform float parallax,hover;uniform vec2 mouse;void main(){vec2 v=uv;v=(v-.5)*.85+.5;v.x+=parallax;v+=(mouse-.5)*hover*.018;v=clamp(v,vec2(.001),vec2(.999));vec3 color=texture2D(tex,v).rgb;float light=(uv.x-.5)*hover*.028;color+=light;gl_FragColor=vec4(color,1.);}`);
  const verts=[];for(let y=0;y<16;y++)for(let x=0;x<24;x++){let x0=x/24,x1=(x+1)/24,y0=y/16,y1=(y+1)/16;verts.push(x0,y0,x1,y0,x0,y1,x0,y1,x1,y0,x1,y1)}
  this.count=verts.length/2;this.buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);gl.useProgram(this.p);let a=gl.getAttribLocation(this.p,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  this.u={};for(const k of ['viewport','size','center','tilt','tex','parallax','hover','mouse'])this.u[k]=gl.getUniformLocation(this.p,k);
  this.textures=images.map(im=>{let t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);return t});
 }
 render(cards,w,h,ts){const gl=this.gl,dpr=Math.min(devicePixelRatio,1.7);if(this.canvas.width!==Math.round(w*dpr)||this.canvas.height!==Math.round(h*dpr)){this.canvas.width=Math.round(w*dpr);this.canvas.height=Math.round(h*dpr);gl.viewport(0,0,this.canvas.width,this.canvas.height)}gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.p);gl.uniform2f(this.u.viewport,w,h);gl.uniform1i(this.u.tex,0);for(const c of cards){if(c.x+c.w< -80||c.x>w+80)continue;gl.bindTexture(gl.TEXTURE_2D,this.textures[c.index]);gl.uniform2f(this.u.size,c.w,c.h);gl.uniform2f(this.u.center,c.x+c.w/2,c.y+c.h/2);gl.uniform2f(this.u.tilt,c.rx,c.ry);gl.uniform2f(this.u.mouse,c.mx,c.my);gl.uniform1f(this.u.hover,c.hover);gl.uniform1f(this.u.parallax,Math.max(-.075,Math.min(.075,((c.x+c.w/2-w/2)/w)*.4)));gl.drawArrays(gl.TRIANGLES,0,this.count)}}
 destroy(){const g=this.gl;this.textures.forEach(t=>g.deleteTexture(t));g.deleteBuffer(this.buf);g.deleteProgram(this.p);g.getExtension('WEBGL_lose_context')?.loseContext()}
}
const coverSrc=id=>`/assets/covers/${id}-960.webp`;
const coverSet=id=>[480,960,1448].map(width=>`/assets/covers/${id}-${width}.webp ${width}w`).join(', ');
const gallerySizes='(max-width:700px) 104vw, 96.67vh';
function gallery(){
 main.innerHTML=`<section class="gallery" aria-label="Галерея проектов"><div class="gallery-track"></div><canvas class="gallery-gl" aria-hidden="true"></canvas></section><div class="caption"><div class="caption-inner"><h1></h1><p></p></div></div>`;
 const el=$('.gallery'),track=$('.gallery-track'),caption=$('.caption-inner'),canvas=$('.gallery-gl');
 let cards=[],target=0,current=0,w=innerWidth,h=innerHeight,cw=0,ch=0,gap=0,step=0,y=0,active=1,frame=0,dead=false,renderer=null,captionTimer,lastTime=performance.now(),touchStart=null,dragDelta=0,pointer={x:-999,y:-999};
 for(let repeat=-1;repeat<=1;repeat++)projects.forEach((p,index)=>{let a=document.createElement('a');a.className='card';a.href='/projects/'+p.id;a.setAttribute('aria-label',p.title);a.innerHTML=`<span class="card-inner"><img srcset="${coverSet(p.id)}" sizes="${gallerySizes}" src="${coverSrc(p.id)}" width="1448" height="1086" decoding="async" fetchpriority="${index===1?'high':index===0||index===2?'auto':'low'}" alt="${p.title}" draggable="false"></span>`;if(repeat!==0){a.tabIndex=-1;a.setAttribute('aria-hidden','true')}track.appendChild(a);cards.push({el:a,inner:a.firstElementChild,image:a.querySelector('img'),index,repeat,x:0,y:0,w:0,h:0,rx:0,ry:0,mx:.5,my:.5,hover:0});a.addEventListener('click',e=>{if(dragDelta>7){e.preventDefault();e.stopPropagation()}});a.addEventListener('focus',()=>{target=(index-1)*step;wake();});});
 function wake(){if(!dead&&!document.hidden&&!frame){lastTime=performance.now();frame=requestAnimationFrame(loop)}}
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0}else wake()}
 function size(){wake();w=innerWidth;h=innerHeight;const s=getComputedStyle(cards[0].el);cw=parseFloat(s.width);ch=parseFloat(s.height);gap=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap'))||24;y=track.getBoundingClientRect().top;step=cw+gap;cards.forEach(c=>{c.w=cw;c.h=ch;c.y=y});}
 function setCaption(index,immediate=false){if(index===active&&!immediate)return;active=index;clearTimeout(captionTimer);const write=()=>{caption.querySelector('h1').textContent=projects[index].title;caption.querySelector('p').textContent=projects[index].description;caption.classList.remove('leaving')};if(immediate)write();else{caption.classList.add('leaving');captionTimer=setTimeout(write,reduced?0:140)}}
 function wheel(e){wake();if(Math.abs(e.deltaY)+Math.abs(e.deltaX)<.1)return;e.preventDefault();let delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;delta*=e.deltaMode===1?18:e.deltaMode===2?h:1;target+=Math.max(-w,Math.min(w,delta))}
 function move(e){wake();pointer.x=e.clientX;pointer.y=e.clientY;if(touchStart&&e.pointerId===touchStart.id){let dx=e.clientX-touchStart.x;dragDelta=Math.abs(dx);target=touchStart.target-dx}}
 function down(e){if(e.pointerType==='mouse'&&e.button!==0)return;touchStart={x:e.clientX,target,id:e.pointerId};dragDelta=0}
 function up(){touchStart=null}function leave(){wake();pointer.x=-999;pointer.y=-999;touchStart=null}
 function key(e){wake();if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(e.key)&&!e.altKey&&!e.metaKey&&!e.ctrlKey){e.preventDefault();target+=(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)*step}}
 function loop(ts){frame=0;if(dead||document.hidden)return;let dt=Math.min((ts-lastTime)/16.667,3);lastTime=ts;current=lerp(current,target,reduced?1:1-Math.pow(.925,dt));const total=projects.length*step;if(Math.abs(target)>total*100){const reset=Math.trunc(current/total)*total;target-=reset;current-=reset}
  let hoverCard=-1,best=Infinity,nearest=active;const list=[];
  for(let i=0;i<cards.length;i++){const c=cards[i],base=(c.index-1)*step;let x=mod(base-current+total*1.5,total)-total/2+(w-cw)/2;c.x=x+c.repeat*total;c.el.style.transform=`translate3d(${c.x}px,0,0)`;
   if(c.x<=pointer.x&&c.x+cw>=pointer.x&&y<=pointer.y&&y+ch>=pointer.y)hoverCard=i;
   const dist=Math.abs(c.x+cw/2-w/2);if(dist<best){best=dist;nearest=c.index}list.push(c);
  }
  for(let i=0;i<cards.length;i++){let c=cards[i],over=i===hoverCard&&fine&&!reduced;let mx=(pointer.x-c.x)/cw,my=(pointer.y-y)/ch;c.hover=lerp(c.hover,over?1:0,.1*dt);c.mx=lerp(c.mx,over?mx:.5,.12*dt);c.my=lerp(c.my,over?my:.5,.12*dt);c.rx=lerp(c.rx,over?(my-.5)*-.19:0,.09*dt);c.ry=lerp(c.ry,over?(mx-.5)*.24:0,.09*dt);if(!renderer){c.inner.style.transform=`rotateX(${c.rx}rad) rotateY(${c.ry}rad) scale(${1+c.hover*.012})`;c.image.style.transform=`translate3d(${Math.max(-8,Math.min(8,((c.x+cw/2-w/2)/w)*22))}%,0,0)`}}
  setCaption(nearest);if(renderer)renderer.render(list,w,h,ts);const settling=Math.abs(target-current)>.05||cards.some(c=>Math.abs(c.rx-(fine&&!reduced&&c===cards[hoverCard]?((pointer.y-y)/ch-.5)*-.19:0))>.0002||Math.abs(c.ry-(fine&&!reduced&&c===cards[hoverCard]?((pointer.x-c.x)/cw-.5)*.24:0))>.0002||Math.abs(c.hover-(fine&&!reduced&&c===cards[hoverCard]?1:0))>.001);if(settling)frame=requestAnimationFrame(loop);
 }
 size();setCaption(1,true);wake();
 // Show the page immediately. Texture decoding enhances it without gating first paint.
 el.classList.add('is-ready');caption.parentElement.classList.add('is-ready');
 if(fine&&!reduced){
  const images=cards.filter(card=>card.repeat===0).map(card=>card.image);
  Promise.all(images.map(async image=>{try{await image.decode();return image;}catch{return null;}})).then(decoded=>{
   if(dead||!decoded.every(Boolean))return;
   try{renderer=new GalleryRenderer(canvas,decoded);renderer.render(cards,w,h,performance.now());el.classList.add('is-gl');}catch(error){renderer?.destroy();renderer=null;el.dataset.fallback=error.message;canvas.remove();}
   wake();
  });
 }
 document.fonts.ready.then(()=>{if(!dead){size();wake();}});
 el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);document.addEventListener('pointerleave',leave);window.addEventListener('keydown',key);window.addEventListener('resize',size);document.addEventListener('visibilitychange',visibility);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();el.classList.remove('is-gl');renderer=null});
 return()=>{dead=true;cancelAnimationFrame(frame);clearTimeout(captionTimer);renderer?.destroy();el.removeEventListener('wheel',wheel);el.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);document.removeEventListener('pointerleave',leave);window.removeEventListener('keydown',key);window.removeEventListener('resize',size);document.removeEventListener('visibilitychange',visibility)};
}
const workDetails=[
 {id:'eva',name:'Eva Catering',sphere:'Кейтеринг',role:'Графический дизайнер',year:'2025'},
 {id:'museum',name:'МСИА',sphere:'Музей',role:'Бренд-менеджер, графический дизайнер',year:'2024'},
 {id:'rap',name:'The Cult R.A.P.',sphere:'Нейросетевая выставка',role:'Арт-директор, куратор выставки',year:'2026'},
 {id:'amkal',name:'Амкал',sphere:'Футбольный клуб',role:'Концепт-дизайнер, AI-артист',year:'2026'},
 {id:'bonch',name:'Bonch',sphere:'Организация мероприятий',role:'Руководитель отдела дизайна, координатор, ассистент, актёр, сценарист',year:'2023'}
];
function textLink(label,href,extra=''){
 return `<a class="nav-link ${extra}" href="${href}"><span class="arrow" aria-hidden="true"><svg viewBox="0 0 16 16" focusable="false"><path d="M3 13 13 3M3 3h10v10"/></svg></span><span class="label"><span>${label}</span><span aria-hidden="true">${label}</span></span></a>`;
}
function works(){
 main.innerHTML=`<section class="works-page" aria-labelledby="works-title"><h1 id="works-title">Работы</h1><div class="works-table"><div class="works-head" aria-hidden="true"><span>Клиент</span><span>Сфера</span><span>Моя роль</span><span>Год</span></div><ul class="works-list">${workDetails.map(p=>`<li><a class="work-row" draggable="false" href="/projects/${p.id}" data-project="${p.id}"><h2>${p.name}</h2><span class="work-sphere"><span class="sr-only">Сфера: </span>${p.sphere}</span><span class="work-role"><span class="sr-only">Моя роль: </span>${p.role}</span><span class="work-year"><span class="sr-only">Год: </span>${p.year}</span></a></li>`).join('')}</ul></div><footer class="works-footer">${textLink('Архив','/archive','works-archive')}${textLink('Назад','/','works-back')}</footer></section>`;
 if(!fine||reduced)return()=>{};
 const preview=document.createElement('div');preview.className='work-preview';preview.setAttribute('aria-hidden','true');
 preview.innerHTML=`<div class="work-preview-covers"><div class="work-preview-tape">${workDetails.map(p=>`<img srcset="${coverSet(p.id)}" sizes="(max-width:1600px) 26vw, 420px" src="${coverSrc(p.id)}" width="1448" height="1086" decoding="async" fetchpriority="low" data-cover="${p.id}" alt="" draggable="false">`).join('')}</div></div>`;
 const badge=document.createElement('div');badge.className='work-preview-badge';badge.setAttribute('aria-hidden','true');badge.innerHTML='<div class="work-preview-circle"><span>Смотреть</span></div>';document.body.append(preview,badge);
 const tape=preview.querySelector('.work-preview-tape'),label=badge.querySelector('span'),list=$('.works-list'),rows=[...list.querySelectorAll('.work-row')];
 let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y,bx=x,by=y,lx=0,ly=0,raf=0,active=false,lastFrame=0,hideTimer=0;
 function position(t){const dt=lastFrame?Math.min((t-lastFrame)/16.667,3):1;lastFrame=t;const follow=a=>1-Math.pow(1-a,dt),w=preview.offsetWidth,h=preview.offsetHeight;
  x=lerp(x,tx,follow(.115));y=lerp(y,ty,follow(.115));bx=lerp(bx,tx,follow(.19));by=lerp(by,ty,follow(.19));
  const limit=(v,min,max)=>Math.max(min,Math.min(max,v));
  preview.style.transform=`translate3d(${limit(x,w/2+12,innerWidth-w/2-12)}px,${limit(y,h/2+12,innerHeight-h/2-12)}px,0) translate(-50%,-50%)`;
  badge.style.transform=`translate3d(${bx}px,${by}px,0) translate(-50%,-50%)`;
  lx=lerp(lx,limit((tx-bx)*.22,-12,12),follow(.24));ly=lerp(ly,limit((ty-by)*.22,-12,12),follow(.24));label.style.transform=`translate3d(${lx}px,${ly}px,0) rotate(${limit(lx*.22,-3,3)}deg)`;
  if(Math.abs(x-tx)+Math.abs(y-ty)+Math.abs(bx-tx)+Math.abs(by-ty)+Math.abs(lx)+Math.abs(ly)>.15)raf=requestAnimationFrame(position);else{raf=0;lastFrame=0;}
 }
 function move(e){tx=e.clientX;ty=e.clientY;if(!raf)raf=requestAnimationFrame(position);}
 function hideNow(){active=false;preview.classList.remove('is-visible');badge.classList.remove('is-visible');list.classList.remove('has-preview');rows.forEach(r=>r.classList.remove('is-active'));}
 function hide(){clearTimeout(hideTimer);hideTimer=setTimeout(hideNow,90);}
 const enters=rows.map((row,index)=>{const enter=e=>{if(innerWidth<=700)return;clearTimeout(hideTimer);tx=e.clientX;ty=e.clientY;
  if(!active){x=bx=tx;y=by=ty;lx=ly=0;tape.style.transition='none';tape.style.transform=`translate3d(0,${-index*20}%,0)`;void tape.offsetHeight;tape.style.transition='';}
  active=true;rows.forEach(r=>r.classList.toggle('is-active',r===row));tape.style.transform=`translate3d(0,${-index*20}%,0)`;preview.dataset.project=row.dataset.project;preview.classList.add('is-visible');badge.classList.add('is-visible');list.classList.add('has-preview');if(!raf)raf=requestAnimationFrame(position);
 };row.addEventListener('pointerenter',enter);return enter;});
 list.addEventListener('pointermove',move);list.addEventListener('pointerleave',hide);window.addEventListener('blur',hideNow);window.addEventListener('resize',hideNow);
 return()=>{clearTimeout(hideTimer);cancelAnimationFrame(raf);rows.forEach((row,i)=>row.removeEventListener('pointerenter',enters[i]));list.removeEventListener('pointermove',move);list.removeEventListener('pointerleave',hide);window.removeEventListener('blur',hideNow);window.removeEventListener('resize',hideNow);preview.remove();badge.remove();};
}
const routeModules=new Map();
function preloadRoute(path){const id=path.replace(/\/+$/,'')||'/';let loader;if(id==='/resume'||id==='/contacts')loader=()=>import('/about.js?v=39');else if(id==='/projects/rap')loader=()=>import('/rap-case.js?v=38');else if(/^\/projects\/(eva|museum|amkal|bonch)$/.test(id))loader=()=>import('/project-cases.js?v=38');if(!loader)return Promise.resolve();if(!routeModules.has(id))routeModules.set(id,loader().catch(error=>{routeModules.delete(id);throw error;}));return routeModules.get(id);}
function warmLink(event){const link=event.target.closest('a');if(link&&link.origin===location.origin)preloadRoute(link.pathname).catch(()=>{});}
document.addEventListener('pointerover',warmLink,{passive:true});document.addEventListener('focusin',warmLink);document.addEventListener('touchstart',warmLink,{passive:true});
function inside(path){
 const back='<a class="back" href="/">↖ На главную</a>';
 if(path==='/works')return works();
 else if(path==='/resume')return lazyMount(()=>preloadRoute(path),m=>m.mountAbout(main,{textLink,fine,reduced}));
 else if(path==='/contacts')return lazyMount(()=>preloadRoute(path),m=>m.mountContacts(main,{reduced}));
 else if(path==='/projects/rap')return lazyMount(()=>preloadRoute(path),m=>m.mountRapCase(main,{reduced}));
 else if(/^\/projects\/(eva|museum|amkal|bonch)$/.test(path))return lazyMount(()=>preloadRoute(path),m=>m.mountProjectCase(main,path.split('/').pop(),{reduced}));
 else if(path==='/archive'){main.innerHTML=`<section class="inside"><div class="page-intro empty"><h1>Архив</h1><p>Раздел дополнительных работ<br>пока пуст.</p><a class="back" href="/works">↖ К работам</a></div></section>`}
 else{const p=projects.find(p=>path==='/projects/'+p.id);if(!p){history.replaceState({},'', '/');return gallery()}main.innerHTML=`<article class="inside"><div class="project-hero"><img src="${asset(p.id)}" alt="${p.title}"></div><div class="project-copy"><h1>${p.title}</h1><p>${p.description}</p><p class="pending">Полный кейс будет добавлен.</p><a class="back" href="/works">↖ Все работы</a><br>${back}</div></article>`}
 const el=$('.inside');const wheel=e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();el.scrollLeft+=e.deltaY*(e.deltaMode===1?18:1)}};el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);
}
// One hint per page visit, shared by direct loads and client-side navigation.
function scrollHint(){
 const hint=document.createElement('div');hint.className='scroll-note';hint.innerHTML='Листайте <span aria-hidden="true">↔</span>';document.body.append(hint);
 let start=null,hidden=false;
 const listeners=[];
 function on(target,type,handler,options){target.addEventListener(type,handler,options);listeners.push(()=>target.removeEventListener(type,handler,options));}
 function detach(){listeners.splice(0).forEach(remove=>remove());}
 function hide(){if(hidden)return;hidden=true;hint.classList.add('gone');detach();}
 on(main,'wheel',e=>{if(!e.ctrlKey&&Math.abs(e.deltaX)+Math.abs(e.deltaY)>1)hide();},{passive:true,capture:true});
 on(main,'scroll',e=>{if(e.target.scrollLeft>1||e.target.scrollTop>1)hide();},{passive:true,capture:true});
 on(main,'pointerdown',e=>{if(e.button===0)start={id:e.pointerId,x:e.clientX,y:e.clientY};},{passive:true});
 on(window,'pointermove',e=>{if(start&&e.pointerId===start.id&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>12)hide();},{passive:true});
 on(window,'pointerup',()=>{start=null;},{passive:true});
 on(window,'pointercancel',()=>{start=null;},{passive:true});
 on(window,'keydown',e=>{if(!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.target.closest('input,textarea,select,[contenteditable="true"]')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))hide();});
 return()=>{detach();hint.remove();};
}
function render(path){cleanup();const disposePage=path==='/'?gallery():inside(path),disposeHint=scrollHint();cleanup=()=>{disposeHint();disposePage?.();};document.querySelectorAll('header nav a').forEach(a=>{if(a.pathname===path)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});updatePageMetadata(path);}
async function go(path,push=true){path=path.replace(/\/+$/,'')||'/';const token=++navigationToken,overlay=$('#transition');overlay.classList.remove('exit');overlay.classList.add('cover');await Promise.all([new Promise(r=>setTimeout(r,reduced?0:360)),preloadRoute(path).catch(()=>{})]);if(token!==navigationToken)return;if(push)history.pushState({},'',path);render(path);overlay.classList.remove('cover');overlay.classList.add('exit');setTimeout(()=>{if(token===navigationToken){overlay.style.transition='none';overlay.classList.remove('exit');void overlay.offsetWidth;overlay.style.transition=''}},450)}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(e.defaultPrevented||!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.origin!==location.origin)return;if(a.pathname==='/'&&location.pathname==='/'&&a.classList.contains('logo')){e.preventDefault();location.reload();return}e.preventDefault();go(a.pathname)});window.addEventListener('popstate',()=>go(location.pathname,false));render(location.pathname.replace(/\/+$/,'')||'/');

