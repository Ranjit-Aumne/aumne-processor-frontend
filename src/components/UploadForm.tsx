import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  onSuccess?: () => void;
}

const UploadForm: React.FC<Props> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setError(null);
    if (selected && !selected.name.toLowerCase().endsWith('.zip')) {
      setError('Invalid file type');
      setFile(null);
    } else {
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/upload', formData, {
        headers: { Authorization: 'Bearer faketoken' },
      });
      onSuccess?.();
      setFile(null);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="zipfile">File:</label>
      <input id="zipfile" aria-label="file" type="file" accept=".zip" onChange={handleFileChange} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
};

export default UploadForm; 