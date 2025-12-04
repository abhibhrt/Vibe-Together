export const chatHandler = (io, socket) => {

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
    });

    socket.on("sendMessageServer", ({ roomId, message }) => {
        io.to(roomId).emit("serverMessage", message);
    });

    // VIDEO CALL FIXED SIGNALING

    socket.on("callRequest", ({ roomId, callerId }) => {
        socket.to(roomId).emit("incomingCall", { callerId });
    });

    socket.on("callAccepted", ({ roomId }) => {
        socket.to(roomId).emit("callAccepted");
    });

    socket.on("callRejected", ({ roomId }) => {
        socket.to(roomId).emit("callRejected");
    });

    socket.on("webrtcOffer", ({ roomId, offer }) => {
        socket.to(roomId).emit("webrtcOffer", offer);
    });

    socket.on("webrtcAnswer", ({ roomId, answer }) => {
        socket.to(roomId).emit("webrtcAnswer", answer);
    });

    socket.on("iceCandidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("iceCandidate", candidate);
    });

    socket.on("endCall", ({ roomId }) => {
        socket.to(roomId).emit("callEnded");
    });
};
