import { useState } from "react"; 
import { auth } from "../firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth"; 

//Login component for user authentication
const Login = () => {
  //State variables for email, password, and error messages
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //Function to handle form submission and user authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); //Prevents default form reload behavior
    try {
      //Attempt to sign in the user with Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful!"); //Log success message - @TODO: Redirect to dashboard
    } catch (err) {
      setError("Invalid credentials"); // Display error message on failed login
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {/* Display error message if login fails */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {/* Login form */}
      <form onSubmit={handleLogin}>
        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update state when user types
          required
        />

        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update state when user types
          required
        />

        {/* Submit button to trigger login */}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login; //Export Login component for use in other parts of the app

