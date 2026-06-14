import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarIcon } from 'lucide-react';
import type { Task, TaskStatus } from '../types';

const STATUS_COLORS: Record<TaskStatus, string> = {
  QUEUE: 'oklch(0.68 0.02 250)',
  WORKING: 'oklch(0.685 0.111 245)',
  CHECKING: 'oklch(0.745 0.16 66)',
  REVISION: 'oklch(0.635 0.21 25)',
  READY_UPLOAD: 'oklch(0.725 0.15 152)',
  DONE: 'oklch(0.259 0.086 257.4)',
};

const PRIORITY_COLORS = {
  LOW: 'oklch(0.725 0.15 152)',
  MEDIUM: 'oklch(0.745 0.16 66)',
  HIGH: 'oklch(0.635 0.21 25)',
  URGENT: 'oklch(0.485 0.18 290)',
};

export function TaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const statusColor = STATUS_COLORS[task.status];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-3 p-3 cursor-grab active:cursor-grabbing hover:border-slate-300 hover:shadow-md transition-shadow bg-white ${isDragging ? 'z-50 shadow-xl' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* Header: Priority & Overdue */}
      <div className="flex justify-between items-start">
        <Badge
          variant="outline"
          style={{
            borderColor: PRIORITY_COLORS[task.priority],
            color: PRIORITY_COLORS[task.priority],
            fontSize: '10px',
            padding: '0 4px',
          }}
        >
          {task.priority}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive" style={{ fontSize: '10px', padding: '0 4px', background: 'oklch(0.635 0.21 25)' }}>
            OVERDUE
          </Badge>
        )}
      </div>

      {/* Title & Ref */}
      <div>
        <h4 className="font-semibold text-sm text-slate-900 leading-tight">{task.title}</h4>
        <span className="text-xs font-mono text-slate-500">{task.referenceNumber}</span>
      </div>

      {/* Progress & Category */}
      <div className="flex justify-between items-center mt-1">
        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
          {task.category}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${task.progress}%`, background: statusColor }}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium w-6 text-right">
            {task.progress}%
          </span>
        </div>
      </div>

      {/* Footer: User & Date */}
      <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <CalendarIcon size={12} />
          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </div>
        {task.assignedTo && (
          <Avatar className="w-6 h-6 border border-slate-200">
            <AvatarFallback className="text-[10px] bg-slate-100 text-slate-700">
              {task.assignedTo.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  );
}
