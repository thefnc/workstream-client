import type { User } from '../types';

export const users: User[] = [
  {
    id: 'u1',
    name: 'Super Admin',
    email: 'admin@workstream.local',
    role: 'SUPER_ADMIN',
  },
  {
    id: 'u2',
    name: 'Designer 1',
    email: 'designer1@workstream.local',
    role: 'DESIGNER',
  },
  {
    id: 'u3',
    name: 'Designer 2',
    email: 'designer2@workstream.local',
    role: 'DESIGNER',
  },
  {
    id: 'u4',
    name: 'Viewer',
    email: 'viewer@workstream.local',
    role: 'VIEWER',
  }
];
