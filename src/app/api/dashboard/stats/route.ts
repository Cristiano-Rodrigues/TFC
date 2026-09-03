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

    const { data: recentDocsData } = await getAuthenticatedSupabase(session.token)
      .from('documents')
      .select('id, filename, created_at')
      .eq('company_id', session.company_id)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentQueriesData } = await getAuthenticatedSupabase(session.token)
      .from('ai_chat_messages')
      .select('id, content, created_at, is_error')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(5);
      
    // Fetch departments and their document relationships to build the distribution
    const { data: docDepts } = await getAuthenticatedSupabase(session.token)
      .from('document_departments')
      .select('departments(name)');
      
    const deptCountMap: Record<string, number> = {};
    if (docDepts) {
      docDepts.forEach((item: any) => {
        if (item.departments && item.departments.name) {
          const name = item.departments.name;
          deptCountMap[name] = (deptCountMap[name] || 0) + 1;
        }
      });
    }
    
    const departmentDistribution = Object.keys(deptCountMap)
      .map(name => ({ name, count: deptCountMap[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5

    return NextResponse.json({
      stats: {
        documents: totalDocs || 0,
        activeUsers: activeUsers || 0,
        searches: totalSearches || 0
      },
      recentDocs: recentDocsData || [],
      recentQueries: recentQueriesData || [],
      departmentDistribution
    });
  } catch (error) {
    console.error("Erro ao carregar estatísticas do dashboard", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
