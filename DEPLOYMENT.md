# Deployment Guide

## Environment Configuration

This project uses environment variables to configure the backend/WebSocket URL. This allows you to easily switch between local development and production deployment.

### Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` for your environment:**

   **For Local Development:**
   ```bash
   VITE_WS_URL=ws://localhost:3001
   ```

   **For Production (Vercel):**
   ```bash
   VITE_WS_URL=wss://sage-quick-meet.onrender.com
   ```

### Deploying to Vercel

When deploying to Vercel, you have two options:

#### Option 1: Set Environment Variables in Vercel Dashboard
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `VITE_WS_URL` with value `wss://sage-quick-meet.onrender.com`
4. Deploy your project

#### Option 2: Use `.env` file (Not Recommended for Production)
- Simply ensure your `.env` file has the production URL before deploying
- Note: `.env` files are typically gitignored, so this won't work with Git-based deployments

### Important Notes

- **WebSocket Protocol:** Use `ws://` for local HTTP and `wss://` for production HTTPS
- **CORS:** Ensure your backend at `https://sage-quick-meet.onrender.com` allows requests from your Vercel domain
- **Environment Variables:** Vite requires the `VITE_` prefix for environment variables to be exposed to the client

### Testing

After configuration, test your connection:
1. Start your frontend: `npm run dev`
2. Open the browser console
3. Check for WebSocket connection logs
4. Verify successful connection to your backend

### Switching Backends

To switch between different backend URLs (e.g., staging, production):
1. Update the `VITE_WS_URL` in your `.env` file
2. Restart your development server
3. For Vercel deployments, update the environment variable in the dashboard and redeploy
