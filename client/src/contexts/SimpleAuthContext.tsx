import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoaded(true);
    };
    
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro no login');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const signUp = async (userData: any) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro no cadastro');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const completeOnboarding = async (profileData: any) => {
    if (user) {
      // Chama a API para salvar os dados no banco
      const response = await fetch('/api/auth/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userType: profileData.userType,
          name: profileData.name,
          city: profileData.address?.city || profileData.city
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao completar onboarding');
      }

      const data = await response.json();
      
      console.log('Onboarding completed successfully:', {
        originalType: user.type,
        newType: profileData.userType,
        savedType: data.user.type
      });
      
      // IMPORTANTE: Atualiza o estado IMEDIATAMENTE para prevenir redirecionamento de volta
      // Isso evita race condition entre o redirect e a atualização do estado
      setUser(prev => prev ? {
        ...prev,
        type: profileData.userType,
        city: profileData.address?.city || profileData.city || prev.city,
        needsOnboarding: false
      } : null);
      
      // Depois, recarrega o perfil completo em background (opcional, para garantir sincronia)
      try {
        const profileResponse = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (profileResponse.ok) {
          const updatedUserData = await profileResponse.json();
          // Só atualiza se ainda tiver perfil (usuário não fez logout)
          setUser(updatedUserData);
        }
      } catch (error) {
        console.log('Background profile refresh failed, but onboarding is complete:', error);
      }
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
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