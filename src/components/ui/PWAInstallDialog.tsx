import { useState, useEffect } from 'react';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallDialog() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has already dismissed it recently (optional, skipping for now to always show)
      const hasDismissed = localStorage.getItem('pwa-dismissed');
      if (!hasDismissed) {
        setIsOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }

    setDeferredPrompt(null);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl">
        <DialogHeader>
          <div className="flex justify-center mb-4 mt-2">
            <div className="w-16 h-16 bg-primary rounded-2xl shadow-lg flex items-center justify-center">
              <Download className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Install Aplikasi</DialogTitle>
          <DialogDescription className="text-center text-base">
            Install Workstream ke layar utama perangkat Anda untuk akses yang lebih cepat dan pengalaman terbaik!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleClose}>
            Nanti Saja
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleInstall}>
            Install Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
