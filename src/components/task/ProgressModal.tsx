import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { useAuthStore } from '../../stores/authStore';
import { useUpdateProgress } from '../../services/tasks';
import type { Task } from '../../types';
import { toast } from 'sonner';

interface ProgressModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressModal({ task, isOpen, onClose }: ProgressModalProps) {
  const { user } = useAuthStore();
  const { mutateAsync: updateProgress, isPending } = useUpdateProgress();

  const [progress, setProgress] = useState([task?.progress || 0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (task) {
      setProgress([task.progress]);
      setNote('');
    }
  }, [task, isOpen]);

  if (!task) return null;

  const isViewer = user?.role === 'VIEWER';
  const isDesigner = user?.role === 'DESIGNER';
  const isAssignedToMe = task.assignedTo?.id === user?.id;
  const isEditable = !isViewer && (!isDesigner || isAssignedToMe);

  const handleUpdate = async () => {
    try {
      await updateProgress({
        taskId: task.id,
        progress: progress[0],
        note: note.trim() || undefined,
      });
      toast.success('Progress updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
      // On error, revert slider locally
      setProgress([task.progress]);
    }
  };

  const getStatusRange = (status: string) => {
    switch (status) {
      case "QUEUE": return "Only 0%";
      case "WORKING": return "15% - 80%";
      case "CHECKING": return "80% - 90%";
      case "REVISION": return "50% - 85%";
      case "READY_UPLOAD": return "90% - 99%";
      case "DONE": return "Only 100%";
      default: return "Unknown";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress: {task.title}</DialogTitle>
          <DialogDescription>
            Valid range for <strong className="text-foreground">{task.status}</strong> is {getStatusRange(task.status)}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-2xl font-bold">{progress[0]}%</span>
            </div>
            <Slider
              value={progress}
              onValueChange={(val: number[]) => setProgress(val)}
              max={100}
              step={1}
              disabled={!isEditable || isPending}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Add a Note (Optional)</label>
            <textarea
              className="w-full h-24 p-3 rounded-md border border-border bg-background resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="What did you work on?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!isEditable || isPending}
            />
          </div>

          {!isEditable && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium text-center">
              You do not have permission to update this task.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          {isEditable && (
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Progress'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
