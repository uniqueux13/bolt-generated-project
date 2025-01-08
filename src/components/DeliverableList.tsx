import { useState } from 'react';
import { Download, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Deliverable {
  id: string;
  content: string;
  file_path?: string;
  external_link?: string;
  created_at: string;
  status: 'pending_review' | 'approved' | 'needs_revision';
  revision_notes?: string;
}

interface DeliverableListProps {
  deliverables: Deliverable[];
  isClient?: boolean;
  onReviewDeliverable?: (deliverableId: string, status: 'approved' | 'needs_revision', notes?: string) => Promise<void>;
}

export function DeliverableList({ deliverables, isClient, onReviewDeliverable }: DeliverableListProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState<string | null>(null);

  const handleDownload = async (deliverable: Deliverable) => {
    if (!deliverable.file_path) return;
    
    try {
      setDownloading(deliverable.id);
      
      const { data, error } = await supabase.storage
        .from('deliverables')
        .download(deliverable.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = deliverable.file_path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handleRevisionSubmit = async (deliverableId: string) => {
    if (!onReviewDeliverable) return;
    await onReviewDeliverable(deliverableId, 'needs_revision', revisionNotes);
    setRevisionNotes('');
    setShowRevisionForm(null);
  };

  return (
    <div className="space-y-4">
      {deliverables.map((deliverable) => (
        <div key={deliverable.id} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-gray-600">{deliverable.content}</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              deliverable.status === 'approved' ? 'bg-green-100 text-green-800' :
              deliverable.status === 'needs_revision' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {deliverable.status.replace('_', ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </div>
          
          {deliverable.revision_notes && (
            <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              <strong>Revision Notes:</strong> {deliverable.revision_notes}
            </div>
          )}

          <div className="flex items-center gap-4">
            {deliverable.file_path && (
              <button
                onClick={() => handleDownload(deliverable)}
                disabled={downloading === deliverable.id}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" />
                {downloading === deliverable.id ? 'Downloading...' : 'Download File'}
              </button>
            )}
            
            {deliverable.external_link && (
              <a
                href={deliverable.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                External Link
              </a>
            )}

            {isClient && deliverable.status === 'pending_review' && onReviewDeliverable && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => onReviewDeliverable(deliverable.id, 'approved')}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRevisionForm(deliverable.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  <XCircle className="w-4 h-4" />
                  Request Revision
                </button>
              </div>
            )}
          </div>

          {showRevisionForm === deliverable.id && (
            <div className="mt-4">
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Enter revision notes..."
                className="w-full px-3 py-2 border rounded-md mb-2"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRevisionForm(null)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevisionSubmit(deliverable.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Submit Revision Request
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
