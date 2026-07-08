# Gameplay Audit - Etapa 29

Data: 2026-07-08

## Objetivo

Revisar o ciclo inicial de gameplay de Guild Hunt Idle para garantir que o jogador consiga entender e executar o loop basico:

1. iniciar uma hunt curta;
2. receber XP, gold coins e loot;
3. vender loot no Market/Quick Sell;
4. usar `guild.gold` para comprar supplies;
5. liberar progresso sem depender de sistemas premium, online ou pagamento.

## Problemas encontrados

- O estado inicial usava Arkon no level 32, ja em hunt, com quests/acessos completos. Isso mascarava o inicio real do jogo e abria a tela em uma acao avancada.
- A duracao padrao de hunt era 30 minutos e as opcoes comecavam em 15 minutos, deixando o primeiro ciclo lento demais para validar o loop.
- A primeira hunt misturava Sewer Rat e Cave Spider, mas a XP base dos monstros iniciais era baixa para runs curtas.
- Hunts eram bloqueadas por acesso, mas nao havia bloqueio consistente por `minLevel` na UI e na engine.
- O resultado de hunt somava `totalLootValue` no `netProfit` aplicado em `guild.gold`, mesmo o loot tambem indo para o inventario. Isso permitia ganhar o valor do loot duas vezes: uma ao terminar a hunt e outra ao vender no Market.
- A tela principal nao orientava o jogador sobre o proximo passo pratico do loop.

## Correcoes aplicadas

- Arkon foi convertido em starter real: level 1, idle, sem acessos/quests completas, skills baixas e pequeno kit inicial de `minor-health-potion`.
- A duracao padrao de hunt passou para 1 minuto.
- A UI de hunt agora oferece 1, 5, 15, 30 e 60 minutos.
- `Sewers Below Thaeron` virou hunt inicial curta e segura apenas com Sewer Rat, sem supply obrigatoria.
- `Cave Spider Cellar` foi adicionada como segunda hunt starter, minLevel 3, usando Cave Spider e supply opcional.
- Sewer Rat teve XP, gold minimo/maximo e chance de Rat Tail ajustados para tornar o primeiro ciclo visivel.
- Cave Spider teve XP ajustada para sustentar a transicao para o segundo passo.
- `startHunt` agora bloqueia hunt se `character.level < hunt.minLevel`.
- `HuntCard` e `HuntActionPanel` mostram bloqueio por level e desabilitam start quando o personagem nao cumpre `minLevel`.
- `netProfit` agora representa apenas o delta real de `guild.gold`: gold coins da hunt menos supplies e penalidade de morte.
- O valor do loot permanece separado e o loot fica no inventario para venda posterior.
- A tela principal ganhou `Next Objective`, apontando para starter hunt, venda de loot, spider cellar, quest de acesso ou proxima hunt desbloqueada.

## Balanceamento inicial

- `Sewers Below Thaeron`: level 1, risk safe, 1 minuto viavel, sem supplies obrigatorias, foco em Rat Tail e gold coins.
- `Cave Spider Cellar`: level 3, risk low, pequena ponte entre ratos e Trollwood.
- `Trollwood Camp` permanece minLevel 8, funcionando como primeiro degrau apos o starter.
- O loop de gold agora depende de liquid gold imediato mais venda real do loot no Market/Quick Sell.

## Validacao

- `npm.cmd run build` passou.
- `git diff --check` deve ser executado antes do commit final.
- QA manual interativo no Tauri/SQLite nao foi executado nesta etapa.

## Limitacoes restantes

- O balanceamento ainda e inicial e precisa de QA manual com save novo.
- Nao foram adicionados testes automatizados de simulacao de hunts.
- Saves existentes continuam carregando seus personagens atuais; o novo starter afeta apenas estado inicial/mock/reset.
- Nao ha anti-cheat de alteracao de data, online, premium, pagamento ou economia multiplayer.

## Proximo passo sugerido

- Etapa 29.5 - QA da reformulacao de gameplay inicial.

## QA - Etapa 29.5

Data: 2026-07-08

