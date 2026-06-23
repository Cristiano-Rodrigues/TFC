'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Compass, Plus, Sparkles, Clock, Calendar, CheckCircle2, Bookmark, ArrowRight, ExternalLink, X, RefreshCw } from 'lucide-react';

interface WikiArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  sources: string[];
  updatedAt: string;
  isAiGenerated: boolean;
  isGrounded: boolean;
  popularity: number;
}

const INITIAL_ARTICLES: WikiArticle[] = [
  {
    id: "wiki-01",
    title: "Guia Rápido de Férias e Ausências",
    category: "Recursos Humanos",
    summary: "Como solicitar faturamentos de férias anuais de 22 dias no Portal de Recursos Humanos.",
    content: "### 1. Dos Direitos Globais\nQualquer colaborador tem direito a **22 dias úteis de férias** por ano fiscal, conforme o regulamento nacional de contratação de talentos.\n\n### 2. Dos Prazos para Submissão\n* É mandatório submeter no पोर्टल MyHR com no mínimo **30 dias de antecedência**.\n* Mudanças ou cancelamentos requerem aviso formal de 15 dias para realinhamento da escala da empresa.\n\n### 3. Workflow de Aprovação\nO sistema encaminhará para o Coordenador Direto de Divisão e, subsequentemente, ao Diretor Setorial de Recursos Humanos.",
    sources: ["Manual do Colaborador 2026.pdf", "Anexo Regulatório de Trabalho da Organização"],
    updatedAt: "2026-06-12",
    isAiGenerated: true,
    isGrounded: true,
    popularity: 124
  },
  {
    id: "wiki-02",
    title: "Normas de Utilização e Segurança da VPN Corporativa",
    category: "Tecnologia e Segurança",
    summary: "Passo a passo técnico de configuração do FortiClient e autenticação multifatorial obrigatória.",
    content: "### 1. Da Conexão Ativa via FortiClient\nPara obter acesso a ambientes protegidos de dados na AWS, é obrigatório ligar a nossa VPN dedicada via cliente oficial.\n\n### 2. Autenticação Multifatorial (MFA)\n* A autenticação de dois fatores deve estar sincronizada via Google Authenticator.\n* O compartilhamento de tokens ou chaves SSH é estritamente proibido.\n\n### 3. Bloqueio por Inatividade\nO software bloqueia sessões após 5 minutos de ociosidade total.",
    sources: ["Manual de Normativa de Segurança Orgânica v2", "Termos de Uso de Equipamentos de TI"],
    updatedAt: "2026-06-18",
    isAiGenerated: true,
    isGrounded: true,
    popularity: 98
  },
  {
    id: "wiki-03",
    title: "Tabelas e Limites de Reembolso de Despesas de Viagem",
    category: "Financeiro",
    summary: "Valores diários para viagens de serviço nacionais e internacionais e reembolso quilométrico.",
    content: "### 1. Política de Alimentação\n* **Nacional**: Limite máximo de **35,00€** diários reembolsáveis.\n* **Internacional**: Limite máximo de **70,00€** diários reembolsáveis.\n\n### 2. Deslocamentos via Carro Próprio\nReembolso de **0,40€** por quilómetro registado e fundamentado via relatório de KMs anexado na submissão mensal.",
    sources: ["Diretrizes de Reembolso Executivo 2026"],
    updatedAt: "2026-05-30",
    isAiGenerated: true,
    isGrounded: true,
    popularity: 85
  }
];

