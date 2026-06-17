import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['options', 'categories'],
    queryFn: async () => {
      const { data } = await api.get('/settings/categories');
      return data.data.categories as { id: string; name: string }[];
    },
  });
};

export const usePriorities = () => {
  return useQuery({
    queryKey: ['options', 'priorities'],
    queryFn: async () => {
      const { data } = await api.get('/settings/priorities');
      return data.data.priorities as { id: string; name: string; color: string }[];
    },
  });
};

export const usePatternSizes = () => {
  return useQuery({
    queryKey: ['options', 'patternSizes'],
    queryFn: async () => {
      const { data } = await api.get('/settings/pattern-sizes');
      return data.data.patternSizes as { id: string; size: string }[];
    },
  });
};

export const useDesigners = () => {
  return useQuery({
    queryKey: ['options', 'designers'],
    queryFn: async () => {
      const { data } = await api.get('/users', { params: { role: 'DESIGNER', limit: 100 } });
      return data.data.items as { id: string; name: string }[];
    },
  });
};
