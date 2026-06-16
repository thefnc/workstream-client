import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '../stores/taskStore';
import { STATUS_LABELS, getStatusColor } from '../lib/status-helper';
import type { Task } from '../types';

function isOverdue(task: Task) {
  return new Date(task.dueDate) < new Date() && task.status !== 'DONE';
}

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
  const tasks = useTaskStore((state) => state.tasks);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const working = tasks.filter((t) => t.status === 'WORKING').length;
    const revision = tasks.filter((t) => t.status === 'REVISION').length;
    const readyUpload = tasks.filter((t) => t.status === 'READY_UPLOAD').length;
    const overdue = tasks.filter(isOverdue).length;
    return { total, working, revision, readyUpload, overdue };
  }, [tasks]);

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedTo?.id === 'u1' && t.status !== 'DONE').slice(0, 5),
    [tasks]
  );

  const dueTodayTasks = useMemo(
    () => tasks.filter(isDueToday).slice(0, 5),
    [tasks]
  );

  const workloadData = useMemo(() => {
    // TODO: Fetch users from API
    const users: import('../types').User[] = [];
    const designers = users.filter((u) => u.role === 'DESIGNER');
    return designers.map((designer) => {
      const designerTasks = tasks.filter((t) => t.assignedTo?.id === designer.id);
      const activeTasks = designerTasks.filter((t) => t.status !== 'DONE');
      const avgProgress =
        activeTasks.length > 0
          ? Math.round(activeTasks.reduce((sum, t) => sum + t.progress, 0) / activeTasks.length)
          : 0;
      const overdueCount = designerTasks.filter(isOverdue).length;
      return {
        designer,
        active: activeTasks.length,
        avgProgress,
        overdue: overdueCount,
      };
    });
  }, [tasks]);

  const recentActivity = [
    { text: 'Super Admin assigned "Resize Pattern XXL" to Designer 1', time: '2 min ago' },
    { text: 'Designer 1 updated progress on "Tracing Artwork A-1245" to 65%', time: '15 min ago' },
    { text: 'Super Admin moved "Revisi Warna Navy" to Revision', time: '1 hour ago' },
    { text: 'Designer 2 added a comment on "Layout Motif Rotary"', time: '2 hours ago' },
    { text: 'Designer 1 completed "Cleanup File Design"', time: '3 hours ago' },
  ];

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

      {/* Grid: Workload Overview + Recent Activity */}
      <div className="dashboard__grid">
        <Card>
          <CardHeader>
            <CardTitle className="dashboard__section-title">Workload Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard__workload-list">
              {workloadData.map((data) => (
                <div key={data.designer.id} className="dashboard__workload-item">
                  <span className="dashboard__workload-name">{data.designer.name}</span>
                  <div className="dashboard__workload-stats">
                    <div className="dashboard__workload-stat">
                      <span className="dashboard__workload-stat-value">{data.active}</span>
                      <span className="dashboard__workload-stat-label">Active</span>
                    </div>
                    <div className="dashboard__workload-stat">
                      <span className="dashboard__workload-stat-value">{data.avgProgress}%</span>
                      <span className="dashboard__workload-stat-label">Avg Progress</span>
                    </div>
                    <div className="dashboard__workload-stat">
                      <span className="dashboard__workload-stat-value">{data.overdue}</span>
                      <span className="dashboard__workload-stat-label">Overdue</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="dashboard__section-title">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard__activity-list">
              {recentActivity.map((item, i) => (
                <div key={i} className="dashboard__activity-item">
                  <span className="dashboard__activity-dot" />
                  <div className="dashboard__activity-content">
                    <p className="dashboard__activity-text">{item.text}</p>
                    <span className="dashboard__activity-time">{item.time}</span>
                  </div>
                </div>
              ))}
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
