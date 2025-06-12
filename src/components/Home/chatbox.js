import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import InputBoxChat from '../inputBoxChat';
import ChatSocket from './chatsocket';
import '../css/chatRoom.css';
import { useNavigate } from 'react-router-dom';
import { apiGetMesagges } from '../../apis/message';

const ChatRoom = () => {
  const { current, isLoggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValues, setInputValues] = useState({ message: '' });
  const [room, setRoom] = useState('public');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState({});
  const messagesEndRef = useRef(null);
  const [otherId, setOtherId] = useState(null); // Lưu id_user của other

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { sendMessage, joinRoom, isConnected, getUserStatus } = ChatSocket({
    onNewMessage: (message) => {
      if (message.sender_id && message.message && message.createdAt) {
        setMessages((prev) => [...prev, message]);
        console.log("Message from:", message.sender_id.id_user, "Current user:", current.id_user, "Tab hidden:", document.hidden);
        if (message.sender_id.id_user !== current.id_user && document.hidden) {
          showNotification(message);
        }
      } else {
        setError("Tin nhắn không hợp lệ");
      }
    },
    onLoadMessages: (messages) =>
      Array.isArray(messages)
        ? setMessages(messages) &&
        setOtherId(
          messages.find((m) => m.sender_id.id_user !== current.id_user)
            ?.sender_id.id_user
        )
        : setError("Dữ liệu tin nhắn không hợp lệ"),
    onError: (error) => setError(error.message),
    onRefreshToken: (newAccessToken) => {
      localStorage.setItem("accessToken", newAccessToken);
    },
    onUserStatus: (userId, status) => {
      if (userId === otherId) {
        console.log(`Other (${userId}) is ${status}`);
      }
    },
  });

  const handleDoubleClick = (index) => {
    setShowTimestamp((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => { }, [isLoading]);

  const handleSendMessage = () => {
    if (!inputValues.message.trim()) {
      setError('Tin nhắn không được để trống');
      return;
    }
    setIsLoading(true);
    sendMessage(inputValues.message, room, (response) => {
      setIsLoading(false);
      if (response.success) {
        setInputValues((prev) => ({ ...prev, message: '' }));
      } else {
        setError(response.message || 'Gửi tin nhắn thất bại');
      }
    });
  };
  //hàm thông báo khi tin nhắn từ phía other
  const showNotification = (message) => {
  if ("Notification" in window) {
    console.log("Permission status:", Notification.permission);
    if (Notification.permission === "granted") {
      new Notification("Tin nhắn mới", {
        body: `${message.sender_id.firstname} ${message.sender_id.lastname}: ${message.message}`,
        icon: message.sender_id.avatarUrl || "/default-avatar.png",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("Request permission result:", permission);
        if (permission === "granted") {
          new Notification("Tin nhắn mới", {
            body: `${message.sender_id.firstname} ${message.sender_id.lastname}: ${message.message}`,
            icon: message.sender_id.avatarUrl || "/default-avatar.png",
          });
        }
      });
    } else {
      console.log("Notification permission permanently denied");
    }
  } else {
    console.log("Browser does not support notifications");
  }
};

  useEffect(() => {
    if (isConnected) {
      joinRoom("public");
    }
  }, [isConnected]);

  const fetchMessages = async () => {
    try {
      const response = await apiGetMesagges({ roomName: "public", page: 1, limit: 20 });
      if (response.messages) {
        setMessages(response.messages);
        setOtherId(response.messages.find((m) => m.sender_id.id_user !== current.id_user)?.sender_id.id_user);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMessages();
    }
  }, [isLoggedIn]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isLoggedIn || !current) {
    return (
      <div className="chat-room-container">
        <div className="chat-room">
          <h2>Phòng Chat</h2>
          <div className="error-message">Vui lòng đăng nhập để sử dụng chat.</div>
          <button onClick={() => navigate('/login')} className="login-button">
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Lấy tin nhắn gần đây nhất từ other
  const latestOtherMessage = messages
    .filter((msg) => msg.sender_id.id_user !== current.id_user)
    .reduce((latest, current) => {
      return !latest || new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
    }, null);

  const otherAvatar = latestOtherMessage?.sender_id.avatarUrl || "/default-avatar.png";
  const otherName = latestOtherMessage
    ? `${latestOtherMessage.sender_id.firstname} ${latestOtherMessage.sender_id.lastname}`
    : "Bạn của bạn";
  const isOnline = otherId ? getUserStatus(otherId) === 'online' : false;

  return (
    <div className="chat-room-container">
      <div className="chat-room">
        {/* Hiển thị avatar và tên của other ở đầu khu vực chat với trạng thái online */}
        <div className="chat-partner-info">
          <img
            src={otherAvatar}
            alt={`${otherName}'s avatar`}
            className="partner-avatar"
            width="40"
            height="40"
          />
          <span className="partner-name">{otherName}</span>
          {isOnline && <span className="online-dot" />}
        </div>
        <h2>Phòng Chat</h2>
        <div className="messages-container-background">
          <div className="messages-container">
            {messages.length > 0 ? (
              messages.map((msg, index) => {
                const isSelf = msg.sender_id.id_user === current.id_user;
                const isLast = index === messages.length - 1;

                let shouldBeRed = false;
                const isFirst = index === 0;
                const isSameTypeAsPrevious = index > 0 && (isSelf
                  ? messages[index - 1].sender_id.id_user === current.id_user
                  : messages[index - 1].sender_id.id_user !== current.id_user);
                const isSameTypeAsNext = !isLast && (isSelf
                  ? messages[index + 1].sender_id.id_user === current.id_user
                  : messages[index + 1].sender_id.id_user !== current.id_user);
                const isSolo = (isFirst || !isSameTypeAsPrevious) && (!isSameTypeAsNext || isLast);
                const isLastInSequence = isSameTypeAsPrevious && (!isSameTypeAsNext || isLast);

                shouldBeRed = isSolo || isLastInSequence;



                return msg.sender_id && msg.sender_id.id_user ? (
                  <div
                    key={index}
                    className={`message ${isSelf ? 'self' : 'other'} ${shouldBeRed ? 'background-red' : ''}`}
                  >

                    <span className="text" onDoubleClick={() => handleDoubleClick(index)}>
                      {msg.message}
                    </span>
                    <span className={`timestamp ${showTimestamp[index] ? 'visible' : ''}`}>
                      {new Date(msg.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).replace(/:\d{2}$/, '')}
                    </span>
                  </div>
                ) : (
                  <p key={index} className="error-message">Lỗi: Tin nhắn không có sender_id</p>
                );
              })
            ) : (
              <p>Không có tin nhắn nào.</p>
            )}
            <div ref={messagesEndRef} />
            <div className="input-container">
              <InputBoxChat
                id="message-input"
                value={inputValues}
                setValue={setInputValues}
                nameKey="message"
                placeholder=""
                onKeyDown={handleKeyDown}
                disabled={!isConnected || !current}
                className="message-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!isConnected || !current}
                className="send-button"
              >
                {isLoading ? (
                  <div className="svg-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 61 61" fill="none">
                      <g clip-path="url(#clip0_112_35)">
                        <path d="M0.5 26.0751L2.95074 27.8514L16.8848 37.9529V53.5231L29.0025 46.7389L39.8446 54.598L60.5 6.40191L0.5 26.0751ZM7.21789 27.1252L52.3926 12.3137L18.8526 35.5617L7.21789 27.1252ZM19.9768 48.2491V40.1936L26.2456 44.7389L19.9768 48.2491ZM38.5266 49.8249L20.7472 36.9359L53.9012 13.9541L38.5266 49.8249Z" fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_112_35">
                          <rect width="60" height="60" fill="white" transform="translate(0.5 0.5)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                ) : (
                  <div className="svg-container">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 61 61" fill="none">
                      <g clip-path="url(#clip0_112_35)">
                        <path d="M0.5 26.0751L2.95074 27.8514L16.8848 37.9529V53.5231L29.0025 46.7389L39.8446 54.598L60.5 6.40191L0.5 26.0751ZM7.21789 27.1252L52.3926 12.3137L18.8526 35.5617L7.21789 27.1252ZM19.9768 48.2491V40.1936L26.2456 44.7389L19.9768 48.2491ZM38.5266 49.8249L20.7472 36.9359L53.9012 13.9541L38.5266 49.8249Z" fill="black" />
                      </g>
                      <defs>
                        <clipPath id="clip0_112_35">
                          <rect width="60" height="60" fill="white" transform="translate(0.5 0.5)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;