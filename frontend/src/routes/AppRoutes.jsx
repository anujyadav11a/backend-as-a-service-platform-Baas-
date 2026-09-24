import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/guards/ProtectedRoute';
import { PublicRoute } from '../features/auth/guards/PublicRoute';
import { ErrorBoundary } from '../features/dashboard/components/ErrorBoundary';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import Dashboard from '../features/dashboard/components/Dashboard';
import ProjectPage from '../features/project/components/ProjectPage';
import DatabasePage from '../features/database/components/DatabasePage';
import CollectionPage from '../features/collection/components/CollectionPage';
import AttributePage from '../features/attribute/components/AttributePage';
import NotFound from '../features/dashboard/components/NotFound';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">An unexpected error occurred. Please try again.</p>
        {error && (
          <details className="text-left mb-4">
            <summary className="text-sm text-gray-500 cursor-pointer">Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/*"
          element={
            <ProtectedRoute>
              <ProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/databases"
          element={
            <ProtectedRoute>
              <DatabasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/databases/:databaseId/collections"
          element={
            <ProtectedRoute>
              <CollectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/collections/:collectionId/attributes"
          element={
            <ProtectedRoute>
              <AttributePage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;