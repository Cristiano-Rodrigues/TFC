'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, ShieldCheck, AlertCircle, RefreshCw, Building, Phone, MapPin, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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
    <div className="h-screen w-full flex bg-[#F9FAFB]">
      {/* Left Side: Image / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#030213] overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/login-bg.png" 
            alt="SaaS Platform" 
            fill 
            className="object-cover opacity-60 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030213] via-[#030213]/80 to-transparent" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold font-sans text-xl shadow-lg">K</div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white">KNOWLEDGE CORE</h1>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Centralize, pesquise e faça a gestão do conhecimento da sua empresa com IA.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Uma plataforma de Gestão SaaS que lhe permite gerir as informações da sua organização de forma eficaz.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center p-32 bg-white overflow-y-auto">
        <div className="w-full h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center flex-col text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'login' ? 'Bem-vindo de volta' : 'Registar Nova Organização'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {activeTab === 'login' 
                ? 'Insira as suas credenciais para aceder ao sistema.' 
                : 'Configure um ambiente isolado para a sua empresa.'}
            </p>
          </div>

          <div className="flex bg-[#f3f3f5] p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-[#030213] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'register' ? 'bg-white text-[#030213] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Criar Empresa
            </button>
          </div>

          <div className="mt-8">
            {activeTab === 'login' && (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                {loginError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm font-semibold shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {registerSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-start gap-3 text-sm font-semibold shadow-sm">
                    <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{registerSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Email de Acesso</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@empresa.com"
                        className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#030213]/10 focus:border-[#030213] text-slate-900 bg-[#f3f3f5] placeholder:text-slate-400 transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Palavra-Passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#030213]/10 focus:border-[#030213] text-slate-900 bg-[#f3f3f5] placeholder:text-slate-400 transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex pt-4 justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim() || !password}
                      className="w-1/2 bg-[#030213] hover:bg-[#030213]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-[#030213]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          Autenticando...
                        </>
                      ) : (
                        <>
                          Entrar no Sistema
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                {registerError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm font-semibold shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{registerError}</span>
                  </div>
                )}
                
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Dados da Empresa</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Nome da Organização *</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Nome da Empresa"
                          className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Email Comercial</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="geral@..."
                            className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                            disabled={registerLoading}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Telefone</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+244 999 999 999"
                            className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                            disabled={registerLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Sede / Endereço</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Morada da empresa"
                          className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Perfil do Administrador</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Nome do Administrador *</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="O seu nome completo"
                          className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Email de Acesso *</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="email@pessoal.com"
                          className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">Palavra-Passe *</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Senha segura"
                          className="w-full text-sm pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-[#030213] text-slate-900 bg-[#f3f3f5]"
                          disabled={registerLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      disabled={registerLoading || !companyName || !adminName || !adminEmail || !adminPassword}
                      className="w-1/2 bg-[#030213] hover:bg-[#030213]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-[#030213]/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {registerLoading ? (
                        <>
                          Criando Empresa...
                        </>
                      ) : (
                        <>
                          Registrar Empresa
                        </>
                      )}
                    </button>
                  </div>
                </form>
                <div className="h-32 w-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

