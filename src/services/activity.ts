import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type { Task } from '../types';

export interface ActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE_STATUS' | 'UPDATE_PROGRESS' | 'COMMENT' | 'REVISION' | 'UPLOAD_ATTACHMENT';
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  };
  task?: {
    id: string;
    title: string;
    referenceNumber: string | null;
  };
}

export const useActivities = (params?: { limit?: number; page?: number }) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: async () => {
      const { data } = await api.get('/activity', { params });
      return data.data as { items: ActivityLog[]; total: number };
    },
  });
};
