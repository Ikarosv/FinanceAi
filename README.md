# FinanceAI 💰✨

Um sistema de gestão financeira pessoal Full-Stack que vai além do registo de despesas. O FinanceAI utiliza inteligência artificial para atuar como um conselheiro financeiro, analisando os padrões de gastos do utilizador e fornecendo insights proativos para a saúde financeira.

## 🚀 Tecnologias Utilizadas

### Backend (Motor e API)

- **Django & Django Rest Framework (DRF)**: Construção da API RESTful robusta e segura.
- **SimpleJWT**: Autenticação segura por tokens (Access/Refresh).
- **Groq**: Integração com modelos de linguagem de grande escala (Llama 3) para análise de dados financeiros.

### Frontend (Interface)

- **Next.js (App Router)**: Framework React para renderização otimizada.
- **Tailwind CSS**: Estilização utilitária e design responsivo (Dark Mode).
- **Fetch API (Custom Wrapper)**: Cliente HTTP nativo com tipagem forte (TypeScript) e gestão automática de JWT.

## 🧠 Funcionalidades Atuais

- **Autenticação Segura**: Registro e login baseados em e-mail com sistema de tokens protegidos.
- **Categorias Híbridas**: Sistema inteligente que combina "Categorias Globais" (do sistema, partilhadas por todos para evitar redundância) com "Categorias Pessoais" (criadas de forma isolada pelo utilizador).
- **Gestão de Transações**: Registro completo de Entradas (Incomes) e Saídas (Expenses).
- **Conselheiro Financeiro IA**: Endpoint dedicado que injeta o histórico do utilizador num pipeline RAG, devolvendo análises críticas e dicas de poupança com recurso à infraestrutura da Groq.

## 🗺️ Roadmap (Próximos Passos)

- [ ] **Módulo de Dívidas**: Registro de contas a pagar e compromissos mensais.
- [ ] **Projeção de Saldo**: Lógica para cruzar o saldo atual com as dívidas pendentes, informando o valor real disponível para evitar o sobre-endividamento.

## ⚙️ Estrutura do Projeto

O repositório está dividido em duas partes principais:

- `/backend`: API construída em Python/Django. ([Ver README do Backend](./backend/README.md))
- `/frontend`: Interface de utilizador construída em TypeScript/Next.js([Ver README do Frontend](./frontend/README.md)).
