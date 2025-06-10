import React, { useState } from "react";
import "./css/inputBoxChat.css"; // Giữ nguyên CSS

const InputBoxChat = ({
  value,
  setValue,
  nameKey,
  type = "text",
  placeholder,
  onKeyDown,
  id,
}) => {
  const [focused, setFocused] = useState(false);

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

  return (
    <div className={`form-floating ${focused ? "focus" : ""}`}>
      <input
        id={id}
        type={type}
        className="form-control"
        placeholder={placeholder}
        value={value?.[nameKey] || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
      />
    </div>
  );
};

export default InputBoxChat;