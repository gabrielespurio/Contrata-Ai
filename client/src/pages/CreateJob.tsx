import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ElegantForm,
  FormSection,
  FormRow,
  FormField as ElegantFormField,
  ElegantInput,
  ElegantSelect,
  ElegantSelectTrigger,
  ElegantTextarea,
  ElegantRadioGroup,
  ElegantRadioItem,
  FormActions,
  ElegantButton
} from '@/components/ui/elegant-form';
import { LocationInput } from '@/components/LocationInput';
import { MultiDaySchedule } from '@/components/MultiDaySchedule';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeft, Star } from 'lucide-react';
import { Link } from 'wouter';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Interface para horários múltiplos
interface DaySchedule {
  day: string;
  dayName: string;
  startTime: string;
  endTime: string;
}

// Schema simplificado sem validação condicional complexa
const createJobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  subcategoryId: z.string().min(1, 'Subcategoria é obrigatória'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  date: z.string().optional(),
  time: z.string().optional(), 
  schedules: z.array(z.object({
    day: z.string(),
    dayName: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).optional(),
  location: z.string().min(5, 'Localização é obrigatória'),
  payment: z.string().min(1, 'Valor é obrigatório'),
  destaque: z.boolean().default(false),
});

type CreateJobForm = z.infer<typeof createJobSchema>;

export default function CreateJob() {
  const { user } = useUnifiedAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [scheduleType, setScheduleType] = useState<'simple' | 'multiple'>('simple');
  const [multipleSchedules, setMultipleSchedules] = useState<DaySchedule[]>([]);

  // Função para formatar valor em reais
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se não tem números, retorna vazio
    if (!numbers) return '';
    
    // Converte para number e divide por 100 para ter centavos
    const amount = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Função para obter valor numérico da string formatada
  const getCurrencyValue = (formattedValue: string): string => {
    // Remove símbolos de moeda e espaços, mantém apenas números e vírgula
    const numbers = formattedValue.replace(/[^\d,]/g, '');
    // Converte vírgula para ponto para compatibilidade com number
    return numbers.replace(',', '.');
  };

  const form = useForm<CreateJobForm>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      subcategoryId: '',
      description: '',
      date: '',
      time: '',
      schedules: [],
      location: '',
      payment: '',
      destaque: false,
    },
    mode: 'onChange', // Permite validação em tempo real
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['/api/subcategories', selectedCategoryId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategoryId) params.append('categoryId', selectedCategoryId);
      return fetch(`/api/subcategories?${params.toString()}`).then(res => res.json());
    },
    enabled: !!selectedCategoryId,
  });

  const createJobMutation = useMutation({
    mutationFn: (data: CreateJobForm) => {
      console.log('🌐 Enviando requisição para API:', data);
      return apiRequest('POST', '/api/jobs', data);
    },
    onSuccess: (response) => {
      console.log('✅ Sucesso na criação da vaga:', response);
      toast({
        title: "Vaga criada com sucesso!",
        description: "Sua vaga foi publicada e está disponível para candidatos.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/my/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      console.log('❌ Erro na criação da vaga:', error);
      toast({
        title: "Erro ao criar vaga",
        description: error.message || "Não foi possível criar a vaga.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateJobForm) => {
    console.log('🚀 Função onSubmit chamada!');
    console.log('📝 Dados do formulário:', data);
    console.log('⏰ Tipo de agendamento:', scheduleType);
    console.log('📅 Horários múltiplos:', multipleSchedules);
    console.log('❌ Erros do formulário:', form.formState.errors);
    console.log('✅ Formulário válido?', form.formState.isValid);
    
    // Prepara os dados baseado no tipo de agendamento
    let submitData;
    if (scheduleType === 'multiple') {
      // Para múltiplos dias, usa schedules e remove date/time
      submitData = {
        ...data,
        schedules: multipleSchedules,
        date: undefined,
        time: undefined
      };
    } else {
      // Para dia simples, garante que date/time estão preenchidos
      if (!data.date || !data.time) {
        toast({
          title: "Campos obrigatórios",
          description: "Para vaga de dia específico, preencha data e horário.",
          variant: "destructive",
        });
        return;
      }
      submitData = {
        ...data,
        schedules: undefined
      };
    }
    
    console.log('📤 Dados finais para envio:', submitData);
    console.log('🔄 Iniciando mutação...');
    createJobMutation.mutate(submitData);
  };

  if (!user || user.type !== 'contratante') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Apenas contratantes podem criar vagas.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ElegantForm 
      title="Criar Nova Vaga" 
      subtitle="Publique sua vaga e encontre o profissional perfeito"
    >
      <div className="mb-6">
        <Link href="/dashboard">
          <ElegantButton variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </ElegantButton>
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormSection title="Informações Básicas">
            <ElegantFormField label="Título da Vaga" required>
              <ElegantInput
                placeholder="Ex: Garçom para evento de formatura"
                value={form.watch('title')}
                onChange={(e) => form.setValue('title', e.target.value)}
                data-testid="input-job-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </ElegantFormField>

            <FormRow>
              <ElegantFormField label="Categoria" required>
                <ElegantSelect 
                  value={selectedCategoryId} 
                  onValueChange={(value) => {
                    console.log('🏷️ Categoria selecionada:', value);
                    setSelectedCategoryId(value);
                    form.setValue('subcategoryId', '');
                  }}
                >
                  <ElegantSelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </ElegantSelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <div className="p-2 text-sm text-gray-500">Carregando categorias...</div>
                    ) : (
                      Array.isArray(categories) && categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </ElegantSelect>
              </ElegantFormField>

              <ElegantFormField label="Subcategoria" required>
                <ElegantSelect 
                  onValueChange={(value) => {
                    console.log('📂 Subcategoria selecionada:', value);
                    form.setValue('subcategoryId', value);
                  }} 
                  value={form.watch('subcategoryId')}
                  disabled={!selectedCategoryId}
                >
                  <ElegantSelectTrigger data-testid="select-subcategory">
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </ElegantSelectTrigger>
                  <SelectContent>
                    {subcategoriesLoading ? (
                      <div className="p-2 text-sm text-gray-500">Carregando subcategorias...</div>
                    ) : selectedCategoryId ? (
                      Array.isArray(subcategories) && subcategories.map((subcategory: any) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-gray-500">Selecione uma categoria primeiro</div>
                    )}
                  </SelectContent>
                </ElegantSelect>
                {form.formState.errors.subcategoryId && (
                  <p className="text-sm text-red-500">{form.formState.errors.subcategoryId.message}</p>
                )}
              </ElegantFormField>
            </FormRow>

            <ElegantFormField label="Descrição" required>
              <ElegantTextarea
                placeholder="Descreva os detalhes da vaga, requisitos e responsabilidades..."
                value={form.watch('description')}
                onChange={(e) => form.setValue('description', e.target.value)}
                data-testid="textarea-description"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
              )}
            </ElegantFormField>
          </FormSection>

          <FormSection title="Agendamento">
            <ElegantFormField label="Tipo de Agendamento" required>
              <p className="text-sm text-gray-600 mb-3">
                Escolha se a vaga é para um dia específico ou para múltiplos dias da semana
              </p>
              <ElegantRadioGroup
                value={scheduleType}
                onValueChange={(value) => setScheduleType(value as 'simple' | 'multiple')}
              >
                <ElegantRadioItem 
                  value="simple" 
                  label="Dia Específico - Trabalho em uma data e horário específicos" 
                />
                <ElegantRadioItem 
                  value="multiple" 
                  label="Múltiplos Dias - Trabalho em vários dias da semana com horários diferentes" 
                />
              </ElegantRadioGroup>
            </ElegantFormField>

            {scheduleType === 'simple' && (
              <FormRow>
                <ElegantFormField label="Data" required>
                  <ElegantInput
                    type="date"
                    value={form.watch('date')}
                    onChange={(e) => form.setValue('date', e.target.value)}
                    data-testid="input-date"
                  />
                  {form.formState.errors.date && (
                    <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                  )}
                </ElegantFormField>

                <ElegantFormField label="Horário" required>
                  <ElegantInput
                    type="time"
                    value={form.watch('time')}
                    onChange={(e) => form.setValue('time', e.target.value)}
                    data-testid="input-time"
                  />
                  {form.formState.errors.time && (
                    <p className="text-sm text-red-500">{form.formState.errors.time.message}</p>
                  )}
                </ElegantFormField>
              </FormRow>
            )}

            {scheduleType === 'multiple' && (
              <div>
                <MultiDaySchedule
                  value={multipleSchedules}
                  onChange={setMultipleSchedules}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="Localização e Pagamento">
            <ElegantFormField label="Localização" required>
              <LocationInput
                value={form.watch('location')}
                onChange={(value) => {
                  console.log('📍 Localização alterada:', value);
                  form.setValue('location', value);
                }}
                placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
              )}
            </ElegantFormField>

            <ElegantFormField label="Valor (R$)" required>
              <ElegantInput
                type="text" 
                placeholder="R$ 150,00"
                value={form.watch('payment') ? formatCurrency(form.watch('payment')) : ''}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  const numericValue = getCurrencyValue(formatted);
                  console.log('💰 Valor alterado:', numericValue);
                  form.setValue('payment', numericValue);
                }}
                onBlur={() => {
                  const currentValue = form.watch('payment');
                  if (currentValue) {
                    const formatted = formatCurrency(currentValue);
                    const numericValue = getCurrencyValue(formatted);
                    form.setValue('payment', numericValue);
                  }
                }}
                data-testid="input-payment"
              />
              {form.formState.errors.payment && (
                <p className="text-sm text-red-500">{form.formState.errors.payment.message}</p>
              )}
            </ElegantFormField>
          </FormSection>

          <FormSection title="Opções Avançadas">
            <Card className="p-4 bg-yellow-50 border-orange-200">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={form.watch('destaque')}
                  onCheckedChange={(checked) => form.setValue('destaque', !!checked)}
                  className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label className="text-sm font-medium text-gray-700">
                  Destacar esta vaga por 7 dias (+R$ 4,99)
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Vagas em destaque aparecem no topo dos resultados e recebem mais candidatos.
              </p>
            </Card>
          </FormSection>

          <FormActions>
            <Link href="/dashboard">
              <ElegantButton type="button" variant="outline">
                Cancelar
              </ElegantButton>
            </Link>
            <ElegantButton 
              type="submit" 
              disabled={createJobMutation.isPending}
              onClick={async (e) => {
                e.preventDefault();
                console.log('🔥 BOTÃO CLICADO!');
                
                const formValues = form.getValues();
                console.log('📝 Valores do formulário:', formValues);
                console.log('⏰ Tipo de agendamento:', scheduleType);
                
                // Validação manual customizada
                const errors: any = {};
                
                if (!formValues.title || formValues.title.length < 5) {
                  errors.title = 'Título deve ter pelo menos 5 caracteres';
                }
                
                if (!formValues.subcategoryId) {
                  errors.subcategoryId = 'Subcategoria é obrigatória';
                }
                
                if (!formValues.description || formValues.description.length < 20) {
                  errors.description = 'Descrição deve ter pelo menos 20 caracteres';
                }
                
                if (!formValues.location || formValues.location.length < 5) {
                  errors.location = 'Localização é obrigatória';
                }
                
                if (!formValues.payment) {
                  errors.payment = 'Valor é obrigatório';
                }
                
                // Validação de agendamento
                if (scheduleType === 'simple') {
                  if (!formValues.date || !formValues.time) {
                    errors.date = 'Data e horário são obrigatórios para vaga específica';
                  }
                } else if (scheduleType === 'multiple') {
                  if (!multipleSchedules || multipleSchedules.length === 0) {
                    errors.schedules = 'Configure pelo menos um horário para múltiplos dias';
                  }
                }
                
                console.log('❌ Erros encontrados:', errors);
                
                if (Object.keys(errors).length > 0) {
                  // Mostra erros específicos
                  Object.keys(errors).forEach(field => {
                    form.setError(field as any, { message: errors[field] });
                  });
                  
                  toast({
                    title: "Formulário incompleto",
                    description: "Verifique os campos destacados em vermelho.",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Se passou na validação, chama onSubmit
                console.log('✅ Validação passou, chamando onSubmit');
                onSubmit(formValues);
              }}
              data-testid="button-submit"
            >
              {createJobMutation.isPending ? 'Publicando...' : 'Publicar Vaga'}
            </ElegantButton>
          </FormActions>
        </form>
      </Form>
    </ElegantForm>
  );
}
