import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Briefcase, Search, LayoutDashboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface Profile {
  role: 'client' | 'creator';
}

export function Navigation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user!.id)
      .single();
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/sign-in');
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <Link to="/" className="text-xl font-bold text-gray-900">
            CreatorMarket
          </Link>
        </div>

        <div className="flex-1 px-4">
          {user ? (
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              {profile?.role === 'creator' && (
                <Link
                  to="/jobs"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <Search className="w-5 h-5" />
                  Find Jobs
                </Link>
              )}
              <Link
                to="/my-jobs"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Briefcase className="w-5 h-5" />
                My Jobs
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                to="/sign-in"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {user && (
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
