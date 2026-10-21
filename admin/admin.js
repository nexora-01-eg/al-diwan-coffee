const API_BASE = window.location.origin.includes('8808') ? '/api/v1' : 'http://127.0.0.1:8808/api/v1';
let currentFilter = '';
let selectedOrderId = null;

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2600);
}

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

async function checkSession() {
  try {
    const data = await api('/admin/auth/me');
    showAdminApp(data.admin);
  } catch {
    showLoginPage();
  }
}

function showLoginPage() {
  $('#loginPage').style.display = 'flex';
  $('#adminApp').style.display = 'none';
}

function showAdminApp(admin) {
  $('#loginPage').style.display = 'none';
  $('#adminApp').style.display = 'flex';
  $('#adminEmail').textContent = admin.email;
  loadOrders();
}

$('#loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  const btn = $('#loginBtn');
  const errEl = $('#loginError');
  btn.disabled = true;
  btn.textContent = 'جاري الدخول...';
  errEl.style.display = 'none';
  try {
    const data = await api('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    showAdminApp(data.user);
  } catch (err) {
    errEl.textContent = err.message === 'invalid_credentials' ? 'بيانات الدخول غير صحيحة' : 'خطأ في الدخول';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'تسجيل الدخول';
  }
};

$('#logoutBtn').onclick = async () => {
  try { await api('/admin/auth/logout', { method: 'POST' }); } catch {}
  document.cookie = 'aldiwan_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  showLoginPage();
};

$$('.chip-opt').forEach(btn => {
  btn.onclick = () => {
    $$('.chip-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.status;
    loadOrders();
  };
});

async function loadOrders() {
  const list = $('#ordersList');
  list.innerHTML = '<div class="loading">جاري التحميل...</div>';
  try {
    const params = currentFilter ? `?status=${currentFilter}` : '';
    const data = await api(`/admin/orders${params}&limit=50&offset=0`);
    if (!data.items.length) {
      list.innerHTML = '<div class="empty">لا توجد طلبات</div>';
      return;
    }
    list.innerHTML = data.items.map(o => `
      <div class="order-card" data-id="${o.id}">
        <div class="order-ref">${o.reference}</div>
        <div class="order-meta">${o.customer_name} — <span dir="ltr">${o.phone}</span></div>
        <div class="order-meta">${o.area} — ${(o.total_minor / 100).toLocaleString('en-EG')} EGP</div>
        <span class="order-status status-${o.status}">${statusLabel(o.status)}</span>
      </div>
    `).join('');
    $$('.order-card').forEach(card => {
      card.onclick = () => selectOrder(card.dataset.id, card);
    });
  } catch (err) {
    list.innerHTML = `<div class="empty">خطأ: ${err.message}</div>`;
  }
}

function statusLabel(s) {
  const labels = {
    pending_confirmation: 'قيد التأكيد',
    confirmed: 'مؤكد',
    preparing: 'جاري التحضير',
    out_for_delivery: 'خارج للتوصيل',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };
  return labels[s] || s;
}

async function selectOrder(id, card) {
  $$('.order-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedOrderId = id;
  const detail = $('#orderDetail');
  detail.style.display = 'block';
  detail.innerHTML = '<div class="loading">جاري التحميل...</div>';
  try {
    const data = await api(`/admin/orders/${id}`);
    renderOrderDetail(data);
  } catch (err) {
    detail.innerHTML = `<div class="empty">خطأ: ${err.message}</div>`;
  }
}

function renderOrderDetail(data) {
  const { order, items, history } = data;
  const nextStatuses = getNextStatuses(order.status);
  const detail = $('#orderDetail');
  detail.innerHTML = `
    <h2>${order.reference}</h2>
    <div class="detail-row"><span class="label">العميل</span><span>${order.customer_name}</span></div>
    <div class="detail-row"><span class="label">الموبايل</span><span dir="ltr">${order.phone}</span></div>
    <div class="detail-row"><span class="label">المنطقة</span><span>${order.area}</span></div>
    <div class="detail-row"><span class="label">العنوان</span><span>${order.address_line}</span></div>
    <div class="detail-row"><span class="label">الدفع</span><span>${order.payment_method}</span></div>
    <div class="detail-row"><span class="label">الإجمالي</span><span>${(order.total_minor / 100).toLocaleString('en-EG')} EGP</span></div>
    <div class="detail-row"><span class="label">الشحن</span><span>${(order.shipping_minor / 100).toLocaleString('en-EG')} EGP</span></div>
    <div class="detail-row"><span class="label">الحالة</span><span class="order-status status-${order.status}">${statusLabel(order.status)}</span></div>
    <div class="detail-row"><span class="label">حالة الدفع</span><span>${paymentLabel(order.payment_status)}</span></div>
    <div class="detail-section">
      <h3>المنتجات</h3>
      ${items.map(i => `<div class="detail-row"><span>${i.product_name_ar} — ${i.package_label_ar}</span><span>${i.quantity} × ${(i.unit_price_minor / 100).toLocaleString('en-EG')} EGP</span></div>`).join('')}
    </div>
    ${nextStatuses.length ? `
      <div class="status-actions">
        <h3 style="font-size:1rem;color:var(--gold);margin-top:16px">تغيير الحالة</h3>
        ${nextStatuses.map(s => `<button class="btn ${s === 'cancelled' ? 'btn-danger' : 'btn-success'}" onclick="changeStatus('${s}')">${statusLabel(s)}</button>`).join('')}
      </div>` : ''}
    <div class="status-history">
      <h3 style="font-size:1rem;color:var(--gold);margin-top:16px">سجل الحالات</h3>
      ${history.map(h => `<div class="history-item">${statusLabel(h.to_status)} — ${h.actor} — ${new Date(h.created_at * 1000).toLocaleString('ar-EG')}</div>`).join('')}
    </div>
  `;
}

function getNextStatuses(status) {
  const transitions = {
    pending_confirmation: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };
  return transitions[status] || [];
}

function paymentLabel(s) {
  const labels = { unpaid: 'غير مدفوع', awaiting_verification: 'بانتظار التحقق', paid: 'مدفوع', refunded: 'مسترد', failed: 'فشل' };
  return labels[s] || s;
}

window.changeStatus = async (newStatus) => {
  if (!selectedOrderId) return;
  try {
    await api(`/admin/orders/${selectedOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    toast('تم تحديث الحالة');
    loadOrders();
    const card = $$(`.order-card[data-id="${selectedOrderId}"]`)[0];
    if (card) selectOrder(selectedOrderId, card);
  } catch (err) {
    toast('فشل تحديث الحالة: ' + err.message);
  }
};

checkSession();
