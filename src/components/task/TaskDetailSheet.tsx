import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTaskDetail, useUpdateProgress, useUpdateStatus, useAddComment, useAddRevision, useUploadAttachment } from '../../services/tasks';
import { useAuthStore } from '../../stores/authStore';
import { STATUS_LABELS, getStatusColor } from '../../lib/status-helper';
import { toast } from 'sonner';
import type { TaskStatus } from '../../types';

export function TaskDetailSheet() {
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
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col p-0 gap-0">
        <ScrollArea className="flex-1 h-full">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">Memuat detail task...</div>
            ) : isError || !task ? (
              <div className="flex items-center justify-center h-64 text-destructive font-medium">Gagal memuat tugas atau tidak ditemukan.</div>
            ) : (
              <div className="flex flex-col gap-6">
                <SheetHeader className="text-left space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-secondary/30 text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                        {task.referenceNumber}
                      </span>
                      {isEditable ? (
                        <Select value={task.status} onValueChange={handleStatusChange}>
                          <SelectTrigger className="h-6 text-xs px-2" style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([k, label]) => (
                              <SelectItem key={k} value={k}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}>
                          {STATUS_LABELS[task.status]}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <SheetTitle className="text-2xl font-bold leading-tight">{task.title}</SheetTitle>
                  <SheetDescription className="text-sm">
                    Kategori: <strong className="text-foreground">{task.category}</strong> • 
                    Prioritas: <strong className="text-foreground">{task.priority}</strong>
                  </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="overview" className="w-full mt-2">
                  <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent flex-wrap gap-4 sm:gap-6">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Overview</TabsTrigger>
                    <TabsTrigger value="progress" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Update Progress</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">History</TabsTrigger>
                    <TabsTrigger value="comments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Comments</TabsTrigger>
                    <TabsTrigger value="revisions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Revisions</TabsTrigger>
                    <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2">Files</TabsTrigger>
                  </TabsList>

                  <div className="pt-6">
                    <TabsContent value="overview" className="m-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium">Assigned To</span>
                          <div className="flex items-center gap-2">
                            {task.assignedTo ? (
                              <>
                                {task.assignedTo.avatarUrl ? (
                                  <img src={task.assignedTo.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                                    {task.assignedTo.name.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm font-medium">{task.assignedTo.name}</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground italic">Unassigned</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground font-medium">Due Date</span>
                          <p className="text-sm font-medium">
                            {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-semibold">Deskripsi Instruksi</span>
                        <div className="p-4 bg-secondary/30 rounded-lg text-sm border border-border min-h-[100px] whitespace-pre-wrap">
                          {task.description || <span className="text-muted-foreground italic">Tidak ada deskripsi.</span>}
                        </div>
                      </div>

                      {task.fileReference && (
                        <div className="space-y-2">
                          <span className="text-sm font-semibold">File Reference</span>
                          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                            <span className="font-mono text-xs flex-1 truncate">{task.fileReference}</span>
                            <Button variant="secondary" size="sm" onClick={() => {
                              navigator.clipboard.writeText(task.fileReference!);
                              toast.success('Path disalin!');
                            }}>
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="progress" className="m-0 space-y-6">
                      <div className="flex flex-col gap-6 p-5 border border-border rounded-xl shadow-sm bg-card">
                        <div className="flex justify-between items-center">
                          <div className="space-y-0.5">
                            <h4 className="font-semibold text-sm">Update Progress</h4>
                            <p className="text-xs text-muted-foreground">Ubah progress tugas saat ini.</p>
                          </div>
                          <span className="text-2xl font-bold">{progressVal[0]}%</span>
                        </div>
                        
                        <Slider
                          value={progressVal}
                          onValueChange={(val: number[]) => setProgressVal(val)}
                          max={100}
                          step={1}
                          disabled={!isEditable || isUpdatingProgress}
                        />

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Catatan Progress (Opsional)</label>
                          <textarea 
                            className="w-full h-24 p-3 rounded-md border border-border bg-background resize-none text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Apa yang telah Anda kerjakan hari ini?"
                            value={progressNote}
                            onChange={(e) => setProgressNote(e.target.value)}
                            disabled={!isEditable || isUpdatingProgress}
                          />
                        </div>

                        {!isEditable ? (
                          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md font-medium text-center">
                            Anda tidak memiliki izin untuk mengupdate tugas ini.
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <Button onClick={handleSaveProgress} disabled={isUpdatingProgress}>
                              {isUpdatingProgress ? 'Menyimpan...' : 'Simpan Progress'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="m-0">
                      {task.progressLogs && task.progressLogs.length > 0 ? (
                        <div className="space-y-4">
                          {task.progressLogs.map(log => (
                            <div key={log.id} className="p-4 border border-border rounded-lg bg-card/50">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                                <span className="text-sm font-bold">{log.previousProgress}% → {log.newProgress}%</span>
                              </div>
                              {log.note && <p className="text-sm">{log.note}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                          Belum ada history progress.
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="comments" className="m-0 space-y-6">
                      <div className="flex flex-col gap-3">
                        <textarea 
                          className="w-full h-24 p-3 rounded-md border border-border bg-background resize-none text-sm"
                          placeholder="Tulis komentar..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleAddComment} disabled={isAddingComment || !commentText.trim()}>
                            Kirim Komentar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {task.comments && task.comments.length > 0 ? (
                          task.comments.map(c => (
                            <div key={c.id} className="p-4 bg-secondary/20 rounded-lg border border-border space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-sm">{c.userId}</span>
                                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm">{c.comment}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">Belum ada komentar.</div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="revisions" className="m-0 space-y-6">
                      {user?.role === 'SUPER_ADMIN' && (
                        <div className="flex flex-col gap-3">
                          <textarea 
                            className="w-full h-24 p-3 rounded-md border border-border bg-background resize-none text-sm"
                            placeholder="Catatan revisi (hanya untuk Admin)..."
                            value={revisionNote}
                            onChange={(e) => setRevisionNote(e.target.value)}
                          />
                          <div className="flex justify-end">
                            <Button variant="destructive" onClick={handleAddRevision} disabled={isAddingRevision || !revisionNote.trim()}>
                              Tambahkan Revisi
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {task.revisionNotes && task.revisionNotes.length > 0 ? (
                          task.revisionNotes.map(r => (
                            <div key={r.id} className="p-4 bg-destructive/10 border-destructive/30 rounded-lg border space-y-2">
                              <div className="flex justify-between">
                                <span className="font-semibold text-sm text-destructive">User</span>
                                <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm font-medium">{r.note}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">Belum ada revisi.</div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="files" className="m-0 space-y-6">
                      {isEditable && (
                        <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-card">
                          <input 
                            type="file" 
                            className="text-sm flex-1"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                          <Button onClick={handleUpload} disabled={isUploading || !selectedFile}>
                            Upload
                          </Button>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Task.attachments array missing from type, assuming it's task.attachments if added by backend */}
                        {/* Using a placeholder message if API doesn't return them yet */}
                        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                          Daftar file preview akan muncul di sini.
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
