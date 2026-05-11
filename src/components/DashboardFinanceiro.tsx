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
        const t = new Date(o.dataCriacao || 0).getTime();
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
    const list = aplicarFiltro(periodoMat, statusMat);
    const map: Record<string, { qtd: number; valor: number }> = {};
    list.forEach((o) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocorrencias, periodoMat, statusMat]);

  const topMotivos = useMemo(() => {
    const list = aplicarFiltro(periodoMot, statusMot);
    const map: Record<string, { count: number; valor: number }> = {};
    list.forEach((o) => {
      o.materiais.forEach((m) => {
        const motivo = m.motivo || "Não informado";
        if (!map[motivo]) map[motivo] = { count: 0, valor: 0 };
        map[motivo].count += 1;
        map[motivo].valor += (m.valorUnitario || 0) * (m.quantidade || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1].valor - a[1].valor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocorrencias, periodoMot, statusMot]);

  const totalMateriais = topMateriais.reduce((acc, [, d]) => acc + d.valor, 0);
  const totalMotivos = topMotivos.reduce((acc, [, d]) => acc + d.valor, 0);
  const maxMateriaisValor = topMateriais.length > 0 ? topMateriais[0][1].valor : 1;

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

      {/* Second row - modern panels with click-to-filter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PanelImpacto
          titulo="Materiais com Maior Impacto Financeiro"
          subtitulo={topMateriais.length > 0 ? `${topMateriais.length} itens · ${formatarMoeda(totalMateriais)}` : "Sem dados"}
          icone={
            <svg className="h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          showFiltro={showFiltroMat}
          onToggleFiltro={() => setShowFiltroMat((v) => !v)}
          periodo={periodoMat}
          status={statusMat}
          onPeriodoChange={setPeriodoMat}
          onStatusChange={setStatusMat}
        >
          {topMateriais.length > 0 ? (
            <ul className="space-y-2.5">
              {topMateriais.map(([nome, data], i) => {
                const pct = (data.valor / maxMateriaisValor) * 100;
                return (
                  <li key={nome} className="group/item rounded-lg p-2 -m-2 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold ${
                        i === 0
                          ? "bg-gradient-to-br from-accent to-amber-500 text-accent-foreground shadow-sm ring-1 ring-accent/40"
                          : "bg-muted text-muted-foreground ring-1 ring-border"
                      }`}>{i + 1}</span>
                      <span className="text-sm font-medium text-foreground truncate flex-1" title={nome}>{nome}</span>
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="text-sm font-bold text-foreground tabular-nums">{formatarMoeda(data.valor)}</div>
                        <div className="text-[10px] text-muted-foreground">{data.qtd} un.</div>
                      </div>
                    </div>
                    <div className="ml-10 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          i === 0 ? "bg-gradient-to-r from-accent to-amber-400" : "bg-gradient-to-r from-primary/60 to-primary/30"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState />
          )}
        </PanelImpacto>

        <PanelImpacto
          titulo="Impacto Financeiro por Motivo"
          subtitulo={topMotivos.length > 0 ? `${topMotivos.length} motivos · ${formatarMoeda(totalMotivos)}` : "Sem dados"}
          icone={
            <svg className="h-4 w-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
          showFiltro={showFiltroMot}
          onToggleFiltro={() => setShowFiltroMot((v) => !v)}
          periodo={periodoMot}
          status={statusMot}
          onPeriodoChange={setPeriodoMot}
          onStatusChange={setStatusMot}
        >
          {topMotivos.length > 0 ? (
            <ul className="space-y-3">
              {topMotivos.map(([motivo, data]) => {
                const pct = totalMotivos > 0 ? (data.valor / totalMotivos) * 100 : 0;
                return (
                  <li key={motivo} className="rounded-lg p-2 -m-2 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate" title={motivo}>{motivo}</span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{data.count}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-foreground tabular-nums">{formatarMoeda(data.valor)}</div>
                        <div className="text-[10px] text-muted-foreground">{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent via-amber-400 to-amber-300 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState />
          )}
        </PanelImpacto>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
        <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground italic">Nenhum dado para o filtro selecionado</p>
    </div>
  );
}

interface PanelImpactoProps {
  titulo: string;
  subtitulo: string;
  icone: React.ReactNode;
  showFiltro: boolean;
  onToggleFiltro: () => void;
  periodo: PeriodoFiltro;
  status: StatusFiltro;
  onPeriodoChange: (p: PeriodoFiltro) => void;
  onStatusChange: (s: StatusFiltro) => void;
  children: React.ReactNode;
}

function PanelImpacto({
  titulo, subtitulo, icone, showFiltro, onToggleFiltro,
  periodo, status, onPeriodoChange, onStatusChange, children,
}: PanelImpactoProps) {
  const filtroAtivo = periodo !== "todos" || status !== "todos";
  const periodos: { v: PeriodoFiltro; label: string }[] = [
    { v: "todos", label: "Tudo" },
    { v: "7d", label: "7 dias" },
    { v: "30d", label: "30 dias" },
    { v: "90d", label: "90 dias" },
    { v: "ano", label: "1 ano" },
  ];
  const statuses: { v: StatusFiltro; label: string }[] = [
    { v: "todos", label: "Todos" },
    { v: "Pendente", label: "Pendente" },
    { v: "Em Andamento", label: "Em Andamento" },
    { v: "Resolvido", label: "Resolvido" },
    { v: "Cancelado", label: "Cancelado" },
  ];

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-card/70 p-5 shadow-sm hover:shadow-lg transition-all">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="relative flex items-center justify-between gap-2 mb-4 pb-3 border-b">
        <button
          type="button"
          onClick={onToggleFiltro}
          className="flex items-center gap-2.5 min-w-0 text-left group/btn"
          title="Clique para filtrar"
        >
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/30 flex items-center justify-center group-hover/btn:scale-105 transition-transform">
            {icone}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
              {titulo}
              <svg className={`h-3 w-3 text-muted-foreground transition-transform ${showFiltro ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </h4>
            <p className="text-[11px] text-muted-foreground truncate">{subtitulo}</p>
          </div>
        </button>
        <button
          type="button"
          onClick={onToggleFiltro}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border ${
            filtroAtivo
              ? "bg-accent/20 text-accent-foreground border-accent/40 ring-1 ring-accent/30"
              : "bg-muted/60 text-muted-foreground border-transparent hover:bg-muted"
          }`}
          title="Filtrar"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {filtroAtivo ? "Filtrado" : "Filtrar"}
        </button>
      </div>

      {showFiltro && (
        <div className="relative mb-4 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-3 animate-in fade-in slide-in-from-top-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Período</p>
            <div className="flex flex-wrap gap-1.5">
              {periodos.map((p) => (
                <button
                  key={p.v}
                  onClick={() => onPeriodoChange(p.v)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    periodo === p.v
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s.v}
                  onClick={() => onStatusChange(s.v)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                    status === s.v
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {filtroAtivo && (
            <button
              onClick={() => { onPeriodoChange("todos"); onStatusChange("todos"); }}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <div className="relative">{children}</div>
    </div>
  );
}
