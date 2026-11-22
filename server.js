const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Garantir diretório de dados
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Dados iniciais com animais típicos do Nordeste
function getInitialData() {
  const hoje = new Date();
  
  // Datas Lote 1 (Gado Bovino)
  const dEntradaBov = new Date(hoje.getTime() - (35 * 86400000));
  const dAbateBov = new Date(dEntradaBov.getTime() + (120 * 86400000));

  // Datas Lote 2 (Suínos / Porcos)
  const dEntradaSui = new Date(hoje.getTime() - (25 * 86400000));
  const dAbateSui = new Date(dEntradaSui.getTime() + (90 * 86400000));

  // Datas Lote 3 (Ovinos / Carneiros Santa Inês)
  const dEntradaOvi = new Date(hoje.getTime() - (20 * 86400000));
  const dAbateOvi = new Date(dEntradaOvi.getTime() + (75 * 86400000));

  return {
    lotes: [
      // ----------------------------------------------------
      // LOTE 1: BOVINOS DE CORTE (GADO)
      // ----------------------------------------------------
      {
        id: "lote-01",
        nome: "Lote 01 - 5 Garrotes Nelore em Confinamento",
        categoria: "bovino",
        icone: "🐂",
        especie: "Bovinos (Gado de Corte)",
        racaPredominante: "Nelore / Mestiço Sertanejo",
        qtdAnimais: 5,
        dataEntrada: dEntradaBov.toISOString().split('T')[0],
        modalidadeCiclo: "corrido",
        diasCiclo: 90,
        dataPrevistaAbate: dAbateBov.toISOString().split('T')[0],
        status: "ativo",
        
        compraPorCabeca: 2550.00, // Custo real de compra do garrote magro de 360 kg (12@)
        freteEntrada: 400.00,
        outrosCustosAquisicao: 0.00,

        modoVenda: "arroba", // Venda por Arroba (@) de Carcaça
        vendaPorCabecaEstimada: 4553.28, // 18,36 @ de carcaça x R$ 248,00
        vendaRealizada: false,
        pesoVivoMedioKg: 510, // Saída com 510 kg vivo
        rendimentoCarcaçaPct: 54, // 54% rendimento = 275,4 kg = 18,36 @
        precoArroba: 248.00, // Cotação média real Cepea / B3
        precoKgVivo: 13.50,
        precoKgCarcaca: 25.00,
        freteAbate: 350.00,
        valorTotalVendaReal: 0.00,

        despesas: [
          { id: "d-1", tipo: "racao", data: dEntradaBov.toISOString().split('T')[0], descricao: "Ração Concentrada 16% PB (Adaptação Inicial)", qtd: 10, unidade: "Sacos 40kg", valorUnitario: 82.00, valorTotal: 820.00, obs: "Adaptação de cocho nos primeiros 15 dias" },
          { id: "d-2", tipo: "racao", data: new Date(dEntradaBov.getTime() + 10*86400000).toISOString().split('T')[0], descricao: "Silagem de Milho com Grão (Volumoso Nobre)", qtd: 5, unidade: "Toneladas", valorUnitario: 250.00, valorTotal: 1250.00, obs: "Silagem de alta densidade energética" },
          { id: "d-3", tipo: "racao", data: new Date(dEntradaBov.getTime() + 20*86400000).toISOString().split('T')[0], descricao: "Ração Concentrada Engorda e Acabamento 18% PB", qtd: 35, unidade: "Sacos 40kg", valorUnitario: 88.00, valorTotal: 3080.00, obs: "Milho moído + Farelo de soja 46%" },
          { id: "d-4", tipo: "racao", data: new Date(dEntradaBov.getTime() + 25*86400000).toISOString().split('T')[0], descricao: "Núcleo Mineral com Virginiamicina e Monensina", qtd: 2, unidade: "Sacos 25kg", valorUnitario: 145.00, valorTotal: 290.00, obs: "Aditivo promotor de crescimento e ganho de carcaça" },
          { id: "d-5", tipo: "medicamento", data: dEntradaBov.toISOString().split('T')[0], descricao: "Protocolo Sanitário na Chegada (Clostridiose + Raiva)", qtd: 5, unidade: "doses", valorUnitario: 4.50, valorTotal: 22.50, obs: "Imunização completa na entrada" },
          { id: "d-6", tipo: "medicamento", data: dEntradaBov.toISOString().split('T')[0], descricao: "Endectocida Injetável Concentrado 3.15%", qtd: 1, unidade: "frasco 50ml", valorUnitario: 65.00, valorTotal: 65.00, obs: "Controle de parasitas internos e externos" },
          { id: "d-7", tipo: "medicamento", data: new Date(dEntradaBov.getTime() + 5*86400000).toISOString().split('T')[0], descricao: "Modificador Orgânico + Complexo Vitamínico ADE", qtd: 5, unidade: "doses", valorUnitario: 16.00, valorTotal: 80.00, obs: "Estímulo metabólico para ganho de peso acelerado" }
        ],

        animais: [
          { brinco: "BR-01", raca: "Nelore", pesoEntradaKg: 360, pesoAbateKg: 520, obs: "Ganho excelente (+160 kg)" },
          { brinco: "BR-02", raca: "Nelore x Guzerá", pesoEntradaKg: 365, pesoAbateKg: 530, obs: "Muito vigoroso (+165 kg)" },
          { brinco: "BR-03", raca: "Mestiço Sertanejo", pesoEntradaKg: 350, pesoAbateKg: 495, obs: "Uniforme e rústico (+145 kg)" },
          { brinco: "BR-04", raca: "Nelore Mocho", pesoEntradaKg: 370, pesoAbateKg: 525, obs: "Carcaça convexa (+155 kg)" },
          { brinco: "BR-05", raca: "Sindi x Nelore", pesoEntradaKg: 355, pesoAbateKg: 500, obs: "Precoce e bem acabado (+145 kg)" }
        ]
      },

      // ----------------------------------------------------
      // LOTE 2: SUÍNOS / PORCOS DE ENGORDA
      // ----------------------------------------------------
      {
        id: "lote-02",
        nome: "Lote 02 - 10 Porcos Caipiras / Engorda",
        categoria: "suino",
        icone: "🐖",
        especie: "Suínos (Porcos de Engorda)",
        racaPredominante: "Porco Caipira / Moura x Piau",
        qtdAnimais: 10,
        dataEntrada: dEntradaSui.toISOString().split('T')[0],
        diasCiclo: 90,
        dataPrevistaAbate: dAbateSui.toISOString().split('T')[0],
        status: "ativo",
        
        compraPorCabeca: 280.00, // Preço do leitão desmamado (25kg)
        freteEntrada: 150.00,
        outrosCustosAquisicao: 0.00,

        modoVenda: "kg_vivo", // vendido por kg vivo (muito comum no NE)
        vendaPorCabecaEstimada: 1050.00,
        vendaRealizada: false,
        pesoVivoMedioKg: 105, // 105 kg vivo no abate
        rendimentoCarcaçaPct: 74,
        precoArroba: 0.00,
        precoKgVivo: 10.50, // R$ 10,50 o kg vivo do porco
        precoKgCarcaca: 15.00,
        freteAbate: 180.00,
        valorTotalVendaReal: 0.00,

        despesas: [
          { id: "ds-1", tipo: "racao", data: dEntradaSui.toISOString().split('T')[0], descricao: "Ração Crescimento Suínos (18% PB)", qtd: 8, unidade: "Sacos 50kg", valorUnitario: 88.00, valorTotal: 704.00, obs: "Início da engorda dos 10 leitões" },
          { id: "ds-2", tipo: "racao", data: new Date(dEntradaSui.getTime() + 15*86400000).toISOString().split('T')[0], descricao: "Milho Moído e Farelo de Trigo", qtd: 12, unidade: "Sacos 50kg", valorUnitario: 65.00, valorTotal: 780.00, obs: "Mistura com farelo e soro" },
          { id: "ds-3", tipo: "racao", data: new Date(dEntradaSui.getTime() + 30*86400000).toISOString().split('T')[0], descricao: "Núcleo Mineral e Aminoácidos Suínos", qtd: 2, unidade: "Sacos 20kg", valorUnitario: 110.00, valorTotal: 220.00, obs: "Para ganho acelerado de carcaça" },
          { id: "ds-4", tipo: "medicamento", data: dEntradaSui.toISOString().split('T')[0], descricao: "Vermífugo Ivermectina Injetável", qtd: 1, unidade: "frasco 50ml", valorUnitario: 45.00, valorTotal: 45.00, obs: "Desverminação na chegada" },
          { id: "ds-5", tipo: "medicamento", data: dEntradaSui.toISOString().split('T')[0], descricao: "Ferro Dextrano + Complexo B", qtd: 10, unidade: "doses", valorUnitario: 4.00, valorTotal: 40.00, obs: "Reforço imunológico" }
        ],

        animais: [
          { brinco: "SU-01", raca: "Moura x Piau", pesoEntradaKg: 24, pesoAbateKg: 104, obs: "Bom ganho" },
          { brinco: "SU-02", raca: "Caipira", pesoEntradaKg: 26, pesoAbateKg: 108, obs: "Carne de primeira" },
          { brinco: "SU-03", raca: "Híbrido", pesoEntradaKg: 27, pesoAbateKg: 112, obs: "Muito precoce" },
          { brinco: "SU-04", raca: "Moura", pesoEntradaKg: 25, pesoAbateKg: 105, obs: "Uniforme" },
          { brinco: "SU-05", raca: "Caipira Canastra", pesoEntradaKg: 23, pesoAbateKg: 98, obs: "Rústico" }
        ]
      },

      // ----------------------------------------------------
      // LOTE 3: OVINOS / CARNEIROS SANTA INÊS (CORDEIRO DO NORDESTE)
      // ----------------------------------------------------
      {
        id: "lote-03",
        nome: "Lote 03 - 15 Carneiros Santa Inês",
        categoria: "ovino",
        icone: "🐑",
        especie: "Ovinos (Carneiros / Cordeiros)",
        racaPredominante: "Santa Inês Puro e Mestiço",
        qtdAnimais: 15,
        dataEntrada: dEntradaOvi.toISOString().split('T')[0],
        diasCiclo: 75,
        dataPrevistaAbate: dAbateOvi.toISOString().split('T')[0],
        status: "ativo",
        
        compraPorCabeca: 220.00, // Custo do borrego desmamado (18kg)
        freteEntrada: 180.00,
        outrosCustosAquisicao: 0.00,

        modoVenda: "cabeca", // vendido por cabeça ou kg vivo
        vendaPorCabecaEstimada: 540.00, // Preço médio de carneiro gordo no Nordeste
        vendaRealizada: false,
        pesoVivoMedioKg: 40, // 40kg vivo no abate (cordeiro pesado)
        rendimentoCarcaçaPct: 48,
        precoArroba: 0.00,
        precoKgVivo: 13.50,
        precoKgCarcaca: 28.00,
        freteAbate: 150.00,
        valorTotalVendaReal: 0.00,

        despesas: [
          { id: "do-1", tipo: "racao", data: dEntradaOvi.toISOString().split('T')[0], descricao: "Ração Balanceada Ovinos Confinamento", qtd: 10, unidade: "Sacos 40kg", valorUnitario: 75.00, valorTotal: 750.00, obs: "Concentrado 16% proteína" },
          { id: "do-2", tipo: "racao", data: new Date(dEntradaOvi.getTime() + 10*86400000).toISOString().split('T')[0], descricao: "Feno de Tifton / Palma Forrageira", qtd: 25, unidade: "Fardos", valorUnitario: 22.00, valorTotal: 550.00, obs: "Palma forrageira picada + feno" },
          { id: "do-3", tipo: "medicamento", data: dEntradaOvi.toISOString().split('T')[0], descricao: "Vermífugo Oral Ovinos (Albendazol / Levamisol)", qtd: 1, unidade: "frasco 250ml", valorUnitario: 58.00, valorTotal: 58.00, obs: "Controle rigoroso de Haemonchus" },
          { id: "do-4", tipo: "medicamento", data: dEntradaOvi.toISOString().split('T')[0], descricao: "Vacina Sintomática / Clostridiose Ovina", qtd: 15, unidade: "doses", valorUnitario: 3.50, valorTotal: 52.50, obs: "Proteção contra enterotoxemia" }
        ],

        animais: [
          { brinco: "OV-01", raca: "Santa Inês Vermelho", pesoEntradaKg: 19, pesoAbateKg: 42, obs: "Excelente acabamento" },
          { brinco: "OV-02", raca: "Santa Inês Preto", pesoEntradaKg: 18, pesoAbateKg: 40, obs: "Carcaça limpa" },
          { brinco: "OV-03", raca: "Santa Inês x Dorper", pesoEntradaKg: 20, pesoAbateKg: 44, obs: "Muito musculoso" },
          { brinco: "OV-04", raca: "Morada Nova", pesoEntradaKg: 17, pesoAbateKg: 38, obs: "Rústico do sertão" }
        ]
      }
    ]
  };
}

