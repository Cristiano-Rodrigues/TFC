import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const DepartmentsPanel: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (res.ok && data.departments) {
        setDepartments(data.departments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = isEditing ? `/api/departments/${currentId}` : '/api/departments';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      
      if (res.ok) {
        await fetchDepartments();
        handleCloseModal();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este departamento?')) return;
    
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDepartments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewModal = () => {
    setIsEditing(false);
    setName('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (dept: Department) => {
    setIsEditing(true);
    setCurrentId(dept.id);
    setName(dept.name || '');
    setDescription(dept.description || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Gestão de Departamentos
          </h2>
          <p className="text-xs text-slate-500 mt-1">Crie e edite as áreas organizacionais da empresa.</p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs transition-all"
        >
          <Plus className="h-4 w-4" />
          Novo Departamento
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-3xs">
        <table className="w-full border-collapse text-left text-xs text-slate-600">
          <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
            <tr>
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-450">A carregar...</td>
              </tr>
            ) : departments.length > 0 ? (
              departments.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{d.name}</td>
                  <td className="px-5 py-3.5 text-slate-500">{d.description || '-'}</td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button onClick={() => openEditModal(d)} className="text-slate-400 hover:text-blue-600 p-1">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-600 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-450">Nenhum departamento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 w-full max-w-sm shadow-xl overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">{isEditing ? 'Editar Departamento' : 'Novo Departamento'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nome *</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full text-xs px-3 py-2 border rounded focus:border-slate-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Descrição</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full text-xs px-3 py-2 border rounded focus:border-slate-500 outline-none resize-none" />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={handleCloseModal} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 border rounded">Cancelar</button>
                <button type="submit" disabled={submitting} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-3xs">{isEditing ? 'Guardar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
