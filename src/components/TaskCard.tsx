import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, ClockAlert } from 'lucide-react';
import { getStatusColor } from '../lib/status-helper';
import { useAuthStore } from '../stores/authStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Task } from '../types';

const PRIORITY_COLORS = {
  LOW: 'oklch(0.725 0.15 152)',
  MEDIUM: 'oklch(0.745 0.16 66)',
  HIGH: 'oklch(0.635 0.21 25)',
  URGENT: 'oklch(0.485 0.18 290)',
};

export function TaskCard({ task, onEditClick, onClick }: { task: Task; onEditClick?: (task: Task) => void; onClick?: (task: Task) => void }) {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() && task.status !== 'DONE' : false;
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

  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-xl p-4 shadow-sm group relative flex flex-col gap-3 transition-all cursor-pointer
        ${isEditable ? 'hover:shadow-md hover:border-primary/30 active:cursor-grabbing' : 'grayscale-[20%]'}
        ${isDragging ? 'z-50 shadow-xl ring-2 ring-primary/20 scale-[1.02] cursor-grabbing' : ''}`}
      onClick={(e) => {
        if (onClick) {
          onClick(task);
        } else if (!(e.target as HTMLElement).closest('.edit-btn')) {
          navigate(`/tasks/${task.id}`);
        }
      }}
      {...attributes}
      {...listeners}
    >
      {!isEditable && (
        <div className="absolute top-2 right-2 flex items-center justify-center bg-background/80 backdrop-blur-[2px] w-6 h-6 rounded-full z-10" title="Read Only">
          <span className="block w-2 h-2 rounded-full bg-muted-foreground/50" />
        </div>
      )}

      {/* Header: Tags & Actions */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className="text-[10px] font-bold uppercase tracking-wider border-transparent"
            style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}
          >
            {task.priority}
          </Badge>
          {task.patternSize && (
            <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-secondary/30">
              {task.patternSize.size}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 z-10">
          {isOverdue && (
            <Badge variant="destructive" className="flex items-center gap-1 text-[10px] uppercase animate-pulse">
              <ClockAlert size={12} /> Overdue
            </Badge>
          )}
          {isEditable && (
            <button 
              type="button"
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity relative hover:text-foreground bg-background rounded-md p-1 border border-transparent hover:border-border hover:shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick?.(task);
              }}
              title="Edit Task"
            >
              <Edit size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
          {task.title}
        </h4>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
          {task.referenceNumber}
        </p>
      </div>

      <div className="flex items-center">
        <Badge variant="secondary" className="text-[10px] font-semibold text-secondary-foreground">
          {task.category}
        </Badge>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5 mt-auto pt-2">
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${task.progress}%`, backgroundColor: statusColor }}
          />
        </div>
      </div>

      {/* Footer: Assignee & Due Date */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-1">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6 border shadow-sm">
                <AvatarImage src={task.assignedTo.avatarUrl || ''} alt={task.assignedTo.name} />
                <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                  {task.assignedTo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground leading-none">
                  {task.assignedTo.name.split(' ')[0]}
                </span>
                {isMyTask && (
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider mt-0.5">
                    Tugas Anda
                  </span>
                )}
              </div>
            </div>
          ) : (
            <Avatar className="w-6 h-6 border border-dashed shadow-sm bg-transparent">
              <AvatarFallback className="text-[10px] text-muted-foreground bg-transparent">
                ?
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <span className={`text-[11px] font-medium ${isOverdue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No Due Date'}
        </span>
      </div>
    </div>
  );
}
