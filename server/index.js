import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Enable JSON parsing for Express routes
app.use(express.json());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const rooms = new Map();

// Cloudflare TURN server endpoint
app.get('/get-ice-servers', async (req, res) => {
  const TURN_KEY_ID = process.env.TURN_KEY_ID;
  const TURN_API_TOKEN = process.env.TURN_API_TOKEN;

  if (!TURN_KEY_ID || !TURN_API_TOKEN) {
    console.warn('TURN credentials not configured, using STUN only');
    return res.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });
  }

  const url = `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate`;
  const headers = {
    "Authorization": `Bearer ${TURN_API_TOKEN}`,
    "Content-Type": "application/json"
  };
  const data = { "ttl": 86400 };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const turnCredentials = await response.json();
    
    // Convert 'ice_servers' to 'iceServers' and ensure it's an array
    let iceServers = [];
    
    if (turnCredentials.ice_servers) {
      // If ice_servers is an object, convert it to array format
      if (typeof turnCredentials.ice_servers === 'object' && !Array.isArray(turnCredentials.ice_servers)) {
        iceServers = [{
          urls: turnCredentials.ice_servers.urls,
          username: turnCredentials.ice_servers.username,
          credential: turnCredentials.ice_servers.credential
        }];
      } else if (Array.isArray(turnCredentials.ice_servers)) {
        iceServers = turnCredentials.ice_servers;
      }
    }
    
    // Add multiple STUN servers for better connectivity
    iceServers.push(
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    );

    res.json({ iceServers });
  } catch (error) {
    console.error('Error generating TURN credentials:', error);
    // Fallback to STUN servers
    res.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    });
  }
});

wss.on('connection', (ws) => {
  let currentRoom = null;
  let clientId = null;
  let isEndingCall = false;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📡 Server received message:', data.type, 'from client:', clientId);

      switch (data.type) {
        case 'join':
          handleJoin(ws, data);
          break;
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          handleSignaling(data);
          break;
        case 'leave':
          handleLeave();
          break;
        case 'end-call':
          console.log('📞 Received end-call message from client:', clientId);
          handleEndCall();
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`📞 WebSocket closed for client ${clientId}, isEndingCall: ${isEndingCall}`);
    if (!isEndingCall) {
      handleLeave();
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  function handleJoin(ws, data) {
    const { roomId, userName } = data;
    currentRoom = roomId;
    clientId = data.clientId;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const room = rooms.get(roomId);

    if (room.size >= 2) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Room is full. Only 2 participants allowed.'
      }));
      return;
    }

    room.set(clientId, { ws, userName });

    ws.send(JSON.stringify({
      type: 'joined',
      roomId,
      clientId,
      participants: room.size
    }));

    if (room.size === 2) {
      const otherClient = Array.from(room.entries()).find(([id]) => id !== clientId);
      if (otherClient) {
        const [otherId, otherData] = otherClient;

        ws.send(JSON.stringify({
          type: 'ready',
          peerId: otherId,
          peerName: otherData.userName
        }));

        otherData.ws.send(JSON.stringify({
          type: 'peer-joined',
          peerId: clientId,
          peerName: userName
        }));
      }
    }
  }

  function handleSignaling(data) {
    if (!currentRoom || !clientId) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    const targetId = data.target;
    const targetClient = room.get(targetId);

    if (targetClient) {
      targetClient.ws.send(JSON.stringify({
        ...data,
        from: clientId
      }));
    }
  }

  function handleEndCall() {
    if (!currentRoom || !clientId) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    console.log(`📞 Room creator ${clientId} ending call in room ${currentRoom}`);
    console.log(`📞 Notifying ${room.size - 1} other participants`);

    // Get creator name before cleanup
    const creatorName = room.get(clientId)?.userName || 'Room creator';

    // Notify all other participants that the call was ended by the creator
    room.forEach((client, id) => {
      if (id !== clientId) {
        console.log(`📞 Sending call-ended-by-creator to ${id}`);
        try {
          client.ws.send(JSON.stringify({
            type: 'call-ended-by-creator',
            creatorName: creatorName
          }));
        } catch (error) {
          console.error(`Failed to send end-call message to ${id}:`, error);
        }
      }
    });

    // Mark this connection as ended to prevent handleLeave from running
    isEndingCall = true;

    // Clean up the entire room
    rooms.delete(currentRoom);
    console.log(`📞 Room ${currentRoom} deleted`);
    currentRoom = null;
    clientId = null;
  }

  function handleLeave() {
    if (!currentRoom || !clientId || isEndingCall) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    // Remove client from room
    room.delete(clientId);

    // Notify other participants
    room.forEach((client) => {
      client.ws.send(JSON.stringify({
        type: 'peer-left',
        peerId: clientId
      }));
    });

    // Clean up empty room
    if (room.size === 0) {
      rooms.delete(currentRoom);
    }

    currentRoom = null;
    clientId = null;
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
