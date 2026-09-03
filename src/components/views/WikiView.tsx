'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Compass, Sparkles, Clock, Calendar, CheckCircle2, Bookmark, X, RefreshCw, Save, Edit3, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface WikiArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  updatedAt: string;
  isAiGenerated: boolean;
  status: string;
  popularity: number;
  sources?: string[];
  accessLogic?: string;
  departments?: string[];
  roles?: string[];
}

export const WikiView: React.FC = () => {
  const { profile } = useAuth();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeArticle, setActiveArticle] = useState<WikiArticle | null>(null);
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const [draftArticle, setDraftArticle] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [wikiRes, deptsRes, rolesRes] = await Promise.all([
        fetch('/api/wiki'),
        fetch('/api/departments'),
        fetch('/api/roles')
      ]);

      if (deptsRes.ok) {
        const d = await deptsRes.json();
        setDepartments(d.departments || []);
      }
      if (rolesRes.ok) {
        const r = await rolesRes.json();
        setRoles(r.roles || []);
      }
      if (wikiRes.ok) {
        const w = await wikiRes.json();
        const formatted = (w.articles || []).map((doc: any) => ({
          id: doc.id,
          title: doc.filename,
          category: doc.document_departments?.[0]?.departments?.name || 'Geral',
          summary: doc.metadata?.summary || '',
          content: doc.metadata?.content || '',
          updatedAt: new Date(doc.created_at).toISOString().split('T')[0],
          isAiGenerated: doc.metadata?.is_ai_generated || false,
          status: doc.metadata?.status || 'published',
          popularity: doc.metadata?.popularity || 1,
          sources: doc.metadata?.sources || [],
          accessLogic: doc.metadata?.access_logic || 'AND',
          departments: doc.document_departments?.map((d: any) => d.departments?.id).filter(Boolean) || [],
          roles: doc.document_permissions?.map((p: any) => p.roles?.id).filter(Boolean) || []
        }));
        setArticles(formatted);
      }
    } catch (error) {
      console.error("Error fetching wiki data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const filteredArticles = articles.filter(art => {
    if ((art.status !== 'published' && art.status !== 'draft') && !profile?.permissions?.includes('wiki:edit')) return false;
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && art.status !== 'needs_review';
  });

  const pendingReviewArticles = articles.filter(a => a.status === 'needs_review' && profile?.permissions?.includes('wiki:edit'));

  const popularArticles = [...articles].filter(a => a.status === 'published').sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  const recentArticles = [...articles].filter(a => a.status === 'published').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);

  const handleGenerateWiki = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;

    setIsGenerating(true);
    setGenError('');

    try {
      const response = await fetch('/api/wiki/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: genTopic
        })
      });

      if (!response.ok) {
        throw new Error("Erro na geração");
      }

      const data = await response.json();
      
      setDraftArticle({
        title: data.title || genTopic,
        summary: data.summary || '',
        content: data.content || '',
        sources: data.sources || [],
        department_ids: [],
        role_ids: [],
        access_logic: 'AND'
      });
      
      setShowGenModal(false);
      setGenTopic('');
    } catch (err: any) {
      console.error("Wiki creation error:", err);
      setGenError("Incapaz de estruturar Wiki de forma automática.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishWiki = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...draftArticle,
        status: 'published',
        is_ai_generated: true
      };

      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Falha ao publicar");

      await fetchData();
      setDraftArticle(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao publicar a Wiki.");
    } finally {
      setIsSaving(false);
    }
  };

  const incrementPopularity = async (art: WikiArticle) => {
    setActiveArticle(art);
  };

  const handleDeleteWiki = async (id: string) => {
    if (!window.confirm('Tem a certeza que deseja apagar permanentemente este artigo da Wiki?')) return;
    try {
      const res = await fetch(`/api/wiki/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Falha ao apagar');
      setActiveArticle(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao apagar artigo da Wiki.');
    }
  };

  const handleEditWiki = () => {
    if (!activeArticle) return;
    setDraftArticle({
      id: activeArticle.id,
      title: activeArticle.title,
      summary: activeArticle.summary,
      content: activeArticle.content,
      access_logic: activeArticle.accessLogic || 'AND',
      department_ids: activeArticle.departments || [],
      role_ids: activeArticle.roles || [],
      is_ai_generated: activeArticle.isAiGenerated,
      sources: activeArticle.sources || []
    });
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">A carregar página...</div>;
  }

  return (
    <div className="space-y-6 relative">
      
      {draftArticle && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 lg:p-10 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#030213] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-wide">Modo Fact-Check (Rascunho de IA)</h3>
              </div>
              <button onClick={() => setDraftArticle(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Título do Artigo</label>
                  <input 
                    type="text" 
                    value={draftArticle.title} 
                    onChange={e => setDraftArticle({...draftArticle, title: e.target.value})}
                    className="w-full text-lg font-bold px-3 py-2 border-b-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Resumo Curto</label>
                  <textarea 
                    value={draftArticle.summary} 
                    onChange={e => setDraftArticle({...draftArticle, summary: e.target.value})}
                    className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none"
                    rows={2}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 block">Corpo (Markdown)</label>
                  <textarea 
                    value={draftArticle.content} 
                    onChange={e => setDraftArticle({...draftArticle, content: e.target.value})}
                    className="w-full h-[400px] text-sm p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none font-mono"
                  />
                </div>
                {draftArticle.sources && draftArticle.sources.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mt-4">
                    <label className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5" /> Fontes Detetadas pela IA</label>
                    <ul className="list-disc pl-5 space-y-1">
                      {draftArticle.sources.map((src: string, idx: number) => (
                        <li key={idx} className="text-xs font-medium text-blue-700">{src}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-800">Controlo de Acesso</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Define quem pode pesquisar e consultar este artigo. A Inteligência Artificial respeitará estas regras (RLS).
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block">Lógica de Acesso Departamental</label>
                  <div className="flex bg-white border border-slate-200 rounded p-1 mb-4">
                    <button 
                      className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${draftArticle.access_logic === 'AND' ? 'bg-[#030213] text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'}`}
                      onClick={() => setDraftArticle({...draftArticle, access_logic: 'AND'})}
                    >
                      Exigir TODOS (AND)
                    </button>
                    <button 
                      className={`flex-1 text-[10px] font-bold py-1.5 rounded transition-colors ${draftArticle.access_logic === 'OR' ? 'bg-[#030213] text-white shadow-2xs' : 'text-slate-500 hover:bg-slate-50'}`}
                      onClick={() => setDraftArticle({...draftArticle, access_logic: 'OR'})}
                    >
                      Permitir QUALQUER (OR)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block">Departamentos Permitidos</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 bg-white p-2 rounded">
                    {departments.map(dept => (
                      <label key={dept.id} className="flex items-center gap-2 text-xs">
                        <input 
                          type="checkbox" 
                          checked={draftArticle.department_ids.includes(dept.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked 
                              ? [...draftArticle.department_ids, dept.id]
                              : draftArticle.department_ids.filter((id: string) => id !== dept.id);
                            setDraftArticle({...draftArticle, department_ids: newIds});
                          }}
                        />
                        {dept.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block">Cargos Permitidos (Roles)</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 bg-white p-2 rounded">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-2 text-xs">
                        <input 
                          type="checkbox"
                          checked={draftArticle.role_ids.includes(role.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked 
                              ? [...draftArticle.role_ids, role.id]
                              : draftArticle.role_ids.filter((id: string) => id !== role.id);
                            setDraftArticle({...draftArticle, role_ids: newIds});
                          }}
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setDraftArticle(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Descartar Rascunho
              </button>
              <button 
                onClick={handlePublishWiki}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Publicar e Indexar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Página de Wiki</h1>
          <p className="text-sm text-slate-500 mt-1">
            Encontre artigos sobre as questões mais comuns da base documental
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          {profile?.permissions?.includes('wiki:create') && (
            <button
              onClick={() => setShowGenModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#030213] hover:bg-[#030213]/90 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs cursor-pointer transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Novo Artigo (IA)
            </button>
          )}
        </div>
      </div>

      {/* SECÇÃO APROVAÇÃO PENDENTE (CANAIS) */}
      {!activeArticle && pendingReviewArticles.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Aprovação Pendente (Mensagens de Canais)</h2>
            <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingReviewArticles.length}</span>
          </div>
          <p className="text-xs text-amber-700 mb-4">
            Os seguintes documentos foram gerados automaticamente a partir de canais de mensagens (ex: Slack) mas requerem revisão humana por potencial conflito com a base de conhecimento.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviewArticles.map(art => (
              <div key={art.id} className="bg-white border border-amber-200 hover:border-amber-400 rounded-lg p-4 transition-all cursor-pointer flex flex-col justify-between group" onClick={() => incrementPopularity(art)}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      Revisão Necessária
                    </span>
                    <span className="text-[10px] text-slate-400">{art.updatedAt}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{art.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{art.summary}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-right">
                  <span className="text-xs text-amber-700 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                    Analisar &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeArticle ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setActiveArticle(null)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
              >
                &larr; Voltar para a listagem principal
              </button>
              <div className="flex items-center gap-2">
                {profile?.permissions?.includes('wiki:edit') && (
                  <button
                    onClick={handleEditWiki}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-semibold transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded border border-indigo-100"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Editar
                  </button>
                )}
                {profile?.permissions?.includes('wiki:delete') && (
                  <button
                    onClick={() => handleDeleteWiki(activeArticle.id)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer font-semibold transition-colors bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded border border-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                {activeArticle.category}
              </span>
              {activeArticle.isAiGenerated && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-150 text-indigo-700 px-2.5 py-1 rounded">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  Gerado por IA
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{activeArticle.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Última edição em: {activeArticle.updatedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5" />
                  {activeArticle.popularity} visualizações
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-600 bg-slate-50 border-l-4 border-slate-400 p-3.5 italic rounded-r leading-relaxed">
              &ldquo;{activeArticle.summary}&rdquo;
            </p>

            <div className="prose prose-slate max-w-none text-sm text-slate-800 text-justify leading-relaxed border-t border-slate-100 pt-5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeArticle.content}
              </ReactMarkdown>
            </div>

            {activeArticle.sources && activeArticle.sources.length > 0 && (
              <div className="mt-8 pt-5 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Bookmark className="h-4 w-4 text-indigo-500" /> Referências & Fontes</h3>
                <div className="flex flex-wrap gap-2">
                  {activeArticle.sources.map((src, idx) => (
                    <span key={idx} className="inline-flex items-center text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded border border-slate-200 shadow-sm">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Navegadores Relacionados</h3>
              <div className="space-y-2">
                {articles.filter(a => a.category === activeArticle.category && a.id !== activeArticle.id).slice(0, 3).map(art => (
                  <button
                    key={art.id}
                    onClick={() => { incrementPopularity(art); }}
                    className="w-full text-left p-2.5 rounded hover:bg-slate-50 border border-transparent hover:border-slate-150 text-xs text-slate-700 transition-all font-medium block cursor-pointer truncate"
                  >
                    {art.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar"
                  className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 text-slate-900 bg-[#f3f3f5]"
                />
              </div>
            </div>

            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => incrementPopularity(art)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-[#475569] px-2 py-0.5 rounded border border-slate-150">
                          {art.category}
                        </span>
                        {art.isAiGenerated && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                            <Sparkles className="h-2.5 w-2.5" />
                            IA
                          </span>
                        )}
                        {art.status === 'draft' && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded">
                            Rascunho
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Atribuído em: {art.updatedAt}</span>
                      <span className="text-xs text-slate-900 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Ler Artigo &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-lg bg-white">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                <h3 className="mt-4 text-xs font-bold text-slate-700 uppercase tracking-wider">A Wiki está vazia</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Não localizamos nenhuma página automática para os filtros indicados. Modifique os termos de busca ou clique para gerar um novo artigo corporativo em segundos!
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Artigos Populares
              </h3>
              <div className="space-y-3">
                {popularArticles.length > 0 ? popularArticles.map((art) => (
                  <div key={art.id} className="text-xs">
                    <button
                      onClick={() => incrementPopularity(art)}
                      className="font-semibold text-slate-800 hover:text-blue-600 text-left block leading-tight truncate w-full cursor-pointer"
                    >
                      {art.title}
                    </button>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{art.popularity} acessos corporativos</span>
                  </div>
                )) : <p className="text-xs text-slate-500">Sem dados.</p>}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Artigos Recentes
              </h3>
              <div className="space-y-3">
                {recentArticles.length > 0 ? recentArticles.map((art) => (
                  <div key={art.id} className="text-xs">
                    <button
                      onClick={() => incrementPopularity(art)}
                      className="font-semibold text-slate-800 hover:text-blue-600 text-left block leading-tight truncate w-full cursor-pointer"
                    >
                      {art.title}
                    </button>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Sincronizado: {art.updatedAt}</span>
                  </div>
                )) : <p className="text-xs text-slate-500">Sem dados.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showGenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#030213] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Compilação Inteligente</h3>
              </div>
              <button onClick={() => setShowGenModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateWiki} className="p-5 space-y-4">
              {genError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded font-medium">
                  {genError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Assunto / Perguntas de Interesse</label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="Ex: 'Procedimentos de Auditoria de Software'"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 text-slate-900 bg-[#f3f3f5]"
                  disabled={isGenerating}
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                Sincronizando com a nossa base documental, o modelo analisará as diretrizes para estruturar um guia autoral. O resultado abrirá em modo de Fact-Check antes de publicar.
              </p>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-md border border-slate-200 transition-colors cursor-pointer"
                  disabled={isGenerating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !genTopic.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#030213] hover:bg-[#030213]/90 disabled:bg-slate-200 disabled:text-slate-400 rounded-md shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Estruturando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Compilar Artigo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
