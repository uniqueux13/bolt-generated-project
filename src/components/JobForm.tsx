import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface JobFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function JobForm({ profileId, onSuccess, onCancel }: JobFormProps) {
  const [jobForm, setJobForm] = useState({ title: '', description: '', budget: '', category: '' });
  const [error, setError] = useState('');

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          client_id: profileId,
          title: jobForm.title,
          description: jobForm.description,
          budget: parseInt(jobForm.budget),
          category: jobForm.category,
          status: 'published'
        });

      if (jobError) throw jobError;
      onSuccess();
    } catch (error) {
      setError('Failed to post job');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">Post a New Job</h2>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handlePostJob} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
          <input
            type="number"
            value={jobForm.budget}
            onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={jobForm.category}
            onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
}
