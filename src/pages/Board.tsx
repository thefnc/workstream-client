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
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={filterDesigner} onValueChange={(v) => v && setFilterDesigner(v)}>
          <SelectTrigger className="w-full sm:w-40 flex-1">
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
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={(v) => v && setFilterPriority(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] bg-slate-50 border border-slate-200 rounded-2xl p-3 h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-700" />
          <h3 className="font-semibold text-slate-700">{STATUS_LABELS[status]}</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div 
        ref={setNodeRef}
        className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[150px]"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
