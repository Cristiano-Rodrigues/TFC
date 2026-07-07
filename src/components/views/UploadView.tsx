'use client';

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, ShieldAlert, History, Loader2, Play } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface QueuedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: 'Pendente' | 'Enviando' | 'Processando IA' | 'Concluído' | 'Falhado';
  department: string;
  departmentIds: string[];
  roles: string[];
  accessLogic: 'AND' | 'OR';
  file?: File;
}

interface UploadHistoryItem {
  id: string;
  name: string;
  size: string;
  category: string;
  uploadedAt: string;
  status: 'Sincronizado' | 'Falhado';
}

export const UploadView: React.FC = () => {
  const { profile } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [roles, setRoles] = useState<{id: string, name: string}[]>([]);
  
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [accessLogic, setAccessLogic] = useState<'AND' | 'OR'>('AND');

  const canUpload = profile?.permissions.includes('doc:upload') || profile?.role === 'admin' || profile?.role === 'manager';

  useEffect(() => {
    if (canUpload) {
      Promise.all([
        fetch('/api/departments').then(res => res.json()),
        fetch('/api/roles').then(res => res.json())
      ]).then(([deptData, roleData]) => {
        if (deptData.departments) {
          setDepartments(deptData.departments);
        }
        if (roleData.roles) setRoles(roleData.roles);
      }).catch(err => console.error(err));
    }
  }, [canUpload]);

  if (!canUpload) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="p-3 bg-red-50 border border-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Acesso Restrito - Upload de Documentos</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          A sua conta atual <strong>({profile?.fullName || "Colaborador"})</strong> licenciada sob o cargo <strong>(role: {profile?.role})</strong> não possui outorga explícita para registrar regulamentos na base central. Entre em contacto com a equipa de TI para elevar o seu perfil.
        </p>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleManualSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (selectedDepts.length === 0) {
      alert("Por favor, selecione pelo menos um departamento.");
      return;
    }
    
    const deptNames = departments.filter(d => selectedDepts.includes(d.id)).map(d => d.name).join(', ') || 'Desconhecido';
    
    const arr: QueuedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeStr = file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
        : (file.size / 1024).toFixed(0) + " KB";

      arr.push({
        id: `file-${crypto.randomUUID()}-${i}`,
        name: file.name,
        size: sizeStr,
        type: file.name.split('.').pop()?.toUpperCase() || 'TXT',
        progress: 0,
        status: 'Pendente',
        department: deptNames,
        departmentIds: [...selectedDepts],
        roles: [...selectedRoles],
        accessLogic: accessLogic,
        file: file
      });
    }
    setQueuedFiles(prev => [...prev, ...arr]);
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleDept = (deptId: string) => {
    setSelectedDepts(prev => 
      prev.includes(deptId) ? prev.filter(r => r !== deptId) : [...prev, deptId]
    );
  };

  const startIngestionPipeline = async (id: string) => {
    setQueuedFiles(prev => prev.map(f => {
      if (f.id === id) return { ...f, status: 'Enviando', progress: 50 };
      return f;
    }));

    const fileObj = queuedFiles.find(f => f.id === id);
    if (!fileObj || !fileObj.file) return;

    try {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('department_ids', JSON.stringify(fileObj.departmentIds));
      formData.append('role_ids', JSON.stringify(fileObj.roles));
      formData.append('access_logic', fileObj.accessLogic);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || "Upload falhou");
      }

      const finalStatus = result.n8n_triggered ? 'Processando IA' : 'Concluído';

      setQueuedFiles(prev => prev.map(f => {
        if (f.id === id) return { ...f, status: finalStatus, progress: 100 };
        return f;
      }));

      if (result.n8n_triggered) {
        setTimeout(() => {
          setQueuedFiles(prev => prev.map(f => {
            if (f.id === id) return { ...f, status: 'Concluído' };
            return f;
          }));
        }, 8000);
      }

      const hist: UploadHistoryItem = {
        id: `hist-${crypto.randomUUID()}`,
        name: fileObj.name,
        size: fileObj.size,
        category: fileObj.department,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'Sincronizado'
      };
      setUploadHistory(historyPrev => [hist, ...historyPrev]);

    } catch (error: any) {
      console.error('Upload error:', error);
      setQueuedFiles(prev => prev.map(f => {
        if (f.id === id) return { ...f, status: 'Falhado', progress: 0 };
        return f;
      }));
    }
  };

  const handleClearQueueItem = (id: string) => {
    setQueuedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 id="upload-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Ingestão de Documentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Faça upload de novos materiais para que a IA processe a segmentação em pedaços (chunking) e crie os vetores semânticos no RAG.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 border border-slate-200 rounded-lg space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider block">1. Departamentos Destino</span>
                <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded bg-slate-50">
                  {departments.length === 0 && <span className="text-[10px] text-slate-400 p-1">A carregar...</span>}
                  {departments.map(d => (
                    <label key={d.id} className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 border border-slate-200 rounded shadow-3xs hover:border-blue-400 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedDepts.includes(d.id)} 
                        onChange={() => toggleDept(d.id)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-[10px] font-bold text-slate-700">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider block">2. Lógica de Acesso Restrito</span>
                <select
                  value={accessLogic}
                  onChange={(e) => setAccessLogic(e.target.value as 'AND' | 'OR')}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-800 font-medium"
                >
                  <option value="AND">Exigir Cargo E Departamento (AND)</option>
                  <option value="OR">Exigir Cargo OU Departamento (OR)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider block flex justify-between">
                  3. Restringir a Cargos (Opcional)
                  <span className="text-slate-400 font-normal">Se não selecionar nenhum, qualquer membro do departamento tem acesso.</span>
                </span>
                <div className="flex flex-wrap gap-2 p-3 border border-slate-200 rounded bg-slate-50">
                  {roles.map(r => (
                    <label key={r.id} className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1.5 border border-slate-200 rounded shadow-3xs hover:border-blue-400 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedRoles.includes(r.id)} 
                        onChange={() => toggleRole(r.id)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-[10px] font-bold text-slate-700">{r.name}</span>
                    </label>
                  ))}
                  {roles.length === 0 && <span className="text-[10px] text-slate-400 p-1">Sem cargos configurados</span>}
                </div>
              </div>
            </div>

            <div
              id="upload-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${dragActive
                ? 'border-blue-500 bg-blue-50/20'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/25'
                }`}
            >
              <input
                id="file-input-manual"
                type="file"
                multiple
                onChange={handleManualSelect}
                className="hidden"
                accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx"
              />
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto stroke-[1.5]" />
              <p className="mt-4 text-xs font-bold text-slate-800 uppercase tracking-wider">Arraste os arquivos para aqui</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-normal">
                Suporta: PDF, DOCX, TXT, CSV, XLSX, PPTX até 15MB para particionamento.
              </p>
              <button
                type="button"
                onClick={() => document.getElementById('file-input-manual')?.click()}
                className="mt-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2 rounded shadow-3xs cursor-pointer transition-all"
              >
                Procurar Ficheiros
              </button>
            </div>
          </div>

          {queuedFiles.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">Fila de Registro de IA</h3>

              <div className="divide-y divide-slate-100">
                {queuedFiles.map((file) => (
                  <div key={file.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3 truncate max-w-[70%]">
                      <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="truncate text-xs">
                        <span className="font-bold text-slate-900 block truncate">{file.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold text-[9px] uppercase">{file.department}</span>
                          {file.roles.length > 0 && (
                            <span className="text-blue-500 font-bold ml-1">+{file.roles.length} roles ({file.accessLogic})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {file.status === 'Pendente' && (
                        <button
                          onClick={() => startIngestionPipeline(file.id)}
                          className="bg-[#1e293b] hover:bg-slate-800 text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded shadow-3xs flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="h-3 w-3" />
                          Indexar RAG
                        </button>
                      )}

                      {file.status === 'Enviando' && (
                        <div className="text-right space-y-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">A carregar: {file.progress}%</span>
                          <div className="h-1.5 w-[110px] bg-slate-150 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${file.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {file.status === 'Processando IA' && (
                        <div className="text-right flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Vetorizando Chunks...
                        </div>
                      )}

                      {file.status === 'Concluído' && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Sucesso IA
                        </span>
                      )}

                      <button
                        onClick={() => handleClearQueueItem(file.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded"
                        title="Remover da fila"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              Histórico Recente de Ingestões
            </h3>

            <div className="space-y-4">
              {uploadHistory.map((item) => (
                <div key={item.id} className="text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-800 line-clamp-2 leading-snug">{item.name}</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 bg-violet font-semibold shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1.5">
                    <span>{item.size}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-medium">{item.category}</span>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Sincronizado: {item.uploadedAt}</span>
                    <span className="text-emerald-600 font-semibold">Grounded RAG</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
