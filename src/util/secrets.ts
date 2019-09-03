import logger from './logger';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env.dev')) {
  logger.debug('Using .env.dev file to supply config environment variables');
  dotenv.config({ path: '.env.dev' });
} else if (fs.existsSync('.env')) {
  logger.debug('Using .env file to supply config environment variables');
  dotenv.config({ path: '.env' });
} else {
  logger.debug(
    'Using .env.example file to supply config environment variables',
  );
  dotenv.config({ path: '.env.example' }); // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'

function getOrThrow(key: string): string {
  const res = process.env[key];
  if (!res) throw new Error(`${key} not set`);
  return res;
}

export const TWITTER_API_KEY = getOrThrow('TWITTER_API_KEY');
export const TWITTER_API_SECRET_KEY = getOrThrow('TWITTER_API_SECRET_KEY');
export const TWITTER_ACCESS_TOKEN = getOrThrow('TWITTER_ACCESS_TOKEN');
export const TWITTER_ACCESS_TOKEN_SECRET = getOrThrow(
  'TWITTER_ACCESS_TOKEN_SECRET',
);

export const ENCRYPTION_KEY = getOrThrow('ENCRYPTION_KEY'); // Must be 256 bits (32 characters)
export const COOKIE_SECRET = getOrThrow('COOKIE_SECRET');