// ==========================================
// FUNÇÕES DE SEGURANÇA E AUTENTICAÇÃO
// ==========================================
function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(senha, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verificarSenha(senha, hashSalvo) {
  if (!hashSalvo || !hashSalvo.includes(':')) return false;
  const [salt, hashOriginal] = hashSalvo.split(':');
  const hashTentativa = crypto.pbkdf2Sync(senha, salt, 1000, 64, 'sha512').toString('hex');
  return hashOriginal === hashTentativa;
}

const JWT_SECRET = process.env.JWT_SECRET || 'agrolote_secret_salt_2026_master_key';

function gerarToken(usuarioId = 'usr-admin-master') {
  const timestamp = Date.now();
  const payload = `${usuarioId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return `agl_${Buffer.from(payload).toString('base64url')}.${hmac}`;
}

function extrairUsuarioIdDoToken(token, db) {
  if (!token) return null;
  // 1. Suporte a tokens em db.sessoes
  if (db && db.sessoes && db.sessoes[token]) {
    return db.sessoes[token];
  }
  // 2. Suporte a tokens autovalidáveis com HMAC
  if (typeof token === 'string' && token.startsWith('agl_')) {
    const parts = token.substring(4).split('.');
    if (parts.length === 2) {
      const [payloadB64, hmacRecebido] = parts;
      try {
        const payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
        const hmacEsperado = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
        if (hmacRecebido === hmacEsperado) {
          const [usuarioId] = payload.split(':');
          return usuarioId;
        }
      } catch (e) {}
    }
  }
  return null;
}

// Criar lote inicial personalizado de boas-vindas para o novo usuário
function criarLoteBoasVindas(usuarioId, categoriaEscolhida) {
  const cat = categoriaEscolhida || 'bovino';
  const hoje = new Date();
  const dEntrada = hoje.toISOString().split('T')[0];

  const presets = {
    bovino: {
      nome: "Lote 01 - Meus Bovinos de Corte",
      categoria: "bovino",
      icone: "🐂",
      especie: "Bovinos (Gado de Corte)",
      racaPredominante: "Nelore / Sertanejo",
      qtdAnimais: 6,
      compraPorCabeca: 2600,
      freteEntrada: 400,
      modoVenda: "cabeca",
      pesoVivoMedioKg: 510,
      vendaPorCabecaEstimada: 4450,
      despesas: [
        { id: "d-1", tipo: "racao", data: dEntrada, descricao: "Ração de Adaptação (14% PB)", qtd: 10, unidade: "Sacos 40kg", valorUnitario: 75, valorTotal: 750, obs: "Início do lote" },
        { id: "d-2", tipo: "medicamento", data: dEntrada, descricao: "Vacina Clostridiose + Vermífugo", qtd: 6, unidade: "doses", valorUnitario: 12, valorTotal: 72, obs: "Protocolo sanitário inicial" }
      ],
      animais: [
        { brinco: "BOV-01", raca: "Nelore", pesoEntradaKg: 360, pesoAbateKg: 520, obs: "Animal #1" },
        { brinco: "BOV-02", raca: "Nelore", pesoEntradaKg: 370, pesoAbateKg: 535, obs: "Animal #2" },
        { brinco: "BOV-03", raca: "Guzerá", pesoEntradaKg: 350, pesoAbateKg: 505, obs: "Animal #3" },
        { brinco: "BOV-04", raca: "Nelore", pesoEntradaKg: 380, pesoAbateKg: 540, obs: "Animal #4" },
        { brinco: "BOV-05", raca: "Mestiço", pesoEntradaKg: 345, pesoAbateKg: 495, obs: "Animal #5" },
        { brinco: "BOV-06", raca: "Nelore", pesoEntradaKg: 365, pesoAbateKg: 525, obs: "Animal #6" }
      ]
    },
    suino: {
      nome: "Lote 01 - Meus Suínos de Engorda",
      categoria: "suino",
      icone: "🐖",
      especie: "Suínos (Porcos de Engorda)",
      racaPredominante: "Porco Caipira / Moura",
      qtdAnimais: 10,
      compraPorCabeca: 280,
      freteEntrada: 150,
      modoVenda: "kg_vivo",
      pesoVivoMedioKg: 105,
      precoKgVivo: 11.00,
      vendaPorCabecaEstimada: 1155,
      despesas: [
        { id: "ds-1", tipo: "racao", data: dEntrada, descricao: "Ração Crescimento Suínos", qtd: 8, unidade: "Sacos 50kg", valorUnitario: 85, valorTotal: 680, obs: "Adaptação dos leitões" }
      ],
      animais: []
    },
    ovino: {
      nome: "Lote 01 - Meus Carneiros Santa Inês",
      categoria: "ovino",
      icone: "🐑",
      especie: "Ovinos (Carneiros)",
      racaPredominante: "Santa Inês Puro e Mestiço",
      qtdAnimais: 15,
      compraPorCabeca: 220,
      freteEntrada: 180,
      modoVenda: "cabeca",
      pesoVivoMedioKg: 40,
      vendaPorCabecaEstimada: 540,
      despesas: [],
      animais: []
    },
    caprino: {
      nome: "Lote 01 - Meus Bodes Moxotó",
      categoria: "caprino",
      icone: "🐐",
      especie: "Caprinos (Bodes)",
      racaPredominante: "Moxotó / SRD",
      qtdAnimais: 12,
      compraPorCabeca: 190,
      freteEntrada: 120,
      modoVenda: "cabeca",
      pesoVivoMedioKg: 35,
      vendaPorCabecaEstimada: 480,
      despesas: [],
      animais: []
    },
    avicola: {
      nome: "Lote 01 - Meus Frangos Caipiras",
      categoria: "avicola",
      icone: "🐓",
      especie: "Aves (Frango Caipira)",
      racaPredominante: "Pescoço Pelado / Caipirão",
      qtdAnimais: 50,
      compraPorCabeca: 5.00,
      freteEntrada: 50,
      modoVenda: "cabeca",
      pesoVivoMedioKg: 2.8,
      vendaPorCabecaEstimada: 50.00,
      despesas: [],
      animais: []
    }
  };

  const p = presets[cat] || presets.bovino;
  return {
    id: `lote-${Date.now()}`,
    usuarioId,
    nome: p.nome,
    categoria: p.categoria,
    icone: p.icone,
    especie: p.especie,
    racaPredominante: p.racaPredominante,
    qtdAnimais: p.qtdAnimais,
    dataEntrada: dEntrada,
    modalidadeCiclo: "corrido",
    diasCiclo: 90,
    dataPrevistaAbate: new Date(hoje.getTime() + (90 * 86400000)).toISOString().split('T')[0],
    status: "ativo",
    compraPorCabeca: p.compraPorCabeca,
    freteEntrada: p.freteEntrada,
    outrosCustosAquisicao: 0,
    modoVenda: p.modoVenda,
    vendaPorCabecaEstimada: p.vendaPorCabecaEstimada,
    vendaRealizada: false,
    pesoVivoMedioKg: p.pesoVivoMedioKg,
    rendimentoCarcaçaPct: cat === 'suino' ? 74 : cat === 'ovino' ? 48 : cat === 'caprino' ? 46 : cat === 'avicola' ? 72 : 54,
    precoArroba: 245,
    precoKgVivo: 11,
    freteAbate: 0,
    valorTotalVendaReal: 0,
    despesas: p.despesas || [],
    animais: p.animais || []
  };
}

// Leitura do banco com migração de usuários e sessões
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      initial.usuarios = [
        {
          id: "usr-demo",
          nome: "Produtor Demonstração",
          email: "demo@pecuaria.com",
          senhaHash: hashSenha("123456"),
          criadoEm: new Date().toISOString()
        }
      ];
      initial.sessoes = {};
      initial.lotes.forEach(l => l.usuarioId = "usr-demo");
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(content);
    let mudou = false;

    if (!Array.isArray(db.usuarios)) {
      db.usuarios = [
        {
          id: "usr-demo",
          nome: "Produtor Demonstração",
          email: "demo@pecuaria.com",
          senhaHash: hashSenha("123456"),
          criadoEm: new Date().toISOString()
        }
      ];
      mudou = true;
    }
    if (!db.sessoes || typeof db.sessoes !== 'object') {
      db.sessoes = {};
      mudou = true;
    }
    if (!Array.isArray(db.lotes)) {
      db.lotes = [];
      mudou = true;
    }

    if (!Array.isArray(db.codigosConvite) || db.codigosConvite.length === 0) {
      db.codigosConvite = [
        { codigo: "AGRO2026", descricao: "Código Padrão Agro 2026", maxUsos: 999, usadoPor: [], ativo: true, criadoEm: new Date().toISOString() },
        { codigo: "NORDESTE88", descricao: "Produtores da Região Nordeste", maxUsos: 100, usadoPor: [], ativo: true, criadoEm: new Date().toISOString() },
        { codigo: "FAZENDA-VIP", descricao: "Convite Especial Fazenda VIP", maxUsos: 50, usadoPor: [], ativo: true, criadoEm: new Date().toISOString() },
        { codigo: "CONVITE-LUCAS", descricao: "Código Pessoal do Administrador", maxUsos: 100, usadoPor: [], ativo: true, criadoEm: new Date().toISOString() }
      ];
      mudou = true;
    }

    // Vincular lotes existentes sem usuarioId ao usuario demo padrão
    db.lotes.forEach(l => {
      if (!l.usuarioId) {
        l.usuarioId = "usr-demo";
        mudou = true;
      }
    });

    if (mudou) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
    return db;
  } catch (err) {
    console.error("Erro ao ler banco:", err);
    return getInitialData();
  }
}

// Escrita do banco
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Erro ao gravar banco:", err);
    return false;
  }
}

// Middleware de autenticação por token ou fallback
function autenticarUsuario(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  const db = readDb();
  let usuarioId = extrairUsuarioIdDoToken(token, db);
  let isVisitante = false;

  // Fallback para visitante ou acesso direto (modo demonstração)
  if (!usuarioId) {
    const usrPadrao = (db.usuarios && db.usuarios[0]) || null;
    usuarioId = usrPadrao ? usrPadrao.id : 'usr-demo';
    isVisitante = true;
  }

  req.usuarioId = usuarioId;
  req.isVisitante = isVisitante || usuarioId === 'usr-demo';
  req.usuario = (db.usuarios || []).find(u => u.id === usuarioId) || null;
  next();
}

// Middleware de bloqueio de escrita no modo de demonstração (somente leitura)
function bloquearEscritaVisitante(req, res, next) {
  if (req.isVisitante || !req.usuario || req.usuario.id === 'usr-demo') {
    return res.status(403).json({
      success: false,
      isVisitante: true,
      message: "Modo Demonstração (Somente Leitura): Não é permitido criar, alterar ou excluir dados no modo de exemplo. Crie uma conta com um código de convite para cadastrar e gerenciar seus próprios animais."
    });
  }
  next();
}

function ehUsuarioAdmin(usuario) {
  if (!usuario) return false;
  if (usuario.role === 'admin') return true;
  if (usuario.email && String(usuario.email).trim().toLowerCase() === 'admin@agrolote.com') return true;
  return false;
}

// Middleware para exigir nível de Administrador (Dono do Sistema)
function exigirAdmin(req, res, next) {
  if (req.isVisitante || !ehUsuarioAdmin(req.usuario)) {
    return res.status(403).json({
      success: false,
      precisaLogin: true,
      message: "Acesso Restrito: Apenas o Administrador do sistema tem permissão para visualizar e gerar links de convite. Se sua sessão expirou, faça login novamente com admin@agrolote.com."
    });
  }
  next();
}


// Função de cálculo financeiro completo do lote
function calcularIndicadoresLote(lote) {
  const qtdAnimais = Number(lote.qtdAnimais) || 1;
  const diasCiclo = Number(lote.diasCiclo) || 120;
  
  // 1. Custo de Aquisição
  const custoCompraAnimais = (Number(lote.compraPorCabeca) || 0) * qtdAnimais;
  const freteEntrada = Number(lote.freteEntrada) || 0;
  const outrosAquisicao = Number(lote.outrosCustosAquisicao) || 0;
  const totalAquisicao = custoCompraAnimais + freteEntrada + outrosAquisicao;

  // 2. Custos Operacionais (despesas acumuladas)
  const despesas = lote.despesas || [];
  let totalRacao = 0;
  let totalMedicamentos = 0;
  let totalOutros = 0;

  despesas.forEach(d => {
    const v = Number(d.valorTotal) || 0;
    if (d.tipo === 'racao') totalRacao += v;
    else if (d.tipo === 'medicamento') totalMedicamentos += v;
    else totalOutros += v;
  });

  const freteAbate = Number(lote.freteAbate) || 0;
  const totalCustosOperacionais = totalRacao + totalMedicamentos + totalOutros + freteAbate;

  // 3. Custo Total Geral
  const custoTotalAcumulado = totalAquisicao + totalCustosOperacionais;
  const custoPorCabeca = custoTotalAcumulado / qtdAnimais;

  // Dias decorridos
  const hoje = new Date();
  const dEntrada = new Date(lote.dataEntrada);
  const diasRodandoReais = Math.max(1, Math.ceil((hoje - dEntrada) / (1000 * 60 * 60 * 24)));
  
  let diasDecorridos = diasRodandoReais;
  let diasCicloCalculo = Number(lote.diasCiclo) || 120;
  
  if (lote.modalidadeCiclo === 'corrido') {
    diasDecorridos = diasRodandoReais;
    diasCicloCalculo = Math.max(diasRodandoReais, Number(lote.diasCiclo) || diasRodandoReais);
  } else {
    diasDecorridos = Math.min(diasCicloCalculo, diasRodandoReais);
  }
  const diasRestantes = Math.max(0, diasCicloCalculo - diasDecorridos);

  // Custo da diária de alimentação e saúde por animal
  const custoDiariaCabeca = (totalRacao + totalMedicamentos) / qtdAnimais / (diasDecorridos || 1);

  // 4. Receita da Venda (Suporta Arroba, Kg Vivo, Kg Carcaça e Preço Fechado por Cabeça)
  let receitaTotal = 0;
  let precoVendaPorCabeca = 0;
  const pesoVivo = Number(lote.pesoVivoMedioKg) || (lote.categoria === 'suino' ? 105 : lote.categoria === 'ovino' ? 40 : 510);
  const rendimento = (Number(lote.rendimentoCarcaçaPct) || (lote.categoria === 'suino' ? 74 : lote.categoria === 'ovino' ? 48 : 54)) / 100;

  if (lote.vendaRealizada && Number(lote.valorTotalVendaReal) > 0) {
    receitaTotal = Number(lote.valorTotalVendaReal);
    precoVendaPorCabeca = receitaTotal / qtdAnimais;
  } else {
    const qtdVendaCalc = Number(lote.qtdVendida) || qtdAnimais;

    if (lote.modoVenda === 'arroba') {
      // Venda por Arroba (@) de carcaça (típico de gado bovino)
      const precoArr = Number(lote.precoArroba) || 245;
      const arrobasPorAnimal = (pesoVivo * rendimento) / 15;
      precoVendaPorCabeca = arrobasPorAnimal * precoArr;
      receitaTotal = precoVendaPorCabeca * qtdVendaCalc;
    } else if (lote.modoVenda === 'kg_vivo') {
      // Venda por Kg Vivo (muito comum em porco, carneiro, bode e frango)
      const precoKgVivo = Number(lote.precoKgVivo) || 10.50;
      precoVendaPorCabeca = pesoVivo * precoKgVivo;
      receitaTotal = precoVendaPorCabeca * qtdVendaCalc;
    } else if (lote.modoVenda === 'kg_carcaca') {
      // Venda por Kg de Carcaça Limpa
      const precoKgCarcaca = Number(lote.precoKgCarcaca) || 20.00;
      const pesoCarcacaKg = pesoVivo * rendimento;
      precoVendaPorCabeca = pesoCarcacaKg * precoKgCarcaca;
      receitaTotal = precoVendaPorCabeca * qtdVendaCalc;
    } else {
      // Modo Preço Fechado por Cabeça
      precoVendaPorCabeca = Number(lote.vendaPorCabecaEstimada) || 4450;
      receitaTotal = precoVendaPorCabeca * qtdVendaCalc;
    }
  }

  // 5. Lucro Líquido (calculado sobre a quantidade de animais vendidos)
  const qtdVendaEfetiva = Number(lote.qtdVendida) || qtdAnimais;
  const fatorProporcao = qtdVendaEfetiva / qtdAnimais;
  const custoTotalProporcionalVenda = custoTotalAcumulado * fatorProporcao;
  const lucroLiquidoTotal = receitaTotal - custoTotalProporcionalVenda;
  const lucroLiquidoPorCabeca = qtdVendaEfetiva > 0 ? (lucroLiquidoTotal / qtdVendaEfetiva) : 0;
  const margemLucroPct = receitaTotal > 0 ? (lucroLiquidoTotal / receitaTotal) * 100 : 0;
  const retornoInvestimentoPct = custoTotalProporcionalVenda > 0 ? (lucroLiquidoTotal / custoTotalProporcionalVenda) * 100 : 0;
  const precoEquilibrioPorCabeca = custoTotalAcumulado / qtdAnimais;
  const qtdAnimaisRestantes = Math.max(0, qtdAnimais - qtdVendaEfetiva);

  // Ícone automático de acordo com a espécie/categoria se não definido
  let icone = lote.icone;
  if (!icone) {
    const cat = (lote.categoria || lote.especie || "").toLowerCase();
    if (cat.includes('suino') || cat.includes('porco')) icone = '🐖';
    else if (cat.includes('ovino') || cat.includes('carneiro') || cat.includes('cordeiro')) icone = '🐑';
    else if (cat.includes('caprino') || cat.includes('bode') || cat.includes('cabrito')) icone = '🐐';
    else if (cat.includes('ave') || cat.includes('frango') || cat.includes('galinha')) icone = '🐓';
    else icone = '🐂';
  }

  return {
    ...lote,
    icone,
    totais: {
      custoCompraAnimais,
      freteEntrada,
      totalAquisicao,
      totalRacao,
      totalMedicamentos,
      totalOutros,
      freteAbate,
      totalCustosOperacionais,
      custoTotalAcumulado,
      custoPorCabeca,
      diasDecorridos,
      diasRestantes,
      custoDiariaCabeca,
      receitaTotal,
      precoVendaPorCabeca,
      lucroLiquidoTotal,
      lucroLiquidoPorCabeca,
      margemLucroPct,
      retornoInvestimentoPct,
      precoEquilibrioPorCabeca,
      qtdVendida: qtdVendaEfetiva,
      qtdRestante: qtdAnimaisRestantes,
      custoTotalProporcionalVenda
    }
  };
}

// ==========================================
// ROTAS DE AUTENTICAÇÃO (SISTEMA MULTI-USUÁRIO)
// ==========================================

// Cadastrar novo usuário (exige Código de Convite válido)
app.post('/api/auth/cadastro', (req, res) => {
  const db = readDb();
  const { nome, email, senha, animalPrincipal, codigoConvite } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' });
  }

  // Validação do Código de Convite (Opcional: permite cadastro livre sem código)
  const codigoInformado = String(codigoConvite || '').trim().toUpperCase();
  let ehAdmin = false;
  let convite = null;

  if (codigoInformado) {
    convite = (db.codigosConvite || []).find(c => String(c.codigo).trim().toUpperCase() === codigoInformado && c.ativo !== false);
    if (!convite) {
      return res.status(403).json({ 
        success: false, 
        message: 'Código de convite inválido ou inativo. Deixe o campo em branco para se cadastrar livremente ou informe um código válido.' 
      });
    }

    if (convite.maxUsos && (convite.usadoPor || []).length >= convite.maxUsos) {
      return res.status(403).json({ 
        success: false, 
        message: 'Este código de convite já atingiu o limite máximo de cadastros.' 
      });
    }

    ehAdmin = convite.isAdmin === true;
  }

  if (senha.length < 4) {
    return res.status(400).json({ success: false, message: 'A senha deve ter no mínimo 4 caracteres.' });
  }

  const emailNorm = String(email).trim().toLowerCase();
  const jaExiste = (db.usuarios || []).some(u => String(u.email).toLowerCase() === emailNorm);
  if (jaExiste) {
    return res.status(400).json({ success: false, message: 'Já existe uma conta cadastrada com este e-mail. Faça login.' });
  }

  const novoUsuario = {
    id: `usr-${Date.now()}`,
    nome: String(nome).trim(),
    email: emailNorm,
    senhaHash: hashSenha(String(senha)),
    role: ehAdmin ? 'admin' : 'produtor',
    codigoConviteUtilizado: codigoInformado || null,
    criadoEm: new Date().toISOString()
  };

  db.usuarios.push(novoUsuario);

  // Registrar uso no convite caso tenha sido informado
  if (convite) {
    convite.usadoPor = convite.usadoPor || [];
    convite.usadoPor.push({
      usuarioId: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      usadoEm: new Date().toISOString()
    });
  }


  // Novos usuários iniciam com a plataforma 100% limpa (sem nenhum lote fictício cadastrado)
  // O próprio produtor cadastra seus lotes reais quando desejar através do botão "+ Novo Lote"

  // Gerar sessão
  const token = gerarToken(novoUsuario.id);
  db.sessoes[token] = novoUsuario.id;

  writeDb(db);

  res.status(201).json({
    success: true,
    message: ehAdmin ? 'Conta de Administrador criada com sucesso! Você tem acesso total à gestão de convites.' : 'Conta criada e autorizada com sucesso!',
    token,
    usuario: {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      role: novoUsuario.role
    }
  });
});

// Login de usuário
app.post('/api/auth/login', (req, res) => {
  const db = readDb();
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }

  const emailNorm = String(email).trim().toLowerCase();
  const usuario = (db.usuarios || []).find(u => String(u.email).toLowerCase() === emailNorm);

  if (!usuario || !verificarSenha(String(senha), usuario.senhaHash)) {
    return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
  }

  const token = gerarToken(usuario.id);
  db.sessoes[token] = usuario.id;

  const ehAdmin = ehUsuarioAdmin(usuario);
  if (ehAdmin && usuario.role !== 'admin') {
    usuario.role = 'admin';
  }
  writeDb(db);

  res.json({
    success: true,
    message: 'Login realizado com sucesso!',
    token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: ehAdmin ? 'admin' : (usuario.role || 'produtor')
    }
  });
});

// Dados do usuário logado
app.get('/api/auth/me', autenticarUsuario, (req, res) => {
  if (!req.usuario) {
    return res.status(401).json({ success: false, message: 'Não autenticado' });
  }
  const ehAdmin = ehUsuarioAdmin(req.usuario);
  res.json({
    success: true,
    usuario: {
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email,
      role: ehAdmin ? 'admin' : (req.usuario.role || 'produtor')
    }
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const db = readDb();
    if (db.sessoes && db.sessoes[token]) {
      delete db.sessoes[token];
      writeDb(db);
    }
  }
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// ==========================================
// ROTAS DE CÓDIGOS E LINKS DE CONVITE (GERENCIAMENTO ADMIN)
// ==========================================

// Listar links e códigos de convite com detalhes de quem resgatou (SOMENTE ADMINISTRADOR)
app.get('/api/convites', autenticarUsuario, exigirAdmin, (req, res) => {
  const db = readDb();
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;

  const lista = (db.codigosConvite || []).map(c => {
    // Buscar no db.usuarios todos os usuários cadastrados com este código
    const usuariosDoCodigo = (db.usuarios || []).filter(u => 
      u.codigoConviteUtilizado && 
      String(u.codigoConviteUtilizado).trim().toUpperCase() === String(c.codigo).trim().toUpperCase()
    );

    // Combinar com c.usadoPor sem duplicar e-mails
    const listaUsuarios = [...(c.usadoPor || [])];
    usuariosDoCodigo.forEach(u => {
      if (!listaUsuarios.some(item => item.email && item.email.toLowerCase() === u.email.toLowerCase())) {
        listaUsuarios.push({
          usuarioId: u.id,
          nome: u.nome,
          email: u.email,
          usadoEm: u.criadoEm || c.criadoEm
        });
      }
    });

    return {
      codigo: c.codigo,
      linkCompleto: `${baseUrl}/?convite=${encodeURIComponent(c.codigo)}`,
      descricao: c.descricao,
      ativo: c.ativo !== false,
      isAdmin: !!c.isAdmin,
      maxUsos: c.maxUsos || 999,
      totalUsos: listaUsuarios.length,
      vagasRestantes: Math.max(0, (c.maxUsos || 999) - listaUsuarios.length),
      usadoPor: listaUsuarios,
      criadoEm: c.criadoEm
    };
  });
  res.json({ success: true, convites: lista });
});

// Listar todos os produtores cadastrados no sistema (SOMENTE ADMINISTRADOR)
app.get('/api/admin/usuarios', autenticarUsuario, exigirAdmin, (req, res) => {
  const db = readDb();
  const usuarios = (db.usuarios || [])
    .filter(u => u.id !== 'usr-admin-master' && u.id !== 'usr-demo')
    .map(u => {
      const qtdLotes = (db.lotes || []).filter(l => l.usuarioId === u.id).length;
      return {
        id: u.id,
        nome: u.nome,
        email: u.email,
        role: u.role || 'produtor',
        codigoConviteUtilizado: u.codigoConviteUtilizado || 'Cadastro Livre (Sem Código)',
        criadoEm: u.criadoEm || 'N/A',
        qtdLotes
      };
    });
  res.json({ success: true, total: usuarios.length, usuarios });
});

// Criar novo código e link de convite (SOMENTE ADMINISTRADOR)
app.post('/api/convites', autenticarUsuario, exigirAdmin, (req, res) => {
  const db = readDb();
  let { codigo, descricao, maxUsos } = req.body;

  // Se não informou código, gerar um código automático limpo
  if (!codigo || !String(codigo).trim()) {
    codigo = `AGRO-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const codNorm = String(codigo).trim().toUpperCase().replace(/\s+/g, '-');
  const jaExiste = (db.codigosConvite || []).some(c => c.codigo.toUpperCase() === codNorm);
  if (jaExiste) {
    return res.status(400).json({ success: false, message: `O código ou link "${codNorm}" já existe no sistema.` });
  }

  const novoConvite = {
    codigo: codNorm,
    descricao: descricao || 'Link de convite gerado pelo administrador',
    maxUsos: Number(maxUsos) || 50,
    isAdmin: false, // Novos convites para clientes são sempre produtores normais
    usadoPor: [],
    ativo: true,
    criadoEm: new Date().toISOString()
  };

  db.codigosConvite = db.codigosConvite || [];
  db.codigosConvite.push(novoConvite);
  writeDb(db);

  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;
  const linkCompleto = `${baseUrl}/?convite=${encodeURIComponent(codNorm)}`;

  res.status(201).json({
    success: true,
    message: `Link de convite com código ${codNorm} gerado com sucesso!`,
    convite: {
      ...novoConvite,
      linkCompleto,
      totalUsos: 0,
      vagasRestantes: novoConvite.maxUsos
    }
  });
});

