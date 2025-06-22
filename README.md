# Frontend Application

This is the frontend application for the Aumne Code Processor, built with React and Vite. It provides a user interface for interacting with the backend API, specifically for project management, uploading project files, and monitoring processing status.

## Table of Contents

- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Available Scripts](#available-scripts)
- [Project Management](#project-management)
- [Upload Status Page](#upload-status-page)

## Introduction

This frontend application is a Single Page Application (SPA) developed using React and Vite. Its primary functions include:

- Managing project configurations and database settings
- Uploading `.zip` project files to the `aumne_code_processor` backend  
- Monitoring processing status and job queues

## Project Structure

- `public/`: Static assets.
- `src/`: Contains the main application source code.
  - `src/main.tsx`: The entry point of the React application.
  - `src/App.tsx`: The main application component.
  - `src/router.tsx`: Defines the application's routing.
  - `src/context/`: React Context APIs (e.g., `AuthContext.tsx`).
  - `src/components/`: Reusable React components (e.g., `UploadForm.tsx`).
  - `src/pages/`: Page-level components (e.g., `UploadPage.tsx`).
  - `src/__tests__/`: Unit and integration tests (e.g., `UploadForm.test.tsx`).
  - `src/setupTests.ts`: Vitest setup file for Jest-DOM matchers.
- `index.html`: The main HTML file served by Vite.
- `vite.config.ts`: Vite build configuration.
- `vitest.config.ts`: Vitest testing framework configuration.
- `tsconfig.json`: TypeScript configuration.
- `package.json`: Project dependencies and scripts.

## Getting Started

Follow these instructions to set up and run the frontend application on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Installation

1.  Navigate to the `frontend` directory in your terminal:

    ```bash
    cd frontend
    ```

2.  Install the project dependencies:

    ```bash
    npm install
    ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will typically run on `http://localhost:3001`. Key routes include:

- `http://localhost:3001/` - Redirects to projects dashboard
- `http://localhost:3001/projects` - Projects dashboard  
- `http://localhost:3001/projects/manage` - Project management interface
- `http://localhost:3001/new-project` - Create new project
- `http://localhost:3001/upload` - File upload page
- `http://localhost:3001/uploads` - Upload status monitoring

### Running Tests

To run the unit and integration tests:

```bash
npm test
```

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production to the `dist` folder.
- `npm run lint`: Runs ESLint to check for code style issues.
- `npm preview`: Serves the `dist` folder locally for preview.
- `npm test`: Runs the test suite with Vitest.

## Project Management

The application includes comprehensive project management functionality accessible through multiple routes:

### Routes

- `/projects` - Main projects dashboard showing project cards and quick access
- `/projects/manage` - Advanced project management page with table view and CRUD operations
- `/new-project` - Create new project form

### Project Management Page (`/projects/manage`)

Navigate to `/projects/manage` to access the full project management interface with:

**Features:**
* **Table View**: Projects displayed in a structured table with columns for Key, Name, DB Config, and Actions
* **Create Projects**: Modal form for creating new projects with name and JSON database configuration
* **Edit Projects**: Inline editing of existing project configurations
* **Delete Projects**: Confirmation-based project deletion with double-click protection
* **Real-time Validation**: Form validation for required fields and JSON format
* **Toast Notifications**: Success and error messages for all operations
* **Loading States**: Proper loading indicators and empty state messaging

**API Integration:**
* `GET /api/v1/projects` - Retrieve all projects
* `POST /api/v1/projects` - Create new project
* `PUT /api/v1/projects/{key}` - Update existing project
* `DELETE /api/v1/projects/{key}` - Delete project

**Database Configuration:**
Projects require a JSON configuration object containing:
```json
{
  "uri": "neo4j://localhost:7687",
  "index": "your-index-name"
}
```

**Testing:**
Comprehensive BDD-style tests cover all scenarios:
* Project listing and display
* Create, update, and delete operations
* Error handling and validation
* Toast notifications and user feedback

Tests are located in `src/__tests__/ProjectManagementPage.test.tsx` and `src/__tests__/features/project_management.feature`.

Run tests via `npm test`.

## Upload Status Page

Navigate to `/uploads` to view a table of your uploaded projects and their processing status.

Features:
* Auto-fetch on load and manual **Refresh** button.
* Shows ID, filename, status badge, created / updated timestamps.
* Graceful loading state (spinner text) and error banner.

The page issues a `GET /uploads` request to the backend including the bearer token from the `AuthContext` (for now the stub token `Bearer faketoken`).  The backend responds with the structure documented in the backend README.

Unit-tests live in `src/__tests__/UploadStatusPage.test.tsx` and cover:

1. Rendering of jobs returned from the API
2. Manual refresh triggering a second network call and UI update

Run them via `npm test` (Vitest). 