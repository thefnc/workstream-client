import { useState, useMemo } from 'react';
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
import type {
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

import { useBoardTasks, useUpdateStatus } from '../services/tasks';
import { TaskCard } from '../components/TaskCard';
import { ProgressModal } from '../components/task/ProgressModal';
import { STATUS_LABELS, getStatusColor } from '../lib/status-helper';
import type { TaskStatus, Task, User } from '../types';

const COLUMNS: TaskStatus[] = ['QUEUE', 'WORKING', 'CHECKING', 'REVISION', 'READY_UPLOAD', 'DONE'];

export default function Board() {
  const { user } = useAuthStore();
  const { data: board, isLoading } = useBoardTasks();
  const { mutate: updateStatus } = useUpdateStatus();

  const [search, setSearch] = useState('');
  const [filterDesigner, setFilterDesigner] = useState<string>('all');
  const [filterCategory] = useState<string>('all');
  const [filterPatternSize, setFilterPatternSize] = useState<string>('all');
  const [showMyTasks, setShowMyTasks] = useState(false);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [progressTask, setProgressTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredBoard = useMemo(() => {
    if (!board) return null;
    const result: Record<TaskStatus, Task[]> = {
      QUEUE: [], WORKING: [], CHECKING: [], REVISION: [], READY_UPLOAD: [], DONE: []
    };

    (Object.keys(board) as TaskStatus[]).forEach((status) => {
      result[status] = board[status].filter((t) => {
        const matchSearch = search ? (t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.referenceNumber?.toLowerCase().includes(search.toLowerCase())) : true;

        let matchDesigner = filterDesigner === 'all' || t.assignedTo?.id === filterDesigner;
        if (showMyTasks && user) {
          matchDesigner = t.assignedTo?.id === user.id;
        }

        const matchCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchPatternSize = filterPatternSize === 'all' || t.patternSize?.size.toString() === filterPatternSize;
        return matchSearch && matchDesigner && matchCategory && matchPatternSize;
      });
    });
    return result;
  }, [board, search, filterDesigner, filterCategory, filterPatternSize, showMyTasks, user]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    // Flatten board to find the task
    const allTasks = Object.values(board || {}).flat();
    const task = allTasks.find(t => t.id === active.id);
    if (task) {
      const isViewer = user?.role === 'VIEWER';
      const isDesigner = user?.role === 'DESIGNER';
      const isMyTask = task.assignedTo?.id === user?.id;

      if (isViewer || (isDesigner && !isMyTask)) {
        toast.error("Anda tidak memiliki izin untuk memindahkan tugas ini.");
        return; // Prevent drag interaction by not setting active task (or cancelling)
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

    const allTasks = Object.values(board || {}).flat();
    let newStatus = overId as TaskStatus;
    if (!COLUMNS.includes(newStatus)) {
      const overTask = allTasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (!COLUMNS.includes(newStatus)) return;

    const taskToMove = allTasks.find(t => t.id === activeId);
    if (taskToMove && taskToMove.status !== newStatus) {
      updateStatus({ taskId: taskToMove.id, status: newStatus });
      toast.success(`Task status updating to ${STATUS_LABELS[newStatus]}`);
    }
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading board...</div>;
  if (!board) return null;

  return (
    <div className="p-6 flex flex-col h-full gap-6">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Board</h2>
          <p className="text-muted-foreground mt-1 text-sm">Visual workflow and interactive task status management.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterDesigner} onValueChange={setFilterDesigner}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Designer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Designer</SelectItem>
            {/* TODO: Fetch users from API */}
            {([] as User[]).filter(u => u.role === 'DESIGNER').map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPatternSize} onValueChange={setFilterPatternSize}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Ukuran Pola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ukuran</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="16">16</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2 ml-2 bg-secondary/20 px-3 py-1.5 rounded-lg border border-border">
          <Switch id="my-tasks" checked={showMyTasks} onCheckedChange={setShowMyTasks} />
          <Label htmlFor="my-tasks" className="text-xs font-semibold cursor-pointer">Tugas Saya</Label>
        </div>

        <button className="flex items-center gap-2 px-5 py-2 h-10 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-sm ml-auto">
          <span className="text-lg leading-none">+</span>
          New Task
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
          {COLUMNS.map(status => (
            <BoardColumn
              key={status}
              status={status}
              tasks={filteredBoard?.[status] || []}
              onEditClick={setProgressTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <ProgressModal
        task={progressTask}
        isOpen={!!progressTask}
        onClose={() => setProgressTask(null)}
      />
    </div>
  );
}

function BoardColumn({ status, tasks, onEditClick }: { status: TaskStatus; tasks: Task[]; onEditClick: (task: Task) => void }) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] h-full bg-secondary/30 border border-border rounded-[20px] p-4 gap-4">
      {/* Column Header (inside the card list) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: getStatusColor(status) }} />
          <h3 className="font-bold text-foreground uppercase tracking-tight text-sm">{STATUS_LABELS[status]}</h3>
          <span className="ml-2 px-2 py-0.5 bg-background border border-border rounded-full text-[11px] font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 flex-1 overflow-y-auto"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onEditClick={onEditClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-muted-foreground opacity-50 font-medium text-xs mt-2">
            No tasks in {STATUS_LABELS[status]}
          </div>
        )}
      </div>
    </div>
  );
}
