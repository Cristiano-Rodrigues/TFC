'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Login } from '@/components/Login';

// Dynamic sub views
import { DashboardView } from '@/components/views/DashboardView';
import { IntelligentSearchView } from '@/components/views/IntelligentSearchView';
import { WikiView } from '@/components/views/WikiView';
import { DocumentsView } from '@/components/views/DocumentsView';
import { UploadView } from '@/components/views/UploadView';
import { IntegrationsView } from '@/components/views/IntegrationsView';
import { AdminView } from '@/components/views/AdminView';
import { ProfileView } from '@/components/views/ProfileView';

// Icons
import {
  LayoutDashboard,
  Search,
  BookOpen,
  FileText,
  UploadCloud,
  Layers,
  Users,
  UserCircle,
  Menu,
  X,
  Network,
  LogOut,
  ShieldCheck,
  Building,
  Loader2,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function Home() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    if (typeof window !== 'undefined') {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  });

  // Sincronizar relógio
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div id="loading-stage" className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Iniciando canais corporativos...</p>
      </div>
    );
  }

  // If session is absent, display secure login form
  if (!user || !profile) {
    return <Login />;
  }

  // Define sidebar links filtered by RBAC permissions dynamically
  const sidebarLinks = [
    {
      id: "dashboard",
      label: "Painel de Controlo",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "user"],
      badge: null
    },
    {
      id: "search",
      label: "Pesquisa Inteligente",
      icon: Search,
      roles: ["admin", "manager", "user"],
      badge: "RAG"
    },
    {
      id: "wiki",
      label: "Wiki Corporativa",
      icon: BookOpen,
      roles: ["admin", "manager", "user"],
      badge: "AI"
    },
    {
      id: "documents",
      label: "Base Documental",
      icon: FileText,
      roles: ["admin", "manager", "user"],
      badge: "148"
    },
    {
      id: "upload",
      label: "Carregar Arquivos",
      icon: UploadCloud,
      roles: ["admin", "manager"], // Conditional link
      badge: null
    },
    {
      id: "integrations",
      label: "Sincronizadores",
      icon: Network,
      roles: ["admin", "manager"], // Conditional link
      badge: "Active"
    },
    {
      id: "admin",
      label: "Cargos e Permissões",
      icon: Users,
      roles: ["admin"], // Admin only linked
      badge: "RBAC"
    },
    {
      id: "profile",
      label: "O Meu Perfil",
      icon: UserCircle,
      roles: ["admin", "manager", "user"],
      badge: null
    }
  ];

  // Restrict tabs if accessed illegally
  const activeLinkConfig = sidebarLinks.find(s => s.id === activeTab);
  const isAuthorizedTab = activeLinkConfig?.roles.includes(profile.role) || profile.role === 'admin';

  // Fallback to profile view if activeTab is unauthorized
  const targetTab = isAuthorizedTab ? activeTab : 'profile';

  return (
    <div id="master-shell" className="min-h-screen flex bg-[#F9FAFB] text-slate-900 font-sans">
      
      {/* 1. FIXED SIDEBAR ON LEFT (Desktop scale) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 text-slate-800 h-screen sticky top-0 shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold font-sans text-sm">K</div>
          <div className="truncate">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">KNOWLEDGE CORE</h1>
            <span className="text-[10px] text-slate-400 font-medium block tracking-wider uppercase">Enterprise Portal</span>
          </div>
        </div>

        {/* Dynamic Nav list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarLinks.map((item) => {
            // Check roles conditions
            const matchesRole = item.roles.includes(profile.role);
            if (!matchesRole) return null;

            const isSelected = targetTab === item.id;
            return (
              <button
                id={`sidebar-link-${item.id}`}
                key={item.id}
                onClick={() => { setActiveTab(item.id); }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`inline-block text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom profile / logout rail inside Sidebar */}
        <div className="p-4 border-t border-slate-100 space-y-3 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3 px-1.5 py-1">
            <div className="bg-blue-600 text-white font-black h-8 w-8 rounded flex items-center justify-center text-xs tracking-wider shrink-0">
              {profile.fullName.substring(0,2).toUpperCase()}
            </div>
            <div className="truncate text-xs">
              <span className="font-bold text-slate-800 block truncate leading-snug">{profile.fullName}</span>
              <span className="text-[9px] font-bold text-slate-400 block tracking-widest uppercase mt-0.5">{profile.role}</span>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full bg-white text-slate-500 hover:text-red-650 hover:bg-slate-100 text-xs py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
          >
            <LogOut className="h-3.5 w-3.5 rotate-180" />
            <span>Sair do Portal</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT CONTAINER AREA (Top Header + Dynamic views) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP HEADER */}
        <header className="bg-white border-b border-slate-200 h-14 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          
          {/* Mobile hamburger button */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => { setMobileMenuOpen(true); }}
              className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-205 rounded shrink-0 cursor-pointer bg-white shadow-2xs"
              title="Abrir Menu Lateral"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <Network className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans">KNOWLEDGE CORE</span>
            </div>
          </div>

          {/* Desktop organization badge info */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-[#475569] font-medium bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-md">
              <Building className="h-3.5 w-3.5 text-slate-450" />
              <span>Organização: <strong>Organização de teste</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 p-1.5 rounded-md hover:border-slate-300 cursor-pointer select-none transition-all mr-1.5"
            >
              <div className="bg-blue-600 text-white font-extrabold h-6 w-6 rounded flex items-center justify-center text-[10px] tracking-wider shrink-0">
                {profile.fullName.substring(0,2).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate block text-slate-800 font-semibold">{profile.fullName.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* REAL-TIME TAB ROUTING COMPILING VIEW */}
        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          {targetTab === 'dashboard' && <DashboardView onNavigate={(tab) => { setActiveTab(tab); }} />}
          {targetTab === 'search' && <IntelligentSearchView />}
          {targetTab === 'wiki' && <WikiView />}
          {targetTab === 'documents' && <DocumentsView />}
          {targetTab === 'upload' && <UploadView />}
          {targetTab === 'integrations' && <IntegrationsView />}
          {targetTab === 'admin' && <AdminView />}
          {targetTab === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* 3. MOBILE RESPONSIVE SLIDE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-3xs transition-opacity animate-in fade-in duration-200">
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full text-slate-800 animate-in slide-in-from-left duration-200">
            
            {/* Mobile Header Drawer */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-semibold text-xs shrink-0">K</div>
                <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">KNOWLEDGE CORE</span>
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); }}
                className="p-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                title="Fechar Menu"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Nav list inside Drawer */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {sidebarLinks.map((item) => {
                // Check roles conditions
                const matchesRole = item.roles.includes(profile.role);
                if (!matchesRole) return null;

                const isSelected = targetTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`h-4.5 w-4.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Bottom session action inside Drawer */}
            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
              <div className="flex items-center gap-3 p-1 text-xs">
                <div className="bg-blue-600 text-white font-bold h-6 w-6 rounded flex items-center justify-center text-[10px] tracking-wider shrink-0">
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
