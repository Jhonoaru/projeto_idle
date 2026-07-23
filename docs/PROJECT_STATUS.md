# Guild Hunt Idle - Project Status

Atualizado em: 2026-07-22

## Stack usada

- Tauri v2 para empacotamento desktop.
- React com TypeScript para a interface.
- Vite para desenvolvimento e build do frontend.
- Estado de jogo coordenado no React com persistencia local.
- Dados iniciais em arquivos TypeScript dentro de `src/data`.
- SQLite local ativo via Tauri SQL Plugin (`sqlite:guild_hunt_idle.db`).
- Save/load local funcionando para guilda, personagens, inventarios, equipamentos, containers, depot, logs e acoes atuais.
- Sem Prisma ativo. A pasta `prisma/` existe apenas como reserva com `.gitkeep`.

## Status recente

- Etapa 13 implementada: hunts usam supplies reais do inventario do personagem.
- Etapa 13.5 concluida: QA de supplies reais, save/load, containers, `guild.gold`, Market NPC e Action Analyzer.
- Etapa 14 concluida: morte com deathState, templo, bless, penalidade leve e recovery manual.
- Etapa 15 concluida: Bestiary guild-wide, charm points, charms desbloqueaveis e bonus pequenos em hunts.
- Etapa 15.5 concluida: QA/correcoes de Bestiary/Charms, normalizacao de save e bloqueio contra duplicacao de finish hunt.
- Etapa 16 concluida: Forge inicial com upgrades, tiers, imbuements, materiais e persistencia em equipamentos.
- Etapa 17 concluida: presets de hunt, preparacao de supplies via depots/Market NPC e persistencia SQLite dos presets.
- Etapa 17.5 concluida: rework dos Imbuements com familias Basic/Intricate/Powerful, custos/materiais visiveis e UI da Forge estilo MMORPG.
- Etapa 17.6 concluida: QA da Forge/Imbuements, correcoes de status, saves antigos e imbuements expirados/invalidos.
- Etapa 18 concluida: Offline Catch-up real com acoes prontas para coletar, traveling automatico e recovery offline reportado.
- Etapa 18.5 concluida: QA do Offline Catch-up, blindagem contra duplicacao de coleta e save/load parcial.
- Etapa 19 concluida: auto-repeat opcional de hunts com limites, regras de parada e integracao conservadora com offline catch-up.
- Etapa 19.5 concluida: QA do Auto-repeat, normalizacao de configs antigas e ajustes de UI/duplicacao.
- Etapa 20 concluida: reconstrucao do layout principal para estilo client MMORPG idle, com topbar de jogo, botao Explorar, GameWindow, painel direito de personagem/inventario e menu lateral de sistemas.
- Etapa 20.5 concluida: QA visual/navegacao do novo client MMORPG, com ajustes de responsividade, janelas full, Settings e scroll lateral.
- Etapa 21.5 concluida: QA/correcao da Weapon Proficiency real, com progresso por tipo de arma, perks passivos, persistencia e integracao com hunts/supplies.
- Etapa 22 concluida: Monster Focus / Prey real, com slots por personagem, criaturas do Bestiary, bonus temporarios, cargas por hunt valida e persistencia.
- Etapa 22.5 concluida: QA/correcao do Monster Focus / Prey, com normalizacao defensiva, UI sincronizada, resultado de hunt explicito e save SQLite normalizado.
- Etapa 23 concluida: Path of Destiny / Wheel real por personagem, com pontos por level, nodes desbloqueaveis, bonus passivos, integracao com atributos/hunts e persistencia SQLite.
- Etapa 23.5 concluida: QA/correcao do Path of Destiny / Wheel, com normalizacao mais robusta, bloqueio contra spam de unlock/reset e validacao de build.
- Etapa 24 concluida: Collections real com Outfits, Mounts e Avatars, unlocks guild-wide, selecao por personagem e persistencia SQLite.
- Etapa 24.5 concluida: QA/correcao de Collections, com validacao de dados, defaults, save/load, painel direito, badge, Store placeholder e build.
- Etapa 25 concluida: Daily Reward real offline/local, com streak, ciclo de 7 dias, Guild Depot, Collections e persistencia SQLite.
- Etapa 25.5 concluida: QA/correcao do Daily Reward em Tauri/SQLite, com save/load real, claim unico e Guild Depot validado.
- Etapa 26 concluida: rework visual de Inventario, Loot e Venda Rapida, com slots visuais, tooltips, protecao de venda e Quick Sell seguro.
- Etapa 26.5 concluida: QA/correcao de Inventario, Loot e Venda Rapida, com validacao de ItemIcon, ItemTooltip, Inventory Grid, Quick Sell e protecoes de venda.
- Etapa 27 concluida: Hunt / Combat Scene visual, com personagem central, criaturas ao redor, HP fake, action bar, combat log, loot preview e analyzer integrado ao currentAction.
- Etapa 27.5 concluida: QA/correcao da Hunt / Combat Scene, com validacao de currentAction, ready state, troca de personagem, intervalos e nao duplicacao visual de recompensa.
- Etapa 28 concluida: Market visual avancado, com Buy, Sell, Quick Sell integrado, filtros/busca, resumo de transacao, protecoes de venda, compra via `guild.gold` e destino Inventory/Character Depot/Guild Depot.
- Etapa 28.5 concluida: QA/correcao do Market visual avancado, com validacao de build, smoke de Buy no Vite, reforco contra duplo clique, normalizacao de gold/depot/origens e filtros tolerantes a item invalido.
- Etapa 29 concluida: reformulacao do gameplay inicial, com Arkon starter level 1, hunts curtas, level gate real, objetivo guiado e correcao do lucro duplicado de loot.
- Etapa 29.5 concluida: QA de gameplay e balanceamento inicial, com smoke Vite do loop hunt > loot > Quick Sell > compra de supply, Rat Tail garantido e Action Analyzer alinhado ao gold liquido.
- Etapa 30 concluida: rework visual avancado da Hunt / Combat Scene, com terreno estilo MMORPG, criaturas ao redor com ciclo de spawn, hotbar inferior de HP/MP/magias/suporte/loot e janelas de configuracao inspiradas nas referencias enviadas.
- Etapa 30.5 concluida: QA visual da Hunt Scene, com smoke Vite, correcao de overflow do terreno, correcao do botao fechar dos modais e validacao responsiva em 900px/720px.
- Etapa 31 concluida: Region Atlas / progressao de regioes, areas e unlocks, com status derivado de level, quests, access keys, hunts e bosses sem criar save/schema novo.
- Etapa 32 concluida: rework visual do Explorar / Modos de Jogo, com boards de Hunts, Bosses e Quests, busca, cards visuais e paineis reais preservados.
- Ajuste pos-Etapa 32: duracao customizavel de hunt em minutos/horas e botao de retorno para cidade dentro da Hunt Scene.
- Ajuste pos-Etapa 32.1: Explorar/Hunts agora abre primeiro apenas a lista de hunts; assignment aparece somente apos selecionar uma hunt e foi simplificada para escolher duracao e iniciar.
- Ajuste pos-Etapa 32.2: Details virou tela inicial, Explorar sempre abre limpo, iniciar hunt envia direto para a Hunt Scene e o modo combate esconde roster/painel direito com analyzer lateral.
- Etapa 32.5 concluida: QA interativo do novo Explorar/Hunt Scene, com fluxo de selecao, duracao, entrada e saida do combate, modal central e controles contextuais validados.
- Etapa 33 concluida: rework visual de Details como Character Hall, com selecao de personagem integrada, perfil, atributos, equipamentos, skills e progresso da guilda em uma tela ampla.
- Etapa 33.5 concluida: QA do Character Hall no Tauri/SQLite, com selecao, Inventory e Save/Reload validados e correcao do retorno indevido para Home.
- Etapa 34 concluida: rework visual de Skills como Skill Hall, com progresso real, caminhos da vocacao, plano de desenvolvimento, treinamento atual e resumo de Weapon Proficiency.
- Etapa 34.5 concluida: QA do Skill Hall no Tauri/SQLite, com navegacao, troca de personagem, save/reload e normalizacao de treinos legados sem `targetSkill`.
- Etapa 35 concluida: rework visual de Training Grounds e Weapon Proficiency, com halls amplos, filtros, programas de treino, custos, equipamento ativo e trilhas de perks.
- Etapa 35.5 concluida: QA real de Training Grounds/Weapon Proficiency e correcao da corrida entre Save e Reload no SQLite.
- Etapa 36 concluida: Blessings Hall com sete bencaos cumulativas, protecao de morte, Temple Record e compatibilidade com saves antigos.
- Etapa 36.5 concluida: QA real de compra, protecao, consumo, revive e persistencia das Blessings no Tauri/SQLite.
- Etapa 37 concluida: Hunting Research Hall conectando Bestiary, dossiers, Charms e Monster Focus em telas amplas.
- Etapa 37.5 concluida: QA real de Bestiary, Charms e Monster Focus no Tauri/SQLite, com persistencia validada e protecao contra duplicacao por clique duplo.
- Etapa 38 concluida: rework de Path of Destiny / Wheel como hall amplo, com constelacao de nodes, dossier, categorias e ledger de bonus reais.
- Etapa 38.5 concluida: QA real de Path of Destiny no Tauri/SQLite, com unlock, prerequisitos, bonus, reset, Save/Reload e clique duplo validados.
- Etapa 39 concluida: Collections Hall amplo com catalogo, busca, filtros, showcase e loadout ativo para Outfits, Mounts e Avatars.
- Etapa 39.5 concluida: QA real de Collections Hall no Tauri/SQLite, com badge, equip dos tres slots, Save/Reload e clique duplo validados.
- Etapa 40 concluida: Daily Reward reformulado como Guild Daily Ledger amplo, com calendario de sete dias, dispatch em destaque e historico compacto.
- Etapa 40.5 concluida: QA real do Daily Reward Hall no Tauri/SQLite, com badge, claim de supply, streak, ciclo, clique duplo e Save/Reload validados.
- Etapa 41 concluida: Ranking reformulado como Hall of Renown local, com podio, quatro metricas reais, tabela completa e dossier do personagem.
- Etapa 41.5 concluida: QA real do Ranking Hall no Tauri/SQLite, com quatro metricas, selecao, Save/Reload e ausencia de mutacao validados.
- Etapa 42 concluida: Store reformulado como Cosmetic Showcase local, com 12 previews, filtros, integracao com Collections e nenhuma monetizacao.
- Etapa 42.5 concluida: QA real do Cosmetic Showcase no Tauri/SQLite, com catalogo, filtros, preview, Collections, Save/Reload e ausencia de monetizacao validados.
- Etapa 43 concluida: Updates reformulado como Release Archive local, com busca, filtros, dossiers e historico recente do cliente.
- Etapa 43.5 concluida: QA real do Updates Hall no Tauri/SQLite, com filtros, busca, dossier, Save/Reload e ausencia de mutacao de gameplay validados.
- Etapa 44 concluida: Wiki reformulada como Guild Field Codex local, com 34 registros derivados dos dados reais, busca, categorias e dossiers.
- Etapa 44.5 concluida: QA real do Guild Codex no Tauri/SQLite, com catalogo, filtros, busca, dossier, Save/Reload e ausencia de mutacao de gameplay validados.
- Etapa 45 concluida: Settings reformulado como console local, com densidade, escala de texto, reducao de movimento, paineis opcionais, tela inicial e restauracao da ultima tela.
- Etapa 45.5 concluida: QA real do Settings no Tauri/SQLite, com preferencias, reinicio, tela inicial, Save/Reload e restauracao do banco original validados.
- Etapa 46 concluida: primeira sessao ganhou Guild Briefing derivado do save, tres marcos iniciais e comandos diretos para a proxima acao.
- Etapa 46.5 concluida: QA real do Guild Briefing no Tauri/SQLite, incluindo fixtures de hunt, venda e First Contract com restauracao integral do banco.
- Etapa 47 concluida: quests agora formam uma jornada guiada de dez contratos em tres capitulos, com prerequisitos nomeados, proximo objetivo e progresso da guilda.
- Etapa 47.5 concluida: QA real da jornada no Tauri/SQLite, com dois contratos persistidos, compatibilidade de quest antiga, unlock de Collections corrigido e banco original restaurado.
- Etapa 48 concluida: Hall of Renown ganhou Career Ledger com 18 achievements automaticos, seis categorias, cinco ranks e progresso derivado do save.
- Etapa 48.5 concluida: QA real do Career Ledger no Tauri/SQLite, com filtros, dossiers, Save/Reload, integridade semantica e restauracao integral do banco validados.
- Etapa 49 concluida: Guild Identity adicionou 12 titulos locais derivados da carreira, banner preview, equip seguro, topbar e persistencia SQLite.
- Etapa 49.5 concluida: QA real de Guild Titles no Tauri/SQLite, com migration de save antigo, normalizacao, clique duplo, Save/Reload e ausencia de bonus validados.
- Etapa 50 concluida: Guild Headquarters adicionou quatro facilities locais, upgrades com guild.gold, requisitos de carreira e bonus pequenos integrados.
- Etapa 50.5 concluida: QA real de Guild Headquarters no Tauri/SQLite, com migration de save antigo, normalizacao, clique duplo, bonus, Save/Reload e restauracao integral validados.
- Etapa 51 concluida: Guild Contracts Board adicionou seis expedicoes locais, equipes de apoio, resultados persistidos e recompensas no Guild Depot.
- Etapa 51.5 concluida: QA real do Contracts Board corrigiu active runs corrompidos e validou migration, anti-reroll, duplicacao, historico e restauracao integral.
- Etapa 52 concluida: Guild Staff adicionou quatro especialistas permanentes, um posto ativo, bonus limitados em expedicoes e persistencia SQLite.
- Etapa 52.5 concluida: QA real do Guild Staff validou migration, contratacao, snapshot de dispatch, duplicacao, JSON corrompido e restauracao integral.
- Etapa 53 concluida: Guild Treasury adicionou reserva protegida, transferencias sem taxa, ledger local e persistencia SQLite.
- Etapa 53.5 concluida: QA real do Guild Treasury validou migration, transferencias, duplicacao, Save/Reload, ledger, JSON corrompido e restauracao integral.
- Etapa 54 concluida: Guild Projects adicionou tres obras locais em fases, custos reais, recompensas pequenas e persistencia SQLite.
- Etapa 54.5 concluida: QA real do Guild Projects validou migration, fases, clique duplo, conclusao, Collections, JSON corrompido e restauracao integral.
- Etapa 55 concluida: Guild Recruitment Board adicionou tres candidatos locais, contratos permanentes e novos personagens persistentes no roster.
- Etapa 55.5 concluida: QA real do Guild Recruitment validou contrato unico, character completo, Save/Reload, bloqueios, responsividade e restauracao integral.
- Etapa 56 concluida: direcao consolidada como campanha single-player totalmente offline, com economia NPC/local e Store direcionada a visuais conquistados por gameplay.
- Etapa 56.5 concluida: QA no Tauri/SQLite confirmou Store, Codex, Market NPC e Updates, alem de corrigir a perda de timestamps do Activity Log no autosave.
- Etapa 57 concluida: Bazar Rotativo Offline com seis ofertas deterministicas por janela de dez minutos, compras unicas via `guild.gold`, itens reais, raridade Relic e persistencia SQLite.
- Etapa 57.5 concluida: QA real do Bazar no Tauri/SQLite validou migration, compra unica, Guild Depot, Save/Reload, responsividade e restauracao integral do banco.
- Etapa 58 concluida: Wardrobe Exchange offline com quatro trocas cosmeticas reais, custos em gold/trofeus/quest, Collections, Guild Depot e protecao contra duplicacao.
- Etapa 58.5 concluida: QA real da Wardrobe Exchange validou cobranca unica, bloqueio por trofeu, Collections, Save/Reload e restauracao integral do SQLite.
- Etapa 59 concluida: progressao visual unificada de raridades e tiers, com identidade consistente em Inventory, Equipment, Loot, Market/Bazar e Forge, sem alterar o balanceamento ou o schema SQLite.
- Etapa 59.5 concluida: QA real de raridades e tiers validou normalizacao, +5/Tier 3, Save/Reload, Forge, Bazar, responsividade e restauracao integral do SQLite.
- Etapa 60 concluida: equipamentos ganharam seis familias, cinco faixas de level, 16 novos itens e fontes reais em hunts, bosses e Bazar offline.
- Etapa 60.5 concluida: QA real validou catalogo, loot, Bazar, gates, responsividade, Save/Reload no Tauri e restauracao integral do SQLite.
- Etapa 61 concluida: Iron Expedition, Cryptwarden e Emberforged adicionaram bonus derivados por conjunto, com suporte a todas as vocacoes e UI integrada.
- Etapa 61.5 concluida: QA real validou thresholds 3/3, 2/3 e 1/3, equip/unequip, gates, Tauri/SQLite, responsividade e restauracao integral do save.
- Etapa 62 concluida: Guild Workbench offline adicionou 19 receitas, quatro ranks, consumo do Guild Depot, entrega segura e historico persistente no SQLite.
- Etapa 62.5 concluida: QA real validou receitas, ranks, consumo transacional, clique duplo, filtros, responsividade e dois Save/Reload no Tauri/SQLite.
- Etapa 63 concluida: Salvage offline adicionou recuperacao deterministica de materiais, protecoes de equipamento, confirmacao dupla e ledger persistente no SQLite.
- Etapa 63.5 concluida: QA real corrigiu merge com stacks locked e validou dados corrompidos, clique duplo, responsividade e dois reloads Tauri/SQLite.
- Etapa 64 concluida: as 12 melhorias da Headquarters agora exigem gold, Career Points e materiais reais de hunts antigas consumidos no Guild Depot.
- Etapa 64.5 concluida: QA real liberou o Depot no menu, corrigiu o breakpoint intermediario e validou transferencia, upgrade unico e dois reloads Tauri/SQLite.
- Etapa 65 concluida: Resource Planner deriva metas dos upgrades, compara o Guild Depot e abre fontes reais de hunt com um aventureiro apto.
- Etapa 65.5 concluida: QA ampliada validou 33 cenarios, save legado, duas aberturas Tauri, rota de farm e responsividade sem encontrar regressao funcional.
- Etapa 66 concluida: Guild Logistics Board centraliza Headquarters, Projects e Wardrobe, unifica stacks elegiveis e abre sistemas ou hunts reais.
- Etapa 66.5 concluida: QA ampliada validou 39 cenarios, rotas do board, responsividade, duas cargas Tauri e restauracao exata do SQLite.
- Etapa 67 concluida: Campaign Pinboard adiciona tres prioridades persistentes, ordenacao manual e progresso material focado sem reservar recursos.
- Etapa 67.5 concluida: QA ampliada validou transicoes, conclusao, dados corrompidos, clique duplo, tres viewports reais e duas cargas Tauri.
- Etapa 68 concluida: prioridades prontas agora geram badge, banner revisavel e Activity Log uma vez por revisao do objetivo, com persistencia SQLite.
- Etapa 68.5 concluida: QA ampliada validou 56 cenarios, alertas independentes, review, layouts compactos, JSON quebrado e tres cargas Tauri/SQLite.
- Etapa 69 concluida: Campaign Operations Dashboard centraliza roster, expedicao, prioridades, recomendacoes e Activity Log sem criar estado ou automacao.
- Etapa 69.5 concluida: QA ampliada corrigiu status operacional inconsistente e validou 93 checks, rotas, responsividade e reloads Tauri/SQLite.
- Etapa 70 concluida: Guild Raid Board transforma bosses em expedicoes offline financiadas, com strike team elegivel, loot preview, cooldown pessoal e relatorio integrado.
- Etapa 70.5 concluida: QA ampliada corrigiu timers ISO, retorno cancelado, snapshot anti-reroll e foco do participante, com 184 checks e fixture Tauri/SQLite.
- Etapa 71 concluida: Guild Renown agora determina seis niveis e ranks, expande o roster de 6 para 11 e desbloqueia seis contratos locais permanentes.
- Etapa 71.5 concluida: QA ampliada corrigiu o loadout de Elis Dawn e validou 306 checks, seis ranks, contratos, responsividade e fixtures Tauri/SQLite.
- Etapa 72 concluida: os seis Guild Levels agora liberam caches unicos com gold, supplies, materiais e um cosmetic de Collections, todos persistidos offline.
- Etapa 72.5 concluida: QA ampliada corrigiu o merge com stacks protegidos e validou 13.098 checks, 720 ordens de claim, responsividade e fixtures Tauri/SQLite.
- Etapa 73 concluida: seis Renown Objectives locais conectam quests, Bestiary, expeditions, Headquarters, Projects e recrutamento ao avanco dos Guild Levels.
- Etapa 73.5 concluida: QA ampliada corrigiu progresso falso em quests e crash potencial do Bestiary, com 11.537 checks, responsividade e duas cargas Tauri/SQLite.
- Etapa 74 concluida: seis Guild Directives desbloqueadas por Level permitem especializar futuras hunts, training, quests, compras NPC e expeditions sem moeda nova ou online.
- Etapa 74.5 concluida: QA ampliada saneou directives bloqueadas e snapshots de Training corrompidos, com 53.131 checks, responsividade e duas cargas Tauri/SQLite.
- Etapa 75 concluida: Guild Squads adicionou tres presets persistentes de formacao, com roles, unlock por Guild Level e reutilizacao segura em Bosses e Contracts.
- Etapa 75.5 concluida: QA ampliada dos Guild Squads corrigiu selecao de slot bloqueado, isolou a montagem de Contracts e validou 142.940 checks, responsividade e SQLite nativo.
- Etapa 76 concluida: Squad Command Center deriva prontidao, poder, roles e rotas reais de Bosses/Contracts a partir das formacoes persistentes, sem novo estado ou automacao.
- Etapa 76.5 concluida: QA ampliada alinhou o significado de prontidao, atualizacao de cooldowns e paridade com todas as rotas em 281.247 checks, cinco viewports e SQLite nativo.
- Etapa 77 concluida: Guild Deployment Planner compara todos os squads contra o Boss ou Contract escolhido e prepara o alvo exato sem iniciar atividades ou criar estado persistente.
- Etapa 77.5 concluida: QA ampliada alinhou membros exibidos com a party/equipe realmente preparada e validou 785.082 checks, cinco viewports e tres cargas Tauri/SQLite.
- Etapa 78 concluida: Deployment Orders guarda ate tres combinacoes de Boss/Contract + Guild Squad, recalcula readiness ao vivo e prepara a operacao sem launch ou dispatch automatico.
- Etapa 78.5 concluida: QA corrigiu ordem canonica do JSON, timestamp invalido, Prepare de squad vazio e truncamento tablet; 124.684 checks e duas cargas SQLite passaram.

Comandos principais:

- `npm run tauri:dev` roda o app desktop em desenvolvimento.
- `npm run dev` roda apenas o frontend Vite.
- `npm run build` valida TypeScript e gera o build web.
- Em PowerShell com execucao de scripts bloqueada, usar `npm.cmd run build` ou `npm.cmd run tauri:dev`.

## Sistemas ja implementados

- Layout principal estilo client MMORPG idle, escuro, compacto e denso.
- Topbar de jogo com guilda, personagem selecionado, atalhos Explorar/Market/Forge/Imbuing/Daily/Ranking/Store, moedas e utilitarios.
- Botao principal EXPLORAR na area central.
- Janela Explorar / Modos de Jogo com Hunts, Bosses, Training e Quests reaproveitando os sistemas reais.
- GameWindow reutilizavel para sistemas grandes, com cabecalho, botao fechar e scroll interno.
- Painel direito fixo com resumo do personagem, XP, equipamentos, inventario compacto, capacity e activity log.
- Menu lateral de personagem para Details, Skills, Blessings, Weapon Proficiency, Monster Focus, Destiny, Collections, Inventory e Bestiary.
- Roster lateral de personagens.
- Personagens com vocacao, level, experiencia, skills, atributos, status, cidade, stamina, ouro, inventario, equipamentos, quests completas, acessos e acao atual.
- Vocações proprias: Guardian, Ranger, Arcanist, Warden e Monk.
- Cidades/regioes proprias em dados de jogo, como Thaeron, Eldoria, Greenport, Eldenroot e Khazgrim.
- Hunts simuladas com risco, duracao, XP, gold, supply cost, lucro/prejuizo, morte possivel e logs.
- Loot real com tabela por monstro, raridade, peso, valor e empilhamento.
- Inventario por personagem.
- Capacity por personagem, incluindo rejeicao de loot quando falta capacidade.
- Guild Depot com transferencia entre personagem e depot.
- Equipamentos equipaveis por slot.
- Recalculo de atributos com base em equipamentos.
- Treinamento de skills com tipos offline, exercise e dummy.
- Progressao de level por experiencia.
- Progressao de skills por porcentagem e level up.
- Quests com tipos, riscos, steps, recompensas e requisitos.
- Acessos desbloqueaveis por quest.
- Hunts bloqueadas por acesso requerido.
- Controle de acao atual: hunting, training, questing, traveling, dead e idle.
- Cancelamento de acao atual.
- Estado temporario de traveling ao cancelar hunt, treino ou quest.
- Indicadores e bloqueios de quest: completed, locked, available e in progress.
- Bosses iniciais solo e party.
- Party builder com roles tank, healer, damage e support.
- Validacao de boss por status, level, acesso, quest, cooldown, tamanho de party e roles.
- Simulacao de boss com chance de sucesso, morte, XP, gold, loot, renown e logs.
- Cooldowns de boss por personagem.
- Loot de boss enviado para o Guild Depot.
- Sistema inicial de morte com penalidade de XP/gold, `deathState`, contador de mortes e recovery no templo.
- Templos por cidade com fallback para Thaeron.
- Bless individual por personagem, comprada com `guild.gold` e consumida ao proteger morte.
- Bestiary guild-wide com kills por criatura, stages, charm points, unlocks e charms ativos.
- Charms iniciais aplicaveis em criaturas completadas, com bonus pequenos de XP, gold, loot, defesa ou supplies em hunts futuras.
- Forge Workshop com upgrade +0 a +5, tier 0 a 3 e imbuements por hunts em equipamentos, incluindo familias Basic/Intricate/Powerful.
- Weapon Proficiency real para sword, axe, club, bow, wand, staff, fist e shield.
- Weapon Proficiency ganha XP ao finalizar hunts; arma principal ganha XP integral e shield equipado ganha XP reduzido.
- Perks passivos de Weapon Proficiency desbloqueiam por level e aplicam bonus leves de ataque, defesa, magia, distance, fist, crit, XP ou supplies conforme o tipo equipado.
- Bônus de supplies por proficiency sao condicionais: Bow reduz ammo, Wand reduz mana potion, Staff reduz runes e Shield aplica reducao leve defensiva.
- Monster Focus real por personagem com 3 slots: slot 1 disponivel, slots 2 e 3 bloqueados para futuro.
- Monster Focus usa criaturas conhecidas no Bestiary guild-wide como alvos validos.
- Monster Focus suporta bonus de experience, loot, gold, supplies e risk.
- Monster Focus aplica bonus proporcional ao match ratio da criatura focada na hunt e consome 1 carga apenas em hunts compativeis.
- Path of Destiny real por personagem com Destiny Points derivados do level, nodes genericos/vocacionais, prerequisitos, custos e bonus passivos pequenos.
- Path of Destiny integra bonus de health, ataque, defesa, magia, distancia, fist, crit, XP, gold, loot, supplies, capacity e risco onde os calculos ja sao seguros.
- Collections real de cosmeticos com Outfits, Mounts e Avatars; unlocks sao guild-wide e cosméticos ativos sao por personagem.
- Persistencia local com SQLite via Tauri SQL Plugin.
- Save inicial, auto-save, salvar manualmente, recarregar save e resetar save.
- Market NPC local para venda de itens.
- Venda de itens do inventario do personagem, depot pessoal do personagem e Guild Depot.
- Venda Rapida visual com selecao manual, filtros por origem/tipo, total de gold previsto e bloqueio para itens perigosos.
- Protecao de venda centralizada contra itens locked, quest, containers com conteudo, itens dentro de container, imbuements ativos e itens sem valor.
- Inventario, Depot do Personagem e Guild Depot agora exibem grade visual de slots com icones textuais, quantidade, badges e tooltip de item.
- Resultado de hunt mostra loot/supplies/rejeicoes em cards visuais e oferece atalhos para Inventory e Market/Quick Sell.
- Hunt Scene visual aparece na Home quando o personagem selecionado esta em `currentAction.type === "hunting"`.
- Hunt Scene usa simulacao local/fake para criaturas, HP, action bar, loot preview e combat log, sem aplicar recompensa, consumir supplies ou alterar save.
- Hunt Scene agora tem palco top-down mais proximo de client MMORPG, com personagem central, multiplas criaturas do mesmo tipo quando a hunt e simples, timer de spawn visual e terreno CSS autoral sem assets externos.
- Hotbar inferior da Hunt Scene mostra HP, MP, slot de cura, mana potion, magias, suporte e loot; clicar nos slots abre janelas locais de selecao/configuracao visual.
- Region Atlas mostra progresso por cidade/regiao, access keys, hunts, quests e bosses com status `Unlocked`, `In progress`, `Available` ou `Locked`.
- Region Atlas calcula bloqueios por level, access key e quest usando os dados reais existentes de hunts, quests, bosses e personagem.
- Botao Collect Hunt Result da Hunt Scene usa o mesmo fluxo real de finalizacao/coleta de hunt ja existente.
- Gold separado entre personagem e guilda.
- Gold universal da guilda usado por compras, vendas e custos relevantes.
- Itens travaveis contra venda acidental.
- Aba Inventario & Equipamento unificada.
- Aba Depot dividida entre Depot do Personagem e Guild Depot.
- Containers com itens internos preservados por `parentContainerId`.
- Supplies reais nas hunts: validacao antes de iniciar, consumo ao finalizar e balance liquido apos supplies.
- Hunt Prep com presets guild-wide, checklist de supplies, movimentacao do Depot do Personagem/Guild Depot e compra de faltantes pelo Market NPC usando `guild.gold`.
- Offline Catch-up real no carregamento do save, marcando hunts/treinos/quests/bosses concluidos como prontos para coletar sem aplicar recompensa automaticamente.
- Auto-repeat opcional de hunts, iniciado manualmente pelo jogador e limitado por repeats, supplies, capacity, stamina e morte.
- Aba Acao com Current Action e Action Analyzer.
- Traveling automatico para retorno/cancelamento e chegada automatica ao expirar.
- Log de atividade compacto no painel direito.

## Sistemas reais vs placeholders da Etapa 20

Funcionais/reaproveitados na nova navegacao:

- Explorar > Hunts usa HuntActionPanel, Hunt Prep, supplies reais, presets e auto-repeat.
- Explorar > Bosses usa BossPanel e party builder existentes.
- Explorar > Training usa TrainingPanel existente.
- Explorar > Quests usa QuestPanel existente.
- Market, Forge, Imbuing, Inventory/Equipment, Depot, Bestiary, Action, Details, Skills e Blessings continuam usando os sistemas reais atuais.

Placeholders visuais/local-only:

- Daily Reward real guild-wide com claim diario local, streak simples, ciclo de 7 dias e recompensas pequenas.
- Store continua placeholder; nao concede itens, nao cria premium e nao possui pagamento real.
- Updates, Wiki e Settings sao janelas locais simples.
- Settings centraliza Save now, Reload save e Reset save alem dos atalhos compactos da topbar.

Limitacoes atuais:

- Forge e Imbuing ainda compartilham o mesmo ForgePanel por baixo; a separacao e visual/navegacional nesta etapa.
- Store nao altera save nem aplica bonus nesta etapa.
- A navegacao antiga por abas ficou escondida visualmente, mas os paineis reais permanecem reaproveitados para evitar regressao.
- Em janelas full, o roster lateral e ocultado para priorizar espaco jogavel em 1366x768, mantendo painel direito e menu lateral.
- O rework de inventario usa icones textuais/CSS autorais; ainda nao ha sprites externos ou pixel art dedicada.
- Quick Sell seleciona por padrao apenas loot/material comum sem avisos; itens raros, equipaveis, melhorados ou sensiveis exigem selecao manual ou continuam bloqueados.
- Na QA 26.5, o smoke visual foi feito via `npm run dev` com mock local; SQLite/Tauri real nao foi reexecutado nesta etapa.
- Hunt Scene ainda usa placeholders textuais/CSS para personagem, criaturas e ambiente; nao ha sprites, mapa navegavel, pathfinding ou combate real-time real.
- Loot preview da Hunt Scene e apenas visual/estimado e nao adiciona itens durante a hunt.
- Hotbar e janelas de skills/potions da Hunt Scene ainda sao configuracao visual/local; nao alteram rotacao real, cooldowns, consumo automatico de potions ou save.
- Region Atlas e uma camada derivada/local; nao altera save, nao concede acesso automaticamente e nao substitui os bloqueios reais de Hunt/Quest/Boss.
- Auto-repeat/offline catch-up continuam decididos pelo fluxo real de `currentAction`; a cena apenas mostra estado e badges/resumo.
- Na QA 27.5, `npm run tauri:dev` e SQLite real nao foram reexecutados; o smoke interativo foi feito via `npm run dev` com mock local.
- Market continua offline/local e sem player market, auction house, trade, premium ou moeda paga.
- Buyback e Services no Market sao placeholders visuais.
- A compra do Market usa catalogo local de `src/data/shopItems.ts`, valida quantidade/preco/gold/requisitos e entrega em Inventory, Character Depot ou Guild Depot conforme selecao.
- A venda manual e Quick Sell reutilizam `canSellItem`; itens locked, quest, dentro de container, container com conteudo, imbuement ativo e sem valor ficam bloqueados, enquanto equipment/supplies/rare/upgraded/tier mostram aviso.
- A comparacao de equipamento no Buy e simples e cobre apenas atributos diretos presentes no item.
- Na Etapa 28, `npm run tauri:dev` e SQLite real nao foram testados manualmente; a persistencia foi preservada por nao mudar schema e por reaproveitar handlers existentes de compra/venda.
- Na Etapa 28.5, o smoke interativo foi feito no Vite com mock local; SQLite/Tauri real nao foi clicado manualmente.
- A ferramenta de browser validou abertura do Market, Buy e renderizacao da Sell tab, mas nao conseguiu disparar uma venda manual por clique mesmo com botao visivel; Sell/Quick Sell foram complementados por leitura de engine/build.

Proximos passos sugeridos:

- Etapa 31.5 - QA do Region Atlas / Progressao de Unlocks.
- Separar Forge e Imbuing em subviews dedicadas sem duplicar regra de materiais.
- Evoluir Wiki/Settings com configuracoes locais reais.
- Criar uma camada visual de cards mais rica para cada modo do Explorar.
- Expandir unlocks de Collections por Bestiary, quests, bosses e eventos locais.

## Etapa 29 - Reformulacao e correcao de gameplay

Implementado:

- Audit documentado em `docs/GAMEPLAY_AUDIT.md`.
- Arkon inicial convertido para starter level 1, idle, sem quest/acesso ja completo, com skills baixas e kit basico.
- Duracao padrao de hunt reduzida para 1 minuto.
- Opcoes de hunt ajustadas para 1, 5, 15, 30 e 60 minutos.
- `Sewers Below Thaeron` ajustada como primeira hunt segura, curta, sem supplies obrigatorias e apenas com Sewer Rat.
- `Cave Spider Cellar` adicionada como segunda hunt starter, minLevel 3, risk low e supplies opcionais.
- Sewer Rat e Cave Spider tiveram XP inicial ajustada para suportar ciclos curtos.
- `startHunt`, Hunt Card e Hunt Action Panel agora bloqueiam hunt por `minLevel`.
- Resultado de hunt deixou de somar `totalLootValue` diretamente em `guild.gold`.
- Loot continua indo para inventario e precisa ser vendido no Market/Quick Sell para virar gold.
- Tela principal ganhou `Next Objective` com proximo passo simples: hunt starter, venda de loot, spider cellar, quest de acesso ou proxima hunt.

Limites atuais:

- QA manual interativo em Tauri/SQLite nao foi executado nesta etapa.
- Balanceamento numerico ainda precisa de teste em save novo durante a Etapa 29.5.
- Saves existentes nao sao reescritos para virar starter; a alteracao afeta estado inicial/mock/reset.
- Sem premium, pagamento, online, anti-cheat de data ou economia multiplayer.

Validacao:

- `npm.cmd run build` passou.

## Etapa 32 - Rework visual do Explorar / Modos de Jogo

Status: concluida.

Objetivo:

- Reestruturar a janela `Explorar` para se aproximar de uma tela MMORPG classica de modos de jogo, usando as imagens de referencia como direcao visual.
- Manter os sistemas reais existentes de hunts, bosses, training e quests.
- Separar visualmente os boards de selecao dos paineis de acao reais.
- Nao criar premium, pagamento, online ou monetizacao.

Arquivos alterados:

- `src/components/explore/ExploreWindow.tsx`.
- `src/styles.css`.

Implementado:

- Header `Modos de jogo` com abas grandes para Hunts, Bosses, Training e Quests.
- Board visual de Hunts com cards, busca, contador, indicadores de level/acesso/risco e selecao integrada ao `HuntActionPanel`.
- Board visual de Bosses com cards de contratos, estado locked/available/in progress e painel real `BossPanel` preservado abaixo.
- Area de Training reorganizada dentro do novo visual, mantendo o `TrainingPanel` e a engine local existentes.
- Board visual de Quests com cards, busca, status locked/available/current e painel real `QuestPanel` preservado abaixo.
- Footer estilo client MMORPG com contador, paginacao visual simples e busca.
- Estilo escuro, bordas metalicas/douradas, cards compactos e responsividade para telas menores.

Regras mantidas:

- Hunts continuam usando `HuntActionPanel`, supplies, presets, auto-repeat e resultado real.
- Bosses continuam usando party, cooldown, roles e resultado real.
- Training continua usando o fluxo local/offline existente.
- Quests continuam usando disponibilidade real, progresso e bloqueios existentes.
- Cards bloqueados exibem o motivo ou status sem iniciar acao indevida.
- Nenhum asset externo/protegido foi adicionado.

Validacao:

- `git diff --check` passou.
- `npm.cmd run build` passou.
- O servidor local respondeu em `http://127.0.0.1:1420`.
- QA visual interativo foi tentado no browser embutido, mas a sessao resetou por timeout durante automacao das abas. A validacao final desta etapa ficou por leitura, build e checagem parcial do servidor local.

Limitacoes atuais:

- A paginacao do board e apenas visual nesta etapa; busca e lista filtrada ja funcionam.
- Os icones das abas e cards usam texto/siglas estilizadas, sem sprites externos.
- O layout de Training ainda reaproveita o painel atual; pode receber um rework especifico em etapa futura.

Proximo passo sugerido:

- Etapa 32.5 - QA do novo Explorar / Modos de Jogo.

## Ajuste pos-Etapa 32 - Duracao de Hunt e retorno para cidade

Status: concluido.

Implementado:

- `HuntActionPanel` agora mostra um painel de duracao com presets rapidos e controle customizado por quantidade + unidade.
- Duracoes suportadas continuam em minutos internamente, mas a UI permite editar por minutos ou horas.
- Presets adicionados: 2h e 4h.
- Duracao customizada e normalizada entre 1 minuto e 8 horas.
- `HuntScene` agora possui botao `Voltar para Cidade` enquanto a hunt esta em andamento.
- O retorno usa o cancelamento real da acao, criando viagem de volta para a cidade e retornando a UI para o menu inicial/home.
- Quando a hunt ja esta pronta para coleta, o botao de retorno fica desabilitado para evitar perder recompensa pronta.

Validacao:

- `git diff --check` passou.
- `npm.cmd run build` passou.

Limitacoes:

- O retorno para cidade cancela a hunt atual; ele nao coleta recompensa parcial.
- QA manual clicando no app desktop ainda deve ser feito na Etapa 32.5.

## Ajuste pos-Etapa 32.1 - Fluxo simples de Hunts no Explorar

Status: concluido.

Implementado:

- `Explorar > Hunts` nao abre mais com uma hunt pre-selecionada.
- A tela inicial de Hunts mostra somente o board/lista de hunts para selecionar.
- Ao clicar em uma hunt, a lista sai da tela e aparece apenas o `Hunt Assignment` simples.
- `Hunt Assignment` foi reduzido para resumo da hunt, duracao e botao `Iniciar Hunt`.
- Removidos desse fluxo visual: Supplies, Preparation, Auto-repeat, charms ativos, resultado de hunt e botoes de finalizar simulacao.
- Adicionado botao `Escolher outra hunt` para voltar ao board.
- A validacao real de start continua na engine `startHunt`, entao regras de personagem ocupado, level, acesso e supplies ainda protegem a acao.

Validacao:

- `git diff --check` passou.
- `npm.cmd run build` passou.

Limitacoes:

- Supplies/preparation/auto-repeat continuam existindo no codigo de suporte e engines antigas, mas nao aparecem mais no fluxo principal de Hunts dentro do Explorar.
- QA manual visual no Tauri desktop ainda deve ser feito.

## Ajuste pos-Etapa 32.2 - Hunt Scene em modo combate

Status: concluido.

Implementado:

- O app agora inicia na aba `Details`, deixando o menu de personagem/atributos como tela inicial.
- Abrir `Explorar > Hunts` limpa qualquer hunt selecionada anteriormente, entao nao cai direto no `Hunt Assignment`.
- Ao iniciar uma hunt, a UI vai direto para `home`, onde a Hunt Scene aparece.
- Enquanto o personagem esta em hunt na `home`, o layout entra em `is-hunt-scene-mode`.
- Nesse modo, roster, menu lateral de personagem e painel direito ficam escondidos para ampliar a tela de combate.
- Hunt Scene foi reorganizada em duas areas: analyzer/controles/drops/log na esquerda e combate maior no centro.
- O bloco antigo que ficava embaixo do combate foi removido do fluxo visual.
- Adicionados botoes pequenos no centro da cena, exibidos ao clicar na area de combate: Loot Filter placeholder, Combat Log e Posicionamento placeholder.
- Botao `Finalizar Hunt` na lateral cancela/retorna pela regra real existente; quando a hunt esta pronta, aparece `Coletar Resultado`.

Validacao:

- `npm.cmd run build` passou.
- QA manual visual no app desktop ainda deve ser repetido.

## Etapa 32.5 - QA do novo Explorar e Hunt Scene

Status: concluida.

Validado no browser embutido com Vite:

- O app inicia em `Character Details`, com personagem, atributos e roster visiveis.
- `Explorar` abre na lista de Hunts sem selecionar automaticamente uma hunt e sem mostrar `Hunt Assignment`.
- A lista inicial exibiu 8 hunts e nao gerou overflow horizontal.
- Selecionar `Sewers Below Thaeron` substitui o board pelo assignment simplificado.
- O assignment mostra apenas resumo, duracao e inicio; Supplies, Preparation e Auto-repeat nao aparecem nesse fluxo.
- A duracao de 5 minutos foi selecionada e preservada ao iniciar.
- `Iniciar Hunt` abre diretamente a Hunt Scene.
- Durante o combate, roster, menu lateral de personagem e painel direito ficam escondidos.
- O analyzer permanece na esquerda e a area central de combate usa o espaco restante, sem o bloco inferior antigo.
- A janela de Cura abriu no centro exato da area de combate, fora do analyzer e sem ultrapassar a viewport.
- Os botoes centrais ficam invisiveis e sem interacao ate o clique na cena; depois do clique, aparecem e aceitam interacao.
- `Finalizar Hunt` fecha o modo de combate e coloca o personagem em viagem de retorno.
- Nenhum overflow horizontal foi encontrado durante entrada, modal ou saida do combate.

Medicoes do modal de Cura:

- Largura: 620 px no viewport testado.
- Diferenca entre o centro do modal e o centro da area de combate: 0 px.
- Limite esquerdo do modal: 486 px; limite direito do analyzer: 323 px.

Validacao tecnica:

- `git pull` informou repositorio atualizado.
- `npm.cmd run build` passou antes da QA.
- Vite respondeu HTTP 200 em `http://127.0.0.1:1420`.
- O unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin ao executar no browser Vite.

Limitacoes da QA:

- SQLite/save real nao foi validado nesta rodada porque o teste interativo ocorreu fora do runtime Tauri.
- Nao foi aguardado o encerramento natural dos 5 minutos; a saida foi testada com `Finalizar Hunt`.
- Loot Filter e Posicionamento continuam placeholders desabilitados, conforme escopo atual.

Proximo passo sugerido:

- Etapa 33 - Rework visual da tela inicial `Details` e selecao de personagem.

## Etapa 33 - Rework visual de Details e selecao de personagem

Status: concluida.

Objetivo:

- Transformar `Details` em uma tela inicial de gerenciamento da guilda e dos personagens.
- Permitir selecionar qualquer aventureiro diretamente na tela, sem depender do roster lateral.
- Reunir informacoes importantes em uma composicao ampla, compacta e inspirada em client MMORPG.

Arquivos alterados:

- `src/app/App.tsx`.
- `src/components/character/CharacterDetails.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/styles.css`.

Implementado:

- Novo `Character Hall` full-width na aba Details.
- Roster horizontal da guilda com personagem selecionado, status, level, vocacao e skill principal.
- Selecao real de personagem conectada ao estado principal do app.
- Perfil do aventureiro com cidade, status, outfit, mount, HP, mana, stamina e progresso de XP.
- Atalhos para escolher atividade, abrir Inventory, Skills e Destiny.
- Resumo de combate com attack, defense, armor, capacity, critico, skill principal, mastery e blessing.
- Grade compacta dos nove slots de equipamento usando o `ItemIcon` existente.
- Painel de skills com levels e progresso individual.
- Guild Record com Destiny, quests, acessos, mortes, gold gerado e bonus de equipamento.
- No modo Character Hall, roster lateral, menu lateral e painel direito ficam ocultos para entregar toda a largura a tela inicial.
- Layout responsivo com quatro colunas no desktop, duas em largura intermediaria e uma em viewport compacta.

Validacao:

- `npm.cmd run build` passou.
- `git diff --check` passou antes da documentacao final.
- QA interativo no browser confirmou troca de Arkon para Ayla e atualizacao do perfil selecionado.
- O atalho Inventory abriu `Inventory & Equipment` pelo fluxo real da navegacao.
- Em 1280 px, o Character Hall ocupou 1219 px sem reservar espaco para os paineis ocultos.
- Em viewport de 760 px, os paineis foram empilhados em uma coluna e nao houve overflow horizontal.
- A captura visual compacta confirmou roster legivel, botoes contidos e ausencia de sobreposicao.

Limitacoes:

- Retratos e cosmeticos continuam usando siglas/previews textuais existentes; nao foram adicionados sprites ou assets externos.
- O QA interativo foi feito no Vite com mock local. O erro de SQLite no console e esperado fora do runtime Tauri.
- Nenhum schema, migration ou formato de save foi alterado.

Proximo passo sugerido:

- Etapa 33.5 - QA da tela inicial Details e selecao de personagem no Tauri/SQLite.

## Etapa 33.5 - QA de Details e selecao de personagem no Tauri/SQLite

Status: concluida como QA e estabilizacao.

Validado no runtime Tauri real:

- `npm.cmd run tauri:dev` abriu a janela desktop `Guild Hunt Idle`.
- O Tauri carregou o banco real em `AppData/Roaming/com.jhonoaru.guildhuntidle/guild_hunt_idle.db` sem usar o fallback do Vite.
- A tela inicial abriu em `Character Details` com os cinco aventureiros do save.
- O save carregado mostrou estados reais distintos: Arkon em hunt, Ayla treinando, Mira em quest e Lyra/Shen idle.
- A selecao de Ayla atualizou nome, level, card selecionado e todos os dados do perfil.
- O atalho Inventory abriu `Inventory & Equipment` para o personagem selecionado.
- Save e Reload foram executados no SQLite real sem mensagem de falha.
- A integridade do banco passou em `PRAGMA integrity_check` com resultado `ok`.
- As tabelas reais continuaram com uma guilda e cinco personagens, sem migration ou schema novo.
- Nao houve overflow horizontal no Character Hall durante os fluxos testados.

Bug encontrado e corrigido:

- `Reload` sempre selecionava o primeiro personagem e enviava a interface para `home`, descartando a selecao feita no Character Hall.
- Agora Reload preserva o personagem selecionado quando ele ainda existe no save e retorna para `Character Details`.
- Se o personagem selecionado nao existir mais, o fallback continua sendo o primeiro personagem valido.
- Reset tambem passa a voltar para `Character Details`, mantendo Details como a tela inicial definida para o projeto.

Validacao apos a correcao:

- Ayla foi selecionada no DOM da WebView2 nativa.
- Inventory abriu para o fluxo selecionado.
- Depois de Reload, `Character Details` reapareceu com Ayla ainda selecionada e `aria-pressed=true`.
- Nenhuma mensagem `Falha ao carregar save` apareceu.
- O save continuou integro e os dados dos cinco personagens permaneceram disponiveis.

Limitacoes da QA:

- Reset nao foi clicado para evitar apagar o save real do usuario; a mudanca de destino foi validada por leitura e build.
- Nao foram alterados personagens, equipamentos ou economia durante esta QA.
- A selecao de personagem e estado de navegacao continuam locais da interface; apenas os dados de jogo sao persistidos no SQLite.

Proximo passo sugerido:

- Etapa 34 - Rework visual de Skills e progressao do personagem.

## Etapa 34 - Rework visual de Skills e progressao do personagem

Status: concluida.

Arquivos criados:

- `src/components/character/SkillsProgressionPanel.tsx`.

Arquivos alterados:

- `src/app/App.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/styles.css`.
- `docs/PROJECT_STATUS.md`.

Implementado:

- A aba Skills agora abre um Skill Hall amplo e esconde roster, menu lateral e painel direito para priorizar a progressao do personagem.
- O perfil mostra vocacao, papel, skill principal, media das skills, soma dos niveis e quantidade de perks ativos.
- As sete skills reais do personagem aparecem em cards com nivel, progresso e afinidade com os caminhos da vocacao.
- O plano de desenvolvimento destaca a skill principal, shielding e a Weapon Proficiency ativa.
- O estado de treino atual mostra skill, duracao e progresso quando o personagem esta treinando.
- O resumo de Weapon Mastery reutiliza niveis, progresso e perks reais das proficiencias existentes.
- Os atalhos Training Grounds, Weapon Mastery e Path of Destiny abrem os sistemas reais ja implementados.
- A troca de aba ou personagem agora restaura o scroll do conteudo para o topo.

QA visual e funcional:

- O Skill Hall foi aberto no Vite com os dados reais do mock local.
- Em 1280 px, ocupou toda a area util sem manter o painel de personagem duplicado.
- Em viewport de 760 px, nao houve overflow horizontal e cards, resumo e masteries responderam corretamente.
- O comando Training Grounds abriu o painel real de Training.
- O comando Weapon Mastery abriu Weapon Proficiency e o retorno para Skills restaurou o scroll no topo.
- O console apresentou apenas a falha esperada do plugin SQLite fora do runtime Tauri.

Bugs encontrados e corrigidos:

- O painel direito continuava aparecendo abaixo do Skill Hall porque o seletor usava uma classe incorreta; o modo agora oculta `.right-character-panel`.
- A posicao de scroll da aba anterior era reutilizada em Skills e podia cortar o topo do perfil; o container agora volta ao inicio ao trocar de aba ou personagem.

Limitacoes:

- Esta etapa altera apresentacao e navegacao; regras, ganho de skill, treino, Weapon Proficiency e save nao foram modificados.
- Os selos das skills continuam textuais e nao usam sprites ou assets externos.
- O QA interativo foi feito no Vite. O Tauri/SQLite nao foi reexecutado porque nao houve alteracao de schema, migration ou persistencia.

Proximo passo sugerido:

- Etapa 34.5 - QA de Skills e progressao no Tauri/SQLite.

## Etapa 34.5 - QA de Skills e progressao no Tauri/SQLite

Status: concluida como QA e estabilizacao.

Validado no runtime Tauri real:

- `npm.cmd run tauri:dev` abriu a janela desktop `Guild Hunt Idle` usando a WebView2 nativa.
- O SQLite real carregou uma guilda e cinco personagens sem usar o fallback do Vite.
- Arkon abriu o Skill Hall com sete skills, quatro resumos de mastery, Sword 10 como skill principal e sem overflow horizontal.
- A troca para Ayla atualizou perfil, vocacao, skill principal, cards recomendados e estado de treinamento.
- Training Grounds abriu o painel real de Training e selecionou Distance para a sessao ativa.
- Weapon Mastery abriu Weapon Proficiency com os dados reais da personagem.
- Path of Destiny abriu a wheel real da personagem.
- Current Action abriu Ayla, Ranger, level 28, status Training e a acao `Distance drills`.
- Save e Reload foram executados sem erro da WebView ou mensagem de falha no carregamento.
- Apos reiniciar o Tauri, o save carregou novamente e o treino de Ayla continuou associado a Distance.

Bug encontrado e corrigido:

- Acoes de treino antigas podiam ter `type: training` e label, mas nao possuir `targetSkill`.
- O Skill Hall mostrava `Target: Unknown skill`, nao destacava o card treinado e o servico nao conseguiria finalizar esse treino legado.
- `normalizeCharacterAction` agora recupera o alvo pelo label/targetName e usa a maior skill como fallback seguro.
- A normalizacao e aplicada no mapper SQLite e nos personagens default, sem migration ou mudanca de schema.
- O Save gravou `targetSkill: distance` na acao real de Ayla, removendo a ambiguidade nos proximos loads.

Integridade do save:

- `PRAGMA integrity_check` retornou `ok`.
- O banco permaneceu com uma guilda e cinco personagens.
- Nenhuma hunt, quest, treino, reward ou progressao foi finalizada durante a QA.
- Reset nao foi executado.

Arquivos criados:

- `src/game-engine/action/normalizeCharacterAction.ts`.

Arquivos alterados:

- `src/database/saveMapper.ts`.
- `src/data/mockCharacters.ts`.
- `docs/PROJECT_STATUS.md`.

Limitacoes:

- A selecao visual de personagem nao e persistida entre reinicios; o app continua iniciando no primeiro personagem e isso e comportamento atual esperado.
- A inferencia textual existe apenas para recuperar saves legados; novas acoes continuam gravando `targetSkill` diretamente.
- O aviso de bundle acima de 500 kB permanece no build e nao afeta esta QA.

Proximo passo sugerido:

- Etapa 35 - Rework visual de Weapon Proficiency e Training Grounds.

## Etapa 35 - Rework visual de Weapon Proficiency e Training Grounds

Status: concluida.

Training Grounds:

- Nova tela ampla com perfil, disciplina selecionada, progresso, gold da guilda e status atual.
- Seletor visual das sete skills com level, progresso e destaque dos caminhos recomendados pela vocacao.
- Programas separados em Offline e Exercise por controle segmentado.
- Duracao, custo e ganho esperado continuam calculados pelos dados e engine reais existentes.
- Exercise Training fica desabilitado quando `guild.gold` nao cobre o custo.
- Personagem ocupado nao pode trocar skill nem iniciar outro programa.
- Sessao ativa mostra label, horario, disciplina e acao de finalizar o treino simulado.
- O painel continua disponivel tanto pelo Skill Hall quanto pelo modo Training de Explorar.

Weapon Proficiency:

- Novo Mastery Hall amplo com equipamento principal, offhand, soma de levels e perks desbloqueados.
- Loadout ativo mostra as masteries equipadas e os bonus percentuais aplicados no momento.
- Filtros All, Equipped, Melee, Ranged, Magic e Defense.
- Oito trilhas reais de mastery com level, XP, progresso e marcos de perks nos levels 2, 5 e 10.
- Masteries do equipamento atual recebem destaque visual sem alterar as regras de bonus.

Navegacao e layout:

- Training e Weapon Proficiency escondem roster, menu lateral e painel direito para usar toda a area do client.
- Ambos possuem retorno direto ao Skill Hall.
- Trocas de aba/personagem agora restauram tambem o scroll global da pagina, evitando abrir uma nova tela no meio em viewports compactos.
- Novos subtitulos e icones T/P foram adicionados ao GameWindow.

QA visual no Vite:

- Arkon abriu Training com Sword selecionada, quatro programas Offline e sete skills.
- A selecao de Distance atualizou selo, resumo, custos e ganhos esperados.
- Com 420g, os tres programas Exercise de 2.000g, 4.000g e 8.000g ficaram desabilitados.
- Ayla abriu com `Distance drills`, Distance 82 e todos os novos inicios bloqueados durante a sessao ativa.
- Mastery Hall exibiu oito masteries para Arkon e duas masteries no filtro Equipped: Sword e Shield.
- Ayla exibiu Bow Mastery como equipamento ativo e nenhum shield.
- Em viewport de 760 px, Training e Mastery responderam sem overflow horizontal.
- O console apresentou somente a falha esperada do plugin SQLite fora do runtime Tauri.

Bugs encontrados e corrigidos durante o QA:

- O badge de bonus vazio herdava o estilo quadrado dos codigos de mastery e quebrava o texto; o seletor CSS foi restringido aos cards de equipamento.
- A navegacao compacta preservava o scroll global da tela anterior; o MainPanel agora restaura o documento e o conteudo interno ao topo.

Arquivos criados:

- `src/components/character/WeaponProficiencyPanel.tsx`.

Arquivos alterados:

- `src/app/App.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/components/explore/ExploreWindow.tsx`.
- `src/components/training/TrainingPanel.tsx`.
- `src/components/training/TrainingOptionCard.tsx`.
- `src/components/training/TrainingResultPanel.tsx`.
- `src/styles.css`.
- `docs/PROJECT_STATUS.md`.

Limitacoes:

- Nenhuma regra de ganho, custo, nivel, perk, save ou schema foi alterada nesta etapa visual.
- Os halls usam selos textuais e CSS; nao foram adicionados sprites ou assets externos.
- A finalizacao de treino nao foi clicada no QA para nao aplicar progressao durante a validacao visual.
- O Tauri/SQLite real fica para a Etapa 35.5.

Proximo passo sugerido:

- Etapa 35.5 - QA de Training Grounds e Weapon Proficiency no Tauri/SQLite.

## Etapa 35.5 - QA de Training Grounds e Weapon Proficiency no Tauri/SQLite

Status: concluida com QA real e correcoes de persistencia.

Validacoes no Tauri:

- O app nativo carregou o save SQLite real, sem fallback para os mocks.
- Lyra abriu Training Grounds com Magic 61, progresso 27%, sete skills e quatro programas Offline habilitados.
- Com 674g, os programas Exercise de 2.000g, 4.000g e 8.000g permaneceram corretamente desabilitados.
- A selecao de Shielding atualizou disciplina, selo e dados dos programas sem iniciar treino.
- Ayla carregou a sessao real `Distance drills`, Distance 82 e progresso 64%; novos programas ficaram bloqueados enquanto ocupada.
- Weapon Proficiency mostrou oito trilhas, Wand como mastery ativa de Lyra e os filtros Magic e Equipped funcionando.
- A finalizacao simulada nao foi acionada para preservar a progressao do save usado no QA.

Bugs encontrados e corrigidos:

- Save e Reload podiam executar ao mesmo tempo; Reload conseguia ler as tabelas entre o `DELETE` e a reinsercao dos registros.
- Saves agora entram em uma fila unica e Reload/Reset aguardam qualquer escrita pendente.
- Save, Reload e Reset ficam desabilitados enquanto uma operacao de persistencia esta em andamento.
- Uma carga parcial dos personagens padrao agora restaura personagens, skills basais e Guild Depot ausentes sem remover personagens personalizados.
- Skills ausentes ou abaixo do baseline conhecido dos personagens padrao sao normalizadas na carga de saves parciais/legados.
- O offline catch-up podia criar varios logs com o mesmo id no mesmo milissegundo; os novos ids usam sequencia local.
- Logs duplicados sao deduplicados na carga e antes da escrita, evitando chave repetida no React e `UNIQUE constraint failed` no SQLite.

Recuperacao e persistencia:

- O QA reproduziu a corrida e deixou o banco momentaneamente com dois personagens; a nova normalizacao recuperou os cinco personagens padrao e seus dados basais.
- Apos a recuperacao, o banco ficou com `integrity_check: ok`, 1 guilda, 5 personagens, 35 skills, 26 itens e nenhum id de log duplicado.
- Save/Reload controlado manteve os cinco personagens, Ayla em Training e Distance 82/64%.
- O hash do arquivo mudou por causa da recuperacao e dos saves de validacao; o estado funcional foi conferido por consultas SQLite e carga no app.

Arquivos alterados:

- `src/app/App.tsx`.
- `src/components/layout/TopBar.tsx`.
- `src/database/saveGameRepository.ts`.
- `src/database/saveMapper.ts`.
- `docs/PROJECT_STATUS.md`.

Limitacoes:

- O plugin SQL usado pelo projeto nao expoe transacao explicita nesta camada; a fila protege operacoes concorrentes dentro do app, mas encerramento forcado durante uma escrita ainda nao tem garantia transacional completa.
- A restauracao automatica usa baseline apenas para os cinco personagens padrao; dados historicos personalizados ausentes de um banco ja truncado nao podem ser reconstruidos.
- Nenhum ganho de skill, gasto de gold ou conclusao de treino foi aplicado durante este QA.

Proximo passo sugerido:

- Etapa 36 - continuar o rework dos sistemas de progressao do personagem.

## Etapa 36 - Blessings, Death e Temple Hall

Status: concluida.

Blessings Hall:

- Blessings agora abre como hall amplo e esconde roster, menu lateral e painel direito.
- A tela segue a composicao compacta da referencia enviada, mas usa nomes, sigilos e CSS autorais sem assets externos.
- O topo mostra personagem, templo atual, quantidade ativa, protecao total e `guild.gold`.
- Sete cards exibem dominio, descricao, protecao, preco e estado de compra.
- Temple Record mostra templo, personagem, mortes, estado atual e item loss desabilitado.
- Personagem morto ve o Death Report e o botao real de revive dentro do proprio hall.

Regras:

- Sete bencaos autorais: Dawn's Insight, Phoenix Ember, Solar Covenant, Spirit Ward, Aether Embrace, Mountain Heart e Vanguard Blood.
- Cada bencao custa 2.000g e concede 10% de reducao nas penalidades locais de XP/gold.
- As bencaos sao cumulativas ate o limite conservador de 70%.
- Cada bencao pode ser comprada uma vez por personagem e todas as que protegerem uma morte sao consumidas.
- Compra usa somente `guild.gold`; nao existe Store, premium, moeda paga ou compra online.
- Compra duplicada por clique rapido e bloqueada por lock local e pela verificacao do id ja ativo.

Compatibilidade e persistencia:

- O array existente `character.blessings` continua sendo salvo no mesmo `blessings_json` do SQLite; nenhuma migration foi necessaria.
- IDs antigos Adventurer's Blessing, Guardian Spirit e Temple Pact continuam reconhecidos com sua protecao original.
- Uma bencao legada ativa bloqueia novas compras ate ser consumida, evitando misturar regras antigas e novas.
- DeathPenalty agora pode registrar percentual protegido e ids das bencaos consumidas; saves antigos continuam validos porque os campos sao opcionais.
- Character Hall mostra quantidade ativa e protecao total; badge lateral usa formato `0/7`.

QA realizado:

- `npm.cmd run build` passou antes e depois da implementacao.
- Tauri abriu com o save SQLite real e o Blessings Hall carregou sem fallback.
- Em 1280x800, a tela exibiu sete cards, 0/7, 0% e 674g sem overflow horizontal ou erros de console.
- Em viewport 760x900, os cards responderam em duas colunas e a largura ficou em 699/699 px, sem overflow.
- Com 674g, todos os cards de 2.000g ficaram corretamente desabilitados como `Insufficient gold`.
- Checagem direta da engine confirmou sete ids unicos, 10% com uma bencao e 70% com as sete.
- Nenhuma compra, morte, consumo de bencao ou alteracao de gold foi aplicada ao save principal durante o QA visual.

Arquivos criados:

- `src/components/death/BlessingsHall.tsx`.

Arquivos principais alterados:

- `src/data/blessings.ts`.
- `src/shared/types.ts`.
- `src/game-engine/death/`.
- `src/app/App.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/components/layout/CharacterSideMenu.tsx`.
- `src/components/character/CharacterDetails.tsx`.
- `src/components/death/DeathPanel.tsx`.
- `src/styles.css`.

Limitacoes:

- Item loss e perda real de skill continuam desabilitados; a protecao atua nas penalidades de XP e gold ja existentes.
- A compra e o consumo real com sete bencaos devem ser exercitados no Tauri com um save de QA financiado na Etapa 36.5.
- Nao foi criado sistema de resgate, Store, premium ou compra automatica de bencaos.

Proximo passo sugerido:

- Etapa 36.5 - QA de Blessings, Death e Temple Hall no Tauri/SQLite.

## Etapa 36.5 - QA de Blessings, Death e Temple Hall no Tauri/SQLite

Status: concluida sem bug funcional novo.

Protecao do save:

- O app estava encerrado antes da preparacao do QA.
- O SQLite original recebeu `wal_checkpoint(TRUNCATE)` e passou em `integrity_check: ok`.
- Foi criado backup fora do repositorio com SHA-256 `3302b920bc0cb750ff3f148eb850cfd765032cc1431dbe69b7fe33a6a2083081`.
- A copia de trabalho foi financiada temporariamente de 674g para 14.674g.
- Ao final, sidecars WAL/SHM de QA foram removidos e o arquivo original foi restaurado byte a byte.
- O hash restaurado ficou identico ao hash pre-QA, com 674g, cinco personagens e nenhuma bencao ativa.
- Uma carga fria final no Tauri confirmou o save restaurado e console sem erros.

Compras e persistencia:

- Lyra comprou as sete bencaos reais pelo Blessings Hall.
- O total avancou de 0/7 para 7/7 e a protecao avancou de 0% para 70%.
- `guild.gold` caiu exatamente de 14.674g para 674g.
- O segundo card recebeu dois cliques imediatos; apenas uma compra foi aplicada e nao houve oitava cobranca.
- Os sete botoes mudaram para `Active`.
- Save/Reload persistiu os sete ids em `blessings_json`, 7/7, 70% e 674g.
- O Reload retornou ao Character Hall conforme a navegacao atual; reabrir Blessings mostrou os mesmos dados.

Morte e consumo:

- A engine foi executada com risco deadly e as sete bencaos ativas.
- Sem bencaos, o cenario calculou perda de 13.876 XP e 500g.
- Com 70% de protecao, a perda caiu para 4.162 XP e 150g.
- O DeathPenalty registrou `blessProtectionPercent: 70` e os sete ids em `consumedBlessingIds`.
- O personagem resultante ficou `dead`, sem bencaos restantes e no Greenport Temple.
- Os logs listaram morte, perdas, as sete bencaos utilizadas e o templo de retorno.

Death Report e revive:

- Um Death State controlado, com recovery ja vencido, foi gravado apenas na copia de QA do SQLite.
- O Blessings Hall mostrou Greenport Temple, `70% protegido`, recovery disponivel e botao `Reviver no Templo` habilitado.
- O revive real removeu o Death Report, limpou `deathState`, manteve 0/7 e retornou Lyra para `Idle`.
- Save/Reload persistiu o estado revivido sem erros de console.

Validacoes tecnicas:

- `npm.cmd run build` passou antes e depois do QA.
- Tauri e SQLite reais foram usados nas compras, Save/Reload e revive.
- Nenhuma alteracao de codigo foi necessaria nesta etapa; somente esta documentacao foi atualizada.

Limitacoes mantidas:

- A morte foi validada diretamente na engine e por fixture controlada no SQLite; nao foi necessario repetir hunts ate obter um roll aleatorio de morte.
- Item loss e perda real de skill continuam desabilitados por design.
- Store, premium, compra automatica e online continuam fora do escopo.

Proximo passo sugerido:

- Etapa 37 - Rework de Bestiary e Monster Focus Hall.

## Etapa 37 - Bestiary e Monster Focus Hall

Status: concluida.

Hunting Research Hall:

- Bestiary e Monster Focus agora compartilham uma linguagem visual de pesquisa de caca.
- As duas telas abrem em modo amplo e escondem roster, menu lateral e painel direito.
- Abas internas permitem alternar diretamente entre `Bestiary Registry` e `Monster Focus`.
- A navegacao preserva o personagem selecionado e usa os estados reais da guilda/personagem.
- Nao foram adicionados assets externos, nomes protegidos ou monetizacao.

Bestiary Registry:

- Hero mostra guilda, criaturas vistas, registros completos e charm points.
- Registry ganhou busca por criatura e filtros All, Started, Revealed e Completed.
- Cards compactos mostram sigilo autoral, stage, kills, progresso, reward e charm ativo.
- Creature Dossier mostra identidade, classificacao, progresso, thresholds, reward, XP, gold e knowledge state.
- Charm Cabinet mostra os cinco charms reais, custo, lock/unlock e assignment para a criatura selecionada.
- Claim Reward continua usando a callback e as protecoes reais existentes.

Monster Focus:

- Hero mostra personagem, alvos conhecidos, contratos ativos e `guild.gold`.
- Os tres slots reais aparecem como Hunter Assignments; somente o slot 1 permanece desbloqueado nesta etapa.
- Target Archive substitui o select generico por cards das criaturas conhecidas no Bestiary.
- Field Doctrine mostra os cinco bonus reais: XP, loot, gold, supplies e risk.
- Percentuais continuam 10%, 8%, 8%, 6% e 5%, conforme a configuracao existente.
- Active Contract mostra alvo, bonus, poder, hunts restantes, custo de reroll e Clear.
- Activate, reroll e clear continuam usando as funcoes reais e persistencia existente.

Arquivos criados:

- `src/components/bestiary/MonsterFocusHall.tsx`.

Arquivos principais alterados:

- `src/components/bestiary/BestiaryPanel.tsx`.
- `src/components/bestiary/BestiaryMonsterCard.tsx`.
- `src/components/bestiary/BestiaryDetails.tsx`.
- `src/components/bestiary/CharmCard.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/app/App.tsx`.
- `src/styles.css`.

QA realizado:

- `npm.cmd run build` passou antes e depois da implementacao.
- Tauri carregou o SQLite real com Sewer Rat em `started`, 3/100 kills e 0 charm points.
- Busca por `dragon` mostrou empty state; busca por `rat` encontrou Sewer Rat.
- Filtro Completed ficou vazio e All restaurou o registro.
- Bestiary exibiu os cinco charms existentes sem habilitar unlock indevido.
- Monster Focus reconheceu um alvo, exibiu tres slots, dois bloqueados e cinco bonus.
- O comando Activate ficou habilitado para o slot vazio e o alvo conhecido, mas nao foi clicado.
- Navegacao Bestiary > Focus > Bestiary funcionou sem voltar ao menu principal.
- Desktop 1280x800 e viewport 760x900 ficaram sem overflow horizontal.
- Um problema de compressao do dossier por regra CSS antiga foi encontrado e corrigido durante o QA.
- Console ficou sem erros.
- SQLite final permaneceu `integrity_check: ok`, 674g, Sewer Rat com 3 kills, zero charms e zero contratos ativos.

Limitacoes:

- Esta etapa nao altera thresholds, rewards, charm points, bonus, cargas, custos ou schema.
- Sigilos de criaturas/charms sao textuais e autorais; sprites reais continuam para uma etapa futura de assets.
- O save usado possui apenas Sewer Rat conhecido, portanto grids com muitas criaturas ficam para a Etapa 37.5.
- Claim, unlock, assign, activate, reroll e clear nao foram executados para preservar o save principal.

Proximo passo sugerido:

- Etapa 37.5 - QA de Bestiary, Charms e Monster Focus no Tauri/SQLite.

## Etapa 37.5 - QA de Bestiary, Charms e Monster Focus

Status: concluida.

Cobertura realizada:

- Foi criado um backup byte a byte do SQLite principal antes do QA.
- Uma fixture temporaria carregou quatro criaturas nos stages Started, Revealed e Completed, 50 charm points e os tres slots reais de Monster Focus.
- Claim de Sewer Rat concedeu 5 pontos uma unica vez e permaneceu claimed apos Save/Reload.
- Scholar consumiu 20 pontos, foi atribuido a Sewer Rat e persistiu corretamente.
- Monster Focus foi ativado para Cave Spider, rerolled por 250g e persistiu com bonus de loot, 8%, 10 cargas e `rerollCount: 1`.
- Remove de charm e Clear de Focus persistiram, sem duplicar logs ou estado.
- A interface recarregada mostrou 4.750g, 35 charm points, charm/assignment e contrato ativos antes da limpeza final da fixture.

Correcao encontrada no QA:

- Cliques duplos no mesmo tick podiam executar handlers de Bestiary/Charms/Monster Focus duas vezes antes do rerender.
- No reroll, isso descontava 250g duas vezes enquanto o estado visual avancava apenas uma vez; logs das demais acoes tambem eram duplicados.
- `src/app/App.tsx` agora usa locks curtos por operacao para claim, unlock, assign, remove, activate, clear e reroll.
- As validacoes da engine continuam sendo a segunda camada de protecao; o lock cobre especificamente a janela entre eventos consecutivos e o rerender do React.

Validacao SQLite e save:

- O reteste agressivo enviou dois cliques no mesmo tick para cada acao critica.
- O banco registrou uma ocorrencia por acao, gold final de teste em 4.750g, 35 charm points e `integrity_check: ok`.
- Save/Reload preservou claim, unlock, assignment, contrato e reroll.
- O save original foi reaberto no Tauri com Guilda Aurora, Arkon e 674g.
- Ao final, o SQLite original foi restaurado com SHA-256 `20578374af2506e3838be37069943da5e7a03795a8f2516ecb2392f026d42658` e o backup temporario foi removido.

Comandos e testes:

- `npm.cmd run build` passou com TypeScript e Vite; 269 modulos foram transformados.
- `npm.cmd run tauri:dev` foi usado para o QA interativo no WebView nativo com SQLite real.
- Nao existem scripts `test`, `lint` ou `typecheck` separados no `package.json`.
- O build mantem apenas o aviso conhecido de chunk JavaScript acima de 500 kB.

Limitacoes:

- Slots 2 e 3 de Monster Focus continuam bloqueados por design.
- O QA usa fixture local controlada; nenhum schema, balanceamento, sistema online ou monetizacao foi adicionado.
- Anti-cheat de alteracao manual do SQLite permanece fora do escopo offline/local.

Proximo passo sugerido:

- Etapa 38 - Rework de Path of Destiny / Wheel.

## Etapa 38 - Rework de Path of Destiny / Wheel

Status: concluida.

Destiny Hall:

- Path of Destiny agora abre como hall amplo e esconde roster, menu lateral e painel direito.
- Hero identifica personagem, vocacao, level e cidade, alem de pontos disponiveis, gastos, ganhos, conclusao e nodes desbloqueados.
- A wheel anterior foi substituida por `Constellation of Paths`, um mapa autoral com conexoes reais de prerequisito.
- Os dez nodes visiveis de cada vocacao usam os dados e posicoes logicas existentes, com layout de apresentacao proprio para evitar colisoes.
- Estados locked, available, unlocked e selected possuem leitura visual distinta.
- Categorias Core, Offense, Defense, Utility e Vocation possuem legenda e sigilos proprios sem assets externos.

Node Dossier:

- O node selecionado mostra descricao, shape, categoria, status, custo, level, vocacao, efeito passivo e prerequisitos.
- O comando de unlock continua usando `canUnlockDestinyNode` e `unlockDestinyNode` reais.
- Reset continua usando custo real de 1.000g por node e confirmacao existente no App.
- Nodes bloqueados mostram o motivo retornado pela engine e mantem o comando disabled.

Destiny Bonus Ledger:

- Bonus ativos agora aparecem em blocos individuais para health, ataque, magia, distance, fist, defesa, XP, gold, loot, supplies, capacity, risk e crit.
- O ledger usa `calculateDestinyBonuses`, incluindo os limites defensivos ja existentes para supplies e death risk.
- Sem nodes ativos, a tela mostra um empty state orientando o primeiro unlock no level 10.

Arquivos criados:

- `src/components/destiny/DestinyHall.tsx`.

Arquivos alterados:

- `src/components/layout/MainPanel.tsx`.
- `src/app/App.tsx`.
- `src/styles.css`.
- `docs/PROJECT_STATUS.md`.

QA realizado:

- `npm.cmd run build` passou antes e depois da implementacao.
- O Tauri abriu o Destiny Hall usando o SQLite real de Arkon level 1.
- Dez nodes da rota Guardian foram renderizados sem sobreposicao.
- A selecao de `Last Defender` atualizou dossier, custo, level, vocacao, bonus e prerequisito.
- Roster, menu lateral e painel direito ficaram ocultos no modo Destiny.
- Viewports 1280x800, 760x900 e 640x900 ficaram sem overflow horizontal.
- Abaixo de 720px, o mapa troca de posicionamento absoluto para uma lista vertical sem colisoes.
- Console ficou sem erros.
- Unlock e Reset permaneceram disabled no save level 1 e nao foram executados.
- SQLite final permaneceu `integrity_check: ok`, 674g e SHA-256 `20578374af2506e3838be37069943da5e7a03795a8f2516ecb2392f026d42658`.

Limitacoes:

- Esta etapa nao muda pontos por level, custos, bonus, prerequisitos, schema ou balanceamento.
- O save atual nao possui Destiny Points; unlock/reset real com Save/Reload fica para a Etapa 38.5 com fixture temporaria protegida.
- Os sigilos sao autorais e gerados por CSS/texto; sprites dedicados continuam fora do escopo.

Proximo passo sugerido:

- Etapa 38.5 - QA de Path of Destiny / Wheel no Tauri/SQLite.

## Etapa 38.5 - QA de Path of Destiny / Wheel

Status: concluida.

Fixture protegida:

- O SQLite original foi copiado byte a byte antes do teste.
- A fixture temporaria colocou Arkon no level 80, com 15 Destiny Points, path vazio e 10.000g.
- A acao atual foi neutralizada somente na fixture para impedir interferencia do offline catch-up.
- Nenhum dado da fixture permaneceu no save principal.

QA funcional:

- `Adventurer's Will`, `Battle Instinct` e `Shield Discipline` foram desbloqueados em sequencia.
- Cada unlock recebeu dois eventos no mesmo tick e consumiu apenas um ponto.
- O estado persistido ficou com 3 pontos gastos, 12 disponiveis e os tres IDs na ordem correta.
- O ledger exibiu Health +2%, Attack +2% e Defense +3%.
- Atributos derivados foram recalculados depois de cada unlock e persistidos no SQLite.
- `Last Defender` permaneceu bloqueado por `Missing prerequisite` enquanto `Heavy Training` nao estava ativo.
- Save/Reload restaurou os tres nodes, os 12 pontos e os bonus ativos.

Reset e duplicacao:

- Reset calculou o custo real de 3.000g para tres nodes.
- Dois eventos no mesmo tick abriram um unico dialogo, descontaram gold uma vez e criaram um unico log.
- A guilda ficou com 7.000g na fixture, path vazio e 15 pontos disponiveis.
- Outro Save/Reload confirmou que o reset persistiu.
- O QA encontrou que o segundo evento de unlock/reset era bloqueado corretamente, mas criava um log `Destiny blocked` desnecessario.
- `src/app/App.tsx` agora ignora silenciosamente o evento repetido coberto pelo lock, sem esconder erros reais da engine.

Restauracao e validacao:

- O save original foi reaberto no Tauri com Guilda Aurora, Arkon level 1 e 674g.
- SQLite final permaneceu `integrity_check: ok`.
- O arquivo final corresponde ao backup com SHA-256 `85f157db80a01a07c6f7213b198eb92af5f290fe8ecc54d8698b00230b11c250`.
- O backup temporario foi removido apos a confirmacao do hash.
- `npm.cmd run build` passou antes e depois da correcao com 270 modulos.
- Nao existem scripts separados de test, lint ou typecheck no `package.json`.
- Permanece apenas o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- O teste cobriu a rota inicial e o primeiro node Guardian; os demais nodes usam a mesma engine e ficam sujeitos ao balanceamento futuro.
- Nao foram alterados custos, bonus, pontos por level, schema ou regras de progressao.
- Reset continua exigindo confirmacao nativa e gold da guilda.

Proximo passo sugerido:

- Etapa 39 - Rework de Collections Hall.

## Etapa 39 - Rework de Collections Hall

Status: concluida.

Guild Wardrobe Hall:

- Collections agora abre como hall amplo e esconde roster, menu lateral e painel direito.
- Hero mostra guilda, personagem, vocacao, total desbloqueado, conclusao, novos registros e slots ativos.
- Outfits, Mounts e Avatars ganharam tabs amplas com sigilos e contadores por categoria.
- O sistema continua guild-wide para unlocks e por personagem para cosmeticos equipados.
- Nenhum asset externo, monetizacao, compra premium ou nova moeda foi adicionado.

Catalogo:

- Catalogo compacto mostra preview autoral, rarity, source, nome e estado Locked, Unlocked, New ou Equipped.
- Busca considera nome, descricao e source.
- Filtros All, Unlocked e Locked funcionam dentro da categoria ativa.
- Cards locked escondem o preview real e continuam selecionaveis para consultar o requisito.
- A selecao agora acompanha o filtro; um item removido do resultado nao permanece preso no showcase.

Cosmetic Showcase:

- O item selecionado mostra preview maior, categoria, source, descricao, status, rarity, vocacao e registro de unlock.
- Equip continua usando `equipCollectionItem` e suas validacoes reais.
- Itens locked, ja equipados ou de outra vocacao mantem o comando disabled com motivo visivel.
- Placeholders de store/event permanecem apenas como registros futuros, sem botao de compra.

Active Loadout:

- O rodape mostra Outfit, Mount e Avatar ativos do personagem.
- RightCharacterPanel e Character Hall continuam consumindo os mesmos dados normalizados.
- Abrir Collections continua limpando o badge de novos itens pelo fluxo existente.

Arquivos criados:

- `src/components/collections/CollectionsHall.tsx`.

Arquivos alterados:

- `src/components/layout/MainPanel.tsx`.
- `src/app/App.tsx`.
- `src/styles.css`.
- `docs/PROJECT_STATUS.md`.

QA realizado:

- `npm.cmd run build` passou antes e depois da implementacao.
- Tauri abriu o SQLite real com 14/26 cosmeticos desbloqueados e 54% de conclusao.
- Outfits mostrou 5/9, Mounts 3/7 e Avatars 6/10.
- Iron Guard, No Mount e Shield Emblem apareceram corretamente no loadout de Arkon.
- Busca por `stag` encontrou somente Forest Stag e exibiu seu requisito futuro.
- Forest Stag permaneceu locked e com Equip disabled.
- Filtro Unlocked em Mounts mostrou somente os tres mounts starter.
- A troca de filtro selecionou automaticamente um item ainda visivel.
- Viewports 1280x800, 760x900 e 500x900 ficaram sem overflow horizontal.
- Roster, menu lateral e painel direito ficaram ocultos no modo Collections.
- SQLite final permaneceu `integrity_check: ok`, 674g e SHA-256 `85f157db80a01a07c6f7213b198eb92af5f290fe8ecc54d8698b00230b11c250`.

Limitacoes:

- Esta etapa nao altera catalogo, fontes de unlock, rarity, schema ou regras de equipamento.
- A troca real de cosmetico e Save/Reload ficam para a Etapa 39.5 com backup/fixture protegida.
- Previews continuam autorais em CSS/texto; sprites dedicados ficam para uma etapa futura de assets.

Proximo passo sugerido:

- Etapa 39.5 - QA de Collections Hall no Tauri/SQLite.

## Etapa 39.5 - QA de Collections Hall

Status: concluida.

Fixture protegida:

- O SQLite original foi copiado byte a byte antes do QA.
- Rat Catcher foi adicionado temporariamente como unlock novo e `newlyUnlockedCollectionItemIds` recebeu seu ID.
- A fixture preservou o loadout inicial de Arkon: Iron Guard, No Mount e Shield Emblem.
- WAL/SHM foram removidos antes do reteste final para garantir isolamento completo da fixture.

Badge e Collections:

- O menu lateral mostrou badge `1` antes de abrir Collections.
- Abrir o hall limpou o badge sem remover Rat Catcher dos unlocks.
- Save/Reload persistiu `newlyUnlockedCollectionItemIds` vazio.
- O catalogo temporario mostrou 15/26 cosmeticos e Rat Catcher como unlocked.

Equip e persistencia:

- Outfit foi alterado de Iron Guard para Rat Catcher.
- Mount foi alterado de No Mount para Old Mule.
- Avatar foi alterado de Shield Emblem para Sword Emblem.
- Active Loadout atualizou os tres slots imediatamente.
- Save/Reload restaurou Rat Catcher, Old Mule e Sword Emblem no Tauri e no SQLite.
- Apprentice Mystic permaneceu disabled para Guardian com motivo `Different vocation`.
- Noble Adventurer permaneceu locked e sem possibilidade de compra/equip.

Correcao de clique duplo:

- Dois eventos no mesmo tick equipavam apenas um estado final, mas geravam dois logs identicos.
- `src/app/App.tsx` agora usa lock por personagem/item durante `handleEquipCollectionItem`.
- O reteste enviou clique duplo para Outfit, Mount e Avatar e registrou exatamente tres logs de Collections, um por slot.
- Erros reais de item inexistente, locked ou vocacao invalida continuam tratados pela engine.

Restauracao e validacao:

- O save original foi reaberto no Tauri com Arkon level 1 e 674g.
- Collections voltou para 14 unlocks starter, sem flags novas.
- Loadout original voltou para Iron Guard, No Mount e Shield Emblem.
- SQLite final permaneceu `integrity_check: ok`.
- SHA-256 final: `7f5f9fcd02e2559f25e5399aa6018eebdfe5d8766ddffcf16fd47de51973f217`.
- O backup temporario foi removido apos a verificacao.
- `npm.cmd run build` passou antes e depois da correcao com 271 modulos.
- Nao existem scripts separados de test, lint ou typecheck no `package.json`.
- Permanece somente o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Unlocks por quest, boss e Daily ja usam a engine real, mas nao foram repetidos nesta fixture.
- Store/event continuam placeholders sem compra real.
- Catalogo, rarity, fontes de unlock e schema nao foram alterados.

Proximo passo sugerido:

- Etapa 40 - Rework de Daily Reward Hall.

## Etapa 40 - Rework de Daily Reward Hall

Status: concluida.

Novo Guild Daily Ledger:

- Daily Reward deixou o painel generico embutido no `MainPanel` e ganhou componente dedicado em `src/components/daily/DailyRewardHall.tsx`.
- O hall usa toda a area central e esconde roster, menu lateral e painel direito enquanto estiver aberto.
- Hero mostra status diario, streak atual, total de claims e `guild.gold` real.
- Calendario exibe os sete dias simultaneamente com tipo, sigilo, descricao, valor e estado current/completed/claimed/upcoming.
- A recompensa atual ganhou dossier proprio com destino de entrega real: Guild Treasury, Guild Depot ou Collections.
- Botao de claim mostra o valor antes do resgate e muda para estado disabled depois do claim.
- Historico mostra ate sete claims recentes e informa o limite persistido de 20 registros.
- A regra de streak ficou visivel sem adicionar compra, premium, restore ou monetizacao.

Integracoes preservadas:

- `onClaimDailyReward` e a engine da Etapa 25 continuam sendo a unica rota de resgate.
- Streak, `cycleDay`, claim unico local, fallback de gold, Guild Depot e Collections nao tiveram regra alterada.
- Badge da Topbar continua derivado de `canClaimDailyReward`.
- Save mapper, repository e schema SQLite nao precisaram de mudanca.
- Nenhuma recompensa, preco ou dado de balanceamento foi alterado.

Validacao:

- `npm.cmd run build` passou com 272 modulos.
- Browser local validou abertura do hall, sete cards, ausencia de overflow horizontal em 1280x720 e rolagem interna da janela.
- Claim no mock local atualizou status para claimed, marcou Day 1, avancou o proximo dispatch para Day 2 e desabilitou o botao.
- Breakpoints de 1180px, 820px e 520px foram adicionados e revisados por leitura; o controlador visual nao aplicou viewport mobile real nesta etapa.
- O erro de SQLite observado no browser e esperado fora do runtime Tauri e acionou corretamente o mock local.
- Permanece somente o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Claim, badge e Save/Reload ainda precisam de reteste no runtime Tauri com fixture SQLite protegida.
- O hall usa sigilos CSS e texto, sem assets externos ou protegidos.
- O ciclo permanece simples em sete dias e sem anti-cheat de relogio local.

Proximo passo sugerido:

- Etapa 40.5 - QA do Daily Reward Hall no Tauri/SQLite.

## Etapa 40.5 - QA do Daily Reward Hall

Status: concluida.

Fixture protegida:

- O SQLite original recebeu checkpoint e foi copiado byte a byte antes do QA.
- SHA-256 original: `7f5f9fcd02e2559f25e5399aa6018eebdfe5d8766ddffcf16fd47de51973f217`.
- A fixture definiu o ultimo claim como ontem, streak 4, total 4, `cycleDay` 2 e um registro anterior no historico.
- Nao havia Health Potion no Guild Depot antes do teste.

QA real no Tauri:

- `npm.cmd run tauri:dev` iniciou Vite, compilou o target Rust e abriu `guild-hunt-idle.exe`.
- A janela Tauri mostrou badge `!` no Daily antes do claim.
- O hall abriu com status Available, streak 4, total 4, Day 1 Complete e Day 2 Current.
- Health Supply Crate exibiu `HP x5` e destino Guild Depot.
- Foi enviado clique duplo real ao botao Claim Guild Reward.
- Exatamente um claim foi aplicado: streak 5, total 5, `cycleDay` 3 e `claimedToday = true`.
- Day 2 passou para Claimed, Day 3 passou para Current e o dossier mudou para Return Tomorrow.
- O botao mudou para Reward Claimed Today, ficou disabled e informou disponibilidade amanha.
- O badge da Topbar desapareceu imediatamente.
- O historico passou de 1/20 para 2/20 com Health Supply Crate no topo.

SQLite e persistencia:

- Guild Depot recebeu exatamente cinco Health Potions em um unico stack valido.
- `guild.gold` permaneceu 674 porque a recompensa testada era supply.
- Activity Log persistiu exatamente dois registros: entrega de Health Potion x5 e streak de 5 dias.
- Nao houve log, item, historico ou incremento duplicado apos o clique duplo.
- Save e Reload foram acionados na janela Tauri.
- Apos Reload, streak 5, total 5, `cycleDay` 3, historico 2/20 e cinco potions continuaram persistidos.
- `pragma integrity_check` permaneceu `ok` antes, durante e depois do QA.

Restauracao:

- O runtime Tauri foi encerrado e os sidecars WAL/SHM foram removidos.
- O save original foi restaurado com 674g, streak 1, total 1, `cycleDay` 2 e o historico original.
- SHA-256 restaurado corresponde exatamente ao backup original.
- Nenhum dado da fixture permaneceu no save do usuario.

Validacao tecnica:

- `npm.cmd run build` passou antes do QA com 272 modulos.
- Nenhum bug de gameplay ou UI foi encontrado nesta etapa; somente a documentacao foi alterada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.
- Nao existem scripts separados de test, lint ou typecheck no `package.json`.

Limitacoes:

- O QA real cobriu a recompensa de supply do Dia 2; gold, material e Collections continuam cobertos pela engine e pelo QA anterior, mas nao foram reaplicados nesta fixture.
- A virada pratica do Dia 7 para o Dia 1 nao foi repetida no Tauri nesta etapa.
- O sistema continua usando data local, sem anti-cheat, premium, pagamento ou online.

Proximo passo sugerido:

- Etapa 41 - Rework de Ranking Hall local.

## Etapa 41 - Rework de Ranking Hall local

Status: concluida.

Novo Hall of Renown:

- Ranking deixou a lista simples embutida no `MainPanel` e ganhou componente dedicado em `src/components/ranking/LocalRankingHall.tsx`.
- O hall usa toda a area central e esconde roster, menu lateral e painel direito enquanto estiver aberto.
- Hero mostra quantidade de aventureiros, nivel medio, XP combinado e posicao do personagem selecionado.
- A interface declara explicitamente que a classificacao e offline e usa somente personagens do save local.

Metricas reais:

- Experience usa `character.experience`.
- Character Level usa `character.level`, com XP como desempate.
- Combat Power deriva de attack, defense, armor, health e mana ja calculados no personagem.
- Skill Total soma os sete niveis permanentes de combat skills.
- Todos os rankings usam desempate deterministico por XP, level e nome.

Interface:

- Podio apresenta os tres primeiros colocados com primeiro lugar elevado e hierarquia visual propria.
- Tabela completa mostra rank, aventureiro, cidade/status, vocacao, level, main skill e valor da metrica.
- Selecionar entrada no podio ou tabela troca o personagem ativo da guilda.
- Dossier lateral mostra rank, score relativo ao lider, XP, combat power, skill total e quests concluidas.
- Abas compactas alternam as quatro metricas sem alterar ou persistir dados extras.
- Breakpoints reorganizam hero, abas, podio, tabela e dossier em telas menores.

Integracoes preservadas:

- Ranking e calculado diretamente de `characters`; nenhum schema, repository ou save mapper foi alterado.
- Nao existe leaderboard online, conta externa, temporada, premio de ranking ou monetizacao.
- Trocar o personagem pelo hall reutiliza `onSelectCharacter` e os fluxos existentes do app.
- Topbar continua abrindo Ranking pelo mesmo tab local.

Validacao:

- `npm.cmd run build` passou com 273 modulos.
- Browser local validou os cinco personagens, podio, tabela e ausencia de overflow horizontal em 1280x720.
- Experience colocou Ayla em primeiro com 301,200 XP.
- Combat Power colocou Mira em primeiro com 743 power.
- Skill Total colocou Shen em primeiro com 239 levels.
- Character Level colocou Ayla em primeiro no level 28.
- Selecionar Shen atualizou o dossier para Monk, Eldenroot, rank #4 na metrica de level e 79% do score lider.
- O unico erro do console foi o fallback esperado do plugin SQLite fora do runtime Tauri.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Combat Power e uma comparacao local de atributos atuais, nao um rating competitivo persistido.
- Nao ha historico de temporadas, ranking global, ranking entre guildas ou recompensas de colocacao.
- O breakpoint mobile foi revisado por CSS, mas nao recebeu screenshot em viewport mobile real nesta etapa.

Proximo passo sugerido:

- Etapa 41.5 - QA do Ranking Hall local no Tauri/SQLite.

## Etapa 41.5 - QA do Ranking Hall local

Status: concluida.

Protecao do save:

- O SQLite original recebeu checkpoint e foi copiado byte a byte antes do QA.
- SHA-256 original: `7f5f9fcd02e2559f25e5399aa6018eebdfe5d8766ddffcf16fd47de51973f217`.
- `pragma integrity_check` retornou `ok` antes e depois dos testes.
- As ordens esperadas foram calculadas diretamente das tabelas `characters` e `character_skills`.

Dados reais esperados:

- Experience e Character Level: Ayla, Lyra, Mira, Shen e Arkon.
- Skill Total: Shen 239, Ayla 224, Lyra 199, Mira 168 e Arkon 53.
- O save continha cinco aventureiros, level medio 20 e aproximadamente 899.4K XP combinado.

QA real no Tauri:

- `npm.cmd run tauri:dev` iniciou Vite, compilou o target Rust e abriu `guild-hunt-idle.exe`.
- Ranking abriu em modo amplo sem roster, menu lateral ou painel direito.
- Experience mostrou Ayla 301,200 XP, Lyra 246,900 XP e Mira 198,400 XP no podio.
- Skill Total mostrou Shen 239, Ayla 224 e Lyra 199, correspondendo ao SQLite.
- Combat Power mostrou Mira 743, Lyra 591 e Shen 545.
- Character Level mostrou Ayla 28, Lyra 26, Mira 24, Shen 22 e Arkon 1 na tabela.
- A tabela exibiu cidade, status, vocacao e main skill reais de cada personagem.
- O texto Offline Record confirmou que nao existe leaderboard online conectado.

Selecao e dossier:

- Selecionar Mira pelo podio de Combat Power atualizou Topbar para Mira level 24 e posicao para #1.
- Selecionar Shen pela tabela de Character Level destacou a linha #4 e atualizou Topbar e dossier.
- O dossier de Shen mostrou Monk, Thaeron, Level 22, 79% do lider, 152.8K XP, 545 power, 239 skills e uma quest concluida.
- Trocar metrica ou personagem nao criou logs, rewards, moedas ou progressao paralela.

Save/Reload e read-only:

- Save e Reload foram acionados na janela Tauri e Ranking foi reaberto.
- Foi criado digest semantico dos campos de guilda, personagem e skills usados pelo Ranking.
- Digest antes e depois: `2e388d81fcbfae47d3bb131677046394ac3f1a3bfdb486abd05f80c035cc4086`.
- Os campos de ranking permaneceram exatamente iguais apos interacoes e Save/Reload.
- Alteracoes normais de metadata/timestamps do Save foram removidas pela restauracao byte a byte.

Restauracao e validacao:

- O runtime Tauri foi encerrado e os sidecars WAL/SHM foram removidos.
- O save original foi restaurado com os cinco personagens e hash identico ao backup.
- `npm.cmd run build` passou antes do QA com 273 modulos.
- Nenhum bug de gameplay ou UI foi encontrado; somente a documentacao foi alterada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Combat Power continua sendo score derivado local, nao rating competitivo persistido.
- Nao foram criados ranking global, temporadas, recompensas ou integracao online.
- QA foi executado na janela desktop; responsividade mobile permanece coberta pelos breakpoints e pelo QA visual anterior.

Proximo passo sugerido:

- Etapa 42 - Rework de Store Hall cosmetico local, somente preview e sem pagamento real.

## Etapa 42 - Rework de Store Hall cosmetico local

Status: concluida.

Novo Cosmetic Showcase:

- Store deixou o placeholder simples embutido no `MainPanel` e ganhou componente dedicado em `src/components/store/CosmeticShowcaseHall.tsx`.
- A janela passou a se chamar Cosmetic Showcase e usa toda a area central sem roster, menu lateral ou painel direito.
- O hall funciona como arquivo de preview local, sem precos, checkout, moeda paga, compra ou servico online.
- Hero mostra quantidade de registros, unlocks do showcase, previews futuros e Purchases Disabled.
- Banner permanente informa que nenhum item pode ser comprado e oferece somente o comando Open Collections.

Catalogo:

- Showcase lista os 12 cosmeticos nao-starter existentes em `src/data/collections.ts`.
- Quatro Outfits, quatro Mounts e quatro Avatars usam os mesmos IDs e dados reais de Collections.
- Filtros por categoria alternam All Records, Outfits, Mounts e Avatars.
- Filtros de fonte alternam all, earnable e future.
- Itens earnable distinguem Bestiary, Quest, Boss e Achievement.
- Itens futuros distinguem Future Store e Future Event, sempre como Preview only.
- Estado Unlocked vem diretamente de `guild.collections`; nenhum estado paralelo foi criado.

Preview e integracao:

- Selecionar um card atualiza sigilo, nome, raridade, descricao, categoria e fonte.
- Dossier informa Collection state, compatibilidade de vocacao, tipo de acesso e Payment Not Available.
- Requisitos usam `unlockRequirementText` existente.
- Open Collections e Open Collections Hall navegam para o Wardrobe Hall real.
- Unlock e equip continuam exclusivamente sob responsabilidade do sistema Collections.

Politica sem monetizacao:

- O hall declara No payment, No power, No online e Collections owns unlocks.
- Nao existem botoes Buy, Purchase ou Checkout.
- Nao foram adicionados premium, saldo pago, pagamento real, anuncios, boosts ou vantagens de gameplay.
- `guild.gold` e o placeholder Cosmetic da Topbar nao sao consumidos pelo showcase.

Validacao:

- `npm.cmd run build` passou com 274 modulos.
- Browser local validou 12 registros, quatro previews futuros e ausencia de overflow horizontal em 1280x720.
- Future mostrou 4/12; Outfits + Future mostrou 1/12; Mounts + Future mostrou 2/12.
- Ash Wolf e Merchant Cart apareceram no filtro correto e selecionar Merchant Cart atualizou o preview.
- A arvore acessivel continha zero botoes Buy, Purchase ou Checkout.
- Open Collections navegou corretamente ao Wardrobe Hall.
- Os unicos erros do console foram os fallbacks esperados do SQLite fora do runtime Tauri.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Store continua sendo apenas uma vitrine; nenhum item futuro pode ser obtido nela.
- Sigilos e silhuetas continuam produzidos por CSS e texto, sem assets externos.
- Breakpoints mobile foram revisados por CSS, sem screenshot mobile real nesta etapa.

Proximo passo sugerido:

- Etapa 42.5 - QA do Cosmetic Showcase no Tauri/SQLite.

## Etapa 42.5 - QA do Cosmetic Showcase no Tauri/SQLite

Status: concluida como QA de estabilizacao, sem alteracao de gameplay.

Fixture e protecao do save:

- O save SQLite original foi copiado antes do teste e validado com `PRAGMA integrity_check`.
- O fixture desbloqueou somente `outfit-rat-catcher`, mantendo `newlyUnlockedCollectionItemIds` vazio.
- A vitrine reconheceu 1 dos 12 registros como desbloqueado sem criar estado paralelo.
- Ao final, o banco original foi restaurado byte a byte com o mesmo SHA-256 e `integrity_check=ok`.

Catalogo, filtros e preview:

- Cosmetic Showcase abriu no Tauri com 12 registros, 1 desbloqueado, 4 previews futuros e Purchases Disabled.
- Rat Catcher mostrou Collection State como Unlocked e o aviso de que ja estava disponivel no Collections Hall.
- Outfits + Future mostrou somente Noble Adventurer, totalizando 1/12 visivel.
- Mounts + Future mostrou Ash Wolf e Merchant Cart, totalizando 2/12 visiveis.
- Selecionar os cards atualizou o dossier central sem alterar guilda, personagem, inventario ou Collections.
- Nao apareceram comandos Buy, Purchase ou Checkout, nem precos, premium ou moeda paga.

Integracao com Collections:

- Open Collections navegou para o Aurora Wardrobe Hall real.
- Collections exibiu 15/26 desbloqueios, 58% de conclusao, zero novos registros e Rat Catcher desbloqueado.
- O showcase nao duplicou unlock, nao marcou badge novo e nao equipou cosmetico automaticamente.

Save/Reload e somente leitura:

- Save e Reload foram acionados na janela desktop e Store foi reaberto em seguida.
- O estado persistido manteve 674 gold, 15 unlocks no fixture, Rat Catcher uma unica vez e `newlyUnlockedCollectionItemIds` vazio.
- Guilda, personagens, inventario e Collections permaneceram semanticamente iguais ao fixture.
- O unico activity log novo foi o esperado `Save salvo com sucesso`; navegar, filtrar e selecionar previews nao criou logs de gameplay.

Validacao:

- `npm.cmd run build` passou antes do QA com 274 modulos.
- QA interativo foi executado no runtime Tauri por cliques reais e capturas da janela desktop.
- Nenhum bug funcional ou visual foi encontrado; somente esta documentacao foi alterada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- O showcase permanece deliberadamente somente leitura; unlock e equip continuam no Collections Hall.
- Sigilos e silhuetas continuam em CSS/texto, sem assets externos.
- Responsividade mobile nao foi retestada nesta etapa desktop.

Proximo passo sugerido:

- Etapa 43 - Rework de Updates / Changelog Hall local.

## Etapa 43 - Rework de Updates / Changelog Hall local

Status: concluida.

Novo Release Archive:

- Updates deixou o card simples embutido no `MainPanel` e ganhou componente dedicado em `src/components/updates/UpdatesHall.tsx`.
- A janela usa toda a area central e oculta roster, menu lateral e painel direito.
- O arquivo e totalmente local, somente leitura e nao baixa patches nem acessa contas ou servicos online.
- Hero resume release records, sistemas, revisoes de interface e registros de QA.
- A Etapa 43 aparece como release atual instalada.

Dados e categorias:

- `src/data/clientUpdates.ts` concentra 10 releases reais das Etapas 36 a 43.
- Cada registro possui etapa, titulo, data, categoria, resumo, highlights e sistemas afetados.
- Categorias disponiveis: All Releases, Systems, Interface e QA Records.
- O arquivo inicial possui quatro Systems, quatro Interface e dois QA Records.
- A busca local cobre etapa, titulo, resumo, highlights e nomes de sistemas.

Lista e dossier:

- Cards mostram categoria, etapa, data, titulo, resumo e estado Current quando aplicavel.
- Selecionar ou filtrar um registro atualiza o dossier sem navegacao externa.
- O dossier mostra identidade da release, tres highlights, sistemas incluidos e estado Released locally.
- Uma ledger inferior resume Foundation, Gameplay, Client Rework e Guild Halls.
- Nenhum estado de update e persistido no SQLite e nenhuma activity log e criada.

Visual e responsividade:

- O hall segue o estilo MMORPG escuro, metalico e dourado das telas Ranking e Cosmetic Showcase.
- Layout desktop usa lista e dossier lado a lado; em larguras menores o dossier passa para baixo.
- Tabs, resumo, cards e eras se reorganizam em duas ou uma coluna nos breakpoints existentes.
- Nao foram usados assets externos.

Validacao:

- `npm.cmd run build` passou apos a implementacao com 276 modulos.
- Browser local em 1280x720 confirmou 10 releases, painel amplo e ausencia de overflow horizontal.
- Filtro QA exibiu dois registros e selecionou Hall of Renown QA no dossier.
- Busca por `ranking` dentro de QA retornou exatamente um registro.
- Viewport 390x844 manteve largura interna responsiva e sem overflow horizontal.
- O unico erro de console foi o fallback esperado do SQLite fora do runtime Tauri.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Release notes sao dados locais curados; ainda nao sao geradas automaticamente por commits ou tags Git.
- Nao existem download de patch, updater automatico, feed remoto, conta online ou notificacoes persistidas.
- QA no Tauri/SQLite fica reservado para a etapa de estabilizacao seguinte.

Proximo passo sugerido:

- Etapa 43.5 - QA do Updates Hall no Tauri/SQLite.

## Etapa 43.5 - QA do Updates Hall no Tauri/SQLite

Status: concluida.

Validacao no Tauri:

- O app desktop foi aberto com o SQLite real e operado por cliques reais na janela Tauri.
- Updates abriu como hall amplo, sem roster, menu lateral ou painel direito ocupando a area do arquivo.
- O resumo exibiu 10 releases, quatro Systems, quatro Interface, dois QA Records e Current: Stage 43.
- O filtro QA exibiu `2/10` registros e selecionou Hall of Renown QA no dossier.
- A busca por `ranking` dentro do filtro QA exibiu exatamente `1/10` registro.
- Save, Reload e a reabertura de Updates restauraram All Releases, busca vazia, `10/10` visiveis e Stage 43 selecionada.

Validacao do SQLite:

- `PRAGMA integrity_check` retornou `ok` antes e depois do fluxo.
- Guilda, cinco personagens, 35 skills e 26 linhas de inventario permaneceram semanticamente identicos ao backup.
- `guild.gold` permaneceu em 674g e Updates nao criou activity logs.
- O Save manual adicionou somente o log esperado `Save salvo com sucesso.`; os 10 logs anteriores foram preservados.
- `save_metadata` atualizou apenas timestamps tecnicos esperados durante load/save.
- Ao final, o banco original foi restaurado byte por byte, com SHA-256 `7f5f9fcd02e2559f25e5399aa6018eebdfe5d8766ddffcf16fd47de51973f217`.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado.
- Nenhum arquivo de codigo precisou ser alterado; somente esta documentacao foi atualizada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Release notes continuam locais e curadas manualmente, sem updater ou feed remoto.
- A validacao foi desktop no Tauri; a responsividade mobile ja havia sido coberta na Etapa 43 pelo browser local.

Proximo passo sugerido:

- Etapa 44 - Rework de Wiki / Guild Codex local.

## Etapa 44 - Rework de Wiki / Guild Codex local

Status: concluida.

Novo Guild Field Codex:

- Wiki deixou o placeholder simples embutido no `MainPanel` e ganhou componente dedicado em `src/components/wiki/GuildCodexHall.tsx`.
- A janela usa toda a area central e oculta roster, menu lateral e painel direito.
- O codex e totalmente local, somente leitura e nao altera o save SQLite.
- Hero resume quantidade total de registros, vocacoes, field records e guias de sistema.
- A Etapa 44 foi adicionada como release atual no arquivo local de Updates.

Dados e categorias:

- `src/data/guildCodex.ts` combina oito guias curados com registros derivados de `vocations`, `hunts`, `bosses` e `quests`.
- O catalogo inicial possui 34 registros: cinco Adventurers, 22 Exploration, quatro Progression e tres Guild Services.
- Categorias disponiveis: All Records, Adventurers, Exploration, Progression e Guild Services.
- Hunts mostram level, risco, XP/h, economia, criaturas e supplies a partir das definicoes reais.
- Bosses mostram level, party, risco, cooldown, duracao, rewards e acessos reais.
- Quests mostram level, duracao, etapas, rewards e access unlock real.
- Vocacoes mostram role, skills principais, crescimento por level e multiplicadores reais.

Indice e dossier:

- A busca cobre titulo, subtitulo, resumo, facts, field guidance, sistemas relacionados e keywords.
- Cards mostram sigilo, categoria, contexto, titulo, resumo e estado Start here quando aplicavel.
- Selecionar ou filtrar atualiza automaticamente o dossier sem navegacao externa.
- O dossier exibe identidade, quatro facts, tres orientacoes e sistemas relacionados.
- Uma ledger inferior sugere a rota Command, Explore, Research e Advance.

Visual e responsividade:

- O hall segue o estilo MMORPG escuro, metalico e dourado dos halls recentes.
- Layout desktop usa indice e dossier lado a lado; abaixo de 1180px o dossier passa para baixo.
- Em `390x844`, hero, tabs, facts e ledger usam uma coluna sem overflow horizontal.
- Nao foram usados assets externos.

Validacao:

- `npm.cmd run build` passou durante a implementacao com 278 modulos.
- Browser local em 1280x720 confirmou 34 registros, cinco categorias e ausencia dos paineis laterais.
- Filtro Exploration com busca por `sewer` retornou quatro registros e selecionou Sewers Below Thaeron.
- Viewport 390x844 manteve largura interna responsiva e sem overflow horizontal.
- O unico erro de console foi o fallback esperado do SQLite fora do runtime Tauri.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Textos explicativos dos oito guias de sistema continuam curados manualmente.
- O codex ainda nao possui favoritos, historico de leitura ou links diretos para abrir outros halls.
- QA de Save/Reload no Tauri/SQLite fica reservado para a etapa de estabilizacao seguinte.

Proximo passo sugerido:

- Etapa 44.5 - QA do Guild Codex no Tauri/SQLite.

## Etapa 44.5 - QA do Guild Codex no Tauri/SQLite

Status: concluida.

QA funcional no Tauri real:

- `npm.cmd run tauri:dev` abriu o client desktop usando o save SQLite real da guilda.
- A Topbar abriu o Guild Field Codex em modo amplo, sem roster, menu lateral ou painel direito.
- O hall exibiu os 34 registros esperados: cinco vocacoes, 22 field records e sete system guides.
- As cinco categorias renderizaram corretamente; o filtro Exploration mostrou seus 22 registros.
- A busca por `sewer` retornou quatro resultados e selecionou automaticamente o dossier Sewers Below Thaeron.
- O dossier exibiu categoria, resumo, facts e orientacoes coerentes com o registro selecionado.
- Save/Reload retornou o Codex para All Records, busca vazia, 34/34 visiveis e dossier Guild Command.

QA de persistencia:

- O banco original foi protegido antes dos cliques e comparado semanticamente antes e depois do fluxo.
- Abrir, filtrar, pesquisar e selecionar registros nao alterou guilda, personagens, skills, inventario ou activity logs.
- Save/Reload preservou 674 gold, cinco personagens, 35 skills, 26 linhas de inventario e dez logs.
- Somente timestamps tecnicos de `save_metadata` foram atualizados durante o teste, como esperado.
- `PRAGMA integrity_check` retornou `ok` antes e depois do fluxo.
- Ao final, o SQLite original foi restaurado com SHA-256 `7F5F9FCD02E2559F25E5399AA6018EEBDFE5D8766DDFFCF16FD47DE51973F217`.

Resultado:

- Nenhum bug funcional, visual ou de persistencia do Guild Codex foi encontrado.
- Nenhum arquivo de codigo precisou ser alterado; somente esta documentacao foi atualizada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- O QA interativo foi realizado no viewport desktop do Tauri; a responsividade mobile ja havia sido validada no browser local durante a Etapa 44.
- Textos dos oito guias curados continuam locais e manuais, sem favoritos, historico ou links diretos para outros halls.

Proximo passo sugerido:

- Etapa 45 - Rework de Settings / preferencias locais do client.

## Etapa 45 - Rework de Settings / preferencias locais do client

Status: concluida.

Settings local:

- Settings agora abre como hall amplo, sem roster, menu lateral ou painel direito.
- Preferencias de densidade, escala de texto, reducao de movimento, Activity e controles de save aplicam imediatamente.
- O jogador pode escolher Character Hall, Explore ou Guild Codex como tela inicial.
- A restauracao opcional da ultima tela usa somente rotas seguras do client.
- Save, Reload e Reset da guilda continuam disponiveis em uma area separada e usam os handlers SQLite existentes.

Modelo e persistencia:

- `src/client-preferences/clientPreferences.ts` centraliza tipos, defaults, normalizacao e acesso defensivo ao `localStorage`.
- Preferencias do client e ultima tela usam chaves locais versionadas e nao entram no save da guilda.
- Dados invalidos, storage indisponivel ou preferencia antiga recebem defaults seguros sem quebrar a inicializacao.
- Nenhum tipo de gameplay, schema, migration ou repository SQLite foi alterado.
- A Etapa 45 foi adicionada como release atual no arquivo local de Updates.

QA executado:

- `npm run build` passou durante a implementacao.
- Settings foi aberto no browser local e os controles de densidade, escala, movimento, Activity e Topbar foram exercitados.
- Reload preservou as preferencias; Restore client defaults reativou os controles e paineis padrao.
- O layout foi revisado em desktop e em viewport de 390x844, sem overflow horizontal.
- O erro de `invoke` do plugin SQL observado no Vite e esperado fora do runtime Tauri; o mock local foi carregado.

Limitacoes:

- O QA interativo desta etapa foi feito no Vite/browser, nao no executavel Tauri.
- A persistencia SQLite da guilda nao mudou e nao foi modificada durante os testes das preferencias locais.
- As preferencias sao locais por instalacao e nao sincronizam entre dispositivos.

Proximo passo sugerido:

- Etapa 45.5 - QA do Settings no Tauri/SQLite.

## Etapa 45.5 - QA do Settings no Tauri/SQLite

Status: concluida.

QA funcional no Tauri real:

- `npm.cmd run tauri:dev` iniciou Vite, compilou o target Rust e abriu `guild-hunt-idle.exe`.
- Settings abriu em modo amplo com o save real carregado: 674 gold e cinco aventureiros.
- Compact, escala 110%, Reduce motion, Show activity feed e Topbar save controls responderam sem quebrar o layout.
- `Save now` gravou o save real e `Reload save` voltou ao Character Hall mantendo as preferencias locais.
- Fechar e reabrir o Tauri preservou densidade, escala, movimento reduzido e paineis opcionais.
- Configurar Guild Codex como tela inicial fez o app reabrir diretamente na Wiki.
- Restore client defaults voltou para Comfortable, 100%, movimento normal, Activity e controles da Topbar ativos, com Character Hall como tela inicial.

QA de SQLite:

- O banco original foi protegido antes dos cliques com backup SQLite consistente.
- `PRAGMA integrity_check` retornou `ok` antes e depois do fluxo.
- O teste preservou 674 gold, cinco personagens, 35 skills e 26 linhas de inventario.
- O log criado por `Save now` e timestamps tecnicos foram removidos ao restaurar o banco protegido.
- A comparacao final de todas as colunas e linhas confirmou igualdade semantica entre o SQLite restaurado e o backup: dez logs e uma linha de metadata originais.
- Preferencias do client permaneceram fora do banco da guilda, conforme o modelo da Etapa 45.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado.
- Nenhum arquivo de codigo precisou ser alterado; somente esta documentacao foi atualizada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- O efeito visual de ocultar Activity foi confirmado pelo estado do controle e pelo QA browser anterior; o Character Hall amplo nao renderiza o painel direito durante essa verificacao Tauri.
- Restore last screen nao foi repetido no Tauri; a tela inicial explicita e a persistencia apos reinicio foram exercitadas diretamente.
- As preferencias continuam locais por instalacao, sem sincronizacao entre dispositivos.

Proximo passo sugerido:

- Etapa 46 - Polimento geral do client e primeira sessao.

## Etapa 46 - Polimento geral do client e primeira sessao

Status: concluida.

Guild Briefing:

- Character Hall ganhou uma faixa de comando com uma unica proxima acao clara para o personagem selecionado.
- O ciclo inicial mostra tres marcos: primeira hunt curta, venda do loot e conclusao de `First Contract`.
- O CTA abre diretamente Hunts, Quick Sell, Quests, Action ou Blessings/recuperacao conforme o estado real.
- Personagens ocupados apontam para a acao atual; personagens mortos apontam para recuperacao; personagens avancados recebem a proxima hunt como ordem operacional.
- A Home legada reutiliza a mesma regra e nao pode divergir do Character Hall.

Modelo e compatibilidade:

- `src/game-engine/onboarding/getGuildBriefing.ts` concentra a derivacao de progresso e da proxima rota.
- Progresso usa level, bestiary, inventario, quests concluidas, status atual e logs de venda ja persistidos.
- Nenhum campo de tutorial, migration, schema ou repository SQLite foi adicionado.
- Saves antigos recebem o briefing automaticamente a partir dos dados que ja possuem.
- A Etapa 46 foi adicionada como release atual no arquivo local de Updates.

QA executado:

- `npm.cmd run build` passou antes e depois do refinamento do Activity Log.
- Browser local abriu o starter Arkon level 1 com `Run the first field assignment` e progresso 0/3.
- O CTA `Choose starter hunt` abriu Explore diretamente na lista de Hunts com Sewers Below Thaeron disponivel.
- Ayla em training mudou a ordem para `Resolve the current action` com CTA `View action`.
- Em 1440x1000, o briefing ocupou 1379x132 sem overflow horizontal ou interno.
- Em 720x980, comando, CTA e tres marcos reorganizaram em coluna sem overflow horizontal.
- O unico erro de console foi o `invoke` esperado do plugin SQL no Vite fora do runtime Tauri; o mock local foi usado.

Limitacoes:

- O QA interativo desta etapa foi feito no Vite/browser, nao no executavel Tauri.
- O marco de venda depende do log `Market sale` ou da ausencia de loot vendavel apos experiencia de campo; logs antigos removidos podem ser inferidos pelo estado atual.
- O briefing orienta o loop existente e nao adiciona tutorial narrado, recompensas extras, bloqueios artificiais ou alteracao de balanceamento.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 46.5 - QA da primeira sessao no Tauri/SQLite.

## Etapa 46.5 - QA da primeira sessao no Tauri/SQLite

Status: concluida.

QA funcional no Tauri real:

- `npm.cmd run tauri:dev` iniciou Vite, compilou o target Rust e abriu `guild-hunt-idle.exe` com o plugin SQLite ativo.
- O save real carregou 674 gold, cinco aventureiros e Arkon em hunt; o briefing mostrou `Resolve the current action`, `Field assignment` concluida e progresso `1/3`.
- `View action` abriu o `Action Analyzer` da hunt real.
- Trocar para Ayla em training recalculou o briefing imediatamente para `View action` com progresso `3/3`.
- Lyra idle mostrou `Push the next unlocked hunt`; o CTA abriu Explore com Sewers Below Thaeron disponivel.
- Um fixture temporario de primeiro login mostrou Arkon idle, `Run the first field assignment`, CTA `Choose starter hunt` e progresso `0/3`.
- O CTA inicial abriu Explore diretamente na lista de Hunts.
- Um fixture com Rat Tail pendente mostrou `Settle the field loot`, CTA `Open Quick Sell` e progresso `1/3`.
- Quick Sell vendeu Rat Tail x6 por 12 gold e criou os logs reais de `Market sale`.
- O briefing avancou para `Register the First Contract`, CTA `Open quests` e progresso `2/3`.
- `Open quests` abriu a tela de Quests com `First Contract` level 1 disponivel.
- `Reload` manteve 686 gold, Rat Tail removido, logs de venda e briefing em `2/3` no fixture.

Protecao e validacao do SQLite:

- O banco original foi copiado com o Tauri fechado antes de qualquer fixture.
- `PRAGMA integrity_check` retornou `ok` antes, durante e depois dos testes.
- O fixture persistido confirmou 686 gold, zero linhas de Rat Tail para Arkon e dois logs `Market sale`.
- Ao final, o banco protegido foi restaurado byte a byte; o SHA-256 do arquivo restaurado ficou identico ao backup.
- O save final voltou a 674 gold, cinco personagens, 35 skills, 26 itens, dez logs e uma linha de metadata.
- Arkon voltou ao estado original: level 1, 126 XP e hunt ativa.

Resultado:

- Nenhum bug funcional, visual ou de persistencia do Guild Briefing foi encontrado.
- Nenhum arquivo de codigo precisou ser alterado; somente esta documentacao foi atualizada.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- O estado de personagem morto e o CTA de recuperacao nao foram montados como fixture nesta rodada.
- `First Contract` foi validado como destino disponivel, mas nao foi concluido para evitar ampliar desnecessariamente a mutacao temporaria do save.
- A automacao interagiu diretamente com o DOM do WebView2 do processo Tauri; a janela estava em outro desktop virtual durante parte do QA.

Proximo passo sugerido:

- Etapa 47 - Jornada inicial guiada e contratos de progressao.

## Etapa 47 - Jornada inicial guiada e contratos de progressao

Status: concluida.

Jornada da guilda:

- O Quest Ledger agora organiza dez contratos em tres capitulos: `Guild Registration`, `Thaeron Fieldwork` e `Expedition Command`.
- Cada capitulo mostra faixa de level, progresso proprio e os contratos na ordem narrativa.
- O comando superior destaca o proximo contrato real; contratos concluidos, ativos, disponiveis e bloqueados possuem acoes distintas.
- O dossier lateral resume level, duracao, risco e recompensa do proximo objetivo, junto do registro de acessos ja liberados.
- Prerequisitos agora exibem o nome do contrato anterior em vez de IDs internos.

Contratos e progressao:

- Foram adicionados `Cellar Survey`, `Trollwood Supply Line` e `Broodmother Writ` com recompensas pequenas de gold, XP e renown.
- A cadeia completa conecta `First Contract`, os acessos de Thaeron, o primeiro boss e as permissoes de Ancient Crypt, Khazgrim e Ember Dragon Nest.
- O Guild Briefing aponta para o proximo contrato quando o personagem cumpre o level; abaixo do level, direciona para Hunts para preparacao.
- Quests ja concluidas em saves antigos continuam concluidas mesmo quando a nova cadeia possui prerequisitos anteriores.

Persistencia e compatibilidade:

- A jornada deriva `completedQuestIds`, `questProgress`, `currentAction`, level e acessos que ja existiam no save.
- Nenhum tipo persistido, schema, migration, mapper ou repository SQLite foi alterado.
- Saves antigos recebem a ordem guiada automaticamente, sem reset de progresso e sem flag de tutorial.
- A Etapa 47 foi adicionada como release atual no arquivo local de Updates.

QA executado:

- `npm.cmd run build` passou antes e depois da implementacao.
- Browser local mostrou dez contratos e tres capitulos, com `First Contract` como proximo objetivo do starter Arkon.
- Motivos de bloqueio por level e o nome do contrato anterior foram exibidos corretamente.
- Trocar para `Thaeron Fieldwork` mostrou os tres contratos esperados na ordem correta.
- `Start contract` iniciou `First Contract` e mudou diretamente para o `Action Analyzer`.
- Em 1440x1000, o painel ocupou a area disponivel sem overflow horizontal.
- Em 760x900, capitulos, contratos e dossier foram reorganizados em uma coluna sem overflow horizontal.
- O unico erro de console foi o `invoke` esperado do plugin SQL no Vite fora do runtime Tauri; o mock local foi usado.

Limitacoes:

- O QA interativo desta etapa foi feito no Vite/browser, nao no executavel Tauri.
- O ciclo completo de dez contratos nao foi concluido interativamente nesta rodada; encadeamento e estados foram validados por dados, engine, UI e build.
- Os contratos usam a apresentacao textual e os icones internos atuais; nao foram adicionados assets externos.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 47.5 - QA da jornada guiada no Tauri/SQLite.

## Etapa 47.5 - QA da jornada guiada no Tauri/SQLite

Status: concluida com duas correcoes reais.

QA funcional no Tauri real:

- `npm.cmd run tauri:dev` iniciou Vite, compilou o target Rust e abriu `guild-hunt-idle.exe` com o plugin SQLite ativo.
- Lyra carregou com `Cellar Survey` como proximo contrato e progresso `1/10`.
- Iniciar o contrato mudou Lyra para `Questing` e abriu diretamente o `Action Analyzer`.
- `Save` e `Reload` preservaram `quest_progress_json`, `current_action_json`, timestamps e o estado `Questing`.
- Concluir `Cellar Survey` avancou o ledger para `Sewer Clearance` com progresso `2/10`.
- Concluir `Sewer Clearance` avancou para `Trollwood Supply Line` com progresso `3/10`.
- O Guild Briefing abriu a jornada diretamente no proximo contrato elegivel.
- A `Mudrot Investigation` antiga da Mira continuou `in progress` e coletavel mesmo sem os novos prerequisitos anteriores.
- O reload final do fixture nao produziu erros de console no WebView2.

Bugs encontrados e corrigidos:

- `Expedition Command` era truncado na aba do terceiro capitulo em 1280x800; o titulo agora quebra em duas linhas sem overflow.
- Qualquer quest concluida liberava `Cave Delver`; o unlock agora ocorre apenas em quest do tipo `access`.
- `Cellar Survey`, do tipo tutorial, foi concluida sem liberar o outfit.
- `Sewer Clearance`, do tipo access, liberou `Cave Delver` e atualizou o badge de Collections.

Validacao do SQLite:

- O banco original foi copiado com o Tauri fechado e protegido pelo SHA-256 `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- `PRAGMA integrity_check` retornou `ok` antes, durante e depois dos testes.
- O fixture persistiu os dois contratos concluidos, 1.344 gold, 15 renown, 247.800 XP para Lyra e `outfit-cave-delver` desbloqueado.
- O processo Tauri foi encerrado antes da restauracao; sidecars WAL/SHM do fixture foram removidos com o banco fechado.
- O arquivo original foi restaurado byte a byte e seu SHA-256 final ficou identico ao backup.
- O save final voltou a 674 gold, 12 renown, cinco personagens, 35 skills, 26 itens, dez logs e uma linha de metadata.
- Lyra voltou idle somente com `First Contract` concluido, sem quest progress e sem `Cave Delver` desbloqueado.

Validacao tecnica:

- `npm.cmd run build` passou antes do QA.
- O build final passou depois das correcoes.
- `git diff --check` nao encontrou erros de whitespace.
- Permanece apenas o aviso conhecido do chunk JavaScript acima de 500 kB.

Limitacoes:

- Foram concluidos os tres primeiros contratos da cadeia; os capitulos avancados foram validados por dados, estados e compatibilidade, nao por uma campanha completa.
- Cenarios de falha e morte em quest nao foram forçados nesta rodada.
- O QA visual foi realizado na janela Tauri de 1280x800; os breakpoints menores ja haviam sido validados no browser durante a Etapa 47.

Proximo passo sugerido:

- Etapa 48 - Guild Achievements e marcos de carreira.

## Etapa 48 - Guild Achievements e marcos de carreira

Status: concluida.

Career Ledger:

- O Hall of Renown agora alterna entre `Roster Standings` e `Career Ledger` sem remover o ranking local existente.
- O catalogo possui 18 achievements em seis categorias: Guild Growth, Contracts, Hunting, Mastery, Collections e Legacy.
- Cada record possui tier bronze, silver ou gold, sigil, objetivo, progresso atual e pontos de carreira.
- O dossier lateral mostra descricao, categoria, tier, valor atual, alvo e percentual do record selecionado.
- Filtros por categoria mostram contagem concluida e total sem esconder o resumo geral da carreira.

Ranks e metricas:

- Cinco ranks formam a progressao: Apprentice Company, Chartered Guild, Proven Vanguard, Renowned Banner e Legendary Company.
- O catalogo distribui 930 pontos maximos; pontos sao somente um registro local e nao podem ser gastos.
- As metricas usam roster, levels combinados, XP combinado, contratos unicos, acessos unicos, kills, Bestiary concluido, maior skill, Collections, Daily claims, renown e guild.gold.
- Contratos e acessos sao deduplicados entre personagens para evitar contar o mesmo marco varias vezes.
- Valores invalidos, negativos ou NaN sao normalizados para zero na engine.

Persistencia e compatibilidade:

- Achievements sao derivados de campos permanentes que ja existem no SQLite.
- Nenhum campo de Guild, tabela, migration, mapper ou repository persistente foi adicionado.
- Saves antigos recebem automaticamente os records correspondentes ao progresso ja salvo.
- Nao existe claim, recompensa de gold, moeda paga, premium, ranking online ou log artificial de unlock.
- O Guild Codex e o arquivo local de Updates foram atualizados com o Career Ledger.

QA executado:

- `npm.cmd run build` passou durante a implementacao.
- O browser local manteve o Roster Standings funcional e abriu o Career Ledger pela nova navegacao.
- O mock da Guilda Aurora calculou 8/18 records, 295/930 pontos e rank `Chartered Guild`.
- O proximo rank foi calculado como `Proven Vanguard`, faltando 55 pontos.
- Filtro Hunting mostrou exatamente tres records e atualizou o dossier para `First Field Marks`.
- Selecionar `Studied Quarry` atualizou status e progresso para `In progress / 0%`.
- Em 1440x1000, o workspace usou duas colunas e nao apresentou overflow horizontal.
- Em 760x900, categorias, cards e dossier passaram para uma coluna sem overflow horizontal.
- O unico erro de console foi o `invoke` esperado do plugin SQL no Vite fora do runtime Tauri; o mock local foi usado.

Limitacoes:

- O QA interativo desta etapa foi feito no Vite/browser, nao no executavel Tauri.
- A captura compacta expirou no controlador do browser; breakpoints, dimensoes e ausencia de overflow foram validados diretamente pelo DOM.
- Achievements acompanham apenas metricas duraveis ja persistidas; historicos removidos do Activity Log nao sao usados como fonte.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 48.5 - QA do Career Ledger no Tauri/SQLite.

## Etapa 48.5 - QA do Career Ledger no Tauri/SQLite

Status: concluida.

Validacao no runtime real:

- O executavel Tauri foi aberto com o save SQLite real da Guilda Aurora, sem mock de browser.
- O Roster Standings permaneceu funcional e o Career Ledger abriu pela navegacao do Hall of Renown.
- O save real calculou rank `Chartered Guild`, 8/18 records, 295/930 pontos e 55 pontos ate `Proven Vanguard`.
- As categorias exibiram Guild Growth 3/3, Contracts 1/3, Hunting 0/3, Mastery 2/3, Collections 1/3 e Legacy 1/3.
- O filtro Hunting mostrou exatamente `First Field Marks`, `Hunter's Ledger` e `Studied Quarry`.
- O dossier de `Studied Quarry` mostrou `In progress`, 0/1 e 0%; `Chartered Company` mostrou `Recorded`, 5/5 e 100%.
- Save e Reload preservaram rank, pontos e contagem sem erros de console ou page errors.

SQLite e seguranca do save:

- O banco original foi copiado antes do QA e protegido por SHA-256.
- O snapshot semantico de guilda, personagens e skills permaneceu identico antes e depois do Save/Reload: `692A045BF47D4094019F25C4D9AD50A3C007E43E70214DE84A686D3A20E3DA11`.
- `PRAGMA integrity_check` retornou `ok` durante o QA e depois da restauracao.
- O banco foi restaurado ao SHA-256 original `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`, sem arquivos `-wal` ou `-shm` remanescentes.
- As contagens finais voltaram a 1 guilda, 5 personagens, 35 skills, 26 itens, 10 logs e 1 registro de metadata.

QA visual:

- A captura real do WebView2 em 1280x800 nao apresentou overflow horizontal, sobreposicao incoerente ou truncamento nos titulos dos achievements.
- Cards, filtros e dossier permaneceram legiveis dentro do workspace com scroll vertical interno.
- Nenhum bug de implementacao foi encontrado; esta etapa alterou apenas a documentacao.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB no build.

Proximo passo sugerido:

- Etapa 49 - Guild Titles e identidade de carreira derivados dos achievements.

## Etapa 49 - Guild Titles e identidade de carreira

Status: concluida.

Modelo e desbloqueios:

- O Hall of Renown ganhou a terceira visao `Guild Identity`, preservando Roster Standings e Career Ledger.
- O catalogo possui 12 titulos proprios, sem assets externos: nove dependem de achievements especificos e tres exigem 350, 600 ou 850 career points.
- Cada titulo possui sigil, categoria, descricao e requisito explicito; filtros separam All Titles, Available e Locked.
- A engine recalcula disponibilidade a partir do Career Ledger e rejeita IDs inexistentes, bloqueados ou inconsistentes.
- O save real da Guilda Aurora desbloqueou cinco titulos: The Chartered, Seasoned Company, Contract Keepers, Disciplined Company e Recognized Banner.

Identidade e interface:

- O banner preview mostra guilda, titulo equipado, descricao, career rank, titulos disponiveis e career points.
- O dossier mostra categoria, requisito, estado, nameplate preview e comandos Equip/Unequip.
- O titulo equipado aparece na topbar junto ao nome da guilda e atualiza imediatamente.
- Titulos sao cosmeticos locais: nao concedem atributos, gold, moeda paga, premium, ranking online ou recompensa resgatavel.

Persistencia e compatibilidade:

- `Guild` recebeu `careerIdentity` com apenas `activeTitleId`; o estado antigo ou invalido normaliza para nenhum titulo.
- A migration aditiva cria `guilds.career_identity_json` com default seguro `{}`.
- Mapper, repository, mock inicial e autosave persistem a identidade sem alterar os dados derivados dos achievements.
- A topbar valida novamente o titulo equipado contra os requisitos atuais antes de exibi-lo.

QA executado:

- `npm.cmd run build` passou apos a implementacao.
- O Tauri real abriu o save antigo, aplicou a migration e exibiu 12 titulos, sendo 5 disponiveis e 7 bloqueados.
- `Wardens of the Roads` permaneceu bloqueado e seu botao Equip ficou disabled.
- O filtro Available mostrou exatamente cinco titulos.
- `Contract Keepers` foi equipado, apareceu no banner e na topbar e permaneceu ativo apos Reload.
- A coluna SQLite persistiu `{"activeTitleId":"title-contract-keepers"}` e `PRAGMA integrity_check` retornou `ok`.
- O WebView2 em 1280x800 nao apresentou overflow horizontal ou sobreposicao incoerente; nenhum erro de console/page error foi registrado no fluxo final.
- O banco real foi restaurado ao SHA-256 original `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`, sem arquivos `-wal` ou `-shm`.

Limitacoes:

- Titulos usam sigils tipograficos e cores do client; nao ha editor livre de brasao ou upload de imagem.
- A identidade pertence a guilda inteira, nao a personagens individuais.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 49.5 - QA de Guild Titles e Career Identity no Tauri/SQLite.

## Etapa 49.5 - QA de Guild Titles e Career Identity no Tauri/SQLite

Status: concluida.

Migration e compatibilidade:

- O baseline real era um save anterior a Etapa 49, sem a coluna `career_identity_json`.
- O Tauri aplicou a migration aditiva, preservou todas as tabelas e inicializou a identidade como `{"activeTitleId":null}`.
- Um fixture com `activeTitleId` inexistente carregou sem erro, nao apareceu na topbar nem no banner e foi limpo para `null` no Save seguinte.
- `PRAGMA integrity_check` retornou `ok` durante a migration, durante os testes e apos a restauracao.

UI e regras:

- All Titles mostrou 12 registros, Available mostrou 5 e Locked mostrou 7 no save da Guilda Aurora.
- `Wardens of the Roads` permaneceu bloqueado e o comando Equip ficou disabled.
- `Contract Keepers` foi equipado uma unica vez mesmo com clique duplo rapido.
- O titulo apareceu imediatamente no banner e na topbar e permaneceu ativo depois de Save/Reload.
- Unequip tambem resistiu a clique duplo, removeu o titulo da topbar e persistiu depois do Reload.
- Cada acao valida gerou apenas um Activity Log; nao houve duplicacao de identidade ou log.

Regressao e ausencia de bonus:

- Guilda, cinco personagens, 35 skills e 26 itens permaneceram byte-equivalentes semanticamente ao baseline nos campos de gameplay.
- Gold, renown, attributes, levels, XP, quests, accesses, Bestiary, Collections, Daily, inventarios e equipamentos nao mudaram ao equipar ou remover titulo.
- Roster Standings permaneceu com 5 aventureiros e 899.4K combined XP.
- Career Ledger permaneceu com rank `Chartered Guild`, 8/18 records e 295/930 pontos.
- Guild Identity permaneceu com 5/12 titulos disponiveis e 295 career points.

QA visual e runtime:

- O WebView2 real em 1280x800 nao apresentou overflow horizontal, sobreposicao incoerente ou texto de titulo fora dos cards.
- Filtros, cards, banner, dossier, topbar e comandos permaneceram legiveis.
- Nenhum console error ou page error foi registrado nos fluxos finais.
- Nenhum bug de implementacao foi encontrado; esta etapa alterou apenas a documentacao.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB no build.

Protecao do banco:

- O save original foi copiado antes dos testes e restaurado apos encerrar toda a arvore do Tauri.
- O SHA-256 final voltou a `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- As contagens finais voltaram a 1 guilda, 5 personagens, 35 skills, 26 itens e 10 logs, sem arquivos `-wal` ou `-shm`.

Proximo passo sugerido:

- Etapa 50 - Guild Headquarters e facilities locais.

## Etapa 50 - Guild Headquarters e facilities locais

Status: concluida.

Facilities e progressao:

- A sede guild-wide possui War Room, Training Yard, Quartermaster e Contract Archive.
- Cada facility vai do level 0 ao 3, totalizando 12 niveis e cinco ranks visuais da sede: Founding Lodge, Guild Outpost, Established Hall, Guild Stronghold e Grand Headquarters.
- Upgrades usam apenas `guild.gold`; nao existe moeda nova, premium, pagamento real, timer pago ou aceleracao online.
- Level 1 nao exige career points, level 2 exige 150 e level 3 exige 350; custos individuais permanecem visiveis antes da confirmacao.
- A engine bloqueia facility inexistente, level maximo, gold insuficiente, career points insuficientes e valores invalidos.
- Clique duplo e spam sao protegidos no App para evitar debito ou log duplicado.

Bonus reais e limitados:

- War Room concede +1% de hunt XP por level, ate +3%.
- Training Yard concede +2% de training progress por level, ate +6%.
- Quartermaster reduz precos do Market NPC em 2% por level, ate 6%, com valor descontado exibido e pago.
- Contract Archive concede +1% de quest XP por level, ate +3%.
- Percentuais sao normalizados, aplicados em pontos unicos dos services e registrados nos logs de hunt/quest quando ativos.
- Nenhuma facility altera death risk, loot rarity, item drop, gold de venda, premium ou ranking online.

UI e navegacao:

- `Guild Hall` foi adicionado aos comandos de Character Details e `Guild` ao menu lateral.
- O hall amplo mostra rank da sede, 12 niveis totais, gold investido, guild gold, career points e ledger dos quatro bonus.
- Cards exibem facility, sigil, level e trilha de construcao; o dossier mostra beneficio atual, proximo bonus, custo e requisito.
- O botao Upgrade explica quando esta bloqueado por gold, career points ou level maximo.

Persistencia e compatibilidade:

- `Guild` recebeu `headquarters` com `facilityLevels` e `totalInvestedGold`.
- A migration aditiva cria `guilds.headquarters_json` com default `{}`; saves antigos normalizam todas as facilities para level 0.
- Mapper, repository, mock inicial e autosave persistem a sede sem alterar as demais estruturas.
- Levels invalidos, negativos, NaN ou acima de 3 sao normalizados para o intervalo seguro.

QA executado:

- `npm.cmd run build` passou durante a implementacao.
- O Tauri real abriu o save antigo, aplicou a migration e mostrou `Aurora Founding Lodge`, 0/12 levels e quatro facilities.
- Quartermaster recebeu level 1 com clique duplo: ocorreu um unico debito de 150g, um unico log e gold passou de 674g para 524g.
- O hall mudou para `Guild Outpost`, mostrou 1/12 levels, 150g investidos e bonus NPC de -2%.
- O Market NPC exibiu `Quartermaster -2%` e recalculou catalogo, unit price, total e gold restante.
- Save/Reload preservou facility, total investido, gold, rank e bonus.
- Checks deterministas nos modulos reais confirmaram treino 2.46 -> 2.61 com +6%, hunt 1200 -> 1236 com +3% e quest 120 -> 124 com +3%.
- O WebView2 em 1280x800 nao apresentou overflow horizontal ou sobreposicao incoerente no workspace.
- O banco real foi restaurado ao SHA-256 original `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`, com integridade `ok`, 5 personagens, 35 skills, 26 itens, 10 logs e sem sidecars.

Limitacoes:

- Headquarters possui quatro facilities fixas; nao ha construcao livre, decoracao arrastavel ou mapa 3D.
- Bonus afetam apenas recompensas concluidas depois do upgrade; resultados antigos nao sao recalculados.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 50.5 - QA de Guild Headquarters e facilities no Tauri/SQLite.

## Etapa 50.5 - QA de Guild Headquarters e facilities no Tauri/SQLite

Status: concluida sem regressao funcional encontrada.

Cobertura da engine:

- Estado `headquarters` ausente retorna as quatro facilities em level 0 e investimento 0.
- Levels negativos, fracionarios, textuais, acima de 3 e valores `NaN` foram normalizados para o intervalo seguro.
- Os cinco ranks foram conferidos nos totais 0, 1, 4, 8 e 12.
- Upgrade valido, gold insuficiente, career points insuficientes, facility desconhecida e level maximo foram testados.
- Bonus maximos permaneceram limitados a +3% hunt XP, +6% training progress, -6% NPC prices e +3% quest XP.

QA no Tauri/SQLite:

- O save original ainda nao possuia `headquarters_json`; a coluna foi removida no banco de teste e recriada pela migration ao reiniciar o Tauri.
- A migration preservou 1 guilda, 5 personagens, 35 skills, 26 itens e os demais dados existentes.
- O save migrado abriu como `Aurora Founding Lodge`, 0/12 levels, 0g investidos e quatro facilities inativas.
- JSON sintaticamente invalido voltou ao estado default sem quebrar o carregamento.
- JSON valido com levels -2, 1.9, 9 e `"2"` foi normalizado para 0, 1, 3 e 2; Save regravou somente valores seguros.
- Clique duplo no Quartermaster criou exatamente um upgrade, um debito de 150g e um activity log.
- O estado mudou de 674g para 524g, `Guild Outpost`, 1/12 levels, 150g investidos e -2% de NPC prices.
- Save/Reload preservou gold, level, rank, investimento e bonus.
- O proximo level exibiu corretamente o bloqueio `Requires 750g`.

Integracoes validadas:

- Market NPC exibiu `Quartermaster -2%`; Minor Health Potion x10 mudou de 300g para 290g, com unit price de 29g e saldo previsto de 234g.
- Hunt de 60 minutos mudou de 2.400 para 2.472 XP com +3%; a finalizacao mudou 42 para 43 XP e manteve gold e loot iguais.
- Training de 60 minutos mudou de 8.39% para 8.89% com +6%.
- First Contract mudou de 120 para 124 XP com +3%.
- Bonus negativos e `NaN` voltaram a zero; percentuais externos acima do limite foram cortados em 25% pelos services.

QA visual:

- WebView2 validado em 1280x800 e 860x700 sem overflow horizontal.
- Hero, ledger, quatro facility cards, dossier, custos e bloqueios permaneceram legiveis nos dois tamanhos.
- Nao foram encontrados erros de console durante o fluxo principal.

Protecao do banco:

- Toda a arvore do Tauri foi encerrada antes da restauracao.
- O banco original voltou ao SHA-256 `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- A integridade final voltou a `ok`, com 1 guilda, 5 personagens, 35 skills, 26 itens e 10 logs, sem sidecars.
- O backup original permanece legitimamente sem `headquarters_json`; a migration aditiva sera aplicada novamente na proxima abertura.

Resultado:

- Nenhum arquivo de gameplay precisou de correcao nesta QA.
- Permanece apenas o aviso conhecido de chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 51 - Guild Contracts Board e expedicoes locais.

## Etapa 51 - Guild Contracts Board e expedicoes locais

Status: concluida.

Quadro e contratos:

- Nova tela ampla `Guild Contracts Board`, acessivel por Character Details e pelo menu lateral.
- O quadro possui Supply Route Survey, Sewer Ledger Audit, Iron Road Escort, Marsh Recovery Detail, Northern Cache Search e Vanguard Frontier Survey.
- Cada posting mostra regiao, risco, duracao, custo, tamanho da equipe, poder recomendado e recompensas.
- Career Points e total de levels do Headquarters desbloqueiam contratos mais avancados.
- Apenas uma expedicao guild-wide pode permanecer ativa por vez.

Equipe e resolucao:

- O jogador seleciona de um a tres aventureiros de apoio; personagens mortos nao podem participar.
- Team power usa level, attack power e defense power permanentes do roster.
- A chance de sucesso fica entre 35% e 95% e responde ao poder recomendado de cada contrato.
- O `outcomeRoll` e calculado deterministicamente e salvo no momento do dispatch; Save/Reload nao pode rerrolar o resultado.
- Equipes de apoio nao alteram `Character.status` e nao interrompem hunts, training, quests ou boss actions pessoais.

Economia e recompensas:

- Dispatch consome `guild.gold` imediatamente e nunca usa moeda premium.
- Sucesso concede pequenas quantidades de `guild.gold`, renown e um material real.
- Old Cloth, Rat Tail, Iron Ore e Enchanted Dust usam itemIds existentes e seguem para o Guild Depot.
- `capacityUsed` do Guild Depot e recalculado apos a recompensa.
- Falha nao concede recompensa e nao devolve o custo do dispatch.

Persistencia e seguranca:

- `Guild` recebeu `expeditions`, contendo expedicao ativa, historico limitado aos ultimos 12 reports e totais de conclusao/sucesso.
- Migration aditiva cria `guilds.expeditions_json` com default `{}`.
- Saves antigos recebem estado vazio sem perder guilda, roster, inventarios ou logs.
- ContractId, datas, equipe, chance, roll, custos, historico e contadores sao normalizados no load/save.
- Clique duplo e spam de dispatch/collect sao bloqueados no App e novamente validados pela engine.

UI:

- Hero mostra status do board, reports concluidos, Career Points e Headquarters levels.
- Dispatch ativo mostra equipe, progresso, countdown e chance persistida.
- Dossier exibe briefing, recompensas, checkboxes da equipe, team power e readiness.
- Historico diferencia sucesso e falha e resume gold/renown recebidos.
- Layout segue o client MMORPG escuro, sem assets externos, monetizacao ou online.

QA executado:

- `npm.cmd run build` passou durante a implementacao.
- Save legado sem `headquarters_json` e `expeditions_json` recebeu as duas migrations no Tauri e carregou o board vazio.
- Testes deterministas cobriram estado invalido, contract inexistente, equipe morta/insuficiente, gold insuficiente, requisito de Headquarters, dispatch duplicado e coleta antecipada.
- Clique duplo no primeiro dispatch gerou um custo de 40g, um active run e um activity log; gold passou de 674g para 634g.
- Save/Reload preservou equipe Ayla/Lyra, 1.192 team power, 95% de chance e o mesmo `outcomeRoll`.
- Sucesso concedeu 110g, 1 renown e Old Cloth x2; gold foi para 744g e o stack do Guild Depot passou de 18 para 20.
- Segundo dispatch foi forçado ao ramo de falha no fixture de QA: gold ficou em 704g, sem recompensa, com report `No reward`.
- Historico, totais, Activity Log e SQLite permaneceram sem duplicacao.
- WebView2 em 1280x800 e 860x700 nao apresentou overflow horizontal ou erro de console.
- Banco original restaurado ao SHA-256 `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`, integridade `ok`, 1 guilda, 5 personagens, 35 skills, 26 itens, 10 logs e sem sidecars.

Limitacoes atuais:

- Existem seis contratos fixos e apenas uma expedicao simultanea.
- Nao ha cancelamento/recall; o report fica disponivel para coleta quando o timer termina.
- Expedicoes nao concedem XP pessoal, skill progress, loot aleatorio ou acesso regional.
- Nao ha calendario online, temporadas, premium, pagamento, aceleracao ou anti-cheat de relogio.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 51.5 - QA do Guild Contracts Board no Tauri/SQLite.

## Etapa 51.5 - QA do Guild Contracts Board no Tauri/SQLite

Status: concluida com dois hardenings reais.

Correcoes aplicadas:

- Active runs carregados agora mantem `successChance` estritamente entre 35% e 95%, igual a engine de dispatch.
- `endsAt` anterior ou igual a `startedAt` invalida a expedicao corrompida em vez de liberar coleta imediata.
- Equipes persistidas abaixo do minimo ou acima do maximo do contrato invalidam o active run.
- Chamada defensiva sem array de `assignedCharacterIds` retorna bloqueio seguro em vez de lancar excecao.
- Team power continua finito quando level, attack power ou defense power chegam corrompidos como `NaN`/infinito.

Matriz da engine:

- Estado ausente voltou para historico vazio e contadores zero.
- Chances -20 e 999 foram normalizadas para 35 e 95.
- Datas invertidas e Vanguard Frontier Survey com apenas um membro foram descartados.
- Vinte reports validos foram limitados aos doze primeiros; totais ficaram coerentes em 12 conclusoes e 6 sucessos no fixture.
- Equipe `null` retornou o bloqueio de minimo de membros sem quebrar o app.
- Atributos invalidos produziram team power seguro e chance finita.

QA no Tauri/SQLite:

- Save original sem `headquarters_json` e `expeditions_json` recebeu migrations aditivas e carregou com integridade `ok`.
- O board migrado mostrou seis postings, 0 conclusoes, dois contratos iniciais disponiveis e locks por Career/Headquarters nos demais.
- Iron Road Escort exibiu `Requires 1 Headquarters Level` e manteve Dispatch disabled.
- Checkboxes da equipe respeitaram limite 2/2 e recalcularam team power ao trocar Ayla por Mira.
- Clique duplo em Dispatch gerou um unico active run, custo de 40g, um log e gold 674g -> 634g.
- Equipe Lyra/Mira, run ID, 95% de chance e `outcomeRoll` 0.11879142071120441 permaneceram identicos apos Reload.
- Clique duplo em Collect gerou uma unica recompensa, um log, 110g, 1 renown e Old Cloth x2.
- O historico injetado com 15 reports exibiu/regravou somente 12, preservando `totalCompleted` 15 e `totalSucceeded` 8.
- `expeditions_json` sintaticamente invalido voltou ao estado 0/0 sem erro de console.
- Layout em 1280x800 e 860x700 permaneceu sem overflow horizontal.

Protecao do banco:

- Toda a arvore Tauri foi encerrada antes da restauracao.
- SHA-256 final voltou a `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- Integridade final `ok`, com 1 guilda, 5 personagens, 35 skills, 26 itens, 10 logs e zero sidecars.
- O banco original continua legitimamente legado, sem `expeditions_json`; a migration sera reaplicada na proxima abertura.

Limitacoes mantidas:

- Seis contratos fixos, uma expedicao simultanea e coleta manual.
- Sem cancelamento, XP pessoal, loot aleatorio, premium, online ou anti-cheat de relogio.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 52 - Guild Staff e specialists locais.

## Etapa 52 - Guild Staff e specialists locais

Status: concluida.

Especialistas:

- Scout Captain Mara Veld custa 250g, requer War Room level 1 e concede +5 pontos de chance em novas expedicoes.
- Guild Provisioner Oren Vale custa 500g, requer Quartermaster level 1 e 100 Career Points, reduzindo dispatch em 10%.
- Guild Envoy Elira Sorn custa 900g, requer Contract Archive level 2 e 200 Career Points, aumentando gold de sucesso em 10%.
- Field Medic Brother Cael custa 1.200g, requer Training Yard level 2 e 300 Career Points, adicionando 1 renown ao sucesso.

Regras e seguranca:

- Contratacoes sao permanentes, guild-wide e pagas somente com `guild.gold`.
- Apenas um especialista contratado pode ocupar o posto ativo; o posto tambem pode ser deixado vazio.
- O primeiro especialista contratado entra em servico automaticamente.
- Cada dispatch salva o `specialistId`, custo e chance efetivos; trocar o posto depois nao altera uma expedicao ativa.
- Runs antigos sem especialista continuam sem bonus na coleta, mesmo que um oficial seja designado posteriormente.
- Chance final continua limitada a 95% e desconto de dispatch possui teto defensivo de 25%.
- IDs invalidos, listas duplicadas, active specialist nao contratado, gold investido negativo e `NaN` voltam a um estado seguro.
- Clique duplo em contratar/designar e bloqueado no App e novamente validado pela engine.

UI e integracoes:

- Nova tela ampla `Guild Staff`, acessivel pelo menu lateral e Character Details.
- Headquarters, Contracts e Staff agora participam da restauracao opcional da ultima tela do cliente.
- Hero resume contratados, oficial de servico, investimento e Career Points.
- Quadro apresenta quatro candidatos; dossier mostra retainer, facility, carreira, bonus e estado da designacao.
- Expedicao ativa informa qual especialista foi congelado naquele dispatch.
- Contracts Board mostra custo, chance, gold e renown projetados com o oficial atual.
- Activity Log registra contratacoes, alteracoes de posto e bloqueios sem criar moeda ou recurso novo.

Persistencia:

- `Guild.staff` guarda `hiredSpecialistIds`, `activeSpecialistId` e `totalSpentGold`.
- Migration aditiva cria `guilds.staff_json` com default `{}`.
- Save/load normaliza o estado e mantem compatibilidade com bancos anteriores.
- `specialistId` tambem persiste no active run e no report historico da expedicao.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite.
- Matriz SSR do Vite validou normalizacao, requisito de facility, contratacao, bloqueio duplicado, designacao e quatro tipos de bonus.
- Scout Captain foi salvo no dispatch e elevou a chance do fixture para 60%.
- Guild Provisioner reduziu o dispatch inicial de 40g para 36g.
- Guild Envoy elevou a recompensa de sucesso de 110g para 121g.
- Expedicao iniciada sem especialista continuou em 110g apos um Envoy ser designado, confirmando ausencia de bonus retroativo.
- Staff Hall abriu no Vite com quatro cards, requisitos e comandos corretos.
- Layout em 1280x720 e 860x700 permaneceu sem overflow horizontal.
- SQLite/Tauri interativo fica reservado para a Etapa 52.5; o Vite standalone usa o fallback mock porque nao possui o runtime SQL do Tauri.

Limitacoes atuais:

- Quatro especialistas fixos e apenas um posto ativo.
- Sem salarios recorrentes, demissao, cooldown de troca, arvore de talentos ou nivel de especialista.
- Sem premium, pagamento, online, aceleracao ou moeda nova.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 52.5 - QA do Guild Staff no Tauri/SQLite.

## Etapa 52.5 - QA do Guild Staff no Tauri/SQLite

Status: concluida sem regressao funcional encontrada.

Cobertura da engine:

- Estado ausente, `null`, IDs desconhecidos, duplicatas, active specialist nao contratado e investimento invalido voltaram a defaults seguros.
- Requisitos de facility, Career Points e `guild.gold` bloquearam contratacoes invalidas com mensagens corretas.
- Contratacao repetida nao debitou gold novamente e designacao de especialista nao contratado foi recusada.
- Limpar um posto ativo funcionou uma vez; segunda tentativa foi bloqueada sem mutacao.
- Descontos negativos e `NaN` voltaram a zero; desconto externo extremo foi limitado a 25%.
- Field Medic persistiu no run e elevou a recompensa do fixture de 1 para 2 renown sem alterar gold.

Migration e contratacao no Tauri/SQLite:

- O save original nao possuia `career_identity_json`, `headquarters_json`, `expeditions_json` nem `staff_json`.
- O Tauri criou todas as colunas aditivas e preservou 1 guilda, 5 personagens, 35 skills, 26 itens e 10 logs.
- Staff iniciou em 0/4, posto vazio e 0g investidos.
- Clique duplo no War Room criou um unico level, um debito de 250g e um log; gold passou de 674g para 424g.
- Clique duplo em contratar Mara Veld criou um unico contratado, um debito de 250g e um log; gold passou para 174g.
- O primeiro contratado entrou automaticamente em servico e o Hall mostrou 1/4, Scout Captain e 250g investidos.

Integracao com Guild Contracts:

- Equipe reduzida para somente Arkon exibiu 102 power e 60% de chance, incluindo os 5 pontos da Scout Captain.
- Clique duplo em Dispatch gerou um active run, custo de 40g, um log e gold 174g -> 134g.
- Run persistiu `specialistId: scout_captain`, team power 102, chance 60% e o mesmo `outcomeRoll`.
- Limpar o posto durante a expedicao nao alterou o run; Save/Reload continuou exibindo Mara Veld vinculada e chance de 60%.
- Coleta por clique duplo gerou um unico report de falha, sem reward ou refund, mantendo `specialistId` no historico.
- Staff, dispatch e coleta produziram exatamente um log cada, sem duplicacao.

JSON e interface:

- `staff_json` sintaticamente invalido voltou a 0/4, posto vazio e 0g investidos sem erro de console.
- Save regravou o estado normalizado como JSON valido.
- Staff Hall mostrou quatro cards, requisitos, dossier, notice de expedicao e comandos de duty corretos.
- Layout em 1280x800 e 960x700 permaneceu sem overflow horizontal; cards e dossier mantiveram dimensoes estaveis.

Protecao do banco:

- Toda a arvore do Tauri e do WebView2 foi encerrada antes da restauracao definitiva.
- SHA-256 final voltou a `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- Integridade final `ok`, com 1 guilda, 5 personagens, 35 skills, 26 itens, 10 logs e zero sidecars.
- O banco original continua legitimamente legado, sem `staff_json`; a migration sera reaplicada na proxima abertura.

Resultado e limitacoes:

- Nenhum arquivo de gameplay precisou de correcao nesta QA.
- Permanecem quatro especialistas fixos, um posto ativo e ausencia de salarios, demissao, niveis, premium ou online.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 53 - Guild Treasury e ledger economico local.

## Etapa 53 - Guild Treasury e ledger economico local

Status: concluida.

Modelo e regras:

- `Guild.treasury` guarda `reservedGold`, totais historicos de deposito/saque e as 30 transferencias mais recentes.
- `guild.gold` continua sendo o saldo gastavel; depositar apenas move gold para a reserva protegida.
- Sacar devolve gold reservado ao saldo gastavel sem taxa, premio, juros ou renda passiva.
- Cada lancamento guarda id deterministico, direcao, valor inteiro, saldo reservado posterior e data ISO local persistida.
- A soma `guild.gold + treasury.reservedGold` permanece inalterada em toda transferencia valida.
- Valores fracionarios, negativos, `NaN`, saldos insuficientes, overflow e operacao duplicada sao bloqueados sem mutacao.
- Campos monetarios do Treasury e JSON antigos invalidos sao normalizados para defaults finitos e nao negativos.

UI e integracoes:

- Novo `Guild Treasury Hall` amplo, acessivel pelo menu lateral e pelo Character Details.
- O hero mostra saldo gastavel, reserva, patrimonio total e quantidade de lancamentos.
- Controle segmentado alterna entre Deposit e Withdraw, com input numerico, presets 100/500/1.000g e Max.
- Preview mostra o saldo reservado projetado antes da confirmacao.
- Ledger lista direcao, data, valor e saldo posterior; totais lifetime permanecem mesmo quando o historico e limitado.
- Topbar reflete imediatamente o saldo gastavel e Activity Log registra sucesso ou bloqueio.
- A tela participa da restauracao opcional da ultima view e esconde os paineis laterais para usar a area ampla.

Persistencia:

- Migration aditiva cria `guilds.treasury_json` com default `{}`.
- Save/load sempre normaliza o JSON antes de mapear ou persistir.
- Saves antigos sem Treasury recebem reserva 0g, totais 0g e ledger vazio.
- Reset mock tambem inicia com o estado completo e seguro.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite.
- Teste executavel da engine validou deposito 300g, saque 125g, total preservado em 1.000g, bloqueios e ledger com duas entradas.
- Vite abriu o Hall e uma transferencia de 100g alterou `420/0` para `320/100` com uma entrada.
- Clique duplo seguinte gerou apenas mais um deposito: `220/200` e duas entradas, sem terceira aplicacao.
- Saque de 100g retornou para `320/100`, manteve patrimonio 420g e atualizou lifetime para 200g depositados / 100g sacados.
- Layout desktop em 1440x900 e DOM mobile em 375px ficaram sem overflow horizontal.
- A captura desktop foi inspecionada; a captura mobile falhou por timeout do navegador, embora dimensoes e fluxo mobile tenham sido validados no DOM.
- O Vite standalone usou o fallback mock, pois nao possui o runtime SQL do Tauri; QA interativo real de migration/Save/Reload fica para a Etapa 53.5.

Limitacoes atuais:

- Ledger limitado aos 30 lancamentos mais recentes, com totais lifetime separados.
- Sem categorias, notas editaveis, metas, permissoes, juros, taxas, renda passiva, moeda nova, premium, pagamento ou online.
- A reserva protege apenas contra gastos normais que usam `guild.gold`; nao existe sistema de autorizacao por membro.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 53.5 - QA do Guild Treasury no Tauri/SQLite.

## Etapa 53.5 - QA do Guild Treasury no Tauri/SQLite

Status: concluida sem regressao funcional encontrada.

Cobertura da engine:

- Estado ausente, `null`, objeto vazio, `NaN`, negativos, strings invalidas e historico ausente voltaram a defaults seguros.
- Entradas sem id, tipo conhecido, valor positivo ou data valida foram descartadas sem quebrar o estado.
- Deposito e saque preservaram o patrimonio total; saldo insuficiente, fracao, zero, infinito e overflow foram bloqueados.
- Repeticao com o mesmo id temporal foi recusada sem mutacao.
- Fixture com 35 transferencias reteve as 30 mais recentes e preservou o total lifetime de depositos.

Migration e transferencias no Tauri/SQLite:

- O save original tinha 674g e nao possuia `career_identity_json`, `headquarters_json`, `expeditions_json`, `staff_json` nem `treasury_json`.
- O Tauri adicionou todas as colunas pendentes e iniciou Treasury com 0g reservado, totais 0g e ledger vazio.
- Migration preservou 1 guilda, 5 personagens, 35 skills, 26 itens, 10 logs e uma linha de metadata.
- Clique duplo em Deposit 100g produziu um unico debito: saldo gastavel 674g -> 574g, reserva 0g -> 100g, uma transacao e um log.
- Clique duplo em Withdraw 100g produziu um unico saque: saldo gastavel voltou a 674g, reserva voltou a 0g e apenas uma segunda transacao/log foi criada.
- O patrimonio permaneceu 674g durante deposito, saque e reload.
- Save/Reload preservou duas entradas, lifetime 100g/100g e integridade SQLite `ok`, sem reaplicar transferencias.

Normalizacao e interface:

- `treasury_json` sintaticamente invalido foi carregado como estado vazio e regravado automaticamente como JSON valido.
- Fixture de 35 entradas foi persistida com 30, mantendo `totalDeposited=1000`, `totalWithdrawn=650` e patrimonio 674g.
- Treasury Hall real exibiu saldos, patrimonio, `30/30`, controles e ledger no WebView Tauri.
- Captura maximizada confirmou a composicao ampla sem paineis laterais.
- Em 960x700, hero, quatro saldos e workspace permaneceram sem overflow horizontal; o conteudo inferior usa scroll vertical normal.
- Nenhum arquivo de gameplay precisou de correcao nesta QA.

Protecao do banco:

- Backup byte a byte foi criado fora do repositorio antes da primeira abertura do Tauri.
- SHA-256 original e final: `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- Banco final voltou a 674g, integridade `ok`, 1 guilda, 5 personagens, 35 skills, 26 itens, 10 logs e uma metadata.
- O banco original permanece legitimamente legado, sem `treasury_json`; a migration sera reaplicada na proxima abertura.
- Nao restaram processos do projeto, backup temporario, `-wal` ou `-shm`.

Limitacoes mantidas:

- Ledger limitado a 30 entradas com totais lifetime separados.
- Sem metas, categorias, permissoes, juros, taxas, renda passiva, premium, pagamento, moeda nova ou online.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 54 - Guild Projects locais.

## Etapa 54 - Guild Projects locais

Status: concluida.

Projetos e progressao:

- Field Supply Station possui tres fases por 500g, 6 Old Cloth e 4 Iron Ore no total; recompensa +5 renown e Quartermaster Seal.
- Cartographers' Archive requer o primeiro projeto e 100 Career Points; custa 950g, 10 Old Cloth, 5 Iron Ore e 1 Enchanted Dust; recompensa +8 renown e Guild Cartographer.
- Founders' Monument requer o Archive e 250 Career Points; custa 1.900g, 18 Iron Ore, 10 Old Cloth e 3 Enchanted Dust; recompensa +12 renown e Founders' Mark.
- Cada fase e financiada separadamente e a conclusao permanece guild-wide.
- Projeto concluido, prerequisito ausente e Career Points insuficientes sao bloqueados sem mutacao.

Economia e seguranca:

- Fases usam somente `guild.gold` gastavel; a reserva do Treasury nunca e consumida.
- Materiais sao retirados exclusivamente do Guild Depot.
- Stacks locked, quest items e inventarios/depots pessoais dos personagens sao ignorados.
- Custo e materiais sao validados antes da mutacao, evitando pagamento parcial.
- Clique duplo e bloqueado no App; a engine revalida fase, saldo, materiais, carreira e prerequisitos.
- Cosmético ja desbloqueado concede fallback fixo de +2 renown, sem duplicar Collection.
- Totais de gold investido, materiais doados, renown e contadores usam inteiros finitos com teto seguro.

UI e integracoes:

- Novo Guild Projects Hall amplo, acessivel pelo menu lateral e Character Details.
- Hero resume obras concluidas, Career Points, gold investido e materiais doados.
- Works Register mostra a cadeia, progresso e requisitos; dossier exibe as tres fases, custo atual, disponibilidade do Depot e recompensa.
- Activity Log registra fase, conclusao, bloqueio e novo Collection unlock sem spam.
- Novos cosmeticos locais: Quartermaster Seal, Guild Cartographer e Founders' Mark.
- Projects participa da restauracao opcional da ultima view e tambem possui entrada no Guild Field Codex e Updates.

Persistencia:

- `Guild.projects` guarda progresso por projeto, conclusoes e totais de contribuicao.
- Migration aditiva cria `guilds.projects_json` com default `{}`.
- Saves antigos recebem progresso vazio, zero projetos concluidos e totais 0.
- Save/load remove IDs desconhecidos, duplicatas e valores invalidos, limita fases ao tamanho real e recalcula `totalCompleted`.
- Guild Depot e Collections continuam persistidos pelos repositorios existentes.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite.
- Matriz executavel concluiu as tres fases da Field Supply Station por exatamente 500g e 10 materiais.
- Stacks finais passaram de Old Cloth 18 -> 12 e Iron Ore 12 -> 8; renown subiu +5 e Quartermaster Seal foi desbloqueado.
- Projeto seguinte sem prerequisito, material locked e novo pagamento em projeto concluido foram bloqueados.
- Vite confirmou clique duplo aplicando somente a primeira fase: 100g e 2 Old Cloth.
- Segunda fase custou 150g e 2 Iron Ore; terceira ficou disabled com mensagem `Requires 250g` quando o mock ficou com 170g.
- Layout em 1440x900 e DOM mobile em 375px ficaram sem overflow horizontal.
- Console mostrou apenas o fallback esperado do SQLite fora do runtime Tauri.

Limitacoes atuais:

- Tres projetos fixos, tres fases cada e cadeia linear.
- Sem contribuicao parcial, cancelamento, reembolso, projetos temporizados, votacao, permissoes ou projetos repetiveis.
- Sem bonus passivo, renda, premium, pagamento, moeda nova ou online.
- QA interativo completo de migration, Save/Reload e conclusao no Tauri fica para a Etapa 54.5.
- Permanece o aviso conhecido do chunk JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 54.5 - QA do Guild Projects no Tauri/SQLite.

## Etapa 54.5 - QA do Guild Projects no Tauri/SQLite

Status: concluida.

Migration e persistencia:

- O save legado abriu no Tauri e recebeu `projects_json` com estado vazio valido, preservando 674g, 12 renown, guilda, cinco personagens e inventarios existentes.
- A primeira fase da Field Supply Station persistiu imediatamente e permaneceu em 1/3 depois de Save/Reload.
- Clique duplo no financiamento aplicou uma unica fase: 674g -> 574g e Old Cloth do Guild Depot 18 -> 16.
- Um `projects_json` propositalmente corrompido foi normalizado e regravado com progresso e totais zerados, sem quebrar o app.

Conclusao e integracoes:

- Uma fixture temporaria colocou a Field Supply Station em 2/3 para validar a conclusao no Tauri.
- A fase final consumiu exatamente 250g, 4 Old Cloth e 2 Iron Ore do Guild Depot.
- Renown subiu de 12 para 17, o projeto foi marcado como 3/3 e os totais ficaram em 500g e 10 materiais.
- Quartermaster Seal entrou em `unlockedCollectionItemIds` e `newlyUnlockedCollectionItemIds`.
- O inventario pessoal da Lyra permaneceu com 9 Old Cloth, confirmando que materiais de personagens nao sao consumidos.
- O Activity Log recebeu uma entrada de conclusao e uma de Collection, sem duplicacao.

UI e responsividade:

- Guild Projects abriu pelo Character Details e exibiu corretamente carreira, cadeia, fases, custos, materiais e recompensas.
- A tela concluida foi validada em 960x700 sem overflow horizontal; a rolagem vertical permaneceu funcional.
- O estado recuperado de JSON invalido abriu normalmente no Tauri.

Restauracao e validacao final:

- `npm.cmd run build` passou com TypeScript e Vite antes do QA.
- O banco original foi protegido fora do repositorio e restaurado byte a byte ao final.
- SHA-256 original e final: `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- Nao restaram processos do projeto, backup temporario, `-wal` ou `-shm`.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Limitacoes do QA:

- A conclusao real foi exercitada na Field Supply Station; os dois projetos seguintes continuam cobertos pela mesma engine e pelas validacoes executaveis da Etapa 54.
- Nao foi feita uma sessao manual prolongada em todas as resolucoes e sistemas paralelos.

Proximo passo sugerido:

- Etapa 55 - Guild Recruitment Board local.

## Etapa 55 - Guild Recruitment Board local

Status: concluida.

Modelo e candidatos:

- Recruitment e guild-wide e usa o roster existente como fonte de verdade, sem criar novo estado paralelo ou coluna SQLite.
- Tessa Vale e uma Guardian level 4 por 300g e sem requisito de carreira.
- Corin Fletch e um Ranger level 7 por 650g e requer 100 Career Points.
- Elis Dawn e uma Warden level 10 por 1.100g e requer 250 Career Points.
- Cada candidato possui nome, vocation, level, cidade, skills, equipamento e supplies iniciais fixos.
- O roster possui limite conservador de oito aventureiros.

Engine e seguranca:

- O contrato desconta apenas `guild.gold` gastavel; Treasury, Depot e inventarios existentes permanecem intocados.
- Candidato inexistente, ja recrutado, roster cheio, Career Points insuficientes, gold insuficiente e timestamp invalido sao bloqueados sem mutacao.
- Recrutamento valido cria Character completo com atributos derivados, XP coerente com o level, stamina, skills, equipment, inventory e defaults vazios de progresso.
- IDs deterministas impedem duplicacao apos Save/Reload e o App possui trava adicional contra clique duplo.
- Novos membros entram idle, sem quests concluidas, acessos, boss cooldowns, depot pessoal ou bonus ocultos.

UI e integracoes:

- Novo Recruitment Board amplo, acessivel pelo menu lateral e pelo Character Details.
- Hero mostra roster, Career Points, candidatos disponiveis e contratos concluidos.
- Applicant Register mostra os tres candidatos e status Available, Locked ou Recruited.
- Dossier mostra role, cidade, custo, requisito, starter loadout e disciplinas iniciais.
- Ao recrutar, o novo personagem vira a selecao atual e aparece imediatamente no roster, painel direito e sistemas existentes.
- Activity Log registra um unico contrato valido ou o motivo do bloqueio.
- Recruitment participa da restauracao opcional da ultima view, Updates e Guild Field Codex.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite apos a correcao tipada de `SkillSet`.
- Smoke Vite abriu o Recruitment Board com 5/8 membros, 295 Career Points e Tessa disponivel por 300g.
- Clique duplo recrutou Tessa uma unica vez: `guild.gold` 420g -> 120g e roster 5 -> 6.
- O botao mudou para `Already Recruited`, ficou disabled e o Activity Log recebeu uma unica entrada.
- Tessa virou a personagem selecionada com level 4, Sword 18, Shielding 16, equipamento basico e Minor Health Potion x2.
- Character Details/Home mostrou seis personagens e todos os dados do novo membro.
- Em viewport de 375px, `scrollWidth` permaneceu igual ao viewport e o hall nao gerou overflow horizontal.

Limitacoes atuais:

- Tres candidatos fixos e permanentes, sem refresh, reroll, despedida, renomear, customizacao ou recrutamento procedural.
- Sem premium, pagamento, moeda nova, slots pagos, online ou multiplayer.
- Persistencia real de novo personagem, skills e itens no Tauri/SQLite fica para a Etapa 55.5.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 55.5 - QA do Guild Recruitment no Tauri/SQLite.

## Etapa 55.5 - QA do Guild Recruitment no Tauri/SQLite

Status: concluida.

Recrutamento real:

- O save original abriu no Tauri com 674g, 12 renown, cinco personagens, 35 skills, 26 itens e dez logs.
- Clique duplo em Tessa Vale aplicou um unico contrato de 300g: `guild.gold` 674g -> 374g e roster 5 -> 6.
- Foi criada uma unica linha `recruit-tessa-vale`, Guardian level 4, idle em Thaeron, stamina 42h, 800 XP e 700 XP ate o proximo level.
- Sete skills foram persistidas, incluindo Sword 18 e Shielding 16, todas com progresso inicial 0.
- Equipment persistiu Worn Sword, Wooden Shield e Leather Armor; inventory persistiu Minor Health Potion x2.
- Activity Log recebeu exatamente uma entrada `Adventurer recruited`.
- Renown, Treasury, Guild Depot e inventarios dos cinco personagens anteriores permaneceram intocados.

Save, reload e bloqueios:

- Save/Reload manteve 374g, um unico Tessa, sete skills, quatro itens e um log de recrutamento.
- Depois do reload, Tessa apareceu selecionada no Character Details e marcada como `Recruited` no board.
- Nova tentativa no candidato ja recrutado nao alterou gold, roster ou logs.
- Corin ficou `Locked` por saldo insuficiente apos o primeiro contrato, com requisito visivel `Requires 650g`.
- Fixture temporaria com oito personagens e 5.000g confirmou que roster 8/8 bloqueia Corin mesmo com gold e Career Points suficientes.
- A tentativa em roster cheio preservou 5.000g e nao criou `recruit-corin-fletch`.

UI e responsividade:

- Recruitment abriu pelo Character Details e exibiu roster, Career Points, disponibilidade, candidatos, loadouts e requisitos corretos.
- Character Details mostrou seis membros depois do contrato, com atributos derivados, equipment, skills e inventory de Tessa.
- O hall foi validado em 960x700 sem overflow horizontal e com rolagem vertical funcional.
- O estado 8/8 apresentou candidatos bloqueados e a mensagem `Guild roster is full (8/8)`.

Restauracao e comandos:

- `npm.cmd run build` passou com TypeScript e Vite antes da QA.
- `npm.cmd run tauri:dev` abriu o executavel desktop real do projeto.
- O backup temporario passou em `PRAGMA integrity_check` com resultado `ok` e manteve 5 personagens, 35 skills, 26 itens e dez logs.
- O banco original foi restaurado byte a byte com SHA-256 `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D`.
- Nao restaram processo do projeto, backup temporario, `-wal` ou `-shm`.

Limitacoes do QA:

- Corin e Elis nao foram efetivamente recrutados; seus bloqueios e dossiers foram validados pela mesma engine e interface.
- Candidato inexistente e timestamp invalido foram revisados na engine, sem fixture interativa dedicada.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 56.5 - QA da consolidacao offline e dos textos de economia/Store.

## Etapa 56 - Consolidacao da campanha totalmente offline

Status: concluida.

Direcao de produto:

- Guild Hunt Idle passa a ter uma unica direcao oficial: campanha privada single-player, com o jogador gerenciando uma guilda local.
- Roster, economia, acoes temporizadas, recompensas, progresso e configuracoes continuam persistidos no SQLite instalado.
- Nao existe conta, servidor, sincronizacao em nuvem, leaderboard remoto, troca entre jogadores ou Market de listings.
- O Market NPC permanece como loja fixa para compra, venda e Quick Sell.
- O antigo espaco conceitual de Market online foi substituido pela previsao de um Bazar Rotativo local, gerado pelo proprio jogo.

Store e visuais futuros:

- A Store foi reposicionada como arquivo/guarda-roupa da guilda para Outfits, Mounts e Avatars.
- Visuais futuros poderao ser obtidos com `guild.gold`, trofeus de bosses, itens de quests e outras conquistas locais.
- Cosmetics continuam integrados ao Collections e nao concedem ataque, defesa, XP, loot ou outro poder de gameplay.
- Esta etapa altera apenas direcao, nomenclatura e documentacao; trocas cosmeticas ainda nao foram implementadas.

Compatibilidade e limpeza:

- Nenhuma tabela, coluna, migration ou formato de save foi alterado.
- O estado TypeScript nao utilizado `completed_online` foi removido do fluxo de conclusao offline.
- O tipo obsoleto `ShopPaymentSource` foi removido; compras existentes continuam usando `guild.gold`.
- Textos ativos de Recruitment, Headquarters, Treasury, Ranking, Identity, Updates, Wiki e contratos agora descrevem positivamente a campanha local.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite; permaneceu apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- Smoke no Vite confirmou Store/Wardrobe com 15 registros, futura troca por gold/trofeus e regras sem poder de gameplay.
- Store e Codex foram verificados em 960x700 sem overflow horizontal ou textos cortados.
- O Codex destacou `Offline Guild Campaign`, economia `NPCs / local bazaar`, um guild manager e save local SQLite.
- O smoke web usa mock local porque o plugin SQLite existe apenas no Tauri; nenhuma operacao de escrita foi executada.

Limitacoes atuais:

- O Bazar Rotativo ainda nao possui ofertas, RNG, intervalo de dez minutos ou persistencia de rotacao.
- A Store ainda e um preview; custos, requisitos e confirmacao de troca ficam para uma etapa propria.
- Party Formations e Guild Squads permanecem como possibilidade futura, mas deixaram de ser o objetivo desta etapa.

Proximo passo sugerido:

- Etapa 56.5 - QA da consolidacao offline e dos textos de economia/Store.
- Depois do QA: Etapa 57 - Bazar Rotativo Offline.

## Etapa 56.5 - QA da consolidacao offline no Tauri/SQLite

Status: concluida.

Validacao desktop:

- `npm.cmd run build` passou antes e depois da correcao com TypeScript e Vite.
- `npm.cmd run tauri:dev` abriu o executavel real e carregou o SQLite sem fallback para mock.
- A campanha abriu com Aurora, Arkon, 674g, cinco personagens, 35 skills, 26 itens e dez logs.
- Store, Wiki, Market e Updates foram abertos por controles reais do WebView Tauri.
- Store mostrou `Aurora Wardrobe Archive`, `Gameplay only` e troca futura por `Gold / trophies`.
- Wiki destacou `Offline Guild Campaign`, um guild manager, SQLite local e economia NPC/bazar local.
- Market permaneceu `Market NPC`, com Quick Sell e sem player listings ou Market online.
- Updates exibiu a Etapa 56 como `Offline Campaign Consolidation`.
- A Store foi capturada e revisada em janela 960x700 sem overflow horizontal ou texto cortado.
- Busca estatica nao encontrou `fetch`, `WebSocket`, `EventSource`, cliente HTTP ou chamada de rede no codigo da aplicacao.

Bug encontrado e corrigido:

- `saveLogs` apagava e reinseria todos os Activity Logs usando o horario do autosave, fazendo dez registros antigos perderem seus horarios individuais.
- `ActivityLogEntry` agora aceita `createdAt` ISO opcional; o mapper preserva `created_at` do SQLite e novos logs recebem o instante real da criacao.
- Logs legados que possuem somente `HH:mm` usam fallback seguro baseado no dia do save.
- Uma segunda abertura Tauri confirmou `Save salvo.` e manteve o hash dos dez `created_at` exatamente em `16E2547F66573CAC84922AFDF176A72529BEC4C0760BB0ACBB99BEE936F8B074`.

Integridade e honestidade:

- `PRAGMA integrity_check` permaneceu `ok`; gold, roster, skills, itens, logs e current actions permaneceram presentes.
- Nenhuma compra, venda, recompensa, coleta, Save manual ou Reset foi acionado durante a navegacao.
- O hash fisico inicial era `D2BEEC8EBBCABBB05BEC56879DA4A559AEE0C8D28316CF3DF25D5904A79EE24D` e o final ficou `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- O arquivo nao voltou ao hash byte a byte porque o fluxo normal atualiza `last_loaded_at`, `last_saved_at` e `updated_at` ao abrir; nao havia fixture de gameplay nem backup temporario a restaurar nesta QA.
- O primeiro autosave da QA tambem expôs e atualizou os timestamps antigos dos logs antes da correcao; esses valores anteriores nao eram preservados pelo modelo antigo e nao puderam ser reconstruidos byte a byte.

Limitacoes:

- O futuro Bazar Rotativo continua apenas como placeholder local bloqueado.
- Trocas cosmeticas da Store continuam em preview e nao foram implementadas.
- `reqwest` aparece apenas como dependencia transitiva no `Cargo.lock`; nao ha uso direto no codigo Rust ou TypeScript do projeto.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 57 - Bazar Rotativo Offline.

## Etapa 57 - Bazar Rotativo Offline

Status: concluida.

Modelo e rotacao:

- O Market NPC ganhou uma aba `Bazar` separada da loja fixa, Sell, Quick Sell, Buyback e Services.
- Cada janela local de dez minutos gera seis ofertas deterministicas a partir do id da guilda e da chave temporal da rotacao.
- Reabrir o Market, recarregar o save ou reiniciar o app dentro da mesma janela nao rerrola o estoque.
- A normalizacao regenera a oferta canonica da janela e sobrepoe o historico de compras persistido, evitando manipulacao de preco ou item pela interface.

Ofertas e raridade:

- O catalogo usa somente ids existentes de supplies, materiais, utilitarios e equipamentos.
- Os graus sao `standard`, `uncommon`, `rare` e `relic`, independentes da raridade base do item.
- `Relic` possui chance de 0,01% por oferta, usa equipamento real existente e chega em `+5 / Tier 3`.
- Itens invalidos, estado corrompido, gold invalido e rotacoes antigas recebem normalizacao ou bloqueio seguro.

Compra e entrega:

- A engine recalcula item, quantidade e preco; o frontend envia somente o id da oferta e o destino.
- Cada oferta pode ser comprada uma vez, com historico limitado e protecao adicional contra clique duplo no React.
- O destino padrao e o Guild Depot, evitando perda quando nao houver personagem selecionado; Inventory e Character Depot continuam opcionais.
- Compras atualizam `guild.gold`, total de compras, gold total gasto, Activity Log e o estado visual `Acquired`.

Persistencia:

- `Guild` recebeu `bazaar?: GuildBazaarState`, compativel com saves antigos.
- A migration aditiva cria `guilds.bazaar_json` com default seguro; mapper e repository normalizam o JSON no load/save.
- `purchaseHistory` impede nova compra da mesma oferta depois de Save/Reload e e preservado entre rotacoes.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite; permaneceu apenas o aviso conhecido do bundle acima de 500 kB.
- Smoke no Vite confirmou a aba Bazar, seis cards, countdown ativo, selecao e destino padrao Guild Depot.
- Uma oferta de Training Axe por 138g foi comprada: o saldo caiu de 420g para 282g, o card virou `Acquired` e o botao foi bloqueado.
- Um segundo clique imediato nao criou compra duplicada nem novo desconto de gold.

Limitacoes atuais:

- A verificacao desta etapa usou o mock local do Vite; migration e persistencia no SQLite real ficam para a Etapa 57.5.
- Nao existe Market entre jogadores, auction house, trade, conexao online, moeda paga ou premium.
- Relic reaproveita equipamento e arte existentes; assets visuais exclusivos permanecem fora do escopo.

Proximo passo sugerido:

- Etapa 57.5 - QA do Bazar Rotativo Offline no Tauri/SQLite.

## Etapa 57.5 - QA do Bazar Rotativo Offline no Tauri/SQLite

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e `npm.cmd run build` foram executados antes do QA; o repositorio estava sincronizado e limpo.
- O banco original possuia 674g, cinco personagens, dez Activity Logs e ainda nao tinha `guilds.bazaar_json`.
- `guild_hunt_idle.db`, WAL vazio e SHM foram copiados antes da abertura do Tauri, com hashes individuais registrados.
- O hash SHA-256 original do banco principal era `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Validacao desktop e SQLite:

- `npm.cmd run tauri:dev` abriu o executavel real com WebView2 e SQLite, sem fallback para o mock.
- A migration criou `bazaar_json`, preservou 674g e gerou seis ofertas na rotacao `2973750`.
- A mesma rotacao permaneceu estavel entre abertura do Market, compra e Reload.
- O estoque controlado incluiu Mana Potion, Small Backpack, Broken Fang, Leather Boots, Shovel e um Rune Pouch Rare `+2 / Tier 1`.
- `PRAGMA integrity_check` permaneceu `ok` antes e depois da compra.

Compra e protecoes:

- Broken Fang x2 foi selecionado por 58g com Guild Depot como destino padrao.
- Dois cliques sincronizados no botao produziram uma unica compra: `guild.gold` passou de 674g para 616g.
- O SQLite recebeu exatamente dois Broken Fang no Guild Depot, um registro em `purchaseHistory`, `totalPurchases: 1` e `totalSpentGold: 58`.
- O Activity Log persistiu uma unica entrada `Bazaar purchase` com o item, quantidade e custo.
- Depois de Reload, a oferta continuou `Acquired`, o botao permaneceu desabilitado e uma nova tentativa nao alterou gold, item, historico ou log.

Responsividade:

- Em 960x700, a aba manteve seis cards, resumo e botao acessiveis.
- Nao houve overflow horizontal no documento nem no painel do Bazar.

Restauracao:

- O app, Vite e WebView2 foram encerrados antes da restauracao.
- O banco restaurado voltou a 674g, cinco personagens, dez logs e sem `bazaar_json`, confirmando retorno ao estado anterior ao teste.
- Banco principal, WAL e SHM terminaram com hashes identicos aos backups; as tres copias temporarias foram removidas.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado nesta etapa.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 58 - Cosmetic Exchange Offline na Store.

## Etapa 58 - Cosmetic Exchange Offline na Store

Status: concluida.

Modelo e catalogo:

- A antiga vitrine da Store virou `Wardrobe Exchange`, sem moeda premium, pagamento, conta online ou bonus de poder.
- `src/data/cosmeticExchanges.ts` define quatro trocas ligadas a IDs reais de Collections e itens existentes.
- Noble Adventurer custa 350g; Merchant Cart custa 250g e dois Dwarf Badges; Ash Wolf custa um Dragon Ember; Ancient Rune Sigil exige dois Enchanted Dust e a quest Crypt Permission concluida por algum personagem.
- A Topbar deixou de mostrar a moeda cosmetica ficticia e agora exibe a contagem real do guarda-roupa desbloqueado.

Engine e protecoes:

- `getCosmeticExchangeAvailability` valida registro, unlock anterior, gold, materiais nao bloqueados no Guild Depot e quest da guilda.
- `exchangeCosmetic` valida todos os requisitos antes de consumir qualquer recurso, desconta materiais e gold em uma unica resolucao e usa `unlockCollectionItem` para o registro permanente.
- Cosmeticos ja desbloqueados, IDs invalidos, gold invalido, materiais insuficientes e stacks bloqueadas nao geram consumo parcial.
- A protecao React bloqueia resolucoes simultaneas; o botao permanece no layout como `Already Unlocked`, evitando que um segundo clique atravesse para outro comando.

Persistencia e integracao:

- Unlocks continuam em `guild.collections` e materiais continuam no Guild Depot, ambos ja persistidos pelo SQLite existente; nenhuma migration nova foi necessaria.
- Collections recebe `newlyUnlockedCollectionItemIds`, mantendo o badge e permitindo equipar o visual pelo fluxo existente.
- Activity Log recebe uma unica entrada de sucesso ou bloqueio por tentativa processada.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite; permaneceu apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- Smoke no Vite abriu a Store com 420g, 14/29 cosmetics, quatro exchanges e custos/requisitos visiveis.
- Duplo clique em Noble Adventurer descontou 350g uma unica vez, deixou 70g, elevou o guarda-roupa para 15/29 e manteve a Store aberta com `Already Unlocked` desabilitado.
- O layout foi verificado em 960x700 e 760x700 sem overflow horizontal; em 760px os comandos passam para uma coluna.

Limitacoes atuais:

- O smoke desta implementacao usou o mock local do Vite; Save/Reload no SQLite real e restauracao controlada do banco ficam para a Etapa 58.5.
- Os cosmetics usam os sigilos CSS/textuais existentes; sprites e assets visuais dedicados continuam para uma etapa futura.
- O catalogo inicial possui quatro trocas fixas e nao tem rotacao, eventos sazonais ou compra premium.

Proximo passo sugerido:

- Etapa 58.5 - QA da Wardrobe Exchange no Tauri/SQLite.

## Etapa 58.5 - QA da Wardrobe Exchange no Tauri/SQLite

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e `npm.cmd run build` foram executados antes do QA; o repositorio estava sincronizado e limpo.
- O save original possuia Aurora com 674g, 14/29 cosmetics, cinco personagens, 26 itens e dez Activity Logs.
- O Guild Depot continha Iron Ore x12, Old Cloth x18, Enchanted Dust x2 e Brass Shield x1; nenhum material de troca foi fabricado para o teste.
- DB, WAL e SHM foram copiados antes da abertura do Tauri. O banco principal tinha SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Troca e protecoes:

- `npm.cmd run tauri:dev` abriu o executavel real com SQLite, sem fallback para mock.
- Noble Adventurer estava disponivel por 350g; o comando reduziu `guild.gold` de 674g para 324g e elevou o guarda-roupa de 14/29 para 15/29.
- Um segundo clique no mesmo ponto encontrou `Already Unlocked` desabilitado: o SQLite manteve 324g, um unico ID Noble e um unico Activity Log `Wardrobe exchange`.
- Collections mostrou Noble Adventurer como `Unlocked`; abrir o hall limpou `newlyUnlockedCollectionItemIds` sem remover o unlock.
- Ash Wolf mostrou `Dragon Ember 0/1`, status `Missing Guild Depot trophies` e comando desabilitado; nenhum item ou gold foi alterado.

Save/Reload e SQLite:

- Save e Reload preservaram 324g, 15/29 cosmetics e Noble Adventurer desbloqueado uma unica vez.
- O banco testado permaneceu com cinco personagens, 26 itens e os quatro stacks originais do Guild Depot.
- `PRAGMA integrity_check` retornou `ok` antes da troca, depois da troca e antes da restauracao.

Restauracao:

- O Tauri e o servidor Vite foram encerrados antes de restaurar os arquivos.
- DB, WAL e SHM foram sobrescritos pelos backups e terminaram com hashes SHA-256 identicos aos originais.
- O save restaurado voltou a 674g, 14/29 cosmetics, zero Noble Adventurer, cinco personagens, 26 itens e dez logs.
- As tres copias temporarias e a pasta de backup foram removidas.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado nesta etapa.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 59 - Progressao de raridades e tiers visuais dos itens.

## Etapa 59 - Progressao visual de raridades e tiers dos itens

Status: concluida.

Modelo visual:

- A raridade base continua sendo `common`, `uncommon`, `rare`, `epic` ou `legendary` e agora define cor, borda e superficie de forma consistente.
- O tier da Forge permanece independente da raridade: Tier 0 `Base`, Tier 1 `Forged I`, Tier 2 `Ascendant II` e Tier 3 `Exalted III`.
- Upgrade continua limitado a +0..+5. Esta etapa nao mudou dano, custos, probabilidades de drop ou limites funcionais da Forge.
- `getItemVisualIdentity` centraliza labels, classes e normalizacao; valores invalidos, `NaN` ou fora dos limites recebem fallback seguro.

Integracoes:

- `ItemIcon`, `ItemTooltip` e `ItemQualityBadge` formam a base visual compartilhada.
- Inventory, Equipment, Character Hall, painel lateral, Loot, Market NPC e Bazar exibem a mesma combinacao de raridade e rank da Forge.
- O Bazar passa o equipamento aprimorado completo para preview, preservando borda, tier e upgrade de ofertas especiais.
- A Forge ganhou legenda das cinco raridades e trilha visual Base > Forged I > Ascendant II > Exalted III.
- Save e Load reaproveitam as colunas existentes e limitam `upgrade_level` a 0..5 e `tier` a 0..3; nao houve migration SQLite.
- O Guild Field Codex e o Release Archive documentam a diferenca entre raridade de origem e refinamento da Forge.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite; permaneceu apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- Smoke visual no Vite confirmou os badges Common/Base no Character Hall e a progressao completa dentro da Forge.
- A estrutura foi revisada nas superficies de Inventory, Equipment, Character Hall, painel direito, Market/Bazar, Forge e tooltips.

Limitacoes atuais:

- Esta etapa nao adiciona raridades acima de Legendary, tiers cosmicos, Tier 10 ou novos itens; essa expansao depende de balanceamento e conteudo futuros.
- O QA desta implementacao usa o mock local do Vite. Persistencia real, equipamentos aprimorados e regressao no Tauri/SQLite ficam para a Etapa 59.5.
- Sprites dedicados por raridade continuam fora do escopo; a identidade atual usa os assets existentes com bordas, marcadores e superficies CSS.

Proximo passo sugerido:

- Etapa 59.5 - QA da progressao de raridades e tiers no Tauri/SQLite.

## Etapa 59.5 - QA da progressao de raridades e tiers no Tauri/SQLite

Status: concluida.

Preparacao e fixture:

- `git pull`, `git status` e `npm.cmd run build` passaram antes do QA; o repositorio estava sincronizado e limpo.
- O save real continha Aurora com 674g, cinco personagens, 26 itens e dez Activity Logs; todos os itens estavam inicialmente em +0/Tier 0.
- DB, WAL e SHM foram consolidados antes do teste e o banco principal foi protegido fora do repositorio.
- SHA-256 original: `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- A Worn Sword equipada de Arkon foi usada como fixture controlada, sem criar item ou personagem artificial.

Normalizacao e persistencia:

- O fixture invalido +999/Tier -4 carregou no Tauri real e foi salvo como +5/Tier 0, confirmando os limites defensivos do mapper e repository.
- O segundo fixture +5/Tier 3 apareceu como `Common`, `Exalted III` e `+5 / Tier 3` no Character Details.
- A Forge mostrou `Worn Sword +5 [T3]`, a legenda Common/Uncommon/Rare/Epic/Legendary e a trilha Base/Forged I/Ascendant II/Exalted III.
- No limite, a Forge exibiu `+5 / +5` e `Exalted III / Tier 3 of 3` sem oferecer progressao adicional.
- Save gravou +5/Tier 3 no SQLite; Reload retornou para Character Details mantendo `Common / Exalted III / +5 / Tier 3`.
- `PRAGMA integrity_check` permaneceu `ok` antes, durante e depois dos cenarios.

Market, Bazar e responsividade:

- O Market NPC preservou raridade e Forge rank no preview compartilhado de itens.
- O Bazar apresentou uma Novice Wand +1/Tier 0 e o dossier confirmou `Common / Base`, Upgrade +1 e Forge rank Base.
- A mensagem de Relic permaneceu alinhada ao modelo: equipamento Relic chega em +5/Exalted III usando item existente.
- Forge foi verificada em 960x700, 760x700 e 700x700; a legenda de raridades reorganizou em duas colunas no breakpoint compacto sem sobreposicao.

Restauracao:

- Toda a arvore do Tauri/Vite foi encerrada e o banco original foi restaurado byte a byte.
- O SHA-256 final voltou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- O save restaurado terminou com 674g, cinco personagens, 26 itens, dez logs e Worn Sword em +0/Tier 0.
- Nenhum WAL/SHM de QA ou backup temporario permaneceu no sistema.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado nesta etapa.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 60 - Progressao de equipamentos por familias e faixas de level.

## Etapa 60 - Progressao de equipamentos por familias e faixas de level

Status: concluida.

Modelo de progressao:

- Cinco faixas organizam o catalogo: Novice (1-9), Adventurer (10-24), Veteran (25-44), Elite (45-59) e Mythic (60+).
- Seis familias identificam o caminho do equipamento: Vanguard, Pathfinder, Arcanum, Discipline, Field Kit e Artifact.
- Familia/faixa sao independentes de raridade, upgrade e tier da Forge; nao existe bonus artificial por conjunto.
- Itens antigos recebem familia e faixa derivadas de slot, proficiencia, bonus e level requirement, preservando saves sem migration SQLite.
- Metadados explicitos invalidos usam fallback seguro para uma familia/faixa derivada.

Conteudo novo:

- O catalogo passou a 41 equipamentos, com 16 novos itens distribuidos pelas quatro faixas acima de Novice.
- Adventurer adiciona Iron Longsword, Ironwood Bow, Runed Wand, Iron Handwraps e Iron Cuirass no level 12.
- Veteran adiciona Cryptsteel Blade, Gravewood Bow, Crypt Scepter, Boneweave Wraps e Cryptguard Armor no level 30.
- Elite adiciona Ember Blade, Wyvern Bow, Ember Staff, Dragon Wraps e Dragonscale Armor no level 55.
- Mythic adiciona Emberheart Amulet, relicario legendary de level 60 ligado a Ember Matriarch.
- Os valores de ataque, defesa e poder especializado crescem por faixa sem criar Tier 10, raridade cosmica ou bonus premium.

Fontes e regras:

- Trollwood/Mudrot/Minotaur Outpost preenchem a faixa Adventurer com chances pequenas de equipamento.
- Ancient Crypt e Cyclops Hills fornecem os caminhos Veteran.
- Ember Dragon Nest fornece equipamentos Elite com chances raras.
- Grunk, Crypt Warden, Khazgrim Gatekeeper e Ember Matriarch possuem chances melhores para suas faixas; Emberheart permanece raro.
- Todos os 16 itens participam do Bazar Rotativo offline e podem receber os upgrades de oferta existentes.
- `canEquipItem` continua impondo level, vocacao e regra de offhand mesmo quando o item foi comprado antes do requisito.

Interface:

- `ItemProgressionBadge` mostra codigo da familia, nome da familia, faixa e level minimo.
- ItemIcon, ItemTooltip, Inventory, Equipment, Character Details, Market, Bazar e Forge compartilham os mesmos metadados.
- A Forge ganhou ledger das seis familias e trilha Novice > Adventurer > Veteran > Elite > Mythic, separada da trilha de tier.
- O Bazar exibe familia/faixa diretamente no card e no dossier selecionado.
- O Guild Field Codex documenta fontes, limites e ausencia de bonus de conjunto.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite.
- Auditoria SSR dos modulos encontrou 41 equipamentos, cobertura nas cinco faixas e seis familias e zero itemId de loot ausente.
- Gates validados: Arkon nao equipa Dragonscale Armor por requerer level 55; Lyra equipa Runed Wand; Shen nao equipa Ironwood Bow por vocacao.
- Smoke no Vite confirmou Worn Sword como Vanguard/Novice e Dragonscale Armor como Field Kit/Elite/Lv 55 no Bazar.
- Forge foi verificada no desktop, 960x700 e 700x700; um overflow horizontal em 1280px foi encontrado e corrigido.
- `git diff --check` passou.

Limitacoes atuais:

- A etapa nao adiciona sprites exclusivos; itens usam os sigilos e tratamentos CSS atuais.
- A Etapa 60 ainda nao adicionava set bonuses, crafting de equipamentos, reroll de atributos ou raridade cosmica; os conjuntos chegaram na Etapa 61.
- O QA desta implementacao usou o mock Vite. Drop real, compra, equip e Save/Reload no Tauri/SQLite ficam para a Etapa 60.5.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 60.5 - QA da progressao de equipamentos no Tauri/SQLite.

## Etapa 60.5 - QA da progressao de equipamentos no Tauri/SQLite

Status: concluida.

Catalogo e regras:

- A auditoria executavel cobriu os 41 equipamentos, seis familias e cinco faixas de level sem metadado invalido.
- Os 16 itens da Etapa 60 possuem fonte real de loot e participam do Bazar Rotativo offline.
- As 89 entradas de loot e 64 referencias de catalogo do Bazar possuem itemId, chance e quantidade validos.
- Arkon level 1 foi bloqueado ao tentar equipar Dragonscale Armor level 55; Lyra equipou Runed Wand e Shen foi bloqueado no Ironwood Bow por vocacao.
- Metadados invalidos de familia, faixa e level receberam fallback seguro; uma linha de save antiga hidratou Iron Longsword como Vanguard/Adventurer/Lv 12 pelo catalogo atual.

Tauri e SQLite:

- `npm.cmd run tauri:build` gerou o executavel, MSI e instalador NSIS sem erro.
- O save real iniciou com Aurora 674g, cinco personagens, 26 itens e dez Activity Logs.
- Iron Longsword e Emberheart Amulet foram inseridos como fixtures controlados no Guild Depot.
- O executavel Tauri carregou os dois itens, realizou autosave e uma segunda abertura preservou ambos com quantidade, origem, upgrade e tier corretos.
- `PRAGMA integrity_check` permaneceu `ok` antes do teste, depois do autosave e depois do reload.

Interface e responsividade:

- Character Details mostrou Worn Sword como Vanguard/Novice e Leather Armor como Field Kit/Novice.
- Forge exibiu as seis familias, as cinco faixas e trilhas separadas para level e tier.
- Bazar exibiu familia, faixa e level nos cards de equipamento e no dossier compartilhado.
- Viewports 1280x800, 960x700 e 700x700 ficaram sem overflow horizontal nos badges e na legenda de familias.

Restauracao:

- O banco original foi protegido antes dos fixtures e restaurado apos encerrar o Tauri.
- SHA-256 original e final: `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- O save restaurado terminou com 674g, cinco personagens, 26 itens, dez logs e zero fixture de QA.
- Backup temporario, WAL e SHM foram removidos.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado nesta etapa.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 61 - Sets de equipamentos e bonus de conjunto offline.

## Etapa 61 - Sets de equipamentos e bonus de conjunto offline

Status: concluida.

Modelo:

- Tres kits cobrem a progressao existente: Iron Expedition (Adventurer), Cryptwarden (Veteran) e Emberforged (Elite/Mythic).
- Cada kit usa grupos de pecas, nao uma lista rigida: uma arma valida para Guardian, Ranger, Arcanist/Warden ou Monk preenche o mesmo grupo de arma.
- Um grupo conta no maximo uma vez, impedindo que duas armas do mesmo kit em um save malformado dupliquem progresso.
- Iron Expedition e Cryptwarden ativam em 2/2 com arma e armadura; Emberforged ativa Dragon Temper em 2/3 e Heart of the Matriarch em 3/3 com Emberheart Amulet.
- Set, familia, faixa de level, raridade, upgrade, Forge tier e imbuement continuam camadas independentes.

Bonus reais:

- Iron Expedition 2/2: Attack +2%, Defense +2% e Health +15.
- Cryptwarden 2/2: Attack +3%, Defense +3%, Health +30 e Mana +15.
- Emberforged 2/3: Attack +4%, Defense +4%, Health +50 e Mana +25.
- Emberforged 3/3 adiciona Capacity +40, Speed +3 e Crit Chance +2%.
- Os bonus entram no calculo central de atributos e, por consequencia, no power usado por hunts, bosses, quests e expedicoes.

Compatibilidade e seguranca:

- Os 16 itens da Etapa 60 receberam apenas `equipmentSetId` no catalogo local; nenhuma coluna SQLite ou migration foi criada.
- Saves antigos continuam persistindo `item_id` e recebem identidade de conjunto ao hidratar o catalogo atual.
- Metadado de set invalido usa fallback pelo itemId conhecido; item isolado, faixa misturada ou conjunto incompleto nao concede bonus.
- Os bonus sao pequenos, deterministas e totalmente offline; nao existe reroll, compra premium, pagamento ou dependencia online.

Interface:

- `EquipmentSetBadge` identifica pecas de conjunto em Inventory, tooltips, titulos de ItemIcon e listas/dossier da Forge.
- Character Details ganhou ledger 0/2 ou 0/3 com grupos equipados, marcos e bonus ativos.
- Guild Record mostra o resumo agregado de set bonus ao lado do gear bonus comum.
- Forge ganhou uma legenda dos tres kits com faixa e todos os thresholds, separada das familias, raridades e tiers.
- Guild Field Codex e Release Archive documentam a regra de grupos alternativos e a independencia das demais camadas de item.

Validacao executada:

- `npm.cmd run build` passou com TypeScript e Vite.
- Auditoria SSR confirmou tres sets, 16 pecas, zero item ausente e correspondencia integral entre catalogo e definicoes.
- Uma peca nao ativou bonus; arma e armadura de faixas diferentes tambem nao ativaram conjunto.
- Emberforged 2/3 aplicou Attack, Defense, Health e Mana; 3/3 adicionou Crit, Capacity e Speed aos atributos reais.
- Character Details e Forge foram verificadas em 1280x800, 960x700 e 700x700 sem overflow horizontal.
- O QA visual encontrou nomes de sets quebrando no meio da palavra na Forge; a coluna foi corrigida e revalidada nos tres viewports.

Limitacoes atuais:

- Os conjuntos reutilizam as 16 pecas existentes e seus drops; esta etapa nao adiciona novos sprites, crafting, reroll ou mais slots.
- Bonus economicos, XP, loot e supply nao fazem parte dos sets atuais para evitar escalada excessiva.
- O QA desta implementacao usou engine e mock Vite; equip/unequip e Save/Reload reais no Tauri/SQLite ficam para a Etapa 61.5.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 61.5 - QA dos sets de equipamentos no Tauri/SQLite.

## Etapa 61.5 - QA dos sets de equipamentos no Tauri/SQLite

Status: concluida.

Preparacao:

- `git pull`, `git status`, `npm.cmd run build` e `npm.cmd run tauri:build` passaram antes dos fixtures.
- O pacote nativo gerou executavel, MSI e instalador NSIS com a implementacao da Etapa 61.
- O save real iniciou com Aurora 674g, Arkon level 1, cinco personagens, 26 itens e dez Activity Logs.
- DB original protegido com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Thresholds no Tauri/SQLite:

- Arkon foi elevado temporariamente ao level 60 e recebeu Ember Blade, Dragonscale Armor e Emberheart Amulet como fixture controlado.
- Emberforged 3/3 persistiu Health 1375, Mana 390, Capacity 1540, Speed 285, Attack 190, Defense 243 e Crit Chance 2%.
- Retirar apenas Emberheart Amulet manteve 2/3 com Health 1275, Mana 310, Capacity 1500, Speed 282, Attack 190, Defense 232 e Crit 0%.
- Retirar tambem Dragonscale Armor deixou 1/3, removeu todo set bonus e retornou Health 1225, Mana 285, Capacity 1500, Speed 282, Attack 182, Defense 158 e Crit 0%.
- Uma quarta abertura preservou o estado 1/3 sem reativar thresholds nem mover pecas de volta para equipment.
- `PRAGMA integrity_check` permaneceu `ok` em todos os cenarios.

Equip, unequip e gates:

- `equipItem` ativou 2/3 ao equipar arma e armadura e ativou 3/3 ao adicionar o amuleto.
- `unequipItem` devolveu amuleto e armadura ao inventario, recalculou atributos imediatamente e removeu somente o marco correspondente.
- Arkon level 1 foi bloqueado na Dragonscale Armor com `requires level 55`.
- Shen foi bloqueado no Ironwood Bow por vocacao incompativel.
- Equipamento misturado e conjunto incompleto continuaram sem bonus; nenhum grupo foi contado duas vezes.

Interface e responsividade:

- Character Details exibiu os tres ledgers, grupos, contadores e quatro thresholds sem texto cortado.
- Forge preservou nomes completos, faixas e resumos dos tres sets.
- Viewports 1280x800, 960x700 e 700x700 ficaram sem overflow horizontal nos ledgers, thresholds ou cards da Forge.
- Release Archive passou a destacar Stage 61.5 como QA atual.

Restauracao:

- O Tauri foi encerrado antes da restauracao e nenhum processo desktop permaneceu aberto.
- O banco original voltou ao mesmo SHA-256, com 674g, Arkon level 1, cinco personagens, 26 itens, dez logs e zero fixture.
- Backup temporario, WAL e SHM foram removidos.

Resultado:

- Nenhum bug funcional, visual ou de persistencia foi encontrado nesta etapa.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 62 - Crafting offline e bancada de equipamentos da guilda.

## Etapa 62 - Crafting offline e bancada de equipamentos da guilda

Status: concluida.

Modelo:

- A Forge ganhou os modos `Enhancement Forge` e `Guild Workbench`, sem remover upgrade, tier ou imbuements existentes.
- A bancada e guild-wide, totalmente offline, deterministica e sem chance de falha, fila, espera ou moeda premium.
- Dezenove blueprints reutilizam equipamentos reais do catalogo, cobrindo armas de todas as vocacoes e armaduras de quatro faixas.
- Apprentice oferece quatro pecas iniciais; Journeyman oferece as cinco pecas Iron Expedition; Master oferece as cinco Cryptwarden; Grandmaster oferece cinco pecas Emberforged.
- Emberheart Amulet permanece exclusivo das fontes raras existentes e nao pode ser fabricado.

Progressao:

- Workshop Rank 1 Apprentice inicia com zero crafts.
- Rank 2 Journeyman desbloqueia com tres pedidos concluidos.
- Rank 3 Master desbloqueia com oito pedidos concluidos.
- Rank 4 Grandmaster desbloqueia com 15 pedidos concluidos.
- O estado persiste `totalCrafts`, `totalGoldSpent`, `totalMaterialsConsumed` e os ultimos 20 pedidos.

Economia e inventario:

- Cada receita exige `guild.gold` e materiais ou trofeus reais, incluindo Iron Ore, Old Cloth, Broken Fang, Ancient Bone, Cultist Charm, Wyvern Scale, Dragon Ember e Enchanted Dust.
- Somente itens destravados do Guild Depot contam e podem ser consumidos; quest items e stacks protegidos permanecem intocados.
- A operacao valida receita, output, rank, gold e todos os materiais antes de alterar o estado.
- O equipamento fabricado recebe ID proprio, nao empilha e e entregue imediatamente ao Guild Depot, mesmo sem personagem selecionado.
- Falhas nao descontam gold, nao removem materiais e nao criam historico.

Interface:

- Resumo mostra rank, pedidos concluidos, guild gold e tipos de materiais indexados.
- A trilha de quatro ranks informa o proximo marco e quantos pedidos faltam.
- Filtros separam todas as receitas, armas e armaduras.
- O blueprint selecionado mostra icone, familia, faixa de level, set, requisitos atuais, destino e motivo de bloqueio.
- Workshop Ledger mostra os ultimos 20 pedidos e totais vitalicios.
- O Activity Log recebe uma unica entrada de sucesso ou bloqueio por tentativa.
- Uma trava curta no App impede duplicacao por clique duplo.

Save/Load SQLite:

- `crafting_json` foi adicionado a `guilds` por migration idempotente com default `{}`.
- Saves antigos normalizam campos ausentes, negativos, `NaN`, historico invalido e timestamps corrompidos.
- O catalogo de receitas fica em codigo; somente progresso e historico ficam no save.
- Execucao protegida do release Tauri criou a coluna, carregou o estado default e manteve `PRAGMA integrity_check = ok`.
- O save real foi restaurado ao SHA-256 original `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` depois do teste.

Validacao:

- Teste SSR validou material travado, rank gate, gold insuficiente, receita ausente, ausencia de mutacao em bloqueios e normalizacao legada.
- Tres crafts consecutivos consumiram seis Iron Ore e 120g, criaram tres IDs distintos e desbloquearam Journeyman.
- O fluxo visual fabricou Worn Sword, atualizou 420g para 380g, Iron Ore de 12 para 10 e adicionou uma entrada ao ledger.
- Viewports 1280x800, 960x700 e 700x700 foram verificadas; um overflow intermediario encontrado em 960 px foi corrigido com layout de uma coluna.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram; executavel, MSI e NSIS foram gerados.

Limitacoes atuais:

- Nao ha salvage, reroll, qualidade aleatoria, fila de producao, receitas temporizadas ou crafting automatico.
- A bancada reutiliza os equipamentos e simbolos existentes; novos sprites ficam para uma etapa visual futura.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 62.5 - QA do crafting offline no Tauri/SQLite.

## Etapa 62.5 - QA do crafting offline no Tauri/SQLite

Status: concluida.

Baseline e protecao:

- `git pull`, `git status` e `npm.cmd run build` passaram antes dos testes.
- O save real iniciou com Aurora 674g, guild level 1, cinco personagens, 26 itens e dez Activity Logs.
- O banco original foi protegido com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- O baseline ainda nao possuia `crafting_json`, confirmando um teste real de migration em save antigo.

Matriz da engine:

- As 19 receitas resolveram outputs de equipamento validos e oito insumos reais: Iron Ore, Old Cloth, Broken Fang, Enchanted Dust, Ancient Bone, Wyvern Scale, Cultist Charm e Dragon Ember.
- Os limites 0/3/8/15 ativaram corretamente Apprentice, Journeyman, Master e Grandmaster.
- Um craft valido foi executado em cada rank com desconto exato de gold, consumo de materiais, item unico e entrega no Guild Depot.
- Material travado nao contou nem foi consumido; receita ausente, data invalida, gold `NaN`, rank insuficiente e recursos incompletos bloquearam sem mutar inputs.
- Estado legado negativo ou corrompido normalizou com seguranca e historico acima de 20 entradas foi limitado.

Tauri e SQLite:

- `npm.cmd run tauri:build` gerou novamente executavel, MSI e instalador NSIS.
- A primeira abertura do release migrou o save antigo, adicionou `crafting_json` e carregou o estado default sem alterar 674g ou os 26 itens.
- Uma fixture controlada representou um Worn Sword: guild gold 674 para 634, Iron Ore 12 para 10, um item no Guild Depot, um ledger e um Activity Log.
- Duas aberturas completas do Tauri atualizaram `last_saved_at` e preservaram exatamente essa transacao.
- A segunda abertura permaneceu com um item, um historico e um log, sem reaplicar craft ou duplicar recompensas.
- `PRAGMA integrity_check` permaneceu `ok` durante migration e ambos os reloads.

Interface:

- O filtro Armor trocou o blueprint ativo para Field Leather e listou somente as quatro armaduras.
- Iron Longsword em Apprentice mostrou `Requires Workshop Rank 2.` com o botao desabilitado.
- Duplo clique real em Craft Worn Sword aplicou somente uma transacao: 420g para 380g, Iron Ore 12 para 10, um pedido e um log.
- Viewports 1280x800, 960x700 e 700x700 ficaram sem overflow ou textos cortados nas receitas e nos requisitos.
- Release Archive passou a destacar Stage 62.5 como QA atual.

Restauracao e resultado:

- O Tauri foi encerrado graciosamente antes da restauracao.
- O save voltou ao SHA-256 original, sem WAL, SHM ou backup temporario restante.
- Nenhum bug funcional, visual, de duplicacao ou persistencia foi encontrado nesta etapa.
- Permanece somente o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 63 - Salvage offline e recuperacao controlada de materiais.

## Etapa 63 - Salvage offline e recuperacao controlada de materiais

Status: concluida.

Modelo e economia:

- A Forge ganhou o terceiro modo `Salvage Bench`, dedicado aos equipamentos armazenados no Guild Depot.
- Cada operacao remove exatamente uma unidade e retorna materiais deterministas; nao ha chance, reroll, espera, custo ou geracao de gold.
- Equipamentos Common retornam um material, Uncommon dois, Rare tres mais um Enchanted Dust e Epic quatro mais dois Enchanted Dust.
- Escudos, equipamentos Vanguard e armaduras pesadas retornam Iron Ore; equipamentos leves retornam Old Cloth.
- Legendary Artifacts nao podem ser desmontados, preservando as recompensas mais raras da campanha.

Protecoes e transacao:

- Equipamentos locked, dentro de containers, que sejam containers, com upgrade, tier ou imbuement ficam protegidos.
- A engine valida item, quantidade, timestamp e retorno antes de alterar o depot ou o estado da guilda.
- Materiais stackable sao mesclados no Guild Depot e o gold permanece inalterado.
- Falhas retornam o mesmo estado sem mutar inputs; uma trava curta no App impede resolucao duplicada.

Interface:

- O resumo mostra equipamentos elegiveis, protegidos, ordens concluidas e materiais recuperados.
- A lista diferencia `Recoverable` e `Protected`; o dossier mostra familia, faixa, set e os quatro indicadores de protecao.
- O retorno e exibido antes da operacao e o botao exige `Prepare Salvage` seguido de `Confirm Salvage`.
- O Recovery Ledger preserva as ultimas 20 ordens e totais vitalicios; o Activity Log recebe uma unica entrada por resultado.

Save/Load SQLite:

- O ledger reutiliza `guilds.crafting_json`, sem nova migration ou tabela.
- Saves antigos recebem `totalSalvages`, `totalRecoveredMaterials` e `salvageHistory` com defaults seguros.
- Campos negativos, `NaN`, historicos invalidos, timestamps corrompidos e listas acima de 20 entradas sao normalizados.
- Duas aberturas do release Tauri preservaram uma fixture com um Brass Shield consumido, Iron Ore 12 para 14, um ledger e um log sem duplicacao.
- `PRAGMA integrity_check` permaneceu `ok`; o save real foi restaurado ao SHA-256 original `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Validacao:

- A matriz SSR passou 29 verificacoes de retornos, oito protecoes, transacao, ausencia de mutacao, normalizacao, limite do historico e inputs invalidos.
- Um criterio incorreto que classificava Leather Armor como metal apenas pelo peso foi encontrado e corrigido.
- No browser, o primeiro clique apenas armou a confirmacao e um duplo clique na confirmacao gerou uma ordem, dois materiais e um log.
- Viewports 1280x800, 960x700, 700x700 e 430x760 ficaram sem overflow no painel e nos controles.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram; executavel, MSI e NSIS foram gerados.

Limitacoes atuais:

- Nao ha preview de valor em gold, salvage em massa, selecao de quantidade, reciclagem de itens equipados ou recuperacao de trofeus raros.
- O retorno usa somente Iron Ore, Old Cloth e Enchanted Dust; a economia pode ser rebalanceada apos uma sessao longa de campanha.
- Permanecem os simbolos existentes e o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 63.5 - QA do Salvage offline no Tauri/SQLite.

## Etapa 63.5 - QA do Salvage offline no Tauri/SQLite

Status: concluida.

Baseline e matriz da engine:

- `git pull`, `git status` e `npm.cmd run build` passaram antes dos testes.
- A matriz ampliada executou 40 verificacoes de seis retornos, quinze bloqueios, economia, capacidade, replay, historico e ausencia de mutacao.
- Upgrade e tier negativos, `NaN` ou fracionarios agora bloqueiam; imbuements malformados tambem nao permitem desmontagem.
- Item ausente, quantidade zero/fracionaria, timestamp invalido, material, Artifact, container, locked, nested, upgrade, tier e imbuement bloquearam sem alterar inputs.
- Brass Shield retornou exatamente dois Iron Ore, sem alterar guild gold nem os contadores anteriores do Guild Workbench.

Bug encontrado e corrigido:

- O empilhamento generico podia juntar material recuperado a uma stack locked existente, deixando a recompensa protegida e indisponivel para uso.
- O Salvage agora procura somente uma stack destravada, na raiz do Guild Depot e sem owner de personagem.
- Se todas as stacks equivalentes estiverem locked ou em containers, uma nova stack destravada e criada.
- A correcao ficou restrita ao fluxo de recuperacao e nao mudou o comportamento dos demais sistemas de inventario.

Interface:

- O primeiro clique permaneceu apenas como `Prepare Salvage`; o segundo confirmou a operacao.
- Duplo clique real na confirmacao gerou uma ordem, dois materiais e um unico Activity Log.
- Estados vazio, elegivel, selecionado e ledger atualizaram sem selecao presa depois da remocao do item.
- Viewports 1280x800, 960x700, 700x700 e 430x760 ficaram sem overflow no painel, resumo, protecoes, retorno ou botao.

Tauri e SQLite:

- `npm.cmd run tauri:build` gerou executavel, MSI e NSIS com a correcao.
- A primeira abertura migrou o save antigo e adicionou os defaults de Salvage ao `crafting_json` sem alterar 674g.
- A fixture manteve 12 Iron Ore locked e criou uma stack separada com dois Iron Ore destravados apos consumir um Brass Shield.
- Duas aberturas completas preservaram duas stacks, uma ordem, dois materiais recuperados e um log sem merge indevido ou duplicacao.
- `PRAGMA integrity_check` permaneceu `ok` e o save real voltou ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- Tauri foi encerrado antes da restauracao; backup temporario, WAL e SHM foram removidos.

Resultado e limites:

- Nenhum problema funcional restante foi encontrado no escopo do Salvage offline.
- Nao ha salvage em massa, recuperacao de trofeus, itens equipados, selecao de quantidade ou reroll de atributos.
- Permanece somente o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 64 - Upgrades da guilda com materiais de hunts antigas.

## Etapa 64 - Upgrades da guilda com materiais de hunts antigas

Status: concluida.

Objetivo e modelo:

- As quatro facilities existentes mantiveram tres niveis e os bonus originais; a etapa adicionou custo material sem aumentar o poder maximo.
- War Room continua fornecendo +1% Hunt XP por nivel; Training Yard +2% training; Quartermaster -2% NPC prices; Contract Archive +1% Quest XP.
- Cada um dos 12 upgrades exige gold, Career Points e dois materiais reais do catalogo.
- `totalInvestedMaterials` foi adicionado ao `headquarters_json`; saves antigos recebem zero sem perder niveis ou gold investido.

Materiais e retorno a hunts:

- Nivel 1 usa Rat Tail, Spider Silk e Old Cloth das rotas iniciais.
- Nivel 2 usa Broken Fang, Iron Ore, Spider Silk e Ancient Bone das hunts regionais e crypts.
- Nivel 3 usa Ancient Bone, Wyvern Scale, Cultist Charm e Enchanted Dust das areas avancadas.
- Os requisitos ficam no catalogo TypeScript e nao sao salvos por jogador, evitando reroll ou alteracao ao reabrir o jogo.
- Quantidades foram mantidas pequenas para criar objetivos paralelos sem bloquear excessivamente a campanha.

Engine e seguranca:

- `getGuildFacilityUpgradeAvailability` centraliza level, career, gold, materiais disponiveis, faltantes e motivos de bloqueio.
- A transacao valida todos os requisitos antes de alterar guilda ou depot.
- Somente stacks destravadas, na raiz do Guild Depot, sem owner de personagem e que nao sejam quest items podem ser consumidas.
- Stacks locked, itens em containers, inventarios e depots de personagens permanecem intocados.
- Consumo pode atravessar varias stacks, recalcula capacity e incrementa os totais vitalicios de gold e materiais.
- Clique duplo continua protegido pela trava curta existente no App e cada resultado gera um unico Activity Log.

Interface:

- O hero agora mostra Facility Levels, Gold Invested, Materials Donated e Career Points.
- O dossier apresenta custo, career gate e uma requisicao visual com os icones reais, nomes e contagens disponivel/exigida.
- Materiais prontos e faltantes possuem estados distintos; o botao mostra o primeiro bloqueio relevante.
- A nota operacional informa explicitamente que apenas stacks destravadas na raiz do Guild Depot sao doadas.

Validacao:

- A matriz SSR passou 67 verificacoes cobrindo 12 requisitos, catalogo, normalizacao, quatro upgrades iniciais, progressao completa e bloqueios.
- War Room avancou de 0 a 3 consumindo 35 materiais e 6.250g, mantendo o bonus final em +3% Hunt XP.
- Consumo em duas stacks funcionou; stacks locked e nested permaneceram com as quantidades originais.
- Gold, material, career e level maximo bloquearam sem mutar guilda ou depot.
- As quatro facilities e seus requisitos foram inspecionados no browser em 1280x800, 960x700, 700x700 e 430x760 sem overflow.

Tauri e SQLite:

- `npm.cmd run tauri:build` gerou executavel, MSI e NSIS.
- A primeira abertura normalizou o save antigo com `totalInvestedMaterials: 0`, mantendo 674g e integridade `ok`.
- Uma fixture de War Room level 1 preservou 424g, 250g investidos, oito materiais doados e um Activity Log por duas aberturas.
- Rat Tail locked e Spider Silk nested permaneceram intocados durante os dois reloads.
- O save real foi restaurado ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`; backup temporario, WAL e SHM foram removidos.

Limitacoes atuais:

- Nao ha fila, tempo de construcao, downgrade, reembolso, melhoria alem do nivel 3 ou bonus novos.
- Materiais precisam ser movidos manualmente para a raiz do Guild Depot antes da doacao.
- Nao ha comando direto do requisito para abrir a hunt de origem; as fontes podem ser consultadas no Codex.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 64.5 - QA dos upgrades materiais da Headquarters no Tauri/SQLite.

## Etapa 64.5 - QA dos upgrades materiais da Headquarters no Tauri/SQLite

Status: concluida.

Baseline e regressao da engine:

- `git pull`, `git status` e `npm.cmd run build` passaram antes da QA.
- Uma matriz adicional executou 43 verificacoes com os 12 upgrades em sequencia, todos os nove tipos de material e quatro bonus finais.
- As facilities chegaram a 12/12 consumindo exatamente 21.850g e 138 materiais.
- Bonus maximos permaneceram Hunt XP +3%, Training +6%, NPC discount -6% e Quest XP +3%.
- Todas as stacks locked e nested mantiveram suas quantidades; uma nova tentativa em facility maxed foi bloqueada sem mutacao.
- O carregamento legado de headquarters sem `totalInvestedMaterials` continuou normalizando para zero.

Bugs encontrados e corrigidos:

- A tela `Depot` ja existia, mas estava acessivel somente por uma barra legada escondida; materiais guardados no Depot Pessoal nao podiam voltar ao fluxo normal.
- `Depot` agora possui comando permanente no menu lateral, ao lado de Collections e Bag.
- Entre 921 e 1180 px, a regra especifica de `game-window-full` sobrepunha o breakpoint e mantinha tres colunas, comprimindo cada botao lateral para aproximadamente 11 px.
- O layout full agora usa uma coluna nesse intervalo; abaixo de 920 px continua ocultando os paineis auxiliares conforme o comportamento existente.

Fluxo visual completo:

- Ayla foi selecionada e Spider Silk x10 saiu do Depot Pessoal para o Inventory.
- O mesmo stack foi enviado do Inventory ao Guild Depot pela acao real existente.
- Contract Archive passou a mostrar Old Cloth 18/8 e Spider Silk 10/3, com gold e Career Points suficientes.
- Duplo clique em `Upgrade to Level 1` executou uma unica transacao: 420g para 220g, Old Cloth 18 para 10 e Spider Silk 10 para 7.
- Materials Donated foi para 11, Quest XP para +1% e apenas um Activity Log foi criado.

Responsividade:

- Depot e Guild Hall foram revisados em 1280x800, 960x700, 700x700 e 430x760.
- O viewport de 960 px passou de tres colunas `503/72/330` para uma coluna de 925 px.
- Nao houve overflow horizontal da pagina e o comando Depot permaneceu disponivel no menu ou por retorno da janela full.
- Release Archive nao apresentou erros inesperados; no Vite permanece apenas o fallback SQLite esperado fora do Tauri.

Tauri e SQLite:

- `npm.cmd run tauri:build` gerou executavel, MSI e NSIS com as correcoes.
- A migration de save antigo manteve integridade e adicionou o contador material default.
- Uma fixture equivalente ao upgrade visual preservou Contract Archive level 1, 474g, Old Cloth x10, Spider Silk x7, 11 materiais doados e um log.
- Duas aberturas completas mantiveram exatamente um upgrade sem reaplicar consumo ou bonus.
- `PRAGMA integrity_check` permaneceu `ok`.
- O save real foi restaurado ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`; backup, WAL e SHM foram removidos.

Resultado e limites:

- Nenhum problema funcional restante foi encontrado no escopo dos upgrades materiais.
- A transferencia do Depot Pessoal ainda ocorre em duas etapas intencionais: Depot para Inventory e Inventory para Guild Depot.
- A sede ainda nao abre automaticamente a hunt que fornece um material faltante.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 65 - Resource Planner e rastreamento de materiais de hunt.

## Etapa 65 - Resource Planner e rastreamento de materiais de hunt

Status: concluida.

Arquivos criados:

- `src/game-engine/headquarters/buildHeadquartersResourcePlan.ts`.
- `src/components/headquarters/HeadquartersResourcePlanner.tsx`.

Arquivos principais alterados:

- `src/game-engine/headquarters/upgradeGuildFacility.ts`.
- `src/components/headquarters/GuildHeadquartersHall.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/app/App.tsx`.
- `src/styles.css`.
- `src/data/clientUpdates.ts`.

Modelagem:

- O Resource Planner e totalmente derivado do save atual e nao adiciona coluna, JSON ou estado persistido novo.
- `Next Levels` agrega o proximo nivel de cada facility ainda incompleta.
- `Full Completion` agrega todos os niveis restantes ate 12/12.
- Quantidade disponivel reutiliza a mesma funcao do upgrade real: apenas stacks desbloqueados, na raiz e pertencentes ao Guild Depot contam.
- Stacks locked, nested, de personagem e quest items continuam fora do calculo e do consumo.
- Materiais cobertos usam `min(disponivel, necessario)`, impedindo estoque excedente de mascarar deficit de outro recurso.

Fontes e navegacao:

- As fontes sao encontradas diretamente em `hunts[].monsters[].lootTable`, sem tabela paralela manual.
- Cada fonte mostra hunt, cidade, level minimo, criaturas, maior chance bruta e faixa de quantidade por drop.
- O status considera level, acesso, `character.status === idle` e ausencia de acao atual.
- Aventureiros que cumprem level/acesso mas estao ocupados nao sao anunciados como prontos.
- `Open Hunt` seleciona o primeiro membro ocioso e apto da guilda, preserva a hunt escolhida e abre diretamente a Hunt Assignment.
- Fontes sem aventureiro apto permanecem visiveis com motivo e botao desabilitado.

Interface:

- O planner foi adicionado como banda propria abaixo das facilities, mantendo a Headquarters como uma unica area de trabalho.
- Quatro indicadores resumem targets, total necessario, cobertura atual e deficit.
- Materiais sao botoes compactos com ItemIcon, contagem do Depot e status `Need` ou `Ready`.
- A fonte selecionada aparece ao lado em desktop e abaixo em larguras menores.
- Nao foram usados assets externos, premium, moeda paga ou dependencia online.

Validacao funcional e visual:

- No mock com Headquarters 0/12, `Next Levels` calculou quatro targets, 42 materiais, 18 cobertos e 24 faltantes.
- `Full Completion` calculou 12 targets e exatamente 138 materiais, igual ao custo completo validado na Etapa 64.5.
- Old Cloth apontou Trollwood Camp, Forest Troll, chance bruta de 12% e quantidade 1-3.
- O atalho de Trollwood ignorou Ayla ocupada, selecionou Lyra ociosa level 26 e abriu Hunt Assignment sem bloqueio por acao atual.
- Layout revisado em 1280, 960, 700 e 430 px; nao houve overflow horizontal na pagina ou no planner.
- O primeiro build detectou uma inferencia ampla de `status`; o union type foi explicitado e o erro foi corrigido antes da validacao.
- `npm.cmd run build` passou com 347 modulos apos a correcao.

Limitacoes atuais:

- Chances exibidas sao valores brutos da loot table por criatura, nao uma previsao de tempo ou garantia de drop.
- O planner cobre materiais de Headquarters vindos de hunts; bosses, quests, Workbench e Guild Projects ainda nao compartilham uma lista global de objetivos.
- Materiais obtidos continuam precisando ser enviados manualmente ao Guild Depot para contar.
- Nao existe pin persistente, notificacao automatica ou auto-dispatch de personagem.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 65.5 - QA do Resource Planner no Tauri/SQLite.

## Etapa 65.5 - QA do Resource Planner no Tauri/SQLite

Status: concluida.

Baseline:

- `git pull` confirmou `main` atualizado e `git status` iniciou limpo.
- `npm.cmd run build` passou antes da QA com 347 modulos.
- O save real iniciou com `PRAGMA integrity_check = ok` e SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Matriz deterministica da engine:

- Um harness temporario empacotado pelo Vite executou 33 verificacoes e foi removido integralmente depois do teste.
- `Next Levels` confirmou 4 targets, 42 materiais, 18 cobertos e 24 faltantes.
- `Full Completion` confirmou 12 targets, 138 materiais, 32 cobertos e 106 faltantes no estoque mock completo.
- Todos os materiais restantes possuiam ao menos uma fonte real nas loot tables das hunts.
- Stacks root desbloqueados foram agregados; locked, nested, character-owned, Inventory e quest items foram ignorados.
- Estoque excedente de Old Cloth cobriu somente os 22 necessarios e nao escondeu os outros 20 materiais faltantes.
- Headquarters 12/12 retornou zero target, zero entry e zero deficit.
- Estado malformado com NaN, niveis negativos, fracionarios e acima do cap foi normalizado para totais finitos.
- Old Cloth confirmou Trollwood Camp, chance bruta de 12%, quantidade 1-3 e Lyra ociosa na lista pronta.
- Rosters artificiais confirmaram estados `busy`, `level` e `access`.
- Guild Depot, personagens e headquarters de entrada permaneceram sem mutacao.

Save real e Tauri:

- O banco real possuia Headquarters legado 0/12 sem `totalInvestedMaterials`, 674g, 5 personagens, 26 itens e 10 logs.
- Rat Tail x6 estava no Inventory de Arkon e, corretamente, nao participou da cobertura do Guild Depot.
- Old Cloth x18 era o unico material elegivel dos proximos quatro upgrades; o resultado real esperado permaneceu 42/18/24.
- Antes das aberturas nativas, o banco foi copiado para backup com hash identico ao original.
- A primeira abertura Tauri normalizou `totalInvestedMaterials: 0` e preservou levels, gold, personagens, itens e logs.
- A segunda abertura produziu o mesmo hash semantico `91F52C513ADBBF032F848B5E292F6893C1BD0979BB7370903C88F83540673E96`.
- As duas janelas permaneceram abertas durante cinco segundos para load/autosave e foram encerradas de forma controlada pelo QA; nao houve interacao manual dentro da janela nativa.
- `PRAGMA integrity_check` permaneceu `ok` e nenhuma segunda normalizacao, item, log ou transacao foi criada.
- O banco original foi restaurado byte por byte; WAL, SHM e backup temporario foram removidos.

QA visual e navegacao:

- O frontend exibiu os mesmos valores 42 necessarios, 18 cobertos, 24 faltantes, Old Cloth 18/22 e Rat Tail 0/15.
- O Rat Tail pessoal do save/mock nao foi contado pelo planner.
- `Full Completion` exibiu 138 necessarios e 106 faltantes; Ancient Bone apontou Ancient Crypt, `Requires level 30` e manteve `Open Hunt` desabilitado.
- Voltar para `Next Levels` removeu a selecao Ancient Bone inexistente e retornou com seguranca para Old Cloth.
- Trollwood Camp exibiu apenas Lyra como ociosa e apta; `Open Hunt` selecionou Lyra level 26 e abriu Hunt Assignment sem bloqueio por acao atual.
- Em 1280, 960, 700 e 430 px nao houve overflow horizontal da pagina ou do Resource Planner.
- Release Archive e console do app nao apresentaram erros inesperados.

Resultado e limitacoes:

- Nenhum bug funcional foi encontrado e nenhum arquivo de gameplay precisou ser alterado na Etapa 65.5.
- O planner continua derivado e read-only; a normalizacao observada pertence ao carregamento legado de Headquarters, nao a uma escrita do planner.
- O QA nativo validou load/autosave e persistencia por consulta SQLite, mas os cliques de interface foram executados no frontend Vite.
- Chances continuam sendo valores brutos por criatura, sem estimativa de tempo para obter o drop.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 66 - Guild Logistics Board e objetivos de campanha.

## Etapa 66 - Guild Logistics Board e objetivos de campanha

Status: concluida.

Arquivos criados:

- `src/game-engine/inventory/guildDepotMaterials.ts`.
- `src/game-engine/logistics/getMaterialHuntSources.ts`.
- `src/game-engine/logistics/buildGuildLogisticsPlan.ts`.
- `src/components/logistics/GuildLogisticsBoard.tsx`.

Arquivos principais alterados:

- `src/app/App.tsx`.
- `src/components/character/CharacterDetails.tsx`.
- `src/components/layout/CharacterSideMenu.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/components/projects/GuildProjectsHall.tsx`.
- `src/game-engine/headquarters/buildHeadquartersResourcePlan.ts`.
- `src/game-engine/headquarters/upgradeGuildFacility.ts`.
- `src/game-engine/projects/fundGuildProjectPhase.ts`.
- `src/game-engine/cosmetic-exchange/getCosmeticExchangeAvailability.ts`.
- `src/game-engine/cosmetic-exchange/exchangeCosmetic.ts`.
- `src/styles.css`.
- `src/data/clientUpdates.ts`.

Escopo do board:

- Nova rota `logistics`, acessivel pelo Character Hall e pelo menu lateral quando ele esta visivel.
- O board e totalmente derivado de `guild`, `characters` e `depot`; nao adiciona estado ou schema SQLite.
- Headquarters gera uma ordem para o proximo nivel de cada facility ainda incompleta.
- Guild Projects gera uma ordem para a fase atual de cada projeto ainda incompleto, incluindo prerequisitos futuros como locks visiveis.
- Wardrobe gera uma ordem para cada exchange cuja Collection ainda nao foi desbloqueada.
- Workbench nao foi agregado porque suas receitas sao escolhas sob demanda e somar todas criaria uma necessidade falsa.

Modelo de objetivos:

- Cada ordem possui categoria, destino, titulo, alvo, custo em gold, materiais, blockers e status `Ready`, `Need Materials`, `Need Gold` ou `Locked`.
- Ordens prontas aparecem primeiro; materiais e locks continuam visiveis para planejamento de longo prazo.
- O resumo mostra ordens ativas, prontas, deficit agregado e soma informativa dos custos listados.
- A demanda combinada agrega requisitos por item e limita cobertura a `min(disponivel, necessario)`.
- Recursos nao sao reservados; cada transacao continua independente e o proprio board explica essa regra.

Regra unificada do Guild Depot:

- Headquarters, Projects e Wardrobe agora compartilham `getAvailableGuildDepotMaterialQuantity` e `consumeGuildDepotMaterialItems`.
- Somente stacks `guildDepot`, na raiz, sem owner de personagem, desbloqueados, inteiros e nao quest contam ou sao consumidos.
- A regra anterior de Projects e Wardrobe podia contar/consumir nested ou entradas com ownership incompativel; essa divergencia foi corrigida.
- Availability, UI e transacao real agora usam a mesma definicao de material elegivel.
- O Resource Planner da Headquarters passou a reutilizar tambem o modulo compartilhado de fontes de hunt.

Interface e navegacao:

- Hero resume a campanha e o ledger material exibe sete recursos no save inicial.
- Filtros `All Orders`, `Headquarters`, `Projects` e `Wardrobe` atualizam a fila e normalizam a selecao.
- O dossier mostra gold, linhas materiais, blockers, fontes de hunt e o comando do sistema responsavel.
- `Open Headquarters`, `Open Guild Projects` e `Open Wardrobe` levam aos halls existentes.
- `Open Hunt` preserva a fonte escolhida, seleciona um aventureiro ocioso apto e abre Hunt Assignment.
- Fontes bloqueadas por level, access ou roster ocupado permanecem visiveis com comando desabilitado.

Validacao:

- Build intermediario passou com 351 modulos.
- O save mock inicial exibiu 11 ordens: 4 Headquarters, 3 Projects e 4 Wardrobe.
- Duas ordens estavam prontas, os custos listados somaram 2.100g e a demanda material ficou 28/62, com deficit 34.
- A fila classificou 2 `Ready`, 6 `Need Materials` e 3 `Locked`.
- Projects filtrou tres ordens e mostrou o prerequisito de Cartographers' Archive.
- Wardrobe filtrou quatro ordens, reconheceu Noble Adventurer como gold-only e abriu o hall correto.
- Trollwood Camp selecionou Lyra ociosa level 26 e abriu Hunt Assignment sem bloqueio por acao.
- Financiar `Clear the Annex` consumiu 100g e Old Cloth x2; a ordem avancou para `Reinforce the Shelves`, 150g e Iron Ore x2.
- O recalculo manteve cobertura 28/62 corretamente: consumo e nova demanda se compensaram sem inflar progresso.
- Uma matriz temporaria executou 33/33 checks de totais, categorias, statuses, stacks protegidos, transacoes, campanha completa, normalizacao e imutabilidade.
- Nested Project/Wardrobe foram bloqueados; stacks root foram consumidos exatamente e locked/nested permaneceram intactos.
- Em 1280, 960, 700 e 430 px nao houve overflow horizontal na pagina ou no board.

Limitacoes atuais:

- A demanda combinada nao reserva recursos nem define prioridade automatica entre ordens.
- Nao existe pin persistente, notificacao de material completo ou dispatch automatico.
- Workbench, Forge, Imbuements e receitas escolhidas ainda nao entram no board global.
- Chances sao valores brutos das loot tables e nao estimativas de tempo.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 66.5 - QA do Guild Logistics Board no Tauri/SQLite.

## Etapa 66.5 - QA do Guild Logistics Board no Tauri/SQLite

Status: concluida sem bug funcional novo.

Protecao do save:

- O SQLite real passou em `integrity_check: ok` antes e depois das validacoes.
- O arquivo original recebeu backup fora do repositorio com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- O save inicial continha uma guilda, cinco personagens, 26 itens, dez activity logs e 674g.
- A primeira abertura nativa normalizou apenas `headquarters.totalInvestedMaterials` do save legado para zero.
- Uma segunda abertura manteve o mesmo hash semantico `2265D60C104B2FC3AF9AC8A8A551D273A4B1852DAFFE03508569F978B4B387BE`, sem duplicar itens, logs ou alterar gold.
- Ao final, o banco original foi restaurado byte por byte com o mesmo SHA-256; nenhum WAL ou SHM permaneceu ao lado do save.

Matriz de engine:

- Um harness temporario executou 39/39 checks deterministas e foi removido depois do QA.
- O plano inicial confirmou 11 objetivos, sendo quatro Headquarters, tres Projects e quatro Wardrobe.
- A classificacao confirmou dois `Ready`, seis `Need Materials`, tres `Locked`, 2.100g listados e cobertura de 28/62 materiais.
- Todos os sete materiais demandados resolveram pelo menos uma fonte real de hunt.
- Apenas stacks root, unlocked, guild-owned e seguras foram contadas; locked, nested e ownership de personagem ficaram protegidos.
- Financiar `Clear the Annex` consumiu exatamente 100g e Old Cloth x2, avancou para Iron Ore e preservou a cobertura correta de 28/62.
- Uma transacao com apenas material protegido foi bloqueada sem criar novo objeto ou efeito parcial.
- A troca Wardrobe gold-only custou exatamente 350g, sumiu da fila apos unlock e bloqueou repeticao sem novo gasto.
- Campanha completa retornou plano vazio; roster vazio bloqueou todas as rotas por level e estado malformado foi normalizado sem `NaN`.

QA visual e navegacao:

- O board exibiu os mesmos 11 objetivos, dois prontos, 34 materiais faltantes, 2.100g e cobertura 28/62.
- Filtros Projects e Wardrobe mostraram exatamente tres e quatro ordens; Noble Adventurer foi reconhecido como gold-only.
- `Open Wardrobe` abriu o hall correto e o fechamento retornou ao Character Hall.
- `Open Hunt` em Field Supply Station abriu Trollwood Camp, selecionou Lyra ociosa level 26 e chegou ao Hunt Assignment.
- Em 1280, 960, 700 e 430 px nao houve overflow horizontal da pagina ou do Guild Logistics Board.
- O console do navegador registrou somente a falha esperada do plugin SQLite fora do Tauri, seguida pelo uso do mock local.

Validacoes tecnicas:

- `npm.cmd run build` passou antes e depois do QA com 351 modulos.
- `npm.cmd run tauri:build` gerou o executavel release e os instaladores MSI e NSIS sem erro.
- O executavel Tauri release foi aberto duas vezes contra o SQLite real, com encerramento gracioso e conteudo estavel.
- Nenhum arquivo de gameplay, schema ou persistencia precisou ser alterado nesta etapa.

Limitacoes mantidas:

- Os cliques de interface foram exercitados no frontend Vite; o load e a estabilidade do SQLite foram verificados no executavel Tauri.
- O board continua derivado e read-only, sem reserva de recursos, prioridade persistente ou dispatch automatico.
- Workbench, Forge, Imbuements e receitas escolhidas continuam fora do ledger global.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 67 - Campaign Pinboard e prioridades logisticas.

## Etapa 67 - Campaign Pinboard e prioridades logisticas

Status: concluida.

Modelo persistente:

- `GuildLogisticsState` guarda ate tres `pinnedObjectiveIds` em ordem de prioridade.
- O novo campo `logistics_json` pertence a guilda e recebe `{ pinnedObjectiveIds: [] }` em saves antigos.
- Normalizacao remove ids vazios, duplicados, tipos invalidos e entradas alem do limite de tres.
- Headquarters e Projects passaram a usar ids estaveis por facility/projeto, permitindo que o pin acompanhe niveis ou fases seguintes.
- Objetivos concluidos ou inexistentes nao aparecem no pinboard nem ocupam limite durante a proxima operacao.

Regras do pinboard:

- `Pin order` adiciona a ordem selecionada; o quarto pin fica bloqueado.
- `Unpin`, `Up` e `Down` alteram somente a lista ordenada de prioridades.
- Operacoes repetidas sao idempotentes e um lock curto na interface protege cliques consecutivos antes do rerender.
- Pins aparecem primeiro na fila global e o filtro `Pinned` mostra somente as prioridades ativas.
- Pins nao reservam gold ou materiais, nao financiam objetivos e nao iniciam hunts automaticamente.

Interface:

- O novo `Priority Pinboard` mostra tres slots fixos, categoria, status e numero de prioridade.
- O resumo focado agrega cobertura, necessidade e deficit material apenas das ordens fixadas.
- A fila identifica `Priority 1..3`, enquanto o dossier permite pin/unpin da ordem selecionada.
- Controles Up/Down respeitam os extremos e ficam desabilitados quando nao ha movimento valido.
- Regras responsivas empilham resumo e slots antes de comprimir textos ou comandos.

Arquivos criados:

- `src/game-engine/logistics/normalizeGuildLogisticsState.ts`.
- `src/game-engine/logistics/updateGuildLogisticsPin.ts`.

Arquivos principais alterados:

- `src/shared/types.ts`.
- `src/game-engine/logistics/buildGuildLogisticsPlan.ts`.
- `src/components/logistics/GuildLogisticsBoard.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/app/App.tsx`.
- `src/database/migrations.ts`.
- `src/database/saveMapper.ts`.
- `src/database/saveGameRepository.ts`.
- `src/data/mockGuild.ts`.
- `src/styles.css`.
- `src/data/clientUpdates.ts`.

Validacao realizada:

- `npm.cmd run build` passou com 353 modulos.
- Uma matriz temporaria passou em 25/25 checks de normalizacao, limite, duplicacao, reordenacao, unpin, ids obsoletos, fase seguinte, agregacao e mapper SQLite.
- O frontend confirmou 0/3, pin de tres ordens, bloqueio do quarto, prioridade manual, filtro com tres resultados e progresso focado 10/13.
- A composicao desktop do pinboard, fila e dossier foi inspecionada visualmente sem sobreposicao.
- O console web mostrou apenas o fallback esperado do plugin SQLite fora do Tauri.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A migration criou `logistics_json`; dois pins sobreviveram a duas cargas nativas com 674g, 26 itens, dez logs e `integrity_check: ok`.
- O SQLite original foi restaurado byte por byte com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes atuais:

- Nao ha notificacao quando uma prioridade fica pronta nem limpeza gravada imediatamente ao concluir uma ordem; pins inativos sao ignorados e limpos na proxima edicao.
- O pinboard nao inclui Workbench, Forge, Imbuements ou receitas sob demanda.
- O teste visual desta etapa cobriu o viewport desktop; a matriz responsiva completa fica para o QA dedicado.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 67.5 - QA do Campaign Pinboard no Tauri/SQLite.

## Etapa 67.5 - QA do Campaign Pinboard no Tauri/SQLite

Status: concluida sem bug funcional novo.

Matriz de engine:

- Um harness temporario executou 41/41 checks e foi removido depois da validacao.
- Normalizacao rejeitou tipos invalidos, ids vazios e duplicados, preservou a ordem e limitou o estado a tres pins.
- O Field Supply Station permaneceu fixado ao avancar de fase 1/3 para 2/3 e 3/3.
- A demanda focada mudou de Old Cloth para Iron Ore e depois para duas linhas, sempre usando apenas a fase atual.
- Ao concluir a terceira fase, o projeto saiu da fila, do pinboard e dos totais focados sem perder a referencia persistida antes da proxima edicao.
- Fixar uma nova ordem limpou o id concluido; o mesmo fluxo foi repetido apos desbloquear Noble Adventurer pela Wardrobe.
- O quarto pin, Up no primeiro slot, Down no ultimo slot, pin duplicado e unpin duplicado preservaram identidade sem efeito parcial.
- Reordenacao valida moveu exatamente uma posicao e nao mutou a guilda de entrada.
- Stacks locked e nested com quantidade alta continuaram fora da cobertura focada.
- Mapper SQLite recuperou JSON quebrado e removeu duplicatas com seguranca.

QA visual e responsivo:

- O pinboard foi exercitado com tres prioridades em viewports reais de iframe com 960, 700 e 430 px.
- Em todos os tamanhos, `pageScroll === pageClient`, `boardScroll === boardClient` e `pinScroll === pinClient`.
- O layout de 430 px empilhou os tres slots e os cinco filtros em uma coluna sem texto ou controles sobrepostos.
- Um clique duplo em `Unpin Contract Archive` removeu somente esse pin e deixou os outros dois ativos.
- O frontend web registrou apenas o fallback esperado do plugin SQLite e erros de `MutationObserver` do wrapper de iframe usado no QA; nao existe `MutationObserver` no codigo `src` do app.

Tauri e SQLite:

- O SQLite original recebeu backup byte a byte com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- Uma fixture gravou espacos, id duplicado, valor numerico e mais de tres entradas em `logistics_json`.
- A primeira carga Tauri normalizou o campo para Project, Wardrobe e Headquarters, nessa ordem.
- A segunda carga manteve os mesmos tres pins e o hash semantico `3C1601F6BDF8BE202F34A6997F3F17DF93B5E2C5AFB849446E1B1C303BC49A44`.
- `integrity_check` permaneceu `ok`, com 674g, 26 itens e dez activity logs, sem duplicacao.
- O banco original foi restaurado com o mesmo SHA-256 e sem WAL, SHM ou backup temporario restante.

Validacoes tecnicas:

- `npm.cmd run build` passou no baseline com 353 modulos.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram novamente no fechamento, com MSI e NSIS gerados.
- Nenhum arquivo de gameplay, schema ou persistencia precisou ser corrigido nesta etapa.
- O aviso conhecido de bundle JavaScript acima de 500 kB permanece.

Limitacoes mantidas:

- Pins concluidos deixam de aparecer imediatamente, mas o id inativo so e removido do JSON na proxima edicao do pinboard.
- O sistema ainda nao emite badge ou Activity Log automatico quando uma prioridade fica pronta.
- Pins continuam sem reservar recursos ou executar transacoes automaticamente por design.

Proximo passo sugerido:

- Etapa 68 - Logistics Alerts e notificacoes de campanha.

## Etapa 68 - Logistics Alerts e notificacoes de campanha

Status: concluida.

Modelo e regras:

- `GuildLogisticsState` agora persiste `notifiedReadyKeys` e `unreadReadyKeys` junto aos tres pins existentes.
- Cada chave combina id estavel e revisao atual (`targetLabel`), permitindo novo alerta quando um Project avanca de fase ou uma facility avanca de level.
- Uma prioridade gera alerta somente na transicao para `ready`; permanecer pronta, abrir o board ou recarregar o save nao duplica a notificacao.
- Se a ordem deixar de estar pronta, seu guard atual e removido e uma futura volta a `ready` pode anunciar novamente.
- Unpin e limpeza de objetivo inativo removem somente os alertas associados; reordenar preserva todos os estados.
- Normalizacao limita guards a vinte, nao lidos aos tres pins e recupera arrays ausentes, invalidos ou inconsistentes.

Interface e integracoes:

- O menu lateral mostra badge numerico em Logistics quando ha prioridades prontas nao revisadas.
- O Pinboard mostra banner com quantidade, nomes e comando `Mark reviewed`.
- Cards nao lidos recebem destaque sutil sem alterar o status real da ordem.
- Revisar limpa apenas o estado nao lido; o objetivo continua fixado e pronto.
- Cada nova transicao registra uma unica entrada `Logistics priority ready` no Activity Log.
- Locks curtos protegem pin/unpin/reorder e review contra cliques consecutivos antes do rerender.

Arquivos criados:

- `src/game-engine/logistics/syncGuildLogisticsAlerts.ts`.

Arquivos principais alterados:

- `src/shared/types.ts`.
- `src/game-engine/logistics/normalizeGuildLogisticsState.ts`.
- `src/game-engine/logistics/updateGuildLogisticsPin.ts`.
- `src/components/logistics/GuildLogisticsBoard.tsx`.
- `src/components/layout/CharacterSideMenu.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/app/App.tsx`.
- `src/data/mockGuild.ts`.
- `src/data/clientUpdates.ts`.
- `src/styles.css`.

Validacao realizada:

- Harness temporario passou em 34/34 checks de normalizacao, idempotencia, review, fases, perda/retorno de prontidao, dois pins, reordenacao e unpin.
- No frontend, fixar Field Supply Station mostrou badge e banner; review removeu ambos e dois cliques geraram somente um log.
- Noble Adventurer pronta gerou um novo alerta independente depois da primeira prioridade ser revisada.
- Viewports reais de iframe em 960, 700 e 430 px ficaram sem overflow horizontal; o banner movel manteve texto e comando dentro de 415 px uteis.
- `npm.cmd run build` passou com 354 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Um save legado sem `logistics_json` recebeu a migration oficial e normalizou os novos arrays vazios.
- Fixture nativa com Field Supply Station pronta gravou uma chave unread e um Activity Log; a segunda carga manteve exatamente um alerta/log.
- `integrity_check` permaneceu `ok` e o SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes atuais:

- Alertas existem somente para prioridades fixadas; ordens prontas fora do pinboard nao geram ruido.
- Review nao financia, conclui, reserva recursos ou inicia hunts; todo fluxo continua manual e offline.
- Nao ha notificacao do sistema operacional, som, toast global ou automacao em background.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 68.5 - QA dos Logistics Alerts no Tauri/SQLite.

## Etapa 68.5 - QA dos Logistics Alerts no Tauri/SQLite

Status: concluida sem bug funcional novo.

Matriz de engine e mapper:

- Um harness temporario passou em 56/56 checks e foi removido depois da validacao.
- Defaults, null, campos ausentes, tipos invalidos, espacos, duplicatas, guards orfaos e limite de tres pins normalizaram com seguranca.
- `mapGuild` recuperou `logistics_json` quebrado, carregou save legado sem o campo e preservou JSON valido.
- Duas prioridades prontas geraram dois unreads; a prioridade bloqueada permaneceu silenciosa.
- Sync repetido, review repetido e estado pronto revisado preservaram identidade sem emitir efeito adicional.
- Unpin removeu somente o guard associado e repin de uma ordem pronta gerou uma transicao nova.
- Field Supply Station foi acompanhado pelas tres fases; fases 2 e 3 geraram um alerta cada e a conclusao limpou guards/unreads sem alerta falso.
- Perder prontidao removeu o guard; recuperar prontidao e mudar `targetLabel` geraram alertas novos conforme a revisao atual.

QA visual e responsivo:

- Fixar Field Supply Station exibiu banner, badge `1`, um card unread e uma entrada `Logistics priority ready`.
- Dois cliques consecutivos em `Mark reviewed` removeram banner/badge e criaram somente um log de review.
- Noble Adventurer gerou um alerta independente depois do primeiro objetivo ter sido revisado.
- O layout desktop permaneceu em 1280/1280 px, sem overflow horizontal.
- Viewports reais de iframe em 960, 700 e 430 px mantiveram `scrollWidth === clientWidth`.
- Em 430 px, o alerta ocupou 342 px dentro de 415 px uteis e manteve o comando de review disponivel.
- O frontend web apresentou somente o fallback esperado do plugin SQLite fora do Tauri.

Tauri e SQLite:

- O SQLite original recebeu backup byte a byte com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- A primeira carga nativa migrou o save legado e recuperou `{broken` para os tres arrays vazios, sem Activity Log indevido.
- Uma fixture ruidosa misturou espacos, duplicata, numero, seis pins e guards orfaos.
- A carga seguinte preservou Field Supply Station ja notificada, anunciou somente Noble Adventurer e manteve Contract Archive bloqueada em silencio.
- O estado final ficou com tres pins, dois guards/unreads e exatamente um novo Activity Log.
- Um segundo reload manteve o hash semantico `08D04F950D2CCC1159CA19E7F8B17A76766081B76345831C699E75ADC78CCB7E` e nao duplicou o log.
- Uma carga com os dois guards revisados preservou `unreadReadyKeys: []` sem reativar notificacoes.
- `integrity_check` permaneceu `ok`; o banco original foi restaurado com hash identico e sem WAL, SHM ou backup restante.

Validacoes tecnicas:

- `npm.cmd run build` passou no baseline com 354 modulos.
- Nenhum arquivo de engine, UI, schema ou persistencia precisou de correcao nesta etapa.
- O fluxo visual foi exercitado no frontend; migrations, normalizacao, autosave e reload foram exercitados no executavel Tauri.
- Permanece somente o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 69 - Campaign Operations Dashboard.

## Etapa 69 - Campaign Operations Dashboard

Status: concluida.

Modelo derivado:

- `buildCampaignOperationsDashboard` consolida guilda, Guild Depot, roster e relogio local sem gravar estado novo.
- Cada aventureiro recebe status operacional, label, alvo, progresso, tempo restante, prontidao e destino `Action` ou `Explore`.
- Acoes com `readyToResolve` ou prazo valido vencido aparecem como report prontas; datas antigas invalidas permanecem seguras e mostram `Timer unavailable`.
- A expedicao de suporte usa o snapshot persistido existente para nome, equipe, chance, progresso e report pronta.
- O Campaign Focus reaproveita os tres pins reais de Logistics e calcula cobertura/deficit apenas da revisao atual.
- Contratos financiaveis, candidatos recrutaveis, projects concluidos e Headquarters levels sao derivados pelos engines existentes.
- Uma fila de ate cinco recomendacoes prioriza reports, alertas, expedicao, materiais, recruitment e aventureiros idle.

Interface e navegacao:

- Operations entrou no menu lateral logo depois de Details e nos atalhos do Character Hall.
- A janela ampla oculta roster lateral, menu e painel direito para usar toda a area central.
- Hero resume aventureiros disponiveis, ativos, reports prontas e prioridades fixadas.
- Adventurer Roster mostra os cinco personagens, status, destino, timer/progresso e comando `Assign`, `Review` ou `Recover`.
- Next Orders abre somente os sistemas reais; nenhum comando e executado dentro do dashboard.
- Guild Expedition mostra dispatch atual ou quantidade de contratos financiaveis e abre Contracts.
- Priority Focus abre Logistics, Projects, Headquarters ou Wardrobe conforme o objetivo real.
- Recent Activity reutiliza as seis entradas mais recentes do Activity Log.
- Operations e Logistics foram incluidos entre as telas restauraveis do cliente local.

Arquivos criados:

- `src/game-engine/operations/buildCampaignOperationsDashboard.ts`.
- `src/components/operations/CampaignOperationsDashboard.tsx`.

Arquivos principais alterados:

- `src/components/layout/MainPanel.tsx`.
- `src/components/layout/CharacterSideMenu.tsx`.
- `src/components/character/CharacterDetails.tsx`.
- `src/client-preferences/clientPreferences.ts`.
- `src/app/App.tsx`.
- `src/styles.css`.
- `src/data/clientUpdates.ts`.
- `docs/PROJECT_STATUS.md`.

Validacao realizada:

- Harness temporario passou em 48/48 checks de roster idle/active/ready/dead, timers, datas invalidas, expedicao, prioridades, recomendacoes e imutabilidade.
- O frontend abriu Operations pelo menu e mostrou 3 aventureiros disponiveis, 2 ativos, 5 registrados e 3 next orders no mock atual.
- `Open Contracts` abriu o Contracts Board e `Assign` abriu Explore com o personagem selecionado.
- O desktop 1280x720 manteve `scrollWidth === clientWidth`, cinco linhas de roster e tres recomendacoes visiveis.
- Viewports reais de iframe em 960, 700 e 430 px ficaram sem overflow na pagina ou no dashboard.
- Em 430 px, nenhum button, strong, small ou span medido excedeu seu container.
- `npm.cmd run build` passou com 356 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Duas cargas nativas mantiveram o hash semantico `51F0589FDA9E7285D08D49118388E03F53AC576BFDCEA58E1EDD0704CAA324FF`.
- O SQLite permaneceu com 674g, 12 renown, 5 personagens, 26 stacks, quantidade total 95, 10 logs e `integrity_check: ok`.
- O banco original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem sidecars ou backup restante.

Limitacoes atuais:

- O dashboard e deliberadamente read-only; coleta, dispatch, financiamento, recrutamento e inicio de hunt continuam nos respectivos sistemas.
- Timers legados no formato apenas `HH:mm` nao podem ser comparados com a data atual e sao identificados como indisponiveis.
- Nao ha agenda automatica, fila de personagens, reserva de recursos, notificacao do sistema operacional ou processamento online.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 69.5 - QA do Campaign Operations Dashboard no Tauri/SQLite.

## Etapa 69.5 - QA do Campaign Operations Dashboard no Tauri/SQLite

Status: concluida com uma correcao funcional.

Correcao realizada:

- Saves legados podem persistir `character.status` e `currentAction` separadamente e carregar uma acao ativa com status `idle`.
- O dashboard anteriormente mostrava essa linha como Idle e contava o mesmo aventureiro em Available e In the field.
- A projecao agora prioriza um `currentAction.type` ativo valido, usa fallback operacional seguro para combinacoes invalidas e calcula disponibilidade somente pelas linhas realmente idle.
- A correcao e apenas derivada; nenhum personagem, acao ou campo SQLite e regravado pelo dashboard.

Matriz de engine:

- Harness temporario passou em 93/93 checks e foi removido depois da validacao.
- Foram cobertos roster idle, ativo, pronto, morto, vazio e o par legado `status: idle` com acao ativa.
- Deadlines exatos, flag `readyToResolve`, timer quebrado, gold `NaN`, expedicao invalida, expedicao ativa/pronta e membro orfao permaneceram seguros.
- Prioridades preservaram ordem, cobertura limitada ao requisito, deficits nao negativos e fila de recomendacoes limitada a cinco ids unicos.
- Todos os tempos, percentuais e contadores permaneceram finitos e os inputs nao sofreram mutacao.

QA visual e navegacao:

- Operations abriu pelo Character Hall com 3 aventureiros disponiveis, 2 ativos, 5 registrados e 3 Next Orders no mock atual.
- `Open Contracts`, Logistics e Projects abriram seus halls reais.
- `Assign` selecionou Arkon e abriu Explorar; `Review` selecionou Ayla e abriu Current Action.
- O desktop 1280x720 ocultou os paineis laterais, manteve cinco linhas de roster e tres recomendacoes sem overflow horizontal.
- Viewports de 960, 700 e 430 px mantiveram `scrollWidth === clientWidth` na pagina e no dashboard.
- Nenhum button, strong, small, span ou time medido excedeu seu container nos tres breakpoints compactos.
- O frontend web registrou somente o fallback esperado do plugin SQLite fora do Tauri.

Tauri e SQLite:

- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- As primeiras cargas completaram uma normalizacao legada de Headquarters adicionando `totalInvestedMaterials: 0`; somente timestamps tecnicos acompanharam o autosave.
- Uma carga adicional manteve o hash semantico `337BC492F581B4E3E4B6873270FED6F71B1DB09C3E066CF43C41C23B0DDBEA37` antes e depois.
- O estado normalizado permaneceu com 674g, 12 renown, 5 personagens, 35 skills, 26 stacks, quantidade total 95 e 10 logs.
- `PRAGMA integrity_check` permaneceu `ok` em todas as leituras.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM, snapshot ou backup restante.

Validacoes tecnicas:

- `npm.cmd run build` passou antes e depois da correcao com 356 modulos.
- O dashboard permaneceu read-only e nenhuma migration ou coluna nova foi necessaria.
- Permanece somente o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 70 - proxima expansao da campanha offline.

## Etapa 70 - Guild Raid Board offline

Implementado:

- O board de Bosses foi reformulado como central de raids offline da guilda, sem contas, servidor, premium ou rotacao online.
- Os seis bosses existentes receberam taxas locais de preparacao entre 80g e 900g, sempre inferiores ao menor gold de vitoria do respectivo contrato.
- A taxa e validada contra `guild.gold`, consumida uma unica vez no lancamento e registrada no Activity Log; cancelar uma tentativa nao devolve o custo de preparacao.
- O briefing mostra level, acesso, tamanho da equipe, duracao, risco, taxa, saldo da guilda, experiencia, gold, renown e cooldown.
- O Strike Team identifica aventureiros aptos, ocupados, abaixo do level, sem acesso ou em cooldown pessoal e impede adicionar membros inelegiveis.
- Possible Guild Depot Loot usa os itemIds reais, raridade, quantidade e chance ja definidos no contrato, sem prometer drop garantido.
- O Raid Report reaproveita o resultado real do boss, incluindo vitoria/derrota, recompensas, loot e coleta pelo fluxo existente.
- Timestamps de inicio, fim e cancelamento de boss agora usam ISO completo; a action tambem guarda snapshot do custo pago.
- O comando de debug para limpar cooldown foi removido da interface de producao.
- Guild Codex, catalogo de bosses e Explore exibem a taxa de entrada de forma consistente.
- Nenhuma migration ou coluna SQLite nova foi necessaria; bosses continuam usando `currentAction`, cooldowns e recompensas ja persistidos.

Validacoes:

- Harness temporario passou em 34/34 checks e foi removido apos cobrir custos, saldo insuficiente/exato, `NaN`, timestamps ISO, imutabilidade, party, cooldown e cobranca unica por raid.
- Todos os seis contratos mantiveram itemIds de loot validos e taxa menor que o gold minimo de vitoria.
- O fluxo web abriu Bosses, trocou de contrato, atualizou taxa/loot, bloqueou personagem inelegivel e nao exibiu catalogo duplicado nem comando de debug.
- Viewports de 1280, 960, 700 e 430 px ficaram sem overflow horizontal; uma barra interna encontrada no desktop foi corrigida antes da validacao final.
- `npm.cmd run build` passou com 356 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Tres cargas nativas mantiveram 674g, 12 renown, 5 personagens, 35 skills, 26 stacks, quantidade 95, 10 logs e `PRAGMA integrity_check: ok`.
- A primeira carga materializou defaults antigos de Headquarters, Logistics, Bazaar e Crafting; as cargas seguintes mantiveram o mesmo hash semantico `671C8BF03255E3FE9E11C9C5B7D550718603001D651A1076548B2694485DBCD7`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- O desfecho da raid continua resolvido pelo motor idle existente; nao ha nova cena de combate de boss em tempo real.
- Taxas sao valores iniciais de balanceamento e ainda precisam de uma sessao longa com campanha avancada.
- Nao foram adicionados novos bosses, reroll, matchmaking, premium, pagamento ou conteudo online.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 70.5 - QA aprofundada do Guild Raid Board no Tauri/SQLite.

## Etapa 70.5 - QA do Guild Raid Board no Tauri/SQLite

Status: concluida com cinco correcoes funcionais.

Correcoes realizadas:

- `getClockElapsedMs` e `getClockRemainingMs` agora aceitam timestamps ISO absolutos e relogios legados `HH:mm:ss`; valores invalidos retornam zero sem produzir `NaN`.
- O retorno de uma raid cancelada nao pode mais terminar imediatamente por interpretar ISO como relogio; `getTravelRemainingMs` usa o parser compartilhado seguro.
- A resolucao exige que boss, membros e ids correspondam a raid ativa e, quando o snapshot existe, rejeita papeis alterados depois do lancamento para impedir reroll de risco.
- Quando a strike team nao inclui o personagem previamente selecionado, iniciar a raid agora seleciona o primeiro participante antes de abrir Current Action.
- Saldos e cooldowns malformados exibem zero/Ready de forma segura em vez de `NaN`.

Matriz de engine:

- Harness temporario passou em 184/184 checks e foi removido depois da validacao.
- Os seis contratos cobriram taxa, recompensa minima, duracao, cooldown, itemIds, chances e quantidades de loot.
- Foram validados saldo exato, insuficiente, negativo e `NaN`, party errada, vazia, duplicada, membro ausente, ocupado, abaixo do level, sem acesso e em cooldown.
- Roles obrigatorios, snapshots imutaveis, custo unico, timestamps ISO, membro externo, resolucao unica e substituicao de cooldown permaneceram corretos.
- Resolucao com party idle, ids alterados ou role trocado foi bloqueada sem mutar personagens ou depot.
- Cancelamento, viagem ISO/legada, finalizacao antecipada, offline running/completed/ready e timestamps separados por mais de 12 horas permaneceram finitos e coerentes.

QA visual e de fluxo:

- Explore abriu os seis Boss contracts com taxas, gates, Strike Team, loot real, cooldowns e Raid Report.
- Arkon inelegivel manteve Launch Raid bloqueado; trocar para Lyra liberou o contrato starter.
- Clique duplo em Launch Raid debitou somente 80g, levando a guilda mock de 420g para 340g.
- Current Action abriu em Lyra com status Bossing, custo 80g, inicio/fim ISO, 8 minutos restantes e analyzer coerente.
- Cancelar criou retorno de 10 segundos em vez de concluir imediatamente.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, conteudo e Raid Board sem overflow horizontal ou texto excedendo containers.
- O console web apresentou somente o fallback esperado do plugin SQLite fora do Tauri.

Tauri e SQLite:

- `npm.cmd run build` passou com 356 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Cargas nativas baseline mantiveram o hash semantico `E1E0862CF697C27ECAC40540202FF21CEFD212315A63233C1CA370F4DA8CB5C2`, 674g, 12 renown, 5 personagens, 35 skills, 26 stacks, quantidade 95 e 10 logs.
- Uma fixture temporaria de raid ISO concluida em Lyra foi marcada `readyToResolve` uma unica vez, preservando target, custo, ids e roles.
- Cargas seguintes mantiveram o action hash `C4A2F8F0CC1FBCE001741A616815055799D817E1B70C067B949A47209FFB9B93` e `offlineElapsedMs` sem duplicacao.
- `PRAGMA integrity_check` permaneceu `ok` durante baseline e fixture.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- O desfecho ainda usa a simulacao idle existente e pode ser finalizado manualmente antes do timer para testes de gameplay.
- Nao houve sessao longa de balanceamento dos seis bosses em uma campanha avancada real.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 71.5 - QA aprofundada de Guild Level e Recruitment no Tauri/SQLite.

## Etapa 71 - Guild Level e Milestones offline

Implementado:

- `guild.renown` agora deriva automaticamente Guild Level, rank e titulo em seis milestones permanentes: E/1 em 0, D/2 em 10, C/3 em 25, B/4 em 50, A/5 em 90 e S/6 em 140 renown.
- Cada milestone expande a capacidade do roster em um lugar, de 6 aventureiros no Level 1 ate 11 no Level 6.
- O Recruitment Board mostra standing, progresso para o proximo nivel, todos os milestones, capacidade atual e requisitos de cada contrato.
- Os tres candidatos existentes receberam requisito de Guild Level e foram adicionados Bram Reed, Veyra Rune e Sable Rook, totalizando seis contratos locais fixos.
- Contratos continuam exigindo Career Points e `guild.gold`; o novo gate de Guild Level e cumulativo e nao substitui os requisitos existentes.
- Topbar e Character Hall mostram rank e nivel derivados do Renown atual.
- Saves antigos normalizam `renown`, `level` e `rank` no load/save; nenhum campo ou migration SQLite novo foi necessario.
- Guild Codex, Updates e descricao do Recruitment foram alinhados com a progressao offline.

Regras e seguranca:

- Renown negativo, fracionario, infinito ou `NaN` e normalizado para inteiro seguro nao negativo.
- Level e rank persistidos nunca sao fonte independente: valores antigos ou inconsistentes sao recalculados pelo Renown.
- Roster cheio, Guild Level insuficiente, Career Points insuficientes, gold insuficiente, candidato invalido e contrato repetido continuam bloqueando sem mutar o save.
- Recrutamento bem-sucedido cobra uma vez, adiciona exatamente um personagem completo e persiste pelo fluxo existente de personagens.

Validacoes:

- Harness temporario passou em 91/91 checks e foi removido apos cobrir milestones, thresholds, dados invalidos, itemIds, gates, capacidade, imutabilidade e contrato duplicado.
- Recruitment Board mostrou Rank D / Level 2, 12 renown, capacidade 7 e os seis milestones/candidatos no mock local.
- Bram Reed exibiu simultaneamente os bloqueios de Guild Level 4, 400 Career Points e 1.800g.
- Clique duplo no contrato de Tessa Vale cobrou somente 300g, reduziu 420g para 120g, levou o roster de 5 para 6 e registrou uma unica personagem.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, hall e milestones sem overflow horizontal.
- O console web apresentou somente o fallback esperado do SQLite fora do Tauri.
- `npm.cmd run build` passou com 358 modulos; `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O save nativo com 12 renown foi normalizado de Level 1 / Rank E para Level 2 / Rank D e permaneceu assim na segunda carga.
- As duas cargas preservaram 674g, 5 personagens, 35 skills, 26 stacks, 10 logs e `PRAGMA integrity_check: ok`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- A progressao inicial termina no Guild Level 6 / Rank S e possui somente seis candidatos fixos.
- Ainda nao existem dismiss, reroll de candidato, recrutamento procedural ou bonus passivo de dano/economia por Guild Level.
- Os thresholds, custos e requisitos ainda precisam de uma sessao longa de balanceamento em campanha avancada.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 71.5 - QA aprofundada de Guild Level e Recruitment no Tauri/SQLite.

## Etapa 71.5 - QA de Guild Level e Recruitment no Tauri/SQLite

Status: concluida com uma correcao funcional.

Correcao realizada:

- Elis Dawn era recrutada no Level 10 com `mystic-cap`, item que exige Level 12 e nao poderia ser equipado normalmente nessa fase.
- O contrato agora entrega `leather-helmet`, item real, compativel com Level 10 e com o slot de helmet, preservando level, vocacao, custo, skills e os demais itens da candidata.
- Candidatos ja persistidos continuam compativeis com o mapper; a mudanca afeta o loadout correto de novos contratos sem migration SQLite.

Matriz de engine:

- Harness temporario passou em 306/306 checks e foi removido depois da validacao.
- Os seis milestones cobriram threshold exato, um ponto abaixo/acima, rank, titulo, capacidade, proximo nivel e progresso finito.
- Renown negativo, fracionario, vazio, textual, `NaN`, infinito e acima do limite seguro foi normalizado sem produzir level, rank ou progresso invalidos.
- Os seis candidatos tiveram ids unicos, custos crescentes, itens existentes, slots corretos e restricoes de level/vocacao compativeis.
- Uma fixture de carreira maxima recrutou os seis candidatos em sequencia, levou o roster de 5 para 11 e cobrou exatamente 11.350g.
- Foram validados imutabilidade, ownership de equipamento, capacity inicial, timestamp ISO, candidato ausente, data invalida, gold `NaN`, roster cheio e contrato repetido.
- O save mapper recuperou rank/level obsoletos e JSON opcional quebrado sem quebrar a progressao.

QA visual e de fluxo:

- Recruitment Board exibiu os seis milestones, seis candidatos, Rank D / Level 2, 12 renown, capacidade 7 e 295 Career Points no mock local.
- O dossier de Elis mostrou Novice Wand, Leather Helmet, Apprentice Robe e Mana Potion x3, com os bloqueios corretos de Guild Level e gold.
- Clique duplo no contrato de Tessa cobrou apenas 300g, reduziu 420g para 120g, levou o roster de 5 para 6 e registrou uma unica personagem.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, hall, cards, milestones e textos sem overflow horizontal.
- O console web apresentou somente o fallback esperado do SQLite fora do Tauri.

Tauri e SQLite:

- `npm.cmd run tauri:build` passou com 358 modulos e gerou executavel release, MSI e NSIS.
- Fixtures nativas persistiram exatamente 0/E/1, 10/D/2, 25/C/3, 50/B/4, 90/A/5 e 140/S/6.
- Renown textual corrompido foi recuperado como 0/E/1 com `PRAGMA integrity_check: ok`.
- Duas cargas consecutivas em Rank S preservaram 674g, 5 personagens, 35 skills, 26 stacks e 10 logs.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes mantidas:

- A progressao termina no Guild Level 6 / Rank S e os contratos continuam fixos, sem dismiss, reroll ou geracao procedural.
- Guild Level ainda expande roster e libera candidatos, mas nao concede bonus passivos de combate ou economia.
- Custos e thresholds ainda precisam de uma sessao longa em campanha avancada real.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 72 - recompensas e desbloqueios offline por Guild Level.

## Etapa 72 - Recompensas offline por Guild Level

Implementado:

- Cada um dos seis Guild Levels libera um cache unico e permanente no Recruitment Board, sem moeda nova, premium, conexao ou monetizacao.
- As recompensas sao: Level 1 Minor Health Potion x3, Level 2 200g, Level 3 Iron Ore x4, Level 4 Health Potion x5, Level 5 Enchanted Dust x1 e Level 6 Golden Guild Sigil.
- Gold entra em `guild.gold`; supplies e materiais usam itemIds reais e sao empilhados no Guild Depot, independentemente do personagem selecionado.
- Golden Guild Sigil usa o desbloqueio existente de Collections e ativa seu badge; se ja estiver desbloqueado, o cache concede 1.000g como fallback fixo.
- Caches alcancados podem ser resgatados em qualquer ordem. A engine revalida Guild Level e ledger antes de aplicar a recompensa, impedindo clique duplo e resgate repetido.
- O Recruitment Board mostra os seis caches, status Locked/Ready/Claimed, total resgatado e badge de recompensas prontas no menu.
- O Activity Log recebe um unico registro por resgate e o estado persiste em `progression_rewards_json` no SQLite.
- Saves antigos, JSON ausente ou corrompido recebem ledger vazio; levels invalidos, historico duplicado e timestamps ruins sao normalizados defensivamente.

Validacoes realizadas:

- Harness temporario passou em 88/88 checks e foi removido depois de cobrir dados, gates, ordem livre, imutabilidade, stacks, Collections, fallback, duplicacao e save mapper.
- No mock Level 2, o Recruitment Board mostrou dois caches prontos e quatro bloqueados; duplo clique resgatou cada cache uma vez, levou o saldo de 420g para 620g e removeu o badge quando nao restou recompensa pronta.
- Os dois resgates produziram exatamente dois Activity Logs. Os cards, textos e pagina ficaram sem overflow horizontal em 1280, 960, 700 e 430 px.
- O console web apresentou somente o fallback esperado do SQLite fora do Tauri.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 362 modulos; o Tauri gerou executavel release, MSI e NSIS.
- A migration nativa adicionou `progression_rewards_json` ao save antigo e inicializou o ledger vazio sem alterar Guild Level 2 / Rank D.
- Uma fixture com os claims 1 e 2 permaneceu identica depois de duas cargas nativas, sem duplicacao ou perda.
- As cargas preservaram 1 guilda, 5 personagens, 35 skills, 26 stacks, 10 logs e `PRAGMA integrity_check: ok`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- Existem seis caches fixos, sem tiers de cache, escolhas alternativas, bonus passivo ou repeticao depois do Rank S.
- Os valores ainda precisam de balanceamento prolongado dentro de uma campanha completa.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 72.5 - QA aprofundada das recompensas por Guild Level no Tauri/SQLite.

## Etapa 72.5 - QA das recompensas por Guild Level no Tauri/SQLite

Status: concluida com uma correcao funcional.

Correcao realizada:

- O helper compartilhado de stacks ignorava o estado `locked`; uma recompensa podia se fundir com um stack protegido do mesmo item e ficar indisponivel para uso.
- `mergeStackableItems` agora inclui `locked/unlocked` na identidade do stack, preservando o recurso protegido e criando ou usando um stack separado para a recompensa utilizavel.
- Localizacao, owner e container continuam fazendo parte da chave; a mudanca nao move itens nem remove protecao existente.

Matriz de engine:

- Harness temporario passou em 13.098/13.098 checks e foi removido depois da validacao.
- As seis definicoes foram validadas contra milestones, itemIds reais, Collections, quantidades, fallback e payload unico.
- Todas as fronteiras de Renown foram cobertas imediatamente antes, no threshold e depois de cada Guild Level.
- As 720 ordens possiveis de claim terminaram com o mesmo gold, materiais, supplies, cosmetic e ledger completo.
- Foram validados bloqueio por level, claim duplicado, imutabilidade, timestamp invalido, `gold` NaN, depot nulo, stack protegido, stack em container, JSON ausente e JSON corrompido.
- Golden Guild Sigil novo ativa Collections; cosmetic ja possuido concede exatamente 1.000g e conclui o milestone uma unica vez.

QA visual e de fluxo:

- No mock Level 2, o Recruitment Board exibiu seis cards, dois Ready e quatro Locked.
- Level 2 foi resgatado antes do Level 1, comprovando ordem livre; cada duplo clique produziu um unico claim.
- O saldo passou de 420g para 620g, o badge foi de 2 para 1 e depois desapareceu, e dois Activity Logs foram criados na ordem correta.
- O Guild Depot mostrou Minor Health Potion x3 sem depender do personagem selecionado.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, board, cards e textos sem overflow horizontal ou sobreposicao.
- O console web apresentou somente o fallback esperado do SQLite fora do Tauri.

Tauri e SQLite:

- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 362 modulos e geraram executavel release, MSI e NSIS.
- A migration de save antigo criou `progression_rewards_json` vazio preservando Guild Level 2 / Rank D.
- Uma fixture Rank S manteve os seis claims, historico completo e Golden Guild Sigil novo depois de duas cargas nativas.
- Stacks de Minor Health Potion `7 locked + 3 usable` permaneceram separados nas duas cargas, sem perda ou duplicacao.
- A fixture preservou 1 guilda, 5 personagens, 35 skills, 28 stacks, 10 logs e `PRAGMA integrity_check: ok`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes mantidas:

- Os seis caches continuam fixos e a progressao encerra no Guild Level 6 / Rank S.
- Nao existem escolhas alternativas de cache, repeticao, premium, bonus passivo ou moeda nova.
- O balanceamento dos valores ainda precisa de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 73 - Guild Renown Objectives offline, com fontes e metas claras para avancar os Guild Levels.

## Etapa 73 - Guild Renown Objectives offline

Implementado:

- O Recruitment Board recebeu seis Renown Orders permanentes derivados diretamente do save, sem contador paralelo, tarefa online ou rotacao temporal.
- First Chartered Deed exige 1 quest e concede +2 Renown; Field Research Ledger exige 25 kills no Bestiary e concede +3.
- Reliable Contractors exige 2 expeditions bem-sucedidas e concede +4; Hall Under Arms exige 2 upgrades totais da Headquarters e concede +4.
- Lasting Guild Work exige 1 Guild Project completo e concede +5; Expanded Company exige 1 candidato recrutado e concede +5.
- Os seis objetivos somam somente 23 Renown, funcionando como orientacao e impulso inicial, sem substituir quests, bosses, contracts ou projects como fontes recorrentes.
- Cada card mostra sistema-fonte, progresso atual, target, reward, status e comando para abrir a fonte quando ainda esta incompleto.
- Claims podem ocorrer em qualquer ordem, sao revalidados pela engine e geram um unico Activity Log; duplo clique ou claim repetido nao soma Renown novamente.
- O badge de Recruitment combina Renown Orders prontos e Guild Level caches disponiveis; um claim que cruza threshold atualiza Level, Rank e caches imediatamente.
- O estado `renownObjectives` persiste em `renown_objectives_json`; saves antigos ou JSON corrompido recebem ledger vazio sem quebrar a guilda.

Validacoes:

- Harness temporario passou em 28.138/28.138 checks e foi removido apos cobrir dados, seis fontes, estados vazios, bloqueios, imutabilidade, `NaN`, limite seguro, mapper e duplicacao.
- Todas as 720 ordens possiveis de claim terminaram em exatamente +23 Renown, seis ids e seis entradas de historico.
- Partindo do mock com 12 Renown, os seis claims chegaram a 35, avancaram para Guild Level 3 / Rank C e liberaram o terceiro cache.
- No navegador, o mock mostrou um objetivo Ready e cinco incompletos; duplo clique em First Chartered Deed elevou Renown de 12 para 14 uma unica vez.
- O badge combinado passou de 3 para 2, o Activity Log registrou +2 Renown e Open Source navegou diretamente para o Bestiary.
- Viewports de 1280, 960, 700 e 430 px mantiveram board, cards, barras e textos sem overflow horizontal.
- O console web apresentou apenas o fallback esperado do SQLite fora do Tauri.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 366 modulos e geraram executavel release, MSI e NSIS.
- A migration nativa criou `renown_objectives_json` vazio preservando 12 Renown / Level 2 / Rank D no save antigo.
- Uma fixture completa preservou seis claims, historico, 35 Renown / Level 3 / Rank C em duas cargas nativas.
- As cargas mantiveram 1 guilda, 5 personagens, 35 skills, 26 stacks, 10 logs e `PRAGMA integrity_check: ok`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- Os seis objetivos sao fixos, permanentes e resgataveis uma unica vez; nao existem daily/weekly orders, reroll ou geracao procedural.
- O board orienta fontes existentes, mas nao inicia automaticamente uma atividade nem concede progresso idle passivo.
- O balanceamento dos targets e dos 23 Renown ainda precisa de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 73.5 - QA aprofundada dos Guild Renown Objectives no Tauri/SQLite.

## Etapa 73.5 - QA dos Guild Renown Objectives no Tauri/SQLite

Status: concluida com duas correcoes de robustez para saves malformados.

Correcoes realizadas:

- `completedQuestIds` agora so alimenta objetivos quando for uma lista de ids string validos; JSON semanticamente incorreto nao cria mais progresso falso de quest.
- O normalizador do Bestiary agora trata `progress`, `unlockedCharmIds` e `activeCharms` que nao sejam arrays como listas vazias.
- `charmPoints` invalido, infinito ou `NaN` agora normaliza para zero, impedindo contaminacao numerica do estado carregado.
- As correcoes preservam saves validos, regras, targets e as recompensas originais dos seis objetivos.

Matriz de engine:

- Harness temporario passou em 11.537/11.537 checks e foi removido depois da validacao.
- Todas as 720 ordens possiveis de claim terminaram em 35 Renown a partir de 12, com seis ids e seis entradas de historico.
- Foram cobertos ledger ausente/corrompido, ids desconhecidos, historico invalido, claim duplicado, timestamp invalido, `NaN`, `MAX_SAFE_INTEGER` e imutabilidade.
- As seis fontes reais foram exercitadas: quests, Bestiary, expeditions, Headquarters, Projects e recrutamento.
- Saves com `completedQuestIds: {}` e `bestiary.progress: {}` normalizaram sem claim indevido ou excecao.

QA visual e de fluxo:

- No mock, o Recruitment Board mostrou um Renown Objective pronto e dois Guild Level caches, totalizando badge 3.
- Um duplo clique em First Chartered Deed concedeu somente +2 Renown, alterou o card para Claimed e gerou um unico Activity Log.
- O total de Renown passou de 12 para 14 e o badge combinado caiu de 3 para 2 imediatamente.
- Open Source em Field Research Ledger abriu diretamente Hunting Research / Bestiary.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, board e seis cards sem overflow horizontal ou conteudo interno cortado.
- O console web apresentou somente o fallback esperado do SQLite fora do Tauri.

Tauri e SQLite:

- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 366 modulos e geraram executavel release, MSI e NSIS.
- A fixture antiga recebeu `renown_objectives_json` vazio preservando 12 Renown / Level 2 / Rank D.
- Uma fixture completa preservou seis claims, historico com +23 Renown e 35 Renown / Level 3 / Rank C apos duas cargas nativas.
- As cargas mantiveram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs, com `PRAGMA integrity_check: ok`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes mantidas:

- Os seis objetivos continuam fixos, permanentes e resgataveis uma unica vez.
- O balanceamento dos targets e dos 23 Renown ainda depende de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 74 - consolidar a proxima camada de progressao offline da guilda a partir dos sistemas atuais.

## Etapa 74 - Guild Directives offline

Status: concluida.

Conceito:

- Guild Directives sao politicas guild-wide desbloqueadas uma por Guild Level, do Level 1 ao 6.
- Uma unica directive fica ativa; trocar e gratuito, local, manual e nao usa moeda, cooldown, premium ou servidor.
- A politica escolhida afeta somente novas ordens. Hunts, quests, training e expeditions ja iniciadas mantem o bonus registrado no inicio.
- O snapshot evita trocar a directive no fim de uma acao para alterar retroativamente o resultado e permite gerenciar a politica mesmo com outros aventureiros ocupados.

Diretivas:

- Vanguard Orders, Level 1: +2% Hunt XP.
- Training Charter, Level 2: +5% Training progress.
- Contract Mandate, Level 3: +3% Quest XP.
- Merchant Compact, Level 4: -4% nos precos da loja NPC fixa.
- Expedition Standard, Level 5: +4 pontos percentuais na chance de expedition.
- Grand Strategy, Level 6: +2 em Hunt XP, Training, Quest XP, desconto NPC e chance de expedition.

Engine e persistencia:

- `src/data/guildDirectives.ts` define unlocks, sigilos, descricoes e bonuses sem ids externos.
- `src/game-engine/guild-directives/` normaliza o ledger, deriva unlocks/bonus e ativa uma directive com validacao de level, timestamp e duplicacao.
- O historico guarda as 12 ativacoes mais recentes; ids, datas ou estruturas invalidas sao descartados com seguranca.
- `CharacterAction.guildXpBonusPercent` registra o bonus de Hunt/Quest; Training ja guarda `expectedGainPercent` e expedition ja guarda `successChance` no dispatch.
- Auto-repeat cria cada nova hunt com o bonus vigente naquele novo inicio.
- SQLite adiciona `directives_json`; saves antigos recebem `{ activeDirectiveId: null, activationHistory: [] }`.

Interface e integracoes:

- Headquarters recebeu um command board compacto com seis cards, Level requerido, efeito, lock, estado ativo e comando Activate Directive.
- Duplo clique e reativacao da mesma politica nao duplicam historico nem Activity Log.
- Market NPC combina Merchant Compact com o desconto do Quartermaster e mostra o desconto total da guilda.
- Contracts mostra a directive ativa e inclui Expedition Standard/Grand Strategy na chance projetada e no snapshot do dispatch.
- Hunt, Training e Quest combinam facilities permanentes da Headquarters com a directive atual, respeitando o limite defensivo existente de 25%.
- Codex, Updates e subtitulo do Headquarters foram atualizados.

Validacoes:

- Harness temporario passou em 89/89 checks e foi removido apos validar seis levels, bonus exatos, switches, imutabilidade, historico, JSON corrompido e timestamps invalidos.
- Foram exercitados preview e snapshot de Hunt, Training e Quest, alem do acrescimo exato de +4 na chance de Expedition.
- O QA visual encontrou e corrigiu o bloqueio inicial causado pelo roster ocupado; directives agora podem mudar sem reescrever acoes existentes.
- No mock Level 2, Vanguard Orders e Training Charter ficaram disponiveis e as quatro politicas seguintes permaneceram bloqueadas pelo Level correto.
- Duplo clique em Vanguard gerou uma ativacao e um log; a troca para Training manteve exatamente um card ativo e adicionou somente o novo log.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, command board e seis cards sem overflow horizontal.
- O console web apresentou apenas o fallback esperado do SQLite fora do Tauri.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 371 modulos e geraram executavel release, MSI e NSIS.
- A migration nativa criou `directives_json` vazio preservando o save antigo.
- Uma fixture manteve Training Charter ativa, duas entradas de historico e uma hunt com snapshot separado de +2% apos duas cargas nativas.
- As cargas preservaram 1 guilda, 5 personagens, 35 skills, 26 stacks, 10 logs e `PRAGMA integrity_check: ok`.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- Nao ha custo, cooldown, slots multiplos, presets de directive ou automacao de troca.
- Directives nao aumentam dano, loot ou reward de boss nesta versao; os bonuses permanecem pequenos e previsiveis.
- O balanceamento precisa de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 74.5 - QA aprofundada das Guild Directives e snapshots no Tauri/SQLite.

## Etapa 74.5 - QA das Guild Directives

Status: concluida.

Correcoes reproduzidas:

- Saves corrompidos podiam manter uma directive valida, mas ainda bloqueada pelo Guild Level atual; ela ficava sem efeito e poderia ativar sozinha quando a guilda alcancasse o level exigido.
- O normalizador agora recebe o Guild Level derivado do Renown e remove active directive e historico impossiveis no load, status, tentativa de ativacao e save SQLite.
- Um `expectedGainPercent` de Training invalido podia chegar ao progresso da skill como `NaN` ou executar um loop excessivo com valores enormes.
- `normalizeCharacterAction` agora remove snapshots de Training nao numericos, negativos, infinitos ou acima do limite defensivo, limita a duracao persistida a 480 minutos e descarta modos invalidos.
- `finishTraining` aplica a mesma defesa e recalcula um ganho seguro quando o snapshot nao pode ser usado.

Matriz automatizada:

- O harness temporario passou em 53.131/53.131 checks e foi removido apos a validacao.
- Foram cobertos os seis unlock levels, ids e bonuses, imutabilidade, timestamps, bloqueios, duplicacao e limite de 12 entradas do historico.
- As 720 ordens possiveis de ativacao das seis directives passaram mantendo exatamente uma politica ativa e o historico correto.
- Dez mil estados variados confirmaram descarte de ids, datas, histories e active directives incompativeis com cada Guild Level.
- Hunt, Quest, Training e auto-repeat preservaram seus snapshots; Expedition Standard adicionou exatamente quatro pontos a chance de dispatch.
- O mapper derivou Rank/Level pelo Renown e removeu directive ativa e historico impossiveis de um row SQLite corrompido.
- Snapshots de Training com `NaN`, infinito, numero negativo, string, nulo e valor excessivo recuperaram ganho finito sem contaminar a skill.

QA visual:

- No mock Guild Level 2, Vanguard Orders e Training Charter ficaram disponiveis; Contract, Merchant, Expedition e Grand Strategy permaneceram bloqueadas.
- Duplo clique em Vanguard criou um unico estado ativo e uma unica entrada no Activity Log.
- A troca para Training Charter manteve exatamente um card ativo, um botao alternativo habilitado e todos os cards bloqueados desabilitados.
- Viewports de 1280x800, 960x700, 700x700 e 430x800 mantiveram pagina, board e seis cards sem overflow horizontal.
- A inspecao visual mobile confirmou cards legiveis, estado ativo destacado e comandos dentro dos limites.
- O console web mostrou apenas o fallback SQLite esperado ao executar o frontend fora do Tauri.

QA Tauri/SQLite:

- O save original, anterior a Etapa 74, recebeu `renown_objectives_json` e `directives_json` pelas migrations sem perda de dados.
- Uma fixture Guild Level 2 recebeu Grand Strategy ativa, historico Grand/Vanguard e Training com duracao 999.999, modo invalido e ganho em string.
- Apos duas cargas nativas, Grand Strategy foi removida, Vanguard historica foi preservada e o Training persistiu com 480 minutos sem modo ou ganho invalidos.
- As cargas preservaram 674g, 12 Renown, Rank D, Level 2, 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs, com `PRAGMA integrity_check: ok`.
- O executavel foi aberto de forma oculta para validar load/migration/auto-save; nao houve QA manual por cliques na janela Tauri.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes mantidas:

- Directives continuam gratuitas, manuais e sem cooldown, presets ou troca automatica.
- O balanceamento dos bonuses ainda precisa de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 75 - Guild Squads offline.

## Etapa 75 - Guild Squads offline

Status: concluida.

Conceito e regras:

- A guilda possui tres slots fixos de formacao: First Company no Guild Level 1, Second Company no Level 3 e Third Company no Level 5.
- Cada preset guarda nome de ate 24 caracteres, ate cinco personagens e um role existente por membro: tank, healer, damage ou support.
- Squads sao apenas presets locais de organizacao. Nao concedem atributos, moeda, cooldown, automacao, combate paralelo ou inicio automatico de atividade.
- Salvar uma formacao vazia e permitido; personagens podem participar de mais de um preset.

Engine e persistencia:

- `src/data/guildSquads.ts` define os tres slots, sigilos, nomes padrao e Guild Levels necessarios.
- `src/game-engine/guild-squads/` normaliza, deriva status, salva presets e converte uma formacao em `BossParty` sem mutar a guilda original.
- A normalizacao remove slots desconhecidos ou bloqueados, personagens inexistentes ou duplicados, roles invalidos, nomes excessivos e timestamps corrompidos.
- SQLite adiciona `squads_json`; saves antigos recebem `{ squads: [] }` sem alterar guilda, roster, inventario ou atividades.

Interface e integracoes:

- Campaign Operations recebeu o editor Guild Squads com tabs, nome, roster, roles, Save Formation, Load in Bosses e Clear.
- Bosses mostra os tres atalhos salvos e limita a formacao ao tamanho maximo do boss; level, access, status, composicao e cooldown continuam validados pelo sistema real.
- Contracts usa os ids salvos para preencher a equipe ate o limite do posting, exclui personagens mortos e nunca executa Dispatch automaticamente.
- Salvar e carregar registram somente uma entrada de Activity Log, inclusive sob clique duplo rapido.
- Updates e Guild Field Codex documentam a funcionalidade e seus limites offline.

Validacoes:

- O harness temporario passou em 61.441 checks e foi removido apos testar unlocks, normalizacao, imutabilidade, limites, ordem, roles e dez mil estados variados.
- No browser local, uma formacao Arkon/Lyra foi salva por clique duplo com um unico log, carregada no boss respeitando o limite solo e aplicada ao Contract sem dispatch.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, editor e cards sem overflow horizontal.
- O console web mostrou apenas o fallback SQLite esperado ao executar o frontend fora do Tauri.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 377 modulos; o build nativo gerou executavel release, MSI e NSIS.
- A migration nativa criou `squads_json` no save anterior; uma fixture corrompida foi reduzida a First Company com Arkon tank e Lyra healer apos duas cargas.
- As cargas preservaram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs, com `PRAGMA integrity_check: ok`.
- O executavel foi aberto de forma oculta para validar load/migration/auto-save; nao houve QA manual por cliques na janela Tauri.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes atuais:

- Nao ha drag-and-drop, reordenacao manual de membros, icones customizados ou importacao entre saves.
- Contracts preserva a ordem salva e corta membros excedentes; Bosses faz o mesmo pelo limite do encontro.
- O balanceamento de composicoes ainda precisa de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 75.5 - QA aprofundada dos Guild Squads no Tauri/SQLite.

## Etapa 75.5 - QA dos Guild Squads

Status: concluida.

Correcoes reproduzidas:

- Se um slot avancado estivesse selecionado e um Reload/Reset substituisse a campanha por uma guilda de level menor, a tab ficava bloqueada, mas o editor ainda podia apontar temporariamente para aquele slot.
- `GuildSquadsBoard` agora seleciona automaticamente o primeiro slot permitido sempre que o slot atual deixa de estar desbloqueado.
- A montagem de support team para Contracts existia somente dentro do componente, dificultando validar diretamente ordem, mortos e limites anormais.
- `createContractTeamFromGuildSquad` passou a centralizar essa regra, preservando ordem, removendo mortos, limitando a equipe e recuperando limites invalidos sem dispatch automatico.

Matriz automatizada:

- O harness temporario passou em 142.940 checks e foi removido apos a execucao.
- As seis ordens possiveis de salvar os tres slots preservaram ids unicos, conteudo e imutabilidade da guilda original.
- Os seis bosses receberam party com bossId, ordem, roles e corte exato pelo `maxPartySize` de cada encontro.
- Contracts foram testados com limites 1, 2, 3 e 5, alem de zero, negativo, `NaN` e infinito; mortos foram excluidos sem reordenar os sobreviventes.
- Mapper SQLite derivou Level/Rank pelo Renown, removeu slots ainda bloqueados e recuperou `squads_json` malformado como estado vazio.
- Vinte mil estados variados cobriram slots desconhecidos/duplicados, nomes, timestamps, roles, personagens e Guild Levels invalidos.
- Um slot removido por estar bloqueado nao reapareceu sozinho depois de aumentar o Guild Level.

QA visual:

- No mock Level 2, apenas First Company permaneceu habilitada; Second e Third Company exibiram corretamente os requisitos Level 3 e 5.
- QA Vanguard guardou cinco personagens e o role support alterado de Lyra; clique duplo em Save gerou somente um estado e um Activity Log.
- Clique duplo em Load in Bosses gerou um unico log e o boss solo recebeu somente Arkon.
- Khazgrim Gatekeeper recebeu os tres primeiros membros com roles preservados, mas Launch Raid continuou bloqueado por level e personagens ocupados.
- Contracts substituiu a selecao inicial por Arkon/Ayla, respeitou o limite 2 e manteve historico vazio ate o comando manual Dispatch Expedition.
- Clique duplo em Clear esvaziou uma vez o preset, desabilitou Load/Clear e deixou 0/1 configured.
- Viewports de 1280, 960, 700 e 430 px mantiveram pagina, board e editor sem overflow horizontal; a inspecao mobile confirmou controles legiveis.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 378 modulos e gerou executavel release, MSI e NSIS.
- O save original anterior a Etapa 75 recebeu `squads_json` por migration sem perder tabelas ou registros.
- Uma fixture com slots duplicado, desconhecido e bloqueados, oito membros, duplicacao, personagem inexistente, role invalido, nome excessivo e timestamp invalido foi carregada duas vezes.
- O resultado persistido manteve apenas First Company no Level 2, nome com 24 caracteres, epoch seguro e Arkon/Ayla/Lyra/Mira com roles validos.
- As cargas preservaram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs, com `PRAGMA integrity_check: ok`.
- O executavel foi aberto de forma oculta para validar migration/load/auto-save; nao houve cliques manuais na janela Tauri.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes mantidas:

- Squads continuam sendo presets manuais sem bonus, automacao, atividade paralela ou reordenacao por drag-and-drop.
- Personagens ocupados podem permanecer no preset; Bosses exibem e bloqueiam a inelegibilidade atual, enquanto Contracts continuam permitindo support assignments paralelas conforme sua regra existente.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 76 - Squad Command Center derivado das formacoes persistentes.

## Etapa 76 - Squad Command Center

Status: concluida.

Conceito e regras:

- Cada Guild Squad salva agora recebe uma leitura operacional em Campaign Operations: locked, awaiting formation, raid ready, partially available, support duty only ou unavailable.
- A central exibe field power, membros vivos/disponiveis/ocupados/mortos, composicao tank/healer/damage/support e avisos objetivos da formacao.
- O recurso e inteiramente derivado da guilda, roster, Bosses e Contracts existentes; nenhum estado, bonus, moeda, timer ou coluna SQLite foi adicionado.
- Alteracoes ainda nao salvas no editor nao mudam a avaliacao nem podem ser enviadas por engano para outro sistema.

Engine e integracoes:

- `buildGuildSquadCommandCenter` avalia os tres slots normalizados e protege gold/power invalidos contra `NaN` na apresentacao.
- As seis rotas de Boss usam `createBossPartyFromGuildSquad`, `canStartBoss` e `calculateBossPower`, preservando party size, level, access, quests, status, cooldown, roles e entry fee reais.
- As seis rotas de Contract usam disponibilidade, limite de support team, Headquarters, Career Points, custo com staff, directive ativa e expedicao ja em andamento.
- Mortos ficam fora do poder e das equipes de Contract; ocupados bloqueiam Bosses, mas continuam validos para support duty conforme a regra existente de expeditions.
- `Prepare Bosses` carrega a formacao e o Boss recomendado no Raid Board; `Open Contracts` abre o board local sem dispatch automatico.

Interface:

- O board de Guild Squads ganhou uma area compacta de intelligence abaixo do editor, com resumo, roles, duas recomendacoes acionaveis e avisos.
- Formacoes vazias mostram 0/0 rotas e mantem ambos os comandos desabilitados.
- Cores discretas distinguem ready, partial e unavailable sem alterar o estilo MMORPG escuro/metálico existente.
- Em telas estreitas, resumo, roles, rotas e acoes reorganizam em uma coluna sem sobrepor ou cortar texto.

Validacoes:

- O harness temporario cobriu estado vazio, pronto, parcial, ocupado, totalmente morto, gold invalido, imutabilidade e 10.000 combinacoes de status/level/gold; os seis Bosses e seis Contracts retornaram metricas finitas.
- O fuzz encontrou e a etapa corrigiu um `NaN` de power herdado por saves numericamente invalidos antes que chegasse a interface.
- No browser local, First Company com cinco membros mostrou 2/5 disponiveis, 0/6 Bosses e 2/6 Contracts; os motivos exibidos corresponderam ao level/status real do mock.
- `Open Contracts` preencheu Ayla/Lyra sem dispatch e `Prepare Bosses` carregou Arkon no boss solo sem launch.
- Viewports de 1280, 960, 700 e 430 px ficaram sem overflow horizontal ou texto cortado na nova central.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.
- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 380 modulos; o build nativo gerou executavel release, MSI e NSIS.
- Nao houve QA manual por cliques na janela Tauri nesta etapa; a interacao foi validada no browser local e a camada nativa pelo build completo.

Limitacoes atuais:

- A central recomenda a primeira rota pronta, sem ordenacao configuravel, filtros ou comparacao entre squads.
- Nao ha auto-fill, auto-dispatch, auto-launch, bonus por composicao ou atividade paralela nova.
- A avaliacao permanece derivada e agenda um refresh local quando o proximo cooldown de Boss expira, sem polling permanente ou estado salvo.
- O balanceamento das leituras de poder ainda precisa de uma campanha completa de longa duracao.

Proximo passo sugerido:

- Etapa 76.5 - QA aprofundada do Squad Command Center no Tauri/SQLite.

## Etapa 76.5 - QA do Squad Command Center

Status: concluida.

Correcoes reproduzidas:

- Uma formacao com todos os membros vivos e idle recebia o label `Raid ready` mesmo quando level, acesso, roles, cooldown ou gold deixavam todas as seis raids bloqueadas.
- O estado continua sendo `ready`, mas o label agora e `Formation ready`: ele descreve disponibilidade da formacao, enquanto os cards de Boss mantem a decisao real de elegibilidade.
- Se Campaign Operations permanecesse aberto sem hunt, training, quest ou expedition temporizada, o fim de um cooldown de Boss nao provocava novo render e a rota podia ficar bloqueada visualmente.
- `canStartBoss` e o Command Center agora aceitam um instante injetavel; Operations agenda um unico refresh no cooldown mais proximo e limita delays extremos de saves corrompidos.

Matriz automatizada:

- O harness temporario passou em 281.247 checks e foi removido depois da execucao.
- As 1.024 composicoes possiveis de tank/healer/damage/support para cinco membros foram cruzadas com os seis Bosses e com `canStartBoss`.
- As 16.807 combinacoes de idle/hunting/training/questing/bossing/traveling/dead foram cruzadas com readiness, contagens, seis Bosses e seis Contracts reais.
- Cada rota de Contract foi comparada com `startGuildExpedition`, incluindo limites exatos de gold, team size, personagens mortos e expedition ativa.
- Cooldown foi testado antes e exatamente no timestamp de liberacao; a rota muda de blocked para ready na fronteira correta.
- Estado vazio/bloqueado, membros duplicados ou inexistentes, gold/level `NaN`, metricas finitas, round-trip JSON e imutabilidade da guilda/roster tambem passaram.

QA visual:

- O mock vazio mostrou Awaiting formation, 0/0 rotas e os dois comandos desabilitados.
- First Company salva com Arkon/Lyra mostrou Formation ready e 2/2 disponiveis, mas 0/6 Bosses com o motivo real de level; isso confirma que o novo label nao promete elegibilidade.
- Adicionar Ayla apenas ao editor mudou o rascunho para 3/5, mas a central persistida permaneceu em 2/2 e 710 power ate Save Formation.
- Open Contracts abriu o board sem dispatch, e Clear retornou a central a 0/0 com comandos desabilitados.
- Viewports de 1280, 960, 760, 520 e 430 px ficaram sem overflow horizontal, texto cortado ou sobreposicao; as rotas viraram uma coluna no breakpoint compacto.
- O console web mostrou somente o fallback SQLite esperado ao rodar fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 380 modulos e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o save original anterior a Guild Squads e criou `squads_json` vazio sem alterar contagens.
- Uma fixture com slot desconhecido, membro duplicado e personagem inexistente foi carregada duas vezes; persistiu somente QA Native Command com Lyra healer e Arkon tank.
- Um cooldown futuro de Sewer Broodmother permaneceu intacto nas duas cargas, enquanto nenhuma coluna `command` ou `readiness` foi criada.
- As tres cargas mantiveram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs, com `PRAGMA integrity_check: ok`.
- O executavel foi aberto de forma oculta para validar migration/load/auto-save; nao houve QA manual por cliques na janela Tauri.
- O SQLite original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`, sem WAL, SHM ou backup restante.

Limitacoes mantidas:

- A central ainda recomenda somente a primeira rota pronta; nao ha filtros, ordenacao configuravel ou comparacao entre squads.
- Nao ha auto-fill, auto-dispatch, auto-launch, bonus de composicao ou atividade paralela nova.
- O balanceamento das leituras de poder ainda precisa de uma campanha completa de longa duracao.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 77 - definir a proxima camada de gerenciamento offline apos o Command Center.

## Etapa 77 - Guild Deployment Planner

Status: concluida.

Conceito e regras:

- Campaign Operations agora possui uma visao operation-first complementar ao Command Center: o jogador escolhe primeiro um Boss ou Contract e compara os tres slots de squad.
- Os seis Bosses e seis Contracts atuais aparecem no seletor, cada um com regiao, tamanho de equipe, custo base e quantidade de formacoes prontas.
- Cada candidato mostra nome, disponibilidade, motivo exato de bloqueio, membros, composicao tank/healer/damage/support e power/target ou chance projetada.
- Formacoes prontas ficam antes das bloqueadas; entre candidatas equivalentes, power relativo ou success chance define a ordem e o slot original resolve empates.
- A primeira formacao realmente pronta recebe `Recommended formation`. Se nenhuma estiver pronta, a melhor formacao configurada ainda pode ser aberta para ajuste manual como `Best available`.

Integracoes:

- Bosses reutilizam `createBossPartyFromGuildSquad`, `canStartBoss` e `calculateBossPower`; o comando carrega exatamente o Boss escolhido e sua party no Raid Board.
- Contracts reutilizam disponibilidade, limites de equipe, power, staff, directive, gold e expedition ativa; o comando abre exatamente o posting escolhido com o squad aplicado.
- Preparar nunca inicia raid, nunca faz dispatch, nunca gasta gold e nunca contorna level, access, cooldown, status ou tamanho de equipe.
- O planner e derivado do save atual e nao adiciona schema, migration, JSON, moeda, bonus, cooldown ou automacao.

Interface:

- Novo `Deployment Planner` abaixo da inteligencia do squad, com controle segmentado Boss Raids/Contracts, seletor de alvo, resumo e linhas comparativas compactas.
- Slots locked ou vazios continuam visiveis com motivo e comando desabilitado, preservando a leitura da progressao futura da guilda.
- Breakpoints de 760 e 520 px reorganizam metricas e comandos sem cards aninhados, sobreposicao ou overflow horizontal.

Validacoes:

- Harness temporario passou em 8.123 checks e foi removido: 12 alvos, tres slots, ranking, recomendacao, contagens, estado vazio, imutabilidade e 2.000 variacoes de status/gold com metricas finitas.
- No browser local, salvar Arkon atualizou imediatamente o planner; Supply Route Survey foi recomendado e `Sewer Ledger Audit` abriu selecionado com Arkon marcado.
- A preparacao do contrato nao criou expedition ativa; o dispatch permaneceu manual no board existente.
- O pedido de preparacao foi consumido apos a abertura: fechar e reabrir Contracts manualmente voltou ao posting/equipe padrao, sem alvo antigo preso.
- Viewports de 1280, 760 e 430 px ficaram sem overflow no documento, planner, linhas ou botoes; a captura mobile confirmou a reorganizacao visual.
- O console web exibiu somente o fallback SQLite esperado fora do Tauri.
- `npm.cmd run build` passou com 382 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.

Limitacoes atuais:

- O ranking nao possui ordenacao configuravel, favoritos ou filtros adicionais; usa regras fixas e deterministicas.
- O planner nao edita membros nem roles: ajustes continuam no editor de Guild Squads.
- O custo mostrado no cabecalho e o valor base; a linha do candidato e a regra real consideram descontos de staff e outros requisitos atuais.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser local e a camada desktop pelo build completo.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 77.5 - QA aprofundada do Guild Deployment Planner no Tauri/SQLite.

## Etapa 77.5 - QA do Guild Deployment Planner

Status: concluida.

Correcao reproduzida:

- Um preset com cinco membros mostrava `5 members` em qualquer Boss, mesmo quando `createBossPartyFromGuildSquad` carregava somente um membro para solo, tres para Khazgrim ou quatro para a Arena.
- As rotas de Boss agora carregam `partySize`, o planner usa o tamanho efetivamente preparado e a interface identifica a metrica como `deployed`.
- Um preset de cinco membros passou a mostrar 1 para Sewer Broodmother, 3 para Khazgrim Gatekeeper, 4 para Novice Arena Champion e 5 para Ember Matriarch.
- Contracts seguem a mesma linguagem e mostram a equipe truncada pelo `maximumTeamSize`, excluindo mortos conforme a regra existente.

Matriz automatizada:

- O harness temporario passou em 785.082 checks e foi removido.
- As 1.024 composicoes de tank/healer/damage/support para cinco membros foram comparadas com `canStartBoss` nos seis Bosses.
- 4.096 variacoes de idle/hunting/training/questing/bossing/traveling/dead foram cruzadas com os tres squads, seis Bosses e seis Contracts.
- Toda rota foi comparada com a party/equipe realmente criada; readiness de Boss permaneceu identico a `canStartBoss` e readiness de Contract a `startGuildExpedition`.
- Ranking, recomendacao, contagens de alvos prontos, metricas finitas, motivos, estado vazio, expedition ativa e imutabilidade passaram.
- Gold foi testado imediatamente abaixo e no custo exato de cada Boss e Contract; Contracts tambem cobriram o desconto do Provisioner.
- Cooldowns foram testados um milissegundo antes e exatamente no timestamp de liberacao para todos os Bosses.
- Save malformado com slot desconhecido, duplicatas, personagem inexistente, role invalida, timestamp ruim e gold `NaN` normalizou sem mutacao ou metrica invalida.

QA visual e interativo:

- Um squad com os cinco personagens do mock exibiu 1/3/4/5 deployed conforme os limites dos Bosses e 2/3 conforme os Contracts escolhidos.
- Ember Matriarch abriu no Raid Board com Arkon, Ayla, Mira, Lyra e Shen, sem launch e mantendo todos os bloqueios reais de level, status, access e gold.
- Vanguard Frontier Survey abriu com os tres membros realmente truncados, permaneceu bloqueado e nao criou expedition ativa.
- Fechar e reabrir Contracts manualmente voltou a Supply Route Survey com a equipe padrao, confirmando que o pedido de preparacao foi consumido.
- Viewports de 1440, 960, 760, 520 e 430 px ficaram sem overflow no documento, planner, linhas ou controles e sem texto cortado.
- O console web mostrou apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 382 modulos e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o save original anterior a Guild Squads e adicionou `squads_json` vazio sem perder tabelas ou registros.
- Nenhuma coluna planner/deployment/readiness/command foi criada; todas as leituras continuam derivadas.
- Uma fixture com slot desconhecido, duplicatas, membro inexistente, role invalida, timestamp ruim e slot bloqueado persistiu somente `QA Deployment` com Lyra healer e Arkon tank.
- Duas cargas da fixture preservaram tambem o cooldown futuro de Sewer Broodmother e mantiveram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs.
- As cargas mantiveram `PRAGMA integrity_check: ok`; o executavel foi aberto oculto, sem QA manual por cliques na janela Tauri.
- O banco original foi restaurado com SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`; WAL e SHM tambem voltaram byte a byte e nenhum backup temporario permaneceu.

Limitacoes mantidas:

- Ranking continua fixo e deterministico, sem favoritos, filtros ou ordenacao configuravel.
- O planner nao edita formacoes e nao inicia atividades automaticamente.
- O cabecalho mostra custo base; descontos e elegibilidade real continuam refletidos na linha de cada candidato.
- O balanceamento de longo prazo ainda precisa de uma campanha completa.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 78 - definir a proxima camada de gerenciamento offline apos o Deployment Planner validado.

## Etapa 78 - Guild Deployment Orders

Status: concluida.

Conceito e regras:

- Campaign Operations ganhou tres `Deployment Orders` persistentes e guild-wide para registrar uma combinacao de alvo e formacao.
- Cada slot aceita Boss ou Contract e pode ser substituido ou limpo sem alterar os outros slots.
- A ordem guarda somente intencao: nao reserva aventureiros, nao gasta gold, nao inicia raid, nao faz dispatch e nao cria cooldown.
- Readiness, motivo, party/equipe efetivamente mobilizada, power e chance continuam derivados do save atual e das regras reais do planner.
- Alvos removidos, tipos desconhecidos, squads invalidos, slots duplicados e timestamps quebrados sao descartados ou normalizados com seguranca.

Interface e integracoes:

- Novo quadro `Deployment Orders` entre o Command Center e o Deployment Planner, com tres slots compactos, selecao ativa, status e comandos Prepare/Clear.
- Cada candidato do planner possui `Assign I/II/III` conforme o slot selecionado e mantem `Prepare` como acao manual separada.
- Preparar uma ordem de Boss abre o Raid Board com o Boss e party exatos; Contract abre o posting e equipe exatos sem dispatch.
- Activity Log registra atribuicao, bloqueio e limpeza sem spam de readiness derivado.
- SQLite ganhou a coluna aditiva `deployment_orders_json`; saves antigos recebem `{ "orders": [] }`.

Validacoes:

- Harness temporario passou em 75.008 checks e foi removido: normalizacao malformada, deduplicacao, timestamp, criacao, substituicao, bloqueio de alvo, limpeza idempotente e 25.000 recomputacoes.
- No browser local, First Company com Lyra registrou Sewer Broodmother em Order I e Supply Route Survey em Order II.
- Prepare da ordem de Boss abriu Sewer Broodmother com Lyra, 98% de sucesso e nenhum launch; limpar Order I preservou Order II.
- Viewports de 1280, 760 e 430 px ficaram sem overflow no documento, quadro ou cards.
- A abertura nativa adicionou `deployment_orders_json` ao banco legado com JSON vazio valido.
- O banco original, WAL e SHM foram restaurados; o SHA-256 principal retornou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- `npm.cmd run build` passou com 387 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.

Limitacoes atuais:

- Existem tres slots fixos; nao ha renomeacao, ordenacao, favoritos ilimitados ou fila automatica.
- Uma ordem pode ficar bloqueada quando personagens, acesso, cooldown ou gold mudam; ela permanece salva para revisao posterior.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser local e migration/build na camada desktop.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 78.5 - QA aprofundada dos Guild Deployment Orders no Tauri/SQLite.

## Etapa 78.5 - QA dos Guild Deployment Orders

Status: concluida.

Correcoes reproduzidas:

- Salvar Order II, III e I nessa sequencia persistia `order-one, order-three, order-two` por ordenacao alfabetica; normalizacao e escrita agora usam sempre a ordem canonica I/II/III.
- `saveGuildDeploymentOrder` chamava `toISOString()` em uma data invalida e podia lancar `RangeError`; timestamps invalidos agora retornam bloqueio seguro sem alterar a guilda.
- Uma ordem ligada a squad posteriormente esvaziado continuava exibindo `Prepare` habilitado; a ordem permanece para revisao, mas o comando fica disabled ate a formacao voltar a ser configurada e desbloqueada.
- Em 760 px os tres cards permaneciam lado a lado e truncavam o motivo operacional; o quadro agora empilha a partir do breakpoint tablet.

Matriz automatizada:

- Harness temporario passou em 124.684 checks e foi removido.
- Os seis Bosses e seis Contracts foram cruzados com os tres squads; alvo, readiness, motivo, membros mobilizados, power e chance ficaram identicos ao Deployment Planner.
- As 7.776 combinacoes de idle/hunting/training/questing/bossing/traveling dos cinco personagens foram testadas com tres ordens simultaneas.
- Todas as metricas permaneceram finitas e as tres ordens continuaram derivadas sem alterar personagens, gold, cooldown ou atividades.
- Criacao fora de ordem, substituicao, limpeza independente, duplicatas, null, tipos desconhecidos, alvos ausentes e timestamp invalido passaram.

QA visual e interativo:

- First Company com Lyra registrou Sewer Broodmother; ao limpar o squad a ordem permaneceu `Needs review` com `Prepare` disabled.
- Restaurar Lyra devolveu `Ready now` e habilitou Prepare sem recriar a ordem.
- O mesmo slot foi substituido por Supply Route Survey sem duplicacao e abriu o posting com Lyra selecionada, sem expedition ativa ou dispatch automatico.
- Viewports de 1440, 960, 760, 520 e 430 px ficaram sem overflow no documento, quadro ou cards e sem texto truncado.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- Uma fixture com slots fora de ordem, duplicata, alvo ausente, entrada null, tipo numerico, squad desconhecido, membro inexistente e timestamps invalidos foi carregada duas vezes pelo executavel release.
- A primeira carga persistiu exatamente Order I Contract/Supply Route, Order II Boss/Sewer Broodmother e Order III Boss/Ember Matriarch; a segunda carga preservou o mesmo JSON canonico.
- Squad inexistente e membros invalidos foram removidos; timestamps ruins de squad/order normalizaram para `1970-01-01T00:00:00.000Z`.
- As duas cargas mantiveram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs com `PRAGMA integrity_check: ok`.
- `npm.cmd run tauri:build` passou com 387 modulos e gerou executavel release, MSI e NSIS.
- O banco original, WAL e SHM foram restaurados byte a byte; nenhum fixture ou bundle temporario permaneceu.

Limitacoes mantidas:

- Ordens nao reservam personagens, nao criam fila e nao iniciam atividades automaticamente.
- Readiness pode mudar legitimamente conforme roster, gold, acesso e cooldown; a ordem bloqueada permanece salva para revisao.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser e persistencia por duas aberturas nativas controladas.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 79 - definir a proxima camada de gerenciamento offline apos Deployment Orders validados.

## Etapa 29.5 - QA de gameplay e balanceamento inicial

Validado/corrigido:

- Build TypeScript/Vite passou antes e depois das correcoes.
- Vite local abriu em `http://127.0.0.1:1420` e respondeu 200.
- Home exibiu Arkon level 1, `guild.gold` 420g e objetivo inicial para starter hunt.
- Explore/Hunts exibiu `Sewers Below Thaeron` desbloqueada, 1 minuto, sem supplies obrigatorias e risco `Very Safe`.
- `Cave Spider Cellar` e `Trollwood Camp` mostraram bloqueio por level com motivo claro.
- Hunt starter iniciou `currentAction`, mostrou Action Analyzer e coletou resultado uma vez.
- Resultado testado no smoke: +4g liquido, 42 XP e Rat Tail x2 no inventario.
- Quick Sell vendeu Rat Tail x2 por 4g e nao vendeu Minor Health Potion por padrao.
- Market Buy comprou Minor Health Potion x10 por 300g, atualizando `guild.gold` e stack do inventario.
- Sewer Rat agora garante Rat Tail, evitando primeira hunt sem loot vendavel.
- Logs e `netProfit` da simulacao foram alinhados para gold liquido, mantendo loot como venda posterior.
- `ActionAnalyzer` agora mostra `Loot est.`, `Liquid gold` e `Liquid/h`, sem somar loot no saldo previsto.
- Estimativa de kills do Analyzer agora usa XP esperado e XP medio dos monstros, ficando coerente com a hunt starter.
- Validacao de dados confirmou itemIds e referencias de monstros das hunts.
- Quests, bosses e training iniciais foram revisados por leitura: quest tutorial level 1 existe, boss inicial fica gated por level/acesso e training nao gera gold/loot.

Limitacoes da QA:

- `npm run tauri:dev` e SQLite real nao foram clicados manualmente nesta etapa.
- Save/load real foi validado por leitura/build, nao por reabrir o app desktop.
- Offline catch-up e auto-repeat nao tiveram teste temporal completo; foram revisados por leitura/build.
- Balanceamento ate level 5/10 ainda precisa de uma sessao longa com save novo.

Proximo passo sugerido:

- Etapa 30 - Hunt / Combat Scene visual avancada.

## Etapa 30.5 - QA visual da Hunt Scene, hotbar e janelas

Validado/corrigido:

- Build TypeScript/Vite passou antes e depois das correcoes.
- Vite local abriu em `http://127.0.0.1:1420` e respondeu 200.
- Hunt starter foi iniciada pelo fluxo real de Explore/Hunts no mock local.
- Hunt Scene apareceu na Home com personagem central, 3 criaturas, timer de spawn, action bar, loot preview, combat log e hotbar.
- Hotbar exibiu 5 slots: cura, mana, magias, suporte e loot.
- As 5 janelas de slot abriram e fecharam por clique, com listas e botoes `Concluir`.
- Corrigido overflow horizontal do palco causado por patches de terreno rotacionados.
- Corrigido overflow horizontal do modal causado pelo botao de fechar posicionado para fora da janela.
- Validado em viewport padrao, 900px e 720px sem scroll horizontal na pagina, palco, hotbar ou modal.
- Console do navegador nao reportou erros/warnings durante o smoke.

Limitacoes da QA:

- `npm run tauri:dev` e SQLite real nao foram clicados manualmente nesta etapa.
- O smoke foi feito via `npm run dev` com mock local.
- A hotbar continua visual/local; ainda nao configura rotacao real, cooldown real ou consumo automatico de potions.
- A Hunt Scene continua sem sprites externos, mapa navegavel, pathfinding ou combate real-time real.

Proximo passo sugerido:

- Etapa 31 - Rework de Progressao de Regiao / Area / Unlocks.

## Etapa 31 - Region Atlas / Progressao de Regioes e Unlocks

Implementado:

- Criado engine derivado `buildRegionProgression` para montar progresso por cidade/regiao.
- Region Atlas usa dados reais de `hunts`, `quests`, `bosses`, `accesses` e do personagem selecionado.
- Cada marco de progressao pode ser `access`, `hunt`, `quest` ou `boss`.
- Status calculado sem persistencia nova: `completed`, `active`, `available` ou `locked`.
- Bloqueios mostram motivos simples: level requerido, access key faltante ou quest faltante.
- Topbar ganhou botao `Atlas`.
- MainPanel ganhou aba `Region Atlas`.
- UI mostra resumo da regiao, barra de progresso, access keys, proximo marco e lista de marcos.
- Layout responsivo ajustado para janelas full em telas pequenas priorizarem a janela principal.

Limites atuais:

- O Atlas nao concede rewards, access keys ou quest completion; ele apenas mostra o estado real do save.
- Hunts nao possuem historico persistido de “concluida”, entao aparecem como `Available` quando desbloqueadas.
- Bosses ainda aparecem como `Available/Locked`; cooldown/derrota historica nao entram no progresso do Atlas nesta etapa.
- `npm run tauri:dev` e SQLite real nao foram clicados manualmente nesta etapa.

Validacao:

- `npm.cmd run build` passou.
- Smoke Vite abriu Atlas pela topbar.
- Troca de regiao validada em Thaeron/Eldoria.
- Viewports padrao, 900px e 720px sem overflow horizontal.
- Console do navegador sem erros/warnings.

Proximo passo sugerido:

- Etapa 31.5 - QA do Region Atlas / Progressao de Unlocks.

## QA da Etapa 28.5 - Market Visual Avancado

Validado/corrigido:

- `npm.cmd run build` passou antes e depois das correcoes.
- Market abriu pela Topbar no smoke Vite e exibiu Buy, Sell, Quick Sell, Buyback e Services.
- Buy tab exibiu cards, saldo de `guild.gold`, Purchase Order, busca/categorias, ItemIcon e ItemTooltip.
- Compra de Minor Health Potion no mock local reduziu `guild.gold` de 420g para 120g e registrou log de Market purchase.
- Sell tab renderizou origem Inventory, filtros, Sell Safety, linhas de item, valores e warnings de protecao.
- Quick Sell foi revisado para manter a mesma logica de `quickSellItems`/`canSellItem` e nao selecionar supplies/equipment por padrao.
- `buyMarketItem` agora normaliza `guild.gold`, valida destino e tolera `guildDepot.items` ausente antes de aplicar transacao.
- Venda por `marketService` agora soma gold a partir de valor normalizado e tolera arrays ausentes nas origens.
- Buy, Sell e Quick Sell receberam trava curta contra duplo clique durante processamento.
- Sell Summary agora conta apenas IDs ainda vendaveis/visiveis, evitando selecao obsoleta.
- `filterMarketItems` agora ignora item invalido em vez de quebrar busca/filtro.
- Fontes de Market e Quick Sell agora toleram inventory/depot ausentes.

Bugs encontrados:

- Venda podia somar em `guild.gold` invalido e propagar `NaN`.
- Buy bloqueado podia devolver guild com gold invalido sem normalizacao.
- Sell/Quick Sell podiam liberar o botao no mesmo tick e ficavam mais vulneraveis a clique duplo.
- Filtro de Market assumia que todo `InventoryItem` tinha `item` valido.
- Selecionados no Sell podiam contar IDs obsoletos ou bloqueados no resumo.

Limitacoes da QA:

- `npm run tauri:dev` e SQLite real nao foram testados por clique nesta etapa.
- Save/load real de compra/venda foi validado por leitura do fluxo existente de autosave/handlers, nao por reabrir o app Tauri.
- O navegador embutido nao conseguiu disparar venda manual por clique no smoke, embora a Sell tab tenha renderizado corretamente; essa validacao fica como prioridade da Etapa 29 ou de um QA Tauri presencial.
- Filtros de Buy seguem o catalogo atual de `shopItems` (supplies/runes/ammo/containers/utilities); categorias como Weapons/Armor/Accessories/Materials dependem de ampliar catalogo em etapa futura.

## Etapa 28 - Market visual avancado

Implementado:

- Market em janela visual de MMORPG com cabecalho de mercador, saldo de `guild.gold`, abas Buy, Sell e Quick Sell, alem de Buyback/Services como placeholders.
- Buy tab com busca por nome/tipo/categoria, filtro por categoria, cards compactos com `ItemIcon`, preview com `ItemTooltip`, controle de quantidade e resumo de compra.
- Compra validada por `buyMarketItem`, bloqueando item/catalogo invalido, quantidade/preco invalidos, gold insuficiente, requisito de level/vocacao e falta de capacity no inventario.
- Destino da compra selecionavel: Inventory do personagem, Character Depot ou Guild Depot.
- Sell tab com origem Inventory/Character Depot/Guild Depot, filtros/busca/raridade, lista com `MarketItemRow`, tooltip e motivos de protecao.
- Quick Sell integrado como aba dedicada, reutilizando a logica segura da Etapa 26.
- Resumo de venda mostra origem, itens visiveis, protegidos, gold atual e gold apos venda.
- Visual novo em CSS com cards, trilhos de filtro, resumo lateral, warnings e responsividade para telas menores.

Limitacoes atuais:

- Buyback e Services nao executam transacoes reais.
- Nao ha market online, player market, auction house, trade, premium ou moeda paga.
- Comparacao de equipamento e basica.
- QA manual interativo no Tauri/SQLite ficou para a Etapa 28.5.

Validacao:

- `npm.cmd run build` passou.

## QA da Etapa 26.5 - Inventario, Loot e Venda Rapida

Validado/corrigido:

- `ItemIcon` renderiza itens do inventario, Market, Quick Sell e Loot Result com fallback visual para slot vazio/desconhecido.
- `ItemTooltip` mostra tipo, raridade, quantidade, sell value, peso, requisitos, upgrade, tier, imbuements e motivos de protecao de venda.
- Inventory Grid renderiza slots vazios, itens, quantidades, tooltips e avisos sem `NaN` no smoke visual.
- Quick Sell abre no modo de venda, seleciona por padrao apenas loot seguro, calcula total, vende o selecionado e atualiza gold/lista no mock local.
- Market antigo de venda e compra continua renderizando com a nova coluna de icone.
- O resumo de venda agora usa o mesmo calculo de valor da engine, incluindo upgrade/tier.
- A UI de Market e Inventory agora passa a lista de origem para `canSellItem`, corrigindo o caso de container com conteudo aparecer como vendavel na interface.
- `calculateSellValue` e linhas visuais normalizam quantity invalida para evitar `NaN`.
- Quick Sell recebeu trava simples contra clique duplo no botao Vender.
- `git diff --check` e `npm run build` passaram apos as correcoes.

Bugs encontrados:

- MarketItemRow calculava protecao de venda sem `sourceItems`, entao container com conteudo podia parecer vendavel na UI mesmo bloqueado pela engine.
- InventoryItemRow tambem nao tinha contexto completo para sinalizar corretamente container com conteudo.
- Total selecionado no Market usava calculo simples e podia divergir de itens com upgrade/tier.
- Quantidade invalida poderia vazar como `NaN` em calculos visuais.
- Modo Compra do Market ficou sem icone na nova grade de 5 colunas.

Limitacoes da QA:

- Smoke interativo foi feito em `npm run dev`, que usa mock local quando o plugin SQLite do Tauri nao esta disponivel no browser.
- `npm run tauri:dev` e persistencia SQLite real nao foram reexecutados nesta QA.
- Daily Reward/Guild Depot/Forge/Imbuements foram validados por leitura/build e pelas protecoes compartilhadas, nao por cliques no app Tauri nesta etapa.

## QA da Etapa 27.5 - Hunt / Combat Scene

Validado/corrigido:

- Hunt Scene aparece somente para personagem com `status === "hunting"` e `currentAction.type === "hunting"`.
- Trocar de personagem em hunt para personagem idle remove a cena, combat log e loot preview visuais.
- Botao `Collect Hunt Result` nao depende mais de `sceneProgress >= 100%`; agora usa `readyToResolve` ou tempo restante real zerado.
- Progresso visual passou a ser derivado de forma consistente com o tempo restante, evitando cena 100% com timer ainda rodando.
- `startedAt`, `endsAt` e `durationMinutes` invalidos recebem fallback seguro para evitar `NaN`.
- `HuntActionBar` clampa progresso visual em 0..100%.
- Hook limpa `setInterval` no unmount/troca de action e nao roda para action pronta.
- Smoke visual via `npm run dev` confirmou cena renderizada, criaturas, HP bars, action bar, analyzer, log, loot preview e ausencia de `NaN`.

Bugs encontrados:

- Em dados inconsistentes do mock, `sceneProgress` podia chegar a 100% enquanto `endsAt` ainda indicava tempo restante, exibindo Collect cedo demais.
- Cena podia aparecer para `currentAction` hunting mesmo se o status real do personagem nao fosse `hunting`.
- Datas/horarios invalidos tinham caminho para exibir `NaN` em tempo/progresso.

Limitacoes da QA:

- `npm run tauri:dev`, SQLite real, offline catch-up real e auto-repeat real nao foram testados manualmente nesta etapa.
- Recompensa duplicada foi validada por leitura do fluxo real (`handleFinishHunt`/guardas de resolucao) e por nao clicar em Collect no smoke web.

## QA da Etapa 21.5 - Weapon Proficiency

Validado/corrigido:

- `character.weaponProficiencies` agora e normalizado para saves antigos ou ausentes.
- SQLite persiste `weapon_proficiencies_json` por personagem.
- Saves antigos sem o campo novo recebem sword, axe, club, bow, wand, staff, fist e shield no level 1.
- Detecção de arma equipada usa `weaponProficiencyType` explícito e fallback seguro por slot/nome/atributos.
- Quiver nao conta como shield; shield so conta quando `offhandType` e `shield`.
- Finish hunt aplica XP de proficiency uma vez no fluxo normal de coleta.
- Arma principal ganha mastery XP proporcional ao resultado; shield ganha XP reduzido.
- Perks desbloqueiam por level, sem duplicar `unlockedPerkIds`.
- Bônus passivos entram no recalculo de atributos sem gerar NaN.
- Character Details mostra mastery ativa, progresso, shield mastery e perks ativos.
- RightCharacterPanel mostra mastery ativa e tipo no equipamento.
- Weapon Proficiency Window mostra todos os tipos, progresso, XP, level e perks locked/unlocked.
- Supply reduction por mastery foi integrado ao consumo final de supplies, sem permitir consumo negativo.

Balanceamento aplicado:

- Tabela de XP usa curva progressiva ate level 20.
- Level 2 e cedo; levels 5/10/20 escalam para objetivos de curto, medio e longo prazo.
- Perks ficam em 2% a 3% para evitar quebrar economia, risco e supplies.
- Shield XP usa 35% do XP da arma principal quando shield esta equipado.

Limitacoes mantidas:

- Nao ha escolha manual de perks.
- Nao ha reset de proficiency.
- Nao ha arvore complexa de mastery.
- Boss/Quest/Training ainda nao concedem Weapon Proficiency XP nesta QA; o foco ficou em hunts.
- Staff depende de item staff futuro ou fallback por nome, pois o catalogo atual ainda nao possui staff dedicado.

## Etapa 22 - Monster Focus / Prey real

Implementado:

- Tipos `MonsterFocusBonusType`, `MonsterFocusSlotStatus`, `MonsterFocusSlot` e `MonsterFocusState`.
- `character.monsterFocus` normalizado para saves antigos.
- Persistencia SQLite em `monster_focus_json`.
- Configuracao em `src/data/monsterFocus.ts` com 10 hunts de duracao, slot 1 liberado, reroll base de 250g e bonus pequenos.
- Engine isolada em `src/game-engine/monster-focus/`.
- Janela Monster Focus real no menu lateral do personagem.
- Slots ativos/vazios/bloqueados, clear e reroll de bonus.
- Ativacao usando criaturas vistas no Bestiary.
- Hunt cards e Action Analyzer mostram match/estimativa quando ha foco compativel.

Calculo de bonus:

- `matchRatio` usa `monsterKills` reais quando a hunt e finalizada.
- Se nao houver kills detalhadas, usa presenca simples da criatura na hunt.
- Bonus efetivo = `bonusPercent * matchRatio`.
- Experience aumenta XP final.
- Gold aumenta gold final.
- Loot aumenta valor agregado de loot.
- Supplies reduz consumo final.
- Risk reduz multiplicador de morte antes da simulacao usando presenca simples.

Consumo de cargas:

- Ao coletar uma hunt compativel, cada slot ativo com match consome 1 carga.
- Hunt sem a criatura focada nao consome carga.
- Training, quest e boss nao consomem carga nesta etapa.
- Offline catch-up apenas marca a hunt pronta; bonus/carga sao aplicados no fluxo de coleta.

Limitacoes atuais:

- Slot 2 e slot 3 continuam bloqueados para futuro.
- Reroll troca apenas o tipo de bonus, mantem criatura e remainingHunts.
- Nao ha premium, moeda paga, raridade de prey ou contrato diario complexo.
- Bonus de loot atua no valor agregado do resultado, nao na rolagem individual de cada item.

## Etapa 22.5 - QA do Monster Focus / Prey

Validado/corrigido:

- Build TypeScript/Vite validado antes e depois das correcoes.
- `character.monsterFocus` continua por personagem e e normalizado para saves antigos ou ausentes.
- Normalizacao agora limpa monsterId fora do catalogo, bonus invalido, remainingHunts invalido, remainingHunts negativo, bonusPercent NaN e rerollCount NaN.
- Save SQLite agora grava `monster_focus_json` ja normalizado, evitando persistir estados antigos corrompidos.
- Ativacao bloqueia slot locked e tambem bloqueia sobrescrever slot ativo sem limpar antes.
- Ativacao valida bonusType recebido antes de criar o slot.
- Janela Monster Focus sincroniza criatura selecionada quando o Bestiary muda com a janela aberta.
- Janela Monster Focus reajusta slot selecionado ao trocar personagem ou ao cair em slot bloqueado.
- Botao de ativacao fica desabilitado quando o slot ativo precisa ser limpo primeiro.
- Menu lateral deixou de marcar Focus como `Soon` e agora mostra quantidade de focuses ativos.
- Subtitle da janela Monster Focus deixou de tratar o sistema como preview.
- Hunt Result agora exibe uma secao propria de Monster Focus quando o bonus aplica.

Validacao de integracao:

- Hunts compativeis calculam bonus por `monsterKills` reais no resultado final.
- Hunts incompativeis nao aplicam bonus e nao consomem carga.
- Offline catch-up continua conservador: a hunt fica pronta e o bonus/carga so entram na coleta.
- Auto-repeat continua usando o mesmo fluxo de coleta; cada run coletada aplica e consome uma vez quando compativel.
- Boss, quest e training continuam fora do consumo/aplicacao de Monster Focus.

Limitacoes mantidas:

- Slots 2 e 3 seguem bloqueados.
- Reroll continua apenas trocando o tipo de bonus, com custo em `guild.gold`.
- Sem premium, moeda paga, ranking online, raridade de prey ou contratos diarios complexos.
- Proximo passo sugerido: Etapa 23 - Destiny / Wheel real.

## Etapa 23 - Path of Destiny / Wheel real

Implementado:

- Tipos `DestinyNodeCategory`, `DestinyNodeShape`, `DestinyBonus`, `DestinyNode` e `CharacterDestinyState`.
- `character.destiny` individual por personagem.
- Destiny Points derivados do level: 0 antes do level 10 e +1 ponto a cada 5 levels a partir do level 10.
- Dados iniciais em `src/data/destinyNodes.ts` com nodes genericos e nodes de Guardian, Ranger, Arcanist, Warden e Monk.
- Engine em `src/game-engine/destiny/` para calcular pontos, normalizar save antigo, validar unlock, desbloquear node, somar bonus e resetar caminho.
- Janela Path of Destiny substitui o placeholder por uma wheel funcional com linhas de prerequisito, nodes bloqueados/disponiveis/desbloqueados e painel de detalhes.
- Badge no menu lateral mostra Destiny Points disponiveis.
- Character Details e RightCharacterPanel mostram resumo de Destiny.
- Action Analyzer mostra bonus de hunt vindos do Destiny quando houver.
- SQLite persiste `destiny_json` por personagem e normaliza saves antigos com fallback seguro.

Integracao de bonus:

- Health, capacity, attack, magic, distance, fist, defense e crit entram no recalculo de atributos.
- XP, gold, loot, supplies e risco entram no fluxo de hunt.
- Supply reduction de Destiny e limitado defensivamente em 20% dentro do sistema.
- Risk reduction de Destiny e limitado defensivamente em 30% e o risco final continua clampado.
- Bonus acumulam com equipamentos, Forge, Imbuements, Weapon Proficiency, Charms e Monster Focus sem criar novo sistema online ou premium.

Limitacoes atuais:

- A wheel inicial e enxuta, com poucos nodes por vocacao.
- Reset Path existe com custo em `guild.gold` e confirmacao simples do navegador.
- Sem builds salvas, import/export, efeitos elementais avancados, ranking online, premium ou multiplas paginas de wheel.
- Proximo passo sugerido: Etapa 23.5 - QA do Path of Destiny.

## Etapa 23.5 - QA do Path of Destiny / Wheel

Validado/corrigido:

- Build TypeScript/Vite validado antes e depois das correcoes.
- Calculo de Destiny Points revisado: 0 antes do level 10 e +1 ponto a cada 5 levels a partir do level 10.
- Defaults e saves antigos continuam carregando `character.destiny` com `unlockedNodeIds: []`, pontos derivados do level e `availablePoints = totalEarnedPoints - spentPoints`.
- Normalizacao de Destiny agora reconstrui nodes desbloqueados pela ordem do catalogo, aceitando JSON salvo fora de ordem quando os prerequisitos tambem existem.
- Normalizacao continua removendo node inexistente, node duplicado, node de vocacao errada, prerequisito ausente e progresso acima do budget de pontos.
- `spentPoints`, `availablePoints` e `totalEarnedPoints` seguem recalculados pelo level, sem confiar em valores salvos corrompidos.
- Unlock/Reset receberam trava curta contra spam de clique para evitar logs duplicados e cobranca repetida.
- Dados dos nodes foram revisados para ids unicos, vocacoes reais, custos pequenos, prerequisitos existentes e bonus em escala segura.
- Badge lateral continua usando `availablePoints`, atualizando ao trocar personagem ou gastar ponto.
- Character Details, RightCharacterPanel e Action Analyzer continuam protegidos contra Destiny undefined via normalizacao.

Validacao de integracao:

- Bonus de atributos continuam aplicados via `calculateCharacterAttributes`.
- Bonus de XP, gold, loot, supplies e risco continuam aplicados no fluxo de coleta da hunt.
- Offline catch-up continua conservador: pontos e bonus entram quando a acao pronta e coletada, sem aplicar recompensa no carregamento.
- Auto-repeat continua usando o mesmo finish hunt por run, sem caminho separado para duplicar bonus.
- Weapon Proficiency, Monster Focus, Charms, Forge e Imbuements seguem acumulando com Destiny pelos calculos existentes.

Limitacoes mantidas:

- QA visual/manual completa no app desktop ainda deve ser feita em 1366x768.
- Reset Path segue simples, com `window.confirm` e custo em `guild.gold`.
- Sem arvore grande, ranking online, premium, builds salvas, import/export ou nodes ativos de combate.
- Proximo passo sugerido: Etapa 24 - Collections: Outfits, Mounts e Avatars.

## Etapa 24 - Collections: Outfits, Mounts e Avatars real

Implementado:

- Tipos `CollectionCategory`, `CollectionUnlockSource`, `CollectionRarity`, `CollectionItem`, `GuildCollectionsState` e `CharacterCosmetics`.
- Catalogo inicial em `src/data/collections.ts` com Outfits, Mounts e Avatars.
- Unlocks guild-wide em `guild.collections`.
- Selecao ativa por personagem em `character.cosmetics`.
- Engine em `src/game-engine/collections/` para defaults, normalizacao, unlock, equip, clear de novos itens e cosmeticos ativos.
- Starter unlocks garantidos para saves novos e antigos.
- SQLite persiste `guilds.collections_json` e `characters.cosmetics_json`.
- Janela Collections real com abas Outfits, Mounts e Avatars, cards locked/unlocked/equipped, rarity/source, requisito e botao Equip.
- Painel direito usa avatar textual ativo e mostra outfit/mount do personagem.
- Character Details mostra resumo de cosmeticos ativos.
- Badge lateral de Collections usa `newlyUnlockedCollectionItemIds` e e limpo ao abrir Collections.
- Store lista cosmeticos `store_placeholder` como planejamento, sem compra, checkout, premium ou pagamento real.

Cosmeticos iniciais:

- Starter Outfits: Wanderer, Field Hunter, Apprentice Mystic, Iron Guard e Road Monk.
- Starter Mounts: No Mount, Old Mule e Brown Pony.
- Starter Avatars: Recruit Emblem, Sword Emblem, Shield Emblem, Bow Emblem, Arcane Emblem e Monk Emblem.
- Locked/futuros: Rat Catcher, Cave Delver, Bandit Breaker, Noble Adventurer, Forest Stag, Cave Boar, Ash Wolf, Merchant Cart, Beast Hunter Sigil, Dungeon Victor Sigil, Golden Guild Sigil e Ancient Rune Sigil.

Unlocks simples:

- Completar uma quest com sucesso desbloqueia Cave Delver uma vez.
- Derrotar um boss desbloqueia Dungeon Victor Sigil uma vez.
- Unlocks duplicados nao geram novo item nem novo log.

Limitacoes atuais:

- Sem sprites externos, imagens protegidas, bonus de poder, loja paga, premium, checkout, trade ou online.
- Bestiary/Daily ainda estao preparados por source, mas sem unlock automatico nesta etapa.
- Proximo passo sugerido: Etapa 25.5 - QA do Daily Reward.

## Etapa 24.5 - QA de Collections

Validado:

- Catalogo de Collections possui Outfits, Mounts e Avatars com IDs unicos, categorias validas, nome, descricao, rarity, source, preview e requisitos legiveis.
- Starter cosmetics continuam garantidos por `normalizeCollectionsState` para saves novos e antigos.
- `guild.collections` aceita undefined, IDs duplicados e IDs removidos do catalogo sem quebrar UI ou persistencia.
- `character.cosmetics` aceita undefined, slot errado, item bloqueado e item removido, voltando para defaults validos por vocacao.
- Unlocks permanecem guild-wide em `guild.collections`; selecao ativa continua individual por personagem em `character.cosmetics`.
- `equipCollectionItem` bloqueia item inexistente, bloqueado e restrito por vocacao, sem alterar outros personagens.
- Janela Collections exibe abas Outfits/Mounts/Avatars, contadores, preview, rarity/source, requisito, status e botao Equip desabilitado quando necessario.
- Painel direito e Character Details leem cosmeticos ativos via `getActiveCharacterCosmetics`, com fallback normalizado.
- Badge lateral usa `newlyUnlockedCollectionItemIds` normalizado e e limpo ao abrir Collections.
- SQLite salva `guilds.collections_json` e `characters.cosmetics_json` com normalizacao no save e no load.
- Store segue placeholder: sem compra real, checkout, premium, moeda paga ou unlock funcional.
- Cosmeticos seguem sem bonus de XP, gold, loot, speed, capacity, supplies, risco de morte ou poder.

Bugs corrigidos:

- Unlock de Collections por quest/boss fazia duas chamadas separadas a `unlockCollectionItem`; agora cada evento calcula guilda e logs a partir do mesmo resultado de unlock, evitando inconsistencias de log/estado em unlocks duplicados.
- Fallback textual do avatar no painel direito usava `character.name.slice(...)`; agora usa null-safety e fallback `"??"`.

Validacoes executadas:

- Build inicial: `npm.cmd run build` passou.
- Build final: `npm.cmd run build` passou.
- Dev server Vite respondeu em `http://127.0.0.1:1420`.
- QA interativo por navegador embutido nao foi concluido nesta sessao por falha local de permissao (`EPERM` ao acessar AppData antes da conexao do browser).

Limitacoes mantidas:

- Sem loja paga real, premium, checkout, online, sprites externos, assets protegidos ou bonus de poder por cosmetico.
- Bestiary/Daily/Event ainda ficam como sources planejados, sem novo sistema grande de unlock nesta etapa.
- QA manual visual completa em 1366x768 ainda deve ser repetida no app desktop.
- Proximo passo sugerido: Etapa 25 - Daily Reward real.

## Etapa 25 - Daily Reward real

Implementado:

- Tipos `DailyRewardType`, `DailyRewardDefinition`, `DailyRewardClaim` e `DailyRewardState`.
- Estado guild-wide em `guild.dailyReward`, com `lastClaimedAt`, `currentStreak`, `totalClaims`, `cycleDay`, historico e `claimedToday`.
- Persistencia SQLite em `guilds.daily_reward_json`, com migration para saves antigos.
- Engine em `src/game-engine/daily-reward/` para default, normalizacao, data local, streak, permissao de claim, recompensa atual, preview, apply e claim.
- Janela Daily Reward real aberta pela Topbar, com status, streak, total claims, trilha de 7 dias, botao Claim e historico recente.
- Badge `!` no botao Daily da Topbar quando a recompensa do dia esta disponivel.
- Activity Log ao claimar recompensa e ao bloquear claim duplicado.
- Trava de clique duplo no handler do App e nova checagem na engine antes de aplicar recompensa.

Regras:

- Daily Reward e da guilda/conta, nao de personagem individual.
- Permite 1 claim por dia local.
- Se o ultimo claim foi ontem, `currentStreak` aumenta em 1.
- Se o ultimo claim foi antes de ontem ou invalido, streak volta para 1.
- Ao claimar, `cycleDay` avanca; depois do dia 7 volta para o dia 1.
- `claimedToday` e recalculado por data local e nao depende cegamente do valor salvo.

Ciclo inicial de 7 dias:

- Dia 1: 250 gold em `guild.gold`.
- Dia 2: Health Potion x5 no Guild Depot.
- Dia 3: Iron Ore x3 no Guild Depot.
- Dia 4: Mana Potion x5 no Guild Depot.
- Dia 5: 500 gold em `guild.gold`.
- Dia 6: Old Cloth x8 no Guild Depot.
- Dia 7: Beast Hunter Sigil em Collections.

Integracoes:

- Gold entra em `guild.gold`.
- Itens, supplies e materiais entram no Guild Depot por ser o destino mais seguro quando nao ha dependencia de personagem selecionado.
- Recompensa de Collections usa `unlockCollectionItem`; se o cosmetico ja estiver desbloqueado ou invalido, vira fallback de 350 gold.
- `newlyUnlockedCollectionItemIds` continua alimentando o badge de Collections quando o Daily desbloqueia cosmetico novo.
- Save/load normaliza `dailyReward` para saves antigos, campos undefined, datas invalidas, NaN, streak negativo, `cycleDay` fora de 1..7 e historico quebrado.

Limitacoes atuais:

- Sem premium daily, pagamento, moeda paga, online, calendario online, anti-cheat de data, anuncios, temporadas, compra de streak ou restore streak.
- Recompensas sao pequenas e nao aplicam bonus de poder, XP real temporario, gold multiplier, loot multiplier ou vantagem premium.
- Historico e limitado aos ultimos 20 claims.
- Proximo passo sugerido: Etapa 26 - Market visual avancado.

## Etapa 25.5 - QA do Daily Reward em Tauri/SQLite

Validado:

- `npm.cmd run build` passou antes da QA e depois da correcao.
- `npm.cmd run tauri:dev` compilou o frontend, iniciou Vite em `127.0.0.1:1420`, compilou o target Rust e abriu `guild-hunt-idle.exe`.
- SQLite real localizado em `C:\Users\jvict\AppData\Roaming\com.jhonoaru.guildhuntidle\guild_hunt_idle.db`.
- Tabela `guilds` possui `daily_reward_json`; migration e idempotencia foram revisadas no codigo.
- Save real preservou `guild.gold = 670`, `currentStreak = 1`, `totalClaims = 1`, `cycleDay = 2`, `claimedToday = true` e historico do claim do dia 1.
- Reabrir o app via Tauri manteve o Daily como claimed today no SQLite, sem reaplicar recompensa automaticamente.
- Activity Log persistiu mensagens do Daily: recompensa de 250 gold e streak de 1 dia.
- Guild Depot real permaneceu consistente no banco, com stacks existentes preservados.
- ItemIds do ciclo foram conferidos em `src/data/items.ts`: `health-potion`, `iron-ore`, `mana-potion` e `old-cloth`.
- Collection reward `avatar-beast-hunter-sigil` foi conferido em `src/data/collections.ts`.
- Normalizacao cobre daily undefined, JSON null/invalido via fallback de parse, data invalida, NaN, streak negativo, `cycleDay` invalido e historico limitado a 20 claims.

Bugs encontrados e corrigidos:

- `applyDailyReward` assumia `guildDepot.items` sempre valido. Agora `applyDailyReward` e `claimDailyReward` normalizam um Guild Depot ausente/invalido para um depot vazio seguro antes de aplicar item, fallback, collection ou caminho bloqueado.

Testes feitos:

- Build inicial e build final.
- Start real com `npm.cmd run tauri:dev`.
- Consulta direta do SQLite real para schema, `daily_reward_json`, logs e Guild Depot.
- Validacao por leitura dos fluxos de claim unico, badge Daily, cycle day, streak, fallback de collection e envio ao Guild Depot.

Testes nao feitos:

- Clique manual dentro da janela Tauri nesta sessao; a validacao interativa completa de botao disabled/badge visual deve ser repetida na janela desktop.
- Simulacao pratica de "amanha" e dia 7 no SQLite real; estes cenarios foram validados por leitura da engine e normalizacao.
- Claim de recompensa de item/material/collection no Tauri real sem alterar data/estado do save do usuario.

Limitacoes restantes:

- Sem anti-cheat de data local, premium daily, pagamento, online, calendario complexo, temporadas ou restore streak.
- Daily continua simples e guild-wide.
- Proximo passo sugerido: Etapa 26 - Market visual avancado.

## QA visual da Etapa 20.5

Validado:

- Topbar com guilda, personagem, level, gold, moeda cosmetica placeholder e atalhos principais.
- Botao EXPLORAR abre a janela Explorar / Modos de Jogo.
- GameWindow possui titulo, subtitulo, fechar e scroll interno.
- Explorar exibe Hunts, Bosses, Training e Quests por abas internas.
- Painel direito exibe personagem, XP, equipamentos, inventario compacto, capacity e activity log.
- Menu lateral abre os sistemas do personagem e usa badges/estado ativo.
- Janelas placeholder nao mencionam pagamento real, premium real ou loja funcional.
- Settings agora contem comandos reais de save/reload/reset.

Bugs corrigidos:

- Topbar estava mais estreita que a area util em 1366px; agora usa `width: 100%`.
- Janelas full ficavam apertadas com o roster aberto; agora escondem o roster e ganham area central maior.
- Menu lateral podia exibir scrollbar horizontal por badges; overflow horizontal foi bloqueado.
- Settings nao tinha botoes de save/reload/reset; agora usa os handlers reais do app.
- Reload/reset podiam deixar uma janela aberta com contexto antigo; agora retornam para Home apos aplicar o save/reset.

Limitacoes mantidas:

- Store e Daily continuam placeholders visuais.
- Imbuing ainda reaproveita o ForgePanel por baixo, com separacao visual/navegacional.
- A QA manual completa de compras/vendas/equip/forge ainda deve ser repetida quando houver uma suite automatizada de UI.

## Decisoes de design

- O jogo e uma campanha single-player totalmente offline.
- Nenhum modo online, conta remota ou economia entre jogadores esta planejado.
- O save local nao e competitivo.
- A interface deve parecer um client MMORPG/Tibia-like proprio, nao um dashboard corporativo.
- O visual atual usa paineis densos, bordas discretas, fundo escuro, tons metalicos/verdes e destaques dourados.
- Nao usar nomes oficiais protegidos de Tibia.
- Manter nomes proprios e alternativos para vocacoes, cidades, regioes, monstros, hunts, quests e itens.
- Manter a UI compacta, com scroll interno nos paineis principais quando necessario.

## Estrutura principal de pastas

- `src/app/`: componente principal da aplicacao e orquestracao do estado em memoria.
- `src/components/`: componentes React separados por area da UI.
- `src/components/layout/`: shell, top bar, paineis laterais e painel principal.
- `src/components/character/`: roster, detalhes, skills e acao atual.
- `src/components/hunt/`: lista de hunts, cards, painel de acao e resultado.
- `src/components/hunt-prep/`: UI de presets, checklist e resultado de preparacao de supplies.
- `src/components/inventory/`: inventario, depot, linhas de item e capacity.
- `src/components/equipment/`: painel de equipamentos e slots.
- `src/components/training/`: treino, opcoes e resultado.
- `src/components/quest/`: quests, acessos e resultado.
- `src/components/log/`: log de atividade.
- `src/components/ui/`: componentes pequenos reutilizaveis.
- `src/data/`: dados mockados e catalogos do jogo, como personagens, guilda, monstros, itens, hunts, quests, acessos e treinos.
- `src/game-engine/`: regras puras de jogo para hunts, loot, inventario, equipamentos, atributos, quests e progressao.
- `src/game-engine/hunt-prep/`: regras puras para presets, validacao, movimentacao e compra de supplies antes da hunt.
- `src/game-services/`: servicos que coordenam regras do engine para iniciar/finalizar acoes.
- `src/database/`: conexao SQLite, migrations, mapper e repositorio de save/load local.
- `src/shared/`: tipos, constantes e utilitarios compartilhados.
- `src/security/`: notas futuras de seguranca local.
- `src-tauri/`: projeto Tauri/Rust e configuracoes desktop.
- `docs/`: documentacao do projeto e planos tecnicos.
- `prisma/`: placeholder futuro; nao ha schema nem dependencia Prisma ativa.

## Proximos sistemas planejados

- Balanceamento fino de bosses, party power, risco, recompensas e cooldowns.
- QA da persistencia local apos novos fluxos de gameplay.
- Melhor isolamento futuro da camada de save/load dos componentes React, se o estado crescer mais.
- Prisma apenas quando houver decisao explicita.
- Offline catch-up real para progresso enquanto o app esta fechado.
- Mais bosses, boss access e balanceamento de cooldowns.
- Melhorias futuras no Market NPC local.
- Melhorias no depot e economia.
- Mais quests, hunts, monstros, itens, equipamentos e regioes.
- Balanceamento de risco, XP, gold, loot, capacity e progresso de skills.
- Bazar Rotativo Offline com ofertas locais persistentes e renovacao controlada.
- Guarda-roupa cosmetico com trocas por gold, trofeus de bosses e itens de quests.

## Cuidados para nao quebrar o projeto

- Nao reiniciar o projeto em outra pasta.
- Nao trocar a stack atual sem decisao explicita.
- Nao adicionar banco, Prisma ou SQLite sem pedido explicito.
- Nao transformar a UI em dashboard corporativo.
- Preservar o estilo visual escuro, compacto e denso.
- Preservar os nomes proprios ja definidos.
- Manter regras de jogo em `src/game-engine` sempre que possivel.
- Manter coordenacao de acoes em `src/game-services`.
- Evitar colocar regra de jogo pesada diretamente em componentes React.
- Tratar `src/data` como fonte temporaria de dados mockados enquanto nao houver persistencia.
- Validar capacity, requisitos de level, vocacao, acessos e estado atual antes de iniciar acoes.
- Ao mexer em equipamentos, recalcular atributos e capacity de forma consistente.
- Ao mexer em quests/acessos, garantir que hunts bloqueadas continuem respeitando `requiredAccess`.
- Ao mexer em layout, verificar scroll interno e botoes em resolucoes menores.
- Usar `npm run build` para checar TypeScript antes de considerar uma alteracao pronta.
- Manter `npm run tauri dev` funcionando para desenvolvimento desktop.

## Estado observado nesta sessao

- O repositorio local existe no caminho informado.
- A arvore atual ja contem os sistemas descritos acima.
- O `git status` ja possuia alteracoes locais relacionadas as etapas recentes antes desta revisao.
- Nao foi encontrado uso ativo de banco de dados.
- Nao foi encontrado schema Prisma ativo.
- Nao foi implementado sistema online.
- Nao foi implementado market entre jogadores.
- A Etapa 10.5/Aba Acao foi revisada antes de iniciar a Etapa 11.
- `npm.cmd run build` passou com TypeScript e Vite.
- `npm.cmd run tauri dev` iniciou o app/Tauri sem erro imediato; a execucao foi encerrada por timeout curto de verificacao.
- Etapa 11 implementada com persistencia SQLite local via Tauri SQL Plugin.
- `cargo check` passou no projeto Tauri.
- `npm.cmd run tauri:build` passou e gerou bundles MSI/NSIS.
- Economia corrigida para usar `guild.gold` como moeda universal.

## Etapa 7 - Quests, acessos e cancelamento

Status: concluida.

Checklist revisado:

- Personagem idle consegue iniciar quest disponivel.
- Personagem questing consegue finalizar quest.
- Quest completed aparece como concluida.
- Quest locked mostra motivo.
- Acesso liberado aparece no personagem.
- Hunts bloqueadas por acesso ficam bloqueadas.
- Apos completar a quest certa, a hunt libera.
- Personagem hunting, training ou questing consegue cancelar e virar traveling.
- Traveling pode ser finalizado e personagem volta para idle.
- Layout usa paineis com scroll interno e nao deve sobrepor cards.

Correcoes feitas durante a revisao:

- Cancelar uma quest em andamento agora limpa o progresso ativo da quest, evitando que ela fique presa como `in_progress` apos a viagem.
- O mock inicial de Mira foi alinhado para apontar para uma quest real em andamento, permitindo testar o fluxo de finalizar quest diretamente pelo estado inicial.

## Etapa 8 - Bosses, Party e Cooldowns

Status: implementada em versao inicial e revisada em 2026-06-29.

Checklist implementado:

- Tipos de boss, party, cooldown, reward, requirement e resultado.
- Campo `bossCooldowns` nos personagens.
- Catalogo inicial com 6 bosses: Sewer Broodmother, Grunk the Camp Breaker, Crypt Warden, Khazgrim Gatekeeper, Ember Matriarch e Novice Arena Champion.
- Engine de boss com validacao, power, risk, simulacao e cooldown.
- Service de boss para iniciar, finalizar e cancelar.
- Aba Bosses no painel principal.
- Cards de boss com locked, available, cooldown e in progress.
- Party builder com roles.
- Painel de acao com chance de sucesso, chance de morte e warnings.
- Resultado de boss com mortes, XP, gold, loot, renown, cooldowns e logs.
- Lista de cooldowns do personagem selecionado com botao debug temporario para limpar cooldown local.
- Loot de boss enviado para o Guild Depot.

Limites preservados:

- SQLite local e save/load foram implementados posteriormente na Etapa 11.
- Ainda sem Prisma.
- Boss cooldowns agora sao persistidos no save local.

## Etapa 9 - Equipamentos, mochila e quiver

Status: item 3 atualizado.

Modelo de slots adotado:

- `weapon`: Arma Principal.
- `offhand`: Arma Secundaria / Escudo / Quiver.
- `helmet`: Elmo.
- `armor`: Peitoral.
- `legs`: Legs.
- `boots`: Bota.
- `amulet`: Colar.
- `ring`: Anel.
- `backpack`: Mochila Principal.

Decisoes aplicadas:

- `shield` e `ammo` foram migrados para o slot `offhand`.
- Wooden Shield e Brass Shield usam `offhandType: "shield"`.
- Light Quiver usa `offhandType: "quiver"`.
- Ranger usa quiver no offhand.
- Guardian nao equipa quiver.
- Ranger nao equipa escudo.
- Mochila Principal continua visivel no painel de equipamento.
- Adventurer Backpack usa `isContainer: true` e `containerSlots: 20`.
- `InventoryItem` esta preparado com `parentContainerId?: string | null` para containers futuros.

Ainda nao implementado nesta etapa:

- Abrir mochila.
- Mochila dentro de mochila.
- Drag and drop.
- Persistencia de conteudo de containers.

## Etapa 10 - Market NPC, venda de loot e economia basica

Status: implementada em versao inicial.

Checklist implementado:

- Tipos de market, filtro, origem e resultado de venda.
- `InventoryItem.locked` para proteger item contra venda.
- `Character.characterDepot` em memoria para depot pessoal simples.
- Engine puro de market com calculo de valor, filtragem, lista vendavel e venda.
- Service de market para vender do inventario, depot pessoal e Guild Depot.
- Aba Market na ordem principal sugerida.
- Filtros por busca, categoria e raridade.
- Selecao de item unico, multiplos itens e venda por categoria.
- Venda do inventario do personagem envia gold para `guild.gold`.
- Venda do depot pessoal envia gold para `guild.gold`.
- Venda do Guild Depot envia gold para `guild.gold`.
- Botao Travar/Destravar no Market, inventario e Guild Depot.
- Botao Travar/Destravar tambem no Depot do Personagem.
- Itens travados nao entram em venda normal pelo Market.
- Logs de venda e destino do gold no Activity Log.

Consolidacao posterior:

- Inventario e equipamento permanecem em uma unica aba.
- Inventory pode enviar item para Depot Pessoal ou Guild Depot.
- Depot Pessoal pode devolver item para o inventario respeitando capacity.
- Depot continua mostrando separadamente Depot do Personagem e Guild Depot.
- Ordem das abas mantida: Personagem, Inventario & Equipamento, Depot, Market, Hunts, Quests, Bosses, Treino.

Limites preservados:

- Ainda sem compra de itens.
- Ainda sem market online.
- Ainda sem venda entre jogadores.
- SQLite local foi implementado posteriormente via Tauri SQL Plugin.
- Ainda sem Prisma.
- Ainda sem historico avancado de precos.

## Etapa 10.5 - UX, Market NPC e Action Analyzer

Status: implementada em versao inicial.

Checklist implementado:

- Market reformulado visualmente como Market NPC com modos Comprar e Vender.
- Compra usando gold universal da guilda.
- Entrega de compras para inventario, depot do personagem ou Guild Depot.
- Itens iniciais de loja: potions, runes, municoes/quivers, containers e utilidades.
- Compra respeita capacity quando entrega no inventario do personagem.
- Venda continua centralizada no modo Vender.
- Current Action mostra tempo ativo, restante e duracao total formatada.
- Duracao de traveling de 10 segundos aparece como `10s`, nao como decimal em minutos.
- Action Analyzer criado para hunting, training, questing e bossing.
- Aba Acao criada para acompanhar Current Action, analyzer e controles sem duplicar listas.
- Analyzer mostra estimativas parciais sem aplicar recompensa automaticamente.
- Fluxo de hunt mostra aviso claro quando a hunt esta em andamento.

Correcao posterior:

- Ordem das abas atualizada para Personagem, Acao, Inventario & Equipamento, Depot, Market, Hunts, Quests, Bosses, Treino.
- Aba Personagem mostra apenas resumo curto da acao atual com atalho para Acao.
- Iniciar hunt, quest, boss ou treino troca automaticamente para a aba Acao.
- Aba Acao exibe controles contextuais para finalizar/cancelar/viagem conforme status.

Revisao de 2026-06-29:

- Confirmado que a aba Acao existe e concentra resumo, Current Action, Action Analyzer e controles contextuais.
- Confirmado que Current Action exibe tempo ativo, restante e duracao total com formatacao em segundos quando necessario.
- Confirmado que Action Analyzer nao aplica recompensa automaticamente; apenas mostra estimativas parciais.
- Corrigido bug pequeno: finalizar hunt pela aba Acao agora usa a hunt e a duracao gravadas em `currentAction`, nao a selecao atual da aba Hunts.
- Corrigido bug pequeno: finalizar/cancelar boss pela aba Acao agora usa boss e party gravados em `currentAction`, evitando resultado errado se a selecao da aba Bosses mudar.
- O contexto de party do boss agora preserva membros e roles dentro da acao atual.

Limites preservados:

- Ainda sem market online.
- Ainda sem player market.
- Ainda sem recompensa automatica por segundo.
- Ainda sem combate visual completo.
- SQLite local foi implementado posteriormente na Etapa 11.
- Ainda sem Prisma.

## Etapa 11 - Persistencia local com SQLite via Tauri SQL Plugin

Status: implementada em versao inicial.

Pacotes instalados:

- NPM: `@tauri-apps/plugin-sql`.
- Rust/Cargo: `tauri-plugin-sql` com feature `sqlite`.

Configuracao Tauri:

- Plugin SQL registrado em `src-tauri/src/lib.rs`.
- Capability padrao atualizada com `sql:default` e `sql:allow-execute`.
- Banco usado pelo frontend: `sqlite:guild_hunt_idle.db`.
- O caminho e relativo ao diretorio App do Tauri, ou seja, fica no diretorio local de dados/configuracao do app gerenciado pelo Tauri, nao dentro da pasta do projeto.

Arquivos criados:

- `src/database/schema.ts`.
- `src/database/migrations.ts`.
- `src/database/db.ts`.
- `src/database/saveMapper.ts`.
- `src/database/saveGameRepository.ts`.

Tabelas criadas:

- `guilds`.
- `characters`.
- `character_skills`.
- `inventory_items`.
- `activity_logs`.
- `save_metadata`.

Estado persistido:

- Guilda, gold, renown, rank e level.
- Personagens, status, cidade, stamina, gold, experiencia, level e capacity.
- Current action em JSON.
- Skills por personagem.
- Atributos principais em JSON.
- Inventario do personagem.
- Equipamentos por slot via `owner_type = equipped`.
- Depot do personagem.
- Guild Depot.
- Quests completas, acessos, quest progress e boss cooldowns em JSON.
- Logs principais.
- Itens travados/locked.

Integracao no app:

- Ao iniciar, o app mostra `Carregando save...`.
- `initDatabase()` conecta no SQLite e roda migrations simples.
- `loadGameState()` carrega save existente.
- Se nao houver save, `loadGameState()` retorna `null`; o app usa os mocks atuais e salva o primeiro estado.
- Se houver erro ao carregar SQLite, o app cai para mock local e registra erro no console.
- Autosave roda apos mudancas reais de `guild`, `characters`, `depot` ou `logs`, com debounce curto.
- Nao ha autosave por segundo do Action Analyzer.
- TopBar possui botoes discretos: Salvar agora, Recarregar save e Resetar save.
- Resetar save pede confirmacao simples do navegador/Tauri antes de apagar.

Cuidados aplicados:

- O catalogo fixo de itens continua em `src/data/items.ts`.
- O banco salva `item_id`; ao carregar, o repository reidrata o item pelo catalogo.
- Se um item salvo nao existir mais no catalogo, o save carrega com fallback visual `Unknown Item`.
- Equipamentos sao salvos separadamente do inventario para evitar duplicacao.
- Campos de data continuam como string.
- `save_metadata` ja possui `integrity_hash`, mas ainda sem hash calculado.
- `character.gold` nao e moeda principal. Por compatibilidade com o tipo/tabela inicial, o repository grava/carrega esse campo legado como `0`; o gold persistido de verdade e `guild.gold`.

Validacao:

- `npm.cmd run build` passou.

## Etapa 17.5 - Rework dos Imbuements e Forge estilo MMORPG

Status: implementada.

Arquivos criados:

- `src/components/forge/ForgeMaterialRequirement.tsx`.
- `src/game-engine/forge/getImbuementApplicationStatus.ts`.

Arquivos principais alterados:

- `src/data/imbuements.ts`.
- `src/components/forge/ForgePanel.tsx`.
- `src/game-engine/forge/applyImbuement.ts`.
- `src/game-engine/forge/canApplyImbuement.ts`.
- `src/game-engine/forge/calculateEnhancedItemBonuses.ts`.
- `src/game-engine/forge/removeExpiredImbuements.ts`.
- `src/shared/types.ts`.
- `src/app/App.tsx`.
- `src/styles.css`.

Regras implementadas:

- Imbuements agora tem `familyId` e `powerLevel`: `basic`, `intricate` e `powerful`.
- Familias implementadas: Strike, Focus, Precision, Fortification, Wisdom, Efficiency e Capacity.
- Cada familia possui Basic/Intricate/Powerful com custos, materiais, bonus e duracao de 20 hunts.
- Basic exige apenas slot correto; Intricate exige level 30 ou Tier 1; Powerful exige level 60 ou Tier 2.
- A Forge mostra todos os imbuements, inclusive bloqueados, com status: Available, Missing Materials, Not Enough Gold, Wrong Slot, Requires Higher Level/Tier, Already Active ou Locked.
- A aplicacao consome materiais do inventario, depot pessoal e Guild Depot, ignorando locked e quest items.
- Aplicar um imbuement da mesma familia substitui o anterior sem recuperar materiais.
- E possivel remover um imbuement especifico sem recuperar materiais.
- Cargas de imbuement agora reduzem apenas nos equipamentos usados ao finalizar hunt.
- Imbuements expirados ou invalidos nao aplicam bonus.

UI:

- Forge reorganizada em tres areas: lista de equipamentos, painel do item selecionado e lista de imbuements por familia.
- Cards mostram nivel, bonus, duracao, custo em gold, materiais disponiveis/necessarios, status e botao Apply.
- Materiais faltantes ficam destacados.
- Itens mostram upgrade, tier e quantidade de imbuements ativos.

Integracoes:

- Wisdom aumenta XP final de hunts.
- Efficiency reduz supplies consumidos.
- Strike/Focus/Precision/Fortification entram nos atributos recalculados do personagem.
- Capacity aplicada em backpack entra no capacity final.
- Market continua bloqueando venda de item com imbuement ativo.
- Save/load segue usando `imbuements_json`, com `remainingHunts` persistido.

Limites atuais:

- Sem chance de falha, crafting avancado ou reroll de atributos.
- A UI mostra origem agregada dos materiais, mas nao seleciona manualmente de qual depot consumir.
- Fortification melhora defesa/armor via atributos; nao ha uma tela separada de simulacao de reducao de risco.

Como testar:

- Abrir `Forge`, selecionar um equipamento na coluna esquerda e ver os imbuements liberados/bloqueados na coluna direita.
- Conferir custo em gold e materiais nos cards.
- Aplicar `Basic Strike` em uma weapon e confirmar gold, materiais, item ativo e atributos.
- Aplicar `Intricate Strike` depois para confirmar substituicao do Basic.
- Fazer uma hunt e confirmar que a carga cai de 20 para 19 nos equipamentos usados.
- Salvar/recarregar e confirmar que o imbuement e `remainingHunts` persistem.

Validacao:

- `npm.cmd run build` passou.

## Etapa 17.6 - QA da Forge e Imbuements

Status: concluida.

Bugs encontrados e corrigidos:

- Imbuement invalido vindo de save antigo nao quebrava a UI, mas podia contar contra o limite de slots e deixar `Apply` desabilitado indevidamente.
- Imbuement expirado com `remainingHunts: 0` nao aplicava bonus, mas ainda podia ocupar slot na validacao da Forge.
- Aplicar um novo imbuement preservava imbuements invalidos/expirados de outras familias no item, mantendo UI e Market confusos.
- Cards bloqueados mostravam status, mas nao exibiam sempre a razao textual do bloqueio.

Correcoes:

- A validacao da Forge agora conta apenas imbuements ativos validos com `remainingHunts > 0`.
- A aplicacao de imbuement limpa entradas invalidas/expiradas do item antes de gravar o novo imbuement.
- Mensagens de bloqueio aparecem no card junto do status.
- Regras de Basic/Intricate/Powerful, slot, gold, materiais, substituicao e limites foram revisadas sem adicionar sistemas novos.

Limites mantidos:

- Sem chance de falha.
- Sem reroll.
- Sem crafting avancado.
- Sem escolha manual da origem dos materiais.
- Fortification continua entrando via atributos de defesa/armor, sem simulador separado de risco.

Proximos passos sugeridos:

- Adicionar testes automatizados unitarios para `getImbuementApplicationStatus`, consumo de materiais e tick de `remainingHunts`.
- Criar uma pequena suite de saves legados para validar compatibilidade antes de novas etapas grandes.

Validacao:

- `npm.cmd run build` passou.
- `npm.cmd run tauri dev` abriu em verificacao curta com Vite em `127.0.0.1:1420` e binario Tauri iniciado.

## Etapa 18 - Offline Catch-up Real

Status: implementada.

Arquivos criados:

- `src/game-engine/offline/getOfflineElapsedMs.ts`.
- `src/game-engine/offline/getActionCompletionStatus.ts`.
- `src/game-engine/offline/markExpiredActionsReady.ts`.
- `src/game-engine/offline/createOfflineReport.ts`.
- `src/game-engine/offline/calculateOfflineCatchUp.ts`.
- `src/game-engine/offline/applyOfflineCatchUp.ts`.
- `src/components/offline/OfflineReportPanel.tsx`.

Arquivos principais alterados:

- `src/shared/types.ts`.
- `src/app/App.tsx`.
- `src/components/action/ActionPanel.tsx`.
- `src/components/action/ActionAnalyzer.tsx`.
- `src/components/action/ActionSummaryCard.tsx`.
- `src/components/character/CurrentActionBox.tsx`.
- `src/database/migrations.ts`.
- `src/database/saveGameRepository.ts`.
- `src/styles.css`.

Regras implementadas:

- Ao carregar/recarregar save, o app calcula tempo offline com base em `save_metadata.last_saved_at`.
- O catch-up usa cap inicial de 12 horas para o tempo considerado.
- Traveling vencido offline finaliza automaticamente e atualiza a cidade.
- Hunting, training, questing e bossing vencidos offline recebem `currentAction.readyToResolve = true`.
- Recompensas de hunt/treino/quest/boss nao sao aplicadas automaticamente; o jogador coleta pela aba Acao.
- Dead/recovery vencido aparece no Offline Report como pronto para reviver, sem reviver automaticamente.
- Acoes ja prontas continuam prontas apos reload, mas nao reabrem report repetido.
- Trava em memoria evita duplo clique de coleta duplicando recompensa.
- Current Action e Action Analyzer mostram progresso 100% e restante 0s quando a acao esta pronta.

Save/metadata:

- `save_metadata` recebeu campos opcionais `last_loaded_at`, `last_closed_at` e `last_offline_catchup_at`.
- `readyToResolve`, `offlineCompletedAt` e `offlineElapsedMs` persistem dentro de `current_action_json`.
- Saves antigos sem os novos campos continuam carregando.

Limites atuais:

- Sem auto-repeat de hunt.
- Sem farm offline infinito.
- Sem vender loot ou comprar supplies automaticamente offline.
- Sem fila de acoes.
- Como `currentAction.endsAt` historicamente usa relogio `HH:mm`, o catch-up infere a data usando `last_saved_at` como ancora.

Proximos passos sugeridos:

- Migrar novas acoes para salvar `startedAt/endsAt` em ISO completo mantendo compatibilidade com `HH:mm`.
- Adicionar testes automatizados para parsing de horario, cap de 12h e resolucao de acoes prontas.
- Futuramente, criar upgrades/regras para aumentar limite de offline e auto-repeat controlado.

Validacao:

- `npm.cmd run build` passou.
- `npm.cmd run tauri dev` abriu o app em verificacao curta sem erro de SQLite.

## Etapa 18.5 - QA do Offline Catch-up, Duplicacao e Save/Load

Status: concluida.

Bugs/riscos encontrados:

- A trava anti-duplo clique era liberada ao fim do handler, antes do React necessariamente limpar `currentAction`, permitindo uma janela pequena para segunda coleta do mesmo action snapshot.
- Se uma coleta de hunt/boss falhasse no meio, a excecao podia deixar fluxo sem mensagem controlada.
- Um save parcial com `currentAction.resolvedAt` poderia ser reavaliado pelo catch-up se viesse junto de `currentAction`.

Correcoes aplicadas:

- A chave de resolucao agora inclui `startedAt`, entao uma futura acao igual nao fica bloqueada por uma coleta antiga.
- Coletas bem-sucedidas mantem a chave travada em memoria, impedindo duplo clique ate o React remover a action da tela.
- Coletas que falham liberam a chave e registram log amigavel.
- `hunting`, `training`, `questing` e `bossing` bloqueiam coleta se `currentAction.resolvedAt` existir.
- O catch-up trata `resolvedAt` como action invalida e nao marca novamente como pronta.
- Hunt e boss agora protegem excecoes inesperadas durante coleta e nao deixam falha silenciosa.

Testes/revisoes realizados:

- Revisao estatica dos fluxos de hunt, training, quest e boss para duplicacao de XP, gold, loot, supplies, bestiary, cooldown e carga de imbuement.
- Revisao de save/load para `readyToResolve`, `offlineCompletedAt`, `offlineElapsedMs`, `resolvedAt` e metadata.
- Revisao da UI de acao pronta: badge, restante 0s, progresso 100%, labels de coleta e cancelamento escondido.
- Revisao de traveling offline e dead/recovery offline.

Limites mantidos:

- Sem auto-repeat.
- Sem fila de acoes.
- Sem farm infinito offline.
- Sem auto-venda ou auto-compra offline.
- Sem simulacao minuto a minuto enquanto fechado.

Proximos passos sugeridos:

- Criar testes automatizados de unidade para `markExpiredActionsReady`, `getActionCompletionStatus` e duplo clique de coleta.
- Migrar actions novas para salvar `startedAt/endsAt` em ISO completo, mantendo parser legado para saves antigos.
- Adicionar um botao dedicado de limpar action invalida em uma etapa pequena de UX.

Validacao:

- `npm.cmd run build` passou.

## Etapa 19 - Auto-repeat Opcional de Hunts

Status: implementada.

Arquivos criados:

- `src/game-engine/auto-repeat/constants.ts`.
- `src/game-engine/auto-repeat/canContinueAutoRepeat.ts`.
- `src/game-engine/auto-repeat/createNextRepeatedHuntAction.ts`.
- `src/game-engine/auto-repeat/resolveAutoRepeatAfterHunt.ts`.
- `src/game-engine/auto-repeat/stopAutoRepeat.ts`.
- `src/game-engine/auto-repeat/calculateOfflineAutoRepeatRuns.ts`.
- `src/game-engine/auto-repeat/getAutoRepeatStopReason.ts`.

Arquivos principais alterados:

- `src/shared/types.ts`.
- `src/app/App.tsx`.
- `src/components/hunt/HuntActionPanel.tsx`.
- `src/components/action/ActionPanel.tsx`.
- `src/components/character/CurrentActionBox.tsx`.
- `src/game-engine/offline/markExpiredActionsReady.ts`.
- `src/styles.css`.

Regras implementadas:

- Auto-repeat e opcional e fica desligado por padrao.
- Configuracao inicial na aba Hunts: modo, numero de runs, limite de capacity e stamina minima.
- Limite seguro por configuracao: 10 runs; padrao recomendado: 3 runs.
- Ao coletar uma hunt, o resultado normal aplica uma unica vez e so depois o auto-repeat decide se inicia a proxima run.
- A proxima run so inicia se personagem nao morreu, supplies existem, capacity esta abaixo do limite, stamina esta OK e limite de repeats nao foi atingido.
- Botao `Parar Auto-repeat` desativa proximas repeticoes sem cancelar a hunt atual.
- Current Action mostra auto-repeat ativo, run atual/maxima e condicoes de parada.
- Offline catch-up continua conservador: uma hunt auto-repeat concluida offline fica pronta para coletar, mas nao simula multiplas runs fechadas.

Limites atuais:

- Sem auto-repeat para quest, boss ou treino.
- Sem farm infinito offline.
- Sem auto-venda, auto-deposit ou auto-compra infinita de supplies.
- `autoPrepareBetweenRuns` fica salvo como `false`; preparacao automatica entre runs fica para etapa futura.
- Offline nao aplica multiplas hunts automaticamente; a proxima run comeca no momento da coleta.

Proximos passos sugeridos:

- QA 19.5 focado em supplies/capacity/death/save-load do auto-repeat.
- Integrar auto-prepare entre runs usando presets apenas depois de testes de duplicacao.
- Criar testes unitarios para `canContinueAutoRepeat` e `resolveAutoRepeatAfterHunt`.

Validacao:

- `npm.cmd run build` passou.

## Etapa 19.5 - QA do Auto-repeat, Supplies, Offline e Duplicacao

Status: concluida.

Bugs/riscos encontrados:

- Configs antigas ou corrompidas com `completedRepeats`, `maxRepeats`, stamina/capacity invalidos podiam gerar `NaN` e baguncar a contagem/paradas.
- `mode` invalido vindo de save antigo nao era tratado explicitamente.
- O botao de parar auto-repeat no painel Hunts podia aparecer para uma hunt selecionada diferente da hunt atual do personagem.

Correcoes aplicadas:

- `maxRepeats` e `completedRepeats` agora sao normalizados no engine de auto-repeat.
- Stamina/capacity thresholds invalidos sao ignorados em vez de quebrar comparacoes.
- `mode` invalido para o auto-repeat para o ciclo com motivo controlado.
- O painel Hunts so mostra auto-repeat ativo/parar quando a hunt selecionada e a hunt atual do personagem.
- Revisado o fluxo de repeat_count: 3 runs executam exatamente 3 coletas, sem quarta run.

Testes/revisoes realizados:

- Hunt normal sem auto-repeat revisada para continuar sem iniciar nova run.
- Repeat count revisado contra off-by-one.
- Paradas por supplies, capacity, stamina, morte e limite revisadas no engine.
- Offline catch-up com auto-repeat revisado: continua marcando apenas a hunt atual como pronta para coletar.
- Duplo clique segue protegido pela trava de resolucao criada na Etapa 18.5.

Limites mantidos:

- Sem auto-repeat para quest, boss ou treino.
- Sem auto-venda, auto-deposit ou auto-compra infinita.
- Sem multiplas runs aplicadas automaticamente offline.
- Sem fila complexa de acoes.
- `autoPrepareBetweenRuns` segue desativado por padrao.

Proximos passos sugeridos:

- Criar testes automatizados para `canContinueAutoRepeat` cobrindo configs invalidas.
- QA visual no app com saves reais para repetir os testes manuais obrigatorios.
- Implementar auto-prepare entre runs apenas depois de uma etapa dedicada de seguranca.

Validacao:

- `npm.cmd run build` passou.

- `cargo check` passou em `src-tauri`.
- `npm.cmd run tauri:build` passou e gerou os instaladores.
- `npm.cmd run tauri dev` foi iniciado em verificacao curta; como comando de dev fica em execucao, foi encerrado por timeout.

Limites atuais:

- Ainda sem Prisma.
- Ainda sem cloud save.
- Ainda sem online, login ou sincronizacao.
- Ainda sem market entre jogadores.
- Ainda sem criptografia forte ou anti-cheat.
- Migrations sao simples com `CREATE TABLE IF NOT EXISTS`; nao ha historico avancado de migracoes.
- Hash de integridade ficou preparado como campo, ainda nao calculado.

## Correcao de economia - Gold universal da Guilda

Status: implementada.

Decisao aplicada:

- `guild.gold` e a moeda principal universal do save offline.
- Todo gold de hunt, quest, boss e vendas entra em `guild.gold`.
- Toda compra no Market NPC usa `guild.gold`.
- `character.gold` permanece apenas como campo legado/historico salvo no estado, sem uso como moeda principal.

Fluxos atualizados:

- Finalizar hunt atualiza `guild.gold` com o resultado liquido da hunt e atualiza a TopBar.
- Completar quest soma a recompensa de gold em `guild.gold`.
- Finalizar boss soma o gold do boss em `guild.gold`.
- Venda do inventario do personagem soma em `guild.gold`.
- Venda do Depot do Personagem soma em `guild.gold`.
- Venda do Guild Depot soma em `guild.gold`.
- Compra no Market verifica e desconta sempre de `guild.gold`.
- Exercise Training tambem valida e desconta de `guild.gold`.

UI atualizada:

- TopBar continua mostrando o gold da guilda.
- Market NPC removeu selecao de gold do personagem/guilda.
- Market NPC mostra `Compra usando gold da Guilda Aurora`.
- Venda mostra `Gold sera enviado para a Guilda Aurora`.
- Character Details mudou o label de gold pessoal para `Gold gerado` com detalhe `historico`.

Tipos legados:

- `SellDestination` e `ShopPaymentSource` continuam em `src/shared/types.ts` como deprecated para compatibilidade com o formato atual de resultado/tipos antigos, mas nao sao usados pela UI como escolha de moeda.

Validacao:

- `npm.cmd run build` passou apos a correcao.

## Correcao - Traveling finaliza automaticamente

Status: implementada.

Regra aplicada:

- Apenas `traveling` finaliza automaticamente quando o tempo restante chega a `0s`.
- Hunts, quests, bosses e treinos continuam exigindo finalizacao manual para aplicar resultado/recompensa.
- Ao expirar, o personagem volta para `idle`, `currentAction` e limpo e `city` recebe `currentAction.targetName` quando existir.
- Um log unico e criado no formato `{Nome} chegou em {Cidade} e esta disponivel.`

Implementacao:

- Checagem central em `src/app/App.tsx`, executada ao terminar o loading do save e depois a cada segundo.
- A checagem usa `getTravelRemainingMs()` para manter a mesma regra de tempo da UI.
- O autosave existente salva o estado apos a finalizacao automatica porque `characters` e `logs` mudam.
- `finishTravel()` em `src/game-services/actionService.ts` tambem atualiza a cidade de destino ao finalizar manualmente.

Validacao:

- `npm.cmd run build` passou.

## Etapa 12 - Mochilas, Containers e Organizacao de Inventario

Status: implementada em versao inicial.

Tipos e dados:

- `Item` agora suporta `allowedItemTypes` e `containerType`.
- `InventoryItem.parentContainerId` continua sendo o vinculo entre item e container.
- Containers configurados: Adventurer Backpack, Small Backpack, Loot Bag, Supply Bag e Rune Pouch.
- Loot Bag aceita creature products, materials e misc.
- Supply Bag aceita consumables.
- Rune Pouch aceita consumables.
- Small Backpack foi adicionado ao catalogo e ao Market NPC.

Engine criado em `src/game-engine/container/`:

- `isContainerItem.ts`.
- `getContainerContents.ts`.
- `calculateContainerUsedSlots.ts`.
- `canMoveItemToContainer.ts`.
- `moveItemToContainer.ts`.
- `moveItemOutOfContainer.ts`.

Regras implementadas:

- Item com `parentContainerId` fica dentro do container com esse id.
- Item sem `parentContainerId` fica na raiz do inventario/depot.
- O sistema visual usa um nivel de abertura por vez, mas o tipo permanece preparado para profundidade futura.
- Bloqueado mover container para dentro de container nesta etapa.
- Bloqueado vender item dentro de container.
- Bloqueado vender container com conteudo via regra do market engine.
- Bloqueado enviar container com conteudo para depot, evitando filhos orfaos.
- `mergeStackableItems()` agora separa stacks por `parentContainerId`, evitando fundir item da raiz com item dentro de mochila.
- Equipar/unequipar item limpa `parentContainerId` quando necessario.
- Transferir item entre personagem e Guild Depot limpa `parentContainerId`.

UI:

- Inventario do personagem agora possui navegador de containers.
- Raiz mostra itens sem `parentContainerId`.
- Ao abrir uma bag, mostra conteudo, slots usados/totais e botao Voltar para raiz.
- Containers aparecem como blocos `[Bag]` com slots e tipo.
- Itens podem ser movidos por botoes simples para containers compativeis.
- Itens dentro de containers podem usar `Tirar da mochila`.
- Mochila equipada no slot Backpack pode ser aberta e receber itens.

Persistencia:

- A tabela `inventory_items.parent_container_id` ja existia e continua salvando/carregando conteudo de containers.
- Conteudo dentro de container equipado permanece associado pelo id do `InventoryItem`.

Limites atuais:

- Ainda sem drag and drop.
- Ainda sem mochila dentro de mochila.
- Ainda sem organizacao automatica complexa.
- Depot com containers avancados fica para etapa futura; a prioridade desta etapa foi inventario do personagem.
- Loot de hunt ainda cai na raiz do inventario; auto envio para Loot Bag fica para etapa futura.

Validacao:

- `npm.cmd run build` passou.

## Etapa 13 - Supplies Reais nas Hunts

Status: implementada em versao inicial.

Tipos e dados:

- Criados tipos `SupplyType`, `HuntSupplyRequirement`, `HuntSupplyUsage`, `SupplyCheckEntry` e `SupplyCheckResult`.
- `HuntArea` agora pode declarar `supplies`.
- `HuntSimulationResult` agora inclui `suppliesUsed`, `supplyValueUsed` e `missingSupplies`.
- Hunts receberam supplies recomendados por hora, com regras por vocacao quando necessario.
- Market NPC ja vende potions, mana potions, runes, arrows, bags e quiver usados pelas hunts.

Engine criado em `src/game-engine/supplies/`:

- `getAvailableSupplies.ts`.
- `findSupplyItemsInInventory.ts`.
- `checkHuntSupplies.ts`.
- `calculateSupplyUsage.ts`.
- `consumeSupplies.ts`.

Regras implementadas:

- Check de supplies considera itens na raiz do inventario e dentro de containers, pois ambos vivem em `character.inventory`.
- Start de hunt bloqueia quando faltam supplies obrigatorios.
- Supplies opcionais geram warning, mas nao bloqueiam.
- Ranger exige ammo nas hunts que declaram arrows para Ranger.
- Arcanist/Warden exigem mana/runes nas hunts onde isso foi configurado.
- Ao finalizar hunt, supplies sao consumidos de verdade do inventario/containers.
- Stacks chegam a zero e sao removidas.
- `netProfit` agora usa gold bruto + loot value - `supplyValueUsed`.
- `supplyCostPerHour` permanece como estimativa antiga/visual nos dados, mas o resultado real usa supplies consumidos.

UI:

- Hunt Assignment mostra painel `Supplies`.
- O painel mostra necessario, disponivel, faltante e warnings.
- Botao Iniciar Hunt fica bloqueado quando falta supply obrigatorio.
- Hunt Result mostra supplies usados e valor consumido.
- Action Analyzer de hunt mostra supply estimado e lista parcial de consumo, sem consumir por segundo.

Persistencia:

- Consumo altera `character.inventory`, que ja e salvo no SQLite.
- Itens dentro de containers mantem `parentContainerId`; se forem consumidos, a quantidade persistida cai ou a stack some.

Limites atuais:

- Ainda sem consumo por segundo persistente.
- Ainda sem combate visual completo.
- Ainda sem auto-compra de supplies.
- Ainda sem presets avancados de supply.
- Auto envio de loot para Loot Bag fica para etapa futura.

Validacao:

- `npm.cmd run build` passou.

## Etapa 13.5 - QA de supplies, save/load, economia e Action Analyzer

Status: concluida como QA de estabilizacao, sem sistema grande novo.

Checklist validado:

- Supplies reais: start de hunt usa `checkHuntSupplies`, bloqueia supply obrigatorio ausente e apenas avisa sobre supply opcional.
- Supplies reais: finish de hunt usa `calculateSupplyUsage` + `consumeSupplies`, remove stacks do inventario e recalcula capacity.
- Containers: supplies dentro de containers continuam em `character.inventory` com `parentContainerId`, podem ser consumidos e persistem no SQLite.
- Save/load: SQLite grava e carrega guilda, personagens, skills, inventario, depot pessoal, Guild Depot, equipamentos, logs e `currentAction`.
- `guild.gold`: Market, quests, bosses, hunts e Exercise Training usam a moeda universal da guilda; `character.gold` permanece legado.
- Market NPC: compra usa `guild.gold`, venda de inventario/depot/Guild Depot soma em `guild.gold`, itens travados e containers com conteudo ficam protegidos.
- Action Analyzer: hunt mostra progresso, XP, gold, loot estimado, supplies estimados/lista parcial e balance sem aplicar recompensa automaticamente.
- Tauri dev: `npm.cmd run tauri dev` abriu janela `Guild Hunt Idle` e Vite escutou em `127.0.0.1:1420`.

Validacao:

- `npm.cmd run build` passou.
- `npm.cmd run tauri dev` foi iniciado com sucesso; o processo foi encerrado depois da confirmacao para nao deixar servidor aberto.

## Etapa 14 - Sistema de Morte, Templo, Bless e Recuperacao

Status: implementada em versao inicial.

Arquivos criados:

- `src/data/blessings.ts`.
- `src/data/temples.ts`.
- `src/game-engine/death/calculateDeathPenalty.ts`.
- `src/game-engine/death/applyDeathPenalty.ts`.
- `src/game-engine/death/createDeathState.ts`.
- `src/game-engine/death/reviveCharacter.ts`.
- `src/game-engine/death/getActiveBlessing.ts`.
- `src/game-engine/death/calculateBlessProtection.ts`.
- `src/components/death/DeathPanel.tsx`.
- `src/components/death/TempleServicesPanel.tsx`.

Regras implementadas:

- `CharacterStatus` usa o estado existente `dead`.
- `Character` agora pode salvar `deathState`, `blessings` e `deathCount`.
- Morte de hunt, boss e quest usa o engine de morte.
- Ao morrer, a acao atual e limpa, o personagem fica `dead`, vai para o templo da cidade fonte e recebe `deathState`.
- XP perdida respeita o minimo do level atual para evitar delevel nesta etapa.
- Gold perdido sai de `guild.gold`, com penalidade leve por risco.
- Bless ativa reduz penalidade por `protectionPercent` e e consumida quando `consumedOnDeath` estiver ativo.
- Recovery usa horario real em `recoveryEndsAt`; se passar enquanto o app estiver fechado, o personagem continua morto, mas o botao de reviver fica liberado ao abrir.
- Reviver no templo volta o personagem para `idle`, limpa `deathState`, mantem a cidade do templo e registra log.

UI:

- Aba Personagem mostra Death Report quando o personagem esta morto.
- Aba Personagem mostra Temple Services para comprar uma bless individual.
- Aba Acao mostra Death Report em vez de Current Action normal quando o personagem esta morto.
- Action Analyzer mostra causa, local, tempo desde a morte, recovery, penalidade, bless e templo.
- Current Action/controles nao oferecem finalizar hunt/boss/treino para personagem morto.

Persistencia:

- SQLite adiciona colunas seguras em `characters`: `death_state_json`, `blessings_json` e `death_count`.
- Saves antigos carregam com `deathState` indefinido, `blessings: []` e `deathCount: 0`.

Limites atuais:

- Sem PvP, online, corpse, drop de backpack ou perda de equipamento.
- Sem stack avancada de blessings.
- Sem templo com mapa visual.
- Sem recovery automatica sem clique.
- Sem perda pesada de skill.
- Perda de item real ficou para etapa futura; `itemsLostValue` permanece preparado.

Como testar:

- Hunt: iniciar uma hunt de risco alto/deadly e finalizar ate ocorrer morte; confirmar `dead`, Death Report, templo, XP/gold reduzidos e bloqueio de novas acoes.
- Bless: comprar uma bless em Temple Services, morrer, confirmar reducao da penalidade, consumo da bless e logs.
- Boss: iniciar boss com chance de morte, finalizar e confirmar que apenas personagens mortos ficam `dead`.
- Save/load: deixar personagem morto, salvar/recarregar ou reiniciar app, confirmar que continua morto e que o recovery restante respeita o horario real.

Validacao:

- `npm.cmd run build` passou.

## Etapa 15 - Bestiary e Charms

Status: implementada em versao inicial.

Arquivos criados:

- `src/data/bestiaryThresholds.ts`.
- `src/data/charms.ts`.
- `src/game-engine/bestiary/`.
- `src/components/bestiary/`.

Arquivos principais alterados:

- `src/shared/types.ts`.
- `src/game-engine/hunt/simulateHunt.ts`.
- `src/game-services/huntService.ts`.
- `src/app/App.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/components/hunt/HuntActionPanel.tsx`.
- `src/components/hunt/HuntResultPanel.tsx`.
- `src/components/action/ActionAnalyzer.tsx`.
- `src/database/migrations.ts`.
- `src/database/saveMapper.ts`.
- `src/database/saveGameRepository.ts`.

Regras implementadas:

- Bestiary pertence a `guild.bestiary`, ou seja, e guild-wide.
- Finalizar hunt registra `monsterKills` por criatura no resultado.
- Kills de hunt atualizam o Bestiary da guilda ao finalizar a simulacao.
- Stages iniciais: `unknown`, `started`, `revealed` e `completed`.
- Thresholds por level do monstro definem reveal, complete e charm points.
- Reward de charm points precisa ser coletado manualmente com Claim Reward.
- Charms iniciais: Scholar, Greed, Scavenger, Fortify e Conservation.
- Unlock de charm consome charm points.
- Assign exige charm desbloqueado e criatura completed.
- Uma criatura tem no maximo 1 charm ativo; um charm fica em no maximo 1 criatura.
- Remove charm nao tem custo nesta etapa.

Bonus em hunts:

- Scholar aplica bonus proporcional de XP.
- Greed aplica bonus proporcional de gold.
- Scavenger aplica bonus proporcional no valor total de loot.
- Fortify reduz chance de morte antes do roll da hunt.
- Conservation reduz supplies estimados/consumidos de forma leve.
- Hunts com multiplas criaturas aplicam bonus proporcional ao numero de monstros da hunt.

UI:

- Nova aba principal `Bestiary`.
- Bestiary mostra criaturas vistas, completas, charm points e charms desbloqueados.
- Cards mostram stage, kills, barra de progresso, reward e charm ativo.
- Detalhes mostram informacoes basicas da criatura quando revelada/completa.
- Charm Panel permite unlock, assign e remove no monstro selecionado.
- Hunt Assignment mostra charms ativos na hunt.
- Hunt Result mostra kills por criatura, Bestiary Updates e Charm Bonuses.
- Action Analyzer mostra estimativa de kills por criatura e quantidade de charms ativos durante hunt.

Persistencia:

- SQLite salva `guild.bestiary` em `guilds.bestiary_json`.
- Saves antigos carregam bestiary vazio.
- Kills, charm points, charms desbloqueados e assignments persistem no save local.

Limites atuais:

- Sem online, ranking, bestiary por personagem ou sprites.
- Sem charms avancados de dano elemental, leech, dodge ou parry.
- Sem charm em boss.
- Sem custo/cooldown para trocar charm.
- Sem auto-claim reward.
- Bonus de loot altera valor total do resultado, nao rerolla loot table detalhada.

Como testar:

- Finalizar hunt em Sewers Below Thaeron e conferir kills em Sewer Rat/Cave Spider na aba Bestiary.
- Repetir ate completar ou reduzir thresholds temporariamente para teste.
- Usar Claim Reward em criatura completed.
- Desbloquear Scholar com charm points.
- Atribuir Scholar a uma criatura completed.
- Fazer hunt com essa criatura e conferir bonus de XP em Hunt Result.
- Salvar/recarregar e confirmar kills, charm points, unlocks e assignments.

Validacao:

- `npm.cmd run build` passou.

## Etapa 15.5 - QA, Correcoes e Balanceamento do Bestiary/Charms

Status: concluida como QA de estabilizacao, sem sistema grande novo.

Bugs/riscos encontrados e corrigidos:

- Finalizar Hunt podia ser chamado sem `currentAction` ativa e simular a hunt selecionada novamente; agora exige `status === hunting` e `currentAction.targetId`.
- `GuildBestiaryState` podia carregar progress duplicado, charms duplicados ou assignments invalidos de saves antigos; agora `normalizeBestiaryState` deduplica e sanitiza.
- `charmPoints` agora e normalizado para nunca ficar negativo/NaN.
- `unlockedCharmIds` agora remove duplicados.
- `activeCharms` agora ignora charm invalido, monster invalido, charm nao desbloqueado e monstro nao completed.
- Save do guild bestiary agora grava a versao normalizada do estado.
- Unlock sem pontos agora retorna mensagem clara: `Not enough charm points.`
- UI do CharmPanel nao habilita unlock para charm ja desbloqueado.
- Bestiary card mostra reward coletado como `Reward claimed`.
- Fallback visual para criatura salva sem catalogo usa `Unknown Creature` sem quebrar a UI.

Balanceamento revisado:

- Thresholds mantidos conforme Etapa 15: starter 25/100/5, mid 50/250/10, advanced 100/500/20 e high 250/1000/35.
- Bonus de charms mantido em 5%, aplicado proporcionalmente por criatura na hunt.
- Sem aumento de reward ou reducao agressiva de thresholds nesta QA.

Validacoes feitas:

- Bestiary vazio em save antigo carrega como `progress: []`, `charmPoints: 0`, `unlockedCharmIds: []`, `activeCharms: []`.
- Claim antes de completed continua bloqueado.
- Claim duplicado continua bloqueado por `charmPointsClaimed`.
- Assign exige charm desbloqueado e criatura completed.
- Um charm/monstro duplicado em save antigo e limpo pela normalizacao.
- Hunt Result continua mostrando monsterKills, Bestiary Updates e Charm Bonuses.
- Hunt Assignment e Action Analyzer continuam mostrando charms ativos sem salvar progresso parcial.

Limites mantidos:

- Sem auto-claim.
- Sem custo/cooldown de troca de charm.
- Sem charm em boss.
- Sem sprites/imagens.
- Sem reroll detalhado de loot por charm; Scavenger ainda atua no valor total.

Validacao:

- `npm.cmd run build` passou.
- `npm.cmd run tauri dev` abriu o app; processo encerrado apos confirmacao.

## Etapa 16 - Forge, Upgrades, Tiers e Imbuements de Equipamentos

Status: implementada em versao inicial.

Arquivos criados:

- `src/data/imbuements.ts`.
- `src/game-engine/forge/`.
- `src/components/forge/ForgePanel.tsx`.

Arquivos principais alterados:

- `src/shared/types.ts`.
- `src/app/App.tsx`.
- `src/components/layout/MainPanel.tsx`.
- `src/components/inventory/InventoryItemRow.tsx`.
- `src/components/equipment/EquipmentSlotBox.tsx`.
- `src/game-engine/equipment/calculateEquipmentBonuses.ts`.
- `src/game-services/huntService.ts`.
- `src/game-engine/market/`.
- `src/database/migrations.ts`.
- `src/database/saveMapper.ts`.
- `src/database/saveGameRepository.ts`.

Regras implementadas:

- Nova aba principal `Forge`.
- Equipamentos podem receber `upgradeLevel` de +0 ate +5.
- Equipamentos podem receber `tier` de 0 ate 3.
- Imbuements iniciais: Minor Strike, Minor Focus, Minor Precision, Minor Fortification, Minor Wisdom, Minor Capacity e Minor Efficiency.
- Upgrade, tier e imbuement gastam `guild.gold` e materiais.
- Materiais sao consumidos na ordem: inventario do personagem, depot do personagem e Guild Depot.
- Materiais locked e quest items nao sao consumidos automaticamente.
- Itens stackable e nao equipamentos nao aparecem na Forge.
- Itens equipados tambem podem ser melhorados.
- Imbuements usam `remainingHunts` e perdem 1 carga ao finalizar hunt.
- Imbuements expirados sao removidos automaticamente ao chegar em 0 hunts.

Bonus:

- Upgrade/tier aumentam atributos derivados do equipamento.
- Backpack ganha capacity extra por upgrade.
- Minor Wisdom aumenta XP final de hunts.
- Minor Efficiency reduz supplies consumidos.
- Minor Strike/Focus/Precision/Fortification entram no poder/defesa via atributos do personagem.
- Character Details reflete os atributos recalculados apos upgrade/tier/imbuement.

Market:

- Item com imbuement ativo nao pode ser vendido.
- Item com upgrade/tier pode ser vendido e recebe valor de venda aumentado de forma leve.
- Itens equipados continuam fora do Market.

Persistencia:

- SQLite adiciona `upgrade_level`, `tier` e `imbuements_json` em `inventory_items`.
- Saves antigos carregam itens com `upgradeLevel: 0`, `tier: 0` e `imbuements: []`.
- Itens equipados tambem salvam upgrades, tiers e imbuements.
- `remainingHunts` persiste no save.

Limites atuais:

- Sem chance de falha.
- Sem item quebrar, downgrade ou reroll de affix.
- Sem crafting completo.
- Sem custo/cooldown para remover imbuement manualmente.
- Consumo de materiais dentro de containers segue a estrutura atual de `character.inventory`, mas nao ha UI especifica de selecao de origem.
- Imbuements reduzem cargas apenas em hunts.

Como testar:

- Abrir Forge, selecionar uma arma e tentar Upgrade +1.
- Garantir gold/materiais e confirmar que o nome vira `+1` e atributos mudam.
- Selecionar item elegivel e aumentar Tier 1.
- Aplicar Minor Strike em weapon e confirmar `remainingHunts = 20`.
- Finalizar uma hunt e confirmar que o imbuement perde 1 carga.
- Salvar/recarregar e confirmar upgrade/tier/imbuement persistidos.
- Tentar vender item com imbuement ativo e confirmar bloqueio.

Validacao:

- `npm.cmd run build` passou.
