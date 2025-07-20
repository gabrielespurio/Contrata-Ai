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
  
  if (!publishableKey) {
    console.error('Missing Clerk Publishable Key');
    return <div>Erro: Chaves do Clerk não configuradas</div>;
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