import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../project/hooks/useProject';
import AttributeList from './AttributeList';

export function AttributePage() {
  const { projectId, collectionId } = useParams();
  const { currentProject, get: getProject } = useProject();

  useEffect(() => {
    if (projectId && currentProject?.project_id !== projectId) {
      getProject(projectId);
    }
  }, [projectId, currentProject?.project_id, getProject]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <a
                href={`/projects/${projectId}/databases`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Databases
              </a>
              <a
                href={`/projects/${projectId}/databases/${collectionId}/collections`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Collections
              </a>
              <h1 className="text-xl font-semibold text-gray-900">Attributes</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AttributeList 
          projectId={projectId} 
          collectionId={collectionId}
        />
      </main>
    </div>
  );
}

export default AttributePage;