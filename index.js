const { Server } = require('socket.io');

const io = new Server(8000, {
    cors: {
        origin: "*", // This allows requests from any origin
        methods: ["GET", "POST"]
    }
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {

console.log("Socket Connected:", socket.id);

socket.on("room:join", (data) => {
        
    console.log("Joining Room:", data);
        const { email, room } = data;
        
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        socket.join(room);

        io.to(room).emit("user:joined",{email,id:socket.id});
        io.to(socket.id).emit("room:join",data);
});

socket.on("user:call",({to,offer})=>{

io.to(to).emit("incomming:call",{from:socket.id,email:socketIdToEmailMap.get(socket.id),offer});

});





    
    // Handle user disconnecting
    socket.on("disconnect", () => {
        const email = socketIdToEmailMap.get(socket.id);
        console.log(`Socket Disconnected: ${socket.id} (${email})`);

        // Clean up maps
        emailToSocketIdMap.delete(email);
        socketIdToEmailMap.delete(socket.id);
    });
});
