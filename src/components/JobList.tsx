import { Briefcase, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { ProposalForm } from './ProposalForm';
import { DeliverableForm } from './DeliverableForm';
import { DeliverableList } from './DeliverableList';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  role: 'client' | 'creator';
  full_name: string;
}

interface Deliverable {
  id: string;
  content: string;
  file_path?: string;
  external_link?: string;
  created_at: string;
  status: 'pending_review' | 'approved' | 'needs_revision';
  revision_notes?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'draft' | 'published' | 'in_progress' | 'completed';
  category: string;
  created_at: string;
  proposals?: Proposal[];
  client_id: string;
}

interface Proposal {
  id: string;
  job_id: string;
  creator_id: string;
  price: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
  };
  deliverables?: Deliverable[];
}

interface JobListProps {
  jobs: Job[];
  profile: Profile;
  onRefresh: () => Promise<void>;
}

export function JobList({ jobs, profile, onRefresh }: JobListProps) {
  const handleProposalAction = async (proposalId: string, jobId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ status })
        .eq('id', proposalId);

      if (proposalError) throw proposalError;

      if (status === 'accepted') {
        const { error: jobError } = await supabase
          .from('jobs')
          .update({ status: 'in_progress' })
          .eq('id', jobId);

        if (jobError) throw jobError;
      }

      onRefresh();
    } catch (error) {
      console.error('Error updating proposal:', error);
    }
  };

  const handleDeliverableReview = async (deliverableId: string, status: 'approved' | 'needs_revision', notes?: string) => {
    try {
      const { error } = await supabase
        .from('deliverables')
        .update({ 
          status,
          revision_notes: notes
        })
        .eq('id', deliverableId);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error reviewing deliverable:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <div key={job.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
              <p className="text-gray-600">{job.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm ${
                job.status === 'completed' ? 'bg-green-100 text-green-800' :
                job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status.replace('_', ' ').charAt(0).toUpperCase() + 
                job.status.slice(1).replace('_', ' ')}
              </span>
              {profile.role === 'client' && profile.id === job.client_id && (
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 text-sm text-gray-600 mb-4">
            <span>Budget: ${job.budget}</span>
            <span>Category: {job.category}</span>
          </div>

          {job.proposals?.map((proposal) => (
            <div key={proposal.id} className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{proposal.profiles.full_name}</span>
                  <span className="text-gray-600 ml-2">
                    Proposed: ${proposal.price}
                  </span>
                </div>
                {profile.role === 'client' && profile.id === job.client_id && proposal.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProposalAction(proposal.id, job.id, 'accepted')}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleProposalAction(proposal.id, job.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
                {proposal.status !== 'pending' && (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    proposal.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{proposal.description}</p>

              {proposal.deliverables && proposal.deliverables.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Deliverables</h4>
                  <DeliverableList 
                    deliverables={proposal.deliverables}
                    isClient={profile.role === 'client' && profile.id === job.client_id}
                    onReviewDeliverable={handleDeliverableReview}
                  />
                </div>
              )}

              {profile.role === 'creator' && 
               proposal.status === 'accepted' && 
               job.status === 'in_progress' && (
                <div className="mt-4">
                  <DeliverableForm
                    proposalId={proposal.id}
                    jobId={job.id}
                    onSuccess={onRefresh}
                  />
                </div>
              )}
            </div>
          ))}

          {profile.role === 'creator' && job.status === 'published' && (
            <div className="mt-4 pt-4 border-t">
              <ProposalForm
                jobId={job.id}
                creatorId={profile.id}
                onSuccess={onRefresh}
              />
            </div>
          )}
        </div>
      ))}

      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No jobs found.
        </div>
      )}
    </div>
  );
}
