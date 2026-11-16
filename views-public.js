/* ==========================================================================
   FINESSE OS — Onboarding (8 etapas) + Portfólio público
   ========================================================================== */
let OB_PREV = 1;
const OB_TOTAL = 8;

function obVisual(n) {
  const p1 = F.proj('p1'); const prog = F.progressOf('p1'); const IMG = F.IMG;
  const lastLog = S().logs.filter((l) => l.projectId === 'p1' && l.status === 'publicado').sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0];
  const pend = F.pendingClient('p1')[0];
  switch (n) {
    case 1: return `<div class="welcome-hero"><img src="${IMG.salaD}" alt="Ambiente reformado — imagem ilustrativa"></div>
      <div class="float-chip" style="--dl:.5s;left:-6px;top:10%">${ring(prog, 48, 5, `<b class="num xs">${prog}%</b>`)}<div><span class="muted">Execução</span><b>${p1.name.replace('Residência ', '')}</b></div></div>
      <div class="float-chip" style="--dl:.8s;right:-4px;top:42%"><span class="fc-ic">${ic('notebook-pen')}</span><div><span class="muted">Diário publicado</span><b>${rel(lastLog.date)}, ${lastLog.time}</b></div></div>
      <div class="float-chip" style="--dl:1.1s;left:8%;bottom:7%"><span class="fc-ic" style="background:var(--warning-bg);color:var(--warning)">${ic('badge-check')}</span><div><span class="muted">${pend ? pend.id : 'Compras'}</span><b>${pend ? 'Aguardando aprovação' : 'Tudo aprovado'}</b></div></div>`;
    case 2: return `<div class="stack" style="position:relative;justify-content:center;height:100%">
      ${[['eye', 'Transparência em tempo real', 'Fotos, diário e progresso publicados pela equipe no mesmo dia.'], ['gantt-chart', 'Planejamento e controle', 'Cronograma com marcos, dependências e linha de base.'], ['zap', 'Decisões mais rápidas', 'Aprovações de compras em poucos toques, com histórico.']].map(([i, t, d], k) => `<div class="benefit" style="--i:${k}"><span class="b-ic">${ic(i)}</span><div><b>${t}</b><div class="small muted">${d}</div></div></div>`).join('')}
      <div class="benefit" style="--i:3;background:var(--navy);color:#fff;border-color:var(--navy)"><span class="b-ic" style="background:rgba(255,255,255,.12)">${ic('quote')}</span><div class="serif" style="font-size:20px;line-height:1.25">“Fazer bem feito é o básico. O diferencial é fazer com finesse.”</div></div></div>`;
    case 3: return `<div class="mock"><div class="row between"><div><div class="eyebrow">Diário de obra</div><b>${fdate(lastLog.date)} · ${lastLog.time}</b></div>${badge('Publicado', 'b-success')}</div>
      <div class="photo-strip">${lastLog.photos.map((s, i) => `<div class="ph rv-scale" style="--i:${i + 2};width:44%;height:130px;border-radius:14px"><img src="${s}" alt="Registro"></div>`).join('')}</div>
      <div class="stack-sm">${lastLog.services.map((s, i) => `<div class="row small rv-left" style="--i:${i + 4}"><span style="color:var(--success)">${ic('check-circle-2', 'ic-sm')}</span>${esc(s)}</div>`).join('')}</div>
      <div class="stat-row rv" style="--i:7"><div><b>${lastLog.workers}</b><span>Profissionais</span></div><div><b>${lastLog.photos.length}</b><span>Fotos</span></div><div><b>0</b><span>Ocorrências</span></div></div>
      <div class="notice info rv" style="--i:8">${ic('arrow-right-circle')}<div><b>Próximos passos:</b> ${esc(lastLog.next)}</div></div></div>`;
    case 4: { const ts = F.tasksOf('p1'); const lo = F.dayDiff(ts[0].start, F.todayISO()), hi = F.dayDiff(ts[ts.length - 1].end, F.todayISO()); const span = hi - lo; const X = (d) => ((F.dayDiff(d, F.todayISO()) - lo) / span) * 100;
      return `<div class="mock"><div class="row between"><div><div class="eyebrow">Cronograma</div><b>${p1.name}</b></div>${badge(prog + '% executado', 'b-info')}</div>
      <div style="position:relative;flex:1;display:flex;flex-direction:column;justify-content:space-around">${ts.map((t, i) => { const late = F.isLate(t); return `<div style="position:relative;height:22px"><div class="xs" style="position:absolute;left:0;top:3px;width:34%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-2)">${t.name}</div><div style="position:absolute;left:36%;right:0;top:0;bottom:0"><div class="gantt" style="border:0;overflow:visible;background:none"><div class="g-bar ${t.progress >= 100 ? 'done' : late ? 'late' : t.progress === 0 ? 'zero' : ''}" style="--i:${i};top:2px;height:18px;left:${X(t.start)}%;width:${Math.max(2, X(t.end) - X(t.start))}%">${t.milestone ? '' : `<i style="width:${t.progress}%"></i>`}</div></div></div></div>`; }).join('')}
      <div style="position:absolute;top:-6px;bottom:-6px;left:calc(36% + ${(X(F.todayISO()) * 0.64).toFixed(2)}%);width:2px;background:var(--danger);border-radius:2px"></div></div>
      <div class="legend"><span><i style="background:var(--success)"></i>Concluída</span><span><i style="background:var(--danger)"></i>Atraso identificado</span><span><i style="background:var(--navy)"></i>Em andamento</span></div></div>`; }
    case 5: { const pu = S().purchases.find((x) => x.id === 'MAT-024'); const mx = Math.max(...pu.quotes.map((q) => q.price));
      return `<div class="mock"><div class="row between"><div><div class="eyebrow">Solicitação ${pu.id}</div><b>${pu.material}</b><div class="small muted">${pu.qty} ${pu.unit}</div></div>${pbadge(pu.status)}</div>
      <div class="stack-sm">${pu.quotes.map((q, i) => `<div class="rv" style="--i:${i + 2}"><div class="row between small"><span>${q.supplier}${i === pu.selected ? ' ' + badge('Recomendada', 'b-success plain') : ''}</span><b class="num">${brl2(q.price)}</b></div>${bar(Math.round((q.price / mx) * 100), i === pu.selected ? 'success' : '')}<div class="xs faint">${q.days} dias úteis</div></div>`).join('')}</div>
      <div class="row rv" style="--i:6"><button class="btn success grow" style="animation:pulse 2.4s infinite" tabindex="-1">${ic('check')} Aprovar</button><button class="btn ghost" tabindex="-1">Revisão</button></div>
      <div class="sep"></div><div class="eyebrow">Histórico de decisões</div>${pu.history.map((h, i) => `<div class="row xs rv-left" style="--i:${i + 7}"><span class="lg-dot" style="background:var(--navy)"></span><span class="grow">${esc(h.action)} — ${esc(h.user)}</span><span class="faint">${fshort(h.date)}</span></div>`).join('')}</div>`; }
    case 6: return `<div class="mock" id="ob-chat" style="justify-content:flex-end"><div class="row" style="position:absolute;top:18px;left:18px;right:18px"><span class="fc-ic" style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.1)">${ic('sparkles')}</span><div><b>Finesse AI</b><div class="xs muted">Contextualizada na sua obra</div></div></div><div class="stack-sm" id="ob-chat-log" style="margin-top:60px"></div></div>`;
    case 7: { const fin = F.finOf(); const act = S().projects.filter((p) => p.status !== 'Concluída');
      return `<div class="mock"><div class="row between"><b>Cockpit executivo</b>${badge(act.length + ' obras ativas', 'b-success plain')}</div>
      <div class="grid g2">${[['Faturamento previsto', kbrl(fin.contract)], ['Margem projetada', fin.marginPct.toFixed(1).replace('.', ',') + '%'], ['Compras pendentes', F.pendingReview().length], ['Alertas', F.alerts().length]].map(([l, v], i) => `<div class="rv" style="--i:${i + 1};padding:12px;border-radius:14px;background:rgba(255,255,255,.06)"><div class="xs muted">${l}</div><b style="font-size:20px" class="num">${v}</b></div>`).join('')}</div>
      <div style="color:#fff">${lineChart([{ name: 'Recebido', color: '#9EC5B8', values: [62, 98, 140, 171, 205, 248, 292], area: true }, { name: 'Pago', color: '#ffffff', values: [40, 81, 120, 150, 182, 215, 250] }], ['jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'], { h: 150, money: false })}</div>
      ${act.slice(0, 3).map((p, i) => `<div class="rv" style="--i:${i + 5}"><div class="row between xs"><span>${p.name}</span><b>${F.progressOf(p.id)}%</b></div><div class="bar" style="background:rgba(255,255,255,.12)"><i data-w="${F.progressOf(p.id)}" style="width:${F.progressOf(p.id)}%;background:#fff"></i></div></div>`).join('')}</div>`; }
    case 8: return `<div class="stack" style="justify-content:center;height:100%">${[['wellington', 'Entrar como Wellington', 'Acessar Finesse Command', 'layout-dashboard'], ['client', 'Entrar como Cliente', 'Acessar Finesse Client · Marina Albuquerque', 'home'], ['field', 'Entrar como Responsável pela Obra', 'Acessar Finesse Field · Diego Santos', 'hard-hat']].map(([k, t, s, i], j) => `<button class="role-card" style="--i:${j}" data-act="pickRole" data-r="${k}"><span class="rc-ic">${ic(i)}</span><span><b>${t}</b><span>${s}</span></span><span class="go">${ic('arrow-right')}</span></button>`).join('')}
      <div class="notice" style="animation:rvUp .7s .6s both">${ic('shield-alert')}<div>Autenticação simulada para demonstração. Todos os projetos, valores e pessoas são fictícios.</div></div>
      <a class="link" href="#/portfolio" style="animation:rvUp .7s .7s both;align-self:flex-start">${ic('gem', 'ic-sm')} Ver o portfólio público da Finesse</a></div>`;
  }
}
const OB_COPY = {
  1: ['Finesse OS', 'Sua obra merece uma experiência à altura.', 'Planejamento, execução e transparência em cada detalhe.'],
  2: ['01 · Visão', 'Uma nova forma de acompanhar obras.', 'Tudo o que acontece na sua obra, organizado em um só lugar — do planejamento ao acabamento.'],
  3: ['02 · Acompanhamento diário', 'Cada dia de obra, registrado com cuidado.', 'Fotos da evolução, diário de obra, atividades executadas e próximos passos publicados pela equipe de campo.'],
  4: ['03 · Planejamento inteligente', 'Prazos visíveis. Atrasos identificados cedo.', 'Cronograma Gantt com marcos de entrega, progresso por etapa e linha de base para comparar planejado e realizado.'],
  5: ['04 · Aprovações e compras', 'Decida com clareza, em poucos toques.', 'Solicitações de materiais com orçamentos comparativos, aprovação do cliente e histórico de cada decisão.'],
  6: ['05 · Finesse AI', 'Todas as respostas sobre sua obra, em um só lugar.', 'Um assistente que consulta cronograma, diário, fotos e aprovações — respeitando as permissões de cada perfil.'],
  7: ['06 · Gestão executiva', 'Wellington, toda a sua operação em uma única visão.', 'Obras ativas, resultado financeiro, equipes, compras e alertas operacionais em um cockpit pensado para decidir.'],
  8: ['Comece agora', 'Escolha sua experiência.', 'Três ambientes integrados, compartilhando as mesmas obras, cronogramas, compras e atualizações.'],
};
function viewOnboarding(params) {
  const n = Math.min(OB_TOTAL, Math.max(1, +(params.n || 1)));
  const dir = n >= OB_PREV ? 'in-next' : 'in-prev'; OB_PREV = n;
  const [eb, h, p] = OB_COPY[n]; const dark = n === 6 || n === 7;
  return `<div class="ob ${dark ? 'dark' : ''}" id="ob">
  <div class="ob-top">${n === 1 ? logo() : `<a href="#/onboarding/1" aria-label="Início" style="color:inherit">${logo(true)}</a>`}
    <div class="ob-prog" aria-label="Etapa ${n} de ${OB_TOTAL}">${Array.from({ length: OB_TOTAL }, (_, i) => `<i class="${i < n ? 'done' : ''}"></i>`).join('')}</div>
    ${n < OB_TOTAL ? `<a class="skip" href="#/onboarding/8">Pular</a>` : `<a class="skip" href="#/onboarding/1">${'Reiniciar'}</a>`}</div>
  <div class="ob-stage"><section class="ob-slide ${dir}">
    <div class="ob-copy"><div class="eyebrow">${eb}</div><h1>${h}</h1><p>${p}</p>${n === 1 ? `<div class="row wrap" style="margin-top:8px"><span class="demo-pill">${ic('flask-conical', 'ic-sm')} Protótipo demonstrativo</span></div>` : ''}</div>
    <div class="ob-visual">${obVisual(n)}</div></section></div>
  <div class="ob-foot">${n > 1 ? `<a class="btn ghost" href="#/onboarding/${n - 1}" aria-label="Voltar">${ic('arrow-left')}</a>` : ''}
    ${n === 1 ? `<a class="btn" href="#/onboarding/2">Conhecer o Finesse OS ${ic('arrow-right')}</a>` : n < OB_TOTAL ? `<a class="btn" href="#/onboarding/${n + 1}">Continuar ${ic('arrow-right')}</a>` : `<span class="small muted" style="flex:1;text-align:center">Selecione um perfil acima</span>`}</div></div>`;
}
viewOnboarding.title = (p) => 'Boas-vindas';
viewOnboarding.after = (app, cur) => {
  const n = +(cur.params.n || 1);
  if (n === OB_TOTAL) { S().onboarded = true; F.save(); }
  const ob = $('#ob');
  let x0 = null; ob.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  ob.addEventListener('touchend', (e) => { if (x0 == null || e.target.closest('.ba')) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) go(`#/onboarding/${Math.min(OB_TOTAL, Math.max(1, n + (dx < 0 ? 1 : -1)))}`); x0 = null; });
  if (n === 6) {
    const log = $('#ob-chat-log'); const q = 'O que aconteceu na minha obra hoje?'; const a = AI.answer(q, 'client');
    const seq = [() => log.insertAdjacentHTML('beforeend', `<div class="msg me" style="max-width:85%">${q}</div>`), () => log.insertAdjacentHTML('beforeend', `<div class="msg ai" id="obt" style="color:var(--text)"><span class="typing"><i></i><i></i><i></i></span></div>`), () => { const t = $('#obt'); if (t) t.innerHTML = `<div class="ai-h">${ic('sparkles', 'ic-sm')} Finesse AI</div>${a.html}`; lucideIt(t); },
      () => log.insertAdjacentHTML('beforeend', `<div class="sugg" style="animation:rvUp .6s both">${['Existe alguma atividade atrasada?', 'Qual é a previsão de entrega?'].map((s) => `<span class="chip" style="background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.2)">${s}</span>`).join('')}</div>`)];
    [400, 1100, 2300, 2900].forEach((t, i) => setTimeout(() => { if ($('#ob-chat-log') === log) seq[i](); }, reduced ? 0 : t));
  }
};
document.addEventListener('keydown', (e) => { if (!CUR || !CUR.path.startsWith('/onboarding') || SHEET) return; const n = +(CUR.params.n || 1); if (e.key === 'ArrowRight' && n < OB_TOTAL) go(`#/onboarding/${n + 1}`); if (e.key === 'ArrowLeft' && n > 1) go(`#/onboarding/${n - 1}`); });

