"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";

function AuthScreen({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#214a48_0%,#102629_48%,#081315_100%)] px-6 py-10 text-stone-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_460px]">
        <section className="flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-amber-200/80">
              FinanceAI
            </p>
            <h1 className="mt-6 max-w-xl font-serif text-4xl font-semibold sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-300">
              {subtitle}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoCard
              title="Sessão persistente"
              text="Acesso renovado com refresh token para evitar login repetido."
            />
            <InfoCard
              title="Resumo imediato"
              text="Saldo, entradas e saídas logo após autenticar."
            />
            <InfoCard
              title="Dados acionáveis"
              text="Transações, categorias e leitura por IA no mesmo fluxo."
            />
          </div>
        </section>

        <section className="rounded-[2.5rem] bg-[#f6efe3] p-8 text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.3)] lg:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#a36c2f]">
            {eyebrow}
          </p>
          <div className="mt-6">{children}</div>
          <div className="mt-6">{footer}</div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-stone-300">{text}</p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isBootstrapping, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Falha ao entrar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreen
      eyebrow="Acesso"
      title="Entre para acompanhar o caixa do dia a dia"
      subtitle="Autenticação JWT conectada ao backend em Django."
      footer={
        <p className="text-sm text-stone-300">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="font-medium text-amber-200 underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm text-stone-200">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-base"
            placeholder="voce@exemplo.com"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-stone-200">Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-base"
            placeholder="••••••••"
            required
          />
        </label>

        {error ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-amber-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 disabled:opacity-70"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthScreen>
  );
}
