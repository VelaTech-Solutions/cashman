// src/components/Button.js
// Button.js
import React from "react";

const Button = ({ onClick, text, className, disabled = false }) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 rounded ${className} ${
      disabled ? "cursor-not-allowed opacity-50" : ""
    }`}
    disabled={disabled}
  >
    {text}
  </button>
);

export default Button;
