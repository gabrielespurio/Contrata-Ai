import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Search, 
  BarChart3, 
  User,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Componente para Dashboard Overview
function DashboardOverview() {
  const { user } = useUnifiedAuth();
  
  const statsCards = [
    {
      title: "Candidaturas",
      value: "0",
      icon: Briefcase,
      color: "text-orange-600"
    },
    {
      title: "Aceitas",
      value: "0", 
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Pendentes",
      value: "0",
      icon: Clock,
      color: "text-yellow-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo, {user?.name}</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Search className="h-4 w-4 mr-2" />
          Explorar Vagas
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Candidaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Você ainda não se candidatou a nenhuma vaga.</p>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Explorar Vagas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Explorar Vagas
// Schema de validação para proposta
const proposalSchema = z.object({
  proposedPrice: z.string().min(1, "Valor é obrigatório").refine((val) => {
    const num = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, "Valor deve ser um número válido maior que 0"),
  proposalDescription: z.string().min(20, "Descrição deve ter pelo menos 20 caracteres"),
});

function ExplorarVagas() {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs']
  });

  const form = useForm<z.infer<typeof proposalSchema>>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      proposedPrice: '',
      proposalDescription: '',
    },
  });

  // Mutation para fazer candidatura
  const applyMutation = useMutation({
    mutationFn: (proposalData: { 
      jobId: string; 
      proposedPrice: string; 
      proposalDescription: string; 
    }) => apiRequest('POST', '/api/applications', proposalData),
    onSuccess: () => {
      toast({
        title: "Proposta enviada!",
        description: "Sua proposta foi enviada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      setIsProposalModalOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar proposta",
        description: error.message || "Não foi possível enviar sua proposta.",
        variant: "destructive",
      });
    },
  });

  const handleOpenProposalModal = (job: any) => {
    if (user?.type === 'freelancer') {
      setSelectedJob(job);
      setIsProposalModalOpen(true);
    }
  };

  const handleSubmitProposal = (values: z.infer<typeof proposalSchema>) => {
    if (selectedJob) {
      // Remove formatação do valor antes de enviar
      const cleanPrice = values.proposedPrice.replace(/[^\d,]/g, '').replace(',', '.');
      
      applyMutation.mutate({
        jobId: selectedJob.id,
        proposedPrice: cleanPrice,
        proposalDescription: values.proposalDescription,
      });
    }
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Converte para número e formata
    const numericValue = parseInt(cleanValue) / 100;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue || 0);
  };

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  const skills = [
    'Design Gráfico', 'Adobe Illustrator', 'Adobe Photoshop', 'Ilustração',
    'Marketing Digital', 'Redes Sociais', 'SEO', 'WordPress',
    'Desenvolvimento Web', 'React', 'JavaScript', 'Python'
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Encontre trabalho</h1>
          <div className="flex gap-4 text-sm">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 px-1">
              Encontre serviços
            </button>
            <button className="text-gray-500 pb-2 px-1">
              Meus clientes favoritos
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filtros */}
          <div className="w-80 space-y-6">
            {/* Categoria */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Categoria de projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedCategory === ''}
                    onChange={() => setSelectedCategory('')}
                    className="rounded border-gray-300" 
                  />
                  <span className="text-sm text-blue-600">Todas as categorias</span>
                </label>
                {(categories as any[]).slice(0, 8).map((category: any) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="rounded border-gray-300" 
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Habilidades */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Habilidades</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  placeholder="Informe as habilidades que você possui"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="mt-3 space-y-2">
                  {skills.slice(0, 6).map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, skill]);
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Vagas */}
            <div className="space-y-4">
              {(jobs as any[]).length === 0 ? (
                <Card className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma vaga disponível no momento.</p>
                </Card>
              ) : (
                (jobs as any[]).map((job: any, index: number) => (
                  <Card 
                    key={job.id} 
                    className={`${job.destaque ? 'border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50' : 'border border-gray-200 hover:shadow-md'} transition-shadow`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Publicado: há {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias • 
                                Data: {new Date(job.date).toLocaleDateString('pt-BR')} • 
                                Horário: {job.time}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {job.description}
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm"><span className="font-medium">Categoria:</span> {job.subcategory.category.name}</p>
                            <p className="text-sm"><span className="font-medium">Subcategoria:</span> {job.subcategory.name}</p>
                            <p className="text-sm"><span className="font-medium">Local:</span> {job.location}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                {job.client.name.charAt(0)}
                              </div>
                              <span>{job.client.name}</span>
                              <span>• {job.client.city}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            R$ {parseFloat(job.payment).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                          <Button 
                            onClick={() => handleOpenProposalModal(job)}
                            className={job.destaque ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-purple-600 text-purple-600 hover:bg-purple-50"}
                            variant={job.destaque ? "default" : "outline"}
                          >
                            Fazer uma proposta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de Proposta */}
        <Dialog open={isProposalModalOpen} onOpenChange={setIsProposalModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Enviar Proposta</DialogTitle>
              {selectedJob && (
                <div className="text-sm text-gray-600">
                  <p><strong>Vaga:</strong> {selectedJob.title}</p>
                  <p><strong>Valor da vaga:</strong> R$ {parseFloat(selectedJob.payment).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
                </div>
              )}
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitProposal)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="proposedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da sua proposta *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="R$ 0,00"
                          onChange={(e) => {
                            const formatted = formatCurrency(e.target.value);
                            field.onChange(formatted);
                          }}
                          className="text-lg font-semibold text-green-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="proposalDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da proposta *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva como você pode ajudar com este projeto. Inclua sua experiência relevante, abordagem e qualquer diferencial que você oferece..."
                          className="min-h-[120px]"
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {field.value?.length || 0}/500 caracteres (mínimo 20)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProposalModalOpen(false)}
                    disabled={applyMutation.isPending}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={applyMutation.isPending}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {applyMutation.isPending ? 'Enviando...' : 'Enviar Proposta'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Componente para Analytics
function Analytics() {
  const analyticsData = [
    { label: "Candidaturas Enviadas", value: 0, trend: "+0%" },
    { label: "Taxa de Aceitação", value: "0%", trend: "+0%" },
    { label: "Projetos Concluídos", value: 0, trend: "+0%" },
    { label: "Avaliação Média", value: "0.0", trend: "+0%" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600">Acompanhe seu desempenho e estatísticas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {metric.trend}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Candidaturas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Dados de analytics aparecerão aqui conforme você usar a plataforma</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Catálogo de Serviços
function CatalogoServicos() {
  const { user } = useUnifiedAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meu Catálogo de Serviços</h2>
          <p className="text-gray-600">Configure seu perfil para atrair contratantes</p>
        </div>
        <Button>
          <Eye className="h-4 w-4 mr-2" />
          Visualizar Perfil
        </Button>
      </div>

      {/* Perfil Básico */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user?.name}</h3>
              <p className="text-gray-600">{user?.city}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">0.0 (0 avaliações)</span>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                Editar Perfil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços Oferecidos */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Oferecidos</CardTitle>
          <CardDescription>Adicione os serviços que você oferece</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Você ainda não adicionou nenhum serviço</p>
            <Button>
              Adicionar Serviço
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>Mostre seus trabalhos anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Adicione projetos ao seu portfolio</p>
            <Button variant="outline">
              Adicionar Projeto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FreelancerDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="explorar">Explorar Vagas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="catalogo">Meu Catálogo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <DashboardOverview />
        </TabsContent>
        
        <TabsContent value="explorar" className="mt-6">
          <ExplorarVagas />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Analytics />
        </TabsContent>
        
        <TabsContent value="catalogo" className="mt-6">
          <CatalogoServicos />
        </TabsContent>
      </Tabs>
    </div>
  );
}