import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PlusCircle } from 'lucide-react';
import { JobForm } from '../components/JobForm';
import { JobList } from '../components/JobList';

interface Profile {
  id: string;
  role: 'client' | 'creator';
  full_name: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  category: string;
  created_at: string;
  proposals?: any[];
}

export function MyJobs() {
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(location.state?.showJobForm || false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      setProfile(profileData);

      if (profileData.role === 'client') {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            *,
            proposals (
              *,
              profiles (full_name),
              deliverables (*)
            )
          `)
          .eq('client_id', profileData.id)
          .order('created_at', { ascending: false });
        setJobs(jobsData || []);
      } else {
        const { data: jobsData } = await supabase
          .from('jobs')
          .select(`
            *,
            proposals!inner (
              *,
              profiles (full_name),
              deliverables (*)
            )
          `)
          .eq('proposals.creator_id', profileData.id)
          .order('created_at', { ascending: false });
        setJobs(jobsData || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        {profile?.role === 'client' && (
          <button
            onClick={() => setShowJobForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <PlusCircle className="w-5 h-5" />
            Post New Job
          </button>
        )}
      </div>

      {showJobForm && profile?.role === 'client' && (
        <JobForm
          profileId={profile.id}
          onSuccess={() => {
            setShowJobForm(false);
            fetchData();
          }}
          onCancel={() => setShowJobForm(false)}
        />
      )}

      {profile && (
        <JobList
          jobs={jobs}
          profile={profile}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
