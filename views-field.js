/* ==========================================================================
   FINESSE OS — Finesse Field (operação de campo, mobile-first)
   Regra: Diego (u1) acessa somente obras atribuídas (p1, p4).
   ========================================================================== */
const ME = 'u1';
const FL = { step: 1, pid: null, taskId: null, progress: null, photos: [], services: '', workers: 6, team: [], materials: '', occurrences: '', next: '', dir: 1 };
const resetFL = () => Object.assign(FL, { step: 1, pid: null, taskId: null, progress: null, photos: [], services: '', workers: 6, team: [], materials: '', occurrences: '', next: '', dir: 1 });
const myTasks = () => S().tasks.filter((t) => fieldProjects().some((p) => p.id === t.projectId));

function viewFieldHome() {
  const ps = fieldProjects(); const now = F.todayISO();
  const today = myTasks().filter((t) => t.progress < 100 && t.start <= now && t.end >= F.D(-60)).sort((a, b) => a.end.localeCompare(b.end));
  const sent = S().logs.filter((l) => l.authorId === ME && l.date === now);
  const docs = S().docs.filter((d) => ps.some((p) => p.id === d.projectId) && ['Projetos', 'Plantas', 'Memorial descritivo'].includes(d.cat)).slice(0, 4);
  return `<div class="page-h rv"><div><div class="eyebrow">${DIAS[new Date().getDay()]}, ${fdate(now)}</div><h1 style="margin-top:6px">${greet()}, Diego.</h1><p>${today.length} atividades em andamento nas suas obras.</p></div></div>
  <div class="grid g2 rv" style="--i:1">
    <a class="card hover" href="#/field/daily-log" style="background:var(--navy);color:#fff;border-color:var(--navy)"><span style="display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:rgba(255,255,255,.12)">${ic('camera')}</span><b style="display:block;margin-top:12px">Registrar diário</b><span class="xs" style="opacity:.7">${sent.length ? sent.length + ' enviado(s) hoje' : 'Nenhum registro hoje'}</span></a>
    <a class="card hover" href="#/field/materials"><span class="k-ic" style="display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--bg);color:var(--navy)">${ic('package-plus')}</span><b style="display:block;margin-top:12px">Solicitar material</b><span class="xs muted">Envia para Wellington</span></a>
    <button class="card hover" style="text-align:left" data-act="impediment"><span style="display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--danger-bg);color:var(--danger)">${ic('octagon-alert')}</span><b style="display:block;margin-top:12px">Informar impedimento</b><span class="xs muted">Chuva, falta de material…</span></button>
    <a class="card hover" href="#/field/tasks"><span style="display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:var(--success-bg);color:var(--success)">${ic('list-checks')}</span><b style="display:block;margin-top:12px">Semana</b><span class="xs muted">Planejamento semanal</span></a>
  </div>
  <h3 class="mt-lg mb rv" style="--i:2">Atividades do dia</h3>
  <div class="stack">${today.map((t, i) => fieldTaskCard(t, i + 3)).join('') || empty('sun', 'Sem atividades hoje', 'Consulte o planejamento semanal.')}</div>
  <h3 class="mt-lg mb rv">Suas obras</h3><div class="grid md-g2">${ps.map((p, i) => `<div class="card pad-0 rv" style="--i:${i}">${photo(p.cover, '', p.type, 'style="aspect-ratio:21/9"')}<div style="padding:14px"><b>${p.name}</b><div class="xs muted">${p.address}</div><div class="mt">${bar(F.progressOf(p.id))}</div><div class="row between xs mt"><span>${F.progressOf(p.id)}% executado</span><span>Entrega ${fdate(F.projectEnd(p.id))}</span></div></div></div>`).join('')}</div>
  <h3 class="mt-lg mb rv">Documentos técnicos</h3><div class="card rv"><div class="list">${docs.map((d) => `<div class="li click" data-act="openDoc" data-id="${d.id}"><span class="li-ic">${ic(DOC_IC[d.cat])}</span><div class="li-b"><b>${d.name}</b><span>${F.proj(d.projectId).name}</span></div>${ic('chevron-right', 'ic-sm')}</div>`).join('')}</div></div>`;
}
viewFieldHome.title = () => 'Hoje';
function fieldTaskCard(t, i) {
  const p = F.proj(t.projectId); const late = F.isLate(t);
  return `<div class="card rv" style="--i:${i}"><div class="row between"><span class="xs muted">${p.name}</span>${late ? badge(F.lateDays(t) + 'd atraso', 'b-danger') : t.progress ? badge('Em andamento', 'b-info') : badge('A iniciar')}</div><b style="display:block;margin-top:6px">${t.name}</b><div class="xs muted">${fdate(t.start)} → ${fdate(t.end)} · ${F.person(t.ownerId).name}</div>
  <div class="row mt" style="gap:12px"><div class="grow">${bar(t.progress, late ? 'danger' : '', true)}</div><b class="num">${t.progress}%</b></div>
  <div class="row mt" style="gap:8px">${t.progress === 0 ? `<button class="btn sm grow" data-act="fStart" data-id="${t.id}">${ic('play', 'ic-sm')} Iniciar</button>` : `<button class="btn ghost sm" data-act="fBump" data-id="${t.id}">+10%</button><button class="btn sm grow" data-act="fLog" data-id="${t.id}">${ic('camera', 'ic-sm')} Registrar</button><button class="btn success sm" data-act="fDone" data-id="${t.id}" aria-label="Concluir">${ic('check', 'ic-sm')}</button>`}</div></div>`;
}
ACT.fStart = (el) => commit((s) => { const t = F.byId(s.tasks, el.dataset.id); t.progress = 5; t.start = t.start > F.todayISO() ? F.todayISO() : t.start; }, 'Atividade iniciada. Cronograma atualizado.');
ACT.fBump = (el) => commit((s) => { const t = F.byId(s.tasks, el.dataset.id); t.progress = Math.min(100, t.progress + 10); }, 'Progresso atualizado no cronograma.');
ACT.fDone = (el) => confirmDialog({ title: 'Concluir atividade?', text: 'O progresso será marcado como 100% e refletido no cronograma e nos painéis.', okLabel: 'Concluir', tone: 'success', onOk: () => commit((s) => { const t = F.byId(s.tasks, el.dataset.id); t.progress = 100; }, 'Atividade concluída! 🎉') });
ACT.fLog = (el) => { resetFL(); const t = F.byId(S().tasks, el.dataset.id); Object.assign(FL, { pid: t.projectId, taskId: t.id, progress: t.progress, step: 3 }); go('#/field/daily-log'); };

