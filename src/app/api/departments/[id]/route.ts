import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission, unauthenticatedResponse, unauthorizedResponse } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'departments:manage');
    if (!hasPermission) return unauthorizedResponse();

    const body = await req.json();
    const { name, description } = body;

    const { error: deptError } = await getAuthenticatedSupabase(session.token)
      .from('departments')
      .update({ name, description })
      .eq('id', id)
      .eq('company_id', session.company_id);

    if (deptError) {
      console.error("Erro actualizar dept:", deptError);
      return NextResponse.json({ error: 'Erro ao actualizar departamento' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const session = await requireAuth();
    if (!session) return unauthenticatedResponse();

    const hasPermission = await requirePermission(session, 'departments:manage');
    if (!hasPermission) return unauthorizedResponse();

    const { error } = await getAuthenticatedSupabase(session.token)
      .from('departments')
      .delete()
      .eq('id', id)
      .eq('company_id', session.company_id);

    if (error) {
      console.error("Erro eliminar dept:", error);
      return NextResponse.json({ error: 'Erro ao eliminar departamento' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
