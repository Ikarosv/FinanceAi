"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ApiError,
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  fetchAiAnalysis,
  fetchCategories,
  fetchTransactions,
  updateCategory,
  updateTransaction,
} from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  parseMoney,
  todayIsoDate,
} from "@/lib/format";
import {
  Category,
  CategoryPayload,
  Transaction,
  TransactionPayload,
} from "@/lib/types";
import { useAuth } from "@/components/auth-provider";

type Section = "overview" | "transactions" | "categories" | "insights";

type TransactionFormState = {
  id: number | null;
  description: string;
  amount: string;
  type: "IN" | "OUT";
  date: string;
  category: string;
};

type CategoryFormState = {
  id: number | null;
  name: string;
  type: "IN" | "OUT";
  icon: string;
};

const defaultTransactionForm = (): TransactionFormState => ({
  id: null,
  description: "",
  amount: "",
  type: "OUT",
  date: todayIsoDate(),
  category: "",
});

const defaultCategoryForm = (): CategoryFormState => ({
  id: null,
  name: "",
  type: "OUT",
  icon: "",
});

function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (typeof error.details === "object" && error.details) {
      const pairs = Object.entries(error.details as Record<string, unknown>);
      const firstList = pairs.find(([, value]) => Array.isArray(value));

      if (firstList && Array.isArray(firstList[1])) {
        return String(firstList[1][0]);
      }
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Algo deu errado. Tente novamente.";
}

