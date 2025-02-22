import { useState } from "react";
import { auth } from "../firebase"; // Firebase authentication
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Log In & Sign Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle form submission for Login or Sign-Up
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); // Reset error state

    try {
      if (isSignUp) {
        // Sign Up logic
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Log In logic
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/"); // Redirect to Home page after success
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl font-bold">{isSignUp ? "Sign Up" : "Log In"}</h2>
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mt-4">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="border p-2" 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="border p-2" 
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p className="mt-4">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button className="text-blue-500 underline" onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
