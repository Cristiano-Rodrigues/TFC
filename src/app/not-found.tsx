import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-slate-800 p-6">
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md text-center shadow-2xs space-y-4">
        <h2 className="text-xl font-bold text-slate-900">404 - Página Não Encontrada</h2>
        <p className="text-xs text-slate-500">A página solicitada não existe ou foi movida.</p>
        <Link href="/" className="inline-block bg-[#030213] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#030213]/90 transition-colors">
          Voltar ao Portal
        </Link>
      </div>
    </div>
  );
}