export function DashboardClient() {
  const router = useRouter();
  const { user, isAuthenticated, isBootstrapping, logout, withAuth } =
    useAuth();

  const [section, setSection] = useState<Section>("overview");
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    "ALL" | "IN" | "OUT"
  >("ALL");
  const [loadingData, setLoadingData] = useState(true);
  const [submittingTransaction, setSubmittingTransaction] = useState(false);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(
    null,
  );
  const [categoryMessage, setCategoryMessage] = useState<string | null>(null);
  const [transactionForm, setTransactionForm] = useState<TransactionFormState>(
    defaultTransactionForm,
  );
  const [categoryForm, setCategoryForm] =
    useState<CategoryFormState>(defaultCategoryForm);

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isBootstrapping, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadData() {
      setLoadingData(true);
      setScreenError(null);

      try {
        const [nextCategories, nextTransactions] = await Promise.all([
          withAuth(fetchCategories),
          withAuth(fetchTransactions),
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(nextCategories);
        setTransactions(nextTransactions);
      } catch (error) {
        if (isMounted) {
          setScreenError(getApiErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, withAuth]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "IN")
      .reduce(
        (accumulator, transaction) =>
          accumulator + parseMoney(transaction.amount),
        0,
      );

    const expense = transactions
      .filter((transaction) => transaction.type === "OUT")
      .reduce(
        (accumulator, transaction) =>
          accumulator + parseMoney(transaction.amount),
        0,
      );

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType =
        transactionTypeFilter === "ALL" ||
        transaction.type === transactionTypeFilter;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        transaction.description.toLowerCase().includes(normalizedQuery) ||
        (transaction.category_name ?? "")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesType && matchesQuery;
    });
  }, [query, transactionTypeFilter, transactions]);

  const visibleCategories = useMemo(() => {
    return categories
      .slice()
      .sort(
        (left, right) => Number(left.is_personal) - Number(right.is_personal),
      );
  }, [categories]);

  const recentTransactions = filteredTransactions.slice(0, 5);
  const categoryOptions = categories.filter(
    (category) => category.type === transactionForm.type,
  );

  async function reloadCollections() {
    const [nextCategories, nextTransactions] = await Promise.all([
      withAuth(fetchCategories),
      withAuth(fetchTransactions),
    ]);

    setCategories(nextCategories);
    setTransactions(nextTransactions);
  }

  async function handleTransactionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingTransaction(true);
    setTransactionMessage(null);

    const payload: TransactionPayload = {
      description: transactionForm.description,
      amount: transactionForm.amount,
      type: transactionForm.type,
      date: transactionForm.date,
      category: transactionForm.category
        ? Number(transactionForm.category)
        : null,
    };

    try {
      if (transactionForm.id) {
        await withAuth((accessToken) =>
          updateTransaction(accessToken, transactionForm.id as number, payload),
        );
        setTransactionMessage("Transação atualizada com sucesso.");
      } else {
        await withAuth((accessToken) =>
          createTransaction(accessToken, payload),
        );
        setTransactionMessage("Transação criada com sucesso.");
      }

      setTransactionForm(defaultTransactionForm());
      await reloadCollections();
    } catch (error) {
      setTransactionMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingTransaction(false);
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingCategory(true);
    setCategoryMessage(null);

    const payload: CategoryPayload = {
      name: categoryForm.name,
      type: categoryForm.type,
      icon: categoryForm.icon,
    };

    try {
      if (categoryForm.id) {
        await withAuth((accessToken) =>
          updateCategory(accessToken, categoryForm.id as number, payload),
        );
        setCategoryMessage("Categoria atualizada com sucesso.");
      } else {
        await withAuth((accessToken) => createCategory(accessToken, payload));
        setCategoryMessage("Categoria criada com sucesso.");
      }

      setCategoryForm(defaultCategoryForm());
      await reloadCollections();
    } catch (error) {
      setCategoryMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingCategory(false);
    }
  }

  async function handleDeleteTransaction(transactionId: number) {
    const confirmed = window.confirm("Excluir esta transação?");

    if (!confirmed) {
      return;
    }

    try {
      await withAuth((accessToken) =>
        deleteTransaction(accessToken, transactionId),
      );
      setTransactionMessage("Transação removida.");
      await reloadCollections();
    } catch (error) {
      setTransactionMessage(getApiErrorMessage(error));
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    const confirmed = window.confirm("Excluir esta categoria pessoal?");

    if (!confirmed) {
      return;
    }

    try {
      await withAuth((accessToken) => deleteCategory(accessToken, categoryId));
      setCategoryMessage("Categoria removida.");
      await reloadCollections();
    } catch (error) {
      setCategoryMessage(getApiErrorMessage(error));
    }
  }

  async function handleGenerateAnalysis() {
    setLoadingAnalysis(true);
    setAnalysisError(null);

    try {
      const response = await withAuth(fetchAiAnalysis);
      setAnalysis(response.analysis);
      setSection("insights");
    } catch (error) {
      setAnalysisError(getApiErrorMessage(error));
    } finally {
      setLoadingAnalysis(false);
    }
  }

  function handleTransactionEdit(transaction: Transaction) {
    setTransactionForm({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      category: transaction.category ? String(transaction.category) : "",
    });
    setSection("transactions");
  }

  function handleCategoryEdit(category: Category) {
    if (!category.is_personal) {
      return;
    }

    setCategoryForm({
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon ?? "",
    });
    setSection("categories");
  }

  if (isBootstrapping || (!isAuthenticated && !user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#214a48_0%,#102629_45%,#081315_100%)] px-6 py-12 text-stone-50">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-8 py-10 text-center backdrop-blur">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-200/80">
            FinanceAI
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            Preparando sua área financeira...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f5dca8_0%,#f8f3ea_35%,#d8ebe7_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] bg-[#102629] px-6 py-8 text-stone-100 shadow-[0_30px_80px_rgba(10,26,28,0.3)]">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-200/70">
            FinanceAI
          </p>
          <div className="mt-8 space-y-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-stone-300">Bem-vindo</p>
            <h1 className="font-serif text-2xl font-semibold">
              {user?.username}
            </h1>
            <p className="text-sm text-stone-300">{user?.email}</p>
          </div>

          <div className="mt-8 space-y-2">
            {[
              ["overview", "Resumo"],
              ["transactions", "Transações"],
              ["categories", "Categorias"],
              ["insights", "IA"],
            ].map(([value, label]) => {
              const active = section === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSection(value as Section)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-amber-200 text-slate-950"
                      : "bg-white/5 text-stone-100 hover:bg-white/10"
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-xs uppercase tracking-[0.3em]">
                    {value === "overview"
                      ? "01"
                      : value === "transactions"
                        ? "02"
                        : value === "categories"
                          ? "03"
                          : "04"}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-8 w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-stone-100 transition hover:bg-white/10"
          >
            Sair da sessão
          </button>
        </aside>

        <section className="space-y-6 rounded-[2rem] bg-white/75 p-5 shadow-[0_30px_80px_rgba(33,74,72,0.16)] backdrop-blur sm:p-6">
          <header className="flex flex-col gap-4 rounded-[1.75rem] bg-[#f6efe3] p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-[#a36c2f]">
                Painel financeiro
              </p>
              <h2 className="mt-2 max-w-2xl font-serif text-3xl font-semibold text-slate-950 sm:text-4xl">
                Controle entradas, saídas e receba leitura crítica dos seus
                hábitos.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void handleGenerateAnalysis()}
              disabled={loadingAnalysis}
              className="rounded-full bg-[#102629] px-5 py-3 text-sm font-medium text-stone-100 transition hover:bg-[#17363a] disabled:cursor-wait disabled:opacity-70"
            >
              {loadingAnalysis ? "Gerando análise..." : "Gerar leitura com IA"}
            </button>
          </header>

          {screenError ? (
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {screenError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Saldo atual"
              value={formatCurrency(totals.balance)}
              accent="teal"
            />
            <StatCard
              label="Entradas"
              value={formatCurrency(totals.income)}
              accent="amber"
            />
            <StatCard
              label="Saídas"
              value={formatCurrency(totals.expense)}
              accent="rose"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-6">
              {(section === "overview" || section === "transactions") && (
                <Panel
                  eyebrow="Lançamentos"
                  title="Transações"
                  description="Crie, edite e filtre seus lançamentos financeiros."
                >
                  <form
                    className="grid gap-3 rounded-[1.5rem] bg-slate-950/4 p-4"
                    onSubmit={handleTransactionSubmit}
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      <FormField label="Descrição">
                        <input
                          value={transactionForm.description}
                          onChange={(event) =>
                            setTransactionForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="input-base"
                          placeholder="Ex.: Mercado do mês"
                          required
                        />
                      </FormField>
                      <FormField label="Valor">
                        <input
                          value={transactionForm.amount}
                          onChange={(event) =>
                            setTransactionForm((current) => ({
                              ...current,
                              amount: event.target.value,
                            }))
                          }
                          className="input-base"
                          inputMode="decimal"
                          placeholder="0,00"
                          required
                        />
                      </FormField>
                      <FormField label="Tipo">
                        <select
                          value={transactionForm.type}
                          onChange={(event) =>
                            setTransactionForm((current) => ({
                              ...current,
                              type: event.target.value as "IN" | "OUT",
                              category: "",
                            }))
                          }
                          className="input-base"
                        >
                          <option value="OUT">Saída</option>
                          <option value="IN">Entrada</option>
                        </select>
                      </FormField>
                      <FormField label="Data">
                        <input
                          type="date"
                          value={transactionForm.date}
                          onChange={(event) =>
                            setTransactionForm((current) => ({
                              ...current,
                              date: event.target.value,
                            }))
                          }
                          className="input-base"
                          required
                        />
                      </FormField>
                      <FormField label="Categoria" className="md:col-span-2">
                        <select
                          value={transactionForm.category}
                          onChange={(event) =>
                            setTransactionForm((current) => ({
                              ...current,
                              category: event.target.value,
                            }))
                          }
                          className="input-base"
                        >
                          <option value="">Sem categoria</option>
                          {categoryOptions.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.icon ? `${category.icon} ` : ""}
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={submittingTransaction}
                          className="rounded-full bg-[#102629] px-4 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-[#17363a] disabled:opacity-70"
                        >
                          {submittingTransaction
                            ? "Salvando..."
                            : transactionForm.id
                              ? "Atualizar transação"
                              : "Adicionar transação"}
                        </button>
                        {transactionForm.id ? (
                          <button
                            type="button"
                            onClick={() =>
                              setTransactionForm(defaultTransactionForm())
                            }
                            className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancelar edição
                          </button>
                        ) : null}
                      </div>
                      {transactionMessage ? (
                        <p className="text-sm text-slate-600">
                          {transactionMessage}
                        </p>
                      ) : null}
                    </div>
                  </form>

                  <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="input-base"
                      placeholder="Buscar por descrição ou categoria"
                    />
                    <select
                      value={transactionTypeFilter}
                      onChange={(event) =>
                        setTransactionTypeFilter(
                          event.target.value as "ALL" | "IN" | "OUT",
                        )
                      }
                      className="input-base"
                    >
                      <option value="ALL">Todos os tipos</option>
                      <option value="IN">Somente entradas</option>
                      <option value="OUT">Somente saídas</option>
                    </select>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200">
                    <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_1fr_120px] gap-3 bg-slate-950 px-4 py-3 text-xs uppercase tracking-[0.25em] text-stone-100 md:grid">
                      <span>Descrição</span>
                      <span>Tipo</span>
                      <span>Valor</span>
                      <span>Data</span>
                      <span>Ações</span>
                    </div>
                    <div className="divide-y divide-slate-200 bg-white">
                      {loadingData ? (
                        <EmptyState label="Carregando transações..." />
                      ) : filteredTransactions.length === 0 ? (
                        <EmptyState label="Nenhuma transação encontrada com os filtros atuais." />
                      ) : (
                        filteredTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr_0.8fr_0.8fr_1fr_120px] md:items-center"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-slate-500">
                                {transaction.category_icon
                                  ? `${transaction.category_icon} `
                                  : ""}
                                {transaction.category_name ?? "Sem categoria"}
                              </p>
                            </div>
                            <span
                              className={`text-sm font-medium ${transaction.type === "IN" ? "text-emerald-700" : "text-rose-700"}`}
                            >
                              {transaction.type === "IN" ? "Entrada" : "Saída"}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(parseMoney(transaction.amount))}
                            </span>
                            <span className="text-sm text-slate-500">
                              {formatDate(transaction.date)}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleTransactionEdit(transaction)
                                }
                                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeleteTransaction(transaction.id)
                                }
                                className="rounded-full border border-rose-200 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-50"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Panel>
              )}

              {(section === "overview" || section === "categories") && (
                <Panel
                  eyebrow="Organização"
                  title="Categorias"
                  description="Gerencie suas categorias pessoais e visualize as categorias do sistema."
                >
                  <form
                    className="grid gap-3 rounded-[1.5rem] bg-slate-950/4 p-4"
                    onSubmit={handleCategorySubmit}
                  >
                    <div className="grid gap-3 md:grid-cols-3">
                      <FormField label="Nome" className="md:col-span-2">
                        <input
                          value={categoryForm.name}
                          onChange={(event) =>
                            setCategoryForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          className="input-base"
                          placeholder="Ex.: Investimentos"
                          required
                        />
                      </FormField>
                      <FormField label="Ícone">
                        <input
                          value={categoryForm.icon}
                          onChange={(event) =>
                            setCategoryForm((current) => ({
                              ...current,
                              icon: event.target.value,
                            }))
                          }
                          className="input-base"
                          placeholder="💼"
                        />
                      </FormField>
                      <FormField label="Tipo" className="md:col-span-3">
                        <select
                          value={categoryForm.type}
                          onChange={(event) =>
                            setCategoryForm((current) => ({
                              ...current,
                              type: event.target.value as "IN" | "OUT",
                            }))
                          }
                          className="input-base"
                        >
                          <option value="OUT">Saída</option>
                          <option value="IN">Entrada</option>
                        </select>
                      </FormField>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={submittingCategory}
                          className="rounded-full bg-[#102629] px-4 py-2.5 text-sm font-medium text-stone-100 transition hover:bg-[#17363a] disabled:opacity-70"
                        >
                          {submittingCategory
                            ? "Salvando..."
                            : categoryForm.id
                              ? "Atualizar categoria"
                              : "Adicionar categoria"}
                        </button>
                        {categoryForm.id ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCategoryForm(defaultCategoryForm())
                            }
                            className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            Cancelar edição
                          </button>
                        ) : null}
                      </div>
                      {categoryMessage ? (
                        <p className="text-sm text-slate-600">
                          {categoryMessage}
                        </p>
                      ) : null}
                    </div>
                  </form>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {loadingData ? (
                      <EmptyState label="Carregando categorias..." />
                    ) : visibleCategories.length === 0 ? (
                      <EmptyState label="Nenhuma categoria disponível." />
                    ) : (
                      visibleCategories.map((category) => (
                        <article
                          key={category.id}
                          className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                                {category.type === "IN" ? "Entrada" : "Saída"}
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                {category.icon ? `${category.icon} ` : ""}
                                {category.name}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                {category.is_personal
                                  ? "Categoria pessoal"
                                  : "Categoria do sistema"}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                category.is_personal
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {category.is_personal ? "editável" : "bloqueada"}
                            </span>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleCategoryEdit(category)}
                              disabled={!category.is_personal}
                              className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteCategory(category.id)
                              }
                              disabled={!category.is_personal}
                              className="rounded-full border border-rose-200 px-3 py-1.5 text-sm text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Excluir
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </Panel>
              )}
            </div>

            <div className="space-y-6">
              <Panel
                eyebrow="Resumo rápido"
                title="Últimos lançamentos"
                description="Uma visão curta do que acabou de entrar ou sair da conta."
              >
                <div className="space-y-3">
                  {loadingData ? (
                    <EmptyState
                      label="Carregando movimentos recentes..."
                      compact
                    />
                  ) : recentTransactions.length === 0 ? (
                    <EmptyState
                      label="Seus últimos lançamentos aparecerão aqui."
                      compact
                    />
                  ) : (
                    recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${transaction.type === "IN" ? "text-emerald-700" : "text-rose-700"}`}
                          >
                            {transaction.type === "IN" ? "+" : "-"}
                            {formatCurrency(parseMoney(transaction.amount))}
                          </p>
                          <p className="text-sm text-slate-500">
                            {transaction.category_name ?? "Sem categoria"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Panel>

              <Panel
                eyebrow="Leitura crítica"
                title="Análise por IA"
                description="Use o texto gerado para identificar padrões de gasto e oportunidades de ajuste."
              >
                {analysisError ? (
                  <div className="mb-4 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {analysisError}
                  </div>
                ) : null}
                <div className="rounded-[1.5rem] bg-[#102629] p-5 text-stone-100">
                  <p className="text-sm leading-7 text-stone-200">
                    {analysis ||
                      "Gere a análise para receber um resumo sobre concentração de gastos e uma sugestão prática de economia."}
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "teal" | "amber" | "rose";
}) {
  const accentClasses = {
    teal: "from-[#102629] to-[#214a48] text-stone-100",
    amber: "from-[#f5dca8] to-[#c18a2f] text-slate-950",
    rose: "from-[#f8d3c6] to-[#cb6f57] text-slate-950",
  };

  return (
    <article
      className={`rounded-[1.75rem] bg-gradient-to-br p-5 shadow-sm ${accentClasses[accent]}`}
    >
      <p className="text-sm uppercase tracking-[0.3em] opacity-75">{label}</p>
      <h3 className="mt-4 font-serif text-3xl font-semibold">{value}</h3>
    </article>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/40 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.35em] text-[#a36c2f]">
        {eyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-slate-950">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className ? `grid gap-2 ${className}` : "grid gap-2"}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 ${
        compact ? "" : "m-4"
      }`}
    >
      {label}
    </div>
  );
}
