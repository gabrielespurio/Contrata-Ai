import React from 'react';
import { useSimpleClerkAuth } from '@/contexts/SimpleClerkAuthContext';
import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

export function ClerkDemo() {
  const { user, isLoading } = useSimpleClerkAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Demonstração do Clerk</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Status de Autenticação</h2>
          <SignedIn>
            <div className="text-green-600 mb-4">
              ✅ Usuário autenticado!
            </div>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Nome:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Tipo:</strong> {user?.type}</p>
              <p><strong>Cidade:</strong> {user?.city}</p>
            </div>
            <div className="mt-4">
              <UserButton />
            </div>
          </SignedIn>
          
          <SignedOut>
            <div className="text-orange-600 mb-4">
              ⚠️ Usuário não autenticado
            </div>
            <p className="text-gray-600 mb-4">
              Use os componentes abaixo para fazer login ou se cadastrar.
            </p>
          </SignedOut>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <SignedOut>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Login</h2>
              <SignIn 
                routing="virtual" 
                signUpUrl="/clerk-register"
                appearance={{
                  variables: {
                    colorPrimary: "#ea580c"
                  }
                }}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Cadastro</h2>
              <SignUp 
                routing="virtual" 
                signInUrl="/clerk-login"
                appearance={{
                  variables: {
                    colorPrimary: "#ea580c"
                  }
                }}
              />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Ações Disponíveis</h2>
              <div className="space-y-3">
                <a href="/" className="block bg-orange-600 text-white px-4 py-2 rounded text-center hover:bg-orange-700 transition-colors">
                  Ir para Home
                </a>
                <a href="/dashboard" className="block bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors">
                  Dashboard
                </a>
                <a href="/jobs" className="block bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition-colors">
                  Ver Vagas
                </a>
              </div>
            </div>
          </SignedIn>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Informações Técnicas</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Sistema usando Clerk para autenticação</p>
            <p>• Chaves configuradas via variáveis de ambiente</p>
            <p>• Integração com banco de dados PostgreSQL</p>
            <p>• Interface responsiva e acessível</p>
          </div>
        </div>
      </div>
    </div>
  );
}