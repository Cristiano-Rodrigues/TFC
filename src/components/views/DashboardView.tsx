'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Users, Network, Search, ArrowUpRight, TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const DashboardView: React.FC = () => {
  const router = useRouter();
  const [statsData, setStatsData] = useState({
    documents: 0,
    activeUsers: 0,
    searches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        if (res.ok && data.stats) {
          setStatsData(data.stats);
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

  const departmentDistribution = [
    { name: 'Engenharia', count: 120 },
    { name: 'RH', count: 45 },
    { name: 'Vendas', count: 68 },
    { name: 'Marketing', count: 32 },
    { name: 'Legal', count: 15 },
  ];

  const popDocs = [
    { id: '1', name: 'Manual de Integração API', lastAccess: 'Hoje, 10:30', views: 342 },
    { id: '2', name: 'Políticas de Férias 2026', lastAccess: 'Ontem, 16:45', views: 215 },
    { id: '3', name: 'Relatório Trimestral Vendas', lastAccess: 'Hoje, 09:15', views: 189 },
  ];

  const recentQueries = [
    { q: 'Como pedir reembolso de viagens?', resolved: true, user: 'João Silva', doc: 'Guia de Despesas' },
    { q: 'Quais os endpoints para criar utilizador?', resolved: true, user: 'Maria Santos', doc: 'Manual API v2' },
    { q: 'Template de contrato de prestação de serviços', resolved: false, user: 'Ana Sousa', doc: 'Modelos Legais' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 id="dashboard-title" className="text-xl font-bold text-slate-900 tracking-tight">Painel de Controlo</h1>
          <p className="text-xs text-slate-500 mt-1">
            Status geral da base de conhecimento corporativa e métricas de sincronização da inteligência artificial.
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
        
        {/* Department Volume Graph & Analytics */}
        <div id="chart-panel" className="bg-white border border-slate-200 rounded-xl p-5 xl:col-span-2 shadow-2xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Layers className="h-4.5 w-4.5 text-[#030213]" />
            <h2 className="text-sm font-bold text-[#030213]">Documentação por Área</h2>
          </div>
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#030213' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6 xl:col-span-1">
          {/* Most popular files */}
          <div id="popular-docs-panel" className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col h-full">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <FileText className="h-4.5 w-4.5 text-[#030213]" />
              <h2 className="text-sm font-bold text-[#030213]">Documentos Populares</h2>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {popDocs.map((doc) => (
                <div key={doc.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="truncate max-w-[70%]">
                    <p className="text-xs font-semibold text-slate-800 truncate hover:text-[#030213] cursor-pointer" onClick={() => router.push('/documents')}>
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Última leitura: {doc.lastAccess}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {doc.views} acessos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

