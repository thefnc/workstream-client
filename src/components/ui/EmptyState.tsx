import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon = <Inbox className="w-10 h-10" />, 
  title = 'Tidak ada data', 
  message = 'Belum ada data atau tugas yang bisa ditampilkan di sini.',
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center w-full h-full gap-3 p-6 text-center", className)}>
      <div className="p-4 rounded-full bg-muted text-muted-foreground/50">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        {message && <p className="text-sm text-muted-foreground max-w-sm">{message}</p>}
      </div>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
