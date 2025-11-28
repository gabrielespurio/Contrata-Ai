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
import { Search, MapPin, Calendar, Briefcase, Clock, User } from 'lucide-react';

export default function Jobs() {
  const { user } = useUnifiedAuth();
  const [filters, setFilters] = useState({
    city: '',
    categoryId: '',
    subcategoryId: '',
    date: '',
  });

  const isContractor = user?.type === 'contratante';
  const jobsQueryKey = isContractor ? ['/api/jobs/my/jobs'] : ['/api/jobs', filters];

  const { data: jobs, isLoading } = useQuery({
    queryKey: jobsQueryKey,
    queryFn: () => {
      if (isContractor) {
        return fetch('/api/jobs/my/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json());
      } else {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        return fetch(`/api/jobs?${params.toString()}`).then(res => res.json());
      }
    },
    enabled: isContractor ? !!user : true,
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

  const formatLocation = (location: string) => {
    if (!location) return 'Local não informado';
    const parts = location.split(',');
    if (parts.length >= 2) {
      return parts.slice(0, 2).join(',').trim();
    }
    return location.length > 30 ? location.substring(0, 30) + '...' : location;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isContractor ? 'Minhas Vagas' : 'Explorar Vagas'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isContractor 
            ? 'Gerencie as vagas que você criou' 
            : 'Encontre oportunidades de trabalho na sua cidade'
          }
        </p>
      </div>

      {!isContractor && (
        <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Explorar Vagas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Select value={filters.city || 'all'} onValueChange={(value) => handleFilterChange('city', value)}>
                <SelectTrigger data-testid="select-city">
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
                <SelectTrigger data-testid="select-category">
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
                <SelectTrigger data-testid="select-subcategory">
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
                data-testid="input-date"
              />
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando vagas...</p>
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <div 
              key={job.id} 
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82a0 50%, #5ba3c0 100%)'
              }}
              data-testid={`card-job-${job.id}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge 
                    className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-md border-0"
                  >
                    VAGA RAPIDA
                  </Badge>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-400">
                      R$ {parseFloat(job.payment).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                    <div className="text-xs text-blue-200">valor do projeto</div>
                  </div>
                </div>

                <Link href={`/jobs/${job.id}`}>
                  <h3 className="text-xl font-bold text-white mb-4 leading-tight cursor-pointer hover:text-blue-200 transition-colors" data-testid={`text-job-title-${job.id}`}>
                    {job.title}
                  </h3>
                </Link>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-orange-400 text-xs font-bold mb-1 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      TIPO
                    </div>
                    <div className="text-white text-sm font-semibold">
                      {job.subcategory?.category?.name || 'Geral'}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-orange-400 text-xs font-bold mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      FUNCAO
                    </div>
                    <div className="text-white text-sm font-semibold">
                      {job.subcategory?.name || 'Freelancer'}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-blue-100 text-sm leading-relaxed line-clamp-3">
                    {job.description.length > 120 
                      ? job.description.substring(0, 120) + '...' 
                      : job.description
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center text-blue-100">
                    <MapPin className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                    <span className="text-xs truncate">
                      {formatLocation(job.location)}
                    </span>
                  </div>
                  <div className="flex items-center text-blue-100">
                    <Calendar className="w-4 h-4 mr-2 text-orange-400 flex-shrink-0" />
                    <span className="text-xs">
                      {job.date}, {job.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">
                        {job.client?.name || 'Contratante'}
                      </div>
                      <div className="text-blue-200 text-xs">
                        {job.client?.city || 'Brasil'}
                      </div>
                    </div>
                  </div>
                </div>

                <Link href={`/jobs/${job.id}`}>
                  <Button 
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors"
                    data-testid={`button-apply-${job.id}`}
                  >
                    {isContractor ? 'VER DETALHES' : 'CANDIDATAR-SE'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.type === 'contratante' 
              ? 'Você ainda não criou nenhuma vaga.' 
              : 'Tente ajustar os filtros ou volte mais tarde.'}
          </p>
          {user?.type === 'contratante' && (
            <Link href="/criar-vaga">
              <Button className="mt-4" data-testid="button-create-job">Criar Nova Vaga</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
