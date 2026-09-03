/**
 * data.js - Estrutura de dados dos Eixos do PIT/RIT
 * Contém a parametrização completa de todos os 6 Eixos de atividades docentes.
 */

const PIT_RIT_DATA = {
  eixos: [
    // ==========================================
    // EIXO 1 - ENSINO
    // ==========================================
    {
      id: "eixo1",
      numero: 1,
      icone: "📚",
      titulo: "Eixo 1 - Atividades de Ensino",
      subtitulo: "Máximo de 75% da carga horária semanal relativa ao regime de trabalho",
      descricaoLimite: "O total de horas semanais deste eixo não deve ultrapassar 75% do seu regime de trabalho (ex: até 30h para regime de 40h/DE, ou até 15h para regime de 20h).",
      limitePercentualRegime: 0.75,
      itens: [
        {
          id: "1_I",
          numeroRomano: "I",
          descricao: "Ministrar aulas teóricas, teórico-práticas, práticas, de laboratório ou de campo, na educação básica, na graduação e na pós-graduação lato sensu (aperfeiçoamento, especialização e residência) e stricto sensu (mestrado e doutorado)",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_II",
          numeroRomano: "II",
          descricao: "Ministrar aulas em disciplinas extensionistas",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_III",
          numeroRomano: "III",
          descricao: "Tutoria de residência",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_IV",
          numeroRomano: "IV",
          descricao: "Preparar aulas, aplicar, avaliar e corrigir trabalhos e provas, atendimento extraclasse",
          observacao: "Até 20h/semana (limitado ao número de horas somadas nos itens I e II)",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "relativo_I_II",
          observacaoDetalhada: "A carga horária informada neste item não pode exceder a soma das horas lançadas nos itens I e II, respeitando o teto de 20h/semana."
        },
        {
          id: "1_V",
          numeroRomano: "V",
          descricao: "Orientar ou coorientar trabalhos de conclusão de curso, estágios e monografias",
          observacao: "Até 2 horas por orientação até o limite de 20 horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 2
        },
        {
          id: "1_VI",
          numeroRomano: "VI",
          descricao: "Orientar ou coorientar dissertações e teses",
          observacao: "Até 2 horas por orientação até o limite de 20 horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 2
        },
        {
          id: "1_VII",
          numeroRomano: "VII",
          descricao: "Orientar discentes vinculados aos programas e projetos de ensino (monitoria, treinamento profissional, acompanhamento acadêmico, tutoria e programas e projetos afins)",
          observacao: "Até 2 horas por orientação até o limite de 20 horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 2
        },
        {
          id: "1_VIII",
          numeroRomano: "VIII",
          descricao: "Coordenar disciplina",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_IX",
          numeroRomano: "IX",
          descricao: "Coordenar ou tutorar Programa ou Grupo de Educação Tutorial, ou outros programas institucionais da UFJF de mesma natureza",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_X",
          numeroRomano: "X",
          descricao: "Realizar atendimento educacional individual a estudantes público-alvo da Educação Especial.",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_XI",
          numeroRomano: "XI",
          descricao: "Atividades complementares de ensino (visitas técnicas, participação em bancas de conclusão de cursos de graduação e de pós-graduação, grupos de estudo, entre outros)",
          observacao: "Até 224h/ano",
          limiteMaximo: 224,
          unidade: "h/ano",
          tipoLimite: "anual"
        },
        {
          id: "1_XII",
          numeroRomano: "XII",
          descricao: "Coordenação de Programas ou Projetos Especiais de Ensino devidamente registrados e institucionalizados.",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "1_XIII",
          numeroRomano: "XIII",
          descricao: "Reuniões pedagógicas e conselhos de classe na educação básica",
          observacao: "Não se aplica",
          limiteMaximo: null,
          unidade: "h/semana",
          tipoLimite: "livre"
        }
      ]
    },

    // ==========================================
    // EIXO 2 - PESQUISA
    // ==========================================
    {
      id: "eixo2",
      numero: 2,
      icone: "🔬",
      titulo: "Eixo 2 - Atividades de Pesquisa",
      subtitulo: "Máximo de 50% da carga horária semanal relativa ao regime de trabalho",
      descricaoLimite: "O total de horas semanais deste eixo não deve ultrapassar 50% do seu regime de trabalho (ex: até 20h para regime de 40h/DE, ou até 10h para regime de 20h).",
      limitePercentualRegime: 0.50,
      itens: [
        {
          id: "2_I",
          numeroRomano: "I",
          descricao: "Coordenação de projetos de pesquisa registrados na instituição com financiamento de órgãos/instituições, públicas ou privadas",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_II",
          numeroRomano: "II",
          descricao: "Coordenação de projetos de pesquisa registrados na instituição sem financiamento",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_III",
          numeroRomano: "III",
          descricao: "Vice-coordenação ou subcoordenação de projetos com ou sem financiamento",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_IV",
          numeroRomano: "IV",
          descricao: "Participação em projetos de pesquisa registrados na instituição (com ou sem financiamento)",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_V",
          numeroRomano: "V",
          descricao: "Orientação de projetos de iniciação científica, formalmente registrados na instituição, nas modalidades de ensino médio e graduação.",
          observacao: "Até 2 horas por orientação até o limite de 20horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 2
        },
        {
          id: "2_VI",
          numeroRomano: "VI",
          descricao: "Coorientação de projetos de iniciação científica, formalmente registrados na Instituição, nas modalidades de ensino médio e graduação.",
          observacao: "Até 1 horas por orientação até o limite de 20horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 1
        },
        {
          id: "2_VII",
          numeroRomano: "VII",
          descricao: "Editor-chefe de periódico científico",
          observacao: "Até 15h/semana",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_VIII",
          numeroRomano: "VIII",
          descricao: "Editor associado e/ou integrante de equipe editorial de periódico científico",
          observacao: "Até 4h/semana",
          limiteMaximo: 4,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_IX",
          numeroRomano: "IX",
          descricao: "Participação em comitê assessor ou câmara técnica com mandato fixo",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_X",
          numeroRomano: "X",
          descricao: "Compor diretoria de associação científica com mandato fixo",
          observacao: "Até 15h/semana",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_XI",
          numeroRomano: "XI",
          descricao: "Participação em comitê assessor ou câmara técnica com mandato fixo",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_XII",
          numeroRomano: "XII",
          descricao: "Curadoria científica de acervo",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_XIII",
          numeroRomano: "XIII",
          descricao: "Coordenação de comitê ou comissão de ética em pesquisa",
          observacao: "Até 15h/semana",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_XIV",
          numeroRomano: "XIV",
          descricao: "Participação em comitê ou comissão de ética em pesquisa",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_XV",
          numeroRomano: "XV",
          descricao: "Supervisão de pós-doutorado",
          observacao: "Até 4h/semana",
          limiteMaximo: 4,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "2_XVI",
          numeroRomano: "XVI",
          descricao: "Atividades complementares de pesquisa (organização e/ou participação de seminários, congressos, simpósios e similares em pesquisa; atuação em grupo de pesquisa registrado no CNPq; revisor e/ou parecerista de periódico e/ou evento; revisor ou parecerista de projetos de pesquisas submetidos a órgãos de fomento; parecerista de projetos de pesquisa como membro ad hoc; apresentação de trabalho ou similar em eventos acadêmicos; submissão de trabalhos ou projetos acadêmicos; redação de artigos; publicação de livro, de capítulo de livro, de tradução, de resenha, de verbete, de carta, de mapa, de maquete, de artigo científico, de relatório técnico e outras produções derivadas de pesquisa).",
          observacao: "Até 224h/ano",
          limiteMaximo: 224,
          unidade: "h/ano",
          tipoLimite: "anual"
        }
      ]
    },

    // ==========================================
    // EIXO 3 - EXTENSÃO
    // ==========================================
    {
      id: "eixo3",
      numero: 3,
      icone: "🤝",
      titulo: "Eixo 3 - Atividades de Extensão",
      subtitulo: "Máximo de 50% da carga horária semanal relativa ao regime de trabalho",
      descricaoLimite: "O total de horas semanais deste eixo não deve ultrapassar 50% do seu regime de trabalho (ex: até 20h para regime de 40h/DE, ou até 10h para regime de 20h).",
      limitePercentualRegime: 0.50,
      itens: [
        {
          id: "3_I",
          numeroRomano: "I",
          descricao: "Coordenação de programa ou projeto de extensão com financiamento, registrados na Pró-Reitoria de Extensão",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_II",
          numeroRomano: "II",
          descricao: "Vice-coordenação de programa ou projeto de extensão com financiamento, registrados na Pró-Reitoria de Extensão",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_III",
          numeroRomano: "III",
          descricao: "Coordenação de programa ou projeto de extensão sem financiamento, registrados na Pró-Reitoria de Extensão",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_IV",
          numeroRomano: "IV",
          descricao: "Vice-coordenação de programa ou projeto de extensão sem financiamento, registrados na Pró-Reitoria de Extensão",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_V",
          numeroRomano: "V",
          descricao: "Participação em programa ou projeto de extensão com ou sem financiamento, registrados na Pró-Reitoria de Extensão",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_VI",
          numeroRomano: "VI",
          descricao: "Orientação em programa ou projeto de extensão (inclusive de consultoria ou técnico) registrado na Pró-Reitoria de Extensão",
          observacao: "Até 2 horas por orientação até o limite de 20horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 2
        },
        {
          id: "3_VII",
          numeroRomano: "VII",
          descricao: "Coordenação de projetos de divulgação e popularização científica registrado na instituição",
          observacao: "Até 15h/semana",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_VIII",
          numeroRomano: "VIII",
          descricao: "Participação em projetos de divulgaçãoe popularização científica registrado na instituição",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "3_IX",
          numeroRomano: "IX",
          descricao: "Atividades complementares de extensão (organização e/ou participação em cursos, oficinas, seminários, congressos, simpósios, palestras, conferências, dinâmicas, capacitação ou treinamento e similares em extensão; revisor e/ou parecerista de periódico e/ou evento de cunho extensionista; coordenação, promoção e produção artística e/ou cultural vinculados à ação extensionista; prestação de serviço de caráter extensionista; organização ou publicação de livro, de capítulo de livro ou artigo acadêmico, produção artística coletiva ou individual, vinculados a ação extensionista; submissão de trabalhos programas ou projetos extensionistas; publicação/participação regular em jornal, revista, programa de rádio, TV ou outro canal em razão de sua atividade docente)",
          observacao: "Até 224h/ano",
          limiteMaximo: 224,
          unidade: "h/ano",
          tipoLimite: "anual"
        }
      ]
    },

    // ==========================================
    // EIXO 4 - ARTE E CULTURA
    // ==========================================
    {
      id: "eixo4",
      numero: 4,
      icone: "🎨",
      titulo: "Eixo 4 - Atividades de Arte e Cultura",
      subtitulo: "Máximo de 50% da carga horária semanal relativa ao regime de trabalho",
      descricaoLimite: "O total de horas semanais deste eixo não deve ultrapassar 50% do seu regime de trabalho (ex: até 20h para regime de 40h/DE, ou até 10h para regime de 20h).",
      limitePercentualRegime: 0.50,
      itens: [
        {
          id: "4_I",
          numeroRomano: "I",
          descricao: "Coordenação de projetos vinculados ao programa de iniciação artística ou similares registrados na instituição",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_II",
          numeroRomano: "II",
          descricao: "Vice-coordenação de projetos vinculados ao programa de iniciação artística ou similares registrados na instituição",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_III",
          numeroRomano: "III",
          descricao: "Orientação de projetos vinculados ao programa de iniciação artística ou similares registrados na instituição",
          observacao: "Até 2 horas por orientação até o limite de 20horas semanais",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal",
          limitePorAtividade: 2
        },
        {
          id: "4_IV",
          numeroRomano: "IV",
          descricao: "Participação em equipe de projetos vinculados ao programa de iniciação artística ou similares registrados na instituição",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_V",
          numeroRomano: "V",
          descricao: "Vice-coordenação de projeto ou programa cultural registrados na UFJF ou outro agente de financiamento",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_VI",
          numeroRomano: "VI",
          descricao: "Vice-coordenação de projeto ou programa cultural",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_VII",
          numeroRomano: "VII",
          descricao: "Participação em equipe de projeto ou programa cultural registrados na UFJF ou outro agente de financiamento",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_VIII",
          numeroRomano: "VIII",
          descricao: "Coordenação/regência de corpos artístico-musicais ou grupos/coletivos artísticos vinculados à UFJF",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_IX",
          numeroRomano: "IX",
          descricao: "Curadoria de projetos artísticos/culturais registrados na UFJF ou em parceria com esta instituição",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "4_X",
          numeroRomano: "X",
          descricao: "Atividades complementares de arte e cultura (participação na promoção de atividades artístico/culturais realizadas pela UFJF ou por Órgãos Suplementares/Setores Estáveis administrados por esta instituição; participação na organização deseminários, congressos, exposições, palestras, dinâmicas e afins realizados pela UFJF ou por Órgãos Suplementares/Setores Estáveis administrados por esta instituição vinculados à cultura; organização, planejamento e execução de eventos ligados à cultura; produções artísticas e culturais tais como, partituras ou fotografias)",
          observacao: "Até 224h/ano",
          limiteMaximo: 224,
          unidade: "h/ano",
          tipoLimite: "anual"
        },
        {
          id: "4_XI",
          numeroRomano: "XI",
          descricao: "Pesquisa e produção artística",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        }
      ]
    },

    // ==========================================
    // EIXO 5 - INOVAÇÃO
    // ==========================================
    {
      id: "eixo5",
      numero: 5,
      icone: "💡",
      titulo: "Eixo 5 - Atividades de Inovação",
      subtitulo: "Máximo de 50% da carga horária semanal relativa ao regime de trabalho",
      descricaoLimite: "O total de horas semanais deste eixo não deve ultrapassar 50% do seu regime de trabalho (ex: até 20h para regime de 40h/DE, ou até 10h para regime de 20h).",
      limitePercentualRegime: 0.50,
      itens: [
        {
          id: "5_I",
          numeroRomano: "I",
          descricao: "Coordenação de projeto de parceria para pesquisa, desenvolvimento e inovação registrados na instituição (P&D, Extensão Tecnológica)",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_II",
          numeroRomano: "II",
          descricao: "Vice-coordenação de projeto de parceria para pesquisa, desenvolvimento e inovação registrados na instituição (P&D, Extensão Tecnológica)",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_III",
          numeroRomano: "III",
          descricao: "Participação como pesquisador em projeto de parceria para pesquisa, desenvolvimento e inovação registrados na instituição",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_IV",
          numeroRomano: "IV",
          descricao: "Coordenação de projeto de prestação de serviço técnico especializado registrado na instituição",
          observacao: "Até 20h/semana",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_V",
          numeroRomano: "V",
          descricao: "Vice-coordenação de projeto de prestação de serviço técnico especializado registrado na instituição",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_VI",
          numeroRomano: "VI",
          descricao: "Participação na equipe executora de projeto de prestação de serviço técnico especializado registrado na instituição",
          observacao: "Até 10h/semana",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_VII",
          numeroRomano: "VII",
          descricao: "Mentoria de startups, tutoria de Empresa Júnior, coordenação de Equipe de Competição registrado na instituição",
          observacao: "Até 15h/semana",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "5_VIII",
          numeroRomano: "VIII",
          descricao: "Atividades complementares de inovação, desde que aprovadas pelo Departamento (depósito de patente de invenção, depósito de modelo de utilidade, registro de programa de computador, registro de marca, registro de desenho industrial e demais atividades inerentes à criação de propriedade intelectual, organização ou participação em evento de inovação, avaliação de projetos ou programas voltados para inovação, de planejamento de Spin-off, prospecção de transferência de tecnologia, prospecção e captação de projetos de inovação)",
          observacao: "Até 224h/ano",
          limiteMaximo: 224,
          unidade: "h/ano",
          tipoLimite: "anual"
        }
      ]
    },

    // ==========================================
    // EIXO 6 - GESTÃO INSTITUCIONAL
    // ==========================================
    {
      id: "eixo6",
      numero: 6,
      icone: "🏛️",
      titulo: "Eixo 6 - Atividades Administrativas no âmbito da Gestão Institucional",
      subtitulo: "Cargos de direção, coordenação, chefia e comissões institucionais",
      descricaoLimite: "Carga horária destinada a cargos de gestão e atividades administrativas regulamentadas da UFJF.",
      limitePercentualRegime: 1.0,
      itens: [
        // 6.1 Cargos que permitem não ter carga-horária de aulas
        {
          id: "6.1_I",
          subgrupo: "6.1 Cargos que permitem não ter carga-horária de aulas",
          numeroRomano: "I",
          descricao: "Exercício do cargo de Reitor(a)",
          observacao: "até 40h",
          limiteMaximo: 40,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.1_II",
          subgrupo: "6.1 Cargos que permitem não ter carga-horária de aulas",
          numeroRomano: "II",
          descricao: "Exercício do cargo de Vice-Reitor(a)",
          observacao: "até 40h",
          limiteMaximo: 40,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.1_III",
          subgrupo: "6.1 Cargos que permitem não ter carga-horária de aulas",
          numeroRomano: "III",
          descricao: "Exercício do cargo de Pró-Reitor(a)",
          observacao: "até 40h",
          limiteMaximo: 40,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.1_IV",
          subgrupo: "6.1 Cargos que permitem não ter carga-horária de aulas",
          numeroRomano: "IV",
          descricao: "Exercício do cargo de Diretor(a) de Unidade acadêmica",
          observacao: "até 40h",
          limiteMaximo: 40,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.1_V",
          subgrupo: "6.1 Cargos que permitem não ter carga-horária de aulas",
          numeroRomano: "V",
          descricao: "Exercício do cargo de Diretor(a) de Campus",
          observacao: "até 40h",
          limiteMaximo: 40,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },

        // 6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas
        {
          id: "6.2_I",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "I",
          descricao: "Exercício do cargo de Pró-Reitor(a) Adjunto (a)",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_II",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "II",
          descricao: "Exercício do cargo de Diretor(a) ou Coordenador(a) Administrativo(a) em Unidade Acadêmica ou Administrativa",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_IV",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "IV",
          descricao: "Secretário (a)-Geral",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_V",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "V",
          descricao: "Diretor (a) ou Presidente de Fundações de Apoio à UFJF",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_VI",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "VI",
          descricao: "Diretor (a) ou Coordenador(a) de Órgãos Suplementares",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_VII",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "VII",
          descricao: "Coordenador (a) de Curso de Graduação ou do Ensino Básico vinculadas",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_VIII",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "VIII",
          descricao: "Coordenador (a) de Curso de Pós-graduação Stricto Sensu (mestrado e doutorado)",
          observacao: "Até 30h",
          limiteMaximo: 30,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.2_IX",
          subgrupo: "6.2 Cargos que permitem a consideração de menos de oito horas na carga horária de aulas",
          numeroRomano: "IX",
          descricao: "Coordenador das comissões (COREME, COREMU ou CORED) ou dos programas de residência",
          observacao: "Até 20h",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },

        // 6.3 Cargos que não permitem redução na carga horária mínima de aulas
        {
          id: "6.3_I",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "I",
          descricao: "Exercício do cargo de Vice-Diretor(a) de Unidade Acadêmica",
          observacao: "Até 20h",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_II",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "II",
          descricao: "Vice-Diretor de Campus",
          observacao: "Até 20h",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_III",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "III",
          descricao: "Vice-Coordenador(a) de Curso de Graduação e de Ensino Básico",
          observacao: "Até 15h",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_IV",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "IV",
          descricao: "Vice-Coordenador(a) de Curso de Pós-Graduação Stricto Sensu (Mestrado e Doutorado)",
          observacao: "Até 15h",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_V",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "V",
          descricao: "Vice-Coordenador(a) das Comissões (COREME, COREMU ou CORED) ou dos Programas de Residência",
          observacao: "Até 10h",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_VI",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "VI",
          descricao: "Coordenador (a) de Curso de Pós-Graduação Lato Sensu (Especialização) gratuito e sem recebimento de bolsa",
          observacao: "Até 8h",
          limiteMaximo: 8,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_VII",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "VII",
          descricao: "Coordenador (a) de Curso de Pós-Graduação Lato Sensu (Especialização) gratuito, com recebimento de bolsa financiada pelo Poder Público",
          observacao: "Até 4h",
          limiteMaximo: 4,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_VIII",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "VIII",
          descricao: "Coordenador (a) de Curso de Pós-Graduação Lato Sensu (Especialização) não gratuito, com recebimento de bolsa",
          observacao: "Até 2h",
          limiteMaximo: 2,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_IX",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "IX",
          descricao: "Chefe de Departamento",
          observacao: "Até 20h",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_X",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "X",
          descricao: "Subchefe de Departamento",
          observacao: "Até 10h",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.3_XI",
          subgrupo: "6.3 Cargos que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "XI",
          descricao: "Gerências Administrativas do Campus de Governador Valadares",
          observacao: "Até 15h",
          limiteMaximo: 15,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },

        // 6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas
        {
          id: "6.4_I",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "I",
          descricao: "Supervisor (a) de setores institucionais que desenvolvam atividades práticas em espaços com atendimento ao público externo, a exemplo dos Núcleos de Práticas Jurídicas, Centro de Psicologia Aplicada, Núcleo de Prática Contábil, dentre outros da mesma natureza",
          observacao: "Até 10h",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.4_II",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "II",
          descricao: "Membro de órgão colegiado, de Núcleo Docente Estruturante (NDE) de curso, de comissões designadas por portaria ou de conselho curador das fundações de apoio",
          observacao: "Até 2h",
          limiteMaximo: 2,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.4_III",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "III",
          descricao: "Membro de comissão ou comitê permanente regulamentado por Órgãos Superiores da UFJF, a exemplo da Comissão Permanente de Pessoal Docente (CPPD), Comissão Própria de Avaliação (CPA), dentre outras da mesma natureza",
          observacao: "Até 4h",
          limiteMaximo: 4,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.4_IV",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "IV",
          descricao: "Presidente de comissão ou comitê permanente regulamentado por Órgãos Superiores da UFJF, a exemplo da Comissão Permanente de Pessoal Docente (CPPD), Comissão Própria de Avaliação (CPA), dentre outras da mesma natureza",
          observacao: "Até 8h",
          limiteMaximo: 8,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.4_V",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "V",
          descricao: "Atividades administrativas complementares: assessoria à UFJF; editoria de periódico; participação em reuniões institucionais; gestão de laboratório ou de núcleos da UFJF; participação em comissão de Departamento e/ou Congregação; participação em comissão de revalidação de diploma; participação em banca de seleção e/ou concurso público; outras atividades referentes ao desenvolvimento da carreira; realização de viagens de trabalho de campo; representação junto a órgãos do Governo nas esferas municipal, distrital, estadual ou federal ou nos Poderes Executivo, Legislativo ou Judiciário, desde que aprovadas pela Administração Superior; representação em associação de classe ou associação/conselho profissional",
          observacao: "Até 4h",
          limiteMaximo: 4,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.4_VI",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "VI",
          descricao: "Presidente de Associação de Classe",
          observacao: "Até 20h",
          limiteMaximo: 20,
          unidade: "h/semana",
          tipoLimite: "semanal"
        },
        {
          id: "6.4_VII",
          subgrupo: "6.4 Outras atividades administrativas que não permitem redução na carga horária mínima de aulas",
          numeroRomano: "VII",
          descricao: "Membro de Diretoria de Associação de Classe",
          observacao: "Até 10h",
          limiteMaximo: 10,
          unidade: "h/semana",
          tipoLimite: "semanal"
        }
      ]
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PIT_RIT_DATA };
}
