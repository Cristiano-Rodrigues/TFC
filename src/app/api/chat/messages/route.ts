import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { status: 400 });
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', payload.sub)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Sessão não encontrada ou não autorizada' }, { status: 404 });
    }

    const { data, error } = await supabase
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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { sessionId, role, content, sources, is_error } = await req.json();

    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: 'Parâmetros em falta' }, { status: 400 });
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('ai_chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', payload.sub)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Sessão não encontrada ou não autorizada' }, { status: 404 });
    }

    const { data, error } = await supabase
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
    
    await supabase.from('ai_chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);

    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
