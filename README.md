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
- [Features Overview](#features-overview)

## Introduction

This frontend application is a Single Page Application (SPA) developed using React and Vite. Its primary functions include:

-   Managing project configurations.
-   Uploading `.zip` project files to the `aumne_code_processor` backend.
-   Monitoring processing status and job queues.

## Project Structure

-   `public/`: Static assets.
-   `src/`: Contains the main application source code.
    -   `src/main.tsx`: The entry point of the React application.
    -   `src/App.tsx`: The main application component.
    -   `src/router.tsx`: Defines the application's routing.
    -   `src/context/`: React Context APIs (e.g., `AuthContext.tsx`).
    -   `src/components/`: Reusable React components (e.g., `UploadForm.tsx`).
    -   `src/pages/`: Page-level components (e.g., `UploadPage.tsx`).
    -   `src/__tests__/`: Unit and integration tests.
    -   `src/setupTests.ts`: Vitest setup file for Jest-DOM matchers.
-   `index.html`: The main HTML file served by Vite.
-   `vite.config.ts`: Vite build configuration.
-   `vitest.config.ts`: Vitest testing framework configuration.
-   `tsconfig.json`: TypeScript configuration.
-   `package.json`: Project dependencies and scripts.

## Getting Started

Follow these instructions to set up and run the frontend application on your local machine.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (Node Package Manager)

### Installation

1.  Navigate to the frontend directory:

    ```bash
    cd aumne-processor-frontend
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

-   `http://localhost:3001/` - Redirects to projects dashboard
-   `http://localhost:3001/projects` - Projects dashboard
-   `http://localhost:3001/projects/manage` - Project management interface
-   `http://localhost:3001/new-project` - Create new project
-   `http://localhost:3001/upload` - File upload page
-   `http://localhost:3001/uploads` - Upload status monitoring

### Running Tests

To run the unit and integration tests:

```bash
npm test
```

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production to the `dist` folder.
-   `npm run lint`: Runs ESLint to check for code style issues.
-   `npm preview`: Serves the `dist` folder locally for preview.
-   `npm test`: Runs the test suite with Vitest.

## Features Overview

### Project Management

Provides a comprehensive interface for managing projects, including:

-   **Table View**: Projects are displayed in a structured table with key details.
-   **CRUD Operations**: Functionality to create, read, update, and delete project configurations.
-   **Real-time Validation**: Forms include validation for required fields and data formats.
-   **Notifications**: Provides user feedback through toast notifications for operations.
-   **Loading States**: Handles various loading and empty states for a smooth user experience.

### Upload Status Monitoring

Allows users to monitor the status of their uploaded projects and processing jobs:

-   **Job Listing**: Displays a table of uploaded projects with their ID, filename, status, and timestamps.
-   **Real-time Updates**: Features auto-fetching on load and a manual refresh option.
-   **Error Handling**: Includes graceful loading states and error banners for network issues.

This page communicates with the backend's `/uploads` endpoint, requiring an `Authorization: Bearer <token>` header (currently uses a stub token `Bearer faketoken`). 