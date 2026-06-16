import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, ClockAlert } from 'lucide-react';
import { getStatusColor } from '../lib/status-helper';
import { useAuthStore } from '../stores/authStore';
import type { Task } from '../types';

const PRIORITY_COLORS = {
  LOW: 'oklch(0.725 0.15 152)',
  MEDIUM: 'oklch(0.745 0.16 66)',
  HIGH: 'oklch(0.635 0.21 25)',
  URGENT: 'oklch(0.485 0.18 290)',
};

export function TaskCard({ task, onEditClick }: { task: Task; onEditClick?: (task: Task) => void }) {
  const { user } = useAuthStore();
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
  const statusColor = getStatusColor(task.status);
  
  const isViewer = user?.role === 'VIEWER';
  const isDesigner = user?.role === 'DESIGNER';
  const isMyTask = task.assignedTo?.id === user?.id;
  const isEditable = !isViewer && (!isDesigner || isMyTask);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : (isEditable ? 1 : 0.65),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-[14px] p-4 shadow-sm group relative ${isEditable ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/30' : 'cursor-not-allowed grayscale-[20%]'} transition-all ${isDragging ? 'z-50 shadow-xl ring-2 ring-primary/20 scale-[1.02]' : ''}`}
      {...attributes}
      {...listeners}
    >
      {!isEditable && (
        <div className="absolute top-2 right-2 flex items-center justify-center bg-background/80 backdrop-blur-[2px] w-6 h-6 rounded-full z-10" title="Read Only">
          <span className="block w-2 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      )}

      {/* Top Row: Priority & Overdue/Edit */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider"
            style={{
              backgroundColor: `${PRIORITY_COLORS[task.priority]}15`,
              color: PRIORITY_COLORS[task.priority]
            }}
          >
            {task.priority}
          </span>
          {task.patternSize && (
            <span className="px-1.5 py-0.5 border border-border text-muted-foreground rounded text-[10px] font-mono font-bold bg-secondary/20">
              {task.patternSize}
            </span>
          )}
        </div>
        {isOverdue ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded shadow-sm uppercase tracking-wider animate-pulse">
            <ClockAlert size={12} />
            Overdue
          </span>
        ) : (
          isEditable && (
            <button 
              type="button"
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 relative hover:text-foreground bg-background rounded-md p-1 border border-transparent hover:border-border hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick?.(task);
              }}
            >
              <Edit size={14} />
            </button>
          )
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
            <div className="flex items-center gap-2">
              {task.assignedTo.avatarUrl ? (
                <img alt={task.assignedTo.name} className="w-6 h-6 rounded-full object-cover border-2 border-background shadow-sm" src={task.assignedTo.avatarUrl} />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-background">
                  {task.assignedTo.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[12px] font-semibold text-foreground leading-none">
                  {task.assignedTo.name.split(' ')[0]}
                </span>
                {isMyTask && (
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">Tugas Anda</span>
                )}
              </div>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground text-[10px]" title="Unassigned">
              ?
            </div>
          )}
        </div>
        <span className={`text-[11px] font-medium ${isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  );
}
