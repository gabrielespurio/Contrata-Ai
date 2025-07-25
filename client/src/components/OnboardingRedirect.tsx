import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useSimpleClerkAuth } from '@/contexts/SimpleClerkAuthContext';

export function OnboardingRedirect({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, isLoaded, needsOnboarding } = useSimpleClerkAuth();

  useEffect(() => {
    // Check if user is logged in but hasn't completed onboarding
    if (isLoaded && user && needsOnboarding) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/onboarding' && currentPath !== '/profile-setup') {
        setLocation('/profile-setup');
      }
    }
  }, [user, isLoaded, needsOnboarding, setLocation]);

  return <>{children}</>;
}