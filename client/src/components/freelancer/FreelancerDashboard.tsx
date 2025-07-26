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
  
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs']
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories']
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Explorar Vagas</h2>
          <p className="text-gray-600">Encontre as melhores oportunidades para você</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedCategory === '' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              Todas as categorias
            </Button>
            {(categories as any[]).map((category: any) => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vagas */}
      <div className="grid gap-4">
        {(jobs as any[]).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma vaga disponível no momento.</p>
            </CardContent>
          </Card>
        ) : (
          (jobs as any[]).map((job: any) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {job.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">R$ {job.payment}</p>
                    <Button size="sm" className="mt-2">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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