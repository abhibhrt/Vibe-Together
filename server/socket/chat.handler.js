export const chatHandler = (io, socket) => {

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    // ⭐ THIS IS NOW THE ONLY EMIT SOURCE
    socket.on("sendMessageServer", ({ roomId, message }) => {
        io.to(roomId).emit("serverMessage", message);
    });

    socket.on('disconnect', () => {});
};
