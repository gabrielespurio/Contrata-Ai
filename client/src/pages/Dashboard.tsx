import { useQuery } from '@tanstack/react-query';
import { useUnifiedAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Plus, Briefcase, Users, CheckCircle, Eye } from 'lucide-react';
import { FreelancerDashboard } from '@/components/freelancer/FreelancerDashboard';

export default function Dashboard() {
  const { user } = useUnifiedAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/jobs/my/jobs'],
    enabled: !!user && user.type === 'contratante',
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/applications/my'],
    enabled: !!user && user.type === 'freelancer',
  });

  if (!user) return null;

  // Se for freelancer, usar o novo dashboard
  if (user.type === 'freelancer') {
    return <FreelancerDashboard />;
  }

  // Dashboard para contratantes
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo, {user.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          {user.type === 'contratante' && (
            <>
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
            </>
          )}
          {user.type === 'freelancer' && (
            <Link href="/jobs">
              <Button>
                <Briefcase className="w-4 h-4 mr-2" />
                Explorar Vagas
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {user.type === 'contratante' ? (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stats?.activeJobs || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Candidatos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stats?.totalApplicants || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Contratações</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stats?.completedJobs || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Candidaturas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stats?.totalApplications || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aceitas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stats?.acceptedApplications || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? '...' : stats?.pendingApplications || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content based on user type */}
      {user.type === 'contratante' ? (
        <Card>
          <CardHeader>
            <CardTitle>Suas Vagas</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando vagas...</p>
              </div>
            ) : jobs && jobs.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <div key={job.id} className="py-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                        {job.destaque && (
                          <Badge className="bg-accent/10 text-accent">DESTAQUE</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">
                        Categoria: {job.subcategory.category.name} → {job.subcategory.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {job.date}</span>
                        <span>🕐 {job.time}</span>
                        <span>📍 {job.location}</span>
                        <span>💰 R$ {job.payment}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/vaga/${job.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Você ainda não criou nenhuma vaga.</p>
                <Link href="/criar-vaga">
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Vaga
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Suas Candidaturas</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando candidaturas...</p>
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <div key={application.id} className="py-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{application.job.title}</h3>
                      <Badge 
                        variant={
                          application.status === 'accepted' ? 'default' : 
                          application.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {application.status === 'accepted' ? 'Aceita' : 
                         application.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">
                      Categoria: {application.job.subcategory.category.name} → {application.job.subcategory.name}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {application.job.date}</span>
                      <span>🕐 {application.job.time}</span>
                      <span>📍 {application.job.location}</span>
                      <span>💰 R$ {application.job.payment}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Você ainda não se candidatou a nenhuma vaga.</p>
                <Link href="/jobs">
                  <Button className="mt-4">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Explorar Vagas
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
