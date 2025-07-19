import { Link, useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  // Check if we're in Clerk mode based on environment
  const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  // Use unified auth hook
  const { user, logout } = useUnifiedAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">Contrata AI</h1>
              </Link>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <nav className="hidden md:flex space-x-8">
                  <Link href="/dashboard" className={`font-medium ${location === '/dashboard' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Dashboard
                  </Link>
                  <Link href="/jobs" className={`font-medium ${location === '/jobs' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                    {user.type === 'contratante' ? 'Minhas Vagas' : 'Explorar Vagas'}
                  </Link>
                  {user.type === 'freelancer' && (
                    <Link href="/applications" className={`font-medium ${location === '/applications' ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}>
                      Candidaturas
                    </Link>
                  )}
                </nav>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user.name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <nav className="hidden md:flex space-x-8">
                  <a href="#" className="text-gray-700 hover:text-primary font-medium">Como funciona</a>
                  <a href="#" className="text-gray-700 hover:text-primary font-medium">Categorias</a>
                  <Link href="/clerk-demo" className="text-gray-700 hover:text-primary font-medium">
                    Clerk Demo
                  </Link>
                  <a href="#" className="text-gray-700 hover:text-primary font-medium">Suporte</a>
                </nav>
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button>Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main>{children}</main>
    </div>
  );
}