/* ===================== DEMO DATA ===================== */
const ASSETS = {
  stocks: [
    {sym:'RELIANCE', name:'Reliance Industries • NSE', badge:'RE', price:2946.30, chg:1.24, bid:2945.80, ask:2946.80, high:2965.00, low:2910.50, vol:'4.2M', cur:'₹', spark:[10,12,11,14,13,16,15,17]},
    {sym:'TCS', name:'Tata Consultancy • NSE', badge:'TC', price:3812.55, chg:-0.42, bid:3811.90, ask:3813.20, high:3840.00, low:3800.00, vol:'1.8M', cur:'₹', spark:[17,16,16,15,14,15,13,13]},
    {sym:'AAPL', name:'Apple Inc. • NASDAQ', badge:'AA', price:228.14, chg:0.87, bid:228.05, ask:228.23, high:230.10, low:225.40, vol:'62.1M', cur:'$', spark:[11,12,12,13,14,13,15,16]},
    {sym:'TSLA', name:'Tesla Inc. • NASDAQ', badge:'TS', price:241.90, chg:3.15, bid:241.70, ask:242.10, high:245.00, low:232.00, vol:'98.4M', cur:'$', spark:[9,10,12,11,14,16,18,19]},
    {sym:'HDFCBANK', name:'HDFC Bank • NSE', badge:'HD', price:1682.10, chg:-0.18, bid:1681.60, ask:1682.60, high:1690.00, low:1670.00, vol:'3.1M', cur:'₹', spark:[15,15,14,14,13,14,13,12]},
  ],
  crypto: [
    {sym:'BTC/USDT', name:'Bitcoin', badge:'₿', price:67240.15, chg:2.31, bid:67230, ask:67250, high:68100, low:65900, vol:'$28.4B', cur:'$', spark:[10,11,10,13,12,15,16,18]},
    {sym:'ETH/USDT', name:'Ethereum', badge:'Ξ', price:3412.80, chg:1.65, bid:3411, ask:3414, high:3460, low:3350, vol:'$14.1B', cur:'$', spark:[12,13,12,14,13,15,14,16]},
    {sym:'SOL/USDT', name:'Solana', badge:'SO', price:168.42, chg:-1.02, bid:168.20, ask:168.60, high:172.00, low:165.00, vol:'$3.8B', cur:'$', spark:[16,15,15,14,13,13,12,12]},
    {sym:'BNB/USDT', name:'BNB', badge:'BN', price:612.55, chg:0.54, bid:612.10, ask:613.00, high:618.00, low:605.00, vol:'$1.2B', cur:'$', spark:[13,13,14,13,14,15,14,15]},
    {sym:'DOGE/USDT', name:'Dogecoin', badge:'DO', price:0.1842, chg:4.87, bid:0.1840, ask:0.1844, high:0.1890, low:0.1750, vol:'$980M', cur:'$', spark:[8,9,10,12,14,15,17,19]},
  ],
  forex: [
    {sym:'EUR/USD', name:'Euro / US Dollar', badge:'EU', price:1.0847, chg:-0.12, bid:1.0846, ask:1.0848, high:1.0870, low:1.0830, vol:'$102B', cur:'', spark:[15,14,14,13,13,12,12,11]},
    {sym:'USD/INR', name:'Dollar / Rupee', badge:'US', price:83.42, chg:0.08, bid:83.41, ask:83.43, high:83.55, low:83.30, vol:'$18B', cur:'', spark:[12,12,13,12,13,13,14,14]},
    {sym:'GBP/USD', name:'Pound / Dollar', badge:'GB', price:1.2683, chg:0.21, bid:1.2682, ask:1.2684, high:1.2710, low:1.2650, vol:'$64B', cur:'', spark:[11,12,12,13,14,14,15,15]},
    {sym:'USD/JPY', name:'Dollar / Yen', badge:'US', price:151.24, chg:-0.35, bid:151.22, ask:151.26, high:151.90, low:150.80, vol:'$88B', cur:'', spark:[16,15,15,14,14,13,12,12]},
  ]
};
function findAsset(sym){
  for(const k in ASSETS){ const f = ASSETS[k].find(a=>a.sym===sym); if(f) return {...f, market:k}; }
  return null;
}
function fmtPrice(a){ return `${a.cur}${a.price.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:4})}`; }
function fmtMoney(n){ return '₹' + Number(n).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}); }

/* ===================== STATE ===================== */
let state = {
  loggedIn:false, user:null, kycStatus:'Not Started', twoFA:false,
  balance:0, orders:[], holdings:{}, watchlist:[], notifications:[], txHistory:[],
  activeOrderAsset:null, orderSide:'buy', orderType:'market', kycDoc:null,
  authMode:'login'
};

