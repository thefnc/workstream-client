import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '../services/tasks';
import { useDashboardSummary } from '../services/dashboard';
import { useAuthStore } from '../stores/authStore';
import { STATUS_LABELS, getStatusColor } from '../lib/status-helper';
import type { Task } from '../types';

function isDueToday(task: Task) {
  const today = new Date();
  const due = new Date(task.dueDate);
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate() &&
    task.status !== 'DONE'
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useDashboardSummary();
  const { data: tasksData, isLoading: isLoadingTasks, isError: isErrorTasks } = useTasks({ limit: 5 });
  
  const tasks = tasksData?.items || [];

  const metrics = useMemo(() => {
    if (summary) {
      return {
        total: summary.totalTasks,
        working: summary.workingCount,
        revision: summary.revisionCount,
        readyUpload: summary.readyUploadCount,
        overdue: summary.overdueCount,
      };
    }
    return { total: 0, working: 0, revision: 0, readyUpload: 0, overdue: 0 };
  }, [summary]);

  const myTasks = useMemo(
    () => tasks.filter((t: Task) => t.assignedTo?.id === user?.id && t.status !== 'DONE').slice(0, 5),
    [tasks, user]
  );

  const dueTodayTasks = useMemo(
    () => tasks.filter(isDueToday).slice(0, 5),
    [tasks]
  );

  if (isErrorSummary || isErrorTasks) {
    return (
      <div className="p-8">
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg font-medium">
          Failed to load dashboard data. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoadingSummary || isLoadingTasks) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 flex-1 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Metric Cards */}
      <div className="dashboard__metrics">
        <MetricCard label="Total Tasks" value={metrics.total} color="oklch(0.685 0.111 245)" />
        <MetricCard label="Dikerjakan" value={metrics.working} color={getStatusColor('WORKING')} />
        <MetricCard label="Revisi" value={metrics.revision} color={getStatusColor('REVISION')} />
        <MetricCard label="Siap Upload" value={metrics.readyUpload} color={getStatusColor('READY_UPLOAD')} />
        <MetricCard label="Overdue" value={metrics.overdue} color="oklch(0.635 0.21 25)" />
      </div>

      {/* Grid: My Tasks + Due Today */}
      <div className="dashboard__grid">
        <Card>
          <CardHeader>
            <CardTitle className="dashboard__section-title">My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard__task-list">
              {myTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks assigned to you.</p>
              ) : (
                myTasks.map((task) => <TaskItem key={task.id} task={task} />)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="dashboard__section-title">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard__task-list">
              {dueTodayTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks due today.</p>
              ) : (
                dueTodayTasks.map((task) => <TaskItem key={task.id} task={task} />)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="metric-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="metric-card__indicator" style={{ background: color }} />
        <div>
          <p className="metric-card__label">{label}</p>
          <p className="metric-card__value">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="dashboard__task-item">
      <div className="dashboard__task-info">
        <span className="dashboard__task-title">{task.title}</span>
        <span className="dashboard__task-ref">{task.referenceNumber}</span>
      </div>
      <div className="dashboard__task-meta">
        <Badge
          variant="outline"
          style={{
            borderColor: getStatusColor(task.status),
            color: getStatusColor(task.status),
          }}
        >
          {STATUS_LABELS[task.status]}
        </Badge>
        <div className="dashboard__progress-bar">
          <div
            className="dashboard__progress-fill"
            style={{
              width: `${task.progress}%`,
              background: getStatusColor(task.status),
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', minWidth: 32, textAlign: 'right' }}>
          {task.progress}%
        </span>
      </div>
    </div>
  );
}
