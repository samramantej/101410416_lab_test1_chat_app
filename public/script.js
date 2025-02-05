const socket = io("ws://localhost:5000");

const username = localStorage.getItem("username");
const room = localStorage.getItem("room");

document.getElementById("room-name").innerText = `Room: ${room}`;

socket.emit("joinRoom", { room });

socket.on("receiveMessage", (data) => {
    let chatBox = document.getElementById("chat-box");
    let messageDiv = document.createElement("div");

    messageDiv.innerText = `${data.from_user}: ${data.message}`;
    messageDiv.classList.add("message");
    messageDiv.classList.add(data.from_user === username ? "user" : "other");

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("displayTyping", (data) => {
    document.getElementById("typingIndicator").innerText = `${data.from_user} is typing...`;
    setTimeout(() => {
        document.getElementById("typingIndicator").innerText = "";
    }, 2000);
});

document.getElementById("message").addEventListener("input", () => {
    socket.emit("typing", { from_user: username, room });
});

function sendMessage() {
    let message = document.getElementById("message").value;
    if (message.trim() === "") return;

    socket.emit("sendMessage", { from_user: username, room, message });
    document.getElementById("message").value = "";
}

function leaveRoom() {
    socket.emit("leaveRoom", { room });
    localStorage.removeItem("username");
    localStorage.removeItem("room");
    window.location.href = "index.html";
}
