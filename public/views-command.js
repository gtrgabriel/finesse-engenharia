/* ==========================================================================
   FINESSE OS — Finesse Command (Wellington)
   ========================================================================== */
const CUI = { pView: 'cards', pStatus: 'Todas', sort: ['end', 1], plan: 'all', finP: 'all', finCat: 'Todas', finPer: 6, finSort: ['date', -1], purSt: 'all', rep: 'fisica', repP: 'all', repPer: 90, ptab: 'geral' };
const ACTIVE = () => S().projects.filter((p) => p.status !== 'Concluída');
const mkey = (iso) => iso.slice(0, 7);
const mlabel = (k) => MES[+k.slice(5, 7) - 1];
const monthsAround = (back, fwd) => { const out = []; const d = new Date(); d.setDate(1); for (let i = -back; i <= fwd; i++) { const m = new Date(d.getFullYear(), d.getMonth() + i, 1); out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`); } return out; };
function cashSeries(pid, back = 5, fwd = 2) {
  const ms = monthsAround(back, fwd); const F_ = S().finance.filter((f) => pid === 'all' || !pid || f.projectId === pid);
  const inc = ms.map((m) => F_.filter((f) => f.kind === 'receita' && mkey(f.date) === m).reduce((a, f) => a + f.amount, 0));
  const out = ms.map((m) => F_.filter((f) => f.kind === 'despesa' && mkey(f.date) === m).reduce((a, f) => a + f.amount, 0));
  return { ms, inc, out, todayIdx: back };
}
const pctf = (n) => n.toFixed(1).replace('.', ',') + '%';
const projSelect = (name, sel, all) => `<select class="input" name="${name}">${all ? '<option value="all">Todas as obras</option>' : ''}${S().projects.map((p) => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select>`;

/* ---------- Cockpit ---------- */
function viewCockpit() {
  const act = ACTIVE(); const fin = F.finOf(); const late = S().tasks.filter(F.isLate); const pr = F.pendingReview(); const pc = F.pendingClient();
  const actFin = act.reduce((a, p) => { const f = F.finOf(p.id); a.c += f.contract; a.r += f.costReal; a.m += f.margin; return a; }, { c: 0, r: 0, m: 0 });
  const cs = cashSeries('all');
  const cats = Object.keys(CAT_COLORS).map((c) => ({ label: c, color: CAT_COLORS[c], value: S().finance.filter((f) => f.kind === 'despesa' && f.paid && f.category === c).reduce((a, f) => a + f.amount, 0) })).filter((s) => s.value);
  const alerts = F.alerts();
  const ms = S().tasks.filter((t) => t.milestone && t.progress < 100).sort((a, b) => a.end.localeCompare(b.end)).slice(0, 3);
  const dl = S().purchases.filter((p) => p.status === 'pedido' && p.delivery).sort((a, b) => a.delivery.localeCompare(b.delivery));
  const ev = S().events.filter((e) => F.dayDiff(e.date, F.todayISO()) >= 0).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
  return `<div class="page-h rv"><div><div class="eyebrow">${fdate(F.todayISO())} · Finesse Command</div><h1 style="margin-top:6px">${greet()}, Wellington.</h1><p>Veja o que está acontecendo nas suas obras hoje.</p></div><div class="row wrap"><button class="btn ghost sm" data-go="#/command/ai">${ic('sparkles', 'ic-sm')} Perguntar à IA</button><button class="btn sm" data-act="newProject">${ic('plus', 'ic-sm')} Nova obra</button></div></div>
  <div class="grid g2 lg-g4">
    ${kpi('Obras em andamento', String(act.length), 'building-2', `${act.filter((p) => p.status === 'Planejamento').length} em planejamento`, 0, act.length)}
    ${kpi('Obras concluídas', String(S().projects.filter((p) => p.status === 'Concluída').length), 'check-circle-2', 'Carteira demonstrativa', 1)}
    ${kpi('Faturamento previsto', kbrl(actFin.c), 'trending-up', 'Contratos ativos', 2, actFin.c)}
    ${kpi('Custos realizados', kbrl(actFin.r), 'receipt', `${Math.round((actFin.r / act.reduce((a, p) => a + p.budget, 0)) * 100)}% do orçamento`, 3, actFin.r)}
    ${kpi('Margem projetada', pctf((actFin.m / actFin.c) * 100), 'percent', kbrl(actFin.m) + ' projetados', 4)}
    ${kpi('Compras pendentes', String(pr.length), 'shopping-cart', `<a class="link xs" href="#/command/purchases">Analisar ${ic('arrow-right', 'ic-sm')}</a>`, 5, pr.length)}
    ${kpi('Atividades atrasadas', String(late.length), 'clock-alert', late.length ? `<span style="color:var(--danger)">${late.map((t) => F.proj(t.projectId).name.split(' ').slice(-2).join(' ')).join(', ')}</span>` : 'Tudo no prazo', 6, late.length)}
    ${kpi('Aguardando clientes', String(pc.length), 'user-round-check', pc.map((p) => p.id).join(', ') || 'Nenhuma', 7, pc.length)}
  </div>
  <div class="grid lg-21 mt">
    <div class="card rv" style="--i:3"><div class="card-h"><h3>${ic('line-chart')} Fluxo de caixa</h3><div class="dash-chart-legend"><span><i class="lg-dot" style="background:var(--success)"></i>Entradas</span><span><i class="lg-dot" style="background:var(--navy)"></i>Saídas</span></div></div>${lineChart([{ name: 'Entradas', color: '#397A69', values: cs.inc, area: true }, { name: 'Saídas', color: '#103244', values: cs.out }], cs.ms.map(mlabel), { todayIdx: cs.todayIdx })}<div class="xs faint">Linha vermelha: mês atual. Meses seguintes são previsões.</div></div>
    <div class="card rv" style="--i:4"><div class="card-h"><h3>${ic('pie-chart')} Distribuição de custos</h3></div>${donut(cats, 140, `<div><b class="num" style="font-size:15px">${kbrl(cats.reduce((a, s) => a + s.value, 0))}</b><div class="xs muted">realizado</div></div>`)}</div>
  </div>
  <div class="grid lg-g3 mt">
    <div class="card rv lg-span2" style="--i:5"><div class="card-h"><h3>${ic('bar-chart-3')} Evolução física das obras</h3><div class="dash-chart-legend"><span><i class="lg-dot" style="background:var(--navy)"></i>Realizado</span><span><i class="lg-dot" style="background:#C7C7C7"></i>Planejado</span></div></div>${barChart([{ name: 'Realizado', color: '#103244', values: act.map((p) => F.progressOf(p.id)) }, { name: 'Planejado', color: '#C7C7C7', values: act.map((p) => F.plannedProgressOf(p.id)) }], act.map((p) => p.name.split(' ').slice(-1)[0]), { max: 100 })}</div>
    <div class="card rv" style="--i:6"><div class="card-h"><h3>${ic('bell-ring')} Alertas</h3><a class="link" href="#/command/alerts">Ver todos</a></div><div class="stack-sm">${alerts.slice(0, 4).map((a, i) => alertRow(a, i)).join('') || empty('bell-off', 'Sem alertas', 'Tudo em ordem.')}</div></div>
  </div>
  <div class="grid md-g2 lg-g3 mt">
    <div class="card rv" style="--i:7"><div class="card-h"><h3>${ic('flag')} Próximas entregas</h3></div>${ms.map((t) => `<div class="li click" data-go="#/command/projects/${t.projectId}"><span class="li-ic" style="background:var(--warning-bg);color:var(--warning)">${ic('diamond')}</span><div class="li-b"><b>${F.proj(t.projectId).name}</b><span>${t.name} · ${fdate(t.end)}</span></div>${badge(rel(t.end), 'plain')}</div>`).join('')}${dl.map((p) => `<div class="li click" data-go="#/command/purchases?id=${p.id}"><span class="li-ic">${ic('truck')}</span><div class="li-b"><b>${p.material}</b><span>${p.id} · ${fdate(p.delivery)}</span></div>${badge(rel(p.delivery), 'b-info plain')}</div>`).join('')}</div>
    <div class="card rv" style="--i:8"><div class="card-h"><h3>${ic('calendar-days')} Agenda de Wellington</h3></div>${ev.map((e) => `<div class="li"><div style="width:46px;text-align:center"><b class="num">${e.time}</b><div class="xs muted">${rel(e.date)}</div></div><div class="li-b"><b>${e.title}</b><span>${F.proj(e.projectId).name}</span></div></div>`).join('')}</div>
    <div class="card dark rv" style="--i:9"><div class="row">${ic('sparkles')}<b>Finesse AI</b></div><p class="small muted" style="margin:8px 0 12px">Seu copiloto de gestão, com dados da carteira.</p><div class="stack-sm">${['Quais obras precisam da minha atenção hoje?', 'Qual a margem por obra?', 'Quais compras estão pendentes?'].map((q) => `<button class="chip" style="background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2);justify-content:flex-start" data-act="askCmd" data-q="${q}">${q}</button>`).join('')}</div></div>
  </div>`;
}
viewCockpit.title = () => 'Cockpit executivo';
ACT.askCmd = (el) => { go('#/command/ai'); setTimeout(() => aiSend(el.dataset.q), 450); };
const TONE_BG = { danger: ['var(--danger-bg)', 'var(--danger)'], warning: ['var(--warning-bg)', '#9A6A2C'], success: ['var(--success-bg)', 'var(--success)'], info: ['var(--info-bg)', 'var(--info)'] };
function alertRow(a, i) { const [bg, fg] = TONE_BG[a.tone]; const read = S().readAlerts.includes(a.id); return `<div class="alert-item rv-left" style="--i:${i};${read ? 'opacity:.6' : ''}" data-act="openAlert" data-id="${a.id}" data-h="${a.route}"><span class="a-ic" style="background:${bg};color:${fg}">${ic(a.icon)}</span><div class="grow small">${esc(a.text)}</div>${read ? '' : '<span class="lg-dot" style="background:var(--danger);border-radius:50%;margin-top:6px"></span>'}</div>`; }
ACT.openAlert = (el) => { if (!S().readAlerts.includes(el.dataset.id)) { S().readAlerts.push(el.dataset.id); F.save(); } go(el.dataset.h); };

/* ---------- Obras ---------- */
function projCard(p, i) {
  const c = F.client(p.clientId); const prog = F.progressOf(p.id); const f = F.finOf(p.id); const late = F.tasksOf(p.id).some(F.isLate);
  return `<article class="card pad-0 hover rv" style="--i:${i}" data-go="#/command/projects/${p.id}" data-search="${esc(norm(p.name + ' ' + c.name))}">${photo(p.cover, '', p.type, 'style="aspect-ratio:16/9"')}<div style="padding:16px"><div class="row between"><span class="badge ${STATUS_TONE[p.status]}">${p.status}</span>${late ? badge('Atraso', 'b-danger') : ''}</div><h3 style="font-size:16px;margin-top:10px">${p.name}</h3><div class="small muted">${c.name}</div>
  <div class="mt"><div class="row between xs"><span>Execução</span><b>${prog}%</b></div>${bar(prog, prog === 100 ? 'success' : late ? 'danger' : '')}</div>
  <div class="row between xs mt muted"><span>${ic('calendar', 'ic-sm')} ${fdate(F.projectEnd(p.id))}</span><span>Margem <b style="color:var(--text)">${pctf(f.marginPct)}</b></span></div></div></article>`;
}
function viewProjects() {
  let list = S().projects.slice(); if (CUI.pStatus !== 'Todas') list = list.filter((p) => p.status === CUI.pStatus);
  const [k, dir] = CUI.sort; const val = (p) => ({ name: p.name, client: F.client(p.clientId).name, status: p.status, prog: F.progressOf(p.id), contract: p.contract, margin: F.finOf(p.id).marginPct, end: F.projectEnd(p.id) }[k]);
  list.sort((a, b) => (val(a) > val(b) ? 1 : -1) * dir);
  const th = (key, l, r) => `<th class="sort ${r ? 'r' : ''}" data-act="sortP" data-k="${key}">${l} ${CUI.sort[0] === key ? (CUI.sort[1] > 0 ? '↑' : '↓') : ''}</th>`;
  return `<div class="page-h rv"><div><div class="eyebrow">Gestão de obras</div><h2>Carteira de obras</h2><p>${S().projects.length} obras · ${ACTIVE().length} ativas</p></div><button class="btn" data-act="newProject">${ic('plus')} Nova obra</button></div>
  <div class="row wrap between mb rv" style="--i:1"><div class="chips">${['Todas', 'Em execução', 'Em acabamento', 'Planejamento', 'Concluída'].map((s) => `<button class="chip ${CUI.pStatus === s ? 'on' : ''}" data-act="setC" data-k="pStatus" data-v="${s}">${s}</button>`).join('')}</div>
  <div class="row"><input class="input" style="height:38px;max-width:200px" placeholder="Buscar obra ou cliente" oninput="filterSearch(this.value)" aria-label="Buscar"><div class="seg">${[['cards', 'layout-grid'], ['table', 'table-2']].map(([v, i]) => `<button class="${CUI.pView === v ? 'on' : ''}" data-act="setC" data-k="pView" data-v="${v}" aria-label="${v}">${ic(i, 'ic-sm')}</button>`).join('')}</div></div></div>
  ${CUI.pView === 'cards' ? `<div class="grid md-g2 lg-g3">${list.map(projCard).join('') || empty('building', 'Nenhuma obra', 'Ajuste os filtros.')}</div>` :
  `<div class="card rv"><div class="table-wrap"><table><thead><tr>${th('name', 'Obra')}${th('client', 'Cliente')}${th('status', 'Status')}${th('prog', 'Execução', 1)}${th('contract', 'Contrato', 1)}${th('margin', 'Margem', 1)}${th('end', 'Entrega', 1)}</tr></thead><tbody>${list.map((p) => `<tr class="click" data-go="#/command/projects/${p.id}" data-search="${esc(norm(p.name + ' ' + F.client(p.clientId).name))}"><td><b>${p.name}</b></td><td>${F.client(p.clientId).name}</td><td><span class="badge ${STATUS_TONE[p.status]}">${p.status}</span></td><td class="r num">${F.progressOf(p.id)}%</td><td class="r num">${brl(p.contract)}</td><td class="r num">${pctf(F.finOf(p.id).marginPct)}</td><td class="r num">${fdate(F.projectEnd(p.id))}</td></tr>`).join('')}</tbody></table></div></div>`}`;
}
viewProjects.title = () => 'Obras';
window.filterSearch = (v) => { const n = norm(v); $$('[data-search]').forEach((el) => (el.style.display = el.dataset.search.includes(n) ? '' : 'none')); };
ACT.setC = (el) => { CUI[el.dataset.k] = isNaN(+el.dataset.v) ? el.dataset.v : +el.dataset.v; render({ soft: true }); };
ACT.sortP = (el) => { const k = el.dataset.k; CUI.sort = [k, CUI.sort[0] === k ? -CUI.sort[1] : 1]; render({ soft: true }); };

/* Nova / editar obra */
const DEFAULT_STAGES = ['Planejamento e mobilização', 'Demolição e preparação', 'Infraestrutura hidráulica', 'Infraestrutura elétrica', 'Regularização', 'Revestimentos', 'Marcenaria', 'Pintura', 'Acabamentos', 'Vistoria e entrega'];
function projectForm(p) {
  const e = !!p; p = p || { name: '', type: 'Residencial', clientId: '', address: '', contract: '', budget: '', start: F.D(7), end: F.D(97), status: 'Planejamento', area: '' };
  return `<form class="stack" data-form="saveProject" data-id="${e ? p.id : ''}" id="pform">
  <div class="field"><label>Nome da obra *</label><input class="input" name="name" value="${esc(p.name)}" placeholder="Ex.: Residência Morumbi" autofocus></div>
  <div class="grid g2"><div class="field"><label>Tipo</label><select class="input" name="type">${['Residencial', 'Comercial', 'Corporativo'].map((t) => `<option ${p.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div><div class="field"><label>Status</label><select class="input" name="status">${['Planejamento', 'Em execução', 'Em acabamento', 'Concluída'].map((t) => `<option ${p.status === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div></div>
  <div class="field"><label>Cliente *</label><select class="input" name="clientId"><option value="">Selecione…</option>${S().clients.map((c) => `<option value="${c.id}" ${p.clientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}<option value="new">+ Novo cliente</option></select></div>
  <div class="field" id="newClientF" style="display:none"><label>Nome do novo cliente (fictício)</label><input class="input" name="newClient" placeholder="Nome do cliente"></div>
  <div class="field"><label>Endereço</label><input class="input" name="address" value="${esc(p.address)}" placeholder="Bairro, cidade"></div>
  <div class="grid g2"><div class="field"><label>Valor do contrato (R$) *</label><input class="input" name="contract" type="number" min="0" value="${p.contract}"></div><div class="field"><label>Orçamento de custos (R$) *</label><input class="input" name="budget" type="number" min="0" value="${p.budget}"></div></div>
  <div class="grid g2"><div class="field"><label>Início</label><input class="input" type="date" name="start" value="${p.start}"></div><div class="field"><label>Entrega prevista</label><input class="input" type="date" name="end" value="${p.end}"></div></div>
  ${e ? '' : `<div class="field"><label>Etapas do cronograma</label><div class="stack-sm">${DEFAULT_STAGES.map((s, i) => `<label class="switch"><input type="checkbox" name="st${i}" ${[0, 1, 4, 5, 7, 8, 9].includes(i) ? 'checked' : ''}><span class="small">${s}</span></label>`).join('')}</div><span class="xs muted">As datas das etapas são distribuídas automaticamente entre início e entrega.</span></div>`}
  </form>`;
}
ACT.newProject = () => openSheet({ render: () => ({ eyebrow: 'Fluxo F', title: 'Nova obra', body: projectForm(), foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="submitForm" data-f="pform">${ic('check')} Salvar obra</button>` }), mount: (sh) => { const s = $('[name=clientId]', sh); s.onchange = () => ($('#newClientF', sh).style.display = s.value === 'new' ? '' : 'none'); } });
ACT.editProject = (el) => openSheet({ render: () => ({ eyebrow: 'Editar', title: F.proj(el.dataset.id).name, body: projectForm(F.proj(el.dataset.id)), foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="submitForm" data-f="pform">${ic('check')} Salvar alterações</button>` }), mount: (sh) => { const s = $('[name=clientId]', sh); s.onchange = () => ($('#newClientF', sh).style.display = s.value === 'new' ? '' : 'none'); } });
ACT.submitForm = (el) => $('#' + el.dataset.f).requestSubmit();
FORMS.saveProject = (f, d) => {
  if (!need(f, ['name', 'contract', 'budget'])) return;
  if (!d.clientId || (d.clientId === 'new' && !d.newClient?.trim())) { toast('Defina o cliente.', 'warn'); return; }
  if (d.end <= d.start) { toast('A entrega deve ser após o início.', 'err'); return; }
  const id = f.dataset.id || 'p' + (S().projects.length + 1) + uid('');
  commit((s) => {
    let cid = d.clientId; if (cid === 'new') { cid = uid('c'); s.clients.push({ id: cid, name: d.newClient.trim(), short: d.newClient.trim().split(' ')[0], contact: '—', phone: '—', projectIds: [id], finStatus: 'Em dia', interactions: [{ date: F.todayISO(), text: 'Cliente cadastrado.' }] }); }
    const base = { name: d.name.trim(), type: d.type, status: d.status, clientId: cid, address: d.address || '—', contract: +d.contract, budget: +d.budget, start: d.start, end: d.end };
    if (f.dataset.id) { Object.assign(F.byId(s.projects, id), base); }
    else {
      s.projects.push({ id, ...base, area: 0, cover: '', managerId: 'u2', fieldIds: [], risks: [] });
      const c = F.byId(s.clients, cid); if (!c.projectIds.includes(id)) c.projectIds.push(id);
      const st = DEFAULT_STAGES.filter((_, i) => d['st' + i]); const total = F.dayDiff(d.end, d.start); const off0 = F.dayDiff(d.start, F.todayISO());
      st.forEach((name, i) => { const a = off0 + Math.round((total * i) / st.length), b = off0 + Math.round((total * (i + 1)) / st.length) - 1; s.tasks.push({ id: uid('t'), projectId: id, name, start: F.D(a), end: F.D(b), baseStart: F.D(a), baseEnd: F.D(b), progress: 0, ownerId: 'u1', deps: [], milestone: i === st.length - 1, desc: '', photos: [] }); });
      s.tasks.filter((t) => t.projectId === id).forEach((t, i, arr) => { if (i) t.deps = [arr[i - 1].id]; });
      s.docs.push({ id: id + '-d0', projectId: id, cat: 'Contrato', name: 'Contrato de prestação de serviços', date: F.todayISO(), size: '0,8 MB', clientVisible: true });
      s.finance.push({ id: uid('f'), projectId: id, kind: 'receita', category: 'Parcela contratual', desc: 'Sinal', amount: Math.round(+d.contract * 0.2), date: d.start, paid: false, budgeted: true });
    }
  }, f.dataset.id ? 'Obra atualizada.' : `Obra “${d.name}” criada e adicionada à carteira.`);
  closeSheet(); if (!f.dataset.id) go('#/command/projects/' + id);
};

/* Página da obra */
function viewProject({ id }, q) {
  const p = F.proj(id); if (!p) return empty('building', 'Obra não encontrada', '');
  const tab = q.tab || CUI.ptab; const c = F.client(p.clientId); const f = F.finOf(id); const prog = F.progressOf(id); const plan = F.plannedProgressOf(id);
  const tabs = [['geral', 'Visão geral'], ['cronograma', 'Cronograma'], ['diario', 'Diário'], ['financeiro', 'Financeiro'], ['compras', 'Compras'], ['equipe', 'Equipe e riscos'], ['docs', 'Documentos']];
  const pending = S().logs.filter((l) => l.projectId === id && l.status === 'enviado').length;
  let body = '';
  if (tab === 'geral') body = `<div class="grid g2 lg-g4">${kpi('Execução física', prog + '%', 'activity', `Planejado: ${plan}%`, 0)}${kpi('Contrato', kbrl(f.contract), 'file-signature', `Recebido ${kbrl(f.received)}`, 1, f.contract)}${kpi('Custo realizado', kbrl(f.costReal), 'receipt', `Orçamento ${kbrl(f.budget)}`, 2, f.costReal)}${kpi('Margem projetada', pctf(f.marginPct), 'percent', kbrl(f.margin), 3)}</div>
    <div class="grid lg-21 mt"><div class="card rv"><div class="card-h"><h3>${ic('layers')} Etapas</h3><button class="link" data-act="ptab" data-t="cronograma">Abrir Gantt</button></div><div class="stack-sm">${F.tasksOf(id).map((t) => `<div data-act="openTask" data-id="${t.id}" style="cursor:pointer"><div class="row between xs"><span>${t.name} ${F.isLate(t) ? badge(F.lateDays(t) + 'd atraso', 'b-danger plain') : ''}</span><b>${t.progress}%</b></div>${bar(t.progress, t.progress === 100 ? 'success' : F.isLate(t) ? 'danger' : '')}</div>`).join('')}</div></div>
    <div class="stack"><div class="card rv" style="--i:1"><dl class="kv"><dt>Cliente</dt><dd>${c.name}</dd><dt>Endereço</dt><dd>${esc(p.address)}</dd><dt>Tipo</dt><dd>${p.type}</dd><dt>Início</dt><dd>${fdate(p.start)}</dd><dt>Entrega</dt><dd>${fdate(F.projectEnd(id))}</dd><dt>Responsável técnico</dt><dd>${F.person(p.managerId).name}</dd></dl></div>
    ${pending ? `<div class="card rv" style="--i:2;border-color:var(--warning)"><div class="row"><span style="color:var(--warning)">${ic('notebook-pen')}</span><b class="small grow">${pending} diário(s) aguardando publicação</b><button class="btn sm" data-act="ptab" data-t="diario">Revisar</button></div></div>` : ''}</div></div>`;
  if (tab === 'cronograma') body = `<div class="notice info mb">${ic('mouse-pointer-click')}<div>Clique em uma etapa para alterar datas ou progresso. Dependentes são reprogramados e os indicadores recalculados.</div></div>${scheduleControls()}${gantt(periodFilter(F.tasksOf(id)), { zoom: UI.zoom, period: UI.period })}${ganttLegend()}`;
  if (tab === 'diario') { const ls = S().logs.filter((l) => l.projectId === id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)); body = `<div class="notice mb">${ic('eye-off')}<div>Registros <b>internos</b> e <b>aguardando publicação</b> não aparecem para o cliente.</div></div><div class="tl">${ls.map((l, i) => logCard(l, i, { admin: true })).join('') || empty('notebook', 'Sem registros', 'O diário de campo aparecerá aqui.')}</div>`; }
  if (tab === 'financeiro') body = financeBlock(id);
  if (tab === 'compras') body = `<div class="row between mb"><b>${S().purchases.filter((x) => x.projectId === id).length} solicitações</b><button class="btn sm" data-act="newPurchase" data-p="${id}">${ic('plus', 'ic-sm')} Nova solicitação</button></div>${purchaseTable(S().purchases.filter((x) => x.projectId === id))}`;
  if (tab === 'equipe') body = `<div class="grid md-g2"><div class="card rv"><div class="card-h"><h3>${ic('users')} Equipe alocada</h3></div>${S().people.filter((x) => x.projects.includes(id)).map((x) => `<div class="li"><span class="avatar sm" style="background:${x.color}">${initials(x.name)}</span><div class="li-b"><b>${x.name}</b><span>${x.role}</span></div></div>`).join('') || empty('user-plus', 'Sem equipe', 'Associe profissionais em Equipes.')}</div>
    <div class="card rv" style="--i:1"><div class="card-h"><h3>${ic('shield-alert')} Riscos</h3></div>${p.risks.map((r) => `<div class="li"><span class="li-ic" style="background:var(--warning-bg);color:var(--warning)">${ic('alert-triangle')}</span><div class="li-b"><b style="white-space:normal">${esc(r.text)}</b><span>Nível ${r.level}</span></div></div>`).join('') || '<p class="small muted">Nenhum risco registrado.</p>'}
    <form class="row mt" data-form="addRisk" data-id="${id}"><input class="input" name="text" placeholder="Registrar novo risco" style="height:40px"><select class="input" name="level" style="height:40px;width:110px"><option>Baixo</option><option selected>Médio</option><option>Alto</option></select><button class="btn sm">${ic('plus', 'ic-sm')}</button></form></div></div>`;
  if (tab === 'docs') body = docsView(id, false);
  return `<div class="rv"><a class="link" href="#/command/projects">${ic('arrow-left', 'ic-sm')} Obras</a></div>
  <div class="hero-card rv mt" style="min-height:190px;--i:1"><div class="bg">${p.cover ? `<img src="${p.cover}" alt="">` : ''}</div><div class="in"><div class="row between wrap" style="align-items:flex-end"><div><span class="badge b-navy plain" style="background:rgba(255,255,255,.16)">${p.status} · ${p.type}</span><h2 style="color:#fff;margin-top:8px">${p.name}</h2><div class="small" style="opacity:.8">${c.name} · entrega ${fdate(F.projectEnd(id))}</div></div><div class="row">${ring(prog, 70, 6, `<b class="num" style="font-size:16px">${prog}%</b>`)}<button class="btn light sm" data-act="editProject" data-id="${id}">${ic('pencil', 'ic-sm')} Editar</button></div></div></div></div>
  <div class="chips mt mb rv" style="--i:2">${tabs.map(([k, l]) => `<button class="chip ${tab === k ? 'on' : ''}" data-act="ptab" data-t="${k}">${l}${k === 'diario' && pending ? ` <span class="badge b-warning plain" style="height:18px">${pending}</span>` : ''}</button>`).join('')}</div>
  <div class="rv" style="--i:3">${body}</div>`;
}
viewProject.title = ({ id }) => (F.proj(id) || {}).name || 'Obra';
ACT.ptab = (el) => { CUI.ptab = el.dataset.t; history.replaceState(null, '', '#' + CUR.path + '?tab=' + el.dataset.t); render({ soft: true }); };
FORMS.addRisk = (f, d) => { if (!need(f, ['text'])) return; commit((s) => F.byId(s.projects, f.dataset.id).risks.push({ id: uid('r'), text: d.text, level: d.level }), 'Risco registrado.'); };
ACT.publishLog = (el) => commit((s) => { const l = F.byId(s.logs, el.dataset.id); l.status = 'publicado'; l.photos.forEach((src) => { if (!s.photos.some((p) => p.src === src && p.projectId === l.projectId && p.date === l.date)) { const t = F.byId(s.tasks, l.taskId); s.photos.push({ id: uid('ph'), projectId: l.projectId, src, room: 'Registro de campo', stage: t ? t.name : 'Geral', service: 'Diário de obra', date: l.date }); } }); }, 'Diário publicado. O cliente já pode visualizar a evolução.');
ACT.internalLog = (el) => commit((s) => (F.byId(s.logs, el.dataset.id).status = 'interno'), 'Registro mantido como interno.', 'info');

/* ---------- Planejamento ---------- */
function viewPlanning(_, q) {
  if (q.p) CUI.plan = q.p;
  const sel = CUI.plan; const act = ACTIVE();
  const tasks = sel === 'all' ? act.map((p) => { const ts = F.tasksOf(p.id); return { id: p.id, projectId: p.id, name: p.name, sub: F.client(p.clientId).name, start: ts[0].start, end: F.projectEnd(p.id), baseStart: ts[0].baseStart, baseEnd: ts.reduce((m, t) => (t.baseEnd > m ? t.baseEnd : m), ts[0].baseEnd), progress: F.progressOf(p.id), deps: [], milestone: true }; }) : F.tasksOf(sel);
  const scope = sel === 'all' ? S().tasks.filter((t) => act.some((p) => p.id === t.projectId)) : F.tasksOf(sel);
  const week = scope.filter((t) => t.progress < 100 && t.start <= F.D(6) && t.end >= F.todayISO());
  const late = scope.filter(F.isLate);
  // calendário do mês
  const now = new Date(); const first = new Date(now.getFullYear(), now.getMonth(), 1); const startDow = first.getDay(); const nd = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = []; for (let i = 0; i < startDow; i++) cells.push(null); for (let d = 1; d <= nd; d++) cells.push(d);
  const isoOf = (d) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const colorOf = (pid) => ({ p1: '#103244', p2: '#397A69', p3: '#7A6A9A', p4: '#C18A44', p5: '#9AA7AE' }[pid] || '#3E6A86');
  return `<div class="page-h rv"><div><div class="eyebrow">Planejamento</div><h2>Cronogramas e prazos</h2><p>Altere datas e acompanhe o impacto em tempo real.</p></div>${late.length ? badge(late.length + ' atraso(s)', 'b-danger') : badge('Sem atrasos', 'b-success')}</div>
  <div class="chips mb rv" style="--i:1"><button class="chip ${sel === 'all' ? 'on' : ''}" data-act="setC" data-k="plan" data-v="all">Consolidado</button>${act.map((p) => `<button class="chip ${sel === p.id ? 'on' : ''}" data-act="setC" data-k="plan" data-v="${p.id}">${p.name}</button>`).join('')}</div>
  <div class="rv" style="--i:2">${scheduleControls()}${gantt(sel === 'all' ? tasks : periodFilter(tasks), { zoom: UI.zoom, period: sel === 'all' ? 'all' : UI.period, group: sel === 'all' })}${ganttLegend()}</div>
  <div class="grid lg-g3 mt-lg">
    <div class="card rv" style="--i:3"><div class="card-h"><h3>${ic('calendar-range')} Planejamento semanal</h3><span class="xs muted">${fshort(F.todayISO())} – ${fshort(F.D(6))}</span></div>${week.map((t) => `<div class="li click" data-act="openTask" data-id="${t.id}"><span class="lg-dot" style="background:${colorOf(t.projectId)};width:10px;height:10px"></span><div class="li-b"><b>${t.name}</b><span>${F.proj(t.projectId).name} · ${F.person(t.ownerId).name.split(' ')[0]}</span></div><b class="xs num">${t.progress}%</b></div>`).join('') || empty('coffee', 'Semana livre', 'Nenhuma atividade.')}</div>
    <div class="card rv" style="--i:4"><div class="card-h"><h3>${ic('calendar')} ${MES[now.getMonth()]} ${now.getFullYear()}</h3></div><div class="cal">${DIAS.map((d) => `<div class="ch">${d[0]}</div>`).join('')}${cells.map((d) => { if (!d) return '<div></div>'; const iso = isoOf(d); const evs = scope.filter((t) => t.start === iso || t.end === iso).slice(0, 2); const ev2 = S().events.filter((e) => e.date === iso && (sel === 'all' || e.projectId === sel)).slice(0, 1); return `<div class="cd ${iso === F.todayISO() ? 'today' : ''}"><b>${d}</b>${evs.map((t) => `<span class="ev" style="background:${colorOf(t.projectId)}" title="${esc(t.name)}">${t.start === iso ? '▸' : '■'} ${esc(t.name)}</span>`).join('')}${ev2.map((e) => `<span class="ev" style="background:var(--warning)" title="${esc(e.title)}">${e.time}</span>`).join('')}</div>`; }).join('')}</div><div class="xs faint mt">▸ início · ■ término · laranja: agenda</div></div>
    <div class="card rv" style="--i:5"><div class="card-h"><h3>${ic('git-compare-arrows')} Planejado x realizado</h3></div>${act.map((p) => { const r = F.progressOf(p.id), pl = F.plannedProgressOf(p.id), dv = r - pl; return `<div class="mb"><div class="row between xs"><b>${p.name}</b><span style="color:${dv < -3 ? 'var(--danger)' : dv > 3 ? 'var(--success)' : 'var(--text-2)'}">${dv > 0 ? '+' : ''}${dv} p.p.</span></div><div style="position:relative">${bar(r)}<div style="position:absolute;top:-2px;height:10px;width:2px;background:var(--warning);left:${pl}%" title="Planejado ${pl}%"></div></div><div class="xs muted">Realizado ${r}% · planejado ${pl}%</div></div>`; }).join('')}
      <div class="sep"></div><div class="eyebrow mb">Marcos contratuais</div>${S().tasks.filter((t) => t.milestone && t.progress < 100 && (sel === 'all' || t.projectId === sel)).map((t) => `<div class="row between xs" style="padding:4px 0"><span>${ic('diamond', 'ic-sm')} ${F.proj(t.projectId).name}</span><b>${fdate(t.end)}</b></div>`).join('')}</div>
  </div>`;
}
viewPlanning.title = () => 'Planejamento';

/* ---------- Financeiro ---------- */
function financeBlock(pid) {
  const f = F.finOf(pid); const exp = f.budget * (F.progressOf(pid) / 100); const dev = f.costReal - exp;
  const cs = cashSeries(pid, 5, 2);
  return `<div class="grid md-g3"><div class="card rv"><div class="eyebrow mb">Orçamento</div><dl class="kv"><dt>Receita contratada</dt><dd>${brl(f.contract)}</dd><dt>Custo orçado</dt><dd>${brl(f.budget)}</dd><dt>Fora do orçamento</dt><dd style="color:${f.extra ? 'var(--danger)' : 'inherit'}">${brl(f.extra)}</dd><dt>Custo projetado</dt><dd>${brl(f.projectedCost)}</dd></dl></div>
  <div class="card rv" style="--i:1"><div class="eyebrow mb">Caixa</div><dl class="kv"><dt>Recebido</dt><dd style="color:var(--success)">${brl(f.received)}</dd><dt>A receber</dt><dd>${brl(f.toReceive)}</dd><dt>Pago</dt><dd>${brl(f.costReal)}</dd><dt>A pagar</dt><dd>${brl(f.toPay)}</dd><dt>Saldo de caixa</dt><dd>${brl(f.cash)}</dd></dl></div>
  <div class="card dark rv" style="--i:2"><div class="eyebrow mb" style="color:rgba(255,255,255,.6)">Resultado projetado</div><div style="font-size:30px;font-weight:700;letter-spacing:-.03em" class="num" id="marginVal">${pctf(f.marginPct)}</div><div class="small muted">${brl(f.margin)} de margem</div><div class="sep" style="background:rgba(255,255,255,.12)"></div><div class="small muted">Desvio vs. avanço físico: <b style="color:${dev > 0 ? '#F0B3B3' : '#9EC5B8'}">${dev > 0 ? '+' : ''}${kbrl(dev)}</b></div></div></div>
  <div class="card mt rv" style="--i:3"><div class="card-h"><h3>Fluxo de caixa da obra</h3><button class="btn sm" data-act="newExpense" data-p="${pid}">${ic('plus', 'ic-sm')} Registrar despesa</button></div>${lineChart([{ name: 'Entradas', color: '#397A69', values: cs.inc, area: true }, { name: 'Saídas', color: '#103244', values: cs.out }], cs.ms.map(mlabel), { todayIdx: cs.todayIdx, h: 170 })}</div>`;
}
function viewFinance() {
  const pid = CUI.finP === 'all' ? null : CUI.finP; const f = F.finOf(pid);
  const from = F.D(-30 * CUI.finPer);
  let entries = S().finance.filter((x) => (!pid || x.projectId === pid) && (CUI.finCat === 'Todas' || x.category === CUI.finCat) && (CUI.finPer === 0 || x.date >= from));
  const [sk, sd] = CUI.finSort; entries.sort((a, b) => (a[sk] > b[sk] ? 1 : -1) * sd);
  const cs = cashSeries(pid || 'all', CUI.finPer ? Math.min(11, CUI.finPer - 1) : 8, 2);
  const cats = [...new Set(S().finance.map((x) => x.category))];
  const th = (k, l, r) => `<th class="sort ${r ? 'r' : ''}" data-act="sortF" data-k="${k}">${l} ${sk === k ? (sd > 0 ? '↑' : '↓') : ''}</th>`;
  return `<div class="page-h rv"><div><div class="eyebrow">Financeiro</div><h2>Orçamento, caixa e resultado</h2><p>Dados fictícios e consistentes entre os módulos.</p></div><button class="btn" data-act="newExpense" data-p="${pid || 'p1'}">${ic('plus')} Registrar despesa</button></div>
  <div class="stack mb rv" style="--i:1"><div class="chips"><button class="chip ${!pid ? 'on' : ''}" data-act="setC" data-k="finP" data-v="all">Consolidado</button>${S().projects.map((p) => `<button class="chip ${pid === p.id ? 'on' : ''}" data-act="setC" data-k="finP" data-v="${p.id}">${p.name}</button>`).join('')}</div>
  <div class="row wrap"><select class="input" style="height:38px;width:auto" onchange="CUI.finCat=this.value;render({soft:true})" aria-label="Categoria"><option>Todas</option>${cats.map((c) => `<option ${CUI.finCat === c ? 'selected' : ''}>${c}</option>`).join('')}</select><div class="seg">${[[3, '3m'], [6, '6m'], [12, '12m'], [0, 'Tudo']].map(([v, l]) => `<button class="${CUI.finPer === v ? 'on' : ''}" data-act="setC" data-k="finPer" data-v="${v}">${l}</button>`).join('')}</div></div></div>
  <div class="grid g2 lg-g4">${kpi('Receita contratada', kbrl(f.contract), 'file-signature', 'Orçamento', 0, f.contract)}${kpi('Receita recebida', kbrl(f.received), 'arrow-down-left', `A receber ${kbrl(f.toReceive)}`, 1, f.received)}${kpi('Custos realizados', kbrl(f.costReal), 'arrow-up-right', `Previstos ${kbrl(f.budget)}`, 2, f.costReal)}${kpi('Margem projetada', pctf(f.marginPct), 'percent', `${kbrl(f.margin)} · resultado`, 3)}</div>
  <div class="grid g2 lg-g4 mt">${kpi('Contas a receber', kbrl(f.toReceive), 'hourglass', 'Caixa', 4, f.toReceive)}${kpi('Contas a pagar', kbrl(f.toPay), 'calendar-clock', 'Caixa', 5, f.toPay)}${kpi('Saldo de caixa', kbrl(f.cash), 'landmark', 'Recebido − pago', 6, f.cash)}${kpi('Fora do orçamento', kbrl(f.extra), 'triangle-alert', f.extra ? '<span style="color:var(--danger)">Reduz a margem</span>' : 'Sem desvios', 7, f.extra)}</div>
  <div class="grid lg-21 mt"><div class="card rv" style="--i:4"><div class="card-h"><h3>${ic('line-chart')} Fluxo de caixa</h3><div class="dash-chart-legend"><span><i class="lg-dot" style="background:var(--success)"></i>Entradas</span><span><i class="lg-dot" style="background:var(--navy)"></i>Saídas</span></div></div>${lineChart([{ name: 'Entradas', color: '#397A69', values: cs.inc, area: true }, { name: 'Saídas', color: '#103244', values: cs.out }], cs.ms.map(mlabel), { todayIdx: cs.todayIdx })}</div>
  <div class="card rv" style="--i:5"><div class="card-h"><h3>${ic('percent')} Margem por obra</h3></div>${S().projects.map((p) => { const x = F.finOf(p.id); return `<div class="mb" style="cursor:pointer" data-act="setC" data-k="finP" data-v="${p.id}"><div class="row between xs"><span>${p.name}</span><b>${pctf(x.marginPct)}</b></div>${bar(Math.max(0, Math.min(100, x.marginPct * 3)), x.marginPct < 20 ? 'warn' : 'success')}</div>`; }).join('')}<div class="xs faint">Escala: barra cheia = 33% de margem.</div></div></div>
  <div class="card mt rv" style="--i:6"><div class="card-h"><h3>${ic('scale')} Desvios de orçamento</h3><span class="xs muted">Custo realizado vs. esperado pelo avanço físico</span></div><div class="table-wrap"><table><thead><tr><th>Obra</th><th class="r">Orçado</th><th class="r">Físico</th><th class="r">Esperado</th><th class="r">Realizado</th><th class="r">Desvio</th></tr></thead><tbody>${S().projects.filter((p) => !pid || p.id === pid).map((p) => { const x = F.finOf(p.id); const e = x.budget * F.progressOf(p.id) / 100; const d = x.costReal - e; return `<tr><td><b>${p.name}</b></td><td class="r num">${brl(x.budget)}</td><td class="r num">${F.progressOf(p.id)}%</td><td class="r num">${brl(e)}</td><td class="r num">${brl(x.costReal)}</td><td class="r num" style="color:${d > x.budget * 0.03 ? 'var(--danger)' : d < 0 ? 'var(--success)' : 'inherit'}">${d > 0 ? '+' : ''}${brl(d)}</td></tr>`; }).join('')}</tbody></table></div></div>
  <div class="card mt rv" style="--i:7"><div class="card-h"><h3>${ic('list')} Lançamentos</h3><span class="xs muted">${entries.length} itens</span></div><div class="table-wrap"><table><thead><tr>${th('date', 'Data')}<th>Obra</th><th>Descrição</th><th>Categoria</th>${th('amount', 'Valor', 1)}<th>Situação</th></tr></thead><tbody>${entries.slice(0, 60).map((x) => `<tr><td class="num">${fdate(x.date)}</td><td>${F.proj(x.projectId).name}</td><td>${esc(x.desc)}${x.budgeted ? '' : ' ' + badge('Fora do orçamento', 'b-danger plain')}</td><td>${x.category}</td><td class="r num" style="color:${x.kind === 'receita' ? 'var(--success)' : 'inherit'}">${x.kind === 'receita' ? '+' : '−'} ${brl2(x.amount)}</td><td>${x.paid ? badge(x.kind === 'receita' ? 'Recebido' : 'Pago', 'b-success') : `<button class="btn xs ghost" data-act="markPaid" data-id="${x.id}">${x.kind === 'receita' ? 'Receber' : 'Pagar'}</button>`}</td></tr>`).join('')}</tbody></table></div>${entries.length > 60 ? '<div class="xs faint mt">Exibindo os 60 primeiros — ordene ou filtre para refinar.</div>' : ''}</div>`;
}
viewFinance.title = () => 'Financeiro';
ACT.sortF = (el) => { const k = el.dataset.k; CUI.finSort = [k, CUI.finSort[0] === k ? -CUI.finSort[1] : -1]; render({ soft: true }); };
ACT.markPaid = (el) => commit((s) => (F.byId(s.finance, el.dataset.id).paid = true), 'Lançamento baixado no caixa.');
ACT.newExpense = (el) => openSheet({ render: () => ({ eyebrow: 'Fluxo D', title: 'Registrar despesa', body: `<form class="stack" data-form="saveExpense" id="xform"><div class="field"><label>Obra</label>${projSelect('projectId', el.dataset.p)}</div><div class="field"><label>Descrição *</label><input class="input" name="desc" placeholder="Ex.: Troca de quadro elétrico" autofocus></div><div class="grid g2"><div class="field"><label>Categoria</label><select class="input" name="category">${Object.keys(CAT_COLORS).map((c) => `<option>${c}</option>`).join('')}</select></div><div class="field"><label>Valor (R$) *</label><input class="input" type="number" min="0" step="0.01" name="amount" placeholder="0,00"></div></div><div class="field"><label>Data</label><input class="input" type="date" name="date" value="${F.todayISO()}"></div><label class="switch"><input type="checkbox" name="paid" checked><span>Já paga (impacta o caixa)</span></label><label class="switch"><input type="checkbox" name="budgeted"><span>Prevista no orçamento original</span></label>
  <div class="card" id="impact"><div class="eyebrow mb">Impacto na margem projetada</div><div class="row between"><div><div class="xs muted">Atual</div><b class="num" id="mBefore">—</b></div>${ic('arrow-right')}<div style="text-align:right"><div class="xs muted">Após lançamento</div><b class="num" id="mAfter">—</b></div></div><div class="xs muted mt" id="mNote"></div></div></form>`, foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="submitForm" data-f="xform">${ic('check')} Registrar</button>` }),
  mount: (sh) => { const fm = $('#xform', sh); const upd = () => { const d = Object.fromEntries(new FormData(fm)); const f = F.finOf(d.projectId); const add = d.budgeted ? 0 : +d.amount || 0; const after = ((f.margin - add) / f.contract) * 100; $('#mBefore', sh).textContent = pctf(f.marginPct); const a = $('#mAfter', sh); a.textContent = pctf(after); a.style.color = add ? 'var(--danger)' : 'inherit'; a.animate([{ transform: 'scale(1.12)' }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' }); $('#mNote', sh).textContent = d.budgeted ? 'Despesa prevista: consome o orçamento, sem alterar a margem projetada.' : add ? `Despesa adicional de ${brl2(add)} reduz o resultado projetado.` : 'Informe o valor para ver o impacto.'; }; fm.addEventListener('input', upd); fm.addEventListener('change', upd); upd(); } });
FORMS.saveExpense = (f, d) => {
  if (!need(f, ['desc', 'amount'])) return; const before = F.finOf(d.projectId).marginPct;
  commit((s) => s.finance.push({ id: uid('f'), projectId: d.projectId, kind: 'despesa', category: d.category, desc: d.desc, amount: +d.amount, date: d.date, paid: !!d.paid, budgeted: !!d.budgeted }));
  closeSheet(); const after = F.finOf(d.projectId).marginPct; CUI.finP = d.projectId; if (CUR.path === '/command/finance') render({ soft: true });
  toast(`Despesa registrada em ${F.proj(d.projectId).name}. Margem: ${pctf(before)} → ${pctf(after)}.`, after < before ? 'warn' : 'ok', 'wallet');
};

/* ---------- Compras ---------- */
const PSTEPS = ['Solicitação', 'Cotação', 'Comparação', 'Aprovação', 'Pedido', 'Recebimento', 'Conciliação'];
const stepIdx = (s) => ({ solicitacao: 0, cotacao: 1, revisao: 2, aguardando_cliente: 3, aprovada: 4, pedido: 4, recebido: 5, conciliado: 7, rejeitada: -1 }[s]);
function purchaseTable(list) {
  if (!list.length) return `<div class="card">${empty('package-open', 'Nenhuma solicitação', 'Crie uma nova solicitação de compra.')}</div>`;
  return `<div class="card pad-0"><div class="table-wrap"><table><thead><tr><th>ID</th><th>Material</th><th>Obra</th><th class="r">Valor</th><th>Status</th><th>Cliente?</th></tr></thead><tbody>${list.map((p) => `<tr class="click" data-act="openPurchase" data-id="${p.id}"><td><b>${p.id}</b></td><td>${p.material}<div class="xs muted">${p.qty} ${p.unit}</div></td><td>${F.proj(p.projectId).name}</td><td class="r num">${brl2(p.quotes[p.selected].price)}</td><td>${pbadge(p.status)}</td><td>${p.requiresClient ? ic('user-round-check', 'ic-sm') : '—'}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function viewPurchases(_, q) {
  const all = S().purchases.slice().sort((a, b) => b.id.localeCompare(a.id));
  const groups = { all: ['Todas', () => true], review: ['Para analisar', (p) => ['solicitacao', 'cotacao', 'revisao'].includes(p.status)], client: ['Com o cliente', (p) => p.status === 'aguardando_cliente'], flow: ['Em andamento', (p) => ['aprovada', 'pedido', 'recebido'].includes(p.status)], done: ['Finalizadas', (p) => ['conciliado', 'rejeitada'].includes(p.status)] };
  const list = all.filter(groups[CUI.purSt][1]);
  const sup = {}; S().purchases.forEach((p) => p.quotes.forEach((qq, i) => { const s = (sup[qq.supplier] ||= { n: 0, wins: 0, days: 0, total: 0 }); s.n++; s.days += qq.days; s.total += qq.price; if (i === p.selected) s.wins++; }));
  if (q.id && !SHEET) { history.replaceState(null, '', '#/command/purchases'); setTimeout(() => ACT.openPurchase({ dataset: { id: q.id } }), 350); }
  return `<div class="page-h rv"><div><div class="eyebrow">Compras e suprimentos</div><h2>Solicitação → Conciliação</h2><p>${F.pendingReview().length} aguardando sua análise · ${F.pendingClient().length} com clientes</p></div><button class="btn" data-act="newPurchase">${ic('plus')} Nova solicitação</button></div>
  <div class="card rv mb" style="--i:1"><div class="steps">${PSTEPS.map((s, i) => { const n = S().purchases.filter((p) => stepIdx(p.status) === i || (i === 2 && p.status === 'revisao')).length; return `<div class="st ${n ? 'cur' : ''}">${s}<div class="num" style="font-size:15px;color:var(--text)">${n}</div></div>`; }).join('')}</div></div>
  <div class="chips mb rv" style="--i:2">${Object.entries(groups).map(([k, [l, fn]]) => `<button class="chip ${CUI.purSt === k ? 'on' : ''}" data-act="setC" data-k="purSt" data-v="${k}">${l} <span class="xs" style="opacity:.7">${all.filter(fn).length}</span></button>`).join('')}</div>
  <div class="rv" style="--i:3">${purchaseTable(list)}</div>
  <div class="card mt rv" style="--i:4"><div class="card-h"><h3>${ic('store')} Fornecedores</h3><span class="xs muted">Fictícios · base de cotações</span></div><div class="table-wrap"><table><thead><tr><th>Fornecedor</th><th class="r">Cotações</th><th class="r">Selecionado</th><th class="r">Prazo médio</th><th class="r">Ticket médio</th></tr></thead><tbody>${Object.entries(sup).sort((a, b) => b[1].wins - a[1].wins).map(([n, s]) => `<tr><td><b>${n}</b></td><td class="r">${s.n}</td><td class="r">${s.wins}</td><td class="r">${(s.days / s.n).toFixed(1).replace('.', ',')} dias</td><td class="r num">${brl(s.total / s.n)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
viewPurchases.title = () => 'Compras';
ACT.openPurchase = (el) => openSheet({ render: () => {
  const pu = F.byId(S().purchases, el.dataset.id); const si = stepIdx(pu.status); const qq = pu.quotes[pu.selected];
  const canPick = ['solicitacao', 'cotacao', 'revisao'].includes(pu.status);
  const next = { solicitacao: [['toCotacao', 'Registrar cotações', '']], cotacao: [['approveW', pu.requiresClient ? 'Encaminhar ao cliente' : 'Aprovar compra', 'success'], ['rejectW', 'Rejeitar', 'ghost']], revisao: [['approveW', 'Reenviar ao cliente', 'success'], ['rejectW', 'Cancelar', 'ghost']], aprovada: [['order', 'Emitir pedido', '']], pedido: [['receive', 'Registrar recebimento', 'success']], recebido: [['reconcile', 'Conciliar com financeiro', '']] }[pu.status] || [];
  return { eyebrow: `${pu.id} · ${F.proj(pu.projectId).name}`, title: pu.material, sub: `${pbadge(pu.status)} ${pu.requiresClient ? badge('Exige aprovação do cliente', 'b-info plain') : ''}`,
    body: `<div class="stack">${pu.status === 'rejeitada' ? `<div class="notice" style="background:var(--danger-bg);color:var(--danger)">${ic('x-circle')}<div>Solicitação rejeitada.</div></div>` : `<div class="steps">${PSTEPS.map((s, i) => `<div class="st ${i < si ? 'done' : i === si ? 'cur' : ''}">${s}</div>`).join('')}</div>`}
    ${pu.status === 'aguardando_cliente' ? `<div class="notice">${ic('hourglass')}<div>Aguardando a decisão de <b>${F.client(F.proj(pu.projectId).clientId).name}</b>. A compra só avança após a aprovação do cliente.</div></div>` : ''}
    <div class="card"><dl class="kv"><dt>Quantidade</dt><dd>${pu.qty} ${pu.unit}</dd><dt>Solicitante</dt><dd>${pu.requestedBy}</dd><dt>Proposta selecionada</dt><dd>${qq.supplier}</dd><dt>Valor</dt><dd class="num">${brl2(qq.price)}</dd>${pu.delivery ? `<dt>Entrega</dt><dd>${fdate(pu.delivery)} (${rel(pu.delivery)})</dd>` : ''}</dl></div>
    <div><div class="row between mb"><div class="eyebrow">Comparação de propostas</div>${canPick ? '<span class="xs muted">Toque para selecionar</span>' : ''}</div>${purchaseCompare(pu, canPick)}</div>
    <div><div class="eyebrow mb">Histórico</div>${historyList(pu)}</div></div>`,
    foot: next.map(([a, l, t]) => `<button class="btn ${t}" data-act="pAction" data-a="${a}" data-id="${pu.id}">${l}</button>`).join('') || '' };
} });
ACT.pickQuote = (el) => { if (role() !== 'wellington') return; commit((s) => (F.byId(s.purchases, el.dataset.id).selected = +el.dataset.i)); };
ACT.pAction = (el) => {
  const id = el.dataset.id; const a = el.dataset.a; const now = new Date().toISOString();
  const run = (note = '') => commit((s) => {
    const p = F.byId(s.purchases, id); const H = (action, n = note) => p.history.push({ date: now, user: 'Wellington', action, note: n });
    if (a === 'toCotacao') { if (!p.quotes.some((x) => x.price > 0)) { const b = Math.max(1, p.qty) * 74; p.quotes = [{ supplier: 'Fornecedor Exemplo A', price: Math.round(b), days: 4 }, { supplier: 'Fornecedor Exemplo D', price: Math.round(b * 0.93), days: 7 }]; p.selected = 1; } p.status = 'cotacao'; H('Cotações registradas', 'Cotações simuladas para a demonstração.'); }
    if (a === 'approveW') { if (p.requiresClient) { p.status = 'aguardando_cliente'; H('Encaminhada ao cliente'); } else { p.status = 'aprovada'; H('Aprovada'); } }
    if (a === 'rejectW') { p.status = 'rejeitada'; H('Rejeitada'); }
    if (a === 'order') { p.status = 'pedido'; p.delivery = F.D(Math.ceil(p.quotes[p.selected].days * 1.4)); H('Pedido emitido'); }
    if (a === 'receive') { p.status = 'recebido'; p.delivery = F.todayISO(); H('Recebimento registrado'); }
    if (a === 'reconcile') { p.status = 'conciliado'; H('Conciliada com o financeiro'); s.finance.push({ id: uid('f'), projectId: p.projectId, kind: 'despesa', category: 'Materiais', desc: `${p.id} — ${p.material}`, amount: p.quotes[p.selected].price, date: F.todayISO(), paid: true, budgeted: true }); }
  }, { toCotacao: 'Cotações registradas.', approveW: F.byId(S().purchases, id).requiresClient ? 'Encaminhada ao cliente. Pendência criada no Finesse Client.' : 'Compra aprovada.', rejectW: 'Solicitação rejeitada.', order: 'Pedido emitido ao fornecedor.', receive: 'Recebimento registrado.', reconcile: 'Compra conciliada — lançamento criado no financeiro.' }[a]);
  if (a === 'rejectW') confirmDialog({ title: 'Rejeitar solicitação?', text: 'Informe a justificativa.', okLabel: 'Rejeitar', tone: 'danger', field: 'Justificativa', required: true, onOk: (n) => { run(n); } });
  else run();
};
ACT.newPurchase = (el) => openSheet({ render: () => ({ eyebrow: 'Fluxo B', title: 'Nova solicitação de compra', body: `<form class="stack" data-form="savePurchase" id="puform"><div class="field"><label>Obra</label>${projSelect('projectId', el.dataset?.p || 'p1')}</div><div class="field"><label>Material *</label><input class="input" name="material" list="mats" placeholder="Ex.: Porcelanato 60×120" autofocus><datalist id="mats">${[...new Set(S().purchases.map((p) => p.material))].map((m) => `<option value="${esc(m)}">`).join('')}</datalist></div>
  <div class="grid g2"><div class="field"><label>Quantidade *</label><input class="input" type="number" min="0" name="qty"></div><div class="field"><label>Unidade</label><select class="input" name="unit">${['m²', 'un.', 'sacos', 'latas', 'kits', 'm', 'conj.'].map((u) => `<option>${u}</option>`).join('')}</select></div></div>
  <div class="eyebrow">Cotações de fornecedores</div>${[0, 1, 2].map((i) => `<div class="grid" style="grid-template-columns:2fr 1.3fr .8fr;gap:8px"><input class="input" name="s${i}" placeholder="Fornecedor ${i + 1}" value="${i < 2 ? 'Fornecedor Exemplo ' + 'KLM'[i] : ''}"><input class="input" type="number" min="0" name="v${i}" placeholder="Valor R$"><input class="input" type="number" min="0" name="d${i}" placeholder="Dias"></div>`).join('')}
  <label class="switch"><input type="checkbox" name="requiresClient" checked><span>Exige aprovação do cliente</span></label></form>`, foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="submitForm" data-f="puform">${ic('check')} Criar solicitação</button>` }) });
FORMS.savePurchase = (f, d) => {
  if (!need(f, ['material', 'qty'])) return;
  const quotes = [0, 1, 2].filter((i) => d['s' + i] && +d['v' + i]).map((i) => ({ supplier: d['s' + i], price: +d['v' + i], days: +d['d' + i] || 5 }));
  if (!quotes.length) { toast('Informe ao menos uma cotação com valor.', 'warn'); return; }
  const best = quotes.reduce((b, q, i) => (q.price < quotes[b].price ? i : b), 0);
  const id = 'MAT-' + String(Math.max(...S().purchases.map((p) => +p.id.split('-')[1])) + 1).padStart(3, '0');
  commit((s) => s.purchases.push({ id, projectId: d.projectId, material: d.material, qty: +d.qty, unit: d.unit, requiresClient: !!d.requiresClient, status: 'cotacao', selected: best, quotes, delivery: null, requestedBy: 'Wellington', history: [{ date: new Date().toISOString(), user: 'Wellington', action: 'Solicitação criada', note: '' }] }), `${id} criada. Compare as propostas e encaminhe.`);
  closeSheet(); setTimeout(() => ACT.openPurchase({ dataset: { id } }), 300);
};

/* ---------- Equipes ---------- */
function viewTeam() {
  const ppl = S().people; const days = Array.from({ length: 7 }, (_, i) => F.D(i));
  const colorOf = (pid) => ({ p1: '#103244', p2: '#397A69', p3: '#7A6A9A', p4: '#C18A44' }[pid] || '#3E6A86');
  const prod = ppl.map((p) => ({ p, n: S().logs.filter((l) => l.authorId === p.id).length, t: S().tasks.filter((t) => t.ownerId === p.id && t.progress < 100).length }));
  let k = 0;
  return `<div class="page-h rv"><div><div class="eyebrow">Gestão de equipes</div><h2>Profissionais e alocação</h2><p>${ppl.length} profissionais · ${ppl.filter((p) => p.status === 'Disponível').length} disponíveis</p></div><button class="btn" data-act="newPerson">${ic('user-plus')} Cadastrar profissional</button></div>
  <div class="grid g2 lg-g4">${ppl.map((p, i) => `<div class="card hover rv" style="--i:${i}" data-act="openPerson" data-id="${p.id}"><div class="row"><span class="avatar" style="background:${p.color}">${initials(p.name)}</span><div class="grow" style="min-width:0"><b class="small" style="display:block">${p.name}</b><span class="xs muted">${p.role}</span></div></div><div class="row wrap mt" style="gap:6px">${badge(p.status, p.status === 'Disponível' ? 'b-success' : 'b-info')}${p.projects.map((x) => `<span class="badge plain" style="background:${colorOf(x)};color:#fff">${F.proj(x).name.split(' ').slice(-1)[0]}</span>`).join('')}</div></div>`).join('')}</div>
  <div class="card mt rv" style="--i:4"><div class="card-h"><h3>${ic('calendar-range')} Calendário de alocação</h3><span class="xs muted">Próximos 7 dias</span></div><div class="table-wrap"><div class="week"><div class="wh">Profissional</div>${days.map((d) => `<div class="wh ${d === F.todayISO() ? 'today' : ''}">${DIAS[pd(d).getDay()]} ${pd(d).getDate()}</div>`).join('')}${ppl.map((p) => `<div><b class="xs">${p.name}</b></div>${days.map((d, di) => { const dow = pd(d).getDay(); const pid = p.projects[di % Math.max(1, p.projects.length)]; return `<div>${dow === 0 ? '<span class="xs faint">folga</span>' : pid && (dow !== 6 || di % 2) ? `<div class="alloc" style="--i:${k++};background:${colorOf(pid)}">${F.proj(pid).name.split(' ').slice(-1)[0]}</div>` : '<span class="xs faint">livre</span>'}</div>`; }).join('')}`).join('')}</div></div></div>
  <div class="grid md-g2 mt"><div class="card rv" style="--i:5"><div class="card-h"><h3>${ic('trending-up')} Produtividade</h3><span class="xs muted">Diários registrados · atividades abertas</span></div>${prod.sort((a, b) => b.n - a.n).map(({ p, n, t }) => `<div class="mb"><div class="row between xs"><span>${p.name}</span><span><b>${n}</b> diários · ${t} ativ.</span></div>${bar(Math.min(100, n * 18 + t * 8))}</div>`).join('')}</div>
  <div class="card rv" style="--i:6"><div class="card-h"><h3>${ic('clipboard-list')} Apontamentos diários</h3></div>${S().logs.slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 6).map((l) => `<div class="li click" data-go="#/command/projects/${l.projectId}?tab=diario"><span class="avatar sm alt">${initials(F.person(l.authorId).name)}</span><div class="li-b"><b>${F.proj(l.projectId).name}</b><span>${fdate(l.date)} · ${l.workers} profissionais · ${l.services.length} serviços</span></div>${badge(l.status, l.status === 'publicado' ? 'b-success plain' : 'b-warning plain')}</div>`).join('')}</div></div>`;
}
viewTeam.title = () => 'Equipes';
ACT.openPerson = (el) => openSheet({ render: () => { const p = F.person(el.dataset.id); return { eyebrow: p.role, title: p.name, sub: p.specialty, body: `<div class="stack"><div class="card"><div class="eyebrow mb">Associar a obras</div><div class="stack-sm">${ACTIVE().map((x) => `<label class="switch"><input type="checkbox" ${p.projects.includes(x.id) ? 'checked' : ''} data-act="togglePP" data-p="${p.id}" data-x="${x.id}"><span class="small">${x.name}</span></label>`).join('')}</div></div>
  <div class="card"><div class="eyebrow mb">Disponibilidade</div><div class="seg">${['Em obra', 'Disponível', 'Afastado'].map((s) => `<button class="${p.status === s ? 'on' : ''}" data-act="setPStatus" data-p="${p.id}" data-v="${s}">${s}</button>`).join('')}</div></div>
  <div class="card"><div class="eyebrow mb">Tarefas atribuídas</div>${S().tasks.filter((t) => t.ownerId === p.id && t.progress < 100).map((t) => `<div class="li"><div class="li-b"><b>${t.name}</b><span>${F.proj(t.projectId).name} · até ${fdate(t.end)}</span></div><b class="xs">${t.progress}%</b></div>`).join('') || '<span class="small muted">Nenhuma tarefa aberta.</span>'}
  <form class="row mt" data-form="assignTask" data-p="${p.id}"><select class="input" name="task" style="height:40px">${S().tasks.filter((t) => t.progress < 100 && t.ownerId !== p.id).map((t) => `<option value="${t.id}">${F.proj(t.projectId).name.split(' ').slice(-1)[0]} · ${t.name}</option>`).join('')}</select><button class="btn sm">Atribuir</button></form></div></div>` }; } });
ACT.togglePP = (el) => commit((s) => { const p = F.byId(s.people, el.dataset.p); const x = el.dataset.x; p.projects = p.projects.includes(x) ? p.projects.filter((y) => y !== x) : [...p.projects, x]; }, 'Alocação atualizada.');
ACT.setPStatus = (el) => commit((s) => (F.byId(s.people, el.dataset.p).status = el.dataset.v), 'Disponibilidade atualizada.');
FORMS.assignTask = (f, d) => commit((s) => (F.byId(s.tasks, d.task).ownerId = f.dataset.p), 'Tarefa distribuída.');
ACT.newPerson = () => openSheet({ kind: 'center', render: () => ({ title: 'Cadastrar profissional', body: `<form class="stack" data-form="savePerson" id="pp"><div class="field"><label>Nome *</label><input class="input" name="name" autofocus></div><div class="grid g2"><div class="field"><label>Função *</label><input class="input" name="role" placeholder="Ex.: Gesseiro"></div><div class="field"><label>Especialidade</label><input class="input" name="specialty"></div></div><div class="field"><label>Obra</label>${projSelect('project', 'p1')}</div></form>`, foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn" data-act="submitForm" data-f="pp">Cadastrar</button>` }) });
FORMS.savePerson = (f, d) => { if (!need(f, ['name', 'role'])) return; commit((s) => s.people.push({ id: uid('u'), name: d.name, role: d.role, specialty: d.specialty || d.role, projects: [d.project], color: ['#5E7F4E', '#7A6A9A', '#3E6A86', '#8A5A44'][s.people.length % 4], status: 'Em obra' }), 'Profissional cadastrado.'); closeSheet(); };

/* ---------- Clientes ---------- */
function viewClients() {
  return `<div class="page-h rv"><div><div class="eyebrow">Clientes e contratos</div><h2>Relacionamento</h2><p>CRM operacional · clientes fictícios.</p></div></div>
  <div class="card rv pad-0"><div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Projeto</th><th class="r">Contrato</th><th>Início</th><th>Entrega</th><th>Financeiro</th></tr></thead><tbody>${S().clients.map((c) => { const ps = c.projectIds.map(F.proj).filter(Boolean); return `<tr class="click" data-act="openClient" data-id="${c.id}"><td><div class="row"><span class="avatar sm alt">${initials(c.name)}</span><div><b>${c.name}</b><div class="xs muted">${c.contact}</div></div></div></td><td>${ps.map((p) => p.name).join(', ')}</td><td class="r num">${brl(ps.reduce((a, p) => a + p.contract, 0))}</td><td>${ps[0] ? fdate(ps[0].start) : '—'}</td><td>${ps[0] ? fdate(F.projectEnd(ps[0].id)) : '—'}</td><td>${badge(c.finStatus, c.finStatus === 'Em dia' || c.finStatus === 'Quitado' ? 'b-success' : 'b-warning')}</td></tr>`; }).join('')}</tbody></table></div></div>`;
}
viewClients.title = () => 'Clientes';
ACT.openClient = (el) => openSheet({ render: () => { const c = F.client(el.dataset.id); const ps = c.projectIds.map(F.proj).filter(Boolean); return { eyebrow: 'Cliente', title: c.name, sub: `${c.contact} · ${c.phone}`, body: `<div class="stack">${ps.map((p) => { const f = F.finOf(p.id); return `<div class="card hover" data-act="goto" data-h="#/command/projects/${p.id}"><div class="row between"><b>${p.name}</b><span class="badge ${STATUS_TONE[p.status]}">${p.status}</span></div><dl class="kv mt"><dt>Valor contratado</dt><dd>${brl(p.contract)}</dd><dt>Recebido</dt><dd>${brl(f.received)}</dd><dt>Início</dt><dd>${fdate(p.start)}</dd><dt>Previsão de entrega</dt><dd>${fdate(F.projectEnd(p.id))}</dd><dt>Documentos</dt><dd>${S().docs.filter((d) => d.projectId === p.id).length}</dd></dl>${bar(F.progressOf(p.id))}</div>`; }).join('')}
  <div class="card"><div class="row between mb"><b>Situação financeira</b>${badge(c.finStatus, c.finStatus === 'Em dia' || c.finStatus === 'Quitado' ? 'b-success' : 'b-warning')}</div></div>
  <div><div class="eyebrow mb">Histórico de interações</div><div class="tl" style="padding-left:22px">${c.interactions.slice().sort((a, b) => b.date.localeCompare(a.date)).map((x, i) => `<div class="tl-item rv-left" style="--i:${i};padding-bottom:10px"><b class="small">${esc(x.text)}</b><div class="xs muted">${fdate(x.date)}</div></div>`).join('')}</div>
  <form class="row mt" data-form="addInteraction" data-id="${c.id}"><input class="input" name="text" placeholder="Registrar interação" style="height:40px"><button class="btn sm">${ic('plus', 'ic-sm')}</button></form></div></div>` }; } });
FORMS.addInteraction = (f, d) => { if (!need(f, ['text'])) return; commit((s) => F.byId(s.clients, f.dataset.id).interactions.push({ date: F.todayISO(), text: d.text }), 'Interação registrada.'); };

/* ---------- Relatórios ---------- */
const REPS = { fisica: 'Evolução física', financeira: 'Evolução financeira', pvr: 'Planejado x realizado', custos: 'Custos por categoria', compras: 'Compras', pend: 'Pendências', prod: 'Produtividade', diario: 'Diário de obra' };
function viewReports() {
  const pid = CUI.repP === 'all' ? null : CUI.repP; const P = S().projects.filter((p) => !pid || p.id === pid); const from = F.D(-CUI.repPer);
  let body = '';
  if (CUI.rep === 'fisica') body = `${barChart([{ name: 'Realizado', color: '#103244', values: P.map((p) => F.progressOf(p.id)) }], P.map((p) => p.name.split(' ').slice(-1)[0]), { max: 100 })}<table class="mt"><thead><tr><th>Obra</th><th class="r">Execução</th><th>Etapa atual</th><th class="r">Entrega</th></tr></thead><tbody>${P.map((p) => `<tr><td>${p.name}</td><td class="r">${F.progressOf(p.id)}%</td><td>${(F.currentTask(p.id) || { name: 'Concluída' }).name}</td><td class="r">${fdate(F.projectEnd(p.id))}</td></tr>`).join('')}</tbody></table>`;
  if (CUI.rep === 'financeira') { const cs = cashSeries(pid || 'all', 5, 2); body = `${lineChart([{ name: 'Entradas', color: '#397A69', values: cs.inc, area: true }, { name: 'Saídas', color: '#103244', values: cs.out }], cs.ms.map(mlabel), { todayIdx: cs.todayIdx })}<table class="mt"><thead><tr><th>Obra</th><th class="r">Contrato</th><th class="r">Recebido</th><th class="r">Custo real</th><th class="r">Margem proj.</th></tr></thead><tbody>${P.map((p) => { const f = F.finOf(p.id); return `<tr><td>${p.name}</td><td class="r">${brl(f.contract)}</td><td class="r">${brl(f.received)}</td><td class="r">${brl(f.costReal)}</td><td class="r">${pctf(f.marginPct)}</td></tr>`; }).join('')}</tbody></table>`; }
  if (CUI.rep === 'pvr') body = `${barChart([{ name: 'Realizado', color: '#103244', values: P.map((p) => F.progressOf(p.id)) }, { name: 'Planejado', color: '#C7C7C7', values: P.map((p) => F.plannedProgressOf(p.id)) }], P.map((p) => p.name.split(' ').slice(-1)[0]), { max: 100 })}<table class="mt"><thead><tr><th>Obra</th><th>Etapa</th><th class="r">Fim base</th><th class="r">Fim atual</th><th class="r">Desvio</th></tr></thead><tbody>${P.flatMap((p) => F.tasksOf(p.id).filter((t) => F.slip(t) || F.isLate(t)).map((t) => `<tr><td>${p.name}</td><td>${t.name}</td><td class="r">${fdate(t.baseEnd)}</td><td class="r">${fdate(t.end)}</td><td class="r" style="color:var(--danger)">${F.isLate(t) ? F.lateDays(t) + 'd atraso' : '+' + F.slip(t) + 'd'}</td></tr>`)).join('') || '<tr><td colspan="5" class="muted">Sem desvios.</td></tr>'}</tbody></table>`;
  if (CUI.rep === 'custos') { const cats = Object.keys(CAT_COLORS).map((c) => ({ label: c, color: CAT_COLORS[c], value: S().finance.filter((f) => f.kind === 'despesa' && f.paid && f.category === c && (!pid || f.projectId === pid) && f.date >= from).reduce((a, f) => a + f.amount, 0) })).filter((x) => x.value); body = `${donut(cats, 160, `<b class="num small">${kbrl(cats.reduce((a, x) => a + x.value, 0))}</b>`)}<table class="mt"><thead><tr><th>Categoria</th><th class="r">Valor</th></tr></thead><tbody>${cats.map((x) => `<tr><td>${x.label}</td><td class="r">${brl(x.value)}</td></tr>`).join('')}</tbody></table>`; }
  if (CUI.rep === 'compras') body = purchaseTable(S().purchases.filter((p) => !pid || p.projectId === pid));
  if (CUI.rep === 'pend') body = `<div class="stack-sm">${F.alerts().filter((a) => !pid || a.route.includes(pid) || !/p\d/.test(a.route)).map((a, i) => alertRow(a, i)).join('') || empty('check', 'Sem pendências', '')}</div>`;
  if (CUI.rep === 'prod') body = `<table><thead><tr><th>Profissional</th><th>Função</th><th class="r">Diários</th><th class="r">Atividades abertas</th></tr></thead><tbody>${S().people.map((p) => `<tr><td>${p.name}</td><td>${p.role}</td><td class="r">${S().logs.filter((l) => l.authorId === p.id && l.date >= from).length}</td><td class="r">${S().tasks.filter((t) => t.ownerId === p.id && t.progress < 100).length}</td></tr>`).join('')}</tbody></table>`;
  if (CUI.rep === 'diario') body = `<div class="tl">${S().logs.filter((l) => (!pid || l.projectId === pid) && l.date >= from).sort((a, b) => b.date.localeCompare(a.date)).map((l, i) => logCard(l, i)).join('') || empty('notebook', 'Sem registros no período', '')}</div>`;
  return `<div class="page-h rv no-print"><div><div class="eyebrow">Relatórios</div><h2>Relatórios gerenciais</h2><p>Filtre, visualize e exporte em PDF pelo navegador.</p></div><button class="btn" onclick="window.print()">${ic('printer')} Imprimir / PDF</button></div>
  <div class="stack mb rv no-print" style="--i:1"><div class="chips">${Object.entries(REPS).map(([k, l]) => `<button class="chip ${CUI.rep === k ? 'on' : ''}" data-act="setC" data-k="rep" data-v="${k}">${l}</button>`).join('')}</div><div class="row wrap"><select class="input" style="height:38px;width:auto" onchange="CUI.repP=this.value;render({soft:true})" aria-label="Obra"><option value="all">Todas as obras</option>${S().projects.map((p) => `<option value="${p.id}" ${CUI.repP === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select><div class="seg">${[[30, '30d'], [90, '90d'], [365, '12m']].map(([v, l]) => `<button class="${CUI.repPer === v ? 'on' : ''}" data-act="setC" data-k="repPer" data-v="${v}">${l}</button>`).join('')}</div></div></div>
  <div class="card rv" style="--i:2"><div class="row between mb"><span style="color:var(--navy)">${logo(true)}</span><div style="text-align:right"><b>${REPS[CUI.rep]}</b><div class="xs muted">${pid ? F.proj(pid).name : 'Todas as obras'} · últimos ${CUI.repPer} dias · emitido em ${fdate(F.todayISO())}</div></div></div><div class="sep"></div><div class="table-wrap">${body}</div><p class="xs faint mt">Relatório demonstrativo — dados fictícios.</p></div>`;
}
viewReports.title = () => 'Relatórios';

/* ---------- Alertas / Config / IA ---------- */
function viewAlerts() {
  const A = F.alerts(); const unread = A.filter((a) => !S().readAlerts.includes(a.id)).length;
  return `<div class="page-h rv"><div><div class="eyebrow">Central de alertas</div><h2>${unread} alerta${unread !== 1 ? 's' : ''} não lido${unread !== 1 ? 's' : ''}</h2><p>Derivados automaticamente dos dados de obras, compras e diários.</p></div>${unread ? `<button class="btn ghost sm" data-act="readAll">${ic('check-check', 'ic-sm')} Marcar todos como lidos</button>` : ''}</div>
  <div class="stack-sm">${A.map((a, i) => alertRow(a, i)).join('') || `<div class="card">${empty('bell-off', 'Nenhum alerta', 'Sua operação está em dia.')}</div>`}</div>`;
}
viewAlerts.title = () => 'Alertas';
ACT.readAll = () => commit((s) => { s.readAlerts = [...new Set([...s.readAlerts, ...F.alerts().map((a) => a.id)])]; }, 'Alertas marcados como lidos.');
function viewSettings() {
  return `<div class="page-h rv"><div><div class="eyebrow">Configurações</div><h2>Conta e demonstração</h2></div></div>
  <div class="grid md-g2"><div class="card rv"><div class="row"><span class="avatar" style="width:52px;height:52px;font-size:17px">W</span><div><b>Wellington</b><div class="small muted">Proprietário · Finesse Engenharia</div></div></div><div class="sep"></div><dl class="kv"><dt>Perfil</dt><dd>Administrador (simulado)</dd><dt>Acesso</dt><dd>Completo</dd><dt>Autenticação</dt><dd>Simulada</dd></dl><div class="row wrap mt"><button class="btn ghost sm" data-act="switchProfile">${ic('repeat', 'ic-sm')} Trocar perfil</button><a class="btn ghost sm" href="#/onboarding/1">${ic('rotate-ccw', 'ic-sm')} Reiniciar onboarding</a></div></div>
  <div class="card rv" style="--i:1"><b>Dados da demonstração</b><p class="small muted" style="margin:6px 0 12px">Os dados ficam salvos neste navegador (localStorage) e persistem ao atualizar a página.</p><button class="btn danger sm" data-act="resetDemo">${ic('database-backup', 'ic-sm')} Restaurar dados originais</button></div>
  <div class="card rv md-span" style="--i:2;grid-column:1/-1"><b>Integrações para produção</b><div class="grid md-g2 mt">${[['database', 'Supabase / PostgreSQL', 'Substituir o store local por tabelas relacionais (obras, tarefas, compras, lançamentos).'], ['lock-keyhole', 'Autenticação e RLS', 'Login real, papéis e políticas por linha (cliente só vê suas obras).'], ['hard-drive-upload', 'Armazenamento de arquivos', 'Upload de fotos e documentos com URLs assinadas.'], ['sparkles', 'Serviço de IA', 'Trocar o adapter determinístico por LLM com ferramentas de consulta.'], ['mail', 'Notificações', 'E-mail/WhatsApp para aprovações e alertas.'], ['file-signature', 'Assinatura eletrônica', 'Validade contratual para aprovações e aditivos.']].map(([i, t, d]) => `<div class="row" style="align-items:flex-start"><span class="li-ic" style="width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--bg);flex-shrink:0">${ic(i)}</span><div><b class="small">${t}</b><div class="xs muted">${d}</div></div></div>`).join('')}</div></div></div>`;
}
viewSettings.title = () => 'Configurações';
function viewCmdAI() { return chatView('wellington', ['Quais obras precisam da minha atenção hoje?', 'Qual a margem por obra?', 'Como estão os custos?', 'Quais compras estão pendentes?', 'Existem atividades atrasadas?', 'Quais são as próximas entregas?', 'Como está a equipe?'], 'Olá, Wellington. Consulto obras, cronogramas, compras, equipes e o financeiro da sua carteira demonstrativa.'); }
viewCmdAI.title = () => 'Finesse AI';
viewCmdAI.after = chatAfter;

route('/command', 'command', viewCockpit);
route('/command/projects', 'command', viewProjects);
route('/command/projects/:id', 'command', viewProject);
route('/command/planning', 'command', viewPlanning);
route('/command/finance', 'command', viewFinance);
route('/command/purchases', 'command', viewPurchases);
route('/command/team', 'command', viewTeam);
route('/command/clients', 'command', viewClients);
route('/command/reports', 'command', viewReports);
route('/command/alerts', 'command', viewAlerts);
route('/command/settings', 'command', viewSettings);
route('/command/ai', 'command', viewCmdAI);
