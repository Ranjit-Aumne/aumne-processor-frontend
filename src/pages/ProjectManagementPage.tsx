import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  key: string;
  name: string;
  db_config: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

interface ProjectFormData {
  name: string;
  db_config: string; // JSON string for editing
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const ProjectManagementPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({ name: '', db_config: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/v1/projects', {
        headers: { Authorization: 'Bearer faketoken' }
      });
      setProjects(response.data);
    } catch (err) {
      const errorMessage = 'Failed to load projects';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({ name: '', db_config: '{\n  "uri": "neo4j://localhost:7687",\n  "index": ""\n}' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      db_config: JSON.stringify(project.db_config, null, 2)
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: '', db_config: '' });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }

    try {
      const parsedConfig = JSON.parse(formData.db_config);
      if (!parsedConfig.uri) {
        errors.db_config = 'Database URI is required in config';
      }
      if (!parsedConfig.index) {
        errors.db_config = 'Database index is required in config';
      }
    } catch (e) {
      errors.db_config = 'Invalid JSON format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const parsedConfig = JSON.parse(formData.db_config);
      const payload = {
        name: formData.name.trim(),
        db_config: parsedConfig
      };

      if (editingProject) {
        // Update existing project
        await axios.put(`/api/v1/projects/${editingProject.key}`, payload, {
          headers: { Authorization: 'Bearer faketoken' }
        });
        showToast('Project updated', 'success');
      } else {
        // Create new project
        await axios.post('/api/v1/projects', payload, {
          headers: { Authorization: 'Bearer faketoken' }
        });
        showToast('Project created', 'success');
      }

      closeModal();
      loadProjects(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Operation failed';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (projectKey: string) => {
    if (deleteConfirm !== projectKey) {
      setDeleteConfirm(projectKey);
      return;
    }

    try {
      await axios.delete(`/api/v1/projects/${projectKey}`, {
        headers: { Authorization: 'Bearer faketoken' }
      });
      showToast('Project deleted', 'success');
      setDeleteConfirm(null);
      loadProjects(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Delete failed';
      showToast(errorMessage, 'error');
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    },
    title: {
      margin: '0 0 0.5rem 0',
      color: '#2c3e50'
    },
    subtitle: {
      margin: 0,
      color: '#6c757d'
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.9rem'
    },
    dangerButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.8rem'
    },
    confirmButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ff6b6b',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.8rem'
    },
    editButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.8rem',
      marginRight: '0.5rem'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    th: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      textAlign: 'left' as const,
      fontWeight: 'bold',
      borderBottom: '2px solid #dee2e6',
      color: '#495057'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
      verticalAlign: 'top' as const
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '1rem',
      borderRadius: '4px',
      marginBottom: '2rem',
      border: '1px solid #f5c6cb'
    },
    loading: {
      textAlign: 'center' as const,
      padding: '4rem',
      fontSize: '1.1rem',
      color: '#6c757d'
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '4rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '2rem',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      color: '#495057'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '1rem',
      boxSizing: 'border-box' as const
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '0.9rem',
      fontFamily: 'monospace',
      minHeight: '200px',
      boxSizing: 'border-box' as const,
      resize: 'vertical' as const
    },
    errorText: {
      color: '#dc3545',
      fontSize: '0.875rem',
      marginTop: '0.25rem'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '2rem'
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    toastContainer: {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      zIndex: 1100
    },
    toast: {
      padding: '1rem',
      marginBottom: '0.5rem',
      borderRadius: '4px',
      color: 'white',
      minWidth: '300px',
      animation: 'slideIn 0.3s ease-out'
    },
    successToast: {
      backgroundColor: '#28a745'
    },
    errorToast: {
      backgroundColor: '#dc3545'
    },
    configPreview: {
      fontFamily: 'monospace',
      fontSize: '0.8rem',
      backgroundColor: '#f8f9fa',
      padding: '0.5rem',
      borderRadius: '4px',
      whiteSpace: 'pre-wrap' as const,
      maxWidth: '300px',
      overflow: 'auto'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Project Management</h1>
          <p style={styles.subtitle}>
            Manage project configurations and database settings
          </p>
        </div>
        <button style={styles.button} onClick={openCreateModal} data-testid="new-project-button">
          ➕ New Project
        </button>
      </div>

      {/* Error Message */}
      {error && !loading && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Projects Table */}
      {!error && projects.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
          <h2 style={{ margin: '0 0 1rem 0', color: '#6c757d' }}>No projects yet</h2>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
            Create your first project to start managing configurations
          </p>
          <button style={styles.button} onClick={openCreateModal} data-testid="create-first-project-button">
            ➕ Create First Project
          </button>
        </div>
      ) : !error && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Key</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>DB Config</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.key}>
                <td style={styles.td}>
                  <code style={{ backgroundColor: '#f8f9fa', padding: '0.25rem 0.5rem', borderRadius: '3px' }}>
                    {project.key}
                  </code>
                </td>
                <td style={styles.td}>{project.name}</td>
                <td style={styles.td}>
                  <div style={styles.configPreview}>
                    {JSON.stringify(project.db_config, null, 2)}
                  </div>
                </td>
                <td style={styles.td}>
                  <button
                    style={styles.editButton}
                    onClick={() => openEditModal(project)}
                  >
                    Edit
                  </button>
                  <button
                    style={deleteConfirm === project.key ? styles.confirmButton : styles.dangerButton}
                    onClick={() => handleDelete(project.key)}
                  >
                    {deleteConfirm === project.key ? 'Confirm Delete' : 'Delete'}
                  </button>
                  {deleteConfirm === project.key && (
                    <button
                      style={{ ...styles.cancelButton, marginLeft: '0.5rem' }}
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0 }}>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  autoFocus
                />
                {formErrors.name && <div style={styles.errorText}>{formErrors.name}</div>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Database Configuration (JSON)</label>
                <textarea
                  style={styles.textarea}
                  value={formData.db_config}
                  onChange={(e) => setFormData(prev => ({ ...prev, db_config: e.target.value }))}
                  placeholder='{"uri": "neo4j://localhost:7687", "index": "your-index"}'
                />
                {formErrors.db_config && <div style={styles.errorText}>{formErrors.db_config}</div>}
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingProject ? 'Update Project' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div style={styles.toastContainer}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              ...styles.toast,
              ...(toast.type === 'success' ? styles.successToast : styles.errorToast)
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProjectManagementPage; 