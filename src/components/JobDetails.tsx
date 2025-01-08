import { X } from 'lucide-react';
import { ProposalForm } from './ProposalForm';

interface JobDetailsProps {
  job: {
    id: string;
    title: string;
    description: string;
    budget: number;
    category: string;
  };
  creatorId: string;
  onClose: () => void;
  onProposalSubmit: () => void;
}

export function JobDetails({ job, creatorId, onClose, onProposalSubmit }: JobDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="flex gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Budget</h3>
                <p className="text-lg font-semibold text-gray-900">${job.budget}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Category</h3>
                <p className="text-lg font-semibold text-gray-900">{job.category}</p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Proposal</h3>
              <ProposalForm
                jobId={job.id}
                creatorId={creatorId}
                onSuccess={() => {
                  onProposalSubmit();
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
