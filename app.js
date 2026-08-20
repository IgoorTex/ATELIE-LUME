
const GOOGLE_SHEETS_WEBHOOK_URL = ""; // adicionar depois a URL /exec do Google Apps Script

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;
const intro = document.getElementById('intro');
if (reduceMotion) intro?.remove();
else setTimeout(()=>intro?.classList.add('hide'), 3000);

const header = document.getElementById('siteHeader');
const progress = document.getElementById('progress');
const updateScroll = ()=>{
  header?.classList.toggle('scrolled', scrollY > 28);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = (max > 0 ? (scrollY/max)*100 : 0) + '%';
};
addEventListener('scroll', updateScroll, {passive:true}); updateScroll();

document.getElementById('year').textContent = new Date().getFullYear();

const menuToggle=document.getElementById('menuToggle');
const mobileMenu=document.getElementById('mobileMenu');
menuToggle?.addEventListener('click',()=>{
  const open=mobileMenu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobileMenu.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false');
}));

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target);}
  });
},{threshold:.1,rootMargin:'0px 0px -4% 0px'});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

if(!reduceMotion && finePointer){
  const glow=document.getElementById('cursorGlow');
  let mx=innerWidth/2,my=innerHeight/2,ticking=false;
  addEventListener('pointermove',e=>{
    mx=e.clientX;my=e.clientY;
    glow.style.left=mx+'px';glow.style.top=my+'px';
    if(!ticking){requestAnimationFrame(()=>{
      const dx=mx/innerWidth-.5, dy=my/innerHeight-.5;
      document.querySelectorAll('[data-parallax]').forEach(el=>{
        const speed=Number(el.dataset.parallax||.5);
        el.style.transform=`translate3d(${dx*20*speed}px,${dy*16*speed}px,0)`;
      });
      ticking=false;
    });ticking=true;}
  },{passive:true});

  document.querySelectorAll('.tilt').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(900px) rotateX(${-y*3.6}deg) rotateY(${x*3.6}deg) translateY(-3px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.07}px,${(e.clientY-r.top-r.height/2)*.07}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
}

document.querySelectorAll('.faq-item').forEach(item=>{
  const btn=item.querySelector('button');
  const open=()=>{item.classList.add('open');btn.setAttribute('aria-expanded','true')};
  const close=()=>{item.classList.remove('open');btn.setAttribute('aria-expanded','false')};
  btn.addEventListener('click',()=>item.classList.contains('open')?close():open());
  if(finePointer){item.addEventListener('mouseenter',open);item.addEventListener('mouseleave',close)}
});

const form=document.getElementById('contactForm');
const status=document.getElementById('formStatus');
let sending=false;
form?.addEventListener('submit',async e=>{
  e.preventDefault();if(sending)return;sending=true;
  const btn=form.querySelector('button[type="submit"]');
  const data=Object.fromEntries(new FormData(form));data.enviado_em=new Date().toISOString();
  btn.disabled=true;btn.textContent='Enviando...';status.textContent='';
  try{
    if(GOOGLE_SHEETS_WEBHOOK_URL){
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});
    }else await new Promise(r=>setTimeout(r,700));
    status.textContent='Recebemos suas informações. Em breve entraremos em contato.';
    form.reset();
  }catch{
    status.textContent='Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.';
  }finally{
    sending=false;btn.disabled=false;btn.innerHTML='Enviar meu projeto <span>↗</span>';
  }
});
