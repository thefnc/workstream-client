import { create } from 'zustand';
import type { Task } from '../types';
import { tasks as mockTasks } from '../data/tasks';

interface TaskState {
  tasks: Task[];
  updateTaskProgress: (taskId: string, progress: number, note?: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: mockTasks,
  updateTaskProgress: (taskId, progress, note) =>
    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? {
            ...task,
            progress,
            progressLogs: note ? [
              ...task.progressLogs,
              {
                id: `pl-${Date.now()}`,
                userId: 'u1', // Default to super admin for now
                previousProgress: task.progress,
                newProgress: progress,
                note,
                createdAt: new Date().toISOString()
              }
            ] : task.progressLogs
          }
          : task
      )
    }))
}));
