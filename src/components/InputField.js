import React, { useState } from "react";
import "./css/InputField.css"; // Import CSS file for styling

const InputField = ({
  value,
  setValue,
  nameKey,
  type,
  placeholder,
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
    if (value[nameKey] === "") {
      setFocused(false);
    }
  };

  return (
    <div className={`form-floating${focused ? "focus" : ""}`}>
      <input
        type={type}
        className="form-control"
        placeholder={placeholder}
        value={value[nameKey]}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
};

export default InputField;