// Excluir código de convite (SOMENTE ADMINISTRADOR)
app.delete('/api/convites/:codigo', autenticarUsuario, exigirAdmin, (req, res) => {
  const db = readDb();
  const codParam = String(req.params.codigo).trim().toUpperCase();

  // Não permitir excluir o código master de recuperação
  if (codParam === 'ADMIN-MESTRE-2026') {
    return res.status(400).json({ success: false, message: 'O código ADMIN-MESTRE-2026 não pode ser excluído.' });
  }

  const idx = (db.codigosConvite || []).findIndex(c => c.codigo.toUpperCase() === codParam);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Código de convite não encontrado.' });
  }

  db.codigosConvite.splice(idx, 1);
  writeDb(db);

  res.json({ success: true, message: `Código de convite ${codParam} removido com sucesso!` });
});


// ==========================================
// ROTAS DE LOTES E CONTABILIDADE (ISOLADAS POR USUÁRIO)
// ==========================================

// Listar todos os lotes com indicadores calculados (filtrados por usuário)
app.get('/api/lotes', autenticarUsuario, (req, res) => {
  const db = readDb();
  const lotesDoUsuario = (db.lotes || []).filter(l => l.usuarioId === req.usuarioId);
  const lotesCalculados = lotesDoUsuario.map(calcularIndicadoresLote);
  const ehAdmin = ehUsuarioAdmin(req.usuario);
  res.json({
    success: true,
    lotes: lotesCalculados,
    usuario: req.usuario ? {
      id: req.usuario.id,
      nome: req.usuario.nome,
      email: req.usuario.email,
      role: ehAdmin ? 'admin' : (req.usuario.role || 'produtor')
    } : null
  });
});

