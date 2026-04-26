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
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```

   **For Production:**
   ```bash
   NEXT_PUBLIC_WS_URL=wss://sage-quick-meet.onrender.com
   ```

### Deploying to Vercel

When deploying to Vercel, you have two options:

#### Option 1: Set Environment Variables in Your Hosting Dashboard
1. Go to your hosting project settings
2. Navigate to "Environment Variables"
3. Add `NEXT_PUBLIC_WS_URL` with value `wss://sage-quick-meet.onrender.com`
4. Deploy your project

#### Option 2: Use `.env` file (Not Recommended for Production)
- Simply ensure your `.env` file has the production URL before deploying
- Note: `.env` files are typically gitignored, so this won't work with Git-based deployments

### Important Notes

- **WebSocket Protocol:** Use `ws://` for local HTTP and `wss://` for production HTTPS
- **CORS:** Ensure your backend at `https://sage-quick-meet.onrender.com` allows requests from your Vercel domain
- **Environment Variables:** Next.js requires the `NEXT_PUBLIC_` prefix for client-side environment variables

### Testing

After configuration, test your connection:
1. Start your frontend: `npm run dev`
2. Open the browser console
3. Check for WebSocket connection logs
4. Verify successful connection to your backend

### Switching Backends

To switch between different backend URLs (e.g., staging, production):
1. Update the `NEXT_PUBLIC_WS_URL` in your `.env` file
2. Restart your development server
3. For deployments, update the environment variable in your hosting dashboard and redeploy

### Deployment Notes

This project is now a Next.js application, so you no longer need an `index.html` SPA rewrite.

For Vercel and other Next.js hosts, the default build and routing behavior is sufficient. Just deploy the app normally after configuring `NEXT_PUBLIC_WS_URL`.

**What to do:**
- Set `NEXT_PUBLIC_WS_URL` in your hosting environment
- Run `npm run build` and deploy the resulting Next.js app

**Note:**
- Direct route access and refreshes are handled by Next.js automatically
- No `vercel.json` rewrite is required for standard Next.js deployments
