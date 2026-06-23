'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, ShieldCheck, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const preconfiguredAccounts = [
    { email: "realchrisvibez@gmail.com", label: "Administrador Global", role: "admin" },
    { email: "gestor.hr@empresa.com", label: "Gestor de RH", role: "manager" },
    { email: "suporte.op@empresa.com", label: "Suporte e Operações", role: "user" }
  ];

  const handleFillerSelection = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword("senha123");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password) return;

    const result = await signIn(email, password);
    if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner with Enterprise Logo */}
        <div className="bg-white px-6 py-6 text-slate-800 text-center border-b border-slate-100 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold font-sans text-sm shadow-2xs animate-pulse">K</div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900">KNOWLEDGE CORE</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Plataforma de Gestão e Pesquisa Inteligente de Conhecimento</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div id="login-error-alert" className="p-3 bg-red-50 border border-red-150 text-red-600 rounded-lg flex items-start gap-2 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Endereço de Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email cadastrado (ex: admin@empresa.com)"
                  className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Palavra-Passe (Senha)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de acesso"
                  className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Autenticando credenciais...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5" />
                    Entrar no Sistema
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
