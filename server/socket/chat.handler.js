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
            type, // 'video' or 'voice'
            roomId 
        });
    });

    socket.on('acceptCall', ({ signal, to, roomId }) => {
        socket.to(roomId).emit('callAccepted', signal);
    });

    socket.on('endCall', ({ roomId, userId }) => {
        socket.to(roomId).emit('callEnded', { userId });
    });

    socket.on('rejectCall', ({ roomId }) => {
        socket.to(roomId).emit('callRejected');
    });

    socket.on('callerICE', ({ roomId, candidate }) => {
        socket.to(roomId).emit('callerICE', candidate);
    });

    socket.on('calleeICE', ({ roomId, candidate }) => {
        socket.to(roomId).emit('calleeICE', candidate);
    });

    socket.on('disconnect', () => {});
};