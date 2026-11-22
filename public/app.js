// Estado global do aplicativo
let lotes = [];
let loteAtual = null;

// Presets inteligentes para animais típicos do Nordeste
const PRESETS_ANIMAIS = {
  bovino: {
    categoria: "bovino",
    icone: "🐂",
    nome: "Lote - Garrotes Nelore / Sertanejo",
    raca: "Nelore / Mestiço Zebu",
    qtd: 6,
    dias: 120,
    compra: 2600.00,
    frete: 500.00,
    modoVenda: "cabeca",
    pesoAbate: 510,
    precoArroba: 245.00,
    precoKgVivo: 12.50,
    precoKgCarcaca: 23.00,
    vendaCabeca: 4450.00
  },
  suino: {
    categoria: "suino",
    icone: "🐖",
    nome: "Lote - Porcos Caipiras de Engorda",
    raca: "Porco Caipira / Moura x Piau",
    qtd: 10,
    dias: 90,
    compra: 280.00,
    frete: 150.00,
    modoVenda: "kg_vivo",
    pesoAbate: 105,
    precoArroba: 0,
    precoKgVivo: 10.50,
    precoKgCarcaca: 15.00,
    vendaCabeca: 1100.00
  },
  ovino: {
    categoria: "ovino",
    icone: "🐑",
    nome: "Lote - Carneiros Santa Inês",
    raca: "Santa Inês Puro e Mestiço",
    qtd: 15,
    dias: 75,
    compra: 220.00,
    frete: 180.00,
    modoVenda: "cabeca",
    pesoAbate: 40,
    precoArroba: 0,
    precoKgVivo: 13.50,
    precoKgCarcaca: 28.00,
    vendaCabeca: 540.00
  },
  caprino: {
    categoria: "caprino",
    icone: "🐐",
    nome: "Lote - Bodes / Cabritos Moxotó",
    raca: "Moxotó / Boer / SRD Sertanejo",
    qtd: 12,
    dias: 80,
    compra: 190.00,
    frete: 120.00,
    modoVenda: "cabeca",
    pesoAbate: 35,
    precoArroba: 0,
    precoKgVivo: 12.00,
    precoKgCarcaca: 25.00,
    vendaCabeca: 480.00
  },
  avicola: {
    categoria: "avicola",
    icone: "🐓",
    nome: "Lote - Frango Caipira e Capoeira",
    raca: "Pescoço Pelado / Caipira Melhorado",
    qtd: 50,
    dias: 80,
    compra: 5.00,
    frete: 50.00,
    modoVenda: "cabeca",
    pesoAbate: 2.8,
    precoArroba: 0,
    precoKgVivo: 14.00,
    precoKgCarcaca: 18.00,
    vendaCabeca: 50.00
  },
  outro: {
    categoria: "outro",
    icone: "🐾",
    nome: "Novo Lote de Animais",
    raca: "Personalizada",
    qtd: 10,
    dias: 90,
    compra: 300.00,
    frete: 100.00,
    modoVenda: "cabeca",
    pesoAbate: 50,
    precoArroba: 0,
    precoKgVivo: 12.00,
    precoKgCarcaca: 20.00,
    vendaCabeca: 600.00
  }
};

// Formatação monetária em Reais
function fmt(val) {
  return (Number(val) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formatação de data BR
function fmtData(str) {
  if (!str) return '-';
  const parts = str.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return str;
}

// ==========================================
// GERENCIAMENTO DE AUTENTICAÇÃO E MULTI-USUÁRIO
// ==========================================
const AUTH_TOKEN_KEY = 'agrolote_auth_token';
const AUTH_USER_KEY = 'agrolote_usuario';
let usuarioAtual = null;

function obterToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function salvarSessao(token, usuario) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  if (usuario) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario));
  usuarioAtual = usuario;
  atualizarUIAuth();
}

function limparSessao() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  usuarioAtual = null;
  atualizarUIAuth();
}

function recuperarSessaoLocal() {
  try {
    const usrStr = localStorage.getItem(AUTH_USER_KEY);
    if (usrStr) usuarioAtual = JSON.parse(usrStr);
  } catch (e) {
    usuarioAtual = null;
  }
}

// Wrapper do fetch com cabeçalho de autenticação Bearer
async function authFetch(url, options = {}) {
  const token = obterToken();
  const headers = options.headers ? { ...options.headers } : {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = { ...options, headers };
  const res = await fetch(url, config);
  if (res.status === 401 && token) {
    limparSessao();
    await carregarLotes();
  }
  return res;
}

// Atualizar elementos visuais de autenticação na página
function atualizarUIAuth() {
  const divDeslogado = document.getElementById('nav-auth-deslogado');
  const divLogado = document.getElementById('nav-auth-logado');
  const spanNome = document.getElementById('nav-user-nome');
  const bannerVisitante = document.getElementById('banner-visitante');

  const drawerDeslogado = document.getElementById('drawer-auth-deslogado');
  const drawerLogado = document.getElementById('drawer-auth-logado');
  const drawerNome = document.getElementById('drawer-user-nome');

  if (usuarioAtual && obterToken()) {
    if (divDeslogado) divDeslogado.classList.add('hidden');
    if (divLogado) {
      divLogado.classList.remove('hidden');
      divLogado.classList.add('flex');
    }
    if (spanNome) spanNome.textContent = usuarioAtual.nome || 'Minha Fazenda';
    if (bannerVisitante) bannerVisitante.classList.add('hidden');

    if (drawerDeslogado) drawerDeslogado.classList.add('hidden');
    if (drawerLogado) drawerLogado.classList.remove('hidden');
    if (drawerNome) drawerNome.textContent = usuarioAtual.nome || 'Minha Fazenda';
  } else {
    if (divDeslogado) divDeslogado.classList.remove('hidden');
    if (divLogado) {
      divLogado.classList.add('hidden');
      divLogado.classList.remove('flex');
    }
    if (bannerVisitante) bannerVisitante.classList.remove('hidden');

    if (drawerDeslogado) drawerDeslogado.classList.remove('hidden');
    if (drawerLogado) drawerLogado.classList.add('hidden');
  }
}


// Abrir e fechar modal de auth
function abrirModalAuth(aba = 'login') {
  const modal = document.getElementById('modal-auth');
  if (!modal) return;
  alternarAbaAuth(aba);
  limparMensagemAuth();
  modal.classList.remove('hidden');
}

function fecharModalAuth() {
  const modal = document.getElementById('modal-auth');
  if (modal) modal.classList.add('hidden');
  limparMensagemAuth();
}

function alternarAbaAuth(aba) {
  const tabLogin = document.getElementById('tab-btn-login');
  const tabCad = document.getElementById('tab-btn-cadastro');
  const formLogin = document.getElementById('form-login');
  const formCad = document.getElementById('form-cadastro');
  const tit = document.getElementById('auth-modal-titulo');
  const sub = document.getElementById('auth-modal-subtitulo');
  limparMensagemAuth();

  if (aba === 'cadastro') {
    tabCad.className = "flex-1 py-2 text-center rounded-lg bg-white text-slate-900 shadow-sm transition-all";
    tabLogin.className = "flex-1 py-2 text-center rounded-lg text-emerald-200 hover:text-white transition-all";
    formCad.classList.remove('hidden');
    formLogin.classList.add('hidden');
    if (tit) tit.textContent = "Criar Minha Planilha Grátis";
    if (sub) sub.textContent = "Comece agora a controlar seus lotes de animais de forma independente";
  } else {
    tabLogin.className = "flex-1 py-2 text-center rounded-lg bg-white text-slate-900 shadow-sm transition-all";
    tabCad.className = "flex-1 py-2 text-center rounded-lg text-emerald-200 hover:text-white transition-all";
    formLogin.classList.remove('hidden');
    formCad.classList.add('hidden');
    if (tit) tit.textContent = "Minha Conta AgroLote";
    if (sub) sub.textContent = "Acesse sua planilha online exclusiva de animais e custos";
  }
}

function exibirMensagemAuth(tipo, texto) {
  const box = document.getElementById('auth-mensagem');
  if (!box) return;
  box.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
  if (tipo === 'erro') {
    box.classList.add('bg-red-50', 'text-red-700', 'border-red-200');
    box.innerHTML = `⚠️ ${texto}`;
  } else {
    box.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
    box.innerHTML = `✓ ${texto}`;
  }
}

function limparMensagemAuth() {
  const box = document.getElementById('auth-mensagem');
  if (box) {
    box.classList.add('hidden');
    box.innerHTML = '';
  }
}

async function submeterLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  const btn = document.getElementById('btn-submit-login');

  if (!email || !senha) {
    exibirMensagemAuth('erro', 'Por favor, preencha seu e-mail e senha.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span>Entrando...</span>`;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (data.success && data.token) {
      salvarSessao(data.token, data.usuario);
      exibirMensagemAuth('sucesso', `Bem-vindo de volta, <strong>${data.usuario.nome}</strong>! Carregando sua planilha...`);
      setTimeout(async () => {
        fecharModalAuth();
        await carregarLotes();
      }, 700);
    } else {
      exibirMensagemAuth('erro', data.message || 'E-mail ou senha inválidos.');
    }
  } catch (err) {
    exibirMensagemAuth('erro', 'Erro de conexão com o servidor. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>Entrar na Minha Planilha</span> →`;
  }
}

// Validação de permissão de escrita (Modo Demonstração vs Usuário Cadastrado)
function verificarPermissaoEscrita(acaoDesc = "realizar esta ação") {
  if (!usuarioAtual || !obterToken()) {
    abrirModalAuth('cadastro');
    exibirMensagemAuth('erro', `🔒 <strong>Modo Demonstração (Somente Leitura):</strong><br>Para ${acaoDesc}, crie sua conta utilizando seu código de convite!`);
    return false;
  }
  return true;
}

async function submeterCadastro(e) {
  e.preventDefault();
  const nome = document.getElementById('cadastro-nome').value.trim();
  const email = document.getElementById('cadastro-email').value.trim();
  const senha = document.getElementById('cadastro-senha').value;
  const animalPrincipal = document.getElementById('cadastro-animal').value;
  const codigoConvite = document.getElementById('cadastro-codigo').value.trim();
  const btn = document.getElementById('btn-submit-cadastro');

  if (!nome || !email || !senha) {
    exibirMensagemAuth('erro', 'Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  if (!codigoConvite) {
    exibirMensagemAuth('erro', '🔑 O Código de Convite é obrigatório para liberar seu cadastro. Solicite seu código ao administrador.');
    document.getElementById('cadastro-codigo').focus();
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span>Validando código e criando conta...</span>`;

  try {
    const res = await fetch('/api/auth/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, animalPrincipal, codigoConvite })
    });
    const data = await res.json();
    if (data.success && data.token) {
      salvarSessao(data.token, data.usuario);
      exibirMensagemAuth('sucesso', `🎉 Parabéns, <strong>${data.usuario.nome}</strong>! Código autorizado e conta liberada com sucesso!`);
      setTimeout(async () => {
        fecharModalAuth();
        await carregarLotes();
      }, 900);
    } else {
      exibirMensagemAuth('erro', data.message || 'Código de convite inválido ou erro no cadastro.');
    }
  } catch (err) {
    exibirMensagemAuth('erro', 'Erro de conexão com o servidor. Tente novamente.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>⭐ Criar Minha Conta com Código</span>`;
  }
}

async function fazerLogout() {
  if (!confirm('Deseja realmente sair da sua conta?')) return;
  try {
    await authFetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  limparSessao();
  localStorage.removeItem('loteSelecionadoId');
  await carregarLotes();
}

// ==========================================
// GERENCIADOR DE CÓDIGOS DE CONVITE (ADMIN)
// ==========================================
function abrirModalConvites() {
  const modal = document.getElementById('modal-convites');
  if (!modal) return;
  modal.classList.remove('hidden');
  carregarConvites();
}

function fecharModalConvites() {
  const modal = document.getElementById('modal-convites');
  if (modal) modal.classList.add('hidden');
}

async function carregarConvites() {
  const container = document.getElementById('lista-convites-container');
  const badge = document.getElementById('convites-total-badge');
  if (!container) return;

  container.innerHTML = '<div class="text-xs text-slate-500 py-3 text-center">Carregando códigos...</div>';

  try {
    const res = await fetch('/api/convites');
    const data = await res.json();
    if (data.success && data.convites) {
      if (badge) badge.textContent = `${data.convites.length} códigos ativos`;
      container.innerHTML = '';
      data.convites.forEach(c => {
        const item = document.createElement('div');
        item.className = "bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-2";
        item.innerHTML = `
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-sm text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                ${c.codigo}
              </span>
              <span class="text-[10px] ${c.totalUsos > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'} font-semibold px-2 py-0.5 rounded-full">
                ${c.totalUsos} de ${c.maxUsos} usados
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">${c.descricao || 'Código de liberação'}</p>
          </div>
          <button onclick="copiarConvite('${c.codigo}')" class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 flex items-center gap-1 transition-colors whitespace-nowrap" title="Copiar código para enviar">
            <span>📋</span> Copiar
          </button>
        `;
        container.appendChild(item);
      });
    }
  } catch (err) {
    container.innerHTML = '<div class="text-xs text-red-500 py-3 text-center">Erro ao carregar códigos.</div>';
  }
}

async function submeterNovoConvite(e) {
  e.preventDefault();
  const inputCod = document.getElementById('novo-convite-codigo');
  const inputMax = document.getElementById('novo-convite-max');
  const inputDesc = document.getElementById('novo-convite-desc');

  const codigo = inputCod.value.trim().toUpperCase();
  const maxUsos = Number(inputMax.value) || 50;
  const descricao = inputDesc.value.trim();

  if (!codigo) return;

  try {
    const res = await fetch('/api/convites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, maxUsos, descricao })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Código ${codigo} criado com sucesso!`);
      inputCod.value = '';
      inputDesc.value = '';
      await carregarConvites();
    } else {
      alert(data.message || 'Erro ao criar código.');
    }
  } catch (err) {
    alert('Erro ao conectar com o servidor.');
  }
}

function copiarConvite(codigo) {
  const mensagem = `Olá! Aqui está o seu código exclusivo para se cadastrar na plataforma de Contabilidade Pecuária: *${codigo}*\n\nAcesse o sistema e digite este código na tela de cadastro para liberar sua planilha!`;
  navigator.clipboard.writeText(mensagem).then(() => {
    alert(`Código "${codigo}" e mensagem copiados com sucesso!\n\nAgora você pode colar e enviar no WhatsApp do produtor.`);
  }).catch(() => {
    prompt('Copie o código abaixo:', codigo);
  });
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const hoje = new Date().toISOString().split('T')[0];
  const inputRacaoData = document.getElementById('racao-data');
  const inputMedData = document.getElementById('med-data');
  const inputNovoData = document.getElementById('novo-lote-data');
  if (inputRacaoData) inputRacaoData.value = hoje;
  if (inputMedData) inputMedData.value = hoje;
  if (inputNovoData) inputNovoData.value = hoje;

  recuperarSessaoLocal();
  atualizarUIAuth();
  carregarLotes();
});

// Carregar lista de lotes da API (isolada por usuário)
async function carregarLotes() {
  try {
    const res = await authFetch('/api/lotes');
    const data = await res.json();
    if (data.usuario && (!usuarioAtual || usuarioAtual.id !== data.usuario.id)) {
      usuarioAtual = data.usuario;
      atualizarUIAuth();
    }
    if (data.success && data.lotes && data.lotes.length > 0) {
      lotes = data.lotes;
      const idSalvo = localStorage.getItem('loteSelecionadoId');
      const loteEncontrado = lotes.find(l => l.id === idSalvo) || lotes[0];
      atualizarSelectLotes(loteEncontrado.id);
      renderLote(loteEncontrado);
    } else {
      lotes = [];
      loteAtual = null;
      const select = document.getElementById('select-lote');
      if (select) select.innerHTML = '<option value="">Nenhum lote cadastrado</option>';
      const tit = document.getElementById('lote-titulo');
      if (tit) tit.textContent = 'Nenhum lote cadastrado';
      const sub = document.getElementById('lote-subtitulo');
      if (sub) sub.textContent = 'Clique em "+ Novo Lote" para cadastrar seu primeiro lote de animais.';
    }
  } catch (err) {
    console.error('Erro ao conectar com a API:', err);
  }
}

// Atualizar o dropdown de seleção de lotes
function atualizarSelectLotes(idSelecionado) {
  const select = document.getElementById('select-lote');
  select.innerHTML = '';
  lotes.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    const icone = l.icone || (l.categoria === 'suino' ? '🐖' : l.categoria === 'ovino' ? '🐑' : l.categoria === 'caprino' ? '🐐' : l.categoria === 'avicola' ? '🐓' : '🐂');
    opt.textContent = `${icone} ${l.nome} (${l.qtdAnimais} cab)`;
    if (l.id === idSelecionado) opt.selected = true;
    select.appendChild(opt);
  });
}

