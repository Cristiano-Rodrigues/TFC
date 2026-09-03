'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Shield, Info, Landmark, CheckCircle, Mail, User, Lock, Bell, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileView: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'geral' | 'seguranca' | 'notificacoes'>('geral');

  if (!profile) return null;

  const handleSaveMock = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Alterações guardadas com sucesso.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 id="profile-title" className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">Gestão de Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gira as suas informações pessoais, segurança e preferências.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('geral')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'geral' 
                ? 'bg-white border border-slate-200 text-slate-900 shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <User className="h-4 w-4" />
            Visão Geral
          </button>
          
          <button
            onClick={() => setActiveTab('seguranca')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'seguranca' 
                ? 'bg-white border border-slate-200 text-slate-900 shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Lock className="h-4 w-4" />
            Segurança
          </button>

          <button
            onClick={() => setActiveTab('notificacoes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'notificacoes' 
                ? 'bg-white border border-slate-200 text-slate-900 shadow-2xs' 
                : 'text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notificações
          </button>
          
          <hr className="border-slate-200 my-3" />

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Terminar Sessão
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'geral' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs animate-in fade-in duration-200">
              <div className="h-24 bg-[#030213]" />
              <div className="p-6 relative">
                <div className="absolute -top-12 left-6 bg-white p-1.5 rounded-full shadow-sm shrink-0">
                  <div className="bg-[#f3f3f5] text-slate-800 font-extrabold h-16 w-16 rounded-full flex items-center justify-center text-xl tracking-wider">
                    {profile.fullName.substring(0,2).toUpperCase()}
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{profile.fullName}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100 my-5" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 p-4 rounded-xl bg-[#f3f3f5] space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Cargo Hierárquico</span>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5 text-slate-700" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{profile.role}</span>
                    </div>
                  </div>

                  <div className="border border-slate-200 p-4 rounded-xl bg-[#f3f3f5] space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Divisão Operacional</span>
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4.5 w-4.5 text-slate-700" />
                      <span className="text-xs font-bold text-slate-900">{profile.department}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Permissões de Segurança Concedidas</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.permissions.map(perm => (
                      <span
                        key={perm}
                        className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-md"
                      >
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        {perm}
                      </span>
                    ))}
                    {profile.permissions.length === 0 && (
                      <span className="text-xs text-slate-500">Nenhuma permissão especial concedida.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Alterar Palavra-passe</h2>
              
              <form onSubmit={handleSaveMock} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Palavra-passe Atual</label>
                  <input type="password" required className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nova Palavra-passe</label>
                  <input type="password" required className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Confirmar Nova Palavra-passe</label>
                  <input type="password" required className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800" />
                </div>
                <button type="submit" className="bg-[#030213] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-[#030213]/90 transition-colors">
                  Atualizar Segurança
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Preferências de Alertas</h2>
              
              <form onSubmit={handleSaveMock} className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <input type="checkbox" id="notif1" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
                  <div className="flex-1">
                    <label htmlFor="notif1" className="text-xs font-bold text-slate-800 block cursor-pointer">Atualizações do Sistema RAG</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Receba alertas quando novos documentos do seu departamento forem indexados.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <input type="checkbox" id="notif2" defaultChecked className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
                  <div className="flex-1">
                    <label htmlFor="notif2" className="text-xs font-bold text-slate-800 block cursor-pointer">Menções em Respostas</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Notificar quando o seu nome for citado pelo agente ou num comentário do Wiki.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                  <input type="checkbox" id="notif3" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-0" />
                  <div className="flex-1">
                    <label htmlFor="notif3" className="text-xs font-bold text-slate-800 block cursor-pointer">Resumo Semanal</label>
                    <p className="text-[10px] text-slate-500 mt-0.5">Um email por semana com os documentos e pesquisas mais populares da organização.</p>
                  </div>
                </div>

                <button type="submit" className="bg-[#030213] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-[#030213]/90 transition-colors">
                  Salvar Preferências
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
