import { useParams } from 'react-router-dom';

export default function TaskDetail() {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Task Detail</h1>
      <p>Detail for task: {id}</p>
    </div>
  );
}
