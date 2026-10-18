/* ================================================================
AL DIWAN COFFEE — app.js
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
const SADA={k:'sada',label:'سادة'},MAHWAG={k:'mahwag',label:'محوج'};
const V=(s,m)=>[s!=null?{...SADA,price:s}:null,m!=null?{...MAHWAG,price:m}:null].filter(Boolean);
/** @typedef {{k:string,label:string,price:number}} Variant */
/** @typedef {{id:string,slug:string,name:string,nameEn:string,desc:string,roast:string,grind:string,variants:Variant[],img:string,badge?:string,featured?:boolean,available:boolean}} Product */
const PRODUCTS = [
  {id:'p01',slug:'diwan-sada',name:'الديوان السادة',nameEn:'AL DIWAN PLAIN',desc:'خلطة الديوان الأساسية — طحنة تركي متوازنة ومرارة هادية.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p01.jpg',badge:'الأكثر طلبًا',featured:true,available:true,variants:V(180,210)},
  {id:'p02',slug:'diwan-medium',name:'الديوان وسط',nameEn:'AL DIWAN MEDIUM',desc:'تحميص وسط متوازن — حلاوة وقوام ووشّ تركي غني.',roast:'وسط',grind:'تركي ناعم',img:'assets/products/p02.jpg',available:true,variants:V(180,210)},
  {id:'p03',slug:'diwan-dark',name:'الديوان غامق',nameEn:'AL DIWAN DARK',desc:'تحميص غامق — شوكولاتة محمصة ومرارة عميقة لعشاق التقيل.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p03.jpg',available:true,variants:V(180,210)},
  {id:'p04',slug:'diwan-extra',name:'الديوان إكسترا',nameEn:'AL DIWAN EXTRA',desc:'بناية أعلى وتحميصة أعمق — كافيين أوضح ووشّ أتقل.',roast:'غامق',grind:'تركي ناعم',img:'assets/products/p04.jpg',badge:'إصدار ملوكي',featured:true,available:true,variants:V(190,220)},
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
/* CMS: REVIEWS — placeholders صريحة، تُستبدل ببيانات حقيقية */
const REVIEWS = [
  {name:'عميل الديوان',tag:'PLACEHOLDER — يُستبدل',text:'هنا يظهر أول تقييم حقيقي من عملائنا. اربط هذا القسم بالـCMS أو Google Reviews.',stars:5},
  {name:'أهل شبين',tag:'PLACEHOLDER — يُستبدل',text:'مساحة مخصصة لرأي حقيقي موثّق بالاسم والفرع. لا تعرض تقييمات مختلقة.',stars:5},
  {name:'أهل منوف',tag:'PLACEHOLDER — يُستبدل',text:'فعّل الربط مع منصة التقييمات لاحقًا وستظهر البطاقات تلقائيًا بنفس التصميم.',stars:5},
];

const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const EGP=n=>`${n} EGP`;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=matchMedia('(max-width: 640px)').matches;

/* slot image helper: drop an <img> into a .img-ph box; if the file is missing
   it removes itself and the numbered placeholder stays visible. */
/* if a slot image is missing, try .jpg once, then give up and keep the placeholder */
window.onImgErr=function(im){try{const s=im.getAttribute('src')||'';if(!im.dataset.t&&/\.png$/i.test(s)){im.dataset.t='1';im.src=s.replace(/\.png$/i,'.jpg');return;}}catch(e){}im.remove();};
function setPhImg(el,src,label,desc){
 if(!el)return;
 el.dataset.slot=label;
 const sp=el.querySelector('span');if(sp)sp.textContent=label;
 const sm=el.querySelector('small');if(sm)sm.textContent=desc||'';
 let im=el.querySelector(':scope>img');
 if(!im){im=document.createElement('img');im.loading='lazy';el.insertBefore(im,el.firstChild);}
 im.alt=desc||'';im.onerror=()=>window.onImgErr(im);
 if(im.getAttribute('src')!==src)im.src=src;
}
/* صور المكان (15) — موزّعة بعناية حسب المحتوى والاتجاه:
   1 الهيرو (واجهة المحل) | 2-6 مشاهد القصة | 11-15 المجلس | 16-20 حكاية الديوان | 21 البانر */
const SLOT_IMGS={
 1:'assets/gallery/g01.jpg',                                                          // واجهة المحل — الهيرو
 2:'assets/gallery/g04.jpg',3:'assets/gallery/g12.jpg',4:'assets/gallery/g06.jpg',    // مشاهد القصة
 5:'assets/gallery/g03.jpg',6:'assets/gallery/g15.jpg',
 11:'assets/gallery/g09.jpg',12:'assets/gallery/g10.jpg',13:'assets/gallery/g11.jpg', // المجلس
 14:'assets/gallery/g14.jpg',15:'assets/gallery/g08.jpg',
 16:'assets/gallery/g05.jpg',17:'assets/gallery/g02.jpg',18:'assets/gallery/g07.jpg', // حكاية الديوان (بينتو)
 19:'assets/gallery/g13.jpg',20:'assets/gallery/g06.jpg',
 21:'assets/gallery/g01.jpg'};                                                        // البانر (واجهة عريضة)
function bindSlotImgs(){$$('.img-ph[data-slot]').forEach(el=>{const src=SLOT_IMGS[el.dataset.slot];if(src)setPhImg(el,src,el.dataset.slot,el.querySelector('small')?.textContent||'');});}
bindSlotImgs();

/* ---------- 2) LOADER (cinematic sequence) ---------- */
(()=>{const fill=$('#loadfill'),txt=$('#loadtxt'),l=$('#loader');
const steps=['نُحمّص الحكاية...','حبات البن تتجمع...','العبوة تظهر...','أهلًا بيك في الديوان ✦'];
let p=0;const t=setInterval(()=>{p=Math.min(100,p+Math.random()*22);fill.style.width=p+'%';
txt.textContent=steps[Math.min(3,Math.floor(p/28))];
if(p>=100){clearInterval(t);setTimeout(()=>{l.classList.add('done');heroIntro();},450);}},220);})();

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
 {n:'01',k:'SCENE 01 — THE ORIGIN',t:'الأصل',d:'حبة بن واحدة في مساحة مظلمة. الكاميرا تلف حولها، والزخارف العربية تبدأ تظهر من العتمة.'},
 {n:'02',k:'SCENE 02 — THE ROAST',t:'التحميص',d:'إضاءة دافئة ودخان خفيف. الحبات تتحول من الأخضر للبني — ريحة التحميص تملأ المشهد.'},
 {n:'03',k:'SCENE 03 — THE BLEND',t:'الخلطة',d:'حبات مختلفة تدور حول بعضها ثم تتجمع: سادة، محوج، إكسترا — كل خلطة لها شخصية.'},
 {n:'04',k:'SCENE 04 — THE CUP',t:'الفنجان',d:'المشهد يذوب في فنجان: وشّ مظبوط، بخار، ودلة نحاس — لحظة التذوق الأولى.'},
 {n:'05',k:'SCENE 05 — THE PRODUCT',t:'المنتج',d:'تظهر العبوة الحقيقية بزخارفها الذهبية. تذوق أصل القهوة — تسوق الآن.'},
];
(()=>{const dots=$('#sceneDots'),imgs=$$('.story-media .scene-ph');let cur=0;
SCENES.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',s.t);
if(i===0)b.classList.add('on');b.onclick=()=>setScene(i);dots.appendChild(b);});
function setScene(i){cur=i;imgs.forEach((im,k)=>im.classList.toggle('active',k===i));
[...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
$('#sceneNum').textContent=SCENES[i].n;$('#sceneKick').textContent=SCENES[i].k;
$('#sceneTitle').textContent=SCENES[i].t;$('#sceneDesc').textContent=SCENES[i].d;
if(window.gsap&&!reduced)gsap.from('.scene-card',{x:30,opacity:.4,duration:.5,ease:'power2.out'});}
if(window.gsap&&window.ScrollTrigger&&!reduced){gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({trigger:'#storyPin',start:'top 70%',end:'bottom 30%',
onUpdate(self){const i=Math.min(4,Math.floor(self.progress*5));if(i!==cur)setScene(i);}});}
window.setScene=setScene;})();

