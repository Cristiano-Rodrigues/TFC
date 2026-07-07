'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/lib/auth-context';
import { ShieldCheck, UserPlus, FileEdit, Trash2, CheckCircle2, X, ShieldAlert, KeyRound, Search, Filter, Users, Building2 } from 'lucide-react';
import { DepartmentsPanel } from './admin/DepartmentsPanel';
import { RolesPanel } from './admin/RolesPanel';

export const AdminView: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'roles'>('users');
  
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{id: string, name: string}[]>([]);
  const [availableDepts, setAvailableDepts] = useState<{id: string, name: string}[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [searchEmail, setSearchEmail] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todas');
  const [deptFilter, setDeptFilter] = useState('Todas');

  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRoleId, setAddRoleId] = useState('');
  const [addDeptId, setAddDeptId] = useState('');
  const [isSubmitInvite, setIsSubmitInvite] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const canManageUsers = isAdmin || profile?.permissions?.includes('users:manage');
  const canManageDepts = isAdmin || profile?.permissions?.includes('departments:manage');
  const canManageRoles = isAdmin || profile?.permissions?.includes('roles:manage');
  const hasAnyAdminAccess = canManageUsers || canManageDepts || canManageRoles;

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && data.users) {
        const users: UserProfile[] = data.users.map((u: any) => ({
          id: u.id,
          email: u.email || '',
          fullName: u.full_name || (u.email ? u.email.split('@')[0] : 'Colaborador'),
          role: u.role || 'user',
          department: u.department || 'Geral',
          role_id: u.role_id,
          department_id: u.department_id,
          active: u.active !== false,
          permissions: []
        }));
        setAllProfiles(users);
        if (data.roles) setAvailableRoles(data.roles);
        if (data.departments) setAvailableDepts(data.departments);
        
        if (data.roles?.length && !addRoleId) setAddRoleId(data.roles[0].id);
        if (data.departments?.length && !addDeptId) setAddDeptId(data.departments[0].id);
      }
    } catch (e) {
      console.warn("Failed to fetch users", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (hasAnyAdminAccess) {
      if (activeTab === 'users' && !canManageUsers) {
        if (canManageDepts) setActiveTab('departments');
        else if (canManageRoles) setActiveTab('roles');
      }
      
      if (canManageUsers) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnyAdminAccess, canManageUsers, canManageDepts, canManageRoles]);

  if (!hasAnyAdminAccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="p-3 bg-red-50 border border-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Acesso Negado</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          A sua credencial atual diz respeito a um perfil de <strong>{profile?.role || "standard"}</strong>. Esta secção administrativa permite o controlo e atribuição de permissões da equipa, estando restrita apenas a quem possui os privilégios corretos.
        </p>
      </div>
    );
  }

  const filteredUsers = allProfiles.filter(u => {
    const matchesEmail = u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                         u.fullName.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesRole = roleFilter === 'Todas' || u.role === roleFilter;
    const matchesDept = deptFilter === 'Todas' || u.department === deptFilter;
    return matchesEmail && matchesRole && matchesDept;
  });

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addName.trim() || !addPassword) return;

    setIsSubmitInvite(true);
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addEmail,
          fullName: addName,
          role_id: addRoleId,
          department_id: addDeptId,
          password: addPassword
        })
      });

      if (res.ok) {
        await fetchUsers();
        setShowAddModal(false);
        setAddEmail('');
        setAddName('');
        setAddPassword('');
        setAddRoleId(availableRoles[0]?.id || '');
        setAddDeptId(availableDepts[0]?.id || '');
      }
    } catch (e) {
      console.error("Invite error", e);
    } finally {
      setIsSubmitInvite(false);
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editingUser.fullName,
          role_id: editingUser.role_id,
          department_id: editingUser.department_id,
          active: editingUser.active
        })
      });

      if (res.ok) {
        await fetchUsers();
        setEditingUser(null);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleToggleActiveState = async (u: UserProfile) => {
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: u.fullName,
          role: u.role,
          department: u.department,
          active: !u.active
        })
      });
        
      if (res.ok) {
        await fetchUsers();
      }
    } catch (e) {
      console.error("Toggle active state failed", e);
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (!confirm(`Tem a certeza que deseja eliminar permanentemente o utilizador ${u.fullName}?`)) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'DELETE'
      });
        
      if (res.ok) {
        await fetchUsers();
      } else {
        alert("Erro ao eliminar o utilizador.");
      }
    } catch (e) {
      console.error("Delete user failed", e);
      alert("Erro ao eliminar o utilizador.");
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 id="admin-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Administração RBAC</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gira permissões funcionais, departamentos e adicione novos membros.
          </p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {canManageUsers && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users className="h-4 w-4" />
              Membros
            </button>
          )}
          {canManageDepts && (
            <button
              onClick={() => setActiveTab('departments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'departments' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 className="h-4 w-4" />
              Departamentos
            </button>
          )}
          {canManageRoles && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'roles' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ShieldCheck className="h-4 w-4" />
              Cargos e Permissões
            </button>
          )}
        </div>
      </div>

      {activeTab === 'departments' && <DepartmentsPanel />}
      {activeTab === 'roles' && <RolesPanel />}

      {activeTab === 'users' && (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Equipa e Acessos</h2>
            <button
              id="btn-add-user"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs cursor-pointer transition-all mt-3 md:mt-0"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar Utilizador
            </button>
          </div>

          <div className="bg-white p-4 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 items-end shadow-3xs mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pesquisar Utilizador</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar Cargo (Role)</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50"
              >
                <option value="Todas">Todas as Roles</option>
                {availableRoles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar Departamento</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:outline-none bg-slate-50"
              >
                <option value="Todas">Todos os Departamentos</option>
                {availableDepts.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-3xs">
            <table className="w-full border-collapse text-left text-xs text-slate-600">
              <thead className="bg-[#f8fafc] text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-5 py-3">Identificação do Membro</th>
                  <th scope="col" className="px-5 py-3">Departamento Organizacional</th>
                  <th scope="col" className="px-5 py-3">Nível de Acesso (Role)</th>
                  <th scope="col" className="px-5 py-3">Situação Cadastral</th>
                  <th scope="col" className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr id={`user-row-${u.id}`} key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block">{u.fullName}</span>
                        <span className="text-[10px] text-slate-450 block font-mono mt-0.5">{u.email}</span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-700 font-semibold">
                        {u.department}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-block text-[9px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : u.role === 'manager'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          onClick={() => handleToggleActiveState(u)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide cursor-pointer select-none ${
                            u.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {u.active ? 'Ativo' : 'Desativado'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          id={`edit-user-btn-${u.id}`}
                          onClick={() => setEditingUser(u)}
                          className="text-slate-400 hover:text-[#1e293b] p-1.5 rounded transition-all cursor-pointer inline-block"
                          title="Editar regras e permissões"
                        >
                          <FileEdit className="h-4 w-4" />
                        </button>
                        <button
                          id={`del-user-btn-${u.id}`}
                          onClick={() => handleDeleteUser(u)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded transition-all cursor-pointer inline-block"
                          title="Eliminar utilizador"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-450 bg-slate-50/50 leading-relaxed font-sans">
                      Nenhum colaborador foi identificado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div id="add-user-modal" className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Adicionar Novo Membro</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Ex: Marco António Silva"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Corporativo *</label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="Ex: marco.silva@empresa.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Senha Provisória *</label>
                <input
                  type="text"
                  required
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Senha para o utilizador iniciar sessão"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Departamento Organizacional</label>
                <select
                  value={addDeptId}
                  onChange={(e) => setAddDeptId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-850"
                >
                  {availableDepts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Carga de Autorização (Role)</label>
                <select
                  value={addRoleId}
                  onChange={(e) => setAddRoleId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-850"
                >
                  {availableRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitInvite}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-3xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Criar Utilizador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div id="edit-user-modal" className="bg-white rounded-lg border border-slate-200 w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Regular Permissões</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Modificando Cadastro de:</span>
                <span className="text-sm font-bold block text-slate-800">{editingUser.fullName}</span>
                <span className="text-[10px] block font-mono text-slate-450">{editingUser.email}</span>
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">Nível de Role</label>
                  <select
                    value={editingUser.role_id || ''}
                    onChange={(e) => {
                      const name = availableRoles.find(r => r.id === e.target.value)?.name || '';
                      setEditingUser({ ...editingUser, role_id: e.target.value, role: name as 'admin' | 'manager' | 'user' });
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:outline-none bg-white text-slate-800"
                  >
                    {availableRoles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">Área de Atuação</label>
                  <select
                    value={editingUser.department_id || ''}
                    onChange={(e) => {
                      const name = availableDepts.find(d => d.id === e.target.value)?.name || '';
                      setEditingUser({ ...editingUser, department_id: e.target.value, department: name });
                    }}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:outline-none bg-white text-slate-850"
                  >
                    {availableDepts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-1 pt-2">
                <input
                  id="edit-user-active-checkbox"
                  type="checkbox"
                  checked={editingUser.active}
                  onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="edit-user-active-checkbox" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer">Definir como Utilizador Ativo</label>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Privilégios da Role Selecionada:</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Permissões atribuídas a este perfil na base de dados.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-3xs cursor-pointer"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
