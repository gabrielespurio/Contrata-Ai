import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSimpleClerkAuth } from '@/contexts/SimpleClerkAuthContext';

export function OnboardingRedirect({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useSimpleClerkAuth();

  useEffect(() => {
    // Check if user is logged in but hasn't completed onboarding
    if (!isLoading && user) {
      // Check if user needs onboarding (you can add more sophisticated logic here)
      // For now, we'll check if user has basic info like city set to default
      const needsOnboarding = user.city === 'São Paulo' && user.type === 'freelancer';
      
      if (needsOnboarding && window.location.pathname !== '/onboarding') {
        setLocation('/onboarding');
      }
    }
  }, [user, isLoading, setLocation]);

  return <>{children}</>;
}