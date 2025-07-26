import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Briefcase, User, MapPin, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  userType: 'freelancer' | 'contratante' | null;
  personType: 'individual' | 'empresa' | null;
  name: string;
  cpfCnpj: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, completeOnboarding } = useUnifiedAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    userType: null,
    personType: null,
    name: user?.name || '',
    cpfCnpj: '',
    phone: '',
    address: {
      cep: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  const handleNext = () => {
    if (currentStep < 4) {
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

  const handleAddressLookup = async () => {
    if (data.address.cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${data.address.cep}/json/`);
        const addressData = await response.json();
        
        if (!addressData.erro) {
          setData({
            ...data,
            address: {
              ...data.address,
              street: addressData.logradouro || '',
              neighborhood: addressData.bairro || '',
              city: addressData.localidade || '',
              state: addressData.uf || ''
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleFinish = async () => {
    try {
      if (completeOnboarding) {
        await completeOnboarding(data);
      }
      
      toast({
        title: "Perfil configurado!",
        description: "Bem-vindo ao Contrata AI. Seu perfil foi configurado com sucesso.",
      });
      
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div 
        className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${(currentStep / 4) * 100}%` }}
      ></div>
    </div>
  );

  // Step 1: User Type Selection
  const renderStep1 = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Como você quer usar o Contrata AI?</CardTitle>
        <p className="text-center text-gray-600">
          Escolha o tipo de conta que melhor se adapta ao seu perfil
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => handleUserTypeSelect('freelancer')}
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
                  Quero encontrar trabalhos e oferecer meus serviços
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleUserTypeSelect('contratante')}
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
                  Quero contratar freelancers para projetos
                </p>
              </div>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 2: Person Type Selection (only for contratantes)
  const renderStep2 = () => {
    if (data.userType === 'freelancer') {
      handleNext();
      return null;
    }

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Tipo de pessoa</CardTitle>
          <p className="text-center text-gray-600">
            Você é pessoa física ou jurídica?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => handlePersonTypeSelect('individual')}
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
                    Sou um indivíduo contratando serviços
                  </p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePersonTypeSelect('empresa')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pessoa Jurídica
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Represento uma empresa ou organização
                  </p>
                </div>
              </div>
            </button>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Step 3: Personal Information
  const renderStep3 = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Dados pessoais</CardTitle>
        <p className="text-center text-gray-600">
          Preencha suas informações básicas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Seu nome completo"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cpfCnpj">
            {data.personType === 'empresa' ? 'CNPJ' : 'CPF'}
          </Label>
          <Input
            id="cpfCnpj"
            value={data.cpfCnpj}
            onChange={(e) => setData({ ...data, cpfCnpj: e.target.value })}
            placeholder={data.personType === 'empresa' ? '00.000.000/0000-00' : '000.000.000-00'}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!data.name || !data.cpfCnpj || !data.phone}
          >
            Próximo
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Step 4: Address Information
  const renderStep4 = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Endereço</CardTitle>
        <p className="text-center text-gray-600">
          Informe seu endereço completo
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={data.address.cep}
            onChange={(e) => setData({ 
              ...data, 
              address: { ...data.address, cep: e.target.value }
            })}
            onBlur={handleAddressLookup}
            placeholder="00000-000"
            maxLength={8}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              value={data.address.street}
              onChange={(e) => setData({ 
                ...data, 
                address: { ...data.address, street: e.target.value }
              })}
              placeholder="Nome da rua"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número</Label>
            <Input
              id="number"
              value={data.address.number}
              onChange={(e) => setData({ 
                ...data, 
                address: { ...data.address, number: e.target.value }
              })}
              placeholder="123"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            value={data.address.neighborhood}
            onChange={(e) => setData({ 
              ...data, 
              address: { ...data.address, neighborhood: e.target.value }
            })}
            placeholder="Nome do bairro"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={data.address.city}
              onChange={(e) => setData({ 
                ...data, 
                address: { ...data.address, city: e.target.value }
              })}
              placeholder="Cidade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={data.address.state}
              onChange={(e) => setData({ 
                ...data, 
                address: { ...data.address, state: e.target.value }
              })}
              placeholder="SP"
              maxLength={2}
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Voltar
          </Button>
          <Button 
            onClick={handleFinish}
            disabled={!data.address.cep || !data.address.street || !data.address.city}
          >
            Finalizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurar Perfil</h1>
          <p className="text-gray-600">Etapa {currentStep} de 4</p>
        </div>
        
        {renderProgressBar()}
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
}