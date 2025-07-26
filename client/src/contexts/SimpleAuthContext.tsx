import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'freelancer' | 'contratante';
  city: string;
  premium: boolean;
  destaque: boolean;
}

export interface SimpleAuthContextType {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

export const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(true);

  const signIn = async (email: string, password: string) => {
    // For now, create a mock user
    const mockUser: User = {
      id: '1',
      name: 'Usuário Teste',
      email: email,
      type: 'freelancer',
      city: 'São Paulo',
      premium: false,
      destaque: false
    };
    setUser(mockUser);
  };

  const signUp = async (userData: any) => {
    // For now, create a mock user
    const mockUser: User = {
      id: '1',
      name: userData.name || 'Usuário Teste',
      email: userData.email,
      type: userData.type || 'freelancer',
      city: userData.city || 'São Paulo',
      premium: false,
      destaque: false
    };
    setUser(mockUser);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <SimpleAuthContext.Provider value={{ 
      user, 
      isLoaded,
      isSignedIn: !!user,
      signIn,
      signUp,
      signOut
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