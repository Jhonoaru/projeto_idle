# Guild Hunt Idle - Project Status

Atualizado em: 2026-07-13

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

- A versao 1.0 deve ser offline.
- O futuro online deve ser separado do save offline.
- O save offline nao deve ser competitivo.
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
- Separacao futura entre modo offline e qualquer modo online.

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
