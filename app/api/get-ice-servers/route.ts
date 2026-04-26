import { NextResponse } from 'next/server';

const TURN_KEY_ID = process.env.TURN_KEY_ID;
const TURN_API_TOKEN = process.env.TURN_API_TOKEN;

const defaultIceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

export async function GET() {
  if (!TURN_KEY_ID || !TURN_API_TOKEN) {
    return NextResponse.json({ iceServers: defaultIceServers });
  }

  const url = `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_KEY_ID}/credentials/generate`;
  const headers = {
    Authorization: `Bearer ${TURN_API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ttl: 86400 })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const turnCredentials = await response.json();
    let iceServers: Array<Record<string, unknown>> = [];

    if (turnCredentials.ice_servers) {
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

    iceServers = [...iceServers, ...defaultIceServers];
    return NextResponse.json({ iceServers });
  } catch (error) {
    console.error('Error generating TURN credentials:', error);
    return NextResponse.json({ iceServers: defaultIceServers });
  }
}
