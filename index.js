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
        
        //Map to Email to SocketId and vice-versa
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        
        //Firstly Send Message to the Person already in the room
        io.to(room).emit("user:joined", { email, id: socket.id });
        //Then Join Room Yourself
        socket.join(room);
        //Then Join Room Reequest to know I have joined the room
        io.to(socket.id).emit("room:join", data);

    });

    socket.on("user:call", ({ to, offer }) => {
        //Calling the other person
        io.to(to).emit("incomming:call", { from: socket.id, email: socketIdToEmailMap.get(socket.id), offer });
    });
    
    socket.on("call:accepted",({to,ans})=>{
        //Accepting the Call
        io.to(to).emit("call:accepted", { from: socket.id, email: socketIdToEmailMap.get(socket.id), ans}); 
    });
      
    socket.on("peer:nego:needed",({to,offer})=>{
    io.to(to).emit("peer:nego:needed",{from:socket.id,offer});
    });

    socket.on("peer:nego:done",({to,ans})=>{
    io.to(to).emit("peer:nego:final",{from:socket.id,ans});
    })

    // Handle user disconnecting
    socket.on("disconnect", () => {
        const email = socketIdToEmailMap.get(socket.id);
        console.log(`Socket Disconnected: ${socket.id} (${email})`);

        // Clean up maps
        emailToSocketIdMap.delete(email);
        socketIdToEmailMap.delete(socket.id);
    });
});
