import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, vi, afterEach, expect } from 'vitest';

// Mock axios BEFORE importing the component to comply with Vitest hoisting rules
vi.mock('axios', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

import axios from 'axios';
const mockGet = (axios as any).get;

import UploadStatusPage from '../pages/UploadStatusPage';

afterEach(() => {
  mockGet.mockReset();
  cleanup();
});

describe('UploadStatusPage', () => {
  it('renders jobs returned from API', async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          upload_id: '1',
          filename: 'job1.zip',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });
    render(<UploadStatusPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    expect(screen.getByText('job1.zip')).toBeInTheDocument();
  });

  it('allows manual refresh', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    render(<UploadStatusPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));

    mockGet.mockResolvedValueOnce({
      data: [
        {
          upload_id: '2',
          filename: 'job2.zip',
          status: 'queued',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
    expect(screen.getByText('job2.zip')).toBeInTheDocument();
  });
}); 