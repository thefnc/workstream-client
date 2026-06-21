import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useActivities } from '../services/activity';
import { useUsers } from '../services/users';
import { Loader2 } from 'lucide-react';
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
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function Activity() {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [page, setPage] = useState(1);
  const [action, setAction] = useState<string>('all');
  const [userId, setUserId] = useState<string>('all');
  const [taskId, setTaskId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: usersData } = useUsers({ limit: 100 });
  const allUsers = usersData?.items || [];

  const { data: activitiesData, isLoading } = useActivities({
    page,
    limit: 15,
    action: action !== 'all' ? action : undefined,
    userId: userId !== 'all' ? userId : undefined,
    taskId: taskId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const activities = activitiesData?.items || [];
  const meta = activitiesData?.meta;

  const handleResetFilters = () => {
    setAction('all');
    setUserId('all');
    setTaskId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getActionLabel = (act: string) => {
    const map: Record<string, string> = {
      CREATE: 'Tugas Dibuat',
      UPDATE_STATUS: 'Update Status',
      UPDATE_PROGRESS: 'Update Progress',
      COMMENT: 'Komentar',
      REVISION: 'Revisi',
      UPLOAD_ATTACHMENT: 'Upload File',
    };
    return map[act] || act;
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Riwayat Aktivitas</h1>
        <p className="text-sm text-muted-foreground">Log sistem dari semua interaksi tugas.</p>
      </div>

      <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
        <div className="space-y-1.5 w-full md:w-48">
          <label className="text-xs font-semibold text-muted-foreground">Tipe Aksi</label>
          <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Aksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Aksi</SelectItem>
              <SelectItem value="CREATE">Tugas Dibuat</SelectItem>
              <SelectItem value="UPDATE_STATUS">Update Status</SelectItem>
              <SelectItem value="UPDATE_PROGRESS">Update Progress</SelectItem>
              <SelectItem value="COMMENT">Komentar</SelectItem>
              <SelectItem value="REVISION">Revisi</SelectItem>
              <SelectItem value="UPLOAD_ATTACHMENT">Upload File</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isSuperAdmin && (
          <div className="space-y-1.5 w-full md:w-48">
            <label className="text-xs font-semibold text-muted-foreground">Pengguna</label>
            <Select value={userId} onValueChange={(v) => { setUserId(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Pengguna" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Pengguna</SelectItem>
                {allUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5 w-full md:w-48">
          <label className="text-xs font-semibold text-muted-foreground">Task ID (Referensi)</label>
          <Input 
            placeholder="Cari Task ID..." 
            value={taskId} 
            onChange={(e) => { setTaskId(e.target.value); setPage(1); }} 
          />
        </div>

        <div className="space-y-1.5 w-full md:w-40">
          <label className="text-xs font-semibold text-muted-foreground">Dari Tanggal</label>
          <Input 
            type="date"
            value={startDate} 
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }} 
          />
        </div>

        <div className="space-y-1.5 w-full md:w-40">
          <label className="text-xs font-semibold text-muted-foreground">Sampai Tanggal</label>
          <Input 
            type="date"
            value={endDate} 
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }} 
          />
        </div>

        <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
      </div>

      <div className="bg-card border border-border rounded-xl flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-[180px]">Waktu</TableHead>
                <TableHead>Aktor</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Referensi Tugas</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    Tidak ada aktivitas yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((act) => (
                  <TableRow key={act.id}>
                    <TableCell className="text-sm font-medium">
                      {format(new Date(act.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {act.user?.name || 'Sistem'}
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
                          {act.user?.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-semibold">
                        {getActionLabel(act.action)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {act.task ? (act.task.referenceNumber || act.task.title) : '-'}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm">
                      {act.oldValue && act.newValue ? (
                        <span><span className="line-through text-muted-foreground mr-1">{act.oldValue}</span> &rarr; <span className="ml-1 font-medium">{act.newValue}</span></span>
                      ) : act.newValue ? (
                        <span>{act.newValue}</span>
                      ) : (
                        <span className="text-muted-foreground italic">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Menampilkan Halaman {meta.page} dari {meta.totalPages} (Total: {meta.total})
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={meta.page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={meta.page >= meta.totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