// Trocar de lote
async function trocarLote(id) {
  if (!id) return;
  try {
    const res = await authFetch(`/api/lotes/${id}`);
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('loteSelecionadoId', id);
      renderLote(data.lote);
    }
  } catch (err) {
    console.error('Erro ao buscar lote:', err);
  }
}

// Filtrar lote existente da categoria ou abrir modal já com ela preenchida
function filtrarOuCriar(categoria) {
  const loteExistente = lotes.find(l => l.categoria === categoria);
  if (loteExistente) {
    document.getElementById('select-lote').value = loteExistente.id;
    trocarLote(loteExistente.id);
  } else {
    abrirModalNovoLote();
    aplicarPresetAnimal(categoria);
  }
}

// Renderizar todos os dados do lote ativo na tela
function renderLote(lote) {
  loteAtual = lote;
  const t = lote.totais || {};
  const icone = lote.icone || '🐂';

  // Ícones e badges de cabeçalho
  document.getElementById('nav-animal-icone').textContent = icone;
  document.getElementById('lote-icone-badge').textContent = icone;
  document.getElementById('lote-titulo').textContent = lote.nome;
  document.getElementById('lote-especie-badge').textContent = lote.especie || 'Animais';
  document.getElementById('lote-subtitulo').textContent = `${lote.racaPredominante ? lote.racaPredominante + ' • ' : ''}${lote.qtdAnimais} cabeças • Ciclo de ${lote.diasCiclo} dias`;
  
  const statusBadge = document.getElementById('lote-status-badge');
  if (lote.status === 'finalizado') {
    statusBadge.textContent = 'Abate Concluído';
    statusBadge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
  } else {
    statusBadge.textContent = 'Em Engorda (Ativo)';
    statusBadge.className = 'px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800';
  }

  // Barra de progresso dos dias
  const diasDecorridos = t.diasDecorridos || 0;
  const diasCiclo = lote.diasCiclo || 120;
  const pct = Math.min(100, Math.round((diasDecorridos / diasCiclo) * 100));
  document.getElementById('txt-progresso-dias').textContent = `Dia ${diasDecorridos} de ${diasCiclo} dias`;
  document.getElementById('txt-progresso-pct').textContent = `${pct}%`;
  document.getElementById('barra-progresso').style.width = `${pct}%`;
  document.getElementById('txt-data-entrada').textContent = `Início: ${fmtData(lote.dataEntrada)}`;
  document.getElementById('txt-data-abate').textContent = `Abate: ${fmtData(lote.dataPrevistaAbate)}`;

  // Cards de Métricas Principais (KPIs)
  document.getElementById('card-custo-total').textContent = fmt(t.custoTotalAcumulado);
  document.getElementById('card-custo-cabeca').textContent = `${fmt(t.custoPorCabeca)} / animal`;

  document.getElementById('card-total-racao').textContent = fmt(t.totalRacao);
  document.getElementById('card-diaria-cabeca').textContent = `${fmt(t.custoDiariaCabeca)} / dia`;

  document.getElementById('card-total-med').textContent = fmt(t.totalMedicamentos);
  const custoMedCabeca = (t.totalMedicamentos || 0) / (lote.qtdAnimais || 1);
  document.getElementById('card-med-cabeca').textContent = `${fmt(custoMedCabeca)} / animal`;

  const cardLucro = document.getElementById('card-lucro-total');
  cardLucro.textContent = fmt(t.lucroLiquidoTotal);
  if (t.lucroLiquidoTotal >= 0) {
    cardLucro.className = "text-2xl sm:text-3xl font-black text-emerald-700 mt-1";
  } else {
    cardLucro.className = "text-2xl sm:text-3xl font-black text-rose-700 mt-1";
  }
  document.getElementById('card-lucro-cabeca').textContent = `${fmt(t.lucroLiquidoPorCabeca)} / animal`;

  // Renderizar tabelas e relatórios
  renderTabelasDespesas();
  renderDRE();
  renderTabelaAnimais();
  renderRelatorios();
}

// Renderizar tabelas de Ração e Medicamentos
function renderTabelasDespesas() {
  if (!loteAtual) return;
  const despesas = loteAtual.despesas || [];

  // Tabela Ração
  const isVisitante = !usuarioAtual || !obterToken();
  const racaos = despesas.filter(d => d.tipo === 'racao');
  const tbodyRacao = document.getElementById('tabela-racao-body');
  tbodyRacao.innerHTML = '';
  racaos.forEach(d => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition-colors";
    tr.innerHTML = `
      <td class="p-3 font-medium text-slate-700">${fmtData(d.data)}</td>
      <td class="p-3">
        <div class="font-bold text-slate-800">${d.descricao}</div>
        ${d.obs ? `<div class="text-[11px] text-slate-400">${d.obs}</div>` : ''}
      </td>
      <td class="p-3 text-center text-slate-600 font-medium">${d.qtd} ${d.unidade || 'un'}</td>
      <td class="p-3 text-right font-bold text-amber-700">${fmt(d.valorTotal)}</td>
      <td class="p-3 text-center">
        ${isVisitante 
          ? `<span title="Modo Demonstração (Somente Leitura)" class="text-slate-400 text-xs">🔒</span>`
          : `<button onclick="removerDespesa('${d.id}')" title="Excluir" class="text-rose-500 hover:text-rose-700 font-bold p-1">✕</button>`
        }
      </td>
    `;
    tbodyRacao.appendChild(tr);
  });
  const totalRacao = racaos.reduce((acc, d) => acc + Number(d.valorTotal), 0);
  document.getElementById('badge-total-racao').textContent = `Total: ${fmt(totalRacao)}`;

  // Tabela Medicamentos
  const meds = despesas.filter(d => d.tipo === 'medicamento');
  const tbodyMed = document.getElementById('tabela-med-body');
  tbodyMed.innerHTML = '';
  meds.forEach(d => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition-colors";
    tr.innerHTML = `
      <td class="p-3 font-medium text-slate-700">${fmtData(d.data)}</td>
      <td class="p-3">
        <div class="font-bold text-slate-800">${d.descricao}</div>
        ${d.obs ? `<div class="text-[11px] text-slate-400">${d.obs}</div>` : ''}
      </td>
      <td class="p-3 text-center text-slate-600 font-medium">${d.unidade || d.qtd + ' doses'}</td>
      <td class="p-3 text-right font-bold text-blue-700">${fmt(d.valorTotal)}</td>
      <td class="p-3 text-center">
        ${isVisitante 
          ? `<span title="Modo Demonstração (Somente Leitura)" class="text-slate-400 text-xs">🔒</span>`
          : `<button onclick="removerDespesa('${d.id}')" title="Excluir" class="text-rose-500 hover:text-rose-700 font-bold p-1">✕</button>`
        }
      </td>
    `;
    tbodyMed.appendChild(tr);
  });
  const totalMed = meds.reduce((acc, d) => acc + Number(d.valorTotal), 0);
  document.getElementById('badge-total-med').textContent = `Total: ${fmt(totalMed)}`;
}

