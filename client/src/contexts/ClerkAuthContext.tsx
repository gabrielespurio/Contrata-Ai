import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useUser, useClerk, ClerkProvider } from '@clerk/clerk-react';
import { apiRequest } from '@/lib/queryClient';

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
    const syncUserData = async () => {
      if (isLoaded) {
        if (isSignedIn && clerkUser) {
          try {
            // Try to get user data from our backend using Clerk token
            const token = await clerkUser.getToken();
            const response = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
            } else {
              // User not found in our system, will need onboarding
              console.log('User not found in our system, might need onboarding');
            }
          } catch (error) {
            console.log('Error syncing user data:', error);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    syncUserData();
  }, [isLoaded, isSignedIn, clerkUser]);

  const setUserType = async (type: 'freelancer' | 'contratante') => {
    if (!clerkUser) return;

    try {
      const userData = {
        name: clerkUser.fullName || clerkUser.firstName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        type,
        city: 'São Paulo', // Default city, can be updated later
        clerkId: clerkUser.id,
      };

      const response = await fetch('/api/auth/sync-clerk-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Failed to sync user');
      }

      const data = await response.json();
      // Store the token for our backend
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Failed to set user type:', error);
      throw error;
    }
  };

  const logout = async () => {
    await clerk.signOut();
    setUser(null);
  };

  return (
    <ClerkAuthContext.Provider value={{ 
      user, 
      clerkUser, 
      isLoading: isLoading || !isLoaded, 
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
    throw new Error('Missing Clerk Publishable Key');
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

