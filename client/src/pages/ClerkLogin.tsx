import { SignIn } from '@clerk/clerk-react';

export default function ClerkLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Entrar no Contrata AI</h2>
          <p className="mt-2 text-gray-600">
            Acesse sua conta para encontrar oportunidades de trabalho
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-sm normal-case',
              card: 'shadow-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            }
          }}
          afterSignInUrl="/"
          signUpUrl="/clerk-register"
        />
      </div>
    </div>
  );
}