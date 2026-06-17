import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Task, TaskStatus } from '../types';

export const useTasks = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: async () => {
      const { data } = await api.get('/tasks', { params });
      return data.data; // { items, pagination }
    },
  });
};

export interface CreateTaskPayload {
  title: string;
  referenceNumber?: string;
  description?: string;
  fileReference?: string;
  categoryId: string;
  priorityId: string;
  patternSizeId: string;
  assignedToId?: string;
  dueDate?: string;
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { data } = await api.post('/tasks', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};

export const useBoardTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'board'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/board');
      return data.data.board as Record<TaskStatus, Task[]>;
    },
  });
};

export const useTaskDetail = (taskId?: string) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}`);
      return data.data.task as Task;
    },
    enabled: !!taskId,
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
      return data;
    },
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'board'] });
      
      const previousBoard = queryClient.getQueryData<Record<TaskStatus, Task[]>>(['tasks', 'board']);
      
      if (previousBoard) {
        queryClient.setQueryData<Record<TaskStatus, Task[]>>(['tasks', 'board'], (old) => {
          if (!old) return old;
          
          let taskToMove: Task | null = null;
          let oldStatus: TaskStatus | null = null;
          
          // Find the task and remove from old column
          const newBoard = { ...old };
          for (const status of Object.keys(old) as TaskStatus[]) {
            const index = newBoard[status].findIndex(t => t.id === newPayload.taskId);
            if (index !== -1) {
              taskToMove = newBoard[status][index];
              oldStatus = status;
              newBoard[status] = [...newBoard[status]];
              newBoard[status].splice(index, 1);
              break;
            }
          }
          
          // Add to new column
          if (taskToMove && oldStatus && oldStatus !== newPayload.status) {
            newBoard[newPayload.status] = [
              { ...taskToMove, status: newPayload.status },
              ...newBoard[newPayload.status]
            ];
          }
          
          return newBoard;
        });
      }
      
      return { previousBoard };
    },
    onError: (_err, _newPayload, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['tasks', 'board'], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });
};

interface UpdateProgressPayload {
  taskId: string;
  progress: number;
  note?: string;
}

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProgressPayload) => {
      const { data } = await api.patch(`/tasks/${payload.taskId}/progress`, {
        progress: payload.progress,
        note: payload.note,
      });
      return data;
    },
    onMutate: async (newPayload) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(['tasks'], (old) => {
          if (!old) return old;
          return old.map(task =>
            task.id === newPayload.taskId
              ? { ...task, progress: newPayload.progress }
              : task
          );
        });
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newPayload, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { comment: content });
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
};

export const useAddRevision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, note }: { taskId: string; note: string }) => {
      const { data } = await api.post(`/tasks/${taskId}/revisions`, { note });
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
    },
  });
};
