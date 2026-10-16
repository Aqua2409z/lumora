import { Client } from '@stomp/stompjs';
/** Returns an inactive client. Authentication/subscription are implemented by future features. */
export function createWsClient(brokerURL: string) { return new Client({ brokerURL, reconnectDelay: 5000 }); }
