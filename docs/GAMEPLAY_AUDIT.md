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
