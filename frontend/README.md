## FinanceAI Frontend

Frontend em Next.js para consumir a API Django do projeto. O app cobre:

- cadastro e login com JWT
- refresh automático da sessão
- dashboard com saldo, entradas e saídas
- CRUD de transações
- CRUD de categorias
- análise textual por IA

## Configuração

1. Crie um arquivo `.env.local` com base em `.env.example`.
2. Ajuste a URL da API se o backend não estiver em `http://127.0.0.1:8000`.
3. Garanta que as dependências do frontend estejam instaladas no ambiente.
4. Suba o backend antes de abrir o frontend.

Variáveis esperadas:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Desenvolvimento

Com as dependências instaladas, rode o servidor do Next:

```bash
npm run dev
```

O app ficará disponível em `http://localhost:3000`.

## Estrutura principal

- `app/page.tsx`: landing pública
- `app/login/page.tsx`: autenticação
- `app/register/page.tsx`: cadastro
- `app/dashboard/page.tsx`: área protegida
- `components/auth-provider.tsx`: estado de sessão e refresh
- `components/dashboard-client.tsx`: consumo da API e UI principal
- `lib/api.ts`: cliente HTTP centralizado
- `lib/types.ts`: contratos usados pelo frontend

## Observações

- O frontend espera o endpoint autenticado `GET /api/me/`.
- As rotas protegidas usam o access token e renovam a sessão com o refresh token.
- Nesta implementação a sessão fica persistida no navegador para manter o fluxo simples.

## Próximos incrementos naturais

- mover a sessão para cookies httpOnly via BFF do Next
- adicionar paginação e filtros avançados no backend
- enriquecer o dashboard com séries temporais e gráficos
