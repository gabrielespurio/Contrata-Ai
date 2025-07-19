import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, KeyIcon } from 'lucide-react';

export function ClerkDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <KeyIcon className="w-6 h-6 text-orange-600" />
            Configuração do Clerk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Para usar a autenticação do Clerk, você precisa:
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">1. Criar conta no Clerk</h3>
              <p className="text-sm text-gray-600">
                Vá para <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">clerk.com</a> e crie uma conta gratuita
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">2. Criar um projeto</h3>
              <p className="text-sm text-gray-600">
                No dashboard do Clerk, crie um novo projeto para sua aplicação
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">3. Obter as chaves da API</h3>
              <p className="text-sm text-gray-600">
                Vá em "API Keys" no dashboard e copie:
              </p>
              <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
                <li>Publishable Key</li>
                <li>Secret Key</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">4. Configurar no projeto</h3>
              <p className="text-sm text-gray-600">
                Atualize o arquivo <code className="bg-gray-200 px-1 rounded">.env</code> com suas chaves reais
              </p>
            </div>
          </div>
          
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Enquanto isso, você pode continuar usando o sistema de autenticação atual ou testar com as páginas de demonstração.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}