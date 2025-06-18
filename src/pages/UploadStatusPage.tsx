import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const POLL_INTERVAL_MS = 30_000; // 30 seconds – tweak via env in future

interface Job {
  upload_id: string;
  filename: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const UploadStatusPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Job[]>('/uploads', {
        headers: { Authorization: 'Bearer faketoken' },
      });
      setJobs(res.data);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const id = setInterval(() => {
      setIsPolling(true);
      fetchJobs();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>My Uploads</h1>
      <button onClick={fetchJobs} disabled={loading || isPolling}>
        Refresh
      </button>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && (
        <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Filename</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.upload_id}>
                <td>{job.upload_id}</td>
                <td>{job.filename}</td>
                <td>{job.status}</td>
                <td>{new Date(job.created_at).toLocaleString()}</td>
                <td>{new Date(job.updated_at).toLocaleString()}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No uploads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UploadStatusPage; 