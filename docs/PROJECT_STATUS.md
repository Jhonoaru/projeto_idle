# Guild Hunt Idle - Project Status

Atualizado em: 2026-06-29

## Stack usada

- Tauri v2 para empacotamento desktop.
- React com TypeScript para a interface.
- Vite para desenvolvimento e build do frontend.
- Estado local/em memoria dentro do React.
- Dados iniciais em arquivos TypeScript dentro de `src/data`.
- Ainda sem banco de dados ativo.
- Ainda sem SQLite/Prisma ativo. A pasta `prisma/` existe apenas como reserva com `.gitkeep`.

Comandos principais:

- `npm run tauri dev` para rodar o app desktop em desenvolvimento.
- `npm run tauri:dev` tambem roda o app desktop em desenvolvimento.
- `npm run dev` roda apenas o frontend Vite.
- `npm run build` valida TypeScript e gera o build web.
- Em PowerShell com execucao de scripts bloqueada, usar `npm.cmd run build` ou `npm.cmd run tauri dev`.

## Sistemas ja implementados

- Layout base de client MMORPG escuro, compacto e denso.
- Top bar com dados da guilda.
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
- Market NPC local para venda de itens.
- Venda de itens do inventario do personagem, depot pessoal do personagem e Guild Depot.
- Gold separado entre personagem e guilda.
- Itens travaveis contra venda acidental.
- Aba Inventario & Equipamento unificada.
- Aba Depot dividida entre Depot do Personagem e Guild Depot.
- Log de atividade no painel direito.

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
- `src/components/inventory/`: inventario, depot, linhas de item e capacity.
- `src/components/equipment/`: painel de equipamentos e slots.
- `src/components/training/`: treino, opcoes e resultado.
- `src/components/quest/`: quests, acessos e resultado.
- `src/components/log/`: log de atividade.
- `src/components/ui/`: componentes pequenos reutilizaveis.
- `src/data/`: dados mockados e catalogos do jogo, como personagens, guilda, monstros, itens, hunts, quests, acessos e treinos.
- `src/game-engine/`: regras puras de jogo para hunts, loot, inventario, equipamentos, atributos, quests e progressao.
- `src/game-services/`: servicos que coordenam regras do engine para iniciar/finalizar acoes.
- `src/shared/`: tipos, constantes e utilitarios compartilhados.
- `src/security/`: notas futuras de seguranca local.
- `src-tauri/`: projeto Tauri/Rust e configuracoes desktop.
- `docs/`: documentacao do projeto e planos tecnicos.
- `prisma/`: placeholder futuro; nao ha schema nem dependencia Prisma ativa.

## Proximos sistemas planejados

- Balanceamento fino de bosses, party power, risco, recompensas e cooldowns.
- Persistencia local de save offline.
- Camada de save/load isolada dos componentes React.
- SQLite + Prisma apenas quando o loop de gameplay estiver pronto e quando for solicitado.
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

- Ainda sem banco de dados.
- Ainda sem SQLite/Prisma.
- Ainda sem persistencia ao fechar o app.
- Estado de bosses e cooldowns permanece em memoria/local state.

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

- Tipos de market, filtro, origem, destino e resultado de venda.
- `InventoryItem.locked` para proteger item contra venda.
- `Character.characterDepot` em memoria para depot pessoal simples.
- Engine puro de market com calculo de valor, filtragem, lista vendavel e venda.
- Service de market para vender do inventario, depot pessoal e Guild Depot.
- Aba Market na ordem principal sugerida.
- Filtros por busca, categoria e raridade.
- Selecao de item unico, multiplos itens e venda por categoria.
- Destino de gold configuravel para venda do inventario do personagem.
- Venda do depot pessoal envia gold ao personagem.
- Venda do Guild Depot envia gold a guilda.
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
- Ainda sem banco de dados, SQLite ou Prisma.
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
- Ainda sem banco de dados, SQLite ou Prisma.

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
