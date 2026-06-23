import { useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import { useAuthStore } from '../stores/authStore';
import { useWorkload, useWorkloadDetail } from '../services/workload';
import { useUpdateStatus } from '../services/tasks';
import { ArrowLeft } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { getStatusColor } from '../lib/status-helper';
import type { TaskStatus, Task } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ForbiddenState } from '../components/ui/ForbiddenState';

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

  const { data: workloadList, isLoading: isLoadingList, isError: isErrorList } = useWorkload();
  const { data: detailTasks, isLoading: isLoadingDetail, isError: isErrorDetail } = useWorkloadDetail(designerId);
  const { mutate: updateStatus } = useUpdateStatus();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Proteksi role: Designer hanya bisa melihat halamannya sendiri
  if (user?.role === 'DESIGNER' && user?.id !== designerId) {
    return <ForbiddenState message="Anda hanya dapat melihat beban kerja Anda sendiri." />;
  }

  if (isLoadingList || isLoadingDetail) {
    return <LoadingState message="Memuat detail beban kerja..." />;
  }

  if (isErrorList || isErrorDetail) {
    return <ErrorState message="Gagal memuat beban kerja. Periksa koneksi Anda." />;
  }

  const profile = workloadList?.find((w) => w.designerId === designerId);

  if (!profile) {
    return <ErrorState title="Tidak Ditemukan" message="Data desainer tidak ditemukan." />;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const allTasks: Task[] = Object.values(detailTasks || {}).flat() as Task[];
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      const isViewer = user?.role === 'VIEWER';
      const isDesigner = user?.role === 'DESIGNER';
      const isMyTask = task.assignedTo?.id === user?.id;

      if (isViewer || (isDesigner && !isMyTask)) {
        toast.error('Anda tidak memiliki izin untuk memindahkan tugas ini.');
        return;
      }
      setActiveTask(task);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const allTasks: Task[] = Object.values(detailTasks || {}).flat() as Task[];
    let newStatus = overId as TaskStatus;

    if (!STATUS_COLUMNS.some((col) => col.status === newStatus)) {
      const overTask = allTasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (!STATUS_COLUMNS.some((col) => col.status === newStatus)) return;

    const taskToMove = allTasks.find((t) => t.id === activeId);
    if (taskToMove && taskToMove.status !== newStatus) {
      updateStatus({ taskId: taskToMove.id, status: newStatus });
      toast.success('Status tugas berhasil diperbarui');
    }
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-6 min-w-max pb-4">
            {STATUS_COLUMNS.map((col) => (
              <WorkloadColumn
                key={col.status}
                status={col.status}
                label={col.label}
                tasks={detailTasks?.[col.status] || []}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDraggable={true} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function WorkloadColumn({ status, label, tasks }: { status: TaskStatus; label: string; tasks: Task[] }) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="w-[320px] flex flex-col bg-muted/30 rounded-xl border border-border/50">
      <div className="p-4 flex items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-sm rounded-t-xl">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: getStatusColor(status) }} />
          {label}
          <span className="bg-muted text-muted-foreground text-xs py-0.5 px-2 rounded-full font-medium">
            {tasks.length}
          </span>
        </h3>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} isDraggable={true} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-border/50 rounded-lg opacity-60">
            Kosong
          </div>
        )}
      </div>
    </div>
  );
}
