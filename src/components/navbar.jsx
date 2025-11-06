import React from "react";

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
      }}
    >
      <button style={{ borderRadius: "20px" }}>English</button>
      <p>Your happy moment will be on the wall</p>
      <button style={{ borderRadius: "20px" }}>X</button>
    </div>
  );
}

export default NavBar;
