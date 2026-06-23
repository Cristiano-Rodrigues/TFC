'use client';

import React, { useState } from 'react';
import { useAuth, UserProfile } from '@/lib/auth-context';
import { ShieldCheck, UserPlus, FileEdit, Trash2, CheckCircle2, X, ShieldAlert, KeyRound, Search, Filter } from 'lucide-react';

export const AdminView: React.FC = () => {
  const { profile, allProfiles, updateUserProfile, createUserProfile, dbSynced } = useAuth();
  
  // Modals status
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Filters state
  const [searchEmail, setSearchEmail] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todas');
  const [deptFilter, setDeptFilter] = useState('Todas');

  // Invitation fields
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'manager' | 'user'>('user');
  const [addDept, setAddDept] = useState('Recursos Humanos');
  const [isSubmitInvite, setIsSubmitInvite] = useState(false);

  // Checking Admin RBAC permission
  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="p-3 bg-red-50 border border-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Acesso Negado - Apenas Administradores</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          A sua credencial atual diz respeito a um perfil de <strong>{profile?.role || "standard"}</strong>. Esta secção administrativa permite o controlo sobre convites do Supabase e atribuição de permissões da equipa, estando restrita apenas à equipa de administração global de sistemas.
        </p>
      </div>
    );
  }

  // Apply listing filters
  const filteredUsers = allProfiles.filter(u => {
    const matchesEmail = u.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                         u.fullName.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesRole = roleFilter === 'Todas' || u.role === roleFilter;
    const matchesDept = deptFilter === 'Todas' || u.department === deptFilter;
    return matchesEmail && matchesRole && matchesDept;
  });

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim() || !addName.trim()) return;

    setIsSubmitInvite(true);
    
    // Simulate Supabase Invitation flow & register Profile metadata
    const success = await createUserProfile({
      id: `user-${Date.now()}`,
      email: addEmail,
      fullName: addName,
      role: addRole,
      department: addDept,
      active: true
    });

    if (success) {
      setShowAddModal(false);
      setAddEmail('');
      setAddName('');
      setAddRole('user');
    }
    setIsSubmitInvite(false);
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const success = await updateUserProfile(editingUser.id, {
      fullName: editingUser.fullName,
      role: editingUser.role,
      department: editingUser.department,
      active: editingUser.active
    });

    if (success) {
      setEditingUser(null);
    }
  };

  const handleToggleActiveState = async (u: UserProfile) => {
    await updateUserProfile(u.id, { active: !u.active });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 id="admin-title" className="text-2xl font-semibold text-slate-900 tracking-tight">Utilizadores & Permissões RBAC</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gira permissões funcionais, altere acessos e convide novos membros da organização integrados no Supabase Auth.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            id="btn-add-user"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md shadow-2xs cursor-pointer transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Convidar Utilizador
          </button>
        </div>
      </div>

      {/* Advanced Filter Pane */}
      <div className="bg-white p-4 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 items-end shadow-3xs">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pesquisar Utilizador</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Buscar por nome ou email corporativo..."
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
            <option value="admin">Administrador (admin)</option>
            <option value="manager">Gestor / Coordenador (manager)</option>
            <option value="user">Colaborador Geral (user)</option>
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
            <option value="Tecnologia e Segurança">TI & Segurança</option>
            <option value="Recursos Humanos">Recursos Humanos</option>
            <option value="Financeiro">Financeiro</option>
            <option value="Compliance">Compliance & Legal</option>
            <option value="Suporte e Operações">Suporte e Operações</option>
          </select>
        </div>
      </div>

      {/* Main Admin Data Table */}
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
                  {/* Name & Email */}
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 block">{u.fullName}</span>
                    <span className="text-[10px] text-slate-450 block font-mono mt-0.5">{u.email}</span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-3.5 text-slate-700 font-semibold">
                    {u.department}
                  </td>

                  {/* Access tag */}
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

                  {/* Active/Inactive slider */}
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

                  {/* Actions buttons */}
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      id={`edit-user-btn-${u.id}`}
                      onClick={() => setEditingUser(u)}
                      className="text-slate-400 hover:text-[#1e293b] p-1.5 rounded transition-all cursor-pointer inline-block"
                      title="Editar regras e permissões"
                    >
                      <FileEdit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-450 bg-slate-50/50 leading-relaxed font-sans">
                  Nenhum colaborador foi identificado correspondendo aos filtros de roles ou departamentos acionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* INVITATION NEW USER MODAL POPUP */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div id="add-user-modal" className="bg-white rounded-lg border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Registrar Novo Membro</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nome Completo</label>
                <input
                  id="add-user-name"
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Ex: Marco António Silva"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Corporativo</label>
                <input
                  id="add-user-email"
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="Ex: marco.silva@empresa.com"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-500 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Departamento Organizacional</label>
                <select
                  id="add-user-dept"
                  value={addDept}
                  onChange={(e) => setAddDept(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-850"
                >
                  <option value="Recursos Humanos">Recursos Humanos (RH)</option>
                  <option value="Tecnologia e Segurança">Tecnologia e Segurança (TI)</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Compliance">Compliance & Legal</option>
                  <option value="Suporte e Operações">Suporte e Operações</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Carga de Autorização (Role)</label>
                <select
                  id="add-user-role"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none bg-white text-slate-850"
                >
                  <option value="user">Colaborador Geral (user)</option>
                  <option value="manager">Coordenador / Gestor (manager)</option>
                  <option value="admin">Administrador global (admin)</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed leading-[14px]">
                O utilizador receberá um email do Supabase Auth para parametrizar a sua senha oficial (senha corporativa por padrão: <strong>senha123</strong> para simulações).
              </p>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="add-user-submit-btn"
                  type="submit"
                  disabled={isSubmitInvite}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-3xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Confirmar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER SPECIFIC ROLE/DEPT MODAL */}
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
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:outline-none bg-white text-slate-800"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">Área de Atuação</label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded focus:outline-none bg-white text-slate-850"
                  >
                    <option value="Recursos Humanos">Recursos Humanos (RH)</option>
                    <option value="Tecnologia e Segurança">TI & Segurança</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Compliance">Compliance & Legal</option>
                    <option value="Suporte e Operações">Suporte e Operações</option>
                  </select>
                </div>
              </div>

              {/* Status active/inactive checkbox */}
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

              {/* Display respective simulated privileges */}
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Privilégios da Role Selecionada:</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {editingUser.role === 'admin' 
                    ? 'Acesso irrestrito total para leitura, adição, deleção e painel de utilizadores.' 
                    : editingUser.role === 'manager' 
                      ? 'Capacidade total de leitura de arquivos RAG, uploads de novos manuais e alteração de canais integrados.' 
                      : 'Direito padrão de leitura e discussões no chat GPT Enterprise do Workspace RAG.'}
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
