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

Rodada de persistencia/offline (2026-09-13): gravacao agora usa uma transacao SQLx na mesma conexao do pool do SQL Plugin, com rollback. A fila copia o estado solicitado e serializa loads junto com saves. Teste Rust de rollback e recuperacao aprovado; fixture Tauri ampliada para 19 checks, incluindo falha forcada depois dos deletes, recuperacao e snapshot imutavel. Save principal permaneceu intacto.

Testes Node adicionais aprovados: horario legado atravessando meia-noite, rejeicao de horarios malformados, 72h offline com Hunt/treino/quest/boss, repeticao do catch-up sem duplicar relatorios nem conceder recompensas. Isso nao substitui encerrar o processo durante escrita nem uma sessao manual longa.

- [ ] Saves antigos: migracao e recuperacao com backups representativos, inclusive datas HH:mm, inventario parcial e JSON invalido. Nenhum save pessoal foi migrado nesta revisao.
- [ ] Persistencia sob falha: rollback e fila verificados; falta encerramento forcado durante escrita e recuperacao apos queda do processo.
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

`cargo test --manifest-path src-tauri/Cargo.toml --lib`

`npm run build`

`npm run tauri:dev -- --config qa/tauri.charm-hunt.json`

O ultimo comando abre somente a fixture com banco stage1785_20260908.db. Os botoes da fixture nao equivalem a uma rodada manual completa do jogo.
