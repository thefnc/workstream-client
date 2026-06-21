import { useState } from 'react';
import { useUsers, useDeactivateUser, type User } from '../services/users';
import { useAuthStore } from '../stores/authStore';
import { Loader2, Plus, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '../components/ui/dropdown-menu';

import { CreateUserModal } from '../components/users/CreateUserModal';
import { EditUserModal } from '../components/users/EditUserModal';

export default function Users() {
  const currentUser = useAuthStore((state) => state.user);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data: usersData, isLoading } = useUsers({
    page,
    limit: 10,
    search: search || undefined,
    role: role !== 'all' ? role : undefined,
    status: status !== 'all' ? status : undefined,
  });

  const { mutateAsync: deactivateUser } = useDeactivateUser();

  const users = usersData?.items || [];
  const meta = usersData?.meta;

  const handleDeactivate = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menonaktifkan pengguna ini?')) {
      try {
        await deactivateUser(id);
        toast.success('Pengguna berhasil dinonaktifkan');
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Gagal menonaktifkan pengguna');
      }
    }
  };

  const getRoleLabel = (r: string) => {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      DESIGNER: 'Desainer',
      VIEWER: 'Pemantau',
    };
    return map[r] || r;
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Pengguna</h1>
          <p className="text-sm text-muted-foreground">Atur akses, peran, dan data profil pengguna sistem.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <div className="bg-card border border-border p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
        <div className="space-y-1.5 w-full md:w-64">
          <label className="text-xs font-semibold text-muted-foreground">Pencarian</label>
          <Input
            placeholder="Cari nama atau username..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="space-y-1.5 w-full md:w-48">
          <label className="text-xs font-semibold text-muted-foreground">Role / Peran</label>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Peran</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              <SelectItem value="DESIGNER">Desainer</SelectItem>
              <SelectItem value="VIEWER">Pemantau</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 w-full md:w-48">
          <label className="text-xs font-semibold text-muted-foreground">Status</label>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="w-[80px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    Tidak ada pengguna yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">@{u.username}</TableCell>
                    <TableCell>
                      <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-xs font-semibold">
                        {getRoleLabel(u.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive text-sm font-medium">
                          <XCircle className="w-4 h-4" /> Nonaktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(u.createdAt), 'dd MMM yyyy', { locale: idLocale })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors border-0 bg-transparent cursor-pointer">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditUser(u)}>
                              Edit Profil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              disabled={currentUser?.id === u.id || !u.isActive}
                              onClick={() => handleDeactivate(u.id)}
                            >
                              Nonaktifkan
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
    </div>
  );
}
