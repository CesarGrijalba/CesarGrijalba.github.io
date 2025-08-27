
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);


const nav = document.getElementById('nav');
const pic = document.getElementById('profilePic');
const dock = document.getElementById('avatarDock');
const wrap = document.getElementById('profileWrap');
const shadow = document.getElementById('shadowUnder');
const sections = [...document.querySelectorAll('[data-section]')];
const tabs = [...document.querySelectorAll('.tab')];
const tabIndicator = document.getElementById('tabIndicator');
const scrollbar = document.getElementById('scrollbar');

tabs.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.dataset.target;
    const el = document.querySelector(sel);
    if(!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - nav.offsetHeight + 1;
    window.scrollTo({ top:y, behavior:'smooth' });
  });
});


function setActiveTabById(id){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.target === id));
  moveIndicator();
}
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const id = '#'+entry.target.id;
      setActiveTabById(id);
      entry.target.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('show'));
    }
  });
}, { rootMargin:`-${nav.offsetHeight + 8}px 0px -55% 0px`, threshold:[0,.3,.6,1] });
sections.forEach(s => io.observe(s));

function moveIndicator(){
  const active = document.querySelector('.tab.active');
  if(!active || !tabIndicator) return;
  const tabsRect = document.getElementById('tabs').getBoundingClientRect();
  const r = active.getBoundingClientRect();
  const left = r.left - tabsRect.left;
  tabIndicator.style.width = `${r.width}px`;
  tabIndicator.style.transform = `translateX(${left}px)`;
}
window.addEventListener('resize', moveIndicator);


let start=null, end=null, scaleEnd=0.28, maxProgress=1;
let wrapOffset = {x:0, y:0};


function computeAnchors(){
    const wrapRect = wrap.getBoundingClientRect();
    const wrapOffset = { x: wrapRect.left + window.scrollX, y: wrapRect.top + window.scrollY };
  

    const startCenter = {
      x: wrapOffset.x + wrapRect.width * 0.50,   // antes 0.56
      y: wrapOffset.y + wrapRect.height * 0.40
    };
  
    const dockRect = dock.getBoundingClientRect();
    const dockCenter = {
      x: window.scrollX + dockRect.left + dockRect.width / 2,
      y: window.scrollY + dockRect.top  + dockRect.height / 2
    };
  

    start = { x: startCenter.x - wrapOffset.x, y: startCenter.y - wrapOffset.y };
    end   = { x: dockCenter.x   - wrapOffset.x, y: dockCenter.y   - wrapOffset.y };
  

    scaleEnd = (dockRect.width / pic.offsetWidth) * 1.12;
  
    const inicio = document.getElementById('inicio');
    const usable = inicio.offsetHeight - nav.offsetHeight - 150;
    maxProgress = Math.max(240, usable);
  }
  

  function placePicAtStart(){
    pic.style.left = '0px';
    pic.style.top  = '0px';
  
    const size = pic.offsetWidth;
    const shadowWidth = Math.max(280, Math.round(size * 1.05));
    shadow.style.width = `${shadowWidth}px`;
  

    const x = start?.x ?? 0;
    const y = start?.y ?? 0;
    pic.style.transform = `translate(${x - size/2}px, ${y - size/2}px)`;
    shadow.style.transform = `translate(${x - shadowWidth/2}px, ${y + size*0.34}px)`;
  }
  

function animatePic(forceP = null){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const p = forceP !== null ? forceP : clamp(window.scrollY / maxProgress, 0, 1);
  const size = pic.offsetWidth;

  const x = start.x + (end.x - start.x) * p;
  const y = start.y + (end.y - start.y) * p;
  const s = 1 + (scaleEnd - 1) * p;

  // Como la foto es absolute dentro del wrap, traducimos RELATIVO al wrap
  pic.style.transform = `translate(${x - size/2}px, ${y - size/2}px) scale(${s})`;

  const shadowWidth = Math.max(300, Math.round(size * 1.05));
  shadow.style.transform = `translate(${x - shadowWidth/2}px, ${y + size*0.34}px) scale(${clamp(1 - p*0.5, 0.6, 1)})`;
  shadow.style.opacity   = String(0.5 * (1 - p));
}


function updateScrollBar(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
  scrollbar.style.width = `${clamp(scrolled,0,1) * 100}%`;
}

function recalc(){
  computeAnchors();
  placePicAtStart();
  moveIndicator();
}

window.addEventListener('scroll', () => { animatePic(); updateScrollBar(); }, { passive:true });
window.addEventListener('resize', recalc);
window.addEventListener('orientationchange', recalc);

document.getElementById('year').textContent = new Date().getFullYear();

// Init
recalc();
setActiveTabById('#inicio');

