import React from 'react';
import UploadForm from '../components/UploadForm';

const UploadPage: React.FC = () => {
  const handleSuccess = () => {
    alert('Upload queued');
  };
  return (
    <div style={{ padding: 32 }}>
      <h1>Upload Project</h1>
      <UploadForm onSuccess={handleSuccess} />
    </div>
  );
};

export default UploadPage; 