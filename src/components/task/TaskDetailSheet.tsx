import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTaskDetail, useUpdateProgress, useUpdateStatus, useAddComment, useAddRevision, useUploadAttachment } from '../../services/tasks';
import { useAuthStore } from '../../stores/authStore';
import { STATUS_LABELS, getStatusColor } from '../../lib/status-helper';
import { toast } from 'sonner';
import type { TaskStatus } from '../../types';
import { ChevronRight, Calendar, Info, FolderOpen, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'oklch(0.725 0.15 152)',
  MEDIUM: 'oklch(0.745 0.16 66)',
  HIGH: 'oklch(0.635 0.21 25)',
  URGENT: 'oklch(0.485 0.18 290)',
};

export function TaskDetailSheet() {
  const queryClient = useQueryClient();

  const getProgressHelperText = (status: string) => {
    switch (status) {
      case 'QUEUE': return "Status Antrian mengharuskan progress di 0%.";
      case 'WORKING': return "Status Dikerjakan menerima progress 15% - 80%.";
      case 'CHECKING': return "Status Dicek menerima progress 80% - 90%.";
      case 'REVISION': return "Status Revisi menerima progress 50% - 85%.";
      case 'READY_UPLOAD': return "Status Siap Upload menerima progress 90% - 99%.";
      case 'DONE': return "Status Selesai mengharuskan progress di 100%.";
      default: return "";
    }
  };

  const isValidProgress = (status: string, progress: number) => {
    switch (status) {
      case 'QUEUE': return progress === 0;
      case 'WORKING': return progress >= 15 && progress <= 80;
      case 'CHECKING': return progress >= 80 && progress <= 90;
      case 'REVISION': return progress >= 50 && progress <= 85;
      case 'READY_UPLOAD': return progress >= 90 && progress <= 99;
      case 'DONE': return progress === 100;
      default: return false;
    }
  };

  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');

  const { data: task, isLoading, isError } = useTaskDetail(taskId || undefined);
  const { mutateAsync: updateProgress, isPending: isUpdatingProgress } = useUpdateProgress();
  const { mutate: updateStatus } = useUpdateStatus();
  const { mutateAsync: addComment, isPending: isAddingComment } = useAddComment();
  const { mutateAsync: addRevision, isPending: isAddingRevision } = useAddRevision();
  const { mutateAsync: uploadAttachment, isPending: isUploading } = useUploadAttachment();

  const [progressVal, setProgressVal] = useState<number[]>([0]);
  const [progressNote, setProgressNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (task) {
      setProgressVal([task.progress]);
      setProgressNote('');
    }
  }, [task]);

  const handleClose = () => {
    searchParams.delete('taskId');
    setSearchParams(searchParams);
  };

  if (!taskId) return null;

  const isViewer = user?.role === 'VIEWER';
  const isDesigner = user?.role === 'DESIGNER';
  const isMyTask = task?.assignedTo?.id === user?.id;
  const isEditable = !isViewer && (!isDesigner || isMyTask);

  const handleSaveProgress = async () => {
    if (!task) return;
    try {
      await updateProgress({
        taskId: task.id,
        progress: progressVal[0],
        note: progressNote.trim() || undefined,
      });
      toast.success('Progress updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
      setProgressVal([task.progress]);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!task) return;
    updateStatus({ taskId: task.id, status: newStatus as TaskStatus });
  };

  const handleAddComment = async () => {
    if (!task || !commentText.trim()) return;
    try {
      await addComment({ taskId: task.id, content: commentText.trim() });
      setCommentText('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleAddRevision = async () => {
    if (!task || !revisionNote.trim()) return;
    try {
      await addRevision({ taskId: task.id, note: revisionNote.trim() });
      setRevisionNote('');
      toast.success('Revision note added');
    } catch {
      toast.error('Failed to add revision note');
    }
  };

  const handleUpload = async () => {
    if (!task || !selectedFile) return;
    try {
      await uploadAttachment({ taskId: task.id, file: selectedFile });
      setSelectedFile(null);
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Failed to upload file');
    }
  };

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && handleClose()}>
      {/* 
        We use w-full md:w-[640px] and disable the default shadcn close button internally if needed,
        but leaving it is fine. The internal flex layout matches the reference exactly.
      */}
      <SheetContent className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-[800px] overflow-hidden flex flex-col p-0 gap-0 border-l border-border bg-background shadow-2xl">

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">Memuat detail task...</div>
        ) : isError || !task ? (
          <div className="flex flex-1 items-center justify-center text-destructive font-medium">Gagal memuat tugas atau tidak ditemukan.</div>
        ) : (
          <>
            {/* Header */}
            <header className="h-20 px-8 flex items-center justify-between border-b border-border bg-card shrink-0">
              <div className="flex flex-col">
                <nav className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="text-xs font-medium">Workstream</span>
                  <ChevronRight size={14} />
                  <span className="text-xs font-medium text-foreground">{task.category}</span>
                </nav>
                <div className="flex items-center gap-4">
                  <SheetTitle className="text-lg font-bold text-foreground m-0 leading-tight">
                    {task.title}
                  </SheetTitle>
                  <span className="font-mono text-xs bg-secondary/50 border border-border px-2 py-0.5 rounded text-muted-foreground">
                    {task.referenceNumber}
                  </span>
                </div>
              </div>
            </header>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">

              {/* Metadata Grid */}
              <section className="grid grid-cols-2 md:grid-cols-3 gap-6 p-5 bg-secondary/20 rounded-xl border border-border">
                {/* Status */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: getStatusColor(task.status) }} />
                    <span className="text-sm font-semibold text-foreground">
                      {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{task.progress}%</span>
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority</p>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold uppercase tracking-wider border-transparent"
                    style={{
                      backgroundColor: `${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW}15`,
                      color: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW
                    }}
                  >
                    {task.priority}
                  </Badge>
                </div>

                {/* Assigned Designer */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Designer</p>
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <>
                        <Avatar className="w-6 h-6 border border-border/50">
                          <AvatarImage src={task.assignedTo.avatarUrl || ''} alt={task.assignedTo.name} />
                          <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                            {task.assignedTo.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">{task.assignedTo.name}</span>
                      </>
                    ) : (
                      <span className="text-sm italic text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                  <span className="text-sm font-medium text-foreground">{task.category}</span>
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</p>
                  <div className="flex items-center gap-1.5 text-destructive font-semibold">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Instructions */}
              <section className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Instructions</h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {task.description || <span className="italic">Tidak ada instruksi yang diberikan.</span>}
                </div>
              </section>

              {/* File Reference */}
              {task.fileReference && (
                <section className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    File Reference
                    <Info size={16} className="text-muted-foreground" />
                  </h3>
                  <div className="flex items-center gap-3 bg-primary/5 text-foreground p-3 rounded-lg border border-primary/20">
                    <FolderOpen size={18} className="text-primary" />
                    <code className="flex-1 font-mono text-xs truncate">
                      {task.fileReference}
                    </code>
                    <button
                      className="hover:bg-primary/10 p-1.5 rounded transition-colors group"
                      onClick={() => {
                        navigator.clipboard.writeText(task.fileReference!);
                        toast.success('Path disalin!');
                      }}
                    >
                      <Info size={16} className="text-muted-foreground group-active:scale-90 transition-transform" />
                    </button>
                  </div>
                </section>
              )}

              {/* Attachments */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">Attachments</h3>
                  {isEditable && (
                    <button className="text-xs font-medium text-primary hover:underline">
                      Add Files
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* For now, just a placeholder for empty state or upload button */}
                  {isEditable && (
                    <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/30 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            // Auto upload for demo
                            uploadAttachment({ taskId: task.id, file });
                            toast.success('Uploading file...');
                          }
                        }}
                      />
                      <UploadCloud size={24} className="mb-2" />
                      <span className="text-[10px] font-medium">Upload</span>
                    </div>
                  )}
                  {(!isEditable) && (
                    <div className="col-span-3 text-sm text-muted-foreground p-4 bg-secondary/10 rounded-lg border border-border text-center">
                      Belum ada lampiran.
                    </div>
                  )}
                </div>
              </section>

              {/* Update Progress & Status (Only Editable) */}
              {isEditable && (
                <section className="space-y-4 p-5 border border-border rounded-xl bg-card shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-foreground">Update Progress</h3>
                    <span className="text-xl font-bold">{progressVal[0]}%</span>
                  </div>

                  <Slider
                    value={progressVal}
                    onValueChange={(val: any) => setProgressVal(Array.isArray(val) ? val : [val])}
                    max={100}
                    step={1}
                    disabled={isUpdatingProgress}
                  />

                  <p className={cn(
                    "text-xs font-medium mt-1.5",
                    task && isValidProgress(task.status, progressVal[0]) ? "text-muted-foreground" : "text-destructive"
                  )}>
                    {task ? getProgressHelperText(task.status) : ''}
                  </p>

                  <div className="pt-2">
                    <textarea
                      className="w-full h-20 p-3 rounded-lg border border-border bg-background resize-none text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Catatan update progress (Opsional)..."
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      disabled={isUpdatingProgress}
                    />
                  </div>
                </section>
              )}

              {/* Revision Notes */}
              {(task.revisionNotes?.length > 0 || user?.role === 'SUPER_ADMIN') && (
                <section className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Revision Notes</h3>

                  {user?.role === 'SUPER_ADMIN' && (
                    <div className="flex flex-col gap-2 mb-4">
                      <textarea
                        className="w-full h-20 p-3 rounded-lg border border-border bg-background resize-none text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Tambahkan catatan revisi..."
                        value={revisionNote}
                        onChange={(e) => setRevisionNote(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button variant="destructive" size="sm" onClick={handleAddRevision} disabled={isAddingRevision || !revisionNote.trim()}>
                          Add Revision
                        </Button>
                      </div>
                    </div>
                  )}

                  {task.revisionNotes?.length > 0 ? (
                    <div className="space-y-4 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                      {task.revisionNotes.map(r => (
                        <div key={r.id} className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border-2 border-destructive flex items-center justify-center z-10">
                            <AlertCircle size={12} className="text-destructive" />
                          </div>
                          <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-xs font-bold text-foreground">{r.user?.name || 'Admin Revision'}</p>
                              <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-foreground">{r.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">Belum ada catatan revisi.</div>
                  )}
                </section>
              )}

              {/* Comments (Team Collaboration) */}
              <section className="space-y-4 pb-8">
                <h3 className="text-base font-semibold text-foreground">Team Collaboration</h3>
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatarUrl || ''} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {user?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      className="w-full h-20 rounded-xl border border-border bg-background focus:ring-1 focus:ring-primary focus:border-primary text-sm p-3 resize-none"
                      placeholder="Add a comment or @tag a teammate..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={handleAddComment} disabled={isAddingComment || !commentText.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {task.comments?.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={c.user?.avatarUrl || ''} />
                        <AvatarFallback className="text-[10px] font-bold bg-secondary text-secondary-foreground">
                          {(c.user?.name || c.userId).substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-secondary/10 p-3 rounded-lg border border-border">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-xs text-foreground">{c.user?.name || c.userId}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-foreground">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sticky Footer Actions */}
            {isEditable && (
              <footer className="h-20 px-8 flex items-center justify-end gap-4 border-t border-border bg-card shrink-0">
                <div className="flex items-center gap-3 mr-auto">
                  <span className="text-sm font-medium text-muted-foreground">Change Status:</span>
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-9 text-sm px-3 w-40 bg-background" style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, label]) => (
                        <SelectItem key={k} value={k}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="px-6 rounded-xl" onClick={handleClose}>
                  Discard Changes
                </Button>
                <Button
                  className="px-8 rounded-xl shadow-lg"
                  onClick={handleSaveProgress}
                  disabled={isUpdatingProgress || (task ? !isValidProgress(task.status, progressVal[0]) : false)}
                >
                  Save & Update
                </Button>
              </footer>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
