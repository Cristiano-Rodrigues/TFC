'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Login } from '@/components/Login';
import { Loader2 } from 'lucide-react';
import { LoadingStage } from '@/components/ui/LoadingStage';

export default function RootPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      router.replace('/dashboard');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return <LoadingStage />;
  }

  if (!user || !profile) {
    return <Login />;
  }

  return null;
}
