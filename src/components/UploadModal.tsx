import React, { useState, useRef } from 'react';
import axios from 'axios';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploadData: any) => void;
  projectKey: string;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const UploadModal: React.FC<UploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectKey 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const allowedExtensions = ['.zip', '.vxml'];
  const allowedMimeTypes = ['application/zip', 'application/x-zip-compressed', 'text/xml', 'application/xml'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      setError('Invalid file type. Only .zip and .vxml files are allowed.');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress({ loaded: 0, total: selectedFile.size, percentage: 0 });

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('project_key', projectKey);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer faketoken'
        },
        signal: abortControllerRef.current.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage
            });
          }
        }
      });

      // Upload completed successfully
      setTimeout(() => {
        onSuccess({
          fileName: selectedFile.name,
          fileType: selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
          size: selectedFile.size,
          jobId: response.data.job_id
        });
        handleClose();
      }, 500); // Small delay to show 100% completion

    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        setError('Upload cancelled by user.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.detail || 'Invalid request. Please check your file and try again.');
      } else if (err.response?.status === 413) {
        setError('File is too large. Please select a smaller file.');
      } else {
        setError('Upload failed. Please try again.');
      }
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setUploadProgress(null);
    handleUpload();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ margin: 0, color: '#2c3e50' }}>Upload File</h2>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6c757d'
              }}
            >
              ×
            </button>
          </div>

          {/* File Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              Select File (.zip or .vxml only)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.vxml"
              onChange={handleFileSelect}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
            />
            <div style={{
              fontSize: '0.875rem',
              color: '#6c757d',
              marginTop: '0.25rem'
            }}>
              Only one file can be uploaded at a time.
            </div>
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              border: '1px solid #dee2e6'
            }}>
              <div><strong>File:</strong> {selectedFile.name}</div>
              <div><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
              <div><strong>Type:</strong> {selectedFile.name.split('.').pop()?.toUpperCase()}</div>
            </div>
          )}

          {/* Progress Bar */}
          {uploadProgress && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span>Upload Progress</span>
                <span>{uploadProgress.percentage}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e9ecef',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    width: `${uploadProgress.percentage}%`,
                    height: '100%',
                    backgroundColor: uploadProgress.percentage === 100 ? '#28a745' : '#007bff',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1.5rem',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #6c757d',
                backgroundColor: 'white',
                color: '#6c757d',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            {error && !isUploading && (
              <button
                onClick={handleRetry}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            )}
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: (!selectedFile || isUploading) ? '#6c757d' : '#28a745',
                color: 'white',
                borderRadius: '4px',
                cursor: (!selectedFile || isUploading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadModal; 