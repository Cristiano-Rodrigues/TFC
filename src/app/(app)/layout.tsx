'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import {
  LayoutDashboard,
  Search,
  BookOpen,
  FileText,
  UploadCloud,
  Users,
  UserCircle,
  Menu,
  X,
  Network,
  LogOut,
  Building,
  Loader2
} from 'lucide-react';
import { LoadingStage } from '@/components/ui/LoadingStage';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const fetchChatSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      const data = await res.json();
      if (res.ok && data.sessions) {
        setChatSessions(data.sessions);
      }
    } catch (err) {
      console.error("Erro ao carregar sessões de chat", err);
    }
  };

  const currentTab = pathname.split('/')[1] || 'dashboard';

  useEffect(() => {
    if (user && currentTab === 'search') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchChatSessions();
    }

    const handleSessionCreated = () => {
      fetchChatSessions();
    };

    window.addEventListener('chatSessionCreated', handleSessionCreated);
    return () => window.removeEventListener('chatSessionCreated', handleSessionCreated);
  }, [user, currentTab]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChatSessions([]);
      setActiveSessionId(null);
      setIsSearchExpanded(false);
    }
  }, [user]);

  // Auth Protection
  useEffect(() => {
    if (!loading && (!user || !profile)) {
      router.replace('/');
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile) {
    return <LoadingStage />;
  }

  const sidebarLinks = [
    { id: "dashboard", label: "Painel de Controlo", icon: LayoutDashboard, permissions: [], badge: null },
    { id: "search", label: "Pesquisa Inteligente", icon: Search, permissions: [], badge: "IA" },
    { id: "wiki", label: "Wiki Corporativa", icon: BookOpen, permissions: ["wiki:view"], badge: "Auto" },
    { id: "documents", label: "Base Documental", icon: FileText, permissions: ["documents:view"], badge: null },
    { id: "upload", label: "Carregar Arquivos", icon: UploadCloud, permissions: ["documents:create"], badge: null },
    { id: "integrations", label: "Sincronizadores", icon: Network, permissions: ["integrations:manage"], badge: null },
    { id: "admin", label: "Administração", icon: Users, permissions: ["roles:manage", "users:manage", "departments:manage"], badge: null },
    { id: "profile", label: "O Meu Perfil", icon: UserCircle, permissions: [], badge: null }
  ];

  const activeLinkConfig = sidebarLinks.find(s => s.id === currentTab);
  const isAuthorizedTab = activeLinkConfig?.permissions.length === 0 || 
                          profile.role === 'admin' || 
                          activeLinkConfig?.permissions.some(p => profile.permissions?.includes(p));

  // If unauthorized, redirecting in render is tricky. Using a client-side redirect.
  if (!isAuthorizedTab && currentTab !== 'profile') {
    router.replace('/profile');
    return null;
  }

  return (
    <div id="master-shell" className="min-h-screen flex bg-[#f8fafc] text-slate-900 font-sans">
      <aside className="hidden lg:flex flex-col w-64 bg-[#fafafa] border-r border-slate-200 text-slate-800 h-screen sticky top-0 shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-200/80 shrink-0">
          <div className="w-7 h-7 bg-[#030213] text-white rounded-md flex items-center justify-center font-bold font-sans text-xs shadow-2xs">K</div>
          <div className="truncate">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">KNOWLEDGE CORE</h1>
            <span className="text-[10px] text-slate-400 font-medium block tracking-wider uppercase">Enterprise Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => {
            const isAllowed = item.permissions.length === 0 || profile.role === 'admin' || item.permissions.some(p => profile.permissions?.includes(p));
            if (!isAllowed) return null;

            const isSelected = currentTab === item.id;
            const isSearch = item.id === 'search';

            return (
              <div key={item.id} className="w-full">
                {isSearch ? (
                  <div
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#030213] text-white font-semibold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isSelected ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/${item.id}`}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#030213] text-white font-semibold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isSelected ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
                
                {isSearch && isSearchExpanded && (
                  <div className="mt-1 ml-4 border-l-2 border-slate-200 pl-2 space-y-1 mb-2">
                    <Link
                      href="/search"
                      onClick={() => setActiveSessionId(null)}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors block ${
                        !activeSessionId 
                          ? 'bg-slate-200/60 text-slate-900 font-semibold' 
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      + Nova Conversa
                    </Link>
                    {chatSessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/search?sessionId=${session.id}`}
                        onClick={() => setActiveSessionId(session.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors block ${
                          activeSessionId === session.id
                            ? 'bg-slate-200/60 text-slate-900 font-semibold'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title={session.title}
                      >
                        {session.title || 'Conversa sem título'}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3 shrink-0 bg-[#fafafa]">
          <div className="flex items-center gap-3 px-1.5 py-1">
            <div className="bg-[#030213] text-white font-bold h-7 w-7 rounded-md flex items-center justify-center text-xs tracking-wider shrink-0 shadow-2xs">
              {profile.fullName.substring(0,2).toUpperCase()}
            </div>
            <div className="truncate text-xs">
              <span className="font-bold text-slate-800 block truncate leading-snug">{profile.fullName}</span>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mt-0.5">{profile.role}</span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs font-medium"
          >
            <LogOut className="h-3.5 w-3.5 rotate-180" />
            <span>Sair do Portal</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="bg-white border-b border-slate-200 h-14 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded shrink-0 cursor-pointer bg-white shadow-2xs"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#030213] text-white rounded flex items-center justify-center font-bold text-[10px]">K</div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">KNOWLEDGE CORE</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 border border-slate-200 px-3 py-1 rounded-md">
              <Building className="h-3.5 w-3.5 text-slate-500" />
              <span>Organização: <strong className="text-slate-900">{profile.companyName || 'A Minha Organização'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link
              href="/profile"
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-md hover:border-slate-300 cursor-pointer select-none transition-all"
            >
              <div className="bg-[#030213] text-white font-extrabold h-6 w-6 rounded-md flex items-center justify-center text-[10px] tracking-wider shrink-0">
                {profile.fullName.substring(0,2).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate block text-slate-800 font-semibold">{profile.fullName.split(' ')[0]}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-3xs transition-opacity animate-in fade-in duration-200">
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full text-slate-800 animate-in slide-in-from-left duration-200">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#030213] rounded flex items-center justify-center text-white font-semibold text-xs shrink-0">K</div>
                <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">KNOWLEDGE CORE</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {sidebarLinks.map((item) => {
                const isAllowed = item.permissions.length === 0 || profile.role === 'admin' || item.permissions.some(p => profile.permissions?.includes(p));
                if (!isAllowed) return null;

                const isSelected = currentTab === item.id;
                const isSearch = item.id === 'search';

                return (
                  <div key={item.id} className="w-full">
                    {isSearch ? (
                      <div
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-100 text-[#030213] font-semibold'
                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-[#030213]' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/${item.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-100 text-[#030213] font-semibold'
                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-[#030213]' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    )}
                    
                    {isSearch && isSearchExpanded && (
                      <div className="mt-1 ml-4 border-l-2 border-slate-100 pl-2 space-y-1 mb-2">
                        <Link
                          href="/search"
                          onClick={() => { setActiveSessionId(null); setMobileMenuOpen(false); }}
                          className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors block ${
                            !activeSessionId 
                              ? 'bg-slate-100 text-[#030213] font-semibold' 
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          + Nova Conversa
                        </Link>
                        {chatSessions.map((session) => (
                          <Link
                            key={session.id}
                            href={`/search?sessionId=${session.id}`}
                            onClick={() => { setActiveSessionId(session.id); setMobileMenuOpen(false); }}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors block ${
                              activeSessionId === session.id
                                ? 'bg-slate-100 text-[#030213] font-semibold'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {session.title || 'Conversa sem título'}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-3 p-1 text-xs">
                <div className="bg-[#030213] text-white font-bold h-6 w-6 rounded flex items-center justify-center text-[10px] tracking-wider shrink-0">
                  {profile.fullName.substring(0,2).toUpperCase()}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-slate-850 block truncate leading-snug">{profile.fullName}</span>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full bg-white text-slate-500 text-xs py-2 rounded-md flex items-center justify-center gap-1 cursor-pointer transition-colors border border-slate-200"
              >
                <LogOut className="h-3.5 w-3.5 rotate-180" />
                <span>Encerrar Sessão</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
