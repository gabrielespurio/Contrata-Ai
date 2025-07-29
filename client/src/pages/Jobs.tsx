import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { Search, MapPin, Calendar, DollarSign, Briefcase, Clock, User } from 'lucide-react';
import { LocationDisplay } from '@/components/LocationDisplay';

export default function Jobs() {
  const { user } = useUnifiedAuth();
  const [filters, setFilters] = useState({
    city: '',
    categoryId: '',
    subcategoryId: '',
    date: '',
  });

  // Verificar se é contratante para personalizar a interface
  const isContractor = user?.type === 'contratante';
  const jobsQueryKey = isContractor ? ['/api/jobs/my/jobs'] : ['/api/jobs', filters];

  const { data: jobs, isLoading } = useQuery({
    queryKey: jobsQueryKey,
    queryFn: () => {
      if (isContractor) {
        // Para contratantes, buscar apenas suas vagas
        return fetch('/api/jobs/my/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json());
      } else {
        // Para freelancers, buscar todas as vagas com filtros
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        return fetch(`/api/jobs?${params.toString()}`).then(res => res.json());
      }
    },
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: subcategories } = useQuery({
    queryKey: ['/api/subcategories', filters.categoryId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      return fetch(`/api/subcategories?${params.toString()}`).then(res => res.json());
    },
    enabled: !!filters.categoryId,
  });

  // Ensure data is arrays to prevent rendering issues
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSubcategories = Array.isArray(subcategories) ? subcategories : [];

  const handleFilterChange = (key: string, value: string) => {
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({
      ...prev,
      [key]: filterValue,
      ...(key === 'categoryId' ? { subcategoryId: '' } : {}),
    }));
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isContractor ? 'Minhas Vagas' : 'Explorar Vagas'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isContractor 
            ? 'Gerencie as vagas que você criou' 
            : 'Encontre oportunidades de trabalho na sua cidade'
          }
        </p>
      </div>

      {/* Search and Filters - Only show for freelancers */}
      {!isContractor && (
        <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            {user?.type === 'contratante' ? 'Minhas Vagas' : 'Explorar Vagas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Select value={filters.city || 'all'} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={filters.categoryId || 'all'} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {safeCategories.map((category) => (
                    category.id ? (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name || 'Categoria sem nome'}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Select 
                value={filters.subcategoryId || 'all'} 
                onValueChange={(value) => handleFilterChange('subcategoryId', value)}
                disabled={!filters.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as subcategorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as subcategorias</SelectItem>
                  {safeSubcategories.map((subcategory) => (
                    subcategory.id ? (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name || 'Subcategoria sem nome'}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Job Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando vagas...</p>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-6">
          {jobs.map((job: any) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-purple-300">
              <CardContent className="p-6">
                {/* Header with title and highlight badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-purple-700">
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                          {job.title}
                        </Link>
                      </h3>
                      {job.destaque && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1">
                          ✨ DESTAQUE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>Publicado há {Math.ceil((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias</span>
                      <span className="mx-2">•</span>
                      <span>Categoria: {job.subcategory.category.name}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      R$ {parseFloat(job.payment).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                    <div className="text-xs text-gray-500">valor do projeto</div>
                  </div>
                </div>

                {/* Category/Subcategory tag */}
                <div className="flex items-center mb-4">
                  <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                    {job.subcategory.name}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {job.description.length > 150 
                      ? job.description.substring(0, 150) + '...' 
                      : job.description
                    }
                  </p>
                  <Link href={`/jobs/${job.id}`}>
                    <span className="text-purple-600 hover:text-purple-800 text-sm font-medium cursor-pointer mt-2 inline-block">
                      Ver mais detalhes →
                    </span>
                  </Link>
                </div>

                {/* Key details in a clean grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.date}</div>
                      <div className="text-xs text-gray-500">às {job.time}</div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
                      <LocationDisplay 
                        location={job.location} 
                        className="text-sm text-gray-700" 
                        showIcon={false}
                        showMapLink={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills/Tags if available */}
                {job.subcategory && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {job.subcategory.category.name}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {job.subcategory.name}
                    </span>
                  </div>
                )}

                {/* Footer with client info and action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {job.client?.name || 'Contratante'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.client?.city || 'Localização não informada'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isContractor && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <Link href={`/jobs/${job.id}`}>
                          Candidatar-se
                        </Link>
                      </Button>
                    )}
                    <Link href={`/jobs/${job.id}`}>
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-gray-600">
            {user?.type === 'contratante' 
              ? 'Você ainda não criou nenhuma vaga.' 
              : 'Tente ajustar os filtros ou volte mais tarde.'}
          </p>
          {user?.type === 'contratante' && (
            <Link href="/criar-vaga">
              <Button className="mt-4">Criar Nova Vaga</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