/* ---------- 6) CONFIGURATOR ---------- */
const cfg={p:PRODUCTS[0],v:0,qty:1};
function renderCfgBlends(){$('#cfgBlends').innerHTML=PRODUCTS.map(p=>
 `<button class="chip-opt ${p.id===cfg.p.id?'on':''}" data-id="${p.id}">${p.name}</button>`).join('');
 $$('#cfgBlends .chip-opt').forEach(b=>b.onclick=()=>{cfg.p=PRODUCTS.find(p=>p.id===b.dataset.id);cfg.v=0;syncCfg();});}
function renderCfgVariants(){$('#cfgWeights').innerHTML=cfg.p.variants.map((v,i)=>
 `<button class="chip-opt ${i===cfg.v?'on':''}" data-i="${i}">${v.label} — ${v.price} EGP</button>`).join('');
 $$('#cfgWeights .chip-opt').forEach(b=>b.onclick=()=>{cfg.v=+b.dataset.i;syncCfg();});}
function syncCfg(){const v=cfg.p.variants[cfg.v]||cfg.p.variants[0];cfg.v=cfg.p.variants.indexOf(v);
 $('#cfgName').textContent=cfg.p.name;$('#cfgDesc').textContent=cfg.p.desc;
 $('#cfgRoast').textContent=cfg.p.roast;$('#cfgGrind').textContent=cfg.p.grind;
 $('#cfgPrice').textContent=EGP(v.price);$('#cfgOld').textContent='';
 $('#qVal').textContent=cfg.qty;
 setPhImg($('#cfgSlot'),cfg.p.img,cfg.p.name,cfg.p.name);
 renderCfgBlends();renderCfgVariants();}
