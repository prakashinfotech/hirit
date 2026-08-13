# Hirit Frontend

This is the React client for the **Hirit** job portal. It features a modern, centered layout with interactive dashboard views, advanced job search filters, resume upload portals, and application tracking.

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the frontend directory (use `.env.example` as a template):
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Running the Application
Start the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### Production Build
Build the optimized production package:
```bash
npm run build
```
Verify compilation or preview production locally:
```bash
npm run preview
```
