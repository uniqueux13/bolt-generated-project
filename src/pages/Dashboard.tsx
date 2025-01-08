import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Briefcase, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface Profile {
  id: string;
  role: 'client' | 'creator';
  full_name: string;
}

interface Stats {
  activeJobs: number;
  completedJobs: number;
  pendingProposals: number;
  totalEarnings?: number;
  totalSpent?: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    completedJobs: 0,
    pendingProposals: 0,
    totalEarnings: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        // Fetch client statistics
        const { data: clientStats } = await supabase
          .from('jobs')
          .select(`
            id,
            status,
            budget,
            proposals (
              status
            )
          `)
          .eq('client_id', profileData.id);

        if (clientStats) {
          setStats({
            activeJobs: clientStats.filter(job => job.status === 'in_progress').length,
            completedJobs: clientStats.filter(job => job.status === 'completed').length,
            pendingProposals: clientStats.reduce((acc, job) => 
              acc + (job.proposals?.filter(p => p.status === 'pending').length || 0), 0),
            totalSpent: clientStats.reduce((acc, job) => acc + (job.budget || 0), 0),
          });
        }
      } else {
        // Fetch creator statistics
        const { data: creatorStats } = await supabase
          .from('proposals')
          .select(`
            id,
            status,
            price,
            job:jobs (
              status
            )
          `)
          .eq('creator_id', profileData.id);

        if (creatorStats) {
          setStats({
            activeJobs: creatorStats.filter(p => 
              p.status === 'accepted' && p.job.status === 'in_progress').length,
            completedJobs: creatorStats.filter(p => 
              p.status === 'accepted' && p.job.status === 'completed').length,
            pendingProposals: creatorStats.filter(p => p.status === 'pending').length,
            totalEarnings: creatorStats
              .filter(p => p.status === 'accepted')
              .reduce((acc, p) => acc + (p.price || 0), 0),
          });
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Welcome back, {profile?.full_name}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-2xl font-semibold">{stats.activeJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-semibold">{stats.completedJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Proposals</p>
              <p className="text-2xl font-semibold">{stats.pendingProposals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {profile?.role === 'client' ? 'Total Spent' : 'Total Earnings'}
              </p>
              <p className="text-2xl font-semibold">
                ${profile?.role === 'client' ? stats.totalSpent : stats.totalEarnings}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/my-jobs"
            className="block p-4 border rounded-lg hover:bg-gray-50"
          >
            <h3 className="font-medium mb-1">View Active Jobs</h3>
            <p className="text-sm text-gray-600">
              Check the status of your ongoing projects
            </p>
          </Link>
          {profile?.role === 'creator' ? (
            <Link
              to="/jobs"
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium mb-1">Find New Jobs</h3>
              <p className="text-sm text-gray-600">
                Browse available projects and submit proposals
              </p>
            </Link>
          ) : (
            <Link
              to="/my-jobs"
              state={{ showJobForm: true }}
              className="block p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium mb-1">Post a New Job</h3>
              <p className="text-sm text-gray-600">
                Create a new project and find talented creators
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
