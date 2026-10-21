/* ================================================================
AL-DEWAN COFFEE — app.js
Commerce First — Experience Second — Decoration Last
Architecture (future-CMS ready):
  PRODUCTS[] = single source of truth (id/slug/name/weights/price/
  images/roast/blend/availability/featured). Swap with Supabase/
  Firebase/Shopify/Woo fetch later — same shape.
  CartStore = localStorage persistent (aldiwan_cart_v1)
  Orders = localStorage (aldiwan_orders_v1) — replace with API POST
Sections: data → loader → nav → reveal → webgl → tilt →
story → configurator → roast → grid → reviews → cart →
quickview → checkout → misc → cinematic lighting
================================================================ */
'use strict';

/* ---------- 1) PRODUCT DATA MODEL (CMS-ready) ---------- */
/* كل الأسعار لربع كيلو (250g). كل صنف له نوع: سادة / محوج (حسب المتوفر). */
const UNIT='ربع كيلو';const UNIT_G=250;
/* الأوزان المتاحة: السعر في الجدول لكل 250جم؛ الوزن يضاعف تلقائيًا (500جم=×2، 1كجم=×4 = عبوتين 500جم) */
const SIZES=[{k:'250',label:'250 جم',pack:'ربع كيلو',mult:1},{k:'500',label:'500 جم',pack:'نصف كيلو',mult:2},{k:'1000',label:'1 كجم',pack:'كيلو — عبوتان',mult:4}];
const sizeOf=si=>SIZES[si]||SIZES[0];
const priceOf=(p,vi,si)=>{const v=p.variants[vi]||p.variants[0];return v.price*sizeOf(si).mult;};
const lineOf=item=>{const p=PRODUCTS.find(x=>x.id===item.pid)||PRODUCTS[0];const v=p.variants[item.vi]||p.variants[0];const s=sizeOf(item.size);const unit=v.price*s.mult;return {p,v,s,unit,total:unit*item.qty};};
const SADA={k:'sada',label:'سادة'},MAHWAG={k:'mahwag',label:'محوج'};
const V=(s,m)=>[s!=null?{...SADA,price:s}:null,m!=null?{...MAHWAG,price:m}:null].filter(Boolean);
/** @typedef {{k:string,label:string,price:number}} Variant */
/** @typedef {{id:string,slug:string,name:string,nameEn:string,desc:string,roast:string,grind:string,variants:Variant[],img:string,badge?:string,featured?:boolean,available:boolean}} Product */
const PRODUCTS = [
  {id:'p01',slug:'diwan-sada',name:'الديوان السادة',nameEn:'AL-DEWAN PLAIN',desc:'خلطة الديوان الأساسية — طحنة تركي متوازنة ومرارة هادية.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p01.jpg',badge:'الأكثر طلبًا',featured:true,available:true,variants:V(180,210)},
  {id:'p02',slug:'diwan-medium',name:'الديوان وسط',nameEn:'AL-DEWAN MEDIUM',desc:'تحميص وسط متوازن — حلاوة وقوام ووشّ تركي غني.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p02.jpg',available:true,variants:V(180,210)},
  {id:'p03',slug:'diwan-dark',name:'الديوان غامق',nameEn:'AL-DEWAN DARK',desc:'تحميص غامق — شوكولاتة محمصة ومرارة عميقة لعشاق التقيل.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p03.jpg',available:true,variants:V(180,210)},
  {id:'p04',slug:'diwan-extra',name:'الديوان إكسترا',nameEn:'AL-DEWAN EXTRA',desc:'بناية أعلى وتحميصة أعمق — كافيين أوضح ووشّ أتقل.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p04.jpg',badge:'إصدار ملوكي',featured:true,available:true,variants:V(190,220)},
  {id:'p05',slug:'super',name:'سوبر',nameEn:'SUPER',desc:'توليفة قوية بسعر اقتصادي — ثابتة في الفنجان.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p05.jpg',available:true,variants:V(145,175)},
  {id:'p06',slug:'espresso',name:'إسبريسو',nameEn:'ESPRESSO',desc:'تحميص غامق مخصص للإسبريسو — كريما كثيفة وثبات عالي.',roast:'غامق',grind:'إسبريسو',img:'assets/products/p06.jpg',available:true,variants:V(200,null)},
  {id:'p07',slug:'brazilian',name:'برازيلي',nameEn:'BRAZILIAN',desc:'برازيلي ناعم — حلاوة وقوام متوسط ونهاية هادية.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p07.jpg',available:true,variants:V(170,200)},
  {id:'p08',slug:'royal',name:'ملوكي',nameEn:'ROYAL',desc:'خلطة ملوكية فاخرة — توازن غني وريحة فخمة.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p08.jpg',badge:'فاخر',available:true,variants:V(180,210)},
  {id:'p09',slug:'indonesian-light',name:'إندونيسي فاتح',nameEn:'INDONESIAN LIGHT',desc:'إندونيسي فاتح — حموضة زاهية ونكهات عشبية.',roast:'فاتح',grind:'تركي ناعم',img:'assets/products/p09.jpg',available:true,variants:V(150,180)},
  {id:'p10',slug:'mexican',name:'مكسيكي',nameEn:'MEXICAN',desc:'مكسيكي متوازن — حلاوة كراميل لطيفة.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p10.jpg',available:true,variants:V(165,195)},
  {id:'p11',slug:'abyssinian',name:'حبشي',nameEn:'ABYSSINIAN',desc:'حبشي أصيل — قوام غني ونكهات دافئة.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p11.jpg',available:true,variants:V(160,190)},
  {id:'p12',slug:'yemeni',name:'يمني',nameEn:'YEMENI',desc:'يمني فاخر — نكهة معتقة وعمق مميز.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p12.jpg',badge:'فاخر',available:true,variants:V(270,300)},
  {id:'p13',slug:'colombian',name:'كولومبي',nameEn:'COLOMBIAN',desc:'كولومبي منتقى — حلاوة فاكهية وتوازن راقي.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p13.jpg',available:true,variants:V(235,265)},
  {id:'p14',slug:'guatemala',name:'غواتيمالا',nameEn:'GUATEMALA',desc:'غواتيمالا — شوكولاتة وبهارات خفيفة.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p14.jpg',available:true,variants:V(165,195)},
  {id:'p15',slug:'costa-rica',name:'كوستاريكا',nameEn:'COSTA RICA',desc:'كوستاريكا — نقاء وحلاوة عسلية.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p15.jpg',available:true,variants:V(165,195)},
  {id:'p16',slug:'tahmees',name:'قهوة التحميص',nameEn:'AL TAHMEES',desc:'خلطة التحميص الخاصة — قهوة غنية بمذاق مميز.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p16.jpg',available:true,variants:V(135,null)},
  {id:'p17',slug:'arabic',name:'بن عربي',nameEn:'ARABIC',desc:'بن عربي بالتحويجة — هيل ومستكة وريحة شرقية.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p17.jpg',available:true,variants:V(null,105)},
  {id:'p18',slug:'french-flavored',name:'فرنساوي نكهات',nameEn:'FRENCH FLAVORED',desc:'فرنساوي بنكهات — تحميص خاص ومذاق مميز.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p18.jpg',available:true,variants:V(135,null)},
  {id:'p19',slug:'french',name:'فرنساوي',nameEn:'FRENCH',desc:'فرنساوي كلاسيك — تحميص غامق ومذاق غني.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p19.jpg',available:true,variants:V(135,null)},
  {id:'p20',slug:'french-hazelnut',name:'فرنساوي بندق قطع',nameEn:'FRENCH HAZELNUT',desc:'فرنساوي مع قطع البندق — نكهة مقرمشة مميزة.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p20.jpg',available:true,variants:V(135,null)},
  {id:'p21',slug:'espresso-lavada',name:'إسبريسو لافادا',nameEn:'ESPRESSO LAVADA',desc:'إسبريسو فاخر — كريما غنية ونكهة قوية.',roast:'غامق',grind:'إسبريسو',img:'assets/products/p21.jpg',available:true,variants:V(325,null)},
  {id:'p22',slug:'oriental-blend',name:'توليفة شرقي',nameEn:'ORIENTAL BLEND',desc:'توليفة شرقي — بن عربي + تحويجة غنية.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p22.jpg',available:true,variants:V(190,220)},
  {id:'p23',slug:'indian-robusta',name:'هندي روبوستا',nameEn:'INDIAN ROBUSTA',desc:'هندي روبوستا — قوام تقيل وكافيين عالي.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p23.jpg',available:true,variants:V(145,175)},
];
/* ---------- Reviews: REAL data only (لا نخترع تقييمات). المالك يضيف data/reviews.json ---------- */
const GOOGLE_MAPS_URL='https://maps.app.goo.gl/RJMqQRqKqthicAP49';
let REVIEWS=[];
async function loadReviews(){try{const r=await fetch('data/reviews.json',{cache:'no-store'});const d=await r.json();
 const arr=Array.isArray(d)?d:(Array.isArray(d.reviews)?d.reviews:[]);
 REVIEWS=arr.filter(x=>x&&x.text&&x.name).map(x=>({name:x.name,text:x.text,stars:+x.stars||+x.rating||5,tag:x.tag||'Google',when:x.when||x.date||''}));
}catch(e){}renderReviews();}
function injectReviewSchema(avg){if(!REVIEWS.length)return;
 const data={"@context":"https://schema.org","@type":"LocalBusiness","name":"Al-Dewan Coffee — بُن الديوان","aggregateRating":{"@type":"AggregateRating","ratingValue":avg,"reviewCount":REVIEWS.length},"review":REVIEWS.slice(0,20).map(r=>({"@type":"Review","author":{"@type":"Person","name":r.name},"reviewRating":{"@type":"Rating","ratingValue":r.stars},"reviewBody":r.text}))};
 let s=document.getElementById('revSchema');if(!s){s=document.createElement('script');s.type='application/ld+json';s.id='revSchema';document.head.appendChild(s);}s.textContent=JSON.stringify(data);}

