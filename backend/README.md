# FinanceAI - Backend API ⚙️

Esta é a API RESTful do FinanceAI, desenvolvida em **Django** e **Django Rest Framework**. Fornece os endpoints de autenticação, o CRUD de finanças e a integração direta com os modelos abertos da **Groq** via **LangChain**.

## 🛠️ Pré-requisitos

- Python 3.10+
- Chave de API da [Groq Cloud](https://console.groq.com/)

## 🚀 Instalação e Configuração Local

### 1. Criar e Ativar o Ambiente Virtual

Navegue até à pasta do backend e isole as dependências do projeto:

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # No Linux utilize:  venv/bin/activate
```

### 2. Instalar as Dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `backend/` (no mesmo nível do arquivo `manage.py`) e adicione as chaves necessárias:

```env
# Chave da Groq para alimentar o Conselheiro Financeiro IA
GROQ_API_KEY=gsk_sua_chave_aqui_gerada_na_groq
```

### 4. Migrar a Base de Dados

Execute as migrações para gerar as tabelas de utilizadores, categorias e transações:

```bash
python manage.py migrate
```

### 5. Carregar Dados Iniciais (Seed)

Execute o comando personalizado para injetar as **Categorias Globais** essenciais no sistema (ex: Alimentação, Lazer, Salário), evitando iniciar com um ambiente vazio:

```bash
python manage.py seed_categories
```

### 6. Criar Conta de Administrador (Superuser)

Para aceder ao painel visual de administração (`/admin/`):

```bash
python manage.py createsuperuser
```

_(Terá de preencher o e-mail, nome de utilizador e a palavra-passe pretendida)._

### 7. Iniciar o Servidor de Desenvolvimento

```bash
python manage.py runserver
```

A sua API estará agora disponível e a escutar pedidos em `http://127.0.0.1:8000/`.

## 📌 Mapa Principal de Endpoints

Todas as rotas (exceto registo e login) exigem a passagem do `access_token` no cabeçalho `Authorization: Bearer <token>`.

| Rota HTTP             | Método          | Descrição                                     |
| --------------------- | --------------- | --------------------------------------------- |
| `/api/auth/token/`    | `POST`          | Obter par de tokens (Access/Refresh)          |
| `/api/auth/register/` | `POST`          | Registar um novo usuário                      |
| `/api/categories/`    | `GET`, `POST`   | Listar as globais/pessoais e criar novas      |
| `/api/transactions/`  | `CRUD completo` | Listar, criar, editar e apagar transações     |
| `/api/ai-analysis/`   | `GET`           | Acionar a IA para analisar o padrão de gastos |

## 🎨 Arquivos Estáticos e Interface de Administração

O projeto pode utilizar temas modernos para o painel de administração (como Jazzmin ou Unfold). Se o layout do `/admin/` não for carregado corretamente com `DEBUG=False`, não se esqueça de recolher os Aquivos estáticos:

```bash
python manage.py collectstatic
```
