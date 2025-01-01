import { SOCKET_EVENTS } from "../events.js";

/**
 * Handle custom client events
 * @param {Socket} socket - Socket instance
 */
export const handleClientEvent = (socket) => {
  socket.on(SOCKET_EVENTS.CLIENT_EVENT, (data) => {
    console.log("Received client event:", data);
    // Add additional event handling logic here
  });
};
