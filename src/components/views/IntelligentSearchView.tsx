'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Send, FileText, Info, ArrowRight, ExternalLink, HelpCircle, CornerDownLeft, Eye, RefreshCcw } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  timestamp: string;
}

export const IntelligentSearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Eu sou o assistente de pesquisa inteligente corporativo (RAG). Procuro respostas concretas diretamente nas vossas diretrizes organizacionais, regulamentos de TI, códigos de ética e manuais cadastrados.\n\nExperimente fazer uma pergunta para iniciar a pesquisa.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isSubmitting]);



  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setQuery('');
    setIsSubmitting(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.answer || "Desculpe, tive dificuldades para formular uma resposta no momento.",
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("RAG Error:", err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: "Lamento, ocorreu um erro de comunicação com o servidor de Inteligência Artificial de retaguarda. Por favor, tente novamente de seguida.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSourcePreview = (source: any) => {
    setSelectedSource(source);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 h-[calc(100vh-140px)] border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
      
      {/* Left Chat/Results Panel */}
      <div className="xl:col-span-3 flex flex-col h-full bg-slate-50/50 border-r border-slate-200 relative overflow-hidden">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Workspace de Pesquisa Inteligente</h2>
          </div>
        </div>

        {/* Dynamic Mode Area */}
        <div id="workspace-search-container" ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-4 rounded-xl max-w-[85%] border shadow-2xs relative group ${
                    message.role === 'user'
                      ? 'bg-slate-100 border-slate-200 text-slate-800 rounded-br-none'
                      : 'bg-white border-slate-100 text-slate-800 rounded-bl-none'
                  }`}>
                    {/* Role Header */}
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase opacity-60">
                      {message.role === 'user' ? "O Seu Pedido" : "Resposta RAG Intel"}
                      <span>•</span>
                      <span>{message.timestamp}</span>
                    </div>

                    {/* Rich text markdown answer */}
                    <div className="text-xs md:text-sm leading-relaxed space-y-2 whitespace-pre-line text-slate-800">
                      {message.content}
                    </div>

                    {/* Cited sources row if prompt is by assistant */}
                    {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
                          Fontes fidedignas utilizadas ({message.sources.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {message.sources.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => handleViewSourcePreview(src)}
                              className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 px-2 py-1 rounded transition-colors group/btn cursor-pointer"
                            >
                              <FileText className="h-3 w-3 text-blue-500 shrink-0" />
                              <span className="truncate max-w-[140px] font-medium">{src.title}</span>
                              <Eye className="h-2.5 w-2.5 text-slate-400 group-hover/btn:text-blue-500 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSubmitting && (
                <div className="flex gap-4 justify-start">
                  <div className="bg-white border border-slate-200 text-slate-800 rounded-lg rounded-bl-none p-4 max-w-[70%] shadow-3xs flex items-center gap-3">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Consultando documentos organizacionais e gerando resposta sustentada...</span>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Input box docked below */}
        <div className="p-4 bg-white border-t border-slate-205 shrink-0">
          <form id="search-input-form" onSubmit={handleSearchSubmit} className="relative flex items-center bg-slate-50 border border-slate-205 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 rounded-lg p-1 transition-all">
            <input
              id="input-query-field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Perguntar ao conhecimento corporativo... (ex: 'quantos dias posso gozar de férias?')"
              className="flex-1 text-sm bg-transparent outline-none px-3 py-2 text-slate-800 placeholder-slate-400"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2 pr-2.5">
              <button
                id="btn-search-submit"
                type="submit"
                disabled={!query.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-md p-1.5 transition-colors cursor-pointer"
                title="Submeter Pesquisa"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Drawer Panel with Context Preview */}
      <div className="hidden xl:flex flex-col h-full bg-white relative">
        <div className="px-4 py-4 border-b border-slate-200">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Documento e Contexto RAG</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Analise o documento bruto selecionado ao clicar nas citações.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedSource ? (
            <div id="source-preview" className="space-y-4">
              <div className="bg-slate-50 p-3.5 border border-slate-200 rounded">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-1.5">
                  {selectedSource.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{selectedSource.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Última indexação: {selectedSource.updatedAt}</p>
              </div>

              <div className="rounded border border-slate-200 shadow-2xs">
                <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>CONTEÚDO DA BASE DE DADOS</span>
                  <span className="text-slate-400">Highlight Ativo</span>
                </div>
                <div className="p-3 text-xs leading-relaxed text-slate-700 bg-amber-50/20 font-mono whitespace-pre-wrap">
                  {selectedSource.snippet}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed">
                Este excerto foi vetorizado e interpretado como contexto autêntico e fidedigno pela IA para elaborar a resposta final de auditoria.
              </div>
              
              <button
                onClick={() => setSelectedSource(null)}
                className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1.5 rounded border border-slate-200 cursor-pointer font-semibold"
              >
                Limpar Pré-visualização
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
              <Info className="h-6 w-6 stroke-[1.5] text-slate-400 mb-2" />
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nenhum Documento Selecionado</p>
              <p className="text-[10px] text-slate-400 max-w-[180px] mt-1 mx-auto leading-relaxed">
                Interaja no chat, faça perguntas e clique nos cartões de fonte de informação para carregar os artigos com destaque de texto aqui.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
