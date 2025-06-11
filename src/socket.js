import { io } from "socket.io-client";

const token = localStorage.getItem("accessToken");
const socket = io("https://boxchat-server.onrender.com/", {
  auth: { token }, // Gửi token ngay khi kết nối
  transports: ["websocket", "polling"],
});

