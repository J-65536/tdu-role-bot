import { D1Database } from '@cloudflare/workers-types';

export interface StickyMessage {
  channel_id: string;
  current_message_id: string;
  title: string;
  content: string;
}

export type Bindings = {
  DB: D1Database;
  DISCORD_APPLICATION_ID: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_TOKEN: string;
};