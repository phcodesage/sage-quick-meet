# Quick Setup Guide

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm run dev
```

This single command starts both:
- **Frontend**: http://localhost:5173
- **Signaling Server**: ws://localhost:3001

### 3. Test the Video Call

**Option A: Single Device (for testing)**
1. Open http://localhost:5173
2. Click "Create Meeting"
3. Enter your name (e.g., "Alice")
4. Copy the room link
5. Open a new incognito/private window
6. Paste the room link
7. Enter a different name (e.g., "Bob")
8. Both windows should now be connected in a video call

**Option B: Multiple Devices**
1. Open http://localhost:5173 on device 1
2. Click "Create Meeting" and enter your name
3. Copy the invite link and send it to device 2
4. Open the link on device 2 and enter your name
5. Video call will automatically connect

## Available Scripts

- `npm run dev` - Start both client and server
- `npm run dev:client` - Start only the Vite dev server
- `npm run dev:server` - Start only the signaling server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use

If port 5173 or 3001 is already in use:

**Frontend (Vite)**:
- Vite will automatically try the next available port
- Check the terminal output for the actual port

**Signaling Server**:
- Edit `server/index.js` and change the PORT value
- Update `src/hooks/useWebRTC.ts` to match the new WebSocket URL

### Camera/Microphone Not Working

1. Ensure you're accessing via `localhost` (HTTP is allowed for localhost)
2. Check browser permissions for camera/microphone
3. Close other applications that might be using the camera
4. Try refreshing the page

### WebSocket Connection Failed

1. Verify the signaling server is running (check terminal)
2. Check if port 3001 is accessible
3. Look for any firewall or antivirus blocking WebSocket connections

### Video Call Not Connecting

1. Both participants must have stable internet
2. Check browser console for errors
3. Some corporate/restricted networks may block WebRTC
   - In production, you'll need TURN servers for these cases
4. Ensure both participants are in the same room (check room ID in URL)

## Browser Requirements

Minimum versions:
- Chrome/Edge 80+
- Firefox 75+
- Safari 14+
- iOS Safari 14.3+
- Chrome Android 80+

## Production Deployment

### Frontend
Deploy the `dist` folder (after running `npm run build`) to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

### Signaling Server
Deploy `server/index.js` to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Any Node.js hosting service

**Important**:
- Use HTTPS for the frontend in production
- Use WSS (secure WebSocket) for the signaling server
- Configure TURN servers for better connectivity

See README.md for detailed production considerations.

## Architecture Overview

```
┌─────────────┐                    ┌─────────────┐
│   Client A  │                    │   Client B  │
│             │                    │             │
│  React App  │                    │  React App  │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │         ┌──────────────┐        │
       │         │   Signaling  │        │
       ├────────▶│    Server    │◀───────┤
       │         │  (WebSocket) │        │
       │         └──────────────┘        │
       │                                  │
       │        WebRTC P2P Connection    │
       └─────────────────────────────────┘
              (Direct Audio/Video)
```

1. Both clients connect to the signaling server via WebSocket
2. Signaling server exchanges SDP offers/answers and ICE candidates
3. Once negotiated, clients establish direct peer-to-peer connection
4. Media streams flow directly between clients (not through server)

## File Overview

### Frontend
- `src/App.tsx` - Main component with routing logic
- `src/pages/Home.tsx` - Landing page for creating/joining rooms
- `src/pages/Room.tsx` - Video call interface
- `src/hooks/useWebRTC.ts` - WebRTC connection management
- `src/components/VideoPlayer.tsx` - Video display component
- `src/components/MediaControls.tsx` - Mute/camera/leave controls
- `src/components/Notification.tsx` - Toast notifications
- `src/utils/webrtc.ts` - WebRTC utility functions

### Backend
- `server/index.js` - WebSocket signaling server

## Common Issues

### "Room is full" Error
- The app is designed for 1-on-1 calls only
- Only 2 participants can join a room
- Create a new room for additional calls

### No Audio/Video Stream
- Check if tracks are enabled in MediaControls
- Verify browser has permission to access devices
- Some browsers block media access on HTTP (use HTTPS or localhost)

### Connection Drops
- Check network stability
- May need TURN servers for restrictive networks
- Try creating a new room if issues persist
