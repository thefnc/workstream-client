import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useWorkload, useWorkloadDetail } from '../services/workload';
import { Loader2, ArrowLeft } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/ui/button';
import type { TaskStatus } from '../types';

const STATUS_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'QUEUE', label: 'Antrian' },
  { status: 'WORKING', label: 'Dikerjakan' },
  { status: 'CHECKING', label: 'Dicek' },
  { status: 'REVISION', label: 'Revisi' },
  { status: 'READY_UPLOAD', label: 'Siap Upload' },
  { status: 'DONE', label: 'Selesai' },
];

export default function WorkloadDetail() {
  const { designerId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: workloadList, isLoading: isLoadingList } = useWorkload();
  const { data: detailTasks, isLoading: isLoadingDetail } = useWorkloadDetail(designerId);

  // Proteksi role: Designer hanya bisa melihat halamannya sendiri
  if (user?.role === 'DESIGNER' && user?.id !== designerId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoadingList || isLoadingDetail) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const profile = workloadList?.find((w) => w.designerId === designerId);

  if (!profile) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Data desainer tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Detail Workload: {profile.designerName}</h1>
          <p className="text-sm text-muted-foreground">Tinjauan lengkap beban kerja dan daftar tugas.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">Tugas Aktif</p>
          <p className="text-2xl font-bold text-primary">{profile.activeTasks}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">Dikerjakan</p>
          <p className="text-2xl font-bold text-blue-500">{profile.workingTasks}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">Revisi</p>
          <p className="text-2xl font-bold text-orange-500">{profile.revisionTasks}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">Overdue</p>
          <p className="text-2xl font-bold text-destructive">{profile.overdueTasks}</p>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">Rata-rata Progress</p>
          <p className="text-2xl font-bold text-green-500">{profile.avgProgress}%</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-6 min-w-max pb-4">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = detailTasks?.[col.status] || [];
            return (
              <div key={col.status} className="w-[320px] flex flex-col bg-muted/30 rounded-xl border border-border/50">
                <div className="p-4 flex items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-sm rounded-t-xl">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {col.label}
                    <span className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full font-medium">
                      {columnTasks.length}
                    </span>
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {columnTasks.map((task: any) => (
                    <div key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="cursor-pointer">
                      <TaskCard task={task} />
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-border/50 rounded-lg">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
