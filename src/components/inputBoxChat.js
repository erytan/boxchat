import React, { useState, useEffect, useRef } from "react";
import "./css/inputBoxChat.css"; // Giữ nguyên CSS

const InputBoxChat = ({
  value,
  setValue,
  nameKey,
  placeholder,
  onKeyDown,
  id,
}) => {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setValue((prev) => ({
      ...prev,
      [nameKey]: e.target.value,
    }));
  };

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    if (!value?.[nameKey]) {
      setFocused(false);
    }
  };

  // Tự động điều chỉnh chiều cao chỉ khi nội dung xuống dòng
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "24px"; // Đặt lại chiều cao để tính toán

      // Lấy chiều cao mặc định (min-height hoặc 1 dòng)
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24; // Giả định line-height mặc định là 24px
      const minHeight = parseInt(window.getComputedStyle(textarea).minHeight) || lineHeight;
      const currentHeight = textarea.scrollHeight;

      // Chỉ điều chỉnh height nếu nội dung đã xuống dòng (currentHeight > minHeight)
      if (currentHeight > minHeight) {
        textarea.style.height = `${currentHeight}px`; // Điều chỉnh theo nội dung
      } else {
        textarea.style.height = `${minHeight}px`; // Giữ chiều cao mặc định
      }
    }
  }, [value?.[nameKey]]);

  return (
    <div className={`form-floating ${focused ? "focus" : ""}`}>
      <textarea
        ref={textareaRef}
        id={id}
        className="form-control"
        placeholder={placeholder}
        value={value?.[nameKey] || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
      ></textarea>
    </div>
  );
};

export default InputBoxChat;