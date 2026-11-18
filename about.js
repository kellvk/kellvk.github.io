import {startNameMaterial} from '/name-light.js?v=13';
const sections=['Обо мне','Образование','Опыт','Клиенты','Навыки'];
const jobs=[
 ['Рекламное агентство «МЕДИАКОТ»','Графический дизайнер','2021–2026','Визуальное наполнение Telegram и VK-каналов.\nОтчётные презентации и коммерческие материалы для клиентов.'],
 ['Коммерческие проекты','Графический дизайнер','2021–н. в.','Проекты в сферах культуры, спорта, медицины,\nсобытий и коммерческих коммуникаций.'],
 ['События и организация','Рук. отдела дизайна / Координатор / Сценарист','2020–н. в.','Сценарии, организация и визуальное оформление квестов,\nквизов, культурных мероприятий, выставок и видеопроектов.'],
 ['AI-продакшн','Концепт-дизайнер / Продюсер','2024–н. в.','AI-фотосессии, промокампании,\nперсонажи, промптинг и концепт-поиск.']
];
const abilities=[
 ['Арт-дирекшн и дизайн',['Визуальные концепции','Айдентика','Презентации','Рекламные коммуникации','Печать и мерч']],
 ['События и продакшн',['Концепции мероприятий','Видеопродакшн','Организация и продюсирование','Сценарии']],
 ['AI-продакшн',['AI-кампании и съёмки','Генеративное видео','Консистентные персонажи','Промптинг']]
];
const clients=[['gens','GEN.S Suborbia'],['eva','Eva Catering'],['cxm','ЦХМ'],['md','MD Clinic'],['lube','ЛЮБЭ'],['gis','Газинформсервис'],['vad','VAD Car Rental'],['museum','Музей советских игровых автоматов']];
const bind=s=>s.replace(/(?<!\S)(и|в|во|с|со|к|о|на|по|из|для|от|до|не)[ \n]+(?=\S)/gi,'$1\u00a0');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const rocket=`<svg class="cv-rocket" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g class="cv-rocket-body"><path class="cv-rocket-line" d="M33 67C31 46 48 18 86 12C86 49 62 68 44 70Z M68 17L82 31 M35 44L23 43L11 57L31 62 M56 67L56 80L41 92L36 72 M33 58L46 45"/><circle class="cv-rocket-line" cx="59" cy="39" r="10"/><path class="cv-rocket-accent" d="M33 58L46 45 M46 25C55 18 68 14 86 12 M59 29A10 10 0 0 1 69 39" pathLength="100"/><path class="cv-rocket-flame" d="M29 71C19 69 15 77 12 89C24 86 32 82 29 71Z"/><path class="cv-rocket-spark" d="M20 76L7 91 M29 80L24 87"/></g></svg>`;
const contactLinks={'Telegram':'https://t.me/kellv_k','ВКонтакте':'https://vk.ru/alexanderkostikov','Почта':'mailto:a.kostikovcreate@yandex.ru'};
function contactButton(label){return `<a href="${contactLinks[label]}" ${label==='Почта'?'':'target="_blank" rel="noopener noreferrer"'} class="nav-link cv-contact-button"><span class="arrow" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 13 13 3M3 3h10v10"/></svg></span><span class="label"><span>${label}</span><span aria-hidden="true">${label}</span></span></a>`;}
export function mountAbout(main,{fine,reduced}){
 main.innerHTML=`<div class="cv-page"><div class="cv-scroll" tabindex="0" role="region" aria-label="Обо мне — горизонтальная страница"><div class="cv-track">
 <section class="cv-panel cv-intro" aria-label="Александр Костиков"><div class="cv-hero-art"><h1 class="sr-only">Александр Костиков</h1><div class="cv-name-art" aria-hidden="true"><div class="cv-name-word cv-name-first"></div><div class="cv-name-word cv-name-last"></div></div><img class="cv-hero-portrait" src="/assets/alexander-red-seated.webp" alt="Александр Костиков в красном костюме" draggable="false"></div><p class="cv-intro-copy">Создаю визуальные концепции, <br>придумываю события<span class="cv-intro-third"> и работаю с AI-продакшном.</span></p></section>
 <section class="cv-panel cv-education" aria-labelledby="cv-edu-title"><div class="cv-layout"><h2 id="cv-edu-title" class="cv-section-title cv-reveal">Образование</h2><div class="cv-edu-list"><article class="cv-edu-row cv-reveal"><div class="cv-edu-meta"><time>2024–2026</time><span>магистратура</span></div><p>НИУ ВШЭ, Санкт-Петербург</p><h3>Арт-дирекшн культурных <br>институций</h3></article><article class="cv-edu-row cv-reveal"><div class="cv-edu-meta"><time>2020–2024</time><span>бакалавриат</span></div><p>СПбГУТ им. проф. М. А. Бонч-Бруевича</p><h3>Реклама и связи <br>с общественностью</h3></article></div></div></section>
 <section class="cv-panel cv-experience" aria-labelledby="cv-exp-title"><div class="cv-layout"><h2 id="cv-exp-title" class="cv-section-title cv-reveal">Опыт</h2><div class="cv-jobs">${jobs.map(([title,role,date,description])=>`<article class="cv-job cv-reveal"><div class="cv-job-top"><h3>${title}</h3><p class="cv-job-role">${role}</p><time>${date}</time></div><p class="cv-job-description">${description}</p></article>`).join('')}</div></div></section>
 <section class="cv-panel cv-clients" aria-labelledby="cv-clients-title"><h2 id="cv-clients-title" class="cv-section-title cv-reveal">Клиенты</h2><div class="cv-client-window"><div class="cv-client-film">${[0,1].map(copy=>`<div class="cv-client-copy" ${copy?'aria-hidden="true"':''}>${clients.map(([id,name])=>`<div class="cv-client-logo"><img src="/assets/client-${id}.png" alt="${copy?'':name}"></div>`).join('')}</div>`).join('')}</div></div></section>
 <section class="cv-panel cv-skills" aria-labelledby="cv-skills-title"><div class="cv-layout"><h2 id="cv-skills-title" class="cv-section-title cv-reveal">Навыки</h2><div class="cv-skills-body"><div class="cv-skill-columns">${abilities.map(([title,items])=>`<article class="cv-reveal"><h3>${title}</h3><ul>${items.map(item=>`<li${/^(Рекламные|Организация|Консистентные)/.test(item)?' class="cv-mobile-newline"':''}>${item}</li>`).join('')}</ul></article>`).join('')}</div><div class="cv-tools cv-reveal"><h3>Инструменты</h3><ul>${['Figma','Adobe CC','Blender','ChatGPT','Higgsfield (Kling & other)'].map(name=>`<li>${name}</li>`).join('')}</ul></div></div></div></section>

 </div></div><nav class="cv-section-nav" aria-label="Разделы обо мне">${sections.map((label,i)=>`<button type="button" data-cv-screen="${i}" aria-label="${label}" ${i===0?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span><span>${label}</span></button>`).join('')}</nav><div class="cv-counter" aria-hidden="true"><span>01</span><span>/05</span></div></div>`;
 const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode())node.nodeValue=bind(node.nodeValue);
 const page=main.querySelector('.cv-page'),scroll=main.querySelector('.cv-scroll'),panels=[...main.querySelectorAll('.cv-panel')],nav=[...main.querySelectorAll('[data-cv-screen]')],counter=main.querySelector('.cv-counter>span'),reveals=panels.map(p=>[...p.querySelectorAll('.cv-reveal')]);
 let target=0,tween=false,active=-1,frameId=0,dead=false,last=performance.now(),lastFraction=-100;
 const stopName=startNameMaterial(main.querySelector('.cv-name-art'),{fine,reduced});
 function wake(){if(!dead&&!document.hidden&&!frameId){last=performance.now();frameId=requestAnimationFrame(frame)}}
 function visibility(){page.classList.toggle('is-paused',document.hidden);if(document.hidden){cancelAnimationFrame(frameId);frameId=0}else wake()}
 function to(index){wake();target=clamp(index,0,4)*scroll.clientWidth;tween=true;}
 function wheel(e){wake();if(e.ctrlKey)return;e.preventDefault();if(!tween)target=scroll.scrollLeft;const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;target=clamp(target+delta*(e.deltaMode===1?18:e.deltaMode===2?scroll.clientWidth:1),0,scroll.scrollWidth-scroll.clientWidth);tween=true;}
 function down(e){if(e.pointerType==='touch'||e.pointerType==='pen')tween=false;}
 function key(e){if(e.altKey||e.metaKey||e.ctrlKey)return;const index=Math.round(scroll.scrollLeft/scroll.clientWidth);if(['ArrowRight','ArrowDown','PageDown'].includes(e.key)){e.preventDefault();to(index+1)}else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();to(index-1)}else if(e.key==='Home'){e.preventDefault();to(0)}else if(e.key==='End'){e.preventDefault();to(4)}}
 function resize(){wake();target=Math.max(0,active)*scroll.clientWidth;scroll.scrollLeft=target;tween=false;}
 function frame(t){frameId=0;if(dead||document.hidden)return;const dt=clamp((t-last)/16.667,.1,3);last=t;
  if(tween){const gap=target-scroll.scrollLeft;if(Math.abs(gap)<2||reduced){scroll.scrollLeft=target;tween=false;}else{scroll.scrollLeft+=gap*(1-Math.pow(.89,dt));}}
  const fraction=scroll.scrollLeft/scroll.clientWidth,index=clamp(Math.round(fraction),0,4);
  if(index!==active){active=index;nav.forEach((button,i)=>i===index?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'));counter.textContent=String(index+1).padStart(2,'0');page.dataset.screen=index;}
  if(fraction!==lastFraction){lastFraction=fraction;reveals.forEach((items,i)=>{const phase=1-Math.abs(i-fraction)*1.15;items.forEach((el,j)=>{const v=reduced?1:clamp((phase-j*.055)/.72),ease=v*v*(3-2*v),offset=Math.round((1-ease)*24);el.style.opacity=ease.toFixed(3);el.style.transform=offset?`translateY(${offset}px)`:'none';});});}
  if(tween)frameId=requestAnimationFrame(frame);
 }
 const handlers=nav.map((button,i)=>{const handler=()=>to(i);button.addEventListener('click',handler);return handler;});
 scroll.addEventListener('wheel',wheel,{passive:false});scroll.addEventListener('pointerdown',down,{passive:true});window.addEventListener('keydown',key);window.addEventListener('resize',resize);scroll.addEventListener('scroll',wake,{passive:true});document.addEventListener('visibilitychange',visibility);
 void page.offsetHeight;requestAnimationFrame(()=>{if(!dead)page.classList.add('cv-ready')});wake();
 return()=>{dead=true;cancelAnimationFrame(frameId);stopName();scroll.removeEventListener('wheel',wheel);scroll.removeEventListener('pointerdown',down);window.removeEventListener('keydown',key);window.removeEventListener('resize',resize);scroll.removeEventListener('scroll',wake);document.removeEventListener('visibilitychange',visibility);nav.forEach((button,i)=>button.removeEventListener('click',handlers[i]));};
}

export function mountContacts(main,{reduced}){
 main.innerHTML=`<div class="cv-page contacts-page" data-screen="5"><section class="cv-panel cv-contacts" aria-labelledby="cv-contact-title"><div class="cv-contact-content"><div class="cv-contact-heading"><h1 id="cv-contact-title">Остаёмся на связи</h1>${rocket}</div><div class="cv-contact-actions">${['Telegram','ВКонтакте','Почта'].map(contactButton).join('')}</div></div></section></div>`;
 const page=main.querySelector('.contacts-page');function visibility(){page.classList.toggle('is-paused',document.hidden);}document.addEventListener('visibilitychange',visibility);visibility();
 return()=>document.removeEventListener('visibilitychange',visibility);
}
