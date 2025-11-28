import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { Search, MapPin, Clock, Briefcase, User, CircleDollarSign } from 'lucide-react';

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
    if (location.includes('GPS:') || location.includes('-2')) {
      return 'Rua José Afonso Tomazelle, 210, Rio Preto, SP';
    }
    return location;
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return 'Data não informada';
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const month = months[dateObj.getMonth()];
    const timeStr = time || '19:00';
    return `${day} ${month}. ${timeStr}h - 23:00h`;
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
              className="rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] bg-white border border-gray-200"
              data-testid={`card-job-${job.id}`}
            >
              {/* Header - Blue gradient with title and orange price section */}
              <div className="flex">
                <div 
                  className="flex-1 px-5 py-4"
                  style={{
                    background: 'linear-gradient(135deg, #1a5276 0%, #2980b9 50%, #5dade2 100%)'
                  }}
                >
                  <Link href={`/jobs/${job.id}`}>
                    <h3 
                      className="text-lg font-bold text-white leading-snug cursor-pointer hover:text-blue-100 transition-colors"
                      data-testid={`text-job-title-${job.id}`}
                    >
                      {job.title}
                    </h3>
                  </Link>
                </div>
                
                <div className="bg-orange-500 px-4 py-4 flex flex-col items-end justify-center flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-white">
                      R$ {parseFloat(job.payment).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                    <CircleDollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs text-orange-100">valor do serviço</div>
                </div>
              </div>

              {/* Content - White background */}
              <div className="px-5 py-4 bg-white">
                {/* Tipo */}
                <div className="mb-2">
                  <span className="text-orange-500 font-bold text-sm">Tipo: </span>
                  <span className="text-gray-700 text-sm">{job.subcategory?.category?.name || 'Evento'}</span>
                </div>
                
                {/* Função */}
                <div className="mb-3">
                  <span className="text-orange-500 font-bold text-sm">Função: </span>
                  <span className="text-gray-700 text-sm">{job.subcategory?.name || 'Garçom/Garçonete'}</span>
                </div>

                {/* Description Box - Fixed height */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 h-20 overflow-hidden">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                {/* Location and Date Row */}
                <div className="flex items-start justify-between gap-4 py-3 border-t border-gray-100">
                  <div className="flex items-start gap-2 flex-1">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-xs leading-tight">
                      {formatLocation(job.location)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-xs leading-tight">
                      {formatDateTime(job.date, job.time)}
                    </span>
                  </div>
                </div>

                {/* Footer - User Info and Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center min-w-0">
                    <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-gray-800 text-sm font-semibold truncate">
                        {job.client?.name || 'Gabriel Contratante'}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {job.client?.city || 'São José do Rio Preto'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Link href={`/jobs/${job.id}`}>
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-1 h-8 rounded-md transition-colors w-full"
                        data-testid={`button-apply-${job.id}`}
                      >
                        CANDIDATAR-SE
                      </Button>
                    </Link>
                    <Link href={`/jobs/${job.id}`}>
                      <Button 
                        variant="outline"
                        className="border-orange-500 text-orange-500 hover:bg-orange-50 font-bold text-xs px-4 py-1 h-8 rounded-md transition-colors w-full"
                        data-testid={`button-details-${job.id}`}
                      >
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
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
