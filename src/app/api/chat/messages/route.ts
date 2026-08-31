import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { status: 400 });
    }

    const { data: sessionData, error: sessionError } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', session.sub)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Sessão não encontrada ou não autorizada' }, { status: 404 });
    }

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_messages')
      .select('id, session_id, role, content, sources, is_error, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 });
    }

    return NextResponse.json({ messages: data });
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

    const { sessionId, role, content, sources, is_error } = await req.json();

    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 });
    }

    const { data: sessionData, error: sessionError } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', session.sub)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Sessão não encontrada ou não autorizada' }, { status: 404 });
    }

    const { data, error } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_messages')
      .insert({
        session_id: sessionId,
        role: role,
        content: content,
        sources: sources || null,
        is_error: is_error || false
      })
      .select('id, session_id, role, content, sources, is_error, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erro ao guardar mensagem' }, { status: 500 });
    }
    
    await getAuthenticatedSupabase(session.token).from('ai_chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);

    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