// Renderizar DRE e campos de fechamento
function renderDRE() {
  if (!loteAtual) return;
  const t = loteAtual.totais || {};
  const totalAnimais = loteAtual.qtdAnimais || 1;

  // Quantidade de animais para venda
  const inputQtdVenda = document.getElementById('fechamento-qtd-venda');
  inputQtdVenda.value = loteAtual.qtdVendida || totalAnimais;
  inputQtdVenda.max = totalAnimais;
  document.getElementById('txt-qtd-total-lote').textContent = `Total no Lote: ${totalAnimais} animais`;

  // Preencher formulário de fechamento
  document.getElementById('fechamento-modo-venda').value = loteAtual.modoVenda || 'cabeca';
  document.getElementById('fechamento-venda-cabeca').value = loteAtual.vendaPorCabecaEstimada || (loteAtual.categoria === 'suino' ? 1100 : loteAtual.categoria === 'ovino' ? 540 : 4450);
  document.getElementById('fechamento-peso-vivo').value = loteAtual.pesoVivoMedioKg || 510;
  document.getElementById('fechamento-preco-arroba').value = loteAtual.precoArroba || 245;
  document.getElementById('fechamento-peso-vivo-kg').value = loteAtual.pesoVivoMedioKg || (loteAtual.categoria === 'suino' ? 105 : loteAtual.categoria === 'ovino' ? 40 : 510);
  document.getElementById('fechamento-preco-kg-vivo').value = loteAtual.precoKgVivo || (loteAtual.categoria === 'suino' ? 10.50 : loteAtual.categoria === 'ovino' ? 13.50 : 12.00);
  document.getElementById('fechamento-peso-carcaca-vivo').value = loteAtual.pesoVivoMedioKg || 100;
  document.getElementById('fechamento-rendimento-pct').value = loteAtual.rendimentoCarcaçaPct || (loteAtual.categoria === 'suino' ? 74 : loteAtual.categoria === 'ovino' ? 48 : 54);
  document.getElementById('fechamento-preco-kg-carcaca').value = loteAtual.precoKgCarcaca || 20.00;
  document.getElementById('fechamento-frete-abate').value = loteAtual.freteAbate || 0;

  alterarModoVendaFrontend();
}

// Botão para redefinir quantidade e vender todos
function venderTodosAnimais() {
  if (!loteAtual) return;
  document.getElementById('fechamento-qtd-venda').value = loteAtual.qtdAnimais;
  atualizarCalculoFechamento();
}

// Renderizar animais
function renderTabelaAnimais() {
  if (!loteAtual) return;
  const animais = loteAtual.animais || [];
  const tbody = document.getElementById('tabela-animais-body');
  tbody.innerHTML = '';

  animais.forEach(a => {
    const ganho = (a.pesoAbateKg || 0) - (a.pesoEntradaKg || 0);
    const gmd = ganho > 0 ? (ganho / (loteAtual.diasCiclo || 120)).toFixed(3) : '0.000';

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition-colors";
    tr.innerHTML = `
      <td class="p-3 font-bold text-slate-800">${a.brinco}</td>
      <td class="p-3 text-slate-600">${a.raca || '-'}</td>
      <td class="p-3 text-center font-medium">${a.pesoEntradaKg} kg</td>
      <td class="p-3 text-center font-medium">${a.pesoAbateKg || '-'} kg</td>
      <td class="p-3 text-center font-bold text-emerald-700">${ganho > 0 ? `+${ganho} kg` : '-'}</td>
      <td class="p-3 text-center font-bold text-emerald-700">${gmd} kg/dia</td>
      <td class="p-3 text-slate-500 text-[11px]">${a.obs || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Alternar entre abas
function mudarAba(aba) {
  const abas = ['racao', 'medicamento', 'fechamento', 'animais', 'relatorios'];
  abas.forEach(a => {
    const el = document.getElementById(`aba-${a}`);
    const btn = document.getElementById(`tab-btn-${a}`);
    const bnav = document.getElementById(`bnav-btn-${a}`);
    if (a === aba) {
      if (el) el.classList.remove('hidden');
      if (btn) btn.className = "pb-3 px-2 border-b-2 border-emerald-600 text-emerald-700 flex items-center gap-1.5 whitespace-nowrap font-bold";
      if (bnav) bnav.className = "flex flex-col items-center justify-center flex-1 py-1 text-emerald-600 font-bold transition-colors";
    } else {
      if (el) el.classList.add('hidden');
      if (btn) btn.className = "pb-3 px-2 border-b-2 border-transparent text-slate-500 hover:text-slate-800 flex items-center gap-1.5 whitespace-nowrap font-semibold";
      if (bnav) bnav.className = "flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-700 font-medium transition-colors";
    }
  });

  if (aba === 'relatorios') {
    renderRelatorios();
  }
}


// ==============================================================
// MÓDULO DE RELATÓRIOS DETALHADOS
// ==============================================================
let tipoRelatorioSelecionado = 'vendas';
let relFiltroAnimalBrinco = 'todos';
let relModalidadeDias = 'corridos'; // 'corridos' (dias rodando) ou 'fixo' (30, 60, 90, 120)
let relDiasFixosValor = 120; // 30, 60, 90, 120
let relDataEntradaPersonalizada = null;

// Selecionar categoria de relatório
function selecionarTipoRelatorio(tipo) {
  tipoRelatorioSelecionado = tipo;
  const tipos = ['vendas', 'comida', 'medicamentos', 'consolidado'];

  tipos.forEach(t => {
    const painel = document.getElementById(`rel-painel-${t}`);
    const btn = document.getElementById(`btn-rel-tipo-${t}`);
    if (t === tipo) {
      if (painel) painel.classList.remove('hidden');
      if (btn) btn.className = "flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-white text-emerald-800 shadow-sm flex items-center justify-center gap-2 transition-all font-bold";
    } else {
      if (painel) painel.classList.add('hidden');
      if (btn) btn.className = "flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-slate-600 hover:text-slate-900 flex items-center justify-center gap-2 transition-all font-semibold";
    }
  });

  renderRelatorios();
}

// Trocar lote dentro do relatório
async function trocarLoteRelatorio(loteId) {
  relFiltroAnimalBrinco = 'todos';
  relDataEntradaPersonalizada = null;
  await trocarLote(loteId);
}

// Trocar animal específico no relatório
function trocarAnimalRelatorio(brinco) {
  relFiltroAnimalBrinco = brinco;
  renderRelatorios();
}

// Alternar modalidade de contagem de dias (Dias Corridos vs Dias Fixos)
function alterarModalidadeDias(modo) {
  relModalidadeDias = modo;
  const btnCorridos = document.getElementById('btn-modalidade-corridos');
  const btnFixo = document.getElementById('btn-modalidade-fixo');
  const boxCorridos = document.getElementById('box-dias-corridos');
  const boxFixos = document.getElementById('box-dias-fixos');

  if (modo === 'corridos') {
    if (btnCorridos) btnCorridos.className = "px-3 py-1.5 rounded-lg bg-white text-emerald-800 shadow-sm transition-all flex items-center gap-1.5 font-bold";
    if (btnFixo) btnFixo.className = "px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 font-semibold";
    if (boxCorridos) boxCorridos.classList.remove('hidden');
    if (boxFixos) boxFixos.classList.add('hidden');
  } else {
    if (btnCorridos) btnCorridos.className = "px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5 font-semibold";
    if (btnFixo) btnFixo.className = "px-3 py-1.5 rounded-lg border-2 border-blue-600 bg-white text-blue-800 shadow-sm transition-all flex items-center gap-1.5 font-bold";
    if (boxCorridos) boxCorridos.classList.add('hidden');
    if (boxFixos) boxFixos.classList.remove('hidden');
  }

  renderRelatorios();
}

// Atualizar data de entrada no modo de dias corridos
function atualizarDataEntradaCorrida(novaData) {
  if (novaData) {
    relDataEntradaPersonalizada = novaData;
    renderRelatorios();
  }
}

// Selecionar dias fixos (30, 60, 90, 120 dias)
function selecionarDiasFixos(dias) {
  relDiasFixosValor = Number(dias);
  [30, 60, 90, 120].forEach(d => {
    const btn = document.getElementById(`btn-fixo-${d}`);
    if (btn) {
      if (d === Number(dias)) {
        btn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg border-2 border-blue-600 bg-blue-600 text-white shadow-sm";
      } else {
        btn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-blue-500";
      }
    }
  });

  renderRelatorios();
}

// Obter lista completa e consistente de animais do lote
function obterAnimaisLote(lote) {
  if (!lote) return [];
  const qtdTotal = Number(lote.qtdAnimais) || 1;
  const lista = Array.isArray(lote.animais) ? [...lote.animais] : [];

  // Se o lote não tem o array completo de animais, cria as representações individuais
  while (lista.length < qtdTotal) {
    const idx = lista.length + 1;
    const prefixo = lote.categoria === 'suino' ? 'SU' : lote.categoria === 'ovino' ? 'OV' : lote.categoria === 'caprino' ? 'CAP' : lote.categoria === 'avicola' ? 'AV' : 'BOV';
    lista.push({
      brinco: `${prefixo}-${String(idx).padStart(2, '0')}`,
      raca: lote.racaPredominante || 'Padrão do Lote',
      pesoEntradaKg: Math.round((Number(lote.pesoVivoMedioKg) || 500) * 0.70),
      pesoAbateKg: Number(lote.pesoVivoMedioKg) || 500,
      obs: `Animal #${idx} do lote`
    });
  }
  return lista;
}

