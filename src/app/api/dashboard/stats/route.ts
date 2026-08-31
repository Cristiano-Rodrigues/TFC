import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getAuthenticatedSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await requireAuth();

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado ou sessão inválida' }, { status: 401 });
    }

    const { count: totalDocs } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', session.company_id);

    const { count: activeUsers } = await getAuthenticatedSupabase(session.token)
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .eq('company_id', session.company_id);
      
    const { count: totalSearches } = await getAuthenticatedSupabase(session.token)
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
