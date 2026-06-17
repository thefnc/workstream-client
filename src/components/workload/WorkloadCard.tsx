import type { WorkloadItem } from '@/services/workload';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Timer, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WorkloadCardProps {
  data: WorkloadItem;
  className?: string;
}

export function WorkloadCard({ data, className }: WorkloadCardProps) {
  // Determine capacity status based on avgProgress and active tasks
  // Logic simplified for UI demo purposes
  const capacity = data.avgProgress;

  let statusBadge = { label: 'On Track', colorClass: 'bg-status-ready/10 text-status-ready', icon: <CheckCircle2 size={14} className="text-status-ready" /> };

  if (data.overdueTasks > 0) {
    statusBadge = { label: 'Requires Attention', colorClass: 'bg-status-revision/10 text-status-revision', icon: <AlertCircle size={14} className="text-status-revision" /> };
  } else if (data.activeTasks > 10) {
    statusBadge = { label: 'High Load', colorClass: 'bg-status-checking/10 text-status-checking', icon: <AlertTriangle size={14} className="text-status-checking" /> };
  } else if (data.activeTasks < 5 && capacity > 80) {
    statusBadge = { label: 'Under-limit', colorClass: 'bg-status-queue/10 text-status-queue', icon: <CheckCircle2 size={14} className="text-status-queue" /> };
  }

  // Map progress bar color
  let barColor = 'bg-status-ready';
  if (capacity < 40) barColor = 'bg-status-working';
  if (data.overdueTasks > 0) barColor = 'bg-status-revision';

  return (
    <div className={cn("bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-background">
              <AvatarImage src="" alt={data.designerName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {data.designerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className={cn("absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full", statusBadge.colorClass.split(' ')[0].replace('/10', ''))}></span>
          </div>
          <div>
            <h5 className="font-semibold text-sm text-foreground">{data.designerName}</h5>
            <p className="font-mono text-muted-foreground text-[10px] tracking-wider uppercase">DESIGNER</p>
          </div>
        </div>
        <span className={cn("px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter", statusBadge.colorClass)}>
          {statusBadge.label}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-muted-foreground font-medium">Capacity</span>
            <span className="text-primary font-bold">{capacity}%</span>
          </div>
          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", barColor)} style={{ width: `${capacity}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Active</p>
            <p className="font-mono text-primary font-bold text-sm">{data.activeTasks.toString().padStart(2, '0')}</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Progress</p>
            <p className="font-mono text-primary font-bold text-sm">{capacity}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Revision</p>
            <p className={cn("font-mono font-bold text-sm", data.revisionTasks > 0 ? "text-status-revision" : "text-primary")}>
              {data.revisionTasks.toString().padStart(2, '0')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {statusBadge.icon}
            <span className={cn(data.overdueTasks > 0 ? "text-status-revision font-bold" : "")}>
              {data.overdueTasks > 0 ? `Overdue: ${data.overdueTasks}` : "On track for current sprint"}
            </span>
          </div>
          <Link
            to={`/workload/${data.designerId}`}
            className="text-primary font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
