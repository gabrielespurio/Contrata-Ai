import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCheck, Briefcase, User, Building2 } from 'lucide-react';

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
type PersonType = 'fisica' | 'juridica';
type RegistrationStep = 'select-type' | 'select-person-type' | 'personal-data' | 'address' | 'final';

export default function Register() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('select-type');
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<PersonType | null>(null);
  const [formData, setFormData] = useState({
    // Dados básicos
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    // Campos específicos para freelancer
    skills: '',
    experience: '',
    // Campos específicos para pessoa física
    cpf: '',
    fullName: '',
    // Campos específicos para pessoa jurídica
    cnpj: '',
    companyName: '',
    responsibleName: '',
    companySize: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleTypeSelect = (type: UserType) => {
    setSelectedType(type);
    if (type === 'freelancer') {
      setCurrentStep('personal-data');
    } else {
      setCurrentStep('select-person-type');
    }
  };

  const handlePersonTypeSelect = (personType: PersonType) => {
    setSelectedPersonType(personType);
    setCurrentStep('personal-data');
  };

  const handleBack = () => {
    if (currentStep === 'select-person-type') {
      setCurrentStep('select-type');
      setSelectedType(null);
    } else if (currentStep === 'personal-data') {
      if (selectedType === 'contratante') {
        setCurrentStep('select-person-type');
        setSelectedPersonType(null);
      } else {
        setCurrentStep('select-type');
        setSelectedType(null);
      }
    }
  };

  const handleNext = () => {
    // Por enquanto, só implementando até a etapa 2
    // Etapas 3 e 4 serão desenvolvidas posteriormente
  };

  const getStepInfo = () => {
    if (selectedType === 'freelancer') {
      switch (currentStep) {
        case 'select-type': return { current: 1, total: 2, title: 'Tipo de usuário' };
        case 'personal-data': return { current: 2, total: 2, title: 'Dados pessoais' };
        default: return { current: 1, total: 2, title: 'Cadastro' };
      }
    } else {
      switch (currentStep) {
        case 'select-type': return { current: 1, total: 4, title: 'Tipo de usuário' };
        case 'select-person-type': return { current: 2, total: 4, title: 'Tipo de pessoa' };
        case 'personal-data': return { current: 3, total: 4, title: selectedPersonType === 'fisica' ? 'Dados pessoais' : 'Dados da empresa' };
        case 'address': return { current: 4, total: 4, title: 'Endereço' };
        default: return { current: 1, total: 4, title: 'Cadastro' };
      }
    }
  };

  const StepIndicator = () => {
    const { current, total } = getStepInfo();
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-2">
          {Array.from({ length: total }, (_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= current
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index < total - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    index + 1 < current ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
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

  // Etapa 1: Seleção do tipo de usuário
  if (currentStep === 'select-type') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <StepIndicator />
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

  // Etapa 2: Seleção entre pessoa física ou jurídica (só para contratantes)
  if (currentStep === 'select-person-type') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <StepIndicator />
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl">Tipo de Cadastro</CardTitle>
            </div>
            <p className="text-center text-gray-600">
              Como você gostaria de se cadastrar?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => handlePersonTypeSelect('fisica')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pessoa Física
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Cadastro com CPF para contratantes individuais
                    </p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handlePersonTypeSelect('juridica')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pessoa Jurídica
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Cadastro com CNPJ para empresas e organizações
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Etapa 3: Formulário de dados pessoais
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <StepIndicator />
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
              {getStepInfo().title}
            </CardTitle>
          </div>
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {selectedType === 'freelancer' ? 'Freelancer' : 
               selectedPersonType === 'fisica' ? 'Pessoa Física' : 
               selectedPersonType === 'juridica' ? 'Pessoa Jurídica' : 'Contratante'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Formulário para Freelancer */}
            {selectedType === 'freelancer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

            {/* Formulário para Pessoa Física */}
            {selectedType === 'contratante' && selectedPersonType === 'fisica' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João Silva"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    required
                  />
                </div>
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              </>
            )}

            {/* Formulário para Pessoa Jurídica */}
            {selectedType === 'contratante' && selectedPersonType === 'juridica' && (
              <>
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
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Nome do responsável</Label>
                  <Input
                    id="responsibleName"
                    type="text"
                    placeholder="João Silva"
                    value={formData.responsibleName}
                    onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              </>
            )}

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 
               selectedType === 'freelancer' ? 'Criar conta' : 
               'Continuar - Próxima etapa'}
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
