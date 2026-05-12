import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Fornecedor, TipoFornecedor, loadFornecedores, saveFornecedores } from "@/lib/rnc-types";
import { useAuth } from "@/contexts/AuthContext";
import { CadastroFornecedor } from "@/components/CadastroFornecedor";

type FiltroTipo = "todos" | TipoFornecedor;

export default function Fornecedores() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(loadFornecedores());
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [showCadastro, setShowCadastro] = useState(false);
  const [editFornecedor, setEditFornecedor] = useState<Fornecedor | null>(null);

  const filtrados = useMemo(() => {
    let list = fornecedores;
    if (filtroTipo !== "todos") {
      list = list.filter((f) => (f.tipo || "fornecedor") === filtroTipo || (filtroTipo === "fornecedor" && f.tipo === "ambos") || (filtroTipo === "transferencia" && f.tipo === "ambos"));
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter((f) =>
        f.nome.toLowerCase().includes(q) ||
        (f.cnpj || "").toLowerCase().includes(q) ||
        (f.email || "").toLowerCase().includes(q) ||
        (f.contato || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [fornecedores, busca, filtroTipo]);

  const stats = useMemo(() => ({
    total: fornecedores.length,
    fornecedor: fornecedores.filter((f) => (f.tipo || "fornecedor") === "fornecedor").length,
    transferencia: fornecedores.filter((f) => f.tipo === "transferencia").length,
    ambos: fornecedores.filter((f) => f.tipo === "ambos").length,
  }), [fornecedores]);

  function persistir(novo: Fornecedor[]) {
    setFornecedores(novo);
    saveFornecedores(novo);
  }

  function handleSave(f: Fornecedor) {
    const exists = fornecedores.find((x) => x.id === f.id);
    if (exists) persistir(fornecedores.map((x) => x.id === f.id ? f : x));
    else persistir([f, ...fornecedores]);
    setEditFornecedor(null);
  }

  function handleDelete(f: Fornecedor) {
    if (!confirm(`Remover "${f.nome}" da base?`)) return;
    persistir(fornecedores.filter((x) => x.id !== f.id));
    toast.success("Removido");
  }

  function exportar() {
    if (fornecedores.length === 0) {
      toast.error("Nada para exportar");
      return;
    }
    const rows = fornecedores.map((f) => ({
      Nome: f.nome,
      Tipo: f.tipo || "fornecedor",
      CNPJ: f.cnpj || "",
      Email: f.email || "",
      Telefone: f.telefone || "",
      Contato: f.contato || "",
      Endereco: f.endereco || "",
      Observacoes: f.observacoes || "",
      Cadastrado_em: f.dataCadastro ? new Date(f.dataCadastro).toLocaleString("pt-BR") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fornecedores");
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `fornecedores-andra-${stamp}.xlsx`);
    toast.success("Planilha gerada");
  }

  const tipoBadge = (t?: TipoFornecedor) => {
    const v = t || "fornecedor";
    if (v === "transferencia") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent-foreground border border-accent/30">Transferência</span>;
    if (v === "ambos") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-resolvido/15 text-status-resolvido border border-status-resolvido/30">Ambos</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">Fornecedor</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary px-6 py-3 shadow-lg sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-50anos.png" alt="Andra 50" className="h-10" />
            <div className="h-8 w-px bg-accent/40" />
            <div>
              <h1 className="text-base font-extrabold text-primary-foreground">Gestão de Fornecedores & Transferências</h1>
              <p className="text-[11px] text-accent">Andra · 50 Anos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 hover:bg-primary-foreground/10 border border-primary-foreground/15 rounded-md px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors">
              ← Voltar
            </button>
            <button onClick={() => { logout(); navigate("/login"); }} className="inline-flex items-center gap-2 bg-destructive/20 hover:bg-destructive/30 border border-destructive/40 text-primary-foreground rounded-md px-3.5 py-2 text-xs font-semibold transition-colors">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", v: stats.total, color: "text-foreground", bg: "bg-muted" },
            { label: "Fornecedores", v: stats.fornecedor, color: "text-primary", bg: "bg-primary/10" },
            { label: "Transferências", v: stats.transferencia, color: "text-accent-foreground", bg: "bg-accent/15" },
            { label: "Ambos", v: stats.ambos, color: "text-status-resolvido", bg: "bg-status-resolvido/10" },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border p-4 ${s.bg}`}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.v}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="rounded-lg border bg-card p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar nome, CNPJ, email..."
              className="w-full border rounded-md bg-background pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {([
              { v: "todos" as FiltroTipo, label: "Todos" },
              { v: "fornecedor" as FiltroTipo, label: "Fornecedores" },
              { v: "transferencia" as FiltroTipo, label: "Transferências" },
              { v: "ambos" as FiltroTipo, label: "Ambos" },
            ]).map((f) => (
              <button
                key={f.v}
                onClick={() => setFiltroTipo(f.v)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${filtroTipo === f.v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/40"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <button onClick={exportar} className="inline-flex items-center gap-1.5 border border-input px-3 py-2 text-xs font-semibold rounded-md hover:bg-muted transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exportar Excel
            </button>
            <button onClick={() => setShowCadastro(true)} className="inline-flex items-center gap-1.5 bg-primary px-4 py-2 text-xs font-bold text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Novo
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">CNPJ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Telefone</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtrados.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum cadastro encontrado.</td></tr>
                ) : filtrados.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{f.nome}</td>
                    <td className="px-4 py-3">{tipoBadge(f.tipo)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.cnpj || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.telefone || "—"}</td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button onClick={() => setEditFornecedor(f)} title="Editar" className="p-1.5 rounded hover:bg-primary/10 text-primary transition-colors">
                        <svg className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {user?.role === "admin" && (
                        <button onClick={() => handleDelete(f)} title="Remover" className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors">
                          <svg className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
            Exibindo <span className="font-bold text-foreground">{filtrados.length}</span> de {fornecedores.length}
          </div>
        </div>
      </main>

      {showCadastro && (
        <CadastroFornecedor
          fornecedores={fornecedores}
          onSave={handleSave}
          onClose={() => setShowCadastro(false)}
        />
      )}

      {editFornecedor && (
        <CadastroFornecedor
          fornecedores={fornecedores}
          editData={editFornecedor}
          onSave={handleSave}
          onClose={() => setEditFornecedor(null)}
        />
      )}
    </div>
  );
}