$('#qPlus').onclick=()=>{cfg.qty=Math.min(20,cfg.qty+1);$('#qVal').textContent=cfg.qty;};
$('#qMinus').onclick=()=>{cfg.qty=Math.max(1,cfg.qty-1);$('#qVal').textContent=cfg.qty;};
$('#cfgAdd').onclick=()=>{addToCart(cfg.p.id,cfg.v,cfg.qty);};
$('#cfgView').onclick=()=>openQV(cfg.p.id);
syncCfg();

/* ---------- 7) ROAST LAB ---------- */
$$('.roast-card').forEach(c=>c.onclick=()=>{
 $$('.roast-card').forEach(x=>x.classList.remove('on'));c.classList.add('on');
 $('#roast').dataset.roast=c.dataset.r;drawRadar(c.dataset.r);syncRoastSlider(c.dataset.r);
 toast(c.dataset.r==='light'?'تحميص فاتح — زاهي وخفيف ☀':c.dataset.r==='medium'?'تحميص وسط — توازن الديوان ⚖':'تحميص غامق — تقيل وفاخر 🌙');});

/* ---------- 8) PRODUCT GRID + REVIEWS ---------- */
function renderGrid(){$('#productGrid').innerHTML=PRODUCTS.map(p=>{const min=Math.min(...p.variants.map(v=>v.price));return `
 <article class="pcard">
  <div class="ph img-ph" data-slot="${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="onImgErr(this)"><span>${p.name}</span><small>صورة ${p.name}</small></div>${p.badge?`<span class="badge">${p.badge}</span>`:''}
  <div class="pb"><h3>${p.name} <small style="color:#a08c5a" class="en">${p.nameEn}</small></h3>
   <p>${p.desc}</p>
   <div class="pvars">${p.variants.map(v=>`<span>${v.label} <b>${v.price} EGP</b></span>`).join('')}</div>
   <div class="prow"><span class="price">من ${min} EGP</span><small style="color:#8a7c55">${UNIT}</small></div>
   <div class="card-actions">
    <button class="mini-btn add" data-add="${p.id}">+ سلة</button>
    <button class="mini-btn" data-qv="${p.id}">عرض</button>
   </div></div></article>`;}).join('');
 $$('#productGrid [data-add]').forEach(b=>b.onclick=()=>addToCart(b.dataset.add,0,1));
 $$('#productGrid [data-qv]').forEach(b=>b.onclick=()=>openQV(b.dataset.qv));}
function renderReviews(){$('#revGrid').innerHTML=REVIEWS.map(r=>`
 <div class="glass rev"><div class="stars">${'★'.repeat(r.stars)}</div>
 <p style="line-height:2">"${r.text}"</p>
 <b>${r.name}</b><br><small style="color:var(--gold)">${r.tag}</small></div>`).join('');}
renderGrid();renderReviews();

/* ---------- 9) CART STORE (persistent) ---------- */
const store={get(){try{return JSON.parse(localStorage.getItem('aldiwan_cart_v1'))||[]}catch(e){return[]}},
 set(v){localStorage.setItem('aldiwan_cart_v1',JSON.stringify(v));renderCart();}};
