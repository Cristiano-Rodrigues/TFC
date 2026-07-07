'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Trash2, Shield, RefreshCw, Eye, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface DocBase {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'TXT' | 'XLSX';
  departments: {id: string, name: string}[];
  accessLogic: 'AND' | 'OR';
  allowedRolesData: {id: string, name: string}[];
  updatedAt: string;
  indexingState: 'Indexado' | 'Em Processamento' | 'Não Indexado';
  allowedRoles: string[];
  content: string;
  highlightedClasue: string;
  source: 'Local Upload' | 'Slack Integration' | 'Gmail Sync' | 'Google Drive';
}

export const DocumentsView: React.FC = () => {
  const { profile } = useAuth();

  const [documents, setDocuments] = useState<DocBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocBase | null>(null);
  const [departmentsList, setDepartmentsList] = useState<{id: string, name: string}[]>([]);
  const [rolesList, setRolesList] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const [docRes, deptRes, roleRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/departments'),
          fetch('/api/roles')
        ]);
        
        if (deptRes.ok) {
          const { departments } = await deptRes.json();
          if (departments) setDepartmentsList(departments);
        }
        if (roleRes.ok) {
          const { roles } = await roleRes.json();
          if (roles) setRolesList(roles);
        }

        if (!docRes.ok) return;
        const { documents: rawDocs } = await docRes.json();

        const mapped: DocBase[] = (rawDocs || []).map((d: any) => {
          const ext = d.filename?.split('.').pop()?.toUpperCase() || 'TXT';
          const type = (['PDF', 'DOCX', 'TXT', 'XLSX'].includes(ext) ? ext : 'TXT') as DocBase['type'];
          const indexState: DocBase['indexingState'] =
            d.n8n_status === 'done' ? 'Indexado'
            : d.n8n_status === 'processing' ? 'Em Processamento'
            : 'Não Indexado';
            
          const depts = d.document_departments ? d.document_departments.map((dd: any) => dd.departments).filter(Boolean) : [];
          const roles = d.document_permissions ? d.document_permissions.map((dp: any) => dp.roles).filter(Boolean) : [];

          return {
            id: d.id,
            name: d.filename,
            type,
            departments: depts,
            accessLogic: d.metadata?.access_logic || 'AND',
            updatedAt: d.created_at?.split('T')[0] || '',
            indexingState: indexState,
            allowedRoles: roles.map((r: any) => r.name),
            allowedRolesData: roles,
            content: '',
            highlightedClasue: '',
            source: 'Local Upload' as const,
          };
        });

        setDocuments(mapped);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);
  
  const [permissionsModalDoc, setPermissionsModalDoc] = useState<DocBase | null>(null);
  const [updatingPermsRole, setUpdatingPermsRole] = useState<string[]>([]);
  const [updatingPermsDept, setUpdatingPermsDept] = useState<string[]>([]);
  const [updatingAccessLogic, setUpdatingAccessLogic] = useState<'AND'|'OR'>('AND');
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [deptFilter, setDeptFilter] = useState('Todos');
  const [sourceFilter, setSourceFilter] = useState('Todos');

  const canDelete = profile?.permissions.includes('doc:delete') || profile?.role === 'admin';
  const canManagePerms = profile?.permissions.includes('doc:manage_perms') || profile?.role === 'admin';

  const filteredDocs = documents.filter(doc => {
    const userRole = profile?.role || 'user';
    const userDeptId = profile?.department_id;
    const userRoleId = profile?.role_id;
    
    let isAllowed = false;

    if (userRole === 'admin') {
      isAllowed = true;
    } else if (doc.departments.length === 0 && doc.allowedRoles.length === 0) {
      isAllowed = true;
    } else {
      const hasDept = doc.departments.some(d => d.id === userDeptId);
      const hasRole = doc.allowedRolesData.some(r => r.id === userRoleId);
      
      if (doc.accessLogic === 'OR') {
         isAllowed = hasDept || hasRole;
      } else {
         const deptCheck = doc.departments.length === 0 || hasDept;
         const roleCheck = doc.allowedRoles.length === 0 || hasRole;
         isAllowed = deptCheck && roleCheck;
      }
    }

    if (!isAllowed) return false;

    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Todos' || doc.type === typeFilter;
    const matchesDept = deptFilter === 'Todos' || doc.departments.some(d => d.id === deptFilter) || (doc.departments.length === 0 && deptFilter === 'Geral');
    const matchesSource = sourceFilter === 'Todos' || doc.source === sourceFilter;

    return matchesSearch && matchesType && matchesDept && matchesSource;
  });

  const handleDeleteDoc = async (id: string, name: string) => {
    if (!window.confirm(`Confirma a exclusão irrevogável do documento "${name}" de toda a base de inteligência?`)) return;
    
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        if (selectedDoc?.id === id) setSelectedDoc(null);
      } else {
        alert("Erro ao eliminar o documento.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao eliminar o documento.");
    }
  };

  const handleReindex = (id: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, indexingState: 'Em Processamento' };
      }
      return d;
    }));

    setTimeout(() => {
      setDocuments(prev => prev.map(d => {
        if (d.id === id) {
          return { ...d, indexingState: 'Indexado', updatedAt: new Date().toISOString().split('T')[0] };
        }
        return d;
      }));
    }, 2000);
  };

  const handleOpenPermissionsEditor = (doc: DocBase) => {
    setPermissionsModalDoc(doc);
    setUpdatingPermsRole(doc.allowedRolesData.map(r => r.id));
    setUpdatingPermsDept(doc.departments.map(d => d.id));
    setUpdatingAccessLogic(doc.accessLogic);
  };

  const handleSavePermissions = async () => {
    if (!permissionsModalDoc) return;
    setIsSavingPerms(true);
    
    try {
      const res = await fetch(`/api/documents/${permissionsModalDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_ids: updatingPermsDept,
          role_ids: updatingPermsRole,
          access_logic: updatingAccessLogic
        })
      });
      
      if (res.ok) {
        setDocuments(prev => prev.map(d => {
          if (d.id === permissionsModalDoc.id) {
            const newDepts = departmentsList.filter(dept => updatingPermsDept.includes(dept.id));
            const newRolesData = rolesList.filter(role => updatingPermsRole.includes(role.id));
            return { 
              ...d, 
              departments: newDepts,
              allowedRolesData: newRolesData,
              allowedRoles: newRolesData.map(r => r.name),
              accessLogic: updatingAccessLogic
            };
          }
          return d;
        }));
        setPermissionsModalDoc(null);
      } else {
        alert("Erro ao atualizar as permissões.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao atualizar permissões.");
    } finally {
      setIsSavingPerms(false);
    }
  };

  const toggleRoleInModal = (roleId: string) => {
    setUpdatingPermsRole(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleDeptInModal = (deptId: string) => {
    setUpdatingPermsDept(prev => 
      prev.includes(deptId) ? prev.filter(r => r !== deptId) : [...prev, deptId]
    );
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 id="docs-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Base Documental Organizacional</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gira permissões, audite estados de indexação de arquivos integrados e configure restrições com base em departamentos.
          </p>
        </div>
      </div>

      {/* Primary Split View (Table + PDF Viewer Column) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table list */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Advanced Filter Panel */}
          <div className="bg-white p-4 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtro por Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50"
              >
                <option value="Todos">Todos (PDF, DOC, TXT...)</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="TXT">TXT</option>
                <option value="XLSX">Spreadsheet (XLSX)</option>
              </select>
            </div>

            <div className="sm:col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departamento</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50"
              >
                <option value="Todos">Todas as Áreas</option>
                <option value="Geral">Geral / Global</option>
                {departmentsList.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-medium">Origem do Arquivo</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50"
              >
                <option value="Todos">Todas as Origens</option>
                <option value="Local Upload">Upload Local</option>
                <option value="Slack Integration">Canais Slack</option>
                <option value="Gmail Sync">Mensagens Gmail</option>
                <option value="Google Drive">Google Drive</option>
              </select>
            </div>

            <div className="sm:col-span-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar nesta lista..."
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          {/* Table Element */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-3xs">
            <table className="w-full border-collapse text-left text-xs text-slate-600">
              <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3">Nome do Ficheiro</th>
                  <th scope="col" className="px-4 py-3">Área / Origem</th>
                  <th scope="col" className="px-4 py-3">Indexação IA</th>
                  <th scope="col" className="px-4 py-3">Acessibilidade RBAC</th>
                  <th scope="col" className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400 bg-slate-50/50">
                      <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                      <span className="text-xs">A carregar documentos...</span>
                    </td>
                  </tr>
                ) : filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr
                      id={`doc-row-${doc.id}`}
                      key={doc.id}
                      className={`hover:bg-slate-50/70 transition-colors ${selectedDoc?.id === doc.id ? 'bg-blue-50/30' : ''}`}
                    >
                      {/* Name & Type */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <FileText className={`h-4.5 w-4.5 shrink-0 ${doc.type === 'PDF' ? 'text-red-500' : doc.type === 'DOCX' ? 'text-blue-500' : doc.type === 'XLSX' ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <div className="truncate">
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                            >
                              {doc.name}
                            </button>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Sincronizado em: {doc.updatedAt}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Source */}
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-semibold text-slate-700 block line-clamp-1" title={doc.departments.map(d => d.name).join(', ')}>
                          {doc.departments.length > 0 ? doc.departments.map(d => d.name).join(', ') : 'Global (Todos)'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{doc.source}</span>
                      </td>

                      {/* Indexing Status */}
                      <td className="px-4 py-3.5">
                        {doc.indexingState === 'Indexado' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Sincronizado
                          </span>
                        ) : doc.indexingState === 'Em Processamento' ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                            Pensando...
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* RBAC constraints badges */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 items-center">
                          {doc.allowedRoles.length > 0 ? (
                            <>
                              <span className="text-[9px] font-bold text-slate-400 mr-1">{doc.accessLogic}</span>
                              {doc.allowedRoles.map(role => (
                                <span key={role} className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">
                                  {role}
                                </span>
                              ))}
                            </>
                          ) : (
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 uppercase tracking-wide">
                              NENHUM
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors inline-block cursor-pointer"
                          title="Visualizar documento"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManagePerms && (
                          <button
                            onClick={() => handleOpenPermissionsEditor(doc)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors inline-block cursor-pointer"
                            title="Alterar acessibilidade"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleReindex(doc.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors inline-block cursor-pointer"
                          title="Forçar Reindexamento IA"
                          disabled={doc.indexingState === 'Em Processamento'}
                        >
                          <RefreshCw className={`h-4 w-4 ${doc.indexingState === 'Em Processamento' ? 'animate-spin text-slate-300' : ''}`} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteDoc(doc.id, doc.name)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors inline-block cursor-pointer"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-450 bg-slate-50/50">
                      Nenhum arquivo encontrado de acordo com os critérios de segurança ou filtragem definidos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column representing simulated PDF Reader */}
        <div className="xl:col-span-1">
          {selectedDoc ? (
            /* --- Actual Document Viewer UI --- */
            <div id="document-viewer-container" className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col h-full shadow-xs animate-in slide-in-from-right duration-150">
              
              {/* Header */}
              <div className="bg-white px-4 py-3 border-b border-slate-200 text-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-semibold truncate text-slate-700">{selectedDoc.name}</span>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* PDF style sheet */}
              <div className="p-5 flex-1 bg-slate-50 min-h-[300px] border-b border-slate-200">
                <div className="bg-white border border-slate-200 rounded p-5 shadow-2xs space-y-4">
                  
                  {/* Internal file Header */}
                  <div className="flex items-center justify-between border-b pb-3 text-[10px] text-slate-400 font-semibold font-mono">
                    <span>MANUAL INTERNO</span>
                    <span>NIF: 509200192</span>
                  </div>

                  {/* Highlighter section */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider block mb-1">Cláusula Destacada por Relevância RAG:</span>
                    <p className="text-[11px] text-yellow-950 font-medium leading-relaxed font-sans italic">
                      &ldquo;{selectedDoc.highlightedClasue}&rdquo;
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                    {selectedDoc.content}
                  </div>
                </div>
              </div>

              {/* Linked topics footnote */}
              <div className="p-4 bg-slate-50/50 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Metadados de conformidade:</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Origem:</span>
                    <span className="font-semibold text-slate-800">{selectedDoc.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acesso:</span>
                    <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px]">{selectedDoc.allowedRoles.join(' | ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- Empty State --- */
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-10 text-center h-full flex flex-col items-center justify-center text-slate-400 min-h-[350px]">
              <FileText className="h-8 w-8 stroke-[1.5] text-slate-300 mb-2" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Leitor PDF Corporativo</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] mt-1 line-clamp-3 leading-relaxed">
                Clique sobre o título de qualquer documento na tabela avançada para carregar a pré-visualização, com as devidas cláusulas de relevância em destaque.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ACCESS LEVEL MODAL DIALOG */}
      {permissionsModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div id="permissions-edit-modal" className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-850">Controlo de Acesso RBAC</h3>
              </div>
              <button
                onClick={() => setPermissionsModalDoc(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configurar Permissões para:</span>
                <p className="text-sm font-bold text-[#1e293b] leading-snug">{permissionsModalDoc.name}</p>
              </div>

              <hr className="border-slate-150" />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Departamentos Autorizados:</span>
                  <div className="flex flex-wrap gap-2 p-2.5 border border-slate-150 rounded bg-slate-50 max-h-32 overflow-y-auto">
                    {departmentsList.map(d => (
                      <label key={d.id} className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 border border-slate-200 rounded hover:border-blue-400 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={updatingPermsDept.includes(d.id)} 
                          onChange={() => toggleDeptInModal(d.id)}
                          className="rounded text-blue-600 focus:ring-0 h-3.5 w-3.5"
                        />
                        <span className="text-[10px] font-bold text-slate-700">{d.name}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 leading-tight">
                    Se nenhum departamento for selecionado, o documento é considerado global para toda a empresa.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Lógica de Acesso (RBAC):</span>
                  <select
                    value={updatingAccessLogic}
                    onChange={(e) => setUpdatingAccessLogic(e.target.value as 'AND' | 'OR')}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50"
                  >
                    <option value="AND">E (AND) - Tem de ter o departamento E o cargo selecionado</option>
                    <option value="OR">OU (OR) - Basta ter o departamento OU o cargo selecionado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Cargos Autorizados:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {rolesList.map(role => {
                      if (role.name === 'admin') return null; // Admins tem acesso a tudo, nao precisam ser geridos aqui
                      return (
                        <div
                          key={role.id}
                          onClick={() => toggleRoleInModal(role.id)}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-slate-150 text-xs cursor-pointer transition-colors"
                        >
                          <span className="font-bold text-slate-800 truncate pr-2">{role.name}</span>
                          <input
                            type="checkbox"
                            checked={updatingPermsRole.includes(role.id)}
                            onChange={() => {}}
                            className="rounded text-blue-600 focus:ring-0 h-3.5 w-3.5 cursor-pointer shrink-0"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPermissionsModalDoc(null)}
                  disabled={isSavingPerms}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded cursor-pointer transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isSavingPerms}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-3xs cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingPerms ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                  Salvar Restrições
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
