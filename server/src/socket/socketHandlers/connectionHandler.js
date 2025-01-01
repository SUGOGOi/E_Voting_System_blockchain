/**
 * Connection event handlers
 */
export const handleConnection = (socket) => {
  console.log("Client connected:", socket.id);
  return socket;
};

export const handleDisconnect = (socket) => {
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
};
