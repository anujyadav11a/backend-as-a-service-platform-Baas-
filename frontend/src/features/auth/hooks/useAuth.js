import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser, registerUser, fetchCurrentUser, clearAuthError } from '../state/authSlice';
import { selectUser, selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../state/authSlice';

/**
 * Hook providing authentication state and actions.
 * @returns {Object} Auth state and methods
 * @returns {User|null} user - Current user object
 * @returns {boolean} isAuthenticated - Whether user is authenticated
 * @returns {boolean} loading - Whether an auth operation is in progress
 * @returns {string|null} error - Current error message
 * @returns {Function} login - Login function (returns promise)
 * @returns {Function} logout - Logout function
 * @returns {Function} register - Register function (returns promise)
 * @returns {Function} refreshUser - Refresh current user
 * @returns {Function} clearError - Clear error state
 */
export function useAuth() {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const dispatch = useDispatch();

  const login = (credentials) => dispatch(loginUser(credentials));
  const logout = () => dispatch(logoutUser());
  const register = (data) => dispatch(registerUser(data));
  const refreshUser = () => dispatch(fetchCurrentUser());
  const clearError = () => dispatch(clearAuthError());

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    refreshUser,
    clearError,
  };
}

/**
 * Hook for login form handling - thin wrapper around useAuth
 * @returns {Object} Login handler and state
 */
export function useLogin() {
  const { login, loading, error, clearError } = useAuth();

  const handleLogin = async (credentials) => {
    clearError();
    try {
      await login(credentials).unwrap();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { handleLogin, loading, error, clearError };
}

/**
 * Hook for register form handling - thin wrapper around useAuth
 * @returns {Object} Register handler and state
 */
export function useRegister() {
  const { register, loading, error, clearError } = useAuth();

  const handleRegister = async (data) => {
    clearError();
    try {
      await register(data).unwrap();
       return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  return { handleRegister, loading, error, clearError };
}

export default useAuth;