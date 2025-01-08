import { ArrowRight } from 'lucide-react';

interface JobCardProps {
  title: string;
  description: string;
  budget: number;
  category: string;
  onViewDetails: () => void;
}

export function JobCard({ title, description, budget, category, onViewDetails }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between">
        <div className="space-x-4">
          <span className="text-gray-600">Budget: ${budget}</span>
          <span className="text-gray-600">Category: {category}</span>
        </div>
        <button
          onClick={onViewDetails}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          View Details Here
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
