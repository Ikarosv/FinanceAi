import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#214a48_0%,#102629_46%,#081315_100%)] px-6 py-10 text-stone-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.35)] backdrop-blur lg:p-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">
              FinanceAI
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
              Seu painel financeiro com leitura inteligente dos gastos.
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-amber-200 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-100"
            >
              Criar conta
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-6">
            <p className="max-w-2xl text-lg leading-8 text-stone-200">
              Conecte cadastro, autenticação, categorias, transações e análise
              por IA em um fluxo único. O painel mostra saldo, entradas, saídas,
              lançamentos recentes e leitura crítica dos hábitos financeiros.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                title="Autenticação JWT"
                description="Login, cadastro e renovação de sessão conectados ao backend Django."
              />
              <FeatureCard
                title="Operação diária"
                description="Cadastre entradas, saídas e categorias pessoais sem sair do painel."
              />
              <FeatureCard
                title="IA aplicada"
                description="Gere uma leitura resumida dos gastos com base no seu histórico."
              />
            </div>
          </div>

          <div className="rounded-4xl bg-[#f6efe3] p-6 text-slate-950 shadow-[0_25px_80px_rgba(8,19,21,0.3)]">
            <p className="text-xs uppercase tracking-[0.35em] text-[#a36c2f]">
              Visão do produto
            </p>
            <div className="mt-5 grid gap-4">
              <InsightRow
                label="Saldo em tempo real"
                value="Entradas e saídas agregadas no dashboard"
              />
              <InsightRow
                label="Categorias do sistema"
                value="Separadas das categorias pessoais editáveis"
              />
              <InsightRow
                label="Análise acionável"
                value="Resumo textual com sugestão prática de economia"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-300">{description}</p>
    </article>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
