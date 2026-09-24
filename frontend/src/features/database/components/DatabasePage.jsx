import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../project/hooks/useProject';
import DatabaseList from './DatabaseList';

export function DatabasePage() {
  const { projectId } = useParams();
  const { currentProject, get } = useProject();

  useEffect(() => {
    if (projectId && currentProject?.project_id !== projectId) {
      get(projectId);
    }
  }, [projectId, currentProject?.project_id, get]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <a
                href="/projects"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Projects
              </a>
              <h1 className="text-xl font-semibold text-gray-900">Databases</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DatabaseList 
          projectId={projectId} 
          projectName={currentProject?.name || 'Project'} 
        />
      </main>
    </div>
  );
}

export default DatabasePage;