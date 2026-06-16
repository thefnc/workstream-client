import { useQuery } from '@tanstack/react-query';
import { api } from './api';

interface DashboardSummary {
  totalTasks: number;
  workingCount: number;
  revisionCount: number;
  readyUploadCount: number;
  overdueCount: number;
  dueTodayCount: number;
}

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      return response.data.data.summary as DashboardSummary;
    },
  });
};
