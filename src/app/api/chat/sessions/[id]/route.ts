import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const { title } = await req.json();

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_sessions')
      .update({ title })
      .eq('id', params.id)
      .eq('user_id', session.sub)
      .select('id, title, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erro ao renomear sessão de conversa' }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const { error } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_sessions')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.sub);

    if (error) {
      return NextResponse.json({ error: 'Erro ao remover sessão de conversa' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
