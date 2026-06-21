import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface WorkloadItem {
  designerId: string;
  designerName: string;
  activeTasks: number;
  workingTasks: number;
  revisionTasks: number;
  overdueTasks: number;
  avgProgress: number;
}

export const useWorkload = () => {
  return useQuery({
    queryKey: ['workload'],
    queryFn: async () => {
      const { data } = await api.get('/workload');
      return data.data.workload as WorkloadItem[];
    },
  });
};

export const useWorkloadDetail = (designerId?: string) => {
  return useQuery({
    queryKey: ['workload', designerId],
    queryFn: async () => {
      const { data } = await api.get(`/workload/${designerId}`);
      return data.data.detail;
    },
    enabled: !!designerId,
  });
};
