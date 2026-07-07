import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { department_ids, role_ids, access_logic } = await req.json();

    if (!Array.isArray(department_ids) || !Array.isArray(role_ids) || !access_logic) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ metadata: { access_logic } })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabaseAdmin.from('document_departments').delete().eq('document_id', id);
    await supabaseAdmin.from('document_permissions').delete().eq('document_id', id);

    if (department_ids.length > 0) {
      const deptsToInsert = department_ids.map((dId: string) => ({
        document_id: id,
        department_id: dId
      }));
      await supabaseAdmin.from('document_departments').insert(deptsToInsert);
    }

    if (role_ids.length > 0) {
      const permsToInsert = role_ids.map((rId: string) => ({
        document_id: id,
        role_id: rId
      }));
      await supabaseAdmin.from('document_permissions').insert(permsToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
    }

    const { data: docData, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: dbError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    if (docData?.storage_path) {
      await supabaseAdmin.storage.from('rag_documents').remove([docData.storage_path]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
