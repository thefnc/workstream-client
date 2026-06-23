import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useUpdateUser, type User } from '../../services/users';
import { toast } from 'sonner';

interface EditUserModalProps {
  user: User | null;
  onClose: () => void;
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'DESIGNER',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        password: '', // leave empty unless they want to change
        role: user.role,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.name || !formData.username) {
      toast.error('Nama dan Username wajib diisi');
      return;
    }

    const payload: any = {
      name: formData.name,
      username: formData.username,
      role: formData.role,
    };

    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error('Password minimal 6 karakter');
        return;
      }
      payload.password = formData.password;
    }

    try {
      await updateUser({ id: user.id, payload });
      toast.success('Pengguna berhasil diperbarui');
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui pengguna');
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Ubah detail profil pengguna. Kosongkan password jika tidak ingin mengubahnya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input id="edit-name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-username">Username <span className="text-destructive">*</span></Label>
            <Input id="edit-username" name="username" value={formData.username} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-password">Password Baru</Label>
            <Input id="edit-password" name="password" type="password" placeholder="Biarkan kosong jika tidak diubah" value={formData.password} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role / Peran <span className="text-destructive">*</span></Label>
            <Select value={formData.role} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="DESIGNER">Desainer</SelectItem>
                <SelectItem value="VIEWER">Pemantau</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Batal</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
