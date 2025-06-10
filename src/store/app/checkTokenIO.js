import { io } from "socket.io-client";

const token = localStorage.getItem("accessToken");
const socket = io("http://localhost:8080", {
  auth: { token }, // Gửi token ngay khi kết nối
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("🔗 Đã kết nối với Socket.IO, ID:", socket.id);
  
  // Xác thực JWT ngay sau khi kết nối
  socket.emit("authenticate", { token }, (response) => {
    if (response.success) {
      console.log("✅ Xác thực JWT thành công");
    } else {
      console.error("❌ Xác thực JWT thất bại:", response.message);
    }
  });
});
