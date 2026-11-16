/* ==========================================================================
   FINESSE OS — Núcleo: utilitários, roteador, shell, componentes, motion, IA
   ========================================================================== */
const F = window.FOS;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const S = () => F.S();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Format ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const brl2 = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const kbrl = (n) => { const a = Math.abs(n); const s = n < 0 ? '−' : ''; return a >= 1e6 ? `${s}R$ ${(a / 1e6).toFixed(2).replace('.', ',')} mi` : a >= 1e3 ? `${s}R$ ${(a / 1e3).toFixed(a >= 1e5 ? 0 : 1).replace('.', ',')} mil` : `${s}R$ ${a}`; };
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const pd = (iso) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const fdate = (iso) => pd(iso).toLocaleDateString('pt-BR');
const fshort = (iso) => { const d = pd(iso); return `${d.getDate()} ${MES[d.getMonth()]}`; };
const rel = (iso) => { const n = F.dayDiff(F.todayISO(), iso.slice(0, 10)); return n === 0 ? 'Hoje' : n === 1 ? 'Ontem' : n === -1 ? 'Amanhã' : n > 0 ? `há ${n} dias` : `em ${-n} dias`; };
const ftime = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const initials = (n) => n.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const ic = (name, cls = '') => `<i data-lucide="${name}" class="${cls}"></i>`;
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const uid = (p) => p + Math.random().toString(36).slice(2, 7).toUpperCase();
const greet = () => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; };

/* ---------- Roles ---------- */
const ROLES = {
  wellington: { env: 'command', label: 'Finesse Command', name: 'Wellington', sub: 'Proprietário · Administrador', home: '#/command', icon: 'layout-dashboard' },
  client: { env: 'client', label: 'Finesse Client', name: 'Marina Albuquerque', sub: 'Cliente · Residência Jardim Europa', home: '#/client', icon: 'home', pid: 'p1', clientId: 'c1' },
  field: { env: 'field', label: 'Finesse Field', name: 'Diego Santos', sub: 'Mestre de obras', home: '#/field', icon: 'hard-hat', uid: 'u1' },
};
const role = () => S().role;
const fieldProjects = () => S().projects.filter((p) => F.person('u1').projects.includes(p.id) && p.status !== 'Concluída');

/* ---------- Brand ---------- */
const MARK = `<svg class="logo-mark" viewBox="0 0 24 30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3 5l8-3 10 3-8 3z"/><path d="M3 5v5l10 3V8M21 5v5l-8 3"/><path d="M3 12v5l6 2v-5M3 12l6 2 6-2"/><path d="M3 19v5l6 2v-5M9 21l6-2v-5"/></svg>`;
const logo = (sm) => `<span class="logo ${sm ? 'sm' : ''}">${MARK}<span class="wm"><b>Finesse</b><i>ENGENHARIA</i></span></span>`;

/* ---------- Toast ---------- */
function toast(msg, tone = 'ok', icon) {
  let host = $('.toasts'); if (!host) { host = document.createElement('div'); host.className = 'toasts'; host.setAttribute('role', 'status'); document.body.appendChild(host); }
  const ico = icon || { ok: 'check', warn: 'alert-triangle', err: 'x', info: 'info' }[tone];
  const el = document.createElement('div'); el.className = `toast ${tone}`;
  el.innerHTML = `<span class="t-ic">${ic(ico)}</span><div>${msg}</div>`;
  host.appendChild(el); lucideIt(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3600);
}

/* ---------- Icons ---------- */
function lucideIt(root) { if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 }, nameAttr: 'data-lucide', root: root || document }); }

/* ---------- Overlays (sheet / drawer / modal) ---------- */
let SHEET = null;
function openSheet(opts) {
  closeSheet(true);
  const ov = document.createElement('div');
  ov.className = 'overlay ' + (opts.kind || 'side');
  ov.innerHTML = `<div class="scrim" data-act="closeSheet"></div><section class="sheet" role="dialog" aria-modal="true"></section>`;
  document.body.appendChild(ov); document.body.style.overflow = 'hidden';
  SHEET = { ov, opts };
  paintSheet();
  setTimeout(() => { const f = $('.sheet [autofocus]', ov); f && f.focus(); }, 350);
}
function paintSheet() {
  if (!SHEET) return; const o = SHEET.opts; const r = typeof o.render === 'function' ? o.render() : o;
  const sh = $('.sheet', SHEET.ov); const st = $('.sh-b', sh)?.scrollTop || 0;
  sh.innerHTML = `<div class="grab"></div><header class="sh-h"><div>${r.eyebrow ? `<div class="eyebrow">${r.eyebrow}</div>` : ''}<h2>${r.title}</h2>${r.sub ? `<div class="small muted" style="margin-top:4px">${r.sub}</div>` : ''}</div><button class="icon-btn" data-act="closeSheet" aria-label="Fechar">${ic('x')}</button></header><div class="sh-b">${r.body}</div>${r.foot ? `<footer class="sh-f">${r.foot}</footer>` : ''}`;
  $('.sh-b', sh).scrollTop = st;
  lucideIt(sh); animateIn(sh, !SHEET.painted); SHEET.painted = true; o.mount && o.mount(sh);
}
function closeSheet(instant) {
  if (!SHEET) return; const { ov } = SHEET; SHEET = null; document.body.style.overflow = '';
  if (instant) { ov.remove(); return; }
  ov.classList.add('closing'); setTimeout(() => ov.remove(), 280);
}
function confirmDialog({ title, text, okLabel = 'Confirmar', tone = '', field, required, onOk }) {
  openSheet({ kind: 'center', render: () => ({ title, body: `<p class="muted">${text}</p>${field ? `<div class="field mt"><label>${field}</label><textarea class="input" id="cf-note" placeholder="${required ? 'Obrigatório' : 'Opcional'}" autofocus></textarea></div>` : ''}`,
    foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn ${tone}" id="cf-ok">${okLabel}</button>` }),
    mount: (sh) => { $('#cf-ok', sh).onclick = () => { const n = $('#cf-note', sh); const v = n ? n.value.trim() : ''; if (required && !v) { n.classList.add('err'); n.focus(); setTimeout(() => n.classList.remove('err'), 500); toast('Informe uma justificativa.', 'warn'); return; } closeSheet(); onOk(v); }; } });
}

/* ---------- Lightbox ---------- */
function lightbox(list, idx = 0) {
  const lb = document.createElement('div'); lb.className = 'lightbox';
  const draw = () => { const p = list[idx]; lb.innerHTML = `<div class="lb-bar"><div><b>${esc(p.caption || '')}</b><div class="xs" style="opacity:.6">${esc(p.meta || '')}</div></div><button class="icon-btn" data-x aria-label="Fechar">${ic('x')}</button></div><div class="lb-img"><img src="${p.src}" alt="${esc(p.caption || 'Foto da obra')}"></div><div class="lb-bar"><button class="icon-btn" data-p aria-label="Anterior">${ic('chevron-left')}</button><span class="xs" style="opacity:.7">${idx + 1} / ${list.length} · imagem ilustrativa</span><button class="icon-btn" data-n aria-label="Próxima">${ic('chevron-right')}</button></div>`; lucideIt(lb); };
  lb.onclick = (e) => { if (e.target.closest('[data-x]') || e.target === lb) lb.remove(); else if (e.target.closest('[data-p]')) { idx = (idx - 1 + list.length) % list.length; draw(); } else if (e.target.closest('[data-n]')) { idx = (idx + 1) % list.length; draw(); } };
  const key = (e) => { if (!document.body.contains(lb)) return document.removeEventListener('keydown', key); if (e.key === 'Escape') lb.remove(); if (e.key === 'ArrowRight') { idx = (idx + 1) % list.length; draw(); } if (e.key === 'ArrowLeft') { idx = (idx - 1 + list.length) % list.length; draw(); } };
  document.addEventListener('keydown', key);
  let x0 = null; lb.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) { idx = (idx + (dx < 0 ? 1 : -1) + list.length) % list.length; draw(); } x0 = null; });
  draw(); document.body.appendChild(lb);
}

