import React from "react";
import YellowButton from "./YellowButton";

function NavBar() {
  return (
    <div
      style={{
        position: "absolute",
        top: "5%",
        fontSize: "2rem",
        display: "flex",
        justifyContent: "space-between",
        padding: "0px 50px",
        boxSizing: "border-box",

        width: "100%",
        height: "10%",
        zIndex: "999",
      }}
    >
      <YellowButton
        label="English"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              stroke="white"
              strokeWidth="2.5"
            />
            <path
              d="M2 12h20M12 2c2.5 3 2.5 17 0 20M12 2c-2.5 3-2.5 17 0 20"
              stroke="white"
              strokeWidth="2.5"
            />
          </svg>
        }
      />
 
      <YellowButton
        icon={
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="white" // ✅ white lines
              strokeWidth="3" // ✅ thicker lines
              strokeLinecap="round"
            />
          </svg>
        }
      />
    </div>
  );
}

export default NavBar;
