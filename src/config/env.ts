// Environment configuration
// This file reads environment variables and provides them to the application

const getEnvVar = (key: string, defaultValue: string): string => {
  // In Vite, environment variables are accessed via import.meta.env
  // and must be prefixed with VITE_ to be exposed to the client
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// Helper function to convert WebSocket URL to HTTP URL
const wsToHttp = (wsUrl: string): string => {
  return wsUrl.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
};

export const config = {
  // WebSocket/Backend URL
  wsUrl: getEnvVar('VITE_WS_URL', 'ws://localhost:3001'),
  
  // HTTP API URL (derived from WebSocket URL or can be set separately)
  apiUrl: getEnvVar('VITE_API_URL', '') || wsToHttp(getEnvVar('VITE_WS_URL', 'ws://localhost:3001')),
} as const;

// Type-safe access to config
export type Config = typeof config;
