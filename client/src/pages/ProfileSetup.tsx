import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Briefcase, User, MapPin, Building, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCPF, formatCNPJ, formatPhone, formatCEP, isValidCPF, isValidCNPJ } from '@/lib/masks';

interface ProfileData {
  userType: 'freelancer' | 'contratante' | null;
  personType: 'individual' | 'empresa' | null;
  name: string;
  fullName?: string;
  cpf?: string;
  cnpj?: string;
  companyName?: string;
  responsibleName?: string;
  companySize?: string;
  website?: string;
  phone: string;
  city: string;
  skills?: string;
  experience?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  selectedCategories: string[];
}

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { user, completeOnboarding } = useUnifiedAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [data, setData] = useState<ProfileData>({
    userType: null,
    personType: null,
    name: user?.name || '',
    phone: '',
    city: '',
    address: {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    selectedCategories: []
  });

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const categoriesData = await response.json();
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredCategories(
        categories.filter(category => 
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const getTotalSteps = () => {
    if (data.userType === 'freelancer') return 4; // Type -> Personal -> Address -> Categories
    if (data.userType === 'contratante') return 5; // Type -> Person Type -> Data -> Address -> Categories
    return 4;
  };

  const handleNext = () => {
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUserTypeSelect = (type: 'freelancer' | 'contratante') => {
    setData({ ...data, userType: type });
    handleNext();
  };

  const handlePersonTypeSelect = (type: 'individual' | 'empresa') => {
    setData({ ...data, personType: type });
    handleNext();
  };

  const handleCEPLookup = async (cep: string) => {
    if (cep.length === 9) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep.replace('-', '')}/json/`);
        const addressData = await response.json();
        
        if (!addressData.erro) {
          setData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              cep,
              street: addressData.logradouro || '',
              neighborhood: addressData.bairro || '',
              city: addressData.localidade || '',
              state: addressData.uf || ''
            },
            city: addressData.localidade || prev.city
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = data.selectedCategories.includes(categoryId);
    if (isSelected) {
      setData(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.filter(id => id !== categoryId)
      }));
    } else if (data.selectedCategories.length < 3) {
      setData(prev => ({
        ...prev,
        selectedCategories: [...prev.selectedCategories, categoryId]
      }));
    }
  };



  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // For the simple auth system, use completeOnboarding
      if (completeOnboarding) {
        await completeOnboarding(data);
      }
      
      toast({
        title: "Perfil configurado com sucesso!",
        description: "Bem-vindo ao Contrata AI"
      });
      
      setLocation('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return data.userType !== null;
      case 2: 
        if (data.userType === 'contratante') return data.personType !== null;
        if (data.userType === 'freelancer') return data.name.trim() && data.phone.trim();
        return false;
      case 3:
        if (data.userType === 'contratante' && data.personType === 'individual') {
          return data.fullName?.trim() && data.cpf?.trim() && isValidCPF(data.cpf) && data.phone.trim();
        }
        if (data.userType === 'contratante' && data.personType === 'empresa') {
          return data.companyName?.trim() && data.cnpj?.trim() && isValidCNPJ(data.cnpj) && 
                 data.responsibleName?.trim() && data.companySize?.trim() && data.phone.trim();
        }
        if (data.userType === 'freelancer') {
          return data.address.cep.trim() && data.address.city.trim();
        }
        return false;
      case 4:
        if (data.userType === 'freelancer') return data.selectedCategories.length > 0;
        if (data.userType === 'contratante') return data.address.cep.trim() && data.address.city.trim();
        return false;
      case 5:
        if (data.userType === 'contratante') return data.selectedCategories.length > 0;
        return false;
      default: return false;
    }
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configure seu perfil</h1>
          <p className="text-gray-600 mt-2">Vamos configurar sua conta para começar</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {Array.from({ length: getTotalSteps() }, (_, i) => (
              <div key={i} className={`flex items-center ${i < getTotalSteps() - 1 ? 'flex-1' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep > i + 1 ? 'bg-green-500 text-white' :
                  currentStep === i + 1 ? 'bg-primary text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {i + 1}
                </div>
                {i < getTotalSteps() - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > i + 1 ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Escolha seu tipo de usuário"}
              {currentStep === 2 && (data.userType === 'contratante' ? "Tipo de pessoa" : "Informações pessoais")}
              {currentStep === 3 && (data.userType === 'contratante' ? "Dados pessoais/empresa" : "Endereço")}
              {currentStep === 4 && (data.userType === 'freelancer' ? "Áreas de atuação" : "Endereço")}
              {currentStep === 5 && data.userType === 'contratante' && "Categorias de interesse"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: User Type Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.userType === 'freelancer' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleUserTypeSelect('freelancer')}
                >
                  <CardContent className="p-6 text-center">
                    <User className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Freelancer</h3>
                    <p className="text-sm text-gray-600">Quero oferecer meus serviços</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.userType === 'contratante' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleUserTypeSelect('contratante')}
                >
                  <CardContent className="p-6 text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Contratante</h3>
                    <p className="text-sm text-gray-600">Quero contratar serviços</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && data.userType === 'contratante' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.personType === 'individual' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePersonTypeSelect('individual')}
                >
                  <CardContent className="p-6 text-center">
                    <User className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Pessoa Física</h3>
                    <p className="text-sm text-gray-600">CPF</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    data.personType === 'empresa' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handlePersonTypeSelect('empresa')}
                >
                  <CardContent className="p-6 text-center">
                    <Building className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="font-semibold mb-2">Pessoa Jurídica</h3>
                    <p className="text-sm text-gray-600">CNPJ</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 2 && data.userType === 'freelancer' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Principais habilidades (opcional)</Label>
                  <Textarea
                    id="skills"
                    value={data.skills || ''}
                    onChange={(e) => setData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="Descreva suas principais habilidades e experiências"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Anos de experiência</Label>
                  <Select value={data.experience || ''} onValueChange={(value) => setData(prev => ({ ...prev, experience: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua experiência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante (0-1 anos)</SelectItem>
                      <SelectItem value="junior">Júnior (1-3 anos)</SelectItem>
                      <SelectItem value="pleno">Pleno (3-5 anos)</SelectItem>
                      <SelectItem value="senior">Sênior (5+ anos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && data.userType === 'contratante' && data.personType === 'individual' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Nome completo</Label>
                  <Input
                    id="fullName"
                    value={data.fullName || ''}
                    onChange={(e) => setData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={data.cpf || ''}
                    onChange={(e) => setData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={data.cpf && !isValidCPF(data.cpf) ? 'border-red-500' : ''}
                  />
                  {data.cpf && !isValidCPF(data.cpf) && (
                    <p className="text-red-500 text-sm mt-1">Por favor, insira um CPF válido</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && data.userType === 'contratante' && data.personType === 'empresa' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={data.companyName || ''}
                    onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Razão social da empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={data.cnpj || ''}
                    onChange={(e) => setData(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                    className={data.cnpj && !isValidCNPJ(data.cnpj) ? 'border-red-500' : ''}
                  />
                  {data.cnpj && !isValidCNPJ(data.cnpj) && (
                    <p className="text-red-500 text-sm mt-1">Por favor, insira um CNPJ válido</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="responsibleName">Nome do responsável</Label>
                  <Input
                    id="responsibleName"
                    value={data.responsibleName || ''}
                    onChange={(e) => setData(prev => ({ ...prev, responsibleName: e.target.value }))}
                    placeholder="Nome do responsável pela empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="companySize">Tamanho da empresa</Label>
                  <Select value={data.companySize || ''} onValueChange={(value) => setData(prev => ({ ...prev, companySize: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="micro">Micro (até 9 funcionários)</SelectItem>
                      <SelectItem value="pequena">Pequena (10-49 funcionários)</SelectItem>
                      <SelectItem value="media">Média (50-249 funcionários)</SelectItem>
                      <SelectItem value="grande">Grande (250+ funcionários)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="website">Website (opcional)</Label>
                  <Input
                    id="website"
                    value={data.website || ''}
                    onChange={(e) => setData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.suaempresa.com.br"
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData(prev => ({ ...prev, phone: formatPhone(e.target.value) }))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>
            )}

            {/* Address Step for Freelancer (Step 3) or Contractor (Step 4) */}
            {((currentStep === 3 && data.userType === 'freelancer') || 
              (currentStep === 4 && data.userType === 'contratante')) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={data.address.cep}
                    onChange={(e) => {
                      const cep = formatCEP(e.target.value);
                      setData(prev => ({ ...prev, address: { ...prev.address, cep } }));
                      handleCEPLookup(cep);
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={data.address.street}
                      onChange={(e) => setData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={data.address.number}
                      onChange={(e) => setData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, number: e.target.value }
                      }))}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={data.address.neighborhood}
                    onChange={(e) => setData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, neighborhood: e.target.value }
                    }))}
                    placeholder="Nome do bairro"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={data.address.city}
                      onChange={(e) => setData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value },
                        city: e.target.value
                      }))}
                      placeholder="Nome da cidade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={data.address.state}
                      onChange={(e) => setData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder="SP"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Categories Step for Freelancer (Step 4) */}
            {currentStep === 4 && data.userType === 'freelancer' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar categorias (máximo 3)</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite para buscar categorias..."
                  />
                </div>
                
                {data.selectedCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Categorias selecionadas:</Label>
                    <div className="flex flex-wrap gap-2">
                      {data.selectedCategories.map(categoryId => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                            {category.name}
                            <X 
                              size={14} 
                              className="cursor-pointer hover:text-red-500" 
                              onClick={() => handleCategoryToggle(categoryId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCategories
                    .filter(cat => !data.selectedCategories.includes(cat.id))
                    .map(category => (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          data.selectedCategories.length >= 3 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:border-primary'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Categories Step for Contratante (Step 5) */}
            {currentStep === 5 && data.userType === 'contratante' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Selecione até 3 categorias de serviços que você tem interesse em contratar mais frequentemente.
                </p>
                
                <div>
                  <Label htmlFor="search">Buscar categorias (máximo 3)</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite para buscar categorias..."
                  />
                </div>
                
                {data.selectedCategories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Categorias selecionadas:</Label>
                    <div className="flex flex-wrap gap-2">
                      {data.selectedCategories.map(categoryId => {
                        const category = categories.find(c => c.id === categoryId);
                        return category ? (
                          <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                            {category.name}
                            <X 
                              size={14} 
                              className="cursor-pointer hover:text-red-500" 
                              onClick={() => handleCategoryToggle(categoryId)}
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCategories
                    .filter(cat => !data.selectedCategories.includes(cat.id))
                    .map(category => (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          data.selectedCategories.length >= 3 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:border-primary'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Voltar
              </Button>
              
              {currentStep < getTotalSteps() ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                >
                  Próximo
                </Button>
              ) : (
                <Button 
                  onClick={handleFinish}
                  disabled={!isStepValid() || isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Finalizar'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}