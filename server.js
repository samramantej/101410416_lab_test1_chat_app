require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const GroupMessage = require("./models/GroupMessage");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static("public"));

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected..."))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("joinRoom", ({ room }) => {
        if (!room) return console.log("❌ Missing room name in joinRoom event.");
        console.log(`✅ User ${socket.id} joined room: ${room}`);
        socket.join(room);
        io.to(room).emit("receiveMessage", { from_user: "System", message: `${socket.id} joined ${room}.` });
    });

    socket.on("sendMessage", async ({ from_user, room, message }) => {
        if (!from_user || !room || !message) {
            return console.log("❌ Missing data in sendMessage event.");
        }

        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();

        console.log(`📩 Message saved in DB: "${message}" from ${from_user} in room: ${room}`);

        io.to(room).emit("receiveMessage", { from_user, message });
    });

    socket.on("typing", ({ from_user, room }) => {
        socket.to(room).emit("displayTyping", { from_user, message: "is typing..." });
    });

    socket.on("leaveRoom", ({ room }) => {
        console.log(`🚪 User ${socket.id} left room: ${room}`);
        socket.leave(room);
        io.to(room).emit("receiveMessage", { from_user: "System", message: `${socket.id} left ${room}.` });
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

app.get("/", (req, res) => {
    res.send("✅ Chat Server is running...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
