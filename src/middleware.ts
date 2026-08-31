import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register-company',
];

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Não autenticado (token ausente)' }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload || !payload.sub || !payload.company_id) {
    return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-sub', payload.sub);
  requestHeaders.set('x-company-id', payload.company_id);
  requestHeaders.set('x-user-role', payload.user_role || payload.role || '');
  requestHeaders.set('x-user-email', payload.email || '');
  requestHeaders.set('x-auth-token', token);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: ['/api/:path*'],
};