let cart=store.get();
function addToCart(pid,vi=0,qty=1){const p=PRODUCTS.find(x=>x.id===pid);if(!p||!p.available)return;
 const v=p.variants[vi]||p.variants[0];vi=p.variants.indexOf(v);
 const key=pid+'_'+v.k;const ex=cart.find(i=>i.key===key);
 if(ex)ex.qty=Math.min(20,ex.qty+qty);else cart.push({key,pid,vi,qty});
 store.set(cart);toast(`اتضافت للسلة: ${p.name} ${v.label} ✓`);openSheet('#cartSheet');}
function renderCart(){const box=$('#cartItems');
 if(!cart.length){box.innerHTML=`<div class="empty">سلتك فاضية...<br><b>ريحتها بن؟ يبقى لازم تتملي ☕</b><br><a href="#shop" class="btn btn-gold btn-sm" style="margin-top:12px" onclick="closeAll()">اكتشف البن</a></div>`;}
 else box.innerHTML=cart.map((i,idx)=>{const p=PRODUCTS.find(x=>x.id===i.pid),v=p.variants[i.vi]||p.variants[0];return `
  <div class="citem"><div class="citem-thumb img-ph" data-slot="${p.name}"><img src="${p.img}" alt="${p.name}" onerror="onImgErr(this)"><span>${p.name}</span></div>
   <div><b>${p.name} — ${v.label}</b><small>${v.price} EGP × ${i.qty} = <b>${v.price*i.qty}</b></small>
    <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
     <button class="mini-btn" style="padding:4px 12px" onclick="chQty(${idx},-1)">−</button><b>${i.qty}</b>
     <button class="mini-btn" style="padding:4px 12px" onclick="chQty(${idx},1)">+</button>
     <button class="rm" onclick="rmItem(${idx})">حذف</button></div></div>
   <b>${v.price*i.qty}</b></div>`;}).join('');
 const total=cart.reduce((s,i)=>{const p=PRODUCTS.find(x=>x.id===i.pid),v=p.variants[i.vi]||p.variants[0];return s+v.price*i.qty;},0);
 const count=cart.reduce((s,i)=>s+i.qty,0);
 $('#cartTotal').textContent=EGP(total);$('#cartCount').textContent=count;$('#mCount').textContent=count;}
window.chQty=(idx,d)=>{cart[idx].qty=Math.max(1,Math.min(20,cart[idx].qty+d));store.set(cart);};
window.rmItem=idx=>{cart.splice(idx,1);store.set(cart);};
window.closeAll=closeAll;
renderCart();

/* ---------- 10) QUICK VIEW ---------- */
let qv={pid:'p01',vi:0};
function openQV(pid){const p=PRODUCTS.find(x=>x.id===pid);qv={pid,vi:0};
 setPhImg($('#qvSlot'),p.img,p.name,p.name);
 $('#qvName').textContent=p.name;$('#qvDesc').textContent=p.desc;
 $('#qvRoast').textContent=p.roast;
 $('#qvWeights').innerHTML=p.variants.map((v,i)=>`<button class="chip-opt ${i===0?'on':''}" data-i="${i}">${v.label} — ${v.price} EGP</button>`).join('');
 $$('#qvWeights .chip-opt').forEach(b=>b.onclick=()=>{qv.vi=+b.dataset.i;
  $$('#qvWeights .chip-opt').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  $('#qvPrice').textContent=EGP(p.variants[qv.vi].price);});
 $('#qvPrice').textContent=EGP(p.variants[0].price);
 $('#qvModal').classList.add('show');scrim.classList.add('show');}
window.openQV=openQV;
$('#qvAdd').onclick=()=>{addToCart(qv.pid,qv.vi,1);closeAll();setTimeout(()=>openSheet('#cartSheet'),150);};

/* ---------- 11) CHECKOUT (steps) ---------- */
let coStep=1,ship={};
$('#goCheckout').onclick=()=>{if(!cart.length){toast('سلتك فاضية — اختار خلطتك الأول ☕');return;}
 closeAll();coStep=1;renderCO();$('#coModal').classList.add('show');scrim.classList.add('show');};
