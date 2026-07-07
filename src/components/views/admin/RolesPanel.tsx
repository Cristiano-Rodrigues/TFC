import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Permission {
  id: string;
  code: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  role_permissions: { permissions: Permission }[];
}

export const RolesPanel: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRoles, resPerms] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions')
      ]);
      const dataRoles = await resRoles.json();
      const dataPerms = await resPerms.json();
      
      if (resRoles.ok && dataRoles.roles) setRoles(dataRoles.roles);
      if (resPerms.ok && dataPerms.permissions) setAllPermissions(dataPerms.permissions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = isEditing ? `/api/roles/${currentId}` : '/api/roles';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, permission_ids: selectedPerms })
      });
      
      if (res.ok) {
        await fetchData();
        handleCloseModal();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta role?')) return;
    
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewModal = () => {
    setIsEditing(false);
    setName('');
    setDescription('');
    setSelectedPerms([]);
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setIsEditing(true);
    setCurrentId(role.id);
    setName(role.name || '');
    setDescription(role.description || '');
    setSelectedPerms(role.role_permissions.map((rp: any) => rp.permissions?.id).filter(Boolean));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const togglePermission = (id: string) => {
    if (selectedPerms.includes(id)) {
      setSelectedPerms(prev => prev.filter(p => p !== id));
    } else {
      setSelectedPerms(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            Cargos e Permissões (Roles)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Gira os níveis de acesso associando permissões a cargos.</p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs transition-all"
        >
          <Plus className="h-4 w-4" />
          Novo Cargo (Role)
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-3xs">
        <table className="w-full border-collapse text-left text-xs text-slate-600">
          <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Cargo</th>
              <th className="px-5 py-3">Permissões Associadas</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-450">A carregar...</td>
              </tr>
            ) : roles.length > 0 ? (
              roles.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 block">{r.name}</span>
                    <span className="text-[10px] text-slate-500">{r.description || '-'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {r.role_permissions.map((rp, i) => rp.permissions && (
                        <span key={i} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded border border-slate-200">
                          {rp.permissions.code}
                        </span>
                      ))}
                      {r.role_permissions.length === 0 && <span className="text-[10px] text-slate-400">Nenhuma permissão</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button onClick={() => openEditModal(r)} className="text-slate-400 hover:text-indigo-600 p-1">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="text-slate-400 hover:text-red-600 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-450">Nenhum cargo encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold uppercase tracking-wider">{isEditing ? 'Editar Cargo' : 'Novo Cargo'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nome *</label>
                    <input required value={name} onChange={e => setName(e.target.value)} className="w-full text-xs px-3 py-2 border rounded focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Descrição</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} className="w-full text-xs px-3 py-2 border rounded focus:border-indigo-500 outline-none" />
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 block">Permissões de Sistema</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 p-3 rounded bg-slate-50">
                    {allPermissions.map(p => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedPerms.includes(p.id)} 
                          onChange={() => togglePermission(p.id)}
                          className="rounded text-indigo-600 focus:ring-0" 
                        />
                        <span className="text-[10px] font-bold text-slate-700 uppercase">{p.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 shrink-0">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white border border-slate-200 rounded">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-3xs">{isEditing ? 'Guardar' : 'Criar Cargo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
