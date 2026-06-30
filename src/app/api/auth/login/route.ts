import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/hash';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Credenciais incompletas' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, roles(name)')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Conta desativada' }, { status: 403 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ error: 'Conta não possui credenciais válidas' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.roles?.name || 'user',
      company_id: user.company_id
    };

    const token = signToken(tokenPayload);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return NextResponse.json({ success: true, user: tokenPayload });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
