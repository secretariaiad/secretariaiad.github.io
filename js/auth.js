/**
 * auth.js - Sistema de Autenticação e Moderação de Acessos
 * Secretaria Virtual - IAD / UFJF
 */

const auth = {
  // Chave de armazenamento local para sessão
  SESSION_KEY: "pit_rit_usuario_logado_v1",
  FALLBACK_USERS_KEY: "pit_rit_usuarios_locais_v1",

  /**
   * Gera o hash SHA-256 da senha usando a Web Crypto API nativa do navegador
   */
  async hashSenha(senha) {
    if (!senha) return "";
    try {
      const msgUint8 = new TextEncoder().encode(senha.trim());
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      return hashHex;
    } catch (e) {
      // Fallback simples para ambientes sem subtle.digest (raro em navegadores modernos)
      let hash = 0;
      for (let i = 0; i < senha.length; i++) {
        hash = (hash << 5) - hash + senha.charCodeAt(i);
        hash |= 0;
      }
      return "fallback_" + Math.abs(hash);
    }
  },

  /**
   * Obtém a sessão do usuário logado atualmente
   */
  obterSessao() {
    try {
      const str = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
      if (str) {
        return JSON.parse(str);
      }
    } catch (e) {
      console.warn("Erro ao ler sessão:", e);
    }
    return null;
  },

  /**
   * Salva a sessão do usuário logado
   */
  salvarSessao(usuario, manterConectado = true) {
    try {
      const seguro = { ...usuario };
      delete seguro.senha_hash; // Nunca mantém o hash na sessão do navegador
      const json = JSON.stringify(seguro);
      sessionStorage.setItem(this.SESSION_KEY, json);
      if (manterConectado) {
        localStorage.setItem(this.SESSION_KEY, json);
      }
    } catch (e) {
      console.warn("Erro ao salvar sessão:", e);
    }
  },

  /**
   * Encerra a sessão atual (Logout)
   */
  logout() {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.SESSION_KEY);
    } catch (e) {}
    window.location.reload();
  },

  /**
   * Recupera lista de usuários locais de contingência
   */
  _obterUsuariosLocais() {
    try {
      const dados = localStorage.getItem(this.FALLBACK_USERS_KEY);
      return dados ? JSON.parse(dados) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Salva lista de usuários locais de contingência
   */
  _salvarUsuariosLocais(lista) {
    try {
      localStorage.setItem(this.FALLBACK_USERS_KEY, JSON.stringify(lista));
    } catch (e) {}
  },

  /**
   * Realiza o cadastro de um novo docente (status inicial: pendente)
   */
  async cadastrarDocente(dados) {
    const { nome, email, siape, regime, unidade, senha } = dados;

    if (!nome || !email || !siape || !senha) {
      return { success: false, message: "Todos os campos obrigatórios devem ser preenchidos." };
    }

    const emailLimpo = email.trim().toLowerCase();
    const siapeLimpo = siape.trim();
    const senhaHash = await this.hashSenha(senha);

    // 1. Tenta salvar no Supabase
    if (supabaseClient) {
      try {
        // Verifica se já existe email ou siape
        const { data: existente, error: errBusca } = await supabaseClient
          .from("pit_rit_usuarios")
          .select("id, email, siape")
          .or(`email.eq.${emailLimpo},siape.eq.${siapeLimpo}`);

        if (errBusca && errBusca.code !== "PGRST205") {
          console.warn("Aviso ao buscar usuários no Supabase:", errBusca);
        }

        if (existente && existente.length > 0) {
          return {
            success: false,
            message: "Já existe um cadastro com este E-mail ou Matrícula SIAPE no sistema."
          };
        }

        // Insere novo usuário com status 'pendente'
        const novoDocente = {
          nome: nome.trim(),
          email: emailLimpo,
          siape: siapeLimpo,
          senha_hash: senhaHash,
          regime: regime || "40_DE",
          unidade: unidade || "Instituto de Artes e Design (IAD)",
          cargo: "Docente",
          status: "pendente",
          is_admin: false
        };

        const { data: inserido, error: errInsert } = await supabaseClient
          .from("pit_rit_usuarios")
          .insert(novoDocente)
          .select();

        if (errInsert) {
          // Se a tabela ainda não tiver sido criada no Supabase, usa contingência local
          if (errInsert.code === "PGRST205") {
            return this._cadastrarLocalmente(novoDocente);
          }
          throw errInsert;
        }

        return {
          success: true,
          message: "Cadastro realizado com sucesso! Sua solicitação foi enviada e está aguardando aprovação pelo administrador. Assim que for liberada, você poderá fazer o login normalmente."
        };
      } catch (err) {
        console.error("Erro ao cadastrar no Supabase, tentando local:", err);
        return this._cadastrarLocalmente({
          nome: nome.trim(),
          email: emailLimpo,
          siape: siapeLimpo,
          senha_hash: senhaHash,
          regime: regime || "40_DE",
          unidade: unidade || "Instituto de Artes e Design (IAD)",
          cargo: "Docente",
          status: "pendente",
          is_admin: false
        });
      }
    } else {
      return this._cadastrarLocalmente({
        nome: nome.trim(),
        email: emailLimpo,
        siape: siapeLimpo,
        senha_hash: senhaHash,
        regime: regime || "40_DE",
        unidade: unidade || "Instituto de Artes e Design (IAD)",
        cargo: "Docente",
        status: "pendente",
        is_admin: false
      });
    }
  },

  /**
   * Fallback de cadastro no localStorage quando o Supabase ainda não tem a tabela
   */
  _cadastrarLocalmente(docente) {
    const locais = this._obterUsuariosLocais();
    const jaExiste = locais.find(u => u.email === docente.email || u.siape === docente.siape);
    if (jaExiste) {
      return { success: false, message: "Já existe um cadastro com este E-mail ou SIAPE." };
    }
    docente.id = "local_" + Date.now();
    docente.created_at = new Date().toISOString();
    locais.push(docente);
    this._salvarUsuariosLocais(locais);

    return {
      success: true,
      message: "Cadastro realizado com sucesso! Sua conta está aguardando aprovação pelo administrador."
    };
  },

  /**
   * Realiza a autenticação de login
   */
  async login(identificador, senha) {
    if (!identificador || !senha) {
      return { success: false, message: "Preencha seu E-mail/SIAPE e a Senha." };
    }

    const idLimpo = identificador.trim().toLowerCase();
    const senhaHash = await this.hashSenha(senha);

    // Verifica se é o Administrador padrão da Secretaria IAD
    const hashAdminPadrao = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"; // "admin123"
    if ((idLimpo === "admin@iad.ufjf.br" || idLimpo === "admin" || idLimpo === "admin01") && (senhaHash === hashAdminPadrao || senha === "admin123" || senha === "iad@ufjf2025")) {
      const adminUser = {
        id: "admin-secretaria-iad",
        nome: "Administrador - Secretaria IAD",
        email: "admin@iad.ufjf.br",
        siape: "ADMIN01",
        regime: "40_DE",
        unidade: "Secretaria IAD",
        status: "aprovado",
        is_admin: true
      };
      this.salvarSessao(adminUser);
      return { success: true, usuario: adminUser };
    }

    // 1. Busca no Supabase
    let usuarioEncontrado = null;
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from("pit_rit_usuarios")
          .select("*")
          .or(`email.ilike.${idLimpo},siape.eq.${identificador.trim()}`)
          .limit(1);

        if (!error && data && data.length > 0) {
          usuarioEncontrado = data[0];
        }
      } catch (e) {
        console.warn("Erro ao buscar login no Supabase:", e);
      }
    }

    // 2. Se não encontrou no Supabase, tenta local
    if (!usuarioEncontrado) {
      const locais = this._obterUsuariosLocais();
      usuarioEncontrado = locais.find(u => u.email === idLimpo || u.siape === identificador.trim());
    }

    if (!usuarioEncontrado) {
      return {
        success: false,
        message: "Usuário não encontrado. Verifique seu E-mail/SIAPE ou realize seu primeiro cadastro."
      };
    }

    // Valida senha
    if (usuarioEncontrado.senha_hash !== senhaHash) {
      return { success: false, message: "Senha incorreta. Tente novamente." };
    }

    // Valida Status de Aprovação
    if (usuarioEncontrado.status === "pendente") {
      return {
        success: false,
        pendente: true,
        message: "Seu cadastro foi realizado, mas ainda está AGUARDANDO APROVAÇÃO do administrador. Por favor, aguarde a liberação pela Secretaria do IAD."
      };
    }

    if (usuarioEncontrado.status === "rejeitado") {
      return {
        success: false,
        rejeitado: true,
        message: "Seu cadastro foi recusado pelo administrador. Em caso de dúvidas, entre em contato com a Secretaria do IAD."
      };
    }

    if (usuarioEncontrado.status !== "aprovado") {
      return {
        success: false,
        message: "Acesso indisponível. Status atual: " + usuarioEncontrado.status
      };
    }

    // Login aprovado com sucesso!
    this.salvarSessao(usuarioEncontrado);
    return { success: true, usuario: usuarioEncontrado };
  },

  /**
   * Lista todos os usuários cadastrados (para o painel administrativo)
   */
  async listarUsuarios() {
    let lista = [];

    // Tenta obter do Supabase
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from("pit_rit_usuarios")
          .select("id, nome, email, siape, regime, unidade, cargo, status, is_admin, created_at, updated_at")
          .order("created_at", { ascending: false });

        if (!error && data) {
          lista = data;
        }
      } catch (e) {
        console.warn("Erro ao listar usuários do Supabase:", e);
      }
    }

    // Mescla com locais se houver
    const locais = this._obterUsuariosLocais();
    locais.forEach(loc => {
      if (!lista.some(u => u.email === loc.email || u.siape === loc.siape)) {
        lista.push(loc);
      }
    });

    return lista;
  },

  /**
   * Aprova o cadastro de um docente
   */
  async aprovarUsuario(userId, usuarioCache = null) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from("pit_rit_usuarios")
          .update({ status: "aprovado", updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (!error) return { success: true };
        console.warn("Erro ao aprovar no Supabase:", error);
      } catch (e) {
        console.warn("Erro ao aprovar no Supabase:", e);
      }
    }

    // Fallback: atualiza localmente
    const locais = this._obterUsuariosLocais();
    const idx = locais.findIndex(u => u.id === userId);
    if (idx !== -1) {
      locais[idx].status = "aprovado";
      locais[idx].updated_at = new Date().toISOString();
      this._salvarUsuariosLocais(locais);
      return { success: true };
    }

    return { success: false, message: "Não foi possível atualizar o status no banco de dados." };
  },

  /**
   * Rejeita o cadastro de um docente
   */
  async rejeitarUsuario(userId, usuarioCache = null) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from("pit_rit_usuarios")
          .update({ status: "rejeitado", updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (!error) return { success: true };
        console.warn("Erro ao rejeitar no Supabase:", error);
      } catch (e) {
        console.warn("Erro ao rejeitar no Supabase:", e);
      }
    }

    // Fallback: atualiza localmente
    const locais = this._obterUsuariosLocais();
    const idx = locais.findIndex(u => u.id === userId);
    if (idx !== -1) {
      locais[idx].status = "rejeitado";
      locais[idx].updated_at = new Date().toISOString();
      this._salvarUsuariosLocais(locais);
      return { success: true };
    }

    return { success: false, message: "Não foi possível atualizar o status." };
  },

  /**
   * Exclui o cadastro de um docente
   */
  async excluirUsuario(userId) {
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from("pit_rit_usuarios")
          .delete()
          .eq("id", userId);

        if (!error) return { success: true };
      } catch (e) {
        console.warn("Erro ao excluir no Supabase:", e);
      }
    }

    let locais = this._obterUsuariosLocais();
    locais = locais.filter(u => u.id !== userId);
    this._salvarUsuariosLocais(locais);
    return { success: true };
  }
};
