import { useEffect, useState } from 'react';
import { useProjectList, useProjectSearch } from '../hooks/useProject';
import { fetchProjects } from '../state/projectSlice';
import { useDispatch } from 'react-redux';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import { SearchIcon, PlusIcon } from 'lucide-react';

export default function ProjectList() {
  const dispatch = useDispatch();
  const { projects, loading, error, handleCreate } = useProjectList();
  const { searchResults, searchLoading, handleSearch, clearSearch } = useProjectSearch();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      clearSearch();
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    await handleSearch(searchQuery.trim());
  };

  const handleCreateSubmit = async (data) => {
    const result = await handleCreate(data);
    if (result.success) {
      setShowCreateModal(false);
    }
    return result;
  };

  const displayProjects = isSearching ? searchResults?.projects || [] : projects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-1">Manage your BaaS projects</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                aria-label="Search projects"
                disabled={searchLoading}
              />
            </div>
            {isSearching && searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  clearSearch();
                  setIsSearching(false);
                }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </form>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            New Project
          </button>
        </div>
      </div>

      {(error || (isSearching && searchResults === null && searchLoading)) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md" role="alert">
          {error || 'Failed to load projects'}
        </div>
      )}

      {loading && !isSearching && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse space-y-4">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && displayProjects.length === 0 && !isSearching && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            Create Project
          </button>
        </div>
      )}

      {!loading && displayProjects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={isSearching ? `Search results for "${searchQuery}"` : 'Your projects'}>
          {displayProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        loading={loading}
      />
    </div>
  );
}