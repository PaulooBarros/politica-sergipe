# Contas públicas de Sergipe (projeto ainda sem nome)

## Visão geral

Portal web ao cidadão, informativo e apartidário, sobre Sergipe. O **município** é o eixo central, sempre situado na realidade do estado (território de planejamento, porte, comparação com municípios parecidos). A informação vem **mastigada e direta**: números-chave em destaque, cada um com uma frase explicando o que significa.

Seções do portal:

1. **Orçamento público:** quanto cada município (e o Governo do Estado) previu gastar, quanto gastou de fato, em quais áreas e quanto por habitante.
2. **Eleições:** resultados eleitorais por município.
3. **Quiz cívico:** perguntas sobre como funciona o poder público, algumas ligadas ao município.

É um projeto de passatempo: feito aos poucos, sempre com algo funcionando ao fim de cada etapa.

## Princípios

- **Apartidário.** Nada de opinião, ranking de "bons" ou "maus" políticos, nem texto que induza voto. Só dados e explicações neutras. Ordenar municípios por um indicador é permitido; qualificar ("melhor", "pior") não.
- **Fiscalizador, não acusador.** O portal aponta o que foge do padrão ("pontos de atenção"), com critérios públicos iguais para todos os entes, explicações legítimas possíveis e onde conferir (Câmara/Assembleia, portal da transparência, TCE-SE). Nunca afirma nem insinua irregularidade sem evidência nos dados.
- **Só dados públicos e citados.** Toda tela com dado mostra a fonte e o ano/período.
- **Mastigado e direto.** Primeiro o número principal, depois a explicação em linguagem simples, depois o detalhe (tabela, gráfico). Sem jargão sem explicação; termos técnicos vão para o glossário em `/sobre`.
- **Identidade institucional, séria e sem cor partidária** (ver "Design"). Evitar vermelho, azul-royal, amarelo-ouro e verde-bandeira como cor principal ou de série.
- **Sempre funcionando.** Ao fim de cada etapa o projeto roda e mostra algo útil.

## Design

- **Direção:** institucional moderno (referências: gov.uk, Our World in Data). Fundo cinza-azulado claro, conteúdo em cartões brancos com borda fina, cabeçalho berinjela escuro.
- **Paleta** (tokens semânticos em `src/app/globals.css`):
  - `brand`: berinjela/violeta. Cabeçalho, links, botões, série principal e escala sequencial do mapa.
  - `alert`: âmbar. **Reservado** para pontos de atenção e receitas de risco (royalties, empréstimos), sempre com ícone ▲ ou texto.
  - `paper`: branco e cinzas-azulados de fundo, bordas e linhas.
  - `ink`: texto (500 secundário, 700 corpo, 900 títulos).
  - Par `brand-500`/`alert-500` validado para daltonismo (ΔE 27,7).
- **Tipografia:** Inter em tudo; títulos em negrito com tracking apertado; números com `tabular-nums`.
- **Nome:** o projeto está **sem nome** por decisão do dono. O cabeçalho mostra só a silhueta de Sergipe (`StateMark`) e "Contas públicas · Sergipe". Não inventar nome.
- **Página inicial:** o mapa é o destaque (`features/map/MapExplorer.tsx`): mapa grande colorido pelo indicador escolhido e ficha lateral que mostra os números do município ao passar o mouse, fixa ao clicar e leva ao raio-x.
- **Gráficos:** componentes SVG/HTML próprios em `src/components/charts/`, sem biblioteca. Série principal em `brand`, referências em `alert` ou cinza tracejado. Valores sempre escritos como texto também (nunca só cor).

## Stack

- Next.js 16 (App Router) com TypeScript. Esta versão tem mudanças em relação a versões antigas: ver [AGENTS.md](AGENTS.md) e `node_modules/next/dist/docs/` antes de escrever código. Em especial, `params` e `searchParams` são Promises.
- Estilização: Tailwind CSS v4.
- Mapa: `d3-geo` gerando SVG no servidor (projeção Mercator), com interação em um Client Component. Sem mapa de fundo.
- Testes: Playwright (`npm run test:e2e`). Se o download do navegador do Playwright falhar (rede corporativa), usar um navegador instalado com `PW_CHANNEL=msedge`.

