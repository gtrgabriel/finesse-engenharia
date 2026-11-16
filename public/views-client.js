/* ==========================================================================
   FINESSE OS — Finesse Client (portal do cliente) + drawer de atividade
   Regra: cliente vê somente a própria obra (p1), diário publicado e
   compras encaminhadas a ele. Sem dados financeiros internos.
   ========================================================================== */
const CPID = 'p1';
const UI = { zoom: innerWidth >= 1024 ? 'month' : 'week', period: 'all', tlView: 'dia', galDim: 'room', galVal: 'Todos', docCat: 'Todos', apprTab: 'pend' };
const pubLogs = (pid) => S().logs.filter((l) => l.projectId === pid && l.status === 'publicado').sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
const photoList = (srcs, caption, meta) => JSON.stringify(srcs.map((s) => ({ src: s, caption, meta }))).replace(/"/g, '&quot;');

/* ---------- Dashboard ---------- */
function viewClientHome() {
  const p = F.proj(CPID); const prog = F.progressOf(CPID); const end = F.projectEnd(CPID); const cur = F.currentTask(CPID); const nx = F.nextTask(CPID);
  const last = pubLogs(CPID)[0]; const pend = F.pendingClient(CPID); const left = F.dayDiff(end, F.todayISO()); const ts = F.tasksOf(CPID);
  return `<div class="page-h rv"><div><div class="eyebrow">${fdate(F.todayISO())}</div><h1 style="margin-top:6px">${greet()}, Marina.</h1><p>Veja como está a sua obra hoje.</p></div></div>
  <div class="grid lg-21">
    <div class="stack">
      <div class="hero-card rv" style="--i:1"><div class="bg">${p.cover ? `<img src="${p.cover}" alt="Capa da obra (ilustrativa)">` : ''}</div><div class="in"><div class="row between" style="align-items:flex-end"><div><span class="badge b-navy plain" style="background:rgba(255,255,255,.16)">${p.status}</span><h2 style="margin-top:10px;color:#fff">${p.name}</h2><div class="small" style="opacity:.8">Etapa atual: ${cur ? cur.name : 'Concluída'}</div></div>${ring(prog, 86, 7, `<b class="num" style="font-size:20px" data-count="${prog}" data-suf="%">${prog}%</b><div style="font-size:9px;opacity:.8">EXECUÇÃO</div>`)}</div></div></div>
      <div class="stat-row rv" style="--i:2"><div><span>Início</span><b class="num">${fdate(p.start)}</b></div><div><span>Previsão</span><b class="num">${fdate(end)}</b></div><div><span>Dias restantes</span><b class="num" data-count="${left}">${left}</b></div></div>
      ${pend.length ? `<div class="card rv" style="--i:3;border-color:var(--warning);background:linear-gradient(0deg,#fff,#fff), var(--warning-bg)"><div class="row"><span class="li-ic" style="width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--warning-bg);color:#9A6A2C">${ic('badge-check')}</span><div class="grow"><b>${pend.length} aprovaç${pend.length > 1 ? 'ões pendentes' : 'ão pendente'}</b><div class="small muted">${pend.map((x) => `${x.id} · ${x.material}`).join(' — ')}</div></div><a class="btn sm" href="#/client/approvals">Analisar</a></div></div>` : `<div class="card rv" style="--i:3"><div class="row"><span style="color:var(--success)">${ic('check-circle-2')}</span><b class="small">Nenhuma aprovação pendente.</b></div></div>`}
      <div class="card rv" style="--i:4"><div class="card-h"><h3>${ic('notebook-pen')} Última atualização</h3><span class="small muted">${rel(last.date)}, ${last.time}</span></div>
        <div class="stack-sm">${last.services.map((s) => `<div class="row small"><span style="color:var(--success)">${ic('check', 'ic-sm')}</span>${esc(s)}</div>`).join('')}</div>
        <div class="photo-strip mt">${last.photos.map((s, i) => `<div class="ph" data-act="openPhoto" data-i="${i}" data-list="${photoList(last.photos, 'Diário ' + fdate(last.date), F.person(last.authorId).name)}"><img src="${s}" alt="Registro do diário"></div>`).join('')}</div>
        <div class="row between mt"><span class="small muted">${ic('users', 'ic-sm')} ${last.workers} profissionais · ${F.person(last.authorId).name}</span><a class="link" href="#/client/timeline">Diário completo ${ic('arrow-right', 'ic-sm')}</a></div></div>
    </div>
    <div class="stack">
      <div class="card rv" style="--i:2"><div class="card-h"><h3>${ic('calendar-clock')} Próxima atividade</h3></div>${nx ? `<b>${nx.name}</b><div class="small muted">${fdate(nx.start)} a ${fdate(nx.end)} · ${F.person(nx.ownerId).name}</div>` : '<span class="small muted">Sem próximas atividades.</span>'}
        ${cur ? `<div class="sep"></div><div class="row between small"><span>Em andamento: <b>${cur.name}</b></span><b>${cur.progress}%</b></div>${bar(cur.progress, F.isLate(cur) ? 'danger' : '')}${F.isLate(cur) ? `<div class="xs" style="color:var(--danger);margin-top:6px">${F.lateDays(cur)} dia(s) além do previsto — a equipe já está atuando.</div>` : ''}` : ''}</div>
      <div class="card rv" style="--i:3"><div class="card-h"><h3>${ic('layers')} Evolução por etapa</h3><a class="link" href="#/client/schedule">Cronograma</a></div><div class="stack-sm">${ts.map((t) => `<div><div class="row between xs"><span class="${t.progress === 100 ? 'muted' : ''}">${t.name}</span><b class="num">${t.progress}%</b></div>${bar(t.progress, t.progress === 100 ? 'success' : F.isLate(t) ? 'danger' : '')}</div>`).join('')}</div></div>
      <div class="card pad-0 rv" style="--i:4">${beforeAfter(F.IMG.salaA, F.IMG.salaD)}<div style="padding:12px 16px" class="small muted">Sala e cozinha — comparação antes/depois (imagens ilustrativas)</div></div>
      <div class="card dark rv" style="--i:5"><div class="row">${ic('sparkles')}<b>Pergunte à Finesse AI</b></div><div class="chips mt">${['Qual é o status da minha obra?', 'O que foi executado hoje?', 'Existe alguma atividade atrasada?'].map((q) => `<button class="chip" style="background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)" data-act="askFromHome" data-q="${q}">${q}</button>`).join('')}</div></div>
    </div></div>`;
}
viewClientHome.title = () => 'Minha obra';
ACT.askFromHome = (el) => { go('#/client/ai'); setTimeout(() => aiSend(el.dataset.q), 450); };

/* ---------- Cronograma ---------- */
function scheduleControls() {
  return `<div class="row wrap between mb"><div class="chips">${[['all', 'Obra completa'], ['last30', 'Últimos 30 dias'], ['next30', 'Próximos 30 dias']].map(([k, l]) => `<button class="chip ${UI.period === k ? 'on' : ''}" data-act="setUI" data-k="period" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="seg">${[['week', 'Semanal'], ['month', 'Mensal']].map(([k, l]) => `<button class="${UI.zoom === k ? 'on' : ''}" data-act="setUI" data-k="zoom" data-v="${k}">${l}</button>`).join('')}</div></div>`;
}
const periodFilter = (ts) => UI.period === 'all' ? ts : ts.filter((t) => { const a = UI.period === 'next30' ? [F.D(-7), F.D(30)] : [F.D(-30), F.D(7)]; return t.end >= a[0] && t.start <= a[1]; });
ACT.setUI = (el) => { UI[el.dataset.k] = el.dataset.v; render({ soft: true }); $$('.g-bar').forEach((b) => (b.style.animation = 'barGrow .7s var(--ease-out) both')); };
function viewClientSchedule() {
  const ts = F.tasksOf(CPID); const late = ts.filter(F.isLate); const ms = ts.filter((t) => t.milestone);
  return `<div class="page-h rv"><div><div class="eyebrow">Cronograma</div><h2>Planejamento da obra</h2><p>Toque em uma etapa para ver detalhes, fotos e responsável.</p></div>${late.length ? badge(late.length + ' atividade atrasada', 'b-danger') : badge('Dentro do prazo', 'b-success')}</div>
  <div class="rv" style="--i:1">${scheduleControls()}${gantt(periodFilter(ts), { zoom: UI.zoom, period: UI.period })}${ganttLegend()}</div>
  <div class="grid md-g2 mt-lg"><div class="card rv" style="--i:2"><div class="card-h"><h3>${ic('flag')} Marcos de entrega</h3></div>${ms.map((t) => `<div class="li"><span class="li-ic" style="background:var(--warning-bg);color:var(--warning)">${ic('diamond')}</span><div class="li-b"><b>${t.name}</b><span>${fdate(t.end)} · ${rel(t.end)}</span></div></div>`).join('')}<div class="li"><span class="li-ic">${ic('play')}</span><div class="li-b"><b>Início da obra</b><span>${fdate(F.proj(CPID).start)}</span></div></div></div>
  <div class="card rv" style="--i:3"><div class="card-h"><h3>${ic('activity')} Planejado x realizado</h3></div><div class="row" style="gap:20px">${ring(F.progressOf(CPID), 96, 8)}<div class="stack-sm grow"><div class="row between small"><span class="muted">Realizado</span><b>${F.progressOf(CPID)}%</b></div><div class="row between small"><span class="muted">Planejado para hoje</span><b>${F.plannedProgressOf(CPID)}%</b></div><div class="row between small"><span class="muted">Previsão de entrega</span><b>${fdate(F.projectEnd(CPID))}</b></div></div></div></div></div>`;
}
viewClientSchedule.title = () => 'Cronograma';

/* ---------- Drawer de atividade (compartilhado) ---------- */
function shiftDependents(taskId, delta, moved = new Set()) {
  if (!delta) return moved;
  S().tasks.filter((t) => (t.deps || []).includes(taskId)).forEach((t) => {
    const src = F.byId(S().tasks, taskId);
    if (F.dayDiff(t.start, src.end) <= 0 || delta < 0) {
      const need = Math.max(0, F.dayDiff(src.end, t.start) + 1);
      const d = delta > 0 ? need : 0; if (!d) return;
      t.start = F.D(F.dayDiff(t.start, F.todayISO()) + d); t.end = F.D(F.dayDiff(t.end, F.todayISO()) + d); moved.add(t.id); shiftDependents(t.id, d, moved);
    }
  });
  return moved;
}
ACT.openTask = (el) => {
  const id = el.dataset.id;
  openSheet({ render: () => {
    const t = F.byId(S().tasks, id); const p = F.proj(t.projectId); const own = F.person(t.ownerId); const late = F.isLate(t); const edit = role() === 'wellington';
    const st = t.progress >= 100 ? badge('Concluída', 'b-success') : late ? badge(`Atrasada · ${F.lateDays(t)}d`, 'b-danger') : t.progress > 0 ? badge('Em andamento', 'b-info') : badge('Não iniciada');
    const deps = (t.deps || []).map((d) => F.byId(S().tasks, d)).filter(Boolean);
    const relPhotos = t.photos.length ? t.photos : [];
    return { eyebrow: p.name, title: t.name, sub: `${st} ${t.milestone ? badge('Marco', 'b-warning') : ''}`,
      body: `<div class="stack"><p class="muted">${esc(t.desc || 'Etapa do cronograma executivo.')}</p>
      <div class="card"><dl class="kv"><dt>Responsável</dt><dd>${own.name} · ${own.role}</dd><dt>Previsto (linha de base)</dt><dd>${fdate(t.baseStart)} → ${fdate(t.baseEnd)}</dd><dt>Atual</dt><dd>${fdate(t.start)} → ${fdate(t.end)}</dd><dt>Duração</dt><dd>${F.dur(t)} dias</dd>${F.slip(t) ? `<dt>Desvio</dt><dd style="color:var(--warning)">${F.slip(t) > 0 ? '+' : ''}${F.slip(t)} dias</dd>` : ''}${deps.length ? `<dt>Depende de</dt><dd>${deps.map((d) => d.name).join(', ')}</dd>` : ''}</dl>
      <div class="mt"><div class="row between small"><span>Executado</span><b>${t.progress}%</b></div>${bar(t.progress, t.progress >= 100 ? 'success' : late ? 'danger' : '', true)}</div></div>
      ${relPhotos.length ? `<div><div class="eyebrow mb">Fotos da etapa</div><div class="photo-strip">${relPhotos.map((s, i) => `<div class="ph" style="width:150px;height:110px" data-act="openPhoto" data-i="${i}" data-list="${photoList(relPhotos, t.name, p.name)}"><img src="${s}" alt="${esc(t.name)}"></div>`).join('')}</div></div>` : `<div class="card">${empty('image-off', 'Sem fotos nesta etapa', 'As fotos aparecem quando o diário é publicado.')}</div>`}
      ${edit ? `<form class="card stack" data-form="editTask" data-id="${t.id}"><div class="row between"><b>${ic('pencil', 'ic-sm')} Ajustar atividade</b><span class="xs muted">Recalcula dependências e indicadores</span></div><div class="grid g2"><div class="field"><label>Início</label><input class="input" type="date" name="start" value="${t.start}"></div><div class="field"><label>Término</label><input class="input" type="date" name="end" value="${t.end}"></div></div><div class="field"><label>Progresso: <b id="pv">${t.progress}%</b></label><input class="range" type="range" name="progress" min="0" max="100" step="5" value="${t.progress}" oninput="document.getElementById('pv').textContent=this.value+'%'"></div><button class="btn">Salvar e recalcular</button></form>` : ''}</div>` };
  } });
};
FORMS.editTask = (f, d) => {
  const t = F.byId(S().tasks, f.dataset.id); if (d.end < d.start) { toast('O término deve ser após o início.', 'err'); return; }
  const oldEnd = F.projectEnd(t.projectId); const delta = F.dayDiff(d.end, t.end);
  commit(() => { t.start = d.start; t.end = d.end; t.progress = +d.progress; const moved = shiftDependents(t.id, delta); t._moved = moved.size; });
  const newEnd = F.projectEnd(t.projectId); const moved = t._moved; delete t._moved; F.save();
  toast(`Cronograma recalculado${moved ? ` · ${moved} atividade(s) reprogramada(s)` : ''}. Entrega: ${fdate(newEnd)}${newEnd !== oldEnd ? ` (${F.dayDiff(newEnd, oldEnd) > 0 ? '+' : ''}${F.dayDiff(newEnd, oldEnd)}d)` : ''}.`, F.isLate(t) ? 'warn' : 'ok', 'gantt-chart');
};

/* ---------- Diário (timeline) ---------- */
function logCard(l, i, { admin = false } = {}) {
  const a = F.person(l.authorId); const tk = F.byId(S().tasks, l.taskId); const crit = !/sem ocorr/i.test(l.occurrences);
  const st = { publicado: badge('Publicado', 'b-success'), interno: badge('Interno', ''), enviado: badge('Aguardando publicação', 'b-warning') }[l.status];
  return `<div class="tl-item ${crit ? 'warn' : 'ok'} rv" style="--i:${i}"><div class="card"><div class="row between wrap"><div class="row"><span class="avatar sm alt">${initials(a.name)}</span><div><b class="small">${a.name}</b><div class="xs muted">${fdate(l.date)} · ${l.time}${tk ? ' · ' + tk.name : ''}</div></div></div>${st}</div>
    <div class="stack-sm mt">${l.services.map((s) => `<div class="row small"><span style="color:var(--success)">${ic('check', 'ic-sm')}</span>${esc(s)}</div>`).join('')}</div>
    ${l.photos.length ? `<div class="photo-strip mt">${l.photos.map((s, k) => `<div class="ph" data-act="openPhoto" data-i="${k}" data-list="${photoList(l.photos, 'Diário ' + fdate(l.date), a.name)}"><img src="${s}" alt="Foto do diário" loading="lazy"></div>`).join('')}</div>` : ''}
    <div class="grid md-g3 mt xs" style="gap:10px"><div><span class="muted">Equipe</span><div><b>${l.workers} profissionais</b></div></div><div><span class="muted">Materiais</span><div><b>${esc(l.materials)}</b></div></div><div><span class="muted">Ocorrências</span><div><b style="color:${crit ? 'var(--warning)' : 'inherit'}">${esc(l.occurrences)}</b></div></div></div>
    <div class="notice info mt">${ic('arrow-right-circle')}<div><b>Próximos passos:</b> ${esc(l.next)}</div></div>
    ${admin && l.status !== 'publicado' ? `<div class="row mt"><button class="btn sm success" data-act="publishLog" data-id="${l.id}">${ic('send', 'ic-sm')} Publicar para o cliente</button>${l.status === 'enviado' ? `<button class="btn sm ghost" data-act="internalLog" data-id="${l.id}">Manter interno</button>` : ''}</div>` : ''}</div></div>`;
}
function viewClientTimeline() {
  const logs = pubLogs(CPID); const groups = {};
  logs.forEach((l) => { let k; if (UI.tlView === 'dia') k = rel(l.date) === 'Hoje' || rel(l.date) === 'Ontem' ? `${rel(l.date)} · ${fdate(l.date)}` : fdate(l.date); else if (UI.tlView === 'semana') { const w = Math.floor(F.dayDiff(F.todayISO(), l.date) / 7); k = w === 0 ? 'Esta semana' : w === 1 ? 'Semana passada' : `Há ${w} semanas`; } else k = (F.byId(S().tasks, l.taskId) || {}).name || 'Geral'; (groups[k] ||= []).push(l); });
  const rooms = [...new Set(S().photos.filter((p) => p.projectId === CPID && p.pair).map((p) => p.pair))];
  const roomSel = UI.cmpRoom || rooms[0]; const pair = S().photos.filter((p) => p.pair === roomSel).sort((a, b) => a.date.localeCompare(b.date));
  let i = 0;
  return `<div class="page-h rv"><div><div class="eyebrow">Diário de obra</div><h2>Cada dia, registrado</h2><p>Atualizações publicadas pela equipe da Finesse.</p></div><div class="seg">${[['dia', 'Dia'], ['semana', 'Semana'], ['etapa', 'Etapa']].map(([k, l]) => `<button class="${UI.tlView === k ? 'on' : ''}" data-act="setUI" data-k="tlView" data-v="${k}">${l}</button>`).join('')}</div></div>
  <div class="grid lg-21"><div class="tl">${Object.entries(groups).map(([k, ls]) => `<div class="tl-day">${k}</div>${ls.map((l) => logCard(l, i++)).join('')}`).join('') || empty('notebook', 'Nenhum registro publicado', 'Os registros aparecerão aqui.')}</div>
  <div class="stack"><div class="card rv" style="--i:2"><div class="card-h"><h3>${ic('git-compare')} Comparar evolução</h3></div><div class="chips mb">${rooms.map((r) => `<button class="chip ${roomSel === r ? 'on' : ''}" data-act="setUI" data-k="cmpRoom" data-v="${r}">${S().photos.find((p) => p.pair === r).room}</button>`).join('')}</div>${pair.length > 1 ? beforeAfter(pair[0].src, pair[pair.length - 1].src, fshort(pair[0].date).toUpperCase(), fshort(pair[pair.length - 1].date).toUpperCase()) : ''}<p class="xs faint mt">Imagens ilustrativas.</p></div>
  <div class="card rv" style="--i:3"><div class="card-h"><h3>${ic('bar-chart-3')} Resumo</h3></div><div class="stat-row"><div><b>${logs.length}</b><span>Registros</span></div><div><b>${logs.reduce((a, l) => a + l.photos.length, 0)}</b><span>Fotos</span></div><div><b>${Math.round(logs.reduce((a, l) => a + l.workers, 0) / Math.max(1, logs.length))}</b><span>Equipe média</span></div></div></div></div></div>`;
}
viewClientTimeline.title = () => 'Diário de obra';

/* ---------- Galeria ---------- */
function viewClientGallery() {
  const all = S().photos.filter((p) => p.projectId === CPID).sort((a, b) => b.date.localeCompare(a.date));
  const dims = { room: 'Ambiente', date: 'Data', stage: 'Etapa', service: 'Tipo de serviço' };
  const keyOf = (p) => (UI.galDim === 'date' ? fdate(p.date) : p[UI.galDim]);
  const vals = ['Todos', ...new Set(all.map(keyOf))];
  const list = UI.galVal === 'Todos' ? all : all.filter((p) => keyOf(p) === UI.galVal);
  const pairs = [...new Set(all.filter((p) => p.pair).map((p) => p.pair))];
  const L = photoList([], '', ''); // placeholder
  const listJson = JSON.stringify(list.map((p) => ({ src: p.src, caption: `${p.room} · ${p.stage}`, meta: fdate(p.date) }))).replace(/"/g, '&quot;');
  return `<div class="page-h rv"><div><div class="eyebrow">Galeria</div><h2>Fotos da obra</h2><p>${all.length} fotos · imagens ilustrativas para a demonstração.</p></div></div>
  <div class="rv" style="--i:1"><div class="seg mb">${Object.entries(dims).map(([k, l]) => `<button class="${UI.galDim === k ? 'on' : ''}" data-act="galDim" data-v="${k}">${l}</button>`).join('')}</div><div class="chips mb">${vals.map((v) => `<button class="chip ${UI.galVal === v ? 'on' : ''}" data-act="setUI" data-k="galVal" data-v="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>
  <div class="grid g2 md-g3 lg-g4">${list.map((p, i) => `<figure class="card pad-0 hover rv-scale" style="--i:${i}" data-act="openPhoto" data-i="${i}" data-list="${listJson}"><div class="ph" style="aspect-ratio:1"><img src="${p.src}" alt="${esc(p.room)}" loading="lazy"><span class="tag">${esc(p.room)}</span></div><figcaption style="padding:10px 12px"><b class="xs" style="display:block">${esc(p.stage)}</b><span class="xs muted">${fdate(p.date)} · ${esc(p.service)}</span></figcaption></figure>`).join('') || `<div class="card" style="grid-column:1/-1">${empty('image-off', 'Nenhuma foto neste filtro', 'Tente outro filtro.')}</div>`}</div>
  <h3 class="mt-lg mb rv">Antes e depois</h3><div class="grid md-g3">${pairs.map((r, i) => { const ps = all.filter((p) => p.pair === r).sort((a, b) => a.date.localeCompare(b.date)); return `<div class="rv" style="--i:${i}">${beforeAfter(ps[0].src, ps[ps.length - 1].src)}<div class="small muted" style="margin-top:6px">${ps[0].room}</div></div>`; }).join('')}</div>`;
}
viewClientGallery.title = () => 'Galeria';
ACT.galDim = (el) => { UI.galDim = el.dataset.v; UI.galVal = 'Todos'; render({ soft: true }); };

/* ---------- Aprovações ---------- */
function purchaseCompare(pu, selectable) {
  const min = Math.min(...pu.quotes.map((q) => q.price)); const fast = Math.min(...pu.quotes.map((q) => q.days));
  return `<div class="stack-sm">${pu.quotes.map((q, i) => `<div class="quote-opt ${i === pu.selected ? 'on' : ''}" ${selectable ? `data-act="pickQuote" data-id="${pu.id}" data-i="${i}"` : ''}><span class="radio"></span><div class="grow"><b class="small">${q.supplier}</b><div class="xs muted">${q.days} dias úteis ${q.price === min ? '· ' + badge('Menor preço', 'b-success plain') : ''} ${q.days === fast ? badge('Mais rápido', 'b-info plain') : ''}</div></div><b class="num">${brl2(q.price)}</b></div>`).join('')}</div>`;
}
function historyList(pu) { return `<div class="tl" style="padding-left:22px">${pu.history.map((h, i) => `<div class="tl-item rv-left" style="--i:${i};padding-bottom:10px"><b class="small">${esc(h.action)}</b><div class="xs muted">${esc(h.user)} · ${fdate(h.date)} ${ftime(h.date)}</div>${h.note ? `<div class="xs" style="margin-top:2px">“${esc(h.note)}”</div>` : ''}</div>`).join('')}</div>`; }
function viewClientApprovals(_, q) {
  const all = S().purchases.filter((p) => p.projectId === CPID && p.requiresClient && p.status !== 'solicitacao' && p.status !== 'cotacao');
  const pend = all.filter((p) => p.status === 'aguardando_cliente'); const done = all.filter((p) => p.status !== 'aguardando_cliente');
  const card = (pu, i) => { const qq = pu.quotes[pu.selected]; return `<div class="card rv ${q.id === pu.id ? 'flash' : ''}" style="--i:${i}"><div class="row between wrap"><span class="eyebrow">Solicitação #${pu.id}</span>${pbadge(pu.status)}</div><h3 style="font-size:18px;margin-top:8px">${pu.material}</h3>
    <dl class="kv mt"><dt>Quantidade</dt><dd>${pu.qty} ${pu.unit}</dd><dt>Fornecedor</dt><dd>${qq.supplier}</dd><dt>Valor</dt><dd class="num" style="font-size:17px">${brl2(qq.price)}</dd><dt>Prazo de entrega</dt><dd>${qq.days} dias úteis</dd></dl>
    <div class="row wrap mt"><button class="btn ghost sm" data-act="apprDetail" data-id="${pu.id}">${ic('eye', 'ic-sm')} Detalhes</button><button class="btn ghost sm" data-act="apprDetail" data-id="${pu.id}">${ic('scale', 'ic-sm')} Comparar propostas</button></div>
    ${pu.status === 'aguardando_cliente' ? `<div class="row mt" style="gap:8px"><button class="btn success grow" data-act="clientDecide" data-id="${pu.id}" data-d="approve">${ic('check')} Aprovar</button><button class="btn ghost" data-act="clientDecide" data-id="${pu.id}" data-d="review" aria-label="Solicitar revisão">${ic('message-square-more')}</button><button class="btn ghost" style="color:var(--danger)" data-act="clientDecide" data-id="${pu.id}" data-d="reject" aria-label="Rejeitar">${ic('x')}</button></div>` : ''}</div>`; };
  return `<div class="page-h rv"><div><div class="eyebrow">Aprovações</div><h2>Compras e orçamentos</h2><p>Analise as propostas encaminhadas pela Finesse.</p></div></div>
  <div class="notice rv mb" style="--i:1">${ic('info')}<div>Aprovação <b>demonstrativa</b>, sem validade contratual. Toda decisão gera histórico com data, usuário e justificativa.</div></div>
  <div class="seg mb rv" style="--i:2"><button class="${UI.apprTab === 'pend' ? 'on' : ''}" data-act="setUI" data-k="apprTab" data-v="pend">Pendentes (${pend.length})</button><button class="${UI.apprTab === 'hist' ? 'on' : ''}" data-act="setUI" data-k="apprTab" data-v="hist">Histórico (${done.length})</button></div>
  <div class="grid md-g2">${(UI.apprTab === 'pend' ? pend : done).map(card).join('') || `<div class="card" style="grid-column:1/-1">${empty(UI.apprTab === 'pend' ? 'party-popper' : 'history', UI.apprTab === 'pend' ? 'Tudo aprovado!' : 'Sem decisões ainda', UI.apprTab === 'pend' ? 'Você não tem compras aguardando aprovação.' : 'As decisões aparecerão aqui.')}</div>`}</div>`;
}
viewClientApprovals.title = () => 'Aprovações';
ACT.apprDetail = (el) => openSheet({ render: () => { const pu = F.byId(S().purchases, el.dataset.id); return { eyebrow: 'Solicitação #' + pu.id, title: pu.material, sub: pbadge(pu.status), body: `<div class="stack"><div class="card"><dl class="kv"><dt>Obra</dt><dd>${F.proj(pu.projectId).name}</dd><dt>Quantidade</dt><dd>${pu.qty} ${pu.unit}</dd><dt>Solicitado por</dt><dd>${pu.requestedBy}</dd></dl></div><div><div class="eyebrow mb">Propostas comparadas</div>${purchaseCompare(pu, false)}<p class="xs muted mt">Proposta recomendada pela Finesse destacada. Fornecedores fictícios.</p></div><div><div class="eyebrow mb">Histórico</div>${historyList(pu)}</div></div>`,
  foot: pu.status === 'aguardando_cliente' && role() === 'client' ? `<button class="btn success" data-act="clientDecide" data-id="${pu.id}" data-d="approve">Aprovar</button><button class="btn ghost" data-act="clientDecide" data-id="${pu.id}" data-d="review">Solicitar revisão</button>` : '' }; } });
ACT.clientDecide = (el) => {
  const pu = F.byId(S().purchases, el.dataset.id); const d = el.dataset.d;
  const cfg = { approve: ['Aprovar compra?', `Você aprova ${pu.material} por ${brl2(pu.quotes[pu.selected].price)}. Aprovação demonstrativa, sem validade contratual.`, 'Aprovar', 'success', 'Comentário', false],
    review: ['Solicitar revisão', 'Descreva o que gostaria de revisar nesta proposta.', 'Enviar pedido', '', 'Comentário', true],
    reject: ['Rejeitar compra?', 'Informe a justificativa para a rejeição.', 'Rejeitar', 'danger', 'Justificativa', true] }[d];
  confirmDialog({ title: cfg[0], text: cfg[1], okLabel: cfg[2], tone: cfg[3], field: cfg[4], required: cfg[5], onOk: (note) => {
    commit((s) => { const p = F.byId(s.purchases, pu.id); p.status = d === 'approve' ? 'aprovada' : d === 'review' ? 'revisao' : 'rejeitada'; p.history.push({ date: new Date().toISOString(), user: 'Marina Albuquerque (cliente)', action: d === 'approve' ? 'Aprovada pelo cliente' : d === 'review' ? 'Revisão solicitada pelo cliente' : 'Rejeitada pelo cliente', note }); },
      d === 'approve' ? `${pu.id} aprovada. Wellington foi notificado.` : d === 'review' ? 'Pedido de revisão enviado à Finesse.' : `${pu.id} rejeitada.`, d === 'reject' ? 'warn' : 'ok');
  } });
};

/* ---------- Documentos ---------- */
const DOC_IC = { Contrato: 'file-signature', Projetos: 'drafting-compass', Plantas: 'map', 'Memorial descritivo': 'file-text', Orçamentos: 'receipt', Aditivos: 'file-plus-2', Relatórios: 'file-bar-chart', 'Termos de entrega': 'key-round' };
function docsView(pid, clientOnly) {
  const docs = S().docs.filter((d) => d.projectId === pid && (!clientOnly || d.clientVisible)); const cats = ['Todos', ...new Set(docs.map((d) => d.cat))];
  const list = UI.docCat === 'Todos' ? docs : docs.filter((d) => d.cat === UI.docCat);
  return `<div class="chips mb">${cats.map((c) => `<button class="chip ${UI.docCat === c ? 'on' : ''}" data-act="setUI" data-k="docCat" data-v="${c}">${c}</button>`).join('')}</div>
  <div class="card"><div class="list">${list.map((d, i) => `<div class="li click rv-left" style="--i:${i}" data-act="openDoc" data-id="${d.id}"><span class="li-ic">${ic(DOC_IC[d.cat] || 'file')}</span><div class="li-b"><b>${d.name}</b><span>${d.cat} · ${fdate(d.date)} · PDF ${d.size}</span></div>${ic('chevron-right', 'ic-sm')}</div>`).join('') || empty('folder-x', 'Nenhum documento', 'Nada nesta categoria.')}</div></div>`;
}
function viewClientDocuments() { return `<div class="page-h rv"><div><div class="eyebrow">Central de documentos</div><h2>Documentos da obra</h2><p>Documentos simulados para demonstração.</p></div></div><div class="rv" style="--i:1">${docsView(CPID, true)}</div>`; }
viewClientDocuments.title = () => 'Documentos';
ACT.openDoc = (el) => { const d = F.byId(S().docs, el.dataset.id); const p = F.proj(d.projectId); openSheet({ kind: 'center', render: () => ({ eyebrow: d.cat, title: d.name, sub: `${p.name} · ${fdate(d.date)}`, body: `<div class="doc-paper"><div class="row between"><span style="color:var(--navy)">${logo(true)}</span><span class="xs muted">Ref. ${d.id.toUpperCase()}</span></div><div class="sep"></div><h4>${d.name}</h4><p class="xs muted">${p.name} — ${p.address}</p>${Array.from({ length: 9 }, (_, i) => `<div class="ln" style="width:${[96, 88, 92, 70, 94, 84, 60, 90, 45][i]}%"></div>`).join('')}<div class="row between mt"><div><div class="ln" style="width:120px"></div><span class="xs muted">Finesse Engenharia</span></div><div><div class="ln" style="width:120px"></div><span class="xs muted">Contratante</span></div></div></div><p class="xs faint mt">Documento simulado — conteúdo ilustrativo, sem validade jurídica.</p>`, foot: `<button class="btn ghost" data-act="closeSheet">Fechar</button><button class="btn" data-act="docDownload">${ic('download')} Baixar PDF</button>` }) }); };
ACT.docDownload = () => toast('Download simulado: em produção, o arquivo viria do armazenamento seguro.', 'info', 'download');

/* ---------- IA ---------- */
function viewClientAI() { return chatView('client', ['Qual é o status da minha obra?', 'O que foi executado hoje?', 'Existe alguma atividade atrasada?', 'Qual é a previsão de entrega?', 'Quais compras precisam da minha aprovação?', 'O que será executado na próxima semana?'], 'Olá, Marina! Sou a Finesse AI. Posso responder sobre status, prazos, etapas, fotos, aprovações e próximas atividades da <b>Residência Jardim Europa</b>.'); }
viewClientAI.title = () => 'Finesse AI';
viewClientAI.after = chatAfter;

route('/client', 'client', viewClientHome);
route('/client/schedule', 'client', viewClientSchedule);
route('/client/timeline', 'client', viewClientTimeline);
route('/client/gallery', 'client', viewClientGallery);
route('/client/approvals', 'client', viewClientApprovals);
route('/client/documents', 'client', viewClientDocuments);
route('/client/ai', 'client', viewClientAI);
