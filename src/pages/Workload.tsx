import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Workload() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === 'DESIGNER') {
    return <Navigate to={`/workload/${user.id}`} replace />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Workload</h1>
      <p>Workload placeholder</p>
    </div>
  );
}
