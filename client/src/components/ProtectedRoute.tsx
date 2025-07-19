import { useUnifiedAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'freelancer' | 'contratante';
}

export function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const { user, isLoading } = useUnifiedAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
      !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');
    
    const loginPath = hasValidClerkKey ? '/clerk-login' : '/login';
    return <Redirect to={loginPath} />;
  }

  // Redirect if user type doesn't match required type
  if (requiredUserType && user.type !== requiredUserType) {
    return <Redirect to="/dashboard" />;
  }

  // User is authenticated and has correct permissions
  return <>{children}</>;
}
