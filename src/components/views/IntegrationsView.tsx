'use client';

import React, { useState } from 'react';
import { Network, RefreshCw, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, ArrowUpRight, Lock, Loader2, Slack, Mail, MessageSquare, HardDrive, Landmark, ShieldCheck } from 'lucide-react';

interface IntegrationBase {
  id: string;
  name: string;
  type: string;
  logo: any;
  status: 'Conectado' | 'Desconectado';
  lastSync: string;
  importedItemsCount: number;
  scopes: string[];
  isLoadingSync: boolean;
}

export const IntegrationsView: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationBase[]>([
    {
      id: "int-slack",
      name: "Slack",
      type: "Comunicação Interna",
      logo: Slack,
      status: "Conectado",
      lastSync: "Há 4 horas",
      importedItemsCount: 42,
      scopes: ["#suporte-l1", "#comunicados-rh"],
      isLoadingSync: false
    },
    {
      id: "int-gmail",
      name: "Gmail / GSuite Workspace",
      type: "Mensagens & Email",
      logo: Mail,
      status: "Conectado",
      lastSync: "Ontem, às 18:24",
      importedItemsCount: 120,
      scopes: ["Marcadores: rh-diretivas, ti-VPN"],
      isLoadingSync: false
    },
    {
      id: "int-drive",
      name: "Google Drive",
      type: "Armazenamento Nuvem",
      logo: HardDrive,
      status: "Conectado",
      lastSync: "Há 12 minutos",
      importedItemsCount: 312,
      scopes: ["Pasta: Políticas Corporativas 2026"],
      isLoadingSync: false
    },
    {
      id: "int-outlook",
      name: "Microsoft Outlook Exchange",
      type: "Mensagens & Email",
      logo: Mail,
      status: "Desconectado",
      lastSync: "Nunca sincronizado",
      importedItemsCount: 0,
      scopes: [],
      isLoadingSync: false
    },
    {
      id: "int-sharepoint",
      name: "Microsoft SharePoint",
      type: "Armazenamento Nuvem",
      logo: Landmark,
      status: "Desconectado",
      lastSync: "Nunca sincronizado",
      importedItemsCount: 0,
      scopes: [],
      isLoadingSync: false
    },
    {
      id: "int-telegram",
      name: "Telegram Channels",
      type: "Comunicação Rápida",
      logo: MessageSquare,
      status: "Desconectado",
      lastSync: "Nunca sincronizado",
      importedItemsCount: 0,
      scopes: [],
      isLoadingSync: false
    }
  ]);

  const handleSyncNow = (id: string) => {
    // 1. Trigger sync loading indicator
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isLoadingSync: true };
      }
      return item;
    }));

    // 2. Simulate complete sync and records expansion
    setTimeout(() => {
      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isLoadingSync: false,
            lastSync: "Agora mesmo",
            importedItemsCount: item.importedItemsCount + Math.floor(Math.random() * 8) + 1
          };
        }
        return item;
      }));
    }, 2500);
  };

  const handleToggleState = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'Conectado' ? 'Desconectado' : 'Conectado';
        return {
          ...item,
          status: nextStatus,
          lastSync: nextStatus === 'Conectado' ? "Agora mesmo" : "Nunca sincronizado",
          importedItemsCount: nextStatus === 'Conectado' ? 12 : 0,
          scopes: nextStatus === 'Conectado' ? ["Pasta Padrão Sincronia"] : []
        };
      }
      return item;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 id="integrations-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Sincronizadores Organizacionais</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie e integre canais externos para que a inteligência artificial absorva e documente as transformações da organização.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800 space-y-1">
          <span className="font-bold block">Conformidade GDPR & Segurança Empresarial</span>
          <p className="leading-relaxed">
            As fontes externas sincronizadas usam autenticação OAuth 2.0 criptografada. Os dados extraídos de emails ou chats com os marcadores definidos são anonimizados e apenas as chaves semânticas são salvas na nossa base de dados privada para consultas de RAG da IA. Senhas ou chaves pessoais nunca são armazenadas.
          </p>
        </div>
      </div>

      {/* Grid structure list */}
      <div id="integrations-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {integrations.map((item) => (
          <div
            id={`integration-card-${item.id}`}
            key={item.id}
            className={`bg-white border rounded-lg p-5 shadow-3xs flex flex-col justify-between transition-all relative group ${
              item.status === 'Conectado' ? 'border-slate-200 hover:border-slate-350' : 'border-slate-150 opacity-90'
            }`}
          >
            <div>
              {/* Header inside Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg border ${item.status === 'Conectado' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <item.logo className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{item.type}</span>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button
                  onClick={() => handleToggleState(item.id)}
                  className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={item.status === 'Conectado' ? "Desconectar ferramenta" : "Conectar ferramenta"}
                >
                  {item.status === 'Conectado' ? (
                    <ToggleRight className="h-6 w-6 text-emerald-500 fill-emerald-100" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-slate-300" />
                  )}
                </button>
              </div>

              {/* Body inside Card */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Estado da Sincronia:</span>
                  {item.status === 'Conectado' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Ligado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Inativo
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Última indexação:</span>
                  <span className="font-semibold text-slate-700">{item.lastSync}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Conteúdos indexados:</span>
                  <span className="font-bold text-slate-900">{item.importedItemsCount} itens catalogados</span>
                </div>

                {/* Scopes Tag labels */}
                {item.status === 'Conectado' && item.scopes.length > 0 && (
                  <div className="space-y-1 mt-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Pastas Ativas:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.scopes.map((scope, i) => (
                        <span key={i} className="inline-block text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ingestion Trigger Button below */}
            <div className="mt-6">
              {item.status === 'Conectado' ? (
                <button
                  id={`btn-sync-${item.id}`}
                  onClick={() => handleSyncNow(item.id)}
                  disabled={item.isLoadingSync}
                  className="w-full bg-[#1e293b] hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold uppercase py-2 rounded shadow-3xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {item.isLoadingSync ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sincronizando Mensagens...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Sincronizar Agora
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleToggleState(item.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase py-2 rounded shadow-3xs transition-colors cursor-pointer"
                >
                  Configurar Acesso
                </button>
              )}
            </div>
            
            {/* Padlock icon when inactive */}
            {item.status !== 'Conectado' && (
              <div className="absolute inset-0 bg-slate-50/10 backdrop-blur-3xs rounded-lg pointer-events-none transition-all group-hover:bg-slate-50/0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
