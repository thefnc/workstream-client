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
} from '@/components/ui/select';
import { toast } from 'sonner';

import { useTaskStore } from '../stores/taskStore';
import { TaskCard } from '../components/TaskCard';
import { users } from '../data/users';
import { categories } from '../data/categories';
import { priorities } from '../data/priorities';
import { STATUS_LABELS } from '../types';
import type { TaskStatus, Task } from '../types';

const COLUMNS: TaskStatus[] = ['QUEUE', 'WORKING', 'CHECKING', 'REVISION', 'READY_UPLOAD', 'DONE'];

export default function Board() {
  const { tasks, moveTaskStatus } = useTaskStore();
  
  const [search, setSearch] = useState('');
  const [filterDesigner, setFilterDesigner] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.referenceNumber.toLowerCase().includes(search.toLowerCase());
      const matchDesigner = filterDesigner === 'all' || t.assignedTo?.id === filterDesigner;
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchSearch && matchDesigner && matchCategory && matchPriority;
    });
  }, [tasks, search, filterDesigner, filterCategory, filterPriority]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      QUEUE: [], WORKING: [], CHECKING: [], REVISION: [], READY_UPLOAD: [], DONE: []
    };
    filteredTasks.forEach(t => grouped[t.status].push(t));
    return grouped;
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // over.id can be a status (the column) or a task id
    let newStatus = overId as TaskStatus;
    if (!COLUMNS.includes(newStatus)) {
      // dropped on another task
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (!COLUMNS.includes(newStatus)) return;

    const taskToMove = tasks.find(t => t.id === activeId);
    if (taskToMove && taskToMove.status !== newStatus) {
      moveTaskStatus(taskToMove.id, newStatus);
      toast.success(`Task moved to ${STATUS_LABELS[newStatus]}`);
    }
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Page Header (Search & Filter) */}
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
        
        <Select value={filterDesigner} onValueChange={(v) => v && setFilterDesigner(v)}>
          <SelectTrigger className="w-[140px] lg:w-[160px] bg-background border border-border rounded-xl h-10">
            <SelectValue placeholder="Designer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Designers</SelectItem>
            {users.filter(u => u.role === 'DESIGNER').map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-[140px] lg:w-[160px] bg-background border border-border rounded-xl h-10">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <BoardColumn key={status} status={status} tasks={tasksByStatus[status]} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function BoardColumn({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const getStatusColor = (status: TaskStatus) => {
    const COLORS: Record<TaskStatus, string> = {
      QUEUE: 'oklch(0.68 0.02 250)',
      WORKING: 'oklch(0.685 0.111 245)',
      CHECKING: 'oklch(0.745 0.16 66)',
      REVISION: 'oklch(0.635 0.21 25)',
      READY_UPLOAD: 'oklch(0.725 0.15 152)',
      DONE: 'oklch(0.259 0.086 257.4)',
    };
    return COLORS[status];
  };

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
            <TaskCard key={task.id} task={task} />
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
