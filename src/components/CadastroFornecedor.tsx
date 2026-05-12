import { useState } from "react";
import { Fornecedor, TipoFornecedor } from "@/lib/rnc-types";
import { toast } from "sonner";

interface CadastroFornecedorProps {
  fornecedores: Fornecedor[];
  onSave: (f: Fornecedor) => void;
  onClose: () => void;
  onAbrirRNC?: (f: Fornecedor) => void;
  /** Se passado, entra em modo edição */
  editData?: Fornecedor | null;
}

const initialForm = {
  nome: "",
  cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  contato: "",
  observacoes: "",
  tipo: "fornecedor" as TipoFornecedor,
};

function maskCNPJ(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
function maskTel(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3").trim();
  return d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, "($1) $2-$3").trim();
}

export function CadastroFornecedor({ fornecedores, onSave, onClose, onAbrirRNC, editData }: CadastroFornecedorProps) {
  const isEdit = !!editData;
  const [form, setForm] = useState(
    editData
      ? {
          nome: editData.nome,
          cnpj: editData.cnpj,
          email: editData.email,
          telefone: editData.telefone,
          endereco: editData.endereco || "",
          contato: editData.contato || "",
          observacoes: editData.observacoes || "",
          tipo: (editData.tipo || "fornecedor") as TipoFornecedor,
        }
      : initialForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedFornecedor, setSavedFornecedor] = useState<Fornecedor | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "E-mail inválido";
    const cnpjDigits = form.cnpj.replace(/\D/g, "");
    if (cnpjDigits && cnpjDigits.length !== 14) e.cnpj = "CNPJ deve ter 14 dígitos";
    const dup = fornecedores.find(
      (f) => cnpjDigits && f.cnpj.replace(/\D/g, "") === cnpjDigits && f.id !== editData?.id
    );
    if (dup) e.cnpj = "CNPJ já cadastrado para " + dup.nome;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Verifique os campos destacados");
      return;
    }
    const novo: Fornecedor = {
      id: editData?.id || crypto.randomUUID(),
      nome: form.nome.trim(),
      cnpj: form.cnpj.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
      contato: form.contato.trim(),
      observacoes: form.observacoes.trim(),
      tipo: form.tipo,
      dataCadastro: editData?.dataCadastro || new Date().toISOString(),
    };
    onSave(novo);
    if (isEdit) {
      toast.success(`✓ "${novo.nome}" atualizado com sucesso!`);
      onClose();
    } else {
      toast.success(`✓ "${novo.nome}" cadastrado com sucesso!`);
      setSavedFornecedor(novo);
    }
  }

  function novoCadastro() {
    setForm(initialForm);
    setErrors({});
    setSavedFornecedor(null);
  }

  const tipos: { v: TipoFornecedor; label: string; desc: string; cor: string }[] = [
    { v: "fornecedor", label: "Fornecedor", desc: "Empresa externa", cor: "border-primary/40 bg-primary/5 text-primary" },
    { v: "transferencia", label: "Transferência", desc: "Origem interna / filial", cor: "border-accent/50 bg-accent/10 text-accent-foreground" },
    { v: "ambos", label: "Ambos", desc: "Atende os dois fluxos", cor: "border-status-resolvido/40 bg-status-resolvido/10 text-status-resolvido" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-lg border bg-card shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary px-6 py-4 flex items-center gap-3">
          <img src="/logo-50anos.png" alt="Andra 50" className="h-10" />
          <div className="h-10 w-px bg-accent/40" />
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-primary-foreground leading-tight">
              {savedFornecedor ? "Cadastro Concluído" : isEdit ? "Editar Fornecedor / Transferência" : "Cadastro de Fornecedor / Transferência"}
            </h2>
            <p className="text-[11px] text-accent">Andra · 50 Anos</p>
          </div>
          <button onClick={onClose} className="text-primary-foreground/70 hover:text-primary-foreground text-2xl leading-none">&times;</button>
        </div>

        {savedFornecedor ? (
          <div className="p-8 text-center space-y-5">
            <div className="mx-auto h-16 w-16 rounded-full bg-status-resolvido/15 flex items-center justify-center">
              <svg className="h-8 w-8 text-status-resolvido" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Cadastro concluído</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{savedFornecedor.nome}</span> foi adicionado à base.
              </p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4 text-left text-sm space-y-1 max-w-sm mx-auto">
              <p><span className="text-muted-foreground">Tipo:</span> <span className="font-medium capitalize">{savedFornecedor.tipo || "fornecedor"}</span></p>
              {savedFornecedor.cnpj && <p><span className="text-muted-foreground">CNPJ:</span> <span className="font-medium">{savedFornecedor.cnpj}</span></p>}
              {savedFornecedor.email && <p><span className="text-muted-foreground">E-mail:</span> <span className="font-medium">{savedFornecedor.email}</span></p>}
              {savedFornecedor.telefone && <p><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{savedFornecedor.telefone}</span></p>}
            </div>
            <p className="text-sm font-medium text-foreground">Deseja abrir uma RNC para este registro agora?</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {onAbrirRNC && (
                <button
                  onClick={() => onAbrirRNC(savedFornecedor)}
                  className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Abrir RNC
                </button>
              )}
              <button onClick={novoCadastro} className="border px-5 py-2.5 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors">
                Cadastrar outro
              </button>
              <button onClick={onClose} className="border px-5 py-2.5 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors">
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                Tipo de cadastro <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {tipos.map((t) => {
                  const ativo = form.tipo === t.v;
                  return (
                    <button
                      type="button"
                      key={t.v}
                      onClick={() => setForm({ ...form, tipo: t.v })}
                      className={`text-left rounded-md border-2 p-3 transition-all ${ativo ? `${t.cor} ring-2 ring-offset-1 ring-current/20` : "border-input bg-background hover:border-foreground/30"}`}
                    >
                      <div className="text-sm font-bold">{t.label}</div>
                      <div className="text-[11px] opacity-80 mt-0.5">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                  Razão Social / Nome <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60 ${errors.nome ? "border-destructive" : "border-input"}`}
                />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">CNPJ</label>
                <input
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: maskCNPJ(e.target.value) })}
                  placeholder="00.000.000/0000-00"
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60 ${errors.cnpj ? "border-destructive" : "border-input"}`}
                />
                {errors.cnpj && <p className="text-xs text-destructive mt-1">{errors.cnpj}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: maskTel(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contato@fornecedor.com.br"
                  className={`w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60 ${errors.email ? "border-destructive" : "border-input"}`}
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">Pessoa de Contato</label>
                <input
                  value={form.contato}
                  onChange={(e) => setForm({ ...form, contato: e.target.value })}
                  placeholder="Nome do responsável"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">Endereço</label>
                <input
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua, número, bairro, cidade/UF"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  rows={2}
                  placeholder="Anotações internas (opcional)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={onClose} className="rounded-md border px-5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button type="submit" className="rounded-md bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                {isEdit ? "Salvar alterações" : "Cadastrar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
