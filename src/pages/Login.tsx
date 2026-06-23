import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', data);
      const { user } = response.data.data;
      setAuth(user);
      toast.success('Login berhasil');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal untuk masuk. Periksa kembali username dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-[380px] space-y-8">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-sm mb-2">
            <div className="w-5 h-5 bg-white rotate-45" />
            <div className="w-5 h-5 border-[1.5px] border-white rotate-45 -ml-2.5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Selamat datang di Workstream
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistem manajemen *workflow* internal tim.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
                Username
              </label>
              <Input
                type="text"
                placeholder="Masukkan username Anda"
                className="bg-background"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Masukkan password"
                className="bg-background"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-medium" disabled={isLoading}>
              {isLoading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Workstream. All rights reserved.
        </div>
      </div>
    </div>
  );
}
