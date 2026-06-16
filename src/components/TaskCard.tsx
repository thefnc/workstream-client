import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit } from 'lucide-react';
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
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  const statusColor = STATUS_COLORS[task.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-[14px] p-4 shadow-sm hover:shadow-md transition-shadow group cursor-pointer ${isDragging ? 'z-50 shadow-xl ring-2 ring-primary/20' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* Top Row: Priority & Overdue/Edit */}
      <div className="flex justify-between items-start mb-3">
        <span 
          className="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider"
          style={{
            backgroundColor: `${PRIORITY_COLORS[task.priority]}15`,
            color: PRIORITY_COLORS[task.priority]
          }}
        >
          {task.priority}
        </span>
        {isOverdue ? (
          <span className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded uppercase tracking-wider">
            Overdue
          </span>
        ) : (
          <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit size={16} />
          </button>
        )}
      </div>

      {/* Title */}
      <h4 className="font-semibold text-[14px] text-foreground mb-1 leading-snug">
        {task.title}
      </h4>

      {/* Reference Number */}
      <p className="font-mono text-[12px] text-muted-foreground mb-3 uppercase tracking-wide">
        {task.referenceNumber}
      </p>

      {/* Category */}
      <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-[11px] font-semibold mb-4">
        {task.category}
      </span>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-2 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${task.progress}%`, backgroundColor: statusColor }}
        />
      </div>

      {/* Footer: User & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <>
              {task.assignedTo.avatarUrl ? (
                <img alt={task.assignedTo.name} className="w-6 h-6 rounded-full object-cover border border-border" src={task.assignedTo.avatarUrl} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                  {task.assignedTo.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-[12px] font-medium text-muted-foreground">
                {task.assignedTo.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px]" title="Unassigned">
              ?
            </div>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">
          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}
