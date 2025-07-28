import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LocationInput } from '@/components/LocationInput';
import { MultiDaySchedule } from '@/components/MultiDaySchedule';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeft, Star } from 'lucide-react';
import { Link } from 'wouter';

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900">Criar Nova Vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Vaga</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Garçom para evento de formatura" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={selectedCategoryId} 
                    onValueChange={(value) => {
                      console.log('🏷️ Categoria selecionada:', value);
                      setSelectedCategoryId(value);
                      form.setValue('subcategoryId', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
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
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          console.log('📂 Subcategoria selecionada:', value);
                          field.onChange(value);
                        }} 
                        value={field.value}
                        disabled={!selectedCategoryId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma subcategoria" />
                          </SelectTrigger>
                        </FormControl>
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
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4}
                        placeholder="Descreva os detalhes da vaga, requisitos e responsabilidades..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seleção do tipo de agendamento */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Tipo de Agendamento</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Escolha se a vaga é para um dia específico ou para múltiplos dias da semana
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${scheduleType === 'simple' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                      onClick={() => setScheduleType('simple')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${scheduleType === 'simple' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                          <div>
                            <h3 className="font-medium">Dia Específico</h3>
                            <p className="text-sm text-gray-600">Trabalho em uma data e horário específicos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${scheduleType === 'multiple' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                      onClick={() => setScheduleType('multiple')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${scheduleType === 'multiple' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`} />
                          <div>
                            <h3 className="font-medium">Múltiplos Dias</h3>
                            <p className="text-sm text-gray-600">Trabalho em vários dias da semana com horários diferentes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Formulário para vaga simples */}
                {scheduleType === 'simple' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Formulário para múltiplos dias */}
                {scheduleType === 'multiple' && (
                  <div>
                    <MultiDaySchedule
                      value={multipleSchedules}
                      onChange={setMultipleSchedules}
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <LocationInput
                        value={field.value}
                        onChange={(value) => {
                          console.log('📍 Localização alterada:', value);
                          field.onChange(value);
                        }}
                        placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="R$ 150,00"
                        value={field.value ? formatCurrency(field.value) : ''}
                        onChange={(e) => {
                          const formatted = formatCurrency(e.target.value);
                          const numericValue = getCurrencyValue(formatted);
                          console.log('💰 Valor alterado:', numericValue);
                          field.onChange(numericValue);
                        }}
                        onBlur={() => {
                          // Garante que o valor final está corretamente formatado
                          if (field.value) {
                            const formatted = formatCurrency(field.value);
                            const numericValue = getCurrencyValue(formatted);
                            field.onChange(numericValue);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destaque"
                render={({ field }) => (
                  <FormItem>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Destacar esta vaga por 7 dias (+R$ 4,99)
                        </FormLabel>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Vagas em destaque aparecem no topo dos resultados e recebem mais candidatos.
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button 
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
                >
                  {createJobMutation.isPending ? 'Publicando...' : 'Publicar Vaga'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
