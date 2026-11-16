# Finesse OS — protótipo navegável

Protótipo HTML/CSS/JS **mobile-first**, sem build e sem dependências de backend, da plataforma de gestão e acompanhamento de obras da Finesse Engenharia.

> Todos os projetos, clientes, valores e pessoas são **fictícios**. A autenticação é **simulada**. As fotos da pasta `assets/` vieram do material de referência enviado pela Finesse e aparecem como **imagens ilustrativas**.

## Como rodar

```bash
node server.js
```

Abra http://localhost:4173. O app usa rotas por hash (`#/client`, `#/command`…). Por isso, qualquer hospedagem estática serve (Vercel, Netlify, GitHub Pages): basta publicar a pasta.

## Deploy na Vercel

O projeto é estático e não tem etapa de build (`vercel.json` já está configurado).

1. Suba o repositório no GitHub.
2. Na Vercel: **Add New → Project → Import** o repositório.
3. Framework Preset: **Other**. Deixe Build Command e Output Directory vazios (o site é servido da raiz).
4. **Deploy.** Nenhuma variável de ambiente é necessária.

Pela CLI, como alternativa: `npx vercel` (preview) e `npx vercel --prod`.

## Ambientes e rotas

| Ambiente | Rotas |
|---|---|
| Público | `#/onboarding/1…8`, `#/portfolio`, `#/portfolio/:slug` |
| Finesse Client (Marina, fictícia) | `#/client`, `/schedule`, `/timeline`, `/gallery`, `/approvals`, `/documents`, `/ai` |
| Finesse Command (Wellington) | `#/command`, `/projects`, `/projects/:id`, `/planning`, `/finance`, `/purchases`, `/team`, `/clients`, `/reports`, `/alerts`, `/settings`, `/ai` |
| Finesse Field (Diego, fictício) | `#/field`, `/tasks`, `/daily-log`, `/materials` |

Para trocar de perfil, use o avatar no topo (mobile) ou o rodapé da sidebar (desktop). Trocar de perfil não apaga os dados.

## Fluxos demonstráveis

- **A** — Cliente: painel → cronograma → etapa → fotos → Finesse AI.
- **B** — Wellington cria a solicitação → encaminha ao cliente → cliente aprova → alerta no Command → pedido → recebimento → conciliação (gera o lançamento no financeiro).
- **C** — Field registra o diário (6 passos, com fotos) → Command revisa e publica → o registro aparece na timeline do cliente.
- **D** — Financeiro: registrar despesa fora do orçamento → a margem projetada recalcula, com prévia ao vivo.
- **E** — Planejamento: alterar datas da atividade → dependentes reprogramados → nova data de entrega e alertas.
- **F** — Nova obra com etapas distribuídas automaticamente → aparece na carteira.

## Arquitetura

```
index.html          shell + fontes + Lucide (CDN)
styles.css          design system: tokens de cor e motion, componentes, layouts
data.js             seed relacional (IDs) + store localStorage + seletores e regras derivadas
app.js              utilitários, roteador hash, shell, componentes (Gantt, gráficos, antes/depois,
                    sheets, toasts), motion runtime, adapter determinístico da Finesse AI
views-public.js     onboarding (8 etapas) + portfólio
views-client.js     Finesse Client + drawer de atividade (edição para Wellington)
views-command.js    Finesse Command
views-field.js      Finesse Field
server.js           servidor estático de desenvolvimento (Node, zero deps)
```

- **Estado:** `localStorage["finesse-os-v1"]`. Para restaurar o estado inicial, use Configurações → *Restaurar dados originais*.
- **Indicadores derivados** (`data.js`): o progresso é ponderado pela duração das etapas; o planejado usa a linha de base; os atrasos, as margens (orçamento + despesas fora do orçamento) e os alertas são recalculados a cada mudança.
- **Permissões simuladas:** o cliente vê só a própria obra, o diário publicado e as compras encaminhadas a ele, sem nenhum dado financeiro interno; a IA também recusa esses dados. O campo vê só as obras atribuídas. **Nada disso é segurança real.**
- **Motion:** View Transitions entre rotas, entradas em cascata (stagger), contadores animados, anéis e barras com easing, Gantt que "cresce", gráficos com traçado animado, Ken Burns nas fotos, títulos com texto dividido, reveal por scroll, sheets com mola e streaming das respostas da IA. Tudo respeita `prefers-reduced-motion`.

## Integrações para produção

1. Supabase/PostgreSQL substituindo `data.js`: mesmas entidades (projects, tasks, purchases, finance, logs, photos, docs, people, clients).
2. Autenticação real e RLS por papel (owner, client, field).
3. Storage de fotos e documentos com URLs assinadas.
4. Serviço de IA no lugar do `AI.answer()` (mesma assinatura), usando *tools* de consulta aos dados.
5. Notificações por e-mail/WhatsApp e assinatura eletrônica para aprovações com validade contratual.
6. Migração opcional para Next.js + TypeScript, reaproveitando os tokens e componentes.
