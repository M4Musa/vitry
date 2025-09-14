import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// DEPLOYMENT SPECIALIST FIX: Fallback authentication guard for Vercel
const AuthGuard = ({ children, fallback = null, requireAuth = true }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only check authentication if required
    if (!requireAuth) {
      setIsLoading(false);
      return;
    }

    if (status === 'loading') {
      console.log('[AuthGuard] Session loading...');
      return; // Still loading
    }

    if (status === 'unauthenticated') {
      console.log('[AuthGuard] User not authenticated, redirecting to login');
      
      // Store the intended destination
      const callbackUrl = encodeURIComponent(router.asPath);
      router.replace(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    if (status === 'authenticated' && session) {
      console.log('[AuthGuard] User authenticated:', {
        hasId: !!session.user?.id,
        hasEmail: !!session.user?.email,
        hasName: !!session.user?.name
      });
      setIsLoading(false);
    }
  }, [session, status, router, requireAuth]);

  // Show loading state while checking authentication
  if (requireAuth && (status === 'loading' || isLoading)) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If authentication is not required or user is authenticated, render children
  if (!requireAuth || (status === 'authenticated' && session)) {
    return children;
  }

  // Fallback for any edge cases
  return fallback || (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default AuthGuard;