// Obter um lote específico por ID
app.get('/api/lotes/:id', autenticarUsuario, (req, res) => {
  const db = readDb();
  const lote = (db.lotes || []).find(l => l.id === req.params.id && l.usuarioId === req.usuarioId);
  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote não encontrado' });
  }
  res.json({ success: true, lote: calcularIndicadoresLote(lote) });
});

// Criar novo lote (bloqueado para visitantes)
app.post('/api/lotes', autenticarUsuario, bloquearEscritaVisitante, (req, res) => {
  const db = readDb();
  const { 
    nome, 
    categoria, 
    icone,
    especie, 
    racaPredominante,
    qtdAnimais, 
    dataEntrada, 
    modalidadeCiclo,
    diasCiclo, 
    dataPrevistaAbate,
    compraPorCabeca, 
    freteEntrada,
    modoVenda,
    pesoVivoMedioKg,
    precoArroba,
    precoKgVivo,
    vendaPorCabecaEstimada
  } = req.body;

  if (!nome || !qtdAnimais) {
    return res.status(400).json({ success: false, message: 'Nome do lote e quantidade de animais são obrigatórios.' });
  }

  const dEntrada = dataEntrada || new Date().toISOString().split('T')[0];
  const modCiclo = modalidadeCiclo || 'corrido';
  
  let duracao = Number(diasCiclo) || 120;
  let dPrevista = dataPrevistaAbate;

  if (dPrevista && !diasCiclo) {
    const diff = Math.ceil((new Date(dPrevista) - new Date(dEntrada)) / (86400000));
    duracao = Math.max(1, diff);
  } else if (!dPrevista) {
    dPrevista = new Date(new Date(dEntrada).getTime() + (duracao * 86400000)).toISOString().split('T')[0];
  }

  // Identificar categoria e ícone
  let cat = categoria || "bovino";
  let ic = icone;
  if (!ic) {
    if (cat === 'suino') ic = '🐖';
    else if (cat === 'ovino') ic = '🐑';
    else if (cat === 'caprino') ic = '🐐';
    else if (cat === 'avicola') ic = '🐓';
    else ic = '🐂';
  }

  // Rendimento padrão
  let rendimento = 54;
  if (cat === 'suino') rendimento = 74;
  else if (cat === 'ovino') rendimento = 48;
  else if (cat === 'caprino') rendimento = 46;
  else if (cat === 'avicola') rendimento = 72;

  const novoLote = {
    id: `lote-${Date.now()}`,
    usuarioId: req.usuarioId,
    nome,
    categoria: cat,
    icone: ic,
    especie: especie || (cat === 'suino' ? 'Suínos (Porcos)' : cat === 'ovino' ? 'Ovinos (Carneiros)' : cat === 'caprino' ? 'Caprinos (Bodes)' : cat === 'avicola' ? 'Aves (Frangos)' : 'Bovinos (Gado)'),
    racaPredominante: racaPredominante || "",
    qtdAnimais: Number(qtdAnimais),
    dataEntrada: dEntrada,
    modalidadeCiclo: modCiclo,
    diasCiclo: duracao,
    dataPrevistaAbate: dPrevista,
    status: "ativo",
    compraPorCabeca: Number(compraPorCabeca) || 0,
    freteEntrada: Number(freteEntrada) || 0,
    outrosCustosAquisicao: 0,
    modoVenda: modoVenda || (cat === 'suino' || cat === 'ovino' || cat === 'caprino' ? 'kg_vivo' : cat === 'bovino' ? 'arroba' : 'cabeca'),
    vendaPorCabecaEstimada: Number(vendaPorCabecaEstimada) || 0,
    vendaRealizada: false,
    pesoVivoMedioKg: Number(pesoVivoMedioKg) || (cat === 'suino' ? 100 : cat === 'ovino' ? 40 : cat === 'caprino' ? 35 : cat === 'avicola' ? 3 : 510),
    rendimentoCarcaçaPct: rendimento,
    precoArroba: Number(precoArroba) || 245,
    precoKgVivo: Number(precoKgVivo) || 11.00,
    precoKgCarcaca: 20.00,
    freteAbate: 0,
    valorTotalVendaReal: 0,
    despesas: [],
    animais: []
  };

  db.lotes.push(novoLote);
  writeDb(db);
  res.status(201).json({ success: true, lote: calcularIndicadoresLote(novoLote) });
});

