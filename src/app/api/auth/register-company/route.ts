import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/hash';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { companyName, contactEmail, phone, address, adminName, adminEmail, adminPassword } = await req.json();

    if (!companyName || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existingCompany } = await supabaseAdmin
      .from('companies')
      .select('id')
      .ilike('name', companyName)
      .single();

    if (existingCompany) {
      return NextResponse.json({ error: 'Já existe uma empresa registada com este nome' }, { status: 400 });
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        contact_email: contactEmail || null,
        phone: phone || null,
        address: address || null
      })
      .select()
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }

    const { data: depts, error: deptsError } = await supabaseAdmin
      .from('departments')
      .insert([
        { id: crypto.randomUUID(), name: 'Administração', company_id: company.id },
        { id: crypto.randomUUID(), name: 'Geral', company_id: company.id }
      ])
      .select();

    if (deptsError || !depts) {
      console.error('Failed to seed departments:', deptsError);
      return NextResponse.json({ error: 'Failed to initialize company departments' }, { status: 500 });
    }
    const adminDept = depts.find(d => d.name === 'Administração');

    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .insert([
        { id: crypto.randomUUID(), name: 'admin', description: 'Administrador do Sistema', company_id: company.id },
        { id: crypto.randomUUID(), name: 'manager', description: 'Gestor', company_id: company.id },
        { id: crypto.randomUUID(), name: 'user', description: 'Utilizador Regular', company_id: company.id }
      ])
      .select();

    if (rolesError || !roles) {
      console.error('Failed to seed roles:', rolesError);
      return NextResponse.json({ error: 'Failed to initialize company roles' }, { status: 500 });
    }
    
    const adminRole = roles.find(r => r.name === 'admin');
    const managerRole = roles.find(r => r.name === 'manager');
    const userRole = roles.find(r => r.name === 'user');

    const { data: permissions } = await supabaseAdmin.from('permissions').select('id, code');
    
    if (permissions && permissions.length > 0) {
      const rolePermissionsToInsert: { role_id: string, permission_id: string }[] = [];
      
      const adminPerms = ["documents:view", "documents:create", "documents:delete", "documents:manage_permissions", "documents:view_all", "wiki:view", "wiki:view_all", "wiki:create", "wiki:edit", "wiki:delete", "integrations:manage", "users:manage", "departments:manage", "roles:manage"];
      const managerPerms = ["documents:view", "documents:create", "wiki:view", "wiki:create", "wiki:edit", "integrations:manage"];
      const userPerms = ["documents:view", "wiki:view"];

      for (const p of permissions) {
        if (adminRole && adminPerms.includes(p.code)) rolePermissionsToInsert.push({ role_id: adminRole.id, permission_id: p.id });
        if (managerRole && managerPerms.includes(p.code)) rolePermissionsToInsert.push({ role_id: managerRole.id, permission_id: p.id });
        if (userRole && userPerms.includes(p.code)) rolePermissionsToInsert.push({ role_id: userRole.id, permission_id: p.id });
      }

      if (rolePermissionsToInsert.length > 0) {
        await supabaseAdmin.from('role_permissions').insert(rolePermissionsToInsert);
      }
    }

    const passwordHash = hashPassword(adminPassword);

    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email: adminEmail,
        full_name: adminName,
        password_hash: passwordHash,
        company_id: company.id,
        role_id: adminRole?.id,
        role: 'admin',
        department_id: adminDept?.id,
        active: true
      });

    if (userError) {
      return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Empresa registada com sucesso!' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
