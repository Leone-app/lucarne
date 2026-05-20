import { WebSocket } from 'ws';
import type { WSMessage } from './types';

export const clients = new Set<WebSocket>();

export function broadcast(msg: WSMessage): void {
  const data = JSON.stringify(msg);
  clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(data);
  });
}
