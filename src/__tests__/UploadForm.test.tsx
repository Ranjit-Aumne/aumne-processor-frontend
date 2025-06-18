import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UploadForm from '../components/UploadForm';

// Mock axios
vi.mock('axios', () => ({ default: { post: vi.fn().mockResolvedValue({ data: { upload_id: '123' } }) } }));

afterEach(() => cleanup());

describe('UploadForm', () => {
  it('renders file input and button', () => {
    render(<UploadForm />);
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
  });

  it('shows error when submitting without file', () => {
    render(<UploadForm />);
    fireEvent.click(screen.getAllByRole('button', { name: /upload/i })[0]);
    expect(screen.getByRole('alert')).toHaveTextContent(/please select a file/i);
  });
}); 