export const chatHandler = (io, socket) => {

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    // Message handling
    socket.on("sendMessageServer", ({ roomId, message }) => {
        io.to(roomId).emit("serverMessage", message);
    });

    // Call signaling
    socket.on('callUser', ({ roomId, signalData, from, name, type }) => {
        socket.to(roomId).emit('incomingCall', { 
            signal: signalData, 
            from, 
            name,
            type,
            roomId 
        });
    });

    socket.on('acceptCall', ({ signal, to, roomId }) => {
        socket.to(roomId).emit('callAccepted', { 
            signal, 
            from: to, 
            roomId 
        });
    });

    socket.on('endCall', ({ roomId, userId }) => {
        io.to(roomId).emit('callEnded', { userId });
    });

    socket.on('rejectCall', ({ roomId, from }) => {
        socket.to(roomId).emit('callRejected', { from });
    });

    socket.on('callerICE', ({ roomId, candidate, to }) => {
        socket.to(roomId).emit('callerICE', { candidate, from: to });
    });

    socket.on('calleeICE', ({ roomId, candidate, to }) => {
        socket.to(roomId).emit('calleeICE', { candidate, from: to });
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected`);
    });
};