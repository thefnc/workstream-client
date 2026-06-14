import { useParams } from 'react-router-dom';

export default function WorkloadDetail() {
  const { designerId } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Workload Detail</h1>
      <p>Detail for designer: {designerId}</p>
    </div>
  );
}
