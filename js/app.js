/**
 * app.js - Lógica e Interatividade do Sistema PIT/RIT
 * Secretaria Virtual - IAD / UFJF
 * Suporte completo aos 6 Eixos regulamentares (Ensino, Pesquisa, Extensão, Arte/Cultura, Inovação e Gestão Institucional)
 */

// ==========================================
// Configuração do Supabase
// ==========================================
const supabaseUrl = 'https://qidnxbbaryjcexdqiitu.supabase.co';
const supabaseKey = 'sb_publishable_g3p8l9ujgH0g9Gac2KTu2A_hisZgvas';
let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
}

const app = {
  state: {
    docente: {
      nome: "",
      siape: "",
      regime: "40_DE",
      unidade: "Instituto de Artes e Design (IAD)",
      periodo: "2025/1",
      tipoDoc: "PIT"
    },
    // Guarda as atividades por item: { "1_I": [ { id, descricao, horas, obs } ], ... }
    atividades: {},
    etapaAtual: "identificacao",
    eixoAtivoId: "eixo1",
    identificacaoSalva: false
  },

  /**
   * Inicialização da Aplicação
   */
  async init() {
    this.carregarDoLocalStorage();

    // Verifica sessão do usuário logado
    const sessao = auth.obterSessao();
    if (!sessao) {
      this.mostrarAuthOverlay();
    } else {
      // Docente autenticado
      this.aplicarDadosUsuarioLogado(sessao);
      await this.listarPlanosDocente();
      if (sessao.is_admin) {
        this.verificarPendenciasAdmin();
      }
    }

    this.inicializarCampos();
    this.atualizarHeaderUsuario();
    this.navegarPara(this.state.etapaAtual || "identificacao");

    // Fecha modal clicando fora
    const modal = document.getElementById("activityModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          app.fecharModal();
        }
      });
    }

    const modalNovo = document.getElementById("novoPreenchimentoModal");
    if (modalNovo) {
      modalNovo.addEventListener("click", (e) => {
        if (e.target === modalNovo) {
          app.fecharModalNovoPreenchimento();
        }
      });
    }

    const modalAdmin = document.getElementById("adminModal");
    if (modalAdmin) {
      modalAdmin.addEventListener("click", (e) => {
        if (e.target === modalAdmin) {
          app.fecharPainelAdmin();
        }
      });
    }

    // Atalho ESC para fechar modais
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        app.fecharModal();
        app.fecharModalNovoPreenchimento();
        app.fecharPainelAdmin();
      }
    });
  },

  /**
   * Aplica dados do usuário autenticado no estado da aplicação e atualiza o painel
   */
  aplicarDadosUsuarioLogado(usuario) {
    if (!usuario) return;
    this.state.docente.nome = usuario.nome || this.state.docente.nome;
    this.state.docente.siape = usuario.siape || this.state.docente.siape;
    this.state.docente.regime = usuario.regime || this.state.docente.regime;
    this.state.docente.unidade = usuario.unidade || this.state.docente.unidade;

    const elNome = document.getElementById("dashUserNome");
    const elSiape = document.getElementById("dashUserSiape");
    const elUnidade = document.getElementById("dashUserUnidade");
    const elRegime = document.getElementById("dashUserRegime");
    const elAvatar = document.getElementById("dashUserAvatar");

    if (elNome) elNome.textContent = usuario.nome;
    if (elSiape) elSiape.textContent = usuario.siape;
    if (elUnidade) elUnidade.textContent = usuario.unidade || "Instituto de Artes e Design (IAD)";
    if (elRegime) {
      const regMap = { "40_DE": "40h DE", "40": "40h Semanal", "20": "20h Semanal" };
      elRegime.textContent = regMap[usuario.regime] || usuario.regime;
    }
    if (elAvatar && usuario.nome) {
      elAvatar.textContent = usuario.nome.charAt(0).toUpperCase();
    }

    const btnAdmin = document.getElementById("btnAdminPainel");
    if (btnAdmin) {
      btnAdmin.style.display = usuario.is_admin ? "inline-flex" : "none";
    }
  },

  /**
   * Lista todos os planos de trabalho salvos do docente logado (Nuvem e Local)
   */
  async listarPlanosDocente() {
    const container = document.getElementById("listaPlanosContainer");
    if (!container) return;

    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-muted);">
        🔄 Carregando seus planos de trabalho da nuvem...
      </div>
    `;

    const siape = this.state.docente.siape;
    let planos = [];

    if (supabaseClient && siape) {
      try {
        const { data, error } = await supabaseClient
          .from('pit_rit_documentos')
          .select('*')
          .eq('siape', siape)
          .order('periodo', { ascending: false });

        if (!error && data) {
          planos = data;
        }
      } catch (e) {
        console.warn("Erro ao buscar planos do Supabase:", e);
      }
    }

    // Se houver dados no estado local que não estão na lista, mescla
    if (this.state.docente.periodo && Object.keys(this.state.atividades || {}).length > 0) {
      const jaExiste = planos.some(p => p.periodo === this.state.docente.periodo && (p.tipo_doc || 'PIT') === (this.state.docente.tipoDoc || 'PIT'));
      if (!jaExiste) {
        planos.unshift({
          id: "local_ativo",
          siape: this.state.docente.siape,
          nome: this.state.docente.nome,
          periodo: this.state.docente.periodo,
          tipo_doc: this.state.docente.tipoDoc || "PIT",
          regime: this.state.docente.regime || "40_DE",
          unidade: this.state.docente.unidade,
          atividades: this.state.atividades,
          updated_at: new Date().toISOString()
        });
      }
    }

    this.planosCache = planos;
    this.renderizarListaPlanos(planos);
  },

  /**
   * Renderiza os cards de planos na Central de Planos
   */
  renderizarListaPlanos(planos) {
    const container = document.getElementById("listaPlanosContainer");
    if (!container) return;

    if (!planos || planos.length === 0) {
      container.innerHTML = `
        <div class="empty-plans-state" style="grid-column: 1 / -1;">
          <div class="empty-plans-icon">📑</div>
          <h3>Nenhum plano cadastrado no momento</h3>
          <p>Você ainda não possui planos de trabalho ou relatórios salvos. Clique no botão abaixo para iniciar seu primeiro preenchimento.</p>
          <button type="button" class="btn btn-primary" onclick="app.abrirModalNovoPreenchimento()" style="padding: 0.75rem 1.6rem; font-size: 1rem;">
            ➕ Iniciar Primeiro Preenchimento
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    planos.forEach(plano => {
      const card = document.createElement("div");
      const tipo = (plano.tipo_doc || "PIT").toUpperCase();
      const isRit = tipo === "RIT";
      card.className = `plan-card ${isRit ? 'plan-rit' : 'plan-pit'}`;

      let totalHorasSemanais = 0;
      let totalHorasAnuais = 0;
      let totalAtividades = 0;

      if (plano.atividades) {
        Object.keys(plano.atividades).forEach(itemId => {
          const acts = plano.atividades[itemId] || [];
          totalAtividades += acts.length;
          const itemDef = this.buscarItemPorId(itemId);
          acts.forEach(a => {
            const h = parseFloat(a.horas) || 0;
            if (itemDef && itemDef.unidade === "h/ano") {
              totalHorasAnuais += h;
            } else {
              totalHorasSemanais += h;
            }
          });
        });
      }

      const regimeLabelMap = {
        "40_DE": "40h DE",
        "40": "40h Semanal",
        "20": "20h Semanal"
      };
      const regimeLabel = regimeLabelMap[plano.regime] || plano.regime || "40h DE";

      let dataFormatada = "-";
      if (plano.updated_at) {
        try {
          const d = new Date(plano.updated_at);
          dataFormatada = d.toLocaleDateString("pt-BR") + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } catch(e) {}
      }

      card.innerHTML = `
        <div class="plan-card-top">
          <div>
            <div class="plan-semester-badge">Semestre ${this.escaparHtml(plano.periodo || "2026.3")}</div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Salvo em ${dataFormatada}</span>
          </div>
          <span class="plan-type-pill ${isRit ? 'pill-rit' : 'pill-pit'}">
            ${tipo === 'PIT' ? '📋 PIT' : '📊 RIT'}
          </span>
        </div>

        <div class="plan-card-body">
          <div class="plan-metric">
            <span class="plan-metric-label">Regime:</span>
            <span class="plan-metric-value">${this.escaparHtml(regimeLabel)}</span>
          </div>
          <div class="plan-metric">
            <span class="plan-metric-label">Carga Horária Semanal:</span>
            <span class="plan-metric-value" style="color: var(--primary); font-size: 0.95rem;">${totalHorasSemanais} h/semana</span>
          </div>
          ${totalHorasAnuais > 0 ? `
          <div class="plan-metric">
            <span class="plan-metric-label">Carga Horária Anual:</span>
            <span class="plan-metric-value">${totalHorasAnuais} h/ano</span>
          </div>
          ` : ''}
          <div class="plan-metric">
            <span class="plan-metric-label">Lançamentos:</span>
            <span class="plan-metric-value">${totalAtividades} atividade(s)</span>
          </div>
        </div>

        <div class="plan-card-actions">
          <button type="button" class="btn btn-primary btn-sm" onclick="app.abrirPlano('${plano.id || ''}', '${plano.periodo}', '${plano.tipo_doc}')" title="Continuar preenchendo este plano">
            📂 Preencher
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="app.abrirCompilacaoPlano('${plano.id || ''}', '${plano.periodo}', '${plano.tipo_doc}')" title="Visualizar compilação e imprimir">
            📊 Relatório
          </button>
          <button type="button" class="btn btn-plan-delete" onclick="app.excluirPlano('${plano.id || ''}', '${plano.periodo}', '${plano.tipo_doc}')" title="Excluir este plano">
            🗑️
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  },

  /**
   * Abre o modal simplificado de Novo Preenchimento
   */
  abrirModalNovoPreenchimento() {
    const modal = document.getElementById("novoPreenchimentoModal");
    if (modal) {
      const regSelect = document.getElementById("novoPlanoRegime");
      if (regSelect && this.state.docente.regime) {
        regSelect.value = this.state.docente.regime;
      }
      modal.classList.add("show");
    }
  },

  /**
   * Fecha o modal de Novo Preenchimento
   */
  fecharModalNovoPreenchimento() {
    const modal = document.getElementById("novoPreenchimentoModal");
    if (modal) {
      modal.classList.remove("show");
    }
  },

  /**
   * Confirma o Novo Preenchimento selecionado pelo docente
   */
  confirmarNovoPreenchimento(event) {
    if (event) event.preventDefault();

    const tipoDoc = document.getElementById("novoPlanoTipoDoc")?.value || "PIT";
    const regime = document.getElementById("novoPlanoRegime")?.value || "40_DE";
    const semestre = document.getElementById("novoPlanoSemestre")?.value || "2026.3";

    this.state.docente.tipoDoc = tipoDoc;
    this.state.docente.regime = regime;
    this.state.docente.periodo = semestre;
    this.state.identificacaoSalva = true;

    // Se já existia um plano para esse mesmo semestre e tipo, carrega as atividades existentes
    const planoExistente = (this.planosCache || []).find(p => p.periodo === semestre && (p.tipo_doc || "PIT") === tipoDoc);

    if (planoExistente && planoExistente.atividades && Object.keys(planoExistente.atividades).length > 0) {
      this.state.atividades = JSON.parse(JSON.stringify(planoExistente.atividades));
    } else {
      this.state.atividades = {};
    }

    this.salvarNoLocalStorage();
    this.fecharModalNovoPreenchimento();
    this.atualizarHeaderUsuario();
    this.sincronizarNuvem();
    this.navegarPara("eixo1");
  },

  /**
   * Abre um plano existente para edição a partir da lista
   */
  abrirPlano(planoId, periodo, tipoDoc) {
    const plano = (this.planosCache || []).find(p => (planoId && p.id === planoId) || (p.periodo === periodo && (p.tipo_doc || "PIT") === (tipoDoc || "PIT")));
    if (plano) {
      this.state.docente.periodo = plano.periodo;
      this.state.docente.tipoDoc = plano.tipo_doc || "PIT";
      this.state.docente.regime = plano.regime || this.state.docente.regime;
      this.state.atividades = plano.atividades || {};
      this.state.identificacaoSalva = true;

      this.salvarNoLocalStorage();
      this.atualizarHeaderUsuario();
      this.navegarPara("eixo1");
    }
  },

  /**
   * Abre diretamente a compilação/relatório de um plano existente
   */
  abrirCompilacaoPlano(planoId, periodo, tipoDoc) {
    const plano = (this.planosCache || []).find(p => (planoId && p.id === planoId) || (p.periodo === periodo && (p.tipo_doc || "PIT") === (tipoDoc || "PIT")));
    if (plano) {
      this.state.docente.periodo = plano.periodo;
      this.state.docente.tipoDoc = plano.tipo_doc || "PIT";
      this.state.docente.regime = plano.regime || this.state.docente.regime;
      this.state.atividades = plano.atividades || {};
      this.state.identificacaoSalva = true;

      this.salvarNoLocalStorage();
      this.atualizarHeaderUsuario();
      this.navegarPara("compilacao");
    }
  },

  /**
   * Exclui um plano de trabalho cadastrado
   */
  async excluirPlano(planoId, periodo, tipoDoc) {
    const nomePlano = `${tipoDoc || 'PIT'} do semestre ${periodo}`;
    if (!confirm(`Deseja realmente excluir o ${nomePlano}? Todas as atividades deste semestre serão removidas.`)) {
      return;
    }

    if (supabaseClient && this.state.docente.siape) {
      try {
        await supabaseClient
          .from('pit_rit_documentos')
          .delete()
          .match({ siape: this.state.docente.siape, periodo: periodo, tipo_doc: tipoDoc });
      } catch (e) {
        console.warn("Erro ao excluir do Supabase:", e);
      }
    }

    // Se o plano excluído era o que estava ativo, limpa o estado ativo
    if (this.state.docente.periodo === periodo && (this.state.docente.tipoDoc || 'PIT') === (tipoDoc || 'PIT')) {
      this.state.atividades = {};
      this.salvarNoLocalStorage();
    }

    await this.listarPlanosDocente();
    alert(`O ${nomePlano} foi excluído com sucesso.`);
  },

  /**
   * Salva estado no LocalStorage
   */
  salvarNoLocalStorage() {
    try {
      localStorage.setItem("pit_rit_dados_v5", JSON.stringify(this.state));
    } catch (e) {
      console.warn("Não foi possível salvar no localStorage", e);
    }
  },

  /**
   * Sincronização automática contínua com a nuvem (Supabase)
   */
  async sincronizarNuvem(mostrarAlerta = false) {
    const statusEl = document.getElementById("cloudSyncStatus");
    if (statusEl) {
      statusEl.textContent = "🔄 Sincronizando...";
      statusEl.className = "cloud-sync-badge syncing";
    }

    if (!supabaseClient) {
      if (statusEl) {
        statusEl.textContent = "💾 Salvo localmente";
        statusEl.className = "cloud-sync-badge";
      }
      return;
    }

    const { nome, siape, regime, unidade, periodo, tipoDoc } = this.state.docente;
    if (!nome || !siape) {
      if (statusEl) {
        statusEl.textContent = "☁️ Aguardando dados";
        statusEl.className = "cloud-sync-badge";
      }
      return;
    }

    try {
      const payload = {
        siape: siape,
        nome: nome,
        regime: regime,
        unidade: unidade,
        periodo: periodo,
        tipo_doc: tipoDoc,
        atividades: this.state.atividades,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('pit_rit_documentos')
        .upsert(payload, { onConflict: 'siape,periodo,tipo_doc' });

      if (error) throw error;

      if (statusEl) {
        statusEl.textContent = "☁️ Sincronizado";
        statusEl.className = "cloud-sync-badge saved";
      }

      if (mostrarAlerta) {
        alert("Dados salvos e sincronizados na nuvem com sucesso!");
      }
    } catch (err) {
      console.warn("Erro ao sincronizar na nuvem:", err);
      if (statusEl) {
        statusEl.textContent = "⚠️ Nuvem pendente";
        statusEl.className = "cloud-sync-badge";
      }
      if (mostrarAlerta) {
        alert("Os dados foram salvos no seu navegador, mas houve instabilidade na conexão com a nuvem.");
      }
    }
  },

  /**
   * Salvamento manual explícito acionado pelo usuário
   */
  salvarManual() {
    const nome = document.getElementById("docenteNome")?.value.trim();
    if (nome) {
      this.state.docente.nome = nome;
      this.state.docente.siape = document.getElementById("docenteSiape")?.value.trim() || "";
      this.state.docente.regime = document.getElementById("docenteRegime")?.value || "40_DE";
      this.state.docente.unidade = document.getElementById("docenteUnidade")?.value.trim() || "";
      this.state.docente.periodo = document.getElementById("docentePeriodo")?.value.trim() || "";
      this.state.docente.tipoDoc = document.getElementById("docenteTipoDoc")?.value || "PIT";
    }

    this.salvarNoLocalStorage();
    this.sincronizarNuvem(true);
  },

  /**
   * Recupera estado do LocalStorage
   */
  carregarDoLocalStorage() {
    try {
      const salvo = localStorage.getItem("pit_rit_dados_v5") || 
                    localStorage.getItem("pit_rit_dados_v4") || 
                    localStorage.getItem("pit_rit_dados_v3") || 
                    localStorage.getItem("pit_rit_dados_v2") || 
                    localStorage.getItem("pit_rit_dados_v1");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        this.state = Object.assign(this.state, parsed);
      }
    } catch (e) {
      console.warn("Erro ao carregar do localStorage", e);
    }
  },

  /**
   * Preenche campos do formulário com o estado atual
   */
  inicializarCampos() {
    const doc = this.state.docente;
    if (doc) {
      const elNome = document.getElementById("docenteNome");
      const elSiape = document.getElementById("docenteSiape");
      const elRegime = document.getElementById("docenteRegime");
      const elUnidade = document.getElementById("docenteUnidade");
      const elPeriodo = document.getElementById("docentePeriodo");
      const elTipoDoc = document.getElementById("docenteTipoDoc");

      if (elNome && doc.nome) elNome.value = doc.nome;
      if (elSiape && doc.siape) elSiape.value = doc.siape;
      if (elRegime && doc.regime) elRegime.value = doc.regime;
      if (elUnidade && doc.unidade) elUnidade.value = doc.unidade;
      if (elPeriodo && doc.periodo) elPeriodo.value = doc.periodo;
      if (elTipoDoc && doc.tipoDoc) elTipoDoc.value = doc.tipoDoc;
    }
  },

  /**
   * Atualiza o cabeçalho superior com dados do docente logado
   */
  atualizarHeaderUsuario() {
    const headerStatus = document.getElementById("headerUserStatus");
    const headerNome = document.getElementById("headerDocenteNome");
    const headerSiape = document.getElementById("headerDocenteSiape");

    if (this.state.docente.nome && this.state.docente.siape) {
      if (headerStatus) headerStatus.style.display = "flex";
      if (headerNome) headerNome.textContent = this.state.docente.nome;
      if (headerSiape) headerSiape.textContent = this.state.docente.siape;
    } else {
      if (headerStatus) headerStatus.style.display = "none";
    }
  },

  /**
   * Salva os dados de identificação do docente e avança
   */
  salvarIdentificacao() {
    const nome = document.getElementById("docenteNome").value.trim();
    const siape = document.getElementById("docenteSiape").value.trim();
    const regime = document.getElementById("docenteRegime").value;
    const unidade = document.getElementById("docenteUnidade").value.trim();
    const periodo = document.getElementById("docentePeriodo").value.trim();
    const tipoDoc = document.getElementById("docenteTipoDoc").value;

    if (!nome || !siape) {
      alert("Por favor, preencha o Nome Completo e a Matrícula SIAPE para continuar.");
      return;
    }

    this.state.docente = { nome, siape, regime, unidade, periodo, tipoDoc };
    this.state.identificacaoSalva = true;

    this.salvarNoLocalStorage();
    this.atualizarHeaderUsuario();
    this.sincronizarNuvem();
    this.navegarPara("eixo1");
  },

  /**
   * Atualiza o cálculo de limites ao mudar o regime
   */
  atualizarRegime() {
    const regime = document.getElementById("docenteRegime").value;
    this.state.docente.regime = regime;
    this.salvarNoLocalStorage();
    if (this.state.eixoAtivoId) {
      this.atualizarPainelEixo(this.state.eixoAtivoId);
    }
  },

  /**
   * Navega entre as seções/etapas do sistema
   */
  navegarPara(etapaId) {
    // Se ainda não escolheu um plano/semestre e tenta acessar eixos ou compilação
    if (etapaId !== "identificacao" && (!this.state.docente.nome || !this.state.docente.siape || !this.state.docente.periodo)) {
      alert("Por favor, selecione um plano de trabalho cadastrado ou clique em '➕ Novo Preenchimento' para iniciar.");
      etapaId = "identificacao";
    }

    this.state.etapaAtual = etapaId;
    this.salvarNoLocalStorage();

    // Esconde todas as seções
    const secoes = document.querySelectorAll(".view-section");
    secoes.forEach(sec => sec.classList.remove("active-view"));

    // Desativa passos do stepper
    const steps = document.querySelectorAll(".step-item");
    steps.forEach(step => {
      step.classList.remove("active");
    });

    // Se voltou para a tela inicial / Meus Planos, atualiza a lista de planos
    if (etapaId === "identificacao") {
      this.listarPlanosDocente();
    }

    // Verifica se a etapa é um Eixo configurado na base de dados
    const eixoConfig = PIT_RIT_DATA.eixos.find(e => e.id === etapaId);

    if (eixoConfig) {
      if (eixoConfig.itens && eixoConfig.itens.length > 0) {
        // Eixo com itens ativos
        this.state.eixoAtivoId = etapaId;
        const secEixo = document.getElementById("view-eixo");
        if (secEixo) secEixo.classList.add("active-view");

        this.renderizarEixo(etapaId);

        const stepEl = document.querySelector(`.step-item[data-step="${etapaId}"]`);
        if (stepEl) {
          stepEl.classList.remove("disabled");
          stepEl.classList.add("active");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    // Seções de Identificação ou Compilação
    const secaoAlvo = document.getElementById(`view-${etapaId}`);
    if (secaoAlvo) {
      secaoAlvo.classList.add("active-view");
    }

    // Atualiza Stepper
    const stepAlvo = document.querySelector(`.step-item[data-step="${etapaId}"]`);
    if (stepAlvo) {
      stepAlvo.classList.remove("disabled");
      stepAlvo.classList.add("active");
    }

    // Libera passos do stepper se identificado
    if (this.state.docente.nome && this.state.docente.siape && this.state.docente.periodo) {
      steps.forEach(s => s.classList.remove("disabled"));
    }

    if (etapaId === "compilacao") {
      this.gerarRelatorioCompilado();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  /**
   * Navegação do botão Voltar na barra do Eixo
   */
  voltarEixo() {
    const eixoAtual = this.state.eixoAtivoId;
    if (eixoAtual === "eixo1") {
      this.navegarPara("identificacao");
    } else if (eixoAtual === "eixo2") {
      this.navegarPara("eixo1");
    } else if (eixoAtual === "eixo3") {
      this.navegarPara("eixo2");
    } else if (eixoAtual === "eixo4") {
      this.navegarPara("eixo3");
    } else if (eixoAtual === "eixo5") {
      this.navegarPara("eixo4");
    } else if (eixoAtual === "eixo6") {
      this.navegarPara("eixo5");
    } else {
      this.navegarPara("identificacao");
    }
  },

  /**
   * Navegação do botão Avançar na barra do Eixo
   */
  avancarEixo() {
    const eixoAtual = this.state.eixoAtivoId;
    if (eixoAtual === "eixo1") {
      this.navegarPara("eixo2");
    } else if (eixoAtual === "eixo2") {
      this.navegarPara("eixo3");
    } else if (eixoAtual === "eixo3") {
      this.navegarPara("eixo4");
    } else if (eixoAtual === "eixo4") {
      this.navegarPara("eixo5");
    } else if (eixoAtual === "eixo5") {
      this.navegarPara("eixo6");
    } else if (eixoAtual === "eixo6") {
      this.navegarPara("compilacao");
    } else {
      this.navegarPara("compilacao");
    }
  },

  /**
   * Renderiza a tela do Eixo ativo
   */
  renderizarEixo(eixoId) {
    const eixo = PIT_RIT_DATA.eixos.find(e => e.id === eixoId);
    if (!eixo) return;

    // Atualiza cabeçalho do Eixo
    const elTitle = document.getElementById("axisTitle");
    const elSubtitle = document.getElementById("axisSubtitle");
    const elRuleText = document.getElementById("axisRuleText");

    if (elTitle) elTitle.textContent = `${eixo.icone || "📚"} ${eixo.titulo}`;
    if (elSubtitle) elSubtitle.textContent = eixo.subtitulo;
    if (elRuleText) elRuleText.innerHTML = `<strong>Regra do Eixo:</strong> ${eixo.subtitulo}.`;

    // Atualiza botões de navegação
    const btnVoltar = document.getElementById("btnEixoVoltar");
    const btnAvancar = document.getElementById("btnEixoAvancar");

    if (eixoId === "eixo1") {
      if (btnVoltar) btnVoltar.innerHTML = `&larr; Voltar para Meus Planos`;
      if (btnAvancar) btnAvancar.innerHTML = `Avançar para Eixo 2 (Pesquisa) &rarr;`;
    } else if (eixoId === "eixo2") {
      if (btnVoltar) btnVoltar.innerHTML = `&larr; Voltar para Eixo 1 (Ensino)`;
      if (btnAvancar) btnAvancar.innerHTML = `Avançar para Eixo 3 (Extensão) &rarr;`;
    } else if (eixoId === "eixo3") {
      if (btnVoltar) btnVoltar.innerHTML = `&larr; Voltar para Eixo 2 (Pesquisa)`;
      if (btnAvancar) btnAvancar.innerHTML = `Avançar para Eixo 4 (Arte e Cultura) &rarr;`;
    } else if (eixoId === "eixo4") {
      if (btnVoltar) btnVoltar.innerHTML = `&larr; Voltar para Eixo 3 (Extensão)`;
      if (btnAvancar) btnAvancar.innerHTML = `Avançar para Eixo 5 (Inovação) &rarr;`;
    } else if (eixoId === "eixo5") {
      if (btnVoltar) btnVoltar.innerHTML = `&larr; Voltar para Eixo 4 (Arte e Cultura)`;
      if (btnAvancar) btnAvancar.innerHTML = `Avançar para Eixo 6 (Gestão) &rarr;`;
    } else if (eixoId === "eixo6") {
      if (btnVoltar) btnVoltar.innerHTML = `&larr; Voltar para Eixo 5 (Inovação)`;
      if (btnAvancar) btnAvancar.innerHTML = `Ver Compilação Geral &rarr;`;
    }

    // Renderiza a tabela de itens
    this.renderizarTabelaItens(eixo);

    // Atualiza totais e alertas do eixo
    this.atualizarPainelEixo(eixoId);
  },

  /**
   * Renderiza as linhas da tabela para os itens do eixo fornecido (com suporte a subgrupos)
   */
  renderizarTabelaItens(eixo) {
    const tbody = document.getElementById("tbodyEixo");
    if (!tbody) return;

    tbody.innerHTML = "";
    let ultimoSubgrupo = null;

    eixo.itens.forEach(item => {
      // Se houver mudança de subgrupo (ex: 6.1, 6.2, 6.3, 6.4), insere linha divisória de cabeçalho
      if (item.subgrupo && item.subgrupo !== ultimoSubgrupo) {
        ultimoSubgrupo = item.subgrupo;
        const trSubgroup = document.createElement("tr");
        trSubgroup.className = "subgroup-row";
        trSubgroup.innerHTML = `<td colspan="5">📂 ${item.subgrupo}</td>`;
        tbody.appendChild(trSubgroup);
      }

      const tr = document.createElement("tr");
      tr.id = `row-item-${item.id}`;
      
      const atividadesDoItem = this.state.atividades[item.id] || [];
      if (atividadesDoItem.length > 0) {
        tr.classList.add("has-activities");
      }

      // Coluna 1: Número Romano
      const tdNum = document.createElement("td");
      tdNum.className = "col-num";
      tdNum.textContent = item.numeroRomano;
      tr.appendChild(tdNum);

      // Coluna 2: Descrição do Item
      const tdDesc = document.createElement("td");
      tdDesc.className = "col-desc";
      tdDesc.innerHTML = `<strong>${item.descricao}</strong>`;
      if (item.observacaoDetalhada) {
        tdDesc.innerHTML += `<div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;"><em>${item.observacaoDetalhada}</em></div>`;
      }
      tr.appendChild(tdDesc);

      // Coluna 3: Observação / Limite
      const tdObs = document.createElement("td");
      tdObs.className = "col-obs";
      let badgeClass = "badge-obs";
      if (item.tipoLimite === "relativo_I_II" || item.limitePorAtividade) {
        badgeClass += " badge-limit-special";
      }
      tdObs.innerHTML = `<span class="${badgeClass}">${item.observacao}</span>`;
      tr.appendChild(tdObs);

      // Coluna 4: Atividades Lançadas
      const tdActivities = document.createElement("td");
      tdActivities.className = "col-activities";
      tdActivities.innerHTML = this.gerarHtmlAtividadesItem(item, atividadesDoItem);
      tr.appendChild(tdActivities);

      // Coluna 5: Ações
      const tdActions = document.createElement("td");
      tdActions.className = "col-actions";
      tdActions.innerHTML = `
        <button type="button" class="btn btn-primary btn-sm" onclick="app.abrirModalAdicionar('${item.id}')" title="Adicionar atividade a este item">
          ➕ Adicionar
        </button>
      `;
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  },

  /**
   * Gera o HTML das atividades cadastradas em um item
   */
  gerarHtmlAtividadesItem(item, atividades) {
    if (!atividades || atividades.length === 0) {
      return `<span class="empty-activity-notice">Nenhuma atividade lançada</span>`;
    }

    let html = `<div class="activities-list">`;
    let subtotalHoras = 0;

    atividades.forEach(act => {
      const horasNum = parseFloat(act.horas) || 0;
      subtotalHoras += horasNum;

      const unidadeTexto = item.unidade === "h/ano" ? "h/ano" : "h/sem";

      html += `
        <div class="activity-item-chip" id="chip-${act.id}">
          <div class="activity-chip-header">
            <span class="activity-title">${this.escaparHtml(act.descricao)}</span>
            <span class="activity-hours-badge">${horasNum} ${unidadeTexto}</span>
          </div>
          ${act.obs ? `<div style="font-size: 0.75rem; color: #64748b;">${this.escaparHtml(act.obs)}</div>` : ""}
          <div class="activity-chip-actions">
            <button type="button" class="btn-chip-edit" onclick="app.abrirModalEdicao('${item.id}', '${act.id}')" title="Editar atividade">
              ✏️ Editar
            </button>
            <button type="button" class="btn-chip-delete" onclick="app.excluirAtividade('${item.id}', '${act.id}')" title="Excluir atividade">
              🗑️ Excluir
            </button>
          </div>
        </div>
      `;
    });

    const unidadeTexto = item.unidade === "h/ano" ? "h/ano" : "h/semana";
    html += `</div>`;
    html += `<div class="item-subtotal-badge">Subtotal: <strong>${subtotalHoras} ${unidadeTexto}</strong></div>`;

    return html;
  },

  /**
   * Abre o modal para adicionar nova atividade em um item
   */
  abrirModalAdicionar(itemId) {
    const item = this.buscarItemPorId(itemId);
    const eixo = this.buscarEixoPorItemId(itemId);
    if (!item || !eixo) return;

    const grupoInfo = item.subgrupo ? ` (${item.subgrupo.split(" ")[0]})` : "";
    document.getElementById("modalTitle").textContent = `➕ Adicionar Atividade — Item ${item.numeroRomano}${grupoInfo}`;
    document.getElementById("modalItemId").value = itemId;
    document.getElementById("modalActivityId").value = "";

    document.getElementById("modalItemLabel").textContent = `Item ${item.numeroRomano} — ${eixo.titulo}${grupoInfo}`;
    document.getElementById("modalItemDesc").textContent = item.descricao;
    document.getElementById("modalItemObs").textContent = `Regra / Limite: ${item.observacao}`;

    document.getElementById("activityDescription").value = "";
    document.getElementById("activityHours").value = "";
    document.getElementById("activityObs").value = "";

    const elUnit = document.getElementById("modalHoursUnit");
    const elHelper = document.getElementById("modalHoursHelper");
    if (item.unidade === "h/ano") {
      elUnit.textContent = "h/ano";
      elHelper.textContent = "Horas totais anuais dedicadas a esta atividade complementar (máx 224h/ano)";
    } else {
      elUnit.textContent = "h/semana";
      elHelper.textContent = "Carga horária semanal dedicada a esta atividade";
    }

    document.getElementById("modalLimitWarning").style.display = "none";
    document.getElementById("modalSaveBtn").textContent = "Adicionar Atividade";

    const modal = document.getElementById("activityModal");
    modal.classList.add("show");
    setTimeout(() => {
      document.getElementById("activityDescription").focus();
    }, 150);
  },

  /**
   * Abre o modal para editar uma atividade existente
   */
  abrirModalEdicao(itemId, activityId) {
    const item = this.buscarItemPorId(itemId);
    const eixo = this.buscarEixoPorItemId(itemId);
    if (!item || !eixo) return;

    const lista = this.state.atividades[itemId] || [];
    const atividade = lista.find(a => a.id === activityId);
    if (!atividade) return;

    const grupoInfo = item.subgrupo ? ` (${item.subgrupo.split(" ")[0]})` : "";
    document.getElementById("modalTitle").textContent = `✏️ Editar Atividade — Item ${item.numeroRomano}${grupoInfo}`;
    document.getElementById("modalItemId").value = itemId;
    document.getElementById("modalActivityId").value = activityId;

    document.getElementById("modalItemLabel").textContent = `Item ${item.numeroRomano} — ${eixo.titulo}${grupoInfo}`;
    document.getElementById("modalItemDesc").textContent = item.descricao;
    document.getElementById("modalItemObs").textContent = `Regra / Limite: ${item.observacao}`;

    document.getElementById("activityDescription").value = atividade.descricao;
    document.getElementById("activityHours").value = atividade.horas;
    document.getElementById("activityObs").value = atividade.obs || "";

    const elUnit = document.getElementById("modalHoursUnit");
    const elHelper = document.getElementById("modalHoursHelper");
    if (item.unidade === "h/ano") {
      elUnit.textContent = "h/ano";
      elHelper.textContent = "Horas totais anuais dedicadas a esta atividade complementar (máx 224h/ano)";
    } else {
      elUnit.textContent = "h/semana";
      elHelper.textContent = "Carga horária semanal dedicada a esta atividade";
    }

    document.getElementById("modalLimitWarning").style.display = "none";
    document.getElementById("modalSaveBtn").textContent = "Salvar Alterações";

    const modal = document.getElementById("activityModal");
    modal.classList.add("show");
    setTimeout(() => {
      document.getElementById("activityDescription").focus();
    }, 150);
  },

  /**
   * Fecha o modal de atividade
   */
  fecharModal() {
    const modal = document.getElementById("activityModal");
    modal.classList.remove("show");
  },

  /**
   * Salva a atividade (criação ou edição)
   */
  salvarAtividade() {
    const itemId = document.getElementById("modalItemId").value;
    const activityId = document.getElementById("modalActivityId").value;
    const descricao = document.getElementById("activityDescription").value.trim();
    const horas = parseFloat(document.getElementById("activityHours").value);
    const obs = document.getElementById("activityObs").value.trim();

    if (!descricao) {
      alert("Por favor, descreva a atividade a ser adicionada.");
      return;
    }

    if (isNaN(horas) || horas <= 0) {
      alert("Por favor, informe uma carga horária válida maior que zero.");
      return;
    }

    const item = this.buscarItemPorId(itemId);
    if (!item) return;

    if (!this.state.atividades[itemId]) {
      this.state.atividades[itemId] = [];
    }

    if (activityId) {
      // Edição
      const index = this.state.atividades[itemId].findIndex(a => a.id === activityId);
      if (index !== -1) {
        this.state.atividades[itemId][index] = {
          id: activityId,
          descricao,
          horas,
          obs,
          atualizadoEm: new Date().toISOString()
        };
      }
    } else {
      // Nova Atividade
      const novoId = "act_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      this.state.atividades[itemId].push({
        id: novoId,
        descricao,
        horas,
        obs,
        criadoEm: new Date().toISOString()
      });
    }

    this.salvarNoLocalStorage();
    this.sincronizarNuvem();
    this.fecharModal();
    
    // Re-renderiza o eixo atual
    if (this.state.eixoAtivoId) {
      const eixo = PIT_RIT_DATA.eixos.find(e => e.id === this.state.eixoAtivoId);
      if (eixo) {
        this.renderizarTabelaItens(eixo);
        this.atualizarPainelEixo(this.state.eixoAtivoId);
      }
    }
  },

  /**
   * Exclui uma atividade específica
   */
  excluirAtividade(itemId, activityId) {
    if (!confirm("Deseja realmente excluir este lançamento de atividade?")) {
      return;
    }

    if (this.state.atividades[itemId]) {
      this.state.atividades[itemId] = this.state.atividades[itemId].filter(a => a.id !== activityId);
      if (this.state.atividades[itemId].length === 0) {
        delete this.state.atividades[itemId];
      }
    }

    this.salvarNoLocalStorage();
    this.sincronizarNuvem();
    if (this.state.eixoAtivoId) {
      const eixo = PIT_RIT_DATA.eixos.find(e => e.id === this.state.eixoAtivoId);
      if (eixo) {
        this.renderizarTabelaItens(eixo);
        this.atualizarPainelEixo(this.state.eixoAtivoId);
      }
    }
  },

  /**
   * Atualiza o painel superior de carga horária e alertas do Eixo ativo
   */
  atualizarPainelEixo(eixoId) {
    const eixo = PIT_RIT_DATA.eixos.find(e => e.id === eixoId);
    if (!eixo) return;

    let totalSemanalEixo = 0;
    let totalAnualEixo = 0;
    const horasPorItem = {};

    eixo.itens.forEach(item => {
      const acts = this.state.atividades[item.id] || [];
      const soma = acts.reduce((acc, a) => acc + (parseFloat(a.horas) || 0), 0);
      horasPorItem[item.id] = soma;

      if (item.unidade === "h/ano") {
        totalAnualEixo += soma;
      } else {
        totalSemanalEixo += soma;
      }
    });

    // Carga horária do regime
    let cargaRegime = 40;
    if (this.state.docente.regime === "20") {
      cargaRegime = 20;
    }

    const pctLimite = eixo.limitePercentualRegime || 1.0;
    const limiteSemanalEixo = cargaRegime * pctLimite;
    const pctTexto = Math.round(pctLimite * 100);

    // Elementos da UI
    const elTotalSemanal = document.getElementById("totalHorasEixo");
    const elLimiteSemanal = document.getElementById("limiteHorasEixo");
    const elTotalAnual = document.getElementById("totalHorasAnuaisEixo");
    const elLabelLimite = document.getElementById("labelLimiteEixo");
    const elLabelAnual = document.getElementById("labelHorasAnuais");
    const metricCard = document.getElementById("metricTotalEixo");

    if (elTotalSemanal) elTotalSemanal.textContent = `${totalSemanalEixo.toFixed(1)}h`;
    if (elLimiteSemanal) elLimiteSemanal.textContent = `${limiteSemanalEixo.toFixed(1)}h`;
    if (elTotalAnual) elTotalAnual.textContent = `${totalAnualEixo}h`;
    if (elLabelLimite) elLabelLimite.textContent = `Teto (${pctTexto}%)`;

    // Rótulo da métrica anual
    const itemAnual = eixo.itens.find(i => i.unidade === "h/ano");
    if (elLabelAnual) {
      if (itemAnual) {
        elLabelAnual.textContent = `Atividades Anuais (h/ano)`;
      } else {
        elLabelAnual.textContent = `Atividades Anuais`;
      }
    }

    if (metricCard) {
      metricCard.classList.remove("limit-ok", "limit-warn", "limit-exceeded");
      if (totalSemanalEixo > limiteSemanalEixo) {
        metricCard.classList.add("limit-exceeded");
      } else if (totalSemanalEixo > 0) {
        metricCard.classList.add("limit-ok");
      }
    }

    // Verificação de alertas
    this.verificarAlertasEixo(eixo, totalSemanalEixo, limiteSemanalEixo, pctTexto, horasPorItem);
  },

  /**
   * Emite alertas em banner para o eixo ativo
   */
  verificarAlertasEixo(eixo, totalSemanal, limiteSemanal, pctTexto, horasPorItem) {
    const alertContainer = document.getElementById("axisAlertContainer");
    if (!alertContainer) return;

    const alertas = [];
    const regimeTexto = this.state.docente.regime === "20" ? "20h" : "40h";

    // Alerta de teto percentual do eixo (exceto para gestão onde é até a carga do regime)
    if (totalSemanal > limiteSemanal) {
      alertas.push({
        tipo: "danger",
        texto: `<strong>Limite Excedido no ${eixo.titulo}:</strong> O total semanal lançado (${totalSemanal.toFixed(1)}h) ultrapassou o teto permitido de ${pctTexto}% do seu regime (${limiteSemanal.toFixed(1)}h para regime de ${regimeTexto}).`
      });
    }

    // Alertas específicos do Eixo 1
    if (eixo.id === "eixo1") {
      const horasItemI = horasPorItem["1_I"] || 0;
      const horasItemII = horasPorItem["1_II"] || 0;
      const horasItemIV = horasPorItem["1_IV"] || 0;
      const maxPermitidoIV = horasItemI + horasItemII;

      if (horasItemIV > maxPermitidoIV) {
        alertas.push({
          tipo: "warning",
          texto: `<strong>Atenção no Item IV:</strong> A carga de preparação/avaliação (${horasItemIV}h) está superior à soma das aulas ministradas nos Itens I e II (${maxPermitidoIV}h). Ajuste conforme a norma.`
        });
      }
    }

    // Alertas específicos do Eixo 2
    if (eixo.id === "eixo2") {
      const actsV = this.state.atividades["2_V"] || [];
      if (actsV.some(a => (parseFloat(a.horas) || 0) > 2)) {
        alertas.push({
          tipo: "warning",
          texto: `<strong>Atenção no Item V (Orientação IC):</strong> Cada orientação está limitada a até 2 horas semanais por discente.`
        });
      }

      const actsVI = this.state.atividades["2_VI"] || [];
      if (actsVI.some(a => (parseFloat(a.horas) || 0) > 1)) {
        alertas.push({
          tipo: "warning",
          texto: `<strong>Atenção no Item VI (Coorientação IC):</strong> Cada coorientação está limitada a até 1 hora semanal por discente.`
        });
      }
    }

    // Alertas específicos do Eixo 3
    if (eixo.id === "eixo3") {
      const actsVI = this.state.atividades["3_VI"] || [];
      if (actsVI.some(a => (parseFloat(a.horas) || 0) > 2)) {
        alertas.push({
          tipo: "warning",
          texto: `<strong>Atenção no Item VI (Orientação Extensão):</strong> Cada orientação em extensão está limitada a até 2 horas semanais por discente.`
        });
      }
    }

    // Alertas específicos do Eixo 4
    if (eixo.id === "eixo4") {
      const actsIII = this.state.atividades["4_III"] || [];
      if (actsIII.some(a => (parseFloat(a.horas) || 0) > 2)) {
        alertas.push({
          tipo: "warning",
          texto: `<strong>Atenção no Item III (Orientação Iniciação Artística):</strong> Cada orientação está limitada a até 2 horas semanais por discente.`
        });
      }
    }

    // Renderiza os alertas
    if (alertas.length === 0) {
      alertContainer.innerHTML = "";
    } else {
      alertContainer.innerHTML = alertas.map(a => `
        <div class="alert-box alert-${a.tipo}">
          <span>${a.tipo === "danger" ? "🚨" : "⚠️"}</span>
          <div>${a.texto}</div>
        </div>
      `).join("");
    }
  },

  /**
   * Atalho para abrir a visualização da compilação geral
   */
  abrirCompilacao() {
    this.navegarPara("compilacao");
  },

  /**
   * Gera a tabela compilada com todos os 6 eixos, itens e atividades cadastradas
   */
  gerarRelatorioCompilado() {
    const doc = this.state.docente;
    const repNome = document.getElementById("repDocenteNome");
    const repSiape = document.getElementById("repDocenteSiape");
    const repRegime = document.getElementById("repDocenteRegime");
    const repPeriodo = document.getElementById("repDocentePeriodo");
    const repTipoDoc = document.getElementById("repTipoDoc");

    const regimeFormatado = {
      "40_DE": "Dedicação Exclusiva (40h DE)",
      "40": "40 horas semanais",
      "20": "20 horas semanais"
    }[doc.regime] || doc.regime;

    if (repNome) repNome.textContent = doc.nome || "Não informado";
    if (repSiape) repSiape.textContent = doc.siape || "Não informado";
    if (repRegime) repRegime.textContent = regimeFormatado;
    if (repPeriodo) repPeriodo.textContent = `Semestre de Vigência: ${doc.periodo || "2025/1"} — ${doc.unidade || "IAD"}`;
    if (repTipoDoc) repTipoDoc.textContent = doc.tipoDoc || "PIT";

    const tbody = document.getElementById("reportCompiledTbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const cargaRegime = doc.regime === "20" ? 20 : 40;
    let totalGeralSemanal = 0;
    let totalGeralAnual = 0;
    const resumoEixos = [];

    // Percorre todos os 6 eixos configurados
    const eixosConfigurados = PIT_RIT_DATA.eixos.filter(e => e.itens && e.itens.length > 0);

    eixosConfigurados.forEach(eixo => {
      let subtotalSemanal = 0;
      let subtotalAnual = 0;
      let ultimoSubgrupo = null;

      // Cabeçalho do Eixo no relatório
      const trEixoHeader = document.createElement("tr");
      trEixoHeader.className = "report-axis-header-row";
      trEixoHeader.innerHTML = `
        <td colspan="5">${(eixo.icone || "")} ${eixo.titulo.toUpperCase()} (${eixo.subtitulo})</td>
      `;
      tbody.appendChild(trEixoHeader);

      eixo.itens.forEach(item => {
        // Se houver subgrupo e mudou
        if (item.subgrupo && item.subgrupo !== ultimoSubgrupo) {
          ultimoSubgrupo = item.subgrupo;
          const trSubgroup = document.createElement("tr");
          trSubgroup.className = "report-subgroup-row";
          trSubgroup.innerHTML = `<td colspan="5">📂 ${item.subgrupo}</td>`;
          tbody.appendChild(trSubgroup);
        }

        const atividades = this.state.atividades[item.id] || [];
        const itemSubtotal = atividades.reduce((acc, a) => acc + (parseFloat(a.horas) || 0), 0);

        if (item.unidade === "h/ano") {
          subtotalAnual += itemSubtotal;
        } else {
          subtotalSemanal += itemSubtotal;
        }

        const unidadeStr = item.unidade === "h/ano" ? "h/ano" : "h/sem";

        if (atividades.length === 0) {
          // Linha sem lançamentos
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="text-align: center; font-weight: bold; color: #64748b;">${item.numeroRomano}</td>
            <td>
              <div style="font-size: 0.85rem; font-weight: 600; color: #475569;">${item.descricao}</div>
            </td>
            <td>
              <div style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">— Sem atividades lançadas —</div>
            </td>
            <td style="font-size: 0.8rem; color: #64748b;">${item.observacao}</td>
            <td style="text-align: right; color: #94a3b8;">0.0 ${unidadeStr}</td>
          `;
          tbody.appendChild(tr);
        } else {
          atividades.forEach((act, idx) => {
            const tr = document.createElement("tr");
            const horasNum = parseFloat(act.horas) || 0;

            tr.innerHTML = `
              <td style="text-align: center; font-weight: bold; color: #0b3b60;">${idx === 0 ? item.numeroRomano : ""}</td>
              <td>
                ${idx === 0 ? `<div style="font-size: 0.85rem; color: #475569; font-weight: 600;">${item.descricao}</div>` : ""}
              </td>
              <td>
                <div style="font-weight: 700; color: #0f172a; padding-left: 8px; border-left: 3px solid #0284c7;">
                  ${this.escaparHtml(act.descricao)}
                  ${act.obs ? `<span style="font-weight: normal; font-size: 0.8rem; color: #64748b;"> (${this.escaparHtml(act.obs)})</span>` : ""}
                </div>
              </td>
              <td style="font-size: 0.8rem; color: #64748b;">${idx === 0 ? item.observacao : ""}</td>
              <td style="text-align: right; font-weight: 700; color: #0b3b60;">${horasNum.toFixed(1)} ${unidadeStr}</td>
            `;
            tbody.appendChild(tr);
          });

          // Se tem mais de uma atividade, adiciona linha de subtotal do item
          if (atividades.length > 1) {
            const trSub = document.createElement("tr");
            trSub.style.backgroundColor = "#f8fafc";
            trSub.innerHTML = `
              <td></td>
              <td colspan="3" style="text-align: right; font-size: 0.8rem; font-weight: 600; color: #64748b;">
                Subtotal do Item ${item.numeroRomano}:
              </td>
              <td style="text-align: right; font-weight: 800; color: #0b3b60; border-top: 1px dashed #cbd5e1;">
                ${itemSubtotal.toFixed(1)} ${unidadeStr}
              </td>
            `;
            tbody.appendChild(trSub);
          }
        }
      });

      // Linha de Subtotal do Eixo
      const trTotalEixo = document.createElement("tr");
      trTotalEixo.className = "report-total-row";
      const pctTexto = Math.round((eixo.limitePercentualRegime || 1) * 100);
      const limiteSem = cargaRegime * (eixo.limitePercentualRegime || 1);

      trTotalEixo.innerHTML = `
        <td colspan="4" style="text-align: right; font-weight: 800; color: #0b3b60;">
          SUBTOTAL DO ${eixo.titulo.toUpperCase()} (Teto de ${pctTexto}% = ${limiteSem.toFixed(1)} h/sem):
        </td>
        <td style="text-align: right; font-weight: 800; font-size: 1rem; color: #0b3b60;">
          ${subtotalSemanal.toFixed(1)} h/sem ${subtotalAnual > 0 ? `+ ${subtotalAnual} h/ano` : ""}
        </td>
      `;
      tbody.appendChild(trTotalEixo);

      totalGeralSemanal += subtotalSemanal;
      totalGeralAnual += subtotalAnual;

      resumoEixos.push({
        eixo,
        subtotalSemanal,
        subtotalAnual,
        limiteSemanal: limiteSem
      });
    });

    // Renderiza caixa de resumo consolidado
    const summaryBox = document.getElementById("reportSummaryBox");
    if (summaryBox) {
      let htmlResumo = "";
      resumoEixos.forEach(r => {
        htmlResumo += `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.9rem;">
            <span>Subtotal ${r.eixo.titulo} (Semanal):</span>
            <strong>${r.subtotalSemanal.toFixed(1)} h/sem <span style="font-size: 0.75rem; color: #64748b;">(Teto: ${r.limiteSemanal.toFixed(1)}h)</span></strong>
          </div>
        `;
        if (r.subtotalAnual > 0) {
          htmlResumo += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; color: #64748b; font-size: 0.8rem;">
              <span>↳ Atividades Anuais (${r.eixo.titulo}):</span>
              <strong>${r.subtotalAnual} h/ano</strong>
            </div>
          `;
        }
      });

      htmlResumo += `
        <div style="display: flex; justify-content: space-between; margin-top: 0.75rem; border-top: 2px solid var(--primary); padding-top: 0.75rem; font-size: 1.15rem; color: var(--primary);">
          <strong>TOTAL GERAL SEMANAL:</strong>
          <strong>${totalGeralSemanal.toFixed(1)} h/sem</strong>
        </div>
      `;

      summaryBox.innerHTML = htmlResumo;
    }
  },

  /**
   * Exporta a tabela compilada para arquivo CSV compatível com Excel (UTF-8 com BOM)
   */
  exportarCSV() {
    const doc = this.state.docente;
    let csv = "\uFEFF"; // BOM UTF-8 para Excel abrir com acentos corretos

    // Metadados do Docente
    csv += `"UNIVERSIDADE FEDERAL DE JUIZ DE FORA - INSTITUTO DE ARTES E DESIGN"\n`;
    csv += `"RELATÓRIO PIT/RIT - COMPILAÇÃO DE ATIVIDADES"\n\n`;
    csv += `"Docente:","${doc.nome || ""}"\n`;
    csv += `"SIAPE:","${doc.siape || ""}"\n`;
    csv += `"Regime:","${doc.regime || ""}"\n`;
    csv += `"Unidade/Depto:","${doc.unidade || ""}"\n`;
    csv += `"Período:","${doc.periodo || ""}"\n\n`;

    // Cabeçalho da Tabela
    csv += `"Eixo","Subgrupo","Item","Descrição do Item","Atividade Lançada / Detalhes","Observação do Item","Carga Horária (h)","Unidade"\n`;

    const eixosConfigurados = PIT_RIT_DATA.eixos.filter(e => e.itens && e.itens.length > 0);
    let totalSemanalGeral = 0;
    let totalAnualGeral = 0;

    eixosConfigurados.forEach(eixo => {
      let subtotalSemanal = 0;
      let subtotalAnual = 0;

      eixo.itens.forEach(item => {
        const subgrupoStr = item.subgrupo ? item.subgrupo.replace(/"/g, '""') : "--";
        const atividades = this.state.atividades[item.id] || [];
        if (atividades.length === 0) {
          csv += `"${eixo.titulo}","${subgrupoStr}","${item.numeroRomano}","${item.descricao.replace(/"/g, '""')}","-- Sem lançamentos --","${item.observacao.replace(/"/g, '""')}","0","${item.unidade}"\n`;
        } else {
          atividades.forEach(act => {
            const h = parseFloat(act.horas) || 0;
            if (item.unidade === "h/ano") {
              subtotalAnual += h;
              totalAnualGeral += h;
            } else {
              subtotalSemanal += h;
              totalSemanalGeral += h;
            }

            const descCompleta = act.obs ? `${act.descricao} (${act.obs})` : act.descricao;
            csv += `"${eixo.titulo}","${subgrupoStr}","${item.numeroRomano}","${item.descricao.replace(/"/g, '""')}","${descCompleta.replace(/"/g, '""')}","${item.observacao.replace(/"/g, '""')}","${h}","${item.unidade}"\n`;
          });
        }
      });

      csv += `\n"SUBTOTAL ${eixo.titulo.toUpperCase()} (SEMANAL)","","","","","","${subtotalSemanal}","h/semana"\n`;
      if (subtotalAnual > 0) {
        csv += `"SUBTOTAL ${eixo.titulo.toUpperCase()} (ANUAL)","","","","","","${subtotalAnual}","h/ano"\n`;
      }
      csv += `\n`;
    });

    csv += `"TOTAL GERAL (SEMANAL)","","","","","","${totalSemanalGeral}","h/semana"\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nomeLimpo = (doc.nome || "Docente").replace(/[^a-zA-Z0-9]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `PIT_RIT_${nomeLimpo}_${doc.periodo || "2025"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Exporta a tabela compilada para planilha Excel (.xlsx) rica e formatada usando ExcelJS
   */
  async exportarXLSX() {
    if (typeof ExcelJS === "undefined") {
      alert("Erro: A biblioteca de exportação Excel não foi carregada. Tente recarregar a página.");
      return;
    }

    const doc = this.state.docente;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Felipe Braga - IAD / UFJF";
    workbook.lastModifiedBy = doc.nome || "Docente";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Relatório PIT-RIT", {
      views: [{ showGridLines: true }]
    });

    // Configuração das colunas e larguras
    worksheet.columns = [
      { header: "Item", key: "item", width: 10 },
      { header: "Descrição do Item / Atividade Cadastrada", key: "descricao", width: 55 },
      { header: "Subgrupo", key: "subgrupo", width: 35 },
      { header: "Observação / Limite", key: "observacao", width: 30 },
      { header: "Carga Horária", key: "horas", width: 22 }
    ];

    // 1. Cabeçalho Institucional UFJF (Banner)
    worksheet.mergeCells("A1:E1");
    const r1 = worksheet.getCell("A1");
    r1.value = "UNIVERSIDADE FEDERAL DE JUIZ DE FORA";
    r1.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFF" } };
    r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "990000" } }; // Vermelho UFJF
    r1.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A2:E2");
    const r2 = worksheet.getCell("A2");
    r2.value = "INSTITUTO DE ARTES E DESIGN — UFJF";
    r2.font = { name: "Arial", size: 11, bold: true, color: { argb: "FDF2F2" } };
    r2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "990000" } }; // Vermelho UFJF
    r2.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.mergeCells("A3:E3");
    const r3 = worksheet.getCell("A3");
    r3.value = `SISTEMA DE LANÇAMENTO E COMPILAÇÃO ${doc.tipoDoc || "PIT"}/RIT DOCENTE`;
    r3.font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFF" } };
    r3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "990000" } }; // Vermelho UFJF
    r3.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.getRow(1).height = 28;
    worksheet.getRow(2).height = 22;
    worksheet.getRow(3).height = 24;

    worksheet.addRow([]); // Linha em branco

    // 2. Metadados do Docente
    const regimeFormatado = {
      "40_DE": "Dedicação Exclusiva (40h DE)",
      "40": "40 horas semanais",
      "20": "20 horas semanais"
    }[doc.regime] || doc.regime;

    const infoRows = [
      ["Docente:", doc.nome || "Não informado", "", "SIAPE:", doc.siape || "Não informado"],
      ["Regime de Trabalho:", regimeFormatado, "", "Vigência:", `${doc.periodo || "2025"} (Anual)`],
      ["Unidade:", doc.unidade || "IAD", "", "Tipo Documento:", doc.tipoDoc || "PIT"]
    ];

    infoRows.forEach(arr => {
      const row = worksheet.addRow(arr);
      row.font = { name: "Arial", size: 10 };
      row.getCell(1).font = { name: "Arial", size: 10, bold: true, color: { argb: "1E293B" } };
      row.getCell(4).font = { name: "Arial", size: 10, bold: true, color: { argb: "1E293B" } };
      row.eachCell(cell => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
      });
    });

    worksheet.addRow([]); // Linha em branco

    // 3. Cabeçalhos da Tabela
    const headerRow = worksheet.addRow(["Item", "Descrição do Item / Atividade Cadastrada", "Subgrupo", "Observação / Limite", "Carga Horária"]);
    headerRow.height = 24;
    headerRow.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFF" } };
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "990000" } }; // Vermelho UFJF
      if (colNumber === 1) cell.alignment = { horizontal: "center", vertical: "middle" };
      else if (colNumber === 5) cell.alignment = { horizontal: "right", vertical: "middle" };
      else cell.alignment = { horizontal: "left", vertical: "middle" };
    });

    // 4. Preenchimento dos Eixos e Atividades
    const cargaRegime = doc.regime === "20" ? 20 : 40;
    let totalSemanalGeral = 0;
    let totalAnualGeral = 0;
    const eixosConfigurados = PIT_RIT_DATA.eixos.filter(e => e.itens && e.itens.length > 0);

    eixosConfigurados.forEach(eixo => {
      let subtotalSemanal = 0;
      let subtotalAnual = 0;
      let ultimoSubgrupo = null;

      // Cabeçalho do Eixo
      const rowEixoHeader = worksheet.addRow([`${(eixo.icone || "")} ${eixo.titulo.toUpperCase()} (${eixo.subtitulo})`]);
      const rowIndex = rowEixoHeader.number;
      worksheet.mergeCells(`A${rowIndex}:E${rowIndex}`);
      rowEixoHeader.height = 22;
      rowEixoHeader.font = { name: "Arial", size: 11, bold: true, color: { argb: "990000" } };
      rowEixoHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FDF2F2" } };
      rowEixoHeader.getCell(1).alignment = { horizontal: "left", vertical: "middle" };

      eixo.itens.forEach(item => {
        // Subgrupo se mudou
        if (item.subgrupo && item.subgrupo !== ultimoSubgrupo) {
          ultimoSubgrupo = item.subgrupo;
          const rowSubg = worksheet.addRow([`📂 ${item.subgrupo}`]);
          const rSubIndex = rowSubg.number;
          worksheet.mergeCells(`A${rSubIndex}:E${rSubIndex}`);
          rowSubg.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "475569" } };
          rowSubg.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
          rowSubg.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
        }

        const atividades = this.state.atividades[item.id] || [];
        const itemSubtotal = atividades.reduce((acc, a) => acc + (parseFloat(a.horas) || 0), 0);

        if (item.unidade === "h/ano") {
          subtotalAnual += itemSubtotal;
        } else {
          subtotalSemanal += itemSubtotal;
        }

        const unidadeStr = item.unidade === "h/ano" ? "h/ano" : "h/sem";

        if (atividades.length === 0) {
          const row = worksheet.addRow([
            item.numeroRomano,
            `${item.descricao}\n(— Sem atividades lançadas —)`,
            item.subgrupo || "--",
            item.observacao,
            `0.0 ${unidadeStr}`
          ]);
          row.font = { name: "Arial", size: 9.5 };
          row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
          row.getCell(1).font = { bold: true, color: { argb: "64748B" } };
          row.getCell(2).font = { color: { argb: "94A3B8" }, italic: true };
          row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
          row.getCell(5).font = { color: { argb: "94A3B8" } };
        } else {
          atividades.forEach((act, idx) => {
            const horasNum = parseFloat(act.horas) || 0;
            const descTxt = `${item.descricao}\n➔ ${act.descricao}${act.obs ? ` (${act.obs})` : ""}`;
            
            const row = worksheet.addRow([
              idx === 0 ? item.numeroRomano : "",
              descTxt,
              item.subgrupo || "--",
              idx === 0 ? item.observacao : "",
              `${horasNum.toFixed(1)} ${unidadeStr}`
            ]);
            row.font = { name: "Arial", size: 9.5 };
            row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
            row.getCell(1).font = { bold: true, color: { argb: "990000" } };
            row.getCell(2).font = { bold: true, color: { argb: "0F172A" } };
            row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
            row.getCell(5).font = { bold: true, color: { argb: "990000" } };
          });

          if (atividades.length > 1) {
            const rowSub = worksheet.addRow([
              "",
              `Subtotal do Item ${item.numeroRomano}:`,
              "",
              "",
              `${itemSubtotal.toFixed(1)} ${unidadeStr}`
            ]);
            rowSub.font = { name: "Arial", size: 9, bold: true, color: { argb: "475569" } };
            rowSub.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
            rowSub.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
            rowSub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
          }
        }
      });

      // Subtotal do Eixo
      const pctTexto = Math.round((eixo.limitePercentualRegime || 1) * 100);
      const limiteSem = cargaRegime * (eixo.limitePercentualRegime || 1);
      const subtotalTxt = `${subtotalSemanal.toFixed(1)} h/sem${subtotalAnual > 0 ? ` + ${subtotalAnual} h/ano` : ""}`;

      const rowTotal = worksheet.addRow([
        "",
        `SUBTOTAL DO ${eixo.titulo.toUpperCase()} (Teto de ${pctTexto}% = ${limiteSem.toFixed(1)} h/sem):`,
        "",
        "",
        subtotalTxt
      ]);

      const rTotIndex = rowTotal.number;
      worksheet.mergeCells(`B${rTotIndex}:D${rTotIndex}`);
      rowTotal.height = 20;
      rowTotal.font = { name: "Arial", size: 10, bold: true, color: { argb: "990000" } };
      rowTotal.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
      rowTotal.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
      rowTotal.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FDF2F2" } };
      rowTotal.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FDF2F2" } };

      totalSemanalGeral += subtotalSemanal;
      totalAnualGeral += subtotalAnual;

      worksheet.addRow([]); // Espaçador
    });

    // 5. Bloco de Resumo Geral Final
    const rowResumoHeader = worksheet.addRow(["RESUMO DE CARGA HORÁRIA CONSOLIDADA"]);
    const rResIdx = rowResumoHeader.number;
    worksheet.mergeCells(`A${rResIdx}:E${rResIdx}`);
    rowResumoHeader.height = 22;
    rowResumoHeader.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFF" } };
    rowResumoHeader.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "990000" } };
    rowResumoHeader.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

    const rowTotalGeral = worksheet.addRow([
      "",
      "TOTAL GERAL SEMANAL LANÇADO:",
      "",
      "",
      `${totalSemanalGeral.toFixed(1)} h/semana`
    ]);

    const rTotGIdx = rowTotalGeral.number;
    worksheet.mergeCells(`B${rTotGIdx}:D${rTotGIdx}`);
    rowTotalGeral.height = 25;
    rowTotalGeral.font = { name: "Arial", size: 12, bold: true, color: { argb: "990000" } };
    rowTotalGeral.getCell(2).alignment = { horizontal: "right", vertical: "middle" };
    rowTotalGeral.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
    rowTotalGeral.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D1FAE5" } };
    rowTotalGeral.getCell(5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "D1FAE5" } };

    // Aplica bordas finas em todas as células ocupadas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "CBD5E1" } },
          left: { style: "thin", color: { argb: "CBD5E1" } },
          bottom: { style: "thin", color: { argb: "CBD5E1" } },
          right: { style: "thin", color: { argb: "CBD5E1" } }
        };
      });
    });

    // Gera arquivo .xlsx para download automático
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const nomeLimpo = (doc.nome || "Docente").replace(/[^a-zA-Z0-9]/g, "_");
    const periodoLimpo = (doc.periodo || "2025_1").replace(/\//g, "-");
    link.setAttribute("href", url);
    link.setAttribute("download", `PIT_RIT_${nomeLimpo}_${periodoLimpo}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Localiza item por ID no data.js
   */
  buscarItemPorId(itemId) {
    for (const eixo of PIT_RIT_DATA.eixos) {
      if (eixo.itens) {
        const achou = eixo.itens.find(i => i.id === itemId);
        if (achou) return achou;
      }
    }
    return null;
  },

  /**
   * Localiza eixo correspondente a um itemId
   */
  buscarEixoPorItemId(itemId) {
    for (const eixo of PIT_RIT_DATA.eixos) {
      if (eixo.itens && eixo.itens.some(i => i.id === itemId)) {
        return eixo;
      }
    }
    return null;
  },

  /**
   * Apaga todos os dados do localStorage e reinicia com formulário limpo
   */
  limparTodosOsDados() {
    if (confirm("Deseja realmente apagar todos os dados informados neste computador e reiniciar o formulário em branco?")) {
      try {
        localStorage.removeItem("pit_rit_dados_v5");
        localStorage.removeItem("pit_rit_dados_v4");
        localStorage.removeItem("pit_rit_dados_v3");
        localStorage.removeItem("pit_rit_dados_v2");
        localStorage.removeItem("pit_rit_dados_v1");
      } catch (e) {}
      window.location.reload();
    }
  },

  // ==========================================
  // MÓDULO DE AUTENTICAÇÃO E MODERAÇÃO ADMIN
  // ==========================================

  /**
   * Exibe o overlay modal de Login e Cadastro
   */
  mostrarAuthOverlay() {
    const overlay = document.getElementById("authOverlay");
    if (overlay) {
      overlay.classList.add("show");
    }
  },

  /**
   * Oculta o overlay modal de Login e Cadastro
   */
  fecharAuthOverlay() {
    const overlay = document.getElementById("authOverlay");
    if (overlay) {
      overlay.classList.remove("show");
    }
  },

  /**
   * Alterna entre a aba de Entrar e a de Solicitar Cadastro
   */
  alternarAuthTab(tab) {
    const tabLogin = document.getElementById("tabBtnLogin");
    const tabCadastro = document.getElementById("tabBtnCadastro");
    const formLogin = document.getElementById("formLogin");
    const formCadastro = document.getElementById("formCadastro");

    this.limparAuthAlert();

    if (tab === "login") {
      tabLogin?.classList.add("active");
      tabCadastro?.classList.remove("active");
      if (formLogin) formLogin.style.display = "block";
      if (formCadastro) formCadastro.style.display = "none";
      document.getElementById("loginId")?.focus();
    } else {
      tabLogin?.classList.remove("active");
      tabCadastro?.classList.add("active");
      if (formLogin) formLogin.style.display = "none";
      if (formCadastro) formCadastro.style.display = "block";
      document.getElementById("cadNome")?.focus();
    }
  },

  /**
   * Exibe mensagens de feedback na tela de login/cadastro
   */
  exibirAuthAlert(tipo, mensagem) {
    const alertBox = document.getElementById("authAlert");
    if (!alertBox) return;

    alertBox.className = `auth-alert auth-alert-${tipo}`;
    let icone = "ℹ️";
    if (tipo === "error") icone = "❌";
    if (tipo === "warning") icone = "⏳";
    if (tipo === "success") icone = "✅";

    alertBox.innerHTML = `<span>${icone}</span><div>${mensagem}</div>`;
    alertBox.style.display = "flex";
  },

  /**
   * Limpa o alerta da tela de login/cadastro
   */
  limparAuthAlert() {
    const alertBox = document.getElementById("authAlert");
    if (alertBox) {
      alertBox.style.display = "none";
      alertBox.innerHTML = "";
    }
  },

  /**
   * Processa a submissão do formulário de Login
   */
  async handleLogin(e) {
    e.preventDefault();
    this.limparAuthAlert();

    const idInput = document.getElementById("loginId");
    const senhaInput = document.getElementById("loginSenha");
    const lembrarInput = document.getElementById("loginLembrar");
    const btnSubmit = document.getElementById("btnLoginSubmit");

    const identificador = idInput?.value.trim();
    const senha = senhaInput?.value;
    const manter = lembrarInput ? lembrarInput.checked : true;

    if (!identificador || !senha) {
      this.exibirAuthAlert("error", "Informe seu E-mail ou SIAPE e sua senha.");
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Verificando credenciais...";
    }

    try {
      const resultado = await auth.login(identificador, senha);

      if (!resultado.success) {
        if (resultado.pendente) {
          this.exibirAuthAlert("warning", resultado.message);
        } else if (resultado.rejeitado) {
          this.exibirAuthAlert("error", resultado.message);
        } else {
          this.exibirAuthAlert("error", resultado.message || "Usuário ou senha inválidos.");
        }
        return;
      }

      // Login com sucesso!
      const usuario = resultado.usuario;
      this.fecharAuthOverlay();
      this.aplicarDadosUsuarioLogado(usuario);

      // Carrega automaticamente os dados lançados do docente
      await this.carregarDadosDocenteNuvem(usuario.siape);

      if (usuario.is_admin) {
        this.verificarPendenciasAdmin();
      }

      this.atualizarHeaderUsuario();
      this.navegarPara("identificacao");

      if (senhaInput) senhaInput.value = "";
    } catch (err) {
      console.error("Erro no login:", err);
      this.exibirAuthAlert("error", "Erro ao processar login: " + (err.message || err));
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Entrar no Sistema";
      }
    }
  },

  /**
   * Processa a solicitação de cadastro do docente
   */
  async handleCadastro(e) {
    e.preventDefault();
    this.limparAuthAlert();

    const nome = document.getElementById("cadNome")?.value.trim();
    const email = document.getElementById("cadEmail")?.value.trim();
    const siape = document.getElementById("cadSiape")?.value.trim();
    const regime = document.getElementById("cadRegime")?.value;
    const senha = document.getElementById("cadSenha")?.value;
    const senhaConf = document.getElementById("cadSenhaConf")?.value;
    const btnSubmit = document.getElementById("btnCadSubmit");

    if (!nome || !email || !siape || !senha) {
      this.exibirAuthAlert("error", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (senha.length < 6) {
      this.exibirAuthAlert("error", "A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== senhaConf) {
      this.exibirAuthAlert("error", "A confirmação de senha não confere.");
      return;
    }

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Enviando solicitação...";
    }

    try {
      const resp = await auth.cadastrarDocente({
        nome,
        email,
        siape,
        regime,
        unidade: "Instituto de Artes e Design (IAD)",
        senha
      });

      if (!resp.success) {
        this.exibirAuthAlert("error", resp.message);
        return;
      }

      // Sucesso no cadastro
      this.exibirAuthAlert("success", "<strong>Cadastro solicitado com sucesso!</strong><br>" + resp.message);

      // Limpa formulário de cadastro
      document.getElementById("formCadastro")?.reset();

      // Preenche o campo de login com o e-mail cadastrado e volta para a aba login após 3s
      const loginId = document.getElementById("loginId");
      if (loginId) loginId.value = email;

      setTimeout(() => {
        this.alternarAuthTab("login");
        this.exibirAuthAlert("warning", "Sua solicitação está em análise. Você poderá fazer login assim que a Secretaria aprovar.");
      }, 2500);

    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      this.exibirAuthAlert("error", "Erro ao realizar cadastro: " + (err.message || err));
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Solicitar Cadastro";
      }
    }
  },

  /**
   * Preenche credenciais da Secretaria para facilitar o acesso administrativo
   */
  preencherLoginAdmin() {
    this.alternarAuthTab("login");
    const loginId = document.getElementById("loginId");
    const loginSenha = document.getElementById("loginSenha");
    if (loginId) loginId.value = "admin@iad.ufjf.br";
    if (loginSenha) {
      loginSenha.value = "";
      loginSenha.focus();
    }
    this.exibirAuthAlert("info", "Acesso Secretaria: Digite a senha administrativa para entrar.");
  },

  /**
   * Abre o Painel Administrativo de Moderação de Cadastros
   */
  async abrirPainelAdmin() {
    const modal = document.getElementById("adminModal");
    if (modal) {
      modal.classList.add("show");
      await this.carregarUsuariosAdmin();
    }
  },

  /**
   * Fecha o Painel Administrativo de Moderação
   */
  fecharPainelAdmin() {
    const modal = document.getElementById("adminModal");
    if (modal) {
      modal.classList.remove("show");
    }
  },

  /**
   * Carrega e lista usuários cadastrados no Painel do Administrador
   */
  async carregarUsuariosAdmin() {
    const tbody = document.getElementById("tbodyAdminUsuarios");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          🔄 Carregando cadastros...
        </td>
      </tr>
    `;

    try {
      const usuarios = await auth.listarUsuarios();
      this.adminUsuariosCache = usuarios || [];
      this.atualizarContadoresAdmin(this.adminUsuariosCache);
      this.filtrarAdminUsuarios(this.adminFiltroAtual || "todos");
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--danger); padding: 2rem;">
            Erro ao carregar lista de usuários. Verifique o console.
          </td>
        </tr>
      `;
    }
  },

  /**
   * Atualiza os contadores de status do painel admin
   */
  atualizarContadoresAdmin(usuarios) {
    const total = usuarios.length;
    const pendentes = usuarios.filter(u => u.status === "pendente").length;
    const aprovados = usuarios.filter(u => u.status === "aprovado").length;
    const rejeitados = usuarios.filter(u => u.status === "rejeitado").length;

    const elTotal = document.getElementById("countTodos");
    const elPendentes = document.getElementById("countPendentes");
    const elAprovados = document.getElementById("countAprovados");
    const elRejeitados = document.getElementById("countRejeitados");
    const badgeHeader = document.getElementById("adminPendingBadge");

    if (elTotal) elTotal.textContent = total;
    if (elPendentes) elPendentes.textContent = pendentes;
    if (elAprovados) elAprovados.textContent = aprovados;
    if (elRejeitados) elRejeitados.textContent = rejeitados;

    if (badgeHeader) {
      if (pendentes > 0) {
        badgeHeader.style.display = "inline-flex";
        badgeHeader.textContent = pendentes;
      } else {
        badgeHeader.style.display = "none";
      }
    }
  },

  /**
   * Verifica em background se existem pendências para alertar o admin
   */
  async verificarPendenciasAdmin() {
    try {
      const usuarios = await auth.listarUsuarios();
      this.atualizarContadoresAdmin(usuarios);
    } catch (e) {}
  },

  /**
   * Filtra a visualização na tabela de administração
   */
  filtrarAdminUsuarios(filtro, btnEl) {
    this.adminFiltroAtual = filtro;

    if (btnEl) {
      document.querySelectorAll(".admin-stat-pill").forEach(p => p.classList.remove("active"));
      btnEl.classList.add("active");
    }

    const lista = this.adminUsuariosCache || [];
    let filtrados = lista;
    if (filtro !== "todos") {
      filtrados = lista.filter(u => u.status === filtro);
    }

    this.renderizarTabelaAdmin(filtrados);
  },

  /**
   * Renderiza a tabela de docentes no painel administrativo
   */
  renderizarTabelaAdmin(lista) {
    const tbody = document.getElementById("tbodyAdminUsuarios");
    if (!tbody) return;

    if (lista.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            Nenhum docente encontrado para o filtro selecionado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";
    lista.forEach(u => {
      const tr = document.createElement("tr");

      let badgeClass = "badge-status-pendente";
      let statusLabel = "⏳ Pendente";
      if (u.status === "aprovado") {
        badgeClass = "badge-status-aprovado";
        statusLabel = "✅ Aprovado";
      } else if (u.status === "rejeitado") {
        badgeClass = "badge-status-rejeitado";
        statusLabel = "❌ Rejeitado";
      }

      let acoesHtml = `
        <div class="admin-actions" style="justify-content: flex-end;">
      `;

      if (u.status !== "aprovado") {
        acoesHtml += `
          <button type="button" class="btn-admin-action btn-admin-approve" onclick="app.aprovarDocente('${u.id}')" title="Aprovar login deste docente">
            ✅ Aprovar
          </button>
        `;
      }

      if (u.status !== "rejeitado") {
        acoesHtml += `
          <button type="button" class="btn-admin-action btn-admin-reject" onclick="app.rejeitarDocente('${u.id}')" title="Rejeitar ou suspender login">
            ❌ Rejeitar
          </button>
        `;
      }

      if (!u.is_admin) {
        acoesHtml += `
          <button type="button" class="btn-admin-action btn-admin-delete" onclick="app.excluirDocente('${u.id}')" title="Excluir cadastro">
            🗑️
          </button>
        `;
      }

      acoesHtml += `</div>`;

      tr.innerHTML = `
        <td>
          <strong>${this.escaparHtml(u.nome)}</strong>
          ${u.is_admin ? '<span style="font-size: 0.7rem; background: #e0e7ff; color: #3730a3; padding: 1px 5px; border-radius: 4px; margin-left: 4px;">Admin</span>' : ''}
        </td>
        <td><code>${this.escaparHtml(u.siape)}</code></td>
        <td>${this.escaparHtml(u.email)}</td>
        <td>${this.escaparHtml(u.regime || "40_DE")}</td>
        <td><span class="badge-status ${badgeClass}">${statusLabel}</span></td>
        <td style="text-align: right;">${acoesHtml}</td>
      `;

      tbody.appendChild(tr);
    });
  },

  /**
   * Aprova um docente pelo ID
   */
  async aprovarDocente(userId) {
    if (!confirm("Deseja APROVAR o acesso deste docente?")) return;

    const userObj = (this.adminUsuariosCache || []).find(u => u.id === userId);
    const resp = await auth.aprovarUsuario(userId, userObj);
    if (resp.success) {
      await this.carregarUsuariosAdmin();
      alert("Docente aprovado com sucesso! O acesso está liberado.");
    } else {
      alert("Erro ao aprovar: " + (resp.message || "Tente novamente."));
    }
  },

  /**
   * Rejeita um docente pelo ID
   */
  async rejeitarDocente(userId) {
    if (!confirm("Deseja REJEITAR o acesso deste docente?")) return;

    const userObj = (this.adminUsuariosCache || []).find(u => u.id === userId);
    const resp = await auth.rejeitarUsuario(userId, userObj);
    if (resp.success) {
      await this.carregarUsuariosAdmin();
      alert("Cadastro do docente marcado como rejeitado.");
    } else {
      alert("Erro ao rejeitar: " + (resp.message || "Tente novamente."));
    }
  },

  /**
   * Exclui um docente pelo ID
   */
  async excluirDocente(userId) {
    if (!confirm("Tem certeza que deseja EXCLUIR este cadastro? Esta ação não pode ser desfeita.")) return;

    const resp = await auth.excluirUsuario(userId);
    if (resp.success) {
      await this.carregarUsuariosAdmin();
      alert("Cadastro excluído com sucesso.");
    } else {
      alert("Erro ao excluir: " + (resp.message || "Tente novamente."));
    }
  },

  /**
   * Função utilitária para sanitizar strings HTML
   */
  escaparHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

// Inicializa a aplicação assim que o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