function sparklineSVG(points, up){
  const w=90,h=28, max=Math.max(...points), min=Math.min(...points);
  const norm = points.map((p,i)=> {
    const x = (i/(points.length-1))*w;
    const y = h - ((p-min)/(max-min||1))*h;
    return `${x},${y}`;
  }).join(' ');
  const color = up? '#1FC77A':'#F0465C';
  return `<svg class="sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${norm}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}

/* ===================== TICKER ===================== */
function renderTicker(){
  const all = [...ASSETS.stocks, ...ASSETS.crypto, ...ASSETS.forex];
  const track = document.getElementById('tickerTrack');
  const items = all.map(t=>`<span class="ticker-item"><span class="sym">${t.sym}</span><span class="mono">${fmtPrice(t)}</span><span class="${t.chg>=0?'gain':'loss'}">${t.chg>=0?'+':''}${t.chg}%</span></span>`).join('');
  track.innerHTML = items + items;
}

/* ===================== MARKET TABLES (landing) ===================== */
function assetRowHTML(a, small){
  const isWatch = state.watchlist.includes(a.sym);
  return `<tr>
    <td><button class="star-btn ${isWatch?'active':''}" data-star="${a.sym}">★</button></td>
    <td><div class="sym-cell"><div class="sym-badge">${a.badge}</div><div><div>${a.sym}</div><div class="sym-name">${a.name}</div></div></div></td>
    <td class="price-cell">${fmtPrice(a)}</td>
    <td class="${a.chg>=0?'gain':'loss'}">${a.chg>=0?'+':''}${a.chg}%</td>
    <td class="mono">${a.vol}</td>
    <td><button class="trade-btn-sm buy" data-trade="${a.sym}">Trade</button></td>
  </tr>`;
}
function renderLandingMarkets(){
  document.getElementById('stocksTbody').innerHTML = ASSETS.stocks.map(a=>assetRowHTML(a)).join('');
  document.getElementById('cryptoTbody').innerHTML = ASSETS.crypto.map(a=>assetRowHTML(a)).join('');
  document.getElementById('forexTbody').innerHTML = ASSETS.forex.map(a=>assetRowHTML(a)).join('');
}
function renderOverviewTable(){
  const all = [...ASSETS.stocks, ...ASSETS.crypto, ...ASSETS.forex];
  document.getElementById('overviewTbody').innerHTML = all.map(a=>`
    <tr>
      <td><button class="star-btn ${state.watchlist.includes(a.sym)?'active':''}" data-star="${a.sym}">★</button></td>
      <td><div class="sym-cell"><div class="sym-badge">${a.badge}</div><div><div>${a.sym}</div><div class="sym-name">${a.name}</div></div></div></td>
      <td class="price-cell">${fmtPrice(a)}</td>
      <td class="${a.chg>=0?'gain':'loss'}">${a.chg>=0?'+':''}${a.chg}%</td>
      <td>${sparklineSVG(a.spark, a.chg>=0)}</td>
      <td><button class="trade-btn-sm buy" data-trade="${a.sym}" data-side="buy">Buy</button><button class="trade-btn-sm sell" data-trade="${a.sym}" data-side="sell">Sell</button></td>
    </tr>`).join('');
}
function renderWatchlistPanel(){
  const box = document.getElementById('watchlistBody');
  if(state.watchlist.length===0){ box.innerHTML = '<div class="empty-state">Your watchlist is empty. Click ★ on any asset to add it.</div>'; return; }
  const rows = state.watchlist.map(sym=>{
    const a = findAsset(sym); if(!a) return '';
    return `<tr>
      <td><button class="star-btn active" data-star="${a.sym}">★</button></td>
      <td><div class="sym-cell"><div class="sym-badge">${a.badge}</div><div><div>${a.sym}</div><div class="sym-name">${a.name}</div></div></div></td>
      <td class="price-cell">${fmtPrice(a)}</td>
      <td class="${a.chg>=0?'gain':'loss'}">${a.chg>=0?'+':''}${a.chg}%</td>
      <td class="mono">Bid ${a.cur}${a.bid} / Ask ${a.cur}${a.ask}</td>
      <td>${sparklineSVG(a.spark,a.chg>=0)}</td>
      <td><button class="trade-btn-sm buy" data-trade="${a.sym}">Trade</button></td>
    </tr>`;
  }).join('');
  box.innerHTML = `<table><thead><tr><th></th><th>Asset</th><th>Price</th><th>Change</th><th>Bid/Ask</th><th>Chart</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ===================== TABS (landing market tabs) ===================== */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.market-panels').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ===================== MOBILE DRAWER ===================== */
const drawer = document.getElementById('drawer'), drawerOverlay = document.getElementById('drawerOverlay');
function openDrawer(){ drawer.classList.add('open'); drawerOverlay.classList.add('open'); }
function closeDrawer(){ drawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }
document.getElementById('menuToggle').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);
document.querySelectorAll('[data-drawer-link]').forEach(a=>a.addEventListener('click', closeDrawer));

/* ===================== MODALS ===================== */
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('[data-close-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=> btn.closest('.modal-overlay').classList.remove('open'));
});
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.classList.remove('open'); });
});

