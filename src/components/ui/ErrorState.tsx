import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Terjadi Kesalahan', 
  message = 'Gagal memuat data. Silakan coba lagi atau periksa koneksi Anda.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] gap-4 p-6 text-center">
      <div className="p-4 rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="w-10 h-10" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
