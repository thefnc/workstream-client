import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Memuat...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
