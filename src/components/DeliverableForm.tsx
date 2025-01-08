import { useState } from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DeliverableFormProps {
  proposalId: string;
  jobId: string;
  onSuccess: () => void;
}

export function DeliverableForm({ proposalId, jobId, onSuccess }: DeliverableFormProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let filePath = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        filePath = `${proposalId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('deliverables')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
      }

      // Start a Postgres transaction
      const { error: deliverableError } = await supabase
        .rpc('submit_deliverable_and_complete_job', {
          p_proposal_id: proposalId,
          p_job_id: jobId,
          p_content: content,
          p_file_path: filePath,
          p_external_link: link || null
        });

      if (deliverableError) throw deliverableError;

      setContent('');
      setFile(null);
      setLink('');
      onSuccess();
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      setError('Failed to submit deliverable');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Submit Deliverable</h3>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload File (Optional, max 50MB)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
            accept="*/*"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            External Link (Optional)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? (
            'Uploading...'
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Submit Deliverable
            </>
          )}
        </button>
      </form>
    </div>
  );
}
