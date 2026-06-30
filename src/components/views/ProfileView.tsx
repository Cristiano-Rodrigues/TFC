'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Shield, Info, Landmark, CheckCircle, Mail } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 id="profile-title" className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">O Meu Perfil</h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie suas informações de login e verifique suas permissões funcionais correspondentes à sua role no sistema corporativo.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800" />

        {/* Profile Details Container */}
        <div className="p-6 relative">
          
          {/* Avatar circle */}
          <div className="absolute -top-12 left-6 bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-sm shrink-0">
            <div className="bg-[#1e293b] text-white font-extrabold h-16 w-16 rounded-full flex items-center justify-center text-xl tracking-wider">
              {profile.fullName.substring(0,2).toUpperCase()}
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{profile.fullName}</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{profile.email}</span>
              </div>
            </div>
            
            <button
              onClick={signOut}
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-red-600 border border-slate-200 text-xs font-semibold px-4.5 py-2 rounded shadow-3xs cursor-pointer transition-colors shrink-0"
            >
              Terminar Sessão
            </button>
          </div>

          <hr className="border-slate-100 my-5" />

          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-150 p-4 rounded-lg bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Cargo Hierárquico</span>
              <div className="flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{profile.role}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal leading-[14px]">
                Determina o seu escopo de edição global e o nível de acesso em pastas de segurança.
              </p>
            </div>

            <div className="border border-slate-150 p-4 rounded-lg bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">Divisão Operacional</span>
              <div className="flex items-center gap-2">
                <Landmark className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">{profile.department}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal leading-[14px]">
                Associa o seu perfil a artigos específicos de departamento dentro do manual corporativo.
              </p>
            </div>
          </div>

          {/* Active privileges */}
          <div className="mt-5 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Permissões de Segurança Concedidas</span>
            <div className="flex flex-wrap gap-2">
              {profile.permissions.map(perm => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded"
                >
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {perm}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
