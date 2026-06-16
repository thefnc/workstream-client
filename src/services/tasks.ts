import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Task } from '../types';

interface UpdateProgressPayload {
  taskId: string;
  progress: number;
  note?: string;
}

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProgressPayload) => {
      const { data } = await api.put(`/tasks/${payload.taskId}/progress`, {
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
