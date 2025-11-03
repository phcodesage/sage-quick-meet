# Meetra - WebRTC Video Calling App

A simple, secure 1-on-1 video calling application built with React, TypeScript, and WebRTC.

## Features

- 🎥 Peer-to-peer video calling
- 🎤 Audio-only mode support
- 📺 Screen sharing
- 💬 Real-time chat messaging
- 🔄 Device switching (camera, microphone, speakers)
- 🎨 Beautiful animated UI
- 🔒 Secure WebRTC connections

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A WebRTC signaling server (backend)

## Environment Configuration

This application uses environment variables for configuration. You can easily change the backend/WebSocket URL without modifying the code.

### Setup Environment Variables

1. Copy the `.env.example` file to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and update the values:
   ```env
   # Backend/WebSocket URL Configuration
   VITE_WS_URL=ws://localhost:3001
   
   # HTTP API URL (optional - auto-derived from VITE_WS_URL if not set)
   # VITE_API_URL=http://localhost:3001
   
   # For production, use your production backend URL:
   # VITE_WS_URL=wss://your-backend-domain.com
   # VITE_API_URL=https://your-backend-domain.com
   ```

### Available Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WS_URL` | WebSocket URL for the signaling server | `ws://localhost:3001` |
| `VITE_API_URL` | HTTP API URL for REST endpoints (optional, auto-derived from `VITE_WS_URL`) | Auto-derived from `VITE_WS_URL` |

> **Note:** In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

### Production Deployment

When deploying to production:

1. Update `VITE_WS_URL` to your production backend URL (use `wss://` for secure WebSocket)
2. Ensure your backend server is running and accessible
3. Build the application with the production environment variables

Example production `.env`:
```env
VITE_WS_URL=wss://api.yourdomain.com
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables (see above)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Make sure your WebRTC signaling server is running on the configured URL

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # React components
├── config/         # Configuration files (environment variables)
├── hooks/          # Custom React hooks (WebRTC logic)
├── pages/          # Page components (Home, Room)
├── utils/          # Utility functions
└── App.tsx         # Main application component
```

## How It Works

1. User creates or joins a meeting room
2. WebRTC peer connection is established through the signaling server
3. Media streams (audio/video) are exchanged directly between peers
4. Chat messages are sent through the data channel
5. Screen sharing replaces the video track when enabled

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **WebRTC** - Real-time communication
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (with limitations)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.