/* ---------------- Portfólio ---------------- */
const PORTFOLIO = [
  { slug: 'sala-integrada', cat: 'Residencial', title: 'Sala integrada e cozinha', place: 'Apartamento residencial · São Paulo', before: F.IMG.salaA, after: F.IMG.salaD, scope: ['Porcelanato polido de grande formato', 'Forro de gesso com iluminação embutida', 'Integração cozinha–sala', 'Pintura e acabamentos'],
    text: 'De um apartamento entregue no contrapiso a um ambiente social integrado, com piso contínuo, iluminação planejada e acabamento preciso em cada encontro de materiais.' },
  { slug: 'banheiro-marmorizado', cat: 'Residencial', title: 'Banheiro social marmorizado', place: 'Apartamento residencial · São Paulo', before: F.IMG.banhoA, after: F.IMG.banhoD, extra: F.IMG.box, scope: ['Porcelanato marmorizado piso e parede', 'Nicho embutido no box', 'Bancada suspensa', 'Revisão hidráulica'],
    text: 'O banheiro padrão de construtora ganhou porcelanato marmorizado, nicho embutido e bancada suspensa — mais elegância sem alterar a planta.' },
  { slug: 'suite-iluminacao', cat: 'Residencial', title: 'Suíte com piso e iluminação', place: 'Apartamento residencial · São Paulo', before: F.IMG.quartoA, after: F.IMG.quartoD, scope: ['Piso e rodapé', 'Pintura em tom neutro', 'Iluminação central', 'Instalação de persiana'],
    text: 'Acabamentos neutros e iluminação difusa transformam um dormitório cru em um espaço pronto para morar.' },
  { slug: 'piso-intertravado', cat: 'Condominial', title: 'Piso intertravado em áreas comuns', place: 'Condomínio residencial · Morumbi, São Paulo', before: F.IMG.piso1, after: F.IMG.piso, extra: F.IMG.piso2, scope: ['Remoção e reassentamento de blocos', 'Regularização da base', 'Execução por etapas sem interromper o acesso', 'Limpeza e entrega'],
    text: 'Obra executada em etapas para manter o condomínio em funcionamento: remoção, regularização da base e reassentamento do piso intertravado.' },
];
let PF_CAT = 'Todos';
const splitWords = (t) => t.split(' ').map((w, i) => `<span class="split-word"><span style="--i:${i}">${w}</span></span>`).join(' ');
function pfNav() { return `<header class="pf-nav"><a href="#/portfolio">${logo(true)}</a><div class="row"><a class="btn ghost sm desk-only" href="#/onboarding/1">Finesse OS</a><a class="btn light sm" href="#/portfolio#contato" data-act="pfContact">Solicitar orçamento</a></div></header>`; }
function viewPortfolio() {
  const list = PF_CAT === 'Todos' ? PORTFOLIO : PORTFOLIO.filter((p) => p.cat === PF_CAT);
  return `<div class="pf">${pfNav()}
  <section class="pf-hero"><div class="bg"><img src="${F.IMG.salaD}" alt="Projeto Finesse — sala integrada"></div><div class="in"><div class="eyebrow" style="color:rgba(255,255,255,.7);animation:rvUp .8s .2s both">Finesse Engenharia · Reformas residenciais, comerciais e corporativas</div><h1 style="margin-top:14px">${splitWords('Engenharia com precisão. Acabamento com finesse.')}</h1><p style="animation:rvUp .9s 1s both">Transformamos espaços com técnica, estética e respeito ao cliente — do planejamento ao último acabamento.</p>
  <div class="row wrap" style="margin-top:26px;animation:rvUp .9s 1.15s both"><a class="btn light" href="#/portfolio" data-act="pfContact">Solicitar orçamento ${ic('arrow-right')}</a><a class="btn ghost" style="color:#fff;border-color:rgba(255,255,255,.35)" data-act="pfScroll">Ver projetos</a></div></div></section>
  <div class="marquee" aria-hidden="true"><div>${['Excelência com propósito', 'Técnica e estética', 'Respeito ao cliente', 'Do planejamento ao acabamento', 'Transformação de espaços'].concat(['Excelência com propósito', 'Técnica e estética', 'Respeito ao cliente', 'Do planejamento ao acabamento', 'Transformação de espaços']).map((s) => `<span>${s}</span>`).join('')}</div></div>
  <section class="pf-sec"><div class="eyebrow io">Sobre a Finesse</div><p class="quote io" style="--i:1">“Na Finesse, a engenharia é mais do que cálculo e obra. É visão, cuidado e transformação real de espaços e experiências.”</p>
    <div class="grid md-g3 mt-lg">${[['Excelência com propósito', 'Acreditamos que fazer bem feito é o básico. O diferencial é fazer com finesse.'], ['Técnica e estética', 'Rigor de engenharia aliado ao olhar de quem entende de acabamento.'], ['Respeito ao cliente', 'Comunicação clara, previsibilidade e transparência em cada etapa.']].map(([t, d], i) => `<div class="io" style="--i:${i + 2}"><h3 style="font-size:17px">${t}</h3><p class="muted small" style="margin-top:6px">${d}</p></div>`).join('')}</div></section>
  <section class="pf-sec" style="padding-top:0"><div class="eyebrow io">Serviços</div><h2 class="io" style="--i:1">Do projeto à entrega das chaves.</h2>
    <div class="grid md-g2 lg-g4 mt-lg">${[['Reformas residenciais', 'Apartamentos e casas, de ambientes pontuais a reformas completas.'], ['Obras comerciais', 'Lojas e espaços de atendimento com prazos enxutos.'], ['Ambientes corporativos', 'Escritórios com planejamento compatível à operação.'], ['Condomínios', 'Áreas comuns executadas em etapas, sem interromper a rotina.']].map(([t, d], i) => `<div class="svc io" style="--i:${i}"><div class="n">0${i + 1}</div><h3>${t}</h3><p class="small muted" style="margin-top:6px">${d}</p></div>`).join('')}</div></section>
  <section class="pf-sec" id="projetos" style="padding-top:0"><div class="row between wrap" style="gap:16px;align-items:flex-end"><div><div class="eyebrow io">Portfólio</div><h2 class="io" style="--i:1">Projetos que falam por si.</h2></div>
    <div class="chips io" style="--i:2">${['Todos', 'Residencial', 'Comercial', 'Corporativo', 'Condominial'].map((c) => `<button class="chip ${PF_CAT === c ? 'on' : ''}" data-act="pfCat" data-c="${c}">${c}</button>`).join('')}</div></div>
    <p class="xs faint mt">Registros fotográficos de referência fornecidos pela Finesse Engenharia. Clientes e endereços não são identificados.</p>
    <div class="grid md-g2 mt">${list.length ? list.map((p, i) => `<article class="pf-card rv" style="--i:${i}" data-go="#/portfolio/${p.slug}"><div class="ph"><img src="${p.after}" alt="${esc(p.title)}" loading="lazy"><span class="tag">${p.cat}</span></div><div class="pc-b"><div class="row between"><h3 style="font-size:17px">${p.title}</h3>${ic('arrow-up-right')}</div><div class="small muted">${p.place}</div></div></article>`).join('') : `<div class="card" style="grid-column:1/-1">${empty('drafting-compass', 'Projetos em curadoria', `Em breve, projetos ${PF_CAT.toLowerCase()}s selecionados.`)}</div>`}</div></section>
  <section class="pf-sec" style="padding-top:0"><div class="eyebrow io">Antes e depois</div><h2 class="io" style="--i:1">Arraste para ver a transformação.</h2>
    <div class="grid md-g2 mt-lg">${beforeAfter(F.IMG.salaA, F.IMG.salaD)}${beforeAfter(F.IMG.banhoA, F.IMG.banhoD, 'ANTES', 'DEPOIS', '4/3')}</div></section>
  <section class="pf-sec" style="padding-top:0"><div class="grid lg-21" style="gap:40px"><div><div class="eyebrow io">Metodologia</div><h2 class="io" style="--i:1">Um processo desenhado para não haver surpresas.</h2></div>
    <ol class="method">${[['Diagnóstico e escuta', 'Entendimento do espaço, das necessidades e do orçamento.'], ['Planejamento executivo', 'Cronograma, compras e equipe definidos antes do primeiro dia.'], ['Execução acompanhada', 'Diário de obra, fotos e indicadores publicados no Finesse OS.'], ['Aprovações transparentes', 'Cada compra relevante comparada e aprovada por você.'], ['Vistoria e entrega', 'Checklist técnico, limpeza fina e termo de entrega.']].map(([t, d], i) => `<li class="io" style="--i:${i}"><span class="mn">0${i + 1}</span><div><b>${t}</b><div class="small muted">${d}</div></div></li>`).join('')}</ol></div></section>
  <section class="pf-sec" style="padding-top:0"><div class="eyebrow io">Diferenciais</div><div class="grid md-g2 lg-g4 mt">${[['monitor-smartphone', 'Obra no seu bolso', 'Acompanhe tudo pelo Finesse OS.'], ['gantt-chart', 'Prazos visíveis', 'Cronograma com marcos e alertas.'], ['badge-check', 'Compras aprovadas', 'Comparativo de fornecedores.'], ['sparkles', 'Atenção aos detalhes', 'Acabamento como assinatura.']].map(([i, t, d], k) => `<div class="card io" style="--i:${k}"><div class="kpi"><div class="k-ic">${ic(i)}</div><b>${t}</b><span class="small muted">${d}</span></div></div>`).join('')}</div></section>
  <section class="pf-sec" id="contato" style="padding-top:0"><div class="pf-cta io"><div class="grid lg-21" style="gap:28px;align-items:start"><div><div class="eyebrow" style="color:rgba(255,255,255,.6)">Vamos conversar</div><h2 style="margin-top:10px">Conte sobre o seu espaço.</h2><p style="color:rgba(255,255,255,.7);margin-top:12px">Retornamos para entender o seu projeto e agendar uma visita técnica.</p></div>
    <form class="stack" data-form="lead"><div class="field"><label>Nome</label><input class="input" name="name" placeholder="Seu nome"></div><div class="field"><label>E-mail ou telefone</label><input class="input" name="contact" placeholder="Como falamos com você"></div><div class="field"><label>Tipo de projeto</label><select class="input" name="type"><option>Residencial</option><option>Comercial</option><option>Corporativo</option><option>Condominial</option></select></div><div class="field"><label>Mensagem</label><textarea class="input" name="msg" placeholder="Ambientes, metragem, prazo desejado…"></textarea></div><button class="btn block">Solicitar orçamento ${ic('send')}</button><span class="xs" style="color:rgba(255,255,255,.55)">Formulário demonstrativo — nenhuma informação é enviada.</span></form></div></div></section>
  <footer class="pf-foot">${logo(true).replace('class="logo sm"', 'class="logo sm" style="justify-content:center;color:var(--navy)"')}<p style="margin-top:12px">Finesse Engenharia · Finesse OS — protótipo demonstrativo</p><p class="mt"><a class="link" href="#/onboarding/1">Conhecer o Finesse OS</a></p></footer></div>`;
}
viewPortfolio.title = () => 'Portfólio';
viewPortfolio.after = () => { const n = $('.pf-nav'); n && n.classList.toggle('solid', scrollY > innerHeight * 0.6); };
function viewPortfolioItem({ slug }) {
  const p = PORTFOLIO.find((x) => x.slug === slug); if (!p) return viewPortfolio();
  const others = PORTFOLIO.filter((x) => x !== p).slice(0, 2);
  return `<div class="pf">${pfNav()}
  <section class="pf-hero" style="min-height:78dvh"><div class="bg"><img src="${p.after}" alt="${esc(p.title)}"></div><div class="in"><a class="link" href="#/portfolio" style="color:#fff;animation:rvUp .7s both">${ic('arrow-left', 'ic-sm')} Portfólio</a><div class="eyebrow" style="color:rgba(255,255,255,.7);margin-top:16px">${p.cat} · ${p.place}</div><h1 style="margin-top:12px">${splitWords(p.title)}</h1></div></section>
  <section class="pf-sec"><div class="grid lg-21" style="gap:40px"><div><p class="quote io" style="font-size:clamp(24px,4vw,34px)">${p.text}</p><div class="mt-lg io">${beforeAfter(p.before, p.after)}</div>${p.extra ? `<div class="ph io mt" style="border-radius:var(--r);aspect-ratio:16/10"><img src="${p.extra}" alt="Detalhe do projeto"></div>` : ''}</div>
    <aside class="stack"><div class="card io"><div class="eyebrow mb">Escopo executado</div><div class="stack-sm">${p.scope.map((s) => `<div class="row small"><span style="color:var(--success)">${ic('check', 'ic-sm')}</span>${s}</div>`).join('')}</div></div><div class="card dark io" style="--i:1"><b class="serif" style="font-size:24px">Quer um resultado assim?</b><p class="small muted" style="margin:8px 0 14px">Agende uma visita técnica.</p><button class="btn light block" data-act="pfContact">Solicitar orçamento</button></div><p class="xs faint">Registro fotográfico de referência fornecido pela Finesse Engenharia.</p></aside></div></section>
  <section class="pf-sec" style="padding-top:0"><div class="eyebrow">Outros projetos</div><div class="grid md-g2 mt">${others.map((o, i) => `<article class="pf-card io" style="--i:${i}" data-go="#/portfolio/${o.slug}"><div class="ph"><img src="${o.after}" alt="${esc(o.title)}"></div><div class="pc-b"><h3>${o.title}</h3><div class="small muted">${o.place}</div></div></article>`).join('')}</div></section>
  <footer class="pf-foot"><a class="link" href="#/portfolio">Voltar ao portfólio</a></footer></div>`;
}
viewPortfolioItem.title = ({ slug }) => (PORTFOLIO.find((x) => x.slug === slug) || {}).title || 'Portfólio';
Object.assign(ACT, {
  pfCat: (el) => { PF_CAT = el.dataset.c; const y = scrollY; render({ soft: true }); scrollTo(0, y); },
  pfScroll: () => $('#projetos').scrollIntoView({ behavior: 'smooth' }),
  pfContact: () => { if (!$('#contato')) { go('#/portfolio'); setTimeout(() => $('#contato')?.scrollIntoView({ behavior: 'smooth' }), 500); } else $('#contato').scrollIntoView({ behavior: 'smooth' }); },
});
FORMS.lead = (f, d) => { if (!need(f, ['name', 'contact'])) return; S().leads = S().leads || []; S().leads.push({ ...d, date: new Date().toISOString() }); F.save(); f.reset(); toast('Interesse registrado na demonstração. Nada foi enviado.', 'ok', 'send'); };

route('/', 'public', viewOnboarding);
route('/onboarding', 'public', viewOnboarding);
route('/onboarding/:n', 'public', viewOnboarding);
route('/portfolio', 'public', viewPortfolio);
route('/portfolio/:slug', 'public', viewPortfolioItem);
