const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const GroupMessage = require("../models/GroupMessage");

const router = express.Router();

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room ${room}`);
    });

    socket.on("sendMessage", async ({ from_user, room, message }) => {
        if (!from_user || !room || !message) {
            return;
        }

        const newMessage = new GroupMessage({ from_user, room, message });
        await newMessage.save();

        io.to(room).emit("receiveMessage", { from_user, message });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

module.exports = router;
