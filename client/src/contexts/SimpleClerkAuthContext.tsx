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

interface SimpleClerkAuthContextType {
  user: User | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  logout: () => void;
}

export const SimpleClerkAuthContext = createContext<SimpleClerkAuthContextType | undefined>(undefined);

function InnerSimpleClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const clerk = useClerk();

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'Usuário',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    type: 'freelancer', // Default, will be updated during onboarding
    city: 'São Paulo', // Default, will be updated during onboarding
    premium: false,
    destaque: false
  } : null;

  // Check if user needs onboarding
  const needsOnboarding = user && (
    user.city === 'São Paulo' && 
    user.type === 'freelancer' &&
    user.name === 'Usuário'
  ) || false;

  const logout = () => {
    clerk.signOut();
  };

  return (
    <SimpleClerkAuthContext.Provider value={{ 
      user, 
      isLoading: !isLoaded,
      needsOnboarding,
      logout 
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