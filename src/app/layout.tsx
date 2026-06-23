import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Enterprise Knowledge Base & RAG',
  description: 'Sistema corporativo de gestão, pesquisa inteligente (RAG) e Wiki automatizada por IA.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt" className="h-full">
      <body suppressHydrationWarning className="h-full bg-[#f8fafc] text-slate-900 antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

