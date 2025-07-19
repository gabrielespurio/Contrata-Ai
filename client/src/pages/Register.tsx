import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCheck, Briefcase } from 'lucide-react';

const cities = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Salvador',
  'Fortaleza',
  'Recife',
  'Porto Alegre',
  'Curitiba',
  'Manaus',
];

type UserType = 'freelancer' | 'contratante';
type RegistrationStep = 'select-type' | 'form';

export default function Register() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('select-type');
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    // Campos específicos para freelancer
    skills: '',
    experience: '',
    // Campos específicos para contratante
    companyName: '',
    companySize: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleTypeSelect = (type: UserType) => {
    setSelectedType(type);
    setCurrentStep('form');
  };

  const handleBack = () => {
    setCurrentStep('select-type');
    setSelectedType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        type: selectedType!,
        city: formData.city,
      };
      
      await register(registrationData);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Contrata AI.",
      });
      setLocation('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      let description = "Tente novamente ou verifique se o email já está em uso.";
      
      if (errorMessage.includes('User already exists') || errorMessage.includes('400')) {
        description = "Este email já está cadastrado. Tente fazer login ou use outro email.";
      }
      
      toast({
        title: "Erro no cadastro",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'select-type') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Cadastrar</CardTitle>
            <p className="text-center text-gray-600">
              Escolha como você quer usar o Contrata AI
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handleTypeSelect('freelancer')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group"
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
                      Quero encontrar trabalhos e oferecer meus serviços para empresas e contratantes
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleTypeSelect('contratante')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group"
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
                      Quero contratar freelancers para projetos e trabalhos temporários
                    </p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem conta?{' '}
                <Link href="/login">
                  <a className="text-orange-600 hover:underline font-medium">Entrar</a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-1 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">
              Cadastro {selectedType === 'freelancer' ? 'Freelancer' : 'Contratante'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {selectedType === 'freelancer' ? 'Nome completo' : 'Nome do responsável'}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {selectedType === 'contratante' && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Minha Empresa Ltda"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedType === 'freelancer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="skills">Principais habilidades</Label>
                  <Input
                    id="skills"
                    type="text"
                    placeholder="Ex: Design Gráfico, Marketing Digital, Programação"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nível de experiência</Label>
                  <Select value={formData.experience} onValueChange={(value) => setFormData({ ...formData, experience: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua experiência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante (0-1 anos)</SelectItem>
                      <SelectItem value="intermediario">Intermediário (2-5 anos)</SelectItem>
                      <SelectItem value="avancado">Avançado (5+ anos)</SelectItem>
                      <SelectItem value="expert">Expert (10+ anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {selectedType === 'contratante' && (
              <div className="space-y-2">
                <Label>Tamanho da empresa</Label>
                <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho da empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="microempresa">Microempresa (1-10 funcionários)</SelectItem>
                    <SelectItem value="pequena">Pequena (11-50 funcionários)</SelectItem>
                    <SelectItem value="media">Média (51-200 funcionários)</SelectItem>
                    <SelectItem value="grande">Grande (200+ funcionários)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Já tem conta?{' '}
              <Link href="/login">
                <a className="text-orange-600 hover:underline font-medium">Entrar</a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
