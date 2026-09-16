# Reformulacao visual do client

## Entrega 1 - base compartilhada e Explorar
- Rolagem principal pertence ao documento. Removidas restricoes de altura/overflow
  no shell, main-panel e corpo das janelas de pagina, preservando modais internos.
- Navegacao lateral por aventura, personagem, recursos e guilda, com icones Lucide.
- Navegacao recolhivel em telas estreitas; cabecalho compacto e retorno ao menu
  incorporado como comando de salvar/sair, sem botao nativo solto acima do jogo.
- Central com hierarquia mais limpa; Explorar com abas iconograficas e grades
  responsivas. Ilustracoes existentes de criaturas e bosses preservadas.
- Base visual aplicada ao client inteiro; nao equivale a redesenho individual de
  todos os sistemas. Nenhuma regra de economia, combate ou save alterada.

## QA desta entrega
- Build e audit-regressions passaram.
- Pagina isolada /qa/client-layout.html usa componentes reais, dados de exemplo e
  callbacks de gameplay inertes. Nao toca no SQLite pessoal.
- Bosses rolou ate o fim (scrollY 3899, marcador final dentro do viewport).
- Hunts, Training e Quests: marcador final alcancado em 390px. Documento com
  scrollWidth 375 para viewport 390, sem overflow horizontal.
- Central inspecionada em 390px e 1440px; viewport restaurado depois do teste.
- QA Tauri/SQLite, todos os modais e paginas avancadas ainda pendentes.
- npm audit identificou dois avisos high preexistentes na cadeia de ferramentas
  (nanoid e postcss). Nao foram corrigidos automaticamente nesta mudanca visual.

## Proxima entrega visual
1. Inventario, equipamento, NPC/Bazar: densidade, comparacao, filtros e venda.
2. Bosses: separar catalogo, preparacao, codex e trofeus em abas, evitando pagina longa.
3. Personagem, skills, forja e sede: consolidar tipografia e controles antigos.
4. Combate: testar overlays, analyzer e equipamento com a nova navegacao.
5. Conectar desbloqueios de NEW_PLAYER_ROADMAP.md a todas as entradas.

Referencias consultadas: https://wiki.melvoridle.com/index.php?title=Beginners_Guide
e https://www.tibiaidle.com/?view=2, alem das imagens fornecidas pelo usuario.
Inspiracao de organizacao e linguagem visual, sem copiar assets desses jogos.
