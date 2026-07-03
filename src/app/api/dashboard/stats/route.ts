import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';

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

    const { count: totalDocs } = await supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
      
    const { count: totalSearches } = await supabaseAdmin
      .from('ai_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    return NextResponse.json({
      stats: {
        documents: totalDocs || 0,
        activeUsers: activeUsers || 0,
        searches: totalSearches || 0
      }
    });
  } catch (error) {
    console.error("Erro ao carregar estatísticas do dashboard", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
