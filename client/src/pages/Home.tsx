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
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Faça seu negócio crescer com <span className="text-yellow-400">o melhor talento local</span> do Brasil
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-blue-100 leading-relaxed">
              Desenvolva seu negócio de forma rápida e segura.<br />
              Conectamos você com milhares de talentos no seu idioma e fuso horário.
            </p>
            
            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
              <div className="flex items-center text-blue-100">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Consultoria grátis
              </div>
              <div className="flex items-center text-blue-100">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Satisfação garantida
              </div>
              <div className="flex items-center text-blue-100">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                Pagamentos protegidos
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto mb-12">
              <Link href="/register?type=contratante">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                  Eu quero contratar
                </Button>
              </Link>
              <Link href="/register?type=freelancer">
                <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600 font-semibold px-8 py-4 text-lg">
                  Você quer trabalhar?
                </Button>
              </Link>
            </div>

            {/* Hero Image placeholder */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">Talentos pré-selecionados</h3>
                          <p className="text-sm text-gray-600">e certificados para trabalhar</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">Trabalhos flexíveis</h3>
                          <p className="text-sm text-gray-600">por horas ou projeto</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm text-gray-600 uppercase tracking-wide mb-2">Confiam em nós</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">A Comunidade Líder no Brasil</h3>
            <p className="text-xl text-gray-600 mt-4">Mais de 10 anos conectando talentos com oportunidades</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">50,000+</h4>
              <p className="text-gray-600">Profissionais qualificados</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">100,000+</h4>
              <p className="text-gray-600">Projetos concluídos</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-yellow-600" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-2">4.8/5</h4>
              <p className="text-gray-600">Avaliação média</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confiança</h3>
              <p className="text-gray-600 mb-6">
                A cada semana, conectamos com sucesso milhares de talentos com oportunidades de trabalho presencial
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Profissionais verificados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Pagamentos seguros</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Suporte 24/7</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Milhares de negócios</h4>
                  <p className="text-gray-600">crescem com o Contrata AI</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Eventos & Gastronomia</span>
                  <span className="text-blue-600 font-semibold">450+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fotografia & Vídeo</span>
                  <span className="text-blue-600 font-semibold">280+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reformas & Reparos</span>
                  <span className="text-blue-600 font-semibold">350+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Build Your Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm text-gray-600 uppercase tracking-wide mb-2">Tem um projeto?</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Monte sua equipe</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Event & Service Professionals */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-gray-900">Profissionais para Eventos</h4>
                  <p className="text-gray-600">Trabalho presencial e pontual</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🍽️</div>
                  <h5 className="font-semibold text-gray-900">Garçom</h5>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">☕</div>
                  <h5 className="font-semibold text-gray-900">Barista</h5>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">📸</div>
                  <h5 className="font-semibold text-gray-900">Fotógrafo</h5>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🎵</div>
                  <h5 className="font-semibold text-gray-900">DJ</h5>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link href="/create-job" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Contrate um Profissional
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" className="flex-1">
                    Saiba mais
                  </Button>
                </Link>
              </div>
            </div>

            {/* Freelancer Services */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-gray-900">Freelancers Especializados</h4>
                  <p className="text-gray-600">Trabalho flexível por projeto</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Laptop className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Tecnologia & Design</span>
                  </div>
                  <span className="text-yellow-600 font-semibold">200+</span>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Fotografia & Vídeo</span>
                  </div>
                  <span className="text-yellow-600 font-semibold">280+</span>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Palette className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Marketing & Vendas</span>
                  </div>
                  <span className="text-yellow-600 font-semibold">150+</span>
                </div>
                <div className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Book className="w-5 h-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Tradução & Conteúdo</span>
                  </div>
                  <span className="text-yellow-600 font-semibold">120+</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link href="/create-job" className="flex-1">
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    Contrate um Freelancer
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" className="flex-1">
                    Saiba mais
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Descubra talentos com as habilidades que você precisa
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Event Services */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Eventos & Gastronomia</h3>
              <div className="space-y-3">
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coffee className="w-5 h-5 text-amber-600 mr-3" />
                      <span className="text-gray-900">Garçom</span>
                    </div>
                    <span className="text-sm text-gray-500">120+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coffee className="w-5 h-5 text-amber-600 mr-3" />
                      <span className="text-gray-900">Barista</span>
                    </div>
                    <span className="text-sm text-gray-500">85+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Music className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-900">DJ</span>
                    </div>
                    <span className="text-sm text-gray-500">45+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Camera className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-gray-900">Fotógrafo</span>
                    </div>
                    <span className="text-sm text-gray-500">65+ vagas</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Technical Services */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tecnologia & Design</h3>
              <div className="space-y-3">
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Laptop className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-900">Desenvolvedor Web</span>
                    </div>
                    <span className="text-sm text-gray-500">95+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Palette className="w-5 h-5 text-pink-600 mr-3" />
                      <span className="text-gray-900">Designer Gráfico</span>
                    </div>
                    <span className="text-sm text-gray-500">75+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Camera className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-gray-900">Editor de Vídeo</span>
                    </div>
                    <span className="text-sm text-gray-500">50+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Laptop className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-900">Suporte Técnico</span>
                    </div>
                    <span className="text-sm text-gray-500">35+ vagas</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Service & Maintenance */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Serviços & Manutenção</h3>
              <div className="space-y-3">
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wrench className="w-5 h-5 text-orange-600 mr-3" />
                      <span className="text-gray-900">Eletricista</span>
                    </div>
                    <span className="text-sm text-gray-500">80+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HomeIcon className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-900">Diarista</span>
                    </div>
                    <span className="text-sm text-gray-500">150+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-gray-600 mr-3" />
                      <span className="text-gray-900">Motorista</span>
                    </div>
                    <span className="text-sm text-gray-500">60+ vagas</span>
                  </div>
                </Link>
                <Link href="/jobs" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Book className="w-5 h-5 text-indigo-600 mr-3" />
                      <span className="text-gray-900">Professor</span>
                    </div>
                    <span className="text-sm text-gray-500">90+ vagas</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/jobs">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Descubra todas as habilidades
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm text-gray-600 uppercase tracking-wide mb-2">Precisa de ajuda?</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona o Contrata AI
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conectamos você aos melhores profissionais e você recebe até 4 orçamentos grátis.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-4">1. Faça o seu pedido</h4>
              <p className="text-gray-600">
                Diga o que você precisa. É rápido e de graça!
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-yellow-600" />
              </div>
              <h4 className="text-xl font-semibold mb-4">2. Receba orçamentos</h4>
              <p className="text-gray-600">
                Profissionais avaliados entram em contato com você em instantes!
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-4">3. Escolha o melhor</h4>
              <p className="text-gray-600">
                Negocie direto com eles. Fácil como nunca foi antes!
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/jobs">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 mr-4">
                Buscar por serviços
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                Cadastrar-se
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
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
            <Card className="bg-white shadow-lg">
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

            <Card className="bg-white shadow-lg">
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

            <Card className="bg-white shadow-lg">
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