function renderCO(){$$('#coModal .steps span').forEach(s=>s.classList.toggle('on',+s.dataset.s===coStep));
 const total=cart.reduce((s,i)=>{const p=PRODUCTS.find(x=>x.id===i.pid),v=p.variants[i.vi]||p.variants[0];return s+v.price*i.qty;},0);
 const shipCost=total>=400?0:30;
 if(coStep===1)$('#coBody').innerHTML=`${cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.pid),v=p.variants[i.vi]||p.variants[0];
  return `<div class="brow">☕<span><b>${p.name} ${v.label}</b> × ${i.qty} — <b>${v.price*i.qty} EGP</b></span></div>`;}).join('')}
  <div class="total-row"><span>المجموع + شحن ${shipCost?shipCost+' EGP':'مجاني 🎉'}</span><span>${total+shipCost} EGP</span></div>
  <button class="btn btn-gold" style="width:100%;justify-content:center" onclick="coGo(2)">التالي: بيانات التوصيل ←</button>
  <small style="color:var(--muted)">شحن مجاني فوق 400 EGP • الدفع كاش عند الاستلام</small>`;
 if(coStep===2)$('#coBody').innerHTML=`<form id="shipF">
  <div class="field"><label>الاسم بالكامل</label><input required id="fName" placeholder="مثال: أحمد الديواني"></div>
  <div class="field"><label>الموبايل</label><input required id="fPhone" inputmode="tel" pattern="[0-9+ ]{8,15}" placeholder="01xxxxxxxxx"></div>
  <div class="field"><label>المدينة</label><select id="fCity"><option>شبين الكوم</option><option>منوف</option><option>القاهرة</option><option>أخرى (شحن محافظات)</option></select></div>
  <div class="field"><label>العنوان</label><input required id="fAddr" placeholder="شارع / علامة مميزة"></div>
  <div class="field"><label>ملاحظات (الطحنة / التحويجة)</label><input id="fNote" placeholder="اختياري"></div>
  <div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" onclick="coGo(1)">→ رجوع</button>
  <button class="btn btn-gold" style="flex:1;justify-content:center">مراجعة الطلب ←</button></div></form>`;
 if(coStep===2)setTimeout(()=>{const f=$('#shipF');if(f)f.onsubmit=e=>{e.preventDefault();
  ship={name:$('#fName').value,phone:$('#fPhone').value,city:$('#fCity').value,addr:$('#fAddr').value,note:$('#fNote').value};coGo(3);};},50);
 if(coStep===3)$('#coBody').innerHTML=`<div class="brow">👤<span>${ship.name} — <span dir="ltr">${ship.phone}</span></span></div>
  <div class="brow">📍<span>${ship.city} — ${ship.addr}</span></div>
  <div class="brow">💵<span>الدفع عند الاستلام — الإجمالي <b>${total+shipCost} EGP</b></span></div>
  <div style="display:flex;gap:10px;margin-top:14px"><button class="btn btn-ghost" onclick="coGo(2)">→ تعديل</button>
  <button class="btn btn-gold" style="flex:1;justify-content:center" onclick="placeOrder(${total+shipCost})">تأكيد الطلب 🎉</button></div>`;}
window.coGo=n=>{coStep=n;renderCO();};
window.placeOrder=total=>{const ord={no:'DW-'+Date.now().toString().slice(-6),items:cart,total,ship,at:new Date().toISOString()};
 try{const all=JSON.parse(localStorage.getItem('aldiwan_orders_v1'))||[];all.push(ord);
 localStorage.setItem('aldiwan_orders_v1',JSON.stringify(all));}catch(e){}
 cart=[];store.set(cart);$('#coBody').innerHTML=`<div class="center" style="padding:20px">
  <div style="font-size:3rem">🎉☕</div><h3>طلبك اتسجل يا ${ship.name.split(' ')[0]||'بطل'}!</h3>
  <p class="lead">رقم الطلب <b dir="ltr">${ord.no}</b> — هنتصل بيك للتأكيد، والبن هيوصلك مطحون طازج.</p>
  <button class="btn btn-gold" onclick="closeAll()" style="justify-content:center">تمام — رجوع للمتجر</button></div>`;};

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
 const belts=[$('.marquee-track'),$('.rev-track')].filter(Boolean);
 const base=[18,30];
 (function tickV(){const y=scrollY;vel+=((y-lastY)-vel)*.15;lastY=y;
  const sk=Math.max(-7,Math.min(7,vel*.3)).toFixed(2);
  for(const d of heads)d.style.transform=`skewX(${sk}deg)`;
  const boost=1+Math.min(3,Math.abs(vel)/45);
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