// Atualizar dados de um lote (bloqueado para visitantes)
app.put('/api/lotes/:id', autenticarUsuario, bloquearEscritaVisitante, (req, res) => {
  const db = readDb();
  const idx = (db.lotes || []).findIndex(l => l.id === req.params.id && l.usuarioId === req.usuarioId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Lote não encontrado' });
  }

  db.lotes[idx] = {
    ...db.lotes[idx],
    ...req.body,
    id: req.params.id,
    usuarioId: req.usuarioId
  };

  writeDb(db);
  res.json({ success: true, lote: calcularIndicadoresLote(db.lotes[idx]) });
});

// Excluir lote (bloqueado para visitantes)
app.delete('/api/lotes/:id', autenticarUsuario, bloquearEscritaVisitante, (req, res) => {
  const db = readDb();
  const inicial = db.lotes.length;
  db.lotes = db.lotes.filter(l => !(l.id === req.params.id && l.usuarioId === req.usuarioId));
  if (db.lotes.length === inicial) {
    return res.status(404).json({ success: false, message: 'Lote não encontrado' });
  }
  writeDb(db);
  res.json({ success: true, message: 'Lote excluído com sucesso.' });
});

// Adicionar despesa a um lote (bloqueado para visitantes)
app.post('/api/lotes/:id/despesas', autenticarUsuario, bloquearEscritaVisitante, (req, res) => {
  const db = readDb();
  const lote = (db.lotes || []).find(l => l.id === req.params.id && l.usuarioId === req.usuarioId);
  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote não encontrado' });
  }

  const { tipo, data, descricao, qtd, unidade, valorUnitario, valorTotal, obs } = req.body;
  if (!tipo || !descricao) {
    return res.status(400).json({ success: false, message: 'Tipo e descrição da despesa são obrigatórios.' });
  }

  const q = Number(qtd) || 1;
  const u = Number(valorUnitario) || 0;
  const total = Number(valorTotal) > 0 ? Number(valorTotal) : (q * u);

  const novaDespesa = {
    id: `d-${Date.now()}`,
    tipo: tipo, // 'racao', 'medicamento' ou 'outros'
    data: data || new Date().toISOString().split('T')[0],
    descricao,
    qtd: q,
    unidade: unidade || "un",
    valorUnitario: u,
    valorTotal: total,
    obs: obs || ""
  };

  lote.despesas = lote.despesas || [];
  lote.despesas.push(novaDespesa);
  writeDb(db);

  res.status(201).json({ success: true, despesa: novaDespesa, lote: calcularIndicadoresLote(lote) });
});

