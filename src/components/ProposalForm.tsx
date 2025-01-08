import { useState } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProposalFormProps {
  jobId: string;
  creatorId: string;
  onSuccess: () => void;
}

export function ProposalForm({ jobId, creatorId, onSuccess }: ProposalFormProps) {
  const [proposalForm, setProposalForm] = useState({ price: '', description: '' });
  const [error, setError] = useState('');

  const handleSubmitProposal = async () => {
    try {
      const { error: proposalError } = await supabase
        .from('proposals')
        .insert({
          job_id: jobId,
          creator_id: creatorId,
          price: parseInt(proposalForm.price),
          description: proposalForm.description
        });

      if (proposalError) throw proposalError;
      setProposalForm({ price: '', description: '' });
      onSuccess();
    } catch (error) {
      setError('Failed to submit proposal');
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Submit Proposal</h4>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
          <input
            type="number"
            value={proposalForm.price}
            onChange={(e) => setProposalForm({ ...proposalForm, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Proposal Details</label>
          <textarea
            value={proposalForm.description}
            onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>
        <button
          onClick={handleSubmitProposal}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
          Submit Proposal
        </button>
      </div>
    </div>
  );
}
