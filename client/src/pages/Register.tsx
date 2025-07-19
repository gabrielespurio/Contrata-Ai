import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCheck, Briefcase, User, Building2, Search, X } from 'lucide-react';

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
type RegistrationStep = 'select-type' | 'select-person-type' | 'personal-data' | 'address' | 'service-categories';

export default function Register() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('select-type');
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [selectedPersonType, setSelectedPersonType] = useState<PersonType | null>(null);
  const [formData, setFormData] = useState({
    // Dados básicos
    name: '',
    email: '',
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
    // Dados de endereço
    cep: '',
    street: '',
    neighborhood: '',
    addressCity: '',
    state: '',
    houseNumber: '',
    // Categorias de interesse
    selectedCategories: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { register } = useUnifiedAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if we should redirect to Clerk register
  const hasValidClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
    !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('your_clerk_publishable_key_here') && 
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.startsWith('pk_');

  useEffect(() => {
    if (hasValidClerkKey) {
      setLocation('/clerk-register');
    }
  }, [hasValidClerkKey, setLocation]);

  // Carregar categorias na inicialização
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setFilteredCategories(data);
      })
      .catch(error => console.error('Erro ao carregar categorias:', error));
  }, []);

  // Filtrar categorias baseado na pesquisa
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

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
    } else if (currentStep === 'address') {
      setCurrentStep('personal-data');
    } else if (currentStep === 'service-categories') {
      setCurrentStep('address');
    }
  };

  const handleNext = () => {
    if (currentStep === 'personal-data' && selectedType === 'contratante') {
      setCurrentStep('address');
    } else if (currentStep === 'address') {
      setCurrentStep('service-categories');
    }
  };

  // Função para buscar dados do CEP
  const fetchAddressByCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData({
            ...formData,
            cep: cep,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            addressCity: data.localidade || '',
            state: data.uf || '',
          });
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique se o CEP está correto",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Tente novamente em alguns instantes",
          variant: "destructive"
        });
      }
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length <= 8) {
      setFormData({ ...formData, cep });
      if (cep.length === 8) {
        fetchAddressByCEP(cep);
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    const currentSelected = formData.selectedCategories;
    if (currentSelected.includes(categoryId)) {
      // Remove categoria se já estiver selecionada
      setFormData({
        ...formData,
        selectedCategories: currentSelected.filter(id => id !== categoryId)
      });
    } else if (currentSelected.length < 3) {
      // Adiciona categoria se não atingiu o limite
      setFormData({
        ...formData,
        selectedCategories: [...currentSelected, categoryId]
      });
    } else {
      toast({
        title: "Limite atingido",
        description: "Você pode selecionar no máximo 3 categorias",
        variant: "destructive"
      });
    }
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
        case 'personal-data': return { current: 2, total: 4, title: selectedPersonType === 'fisica' ? 'Dados pessoais' : 'Dados da empresa' };
        case 'address': return { current: 3, total: 4, title: 'Endereço' };
        case 'service-categories': return { current: 4, total: 4, title: 'Serviços de interesse' };
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

  // Etapa 4: Formulário de endereço
  if (currentStep === 'address') {
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
              <CardTitle className="text-2xl">Endereço</CardTitle>
            </div>
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {selectedPersonType === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  type="text"
                  placeholder="00000-000"
                  value={formData.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
                  onChange={handleCEPChange}
                  maxLength={9}
                  required
                />
                <p className="text-xs text-gray-500">
                  Digite o CEP para preenchimento automático
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  type="text"
                  placeholder="Nome da rua"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseNumber">Número</Label>
                <Input
                  id="houseNumber"
                  type="text"
                  placeholder="123"
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  type="text"
                  placeholder="Nome do bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="addressCity">Cidade</Label>
                  <Input
                    id="addressCity"
                    type="text"
                    placeholder="Cidade"
                    value={formData.addressCity}
                    onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="UF"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <Button 
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleNext}
              >
                Continuar - Próxima etapa
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

  // Etapa 4: Seleção de categorias de interesse
  if (currentStep === 'service-categories') {
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
              <CardTitle className="text-2xl">Serviços de Interesse</CardTitle>
            </div>
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {selectedPersonType === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              </Badge>
            </div>
            <p className="text-center text-gray-600 text-sm">
              Selecione até 3 categorias que você tem interesse em contratar
            </p>
          </CardHeader>
          <CardContent>
            {/* Categorias já selecionadas */}
            {formData.selectedCategories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Categorias selecionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedCategories.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return (
                      <div
                        key={categoryId}
                        className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{category?.name}</span>
                        <button
                          onClick={() => toggleCategory(categoryId)}
                          className="ml-2 hover:bg-orange-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Campo de busca */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Lista de categorias disponíveis */}
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              {filteredCategories.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'Nenhuma categoria encontrada' : 'Carregando categorias...'}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCategories.map((category) => {
                    const isSelected = formData.selectedCategories.includes(category.id);
                    const isDisabled = !isSelected && formData.selectedCategories.length >= 3;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => !isDisabled && toggleCategory(category.id)}
                        disabled={isDisabled}
                        className={`w-full p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500'
                            : isDisabled
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          {isSelected && (
                            <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>Selecionadas:</span>
                <span className="font-medium">
                  {formData.selectedCategories.length}/3
                </span>
              </div>

              <Button 
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={formData.selectedCategories.length === 0}
                onClick={() => {
                  toast({
                    title: "Cadastro finalizado!",
                    description: `Você selecionou ${formData.selectedCategories.length} categoria(s) de interesse`,
                  });
                  // Aqui implementaremos o envio final do cadastro
                }}
              >
                Finalizar Cadastro
              </Button>
            </div>
            
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

  // Etapa 2/3: Formulário de dados pessoais
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
              </>
            )}

            <Button 
              type={selectedType === 'freelancer' ? "submit" : "button"}
              onClick={selectedType === 'contratante' ? handleNext : undefined}
              className="w-full bg-orange-600 hover:bg-orange-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 
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
