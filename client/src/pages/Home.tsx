import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Users, 
  Briefcase, 
  Star, 
  Search,
  MapPin,
  Clock,
  DollarSign,
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
  Quote
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Link href="/dashboard" />;
  }

  const categories = [
    { icon: Coffee, name: 'Eventos & Gastronomia', count: '450+ serviços', color: 'bg-amber-100 text-amber-700' },
    { icon: Camera, name: 'Fotografia & Vídeo', count: '280+ serviços', color: 'bg-purple-100 text-purple-700' },
    { icon: Wrench, name: 'Reformas & Reparos', count: '350+ serviços', color: 'bg-orange-100 text-orange-700' },
    { icon: Laptop, name: 'Tecnologia & Design', count: '200+ serviços', color: 'bg-blue-100 text-blue-700' },
    { icon: Music, name: 'Música & Entretenimento', count: '180+ serviços', color: 'bg-green-100 text-green-700' },
    { icon: Book, name: 'Educação & Idiomas', count: '320+ serviços', color: 'bg-indigo-100 text-indigo-700' },
    { icon: HomeIcon, name: 'Serviços Domésticos', count: '500+ serviços', color: 'bg-pink-100 text-pink-700' },
    { icon: Car, name: 'Automotivo & Transporte', count: '150+ serviços', color: 'bg-cyan-100 text-cyan-700' },
  ];

  const popularServices = [
    { name: 'Garçom para Eventos', price: 'R$ 120/dia', image: '🍽️' },
    { name: 'Fotógrafo', price: 'R$ 300/evento', image: '📸' },
    { name: 'Barista', price: 'R$ 150/dia', image: '☕' },
    { name: 'DJ', price: 'R$ 400/evento', image: '🎵' },
    { name: 'Segurança', price: 'R$ 180/dia', image: '🛡️' },
    { name: 'Limpeza', price: 'R$ 80/dia', image: '🧹' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Conecte-se aos melhores <span className="text-yellow-400">freelancers</span> da sua cidade
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-blue-100">
              Plataforma que conecta contratantes e freelancers para serviços presenciais e pontuais.<br />
              Encontre ou ofereça trabalhos em eventos, bares, restaurantes e muito mais.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="bg-white rounded-xl p-2 shadow-xl">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="O que você está procurando?" 
                      className="pl-10 border-0 text-lg h-12 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Qual sua cidade?" 
                      className="pl-10 border-0 text-lg h-12 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 h-12">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link href="/register?type=contratante">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
                  Sou Contratante
                </Button>
              </Link>
              <Link href="/register?type=freelancer">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-8">
                  Sou Freelancer
                </Button>
              </Link>
            </div>

            {/* Popular tags */}
            <div className="mt-8">
              <p className="text-sm text-blue-200 mb-3">Populares:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Garçom', 'Fotógrafo', 'Barista', 'DJ', 'Segurança', 'Limpeza'].map((tag) => (
                  <Badge key={tag} className="bg-blue-700 text-white hover:bg-blue-600 cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todas as categorias de serviços
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 500 tipos de serviços em um só lugar
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${category.color} group-hover:scale-110 transition-transform duration-200`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="outline" className="bg-white border-gray-300 hover:bg-gray-50">
              Ver todas as categorias <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Principais serviços pedidos
            </h2>
            <p className="text-xl text-gray-600">
              Os serviços mais realizados de cada categoria
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularServices.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{service.image}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-green-600 font-medium">{service.price}</p>
                    </div>
                  </div>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    Solicitar orçamento
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que é o Contrata AI?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Contrata AI é a maior plataforma de contratação de serviços presenciais do Brasil. 
              Conectamos profissionais qualificados com pessoas que precisam de serviços.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Faça o seu pedido</h3>
              <p className="text-gray-600">
                Fale o que você precisa. É rápido e de graça!
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Receba até quatro orçamentos</h3>
              <p className="text-gray-600">
                Profissionais avaliados entram em contato com você em instantes!
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Escolha o melhor</h3>
              <p className="text-gray-600">
                Negocie direto com eles. Fácil como nunca foi antes!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quem contratou um profissional recomenda
            </h2>
            <p className="text-xl text-gray-600">
              São mais de 3 milhões de clientes e profissionais felizes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="w-8 h-8 text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  "Fui muito bem atendida, o profissional foi muito educado e fez um trabalho de qualidade. 
                  Valeu a pena, orçamento grátis e não é caro."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    AP
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Ana Paula</p>
                    <p className="text-sm text-gray-600">Contratou um Garçom em São Paulo, SP</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="w-8 h-8 text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  "Os profissionais são pessoas dedicadas com seus serviços. Tudo o que é pedido é feito 
                  da maneira como foi pedido. Aprovado!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    BF
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Bruno Freitas</p>
                    <p className="text-sm text-gray-600">Contratou um Fotógrafo em Curitiba, PR</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <Quote className="w-8 h-8 text-gray-400 mb-4" />
                <p className="text-gray-700 mb-4">
                  "Uma excelente profissional, pontual e acima de tudo confiável. Foi bastante educada 
                  e atenciosa com o trabalho, recomendo."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    RF
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Renata Figueiredo</p>
                    <p className="text-sm text-gray-600">Contratou uma Diarista no Rio de Janeiro, RJ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Precisando de ajuda?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Conte conosco para conectar você aos melhores profissionais e receba até 4 orçamentos grátis.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="/jobs">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8">
                Buscar por serviços
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-8">
                Cadastrar-se
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contrata AI</h3>
              <p className="text-gray-400 mb-4">
                Conectando contratantes e freelancers para serviços presenciais e pontuais.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer">
                  <span className="text-xs font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 cursor-pointer">
                  <span className="text-xs font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 cursor-pointer">
                  <span className="text-xs font-bold">i</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Contratantes</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/create-job" className="hover:text-white">Criar Vaga</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Meu Painel</Link></li>
                <li><a href="#" className="hover:text-white">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white">Planos Premium</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Freelancers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs" className="hover:text-white">Buscar Vagas</Link></li>
                <li><Link href="/applications" className="hover:text-white">Minhas Candidaturas</Link></li>
                <li><Link href="/settings" className="hover:text-white">Perfil</Link></li>
                <li><a href="#" className="hover:text-white">Dicas de Sucesso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
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
