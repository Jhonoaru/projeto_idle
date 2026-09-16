# Nova experiencia de entrada

Ao receber "continue", retomar a primeira etapa pendente abaixo. Nao iniciar outro
roadmap sem concluir ou revisar explicitamente este. Jogo offline, single-player,
progressao aberta: objetivos de introducao nao sao uma campanha com final.

## 1. Entrada e fundacao (implementada, QA Tauri pendente)
- Menu principal padrao, Continuar apenas com save existente.
- Nova guilda: nome, nome do fundador, cinco vocacoes, nivel 1, 150 gold.
- Apenas um personagem, deposito vazio, cosmeticos iniciais basicos.
- Persistencia nao reintroduz roster de demonstracao em guildas novas.
- Confirmacao pelo nome da guilda antes de substituir o unico slot atual.
- Arte original local animada por CSS, musica ambiente sintetizada original,
  volume e pausa. Nao e GIF; exportacao de loop audiovisual ainda pendente.
- Em browser sem SQLite, jogo bloqueado com erro explicito, sem falso save.
- Validacao: build e audit-regressions aprovados; cinco fundadores testados em engine.
  Preview /qa/main-menu.html confirmou criacao por formulario sem persistencia.
  Arte inspecionada por screenshot e alternancia do controle de audio verificada.
  Qualidade sonora nao avaliada por escuta; salvar/reabrir no Tauri ainda pendente.

## 2. Primeiros passos e desbloqueios (PROXIMA)
- Modelo persistente e versionado de onboarding, com migracao que nao bloqueie saves antigos.
- Mostrar apenas essencial em TODAS as entradas (Central, Topbar, menus laterais,
  atalhos, Explorar); validar acessos tambem nos handlers.
- Primeira hunt segura, coletar resultado, inventario, vender excedente ao NPC,
  comprar supplies, equipar melhoria. Objetivos verificam eventos reais, nao cliques.
- Revelar recrutamento e sede depois de consolidar o ciclo inicial.
- Mostrar requisitos dos sistemas seguintes; nao esconder progresso conquistado.

## 3. Onde farmar e onde investir
- Metas ligadas a drops reais e respectivas hunts; acompanhar materiais faltantes.
- Comparacao de ganho/custo/risco, destino de gold e upgrades da guilda.
- Prioridades sugeridas sem automatizar gastos nem impor fim ao jogo.

## 4. Progressao intermediaria
- Revelar bosses, grupos, forja, tiers e imbuements em ordem coerente.
- Balancear os cinco fundadores, economia inicial e custos de recrutamento.
- Evitar bloqueios por supplies, capacidade, morte ou falta de gold.

## 5. Audiovisual e QA completo
- Loop de fundo (GIF/video local), movimento ambiental e retratos de selecao.
- Preferencias de som persistentes, trilha de maior duracao e transicoes.
- QA Tauri em banco isolado: novo jogo, reload, continuar, substituir, erro de save,
  progresso offline, cinco vocacoes, teclado e resolucoes pequenas.
- Revisar backup/slots antes de ampliar o gerenciamento de saves.

Referencias de fluxo (nao assets):
- https://battlebrothersgame.com/dev-blog-40-progress-update-campaign-customization-retreating-and-desertion-men-at-arms-zombie-overhaul/
- https://www.grimdawn.com/guide/character/character-basics/