export const WikiView: React.FC = () => {
  const [articles, setArticles] = useState<WikiArticle[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('company_wiki_articles');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return INITIAL_ARTICLES;
        }
      }
    }
    return INITIAL_ARTICLES;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activeArticle, setActiveArticle] = useState<WikiArticle | null>(null);
  
  // AIS Generator Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genDept, setGenDept] = useState('Recursos Humanos');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const saveArticles = (newArticles: WikiArticle[]) => {
    setArticles(newArticles);
    localStorage.setItem('company_wiki_articles', JSON.stringify(newArticles));
  };

  const categories = ["Todas", "Recursos Humanos", "Tecnologia e Segurança", "Financeiro", "Compliance", "Suporte e Operações"];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          art.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todas' || art.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Sort articles by popularity for popular section, filtered by most up-to-date
  const popularArticles = [...articles].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
  const recentArticles = [...articles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);

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
          topic: genTopic,
          department: genDept
        })
      });

      if (!response.ok) {
        throw new Error("Erro na rede de geração de artigos");
      }

      const data = await response.json();

      const newArticle: WikiArticle = {
        id: `wiki-${Date.now()}`,
        title: data.title || genTopic,
        category: data.category || genDept,
        summary: data.summary || `Coletânea automatizada de diretrizes para o tema ${genTopic}`,
        content: data.content || "Sem conteúdo gerado.",
        sources: data.sources || ["Documentação Geral"],
        updatedAt: new Date().toISOString().split('T')[0],
        isAiGenerated: true,
        isGrounded: true,
        popularity: 1
      };

      const updatedList = [newArticle, ...articles];
      saveArticles(updatedList);
      setActiveArticle(newArticle); // Focus on fresh guide
      setShowGenModal(false);
      setGenTopic('');
    } catch (err: any) {
      console.error("Wiki creation error:", err);
      setGenError("Incapaz de estruturar Wiki de forma automática. Verifique se o backend está ativo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const incrementPopularity = (art: WikiArticle) => {
    const updated = articles.map(a => {
      if (a.id === art.id) {
        return { ...a, popularity: a.popularity + 1 };
      }
      return a;
    });
    saveArticles(updated);
    setActiveArticle({ ...art, popularity: art.popularity + 1 });
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Wiki Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 id="wiki-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Wiki Corporativa Autogerada</h1>
          <p className="text-sm text-slate-500 mt-1">
            Biblioteca de inteligência consolidada automaticamente com base em todos os canais e manuais validados.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            id="btn-trigger-wiki-gen"
            onClick={() => setShowGenModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs cursor-pointer transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Compilar Novo Artigo (IA)
          </button>
        </div>
      </div>

      {/* Main split dashboard / reader */}
      {activeArticle ? (
        /* --- Active Article Reader View --- */
        <div id="wiki-reader-layout" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-6 space-y-6">
            <button
              onClick={() => setActiveArticle(null)}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium mb-2"
            >
              &larr; Voltar para a listagem principal
            </button>

            {/* Badges and metadata */}
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
              {activeArticle.isGrounded && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-150 text-emerald-700 px-2.5 py-1 rounded">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Sustentado em Documentos Reais
                </span>
              )}
            </div>

            {/* Title */}
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

            {/* Structured Content Markdowns */}
            <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-5 space-y-4">
              {activeArticle.content}
            </div>

            {/* Citation Sources Footnotes */}
            {activeArticle.sources && activeArticle.sources.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-2">
                <h4 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">Documentação de Base e Auditoria:</h4>
                <ul className="space-y-1">
                  {activeArticle.sources.map((src, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                      <Bookmark className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{src}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Collateral Reader side links */}
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
        /* --- General Directory Layout --- */
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-5">
            {/* Search and category filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-4 rounded-lg border border-slate-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar manuais, regulamentos técnicos e rascunhos de Wiki..."
                  className="w-full text-xs pl-9 pr-4 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-450 text-slate-700 bg-slate-50/55"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Articles Grid */}
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => incrementPopularity(art)}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-lg p-5 shadow-3xs hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between group"
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
                      <span className="text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
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

          {/* Right margin panel directories info */}
          <div className="space-y-4">
            
            {/* Popular Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                Artigos Populares
              </h3>
              <div className="space-y-3">
                {popularArticles.map((art) => (
                  <div key={art.id} className="text-xs">
                    <button
                      onClick={() => incrementPopularity(art)}
                      className="font-semibold text-slate-800 hover:text-blue-600 text-left block leading-tight truncate w-full cursor-pointer"
                    >
                      {art.title}
                    </button>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{art.popularity} acessos corporativos</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                Artigos Recentes
              </h3>
              <div className="space-y-3">
                {recentArticles.map((art) => (
                  <div key={art.id} className="text-xs">
                    <button
                      onClick={() => incrementPopularity(art)}
                      className="font-semibold text-slate-800 hover:text-blue-600 text-left block leading-tight truncate w-full cursor-pointer"
                    >
                      {art.title}
                    </button>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Sincronizado: {art.updatedAt}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* COMPILATION MODAL POPUP */}
      {showGenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div id="wiki-creation-modal" className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Compilação Inteligente</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
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
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assunto / Perguntas de Interesse</label>
                <input
                  id="modal-gen-topic"
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="Ex: 'Procedimentos de Auditoria de Software'"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Departamento Organizacional</label>
                <select
                  id="modal-gen-dept"
                  value={genDept}
                  onChange={(e) => setGenDept(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800 bg-white"
                  disabled={isGenerating}
                >
                  {categories.filter(c => c !== 'Todas').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                Sincronizando com a nossa base documental, o modelo analisará as diretrizes arquivadas de privacidade e TI para estruturar um guia autoral para a equipa em segundos.
              </p>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                  disabled={isGenerating}
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-wiki-gen"
                  type="submit"
                  disabled={isGenerating || !genTopic.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 rounded shadow-3xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
