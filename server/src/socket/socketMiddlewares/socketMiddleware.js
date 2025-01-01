/**
 * Setup event listeners for a connected client
 * @param {Socket} socket - Socket instance
 */
export const setupClientEventListeners = (socket, handlers) => {
  handlers.forEach((handler) => handler(socket));
};
