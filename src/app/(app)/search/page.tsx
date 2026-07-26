'use client';
import { IntelligentSearchView } from '@/components/views/IntelligentSearchView';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  return (
    <IntelligentSearchView 
      sessionId={sessionId} 
      onSessionChange={(id) => {
        if (id) {
          router.push(`/search?sessionId=${id}`);
        } else {
          router.push(`/search`);
        }
      }} 
      onSessionCreated={() => {
        router.refresh();
        window.dispatchEvent(new Event('chatSessionCreated'));
      }} 
    />
  );
}
