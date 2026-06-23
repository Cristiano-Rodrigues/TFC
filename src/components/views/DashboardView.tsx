'use client';

import React from 'react';
import { FileText, Users, Network, Search, ArrowUpRight, TrendingUp, RefreshCw, Layers } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  // Mock metrics mirroring typical enterprise distributions
  const stats = [
    {
      id: "stat-docs",
      title: "Documentos Totais",
      value: "148",
      change: "+12 este mês",
      trend: "up",
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      targetTab: "documents"
    },
    {
      id: "stat-users",
      title: "Utilizadores Ativos",
      value: "27",
      change: "98% de taxa de adoção",
      trend: "stable",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      targetTab: "admin"
    },
    {
      id: "stat-integrations",
      title: "Fontes Integradas",
      value: "4 / 6",
      change: "Slack, Gmail, Drive ligadas",
      trend: "up",
      icon: Network,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      targetTab: "integrations"
    },
    {
      id: "stat-searches",
      title: "Pesquisas RAG (IA)",
      value: "1,240",
      change: "+182 nas últimas 24h",
      trend: "up",
      icon: Search,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      targetTab: "search"
    }
  ];

  const departmentDistribution = [
    { name: "Tecnologia e Segurança", count: 42, percentage: "28%" },
    { name: "Recursos Humanos", count: 31, percentage: "21%" },
    { name: "Suporte e Operações", count: 28, percentage: "19%" },
    { name: "Compliance & Legal", count: 25, percentage: "17%" },
    { name: "Financeiro", count: 22, percentage: "15%" },
  ];

  const popDocs = [
    { id: "pop-01", name: "Manual de Integração do Colaborador (RH)", views: 342, lastAccess: "Há 10 minutos" },
    { id: "pop-02", name: "Política de Segurança de TI e Acessos VPN", views: 289, lastAccess: "Há 41 minutos" },
    { id: "pop-03", name: "Diretrizes de Reembolso de Despesas de Viagem", views: 187, lastAccess: "Há 2 horas" },
    { id: "pop-04", name: "Código de Ética e Compliance 2026", views: 120, lastAccess: "Ontem" },
  ];

  const recentQueries = [
    { q: "Qual o limite de reembolso para passagens internacionais?", user: "suporte@empresa.com", doc: "Diretrizes de Reembolso", resolved: true },
    { q: "Como configurar o FortiClient MFA?", user: "rui.silva@empresa.com", doc: "Política de TI", resolved: true },
    { q: "Até quando posso planejar as minhas férias?", user: "ana.martins@empresa.com", doc: "Manual de Integração (RH)", resolved: true },
    { q: "Quais são as metas trimestrais de OKR?", user: "admin@empresa.com", doc: "Não catalogado - Geral", resolved: false },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Painel de Controlo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Status geral da base de conhecimento corporativa e métricas de sincronização da inteligência artificial.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
          <span>Sincronizado em tempo real</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            id={stat.id}
            key={stat.id}
            onClick={() => onNavigate(stat.targetTab)}
            className="flex flex-col bg-white border border-slate-200 rounded-lg p-5 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{stat.title}</span>
              <div className={`p-2.5 rounded-md border ${stat.color}`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                <span className="text-xs text-slate-500 font-medium">{stat.change}</span>
              </div>
            </div>
            <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Insights Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Volume Graph & Analytics */}
        <div id="chart-panel" className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Layers className="h-4.5 w-4.5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Documentação por Área</h2>
          </div>
          <div className="space-y-4">
            {departmentDistribution.map((dept, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate">{dept.name}</span>
                  <span className="text-slate-500 font-semibold">{dept.count} ficheiros ({dept.percentage})</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: dept.percentage }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3.5 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-500 leading-relaxed">
            Áreas de <strong>SLA Crítico</strong> e <strong>RH</strong> registraram o maior número de pesquisas indexadas por IA na última semana corporativa.
          </div>
        </div>

        {/* Most popular files */}
        <div id="popular-docs-panel" className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <FileText className="h-4.5 w-4.5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Documentos Mais Consultados</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {popDocs.map((doc, idx) => (
              <div key={doc.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="truncate max-w-[70%]">
                  <p className="text-xs font-semibold text-slate-800 truncate hover:text-blue-600 cursor-pointer" onClick={() => onNavigate('documents')}>
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Última leitura: {doc.lastAccess}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                    {doc.views} acessos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent queries logs */}
        <div id="queries-logs-panel" className="bg-white border border-slate-200 rounded-lg p-5 lg:col-span-1">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Search className="h-4.5 w-4.5 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-900">Pesquisas Recentes (SLA RAG)</h2>
          </div>
          <div className="space-y-3.5">
            {recentQueries.map((item, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-800 line-clamp-1">&ldquo;{item.q}&rdquo;</span>
                  <span className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.resolved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span>De: {item.user}</span>
                  <span>•</span>
                  <span className="text-slate-500 truncate max-w-[120px]">{item.doc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
