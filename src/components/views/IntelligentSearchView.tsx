'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, FileText, Info, Eye } from 'lucide-react';

interface Source {
  category: string;
  title: string;
  updatedAt: string;
  snippet: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  is_error?: boolean;
  timestamp: string;
}

interface IntelligentSearchViewProps {
  sessionId?: string | null;
  onSessionChange?: (id: string) => void;
  onSessionCreated?: () => void;
}

export const IntelligentSearchView: React.FC<IntelligentSearchViewProps> = ({ sessionId, onSessionChange, onSessionCreated }) => {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createdLocal = useRef(false);
  const welcomeMessage: ChatMessage = React.useMemo(() => ({
    id: "welcome",
    role: "assistant",
    content: "Olá! Tenho muito prazer em ajudar. Vamos começar?.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }), []);

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  useEffect(() => {
    const fetchSessionMessages = async () => {
      if (sessionId) {
        if (createdLocal.current) {
          createdLocal.current = false;
          return;
        }
        setIsSubmitting(true);
        try {
          const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
          const data = await res.json();
          if (res.ok && data.messages && data.messages.length > 0) {
            setMessages(data.messages.map((m: Record<string, unknown>) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              sources: m.sources,
              is_error: m.is_error,
              timestamp: new Date(m.created_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })));
          } else {
            setMessages([welcomeMessage]);
          }
        } catch (err) {
          console.error("Erro ao buscar mensagens", err);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setMessages([welcomeMessage]);
      }
    };
    fetchSessionMessages();
  }, [sessionId, welcomeMessage]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

    let currentSessionId = sessionId;

    try {
      if (!currentSessionId) {
        createdLocal.current = true;
        const titleRes = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: userText.substring(0, 40) + (userText.length > 40 ? '...' : '') })
        });
        const titleData = await titleRes.json();
        if (titleData.session) {
          currentSessionId = titleData.session.id as string;
          if (onSessionChange) onSessionChange(currentSessionId as string);
          if (onSessionCreated) onSessionCreated();
        }
      }

      if (currentSessionId) {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            role: 'user',
            content: userText
          })
        });
      }

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      const data = await response.json();
      const isError = !response.ok;
      const finalContent = data.answer || (isError ? "Desculpe, tive dificuldades para formular uma resposta no momento." : "Sem resposta.");

      if (currentSessionId) {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            role: 'assistant',
            content: finalContent,
            sources: data.sources || [],
            is_error: isError
          })
        });
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: finalContent,
        sources: data.sources || [],
        is_error: isError,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("RAG Error:", err);
      const errorContent = "Lamento, ocorreu um erro de comunicação com o servidor de Inteligência Artificial de retaguarda. Por favor, tente novamente de seguida.";

      if (currentSessionId) {
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            role: 'assistant',
            content: errorContent,
            is_error: true
          })
        });
      }

      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: errorContent,
        is_error: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSourcePreview = (source: Source) => {
    setSelectedSource(source);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 h-[calc(100vh-140px)] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">

      <div className="xl:col-span-3 flex flex-col h-full bg-[#f8fafc] border-r border-slate-200 relative overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#030213] text-white rounded-lg shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Knowledge Core AI</h2>
              <p className="text-[10px] text-slate-500 font-medium">Assistente Baseado em Contexto Corporativo</p>
            </div>
          </div>
        </div>

        <div id="workspace-search-container" ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-4 max-w-[85%] relative group shadow-sm transition-all ${message.role === 'user'
                    ? 'bg-[#030213] text-white rounded-2xl rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm'
                  }`}>
                  <div className={`flex items-center gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase ${message.role === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                    {message.role === 'user' ? "Você" : "Knowledge Core"}
                    <span>•</span>
                    <span className="font-medium opacity-70">{message.timestamp}</span>
                  </div>

                  <div className={`text-sm leading-relaxed space-y-2 whitespace-pre-line ${message.is_error ? 'text-red-500 font-medium' : ''}`}>
                    {message.content}
                  </div>

                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Fontes fidedignas consultadas:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => handleViewSourcePreview(src)}
                            className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-xs text-slate-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                          >
                            <FileText className="h-3.5 w-3.5 text-[#030213] shrink-0" />
                            <span className="truncate max-w-[150px] font-medium">{src.title}</span>
                            <Eye className="h-3 w-3 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm p-4 max-w-[70%] shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5 items-center bg-slate-50 px-2 py-1.5 rounded-full border border-slate-100">
                    <span className="w-1.5 h-1.5 bg-[#030213] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#030213] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#030213] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">A analisar base de conhecimento...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-t from-[#f8fafc] to-transparent shrink-0 pb-6 px-6">
          <form id="search-input-form" onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border border-slate-200 shadow-sm focus-within:border-[#030213]/30 focus-within:ring-4 focus-within:ring-[#030213]/5 rounded-2xl p-1.5 transition-all">
            <input
              id="input-query-field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que procura na base de conhecimento?"
              className="flex-1 text-sm bg-transparent outline-none px-4 py-2.5 text-slate-900 placeholder:text-slate-400"
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2 pr-1.5">
              <button
                id="btn-search-submit"
                type="submit"
                disabled={!query.trim() || isSubmitting}
                className="bg-[#030213] hover:bg-[#030213]/90 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl p-2.5 transition-colors cursor-pointer shadow-md disabled:shadow-none"
                title="Submeter Pesquisa"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400 font-medium">As respostas são geradas por IA com base em documentos da empresa e podem conter imprecisões.</span>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex flex-col h-full bg-white relative">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-xs font-extrabold text-[#030213] uppercase tracking-widest flex items-center gap-2">
            <FileText className="h-4 w-4" /> Inspeção de Fontes
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">Valide o contexto extraído dos documentos oficiais.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {selectedSource ? (
            <div id="source-preview" className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-[#030213]/5 text-[#030213] border border-[#030213]/10 mb-2">
                  {selectedSource.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{selectedSource.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Última indexação: {selectedSource.updatedAt}</p>
              </div>

              <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Excerto Relevante</span>
                </div>
                <div className="p-4 text-xs leading-relaxed text-slate-700 bg-white font-mono whitespace-pre-wrap">
                  {selectedSource.snippet}
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-600 font-medium leading-relaxed">
                  Este conteúdo foi vectorizado e considerado o mais relevante pelo modelo de IA para fundamentar a resposta actual.
                </div>
              </div>

              <button
                onClick={() => setSelectedSource(null)}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer font-bold shadow-2xs"
              >
                Limpar Inspeção
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
                <Eye className="h-6 w-6 stroke-[1.5] text-slate-300" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Sem Destaque</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed font-medium">
                Selecione uma citação nos resultados do chat para visualizar o excerto original do documento.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
