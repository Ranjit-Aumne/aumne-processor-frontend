import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import UploadForm from '../components/UploadForm';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { upload_id: '123' } }),
    get: vi.fn().mockResolvedValue({
      data: [
        { key: 'project1', name: 'Project 1' },
        { key: 'project2', name: 'Project 2' }
      ]
    })
  }
}));

afterEach(() => cleanup());

describe('UploadForm', () => {
  it('renders file input, project dropdown, and button', async () => {
    render(<UploadForm />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    });
  });

  it('loads and displays projects', async () => {
    render(<UploadForm />);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });

  it('shows error when trying to submit without file and project', async () => {
    render(<UploadForm />);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
    
    // Button should be disabled when no file or project selected
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it('shows error when only file is selected but no project', async () => {
    render(<UploadForm />);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
    
    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Button should still be disabled when no project selected
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).toBeDisabled();
  });

  it('sends project_key in FormData on submit', async () => {
    render(<UploadForm />);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // Select project and file
    const projectSelect = screen.getByLabelText(/project/i);
    fireEvent.change(projectSelect, { target: { value: 'project1' } });

    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['test'], 'test.zip', { type: 'application/zip' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Now button should be enabled
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    expect(uploadButton).not.toBeDisabled();

    // Submit form
    fireEvent.click(uploadButton);

    await waitFor(() => {
      const axiosPostMock = vi.mocked(axios.post);
      const lastCall = axiosPostMock.mock.calls[0];
      const formData = lastCall[1] as FormData;
      expect(formData.get('project_key')).toBe('project1');
    });
  });
});