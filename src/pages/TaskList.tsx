import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useTasks } from '../services/tasks';
import { useAuthStore } from '../stores/authStore';
import { STATUS_LABELS, getStatusColor } from '../lib/status-helper';
import type { Task } from '../types';

export default function TaskList() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [designerFilter, setDesignerFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [patternSizeFilter, setPatternSizeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  
  const limit = 10;
  
  const queryParams: Record<string, any> = { page, limit };
  if (search) queryParams.search = search;
  if (statusFilter !== 'all') queryParams.status = statusFilter;
  if (designerFilter !== 'all') queryParams.assignedToId = designerFilter;
  if (categoryFilter !== 'all') queryParams.categoryId = categoryFilter;
  if (priorityFilter !== 'all') queryParams.priorityId = priorityFilter;
  if (patternSizeFilter !== 'all') queryParams.patternSize = patternSizeFilter;
  queryParams.sortBy = sortBy;
  queryParams.sortOrder = sortOrder;

  const { data, isLoading, isError } = useTasks(queryParams);

  const tasks: Task[] = data?.items || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const handleRowClick = (taskId: string) => {
    searchParams.set('taskId', taskId);
    setSearchParams(searchParams);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="p-6 max-w-[1400px] mx-auto flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground text-sm">Kelola semua daftar pekerjaan</p>
        </div>
        {isSuperAdmin && (
          <Button>+ New Task</Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari berdasarkan referensi atau judul..."
            className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={designerFilter} onValueChange={(v) => { setDesignerFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Designer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Designer</SelectItem>
            {/* Ideally fetched from backend, mocking for now as API might not exist */}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-10">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px] h-10">
            <SelectValue placeholder="Prioritas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Prioritas</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={patternSizeFilter} onValueChange={(v) => { setPatternSizeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[120px] h-10">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Size</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="16">16</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { 
            const [by, order] = v.split('-');
            setSortBy(by);
            setSortOrder(order);
            setPage(1);
          }}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate-asc">Deadline (Terdekat)</SelectItem>
              <SelectItem value="dueDate-desc">Deadline (Terjauh)</SelectItem>
              <SelectItem value="createdAt-desc">Dibuat (Terbaru)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-secondary/30">
                <TableHead className="w-[120px]">Ref No</TableHead>
                <TableHead>Judul Task</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Desainer</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-32 text-destructive font-medium">
                    Gagal memuat data.
                  </TableCell>
                </TableRow>
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                    Tidak ada tugas yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(task.id)}
                  >
                    <TableCell className="font-mono text-xs">{task.referenceNumber}</TableCell>
                    <TableCell className="font-semibold">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-[11px] rounded-md">
                        {task.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-xs">{task.patternSize?.size || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: getStatusColor(task.status), color: getStatusColor(task.status) }}
                      >
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) }} 
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {task.assignedTo ? (
                          <>
                            {task.assignedTo.avatarUrl ? (
                              <img src={task.assignedTo.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                                {task.assignedTo.name.substring(0,2).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs">{task.assignedTo.name}</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                        {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background">
            <p className="text-xs text-muted-foreground">
              Menampilkan {(meta.page - 1) * limit + 1} hingga {Math.min(meta.page * limit, meta.total)} dari {meta.total} tugas
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={meta.page <= 1 || isLoading}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-medium px-2">Page {meta.page} of {meta.totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={meta.page >= meta.totalPages || isLoading}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
