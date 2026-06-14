import { RouterProvider } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { router } from './router';

export function Providers() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </TooltipProvider>
  );
}
