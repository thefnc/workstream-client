import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTaskDetail, useUpdateProgress, useUpdateStatus, useAddComment, useAddRevision, useUploadAttachment } from '../services/tasks';
import { useAuthStore } from '../stores/authStore';
import { STATUS_LABELS, getStatusColor } from '../lib/status-helper';
import { toast } from 'sonner';
import type { TaskStatus } from '../types';
import { ChevronRight, Calendar, Info, FolderOpen, UploadCloud, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'oklch(0.725 0.15 152)',
  MEDIUM: 'oklch(0.745 0.16 66)',
  HIGH: 'oklch(0.635 0.21 25)',
  URGENT: 'oklch(0.485 0.18 290)',
};

export default function TaskDetail() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

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

  const { data: task, isLoading, isError } = useTaskDetail(taskId || undefined);
  const { mutateAsync: updateProgress, isPending: isUpdatingProgress } = useUpdateProgress();
  const { mutate: updateStatus } = useUpdateStatus();
  const { mutateAsync: addComment, isPending: isAddingComment } = useAddComment();
  const { mutateAsync: addRevision, isPending: isAddingRevision } = useAddRevision();
  const { mutateAsync: uploadAttachment } = useUploadAttachment();

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

  const handleUpload = async (file: File) => {
    if (!task) return;
    try {
      await uploadAttachment({ taskId: task.id, file });
      setSelectedFile(null);
      toast.success('File uploaded successfully');
    } catch {
      toast.error('Failed to upload file');
    }
  };

  if (isLoading) {
    return <LoadingState message="Memuat detail task..." />;
  }

  if (isError || !task) {
    return <ErrorState message="Gagal memuat tugas atau tidak ditemukan." />;
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-0">
      {/* Header */}
      <header className="px-6 md:px-10 py-6 border-b border-border bg-card shrink-0 flex items-start gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="mt-1 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <nav className="flex items-center gap-2 text-muted-foreground mb-2">
            <span className="text-xs font-medium cursor-pointer hover:text-primary" onClick={() => navigate('/dashboard')}>Workstream</span>
            <ChevronRight size={14} />
            <span className="text-xs font-medium cursor-pointer hover:text-primary" onClick={() => navigate('/tasks')}>Tasks</span>
            <ChevronRight size={14} />
            <span className="text-xs font-medium text-foreground">{task.category}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight tracking-tight">
              {task.title}
            </h1>
            <span className="font-mono text-sm bg-secondary/50 border border-border px-3 py-1 rounded-md text-muted-foreground font-semibold">
              {task.referenceNumber}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details & Interaction */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Metadata Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-card rounded-2xl border border-border shadow-sm">
              {/* Status */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: getStatusColor(task.status) }} />
                  <span className="text-sm font-semibold text-foreground">
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-border/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{task.progress}%</span>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Priority</p>
                <Badge
                  variant="outline"
                  className="text-xs font-bold uppercase tracking-wider border-transparent"
                  style={{
                    backgroundColor: `${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW}15`,
                    color: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.LOW
                  }}
                >
                  {task.priority}
                </Badge>
              </div>

              {/* Assigned Designer */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assigned Designer</p>
                <div className="flex items-center gap-3">
                  {task.assignedTo ? (
                    <>
                      <Avatar className="w-8 h-8 border border-border/50">
                        <AvatarImage src={task.assignedTo.avatarUrl || ''} alt={task.assignedTo.name} />
                        <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
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
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category</p>
                <span className="text-sm font-medium text-foreground">{task.category}</span>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Due Date</p>
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <Calendar size={18} />
                  <span className="text-sm font-medium">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date'}
                  </span>
                </div>
              </div>
            </section>

            {/* Instructions */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Instructions</h3>
              <div className="p-6 bg-secondary/10 rounded-2xl border border-border">
                <div className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {task.description || <span className="italic">Tidak ada instruksi yang diberikan.</span>}
                </div>
              </div>
            </section>

            {/* File Reference */}
            {task.fileReference && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  File Reference
                  <Info size={18} className="text-muted-foreground" />
                </h3>
                <div className="flex items-center gap-4 bg-primary/5 text-foreground p-4 rounded-xl border border-primary/20">
                  <FolderOpen size={24} className="text-primary shrink-0" />
                  <code className="flex-1 font-mono text-sm break-all">
                    {task.fileReference}
                  </code>
                  <button
                    className="hover:bg-primary/10 p-2 rounded-lg transition-colors group shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(task.fileReference!);
                      toast.success('Path disalin!');
                    }}
                  >
                    <Info size={20} className="text-muted-foreground group-active:scale-90 transition-transform" />
                  </button>
                </div>
              </section>
            )}

            {/* Comments (Team Collaboration) */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-foreground">Team Collaboration</h3>
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 mt-1">
                  <AvatarImage src={user?.avatarUrl || ''} />
                  <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                    {user?.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <textarea
                    className="w-full h-24 rounded-xl border border-border bg-background focus:ring-1 focus:ring-primary focus:border-primary text-sm p-4 resize-none shadow-sm"
                    placeholder="Add a comment or @tag a teammate..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end mt-3">
                    <Button onClick={handleAddComment} disabled={isAddingComment || !commentText.trim()} className="rounded-xl px-6">
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-5 mt-8">
                {task.comments?.map(c => (
                  <div key={c.id} className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={c.user?.avatarUrl || ''} />
                      <AvatarFallback className="text-xs font-bold bg-secondary text-secondary-foreground">
                        {(c.user?.name || c.userId).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-card p-4 rounded-xl border border-border shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-foreground">{c.user?.name || c.userId}</span>
                        <span className="text-[11px] text-muted-foreground font-medium">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Actions & Updates */}
          <div className="space-y-8">
            
            {/* Action Panel */}
            {isEditable && (
              <section className="p-6 bg-card border border-border rounded-2xl shadow-md sticky top-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Manage Task</h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Change Status</label>
                    <Select value={task.status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full h-11 bg-background font-semibold" style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, label]) => (
                          <SelectItem key={k} value={k} className="font-medium">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Update Progress</label>
                      <span className="text-lg font-bold text-primary">{progressVal[0]}%</span>
                    </div>
                    <Slider
                      value={progressVal}
                      onValueChange={(val: any) => setProgressVal(Array.isArray(val) ? val : [val])}
                      max={100}
                      step={1}
                      disabled={isUpdatingProgress}
                      className="py-2"
                    />
                    <p className={cn(
                      "text-[11px] font-medium leading-tight",
                      task && isValidProgress(task.status, progressVal[0]) ? "text-muted-foreground" : "text-destructive"
                    )}>
                      {task ? getProgressHelperText(task.status) : ''}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progress Note (Optional)</label>
                    <textarea
                      className="w-full h-20 p-3 rounded-xl border border-border bg-background resize-none text-sm focus:ring-1 focus:ring-primary shadow-sm"
                      placeholder="Add a note about this update..."
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      disabled={isUpdatingProgress}
                    />
                  </div>

                  <Button
                    className="w-full h-11 rounded-xl text-base shadow-md"
                    onClick={handleSaveProgress}
                    disabled={isUpdatingProgress || (task ? !isValidProgress(task.status, progressVal[0]) : false)}
                  >
                    Save Changes
                  </Button>
                </div>
              </section>
            )}

            {/* Attachments */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Attachments</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isEditable && (
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-secondary/10 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/30 transition-colors cursor-pointer relative shadow-sm">
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          handleUpload(file);
                          toast.success('Uploading file...');
                        }
                      }}
                    />
                    <UploadCloud size={28} className="mb-3 text-primary/50" />
                    <span className="text-xs font-semibold">Upload File</span>
                  </div>
                )}
                {(!isEditable) && (
                  <div className="col-span-2 text-sm text-muted-foreground p-6 bg-secondary/10 rounded-2xl border border-border text-center">
                    Belum ada lampiran.
                  </div>
                )}
              </div>
            </section>

            {/* Revision Notes */}
            {(task.revisionNotes?.length > 0 || user?.role === 'SUPER_ADMIN') && (
              <section className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-foreground">Revision Notes</h3>

                {user?.role === 'SUPER_ADMIN' && (
                  <div className="flex flex-col gap-3 mb-6 bg-destructive/5 p-4 rounded-2xl border border-destructive/20">
                    <label className="text-xs font-bold text-destructive uppercase tracking-wider">Add Revision</label>
                    <textarea
                      className="w-full h-24 p-3 rounded-xl border border-border bg-background resize-none text-sm focus:ring-1 focus:ring-destructive shadow-sm"
                      placeholder="Tambahkan catatan revisi detail untuk desainer..."
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button variant="destructive" className="rounded-xl px-6 shadow-md" onClick={handleAddRevision} disabled={isAddingRevision || !revisionNote.trim()}>
                        Submit Revision
                      </Button>
                    </div>
                  </div>
                )}

                {task.revisionNotes?.length > 0 ? (
                  <div className="space-y-5 relative before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                    {task.revisionNotes.map(r => (
                      <div key={r.id} className="relative pl-10">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-destructive flex items-center justify-center z-10 shadow-sm">
                          <AlertCircle size={14} className="text-destructive" />
                        </div>
                        <div className="bg-destructive/5 p-5 rounded-xl border border-destructive/20 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-foreground">{r.user?.name || 'Admin Revision'}</p>
                            <span className="text-[11px] font-medium text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{r.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">Belum ada catatan revisi.</div>
                )}
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
