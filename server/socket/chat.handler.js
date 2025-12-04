export const chatHandler = (io, socket) => {

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    // --- Message Handling ---
    // THIS IS NOW THE ONLY EMIT SOURCE for messages
    socket.on("sendMessageServer", ({ roomId, message }) => {
        io.to(roomId).emit("serverMessage", message);
    });

    // --- WebRTC Signaling Handlers (NEW) ---

    // 1. Sending an Offer to the other user in the room
    socket.on("webrtc-offer", ({ roomId, offer }) => {
        // Broadcast the offer to the other user in the room (excluding the sender)
        socket.to(roomId).emit("webrtc-offer", offer);
    });

    // 2. Sending an Answer back to the user who sent the Offer
    socket.on("webrtc-answer", ({ roomId, answer }) => {
        // Broadcast the answer to the other user in the room (excluding the sender)
        socket.to(roomId).emit("webrtc-answer", answer);
    });

    // 3. Sending ICE Candidates (network info) to the other user
    socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
        // Broadcast the candidate to the other user in the room (excluding the sender)
        socket.to(roomId).emit("webrtc-ice-candidate", candidate);
    });
    
    // 4. Handle call end
    socket.on("webrtc-call-end", ({ roomId }) => {
        // Notify the other user the call has ended
        socket.to(roomId).emit("webrtc-call-end");
    });


    socket.on('disconnect', () => {});
};