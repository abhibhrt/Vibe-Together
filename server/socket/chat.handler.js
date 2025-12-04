export const chatHandler = (io, socket) => {

    // ---------------------------
    // JOIN CHAT ROOM (already added)
    // ---------------------------
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    // ---------------------------
    // CHAT MESSAGE
    // ---------------------------
    socket.on("sendMessageServer", ({ roomId, message }) => {
        io.to(roomId).emit("serverMessage", message);
    });


    // ============================================================
    //  VIDEO CALL SIGNALING EVENTS
    // ============================================================

    // 1. USER A CALLS USER B
    socket.on("callRequest", ({ roomId, callerId }) => {
        io.to(roomId).emit("incomingCall", {
            callerId,
            roomId
        });
    });

    // 2. USER B ACCEPTS CALL
    socket.on("callAccepted", ({ roomId }) => {
        io.to(roomId).emit("callAccepted");
    });

    // 3. USER B REJECTS CALL
    socket.on("callRejected", ({ roomId }) => {
        io.to(roomId).emit("callRejected");
    });

    // 4. SEND WEBRTC OFFER
    socket.on("webrtcOffer", ({ roomId, offer }) => {
        io.to(roomId).emit("webrtcOffer", offer);
    });

    // 5. SEND WEBRTC ANSWER
    socket.on("webrtcAnswer", ({ roomId, answer }) => {
        io.to(roomId).emit("webrtcAnswer", answer);
    });

    // 6. SEND ICE CANDIDATES
    socket.on("iceCandidate", ({ roomId, candidate }) => {
        io.to(roomId).emit("iceCandidate", candidate);
    });

    // 7. END CALL
    socket.on("endCall", ({ roomId }) => {
        io.to(roomId).emit("callEnded");
    });


    // ---------------------------
    // DISCONNECT
    // ---------------------------
    socket.on('disconnect', () => {});
};
