import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

    const { id } = await params;
    const body = await req.json();

    const { data: userToUpdate, error: fetchError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', id)
      .single();

    if (fetchError || !userToUpdate || userToUpdate.company_id !== payload.company_id) {
      return NextResponse.json({ error: 'Utilizador não encontrado ou sem permissão' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: body.fullName,
        role_id: body.role_id,
        department_id: body.department_id,
        active: body.active
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar utilizador' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
