import { useState } from "react";
import { toast } from "sonner";
import { loadConfig } from "@/lib/rnc-types";

interface AlertaTransferenciaProps {
  onClose: () => void;
}

export function AlertaTransferencia({ onClose }: AlertaTransferenciaProps) {
  const cfg = loadConfig();
  const hoje = new Date();
  const [mensagem, setMensagem] = useState(cfg.mensagemPadraoAtraso || "");
  const [origem, setOrigem] = useState("");
  const [previsao, setPrevisao] = useState("");
  const [observacao, setObservacao] = useState("");

  const destinatarios = cfg.ccAtrasoTransferencia || [];

  function gerarHTML(): string {
    const dataFmt = hoje.toLocaleDateString("pt-BR");
    const horaFmt = hoje.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Alerta de Atraso de Transferência</title></head>
<body style="margin:0;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f3f4f6;color:#111827;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 60%,#2a2a2a 100%);padding:22px 26px;border-bottom:3px solid #D4A017;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;width:74px;"><img src="${window.location.origin}/logo-50anos.png" style="height:60px;display:block;" alt="Andra 50 Anos" /></td>
        <td style="vertical-align:middle;text-align:center;">
          <h1 style="margin:0;font-size:20px;color:#D4A017;font-weight:800;letter-spacing:0.3px;">Andra S.A. Electric Solutions</h1>
          <p style="margin:6px 0 0;font-size:12px;color:#d1d5db;letter-spacing:0.3px;">ALERTA DE ATRASO — TRANSFERÊNCIA DE MATERIAIS</p>
        </td>
        <td style="vertical-align:middle;width:90px;text-align:right;">
          <div style="display:inline-block;background:#dc2626;color:#fff;padding:6px 12px;font-size:11px;font-weight:800;border-radius:14px;letter-spacing:0.6px;">ATRASO</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#fef2f2;border-bottom:1px solid #fecaca;padding:12px 26px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:11px;color:#991b1b;text-transform:uppercase;letter-spacing:0.6px;font-weight:700;">Data do Alerta</td>
      <td style="text-align:right;font-size:13px;color:#1a1a1a;font-weight:800;">${dataFmt} · ${horaFmt}</td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:22px 26px 6px;">
    <p style="margin:0 0 10px;font-size:13px;color:#111827;">Prezados,</p>
    <div style="font-size:13px;color:#374151;line-height:1.7;white-space:pre-wrap;">${mensagem.replace(/</g, "&lt;")}</div>
  </td></tr>

  ${(origem || previsao || observacao) ? `
  <tr><td style="padding:18px 26px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <tr><td style="background:linear-gradient(90deg,#1a1a1a 0%,#2a2a2a 100%);color:#D4A017;padding:9px 16px;font-size:12px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;border-left:4px solid #D4A017;">Detalhes da Transferência</td></tr>
      <tr><td style="padding:14px 18px;background:#fff;">
        ${origem ? `<p style="margin:0 0 8px;font-size:12px;color:#374151;"><strong style="color:#111827;">Origem:</strong> ${origem}</p>` : ""}
        ${previsao ? `<p style="margin:0 0 8px;font-size:12px;color:#374151;"><strong style="color:#111827;">Previsão original:</strong> ${previsao}</p>` : ""}
        ${observacao ? `<p style="margin:0;font-size:12px;color:#374151;line-height:1.6;"><strong style="color:#111827;">Observação:</strong> ${observacao.replace(/</g, "&lt;")}</p>` : ""}
      </td></tr>
    </table>
  </td></tr>` : ""}

  <tr><td style="padding:24px 26px 22px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1a1a1a;padding-top:14px;">
      <tr><td style="padding-top:14px;">
        <p style="margin:0 0 10px;font-size:12px;color:#374151;">Atenciosamente,</p>
        <p style="margin:0;font-size:13px;color:#111827;font-weight:800;">${cfg.remetenteNome}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#6b7280;">${cfg.remetenteCargo} · ${cfg.remetenteEmpresa}</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:#0a0a0a;padding:14px 26px;text-align:center;">
    <p style="margin:0;font-size:10px;color:#9ca3af;letter-spacing:0.4px;">Comunicação automática · Sistema de Logística Andra · 50 Anos</p>
  </td></tr>
</table>
</body></html>`;
  }

  async function handleEnviar() {
    if (destinatarios.length === 0) {
      toast.error("Nenhum destinatário configurado", { description: "Adicione no painel Admin → Configurações." });
      return;
    }
    if (!mensagem.trim()) {
      toast.error("Informe a mensagem do alerta");
      return;
    }
    const html = gerarHTML();
    let copiouRich = false;
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([`Alerta de atraso de transferência — ${hoje.toLocaleDateString("pt-BR")}`], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
      copiouRich = true;
    } catch { copiouRich = false; }

    const to = destinatarios[0];
    const cc = destinatarios.slice(1).join(",");
    const assunto = `Alerta de Atraso — Transferência ${hoje.toLocaleDateString("pt-BR")}${origem ? " · " + origem : ""}`;
    const ccParam = cc ? `&cc=${encodeURIComponent(cc)}` : "";
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}${ccParam}&su=${encodeURIComponent(assunto)}`;
    window.open(url, "_blank");

    if (copiouRich) {
      toast.success("Gmail aberto + visual copiado", { description: "Cole no corpo do e-mail (Ctrl+V).", duration: 6000 });
    } else {
      toast.warning("Gmail aberto", { description: "Use 'Abrir Relatório' para copiar o HTML manualmente." });
    }
  }

  function abrirHTML() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(gerarHTML());
    w.document.close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-sm overflow-y-auto py-4" onClick={onClose}>
      <div className="w-full max-w-3xl mx-4 border bg-card shadow-2xl my-4 rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-destructive px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-destructive-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-bold text-destructive-foreground">Alerta de Atraso · Transferência</span>
          </div>
          <button onClick={onClose} className="text-destructive-foreground/80 hover:text-destructive-foreground text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Destinatários */}
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Destinatários (configurados em Admin)</p>
            {destinatarios.length === 0 ? (
              <p className="text-sm text-destructive font-semibold">⚠ Nenhum e-mail cadastrado. Vá em Admin → Configurações.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {destinatarios.map((e, i) => (
                  <span key={i} className="text-xs bg-background border rounded-full px-2.5 py-0.5 font-mono">
                    {i === 0 && <span className="text-accent-foreground font-bold mr-1">PARA:</span>}
                    {i > 0 && <span className="text-muted-foreground font-bold mr-1">CC:</span>}
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Origem (opcional)</label>
              <input value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Ex: CD São Paulo, Filial Curitiba"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Previsão original (opcional)</label>
              <input value={previsao} onChange={(e) => setPrevisao(e.target.value)} placeholder="Ex: 11/05/2026 às 14h"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Mensagem do alerta</label>
            <textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40" />
            <p className="text-[11px] text-muted-foreground mt-1">A mensagem padrão pode ser editada no Admin → Configurações.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Observação adicional (opcional)</label>
            <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={3} placeholder="Detalhes específicos deste atraso..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-4 border-t bg-muted/20">
          <button onClick={handleEnviar} className="inline-flex items-center gap-2 bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground rounded hover:opacity-90 transition-opacity shadow-md">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Abrir no Gmail (com visual)
          </button>
          <button onClick={abrirHTML} className="inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors">
            Abrir Relatório
          </button>
          <button onClick={onClose} className="ml-auto inline-flex items-center gap-2 border border-foreground/20 px-5 py-2.5 text-sm font-medium text-foreground rounded hover:bg-muted transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
