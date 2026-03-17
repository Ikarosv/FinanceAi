"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "@/components/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping, register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
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
      await register({
        email,
        username,
        password,
        birthdate: birthdate || undefined,
      });
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Falha ao criar conta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#214a48_0%,#102629_48%,#081315_100%)] px-6 py-10 text-stone-100">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-6 lg:grid-cols-[1fr_460px]">
        <section className="flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur lg:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-amber-200/80">
              FinanceAI
            </p>
            <h1 className="mt-6 max-w-xl font-serif text-4xl font-semibold sm:text-5xl">
              Crie sua conta e comece a organizar o fluxo financeiro.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-300">
              Depois do cadastro, o login já é feito automaticamente e o painel
              abre pronto para uso.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-amber-200/10 p-5">
            <p className="text-sm leading-7 text-stone-200">
              O backend aceita e-mail como identificador principal. Username
              continua disponível para exibição no app.
            </p>
          </div>
        </section>

        <section className="rounded-[2.5rem] bg-[#f6efe3] p-8 text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.3)] lg:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#a36c2f]">
            Cadastro
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-sm text-slate-700">E-mail</span>
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
              <span className="text-sm text-slate-700">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="input-base"
                placeholder="Como seu nome aparece no painel"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-700">Data de nascimento</span>
              <input
                type="date"
                value={birthdate}
                onChange={(event) => setBirthdate(event.target.value)}
                className="input-base"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-700">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-base"
                placeholder="Mínimo recomendado: 8 caracteres"
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
              className="w-full rounded-full bg-[#102629] px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-[#17363a] disabled:opacity-70"
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Já possui conta?{" "}
            <Link
              href="/login"
              className="font-medium text-[#102629] underline-offset-4 hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
