import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  Users, 
  Briefcase, 
  Star, 
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Award,
  Phone,
  Mail,
  Heart,
  Coffee,
  Camera,
  Wrench,
  Laptop,
  Palette,
  Music,
  Book,
  Car,
  Home as HomeIcon,
  ChevronRight,
  Play,
  Quote,
  Building2,
  Utensils,
  Hammer,
  Paintbrush,
  Monitor,
  Headphones,
  GraduationCap,
  CarIcon,
  Smartphone
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    enabled: !user
  });

  // Fetch recent jobs count for statistics
  const { data: jobsData = [] } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: !user
  });

  if (user) {
    return <Link href="/dashboard" />;
  }

  const categoryIcons = {
    'Eventos & Gastronomia': Coffee,
    'Fotografia & Vídeo': Camera,
    'Reformas & Reparos': Wrench,
    'Tecnologia & Design': Laptop,
    'Música & Entretenimento': Music,
    'Educação & Idiomas': Book,
    'Serviços Domésticos': HomeIcon,
    'Automotivo & Transporte': Car,
    'Assistência Técnica': Smartphone,
    'Consultoria': Building2,
    'Eventos': Utensils,
    'Saúde': Heart,
    'Moda e Beleza': Palette,
    'Aulas': GraduationCap,
    'Design e Tecnologia': Monitor,
    'Reformas e Reparos': Hammer
  };

  const popularServices = [
    'Garçom para Eventos',
    'Fotógrafo',
    'Barista',
    'DJ',
    'Segurança',
    'Limpeza'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Inspired by GetNinjas */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
              O Serviço que você precisa <br />
              <span style={{ color: '#D14900' }}>a um clique de distância</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-600 leading-relaxed">
              Encontre profissionais e contrate serviços para tudo o que precisar
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Input 
                  type="text"
                  placeholder="Que tipo de serviço você precisa?"
                  className="w-full py-4 pl-12 pr-4 text-lg border-2 border-gray-300 rounded-lg focus:ring-0"
                  style={{ 
                    '&:focus': { borderColor: '#D14900' }
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#D14900'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto mb-12">
              <Link href="/register?type=contratante">
                <Button size="lg" className="bg-white font-semibold px-8 py-4 text-lg border-2 hover:bg-gray-100" style={{ color: '#D14900', borderColor: '#D14900' }}>
                  Sou Contratante
                </Button>
              </Link>
              <Link href="/register?type=freelancer">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-8 py-4 text-lg">
                  Sou Prestador
                </Button>
              </Link>
            </div>

            {/* Popular Services */}
            {popularServices.length > 0 && (
              <div className="max-w-4xl mx-auto">
                <p className="text-sm text-gray-600 mb-4 font-medium">Populares:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularServices.map((service, index) => (
                    <Link key={index} href="/jobs">
                      <Button 
                        variant="outline" 
                        className="rounded-full text-sm px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        {service}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section - Similar to GetNinjas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todas as categorias de serviços
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => {
              const IconComponent = categoryIcons[category.name] || Briefcase;
              return (
                <Link 
                  key={category.id || index}
                  href={`/jobs?category=${category.id}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <IconComponent className="w-8 h-8 group-hover:scale-110 transition-transform" style={{ color: '#D14900' }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando categorias...</p>
            </div>
          )}
        </div>
      </section>

      {/* Help Section - Inspired by GetNinjas */}
      <section className="py-16" style={{ backgroundColor: '#FFF4F0' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#D14900' }}>
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Precisando de ajuda?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Conte conosco para conectar você aos melhores profissionais e receba até{' '}
              <span className="font-bold" style={{ color: '#D14900' }}>4 orçamentos grátis</span>.
            </p>
            <Link href="/jobs">
              <Button size="lg" className="text-white px-8 py-4 hover:opacity-90" style={{ backgroundColor: '#D14900' }}>
                Buscar por serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section - Inspired by GetNinjas */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que é o Contrata AI?
            </h2>
            <p className="text-lg text-gray-600">
              Contrata AI é a maior plataforma de contratação de serviços do Brasil. Conectamos profissionais de todo o Brasil com pessoas solicitando serviço, atendendo com qualidade, facilidade e rapidez todos os tipos de necessidade.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-12 h-12" style={{ color: '#D14900' }} />
              </div>
              <h4 className="text-xl font-semibold mb-4">Faça o seu pedido</h4>
              <p className="text-gray-600">
                Fale o que você precisa. É rápido e de graça!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-12 h-12" style={{ color: '#D14900' }} />
              </div>
              <h4 className="text-xl font-semibold mb-4">Receba até quatro orçamentos</h4>
              <p className="text-gray-600">
                Profissionais avaliados entram em contato com você em instantes!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-12 h-12" style={{ color: '#D14900' }} />
              </div>
              <h4 className="text-xl font-semibold mb-4">Escolha o melhor</h4>
              <p className="text-gray-600">
                Negocie direto com eles. Fácil como nunca foi antes!
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/jobs">
              <Button size="lg" className="text-white px-8 py-4 hover:opacity-90" style={{ backgroundColor: '#D14900' }}>
                Buscar por serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contrata AI</h3>
              <p className="text-gray-400 mb-4">
                A maior plataforma de contratação de serviços do Brasil.
              </p>
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80" style={{ backgroundColor: '#D14900' }}>
                  <span className="text-xs font-bold text-white">f</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80" style={{ backgroundColor: '#D14900' }}>
                  <span className="text-xs font-bold text-white">t</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80" style={{ backgroundColor: '#D14900' }}>
                  <span className="text-xs font-bold text-white">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Contratantes</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/create-job" className="hover:text-white">Publicar Serviço</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Meu Painel</Link></li>
                <li><a href="#" className="hover:text-white">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white">Planos Premium</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Profissionais</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/jobs" className="hover:text-white">Buscar Trabalhos</Link></li>
                <li><Link href="/applications" className="hover:text-white">Minhas Candidaturas</Link></li>
                <li><Link href="/settings" className="hover:text-white">Meu Perfil</Link></li>
                <li><a href="#" className="hover:text-white">Dicas de Sucesso</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>&copy; 2024 Contrata AI. Todos os direitos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Termos</a>
                <a href="#" className="hover:text-white">Privacidade</a>
                <a href="#" className="hover:text-white">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
