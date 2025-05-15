import { getBuildForEdit } from './data/get-build';
import EditBuildForm from './components/edit-build-form';

interface EditBuildPageProps {
  params: {
    id: string;
  };
}

export default async function EditBuildPage({ params }: EditBuildPageProps) {
  const buildId = params.id;
  
  // Buscar a build usando a função de data fetching
  const build = await getBuildForEdit(buildId);
  
  return (
    <EditBuildForm buildId={buildId} initialData={build} />
  );
}
