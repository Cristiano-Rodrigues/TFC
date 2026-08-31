import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', session.sub)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar histórico de conversas' }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const { title } = await req.json();

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_sessions')
      .insert({
        user_id: session.sub,
        title: title || 'Nova Conversa',
      })
      .select('id, title, created_at, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erro ao criar sessão de conversa' }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
