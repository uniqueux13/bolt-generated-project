import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {user && <Navigation />}
      <main className={`flex-1 p-8 ${user ? 'ml-64' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
