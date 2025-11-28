import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { Plus, Briefcase, Users, CheckCircle, Search, BarChart3, TrendingUp, Calendar, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobCard } from '@/components/JobCard';

export function ContractorDashboard() {
  const { user } = useUnifiedAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs/my/jobs'],
    enabled: !!user && user.type === 'contratante',
    staleTime: 0,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (!user) return null;

  // Garantir que os dados sejam arrays
  const jobsArray = Array.isArray(jobs) ? jobs : [];
  const categoriesArray = Array.isArray(categories) ? categories : [];
  const statsData = stats || {};

  // Filtrar vagas por categoria e termo de busca
  const filteredJobs = jobsArray.filter((job: any) => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || job.subcategory?.category?.id === selectedCategory;
    const matchesSearch = !searchTerm || job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Paginação
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  // Reset página quando filtros mudam
  const resetPage = () => {
    if (currentPage > 1) setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">Plano:</span>
            <span className="font-semibold text-primary ml-2">
              {user.premium ? 'Premium' : 'Gratuito'}
            </span>
          </div>
          <Link href="/criar-vaga">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Vaga
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="minhas-vagas">Minhas Vagas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : (statsData as any)?.activeJobs || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Candidatos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : (statsData as any)?.totalApplicants || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Contratações</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : (statsData as any)?.completedJobs || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Suas Vagas</h2>
              {jobsArray.length > 3 && (
                <span className="text-sm text-gray-500">Mostrando 3 de {jobsArray.length}</span>
              )}
            </div>
            {jobsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando vagas...</p>
              </div>
            ) : jobsArray.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobsArray.slice(0, 3).map((job: any) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    showApplyButton={false}
                    showEditButton={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Você ainda não criou nenhuma vaga.</p>
                  <Link href="/criar-vaga">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Vaga
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Minhas Vagas Tab */}
        <TabsContent value="minhas-vagas" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar vagas..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        resetPage();
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  resetPage();
                }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categoriesArray.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Jobs List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  Suas Vagas ({filteredJobs.length})
                </CardTitle>
                <CardDescription>
                  {filteredJobs.length > 0 && (
                    `Exibindo ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredJobs.length)} de ${filteredJobs.length} vagas`
                  )}
                </CardDescription>
              </div>
              <Link href="/criar-vaga">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Vaga
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Carregando vagas...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <>
                  {/* Jobs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                    {paginatedJobs.map((job: any) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        showApplyButton={false}
                        showEditButton={true}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Anterior
                        </Button>
                        <div className="flex space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => 
                              page === 1 || 
                              page === totalPages || 
                              Math.abs(page - currentPage) <= 1
                            )
                            .map((page, index, arr) => (
                              <React.Fragment key={page}>
                                {index > 0 && arr[index - 1] !== page - 1 && (
                                  <span className="px-2 py-1 text-sm text-gray-400">...</span>
                                )}
                                <Button 
                                  variant={currentPage === page ? "default" : "outline"} 
                                  size="sm" 
                                  className="w-8 h-8 p-0"
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </Button>
                              </React.Fragment>
                            ))
                          }
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Próxima
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {(selectedCategory && selectedCategory !== 'all') || searchTerm 
                      ? 'Nenhuma vaga encontrada' 
                      : 'Nenhuma vaga criada'
                    }
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {(selectedCategory && selectedCategory !== 'all') || searchTerm 
                      ? 'Tente ajustar os filtros ou limpe a busca para ver mais resultados.' 
                      : 'Comece criando sua primeira vaga para encontrar freelancers qualificados.'
                    }
                  </p>
                  {(!selectedCategory || selectedCategory === 'all') && !searchTerm && (
                    <Link href="/criar-vaga">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeira Vaga
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Main Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : `${Math.round((((statsData as any)?.completedJobs || 0) / Math.max((statsData as any)?.activeJobs || 1, 1)) * 100)}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Média Candidatos/Vaga</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : Math.round(((statsData as any)?.totalApplicants || 0) / Math.max((statsData as any)?.activeJobs || 1, 1))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vagas Este Mês</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : (statsData as any)?.activeJobs || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Taxa Sucesso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : `${Math.round((((statsData as any)?.completedJobs || 0) / Math.max((statsData as any)?.totalApplicants || 1, 1)) * 100)}%`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho das Vagas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Vagas Publicadas</p>
                      <p className="text-2xl font-bold text-gray-900">{(statsData as any)?.activeJobs || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Este mês</p>
                      <p className="text-lg font-semibold text-green-600">+{(statsData as any)?.activeJobs || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Candidaturas Recebidas</p>
                      <p className="text-2xl font-bold text-gray-900">{(statsData as any)?.totalApplicants || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-lg font-semibold text-blue-600">{(statsData as any)?.totalApplicants || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categorias Mais Utilizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoriesArray.slice(0, 5).map((category: any, index: number) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-primary rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}