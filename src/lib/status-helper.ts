import type { TaskStatus } from '../types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  QUEUE: 'Antrian',
  WORKING: 'Dikerjakan',
  CHECKING: 'Dicek',
  REVISION: 'Revisi',
  READY_UPLOAD: 'Siap Upload',
  DONE: 'Selesai',
};

export const getStatusColor = (status: TaskStatus): string => {
  const COLORS: Record<TaskStatus, string> = {
    QUEUE: 'oklch(0.68 0.02 250)',
    WORKING: 'oklch(0.685 0.111 245)',
    CHECKING: 'oklch(0.745 0.16 66)',
    REVISION: 'oklch(0.635 0.21 25)',
    READY_UPLOAD: 'oklch(0.725 0.15 152)',
    DONE: 'oklch(0.259 0.086 257.4)',
  };
  return COLORS[status];
};