## Estrutura

- `scripts/`: pré-processamento de dados (rodar uma vez; resultado vai para `data/`). Respostas brutas das APIs ficam em cache em `data/raw/` (fora do git).
- `data/`: JSON estático gerado pelos scripts, versionado. `data/sources/` guarda listas mantidas à mão, sempre com a fonte.
- `src/app/`: rotas. Cada `page.tsx` só busca dados e monta componentes.
  - `/`: panorama de Sergipe (números do estado, mapa por indicador, territórios).
  - `/municipios`: lista com filtros (ano, território, porte, área, busca) e ordenação, via parâmetros de URL.
  - `/municipios/[slug]`: página do município (`?ano=`, `?area=`).
  - `/estado`: orçamento do Governo do Estado.
  - `/sobre`: fontes, metodologia e glossário.
  - `/eleicoes`, `/quiz`: seções futuras.
- `src/features/<funcionalidade>/`: dados, cálculos e componentes de uma funcionalidade (`budget/`, `insights/`, `municipalities/`, `map/`; depois `elections/`, `quiz/`).
  - `features/insights/rules.ts`: regras dos pontos de atenção. Limites ficam em `RULES` e são exibidos em `/sobre#criterios`; ao mudar um limite, conferir quantos municípios são acionados (hoje ~21 de 75 em 2025).
- Comparações usam **mediana** (não média): de Sergipe, do território e do mesmo porte.
- Páginas de município e do Estado são "raio-x" em capítulos numerados: Resumo, Pontos de atenção, De onde vem o dinheiro, Para onde vai, Comparação, Evolução.
- `src/components/ui/`: peças de interface compartilhadas (cartões, seções, nota de fonte, filtros).
- `src/components/charts/`: gráficos SVG/HTML próprios.
- `src/components/layout/`: cabeçalho, navegação e rodapé.
- `src/lib/`: utilitários compartilhados (formatação pt-BR, slugs).
- `tests/`: testes Playwright.

## Comandos

- `npm run dev`: servidor de desenvolvimento em http://localhost:3000
- `npm run data:map`: baixa de novo a malha e os nomes dos municípios do IBGE
- `npm run data:budget`: baixa de novo o orçamento (SICONFI, 2021 a 2025, 75 municípios + Governo do Estado; usa cache em `data/raw/`, então só a primeira execução é lenta)
- `npm run test:e2e`: build de produção e testes Playwright

## Como trabalhar neste projeto

- Fazer **uma etapa por vez**, na ordem abaixo. Não adiantar etapas.
- Antes de começar uma etapa, resumir em poucas linhas o que será feito e esperar confirmação.
- Ao terminar, dizer como rodar e o que foi entregue, e atualizar a seção "Andamento" deste arquivo.
- Preferir soluções simples. Se houver duas opções razoáveis, explicar em uma frase cada e recomendar uma.
- Comunicação em português do Brasil. Nomes de código, variáveis e commits em inglês.
- Pré-processar os dados: baixar e transformar arquivos grandes **uma vez** (script no repositório) e guardar o resultado em JSON estático, em vez de consultar fontes externas a cada acesso.
- Não inventar dados. Se uma fonte não for encontrada ou estiver inconsistente, avisar e propor alternativa. Dado ausente aparece como "não declarado", nunca como zero.

## Fontes de dados

- **Malha dos municípios (mapa):** ✅ API de malhas geográficas do IBGE (malha 2022) e API de localidades.
- **Orçamento (municípios e Estado):** ✅ SICONFI (Tesouro Nacional), API `apidatalake.tesouro.gov.br/ords/siconfi/tt/`.
  - `rreo`, Anexo 02, 6º bimestre: **orçamento previsto** (dotação inicial), **orçamento atualizado** (dotação atualizada), empenhado e liquidado, por função.
  - `dca`, Anexo I-E: **valor pago** por função e população do exercício.
  - `dca`, Anexo I-C: **receita** por origem (impostos próprios, FPM/FPE, cota de ICMS/IPVA, royalties, Fundeb, SUS, empréstimos, outras), líquida de deduções (Fundeb e, no Estado, a cota municipal). Total = linha `ReceitasExcetoIntraOrcamentarias`.
  - Sempre sem despesas intraorçamentárias. No RREO, as linhas de função são as de `cod_conta = RREO2TotalDespesas` cujo nome bate com a classificação funcional (Portaria MOG 42/1999).
  - Atenção: a população da base muda de critério entre anos (ex.: Aracaju 672 mil em 2023 e 605 mil em 2024, após o Censo), o que afeta a comparação por habitante entre anos.