/* ===================== TOASTS ===================== */
function showToast(title, msg, type='default'){
  const stack = document.getElementById('toastStack');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<b>${title}</b><span>${msg}</span>`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, 4200);
}
function pushNotification(title, msg){
  state.notifications.unshift({title, msg, time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  renderNotifications();
  document.getElementById('notifDot').classList.add('show');
}
function renderNotifications(){
  const panel = document.getElementById('notifPanel');
  if(state.notifications.length===0){ panel.innerHTML = '<div class="empty-state" style="padding:24px;">No notifications yet.</div>'; return; }
  panel.innerHTML = state.notifications.map(n=>`<div class="notif-item"><div class="t">${n.title}</div><div class="s">${n.msg} • ${n.time}</div></div>`).join('');
}
document.getElementById('notifBell').addEventListener('click', ()=>{
  document.getElementById('notifPanel').classList.toggle('open');
  document.getElementById('notifDot').classList.remove('show');
});
document.addEventListener('click', (e)=>{
  if(!document.getElementById('notifWrap').contains(e.target)) document.getElementById('notifPanel').classList.remove('open');
});

/* ===================== VALIDATION HELPERS ===================== */
function setFieldError(fieldId, show){ document.getElementById(fieldId).classList.toggle('invalid', show); }
function setBtnLoading(btn, loading){ btn.classList.toggle('loading', loading); btn.disabled = loading; }

/* ===================== AUTH: LOGIN ===================== */
document.getElementById('heroSignupBtn').addEventListener('click', ()=>openModal('signupModal'));
document.getElementById('ctaSignupBtn').addEventListener('click', ()=>openModal('signupModal'));
document.getElementById('signupBtnDesktop').addEventListener('click', ()=>openModal('signupModal'));
document.getElementById('signupBtnMobile').addEventListener('click', ()=>{ closeDrawer(); openModal('signupModal'); });
document.getElementById('loginBtnDesktop').addEventListener('click', ()=>openModal('loginModal'));
document.getElementById('loginBtnMobile').addEventListener('click', ()=>{ closeDrawer(); openModal('loginModal'); });
document.getElementById('heroDemoBtn').addEventListener('click', ()=>{
  document.getElementById('markets').scrollIntoView({behavior:'smooth'});
});
document.getElementById('pricingLinkDesktop').addEventListener('click', (e)=>{
  e.preventDefault(); closeDrawer();
  document.getElementById('fees').scrollIntoView({behavior:'smooth'});
});
document.getElementById('switchToSignup').addEventListener('click', ()=>{ closeModal('loginModal'); openModal('signupModal'); });
document.getElementById('switchToLogin').addEventListener('click', ()=>{ closeModal('signupModal'); openModal('loginModal'); });
document.getElementById('forgotPassBtn').addEventListener('click', ()=>{
  showToast('Demo Mode', 'Password reset only works with a real backend. Use the demo login: demo@trademesh.app / demo1234');
});

document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  const alertBox = document.getElementById('loginAlert');
  alertBox.classList.remove('show','error','success');
  let valid = true;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError('loginEmailField', !emailOk); if(!emailOk) valid=false;
  setFieldError('loginPassField', pass.length<6); if(pass.length<6) valid=false;
  if(!valid) return;

  const btn = document.getElementById('loginSubmitBtn');
  setBtnLoading(btn, true);
  setTimeout(()=>{
    setBtnLoading(btn, false);
    if(email==='demo@trademesh.app' && pass==='demo1234'){
      state.loggedIn = true;
      state.user = {name:'Demo User', email};
      if(state.balance===0) state.balance = 10000;
      closeModal('loginModal');
      enterDashboard();
      showToast('Login Successful', 'Welcome to the Demo Environment.', 'success');
    } else {
      alertBox.textContent = 'Invalid credentials. Try the demo login: demo@trademesh.app / demo1234';
      alertBox.classList.add('show','error');
    }
  }, 700);
});

/* ===================== AUTH: SIGNUP ===================== */
document.getElementById('signupForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('suName').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const mobile = document.getElementById('suMobile').value.trim();
  const pass = document.getElementById('suPass').value;
  const confirm = document.getElementById('suConfirm').value;
  const country = document.getElementById('suCountry').value;
  const terms = document.getElementById('suTerms').checked;

  let valid = true;
  setFieldError('suNameField', name.length<2); if(name.length<2) valid=false;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  setFieldError('suEmailField', !emailOk); if(!emailOk) valid=false;
  const mobileOk = /^[0-9]{10}$/.test(mobile);
  setFieldError('suMobileField', !mobileOk); if(!mobileOk) valid=false;
  setFieldError('suPassField', pass.length<6); if(pass.length<6) valid=false;
  setFieldError('suConfirmField', confirm!==pass || confirm===''); if(confirm!==pass || confirm==='') valid=false;
  setFieldError('suCountryField', !country); if(!country) valid=false;
  document.getElementById('suTermsError').style.display = terms? 'none':'block';
  if(!terms) valid=false;
  if(!valid) return;

  const btn = document.getElementById('signupSubmitBtn');
  setBtnLoading(btn, true);
  setTimeout(()=>{
    setBtnLoading(btn, false);
    state.loggedIn = true;
    state.user = {name, email};
    state.balance = 10000;
    closeModal('signupModal');
    enterDashboard();
    pushNotification('Demo Account Created', `Welcome, ${name}!`);
    showToast('Demo Account Ready', '₹10,000 in demo funds has been added.', 'success');
  }, 800);
});

/* ===================== ENTER / EXIT DASHBOARD ===================== */
function enterDashboard(){
  document.querySelectorAll('.dash-hidden').forEach(el=>el.classList.remove('dash-hidden'));
  document.getElementById('dashboardSection').classList.remove('dash-hidden');
  document.getElementById('dashUserName').textContent = state.user.name;
  document.getElementById('dashAvatar').textContent = state.user.name.charAt(0).toUpperCase();
  document.querySelector('#dashLinkDesktop').classList.remove('dash-hidden');
  document.querySelector('#dashLinkMobile').classList.remove('dash-hidden');
  document.querySelector('#loginBtnDesktop').style.display='none';
  document.querySelector('#signupBtnDesktop').style.display='none';
  document.querySelector('#loginBtnMobile').style.display='none';
  document.querySelector('#signupBtnMobile').style.display='none';
  refreshDashboard();
  document.getElementById('dashboardSection').scrollIntoView({behavior:'smooth'});
}
function exitDashboard(){
  state.loggedIn = false;
  document.getElementById('dashboardSection').classList.add('dash-hidden');
  document.getElementById('dashLinkDesktop').classList.add('dash-hidden');
  document.getElementById('dashLinkMobile').classList.add('dash-hidden');
  document.getElementById('notifWrap').classList.add('dash-hidden');
  document.getElementById('logoutBtnDesktop').classList.add('dash-hidden');
  document.getElementById('logoutBtnMobile').classList.add('dash-hidden');
  document.querySelector('#loginBtnDesktop').style.display='';
  document.querySelector('#signupBtnDesktop').style.display='';
  document.querySelector('#loginBtnMobile').style.display='';
  document.querySelector('#signupBtnMobile').style.display='';
  window.scrollTo({top:0, behavior:'smooth'});
}
document.getElementById('logoutBtnDesktop').addEventListener('click', ()=>{ exitDashboard(); showToast('Logged Out', 'You have left the demo session.'); });
document.getElementById('logoutBtnMobile').addEventListener('click', ()=>{ closeDrawer(); exitDashboard(); });
document.getElementById('dashLinkDesktop').addEventListener('click', (e)=>{ e.preventDefault(); document.getElementById('dashboardSection').scrollIntoView({behavior:'smooth'}); });
document.getElementById('dashLinkMobile').addEventListener('click', (e)=>{ e.preventDefault(); closeDrawer(); document.getElementById('dashboardSection').scrollIntoView({behavior:'smooth'}); });

/* ===================== DASHBOARD TABS ===================== */
document.querySelectorAll('.dash-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.dash-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.dash-panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.dash).classList.add('active');
  });
});

/* ===================== REFRESH DASHBOARD DATA ===================== */
function refreshDashboard(){
  document.getElementById('sumBalance').textContent = fmtMoney(state.balance);
  const invested = Object.values(state.holdings).reduce((s,h)=> s + h.qty*h.avgPrice, 0);
  document.getElementById('sumAvailable').textContent = fmtMoney(state.balance);
  let unrealized = 0;
  Object.entries(state.holdings).forEach(([sym,h])=>{
    const a = findAsset(sym); if(!a) return;
    unrealized += (a.price - h.avgPrice) * h.qty;
  });
  const unrealEl = document.getElementById('sumUnrealized');
  unrealEl.textContent = fmtMoney(unrealized);
  unrealEl.className = 'val mono ' + (unrealized>=0?'gain':'loss');
  document.getElementById('sumPositions').textContent = Object.keys(state.holdings).length;

  document.getElementById('pfTotal').textContent = fmtMoney(state.balance + invested + unrealized);
  document.getElementById('pfCash').textContent = fmtMoney(state.balance);
  document.getElementById('pfInvested').textContent = fmtMoney(invested);
  const realized = state.orders.filter(o=>o.realizedPL!==undefined).reduce((s,o)=>s+o.realizedPL,0);
  document.getElementById('pfRealized').textContent = fmtMoney(realized);
  document.getElementById('walletBalanceDisplay').textContent = fmtMoney(state.balance);

  renderOverviewTable();
  renderWatchlistPanel();
  renderHoldings();
  renderOrders();
  renderWalletTx();
  renderNotifications();
}

function renderHoldings(){
  const box = document.getElementById('holdingsBody');
  const entries = Object.entries(state.holdings);
  if(entries.length===0){ box.innerHTML = '<div class="empty-state">You have no open demo positions.</div>'; return; }
  const rows = entries.map(([sym,h])=>{
    const a = findAsset(sym); if(!a) return '';
    const mval = a.price*h.qty; const pl = (a.price-h.avgPrice)*h.qty; const plPct = ((a.price-h.avgPrice)/h.avgPrice*100).toFixed(2);
    return `<tr>
      <td>${a.sym}</td><td class="mono">${h.qty}</td><td class="mono">${a.cur}${h.avgPrice.toFixed(2)}</td>
      <td class="mono">${fmtPrice(a)}</td><td class="mono">${fmtMoney(mval)}</td>
      <td class="mono ${pl>=0?'gain':'loss'}">${fmtMoney(pl)}</td><td class="${pl>=0?'gain':'loss'}">${plPct}%</td>
    </tr>`;
  }).join('');
  box.innerHTML = `<table><thead><tr><th>Asset</th><th>Qty</th><th>Avg Price</th><th>Current</th><th>Value</th><th>P&L</th><th>P&L %</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function renderOrders(){
  const box = document.getElementById('ordersBody');
  if(state.orders.length===0){ box.innerHTML = '<div class="empty-state">No demo orders placed yet.</div>'; return; }
  const rows = state.orders.slice().reverse().map(o=>`
    <tr>
      <td>${o.id}</td><td>${o.sym}</td>
      <td class="${o.side==='buy'?'gain':'loss'}">${o.side.toUpperCase()}</td>
      <td>${o.type}</td><td class="mono">${o.qty}</td><td class="mono">${o.cur}${o.price.toFixed(2)}</td>
      <td><span class="demo-badge sm">${o.status}</span></td><td style="font-size:12px; color:var(--muted);">${o.time}</td>
    </tr>`).join('');
  box.innerHTML = `<table><thead><tr><th>Order ID</th><th>Asset</th><th>Side</th><th>Type</th><th>Qty</th><th>Price</th><th>Status</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function renderWalletTx(){
  const box = document.getElementById('walletTxBody');
  if(state.txHistory.length===0){ box.innerHTML = '<div class="empty-state">No transaction history yet.</div>'; return; }
  const rows = state.txHistory.slice().reverse().map(t=>`
    <tr><td>${t.type}</td><td class="mono ${t.amount>=0?'gain':'loss'}">${t.amount>=0?'+':''}${fmtMoney(t.amount)}</td><td><span class="demo-badge sm">${t.status}</span></td><td style="font-size:12px; color:var(--muted);">${t.time}</td></tr>`).join('');
  box.innerHTML = `<table><thead><tr><th>Type</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ===================== WATCHLIST STAR (event delegation) ===================== */
document.addEventListener('click', (e)=>{
  const starBtn = e.target.closest('[data-star]');
  if(starBtn){
    const sym = starBtn.dataset.star;
    const idx = state.watchlist.indexOf(sym);
    if(idx>-1) state.watchlist.splice(idx,1); else state.watchlist.push(sym);
    renderLandingMarkets();
    if(state.loggedIn) refreshDashboard();
  }
  const tradeBtn = e.target.closest('[data-trade]');
  if(tradeBtn){
    if(!state.loggedIn){ openModal('signupModal'); showToast('Login Required', 'Create a demo account or log in before trading.'); return; }
    openOrderModal(tradeBtn.dataset.trade, tradeBtn.dataset.side||'buy');
  }
});

/* ===================== ORDER MODAL ===================== */
function openOrderModal(sym, side){
  const a = findAsset(sym); if(!a) return;
  state.activeOrderAsset = a; state.orderSide = side; state.orderType='market';
  document.getElementById('orderAssetTitle').textContent = `${a.sym} — Demo Order`;
  setOrderSide(side);
  document.getElementById('orderMarketBtn').classList.add('active');
  document.getElementById('orderLimitBtn').classList.remove('active');
  document.getElementById('orderPriceField').style.display='none';
  document.getElementById('orderQty').value='';
  document.getElementById('orderPrice').value = a.price.toFixed(2);
  document.getElementById('orderAlert').classList.remove('show');
  updateOrderSummary();
  openModal('orderModal');
}
function setOrderSide(side){
  state.orderSide = side;
  document.getElementById('orderBuyTab').classList.toggle('buy-active', side==='buy');
  document.getElementById('orderSellTab').classList.toggle('sell-active', side==='sell');
  updateOrderSummary();
}
document.getElementById('orderBuyTab').addEventListener('click', ()=>setOrderSide('buy'));
document.getElementById('orderSellTab').addEventListener('click', ()=>setOrderSide('sell'));
document.getElementById('orderMarketBtn').addEventListener('click', function(){
  state.orderType='market'; this.classList.add('active'); document.getElementById('orderLimitBtn').classList.remove('active');
  document.getElementById('orderPriceField').style.display='none'; updateOrderSummary();
});
document.getElementById('orderLimitBtn').addEventListener('click', function(){
  state.orderType='limit'; this.classList.add('active'); document.getElementById('orderMarketBtn').classList.remove('active');
  document.getElementById('orderPriceField').style.display='block'; updateOrderSummary();
});
document.getElementById('orderQty').addEventListener('input', updateOrderSummary);
document.getElementById('orderPrice').addEventListener('input', updateOrderSummary);

function updateOrderSummary(){
  const a = state.activeOrderAsset; if(!a) return;
  const qty = parseFloat(document.getElementById('orderQty').value)||0;
  const price = state.orderType==='limit' ? (parseFloat(document.getElementById('orderPrice').value)||a.price) : a.price;
  const total = qty*price;
  const fee = total*0.001;
  document.getElementById('orderEstPrice').textContent = `${a.cur}${price.toFixed(2)}`;
  document.getElementById('orderEstTotal').textContent = fmtMoney(total);
  document.getElementById('orderEstFee').textContent = fmtMoney(fee);
  document.getElementById('orderAvailBal').textContent = fmtMoney(state.balance);
}

document.getElementById('orderConfirmBtn').addEventListener('click', ()=>{
  const a = state.activeOrderAsset; if(!a) return;
  const qty = parseFloat(document.getElementById('orderQty').value)||0;
  const price = state.orderType==='limit' ? (parseFloat(document.getElementById('orderPrice').value)||a.price) : a.price;
  const total = qty*price + (qty*price*0.001);
  const alertBox = document.getElementById('orderAlert');
  alertBox.classList.remove('show');

  if(qty<=0){ alertBox.textContent='Enter a valid quantity.'; alertBox.classList.add('show'); return; }
  if(state.orderSide==='buy' && total>state.balance){ alertBox.textContent='Insufficient Demo Balance.'; alertBox.classList.add('show'); return; }
  if(state.orderSide==='sell' && (!state.holdings[a.sym] || state.holdings[a.sym].qty<qty)){ alertBox.textContent='You do not hold that much quantity in your portfolio.'; alertBox.classList.add('show'); return; }

  const btn = document.getElementById('orderConfirmBtn');
  setBtnLoading(btn, true);
  setTimeout(()=>{
    setBtnLoading(btn, false);
    const orderId = 'DEMO-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const time = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

    if(state.orderSide==='buy'){
      state.balance -= total;
      if(!state.holdings[a.sym]) state.holdings[a.sym] = {qty:0, avgPrice:0};
      const h = state.holdings[a.sym];
      h.avgPrice = (h.avgPrice*h.qty + price*qty) / (h.qty+qty);
      h.qty += qty;
    } else {
      const h = state.holdings[a.sym];
      const realizedPL = (price - h.avgPrice) * qty;
      h.qty -= qty;
      if(h.qty<=0.00001) delete state.holdings[a.sym];
      state.balance += (qty*price - qty*price*0.001);
      state.orders.push({id:orderId, sym:a.sym, side:'sell', type:state.orderType, qty, price, cur:a.cur, status:'Filled', time, realizedPL});
      finishOrder(orderId, a, qty); return;
    }
    state.orders.push({id:orderId, sym:a.sym, side:'buy', type:state.orderType, qty, price, cur:a.cur, status:'Filled', time});
    finishOrder(orderId, a, qty);
  }, 900);
});
function finishOrder(orderId, a, qty){
  closeModal('orderModal');
  refreshDashboard();
  pushNotification('Demo Order Filled', `${orderId} — ${a.sym} x${qty}`);
  showToast('Demo Order Placed', `Order ${orderId} filled (simulated execution).`, 'success');
}

/* ===================== WALLET ===================== */
document.getElementById('addFundsBtn').addEventListener('click', ()=>{
  state.balance += 10000;
  state.txHistory.push({type:'Demo Deposit', amount:10000, status:'Completed', time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  refreshDashboard();
  pushNotification('Demo Funds Added', '+ ₹10,000 added to demo balance');
  showToast('Demo Funds Added', '₹10,000 added — no real money.', 'success');
});
document.getElementById('withdrawBtn').addEventListener('click', ()=>openModal('withdrawModal'));
document.getElementById('withdrawConfirmBtn').addEventListener('click', ()=>{
  const amt = parseFloat(document.getElementById('withdrawAmount').value)||0;
  const dest = document.getElementById('withdrawDest').value.trim();
  const alertBox = document.getElementById('withdrawAlert');
  alertBox.classList.remove('show');
  if(amt<=0){ alertBox.textContent='Enter a valid amount.'; alertBox.classList.add('show'); return; }
  if(amt>state.balance){ alertBox.textContent='Insufficient Demo Balance.'; alertBox.classList.add('show'); return; }
  if(!dest){ alertBox.textContent='Enter a destination.'; alertBox.classList.add('show'); return; }
  state.balance -= amt;
  state.txHistory.push({type:'Demo Withdrawal', amount:-amt, status:'Processing (Simulated)', time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});
  closeModal('withdrawModal');
  document.getElementById('withdrawAmount').value=''; document.getElementById('withdrawDest').value='';
  refreshDashboard();
  pushNotification('Demo Withdrawal Requested', `₹${amt} — Simulated Execution, no real transfer.`);
  showToast('Demo Withdrawal Submitted', 'A real withdrawal would need a licensed payment backend.', 'success');
});

/* ===================== KYC ===================== */
document.getElementById('startKycBtn').addEventListener('click', ()=>{
  document.getElementById('kycStep1').style.display='block';
  document.getElementById('kycStep2').style.display='none';
  document.getElementById('kycStep3').style.display='none';
  document.getElementById('kycDot1').className='kyc-step-dot active';
  document.getElementById('kycDot2').className='kyc-step-dot';
  document.getElementById('kycDot3').className='kyc-step-dot';
  document.getElementById('kycSubtitle').textContent='Step 1 of 3 — Personal Details';
  document.getElementById('kycStatusBadge').textContent='Pending';
  document.getElementById('kycStatusBadge').className='kyc-status-badge pending';
  openModal('kycModal');
});
document.getElementById('kycNext1').addEventListener('click', ()=>{
  document.getElementById('kycStep1').style.display='none';
  document.getElementById('kycStep2').style.display='block';
  document.getElementById('kycDot1').className='kyc-step-dot done';
  document.getElementById('kycDot2').className='kyc-step-dot active';
  document.getElementById('kycSubtitle').textContent='Step 2 of 3 — Identity Document';
});
document.querySelectorAll('.doc-opt').forEach(opt=>{
  opt.addEventListener('click', function(){
    document.querySelectorAll('.doc-opt').forEach(o=>o.classList.remove('selected'));
    this.classList.add('selected'); state.kycDoc = this.dataset.doc;
  });
});
document.getElementById('kycNext2').addEventListener('click', ()=>{
  if(!state.kycDoc){ showToast('Choose a Document', 'Select one option: PAN, Aadhaar, or Passport.'); return; }
  document.getElementById('kycStep2').style.display='none';
  document.getElementById('kycStep3').style.display='block';
  document.getElementById('kycDot2').className='kyc-step-dot done';
  document.getElementById('kycDot3').className='kyc-step-dot active';
  document.getElementById('kycSubtitle').textContent='Step 3 of 3 — Verification Status';
});
document.getElementById('kycFinish').addEventListener('click', ()=>{
  state.kycStatus='Demo Verified';
  document.getElementById('kycStatusBadge').textContent='Demo Verified';
  document.getElementById('kycStatusBadge').className='kyc-status-badge verified';
  closeModal('kycModal');
  pushNotification('KYC Status Update', 'Demo KYC verification completed.');
  showToast('Demo KYC Complete', 'This is only a demo verification, not a real one.', 'success');
});

/* ===================== SECURITY: 2FA ===================== */
document.getElementById('toggle2faBtn').addEventListener('click', function(){
  state.twoFA = !state.twoFA;
  this.textContent = state.twoFA? 'Disable 2FA (Demo)' : 'Enable 2FA (Demo)';
  showToast(state.twoFA? '2FA Enabled (Demo)':'2FA Disabled (Demo)', 'This is a demo UI — no real TOTP backend is connected.');
  pushNotification('Security Alert', `2FA ${state.twoFA?'enabled':'disabled'} (demo).`);
});

/* ===================== SEARCH ===================== */
document.getElementById('globalSearch').addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    const q = e.target.value.trim().toUpperCase();
    const found = findAsset(q) || [...ASSETS.stocks,...ASSETS.crypto,...ASSETS.forex].find(a=>a.sym.includes(q)||a.name.toUpperCase().includes(q));
    if(found){ openOrderModal(found.sym,'buy'); e.target.value=''; }
    else showToast('Not Found', `"${q}" was not found in the demo asset list.`);
  }
});

/* ===================== THEME TOGGLE ===================== */
document.getElementById('themeToggle').addEventListener('click', function(){
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  this.textContent = isLight? '☀️':'🌙';
});

/* ===================== FOOTER LINKS ===================== */
document.querySelectorAll('.footer-link').forEach(a=>{
  a.addEventListener('click', (e)=>{ e.preventDefault(); showToast('Coming Soon', a.dataset.toast); });
});
function openInfo(title, html){
  document.getElementById('infoModalTitle').textContent = title;
  document.getElementById('infoModalBody').innerHTML = html;
  openModal('infoModal');
}
document.getElementById('statusLink').addEventListener('click', (e)=>{
  e.preventDefault();
  openInfo('System Status', `<p><b>Status Monitoring: Demo</b></p><p style="margin-top:10px;">No real monitoring infrastructure is connected, so no live uptime number is shown. In a real deployment, this page would connect to an actual monitoring service (such as a status page provider).</p>`);
});
document.getElementById('riskLink').addEventListener('click', (e)=>{
  e.preventDefault();
  openInfo('Risk Disclosure', `<p>Trading stocks, crypto, and forex carries substantial financial risk — you could lose your entire invested amount.</p><p style="margin-top:10px;">This website is a <b>demo/prototype</b> and does not provide real financial services. There is no real trading, real custody, real KYC verification, or regulatory approval.</p><p style="margin-top:10px;">Before operating a real platform, verify the rules and licensing requirements of your country's regulator (such as SEBI/RBI in India).</p>`);
});
document.getElementById('contactLink').addEventListener('click', (e)=>{
  e.preventDefault();
  openInfo('Contact Us', `
    <form id="contactForm">
      <div class="field"><label>Name</label><input type="text" id="cName" required></div>
      <div class="field"><label>Email</label><input type="email" id="cEmail" required></div>
      <div class="field"><label>Message</label><textarea id="cMsg" rows="4" required></textarea></div>
      <button type="submit" class="btn btn-brand btn-full">Send (Demo)</button>
    </form>`);
  setTimeout(()=>{
    document.getElementById('contactForm').addEventListener('submit', function(ev){
      ev.preventDefault();
      closeModal('infoModal');
      showToast('Message Received (Demo)', 'This is a demo form — it does not reach a real support team.', 'success');
    });
  },0);
});

/* ===================== LIVE CRYPTO PRICES (Binance API) ===================== */
/*
  Fetches live prices for the demo crypto pairs from Binance's public REST API
  every 8 seconds and updates ASSETS.crypto in place, then re-renders every
  view that shows crypto prices (ticker, landing tables, dashboard overview,
  watchlist). If the request fails for any reason (no internet, CORS block,
  Binance downtime, etc.), the original static demo data already sitting in
  ASSETS.crypto is left untouched, so the page never shows a blank/broken
  state — it just silently keeps the last known values.
*/
const BINANCE_SYMBOL_MAP = {
  'BTC/USDT': 'BTCUSDT',
  'ETH/USDT': 'ETHUSDT',
  'SOL/USDT': 'SOLUSDT',
  'BNB/USDT': 'BNBUSDT',
  'DOGE/USDT': 'DOGEUSDT'
};
const BINANCE_API_URL = 'https://api.binance.com/api/v3/ticker/24hr?symbols=' +
  encodeURIComponent(JSON.stringify(Object.values(BINANCE_SYMBOL_MAP)));

function refreshCryptoUIAfterPriceUpdate(){
  renderTicker();
  renderLandingMarkets();
  // Only touch dashboard-only views if the dashboard has actually been rendered/opened
  if(document.getElementById('overviewTbody') && document.getElementById('overviewTbody').innerHTML.trim()!==''){
    renderOverviewTable();
  }
  if(document.getElementById('watchlistBody') && state.watchlist && state.watchlist.length){
    renderWatchlistPanel();
  }
}

async function fetchLiveCryptoPrices(){
  try{
    const res = await fetch(BINANCE_API_URL);
    if(!res.ok) throw new Error('Binance API responded with status ' + res.status);
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('Unexpected Binance response shape');

    const bySymbol = {};
    data.forEach(t=>{ bySymbol[t.symbol] = t; });

    ASSETS.crypto.forEach(a=>{
      const binanceSym = BINANCE_SYMBOL_MAP[a.sym];
      const t = binanceSym && bySymbol[binanceSym];
      if(!t) return; // keep old/static value for this pair if Binance didn't return it

      const lastPrice = parseFloat(t.lastPrice);
      const changePct = parseFloat(t.priceChangePercent);
      const high = parseFloat(t.highPrice);
      const low = parseFloat(t.lowPrice);
      const quoteVol = parseFloat(t.quoteVolume);

      if(!isFinite(lastPrice)) return;

      a.price = lastPrice;
      if(isFinite(changePct)) a.chg = Math.round(changePct*100)/100;
      if(isFinite(high)) a.high = high;
      if(isFinite(low)) a.low = low;
      if(isFinite(quoteVol)) a.vol = '$' + (quoteVol/1e6).toFixed(1) + 'M';

      // Shift the sparkline left and push the new price so the mini-chart animates too
      a.spark.shift();
      a.spark.push(lastPrice);
    });

    refreshCryptoUIAfterPriceUpdate();
  }catch(err){
    // Network down / Binance unreachable / CORS blocked / etc.
    // Intentionally do nothing else: ASSETS.crypto keeps its last known
    // (static demo, or last successfully fetched) values, so the UI
    // never goes blank — it just stops updating until the next tick works.
    console.warn('Live crypto price fetch failed, keeping last known values:', err.message);
  }
}

// First attempt shortly after load, then poll every 8 seconds
setTimeout(fetchLiveCryptoPrices, 1500);
setInterval(fetchLiveCryptoPrices, 8000);

/* ===================== INIT ===================== */
renderTicker();
renderLandingMarkets();
