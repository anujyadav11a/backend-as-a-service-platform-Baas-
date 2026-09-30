import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { handleGoogleCallback } from '../state/authSlice';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (!code || !state) {
      return navigate('/login?error=oauth_missing_params');
    }

    dispatch(handleGoogleCallback({ code, state }))
      .unwrap()
      .then(() => {
        navigate('/dashboard');
      })
      .catch(() => {
        navigate('/login?error=oauth_failed');
      });
  }, [searchParams, navigate, dispatch]);

  return (
    <div role="status" aria-live="polite" className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-600">Completing sign‑in…</p>
      </div>
    </div>
  );
}