import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateTask, type CreateTaskPayload } from '@/services/tasks';
import { useCategories, usePriorities, usePatternSizes, useDesigners } from '@/services/options';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskDialog({ isOpen, onClose }: CreateTaskDialogProps) {
  const { mutateAsync: createTask, isPending } = useCreateTask();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: priorities, isLoading: isLoadingPriorities } = usePriorities();
  const { data: patternSizes, isLoading: isLoadingPatternSizes } = usePatternSizes();
  const { data: designers, isLoading: isLoadingDesigners } = useDesigners();

  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: '',
    referenceNumber: '',
    description: '',
    fileReference: '',
    categoryId: '',
    priorityId: '',
    patternSizeId: '',
    assignedToId: 'unassigned', // using 'unassigned' as a default state, will map to undefined
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: keyof CreateTaskPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.priorityId || !formData.patternSizeId) {
      toast.error('Mohon isi semua kolom yang wajib (*)');
      return;
    }

    try {
      const payload = { ...formData };
      if (payload.assignedToId === 'unassigned') {
        payload.assignedToId = undefined;
      }

      await createTask(payload);
      toast.success('Tugas berhasil dibuat!');
      onClose();
      // Reset form
      setFormData({
        title: '',
        referenceNumber: '',
        description: '',
        fileReference: '',
        categoryId: '',
        priorityId: '',
        patternSizeId: '',
        assignedToId: 'unassigned',
      });
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat tugas. Periksa koneksi Anda.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] h-max max-h-[90vh] overflow-y-auto p-6 bg-background rounded-2xl border border-border shadow-lg">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-primary">Buat Tugas Baru</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1">
            Isi detail di bawah ini untuk menambahkan tugas baru ke dalam antrean (Queue).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="text-sm font-semibold">Judul Tugas <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                name="title"
                placeholder="Contoh: Penyesuaian Pola Bunga"
                value={formData.title}
                onChange={handleChange}
                className="bg-muted/30 border-border focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNumber" className="text-sm font-semibold">Nomor Referensi (Opsional)</Label>
              <Input
                id="referenceNumber"
                name="referenceNumber"
                placeholder="Contoh: PRJ-2024-001"
                value={formData.referenceNumber}
                onChange={handleChange}
                className="bg-muted/30 border-border focus-visible:ring-primary/30 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedToId" className="text-sm font-semibold">Tugaskan Kepada (Opsional)</Label>
              <Select value={formData.assignedToId} onValueChange={(val) => handleSelectChange('assignedToId', val)}>
                <SelectTrigger className="bg-muted/30 border-border focus:ring-primary/30">
                  <SelectValue placeholder="Pilih Desainer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Belum Ditugaskan</SelectItem>
                  {isLoadingDesigners ? (
                    <div className="p-2 text-sm text-muted-foreground flex justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>
                  ) : designers?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-sm font-semibold">Kategori <span className="text-destructive">*</span></Label>
              <Select value={formData.categoryId} onValueChange={(val) => handleSelectChange('categoryId', val)}>
                <SelectTrigger className="bg-muted/30 border-border focus:ring-primary/30">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <div className="p-2 text-sm text-muted-foreground flex justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>
                  ) : categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorityId" className="text-sm font-semibold">Prioritas <span className="text-destructive">*</span></Label>
              <Select value={formData.priorityId} onValueChange={(val) => handleSelectChange('priorityId', val)}>
                <SelectTrigger className="bg-muted/30 border-border focus:ring-primary/30">
                  <SelectValue placeholder="Pilih Prioritas" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPriorities ? (
                    <div className="p-2 text-sm text-muted-foreground flex justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>
                  ) : priorities?.map((prio: any) => (
                    <SelectItem key={prio.id} value={prio.id}>{prio.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patternSizeId" className="text-sm font-semibold">Ukuran Pola <span className="text-destructive">*</span></Label>
              <Select value={formData.patternSizeId} onValueChange={(val) => handleSelectChange('patternSizeId', val)}>
                <SelectTrigger className="bg-muted/30 border-border focus:ring-primary/30">
                  <SelectValue placeholder="Pilih Ukuran Pola" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingPatternSizes ? (
                    <div className="p-2 text-sm text-muted-foreground flex justify-center"><Loader2 className="animate-spin w-4 h-4" /></div>
                  ) : patternSizes?.map((size: any) => (
                    <SelectItem key={size.id} value={size.id}>{size.size || size.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="fileReference" className="text-sm font-semibold">Link/Path File Referensi (Opsional)</Label>
              <Input
                id="fileReference"
                name="fileReference"
                placeholder="Contoh: https://drive.google.com/..."
                value={formData.fileReference}
                onChange={handleChange}
                className="bg-muted/30 border-border focus-visible:ring-primary/30 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Instruksi / Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Berikan instruksi atau detail tambahan di sini..."
              value={formData.description}
              onChange={handleChange}
              className="bg-muted/30 border-border focus-visible:ring-primary/30 min-h-[100px] resize-y"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="border-border hover:bg-muted/50 font-semibold">
              Batal
            </Button>
            <Button type="submit" disabled={isPending} className="font-semibold shadow-sm">
              {isPending ? 'Membuat Tugas...' : 'Buat Tugas'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
