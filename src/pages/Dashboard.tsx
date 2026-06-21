import { useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '../services/tasks';
import { useDashboardSummary } from '../services/dashboard';
import { useAuthStore } from '../stores/authStore';
import { STATUS_LABELS, getStatusColor } from '../lib/status-helper';
import { useActivities } from '../services/activity';
import type { ActivityLog } from '../services/activity';
import type { Task, TaskStatus } from '../types';
import { Layers as LayersIcon, RefreshCw, MessageSquare, CheckCircle2, AlertTriangle, Play, FileUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

function isDueToday(task: Task) {
  if (!task.dueDate) return false;
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
  const { data: tasksData, isLoading: isLoadingTasks, isError: isErrorTasks } = useTasks({ limit: 10 });
  const { data: activitiesData, isLoading: isLoadingActivities } = useActivities({ limit: 5 });
  
  const tasks = tasksData?.items || [];
  const activities = activitiesData?.items || [];

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

  if (isLoadingSummary || isLoadingTasks || isLoadingActivities) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 flex-1 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] lg:col-span-1 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back, {user?.name}. Here's a summary of today's workflow.</p>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col justify-between group hover:border-primary/20 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Total Tasks</span>
            <LayersIcon size={20} className="text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary">{metrics.total}</span>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col justify-between group hover:border-status-working/20 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">In Progress</span>
            <RefreshCw size={20} className="text-status-working" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary">{metrics.working}</span>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col justify-between group hover:border-status-revision/20 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Revision</span>
            <AlertTriangle size={20} className="text-status-revision" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary">{metrics.revision}</span>
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex flex-col justify-between group hover:border-status-ready/20 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Ready</span>
            <CheckCircle2 size={20} className="text-status-ready" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary">{metrics.readyUpload}</span>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 shadow-sm rounded-xl p-5 flex flex-col justify-between group hover:border-destructive/40 transition-all cursor-default">
          <div className="flex justify-between items-start">
            <span className="text-xs text-destructive uppercase tracking-wider font-bold">Overdue</span>
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-destructive">{metrics.overdue}</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Task List & Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* Left Column: My Priority Tasks & Due Today */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* My Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">My Priority Tasks</h3>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Design ID</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Artwork Title</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Status</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Progress</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          No tasks assigned to you.
                        </td>
                      </tr>
                    ) : (
                      myTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="py-3 px-5 font-mono text-xs text-primary font-medium">
                            <Link to={`/tasks/${task.id}`} className="hover:underline">{task.referenceNumber}</Link>
                          </td>
                          <td className="py-3 px-5 text-sm font-semibold text-primary">{task.title}</td>
                          <td className="py-3 px-5">
                            <Badge variant="outline" style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}>
                              {STATUS_LABELS[task.status]}
                            </Badge>
                          </td>
                          <td className="py-3 px-5 w-32">
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-muted-foreground">{task.progress}%</span>
                              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-sm text-muted-foreground">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Due Today Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">Due Today</h3>
            </div>
            <Card className="overflow-hidden border-destructive/20 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-destructive/5 border-b border-border">
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Design ID</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Artwork Title</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Status</th>
                      <th className="py-3 px-5 text-xs text-muted-foreground uppercase tracking-tight font-medium">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dueTodayTasks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          No tasks due today.
                        </td>
                      </tr>
                    ) : (
                      dueTodayTasks.map((task) => (
                        <tr key={task.id} className="hover:bg-destructive/5 transition-colors group">
                          <td className="py-3 px-5 font-mono text-xs text-primary font-medium">
                            <Link to={`/tasks/${task.id}`} className="hover:underline">{task.referenceNumber}</Link>
                          </td>
                          <td className="py-3 px-5 text-sm font-semibold text-primary">{task.title}</td>
                          <td className="py-3 px-5">
                            <Badge variant="outline" style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}>
                              {STATUS_LABELS[task.status]}
                            </Badge>
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              {task.assignedTo ? (
                                <>
                                  <Avatar className="w-6 h-6 border border-background">
                                    <AvatarImage src={task.assignedTo.avatarUrl || ''} />
                                    <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">{task.assignedTo.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{task.assignedTo.name}</span>
                                </>
                              ) : (
                                <span className="text-xs italic text-muted-foreground">Unassigned</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>

        {/* Right Column: Recent Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Recent Activity</h3>
          <Card className="p-6 h-full min-h-[500px]">
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm pt-10">
                No recent activity.
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
                {activities.map((act) => (
                  <ActivityItem key={act.id} activity={act} />
                ))}
              </div>
            )}
          </Card>
        </div>

      </section>
    </div>
  );
}

function ActivityItem({ activity }: { activity: ActivityLog }) {
  const userName = activity.user?.name || 'System';
  const taskRef = activity.task?.referenceNumber || 'Unknown Task';
  
  // Choose icon based on action
  let icon = <Play size={12} className="text-background" fill="currentColor" />;
  let bgColor = 'bg-primary';

  switch (activity.action) {
    case 'CREATE':
      icon = <Play size={12} className="text-background" fill="currentColor" />;
      bgColor = 'bg-status-working';
      break;
    case 'UPDATE_STATUS':
      icon = <RefreshCw size={12} className="text-background" />;
      bgColor = 'bg-primary';
      break;
    case 'UPDATE_PROGRESS':
      icon = <Play size={12} className="text-background" fill="currentColor" />;
      bgColor = 'bg-status-checking';
      break;
    case 'REVISION':
      icon = <AlertTriangle size={12} className="text-background" />;
      bgColor = 'bg-status-revision';
      break;
    case 'COMMENT':
      icon = <MessageSquare size={12} className="text-background" />;
      bgColor = 'bg-status-ready';
      break;
    case 'UPLOAD_ATTACHMENT':
      icon = <FileUp size={12} className="text-background" />;
      bgColor = 'bg-accent';
      break;
  }

  return (
    <div className="relative pl-8">
      <div className={cn("absolute left-0 top-1 w-[24px] h-[24px] rounded-full flex items-center justify-center border-4 border-card z-10", bgColor)}>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-sm text-foreground">
          {getActivityText(activity, userName, taskRef)}
        </p>
        <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tight">
          {new Date(activity.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function getActivityText(activity: ActivityLog, userName: string, taskRef: string) {
  switch(activity.action) {
    case 'CREATE': 
      return <><span className="font-bold">{userName}</span> created task <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link></>;
    case 'UPDATE_STATUS': 
      return <><span className="font-bold">{userName}</span> moved <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link> to <span className="font-semibold">{activity.newValue ? STATUS_LABELS[activity.newValue as TaskStatus] : 'New Status'}</span></>;
    case 'UPDATE_PROGRESS': 
      return <><span className="font-bold">{userName}</span> updated progress on <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link> to <span className="font-semibold">{activity.newValue}%</span></>;
    case 'COMMENT': 
      return <><span className="font-bold">{userName}</span> commented on <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link></>;
    case 'REVISION': 
      return (
        <>
          <span className="font-bold">{userName}</span> added a revision note to <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link>
          <p className="text-[11px] text-muted-foreground mt-2 p-2 bg-destructive/5 rounded-md border-l-2 border-destructive italic line-clamp-2">
            "{activity.newValue}"
          </p>
        </>
      );
    case 'UPLOAD_ATTACHMENT': 
      return <><span className="font-bold">{userName}</span> uploaded an attachment to <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link></>;
    default: 
      return <><span className="font-bold">{userName}</span> performed an action on <Link to={`/tasks/${activity.task?.id}`} className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border hover:underline">{taskRef}</Link></>;
  }
}
