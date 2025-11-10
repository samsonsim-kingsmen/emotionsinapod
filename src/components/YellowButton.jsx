import React from "react";

const YellowButton = ({ label, onClick, icon = null, style = {} }) => {
  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "translateY(4px)";
    e.currentTarget.style.boxShadow = "0 2px 0 #C9A800";
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 6px 0 #C9A800";
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
        borderRadius: "12px",
        padding: basePadding,
        fontSize: "1.5rem",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 6px 0 #F0A901",
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: hasLabel ? "0.5em" : "0",
        width: "fit-content",
        height: "fit-content",
        userSelect: "none",        
      }}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      {hasLabel && <span>{label}</span>}
    </button>
  );
};

export default YellowButton;
