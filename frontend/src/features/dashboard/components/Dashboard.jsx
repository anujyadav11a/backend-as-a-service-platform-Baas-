import { useAuth } from '../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to BaaS Console</h2>
          <p className="text-gray-600">You are now logged in and can manage your projects.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/projects"
            className="group bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                <p className="mt-1 text-sm text-gray-500">Create and manage your BaaS projects</p>
              </div>
              <ArrowRightIcon className="h-8 w-8 text-gray-400 group-hover:text-indigo-600 transition-colors" aria-hidden="true" />
            </div>
          </Link>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Databases</h3>
                <p className="mt-1 text-sm text-gray-500">Manage databases within your projects</p>
              </div>
              <ArrowRightIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;