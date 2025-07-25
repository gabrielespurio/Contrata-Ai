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
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';

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
function ExplorarVagas() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>('');
  const [workType, setWorkType] = useState<string>('todos');
  
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs']
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  const skills = [
    'Design Gráfico', 'Adobe Illustrator', 'Adobe Photoshop', 'Ilustração',
    'Marketing Digital', 'Redes Sociais', 'SEO', 'WordPress',
    'Desenvolvimento Web', 'React', 'JavaScript', 'Python'
  ];

  const formatTimeAgo = (date: string) => {
    // Placeholder para formatação de tempo
    return 'há 2 horas';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Encontre trabalho</h1>
          <div className="flex gap-4 text-sm">
            <button className="text-blue-600 border-b-2 border-blue-600 pb-2 px-1">
              Encontre projetos
            </button>
            <button className="text-gray-500 pb-2 px-1">
              Projetos com minhas habilidades
            </button>
            <button className="text-gray-500 pb-2 px-1">
              Plano de assinatura
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

            {/* Modalidade de trabalho */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Modalidade de trabalho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button 
                    variant={workType === 'todos' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setWorkType('todos')}
                    className="text-xs"
                  >
                    Todos
                  </Button>
                  <Button 
                    variant={workType === 'fixo' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setWorkType('fixo')}
                    className="text-xs"
                  >
                    Preço fixo
                  </Button>
                  <Button 
                    variant={workType === 'hora' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setWorkType('hora')}
                    className="text-xs"
                  >
                    Por hora
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Idioma */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Idioma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="text-xs">
                    Todos
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    English
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-blue-50 text-blue-600">
                    Português
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  Español
                </Button>
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
                <>
                  {/* Exemplo de vaga destacada baseada no Workana */}
                  <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Editor de Vídeo para TikTok
                              </h3>
                              <p className="text-sm text-gray-600">
                                Publicado: {formatTimeAgo('')} • Propostas: 13 • Prazo de Entrega: 27/01/2025
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            Preciso de um bom editor de vídeo que tenha experiência em edição voltada para rede sociais, 
                            tenho umas fotos e vídeos com uma pessoa querida e quero uma edit para postar no tiktok, pago bem!
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm"><span className="font-medium">Categoria:</span> Design e Multimídia</p>
                            <p className="text-sm"><span className="font-medium">Subcategoria:</span> Outros</p>
                            <p className="text-sm"><span className="font-medium">Tamanho do projeto:</span> Pequeno</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary">Design Gráfico</Badge>
                            <Badge variant="secondary">Adobe Illustrator</Badge>
                            <Badge variant="secondary">Adobe Photoshop</Badge>
                            <Badge variant="secondary">Ilustração</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                M
                              </div>
                              <span>M. F. D. M.</span>
                              <img src="/api/placeholder/16/16" alt="Brasil" className="w-4 h-4" />
                              <span>Brasil</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-gray-300" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-green-600 mb-2">R$ 280 - 600</div>
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            Fazer uma proposta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Segunda vaga exemplo */}
                  <Card className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Projeto de Interiores e Executivo para obra - Espaço Dpx
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Publicado: há 11 horas • Propostas: 9 • Prazo de Entrega: 04/08/2025
                          </p>
                          
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            Preciso inicialmente de um profissional para fazer os projetos executivos de uma obra que já está em andamento.
                            O layout já está definido, preciso dos projetos de: locação dos pontos de iluminação, tomadas, 
                            interruptores. Quadro de esquadrias, cortes esquemáticos e planta de forro.
                          </p>
                          
                          <div className="space-y-1 mb-4">
                            <p className="text-sm"><span className="font-medium">Categoria:</span> Engenharia e Manufatura</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary">Arquitetura</Badge>
                            <Badge variant="secondary">Design de Interiores</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                                T
                              </div>
                              <span>T. D.</span>
                              <img src="/api/placeholder/16/16" alt="Brasil" className="w-4 h-4" />
                              <span>Brasil</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400" />
                              <Star className="h-4 w-4 text-gray-300" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-green-600 mb-2">R$ 280 - 600</div>
                          <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                            Fazer uma proposta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
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