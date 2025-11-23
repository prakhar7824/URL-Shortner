# URL Shortener

A bit.ly-style URL shortener web application built with Node.js, Express.js, and Supabase.

## Features

- Create short links with optional custom codes
- Redirect users with click tracking
- View detailed statistics for each link
- Delete links
- Search and filter links
- Clean, responsive UI

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vanilla HTML/CSS/JavaScript

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   SUPABASE_URL=https://qwhhzyvrwpxyviybrtku.supabase.co
   SUPABASE_KEY=your_supabase_anon_key_here
   PORT=3000
   ```

4. Set up the database by running the SQL schema in `database/schema.sql` in your Supabase SQL editor.

5. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/links` - Create a new short link
- `GET /api/links` - Get all links
- `GET /api/links/:code` - Get stats for a specific link
- `DELETE /api/links/:code` - Delete a link
- `GET /healthz` - Health check endpoint
- `GET /:code` - Redirect to target URL
- `GET /code/:code` - View detailed stats page

## Code Format

Short codes must match the regex pattern: `[A-Za-z0-9]{6,8}`

## Deployment

The application can be deployed on any Node.js hosting platform such as:
- Vercel
- Render
- Railway
- Heroku

Make sure to set the environment variables in your hosting platform's configuration.

