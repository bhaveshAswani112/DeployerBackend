"use client"

import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
      <h1>Login</h1>
      <button
        onClick={() => signIn("github")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Sign In with GitHub
      </button>
    </div>
  );
}
