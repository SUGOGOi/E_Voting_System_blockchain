/**
 * Socket configuration and state management
 */
let io = null;

export const setIO = (socketIO) => {
  io = socketIO;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
