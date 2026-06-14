export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DESIGNER' | 'VIEWER';

export type TaskStatus = 'QUEUE' | 'WORKING' | 'CHECKING' | 'REVISION' | 'READY_UPLOAD' | 'DONE';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  QUEUE: 'Antrian',
  WORKING: 'Dikerjakan',
  CHECKING: 'Dicek',
  REVISION: 'Revisi',
  READY_UPLOAD: 'Siap Upload',
  DONE: 'Selesai',
};

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface RevisionNote {
  id: string;
  note: string;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  userId: string;
  previousProgress: number;
  newProgress: number;
  note?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  createdAt: string;
}

export interface Task {
  id: string;
  referenceNumber: string;
  title: string;
  category: string;
  status: TaskStatus;
  progress: number;
  priority: TaskPriority;
  assignedTo: User | null;
  dueDate: string;
  fileReference?: string;
  description?: string;
  comments: Comment[];
  revisionNotes: RevisionNote[];
  progressLogs: ProgressLog[];
  activityLogs: ActivityLog[];
}
