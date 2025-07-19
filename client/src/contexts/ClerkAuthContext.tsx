import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useUser, useClerk, ClerkProvider } from '@clerk/clerk-react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'freelancer' | 'contratante';
  city: string;
  premium: boolean;
  destaque: boolean;
}

interface ClerkAuthContextType {
  user: User | null;
  clerkUser: any;
  isLoading: boolean;
  setUserType: (type: 'freelancer' | 'contratante') => Promise<void>;
  logout: () => void;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

function InnerClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (isSignedIn && clerkUser && !user) {
      // Create a simple user object from Clerk data
      const simpleUser: User = {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || 'Usuário',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        type: 'freelancer', // Default type, can be changed later
        city: 'São Paulo',
        premium: false,
        destaque: false
      };
      setUser(simpleUser);
    }

    setIsLoading(false);
  }, [isLoaded, isSignedIn, clerkUser, user]);

  const setUserType = async (type: 'freelancer' | 'contratante') => {
    if (!user) return;
    
    // Update user type locally for now
    setUser({
      ...user,
      type
    });
  };

  const logout = async () => {
    try {
      setUser(null);
      await clerk.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
    }
  };

  return (
    <ClerkAuthContext.Provider value={{ 
      user, 
      clerkUser, 
      isLoading, 
      setUserType, 
      logout 
    }}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('Missing Clerk Publishable Key');
    return <div>Erro: Chaves do Clerk não configuradas</div>;
  }
  
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <InnerClerkAuthProvider>
        {children}
      </InnerClerkAuthProvider>
    </ClerkProvider>
  );
}

export function useClerkAuth() {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuth must be used within a ClerkAuthProvider');
  }
  return context;
}

