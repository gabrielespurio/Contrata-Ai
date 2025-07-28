import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useAuth';

export function OnboardingRedirectSimple({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, isLoaded, needsOnboarding } = useUnifiedAuth();

  useEffect(() => {
    // Check if user is logged in but hasn't completed onboarding
    if (isLoaded && user && needsOnboarding) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on profile setup page
      if (currentPath !== '/profile-setup') {
        setLocation('/profile-setup');
      }
    }
  }, [user, isLoaded, needsOnboarding, setLocation]);

  return <>{children}</>;
}