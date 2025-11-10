import React from "react";

const CircleButton = ({ label, onClick,  }) => {
  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "translateY(8px)";
    e.currentTarget.style.boxShadow = "0 4px 0 #C9A800";
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 12px 0 #C9A800";
  };

  const handleFocus = (e) => e.currentTarget.blur();

  // If only icon, make padding tighter and square
  const hasLabel = Boolean(label);
  const basePadding = hasLabel ? "0.75em 1em" : "0.6em";

  return (
    <button
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      style={{
        backgroundColor: "#F9C015",
        color: "#ffffffff",        
        borderRadius: "100%",
        height:"250px",
        width:"250px",
        padding: basePadding,
        fontSize: "3rem",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 12px 0 #F0A901",
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
       
        userSelect: "none",        
      }}
    >
     
      {hasLabel && <span>{label}</span>}
    </button>
  );
};

export default CircleButton;
