// client-user/src/features/profile/hooks/useProfile.js
import { useCallback, useState } from 'react';
import { getProfileRequest } from '../../../shared/api/authClient.js';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProfileRequest();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
  };
};
