// Dados extraidos de BFWC2026_Operacao_Custos_1_1.xlsx (fiel a planilha)
export const SHEETS = [
  {
    "name": "RESUMO",
    "cols": 6,
    "rows": [
      [
        "🏈  BFWC 2026 — PAINEL EXECUTIVO DE OPERAÇÃO E CUSTOS"
      ],
      [
        "Leme, SP · Flag Football · 4 Categorias · 3 Dias de Torneio"
      ],
      [],
      [
        56,
        112,
        6,
        36,
        27,
        0
      ],
      [
        "Times inscritos",
        "Total de jogos",
        "Campos necessários",
        "Jogos transmitidos",
        "Pool de árbitros",
        "Custo Total Estimado (R$)"
      ],
      [],
      [
        "▌ CATEGORIAS E JOGOS"
      ],
      [
        "Categoria",
        "Times",
        "Grupos",
        "Jogos Grupos",
        "Jogos Playoffs",
        "TOTAL"
      ],
      [
        "⚡ Masculino",
        16,
        4,
        24,
        8,
        32
      ],
      [
        "🌸 Feminino",
        16,
        4,
        24,
        8,
        32
      ],
      [
        "🌟 Sub-15",
        12,
        3,
        18,
        6,
        24
      ],
      [
        "🌱 Sub-12",
        12,
        3,
        18,
        6,
        24
      ],
      [
        "TOTAL",
        56,
        null,
        84,
        28,
        112
      ],
      [],
      [
        "▌ RESUMO DE CUSTOS — 13 CATEGORIAS + CONTINGÊNCIA"
      ],
      [
        "Categoria",
        "Custo (R$)",
        "Composição"
      ],
      [
        "1. Arbitragem — Cachê",
        27840,
        "348 designações × R$80"
      ],
      [
        "2. Infraestrutura Básica",
        5000,
        "Campo + Gelo + Água"
      ],
      [
        "3. Árbitros — Estadia",
        19170,
        "Hosp + Alim + Transp × 27"
      ],
      [
        "4. Staff Principal",
        9100,
        "Hosp + Alim + Transp × 10"
      ],
      [
        "5. Material e Operações",
        0,
        "Pilons, marcadores, pranchetas, uniformes..."
      ],
      [
        "6. Staff Operacional",
        0,
        "Sistema, mkt, segurança, Leo, camisas..."
      ],
      [
        "7. Tecnologia e Sistemas",
        0,
        "Telão, internet, lojas, editor, gravação..."
      ],
      [
        "8. Infraestrutura e Logística",
        0,
        "Ambulâncias, gradis, montagem, gerador..."
      ],
      [
        "9. Comunicação Visual",
        0,
        "Banners, backdrop, fotos, mídia..."
      ],
      [
        "10. Premiação e Entretenimento",
        0,
        "Medalhas, cerimônias, show, pirotecnia..."
      ],
      [
        "11. Saúde e Segurança",
        0,
        "Posto médico, fisio, seguro, alvará..."
      ],
      [
        "12. Transmissão ao Vivo",
        36000,
        "36 jogos × R$1.000"
      ],
      [
        "13. Outros Custos",
        0,
        "Itens adicionais"
      ],
      [
        "⚠ Reserva de Contingência (10%)",
        0
      ],
      [
        "TOTAL GERAL",
        97110
      ],
      [],
      [
        "💙 Azul/amarelo = editáveis  ·  ⚫ Preto = calculado  ·  🟢 Verde = ref. outra aba  ·  Preencha valores na aba CUSTOS"
      ]
    ]
  },
  {
    "name": "TRANSMISSÃO",
    "cols": 5,
    "rows": [
      [
        "BFWC 2026 — TRANSMISSÃO AO VIVO"
      ],
      [
        "▌ PREMISSA"
      ],
      [
        "Custo por jogo transmitido",
        1000,
        "R$/jogo"
      ],
      [],
      [
        "▌ JOGOS A TRANSMITIR"
      ],
      [
        "Fase",
        "Nº Jogos",
        "Custo/Jogo (R$)",
        "Total (R$)",
        "Detalhes"
      ],
      [
        "Fase de grupos (selecionados)",
        12,
        1000,
        12000,
        "12 jogos selecionados"
      ],
      [
        "Quartas de final / Fase 1",
        12,
        1000,
        12000,
        "Todas as categorias"
      ],
      [
        "Semifinais",
        8,
        1000,
        8000,
        "Todas as categorias"
      ],
      [
        "Finais",
        4,
        1000,
        4000,
        "Todas as categorias"
      ],
      [
        "TOTAL TRANSMISSÃO",
        36,
        null,
        36000
      ],
      [],
      [
        "💙 Azul/amarelo = editáveis  ·  ⚫ Preto = calculado  ·  🟢 Verde = ref. de outra aba"
      ]
    ]
  },
  {
    "name": "TORNEIO",
    "cols": 12,
    "rows": [
      [
        "BFWC 2026 — ESTRUTURA DO TORNEIO"
      ],
      [
        "▌ PREMISSAS"
      ],
      [
        "Times Masculino",
        16,
        "times"
      ],
      [
        "Times Feminino",
        16,
        "times"
      ],
      [
        "Times Sub-15",
        12,
        "times"
      ],
      [
        "Times Sub-12",
        12,
        "times"
      ],
      [
        "Times por grupo",
        4,
        "times"
      ],
      [],
      [
        "▌ JOGOS POR CATEGORIA"
      ],
      [
        "Categoria",
        "Times",
        "Grupos",
        "Jogos/\nGrupo",
        "Total\nGrupos",
        "Times\nPlayoff",
        "QF/R1",
        "Semis",
        "3º\nLugar",
        "Final",
        "Total\nPlayoffs",
        "TOTAL\nJOGOS"
      ],
      [
        "⚡ Masculino",
        16,
        4,
        6,
        24,
        8,
        4,
        2,
        1,
        1,
        8,
        32
      ],
      [
        "🌸 Feminino",
        16,
        4,
        6,
        24,
        8,
        4,
        2,
        1,
        1,
        8,
        32
      ],
      [
        "🌟 Sub-15",
        12,
        3,
        6,
        18,
        6,
        2,
        2,
        1,
        1,
        6,
        24
      ],
      [
        "🌱 Sub-12",
        12,
        3,
        6,
        18,
        6,
        2,
        2,
        1,
        1,
        6,
        24
      ],
      [
        "TOTAL",
        56,
        null,
        null,
        84,
        null,
        12,
        8,
        4,
        4,
        28,
        112
      ],
      [],
      [
        "💙 Azul/amarelo = editáveis  ·  ⚫ Preto = calculado"
      ]
    ]
  },
  {
    "name": "CAMPOS",
    "cols": 4,
    "rows": [
      [
        "BFWC 2026 — OPERAÇÃO DE CAMPOS"
      ],
      [
        "▌ PREMISSAS DE TEMPO"
      ],
      [
        "Duração de cada tempo (min)",
        20,
        "min"
      ],
      [
        "Número de tempos por jogo",
        2,
        "tempos"
      ],
      [
        "Intervalo do jogo — halftime (min)",
        2,
        "min"
      ],
      [
        "Intervalo entre jogos (min)",
        20,
        "min"
      ],
      [],
      [
        "▌ CONFIGURAÇÃO DOS DIAS"
      ],
      [
        "Início dos dias longos (hora)",
        8,
        "h"
      ],
      [
        "Fim dos dias longos (hora)",
        17,
        "h"
      ],
      [
        "Início do dia curto (hora)",
        8,
        "h"
      ],
      [
        "Fim do dia curto (hora)",
        12,
        "h"
      ],
      [
        "Número de dias longos",
        2,
        "dias"
      ],
      [
        "Número de dias curtos",
        1,
        "dias"
      ],
      [],
      [
        "▌ CAPACIDADE POR CAMPO"
      ],
      [
        "Duração total do jogo (min)",
        42,
        "min"
      ],
      [
        "Slot total (min)",
        62,
        "min"
      ],
      [
        "Disponível/dia longo (min)",
        540,
        "min"
      ],
      [
        "Disponível/dia curto (min)",
        240,
        "min"
      ],
      [
        "Jogos/campo — dia longo",
        9,
        "jogos"
      ],
      [
        "Jogos/campo — dia curto",
        4,
        "jogos"
      ],
      [
        "Capacidade/campo torneio",
        22,
        "jogos"
      ],
      [],
      [
        "▌ DIMENSIONAMENTO"
      ],
      [
        "Total de jogos",
        112,
        "jogos"
      ],
      [
        "⭐ Campos necessários",
        6,
        "campos",
        "← RESULTADO"
      ],
      [
        "Total de slots",
        132,
        "slots"
      ],
      [
        "Buffer",
        20,
        "slots"
      ]
    ]
  },
  {
    "name": "ÁRBITROS",
    "cols": 5,
    "rows": [
      [
        "BFWC 2026 — PLANEJAMENTO DE ARBITRAGEM"
      ],
      [
        "▌ PREMISSAS"
      ],
      [
        "Árbitros por jogo regular",
        3,
        "árbs/campo"
      ],
      [
        "Árbitros por jogo — Semis e Finais",
        4,
        "árbs/campo"
      ],
      [
        "Fator de escala",
        1.5,
        "fator x1.5"
      ],
      [],
      [
        "▌ DESIGNAÇÕES POR TIPO DE JOGO"
      ],
      [
        "Tipo de Jogo",
        "Nº Jogos",
        "Árbs/Jogo",
        "Designações",
        "% Total"
      ],
      [
        "Fase de grupos",
        84,
        3,
        252,
        0.7241379310344828
      ],
      [
        "Quartas / Fase 1",
        12,
        3,
        36,
        0.10344827586206896
      ],
      [
        "Semifinais",
        8,
        4,
        32,
        0.09195402298850575
      ],
      [
        "Disputa de 3º lugar",
        4,
        3,
        12,
        0.034482758620689655
      ],
      [
        "Finais",
        4,
        4,
        16,
        0.04597701149425287
      ],
      [
        "TOTAL",
        112,
        null,
        348,
        1
      ],
      [],
      [
        "▌ POOL DE ÁRBITROS"
      ],
      [
        "Campos simultâneos",
        6
      ],
      [
        "Pico árbitros ativos",
        18
      ],
      [
        "Pool necessário",
        27
      ]
    ]
  },
  {
    "name": "CUSTOS",
    "cols": 5,
    "rows": [
      [
        "BFWC 2026 — PLANILHA DE CUSTOS COMPLETA"
      ],
      [
        "▌ PREMISSAS — valores editáveis (azul/amarelo)"
      ],
      [
        "Cachê por árbitro por jogo",
        80,
        "R$/árbitro/jogo"
      ],
      [
        "Aluguel dos campos (total)",
        5000,
        "R$ total"
      ],
      [
        "Hospedagem — por árbitro",
        300,
        "R$/árbitro"
      ],
      [
        "Alimentação — por árbitro",
        210,
        "R$/árbitro"
      ],
      [
        "Transporte — por árbitro",
        200,
        "R$/árbitro"
      ],
      [
        "Nº de pessoas no staff",
        10,
        "pessoas"
      ],
      [
        "Hospedagem — por pessoa do staff",
        300,
        "R$/pessoa"
      ],
      [
        "Alimentação — por pessoa do staff",
        210,
        "R$/pessoa"
      ],
      [
        "Transporte — por pessoa do staff",
        400,
        "R$/pessoa"
      ],
      [
        "Pacotes de gelo por time",
        6,
        "pct/time"
      ],
      [
        "Preço por pacote de gelo",
        20,
        "R$/pacote"
      ],
      [],
      [
        "1. ARBITRAGEM — CACHÊ"
      ],
      [
        "Tipo de Jogo",
        "Designações",
        "Cachê (R$/desig.)",
        "Total (R$)",
        "Detalhe"
      ],
      [
        "Fase de grupos",
        252,
        80,
        20160,
        "84 jogos × 3 árbs"
      ],
      [
        "Quartas / Fase 1",
        36,
        80,
        2880,
        "12 jogos × 3 árbs"
      ],
      [
        "Semifinais",
        32,
        80,
        2560,
        "8 jogos × 4 árbs"
      ],
      [
        "Disputa de 3º lugar",
        12,
        80,
        960,
        "4 jogos × 3 árbs"
      ],
      [
        "Finais",
        16,
        80,
        1280,
        "4 jogos × 4 árbs"
      ],
      [
        "SUBTOTAL — ARBITRAGEM CACHÊ",
        null,
        null,
        27840
      ],
      [],
      [
        "2. INFRAESTRUTURA BÁSICA"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Aluguel dos campos",
        1,
        5000,
        5000,
        "Locação completa"
      ],
      [
        "Pacotes de gelo — times",
        336,
        null,
        0,
        "56 times × 6 pct × R$20"
      ],
      [
        "Água e isotônico nos campos",
        null,
        null,
        0,
        "estações de hidratação por campo/dia"
      ],
      [
        "SUBTOTAL — INFRAESTRUTURA BÁSICA",
        null,
        null,
        5000
      ],
      [],
      [
        "3. ÁRBITROS — ESTADIA E LOGÍSTICA"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Hospedagem",
        27,
        300,
        8100,
        "R$300/árbitro"
      ],
      [
        "Alimentação",
        27,
        210,
        5670,
        "R$210/árbitro"
      ],
      [
        "Transporte",
        27,
        200,
        5400,
        "R$200/árbitro — média"
      ],
      [
        "SUBTOTAL — ÁRBITROS ESTADIA",
        null,
        null,
        19170
      ],
      [],
      [
        "4. STAFF PRINCIPAL"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Hospedagem",
        10,
        300,
        3000,
        "R$300/pessoa"
      ],
      [
        "Alimentação",
        10,
        210,
        2100,
        "R$210/pessoa"
      ],
      [
        "Transporte",
        10,
        400,
        4000,
        "R$400/pessoa"
      ],
      [
        "SUBTOTAL — STAFF PRINCIPAL",
        null,
        null,
        9100
      ],
      [],
      [
        "5. MATERIAL E OPERAÇÕES DE CAMPO"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Pilons — 8 por campo (mandar fazer)",
        48,
        null,
        0,
        "8/campo × 6 campos = 48"
      ],
      [
        "Marcadores de down — 1 por campo",
        6,
        null,
        0,
        "1/campo"
      ],
      [
        "Marcação de jardas",
        null,
        null,
        0,
        "material ou serviço"
      ],
      [
        "Delegados das partidas",
        null,
        null,
        0,
        "oficial por jogo"
      ],
      [
        "Pessoas para marcação pirulito (down)",
        null,
        null,
        0,
        "operadores de down marker"
      ],
      [
        "Rádios comunicadores",
        null,
        null,
        0,
        "unidades"
      ],
      [
        "Moedas personalizadas — árbitros",
        27,
        null,
        0,
        "1/árbitro"
      ],
      [
        "Uniforme de arbitragem (kit completo)",
        27,
        null,
        0,
        "1 kit/árbitro"
      ],
      [
        "Pranchetas e súmulas impressas",
        8,
        null,
        0,
        "8 unidades — scoresheets por campo/jogo"
      ],
      [
        "SUBTOTAL — MATERIAL E OPERAÇÕES",
        null,
        null,
        0
      ],
      [],
      [
        "6. STAFF OPERACIONAL E PESSOAL"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Responsável pelo sistema",
        1,
        null,
        0
      ],
      [
        "Pessoa trilíngue (PT/EN/ES)",
        1,
        null,
        0
      ],
      [
        "Ajudantes de operação",
        3,
        null,
        0
      ],
      [
        "Equipe de marketing",
        2,
        null,
        0,
        "de bique + 1"
      ],
      [
        "Estatístico / análise de dados",
        1,
        null,
        0
      ],
      [
        "Carregadores",
        3,
        null,
        0
      ],
      [
        "Limpeza",
        null,
        null,
        0,
        "equipe ou serviço terceirizado"
      ],
      [
        "Segurança",
        null,
        null,
        0,
        "equipe ou serviço terceirizado"
      ],
      [
        "Gerente de operações — passagem aérea (Leonardo)",
        1,
        null,
        0,
        "nordeste → SP (ida e volta)"
      ],
      [
        "Camisas para staff",
        10,
        null,
        0,
        "10 pessoas"
      ],
      [
        "SUBTOTAL — STAFF OPERACIONAL",
        null,
        null,
        0
      ],
      [],
      [
        "7. TECNOLOGIA E SISTEMAS"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Telão (transmissão ao vivo, resultados e chaveamento)",
        1,
        null,
        0
      ],
      [
        "Sistema de inscrição e acompanhamento online",
        1,
        null,
        0
      ],
      [
        "Loja virtual (e-commerce / merchandise)",
        1,
        null,
        0
      ],
      [
        "Loja física (espaço e montagem)",
        1,
        null,
        0
      ],
      [
        "Editor de vídeo — cortes e highlights",
        1,
        null,
        0
      ],
      [
        "Gravação de todos os campos",
        null,
        null,
        0,
        "câmeras, operadores ou drone"
      ],
      [
        "Internet e conectividade (link dedicado ou chips 4G)",
        1,
        null,
        0,
        "transmissão + sistemas + redes sociais"
      ],
      [
        "Narração e comentarista",
        null,
        null,
        0,
        "3 dias — narrador(es) + comentarista(s)"
      ],
      [
        "SUBTOTAL — TECNOLOGIA E SISTEMAS",
        null,
        null,
        0
      ],
      [],
      [
        "8. INFRAESTRUTURA E LOGÍSTICA"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Ambulâncias",
        null,
        null,
        0,
        "plantão durante o evento"
      ],
      [
        "Gradis / barreiras de segurança",
        null,
        null,
        0,
        "metros lineares"
      ],
      [
        "Tendas e coberturas",
        null,
        null,
        0,
        "unidades ou m²"
      ],
      [
        "Transfer equipes — aeroporto Guarulhos",
        56,
        null,
        0,
        "1 por time inscrito"
      ],
      [
        "Copos descartáveis / vira-copos",
        null,
        null,
        0,
        "unidades"
      ],
      [
        "Banheiros químicos",
        null,
        null,
        0,
        "unidades × dias"
      ],
      [
        "Lixeiras",
        null,
        null,
        0,
        "unidades"
      ],
      [
        "Mesas e cadeiras — praça de alimentação",
        null,
        null,
        0,
        "conjuntos"
      ],
      [
        "Local para palestras / auditório",
        1,
        null,
        0
      ],
      [
        "Credenciamento (wristbands, crachás, controle de acesso)",
        1,
        null,
        0,
        "kit completo"
      ],
      [
        "Gerador de energia (backup para telão, transmissão, som)",
        null,
        null,
        0,
        "diárias ou locação"
      ],
      [
        "Montagem e desmontagem da estrutura",
        1,
        null,
        0,
        "mão de obra: tendas, gradis, banners, mesas, backdrop"
      ],
      [
        "Área VIP",
        null,
        null,
        0,
        "estrutura, mobiliário e serviços especiais"
      ],
      [
        "SUBTOTAL — INFRAESTRUTURA E LOGÍSTICA",
        null,
        null,
        0
      ],
      [],
      [
        "9. COMUNICAÇÃO VISUAL E MARKETING"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Banners em volta dos campos",
        null,
        null,
        0,
        "unidades"
      ],
      [
        "Backdrop (área de fotos)",
        null,
        null,
        0,
        "m² ou unidades"
      ],
      [
        "Wind banners",
        null,
        null,
        0,
        "unidades"
      ],
      [
        "Comunicação visual — placas (banheiros, campos, etc.)",
        1,
        null,
        0,
        "kit sinalização"
      ],
      [
        "Fotógrafo (cobertura completa do evento)",
        1,
        null,
        0
      ],
      [
        "Divulgação na mídia",
        1,
        null,
        0,
        "assessoria ou patrocínio"
      ],
      [
        "Influencers",
        null,
        null,
        0,
        "número de contratações"
      ],
      [
        "SUBTOTAL — COMUNICAÇÃO VISUAL E MARKETING",
        null,
        null,
        0
      ],
      [],
      [
        "10. PREMIAÇÃO E ENTRETENIMENTO"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Medalhas",
        null,
        null,
        0,
        "atletas + árbitros + staff"
      ],
      [
        "Troféus",
        null,
        null,
        0,
        "unidades por categoria"
      ],
      [
        "Kit de frutas para times",
        56,
        null,
        0,
        "1 kit/time"
      ],
      [
        "Show artístico",
        1,
        null,
        0,
        "atração/banda"
      ],
      [
        "Palco e sonorização",
        1,
        null,
        0
      ],
      [
        "Pirotecnia",
        1,
        null,
        0,
        "abertura e/ou encerramento"
      ],
      [
        "Jogo das estrelas",
        1,
        null,
        0,
        "organização e premiação"
      ],
      [
        "Food trucks (organização e curadoria)",
        null,
        null,
        0,
        "número de trucks"
      ],
      [
        "Campo Under Armour (branding / patrocínio)",
        1,
        null,
        0,
        "setup e ativação"
      ],
      [
        "Cerimônia de abertura",
        1,
        null,
        0,
        "produção, bandeiras, protocolo, apresentação"
      ],
      [
        "Cerimônia de encerramento / premiação",
        1,
        null,
        0,
        "palco, roteiro, MC, entrega de troféus por categoria"
      ],
      [
        "Espaço Kids",
        null,
        null,
        0,
        "montagem, coordenação e atividades infantis"
      ],
      [
        "SUBTOTAL — PREMIAÇÃO E ENTRETENIMENTO",
        null,
        null,
        0
      ],
      [],
      [
        "11. SAÚDE E SEGURANÇA"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs. / Fornecedor"
      ],
      [
        "Posto médico (estrutura e equipe)",
        1,
        null,
        0
      ],
      [
        "Tenda fisioterapia",
        1,
        null,
        0,
        "equipamentos e profissional"
      ],
      [
        "Seguro do evento (responsabilidade civil + acidentes)",
        1,
        null,
        0,
        "cobertura completa do torneio"
      ],
      [
        "Alvará e licença municipal do evento",
        1,
        null,
        0,
        "prefeitura de Leme — solicitar com 60+ dias de antecedência"
      ],
      [
        "Protetor solar — staff e árbitros",
        null,
        null,
        0,
        "unidades (3 dias ao ar livre)"
      ],
      [
        "SUBTOTAL — SAÚDE E SEGURANÇA",
        null,
        null,
        0
      ],
      [],
      [
        "12. TRANSMISSÃO AO VIVO"
      ],
      [
        "Item",
        "Nº Jogos",
        "Custo/Jogo (R$)",
        "Total (R$)",
        "Detalhes"
      ],
      [
        "Transmissão de jogos ao vivo",
        36,
        1000,
        36000,
        "36 jogos × R$1.000 — ver aba TRANSMISSÃO"
      ],
      [
        "SUBTOTAL — TRANSMISSÃO",
        null,
        null,
        36000
      ],
      [],
      [
        "13. OUTROS CUSTOS"
      ],
      [
        "Descrição",
        "Qtd.",
        "Valor Unit. (R$)",
        "Total (R$)",
        "Obs."
      ],
      [
        null,
        null,
        null,
        0
      ],
      [
        null,
        null,
        null,
        0
      ],
      [
        null,
        null,
        null,
        0
      ],
      [
        null,
        null,
        null,
        0
      ],
      [
        null,
        null,
        null,
        0
      ],
      [
        "SUBTOTAL — OUTROS",
        null,
        null,
        0
      ],
      [],
      [
        "▌ RESUMO GERAL DE CUSTOS DO TORNEIO"
      ],
      [
        "Categoria",
        "Custo Estimado (R$)",
        null,
        null,
        "Composição"
      ],
      [
        "1. Arbitragem — Cachê",
        27840,
        null,
        null,
        "348 desig. × R$80"
      ],
      [
        "2. Infraestrutura Básica",
        5000,
        null,
        null,
        "Campo + Gelo + Água"
      ],
      [
        "3. Árbitros — Estadia e Logística",
        19170,
        null,
        null,
        "Hosp + Alim + Transp × 27"
      ],
      [
        "4. Staff Principal",
        9100,
        null,
        null,
        "Hosp + Alim + Transp × 10"
      ],
      [
        "5. Material e Operações",
        0,
        null,
        null,
        "Pilons, marcadores, pranchetas, uniformes..."
      ],
      [
        "6. Staff Operacional e Pessoal",
        0,
        null,
        null,
        "Sistema, mkt, segurança, Leo..."
      ],
      [
        "7. Tecnologia e Sistemas",
        0,
        null,
        null,
        "Telão, sistema, lojas, internet, editor..."
      ],
      [
        "8. Infraestrutura e Logística",
        0,
        null,
        null,
        "Ambulâncias, gradis, montagem, gerador..."
      ],
      [
        "9. Comunicação Visual e Marketing",
        0,
        null,
        null,
        "Banners, backdrop, fotos, mídia..."
      ],
      [
        "10. Premiação e Entretenimento",
        0,
        null,
        null,
        "Medalhas, cerimônias, show, pirotecnia..."
      ],
      [
        "11. Saúde e Segurança",
        0,
        null,
        null,
        "Posto médico, fisio, seguro, alvará..."
      ],
      [
        "12. Transmissão ao Vivo",
        36000,
        null,
        null,
        "36 jogos × R$1.000"
      ],
      [
        "13. Outros Custos",
        0,
        null,
        null,
        "Itens adicionais"
      ],
      [
        "⚠ Reserva de Contingência (10% do subtotal)",
        0,
        null,
        null,
        "Editável: mude 0.1 para o % desejado na fórmula"
      ],
      [
        "TOTAL GERAL DO TORNEIO",
        0
      ],
      [],
      [
        "💙 Azul/amarelo = editáveis  ·  ⚫ Preto = calculado  ·  🟢 Verde = ref. de outra aba  ·  ⚠ Laranja = contingência"
      ]
    ]
  }
];
