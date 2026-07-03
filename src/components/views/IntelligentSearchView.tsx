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
    <div className="grid grid-cols-1 xl:grid-cols-4 h-[calc(100vh-140px)] border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
      
      <div className="xl:col-span-3 flex flex-col h-full bg-slate-50/50 border-r border-slate-200 relative overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-900">Agente de pesquisa</h2>
          </div>
        </div>

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
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase opacity-60">
                      {message.role === 'user' ? "Você" : "IA"}
                      <span>•</span>
                      <span>{message.timestamp}</span>
                    </div>

                    <div className={`text-xs md:text-sm leading-relaxed space-y-2 whitespace-pre-line ${message.is_error ? 'text-red-600 font-medium' : 'text-slate-800'}`}>
                      {message.content}
                    </div>

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

      <div className="hidden xl:flex flex-col h-full bg-white relative">
        <div className="px-4 py-4 border-b border-slate-200">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Documentos citados</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Analise o documento selecionado ao clicar nas citações.</p>
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
                  <span>CONTEÚDO DA BAS DE FONTES</span>
                  <span className="text-slate-400">Destaque</span>
                </div>
                <div className="p-3 text-xs leading-relaxed text-slate-700 bg-amber-50/20 font-mono whitespace-pre-wrap">
                  {selectedSource.snippet}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed">
                Este excerto foi vetorizado e interpretado como contexto autêntico e fidedigno pela IA para elaborar a resposta final.
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
