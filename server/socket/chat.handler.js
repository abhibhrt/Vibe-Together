// server side code
export const chatHandler = (io, socket) => {

    // Join Room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Chat Message
    socket.on("sendMessageServer", ({ roomId, message }) => {
        // Broadcast message to everyone in the room (including sender, who handles it client-side)
        io.to(roomId).emit("serverMessage", message);
    });

    // -----------------------------------
    // VIDEO CALL SIGNALING
    // -----------------------------------

    // 1. Call Request (Sent by Caller)
    socket.on("callRequest", ({ roomId, callerId }) => {
        console.log(`Call request from ${callerId} in room ${roomId}`);
        // Notify the *other* person in the room (the callee)
        socket.to(roomId).emit("incomingCall", { callerId });
    });

    // 2. Call Accepted (Sent by Callee)
    socket.on("callAccepted", ({ roomId }) => {
        console.log(`Call accepted in room ${roomId}`);
        // Notify the *other* person (the original caller) to start WebRTC setup
        socket.to(roomId).emit("callAccepted");
    });

    // 3. Call Rejected (Sent by Callee)
    socket.on("callRejected", ({ roomId }) => {
        console.log(`Call rejected in room ${roomId}`);
        // Notify the *other* person (the original caller)
        socket.to(roomId).emit("callRejected");
    });

    // 4. WebRTC Offer (Sent by Caller after acceptance)
    socket.on("webrtcOffer", ({ roomId, offer }) => {
        // Pass Offer to the *other* person (the callee)
        socket.to(roomId).emit("webrtcOffer", offer);
    });

    // 5. WebRTC Answer (Sent by Callee)
    socket.on("webrtcAnswer", ({ roomId, answer }) => {
        // Pass Answer back to the *other* person (the original caller)
        socket.to(roomId).emit("webrtcAnswer", answer);
    });

    // 6. ICE Candidate (Sent by both Caller and Callee)
    socket.on("iceCandidate", ({ roomId, candidate }) => {
        // Pass ICE candidate to the *other* person
        socket.to(roomId).emit("iceCandidate", candidate);
    });

    // 7. End Call (Sent by the user who hangs up)
    socket.on("endCall", ({ roomId }) => {
        console.log(`Call ended in room ${roomId}`);
        // Notify the *other* person to end the call
        socket.to(roomId).emit("callEnded");
    });

    // Handle disconnect to clean up
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Optionally, you might want to emit a "userLeft" event here 
        // if this disconnect happens during a call, but 'endCall' handles it better.
    });
};