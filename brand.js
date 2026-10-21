/* ================================================================
brand.js — ملف البراند الوحيد. لأي مشروع جديد:
انسخ فولدر template-core كاملًا، وعدّل هذا الملف فقط
( + حط صورك مكان الأرقام 1-21 ) — والموقع يتلون ويتسمى.
================================================================ */
window.BRAND = {
  name: 'اسم البراند',
  tagline: 'سلوجان البراند',
  taglineEn: 'BRAND · TAGLINE',
  colors: {
    bg: '#141210',       // الخلفية الأساسية (بدل الأخضر/الإسبريسو)
    surface: '#1e1a16',  // الأسطح والكروت الغامقة
    gold: '#d8a24a',     // اللون المميز
    goldLight: '#f2ddac',
    cream: '#f6efdd',
    muted: '#b3a888',
  },
  contact: {
    phone: '+20 100 000 0000',
    email: 'hello@brand.com',
    maps: '#',            // رابط اللوكيشن
    instagram: '#',
    facebook: '#',
  },
  // المنتجات (نفس شكل الديوان — id/slug/name/weights/slot)
  products: [
    {id:'d1',slug:'item-1',name:'الصنف الأول',nameEn:'ITEM ONE',desc:'وصف مختصر للصنف الأول.',roast:'—',grind:'—',slot:7,badge:'الأكثر طلبًا',featured:true,available:true,
     weights:[{g:250,price:100},{g:500,price:190,old:210}]},
    {id:'d2',slug:'item-2',name:'الصنف الثاني',nameEn:'ITEM TWO',desc:'وصف مختصر للصنف الثاني.',roast:'—',grind:'—',slot:8,featured:true,available:true,
     weights:[{g:250,price:120},{g:500,price:230}]},
    {id:'d3',slug:'item-3',name:'الصنف الثالث',nameEn:'ITEM THREE',desc:'وصف مختصر للصنف الثالث.',roast:'—',grind:'—',slot:9,badge:'جديد',featured:true,available:true,
     weights:[{g:250,price:150},{g:500,price:290}]},
  ],
};

(function () {
  const B = window.BRAND, C = B.colors, st = document.documentElement.style;
  document.title = B.name + ' — ' + B.tagline;
  st.setProperty('--green-950', C.bg);
  st.setProperty('--green-900', C.surface);
  st.setProperty('--green-800', C.surface);
  st.setProperty('--green-700', C.gold);
  st.setProperty('--gold', C.gold);
  st.setProperty('--gold-light', C.goldLight);
  st.setProperty('--cream', C.cream);
  st.setProperty('--ivory', C.cream);
  st.setProperty('--muted', C.muted);
  document.querySelectorAll('.brand b').forEach(e => e.textContent = B.name);
})();