const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const EGP=n=>`${n} EGP`;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=matchMedia('(max-width: 640px)').matches;

/* ---------- 0) SVG ICON SYSTEM — يستبدل الإيموجي بأيقونات نظيفة ---------- */
const ICONS={
 cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.1l2.3 12.1a1.6 1.6 0 0 0 1.6 1.3h8.4a1.6 1.6 0 0 0 1.6-1.3L20.5 7H6.2"/></svg>',
 menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 location:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.4V12l3.3 2"/></svg>',
 phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.4 3.6 9 4.2l1.3 3.9-1.9 1.5a12 12 0 0 0 5.4 5.4l1.5-1.9 3.9 1.3.6 2.6c.1.9-.6 1.7-1.5 1.6A16 16 0 0 1 4.8 5.1c-.1-.9.7-1.6 1.6-1.5Z"/></svg>',
 cash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
 instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>',
  facebook:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5h2.5V5.5H14c-2 0-3.5 1.5-3.5 3.5v2H8v3h2.5v6.5h3V15H16l.8-3h-3.3V9c0-.3.2-.5.5-.5Z"/></svg>',
  bean:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="8" ry="6.2" transform="rotate(45 12 12)"/><path d="M7.2 16.8c2.2-2.2 2.2-5.4 0-7.6M16.8 7.2c-2.2 2.2-2.2 5.4 0 7.6"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6L12 16.4l-5.1 2.6 1-5.6-4-3.9 5.6-.8Z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
};
function mountIcons(scope){scope=scope||document;$$('[data-ico]',scope).forEach(el=>{const s=ICONS[el.dataset.ico];if(s&&!el.dataset.done){el.innerHTML=s;el.dataset.done='1';}});}
window.mountIcons=mountIcons;mountIcons();

/* slot image helper: drop a <picture> (WebP + JPEG fallback) into a .img-ph box;
   if the file is missing the <img> errors and the placeholder stays visible. */
window.onImgErr=function(im){try{const pic=im.closest('picture');if(pic)pic.remove();else im.remove();}catch(e){}};
function setPhImg(el,src,label,desc){
 if(!el)return;
 el.dataset.slot=label;
 const sp=el.querySelector('span');if(sp)sp.textContent=label;
 const sm=el.querySelector('small');if(sm)sm.textContent=desc||'';
 if(!src){const old=el.querySelector(':scope>picture');if(old)old.remove();el.classList.add('noimg');return;}
 el.classList.remove('noimg');
 let pic=el.querySelector(':scope>picture');
 if(!pic){pic=document.createElement('picture');
  const im=document.createElement('img');im.loading='lazy';im.alt='';
  pic.appendChild(im);el.insertBefore(pic,el.firstChild);}
 const im=pic.querySelector('img');
 const so=pic.querySelector('source[type="image/webp"]');
 if(/\.(jpe?g|png)$/i.test(src)){
  const webp=src.replace(/\.(jpe?g|png)$/i,'.webp');
  let s=so;if(!s){s=document.createElement('source');s.type='image/webp';pic.insertBefore(s,im);}
  if(s.getAttribute('srcset')!==webp)s.setAttribute('srcset',webp);
 }else if(so){so.remove();}
 im.alt=desc||'';im.onerror=function(){window.onImgErr(this);};
 if(im.getAttribute('src')!==src){im.dataset.t='';im.setAttribute('src',src);}
}
/* صور المكان + القصة المحدّثة:
   1 فنجان الهيرو | 2-6 مشاهد القصة (أصل→تحميص→خلطة→فنجان→منتج) | 11-15 المجلس | 16-20 حكاية الديوان | 21 بانر الباند */
const SLOT_IMGS={
 1:'assets/hero-cup.jpg',
 2:'assets/story/s1.jpg',3:'assets/story/s2.jpg',4:'assets/story/s3.jpg',5:'assets/story/s4.jpg',6:'assets/story/s5.jpg',
 11:'assets/gallery/g09.jpg',12:'assets/gallery/g10.jpg',13:'assets/gallery/g11.jpg',
 14:'assets/gallery/g14.jpg',15:'assets/gallery/g08.jpg',
 16:'assets/gallery/g05.jpg',17:'assets/gallery/g02.jpg',18:'assets/gallery/g07.jpg',
 19:'assets/gallery/g13.jpg',20:'assets/gallery/g06.jpg',
 21:'assets/gallery/g01.jpg'};
function bindSlotImgs(){$$('.img-ph[data-slot]').forEach(el=>{const src=SLOT_IMGS[el.dataset.slot];if(src){const desc=el.querySelector('small')?.textContent||'';setPhImg(el,src,el.dataset.slot,desc);}});}
bindSlotImgs();

/* ---------- 2) LOADER (cinematic sequence — real progress, never traps) ---------- */
(()=>{const fill=$('#loadfill'),txt=$('#loadtxt'),l=$('#loader');if(!l)return;
if(reduced){l.classList.add('done');return;}
const steps=['نُحمّص الحكاية...','حبات البن تتجمع...','العبوة تظهر...','أهلًا بيك في الديوان ✦'];
let p=0,finished=false,loaded=document.readyState==='complete';
addEventListener('load',()=>{loaded=true;},{once:true});
setTimeout(()=>{loaded=true;},5000);                       // hard cap: intro can never trap the visitor
const iv=setInterval(()=>{
 const target=loaded?100:88;                               // don't claim 100% before the page is ready
 p=Math.min(target,p+(target-p)*0.22+1.5);
 fill.style.width=p+'%';
 txt.textContent=steps[Math.min(3,Math.floor(p/26))];
 if(p>=99.5&&!finished){finished=true;clearInterval(iv);
  setTimeout(()=>{l.classList.add('done');heroIntro();},420);}
},110);})();

function heroIntro(){ if(reduced||!window.gsap)return;
$$('.hero-copy .rv,.hero-visual').forEach(el=>{el.style.transition='none';el.classList.add('in');});
gsap.from('.hero-copy .rv',{y:50,opacity:0,duration:1,stagger:.12,ease:'power3.out'});
const __ps=$('#packStage');if(__ps)gsap.from(__ps,{y:80,scale:.9,opacity:0,duration:1.4,ease:'power3.out',delay:.3});}

/* ---------- 3) NAV / SMOOTH / PROGRESS / CURSOR / MAGNETIC ---------- */
const header=$('#header'),scrim=$('#scrim');
const openSheet=id=>{$(id).classList.add('open');scrim.classList.add('show');document.body.style.overflow='hidden';};
const closeAll=()=>{$$('.sheet.open').forEach(s=>s.classList.remove('open'));$$('.modal.show').forEach(m=>m.classList.remove('show'));scrim.classList.remove('show');document.body.style.overflow='';};
$('#openMenu').onclick=()=>openSheet('#menuSheet');
$('#openCart').onclick=()=>openSheet('#cartSheet');
$('#mCart').onclick=()=>openSheet('#cartSheet');
const __oc=$('#orderCart');if(__oc)__oc.onclick=()=>openSheet('#cartSheet');
scrim.onclick=closeAll; $$('[data-close]').forEach(b=>b.onclick=closeAll);
addEventListener('keydown',e=>{if(e.key==='Escape')closeAll();});
$$('#menuSheet a').forEach(a=>a.onclick=closeAll);

addEventListener('scroll',()=>{
 const h=header,y=scrollY;
 h.classList.toggle('solid',y>40);h.classList.toggle('floating',y<=40);
 const d=document.documentElement,p=y/(d.scrollHeight-innerHeight)*100;
 $('#progress').style.width=p+'%';
},{passive:true});

/* share-ticker: أهدئ الشريط المتحرك أثناء السكرول الفعلي */
(()=>{let t=null;addEventListener('scroll',()=>{document.body.classList.add('is-scrolling');
 clearTimeout(t);t=setTimeout(()=>document.body.classList.remove('is-scrolling'),200);},{passive:true});})();

/* Lenis smooth (local vendor + GSAP ticker sync + anchor glide) */
try{if(!reduced&&window.Lenis){const lenis=new Lenis({smoothWheel:true,lerp:.09});window.__lenis=lenis;
if(window.gsap&&window.ScrollTrigger){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
else{const raf=t=>{lenis.raf(t);requestAnimationFrame(raf);};requestAnimationFrame(raf);}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{let t=null;try{t=$(a.getAttribute('href'));}catch(err){t=null;}
if(!t||!t.scrollIntoView)return;e.preventDefault();closeAll();
if(window.__lenis)window.__lenis.scrollTo(t,{offset:-80,duration:1.4});else t.scrollIntoView({behavior:'smooth'});}));}}catch(e){}

