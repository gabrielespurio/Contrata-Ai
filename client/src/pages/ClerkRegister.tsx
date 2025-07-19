import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SignUp, useUser } from '@clerk/clerk-react';
import { useClerkAuth } from '@/contexts/ClerkAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClerkRegister() {
  const [, setLocation] = useLocation();
  
  // Check if we're in Clerk mode based on environment
  const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  // Only use Clerk hooks if we have valid keys
  const { isSignedIn } = hasValidClerkKey ? useUser() : { isSignedIn: false };
  const clerkAuth = hasValidClerkKey ? useClerkAuth() : { user: null, setUserType: () => Promise.resolve() };
  const { user, setUserType } = clerkAuth;
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [isSettingType, setIsSettingType] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If we don't have valid Clerk keys, redirect to regular register
    if (!hasValidClerkKey) {
      setLocation('/register');
      return;
    }
    
    if (isSignedIn && !user) {
      // User is signed in with Clerk but not in our system
      setShowUserTypeSelection(true);
    } else if (user) {
      // User is fully set up
      setLocation('/dashboard');
    }
  }, [isSignedIn, user, hasValidClerkKey]);

  const handleUserTypeSelect = async (type: 'freelancer' | 'contratante') => {
    setIsSettingType(true);
    try {
      await setUserType(type);
      toast({
        title: "Cadastro concluído!",
        description: "Bem-vindo ao Contrata AI.",
      });
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Erro ao configurar tipo de usuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSettingType(false);
    }
  };

  // If we don't have valid Clerk keys, don't render anything (redirect happens in useEffect)
  if (!hasValidClerkKey) {
    return null;
  }

  if (showUserTypeSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Quase pronto!</CardTitle>
            <p className="text-center text-gray-600">
              Escolha como você quer usar o Contrata AI
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleUserTypeSelect('freelancer')}
                disabled={isSettingType}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group disabled:opacity-50"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                    <UserCheck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sou Freelancer
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quero encontrar trabalhos e oferecer meus serviços
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleUserTypeSelect('contratante')}
                disabled={isSettingType}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group disabled:opacity-50"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sou Contratante
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quero contratar freelancers para projetos
                    </p>
                  </div>
                </div>
              </button>
            </div>
            
            {isSettingType && (
              <div className="text-center text-sm text-gray-600">
                Configurando sua conta...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Criar conta no Contrata AI</h2>
          <p className="mt-2 text-gray-600">
            Junte-se à nossa comunidade de freelancers e contratantes
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-sm normal-case',
              card: 'shadow-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            }
          }}
          redirectUrl="/register"
          signInUrl="/login"
        />
      </div>
    </div>
  );
}