- **Territórios de planejamento:** 8 territórios definidos pelo Decreto estadual nº 24.338/2007. Lista de municípios em `data/sources/territorios.json`, transcrita da reportagem "Sergipe: saiba mais sobre os oito territórios do Estado" (A8 Sergipe, republicando o Governo de Sergipe). **Confirmar com documento oficial** (Seplag/Observatório de Sergipe) quando possível; a página do governo não abriu na VPN.
- **Porte populacional:** faixas calculadas com a população do SICONFI do ano exibido.
- **Eleições:** portal de dados abertos do TSE (resultados por município e cargo). Bloqueado na VPN corporativa.
- **Quiz:** conteúdo próprio, baseado em constituições, regimentos e sites oficiais (Assembleia Legislativa, TSE, TCE-SE), sempre com a fonte da resposta.

## Etapas

### Etapa 1: Base e mapa ✅
- Projeto Next.js, estilização, mapa com os 75 municípios clicáveis.

### Etapa 2: Eleições
- Script que baixa e processa os resultados do TSE para JSON estático.
- Rota `/eleicoes` com seletor de ano e cargo (começar por governador e presidente, 2022) e mapa colorido pelo mais votado, com legenda neutra.
- Seção de eleições na página do município (candidatos, votos, percentual).
- **Pronto quando:** dá para trocar cargo/ano e ver o resultado de qualquer município.

### Etapa 3: Portal do orçamento
Entregas, cada uma funcionando ao fim:
1. **Esqueleto do portal:** layout com cabeçalho, navegação e rodapé; rotas; componentes de interface; identidade visual.
2. **Dados ampliados e página do município:** previsto × pago, % executado, gasto por habitante, gasto por área, comparação com média de SE, do território e do porte, evolução 2021–2025.
3. **Panorama do estado e lista de municípios com filtros.**
4. **Página do Governo do Estado e página "Sobre" com glossário.**
- **Pronto quando:** um cidadão consegue achar seu município, entender em poucos segundos quanto foi previsto e gasto, em quê, e como isso se compara ao resto de Sergipe.

### Etapa 4: Quiz cívico
- Banco de questões em arquivo (tema, nível, enunciado, alternativas, resposta, explicação, fonte).
- Rota `/quiz` com pontuação e **modo de revisão dos erros**.
- Algumas perguntas ligadas ao município, usando os dados das etapas 2 e 3.
- **Pronto quando:** dá para fazer uma rodada completa e revisar o que errou.

### Etapa 5 (opcional): Extras
- Repetição espaçada simples para as questões erradas.
- Geração de novas questões com IA a partir de textos oficiais, com revisão humana antes de entrar no banco.
- Explicador de "politiquês": colar um trecho de projeto de lei e receber um resumo em linguagem simples.
- Deploy e domínio.

## Decisões em aberto

- Se o quiz terá login e histórico ou fica só local no navegador.

## Andamento

- [x] Etapa 1: Base e mapa (malha IBGE 2022, 75 municípios clicáveis, 3 testes Playwright)
- [ ] Etapa 2: Eleições. **Pendente:** os sites do TSE (CDN, dados abertos e API de resultados) retornam 403 na VPN corporativa. Retomar fora da VPN, baixando `votacao_candidato_munzona_2022.zip` para `data/raw/`. Plano já definido: ligar código TSE ao IBGE pelo nome normalizado (falhar se algum dos 75 não casar); percentual sobre votos nominais.
- [ ] Etapa 3: Portal do orçamento. Feito: rotas do portal, receita por origem, pontos de atenção, raio-x do município e do Estado, lista com filtros, panorama com destaques, glossário e critérios. **Pendente:** reescrever os testes Playwright para a nova estrutura (os de `tests/` estão desatualizados) e revisão visual com o dono do projeto.
- [ ] Etapa 4: Quiz cívico
- [ ] Etapa 5: Extras
