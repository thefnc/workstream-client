export type Role = 'SUPER_ADMIN' | 'DESIGNER' | 'VIEWER';

export type TaskStatus = 'QUEUE' | 'WORKING' | 'CHECKING' | 'REVISION' | 'READY_UPLOAD' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  userId: string;
  user?: User;
  comment: string;
  createdAt: string;
}

export interface RevisionNote {
  id: string;
  note: string;
  user?: User;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  userId: string;
  user?: User;
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

export interface PatternSize {
  id: string;
  size: number;
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
  patternSize?: PatternSize;
  comments: Comment[];
  revisionNotes: RevisionNote[];
  progressLogs: ProgressLog[];
  activityLogs: ActivityLog[];
}
