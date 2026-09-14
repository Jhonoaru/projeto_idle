# Revisao de manutencao antes da Etapa 179

Data: 2026-09-13. Esta e uma auditoria direcionada, nao uma certificacao de todos os sistemas.

## Corrigido e verificado

- [x] Datas de novas Hunts e treinos: ISO com segundos; duracao exata e conclusao apos mudar o dia.
- [x] Coleta antecipada: handlers de Hunt, treino, quest e boss validam o prazo; controles centrais acompanham o relogio. SSR testa bloqueio de Hunt/treino e coleta quando pronta.
- [x] Bonus de loot real: diferenca paga em gold, usando apenas itens aceitos. Venda no NPC nao repete o bonus. Teste compara saldo final com e sem Scavenger.
- [x] Capacidade cheia: itens rejeitados nao produzem bonus de gold.
- [x] Rotulos: Fortify reduz death risk; Conservation reduz supplies.
- [x] Remocao dos formatadores de hora legados em Hunt/treino e import nao utilizado.
- [x] Reexecucao do runner Tauri/SQLite de Charms: 16 verificacoes, lidas por consulta SQL estruturada no banco isolado.

## Ainda verificar antes de fechar a versao

Rodada imbuements/treasury/sede (2026-09-14): reproduzida aplicacao em item ausente. Validacao e aplicacao agora consultam item atual; slot deve corresponder ao item, gold nao finito bloqueado e selecao antiga nao permite reaplicar imbuement ja ativo. Testes aprovados para cobranca unica e inputs imutaveis. Treasury: deposito/saque conservam gold, repeticao com mesmo ID e valores invalidos bloqueados. Quatro facilities: primeiro upgrade consome materiais exatos, locks e falta de gold bloqueiam sem custo. Build e regressoes Node aprovados. Nao houve QA por cliques nem acesso ao save pessoal. Substituicao entre potencias de imbuement, limites/overflow da treasury e niveis superiores da sede ainda precisam cobertura dedicada.

Rodada 2026-09-14 (forge/Bazaar): upgrade e tier verificam posse e consultam o item atual antes de cobrar; gold nao finito bloqueado. Testes reproduziram item inexistente aceito antes da correcao; cobrem selecao antiga, custo do segundo nivel e inputs imutaveis. Bazaar: compra repetida, oferta expirada, gold/capacity insuficientes e historico sem consumo na falha verificados em engine. Ainda pendentes imbuements, treasury/upgrades da guilda e QA interativo; esta rodada nao certifica a economia completa.

Rodada NPC/retorno: compra de multiplos nao-empilhaveis criava uma unica identidade. Corrigida para entradas individuais nos tres destinos, limite de 999 unidades nao-empilhaveis por compra (protege alocacao). Testes verificam potions empilhadas, preco adulterado, quantidade invalida, capacity insuficiente sem cobranca, locks e revenda repetida sem novo pagamento. Novos retornos a cidade usam ISO completo com 10 segundos; testes cobrem cancelamento dos quatro tipos de acao, chegada antecipada/repetida e preservacao de recursos. Nenhum save pessoal aberto; ainda nao houve QA interativo destes fluxos nem migracao de pilhas nao-empilhaveis antigas.

Rodada de persistencia/offline (2026-09-13): gravacao agora usa uma transacao SQLx na mesma conexao do pool do SQL Plugin, com rollback. A fila copia o estado solicitado e serializa loads junto com saves. Teste Rust de rollback e recuperacao aprovado; fixture Tauri ampliada para 19 checks, incluindo falha forcada depois dos deletes, recuperacao e snapshot imutavel. Save principal permaneceu intacto.

Testes Node adicionais aprovados: horario legado atravessando meia-noite, rejeicao de horarios malformados, 72h offline com Hunt/treino/quest/boss, repeticao do catch-up sem duplicar relatorios nem conceder recompensas. Isso nao substitui encerrar o processo durante escrita nem uma sessao manual longa.

- [x] Mapper com fixtures sinteticas legadas: JSON malformado, null, primitivos e objeto no lugar de lista recebem fallback; skills/inventario ausentes, item fora do catalogo e HH:mm verificados. Listas validas e gold preservados. Isso nao valida todos os campos internos de cada objeto.
- [x] SQLite isolado sob queda real: processo Node encerrado apos DELETE/INSERT sem commit; reabertura preserva estado anterior, integrity_check OK e nova gravacao persiste. Banco temporario removido ao terminar.
- [ ] Saves antigos: migracao e recuperacao com backups representativos ainda pendentes. Fixtures sinteticas testam o mapper, nao a cadeia completa de migrations. Nenhum save pessoal foi migrado nesta revisao.
- [ ] Persistencia sob falha: rollback, fila e queda do SQLite isolado verificados; falta encerramento forcado do cliente Tauri completo durante escrita.
- [ ] Sessao offline longa: virada de dia, 24h+, multiplos personagens e reconexao ao cliente; nenhuma recompensa duplicada.
- [ ] Fluxos interativos: clicar coleta/cancelamento/retorno a cidade em Hunt, treino, quest e boss; spam de clique e troca de personagem durante a acao.
- [ ] Economia completa: NPC, Bazaar, forge, supplies, death penalty, treasury, upgrades e combinacoes de loot bonus de Destiny/Focus/Charms.
- [ ] Progressao: recrutamento, equipamentos, acesso a hunts antigas, custo de bosses e ritmo de XP/gold sem atalhos de simulacao.
- [ ] Visual no cliente: 960x640, 1280x800 e 1920x1080; janelas centrais, scroll, tooltips, itens com nomes longos e escala de texto.
- [ ] Conteudo antigo: rastrear componentes sem uso, rotas obsoletas, mocks e placeholders. Preservar fixtures de QA e compatibilidade de saves ate comprovar que podem ser removidos.
- [ ] Offline integral: revisar cada tela de Market/Store/Ranking e garantir linguagem coerente com NPC, Bazaar local e cosmeticos.
- [ ] Desempenho: bundle JS acima de 500 kB, CSS acumulado, renders por segundo na arena e carregamento de sprites.

## Comandos de reproducao

`node qa/audit-regressions.mjs`

`node qa/sqlite-crash-recovery.mjs`

`cargo test --manifest-path src-tauri/Cargo.toml --lib`

`npm run build`

`npm run tauri:dev -- --config qa/tauri.charm-hunt.json`

O ultimo comando abre somente a fixture com banco stage1785_20260908.db. Os botoes da fixture nao equivalem a uma rodada manual completa do jogo.
