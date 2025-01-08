import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, Shield } from 'lucide-react';

export function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Connect with Top Creative Talent
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Find the perfect creative professional for your project or showcase your skills to potential clients.
        </p>
        <Link
          to="/sign-up"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8 py-12">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Post Projects</h3>
          <p className="text-gray-600">
            Easily post your creative projects and connect with talented professionals.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Find Talent</h3>
          <p className="text-gray-600">
            Browse through a diverse pool of creative professionals and find the perfect match.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
          <p className="text-gray-600">
            Work with confidence using our secure payment and milestone system.
          </p>
        </div>
      </div>
    </div>
  );
}