/* cursor + magnetic */
if(matchMedia('(hover:hover)').matches&&!reduced){
 const c=$('#cursor');addEventListener('mousemove',e=>{c.style.opacity=1;
 c.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;});
 $$('.magnetic').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();
 b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.18}px)`;});
 b.addEventListener('mouseleave',()=>b.style.transform='');});
}

/* reveal on scroll */
(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));})();

/* ---------- 4) HERO WEBGL — gold dust + floating beans (lightweight) ---------- */
(()=>{
 const cv=$('#webgl-hero');if(!cv||reduced||!window.THREE)return;
 try{
 const renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
 const scene=new THREE.Scene();
 const cam=new THREE.PerspectiveCamera(55,1,0.1,100);cam.position.set(0,0,9);
 scene.fog=new THREE.FogExp2(0x0e0805,0.035);
 const Mouse={x:0,y:0};addEventListener('mousemove',e=>{Mouse.x=(e.clientX/innerWidth-.5);Mouse.y=(e.clientY/innerHeight-.5);});
 function resize(){
  renderer.setSize(innerWidth,innerHeight,false);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.2:1.8));
  cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
 resize();addEventListener('resize',resize);
 /* gold particles */
 const N=isMobile?350:900,pos=new Float32Array(N*3);
 for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*22;pos[i*3+1]=(Math.random()-.5)*14;pos[i*3+2]=(Math.random()-.5)*10;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const m=new THREE.PointsMaterial({color:0xd9b877,size:.045,transparent:true,opacity:.85,depthWrite:false});
 scene.add(new THREE.Points(g,m));
 /* floating beans = scaled spheres, cheap instanced */
 const beanGeo=new THREE.SphereGeometry(.16,10,8);beanGeo.scale(1,.68,.55);
 const beanMat=new THREE.MeshStandardMaterial({color:0x4a2c14,roughness:.55,metalness:.25});
 const beans=new THREE.InstancedMesh(beanGeo,beanMat,isMobile?14:26);
 const dummy=new THREE.Object3D(),data=[];
 for(let i=0;i<beans.count;i++){data.push({x:(Math.random()-.5)*14,y:(Math.random()-.5)*8,z:(Math.random()-.5)*5-1,
  rx:Math.random()*6,ry:Math.random()*6,s:.7+Math.random()*.9});}
 scene.add(beans);
 /* ---- steam shader points (custom GLSL) ---- */
 const SN=isMobile?22:54;
 const spos=new Float32Array(SN*3),seeds=new Float32Array(SN);
 for(let i=0;i<SN;i++){spos[i*3]=(Math.random()-.5)*7;spos[i*3+1]=Math.random()*9-4;spos[i*3+2]=-1-Math.random()*3;seeds[i]=Math.random();}
 const steamGeo=new THREE.BufferGeometry();
 steamGeo.setAttribute('position',new THREE.BufferAttribute(spos,3));
 steamGeo.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
 const steamU={uT:{value:0},uOp:{value:.5}};
 const steamMat=new THREE.ShaderMaterial({uniforms:steamU,transparent:true,depthWrite:false,
  vertexShader:`attribute float aSeed;uniform float uT;varying float vA;
   void main(){vec3 p=position;float sp=.10+aSeed*.16;
   float y=-4.0+mod(p.y+4.0+uT*sp*4.0,9.0);
   float sway=sin(uT*(.5+aSeed)+aSeed*20.0)*(.25+(y+4.0)*.14);
   vec3 np=vec3(p.x+sway,y,p.z);
   vA=smoothstep(-4.0,-2.2,y)*(1.0-smoothstep(2.2,5.0,y));
   vec4 mv=modelViewMatrix*vec4(np,1.0);
   gl_PointSize=(50.0+aSeed*90.0)*(1.0/-mv.z);
   gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying float vA;uniform float uOp;
   void main(){vec2 uv=gl_PointCoord-0.5;float d=length(uv);
   float a=smoothstep(0.5,0.06,d)*vA*uOp;
   gl_FragColor=vec4(0.96,0.93,0.84,a);}`});
 scene.add(new THREE.Points(steamGeo,steamMat));
 /* ---- coffee swirl shader (liquid crema disc) ---- */
 const swirlU={uT:{value:0},uFade:{value:1}};
 const swirlMat=new THREE.ShaderMaterial({uniforms:swirlU,transparent:true,depthWrite:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`uniform float uT;uniform float uFade;varying vec2 vUv;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
   return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
   void main(){vec2 uv=vUv-0.5;float r=length(uv)*2.0;
   float ang=atan(uv.y,uv.x)+uT*0.12+(1.0-r)*1.7;
   vec2 suv=vec2(cos(ang),sin(ang))*r;
   float n=noise(suv*3.0)*0.6+noise(suv*6.0+uT*0.04)*0.4;
   float crema=smoothstep(0.34,0.76,n)*smoothstep(1.0,0.15,r);
   vec3 col=mix(vec3(0.09,0.05,0.025),vec3(0.86,0.66,0.37),crema);
   float edge=smoothstep(1.0,0.5,r);
   gl_FragColor=vec4(col,edge*(0.32+0.42*crema)*uFade);}`});
 const swirl=new THREE.Mesh(new THREE.PlaneGeometry(9,9),swirlMat);
 swirl.position.set(0,0.4,-3.5);scene.add(swirl);
 /* ---- bloom glow sprites (fake postFX) ---- */
 function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;
  const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,232,175,1)');g.addColorStop(.4,'rgba(220,169,94,.45)');g.addColorStop(1,'rgba(220,169,94,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
 const glowT=glowTex();
 function mkGlow(color,s,x,y,z,op){const mt=new THREE.SpriteMaterial({map:glowT,color:color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false});
  const sp=new THREE.Sprite(mt);sp.scale.set(s,s,1);sp.position.set(x,y,z);scene.add(sp);return mt;}
 const glowA=mkGlow(0xffd98a,5.5,4,3,-2,.45),glowB=mkGlow(0xe0aa5e,7.5,-5,-2,-3,.3);
 /* ---- scroll-driven camera rail ---- */
 const RAIL=[
  {p:0,cam:[0,0,9.2],look:[0,0,0]},
  {p:.28,cam:[1.7,.5,7.6],look:[0,.2,0]},
  {p:.55,cam:[-1.5,1.1,7.0],look:[0,.4,0]},
  {p:.8,cam:[1.0,1.7,7.9],look:[0,.6,0]},
  {p:1,cam:[0,2.3,9.2],look:[0,.9,0]}];
 const lookV=new THREE.Vector3();
 function railAt(p,out){let a=RAIL[0],b=RAIL[RAIL.length-1];
  for(let i=0;i<RAIL.length-1;i++){if(p>=RAIL[i].p&&p<=RAIL[i+1].p){a=RAIL[i];b=RAIL[i+1];break;}}
  const f=(p-a.p)/Math.max(.0001,b.p-a.p);
  for(let k=0;k<3;k++){out.cam[k]=a.cam[k]+(b.cam[k]-a.cam[k])*f;out.look[k]=a.look[k]+(b.look[k]-a.look[k])*f;}}
 const railCur={cam:[0,0,9.2],look:[0,0,0]};
 scene.add(new THREE.AmbientLight(0xffe9c4,.7));
 const key=new THREE.DirectionalLight(0xffd98a,1.6);key.position.set(4,6,6);scene.add(key);
 const rim=new THREE.PointLight(0xe0aa5e,10,32);rim.position.set(-6,-2,3);scene.add(rim);
 const warm=new THREE.PointLight(0xf6e3b8,6,26);warm.position.set(5,-3,4);scene.add(warm);
 const clock=new THREE.Clock();
 (function loop(){requestAnimationFrame(loop);const t=clock.getElapsedTime();
  m.size=.04+Math.sin(t*1.4)*.008;
  data.forEach((b,i)=>{dummy.position.set(b.x+Math.sin(t*.4+i)*.4,b.y+Math.cos(t*.3+i*1.7)*.5,b.z);
   dummy.rotation.set(b.rx+t*.3,b.ry+t*.4,0);dummy.scale.setScalar(b.s);dummy.updateMatrix();beans.setMatrixAt(i,dummy.matrix);});
  beans.instanceMatrix.needsUpdate=true;
  const gp=(window.DIWAN_GL&&window.DIWAN_GL.p)||0;
  railAt(gp,railCur);
  cam.position.x+=((railCur.cam[0]+Mouse.x*1.6)-cam.position.x)*.05;
  cam.position.y+=((railCur.cam[1]+(-Mouse.y*1.1))-cam.position.y)*.05;
  cam.position.z+=(railCur.cam[2]-cam.position.z)*.05;
  lookV.set(railCur.look[0],railCur.look[1],railCur.look[2]);cam.lookAt(lookV);
  scene.rotation.y=gp*1.1;scene.position.y=gp*1.5;
  steamU.uT.value=t;steamU.uOp.value=.3+gp*.35;
  swirlU.uT.value=t;swirlU.uFade.value=Math.max(0,1-scrollY/(innerHeight*.9));
  glowA.opacity=.3+gp*.35;glowB.opacity=.22+gp*.25;
  renderer.render(scene,cam);})();
 }catch(e){cv.style.display='none';}
})();

/* hero pack tilt */
(()=>{const st=$('#packStage');if(!st||reduced)return;
addEventListener('mousemove',e=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);
st.style.transform=`rotateY(${x*16}deg) rotateX(${-y*12}deg) translateZ(10px)`;});})();

/* ---------- 5) SCROLL STORY scenes ---------- */
const SCENES=[
  {n:'01',k:'SCENE 01 — THE ORIGIN',t:'الأصل',d:'اختيار حبات البن الناضجة بعناية قبل التحميص، لأساس نقي وأصيل.'},
  {n:'02',k:'SCENE 02 — THE ROAST',t:'التحميص',d:'تحميص دقيق على درجات حرارة محسوبة لإخراج أطيب نكهة وأعمق عطر للبن.'},
  {n:'03',k:'SCENE 03 — THE BLEND',t:'الخلطة',d:'مزج دقيق بين أجود أنواع البن لخلطة الديوان المتوازنة بين الحلاوة والقوام.'},
  {n:'04',k:'SCENE 04 — THE BREW',t:'الفنجان',d:'طحن فوري وصب القهوة على أصولها، مع العناية برغوة فنجان الديوان الرقيقة.'},
  {n:'05',k:'SCENE 05 — THE SERVE',t:'التقديم',d:'فنجان الديوان جاهز... رائحة أصيلة بطعم لا يُنسى يُقدّم بأصالة.'},
];
(()=>{const dots=$('#sceneDots'),imgs=$$('.story-media .scene-ph');let cur=0,last=0;
if(!dots||!imgs.length)return;
SCENES.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',s.t);
if(i===0)b.classList.add('on');b.onclick=()=>{setScene(i);last=performance.now();};dots.appendChild(b);});
function setScene(i){cur=i;imgs.forEach((im,k)=>im.classList.toggle('active',k===i));
[...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
$('#sceneNum').textContent=SCENES[i].n;$('#sceneKick').textContent=SCENES[i].k;
$('#sceneTitle').textContent=SCENES[i].t;$('#sceneDesc').textContent=SCENES[i].d;
if(window.gsap&&!reduced)gsap.from('.scene-card',{x:30,opacity:.4,duration:.6,ease:'power2.out'});}
setScene(0);
if(window.gsap&&window.ScrollTrigger&&!reduced){gsap.registerPlugin(ScrollTrigger);
/* محلّي: تقدّم مشهد واحد فقط في كل مرة + مهلة، حتى لا يسرق السكرول السريع عدة صور */
ScrollTrigger.create({trigger:'#storyPin',start:'top 78%',end:'bottom 30%',
 onUpdate(self){const idx=Math.min(4,Math.floor(self.progress*5));if(idx===cur)return;
  const now=performance.now(),cooldown=idx>cur?950:450;
  if(now-last<cooldown)return;last=now;setScene(cur+(idx>cur?1:-1));}});}
window.setScene=setScene;})();

/* ---------- 6b) COUNCIL — معرض أفقي مدفوع بالسكرول الرأسي (ديسكتوب) + سحب/كيبورد ---------- */
(()=>{const track=$('#councilTrack');if(!track)return;
 if(window.gsap&&window.ScrollTrigger&&!reduced&&!isMobile){
  ScrollTrigger.create({trigger:'#council',start:'top 78%',end:'bottom 22%',
   onUpdate(self){const max=track.scrollWidth-track.clientWidth;if(max>0)track.scrollLeft=self.progress*max;}});}
 track.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'){track.scrollBy({left:320,behavior:'smooth'});e.preventDefault();}
  if(e.key==='ArrowRight'){track.scrollBy({left:-320,behavior:'smooth'});e.preventDefault();}});})();

/* ---------- 6) CONFIGURATOR ---------- */
const cfg={p:PRODUCTS[0],v:0,qty:1,size:0};
function renderCfgBlends(){$('#cfgBlends').innerHTML=PRODUCTS.map(p=>
 `<button class="chip-opt ${p.id===cfg.p.id?'on':''}" data-id="${p.id}">${p.name}</button>`).join('');
 $$('#cfgBlends .chip-opt').forEach(b=>b.onclick=()=>{cfg.p=PRODUCTS.find(p=>p.id===b.dataset.id);cfg.v=0;syncCfg();});}
function renderCfgVariants(){$('#cfgWeights').innerHTML=cfg.p.variants.map((v,i)=>
 `<button class="chip-opt ${i===cfg.v?'on':''}" data-i="${i}">${v.label} — ${v.price} EGP</button>`).join('');
 $$('#cfgWeights .chip-opt').forEach(b=>b.onclick=()=>{cfg.v=+b.dataset.i;syncCfg();});}
function renderCfgSizes(){$('#cfgSizes').innerHTML=SIZES.map((s,i)=>
 `<button class="chip-opt ${i===cfg.size?'on':''}" data-s="${i}">${s.pack} — ${s.label}</button>`).join('');
 $$('#cfgSizes .chip-opt').forEach(b=>b.onclick=()=>{cfg.size=+b.dataset.s;syncCfg();});}
function syncCfg(){const v=cfg.p.variants[cfg.v]||cfg.p.variants[0];cfg.v=cfg.p.variants.indexOf(v);
 $('#cfgName').textContent=cfg.p.name;$('#cfgDesc').textContent=cfg.p.desc;
 $('#cfgRoast').textContent=cfg.p.roast;$('#cfgGrind').textContent=cfg.p.grind;
 $('#cfgPrice').textContent=EGP(priceOf(cfg.p,cfg.v,cfg.size));$('#cfgOld').textContent=sizeOf(cfg.size).mult>1?EGP(v.price)+' / ربع كيلو':'';
 $('#qVal').textContent=cfg.qty;
 setPhImg($('#cfgSlot'),cfg.p.img,cfg.p.name,cfg.p.name);
 renderCfgBlends();renderCfgVariants();renderCfgSizes();}
$('#qPlus').onclick=()=>{cfg.qty=Math.min(20,cfg.qty+1);$('#qVal').textContent=cfg.qty;};
$('#qMinus').onclick=()=>{cfg.qty=Math.max(1,cfg.qty-1);$('#qVal').textContent=cfg.qty;};
$('#cfgAdd').onclick=()=>{addToCart(cfg.p.id,cfg.v,cfg.qty,cfg.size);};
$('#cfgView').onclick=()=>openQV(cfg.p.id);
syncCfg();

/* ---------- 7) ROAST LAB ---------- */
$$('.roast-card').forEach(c=>c.onclick=()=>{
 $$('.roast-card').forEach(x=>x.classList.remove('on'));c.classList.add('on');
 $('#roast').dataset.roast=c.dataset.r;drawRadar(c.dataset.r);syncRoastSlider(c.dataset.r);
 toast(c.dataset.r==='light'?'تحميص فاتح — زاهي وخفيف ☀':c.dataset.r==='medium'?'تحميص وسط — توازن الديوان ⚖':'تحميص غامق — تقيل وفاخر 🌙');});

/* ---------- 8) PRODUCT GRID + REVIEWS ---------- */
const webpOf=s=>String(s).replace(/\.(jpe?g|png)$/i,'.webp');
const phImg=(src,alt,lazy=true,hide=false)=>hide||!src?'':`<picture><source type="image/webp" srcset="${webpOf(src)}"><img src="${src}" alt="${alt||''}" ${lazy?'loading="lazy" ':''}decoding="async" onerror="onImgErr(this)"></picture>`;
function renderGrid(){$('#productGrid').innerHTML=PRODUCTS.map(p=>{const min=Math.min(...p.variants.map(v=>v.price));return `
 <article class="pcard">
  <div class="ph img-ph${p.noimg?' noimg':''}" data-slot="${p.name}">${phImg(p.img,p.name,true,p.noimg)}<span>${p.noimg?`<i class="ico ph-ico" data-ico="bean"></i>`:''}${p.name}</span><small>${p.noimg?'الصورة قريبًا — بعدسة الديوان':'صورة '+p.name}</small></div>${p.badge?`<span class="badge">${p.badge}</span>`:''}
  <div class="pb"><h3>${p.name} <small style="color:#a08c5a" class="en">${p.nameEn}</small></h3>
   <p>${p.desc}</p>
   <div class="pvars">${p.variants.map(v=>`<span>${v.label} <b>${v.price} EGP</b></span>`).join('')}</div>
   <div class="prow"><span class="price">من ${min} EGP</span><small style="color:#8a7c55">${UNIT}</small></div>
   <div class="card-actions">
    <button class="mini-btn add" data-add="${p.id}">+ سلة</button>
    <button class="mini-btn" data-qv="${p.id}">عرض</button>
   </div></div></article>`;}).join('');
  $$('#productGrid [data-add]').forEach(b=>b.onclick=()=>addToCart(b.dataset.add,0,1));
  $$('#productGrid [data-qv]').forEach(b=>b.onclick=()=>openQV(b.dataset.qv));
  mountIcons($('#productGrid'));if(window.__langReady)window.applyLang();}
function renderReviews(){const grid=$('#revGrid');if(!grid)return;
 const link=`<a class="btn btn-gold btn-sm" target="_blank" rel="noopener" href="${GOOGLE_MAPS_URL}">شوف تقييماتنا على Google</a>`;
 if(!REVIEWS.length){
  grid.innerHTML=`<div class="glass rev rev-empty" style="grid-column:1/-1;text-align:center;padding:36px">
   <div class="stars" style="font-size:1.25rem;letter-spacing:.22em" aria-hidden="true">★★★★★</div>
   <h3 style="margin:10px 0 6px">تقييمات حقيقية من Google</h3>
   <p class="lead" style="font-size:.95rem;max-width:640px;margin:0 auto">بنعرض آراء عملائنا الحقيقية بس. القسم جاهز يعرض تقييمات Google الرسمية فور ربطها — من غير أي تقييمات مختلقة.</p>
   <div style="margin-top:16px">${link}</div>
   <p style="color:var(--muted);font-size:.76rem;margin-top:12px">لصاحب النشاط: ضع التقييمات في <code dir="ltr">data/reviews.json</code> وتظهر البطاقات تلقائيًا بنفس التصميم.</p>
  </div>`;return;}
 const avg=(REVIEWS.reduce((s,r)=>s+(+r.stars||0),0)/REVIEWS.length);
 grid.innerHTML=`<div class="glass rev" style="grid-column:1/-1;display:flex;gap:20px;flex-wrap:wrap;align-items:center;justify-content:center;text-align:center">
   <div><b style="font-size:1.7rem;color:var(--gold)">${avg.toFixed(1)}</b><div class="stars">${'★'.repeat(Math.round(avg))}</div><small style="color:var(--muted)">${REVIEWS.length} تقييم على Google</small></div>${link}</div>`+
 REVIEWS.map(r=>`<div class="glass rev"><div class="stars">${'★'.repeat(Math.min(5,Math.max(1,r.stars)))}</div>
 <p style="line-height:2">"${r.text}"</p>
 <b>${r.name}</b>${r.when?`<br><small style="color:var(--muted)">${r.when}</small>`:''}</div>`).join('');
 injectReviewSchema(avg);}
renderGrid();renderReviews();loadReviews();

/* ---------- 9) CART STORE (persistent) ---------- */
const store={get(){try{return JSON.parse(localStorage.getItem('aldiwan_cart_v1'))||[]}catch(e){return[]}},
 set(v){localStorage.setItem('aldiwan_cart_v1',JSON.stringify(v));renderCart();}};
let cart=store.get();
function addToCart(pid,vi=0,qty=1,size=0){const p=PRODUCTS.find(x=>x.id===pid);if(!p||!p.available)return;
 const v=p.variants[vi]||p.variants[0];vi=p.variants.indexOf(v);const s=sizeOf(size);size=SIZES.indexOf(s);
 const key=pid+'_'+v.k+'_'+s.k;const ex=cart.find(i=>i.key===key);
 if(ex)ex.qty=Math.min(20,ex.qty+qty);else cart.push({key,pid,vi,size,qty});
 store.set(cart);toast(`اتضافت للسلة: ${p.name} ${v.label} ${s.label} ✓`);openSheet('#cartSheet');}
function renderCart(){const box=$('#cartItems');
 if(!cart.length){box.innerHTML=`<div class="empty">سلتك فاضية...<br><b>ريحتها بن؟ يبقى لازم تتملي</b><br><a href="#products" class="btn btn-gold btn-sm" style="margin-top:12px" onclick="closeAll()">اكتشف البن</a></div>`;}
 else box.innerHTML=cart.map((i,idx)=>{const {p,v,s,unit,total}=lineOf(i);return `
  <div class="citem"><div class="citem-thumb img-ph" data-slot="${p.name}">${phImg(p.img,p.name,false,p.noimg)}<span>${p.name}</span></div>
   <div><b>${p.name} — ${v.label} <small style="color:#b9a06a">(${s.label})</small></b><small>${unit} EGP × ${i.qty} = <b>${total}</b></small>
    <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
     <button class="mini-btn" style="padding:4px 12px" onclick="chQty(${idx},-1)">−</button><b>${i.qty}</b>
     <button class="mini-btn" style="padding:4px 12px" onclick="chQty(${idx},1)">+</button>
     <button class="rm" onclick="rmItem(${idx})">حذف</button></div></div>
   <b>${total}</b></div>`;}).join('');
 const total=cart.reduce((s,i)=>s+lineOf(i).total,0);
 const count=cart.reduce((s,i)=>s+i.qty,0);
 $('#cartTotal').textContent=EGP(total);$('#cartCount').textContent=count;$('#mCount').textContent=count;if(window.__langReady)window.applyLang();}
window.chQty=(idx,d)=>{cart[idx].qty=Math.max(1,Math.min(20,cart[idx].qty+d));store.set(cart);};
window.rmItem=idx=>{cart.splice(idx,1);store.set(cart);};
window.closeAll=closeAll;
renderCart();

/* ---------- 10) QUICK VIEW ---------- */
let qv={pid:'p01',vi:0,size:0};
function openQV(pid){const p=PRODUCTS.find(x=>x.id===pid);qv={pid,vi:0,size:0};
 setPhImg($('#qvSlot'),p.img,p.name,p.name);
 $('#qvName').textContent=p.name;$('#qvDesc').textContent=p.desc;
 $('#qvRoast').textContent=p.roast;
 $('#qvWeights').innerHTML=p.variants.map((v,i)=>`<button class="chip-opt ${i===0?'on':''}" data-i="${i}">${v.label} — ${v.price} EGP</button>`).join('');
 $$('#qvWeights .chip-opt').forEach(b=>b.onclick=()=>{qv.vi=+b.dataset.i;
  $$('#qvWeights .chip-opt').forEach(x=>x.classList.remove('on'));b.classList.add('on');updQV();});
 $('#qvSizes').innerHTML=SIZES.map((s,i)=>`<button class="chip-opt ${i===0?'on':''}" data-s="${i}">${s.label}</button>`).join('');
 $$('#qvSizes .chip-opt').forEach(b=>b.onclick=()=>{qv.size=+b.dataset.s;
  $$('#qvSizes .chip-opt').forEach(x=>x.classList.remove('on'));b.classList.add('on');updQV();});
 updQV();
 $('#qvModal').classList.add('show');scrim.classList.add('show');if(window.__langReady)window.applyLang();}
function updQV(){const p=PRODUCTS.find(x=>x.id===qv.pid);$('#qvPrice').textContent=EGP(priceOf(p,qv.vi,qv.size));}
window.openQV=openQV;
$('#qvAdd').onclick=()=>{addToCart(qv.pid,qv.vi,1,qv.size);closeAll();setTimeout(()=>openSheet('#cartSheet'),150);};

/* ---------- 11) CHECKOUT (steps) ---------- */
let coStep=1,ship={};
$('#goCheckout').onclick=()=>{if(!cart.length){toast('سلتك فاضية — اختار خلطتك الأول');return;}
 closeAll();coStep=1;renderCO();$('#coModal').classList.add('show');scrim.classList.add('show');};
const cartTotal=()=>cart.reduce((s,i)=>s+lineOf(i).total,0);
const shipLine=t=>t>=400?'شحن مجاني داخل محافظات الدلتا':'الشحن يُحدّد عند التأكيد (محافظات الدلتا)';
function renderCO(){$$('#coModal .steps span').forEach(s=>s.classList.toggle('on',+s.dataset.s===coStep));
 const total=cartTotal();
 if(coStep===1)$('#coBody').innerHTML=`${cart.map(i=>{const {p,v,s,total:tt}=lineOf(i);
  return `<div class="brow"><span class="ico" data-ico="cart"></span><span><b>${p.name} ${v.label}</b> (${s.label}) × ${i.qty} — <b>${tt} EGP</b></span></div>`;}).join('')}
  <div class="total-row"><span>المجموع — ${shipLine(total)}</span><span>${total} EGP</span></div>
  <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="coGo(2)">التالي: بيانات التوصيل ←</button>
  <small style="color:var(--muted)">شحن مجاني داخل الدلتا فوق 400 EGP • الدفع كاش عند الاستلام</small>`;
 if(coStep===2)$('#coBody').innerHTML=`<form id="shipF">
  <div class="field"><label>الاسم بالكامل</label><input required id="fName" placeholder="مثال: أحمد الديواني"></div>
  <div class="field"><label>الموبايل</label><input required id="fPhone" inputmode="tel" pattern="[0-9+ ]{8,15}" placeholder="01xxxxxxxxx"></div>
  <div class="field"><label>المحافظة / المدينة</label><select id="fCity"><option>شبين الكوم</option><option>منوف</option><option>طنطا</option><option>المنصورة</option><option>دمنهور</option><option>الزقازيق</option><option>بنها</option><option>كفر الشيخ</option><option>دمياط</option><option>المحلة الكبرى</option><option>أخرى (خارج الدلتا)</option></select></div>
  <div class="field"><label>العنوان</label><input required id="fAddr" placeholder="شارع / علامة مميزة"></div>
  <div class="field"><label>ملاحظات (الطحنة / التحويجة)</label><input id="fNote" placeholder="اختياري"></div>
  <div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" onclick="coGo(1)">→ رجوع</button>
  <button class="btn btn-gold" style="flex:1;justify-content:center">مراجعة الطلب ←</button></div></form>`;
 if(coStep===2)setTimeout(()=>{const f=$('#shipF');if(f)f.onsubmit=e=>{e.preventDefault();
  ship={name:$('#fName').value,phone:$('#fPhone').value,city:$('#fCity').value,addr:$('#fAddr').value,note:$('#fNote').value};coGo(3);};},50);
 if(coStep===3)$('#coBody').innerHTML=`<div class="brow"><span class="ico" data-ico="location"></span><span>${ship.name} — <span dir="ltr">${ship.phone}</span></span></div>
  <div class="brow"><span class="ico" data-ico="location"></span><span>${ship.city} — ${ship.addr}</span></div>
  <div class="brow"><span class="ico" data-ico="cash"></span><span>الدفع عند الاستلام — المجموع <b>${total} EGP</b> • ${shipLine(total)}</span></div>
  <div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-ghost" onclick="coGo(2)">→ تعديل</button>
  <button class="btn btn-gold" style="flex:1;justify-content:center" onclick="placeOrder(${total})">تأكيد الطلب</button></div>`;
 mountIcons($('#coBody'));}
window.coGo=n=>{coStep=n;renderCO();};
window.placeOrder=total=>{const ord={no:'DW-'+Date.now().toString().slice(-6),items:cart,total,ship,at:new Date().toISOString()};
 try{const all=JSON.parse(localStorage.getItem('aldiwan_orders_v1'))||[];all.push(ord);
 localStorage.setItem('aldiwan_orders_v1',JSON.stringify(all));}catch(e){}
 cart=[];store.set(cart);$('#coBody').innerHTML=`<div class="center" style="padding:20px">
  <div style="color:var(--gold);width:56px;margin:0 auto 6px" data-ico="check"></div><h3>طلبك اتسجل يا ${ship.name.split(' ')[0]||'بطل'}!</h3>
  <p class="lead">رقم الطلب <b dir="ltr">${ord.no}</b> — هنتصل بيك للتأكيد، والبن هيوصلك مطحون طازج.</p>
  <button class="btn btn-gold" onclick="closeAll()" style="justify-content:center">تمام — رجوع للمتجر</button></div>`;mountIcons($('#coBody'));};

/* ---------- 12) MISC ---------- */
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;
 $('#toasts').appendChild(t);setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.remove(),400);},2600);}
window.toast=toast;
$('#newsForm').onsubmit=e=>{e.preventDefault();const v=$('#newsMail').value;
 try{localStorage.setItem('aldiwan_news',v);}catch(err){}
 toast('اتسجلت ✓ كود خصمك: DIWAN15');e.target.reset();};

/* ---------- 13) CINEMATIC DYNAMIC LIGHTING + EXTRA MOTION ---------- */
(()=>{if(reduced)return;
 /* mouse spotlight with inertia */
 const spot=$('#spotlight');let sx=innerWidth/2,sy=innerHeight/3,tx=sx,ty=sy;
 addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;},{passive:true});
 /* scroll-linked light energy */
 let energy=0;
 addEventListener('scroll',()=>{energy=Math.min(1,scrollY/Math.max(1,innerHeight*1.2));},{passive:true});
 (function follow(){requestAnimationFrame(follow);
  sx+=(tx-sx)*.08;sy+=(ty-sy)*.08;
  if(spot){spot.style.transform=`translate(${sx}px,${sy}px) scale(${1+energy*.5})`;
   const op=(.65+energy*.3).toFixed(2);if(op!==spot.dataset.op){spot.style.opacity=op;spot.dataset.op=op;}}
  /* heavy filters run only while the hero pack is on screen */
  const st=$('#packStage'),img=$('#heroPack');
  if(!st||!img)return;
  const r=img.getBoundingClientRect(),vis=r.bottom>0&&r.top<innerHeight;
  const glow=document.querySelector('.hero-glow');
  if(glow)glow.style.filter=vis?`blur(10px) brightness(${(1+energy*.6).toFixed(2)})`:'';
  const beams=document.querySelector('.light-beams');
  if(beams)beams.style.opacity=(.6+energy*.6).toFixed(2);
  if(vis){const dx=(sx-(r.left+r.width/2))/r.width,dy=(sy-(r.top+r.height/2))/r.height;
   st.style.filter=`drop-shadow(${(-dx*30).toFixed(0)}px ${(20-dy*20).toFixed(0)}px 42px rgba(220,169,94,${(.25+Math.min(.4,Math.abs(dx)*.5)).toFixed(2)}))`;
   st.dataset.lit='1';}
  else if(st.dataset.lit){st.style.filter='';delete st.dataset.lit;}
 })();
 /* parallax: hero copy drifts slower than visual */
 if(window.gsap&&window.ScrollTrigger){
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('.hero-copy',{y:-70,opacity:.35,ease:'none',
   scrollTrigger:{trigger:'#home',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-visual',{y:60,ease:'none',
   scrollTrigger:{trigger:'#home',start:'top top',end:'bottom top',scrub:true}});
  /* bento parallax (scale preserved so edges never show) */
  $$('.bento .img-ph').forEach(im=>gsap.fromTo(im,{y:-12,scale:1.12},{y:12,scale:1.12,ease:'none',
   scrollTrigger:{trigger:im,scrub:true,start:'top bottom',end:'bottom top'}}));
  /* section light sweep: brighten glass cards entering viewport */
  $$('.glass').forEach(g=>gsap.fromTo(g,{filter:'brightness(.75)'},{filter:'brightness(1.08)',ease:'none',
   scrollTrigger:{trigger:g,scrub:true,start:'top 90%',end:'top 40%'}}));
 }
 /* cursor light: cursor dot pulses with speed */
 const dot=$('#cursor');let lx=0,ly=0;
 addEventListener('mousemove',e=>{const v=Math.hypot(e.clientX-lx,e.clientY-ly);
  lx=e.clientX;ly=e.clientY;
  if(dot)dot.style.boxShadow=`0 0 ${Math.min(48,18+v*.6)}px var(--gold)`;},{passive:true});
})();

/* ---------- 14) ROAST RADAR + QUIZ + BREW + COUNCIL ---------- */
(()=>{
const ROASTS={
 light:{acid:.9,sweet:.6,bitter:.25,body:.4,desc:'حموضة زاهية ونكهات أخف — لعشاق التفاصيل الدقيقة.'},
 medium:{acid:.55,sweet:.8,bitter:.5,body:.7,desc:'التوازن الذهبي: حلاوة + قوام + وشّ تركي غني. اختيار الديوان.'},
 dark:{acid:.25,sweet:.5,bitter:.9,body:.95,desc:'شوكولاتة محمصة ومرارة عميقة — لعشاق التقيل.'}};
window.drawRadar=function(key){const cv=$('#radar');if(!cv)return;const r=ROASTS[key];if(!r)return;
 const ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H/2,R=Math.min(W,H)/2-32;
 const axes=[['الحموضة',r.acid],['الحلاوة',r.sweet],['المرارة',r.bitter],['القوام',r.body]];
 ctx.clearRect(0,0,W,H);ctx.textAlign='center';ctx.font='13px Cairo';
 [.33,.66,1].forEach(f=>{ctx.beginPath();
  axes.forEach((a,i)=>{const an=-Math.PI/2+i*Math.PI/2,x=cx+Math.cos(an)*R*f,y=cy+Math.sin(an)*R*f;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  ctx.closePath();ctx.strokeStyle='rgba(220,169,94,.25)';ctx.stroke();});
 ctx.beginPath();
 axes.forEach((a,i)=>{const an=-Math.PI/2+i*Math.PI/2,x=cx+Math.cos(an)*R*a[1],y=cy+Math.sin(an)*R*a[1];i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
 ctx.closePath();ctx.fillStyle='rgba(220,169,94,.32)';ctx.fill();
 ctx.strokeStyle='#f6e3b8';ctx.lineWidth=2;ctx.stroke();
 axes.forEach((a,i)=>{const an=-Math.PI/2+i*Math.PI/2;ctx.fillStyle='#fbf3e2';ctx.fillText(a[0],cx+Math.cos(an)*(R+20),cy+Math.sin(an)*(R+20));});
 $('#roastDesc').textContent=r.desc;};
window.syncRoastSlider=function(key){const s=$('#roastRange');if(s)s.value={light:0,medium:1,dark:2}[key];};
const slider=$('#roastRange');
if(slider)slider.addEventListener('input',()=>{const k=['light','medium','dark'][+slider.value];
 $$('.roast-card').forEach(x=>x.classList.toggle('on',x.dataset.r===k));
 $('#roast').dataset.roast=k;drawRadar(k);});
drawRadar('medium');

/* quiz → recommend → configurator */
const quiz={a:null,b:null,c:null};
$$('#quiz [data-q] button').forEach(b=>b.onclick=()=>{
 const box=b.closest('.quiz-q');const q=box?box.dataset.q:null;if(!q)return;quiz[q]=b.dataset.v;
 [...box.querySelectorAll('button')].forEach(x=>x.classList.remove('on'));b.classList.add('on');
 if(quiz.a&&quiz.b&&quiz.c){let id='p01';
  if(quiz.a==='calm'&&quiz.c==='filter')id='p09';
  else if(quiz.a==='calm')id='p02';
  else if(quiz.c==='filter')id='p04';
  else id=quiz.b==='spiced'?'p04':'p03';
  const p=PRODUCTS.find(x=>x.id===id);
  const wantK=quiz.b==='spiced'?'mahwag':'sada';
  let vi=p.variants.findIndex(v=>v.k===wantK);if(vi<0)vi=0;
  $('#quizResult').innerHTML=`ترشيح الديوان ليك: <b>${p.name}</b> (${p.variants[vi].label}) — ${p.desc}`;
  const go=$('#quizGo');go.style.display='inline-flex';go.onclick=()=>cfgPick(id,vi);}});
window.cfgPick=function(id,vi=0){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;
 cfg.p=p;cfg.v=vi;syncCfg();const t=$('#shop');
 if(window.__lenis)window.__lenis.scrollTo(t,{offset:-70,duration:1.4});
 else t.scrollIntoView({behavior:reduced?'auto':'smooth'});};

/* brew ritual scrub */
const brewSteps=$$('.brew-step'),brewBar=$('#brewBar');
if(brewSteps.length&&window.gsap&&window.ScrollTrigger&&!reduced){
 ScrollTrigger.create({trigger:'#brew',start:'top 70%',end:'bottom 55%',scrub:.8,
  onUpdate(self){const i=Math.min(brewSteps.length-1,Math.floor(self.progress*brewSteps.length));
   brewSteps.forEach((s,k)=>s.classList.toggle('on',k<=i));
   if(brewBar)brewBar.style.transform=`scaleX(${self.progress})`;}});}
else brewSteps.forEach(s=>s.classList.add('on'));

/* council: smooth scroll-driven drift on visuals (scale preserved) */
if(window.gsap&&window.ScrollTrigger&&!reduced){
 $$('.council-card .img-ph').forEach(im=>gsap.fromTo(im,{x:-26,scale:1.15},{x:26,scale:1.15,ease:'none',
  scrollTrigger:{trigger:im,scrub:.8,start:'top bottom',end:'bottom top'}}));}
})();

/* ---------- 15) SIGNATURE: dome reveals + calligraphy draw + hover warp + GL progress ---------- */
(()=>{if(reduced||!window.gsap||!window.ScrollTrigger)return;
gsap.registerPlugin(ScrollTrigger);
window.DIWAN_GL=window.DIWAN_GL||{p:0};
ScrollTrigger.create({trigger:document.body,start:'top top',end:'bottom bottom',scrub:.6,
 onUpdate(self){window.DIWAN_GL.p=self.progress;}});
/* dome mask reveals (brand signature) */
$$('.dome-reveal').forEach(el=>gsap.fromTo(el,
 {clipPath:'inset(10% 32% 82% 32% round 120px)'},
 {clipPath:'inset(0% 0% 0% 0% round 22px)',ease:'none',
  scrollTrigger:{trigger:el,scrub:.8,start:'top 88%',end:'top 45%'}}));
if($('#cupStage'))gsap.fromTo('#cupStage',{clipPath:'inset(0% 38% 96% 38% round 120px)'},
 {clipPath:'inset(0% 0% 0% 0% round 26px)',duration:1.6,ease:'power2.inOut',delay:.15});
function drawIn(scope,trigger){const ink=$(scope+' .ink'),pen=$(scope+' .pen');if(!ink)return;
 const tl=gsap.timeline({paused:!!trigger});
 tl.to(ink,{clipPath:'inset(0% 0% 0% 0%)',duration:1.5,ease:'power2.inOut'},0);
 if(pen)tl.to(pen,{left:'0%',duration:1.5,ease:'power2.inOut'},0)
  .to(pen,{opacity:0,duration:.4},1.5);
 if(trigger)ScrollTrigger.create({trigger:trigger,start:'top 75%',once:true,onEnter:()=>tl.play()});
 else tl.delay(.95).play();}
drawIn('#heroDraw',null);drawIn('#storyDraw','#story');
/* image hover distortion */
const warp=document.querySelector('#warpScale');
if(warp&&matchMedia('(hover:hover)').matches){
 let target=0,cur=0,active=null,raf=null;
 const loop=()=>{cur+=(target-cur)*.12;warp.setAttribute('scale',cur.toFixed(1));
  if(Math.abs(target-cur)>.1||target>0)raf=requestAnimationFrame(loop);
  else{if(active){active.style.filter='';active=null;}raf=null;}};
  $$('.council-card .img-ph,.pcard .ph').forEach(img=>{
  img.addEventListener('mouseenter',()=>{active=img;img.style.filter='url(#warp)';target=10;if(!raf)loop();});
  img.addEventListener('mousemove',e=>{const vx=Math.min(1,Math.abs(e.movementX||0)/30);
   target=8+vx*14;if(active!==img){active=img;img.style.filter='url(#warp)';}if(!raf)loop();});
  img.addEventListener('mouseleave',()=>{target=0;});});}
})();

/* ---------- 17) EXTRA MOTION: kinetic type + velocity skew + cursor + tilt + batch ---------- */
(()=>{if(reduced||!window.gsap||!window.ScrollTrigger)return;
/* kinetic headings */
$$('section .display').forEach(h=>{if(h.querySelector('.draw'))return;
 [...h.childNodes].forEach(n=>{if(n.nodeType!==3)return;
  const frag=document.createDocumentFragment();
  n.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;
   if(/^\s+$/.test(w))frag.appendChild(document.createTextNode(' '));
   else{const s=document.createElement('span');s.className='w';s.textContent=w;frag.appendChild(s);}});
  h.replaceChild(frag,n);});
 const words=$$('.w',h);if(!words.length)return;
 gsap.fromTo(words,{y:44,opacity:0,rotate:2},{y:0,opacity:1,rotate:0,duration:.8,stagger:.05,ease:'power3.out',
  scrollTrigger:{trigger:h,start:'top 85%',once:true}});});
/* scroll velocity skew */
if(!isMobile){let vel=0,lastY=scrollY;const heads=$$('.display');
 const belts=[$('.rev-track')].filter(Boolean);
 const base=[30];
 (function tickV(){const y=scrollY;vel+=((y-lastY)-vel)*.15;lastY=y;
  const sk=Math.max(-5,Math.min(5,vel*.22)).toFixed(2);
  for(const d of heads)d.style.transform=`skewX(${sk}deg)`;
  const boost=1+Math.min(2,Math.abs(vel)/60);
  belts.forEach((b,i)=>b.style.animationDuration=(base[i]/boost).toFixed(2)+'s');
  requestAnimationFrame(tickV);})();}
/* contextual cursor */
const SEL='a,button,.roast-card,.council-card,.chip-opt,input[type=range]';
document.addEventListener('mouseover',e=>{const t=e.target.closest?e.target.closest(SEL):null;
 $('#cursor').classList.toggle('big',!!t);});
/* batch entrances (transition-safe) */
ScrollTrigger.batch('.pcard,.roast-card,.brew-step,.quiz-q',{start:'top 92%',once:true,
 onEnter:els=>{els.forEach(el=>el.style.transition='none');
  gsap.fromTo(els,{y:36,opacity:0},{y:0,opacity:1,duration:.7,stagger:.07,ease:'power3.out',
   clearProps:'transform,opacity',onComplete:()=>els.forEach(el=>el.style.transition='')});}});
/* tilt glass cards */
if(matchMedia('(hover:hover)').matches){
 $$('.scene-card,.config-body,.radar-box,.order-card,.quiz-box,.brew-box').forEach(card=>{
  card.classList.add('tilt');
  card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   card.style.transform=`rotateY(${(x*7).toFixed(2)}deg) rotateX(${(-y*7).toFixed(2)}deg)`;});
  card.addEventListener('mouseleave',()=>card.style.transform='');});}
})();

/* ---------- 16) HERO CUP — 3D spin that settles on scroll ---------- */
(()=>{const cup=$('#cupStage');if(!cup||reduced)return;
let cx=0,cy=0,mx=0,my=0;
addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5);},{passive:true});
const t0=performance.now();
(function spin(){requestAnimationFrame(spin);
 const p=Math.min(1,scrollY/Math.max(1,innerHeight*.8));
 const amp=1-p;
 const t=(performance.now()-t0)/1000;
 cx+=(mx-cx)*.06;cy+=(my-cy)*.06;
 cup.style.transform=`rotateY(${(Math.sin(t*.7)*16*amp+cx*18).toFixed(2)}deg) rotateX(${(-Math.cos(t*.5)*10*amp-cy*12).toFixed(2)}deg)`;})();
})();

/* ---------- 17) AR / EN LANGUAGE SWITCHER (curated dictionary — بلا أي ترجمة آلية) ---------- */
const I18N={
 /* chrome */
 'الرئيسية':'Home','الحكاية':'Story','المنتجات':'Products','قصتنا':'Our Story','الفروع':'Branches','تواصل':'Contact','تواصل معنا':'Contact us',
 'تسوق الآن':'Shop now','تسوق الآن — SHOP':'Shop now — SHOP','انستجرام':'Instagram','فيسبوك':'Facebook',
 'سلة الديوان':'Your cart','سلتك فاضية...':'Your cart is empty...','ريحتها بن؟ يبقى لازم تتملي':'Smells like coffee — let’s fill it',
 'اكتشف البن':'Explore the coffee','اكتشف البن ←':'Explore the coffee ←','الإجمالي':'Total',
 'الشحن يُحسب عند التأكيد • الدفع عند الاستلام متاح':'Shipping at checkout • Cash on delivery available',
 'إتمام الطلب — CHECKOUT':'Checkout — CHECKOUT','مواصلة التسوق':'Continue shopping','السلة (':'Cart (',
 /* hero */
 'قهوة تُحضّر بحكاية...':'Coffee brewed with a story...','وتُقدّم بأصالة':'served with authenticity',
 'تسوق الآن • SHOP':'Shop now • SHOP','فنجان سعيد شهريًا':'happy cups / month','صنف بن أصلي ونضيف':'authentic, pure blends',
 'فرعان حاليًا، والتوسع للقاهرة مستقبلًا':'Two branches now — Cairo coming soon','سنة ولسه مكملين':'years and still going',
 'اسحب لتبدأ الحكاية':'Scroll to begin the story','أصل القهوة •':'The origin •','تحميص يومي •':'Roasted daily •','سادة • محوج • إكسترا •':'Plain • Spiced • Extra •','بُن الديوان •':'Al-Dewan •',
 /* story */
 'رحلة الفنجان — SCROLL STORY':'Bean to cup — SCROLL STORY','من الحبة...':'From the bean...','للفنجان':'to the cup',
 'الأصل':'Origin','تذوق أصل القهوة — تسوق الآن':'Taste the origin — shop now',
 /* products / config */
 'المنيو الكامل — SHOP COFFEE':'Full menu — SHOP COFFEE','تسوق':'Shop','البن':'Coffee','الأكثر طلبًا':'Best seller',
 'ربع كيلو':'Quarter kilo','+ سلة':'+ Cart','عرض':'View','عرض سريع — QUICK VIEW':'Quick view — QUICK VIEW',
 'اختار':'Choose','خلطتك':'your blend','الصنف • COFFEE':'Blend • COFFEE','النوع • سادة / محوج':'Type • Plain / Spiced',
 'الوزن • SIZE':'Weight • SIZE','ربع كيلو — 250 جم':'Quarter — 250 g','نصف كيلو — 500 جم':'Half — 500 g',
 'كيلو — عبوتان — 1 كجم':'Kilo — two packs — 1 kg','التحميص':'Roast','الطحنة':'Grind','المخزون':'Stock','متوفر ✓':'In stock ✓',
 '+ إضافة للسلة':'+ Add to cart','+ أضف للسلة':'+ Add to cart',
 /* quiz */
 'مزاجك إيه؟ — QUIZ':'What’s your mood? — QUIZ','نرشّح':'we suggest','لك':'for you',
 'تحبها قوية ولا هادية؟':'Strong or mellow?','هادية':'Mellow','قوية':'Strong','بتحب التحويجة؟':'Do you like it spiced?',
 'بتحضرها إزاي؟':'How do you brew it?','تركي':'Turkish','فلتر':'Filter',
 'جاوب على التلات أسئلة وهنرشح لك الخلطة المناسبة.':'Answer three questions and we’ll pick your blend.',
 'شوف خلطتك ←':'See your blend ←',
 /* ritual */
 'طقس القهوة — RITUAL':'Coffee ritual — RITUAL','على أصوله':'done right','الماء':'Water',
 'ميه مفلترة على نار هادية.':'Filtered water over low heat.','بن تركي مطحون طازج من الديوان.':'Fresh Turkish-ground beans from Al-Dewan.',
 'النار':'The heat','نار هادية وتقليب لحد ما الوش يطلع.':'Low heat, stirring until the foam rises.','الوش':'The foam','يتقدم سخن — وبالهنا.':'Served hot — enjoy.',
 /* heritage / council */
 'حكاية الديوان — HERITAGE':'Al-Dewan story — HERITAGE','مجلس...':'Majlis...','وريحة بن':'and coffee aroma',
 'مجلس الديوان — المكان يحكي':'Al-Dewan majlis — where the place speaks','المكان':'The place','يحكي':'speaks',
 /* reviews */
 'آراء حقيقية — REVIEWS':'Real reviews — REVIEWS','قالوا':'What they','عن':'said about',
 'تقييمات حقيقية من Google':'Real reviews from Google','شوف تقييماتنا على Google':'See our reviews on Google',
 /* roast lab */
 'درجة التحميص — ROAST LAB':'Roast level — ROAST LAB','فاتح؟':'Light?','وسط؟':'Medium?','غامق؟':'Dark?',
 'فاتح • LIGHT':'Light • LIGHT','وسط • MEDIUM':'Medium • MEDIUM','غامق • DARK':'Dark • DARK',
 'حموضة زاهية، نكهات عشبية وزهرية، كافيين أعلى إحساسًا.':'Bright acidity, herbal and floral notes, a lighter caffeine feel.',
 'التوازن الذهبي: حلاوة + قوام + وشّ تركي غني. اختيار الديوان.':'The golden balance: sweetness, body and a rich Turkish foam. Al-Dewan’s pick.',
 'شوكولاتة محمصة ودخان خفيف، مرارة عميقة لعشاق التقيل.':'Roasted chocolate with a touch of smoke — deep bitterness for the bold.',
 /* order */
 'اطلب':'Order','دلوقتي':'now','بن مطحون طازج لحد باب البيت — اختار خلطتك وادفع عند الاستلام.':'Fresh-ground coffee to your door — pick your blend, pay on delivery.',
 'تسوق البن ←':'Shop the coffee ←','افتح السلة':'Open cart',
 /* branches */
 'فروعنا — LOCATIONS':'Our branches — LOCATIONS','عدّي':'Pass','علينا...':'by us...','وشمّ البن':'and smell the coffee',
 'شارع صبري أبو علم، أمام بشاير الخير — المنوفية':'Sabry Abu Alam St., opposite Bashayer El-Kheir — Menoufia',
 'يوميًا 9ص — 12م (الجمعة 4م — 12م)':'Daily 9am — 12am (Fri 4pm — 12am)','يوميًا 9ص — 12م':'Daily 9am — 12am',
 'الاتجاهات ←':'Directions ←','اطلب دليفري':'Order delivery','شارع بورسعيد، أمام بنزينة مصر — المنوفية':'Port Said St., opposite Misr petrol station — Menoufia',
 /* footer */
 '«أصل القهوة» — بن مصري فاخر بتحميص يومي وطحن فوري.':'“The origin of coffee” — premium Egyptian beans, roasted daily and ground to order.',
 'الديوان محوج':'Al-Dewan spiced','يمني فاخر':'Premium Yemeni','الآراء':'Reviews',
 'وصلك الجديد أول بأول':'Get the news first','خصم 15% على أول أوردر للمشتركين.':'15% off your first order for subscribers.','اشترك':'Subscribe',
 /* quick view */
 'الأصل: بن أرابيكا مختار بعناية':'Origin: carefully selected Arabica beans','— الطحنة: تركي ناعم':'— Grind: fine Turkish',
 'التوصيل: فروع شبين الكوم ومنوف + شحن لمحافظات الدلتا':'Delivery: Shibin El-Kom & Menouf branches + Delta-wide shipping',
 /* checkout */
 'CHECKOUT — الدفع عند الاستلام':'CHECKOUT — Cash on delivery','إتمام الطلب':'Place order','1 السلة':'1 Cart','2 التوصيل':'2 Delivery','3 التأكيد':'3 Confirm',
 'الصور قريبًا — بعدسة الديوان':'Photo coming soon','حذف':'Remove',
};
var LANG=(()=>{try{return localStorage.getItem('aldiwan_lang')||'ar';}catch(e){return 'ar';}})();
var _origText=new WeakMap();
function _tr(n){
 if(LANG==='ar'){if(_origText.has(n))n.nodeValue=_origText.get(n);return;}
 const key=n.nodeValue.trim();if(!key||!/[\u0600-\u06FF]/.test(key))return;
 if(!_origText.has(n))_origText.set(n,n.nodeValue);
 if(I18N[key])n.nodeValue=n.nodeValue.replace(key,I18N[key]);
 else{const m=key.match(/^من (\d+) EGP$/);if(m)n.nodeValue=n.nodeValue.replace(key,`from ${m[1]} EGP`);}
}
function applyLang(){
 document.documentElement.lang=LANG==='en'?'en':'ar';
 document.body.classList.toggle('lang-en',LANG==='en');
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(w.nextNode())_tr(w.currentNode);
 const b=$('#langBtn');if(b)b.textContent=LANG==='en'?'ع':'EN';
}
window.applyLang=applyLang;window.__langReady=true;
$('#langBtn')?.addEventListener('click',()=>{
 LANG=LANG==='en'?'ar':'en';
 try{localStorage.setItem('aldiwan_lang',LANG);}catch(e){}
 applyLang();toast(LANG==='en'?'English mode':'الوضع العربي');
});
applyLang();

