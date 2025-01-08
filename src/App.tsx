import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { MyJobs } from './pages/MyJobs';
import { Jobs } from './pages/Jobs';
import { Profile } from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { CreatorRoute } from './components/CreatorRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route 
              path="/jobs" 
              element={
                <CreatorRoute>
                  <Jobs />
                </CreatorRoute>
              } 
            />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
