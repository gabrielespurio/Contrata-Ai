import { useUnifiedAuth } from '@/hooks/useAuth';
import { FreelancerDashboard } from '@/components/freelancer/FreelancerDashboard';
import { ContractorDashboard } from '@/components/contractor/ContractorDashboard';

export default function Dashboard() {
  const { user } = useUnifiedAuth();

  if (!user) return null;

  // Se for freelancer, usar o dashboard específico de freelancer
  if (user.type === 'freelancer') {
    return <FreelancerDashboard />;
  }

  // Se for contratante, usar o novo dashboard com abas
  return <ContractorDashboard />;
}
