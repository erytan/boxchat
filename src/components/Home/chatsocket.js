import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { apiRefreshAccessToken } from '../../apis/user';
import '../../socket';

// Quản lý Socket.IO ở cấp module
const socketUrl = process.env.REACT_APP_API_URII || 'http://localhost:8080';
let socketInstance = null;

const initSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 20000,
    });
  }
  return socketInstance;
};

const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

const ChatSocket = ({ onNewMessage, onLoadMessages, onError, onRefreshToken, onUserStatus }) => {
  const { isLoggedIn, current } = useSelector((state) => state.user);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastError = useRef(null);
  const refreshAttempts = useRef(0);
  const userStatuses = useRef(new Map()); // Lưu trạng thái của các user (id_user -> online/offline)

  const handleError = (error) => {
    if (lastError.current !== error.message) {
      lastError.current = error.message;
      onError?.(error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!isLoggedIn || !current || !token) {
      handleError({ message: 'Vui lòng đăng nhập để sử dụng chat' });
      return;
    }

    socketRef.current = initSocket(token);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('authenticate', { token }, (response) => {
        if (response?.success) {
          setIsConnected(true);
          socketRef.current.off('authenticate');
        } else {
          handleError({ message: response?.message || 'Xác thực JWT thất bại' });
        }
      });
    });

    socketRef.current.on('reconnect', (attempt) => {
      setIsConnected(true);
    });

    socketRef.current.on('connect_error', async (error) => {
      handleError({ message: `Không thể kết nối đến server chat: ${error.message}` });
      if (error.message.includes('Token không hợp lệ') && refreshAttempts.current < 3) {
        try {
          const response = await apiRefreshAccessToken();
          if (response.data.success) {
            const newToken = response.data.newAccessToken;
            localStorage.setItem('accessToken', newToken);
            onRefreshToken?.(newToken);
            socketRef.current.auth.token = newToken;
            socketRef.current.connect();
            refreshAttempts.current += 1;
          } else {
            handleError({ message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
          }
        } catch (refreshError) {
          handleError({ message: 'Không thể làm mới token. Vui lòng đăng nhập lại.' });
        }
      }
    });

    socketRef.current.on('error', ({ message }) => {
      handleError({ message });
    });

    socketRef.current.on('loadMessages', (messages) => {
      if (Array.isArray(messages)) {
        onLoadMessages?.(messages);
      } else {
        handleError({ message: 'Dữ liệu tin nhắn không hợp lệ' });
      }
    });

    socketRef.current.on('receiveMessage', (message) => {
      if (message && typeof message === 'object') {
        onNewMessage?.(message);
      } else {
        handleError({ message: 'Tin nhắn nhận được không hợp lệ' });
      }
    });

    // Lắng nghe trạng thái online/offline từ server
    socketRef.current.on('userConnected', (data) => {
      if (data.id_user) {
        userStatuses.current.set(data.id_user, 'online');
        onUserStatus?.(data.id_user, 'online');
      }
    });

    socketRef.current.on('userDisconnected', (data) => {
      if (data.id_user) {
        userStatuses.current.set(data.id_user, 'offline');
        onUserStatus?.(data.id_user, 'offline');
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('reconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.off('loadMessages');
        socketRef.current.off('receiveMessage');
        socketRef.current.off('userConnected');
        socketRef.current.off('userDisconnected');
        disconnectSocket();
      }
      setIsConnected(false);
      refreshAttempts.current = 0;
      userStatuses.current.clear();
    };
  }, [isLoggedIn, current]);

  const sendMessage = (text, room = 'public', callback) => {
    if (!socketRef.current || !isConnected || !text.trim()) {
      handleError({ message: 'Không thể gửi tin nhắn' });
      return;
    }
    socketRef.current.emit('sendMessage', { text, room }, (response) => {
      if (response?.success) {
        callback?.(response);
      } else {
        handleError({ message: response?.message || 'Gửi tin nhắn thất bại' });
      }
    });
  };

  const joinRoom = (room) => {
    if (!socketRef.current || !isConnected || !room.trim()) {
      handleError({ message: 'Không thể tham gia phòng' });
      return;
    }
    const token = localStorage.getItem('accessToken');
    socketRef.current.emit('joinRoom', room, (response) => {
      if (!response?.success) {
        handleError({ message: response?.message || 'Tham gia phòng thất bại' });
      }
    });
  };

  // Trả về trạng thái của user (nếu có)
  const getUserStatus = (userId) => {
    return userStatuses.current.get(userId) || 'offline';
  };

  return { sendMessage, joinRoom, isConnected, getUserStatus };
};

export default ChatSocket;