import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProjectManagementPage from '../pages/ProjectManagementPage';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Project Management UI - BDD Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario: Display existing projects', () => {
    test('Given I am authenticated and on the /projects management page, When the page finishes loading, Then I see a table with projects', async () => {
      // Given: Mock API response with test data
      const mockProjects = [
        {
          key: 'projA',
          name: 'Project A',
          db_config: { uri: 'neo4j://...', index: 'A' }
        },
        {
          key: 'projB',
          name: 'Project B',
          db_config: { uri: 'neo4j://...', index: 'B' }
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockProjects });

      // When: Render the page
      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      // Then: Wait for loading to finish and verify table content
      await waitFor(() => {
        expect(screen.getByText('Project Management')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
      });

      // Verify table headers
      expect(screen.getByText('Key')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('DB Config')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();

      // Verify project data in table
      expect(screen.getByText('projA')).toBeInTheDocument();
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('projB')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();

      // Verify config data is displayed
      expect(screen.getByText(/"uri": "neo4j:\/\/\.\.\."/)).toBeInTheDocument();
      expect(screen.getByText(/"index": "A"/)).toBeInTheDocument();
      expect(screen.getByText(/"index": "B"/)).toBeInTheDocument();
    });
  });

  describe('Scenario: Create a new project', () => {
    test('Given I am on the /projects page, When I click "New Project" and submit form, Then UI sends POST and shows success toast', async () => {
      // Given: Mock empty projects list and successful creation
      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedAxios.post.mockResolvedValue({ 
        data: { key: 'newproj', name: 'New KB', db_config: { uri: 'neo4j://test', index: 'new' } }
      });

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
      });

      // When: Click "Create First Project" button (since projects list is empty)
      const newProjectButton = screen.getByTestId('create-first-project-button');
      fireEvent.click(newProjectButton);

      // Verify modal opens
      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument();
      });

      // Fill in form
      const nameInput = screen.getByPlaceholderText('Enter project name');
      const configTextarea = screen.getByPlaceholderText('{"uri": "neo4j://localhost:7687", "index": "your-index"}');

      fireEvent.change(nameInput, { target: { value: 'New KB' } });
      fireEvent.change(configTextarea, { 
        target: { value: '{"uri": "neo4j://test", "index": "new"}' } 
      });

      // Submit form
      fireEvent.click(screen.getByText('Create Project'));

      // Then: Verify API call
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/v1/projects',
          {
            name: 'New KB',
            db_config: { uri: 'neo4j://test', index: 'new' }
          },
          { headers: { Authorization: 'Bearer faketoken' } }
        );
      });

      // Verify success toast
      await waitFor(() => {
        expect(screen.getByText('Project created')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Update an existing project', () => {
    test('Given a project exists, When I click Edit and submit changes, Then UI sends PUT and shows success toast', async () => {
      // Given: Mock project data
      const mockProjects = [
        {
          key: 'projX',
          name: 'Project X',
          db_config: { uri: 'neo4j://old', index: 'old' }
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockProjects });
      mockedAxios.put.mockResolvedValue({ 
        data: { key: 'projX', name: 'Project X', db_config: { uri: 'neo4j://new', index: 'new' } }
      });

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Project X')).toBeInTheDocument();
      });

      // When: Find the table row containing 'Project X' and click its Edit button
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      const projectRow = rows.find(row => within(row).queryByText('Project X'));
      expect(projectRow).toBeTruthy();
      
      const editButton = within(projectRow!).getByText('Edit');
      fireEvent.click(editButton);

      // Verify edit modal opens with existing data
      await waitFor(() => {
        expect(screen.getByText('Edit Project')).toBeInTheDocument();
      });

      const nameInput = screen.getByDisplayValue('Project X');
      expect(nameInput).toBeInTheDocument();

      // Change db_config
      const configTextarea = screen.getByDisplayValue(/"uri": "neo4j:\/\/old"/);
      fireEvent.change(configTextarea, { 
        target: { value: '{"uri": "neo4j://new", "index": "new"}' } 
      });

      // Submit form
      fireEvent.click(screen.getByText('Update Project'));

      // Then: Verify API call
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          '/api/v1/projects/projX',
          {
            name: 'Project X',
            db_config: { uri: 'neo4j://new', index: 'new' }
          },
          { headers: { Authorization: 'Bearer faketoken' } }
        );
      });

      // Verify success toast
      await waitFor(() => {
        expect(screen.getByText('Project updated')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Delete a project', () => {
    test('Given a project exists, When I click Delete and confirm, Then UI sends DELETE and shows success toast', async () => {
      // Given: Mock project data
      const mockProjects = [
        {
          key: 'projY',
          name: 'Project Y',
          db_config: { uri: 'neo4j://test', index: 'test' }
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockProjects });
      mockedAxios.delete.mockResolvedValue({});

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Project Y')).toBeInTheDocument();
      });

      // When: Find the table row containing 'Project Y' and click its Delete button
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      const projectRow = rows.find(row => within(row).queryByText('Project Y'));
      expect(projectRow).toBeTruthy();
      
      const deleteButton = within(projectRow!).getByText('Delete');
      fireEvent.click(deleteButton);

      // Verify confirmation state
      await waitFor(() => {
        const confirmButton = within(projectRow!).getByText('Confirm Delete');
        expect(confirmButton).toBeInTheDocument();
      });

      // Click confirm
      const confirmButton = within(projectRow!).getByText('Confirm Delete');
      fireEvent.click(confirmButton);

      // Then: Verify API call
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          '/api/v1/projects/projY',
          { headers: { Authorization: 'Bearer faketoken' } }
        );
      });

      // Verify success toast
      await waitFor(() => {
        expect(screen.getByText('Project deleted')).toBeInTheDocument();
      });
    });
  });

  describe('Scenario: Handle API error on load', () => {
    test('Given the GET /projects API returns a 500 error, When I load the page, Then I see error toast and table is not rendered', async () => {
      // Given: Mock API error
      mockedAxios.get.mockRejectedValue(new Error('Server Error'));

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      // Then: Wait for error handling
      await waitFor(() => {
        expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
      });

      // Verify table is not rendered
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByText('Key')).not.toBeInTheDocument();
    });
  });

  describe('Additional UI behavior tests', () => {
    test('Modal closes when clicking cancel button', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
      });

      // Open modal (empty state shows "Create First Project" button)
      const newProjectButton = screen.getByTestId('create-first-project-button');
      fireEvent.click(newProjectButton);
      await waitFor(() => {
        expect(screen.getByText('Create New Project')).toBeInTheDocument();
      });

      // Click Cancel
      fireEvent.click(screen.getByText('Cancel'));
      
      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
      });
    });

    test('Form validation shows errors for invalid input', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Loading projects...')).not.toBeInTheDocument();
      });

      // Open modal (empty state shows "Create First Project" button)
      const newProjectButton = screen.getByTestId('create-first-project-button');
      fireEvent.click(newProjectButton);

      // Submit with empty name
      fireEvent.click(screen.getByText('Create Project'));

      await waitFor(() => {
        expect(screen.getByText('Project name is required')).toBeInTheDocument();
      });

      // Fill name but leave invalid JSON
      const nameInput = screen.getByPlaceholderText('Enter project name');
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      
      const configTextarea = screen.getByPlaceholderText('{"uri": "neo4j://localhost:7687", "index": "your-index"}');
      fireEvent.change(configTextarea, { target: { value: 'invalid json' } });

      fireEvent.click(screen.getByText('Create Project'));

      await waitFor(() => {
        expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
      });
    });

    test('Delete operation can be cancelled', async () => {
      const mockProjects = [
        {
          key: 'projZ',
          name: 'Project Z',
          db_config: { uri: 'neo4j://test', index: 'test' }
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockProjects });

      render(
        <TestWrapper>
          <ProjectManagementPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Project Z')).toBeInTheDocument();
      });

      // Click Delete
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      const projectRow = rows.find(row => within(row).queryByText('Project Z'));
      expect(projectRow).toBeTruthy();
      
      const deleteButton = within(projectRow!).getByText('Delete');
      fireEvent.click(deleteButton);

      // Verify confirmation state
      await waitFor(() => {
        const confirmButton = within(projectRow!).getByText('Confirm Delete');
        expect(confirmButton).toBeInTheDocument();
      });

      // Click Cancel
      const cancelButton = within(projectRow!).getByText('Cancel');
      fireEvent.click(cancelButton);

      // Verify back to normal state
      await waitFor(() => {
        const deleteButtonAgain = within(projectRow!).getByText('Delete');
        expect(deleteButtonAgain).toBeInTheDocument();
        expect(within(projectRow!).queryByText('Confirm Delete')).not.toBeInTheDocument();
      });
    });
  });
}); 