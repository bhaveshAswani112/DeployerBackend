"use client"

import { useSession, signIn } from "next-auth/react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (!session || !session.user) {
    return (
      <div>
        <h1>You are not signed in</h1>
        <button onClick={() => signIn("github")}>Sign In with GitHub</button>
      </div>
    );
  }

  return <h1>Welcome, {session.user.name || "User"}!</h1>;
}
