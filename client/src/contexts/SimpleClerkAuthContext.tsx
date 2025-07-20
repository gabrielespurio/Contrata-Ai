import { createContext, useContext, ReactNode } from 'react';
import { useUser, useClerk, ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'freelancer' | 'contratante';
  city: string;
  premium: boolean;
  destaque: boolean;
}

export interface SimpleClerkAuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  signIn: () => void;
  signUp: () => void;
  signOut: () => Promise<void>;
  syncUserWithDatabase: (userData: any) => Promise<any>;
  needsOnboarding: boolean;
}

export const SimpleClerkAuthContext = createContext<SimpleClerkAuthContextType | undefined>(undefined);

function InnerSimpleClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'Usuário',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    type: (clerkUser.publicMetadata?.userType as 'freelancer' | 'contratante') || 'freelancer',
    city: (clerkUser.publicMetadata?.city as string) || 'São Paulo',
    premium: (clerkUser.publicMetadata?.premium as boolean) || false,
    destaque: false
  } : null;

  // Check if user needs onboarding
  const needsOnboarding = user && (!user.city || (user.city === 'São Paulo' && !clerkUser?.publicMetadata?.databaseSynced));

  const syncUserWithDatabase = async (userData: any) => {
    if (!user || !isSignedIn) {
      throw new Error("User not authenticated");
    }

    try {
      const response = await fetch('/api/auth/sync-clerk-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userType: userData.userType,
          userData: userData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync user data');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  };

  return (
    <SimpleClerkAuthContext.Provider value={{ 
      user, 
      isLoaded,
      isSignedIn,
      signIn: () => clerk.openSignIn(),
      signUp: () => clerk.openSignUp(),
      signOut: () => clerk.signOut(),
      syncUserWithDatabase,
      needsOnboarding: needsOnboarding || false
    }}>
      {children}
    </SimpleClerkAuthContext.Provider>
  );
}

export function SimpleClerkAuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Debug the key being used
  console.log('Clerk Key Debug:', {
    key: publishableKey?.substring(0, 10) + '...',
    keyType: publishableKey?.startsWith('pk_') ? 'publishable' : publishableKey?.startsWith('sk_') ? 'secret' : 'unknown'
  });
  
  if (!publishableKey) {
    console.error('Missing Clerk Publishable Key');
    return <div>Erro: Chaves do Clerk não configuradas</div>;
  }
  
  // Check if key is actually a secret key
  if (publishableKey.startsWith('sk_')) {
    console.error('Secret key being used as publishable key!');
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg max-w-2xl mx-auto mt-8">
        <h2 className="font-bold text-lg mb-2">🔑 Erro de Configuração do Clerk</h2>
        <p className="mb-2">As chaves do Clerk estão trocadas!</p>
        <div className="bg-white p-3 rounded text-sm mb-3">
          <p><strong>Problema:</strong> VITE_CLERK_PUBLISHABLE_KEY tem valor de chave secreta (sk_test_...)</p>
          <p><strong>Solução:</strong> Trocar os valores das chaves no Replit Secrets:</p>
          <ul className="list-disc ml-4 mt-2">
            <li>VITE_CLERK_PUBLISHABLE_KEY deve ter valor pk_test_...</li>
            <li>CLERK_SECRET_KEY deve ter valor sk_test_...</li>
          </ul>
        </div>
        <p className="text-sm">Após corrigir, o sistema funcionará normalmente.</p>
      </div>
    );
  }

  // Add error boundary for Clerk initialization errors
  try {
    return (
      <ClerkProvider 
        publishableKey={publishableKey}
        localization={{
          locale: 'pt-BR'
        }}
      >
        <InnerSimpleClerkAuthProvider>
          {children}
        </InnerSimpleClerkAuthProvider>
      </ClerkProvider>
    );
  } catch (error) {
    console.error('Error initializing Clerk:', error);
    return <div>Erro na inicialização do Clerk. Verifique as configurações.</div>;
  }
}

export function useSimpleClerkAuth() {
  const context = useContext(SimpleClerkAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleClerkAuth must be used within a SimpleClerkAuthProvider');
  }
  return context;
}