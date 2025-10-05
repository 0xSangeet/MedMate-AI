import React from "react";
import "./Popup.css";

export default function Popup({ isOpen, onClose, children }) {
  if (!isOpen) return null; 

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>
  );
}
