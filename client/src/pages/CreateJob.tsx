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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ArrowLeft, Star } from 'lucide-react';
import { Link } from 'wouter';

const createJobSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres'),
  subcategoryId: z.string().min(1, 'Subcategoria é obrigatória'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
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
      location: '',
      payment: '',
      destaque: false,
    },
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
    mutationFn: (data: CreateJobForm) => 
      apiRequest('POST', '/api/jobs', data),
    onSuccess: () => {
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
      toast({
        title: "Erro ao criar vaga",
        description: error.message || "Não foi possível criar a vaga.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateJobForm) => {
    createJobMutation.mutate(data);
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
                        onValueChange={field.onChange} 
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

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <LocationInput
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
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
