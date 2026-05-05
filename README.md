# EduPortal Installation Guide

## Requirements
- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables (create a `.env.local` file):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
