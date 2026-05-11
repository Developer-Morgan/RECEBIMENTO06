import { useMemo, useState } from "react";
import { Ocorrencia, formatarMoeda, calcularValorTotal } from "@/lib/rnc-types";

interface DashboardFinanceiroProps {
  ocorrencias: Ocorrencia[];
}

type PeriodoFiltro = "todos" | "7d" | "30d" | "90d" | "ano";
type StatusFiltro = "todos" | "Pendente" | "Em Andamento" | "Resolvido" | "Cancelado";

export function DashboardFinanceiro({ ocorrencias: ocorrenciasProp }: DashboardFinanceiroProps) {
  const [showFiltroMat, setShowFiltroMat] = useState(false);
  const [showFiltroMot, setShowFiltroMot] = useState(false);
  const [periodoMat, setPeriodoMat] = useState<PeriodoFiltro>("todos");
  const [statusMat, setStatusMat] = useState<StatusFiltro>("todos");
  const [periodoMot, setPeriodoMot] = useState<PeriodoFiltro>("todos");
  const [statusMot, setStatusMot] = useState<StatusFiltro>("todos");

  function aplicarFiltro(periodo: PeriodoFiltro, status: StatusFiltro) {
    let list = ocorrenciasProp;
    if (status !== "todos") list = list.filter((o) => o.status === status);
    if (periodo !== "todos") {
      const dias = periodo === "7d" ? 7 : periodo === "30d" ? 30 : periodo === "90d" ? 90 : 365;
      const limite = Date.now() - dias * 86400000;
      list = list.filter((o) => {
        const t = new Date(o.dataOcorrencia || o.dataAbertura || 0).getTime();
        return t >= limite;
      });
    }
    return list;
  }

  const ocorrencias = ocorrenciasProp;
  const stats = useMemo(() => {
    const resolvidas = ocorrencias.filter((o) => o.status === "Resolvido");
    const pendentes = ocorrencias.filter((o) => o.status === "Pendente");
    const emAndamento = ocorrencias.filter((o) => o.status === "Em Andamento");
    const canceladas = ocorrencias.filter((o) => o.status === "Cancelado");

    const valorRecuperado = resolvidas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorPendente = pendentes.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorEmAndamento = emAndamento.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorCancelado = canceladas.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);
    const valorTotal = ocorrencias.reduce((acc, o) => acc + calcularValorTotal(o.materiais), 0);

    return { valorRecuperado, valorPendente, valorEmAndamento, valorCancelado, valorTotal };
  }, [ocorrencias]);

  const topMateriais = useMemo(() => {
    const map: Record<string, { qtd: number; valor: number }> = {};
    ocorrencias.forEach((o) => {
      o.materiais.forEach((m) => {
        const key = m.descricao || m.codigoAndra || "Sem descrição";
        if (!map[key]) map[key] = { qtd: 0, valor: 0 };
        map[key].qtd += m.quantidade;
        map[key].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, 5);
  }, [ocorrencias]);

  const topMotivos = useMemo(() => {
    const map: Record<string, { count: number; valor: number }> = {};
    ocorrencias.forEach((o) => {
      o.materiais.forEach((m) => {
        const motivo = m.motivo || "Não informado";
        if (!map[motivo]) map[motivo] = { count: 0, valor: 0 };
        map[motivo].count += 1;
        map[motivo].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor);
  }, [ocorrencias]);

  const maxMotivoValor = topMotivos.length > 0 ? topMotivos[0][1].valor : 1;

  const cards = [
    {
      label: "Valor Total em RNC",
      value: stats.valorTotal,
      textColor: "text-foreground",
      barFrom: "from-primary",
      barTo: "to-primary/40",
      ring: "ring-primary/20",
      bg: "bg-primary/10",
      icon: (
        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: "Valor Recuperado",
      value: stats.valorRecuperado,
      textColor: "text-status-resolvido",
      barFrom: "from-status-resolvido",
      barTo: "to-status-resolvido/40",
      ring: "ring-status-resolvido/20",
      bg: "bg-status-resolvido/10",
      icon: (
        <svg className="h-5 w-5 text-status-resolvido" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Valor Pendente",
      value: stats.valorPendente,
      textColor: "text-status-pendente",
      barFrom: "from-status-pendente",
      barTo: "to-status-pendente/40",
      ring: "ring-status-pendente/20",
      bg: "bg-status-pendente/10",
      icon: (
        <svg className="h-5 w-5 text-status-pendente" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Valor em Andamento",
      value: stats.valorEmAndamento,
      textColor: "text-status-andamento",
      barFrom: "from-status-andamento",
      barTo: "to-status-andamento/40",
      ring: "ring-status-andamento/20",
      bg: "bg-status-andamento/10",
      icon: (
        <svg className="h-5 w-5 text-status-andamento" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/30 flex items-center justify-center">
          <svg className="h-5 w-5 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-foreground tracking-tight">Painel Financeiro</h3>
          <p className="text-xs text-muted-foreground">Acompanhamento de impacto financeiro das ocorrências</p>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/80 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <span className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${card.barFrom} ${card.barTo}`} />
            <div className={`absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl opacity-60 ${card.bg}`} />
            <div className="relative flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <div className={`h-9 w-9 rounded-lg ${card.bg} ring-1 ${card.ring} flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <p className={`relative text-2xl font-extrabold tracking-tight ${card.textColor}`}>{formatarMoeda(card.value)}</p>
            {card.label === "Valor Recuperado" && stats.valorTotal > 0 && (
              <div className="relative mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {Math.round((stats.valorRecuperado / stats.valorTotal) * 100)}% do total
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-status-resolvido to-status-resolvido/60 transition-all duration-700"
                    style={{ width: `${(stats.valorRecuperado / stats.valorTotal) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Materiais por valor */}
        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <div className="h-8 w-8 rounded-lg bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center">
              <svg className="h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-foreground">Materiais com Maior Impacto Financeiro</h4>
          </div>
          {topMateriais.length > 0 ? (
            <div className="space-y-3">
              {topMateriais.map(([nome, data], i) => (
                <div key={nome} className="flex items-center gap-3">
                  <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-gradient-to-br from-accent to-amber-500 text-accent-foreground shadow-sm" : "bg-muted text-muted-foreground"
                  }`}>{i + 1}</span>
                  <span className="text-sm text-foreground truncate flex-1">{nome}</span>
                  <div className="text-right ml-2">
                    <span className="text-sm font-bold text-foreground">{formatarMoeda(data.valor)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({data.qtd} un.)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sem dados</p>
          )}
        </div>

        {/* Motivos por valor */}
        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <div className="h-8 w-8 rounded-lg bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center">
              <svg className="h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-foreground">Impacto Financeiro por Motivo</h4>
          </div>
          {topMotivos.length > 0 ? (
            <div className="space-y-3">
              {topMotivos.map(([motivo, data]) => (
                <div key={motivo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{motivo}</span>
                    <span className="text-sm font-bold text-foreground">{formatarMoeda(data.valor)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-amber-400 transition-all duration-700"
                      style={{ width: `${(data.valor / maxMotivoValor) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sem dados</p>
          )}
        </div>
      </div>
    </div>
  );
}
