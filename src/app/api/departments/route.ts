import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const { data: departments, error } = await getAuthenticatedSupabase(session.token)
      .from('departments')
      .select('id, name, description, created_at')
      .eq('company_id', session.company_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Depts fetch error:", error);
      return NextResponse.json({ error: 'Erro ao carregar departamentos' }, { status: 500 });
    }

    return NextResponse.json({ departments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'departments:manage');
    if (!hasPermission) return unauthorizedResponse();

    const body = await req.json();
    const { name, description } = body;

    if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const { data: newDept, error: deptError } = await getAuthenticatedSupabase(session.token)
      .from('departments')
      .insert({
        name,
        description,
        company_id: session.company_id
      })
      .select('id')
      .single();

    if (deptError || !newDept) {
      console.error("Erro criar dept:", deptError);
      return NextResponse.json({ error: 'Erro ao criar departamento' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: newDept.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
