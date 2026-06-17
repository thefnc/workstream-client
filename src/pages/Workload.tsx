import { useAuthStore } from '../stores/authStore';
import { useWorkload } from '../services/workload';
import { WorkloadCard } from '../components/workload/WorkloadCard';
import { Loader2, BadgeIcon, CheckSquare, PieChart, Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Workload() {
  const user = useAuthStore((state) => state.user);
  const { data: workload, isLoading, isError } = useWorkload();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-3 font-medium">Memuat data tim...</span>
      </div>
    );
  }

  if (isError || !workload) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        <span className="font-medium">Gagal memuat data workload tim.</span>
      </div>
    );
  }

  const totalDesigners = workload.length;
  const totalActiveTasks = workload.reduce((sum, item) => sum + item.activeTasks, 0);
  const teamAvgProgress = totalDesigners ? Math.round(workload.reduce((sum, item) => sum + item.avgProgress, 0) / totalDesigners) : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Workload Monitoring</h2>
        <p className="text-muted-foreground mt-1 text-sm">Monitor team capacity, task distribution, and performance across all designers.</p>
      </div>

      {/* Team Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Active Designers</p>
            <h3 className="text-4xl font-mono text-primary font-bold">{totalDesigners.toString().padStart(2, '0')}</h3>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <BadgeIcon className="text-primary w-7 h-7" />
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Total Active Tasks</p>
            <h3 className="text-4xl font-mono text-primary font-bold">{totalActiveTasks.toString().padStart(2, '0')}</h3>
          </div>
          <div className="w-12 h-12 bg-status-ready/10 rounded-lg flex items-center justify-center">
            <CheckSquare className="text-status-ready w-7 h-7" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Team Avg. Progress</p>
            <div className="flex items-end gap-2">
              <h3 className="text-4xl font-mono text-primary font-bold">{teamAvgProgress}%</h3>
            </div>
          </div>
          <div className="w-12 h-12 bg-status-checking/10 rounded-lg flex items-center justify-center">
            <PieChart className="text-status-checking w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Workload Grid Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-foreground">Designer Capacity Grid</h4>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter size={16} className="text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowUpDown size={16} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Workload Cards Grid */}
      {workload.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {workload.map(item => (
            <WorkloadCard key={item.designerId} data={item} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-border border-dashed">
          Tidak ada desainer atau task aktif.
        </div>
      )}

      {/* Contextual Performance Graph (Mockup from HTML reference) */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="mt-12 bg-primary p-8 rounded-2xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <span className="inline-block px-3 py-1 bg-status-ready text-primary-foreground text-[10px] font-extrabold uppercase rounded mb-4">Optimization Hub</span>
              <h4 className="text-primary-foreground font-bold text-2xl mb-2">Maximize Output Efficiency</h4>
              <p className="text-primary-foreground/70 text-sm">Artiflow intelligence detects some designers are approaching critical load. We suggest redistributing minor revisions to maintain velocity.</p>
              <Button className="mt-6 bg-background text-foreground hover:bg-background/90 hover:scale-105 transition-transform flex items-center gap-2 rounded-xl">
                <Sparkles size={16} />
                Auto-Redistribute Tasks
              </Button>
            </div>
            
            <div className="w-full max-w-sm h-48 bg-background/10 rounded-xl border border-white/10 backdrop-blur-md p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-primary-foreground/60 text-xs font-medium">Projected vs Actual</span>
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-status-ready"></span>
                  <span className="w-2 h-2 rounded-full bg-status-checking"></span>
                </div>
              </div>
              <div className="flex items-end justify-between h-24 gap-2">
                {[48, 80, 64, 112, 56, 96].map((h, i) => (
                  <div key={i} className="w-full bg-white/5 rounded-t-sm relative group/bar">
                    <div className="absolute bottom-0 w-full bg-status-ready/50 rounded-t-sm" style={{ height: `${h/2}px` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-status-checking/20 blur-[100px] -mr-48 -mt-48 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-status-ready/10 blur-[80px] -ml-32 -mb-32 rounded-full pointer-events-none"></div>
        </div>
      )}
    </div>
  );
}
