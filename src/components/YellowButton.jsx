// src/components/YellowButton.jsx
import React from "react";

const YellowButton = ({
  label,
  onClick,
  icon = null,
  iconPosition = "left", // "left" | "right"
  style = {},
}) => {
  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = "translateY(4px)";
    e.currentTarget.style.boxShadow = "0 2px 0 #C9A800";
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 6px 0 #C9A800";
  };

  const handleFocus = (e) => e.currentTarget.blur();

  const hasLabel = label !== null && label !== undefined;
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
        width: "fit-content",
        height: "fit-content",
        userSelect: "none",
        // allow overrides
        ...style,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: hasLabel && icon ? "0.5em" : 0,
          lineHeight: 1,
        }}
      >
        {icon && iconPosition === "left" && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
        )}

        {hasLabel && <span>{label}</span>}

        {icon && iconPosition === "right" && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
        )}
      </span>
    </button>
  );
};

export default YellowButton;
