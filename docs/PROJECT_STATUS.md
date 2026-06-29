# Guild Hunt Idle - Project Status

Atualizado em: 2026-06-28

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
- Bosses e boss access.
- Market futuro.
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
- O `git status` estava limpo antes desta documentacao.
- Nao foi encontrado uso ativo de banco de dados.
- Nao foi encontrado schema Prisma ativo.
- Nao foi implementado sistema novo nesta etapa.

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

Status: implementada em versao inicial.

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
