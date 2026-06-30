'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, ShieldCheck, AlertCircle, RefreshCw, Building, Phone, MapPin, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim() || !password) return;

    setIsSubmitting(true);
    const result = await signIn(email, password);
    if (result.error) {
      setLoginError(result.error);
    }
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (!companyName || !adminName || !adminEmail || !adminPassword) {
      setRegisterError('Preencha todos os campos obrigatórios (marcados com *)');
      return;
    }

    setRegisterLoading(true);
    try {
      const res = await fetch('/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          contactEmail,
          phone,
          address,
          adminName,
          adminEmail,
          adminPassword
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setRegisterError(data.error || 'Erro ao registar empresa');
      } else {
        setRegisterSuccess('Empresa criada com sucesso! Já podes iniciar sessão como administrador.');
        setCompanyName('');
        setContactEmail('');
        setPhone('');
        setAddress('');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setEmail(adminEmail);
        setTimeout(() => setActiveTab('login'), 2000);
      }
    } catch (err) {
      setRegisterError('Ocorreu um erro ao comunicar com o servidor.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xs relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-white px-6 py-6 text-slate-800 text-center border-b border-slate-100 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold font-sans text-sm shadow-2xs">K</div>
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900">KNOWLEDGE CORE</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Plataforma de Gestão SaaS</p>
        </div>

        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Entrar
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            Criar Empresa
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'login' && (
            <div className="space-y-5 animate-in slide-in-from-left-2 duration-300">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-600 rounded-lg flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {registerSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-600 rounded-lg flex items-start gap-2 text-xs font-semibold">
                  <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Palavra-Passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800 bg-slate-50/50"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim() || !password}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Autenticando...
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
          )}

          {activeTab === 'register' && (
            <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
              {registerError && (
                <div className="p-3 bg-red-50 border border-red-150 text-red-600 rounded-lg flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{registerError}</span>
                </div>
              )}
              
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1">Dados da Empresa</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome da Organização *</label>
                    <div className="relative">
                      <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nome da Empresa"
                        className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        disabled={registerLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Comercial</label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="geral@..."
                          className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telefone / Contacto</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+351 ..."
                          className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sede / Endereço</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Morada da empresa"
                        className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        disabled={registerLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-1">Perfil do Administrador</h3>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nome do Administrador *</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="O seu nome completo"
                        className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        disabled={registerLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email de Acesso (Login) *</label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="email@pessoal.com"
                        className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        disabled={registerLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Palavra-Passe *</label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Senha segura"
                        className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
                        disabled={registerLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={registerLoading || !companyName || !adminName || !adminEmail || !adminPassword}
                    className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-md shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    {registerLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Criando Espaço...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4.5 w-4.5" />
                        Registar Empresa
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
