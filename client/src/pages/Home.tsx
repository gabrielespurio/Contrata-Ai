import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Users, Briefcase, Star } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Link href="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Conecte-se aos melhores <span className="text-accent">freelancers</span> da sua cidade
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Plataforma que conecta contratantes e freelancers para serviços presenciais e pontuais. 
            Encontre ou ofereça trabalhos em eventos, bares, restaurantes e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Link href="/register?type=contratante">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Sou Contratante
              </Button>
            </Link>
            <Link href="/register?type=freelancer">
              <Button size="lg" className="bg-accent text-white hover:bg-yellow-500">
                Sou Freelancer
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Para Contratantes */}
            <Card>
              <CardContent className="text-center p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Para Contratantes</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Publique até 3 vagas por semana gratuitamente
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Visualize candidatos qualificados
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Contrate com segurança e agilidade
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Destaque suas vagas por apenas R$ 4,99
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Para Freelancers */}
            <Card>
              <CardContent className="text-center p-8">
                <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Para Freelancers</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Explore vagas na sua cidade
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Filtre por categoria e data
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Candidate-se com facilidade
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Destaque seu perfil por R$ 2,99
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Plans */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Planos Premium</h2>
            <p className="text-xl text-gray-300">Maximize suas oportunidades com recursos exclusivos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="bg-white text-gray-900">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Gratuito</h3>
                <div className="text-3xl font-bold mb-4">R$ 0<span className="text-sm font-normal">/mês</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Até 3 vagas por semana
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Candidaturas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Suporte básico
                  </li>
                </ul>
                <Button className="w-full" variant="outline">
                  Plano Atual
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-primary text-white transform scale-105 shadow-xl">
              <CardContent className="p-6">
                <div className="bg-accent text-gray-900 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  Mais Popular
                </div>
                <h3 className="text-xl font-bold mb-4">Premium</h3>
                <div className="text-3xl font-bold mb-4">R$ 19,90<span className="text-sm font-normal">/mês</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2" />
                    Vagas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2" />
                    Candidaturas ilimitadas
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2" />
                    Suporte prioritário
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-accent mr-2" />
                    Estatísticas avançadas
                  </li>
                </ul>
                <Button className="w-full bg-accent text-gray-900 hover:bg-yellow-500">
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card className="bg-white text-gray-900">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Destaques</h3>
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h4 className="font-semibold mb-2">Destacar Vaga</h4>
                    <div className="text-2xl font-bold text-accent mb-2">R$ 4,99<span className="text-sm font-normal">/7 dias</span></div>
                    <p className="text-sm text-gray-600">Sua vaga aparece no topo dos resultados</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Destacar Perfil</h4>
                    <div className="text-2xl font-bold text-accent mb-2">R$ 2,99<span className="text-sm font-normal">/7 dias</span></div>
                    <p className="text-sm text-gray-600">Seu perfil fica em destaque para contratantes</p>
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
              <p className="text-gray-400">Conectando contratantes e freelancers para serviços presenciais e pontuais.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Contratantes</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Criar Vaga</a></li>
                <li><a href="#" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">Como Funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Para Freelancers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Buscar Vagas</a></li>
                <li><a href="#" className="hover:text-white">Perfil</a></li>
                <li><a href="#" className="hover:text-white">Dicas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Contrata AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
