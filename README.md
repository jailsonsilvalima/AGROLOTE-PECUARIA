# 🐂 AgroLote - Plataforma Online de Contabilidade Pecuária

Sistema web completo para gestão financeira, controle de custos (ração, silagem, medicamentos e vacinas) e contabilidade de lucro líquido na engorda e terminação de lotes de animais de corte (Bovinos, Suínos, Ovinos/Carneiros, Caprinos e Aves).

---

## 🌟 Principais Recursos

1. **Gestão por Lotes de Animais:**
   - Exemplo padrão na tela inicial de **5 Garrotes Nelore Confinados por 90 dias** com dados zootécnicos e econômicos reais de mercado (Embrapa / Cepea / B3).
   - Suporte a Bovinos, Suínos, Ovinos (Carneiros Santa Inês), Caprinos (Bodes Moxotó) e Frangos Caipiras.
2. **Controle Rigoroso de Despesas:**
   - Ração balanceada, volumoso/silagem, núcleo mineral e suplementos.
   - Farmácia veterinária: vermífugos, vacinas obrigatórias e vitaminas.
   - Cálculo automático da **diária de alimentação por animal**.
3. **Simulador de Venda & Abate:**
   - Suporte a venda por **Arroba (@) de carcaça limpa**, **Kg Vivo**, **Kg de Carcaça** ou **Preço Fechado por Cabeça**.
   - Venda total ou venda parcial de animais com recálculo proporcional do lucro.
4. **Relatórios Detalhados & DRE:**
   - Visão consolidada de receitas, custos de aquisição, despesas operacionais e **Lucro Líquido Real**.
   - Filtros por animal específico (brinco) e modalidade de ciclo (dias corridos vs dias fixos).
5. **Arquitetura Multi-Usuário (SaaS) com Código de Convite:**
   - Cada produtor se cadastra e tem sua **planilha exclusiva e isolada**.
   - **Exigência de Código de Convite:** Somente quem tiver o código autorizado pelo administrador pode criar conta.
   - **Modo Demonstração (Somente Leitura):** Visitantes podem navegar e ver como o sistema funciona sem alterar dados.
   - Painel do Administrador para gerar novos códigos de convite com 1 clique e mandar pelo WhatsApp.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js instalado (versão 16 ou superior).

### Instalação e Execução
```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor
npm start
```

Acesse no navegador: `http://localhost:3000`

---

## 📤 Como Subir para o GitHub (Passo a Passo)

### Opção A: Pelo Terminal / Prompt de Comando (com Git instalado)
```bash
# 1. Inicializar o repositório git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer o commit inicial
git commit -m "Versão 1.0 - AgroLote Multi-Usuário com Controle de Convite"

# 4. Criar branch principal
git branch -M main

# 5. Conectar com o seu repositório no GitHub (substitua pelo link do seu repositório criado no GitHub)
git remote add origin https://github.com/SEU-USUARIO/agrolote-pecuaria.git

# 6. Enviar os arquivos
git push -u origin main
```

### Opção B: Pelo GitHub Desktop ou Upload Web Direto
1. Acesse [github.com/new](https://github.com/new) e crie um novo repositório chamado `agrolote-pecuaria`.
2. Se não tiver Git na linha de comando, você pode arrastar os arquivos da pasta do projeto diretamente na página do repositório no GitHub ("Upload files") e clicar em **Commit changes**.

---

## 🌐 Como Hospedar Online Gratuitamente no Render.com

O **Render** é uma das melhores plataformas gratuitas da atualidade para rodar aplicações Node.js diretamente conectadas ao GitHub, com certificado SSL (HTTPS) automático.

### Passo a Passo no Render:
1. Acesse [render.com](https://render.com) e crie uma conta grátis (pode entrar usando sua conta do GitHub).
2. Clique no botão **"New +"** no topo e selecione **"Web Service"**.
3. Escolha a opção **"Build and deploy from a Git repository"** e selecione o repositório `agrolote-pecuaria` que você subiu no GitHub.
4. Preencha as configurações:
   - **Name:** `agrolote-pecuaria` (ou o nome que preferir)
   - **Region:** Ohio (US East) ou Oregon (US West)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free` (100% Gratuito)
5. Clique em **"Deploy Web Service"**.
6. Em cerca de 2 minutos, o Render compilará e fornecerá um link público seguro (ex: `https://agrolote-pecuaria.onrender.com`), que você poderá acessar de qualquer lugar do mundo no celular ou computador!

---

## 📁 Estrutura de Pastas

```text
├── server.js              # Servidor backend Express, APIs de autenticação, lotes e convites
├── package.json           # Dependências e scripts do projeto
├── render.yaml            # Configuração de deploy automático no Render
├── Procfile               # Arquivo de inicialização para Railway/Heroku
├── .gitignore             # Arquivos ignorados pelo Git
├── data/
│   └── db.json            # Banco de dados JSON leve com lotes, usuários e convites
└── public/
    ├── index.html         # Interface web com Tailwind CSS, modais e gráficos
    └── app.js             # Lógica do frontend, cálculos, sessão e chamadas de API
```

---

## 📜 Licença
Distribuído sob a licença MIT. Desenvolvido para produtores rurais e pecuaristas.
