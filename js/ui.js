/* ================================================================
ui.js — التجارة والواجهة: المنتجات، السلة، طلب واتساب حقيقي،
الكويز، التابات، المواسم. السلة محفوظة محليًا؛ إتمام الطلب
يرسل تفاصيله لواتساب الفرع (01028593440) — خلفية حقيقية
بدون خادم، قابلة للاستبدال بـ API لاحقًا بنفس الشكل.
================================================================ */
(function () {
  'use strict';
  const C = window.DIWAN;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const EGP = n => (n === null || n === undefined) ? 'يُحدد عند التأكيد' : n + ' جنيه';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = n => 'https://wa.me/' + n;

  /* ---------- أدوات عامة ---------- */
  window.toast = function (msg) {
    const box = $('#toasts'), t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg; box.appendChild(t);
    setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 400); }, 2600);
  };
  const scrim = $('#scrim');
  window.closeAll = function () {
    $$('.sheet.open').forEach(s => s.classList.remove('open'));
    $$('.modal.show').forEach(m => m.classList.remove('show'));
    scrim.classList.remove('show'); document.body.style.overflow = '';
  };
  window.openSheet = function (id) { $(id).classList.add('open'); scrim.classList.add('show'); document.body.style.overflow = 'hidden'; };
  scrim.addEventListener('click', closeAll);
  $$('[data-close]').forEach(b => b.addEventListener('click', closeAll));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  $('#openMenu').addEventListener('click', () => openSheet('#menuSheet'));
  $('#openCart').addEventListener('click', () => openSheet('#cartSheet'));
  $('#mCart').addEventListener('click', () => openSheet('#cartSheet'));
  $$('#menuSheet a').forEach(a => a.addEventListener('click', closeAll));

  /* ---------- الكونفيجريتور ---------- */
  const cfg = { p: C.products[0], w: 0, qty: 1 };
  window.cfgPick = function (id) {
    const found = C.products.find(x => x.id === id); if (!found) return;
    cfg.p = found; cfg.w = 0; syncCfg();
    const sec = $('#shop'); if (sec) sec.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  function syncCfg() {
    const w = cfg.p.weights[cfg.w];
    $('#cfgName').textContent = cfg.p.name;
    $('#cfgDesc').textContent = cfg.p.desc;
    $('#cfgRoast').textContent = cfg.p.roast;
    $('#cfgPrice').textContent = EGP(w.price);
    $('#cfgOld').textContent = (w.price !== null) ? 'شامل الضريبة' : 'متوفر في الفرع';
    $('#qVal').textContent = cfg.qty;
    const img = $('#cfgImg');
    img.style.opacity = 0;
    setTimeout(() => { img.src = cfg.p.img; img.alt = 'عبوة ' + cfg.p.name; img.onload = () => { img.style.opacity = 1; }; }, 180);
    $('#cfgBlends').innerHTML = C.products.map(x =>
      '<button class="chip-opt' + (x.id === cfg.p.id ? ' on' : '') + '" data-id="' + x.id + '">' + x.name + '</button>').join('');
    $$('#cfgBlends .chip-opt').forEach(b => b.addEventListener('click', () => { cfg.p = C.products.find(x => x.id === b.dataset.id); cfg.w = 0; syncCfg(); }));
    $('#cfgWeights').innerHTML = cfg.p.weights.map((x, i) =>
      '<button class="chip-opt' + (i === cfg.w ? ' on' : '') + '" data-i="' + i + '">' + x.g + ' جم — ' + EGP(x.price) + '</button>').join('');
    $$('#cfgWeights .chip-opt').forEach(b => b.addEventListener('click', () => { cfg.w = +b.dataset.i; syncCfg(); }));
  }
  $('#qPlus').addEventListener('click', () => { cfg.qty = Math.min(20, cfg.qty + 1); $('#qVal').textContent = cfg.qty; });
  $('#qMinus').addEventListener('click', () => { cfg.qty = Math.max(1, cfg.qty - 1); $('#qVal').textContent = cfg.qty; });
  $('#cfgAdd').addEventListener('click', () => addToCart(cfg.p.id, cfg.w, cfg.qty));
  $('#cfgView').addEventListener('click', () => openQV(cfg.p.id));
  // ميلان العبوة مع الماوس
  const st = $('#packStage');
  if (st && !reduced && matchMedia('(hover:hover)').matches) {
    addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      st.style.transform = 'rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 10) + 'deg)';
    }, { passive: true });
  }
  syncCfg();

  /* ---------- شبكة المنتجات ---------- */
  function renderGrid() {
    $('#productGrid').innerHTML = C.products.map(x => {
      const w0 = x.weights[0];
      return '<article class="pcard"><div class="ph"><img src="' + x.img + '" alt="' + x.name + '" loading="lazy">' +
        (x.badge ? '<span class="badge">' + x.badge + '</span>' : '') + '</div><div class="pb"><h3>' + x.name + '</h3>' +
        '<p>' + x.desc + '</p><div class="prow"><span class="price">' + (w0.price !== null ? w0.price + ' جنيه' : 'يُحدد عند التأكيد') + '</span></div>' +
        '<div class="card-actions"><button class="mini-btn add" data-add="' + x.id + '">أضف للسلة</button>' +
        '<button class="mini-btn" data-qv="' + x.id + '">عرض</button></div></div></article>';
    }).join('');
    $$('#productGrid [data-add]').forEach(b => b.addEventListener('click', () => addToCart(b.dataset.add, 0, 1)));
    $$('#productGrid [data-qv]').forEach(b => b.addEventListener('click', () => openQV(b.dataset.qv)));
  }
  renderGrid();

  /* ---------- عرض سريع (داكن) ---------- */
  let qv = { pid: 'mahwag', wi: 0 };
  window.openQV = function (pid) {
    const x = C.products.find(v => v.id === pid); qv = { pid, wi: 0 };
    $('#qvImg').src = x.img; $('#qvName').textContent = x.name; $('#qvDesc').textContent = x.desc;
    $('#qvRoast').textContent = x.roast;
    $('#qvWeights').innerHTML = x.weights.map((w, i) =>
      '<button class="chip-opt' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + w.g + ' جم — ' + EGP(w.price) + '</button>').join('');
    $$('#qvWeights .chip-opt').forEach(b => b.addEventListener('click', () => {
      qv.wi = +b.dataset.i;
      $$('#qvWeights .chip-opt').forEach(o => o.classList.remove('on')); b.classList.add('on');
      $('#qvPrice').textContent = EGP(x.weights[qv.wi].price);
    }));
    $('#qvPrice').textContent = EGP(x.weights[0].price);
    $('#qvModal').classList.add('show'); scrim.classList.add('show');
  };
  $('#qvAdd').addEventListener('click', () => { addToCart(qv.pid, qv.wi, 1); });

  /* ---------- السلة (محفوظة) ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('aldiwan_cart_v1')) || []; } catch (e) { return []; } },
    set(v) { localStorage.setItem('aldiwan_cart_v1', JSON.stringify(v)); renderCart(); }
  };
  let cart = store.get();
  window.addToCart = function (pid, wi, qty) {
    const x = C.products.find(v => v.id === pid); if (!x) return;
    const key = pid + '_' + x.weights[wi || 0].g;
    const ex = cart.find(i => i.key === key);
    if (ex) ex.qty = Math.min(20, ex.qty + (qty || 1)); else cart.push({ key, pid, wi: wi || 0, qty: qty || 1 });
    store.set(cart); toast('اتضافت للسلة: ' + x.name); openSheet('#cartSheet');
  };
  window.chQty = function (idx, d) { cart[idx].qty = Math.max(1, Math.min(20, cart[idx].qty + d)); store.set(cart); };
  window.rmItem = function (idx) { cart.splice(idx, 1); store.set(cart); };
  function cartTotal() {
    return cart.reduce((s, i) => { const x = C.products.find(v => v.id === i.pid); const pr = x.weights[i.wi].price; return s + (pr !== null ? pr * i.qty : 0); }, 0);
  }
  function cartHasTodo() {
    return cart.some(i => { const x = C.products.find(v => v.id === i.pid); return x.weights[i.wi].price === null; });
  }
  function renderCart() {
    const box = $('#cartItems');
    if (!cart.length) {
      box.innerHTML = '<div class="empty">سلتك فاضية...<br><b>ريحة البن بتناديك</b><br><a href="#shop" class="btn btn-gold btn-sm" style="margin-top:12px" onclick="closeAll()">اكتشف البن</a></div>';
    } else {
      box.innerHTML = cart.map((i, idx) => {
        const x = C.products.find(v => v.id === i.pid), w = x.weights[i.wi];
        const line = w.price !== null ? (w.price * i.qty) + ' جنيه' : 'يُحدد عند التأكيد';
        return '<div class="citem"><img src="' + x.img + '" alt="' + x.name + '"><div><b>' + x.name + ' — ' + w.g + ' جم</b>' +
          '<small>' + line + '</small><div style="display:flex;gap:8px;align-items:center;margin-top:6px">' +
          '<button class="mini-btn" style="padding:4px 12px" onclick="chQty(' + idx + ',-1)">−</button><b>' + i.qty + '</b>' +
          '<button class="mini-btn" style="padding:4px 12px" onclick="chQty(' + idx + ',1)">+</button>' +
          '<button class="rm" onclick="rmItem(' + idx + ')">حذف</button></div></div><b>' + line + '</b></div>';
      }).join('');
    }
    const t = cartTotal(), n = cart.reduce((s, i) => s + i.qty, 0);
    $('#cartTotal').textContent = t ? t + ' جنيه' + (cartHasTodo() ? ' + أصناف بسعر الفرع' : '') : (cart.length ? 'يُحدد عند التأكيد' : '0 جنيه');
    $('#cartCount').textContent = n; $('#mCount').textContent = n;
  }
  renderCart();

  /* ---------- إتمام الطلب عبر واتساب (خلفية حقيقية) ---------- */
  let coStep = 1, ship = {};
  $('#goCheckout').addEventListener('click', () => {
    if (!cart.length) { toast('سلتك فاضية — اختار خلطتك الأول'); return; }
    closeAll(); coStep = 1; renderCO();
    $('#coModal').classList.add('show'); scrim.classList.add('show');
  });
  window.coGo = function (n) { coStep = n; renderCO(); };
  function renderCO() {
    $$('#coModal .steps span').forEach(s => s.classList.toggle('on', +s.dataset.s === coStep));
    const t = cartTotal();
    if (coStep === 1) {
      $('#coBody').innerHTML = cart.map(i => {
        const x = C.products.find(v => v.id === i.pid), w = x.weights[i.wi];
        return '<div class="brow"><span><b>' + x.name + ' ' + w.g + ' جم</b> × ' + i.qty + ' — <b>' + EGP(w.price === null ? null : w.price * i.qty) + '</b></span></div>';
      }).join('') +
        '<div class="total-row"><span>الإجمالي</span><span>' + (t ? t + ' جنيه' : 'يُحدد عند التأكيد') + '</span></div>' +
        '<button class="btn btn-gold" style="width:100%;justify-content:center" onclick="coGo(2)">التالي: بيانات التوصيل</button>' +
        '<small style="color:var(--muted)">الدفع عند الاستلام — والتأكيد على واتساب</small>';
    }
    if (coStep === 2) {
      $('#coBody').innerHTML = '<form id="shipF">' +
        '<div class="field"><label>الاسم بالكامل</label><input required id="fName" placeholder="مثال: أحمد الديواني"></div>' +
        '<div class="field"><label>الموبايل</label><input required id="fPhone" inputmode="tel" pattern="[0-9+ ]{8,15}" placeholder="01xxxxxxxxx"></div>' +
        '<div class="field"><label>العنوان</label><input required id="fAddr" placeholder="المدينة / الشارع / علامة مميزة"></div>' +
        '<div class="field"><label>ملاحظات (اختياري)</label><input id="fNote" placeholder="الطحنة أو التحويجة"></div>' +
        '<div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" onclick="coGo(1)">رجوع</button>' +
        '<button class="btn btn-gold" style="flex:1;justify-content:center">تأكيد عبر واتساب</button></div></form>';
      setTimeout(() => {
        const f = $('#shipF');
        if (f) f.onsubmit = e => { e.preventDefault(); placeOrder(); };
      }, 50);
    }
  }
  window.placeOrder = function () {
    ship = { name: $('#fName').value, phone: $('#fPhone').value, addr: $('#fAddr').value, note: $('#fNote').value };
    const lines = cart.map(i => {
      const x = C.products.find(v => v.id === i.pid), w = x.weights[i.wi];
      return '• ' + x.name + ' ' + w.g + ' جم × ' + i.qty + (w.price !== null ? ' (' + (w.price * i.qty) + ' ج)' : ' (السعر عند التأكيد)');
    });
    const msg = 'طلب جديد من موقع الديوان:%0A' + lines.join('%0A') +
      '%0Aالاسم: ' + encodeURIComponent(ship.name) +
      '%0Aموبايل: ' + encodeURIComponent(ship.phone) +
      '%0Aالعنوان: ' + encodeURIComponent(ship.addr) +
      (ship.note ? '%0Aملاحظات: ' + encodeURIComponent(ship.note) : '');
    cart = []; store.set(cart); closeAll();
    toast('طلبك اتجهز — كمّل إرساله على واتساب');
    open(WA(C.site.whatsapp) + '?text=' + msg, '_blank');
  };

  /* ---------- معمل التحميص + رادار النكهة ---------- */
  const radar = $('#radar');
  function drawRadar(key) {
    if (!radar) return;
    const r = C.roasts[key], ctx = radar.getContext('2d'), W = radar.width, H = radar.height, cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 30;
    const axes = [['الحموضة', r.acid], ['الحلاوة', r.sweet], ['المرارة', r.bitter], ['القوام', r.body]];
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(228,200,127,.25)'; ctx.fillStyle = '#cfc5a8'; ctx.font = '13px Cairo'; ctx.textAlign = 'center';
    [0.33, 0.66, 1].forEach(f => {
      ctx.beginPath();
      axes.forEach((a, i) => { const ang = -Math.PI / 2 + i * Math.PI / 2; const x = cx + Math.cos(ang) * R * f, y = cy + Math.sin(ang) * R * f; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.closePath(); ctx.stroke();
    });
    ctx.beginPath();
    axes.forEach((a, i) => { const ang = -Math.PI / 2 + i * Math.PI / 2; const x = cx + Math.cos(ang) * R * a[1], y = cy + Math.sin(ang) * R * a[1]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath(); ctx.fillStyle = 'rgba(201,162,39,.35)'; ctx.fill();
    ctx.strokeStyle = '#e4c87f'; ctx.lineWidth = 2; ctx.stroke();
    axes.forEach((a, i) => { const ang = -Math.PI / 2 + i * Math.PI / 2; ctx.fillStyle = '#f6efdd'; ctx.fillText(a[0], cx + Math.cos(ang) * (R + 20), cy + Math.sin(ang) * (R + 20)); });
    $('#roastDesc').textContent = r.desc;
    window.DIWAN_GL.roastMix = key === 'light' ? 0.25 : key === 'medium' ? 0.55 : 0.85;
  }
  $$('.roast-card').forEach(c => c.addEventListener('click', () => {
    $$('.roast-card').forEach(x => x.classList.remove('on')); c.classList.add('on');
    $('#roast').dataset.roast = c.dataset.r; drawRadar(c.dataset.r);
  }));
  const slider = $('#roastRange');
  if (slider) slider.addEventListener('input', () => {
    const keys = ['light', 'medium', 'dark'], k = keys[+slider.value];
    $$('.roast-card').forEach(x => x.classList.toggle('on', x.dataset.r === k));
    $('#roast').dataset.roast = k; drawRadar(k);
  });
  drawRadar('medium');

  /* ---------- الكويز: مزاجك إيه؟ ---------- */
  const quiz = { a: null, b: null, c: null };
  $$('#quiz [data-q] button').forEach(b => b.addEventListener('click', () => {
    const q = b.parentElement.dataset.q;
    quiz[q] = b.dataset.v;
    Array.from(b.parentElement.children).forEach(x => x.classList.remove('on')); b.classList.add('on');
    if (quiz.a && quiz.b && quiz.c) showQuizResult();
  }));
  function showQuizResult() {
    let id = 'mahwag';
    if (quiz.a === 'calm' && quiz.b === 'plain') id = quiz.c === 'filter' ? 'fateh' : 'sada';
    if (quiz.a === 'strong' && quiz.c === 'turkish') id = quiz.b === 'spiced' ? 'mahwag' : 'espresso';
    if (quiz.a === 'strong' && quiz.c === 'filter') id = 'espresso';
    const x = C.products.find(v => v.id === id);
    $('#quizResult').innerHTML = 'ترشيح الديوان ليك: <b>' + x.name + '</b> — ' + x.desc;
    $('#quizGo').style.display = 'inline-flex';
    $('#quizGo').onclick = () => cfgPick(id);
  }

  /* ---------- منيو الكافيه: تابات ---------- */
  const tabs = { hot: 'ساخن', cold: 'بارد', special: 'مختصة', sweet: 'حلويات' };
  function renderCafe(k) {
    $('#cafeList').innerHTML = C.cafe[k].map(it =>
      '<div class="cafe-row"><span>' + it[0] + '</span><span class="dots"></span><b>' + it[1] + ' جنيه</b></div>').join('');
    $$('#cafeTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === k));
  }
  $$('#cafeTabs button').forEach(b => b.addEventListener('click', () => renderCafe(b.dataset.t)));
  renderCafe('hot');

  /* ---------- الهدايا + المواسم ---------- */
  $('#giftBtn').addEventListener('click', () => {
    open(WA(C.site.whatsapp) + '?text=' + encodeURIComponent('أهلًا الديوان — عايز أطلب علبة هدية. ممكن التفاصيل والأسعار؟'), '_blank');
  });
  $('#seasonBtn').addEventListener('click', function () {
    const on = document.body.classList.toggle('ramadan');
    this.textContent = on ? 'رجّع الثيم الأساسي' : 'فعّل ثيم رمضان';
    toast(on ? 'رمضان كريم — الثيم اتفعل' : 'رجعنا للثيم الأساسي');
  });

  /* ---------- الفروع: واتساب + اتصال ---------- */
  $('#branchGrid').innerHTML = C.branches.map(b =>
    '<div class="glass branch"><span class="kick">فرع ' + b.city + '</span><h3>' + b.city + '</h3>' +
    '<div class="brow"><svg class="ic"><use href="#i-pin"/></svg><span>' + b.addr + '</span></div>' +
    '<div class="brow"><svg class="ic"><use href="#i-phone"/></svg><a dir="ltr" href="tel:+2' + C.site.phone + '">' + C.site.phone + '</a></div>' +
    '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
    '<a class="btn btn-gold btn-sm" target="_blank" rel="noopener" href="' + b.maps + '">الاتجاهات</a>' +
    '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="' + WA(C.site.whatsapp) + '?text=' + encodeURIComponent('أهلًا — عايز أطلب من فرع ' + b.city) + '">اطلب واتساب</a>' +
    '</div></div>').join('');

  /* ---------- الآراء: قريبًا فقط ---------- */
  const cards = [0, 1, 2].map(() =>
    '<div class="glass rev"><div class="stars">★★★★★</div><p>آراء عملائنا من فيسبوك وجوجل هتظهر هنا.</p><b>قريبًا</b></div>');
  $('#revGrid').innerHTML = cards.concat(cards).join(''); // نسختان لحلقة marquee seamless

  /* ---------- النشرة + التواصل ---------- */
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    try { localStorage.setItem('aldiwan_news', $('#newsMail').value); } catch (err) {}
    toast('اشتراكك اتسجل — أهلًا بيك في الديوان'); e.target.reset();
  });
  $$('[data-phone]').forEach(a => { a.textContent = C.site.phone; a.href = 'tel:+2' + C.site.phone; });
  $$('[data-mail]').forEach(a => { a.textContent = C.site.email; a.href = 'mailto:' + C.site.email; });
  $$('[data-wa]').forEach(a => { a.href = WA(C.site.whatsapp) + '?text=' + encodeURIComponent('أهلًا الديوان — عايز أطلب بن'); });
})();
