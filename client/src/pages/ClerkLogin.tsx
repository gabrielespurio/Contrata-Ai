import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { SignIn, useUser } from '@clerk/clerk-react';

export default function ClerkLogin() {
  const [, setLocation] = useLocation();
  const hasRedirectedRef = useRef(false);
  
  // Check if we're in Clerk mode based on environment
  const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  // Only use Clerk hooks if we have valid keys
  const { isSignedIn } = hasValidClerkKey ? useUser() : { isSignedIn: false };

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    
    // If we don't have valid Clerk keys, redirect to regular login
    if (!hasValidClerkKey) {
      hasRedirectedRef.current = true;
      setLocation('/login');
      return;
    }
    
    if (isSignedIn) {
      hasRedirectedRef.current = true;
      setLocation('/dashboard');
    }
  }, [isSignedIn, hasValidClerkKey, setLocation]);

  // If we don't have valid Clerk keys, don't render anything (redirect happens in useEffect)
  if (!hasValidClerkKey) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Entrar no Contrata AI</h2>
          <p className="mt-2 text-gray-600">
            Acesse sua conta para encontrar oportunidades de trabalho
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-sm normal-case',
              card: 'shadow-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            }
          }}
          redirectUrl="/dashboard"
          signUpUrl="/clerk-register"
        />
      </div>
    </div>
  );
}