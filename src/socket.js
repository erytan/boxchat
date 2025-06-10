import { io } from "socket.io-client";

const token = localStorage.getItem("accessToken");
const socket = io("http://localhost:8080", {
  auth: { token }, // Gửi token ngay khi kết nối
  transports: ["websocket", "polling"],
});