function viewFieldTasks() {
  const days = Array.from({ length: 7 }, (_, i) => F.D(i)); let k = 0;
  return `<div class="page-h rv"><div><div class="eyebrow">Planejamento semanal</div><h2>Suas atividades</h2><p>${fshort(days[0])} a ${fshort(days[6])}</p></div></div>
  ${days.map((d) => { const ts = myTasks().filter((t) => t.progress < 100 && t.start <= d && t.end >= d); const late = d === F.todayISO() ? myTasks().filter(F.isLate) : []; const all = [...late, ...ts]; return `<div class="tl-day rv" style="--i:${k++}">${rel(d) === 'Hoje' || rel(d) === 'Amanhã' ? rel(d) + ' · ' : ''}${DIAS[pd(d).getDay()]} ${fshort(d)}</div><div class="stack mb">${all.length ? all.map((t) => fieldTaskCard(t, k++)).join('') : `<div class="card small muted rv" style="--i:${k++}">${pd(d).getDay() === 0 ? 'Domingo — sem atividades programadas.' : 'Sem atividades programadas.'}</div>`}</div>`; }).join('')}`;
}
viewFieldTasks.title = () => 'Atividades';

/* Diário — wizard de 6 passos */
const FSTEPS = ['Obra', 'Atividade', 'Progresso', 'Fotos', 'Observações', 'Enviar'];
function viewFieldLog() {
  const s = FL.step; const ps = fieldProjects();
  const t = FL.taskId ? F.byId(S().tasks, FL.taskId) : null;
  let body = '';
  if (s === 1) body = `<h2>Qual obra?</h2><div class="stack mt">${ps.map((p, i) => `<button class="role-card" style="--i:${i}" data-act="flSet" data-k="pid" data-v="${p.id}"><span class="rc-ic">${ic('building-2')}</span><span><b>${p.name}</b><span>${F.progressOf(p.id)}% · ${p.status}</span></span><span class="go">${ic('arrow-right')}</span></button>`).join('')}</div>`;
  if (s === 2) body = `<h2>Qual atividade?</h2><div class="stack mt">${F.tasksOf(FL.pid).filter((x) => x.progress < 100).map((x, i) => `<button class="role-card" style="--i:${i}" data-act="flSet" data-k="taskId" data-v="${x.id}"><span class="rc-ic" style="background:${F.isLate(x) ? 'var(--danger)' : 'var(--navy)'}">${ic('hammer')}</span><span><b>${x.name}</b><span>${x.progress}% · até ${fdate(x.end)}</span></span><span class="go">${ic('arrow-right')}</span></button>`).join('')}</div>`;
  if (s === 3) body = `<h2>Quanto avançou?</h2><p class="muted">${t.name} · antes: ${t.progress}%</p><div class="card mt" style="text-align:center;padding:28px 18px">${ring(FL.progress, 150, 12, `<b class="num" style="font-size:40px;letter-spacing:-.04em" id="flpv">${FL.progress}%</b>`)}<input class="range mt" type="range" min="${t.progress}" max="100" step="5" value="${FL.progress}" oninput="flProg(this.value)" aria-label="Progresso"><div class="row between xs muted"><span>${t.progress}%</span><span>100%</span></div><div class="chips mt" style="justify-content:center">${[5, 10, 20].map((n) => `<button class="chip" data-act="flAdd" data-n="${n}">+${n}%</button>`).join('')}<button class="chip" data-act="flAdd" data-n="100">Concluída</button></div></div>`;
  if (s === 4) body = `<h2>Adicione fotos</h2><p class="muted">Tire fotos ou escolha da galeria. ${FL.photos.length} selecionada(s).</p>
    <label class="uploader mt">${ic('camera')}<b>Tirar foto / enviar arquivo</b><span class="xs">As imagens são reduzidas e salvas apenas neste navegador.</span><input type="file" accept="image/*" capture="environment" multiple hidden onchange="flFiles(this.files)"></label>
    ${FL.photos.length ? `<div class="thumbs mt">${FL.photos.map((src, i) => `<div class="th"><img src="${src}" alt="Foto ${i + 1}"><button data-act="flRm" data-i="${i}" aria-label="Remover">${ic('x')}</button></div>`).join('')}</div>` : ''}
    <div class="eyebrow mt-lg mb">Ou use fotos de exemplo</div><div class="thumbs">${Object.values(F.IMG).map((src) => `<div class="th pick ${FL.photos.includes(src) ? 'on' : ''}" data-act="flPick" data-src="${src}"><img src="${src}" alt="Exemplo"></div>`).join('')}</div>`;
  if (s === 5) body = `<h2>Observações</h2><div class="stack mt"><div class="field"><label>Serviços executados * (um por linha)</label><textarea class="input" id="fl-services" placeholder="Ex.: Rejuntamento da cozinha concluído">${esc(FL.services)}</textarea></div>
    <div class="field"><label>Equipe presente</label><div class="row"><button class="btn ghost sm" data-act="flW" data-n="-1" aria-label="Menos">${ic('minus', 'ic-sm')}</button><b class="num" style="font-size:22px;min-width:40px;text-align:center" id="fl-w">${FL.workers}</b><button class="btn ghost sm" data-act="flW" data-n="1" aria-label="Mais">${ic('plus', 'ic-sm')}</button><span class="small muted">profissionais</span></div>
    <div class="chips mt" style="flex-wrap:wrap">${S().people.filter((p) => p.projects.includes(FL.pid)).map((p) => `<button class="chip ${FL.team.includes(p.id) ? 'on' : ''}" data-act="flTeam" data-id="${p.id}">${p.name.split(' ')[0]}</button>`).join('')}</div></div>
    <div class="field"><label>Materiais utilizados</label><input class="input" id="fl-mat" value="${esc(FL.materials)}" placeholder="Ex.: Argamassa (8 sacos)"></div>
    <div class="field"><label>Ocorrências</label><input class="input" id="fl-occ" value="${esc(FL.occurrences)}" placeholder="Sem ocorrências"></div>
    <div class="field"><label>Próximos passos</label><input class="input" id="fl-next" value="${esc(FL.next)}" placeholder="O que será feito a seguir"></div></div>`;
  if (s === 6) body = `<h2>Revise e envie</h2><div class="card mt"><dl class="kv"><dt>Obra</dt><dd>${F.proj(FL.pid).name}</dd><dt>Atividade</dt><dd>${t.name}</dd><dt>Progresso</dt><dd>${t.progress}% → <span style="color:var(--success)">${FL.progress}%</span></dd><dt>Fotos</dt><dd>${FL.photos.length}</dd><dt>Equipe</dt><dd>${FL.workers} profissionais</dd></dl><div class="sep"></div><div class="stack-sm">${FL.services.split('\n').filter(Boolean).map((x) => `<div class="row small"><span style="color:var(--success)">${ic('check', 'ic-sm')}</span>${esc(x)}</div>`).join('')}</div>${FL.photos.length ? `<div class="photo-strip mt">${FL.photos.map((src) => `<div class="ph"><img src="${src}" alt=""></div>`).join('')}</div>` : ''}</div>
    <div class="notice info mt">${ic('info')}<div>O registro vai para o Finesse Command. Após revisão de Wellington, ele é publicado para o cliente.</div></div>`;
  return `<div class="rv"><div class="steps mb">${FSTEPS.map((x, i) => `<div class="st ${i + 1 < s ? 'done' : i + 1 === s ? 'cur' : ''}">${x}</div>`).join('')}</div></div>
  <div class="${FL.dir > 0 ? 'rv' : 'rv-left'}" style="max-width:640px;margin:0 auto" id="flbody">${body}
  <div class="row mt-lg" style="gap:10px">${s > 1 ? `<button class="btn ghost" data-act="flBack">${ic('arrow-left')} Voltar</button>` : `<a class="btn ghost" href="#/field">Cancelar</a>`}${s >= 3 && s < 6 ? `<button class="btn grow" data-act="flNext">Continuar ${ic('arrow-right')}</button>` : ''}${s === 6 ? `<button class="btn success grow" data-act="flSend">${ic('send')} Enviar atualização</button>` : ''}</div></div>`;
}
viewFieldLog.title = () => 'Diário de obra';
const flRender = () => { render({ soft: true }); const b = $('#flbody'); if (b) b.animate([{ opacity: 0, transform: `translateX(${FL.dir * 24}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' }); scrollTo({ top: 0, behavior: 'smooth' }); };
const flSave5 = () => { if (FL.step !== 5) return; FL.services = $('#fl-services').value; FL.materials = $('#fl-mat').value; FL.occurrences = $('#fl-occ').value; FL.next = $('#fl-next').value; };
Object.assign(ACT, {
  flSet: (el) => { FL[el.dataset.k] = el.dataset.v; if (el.dataset.k === 'taskId') FL.progress = F.byId(S().tasks, el.dataset.v).progress; FL.dir = 1; FL.step++; flRender(); },
  flBack: () => { flSave5(); FL.dir = -1; FL.step--; flRender(); },
  flNext: () => { flSave5(); if (FL.step === 5 && !FL.services.trim()) { toast('Descreva os serviços executados.', 'warn'); $('#fl-services').classList.add('err'); return; } if (FL.step === 4 && !FL.photos.length) toast('Sem fotos — você pode seguir mesmo assim.', 'info', 'image-off'); FL.dir = 1; FL.step++; flRender(); },
  flAdd: (el) => { const n = +el.dataset.n; FL.progress = n === 100 ? 100 : Math.min(100, FL.progress + n); render({ soft: true }); },
  flPick: (el) => { const s = el.dataset.src; FL.photos = FL.photos.includes(s) ? FL.photos.filter((x) => x !== s) : [...FL.photos, s]; render({ soft: true }); },
  flRm: (el) => { FL.photos.splice(+el.dataset.i, 1); render({ soft: true }); },
  flW: (el) => { flSave5(); FL.workers = Math.max(1, FL.workers + +el.dataset.n); $('#fl-w').textContent = FL.workers; },
  flTeam: (el) => { flSave5(); const id = el.dataset.id; FL.team = FL.team.includes(id) ? FL.team.filter((x) => x !== id) : [...FL.team, id]; el.classList.toggle('on'); },
  flSend: () => {
    const t = F.byId(S().tasks, FL.taskId); const id = uid('L'); const now = new Date();
    commit((s) => { const tk = F.byId(s.tasks, FL.taskId); const delta = FL.progress - tk.progress; tk.progress = +FL.progress; s.logs.push({ id, projectId: FL.pid, date: F.todayISO(), time: now.toTimeString().slice(0, 5), authorId: ME, taskId: FL.taskId, status: 'enviado', workers: FL.workers, services: FL.services.split('\n').map((x) => x.trim()).filter(Boolean), materials: FL.materials || '—', occurrences: FL.occurrences || 'Sem ocorrências.', next: FL.next || '—', photos: FL.photos.slice(), progressDelta: delta }); });
    resetFL(); go('#/field');
    setTimeout(() => toast(`Atualização enviada! ${t.name} agora está em ${t.progress}%. Wellington foi notificado.`, 'ok', 'send'), 450);
  },
});
window.flProg = (v) => { FL.progress = +v; $('#flpv').textContent = v + '%'; const c = $('.ring .val'); if (c) c.style.strokeDashoffset = c.dataset.c * (1 - v / 100); };
window.flFiles = (files) => {
  [...files].slice(0, 6).forEach((file) => {
    const rd = new FileReader(); rd.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, 640 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); FL.photos.push(c.toDataURL('image/jpeg', 0.7)); render({ soft: true }); }; img.onerror = () => toast('Não foi possível ler esta imagem.', 'err'); img.src = rd.result; };
    rd.readAsDataURL(file);
  });
};
viewFieldLog.after = () => { if (FL.step === 2 && !FL.pid) FL.step = 1; if (FL.step >= 3 && !FL.taskId) { FL.step = FL.pid ? 2 : 1; render({ soft: true }); } };

/* Materiais e impedimentos */
function viewFieldMaterials() {
  const mine = S().purchases.filter((p) => fieldProjects().some((x) => x.id === p.projectId)).sort((a, b) => b.id.localeCompare(a.id));
  return `<div class="page-h rv"><div><div class="eyebrow">Materiais</div><h2>Solicitar material</h2><p>A solicitação segue para análise de Wellington.</p></div></div>
  <form class="card stack rv" style="--i:1" data-form="fieldMat"><div class="field"><label>Obra</label><select class="input" name="projectId">${fieldProjects().map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div><div class="field"><label>Material *</label><input class="input" name="material" placeholder="Ex.: Rejunte cinza platina"></div><div class="grid g2"><div class="field"><label>Quantidade *</label><input class="input" type="number" min="1" name="qty"></div><div class="field"><label>Unidade</label><select class="input" name="unit">${['un.', 'sacos', 'm²', 'latas', 'kg', 'm'].map((u) => `<option>${u}</option>`).join('')}</select></div></div><div class="field"><label>Urgência</label><div class="seg" id="urg">${['Normal', 'Urgente'].map((u, i) => `<button type="button" class="${i ? '' : 'on'}" onclick="$$('#urg button').forEach(b=>b.classList.remove('on'));this.classList.add('on');this.form.urg.value='${u}'">${u}</button>`).join('')}</div><input type="hidden" name="urg" value="Normal"></div><button class="btn">${ic('send')} Enviar solicitação</button></form>
  <h3 class="mt-lg mb rv">Solicitações das suas obras</h3><div class="stack">${mine.map((p, i) => `<div class="card rv" style="--i:${i}"><div class="row between"><b class="small">${p.id}</b>${pbadge(p.status)}</div><div style="margin-top:4px">${p.material}</div><div class="xs muted">${p.qty} ${p.unit} · ${F.proj(p.projectId).name}${p.delivery && p.status === 'pedido' ? ` · entrega ${fdate(p.delivery)}` : ''}</div>${p.status === 'pedido' ? `<button class="btn success sm mt" data-act="fReceive" data-id="${p.id}">${ic('package-check', 'ic-sm')} Registrar recebimento</button>` : ''}</div>`).join('')}</div>`;
}
viewFieldMaterials.title = () => 'Materiais';
FORMS.fieldMat = (f, d) => {
  if (!need(f, ['material', 'qty'])) return; const id = 'MAT-' + String(Math.max(...S().purchases.map((p) => +p.id.split('-')[1])) + 1).padStart(3, '0');
  commit((s) => s.purchases.push({ id, projectId: d.projectId, material: d.material, qty: +d.qty, unit: d.unit, requiresClient: false, status: 'solicitacao', selected: 0, quotes: [{ supplier: 'A cotar', price: 0, days: 0 }], delivery: null, requestedBy: 'Diego Santos', history: [{ date: new Date().toISOString(), user: 'Diego Santos', action: 'Solicitação criada', note: d.urg === 'Urgente' ? 'Urgente' : '' }] }), `${id} enviada para análise de Wellington.`, 'ok');
};
ACT.fReceive = (el) => commit((s) => { const p = F.byId(s.purchases, el.dataset.id); p.status = 'recebido'; p.delivery = F.todayISO(); p.history.push({ date: new Date().toISOString(), user: 'Diego Santos', action: 'Recebimento registrado', note: '' }); }, 'Recebimento registrado.');
ACT.impediment = () => openSheet({ kind: 'center', render: () => ({ title: 'Informar impedimento', body: `<form class="stack" data-form="impForm" id="imp"><div class="field"><label>Obra</label><select class="input" name="pid">${fieldProjects().map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div><div class="field"><label>Tipo</label><select class="input" name="type"><option>Falta de material</option><option>Condições climáticas</option><option>Acesso bloqueado</option><option>Aguardando definição do cliente</option><option>Outro</option></select></div><div class="field"><label>Descrição *</label><textarea class="input" name="desc" autofocus></textarea></div></form>`, foot: `<button class="btn ghost" data-act="closeSheet">Cancelar</button><button class="btn danger" data-act="submitForm" data-f="imp">Registrar</button>` }) });
FORMS.impForm = (f, d) => { if (!need(f, ['desc'])) return; const t = F.currentTask(d.pid); commit((s) => s.logs.push({ id: uid('L'), projectId: d.pid, date: F.todayISO(), time: new Date().toTimeString().slice(0, 5), authorId: ME, taskId: t ? t.id : null, status: 'enviado', workers: 0, services: [`Impedimento: ${d.type}`], materials: '—', occurrences: d.desc, next: 'Aguardando orientação.', photos: [], progressDelta: 0 }), 'Impedimento registrado e enviado ao Command.', 'warn'); closeSheet(); };

route('/field', 'field', viewFieldHome);
route('/field/tasks', 'field', viewFieldTasks);
route('/field/daily-log', 'field', viewFieldLog);
route('/field/materials', 'field', viewFieldMaterials);
