import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Project {
  key: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await axios.get('/api/v1/projects', {
        headers: { Authorization: 'Bearer faketoken' }
      });
      setProjects(response.data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectKey: string) => {
    navigate(`/project/${projectKey}/data-processing`);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        fontSize: '1.1rem'
      }}>
        Loading projects...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 0.5rem 0',
            color: '#2c3e50'
          }}>
            Projects
          </h1>
          <p style={{ 
            margin: 0,
            color: '#6c757d'
          }}>
            Manage and access your data processing projects
          </p>
        </div>
        
        <Link
          to="/new-project"
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>➕</span>
          New Project
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '2rem',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>
            📁
          </div>
          <h2 style={{
            margin: '0 0 1rem 0',
            color: '#6c757d'
          }}>
            No projects yet
          </h2>
          <p style={{
            color: '#6c757d',
            marginBottom: '2rem'
          }}>
            Create your first project to start processing data
          </p>
          <Link
            to="/new-project"
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>➕</span>
            Create First Project
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {projects.map((project) => (
            <div
              key={project.key}
              onClick={() => handleProjectClick(project.key)}
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Project Icon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 0.25rem 0',
                    color: '#2c3e50',
                    fontSize: '1.2rem'
                  }}>
                    {project.name}
                  </h3>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
                    {project.key}
                  </div>
                </div>
              </div>

              {/* Project Description */}
              {project.description && (
                <p style={{
                  margin: '0 0 1rem 0',
                  color: '#6c757d',
                  fontSize: '0.9rem',
                  lineHeight: '1.4'
                }}>
                  {project.description}
                </p>
              )}

              {/* Project Metadata */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#6c757d',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f3f4'
              }}>
                <div>
                  <strong>Created:</strong> {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(project.updated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions Hint */}
              <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                color: '#007bff',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Click to open project →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage; 