### Testes feitos

- `git pull` confirmou repositório atualizado.
- `git status` iniciou limpo.
- `npm.cmd run build` passou antes e depois das correcoes.
- `npm.cmd run dev` foi iniciado em Vite e respondeu HTTP 200 em `http://127.0.0.1:1420`.
- Smoke no navegador com mock local validou Home, Arkon level 1, `guild.gold` 420g, objetivo inicial e botao Explorar.
- Explore/Hunts mostrou `Sewers Below Thaeron` desbloqueada, 1 minuto, sem supplies obrigatorias e risco `Very Safe`.
- Explore/Hunts mostrou `Cave Spider Cellar` bloqueada por level 3 e `Trollwood Camp` bloqueada por level 8.
- Hunt inicial foi iniciada e criou `currentAction` de 1 minuto.
- Action Analyzer mostrou progresso, XP, gold, loot estimado, supplies, bestiary e status da hunt.
- Coleta da hunt aplicou recompensa uma vez: +4g liquido, 42 XP e Rat Tail x2 no inventario.
- Quick Sell selecionou apenas Rat Tail, mantendo Minor Health Potion fora da venda padrao.
- Venda Rapida vendeu Rat Tail x2 por 4g e aumentou `guild.gold` de 424g para 428g.
- Market Buy comprou Minor Health Potion x10 por 300g, reduzindo `guild.gold` para 128g e empilhando potion para x13.
- Leitura de quests confirmou `First Contract` level 1, 5 minutos, reward pequeno e unlock de acesso.
- Leitura de bosses confirmou boss inicial travado por level 15 e acesso, sem aparecer como obrigacao inicial.
- Leitura de training confirmou que treino gera skill progress, nao loot/gold indevido, e respeita status bloqueados.
- Validacao de dados confirmou itemIds de loot/shop/daily/boss existentes e referencias de monstros das hunts validas.

### Bugs encontrados e corrigidos

- Rat Tail ainda era chanceado na primeira hunt. Isso permitia uma primeira run sem loot vendavel, quebrando a demonstracao do loop hunt > loot > sell. Corrigido para drop garantido em Sewer Rat.
- `simulateHunt` ainda calculava/logava `netProfit` incluindo `totalLootValue`, embora `finishHunt` ja aplicasse apenas gold liquido. Corrigido para logs e resultado base separarem gold coins de loot vendavel.
- `applyCharmBonusesToResult` recalculava `netProfit` como gold + loot quando havia charm. Corrigido para manter `netProfit` como gold liquido.
- `ActionAnalyzer` ainda exibia `Balance` e `Profit/h` somando loot estimado, ensinando a economia antiga. Corrigido para `Liquid gold`, `Liquid/h` e `Loot est.` separado.
- `ActionAnalyzer` estimava kills como 5 por minuto, divergindo da simulacao real starter. Corrigido para estimar kills a partir de XP esperado e XP medio dos monstros.

### Estado final do early game

- O jogador com Arkon level 1 ve objetivo claro para rodar `Sewers Below Thaeron`.
- A primeira hunt e curta, segura, sem custo obrigatorio e gera XP/gold/loot perceptiveis.
- O loot comum entra no inventario e precisa ser vendido para virar gold extra.
- Quick Sell vende apenas loot seguro por padrao.
- Market permite comprar supply basica com `guild.gold`.
- A segunda hunt (`Cave Spider Cellar`) aparece como proximo degrau travado por level, com motivo claro.

### Limitacoes da QA

- Smoke interativo foi feito no Vite com mock local; `npm run tauri:dev` e SQLite real nao foram clicados manualmente.
- Save/load real em SQLite foi validado por leitura do fluxo existente e build, nao por reabrir o app desktop.
- Offline catch-up e auto-repeat foram revisados por leitura/build, nao por teste temporal completo.
- QA numerica de longo prazo ate level 5/10 ainda deve ser repetida com save novo no app Tauri.

### Proximo passo sugerido

- Etapa 30 - Rework de Progressao de Regiao / Area / Unlocks.
