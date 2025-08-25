import { useState } from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  ElegantForm,
  FormSection,
  FormRow,
  FormField,
  ElegantInput,
  ElegantSelect,
  ElegantSelectTrigger,
  ElegantTextarea,
  ElegantRadioGroup,
  ElegantRadioItem,
  PhotoUpload,
  FormActions,
  ElegantButton,
  StepIndicator
} from '@/components/ui/elegant-form';
import { SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const steps = ['Detalhes Básicos', 'Informações de Contato', 'Verificação'];

export default function ElegantRegister() {
  const [, setLocation] = useLocation();
  const { signUp } = useUnifiedAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    fullName: '',
    constituency: '',
    partyType: '',
    position: '',
    dateOfBirth: '',
    gender: '',
    visionMission: '',
    
    // Step 2: Contact Details
    email: '',
    phone: '',
    address: '',
    city: '',
    
    // Step 3: Verification
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (file: File) => {
    // Simular upload de foto
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await signUp({
        name: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Contrata AI"
      });
      
      setLocation('/profile-setup');
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName && formData.constituency && formData.gender;
      case 1:
        return formData.email && formData.phone && formData.city;
      case 2:
        return formData.password && formData.confirmPassword && 
               formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  return (
    <ElegantForm 
      title="Criar Conta" 
      subtitle="Junte-se à maior plataforma de freelancers do Brasil"
    >
      <div className="mb-6 text-right">
        <span className="text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button 
            onClick={() => setLocation('/login')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Entrar
          </button>
        </span>
      </div>

      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Step 1: Basic Details */}
      {currentStep === 0 && (
        <FormSection title="Detalhes Básicos">
          <FormRow>
            <FormField label="Nome Completo" required>
              <ElegantInput
                placeholder="Digite seu nome completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                data-testid="input-fullname"
              />
            </FormField>
            
            <PhotoUpload 
              label="Adicionar Foto"
              onUpload={handlePhotoUpload}
              currentPhoto={profilePhoto}
            />
          </FormRow>

          <FormField label="Área de Atuação" required>
            <ElegantSelect onValueChange={(value) => handleInputChange('constituency', value)}>
              <ElegantSelectTrigger data-testid="select-constituency">
                <SelectValue placeholder="Selecione sua área de atuação" />
              </ElegantSelectTrigger>
              <SelectContent>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="juridico">Jurídico</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </ElegantSelect>
          </FormField>

          <FormRow>
            <FormField label="Tipo de Trabalho">
              <ElegantSelect onValueChange={(value) => handleInputChange('partyType', value)}>
                <ElegantSelectTrigger data-testid="select-party-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </ElegantSelectTrigger>
                <SelectContent>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="contratante">Contratante</SelectItem>
                </SelectContent>
              </ElegantSelect>
            </FormField>

            <FormField label="Posição/Cargo">
              <ElegantSelect onValueChange={(value) => handleInputChange('position', value)}>
                <ElegantSelectTrigger data-testid="select-position">
                  <SelectValue placeholder="Selecione sua posição" />
                </ElegantSelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Júnior</SelectItem>
                  <SelectItem value="pleno">Pleno</SelectItem>
                  <SelectItem value="senior">Sênior</SelectItem>
                  <SelectItem value="lead">Tech Lead</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                </SelectContent>
              </ElegantSelect>
            </FormField>
          </FormRow>

          <FormRow>
            <FormField label="Data de Nascimento">
              <ElegantInput
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                data-testid="input-birth-date"
              />
            </FormField>

            <FormField label="Gênero" required>
              <ElegantRadioGroup
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <ElegantRadioItem value="male" label="Masculino" />
                <ElegantRadioItem value="female" label="Feminino" />
              </ElegantRadioGroup>
            </FormField>
          </FormRow>

          <FormField label="Visão & Missão">
            <ElegantTextarea
              placeholder="Descreva sua visão profissional e objetivos..."
              value={formData.visionMission}
              onChange={(e) => handleInputChange('visionMission', e.target.value)}
              data-testid="textarea-vision"
            />
          </FormField>
        </FormSection>
      )}

      {/* Step 2: Contact Details */}
      {currentStep === 1 && (
        <FormSection title="Informações de Contato">
          <FormRow>
            <FormField label="Email" required>
              <ElegantInput
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                data-testid="input-email"
              />
            </FormField>

            <FormField label="Telefone" required>
              <ElegantInput
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                data-testid="input-phone"
              />
            </FormField>
          </FormRow>

          <FormField label="Endereço">
            <ElegantTextarea
              placeholder="Digite seu endereço completo..."
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              data-testid="textarea-address"
            />
          </FormField>

          <FormField label="Cidade" required>
            <ElegantSelect onValueChange={(value) => handleInputChange('city', value)}>
              <ElegantSelectTrigger data-testid="select-city">
                <SelectValue placeholder="Selecione sua cidade" />
              </ElegantSelectTrigger>
              <SelectContent>
                <SelectItem value="sao-paulo">São Paulo</SelectItem>
                <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
                <SelectItem value="brasilia">Brasília</SelectItem>
                <SelectItem value="salvador">Salvador</SelectItem>
                <SelectItem value="curitiba">Curitiba</SelectItem>
                <SelectItem value="porto-alegre">Porto Alegre</SelectItem>
                <SelectItem value="recife">Recife</SelectItem>
              </SelectContent>
            </ElegantSelect>
          </FormField>
        </FormSection>
      )}

      {/* Step 3: Verification */}
      {currentStep === 2 && (
        <FormSection title="Verificação">
          <FormRow>
            <FormField label="Senha" required>
              <ElegantInput
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                data-testid="input-password"
              />
            </FormField>

            <FormField label="Confirmar Senha" required>
              <ElegantInput
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                data-testid="input-confirm-password"
              />
            </FormField>
          </FormRow>

          {formData.password !== formData.confirmPassword && formData.confirmPassword && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">As senhas não coincidem</p>
            </div>
          )}

          <Card className="p-4 bg-orange-50 border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Resumo da Conta</h4>
            <div className="space-y-1 text-sm text-orange-700">
              <p><strong>Nome:</strong> {formData.fullName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Cidade:</strong> {formData.city}</p>
              <p><strong>Área:</strong> {formData.constituency}</p>
            </div>
          </Card>
        </FormSection>
      )}

      <FormActions>
        {currentStep > 0 && (
          <ElegantButton
            variant="outline"
            onClick={handleBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </ElegantButton>
        )}
        
        {currentStep < steps.length - 1 ? (
          <ElegantButton
            onClick={handleNext}
            disabled={!isStepValid()}
            data-testid="button-next"
          >
            Próximo
          </ElegantButton>
        ) : (
          <ElegantButton
            onClick={handleSubmit}
            disabled={!isStepValid() || isLoading}
            data-testid="button-submit"
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </ElegantButton>
        )}
      </FormActions>
    </ElegantForm>
  );
}