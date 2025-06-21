import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UploadModal from '../components/UploadModal';

interface FileRecord {
  id: string;
  fileName: string;
  fileType: string;
  source: string;
  uploadedAt: string;
  status: 'yet-to-be-picked' | 'uploading' | 'uploaded' | 'processing' | 'processed' | 'failed' | 'unsupported';
  progress?: number;
  userId: string;
  size: number;
  jobId?: string;
  error?: string;
}

interface Project {
  key: string;
  name: string;
  description?: string;
}

const DataProcessingPage: React.FC = () => {
  const { projectKey } = useParams<{ projectKey: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectKey) {
      loadProjectData();
      const interval = setInterval(checkFileStatuses, 3000);
      return () => clearInterval(interval);
    }
  }, [projectKey]);

  const loadProjectData = async () => {
    try {
      const response = await axios.get(`/api/v1/projects/${projectKey}`, {
        headers: { Authorization: 'Bearer faketoken' }
      });
      setProject(response.data);
    } catch (err) {
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const checkFileStatuses = async () => {
    setFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.status === 'processing' && Math.random() > 0.7) {
          return { ...file, status: 'processed' as const, progress: 100 };
        }
        if (file.status === 'uploaded' && Math.random() > 0.8) {
          return { ...file, status: 'processing' as const, progress: Math.floor(Math.random() * 80) + 10 };
        }
        if (file.status === 'processing' && file.progress !== undefined) {
          const newProgress = Math.min(file.progress + Math.floor(Math.random() * 15), 95);
          return { ...file, progress: newProgress };
        }
        return file;
      })
    );
  };

  const handleUploadSuccess = (uploadData: any) => {
    const newFile: FileRecord = {
      id: Date.now().toString(),
      fileName: uploadData.fileName,
      fileType: uploadData.fileType,
      source: uploadData.fileName,
      uploadedAt: uploadData.uploadedAt,
      status: 'uploaded',
      userId: 'current-user',
      size: uploadData.size,
      jobId: uploadData.jobId
    };
    
    setFiles(prev => [...prev, newFile]);
  };

  const getStatusColor = (status: FileRecord['status']) => {
    const colors = {
      'yet-to-be-picked': '#6c757d',
      'uploading': '#007bff',
      'uploaded': '#17a2b8',
      'processing': '#ffc107',
      'processed': '#28a745',
      'failed': '#dc3545',
      'unsupported': '#6f42c1'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status: FileRecord['status']) => {
    const texts = {
      'yet-to-be-picked': 'Yet to be picked',
      'uploading': 'Uploading...',
      'uploaded': 'Uploaded',
      'processing': 'Processing...',
      'processed': 'Processed successfully',
      'failed': 'Processing failed',
      'unsupported': 'Unsupported file type'
    };
    return texts[status] || 'Unknown';
  };

  const handleRetryProcessing = (fileId: string) => {
    setFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, status: 'uploaded' as const, error: undefined }
          : file
      )
    );
  };

  const hasSuccessfulFiles = files.some(file => file.status === 'processed');

  const handleNext = () => {
    alert('Proceeding to next step...');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        Loading project data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#dc3545' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#f8f9fa' }}>
      <div style={{ width: '300px', backgroundColor: '#e9ecef', padding: '2rem', borderRight: '1px solid #dee2e6' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#6c757d', fontSize: '1.1rem' }}>
          Knowledge Base Configuration
        </h3>
        <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Configuration will be available after data processing completion.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginBottom: '0.5rem', color: '#2c3e50' }}>
            {project?.name} - Data Processing
          </h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Upload and process your files for this project
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
          <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Upload Files</h2>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
            Upload .zip or .vxml files to process for your project
          </p>
          <button onClick={() => setIsUploadModalOpen(true)} style={{ padding: '1rem 2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
            Choose File to Upload
          </button>
        </div>

        {files.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem 1.5rem', borderBottom: '1px solid #dee2e6', fontWeight: 'bold', color: '#2c3e50' }}>
              Uploaded Files
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {files.map((file) => (
                <div key={file.id} style={{ padding: '1.5rem', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#2c3e50' }}>{file.fileName}</strong>
                      <span style={{ backgroundColor: getStatusColor(file.status), color: 'white', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {getStatusText(file.status)}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                      <div><strong>Type:</strong> {file.fileType}</div>
                      <div><strong>Source:</strong> {file.source}</div>
                      <div><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      <div><strong>User:</strong> {file.userId}</div>
                      {file.status === 'processed' && (
                        <div><strong>Completed:</strong> {new Date(file.uploadedAt).toLocaleString()}</div>
                      )}
                    </div>
                    
                    {(file.status === 'processing' || file.status === 'uploading') && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                          <span>Progress</span>
                          <span>{file.progress || 0}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${file.progress || 0}%`, height: '100%', backgroundColor: getStatusColor(file.status), transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    )}
                    
                    {file.error && (
                      <div style={{ marginTop: '0.5rem', color: '#dc3545', fontSize: '0.875rem' }}>
                        Error: {file.error}
                      </div>
                    )}
                  </div>
                  
                  {file.status === 'failed' && (
                    <button onClick={() => handleRetryProcessing(file.id)} style={{ padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '1rem' }}>
                      Retry
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
          <button onClick={handleNext} disabled={!hasSuccessfulFiles} style={{ padding: '1rem 2rem', backgroundColor: hasSuccessfulFiles ? '#28a745' : '#6c757d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', cursor: hasSuccessfulFiles ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
            Next Step
          </button>
          {!hasSuccessfulFiles && (
            <p style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem', marginBottom: 0 }}>
              Complete at least one file upload to proceed
            </p>
          )}
        </div>
      </div>

      {projectKey && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          projectKey={projectKey}
        />
      )}
    </div>
  );
};

export default DataProcessingPage; 