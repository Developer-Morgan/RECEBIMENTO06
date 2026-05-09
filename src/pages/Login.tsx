import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [persist, setPersist] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = login(username.trim(), password, persist);
      setLoading(false);
      if (ok) navigate("/", { replace: true });
      else setError("Usuário ou senha incorretos.");
    }, 250);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary text-primary-foreground">
      {/* Backdrop: refined gold glow + grid + radial vignette */}
      <div className="absolute inset-0">
        <div className="absolute -top-48 -left-48 h-[680px] w-[680px] rounded-full bg-accent/25 blur-[120px] animate-pulse" />
        <div
          className="absolute -bottom-48 -right-48 h-[760px] w-[760px] rounded-full bg-accent/15 blur-[120px] animate-pulse"
          style={{ animationDelay: "1.4s" }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,hsl(var(--primary))_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-10">
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left side - Branding */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl" />
                <img src="/logo-50anos.png" alt="Andra 50 Anos" className="relative h-24 drop-shadow-2xl" />
              </div>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 self-center lg:self-start rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Plataforma Andra · Edição 50 Anos
            </div>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Sistema{" "}
              <span className="bg-gradient-to-r from-accent via-amber-300 to-accent bg-clip-text text-transparent">
                RNC
              </span>
            </h1>
            <p className="mt-3 text-lg font-medium text-accent">
              Gestão de Não Conformidades · 50 Anos
            </p>
            <p className="mt-6 max-w-md mx-auto lg:mx-0 text-sm text-primary-foreground/70 leading-relaxed">
              Plataforma profissional para registro, acompanhamento e análise de
              não conformidades de fornecedores. Construída com a tradição de meio
              século da Andra Materiais Elétricos.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
              {[
                { label: "Anos", value: "50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" },
                { label: "Offline", value: "100%", icon: "M5 13l4 4L19 7" },
                { label: "Seguro", value: "✓", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="group rounded-xl border border-accent/20 bg-primary-foreground/5 p-3 text-center backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-primary-foreground/10 hover:-translate-y-0.5"
                >
                  <svg className="mx-auto mb-1 h-4 w-4 text-accent/70 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                  </svg>
                  <p className="text-2xl font-extrabold text-accent">{b.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-primary-foreground/60">{b.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col justify-center">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/50 via-accent/10 to-accent/40 blur-md opacity-80" />
              <div className="relative rounded-2xl border border-accent/20 bg-card/95 backdrop-blur-xl p-8 shadow-2xl">
                {/* corner accents */}
                <span className="pointer-events-none absolute left-0 top-0 h-6 w-6 rounded-tl-2xl border-l-2 border-t-2 border-accent/60" />
                <span className="pointer-events-none absolute right-0 top-0 h-6 w-6 rounded-tr-2xl border-r-2 border-t-2 border-accent/60" />
                <span className="pointer-events-none absolute left-0 bottom-0 h-6 w-6 rounded-bl-2xl border-l-2 border-b-2 border-accent/60" />
                <span className="pointer-events-none absolute right-0 bottom-0 h-6 w-6 rounded-br-2xl border-r-2 border-b-2 border-accent/60" />

                <div className="mb-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 ring-1 ring-accent/30">
                    <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0V8a4 4 0 10-8 0v3m0 0H4v9a2 2 0 002 2h12a2 2 0 002-2v-9h-8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground">Acesso ao Sistema</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entre com suas credenciais para continuar
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Usuário
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input
                        id="username"
                        autoFocus
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="seu.usuario"
                        className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2.5 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
                      Senha
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-md border border-input bg-background pl-9 pr-10 py-2.5 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                        title={showPwd ? "Ocultar senha" : "Mostrar senha"}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {showPwd ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={persist}
                      onChange={(e) => setPersist(e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-[hsl(var(--accent))]"
                    />
                    Manter conectado neste dispositivo
                  </label>

                  {error && (
                    <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                      <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full overflow-hidden rounded-md bg-primary py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg transition-all hover:shadow-accent/30 hover:shadow-xl disabled:opacity-50"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar no Sistema
                          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </form>

                <div className="mt-6 rounded-md border border-accent/30 bg-accent/5 p-3 text-xs text-foreground">
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Acesso inicial
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Usuário: <code className="font-mono font-bold text-accent-foreground bg-accent/30 px-1 rounded">admin</code>{" "}
                    · Senha: <code className="font-mono font-bold text-accent-foreground bg-accent/30 px-1 rounded">admin</code>
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Altere a senha no painel administrativo após o primeiro acesso.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-primary-foreground/50">
              © 2025 Andra S.A. Electric Solutions · 50 Anos · Desenvolvido por Charles Santos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
