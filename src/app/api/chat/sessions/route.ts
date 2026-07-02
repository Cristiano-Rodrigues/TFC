import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export async function GET() {
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

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', payload.sub)
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
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { title } = await req.json();

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        user_id: payload.sub,
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
