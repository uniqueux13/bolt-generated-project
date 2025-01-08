import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { JobCard } from '../components/JobCard';
import { JobDetails } from '../components/JobDetails';

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
  category: string;
  status: string;
  proposals?: any[];
}

export function Jobs() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          proposals (*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      setJobs(jobsData || []);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Available Jobs</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            title={job.title}
            description={job.description}
            budget={job.budget}
            category={job.category}
            onViewDetails={() => setSelectedJob(job)}
          />
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No jobs available at the moment.
        </div>
      )}

      {selectedJob && profile && (
        <JobDetails
          job={selectedJob}
          creatorId={profile.id}
          onClose={() => setSelectedJob(null)}
          onProposalSubmit={fetchData}
        />
      )}
    </div>
  );
}
