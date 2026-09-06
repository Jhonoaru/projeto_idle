# Guild Hunt Idle - Project Status

Atualizado em: 2026-09-06

## Etapa 172 - Feedback visual de dano, cura e numeros flutuantes

- Hunts e Bosses agora compartilham uma camada de feedback flutuante com dano causado, critico, dano recebido e cura em cadencia visual deterministica.
- Os eventos usam o `elapsedMs` real da cena, atributos dos personagens, alvo visual e roles da party. A sequencia escolhe o ator de forma estavel, aplica pequena variacao reproduzivel e nunca usa `Math.random`.
- Dano aparece sobre a criatura/boss; dano recebido aparece sobre o membro ativo; cura aparece no alvo aliado quando existe Warden, healer ou support. Criticos recebem escala e selo `CRIT` proprios.
- Eventos possuem IDs estaveis por sequencia, valores inteiros positivos, coordenadas limitadas entre 4% e 96% da arena e desaparecem completamente quando a acao esta concluida.
- A camada e `aria-hidden`, nao captura cliques e fica separada dos efeitos de vocacao, movimentos, telegraphs, hotbar e analyzer.
- `prefers-reduced-motion` e a preferencia `Reduce motion` removem a subida/fade. Os numeros permanecem estaticos e legiveis ate a proxima sequencia visual.
- O fixture `qa/combat-feedback.html` alterna entre as cenas de producao Hunt/Boss, Active/Completed e movimento reduzido. Passou em 14/14 checks de determinismo, limites, identidades, rotacao, cura, dano recebido, critico e supressao final.
- QA visual no browser confirmou Hunt com dano/dano recebido e Boss com dano/cura, valores dentro das duas arenas, assets carregados e zero overflow horizontal. Completed removeu todos os eventos do DOM.
- Em viewport de 430x900, a largura util foi 415 px, a arena ficou com 405 px, os numeros permaneceram dentro do palco e o overflow horizontal foi zero. A viewport temporaria foi restaurada ao final.
- Estes numeros sao estimativas visuais derivadas dos atributos e da cadencia da cena; nao representam um novo ledger por golpe e nao alteram os calculos agregados de dano, risco, resultado, loot ou progressao.
- `npm run build` passou com 497 modulos. `npm run tauri:build` tambem passou e gerou os pacotes MSI e NSIS; permanece apenas o aviso conhecido de chunk JavaScript acima de 500 kB.
- Proximo passo proposto: Etapa 172.5 - QA integrado do feedback flutuante no Tauri/SQLite, cobrindo as cinco vocacoes, party, estados concluido/ativo e movimento reduzido.

## Etapa 171.5 - QA integrado da Boss Scene animada no Tauri/SQLite

- Um runner opt-in executou no aplicativo Tauri com SQL Plugin, migrations e repository reais, usando somente `stage1715_20260905.db`.
- A rodada passou em 69/69 checks: 58 de persistencia/engine e 11 executados no DOM/CSS do WebView Tauri.
- Guardian, Ranger, Arcanist, Warden e Monk receberam a mesma raid ativa de cinco minutos contra Ember Matriarch. Status, target, duracao, IDs, roles e snapshot completo da party foram confirmados apos save/reload e diretamente nas cinco colunas `current_action_json` do SQLite.
- As cinco acoes foram convertidas para concluido, com `readyToResolve` e `offlineCompletedAt` persistidos e conferidos no JSON bruto. Ao final, o runner restaurou a party inteira para a raid ativa.
- Um relogio controlado confirmou o primeiro telegraph com alvo. O WebView renderizou a Boss Scene de producao, expôs fase no boss e nos cinco membros e mostrou pelo menos tres fases simultaneas na party.
- O PNG da Ember Matriarch, o JPG da arena e os cinco PNGs de heroi carregaram dentro do Tauri. Todos os sete assets tambem foram decodificados pelo WebView.
- Probes temporais ocultos, derivados do estado recarregado, confirmaram telegraph com dodge/hold, boss `defeated` e os cinco membros `victorious` sem depender da velocidade da maquina.
- CSS computado confirmou animacao no boss e na party. Ao aplicar `data-client-motion=reduced`, boss e cinco membros retornaram `animation: none` e `transform: none`; a preferencia foi restaurada em seguida.
- Guilda, depot, logs, atributos, equipamentos, inventarios e boss cooldowns permaneceram iguais ao baseline. O banco isolado terminou com 94.208 bytes e duas evidencias em `stage1715_report` (`database:58`, `runtime:11`).
- O save principal nao foi aberto: permaneceu com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A` antes e depois da rodada.
- O QA do WebView foi automatizado pela pagina Tauri. Nao houve clique manual nos controles nativos Active/Completed ou Reduce motion nesta rodada.
- `npm run build` passou com 495 modulos. `npm run tauri:build` tambem passou e gerou os pacotes MSI e NSIS; permanece apenas o aviso conhecido de chunk JavaScript acima de 500 kB.
- Proximo passo proposto: Etapa 172 - feedback visual de dano, cura e numeros flutuantes nas cenas de Hunt e Boss, mantendo simulacao offline deterministica.

## Etapa 171 - Movimento visual da party e dos Bosses

- A Boss Scene agora deriva movimento visual do relogio local ja usado pelo encontro, sem alterar poder, ameaca, risco, dano, cooldowns ou recompensas.
- O boss possui fases deterministicas de guarda, preparacao, investida, impacto, recuperacao e derrota. Telegraph em andamento assume preparacao/investida, cooldown assume recuperacao e raid concluida sempre assume derrota.
- Os cinco membros da party possuem ciclos defasados de avanco, ataque, recuo, recuperacao e guarda. O alvo de um telegraph esquiva quando esta mobile/selective e sustenta a posicao quando esta anchored.
- A party concluida entra em estado victorious. As fases sao expostas por `data-motion-phase`, preservando leitura, depuracao e futuro QA integrado.
- O movimento atua somente em wrappers internos dos sprites. Cards, nomes, barras, analyzer, timeline e controles mantem dimensoes estaveis durante o combate.
- Vetores por posicao conduzem os cinco membros na direcao do boss; no mobile, a escala e a formacao existentes continuam aplicadas no container sem disputar `transform` com a animacao interna.
- `prefers-reduced-motion` e a preferencia `Reduce motion` removem animacao, transicao e deslocamento do boss e de toda a party, mantendo as fases e o conteudo visiveis.
- O fixture `qa/boss-motion.html` renderizou a cena de producao e passou em 22/22 checks de fases, precedencias, defasagem e vetores.
- QA no browser confirmou cinco fases simultaneas da party, boss em telegraph/preparacao, sete imagens locais decodificadas e zero overflow horizontal no desktop. Em uma viewport real de 430 px, cena e arena ficaram em coluna unica, boss/party permaneceram dentro do palco e o overflow horizontal continuou zero.
- O controle Reduce motion foi acionado no fixture: CSS computado retornou `animation: none` e `transform: none` para boss e os cinco membros.
- O primeiro build detectou o nome incorreto `ready` para o estado neutro da habilidade; o helper foi alinhado ao contrato real `idle`. O primeiro fixture tambem revelou um instante de teste que nao atravessava a fronteira de fase; o instante foi corrigido antes da rodada aprovada.
- `npm run build` passou com 495 modulos. `npm run tauri:build` tambem passou e gerou os pacotes MSI e NSIS; permanece apenas o aviso conhecido de chunk JavaScript acima de 500 kB.
- O QA desta etapa foi visual no browser e em memoria; nao executou persistencia SQLite nem a janela nativa Tauri. Proximo passo proposto: Etapa 171.5 - QA integrado da Boss Scene animada no Tauri/SQLite, cobrindo party ativa/concluida, telegraph, assets e movimento reduzido.

## Etapa 170.5 - QA integrado da Hunt Scene animada no Tauri/SQLite

- Um runner opt-in foi executado no aplicativo Tauri com SQL Plugin, migrations e repository reais, usando somente `stage1705_20260904.db`.
- A rodada passou em 59/59 checks: 50 de persistencia/engine e 9 executados no DOM/CSS do WebView Tauri.
- Guardian, Ranger, Arcanist, Warden e Monk receberam hunts ativas de cinco minutos; status, target, duracao e `current_action_json` foram confirmados depois do save/reload e diretamente nas cinco linhas SQLite.
- As cinco acoes foram convertidas para concluido, com `readyToResolve` e `offlineCompletedAt` persistidos e conferidos no JSON bruto. Ao final, o runner restaurou as cinco hunts ativas para a matriz visual.
- Os cinco PNGs de heroi e o Sewer Rat carregaram dentro do Tauri. O WebView renderizou os cinco atores, tres criaturas com fases e uma probe concluida com heroi `resolved` e criaturas `defeated`.
- CSS computado confirmou movimento no ator ativo. Ao aplicar `data-client-motion=reduced`, heroi e criaturas retornaram `animation: none` e `transform: none`; a preferencia foi restaurada em seguida.
- Guilda, depot, logs, atributos, equipamentos e inventarios permaneceram iguais ao baseline. O banco isolado terminou com 94.208 bytes e duas evidencias em `stage1705_report` (`database:50`, `runtime:9`).
- O save principal nao foi aberto: permaneceu com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A` antes e depois da rodada.
- O QA do WebView foi automatizado pela pagina Tauri. Nao houve clique manual nos controles nativos de vocacao, Active/Completed ou Reduce motion nesta rodada.
- O primeiro build detectou que a selecao visual poderia ser `undefined`; a pagina de QA passou a usar o personagem de exibicao ja normalizado antes das validacoes finais.
- `npm run build` passou com 494 modulos. `npm run tauri:build` tambem passou e gerou os pacotes MSI e NSIS; permanece apenas o aviso conhecido de chunk JavaScript acima de 500 kB.
- Proximo passo proposto: Etapa 171 - movimento visual da party e dos Bosses na Boss Scene, reutilizando fases deterministicas e acessibilidade de movimento.

## Etapa 170 - Movimento visual de criaturas e herois em Hunts

- A Hunt Scene agora deriva fases visuais deterministicas do mesmo `attackProgress` local: heroi em windup, strike, recoil, recovery ou resolved; criaturas em spawn, advance, strike, stagger, guard ou defeated.
- As seis posicoes da arena possuem vetores convergentes. O heroi avanca na direcao do alvo ativo enquanto a criatura se aproxima do centro, sem mover os cards ou alterar suas dimensoes.
- Spawn tem materializacao progressiva; impacto produz stagger curto; contra-ataque, recuperacao, guarda e derrota possuem leitura distinta. As animacoes atuam nas camadas de sprite e continuam combinando com os efeitos de combate por vocacao.
- Estados de spawn e derrota tem precedencia, impedindo que uma criatura inexistente ou vencida receba animacao de ataque. Alvos passivos permanecem em guarda ou reagem quando danificados.
- `prefers-reduced-motion` e a preferencia `Reduce motion` do cliente removem animacoes, transicoes e deslocamentos, mantendo todos os estados e informacoes visiveis.
- A responsividade da Hunt Scene foi desacoplada do wrapper principal: o componente isolado tambem passa para uma coluna. Em ate 720px, os vetores ficam compactos e o contador de spawn entra no fluxo, sem sobrepor criaturas.
- O novo fixture `qa/hunt-motion.html` usa a cena de producao em memoria e passou em 19/19 checks de limites de fase, precedencia de estados e vetores das seis posicoes.
- QA visual passou em 1280x720 e 430x900. Fases alternaram com o relogio, o modo reduzido retornou `animation: none`/`transform: none`, nao houve overflow, sobreposicao do contador ou erros no console.
- Nenhuma regra de combate, dano, loot, XP, gold, supplies, duracao, coleta, persistencia ou schema SQLite foi alterada. Movimento e somente feedback da simulacao idle existente.
- Limitacoes: os PNGs continuam estaticos, sem spritesheet, caminhada por tiles ou pathfinding; a cena usa transicoes curtas em ciclos de 500 ms e nao representa posicao autoritativa de gameplay.
- `npm run build` e `npm run tauri:build` passaram com 494 modulos e geraram MSI/NSIS. Permanece apenas o aviso conhecido do chunk JavaScript acima de 500 kB. Nao houve QA nativo interativo nesta etapa.
- Proximo passo proposto: Etapa 170.5 - QA integrado da Hunt Scene animada no Tauri, cobrindo vocacoes, estados concluido/ativo e preferencia de movimento reduzido.

## Etapa 169 - Otimizacao das artes de Collections

- As 18 artes locais de avatar, outfit e montaria mantiveram nomes, IDs, formato PNG e caminhos de arquivo, sem migration ou alteracao de save. As URLs receberam `?v=169` para invalidar imagens antigas no cache do WebView.
- Um pipeline PowerShell reproduzivel foi adicionado com dry-run padrao e escrita explicita por `-Apply`. Cada saida e criada em diretorio temporario, decodificada e validada antes de substituir o arquivo do projeto.
- Avatares passaram para 384x384; outfits para 512x512; montarias preservam a proporcao com aresta maxima de 640px. Os 12 arquivos que exigem alpha mantiveram cantos transparentes.
- O conjunto caiu de 31.627.090 bytes (30,16 MiB) para 5.927.062 bytes (5,65 MiB), reducao de 81,3% sem mudar o contrato de runtime.
- `CollectionPreview` agora usa carregamento nativo lazy por padrao. Showcase selecionado, destaque grande da Store e avatar equipado usam carregamento eager com prioridade alta.
- Prompts e procedencia continuam nos documentos originais; `OPTIMIZATION.md` registra dimensoes, totais e uso do pipeline.
- As galerias web passaram em 38/38 checks para avatares e 59/59 para outfits e montarias. As 18 resolucoes novas foram confirmadas no DOM; desktop e 430x900 ficaram sem overflow, com transparencia e leitura visual preservadas.
- A regressao Tauri/SQLite passou em 77/77 checks no banco isolado `stage1685_20260903.db`. O save principal permaneceu com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`.
- `npm run build` e `npm run tauri:build` passaram com 493 modulos. O MSI caiu de 54,86 para 30,58 MiB e o NSIS de 53,87 para 29,39 MiB; permanece apenas o aviso conhecido do chunk JavaScript acima de 500 kB.
- Limites: o pipeline usa `System.Drawing` e portanto e voltado ao ambiente Windows do projeto; preserva PNG, sem conversao WebP ou quantizacao de cor. Os PNGs em resolucao de geracao permanecem recuperaveis pelo historico Git, mas nao sao duplicados no pacote atual.
- Proximo passo proposto: Etapa 170 - ampliar o movimento visual das criaturas e herois nas cenas de Hunt, preservando o combate idle deterministico.

## Etapa 168.5 - QA integrado das montarias no Tauri/SQLite

- Runner opt-in executado dentro do aplicativo Tauri com o SQL Plugin e migrations reais, usando exclusivamente `stage1685_20260903.db`.
- A rodada valida passou em 77/77 checks: seis PNGs servidos dentro do WebView, 18 claims em ordem, seis unlocks de montaria e seis ciclos de equip/save/reload.
- Cada `activeMountId` foi confirmado pela API carregada e diretamente em `characters.cosmetics_json`; os seis unlocks e 18 claims tambem foram conferidos em `collections_json` e `operation_outcomes_json` brutos.
- Avatar Broodmother Crest e outfit Webkeeper Regalia permaneceram equipados durante a troca das seis montarias. Gold, Renown, depot e atributos permaneceram inalterados.
- Um `activeMountId` invalido injetado diretamente no SQLite normalizou para `mount-none` sem descartar outfit ou avatar; o estado valido foi restaurado e salvo ao fim.
- A tela dedicada renderizou no Tauri os seis previews e as seis composicoes reais de `CharacterSprite`, todas com heroi, outfit e montaria legiveis em 1280x800.
- A primeira execucao parou em 70 checks porque o harness fotografava o depot antes da normalizacao inicial do repository. O baseline foi movido para depois do primeiro reload e a rodada seguinte passou em 77/77; nenhuma correcao de produto foi necessaria.
- A tentativa de redimensionar o aplicativo foi interrompida por entrada do usuario, portanto esta rodada nao afirma QA nativo em 960x640. A responsividade web em 960x640 e 430x900 permanece como evidencia da Etapa 168.
- O banco isolado ficou com 98.304 bytes. O save principal permaneceu com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`, sem ser aberto pelo runner.
- `npm run build` passou antes e depois do QA com 493 modulos. Permanece apenas o aviso conhecido de chunk JavaScript acima de 500 kB.
- O runner e a pagina visual foram mantidos em `src/qa/` e `qa/`; nao entram no entrypoint de producao. O empacotamento release nao precisa ser repetido nesta etapa de QA.
- Proximo passo proposto: Etapa 169 - pipeline de otimizacao das artes de Collections e carregamento progressivo, reduzindo o peso local antes do proximo lote visual.

## Etapa 168 - Visuais originais das seis montarias de Boss

- Etapa implementada com Sewer Stalker, War Boar, Grave Charger, Ironhorn Ram, Cinder Drake e Victory Lion.
- Seis PNGs originais transparentes foram gerados individualmente pela ferramenta integrada e adicionados a `public/assets/collections/generated/`. Os arquivos RGBA somam 13.724.299 bytes; os prompts exatos e a procedencia estao em `public/assets/collections/MOUNTS.md`.
- Os IDs e requisitos Flawless existentes foram preservados. `collectionSprites` agora resolve as montarias em Trophy Hall, Collections e Store sem migration ou alteracao do save.
- `CharacterSprite` compoe a montaria ao fundo, heroi/outfit acima e avatar como emblema separado. A composicao e compartilhada por Details, roster, equipes, rankings, painel direito, hunts e bosses que usam esse renderer.
- A falha de uma imagem de montaria remove somente essa camada; outfit, sprite-base ou iniciais continuam visiveis. Montarias antigas sem arte exclusiva preservam o comportamento anterior.
- Showcase e previews compactos usam dimensoes estaveis, `object-fit: contain` e fundo transparente, sem mudar atributos, economia, loot, cooldowns ou regras de Boss.
- O fixture `qa/collection-art.html?category=mount` passou em 59/59 checks: seis mappings, ordem de claim, bloqueios, equip, duplicatas, imutabilidade, power/gold, coexistencia dos tres slots e round-trip JSON. As regressoes passaram em 59/59 para outfits e 38/38 para avatares.
- QA por cliques no navegador confirmou claim das seis montarias, catalogo, showcase, equip da Sewer Stalker com Webkeeper Regalia, ator de hunt, painel direito e fallback mantendo o heroi/outfit. Capturas em 960x640 e 430x900 foram inspecionadas; a galeria usa uma coluna no breakpoint estreito para preservar as silhuetas largas.
- `npm run build` e `npm run tauri:build` passaram com 493 modulos; MSI e NSIS foram gerados. Permanece apenas o aviso conhecido de bundle JavaScript acima de 500 kB.
- Limites: sprites estaticos sem animacao ou variacao por heroi; a composicao sobrepoe o heroi ao assento e nao redesenha pernas/pose especificas para cada montaria. Nao houve novo QA Tauri/SQLite; o fixture usa memoria e o round-trip JSON nao substitui SQLite.
- Proximo passo proposto: Etapa 168.5 - QA visual integrado das montarias no app e persistencia Tauri/SQLite.

## Etapa 167 - Visuais originais dos seis outfits de Boss

- Etapa concluida com Webkeeper Regalia, Warcamp Raider, Crypt Sentinel, Gatekeeper Plate, Ashen Warden e Arena Champion.
- Seis PNGs originais com transparencia real, gerados individualmente pela ferramenta integrada, foram adicionados em `public/assets/collections/generated/`. Os originais RGBA de 1254x1254 somam 6.028.363 bytes. Prompts e limites em `public/assets/collections/OUTFITS.md`.
- O mapa `collectionSprites` preserva os IDs existentes de Mastered. Trophy Hall, Collections e Store passam a mostrar a roupa pelo componente de preview compartilhado; itens bloqueados de Collections continuam ocultos e nao podem ser equipados.
- `CharacterSprite` resolve o `activeOutfitId` equipado. Isso conecta a aparencia a Details, painel direito, roster, equipes, rankings, hunts e bosses que ja usam o renderer compartilhado, sem alterar suas regras.
- A sequencia de fallback e roupa, sprite original do heroi e iniciais. Falhas sao registradas por URL, evitando reaplicar uma imagem conhecida como indisponivel durante o mesmo mount do componente.
- O showcase de outfit apresenta uma figura maior e transparente; frames e tamanhos dos atores permanecem fixos. Avatar equipado continua como emblema independente e a selecao de montaria e preservada.
- Sem mudancas em atributos, armas equipadas, vocacoes, economia, requisitos, claims, IDs, migrations, mapper ou formato de save. Os IDs ja persistidos resolvem os novos arquivos locais.
- O fixture `qa/collection-art.html?category=outfit` passou em 59/59 checks: mapeamento, bloqueios, claim/equip, duplicatas, imutabilidade, atributos/gold, preservacao de avatar/montaria e resolucao apos round-trip JSON com normalizacao. A variante de avatares da Etapa 166 foi reexecutada e passou em 38/38.
- QA por cliques no navegador: resgate manual de Webkeeper, roupa bloqueada, equipamento e troca dos seis outfits, ator real de hunt no fixture, painel direito, coexistencia com Broodmother Crest, seis fallbacks textuais, fallback de personagem para Arkon e reset restaurando a aparencia inicial.
- Screenshots inspecionados em 1280x720, Hall em 960x640 e Collections em 430x900. Hall manteve clientWidth/scrollWidth de 928px; a pagina estreita manteve largura de conteudo 415px dentro de 430px.
- `npm run build` e `npm run tauri:build` passaram com 493 modulos; MSI e NSIS foram gerados. Continua o aviso existente de bundle JavaScript acima de 500 kB.
- Limites: uma figura estatica por outfit, sem variacoes por heroi, animacoes, camadas de roupa ou desenho dinamico de armas. Montarias ainda usam previews anteriores. Nao houve novo QA interativo Tauri/SQLite ou instalacao dos bundles; round-trip JSON nao e teste de SQLite. O fixture usa memoria e nao abre o save do jogador.
- Proximo passo proposto: Etapa 168 - visuais originais das seis montarias de Boss, seguida pelo QA visual integrado da Etapa 168.5.

## Etapa 166 - Arte original dos avatares do Boss Trophy Hall

- Etapa concluida com seis emblemas originais locais: Broodmother Crest, Camp Breaker Mark, Crypt Warden Seal, Khazgrim Gate Sigil, Ember Crown e Arena Laurel.
- As imagens foram geradas individualmente pela ferramenta de imagem integrada, sem imagens externas de referencia, e copiadas para `public/assets/collections/generated/`. Prompts e procedencia estao no README da pasta.
- `collectionSprites.ts` associa os IDs existentes aos PNGs. `CollectionPreview` compartilha renderizacao e fallback textual entre Trophy Hall, Collections e Store, sem alterar as definicoes de recompensa.
- Collections preserva o ponto de interrogacao para itens bloqueados e mostra a arte no catalogo, showcase e loadout apos o desbloqueio. O showcase de avatar possui preview maior; frames permanecem com dimensoes fixas.
- Details e painel direito mostram o avatar equipado como pequeno emblema junto ao retrato. O sprite do heroi continua intacto; esta etapa nao substitui outfits, montarias ou animacoes de combate.
- Nao houve alteracao de IDs, claims, requisitos, atributos, economia, tipos de save, mapper ou schema SQLite. Saves existentes passam a resolver a arte por ID, sem migration.
- Fixture opt-in `qa/collection-art.html` passou em 38/38 checks: seis mapeamentos, IDs invalidos, equipamento bloqueado, claim/equip existentes, entradas imutaveis e atributos/gold preservados.
- QA por cliques no navegador verificou as seis alas e imagens, resgate manual de Arena Laurel, estado Archived desabilitado, bloqueio de Broodmother nao obtida, equipamento do avatar, showcase, loadout e emblema junto ao retrato.
- As seis imagens carregaram no catalogo apos os claims; reset do fixture removeu os desbloqueios e restaurou o avatar inicial. Simular arquivos ausentes mostrou as seis siglas, e restaurar os arquivos fez a arte reaparecer.
- Screenshots inspecionados em 1280x720, Hall em 960x640 e Collections em 430x900. O Hall em 960px manteve clientWidth/scrollWidth de 928px; Collections estreita nao apresentou overflow horizontal.
- `npm run build` e `npm run tauri:build` passaram, com 493 modulos e instaladores MSI/NSIS gerados. Permanece o aviso existente de chunk JavaScript acima de 500 kB.
- Limites: PNGs originais opacos, sem animacao, somando aproximadamente 11,9 MB; otimizacao de entrega ainda nao feita. Nao foi executado novo QA interativo no Tauri/SQLite nem instalacao dos bundles nesta etapa. A pagina de QA usa somente memoria e nao abre o banco do jogador.
- Proximo passo proposto: Etapa 167 - visuais originais dos seis outfits de Boss, mantendo a separacao entre avatar, outfit e montaria.

## Etapa 165.5 - QA do Boss Trophy Hall no Tauri/SQLite

- QA automatizado aprovado em duas rodadas de 114/114 checks, executadas no aplicativo Tauri com SQL Plugin e migrations reais.
- A rodada usou exclusivamente `stage1655_20260902.db`, separado do save do jogador. A inicializacao normal do jogo nao foi alterada no resultado final.
- Saves sem `bossTrophyHall` recebem estado vazio e disponibilizam claims retroativos conforme o Raid Codex, sem resgate automatico.
- As 18 recompensas dos seis Bosses foram resgatadas em ordem, com Save/Reload entre cada resgate. Ledger, historico, datas, unlocks e flags de Collections persistiram.
- Duplicatas foram rejeitadas antes e depois do reload; saltar tiers, resgatar sem progresso ou usar ID invalido tambem foi rejeitado.
- Cosmeticos ja desbloqueados arquivam o trofeu sem duplicar unlock, log de Collections ou badge. Marcar Collections como vista permanece salvo e um claim repetido nao recria o badge.
- Avatar, outfit e montaria equipados persistiram; gold, Renown, depot, Raid Codex e Execution Mastery permaneceram inalterados pelos claims.
- Uma nova operacao de Boss preservou os 18 trofeus depois do Save/Reload. Ledger e historico corrompidos inseridos diretamente no SQLite foram normalizados no load.
- A consulta SQL crua confirmou 18 claims e 18 flags antes da limpeza; a tabela `stage1655_report` preserva os resultados das duas rodadas.
- O runner foi mantido como QA opt-in em `src/qa/bossTrophyHallSqliteQa.ts`, com pagina e configuracao Tauri dedicadas em `qa/`. Ele nao e importado pela aplicacao normal nem pelo bundle de producao.
- Nenhuma correcao de gameplay foi necessaria. Houve apenas um ajuste de tipagem no runner durante sua preparacao.
- Na rodada automatizada, build inicial e final passaram com `npm run build`; o bundle manteve os mesmos 491 modulos e hashes de assets da Etapa 165. O aviso existente de chunk acima de 500 kB permanece. O empacotamento release nao foi repetido nesta etapa de QA.
- O save principal manteve 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`, sem modificacao.
- QA interativo concluido em uma rodada posterior no aplicativo normal, conectado temporariamente apenas ao banco de QA. Selecionar Khazgrim no Hall atualizou tambem o Raid Codex e o briefing.
- Os tres claims de Khazgrim passaram pela UI em ordem; um clique duplo no primeiro gerou apenas um claim. Os botoes anteriores ficaram `Archived`, a ala chegou a 3/3 e o badge Collections exibiu 3.
- Dois ciclos de Save/Reload pelos botoes normais preservaram os resgates e depois a limpeza do badge. Os tres cosmeticos apareceram desbloqueados em suas categorias no Collections Hall.
- O Hall foi inspecionado em area cliente 1280x800 e no minimo Tauri de 960x640, com rolagem e controles acessiveis. Collections tambem foi inspecionada em janela maximizada.
- O QA encontrou e corrigiu um problema de CSS: o preview textual `Ironhorn` transbordava e encostava no nome do item. Previews do catalogo, showcase e Trophy Hall agora limitam e quebram texto longo dentro das dimensoes fixas; a correcao foi conferida no catalogo e showcase reais.
- A consulta SQLite final confirmou exatamente tres claims/historicos de Khazgrim, tres unlocks, nenhuma flag pendente, seis logs esperados e gold mantido em 420. O save principal continuou com o mesmo SHA-256.
- A conexao normal foi restaurada integralmente ao encerrar o QA. A suite automatizada 114/114 e da rodada anterior; nesta continuacao passaram os testes interativos e `npm run build` com 491 modulos e a correcao CSS, sem repetir o empacotamento release.
- Etapa 165.5 concluida. Proxima etapa proposta: 166 - arte original dos trofeus e avatares do Boss Trophy Hall, substituindo os previews textuais. Procedimento de QA em `qa/README.md`.

## Etapa 165 - Boss Trophy Hall e recompensas offline por dominio

- O painel de Bosses agora possui um Boss Trophy Hall guild-wide com seis alas, uma para cada contrato do Raid Codex.
- Cada Boss oferece tres recompensas cosmeticas permanentes: avatar em `Conquered`, outfit em `Mastered` e montaria em `Flawless`, totalizando 18 novos itens em Collections.
- As recompensas sao somente visuais e nao alteram atributos, dano, defesa, chance de sucesso, economia, loot ou cooldown.
- O claim e manual para atender saves antigos: uma guilda que ja cumpriu o requisito encontra a recompensa disponivel sem precisar repetir a progressao.
- As tiers precisam ser arquivadas em ordem; Mastered exige o trofeu Conquered e Flawless exige o trofeu Mastered do mesmo Boss.
- Claims vivem em `bossTrophyHall` dentro do `operation_outcomes_json` existente, com ledger de IDs e historico limitado, sem migration SQLite nova.
- O claim usa Collections real, atualiza `newlyUnlockedCollectionItemIds`, aciona o badge e continua seguro se o cosmetico ja estiver desbloqueado por um save anterior.
- IDs invalidos, historico corrompido, datas invalidas e claims duplicados sao normalizados ou rejeitados sem quebrar o save.
- A interface mostra total arquivado, recompensas disponiveis, progresso 0/3 por Boss e estados `Locked`, `Claim reward`, `Claim prior tier` e `Archived`.
- Selecionar uma ala tambem seleciona o Boss no restante do painel, mantendo Raid Codex, briefing, arena, party e loot sincronizados.
- O Activity Log recebe uma entrada unica de trofeu e a mensagem de Collections somente quando ocorre um unlock novo.
- Um harness temporario passou em 35/35 checks deterministas cobrindo as 18 definicoes, seis Bosses, tres tiers, ordem, elegibilidade, duplicacao, cosmetico preexistente, badge, corrupcao, economia preservada e round-trip JSON.
- QA visual passou em 1440x1000 e 430x900. As seis alas e tres recompensas ficaram legiveis; no mobile o Hall manteve `scrollWidth` igual ao `clientWidth` em 343px.
- Os unicos erros do QA web foram a indisponibilidade esperada do Tauri SQL Plugin no navegador, com fallback mock normal.
- Os 18 novos cosmeticos usam previews de texto/badge do sistema Collections; esta etapa nao criou sprites exclusivos para eles. O Hall usa os sprites existentes dos Bosses.
- Claims foram validados pelo harness, mas nao por cliques no aplicativo Tauri. Save/Reload e badges contra SQLite real ainda precisam do QA da Etapa 165.5.
- `npm run build` e `npm run tauri:build` passaram; o empacotamento gerou MSI e NSIS/EXE. Permanece o aviso existente de bundle JavaScript acima de 500 kB.
- Proximo passo sugerido: Etapa 165.5 - QA do Boss Trophy Hall no Tauri/SQLite, incluindo claims retroativos, Save/Reload e badge real de Collections.

## Etapa 164.5 - QA do Raid Codex no Tauri/SQLite

- Um runner temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido integralmente depois da rodada valida.
- A rodada passou em 46/46 checks usando Sewer Broodmother e Khazgrim Gatekeeper, com tres operacoes legadas, uma nova vitoria, uma nova derrota e tres ciclos reais de Save/Reload.
- Um `operation_outcomes_json` sem `bossRaidCodex` reconstruiu dois recordes independentes a partir do historico legado e persistiu o novo campo no Save seguinte.
- Tentativas, vitorias, taxas de entrada, gold recebido e perdido, Renown, XP, loot agregado, ultima tentativa e ultima vitoria permaneceram corretos depois dos reloads.
- O mesmo ID de operacao foi rejeitado antes do primeiro Save e novamente depois do Reload, sem inflar historico, totais globais ou recorde vitalicio.
- Uma derrota posterior incrementou apenas as tentativas, acumulou a perda e atualizou a ultima tentativa sem substituir a data da ultima vitoria.
- A leitura SQL crua confirmou dois recordes, cinco IDs unicos no historico e o total final de Sewer Broodmother em quatro tentativas e duas vitorias.
- O dossier derivado confirmou cinco tentativas globais, tres vitorias, 60% de win rate e Sewer Broodmother em 4/2, 50%, saldo liquido de +415g e quatro operacoes recentes.
- Regional Orders e Execution Mastery permaneceram identicos; Region Mastery continuou normalizado e recebeu somente a progressao esperada das operacoes reais de Boss.
- A janela Tauri em 1280x800 exibiu o Raid Codex real, sprites, seis Bosses, estados vazios, loot e historico sem sobreposicao ou overflow visivel.
- O clique adicional para trocar o dossier nao foi repetido nesta rodada porque outra entrada de usuario assumiu o foco da janela; a selecao cruzada ja havia passado no QA visual da Etapa 164.
- Nenhuma correcao de produto foi necessaria.
- O banco original foi restaurado com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`, novamente sem WAL ou SHM.
- Proximo passo sugerido: Etapa 165 - Boss Trophy Hall e recompensas offline por dominio do Raid Codex.

## Etapa 164 - Raid Codex e recordes de dominio por Boss

- O painel de Bosses agora possui um Raid Codex offline com um indice persistente dos seis contratos e dossier selecionavel por Boss.
- Cada recorde vitalicio guarda tentativas, vitorias, taxas de entrada, gold recebido e perdido, Renown, XP, loot agregado, ultima tentativa e ultima vitoria.
- A atualizacao acontece somente depois que `recordBossOperationOutcome` aceita uma operacao inedita; o mesmo ID nao incrementa historico nem Codex duas vezes.
- O estado vive em `bossRaidCodex` dentro do `operation_outcomes_json` existente, sem coluna ou migration SQLite nova.
- Saves antigos recebem um Codex reconstruido automaticamente a partir do `bossHistory` ainda retido e continuam carregando com defaults seguros.
- O indice classifica cada Boss como `Untested`, `Encountered`, `Conquered`, `Mastered` ou `Flawless`.
- `Mastered` exige no proprio Boss melhor chain x4 e 12 Perfect; `Flawless` exige x6 e 30 Perfect, combinando o Codex com a Execution Mastery da Etapa 163.
- O resumo global mostra Bosses conquistados e dominados, tentativas rastreadas e win rate; selecionar uma entrada tambem troca o briefing, arena, party e loot table do contrato.
- O dossier mostra oito metricas, saldo liquido considerando entrada e perdas, loot acumulado com icones, cinco operacoes recentes e vitorias qualificadas de execucao.
- Estados vazios permanecem completos: todos os Bosses aparecem antes da primeira tentativa, sem inventar loot ou historico.
- A normalizacao remove Bosses, datas, itens e numeros invalidos, limita loot agregado e preserva os sistemas irmaos de region mastery, regional orders e execution mastery.
- Um harness temporario passou em 33/33 checks deterministas para legado, corrupcao, dois Bosses, vitoria, derrota, duplicacao, economia, loot, datas, round-trip JSON e os cinco estados do Codex.
- QA visual passou em 1440x1000 e 430x900. O indice, dossier e selecao cruzada ficaram legiveis, sem sobreposicao ou overflow horizontal; no mobile, `scrollWidth` permaneceu igual ao `clientWidth` em 343px.
- Os unicos erros de console foram a indisponibilidade esperada do Tauri SQL Plugin no navegador web, com fallback local normal.
- Limitacao de compatibilidade: em saves anteriores, os totais por Boss importam somente as ate 20 operacoes preservadas no historico; novas operacoes passam a ser acumuladas de forma vitalicia.
- Proximo passo sugerido: Etapa 164.5 - QA do Raid Codex no Tauri/SQLite, incluindo import legado, Save/Reload e idempotencia real.

## Etapa 163.5 - QA da Execution Mastery no Tauri/SQLite

- Um runner temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido integralmente depois da rodada valida.
- A rodada passou em 36/36 checks usando Arkon e Sewer Broodmother, com tres operacoes vitoriosas qualificadas e Save/Reload entre os marcos.
- Um save no formato anterior recebeu o estado default de Execution Mastery e o persistiu corretamente em `operation_outcomes_json`.
- `Precision Mark`, `Raid Tactician` e `Flawless Vanguard` foram conquistados nos limites x2/2, x4/12 e x6/30, respectivamente.
- `Perfect Execution Sigil`, outfit `Raid Tactician` e montaria `Battle Ram` persistiram em `collections_json` e mantiveram os tres flags de badge apos reload.
- O ledger preservou exatamente tres IDs unicos. Reprocessar a primeira operacao depois de reload nao alterou totais, claims ou Collections.
- Uma derrota com oito Perfect e uma vitoria sem Perfect nao concederam progresso.
- O estado final preservou 30 reacoes Perfect, melhor chain x6, tres vitorias qualificadas e todos os tres milestones.
- Gold, Renown, Guild Depot e todos os campos anteriores de operation outcomes permaneceram identicos durante a progressao.
- A leitura crua do SQLite confirmou os totais em `operation_outcomes_json` e os unlocks/badges em `collections_json`.
- O catch-up de uma raid expirada gerou um report e marcou a acao como `readyToResolve`, sem conceder ou alterar Execution Mastery.
- Save/Reload preservou o mesmo fingerprint de mastery depois do catch-up; uma segunda aplicacao gerou zero reports e nenhuma mudanca.
- Nenhuma correcao de produto foi necessaria.
- O banco original foi restaurado com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`; SHM e WAL tambem voltaram aos hashes originais.
- Proximo passo sugerido: Etapa 164 - Raid Codex e recordes de dominio por Boss, totalmente offline.

## Etapa 163 - Dominio de execucao e recompensas cosmeticas em Bosses

- Vitorias contra Bosses com ao menos uma reacao manual `Perfect` agora alimentam uma progressao guild-wide de Execution Mastery, sem alterar chance de sucesso, dano, loot, gold ou XP do combate.
- O estado persistido mantem registros por Boss com vitorias qualificadas, Perfect totais, divisao entre Dodge/Hold, melhor sequencia e data da ultima operacao.
- Um ledger limitado aos 40 IDs mais recentes impede que a mesma operacao seja contabilizada duas vezes; derrotas e vitorias sem `Perfect` nao geram progresso.
- A performance da raid recebe os graus `Unranked`, `Precise`, `Disciplined` ou `Masterful`, derivados da quantidade de reacoes Perfect e da melhor sequencia.
- Tres marcos guild-wide foram adicionados: `Precision Mark` em x2/2 Perfect desbloqueia o avatar `Perfect Execution Sigil`; `Raid Tactician` em x4/12 desbloqueia o outfit homonimo; `Flawless Vanguard` em x6/30 desbloqueia a montaria `Battle Ram`.
- Os cosmeticos usam o fluxo real de Collections, incluindo `newlyUnlockedCollectionItemIds`, badge e protecao contra unlock duplicado.
- O painel de Bosses mostra os tres marcos, recompensa, progresso combinado e estado conquistado; a Boss Scene mostra grau, Perfect totais e melhor sequencia no Raid Analyzer.
- Sequencias a partir de x2 recebem feedback visual compacto por tier durante o telegraph, e o relatorio final resume grau, melhor chain, Perfect totais, Dodges e Holds.
- A persistencia reutiliza `operation_outcomes_json`; saves antigos e valores invalidos recebem estado seguro sem nova migration SQLite.
- O Activity Log registra um resumo unico da execucao por operacao e mensagens apenas quando um marco ou cosmetico e desbloqueado.
- Um harness temporario passou em 25/25 checks deterministas, cobrindo normalizacao, saves antigos, calculo de grau, acumulacao, milestones, Collections, badge, economia preservada, derrota, ausencia de Perfect e idempotencia.
- QA visual passou em 1440x1000 e 430x900 para o painel de recompensas, sem overflow ou sobreposicao; uma raid real confirmou a nova metrica no Raid Analyzer.
- Nao foi possivel produzir manualmente uma chain x2 pela janela acelerada do navegador web nesta rodada; o calculo e o feedback foram validados por testes deterministas e leitura, mas o clique interativo completo fica para o Tauri.
- Proximo passo sugerido: Etapa 163.5 - QA da Execution Mastery no Tauri/SQLite, incluindo Save/Reload, catch-up e desbloqueios reais.

## Etapa 162.5 - QA das sequencias Perfect no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido integralmente depois da rodada valida.
- A rodada passou em 52/52 checks com tres personagens reais da guilda contra Khazgrim Gatekeeper, 26 casts elegiveis e nove comandos manuais temporizados.
- O SQLite preservou oito reacoes `Perfect`, uma `Early`, todos os percentuais de timing e os snapshots identicos nos tres participantes apos Save/Reload.
- A sequencia principal avancou por `x1`, `x2`, `x3`, `x4` e `x5`; o contador continuou alem do teto, enquanto o bonus de esquiva permaneceu limitado a +6 pontos adicionais.
- Um cast removido como interrompido nao avancou nem quebrou a sequencia. A reacao `Early` zerou a cadeia e o `Perfect` seguinte reiniciou em `x1`.
- Um segundo personagem manteve sua propria sequencia `x2`, confirmando isolamento por alvo mesmo com o historico sincronizado na party.
- `Manual Dodge` resultou em +16 no primeiro Perfect, +20 em `x3`, +22 em `x5`, +16 depois do reset e +18 na cadeia independente `x2`, sempre com chance final limitada a 85%.
- Dois comandos `Perfect Hold Ground` suprimiram suas tentativas de esquiva, chegaram ao teto existente de +1% e registraram +0,20% de contribuicao efetiva da cadeia, com melhor Hold em `x4`.
- Os rolls deterministicos permaneceram identicos aos da simulacao sem comandos manuais; somente os bonus e as decisoes de Dodge/Hold mudaram.
- O banco armazenou o historico somente em `current_action_json`; campos derivados como `perfectChainStreak` nao foram persistidos.
- O primeiro catch-up gerou tres reports, marcou os participantes como `readyToResolve` e preservou exatamente reacoes, chains, dodges e trade-offs.
- Uma segunda aplicacao do catch-up gerou zero reports e nenhuma mudanca, confirmando idempotencia.
- Save/Reload depois do catch-up preservou `readyToResolve`, o historico manual e o mesmo fingerprint de economia, sem coletar gold, inventario ou Guild Depot.
- Nenhuma correcao de produto foi necessaria.
- O banco original foi restaurado com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`, sem WAL ou SHM.
- Proximo passo sugerido: Etapa 163 - feedback visual e recompensas cosmeticas por dominio de execucao em Bosses.

## Etapa 162 - Sequencias Perfect e bonus de execucao em Bosses

- Reacoes manuais `Perfect` consecutivas agora formam uma sequencia independente por personagem e podem misturar `Manual Dodge` com `Hold Ground`.
- O primeiro `Perfect` mantem os efeitos da Etapa 161; o segundo, terceiro e quarto adicionam respectivamente +2, +4 e +6 pontos percentuais de esquiva ou +0,05%, +0,10% e +0,15% de posicionamento.
- O bonus fica limitado no quarto acerto, enquanto o contador pode continuar exibindo a sequencia real; a chance final de esquiva continua limitada a 85% e o posicionamento manual a +1% por personagem.
- `Early`, `Late`, `Standard` e um telegraph direcionado sem comando quebram a sequencia daquele personagem. Casts interrompidos sao excluidos antes do calculo e nao avancam nem quebram a cadeia.
- A ordem usa o inicio deterministico dos casts, e nao o relogio do save. Sequencias sao derivadas das reacoes ja persistidas em `current_action_json`, sem nova coluna, migracao ou campo redundante.
- Saves antigos continuam seguros: reacoes sem qualidade normalizam como `Standard`, nao recebem bonus e reiniciam a sequencia.
- A Boss Scene mostra a proxima cadeia e o bonus total antes do clique, trava o resultado depois da reacao e atualiza o Raid Analyzer e a chance do cast imediatamente.
- Combat Skill Report e log final da simulacao exibem a melhor cadeia, bonus de esquiva aplicado e contribuicao efetiva de posicionamento depois dos limites.
- Checks deterministas temporarios passaram em 28/28, cobrindo progressao, teto, reset, telegraph ignorado, alvos independentes, ordem de casts, interrupcao excluida, legado, esquiva e Hold Ground.
- QA interativo passou em 1280x800 e 390x844: a segunda reacao mostrou `Perfect chain x2`, +18% de esquiva e +0,45% de Hold; apos o clique, a chance subiu de 37,9% para 55,9% e o estado ficou travado sem overflow horizontal.
- Os harnesses temporarios foram removidos antes da validacao final.
- Limitacao atual: sequencias exigem reacoes manuais durante a raid; telegraphs processados com o jogo fechado continuam usando somente as politicas automaticas.
- Proximo passo sugerido: Etapa 162.5 - QA das sequencias Perfect no Tauri/SQLite e catch-up offline.

## Etapa 161.5 - QA do timing manual no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido integralmente depois da rodada valida.
- A rodada passou em 35/35 checks com tres personagens reais da guilda contra Khazgrim Gatekeeper e encontrou 22 casts direcionados nao interrompidos elegiveis.
- Foram gravadas reacoes reais em 20% (`Early`), 50% (`Perfect`) e 90% (`Late`), alem de um comando legado sem janela que normalizou como `Standard`.
- `Early Manual Dodge` concedeu +8 pontos percentuais, `Perfect Manual Dodge` concedeu +16 e o comando `Standard` preservou +12, todos mantendo os mesmos rolls deterministicos da simulacao sem reacao.
- `Late Hold Ground` suprimiu a tentativa de esquiva, concedeu +0,15% ao personagem e produziu +0,05% de positioning power medio na party de tres membros.
- Um comando em 110% da janela e um segundo comando para um cast ja respondido foram rejeitados sem mutacao.
- Os quatro comandos foram sincronizados nos snapshots dos tres participantes sem modificar os objetos originais nem os loadouts permanentes em `Automatic`.
- Save/Reload preservou cast, alvo, tipo, horario, qualidade e percentual exatos das reacoes.
- O SQLite armazenou `quality` e `timingPercent` somente em `current_action_json`; dodges, trade-offs, rolls e demais resultados derivados nao foram persistidos.
- O fingerprint derivado permaneceu identico antes e depois do reload e catch-up, com 943 casts de personagem e 267.245 de dano total na simulacao usada pelo QA.
- O catch-up offline gerou tres reports, marcou os participantes como `readyToResolve` e preservou timing e qualidade sem coletar recompensas.
- Uma segunda aplicacao do catch-up gerou zero reports e nenhuma mudanca, confirmando idempotencia.
- Gold, Renown, inventarios e Guild Depot permaneceram inalterados durante toda a rodada.
- O banco original foi restaurado com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`, sem WAL ou SHM.
- Nenhuma correcao de produto foi necessaria; o bootstrap normal voltou a compilar com 477 modulos depois da remocao do harness.
- Proximo passo sugerido: Etapa 162 - sequencias de reacao e bonus de execucao perfeita em Bosses.

## Etapa 161 - Timing e qualidade das reacoes manuais de Boss

- Reacoes manuais agora recebem uma qualidade deterministica pela posicao real do clique dentro do telegraph: `Early` antes de 35%, `Perfect` entre 35% e 75% e `Late` depois de 75%.
- `Manual Dodge` recebe +8 pontos percentuais em `Early`, +16 em `Perfect` e +6 em `Late`; a chance final continua limitada a 85% e usa exatamente o mesmo roll deterministico do cast.
- `Hold Ground` concede +0,20% em `Early`, +0,40% em `Perfect` e +0,15% em `Late`, com soma arredondada e limite preservado de +1% por personagem.
- Comandos da Etapa 160 sem informacao temporal continuam como `Standard`, preservando +12 pontos de esquiva ou +0,25% de posicionamento em saves antigos.
- A engine calcula o percentual usando `action.startedAt`, inicio/fim relativo do cast e `recordedAt`; pedidos temporizados antes ou depois da janela ativa sao rejeitados sem mutacao.
- Qualidade e percentual do clique entram no snapshot sincronizado da raid, portanto Save/Reload e catch-up podem reproduzir o mesmo resultado sem persistir rolls ou efeitos derivados.
- A Boss Scene ganhou uma regua compacta com zonas Early/Perfect/Late, marcador movel, bonus dinamicos nos dois comandos e estado travado com a qualidade obtida.
- Raid Analyzer, Activity Log, Combat Skill Report e log final da simulacao exibem qualidade, bonus e distribuicao dos comandos manuais.
- A atualizacao visual ocorre a cada 200 ms, com transicao suave do marcador, sem elevar desnecessariamente a recomputacao da cena para 10 quadros por segundo.
- Checks deterministas temporarios passaram em 26/26, cobrindo fronteiras de 35%/75%, relogios invalidos, bonus, roll preservado, sincronizacao, duplicacao, rejeicao fora da janela, compatibilidade Standard e cap de Hold Ground.
- O primeiro harness comparou resultados pela ordem de insercao, mas a engine ordena casts por tempo e ID; a assercao foi corrigida e a rodada completa passou sem alteracao de produto.
- QA visual passou em 1280x800 e 390x844, incluindo clique `Perfect`, chance atualizada de 37,9% para 53,9%, estado travado, botoes sem corte e ausencia de overflow ou erros no console.
- Os harnesses temporarios de engine e interface foram removidos; `npm run build` passou com o bootstrap real e 477 modulos.
- Limitacao atual: reacoes continuam opcionais e exigem que o jogador esteja observando o cast; jogo fechado e catch-up usam somente as politicas automaticas.
- Proximo passo sugerido: Etapa 161.5 - QA do timing manual no Tauri/SQLite e catch-up offline.

## Etapa 160.5 - QA dos comandos manuais no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido integralmente depois da rodada valida.
- A rodada passou em 31/31 checks com tres personagens reais da guilda contra Khazgrim Gatekeeper e encontrou 22 casts direcionados nao interrompidos elegiveis.
- `Manual Dodge` foi aplicado a um cast de Iron Bulwark, preservou o roll deterministico de 0,16% e elevou a chance de 19,34% para 31,34% com o bonus exato de 12 pontos percentuais.
- `Hold Ground` suprimiu a tentativa do segundo cast, concedeu +0,25% ao personagem alvo e produziu +0,08% de positioning power medio para a party de tres membros.
- Os dois comandos foram sincronizados nos snapshots dos tres participantes; uma segunda ordem para o mesmo cast foi rejeitada sem criar mutacao.
- Save/Reload preservou integralmente cast, alvo, tipo e horario das reacoes, mantendo os loadouts permanentes em `Automatic`.
- O SQLite armazenou somente `bossManualReactions` dentro de `current_action_json`; resultados derivados, rolls, dodges e trade-offs nao foram persistidos.
- O fingerprint derivado permaneceu identico antes e depois do reload, com 943 casts de personagem e 267.245 de dano total na simulacao usada pelo QA.
- O catch-up offline marcou os tres participantes como `readyToResolve`, preservou comandos e resultados derivados e gerou tres reports sem coletar recompensas.
- Uma segunda aplicacao do catch-up gerou zero reports e nenhuma mudanca, confirmando idempotencia.
- Gold, Renown, inventarios e Guild Depot permaneceram inalterados durante Save/Reload e catch-up.
- O banco original foi restaurado com 102.400 bytes e SHA-256 `E8F7C93A7131E629DCB01D5A212F057F08E955126F7FC03B44D2AB1992AD764A`, sem WAL ou SHM.
- A primeira compilacao do harness encontrou um loadout opcional sem normalizacao; a tipagem foi corrigida antes de iniciar o Tauri ou escrever no SQLite.
- Nenhuma correcao de produto foi necessaria nesta etapa; `npm run build` passou antes e depois do QA.
- Proximo passo sugerido: Etapa 161 - timing e qualidade das reacoes manuais aos telegraphs de Boss.

## Etapa 160 - Comandos manuais de reacao aos telegraphs de Boss

- Durante um telegraph direcionado, a Boss Scene agora oferece os comandos opcionais `Manual Dodge` e `Hold Ground`; raids nao observadas continuam funcionando integralmente pelas politicas automaticas existentes.
- `Manual Dodge` cria uma tentativa mesmo para `Hold Position` ou para um cast `Quick` ignorado por `Safe Windows`, adiciona 12 pontos percentuais a mesma rolagem deterministica e limita a chance final a 85%.
- `Hold Ground` suprime a tentativa de esquiva daquele cast e concede +0,25% de success power posicional por comando valido, limitado a +1% por personagem na raid.
- A precedencia continua `interrupt > dodge > defesa`: casts interrompidos descartam a reacao manual, nao geram tentativa e nao concedem bonus de posicionamento.
- Cada cast aceita somente um comando; cliques repetidos sao ignorados pela engine e os controles ficam travados imediatamente depois da escolha.
- As reacoes sao sincronizadas nos snapshots de todos os participantes, normalizadas contra dados invalidos e limitadas aos 40 registros mais recentes.
- Saves antigos continuam compativeis sem migration SQLite; o campo opcional vive no JSON da acao ativa e nao modifica o loadout permanente do personagem.
- Raid Analyzer, telegraph, relatorio de Combat Skills, simulacao final e Activity Log exibem a escolha e seus efeitos sem gerar mensagens por tick.
- Checks deterministas passaram em 19/19, cobrindo normalizacao, sincronizacao, duplicacao, override das politicas, bonus, limites, historico e repetibilidade da rolagem.
- QA visual passou em 1280x800 e 390x844: os dois comandos, estados travados e analisador responderam corretamente, sem overflow horizontal ou corte interno.
- `npm run build` passou com 476 modulos e `npm run tauri:build` gerou os pacotes MSI e NSIS; permanece apenas o aviso conhecido de chunk principal acima de 500 kB.
- Limitacao atual: a janela para reagir existe somente enquanto o jogador acompanha o telegraph ativo; catch-up e jogo fechado usam exclusivamente as configuracoes automaticas.
- Proximo passo sugerido: Etapa 160.5 - QA dos comandos manuais no Tauri/SQLite e catch-up offline.

## Etapa 159.5 - QA dos trade-offs de esquiva no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido integralmente depois da rodada valida.
- A rodada passou em 30/30 checks com tres personagens reais da guilda contra Khazgrim Gatekeeper, usando alvos e fases produzidos pela engine real.
- As posturas `Mobile`, `Selective` e `Anchored` foram derivadas corretamente de `Automatic`, `Safe Windows` e `Hold Position`.
- O grupo misto produziu +0,75% de success power medio; a media conferiu com os bonus individuais e a chance final nao regrediu.
- Dano bruto e quantidade de casts permaneceram identicos ao grupo totalmente automatico, confirmando que o trade-off afeta apenas success power e exposicao.
- Exposicao permaneceu igual a telegraphs recebidos menos esquivas bem-sucedidas, e `Hold Position` nao criou nenhuma tentativa de esquiva.
- Os snapshots mistos permaneceram isolados dos loadouts persistentes, mantidos em `Automatic`, durante Save/Reload e catch-up offline.
- O fingerprint derivado `3c7624d2` permaneceu identico apos reload, catch-up e um Save/Reload adicional do estado pronto.
- O SQLite persistiu apenas as politicas do snapshot e do loadout; `bossDodgeTradeOffs`, `positioningAttackBonusPercent` e `unavoidedTelegraphs` nao foram armazenados.
- O catch-up marcou os tres participantes como `readyToResolve`, gerou tres reports e permaneceu idempotente na segunda aplicacao.
- Gold, Renown, inventarios e Guild Depot permaneceram inalterados; nenhuma recompensa foi coletada.
- O banco original foi restaurado com 90.112 bytes e SHA-256 `0377048DC932D80C2FAFCA3683F56F888D576657115EA04D6988A46AF6906930`, sem WAL ou SHM.
- A primeira compilacao do harness encontrou dois acessos ao nome antigo do campo de reports; eles foram corrigidos antes de qualquer escrita no SQLite.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 160 - comandos manuais de reacao aos telegraphs de Boss.

## Etapa 159 - Trade-offs ofensivos e posicionais da esquiva

- As tres politicas de esquiva agora possuem identidade ofensiva real durante Boss raids: `Automatic` e movel e neutra, `Safe Windows` e seletiva e concede +0,75% de success power, e `Hold Position` fica ancorada e concede +1,5%.
- O bonus so existe quando o personagem recebeu ao menos um telegraph elegivel, impedindo ganho gratuito em encontros ou membros sem exposicao mecanica.
- A engine deriva por personagem postura, telegraphs recebidos, tentativas, esquivas bem-sucedidas, casts nao evitados e bonus ofensivo; nenhum desses resultados entra no save.
- O bonus da party e a media dos membros e entra no `attackBonusPercent` usado pela chance de sucesso, agora limitado a 10%; dano bruto, casts, hits e condicoes permanecem coerentes e inalterados.
- O snapshot da acao continua sendo a fonte da politica durante a raid, portanto mudancas no loadout persistente nao alteram um combate em andamento.
- Raid Analyzer mostra postura, bonus e exposicao do alvo atual; relatorio e Activity Log final detalham os trade-offs de todos os membros expostos.
- Os aventureiros na Boss Scene exibem `Mobile`, `Selective` ou `Anchored`, com sinais visuais discretos diferentes sob o sprite.
- A janela Combat Skills explica claramente mobilidade, filtros de telegraph e bonus de cada opcao.
- A grade da janela recebeu uma linha explicita para o seletor de postura; em 390x844 ela preserva 12px entre o seletor e a lista sem sobreposicao, overflow ou texto cortado.
- Checks deterministas passaram em 16/16 e a integracao real com Khazgrim Gatekeeper passou em 8/8; o grupo misto gerou +0,75% e elevou a chance de sucesso de 79,5264% para 80,0964% sem alterar dano ou casts.
- QA visual passou em 1280x800 e 390x844. Os dois erros de console observados eram apenas a indisponibilidade esperada do Tauri SQL Plugin no navegador web, com fallback local funcionando.
- Limitacao atual: postura influencia success power e exposicao a telegraphs, mas ainda nao altera dano bruto nem oferece comando manual de movimento durante o cast.
- Proximo passo sugerido: Etapa 159.5 - QA dos trade-offs de esquiva no Tauri/SQLite e catch-up offline.

## Etapa 158.5 - QA do comportamento de esquiva no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada passou em 32/32 checks com tres personagens reais da guilda contra Khazgrim Gatekeeper, cujas fases cobrem `Heavy`, `Quick` e `Focused`.
- `Automatic` produziu 27 tentativas, `Safe Windows` produziu 18 tentativas sem nenhum cast `Quick` e `Hold Position` produziu zero tentativas.
- Chances, rolls e resultados dos casts elegiveis de `Safe Windows` permaneceram identicos aos mesmos casts em `Automatic`.
- A raid foi iniciada com os snapshots `Automatic`, `Safe Windows` e `Hold Position`; depois, os tres loadouts persistentes foram alterados para `Hold Position` sem modificar a acao ativa.
- O fingerprint misto `88b68a44` permaneceu identico apos Save/Reload, catch-up offline e um Save/Reload adicional do estado pronto.
- A cadeia `interrupt > dodge > defesa` permaneceu valida: casts interrompidos nao tentaram esquiva, esquivas bem-sucedidas nao reservaram defesa e respostas ficaram somente em casts nao esquivados.
- O SQLite persistiu as tres politicas nos snapshots e `Hold Position` nos loadouts editados, mas nao armazenou `bossTelegraphDodges`, rolls, chances, modificadores nem casts derivados.
- O catch-up marcou as tres acoes como `readyToResolve`, preservou as politicas e foi idempotente na segunda aplicacao, com zero novos reports.
- Gold, Renown, inventarios e Guild Depot permaneceram inalterados; nenhuma recompensa foi coletada.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, harness, bootstrap e permissao temporaria foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 159 - trade-offs ofensivos e posicionais das politicas de esquiva.

## Etapa 158 - Comportamento de esquiva por personagem

- Cada personagem agora configura o comportamento de esquiva de Boss no proprio loadout: `Automatic`, `Safe Windows` ou `Hold Position`.
- `Automatic` preserva a regra anterior e tenta todos os telegraphs elegiveis; continua sendo o fallback de saves antigos e valores invalidos.
- `Safe Windows` ignora casts `Quick` e tenta somente perfis `Focused` e `Heavy`; `Hold Position` nao cria tentativas automaticas.
- Casts ignorados continuam na cadeia normal e podem receber respostas defensivas, preservando a ordem `interrupt > dodge > defesa`.
- A configuracao fica na janela de Combat Skills, com controle segmentado, estado acessivel por `aria-pressed` e registro no Activity Log.
- O comportamento e copiado para o snapshot da proxima hunt ou raid; editar o personagem depois do inicio nao altera a acao em andamento.
- Boss Scene mostra comportamento e ausencia de tentativa no Raid Analyzer; relatorio e log final registram a politica usada por personagem.
- A persistencia usa o JSON de `combatSkillLoadout` existente, sem migration SQLite; normalizacao mantem saves e snapshots antigos compativeis.
- Um harness temporario passou em 13/13 checks para normalizacao, updater, filtros por perfil, isolamento de snapshot, limites e determinismo; ele foi removido depois da validacao.
- Os controles reais alternaram corretamente entre os tres modos. QA visual passou em 1280x800 e 390x844, sem overflow horizontal, cortes internos ou erros no console.
- Limitacao atual: as politicas controlam apenas quando tentar a esquiva; ainda nao existem custo de movimento, penalidade ofensiva ou comando manual durante o telegraph.
- Proximo passo sugerido: Etapa 158.5 - QA do comportamento de esquiva no Tauri/SQLite e catch-up offline.

## Etapa 157.5 - QA dos perfis de telegraph no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada limpa passou em 28/28 checks com os cinco personagens da guilda contra a Ember Matriarch.
- Foram reproduzidas 22 tentativas de esquiva: 6 sucessos e 16 acertos, preservados com o fingerprint `8d2e8a51` apos Save/Reload e catch-up offline.
- As fases da Ember produziram 6 tentativas `Focused`, sem esquivas, e 16 `Heavy`, com 6 esquivas; a Ember nao possui habilidade `Quick`, perfil ja coberto no QA deterministico completo da Etapa 157.
- Perfil, dificuldade individual, modificador, chance, roll e resultado permaneceram identicos em todas as recomputacoes.
- A cadeia `interrupt > dodge > defesa` permaneceu valida: casts interrompidos nao tentaram esquiva, casts esquivados nao reservaram defesa e respostas pertenceram somente a casts que atingiram o alvo.
- O SQLite persistiu os cinco snapshots da acao e suas roles, mas nao armazenou `bossTelegraphDodges`, `rollPercent`, `successChancePercent`, `profileModifierPercent` nem `abilityCasts` derivados.
- O catch-up marcou os cinco personagens como `readyToResolve`, preservou o fingerprint e permaneceu idempotente na segunda aplicacao, com zero novos reports.
- Gold, Renown, inventarios e Guild Depot permaneceram inalterados; nenhuma recompensa foi coletada.
- Duas rodadas preliminares foram descartadas apenas porque o ambiente nao possuia `sqlite3`/Python e a WebView oculta nao permitia leitura verificavel; o save foi restaurado antes da rodada valida.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, harness, bootstrap e permissao temporaria foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 158 - configuracao de comportamento de esquiva por personagem.

## Etapa 157 - Dificuldades individuais e perfis de telegraph de Boss

- As 15 habilidades de fase dos seis Bosses agora declaram dificuldade individual de esquiva e um perfil visual/mecanico: `Quick`, `Focused` ou `Heavy`.
- O catalogo possui quatro habilidades `Quick`, cinco `Focused` e seis `Heavy`, com dificuldades entre 18% e 55% adequadas ao ritmo de cada golpe.
- O perfil modifica a chance real de esquiva: `Quick` aplica -8 pontos percentuais, `Focused` preserva a chance base e `Heavy` aplica +8 pontos percentuais pela janela mais legivel.
- Perfil ausente ou invalido normaliza para `Focused`; dificuldade invalida usa 30% e valores finitos permanecem limitados entre 0% e 90%.
- Boss Scene diferencia visualmente os tres telegraphs e mostra perfil, alvo, dificuldade e chance; Raid Analyzer, timeline, relatorio e log final exibem os mesmos dados.
- O log agregado informa sucessos e tentativas por perfil sem criar uma linha por cast.
- Save/Load e saves antigos permanecem compativeis porque perfis, casts, rolls e resultados sao derivados do catalogo e do snapshot existente, sem migration SQLite.
- Um harness temporario passou em 9/9 checks para catalogo, normalizacao, modificadores, limites e determinismo; ele foi removido depois da validacao.
- QA visual passou em 1440x900 e 390x844. No mobile, telegraphs de 279 px e timeline de 327 px permaneceram dentro do viewport util de 375 px, sem overflow horizontal.
- Proximo passo sugerido: Etapa 157.5 - QA dos perfis de telegraph no Tauri/SQLite e catch-up offline.

## Etapa 156.5 - QA da esquiva no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada limpa passou em 49/49 checks com os cinco personagens da guilda contra a Ember Matriarch.
- Foram reproduzidas 23 tentativas de esquiva: 4 sucessos e 19 acertos, preservados com o mesmo fingerprint `134d777e` apos Save/Reload.
- A cadeia completa permaneceu deterministica: 21 tentativas de interrupcao produziram 14 interrupcoes, casts interrompidos nao tentaram esquiva e casts esquivados nao receberam ward/cleanse.
- Treze casts que falharam na esquiva mantiveram respostas defensivas validas, sem reservar resposta para casts evitados.
- O SQLite persistiu party, roles, loadouts e snapshots das acoes, mas nao armazenou `bossTelegraphDodges`, `bossInterrupts`, `rollPercent`, `successChancePercent`, `reservedEventKey` nem `abilityCasts` derivados.
- O catch-up offline marcou os cinco personagens como `readyToResolve`, preservou o fingerprint de esquiva e permaneceu idempotente na segunda aplicacao, com zero novos reports.
- Gold, Renown, XP, inventarios e Guild Depot permaneceram inalterados; nenhuma recompensa foi concedida antes da coleta manual.
- Uma consulta SQL externa adicional falhou por escape de aspas no PowerShell e foi descartada; as mesmas invariantes ja haviam passado dentro dos 49 checks do Tauri.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, backup, harness e bootstrap temporarios foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 157 - dificuldades individuais e perfis de telegraph por habilidade de Boss.

## Etapa 156 - Esquiva automatica de habilidades telegraficas de Boss

- Casts direcionados de Boss agora usam o `dodgePercent` real do personagem alvo para uma tentativa automatica de esquiva no fim do telegraph.
- A chance combina mobilidade, duracao da janela de reacao e dificuldade da habilidade, com normalizacao segura entre 3% e 75%.
- Cada habilidade de fase possui `dodgeDifficultyPercent`, normalizado entre 0% e 90% com fallback de 30% para dados antigos.
- O roll e deterministico por cast e alvo, preservando o mesmo resultado em reload e catch-up offline sem persistir estado derivado.
- A ordem de resolucao agora e `interrupt > dodge > ward/cleanse`: casts interrompidos nao tentam esquiva, casts esquivados nao aplicam condicao e nao consomem resposta defensiva.
- Falhas de esquiva mantem o fluxo existente de ward e cleanse; casts sem alvo valido ou tempos invalidos sao ignorados com seguranca.
- Boss Scene e Raid Analyzer mostram alvo, chance e estados `Ready`, `Dodged` ou `Caught`; timeline, relatorio e log final exibem dificuldade e resultado agregado.
- QA deterministico temporario passou em 36/36 checks sobre os seis Bosses e 15 fases. Na Ember Matriarch, 23 casts foram elegiveis depois das interrupcoes, com 4 esquivas e 19 acertos, mantendo 13 respostas defensivas validas.
- QA visual confirmou a composicao em 1280x720 e 375x812, incluindo o estado `Caught` sem corte lateral aparente. A consulta numerica final de overflow/logs expirou na conexao do navegador e nao foi considerada validada.
- `npm run build` passou; `npm run tauri:build` concluiu o binario, MSI e NSIS, embora o executor tenha atingido seu timeout logo depois da mensagem final do Tauri.
- Proximo passo sugerido: Etapa 156.5 - QA da esquiva no Tauri/SQLite e catch-up offline.

## Etapa 155.5 - QA das interrupcoes no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada limpa passou em 47/47 checks com os cinco personagens da guilda contra a Ember Matriarch.
- Foram reproduzidas 21 tentativas deterministicamente: 14 interrupcoes bem-sucedidas e 7 resistencias, preservadas com o mesmo fingerprint apos Save/Reload.
- Cada tentativa reservou um evento real da rotacao dentro do telegraph; casts e eventos permaneceram unicos, e chance, roll e resultado ficaram dentro dos limites esperados.
- Interrupcoes bem-sucedidas nao receberam resposta defensiva posterior; tentativas resistidas mantiveram ward/cleanse como fallback.
- O SQLite persistiu party, roles, loadouts e snapshot das acoes, mas nao armazenou `bossInterrupts`, `reservedEventKey`, `rollPercent` nem `abilityCasts` derivados.
- O catch-up offline marcou os cinco personagens como `readyToResolve`, preservou o fingerprint das interrupcoes e permaneceu idempotente na segunda aplicacao, com zero novos reports.
- Gold, Renown, XP, inventarios e Guild Depot permaneceram inalterados; nenhuma recompensa foi concedida antes da coleta manual.
- A primeira rodada de diagnostico foi descartada em 46/47 porque o teste tratava respostas de casts sem tentativa como fallback invalido; a assercao foi corrigida sem alteracao no produto.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, backup, harness e bootstrap temporarios foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 156 - esquiva automatica de habilidades telegraficas de Boss.

## Etapa 155 - Interrupcoes automaticas de habilidades de Boss

- Guardian, Ranger, Arcanist, Warden e Monk agora possuem uma habilidade de ataque capaz de interromper casts telegraficos de Boss.
- Cada habilidade de fase recebe resistencia de interrupcao normalizada, e a chance final fica limitada entre 10% e 90%.
- O planejador usa somente eventos reais da rotacao dentro da janela do telegraph; cada evento e cada cast podem ser reservados no maximo uma vez.
- A selecao prioriza maior poder de interrupcao e o evento mais proximo da resolucao, com resultado deterministico para preservar save/load e catch-up offline.
- Sucesso cancela apenas a resolucao hostil do cast; resistencia preserva o fluxo existente de ward e cleanse como fallback.
- Boss Scene, Raid Analyzer, timeline, janela de skills, relatorio e log final mostram poder, resistencia, chance e resultado sem criar spam por tentativa.
- Saves antigos continuam compativeis porque agenda, reservas e resultados sao derivados em memoria e nao exigem migration SQLite.
- QA deterministico temporario cobriu 28 regras; o fixture produziu 21 tentativas, 14 sucessos e 7 resistencias nos seis Bosses e 15 fases. O painel foi removido apos a validacao.
- QA visual desktop confirmou o telegraph central e os estados `Ready` e `Resisted`; a rodada mobile final nao foi executada porque a conexao do navegador bloqueou a troca de viewport por politica local.
- `npm run build` passou durante a implementacao e com o harness temporario.
- Proximo passo sugerido: Etapa 155.5 - QA das interrupcoes no Tauri/SQLite e catch-up offline.

## Etapa 154.5 - QA das prioridades defensivas no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada passou em 45/45 checks com os cinco personagens reais da guilda e skills hibridas de suporte contra a Ember Matriarch.
- `Prevent` persistiu e recarregou 25 wards; `Recover` persistiu e recarregou 25 cleanses sobre os mesmos 25 casts hostis.
- Casts, reservas e cooldowns permaneceram unicos, finitos e deterministicos em ambas as politicas.
- A preferencia persistiu separadamente no loadout do personagem e no snapshot da acao: mudar o personagem para `Prevent` manteve a raid iniciada em `Recover`.
- O SQLite armazenou apenas `defensiveResponsePriority` nos JSONs de loadout; respostas, reservas, agendas de cast e metadados derivados nao foram persistidos.
- Saves sem politica e valores invalidos normalizaram para `Automatic`.
- O catch-up offline preservou o snapshot `Recover`, o fingerprint de respostas e `readyToResolve`; a segunda aplicacao foi idempotente.
- Gold, Renown, XP, inventarios e Guild Depot permaneceram inalterados; nenhuma recompensa foi concedida antes da coleta manual.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, backup, harness e bootstrap temporarios foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 155 - interrupcoes automaticas de habilidades de Boss.

## Etapa 154 - Prioridades configuraveis para respostas defensivas

- Cada personagem agora possui uma politica de resposta de Boss no loadout: `Automatic`, `Prevent` ou `Recover`.
- `Automatic` preserva a regra anterior, priorizando ward no inicio do telegraph e usando cleanse quando ward nao esta disponivel.
- `Prevent` favorece skills com ward durante o telegraph; `Recover` favorece cleanse 250 ms depois da resolucao hostil.
- A preferencia e apenas um criterio de prioridade: escopo, alvo, skill equipada, mana, evento real da rotacao, cooldown e fallback seguro continuam obrigatorios.
- A janela de Support Skills ganhou um controle segmentado responsivo com explicacao curta de cada politica.
- A configuracao vale para o proximo deployment e e copiada para o snapshot da hunt/Boss; alterar o personagem nao reescreve uma acao em andamento.
- O Raid Analyzer e o telegraph mostram se a resposta escolhida veio de `Auto`, `Prevent` ou `Recover`.
- Saves antigos, snapshots antigos e valores invalidos normalizam para `Automatic`; a configuracao persiste no JSON de loadout existente, sem migration nova.
- QA deterministico passou em 19/19 checks para normalizacao, updater, timing e fallback, e em 25/25 checks na party completa da Ember Matriarch.
- Com cinco skills hibridas no fixture, `Automatic`/`Prevent` produziram 25 wards e `Recover` produziu 25 cleanses sobre os mesmos casts, sem duplicar reservas ou violar cooldowns.
- QA visual passou em 1280x720 e 375x812, sem overflow horizontal, com os tres modos visiveis, estado selecionado interativo e lista rolavel.
- Proximo passo sugerido: Etapa 154.5 - QA das prioridades defensivas no Tauri/SQLite e catch-up offline.

## Etapa 153.5 - QA das respostas automaticas no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada passou em 44/44 checks usando os cinco personagens reais da guilda contra a Ember Matriarch, com 25 respostas automaticas e zero respostas quando o suporte foi desabilitado.
- Cada resposta reservou um evento real da rotacao; casts hostis, reservas e cooldowns permaneceram unicos, limitados e nos tempos corretos de telegraph/resolve.
- Save/Reload preservou status `bossing`, party, roles, loadouts e o fingerprint completo de casts, respostas e defesa condicional.
- `current_action_json` nao armazenou respostas, reservas, contadores, casts nem fases derivados; esses dados continuam recalculados deterministicamente.
- O catch-up offline marcou os cinco membros como `readyToResolve`, preservou o mesmo fingerprint e foi idempotente na segunda aplicacao.
- Gold, Renown, XP, inventarios e Guild Depot permaneceram inalterados durante save, reload e catch-up; nenhuma recompensa foi concedida antes da coleta manual.
- Nesta party real, as 25 respostas disponiveis foram cleanses; a amostra deterministica teve dano condicional zero com suporte ativo e desabilitado, enquanto tentativas, aplicacoes e ausencia de aumento foram verificadas.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, backup, harness e bootstrap temporarios foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 154 - prioridades configuraveis para respostas defensivas automaticas.

## Etapa 153 - Respostas defensivas automaticas aos telegraphs

- Parties de Boss agora reservam automaticamente casts de suporte ja existentes na rotacao para responder a habilidades condicionais telegraficas.
- Wards com protecao sao deslocadas para o inicio do telegraph; cleanses puros sao aplicados logo apos a resolucao hostil.
- A resposta respeita skill equipada, mana e quantidade de casts calculada, escopo pessoal/party, alvo, cooldown e disponibilidade temporal; nenhum uso adicional e criado.
- Eventos normais da mesma skill que cairiam dentro do cooldown de uma resposta reservada deixam de fornecer ward ou cleanse, evitando protecao gratuita por sobreposicao.
- Cada cast hostil recebe no maximo uma resposta e cada evento de suporte pode ser reservado somente uma vez.
- Boss Scene mostra a resposta pronta dentro do telegraph e no Raid Analyzer; o relatorio lista ate oito respostas com habilidade, personagem, Boss cast, alvo e tipo.
- Logs finais agregam respostas por personagem e registram quantos telegraphs foram atendidos sem gerar uma linha para cada cast.
- QA deterministico temporario passou em 41/41 checks: 25 respostas na party real da Ember Matriarch, zero com suporte desabilitado e dano condicional reduzido de 19.725 para 16.648.
- O QA cobriu unicidade, escopo, timing, cooldown, limites finitos, orçamento hostil inalterado e ausencia de aumento em aplicacoes ou dano.
- QA visual passou em 1280x900 e 375x812 com Searing Brand, alvo e `Lyra: Renew ready` visiveis, sem overflow horizontal, sobreposicao com a party ou logs de erro/warning.
- `npm run build` e `npm run tauri:build` passaram; permanece apenas o aviso conhecido do Vite sobre o tamanho do bundle principal.
- Limitacao atual: as respostas sao totalmente automaticas e focadas em burn, poison e slow; interrupcoes, dodge ativo e configuracao de prioridade ficam para etapas futuras.
- Proximo passo sugerido: Etapa 153.5 - QA das respostas automaticas no Tauri/SQLite e catch-up offline.

## Etapa 152.5 - QA dos casts temporais no Tauri/SQLite

- Um harness temporario executou dentro do aplicativo Tauri contra o SQLite local real e foi removido depois da rodada valida.
- A rodada limpa passou em 37/37 checks sobre os seis Bosses, 15 fases, IDs de habilidade, tempos limitados, casts da Ember Matriarch, alvos e transicoes exatas `idle > telegraphing > cooldown`.
- Quatro membros da raid foram salvos e recarregados como `bossing`, preservando roles, party e loadouts; o fingerprint completo de casts e combate permaneceu identico.
- `current_action_json` nao armazenou `abilityCasts` nem `specialAbility`: a agenda continuou derivada deterministicamente do catalogo, sem ampliar ou fragilizar saves antigos.
- Acoes expiradas produziram quatro reports, `readyToResolve`, timestamp estavel e nenhuma recompensa antes da coleta manual.
- O estado pronto sobreviveu a novo Save/Reload e uma segunda aplicacao do catch-up foi idempotente, sem reports, rewards ou mutacoes duplicadas.
- Gold, Renown, XP, inventarios e Guild Depot permaneceram inalterados durante save, reload e catch-up.
- A primeira rodada de diagnostico foi descartada em 18/19 checks: o fixture elevava level sem recalcular atributos em memoria, enquanto o reload os normalizava corretamente. O fixture foi corrigido sem alteracao no codigo de produto.
- A rodada valida terminou com 37/37; a tentativa posterior de fechar a janela por API foi negada pela capability Tauri, depois de todos os checks, e o processo foi encerrado externamente com seguranca.
- O banco original foi restaurado com 86.016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`; WAL, SHM, tabela, harness e bootstrap temporarios foram removidos.
- Nenhuma correcao de produto foi necessaria nesta etapa.
- Proximo passo sugerido: Etapa 153 - respostas defensivas automaticas aos telegraphs de Boss.

## Etapa 152 - Casts temporais e telegraphs de Boss

- As 15 habilidades de fase dos seis Bosses possuem atraso inicial, tempo de cast e cooldown explicitos.
- A engine deriva uma agenda deterministica limitada a 100 casts por fase; nada novo e persistido no save e o mesmo snapshot reproduz a mesma agenda no calculo offline.
- O telegraph aparece no centro da arena com nome, alvo, barra e contagem regressiva. O Raid Analyzer informa `Ready`, `Casting`, `Cooldown` ou `Resolved`.
- A timeline mostra tempo de cast, cooldown e quantidade de usos de cada fase; o relatorio final registra os mesmos dados sem gerar spam por cast.
- Burn, poison e slow exclusivos de habilidades nao sao mais tentados em todo ataque da fase: cada um ocorre somente na resolucao do cast e apenas contra o alvo primario daquela fase.
- Tempos invalidos normalizam para limites seguros: atraso de 0 a 120s, cast de 0,5 a 8s e cooldown de 5 a 180s.
- QA deterministico temporario passou em 100/100 checks sobre os seis Bosses: 137 casts totais, 90 casts condicionais, IDs unicos, ordem temporal, limites, alvos, ausencia de sobreposicao e preservacao do orcamento de ataques. O harness foi removido apos a validacao.
- `npm run build` passou; permanece apenas o aviso conhecido do Vite sobre o tamanho do bundle principal.
- Limitacao atual: casts ainda nao podem ser interrompidos, esquivados ou respondidos manualmente; habilidades sem condicao sao feedback temporal/visual nesta etapa.
- Proximo passo sugerido: Etapa 152.5 - QA dos casts temporais no Tauri/SQLite, reload e catch-up offline.

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

- Etapa 159.5 concluida: QA real no Tauri/SQLite validou trade-offs, snapshots, reload, catch-up e integridade da economia em 30/30 checks.
- Etapa 159 concluida: politicas de esquiva agora equilibram mobilidade, exposicao e ate +1,5% de success power com feedback na arena, analyzer e relatorio.
- Etapa 158.5 concluida: QA real no Tauri/SQLite validou as tres politicas, isolamento de snapshots, cadeia defensiva, reload e catch-up em 32/32 checks.
- Etapa 158 concluida: cada personagem agora escolhe Automatic, Safe Windows ou Hold Position, com snapshot, UI, planner, analyzer e logs.
- Etapa 157.5 concluida: QA real no Tauri/SQLite validou perfis, dificuldades, fingerprint, cadeia defensiva, reload e catch-up offline em 28/28 checks.
- Etapa 157 concluida: habilidades de Boss agora possuem dificuldade individual e perfis Quick, Focused ou Heavy com impacto real na esquiva, feedback visual e relatorios.
- Etapa 156.5 concluida: QA real no Tauri/SQLite validou esquivas, cadeia interrupt/dodge/defesa, reload e catch-up offline em 49/49 checks.
- Etapa 156 concluida: casts telegraficos de Boss agora usam a esquiva real do alvo, com roll deterministico e ordem interrupt > dodge > defesa.
- Etapa 154.5 concluida: QA real no Tauri/SQLite validou Automatic, Prevent, Recover, isolamento de snapshots e catch-up offline em 45/45 checks.
- Etapa 154 concluida: loadouts agora configuram respostas de Boss em Automatic, Prevent ou Recover, com snapshot, UI e planner deterministico.
- Etapa 153.5 concluida: QA real no Tauri/SQLite validou reservas, cooldowns, reload e catch-up offline em 44/44 checks, com restauracao integral do save.
- Etapa 153 concluida: telegraphs condicionais de Boss agora reservam wards e cleanses reais da rotacao, respeitando escopo, alvo, cooldown e disponibilidade.
- Etapa 152.5 concluida: QA real no Tauri/SQLite validou agenda de casts, transicoes, reload e catch-up offline em 37/37 checks, com restauracao integral do save.
- Etapa 152 concluida: habilidades de Boss agora possuem casts temporais deterministas, telegraph central, alvo visivel, cooldown, timeline e condicoes exclusivas resolvidas uma vez por cast.
- Etapa 151.5 concluida: QA real no Tauri/SQLite validou habilidades exclusivas, condicoes temporais, reload e catch-up offline em 39/39 checks, com restauracao integral do save.
- Etapa 151 concluida: todas as fases de Boss agora possuem habilidades especiais nomeadas, com condicoes exclusivas por segmento, normalizacao segura, timeline, Raid Analyzer e logs.
- Etapa 150.5 concluida: QA real no Tauri/SQLite validou pressao temporal, dano, condicoes, risco, reload e catch-up offline em 32/32 checks, com restauracao integral do save.
- Etapa 150 concluida: fases de Boss agora modificam ritmo de ataques, dano recebido e chance de condicoes em segmentos temporais deterministas, com caps e relatorios visuais.
- Etapa 149.5 concluida: QA real no Tauri/SQLite validou fases, alvos temporais, normalizacao hostil e catch-up offline em 59/59 checks, com restauracao integral do save.
- Etapa 149 concluida: Bosses agora possuem fases temporais deterministicas, prioridades de alvo por role, trocas de aggro e timeline integrada ao briefing, arena e relatorio.
- Etapa 148.5 concluida: QA real no Tauri/SQLite validou threat, aggro, risco individual e catch-up offline em 50/50 checks, com restauracao integral do save.

- Etapa 148 concluida: Boss parties agora possuem threat e aggro reais, com um orçamento unico de ataques distribuido por role, risco individual, tank control e relatorios responsivos.
- Etapa 147.5 concluida: QA real no Tauri/SQLite validou suporte compartilhado, escopo pessoal, snapshots, Boss log e catch-up offline em 46/46 checks, com restauracao integral do save.
- Etapa 147 concluida: wards e cleanses de party agora protegem aliados em uma linha temporal compartilhada, com cargas unicas, caps seguros, atribuicao por caster e relatorio visual.
- Etapa 146.5 concluida: QA real no Tauri/SQLite validou cleanse, protecao, snapshots, Boss party e catch-up offline em 46/46 checks, com restauracao integral do save.
- Etapa 146 concluida: condicoes hostis agora podem ser prevenidas e limpas por skills de suporte, com janelas temporarias, dano residual, risco limitado e relatorios deterministas.
- Etapa 145.5 concluida: QA real no Tauri/SQLite validou penetracao, snapshots, Boss party e catch-up offline em 37/37 checks, com restauracao integral do save.
- Etapa 145 concluida: skills e equipamentos agora atravessam parte das resistencias positivas a burn, poison e slow, com caps, imunidades absolutas e relatorios completos.
- Etapa 144.5 concluida: QA real no Tauri/SQLite validou resistencias, imunidades, snapshots, Boss party e catch-up offline em 36/36 checks, sem regressao de produto.
- Etapa 144 concluida: criaturas e Bosses agora possuem resistencias, vulnerabilidades e imunidades deterministicas a burn, poison e slow, refletidas na timeline e nos relatorios.
- Etapa 143.5 concluida: QA real no Tauri/SQLite validou condicoes, snapshots, Boss party, catch-up offline e corrigiu coleta duplicada de Hunt.
- Etapa 143 concluida: burn, poison e slow deterministas agora integram skills, dano, controle, timeline, relatorios e Boss parties com caps seguros.
- Etapa 142.5 concluida: QA real no Tauri/SQLite validou block, Boss party, reload, catch-up offline idempotente e restauracao integral do save.
- Etapa 142 concluida: block chance e block power derivados agora simulam ataques recebidos, dano bloqueado e reducao limitada de risco em Hunts/Bosses.
- Etapa 141.5 concluida: QA real no Tauri/SQLite validou defense, penetration, skills perfurantes, Boss party, reload, catch-up idempotente e restauracao integral do save.
- Etapa 141 concluida: armor, defense e penetration agora reduzem dano e clear speed deterministicamente em Hunts/Bosses, com relatorio por cast e limites seguros.
- Etapa 140.5 concluida: QA real no Tauri/SQLite validou accuracy, miss, dodge, Boss party, reloads, catch-up offline idempotente e restauracao integral do save.
- Etapa 140 concluida: accuracy, miss e dodge deterministas agora resolvem cada ataque, alimentam timeline/relatorios e afetam bonus ofensivo e risco com limites seguros.
- Etapa 139.5 concluida: QA elemental real no Tauri/SQLite validou snapshot, reload, Hunt ativa/offline, idempotencia, Boss party, limites hostis e restauracao integral do save.
- Etapa 139 concluida: skills ofensivas, 12 monstros e 6 Bosses agora usam tipos de dano, resistencias e fraquezas elementais deterministicas com leitura por cast na timeline.
- Etapa 138.5 concluida: QA real de alvos e criticos no Tauri/SQLite validou atributos recalculados, Hunt/Boss, extremos criticos, catch-up offline e restauracao integral do save.
- Etapa 138 concluida: timeline agora atribui alvos reais e acertos criticos deterministas sem alterar o dano agregado, rewards ou persistencia.
- Etapa 137.5 concluida: QA real da timeline no Tauri/SQLite validou snapshots, limite de eventos, diversidade de skills, Hunt/Boss, catch-up offline e restauracao integral do save.
- Etapa 137 concluida: timeline deterministica e limitada mostra casts amostrados, dano, cura, mitigacao e mana em Hunts e Bosses sem salvar eventos nem duplicar gameplay.
- Etapa 136.5 concluida: QA real do relatorio detalhado no Tauri/SQLite validou persistencia, snapshots, Hunt/Boss, catch-up offline idempotente e restauracao integral do save.
- Etapa 136 concluida: relatorio detalhado contabiliza dano, cura e mitigacao por skill em Hunts e Bosses, sem duplicar bonus de gameplay.
- Etapa 135.5 concluida: QA real dos efeitos de skills no Tauri/SQLite validou snapshots, catch-up idempotente, Hunt/Boss e restauracao integral do save.
- Etapa 135 concluida: casts de skills agora alteram clear speed, risco, supplies e chances de Boss com efeitos deterministas e limitados.
- Etapa 134.5 concluida: QA real da rotacao de skills no Tauri/SQLite, com migration, Save/Reload, snapshots, normalizacao hostil e equivalencia offline validados.
- Etapa 134 concluida: rotacao offline real por personagem, com ordem configuravel, suporte opcional, mana, cooldowns, snapshot de acao e persistencia SQLite.
- Etapa 133.5 concluida: QA do catalogo visual de skills e hotbar nas cinco vocacoes, limites de level, modais, Boss party, estados concluidos e quatro larguras responsivas.
- Etapa 133 concluida: catalogo visual de 30 skills originais por vocacao, hotbar dinamica, modais por nivel e rotacao visual da party em Bosses.
- Etapa 132.5 concluida: QA das cinco vocacoes em Hunt/Boss, estados ativos/concluidos, movimento reduzido e quatro larguras, com sincronizacao visual da Hunt corrigida.
- Etapa 132 concluida: efeitos cosmeticos de combate por vocacao nas Hunt e Boss Scenes, com alvos reais da cena, estado resolvido e movimento reduzido.
- Etapa 131.5 concluida: QA dos seis sprites de Bosses em running, ready, fallback HTTP individual e cinco larguras responsivas, sem regressao encontrada.
- Etapa 131 concluida: seis sprites originais de Bosses, catalogo por boss ID, integracao em Explore, briefing, cards e Boss Scene, com fallback seguro.
- Etapa 130.5 concluida: QA das seis arenas de Bosses, parties reais, mobile, fallback HTTP, coleta unica, loot e cooldowns.
- Etapa 130 concluida: seis arenas originais de Bosses, briefing visual, Boss Scene dedicada, party overlay, raid analyzer e fallback local por boss ID.
- Etapa 129.5 concluida: QA das oito Hunts, sete cenarios, fallback real, camadas de combate, mobile e restauracao integral da fixture.
- Etapa 129 concluida: sete cenarios top-down originais cobrem as oito Hunts atuais com selecao por ID, palco responsivo e fallback CSS seguro.
- Etapa 128.5 concluida: QA dos sprites expandidos em oito superficies, formacao temporaria, quatro larguras responsivas e restauracao integral do mock.
- Etapa 128 concluida: sprites dos cinco herois expandidos para roster lateral, Ranking, Contracts, Boss parties, Guild Squads, Operations e planejamento de equipamento.
- Etapa 127.5 concluida: QA dos cinco sprites de herois no Character Hall, painel direito, Hunt Scene, fallback e cinco larguras responsivas.
- Etapa 127 concluida: sprites originais para os cinco herois atuais, integrados ao Character Hall, painel direito e Hunt Scene com fallback seguro.
- Etapa 126.5 concluida: QA do catalogo completo de 12 criaturas em Hunts avancadas, Hunt Scene, Bestiary e cinco larguras responsivas.
- Etapa 126 concluida: sprites originais para as seis criaturas avancadas restantes, fechando os 12 monstros do catalogo atual.
- Etapa 125.5 concluida: QA dos sprites iniciais de criaturas em Explore, Hunt Scene, Bestiary, fallback e cinco larguras responsivas.
- Etapa 125 concluida: fundacao de sprites originais para seis criaturas iniciais de Thaeron, integradas em Explore, Hunt Scene e Bestiary com fallback seguro.
- Etapa 124.5 concluida: QA do catalogo completo de sprites em Hunts, Bosses, Inventory, Quick Sell, Guild Workbench e quatro larguras responsivas.
- Etapa 124 concluida: sprites originais para os dez itens restantes de moeda, creature products e materiais de hunt, fechando o catalogo visual de itens.
- Etapa 123.5 concluida: QA do set Emberforged em Bazar, Guild Depot, boss loot, crafting, Equipment por vocacao, bonus 3/3 e responsividade.
- Etapa 123 concluida: sprites originais para o set Emberforged completo, com cinco pecas Epic/Elite e o Emberheart Amulet Legendary/Mythic.
- Etapa 122.5 concluida: QA do set Veteran Cryptwarden em Bazar, Guild Depot, boss loot, crafting, Equipment por vocacao e responsividade.
- Etapa 122 concluida: sprites originais para o set Rare/Veteran Cryptwarden completo do mid game.
- Etapa 121.5 concluida: QA dos sprites de armas em Bazaar, boss loot, crafting, Inventory, Equipment, fontes de monster loot e responsividade.
- Etapa 121 concluida: sprites originais para as quatro armas Common/Uncommon recorrentes que ainda usavam fallback visual no early game.
- Etapa 120.5 concluida: QA dos sprites early-game em Bazaar, Inventory, Equipment, Guild Depot, Forge, crafting e responsividade.
- Etapa 120 concluida: sprites originais para cinco armaduras, shields e accessories recorrentes do early game.
- Etapa 119.5 concluida: QA dos sprites de recrutamento em todos os dossiers, fluxo real de Tessa, Equipment, responsividade e escala de texto.
- Etapa 119 concluida: sprites originais para os cinco equipamentos exclusivos dos candidatos de recrutamento avancados.
- Etapa 118.5 concluida: QA dos sprites de equipamentos no roster, Character Hall, Equipment e responsividade, com overflow do badge Daily corrigido.
- Etapa 118 concluida: sprites originais para dez equipamentos iniciais, cobrindo todos os loadouts equipados do roster atual e o Cloth Sash recorrente de Monk.
- Etapa 117.5 concluida: QA dos sprites de containers/utilities, com integracao visual corrigida no Equipment Panel e painel direito do personagem.
- Etapa 117 concluida: sprites originais para Light Quiver, cinco containers e quatro utilities recorrentes, com fallbacks semanticos preservados.
- Etapa 116.5 concluida: QA dos sprites avancados em Market NPC, filtros, dossiers, hunt result e quatro larguras responsivas, sem regressao funcional encontrada.
- Etapa 116 concluida: sprites originais para Strong Potions, quatro combat runes e duas ammunition stacks, com raridade de supplies corrigida no resultado de hunt.
- Etapa 115.5 concluida: QA dos sprites de supplies/materiais, com integracao visual corrigida nos custos da Forge e requisitos do Guild Workbench.
- Etapa 115 concluida: sprites originais para tres supplies centrais e dois materiais recorrentes, integrados ao `ItemIcon` compartilhado sem alterar gameplay ou persistencia.
- Etapa 114.5 concluida: QA visual da fundacao de sprites de itens, com fallback resiliente para falha de imagem, validacao de alpha/catalogo, quantidade, acessibilidade e layouts responsivos.
- Etapa 114 concluida: fundacao visual de sprites originais para itens, com cinco materiais/trofeus integrados ao `ItemIcon` compartilhado e fallback seguro para o restante do catalogo.
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
- Etapa 79 concluida: Guild Armory Audit compara os loadouts do roster, lacunas, conjuntos e upgrades compativeis ja guardados no Guild Depot, sem auto-equip ou estado novo.
- Etapa 79.5 concluida: QA do Armory bloqueou stacks zeradas, normalizou ratings/levels corrompidos, corrigiu filtros vazios e sincronizou personagem nos atalhos; 122.874 checks e SQLite nativo passaram.
- Etapa 80 concluida: Equipment Acquisition Planner conecta upgrades compativeis a posses da guilda, Hunts, Bosses e Crafting reais, sem reservar itens ou iniciar atividades automaticamente.
- Etapa 80.5 concluida: QA do Acquisition Planner corrigiu depot legado, materiais nao finitos, boss sem gold e falsas posses; 557.731 checks e duas cargas Tauri/SQLite passaram.
- Etapa 81 concluida: Guild Equipment Allocation Board distribui cada copia finita do Guild Depot uma unica vez e maximiza o ganho total de rating do roster sem auto-equip.
- Etapa 81.5 concluida: QA do Allocation Board corrigiu a selecao de ordens secundarias, validou 24.039 checks, desktop/mobile e uma carga Tauri/SQLite com restauracao integral do save.
- Etapa 82 concluida: Quartermaster Distribution Orders executa uma ordem ou todas as transferencias prontas com confirmacao, rollback atomico e equipamento real salvo localmente.
- Etapa 82.5 concluida: QA aprofundada das Distribution Orders corrigiu estados corrompidos, roster invalido e feedback final, com 17.893 checks, browser responsivo, Tauri release e SQLite restaurado por hash.
- Etapa 83 concluida: Guild Loadout Templates salva tres metas por personagem, localiza as pecas nos holdings locais e encaminha diferencas do Guild Depot ao Quartermaster.
- Etapa 83.5 concluida: QA dos Loadout Templates bloqueou equipamento corrompido, corrigiu o contador por personagem e validou 8.048 checks, browser responsivo e duas cargas Tauri/SQLite.
- Etapa 84 concluida: Editor Avancado de Loadouts permite planejar itens do catalogo real, metas de tier/upgrade e fontes de aquisicao sem automatizar transacoes ou equipamento.
- Etapa 84.5 concluida: QA do Editor Avancado corrigiu prontidao de Boss/Bazaar, nome de plano vazio e save bloqueado, com 40.667 checks, browser responsivo e duas cargas Tauri/SQLite.
- Etapa 85 concluida: Active Loadout Assignments define um plano ativo por aventureiro e consolida prontidao, lacunas e rotas manuais no Guild Armory.
- Etapa 85.5 concluida: QA dos Active Loadouts separou targets invalidos de itens ausentes e corrigiu a rota direta para editar planos invalidos.
- Etapa 86 concluida: Guild Loadout Procurement Board consolida todos os targets pendentes dos planos ativos em rotas manuais eficientes e sem nova persistencia.
- Etapa 86.5 concluida: QA do Procurement Board corrigiu roster duplicado e preparacao de Hunt com o aventureiro elegivel exato.
- Etapa 87 concluida: Guild Loadout Procurement Orders adiciona uma fila persistente de cinco prioridades manuais ligadas aos planos ativos.
- Etapa 87.5 concluida: QA das Procurement Orders corrigiu identidade obsoleta e bloqueou novos pedidos de targets ja equipados, com harness, browser responsivo e Tauri/SQLite real.
- Etapa 88 concluida: Procurement Readiness Alerts rastreia ordens cumpridas/disponiveis e persiste badge, reconhecimento e notificacao unica sem automacao.
- Etapa 88.5 concluida: QA dos Procurement Alerts normalizou leitura/reconhecimento de dados hostis e validou 90.027 checks, Tauri release e SQLite legado com restauracao integral.
- Etapa 89 concluida: Procurement Item Reservations protege uma copia exata do Guild Depot para uma ordem ativa, sem transferencia ou equipamento automatico.
- Etapa 89.5 concluida: QA das Item Reservations isolou copias disputadas, preservou alternativas livres no Quartermaster e validou 60.035 checks com dois reloads SQLite.
- Etapa 90 concluida: Reserved Gear Fulfillment entrega manualmente a copia reservada ao aventureiro correto, equipa o alvo e conclui ordem/reserva de forma atomica.
- Etapa 90.5 concluida: QA interativo e SQLite do Reserved Gear Fulfillment validou confirmacao, clique duplo, persistencia e rollback defensivo em 90.035 checks.
- Etapa 91 concluida: Armory Fulfillment Ledger registra as 30 entregas manuais mais recentes com peca, aventureiro, template, slot, substituicao e horario.
- Etapa 91.5 concluida: QA do Fulfillment Ledger preservou itens aposentados, priorizou ordens ativas e validou 60.016 checks com duas cargas SQLite.
- Etapa 92 concluida: Reserved Gear Batch Dispatch revisa e entrega ate cinco reservas exatas em uma unica confirmacao atomica.
- Etapa 92.5 concluida: QA do Batch Dispatch congelou a revisao, reforcou exclusividade/acessibilidade do dialogo e validou 75.022 checks com lote maximo.
- Etapa 93 concluida: Squad Gear Readiness conecta squads, deployment orders e loadouts ativos em uma visao derivada de preparacao do arsenal.
- Etapa 93.5 concluida: QA do Squad Gear Readiness corrigiu selecao obsoleta apos mudanca de save e completou a semantica acessivel das tabs.
- Etapa 94 concluida: Operation Readiness Briefing consolida ordem, formacao, requisitos do alvo e gear antes da preparacao manual.
- Etapa 94.5 concluida: QA do Operation Readiness Briefing adicionou blocked summary, taxa base e navegacao completa de teclado.
- Etapa 95 concluida: Operation Outcome Ledger registra Bosses e Contracts concluidos, consolida custos, ganhos, participantes e loot e persiste o historico de Bosses no SQLite local.
- Etapa 95.5 concluida: QA do Operation Outcome Ledger estabilizou identidade de Boss, saneou historico de Contracts, blindou somas e completou acessibilidade dos filtros.
- Etapa 96 concluida: Operation Performance Analytics transforma os relatorios recentes em taxa de sucesso, economia, ranking por alvo e tendencia operacional sem novo estado.
- Etapa 96.5 concluida: QA do Operation Performance Analytics isolou destaques e tendencia por escopo, tornou confiabilidade mais representativa e validou 36.030 assercoes, browser responsivo, Tauri release e integridade SQLite.
- Etapa 97 concluida: Guild Campaign Milestones adiciona uma trilha operacional lifetime de seis capitulos, claims manuais de Renown e integracao com Bosses, Contracts e Campaign Operations.
- Etapa 97.5 concluida: QA dos Guild Campaign Milestones corrigiu classificacao de claims bloqueados, reparo canonico de rewards e roster hostil, com 80.085 assercoes e QA responsivo.
- Etapa 98 concluida: Campaign Region Mastery conecta Hunts, Bosses e Contracts a tres patentes regionais lifetime, com bonus local de ate +4% XP e gold.
- Etapa 98.5 concluida: QA da Region Mastery congelou bonus de gold por Hunt, protegeu eventos hostis, completou o auto-repeat e validou 100.067 assercoes.
- Etapa 99 concluida: Regional Campaign Orders adiciona ofertas diarias locais para Hunts, Bosses e Contracts, aceite e claim manuais, gold pequeno e persistencia no ledger operacional.
- Etapa 99.5 concluida: QA das Regional Campaign Orders canonizou IDs/recompensas, corrigiu datas impossiveis, adicionou historico visual e validou 100.097 assercoes.
- Etapa 100 concluida: Campaign Command Briefing leva o ciclo regional ao Character Hall, com estado derivado, atalhos seguros e badge de Operations apenas para reward pronto.
- Etapa 100.5 concluida: QA do Campaign Command Briefing corrigiu a virada local presa, sincronizou o board regional e validou 100.036 assercoes, acessibilidade e quatro viewports.
- Etapa 101 concluida: Weekly Campaign Briefing deriva metas semanais de ordens, regioes e familias, sem reward ou persistencia nova, com 100.031 assercoes.
- Etapa 101.5 concluida: QA do briefing semanal corrigiu semanas raras sem as tres familias, com meta dinamica alcancavel e 100.024 assercoes.
- Etapa 102 concluida: Weekly Campaign Archive mostra oito semanas anteriores derivadas e amplia a retencao do ledger existente.
- Etapa 102.5 concluida: QA do arquivo corrigiu a capacidade para 192 claims e impediu IDs invalidos de consumir vagas antes da validacao.
- Etapa 103 concluida: Campaign Trend Comparison compara o checkpoint atual com o mesmo dia da semana anterior e adiciona projecao e baseline historico derivados.
- Etapa 103.5 concluida: QA do Campaign Trend Comparison rejeita archives reutilizados de outra guilda/semana e valida 35.025 assercoes em 5.000 cenarios.
- Etapa 104 concluida: Campaign Performance Records deriva quatro melhores marcas e a maior sequencia secured das oito semanas locais retidas.
- Etapa 104.5 concluida: QA dos Campaign Performance Records ordena, deduplica e valida semanas antes de calcular recordes e streaks.
- Etapa 105 concluida: Regional Order Variety adiciona nove apresentacoes e 27 combinacoes deterministicas sem alterar IDs, balanceamento ou saves.
- Etapa 105.5 concluida: QA da Regional Order Variety elimina assignments repetidos na mesma familia diaria e valida compatibilidade historica.
- Etapa 106 concluida: Campaign Difficulty Bands adiciona escolhas Standard, Veteran e Elite com desbloqueio por nivel, escala de objetivo/reward e saves retrocompativeis.
- Etapa 106.5 concluida: QA das Campaign Difficulty Bands garante targets 1/2/3 em objetivos unitarios, compatibilidade da API legada e validacao ampla com 191.139 assercoes.
- Etapa 107 concluida: Campaign Reward Tiers conecta Standard, Veteran e Elite a caches pequenos de treasury e materiais entregues no Guild Depot.
- Etapa 107.5 concluida: QA dos Campaign Reward Tiers blinda o Guild Depot, impede overflow de stacks e garante claim atomico sem recompensa parcial.
- Etapa 108 concluida: Regional Reward Tables adiciona nove rotas deterministicas de materiais por regiao e objetivo, preservando snapshots antigos.
- Etapa 108.5 concluida: QA das Regional Reward Tables assina snapshots novos por regiao, bloqueia substituicoes cruzadas e identifica corretamente caches legados.
- Etapa 109 concluida: Regional Reward Compendium compara as nove rotas, usos reais dos materiais e estoque atual do Guild Depot em Operations.
- Etapa 109.5 concluida: QA do Regional Reward Compendium valida todas as tabelas e adiciona tabs ARIA com navegacao completa por teclado.
- Etapa 110 concluida: Regional Material Acquisition Planner conecta faltas reais de Logistics a rotas Veteran/Elite e estima claims necessarios.
- Etapa 110.5 concluida: QA do planner regional corrige recomendacoes bloqueadas, prioriza o proximo unlock real e tolera Guild Depot malformado.
- Etapa 111 concluida: Regional Acquisition Opportunity Board cruza faltas reais com a rotacao diaria e leva ao pedido regional exato sem aceitar automaticamente.
- Etapa 111.5 concluida: QA do board regional reforca data hostil, nomes acessiveis unicos e foco persistente por mouse, Enter e Space.
- Etapa 112 concluida: Regional Acquisition Forecast projeta sete rotacoes locais contra faltas atuais e separa caches alcancaveis dos proximos unlocks.
- Etapa 112.5 concluida: QA do forecast regional valida cinco anos de calendario, integridade das recompensas e estrutura acessivel por dia e cache.
- Etapa 113 concluida: Regional Material Rotation Schedule consolida o forecast em uma agenda por falta, com yield, cobertura, acesso e janelas locais.
- Etapa 113.5 concluida: QA da agenda regional separa cobertura acessivel de potencial bloqueado e valida cinco anos de agregacoes.

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

## Etapa 79 - Guild Armory Audit

Status: concluida.

Implementacao:

- Novo Armory guild-wide acessivel por Details e pelo menu lateral, em janela ampla que oculta os paineis auxiliares.
- Resumo derivado mostra slots equipados, lacunas, aventureiros com upgrade, equipamentos no Guild Depot e bonus de conjunto ativos.
- O roster pode ser filtrado por upgrades encontrados, equipamento incompleto ou loadout completo.
- Cada aventureiro possui leitura dos nove slots, rating derivado dos atributos aprimorados e progresso real dos equipamentos de conjunto.
- Recomendacoes usam somente equipamentos existentes no Guild Depot que passam pelas regras reais de slot, level, vocation e offhand.
- O rating considera atributos relevantes da vocation, defesa, armor, vida, mana, capacity, speed, bonus percentuais, tier e upgrade.
- Atalhos abrem Inventory do personagem inspecionado, Guild Depot e Forge; mover ou equipar continua sendo uma decisao manual.
- A selecao do personagem permanece sincronizada entre Details, Armory e Inventory.
- Nenhum campo, schema, migration ou escrita de save foi criado nesta etapa.

Validacao:

- `npm.cmd run build` passou apos a implementacao e novamente apos a correcao de sincronizacao.
- Harness temporario cruzou 41 equipamentos do catalogo com 45 slots de cinco personagens e conferiu 39 recomendacoes.
- O teste confirmou compatibilidade, maior ganho por slot, ordem deterministica, numeros finitos e ausencia de mutacao; o harness foi removido.
- QA no browser validou filtros, troca de personagem, selecao preservada e atalhos para Inventory, Guild Depot e Forge.
- Viewports de 1440, 1180, 760, 520 e 430 px ficaram sem overflow horizontal no documento ou no Armory.
- O console web mostrou apenas o fallback SQLite esperado fora do Tauri.
- `npm.cmd run tauri:build` passou com 389 modulos e gerou executavel release, MSI e NSIS.

Limitacoes mantidas:

- O Armory apenas recomenda; nao move, reserva, equipa ou aprimora itens automaticamente.
- O rating e uma heuristica de gerenciamento e nao substitui a decisao de build do jogador.
- Equipamentos em inventarios pessoais nao entram nas recomendacoes; somente o Guild Depot e auditado.
- Nao houve clique manual na janela Tauri; as interacoes foram validadas no browser e a camada desktop pelo build nativo.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 79.5 - QA aprofundada do Guild Armory Audit no Tauri/SQLite.

## Etapa 79.5 - QA do Guild Armory Audit

Status: concluida.

Correcoes reproduzidas:

- Equipamento no Guild Depot com quantidade zero, negativa, `NaN` ou infinita podia aparecer como upgrade disponivel; apenas stacks com quantidade inteira positiva entram agora na auditoria.
- `tier` ou `upgradeLevel` nao finito podia contaminar o rating com `NaN`; a pontuacao usa os mesmos valores normalizados da identidade visual.
- Level de personagem `NaN` era exibido como 0, mas podia passar no gate de equipamento alto; compatibilidade agora recebe o level normalizado.
- O filtro `Complete` sem resultados mantinha abaixo dele o loadout de um personagem fora do filtro; a area de trabalho agora mostra um estado vazio real.
- Quando `Upgrades` selecionava automaticamente outro aventureiro, Forge e Depot ainda podiam abrir para o personagem global anterior; selecao visual, global e todos os atalhos ficaram sincronizados.

Matriz automatizada:

- Harness temporario passou em 122.874 verificacoes e foi removido.
- Os 41 equipamentos do catalogo geraram 984 variantes entre Tier 0-3 e upgrade +0 a +5.
- Trinta e cinco personagens sinteticos cruzaram as cinco vocacoes com levels 0, 1, 8, 25, 50, 100 e 300.
- Cada recomendacao foi confrontada com slot, vocation, level, offhand, rating atual e melhor ganho disponivel.
- Foram testados 2.500 Guild Depots pseudoaleatorios, desempates deterministas, estados complete/incomplete/upgrade, conjunto equipado, roster vazio e depot ausente.
- Dados de entrada permaneceram imutaveis e todos os ratings/deltas permaneceram finitos e positivos quando aplicaveis.

QA visual e interativo:

- `Complete` mostrou 0/5, estado vazio dedicado e nenhuma workspace antiga.
- `Upgrades` mudou Arkon para Lyra tanto no Armory quanto na topbar global.
- Forge Workshop, Lyra Depot e Lyra Inventory abriram pelo Armory preservando a mesma selecao.
- Viewports de 1440, 1180, 960, 760, 520 e 430 px ficaram sem overflow no documento, Armory ou controles internos.
- O estado vazio compacto foi inspecionado visualmente a 430 px sem sobreposicao ou texto cortado.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 389 modulos e gerou executavel release, MSI e NSIS.
- Duas aberturas nativas finais, repetidas durante o isolamento dos dados, mantiveram `PRAGMA integrity_check: ok`.
- Permaneceram 1 guilda, 5 personagens, 35 skills, 26 stacks, quantidade total 95, quatro stacks no Guild Depot e dez logs.
- Nenhuma tabela ou coluna de Armory foi criada; o sistema continua totalmente derivado.
- Personagens, skills, inventario/equipamentos e logs ficaram semanticamente identicos entre as cargas.
- Foi identificado comportamento preexistente do autosave: timestamps de linhas sao regravados, Rank E/Level 1 normaliza para D/2 e `headquarters.totalInvestedMaterials` ausente recebe 0.
- Banco, WAL e SHM originais foram restaurados por hash em cada rodada; o estado final voltou ao save original com `integrity_check: ok` e nenhum backup temporario restante.

Limitacoes mantidas:

- O Armory nao reserva, transfere, equipa, forja ou distribui itens automaticamente.
- O rating permanece uma heuristica de gerenciamento, nao uma simulacao completa de dano por build.
- Apenas o Guild Depot oferece candidatos; equipamentos espalhados em inventarios pessoais ainda nao entram na recomendacao.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser e o SQLite por aberturas nativas controladas.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 80 - Equipment Acquisition Planner, conectando lacunas do Armory a fontes reais de Hunt, Boss e Crafting.

## Etapa 80 - Equipment Acquisition Planner

Status: concluida.

Implementacao:

- O Guild Armory ganhou uma segunda view `Acquisition Planner`, mantendo a auditoria existente intacta.
- Para cada personagem e slot, o planner escolhe o equipamento mais forte que respeita slot, level, vocation e regras de offhand.
- Equipamentos ja presentes com quantidade positiva no Guild Depot continuam sob responsabilidade do Armory Audit e nao viram meta de aquisicao.
- Equipamentos em inventario, depot pessoal ou equipados por outro aventureiro aparecem como `Guild holding`, evitando recomendar farm desnecessario.
- Fontes de Hunt usam as loot tables reais dos monstros, com chance, quantidade, acesso, level e disponibilidade do roster.
- Fontes de Boss usam loot, entry fee, cooldown, acessos, quests, vocation, tamanho da party e quantidade total de roles exigidas.
- Fontes de Crafting usam as 19 receitas reais, rank do Guild Workbench, gold e materiais disponiveis.
- As rotas abrem Inventory do portador, Hunt Assignment, Boss review ou Forge sem mover item, iniciar hunt/raid ou craftar automaticamente.
- Toda a leitura e derivada dos dados atuais; nenhum campo, schema, migration ou escrita de save foi criado.

Validacao:

- `npm.cmd run build` passou com 391 modulos.
- Harness temporario validou IDs das fontes, compatibilidade, ganho positivo, delta, exclusao do Guild Depot, imutabilidade e referencias exatas de loot/receita.
- Foram exercitadas 2.000 combinacoes de roster, level, status, acesso e gold, totalizando 55.231 verificacoes aleatorias; o harness foi removido.
- QA no browser validou troca entre Audit/Planner e rotas para Inventory, Minotaur Outpost, Grunk the Camp Breaker e Forge.
- Hunts prontas ficaram acionaveis e rotas bloqueadas ficaram desabilitadas.
- Viewports de 1440, 1180, 960, 760, 520 e 430 px ficaram sem overflow horizontal no documento, Armory, Planner ou workspace.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- SQLite local foi consultado em modo somente leitura: `integrity_check=ok`, 1 guilda e 5 personagens.

Limitacoes mantidas:

- O planner recomenda uma rota por equipamento, mas nao considera tempo esperado de farm nem calcula custo de oportunidade entre Hunt, Boss e Crafting.
- O alvo e escolhido por rating heuristico; builds especializadas ainda dependem da decisao do jogador.
- Abrir Forge nao seleciona automaticamente a aba Guild Workbench nem a receita indicada.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser, desktop pelo build nativo e SQLite em leitura somente leitura.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 80.5 - QA aprofundada do Equipment Acquisition Planner no Tauri/SQLite.

## Etapa 80.5 - QA do Equipment Acquisition Planner

Status: concluida.

Correcoes reproduzidas:

- Um save legado ou corrompido com `guildDepot.items` ausente derrubava o planner ao consultar receitas; a entrada agora e normalizada para uma lista vazia.
- Quantidades `NaN` ou infinitas no Guild Depot podiam satisfazer materiais de Crafting e marcar receitas como prontas; apenas quantidades inteiras, finitas e positivas entram na disponibilidade.
- Um Boss com party elegivel, mas sem `guild.gold` para a entry fee, aparecia como `busy`; a rota agora fica corretamente `locked` com o custo necessario.
- Um InventoryItem inconsistente, com `itemId` diferente de `item.id`, podia criar uma falsa fonte de equipamento; holdings corrompidos agora sao ignorados pelo indice.

Matriz automatizada:

- Harness temporario passou em 557.731 verificacoes e foi removido.
- As 111 referencias de Hunt, Boss e Crafting foram confrontadas com o catalogo real.
- Cada alvo foi validado como a melhoria compativel de maior rating para slot, level, vocation e offhand.
- Ordem de fontes, deltas, scores finitos, imutabilidade e referencias exatas de loot/receita foram conferidos.
- O teste confirmou que equipamento positivo no Guild Depot sai do planner e permanece no Armory Audit.
- Todas as 19 receitas foram testadas com `NaN`, infinito positivo/negativo, quantidade negativa e zero.
- Bosses foram exercitados com gold insuficiente e cooldown global; holdings com identidade divergente foram rejeitados.
- Cinco mil rosters combinaram levels, status, currentAction, acessos, quests, cooldowns, gold, data invalida e depot ausente.

QA visual e interativo:

- Armory Audit e Acquisition Planner alternaram sem perder a selecao do personagem.
- Lyra exibiu Crafting bloqueado por Workshop Rank, Hunt bloqueada por acesso e Boss para revisao.
- O atalho `Open Forge` abriu a Forge Workshop corretamente.
- Viewports de 1440, 1180, 960, 760, 520 e 430 px ficaram sem overflow no documento, Armory, Planner ou rotas.
- O layout movel em 430 px foi inspecionado sem sobreposicao ou texto cortado.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 391 modulos e gerou executavel release, MSI e NSIS.
- Duas cargas nativas controladas permaneceram estaveis e mantiveram `integrity_check=ok`.
- Permaneceram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs.
- Nenhuma tabela, coluna ou escrita nova foi criada para o planner.
- DB, WAL e SHM originais foram restaurados com hashes identicos e nenhum backup temporario restante.

Limitacoes mantidas:

- O planner continua somente leitura e nao transfere, equipa, reserva, crafta ou inicia operacoes automaticamente.
- O rating permanece uma heuristica e nao calcula tempo esperado de farm ou custo de oportunidade.
- Abrir Forge nao seleciona automaticamente Guild Workbench ou a receita indicada.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser e o save por cargas nativas controladas.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 81 - definir a proxima camada de gerenciamento offline apos o Equipment Acquisition Planner validado.

## Etapa 81 - Guild Equipment Allocation Board

Status: concluida.

Implementacao:

- O Guild Armory ganhou uma terceira view `Allocation Board`, ao lado de Armory Audit e Acquisition Planner.
- A engine transforma quantidades validas de equipamento no Guild Depot em copias finitas e cada copia pode atender no maximo um personagem.
- Um matching global de peso maximo escolhe a distribuicao que gera o maior ganho total de rating para todo o roster.
- Em empate de ganho, a engine prioriza a maior quantidade de slots melhorados e mantem resultado deterministico.
- Compatibilidade respeita slot, level, vocation, offhand, tier, upgrade e atributos aprimorados do item real.
- Nenhum personagem recebe duas recomendacoes para o mesmo slot e nenhuma stack pode exceder sua quantidade.
- O board mostra copias no Depot, alocacoes, ganho total, transferencias prontas, conflitos resolvidos e equipamentos sem destino.
- Cada personagem exibe ganho individual, itens atribuidos e capacidade livre para receber a transferencia.
- O ledger global seleciona uma ordem e abre Depot, Inventory ou Forge ja no personagem correto.
- A selecao inicial pula personagens sem alocacao e foca a primeira ordem real.
- O titulo amplo foi generalizado de `Guild Armory Audit` para `Guild Armory`.
- Nenhum item e movido, reservado, equipado ou forjado automaticamente.
- Nenhum campo, migration, tabela ou escrita de save foi criado.

Validacao:

- `npm.cmd run build` passou com 393 modulos.
- Harness temporario passou em 60.767 verificacoes e foi removido.
- Seiscentas matrizes pseudoaleatorias foram comparadas contra busca exaustiva e alcancaram o ganho global otimo.
- Cinco mil cenarios adicionais testaram levels, vocations, capacidade, inventario corrompido, quantidades 0/negativas/NaN/infinitas e depot ausente.
- Os 41 equipamentos do catalogo participaram da matriz de compatibilidade.
- Ordem invertida do Depot preservou a mesma distribuicao semantica.
- Uma copia do Brass Shield foi atribuida somente a Lyra; duas copias atenderam dois destinos sem duplicacao de slot.
- Quantidade extrema foi limitada ao numero util de slots durante o matching, sem loop proporcional ao valor corrompido.

QA visual e interativo:

- Allocation Board abriu com Lyra e a ordem real do Brass Shield sincronizadas.
- `Open Depot` abriu o Guild Depot no contexto de Lyra com o item correto disponivel.
- Armory Audit e Acquisition Planner permaneceram acessiveis nas tabs vizinhas.
- Viewports de 1440, 1180, 960, 760, 520 e 430 px ficaram sem overflow no documento, board, workspace ou ledger.
- A inspecao visual encontrou e corrigiu a sobreposicao entre o icone grande e o texto da ordem em 430 px.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Uma carga nativa controlada permaneceu estavel com `integrity_check=ok`.
- Permaneceram 1 guilda, 5 personagens, 35 skills, 26 stacks e 10 logs.
- DB, WAL e SHM originais foram restaurados com hashes identicos e nenhum backup temporario restante.

Limitacoes mantidas:

- O matching usa apenas equipamentos que ja estao no Guild Depot; holdings pessoais continuam no Acquisition Planner.
- Equipamento substituido nao entra em uma segunda rodada de redistribuicao em cascata.
- Capacidade bloqueada e informativa; o jogador ainda precisa liberar espaco e executar a transferencia manualmente.
- O rating e uma heuristica de gerenciamento e nao simula uma build completa de combate.
- Nao houve clique manual na janela Tauri; interacoes foram validadas no browser e o save por carga nativa controlada.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 81.5 - QA aprofundada do Guild Equipment Allocation Board no Tauri/SQLite.

## Etapa 81.5 - QA do Guild Equipment Allocation Board

Status: concluida como QA aprofundada e estabilizacao.

Correcao aplicada:

- Uma ordem secundaria escolhida no Allocation Ledger podia voltar silenciosamente para a primeira ordem do mesmo personagem.
- A causa era a sequencia de efeitos React que limpava e ressincronizava `selectedAllocationId` depois do clique.
- A selecao agora preserva a ordem explicita do ledger e usa a primeira alocacao apenas como fallback derivado.
- A sincronizacao inicial tambem espera existir uma alocacao antes de marcar a inicializacao como concluida, cobrindo carregamento tardio do Depot.
- Personagem sem ordem continua mostrando `No assigned item`, sem reutilizar detalhes de outro aventureiro.

QA da engine:

- Harness temporario passou em 24.039 assertions e foi removido.
- Oitocentos cenarios pseudoaleatorios foram comparados com busca exaustiva independente por slot.
- Todos os cenarios alcancaram o maior ganho global e, em empate, a maior quantidade de alocacoes.
- Os 41 equipamentos do catalogo foram exercitados contra Guardian, Ranger, Arcanist, Warden e Monk.
- Foram validados level, vocation, offhand, slot, rating aprimorado, quantidade finita, resumo, itens sem destino e capacidade.
- Entradas 0, negativas, NaN, infinitas, ausentes e quantidade extrema nao duplicaram copias nem quebraram o planner.
- Nenhum personagem recebeu duas ordens no mesmo slot e nenhuma entrada do Depot excedeu a quantidade disponivel.
- Entradas de personagens e Depot permaneceram imutaveis e o resultado repetido permaneceu deterministico.

QA visual e interativo:

- O fluxo real `Armory > Allocation Board` abriu com Lyra e Brass Shield sincronizados.
- Um cenario temporario com duas ordens para Lyra confirmou por clique que `Apprentice Robe` permanece selecionada no ledger e no quartermaster.
- Trocar para Arkon mostrou o estado vazio correto; retornar pelo ledger restaurou a ordem escolhida.
- `Open Depot` abriu o Guild Depot com Lyra selecionada e os itens esperados visiveis.
- Desktop em 1280 px e moldura real de 430 px ficaram sem overflow horizontal.
- Em 430 px, icone, descricao, status e comandos ficaram separados, sem sobreposicao.
- Dados e moldura temporarios de QA foram removidos.
- O console web mostrou apenas o fallback SQLite esperado quando o frontend roda fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 393 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O executavel release permaneceu aberto, responsivo e estavel durante a janela controlada de 8 segundos.
- Antes e depois do teste, `integrity_check=ok` confirmou 1 guilda, 5 personagens e 26 itens.
- O teste nativo abriu WAL/SHM; DB, WAL e SHM foram restaurados aos hashes SHA-256 originais.
- Nenhum backup, harness, pagina de teste ou processo de QA permaneceu no projeto.

Limitacoes mantidas:

- O Allocation Board permanece somente leitura e nao transfere ou equipa itens.
- O QA interativo foi feito no browser; a janela Tauri foi validada por carga nativa controlada, sem cliques manuais.
- O rating continua sendo uma heuristica e nao simula uma build completa de combate.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 82 - Guild Quartermaster Distribution Orders, com confirmacao explicita para transferir e equipar as ordens do Allocation Board.

## Etapa 82 - Guild Quartermaster Distribution Orders

Status: concluida.

Implementacao:

- O Allocation Board agora oferece `Execute Order` para a ordem selecionada e `Execute All Ready` para o lote transferivel.
- As duas acoes exigem confirmacao explicita e nunca executam ao apenas abrir ou selecionar uma ordem.
- A engine reconstroi o plano atual antes da execucao individual e rejeita ordem obsoleta, repetida ou alterada.
- Cada ordem transfere exatamente uma copia do Guild Depot para o personagem e equipa o item no slot indicado.
- O equipamento substituido retorna ao inventario pessoal preservando tier, upgrade, imbuements e demais dados.
- Transferencia e equipamento formam uma operacao atomica: se a troca falhar, personagens e Depot originais sao devolvidos.
- O lote usa um snapshot novo do plano, executa somente ordens marcadas como transferiveis e mantem bloqueios pendentes.
- Quantidade compartilhada continua finita; nenhuma copia ou slot pode ser aplicado duas vezes.
- Inventario, equipamento, capacity, level, vocation, offhand e ganho real sao revalidados pela engine existente.
- Saves corrompidos com inventory/equipment ausente, capacity invalida, peso invalido ou quantidade invalida sao bloqueados antes da rotina de transferencia.
- Refs no App e na UI impedem duplo clique durante a janela de processamento.
- Sucesso individual e lote geram um unico Activity Log, evitando spam por item.
- O autosave SQLite existente persiste as mudancas em `inventory_items`; nenhuma tabela, migration ou versao de save nova foi criada.

Arquivos:

- Criado `src/game-engine/equipment/executeGuildEquipmentOrder.ts`.
- Alterados `src/components/equipment/GuildEquipmentAllocationBoard.tsx`, `GuildArmoryHall.tsx`, `MainPanel.tsx`, `src/app/App.tsx` e `src/styles.css`.

QA automatizado:

- Harness temporario passou em 8.452 assertions e foi removido.
- Mil cenarios pseudoaleatorios executaram 3.427 ordens usando os 41 equipamentos do catalogo.
- A quantidade total por item foi comparada antes/depois entre Guild Depot, inventarios e equipamentos, sem perda ou duplicacao.
- Foram cobertos ordem individual, lote, lote parcial, substituicao, item anterior devolvido, ordem repetida, ordem obsoleta e IDs duplicados.
- Uma falha posterior a transferencia por capacity de backpack confirmou rollback integral e referencias originais.
- Inventario com quantidade NaN foi bloqueado sem tocar no Depot no smoke final apos as defesas adicionais.

QA visual e interativo:

- Cancelar a confirmacao preservou a ordem e o Depot.
- Confirmar Brass Shield removeu a copia do Depot, equipou Lyra e elevou o resumo de 12/45 para 13/45.
- Um cenario temporario de lote equipou Brass Shield e Apprentice Robe, elevou o resumo para 14/45 e criou um unico log.
- Apos executar, o Allocation Board recalculou para zero ordens sem permitir um segundo claim da mesma copia.
- Desktop em 1280 px e moldura de 430 px ficaram sem overflow horizontal.
- Em 430 px, comandos, texto de confirmacao e botoes Cancel/Confirm permaneceram separados e legiveis.
- O console desktop mostrou apenas o fallback SQLite esperado fora do Tauri.
- O iframe temporario de responsividade gerou um erro interno de MutationObserver da instrumentacao; ele nao ocorreu na pagina principal e nao existe uso de MutationObserver no projeto.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 394 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O executavel final permaneceu aberto, responsivo e estavel durante 8 segundos.
- `integrity_check=ok` confirmou 1 guilda, 5 personagens, 35 skills, 26 itens e 10 logs antes da carga.
- DB, WAL e SHM foram restaurados aos hashes SHA-256 originais; a verificacao final manteve 5 personagens e 26 itens.
- Nenhum harness, pagina, backup, listener Vite ou processo Tauri permaneceu.

Limitacoes atuais:

- A execucao usa apenas ordens derivadas de itens atualmente no Guild Depot.
- Ordens bloqueadas por capacity exigem liberar espaco e recalcular o board.
- O lote nao redistribui automaticamente o equipamento substituido para outro personagem.
- Nao existe fila persistente, agendamento, custo, tempo de entrega ou automacao offline.
- O QA interativo foi feito no browser; a janela Tauri foi validada por carga nativa controlada, sem cliques manuais.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 82.5 - QA aprofundada das Quartermaster Distribution Orders no Tauri/SQLite.

## Etapa 82.5 - QA das Quartermaster Distribution Orders no Tauri/SQLite

Status: concluida com tres correcoes funcionais.

Correcoes reproduzidas:

- Um equipamento ja vestido com quantidade `NaN`, infinita, fracionaria, zero ou diferente de uma unidade podia retornar ao inventario durante a troca e contaminar `capacityUsed`; a engine agora valida todos os slots equipados antes de transferir.
- Um roster corrompido com entrada `null`, `undefined` ou id vazio podia lancar excecao durante a reconstrucao do plano; execucao individual e em lote agora bloqueiam o estado sem mutar personagens ou Depot.
- Ao concluir a ultima ordem, o feedback de sucesso era desmontado junto da workspace; a mensagem agora permanece visivel no estado vazio do Allocation Board.

QA da engine e persistencia:

- Harness temporario passou em 17.893 assertions e foi removido.
- Dois mil cenarios pseudoaleatorios executaram 7.853 ordens e bloquearam 36 operacoes invalidas usando os 41 equipamentos do catalogo.
- Conservacao por item foi conferida entre Guild Depot, inventarios e equipamentos; inputs permaneceram imutaveis e os totais de lote ficaram coerentes.
- Foram cobertos equipamento vestido corrompido, inventory/equipment ausente, capacity e peso invalidos, stacks corrompidas, roster invalido e request nulo.
- Uma troca com Brass Shield aprimorado passou pelo `saveGameState` em banco simulado: a nova peca foi gravada como `equipped`, Wooden Shield voltou para `character_inventory` e nenhum id foi duplicado.
- O round-trip por `mapInventoryItem` preservou tier 2, upgrade +3 e imbuement com 11 hunts restantes.

QA visual e interativo:

- Cancelar a confirmacao preservou a ordem, o Depot e o resumo `1/1`.
- Confirmar removeu Brass Shield do Depot, equipou Lyra, elevou o resumo para 13/45 e criou um unico Activity Log.
- Apos a execucao, o board recalculou para zero ordens e nao permitiu reutilizar a mesma copia.
- Em 430x900, board e documento permaneceram sem overflow horizontal; confirmacao, Cancel e Confirm ficaram inteiros e acessiveis.
- O console web mostrou apenas o fallback SQLite esperado quando o frontend roda fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 394 modulos antes e depois das correcoes.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O executavel final permaneceu aberto e responsivo durante a carga controlada de 8 segundos.
- `PRAGMA integrity_check` retornou `ok`; permaneceram 1 guilda, 5 personagens, 35 skills, 26 itens e 10 logs.
- DB, WAL e SHM foram restaurados aos hashes originais; o banco principal voltou ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes mantidas:

- Ordens continuam restritas a equipamentos existentes no Guild Depot e nao redistribuem em cascata a peca substituida.
- Nao existe fila persistente, agendamento, custo, tempo de entrega ou automacao offline.
- O QA interativo ocorreu no browser; a janela Tauri foi validada por carga nativa controlada, sem cliques manuais.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 83 - Guild Loadout Templates, para salvar metas de equipamento por personagem e encaminhar diferencas ao Quartermaster sem auto-equip.

## Etapa 83 - Guild Loadout Templates

Status: concluida.

Implementacao:

- O Guild Armory ganhou a quarta view `Loadout Templates`, ao lado de Audit, Acquisition Planner e Allocation Board.
- Cada aventureiro possui tres slots independentes e nomeaveis de template.
- `Save Current Loadout` captura somente equipamentos validos atualmente vestidos; slots vazios permanecem fora da meta.
- Cada alvo preserva itemId, slot, tier minimo e upgrade minimo sem copiar ids de instancia ou imbuements temporarios.
- A revisao compara os nove slots e classifica cada alvo como equipado, Guild Depot, holding pessoal, outro aventureiro, ausente ou incompatível.
- Uma diferenca disponivel no Guild Depot habilita `Review Quartermaster`, que seleciona o personagem e abre o Allocation Board existente sem transferir ou equipar automaticamente.
- Inventory, Guild Depot e Forge continuam acessiveis como rotas manuais do personagem inspecionado.
- Salvar e limpar geram um unico Activity Log e possuem bloqueio contra clique duplo.

Save/load e compatibilidade:

- `Guild` ganhou `loadoutTemplates?: GuildLoadoutTemplatesState`.
- SQLite ganhou a coluna aditiva `loadout_templates_json`, com default `{}` para saves antigos.
- A normalizacao remove personagem inexistente, slot de template desconhecido, item ausente, slot incompatível, targets duplicados e timestamps invalidos.
- Nomes sao compactados para 28 caracteres; tier e upgrade usam os limites reais 0-3 e 0-5.
- O mapper, repository, mock inicial e migration foram atualizados; nenhum inventario ou equipamento e regravado pelo template.

Validacao automatizada:

- Harness temporario passou em 10.141 assertions e foi removido.
- Dois mil saves pseudoaleatorios cobriram personagens orfaos, slots invalidos, items ausentes, nomes, timestamps, tiers, upgrades e imutabilidade.
- Os quinze slots simultaneos de cinco personagens permaneceram independentes e sem colisao.
- Captura, sobrescrita, limpeza idempotente e bloqueio de personagem sem equipamento passaram.
- A revisao confirmou as cinco fontes reais: equipado, Guild Depot, holding pessoal, outro aventureiro e ausente.
- O round-trip pelo `saveGameState` e `mapGuild` preservou nome, personagem, targets e aprimoramentos minimos.

QA visual e interativo:

- Arkon salvou `Starter Guard` e `Hunt Guard` em slots separados; trocar para Lyra manteve a selecao global sincronizada.
- Limpar Loadout II preservou Loadout I e criou um unico log.
- Wooden Shield foi removido, enviado ao Guild Depot e mudou de `Equipped` para `Guild Depot` no template salvo.
- `Review Quartermaster` abriu Allocation Board com Arkon selecionado e Wooden Shield como ordem real.
- Em 430x900, documento e board permaneceram sem overflow horizontal e nenhum elemento de texto medido excedeu o container.
- O console web mostrou apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 399 modulos.
- O primeiro rebuild Rust encontrou bloqueios temporarios do Windows Application Control em build-scripts recem-gerados; apos a liberacao dos executaveis locais, `npm.cmd run tauri:build` passou e gerou EXE, MSI e NSIS.
- A primeira carga nativa adicionou `loadout_templates_json` ao banco legado e persistiu `{ "templates": [] }`.
- Uma fixture com duplicata, personagem orfao, entrada null, item/slot invalido, timestamp ruim e tier/upgrade extremos normalizou para um unico `Native Guard`.
- Duas cargas nativas preservaram `loadout-two`, Arkon, Worn Sword, tier 3, upgrade +5 e timestamp epoch com `integrity_check=ok`.
- Permaneceram 1 guilda, 5 personagens, 35 skills, 26 itens e 10 logs.
- DB, WAL e SHM originais foram restaurados byte a byte; o banco principal voltou ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes atuais:

- Templates capturam snapshots do equipamento vestido; ainda nao existe editor de item desejado a partir do catalogo.
- `Review Quartermaster` abre a distribuicao real atual, mas nao reserva a peca nem força uma alocacao que deixe de ser a melhor melhoria global.
- Targets nao incluem imbuements, pois cargas restantes sao temporarias; apenas item, tier e upgrade minimo formam a meta.
- Nao existe troca automatica de build, fila, custo, cooldown, compartilhamento online ou automacao offline.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 83.5 - QA aprofundada dos Guild Loadout Templates no Tauri/SQLite.

## Etapa 83.5 - QA dos Guild Loadout Templates no Tauri/SQLite

Status: concluida com duas correcoes funcionais e um reforco defensivo.

Correcoes reproduzidas:

- A captura aceitava um objeto de equipamento aparentemente valido mesmo quando `itemId` nao existia no catalogo ou a quantidade era zero/invalida; a normalizacao removia o alvo depois e a operacao podia registrar um template vazio como sucesso.
- O resumo `Saved plans` contava os templates da guilda inteira, fazendo outro aventureiro aparentar possuir planos que pertenciam ao personagem anterior.
- A limpeza reutilizava o roster bruto ao procurar o nome do personagem; entradas `null`, objetos sem id ou ids vazios agora sao descartados antes da normalizacao e da mensagem.

Implementacao da correcao:

- `getGuildLoadoutCaptureTargets` centraliza a validacao usada pela engine e pelo estado disabled do botao.
- Cada peca capturada precisa existir em `items`, coincidir por id e slot com o catalogo e objeto carregado, ser equipamento e possuir exatamente uma unidade inteira.
- Slots corrompidos sao ignorados; se nenhum slot valido permanecer, salvar e bloqueado sem criar template.
- Tier e upgrade continuam normalizados pelos limites reais 0-3 e 0-5.
- O resumo agora exibe `0/3` a `3/3` somente para o aventureiro selecionado.

QA automatizado:

- Harness temporario passou em 8.048 assertions e foi removido.
- Dois mil cenarios pseudoaleatorios cobriram tier, upgrade, nome, timestamp e slots independentes.
- Os quinze templates simultaneos de cinco personagens permaneceram isolados; sobrescrita nao duplicou e limpeza repetida foi idempotente.
- Foram cobertos roster com `null`/objeto vazio, personagem inexistente, data invalida, equipamento vazio, itemId ausente, quantidade zero/NaN e captura parcialmente valida.
- A revisao confirmou as cinco origens reais: equipado, Guild Depot, holding pessoal, outro aventureiro e ausente.
- O insert simulado manteve 27 valores alinhados e o round-trip por `saveGameState`/`mapGuild` preservou todos os templates.

QA visual e interativo:

- Arkon salvou `QA Vanguard` com clique duplo, resultando em um template, tres targets e um unico Activity Log.
- Ayla salvou `Ranger Field Set` no Loadout III; trocar entre os dois personagens exibiu contagens independentes.
- Limpar Arkon com clique duplo removeu somente seu Loadout I e gerou um unico log de limpeza.
- Em 430x900 e 1366x768, documento e board ficaram sem overflow horizontal e nenhum texto medido excedeu o container.
- Cards, editor, rotas e os nove slots permaneceram legiveis no layout compacto.
- O console web exibiu apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 399 modulos antes e depois das correcoes.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado e persistiu `{ "templates": [] }`.
- Uma fixture com seis entradas incluiu duplicata, personagem orfao, slot/item invalido, `null`, timestamp ruim, espacos repetidos e limites extremos.
- Duas cargas nativas produziram o mesmo SHA-256 `D6DB9891C1E0C91339F09592BE113A4D66D35DB5F22B3CA8B17235CC1B8732D4` para o JSON canonico com Arkon/Loadout I e Ayla/Loadout III.
- As duas cargas ficaram responsivas e mantiveram `integrity_check=ok`, 5 personagens, 26 itens e 10 logs.
- DB, WAL e SHM originais foram restaurados aos hashes exatos; o banco principal voltou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes mantidas:

- Templates ainda capturam snapshots do equipamento vestido; o editor manual de itens desejados fica para a proxima etapa.
- Targets nao incluem imbuements temporarios e nao reservam, movem, forjam ou equipam itens.
- `Review Quartermaster` abre o Allocation Board real, mas nao obriga a ordem global a escolher a peca exata do template.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 84 - Editor Avancado de Loadouts, com selecao manual de itens do catalogo, tier/upgrade minimo e fontes reais.

## Etapa 84 - Editor Avancado de Loadouts

Status: concluida.

Implementacao:

- Cada um dos tres templates por personagem ganhou um editor manual com os nove slots reais de equipamento.
- Busca e filtros permitem consultar todos os 41 equipamentos do catalogo por nome, raridade e familia.
- Itens prontos para uso, metas futuras bloqueadas apenas por level e incompatibilidades permanentes recebem estados distintos.
- Conflitos de vocacao, slot e offhand permanecem visiveis com o motivo, mas nao podem ser aplicados.
- O jogador pode definir tier minimo de 0 a 3 e upgrade minimo de 0 a 5, remover targets e sobrescrever atomicamente o plano existente.
- O nome do template pode ser alterado no proprio editor; salvar vazio, duplicar slot ou enviar item invalido continua bloqueado pela engine.

Fontes e integracoes:

- O dossier de cada item mostra holdings atuais no Guild Depot, inventario, depot pessoal ou equipamento vestido.
- Hunts exibem criaturas, chance de drop e estado de acesso; Bosses exibem cidade, custo, cooldown e prontidao.
- Crafting reutiliza disponibilidade, materiais e facility reais da bancada.
- O Offline Bazaar mostra a rotacao atual ou a elegibilidade deterministica para futuras rotacoes de dez minutos.
- A revisao do template aceita metas futuras por level e continua distinguindo equipado, Guild Depot, holding pessoal, outro personagem e ausente.
- Targets permanecem planejamento puro: nao compram, movem, reservam, forjam ou equipam itens.

Engine e save:

- `buildGuildLoadoutEditorCatalog` centraliza compatibilidade, catalogo e fontes reais de aquisicao.
- `saveEditedGuildLoadoutTemplate` valida personagem, slot, item, compatibilidade, limites e timestamp antes de sobrescrever um unico template.
- O save continua usando `loadout_templates_json`; nenhuma migration, tabela ou coluna nova foi adicionada.
- Saves antigos, JSON ausente e templates anteriores continuam normalizados pelo fluxo existente.

QA automatizado:

- Harness temporario passou em 8.076 assertions e foi removido.
- Todos os 41 equipamentos foram avaliados para os cinco personagens, cobrindo estados pronto, futuro e incompativel.
- As cinco familias de fonte foram exercitadas: holding, Hunt, Boss, Crafting e Offline Bazaar.
- Os quinze slots de template dos cinco personagens foram salvos e sobrescritos sem duplicacao ou mutacao da guilda de entrada.
- Dois mil cenarios pseudoaleatorios cobriram targets compativeis, tier, upgrade, nome, timestamp e isolamento entre personagens.
- Casos vazios, slot divergente, duplicado, personagem ausente, data invalida, NaN e infinito foram bloqueados ou normalizados.
- O round-trip simulado por `saveGameState`/`mapGuild` preservou os templates editados.

QA visual e interativo:

- Arkon recebeu um plano `Endgame Vanguard` com Ember Blade T3/+5 e Dragonscale Armor como metas futuras.
- Aplicar, remover, reaplicar, renomear e salvar com clique duplo produziram somente uma atualizacao e um Activity Log.
- Para Ayla, Wooden Shield permaneceu visivel em `Show All`, desabilitado com a regra de quiver da vocacao Ranger.
- O editor ficou sem overflow horizontal ou texto fora do container em 1366x768, 760x900 e 430x900.
- Slots, busca, filtros, catalogo, dossier, fontes e steppers permaneceram acessiveis no viewport mobile.
- O console web exibiu apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 400 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Uma fixture com targets futuros, slot divergente, duplicata, personagem orfao e entrada nula foi normalizada.
- Duas cargas nativas produziram o mesmo SHA-256 `F38941CC085154FCCACE4176938D3A2267F705D41B9BAB8A45EF3F3D5A6B037F` para o JSON canonico.
- As duas cargas ficaram responsivas e mantiveram `integrity_check=ok`, 5 personagens, 26 itens e 10 logs.
- O banco legado original e seus sidecars foram restaurados aos hashes exatos; o DB principal voltou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes mantidas:

- Imbuements temporarios nao fazem parte dos targets.
- O editor nao simula dano final, set completo ou resultado de combate.
- `Review Quartermaster` continua abrindo o Allocation Board global e nao garante a selecao automatica da copia exata planejada.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 84.5 - QA aprofundada do Editor Avancado de Loadouts no Tauri/SQLite.

## Etapa 84.5 - QA do Editor Avancado de Loadouts no Tauri/SQLite

Status: concluida com quatro correcoes funcionais e defensivas.

Correcoes reproduzidas:

- Uma fonte de Boss podia aparecer como `Ready` quando apenas um aventureiro atendia os requisitos, mesmo para raids de party com minimo de tres membros.
- Cooldown ativo e party parcialmente ocupada nao participavam da leitura do editor; a fonte podia prometer prontidao diferente da operacao real.
- Uma oferta atual do Offline Bazaar aparecia como pronta enquanto a guilda nao possuia gold suficiente para compra-la.
- Template vazio mostrava `Arkon Loadout` ou equivalente no input, mas enviava uma string vazia e persistia outro fallback; alem disso, a UI fechava o editor mesmo se a engine bloqueasse o save.

Implementacao das correcoes:

- Fontes de Boss agora verificam level, access, quests, vocation, cooldown, estado idle, current action, tamanho minimo de party, contagem de roles e custo de entrada.
- O dossier diferencia party pronta, aventureiros ocupados, cooldown, requisitos de elegibilidade e gold insuficiente.
- Ofertas atuais do Bazaar exigem preco acessivel e ausencia de `purchasedAt`; ofertas futuras continuam identificadas apenas como elegiveis para rotacao.
- Level `NaN` e normalizado antes da checagem de equipamento e nao consegue ignorar level requirement.
- O nome padrao visivel passa a ser o valor real enviado ao save e acompanha a troca de personagem.
- O callback de save editado retorna sucesso; operacoes bloqueadas mantem o editor aberto para correcao.
- Roster da UI e review descartam entradas sem id valido antes de procurar holdings ou renderizar personagens.

QA automatizado:

- Harness temporario passou em 40.667 assertions e foi removido.
- Todos os 41 equipamentos foram avaliados para os cinco personagens, sem ids duplicados, slots divergentes ou fontes ausentes.
- Foram cobertas party completa, party insuficiente, membros ocupados, cooldown ativo e gold insuficiente para Ember Matriarch.
- Bazaar atual foi validado nos limites de gold abaixo, igual ao preco e com oferta ja comprada.
- Roster com `null`, objeto vazio e id vazio nao quebrou catalogo ou review.
- Level `NaN` nao tornou nenhum equipamento com requisito de level imediatamente compativel.
- Dez mil saves pseudoaleatorios validaram isolamento, imutabilidade, deduplicacao e limites T0-T3/+0-+5.
- Planos vazios, slot duplicado, personagem inexistente, data invalida e incompatibilidade permanente permaneceram bloqueados.

QA visual e interativo:

- Um template vazio de Arkon exibiu e persistiu exatamente `Arkon Loadout`.
- Aplicar Wooden Club e salvar com clique duplo criou um template, um target e somente um Activity Log.
- Trocar para Ayla atualizou imediatamente o input para `Ayla Loadout`.
- Em `Show All`, Wooden Shield e Brass Shield permaneceram visiveis, desabilitados e com a regra de quiver da Ranger.
- O editor ficou sem overflow horizontal ou filhos fora do container em 1366x768, 760x900 e 430x900.
- Slots, filtros, itens desabilitados, dossier, steppers, fontes e comandos permaneceram legiveis no mobile.
- O console mostrou somente as duas tentativas esperadas do fallback SQLite do React Strict Mode fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 400 modulos antes e depois das correcoes.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado e persistiu `{ "templates": [] }`.
- A fixture incluiu metas futuras, limites extremos, target duplicado, slot divergente, template duplicado, personagem orfao, data invalida e entrada nula.
- Duas cargas nativas produziram o mesmo SHA-256 `1CC0C1DBEDBEC6DB5667217332EAAF1E0752E987D5249BF19CCF3C50C1FB1D2D` para o JSON canonico.
- As duas cargas ficaram responsivas e mantiveram `integrity_check=ok`, 5 personagens, 26 itens e 10 logs.
- DB, WAL e SHM originais foram restaurados aos hashes exatos; o banco principal voltou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes mantidas:

- A prontidao de Boss indica que existe quantidade suficiente de aventureiros elegiveis; a composicao final de roles continua sendo escolhida no Raid Board.
- O editor permanece planejamento puro e nao compra, reserva, move, forja ou equipa itens.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 85 - definir a proxima camada de gerenciamento offline apos o Editor Avancado de Loadouts validado.

## Etapa 85 - Active Loadout Assignments

Status: concluida.

Implementacao:

- Cada aventureiro pode ativar exatamente um dos tres templates salvos que possua ao menos um target.
- Ativar outro plano substitui o anterior atomicamente; desativar ou limpar o template ativo remove o assignment.
- Sobrescrever um template ativo preserva o assignment, o nome novo e seus targets atualizados.
- O painel `Active Loadout Command` cobre o roster inteiro com plano, progresso, targets equipados, Guild Depot, holdings e itens ausentes.
- Estados distintos identificam `Ready`, `Quartermaster`, `Inventory Transfer`, `Source Items`, `Plan Invalid` e `Inactive`.
- Comandos contextuais abrem Inventory, Acquisition Planner ou Quartermaster existentes; nenhuma rota executa compra, transferencia ou equipamento.

Engine e save:

- `GuildLoadoutTemplatesState` ganhou `activeAssignments`, com `characterId`, `templateId` e `assignedAt`.
- `normalizeGuildLoadoutTemplatesState` remove assignments nulos, duplicados, orfaos, sem template correspondente ou com slot invalido.
- Datas invalidas sao normalizadas para epoch, enquanto saves antigos recebem `activeAssignments: []`.
- O dashboard reutiliza a revisao real de holdings e compatibilidade dos templates, sem duplicar regras de equipamento.
- A persistencia continua em `loadout_templates_json`; nenhuma migration, tabela ou coluna nova foi adicionada.

QA automatizado:

- Harness temporario passou em 20.039 assertions e foi removido.
- Cinco mil cenarios pseudoaleatorios validaram ativacao, troca, desativacao, deduplicacao, isolamento entre personagens e imutabilidade.
- Os seis estados do dashboard foram exercitados com equipamento vestido, Guild Depot, inventario pessoal, item ausente, target incompatível e personagem inativo.
- O harness encontrou uma regressao real: salvar ou editar um template apagava `activeAssignments`; ambos os fluxos agora preservam os assignments.

QA visual e interativo:

- Arkon salvou o equipamento atual, ativou o plano e apareceu como `Ready` com 3/3 targets.
- Sobrescrever o plano manteve `/ Active`, 1/1 ready e o comando `Deactivate Plan`.
- Clique duplo em desativar gerou uma unica transicao e um unico novo Activity Log; reativacao tambem funcionou.
- O dashboard ficou sem overflow horizontal em 1366x768, 760x900 e 430x900, com cinco cards acessiveis.
- O console web exibiu apenas as duas tentativas esperadas do fallback SQLite fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 401 modulos e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado para `{ "templates": [], "activeAssignments": [] }`.
- Uma fixture com assignments duplicados, orfao, nulo, data invalida e template inexistente foi normalizada para um assignment valido.
- Duas cargas nativas consecutivas preservaram o resultado com `integrity_check=ok`.
- DB, WAL e SHM originais foram restaurados aos hashes exatos; o banco principal voltou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado.

Limitacoes mantidas:

- Assignments sao objetivos manuais e nao reservam, compram, transferem, forjam ou equipam itens.
- Imbuements temporarios continuam fora dos targets.
- O Quartermaster abre o Allocation Board global sem preselecionar uma copia exata.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 85.5 - QA aprofundada dos Active Loadout Assignments no Tauri/SQLite.

## Etapa 85.5 - QA dos Active Loadout Assignments no Tauri/SQLite

Status: concluida com duas correcoes funcionais.

Falhas reproduzidas:

- Target incompativel era somado em `Missing`, fazendo o dashboard misturar item ausente com plano estruturalmente invalido.
- O comando `Edit Plan` de um card invalido apenas selecionava personagem/template; o editor prometido nao era aberto.

Correcoes:

- A revisao agora separa `missing` e `invalid`, e ambos os resumos exibem contadores independentes.
- O dashboard usa o novo total `invalid` para classificar `Plan Invalid` sem inflar itens ausentes.
- `Edit Plan` guarda a rota pendente, troca para o personagem e template corretos e abre diretamente o editor no primeiro slot do plano.
- Corrigir e salvar um target invalido preserva o assignment ativo e recalcula imediatamente a prontidao.

QA automatizado:

- Harness temporario passou em 85.097 assertions e foi removido.
- Vinte mil operacoes pseudoaleatorias cobriram ativacao, substituicao, desativacao, bloqueios, imutabilidade e um assignment por personagem.
- Os quinze templates dos cinco aventureiros permaneceram intactos durante todas as sequencias.
- Round-trip JSON canonico, templates duplicados, entries nulas, personagem orfao e timestamps invalidos foram validados.
- Mudanca de equipamento depois da ativacao atualizou o plano de `Ready` para `Source Items` sem alterar o assignment.
- Target incompativel confirmou `Invalid 1 / Missing 0`; item realmente ausente confirmou `Missing 1 / Invalid 0`.

QA visual e interativo:

- Um fixture antigo carregou Ayla com Wooden Shield incompativel e exibiu `Plan Invalid`, `Invalid 1` e `Missing 0`.
- `Edit Plan` trocou de Arkon para Ayla, selecionou Loadout I e abriu o editor diretamente em Offhand.
- Substituir por Light Quiver e salvar com clique duplo produziu um unico log, manteve `/ Active` e mudou o dashboard para `Ready 1/1`.
- O painel e seus seis indicadores ficaram sem overflow horizontal em 1366x768, 1024x768, 760x900, 520x900 e 430x900.
- O console exibiu apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run tauri:build` passou com 401 modulos e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado com `activeAssignments`.
- Fixture com dois templates, assignment duplicado, personagem orfao, entry nula e data invalida foi normalizada.
- Duas cargas nativas medidas preservaram dois templates e dois assignments com o mesmo SHA-256 canonico `8559A8615FE788E7D2FF4F8119233FDBF8D01E6E3BD9B22C3F8616FE877B4F94`.
- O timestamp ruim de Ayla virou `1970-01-01T00:00:00.000Z` e ambas as cargas mantiveram `integrity_check=ok`.
- DB, WAL e SHM originais foram restaurados aos hashes exatos; o DB principal voltou a `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado.

Limitacoes mantidas:

- Assignments continuam manuais e nao compram, transferem, forjam, reservam ou equipam itens.
- Imbuements temporarios continuam fora dos targets.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 86 - definir a proxima camada de gerenciamento offline apos os Active Loadout Assignments validados.

## Etapa 86 - Guild Loadout Procurement Board

Status: concluida.

Implementacao:

- O Guild Armory ganhou uma quinta aba que consolida todos os targets ainda nao atendidos dos loadouts ativos.
- Cada objetivo aparece exatamente uma vez na rota manual recomendada, com personagem, plano, slot, tier/upgrade desejado e rotas alternativas.
- Guild Depot abre o Quartermaster; holdings pessoais abrem Inventory; fontes externas abrem Hunt, Boss, Forge/Workbench ou Offline Bazaar.
- A recomendacao prioriza operacoes disponiveis agora, cobertura de mais targets e uma ordem estavel entre os sistemas.
- Filtros separam rotas prontas, holdings, Hunts, Bosses, Crafting, Bazaar e bloqueios.
- Plans completos, targets invalidos e fontes desconhecidas possuem estados explicitos e comandos de correcao.

Engine e save:

- `buildGuildLoadoutProcurementBoard` reutiliza o dashboard de assignments e o catalogo real do editor para evitar regras paralelas.
- Fontes de Hunt, Boss e Crafting agora carregam seus IDs reais para abrir exatamente a operacao recomendada.
- O board agrupa uma mesma operacao quando ela avanca varios targets e calcula cobertura, prontidao e resumo sem mutar guilda, roster ou depot.
- Nenhuma tabela, coluna ou propriedade persistente foi adicionada; todo o Procurement Board e derivado do save existente.
- Nenhuma rota compra, farma, fabrica, transfere, forja ou equipa automaticamente.

QA automatizado:

- Harness temporario passou em 40.028 assertions e foi removido.
- Cinco mil cenarios pseudoaleatorios validaram imutabilidade, IDs unicos, fallback de rotas, recomendacoes validas e particionamento exato dos objetivos.
- Foram cobertos planos vazios, completos, Guild Depot, holdings pessoais, Hunt, Boss, Crafting, Bazaar, target invalido e fonte desconhecida.
- O filtro `Blocked` foi corrigido durante a QA para incluir tambem rotas conhecidas que ainda nao estao disponiveis.

QA visual e interativo:

- Fixture com quatro targets distribuidos entre Quartermaster, holding pessoal, Crafting e plano invalido produziu quatro rotas e dois comandos prontos.
- Filtros `Holdings` e `Blocked` exibiram somente as operacoes correspondentes.
- Os comandos abriram Allocation Board, Loadout Editor no personagem/target invalido e Forge Workshop corretos.
- O painel ficou sem overflow horizontal ou filhos fora do container em 1366x768, 1024x768, 760x900, 520x900 e 430x900.
- O console mostrou somente o fallback SQLite esperado ao executar o frontend fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 403 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- Duas cargas nativas consecutivas mantiveram o banco principal no SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- DB, WAL e SHM originais foram restaurados aos hashes exatos apos a validacao.

Limitacoes mantidas:

- O jogador ainda confirma cada transferencia, compra, hunt, boss, craft, forge e troca de equipamento no sistema de origem.
- Rotas bloqueadas explicam o destino, mas requisitos detalhados continuam sendo revisados na tela especializada.
- Imbuements temporarios permanecem fora dos targets de loadout.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por duas cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 86.5 - QA aprofundada do Guild Loadout Procurement Board no Tauri/SQLite.

## Etapa 86.5 - QA do Guild Loadout Procurement Board no Tauri/SQLite

Status: concluida com duas correcoes funcionais e uma correcao de integracao.

Falhas reproduzidas:

- Um roster corrompido com o mesmo `characterId` repetido duplicava plano ativo, targets, objetivos e contadores do Procurement Board.
- Uma Hunt podia ser marcada como pronta por outro aventureiro, mas a rota nao registrava qual personagem justificava a disponibilidade.
- A primeira ligacao do novo ator elegivel foi aplicada ao Acquisition Planner durante a QA; o build TypeScript bloqueou a regressao antes do commit.

Correcoes:

- O builder agora deduplica o roster por ID antes de montar dashboard, catalogos, objetivos e operacoes.
- Fontes de Hunt carregam `actorCharacterId` junto do `targetId` exato.
- O botao `Open Hunt` exige Hunt valida, rota pronta e ator elegivel.
- O Guild Armory seleciona o ator indicado antes de abrir o assignment, preservando o personagem dono do loadout apenas como objetivo.
- A ligacao equivocada foi removida do Acquisition Planner e aplicada somente ao Procurement Board.

QA automatizado:

- Harness temporario passou em 91.117 assertions e foi removido.
- Cinco mil cenarios pseudoaleatorios combinaram equipamento vestido, Inventory, Guild Depot, holding de outro aventureiro e fonte externa.
- Foram validados imutabilidade, contadores, IDs unicos, particionamento exato por rota, fallback, recomendacao pertencente aos candidatos e operacoes prontas.
- Roster duplicado confirmou um plano, um target e um objetivo, sem inflar os totais.
- Hunt pronta com personagem alvo ocupado confirmou `actorCharacterId` apontando para o helper idle e elegivel.

QA visual e interativo:

- Arkon manteve o plano de Training Axe enquanto Minotaur Outpost foi recomendada pela disponibilidade real de Lyra.
- `Open Hunt` selecionou Lyra e abriu diretamente o assignment de Minotaur Outpost.
- Os filtros `Holdings` e `Ready` alternaram corretamente entre empty state e a rota disponivel.
- O board ficou sem overflow horizontal ou botoes truncados em 1366x768, 1024x768, 760x900, 520x900 e 430x900.
- O console mostrou apenas as duas tentativas esperadas do fallback SQLite fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 403 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A carga inicial migrou o banco legado para incluir `loadout_templates_json`.
- A fixture persistida continha template duplicado, assignment duplicado, personagem orfao, entradas nulas, data invalida e tier/upgrade nao validos.
- Duas cargas nativas medidas normalizaram e preservaram dois templates e dois assignments com SHA-256 canonico `5AD5D6E9544E11B933C87D5A1700E690267ADED1780F7B26843CA6D131BBC71`.
- Ambas as cargas mantiveram `integrity_check=ok`.
- O banco original foi restaurado ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado sem `loadout_templates_json`.

Limitacoes mantidas:

- O Procurement Board continua derivado e nao persiste estado proprio.
- Hunts, Bosses, compras, crafts, transferencias, Forge e equipamento permanecem manuais.
- O ator de Hunt representa a disponibilidade no instante em que o board foi calculado; o sistema de Hunt revalida o roster ao abrir.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 87 - definir a proxima camada de gerenciamento offline apos o Procurement Board validado.

## Etapa 87 - Guild Loadout Procurement Orders

Status: concluida.

Implementacao:

- O Procurement Board ganhou um ledger persistente com ate cinco targets prioritarios.
- Cada ordem guarda aventureiro, template ativo, slot, item e timestamp, sem duplicar dados de rota que podem mudar.
- Targets pendentes podem ser adicionados pela rota selecionada; ordens podem subir, descer, abrir a rota atual ou ser removidas.
- O status e recalculado ao vivo: target equipado aparece como concluido e permanece no ledger ate revisao manual.
- `View Route` abre a operacao recomendada atual, acompanhando mudancas de holdings, disponibilidade e requisitos.
- Clique duplo e ordens duplicadas sao bloqueados; a sexta prioridade nao entra.

Engine e save:

- `GuildLoadoutTemplatesState` ganhou `procurementOrders`, persistido no `loadout_templates_json` ja existente.
- Saves antigos recebem `procurementOrders: []` sem tabela, coluna ou migration adicional.
- A normalizacao exige personagem valido, template ativo, slot real e item identico ao target salvo.
- Duplicatas, orfaos, planos inativos, item divergente, slot invalido e entradas nulas sao removidos.
- Editar, substituir, desativar ou apagar um plano saneia automaticamente suas ordens obsoletas.
- A ordem do array e preservada e limitada aos cinco primeiros registros validos.

QA automatizado:

- Harness temporario passou em 800.027 assertions e foi removido.
- Dez mil cenarios pseudoaleatorios executaram 200 mil operacoes de add, remove, move-up e move-down.
- Foram validados limite de cinco, ordem exata, imutabilidade, deduplicacao, boundaries, timestamp invalido e clique repetido.
- Editar target, desativar assignment e limpar template removeram as prioridades correspondentes.
- Save legado e JSON corrompido normalizaram para estados canonicos seguros.

QA visual e interativo:

- A fixture abriu com Training Axe enfileirada e Brass Shield disponivel no Guild Depot.
- Brass Shield entrou como segunda prioridade, subiu para o primeiro lugar e manteve a numeracao correta.
- `View Route` da Training Axe selecionou Minotaur Outpost no dossier.
- Clique duplo em remover Training Axe produziu uma unica remocao e preservou Brass Shield.
- Botoes ja enfileirados ficaram disabled e o contador acompanhou `1/5` e `2/5`.
- Board e ledger ficaram sem overflow horizontal ou botoes truncados em 1366x768, 1024x768, 760x900, 520x900 e 430x900.
- O console exibiu apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 404 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado e adicionou o JSON de loadouts.
- Fixture persistida cobriu tres ordens validas, duplicata, item divergente, plano inativo, personagem orfao e entrada nula.
- Duas cargas nativas preservaram tres prioridades na ordem exata com SHA-256 canonico `52E00376734F19AAB4ADF6561DE20DE59CD2068A1E81DEDCD5FC6A7869DA85EF`.
- Ambas mantiveram `integrity_check=ok`.
- O banco original foi restaurado ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado.

Limitacoes mantidas:

- Procurement Orders sao prioridades de planejamento e nao reservam itens.
- Nenhuma ordem inicia Hunt/Boss, compra, craft, transferencia, Forge ou equipamento.
- Target concluido exige remocao manual para preservar a revisao do jogador.
- Somente targets do loadout ativo podem permanecer na fila.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 87.5 - QA aprofundada dos Guild Loadout Procurement Orders no Tauri/SQLite.

## Etapa 87.5 - QA dos Guild Loadout Procurement Orders no Tauri/SQLite

Status: concluida.

Correcoes:

- Acoes de remover, subir e descer agora exigem aventureiro, template, slot e `itemId` identicos a ordem persistida.
- Uma requisicao obsoleta do mesmo slot nao pode mais remover ou reordenar o novo target.
- A engine passou a receber o Guild Depot e revisar o loadout real antes de adicionar uma prioridade.
- Target que ja atende o plano equipado nao pode ser enfileirado como novo pedido.
- Uma ordem que foi cumprida depois de entrar na fila continua visivel ate a revisao e remocao manual, como planejado.

QA automatizado:

- Harness temporario passou em 80.020 assertions e foi removido.
- Vinte mil reordenacoes pseudoaleatorias preservaram cinco identidades unicas, tamanho da fila, membership e imutabilidade.
- Foram validados item obsoleto, target equipado, target pendente no Guild Depot, limite de cinco e remocao dupla.
- JSON hostil removeu template/assignment orfao, duplicatas, item divergente e timestamps invalidos.
- Editar target, desativar assignment e limpar template removeram ordens obsoletas.

QA visual e interativo:

- A fixture abriu com Leather Armor cumprida, Training Axe em Hunt e Brass Shield disponivel no Guild Depot.
- Brass Shield entrou como terceira prioridade e Training Axe desceu mantendo a numeracao correta.
- `View Route` selecionou Minotaur Outpost.
- Clique duplo removeu Brass Shield uma unica vez e atualizou o contador de `3/5` para `2/5`.
- O target cumprido permaneceu revisavel e nao ofereceu novo botao de queue.
- O board ficou sem overflow horizontal em 1366x900, 1024x900, 760x900, 520x900 e 430x900.
- O console mostrou somente o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 404 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado e criou `loadout_templates_json`.
- A fixture persistida continha cinco ordens: duas validas, uma duplicada, uma com item divergente e uma de personagem orfao.
- Duas cargas nativas preservaram exatamente duas prioridades com SHA-256 canonico `6B5BC22B54832D7AA10B3EACDC907BAF68E088835F5F5C8F5096F3BE9C435C3C`.
- As cargas mantiveram `integrity_check=ok`.
- O banco original foi restaurado byte a byte ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado.

Limitacoes mantidas:

- Procurement Orders continuam sendo prioridades manuais e nao reservam itens.
- Nenhuma ordem inicia Hunt/Boss, compra, craft, transferencia, Forge ou equipamento.
- Target cumprido exige remocao manual para preservar a revisao do jogador.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 88 - definir a proxima camada de gerenciamento offline apos as Procurement Orders validadas.

## Etapa 88 - Procurement Readiness Alerts

Status: concluida.

Implementacao:

- Cada Procurement Order ganhou status derivado ao vivo: `fulfilled`, `available`, `sourcing` ou `blocked`.
- `fulfilled` exige o target exato equipado com tier e upgrade minimos.
- `available` exige copia exata no Guild Depot, holding pessoal ou outro aventureiro.
- `sourcing` mantem a rota manual de Hunt, Boss, Crafting ou Offline Bazaar.
- `blocked` identifica plano/target que precisa de revisao.
- Ordens disponiveis ou cumpridas geram badge numerico na aba Procurement Board.
- O ledger destaca ordens nao lidas e mostra estado e rota atual na mesma linha.
- `Mark Reviewed` limpa apenas os nao lidos; a ordem continua na fila ate remocao manual.
- Cada transicao pronta gera um unico Activity Log consolidado.
- Alertas de Logistics e Procurement sao sincronizados no mesmo efeito para nao perder estado nem duplicar logs no carregamento.
- Se a copia deixa de estar disponivel, a memoria pronta e liberada para permitir novo alerta em uma futura transicao real.

Engine e save:

- `GuildLoadoutTemplatesState` ganhou `procurementAlerts` com `notifiedReadyKeys` e `unreadReadyKeys`.
- As chaves usam aventureiro, template, slot e item exatos; nenhuma rota ou snapshot de inventario e persistido.
- Saves antigos recebem arrays vazios dentro do `loadout_templates_json` existente, sem nova coluna ou tabela.
- Normalizacao remove chave vazia, duplicada, de ordem inexistente e unread que nao pertence aos notified.
- Editar, desativar, limpar template ou remover ordem elimina alertas orfaos.
- Um bug encontrado no QA foi corrigido: remover uma ordem agora normaliza seus alertas no mesmo clique, sem esperar o proximo sync.

QA automatizado:

- Harness temporario passou em 60.023 assertions e foi removido.
- Vinte mil ciclos estaveis confirmaram idempotencia, referencia preservada e ausencia de notificacao repetida.
- Leather Armor equipada gerou `fulfilled`, Brass Shield no Guild Depot gerou `available` e Training Axe ausente permaneceu `sourcing`.
- Reconhecimento preservou a memoria de notificacao; repetir reconhecimento nao mutou o estado.
- Remover Brass Shield do Depot liberou sua chave sem falso alerta; devolver a copia gerou exatamente um novo aviso.
- Remover a ordem limpou badge e memoria atomicamente.
- JSON hostil com duplicatas, orfaos, numeros e `null` preservou somente a chave valida.

QA visual e interativo:

- A aba abriu com badge `2`, ledger `3/5 queued / 2 unread` e painel de dois alertas.
- Leather Armor exibiu `Target fulfilled`, Brass Shield `Ready for review` e Training Axe `Acquisition required`.
- `Mark Reviewed` alterou o contador para zero, removeu badge/painel e criou um unico log.
- O alerta nao reapareceu durante o estado estavel.
- Interface, badge, ledger e botao ficaram sem overflow ou texto cortado em 1366x900, 1024x900, 760x900, 520x900 e 430x900.
- O console mostrou apenas o fallback SQLite esperado fora do Tauri.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 406 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- A primeira carga nativa migrou o banco legado e persistiu o default de `procurementAlerts`.
- Fixture hostil incluiu chaves duplicadas, orfa, numerica e unread repetido.
- Duas cargas nativas preservaram duas ordens e exatamente duas chaves validas com SHA-256 canonico `4692D743B0CA2BD3668CD917B73EEFBE4DDC33D26C959A0C65D652EF8BFF115C`.
- Ambas mantiveram `integrity_check=ok`.
- O banco original foi restaurado byte a byte ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado.

Limitacoes atuais:

- Alertas observam somente Procurement Orders existentes e nao criam prioridades automaticamente.
- Nenhum alerta compra, transfere, equipa, forja, inicia Hunt/Boss ou reserva item.
- `Mark Reviewed` nao conclui nem remove a ordem.
- O QA interativo ocorreu no browser; o executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 88.5 - QA aprofundada dos Procurement Readiness Alerts no Tauri/SQLite.

## Etapa 88.5 - QA dos Procurement Readiness Alerts

Status: concluida.

Correcao aplicada:

- `getGuildLoadoutProcurementUnreadCount` normaliza o estado antes de calcular o badge.
- `acknowledgeGuildLoadoutProcurementAlerts` normaliza arrays, chaves e referencias antes de limpar os nao lidos.
- Valores hostis como string no lugar de array, numeros, duplicatas e chaves orfas nao vazam para a interface nem quebram `Mark Reviewed`.
- O reconhecimento continua idempotente quando nao existe alerta valido.

QA automatizado:

- Harness temporario passou em 90.027 assertions e foi removido.
- Quinze mil transicoes alternaram Brass Shield ausente/presente no Guild Depot.
- Cada regressao liberou a memoria sem falso alerta e cada retorno gerou exatamente um novo aviso.
- Dez mil ciclos estaveis preservaram referencia, fila e memoria sem duplicacao.
- Roster duplicado nao inflou tracker, badge ou ordens.
- Remover ordem, editar plano, desativar assignment e limpar template podaram alertas orfaos.
- Estados `fulfilled`, `available` e `sourcing` permaneceram coerentes para Leather Armor, Brass Shield e Training Axe.

QA visual:

- A primeira carga local abriu o Guild Armory e a Procurement Board sem erro de renderizacao.
- A recarga da fixture foi bloqueada pela politica interna de URLs do navegador de QA.
- Por isso, clique duplo, remocao de ordem nao lida e a matriz de cinco viewports nao foram revalidados interativamente nesta etapa.
- Esses fluxos permanecem cobertos pelo harness de engine; a validacao responsiva completa da Etapa 88 continua como referencia visual mais recente.

QA Tauri/SQLite:

- `npm.cmd run build` passou com 406 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O executavel migrou o banco legado antes da injecao controlada.
- JSON hostil com colecoes de tipo incorreto, duplicatas, orfaos e numero foi normalizado para arrays vazios seguros.
- Duas cargas nativas produziram JSON canonico identico, SHA-256 `F2CA650FA27FF5BD0158C4FA11ED41031BC6E947FAD2FA56985DDF472CA43C06`.
- O SQLite manteve `integrity_check=ok`.
- O banco original foi restaurado byte a byte ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5` e ao schema legado.

Limitacoes atuais:

- Alertas continuam informativos e nao automatizam compra, transferencia, equipamento, Forge, Hunt ou Boss.
- O executavel Tauri foi validado por cargas nativas controladas, sem QA manual por cliques na janela desktop.
- A matriz responsiva nao foi repetida por causa do bloqueio do navegador local nesta rodada.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 89 - definir a proxima camada de gerenciamento offline apos o ciclo de loadouts e procurement validado.

## Etapa 89 - Procurement Item Reservations

Status: concluida.

Implementacao:

- Cada Procurement Order pode reservar manualmente uma copia exata ja disponivel no Guild Depot.
- A reserva exige item de equipamento compativel com itemId, slot, tier e upgrade minimos do target.
- Somente copia root, guild-owned, destravada, com quantidade unitaria e identidade valida pode ser reservada.
- Uma copia nao pode atender duas ordens e uma ordem nao pode manter duas reservas.
- O ledger mostra contador `reserved`, destaque visual, estado `Reserved in Guild Depot` e comandos `Reserve`/`Release`.
- A reserva nao transfere, equipa, compra, forja, vende ou inicia atividade.

Protecoes:

- Reservar aplica o `locked` persistente ja usado pelo inventario.
- Market, Quick Sell e Salvage respeitam o lock existente.
- O Market nao permite destravar manualmente uma copia enquanto a reserva estiver ativa.
- Retirada manual do Guild Depot e distribuicao pelo Quartermaster bloqueiam a copia reservada.
- `Execute All` ignora equipamentos reservados e continua processando somente ordens livres.
- Carregar uma reserva valida com lock ausente restaura a protecao no estado do Depot.

Lifecycle e save:

- `GuildLoadoutTemplatesState` ganhou `procurementReservations`.
- Cada registro guarda aventureiro, template, slot, item, inventoryItemId exato e timestamp.
- O estado usa o `loadout_templates_json` existente; nao foi criada tabela ou coluna nova.
- Saves antigos recebem `procurementReservations: []`.
- Normalizacao remove registros invalidos, duplicados, orfaos, sem ordem ativa ou que reutilizam a mesma copia.
- Remover ordem, editar/limpar template ou desativar assignment poda a reserva e destrava a copia no mesmo fluxo.
- Inventory `locked` continua persistido pela coluna existente da tabela `inventory_items`.

QA executado:

- Harnesses temporarios passaram em 30.047 assertions e foram removidos.
- Cinco mil ciclos completos de Reserve/Release preservaram uma reserva, um lock e nenhuma duplicacao.
- Foram validados item correto, item ausente, lock previo, item nested, quantidade invalida, timestamp invalido e JSON hostil.
- Quick Sell/Market e Salvage bloquearam a copia reservada.
- Remocao de ordem, edicao, desativacao e limpeza de template liberaram reserva e lock.
- Quartermaster individual e em lote preservou o item excluido.
- Renderizacao React estatica confirmou contador `0 reserved`/`1 reserved`, comandos Reserve/Release e estado protegido.
- `npm.cmd run build` passou com 407 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O aviso conhecido do bundle JavaScript acima de 500 kB permanece.

Limitacoes desta validacao:

- A politica interna do navegador local impediu repetir a matriz responsiva por cliques nesta sessao.
- O Windows Application Control bloqueou a abertura do executavel release apos o build.
- O teste de round-trip nativo foi interrompido antes da fixture; o banco original foi restaurado byte a byte ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.
- Persistencia foi validada por tipos, normalizacao, harness, build web e build Tauri, mas nao por reload SQLite executado nesta etapa.

Proximo passo sugerido:

- Etapa 89.5 - QA interativo e SQLite das Procurement Item Reservations quando as politicas locais permitirem executar as superficies.

## Etapa 89.5 - QA das Procurement Item Reservations

Status: concluida.

Correcoes aplicadas:

- Uma copia reservada ainda aparecia como disponivel para outro plano ativo que buscava o mesmo item.
- O Active Loadout Dashboard e o Procurement Board agora devolvem a copia reservada somente ao aventureiro/template exatos da reserva.
- Planos concorrentes voltam para `sourcing` e deixam de anunciar rota Quartermaster pronta quando nao existe outra copia livre.
- O Quartermaster montava o plano com todas as pecas e descartava reservas somente depois da otimizacao.
- Isso podia ocultar uma segunda copia livre quando a copia reservada recebia a alocacao preferida.
- Allocation, Acquisition e Quartermaster agora filtram reservas antes de calcular as recomendacoes.
- Com duas copias equivalentes, uma reservada e outra livre, a livre continua elegivel e a reservada permanece intocada.

QA automatizado:

- Harness temporario passou em 60.035 assertions e foi removido.
- Dez mil ciclos concorridos preservaram um plano owner em `quartermaster` e um plano concorrente em `sourcing`.
- Tracker manteve exatamente uma ordem `available` e uma `sourcing`.
- Procurement Board removeu a rota Quartermaster pronta do pedido concorrente.
- Allocation Board vazio ignorou a unica copia reservada.
- Com uma segunda copia livre, Allocation e Quartermaster individual/em lote usaram somente a alternativa.
- Market, Quick Sell e Salvage continuaram bloqueando a copia reservada.
- Normalizacao removeu colisao por ordem, colisao por inventoryItemId, identity vazia e registro invalido.
- Release com inventoryItemId obsoleto nao alterou guilda ou depot.
- Remover a ordem limpou a reserva e liberou o lock no mesmo fluxo.
- Renderizacao React estatica confirmou contador, estado reservado, `Release` e motivo do `Reserve` desabilitado.

QA build e Tauri/SQLite:

- `npm.cmd run build` passou com 407 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O executavel Tauri abriu com sucesso nesta rodada.
- A fixture nativa persistiu um Brass Shield reservado com o lock adulterado para zero.
- A primeira carga restaurou o lock para `1`; a segunda preservou JSON e lock sem nova mutacao.
- Duas cargas produziram estado canonico identico com SHA-256 `D92C4FBFE816A72CE594B03AF571E3A1404306E9B95A097F544EAE7F1B7750ED`.
- O SQLite manteve `integrity_check=ok`.
- O banco original foi restaurado byte a byte ao SHA-256 `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes:

- O navegador local permaneceu indisponivel pela politica de URLs registrada na etapa anterior; a UI foi validada por renderizacao React estatica, nao por cliques responsivos.
- O executavel Tauri foi validado por cargas nativas controladas, sem cliques manuais na janela.
- Reservas continuam manuais e nao equipam, transferem, compram, forjam ou iniciam atividades.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 90 - definir a proxima camada offline apos concluir o ciclo de planejamento, procurement e reservas de loadout.

## Etapa 90 - Reserved Gear Fulfillment

Status: concluida.

Implementacao:

- O Procurement Ledger ganhou a acao explicita `Issue Gear` apenas para ordens com uma copia reservada.
- A acao abre uma confirmacao compacta e nao transfere nada ao abrir, fechar ou revisar o painel.
- O fulfillment valida a ordem, reserva, template ativo, alvo, personagem e identidade exata da copia no Guild Depot.
- A copia precisa continuar locked, no root do Guild Depot, sem owner, com quantidade um e atendendo tier/upgrade minimos.
- A transferencia reutiliza as regras reais de capacidade e o equipamento reutiliza as regras reais de level, vocation e slot.
- A peca anteriormente equipada volta ao inventario do mesmo personagem.
- Ordem e reserva sao removidas somente depois que transferencia e equipamento terminam com sucesso.
- Qualquer falha devolve guilda, roster e depot originais; nao existe estado intermediario parcialmente aplicado.
- Uma trava curta no App evita duas confirmacoes processadas no mesmo intervalo.
- O Activity Log registra sucesso ou motivo do bloqueio.

QA automatizado:

- Harness temporario passou em 50.024 assertions e foi removido.
- Dez mil ciclos entregaram e equiparam exatamente o Brass Shield reservado.
- Foram validados retorno da peca anterior, consumo da copia do depot e remocao da ordem/reserva.
- A segunda tentativa da mesma requisicao foi bloqueada sem alterar referencias.
- Capacidade insuficiente, lock adulterado, inventory identity duplicada e request malformada fizeram rollback integral.
- Renderizacao React estatica confirmou a acao `Issue Gear` e o aviso de protecao da reserva.

Build e validacao nativa:

- `npm.cmd run build` passou com 408 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e NSIS.
- O executavel release abriu em uma carga controlada de seis segundos.
- O SQLite manteve `integrity_check=ok`, nenhuma violacao de foreign key e SHA-256 inalterado em `AA6A4EAF46CE7DC4D75D63BD673E9D1E4CAD0B2BC709B8674914E79C177305C5`.

Limitacoes:

- A confirmacao foi validada por renderizacao React estatica, nao por clique manual na janela Tauri.
- O fulfillment e estritamente manual e nao escolhe alternativa, compra, forja, inicia atividade ou entrega equipamento sem reserva.
- A entrega processa uma ordem por vez.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 90.5 - QA interativo e de persistencia do Reserved Gear Fulfillment.

## Etapa 90.5 - QA do Reserved Gear Fulfillment

Status: concluida.

Fluxo interativo validado:

- No cliente web local, Lyra recebeu um template com Brass Shield no slot Offhand.
- O plano foi ativado, o alvo entrou na Procurement Queue e uma copia exata do Guild Depot foi reservada.
- `Issue Gear` abriu a confirmacao sem alterar equipamento, ordem ou reserva.
- `Cancel` fechou a confirmacao e manteve a reserva protegida.
- A confirmacao final foi acionada com clique duplo e produziu somente uma entrega.
- O Procurement Board terminou em `1/1 plans complete`, `0/5 queued`, `0 reserved` e `0 unread`.
- O Character Hall mostrou Brass Shield equipado em Lyra.
- O Activity Log mostrou uma unica entrada `Reserved gear issued`.
- A captura visual confirmou o estado completo sem sobreposicao ou overflow aparente.
- O console web registrou apenas o fallback esperado do SQLite fora do runtime Tauri.

Correcoes defensivas:

- Fulfillment agora bloqueia `capacityMax`, pesos, quantidades ou estruturas de inventario/equipamento invalidas.
- IDs de itens pertencentes ao personagem precisam ser unicos antes da entrega.
- A identidade gerada pela transferencia e conferida contra inventario, character depot e equipamento existentes.
- Colisao de ID bloqueia a operacao com rollback integral, evitando duplicidade no save SQLite.

QA automatizado:

- Harness temporario passou em 90.035 assertions e foi removido.
- Dez mil ciclos validos equiparam a copia exata, consumiram o item do depot e removeram ordem/reserva.
- Dez mil repeticoes foram bloqueadas sem mutar guilda, roster ou depot.
- Foram cobertos capacidade `NaN`/negativa, peso `NaN`, quantidade equipada invalida, identidade duplicada e colisao do ID transferido.

Tauri e SQLite:

- `npm.cmd run build` passou com 408 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Uma fixture concluida persistiu Brass Shield equipado em Lyra, sem copia no Guild Depot e sem ordem/reserva.
- Duas cargas nativas produziram estado canonico identico com SHA-256 `7C184548EE56ACE7147821B0947992B0DA74FDA8871B020A1C89C1E674F9FA72`.
- As duas cargas mantiveram `integrity_check=ok` e nenhuma violacao de foreign key.
- O save original foi restaurado byte a byte ao SHA-256 `0B989893FE64D8F0E16EF871887817B1B0D75874B3384C18946EE876FC1F31D3`.
- Uma carga final com o executavel corrigido manteve esse mesmo SHA e a integridade do banco.

Limitacoes:

- O clique interativo foi feito no cliente web com mock local; o Tauri foi validado por cargas nativas controladas.
- Nao existe entrega em lote, escolha automatica de alternativa ou fulfillment sem reserva.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 91 - definir a proxima camada offline apos fechar o ciclo de loadout, procurement, reserva e entrega.

## Etapa 91 - Armory Fulfillment Ledger

Status: concluida.

Implementacao:

- Cada `Issue Gear` concluido cria um registro historico no mesmo commit atomico da entrega.
- O registro preserva aventureiro, template, slot, item, inventoryItemId exato, equipamento substituido e horario.
- O historico guarda snapshots dos nomes para continuar legivel se o personagem ou template forem removidos depois.
- O Procurement Board ganhou `Recent Gear Issues`, com ate seis registros visiveis e contador de retencao.
- Cada linha mostra item, aventureiro, slot, template, contexto da substituicao e data local.
- O ledger permanece visivel quando a fila fica vazia e o plano aparece como completo.
- O sistema retém os 30 registros validos mais recentes.

Normalizacao e save:

- `GuildLoadoutTemplatesState` ganhou `fulfillmentHistory`.
- O array usa o `loadout_templates_json` existente; nenhuma tabela, coluna ou migration nova foi criada.
- Saves antigos recebem `fulfillmentHistory: []`.
- IDs de registro e inventoryItemId duplicados sao removidos.
- Timestamp, template slot, equipment slot e campos de identidade vazios ou invalidos sao descartados.
- Limpar/editar template, desativar assignment ou remover personagem nao apaga o historico valido.
- Fulfillment bloqueado ou repetido nao cria registro.

QA automatizado:

- Harness temporario passou em 60.025 assertions e foi removido.
- Dez mil ciclos criaram um registro canonico junto da entrega.
- A retencao variou de zero a 31 entradas e permaneceu limitada aos 30 registros mais recentes.
- Todos os ciclos mantiveram IDs de registro e inventoryItemId unicos.
- Repeticao bloqueada nao adicionou historico.
- Limpeza do template e roster vazio preservaram o registro historico.
- JSON hostil com duplicatas, timestamp invalido, slot invalido, `null` e numero manteve somente a entrada valida.
- Renderizacao React estatica confirmou titulo, item, substituicao e contador.

QA visual:

- O fluxo real criou um template de Brass Shield para Lyra, ativou, enfileirou, reservou e emitiu a peca.
- O board final mostrou `1/30 retained`, Lyra, Offhand, Lyra Loadout e Brass Shield.
- O ledger permaneceu acima da fila vazia enquanto o plano mostrava `1/1 plans complete`.
- A captura visual nao apresentou sobreposicao ou overflow aparente.
- O console web mostrou somente o fallback SQLite esperado fora do Tauri.

Tauri e SQLite:

- `npm.cmd run build` passou com 408 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Uma fixture com 35 registros validos, colisao de inventoryItemId e timestamp invalido normalizou para 30 entradas.
- A primeira entrada retida foi `history-5` e a ultima `history-34`.
- Duas cargas nativas produziram o mesmo SHA-256 canonico `9D460CB64829AFA44EE3ACAC5AABF438B0F1C26785F3A4D61A0FC33E03861AA4`.
- Ambas mantiveram `integrity_check=ok` e nenhuma violacao de foreign key.
- O save original foi restaurado byte a byte ao SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O ledger e somente leitura; nao desfaz equipamento nem devolve itens.
- Nao concede gold, XP, bonus ou recompensa.
- Nao executa fulfillment em lote nem escolhe alternativas.
- O clique interativo ocorreu no cliente web; o Tauri foi validado por cargas nativas controladas.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 91.5 - QA aprofundada do Armory Fulfillment Ledger.

## Etapa 91.5 - QA do Armory Fulfillment Ledger

Status: concluida.

Correcoes aplicadas:

- Registros historicos dependiam do item continuar presente no catalogo atual.
- Uma futura remocao ou substituicao de item apagaria silenciosamente entregas antigas.
- O normalizador agora preserva itemId e nomes historicos validos mesmo sem definicao atual no catalogo.
- Equipamentos substituidos aposentados tambem permanecem legiveis pelo snapshot.
- Se a definicao atual existe, o slot continua sendo validado; uma arma conhecida nao pode aparecer como substituicao de Offhand.
- Itens historicos sem catalogo recebem icone fallback com iniciais e label propria, em vez de parecer slot vazio.
- Procurement Orders passou a aparecer antes do historico, mantendo o trabalho ativo como primeira prioridade.
- Em telas estreitas, horario passa para uma linha propria dentro do registro e nao comprime o nome do item.

QA automatizado:

- Harness temporario passou em 60.016 assertions e foi removido.
- Dez mil ciclos hostis combinaram registro valido, item aposentado, colisao de ID, colisao de inventoryItemId e timestamp invalido.
- Cada ciclo preservou exatamente o registro valido e o aposentado.
- Snapshots de item e substituicao aposentados permaneceram intactos.
- Substituicao conhecida em slot divergente foi removida sem apagar o registro principal.
- Ledger cheio continuou limitado aos 30 registros mais recentes.
- Renderizacao React confirmou fila antes do historico, apenas seis entradas visiveis, ordem mais recente primeiro e fallback `RS`.

QA visual:

- O fluxo real de Lyra foi repetido ate a entrega do Brass Shield.
- Procurement Orders apareceu antes de Recent Gear Issues.
- O ledger mostrou `1/30 retained` e o plano permaneceu `1/1 plans complete`.
- A captura final nao apresentou sobreposicao ou overflow aparente.
- Nenhum erro inesperado apareceu no console; somente o fallback SQLite esperado fora do Tauri.

Tauri e SQLite:

- `npm.cmd run build` passou com 408 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Fixture nativa incluiu item/substituicao aposentados, substituicao conhecida no slot errado, colisao de inventoryItemId e timestamp invalido.
- Duas cargas preservaram `Retired Shield` e `Retired Buckler`.
- As cargas removeram `Worn Sword` como substituicao invalida de Offhand.
- Ambas produziram SHA-256 canonico `F56002395DC1642DF8BCAFB3B632AA7EFB6EC57A416095B03D289747C31A57DA`.
- SQLite manteve `integrity_check=ok` e nenhuma violacao de foreign key.
- O save original foi restaurado byte a byte ao SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes mantidas:

- O ledger continua somente leitura e sem rewards.
- O catalogo aposentado usa snapshot textual e iniciais, sem reconstruir stats antigos.
- O clique interativo ocorreu no cliente web; Tauri foi validado por cargas nativas controladas.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 92 - definir a proxima camada offline apos o ledger de entregas validado.

## Etapa 92 - Reserved Gear Batch Dispatch

Status: concluida.

Implementacao:

- Novo engine `fulfillGuildLoadoutProcurementBatch` recebe de uma a cinco reservas exatas.
- O lote rejeita ordem duplicada, copia reservada duplicada, request invalida, timestamp invalido, lote vazio e lote acima do limite da fila.
- Cada entrega reutiliza integralmente o fulfillment individual ja validado.
- As entregas rodam sobre estado intermediario puro; se qualquer peca falhar, guilda, personagens e depot originais retornam sem entrega parcial.
- Um lote valido transfere e equipa todas as pecas, remove ordens/reservas e grava um registro individual no Fulfillment Ledger para cada item.
- O mesmo lock de interface protege despacho individual e em lote contra clique duplo.
- O Activity Log recebe uma unica mensagem consolidada por lote para evitar spam.

UI:

- `Review Dispatch (N)` aparece somente quando existem pelo menos duas reservas na fila.
- A revisao lista aventureiro, slot, item e ID da copia exata antes da confirmacao.
- O aviso deixa explicito que o despacho e all-or-nothing.
- `Issue All Reserved` e uma acao manual; abrir a revisao nao transfere nem equipa nada.
- O dialogo usa portal no `document.body` para permanecer centralizado fora dos ancestrais transformados do client.
- A emissao individual continua disponivel para cada ordem.

QA automatizado:

- Harness temporario passou em 80.021 assertions e foi removido.
- Dez mil ciclos alternaram sucesso de duas pecas e falha tardia na segunda reserva.
- Sucesso equipou weapon e armor, esvaziou as duas reservas/ordens, removeu as copias do depot e criou dois registros.
- Falha tardia devolveu exatamente as referencias originais e nao deixou equipamento, historico ou remocao parcial.
- Duplicatas, lote vazio, lote com seis entradas e data invalida foram bloqueados.
- Inputs permaneceram imutaveis no caminho de sucesso.

QA visual:

- Fixture temporaria com Iron Longsword e Leather Armor reservados para Ayla foi removida apos o teste.
- Desktop 1280x720 centralizou o dialogo em `x=370`, largura 540, sem overflow horizontal.
- Viewport 390x844 manteve o dialogo em 339x273, inteiro e com os dois comandos acessiveis.
- A confirmacao fechou o dialogo, removeu a fila e mostrou os dois registros em Recent Gear Issues.

Tauri e SQLite:

- `npm.cmd run build` passou com 409 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Duas cargas de `loadout_templates_json` preservaram os dois registros do lote.
- Uma linha legada sem `loadout_templates_json` recebeu defaults seguros.
- O banco real permaneceu com `integrity_check=ok` e zero violacoes de foreign key.
- A leitura foi nao destrutiva; SHA-256 permaneceu `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O jogador ainda escolhe e reserva cada copia individualmente antes de despachar o lote.
- O lote nao busca alternativas, nao compra, nao forja e nao seleciona equipamento automaticamente.
- O historico continua limitado aos 30 registros mais recentes e grava uma entrada por peca.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 92.5 - QA aprofundada do Reserved Gear Batch Dispatch.

## Etapa 92.5 - QA do Reserved Gear Batch Dispatch

Status: concluida.

Riscos encontrados e corrigidos:

- O dialogo guardava apenas um booleano e reconstruia a lista com o estado mais recente.
- Uma mudanca externa entre revisao e confirmacao poderia trocar silenciosamente as pecas mostradas ao jogador.
- A revisao agora congela copias dos requests, ordens, nomes e itens exatamente no momento em que e aberta.
- Se uma reserva congelada ficar obsoleta, a engine cancela o lote inteiro em vez de emitir uma lista diferente.
- Confirmacao individual e coletiva podiam coexistir no estado do componente.
- Abrir uma delas agora fecha explicitamente a outra.
- O dialogo coletivo agora recebe foco inicial seguro no botao Cancel.
- `Escape` fecha a revisao e restaura o overflow anterior do `document.body`.
- Enquanto aberto, o dialogo bloqueia o scroll de fundo.
- Falhas da engine agora identificam a posicao exata: `item N of total`.

QA automatizado:

- Harness temporario passou em 75.022 assertions e foi removido.
- Dez mil ciclos alternaram lote maximo valido de cinco pecas e falha tardia na quarta peca.
- O lote maximo cobriu Weapon, Offhand, Helmet, Armor e Legs.
- Um historico com 29 entradas terminou limitado a 30 e preservou os cinco novos registros na ordem.
- As cinco copias exatas foram equipadas e todas as ordens/reservas foram removidas no sucesso.
- Falha na quarta peca devolveu exatamente guilda, roster e depot originais.
- Remover a terceira reserva de uma lista revisada cancelou em `item 3 of 5` sem entrega parcial.
- Roster duplicado, request `null`, ordem duplicada e inventoryItemId repetido foram bloqueados.
- Inputs permaneceram imutaveis em sucesso e rollback.

QA visual:

- `Cancel` recebeu foco automatico ao abrir o dialogo.
- `Escape` removeu o dialogo e restaurou `body.style.overflow`.
- A troca de Issue Gear individual para Review Dispatch deixou um unico dialogo ativo.
- Desktop 1280x720 manteve o modal em 540px, centralizado em `x=370`, sem overflow horizontal.
- Viewport 390x844 manteve o modal inteiro em 354x284 e os dois comandos acessiveis.
- O backdrop impediu a alteracao de reservas por controles atras do dialogo.
- A fixture visual temporaria foi removida integralmente.

Tauri e SQLite:

- `npm.cmd run build` passou com 409 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Copia isolada do banco recebeu 25 registros antigos e cinco registros do lote maximo.
- Duas leituras preservaram 30 registros, fila vazia e as cinco entregas finais na ordem.
- As duas leituras produziram SHA-256 canonico `632621EF847A3A19F4635775C19943E0D753A7E191E3D215767CA76F4883E88B`.
- A copia manteve `integrity_check=ok` e zero violacoes de foreign key.
- O save real permaneceu somente leitura e preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes mantidas:

- O dialogo nao implementa focus trap completo; foco inicial e Escape estao cobertos.
- Alteracao externa durante o modal foi validada na engine; a UI impede cliques atras do backdrop.
- O lote continua estritamente manual e nao reserva, compra, forja ou escolhe alternativas.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 93 - definir a proxima camada offline apos o ciclo completo de planejamento e despacho do arsenal.

## Etapa 93 - Squad Gear Readiness

Status: concluida.

Conceito:

- Nova camada offline conecta Guild Squads, Deployment Orders e Active Loadout Assignments.
- Cada formacao mostra se seus membros possuem planos ativos e se os targets estao realmente equipados.
- O sistema e totalmente derivado do save atual e nao cria uma segunda fonte de verdade.
- Nenhuma acao equipa item, transfere equipamento, reserva copia ou inicia operacao.

Engine:

- Novo `buildGuildSquadGearReadiness` normaliza roster, squads, deployment orders, loadouts e depot.
- Os tres slots de squad sempre sao representados, inclusive locked e empty.
- Status de membro: `ready`, `incomplete`, `unplanned` e `invalid`.
- Status de formacao: `locked`, `empty`, `ready`, `partial`, `unplanned` e `invalid`.
- Progresso agrega membros planejados, membros prontos, targets atribuidos e targets equipados.
- Deployment Orders ligados ao squad mostram tipo e nome real do Boss/Contract.
- Personagens duplicados, IDs vazios, membros aposentados e depot invalido sao descartados/normalizados sem quebrar a tela.

UI:

- Guild Armory ganhou a aba `Squad Readiness`.
- Resumo mostra formations, gear ready, members planned, targets equipped e overall readiness.
- Tres tabs compactas representam as companhias desbloqueadas/bloqueadas.
- Dossie da formacao mostra progresso, ordens ligadas, membros, roles, plano ativo e proxima acao.
- `Inspect` abre o plano do membro pronto.
- `Plan Loadout` abre Loadout Templates no aventureiro correto.
- `Open Procurement` abre o Procurement Board no aventureiro correto.
- `Open Guild Squads` navega para Operations.
- A navegacao do Armory foi ajustada de cinco para seis colunas no desktop e tres colunas em largura intermediaria.

QA automatizado:

- Harness temporario passou em 120.018 assertions e foi removido.
- Dez mil derivacoes hostis validaram a matriz Ready/Incomplete/Invalid/Unplanned.
- Squad principal agregou quatro targets, dois equipados e 50% de conclusao.
- Formacao sem plano ficou `unplanned`; slot vazio ficou `empty`; guild level baixo bloqueou slots II e III.
- Formacao completa atingiu `ready` e 100%.
- Deployment Order resolveu `Sewer Broodmother` pelo catalogo real.
- Roster duplicado, personagem ausente e depot hostil mantiveram somente membros validos.
- Inputs permaneceram imutaveis.

QA visual:

- Fixture temporaria criou Vanguard Company, Reserve Company e uma ordem de Sewer Broodmother.
- Dashboard mostrou 2/3 formations, 3/4 members planned, 2/4 targets equipped e 50%.
- Desktop 1280x720 manteve as seis abas do Armory em uma unica linha, sem overflow horizontal.
- Viewport 390x844 usou tres colunas de navegacao, summary em uma coluna e board com 329px, sem overflow horizontal.
- `Plan Loadout` abriu Lyra em Loadout Templates.
- `Open Procurement` abriu Ayla no Procurement Board.
- `Open Guild Squads` abriu Operations com Guild Squads.
- A fixture visual foi removida integralmente.

Tauri e SQLite:

- `npm.cmd run build` passou com 411 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- `squads_json`, `deployment_orders_json` e `loadout_templates_json` foram lidos como JSON valido.
- SQLite manteve `integrity_check=ok` e zero violacoes de foreign key.
- O save real permaneceu somente leitura e preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- Readiness de gear nao substitui regras de vida, status, cooldown, acesso, gold ou tamanho de party das Operations.
- O board mostra ordens ligadas, mas a validacao operacional final continua no Guild Squad Command Center.
- Nao existe auto-assign de loadout por role ou squad.
- Nao existe equipamento coletivo automatico.
- Permanece o aviso conhecido do bundle JavaScript acima de 500 kB.

Proximo passo sugerido:

- Etapa 93.5 - QA aprofundada do Squad Gear Readiness.

## Etapa 93.5 - QA do Squad Gear Readiness

Status: concluida.

Correcoes:

- A formacao selecionada agora e revalidada quando squads, guild level ou save carregado mudam.
- Se a tab atual deixar de estar desbloqueada/configurada, o painel escolhe a primeira formacao configurada, a primeira desbloqueada ou o primeiro slot seguro.
- A selecao valida permanece preservada para evitar saltos durante atualizacoes normais do roster.
- Tabs receberam IDs estaveis e o painel ativo usa `role="tabpanel"` com `aria-labelledby`.
- `aria-controls` fica somente na tab ativa, sem referencias para paineis inexistentes.
- Nenhuma correcao altera squads, loadouts, ordens, equipamento ou persistencia.

QA automatizado:

- Harness temporario passou em 140.022 assertions e foi removido.
- A matriz validou `locked`, `empty`, `ready`, `partial`, `unplanned` e `invalid`.
- O cenario principal agregou quatro membros, cinco targets, tres equipados e 60% de prontidao.
- Arkon ficou `ready`, Ayla `incomplete`, Mira `invalid` e Lyra `unplanned`.
- Formacao completa atingiu 100%; guild level baixo bloqueou os slots II e III.
- Dez mil derivacoes hostis cobriram `NaN`, squads duplicados, membros nulos/ausentes, ordens invalidas, loadouts corrompidos e depot hostil.
- Guild, personagens e depot permaneceram imutaveis.

QA visual:

- Fixture temporaria confirmou 2/3 formations, 3/4 members planned, 3/5 targets equipped e 60%.
- Desktop 1280x720 permaneceu sem overflow horizontal ou vertical da pagina.
- Vanguard, Reserve e Third Company apresentaram os estados e contadores esperados.
- A ordem ligada resolveu `Sewer Broodmother` pelo catalogo real.
- `Plan Loadout` abriu Loadout Templates com Lyra selecionada.
- A semantica de tablist, tab ativa e tabpanel foi inspecionada no DOM.
- A conexao do navegador bloqueou o ultimo reload local por politica; por isso o QA mobile de 390x844 da Etapa 93 nao foi repetido nesta rodada.
- A fixture foi removida integralmente e `mockGuild.ts` ficou sem diff real.

Build, Tauri e SQLite:

- `npm.cmd run build` passou com 411 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- SQLite em `mode=ro` retornou `integrity_check=ok` e zero violacoes de foreign key.
- `squads_json`, `deployment_orders_json` e `loadout_templates_json` permaneceram JSON valido.
- O save preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- Nao existe test runner persistente no `package.json`; o harness desta etapa foi propositalmente temporario.
- O readiness continua derivado e nao substitui a validacao operacional final.
- Nao existe auto-equip, auto-assign ou inicio automatico de operacao.

Proximo passo sugerido:

- Etapa 94 - Operation Readiness Briefing, consolidando squad, gear e requisitos do alvo antes do despacho manual.

## Etapa 94 - Operation Readiness Briefing

Status: concluida.

Conceito:

- Nova revisao pre-deployment conecta cada Deployment Order ao alvo, squad e readiness de equipamento atuais.
- O briefing e totalmente derivado de `squads`, `deploymentOrders`, `loadoutTemplates`, roster e Guild Depot.
- Nenhuma nova coluna, migration ou fonte de verdade foi criada.
- Preparar continua abrindo o fluxo real de Boss ou Contract; o briefing nunca inicia atividade automaticamente.

Engine:

- Novo `buildOperationReadinessBriefing` compoe Deployment Orders e Squad Gear Readiness.
- Os tres slots sempre aparecem com status `empty`, `blocked`, `gear-pending` ou `ready`.
- Cada ordem possui checkpoints de formation availability, operation requirements, active loadout plans e equipped targets.
- Resumo agrega ordens configuradas, operacionais, plenamente prontas, pendentes de gear e bloqueadas.
- Bosses exibem power atual/target; Contracts exibem power e success chance calculados pelos motores existentes.
- Roster de entrada e deduplicado/normalizado antes de chamar o planner, impedindo quebra por personagem nulo ou ID repetido.
- Data invalida recebe fallback seguro sem alterar o save.

UI:

- Operations ganhou o painel `Operation Readiness Briefing` entre Deployment Orders e Deployment Planner.
- As tres tabs compartilham a selecao dos slots persistentes de ordem.
- Dossie mostra alvo, regiao, detalhe, formacao, membros disponiveis, quatro checks e metricas.
- `Review Formation` seleciona a companhia correta no editor de Guild Squads.
- `Open Guild Armory` aparece quando o equipamento exige revisao.
- `Prepare Operation` usa os callbacks reais e permanece disabled quando o planner bloqueia a operacao.
- Tabs e painel usam semantica `tablist`, `tab`, `tabpanel`, `aria-selected`, `aria-controls` e `aria-labelledby`.

QA automatizado:

- Harness temporario passou em 110.028 assertions e foi removido.
- Contrato plenamente pronto atingiu quatro checks aprovados, gear 100% e status `ready`.
- Ordem operacional sem loadout ficou `gear-pending`.
- Gold insuficiente preservou `blocked`; ordem ausente preservou `empty`.
- Plano incompatível foi encaminhado para gear review.
- Dez mil derivacoes hostis cobriram roster nulo/duplicado, squads e ordens invalidas, loadouts corrompidos, `NaN` e depot hostil.
- Guild, personagens e depot permaneceram imutaveis.

QA visual:

- Fixture temporaria criou tres ordens: ready, gear review e operation blocked.
- Dashboard mostrou 3/3 orders, duas operacionais, uma plenamente pronta e uma em gear review.
- Supply Route Survey mostrou quatro checks aprovados e 100% de gear.
- Sewer Broodmother com Lyra mostrou operacao valida, gear 0% e atalhos de Armory/Prepare.
- Sewer Broodmother com Ayla training bloqueou `Prepare Operation` e mostrou o motivo real.
- `Review Formation` selecionou Arcane Reserve.
- `Open Guild Armory` abriu o Guild Armory.
- `Prepare Operation` abriu Bosses com Sewer Broodmother preparada, sem iniciar combate.
- Desktop 1280x720 permaneceu sem overflow da pagina; o navegador nao ofereceu viewport mobile nesta rodada.
- Fixture e harness foram removidos integralmente.

Build, Tauri e SQLite:

- `npm.cmd run build` passou com 413 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- SQLite em `mode=ro` retornou `integrity_check=ok` e zero violacoes de foreign key.
- `squads_json`, `deployment_orders_json` e `loadout_templates_json` permaneceram JSON valido.
- O save preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- Gear readiness e uma camada de revisao; as regras finais continuam nos motores reais de Boss/Contract.
- Nao existe auto-equip, auto-assign, auto-dispatch ou fila executavel.
- O QA mobile desta etapa ficou restrito a leitura das media queries e build.

Proximo passo sugerido:

- Etapa 94.5 - QA aprofundada do Operation Readiness Briefing.

## Etapa 94.5 - QA do Operation Readiness Briefing

Status: concluida.

Correcoes:

- O resumo agora mostra explicitamente o total `Blocked`, que ja era calculado pela engine.
- O dossie exibe `Base fee` com a taxa do Boss ou Contract selecionado.
- Tabs implementam roving `tabIndex`: somente a tab ativa participa da sequencia principal de foco.
- `ArrowLeft` e `ArrowRight` navegam circularmente entre ordens.
- `Home` seleciona a primeira ordem e `End` seleciona a ultima.
- Foco, `aria-selected`, `aria-controls` e `tabpanel` permanecem sincronizados apos navegacao por teclado.
- Nenhuma regra de custo, disponibilidade, gear ou despacho foi alterada.

QA automatizado:

- Harness temporario passou em 150.410 assertions e foi removido.
- Todos os Bosses e Contracts do catalogo foram comparados ao resultado direto de `buildGuildDeploymentOrders`.
- A matriz confirmou 3/3 orders, duas operacionais, uma ready, uma gear-pending e uma blocked.
- A particao `fullyReady + gearPending + blocked = configured` permaneceu verdadeira.
- `operationReady` permaneceu exatamente igual a `fullyReady + gearPending`.
- Ordem ready preservou 100% de gear; ordem sem candidato pronto permaneceu blocked.
- Data invalida usou fallback seguro.
- Doze mil derivacoes hostis cobriram gold `NaN`, roster duplicado/nulo, squads e ordens invalidas, loadouts corrompidos, depot hostil e mudancas de status.
- Guild, roster e depot permaneceram imutaveis.

QA visual e acessibilidade:

- Fixture temporaria repetiu os estados ready, gear review e operation blocked.
- O resumo exibiu Orders 3/3, Operational 2, Fully ready 1, Gear review 1 e Blocked 1.
- Supply Route Survey exibiu `Base fee 40g`.
- `ArrowRight` moveu foco/selecao de Order I para Order II.
- `End` moveu para Order III; `Home` retornou para Order I; `ArrowLeft` em Order I voltou circularmente para Order III.
- DOM confirmou uma unica tab com `tabIndex=0` e `aria-controls`; tabs inativas ficaram com `tabIndex=-1`.
- Desktop 1280x720 manteve largura de 1.197px para o briefing e zero overflow da pagina.
- O navegador permaneceu fixo em desktop; o QA mobile continuou por media queries e build.
- Fixture visual e servidor local foram removidos.

Build, Tauri e SQLite:

- `npm.cmd run build` passou com 413 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- SQLite em `mode=ro` retornou `integrity_check=ok` e zero violacoes de foreign key.
- `squads_json`, `deployment_orders_json` e `loadout_templates_json` permaneceram JSON valido.
- O save preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O briefing continua consultivo e nao exige gear completo para abrir um fluxo operacional valido.
- Nao existe auto-dispatch, auto-equip ou consumo automatico da Deployment Order.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 95 - Operation Outcome Ledger, registrando resultados manuais de Bosses e Contracts no historico de Operations.

## Etapa 95 - Operation Outcome Ledger

Status: concluida.

Implementacao:

- Operations ganhou um arquivo pos-operacao derivado dos resultados reais de Bosses e Contracts.
- Cada tentativa concluida de Boss registra alvo, horario, participantes, sucesso, taxa de entrada, perda por morte, gold, renown, XP e loot.
- O historico existente de Contracts passou a guardar o custo exato do dispatch para novos resultados; saves antigos usam o custo atual do catalogo como fallback.
- O painel combina as duas fontes, ordena os 24 relatorios mais recentes e oferece filtros All, Bosses e Contracts.
- O dossie selecionado mostra saldo bruto/liquido, custos, penalidades, participantes e itens recuperados.
- O resumo apresenta relatorios, sucessos, gold bruto, custos, saldo, renown e quantidade de loot.
- Personagens removidos do roster aparecem como `Retired adventurer`, sem invalidar o relatorio.
- O registro de Boss e idempotente por alvo, party e horario, evitando duplicacao no mesmo fechamento.

Persistencia e compatibilidade:

- `GuildOperationOutcomesState` mantem ate 20 resultados recentes de Boss e totais vitalicios de tentativas/vitorias.
- `operation_outcomes_json` foi adicionado a tabela `guilds`.
- Saves antigos normalizam para historico vazio, sem quebra.
- IDs, datas, numeros, participantes, loot e referencias de catalogo sao saneados no load.
- O historico de Contracts continua em `expeditions_json`; apenas o campo opcional `dispatchCost` foi acrescentado.

QA:

- `npm.cmd run build` passou antes e depois da UI com 417 modulos.
- Harness temporario validou estado hostil, deduplicacao, idempotencia, limite de 20 Bosses, totais vitalicios e ledger combinado; foi removido.
- O caso combinado produziu 21 relatorios, Contract mais recente e saldo liquido correto de `+70g`.
- Browser local validou o estado vazio e uma fixture com dois Bosses e um Contract.
- Filtros e selecao foram clicados; o Contract correto abriu com `+70g`.
- Desktop 1280x720 exibiu lista, resumo, dossie e loot sem sobreposicao.
- A fixture visual foi removida e o mock final voltou ao historico vazio.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- A abertura curta do release aplicou `operation_outcomes_json` no WAL do SQLite sem erro.
- Os arquivos auxiliares da sessao foram zerados e o banco principal preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- Resultados anteriores de Boss nao podem ser reconstruidos porque antes existiam apenas em estado transitorio.
- O ledger mostra ate 24 relatorios combinados; Bosses persistem os 20 mais recentes.
- Contracts antigos sem snapshot de custo usam o custo atual do catalogo.
- O navegador integrado permaneceu fixo em desktop; mobile foi revisado pelas media queries e pelo build.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 95.5 - QA aprofundada do Operation Outcome Ledger no Tauri/SQLite.

## Etapa 95.5 - QA do Operation Outcome Ledger

Status: concluida.

Correcoes:

- O ID persistente de Boss agora usa o `startedAt` da acao real e a party ordenada, bloqueando um segundo registro mesmo quando o fechamento atrasado recebe outro horario de conclusao.
- O historico de Contracts agora ordena por data, preserva a versao mais recente de IDs duplicados e limita IDs salvos a 160 caracteres.
- IDs de participantes de Contract sao aparados e deduplicados.
- Loot de Contract com `itemId` ausente do catalogo e removido junto da quantidade orfa.
- Contract legado sem participantes exibe `Unrecorded team` em vez de deixar o dossie vazio.
- Custos, saldos e totais de loot/renown agora permanecem dentro de `Number.MAX_SAFE_INTEGER`.
- Filtros All/Bosses/Contracts receberam roving `tabIndex`, `aria-controls`, `tabpanel` e navegacao por ArrowLeft/ArrowRight/Home/End.
- Nenhum valor de recompensa, custo, chance ou balanceamento foi alterado.

QA automatizado:

- Harness temporario passou em 28.749 assercoes e foi removido.
- Todos os seis Bosses e seis Contracts foram resolvidos contra o catalogo real.
- A identidade baseada no inicio da acao rejeitou duplicacao com outro horario de conclusao e party em ordem invertida.
- Mismatches entre Boss, resultado e party permaneceram sem mutacao.
- Save antigo e `operation_outcomes_json` quebrado carregaram defaults seguros.
- Historicos duplicados, datas com offset, IDs longos, participantes vazios, item invalido e custo explicito `0g` foram validados.
- O ledger combinado manteve os 24 relatorios mais recentes, com 20 Bosses e quatro Contracts no recorte testado.
- Personagem aposentado, equipe nao registrada, custo legado de catalogo e imutabilidade do save passaram.
- Valores extremos preservaram inteiros seguros sem overflow.
- Quatro mil derivacoes hostis cobriram `undefined`, `null`, strings, negativos, `NaN`, infinito, arrays e objetos.

QA visual e acessibilidade:

- Fixture temporaria exibiu Boss vencido, Boss perdido, personagem aposentado, loot multiplo e Contract sem equipe.
- `ArrowRight`, `End`, `Home` e `ArrowLeft` circular mantiveram foco, selecao, filtro e `aria-labelledby` sincronizados.
- Contract sem equipe mostrou `Unrecorded team`; custo snapshot `0g` nao foi substituido pelo custo atual do catalogo.
- Desktop 1280x720 apresentou zero overflow na pagina, no ledger e no dossie.
- Fixture, servidor e artefatos do harness foram removidos.
- O navegador integrado permaneceu fixo em desktop; mobile foi revisado pelas media queries e pelo build.

Build, Tauri e SQLite:

- `npm.cmd run build` passou antes e depois das correcoes com 417 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Duas cargas do release confirmaram migration, recarga e nova persistencia de `operation_outcomes_json`.
- O WAL registrou `bossHistory`, `totalBossAttempts` e `totalBossDefeats`.
- O save foi restaurado integralmente: banco principal SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`; WAL e SHM voltaram a zero bytes com SHA-256 vazio `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Limitacoes:

- O fluxo completo de concluir um Boss e um Contract nao foi clicado dentro da janela Tauri nesta rodada; engine, browser Vite e persistencia SQLite foram validados separadamente.
- Resultados de Boss anteriores a Etapa 95 continuam irrecuperaveis.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 96 - Operation Performance Analytics, derivando desempenho historico da guilda sem nova automacao.

## Etapa 96 - Operation Performance Analytics

Status: concluida.

Implementacao:

- Operations ganhou um painel analitico totalmente derivado do Operation Outcome Ledger.
- O resumo mostra operacoes, taxa de sucesso, gold bruto, custos, saldo liquido e media liquida.
- Filtros All Operations, Bosses e Contracts recalculam o resumo e o ranking sem alterar o save.
- Resultados sao agrupados por alvo real; tentativas repetidas do mesmo Boss ou Contract formam uma unica linha.
- Cada alvo mostra tentativas, vitorias/derrotas, taxa de sucesso, receita, custo, saldo, media, renown, loot, XP e runs lucrativas.
- Ranking principal usa saldo liquido, media, atividade e nome como desempates deterministas.
- Destaques identificam alvo mais lucrativo, mais confiavel e mais ativo.
- A forma recente compara os cinco relatorios mais novos aos cinco anteriores e classifica como improving, declining, positive ou negative.
- Estado vazio orienta o jogador a concluir um Boss ou Contract.

Regras e limites:

- Analytics usa somente os 24 relatorios mais recentes ja expostos pelo Ledger.
- Nenhuma recompensa, custo, chance, cooldown ou balanceamento foi alterado.
- Nenhum novo campo de save, migration ou automacao foi criado.
- Todas as somas permanecem limitadas a inteiros seguros.

QA automatizado:

- Harness temporario passou em 30.043 assercoes e foi removido.
- Uma janela completa validou 24 relatorios, 12 alvos, 12 Bosses e 12 Contracts.
- Totais de gold, custos, saldo, renown e loot foram comparados diretamente ao Outcome Ledger.
- Cada um dos seis Bosses e seis Contracts agregou duas tentativas no cenario completo.
- Taxa, falhas, media liquida, ranking e destaques foram validados.
- Cenarios separados confirmaram tendencias improving e declining.
- Valores em `Number.MAX_SAFE_INTEGER` permaneceram seguros.
- Cinco mil historicos hostis cobriram dados ausentes, strings, negativos, `NaN`, infinito, objetos, arrays, referencias invalidas e datas quebradas.
- A derivacao permaneceu imutavel sobre a guilda.

QA visual:

- Fixture temporaria agregou sete relatorios em quatro alvos.
- Resumo geral exibiu 7 operacoes, 71% de sucesso e saldo `+1.355g`.
- Filtro Bosses exibiu 4 operacoes e `+1.220g`; Contracts exibiu 3 operacoes e `+135g`.
- Supply Route Survey consolidou duas tentativas em 50% de sucesso, saldo `+30g` e media `+15g`.
- Destaques exibiram Grunk como mais lucrativo/confiavel, Sewer Broodmother como mais ativo e forma recente improving.
- Desktop 1280x720 apresentou zero overflow na pagina, painel e dossie.
- Reload apos restaurar a fixture confirmou estado vazio, zero operacoes e insights sem relatorio.
- Fixture, servidor e harness foram removidos.
- O navegador integrado permaneceu fixo em desktop; mobile foi revisado pelas media queries e pelo build.

Build e Tauri:

- `npm.cmd run build` passou com 419 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.
- SQLite nao foi aberto nem migrado nesta etapa derivada e preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A amostra nao representa lifetime completo quando houver mais de 24 relatorios.
- O painel ainda nao possui recortes manuais por periodo ou personagem.
- Nao existe grafico temporal longo porque o historico atual e intencionalmente curto.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 96.5 - QA aprofundada do Operation Performance Analytics.

## Etapa 96.5 - QA aprofundada do Operation Performance Analytics

Status: concluida.

Correcoes:

- All Operations, Bosses e Contracts agora possuem resumo, ranking, destaques e forma recente derivados do proprio escopo.
- Selecionar Contracts nao pode mais manter um Boss como mais lucrativo, confiavel ou ativo; o mesmo isolamento vale para Bosses.
- Cada escopo usa suas cinco operacoes recentes e cinco anteriores para calcular a tendencia.
- O alvo mais confiavel usa amostras de pelo menos dois relatorios quando existe algum alvo repetido no escopo.
- Quando todos os alvos possuem apenas um relatorio, eles continuam elegiveis para o destaque.
- A UI informa a quantidade de relatorios junto da taxa de confiabilidade e anuncia a troca dos insights com `aria-live="polite"`.
- Os campos globais anteriores foram preservados para manter compatibilidade com consumidores existentes.

QA automatizado:

- Harness temporario passou em 36.030 assercoes e foi removido.
- Historico misto confirmou tendencia improving para Bosses e declining para Contracts no mesmo save.
- Escopos vazios retornaram zeros, nenhum alvo, nenhum destaque e forma recente vazia.
- Uma vitoria isolada de 100% nao superou uma amostra repetida quando havia historico comparavel.
- Duas mil guildas deterministicas validaram particao entre sucesso/falha, taxas entre 0% e 100%, janelas de cinco relatorios e inteiros seguros.
- A derivacao permaneceu imutavel sobre a guilda.

QA visual:

- O estado vazio mostrou zeros, orientacao sem relatorios e nenhum destaque preso.
- Fixture temporaria com oito relatorios exibiu 75% de sucesso, quatro Bosses e quatro Contracts.
- Contracts mostrou somente Sewer Ledger Audit e Supply Route Survey em ranking, dossie, destaques e tendencia.
- Bosses mostrou somente Sewer Broodmother e Grunk the Camp Breaker.
- Estados `aria-pressed` e a regiao `aria-live` acompanharam o escopo ativo.
- Em 1280x720 nao houve overflow na pagina, painel, ranking ou dossie.
- Em 390x844 o analytics refluiu para duas colunas de metricas e botoes de largura total, sem texto cortado ou overflow horizontal.
- A escala compacta extrema do client completo em 390px ja existia e ficou fora do escopo desta QA.
- O comando automatizado de `Tab` do browser nao avancou o foco; a travessia completa por teclado nao foi confirmada por interacao manual.
- Fixture, servidor, logs e harness temporarios foram removidos; reload final confirmou o mock vazio.

Build, Tauri e SQLite:

- `npm.cmd run build` passou antes e depois das correcoes com 419 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- O save real preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- WAL e SHM terminaram com 0 bytes; nenhuma migration ou alteracao de persistencia foi necessaria.
- No Vite, o erro esperado do Tauri SQL sem `invoke` acionou o mock local; nenhum erro do analytics foi observado.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Limitacoes:

- Analytics continua limitado aos 24 relatorios mais recentes do Operation Outcome Ledger.
- Nao existem recortes manuais por periodo, personagem ou formacao.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 97 - Guild Campaign Milestones.

## Etapa 97 - Guild Campaign Milestones

Status: concluida.

Conceito e modelo:

- Campaign Operations ganhou uma trilha permanente de seis capitulos baseada em Bosses e support Contracts.
- O progresso usa `totalBossAttempts`, `totalBossDefeats`, `expeditions.totalCompleted` e `expeditions.totalSucceeded`.
- Os contadores lifetime permanecem validos quando relatorios antigos saem da janela visual de 24 entradas.
- As definicoes usam o ledger existente de Renown Objectives com o novo grupo `campaign`.
- As seis ordens anteriores receberam o grupo `foundation` e continuam isoladas no Recruitment Board.
- Nenhuma nova moeda, premium, automacao, online ou bonus oculto foi criado.

Capitulos e recompensas:

- First After-Action Report: uma operacao concluida, +2 Renown.
- Break the Boss Line: tres Bosses derrotados, +3 Renown.
- Reliable Contract Network: cinco support Contracts bem-sucedidos, +3 Renown.
- Seasoned Command: dez operacoes concluidas, +4 Renown.
- Proven Field Command: dez operacoes bem-sucedidas, +5 Renown.
- Veteran Campaign Office: vinte e cinco operacoes concluidas, +6 Renown.
- A trilha completa oferece 23 Renown, sempre por claim manual e unico.

Engine e protecoes:

- `getGuildRenownObjectiveStatus` calcula metricas combinadas com inteiros nao negativos e soma limitada a `Number.MAX_SAFE_INTEGER`.
- Progresso, conclusao, claimable e resumo sao derivados sem mutar guilda ou personagens.
- `claimGuildRenownObjective` continua validando definicao, timestamp, conclusao e duplicacao antes de aplicar Renown.
- `normalizeGuildRenownObjectivesState` reconhece os novos IDs, remove IDs invalidos, deduplica claims e normaliza historico.
- O bloqueio React existente impede claims simultaneos; depois do claim o botao vira `Recorded`.
- Activity Log diferencia `Campaign milestone claimed` das ordens de Renown do Recruitment.

UI e integracoes:

- O novo painel mostra command rank, capitulos completos, claims prontos e Renown disponivel.
- Cada card apresenta fonte, descricao, recompensa, progresso lifetime e comando contextual.
- Metas incompletas encaminham para Bosses ou Contracts sem iniciar uma atividade automaticamente.
- Recruitment continua mostrando exatamente as seis ordens de fundacao e seu badge ignora claims exclusivos de Campaign Operations.
- Updates recebeu a nota instalada da Etapa 97.

QA automatizado:

- Harness temporario passou em 36.035 assercoes e foi removido.
- Foram validados IDs, grupos, targets, 23 Renown total, estado vazio, thresholds, claim, timestamp e bloqueio de duplicacao.
- Saves antigos sem claims e estados com IDs duplicados/invalidos foram normalizados.
- Valores em `Number.MAX_SAFE_INTEGER` permaneceram seguros.
- Tres mil campanhas deterministicas validaram totais, sucessos, Bosses, Contracts, resumos de grupo e progresso entre 0% e 100%.
- A derivacao permaneceu imutavel.

QA visual:

- Estado vazio exibiu 0/6 capitulos, zero claim e seis rotas contextuais.
- Fixture parcial combinou tres Bosses e dois Contracts: dois capitulos completos, dois claims e +5 Renown disponivel.
- Claims de +2 e +3 Renown mudaram os cards para `Recorded`, reduziram o resumo e geraram Activity Log de Campaign Milestone.
- Contract Network mostrou 2/5 e Veteran Campaign Office mostrou 5/25.
- Recruitment permaneceu com seis cards e nao exibiu First After-Action Report.
- Em 1280x720 os seis cards ficaram em uma linha sem texto ou botao cortado.
- Em 390x844 resumo e trilha refluiram para uma coluna sem overflow horizontal.
- Fixture, servidor, logs e harness temporarios foram removidos; reload final confirmou 0/6 no mock.

Build, Tauri e SQLite:

- `npm.cmd run build` passou com 420 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- A persistencia reutiliza `renown_objectives_json`; nenhuma migration ou coluna nova foi necessaria.
- O save real preservou SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- WAL e SHM terminaram com 0 bytes.
- Permanece apenas o aviso conhecido do bundle JavaScript acima de 500 kB.

Limitacoes:

- Operacoes historicas anteriores aos contadores permanentes existentes nao podem ser reconstruidas.
- Os capitulos medem volume e sucesso lifetime; lucro, party e alvo unico continuam apenas no analytics recente.
- Nao ha tiers infinitos, temporadas ou repeticao de recompensa nesta primeira trilha.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 97.5 - QA aprofundada dos Guild Campaign Milestones.

## Etapa 97.5 - QA aprofundada dos Guild Campaign Milestones

Status: concluida.

Correcoes:

- Claims bloqueados de objetivos conhecidos agora preservam a definicao e o grupo `campaign`, mantendo titulo e Activity Log corretos.
- Apenas um ID realmente desconhecido retorna sem definicao.
- O historico persistido restaura `renownGained` pela recompensa canonica da definicao, impedindo valores alterados, zerados ou hostis no save.
- O calculo de metricas ignora entradas nulas ou nao-objeto em rosters corrompidos antes de ler quests e candidatos recrutados.

QA automatizado:

- Harness temporario passou em 80.085 assercoes e foi removido.
- As seis definicoes de Campaign e as seis de Foundation foram verificadas sem mistura entre os paineis.
- Cada milestone passou em `target - 1`, threshold exato e `target + 1`.
- Os seis claims somaram exatamente 23 Renown e bloquearam duplicacao, timestamp invalido e objetivo incompleto.
- Foram validados Renown `NaN`/`Number.MAX_SAFE_INTEGER`, historico adulterado, roster hostil e objetivo desconhecido.
- `mapGuild` passou em round-trip do JSON SQLite e JSON malformado retornou defaults seguros.
- Cinco mil campanhas deterministicas preservaram limites, totais, sucessos e invariantes de progresso.

QA visual e acessibilidade:

- Estado vazio exibiu os seis cards, seis progressbars nomeadas, resumo `aria-live` e seis rotas de origem.
- Fixture veterana mostrou 6/6 completos, dois registros persistidos e quatro claims oferecendo +18 Renown.
- Claim de Contract +3 mudou para `Recorded`, atualizou o resumo para +15 e produziu um unico Activity Log.
- A grade refluiu em 1280, 960, 760, 520 e 390 px, respectivamente para 6, 3, 2, 1 e 1 colunas, sem overflow.
- A ativacao por teclado automatizada do browser ficou inconclusiva; os controles continuam botoes HTML nativos, mas navegacao manual por teclado nao foi confirmada.
- Fixture, harness e servidor Vite temporarios foram removidos e o mock original foi restaurado.

Build, Tauri e SQLite:

- `npm.cmd run build` passou com 420 modulos antes e depois das correcoes.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- O banco real respondeu `integrity=ok`, preservou Renown 12 e os claims vazios.
- Banco, WAL e SHM permaneceram byte a byte iguais ao backup; o SHA-256 principal continuou `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- O banco legado possui 27 colunas e ainda nao recebeu `operation_outcomes_json`, pois o app nativo nao chegou a iniciar nesta maquina.
- `npm.cmd run tauri:dev` ficou bloqueado pela politica de Controle de Aplicativo do Windows ao executar build scripts Rust (`os error 4551`); por isso a migration nativa interativa nao foi alegada como validada.

Limitacoes:

- Operacoes historicas anteriores aos contadores lifetime nao podem ser reconstruidas.
- Lucro e ranking por alvo continuam restritos a janela recente do analytics.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.
- A migration do banco legado ainda precisa de uma inicializacao nativa em ambiente sem o bloqueio de politica observado.

Proximo passo sugerido:

- Etapa 98 - Campaign Region Mastery.

## Etapa 98 - Campaign Region Mastery

Status: concluida.

Conceito e regioes:

- Campaign Operations ganhou maestria permanente para Thaeron Marches, Khazgrim Frontier e Eldoria Reaches.
- Cada regiao mapeia suas cidades, Hunts, Bosses e dois support Contracts.
- As patentes sao Uncharted, Surveyed, Established, Veteran e Mastered.
- Os thresholds sao 0, 10, 30, 70 e 140 mastery points.
- A progressao e guild-wide, totalmente offline e nao inicia operacoes automaticamente.

Pontuacao:

- Cada 15 minutos acumulados de Hunt concluida sem morte oferece 1 ponto.
- Um Boss report oferece 1 ponto pela tentativa e mais 4 pela vitoria.
- Um Contract retornado oferece 1 ponto e mais 3 quando bem-sucedido.
- Hunt com morte nao registra tempo regional.
- Duracoes invalidas sao normalizadas e uma unica operacao nao registra mais de 24 horas.
- Contadores duplicados no JSON usam o maior valor valido, sem somar duplicatas hostis.

Bonus:

- Cada patente acima de Uncharted oferece +1% Hunt XP e +1% Hunt gold.
- O teto em Mastered e +4% XP e gold.
- O bonus vale apenas nas Hunts das cidades mapeadas para a regiao.
- XP regional entra no snapshot da Hunt e o auto-repeat seguinte recebe a patente mais recente.
- Gold regional entra antes do calculo final de lucro liquido.
- Nenhum bonus e aplicado a regioes desconhecidas ou a saves corrompidos.

Engine e persistencia:

- `GuildOperationOutcomesState` recebeu `regionMastery` opcional com seis contadores canonicos por regiao.
- Saves antigos normalizam para uma lista vazia e todas as regioes aparecem como Uncharted.
- A persistencia reutiliza `operation_outcomes_json`; nenhuma coluna SQLite nova foi criada.
- O normalizador remove regioes desconhecidas, limita inteiros, deduplica IDs e garante `defeats <= attempts` e `succeeded <= completed`.
- Bosses preservam a protecao existente contra outcome duplicado antes de registrar maestria.
- Contracts registram maestria junto ao unico retorno da expedition.
- Hunts registram depois da resolucao protegida e antes de preparar um eventual auto-repeat.
- Activity Log comunica pontos e mudanca de patente para Hunts e Bosses; Contracts incluem o progresso na mensagem de retorno.

UI:

- Campaign Region Mastery foi adicionado ao Command Office abaixo dos Campaign Milestones.
- O cabecalho resume regioes mapeadas, pontos totais, maior patente e teto local.
- Tres tabs mostram patente, pontos, bonus e progresso para o proximo rank.
- O dossier detalha minutos de Hunt, Bosses, Contracts e os pontos de cada fonte.
- Comandos abrem Hunts, Bosses ou Contracts sem iniciar atividade.
- Progressbars possuem nomes acessiveis e a selecao usa tabs/tabpanel nativos.

QA:

- Tres harnesses temporarios passaram em 50.036, 30.011 e 7 assercoes, totalizando 80.054 verificacoes, e foram removidos.
- Foram validados todos os Hunts, Bosses e Contracts do catalogo contra uma regiao.
- Thresholds, isolamento regional, bonus, operacoes malsucedidas e combinacao das tres fontes passaram.
- JSON ausente, malformado, duplicado, hostil e valores extremos foram normalizados.
- `mapGuild` preservou o estado em round-trip de `operation_outcomes_json`.
- Cinco mil estados deterministas validaram limites de pontos, ranks, percentuais e invariantes.
- Integracao direta confirmou que relatorio duplicado de Boss e segunda coleta do mesmo Contract nao concedem maestria novamente.
- Build intermediario passou com 423 modulos.

QA visual:

- Estado vazio exibiu 0/3 regioes, tres tabs, tres progressbars, dossier e comandos.
- Fixture mostrou Thaeron Established com 31 pontos, Khazgrim Uncharted com 9 e Eldoria Mastered com 155.
- Patentes, bonus de +2%/+4%, selecao de regiao e estado MAX foram atualizados corretamente.
- Open Hunts navegou para o modo de jogo sem iniciar uma Hunt.
- Em 1280x720 o painel nao apresentou overflow interno ou horizontal.
- As regras responsivas de 980, 760 e 520 px foram revisadas no CSS; o browser desta sessao permaneceu fixo em 1280 px, portanto clique visual mobile nao foi alegado.
- Fixture e servidor Vite foram removidos e o mock original voltou a 0/3.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` e `npm.cmd run tauri:build` passaram com 423 modulos.
- Tauri gerou executavel, MSI e NSIS.
- O banco real respondeu `integrity=ok`, com 27 colunas e Renown 12.
- Banco, WAL e SHM permaneceram byte a byte iguais ao backup; o SHA-256 principal continuou `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- A politica de Controle de Aplicativo do Windows bloqueou a execucao do `.exe` release; o processo nao abriu e nenhuma migration foi alegada como validada.

Limitacoes:

- Operacoes anteriores a esta etapa nao podem ser distribuidas retroativamente por regiao.
- O save real legado ainda precisa executar a migration existente de `operation_outcomes_json` em ambiente sem o bloqueio do Windows.
- Existem tres regioes nesta primeira versao; novas cidades exigem mapeamento explicito.
- O bonus regional atua apenas em Hunts nesta etapa.
- Nao existe test runner persistente no `package.json`; os harnesses foram temporarios.

Proximo passo sugerido:

- Etapa 98.5 - QA aprofundada do Campaign Region Mastery.

## Etapa 98.5 - QA aprofundada do Campaign Region Mastery

Status: concluida.

Problemas encontrados e corrigidos:

- O bonus regional de XP era congelado ao iniciar a Hunt, mas o gold era recalculado na coleta.
- `CharacterAction` agora persiste `guildGoldBonusPercent` junto ao snapshot de XP.
- Uma mudanca de patente enquanto a Hunt esta ativa nao altera retroativamente o gold daquela operacao.
- `expectedGold` de Hunts iniciais e repetidas agora inclui o bonus regional congelado.
- Auto-repeat recebe os snapshots atuais de XP e gold depois de registrar uma possivel mudanca de patente.
- Acoes antigas sem `guildGoldBonusPercent` continuam usando o bonus regional atual como fallback.
- `normalizeCharacterAction` limita snapshots carregados ao intervalo seguro de 0% a 25% e preserva `undefined` em saves legados.
- Eventos runtime com tipo desconhecido podiam cair no ramo de Contract; agora tipos, IDs/cidades e duracao sao validados antes do registro.
- Hunt com duracao `NaN`, zero ou negativa nao registra report nem minutos.
- Flags hostis como a string `"true"` nao contam como sucesso de Hunt, Boss ou Contract.
- Uma unica Hunt valida continua limitada a 24 horas de progresso regional.

QA automatizado:

- Harness temporario passou em 100.067 assercoes e foi removido.
- Todos os Hunts, Bosses e Contracts permaneceram mapeados para uma das tres regioes.
- Os thresholds 0, 10, 30, 70 e 140 passaram no valor exato e imediatamente abaixo.
- Foram validados bonuses de XP/gold, teto de +4%, isolamento regional e estado MAX.
- JSON ausente, malformado, duplicado, desconhecido e com valores extremos retornou estado canonico.
- Duplicatas preservam o maior contador valido sem somar progresso artificial.
- `mapGuild` manteve round-trip de `operation_outcomes_json`.
- Start Hunt, load normalization, finish Hunt e auto-repeat preservaram os snapshots esperados.
- A segunda coleta do mesmo Boss report ou Contract nao concedeu pontos novamente.
- Dez mil campanhas deterministicas mantiveram limites, ranks, percentuais e invariantes.

QA visual e acessibilidade:

- Save vazio continuou mostrando tres regioes Uncharted, tres tabs e tres progressbars nomeadas.
- Fixture de borda mostrou Thaeron com 9 pontos ainda Uncharted, Khazgrim com 30 exatamente Established e Eldoria com 140 exatamente Mastered.
- Resumo mostrou 179 pontos e bonus 0%, 2% e 4% sem arredondamento incorreto.
- Tabs agora usam `tabIndex` roving e respondem a ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Home e End.
- O tabpanel e focavel e atualiza corretamente `aria-labelledby`.
- O painel nao apresentou elementos cortados ou overflow em 1280x720.
- O browser recusou a pagina auxiliar usada para viewports controlados; os breakpoints de 980, 760 e 520 px foram revisados em CSS, mas QA interativo mobile nao foi alegado.
- Fixture, harness, servidor e logs temporarios foram removidos; o mock voltou a 0/3.
- No Vite permaneceu apenas o fallback esperado do Tauri SQL sem `invoke`.

Build, Tauri e SQLite:

- `npm.cmd run build` passou antes e depois das correcoes com 423 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.
- O save real respondeu `integrity=ok`, manteve 27 colunas e Renown 12.
- Banco, WAL e SHM preservaram seus hashes; o SHA-256 principal continuou `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- A execucao nativa nao foi repetida porque a politica de Controle de Aplicativo ja bloqueou o mesmo release na Etapa 98.
- Nenhuma migration ou escrita no save real foi realizada nesta QA.

Limitacoes:

- O save legado real ainda precisa executar a migration existente de `operation_outcomes_json` em ambiente sem o bloqueio do Windows.
- Operacoes anteriores a Etapa 98 nao podem ser reconstruidas por regiao.
- QA interativo mobile permanece pendente em um browser que permita controlar viewport.
- O bonus regional continua restrito a Hunts.
- Nao existe test runner persistente no `package.json`; o harness foi temporario.

Proximo passo sugerido:

- Etapa 99 - Regional Campaign Orders.

## Etapa 99 - Regional Campaign Orders

Status: concluida.

Conceito e rotacao:

- Thaeron Marches, Khazgrim Frontier e Eldoria Reaches recebem uma oferta regional por dia local.
- As ofertas sao deterministicas a partir da guilda, data local e regiao; nao dependem de servidor ou conexao.
- Os objetivos alternam entre minutos de Hunt bem-sucedida, vitoria contra Boss e Contract bem-sucedido.
- Uma ordem aceita permanece ativa depois da virada do dia ate ser concluida ou abandonada.
- Apenas uma ordem pode permanecer ativa por vez e abrir um sistema nunca inicia operacao automaticamente.

Progresso e recompensas:

- O aceite captura o contador regional atual como baseline; progresso historico anterior nao conta.
- Hunts pedem 30, 45 ou 60 minutos e pagam 180, 240 ou 300 gold.
- Bosses pedem uma vitoria e pagam de 320 a 380 gold.
- Contracts pedem um sucesso e pagam de 240 a 320 gold.
- O claim e manual, soma o valor uma unica vez a `guild.gold` e registra os ultimos 20 resultados.
- Abandonar remove apenas a ordem ativa e nunca entrega recompensa.

Engine e persistencia:

- `GuildOperationOutcomesState` recebeu `regionalOrders` opcional com ordem ativa, IDs resgatados e historico.
- Saves antigos normalizam para estado vazio e continuam compativeis.
- Estado ativo valida regiao, objetivo, ciclo, timestamp, target, baseline e recompensa com limites defensivos.
- Claims duplicados, IDs repetidos, historico hostil, inteiros invalidos e ordem ja resgatada sao saneados.
- O estado reutiliza `operation_outcomes_json`; nenhuma coluna SQLite nova foi criada.
- Clique duplo e acoes concorrentes sao protegidos na UI e novamente verificados pela engine.

UI:

- Regional Campaign Orders foi adicionado ao Campaign Operations Dashboard abaixo da Region Mastery.
- O cabecalho resume ciclo local, ofertas disponiveis, regiao ativa e estado atual.
- Tres cards mostram regiao, objetivo, progresso, recompensa e estado Available, In progress, Reward ready, Completed ou Stand by.
- A ordem ativa abre Hunts, Bosses ou Contracts; as outras ficam bloqueadas ate claim ou abandono.
- Activity Log registra aceite, bloqueio, conclusao e abandono sem spam automatico.

QA:

- Harness temporario passou em 20.021 assercoes e foi removido.
- Foram validados ciclo local, tres regioes, rotacao, determinismo, limites de recompensa e 10.000 campanhas geradas.
- Baseline impediu que progresso anterior ao aceite contasse.
- Claim incompleto e duplicado foram bloqueados; claim valido entregou o gold exato uma vez.
- Ordem ativa sobreviveu a rotacao e abandono removeu o estado sem alterar gold.
- Estado ativo e historico malformados foram normalizados sem quebrar o app.
- No browser/Vite, os tres cards apareceram sem overflow, aceite ativou apenas uma ordem, bloqueou as outras e exibiu os comandos esperados.
- O unico erro de console foi o fallback esperado do Tauri SQL sem `invoke` fora do app desktop.

Build e limitacoes:

- `npm.cmd run build` passou com 425 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O teste interativo usou o mock local porque SQLite via Tauri nao esta disponivel no browser Vite.
- A validacao nativa completa de Save/Reload fica para a Etapa 99.5.
- Nao existe anti-cheat de relogio local; a rotacao segue deliberadamente a data do computador.
- Existem tres regioes e tres familias de objetivo nesta primeira versao.

Proximo passo sugerido:

- Etapa 99.5 - QA aprofundada dos Regional Campaign Orders.

## Etapa 99.5 - QA aprofundada dos Regional Campaign Orders

Status: concluida.

Problemas encontrados e corrigidos:

- O normalizador aceitava chaves como `2026-02-30` porque verificava apenas o formato textual.
- Datas de ciclo agora precisam representar um dia local real no calendario.
- Uma ordem ativa com ID, regiao, objetivo, target ou reward adulterados podia ocupar o slot ate abandono manual.
- Identidade, variante, target e reward agora sao comparados com a definicao canonica durante o load.
- IDs claimed arbitrarios e historicos com reward alterado agora sao removidos.
- Targets e recompensas foram centralizados em `src/data/regionalCampaignOrders.ts`, evitando divergencia entre geracao e normalizacao.
- Quando uma ordem antiga sobrevivia a virada, o resumo mostrava seu ciclo em vez do dia atual.
- O resumo agora usa sempre a data local atual e mantem a ordem antiga separadamente na grade.
- O historico persistido nao era visivel; o painel agora mostra os cinco claims mais recentes com regiao, objetivo, gold e horario.

QA automatizado:

- Harness temporario passou em 100.097 assercoes e foi removido.
- As tres familias, Hunt minutes, Boss defeats e Contract successes, foram aceitas, avancadas e resgatadas por suas fontes regionais reais.
- Progresso anterior ao aceite, claim incompleto, segundo aceite, claim duplicado e abandono duplicado foram bloqueados.
- Ordem antiga permaneceu ativa junto da rotacao seguinte e nenhum progresso foi perdido.
- Foram validados ID forjado, ciclo impossivel, timestamp invalido, regiao desconhecida e target/reward alterados.
- Gold `NaN` foi reparado, soma extrema saturou em `Number.MAX_SAFE_INTEGER` e abandono nao alterou gold.
- Vinte e cinco claims sequenciais preservaram IDs e limitaram o historico visual aos ultimos 20 registros.
- `mapGuild` preservou IDs e historico em round-trip de `operation_outcomes_json`.
- Vinte e cinco mil dias e 97 IDs de guilda mantiveram tres ofertas unicas, ciclos corretos e rewards entre 180 e 380 gold.

QA visual:

- Fixture temporaria exibiu uma ordem Thaeron pronta e dois claims anteriores; o mock original foi restaurado ao final.
- Claim Reward alterou `guild.gold` de 420 para 600 uma unica vez, removeu a ordem ativa e aumentou o historico de 2 para 3.
- A ordem concluida mudou para Completed e as duas restantes voltaram para Available.
- Desktop exibiu um card ready, dois bloqueados, dois claims historicos e nenhum overflow interno.
- Em 980, 760, 520 e 390 px nao houve overflow horizontal nem texto cortado nos botoes.
- A grade de ordens refluiu de tres para uma coluna e o historico de cinco para duas e uma coluna nos breakpoints previstos.
- No Vite permaneceu somente o fallback esperado do Tauri SQL sem `invoke`.

Tauri e SQLite:

- `npm.cmd run build` passou antes e depois das correcoes com 426 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O release foi iniciado com `APPDATA` e `LOCALAPPDATA` isolados e permaneceu ativo, sem tocar no save real.
- `npm.cmd run tauri:dev` compilou 421 crates e abriu o executavel debug contra a mesma copia isolada.
- A copia respondeu `integrity=ok`, mas permaneceu com 27 colunas e sem `operation_outcomes_json`; a migration nativa nao foi alegada como validada.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhuma escrita, fixture ou migration foi aplicada ao banco real.

Limitacoes:

- Save/Reload real de Regional Orders continua pendente ate a camada Tauri aplicar `operation_outcomes_json` ao banco legado.
- O browser Vite valida UI e engine com mock, mas nao substitui o plugin SQL nativo.
- A rotacao usa deliberadamente o relogio local e nao possui anti-cheat de data.
- O historico armazena 20 claims e os IDs de deduplicacao ficam limitados a 60.

Proximo passo sugerido:

- Etapa 100 - Campaign Command Briefing.

## Etapa 100 - Campaign Command Briefing

Status: concluida.

Conceito e engine:

- O Character Hall agora resume o ciclo local atual das Regional Campaign Orders sem duplicar estado.
- O briefing prioriza recompensa pronta, ordem ativa, ofertas disponiveis e ciclo concluido.
- Ordens ativas de um ciclo anterior continuam visiveis junto das tres ofertas do dia atual.
- Estado, progresso, recompensa e alerta sao derivados do ledger canonico existente em `operation_outcomes_json`.
- Nenhuma coluna SQLite, moeda, automacao ou nova regra de recompensa foi criada.

UI e navegacao:

- Um painel compacto mostra ciclo local, comando atual, ofertas disponiveis, claims do dia e ate quatro ordens regionais.
- Cada ordem exibe regiao, objetivo, progresso, recompensa e estado Available, In progress, Claim ready, Completed ou Stand by.
- O comando principal abre Campaign Operations sem aceitar, iniciar ou resgatar operacoes automaticamente.
- O atalho do Character Hall e o menu lateral de Operations recebem `!` somente quando existe reward pronto para claim manual.
- O layout reflui de tres para duas e uma coluna conforme a largura disponivel.

QA automatizado e visual:

- Harness temporario passou em 100.025 assercoes e foi removido.
- Foram validados estados available, active, ready e complete, virada de ciclo, tres claims sequenciais e 25.000 dias/IDs deterministas.
- No browser, o estado inicial exibiu tres ordens disponiveis sem badge e o atalho abriu Operations sem auto-accept.
- Fixture temporaria pronta exibiu `!`, progresso 30/30 e reward de 180g no Character Hall e no menu lateral.
- O atalho de claim apenas navegou: `guild.gold` permaneceu em 420g ate o claim manual dentro de Operations.
- Em 1250, 760, 520 e 390 px nao houve overflow horizontal; a fixture e o mock original foram restaurados.

Build e limitacoes:

- `npm.cmd run build` passou no estado final com 428 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O briefing depende deliberadamente do relogio local e nao possui anti-cheat de data.
- Apenas Regional Campaign Orders entram neste primeiro briefing; outras operacoes continuam em seus paineis atuais.
- Claim, aceite e abandono permanecem exclusivamente no Campaign Operations Dashboard.
- Como nao houve persistencia nova, o banco SQLite real nao recebeu fixture nem alteracao durante o QA visual.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Proximo passo sugerido:

- Etapa 100.5 - QA aprofundada do Campaign Command Briefing.

## Etapa 100.5 - QA aprofundada do Campaign Command Briefing

Status: concluida.

Problemas encontrados e corrigidos:

- O briefing era recalculado apenas quando `guild` mudava; um app aberto durante a meia-noite podia continuar mostrando o ciclo anterior.
- O badge lateral e o comando do Character Hall dependiam do mesmo render e tambem podiam permanecer presos sem alteracao no save.
- Regional Campaign Orders memoizava os cards por `guild`, mas calculava o texto do ciclo com uma nova data; depois da virada, cabecalho e cards podiam divergir.
- Um relogio local compartilhado agora agenda a proxima meia-noite e tambem atualiza ao recuperar foco ou voltar de uma aba oculta.
- Character Hall, menu lateral e board regional recebem a mesma data explicita em cada superficie.
- O card deixou de recalcular seu proprio briefing e agora recebe o modelo ja derivado pelo Character Hall.
- As barras compactas receberam `role=progressbar`, nome regional e valores ARIA limitados entre 0 e 100.

QA automatizado:

- Harness temporario passou em 100.036 assercoes e foi removido.
- Foram cobertos estados available, active, ready e complete, claim duplicado, tres claims sequenciais e gold canonico.
- Ordem pronta de um ciclo anterior permaneceu visivel ao lado das tres ofertas atuais e conservou o unico badge de claim.
- Payload hostil com ID forjado, data impossivel, `NaN`, `Infinity` e historico invalido voltou com seguranca para tres ofertas normais.
- O agendamento da meia-noite foi validado em 23:59:59.900, ao meio-dia e com relogio invalido.
- Vinte e cinco mil combinacoes de guilda/data mantiveram ciclo, tres IDs unicos e progresso entre 0 e 100.

QA visual e navegacao:

- O mock inicial exibiu tres ofertas e nenhum badge de Operations.
- `Review Daily Orders` abriu o dashboard com tres `Accept Order`, nenhuma ordem ativa e nenhum aceite automatico.
- Fixture temporaria pronta exibiu um alerta no Character Hall, um no menu lateral, progresso acessivel 100 e reward 180g.
- `Claim in Operations` apenas navegou; o dashboard mostrou uma unica acao `Claim Reward` e `guild.gold` permaneceu em 420g.
- Restaurar o mock removeu os dois alertas e recuperou as tres ofertas disponiveis.
- Character Hall e Regional Orders foram validados em 1250, 760, 520 e 390 px sem overflow horizontal ou texto de botao cortado.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou antes e depois das correcoes; o estado final possui 429 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O release foi iniciado com `APPDATA` e `LOCALAPPDATA` isolados e permaneceu ativo durante o smoke.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum fixture, claim ou migration foi aplicado ao banco real.

Limitacoes:

- A QA validou o calculo e o agendamento da virada, mas nao manteve uma sessao real aberta ate meia-noite.
- Mudanca manual do relogio com o app continuamente em foco so e percebida no proximo foco/visibility ou timeout agendado; nao existe anti-cheat.
- O browser usa mock porque o plugin SQL depende do runtime Tauri; o release isolado foi iniciado, mas nao recebeu QA manual por clique.
- Save/Reload nativo de Regional Orders no banco legado continua dependente da migration de `operation_outcomes_json` registrada na Etapa 99.5.

Proximo passo sugerido:

- Etapa 101 - Weekly Campaign Briefing.

## Etapa 101 - Weekly Campaign Briefing

Status: concluida.

Conceito e calendario:

- Campaign Operations ganhou um briefing semanal local de segunda-feira a domingo.
- A semana possui tres metas derivadas: concluir cinco Regional Orders, cobrir as tres regioes e cobrir Hunt, Boss e Contract.
- Os estados sao Opening, In progress e Weekly campaign secured.
- O painel mostra dias restantes, gold recebido das ordens diarias, cobertura regional e diversidade de familias.
- Weekly goals nao entregam reward, gold, Renown, item, badge ou claim adicional.
- A virada reutiliza o relogio local da Etapa 100.5 e atualiza na proxima meia-noite, foco ou visibility.

Engine e seguranca:

- `buildWeeklyCampaignBriefing` deriva todo o modelo sem alterar `Guild` ou SQLite.
- Claims eram lidos dos ate 60 `claimedOrderIds`; as Etapas 102/102.5 ampliaram a mesma lista para 192 IDs, sem criar campo novo.
- Cada ID precisa ter data valida, regiao conhecida, objetivo conhecido e variante 0..2.
- Um ID sintaticamente valido ainda precisa corresponder a oferta deterministica da mesma guilda e data.
- IDs forjados, de outra seed, duplicados, impossiveis ou fora da semana nao contam.
- O progresso visual das metas e limitado ao target, enquanto o total semanal pode mostrar ate 21 ordens.
- A semana considera o `cycleKey` da ordem; claim atrasado continua pertencendo ao ciclo original.

UI e navegacao:

- O briefing aparece entre Campaign Region Mastery e Regional Campaign Orders.
- O cabecalho mostra intervalo local, estado e comando para revisar as ordens diarias.
- Cinco resumos exibem orders, regions, order families, daily gold earned e days remaining.
- Tres cards mostram progresso das metas com `progress` semantico.
- Duas matrizes compactas mostram as tres regioes e as tres familias, com quantidade concluida.
- `Review Daily Orders` apenas rola ate o board com ID estavel; nao aceita ou inicia nada.

QA automatizado e visual:

- Harness temporario passou em 100.031 assercoes e foi removido.
- Foram validados Monday/Sunday, virada de ano, uma ordem, fixture balanceada, limite de 21 claims e gold canonico.
- IDs validos mas nao ofertados, seed de outra guilda, duplicatas, datas impossiveis e semanas adjacentes foram ignorados.
- Vinte e cinco mil datas/guildas mantiveram inicio na segunda, fim no domingo e 1..7 dias restantes.
- No mock vazio, o painel mostrou 0/5, 0/3, 0/3 e nenhum gold semanal.
- O atalho moveu Regional Orders de 3344 px para 264 px e preservou as tres ofertas sem aceite automatico.
- Em 1250, 760, 520 e 390 px nao houve overflow horizontal ou texto de botao cortado.
- Fixture temporaria mostrou 5/5, 3/3, 3/3, tres metas completas, seis coberturas e 1.380g derivados.
- O gold real permaneceu 420g; restaurar o mock retornou o estado Opening e o hash original do arquivo.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build e limitacoes:

- `npm.cmd run build` passou no estado final com 431 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- Nenhuma migration ou coluna SQLite foi criada.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- O release foi empacotado, mas nao aberto contra o perfil real; a interacao foi validada no Vite com mock restaurado.
- O sistema nao possui reward semanal, streak, anti-cheat de relogio ou calendario online.
- Claims atrasados contam na semana do ciclo da ordem, nao na semana do clique de claim.

Proximo passo sugerido:

- Etapa 101.5 - QA aprofundada do Weekly Campaign Briefing.

## Etapa 101.5 - QA aprofundada do Weekly Campaign Briefing

Status: concluida.

Correcao de regra:

- A auditoria de 100.000 combinacoes deterministicas encontrou 65 semanas, ou 0,065%, em que as 21 ofertas canonicas cobriam somente duas familias de objetivo.
- A meta fixa de diversidade 3/3 era impossivel nessas rotacoes, mesmo concluindo todas as ordens da semana.
- O briefing agora calcula as familias realmente oferecidas nos sete ciclos locais e usa target 2 ou 3 conforme a rotacao.
- Familias ausentes continuam visiveis com `Not offered this week`, borda tracejada e peso visual reduzido.
- Semanas normais preservam 3/3; nenhum reward, campo de save ou schema SQLite foi adicionado.

QA de engine:

- Harness temporario passou em 100.024 assercoes e foi removido.
- Foram validados semana atual, Tuesday, virada de ano, relogio invalido, limite de 21 claims e percentuais limitados.
- Um ID sintaticamente valido mas nao canonico foi ignorado.
- Vinte e cinco mil guildas/datas confirmaram que `objectivesAvailable` corresponde as ofertas canonicas e que a meta sempre e alcancavel.
- Fixture rara concluiu corretamente 5/5 ordens, 3/3 regioes e 2/2 familias; fixture normal preservou 3/3.

QA visual e navegacao:

- O mock normal exibiu 0/5, 0/3 e 0/3 sem familia indisponivel.
- `Review Daily Orders` rolou ate o board diario sem aceitar, iniciar ou reivindicar uma ordem.
- Fixture rara exibiu `Weekly campaign secured`, 2/2 e uma familia indisponivel com estilo discreto.
- O painel foi validado em 1250, 760, 520 e 390 px sem overflow horizontal ou botao cortado.
- O mock temporario foi restaurado sem diff; o unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build e limitacoes:

- `npm.cmd run build` passou com 431 modulos.
- `npm.cmd run tauri:build` passou e gerou os pacotes desktop.
- O save real permaneceu com 81.920 bytes e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- A semana continua derivada do `cycleKey`, sem reward semanal, servidor, calendario online ou anti-cheat de relogio.
- A interface foi testada por clique no Vite com mock; o release Tauri foi empacotado sem ser aberto contra o perfil real.

Proximo passo sugerido:

- Etapa 102 - Weekly Campaign Archive.

## Etapa 102 - Weekly Campaign Archive

Status: concluida.

Conceito e engine:

- O Weekly Campaign Briefing ganhou um arquivo recolhivel com as oito semanas completas anteriores; a semana atual nunca entra no historico.
- Cada registro e reconstruido com a mesma validacao canonica do briefing e recebe estado `Campaign secured`, `Campaign recorded` ou `No retained record`.
- O arquivo mostra ordens, regioes, familias disponiveis, gold diario e metas concluidas por semana.
- Resumos acumulam semanas registradas, semanas completas, ordens arquivadas e gold recebido das ordens diarias.
- IDs forjados, de outra seed, fora do calendario ou pertencentes a semana atual nao contaminam os totais.
- Nenhum reward semanal, claim adicional, servidor, tabela ou campo de save foi criado.

Retencao e compatibilidade:

- `claimedOrderIds` passou de 60 para 192 IDs, suficiente para oito semanas arquivadas mais a semana atual no ritmo maximo de tres ordens por dia.
- Saves antigos continuam validos e crescem naturalmente ate o novo limite.
- O normalizador preserva os 192 IDs validos mais recentes quando recebe um ledger acima do limite.
- `claimHistory` detalhado continua limitado a 20 entradas e nao e usado como fonte absoluta do arquivo.
- Semanas sem claims retidos usam o texto honesto `No retained record`, pois saves antigos podem ter perdido IDs pela retencao anterior.

UI e QA:

- `Open Archive` e `Close Archive` controlam o painel com `aria-expanded` e sem alterar gameplay.
- O estado vazio mostrou oito semanas, 0/8 registradas e nenhum gold.
- Fixture mista mostrou uma semana 5/5, 3/3 e 3/3 como secured, uma semana parcial com duas ordens e seis semanas sem registro.
- O arquivo foi validado em 1250, 760, 520 e 390 px sem overflow horizontal ou botao cortado.
- Harness temporario passou em 100.024 assercoes, cobrindo oito semanas, exclusao da atual, viradas de calendario, limites, canonicalidade e retencao dos IDs mais novos.
- O mock temporario foi restaurado sem diff; o unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 432 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- O release foi empacotado, mas nao aberto contra o perfil real; a interacao foi validada no Vite com fixtures restauradas.

Limitacoes:

- O arquivo exibe no maximo oito semanas e depende dos IDs ainda presentes no ledger local.
- Saves anteriores a Etapa 102 nao recuperam claims que ja haviam sido descartados pelo limite antigo de 60.
- O historico e derivado do `cycleKey`, sem calendario online ou protecao contra mudanca manual do relogio.

Proximo passo sugerido:

- Etapa 102.5 - QA aprofundada do Weekly Campaign Archive.

## Etapa 102.5 - QA aprofundada do Weekly Campaign Archive

Status: concluida.

Bugs encontrados e corrigidos:

- O limite 180 cobria apenas 60 dias no ritmo maximo; oito semanas arquivadas mais ate sete dias da semana atual exigem 189 claims.
- Na fixture de nove semanas cheias, o ledger antigo reteve 180/189 IDs e reduziu a semana mais antiga de 21 para 12 ordens.
- O limite foi elevado para 192, preservando uma pequena margem acima dos 189 IDs necessarios.
- A normalizacao aplicava o limite antes de validar o formato; 30 strings invalidas no fim do JSON reduziram 189 claims validos para 150.
- IDs agora sao aparados, validados e deduplicados do mais recente para o mais antigo antes de ocuparem uma das 192 vagas.
- Os demais arrays que usam `normalizeIds` preservaram seu comportamento original.

QA automatizada:

- O harness temporario passou em 100.030 assercoes e foi removido.
- Nove semanas completas mantiveram 189/189 IDs; as oito semanas arquivadas conservaram 21 ordens cada e a semana atual ficou fora do total 168.
- Foram validados lixo no fim do save, tipos incorretos, duplicatas, overflow de 250 IDs, newest-first, ID sintaticamente valido nao canonico e gold agregado.
- Uma rotacao rara confirmou `Campaign secured` com diversidade 2/2.
- Virada de ano, limites 1..8 e 20.000 combinacoes deterministicas mantiveram semanas unicas, ordenadas e denominadores 2..3.

QA visual:

- `Open Archive` exibiu oito cards e `Close Archive` removeu o painel com `aria-expanded` sincronizado.
- O rodape informou o limite real de 192 claims e nenhuma ordem diaria foi aceita ou ativada ao interagir com o arquivo.
- Em 1250, 760, 520 e 390 px nao houve overflow horizontal no documento ou no painel.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou com 432 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum fixture, claim ou migration foi aplicado ao banco real.

Limitacoes:

- Saves antigos nao recuperam claims ja descartados pelos limites anteriores de 60 ou 180.
- O arquivo continua limitado a oito semanas e derivado do `cycleKey` local, sem servidor ou anti-cheat de relogio.
- A interacao foi validada no Vite; o release Tauri foi empacotado sem ser aberto contra o perfil real.

Proximo passo sugerido:

- Etapa 103 - Campaign Trend Comparison.

## Etapa 103 - Campaign Trend Comparison

Status: concluida.

Conceito e comparacao:

- O Campaign Archive ganhou um painel de tendencia entre a semana atual e a anterior no mesmo checkpoint local.
- Uma terca-feira atual e comparada apenas com segunda e terca da campanha anterior, nao com os sete dias fechados.
- Quatro metricas mostram deltas independentes: ordens concluidas, regioes cobertas, familias de objetivo e gold diario recebido.
- O estado geral e `Ahead`, `Steady`, `Behind` ou `No checkpoint activity yet`, derivado da maioria das quatro metricas.
- Diversidade compara percentuais, preservando equivalencia entre semanas normais 3/3 e rotacoes raras 2/2.

Projecao e baseline:

- `Projected orders` extrapola o ritmo medio diario atual ate domingo e limita o resultado a 21 ofertas.
- `Previous final` mostra o fechamento completo da campanha anterior, separado do checkpoint usado no delta.
- As medias de ordens e gold consideram apenas semanas com registro retido; semanas `No retained record` nao viram zeros artificiais.
- O painel tambem mostra quantidade de semanas no baseline e taxa de campanhas secured.
- Toda a analise e informativa: nao entrega reward, bonus, penalidade, claim ou mutacao de save.

Engine e seguranca:

- `buildWeeklyCampaignTrend` filtra os claims pelo `cycleKey` do checkpoint antes de reutilizar o briefing canonico.
- Claims de dias futuros da semana atual nao antecipam progresso na comparacao.
- Claims posteriores ao mesmo dia da semana anterior entram no `Previous final`, mas nao no delta de checkpoint.
- IDs forjados ou nao correspondentes a seed/data/regiao continuam ignorados pela validacao canonica existente.
- O arquivo de oito semanas e reutilizado como baseline sem nova coluna ou JSON persistido.

QA automatizada e visual:

- Harness temporario passou em 100.020 assercoes e foi removido.
- Foram validados estados opening, ahead e behind, deltas positivos/negativos, checkpoints Monday/Sunday, virada de ano e projecao 0..21.
- Claims futuros e nao canonicos foram ignorados; o fechamento anterior preservou claims posteriores ao checkpoint.
- Vinte mil guildas/datas mantiveram quatro metricas, checkpoints 1..7 e baseline vazio estavel.
- Fixture visual `Ahead` mostrou 5 contra 1 ordem, projecao 18 e baseline anterior sem ativar uma Regional Order.
- O painel foi validado em 1250, 760, 520 e 390 px sem overflow horizontal.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 433 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- O release foi empacotado sem ser aberto contra o perfil real; a interacao ocorreu no Vite com o mock restaurado.

Limitacoes:

- A projecao e linear e informativa; nao tenta prever disponibilidade futura, dificuldade ou falhas das ordens.
- Semanas sem claims retidos nao participam das medias historicas.
- O sistema permanece local, derivado do relogio e sem anti-cheat para alteracao manual da data.

Proximo passo sugerido:

- Etapa 103.5 - QA aprofundada do Campaign Trend Comparison.

## Etapa 103.5 - QA aprofundada do Campaign Trend Comparison

Status: concluida.

Correcao defensiva:

- A auditoria reproduziu um defeito real: fornecer ao trend um `WeeklyCampaignArchive` de outra data podia trocar `Previous final` e as medias do baseline por dados incompativeis.
- `WeeklyCampaignArchive` agora identifica a guilda de origem e a semana local usada como referencia.
- `buildWeeklyCampaignTrend` reutiliza o archive fornecido apenas quando guilda, semana atual e intervalo da primeira semana anterior correspondem ao contexto solicitado.
- Archives antigos, cruzados entre guildas ou construidos para outra semana sao ignorados e reconstruidos a partir do save atual.
- A protecao e somente derivada: nao adiciona persistencia, reward, claim, bonus ou migration.

QA automatizada:

- A reproducao isolada confirmou o erro antes da correcao: o fechamento anterior mudou de 5 para 0 ordens e o baseline de 1 para 0 semanas.
- O mesmo caso passou depois da correcao, preservando 5 ordens anteriores e uma semana registrada.
- Harness temporario passou em 35.025 assercoes sobre 5.000 guildas/datas deterministicas e foi removido.
- Foram cobertos archives validos, guilda incorreta, semana incorreta, checkpoints Monday-Sunday, relogio invalido, claims futuros, IDs nao canonicos, projecao 0..21 e baseline 0..8.
- Os builders preservaram imutabilidade da guilda em todos os cenarios e sempre retornaram quatro metricas com medias finitas.

QA visual:

- Operations e Campaign Archive abriram no Vite com o estado `No checkpoint activity yet`, quatro metricas e cinco resumos historicos.
- Abrir e fechar o archive manteve a Regional Order em `None`; nenhuma ordem foi aceita ou alterada pela analise.
- O painel foi validado em 1250, 760, 520 e 390 px sem overflow horizontal no documento, archive ou trend.
- O unico erro no console foi o fallback esperado do Tauri SQL sem `invoke` no navegador Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 433 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum fixture, claim, migration ou execucao do release foi aplicado ao perfil real.

Limitacoes:

- A projecao continua linear e informativa, dependente do relogio local e sem anti-cheat de data.
- Archives construidos manualmente sem a nova identidade nao sao reutilizados; o engine os recompoe com seguranca.
- O QA interativo ocorreu no Vite; o pacote Tauri foi validado por build, sem abrir o executavel contra o save real.

Proximo passo sugerido:

- Etapa 104 - Campaign Performance Records.

## Etapa 104 - Campaign Performance Records

Status: concluida.

Recordes derivados:

- O Campaign Archive ganhou um quadro de melhores marcas construido apenas com semanas concluidas que ainda existem no ledger local.
- `Most orders` identifica a maior quantidade de Regional Orders concluidas em uma semana.
- `Highest gold` identifica o maior total semanal recebido diretamente de Daily Regional Orders.
- `Widest reach` identifica a maior cobertura entre as tres regioes de campanha.
- `Best diversity` compara a porcentagem de familias disponiveis cobertas, mantendo `2/2` equivalente a `3/3` em rotacoes raras.
- Empates mostram quantas semanas dividem a marca e usam a semana mais recente como referencia visual.
- `Best secured run` reconstrui a maior sequencia consecutiva de campanhas secured dentro das oito semanas retidas.

Engine e seguranca:

- `buildWeeklyCampaignRecords` recebe o archive canonico ja construido e retorna quatro cards, estado vazio, contagem de semanas e streak.
- Semanas `No retained record` nao disputam recordes, mesmo que um payload hostil carregue numeros nelas.
- Valores `NaN`, `Infinity`, negativos ou nao numericos sao normalizados antes de formar placares e labels.
- O builder nao altera archive, guilda, Regional Orders, rewards, gold ou save.
- Nenhuma coluna SQLite, JSON persistido, moeda, claim, bonus ou automacao foi adicionada.

Interface:

- O painel `Campaign Performance Records` aparece dentro do Campaign Archive, entre o trend semanal e os oito cards historicos.
- Cada card mostra sigil, categoria, marca, semana vencedora e estado `Record`, `Open` ou quantidade de empates.
- O estado sem historico mostra quatro vagas abertas e `No secured run yet` sem inventar zeros como recordes reais.
- A grade usa quatro colunas no desktop, duas no tablet e uma em telas estreitas.

QA automatizada e visual:

- Harness temporario passou em 140.013 assercoes sobre 20.000 histories deterministicas e foi removido.
- Foram cobertos archive vazio, maximos independentes, empates, prioridade da semana mais recente, `2/2` contra `3/3`, streak interrompida, payload hostil e imutabilidade.
- Claims canonicos reais alimentaram o archive e produziram os quatro recordes com a week key correta.
- No Vite, o estado vazio e uma fixture de tres semanas foram inspecionados visualmente dentro de Operations.
- A fixture exibiu 3 ordens empatadas, 880g, 3/3 regioes e 2/3 familias sem aceitar ou ativar Regional Order.
- O painel passou em 1250, 760, 520 e 390 px sem overflow horizontal, corte de cards ou texto fora do container.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 434 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- A fixture visual foi removida antes do build final e nenhum release foi aberto contra o perfil real.

Limitacoes:

- Recordes existem apenas dentro das oito semanas ainda retidas; semanas antigas descartadas nao podem ser reconstruidas.
- O streak secured tambem e limitado a essa janela e nao representa necessariamente a maior sequencia lifetime da guilda.
- A etapa e informativa e nao entrega recompensa por quebrar um recorde.

Proximo passo sugerido:

- Etapa 104.5 - QA aprofundada do Campaign Performance Records.

## Etapa 104.5 - QA aprofundada do Campaign Performance Records

Status: concluida.

Falhas reproduzidas e corrigidas:

- Um archive fora de ordem escolhia a semana mais antiga como vencedora de um empate, contrariando a regra visual de priorizar a mais recente.
- Semanas duplicadas aumentavam `recordedWeeks`, `tiedWeeks` e o streak secured.
- Duas campanhas secured vizinhas no array eram tratadas como consecutivas mesmo com uma semana calendario ausente entre elas.
- `buildWeeklyCampaignRecords(null)` lancava excecao em vez de produzir o estado vazio seguro.
- A reproducao original exibiu 3 semanas registradas para apenas 2 week keys unicas, streak incorreto de 3 e range invertido `2026-07-20 - 2026-07-12`.

Normalizacao cronologica:

- Entradas agora exigem week keys reais, inicio na segunda-feira, fim no domingo e intervalo exato de seis dias.
- O builder ordena as semanas da mais recente para a mais antiga sem alterar o array recebido.
- Week keys duplicadas contam apenas uma vez, e somente as oito semanas validas mais recentes permanecem elegiveis.
- Empates usam a primeira vencedora depois da ordenacao cronologica, preservando a referencia mais recente.
- Streaks secured exigem diferenca exata de sete dias; gaps, semanas recorded e semanas empty interrompem a sequencia.
- Range labels vazios recebem fallback com as duas week keys canonicas.

QA automatizada:

- O caso que falhava passou com 2 semanas unicas, 2 empates, referencia em `2026-07-20`, streak 1 e archive nulo seguro.
- Harness temporario passou em 140.027 assercoes sobre 20.000 histories deterministicas e foi removido.
- Foram cobertos `null`, `undefined`, entries ausentes, datas impossiveis, weekdays errados, ranges quebrados, status desconhecido, duplicatas, gaps, shuffle e limite de oito semanas.
- Uma sequencia real de tres campanhas secured sobreviveu ao shuffle; uma sequencia de duas separada por gap foi corretamente dividida.
- Claims canonicos continuaram produzindo a week key esperada e nenhum input foi mutado.

QA visual:

- Campaign Performance Records abriu no Campaign Archive com quatro cards e estado vazio coerente.
- O painel foi validado em 1250, 760, 520 e 390 px, passando de quatro para duas e uma coluna sem overflow horizontal.
- `Active order` permaneceu `None`; abrir o archive nao alterou gameplay nem criou claim.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 434 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum fixture, claim, migration ou execucao do release foi aplicado ao perfil real.

Limitacoes:

- Recordes e streaks continuam limitados as oito semanas retidas, nao ao historico lifetime completo.
- A validacao usa calendario local derivado das week keys, sem servidor ou anti-cheat de relogio.
- O QA interativo ocorreu no Vite; o release Tauri foi apenas empacotado.

Proximo passo sugerido:

- Etapa 105 - Regional Order Variety.

## Etapa 105 - Regional Order Variety

Status: concluida.

Variedade das ordens:

- As tres familias existentes continuam sendo `hunt_minutes`, `boss_defeats` e `contract_successes`.
- Cada familia ganhou tres apresentacoes de campo com label, titulo e descricao proprios.
- Hunts alternam entre `Route patrol`, `Field suppression` e `Long watch`.
- Bosses alternam entre `Threat intercept`, `Priority bounty` e `Apex response`.
- Contracts alternam entre `Supply escort`, `Field recovery` e `Frontier relief`.
- Cada apresentacao combina deterministicamente com as tres variantes de target/reward e com a regiao diaria, formando 27 combinacoes por familia ao longo da rotacao.

Intensidade e interface:

- Variantes existentes agora mostram intensidade `Routine`, `Priority`, `Extended` ou `Critical`, conforme a familia.
- O overline de cada card combina regiao, intensidade e assignment antes do titulo principal.
- Titulos e descricoes explicam o contexto local sem alterar a atividade real exigida.
- Destination continua abrindo Hunts, Bosses ou Contracts conforme o objective original.
- Nenhuma imagem externa, premium, online, evento ou moeda nova foi adicionada.

Compatibilidade e balanceamento:

- O formato `regional-order:cycle:region:objective:variant` permaneceu identico.
- A selecao de objective, variant, target e reward nao mudou; somente a apresentacao derivada foi ampliada.
- Active orders antigos sao reconstruidos pelo mesmo ID e mantem snapshot de target/reward valido.
- Claims historicos continuam canonicos e preservam Weekly Campaign, Archive, Trend e Performance Records.
- Os rewards permanecem entre 180g e 380g e nenhum target foi aumentado.
- A apresentacao e deterministica por cycle, region e objective, impedindo reroll ao abrir ou recarregar a tela.

QA automatizada e visual:

- Harness temporario passou em 200.031 assercoes sobre 30.000 ofertas geradas e foi removido.
- A amostra encontrou os nove titulos e todas as 27 combinacoes objective/intensity/presentation.
- Foram validados determinismo, tres regioes, formato legado do ID, targets, rewards, destinations e dados de apresentacao.
- IDs reais da Etapa 104 continuaram disponiveis em 2026-07-20 e preservaram 3 claims e 880g no archive.
- Fluxos de Hunt, Boss e Contract passaram por accept, progresso ready e claim com o reward original.
- No Vite, uma Route patrol foi aceita, manteve sua apresentacao no estado ativo, abriu Hunts e foi abandonada com retorno das tres ofertas.
- O board passou em 1250, 760, 520 e 390 px sem overflow horizontal ou card cortado.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 434 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum fixture, claim, migration ou execucao do release foi aplicado ao perfil real.

Limitacoes:

- As novas variacoes mudam contexto e apresentacao, nao criam novas familias de progresso persistente.
- Uma rotacao diaria ainda pode oferecer a mesma familia em mais de uma regiao, como acontecia antes.
- O sistema depende do relogio local e continua sem anti-cheat de data.

Proximo passo sugerido:

- Etapa 105.5 - QA aprofundada do Regional Order Variety.

## Etapa 105.5 - QA aprofundada do Regional Order Variety

Status: concluida.

Falha reproduzida:

- A selecao independente por hash ainda permitia que duas regioes com a mesma familia recebessem o mesmo assignment no mesmo board.
- Em 2026-07-28, Thaeron e Eldoria exibiam `Map the Outer Routes` simultaneamente.
- A auditoria encontrou 1.520 boards com repeticao em uma amostra de 5.000 guildas/datas.
- A repeticao reduzia a variedade percebida mesmo com nove apresentacoes cadastradas.

Correcao de distribuicao:

- O presentation seed agora parte de cycle + objective e recebe o indice canonico da regiao como deslocamento.
- Duas ou tres regioes com a mesma familia sempre recebem indices de apresentacao diferentes dentro daquele ciclo.
- O board conhecido passou a mostrar `Suppress the Hunting Grounds`, `Hold the Regional Watch` e `Map the Outer Routes`.
- A regra continua deterministica e nao depende de abrir, fechar ou recarregar o painel.
- ID, objective, variant, target, reward, destination e snapshot ativo nao foram alterados.

QA automatizada:

- A reproducao de 5.000 boards caiu de 1.520 repeticoes para zero.
- Harness temporario passou em 525.011 assercoes sobre 25.000 boards e 75.000 ofertas e foi removido.
- Foram cobertos determinismo, tres regioes, unicidade dentro da familia, nove titulos e 27 combinacoes objective/intensity/presentation.
- Uma rotacao anual cobriu todas as 27 combinacoes de regiao, objective e assignment.
- IDs reais da Etapa 104 preservaram Weekly Briefing, Archive e Performance Records com 3 claims e 880g.
- Active order de 2026-07-20 continuou visivel no ciclo seguinte com apresentacao completa, target/reward originais e sem mutar o save.

QA visual:

- O board real de 2026-07-28 mostrou tres titles e assignments distintos para as tres Hunts.
- `Active order` permaneceu `None`; a inspecao nao aceitou, abandonou ou claimou ordem.
- O board passou em 1250, 760, 520 e 390 px sem overflow horizontal ou card cortado.
- O unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke` no Vite.

Build, Tauri e SQLite:

- `npm.cmd run build` passou no estado final com 434 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O save real permaneceu com 81.920 bytes, timestamp original e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum fixture, claim, migration ou execucao do release foi aplicado ao perfil real.

Limitacoes:

- A unicidade vale dentro da mesma familia no board diario; familias diferentes ja usam conjuntos de titulo distintos.
- A etapa nao adiciona novas familias de progresso, targets ou rewards.
- O ciclo continua local e sem anti-cheat para alteracao manual da data.

Proximo passo sugerido:

- Etapa 106 - Campaign Difficulty Bands.

## Etapa 106 - Campaign Difficulty Bands

Status: concluida.

Modelo:

- Cada Regional Campaign Order oferece tres faixas antes do aceite: `Standard`, `Veteran` e `Elite`.
- `Standard` abre no guild level 1 e usa target/reward base.
- `Veteran` abre no guild level 3, multiplica target por 1,5 e reward por 1,6, com minimo de duas unidades.
- `Elite` abre no guild level 5, multiplica target por 2 e reward por 2,25, com minimo de tres unidades.
- Targets fracionarios sao arredondados para cima e rewards para o inteiro mais proximo.
- O intensity label diario continua descrevendo a variante sorteada; difficulty descreve o compromisso escolhido pelo jogador.

Engine e persistencia:

- O ID diario da ordem nao muda com a dificuldade, preservando o ledger e impedindo multiplos claims da mesma oferta.
- O snapshot ativo salva difficulty, target e reward canonicos da faixa aceita.
- Claim history preserva a difficulty para reconstruir cards concluidos e o briefing local.
- Ordens antigas sem difficulty normalizam para `standard` e mantem target/reward anteriores.
- Snapshots com target ou reward incompatível com a faixa declarada sao descartados no load.
- Abandonar nao entrega reward; aceitar faixa bloqueada ou claimar duas vezes nao muta a guilda.

Interface:

- Cada card disponivel ganhou um segmented control compacto com faixa, target e reward antes do aceite.
- Faixas bloqueadas mostram o guild level exigido e permanecem desabilitadas.
- O card ativo, o resumo do board, o historico e o Campaign Command Briefing exibem a faixa persistida.
- Standard, Veteran e Elite usam acentos discretos sem alterar a identidade visual MMORPG do painel.

Validacao:

- Harness temporario passou em 75 assercoes cobrindo tres faixas, tres familias, variantes, desbloqueios, escala monotônica, reload, claim, duplicacao, legado e snapshot forjado.
- `npm.cmd run build` passou com 434 modulos.
- O board real no Vite mostrou Standard habilitado no guild level 2 e Veteran/Elite bloqueados para levels 3/5.
- O layout passou em 1250, 760, 520 e 390 px sem overflow horizontal, card cortado ou texto truncado nos controles.
- Nenhuma ordem foi aceita no save durante o QA visual; o unico erro do browser foi o fallback esperado do Tauri SQL sem `invoke`.
- `npm.cmd run tauri:build` passou com executavel release, MSI e instalador NSIS.
- O SQLite real permaneceu byte a byte inalterado durante a validacao.

Limitacoes:

- A etapa escala apenas target e guild gold; nao adiciona loot exclusivo, Renown ou bonus premium.
- O desbloqueio usa o guild level local atual e nao cria compra, pagamento ou atalho de monetizacao.
- O jogo continua offline e nao tenta impedir alteracoes manuais no relogio ou no save local.

Proximo passo sugerido:

- Etapa 106.5 - QA das Campaign Difficulty Bands.

## Etapa 106.5 - QA das Campaign Difficulty Bands

Status: concluida.

Correcoes:

- Bosses e Contracts com target base 1 agora escalam estritamente para 1, 2 e 3 nas faixas Standard, Veteran e Elite.
- A assinatura legada `acceptRegionalCampaignOrder(guild, id, now)` voltou a interpretar a data corretamente e continua aceitando Standard.
- IDs de ordem invalidos retornam uma lista vazia de opcoes em vez de lancar excecao.
- A selecao visual volta para a primeira faixa desbloqueada depois de reset, reload ou reducao do guild level.
- Acentos de dificuldade agora se aplicam apenas a cards disponiveis e nao sobrescrevem bordas de estados active ou ready.

Compatibilidade e seguranca:

- O target minimo complementa os multiplicadores existentes sem alterar IDs diarios ou rewards.
- Saves antigos sem difficulty continuam normalizados como Standard.
- Difficulty desconhecida e snapshots forjados com target/reward divergentes sao descartados sem mutar a guilda.
- Claim antecipado, claim duplicado e ordem inexistente falham fechados.

Validacao:

- Harness temporario passou em 191.139 assercoes.
- Foram gerados 10.000 boards deterministas e 90.000 opcoes de dificuldade.
- Foram concluidos 1.500 fluxos completos, 500 por faixa, cobrindo aceite, progresso, reload, claim, historico e duplicacao.
- Tambem foram cobertos unlocks dos guild levels 0 a 8, API legada, IDs invalidos, saves antigos e snapshots hostis.
- Browser confirmou Standard habilitado e Veteran/Elite bloqueados no guild level 2.
- O layout passou em 1250, 760, 520 e 390 px sem overflow horizontal, controles cortados ou botoes fora da viewport.
- Nenhuma ordem foi aceita durante o QA visual, preservando o save real.
- `npm.cmd run build` passou com 434 modulos; permaneceu apenas o aviso conhecido de chunk acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O SQLite real permaneceu byte a byte inalterado, com 81.920 bytes e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- As faixas ainda escalam apenas objetivo e guild gold; loot e recompensas especiais permanecem fora desta etapa.
- O ciclo continua totalmente local e nao inclui anti-cheat de relogio ou save.

Proximo passo sugerido:

- Etapa 107 - Campaign Reward Tiers.

## Etapa 107 - Campaign Reward Tiers

Status: concluida.

Modelo:

- Cada difficulty agora possui um reward tier deterministico, sem sorteio adicional no claim.
- `Standard` oferece `Field Purse`: apenas o guild gold ja previsto pela ordem.
- `Veteran` oferece `Quartermaster Cache`: guild gold e `Iron Ore x2`.
- `Elite` oferece `Command Cache`: guild gold e `Enchanted Dust x1`.
- Os materiais sao pequenos, usam item IDs reais e seguem para o Guild Depot, sem depender do personagem selecionado.

Engine e persistencia:

- Reward tier e bonus item sao congelados no snapshot ativo no momento do aceite.
- O claim aplica gold uma unica vez, empilha o material no Guild Depot e recalcula a capacity usada.
- O historico registra o tier e o item realmente associado ao novo claim.
- Saves antigos com ordem ativa recebem o cache canonico da difficulty ao normalizar.
- Claims historicos sem os novos campos permanecem como `Field Purse`, sem inventar entrega retroativa de material.
- Tier divergente, item trocado, quantidade adulterada e claim duplicado falham fechados.
- A assinatura legada de aceite e a assinatura anterior de claim com `Date` continuam suportadas.

Interface:

- Cada card ganhou uma linha compacta de reward tier com gold e bonus material.
- O seletor de difficulty antecipa o tipo de cache antes do aceite.
- Campaign Command Briefing mostra gold e nome do tier; reward pronta descreve todo o pacote.
- O historico recente mostra cache e material, preservando o visual escuro de client MMORPG.

Validacao:

- Harness temporario passou em 211.012 assercoes.
- Foram gerados 10.000 boards, 90.000 opcoes e 1.500 fluxos completos, 500 por difficulty.
- Claims confirmaram entrega exata de zero material no Standard, `Iron Ore x2` no Veteran e `Enchanted Dust x1` no Elite.
- Compatibilidade cobriu saves ativos antigos, historicos antigos, API legada, tiers forjados, itens adulterados e duplicacao.
- Browser confirmou previews, bloqueios de guild level e Command Briefing no save mock level 2.
- O layout passou em 1250, 760, 520 e 390 px sem overflow, cache cortado ou botoes fora da viewport.
- Nenhuma ordem foi aceita durante o QA visual.
- `npm.cmd run build` passou com 434 modulos; permaneceu apenas o aviso conhecido de chunk acima de 500 kB.
- A primeira tentativa de `npm.cmd run tauri:build` foi interrompida pelo timeout de 120 segundos do terminal; a repeticao com janela maior passou integralmente.
- O Tauri gerou executavel release, MSI e instalador NSIS.
- O SQLite real permaneceu byte a byte inalterado, com 81.920 bytes e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- Os caches sao fixos por difficulty e ainda nao variam por regiao, objetivo ou temporada.
- Nao ha equipamento raro, roll aleatorio, Renown, moeda premium ou recompensa online nesses tiers.
- O ciclo continua local e sujeito ao relogio/save da maquina.

Proximo passo sugerido:

- Etapa 107.5 - QA dos Campaign Reward Tiers.

## Etapa 107.5 - QA dos Campaign Reward Tiers

Status: concluida.

Bugs reproduzidos e corrigidos:

- Uma entrada malformada no Guild Depot, como `null`, fazia o claim lancar excecao durante o calculo de capacity.
- Uma stack em `Number.MAX_SAFE_INTEGER` aceitava o bonus e avancava para um numero inseguro, capaz de perder precisao no save.
- O claim agora canoniza os itens pelo catalogo e valida IDs, ownership, location, quantity, stackability e referencias de container antes de qualquer mutacao.
- IDs duplicados, item desconhecido, equipment empilhado e soma agregada insegura bloqueiam a entrega com mensagem clara.

Atomicidade e compatibilidade:

- Gold, historico e remocao da ordem ativa so acontecem depois que o destino completo do cache passa no preflight.
- Se a entrega falhar, a ordem continua pronta para claim e nenhum gold parcial e concedido.
- O limite exato `Number.MAX_SAFE_INTEGER` continua aceito; apenas a operacao que ultrapassaria o limite e bloqueada.
- Deposito vazio continua recebendo o material e `goldStored` invalido normaliza para zero.
- A assinatura legada de claim com `Date` continua retornando um depot seguro com o cache correspondente.
- Claims duplicados, tier/item forjado e historicos anteriores continuam protegidos pelas regras da Etapa 107.

Validacao:

- Harness temporario passou em 283.884 assercoes.
- Foram gerados 12.000 boards, 108.000 opcoes e 1.800 fluxos completos, 600 por difficulty.
- Doze classes de Guild Depot hostil foram bloqueadas sem excecao ou mutacao parcial.
- Foram validados deposito vazio, limite exato, overflow, gold maximo, save ativo antigo, historico antigo, briefing e card reconstruido.
- Browser confirmou os reward tiers e seis difficulties bloqueadas no guild level 2, sem alertas de interface.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow, tiers cortados ou controles fora da viewport.
- Nenhuma ordem foi aceita durante o QA visual.
- `npm.cmd run build` passou com 434 modulos; permaneceu apenas o aviso conhecido de chunk acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou executavel release, MSI e instalador NSIS.
- O SQLite real permaneceu byte a byte inalterado, com 81.920 bytes e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O preflight protege o claim regional; uma auditoria global de todos os fluxos que escrevem no Guild Depot permanece fora desta etapa.
- Os caches continuam fixos por difficulty e sem tabela regional ou variacao por objetivo.

Proximo passo sugerido:

- Etapa 108 - Regional Reward Tables.

## Etapa 108 - Regional Reward Tables

Status: concluida.

Modelo:

- Cada uma das tres regioes possui uma tabela local com rotas separadas para Hunt, Boss e Contract.
- `Standard` continua entregando apenas o Field Purse em gold.
- `Veteran` e `Elite` usam material e quantidade deterministas da regiao/objetivo; nao existe roll no claim.
- O gold, target, difficulty unlock e limite de um claim por ordem nao foram alterados.

Tabelas:

- Thaeron Hunts: `Old Cloth x2` / `Iron Ore x2`; Bosses: `Spider Silk x2` / `Broken Fang x2`; Contracts: `Old Cloth x3` / `Iron Ore x2`.
- Khazgrim Hunts: `Iron Ore x2` / `Iron Ore x4`; Bosses: `Dwarf Badge x1` / `Iron Ore x3`; Contracts: `Iron Ore x2` / `Enchanted Dust x1`.
- Eldoria Hunts: `Ancient Bone x2` / `Enchanted Dust x1`; Bosses: `Ancient Bone x3` / `Wyvern Scale x1`; Contracts: `Old Cloth x4` / `Enchanted Dust x1`.
- Em cada linha, o primeiro material e Veteran e o segundo e Elite.
- Todos os item IDs existem no catalogo, sao stackable e aparecem em crafting, forge, facilities, projects ou exchanges existentes.

Engine e compatibilidade:

- A tabela regional e resolvida pelo `regionId`, objective e difficulty antes do aceite.
- O item resultante e congelado no active snapshot e reaproveitado no card, briefing, claim e historico.
- Ordens ativas da Etapa 107 com `Iron Ore x2` ou `Enchanted Dust x1` continuam validas e entregam exatamente o cache antigo.
- Ordens anteriores aos reward tiers, sem snapshot de tier/item, adotam a nova tabela regional de forma segura.
- Historicos antigos permanecem verdadeiros e nao sao reescritos para fingir uma recompensa regional diferente.
- Chamadas legadas sem `regionId` usam a antiga tabela global como fallback.
- Item ou quantidade fora da tabela regional e do fallback legado sao descartados no load.

Interface:

- O reward row mostra `Thaeron Stores`, `Ironbound Stores` ou `Relic Stores` acima do tier.
- Tooltips das difficulties antecipam nome completo da tabela, gold e material antes do aceite.
- Campaign Command Briefing exibe gold e short label regional, com pacote completo no tooltip.
- O historico combina difficulty, tabela, tier e item realmente congelado.

Validacao:

- Harness temporario passou em 358.575 assercoes.
- Foram gerados 12.000 boards, 108.000 opcoes e 1.800 claims regionais completos, 600 por difficulty.
- Novecentos snapshots da Etapa 107 mantiveram item, card, claim e historico originais.
- As nove rotas, fallback legado, save anterior aos tiers, item forjado, reload, briefing e duplicacao foram validados.
- Browser confirmou as tres labels regionais no board e no Character Details, sem alertas de interface.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow, texto cortado ou botoes fora da viewport.
- Nenhuma ordem foi aceita durante o QA visual.
- `npm run build` passou com TypeScript, Vite e 434 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- As tabelas sao fixas e pequenas; nao incluem rolagem rara, equipamento, temporada ou rotacao semanal.
- O sistema ainda nao mostra uma tela dedicada com todas as nove rotas fora dos cards diarios.

Proximo passo sugerido:

- Etapa 108.5 - QA das Regional Reward Tables.

## Etapa 108.5 - QA das Regional Reward Tables

Status: concluida.

Bugs reproduzidos e corrigidos:

- O snapshot congelava tier e item, mas nao persistia a identidade da tabela que autorizou o pacote.
- Para manter a Etapa 107 compativel, o normalizador aceitava o cache global antigo; sem uma versao de tabela, uma ordem regional nova adulterada tambem podia se apresentar como legado.
- Novas ordens e claims agora persistem `rewardTableId` igual a regiao proprietaria da tabela.
- Snapshot assinado com tabela de outra regiao, item global substituto, item desconhecido ou quantidade divergente falha fechado no load.
- A validacao acontece antes de gold, historico ou entrega no Guild Depot.

Migracao e compatibilidade:

- Snapshots sem assinatura da Etapa 108 sao reconhecidos pelo item regional e recebem `rewardTableId` ao normalizar.
- Ordens anteriores aos reward tiers adotam o pacote regional atual e tambem recebem a assinatura.
- Caches globais da Etapa 107 continuam sem `rewardTableId`, mantem o item original e sao apresentados como `Guild Stores`.
- Historicos antigos seguem a mesma regra e nao sao relabelados como recompensa de uma regiao que ainda nao existia.
- Quando cache regional e global sao materialmente identicos, a migracao pode adotar a tabela regional sem alterar qualquer recompensa.
- Saves continuam usando o mesmo JSON de `operationOutcomes`; nenhuma migration SQLite estrutural foi necessaria.

Validacao:

- Harness temporario passou em 19.476 assercoes, 200 boards e 1.800 fluxos completos de aceite, progresso, claim, reload e bloqueio de duplicacao.
- Foram cobertos Standard, Veteran e Elite nas tres regioes geradas, com gold, item, depot e historico conferidos.
- Adulteracoes de `rewardTableId`, troca por cache legado e item forjado foram rejeitadas em active snapshots e claims assinados.
- Saves das Etapas 107, 108 e anteriores aos reward tiers foram reconstruidos e mantiveram a recompensa esperada.
- Browser confirmou `Thaeron Stores`, `Ironbound Stores` e `Relic Stores` no Operations Dashboard.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento, painel ou reward rows e sem botoes cortados.
- Nenhuma ordem foi aceita no QA visual; o unico erro de console foi o fallback esperado do SQLite ao executar Vite fora do Tauri.
- `npm run build` passou com TypeScript, Vite e 434 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A assinatura protege snapshots criados a partir desta etapa; um save antigo sem `rewardTableId` ainda precisa ser classificado pelo item para preservar compatibilidade.
- As tabelas continuam deterministicas, pequenas e sem equipamento raro, temporada ou roll aleatorio.

Proximo passo sugerido:

- Etapa 109 - Regional Reward Compendium.

## Etapa 109 - Regional Reward Compendium

Status: concluida.

Implementacao:

- Campaign Operations ganhou um compendio dedicado antes do board diario, sem aceitar, alterar ou claimar ordens.
- Tres abas regionais apresentam Thaeron Marches, Khazgrim Frontier e Eldoria Reaches com suas tabelas e estoque consolidado.
- Cada regiao lista Hunt, Boss e Contract Route; cada rota compara os caches Veteran e Elite, totalizando nove rotas e 18 slots de recompensa.
- O builder deriva as recompensas diretamente de `regionalCampaignRewardTables`, preservando uma unica fonte de verdade para item e quantidade.
- Cada material mostra a quantidade atual no Guild Depot, agregando stacks duplicados com saturacao em `Number.MAX_SAFE_INTEGER`.
- Os usos sao derivados dos dados reais de crafting, Forge, guild facilities, guild projects e cosmetic exchanges; materiais sem destino conhecido recebem o fallback informativo `Trade material`.
- Standard permanece treasury-only e a interface deixa explicito que caches aceitos sao fixados no snapshot e entregues no Guild Depot.
- O painel e somente leitura, totalmente offline e nao altera schema, migration, formato de save, economia ou regras de claim.

Validacao:

- Harness temporario passou em 100.116 assercoes sobre 5.000 depots gerados, incluindo as tres regioes, nove rotas, 18 slots e oito materiais unicos.
- O harness cobriu stacks duplicados, depot vazio, entradas nulas, quantidades `NaN`, saturacao numerica, imutabilidade da fonte e correspondencia exata das tabelas.
- Browser confirmou tres tabs, tres rotas e seis material rows por regiao, com labels, quantidades, usos e estoque real do mock.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow; um texto longo de uso foi ajustado para quebrar corretamente em 980 px.
- Nenhuma ordem foi aceita nem qualquer estado de gameplay foi alterado durante o QA visual.
- `npm run build` passou com TypeScript, Vite e 436 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O compendio e informativo e nao possui busca, filtros de material ou historico proprio.
- As tabelas continuam deterministicas e pequenas, sem roll raro, equipamento, temporada, premium ou servico online.
- A interface mostra o estoque atual, mas nao reserva materiais nem projeta automaticamente quanto falta para cada uso.

Proximo passo sugerido:

- Etapa 109.5 - QA aprofundada do Regional Reward Compendium.

## Etapa 109.5 - QA aprofundada do Regional Reward Compendium

Status: concluida.

Bugs reproduzidos e corrigidos:

- As tabs regionais funcionavam por clique, mas todas permaneciam no ciclo de foco padrao e nao respondiam a setas, Home ou End.
- Os botoes apontavam para IDs de paineis regionais que nao existiam enquanto a respectiva tab estava inativa.
- O tabpanel nao identificava a tab selecionada por `aria-labelledby` e nao oferecia destino de foco proprio.
- Agora existe um unico painel estavel, cada tab possui ID, `aria-controls`, foco roving e selecao sincronizada.
- Arrow Left/Right/Up/Down, Home e End movem foco e conteudo com wrap seguro; tabs e painel receberam indicador visivel de foco.

Validacao de dados:

- Harness temporario passou em 250.166 assercoes sobre 10.000 Guild Depots deterministas.
- Foram conferidas as tres regioes, nove rotas, 18 slots Veteran/Elite, oito materiais unicos e a correspondencia exata com `regionalCampaignRewardTables`.
- Entradas nulas, `NaN`, infinito, fracionarias, negativas, quantidade zero, itemId invalido e depot sem array foram ignorados sem quebrar o builder.
- Stacks duplicados foram agregados; totais regionais e globais foram conferidos independentemente e saturam em `Number.MAX_SAFE_INTEGER`.
- Itens nao relacionados nao entram no estoque do compendio; as fontes e os depots de entrada permaneceram imutaveis.
- Todos os itens de recompensa existem, sao stackable e possuem ao menos um uso real ou fallback informativo.

Validacao de interface:

- Browser confirmou tres tabs, um tabpanel estavel, um unico `tabIndex=0`, tres rotas e seis material rows por regiao.
- Arrow Right, Arrow Down, Arrow Left, Home e End sincronizaram foco, selecao e `aria-labelledby`, incluindo wrap em 390 px.
- O foco ganhou outline dourado visivel sem deslocar o layout.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento ou nos elementos do compendio.
- Nao houve alertas de interface e nenhuma ordem ou estado de gameplay foi alterado durante o QA.
- `npm run build` passou com TypeScript, Vite e 436 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O compendio continua somente leitura, sem busca, filtros, reserva de material ou simulacao de custos.
- O browser usa mock local porque o plugin SQL depende do runtime Tauri; o pacote desktop foi validado por build, nao por clique manual contra o save real.
- Nao existe test runner persistente no `package.json`; o harness foi temporario e removido apos a execucao.

Proximo passo sugerido:

- Etapa 110 - definir a proxima camada offline apos o ciclo de Regional Rewards validado.

## Etapa 110 - Regional Material Acquisition Planner

Status: concluida.

Implementacao:

- Campaign Operations ganhou um planner entre o Regional Reward Compendium e o board de ordens diarias.
- Quando existem prioridades fixadas em Logistics, somente esses objetivos entram no plano; sem pins, entram todos os objetivos ativos.
- A demanda e derivada do `buildGuildLogisticsPlan`, cobrindo proximos upgrades de Facilities, fases de Projects e exchanges de Wardrobe sem duplicar suas regras.
- Requisitos repetidos sao agregados por material e o estoque elegivel do Guild Depot e descontado uma unica vez.
- Stacks locked, aninhados, de personagem ou fora do Guild Depot continuam indisponiveis, seguindo a regra real de consumo dos sistemas existentes.
- Cada falta procura todas as rotas Veteran/Elite nas tabelas regionais, mostra yield por claim, guild level exigido e `ceil(missing / quantity)` claims estimados.
- Rotas desbloqueadas recebem prioridade; depois o ranking prefere menos claims, maior yield e menor requisito de guild level.
- Materiais sem cache regional continuam no plano com orientacao para consultar as fontes de Hunt em Logistics.
- O sistema e somente leitura: nao aceita ordens, nao fixa objetivos, nao reserva materiais e nao altera save/schema.

Interface:

- Header compacto mostra escopo, objetivos considerados, materiais faltantes e unidades totais em aberto.
- A lista de materiais exibe owned/required e shortage; o dossier detalha consumidores, progresso e rotas disponiveis.
- Tabs de material possuem foco roving, Arrow keys, Home/End, IDs estaveis e tabpanel rotulado.
- `Open Logistics` leva ao planejamento original e `Review Regional Orders` rola para o board sem aceitar uma ordem.
- Estados locked, recommended, uncovered e scope complete possuem apresentacao propria.

Validacao:

- Harness temporario passou em 71.999 assercoes sobre 5.000 Guild Depots e niveis de guilda gerados.
- Foram cobertos escopo global e pinned, 11 objetivos iniciais, demandas agregadas, materiais cobertos, stacks duplicados/protegidos, unlocks e imutabilidade.
- Todas as rotas foram conferidas contra `regionalCampaignRewardTables`, incluindo item, quantidade, claims, recomendacao unica e requisito de guild level.
- Browser confirmou no mock 11 objetivos, cinco materiais faltantes, 34 unidades em aberto, tres materiais roteados e dois exclusivos de Hunts.
- Old Cloth, Spider Silk, Dwarf Badge, Rat Tail e Dragon Ember tiveram consumers, rotas e empty states validados.
- Teclado sincronizou foco, selecao e `aria-labelledby`; o comando de review levou o board regional ao topo sem mutar gameplay.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento ou no planner.
- `npm run build` passou com TypeScript, Vite e 438 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A estimativa nao garante que a familia/regiao desejada aparecera na rotacao diaria e nao antecipa progresso futuro de ordens.
- O planner nao inclui demandas avulsas de Forge ou crafting; ele segue deliberadamente os objetivos gerenciados por Logistics.
- Nao existe reserva, auto-pin, auto-accept, auto-claim ou transferencia automatica de materiais.
- O browser usa mock local; o pacote Tauri foi validado por build, sem cliques manuais contra o SQLite real.

Proximo passo sugerido:

- Etapa 110.5 - QA aprofundada do Regional Material Acquisition Planner.

## Etapa 110.5 - QA aprofundada do Regional Material Acquisition Planner

Status: concluida.

Correcoes:

- `Best Route` agora existe somente quando a rota regional esta desbloqueada para o Guild Level atual.
- Quando todas as rotas estao bloqueadas, uma unica rota recebe `Next Unlock` e o ranking prioriza o menor Guild Level antes de claims e yield.
- A mensagem de material faltante em Projects usa o catalogo canonico de itens e nao percorre entradas potencialmente nulas do Guild Depot.
- O planner ganhou progresso com semantica `progressbar`; o cabecalho auxiliar das tabs usa `presentation` e nao interfere na arvore ARIA.
- O estado visual `is-next-unlock` separa claramente uma rota futura de uma recomendacao utilizavel agora.

Validacao:

- Harness hostil passou em 264.690 assercoes, com 10.000 Guild Depots gerados, 12 niveis validos/malformados e dez classes de stacks adversariais.
- Foram cobertos pins validos, obsoletos e duplicados, estoque elegivel, stacks locked/aninhados/de personagem, valores nulos, fracionarios e nao finitos, plano completo e imutabilidade das entradas.
- Todas as rotas preservaram item, quantidade e estimativa de claims das tabelas regionais; recomendacao e proximo unlock permaneceram mutuamente exclusivos.
- Old Cloth apresentou tres rotas de Guild Level 3, Spider Silk e Dwarf Badge uma rota cada, enquanto Rat Tail e Dragon Ember permaneceram sem cache regional inventado.
- Home, End e as quatro setas mantiveram foco, selecao, tab stop unico e `aria-labelledby` sincronizados.
- Browser validou 11 objetivos, cinco materiais, 34 unidades faltantes e o atalho `Review Regional Orders` com o board a 8 px do topo, sem alertas.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento, planner ou descendentes.
- `npm run build` passou com TypeScript, Vite e 438 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O planner continua somente leitura e nao reserva, aceita, conclui ou repete Regional Orders automaticamente.
- Materiais sem cache regional continuam dependendo das fontes de Hunt ja exibidas em Logistics.
- O browser usa o mock local do frontend; a integracao SQLite permanece validada pelo build desktop e pela preservacao do banco, nao por cliques manuais nesta etapa.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 111 - definir a proxima camada offline apos o planner regional validado.

## Etapa 111 - Regional Acquisition Opportunity Board

Status: concluida.

Implementacao:

- Campaign Operations ganhou um board compacto entre o Regional Material Acquisition Planner e as tres Regional Campaign Orders do ciclo atual.
- A engine cruza as faltas vivas de Logistics com os bonus materials da rotacao local deterministica, sem duplicar regras de demanda, estoque ou recompensa.
- Cada pedido pode gerar no maximo uma oportunidade; o ranking considera estado atual, acesso pelo Guild Level, cobertura util da falta, yield e nivel exigido.
- Quando todas as dificuldades compativeis estao bloqueadas, o board prioriza o menor Guild Level real em vez da recompensa mais distante.
- Ordens ativas, prontas ou concluidas usam o snapshot congelado de dificuldade, tabela, item, quantidade e gold.
- O resumo exibe ciclo, quantidade de materiais em falta, materiais distintos encontrados e oportunidades acionaveis.
- `Review Order` centraliza e move o foco para o card regional exato, que agora possui ID estavel, `tabIndex` programatico e nome acessivel.
- O sistema e derivado e somente leitura: nao aceita, abandona, conclui, reserva ou repete pedidos e nao cria save/schema novo.

Interface:

- Cards mostram regiao, objetivo, pedido, estado, item, quantidade, cobertura da falta, saldo restante, dificuldade, Guild Level e gold.
- Estados `available`, `active`, `ready`, `blocked`, `locked` e `completed` possuem rotulos e tratamento visual proprio.
- O layout usa tres colunas em desktop e uma coluna ate 760 px; no mobile o status ocupa linha propria e o resumo usa grade 2x2.
- O empty state informa quando nenhuma recompensa da rotacao atende uma falta atual e mostra a proxima virada local.

Validacao:

- Harness temporario passou em 23.550 assercoes sobre 366 rotacoes locais e cinco faixas de Guild Level.
- Foram cobertos determinismo, um match por pedido, resumos exatos, ranking do proximo unlock, cobertura clampada, imutabilidade e entradas hostis.
- Estados active, ready, completed e blocked foram validados usando as engines reais de accept/claim e snapshots reais de recompensa.
- Guild Depot totalmente abastecido produziu empty state estavel; data invalida, niveis NaN/infinito/fracionario e depot malformado nao quebraram o board.
- Browser confirmou cinco faltas, um match bloqueado no mock Level 2 e navegacao com foco para o pedido de Thaeron correspondente.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento, board ou descendentes.
- O console do Vite apresentou somente a falha esperada do Tauri SQL Plugin fora do runtime desktop, usando o mock local.
- `npm run build` passou com TypeScript, Vite e 440 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O board mostra apenas a rotacao de hoje e um melhor match por pedido; nao projeta rotacoes futuras nem soma varias dificuldades do mesmo pedido.
- A oportunidade nao garante conclusao: requisitos, progresso e aceite continuam sob controle manual no board regional original.
- Materiais fora das tabelas regionais continuam dependendo das fontes de Hunt exibidas em Logistics.
- Nao existe auto-accept, auto-claim, reserva de material, transferencia, pagamento, online ou moeda nova.
- O browser usa o mock local; o pacote Tauri foi validado por build e pela preservacao exata do SQLite, nao por cliques manuais contra o save real.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 111.5 - QA aprofundada do Regional Acquisition Opportunity Board.

## Etapa 111.5 - QA aprofundada do Regional Acquisition Opportunity Board

Status: concluida.

Correcoes:

- A engine agora confirma `instanceof Date` antes de acessar `getTime`, aceitando valores runtime nulos, strings, objetos e datas invalidas com fallback seguro.
- Cada `Review Order` ganhou nome acessivel unico com regiao e titulo da missao, eliminando comandos indistinguiveis quando dois ou tres matches aparecem juntos.
- Cards de Regional Campaign Orders focados programaticamente agora exibem contorno visual dedicado de 2 px.
- A revisao passou a ser agendada depois do evento nativo e ganhou tratamento explicito para `Enter` e `Space`, impedindo que o navegador devolva o foco ao botao.

Validacao de engine:

- Harness temporario passou em 70.677 assercoes sobre 1.826 dias locais, equivalentes a cinco anos completos de rotacoes.
- Dez mil Guild Depots hostis cobriram entradas nulas, vazias, locked, aninhadas, de personagem, negativas, NaN e infinitas.
- Cada oportunidade foi conferida contra o Regional Material Acquisition Planner, o status atual e a difficulty option ou snapshot real correspondente.
- Item, quantidade, gold, tabela regional, cobertura, saldo restante, ciclo, proxima virada, contadores e imutabilidade foram validados.
- Transicoes available, active, ready, completed, blocked e locked passaram usando accept, progress, claim, carry-over e abandon das engines reais.
- Um active order do ciclo anterior nao vazou para a lista atual; os novos matches permaneceram blocked ate o abandono manual.
- Guild Depot totalmente abastecido produziu empty state sem oportunidades, e datas runtime malformadas nao quebraram a engine.

Validacao de interface:

- Browser confirmou nome acessivel especifico no botao e no card de destino, alem de `tabIndex=-1` nos tres pedidos regionais.
- Clique, `Enter` e `Space` centralizaram e mantiveram foco no pedido exato, com outline calculado de 2 px.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento, board ou descendentes.
- A captura final em 390 px confirmou resumo 2x2, card em coluna unica, status em linha propria e comando visivel.
- O console do Vite apresentou somente a falha esperada do Tauri SQL Plugin fora do runtime desktop.
- `npm run build` passou com TypeScript, Vite e 440 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou e gerou executavel release, pacote MSI e instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O board continua somente leitura e nao aceita, abandona, conclui, reserva ou repete pedidos automaticamente.
- O browser usa mock local porque o SQLite depende do runtime Tauri; o pacote desktop e o hash do banco sao validados separadamente.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 112 - definir a proxima camada offline depois do ciclo regional validado.

## Etapa 112 - Regional Acquisition Forecast

Status: concluida.

Implementacao:

- Campaign Operations ganhou um forecast depois das ordens atuais, preservando o fluxo imediato de review/accept antes do planejamento futuro.
- A engine calcula as proximas sete datas locais a partir de amanha, sempre ao meio-dia local para atravessar mudancas de calendario e DST com seguranca.
- Cada dia gera as tres ofertas deterministicas reais e cruza Veteran/Elite com as faltas atuais do Regional Material Acquisition Planner.
- Cada oferta mostra no maximo um melhor match; o ranking prefere dificuldade desbloqueada, depois o menor proximo unlock, maior cobertura util, yield e menor requisito.
- O forecast agrega materiais distintos encontrados, materiais alcancaveis no Guild Level atual, total de ofertas e primeira data com cache acessivel.
- Active orders, claims e snapshots atuais nao contaminam a previsao: somente `guild.id`, Guild Level, tabelas canonicas e fotografia atual de Logistics entram no calculo.
- O sistema e totalmente derivado, sem save/schema, reserva, aceite, claim, transferencia ou automacao.

Interface:

- Header compacto mostra horizonte, materiais faltantes, materiais encontrados e quantos sao alcancaveis.
- Sete cards exibem `Tomorrow`/dias restantes, data local, quantidade de ofertas, regiao, dificuldade, tabela, item, yield, cobertura e Guild Level.
- Dias com caches acessiveis, apenas bloqueados ou sem match possuem estados visuais distintos.
- O footer identifica a primeira data alcancavel ou informa que nao existe cache acessivel no horizonte.
- O layout usa quatro colunas no desktop, duas ate 980 px e uma ate 520 px.

Validacao:

- Harness temporario passou em 449.341 assercoes sobre 3.653 datas, equivalentes a dez anos completos de inicio de forecast.
- Cada um dos sete ciclos foi conferido contra `buildRegionalCampaignOffers`, difficulty options, reward item, quantidade, gold, tabela e Logistics demand reais.
- Foram validados determinismo, datas consecutivas, virada de ano, ano bissexto, fronteiras historicas de DST, resumos, ranking e imutabilidade.
- Dez mil Guild Depots hostis cobriram entradas nulas, vazias, locked, aninhadas, de personagem, negativas, NaN e infinitas.
- Guild Depot abastecido produziu sete dias vazios; datas runtime invalidas receberam fallback e snapshots forged nao alteraram a previsao.
- Browser confirmou o horizonte `2026-07-30 / 2026-08-05`, cinco faltas, dois materiais encontrados, dez ofertas e zero caches alcancaveis no mock Level 2.
- Contadores ambiguos foram corrigidos: cards contam ofertas visiveis e o resumo conta materiais distintos.
- A coluna do `ItemIcon` foi alinhada aos 42 px reais; dez linhas passaram sem sobreposicao ou overflow.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow no documento, forecast ou descendentes.
- `npm run build` passou com TypeScript, Vite e 442 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou com codigo 0 e gerou o executavel release, o instalador MSI e o instalador NSIS.
- O SQLite local permaneceu intacto: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38` antes e depois do build desktop.

Limitacoes:

- A previsao usa a falta atual como fotografia em todos os sete dias e nao desconta cumulativamente caches hipoteticos.
- O forecast nao promete disponibilidade: uma ordem ativa futura pode bloquear as demais quando o dia chegar.
- Somente o melhor match por oferta e exibido; alternativas de dificuldade continuam no Regional Reward Compendium e no planner.
- Mudanca manual do relogio local altera as rotacoes, sem anti-cheat de data.
- Nao existe notificacao, pin, reserva, auto-accept, auto-claim, online ou persistencia nova.
- O browser usa mock local porque o SQLite depende do runtime Tauri; o pacote desktop e o hash do banco sao validados separadamente.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 112.5 - QA aprofundada do Regional Acquisition Forecast.

## Etapa 112.5 - QA aprofundada do Regional Acquisition Forecast

Status: concluida.

Correcoes:

- O resumo do forecast recebeu nome acessivel proprio, sem alterar a composicao visual compacta.
- Os sete cards agora formam uma lista nomeada e cada dia possui nome acessivel unico composto pelo prazo relativo e pela data local.
- Datas visiveis passaram a usar `<time dateTime>` com a chave local canonica, preservando a formatacao do idioma do sistema.
- Cada conjunto diario de caches virou uma lista nomeada pela data correspondente.
- Cada cache agora e um `listitem` com material, regiao, dificuldade e estado de acesso no nome acessivel, eliminando linhas repetidas indistinguiveis.

Validacao de engine:

- Harness temporario passou em 3.411.941 assercoes sobre 1.826 datas locais, equivalentes a cinco anos completos de inicio de forecast.
- Quatorze estados de Guild Level cobriram limites de desbloqueio, niveis negativos, fracionarios, NaN e infinito.
- Cada dia, oferta e cache foi conferido contra as engines canonicas de Regional Orders, difficulty options e Logistics.
- Foram validados horizonte de sete dias, datas consecutivas, determinismo, imutabilidade, um match por oferta, ranking e todos os resumos agregados.
- Item, quantidade, gold, tabela, requisito, acesso, falta e cobertura foram comparados com as definicoes reais.
- Valores runtime nulos, strings, objetos, arrays, NaN e `Invalid Date` receberam fallback sem quebrar o horizonte.
- Active order, claim e snapshot forjados do ciclo atual nao contaminaram as rotacoes futuras.

Validacao de interface:

- Browser confirmou sete dias, dez caches, sete elementos `<time>`, IDs unicos e referencias `aria-labelledby` validas.
- O snapshot assistivo confirmou nomes especificos para todos os dias e caches, inclusive ofertas repetidas do mesmo material.
- O layout passou em 1250, 980, 760, 520 e 390 px, alternando entre quatro, duas e uma coluna sem overflow.
- Dez linhas de cache passaram sem sobreposicao entre icone, descricao e estado de acesso.
- A captura em 390 px confirmou resumo 2x2, cards em coluna unica, texto de bloqueio e todos os estados visiveis.
- O console apresentou somente a falha esperada do Tauri SQL Plugin fora do runtime desktop, usando o mock local.
- `npm run build` passou com TypeScript, Vite e 442 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou com codigo 0 e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- O forecast continua somente leitura e usa a falta atual como fotografia para todos os sete dias.
- O sistema nao reserva caches, recalcula aquisicoes hipoteticas, aceita pedidos, faz claim ou persiste estado novo.
- O browser usa mock local porque o SQLite depende do runtime Tauri; o pacote desktop e o hash do banco sao validados separadamente.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 113 - definir a proxima camada offline depois do forecast regional validado.

## Etapa 113 - Regional Material Rotation Schedule

Status: concluida.

Implementacao:

- Campaign Operations ganhou uma agenda material-centric logo depois do Regional Acquisition Forecast e antes do roster operacional.
- A engine reutiliza o forecast canonico de sete dias e o Regional Material Acquisition Planner, sem duplicar tabelas de recompensa ou regras de rotacao.
- Todas as faltas atuais entram na agenda, inclusive materiais sem cache no horizonte, evitando confundir ausencia de previsao com deposito abastecido.
- Cada material agrega ocorrencias, janelas alcancaveis, yield total, yield util limitado a falta, saldo potencial, cobertura, regioes e proximo unlock.
- A ordenacao prioriza materiais alcancaveis, depois bloqueados pelo menor Guild Level e por fim os sem ocorrencia regional.
- A agenda e totalmente derivada e offline, sem schema, save, reserva, aceite, claim, transferencia ou automacao.

Interface:

- O header resume horizonte, materiais programados, alcancaveis e sem cache nos sete dias.
- Cada card mostra item, falta real, estado de acesso, proxima janela, aparicoes, cobertura potencial e quantidade de regioes.
- A timeline lista data local, sigla da regiao, dificuldade e yield de cada cache, com nome acessivel completo por ocorrencia.
- Estados `reachable`, `locked` e `unscheduled` possuem texto e tratamento visual distintos.
- O empty state cobre o caso em que Logistics nao possui nenhuma falta ativa.
- O layout usa dois cards por linha no desktop e uma coluna ate 520 px.

Validacao:

- Harness temporario passou em 1.380.976 assercoes sobre 1.096 datas locais, equivalentes a tres anos completos de inicio de agenda.
- Quatorze estados de Guild Level cobriram limites de unlock, niveis negativos, fracionarios, NaN e infinito.
- Cada ocorrencia foi comparada com dia, pedido, regiao, dificuldade, quantidade, acesso e requisito do Regional Acquisition Forecast real.
- Foram validados determinismo, imutabilidade, horizonte, materiais unicos, estados, ordenacao, resumos, yield, cobertura, saldo e proximo unlock.
- Datas runtime nulas, strings, objetos, arrays, NaN e invalidas mantiveram uma agenda segura de sete dias.
- Guild Depot totalmente abastecido produziu empty state com contadores zerados.
- Browser confirmou cinco faltas, dois materiais programados, tres sem cache, zero alcancaveis e dez janelas no mock Level 2.
- A arvore assistiva confirmou section, resumo, lista de materiais, cinco cards, dez ocorrencias nomeadas, dez elementos `<time>` e cinco progressbars.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow ou sobreposicao entre icone, texto, estado e timeline.
- A captura em 390 px confirmou resumo 2x2, cards em coluna unica, timelines em duas colunas e estados bloqueado/sem cache legiveis.
- O console apresentou somente a falha esperada do Tauri SQL Plugin fora do runtime desktop, usando o mock local.
- `npm run build` passou com TypeScript, Vite e 444 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou com codigo 0 e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A timeline inclui yield potencial de caches bloqueados, mas a cobertura acessivel e o progresso contam somente janelas liberadas no Guild Level atual.
- A agenda usa a falta atual como fotografia e nao recalcula o saldo progressivamente entre os sete dias.
- Um pedido ativo futuro pode bloquear temporariamente outras ofertas quando o dia chegar.
- O sistema nao notifica, reserva, aceita, conclui ou faz claim automatico de pedidos.
- O browser usa mock local porque o SQLite depende do runtime Tauri; o pacote desktop e o hash do banco sao validados separadamente.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 113.5 - QA aprofundada do Regional Material Rotation Schedule.

## Etapa 113.5 - QA aprofundada do Regional Material Rotation Schedule

Status: concluida.

Correcoes:

- A engine passou a calcular `reachableYield`, `usefulReachableYield`, saldo acessivel e cobertura acessivel separadamente do potencial total do horizonte.
- Yield acessivel soma apenas ocorrencias desbloqueadas no Guild Level atual; caches bloqueados continuam disponiveis somente como projecao futura.
- A ordenacao entre materiais do mesmo estado agora considera cobertura acessivel antes da cobertura potencial.
- A metrica `Potential` virou `Accessible` e a progressbar passou a refletir somente yield realmente obtenivel no nivel atual.
- Cards bloqueados mostram explicitamente a cobertura projetada depois do Guild Level exigido, sem preencher a barra acessivel.
- Cards sem cache e cards alcancaveis receberam rodapes especificos para saldo real, ausencia de janela e cobertura disponivel.
- O footer da secao esclarece que a timeline inclui janelas bloqueadas, enquanto a cobertura conta apenas caches acessiveis.

Validacao de engine:

- Harness temporario passou em 1.917.313 assercoes sobre 1.826 datas locais, equivalentes a cinco anos completos de agendas.
- Quinze estados de Guild Level cobriram Level 2 bloqueado, primeiro unlock no Level 3, limites superiores, valores negativos, fracionarios, NaN e infinito.
- Yield total, yield util, saldo e cobertura potenciais foram conferidos separadamente de yield, saldo e cobertura alcancaveis.
- Nenhum material bloqueado ou sem agenda produziu yield acessivel; cobertura acessivel nunca ultrapassou cobertura projetada.
- O Level 2 preservou potencial bloqueado com cobertura acessivel zero, e o Level 3 converteu as rotas Veteran correspondentes em yield acessivel.
- Foram revalidados determinismo, imutabilidade, resumos, estados, datas hostis e empty state com Guild Depot abastecido.

Validacao de interface:

- Browser confirmou no mock Level 2 dois materiais bloqueados com `Accessible 0/11` e `0/5`, ambas as barras em 0%.
- Os mesmos cards mantiveram projecoes condicionadas ao Guild Level 3 de `11/11` e `5/5`, sem apresenta-las como obtencao atual.
- Tres materiais sem cache exibiram saldo integral, zero acessivel e mensagem especifica de ausencia no horizonte.
- A arvore assistiva confirmou nomes `accessible coverage` nas cinco progressbars e preservou as dez janelas regionais nomeadas.
- O layout passou em 1250, 980, 760, 520 e 390 px sem overflow, sobreposicao ou quebra dos rotulos de progresso.
- A captura em 390 px confirmou metricas, barras vazias, timelines e projecoes pos-unlock legiveis em coluna unica.
- O console apresentou somente a falha esperada do Tauri SQL Plugin fora do runtime desktop, usando o mock local.
- `npm run build` passou com TypeScript, Vite e 444 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm run tauri:build` passou com codigo 0 e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado antes e depois dos builds: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A projecao pos-unlock continua hipotetica e nao presume que a guilda realmente subira de nivel dentro dos sete dias.
- A agenda nao reserva, aceita, conclui, notifica ou faz claim automatico de pedidos.
- O browser usa mock local porque o SQLite depende do runtime Tauri; o pacote desktop e o hash do banco sao validados separadamente.
- Nao existe test runner persistente no `package.json`; o harness temporario foi removido depois da execucao.

Proximo passo sugerido:

- Etapa 114 - definir a proxima camada offline depois da agenda regional validada.

## Etapa 114 - Item Sprite Foundation

Status: concluida.

Implementacao:

- Foi criada uma fundacao visual baseada em `itemId`, separada dos metadados de gameplay e sem alterar schema, save, raridade, tier ou balanceamento.
- O registro compartilhado `src/data/itemSprites.ts` associa arte somente quando existe um sprite dedicado.
- `ItemIcon` passou a renderizar o sprite como imagem decorativa e manteve o nome acessivel no container, alem dos overlays de quantidade, tier, lock e badges.
- Itens ainda sem arte continuam usando os simbolos semanticos existentes, sem slots vazios ou imagens quebradas.
- Como `ItemIcon` e compartilhado, os sprites aparecem automaticamente em Inventory, Equipment, Loot, Market, Guild Depot, crafting e paineis de Operations que usam esses itens.

Sprites iniciais:

- `Old Cloth` (`old-cloth`).
- `Spider Silk` (`spider-silk`).
- `Rat Tail` (`rat-tail`).
- `Dwarf Badge` (`dwarf-badge`).
- `Dragon Ember` (`dragon-ember`).

Pipeline visual:

- As cinco artes foram geradas pelo ImageGen integrado em modo built-in, como pixel art original de inventario fantasy MMORPG.
- Prompt-base: um unico objeto centralizado, silhueta clara em tamanho pequeno, fundo chroma key `#00ff00`, sem texto, frame, UI, sombra externa ou semelhanca exata com assets de jogos existentes.
- O chroma key foi removido localmente e os arquivos finais foram reduzidos para PNG RGBA `256x256`.
- A validacao confirmou alpha zero nos quatro cantos de todos os arquivos e no maximo tres amostras residuais da cor-chave por sprite em uma grade de 4 px.
- Os assets finais ficam em `public/assets/items/generated/` e nao usam material externo ou protegido.

Validacao:

- Os cinco `itemId` foram conferidos contra `src/data/items.ts` e todos os PNGs finais existem no caminho registrado.
- O browser carregou seis instancias visiveis dos cinco sprites em Logistics, todas com dimensoes naturais `256x256`, sem imagens quebradas ou overflow nos icons.
- O fallback permaneceu ativo para materiais ainda sem arte, incluindo Enchanted Dust e Iron Ore.
- A interface passou em `1280`, `980`, `760`, `520` e `390 px` sem overflow horizontal, sobreposicao ou perda dos nomes acessiveis.
- O console apresentou somente a falha esperada do Tauri SQL Plugin fora do runtime desktop, usando o mock local.
- `npm.cmd run build` passou com TypeScript, Vite e 445 modulos; permanece apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- Esta primeira passagem cobre cinco itens muito reutilizados; o restante do catalogo ainda usa simbolos tipograficos.
- As artes sao uma fundacao incremental e ainda nao formam um atlas otimizado.
- Criaturas, herois, equipamentos vestidos, animacoes e cenarios continuam fora desta etapa.
- Nao houve mudanca de gameplay, persistencia ou economia.

Proximo passo sugerido:

- Etapa 114.5 - QA visual e responsiva da fundacao de sprites de itens.

## Etapa 114.5 - QA visual da fundacao de sprites de itens

Status: concluida.

Validado/corrigido:

- `ItemIcon` agora troca para o simbolo semantico existente quando a requisicao de um sprite registrado falha, evitando imagem quebrada sem remover nome, quantidade ou badges.
- Os cinco `itemId` do registro foram novamente conferidos contra `src/data/items.ts`; nao ha registro sem item, PNG ausente ou arquivo extra no diretorio de producao.
- Todos os sprites permanecem PNG RGBA `256x256`, com alpha zero nos quatro cantos, objeto visivel dentro da tela e pixels semitransparentes nas bordas.
- Logistics exibiu os cinco sprites originais, mais uma segunda instancia de `Old Cloth`, com dimensoes naturais corretas e sem overflow dos icons.
- Guild Depot confirmou `Old Cloth` com sprite e quantidade `x18` no mesmo slot; Iron Ore e Enchanted Dust continuaram usando seus fallbacks tipograficos.
- Inventory confirmou o fallback de supply com `Minor Health Potion x3` e a grade de slots vazios sem regressao.
- Nomes acessiveis continuaram completos nos containers, incluindo nome, raridade, tier, familia/faixa quando aplicavel e tipo visual.
- O Guild Depot passou em `980`, `760`, `520` e `390 px`, com sprites carregados, contidos nos slots e sem overflow horizontal.
- `npm.cmd run build` passou antes e depois da correcao, com 445 modulos e apenas o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes da QA:

- O browser controlado usa o mock local porque o Tauri SQL Plugin nao esta disponivel fora do runtime desktop.
- A superficie de automacao nao permitiu alterar o `src` da imagem para provocar uma falha de rede artificial; o fallback de `onError` foi validado por leitura da implementacao e build, nao por clique interativo.
- O save atual nao possui um equipamento com sprite dedicado, pois esta primeira fundacao cobre materiais e trofeus; overlays de raridade, tier e lock permaneceram cobertos pelo `ItemIcon` compartilhado e pelos itens sem sprite.
- Nao houve mudanca de gameplay, persistencia, economia ou schema SQLite.

Proximo passo sugerido:

- Etapa 115 - expandir sprites originais para supplies e materiais centrais mais frequentes.

## Etapa 115 - Sprites de supplies e materiais centrais

Status: concluida.

Implementacao:

- O registro compartilhado `src/data/itemSprites.ts` passou de cinco para dez sprites originais, mantendo lookup por `itemId` e fallback semantico para todo o restante do catalogo.
- `Minor Health Potion`, `Health Potion` e `Mana Potion` receberam silhuetas distintas para leitura imediata em Inventory, Market NPC, Bazar, hunt preparation e Daily Reward.
- `Iron Ore` e `Enchanted Dust` receberam sprites proprios para Guild Depot, Workbench, Forge, Headquarters, projects e demais paineis compartilhados.
- Nenhum item, preco, peso, raridade, drop, receita ou regra de consumo foi alterado.

Assets adicionados:

- `public/assets/items/generated/minor-health-potion.png`.
- `public/assets/items/generated/health-potion.png`.
- `public/assets/items/generated/mana-potion.png`.
- `public/assets/items/generated/iron-ore.png`.
- `public/assets/items/generated/enchanted-dust.png`.

Pipeline visual:

- As cinco artes foram geradas pelo ImageGen integrado em modo built-in como pixel art original de inventario fantasy MMORPG.
- Cada fonte usou um unico objeto centralizado sobre chroma key uniforme `#00ff00`, sem texto, moldura, interface, sombra externa ou referencia protegida.
- O helper oficial removeu o chroma key com soft matte e despill; as imagens finais foram reduzidas para PNG RGBA `256x256`.
- A validacao confirmou cantos com alpha zero, bordas sem franja verde, objeto dentro da tela e pixels semitransparentes para acabamento do recorte.

Validacao:

- O registro final possui 10 `itemId` e o diretorio de producao possui exatamente 10 PNGs, sem item, asset ou arquivo extra divergente.
- Logistics carregou os cinco sprites anteriores e os novos `Iron Ore`/`Enchanted Dust`, todos com dimensoes naturais `256x256` e contidos nos slots.
- Market NPC exibiu `Minor Health Potion x10`, `Health Potion x10` e `Mana Potion x10` com sprites distintos; Strong Potions e runes mantiveram o fallback tipografico esperado.
- Guild Depot exibiu `Iron Ore x12` e `Enchanted Dust x2` com quantidade, raridade e nomes acessiveis preservados.
- O Guild Depot passou em `520` e `390 px` sem overflow horizontal ou falha de carregamento.
- `npm.cmd run build` passou com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A navegacao interativa ocorreu no browser com mock local porque o Tauri SQL Plugin nao existe fora do runtime desktop.
- O app Tauri nao foi clicado manualmente nesta etapa; o desktop foi validado pelo build completo de release.
- Strong Potions, runes, ammunition, containers, equipamentos e outros materiais continuam usando fallback ate os proximos lotes visuais.

Proximo passo sugerido:

- Etapa 115.5 - QA visual e responsiva dos novos sprites em supplies, Market NPC, Guild Depot e crafting.

## Etapa 115.5 - QA dos sprites de supplies e materiais

Status: concluida.

Correcoes:

- `ForgeMaterialRequirement` passou a usar `ItemIcon`, exibindo o sprite ou fallback semantico ao lado do nome e do contador `disponivel/necessario`.
- Custos de upgrade e aumento de tier deixaram a lista textual de `itemId` e agora reutilizam a mesma linha visual dos materiais de Imbuement.
- Requisitos das receitas no Guild Workbench agora exibem os materiais por sprite sem alterar disponibilidade, custos, ranks ou entrega.
- Os novos layouts usam colunas estaveis para icon, nome e contador, com quebra segura de nomes longos.

Validacao interativa:

- Enhancement Forge exibiu 52 linhas de materiais entre upgrade, tier e Imbuements; todos os sprites registrados carregaram em `256x256` e permaneceram dentro das linhas.
- Custos iniciais mostraram `Iron Ore 12/2`; tier e Imbuements exibiram `Enchanted Dust`, `Dragon Ember` e `Old Cloth`, enquanto materiais ainda sem arte mantiveram fallback.
- Guild Workbench exibiu `Iron Ore 12/2` na receita inicial e `Old Cloth 18/3` com `Enchanted Dust 2/1` em `Apprentice Focus`.
- Workbench passou em `980`, `760`, `520` e `390 px` sem overflow horizontal, falha de imagem ou icon fora da linha.
- Em `390 px`, Market NPC carregou as tres novas potions, Guild Depot carregou os materiais e Inventory exibiu `Minor Health Potion x3`.
- Nomes acessiveis, raridade e overlays de quantidade permaneceram preservados nas superficies compartilhadas.
- `npm.cmd run build` passou antes e depois das correcoes com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A navegacao interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser.
- Nenhuma receita, material, quantidade, preco, drop, raridade ou schema SQLite foi alterado.

Proximo passo sugerido:

- Etapa 116 - expandir sprites originais para Strong Potions, runes e ammunition de uso recorrente.

## Etapa 116 - Sprites avancados de supplies, runes e ammunition

Status: concluida.

Implementacao:

- O registro compartilhado passou de 10 para 18 sprites originais sem alterar a API de `ItemIcon` ou os fallbacks do restante do catalogo.
- `Strong Health Potion` e `Strong Mana Potion` receberam silhuetas reforcadas e distintas das versoes basicas.
- `Light Magic Rune`, `Fire Burst Rune`, `Healing Rune` e `Energy Strike Rune` receberam formatos de pedra e glyphs abstratos proprios.
- `Simple Arrow` e `Piercing Arrow` receberam bundles distintos por arrowhead, fletching e binding, preservando a leitura como ammunition stack.
- `HuntResultPanel` agora usa a definicao real de `src/data/items.ts` para supplies conhecidos, preservando raridade e identidade visual; IDs legados ainda recebem fallback seguro.

Assets adicionados:

- `public/assets/items/generated/strong-health-potion.png`.
- `public/assets/items/generated/strong-mana-potion.png`.
- `public/assets/items/generated/light-magic-rune.png`.
- `public/assets/items/generated/fire-burst-rune.png`.
- `public/assets/items/generated/healing-rune.png`.
- `public/assets/items/generated/energy-strike-rune.png`.
- `public/assets/items/generated/simple-arrow.png`.
- `public/assets/items/generated/piercing-arrow.png`.

Pipeline e validacao:

- As oito artes foram geradas pelo ImageGen integrado em modo built-in como pixel art original, sem texto, moldura, UI ou referencia protegida.
- Sete fontes usaram chroma key `#00ff00`; Healing Rune usou `#ff00ff` para preservar o verde do item.
- O helper oficial aplicou soft matte e despill, seguido por reducao para PNG RGBA `256x256`.
- Todos os arquivos possuem alpha zero nos quatro cantos, objeto completo dentro da tela e pixels semitransparentes nas bordas.
- O catalogo final possui 18 registros e exatamente 18 PNGs, sem item, asset ou arquivo extra divergente.
- Market NPC carregou os oito novos sprites: potions/runes em `x10` e arrows em `x100`, com raridade e nomes acessiveis preservados.
- Os filtros Supplies, Runes e Ammo/Quivers exibiram respectivamente os cinco potions, quatro runes e duas arrows; Light Quiver manteve o fallback tipografico esperado.
- A selecao de `Piercing Arrow` atualizou listagem e dossier com o sprite correto.
- Market passou em `980`, `760`, `520` e `390 px` sem overflow horizontal, imagem quebrada ou sprite fora do slot.
- `npm.cmd run build` passou antes e depois da correcao do Hunt Result com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou os pacotes MSI e NSIS para Windows.
- O SQLite local permaneceu intacto antes e depois do build Tauri: 81.920 bytes, data `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A navegacao interativa usou o browser com mock local porque o Tauri SQL Plugin nao existe fora do runtime desktop.
- O painel de resultado com supply avancado foi validado por leitura e build, nao por completar uma hunt high-level no save atual.
- Nenhum preco, quantidade, consumo, drop, receita, balanceamento ou schema SQLite foi alterado.

Proximo passo sugerido:

- Etapa 116.5 - QA dos sprites avancados em Market, hunt result, supplies e responsividade.

## Etapa 116.5 - QA dos sprites avancados

Status: concluida.

Validacao estrutural:

- O catalogo compartilhado possui 18 registros e a pasta de producao possui exatamente 18 PNGs correspondentes.
- Todos os assets sao RGBA `256x256`, possuem alpha zero nos quatro cantos, conteudo visivel e pixels semitransparentes nas bordas.
- Os oito sprites da Etapa 116 carregaram com dimensao natural `256x256`: Strong Health Potion, Strong Mana Potion, Light Magic Rune, Fire Burst Rune, Healing Rune, Energy Strike Rune, Simple Arrow e Piercing Arrow.
- A leitura de `HuntResultPanel` confirmou o uso da definicao real de item para supplies conhecidas, preservando sprite e raridade; IDs antigos ou desconhecidos continuam protegidos pelo fallback comum.

Validacao interativa:

- Market NPC exibiu Strong Potions e runes em `x10`, arrows em `x100` e as bordas de raridade corretas.
- O filtro Supplies retornou as cinco potions, Runes retornou as quatro combat runes e Ammo/Quivers retornou as duas arrows junto ao Light Quiver.
- Light Quiver, ainda sem arte dedicada, manteve corretamente o fallback tipografico `QV`.
- A selecao de Strong Health Potion e Piercing Arrow atualizou tanto o icone medio da listagem quanto o icone grande do dossier, sem imagem quebrada ou quantidade cortada.
- Market passou em `980`, `760`, `520` e `390 px` sem overflow horizontal; os sprites permaneceram contidos nos slots e o overlay `x100` permaneceu legivel.
- A primeira carga visual foi interrompida quando o processo temporario do Vite encerrou; apos reiniciar o servidor de QA, todos os assets carregaram normalmente, confirmando que nao era uma falha do produto.
- `npm.cmd run build` passou com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A navegacao interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser.
- O resultado de hunt com uma supply avancada foi validado por leitura e build, nao por concluir uma hunt high-level no save atual.
- Nenhuma regra de consumo, preco, quantidade, drop, raridade, balanceamento, persistencia ou schema SQLite foi alterada nesta QA.

Proximo passo sugerido:

- Etapa 117 - expandir sprites originais para containers, quivers e utilities recorrentes.

## Etapa 117 - Sprites de containers, quiver e utilities

Status: concluida.

Implementacao:

- O registro compartilhado passou de 18 para 28 sprites originais sem alterar a API do `ItemIcon`.
- `Light Quiver`, `Adventurer Backpack`, `Small Backpack`, `Loot Bag`, `Supply Bag` e `Rune Pouch` receberam silhuetas proprias para diferenciar equipamento e finalidade de armazenamento.
- `Rope`, `Shovel`, `Torch` e `Travel Scroll` receberam sprites de campo coerentes com o estilo MMORPG classico do inventario.
- Os fallbacks tipograficos das utilities agora usam `RO`, `SV`, `TO` e `SC` caso uma imagem nao possa ser carregada.
- Todos os IDs ja existiam em `src/data/items.ts` e no Market NPC; nenhum item, regra ou destino de inventario novo foi criado.

Assets adicionados:

- `public/assets/items/generated/light-quiver.png`.
- `public/assets/items/generated/adventurer-backpack.png`.
- `public/assets/items/generated/small-backpack.png`.
- `public/assets/items/generated/loot-bag.png`.
- `public/assets/items/generated/supply-bag.png`.
- `public/assets/items/generated/rune-pouch.png`.
- `public/assets/items/generated/rope.png`.
- `public/assets/items/generated/shovel.png`.
- `public/assets/items/generated/torch.png`.
- `public/assets/items/generated/travel-scroll.png`.

Pipeline e validacao:

- As dez artes foram geradas pelo ImageGen integrado como pixel art original sobre chroma key uniforme, sem texto, moldura, UI ou referencia protegida.
- O helper oficial aplicou soft matte e despill; os resultados foram enquadrados em PNG RGBA `256x256` com margem estavel para slots pequenos.
- Nenhum dos dez arquivos possui spill verde visivel e todos preservam o objeto completo dentro da area transparente.
- O catalogo final possui 28 registros e exatamente 28 PNGs correspondentes na pasta de producao.
- Market NPC carregou os dez sprites com dimensao natural `256x256`; todos ficaram contidos nos slots e Torch preservou o overlay `x5`.
- O layout compacto passou com largura util de `375 px`, sem overflow horizontal, imagem quebrada ou sprite fora do slot.
- `npm.cmd run build` passou com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Precos, quantidades, capacidade, allowed item types, raridade, equipamento, balanceamento e schema SQLite permaneceram inalterados.

Proximo passo sugerido:

- Etapa 117.5 - QA dos sprites de containers e utilities em Market, Inventory, Equipment e responsividade.

## Etapa 117.5 - QA dos sprites de containers e utilities

Status: concluida.

Correcao aplicada:

- A QA encontrou duas superficies de equipamento ainda textuais: `EquipmentSlotBox` e os cards compactos de Equipment/Inventory no painel direito.
- Ambas agora usam o `ItemIcon` compartilhado, preservando raridade, tier, quantidade, badges e fallback resiliente sem duplicar regras de sprite.
- O Equipment Panel ganhou uma composicao estavel de icone e detalhes, mantendo stats, Imbuements e o comando Remover.
- O painel direito ganhou sprites pequenos em equipamento e inventario sem remover nomes, enhancements ou marcacao de container.

Validacao interativa:

- Small Backpack foi comprado no Market NPC por 125g e entregue ao inventario de Arkon, reduzindo o saldo mock de 420g para 295g.
- Minor Health Potion x3 foi movida para o backpack; o container mostrou `1/10`, abriu normalmente e preservou o sprite do item armazenado.
- Small Backpack foi equipado com o conteudo dentro, continuou disponivel no navegador de containers e apareceu com sprite `256x256` no Equipment Panel e painel direito.
- Torch x5 foi comprado por 90g e manteve sprite e overlay `x5` no Inventory Grid, lista detalhada e painel direito.
- Os filtros Containers, Utilities e Ammo/Quivers exibiram os dez sprites esperados com os paths corretos e dimensao natural `256x256`.
- Os layouts passaram em `980`, `760`, `520` e `390 px` sem overflow horizontal, imagem quebrada, sprite cortado ou perda de quantidade.
- `npm.cmd run build` passou antes e depois da correcao com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A navegacao interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; as compras e o equip desta QA nao tocaram no save real.
- O fallback por falha HTTP foi validado por leitura do `ItemIcon` e pelos simbolos semanticos, nao por remover um asset da build.
- Nenhum preco, capacidade, allowed item types, regra de equipamento, balanceamento, persistencia ou schema SQLite foi alterado.

Proximo passo sugerido:

- Etapa 118 - expandir sprites originais para equipamentos iniciais e loadouts recorrentes do roster.

## Etapa 118 - Sprites de equipamentos iniciais e loadouts do roster

Status: concluida.

Implementado:

- Dez artes pixel-art originais foram geradas para `Worn Sword`, `Wooden Shield`, `Leather Armor`, `Simple Bow`, `Leather Boots`, `Novice Wand`, `Apprentice Robe`, `Mystic Cap`, `Monk Wraps` e `Cloth Sash`.
- Os novos sprites, junto do `Light Quiver` criado na Etapa 117, cobrem todos os equipamentos atualmente vestidos pelos cinco personagens mock: Arkon, Ayla, Mira, Lyra e Shen.
- O `Cloth Sash` tambem cobre o acessorio recorrente do loadout de Monk e o item inicial presente no inventario de Shen.
- As fontes foram criadas com ImageGen em fundo chroma uniforme, processadas com o helper oficial de remocao de chroma e ajustadas para canvas transparente de `256x256`.
- O catalogo compartilhado `itemSprites.ts` passou de 28 para 38 registros, preservando o fallback semantico do `ItemIcon` para assets ausentes ou falhas de carregamento.
- Equipamentos exclusivos de candidatos futuros, como Leather Helmet, Iron Handwraps, Runed Wand, Ironwood Bow e Ranger Gloves, ficaram fora deste lote para uma expansao posterior orientada pelo roster recrutado.

Validacao:

- Os dez PNGs possuem canvas RGBA `256x256`, cantos transparentes, conteudo visivel, bordas suavizadas e bounding boxes internas seguras.
- A verificacao de chroma nao encontrou verde visivel; os poucos pixels detectados pelo limiar conservador tinham alpha entre 1 e 12 e pertencem apenas a bordas praticamente transparentes.
- A QA no browser percorreu Arkon, Ayla, Mira, Lyra e Shen e confirmou os onze equipamentos vestidos, contando o Light Quiver existente, carregando com dimensao natural `256x256`.
- O Cloth Sash foi validado no inventario de Shen; nenhum sprite ficou quebrado em `980`, `760`, `520` ou `390 px`, e nenhuma dessas larguras apresentou overflow horizontal.
- `npm.cmd run build` passou com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- Nenhum atributo, raridade, tier, preco, drop, equipamento, balanceamento, save ou schema SQLite foi alterado.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; a integridade do save real foi confirmada por hash antes e depois do empacotamento.
- Equipamentos exclusivos de candidatos de recrutamento ainda usam fallback semantico e ficam para um lote visual futuro.

Proximo passo sugerido:

- Etapa 118.5 - QA dos sprites de equipamentos no roster, Character Hall, Equipment e responsividade.

## Etapa 118.5 - QA dos sprites de equipamentos iniciais

Status: concluida.

Validacao interativa:

- Arkon, Ayla, Mira, Lyra e Shen foram alternados pelo Guild Roster; os onze equipamentos vestidos, contando o Light Quiver existente, carregaram com dimensao natural `256x256` e `object-fit: contain`.
- Character Hall exibiu somente os sprites esperados para cada loadout, sem imagem quebrada, fallback indevido ou troca de equipamento entre personagens.
- Inventory & Equipment exibiu Monk Wraps, Leather Armor e Cloth Sash tanto na area principal quanto no painel direito compartilhado.
- Cloth Sash foi equipado no slot de colar e removido novamente; o sprite acompanhou o item e retornou ao inventario como uma unica stack, sem duplicacao.
- Os layouts foram testados em `1180`, `980`, `760`, `520` e `390 px`, sem overflow horizontal, sprite fora da viewport ou imagem quebrada.
- A inspecao visual em `390 px` confirmou cards, quantidades, bordas de raridade e silhuetas legiveis no inventario compacto.
- `npm.cmd run build` passou antes e depois da correcao com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Correcao aplicada:

- O badge `!` do Daily usava offsets negativos e aumentava silenciosamente o `scrollWidth` do botao em viewports estreitas.
- O badge passou a ficar contido no canto superior direito do proprio botao, preservando o destaque e eliminando o overflow interno.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; nenhuma alteracao do teste foi gravada no SQLite real.
- Equipamentos exclusivos de candidatos de recrutamento continuam usando fallback semantico e permanecem fora deste lote.

Proximo passo sugerido:

- Etapa 119 - sprites originais para equipamentos exclusivos dos candidatos de recrutamento.

## Etapa 119 - Sprites dos equipamentos exclusivos de recrutamento

Status: concluida.

Implementado:

- Cinco artes pixel-art originais foram criadas para `Leather Helmet`, `Iron Handwraps`, `Runed Wand`, `Ironwood Bow` e `Ranger Gloves`.
- Leather Helmet completa o loadout de Elis Dawn com protecao comum leve e visual coerente com uma Wayside Healer.
- Iron Handwraps completa o loadout de Bram Reed como progressao direta das Monk Wraps iniciais.
- Runed Wand completa o loadout de Veyra Rune com um foco incomum mais refinado, sem linguagem visual de item endgame.
- Ironwood Bow e Ranger Gloves formam o conjunto de fronteira de Sable Rook, com madeira escura, reforcos metalicos e couro de arqueiro.
- O Starter Loadout do Applicant Dossier deixou de ser apenas textual e agora usa o `ItemIcon` compartilhado para equipamento e consumiveis, mantendo slot, nome e quantidade visiveis.
- Os assets foram gerados com ImageGen em fundo chroma uniforme, processados pelo helper oficial de remocao de chroma e centralizados em canvas transparente `256x256`.
- O catalogo compartilhado `itemSprites.ts` passou de 38 para 43 registros, mantendo fallback semantico para o restante dos equipamentos sem arte dedicada.

Validacao tecnica:

- Os cinco PNGs possuem RGBA `256x256`, cantos transparentes, bordas suavizadas, conteudo visivel e bounding boxes internas seguras.
- A verificacao de alpha superior a 24 nao encontrou nenhum pixel de chroma verde visivel.
- Recruitment Hall foi validada com Elis Dawn, Bram Reed, Veyra Rune e Sable Rook; cada dossier exibiu os quatro itens esperados com sprite natural `256x256` e `object-fit: contain`.
- Os layouts passaram em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal, sprite fora da viewport, botao excedendo o container ou imagem quebrada.
- A inspecao visual em `390 px` confirmou o loadout de Sable Rook com Ironwood Bow, Ranger Gloves, Leather Boots e Mana Potion legiveis e alinhados.
- `npm.cmd run build` passou antes e depois da integracao com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.
- IDs, slots, raridades, valores, atributos, restricoes de vocacao e requisitos de level permaneceram inalterados.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; candidatos bloqueados foram inspecionados no dossier, sem executar recrutamento real.

Proximo passo sugerido:

- Etapa 119.5 - QA dos sprites de recrutamento em Recruitment Hall, Equipment e responsividade.

## Etapa 119.5 - QA dos sprites de equipamentos de recrutamento

Status: concluida.

Validacao tecnica e de dados:

- Leather Helmet, Iron Handwraps, Runed Wand, Ironwood Bow e Ranger Gloves foram revalidados como PNG RGBA `256x256`, com alpha util, bordas suavizadas, cantos transparentes e zero chroma verde visivel.
- O catalogo permaneceu pareado em 43 registros para 43 assets; TypeScript confirmou todos os IDs usados por `guildRecruitCandidates.ts` e pelo engine de recrutamento.
- A leitura de `recruitGuildCandidate.ts` confirmou que cada item e criado pelo ID real e atribuido ao slot do candidato sem mapper visual intermediario.

Validacao interativa:

- Os seis dossiers foram percorridos: Tessa Vale, Corin Fletch, Elis Dawn, Bram Reed, Veyra Rune e Sable Rook exibiram quatro itens cada no Starter Loadout.
- Todos os itens carregaram com dimensao natural `256x256`, `object-fit: contain`, nome acessivel, tooltip semantico e classe de raridade coerente com `items.ts`.
- Leather Helmet apareceu como Common; Iron Handwraps, Runed Wand, Ironwood Bow e Ranger Gloves apareceram como Uncommon.
- Os layouts passaram em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal, sprite fora da viewport, botao cortado ou imagem quebrada.
- Em `390 px`, a escala de texto real foi alterada para `110%` pelo Settings e o dossier de Sable Rook permaneceu sem overflow; a preferencia foi restaurada para `100%` ao final.
- Tessa Vale foi recrutada pelo fluxo real do mock: roster passou de `5/7` para `6/7`, gold de `420g` para `120g` e o contrato ficou marcado como Already Recruited.
- Inventory & Equipment da nova personagem mostrou Worn Sword, Wooden Shield, Leather Armor e Minor Health Potion com sprites `256x256`, sem duplicacao ou imagem quebrada.

Resultado:

- Nenhuma regressao foi encontrada e nenhuma correcao de codigo foi necessaria nesta QA.
- A Recruitment Hall, o engine de recrutamento e o Equipment compartilhado permaneceram funcionalmente inalterados.
- `npm.cmd run build` passou antes e depois da QA com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; o recrutamento de Tessa nao foi persistido no SQLite real.
- Elis, Bram, Veyra e Sable permaneceram corretamente bloqueados por Guild Level/Career Points e foram validados pelos dossiers, dados e leitura do engine, nao por contratos efetivados.

Proximo passo sugerido:

- Etapa 120 - expandir sprites originais para armaduras, shields e accessories recorrentes do early game.

## Etapa 120 - Sprites de armaduras, shields e accessories do early game

Status: concluida.

Escopo orientado pelos dados:

- O catalogo de equipamentos Common/Uncommon ainda sem sprite foi cruzado com referencias reais em Bazaar, bosses, monsters, depot, crafting, equipment sets e inventarios mock.
- O lote foi limitado a `Leather Legs`, `Copper Ring`, `Small Amulet`, `Brass Shield` e `Iron Cuirass`, cobrindo legs, ring, amulet, shield e armor sem misturar armas nesta etapa.
- Leather Legs e Copper Ring fazem parte da oferta local do Bazaar; Small Amulet tambem aparece em boss e no inventario de Lyra.
- Brass Shield aparece em monsters, bosses, Guild Depot e Bazaar; Iron Cuirass aparece em monsters, boss, crafting, Bazaar e no set Iron Expedition.

Implementado:

- Cinco artes pixel-art originais foram geradas com silhuetas e materiais proporcionais as raridades Common/Uncommon.
- Os sources foram criados com ImageGen em fundo chroma uniforme, processados pelo helper oficial de remocao de chroma e centralizados em canvas transparente `256x256`.
- O catalogo `itemSprites.ts` passou de 43 para 48 registros, preservando o fallback semantico para itens ainda sem arte dedicada.
- Nenhum ID, drop, receita, equipamento, bonus de set, preco, atributo, requisito ou regra de gameplay foi alterado.

Validacao tecnica:

- Os cinco PNGs possuem RGBA `256x256`, cantos transparentes, alpha util, bordas suavizadas e bounding boxes internas seguras.
- A verificacao de pixels visiveis nao encontrou nenhum residuo de chroma verde com alpha superior a 24.
- O catalogo ficou pareado em 48 registros para 48 assets e o build TypeScript confirmou os cinco IDs existentes.
- Small Amulet foi validado no Inventory e Forge de Lyra; Brass Shield foi validado no Guild Depot; Iron Cuirass foi validado na receita do Guild Workbench.
- Os tres itens carregaram com dimensao natural `256x256`, `object-fit: contain`, raridade e tooltip semantico corretos.
- O Guild Workbench passou em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal, imagem quebrada ou sprite fora da viewport.
- `npm.cmd run build` passou antes e depois da integracao com TypeScript, Vite e 445 modulos; permanece somente o aviso conhecido do chunk principal acima de 500 kB.
- `npm.cmd run tauri:build` passou e gerou o executavel release, o pacote MSI e o instalador NSIS.
- O SQLite real permaneceu inalterado: 81.920 bytes, timestamp `2026-07-24 23:08:25` e SHA-256 `4E4B97C2DA483E5668180111FA7A4424B1C4A2CD1221582B94FB230AB8F57E38`.

Limitacoes:

- A rotacao de seis ofertas do Bazaar ativa durante o smoke nao continha Copper Ring, Leather Legs, Small Amulet, Brass Shield ou Iron Cuirass; Copper Ring e Leather Legs foram validados por dados, alpha, registro e build, nao por uma oferta visual forcada.
- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; nenhuma compra, craft ou equip foi persistido no SQLite real.

Proximo passo sugerido:

- Etapa 120.5 - QA dos sprites early-game em Inventory, Guild Depot, Bazaar, crafting, Equipment e responsividade.

## Etapa 120.5 - QA dos sprites de equipamentos early-game

Status: concluida.

Validacao interativa:

- A rotacao deterministica `2975957`, iniciada em `2026-08-01T08:50:00.000Z`, foi usada temporariamente para expor Leather Legs e Copper Ring no Bazar Rotativo.
- Leather Legs e Copper Ring foram comprados uma vez para a bolsa de Arkon; o contador avancou para `2/6 acquired` e o saldo mock passou de 420g para 151g.
- Ambos apareceram como stacks unicos no Inventory com sprites naturais `256x256` e `object-fit: contain`.
- Leather Legs equipou no slot legs e Copper Ring no slot ring; os dois foram removidos de volta para a bolsa sem duplicacao ou perda.
- Small Amulet foi revalidado no Inventory e Forge de Lyra, Brass Shield no Guild Depot e Iron Cuirass no Guild Workbench.
- As cinco artes carregaram sem imagem quebrada e mantiveram os IDs, raridades, slots, tooltips e regras existentes.

Responsividade:

- Inventory & Equipment passou em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal na raiz ou body.
- Nenhum sprite saiu da viewport e nenhum botao excedeu seu container nas cinco larguras.
- A inspecao visual em `390 px` confirmou sprites, quantidades e cards legiveis no inventario compacto.

Resultado:

- Nenhuma regressao foi encontrada e nenhuma correcao permanente de codigo foi necessaria.
- A fixture de data foi removida integralmente antes do build final; App e Market voltaram a usar o relogio local real.
- `npm.cmd run build` passou antes da QA; o build final e o pacote Tauri foram validados depois da documentacao.
- O SQLite real permaneceu somente leitura durante esta QA e foi comparado por tamanho, timestamp e SHA-256.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; compras e ciclos de equipamento nao foram persistidos no SQLite real.
- A data futura foi apenas uma fixture temporaria para tornar a oferta deterministica e nao permaneceu no codigo.

Proximo passo sugerido:

- Etapa 121 - sprites originais para armas Common/Uncommon recorrentes do early game.

## Etapa 121 - Sprites de armas Common/Uncommon do early game

Status: concluida.

Escopo orientado pelos dados:

- O catalogo de equipamentos foi cruzado com os sprites existentes e confirmou quatro armas Common/Uncommon recorrentes ainda sem arte dedicada: `Rusty Blade`, `Training Axe`, `Wooden Club` e `Iron Longsword`.
- Rusty Blade, Training Axe e Wooden Club completam as silhuetas iniciais de Sword, Axe e Club.
- As quatro armas aparecem no Bazar Rotativo; Training Axe tambem aparece em boss, Wooden Club e Iron Longsword em monsters, e Iron Longsword em boss, crafting e no set Iron Expedition.
- Worn Sword, Simple Bow, Novice Wand, Ironwood Bow, Runed Wand e Iron Handwraps ja tinham sprites e ficaram fora do lote.

Implementado:

- Quatro artes pixel-art originais foram geradas em fundo chroma uniforme e processadas para alpha local.
- Os sprites finais foram centralizados em canvas RGBA `256x256`, com margem segura e proporcao preservada.
- `itemSprites.ts` passou de 48 para 52 registros e entrega as novas artes por meio do `ItemIcon` compartilhado.
- Nenhum ID, atributo, preco, drop rate, receita, proficiency, requisito, set bonus ou regra de gameplay foi alterado.

Validacao tecnica:

- Rusty Blade recebeu lamina gasta, ferrugem contida e acabamento Common sem efeitos magicos.
- Training Axe recebeu cabeca de ferro funcional e cabo curto, mantendo leitura clara em slots pequenos.
- Wooden Club preserva uma silhueta simples de madeira reforcada, distinta de sword e axe.
- Iron Longsword usa acabamento limpo e detalhe de guilda contido, comunicando raridade Uncommon e o set Iron Expedition sem parecer Legendary.
- Os quatro PNGs foram inspecionados visualmente em tamanho real depois da remocao do chroma.
- Build web e pacote Tauri foram validados depois da integracao final.

Limitacoes:

- Esta etapa adiciona somente a fundacao visual; QA interativa completa em Bazaar, boss loot, monster loot, Guild Workbench, Inventory e Equipment fica para a Etapa 121.5.
- Nenhum drop raro foi forcado ou persistido no SQLite real nesta etapa.

Proximo passo sugerido:

- Etapa 121.5 - QA dos sprites de armas em Bazaar, drops, crafting, Inventory, Equipment e responsividade.

## Etapa 121.5 - QA dos sprites de armas early-game

Status: concluida.

Validacao interativa:

- A rotacao deterministica `2977319`, iniciada em `2026-08-10T19:50:00.000Z`, expos `Wooden Club`, `Rusty Blade` e `Training Axe` simultaneamente no Bazar Rotativo.
- As tres ofertas carregaram sprites naturais `256x256`, `object-fit: contain`, raridade Common e metadados corretos.
- As tres armas foram compradas uma vez para a bolsa de Arkon: o Bazar avancou para `3/6 acquired` e o saldo mock passou de 420g para 78g.
- `Iron Longsword` foi inserida somente na fixture temporaria da bolsa para completar o ciclo de equipamento.
- Wooden Club, Rusty Blade, Training Axe e Iron Longsword equiparam individualmente no slot weapon e retornaram como stacks unicos ao Inventory depois de `Remover`.
- Iron Longsword renderizou na receita real do Guild Workbench.
- Training Axe e Iron Longsword renderizaram na tabela visual de loot de `Grunk the Camp Breaker`.

Fontes de drop:

- A integridade dos dados confirmou Training Axe em `Orc Raider` e Grunk, Wooden Club em `Cyclops Brute` e Iron Longsword em `Forest Troll` e Grunk.
- Todos os IDs resolvem para itens reais e para registros do catalogo compartilhado de sprites.
- O Bestiary atual nao exibe loot tables no Creature Dossier; por isso monster loot foi validado por dados/engine, enquanto boss loot foi validado visualmente.

Responsividade:

- Inventory & Equipment passou em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal na raiz ou body.
- Nenhum sprite saiu da viewport, nenhuma imagem quebrou e nenhum botao excedeu seu container.
- A inspecao visual em `390 px` confirmou o layout compacto, capacidade, cards e sprites legiveis.

Resultado:

- Nenhuma regressao foi encontrada e nenhuma correcao permanente de codigo foi necessaria.
- Fixtures de data, nivel e inventario foram removidas integralmente; o jogo voltou a usar o relogio real e Arkon voltou ao estado inicial level 1.
- Build web e pacote Tauri foram validados depois da documentacao.
- O SQLite real permaneceu inalterado e foi comparado por tamanho, timestamp e SHA-256.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; compras e ciclos de equipamento nao foram persistidos no SQLite real.
- Drops raros de monsters nao foram forcados em uma hunt; suas rotas foram verificadas diretamente nas tabelas consumidas pela engine.

Proximo passo sugerido:

- Etapa 122 - sprites originais para equipamentos Veteran recorrentes do mid game.

## Etapa 122 - Sprites do set Veteran Cryptwarden

Status: concluida.

Escopo orientado pelos dados:

- O catalogo Rare/Veteran level 30 foi cruzado com boss loot, monster loot, crafting, Bazar e equipment sets.
- O lote corresponde ao set `Cryptwarden` completo: `Cryptsteel Blade`, `Gravewood Bow`, `Crypt Scepter`, `Boneweave Wraps` e `Cryptguard Armor`.
- Os cinco itens aparecem juntos no loot de `Crypt Warden`, nas receitas rank 3 do Guild Workbench e no Bazar Rotativo.
- Cryptsteel Blade, Gravewood Bow, Crypt Scepter, Boneweave Wraps e Cryptguard Armor tambem possuem fontes individuais em monsters; Cryptguard Armor reaparece em boss de progressao posterior.

Implementado:

- Cinco artes pixel-art originais foram geradas com identidade compartilhada de aco frio, osso antigo, couro escuro e magia violeta controlada.
- Os sources foram produzidos em fundo chroma uniforme, processados localmente para alpha e centralizados em canvas RGBA `256x256`.
- `itemSprites.ts` passou de 52 para 57 registros, preservando o fallback semantico para itens ainda sem arte dedicada.
- O `ItemIcon` compartilhado propaga as artes para Bazar, boss loot, drops, crafting, Inventory, Equipment, Forge e demais superficies existentes.
- Nenhum ID, rarity, atributo, drop rate, receita, custo, vocation restriction, requirement, set bonus ou regra de gameplay foi alterado.

Direcao visual:

- Cryptsteel Blade usa lamina de aco negro angular, fio frio e runa violeta contida para a rota Vanguard.
- Gravewood Bow combina madeira escura preservada, reforcos de osso e corda violeta para a rota Pathfinder.
- Crypt Scepter funciona como foco ritual de uma mao, com reliquia de osso, metal negro e ressonancia violeta-azulada para Arcanum.
- Boneweave Wraps apresenta um par unico de faixas flexiveis com placas de osso nos nos dos dedos para Discipline.
- Cryptguard Armor ancora o set com placas escuras em camadas, ombreiras de osso, couro e selo violeta central.

Validacao tecnica:

- Os cinco PNGs foram inspecionados visualmente em tamanho real depois da remocao do chroma.
- Dimensoes, alpha, cantos transparentes, bounding boxes, residuos de chroma e pareamento catalogo/assets foram validados antes do build final.
- Build web e pacote Tauri foram validados depois da integracao.

Limitacoes:

- Esta etapa entrega a fundacao visual; QA interativa completa em Bazar, boss loot, monster loot, Guild Workbench, Inventory, Equipment e responsividade fica para a Etapa 122.5.
- Nenhum drop Rare foi forcado ou persistido no SQLite real nesta etapa.

Proximo passo sugerido:

- Etapa 122.5 - QA dos sprites Veteran em Bazar, drops, crafting, Inventory, Equipment e responsividade.

## Etapa 122.5 - QA dos sprites Veteran Cryptwarden

Status: concluida.

Validacao interativa:

- A rotacao deterministica `2977307`, iniciada em `2026-08-10T17:50:00.000Z`, expos `Cryptsteel Blade`, `Gravewood Bow` e `Crypt Scepter` simultaneamente no Bazar Rotativo.
- As tres ofertas exibiram raridade Rare, band Veteran, level 30, familia correta e sprites naturais `256x256` com `object-fit: contain`.
- As tres ofertas foram compradas uma vez para o Guild Depot: o Bazar avancou para `3/6 acquired` e o saldo mock passou de 20.000g para 9.052g.
- O Guild Depot recebeu uma copia de cada item com sprite, tooltip, valor, peso, vocation restriction e metadados do set preservados.
- As cinco receitas rank 3 do Guild Workbench renderizaram Cryptsteel Blade, Gravewood Bow, Crypt Scepter, Boneweave Wraps e Cryptguard Armor sem imagem quebrada.
- Ao selecionar `Crypt Warden`, a tabela `Possible Guild Depot Loot` exibiu visualmente o set completo com os cinco sprites.

Equipment por vocacao:

- Arkon/Guardian equipou e removeu Cryptsteel Blade no slot weapon e Cryptguard Armor no slot armor.
- Ayla/Ranger equipou e removeu Gravewood Bow no slot weapon.
- Mira/Arcanist equipou e removeu Crypt Scepter no slot weapon.
- Shen/Monk equipou e removeu Boneweave Wraps no slot weapon.
- Cada item voltou como uma unica copia ao Inventory; nenhum ciclo gerou duplicacao, perda ou quebra de sprite.
- Levels e inventarios usados no teste foram fixtures temporarias e foram restaurados ao estado inicial real.

Fontes de drop:

- A integridade dos dados confirmou Gravewood Bow e Cryptguard Armor em `Dwarf Guard`, Cryptsteel Blade e Boneweave Wraps em `Ancient Skeleton`, Cryptguard Armor em `Cyclops Brute` e Crypt Scepter em `Cult Acolyte`.
- Cryptguard Armor tambem permanece no loot de `Khazgrim Gatekeeper` alem do set completo em `Crypt Warden`.
- Monster loot foi validado nas tabelas consumidas pela engine porque o Bestiary atual nao exibe loot tables; boss loot foi validado visualmente.

Responsividade:

- Inventory & Equipment passou em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal na raiz ou body.
- Nenhum sprite saiu da viewport, nenhuma imagem quebrou e nenhum botao excedeu seu container.
- A inspecao visual em `390 px` confirmou header, capacidade, cards e controles compactos legiveis.

Resultado:

- Nenhuma regressao foi encontrada e nenhuma correcao permanente de codigo foi necessaria.
- Fixtures de data, gold, level e inventario foram removidas integralmente antes dos builds finais.
- Build web e pacote Tauri foram validados depois da documentacao.
- O SQLite real permaneceu inalterado e foi comparado por tamanho, timestamp e SHA-256.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; compras, entrega e ciclos de equipamento nao foram persistidos no SQLite real.
- Drops Rare de monsters nao foram forcados em hunts; suas rotas foram verificadas diretamente nos dados usados pela engine.

Proximo passo sugerido:

- Etapa 123 - sprites originais para o set Epic/Elite Ember do late game.

## Etapa 123 - Sprites do set Elite Emberforged

Status: concluida.

Escopo orientado pelos dados:

- O catalogo Epic/Elite do level 55 foi cruzado com boss loot, monster loot, crafting, Bazar e equipment sets.
- O lote cobre `Ember Blade`, `Wyvern Bow`, `Ember Staff`, `Dragon Wraps` e `Dragonscale Armor`, as cinco pecas do set `Emberforged`.
- As quatro armas atendem Vanguard, Pathfinder, Arcanum e Discipline; Dragonscale Armor completa o Field Kit compartilhado.
- `Emberheart Amulet`, Legendary/Mythic level 60, foi incluido como artefato culminante do mesmo set.
- As cinco pecas Epic aparecem no loot de `Ember Matriarch`, no Bazar Rotativo e nas receitas rank 4 do Guild Workbench; armas e armadura tambem possuem fontes em Dragon Whelp ou Wyvern Hatchling.
- Emberheart Amulet permanece como recompensa rara da Ember Matriarch e oferta excepcional do Bazar, sem receita de crafting.

Implementado:

- Seis artes pixel-art originais foram geradas com identidade compartilhada de metal carvao, escamas cobre-vermelhas, bronze escurecido e brasa laranja controlada.
- Os sources foram produzidos em fundo chroma uniforme, processados localmente para alpha e centralizados em canvas RGBA `256x256`.
- `itemSprites.ts` passou de 57 para 63 registros, preservando o fallback semantico para itens ainda sem arte dedicada.
- O `ItemIcon` compartilhado propaga as artes para Bazar, boss loot, drops, crafting, Inventory, Equipment, Forge e demais superficies existentes.
- Nenhum ID, rarity, atributo, drop rate, receita, custo, vocation restriction, requirement, set bonus ou regra de gameplay foi alterado.

Direcao visual:

- Ember Blade usa lamina negra larga com canal interno de fogo e escamas cobre para a rota Vanguard.
- Wyvern Bow combina madeira-ferro recurvada, placas de escama e encaixes de brasa para a rota Pathfinder.
- Ember Staff funciona como foco compacto de uma mao, com cristal de fogo preso por garras negras para Arcanum.
- Dragon Wraps apresenta um par cruzado de faixas negras, guardas de escamas e costuras incandescentes para Discipline.
- Dragonscale Armor ancora o set com placas carvao, peitoral de escamas vermelhas e filetes de brasa.
- Emberheart Amulet recebe nucleo rubi mais luminoso, engaste de garras em ouro escurecido e corrente curta para comunicar a categoria Legendary/Mythic.

Validacao tecnica:

- Os seis PNGs foram inspecionados visualmente em tamanho real depois da remocao do chroma.
- Dimensoes, alpha, cantos transparentes, bounding boxes, residuos de chroma e pareamento catalogo/assets foram validados antes do build final.
- Build web e pacote Tauri foram validados depois da integracao.

Limitacoes:

- Esta etapa entrega a fundacao visual; QA interativa completa em Bazar, boss loot, monster loot, Guild Workbench, Inventory, Equipment e responsividade fica para a Etapa 123.5.
- Nenhum drop Epic ou Legendary foi forcado ou persistido no SQLite real nesta etapa.

Proximo passo sugerido:

- Etapa 123.5 - QA dos sprites Emberforged em Bazar, drops, crafting, Inventory, Equipment e responsividade.

## Etapa 123.5 - QA dos sprites Elite Emberforged

Status: concluida.

Validacao interativa:

- Uma fixture temporaria isolada montou seis ofertas deterministicas no Bazar Rotativo: `Ember Blade`, `Wyvern Bow`, `Ember Staff`, `Dragon Wraps`, `Dragonscale Armor` e `Emberheart Amulet`.
- Todas as ofertas exibiram o sprite correto com source natural `256x256`, rarity Epic ou Legendary, family, band Elite/Mythic, level e metadados Emberforged.
- Ember Blade +1 foi comprada uma vez para o Guild Depot; o contador avancou para `1/6 acquired` e o saldo mock passou de 200.000g para 178.520g.
- O Guild Depot recebeu uma unica copia com sprite, enhancement, valor, peso e metadados do set preservados.

Boss loot e crafting:

- A tabela `Possible Guild Depot Loot` da Ember Matriarch exibiu nove entradas e os seis sprites Emberforged, incluindo o Emberheart Amulet com chance de 1,2%.
- O Guild Workbench alcancou Rank 4 / Grandmaster com a fixture e exibiu as cinco receitas Epic com sprites naturais `256x256`.
- Dragonscale Armor foi craftada pelo fluxo real do mock por 9.000g e 48 materiais, entregue ao Guild Depot e registrada no Workshop ledger.
- O workshop avancou de 15 para 16 ordens e o saldo mock terminou em 169.520g, sem duplicacao de recompensa.

Equipment por vocacao:

- Arkon/Guardian equipou Ember Blade, Dragonscale Armor e Emberheart Amulet; o ledger marcou Emberforged `3/3` e ativou Dragon Temper e Heart of the Matriarch.
- Ayla/Ranger equipou e removeu Wyvern Bow no slot weapon.
- Mira/Arcanist equipou e removeu Ember Staff no slot weapon.
- Shen/Monk equipou e removeu Dragon Wraps no slot weapon.
- Cada arma retornou como uma unica copia ao Inventory com sprite, rarity, family, band e set preservados.

Responsividade e integridade:

- Inventory & Equipment passou em `1180`, `980`, `760`, `520` e `390 px` sem overflow horizontal na raiz ou body.
- Nenhum controle saiu da viewport e nenhuma das imagens visiveis ficou quebrada nas cinco larguras.
- A inspecao visual em `390 px` confirmou topbar, inventario, cards de item, botoes e slots de equipamento legiveis e sem sobreposicao.
- O console apresentou somente a falha esperada do Tauri SQL Plugin no Vite, que aciona o mock local fora do runtime desktop.

Resultado:

- Nenhuma regressao permanente foi encontrada e nenhuma correcao de gameplay ou CSS foi necessaria.
- Fixtures de gold, level, status, inventario, materiais, workshop e rotacao do Bazar foram removidas integralmente antes dos builds finais.
- Build web e pacote Tauri foram validados depois da documentacao.
- O SQLite real permaneceu inalterado e foi comparado por tamanho, timestamp e SHA-256.

Limitacoes:

- A QA interativa usou o mock local porque o Tauri SQL Plugin nao esta disponivel no browser; compra, craft e ciclos de equipamento nao foram persistidos no SQLite real.
- Drops Epic e Legendary nao foram forcados em hunts ou raids; suas fontes foram verificadas na tabela visual da Ember Matriarch e nos dados consumidos pela engine.

Proximo passo sugerido:

- Etapa 124 - sprites originais para os dez itens restantes de moeda, creature products e materiais de hunt.

## Etapa 124 - Catalogo completo de sprites de loot e materiais

Status: concluida.

Auditoria do catalogo:

- Os 70 itens reais de `items.ts` foram comparados com o registro compartilhado de sprites.
- Os dez IDs restantes eram `gold-coin`, `troll-tooth`, `rotten-claw`, `minotaur-horn`, `orc-leather`, `ancient-bone`, `cyclops-eye`, `wyvern-scale`, `cultist-charm` e `broken-fang`.
- A selecao cobre moeda, creature products de early/mid/late game, materiais de crafting e loot raro de boss.

Implementacao visual:

- Foram criados dez sprites originais em pixel art, todos RGBA `256x256`, com fundo transparente e margem estavel para uso em slots compactos.
- Gold Coin usa uma pilha dourada com selo abstrato; Troll Tooth e Broken Fang receberam silhuetas distintas para evitar confusao em inventario.
- Rotten Claw, Minotaur Horn e Orc Leather preservam uma leitura terrestre e desgastada para o early game.
- Ancient Bone recebeu uma runa azul discreta, Wyvern Scale usa cobre e brasa, Cultist Charm usa obsidiana e violeta e Cyclops Eye se destaca como trofeu Rare.
- Os dez IDs foram registrados em `itemSprites.ts`; Inventory, Equipment, Hunt Loot, Boss Loot, Bazar, Market NPC, Guild Depot, crafting e demais superficies de `ItemIcon` recebem os sprites automaticamente.
- O diretorio gerado agora contem 73 assets e o registro possui 73 entradas. Todos os 70 IDs do catalogo real possuem sprite dedicado; as tres entradas adicionais permanecem validas para conteudo auxiliar existente.

Integridade e escopo:

- Nenhum valor, peso, rarity, drop rate, receita, custo ou regra de gameplay foi alterado.
- Nenhum campo de save, migration ou schema SQLite foi criado.
- Assets foram produzidos pelo ImageGen integrado, recortados localmente por chroma key e validados com transparencia real.

Validacao:

- Os dez arquivos passaram em dimensao `256x256`, modo RGBA, alpha visivel, cantos transparentes e ausencia de residuo verde/magenta significativo.
- A comparacao automatica entre `items.ts` e `itemSprites.ts` terminou sem item faltante.
- Build web e pacote Tauri foram executados depois da integracao e documentacao.

Limitacoes:

- A Etapa 124 fecha a producao e integracao do catalogo; a QA interativa completa em Hunts, Bosses, Inventory, Quick Sell, crafting e larguras responsivas fica para a Etapa 124.5.
- Drops raros nao foram forcados e o SQLite real nao foi modificado para produzir cenarios de teste.

Proximo passo sugerido:

- Etapa 124.5 - QA do catalogo completo de loot em Hunts, Bosses, Inventory, Quick Sell, crafting e responsividade.

## Etapa 124.5 - QA do catalogo completo de loot

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e o build web baseline passaram antes da fixture.
- Uma fixture temporaria isolada colocou os dez itens finais no Inventory de Arkon e no Guild Depot, elevou o Workshop ao Rank 4 e forneceu gold somente no mock local.
- A fixture foi removida integralmente depois da navegacao; `mockGuild.ts`, `mockCharacters.ts` e `mockDepot.ts` terminaram sem diff.
- O catalogo permaneceu com 70 itens reais cobertos por 73 assets e 73 registros, incluindo as tres utilities auxiliares `rope`, `shovel` e `torch`.

Inventory e Quick Sell:

- Gold Coin, Troll Tooth, Rotten Claw, Minotaur Horn, Orc Leather, Ancient Bone, Cyclops Eye, Wyvern Scale, Cultist Charm e Broken Fang renderizaram no Inventory com nome, quantidade, rarity e valor corretos.
- Os dez sprites carregaram por seus caminhos dedicados com source natural `256x256`; nenhuma imagem caiu no fallback ou ficou quebrada.
- O filtro Loot exibiu os oito creature products; o filtro seguro manteve selecionados por padrao somente Troll Tooth, Orc Leather, Ancient Bone e Broken Fang.
- Rotten Claw, Minotaur Horn, Cyclops Eye, Wyvern Scale e Cultist Charm preservaram os avisos de raridade e nao foram vendidos automaticamente.
- A selecao de Troll Tooth foi alternada e restaurada, atualizando contagem e total sem executar venda ou duplicar estado.

Boss loot e crafting:

- Sewer Broodmother exibiu Broken Fang; Grunk exibiu Troll Tooth e Orc Leather; Crypt Warden exibiu Ancient Bone; Khazgrim Gatekeeper exibiu Cyclops Eye; Ember Matriarch exibiu Wyvern Scale.
- Todas as entradas das cinco tabelas carregaram sprite natural `256x256`, chance, rarity e faixa de quantidade sem imagem quebrada.
- O Guild Workbench abriu em Rank 4 / Grandmaster com 12 materiais indexados na fixture.
- Field Bow, Cryptsteel Blade, Gravewood Bow, Crypt Scepter e Ember Staff validaram Broken Fang, Ancient Bone, Wyvern Scale e Cultist Charm em requisitos reais.
- Contagens disponivel/necessario e sprites permaneceram corretos; nenhum craft foi executado e nenhum material foi consumido.

Hunts e fontes reais:

- A leitura cruzada de `hunts.ts` e `monsters.ts` confirmou fonte real de hunt para todos os dez itens, sem ID orfao.
- Gold Coin aparece na progressao de criaturas; Broken Fang, Troll Tooth, Rotten Claw, Minotaur Horn e Orc Leather cobrem as hunts iniciais e intermediarias.
- Ancient Bone e Cultist Charm pertencem a Ancient Crypt; Cyclops Eye a Cyclops Hills; Wyvern Scale e Broken Fang ao Ember Dragon Nest.
- Uma Sewers Below Thaeron real de um minuto passou por assignment, Hunt Scene, estado Ready e coleta manual unica.
- O resultado concedeu 42 XP, 4g liquido e Rat Tail x2 ao Inventory; o resumo final, Activity Log e retorno do personagem a idle ficaram coerentes.

Responsividade e resultado:

- Inventory, Quick Sell, Boss Loot e Guild Workbench foram validados em `1180`, `760`, `520` e `390 px`.
- Nenhuma largura apresentou overflow horizontal, controle fora da viewport ou imagem quebrada.
- Inspecao visual mobile confirmou topbar, filtros, cards, loot tables, recipe track e quantidades legiveis, sem sobreposicao.
- O console do navegador terminou sem erros ou warnings.
- Nenhuma regressao funcional foi encontrada e nenhuma correcao permanente de gameplay ou CSS foi necessaria.

Limitacoes:

- Drops raros nao foram forcados por repeticao de hunts; suas fontes foram validadas nos dados e nas tabelas reais de boss/crafting.
- A interacao ocorreu no Vite com mock local porque o Tauri SQL Plugin nao opera no browser.
- Nenhuma fixture foi gravada no SQLite real e nenhum fluxo de Save/Reload desktop foi necessario, pois a etapa nao alterou persistencia.

Proximo passo sugerido:

- Etapa 125 - definir e iniciar a proxima frente visual depois do catalogo completo de itens.

## Etapa 125 - Fundacao de sprites de criaturas de Thaeron

Status: concluida.

Escopo visual:

- Foram criados sprites originais para `Sewer Rat`, `Cave Spider`, `Forest Troll`, `Mud Rotter`, `Young Minotaur` e `Orc Raider`.
- A selecao cobre as cinco primeiras Hunts e estabelece silhuetas distintas para feras, aracnideos, criaturas de floresta/pantano e inimigos humanoides armados.
- Todos os seis assets finais usam canvas RGBA `384x384`, fundo transparente, proporcao preservada e margem estavel.

Integracao:

- `creatureSprites.ts` registra os seis IDs reais de `monsters.ts` e suas fontes `generated-original`.
- `CreatureSprite` centraliza tamanho, acessibilidade, carregamento e fallback por iniciais para criaturas ainda sem arte ou imagens indisponiveis.
- Os cards de Hunt em Explore agora destacam a primeira criatura da area.
- A Hunt Scene usa os sprites nos cards posicionados ao redor do personagem, mantendo estado de spawn, HP e destaque do alvo.
- Os cards e o dossier do Bestiary usam a mesma arte compartilhada sem alterar progresso, thresholds ou rewards.

Integridade e escopo:

- Os seis registros foram comparados com os 12 IDs reais do catalogo e nenhum registro orfao foi encontrado.
- Permanecem sem sprite dedicado `Ancient Skeleton`, `Cult Acolyte`, `Cyclops Brute`, `Dragon Whelp`, `Dwarf Guard` e `Wyvern Hatchling`; todos continuam funcionais pelo fallback semantico.
- Nenhum atributo, dano, health, XP, gold, loot table, requisito de Hunt ou regra de combate foi alterado.
- Nenhum campo de save, migration ou schema SQLite foi criado.
- Assets foram produzidos pelo ImageGen integrado e recortados localmente por chroma key.

Validacao:

- Os seis PNGs passaram em modo RGBA, dimensao `384x384`, alpha visivel, bounding box valida e quatro cantos transparentes.
- A inspecao visual confirmou contornos limpos, enquadramento central e silhuetas legiveis.
- O build TypeScript/Vite passou depois da integracao.

Limitacoes:

- A validacao interativa completa em desktop/mobile e no runtime Tauri fica reservada para a Etapa 125.5.
- Esta fundacao cobre metade das 12 criaturas atuais; o segundo conjunto sera planejado depois da QA desta entrega.

Proximo passo sugerido:

- Etapa 125.5 - QA dos sprites de criaturas iniciais em Explore, Hunt Scene, Bestiary e responsividade.

## Etapa 125.5 - QA dos sprites de criaturas iniciais

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e o build web baseline passaram antes da QA.
- O catalogo permaneceu com seis registros validos para 12 monstros reais e nenhum ID orfao.
- Uma fixture temporaria isolada adicionou ao Bestiary as seis criaturas com arte e `Ancient Skeleton` sem arte dedicada.
- A fixture foi removida integralmente depois da navegacao; `mockGuild.ts` terminou sem diff.

Explore e Hunt Scene:

- Os cards de `Sewer Rat`, `Cave Spider`, `Forest Troll`, `Mud Rotter` e `Young Minotaur` carregaram seus PNGs naturais `384x384` no board de Hunts.
- As Hunts ainda sem arte exibiram o fallback semantico sem imagem quebrada ou alteracao no bloqueio por level/acesso.
- Uma Hunt real de `Sewers Below Thaeron` foi iniciada pelo assignment de um minuto.
- Tres Sewer Rats simultaneos renderizaram o mesmo sprite nos estados de alvo, spawn e combate, preservando barras de HP, spawn e posicionamento da cena.
- Finalizar a Hunt retornou Arkon ao fluxo de viagem sem aplicar recompensa duplicada.

Bestiary e fallback:

- Os seis sprites dedicados apareceram juntos no Registry com nome, stage, kills e progresso corretos.
- O dossier selecionado reutilizou a arte em tamanho maior e manteve as estatisticas existentes.
- `Ancient Skeleton` exibiu corretamente as iniciais `AS`, validando o caminho de fallback para as seis criaturas ainda sem sprite.
- Nenhuma imagem visivel apresentou `naturalWidth` zero ou falha de carregamento.

Responsividade:

- Explore e Bestiary passaram em `1440`, `980`, `760`, `520` e `390 px` sem overflow horizontal na raiz ou no body.
- Cards de Hunt, cards do Bestiary e cards compactos da Hunt Scene permaneceram dentro de seus containers.
- A inspecao visual desktop e mobile confirmou sprites legiveis, enquadramento consistente, textos sem sobreposicao e controles preservados.

Resultado e limitacoes:

- Nenhuma regressao permanente foi encontrada e nenhuma correcao de gameplay, componente ou CSS foi necessaria.
- A QA interativa foi executada no Vite com mock local; o unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin fora do runtime desktop.
- Nenhuma fixture foi gravada no SQLite real e nenhum save de producao foi modificado.

Proximo passo sugerido:

- Etapa 126 - sprites originais para as seis criaturas avancadas restantes do catalogo atual.

## Etapa 126 - Catalogo completo de sprites de criaturas

Status: concluida.

Escopo visual:

- Foram criados sprites originais para `Ancient Skeleton`, `Cult Acolyte`, `Cyclops Brute`, `Dwarf Guard`, `Dragon Whelp` e `Wyvern Hatchling`.
- Ancient Crypt ganhou um guerreiro morto-vivo de bronze oxidado e um conjurador encapuzado com magia violeta.
- Khazgrim ganhou um Cyclops macico com clava e um Dwarf Guard compacto com hammer, shield e armadura de mina.
- Ember Dragon Nest ganhou anatomias separadas: Dragon Whelp quadrupede, pesado e Emberforged; Wyvern Hatchling bipede, agil e com wing-arms.
- Todos os assets finais usam canvas RGBA `384x384`, fundo transparente, proporcao preservada e margem estavel.

Integracao e catalogo:

- Os seis IDs foram adicionados ao registro compartilhado `creatureSprites.ts` como fontes `generated-original`.
- Explore recebe automaticamente o sprite da criatura principal das Hunts avancadas.
- Hunt Scene reutiliza os sprites nos estados de spawn, alvo, combate e derrota sem alterar a simulacao.
- Bestiary reutiliza a mesma arte em cards compactos e dossiers grandes.
- O registro agora cobre os 12 IDs reais de `monsters.ts`; nenhuma criatura do catalogo atual depende do fallback por iniciais.

Integridade e escopo:

- Nenhum health, damage, armor, defense, XP, gold, drop rate, loot table ou requisito de Hunt foi alterado.
- Nenhuma migration, campo de save ou mudanca no schema SQLite foi criada.
- O fallback semantico de `CreatureSprite` permanece ativo para conteudo futuro ou falha de carregamento.
- Assets foram produzidos pelo ImageGen integrado, recortados localmente por chroma key e salvos no diretorio compartilhado de criaturas.

Validacao:

- Os seis PNGs passaram em modo RGBA, dimensao `384x384`, alpha visivel, bounding box valida e quatro cantos transparentes.
- A inspecao visual confirmou contornos limpos, equipamento legivel, enquadramento consistente e distincao entre Dragon e Wyvern.
- A comparacao automatica entre `monsters.ts` e `creatureSprites.ts` terminou sem registro faltante ou orfao.
- Build web e pacote Tauri foram executados depois da integracao e documentacao.

Limitacoes:

- A QA interativa completa das tres Hunts avancadas, Bestiary e larguras responsivas fica reservada para a Etapa 126.5.
- A etapa fecha o catalogo atual, mas novas criaturas futuras ainda exigirao arte e registro adicionais.

Proximo passo sugerido:

- Etapa 126.5 - QA do catalogo completo de criaturas em Hunts avancadas, Hunt Scene, Bestiary e responsividade.

## Etapa 126.5 - QA do catalogo completo de criaturas

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e o build web baseline passaram antes da QA.
- Uma fixture temporaria isolada elevou Arkon ao level 65, adicionou supplies e os tres acessos avancados apenas no mock local.
- O Bestiary temporario recebeu os 12 registros reais para validar o catalogo completo em uma unica sessao.
- Arkon, inventario, acessos e Bestiary foram restaurados integralmente depois dos testes; `mockCharacters.ts` e `mockGuild.ts` terminaram sem diff.

Explore e Hunts avancadas:

- `Ancient Crypt`, `Cyclops Hills` e `Ember Dragon Nest` ficaram disponiveis com level/acesso de teste e exibiram seus sprites principais naturais `384x384`.
- Ancient Crypt renderizou alternadamente `Ancient Skeleton` e `Cult Acolyte` em quatro cards simultaneos.
- Cyclops Hills renderizou alternadamente `Cyclops Brute` e `Dwarf Guard` em quatro cards simultaneos.
- Ember Dragon Nest renderizou alternadamente `Dragon Whelp` e `Wyvern Hatchling` em quatro cards simultaneos.
- Os tres fluxos passaram por Explore, Hunt Assignment e `Iniciar Hunt` usando a engine real do mock, sem duplicacao visual ou imagem quebrada.

Hunt Scene:

- Todos os seis sprites avancados carregaram com `naturalWidth` de 384 px.
- Estados de spawn, alvo ativo, HP e combate preservaram bordas, barras e opacidade existentes.
- A inspecao visual confirmou leitura distinta entre skeleton/acolyte, cyclops/dwarf e dragon/wyvern mesmo nos cards compactos.
- Nenhuma das tres cenas apresentou overflow horizontal ou card ultrapassando seu container.

Bestiary completo:

- O Registry exibiu `12/12` registros com 12 imagens dedicadas e nenhum fallback por iniciais.
- Todos os sprites carregaram em sua fonte natural `384x384`; nenhuma imagem apresentou `naturalWidth` zero.
- Cards, busca, filtros, progresso e dossier selecionado permaneceram funcionais e legiveis.

Responsividade e console:

- Bestiary e Ember Dragon Nest passaram em `1440`, `980`, `760`, `520` e `390 px`.
- Nenhuma largura apresentou overflow horizontal na raiz/body, imagem quebrada ou card com overflow interno.
- O unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin no Vite, que ativa o mock local fora do runtime desktop.

Resultado e limitacoes:

- Nenhuma regressao permanente foi encontrada e nenhuma correcao de gameplay, componente ou CSS foi necessaria.
- A QA interativa ocorreu no Vite com fixture descartavel; nenhum save de producao foi gravado.
- O SQLite real permaneceu inalterado e foi verificado por tamanho, timestamp e SHA-256.

Proximo passo sugerido:

- Etapa 127 - definir a proxima frente visual depois do catalogo completo de itens e criaturas.

## Etapa 127 - Fundacao visual dos herois da guilda

Status: concluida.

Escopo visual:

- Arkon recebeu sprite original de Guardian com espada, escudo redondo, malha e couro em tons terrosos.
- Ayla recebeu sprite original de Ranger com arco longo, aljava, capa verde e silhueta leve.
- Mira recebeu sprite original de Arcanist com robes azul-violeta, varinha e energia arcana.
- Lyra recebeu sprite original de Warden com vestes verde-azuladas, cajado natural e sigilo protetor.
- Shen recebeu sprite original de Monk com postura marcial, bandagens e roupas de viagem sem arma.
- Os cinco arquivos finais usam canvas RGBA transparente de `384x384`, enquadramento uniforme e leitura pixel-art.

Integracao:

- `characterSprites.ts` registra os cinco IDs reais do roster e mantem a origem visual explicita.
- `CharacterSprite` centraliza carregamento, tamanhos estaveis, acessibilidade e fallback por iniciais quando a arte estiver ausente ou falhar.
- Character Hall usa os sprites nos cards compactos do roster e no perfil do personagem selecionado.
- O painel direito usa o sprite do personagem ativo sem alterar equipamento, Collections ou dados de progressao.
- Hunt Scene substitui a capsula de iniciais pelo heroi de corpo inteiro no centro do combate.

Integridade e validacao:

- O catalogo foi conferido em `5/5`: Arkon, Ayla, Mira, Lyra e Shen possuem registro e arquivo dedicado.
- Todos os PNGs finais foram validados como RGBA `384x384`, com alpha util e quatro cantos transparentes.
- `npm run build` passou depois da integracao.
- Nenhuma regra de gameplay, atributo, equipamento, Collections, save ou schema SQLite foi alterada.

Limitacoes:

- Rankings, Contracts, Squads e outras listas densas ainda podem usar iniciais; a migracao pode ocorrer gradualmente conforme cada tela receber QA visual.
- A QA interativa completa no Character Hall, painel direito, Hunt Scene e larguras responsivas fica reservada para a Etapa 127.5.
- Os sprites representam a identidade base dos herois; outfits e montarias continuam como selecoes funcionais de Collections, sem composicao visual sobre o corpo nesta etapa.

Proximo passo sugerido:

- Etapa 127.5 - QA dos sprites dos herois no Character Hall, painel direito, Hunt Scene e responsividade.

## Etapa 127.5 - QA dos sprites dos herois

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e o build web baseline passaram antes da QA.
- O catalogo foi reconferido em `5/5`: cinco IDs do roster, cinco registros e cinco PNGs dedicados.
- Todos os arquivos finais mantiveram RGBA `384x384`, alpha util e cantos transparentes.

Character Hall e painel direito:

- Arkon, Ayla, Mira, Lyra e Shen foram selecionados individualmente no roster real.
- Cada selecao atualizou nome, vocacao e sprite correspondente sem arte antiga, imagem quebrada ou fallback indevido.
- Os cinco cards compactos carregaram sua imagem natural de 384 px e o perfil selecionado preservou o enquadramento de `78x78` px.
- O painel direito carregou o sprite do personagem ativo em `48x48` px sem deslocar XP, mastery, equipamento ou inventario.

Hunt Scene:

- Uma Hunt real de `Sewers Below Thaeron` foi iniciada com Arkon pelo fluxo Explore > Hunt Assignment > Iniciar Hunt.
- Arkon apareceu no centro do palco com fonte natural de 384 px e caixa visual estavel de aproximadamente `104x116` px.
- Roster e painel direito permaneceram ocultos durante o combate, como definido pelo layout de Hunt.
- Criaturas, barras, analyzer, loot e combat log preservaram suas posicoes ao redor do novo sprite.

Fallback e responsividade:

- Uma fixture temporaria removeu o asset de Arkon e aplicou cache-busting para forcar falha real de carregamento.
- `CharacterSprite` substituiu imagens indisponiveis por iniciais sem quebrar cards, perfil ou estrutura da pagina.
- Registro e asset foram restaurados integralmente; a checagem final voltou a carregar sete usos visiveis em `384x384`, sem fallback residual.
- Character Hall, painel direito e Hunt Scene passaram em `1280`, `980`, `760`, `520` e `390 px` sem overflow horizontal.
- No combate mobile, o heroi permaneceu centralizado e integralmente dentro do palco.

Resultado e limitacoes:

- Nenhuma regressao permanente foi encontrada e nenhuma correcao de gameplay, componente ou CSS foi necessaria.
- O unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin no Vite, que ativa o mock local.
- A Hunt de QA alterou apenas o estado descartavel do mock em memoria e nao gravou save de producao.
- Rankings, Contracts, Squads e outras listas densas continuam candidatas a receber sprites em uma etapa visual futura.

Proximo passo sugerido:

- Etapa 128 - expandir a identidade visual dos herois para dossiers, equipes e demais superficies densas do roster.

## Etapa 128 - Expansao visual dos herois

Status: concluida.

Superficies integradas:

- O roster lateral persistente agora exibe o sprite compacto de cada aventureiro ao lado de status, skill e stamina.
- Hall of Renown usa os herois no podio, nas cinco linhas da classificacao e no dossier do registro selecionado.
- Guild Contracts Board substitui as iniciais pelos sprites na selecao da support team.
- Boss Party Builder identifica cada candidato antes dos controles de role e inclusao.
- Guild Squads usa os sprites nos cinco slots de formacao reutilizavel.
- Campaign Operations mostra arte real no Adventurer Roster de field assignments.
- Active Loadout Command conecta cada plano de equipamento ao heroi correspondente.
- Squad Gear Readiness usa o personagem real nos dossiers de prontidao da formacao.

Implementacao visual:

- Todas as superficies reutilizam `CharacterSprite`; nenhum componente paralelo de avatar foi criado.
- Molduras compactas variam entre `27x31` e `80x84` conforme densidade e importancia do dossier.
- Imagens mantem `object-fit: contain`, pixel rendering, dimensoes estaveis e fallback semantico existente.
- O Party Builder recebeu layout responsivo especifico para manter avatar e identidade juntos, com role e comando abaixo em telas estreitas.
- Nenhum PNG novo foi necessario: os cinco assets originais da Etapa 127 continuam sendo a unica fonte visual.

Validacao executada:

- `npm run build` passou depois das oito integracoes.
- Smoke visual no Vite confirmou roster lateral, Hall of Renown, Contracts, Guild Squads e Campaign Operations.
- Ranking carregou tres sprites no podio, cinco na tabela e um no dossier, todos com `naturalWidth` de 384 px.
- Contracts, Guild Squads e Operations carregaram os cinco herois sem fallback ou imagem quebrada.
- As superficies abertas permaneceram sem overflow horizontal no viewport desktop do smoke.
- Busca de codigo confirmou que as iniciais antigas foram removidas dos componentes migrados.

Integridade e limitacoes:

- Nenhuma regra de ranking, elegibilidade, party, squad, contract, loadout ou equipamento foi alterada.
- Nenhum campo de save, migration ou schema SQLite foi criado.
- Party Builder, Active Loadout Command e Squad Gear Readiness passaram por leitura e build, mas nao foram abertos por clique neste smoke.
- A validacao responsiva completa das oito superficies fica reservada para a Etapa 128.5.

Proximo passo sugerido:

- Etapa 128.5 - QA dos sprites expandidos em Ranking, equipes, Operations, loadouts e responsividade.

## Etapa 128.5 - QA da expansao visual dos herois

Status: concluida.

Preparacao e integridade:

- `git pull`, `git status` e o build web baseline passaram antes da QA.
- O catalogo foi reconferido em `5/5`: cinco IDs do roster, cinco registros e cinco PNGs dedicados.
- Todos os arquivos mantiveram RGBA `384x384`, alpha util e quatro cantos transparentes.

Superficies validadas:

- O roster lateral carregou cinco sprites; Hall of Renown carregou tres no podio, cinco na tabela e um no dossier.
- Contracts carregou os cinco candidatos e preservou level, vocacao e power de cada aventureiro.
- Boss Party Builder carregou os cinco herois sem alterar selecao, role ou mensagens de elegibilidade.
- Guild Squads e Campaign Operations carregaram cinco sprites em cada roster, preservando formacoes e assignments.
- Active Loadout Command carregou cinco portraits e manteve os planos associados ao personagem correto.
- Squad Gear Readiness foi populado por uma formacao temporaria com Arkon e Lyra e exibiu ambos os dossiers corretamente.

Responsividade e restauracao:

- Ranking, Contracts, Boss Party Builder, Operations, Active Loadout e Squad Gear passaram em `980`, `760`, `520` e `390 px`.
- O roster lateral tambem foi validado em `390 px`, com cinco portraits estaveis em `32x40` px.
- Nenhuma superficie apresentou imagem quebrada, fallback indevido ou overflow horizontal.
- A formacao criada para o teste existiu apenas no mock Vite em memoria; o reload restaurou integralmente a fixture inicial.
- Nenhum save de producao ou registro SQLite foi modificado durante o QA interativo.

Resultado e limitacoes:

- Nenhuma regressao permanente foi encontrada e nenhuma correcao de gameplay, componente ou CSS foi necessaria.
- O fallback compartilhado de `CharacterSprite` recebeu cobertura de regressao pelas superficies testadas; a falha destrutiva de asset nao foi repetida porque ja foi forçada e validada na Etapa 127.5.
- No Vite, a indisponibilidade do Tauri SQL Plugin continua esperada e direciona a sessao para o mock local.

Proximo passo sugerido:

- Etapa 129 - definir a proxima frente visual depois da identidade completa de itens, criaturas e herois.

## Etapa 129 - Fundacao visual dos cenarios de Hunt

Status: concluida.

Direcao visual:

- A proxima frente visual foi definida como identidade dos ambientes de Hunt, substituindo o unico terreno geometrico generico do combate.
- Sete cenarios top-down originais foram produzidos sem personagens, criaturas, texto, UI ou assets externos.
- Cada composicao mantem o centro aberto para o heroi e distribui agua, muralhas, vegetacao, ruinas, rochas ou lava nas bordas.
- Os JPEGs finais foram otimizados para uso local e variam entre aproximadamente 368 KB e 677 KB.

Catalogo e cobertura:

- Sewers Below Thaeron e Cave Spider Cellar compartilham o ambiente subterraneo coerente da undercity de Thaeron.
- Trollwood Camp usa clareira florestal cercada por paliçadas e mata densa.
- Mudrot Cave usa uma gruta pantanosa com agua escura, fungos e minerais venenosos.
- Minotaur Outpost usa patio fortificado com terra batida, muralhas, armas e estandartes sem simbolos protegidos.
- Ancient Crypt usa salao funerario em pedra, sarcofagos, mosaico ritual e luzes arcanas.
- Cyclops Hills usa highlands rochosas com trilhos, minas e fronteira fria de Khazgrim.
- Ember Dragon Nest usa arena vulcanica com basalto, lava, ossos e cristais de brasa.

Implementacao:

- `huntSceneBackgrounds.ts` registra as oito Hunts atuais por ID e aponta para sete assets originais.
- `getHuntSceneBackgroundMeta` prioriza o registro deterministico e preserva a classificacao textual para Hunts futuras ou legadas.
- `HuntSceneBackground` carrega a imagem com estado de erro e retorna automaticamente ao terreno CSS quando o asset falha.
- O background foi movido do container geral para dentro de `.hunt-scene-stage`, mantendo analyzer, loot, log e comandos fora da arte.
- Vinheta, `object-fit: cover`, pixel rendering e camadas explicitas preservam contraste de heroi, criaturas, HP e spawn timer.
- Nenhuma regra de Hunt, drop, XP, gold, supplies, risco, acesso, currentAction ou persistencia foi alterada.

Validacao:

- O catalogo fechou em `8/8` mapeamentos e os sete arquivos responderam HTTP 200 no Vite.
- Todos os JPEGs foram inspecionados individualmente e mantiveram resolucao entre `1371x1147` e `1536x1024`.
- Uma Hunt real em Sewers Below Thaeron carregou `sewer-cellar.jpg` em `1536x1024` com Arkon e Sewer Rats acima do cenário.
- Desktop e larguras de `980`, `760`, `520` e `390 px` passaram sem overflow horizontal e com o heroi dentro do palco.
- O console nao registrou falha de asset ou UI; apenas a indisponibilidade esperada do Tauri SQL Plugin no Vite ativou o mock local.
- O SQLite real permaneceu inalterado em tamanho, timestamp e SHA-256.
- `npm run build` passou antes e depois da integracao; permaneceu apenas o aviso conhecido de chunk acima de 500 KB.

Limitacoes:

- Os cenarios sao estaticos; agua, lava, luzes e clima ainda nao possuem camadas animadas.
- Bosses continuam usando a apresentacao atual e ainda nao receberam arenas dedicadas.
- A QA desta etapa abriu uma Hunt inicial real; a navegacao visual de todas as Hunts bloqueadas fica para uma fixture descartavel na Etapa 129.5.

Proximo passo sugerido:

- Etapa 129.5 - QA completa dos cenarios de Hunt, fallback e enquadramento por ambiente.

## Etapa 129.5 - QA completa dos cenarios de Hunt

Status: concluida.

Preparacao e fixture:

- `git pull` e `git status` confirmaram o baseline limpo antes da QA.
- O catalogo foi reconferido em `8/8` Hunts apontando para sete JPEGs presentes no projeto.
- Uma fixture Vite temporaria elevou Arkon ao level 99, adicionou as quatro permissoes avancadas e supplies suficientes.
- A fixture permitiu usar o fluxo real Explore > Hunt Assignment > Iniciar Hunt sem alterar regras de level, access ou supplies.

Cobertura desktop:

- Sewers Below Thaeron e Cave Spider Cellar carregaram `sewer-cellar.jpg` em `1536x1024`.
- Trollwood Camp carregou `trollwood-camp.jpg` em `1536x1024`.
- Mudrot Cave carregou `mudrot-grotto.jpg` em `1402x1122`.
- Minotaur Outpost carregou `minotaur-outpost.jpg` em `1536x1024`.
- Ancient Crypt carregou `ancient-crypt.jpg` em `1536x1024`.
- Cyclops Hills carregou `cyclops-hills.jpg` em `1371x1147`.
- Ember Dragon Nest carregou `ember-dragon-nest.jpg` em `1402x1122`.
- Todos os cenarios usaram a classe de bioma correta, imagem completa e o arquivo esperado pelo ID da Hunt.

Combate e enquadramento:

- Hunts iniciais mostraram tres criaturas e Hunts com dois tipos de monstro mostraram quatro cards.
- Arkon permaneceu integralmente dentro do palco e todas as criaturas conservaram camada acima do background.
- HP, spawn timer, action bar, hotbar, analyzer, loot preview e combat log continuaram funcionais e legiveis.
- Nenhum dos oito cenarios causou overflow horizontal no layout desktop.

Responsividade e fallback:

- As oito Hunts foram repetidas em `390 px`; todas mantiveram `object-fit: cover`, imagem carregada, heroi dentro do palco e zero overflow.
- Ember Dragon Nest tambem passou em `980`, `760` e `520 px`, cobrindo os breakpoints intermediarios com um dos assets mais altos.
- O caminho do Ember Nest foi quebrado temporariamente para forcar uma falha HTTP real.
- `HuntSceneBackground` removeu a imagem quebrada, ativou `uses-scene-fallback` e exibiu o gradiente vulcanico com quatro criaturas e Arkon preservados.

Restauracao e resultado:

- O caminho correto do Ember Nest foi restaurado imediatamente apos o teste de fallback.
- Arkon voltou ao level 1, inventario original e `accessIds: []`; o reload confirmou o mock inicial sem Hunt ativa.
- Nenhuma correcao permanente de componente, catalogo ou CSS foi necessaria.
- O unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin no Vite.
- O SQLite real permaneceu inalterado em tamanho, timestamp e SHA-256.
- `npm run build` e `npm run tauri:build` passaram depois da restauracao integral da fixture.

Proximo passo sugerido:

- Etapa 130 - fundacao visual de arenas dedicadas para Bosses offline.

## Etapa 130 - Fundacao visual das arenas de Bosses offline

Status: concluida.

Assets originais:

- `sewer-broodmother-arena.jpg`: camara circular de esgoto e ninho da Broodmother.
- `grunk-war-camp.jpg`: acampamento de guerra aberto para Grunk.
- `crypt-warden-sanctum.jpg`: santuario funerario do Crypt Warden.
- `khazgrim-gate-arena.jpg`: plataforma diante do portao fortificado de Khazgrim.
- `ember-matriarch-nest.jpg`: ninho vulcanico da Ember Matriarch.
- `novice-guild-arena.jpg`: arena controlada de treinamento da guilda em Thaeron.

Integracao:

- O catalogo `bossArenaBackgrounds` resolve cada arena pelo ID exato dos seis Bosses atuais.
- O Raid Board mostra a arena do contrato selecionado antes da montagem da equipe.
- Os cards completos de Bosses reutilizam uma miniatura da arena quando exibidos fora do Explore compacto.
- Iniciar uma raid agora leva diretamente para a Boss Scene, mantendo Action Details como comando secundario.
- A Boss Scene esconde roster e painel direito, reserva a maior area para o combate e mostra timer, progresso, chance de sucesso, risco, custo e recompensas esperadas.
- A equipe ativa usa os sprites reais dos herois e os papeis persistidos no snapshot da acao.
- Assets ausentes ou IDs futuros usam fallback CSS por tema sem impedir a renderizacao da raid.

Regras preservadas:

- Nenhum calculo de poder, sucesso, morte, loot, XP, gold, renown, taxa de entrada ou cooldown foi alterado.
- Collect Raid Report continua chamando o fluxo real de resolucao apenas quando o timer termina.
- Abort and Return continua cancelando a raid e iniciando o retorno dos participantes.
- Nenhuma migration, tabela, coluna ou formato de save foi criado nesta etapa.

QA:

- Fluxo real validado em Vite: Explore > Bosses > Sewer Broodmother > equipe com Lyra > Launch Raid.
- A arena abriu diretamente com background carregado, timer ativo, hero sprite, boss marker e Raid Analyzer.
- Em `1280x720`, o palco mediu `952x570`, os tres paineis externos ficaram ocultos e nao houve overflow horizontal.
- Em `560x820`, sidebar e palco empilharam sem overflow ou sobreposicao; o palco conservou `525x470`.
- Abort and Return removeu a Boss Scene e iniciou o retorno normalmente.
- O unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin no Vite.
- O SQLite real permaneceu com 81.920 bytes, timestamp `2026-07-30 02:28:19` e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- `npm run build` e `npm run tauri:build` passaram apos a integracao.

Limitacoes:

- O boss ainda usa um marcador/sigilo original; sprites dedicados dos seis Bosses ficam para uma etapa visual futura.
- Cenários e efeitos sao estaticos; animacoes de lava, agua, luz e habilidades ainda nao foram implementadas.
- A validacao completa de todas as seis arenas, fallback HTTP forcado e estado pronto para coleta fica reservada para a Etapa 130.5.

Proximo passo sugerido:

- Etapa 130.5 - QA completa das arenas de Bosses, fallback e resolucao visual.

## Etapa 130.5 - QA completa das arenas de Bosses

Status: concluida.

Preparacao e fixture:

- `git pull`, `git status` e `npm run build` confirmaram o baseline limpo antes da QA.
- O catalogo foi reconferido em `6/6` Bosses apontando para seis JPEGs presentes no projeto.
- Uma fixture Vite temporaria elevou os cinco herois ao level 99, liberou os seis acessos, deixou o roster idle, forneceu `99.999g` e reduziu os timers para 12 segundos.
- A fixture preservou requisitos reais de party e papeis: solos com 1 heroi, Khazgrim com tank/damage, Ember com tank/healer/damage e Novice Champion com 2 participantes.

Cobertura desktop:

- Sewer Broodmother carregou `sewer-broodmother-arena.jpg` com 1 ator de party.
- Grunk the Camp Breaker carregou `grunk-war-camp.jpg` com 1 ator de party.
- Crypt Warden carregou `crypt-warden-sanctum.jpg` com 1 ator de party.
- Khazgrim Gatekeeper carregou `khazgrim-gate-arena.jpg` com 2 atores de party.
- Ember Matriarch carregou `ember-matriarch-nest.jpg` com 3 atores de party.
- Novice Arena Champion carregou `novice-guild-arena.jpg` com 2 atores de party.
- As seis cenas abriram pelo fluxo real Explore > Bosses > party > Launch Raid, esconderam os tres paineis externos e nao criaram overflow horizontal.

Responsividade:

- As seis arenas foram repetidas em `390x844`; todas mantiveram imagem, boss, barra de progresso e party integralmente dentro do palco de `355x470`.
- Ember Matriarch com tres participantes tambem passou em `980`, `760` e `520 px`.
- Em `980 px`, a cena manteve sidebar de 300 px e palco de 637 px.
- Em `760` e `520 px`, sidebar e palco empilharam corretamente, sem sobreposicao ou overflow.

Fallback e resolucao:

- O caminho de `ember-matriarch-nest.jpg` foi quebrado temporariamente para gerar uma falha HTTP real.
- `BossArenaBackground` removeu a imagem, ativou `uses-arena-fallback` e preservou gradiente vulcanico, boss marker e os tres herois.
- O caminho original foi restaurado imediatamente e a imagem voltou a carregar na mesma raid.
- A raid chegou a `is-ready`, exibiu `0s`, `100%` e disponibilizou `Collect Raid Report`.
- A coleta ocorreu uma unica vez; a Boss Scene foi removida e o botao de coleta deixou de existir.
- O resultado derrotou Ember Matriarch, concedeu XP, gold e 10 renown, enviou Dragon Ember e Wyvern Scale ao Guild Depot e aplicou cooldown de 20h aos tres participantes.
- O Raid Report exibiu os ganhos, o loot e os tres cooldowns; a lista pessoal mostrou Ember Matriarch bloqueada por cooldown.

Restauracao e resultado:

- Timers originais de `8`, `10`, `12`, `18`, `25` e `15` minutos foram restaurados.
- Gold voltou para `420g`; Arkon voltou ao level 1; status, actions e accessIds originais dos cinco herois foram restaurados.
- O reload final confirmou Arkon level 1, `420g` e nenhuma Boss Scene ativa.
- Nenhuma correcao permanente de componente, catalogo ou CSS foi necessaria.
- O unico erro de console foi a indisponibilidade esperada do Tauri SQL Plugin no Vite.
- O SQLite real permaneceu com 81.920 bytes, timestamp `2026-07-30 02:28:19` e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- `npm run build` e `npm run tauri:build` passaram depois da restauracao integral da fixture.

Proximo passo sugerido:

- Etapa 131 - fundacao visual dos sprites dedicados dos seis Bosses atuais.

## Etapa 131 - Fundacao visual dos sprites dedicados dos Bosses

Status: concluida.

Assets e catalogo:

- Seis sprites originais com fundo transparente foram criados para Sewer Broodmother, Grunk the Camp Breaker, Crypt Warden, Khazgrim Gatekeeper, Ember Matriarch e Novice Arena Champion.
- `src/data/bossSprites.ts` associa cada sprite ao `boss.id` canonico sem alterar regras, recompensas, cooldowns ou persistencia.
- `BossSprite` fornece tamanhos estaveis para card, briefing e cena, texto acessivel e fallback por sigla quando o asset estiver ausente ou falhar ao carregar.

Integracao visual:

- Explore > Bosses substituiu o marcador generico `B` pelo sprite dedicado de cada contrato.
- Raid Briefing mostra o boss selecionado no cabecalho e sobre a arena correspondente.
- Cards reutilizaveis de Boss passaram a combinar arena e sprite sem alterar a selecao.
- Boss Scene substituiu o sigilo circular pelo boss em escala de encontro, preservando party, analyzer, timer e barra de progresso.

Validacao:

- Os seis PNGs possuem alpha, cantos transparentes e silhuetas completas; todos carregaram com dimensao natural `1254x1254`.
- Os seis contratos foram conferidos juntos em desktop, sem overflow horizontal ou falha de asset.
- Sewer Broodmother foi conferida no briefing sobre sua arena; Ember Matriarch foi conferida na Boss Scene em `1440x1000` e `390x844`.
- No mobile, boss, party, nomes e barra permaneceram integralmente dentro do palco de `355x470`.
- O caminho da Ember Matriarch foi quebrado temporariamente: o erro HTTP removeu o `img`, exibiu o fallback `B` na mesma caixa e nao causou overflow.
- A fixture visual e o caminho original foram restaurados antes dos builds finais.
- `npm run build` e `npm run tauri:build` passaram; MSI e NSIS foram gerados normalmente.
- O SQLite real permaneceu intacto com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.

Limites atuais:

- O QA de cena detalhado desta etapa cobriu Ember Matriarch; a repeticao das seis Boss Scenes e estados ready/defeated fica para a Etapa 131.5.
- Os sprites sao estaticos; animacoes por frames, direcao e efeitos de ataque ficam fora desta fundacao.
- Nenhuma regra de gameplay, save SQLite, loot ou balanceamento foi alterada.

Proximo passo sugerido:

- Etapa 131.5 - QA completa dos sprites de Bosses nas seis arenas e estados de combate.

## Etapa 131.5 - QA completa dos sprites de Bosses

Status: concluida.

Preparacao:

- `git pull`, `git status` e `npm run build` confirmaram o baseline limpo da Etapa 131.
- Uma fixture Vite temporaria por query string montou diretamente cada Boss Scene sem abrir ou alterar o save SQLite real.
- A fixture usou parties coerentes com os contratos: tres solos com um heroi, Khazgrim com dois, Ember com tres e Novice Champion com dois.

Cobertura das seis cenas:

- Sewer Broodmother carregou seu PNG `1254x1254` sobre `sewer-broodmother-arena.jpg`.
- Grunk the Camp Breaker carregou seu PNG `1254x1254` sobre `grunk-war-camp.jpg`.
- Crypt Warden carregou seu PNG `1254x1254` sobre `crypt-warden-sanctum.jpg`.
- Khazgrim Gatekeeper carregou seu PNG `1254x1254` com dois membros sobre `khazgrim-gate-arena.jpg`.
- Ember Matriarch carregou seu PNG `1254x1254` com tres membros sobre `ember-matriarch-nest.jpg`.
- Novice Arena Champion carregou seu PNG `1254x1254` com dois membros sobre `novice-guild-arena.jpg`.
- Em todas as cenas, boss e party permaneceram integralmente dentro do palco, sem overflow horizontal.

Estados e fallback:

- Os seis estados running preservaram sprite, arena, analyzer, nomes e barra de encontro.
- Os seis estados ready exibiram `0s`, `100%`, `Defeated` e `Collect Raid Report` habilitado, sem remover o sprite.
- Cada um dos seis caminhos de sprite foi quebrado separadamente para provocar erro HTTP real.
- Todos removeram o `img`, exibiram o fallback `B` na mesma caixa e mantiveram boss e party dentro do palco.

Responsividade e restauracao:

- As seis cenas passaram em `390x844`, com palco de `355x470`, sem corte de sprite ou party.
- Ember Matriarch com tres membros passou tambem em `980`, `760` e `520 px`; os palcos mediram respectivamente `637x750`, `725x560` e `485x470`.
- O console Vite mostrou somente a indisponibilidade esperada do Tauri SQL Plugin fora do runtime Tauri.
- Nenhuma correcao permanente de React, CSS, catalogo ou asset foi necessaria.
- A fixture, o fallback forcado e os logs temporarios foram removidos integralmente antes do build final.
- O SQLite real permaneceu com 81.920 bytes, timestamp `2026-07-30 02:28:19` e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- `npm run build` e `npm run tauri:build` passaram; os bundles MSI e NSIS foram gerados normalmente.

Proximo passo sugerido:

- Etapa 132 - fundacao visual dos efeitos de combate e skills nas Hunt e Boss Scenes.

## Etapa 132 - Fundacao visual dos efeitos de combate e skills

Status: concluida.

Implementacao:

- Criado um catalogo visual compartilhado para Guardian, Ranger, Arcanist, Warden e Monk.
- Guardian usa corte pesado dourado; Ranger, projetil verde; Arcanist, pulso arcano azul/violeta; Warden, energia natural verde/dourada; Monk, impacto espiritual laranja/turquesa.
- A camada `CombatEffectLayer` e puramente cosmetica: nao altera dano, timers, loot, cooldown, save ou balanceamento.
- Na Hunt Scene, o efeito parte do heroi central e acompanha a posicao da criatura ativa.
- Na Boss Scene, cada integrante da party projeta o efeito da propria vocacao contra o boss.
- O estado concluido interrompe os ataques repetidos e mostra um selo visual estavel no alvo.
- A camada ignora interacao do mouse, permanece dentro da arena e nao cobre os controles laterais.
- `prefers-reduced-motion` remove trajetorias repetidas e conserva apenas marcadores estaticos discretos.

Validacao:

- `npm run build` e `npm run tauri:build` passaram apos a integracao TypeScript/CSS; MSI e NSIS foram gerados.
- Hunt Guardian iniciada pelo fluxo real de Explore em Vite: uma sequencia melee ativa, alvo correto e camada integralmente contida no palco.
- Ember Matriarch validada com party temporaria de cinco personagens: melee, ranged, arcane, nature e spirit renderizados simultaneamente.
- Hunt e Boss Scene passaram no viewport desktop e em `390x844`, sem overflow horizontal.
- As arenas, sprites, nomes, analyzer e controles permaneceram legiveis durante os efeitos.
- A fixture temporaria de boss foi removida integralmente antes da validacao final.
- O SQLite e o formato de save nao foram alterados nesta etapa; o banco manteve 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.

Limitacoes atuais:

- Os efeitos comunicam identidade de vocacao, mas ainda nao representam cada skill individual do catalogo.
- Dano, cura, numeros flutuantes e sincronizacao por cooldown continuam fora desta fundacao visual.
- O comportamento de movimento reduzido foi validado por regra CSS; nao houve clique manual com a preferencia do sistema operacional ativada.

Proximo passo sugerido:

- Etapa 132.5 - QA dos efeitos de combate e skills.

## Etapa 132.5 - QA dos efeitos de combate e skills

Status: concluida.

Cobertura das Hunts:

- Guardian, Ranger, Arcanist, Warden e Monk foram iniciados separadamente pelo fluxo real de Explore/Hunts.
- Cada vocacao carregou a classe visual esperada: `melee`, `ranged`, `arcane`, `nature` e `spirit`.
- Todos os efeitos ativos permaneceram direcionados a criaturas `alive` ou `damaged`, sem atacar slots em spawn ou derrotados.
- Nenhuma das cinco cenas criou overflow horizontal.

Cobertura dos Bosses:

- Ember Matriarch foi iniciada com party de cinco membros e roles tank, damage, damage, healer e support.
- As cinco linguagens visuais foram renderizadas simultaneamente e permaneceram dentro da arena.
- Nenhum sprite ou background ficou quebrado durante o teste.
- A cena pronta para coleta manteve as cinco sequencias no DOM, ocultou as trajetorias, exibiu o selo resolvido e habilitou `Collect Raid Report`.

Correcoes aplicadas:

- A Hunt Scene agora seleciona alvo visual somente entre criaturas vivas ou feridas.
- Quando nao existe alvo combatente, a camada de ataque nao e renderizada; o estado concluido conserva apenas o selo no primeiro slot da cena.
- O relogio em `0s` agora tambem conclui a simulacao visual, sincronizando barra, criaturas derrotadas, alvo ativo e efeitos antes da persistencia de `readyToResolve`.

Responsividade e acessibilidade:

- A Boss Scene passou em `980`, `760`, `520` e `390 px`, sem overflow e com impacto dentro do palco.
- A preferencia real `Reduce motion` do cliente foi ativada: projetil oculto, animacao reduzida a um frame e selo estatico preservado.
- A preferencia foi restaurada ao final do QA e continua separada do save SQLite.

Validacao e restauracao:

- O console Vite apresentou somente a indisponibilidade esperada do Tauri SQL Plugin fora do runtime desktop.
- Fixtures de vocacao, party e estado concluido foram removidas integralmente.
- Nenhum campo de save, regra de dano, loot, cooldown ou balanceamento foi alterado.
- `npm run build` e `npm run tauri:build` passaram; MSI e NSIS foram gerados.
- O SQLite permaneceu com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.

Proximo passo sugerido:

- Etapa 133 - catalogo visual de skills por vocacao e integracao com a hotbar.

## Etapa 133 - Catalogo visual de skills por vocacao

Status: concluida.

Catalogo:

- Criado um catalogo offline com 30 skills originais: quatro ataques e dois suportes para cada uma das cinco vocacoes.
- Cada skill define nome, codigo, descricao, level requerido, mana, cooldown e linguagem visual.
- Guardian usa golpes e wards; Ranger, projeteis; Arcanist, energia arcana; Warden, natureza; Monk, impacto espiritual.
- Os icones usam composicoes CSS originais com as cores dos efeitos da vocacao, sem assets externos ou protegidos.

Hotbar e janelas:

- O slot ofensivo agora mostra a skill mais avancada disponivel no level atual e a contagem real `desbloqueadas/4`.
- O slot de suporte mostra a skill disponivel ou o proximo level necessario, com contagem `desbloqueadas/2`.
- As janelas de ataque e suporte deixaram de usar a lista fixa de Guardian e agora carregam o catalogo da vocacao selecionada.
- Cada entrada mostra icone, level, mana, cooldown, descricao e estado active/available/locked.
- Arkon level 1 exibe apenas Vanguard Slash ativa, tres ataques bloqueados e suporte aguardando level 18.

Boss Scene:

- A arena de Boss ganhou uma faixa compacta com a skill primaria de cada integrante, role e progresso `x/4`.
- Parties de ate cinco membros preservam sua ordem e identidade de vocacao.
- No mobile, a faixa reduz para cinco icones compactos sem encobrir a barra do encontro.
- O estado resolvido interrompe o cooldown decorativo e mantem a leitura da formacao.

Correcoes visuais:

- O modal mobile agora se ancora ao viewport e permanece totalmente visivel dentro de `390x844`.
- Nome, metadados e estado das skills usam blocos proprios e nao invadem cards vizinhos.
- A largura responsiva passou a respeitar tanto o viewport quanto o container da Hunt Scene.
- Seletores de estado foram restringidos aos elementos diretos para nao reposicionar os codigos internos dos novos icones.

Validacao:

- As cinco vocacoes carregaram quatro ataques, dois suportes, nomes e icones corretos em Hunts separadas.
- Arkon level 1 confirmou progressao e locks reais do catalogo.
- Ember Matriarch com party completa exibiu cinco skills dentro da arena, sem overflow.
- Hotbar desktop passou com cinco slots, dois icones de skill e nenhum overflow interno.
- Modal Warden passou no desktop e em `390x844`, com todos os filhos contidos nos cards.
- A fixture temporaria foi removida integralmente; save, dano, mana e cooldown real nao foram alterados.
- `npm run build` e `npm run tauri:build` passaram; MSI e NSIS foram gerados.
- O SQLite permaneceu com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.

Limitacoes atuais:

- Skills, mana e cooldown continuam representacoes visuais; a engine ainda nao executa rotacoes individuais.
- O jogador ainda nao salva uma ordem personalizada de quatro skills.
- Efeitos da Etapa 132 continuam definidos por vocacao, nao por cada skill individual.

Proximo passo sugerido:

- Etapa 133.5 - QA do catalogo visual de skills e hotbar.

## Etapa 133.5 - QA do catalogo visual de skills e hotbar

Status: concluida.

Integridade do catalogo:

- Os 30 registros possuem IDs e nomes unicos, valores numericos validos e linguagem visual reconhecida.
- Cada vocacao possui exatamente quatro ataques e dois suportes, com seis codigos de icone unicos.
- Guardian, Ranger, Arcanist, Warden e Monk exibiram nomes, contagens e skill primaria coerentes com seus levels reais do mock.

Progressao e modais:

- Guardian confirmou os limites exatos de ataque nos levels 11/12 e de suporte nos levels 17/18 e 44/45.
- Skills bloqueadas permaneceram desabilitadas; o dialog possui nome acessivel e os icones decorativos permanecem ocultos da arvore acessivel.
- Modais de ataque e suporte passaram em `980x844` e `390x844`, sem overflow da pagina, janela ou cards e com o botao de fechar visivel.
- Corrigida a quebra interna do contador no titulo mobile: valores como `0 / 2` agora permanecem juntos.

Boss Scene:

- Ember Matriarch com party completa exibiu Bastion Crash, Falcon Mark, Meteor Sigil, Grove Wrath e Inner Tempest.
- As cinco entradas permaneceram dentro da arena em `980`, `760`, `520` e `390 px`, sem imagens quebradas ou overflow horizontal.
- O estado concluido aplicou `is-resolved`, preservou as cinco skills e interrompeu todas as animacoes.
- A preferencia `Reduce motion` tambem removeu as animacoes da rotacao ativa e foi restaurada ao final do QA.

Validacao e restauracao:

- O browser local percorreu Hunts e Bosses pelo fluxo real da interface; fora do Tauri, permaneceu apenas a indisponibilidade esperada do plugin SQLite.
- Fixtures temporarias de vocacao, level, party e raid concluida foram removidas integralmente.
- `npm run build` passou com 461 modulos; permanece somente o aviso conhecido de chunk acima de 500 kB.
- `npm run tauri:build` passou e gerou os bundles MSI e NSIS.
- O SQLite permaneceu com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.

Limitacoes mantidas:

- Skills, mana e cooldown ainda sao representacoes visuais; a engine nao executa uma rotacao individual persistida.
- O jogador ainda nao configura nem salva a ordem das quatro skills.

Proximo passo sugerido:

- Etapa 134 - rotacao real de skills e cooldowns offline por personagem.

## Etapa 134 - Rotacao real de skills e cooldowns offline

Status: concluida.

Modelo e compatibilidade:

- Cada personagem agora possui `combatSkillLoadout` com ate quatro ataques ordenados e um suporte opcional.
- Loadouts antigos ou ausentes recebem automaticamente todas as skills liberadas; novos unlocks entram na configuracao ate o jogador personalizar a ordem.
- IDs duplicados, skills de outra vocacao, skills bloqueadas e dados malformados sao removidos pela normalizacao.
- Hunts, auto-repeat e Bosses guardam um snapshot do loadout ao iniciar, impedindo mudancas retroativas em operacoes em andamento.

Execucao offline:

- O simulador deterministico considera cooldown global de 1,5s, cooldown individual, custo de mana e regeneracao por personagem.
- A mesma duracao produz a mesma contagem de casts em cena, apos tempo offline e no relatorio final.
- Skills sem mana suficiente sao temporariamente ignoradas quando existe outra acao executavel, evitando que a rotacao inteira fique parada.
- A simulacao e limitada a oito horas e 20.000 eventos por personagem para manter custo previsivel.
- Casts ainda nao alteram dano, risco, XP ou loot; esta etapa torna ordem, cooldown e mana reais sem rebalancear recompensas.

Interface:

- A hotbar da Hunt mostra total de casts, skill ativa e tempo ate a proxima ativacao.
- O modal ofensivo mostra prioridade 1-4; clicar em uma skill ativa altera sua posicao para a proxima expedicao.
- O modal de suporte permite selecionar outra skill ou desativar o suporte.
- O Combat Log mostra casts e mana processados sem criar entradas persistentes a cada segundo.
- A Boss Scene calcula e exibe os casts reais de cada integrante da party.

Persistencia:

- Adicionada a coluna compativel `characters.combat_skill_loadout_json` com default `{}`.
- O mapper normaliza loadout e snapshot de acao durante o load; o repository grava a configuracao por personagem.
- Saves antigos continuam validos e recebem defaults derivados de vocacao e level.

Validacao:

- Build baseline e builds finais passaram com 464 modulos.
- Smoke local validou quatro ataques Guardian, prioridades 1-4, reordenacao, suporte ativo/desativado e snapshot na Hunt seguinte.
- Combat Log e hotbar exibiram casts e mana crescentes pelo tempo real da acao.
- Ember Matriarch com cinco vocacoes exibiu casts independentes e corrigiu starvation do Guardian por suporte caro.
- Boss Scene passou em `390x844` com cinco entradas de 42px, sem overflow ou imagens quebradas.
- Fixtures temporarias foram removidas integralmente.
- `npm run tauri:build` passou e gerou MSI e NSIS.

Limitacoes atuais:

- O save/load da nova coluna foi validado por migration, mapper, build e leitura do SQL, nao por alterar o save real do usuario no Tauri.
- Skills ainda nao modificam dano, cura, defesa, alvos ou recompensas.
- Nao existe editor de rotacao fora da hotbar de uma Hunt em andamento.

Proximo passo sugerido:

- Etapa 134.5 - QA da rotacao real, persistencia SQLite e offline catch-up.

## Etapa 134.5 - QA da rotacao real, SQLite e offline catch-up

Status: concluida como QA de estabilizacao, sem alteracao permanente na gameplay.

QA real no Tauri/SQLite:

- O save original foi copiado e verificado antes do teste: 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- Um harness temporario executado exclusivamente com `VITE_QA_COMBAT_SQLITE=1` abriu o runtime Tauri e o plugin SQLite real.
- A migration criou `characters.combat_skill_loadout_json` no banco operacional.
- Save/Reload preservou a ordem personalizada `Shield Break -> Vanguard Slash`, suporte desativado e flags de configuracao.
- O snapshot da Hunt permaneceu independente como `Vanguard Slash -> Shield Break` com `Guard Stance` ativo.
- O relatorio persistido retornou 10/10 checks aprovados.

Normalizacao e offline:

- IDs invalidos, duplicados e de outra vocacao foram removidos; no level 12 restou apenas `guardian-shield-break`.
- Suporte de outra vocacao foi descartado com fallback seguro para `null` quando nenhum suporte estava liberado.
- Duas simulacoes de 60 segundos produziram JSON identico.
- O resultado calculou 20 casts e 272 de mana ciclada: oito Vanguard Slash, oito Shield Break e quatro Guard Stance.
- O offline catch-up marcou a acao como pronta sem alterar o snapshot ou o resultado da rotacao.

Restauracao e limpeza:

- O processo Tauri e o Vite de QA foram encerrados antes da restauracao.
- O banco original foi restaurado; arquivos WAL/SHM foram removidos depois do encerramento dos processos.
- O SQLite final voltou a 81.920 bytes e ao SHA-256 original.
- Harness, banco de backup, logs e variavel de QA foram removidos integralmente.
- Nenhum bug permanente de gameplay foi encontrado nesta QA.

Validacao final:

- `npm run build` passou antes e depois do QA com 464 modulos.
- `npm run tauri:dev` compilou e abriu `guild-hunt-idle.exe` com o plugin SQLite ativo.
- `npm run tauri:build` passou e gerou os bundles MSI e NSIS.
- O aviso conhecido de chunk acima de 500 kB permaneceu sem regressao funcional.

Proximo passo sugerido:

- Etapa 135 - efeitos reais das skills na simulacao offline de combate.

## Etapa 135 - Efeitos reais das skills no combate offline

Status: concluida.

Modelo:

- As 30 skills receberam impactos explicitos de ataque, sobrevivencia e/ou economia de supplies conforme sua funcao e vocacao.
- O novo calculador transforma os casts reais da Etapa 134 em bonus percentuais deterministas.
- Ataque possui teto de 8%, reducao de risco possui teto de 10% e reducao de supplies possui teto de 8%.
- Mana, cooldown global, cooldown individual, ordem e suporte continuam determinando quantas vezes cada efeito entra na simulacao.
- IDs invalidos e duracoes malformadas passam pela normalizacao existente e sempre produzem valores finitos.

Hunts:

- Impacto ofensivo aumenta o `clearSpeed`, produzindo mais abates e, por consequencia, XP, gold e rolls de loot de forma organica.
- Skills defensivas reduzem o multiplicador de risco antes do roll de morte.
- Cura, recuperacao e eficiencia reduzem o consumo calculado de supplies.
- O Hunt Result mostra clear speed, risco, supplies, casts e mana processada.
- O relatorio guarda o resumo aplicado e adiciona uma unica linha de efeitos ao Activity Log.

Bosses:

- Cada integrante usa o snapshot de loadout salvo ao iniciar a raid.
- O bonus ofensivo medio da party aumenta a chance de sucesso de forma relativa.
- O bonus medio de sobrevivencia reduz o risco de morte da party.
- O Boss Result mostra o resumo agregado, casts, mana e detalhes por integrante no objeto de resultado.

Offline e persistencia:

- Os efeitos sao calculados apenas na resolucao da Hunt ou Boss; o catch-up continua somente marcando a acao como pronta.
- A configuracao da acao vem do snapshot persistido, impedindo alteracao retroativa e aplicacao duplicada.
- Nenhuma migration foi necessaria: pesos de efeito pertencem ao catalogo e resumos de resultado sao transitorios.

Validacao:

- `npm run build` passou com 465 modulos.
- Smoke real no Vite abriu Explore, iniciou uma Hunt e confirmou hotbar com casts/mana crescentes.
- Fixture temporaria validou repetibilidade byte a byte do resumo, dados hostis finitos e todos os tetos.
- Guardian basico em 60 segundos produziu 11 casts e +3,85% de clear speed.
- Warden com Renew produziu bonus ofensivo limitado a 8%, -5,4% de risco e -7% de supplies.
- Integracoes de Hunt e Boss retornaram resumo e logs de efeito; a party de duas vocacoes preservou os dois membros.
- A fixture temporaria foi removida e nenhum save SQLite foi alterado pelo QA no browser.

Limitacoes atuais:

- Skills ainda nao possuem dano por alvo, cura de HP numerica ou efeitos de status individuais na cena.
- Efeitos de suporte em Boss sao agregados para a party; nao existe aura por alcance ou alvo selecionado.
- O QA real de persistencia/catch-up no Tauri fica reservado para a etapa de estabilizacao.

Proximo passo sugerido:

- Etapa 135.5 - QA dos efeitos reais das skills no Tauri/SQLite e offline catch-up.

## Etapa 135.5 - QA dos efeitos reais das skills no Tauri/SQLite

Status: concluida como QA de estabilizacao, sem correcao permanente de gameplay necessaria.

QA real no Tauri/SQLite:

- O save original foi copiado antes do teste com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- Um harness temporario protegido por `VITE_QA_COMBAT_EFFECTS_SQLITE=1` executou no runtime Tauri e no plugin SQLite real.
- O relatorio persistido retornou 10/10 verificacoes aprovadas.
- Save/Reload preservou separadamente o loadout atual do personagem e o snapshot da acao em andamento.
- Alterar o loadout do personagem depois do dispatch nao modificou o resumo calculado pelo snapshot.

Hunt e offline catch-up:

- O catch-up marcou a Hunt expirada como pronta sem conceder XP, gold, items ou supplies automaticamente.
- Aplicar o mesmo catch-up uma segunda vez nao alterou personagens nem criou outro relatorio de conclusao.
- O estado `readyToResolve` e o snapshot completo persistiram depois de Save/Reload.
- Resolver a mesma Hunt pelo caminho ativo e pelo caminho offline produziu resultado equivalente.
- O teste de 60 minutos com Warden produziu 1.323 casts, 26.325 de mana, +8% clear speed, -4,34% risco e -5,62% supplies.
- A resolucao final removeu a acao ativa e adicionou exatamente uma linha `Skill effects`, confirmando aplicacao unica no fluxo normal.
- Suporte desativado preservou o ataque, mas retornou 0% de reducao de risco e 0% de economia de supplies.

Normalizacao e Bosses:

- IDs inexistentes, duplicados, suporte de outra vocacao e duracao `NaN` foram normalizados para valores finitos e dentro dos tetos.
- A party de Guardian e Warden manteve dois resumos independentes e agregou 580 casts e 9.015 de mana.
- O efeito agregado foi +5,76% de poder de sucesso e -2,19% de risco de morte.
- A chance de sucesso subiu de 66% para 69,8016% e a chance de morte caiu de 15% para 14,6715%.
- O Boss Result recebeu o resumo dos dois integrantes e exatamente uma linha `Party skill effects`.

Restauracao e validacao:

- O processo Tauri e o Vite foram encerrados antes da restauracao do banco.
- O SQLite original foi restaurado com 81.920 bytes e o mesmo SHA-256; WAL, SHM e backup temporario foram removidos.
- O harness, sua variavel de ambiente e o desvio temporario de bootstrap foram removidos integralmente.
- `npm run build` passou antes do QA e com o harness temporario.
- O build final passou com 465 modulos e `npm run tauri:build` gerou novamente os bundles MSI e NSIS.

Limitacoes mantidas:

- Skills ainda nao causam dano por alvo nem cura numerica de HP na cena.
- Bosses continuam agregando suporte por party, sem alcance ou alvo individual.

Proximo passo sugerido:

- Etapa 136 - dano e cura por skill no relatorio detalhado de combate.

## Etapa 136 - Dano, cura e mitigacao por skill

Status: concluida.

Modelo de contribuicao:

- Cada skill agora possui perfil de dano, cura e/ou mitigacao alem dos impactos percentuais da Etapa 135.
- Skills ofensivas herdam uma escala de dano coerente com sua potencia, level e cooldown.
- Renew, Barkskin Circle, Centering Breath e Guardian Mantra geram cura contabilizada.
- Guard Stance, Rallying Standard, Trailstep, Wind Veil, Mana Ward, Chrono Veil, Barkskin Circle e Guardian Mantra contabilizam dano prevenido.
- O calculo usa attack power, defense power, HP, mana, level e expectativa de critico do personagem.
- Casts, mana, cooldowns, ordem e snapshot da acao continuam sendo a fonte deterministica do relatorio.

Integracao com gameplay:

- O dano detalhado representa a contribuicao que ja sustenta o bonus de clear speed; ele nao multiplica recompensas novamente.
- Cura e mitigacao representam os suportes que ja reduzem risco e supplies; nao existe uma segunda aplicacao desses bonus.
- Hunt, Boss e resolucao offline usam o mesmo resumo derivado do snapshot persistido.
- Nenhuma migration foi necessaria e nenhum novo estado precisa ser salvo.

Relatorio de Hunt:

- Combat Skill Effects mostra dano total, dano por minuto, cura total, cura por minuto, dano prevenido, mana e casts.
- A tabela detalha Skill, Casts, Damage, Healing e Prevented para cada entrada da rotacao.
- O Activity Log registra uma unica linha compacta com os totais do combate.

Relatorio de Boss:

- Party Skill Effects agrega dano, cura, mitigacao, mana e casts da equipe.
- Cada integrante possui um bloco proprio com sua rotacao e contribuicao por skill.
- O log do Boss inclui os totais agregados sem gerar entradas por cast.

Validacao:

- Fixture deterministica passou em 9/9 checks: repetibilidade, dano ofensivo, Renew, mitigacao, somatorios, dados hostis, party e recompensas finitas.
- A Hunt Warden de 60 minutos registrou 562.159 de dano, 16.065 de cura, 9.369 dano/min e 268 cura/min.
- A party Guardian/Warden/Arcanist registrou 444.391 de dano, 4.866 de cura e 1.825 de dano prevenido.
- Desktop em 1280px permaneceu sem overflow; o relatorio mostrou as cinco colunas completas.
- Mobile em 390px permaneceu sem overflow horizontal; os quatro totais continuam visiveis e a tabela reduz para Skill, Casts e Damage.
- A fixture temporaria foi removida integralmente; o unico erro de console observado pertenceu ao hot reload da propria fixture recriando a raiz React.
- `npm run build` passou depois da remocao com 466 modulos.
- `npm run tauri:build` passou e gerou os bundles MSI e NSIS.

Limitacoes atuais:

- Dano e cura sao telemetria agregada do combate idle, nao eventos de HP por alvo na arena.
- Nao existem overheal, escudo restante, resistencia elemental, acerto critico individual ou timeline cast a cast.
- No mobile, Healing e Prevented permanecem nos cards de resumo, mas sao ocultados nas linhas da tabela para preservar legibilidade.

Proximo passo sugerido:

- Etapa 136.5 - QA do relatorio detalhado no Tauri/SQLite e offline catch-up.

## Etapa 136.5 - QA do relatorio detalhado no Tauri/SQLite

Status: concluida.

Cobertura real:

- O harness temporario foi executado no aplicativo Tauri real usando o Tauri SQL Plugin e o SQLite local.
- A action snapshot da Warden persistiu separada do loadout atual e continuou sendo a fonte do relatorio apos Save/Reload.
- A mesma entrada gerou relatorio deterministico, com dano nas skills ofensivas, cura em Renew e somatorios exatos por entrada.
- Totais, valores por minuto e entradas permaneceram finitos e nao negativos inclusive com atributos, duracao e IDs hostis.
- Suporte desativado manteve dano ofensivo, sem adicionar cura ou mitigacao.

Offline catch-up e resolucao:

- O catch-up marcou a Hunt expirada como pronta sem conceder recompensas ou alterar Guild Depot.
- Uma segunda aplicacao do mesmo catch-up foi idempotente.
- `readyToResolve` e o snapshot completo persistiram depois de Save/Reload.
- Resolver a Hunt pelo caminho ativo e pelo caminho offline produziu o mesmo relatorio, XP, gold e loot.
- A resolucao adicionou exatamente uma linha `Skill effects` e removeu a action, sem reaplicar telemetria ou recompensas.

Hunt e Boss medidos:

- A Warden em Hunt de 60 minutos registrou 726.673 de dano, 34.174 de cura, 12.111 dano/min e 570 cura/min.
- A party Guardian/Warden/Arcanist agregou tres relatorios independentes em 1.244.602 de dano, 25.351 de cura e 20.732 de dano prevenido.
- Os totais da party coincidiram exatamente com a soma dos integrantes.
- O Boss Result manteve valores finitos e exatamente uma linha `Party skill effects`.

Restauracao e validacao:

- O QA passou em 16/16 checks no Tauri/SQLite.
- O processo do app, Tauri CLI e Vite foram encerrados antes da restauracao.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup temporario, harness e desvio de bootstrap foram removidos integralmente.
- `npm run build` passou antes do QA e com o harness temporario.

Limitacoes mantidas:

- O relatorio continua agregado; nao existem eventos individuais de dano, cura, critico ou alvo por cast.
- Cura nao calcula overheal e mitigacao nao rastreia escudo restante.

Proximo passo sugerido:

- Etapa 137 - timeline deterministica de casts e eventos de combate.

## Etapa 137 - Timeline deterministica de casts e eventos de combate

Status: concluida.

Modelo da timeline:

- O mesmo loop deterministico da rotacao agora registra a ordem e o instante relativo dos casts.
- Cada relatorio carrega no maximo 24 eventos amostrados, mesmo em Hunts de varias horas.
- A amostra reserva o primeiro cast de cada skill ativa, o ultimo cast e eventos proximos ao centro de faixas temporais distribuidas pela acao.
- O relatorio informa quantos eventos foram exibidos, o total real de casts e quantos casts intermediarios foram omitidos.
- Cada evento mostra tempo, skill, mana e sua contribuicao individual de dano, cura e/ou mitigacao.
- Contribuicoes inteiras por cast sao distribuidas de forma deterministica e permanecem coerentes com os totais agregados.

Integracao:

- Hunt Result abre a timeline completa dentro de Combat Skill Effects.
- Boss Result mantem a timeline de cada membro recolhida dentro de seu relatorio compacto.
- Ataques e suportes recebem marcadores visuais distintos na trilha temporal.
- A lista usa rolagem interna e dimensoes estaveis para nao expandir excessivamente o resultado.
- No mobile, a coluna de mana do evento e ocultada, mantendo tempo, skill e contribuicao legiveis.

Persistencia e gameplay:

- Nenhuma migration foi necessaria.
- A timeline e derivada do snapshot da action no momento da resolucao e nao vira estado salvo separado.
- Dano, cura e mitigacao continuam sendo telemetria dos efeitos ja aplicados; nenhum bonus ou reward e executado novamente.
- O teto de simulacao existente de oito horas e o limite de 20.000 iteracoes foram preservados.

Validacao:

- Fixture deterministica passou em 10/10 checks: repetibilidade, limite, contagem, omissoes, ordem, progresso, ataque, suporte desativado e party.
- A primeira amostragem revelou vies para Renew nos limites das faixas; a selecao foi corrigida para garantir diversidade de skills e cobertura temporal.
- A Warden de 60 minutos manteve 1.323 casts totais e exibiu somente 24 eventos representativos.
- Desktop em 1280px ficou sem overflow horizontal, com timeline de 1.026px dentro do conteudo.
- Mobile em 390px ficou sem overflow horizontal; evento e timeline permaneceram dentro de 304px e 321px.
- Ataque e suporte apareceram na amostra depois da correcao.
- Nenhum erro ou warning foi registrado no console da fixture.
- A fixture e o desvio temporario de bootstrap foram removidos integralmente.
- `npm run build` passou antes e depois da implementacao com 466 modulos.

Limitacoes atuais:

- A timeline e uma amostra, nao uma lista completa de milhares de casts.
- Eventos ainda nao possuem alvo, resistencia elemental, critico individual, overheal ou escudo restante.
- A cena ativa continua mostrando a rotacao atual; a timeline detalhada aparece no resultado concluido.

Proximo passo sugerido:

- Etapa 137.5 - QA da timeline no Tauri/SQLite e offline catch-up.

## Etapa 137.5 - QA da timeline no Tauri/SQLite

Status: concluida.

Persistencia e determinismo:

- O harness temporario executou no aplicativo Tauri real com o Tauri SQL Plugin e o SQLite local.
- O snapshot da action persistiu separado do loadout atual do personagem e permaneceu como fonte da timeline apos Save/Reload.
- Duas derivacoes da mesma action persistida produziram timelines identicas.
- A timeline manteve ordem estritamente crescente, progresso entre 0% e 100% e valores finitos e nao negativos.
- Todas as skills configuradas apareceram na amostra, incluindo eventos ofensivos e de suporte.

Hunt e offline catch-up:

- A Hunt Warden de 60 minutos registrou 1.323 casts, mostrou 24 e omitiu 1.299 eventos intermediarios.
- Renew, Thorn Bolt, Verdant Wave e Rootfall apareceram na mesma amostra.
- O catch-up marcou a Hunt expirada como pronta sem conceder rewards nem alterar Guild Depot.
- Aplicar o catch-up novamente foi idempotente.
- `readyToResolve` e o snapshot persistiram depois de Save/Reload.
- Resolver a Hunt ativa ou offline produziu a mesma timeline, XP, gold e loot.
- A resolucao offline gerou exatamente uma linha `Skill effects` e removeu a action.
- Suporte desativado eliminou eventos de suporte e cura sem remover ataques.

Limites e Bosses:

- Uma entrada de 24 horas foi limitada a oito horas de simulacao, com 10.563 casts, 24 exibidos e 10.539 omitidos.
- A party Guardian/Warden/Arcanist manteve tres timelines independentes com 24 eventos cada.
- Guardian registrou 353 casts, Warden 399 e Arcanist 381 na luta de 18 minutos.
- Cada integrante preservou ao menos um ataque e um suporte na amostra.
- O Boss Result recebeu as mesmas timelines calculadas e exatamente uma linha `Party skill effects`.
- Atributos, duracao e IDs hostis continuaram produzindo timeline finita e limitada.

Restauracao e validacao:

- O QA passou em 18/18 checks no Tauri/SQLite.
- A tentativa de auto-close foi recusada pela permissao Tauri `core:window:allow-close`; app, CLI e Vite foram encerrados explicitamente.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup temporario, harness e desvio de bootstrap foram removidos integralmente.
- `npm run build` passou antes do QA e com o harness temporario.

Limitacoes mantidas:

- A timeline continua amostrada e derivada na resolucao, sem persistir milhares de eventos individuais.
- Eventos ainda nao identificam alvo, critico individual, resistencia, overheal ou escudo restante.

Proximo passo sugerido:

- Etapa 138 - alvos e acertos criticos deterministas na timeline de combate.

## Etapa 138 - Alvos e acertos criticos deterministas

Status: concluida.

Alvos reais:

- Ataques de Hunt selecionam deterministicamente entre os monstros reais da area.
- Ataques de Boss apontam para o Boss real da tentativa.
- Suportes solo apontam para o proprio personagem.
- Suportes de party selecionam deterministicamente entre os integrantes e identificam `Self` quando o alvo e o conjurador.
- Chamadas sem contexto explicito usam o alvo salvo na action como fallback seguro.
- Cada evento passa a carregar target ID, nome e tipo: monster, boss, ally, self ou encounter.

Criticos deterministas:

- A quantidade de criticos por skill deriva de casts e `critChancePercent` do personagem.
- Criticos sao distribuidos por ordinal de cast com fase estavel baseada em personagem e skill.
- O peso de um critico usa a mesma expectativa de `critDamagePercent` que ja participava do dano agregado.
- Arredondamento cumulativo ponderado garante que a soma de todos os casts continue exatamente igual ao dano total anterior.
- `0%` de chance produz zero criticos e `100%` marca todos os ataques, sem aplicar dano duas vezes.
- Skills de suporte nao geram criticos ofensivos.

Relatorio e UI:

- O resumo mostra total de casts e criticos ao lado da mana.
- Cada evento exibe skill, alvo e contribuicao; eventos criticos recebem texto `CRIT` e destaque dourado.
- Marcadores criticos tambem sao destacados na trilha temporal.
- O log compacto de Hunt e Boss inclui a contagem total de critical hits sem criar spam por evento.
- No mobile, o alvo continua visivel e apenas a coluna secundaria de mana e ocultada.

Persistencia e gameplay:

- Nenhuma migration ou novo estado salvo foi necessario.
- Alvos e criticos sao derivados na resolucao a partir do snapshot, personagens e encontro real.
- XP, gold, loot, risco, supplies e bonus de clear speed nao recebem uma segunda aplicacao.
- O total de dano existente e preservado; a mudanca detalha como ele e distribuido visualmente.

Validacao:

- Fixture deterministica passou em 14/14 checks: repetibilidade, somatorios, criticos, targets, party e integracao com Boss Result.
- Uma timeline curta sem eventos omitidos somou exatamente o dano dos eventos ao dano agregado.
- A Hunt de teste alternou entre Mud Rotter e Cave Spider e manteve suporte em Self.
- A party Guardian/Warden/Arcanist apontou ataques para Khazgrim Gatekeeper e suportes para integrantes reais.
- O Boss Result recebeu o mesmo relatorio calculado diretamente pela party.
- A fixture de 60 minutos registrou 1.323 casts e 378 criticos com chance configurada de 35% nas skills ofensivas.
- Desktop em 1280px e mobile em 390px permaneceram sem overflow horizontal.
- No mobile, o alvo ocupou 112px dentro do evento de 304px e continuou legivel.
- Evento validado visualmente: `Verdant Wave`, alvo `Cave Spider`, `CRIT / 1.791 dmg`.
- Nenhum erro ou warning foi registrado no console.
- Fixture e desvio temporario de bootstrap foram removidos integralmente.
- `npm run build` passou depois da remocao com 466 modulos.

Limitacoes atuais:

- Alvos representam atribuicao da telemetria e ainda nao possuem HP individual persistente na simulacao idle.
- Nao existem miss, dodge, resistencia elemental, fraqueza, overheal ou escudo restante.
- Criticos de cura e mitigacao nao foram implementados.

Proximo passo sugerido:

- Etapa 138.5 - QA de alvos e criticos no Tauri/SQLite e offline catch-up.

## Etapa 138.5 - QA de alvos e criticos no Tauri/SQLite

Status: concluida.

Persistencia e atributos:

- O harness temporario executou dentro do aplicativo Tauri real usando o Tauri SQL Plugin e o SQLite local.
- O snapshot da action persistiu separado do loadout atual e continuou sendo a fonte da rotacao apos Save/Reload.
- A timeline com alvos permaneceu deterministica depois do reload.
- Atributos foram recalculados pelo equipamento real durante o load, em vez de confiar cegamente no JSON salvo.
- A Warden persistida voltou corretamente para 0% de critico conforme seu equipamento e produziu zero eventos criticos.
- Totais de criticos continuaram iguais a soma das entradas por skill e ao total registrado na timeline.

Hunt e targets:

- A Hunt persistida registrou 1.323 casts e alternou entre Mud Rotter e Cave Spider.
- Todos os ataques apontaram para IDs reais do catalogo da Hunt.
- Renew apontou somente para Self no combate solo.
- Sem contexto explicito, ataques usaram a area salva na action como encounter e suporte usou Self.
- IDs, nomes, tipos de target e contribuicoes permaneceram validos e finitos.
- `finishHunt` injetou corretamente o catalogo real de monstros no relatorio final.

Criticos e extremos:

- O cenario de 100% marcou os quatro ataques da timeline curta como criticos.
- Com todos os eventos presentes, a soma do dano por evento permaneceu exatamente igual ao dano agregado.
- O cenario de 0% produziu zero critical hits e nenhum evento marcado.
- A primeira execucao do harness ficou em 21/22 porque esperava 35% apos reload; a premissa foi corrigida para respeitar os atributos derivados do equipamento.
- A repeticao foi feita sobre o banco original restaurado e passou integralmente.

Offline catch-up e Boss:

- O catch-up marcou a Hunt pronta sem alterar rewards ou Guild Depot e permaneceu idempotente na segunda aplicacao.
- `readyToResolve` e o snapshot persistiram depois de Save/Reload.
- Resolucao ativa e offline produziram a mesma timeline, XP, gold e loot.
- O log final apareceu uma vez, incluiu critical hits e a action foi removida.
- A party Guardian/Warden/Arcanist agregou 340 criticos: 112 de Guardian, 114 de Warden e 114 de Arcanist.
- Ataques dos tres integrantes apontaram para Khazgrim Gatekeeper.
- Suportes apontaram apenas para membros reais da party e identificaram Self quando apropriado.
- Boss Result recebeu o mesmo relatorio e exatamente uma linha `Party skill effects`.

Restauracao e validacao:

- A repeticao limpa passou em 22/22 checks no Tauri/SQLite.
- App, Tauri CLI e Vite foram encerrados explicitamente antes da restauracao.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup, logs, harness e desvio de bootstrap foram removidos integralmente.
- Uma validacao de limpeza recusou inicialmente o nome do backup por diferenca entre hifen e underscore; nenhum caminho foi apagado ate a lista exata ser confirmada.
- `npm run build` passou antes do QA e com o harness temporario.

Limitacoes mantidas:

- Crit chance continua derivado dos atributos/equipamentos atuais no momento da resolucao; nao existe snapshot separado de atributos completos.
- Targets ainda nao possuem HP individual persistente, resistencia, fraqueza, miss ou dodge.

Proximo passo sugerido:

- Etapa 139 - tipos de dano, resistencias e fraquezas elementais.

## Etapa 139 - Tipos de dano, resistencias e fraquezas elementais

Status: concluida.

Modelo implementado:

- Sete tipos de dano: physical, fire, ice, earth, energy, holy e death.
- As 20 skills ofensivas das cinco vocacoes possuem tipo explicito; as 10 skills de suporte continuam sem dano elemental.
- Os 12 monstros e 6 Bosses atuais receberam perfis tematicos de resistencia e fraqueza.
- Cada valor de perfil fica entre -25% de fraqueza e +25% de resistencia.
- Valores ausentes sao neutros; perfis invalidos ou nao finitos tambem caem em neutro.
- Valores hostis fora do limite sao normalizados em tempo de calculo para -25/+25.

Integracao de combate:

- A mesma selecao deterministica de alvo usada na timeline define o modificador de cada cast.
- Dano base, dano ajustado, delta elemental e efetividade percentual permanecem separados no relatorio.
- Critico e elemento sao compostos por cast sem alterar a contagem deterministica de criticos.
- A soma de todos os eventos de uma timeline completa continua igual ao dano agregado.
- Hunts passam os perfis dos monstros reais e Bosses passam o perfil do Boss para todos os integrantes da party.
- Efetividade elemental ajusta apenas a contribuicao existente de clear speed/success power e continua limitada pelo teto global de 8%.
- XP, gold, loot, supplies, death risk e persistencia nao receberam multiplicadores elementais paralelos.

Interface e logs:

- O relatorio mostra dano por minuto e efetividade elemental agregada.
- Cada evento ofensivo mostra alvo, tipo e estado neutral, weak ou resisted.
- Marcadores e linhas usam cores distintas para fraqueza e resistencia, preservando o destaque de critico.
- O layout mobile permite quebra da legenda elemental sem overflow horizontal.
- Logs finais de Hunt e Boss registram a efetividade elemental em uma unica linha, sem spam por cast.

Validacao:

- Fixture temporario passou em 17/17 checks de dados, limites, neutralidade, fraqueza, resistencia, determinismo, criticos, soma por evento, alvos mistos, Boss party e entradas hostis.
- Dragon Whelp confirmou fire resistido em -25% e ice fraco em +25%.
- Hunt mista com Mud Rotter e Cave Spider confirmou ambos os alvos reais e resistencia earth agregada.
- Boss Ember Matriarch diferenciou fire resistido e ice fraco entre integrantes da mesma party.
- QA visual passou em 1280x900 e 390x844 sem overflow horizontal ou falhas do fixture.
- Fixture, servidor e logs temporarios foram removidos apos o QA.
- `npm.cmd run build` passou.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.

Limitacoes mantidas:

- Alvos nao possuem HP individual persistente; o dano continua sendo telemetria agregada da simulacao idle.
- Nao existem miss, dodge, penetration, dano ao longo do tempo, conversao elemental ou status ailments.
- Perfis elementais sao dados locais estaticos e ainda nao aparecem em Bestiary/briefing como painel dedicado.
- O QA desta etapa usou engine e interface web; a matriz Tauri/SQLite e catch-up offline fica para a etapa de QA dedicada.

Proximo passo sugerido:

- Etapa 139.5 - QA elemental no Tauri/SQLite e offline catch-up.

## Etapa 139.5 - QA elemental no Tauri/SQLite e offline catch-up

Status: concluida.

Persistencia e snapshot:

- O harness temporario executou no aplicativo Tauri real usando o Tauri SQL Plugin e o SQLite local.
- O snapshot da action preservou Thorn Bolt enquanto o loadout atual separado preservou Rootfall apos Save/Reload.
- Resistencias nao foram duplicadas no JSON da action; continuam vindo do catalogo local de monstros e Bosses.
- Metadata offline foi alterada e relida pelo registro real `primary` do SQLite.
- O relatorio elemental permaneceu deterministico antes e depois do reload.
- Dano, delta, percentuais, timeline, entradas e criticos permaneceram finitos e consistentes apos o mapeamento do save.

Hunt e balanceamento:

- A Hunt persistida em Mudrot Cave produziu 481 casts contra Cave Spider e Mud Rotter.
- O dano base foi 127.566 e o dano ajustado 105.264, resultando em -17,48% elemental.
- A resistencia earth reduziu a contribuicao de clear speed de 4,2% no alvo neutro para 3,47%.
- A soma do dano das entradas permaneceu igual ao total agregado.
- A soma de criticos das entradas permaneceu igual ao total da timeline.
- Renew continuou apontando para Self e sem tipo de dano elemental.
- O fallback sem perfil preservou exatamente o dano base e 0% elemental.

Offline catch-up:

- O catch-up marcou a action persistida como pronta sem aplicar XP, gold, loot ou mudancas no Guild Depot.
- A segunda aplicacao nao gerou mudanca nem novo relatorio de personagem.
- `readyToResolve` persistiu apos Save/Reload.
- Resolucao ativa e offline produziram relatorios elementais, XP, gold, loot e supplies equivalentes.
- O log elemental apareceu uma unica vez e a action foi removida depois da resolucao.
- Rewards e action resolvida persistiram uma vez; novo catch-up nao conseguiu resolver novamente.

Boss e entradas hostis:

- Ember Matriarch aplicou aproximadamente -25% ao Meteor Sigil fire e +25% ao Frost Lance ice.
- Dano base e ajustado da party permaneceram iguais a soma dos integrantes.
- Todos os ataques da party mantiveram Ember Matriarch como target real do tipo Boss.
- O Boss Result registrou exatamente um resumo elemental.
- Resistencia infinita caiu em neutro sem NaN.
- Fraqueza -999 foi limitada corretamente a +25% de dano.

Execucao e restauracao:

- A primeira execucao ficou em 30/31 porque o harness usou o ID historico incorreto `primary-save`; o schema real usa `primary`.
- O banco original foi restaurado antes da repeticao e o harness passou em 31/31 checks.
- App, Tauri CLI, Cargo e Vite foram encerrados antes da restauracao final.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup, logs, harness e desvio de bootstrap foram removidos integralmente.
- Nenhuma mudanca de schema ou de gameplay foi necessaria nesta QA.

Limitacoes mantidas:

- Dano continua sendo telemetria agregada e nao reduz HP individual persistente dos targets.
- Perfis elementais continuam estaticos no catalogo local.
- Nao existem miss, dodge, accuracy, penetration ou status ailments.

Proximo passo sugerido:

- Etapa 140 - accuracy, miss e dodge deterministas no combate.

## Etapa 140 - Accuracy, miss e dodge deterministas

Status: concluida.

Modelo de combate:

- Personagens agora possuem `accuracyPercent` e `dodgePercent` derivados de level, skill principal, speed e vocacao.
- Accuracy fica limitada entre 80% e 98%; dodge fica limitado entre 0% e 18%.
- Os 12 monstros e 6 Bosses atuais receberam `evasionPercent` local entre 2% e 15%.
- Cada ataque resolve deterministicamente `hit`, `miss` ou `dodged`; suporte continua usando o outcome proprio `support`.
- Miss e dodge causam zero dano e nunca podem ser criticos.
- Valores ausentes, infinitos ou invalidos recebem fallback neutro e nao propagam NaN.

Gameplay e agregados:

- O relatorio separa dano base potencial, dano base que acertou e dano final apos modificadores elementais.
- Hit rate reduz proporcionalmente o bonus ofensivo das skills sem ultrapassar os caps existentes.
- Dodge reduz levemente o risco de morte, com contribuicao propria limitada a 6% e cap agregado existente de 10% preservado.
- Hunts e Boss parties somam ataques, hits, misses e dodges exatos por personagem.
- A timeline limitada continua derivada e nao e persistida, evitando ampliar saves ou duplicar rewards.

Interface e logs:

- Character Details mostra Accuracy e Dodge no Combat Overview.
- Relatorio de combate mostra hit rate, hits por casts e eventos `MISS`/`DODGED` com leitura visual distinta.
- Logs de Hunt e Boss registram ataques, acertos, misses, dodges e criticos sem emitir uma linha por ataque.
- Timeline e tabela permaneceram responsivas sem overflow em desktop e mobile.

Validacao:

- Fixture temporaria passou em 27/27 checks de determinismo, limites, miss, dodge, criticos, elementos, agregados, Hunts, Boss parties e entradas hostis.
- Comparacao sobre os mesmos rolls confirmou 83,47% de hit com 80 accuracy e 95,04% com 98 accuracy.
- Cenario com 100 accuracy e 0 evasion acertou todos os ataques; 100% critico marcou todos os hits como criticos.
- Cenario com 25 evasion produziu 16 dodges e reduziu o bonus ofensivo de 4,16% para 2,54%.
- Resistencia fire permaneceu independente da avoidance, com aproximadamente -25% de dano elemental.
- QA visual passou em 1280x900 e 390x844 sem overflow de pagina, eventos ou tabela; console sem erros.
- Fixture, servidor e logs temporarios foram removidos apos o QA.
- `npm.cmd run build` passou com 466 modulos.
- `npm.cmd run tauri:build` passou e gerou executavel, MSI e NSIS.

Limitacoes mantidas:

- Accuracy e dodge ainda nao recebem bonus especificos de equipamentos ou buffs; usam os atributos derivados atuais.
- Evasion e um valor estatico do catalogo local e ainda nao possui painel dedicado no Bestiary/briefing.
- Dano continua sendo telemetria agregada da simulacao idle, sem HP individual persistente por criatura.
- Esta etapa validou engine e interface; persistencia SQLite, reload e catch-up offline ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 140.5 - QA de accuracy, miss e dodge no Tauri/SQLite e offline catch-up.

## Etapa 140.5 - QA de accuracy, miss e dodge no Tauri/SQLite

Status: concluida.

QA real no Tauri/SQLite:

- Um harness temporario protegido por `VITE_QA_ACCURACY_SQLITE=1` executou no WebView Tauri e usou o Tauri SQL Plugin real.
- O save original foi copiado antes do teste e nenhum processo do jogo estava usando o banco naquele momento.
- A fixture foi gravada pelo repository oficial, relida pelo mapper e validada com o metadata ID canonico `primary`.
- Accuracy e dodge foram recalculados apos reload; a personagem de QA carregou 98% accuracy e 5,01% dodge.
- A Hunt, target e snapshot da rotacao de skills persistiram sem salvar a timeline derivada.
- O relatorio permaneceu identico em duas simulacoes apos o reload SQLite.

Accuracy, miss e dodge:

- Os mesmos rolls produziram 80,52% de hit com 80 accuracy e 97,92% com 98 accuracy.
- O cenario de 100 accuracy contra 0 evasion acertou 1.070/1.070 ataques.
- Com crit chance de 100%, todos os hits foram criticos e nenhum outcome evitado foi marcado como critico.
- O cenario de 25 evasion produziu 1.067 dodges e reduziu o bonus ofensivo de 8% para 6,34%.
- Eventos amostrados de miss e dodge causaram zero dano.
- Dano potencial, dano que acertou e dano elemental final permaneceram separados e com somas exatas.
- Dodge em 18% aplicou o cap proprio de 6% na reducao de risco; o cap agregado de 10% permaneceu respeitado.
- Accuracy `NaN`, dodge infinito negativo e evasion infinito produziram fallbacks finitos, sem quebrar a simulacao.

Boss party:

- A party de tres personagens produziu 2.753 ataques, com somas exatas entre integrantes e resumo agregado.
- Todos os eventos ofensivos mantiveram Sewer Broodmother como target real do tipo Boss.
- Hits, misses e dodges continuaram deterministicos entre os integrantes.

Offline catch-up e idempotencia:

- Uma Hunt expirada foi marcada como `readyToResolve` sem aplicar XP, gold, loot ou alteracao de inventario.
- `offlineCompletedAt`, `readyToResolve` e `last_offline_catchup_at` persistiram no SQLite apos Save/Reload.
- Uma segunda aplicacao do catch-up gerou zero novos relatorios.
- Resolucao ativa e offline produziram exatamente o mesmo relatorio de combate, 4.687 XP, 761 gold e o mesmo loot.
- A action resolvida foi removida e permaneceu ausente apos reload, impedindo uma segunda coleta.

Execucao e restauracao:

- O harness passou em 29/29 checks no Tauri/SQLite real.
- A tentativa inicial de leitura externa encontrou o Python do sistema indisponivel; a consulta foi repetida com o runtime isolado do workspace e passou sem alterar o teste.
- App, Tauri CLI, Cargo e Vite foram encerrados antes da restauracao.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup, logs, harness e desvio de bootstrap foram removidos integralmente.
- Nenhuma correcao de gameplay, schema ou persistencia foi necessaria.

Proximo passo sugerido:

- Etapa 141 - armor penetration e reducao de defesa deterministas.

## Etapa 141 - Armor penetration e reducao de defesa deterministas

Status: concluida.

Modelo defensivo:

- Personagens agora possuem `armorPenetrationPercent` derivado de level, skill principal e vocacao.
- Penetration base fica limitada entre 0% e 25%; bonuses especificos de skills podem elevar o valor aplicado ate 40%.
- Armor e defense existentes nos monstros formam um protection score deterministico.
- A mitigacao cresce de forma desacelerada e nunca ultrapassa 40% antes da penetration.
- Armor e defense ausentes, negativos, infinitos ou invalidos recebem fallback seguro.
- A ordem por cast agora e: hit/miss/dodge, mitigacao defensiva e modificador elemental.

Skills e Bosses:

- Shield Break recebe +14% penetration.
- Piercing Arrow recebe +12% penetration.
- Falcon Mark recebe +10% penetration.
- Bastion Crash recebe +8% penetration.
- Palm Strike recebe +5% penetration.
- Os seis Bosses atuais receberam perfis proprios de armor e defense, do Sewer Broodmother ao Ember Matriarch.
- Hunts encaminham armor/defense dos monstros reais e Boss fights encaminham a protecao do Boss real.

Gameplay e agregados:

- O relatorio separa dano potencial, dano que acertou, dano apos defesa e dano final apos elemento.
- `defenseDamageDelta`, `defenseMitigationPercent` e penetration media ponderada sao calculados por personagem e party.
- A reducao defensiva diminui proporcionalmente o bonus de clear speed/success power, mantendo o cap ofensivo anterior de 8%.
- Miss e dodge continuam causando zero dano antes da camada defensiva.
- Criticos continuam sendo aplicados somente em hits e passam normalmente por defesa e elemento.
- Timeline continua limitada e derivada, sem ampliar save ou persistir eventos.

Interface e logs:

- Character Details mostra Penetration no Combat Overview.
- Relatorio de dano mostra hit rate, mitigacao defensiva e modificador elemental separadamente.
- Eventos da timeline mostram `Defense -X% (Y% pen)` e possuem leitura visual propria para alvos protegidos.
- Party report e logs de Boss mostram mitigacao e penetration ponderadas sem spam por cast.

Validacao:

- Fixture temporaria passou em 26/26 checks de limites, neutralidade, armor/defense, penetration, skills perfurantes, avoidance, elementos, agregados, Boss party, logs e entradas hostis.
- Alvo sem protecao preservou exatamente o dano que acertou e 0% de mitigacao.
- Alvo protegido reduziu dano; aumentar penetration reduziu a mitigacao e recuperou parte do dano final.
- Piercing Arrow aplicou exatamente 12 pontos percentuais adicionais sobre a penetration base; Quickshot manteve somente a base.
- Protection extremo permaneceu limitado a 40%; valores infinitos/NaN cairam em neutro sem contaminar o relatorio.
- Resistencia elemental permaneceu independente da mitigacao defensiva.
- QA visual passou em 1280x900 e viewport mobile efetivo de 375x844 sem overflow de pagina, relatorio ou timeline.
- Console do navegador permaneceu sem erros.
- Fixture, servidor e logs temporarios foram removidos apos o QA.

Limitacoes mantidas:

- Penetration ainda nao recebe bonus direto de equipamentos, tiers, imbuements ou perks de Weapon Proficiency.
- Nao ha debuff persistente de armor quebrada entre casts; o bonus pertence ao golpe que o aplica.
- Armor/defense afetam apenas a telemetria agregada das skills e sua contribuicao limitada de gameplay; targets continuam sem HP individual persistente.
- O QA desta etapa usou engine e interface web; persistencia SQLite, reload e catch-up ficam para a etapa dedicada.

Proximo passo sugerido:

- Etapa 141.5 - QA de armor penetration e defesa no Tauri/SQLite e offline catch-up.

## Etapa 141.5 - QA de armor penetration e defesa no Tauri/SQLite

Status: concluida.

Persistencia e snapshot:

- Um harness temporario protegido por `VITE_QA_DEFENSE_SQLITE=1` executou no WebView Tauri com o SQL Plugin real.
- A fixture foi persistida pelo repository oficial e relida pelo mapper usando o metadata ID canonico `primary`.
- Penetration derivada foi recalculada em 11,8% apos reload, sem precisar de nova coluna ou campo persistido.
- Hunt, target e snapshot da rotacao com Quickshot, Piercing Arrow, Feather Fan e Trailstep persistiram corretamente.
- O relatorio completo de defense/penetration permaneceu deterministico apos reload.

Defense e penetration:

- Sewer Rat real aplicou 0,29% de mitigacao, confirmando o encaminhamento de armor/defense do catalogo da Hunt.
- Alvo neutro preservou exatamente 475.068 de dano acertado.
- Alvo com 100 armor e 150 defense reduziu o dano de 475.068 para 314.928, ou 33,71% de mitigacao.
- Elevar a penetration base reduziu a mitigacao de 33,71% para 28,4% e recuperou o dano para 340.125.
- Quickshot manteve a penetration base de 11,8%; Piercing Arrow aplicou 23,8%, exatamente 12 pontos adicionais.
- Protection e penetration extremas permaneceram dentro dos caps e todos os resultados ficaram finitos.
- Armor/defense infinitos ou NaN cairam em protecao neutra sem quebrar a simulacao.
- Resistencia physical de 25% permaneceu separada da mitigacao defensiva e resultou em aproximadamente -25% elemental.
- Os 279 ataques evitados no cenario hostil passaram por defense com zero dano, sem critico indevido.

Boss party:

- Tres snapshots de Boss persistiram e foram relidos com target e rotacao corretos.
- Ember Matriarch permaneceu como target real do tipo Boss em todos os eventos ofensivos.
- O relatorio da party somou exatamente 358.164 de dano final entre seus integrantes.
- A party registrou 32,3% de mitigacao defensiva e 13,87% de penetration media ponderada.

Offline catch-up e idempotencia:

- Uma Hunt expirada foi marcada como `readyToResolve` sem aplicar XP, gold, loot ou mudanca de inventario.
- `readyToResolve`, `offlineCompletedAt` e `last_offline_catchup_at` persistiram apos Save/Reload.
- A segunda aplicacao do catch-up gerou zero novos relatorios.
- Resolucao ativa e offline produziram o mesmo relatorio defensivo, 4.687 XP, 761 gold e loot identico.
- A action resolvida permaneceu removida apos reload, bloqueando uma segunda coleta.

Execucao e restauracao:

- O harness passou em 35/35 checks no Tauri/SQLite real.
- App, Tauri CLI, Cargo e Vite foram encerrados antes da restauracao.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup, logs, harness e desvio de bootstrap foram removidos integralmente.
- Nenhuma correcao de gameplay, schema ou persistencia foi necessaria.

Proximo passo sugerido:

- Etapa 142 - block chance e mitigacao defensiva do heroi.

## Etapa 142 - Block chance e mitigacao defensiva do heroi

Status: concluida.

Atributos defensivos:

- Personagens agora possuem `blockChancePercent` e `blockMitigationPercent` derivados.
- Block chance usa shielding, level, vocacao e bonus claro para shield equipado.
- Block power usa shielding, armor, vocacao e shield equipado.
- Chance fica limitada entre 0% e 35%; block power fica limitado entre 20% e 55%.
- Personagens sem shield mantem uma chance pequena de aparar, enquanto Guardians/shields ocupam o perfil defensivo principal.
- Os atributos sao recalculados pelo mapper e nao exigem migration ou novos campos persistidos.

Ataques recebidos:

- O relatorio gera uma sequencia deterministica e limitada de ataques inimigos durante a duracao da atividade.
- Cada ataque usa target real, level e faixa `minDamage`/`maxDamage` do catalogo local.
- Os 12 monstros ja forneciam essas faixas; os seis Bosses receberam perfis ofensivos proprios.
- O roll de block usa personagem, target e indice do ataque, permanecendo estavel entre simulacoes equivalentes.
- Block reduz somente a parcela definida por block power; dano bloqueado nunca ultrapassa dano recebido.
- Targets ausentes geram telemetria defensiva neutra; valores invalidos recebem fallback finito.

Gameplay e agregados:

- O resumo registra ataques recebidos, blocks, block rate, dano recebido, dano bloqueado e dano restante.
- A reducao efetiva de dano por block gera ate 5% de contribuicao propria na reducao de risco.
- Dodge, suporte e block continuam compartilhando o cap defensivo agregado anterior de 10%.
- Block nao altera casts, hits, dano causado, loot, XP ou gold diretamente.
- Party report soma ataques e dano exatos e calcula chance/power ponderados entre integrantes.
- Hunts e Bosses usam os mesmos perfis defensivos deterministas.

Interface e logs:

- Character Details mostra Block Chance e Block Power no Combat Overview.
- A metrica `Prevented` combina mitigacao de skills e dano bloqueado, mantendo o detalhamento separado.
- O relatorio mostra blocks realizados/recebidos e o total de dano bloqueado.
- Logs de Hunt e Boss incluem um unico `Defense report`, evitando spam por ataque recebido.

Validacao:

- Fixture temporaria passou em 28/28 checks de atributos, shield, caps, determinismo, dano, risco, entradas hostis, Hunts, Boss party e logs.
- Shield aumentou chance e power em relacao ao mesmo personagem sem offhand.
- Chance 0 produziu zero blocks; chance 35 produziu mais blocks sobre a mesma sequencia.
- Alterar somente block power preservou exatamente os rolls de block e mudou apenas o dano evitado.
- Block reduziu risco sem alterar o fingerprint ofensivo do relatorio.
- A fixture real exibiu 74 blocks em 570 ataques e 4.714 de dano bloqueado para o Guardian com shield.
- Ember Matriarch party somou 37.288 de dano bloqueado e 11,34% de block rate.
- QA visual passou em 1280x900 e viewport mobile efetivo de 375x844 sem overflow de pagina, cards ou timeline.
- Console do navegador permaneceu sem erros.
- Fixture, servidor e logs temporarios foram removidos apos o QA.

Limitacoes mantidas:

- Ataques recebidos sao telemetria agregada da simulacao idle e nao eventos persistidos com HP por criatura/personagem.
- Nao existem perfect block, parry counter, block cooldown ou quebra de shield.
- Block power ainda nao recebe bonus exclusivo de tiers, imbuements ou perks novos de Weapon Proficiency.
- O QA desta etapa usou engine e interface web; reload SQLite e catch-up ficam para a etapa dedicada.

Proximo passo sugerido:

- Etapa 142.5 - QA de block e mitigacao defensiva no Tauri/SQLite e offline catch-up.

## Etapa 142.5 - QA de block e mitigacao defensiva no Tauri/SQLite

Status: concluida como QA de persistencia e equivalencia offline, sem correcao de gameplay necessaria.

Persistencia e reload:

- Um harness temporario executado pelo app Tauri real criou a fixture, salvou e recarregou o estado pelo SQLite local.
- O reload preservou o ID canonico `primary`, a Hunt ativa, a rotacao de skills, o shield equipado e os snapshots da acao.
- Os atributos derivados foram recalculados apos o reload em 15,1% de block chance e 37,05% de block power.
- Tres snapshots de Boss persistiram corretamente antes da simulacao em grupo.

Block e mitigacao:

- A Hunt real gerou 482 ataques recebidos e 1.172 de dano bruto no cenario base.
- O Guardian com shield bloqueou 59 ataques e evitou 45 de dano nessa Hunt curta.
- Chance 0 produziu zero blocks; chance 35 produziu 199 blocks contra 80 do cenario de comparacao.
- Alterar somente block power preservou os 199 rolls e aumentou o dano evitado de 7.235 para 19.910.
- Identidades de dano, block rate e reducao permaneceram exatas e todos os valores ficaram finitos.
- A contribuicao de block respeitou o cap proprio de 5%; a reducao defensiva agregada permaneceu abaixo do cap de 10%.
- O fingerprint ofensivo permaneceu inalterado e targets ausentes produziram telemetria neutra.

Boss party e catch-up offline:

- Ember Matriarch usou seu perfil real de dano e produziu agregados exatos de 407.937 de dano recebido e 15.188 bloqueado.
- As metricas ponderadas da party permaneceram limitadas, com 10,01% de block rate e 34,44% de block power.
- O catch-up marcou a Hunt expirada como pronta sem aplicar rewards automaticamente.
- Reaplicar o catch-up foi idempotente e a acao resolvida nao permitiu coleta duplicada.
- A simulacao ativa e a simulacao offline produziram o mesmo relatorio defensivo e os mesmos rewards: 714 XP e 71 gold.

Execucao e restauracao:

- O harness passou em 35/35 checks no Tauri/SQLite real.
- `npm.cmd run build` passou antes da execucao do harness.
- App, Tauri CLI, Cargo e Vite foram encerrados antes da restauracao.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup, logs, harness e desvio de bootstrap foram removidos integralmente.
- Nenhuma migration, alteracao de schema ou correcao de produto foi necessaria.

Proximo passo sugerido:

- Etapa 143 - condicoes de combate deterministicas, com burn, poison e slow em Hunts e Bosses.

## Etapa 143 - Condicoes deterministicas de combate

Status: concluida.

Modelo e skills:

- O sistema reconhece `burn`, `poison` e `slow` por meio de definicoes tipadas no catalogo de skills.
- `Meteor Sigil` aplica burn com 85% de chance, 8 segundos de duracao e quatro ticks potenciais.
- `Thorn Bolt` aplica poison com 35% de chance, 9 segundos de duracao e tres ticks potenciais.
- `Frost Lance` aplica slow de 20% por 5 segundos com 75% de chance.
- `Rootfall` aplica slow de 18% por 6 segundos com 70% de chance.
- Skills sem uma condicao explicita permanecem neutras e nao recebem efeito implicito pelo tipo elemental.

Resolucao deterministica:

- Uma condicao so pode ser rolada depois de um hit valido; miss e dodge nunca aplicam efeitos.
- O roll usa personagem, target, skill, indice do cast e tipo da condicao, produzindo o mesmo resultado em simulacoes equivalentes.
- Burn e poison calculam ticks apenas dentro do tempo restante da atividade; casts no fim nao recebem duracao artificial.
- O dano de condicao usa o dano direto daquele cast e fica limitado a 25% do dano direto da skill.
- Slow nao causa dano e registra duracao, potencia e uptime limitado entre 0% e 100%.
- Valores ausentes, negativos, NaN ou infinitos passam por limites finitos antes do calculo.

Gameplay e agregados:

- O dano total agora e a identidade exata `directDamage + totalConditionDamage`.
- Dano de condicao contribui de forma pequena para clear speed; slow contribui para clear speed e reducao de risco.
- A contribuicao adicional de condicoes fica limitada a 3% de ataque e 2% de reducao de risco.
- Os caps globais anteriores continuam em 8% de ataque e 10% de reducao de risco.
- Party report soma aplicacoes, ticks e dano exatamente e calcula uptime/potencia de slow entre os integrantes.
- O modificador elemental continua medindo apenas dano direto, sem classificar DoT como fraqueza elemental.
- Hunts, Bosses e catch-up offline usam a mesma funcao pura e os snapshots existentes; nenhuma migration foi necessaria.

Interface e logs:

- O Combat Skill Report mostra dano de condicoes no total e uma faixa compacta para burn, poison e slow.
- A faixa informa aplicacoes, ticks, dano, uptime e potencia conforme o tipo.
- Eventos amostrados da timeline mostram condicao aplicada e sua contribuicao, com cores distintas para burn, poison e slow.
- Miss e dodge nao exibem mensagem enganosa de falha de condicao.
- Relatorios individuais e de party mostram condicoes sem remover dano, healing, block ou mana.
- Logs de Hunt e Boss adicionam um resumo unico de condicoes, evitando spam por tick.

Validacao:

- Fixture temporaria passou em 24/24 checks de burn, poison, slow, hits, caps, determinismo, timeline, party, logs e valores finitos.
- Burn produziu 98 aplicacoes, 392 ticks e 33.908 de dano no cenario de 30 minutos.
- Poison produziu 106 aplicacoes, 318 ticks e 3.852 de dano no mesmo intervalo.
- Frost Lance atingiu 46,94% de uptime de slow; Rootfall atingiu 40%.
- A party de Boss reuniu burn, poison e slow, preservando as identidades exatas dos agregados.
- QA visual passou em 1280x720 e numa superficie compacta de 375 px sem overflow horizontal.
- O console final ficou sem warnings ou erros da aplicacao; harness, servidor e logs temporarios foram removidos.
- `npm.cmd run build` passou durante a implementacao e novamente com o produto limpo.

Limitacoes mantidas:

- Condicoes sao telemetria agregada da simulacao idle; nao existem entidades persistidas por criatura nem barras individuais de debuff.
- Reaplicacoes somam tempo agregado para o relatorio e usam cap de uptime, sem uma fila persistida de refresh/stack por target.
- Ainda nao existem imunidade especifica a condicoes, cleanse, dispel, stun, freeze, bleed ou curses.
- Burn e poison nao podem causar morte separada nem rerrolam loot/rewards diretamente.
- Reload SQLite e equivalencia temporal do catch-up ficam para a etapa dedicada.

Proximo passo sugerido:

- Etapa 143.5 - QA de condicoes no Tauri/SQLite, reload, Boss party e offline catch-up.

## Etapa 143.5 - QA de condicoes no Tauri/SQLite e offline catch-up

Status: concluida como QA de persistencia, equivalencia offline e protecao de resolucao.

Persistencia e snapshots:

- O harness temporario executou dentro do app Tauri real e usou o SQLite local.
- Mira level 60, seu loadout de Meteor Sigil e o snapshot da Hunt persistiram apos save/reload.
- Lyra preservou o loadout de Thorn Bolt e Rootfall, mantendo poison e slow apos o reload.
- Alterar o loadout vivo depois do inicio nao substituiu o snapshot salvo na acao.
- O metadata canonico permaneceu no ID `primary` e a Hunt continuou associada a `hunt-sewers-thaeron`.

Hunt e condicoes:

- A Hunt real produziu 95 burns, 380 ticks e 31.445 de dano de condicao.
- O dano de burn representou 12,99% do dano direto, abaixo do cap de 25%.
- A identidade de dano permaneceu exata em 242.008 direto + 31.445 de condicao = 273.453 total.
- Poison produziu 71 aplicacoes, 213 ticks e 2.982 de dano apos reload.
- Slow produziu 117 aplicacoes e 39% de uptime sem adicionar dano.
- Skills neutras permaneceram sem condicoes e non-hits nao aplicaram efeitos.
- Caps de 3% para ataque de condicoes, 2% para risco de slow, 8% global de ataque e 10% global defensivo permaneceram ativos.
- Entradas NaN, infinitas e negativas produziram somente metricas finitas.

Boss party:

- A party real contra Boss reuniu burn, poison e slow no mesmo relatorio.
- Os agregados somaram exatamente 218 aplicacoes, 461 ticks e 12.862 de dano de condicao.
- O dano total da party permaneceu igual a dano direto + dano de condicoes.
- Todos os agregados de party permaneceram finitos e dentro dos limites existentes.

Offline catch-up:

- Uma Hunt expirada foi marcada como pronta sem conceder XP, gold ou loot automaticamente.
- A acao pronta e `lastOfflineCatchupAt` persistiram no SQLite.
- Uma segunda aplicacao do catch-up foi idempotente e nao gerou nova conclusao.
- Relatorios ativo e offline produziram o mesmo fingerprint de condicoes.
- A finalizacao ativa e offline produziu os mesmos 8.307 XP e 1.304 gold.

Bug encontrado e corrigido:

- A primeira execucao passou em 38/39 checks e revelou que `finishHunt` aceitava um personagem ja resolvido, mesmo sem `currentAction`.
- `finishHunt` agora exige status `hunting`, acao do tipo `hunting` e `targetId` correspondente a Hunt solicitada.
- A validacao fica no servico de dominio e protege contra clique duplo ou chamada duplicada fora da UI.
- Depois da correcao, uma segunda tentativa de finalizar a mesma Hunt foi rejeitada.

Execucao e restauracao:

- O harness final passou em 39/39 checks no Tauri/SQLite real.
- `npm.cmd run build` passou antes e depois da correcao.
- O SQLite original foi restaurado com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- WAL, SHM, tabela de QA, backup, logs, harness e desvio de bootstrap foram removidos.
- Nenhuma migration ou alteracao de schema foi necessaria.

Proximo passo sugerido:

- Etapa 144 - resistencias e imunidades a condicoes por criatura e Boss.

## Etapa 144 - Resistencias e imunidades a condicoes

Status: concluida.

Modelo e regras:

- Monstros, Bosses e alvos de combate aceitam resistencias individuais para `burn`, `poison` e `slow`, alem de uma lista explicita de imunidades.
- A chance efetiva usa `chance base * (1 - resistencia / 100)`, limitada entre 0% e 100%.
- Resistencias sao normalizadas entre -50% de vulnerabilidade e 80% de resistencia; imunidade sempre reduz a chance efetiva para 0%.
- O resultado de cada cast distingue `applied`, `resisted`, `immune`, `failed` e `none`.
- Um resultado resistente ocorre quando o roll passaria na chance base, mas nao passa na chance efetiva reduzida.
- Miss e dodge continuam inelegiveis para condicoes, e resistencia nao altera dano direto, defesa ou modificador elemental.
- Caps anteriores de dano de DoT, ataque por condicoes, controle e reducao de risco foram preservados.

Catalogo:

- Os 12 monstros receberam perfis coerentes com sua natureza e progressao.
- Cave Spider e Ancient Skeleton sao imunes a poison; Dragon Whelp e imune a burn.
- Sewer Rat, Cave Spider, Forest Troll, Wyvern Hatchling e Dragon Whelp possuem vulnerabilidades tematicas.
- Os 6 Bosses receberam perfis proprios; Sewer Broodmother e Crypt Warden sao imunes a poison, enquanto Ember Matriarch e imune a burn.
- Hunts e Boss parties enviam os perfis reais para a mesma engine pura de combate.

Relatorios e logs:

- O resumo por condicao mostra aplicacoes, resultados resistidos, imunidades, ticks ou uptime e chance efetiva media.
- Condicoes totalmente imunes permanecem visiveis no resumo mesmo com zero aplicacoes.
- A timeline identifica visual e textualmente aplicacao, falha normal, resistencia, imunidade, chance efetiva e vulnerabilidade/resistencia do alvo.
- Logs de Hunt e Boss incluem totais concisos de condicoes aplicadas, resistidas e imunes.
- O agregado de party pondera resistencia e chance efetiva por hits elegiveis e preserva somas exatas entre membros.

QA executado:

- A fixture temporaria passou em 26/26 checks deterministas.
- Foram validados alvo neutro, resistente, vulneravel e imune com a mesma sequencia de rolls.
- Os limites de 80% e -50%, dano direto inalterado, imunidade total, slow sem uptime, non-hits inelegiveis, perfis reais, party e determinismo foram confirmados.
- O relatorio exibiu eventos aplicados, resistidos e imunes sem erros de console.
- O layout foi validado em 1280 px e 375 px sem overflow horizontal da pagina.
- `npm.cmd run build` passou com a fixture e sera executado novamente apos sua remocao.
- A fixture, o desvio de bootstrap, o servidor e os logs temporarios foram removidos.

Persistencia e limitacoes:

- Nenhuma migration foi necessaria: os perfis pertencem aos dados estaticos de monstros e Bosses, nao ao save.
- Esta etapa nao reabriu o runtime Tauri nem manipulou o SQLite real.
- Reload, snapshot de Hunt/Boss e equivalencia do offline catch-up com resistencias ficam para a proxima QA dedicada.

Proximo passo sugerido:

- Etapa 144.5 - QA de resistencias e imunidades no Tauri/SQLite e offline catch-up.

## Etapa 144.5 - QA de resistencias e imunidades no Tauri/SQLite

Status: concluida sem regressao de produto.

Persistencia e snapshots:

- O harness temporario executou dentro do WebView Tauri e usou o plugin SQLite real em `sqlite:guild_hunt_idle.db`.
- O personagem, o loadout vivo e o snapshot de `Thorn Bolt` na acao de Hunt persistiram nos JSONs do SQLite.
- Reload restaurou status `hunting`, target da Cave Spider e loadout congelado da acao.
- O metadata canonico permaneceu no ID `primary`, com `lastSavedAt` e `lastOfflineCatchupAt` persistidos.
- As tres acoes da party contra Ember Matriarch preservaram target, membros, papeis e loadouts individuais apos save/reload.

Hunt e imunidade:

- Cave Spider permaneceu imune a poison depois do reload.
- Foram registrados 228 hits elegiveis e 228 resultados imunes, com zero aplicacoes e zero dano de poison.
- A timeline recalculada preservou eventos `immune`, e o log da Hunt informou o total imune.
- O fingerprint ativo e offline coincidiu exatamente: 87.335 de dano direto e total, sem DoT.
- A Hunt pronta foi resolvida uma unica vez e uma segunda chamada de `finishHunt` foi rejeitada.

Offline catch-up:

- A Hunt expirada foi marcada como `readyToResolve` sem conceder XP ou gold automaticamente.
- `offlineCompletedAt`, snapshot da rotacao e estado pronto persistiram depois de novo save/reload.
- A segunda aplicacao do catch-up foi idempotente, sem relatorio ou alteracao adicional.
- O relatorio de condicoes ativo e o recalculado apos catch-up produziram o mesmo fingerprint.

Boss party:

- Ember Matriarch bloqueou todos os 84 hits de burn elegiveis, sem aplicacao ou dano de burn.
- A resistencia de 40% a poison resultou em chance efetiva media de 21% e 22 resultados resistidos.
- A vulnerabilidade de -25% a slow resultou em chance efetiva media de 87,5%.
- O log de Boss informou resultados resistidos e imunes, e todos os agregados permaneceram finitos.
- Aplicacoes de condicoes da party continuaram iguais a soma exata dos relatorios individuais.

Execucao e restauracao:

- A primeira rodada marcou 35/36 porque o harness temporario foi disparado duas vezes pelo `React.StrictMode`, criando corrida entre duas escritas de QA no mesmo banco.
- O harness foi isolado do `StrictMode`; a segunda rodada passou em 36/36 checks.
- Nenhuma mudanca no codigo do produto foi necessaria.
- O banco original foi copiado antes da QA com 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- Depois da QA, o SQLite foi restaurado com o mesmo tamanho e hash; WAL, SHM, tabela de QA, backup e harness foram removidos junto com a copia fisica restaurada.
- `npm.cmd run build` passou antes da execucao e com o harness temporario.

Limitacoes:

- Esta QA automatizou o fluxo no WebView Tauri e inspecionou o SQLite diretamente; nao repetiu cliques manuais na interface completa do jogo.
- Balanceamento de longo prazo entre perfis de resistencia continua sujeito a telemetria de partidas maiores.

Proximo passo sugerido:

- Etapa 145 - penetracao e reducao de resistencias a condicoes por skills e equipamentos.

## Etapa 145 - Penetracao de resistencias a condicoes

Status: concluida.

Modelo e balanceamento:

- Penetracao de resistencia a condicoes e um atributo separado de armor penetration.
- Equipamentos contribuem com ate 30%; skills podem completar o total, limitado a 40%.
- A penetracao reduz apenas resistencia positiva e nunca leva o valor efetivo abaixo de zero.
- Vulnerabilidades negativas permanecem inalteradas, sem amplificacao pela penetracao.
- Imunidades continuam absolutas: a chance efetiva, as aplicacoes e o dano da condicao permanecem em zero.
- Dano direto, caps de DoT/slow e demais formulas de combate nao foram alterados.

Skills e equipamentos:

- Thorn Bolt: 4%; Frost Lance: 6%; Rootfall: 8%; Meteor Sigil: 12%.
- Runed Wand: 3%; Crypt Scepter: 6%; Ember Staff: 9%; Emberheart Amulet: 6%.
- Upgrade e tier da Forge escalam o atributo pelo multiplicador ja usado pelos demais bonus do item.
- Character Details, Equipment, Forge, Market, hotbar e Armory Audit reconhecem o novo atributo.

Relatorios:

- O resumo por condicao mostra resistencia original, resistencia efetiva e penetracao media.
- A timeline registra a penetracao por cast e distingue resistencia reduzida, vulnerabilidade sem uso e imunidade bloqueando a penetracao.
- Activity Log de Hunt e relatorio de Boss informam a penetracao media aplicada.

Validacao:

- Fixture temporaria do motor passou em 17/17 checks, cobrindo valores de skills/itens, atributo derivado, Forge, stack, cap, piso zero, vulnerabilidade, imunidade, dano direto, determinismo, party e logs.
- QA visual passou em 1280x900 e 375x812, sem overflow horizontal ou erros/warnings de console.
- A fixture, o desvio de bootstrap, o servidor e os logs temporarios foram removidos.
- `npm.cmd run build` passou com a fixture.

Persistencia e limitacoes:

- Nenhuma migration foi necessaria: o atributo e derivado dos equipamentos e das definicoes estaticas de skills.
- Esta etapa nao alterou o save nem manipulou o SQLite real.
- Persistencia por reload, snapshots de acoes e equivalencia no offline catch-up ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 145.5 - QA de penetracao de resistencias no Tauri/SQLite e offline catch-up.

## Etapa 145.5 - QA de penetracao de resistencias no Tauri/SQLite

Status: concluida sem regressao de produto.

Persistencia e snapshots:

- O harness temporario executou no WebView Tauri com o plugin SQLite real em `sqlite:guild_hunt_idle.db`.
- Ember Staff e Emberheart Amulet persistiram equipados em Mira e restauraram 15% de penetracao derivada apos reload.
- O snapshot de Hunt preservou exclusivamente Meteor Sigil; a acao de Boss preservou Thorn Bolt e Rootfall.
- Status, target, datas, duracao e `combatSkillLoadout` das duas acoes persistiram em `current_action_json`.
- O metadata permaneceu canonico no ID `primary`, com save version finita e `last_offline_catchup_at` persistido.

Formula apos reload:

- Meteor Sigil manteve 27% de penetracao total: 15% do equipamento e 12% da skill.
- Uma resistencia de 40% foi reduzida para 13%, elevando a chance efetiva de burn para 73,95%.
- O fingerprint completo permaneceu identico antes e depois do reload: 92.081 de dano direto, 101.649 total, 26 aplicacoes, 104 ticks e 9.568 de DoT.
- Timeline e Activity Log mantiveram resistencia original, efetiva e penetracao por cast.

Boss party:

- Ember Matriarch permaneceu absolutamente imune a burn: 34 hits imunes, zero aplicacoes e zero dano da condicao, mesmo com 27% de penetracao.
- A resistencia de 40% a poison caiu para 33% com os 7% combinados de Runed Wand e Thorn Bolt.
- A vulnerabilidade de -25% a slow permaneceu em -25%; os 11% disponiveis nao amplificaram a vulnerabilidade.
- Agregados da party coincidiram com a soma dos membros, permaneceram finitos e o log de Boss informou a penetracao media.

Offline catch-up:

- Uma Hunt e uma acao de Boss vencidas foram marcadas `readyToResolve` em uma unica aplicacao.
- `offlineCompletedAt`, `offlineElapsedMs`, targets e snapshots de loadout persistiram depois de Save/Reload.
- O catch-up nao concedeu gold, XP ou loot automaticamente.
- A segunda aplicacao foi idempotente: zero novos reports e nenhum personagem alterado.
- O fingerprint de combate permaneceu igual antes do save, depois do reload e depois do catch-up.

Execucao e restauracao:

- O harness passou em 37/37 checks dentro do Tauri/SQLite real.
- A tabela `stage_1455_qa`, o bootstrap, o harness e os processos temporarios foram removidos.
- O banco original tinha 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- Depois da QA, o SQLite foi restaurado com o mesmo tamanho e hash; backup, WAL e SHM nao permaneceram.
- Nenhuma mudanca no codigo de produto foi necessaria.

Limitacoes:

- A QA automatizou o fluxo no WebView Tauri e auditou o SQLite diretamente; nao repetiu cliques manuais na interface completa.
- Balanceamento de longo prazo da penetracao ainda depende de partidas extensas e variedade maior de equipamentos.

Proximo passo sugerido:

- Etapa 146 - limpeza e protecao temporaria contra condicoes por skills de suporte.

## Etapa 146 - Limpeza e protecao temporaria contra condicoes

Status: concluida.

Condicoes recebidas:

- `Monster`, `Boss` e `CombatSkillTarget` agora podem declarar `conditionAttacks` usando burn, poison ou slow.
- Sete criaturas e os seis Bosses atuais receberam perfis ofensivos pequenos e coerentes com seus temas.
- Tentativas recebidas usam os mesmos ataques inimigos deterministas do relatorio defensivo.
- Burn e poison geram ticks e dano residual proporcionais ao golpe; slow contabiliza duracao ativa.
- Resultados nao sao persistidos: sao recalculados a partir do snapshot da acao e dos dados estaticos.

Skills de suporte:

- As dez skills de suporte agora oferecem cleanse, protecao temporaria ou ambos.
- Guard Stance, Wind Veil e Mana Ward oferecem protecao; Trailstep, Renew e Centering Breath oferecem cleanse.
- Rallying Standard, Chrono Veil, Barkskin Circle e Guardian Mantra combinam cleanse com protecao.
- Protecao fica limitada a 35% por janela e nunca cria imunidade.
- Cada cleanse remove no maximo a quantidade configurada e corta apenas a duracao restante da condicao.
- A reducao adicional de risco derivada da defesa contra condicoes fica limitada a 3%.

Simulacao e relatorios:

- A rotacao preserva todos os eventos internos de suporte, mesmo quando a timeline visual mostra somente 24 casts amostrados.
- O relatorio informa tentativas, aplicacoes, prevencoes, cleanses, ticks, dano residual, protecao media e uptime.
- A tabela por skill atribui cleanses e segundos de ward ao suporte responsavel.
- A timeline mostra `cleanse`, percentual da ward e duracao em cada cast de suporte amostrado.
- Hunt Activity Log e Boss log incluem o resumo defensivo contra condicoes.
- Agregados de party somam aplicacoes, prevencoes, cleanses, ticks e dano, mantendo medias limitadas.

Balanceamento inicial validado:

- Contra Ember Matriarch, a fixture registrou 245 tentativas de burn e 113 aplicacoes sem suporte.
- Barkskin Circle reduziu as aplicacoes para 101, preveniu 12 e limpou 33 condicoes.
- Renew reduziu ticks de 565 para 394 e dano residual de 12.585 para 8.857 apenas com cleanse.
- Barkskin combinou prevencao e cleanse, reduzindo o dano residual para 9.491, com 25% de protecao e 40% de uptime.
- A reducao de risco defensiva permaneceu em 0,45% no caso testado, abaixo do cap de 3%.

Validacao:

- Fixture temporaria passou em 20/20 checks, cobrindo dados, suporte, prevencao, cleanse, dano, caps, rotacao longa, timeline, party, logs e determinismo.
- QA visual passou em 1280x900 e 375x812, sem overflow horizontal ou erros/warnings de console.
- A fixture, o desvio de bootstrap e o servidor temporario foram removidos.
- `npm.cmd run build` passou antes e com a fixture.

Persistencia e limitacoes:

- Nenhuma migration foi necessaria; perfis, eventos e resultados sao derivados.
- Cada relatorio individual aplica a skill de suporte ativa do proprio personagem; transferencia defensiva entre membros da party ainda nao e simulada.
- Nao ha consumivel de cleanse, dispel manual durante combate ou condicao persistente fora da simulacao.
- Save/Reload, snapshots e equivalencia do catch-up offline ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 146.5 - QA de cleanse e protecao no Tauri/SQLite e offline catch-up.

## Etapa 146.5 - QA de cleanse e protecao no Tauri/SQLite

Status: concluida.

Persistencia validada:

- Uma fixture real salvou e recarregou dois personagens em acao de Boss contra Ember Matriarch.
- Os snapshots de Barkskin Circle e Guardian Mantra permaneceram em `current_action_json`, incluindo `supportDisabled: false`.
- Datas, tipo da acao, alvo, duracao e loadouts sobreviveram ao ciclo completo de save/load.
- O fingerprint defensivo antes do save e depois do reload foi identico.
- Nenhuma migration nova foi necessaria.

Cleanse e protecao:

- O baseline sem suporte recebeu tentativas e aplicacoes de burn sem prevenir ou limpar condicoes.
- Barkskin Circle manteve 25% de protecao e 40% de uptime depois do reload.
- Guardian Mantra manteve 30% de protecao depois do reload.
- Ambos os suportes preveniram e limparam condicoes; Barkskin reduziu ticks e dano residual contra o baseline.
- A reducao defensiva de risco permaneceu positiva e abaixo do cap de 3%.
- A rotacao longa preservou 51 eventos de suporte, enquanto a timeline visual continuou limitada a 24 eventos e reteve um cast defensivo amostrado.

Boss party e logs:

- Tentativas, aplicacoes, prevencoes e cleanses da party coincidiram exatamente com a soma dos membros.
- Agregados e metricas por condicao permaneceram finitos.
- O log real de Boss incluiu `Condition defense` e o dano residual.
- A imunidade da Ember Matriarch a burn ofensivo permaneceu absoluta.

Offline catch-up:

- As duas acoes expiradas foram marcadas como `readyToResolve`, com `offlineCompletedAt` e `offlineElapsedMs` corretos.
- O catch-up preservou os snapshots de suporte e o mesmo fingerprint de combate.
- Nenhum gold, XP ou item de depot foi concedido antes da coleta manual.
- O estado pronto e `last_offline_catchup_at` sobreviveram ao reload.
- Uma segunda aplicacao nao gerou relatorios, mudancas ou duplicacao.
- A leitura direta do SQLite confirmou IDs de suporte, marcador de resolucao e timestamp offline no JSON bruto.

Execucao e restauracao:

- O harness passou em 46/46 checks dentro do WebView Tauri e do SQLite real.
- A tentativa de fechamento automatico encontrou a permissao Tauri `core:window:allow-close`; a arvore exata do processo de QA foi encerrada manualmente depois da gravacao dos resultados.
- O banco original tinha 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- Depois da QA, o banco foi restaurado com o mesmo tamanho e hash; backup, WAL e SHM foram removidos.
- A tabela, o harness e o bootstrap temporarios nao permaneceram no codigo ou no save.
- Nenhuma correcao no codigo de produto foi necessaria.

Limitacoes:

- A QA automatizou engine, persistencia e catch-up dentro do Tauri; nao repetiu cliques manuais na interface completa.
- Cada membro ainda usa apenas o proprio suporte defensivo; compartilhamento de ward e cleanse entre aliados nao faz parte da Etapa 146.

Proximo passo sugerido:

- Etapa 147 - compartilhamento de protecao e cleanse entre membros da party.

## Etapa 147 - Compartilhamento de protecao e cleanse na party

Status: concluida.

Escopo das skills:

- `CombatConditionSupportEffect` agora declara `scope` como `self` ou `party`.
- Rallying Standard, Wind Veil, Chrono Veil, Renew, Barkskin Circle e Guardian Mantra atuam na party.
- Guard Stance, Trailstep, Mana Ward e Centering Breath continuam pessoais.
- Hunts solo preservam o comportamento anterior, inclusive para skills marcadas como party.

Simulacao compartilhada:

- Boss parties agora processam ataques recebidos e eventos de suporte em uma unica linha temporal deterministica.
- Uma ward de party protege todos os membros enquanto sua janela esta ativa.
- Wards simultaneas nao somam: vale o maior percentual ativo, limitado ao cap global de 35%.
- Cada carga de cleanse e consumida uma unica vez pelo primeiro efeito nocivo elegivel em ordem cronologica.
- A ordem original dos membros nao altera o resultado final.
- Cleanse e segundos de ward sao atribuidos ao personagem e a skill que prestaram o suporte.

Relatorios e UI:

- `CombatSkillPartyEffectSummary` inclui contribuicoes defensivas por membro.
- O relatorio de party ganhou o bloco `Party Condition Support`, com cleanses e cobertura de ward por personagem.
- A tabela individual da skill do caster mostra toda a contribuicao compartilhada realizada.
- O log de Boss informa quem compartilhou cleanse e ward coverage.
- O bloco novo e responsivo e usa o visual compacto existente do client.

Balanceamento validado:

- Barkskin Circle aplicou 25% de protecao e 40% de uptime tanto no caster quanto no aliado.
- As 41 cargas efetivas de cleanse da fixture foram divididas em 26 no caster e 15 no aliado, sem duplicacao.
- Guard Stance manteve 12% apenas no caster e 0% no aliado.
- Barkskin Circle com Guardian Mantra manteve o maior valor ativo, sem somar acima de 30% no caso testado.
- A reducao de risco permaneceu abaixo do cap de 3%.

Validacao:

- Fixture temporaria passou em 14/14 checks de compartilhamento, escopo pessoal, consumo unico, atribuicao, sobreposicao, caps, determinismo e agregacao.
- QA visual passou em 1280x900 e 375x812, sem overflow horizontal, sobreposicao ou erros/warnings no console.
- O bootstrap, a fixture e o servidor temporarios foram removidos.
- `npm.cmd run build` passou com a fixture e depois da remocao.

Persistencia e limitacoes:

- Nenhuma migration foi necessaria; `scope` pertence aos dados estaticos das skills e o resultado continua derivado do snapshot salvo.
- O compartilhamento defensivo ocorre em Boss party; hunts ainda sao individuais.
- Nao ha escolha manual do alvo do cleanse, prioridade configuravel, dispel de Boss ou consumivel de limpeza.
- Save/Reload e equivalencia do catch-up compartilhado ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 147.5 - QA do suporte defensivo compartilhado no Tauri/SQLite e offline catch-up.

## Etapa 147.5 - QA do suporte defensivo compartilhado no Tauri/SQLite

Status: concluida.

Persistencia validada:

- Tres personagens foram salvos em acoes expiradas contra Ember Matriarch com Barkskin Circle, Guardian Mantra e Guard Stance.
- Tipo da acao, datas, alvo, duracao, IDs das skills e `supportDisabled: false` sobreviveram ao reload.
- O fingerprint completo da party permaneceu identico antes do save, depois do reload e depois do catch-up.
- A leitura direta de `current_action_json` confirmou os tres snapshots, `readyToResolve` e `offlineCompletedAt`.
- Nenhuma migration nova foi necessaria.

Compartilhamento e escopo:

- Todos os membros receberam as wards compartilhadas salvas.
- Barkskin Circle e Guardian Mantra mantiveram contribuicoes de cobertura depois do reload.
- Wards sobrepostas permaneceram limitadas ao maior valor ativo, abaixo de 30% na fixture.
- O total de cleanses da party coincidiu com a soma dos membros e com a soma atribuida aos casters, sem duplicacao de cargas.
- As entradas das skills dos casters receberam exatamente a contribuicao compartilhada correspondente.
- Guard Stance permaneceu em 12% somente no proprio Guardian e 0% nos aliados quando as auras de party foram desativadas.
- Inverter a ordem dos membros produziu o mesmo fingerprint.
- Todas as metricas permaneceram finitas e a reducao de risco respeitou o cap de 3%.

Boss e offline catch-up:

- O resultado real de Boss coincidiu com o calculo direto da engine.
- O log incluiu `Shared condition support` e identificou os casters compartilhados.
- As tres acoes expiradas foram marcadas como `readyToResolve`, com timestamps e tempo offline corretos.
- Nenhum gold, XP ou item de depot foi concedido antes da coleta manual.
- Os snapshots e o fingerprint compartilhado permaneceram intactos apos salvar e recarregar o estado pronto.
- Uma segunda aplicacao do catch-up nao gerou relatorios, alteracoes ou duplicacao.
- `last_offline_catchup_at` foi persistido no registro canonico `primary`.

Execucao e restauracao:

- O harness passou em 46/46 checks dentro do WebView Tauri e do SQLite real.
- A arvore exata do Tauri, Vite, Cargo e WebView usada pela QA foi encerrada depois da leitura dos resultados.
- O banco original tinha 81.920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`.
- Depois da QA, o banco foi restaurado com o mesmo tamanho e hash; backup, WAL e SHM foram removidos.
- Tabela, fixture e bootstrap temporarios nao permaneceram no produto ou no save.
- Nenhuma correcao no codigo de produto foi necessaria.

Limitacoes:

- A QA automatizou engine, save/load e catch-up dentro do Tauri; nao repetiu cliques manuais na interface completa.
- O sistema ainda nao simula threat, aggro ou distribuicao diferenciada de ataques por role da party.

Proximo passo sugerido:

- Etapa 148 - threat, aggro e distribuicao de ataques em Boss parties.

## Etapa 148 - Threat, aggro e distribuicao de ataques em Boss parties

Status: concluida.

Orcamento de ataques:

- Cada Boss party agora recebe um unico volume deterministico de ataques durante a luta.
- O volume considera duracao e nivel do Boss e fica limitado pelos mesmos caps defensivos existentes.
- Os ataques sao alocados por maior resto, garantindo que a soma dos membros seja exatamente igual ao total do Boss.
- Block, dano recebido e tentativas de condicao usam a alocacao individual, removendo a antiga replicacao do volume completo em cada membro.
- Personagens solo continuam recebendo 100% do volume calculado.

Threat e roles:

- Tank usa peso 4, damage peso 2, healer e support peso 1,25 cada.
- O maior threat vira o alvo primario de forma deterministica; empates usam o ID do personagem.
- Cada membro recebe percentual de aggro, ataques esperados e multiplicador individual de exposicao.
- A chance individual de morte usa essa exposicao, com limites de 0,5% a 90%.
- Tanks geram `tankAggroControlPercent` e ate 4% de reducao adicional de risco de morte da party.
- Sem tank, o bonus de controle e a reducao de risco ficam em zero.
- Aggro nao aumenta diretamente a chance de sucesso nem cria imunidade para healer, damage ou support.

Integracao:

- `CombatSkillEffectOptions` aceita roles e override interno do numero de ataques.
- `CombatSkillPartyEffectSummary` inclui o resumo completo de threat.
- Boss simulation usa roles reais, chance de morte por personagem e log `Aggro report`.
- O briefing da raid mostra uma previa que reage a alteracao das roles antes do lancamento.
- Boss Scene mostra tank control durante a operacao.
- Action Analyzer usa a mesma regra de threat e exibe tank control.
- O relatorio final mostra alvo primario, role, aggro, ataques e risco de exposicao de cada membro.

Balanceamento inicial:

- Na fixture de quatro membros contra Ember Matriarch, o Boss gerou 245 ataques no total.
- Tank recebeu 115 ataques e 47,06% de aggro.
- Damage recebeu 58 ataques e 23,53% de aggro.
- Healer e support receberam 36 ataques e 14,71% de aggro cada.
- Tank control ficou em 47,06%, gerando 2,82% de reducao de risco da party.
- A composicao equivalente sem tank recebeu 0% de controle e 0% de reducao por aggro.

Validacao:

- Fixture temporaria passou em 24/24 checks de orcamento, distribuicao, roles, alvo primario, caps, risco individual, ordem, solo, block, dano, condicoes, cleanse e logs.
- QA visual passou em 1280x900 e 375x812, sem overflow horizontal, sobreposicao ou erros/warnings no console.
- A fixture continuou em 24/24 depois da integracao com briefing, Boss Scene e Action Analyzer.
- Bootstrap, fixture e servidor temporarios foram removidos.
- `npm.cmd run build` passou antes da etapa, com a fixture e depois da remocao.

Persistencia e limitacoes:

- Nenhuma migration foi necessaria; roles ja pertencem ao snapshot da party e threat e derivado.
- O Boss ainda nao troca de alvo por fases, provocacao ativa, morte do tank ou eventos temporais durante a luta.
- Nao ha taunt manual, reducao de threat, stealth ou posicionamento por linha frontal/traseira.
- Save/Reload e equivalencia do catch-up com a distribuicao de aggro ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 148.5 - QA de threat e aggro no Tauri/SQLite e offline catch-up.

## Etapa 148.5 - QA de threat e aggro no Tauri/SQLite

Status: concluida.

Validacao real:

- Harness temporario executado dentro do aplicativo Tauri contra o SQLite local real.
- A suite passou em 50/50 checks, sem falha fatal e sem correcao necessaria no codigo de produto.
- Quatro acoes de Boss foram salvas e recarregadas com status, datas, IDs, roles, snapshots completos da party e loadouts de suporte preservados.
- O fingerprint de threat permaneceu identico antes do save, depois do reload, depois do catch-up e no reload final.
- O orcamento unico permaneceu em 245 ataques, tambem usado por defense e tentativas de condicao.
- A alocacao permaneceu exata: tank 115, damage 58, healer 36 e support 36 ataques.
- O tank permaneceu alvo primario, com 47,06% de controle de aggro e 2,82% de reducao de risco.
- Block, dano recebido, condicoes e cleanses mantiveram somas consistentes e sem atribuicao duplicada.
- Risco de morte individual permaneceu finito e limitado entre 0,5% e 90%; a maior exposicao do tank ficou acima da exposicao do healer.
- `simulateBossFight` preservou o mesmo threat e gerou os logs `Aggro report` e `Tank control 47.06%`.

Offline catch-up:

- Quatro acoes expiradas foram marcadas como prontas para coleta com `offlineCompletedAt` e `offlineElapsedMs` corretos.
- Roles, snapshots e threat permaneceram iguais apos o catch-up.
- Nenhum gold, XP ou item foi concedido antes da coleta manual.
- O timestamp de catch-up foi persistido nos metadados do save.
- Uma segunda aplicacao foi idempotente: zero novos reports e estado inalterado.
- A inspecao direta do SQLite confirmou as quatro acoes, todas as roles, os marcadores `readyToResolve` e o timestamp offline.

Protecao do save:

- O save original foi copiado antes do teste e restaurado depois do encerramento do Tauri.
- Banco restaurado com 81920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`, identico ao backup.
- Backup, WAL, SHM, tabela de fixture e bootstrap temporario nao permaneceram no produto ou no save restaurado.

Limitacoes:

- A QA automatizou engine, persistencia e catch-up dentro do Tauri; nao repetiu manualmente todos os cliques da interface.
- O Boss ainda nao troca de alvo por fases, provocacao ativa, morte do tank ou eventos temporais durante a luta.

Proximo passo sugerido:

- Etapa 149 - fases de Boss e troca temporal de alvo/aggro.

## Etapa 149 - Fases de Boss e troca temporal de alvo/aggro

Status: concluida.

Modelo de fases:

- Os seis Bosses atuais receberam duas ou tres fases com nome, descricao, duracao percentual e prioridade opcional de alvo por role.
- Cada fase pode multiplicar o threat de tank, damage, healer ou support entre 1x e 4x.
- Se a role preferida nao estiver na party, a fase retorna automaticamente para a ordem normal de threat.
- Fases ausentes, invalidas, com duracao hostil ou IDs duplicados sao normalizadas sem quebrar a simulacao.
- As fases sao derivadas dos dados do Boss e nao exigem migration ou novo estado persistido.

Orcamento e aggro:

- O volume total de ataques continua unico para toda a luta.
- O maior resto distribui primeiro o orcamento entre as fases e depois os ataques de cada fase entre os membros.
- A soma por fase, por membro, por defense e por condicoes permanece exatamente igual ao volume do Boss.
- Cada fase registra intervalo de progresso, ataques, alvo primario e distribuicao de threat.
- O resumo agregado recalcula exposicao individual, alvo principal da luta, tank control e reducao de risco.
- `targetSwitchCount` registra apenas mudancas reais entre alvos primarios consecutivos.

Bosses configurados:

- Sewer Broodmother: Nest Watch e Venom Chase.
- Grunk the Camp Breaker: Camp Command e Line Breaker.
- Crypt Warden: Sealed Vigil e Soul Judgment.
- Khazgrim Gatekeeper: Hold the Gate, Break Formation e Last Stand.
- Ember Matriarch: Brood Guard, Searing Pursuit e Ashen Frenzy.
- Novice Arena Champion: Opening Bell, Challenger's Mark e Final Bout.

Integracao visual e relatorios:

- O briefing mostra a timeline projetada, intervalos, alvo de cada fase e quantidade de trocas.
- A Boss Scene destaca a fase ativa pelo progresso real e mostra fase/alvo atuais no Raid Analyzer.
- A timeline compacta fica sobre a arena sem cobrir o status; no mobile ela ocupa o topo seguro do palco.
- O relatorio de skills mostra a mesma timeline agregada.
- O Boss log registra fases, alvo, ataques por fase e total de trocas.

Balanceamento validado:

- Ember Matriarch manteve o orcamento anterior de 245 ataques.
- As fases receberam 98, 86 e 61 ataques.
- Brood Guard distribuiu 46/15/23/14 ataques entre tank/healer/damage/support.
- Searing Pursuit distribuiu 28/35/14/9 e transferiu o alvo para healer.
- Ashen Frenzy distribuiu 21/7/26/7 e transferiu o alvo para damage.
- O agregado ficou em 95/57/63/30 ataques, com 38,78% de tank control e 2,33% de reducao de risco.
- A sequencia de alvos foi tank, healer e damage, totalizando duas trocas.

Validacao:

- Fixture temporaria passou em 15/15 checks de orcamento, alocacao exata, intervalos, alvos, trocas, finitude, fallback, normalizacao hostil, simulacao e logs.
- Briefing e Boss Scene passaram em 1280x900 e 375x812 sem overflow horizontal ou sobreposicao incoerente.
- A arena mobile foi ajustada para manter a timeline longe dos personagens.
- Console do navegador ficou sem erros ou warnings durante a QA visual.
- Fixture, bootstrap e servidor temporarios foram removidos.
- `npm.cmd run build` passou durante a implementacao e depois da integracao visual.

Limitacoes:

- As trocas sao predefinidas pelos dados do Boss; ainda nao existe taunt manual, stealth ou reducao ativa de threat.
- Morte intermediaria do alvo, provocacao temporaria e mudanca reativa de fase ainda nao alteram a timeline.
- Fases ainda nao mudam resistencias, skills ou intensidade total de ataques; elas mudam a prioridade temporal de alvo.
- Save/Reload e equivalencia do catch-up ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 149.5 - QA das fases de Boss no Tauri/SQLite e offline catch-up.

## Etapa 149.5 - QA das fases de Boss no Tauri/SQLite

Status: concluida.

Execucao real:

- Harness temporario executado dentro do aplicativo Tauri contra o SQLite local real.
- A primeira rodada marcou 55/59 porque o fingerprint da fixture comparava tambem block, dano e condicoes normalizados, embora declarasse medir apenas fases.
- A assercao temporaria foi limitada ao resumo de threat; nenhum codigo de produto foi alterado por essa correcao.
- A suite completa foi repetida e passou em 59/59 checks, sem falha fatal.

Save e snapshots:

- Quatro acoes de Ember Matriarch foram salvas e recarregadas como `bossing`.
- Datas, IDs da party, roles tank/healer/damage/support, snapshots completos e loadouts de suporte persistiram no SQLite.
- As definicoes de fase permaneceram derivadas do catalogo do Boss e nao foram duplicadas em `current_action_json`.
- O calculo direto de threat e o resumo usado pelo combate produziram a mesma timeline.

Fases e orcamento:

- O orcamento unico permaneceu em 245 ataques depois do reload.
- As tres fases mantiveram intervalos 0-40%, 40-75% e 75-100%.
- Os orcamentos por fase permaneceram em 98, 86 e 61 ataques.
- Brood Guard manteve 46/15/23/14 ataques.
- Searing Pursuit manteve 28/35/14/9 ataques.
- Ashen Frenzy manteve 21/7/26/7 ataques.
- O agregado permaneceu em 95/57/63/30 ataques.
- A sequencia de alvos permaneceu tank, healer e damage, com duas trocas.
- Tank control permaneceu em 38,78% e a reducao de risco em 2,33%.
- Defense e tentativas de condicao continuaram usando exatamente os mesmos 245 ataques.

Risco, logs e dados hostis:

- Riscos individuais permaneceram finitos e limitados entre 0,5% e 90%.
- A reducao de 2,33% chegou ao calculo real de risco da party.
- `simulateBossFight` preservou a timeline e registrou fases, dois target switches e os nomes dos alvos temporais.
- Fases com ID duplicado foram deduplicadas sem inflar o orcamento.
- Duracao `NaN` foi descartada e multiplicador hostil permaneceu limitado a 4x.

Offline catch-up:

- Quatro acoes expiradas foram marcadas como prontas para coleta.
- `offlineCompletedAt` e `offlineElapsedMs` ficaram corretos.
- Roles, snapshots e fingerprint das fases permaneceram iguais depois do catch-up e do reload final.
- Nenhum gold, XP ou item foi concedido antes da coleta manual.
- O timestamp de catch-up foi persistido nos metadados.
- A segunda aplicacao foi idempotente, sem novos reports ou mudanca de estado.
- A inspecao direta do SQLite confirmou quatro acoes, todas as roles, ready markers e timestamp offline.

Protecao do save:

- O save original foi copiado antes do teste e restaurado depois do encerramento completo do Tauri.
- Banco restaurado com 81920 bytes e SHA-256 `C8624591018E680FC60126EF6262DD936A81D46BAEC1A088C3422DEEE925ABF0`, identico ao backup.
- Backup, WAL, SHM, tabela de QA e bootstrap temporario foram removidos.
- Nenhuma correcao no codigo de produto foi necessaria.

Limitacoes:

- A QA automatizou engine, save/load e catch-up dentro do Tauri; nao repetiu cliques manuais na interface completa.
- As fases ainda alteram prioridade de alvo, mas nao intensidade de ataques, resistencias ou condicoes do Boss.

Proximo passo sugerido:

- Etapa 150 - modificadores de combate por fase de Boss.

## Etapa 150 - Modificadores de combate por fase de Boss

Status: concluida.

Modelo de combate:

- Cada fase pode definir multiplicadores de ritmo de ataques, dano recebido e chance de aplicar condicoes.
- O orcamento base de ataques continua deterministico e recebe a media temporal do ritmo de cada fase.
- O total inteiro e distribuido primeiro entre as fases e depois entre os membros conforme threat e role.
- Dano, block e tentativas de condicao percorrem os segmentos reais da timeline com um unico indice global por ataque.
- Fases ausentes ou dados invalidos usam multiplicadores neutros de 1x.
- Ritmo e dano ficam limitados entre 0,75x e 1,5x; chance de condicao fica entre 0,5x e 1,5x.
- `NaN` e infinito nao propagam para combate; valores nao finitos voltam ao fallback neutro.

Conteudo e interface:

- Os seis Bosses do catalogo receberam curvas conservadoras de abertura, pressao intermediaria e fase final.
- A timeline mostra ataques base e pressionados, percentual total e os tres multiplicadores de cada fase.
- A Boss Scene mostra a pressao da fase ativa no Raid Analyzer.
- O Action Analyzer mostra a transicao do orcamento base para o total pressionado.
- Logs da luta registram ritmo, dano e condicao quando uma fase e ativada.

Validacao:

- Harness visual temporario anterior passou em 19/19 checks nos viewports 1280x900 e 375x812, sem overflow, sobreposicao ou erro de console.
- Depois do refinamento temporal, um harness de engine temporario passou em 13/13 checks e foi removido integralmente.
- Ember Matriarch manteve 245 ataques base e passou a 265 ataques pressionados, distribuidos em 88/94/83 pelas tres fases.
- As somas por fase, membro, defesa e tentativas de condicao permaneceram iguais ao orcamento unico de 265 ataques.
- O cenario pressionado aumentou o dano recebido e nao reduziu as aplicacoes de condicao em relacao ao neutro.
- Dados hostis respeitaram caps e fallback sem inflar ou duplicar ataques.
- `npm.cmd run build` passou depois da segmentacao temporal final.

Limitacoes:

- Fases ainda nao alteram resistencias ofensivas, cooldowns ou repertorio de skills do Boss.
- Nao existe fase reativa por HP real, morte de membro, taunt manual ou interrupcao.
- Esta etapa validou engine e interface web; persistencia SQLite e equivalencia do catch-up ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 150.5 - QA dos modificadores de fase no Tauri/SQLite e catch-up offline.

## Etapa 150.5 - QA dos modificadores de fase no Tauri/SQLite

Status: concluida.

Execucao real:

- Harness temporario executado dentro do aplicativo Tauri contra o SQLite local real.
- A primeira tentativa foi descartada porque `React.StrictMode` montou o runner temporario duas vezes no modo dev.
- O processo foi encerrado, o save baseline foi restaurado e a suite foi repetida com montagem unica.
- A rodada valida passou em 32/32 checks.
- O harness, bootstrap e capturas temporarias foram removidos depois da execucao.
- Nenhuma correcao no codigo de produto foi necessaria.

Save, reload e snapshots:

- Quatro membros receberam acoes expiradas da Ember Matriarch com roles tank, healer, damage e support.
- As quatro acoes voltaram do SQLite com status `bossing`, party snapshot e loadout snapshot completos.
- As definicoes de fase continuaram derivadas de `src/data/bosses.ts`; `current_action_json` nao duplicou `phases` nem `attackRateMultiplier`.
- O fingerprint de combate permaneceu identico antes e depois do primeiro reload.

Pressao temporal:

- O orcamento base permaneceu em 245 ataques.
- A pressao de 108,25% produziu 265 ataques.
- Brood Guard, Searing Pursuit e Ashen Frenzy receberam 88, 94 e 83 ataques.
- A soma das fases, a soma dos membros, defense e tentativas de condicao permaneceram exatamente em 265.
- Cada fase distribuiu seu proprio orcamento uma unica vez entre os quatro membros.
- Dano recebido ficou acima do cenario neutro e as aplicacoes de condicao nao diminuiram.
- Risco geral e riscos individuais permaneceram finitos e dentro dos caps.

Offline catch-up:

- As quatro acoes expiradas foram marcadas `readyToResolve` sem coleta automatica.
- `offlineCompletedAt` e `offlineElapsedMs` foram gravados para todos os membros.
- Quatro reports de personagem foram gerados na primeira aplicacao.
- Gold, renown, XP, inventarios e Guild Depot permaneceram sem recompensa antecipada.
- O estado pronto, timestamps e `last_offline_catchup_at` persistiram depois do save/reload.
- O fingerprint de fases, dano, condicoes e risco continuou igual depois do catch-up.
- A segunda aplicacao foi idempotente, sem novos reports ou mudanca de recompensas.

Protecao do save:

- O save atual foi copiado antes de qualquer execucao Tauri.
- A rodada descartada e a rodada valida foram seguidas por restauracao do mesmo baseline.
- Banco restaurado com 86016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`.
- WAL, SHM, tabela de QA, harness e bootstrap temporario nao permaneceram no projeto ou no save restaurado.

Limitacoes:

- A permissao Tauri atual nao inclui `core:window:allow-destroy`; a suite terminou em 32/32, mas a janela minimizada precisou ser encerrada manualmente depois da captura do resultado.
- A QA automatizou engine, save/load e catch-up dentro do Tauri; nao repetiu o fluxo completo por cliques na interface normal.
- Resistencias, cooldowns e skills exclusivas por fase continuam fora do escopo atual.

Proximo passo sugerido:

- Etapa 151 - habilidades especiais e condicoes exclusivas por fase de Boss.

## Etapa 151 - Habilidades especiais e condicoes exclusivas por fase de Boss

Status: concluida.

Modelo:

- `BossPhaseDefinition` pode carregar uma `specialAbility` com ID, nome, descricao e condicao opcional.
- A habilidade acompanha o resumo normalizado de threat e permanece derivada do catalogo do Boss.
- A condicao exclusiva entra somente nos ataques pertencentes ao segmento temporal daquela fase.
- Condicoes base do Boss continuam ativas e usam uma chave de roll diferente da habilidade de fase, mesmo quando possuem o mesmo tipo.
- Ward, cleanse, protecao, ticks, dano residual e uptime reutilizam a engine de defesa existente.
- O orcamento de ataques nao e duplicado; habilidades adicionam tentativas de condicao, nao ataques comuns.

Normalizacao e seguranca:

- Habilidade sem ID ou nome valido e descartada.
- Tipos aceitos continuam limitados a burn, poison e slow.
- Chance de aplicacao fica entre 0% e 60%.
- Duracao fica entre 0,5 e 30 segundos.
- Intervalo de tick fica entre 0,5 e 30 segundos.
- Dano por tick fica entre 0% e 8%; potencia de slow fica entre 0% e 40%.
- `NaN`, infinito e campos ausentes recebem fallback finito antes da simulacao.

Habilidades configuradas:

- Sewer Broodmother: Brood Web e Venom Lunge.
- Grunk, the Camp Breaker: War Drums e Crushing Charge.
- Crypt Warden: Grave Ward e Soul Shackles.
- Khazgrim Gatekeeper: Iron Bulwark, Sundering Rush e Molten Retort.
- Ember Matriarch: Wing Guard, Searing Brand e Ashstorm.
- Novice Arena Champion: Measured Feint, Hamstring Cut e Arena Flurry.
- As 15 fases possuem habilidade e 10 delas aplicam uma condicao exclusiva leve.

Interface e logs:

- A timeline mostra nome da habilidade e tipo da condicao em cada card de fase.
- A Boss Scene mostra a habilidade da fase ativa no Raid Analyzer.
- O relatorio final lista habilidade e condicao junto de alvo, ataques e multiplicadores da fase.
- A descricao completa da habilidade fica disponivel no tooltip da timeline.

Validacao:

- Harness temporario de engine passou em 16/16 checks e foi removido.
- IDs das 15 habilidades permaneceram unicos e as 10 condicoes foram reconhecidas.
- Ember Matriarch preservou 265 ataques e passou de 265 para 442 tentativas de condicao.
- Searing Brand adicionou burn durante Searing Pursuit e Ashstorm adicionou 83 tentativas de slow apenas no Ashen Frenzy.
- Aplicacoes subiram de 138 para 170, enquanto o dano direto permaneceu identico em 165433.
- Dados hostis respeitaram caps de chance, duracao, tick e dano; habilidade invalida foi descartada.
- Logs registraram Wing Guard, Searing Brand e Ashstorm com seus segmentos corretos.
- QA visual passou em 1280x900 e 375x812, sem overflow, sobreposicao incoerente ou logs de erro/warning.
- `npm.cmd run build` passou com o bootstrap normal restaurado.

Limitacoes:

- Habilidades sao efeitos ativos da fase; ainda nao possuem casts discretos, cooldown proprio, telegraph ou interrupcao.
- Fases ainda nao alteram resistencias ofensivas, imunidades ou repertorio completo de golpes.
- A interface agrega defesa por tipo de condicao; ainda nao separa dano por nome da habilidade.
- Save/Reload e equivalencia do catch-up ficam para a QA dedicada.

Proximo passo sugerido:

- Etapa 151.5 - QA das habilidades de fase no Tauri/SQLite e catch-up offline.

## Etapa 151.5 - QA das habilidades de fase no Tauri/SQLite

Status: concluida.

Execucao real:

- Harness temporario executado dentro do aplicativo Tauri contra o SQLite local real.
- A primeira chamada de `npm.cmd run tauri:dev` parou antes de abrir o app porque um Vite residual ocupava a porta 1420.
- O processo residual foi identificado pelo comando, encerrado e a execucao foi repetida normalmente.
- A rodada valida passou em 39/39 checks.
- O harness, bootstrap, tabela de QA e captura temporaria foram removidos depois da execucao.
- Nenhuma correcao no codigo de produto foi necessaria.

Catalogo e normalizacao:

- As 15 fases continuaram com habilidades e IDs unicos.
- As 10 condicoes exclusivas permaneceram validas.
- Wing Guard, Searing Brand e Ashstorm chegaram ao resumo normalizado da Ember Matriarch.
- Chance, duracao, intervalo de tick e dano hostis respeitaram caps de 60%, 30s, 0,5s e 8%.
- Habilidade sem ID valido foi descartada.

Combate temporal:

- O orcamento base permaneceu em 245 ataques e o pressionado em 265.
- As fases permaneceram com 88, 94 e 83 ataques.
- Sem habilidades exclusivas, a condicao base do Boss produziu 265 tentativas.
- Searing Brand adicionou 94 tentativas de burn somente em Searing Pursuit.
- Ashstorm adicionou 83 tentativas de slow somente em Ashen Frenzy.
- O total passou de 265 para 442 tentativas, sem alterar os 265 ataques diretos.
- Aplicacoes passaram de 138 para 170 e todos os totais permaneceram finitos.
- Dano direto recebido permaneceu identico com e sem as condicoes exclusivas.
- Risco geral e riscos individuais permaneceram finitos e limitados.

Save, reload e logs:

- Quatro acoes da Ember Matriarch foram salvas e recarregadas como `bossing`.
- Roles tank, healer, damage e support e os quatro loadout snapshots persistiram.
- O fingerprint de habilidades, tentativas, aplicacoes, dano de condicao, fases e risco permaneceu identico depois do reload.
- `current_action_json` nao duplicou `specialAbility` nem nomes das habilidades; os dados continuaram derivados do catalogo.
- O log final registrou Wing Guard, Searing Brand `[burn]` e Ashstorm `[slow]`.
- Gold, renown, XP, inventarios e Guild Depot nao mudaram durante save/reload.

Offline catch-up:

- As quatro acoes expiradas receberam `readyToResolve` e timestamps de conclusao.
- Quatro reports de personagem foram produzidos sem coleta automatica.
- O estado pronto, metadados e fingerprint das habilidades persistiram no SQLite.
- Nenhuma recompensa foi concedida antes da coleta manual.
- A segunda aplicacao foi idempotente, sem novos reports ou mudanca de recompensas.

Protecao do save:

- O save atual foi copiado antes da execucao Tauri.
- Banco restaurado com 86016 bytes e SHA-256 `8AD73B074435873707F5876AAA232B2F873EAADF5CFE8E3BDDE7B0F2DC26B169`.
- WAL, SHM, tabela de QA, captura, harness e bootstrap temporario nao permaneceram no save ou no projeto.

Limitacoes:

- A QA automatizou engine, save/load e catch-up dentro do Tauri; nao repetiu o fluxo inteiro por cliques na interface normal.
- Habilidades continuam como efeitos de fase, sem casts discretos, cooldown individual, telegraph ou interrupcao.
- A interface ainda agrega defesa por tipo de condicao, sem breakdown por nome da habilidade.

Proximo passo sugerido:

- Etapa 152 - casts temporais, telegraphs e cooldowns de habilidades de Boss.

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
