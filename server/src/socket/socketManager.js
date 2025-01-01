import { SOCKET_EVENTS } from "./events.js";

let io = null;

/**
 * Initialize Socket.IO instance
 * @param {Server} socketIO - Socket.IO server instance
 * @returns {Object} - Socket manager functions
 */
export const initialize = (socketIO) => {
  io = socketIO;
  return {
    setupEventHandlers,
    getIO,
  };
};

/**
 * Get the Socket.IO instance
 * @returns {Server} Socket.IO server instance
 * @throws {Error} If Socket.IO is not initialized
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

/**
 * Handle client connection event
 * @param {Socket} socket - Socket instance for connected client
 */
const handleConnection = (socket) => {
  console.log("Client connected:", socket.id);
  setupClientEventListeners(socket);
};

/**
 * Setup event listeners for a connected client
 * @param {Socket} socket - Socket instance for connected client
 */
const setupClientEventListeners = (socket) => {
  handleDisconnect(socket);
  handleClientEvent(socket);
};

/**
 * Handle client disconnect event
 * @param {Socket} socket - Socket instance for connected client
 */
const handleDisconnect = (socket) => {
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log("Client disconnected:", socket.id);
  });
};

/**
 * Handle custom client events
 * @param {Socket} socket - Socket instance for connected client
 */
const handleClientEvent = (socket) => {
  socket.on(SOCKET_EVENTS.CLIENT_EVENT, (data) => {
    console.log("Received client event:", data);
    // You can add additional event handling logic here
  });
};

/**
 * Setup main Socket.IO event handlers
 */
export const setupEventHandlers = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  io.on(SOCKET_EVENTS.CONNECTION, handleConnection);
};

// Export a default object with all socket manager functions
export const socketManager = {
  initialize,
  getIO,
  setupEventHandlers,
};