// Remover despesa de um lote (bloqueado para visitantes)
app.delete('/api/lotes/:id/despesas/:despesaId', autenticarUsuario, bloquearEscritaVisitante, (req, res) => {
  const db = readDb();
  const lote = (db.lotes || []).find(l => l.id === req.params.id && l.usuarioId === req.usuarioId);
  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote não encontrado' });
  }

  const inicial = (lote.despesas || []).length;
  lote.despesas = (lote.despesas || []).filter(d => d.id !== req.params.despesaId);
  if (lote.despesas.length === inicial) {
    return res.status(404).json({ success: false, message: 'Despesa não encontrada' });
  }

  writeDb(db);
  res.json({ success: true, message: 'Despesa removida', lote: calcularIndicadoresLote(lote) });
});

// Registrar fechamento de abate / venda do lote (bloqueado para visitantes)
app.post('/api/lotes/:id/fechar', autenticarUsuario, bloquearEscritaVisitante, (req, res) => {
  const db = readDb();
  const lote = (db.lotes || []).find(l => l.id === req.params.id && l.usuarioId === req.usuarioId);
  if (!lote) {
    return res.status(404).json({ success: false, message: 'Lote não encontrado' });
  }

  const { valorTotalVendaReal, freteAbate, dataAbateReal, obsFechamento, qtdVendida } = req.body;
  lote.vendaRealizada = true;
  lote.qtdVendida = Number(qtdVendida) || lote.qtdAnimais;
  lote.status = lote.qtdVendida < lote.qtdAnimais ? "venda_parcial" : "finalizado";
  lote.valorTotalVendaReal = Number(valorTotalVendaReal) || (lote.vendaPorCabecaEstimada * lote.qtdVendida);
  if (freteAbate !== undefined) lote.freteAbate = Number(freteAbate);
  if (dataAbateReal) lote.dataAbateReal = dataAbateReal;
  if (obsFechamento) lote.obsFechamento = obsFechamento;

  writeDb(db);
  res.json({ success: true, message: 'Abate e fechamento registrados com sucesso!', lote: calcularIndicadoresLote(lote) });
});

// Rota de Backup completo dos lotes do usuário autenticado
app.get('/api/backup', autenticarUsuario, (req, res) => {
  const db = readDb();
  const lotesDoUsuario = (db.lotes || []).filter(l => l.usuarioId === req.usuarioId);
  const backupData = {
    versao: "2.0-multi-usuario",
    geradoEm: new Date().toISOString(),
    usuario: req.usuario ? { id: req.usuario.id, nome: req.usuario.nome, email: req.usuario.email } : null,
    totalLotes: lotesDoUsuario.length,
    lotes: lotesDoUsuario
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="backup_minha_pecuaria.json"');
  res.send(JSON.stringify(backupData, null, 2));
});

// Iniciar servidor quando executado diretamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🐄 SISTEMA ONLINE DE CONTABILIDADE PECUÁRIA`);
    console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
