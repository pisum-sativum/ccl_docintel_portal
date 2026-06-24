# CCL Document Intelligence Portal (Frontend)

This repository contains the frontend web application for the Central Coalfields Limited (CCL) Document Intelligence Portal. The application provides an interface for employees to securely upload documents, run compliance checks, and query a knowledge base using natural language.

## Architecture

The frontend is built using Next.js (App Router) and React. It serves as the presentation layer and communicates with a separate Python FastAPI backend.

- Framework: Next.js 15
- Styling: Tailwind CSS
- State Management: React Context API
- Font: Inter Tight

## Features

- Document Library: Browse, view, and manage uploaded documents with a text-preview fallback for proprietary formats.
- AI Chat Interface: Natural language interface for querying document contents using Retrieval-Augmented Generation (RAG).
- Upload Widget: Drag-and-drop interface supporting PDF, DOCX, TXT, and image files for processing.
- Risk Dashboard: Real-time tracking of operational risks and compliance flags across indexed documents.
- Authentication: Secure login flow integrated with backend JWT verification.

## Development Setup

1. Install Node.js (v18 or higher recommended).
2. Clone this repository and navigate to the project root.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and configure the backend API path:
   ```env
   BACKEND_API_URL=http://127.0.0.1:8000
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open http://localhost:3000 in your browser to view the application.

## API Integration

The frontend uses Next.js rewrites to proxy requests starting with `/api/*` to the backend service. This configuration is located in `next.config.ts`. Ensure your backend server is running and accessible at the URL defined in your environment variables.

## Build and Deployment

To create an optimized production build:
```bash
npm run build
```

To start the production server:
```bash
npm run start
```
