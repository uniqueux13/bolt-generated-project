import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreatorRouteProps {
  children: React.ReactNode;
}

export function CreatorRoute({ children }: CreatorRouteProps) {
  const { user } = useAuth();
  const [isCreator, setIsCreator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkRole();
  }, [user]);

  const checkRole = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user!.id)
        .single();

      setIsCreator(profile?.role === 'creator');
    } catch (error) {
      console.error('Error checking role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user || !isCreator) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