// Renderizar todos os dados da aba de relatórios detalhados
function renderRelatorios() {
  if (!loteAtual) return;
  const t = loteAtual.totais || {};
  const totalNoLote = Number(loteAtual.qtdAnimais) || 1;
  const diasCicloPadrao = Number(loteAtual.diasCiclo) || 120;
  const despesas = loteAtual.despesas || [];
  const listaAnimais = obterAnimaisLote(loteAtual);

  // 1. Atualizar Dropdown de Seleção de Lote nos Relatórios
  const selectLoteRel = document.getElementById('rel-filtro-lote');
  if (selectLoteRel && lotes && lotes.length > 0) {
    selectLoteRel.innerHTML = '';
    lotes.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      const icone = l.icone || (l.categoria === 'suino' ? '🐖' : l.categoria === 'ovino' ? '🐑' : l.categoria === 'caprino' ? '🐐' : l.categoria === 'avicola' ? '🐓' : '🐂');
      opt.textContent = `${icone} ${l.nome} (${l.qtdAnimais} animais) - ${l.status === 'finalizado' ? 'Abatido/Vendido' : 'Em Engorda'}`;
      if (l.id === loteAtual.id) opt.selected = true;
      selectLoteRel.appendChild(opt);
    });
  }

  // 2. Atualizar Dropdown de Seleção de Animal Específico
  const selectAnimalRel = document.getElementById('rel-filtro-animal');
  if (selectAnimalRel) {
    selectAnimalRel.innerHTML = '';
    const optTodos = document.createElement('option');
    optTodos.value = 'todos';
    optTodos.textContent = `🐾 Todos os Animais (Visão Geral do Lote - ${totalNoLote} animais)`;
    if (relFiltroAnimalBrinco === 'todos') optTodos.selected = true;
    selectAnimalRel.appendChild(optTodos);

    listaAnimais.forEach((a, idx) => {
      const opt = document.createElement('option');
      opt.value = a.brinco;
      const ganho = (Number(a.pesoAbateKg) || 0) - (Number(a.pesoEntradaKg) || 0);
      const strGanho = ganho > 0 ? ` (+${ganho}kg)` : '';
      const foiVend = (loteAtual.status === 'finalizado' || loteAtual.vendaRealizada || (Number(loteAtual.valorTotalVendaReal) > 0)) && (idx < (Number(loteAtual.qtdVendida) || totalNoLote));
      const statusTag = foiVend ? ' [Vendido]' : '';
      opt.textContent = `🏷️ [${a.brinco}] ${a.raca || 'Animal'} • ${a.pesoEntradaKg}kg -> ${a.pesoAbateKg || '-'}kg${strGanho}${statusTag}`;
      if (a.brinco === relFiltroAnimalBrinco) opt.selected = true;
      selectAnimalRel.appendChild(opt);
    });
  }

  // 3. Determinação da Modalidade de Contagem dos Dias
  const dataEntradaEfetiva = relDataEntradaPersonalizada || loteAtual.dataEntrada;
  const inputDataEntrada = document.getElementById('rel-data-entrada-corrida');
  if (inputDataEntrada) {
    inputDataEntrada.value = dataEntradaEfetiva;
  }

  let diasEfetivos = 120;
  let labelModalidade = "";

  if (relModalidadeDias === 'corridos') {
    const dIni = new Date(dataEntradaEfetiva);
    const dFim = (loteAtual.status === 'finalizado' && loteAtual.dataAbateReal) ? new Date(loteAtual.dataAbateReal) : new Date();
    const diffDias = Math.max(1, Math.ceil((dFim - dIni) / (1000 * 60 * 60 * 24)));
    diasEfetivos = diffDias;

    const badgeRodando = document.getElementById('badge-dias-rodando');
    const txtRef = document.getElementById('txt-data-referencia');
    if (badgeRodando) badgeRodando.textContent = `Rodando há ${diasEfetivos} dias`;
    if (txtRef) {
      txtRef.textContent = (loteAtual.status === 'finalizado' && loteAtual.dataAbateReal)
        ? `De ${fmtData(dataEntradaEfetiva)} até Abate em ${fmtData(loteAtual.dataAbateReal)}`
        : `De ${fmtData(dataEntradaEfetiva)} até Hoje (${fmtData(new Date().toISOString().split('T')[0])})`;
    }
    labelModalidade = `Dia Corrido (${diasEfetivos} dias rodando)`;
  } else {
    diasEfetivos = relDiasFixosValor || 120;
    const badgeFixos = document.getElementById('badge-dias-fixos-info');
    if (badgeFixos) badgeFixos.textContent = `${diasEfetivos} dias fixos`;
    labelModalidade = `Período Fixo (${diasEfetivos} dias)`;
  }

  // Cabeçalho descritivo
  const relInfo = document.getElementById('relatorio-lote-info');
  if (relInfo) {
    const animalTxt = relFiltroAnimalBrinco === 'todos' ? `Todos os ${totalNoLote} animais` : `Animal individual: ${relFiltroAnimalBrinco}`;
    relInfo.textContent = `${loteAtual.nome} • ${animalTxt} • Modalidade: ${labelModalidade} • Entrada: ${fmtData(dataEntradaEfetiva)}`;
  }

  // -------------------------------------------------------------
  // CÁLCULOS FINANCEIROS DO LOTE E DO ANIMAL ESPECÍFICO
  // -------------------------------------------------------------
  const foiVendidoLote = Boolean(loteAtual.vendaRealizada || loteAtual.status === 'finalizado' || (Number(loteAtual.valorTotalVendaReal) > 0));
  let qtdVendidaLote = Number(loteAtual.qtdVendida);
  if (!qtdVendidaLote || isNaN(qtdVendidaLote)) qtdVendidaLote = totalNoLote;
  const qtdRestanteLote = Math.max(0, totalNoLote - qtdVendidaLote);

  // Rateios por animal
  const custoCompraPorCabeca = Number(loteAtual.compraPorCabeca) || 0;
  const freteEntradaPorCabeca = (Number(loteAtual.freteEntrada) || 0) / totalNoLote;
  const totalRacao = despesas.filter(d => d.tipo === 'racao').reduce((acc, d) => acc + Number(d.valorTotal || 0), 0);
  const totalMedicamentos = despesas.filter(d => d.tipo === 'medicamento').reduce((acc, d) => acc + Number(d.valorTotal || 0), 0);

  // Consumo diário de ração e proporcionalidade aos dias selecionados (corridos ou fixos)
  const custoDiariaRacaoCabeca = totalRacao / totalNoLote / (diasCicloPadrao || 120);
  const racaoPorCabecaEfetiva = relModalidadeDias === 'fixo' 
    ? (custoDiariaRacaoCabeca * diasEfetivos) 
    : (foiVendidoLote ? (totalRacao / totalNoLote) : (custoDiariaRacaoCabeca * diasEfetivos));

  const medPorCabeca = totalMedicamentos / totalNoLote;
  const freteAbatePorCabeca = (Number(loteAtual.freteAbate) || 0) / (qtdVendidaLote || 1);

  // Custo unitário de entrada por animal
  const custoEntradaPorCabeca = custoCompraPorCabeca + freteEntradaPorCabeca + racaoPorCabecaEfetiva + medPorCabeca + freteAbatePorCabeca;

  // Verificar se há animal específico selecionado
  const animalSelIdx = relFiltroAnimalBrinco !== 'todos' ? listaAnimais.findIndex(x => x.brinco === relFiltroAnimalBrinco) : -1;
  const animalSel = animalSelIdx >= 0 ? listaAnimais[animalSelIdx] : null;

  // Determinar se o animal específico foi vendido
  const foiVendidoEsteAnimal = animalSel 
    ? (foiVendidoLote && (animalSelIdx < qtdVendidaLote))
    : foiVendidoLote;

  // Card Específico do Animal
  const cardAnimalEsp = document.getElementById('rel-card-animal-especifico');
  if (animalSel && cardAnimalEsp) {
    cardAnimalEsp.classList.remove('hidden');

    const pEntrada = Number(animalSel.pesoEntradaKg) || 0;
    const pAbate = Number(animalSel.pesoAbateKg) || Number(loteAtual.pesoVivoMedioKg) || 500;
    const ganho = Math.max(0, pAbate - pEntrada);
    const gmd = diasEfetivos > 0 ? (ganho / diasEfetivos) : 0;

    document.getElementById('rel-animal-nome').textContent = `Animal: ${animalSel.brinco}`;
    const badgeStatus = document.getElementById('rel-animal-status-badge');
    if (foiVendidoEsteAnimal) {
      badgeStatus.textContent = '✓ Animal Vendido';
      badgeStatus.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-emerald-950';
    } else {
      badgeStatus.textContent = '⏳ No Lote em Engorda';
      badgeStatus.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-amber-950';
    }
    document.getElementById('rel-animal-detalhes').textContent = `Raça: ${animalSel.raca || 'Padrão'} • ${animalSel.obs || 'Confinado no lote'} • Ciclo considerado: ${diasEfetivos} dias`;
    document.getElementById('rel-animal-peso-entrada').textContent = `${pEntrada} kg`;
    document.getElementById('rel-animal-peso-abate').textContent = `${pAbate} kg`;
    document.getElementById('rel-animal-gmd').textContent = `+${gmd.toFixed(3)} kg/d`;

    // Cálculo da receita deste animal específico conforme o modo de venda e seu peso individual
    let receitaAnimal = 0;
    const rendPct = (Number(loteAtual.rendimentoCarcaçaPct) || (loteAtual.categoria === 'suino' ? 74 : loteAtual.categoria === 'ovino' ? 48 : 54)) / 100;
    if (loteAtual.modoVenda === 'arroba') {
      const precoArr = Number(loteAtual.precoArroba) || 245;
      const arr = (pAbate * rendPct) / 15;
      receitaAnimal = arr * precoArr;
    } else if (loteAtual.modoVenda === 'kg_vivo') {
      const precoKg = Number(loteAtual.precoKgVivo) || 12;
      receitaAnimal = pAbate * precoKg;
    } else if (loteAtual.modoVenda === 'kg_carcaca') {
      const precoCarc = Number(loteAtual.precoKgCarcaca) || 22;
      receitaAnimal = (pAbate * rendPct) * precoCarc;
    } else {
      receitaAnimal = Number(loteAtual.vendaPorCabecaEstimada) || 4450;
    }

    const custoAnimal = custoEntradaPorCabeca;
    const lucroAnimal = receitaAnimal - custoAnimal;
    const margemAnimal = receitaAnimal > 0 ? ((lucroAnimal / receitaAnimal) * 100).toFixed(1) : 0;

    document.getElementById('rel-animal-custo-total').textContent = fmt(custoAnimal);
    document.getElementById('rel-animal-custo-desc').textContent = `Compra: ${fmt(custoCompraPorCabeca)} + Ração (${diasEfetivos}d): ${fmt(racaoPorCabecaEfetiva)} + Sanidade: ${fmt(medPorCabeca)}`;
    document.getElementById('rel-animal-receita-total').textContent = fmt(receitaAnimal);
    document.getElementById('rel-animal-receita-desc').textContent = foiVendidoEsteAnimal ? 'Valor recebido na venda' : 'Preço estimado de mercado';

    const elLucroAnimal = document.getElementById('rel-animal-lucro-total');
    elLucroAnimal.textContent = fmt(lucroAnimal);
    elLucroAnimal.className = lucroAnimal >= 0 ? "text-xl font-black text-emerald-300 mt-0.5" : "text-xl font-black text-rose-300 mt-0.5";
    document.getElementById('rel-animal-lucro-desc').textContent = `Margem Líquida: ${margemAnimal}% • Retorno: ${custoAnimal > 0 ? ((lucroAnimal / custoAnimal) * 100).toFixed(1) : 0}%`;

  } else if (cardAnimalEsp) {
    cardAnimalEsp.classList.add('hidden');
  }

  // -------------------------------------------------------------
  // 1. DADOS DO RELATÓRIO DE VENDAS, CUSTO DE ENTRADA & LUCRO
  // -------------------------------------------------------------
  let qtdVendaCalculo = animalSel ? 1 : qtdVendidaLote;
  let custoEntradaTotalCalc = animalSel ? custoEntradaPorCabeca : (custoEntradaPorCabeca * qtdVendaCalculo);
  let receitaVendaTotalCalc = 0;

  if (animalSel) {
    const pAbate = Number(animalSel.pesoAbateKg) || Number(loteAtual.pesoVivoMedioKg) || 500;
    const rendPct = (Number(loteAtual.rendimentoCarcaçaPct) || (loteAtual.categoria === 'suino' ? 74 : loteAtual.categoria === 'ovino' ? 48 : 54)) / 100;
    if (loteAtual.modoVenda === 'arroba') {
      receitaVendaTotalCalc = ((pAbate * rendPct) / 15) * (Number(loteAtual.precoArroba) || 245);
    } else if (loteAtual.modoVenda === 'kg_vivo') {
      receitaVendaTotalCalc = pAbate * (Number(loteAtual.precoKgVivo) || 12);
    } else if (loteAtual.modoVenda === 'kg_carcaca') {
      receitaVendaTotalCalc = (pAbate * rendPct) * (Number(loteAtual.precoKgCarcaca) || 22);
    } else {
      receitaVendaTotalCalc = Number(loteAtual.vendaPorCabecaEstimada) || 4450;
    }
  } else {
    receitaVendaTotalCalc = Number(t.receitaTotal) || 0;
  }

  const receitaPorCabecaCalc = qtdVendaCalculo > 0 ? (receitaVendaTotalCalc / qtdVendaCalculo) : 0;
  const lucroLiquidoCalc = receitaVendaTotalCalc - custoEntradaTotalCalc;
  const lucroPorCabecaCalc = qtdVendaCalculo > 0 ? (lucroLiquidoCalc / qtdVendaCalculo) : 0;
  const margemPctCalc = receitaVendaTotalCalc > 0 ? ((lucroLiquidoCalc / receitaVendaTotalCalc) * 100).toFixed(1) : '0.0';

  // Banner de status da venda
  const bannerTag = document.getElementById('rel-vendas-status-tag');
  const bannerTitulo = document.getElementById('rel-vendas-status-titulo');
  const bannerDesc = document.getElementById('rel-vendas-status-desc');
  const bannerQtdInfo = document.getElementById('rel-vendas-qtd-info');
  const bannerIcone = document.getElementById('rel-vendas-status-icone');

  if (animalSel) {
    if (foiVendidoEsteAnimal) {
      if (bannerTag) { bannerTag.textContent = 'Venda Registrada'; bannerTag.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white'; }
      if (bannerTitulo) bannerTitulo.textContent = `Animal [${animalSel.brinco}] - Comercializado no Abate`;
      if (bannerDesc) bannerDesc.textContent = `Este animal foi vendido e abatido com lucro já apurado. Considerados ${diasEfetivos} dias de engorda.`;
      if (bannerIcone) bannerIcone.textContent = '✓';
      if (bannerQtdInfo) bannerQtdInfo.textContent = `1 animal comercializado individualmente`;
    } else {
      if (bannerTag) { bannerTag.textContent = 'Em Engorda (No Lote)'; bannerTag.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white'; }
      if (bannerTitulo) bannerTitulo.textContent = `Animal [${animalSel.brinco}] - Ativo no Lote`;
      if (bannerDesc) bannerDesc.textContent = `Animal ainda não vendido. Custos calculados para ${diasEfetivos} dias rodando. Valor de venda e lucro são projeções de mercado.`;
      if (bannerIcone) bannerIcone.textContent = '⏳';
      if (bannerQtdInfo) bannerQtdInfo.textContent = `Animal ativo no lote (${diasEfetivos} dias considerados)`;
    }
  } else {
    if (foiVendidoLote) {
      if (qtdVendidaLote < totalNoLote) {
        if (bannerTag) { bannerTag.textContent = 'Venda Parcial Concluída'; bannerTag.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-600 text-white'; }
        if (bannerTitulo) bannerTitulo.textContent = 'Venda Parcial com Lucro Apurado';
        if (bannerDesc) bannerDesc.textContent = `${qtdVendidaLote} animais foram vendidos. Os ${qtdRestanteLote} restantes permanecem no lote em engorda. (${diasEfetivos} dias considerados)`;
        if (bannerIcone) bannerIcone.textContent = '⚠️';
      } else {
        if (bannerTag) { bannerTag.textContent = 'Venda Total Realizada'; bannerTag.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white'; }
        if (bannerTitulo) bannerTitulo.textContent = 'Lote Totalmente Comercializado';
        if (bannerDesc) bannerDesc.textContent = `Todos os ${qtdVendidaLote} animais foram comercializados com receita apurada no fechamento. (${diasEfetivos} dias considerados)`;
        if (bannerIcone) bannerIcone.textContent = '✓';
      }
      if (bannerQtdInfo) bannerQtdInfo.textContent = `${qtdVendidaLote} de ${totalNoLote} animais vendidos`;
    } else {
      if (bannerTag) { bannerTag.textContent = 'Em Engorda (Sem Venda)'; bannerTag.className = 'px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white'; }
      if (bannerTitulo) bannerTitulo.textContent = 'Lote Ativo em Confinamento / Pasto';
      if (bannerDesc) bannerDesc.textContent = `Nenhum animal vendido ainda. Custo acumulado para ${diasEfetivos} dias rodando. Venda e lucro são projeções de mercado.`;
      if (bannerIcone) bannerIcone.textContent = '⏳';
      if (bannerQtdInfo) bannerQtdInfo.textContent = `0 vendidos • ${totalNoLote} animais em confinamento`;
    }
  }

  // Cards de Vendas & Custos
  const elCardVendidos = document.getElementById('rel-card-animais-vendidos');
  const elCardSaldo = document.getElementById('rel-card-animais-saldo');
  if (elCardVendidos) {
    if (animalSel) {
      elCardVendidos.textContent = foiVendidoEsteAnimal ? '1 Animal Vendido' : '0 Vendido (No Lote)';
    } else {
      elCardVendidos.textContent = foiVendidoLote ? `${qtdVendidaLote} Vendidos` : `0 Vendidos`;
    }
  }
  if (elCardSaldo) {
    if (animalSel) {
      elCardSaldo.textContent = `Animal: ${animalSel.brinco} (${animalSel.raca || 'Nelore'})`;
    } else {
      elCardSaldo.textContent = foiVendidoLote 
        ? (qtdRestanteLote > 0 ? `${qtdRestanteLote} animais restantes no lote` : `Lote 100% finalizado`)
        : `${totalNoLote} animais em engorda`;
    }
  }

  const elCustoEntradaCab = document.getElementById('rel-card-custo-entrada-cabeca');
  const elCustoEntradaTot = document.getElementById('rel-card-custo-entrada-total');
  if (elCustoEntradaCab) elCustoEntradaCab.textContent = fmt(custoEntradaPorCabeca);
  if (elCustoEntradaTot) {
    elCustoEntradaTot.textContent = animalSel
      ? `Custo total do animal: ${fmt(custoEntradaPorCabeca)}`
      : `Custo total (${qtdVendaCalculo} cab): ${fmt(custoEntradaTotalCalc)}`;
  }

  const elVendaTot = document.getElementById('rel-card-venda-total');
  const elVendaCab = document.getElementById('rel-card-venda-cabeca');
  if (elVendaTot) elVendaTot.textContent = fmt(receitaVendaTotalCalc);
  if (elVendaCab) elVendaCab.textContent = `${fmt(receitaPorCabecaCalc)} / animal`;

  const elLucroTot = document.getElementById('rel-card-lucro-total');
  const elLucroCab = document.getElementById('rel-card-lucro-cabeca');
  if (elLucroTot) {
    elLucroTot.textContent = fmt(lucroLiquidoCalc);
    elLucroTot.className = lucroLiquidoCalc >= 0 ? "text-2xl font-black text-emerald-700 mt-1" : "text-2xl font-black text-rose-700 mt-1";
  }
  if (elLucroCab) {
    elLucroCab.textContent = `${fmt(lucroPorCabecaCalc)} / animal (Margem: ${margemPctCalc}%)`;
    elLucroCab.className = lucroLiquidoCalc >= 0 ? "text-xs font-bold text-emerald-800 mt-1" : "text-xs font-bold text-rose-800 mt-1";
  }

  // Tabela Detalhada de Vendas & Custos de Entrada
  const elTbQtdVend = document.getElementById('rel-tb-qtd-vendida');
  if (elTbQtdVend) elTbQtdVend.textContent = animalSel ? `1 cab (${animalSel.brinco})` : `${qtdVendaCalculo} cab`;

  const tbodyVendas = document.getElementById('rel-tabela-vendas-body');
  if (tbodyVendas) {
    tbodyVendas.innerHTML = '';
    const mult = animalSel ? 1 : qtdVendaCalculo;
    const linhasVendas = [
      {
        nome: "1. Valor de Compra do Animal (Aquisição)",
        unit: custoCompraPorCabeca,
        total: custoCompraPorCabeca * mult,
        pct: custoEntradaPorCabeca > 0 ? ((custoCompraPorCabeca / custoEntradaPorCabeca) * 100).toFixed(1) : 0,
        detalhe: "Investimento inicial na aquisição do animal"
      },
      {
        nome: "2. Frete de Chegada / Entrada",
        unit: freteEntradaPorCabeca,
        total: freteEntradaPorCabeca * mult,
        pct: custoEntradaPorCabeca > 0 ? ((freteEntradaPorCabeca / custoEntradaPorCabeca) * 100).toFixed(1) : 0,
        detalhe: "Transporte do animal até a propriedade"
      },
      {
        nome: `3. Custo com Ração & Alimentação (${diasEfetivos} dias)`,
        unit: racaoPorCabecaEfetiva,
        total: racaoPorCabecaEfetiva * mult,
        pct: custoEntradaPorCabeca > 0 ? ((racaoPorCabecaEfetiva / custoEntradaPorCabeca) * 100).toFixed(1) : 0,
        detalhe: `Ração e volumoso proporcionais ao ciclo de ${diasEfetivos} dias (${labelModalidade})`
      },
      {
        nome: "4. Custo com Medicamentos & Sanidade",
        unit: medPorCabeca,
        total: medPorCabeca * mult,
        pct: custoEntradaPorCabeca > 0 ? ((medPorCabeca / custoEntradaPorCabeca) * 100).toFixed(1) : 0,
        detalhe: "Vacinas, vermífugos e vitaminas aplicadas"
      },
      {
        nome: "5. Frete para o Abate / Frigorífico",
        unit: freteAbatePorCabeca,
        total: freteAbatePorCabeca * mult,
        pct: custoEntradaPorCabeca > 0 ? ((freteAbatePorCabeca / custoEntradaPorCabeca) * 100).toFixed(1) : 0,
        detalhe: "Transporte final para o ponto de abate/venda"
      },
      {
        destaque: true,
        nome: `(=) VALOR DE ENTRADA TOTAL QUE O ANIMAL FICOU CUSTANDO`,
        unit: custoEntradaPorCabeca,
        total: custoEntradaTotalCalc,
        pct: 100,
        detalhe: animalSel ? `Custo de produção do animal [${animalSel.brinco}] em ${diasEfetivos} dias` : `Custo total de produção dos ${qtdVendaCalculo} animais em ${diasEfetivos} dias`,
        classe: "bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300"
      },
      {
        destaque: true,
        nome: `(+) VALOR DE VENDA REALIZADO / ESTIMADO (RECEITA)`,
        unit: receitaPorCabecaCalc,
        total: receitaVendaTotalCalc,
        pct: custoEntradaTotalCalc > 0 ? ((receitaVendaTotalCalc / custoEntradaTotalCalc) * 100).toFixed(1) : 0,
        detalhe: (animalSel ? foiVendidoEsteAnimal : foiVendidoLote) ? "Preço de venda efetivamente comercializado" : "Preço estimado de mercado atual",
        classe: "bg-blue-50 font-bold text-blue-900"
      },
      {
        destaque: true,
        nome: `(=) LUCRO LÍQUIDO APURADO`,
        unit: lucroPorCabecaCalc,
        total: lucroLiquidoCalc,
        pct: margemPctCalc,
        detalhe: `Margem Líquida: ${margemPctCalc}% • Retorno (ROI): ${custoEntradaTotalCalc > 0 ? ((lucroLiquidoCalc / custoEntradaTotalCalc) * 100).toFixed(1) : 0}%`,
        classe: lucroLiquidoCalc >= 0 ? "bg-emerald-50 font-black text-emerald-900 border-t-2 border-emerald-300" : "bg-rose-50 font-black text-rose-900 border-t-2 border-rose-300"
      }
    ];

    linhasVendas.forEach(l => {
      const tr = document.createElement('tr');
      if (l.classe) tr.className = l.classe;
      else tr.className = "hover:bg-slate-50 transition-colors";

      tr.innerHTML = `
        <td class="p-3 ${l.destaque ? 'font-bold' : 'font-medium text-slate-800'}">${l.nome}</td>
        <td class="p-3 text-right ${l.destaque ? 'font-bold' : ''}">${fmt(l.unit)}</td>
        <td class="p-3 text-right ${l.destaque ? 'font-bold' : ''}">${fmt(l.total)}</td>
        <td class="p-3 text-center ${l.destaque ? 'font-bold' : 'text-slate-500'}">${l.pct}%</td>
        <td class="p-3 ${l.destaque ? 'font-medium' : 'text-slate-500 text-[11px]'}">${l.detalhe}</td>
      `;
      tbodyVendas.appendChild(tr);
    });
  }

  // -------------------------------------------------------------
  // 2. DADOS DO RELATÓRIO DE CUSTO COM COMIDA (RAÇÃO & VOLUMOSO)
  // -------------------------------------------------------------
  const racaos = despesas.filter(d => d.tipo === 'racao');
  const pctComidaDoTotal = ((totalRacao / (t.custoTotalAcumulado || 1)) * 100).toFixed(1);
  const racaoPorAnimalLote = totalRacao / totalNoLote;
  const diariaComidaCalculada = custoDiariaRacaoCabeca;

  const elComidaTotal = document.getElementById('rel-comida-total');
  const elComidaPct = document.getElementById('rel-comida-pct-custo');
  const elComidaCab = document.getElementById('rel-comida-por-cabeca');
  const elComidaCabSub = document.getElementById('rel-comida-por-cabeca-sub');
  const elComidaDiaria = document.getElementById('rel-comida-diaria');
  const elComidaDiariaSub = document.getElementById('rel-comida-diaria-sub');
  const elComidaQtdLanc = document.getElementById('rel-comida-qtd-lancamentos');
  const elComidaDiasCiclo = document.getElementById('rel-comida-dias-ciclo');
  const elComidaBadge = document.getElementById('rel-comida-badge-resumo');

  if (elComidaTotal) elComidaTotal.textContent = fmt(totalRacao);
  if (elComidaPct) elComidaPct.textContent = `${pctComidaDoTotal}% de todo o custo do lote`;
  if (elComidaCab) elComidaCab.textContent = fmt(animalSel ? racaoPorCabecaEfetiva : racaoPorAnimalLote);
  if (elComidaCabSub) elComidaCabSub.textContent = animalSel ? `Consumo do animal [${animalSel.brinco}] em ${diasEfetivos}d` : `Média por animal (${totalNoLote} animais)`;
  if (elComidaDiaria) elComidaDiaria.textContent = `${fmt(diariaComidaCalculada)} / dia`;
  if (elComidaDiariaSub) elComidaDiariaSub.textContent = `Custo alimentar por cabeça ao dia`;
  if (elComidaQtdLanc) elComidaQtdLanc.textContent = `${racaos.length} compras`;
  if (elComidaDiasCiclo) elComidaDiasCiclo.textContent = `${diasEfetivos} dias considerados (${labelModalidade})`;
  if (elComidaBadge) elComidaBadge.textContent = `Total Alimentação: ${fmt(totalRacao)}`;

  const tbodyComida = document.getElementById('rel-tabela-comida-body');
  if (tbodyComida) {
    tbodyComida.innerHTML = '';
    if (racaos.length === 0) {
      tbodyComida.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-slate-400">Nenhum lançamento de comida registrado para este lote.</td></tr>`;
    } else {
      racaos.forEach(d => {
        const valTot = Number(d.valorTotal) || 0;
        const valUnit = Number(d.valorUnitario) || (Number(d.qtd) > 0 ? valTot / Number(d.qtd) : valTot);
        const porCab = valTot / totalNoLote;
        const pctItem = totalRacao > 0 ? ((valTot / totalRacao) * 100).toFixed(1) : 0;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
          <td class="p-3 text-slate-600">${fmtData(d.data)}</td>
          <td class="p-3 font-semibold text-slate-900">${d.descricao} ${d.obs ? `<span class="text-slate-400 font-normal text-[11px]">(${d.obs})</span>` : ''}</td>
          <td class="p-3 text-center font-bold text-slate-700">${d.qtd}</td>
          <td class="p-3 text-center text-slate-500">${d.unidade || 'un'}</td>
          <td class="p-3 text-right text-slate-600">${fmt(valUnit)}</td>
          <td class="p-3 text-right font-bold text-amber-800">${fmt(valTot)}</td>
          <td class="p-3 text-right font-semibold text-slate-700">${fmt(porCab)}</td>
          <td class="p-3 text-center font-medium text-slate-500">${pctItem}%</td>
        `;
        tbodyComida.appendChild(tr);
      });
    }
  }

  // -------------------------------------------------------------
  // 3. DADOS DO RELATÓRIO DE CUSTO COM MEDICAMENTOS & SAÚDE
  // -------------------------------------------------------------
  const meds = despesas.filter(d => d.tipo === 'medicamento');
  const pctMedDoTotal = ((totalMed / (t.custoTotalAcumulado || 1)) * 100).toFixed(1);
  const medPorAnimal = totalMed / totalNoLote;

  const elMedTotal = document.getElementById('rel-med-total');
  const elMedPct = document.getElementById('rel-med-pct-custo');
  const elMedCab = document.getElementById('rel-med-por-cabeca');
  const elMedCabSub = document.getElementById('rel-med-por-cabeca-sub');
  const elMedQtdLanc = document.getElementById('rel-med-qtd-lancamentos');
  const elMedBadge = document.getElementById('rel-med-badge-resumo');

  if (elMedTotal) elMedTotal.textContent = fmt(totalMed);
  if (elMedPct) elMedPct.textContent = `${pctMedDoTotal}% de todo o custo do lote`;
  if (elMedCab) elMedCab.textContent = fmt(medPorAnimal);
  if (elMedCabSub) elMedCabSub.textContent = animalSel ? `Cota sanitária do animal [${animalSel.brinco}]` : `Média sanitária por animal`;
  if (elMedQtdLanc) elMedQtdLanc.textContent = `${meds.length} aplicações`;
  if (elMedBadge) elMedBadge.textContent = `Total Saúde / Medicamentos: ${fmt(totalMed)}`;

  const tbodyMed = document.getElementById('rel-tabela-med-body');
  if (tbodyMed) {
    tbodyMed.innerHTML = '';
    if (meds.length === 0) {
      tbodyMed.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">Nenhum lançamento de medicamento registrado para este lote.</td></tr>`;
    } else {
      meds.forEach(d => {
        const valTot = Number(d.valorTotal) || 0;
        const porCab = valTot / totalNoLote;
        const pctItem = totalMed > 0 ? ((valTot / totalMed) * 100).toFixed(1) : 0;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
          <td class="p-3 text-slate-600">${fmtData(d.data)}</td>
          <td class="p-3 font-semibold text-slate-900">${d.descricao}</td>
          <td class="p-3 text-center text-slate-700">${d.qtd || 1} ${d.unidade || 'dose'}</td>
          <td class="p-3 text-right font-bold text-rose-800">${fmt(valTot)}</td>
          <td class="p-3 text-right font-semibold text-slate-700">${fmt(porCab)}</td>
          <td class="p-3 text-center font-medium text-slate-500">${pctItem}%</td>
          <td class="p-3 text-slate-500 text-[11px]">${d.obs || 'Sanidade e prevenção'}</td>
        `;
        tbodyMed.appendChild(tr);
      });
    }
  }

  // -------------------------------------------------------------
  // 4. DADOS DO RELATÓRIO GERAL CONSOLIDADO (DRE EXECUTIVO)
  // -------------------------------------------------------------
  const tbodyConsolidado = document.getElementById('rel-tabela-consolidado-body');
  if (tbodyConsolidado) {
    tbodyConsolidado.innerHTML = '';
    const multDRE = animalSel ? 1 : totalNoLote;
    const recTotal = animalSel ? receitaVendaTotalCalc : (Number(t.receitaTotal) || 0);
    const custoCompraTot = custoCompraPorCabeca * multDRE;
    const freteEntrTot = freteEntradaPorCabeca * multDRE;
    const racaoTot = racaoPorCabecaEfetiva * multDRE;
    const medTot = medPorCabeca * multDRE;
    const freteAbateTot = freteAbatePorCabeca * multDRE;
    const custoTot = custoCompraTot + freteEntrTot + racaoTot + medTot + freteAbateTot;
    const lucroGeral = recTotal - custoTot;

    const linhasDRE = [
      {
        nome: `(+) RECEITA BRUTA COMERCIAL (${animalSel ? `Animal ${animalSel.brinco}` : 'Venda do Lote'})`,
        total: recTotal,
        porCab: recTotal / multDRE,
        pct: 100.0,
        classe: "bg-blue-50/70 font-bold text-blue-900",
        classif: "Faturamento Bruto"
      },
      {
        nome: "(-) Custo de Aquisição dos Animais (Compra na Feira/Criador)",
        total: -custoCompraTot,
        porCab: -custoCompraPorCabeca,
        pct: recTotal > 0 ? ((-custoCompraTot / recTotal) * 100).toFixed(1) : 0,
        classe: "text-rose-700",
        classif: "Custo Direto de Entrada"
      },
      {
        nome: "(-) Frete e Logística de Transporte de Entrada",
        total: -freteEntrTot,
        porCab: -freteEntradaPorCabeca,
        pct: recTotal > 0 ? ((-freteEntrTot / recTotal) * 100).toFixed(1) : 0,
        classe: "text-rose-700",
        classif: "Custo de Aquisição"
      },
      {
        nome: `(-) Despesas com Ração, Silagem e Alimentação (${diasEfetivos} dias)`,
        total: -racaoTot,
        porCab: -racaoPorCabecaEfetiva,
        pct: recTotal > 0 ? ((-racaoTot / recTotal) * 100).toFixed(1) : 0,
        classe: "text-rose-700",
        classif: "Custo Operacional de Engorda"
      },
      {
        nome: "(-) Despesas Sanitárias, Remédios e Vacinas (Medicamentos)",
        total: -medTot,
        porCab: -medPorCabeca,
        pct: recTotal > 0 ? ((-medTot / recTotal) * 100).toFixed(1) : 0,
        classe: "text-rose-700",
        classif: "Custo Sanitário Preventivo"
      },
      {
        nome: "(-) Frete e Logística para Abate / Frigorífico",
        total: -freteAbateTot,
        porCab: -freteAbatePorCabeca,
        pct: recTotal > 0 ? ((-freteAbateTot / recTotal) * 100).toFixed(1) : 0,
        classe: "text-rose-700",
        classif: "Despesa de Venda / Comercialização"
      },
      {
        nome: "(=) CUSTO TOTAL DE ENTRADA & PRODUÇÃO",
        total: custoTot,
        porCab: custoTot / multDRE,
        pct: recTotal > 0 ? ((custoTot / recTotal) * 100).toFixed(1) : 0,
        classe: "bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300",
        classif: `Custo em ${diasEfetivos} dias (${labelModalidade})`
      },
      {
        nome: "(=) RESULTADO OPERACIONAL LÍQUIDO (LUCRO LÍQUIDO)",
        total: lucroGeral,
        porCab: lucroGeral / multDRE,
        pct: recTotal > 0 ? ((lucroGeral / recTotal) * 100).toFixed(1) : 0,
        classe: lucroGeral >= 0 ? "bg-emerald-50 font-black text-emerald-900 border-t-2 border-emerald-400 text-sm" : "bg-rose-50 font-black text-rose-900 border-t-2 border-rose-400 text-sm",
        classif: `Margem: ${recTotal > 0 ? ((lucroGeral / recTotal) * 100).toFixed(1) : 0}% • ROI: ${custoTot > 0 ? ((lucroGeral / custoTot) * 100).toFixed(1) : 0}%`
      }
    ];

    linhasDRE.forEach(l => {
      const tr = document.createElement('tr');
      tr.className = l.classe ? `${l.classe} transition-colors` : "hover:bg-slate-50 transition-colors";
      tr.innerHTML = `
        <td class="p-3">${l.nome}</td>
        <td class="p-3 text-right">${fmt(l.total)}</td>
        <td class="p-3 text-right">${fmt(l.porCab)}</td>
        <td class="p-3 text-center">${l.pct}%</td>
        <td class="p-3 text-xs">${l.classif}</td>
      `;
      tbodyConsolidado.appendChild(tr);
    });
  }
}

// Alternar modo de venda na tela
function alterarModoVendaFrontend() {
  const modo = document.getElementById('fechamento-modo-venda').value;
  const boxCabeca = document.getElementById('box-venda-cabeca');
  const boxArroba = document.getElementById('box-venda-arroba');
  const boxKgVivo = document.getElementById('box-venda-kg-vivo');
  const boxKgCarcaca = document.getElementById('box-venda-kg-carcaca');

  boxCabeca.classList.add('hidden');
  boxArroba.classList.add('hidden');
  boxKgVivo.classList.add('hidden');
  boxKgCarcaca.classList.add('hidden');

  if (modo === 'cabeca') boxCabeca.classList.remove('hidden');
  else if (modo === 'arroba') boxArroba.classList.remove('hidden');
  else if (modo === 'kg_vivo') boxKgVivo.classList.remove('hidden');
  else if (modo === 'kg_carcaca') boxKgCarcaca.classList.remove('hidden');

  atualizarCalculoFechamento();
}

// Atualizar cálculo interativo na aba de fechamento com quantidade escolhida de animais
function atualizarCalculoFechamento() {
  if (!loteAtual) return;
  const totalNoLote = loteAtual.qtdAnimais || 1;
  let qtdVenda = parseInt(document.getElementById('fechamento-qtd-venda').value);

  // Validação e limites de quantidade
  if (isNaN(qtdVenda) || qtdVenda < 1) qtdVenda = 1;
  if (qtdVenda > totalNoLote) {
    qtdVenda = totalNoLote;
    document.getElementById('fechamento-qtd-venda').value = totalNoLote;
  }

  const sobram = Math.max(0, totalNoLote - qtdVenda);
  const txtRestantes = document.getElementById('txt-animais-restantes');
  const boxSaldo = document.getElementById('box-saldo-restante');
  const txtSaldo = document.getElementById('txt-saldo-restante');

  if (qtdVenda === totalNoLote) {
    txtRestantes.innerHTML = `Vendendo todos os <strong>${totalNoLote} animais</strong> (Venda Total do Lote)`;
    if (boxSaldo) boxSaldo.classList.add('hidden');
  } else {
    txtRestantes.innerHTML = `<span class="text-amber-700 font-bold">⚠️ Venda Parcial:</span> Vendendo ${qtdVenda} de ${totalNoLote} animais. Sobram <strong>${sobram} animais</strong> no lote!`;
    if (boxSaldo) {
      boxSaldo.classList.remove('hidden');
      txtSaldo.textContent = `${sobram} animais continuarão no lote para venda posterior. Os custos abaixo foram rateados proporcionalmente aos ${qtdVenda} vendidos.`;
    }
  }

  // Atualizar contadores nos textos do DRE
  const elQtdVendida = document.getElementById('dre-qtd-vendida');
  const elQtdCompra = document.getElementById('dre-qtd-compra');
  const elQtdCusto = document.getElementById('dre-qtd-custo');
  const elQtdLucro = document.getElementById('dre-qtd-lucro');
  if (elQtdVendida) elQtdVendida.textContent = qtdVenda;
  if (elQtdCompra) elQtdCompra.textContent = qtdVenda;
  if (elQtdCusto) elQtdCusto.textContent = qtdVenda;
  if (elQtdLucro) elQtdLucro.textContent = qtdVenda;

  // Cálculo do preço unitário por animal conforme modo de venda
  const modo = document.getElementById('fechamento-modo-venda').value;
  let precoPorCabeca = 0;

  if (modo === 'cabeca') {
    precoPorCabeca = Number(document.getElementById('fechamento-venda-cabeca').value) || 0;
  } else if (modo === 'arroba') {
    const pesoVivo = Number(document.getElementById('fechamento-peso-vivo').value) || 510;
    const precoArr = Number(document.getElementById('fechamento-preco-arroba').value) || 245;
    const arrobas = (pesoVivo * 0.54) / 15;
    precoPorCabeca = arrobas * precoArr;
    document.getElementById('txt-fechamento-arrobas').textContent = `Rendimento 54%: ${arrobas.toFixed(2)} @ por cabeça (${fmt(precoPorCabeca)})`;
  } else if (modo === 'kg_vivo') {
    const pesoVivo = Number(document.getElementById('fechamento-peso-vivo-kg').value) || 100;
    const precoKg = Number(document.getElementById('fechamento-preco-kg-vivo').value) || 10.50;
    precoPorCabeca = pesoVivo * precoKg;
    document.getElementById('txt-fechamento-kg-vivo').textContent = `${pesoVivo} kg vivo x ${fmt(precoKg)} = ${fmt(precoPorCabeca)} por animal`;
  } else if (modo === 'kg_carcaca') {
    const pesoVivo = Number(document.getElementById('fechamento-peso-carcaca-vivo').value) || 100;
    const rendimento = (Number(document.getElementById('fechamento-rendimento-pct').value) || 50) / 100;
    const precoKgCarcaca = Number(document.getElementById('fechamento-preco-kg-carcaca').value) || 20.00;
    const pesoLimpo = pesoVivo * rendimento;
    precoPorCabeca = pesoLimpo * precoKgCarcaca;
    document.getElementById('txt-fechamento-carcaca').textContent = `Carcaça: ${pesoLimpo.toFixed(1)} kg (${fmt(precoPorCabeca)} / animal)`;
  }

  // Receita Total da Venda
  const receitaTotal = precoPorCabeca * qtdVenda;
  const freteAbate = Number(document.getElementById('fechamento-frete-abate').value) || 0;

  // Custos Proporcionais aos animais vendidos
  const t = loteAtual.totais || {};
  const fatorProporcao = qtdVenda / totalNoLote;

  const custoCompraVendidos = (loteAtual.compraPorCabeca || 0) * qtdVenda;
  const freteEntradaVendidos = (loteAtual.freteEntrada || 0) * fatorProporcao;
  const racaoVendidos = (t.totalRacao || 0) * fatorProporcao;
  const medVendidos = (t.totalMedicamentos || 0) * fatorProporcao;
  const outrosVendidos = (t.totalOutros || 0) * fatorProporcao;

  const custoTotalVenda = custoCompraVendidos + freteEntradaVendidos + racaoVendidos + medVendidos + outrosVendidos + freteAbate;
  const lucro = receitaTotal - custoTotalVenda;
  const lucroCabeca = qtdVenda > 0 ? (lucro / qtdVenda) : 0;
  const breakEven = qtdVenda > 0 ? (custoTotalVenda / qtdVenda) : 0;
  const margem = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;

  // Atualizar DRE na tela
  document.getElementById('dre-receita').textContent = fmt(receitaTotal);
  document.getElementById('dre-compra').textContent = `- ${fmt(custoCompraVendidos)}`;
  document.getElementById('dre-frete-entrada').textContent = `- ${fmt(freteEntradaVendidos)}`;
  document.getElementById('dre-racao').textContent = `- ${fmt(racaoVendidos)}`;
  document.getElementById('dre-med').textContent = `- ${fmt(medVendidos)}`;
  document.getElementById('dre-frete-abate').textContent = `- ${fmt(outrosVendidos + freteAbate)}`;
  document.getElementById('dre-custo-total').textContent = fmt(custoTotalVenda);
  
  const dreLucro = document.getElementById('dre-lucro-final');
  dreLucro.textContent = fmt(lucro);
  dreLucro.className = lucro >= 0 ? "text-xl sm:text-2xl font-black text-emerald-700" : "text-xl sm:text-2xl font-black text-rose-700";

  document.getElementById('dre-lucro-cabeca').textContent = fmt(lucroCabeca);
  document.getElementById('dre-break-even').textContent = `${fmt(breakEven)} / cab`;
  document.getElementById('dre-margem').textContent = `${margem.toFixed(1)}%`;
}

// Salvar fechamento do lote no backend com a quantidade de animais escolhida
async function salvarFechamentoLote() {
  if (!loteAtual) return;
  const totalNoLote = loteAtual.qtdAnimais || 1;
  let qtdVenda = parseInt(document.getElementById('fechamento-qtd-venda').value) || totalNoLote;
  if (qtdVenda > totalNoLote) qtdVenda = totalNoLote;

  const modo = document.getElementById('fechamento-modo-venda').value;
  const freteAbate = Number(document.getElementById('fechamento-frete-abate').value) || 0;
  let valorTotalVenda = 0;

  if (modo === 'cabeca') {
    const vendaCabeca = Number(document.getElementById('fechamento-venda-cabeca').value) || 0;
    valorTotalVenda = vendaCabeca * qtdVenda;
  } else if (modo === 'arroba') {
    const pesoVivo = Number(document.getElementById('fechamento-peso-vivo').value) || 510;
    const precoArr = Number(document.getElementById('fechamento-preco-arroba').value) || 245;
    const arrobas = (pesoVivo * 0.54) / 15;
    valorTotalVenda = arrobas * precoArr * qtdVenda;
  } else if (modo === 'kg_vivo') {
    const pesoVivo = Number(document.getElementById('fechamento-peso-vivo-kg').value) || 100;
    const precoKg = Number(document.getElementById('fechamento-preco-kg-vivo').value) || 10.50;
    valorTotalVenda = pesoVivo * precoKg * qtdVenda;
  } else if (modo === 'kg_carcaca') {
    const pesoVivo = Number(document.getElementById('fechamento-peso-carcaca-vivo').value) || 100;
    const rend = (Number(document.getElementById('fechamento-rendimento-pct').value) || 50) / 100;
    const precoCarcaca = Number(document.getElementById('fechamento-preco-kg-carcaca').value) || 20;
    valorTotalVenda = (pesoVivo * rend) * precoCarcaca * qtdVenda;
  }

  if (!verificarPermissaoEscrita("registrar o fechamento de venda ou abate")) return;

  const mensagemConfirmacao = qtdVenda === totalNoLote 
    ? `Deseja registrar o fechamento total da venda de ${qtdVenda} animais por ${fmt(valorTotalVenda)}?`
    : `Deseja registrar a VENDA PARCIAL de ${qtdVenda} de ${totalNoLote} animais por ${fmt(valorTotalVenda)}? (Sobrarão ${totalNoLote - qtdVenda} no lote)`;

  if (!confirm(mensagemConfirmacao)) return;

  try {
    const res = await authFetch(`/api/lotes/${loteAtual.id}/fechar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valorTotalVendaReal: valorTotalVenda,
        qtdVendida: qtdVenda,
        freteAbate: freteAbate,
        dataAbateReal: new Date().toISOString().split('T')[0]
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`Venda de ${qtdVenda} animais registrada com sucesso!`);
      await carregarLotes();
    } else {
      alert(data.message || 'Erro ao registrar venda.');
    }
  } catch (err) {
    alert('Erro ao salvar fechamento.');
  }
}

// Adicionar despesa
async function adicionarDespesa(e, tipo) {
  e.preventDefault();
  if (!verificarPermissaoEscrita("adicionar despesas ao lote")) return;
  if (!loteAtual) return;

  let data, descricao, qtd, unidade, valorTotal;

  if (tipo === 'racao') {
    data = document.getElementById('racao-data').value;
    descricao = document.getElementById('racao-desc').value;
    qtd = document.getElementById('racao-qtd').value;
    unidade = document.getElementById('racao-un').value;
    valorTotal = document.getElementById('racao-valor').value;
  } else {
    data = document.getElementById('med-data').value;
    descricao = document.getElementById('med-desc').value;
    qtd = 1;
    unidade = document.getElementById('med-un').value;
    valorTotal = document.getElementById('med-valor').value;
  }

  try {
    const res = await authFetch(`/api/lotes/${loteAtual.id}/despesas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        data,
        descricao,
        qtd,
        unidade,
        valorTotal
      })
    });
    const result = await res.json();
    if (result.success) {
      if (tipo === 'racao') {
        document.getElementById('racao-desc').value = '';
        document.getElementById('racao-valor').value = '';
      } else {
        document.getElementById('med-desc').value = '';
        document.getElementById('med-valor').value = '';
      }
      await trocarLote(loteAtual.id);
    } else {
      alert(result.message || 'Erro ao salvar despesa.');
    }
  } catch (err) {
    alert('Erro ao registrar despesa.');
  }
}

// Remover despesa
async function removerDespesa(despesaId) {
  if (!verificarPermissaoEscrita("excluir despesas do lote")) return;
  if (!confirm('Deseja realmente remover esta despesa?')) return;
  try {
    const res = await authFetch(`/api/lotes/${loteAtual.id}/despesas/${despesaId}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.success) {
      await trocarLote(loteAtual.id);
    } else {
      alert(result.message || 'Erro ao remover despesa.');
    }
  } catch (err) {
    alert('Erro ao remover despesa.');
  }
}

// Modais e Presets
function abrirModalNovoLote() {
  if (!verificarPermissaoEscrita("cadastrar um novo lote de animais")) return;
  document.getElementById('modal-novo-lote').classList.remove('hidden');
  atualizarDiasModalNovoLote();
}

function fecharModalNovoLote() {
  document.getElementById('modal-novo-lote').classList.add('hidden');
}

// Alternar modalidade no modal de novo lote (corrido vs fixo)
function definirModalidadeNovoLote(modo) {
  document.getElementById('novo-lote-modalidade').value = modo;
  const btnCorrido = document.getElementById('btn-modal-tipo-corrido');
  const btnFixo = document.getElementById('btn-modal-tipo-fixo');
  const boxCorrido = document.getElementById('novo-lote-box-corrido');
  const boxFixo = document.getElementById('novo-lote-box-fixo');

  if (modo === 'corrido') {
    btnCorrido.className = "py-2 px-2 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-emerald-900 flex items-center justify-center gap-1 transition-all font-bold";
    btnFixo.className = "py-2 px-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1 transition-all font-semibold";
    boxCorrido.classList.remove('hidden');
    boxFixo.classList.add('hidden');
  } else {
    btnCorrido.className = "py-2 px-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 flex items-center justify-center gap-1 transition-all font-semibold";
    btnFixo.className = "py-2 px-2 rounded-lg border-2 border-blue-600 bg-blue-50 text-blue-900 flex items-center justify-center gap-1 transition-all font-bold";
    boxCorrido.classList.add('hidden');
    boxFixo.classList.remove('hidden');
  }

  atualizarDiasModalNovoLote();
}

// Atualizar dias dinamicamente no modal
function atualizarDiasModalNovoLote() {
  const inputData = document.getElementById('novo-lote-data');
  if (!inputData) return;
  const dEntradaStr = inputData.value || new Date().toISOString().split('T')[0];

  const dEntrada = new Date(dEntradaStr);
  const hoje = new Date();
  const diffDias = Math.max(1, Math.ceil((hoje - dEntrada) / 86400000));

  const txtRodando = document.getElementById('novo-lote-dias-rodando-txt');
  if (txtRodando) {
    if (dEntradaStr === hoje.toISOString().split('T')[0]) {
      txtRodando.textContent = '1º dia (Início hoje)';
    } else {
      txtRodando.textContent = `${diffDias} dias rodando desde ${fmtData(dEntradaStr)}`;
    }
  }

  // Previsão se estiver no modo fixo
  const inputDias = document.getElementById('novo-lote-dias');
  const diasFixos = inputDias ? (Number(inputDias.value) || 120) : 120;
  aoMudarDiasFixosModal(diasFixos);
}

// Ao mudar a quantidade de dias fixos digitada
function aoMudarDiasFixosModal(dias) {
  const inputData = document.getElementById('novo-lote-data');
  if (!inputData) return;
  const dEntradaStr = inputData.value;
  if (!dEntradaStr) return;
  const dEntrada = new Date(dEntradaStr);
  const dFinal = new Date(dEntrada.getTime() + (Number(dias) * 86400000));
  const dFinalStr = dFinal.toISOString().split('T')[0];

  const inputFim = document.getElementById('novo-lote-data-fim');
  if (inputFim && inputFim.value !== dFinalStr) {
    inputFim.value = dFinalStr;
  }
  const txtPrev = document.getElementById('novo-lote-prev-abate-txt');
  if (txtPrev) {
    txtPrev.textContent = `Previsão: ${fmtData(dFinalStr)}`;
  }
}

// Botões rápidos de 30d, 60d, 90d, 120d no modal
function setDiasFixosModal(dias) {
  const inputDias = document.getElementById('novo-lote-dias');
  if (inputDias) inputDias.value = dias;
  aoMudarDiasFixosModal(dias);
}

// Ao mudar a data de abate específica no modal
function aoMudarDataFimModal(dataFimStr) {
  const inputData = document.getElementById('novo-lote-data');
  if (!inputData) return;
  const dEntradaStr = inputData.value;
  if (!dEntradaStr || !dataFimStr) return;
  const dEntrada = new Date(dEntradaStr);
  const dFim = new Date(dataFimStr);
  const diffDias = Math.max(1, Math.ceil((dFim - dEntrada) / 86400000));

  const inputDias = document.getElementById('novo-lote-dias');
  if (inputDias) inputDias.value = diffDias;
  const txtPrev = document.getElementById('novo-lote-prev-abate-txt');
  if (txtPrev) {
    txtPrev.textContent = `Ciclo calculado: ${diffDias} dias`;
  }
}

// Aplicar preset inteligente por animal selecionado
function aplicarPresetAnimal(cat) {
  const p = PRESETS_ANIMAIS[cat] || PRESETS_ANIMAIS.bovino;

  // Atualizar visual dos botões
  ['bovino', 'suino', 'ovino', 'caprino', 'avicola', 'outro'].forEach(c => {
    const btn = document.getElementById(`btn-preset-${c}`);
    if (btn) {
      if (c === cat) {
        btn.className = "p-2.5 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-left transition-all shadow-sm";
      } else {
        btn.className = "p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 text-left transition-all";
      }
    }
  });

  // Preencher campos do modal
  document.getElementById('novo-lote-categoria').value = p.categoria;
  document.getElementById('novo-lote-icone').value = p.icone;
  document.getElementById('novo-lote-nome').value = p.nome;
  document.getElementById('novo-lote-raca').value = p.raca;
  document.getElementById('novo-lote-qtd').value = p.qtd;
  document.getElementById('novo-lote-dias').value = p.dias;
  document.getElementById('novo-lote-compra').value = p.compra;
  document.getElementById('novo-lote-frete').value = p.frete;
  document.getElementById('novo-lote-modo-venda').value = p.modoVenda;
  document.getElementById('novo-lote-peso-abate').value = p.pesoAbate;

  atualizarDiasModalNovoLote();
}

// Salvar novo lote
async function salvarNovoLote(e) {
  e.preventDefault();
  const categoria = document.getElementById('novo-lote-categoria').value;
  const icone = document.getElementById('novo-lote-icone').value;
  const nome = document.getElementById('novo-lote-nome').value;
  const raca = document.getElementById('novo-lote-raca').value;
  const qtdAnimais = document.getElementById('novo-lote-qtd').value;
  const modalidadeCiclo = document.getElementById('novo-lote-modalidade').value;
  const dataEntrada = document.getElementById('novo-lote-data').value;
  
  let diasCiclo = 120;
  let dataPrevistaAbate = null;

  if (modalidadeCiclo === 'corrido') {
    const dEntrada = new Date(dataEntrada);
    const hoje = new Date();
    diasCiclo = Math.max(1, Math.ceil((hoje - dEntrada) / 86400000));
  } else {
    diasCiclo = Number(document.getElementById('novo-lote-dias').value) || 120;
    dataPrevistaAbate = document.getElementById('novo-lote-data-fim').value || null;
  }

  const compraPorCabeca = document.getElementById('novo-lote-compra').value;
  const freteEntrada = document.getElementById('novo-lote-frete').value;
  const modoVenda = document.getElementById('novo-lote-modo-venda').value;
  const pesoAbate = document.getElementById('novo-lote-peso-abate').value;

  try {
    const res = await authFetch('/api/lotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoria,
        icone,
        nome,
        racaPredominante: raca,
        qtdAnimais,
        modalidadeCiclo,
        diasCiclo,
        dataEntrada,
        dataPrevistaAbate,
        compraPorCabeca,
        freteEntrada,
        modoVenda,
        pesoVivoMedioKg: pesoAbate
      })
    });
    const data = await res.json();
    if (data.success) {
      fecharModalNovoLote();
      await carregarLotes();
      await trocarLote(data.lote.id);
    }
  } catch (err) {
    alert('Erro ao criar novo lote.');
  }
}

// ==========================================
// CONTROLE DO MENU MOBILE (CELULAR & TABLET)
// ==========================================
function toggleMenuMobile() {
  const menu = document.getElementById('menu-mobile-drawer');
  if (!menu) return;
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Evita scroll do fundo
  } else {
    menu.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function fecharMenuMobile() {
  const menu = document.getElementById('menu-mobile-drawer');
  if (menu) {
    menu.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

