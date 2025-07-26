import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'freelancer' | 'contratante';
  city: string;
  premium: boolean;
  destaque: boolean;
  needsOnboarding: boolean;
}

export interface SimpleAuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  needsOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (profileData: any) => Promise<void>;
}

export const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  const signIn = async (email: string, password: string) => {
    // For now, create a mock user that needs onboarding
    const mockUser: User = {
      id: '1',
      name: 'Usuário Teste',
      email: email,
      type: 'freelancer',
      city: 'São Paulo',
      premium: false,
      destaque: false,
      needsOnboarding: true
    };
    setUser(mockUser);
  };

  const signUp = async (userData: any) => {
    // For now, create a mock user that needs onboarding
    const mockUser: User = {
      id: '1',
      name: userData.name || 'Usuário Teste',
      email: userData.email,
      type: userData.type || 'freelancer',
      city: userData.city || 'São Paulo',
      premium: false,
      destaque: false,
      needsOnboarding: true
    };
    setUser(mockUser);
  };

  const completeOnboarding = async (profileData: any) => {
    if (user) {
      setUser({
        ...user,
        name: profileData.name || user.name,
        type: profileData.userType || user.type,
        city: profileData.address?.city || profileData.city || user.city,
        needsOnboarding: false
      });
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <SimpleAuthContext.Provider value={{ 
      user, 
      isLoaded,
      isSignedIn: !!user,
      needsOnboarding: user?.needsOnboarding || false,
      signIn,
      signUp,
      signOut,
      completeOnboarding
    }}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}