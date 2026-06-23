import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ForbiddenStateProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function ForbiddenState({ 
  title = 'Akses Ditolak', 
  message = 'Anda tidak memiliki izin untuk melihat halaman ini.',
  showBackButton = true
}: ForbiddenStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[50vh] gap-4 p-6 text-center">
      <div className="p-4 rounded-full bg-orange-500/10 text-orange-500">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>
      {showBackButton && (
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-2">
          Kembali
        </Button>
      )}
    </div>
  );
}
