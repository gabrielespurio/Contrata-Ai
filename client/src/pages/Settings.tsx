import { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  User, 
  Crown, 
  Star, 
  CreditCard, 
  Settings as SettingsIcon,
  CheckCircle,
  Zap
} from 'lucide-react';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  city: z.string().min(1, 'Cidade é obrigatória'),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

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

export default function Settings() {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'premium' | 'highlights'>('profile');

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      city: user?.city || '',
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileForm) => 
      apiRequest('PATCH', '/api/users/profile', data),
    onSuccess: () => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    },
  });

  const upgradePremiumMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/users/upgrade', { plan: 'premium' }),
    onSuccess: () => {
      toast({
        title: "Upgrade realizado!",
        description: "Você agora tem acesso aos recursos premium.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no upgrade",
        description: error.message || "Não foi possível fazer o upgrade.",
        variant: "destructive",
      });
    },
  });

  const purchaseHighlightMutation = useMutation({
    mutationFn: (data: { type: 'profile' | 'job'; targetId?: string }) =>
      apiRequest('POST', '/api/users/highlight', data),
    onSuccess: (_, variables) => {
      toast({
        title: "Destaque ativado!",
        description: `Seu ${variables.type === 'profile' ? 'perfil' : 'vaga'} está em destaque por 7 dias.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao ativar destaque",
        description: error.message || "Não foi possível ativar o destaque.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handlePremiumUpgrade = () => {
    upgradePremiumMutation.mutate();
  };

  const handleProfileHighlight = () => {
    purchaseHighlightMutation.mutate({ type: 'profile' });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600">Você precisa estar logado para acessar as configurações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie seu perfil e configurações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4 mr-3" />
                  Perfil
                </button>
                <button
                  onClick={() => setActiveTab('premium')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'premium' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Crown className="w-4 h-4 mr-3" />
                  Premium
                </button>
                <button
                  onClick={() => setActiveTab('highlights')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'highlights' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-4 h-4 mr-3" />
                  Destaques
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.type === 'contratante' ? 'default' : 'secondary'}>
                          {user.type === 'contratante' ? 'Contratante' : 'Freelancer'}
                        </Badge>
                        {user.premium && (
                          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
                        )}
                        {user.destaque && (
                          <Badge className="bg-accent/10 text-accent">Em Destaque</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione sua cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'premium' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Plano Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Plan */}
                  <div className="p-6 border rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Plano Atual</h3>
                    <div className="text-2xl font-bold mb-4">
                      {user.premium ? 'Premium' : 'Gratuito'}
                    </div>
                    <ul className="space-y-2 text-sm">
                      {user.premium ? (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Vagas ilimitadas
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Suporte prioritário
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            Estatísticas avançadas
                          </li>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Premium Plan */}
                  {!user.premium && (
                    <div className="p-6 border-2 border-primary rounded-lg relative">
                      <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                        Recomendado
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Premium</h3>
                      <div className="text-2xl font-bold mb-4">
                        R$ 19,90<span className="text-sm font-normal">/mês</span>
                      </div>
                      <ul className="space-y-2 text-sm mb-6">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Vagas ilimitadas
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Suporte prioritário
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Estatísticas avançadas
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Sem limitações
                        </li>
                      </ul>
                      <Button 
                        onClick={handlePremiumUpgrade}
                        disabled={upgradePremiumMutation.isPending}
                        className="w-full"
                      >
                        {upgradePremiumMutation.isPending ? 'Processando...' : 'Assinar Premium'}
                      </Button>
                    </div>
                  )}
                </div>

                {user.premium && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="font-medium text-green-800">
                        Você já tem o plano Premium ativo!
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Aproveite todos os benefícios do plano premium.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'highlights' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Destaques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {user.type === 'freelancer' && (
                    <div className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Destacar Perfil</h3>
                          <p className="text-gray-600">Seu perfil fica em destaque para contratantes</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">R$ 2,99</div>
                          <div className="text-sm text-gray-500">por 7 dias</div>
                        </div>
                      </div>
                      
                      {user.destaque ? (
                        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 text-accent mr-2" />
                            <span className="font-medium text-accent">
                              Seu perfil está em destaque!
                            </span>
                          </div>
                          <p className="text-sm text-accent/80 mt-1">
                            Seu perfil aparece em destaque para contratantes por mais alguns dias.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <ul className="space-y-2 text-sm mb-4">
                            <li className="flex items-center">
                              <Zap className="w-4 h-4 text-accent mr-2" />
                              Aparece no topo da lista de candidatos
                            </li>
                            <li className="flex items-center">
                              <Zap className="w-4 h-4 text-accent mr-2" />
                              Maior visibilidade para contratantes
                            </li>
                            <li className="flex items-center">
                              <Zap className="w-4 h-4 text-accent mr-2" />
                              Mais chances de ser selecionado
                            </li>
                          </ul>
                          <Button 
                            onClick={handleProfileHighlight}
                            disabled={purchaseHighlightMutation.isPending}
                            className="w-full"
                          >
                            {purchaseHighlightMutation.isPending ? 'Processando...' : 'Destacar Perfil'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {user.type === 'contratante' && (
                    <div className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Destacar Vagas</h3>
                          <p className="text-gray-600">Suas vagas aparecem no topo dos resultados</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-accent">R$ 4,99</div>
                          <div className="text-sm text-gray-500">por vaga, 7 dias</div>
                        </div>
                      </div>
                      
                      <ul className="space-y-2 text-sm mb-4">
                        <li className="flex items-center">
                          <Zap className="w-4 h-4 text-accent mr-2" />
                          Vaga aparece no topo dos resultados
                        </li>
                        <li className="flex items-center">
                          <Zap className="w-4 h-4 text-accent mr-2" />
                          Maior visibilidade para freelancers
                        </li>
                        <li className="flex items-center">
                          <Zap className="w-4 h-4 text-accent mr-2" />
                          Mais candidaturas qualificadas
                        </li>
                      </ul>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Você pode destacar vagas individuais ao criá-las ou editá-las.
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="font-medium text-blue-800">
                        Pagamento Simulado
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                      Este é um MVP. Os pagamentos são simulados e os destaques são ativados imediatamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
