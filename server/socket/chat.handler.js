export const chatHandler = (io, socket) => {

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    socket.on('disconnect', () => {});
};
