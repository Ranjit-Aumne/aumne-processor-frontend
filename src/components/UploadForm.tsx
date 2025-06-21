import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  key: string;
  name: string;
  description?: string;
}

interface Props {
  onSuccess?: () => void;
}

const UploadForm: React.FC<Props> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

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
  useEffect(() => {
    // Load projects when component mounts
    const loadProjects = async () => {
      try {
        const response = await axios.get('/api/v1/projects');
        setProjects(response.data);
      } catch (err) {
        setError('Failed to load projects');
      }
    };
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_key', selectedProject);
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
      <div>
        <label htmlFor="project">Project:</label>
        <select 
          id="project" 
          value={selectedProject} 
          onChange={(e) => setSelectedProject(e.target.value)}
          aria-label="project"
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.key} value={project.key}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="zipfile">File:</label>
        <input id="zipfile" aria-label="file" type="file" accept=".zip" onChange={handleFileChange} />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={loading || !file || !selectedProject}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
};

export default UploadForm; 