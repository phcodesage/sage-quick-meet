// Environment configuration
// This file reads environment variables and provides them to the application

const getEnvVar = (key: string): string => {
  if (typeof process !== 'undefined' && process.env[key] !== undefined) {
    return process.env[key] as string;
  }
  throw new Error(`Environment variable ${key} is required`);
};

export const config = {
  wsUrl: getEnvVar('NEXT_PUBLIC_WS_URL'),
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
} as const;

export const getApiUrl = (): string => {
  if (config.apiUrl) return config.apiUrl;
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export type Config = typeof config;