/* ---------- Components ---------- */
const STATUS_TONE = { 'Em execução': 'b-info', 'Em acabamento': 'b-warning', Planejamento: 'b-navy', 'Concluída': 'b-success' };
const badge = (txt, tone = '') => `<span class="badge ${tone}">${esc(txt)}</span>`;
const PSTATUS = {
  solicitacao: ['Solicitação', 'b-info'], cotacao: ['Em cotação', 'b-info'], revisao: ['Revisão solicitada', 'b-warning'], aguardando_cliente: ['Aguardando aprovação', 'b-warning'],
  aprovada: ['Aprovada', 'b-success'], pedido: ['Pedido emitido', 'b-navy'], recebido: ['Recebido', 'b-success'], conciliado: ['Conciliado', 'b-success'], rejeitada: ['Rejeitada', 'b-danger'],
};
const pbadge = (s) => badge(PSTATUS[s][0], PSTATUS[s][1]);
const bar = (v, tone = '', lg) => `<div class="bar ${tone} ${lg ? 'lg' : ''}"><i data-w="${v}" style="width:${v}%"></i></div>`;
function ring(v, size = 92, sw = 8, label) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, off = c * (1 - v / 100);
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" fill="none"/><circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${sw}" fill="none" stroke-dasharray="${c}" data-c="${c}" data-off="${off}" style="stroke-dashoffset:${off}"/></svg><div class="lbl">${label ?? `<b class="num" style="font-size:${size / 4.2}px;letter-spacing:-.03em" data-count="${v}" data-suf="%">${v}%</b>`}</div></div>`;
}
const kpi = (label, value, icon, delta = '', i = 0, raw) => `<div class="card kpi rv" style="--i:${i}"><div class="k-ic">${ic(icon)}</div><div class="k-l">${label}</div><div class="k-v num" ${raw != null ? `data-count="${raw}" data-fmt="${value.startsWith('R$') || value.startsWith('−R$') ? 'brl' : 'n'}"` : ''}>${value}</div>${delta ? `<div class="k-d">${delta}</div>` : ''}</div>`;
const empty = (icon, title, text, action = '') => `<div class="empty rv">${'<div class="e-ic">' + ic(icon) + '</div>'}<b>${title}</b><span class="small">${text}</span>${action}</div>`;
const photo = (src, cls = '', tag = '', attrs = '') => src ? `<div class="ph ${cls}" ${attrs}><img src="${src}" alt="${esc(tag || 'Foto da obra')}" loading="lazy">${tag ? `<span class="tag">${esc(tag)}</span>` : ''}<span class="note">ilustrativa</span></div>` : `<div class="ph ph-empty ${cls}" ${attrs}>${ic('drafting-compass')}</div>`;
function beforeAfter(a, b, la = 'ANTES', lb = 'DEPOIS', ratio = '4/3') {
  return `<div class="ba" data-ba style="aspect-ratio:${ratio}"><img src="${b}" alt="Depois"><div class="ba-top"><img src="${a}" alt="Antes"></div><div class="ba-h"></div><span class="lb l">${la}</span><span class="lb r">${lb}</span></div>`;
}
function mountBA(root) {
  $$('[data-ba]', root).forEach((el) => {
    if (el._ba) return; el._ba = 1;
    const set = (x) => { const r = el.getBoundingClientRect(); const p = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100)); el.style.setProperty('--p', p + '%'); };
    let drag = false;
    el.addEventListener('pointerdown', (e) => { drag = true; el.setPointerCapture(e.pointerId); set(e.clientX); });
    el.addEventListener('pointermove', (e) => drag && set(e.clientX));
    el.addEventListener('pointerup', () => (drag = false));
    // intro sweep (motion)
    if (!reduced) { let t0 = null; const step = (t) => { t0 ??= t; const k = Math.min(1, (t - t0) / 1600); const e = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k); el.style.setProperty('--p', e + '%'); if (k < 1 && !drag) requestAnimationFrame(step); }; const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { requestAnimationFrame(step); io.disconnect(); } }); io.observe(el); }
  });
}

/* Charts */
function lineChart(series, labels, { h = 190, money = true, todayIdx } = {}) {
  const W = 600, H = h, pl = 44, pr = 8, pt = 12, pb = 24;
  const all = series.flatMap((s) => s.values); const max = Math.max(...all, 1) * 1.12; const min = Math.min(0, ...all);
  const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1);
  const y = (v) => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  let g = '';
  for (let k = 0; k <= 3; k++) { const v = min + ((max - min) * k) / 3; g += `<line class="ax" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke-dasharray="${k ? '3 4' : ''}"/><text x="${pl - 6}" y="${y(v) + 3}" text-anchor="end">${money ? kbrl(v).replace('R$ ', '') : Math.round(v)}</text>`; }
  labels.forEach((l, i) => (g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${l}</text>`));
  if (todayIdx != null) g += `<line x1="${x(todayIdx)}" x2="${x(todayIdx)}" y1="${pt}" y2="${H - pb}" stroke="var(--danger)" stroke-dasharray="3 3"/>`;
  series.forEach((s, si) => {
    const pts = s.values.map((v, i) => [x(i), y(v)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    if (s.area) g += `<path class="area" d="${d} L${x(pts.length - 1)} ${y(min)} L${x(0)} ${y(min)} Z" fill="${s.color}" fill-opacity=".08"/>`;
    g += `<path class="draw" pathLength="1" d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 5"' : ''}/>`;
    pts.forEach((p, i) => (g += `<circle class="pt" style="--i:${i + si * 2}" cx="${p[0]}" cy="${p[1]}" r="3" fill="#fff" stroke="${s.color}" stroke-width="2"><title>${s.name}: ${money ? brl(s.values[i]) : s.values[i]}</title></circle>`));
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de linhas">${g}</svg>`;
}
function barChart(groups, labels, { h = 180, money = false, max: mx } = {}) {
  const W = 600, H = h, pl = 30, pb = 26, pt = 10; const n = labels.length; const gw = (W - pl) / n; const k = groups.length;
  const max = mx || Math.max(...groups.flatMap((g) => g.values), 1) * 1.1; const bw = Math.min(26, (gw * 0.7) / k);
  let g = ''; [0, 50, 100].forEach((v) => { if (mx === 100) { const yy = pt + (1 - v / 100) * (H - pt - pb); g += `<line class="ax" x1="${pl}" x2="${W}" y1="${yy}" y2="${yy}" stroke-dasharray="${v ? '3 4' : ''}"/><text x="${pl - 6}" y="${yy + 3}" text-anchor="end">${v}%</text>`; } });
  labels.forEach((l, i) => {
    const cx = pl + gw * i + gw / 2;
    groups.forEach((gr, j) => { const v = gr.values[i]; const bh = (v / max) * (H - pt - pb); const bx = cx - (k * bw) / 2 + j * bw + 1; g += `<rect class="vbar" style="--i:${i * k + j}" x="${bx}" y="${H - pb - bh}" width="${bw - 3}" height="${Math.max(0, bh)}" rx="4" fill="${gr.color}"><title>${gr.name}: ${money ? brl(v) : v + '%'}</title></rect>`; });
    g += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${l}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de barras">${g}</svg>`;
}
function donut(segs, size = 150, center = '') {
  const r = size / 2 - 12, c = 2 * Math.PI * r, tot = segs.reduce((a, s) => a + s.value, 0) || 1; let acc = 0;
  const arcs = segs.map((s) => { const len = (s.value / tot) * c; const el = `<circle class="seg-c" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="16" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-acc}" data-len="${len}" data-c="${c}"><title>${s.label}: ${brl(s.value)}</title></circle>`; acc += len; return el; }).join('');
  return `<div class="row" style="gap:18px;flex-wrap:wrap"><div style="position:relative;width:${size}px;height:${size}px;flex-shrink:0"><svg class="donut" width="${size}" height="${size}" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--bg-2)" stroke-width="16"/>${arcs}</svg><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">${center}</div></div><div class="stack-sm grow" style="min-width:150px">${segs.map((s) => `<div class="row small"><span class="lg-dot" style="background:${s.color}"></span><span class="grow muted">${s.label}</span><b class="num">${Math.round((s.value / tot) * 100)}%</b></div>`).join('')}</div></div>`;
}
const CAT_COLORS = { 'Mão de obra': '#103244', Materiais: '#3E6A86', 'Serviços terceirizados': '#397A69', Equipamentos: '#C18A44', Administrativo: '#9AA7AE', 'Outros': '#B85F5F' };

/* Gantt */
function gantt(tasks, { zoom = 'week', editable = false, nameW = 0, period = 'all', group = false } = {}) {
  if (!tasks.length) return empty('calendar-x', 'Sem atividades no período', 'Ajuste o filtro para ver outras etapas.');
  const now = F.todayISO();
  let lo = tasks.reduce((m, t) => (t.start < m ? t.start : m), tasks[0].start), hi = tasks.reduce((m, t) => (t.end > m ? t.end : m), tasks[0].end);
  tasks.forEach((t) => { if (t.baseEnd > hi) hi = t.baseEnd; if (t.baseStart < lo) lo = t.baseStart; });
  if (period === 'next30') { lo = F.D(-7); hi = F.D(30); } if (period === 'last30') { lo = F.D(-30); hi = F.D(7); }
  const px = zoom === 'week' ? 20 : 6; const nw = nameW || (innerWidth < 720 ? 132 : 210);
  const start = F.dayDiff(lo, now) - 3; const days = F.dayDiff(hi, lo) + 8; const W = days * px;
  const X = (iso) => (F.dayDiff(iso, now) - start) * px;
  let cols = '';
  if (zoom === 'week') { for (let d = 0; d < days; d += 7) { const iso = F.D(start + d); cols += `<div class="g-col" style="left:${d * px}px;width:${7 * px}px">${fshort(iso)}<small>sem ${Math.ceil((pd(iso).getDate()) / 7)}</small></div>`; } }
  else { let d0 = pd(F.D(start)); d0 = new Date(d0.getFullYear(), d0.getMonth(), 1); for (let k = 0; k < 14; k++) { const m = new Date(d0.getFullYear(), d0.getMonth() + k, 1); const iso = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-01`; const l = X(iso); if (l > W) break; const nd = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(); cols += `<div class="g-col" style="left:${Math.max(0, l)}px;width:${nd * px}px">${MES[m.getMonth()]}<small>${m.getFullYear()}</small></div>`; } }
  const rowH = 54; const idx = Object.fromEntries(tasks.map((t, i) => [t.id, i]));
  const rows = tasks.map((t, i) => {
    const late = F.isLate(t), done = t.progress >= 100; const l = X(t.start), w = Math.max(px, (F.dayDiff(t.end, t.start) + 1) * px);
    const cls = done ? 'done' : late ? 'late' : t.progress === 0 ? 'zero' : '';
    const slip = F.slip(t);
    const bl = slip !== 0 ? `<div class="g-base" style="left:${X(t.baseStart)}px;width:${(F.dayDiff(t.baseEnd, t.baseStart) + 1) * px}px" title="Linha de base"></div>` : '';
    const ms = t.milestone ? `<div class="g-ms" style="left:${X(t.end) + px}px" data-act="openTask" data-id="${t.id}" title="Marco: ${esc(t.name)}"></div>` : '';
    const sub = group ? `${esc(t.sub || '')}` : `${fshort(t.start)} → ${fshort(t.end)}${late ? ` · <b style="color:var(--danger)">${F.lateDays(t)}d atraso</b>` : slip > 0 ? ` · <span style="color:var(--warning)">+${slip}d</span>` : ''}`;
    return `<div class="g-row"><div class="g-name" style="width:${nw}px" data-act="${group ? 'goProject' : 'openTask'}" data-id="${group ? t.projectId : t.id}"><b>${esc(t.name)}</b><span>${sub}</span></div><div class="g-track">${bl}<div class="g-bar ${cls}" style="--i:${i};left:${l}px;width:${w}px" data-act="${group ? 'goProject' : 'openTask'}" data-id="${group ? t.projectId : t.id}" title="${esc(t.name)} — ${t.progress}%"><i style="width:${t.progress}%"></i><span>${t.progress}%</span></div>${ms}</div></div>`;
  }).join('');
  let deps = '';
  if (!group) tasks.forEach((t, i) => (t.deps || []).forEach((d) => { if (idx[d] == null) return; const s = tasks[idx[d]]; const x1 = nw + X(s.end) + px, y1 = 44 + idx[d] * rowH + 27, x2 = nw + X(t.start), y2 = 44 + i * rowH + 27; const mx = Math.max(x1 + 6, x2 - 6); deps += `<path d="M${x1} ${y1} H${mx} V${y2} H${x2}"/>`; }));
  const todayX = nw + X(now);
  return `<div class="gantt"><div class="g-scroll" data-gscroll="${todayX}|${nw}"><div class="g-inner" style="width:${nw + W}px"><div class="g-head"><div class="g-lab" style="width:${nw}px">Etapa</div><div class="g-cols">${cols}</div></div>${rows}<svg class="g-deps" width="${nw + W}" height="${44 + tasks.length * rowH}">${deps}</svg><div class="g-today" style="left:${todayX}px"></div></div></div></div>`;
}
const ganttLegend = () => `<div class="legend mt"><span><i style="background:var(--success)"></i>Concluída</span><span><i style="background:var(--navy)"></i>Em andamento</span><span><i style="background:var(--danger)"></i>Atrasada</span><span><i style="background:#B9C1C5;height:3px"></i>Linha de base</span><span><i style="background:var(--warning);transform:rotate(45deg);width:9px;height:9px"></i>Marco</span><span><i style="background:var(--danger);width:2px;height:12px"></i>Hoje</span></div>`;

/* ---------- Motion: animate on mount ---------- */
function countUp(el) {
  const to = parseFloat(el.dataset.count); if (isNaN(to)) return; const fmt = el.dataset.fmt; const suf = el.dataset.suf || ''; const t0 = performance.now(); const D = 1100;
  const f = (v) => (fmt === 'brl' ? kbrl(v) : Math.round(v).toLocaleString('pt-BR') + suf);
  const final = el.textContent;
  const tick = (t) => { const k = Math.min(1, (t - t0) / D); const e = 1 - Math.pow(1 - k, 4); el.textContent = k < 1 ? f(to * e) : final; if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
function animateIn(root, hard = true) {
  mountBA(root);
  $$('[data-gscroll]', root).forEach((g) => { const [x, nw] = g.dataset.gscroll.split('|').map(Number); g.scrollLeft = Math.max(0, x - nw - (g.clientWidth - nw) * 0.62); });
  if (!hard || reduced) return;
  $$('.bar>i[data-w]', root).forEach((b) => { const w = b.dataset.w; b.style.transition = 'none'; b.style.width = '0%'; b.offsetWidth; b.style.transition = ''; setTimeout(() => (b.style.width = w + '%'), 120); });
  $$('.ring .val', root).forEach((c) => { const off = c.dataset.off; c.style.transition = 'none'; c.style.strokeDashoffset = c.dataset.c; c.getBoundingClientRect(); c.style.transition = ''; setTimeout(() => (c.style.strokeDashoffset = off), 150); });
  $$('.donut .seg-c', root).forEach((c, i) => { const len = c.dataset.len, C = c.dataset.c; c.style.transition = 'none'; c.setAttribute('stroke-dasharray', `0 ${C}`); c.getBoundingClientRect(); c.style.transition = ''; setTimeout(() => c.setAttribute('stroke-dasharray', `${len} ${C - len}`), 150 + i * 90); });
  $$('[data-count]', root).forEach(countUp);
  const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
  $$('.io', root).forEach((el) => io.observe(el));
}

/* ---------- Store mutation ---------- */
function commit(fn, msg, tone = 'ok') {
  fn(S()); F.save(); render({ soft: true }); paintSheet(); if (msg) toast(msg, tone);
}

/* ---------- Finesse AI (adapter determinístico) ---------- */
const AI = {
  // Adapter: substituir por provider real (ex.: LLM com tools de consulta) mantendo a assinatura answer(question, ctx) → {html, links}
  answer(q, r) {
    const n = norm(q);
    const has = (...k) => k.some((w) => n.includes(w));
    if (r === 'client') return this.client(n, has);
    if (r === 'field') return this.field(n, has);
    return this.wellington(n, has);
  },
  client(n, has) {
    const pid = 'p1'; const p = F.proj(pid); const prog = F.progressOf(pid); const end = F.projectEnd(pid); const cur = F.currentTask(pid);
    const pub = S().logs.filter((l) => l.projectId === pid && l.status === 'publicado').sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    if (has('margem', 'lucro', 'custo interno', 'quanto a finesse', 'fornecedor paga', 'resultado financeiro')) return { html: 'Essa informação é interna da Finesse Engenharia e não está disponível no seu portal. Posso ajudar com status, prazos, fotos e aprovações da sua obra.', links: [] };
    if (has('hoje', 'aconteceu', 'executad', 'fizeram', 'feito')) {
      const l = pub.find((x) => x.date === F.todayISO());
      if (!l) { const last = pub[0]; return { html: `Ainda não há registro publicado hoje. O último diário foi publicado em ${fdate(last.date)}: ${last.services.join('; ').toLowerCase()}.`, links: [{ label: 'Abrir diário de obra', route: '#/client/timeline' }] }; }
      const occ = /sem ocorr/i.test(l.occurrences) ? 'não há ocorrências críticas no diário de hoje' : `foi registrada a ocorrência: ${l.occurrences.toLowerCase()}`;
      const verb = (s) => /^Conclu[ií]d[ao]s? /i.test(s) ? s.replace(/^Conclu[ií]d[ao]s? /i, 'concluiu ') : /^Iniciad[ao]s? /i.test(s) ? s.replace(/^Iniciad[ao]s? /i, 'iniciou ') : 'realizou: ' + s.charAt(0).toLowerCase() + s.slice(1);
      return { html: `Hoje a equipe ${l.services.map(verb).join(' e ')}. Foram registradas ${l.photos.length} nova${l.photos.length !== 1 ? 's' : ''} foto${l.photos.length !== 1 ? 's' : ''} e ${occ}. Equipe presente: ${l.workers} profissionais.`, links: [{ label: 'Ver diário de hoje', route: '#/client/timeline' }, { label: 'Ver fotos', route: '#/client/gallery' }] };
    }
    if (has('atras', 'demora', 'atraso')) {
      const late = F.tasksOf(pid).filter(F.isLate);
      if (!late.length) return { html: 'Não há atividades atrasadas no cronograma neste momento. 👍', links: [{ label: 'Abrir cronograma', route: '#/client/schedule' }] };
      return { html: `Sim. ${late.map((t) => `<b>${t.name}</b> está com ${F.lateDays(t)} dia${F.lateDays(t) > 1 ? 's' : ''} de atraso (${t.progress}% executado)`).join('; ')}. A previsão de entrega da obra segue em ${fdate(end)}; a equipe da Finesse acompanha o ponto diariamente.`, links: [{ label: 'Ver no cronograma', route: '#/client/schedule' }] };
    }
    if (has('aprova', 'compra', 'orcament', 'pendenc', 'pendente')) {
      const pc = F.pendingClient(pid);
      if (!pc.length) return { html: 'Você não tem compras aguardando aprovação no momento.', links: [{ label: 'Histórico de decisões', route: '#/client/approvals' }] };
      return { html: `Há ${pc.length} compra${pc.length > 1 ? 's' : ''} aguardando sua aprovação:<ul>${pc.map((x) => `<li><b>${x.id}</b> — ${x.material} (${x.qty} ${x.unit}): ${brl2(x.quotes[x.selected].price)}</li>`).join('')}</ul>`, links: pc.map((x) => ({ label: 'Analisar ' + x.id, route: '#/client/approvals?id=' + x.id })) };
    }
    if (has('proxima semana', 'semana que vem', 'proximos dias', 'proxima etapa', 'proxima atividade')) {
      const nx = F.tasksOf(pid).filter((t) => t.progress < 100 && F.dayDiff(t.start, F.D(14)) <= 0 && F.dayDiff(t.end, F.todayISO()) >= -30);
      return { html: `Para os próximos dias estão programadas:<ul>${nx.map((t) => `<li><b>${t.name}</b> — ${fshort(t.start)} a ${fshort(t.end)} (${t.progress}% executado)</li>`).join('')}</ul>`, links: [{ label: 'Abrir cronograma', route: '#/client/schedule' }] };
    }
    if (has('previs', 'entrega', 'prazo', 'termina', 'quando fica pronta')) {
      const left = F.dayDiff(end, F.todayISO());
      return { html: `A previsão de entrega da <b>${p.name}</b> é <b>${fdate(end)}</b> — faltam ${left} dias. A obra está com ${prog}% de execução e a etapa final é “Vistoria e entrega”.`, links: [{ label: 'Ver marcos no cronograma', route: '#/client/schedule' }] };
    }
    if (has('foto', 'imagem', 'galeria')) {
      const ph = S().photos.filter((x) => x.projectId === pid);
      return { html: `Sua obra tem ${ph.length} fotos publicadas, organizadas por ambiente, data e etapa. Os ambientes com comparação antes/depois são: ${[...new Set(ph.filter((x) => x.pair).map((x) => x.room))].join(', ')}.`, links: [{ label: 'Abrir galeria', route: '#/client/gallery' }] };
    }
    const l = pub[0];
    return { html: `A <b>${p.name}</b> está com <b>${prog}% de execução</b>. Etapa atual: ${cur ? cur.name : '—'}. Última atualização: ${rel(l.date).toLowerCase()}, às ${l.time}. Previsão de entrega: ${fdate(end)}.`, links: [{ label: 'Painel da obra', route: '#/client' }, { label: 'Cronograma', route: '#/client/schedule' }] };
  },
  wellington(n, has) {
    const P = S().projects.filter((p) => p.status !== 'Concluída');
    if (has('margem', 'lucro', 'resultado', 'rentab')) {
      const rows = S().projects.map((p) => [p, F.finOf(p.id)]).sort((a, b) => a[1].marginPct - b[1].marginPct);
      return { html: `Margem projetada por obra (dados demonstrativos):<ul>${rows.map(([p, f]) => `<li><b>${p.name}</b>: ${f.marginPct.toFixed(1).replace('.', ',')}% (${kbrl(f.margin)})</li>`).join('')}</ul>Carteira consolidada: ${F.finOf().marginPct.toFixed(1).replace('.', ',')}%.`, links: [{ label: 'Abrir financeiro', route: '#/command/finance' }] };
    }
    if (has('custo', 'gasto', 'despesa', 'orcamento')) {
      const rows = P.map((p) => [p, F.finOf(p.id)]);
      return { html: `Custos realizados x orçamento:<ul>${rows.map(([p, f]) => `<li><b>${p.name}</b>: ${kbrl(f.costReal)} de ${kbrl(f.budget)} (${Math.round((f.costReal / f.budget) * 100)}%) · físico ${F.progressOf(p.id)}%${f.extra ? ` · <span style="color:var(--danger)">+${kbrl(f.extra)} fora do orçamento</span>` : ''}</li>`).join('')}</ul>`, links: [{ label: 'Desvios de orçamento', route: '#/command/finance' }] };
    }
    if (has('compra', 'suprimento', 'material')) {
      const rv = F.pendingReview(), cl = F.pendingClient();
      return { html: `Wellington, há ${rv.length} solicitaç${rv.length !== 1 ? 'ões' : 'ão'} aguardando sua análise${rv.length ? ` (${rv.map((x) => x.id).join(', ')})` : ''} e ${cl.length} aguardando aprovação de cliente${cl.length ? ` (${cl.map((x) => x.id).join(', ')})` : ''}.`, links: [{ label: 'Abrir compras', route: '#/command/purchases' }] };
    }
    if (has('equipe', 'time', 'profission', 'pessoas')) {
      return { html: `Equipe ativa: ${S().people.length} profissionais.<ul>${P.map((p) => `<li><b>${p.name}</b>: ${S().people.filter((x) => x.projects.includes(p.id)).map((x) => x.name.split(' ')[0]).join(', ') || 'sem alocação'}</li>`).join('')}</ul>`, links: [{ label: 'Gestão de equipes', route: '#/command/team' }] };
    }
    if (has('atras', 'atraso')) {
      const late = S().tasks.filter(F.isLate);
      return { html: late.length ? `Atividades atrasadas:<ul>${late.map((t) => `<li><b>${F.proj(t.projectId).name}</b> — ${t.name}: ${F.lateDays(t)} dia(s), ${t.progress}%</li>`).join('')}</ul>` : 'Nenhuma atividade atrasada na carteira. 👏', links: late.map((t) => ({ label: 'Cronograma ' + F.proj(t.projectId).name.split(' ').slice(-2).join(' '), route: '#/command/planning?p=' + t.projectId })) };
    }
    if (has('entrega', 'prazo', 'marco')) {
      const ms = S().tasks.filter((t) => t.milestone && t.progress < 100).sort((a, b) => a.end.localeCompare(b.end));
      const dl = S().purchases.filter((p) => p.status === 'pedido' && p.delivery);
      return { html: `Próximas entregas:<ul>${ms.map((t) => `<li><b>${F.proj(t.projectId).name}</b> — ${fdate(t.end)} (${rel(t.end).toLowerCase()})</li>`).join('')}${dl.map((p) => `<li>Material: ${p.material} — ${fdate(p.delivery)}</li>`).join('')}</ul>`, links: [{ label: 'Planejamento', route: '#/command/planning' }] };
    }
    // default: atenção
    const late = S().tasks.filter(F.isLate); const rv = F.pendingReview(); const tom = S().purchases.filter((p) => p.delivery === F.D(1) && p.status === 'pedido'); const lg = F.logsPendingReview();
    const items = [];
    late.forEach((t) => items.push({ t: `uma atividade atrasada na ${F.proj(t.projectId).name} (${t.name})`, l: { label: 'Ver atraso', route: '#/command/planning?p=' + t.projectId } }));
    if (rv.length) items.push({ t: `${rv.length === 1 ? 'uma solicitação' : rv.length === 2 ? 'duas solicitações' : rv.length + ' solicitações'} de compra pendente${rv.length > 1 ? 's' : ''}`, l: { label: 'Compras pendentes', route: '#/command/purchases' } });
    tom.forEach((p) => items.push({ t: `uma entrega de material prevista para amanhã (${p.material})`, l: { label: p.id, route: '#/command/purchases?id=' + p.id } }));
    lg.forEach((x) => items.push({ t: `um diário de obra aguardando publicação (${F.proj(x.projectId).name})`, l: { label: 'Revisar diário', route: '#/command/projects/' + x.projectId + '?tab=diario' } }));
    const num = ['nenhum', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis'][items.length] || items.length;
    return { html: items.length ? `Wellington, identifiquei ${num} ponto${items.length > 1 ? 's' : ''} de atenção na sua carteira demonstrativa: ${items.map((i) => i.t).join(', ').replace(/, ([^,]*)$/, ' e $1')}.` : 'Wellington, não há pontos críticos hoje. Todas as obras estão dentro do planejado.', links: items.map((i) => i.l) };
  },
  field(n) {
    const ts = S().tasks.filter((t) => fieldProjects().some((p) => p.id === t.projectId) && t.progress < 100 && F.dayDiff(F.todayISO(), t.start) >= 0);
    return { html: `Diego, suas atividades em andamento:<ul>${ts.map((t) => `<li><b>${t.name}</b> — ${F.proj(t.projectId).name} (${t.progress}%)</li>`).join('')}</ul>`, links: [{ label: 'Registrar diário', route: '#/field/daily-log' }] };
  },
};

/* ---------- Router ---------- */
const ROUTES = [];
const route = (pattern, env, view) => ROUTES.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), env, view });
function parse() {
  const h = location.hash.slice(1) || '/'; const [path, qs] = h.split('?');
  return { path: path.replace(/\/$/, '') || '/', q: Object.fromEntries(new URLSearchParams(qs || '')) };
}
const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
let LAST_ENV = null;
let CUR = null;
function render({ soft = false } = {}) {
  const { path, q } = parse();
  let m = null, r;
  for (r of ROUTES) { m = path.match(r.re); if (m) break; }
  if (!m) { go('#/'); return; }
  // perfil simulado: rota define o ambiente
  const envRole = { command: 'wellington', client: 'client', field: 'field' }[r.env];
  if (envRole && role() !== envRole) { S().role = envRole; F.save(); if (!soft) toast(`Perfil demonstrativo: ${ROLES[envRole].name}`, 'info', 'user-round'); }
  CUR = { r, params: m.groups || {}, q, path };
  const app = $('#app');
  const paint = () => {
    let html;
    try { html = r.view(CUR.params, q); } catch (e) { console.error(e); html = `<div class="content">${empty('alert-octagon', 'Algo não saiu como esperado', 'Recarregue a página ou restaure os dados de demonstração.', '<button class="btn sm mt" data-act="resetDemo">Restaurar dados</button>')}</div>`; }
    if (r.env && r.env !== 'public') {
      const keepScroll = soft ? scrollY : 0;
      app.innerHTML = shell(r.env, html);
      app.classList.toggle('no-anim', soft);
      lucideIt(app); animateIn(app, !soft);
      if (soft) scrollTo(0, keepScroll); else scrollTo(0, 0);
    } else {
      app.innerHTML = html; app.classList.toggle('no-anim', soft); lucideIt(app); animateIn(app, !soft); if (!soft) scrollTo(0, 0);
    }
    r.view.after && r.view.after(app, CUR);
    document.title = (r.view.title ? r.view.title(CUR.params) + ' · ' : '') + 'Finesse OS';
  };
  if (soft || !document.startViewTransition || reduced || document.hidden) paint();
  else { const vt = document.startViewTransition(paint); vt.ready.catch(() => {}); vt.finished.catch(() => {}); vt.updateCallbackDone.catch(() => {}); }
  LAST_ENV = r.env;
}

/* ---------- Shell ---------- */
const NAV = {
  command: [
    ['sec', 'Visão geral'], ['#/command', 'Cockpit', 'layout-dashboard'], ['#/command/alerts', 'Alertas', 'bell', () => F.alerts().filter((a) => !S().readAlerts.includes(a.id)).length], ['#/command/ai', 'Finesse AI', 'sparkles'],
    ['sec', 'Operação'], ['#/command/projects', 'Obras', 'building-2'], ['#/command/planning', 'Planejamento', 'gantt-chart'], ['#/command/purchases', 'Compras', 'shopping-cart', () => F.pendingReview().length], ['#/command/team', 'Equipes', 'users'],
    ['sec', 'Gestão'], ['#/command/finance', 'Financeiro', 'wallet'], ['#/command/clients', 'Clientes', 'handshake'], ['#/command/reports', 'Relatórios', 'file-bar-chart'], ['#/command/settings', 'Configurações', 'settings-2'],
  ],
  client: [['#/client', 'Início', 'home'], ['#/client/schedule', 'Cronograma', 'gantt-chart'], ['#/client/timeline', 'Diário', 'notebook-text'], ['#/client/approvals', 'Aprovações', 'badge-check', () => F.pendingClient('p1').length], ['#/client/gallery', 'Galeria', 'images'], ['#/client/documents', 'Documentos', 'folder-open'], ['#/client/ai', 'Finesse AI', 'sparkles']],
  field: [['#/field', 'Hoje', 'sun'], ['#/field/tasks', 'Atividades', 'list-checks'], ['#/field/daily-log', 'Diário', 'camera'], ['#/field/materials', 'Materiais', 'package']],
};
const TABS = {
  command: [['#/command', 'Cockpit', 'layout-dashboard'], ['#/command/projects', 'Obras', 'building-2'], ['#/command/purchases', 'Compras', 'shopping-cart', () => F.pendingReview().length], ['#/command/finance', 'Financeiro', 'wallet'], ['more', 'Mais', 'menu']],
  client: [['#/client', 'Início', 'home'], ['#/client/schedule', 'Cronograma', 'gantt-chart'], ['#/client/timeline', 'Diário', 'notebook-text'], ['#/client/approvals', 'Aprovar', 'badge-check', () => F.pendingClient('p1').length], ['more', 'Mais', 'menu']],
  field: [['#/field', 'Hoje', 'sun'], ['#/field/tasks', 'Atividades', 'list-checks'], ['#/field/daily-log', 'Diário', 'camera'], ['#/field/materials', 'Materiais', 'package']],
};
function isOn(href) { const p = '#' + CUR.path; return href === p || (href !== '#/command' && href !== '#/client' && href !== '#/field' && p.startsWith(href)); }
function shell(env, content) {
  const R = ROLES[role()];
  const nav = NAV[env].map((n) => n[0] === 'sec' ? `<div class="sec">${n[1]}</div>` : (() => { const c = n[3] ? n[3]() : 0; return `<a href="${n[0]}" class="${isOn(n[0]) ? 'on' : ''}">${ic(n[2])}<span>${n[1]}</span>${c ? `<span class="cnt">${c}</span>` : ''}</a>`; })()).join('');
  const tabs = TABS[env].map((n) => { const c = n[3] ? n[3]() : 0; const inner = `${ic(n[2])}<span>${n[1]}</span>${c ? `<span class="dot">${c}</span>` : ''}`; return n[0] === 'more' ? `<button data-act="moreMenu">${inner}</button>` : `<a href="${n[0]}" class="${isOn(n[0]) ? 'on' : ''}">${inner}</a>`; }).join('');
  const alertsN = env === 'command' ? F.alerts().filter((a) => !S().readAlerts.includes(a.id)).length : env === 'client' ? F.pendingClient('p1').length : 0;
  const title = CUR.r.view.title ? CUR.r.view.title(CUR.params) : R.label;
  return `<div class="shell">
  <aside class="sidebar"><a href="#/portfolio" class="brand">${logo()}</a><div class="env"><b>${R.label}</b>${env === 'client' ? 'Residência Jardim Europa' : env === 'field' ? 'Operação de campo' : 'Gestão executiva'}</div><nav>${nav}</nav>
    <div class="sb-foot"><button data-act="switchProfile"><span class="avatar sm" style="background:rgba(255,255,255,.14)">${initials(R.name)}</span><span class="grow"><b style="color:#fff;display:block;font-size:13px">${R.name}</b><span style="font-size:11px;opacity:.7">Trocar perfil (simulado)</span></span>${ic('chevrons-up-down', 'ic-sm')}</button></div></aside>
  <div class="main">
    <header class="topbar" id="topbar"><span class="mob-only" style="color:var(--navy)">${MARK}</span><div class="tb-title"><div class="eyebrow">${R.label}</div><b>${esc(title)}</b></div>
      <span class="demo-pill desk-only">${ic('flask-conical', 'ic-sm')} Demonstração · dados fictícios</span>
      ${env !== 'field' ? `<button class="icon-btn" data-go="${env === 'command' ? '#/command/ai' : '#/client/ai'}" aria-label="Finesse AI">${ic('sparkles')}</button>` : ''}
      ${env !== 'field' ? `<button class="icon-btn" data-act="notifications" aria-label="Notificações">${ic('bell')}${alertsN ? '<span class="pip"></span>' : ''}</button>` : ''}
      <button class="icon-btn mob-only" data-act="switchProfile" aria-label="Trocar perfil"><span class="avatar sm">${initials(R.name)}</span></button>
    </header>
    <main class="content" id="content">${content}</main>
  </div>
  <nav class="tabbar" aria-label="Navegação">${tabs}</nav></div>`;
}
addEventListener('scroll', () => { const t = $('#topbar'); t && t.classList.toggle('scrolled', scrollY > 4); const n = $('.pf-nav'); n && n.classList.toggle('solid', scrollY > innerHeight * 0.6 || !$('.pf-hero')); }, { passive: true });

/* ---------- Global actions ---------- */
const ACT = {
  closeSheet: () => closeSheet(),
  resetDemo: () => confirmDialog({ title: 'Restaurar dados de demonstração?', text: 'Todas as alterações feitas nesta demonstração serão descartadas neste navegador.', okLabel: 'Restaurar', tone: 'danger', onOk: () => { F.reset(); S().role = 'wellington'; S().onboarded = true; F.save(); toast('Dados restaurados.'); go('#/command'); } }),
  switchProfile: () => openSheet({ kind: 'center', render: () => ({ eyebrow: 'Autenticação simulada', title: 'Trocar perfil', sub: 'A troca de perfil não apaga os dados da demonstração.',
    body: `<div class="stack">${Object.entries(ROLES).map(([k, R], i) => `<button class="role-card" style="--i:${i}" data-act="pickRole" data-r="${k}"><span class="rc-ic">${ic(R.icon)}</span><span><b>${R.name}</b><span>${R.label} · ${R.sub}</span></span>${role() === k ? badge('Ativo', 'b-success') : `<span class="go">${ic('arrow-right')}</span>`}</button>`).join('')}
      <div class="row wrap"><button class="btn ghost sm" data-act="goto" data-h="#/portfolio">${ic('gem')} Portfólio público</button><button class="btn ghost sm" data-act="goto" data-h="#/onboarding/1">${ic('rotate-ccw')} Reiniciar onboarding</button></div></div>` }) }),
  pickRole: (el) => { const k = el.dataset.r; S().role = k; F.save(); closeSheet(); go(ROLES[k].home); toast(`Você entrou como ${ROLES[k].name}.`, 'ok', 'user-round-check'); },
  goto: (el) => { closeSheet(); go(el.dataset.h); },
  moreMenu: () => { const env = CUR.r.env; openSheet({ kind: 'sheet', render: () => ({ title: 'Menu', body: `<div class="list">${NAV[env].filter((n) => n[0] !== 'sec').map((n) => `<div class="li click" data-act="goto" data-h="${n[0]}"><span class="li-ic">${ic(n[2])}</span><div class="li-b"><b>${n[1]}</b></div>${ic('chevron-right', 'ic-sm')}</div>`).join('')}<div class="li click" data-act="switchProfile"><span class="li-ic">${ic('repeat')}</span><div class="li-b"><b>Trocar perfil</b><span>Autenticação simulada</span></div></div></div>` }) }); },
  notifications: () => {
    const env = CUR.r.env;
    if (env === 'client') { const pc = F.pendingClient('p1'); openSheet({ render: () => ({ title: 'Notificações', body: pc.length ? `<div class="stack">${pc.map((p, i) => `<div class="alert-item rv" style="--i:${i}" data-act="goto" data-h="#/client/approvals?id=${p.id}"><span class="a-ic b-warning">${ic('badge-check')}</span><div><b class="small">Aprovação pendente — ${p.id}</b><div class="small muted">${p.material}: ${brl2(p.quotes[p.selected].price)}</div></div></div>`).join('')}</div>` : empty('bell-off', 'Tudo em dia', 'Você não tem pendências.') }) }); return; }
    go('#/command/alerts');
  },
  openPhoto: (el) => { const list = JSON.parse(el.dataset.list); lightbox(list, +el.dataset.i || 0); },
  goProject: (el) => go('#/command/projects/' + el.dataset.id),
  aiAsk: (el) => aiSend(el.dataset.q),
  aiLink: (el) => go(el.dataset.h),
};
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-act]'); if (a && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a, e); return; }
  const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); }
});
document.addEventListener('submit', (e) => { const f = e.target.closest('[data-form]'); if (f && FORMS[f.dataset.form]) { e.preventDefault(); FORMS[f.dataset.form](f, Object.fromEntries(new FormData(f)), e); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && SHEET) closeSheet(); });
const FORMS = {};
const need = (f, names) => { let ok = true; names.forEach((n) => { const el = f.elements[n]; if (el && !String(el.value).trim()) { el.classList.add('err'); setTimeout(() => el.classList.remove('err'), 500); ok = false; } }); if (!ok) toast('Preencha os campos obrigatórios.', 'warn'); return ok; };

/* ---------- AI chat runtime ---------- */
function aiSend(text) {
  text = (text || '').trim(); if (!text) return;
  const r = role(); const log = S().chat[r]; log.push({ me: true, text }); F.save();
  const box = $('#chat-log'); if (!box) return;
  box.insertAdjacentHTML('beforeend', `<div class="msg me">${esc(text)}</div><div class="msg ai" id="typing"><div class="ai-h">${ic('sparkles', 'ic-sm')} Finesse AI</div><span class="typing"><i></i><i></i><i></i></span></div>`);
  lucideIt(box); box.scrollTop = box.scrollHeight; const inp = $('#chat-in'); if (inp) inp.value = '';
  setTimeout(() => {
    const ans = AI.answer(text, r); log.push({ me: false, ...ans }); F.save();
    const t = $('#typing'); if (!t) return; t.removeAttribute('id');
    t.innerHTML = `<div class="ai-h">${ic('sparkles', 'ic-sm')} Finesse AI</div><div class="ai-body"></div>`; lucideIt(t);
    const body = $('.ai-body', t);
    // streaming palavra a palavra (motion)
    const tmp = document.createElement('div'); tmp.innerHTML = ans.html; const words = ans.html.split(/(\s+)/); let i = 0;
    const tick = () => { i += 3; body.innerHTML = words.slice(0, i).join(''); box.scrollTop = box.scrollHeight; if (i < words.length) setTimeout(tick, 28); else { body.innerHTML = ans.html; if (ans.links?.length) { body.insertAdjacentHTML('afterend', `<div class="links">${ans.links.map((l) => `<a data-act="aiLink" data-h="${l.route}">${esc(l.label)} ${ic('arrow-up-right', 'ic-sm')}</a>`).join('')}</div>`); lucideIt(t); } box.scrollTop = box.scrollHeight; } };
    reduced ? (i = words.length, tick()) : tick();
  }, 650 + Math.random() * 450);
}
function chatView(r, sugg, intro) {
  const log = S().chat[r];
  const msgs = log.map((m) => m.me ? `<div class="msg me">${esc(m.text)}</div>` : `<div class="msg ai"><div class="ai-h">${ic('sparkles', 'ic-sm')} Finesse AI</div>${m.html}${m.links?.length ? `<div class="links">${m.links.map((l) => `<a data-act="aiLink" data-h="${l.route}">${esc(l.label)} ${ic('arrow-up-right', 'ic-sm')}</a>`).join('')}</div>` : ''}</div>`).join('');
  return `<div class="chat"><div class="chat-log" id="chat-log"><div class="msg ai"><div class="ai-h">${ic('sparkles', 'ic-sm')} Finesse AI</div>${intro}<div class="xs faint" style="margin-top:8px">Respostas demonstrativas e determinísticas, geradas a partir dos dados da obra e das permissões do seu perfil.</div></div>${msgs}</div>
  <div class="sugg">${sugg.map((s) => `<button class="chip" data-act="aiAsk" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  <form class="chat-in" data-form="chat"><input class="input" id="chat-in" name="q" placeholder="Pergunte sobre sua obra…" autocomplete="off" aria-label="Pergunta"><button class="btn" aria-label="Enviar">${ic('arrow-up')}</button></form>
  ${log.length ? `<button class="link xs" style="margin-top:6px;align-self:center" data-act="aiClear">Limpar conversa</button>` : ''}</div>`;
}
FORMS.chat = (f, d) => aiSend(d.q);
ACT.aiClear = () => commit((s) => (s.chat[role()] = []));
function chatAfter() { const b = $('#chat-log'); if (b) b.scrollTop = b.scrollHeight; }
