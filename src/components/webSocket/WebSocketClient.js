import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
const subscriptions = {};

export const connectWebSocket = (roomCode) => {
    if (stompClient && stompClient.connected) return;

    const socket = new SockJS('https://loot-production.up.railway.app/ws');

    stompClient = new Client({
        webSocketFactory: () => socket,
        debug: str => console.log('[WebSocket]', str),
        onConnect: () => {
            console.log("✅ WebSocket Connected");

            Object.entries(subscriptions).forEach(([topic, callback]) => {
                stompClient.subscribe(topic, (msg) => {
                    try {
                        const data = JSON.parse(msg.body);
                        callback(data);
                    } catch (e) {
                        console.error("❌ JSON parse failed", e);
                    }
                });
            });
        }
    });

    stompClient.activate();
};

export const subscribeToTopic = (topic, callback) => {
    subscriptions[topic] = callback;
    if (stompClient && stompClient.connected) {
        stompClient.subscribe(topic, (msg) => {
            try {
                const data = JSON.parse(msg.body);
                callback(data);
            } catch (e) {
                console.error("❌ JSON parse failed", e);
            }
        });
    }
};

export const unsubscribeFromTopic = (topic) => {
    if (subscriptions[topic]) {
        subscriptions[topic](); // Call the unsubscribe function
        delete subscriptions[topic]; // Clean up the subscription entry
    }
};

export const sendMessage = (destination, body) => {
    if (stompClient && stompClient.connected) {
        stompClient.publish({ destination, body: JSON.stringify(body) });
    }
};

export const disconnectWebSocket = () => {
    if (stompClient && stompClient.connected) {
        stompClient.deactivate();
    }
};
