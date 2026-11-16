/* ==========================================================================
   FINESSE OS — Dados mockados (todos fictícios) + store persistente
   Estrutura relacional por IDs. Persistência: localStorage "finesse-os-v1".
   Pronto para trocar por um adapter (Supabase/PostgreSQL) no futuro.
   ========================================================================== */
(function () {
  const KEY = 'finesse-os-v1';
  const DAY = 86400000;
  const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const D = (n) => { const d = new Date(today0().getTime() + n * DAY); return d.toISOString().slice(0, 10); };
  const T = (n, hh = 9, mm = 0) => { const d = new Date(today0().getTime() + n * DAY); d.setHours(hh, mm); return d.toISOString(); };

  const IMG = {
    salaA: 'assets/sala-antes.jpg', salaD: 'assets/sala-depois.jpg',
    banhoA: 'assets/banho-antes.jpg', banhoD: 'assets/banho-depois.jpg', box: 'assets/banho-box.jpg',
    quartoA: 'assets/quarto-antes.jpg', quartoD: 'assets/quarto-depois.jpg',
    piso: 'assets/piso-concluido.jpg', piso1: 'assets/piso-obra1.jpg', piso2: 'assets/piso-obra2.jpg',
  };

  function seed() {
    const people = [
      { id: 'u1', name: 'Diego Santos', role: 'Mestre de obras', specialty: 'Coordenação de campo', projects: ['p1', 'p4'], color: '#103244', status: 'Em obra' },
      { id: 'u2', name: 'Luana Prado', role: 'Engenheira residente', specialty: 'Planejamento e qualidade', projects: ['p1', 'p2'], color: '#397A69', status: 'Em obra' },
      { id: 'u3', name: 'Carlos Mendes', role: 'Eletricista', specialty: 'Instalações elétricas', projects: ['p1', 'p4'], color: '#3E6A86', status: 'Em obra' },
      { id: 'u4', name: 'Rogério Lima', role: 'Encanador', specialty: 'Hidráulica', projects: ['p1', 'p2'], color: '#7A6A9A', status: 'Disponível' },
      { id: 'u5', name: 'Paulo Henrique', role: 'Azulejista', specialty: 'Revestimentos', projects: ['p1'], color: '#C18A44', status: 'Em obra' },
      { id: 'u6', name: 'André Souza', role: 'Pintor', specialty: 'Pintura e textura', projects: ['p2', 'p4'], color: '#8A5A44', status: 'Em obra' },
      { id: 'u7', name: 'Thiago Nunes', role: 'Marceneiro (parceiro)', specialty: 'Marcenaria sob medida', projects: ['p1'], color: '#5E7F4E', status: 'Em obra' },
      { id: 'u8', name: 'Bruna Castro', role: 'Arquiteta de interiores', specialty: 'Projeto e compatibilização', projects: ['p3', 'p2'], color: '#B85F5F', status: 'Disponível' },
    ];

    const clients = [
      { id: 'c1', name: 'Marina Albuquerque', short: 'Marina', contact: 'marina@exemplo.com', phone: '(11) 90000-0001', projectIds: ['p1'], finStatus: 'Em dia',
        interactions: [{ date: D(-2), text: 'Reunião de alinhamento sobre revestimentos do banheiro social.' }, { date: D(-15), text: 'Visita à obra com apresentação da marcenaria.' }, { date: D(-120), text: 'Assinatura do contrato (demonstrativo).' }] },
      { id: 'c2', name: 'Rafael e Camila Teixeira', short: 'Rafael', contact: 'teixeira@exemplo.com', phone: '(11) 90000-0002', projectIds: ['p2'], finStatus: 'Em dia',
        interactions: [{ date: D(-4), text: 'Aprovação da bancada em quartzo.' }, { date: D(-150), text: 'Início da obra.' }] },
      { id: 'c3', name: 'Grupo Aurora Participações', short: 'Grupo Aurora', contact: 'obras@aurora.exemplo', phone: '(11) 90000-0003', projectIds: ['p3'], finStatus: 'Sinal pendente',
        interactions: [{ date: D(-6), text: 'Envio do cronograma preliminar.' }, { date: D(-20), text: 'Reunião de briefing do escritório.' }] },
      { id: 'c4', name: 'Concept Store Ltda.', short: 'Concept Store', contact: 'loja@concept.exemplo', phone: '(11) 90000-0004', projectIds: ['p4'], finStatus: 'Parcela em atraso',
        interactions: [{ date: D(-3), text: 'Cobrança da 3ª parcela enviada.' }, { date: D(-45), text: 'Mobilização da obra.' }] },
      { id: 'c5', name: 'Helena e Jorge Vasconcelos', short: 'Helena', contact: 'vasconcelos@exemplo.com', phone: '(11) 90000-0005', projectIds: ['p5'], finStatus: 'Quitado',
        interactions: [{ date: D(-40), text: 'Termo de entrega assinado (demonstrativo).' }] },
    ];

    const projects = [
      { id: 'p1', name: 'Residência Jardim Europa', type: 'Residencial', status: 'Em execução', clientId: 'c1', address: 'Jardim Europa, São Paulo — SP (fictício)', area: 220,
        start: D(-120), end: D(32), contract: 486000, budget: 362000, cover: IMG.salaD, managerId: 'u2', fieldIds: ['u1'],
        risks: [{ id: 'r1', text: 'Prazo de entrega do porcelanato pode impactar revestimentos.', level: 'Médio' }] },
      { id: 'p2', name: 'Apartamento Vila Mariana', type: 'Residencial', status: 'Em acabamento', clientId: 'c2', address: 'Vila Mariana, São Paulo — SP (fictício)', area: 96,
        start: D(-150), end: D(12), contract: 214000, budget: 158000, cover: IMG.box, managerId: 'u2', fieldIds: [],
        risks: [] },
      { id: 'p3', name: 'Escritório Paulista', type: 'Corporativo', status: 'Planejamento', clientId: 'c3', address: 'Av. Paulista, São Paulo — SP (fictício)', area: 340,
        start: D(20), end: D(140), contract: 620000, budget: 471000, cover: '', managerId: 'u8', fieldIds: [],
        risks: [{ id: 'r2', text: 'Aprovação do condomínio para obra em horário comercial.', level: 'Alto' }] },
      { id: 'p4', name: 'Loja Concept', type: 'Comercial', status: 'Em execução', clientId: 'c4', address: 'Jardins, São Paulo — SP (fictício)', area: 140,
        start: D(-45), end: D(45), contract: 298000, budget: 226000, cover: IMG.piso2, managerId: 'u1', fieldIds: ['u1'],
        risks: [{ id: 'r3', text: 'Inadimplência da 3ª parcela.', level: 'Médio' }] },
      { id: 'p5', name: 'Residência Alto da Boa Vista', type: 'Residencial', status: 'Concluída', clientId: 'c5', address: 'Alto da Boa Vista, São Paulo — SP (fictício)', area: 180,
        start: D(-260), end: D(-40), contract: 395000, budget: 301000, cover: IMG.banhoD, managerId: 'u2', fieldIds: [],
        risks: [] },
    ];

    const t = (id, projectId, name, s, e, progress, owner, extra = {}) => ({
      id, projectId, name, start: D(s), end: D(e), baseStart: D(s), baseEnd: D(e), progress, ownerId: owner, deps: [], milestone: false,
      desc: '', photos: [], ...extra,
    });
    const tasks = [
      t('t1', 'p1', 'Planejamento e mobilização', -120, -106, 100, 'u2', { desc: 'Levantamento, cronograma executivo, proteção de áreas e mobilização do canteiro.' }),
      t('t2', 'p1', 'Demolição e preparação', -105, -88, 100, 'u1', { deps: ['t1'], desc: 'Retirada de revestimentos antigos e preparação de bases.', photos: [IMG.salaA] }),
      t('t3', 'p1', 'Infraestrutura hidráulica', -87, -66, 100, 'u4', { deps: ['t2'], desc: 'Novos pontos de água fria/quente e esgoto nos banheiros e cozinha.', photos: [IMG.banhoA] }),
      t('t4', 'p1', 'Infraestrutura elétrica', -80, -58, 100, 'u3', { deps: ['t2'], desc: 'Novo quadro, circuitos dedicados e pontos de iluminação.', photos: [IMG.quartoA] }),
      t('t5', 'p1', 'Regularização', -57, -40, 100, 'u1', { deps: ['t3', 't4'], desc: 'Contrapiso, regularização de paredes e impermeabilização de áreas molhadas.' }),
      t('t6', 'p1', 'Revestimentos', -39, -4, 85, 'u5', { deps: ['t5'], desc: 'Porcelanato da área social, cozinha e banheiros.', photos: [IMG.salaD, IMG.banhoD] }),
      t('t7', 'p1', 'Marcenaria', -10, 14, 30, 'u7', { deps: ['t5'], desc: 'Fabricação e montagem de armários sob medida.' }),
      t('t8', 'p1', 'Pintura', 2, 18, 0, 'u6', { deps: ['t6'], desc: 'Massa corrida, lixamento e pintura acrílica premium.' }),
      t('t9', 'p1', 'Acabamentos', 12, 28, 0, 'u1', { deps: ['t7', 't8'], desc: 'Metais, louças, iluminação e ajustes finais.', photos: [IMG.quartoD] }),
      t('t10', 'p1', 'Vistoria e entrega', 29, 32, 0, 'u2', { deps: ['t9'], milestone: true, desc: 'Vistoria técnica com o cliente e termo de entrega.' }),

      t('t21', 'p2', 'Demolição e preparação', -150, -128, 100, 'u1', {}),
      t('t22', 'p2', 'Instalações', -127, -95, 100, 'u4', { deps: ['t21'] }),
      t('t23', 'p2', 'Revestimentos', -94, -50, 100, 'u5', { deps: ['t22'], photos: [IMG.box] }),
      t('t24', 'p2', 'Pintura', -49, -20, 100, 'u6', { deps: ['t23'] }),
      t('t25', 'p2', 'Acabamentos', -19, 8, 70, 'u2', { deps: ['t24'] }),
      t('t26', 'p2', 'Vistoria e entrega', 9, 12, 0, 'u2', { deps: ['t25'], milestone: true }),

      t('t31', 'p3', 'Levantamento e briefing', -30, -10, 100, 'u8', {}),
      t('t32', 'p3', 'Projeto executivo', -9, 15, 45, 'u8', { deps: ['t31'] }),
      t('t33', 'p3', 'Aprovações condominiais', 0, 19, 10, 'u8', { deps: ['t31'] }),
      t('t34', 'p3', 'Mobilização', 20, 30, 0, 'u1', { deps: ['t32', 't33'] }),
      t('t35', 'p3', 'Execução', 31, 130, 0, 'u1', { deps: ['t34'] }),
      t('t36', 'p3', 'Entrega', 131, 140, 0, 'u8', { deps: ['t35'], milestone: true }),

      t('t41', 'p4', 'Mobilização', -45, -38, 100, 'u1', {}),
      t('t42', 'p4', 'Demolição e piso', -37, -10, 100, 'u1', { deps: ['t41'], photos: [IMG.piso1, IMG.piso2] }),
      t('t43', 'p4', 'Elétrica e iluminação', -15, 6, 60, 'u3', { deps: ['t41'] }),
      t('t44', 'p4', 'Forro e pintura', 0, 22, 5, 'u6', { deps: ['t42'] }),
      t('t45', 'p4', 'Mobiliário e vitrines', 18, 40, 0, 'u7', { deps: ['t44'] }),
      t('t46', 'p4', 'Entrega', 41, 45, 0, 'u1', { deps: ['t45'], milestone: true }),

      t('t51', 'p5', 'Demolição e preparação', -260, -230, 100, 'u1', {}),
      t('t52', 'p5', 'Instalações', -229, -180, 100, 'u3', { deps: ['t51'] }),
      t('t53', 'p5', 'Revestimentos', -179, -120, 100, 'u5', { deps: ['t52'] }),
      t('t54', 'p5', 'Acabamentos', -119, -45, 100, 'u2', { deps: ['t53'] }),
      t('t55', 'p5', 'Entrega', -44, -40, 100, 'u2', { deps: ['t54'], milestone: true }),
    ];

    const q = (supplier, price, days) => ({ supplier, price, days });
    const h = (date, user, action, note = '') => ({ date, user, action, note });
    const purchases = [
      { id: 'MAT-024', projectId: 'p1', material: 'Porcelanato acetinado 90×90', qty: 42, unit: 'm²', requiresClient: true, status: 'aguardando_cliente', selected: 0,
        quotes: [q('Fornecedor Exemplo A', 5460, 5), q('Fornecedor Exemplo B', 5880, 3), q('Fornecedor Exemplo C', 5190, 9)], delivery: null, requestedBy: 'Luana Prado',
        history: [h(T(-3, 10), 'Luana Prado', 'Solicitação criada'), h(T(-2, 15), 'Wellington', 'Cotações comparadas', 'Fornecedor A: melhor equilíbrio entre prazo e preço.'), h(T(-1, 9), 'Wellington', 'Encaminhada ao cliente')] },
      { id: 'MAT-021', projectId: 'p1', material: 'Argamassa AC-III', qty: 60, unit: 'sacos', requiresClient: false, status: 'pedido', selected: 1,
        quotes: [q('Fornecedor Exemplo D', 2280, 4), q('Fornecedor Exemplo A', 2160, 3)], delivery: D(1), requestedBy: 'Diego Santos',
        history: [h(T(-6, 8), 'Diego Santos', 'Solicitação criada'), h(T(-5, 11), 'Wellington', 'Aprovada'), h(T(-4, 9), 'Wellington', 'Pedido emitido')] },
      { id: 'MAT-025', projectId: 'p1', material: 'Kit metais sanitários', qty: 2, unit: 'kits', requiresClient: true, status: 'cotacao', selected: 0,
        quotes: [q('Fornecedor Exemplo E', 3890, 7), q('Fornecedor Exemplo F', 4120, 4)], delivery: null, requestedBy: 'Luana Prado',
        history: [h(T(-1, 14), 'Luana Prado', 'Solicitação criada'), h(T(0, 8, 30), 'Sistema', 'Cotações recebidas')] },
      { id: 'MAT-026', projectId: 'p1', material: 'Tinta acrílica premium (18 L)', qty: 8, unit: 'latas', requiresClient: false, status: 'solicitacao', selected: 0,
        quotes: [q('Fornecedor Exemplo G', 3120, 2), q('Fornecedor Exemplo D', 2980, 5)], delivery: null, requestedBy: 'Diego Santos',
        history: [h(T(0, 7, 50), 'Diego Santos', 'Solicitação criada', 'Necessária para início da pintura.')] },
      { id: 'MAT-019', projectId: 'p4', material: 'Luminárias de trilho LED', qty: 24, unit: 'un.', requiresClient: false, status: 'solicitacao', selected: 0,
        quotes: [q('Fornecedor Exemplo H', 7440, 10), q('Fornecedor Exemplo I', 6980, 15)], delivery: null, requestedBy: 'Carlos Mendes',
        history: [h(T(-1, 16), 'Carlos Mendes', 'Solicitação criada')] },
      { id: 'MAT-017', projectId: 'p2', material: 'Bancada em quartzo', qty: 1, unit: 'conj.', requiresClient: true, status: 'recebido', selected: 0,
        quotes: [q('Fornecedor Exemplo J', 9800, 12)], delivery: D(-2), requestedBy: 'Luana Prado',
        history: [h(T(-20, 10), 'Luana Prado', 'Solicitação criada'), h(T(-18, 10), 'Rafael Teixeira', 'Aprovada pelo cliente'), h(T(-17, 9), 'Wellington', 'Pedido emitido'), h(T(-2, 15), 'Diego Santos', 'Recebimento registrado')] },
    ];

    // Financeiro: lançamentos determinísticos por obra
    const finance = [];
    let fid = 1;
    const cats = [['Mão de obra', .38], ['Materiais', .34], ['Serviços terceirizados', .14], ['Equipamentos', .06], ['Administrativo', .08]];
    const plan = { p1: { realized: .66, parcels: [[-120, 97200, 1], [-90, 97200, 1], [-60, 97200, 1], [-30, 97200, 1], [5, 97200, 0]] },
      p2: { realized: .88, parcels: [[-150, 64200, 1], [-100, 64200, 1], [-50, 64200, 1], [12, 21400, 0]] },
      p3: { realized: .04, parcels: [[-10, 62000, 1], [20, 124000, 0], [80, 217000, 0], [140, 217000, 0]] },
      p4: { realized: .42, parcels: [[-45, 89400, 1], [-15, 89400, 1], [-3, 59600, 0], [45, 59600, 0]] },
      p5: { realized: .97, parcels: [[-260, 98750, 1], [-200, 98750, 1], [-130, 98750, 1], [-40, 98750, 1]] } };
    projects.forEach((p) => {
      const pl = plan[p.id];
      pl.parcels.forEach(([day, amount, paid], i) => finance.push({ id: 'f' + fid++, projectId: p.id, kind: 'receita', category: 'Parcela contratual', desc: `Parcela ${i + 1}`, amount, date: D(day), paid: !!paid, budgeted: true }));
      const total = p.budget * pl.realized;
      const s = (new Date(p.start) - today0()) / DAY;
      const e = Math.min(-1, (new Date(p.end) - today0()) / DAY);
      const months = Math.max(1, Math.round((e - s) / 30));
      for (let m = 0; m < months; m++) {
        cats.forEach(([c, w], ci) => {
          const wobble = 1 + (((m * 7 + ci * 3) % 5) - 2) * 0.06;
          const day = Math.round(s + (m + 0.5) * ((e - s) / months)) + ci;
          finance.push({ id: 'f' + fid++, projectId: p.id, kind: 'despesa', category: c, desc: `${c} — mês ${m + 1}`, amount: Math.round((total * w / months) * wobble / 10) * 10, date: D(Math.min(-1, day)), paid: true, budgeted: true });
        });
      }
    });
    // contas a pagar previstas
    [['p1', 'Marcenaria — 2ª medição', 'Serviços terceirizados', 18400, 6], ['p1', 'Mão de obra — quinzena', 'Mão de obra', 14200, 3], ['p4', 'Iluminação — sinal', 'Materiais', 3490, 4], ['p2', 'Pintura — fechamento', 'Mão de obra', 6200, 8]]
      .forEach(([pid, desc, category, amount, d]) => finance.push({ id: 'f' + fid++, projectId: pid, kind: 'despesa', category, desc, amount, date: D(d), paid: false, budgeted: true }));

    const logs = [
      { id: 'L105', projectId: 'p1', date: D(0), time: '09:42', authorId: 'u1', taskId: 't6', status: 'publicado', workers: 7,
        services: ['Concluída a instalação de revestimentos na cozinha', 'Iniciada a preparação do banheiro social'], materials: 'Argamassa AC-III (12 sacos), rejunte epóxi',
        occurrences: 'Sem ocorrências críticas.', next: 'Rejuntamento da cozinha e impermeabilização do box.', photos: [IMG.salaD, IMG.banhoA, IMG.banhoD], progressDelta: 5 },
      { id: 'L104', projectId: 'p1', date: D(-1), time: '17:10', authorId: 'u1', taskId: 't7', status: 'publicado', workers: 6,
        services: ['Medição final dos armários da cozinha', 'Assentamento de porcelanato na sala (85%)'], materials: 'Porcelanato 90×90 (18 m²)',
        occurrences: 'Uma peça de porcelanato chegou trincada — substituição solicitada.', next: 'Concluir cozinha.', photos: [IMG.salaA], progressDelta: 4 },
      { id: 'L103', projectId: 'p1', date: D(-3), time: '16:45', authorId: 'u2', taskId: 't6', status: 'publicado', workers: 6,
        services: ['Assentamento de porcelanato na sala', 'Conferência de prumo e nível'], materials: 'Porcelanato 90×90 (22 m²)',
        occurrences: 'Sem ocorrências.', next: 'Seguir com sala e cozinha.', photos: [IMG.quartoA, IMG.quartoD], progressDelta: 6 },
      { id: 'L102', projectId: 'p1', date: D(-6), time: '17:30', authorId: 'u1', taskId: 't6', status: 'interno', workers: 5,
        services: ['Ajuste de cronograma interno com fornecedor de porcelanato'], materials: '—',
        occurrences: 'Atraso de 2 dias na entrega do fornecedor (registro interno).', next: 'Reprogramar equipe.', photos: [], progressDelta: 0 },
      { id: 'L101', projectId: 'p1', date: D(-8), time: '16:20', authorId: 'u1', taskId: 't6', status: 'publicado', workers: 5,
        services: ['Início do assentamento de revestimentos', 'Impermeabilização dos banheiros concluída'], materials: 'Manta líquida, argamassa',
        occurrences: 'Sem ocorrências.', next: 'Assentamento na área social.', photos: [IMG.banhoA], progressDelta: 8 },
      { id: 'L401', projectId: 'p4', date: D(-1), time: '18:00', authorId: 'u1', taskId: 't42', status: 'publicado', workers: 8,
        services: ['1ª etapa do piso intertravado concluída'], materials: 'Bloco intertravado, areia', occurrences: 'Sem ocorrências.', next: 'Elétrica da vitrine.', photos: [IMG.piso, IMG.piso1, IMG.piso2], progressDelta: 10 },
      { id: 'L201', projectId: 'p2', date: D(-2), time: '15:00', authorId: 'u2', taskId: 't25', status: 'publicado', workers: 4,
        services: ['Instalação do box em vidro do banheiro'], materials: 'Box de vidro temperado', occurrences: 'Sem ocorrências.', next: 'Limpeza fina.', photos: [IMG.box], progressDelta: 6 },
    ];

    const photos = [
      { id: 'ph1', projectId: 'p1', src: IMG.salaA, room: 'Sala e cozinha', stage: 'Demolição e preparação', service: 'Preparação', date: D(-100), pair: 'sala' },
      { id: 'ph2', projectId: 'p1', src: IMG.salaD, room: 'Sala e cozinha', stage: 'Revestimentos', service: 'Revestimento', date: D(0), pair: 'sala' },
      { id: 'ph3', projectId: 'p1', src: IMG.banhoA, room: 'Banheiro social', stage: 'Infraestrutura hidráulica', service: 'Hidráulica', date: D(-80), pair: 'banho' },
      { id: 'ph4', projectId: 'p1', src: IMG.banhoD, room: 'Banheiro social', stage: 'Revestimentos', service: 'Revestimento', date: D(0), pair: 'banho' },
      { id: 'ph5', projectId: 'p1', src: IMG.quartoA, room: 'Suíte', stage: 'Infraestrutura elétrica', service: 'Elétrica', date: D(-70), pair: 'quarto' },
      { id: 'ph6', projectId: 'p1', src: IMG.quartoD, room: 'Suíte', stage: 'Revestimentos', service: 'Iluminação', date: D(-3), pair: 'quarto' },
      { id: 'ph7', projectId: 'p2', src: IMG.box, room: 'Banheiro', stage: 'Acabamentos', service: 'Vidraçaria', date: D(-2) },
      { id: 'ph8', projectId: 'p4', src: IMG.piso, room: 'Área externa', stage: 'Demolição e piso', service: 'Pavimentação', date: D(-1) },
      { id: 'ph9', projectId: 'p4', src: IMG.piso1, room: 'Área externa', stage: 'Demolição e piso', service: 'Pavimentação', date: D(-12) },
      { id: 'ph10', projectId: 'p4', src: IMG.piso2, room: 'Área externa', stage: 'Demolição e piso', service: 'Pavimentação', date: D(-12) },
    ];

    const docCats = [['Contrato', 'Contrato de prestação de serviços'], ['Projetos', 'Projeto executivo de interiores'], ['Plantas', 'Planta baixa — layout'], ['Plantas', 'Planta de pontos elétricos'],
      ['Memorial descritivo', 'Memorial descritivo de acabamentos'], ['Orçamentos', 'Orçamento aprovado — revisão 02'], ['Aditivos', 'Aditivo 01 — marcenaria da varanda'], ['Relatórios', 'Relatório mensal de obra'], ['Termos de entrega', 'Termo de entrega (modelo)']];
    const docs = [];
    projects.forEach((p) => docCats.forEach(([cat, name], i) => docs.push({ id: `${p.id}-d${i}`, projectId: p.id, cat, name, date: D(Math.min(-1, -110 + i * 12)), size: `${(0.4 + ((i * 37) % 30) / 10).toFixed(1)} MB`, clientVisible: cat !== 'Relatórios' || i % 2 === 0 })));

    const events = [
      { id: 'e1', date: D(0), time: '10:00', title: 'Visita técnica — Jardim Europa', projectId: 'p1' },
      { id: 'e2', date: D(0), time: '14:30', title: 'Reunião de projeto — Grupo Aurora', projectId: 'p3' },
      { id: 'e3', date: D(1), time: '08:00', title: 'Recebimento de argamassa (MAT-021)', projectId: 'p1' },
      { id: 'e4', date: D(2), time: '11:00', title: 'Vistoria de elétrica — Loja Concept', projectId: 'p4' },
      { id: 'e5', date: D(4), time: '16:00', title: 'Apresentação de marcenaria ao cliente', projectId: 'p1' },
    ];

    return { version: 1, createdAt: new Date().toISOString(), role: null, onboarded: false, people, clients, projects, tasks, purchases, finance, logs, photos, docs, events, chat: { client: [], wellington: [], field: [] }, readAlerts: [] };
  }

  /* ---------------- Store ---------------- */
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  if (!S || S.version !== 1) S = seed();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* armazenamento indisponível */ } };
  save();

  /* ---------------- Selectors / regras derivadas ---------------- */
  const dayDiff = (a, b) => Math.round((new Date(a) - new Date(b)) / DAY);
  const todayISO = () => D(0);
  const byId = (arr, id) => arr.find((x) => x.id === id);
  const proj = (id) => byId(S.projects, id);
  const person = (id) => byId(S.people, id);
  const client = (id) => byId(S.clients, id);
  const tasksOf = (pid) => S.tasks.filter((x) => x.projectId === pid).sort((a, b) => a.start.localeCompare(b.start));
  const dur = (t) => Math.max(1, dayDiff(t.end, t.start) + 1);
  const isLate = (t) => t.progress < 100 && dayDiff(todayISO(), t.end) > 0;
  const lateDays = (t) => Math.max(0, dayDiff(todayISO(), t.end));
  const slip = (t) => dayDiff(t.end, t.baseEnd); // desvio da linha de base
  function progressOf(pid) {
    const ts = tasksOf(pid); if (!ts.length) return 0;
    const tot = ts.reduce((a, t) => a + dur(t), 0);
    return Math.round(ts.reduce((a, t) => a + dur(t) * t.progress, 0) / tot);
  }
  function plannedProgressOf(pid) {
    const ts = tasksOf(pid); if (!ts.length) return 0;
    const tot = ts.reduce((a, t) => a + dur(t), 0); const now = todayISO();
    return Math.round(ts.reduce((a, t) => { const el = Math.min(dur(t), Math.max(0, dayDiff(now, t.baseStart) + 1)); return a + Math.min(1, el / dur(t)) * dur(t) * 100; }, 0) / tot);
  }
  const currentTask = (pid) => tasksOf(pid).find((t) => t.progress < 100 && dayDiff(todayISO(), t.start) >= 0) || tasksOf(pid).find((t) => t.progress < 100);
  const nextTask = (pid) => { const c = currentTask(pid); return tasksOf(pid).find((t) => t.progress === 0 && t !== c && dayDiff(t.start, todayISO()) >= 0); };
  const projectEnd = (pid) => { const ts = tasksOf(pid); return ts.length ? ts.reduce((m, t) => (t.end > m ? t.end : m), ts[0].end) : proj(pid).end; };
  function finOf(pid) {
    const p = proj(pid); const F = S.finance.filter((f) => !pid || f.projectId === pid);
    const sum = (fn) => F.filter(fn).reduce((a, f) => a + f.amount, 0);
    const received = sum((f) => f.kind === 'receita' && f.paid);
    const toReceive = sum((f) => f.kind === 'receita' && !f.paid);
    const costReal = sum((f) => f.kind === 'despesa' && f.paid);
    const toPay = sum((f) => f.kind === 'despesa' && !f.paid);
    const extra = sum((f) => f.kind === 'despesa' && !f.budgeted);
    const contract = pid ? p.contract : S.projects.reduce((a, x) => a + x.contract, 0);
    const budget = pid ? p.budget : S.projects.reduce((a, x) => a + x.budget, 0);
    const projectedCost = budget + extra;
    const margin = contract - projectedCost;
    return { contract, budget, received, toReceive, costReal, toPay, extra, projectedCost, margin, marginPct: contract ? (margin / contract) * 100 : 0, cash: received - costReal };
  }
  const pendingClient = (pid) => S.purchases.filter((p) => p.status === 'aguardando_cliente' && (!pid || p.projectId === pid));
  const pendingReview = () => S.purchases.filter((p) => p.status === 'solicitacao' || p.status === 'cotacao' || p.status === 'revisao');
  const logsPendingReview = () => S.logs.filter((l) => l.status === 'enviado');

  function alerts() {
    const A = [];
    S.tasks.filter(isLate).forEach((t) => { const p = proj(t.projectId); if (p.status !== 'Concluída') A.push({ id: 'late-' + t.id + '-' + t.end, tone: 'danger', icon: 'clock-alert', text: `Wellington, a obra ${p.name} possui uma atividade atrasada: ${t.name} (${lateDays(t)} dia${lateDays(t) > 1 ? 's' : ''}).`, route: `#/command/planning?p=${p.id}` }); });
    const pr = pendingReview();
    if (pr.length) A.push({ id: 'rev-' + pr.map((x) => x.id).join(','), tone: 'warning', icon: 'shopping-cart', text: `Wellington, existem ${pr.length} solicitaç${pr.length > 1 ? 'ões' : 'ão'} de compra aguardando análise.`, route: '#/command/purchases' });
    S.purchases.forEach((p) => { const last = p.history[p.history.length - 1]; if (last && /cliente/i.test(last.action) && /Aprovad/i.test(last.action) && dayDiff(todayISO(), last.date.slice(0, 10)) <= 7) A.push({ id: 'ok-' + p.id + last.date, tone: 'success', icon: 'badge-check', text: `Wellington, o cliente aprovou o orçamento de ${p.material.toLowerCase()} (${p.id}).`, route: '#/command/purchases?id=' + p.id }); });
    S.purchases.filter((p) => p.delivery === D(1) && p.status === 'pedido').forEach((p) => A.push({ id: 'del-' + p.id, tone: 'info', icon: 'truck', text: `Wellington, uma entrega está prevista para amanhã: ${p.material} (${proj(p.projectId).name}).`, route: '#/command/purchases?id=' + p.id }));
    logsPendingReview().forEach((l) => A.push({ id: 'log-' + l.id, tone: 'info', icon: 'notebook-pen', text: `Wellington, há um novo diário de obra enviado por ${person(l.authorId).name} aguardando publicação.`, route: '#/command/projects/' + l.projectId + '?tab=diario' }));
    S.purchases.filter((p) => p.status === 'revisao').forEach((p) => A.push({ id: 'rv-' + p.id, tone: 'warning', icon: 'message-square-warning', text: `Wellington, o cliente solicitou revisão em ${p.id} — ${p.material}.`, route: '#/command/purchases?id=' + p.id }));
    S.purchases.filter((p) => p.status === 'rejeitada').forEach((p) => A.push({ id: 'rj-' + p.id, tone: 'danger', icon: 'x-circle', text: `Wellington, o cliente rejeitou ${p.id} — ${p.material}.`, route: '#/command/purchases?id=' + p.id }));
    return A;
  }

  window.FOS = { S: () => S, set: (ns) => { S = ns; save(); }, save, reset: () => { S = seed(); save(); }, KEY, IMG, D, T, DAY, dayDiff, todayISO, byId, proj, person, client, tasksOf, dur, isLate, lateDays, slip, progressOf, plannedProgressOf, currentTask, nextTask, projectEnd, finOf, pendingClient, pendingReview, logsPendingReview, alerts };
})();
