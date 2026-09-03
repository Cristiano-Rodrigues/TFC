'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Users, Network, Search, ArrowUpRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const [statsData, setStatsData] = useState<{
    documents: number;
    activeUsers: number;
    searches: number;
    departmentDistribution: { name: string, count: number }[];
    recentDocs: { id: string, filename: string, created_at: string }[];
    recentQueries: { id: string, content: string, created_at: string, is_error: boolean }[];
  }>({
    documents: 0,
    activeUsers: 0,
    searches: 0,
    departmentDistribution: [],
    recentDocs: [],
    recentQueries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        if (res.ok) {
          setStatsData({
            documents: data.stats?.documents || 0,
            activeUsers: data.stats?.activeUsers || 0,
            searches: data.stats?.searches || 0,
            departmentDistribution: data.departmentDistribution || [],
            recentDocs: data.recentDocs || [],
            recentQueries: data.recentQueries || []
          });
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      id: "stat-docs",
      title: "Documentos Totais",
      value: loading ? "..." : statsData.documents.toString(),
      change: "Sincronizado",
      trend: "up",
      icon: FileText,
      color: "text-slate-700 bg-slate-50 border-slate-200",
      targetTab: "documents"
    },
    {
      id: "stat-users",
      title: "Utilizadores Activos",
      value: loading ? "..." : statsData.activeUsers.toString(),
      change: "Sincronizado",
      trend: "up",
      icon: Users,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      targetTab: "admin"
    },
    {
      id: "stat-integrations",
      title: "Fontes Integradas",
      value: "0 / 6",
      change: "Nenhuma ligada",
      trend: "stable",
      icon: Network,
      color: "text-slate-700 bg-slate-50 border-slate-200",
      targetTab: "integrations"
    },
    {
      id: "stat-searches",
      title: "Pesquisas RAG (IA)",
      value: loading ? "..." : statsData.searches.toString(),
      change: "Sincronizado",
      trend: "up",
      icon: Search,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      targetTab: "search"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 id="dashboard-title" className="text-xl font-bold text-slate-900 tracking-tight">Painel de Controlo</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dados gerais do portal
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            id={stat.id}
            key={stat.id}
            onClick={() => router.push(`/${stat.targetTab}`)}
            className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all cursor-pointer relative group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-2 rounded-lg border ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />}
                <span className="text-xs text-slate-500 font-medium">{stat.change}</span>
              </div>
            </div>
            <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#030213]" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Insights Segment */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Department Volume Graph */}
        <div id="chart-panel" className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Distribuição de Conhecimento</h3>
              <p className="text-xs text-slate-500 mt-1">Volume de documentos por departamento</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {statsData.departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statsData.departmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#2563eb' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Sem dados de distribuição por departamento.
              </div>
            )}
          </div>
        </div>

        {/* Right side panels */}
        <div className="space-y-6">
          {/* Recent Docs */}
          <div id="popular-docs-panel" className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">Documentos Recentes</h3>
            <div className="space-y-4">
              {statsData.recentDocs.length > 0 ? statsData.recentDocs.map(doc => (
                <div key={doc.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{doc.filename}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400">Nenhum documento encontrado.</p>
              )}
            </div>
            <button 
              onClick={() => router.push('/documents')}
              className="w-full mt-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          {/* Recent Queries */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              Pesquisas Recentes
            </h3>
            <div className="space-y-3">
              {statsData.recentQueries.length > 0 ? statsData.recentQueries.map((query, i) => (
                <div key={query.id || i} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <p className="text-xs text-slate-700 font-medium line-clamp-2">&quot;{query.content}&quot;</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{new Date(query.created_at).toLocaleDateString()}</span>
                    {query.is_error ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase">Falhado</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">Resolvido</span>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400">Nenhuma pesquisa efetuada.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

